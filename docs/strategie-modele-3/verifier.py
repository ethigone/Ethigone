"""Contrôles documentaires J1, sans réseau ni dépendance externe."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]
OUTPUT = ROOT / 'preuves/j1-verification.json'

def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))

def walk(value):
    if isinstance(value, dict):
        yield value
        for v in value.values():
            yield from walk(v)
    elif isinstance(value, list):
        for v in value:
            yield from walk(v)

def verify():
    niches = read_json(ROOT / 'data/niches.json')
    sprint = read_json(ROOT / 'data/sprint.json')
    transverse = read_json(ROOT / 'data/sources-transversales.json')
    source_ids = [s['id'] for s in niches['sources']]
    assert len(source_ids) == len(set(source_ids)), 'Sources en doublon'
    statements = [v for v in walk(niches) if 'source_ids' in v]
    for statement in statements:
        assert statement['status'] in niches['statuses'], 'Statut inconnu'
        assert statement['source_ids'], 'Référence de provenance absente'
        assert set(statement['source_ids']) <= set(source_ids), 'Source inconnue'
        assert statement['basis'] in ('source_attribuee', 'analyse_ethigone'), 'Origine inconnue'
    entries = niches['niches']
    assert len(entries) == 6
    assert len({n['id'] for n in entries}) == len(entries)
    selected = [n['id'] for n in entries if n['selected_for_j2']]
    assert 0 < len(selected) <= 3
    assert selected == niches['selected_niche_ids']
    for n in entries:
        assert n['net_margin'] is None, 'Marge sectorielle non justifiée'
        assert n['finance_need_verified'] is False, 'Besoin non vérifié présenté comme établi'
        assert n['conclusion']['status'] == 'PROPOSITION'
        for field in ('operation_unit', 'minimum_evidence', 'accept_if', 'refuse_if', 'invalidation_test'):
            assert n[field], f'Critère manquant : {field}'
    all_sources = niches['sources'] + transverse['sources']
    for source in all_sources:
        if source.get('url'):
            assert source['url'].startswith('https://'), 'URL de source non HTTPS'
        else:
            assert source['id'] == 'CTX-M3'
            assert (ROOT / 'data' / source['local_reference']).is_file()
    assert sprint['decision_modele']['modele'] == 3
    assert sprint['niche_adoptee'] is None
    assert sprint['date_limite'] == '2026-11-17'
    assert sprint['extension_automatique'] is False
    assert [s['lot'] for s in sprint['stages']] == [f'J{i}' for i in range(1, 8)]
    assert [s['date_nominale'] for s in sprint['stages']] == [f'2026-11-{i}' for i in range(11, 18)]
    assert all(s['etat'] == 'a_faire' for s in sprint['stages'][1:])

    files = sorted(p for p in ROOT.rglob('*') if p.is_file() and p != OUTPUT)
    files += [REPO / 'README.md', REPO / 'README_PISTES.md']
    links = 0
    for path in files:
        data = path.read_text(encoding='utf-8')
        # Le script contient les motifs du contrôle, sans donnée privée.
        if path != Path(__file__).resolve():
            forbidden = [r'appgprj_', r'appgver_', r'appgdep_', r'\.chatgpt\.site',
                         r'ETHIGONE_ADMIN_BOOTSTRAP_EMAIL', r'gh[pousr]_[A-Za-z0-9]{20,}',
                         r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
                         r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}']
            assert not any(re.search(p, data) for p in forbidden), f'Marqueur privé : {path.name}'
        if path.suffix == '.md':
            for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', data):
                if re.match(r'[a-zA-Z][a-zA-Z0-9+.-]*:', target) or target.startswith('#'):
                    continue
                resolved = (path.parent / target.split('#', 1)[0]).resolve()
                assert resolved.exists() or resolved == OUTPUT, f'Lien local absent : {target}'
                links += 1
    manifest = [{'path': str(p.relative_to(REPO)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                for p in files]
    result = {
        'lot': 'J1', 'checked_at': datetime.now(timezone.utc).isoformat(), 'passed': True,
        'niches': len(entries), 'selected_for_j2': selected,
        'statements_with_provenance': len(statements),
        'public_sources_referenced': len([s for s in all_sources if s.get('url')]),
        'local_markdown_links_checked': links,
        'financial_claims': 'All sector net margins unknown; no financing need verified',
        'private_marker_scan': 'passed for prepared documents',
        'primary_pages_reopened_by_coordinator': [
            'https://www.siebec.com/fr/produits/medias-consommables/',
            'https://www.arden-plast.com/',
            'https://www.economie.gouv.fr/dae/materiels-informatiques-reconditionnes-un-premier-marche-interministeriel',
            'https://messervices.cyber.gouv.fr/guides/recommandations-pour-le-reconditionnement-des-ordinateurs-de-bureau-ou-portables',
            'https://www.sepem-industries.com/e/sepem-angers-2025/partners'
        ],
        'agent_used': 'gpt-6.1-sol', 'astra_used': False,
        'limitations': ['No commercial contact or demand validation', 'No professional legal or Sharia opinion',
                       'No app changes or visual checks', 'GitHub publication verified separately after commit'],
        'manifest': manifest
    }
    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k not in ('manifest','primary_pages_reopened_by_coordinator')}, ensure_ascii=False))

if __name__ == '__main__':
    verify()
