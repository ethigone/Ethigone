"""Contrôles documentaires J2; aucune requête réseau ni validation commerciale.

Exécuter depuis n'importe quel dossier: python chemin/vers/verifier_j2.py
La preuve J1 reste intacte. La publication GitHub se vérifie après commit.
"""
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / 'preuves/j2-verification.json'

def read(name):
    return json.loads((ROOT / name).read_text(encoding='utf-8'))

def walk(obj):
    if isinstance(obj, dict):
        yield obj
        for v in obj.values():
            yield from walk(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from walk(v)

def verify():
    data = read('data/entreprises.json')
    src = read('data/sources-j2.json')
    rep = read('data/reperage.json')
    sprint = read('data/sprint.json')
    niches = read('data/niches.json')
    companies = data['companies']
    ids = {c['id'] for c in companies}
    source_ids = {s['id'] for s in src['sources']}
    assert len(source_ids) == len(src['sources']) == 45
    assert len(ids) == len(companies) == 17
    assert len({c['group_key'] for c in companies}) == 17
    assert data['counting']['initial_entries'] == 18
    assert data['counting']['merged_ids'] == {'E16': 'E17'}
    assert 'E16' not in ids and 'E17' in ids
    assert data['counting']['deduplicated_records'] == len(companies)
    assert Counter(c['niche_id'] for c in companies) == data['counting']['per_niche'] == {'N01': 6, 'N02': 6, 'N03': 5}
    assert {c['niche_id'] for c in companies} == set(niches['selected_niche_ids'])
    assert data['niche_adoptee'] is None
    assert Counter(c['proposal']['role'] for c in companies) == {'operateur_a_qualifier': 13, 'fournisseur_comparatif': 3, 'reserve_perimetre': 1}
    for s in src['sources']:
        assert s['url'].startswith('https://')
        assert s['consulted_at'] == '2026-11-12'
        assert s['publication_date'] is None or s['publication_date'] <= s['consulted_at']
        assert s['access'] in ('page_ouverte', 'index_recherche', 'index_et_page_discordants')
        assert s['observed_paraphrase'] and s['limit']
    assert len({s['url'] for s in src['sources']}) == len(src['sources'])
    for obj in [data, rep]:
        for item in walk(obj):
            if 'source_ids' in item:
                assert item['source_ids'] and set(item['source_ids']) <= source_ids
            if 'status' in item:
                assert item['status'] in data['statuses']
    for c in companies:
        assert c['identity_status'] == 'A_VERIFIER'
        assert c['identity_declared'] and c['countries'] and c['website']
        assert c['finance_need_verified'] is False
        assert c['interest_in_ethigone_verified'] is False
        assert c['order_verified'] is False
        assert c['net_margin'] is None
        p = c['proposal']
        assert p['status'] == 'PROPOSITION'
        assert p['operation']['status'] == p['ethigone_reason']['status'] == 'HYPOTHESE'
        assert p['risks']['status'] == 'RISQUE'
        assert p['missing_evidence']['status'] == p['alternatives']['status'] == 'A_VERIFIER'
        assert p['missing_evidence']['items'] and p['selection_reason'] and p['invalidation_test']
    merged = next(c for c in companies if c['id'] == 'E17')
    assert {'J2-PC09', 'J2-PC10'} <= set(merged['source_ids'])
    assert len(merged['related_entities']) == 2
    assert len(rep['channels']) == 6
    assert all(set(c['company_ids']) <= ids for c in rep['channels'])
    assert all(not c['company_ids'] for c in rep['channels'] if c['type'] == 'ecosysteme_blockchain')
    assert sprint['decision_modele']['modele'] == 3
    assert sprint['niche_adoptee'] is None
    assert sprint['date_limite'] == '2026-11-17' and sprint['extension_automatique'] is False
    assert [s['lot'] for s in sprint['stages']] == [f'J{i}' for i in range(1, 8)]
    assert [s['date_nominale'] for s in sprint['stages']] == [f'2026-11-{i}' for i in range(11, 18)]
    assert [s['etat'] for s in sprint['stages']] == ['termine'] * 2 + ['a_faire'] * 5
    for p in sprint['stages'][1]['preuves']:
        assert (ROOT / p).exists() or (ROOT / p) == OUTPUT

    detail = (ROOT / 'REPERTOIRE_ENTREPRISES.md').read_text()
    assert set(re.findall(r'^## (E\d+) —', detail, re.M)) == ids
    bibliography = (ROOT / 'SOURCES_J2.md').read_text()
    assert set(re.findall(r'^## (J2-[A-Z]+\d+) —', bibliography, re.M)) == source_ids
    summary = (ROOT / 'J2_ENTREPRISES.md').read_text()
    assert set(re.findall(r'^\| (E\d+) ·', summary, re.M)) == ids
    files = sorted(p for p in ROOT.rglob('*') if p.is_file() and p != OUTPUT and '__pycache__' not in p.parts)
    links = 0
    for path in files:
        content = path.read_text(encoding='utf-8')
        if path.suffix != '.py':
            patterns = [r'appgprj_', r'appgver_', r'appgdep_', r'\.chatgpt\.site',
                        r'Automation_[A-Za-z0-9]+', r'gh[pousr]_[A-Za-z0-9]{20,}',
                        r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
                        r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}', r'/workspace/']
            assert not any(re.search(p, content) for p in patterns), f'Marqueur privé: {path.name}'
        if path.suffix == '.md':
            for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', content):
                if re.match(r'[a-zA-Z][a-zA-Z0-9+.-]*:', target) or target.startswith('#'):
                    continue
                destination = (path.parent / target.split('#', 1)[0]).resolve()
                assert destination.is_file() or destination == OUTPUT, f'Lien absent: {target}'
                links += 1
    manifest = []
    for path in files:
        b = path.read_bytes()
        manifest.append({'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(b).hexdigest(),
                         'git_blob_sha1': hashlib.sha1(b'blob ' + str(len(b)).encode() + b'\0' + b).hexdigest()})
    proof = {'lot': 'J2', 'checked_at': datetime.now(timezone.utc).isoformat(), 'passed': True,
             'initial_entries': 18, 'deduplicated_records': len(companies), 'per_niche': data['counting']['per_niche'],
             'roles': dict(Counter(c['proposal']['role'] for c in companies)),
             'sources': len(src['sources']), 'source_access': dict(Counter(s['access'] for s in src['sources'])),
             'local_markdown_links_checked': links, 'private_marker_scan': 'passed for documents; control-script patterns excluded',
             'commercial_validation': 'No verified financing need, interest, order or margin; false means unverified',
             'agent_used': 'gpt-6.1-sol', 'astra_used': False,
             'coordinator_corrections': ['ATF: Ecubel merged with ITJustGood', 'Kiatoo B2B page confirmed', 'CGE hosting identifier not attributed to operator', 'FISA filtration not FISA ultrasounds'],
             'publication': 'Remote head and blob hashes must be checked after commit; this report is a pre-publication content check.',
             'limitations': ['No commercial contact or investment', 'No financial/legal/Sharia audit', 'No visual test or application change', 'Known-group deduplication only; no full ownership audit'],
             'manifest': manifest}
    OUTPUT.write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in proof.items() if k != 'manifest'}, ensure_ascii=False))

if __name__ == '__main__':
    verify()
