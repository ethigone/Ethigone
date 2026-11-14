"""Contrôle documentaire J3, hors ligne. Ne remplace aucun audit professionnel.

Lancer ce fichier avec Python. Les preuves J1/J2 restent historiques et intactes.
La preuve produite contrôle les fichiers; la publication distante est contrôlée
séparément après le commit, sans inclure de journaux internes dans le dépôt.
"""
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / 'preuves/j3-verification.json'

def read(name):
    return json.loads((ROOT / name).read_text(encoding='utf-8'))

def walk(obj):
    if isinstance(obj, dict):
        yield obj
        for value in obj.values():
            yield from walk(value)
    elif isinstance(obj, list):
        for value in obj:
            yield from walk(value)

def verify():
    data = read('data/investisseurs.json')
    sources = read('data/sources-j3.json')['sources']
    routes = read('data/voies-investisseurs.json')
    sprint = read('data/sprint.json')
    actors = data['actors']
    ids = {a['id'] for a in actors}
    source_ids = {s['id'] for s in sources}
    assert len(ids) == len(actors) == data['count'] == 10
    assert ids == {f'A{i:02}' for i in range(1, 11)}
    assert len(source_ids) == len(sources) == 38
    assert len({s['url'] for s in sources}) == len(sources)
    assert data['as_of'] == routes['as_of'] == '2026-11-14'
    assert data['niche_adoptee'] is None
    used_sources = set()
    status_counts = Counter()
    for obj in [data, routes]:
        for item in walk(obj):
            if 'source_ids' in item:
                assert item['source_ids'] and set(item['source_ids']) <= source_ids
                used_sources.update(item['source_ids'])
            if 'status' in item:
                assert item['status'] in data['statuses']
                status_counts[item['status']] += 1
    assert used_sources == source_ids
    for source in sources:
        assert source['source_type'] == 'primaire'
        assert source['url'].startswith('https://')
        assert source['first_consulted_at'] == '2026-11-13'
        assert source['consulted_at'] in ('2026-11-13', '2026-11-14')
        assert source['publication_date'] is None or source['publication_date'] <= source['consulted_at']
        assert source['access'] in ('page_ouverte', 'index_seulement', 'page_sans_contenu_utile')
        assert source['observed_paraphrase'] and source['limit']
    assert sum(s['consulted_at'] == '2026-11-14' for s in sources) == 8

    required_fields = {'pays_service','pays_emetteurs','pays_investisseurs','clientele_instrument',
                       'acces_direct_distributeur','processus_emetteur','decisionnaire_financeur',
                       'interlocuteur_fonctionnel','frais_et_ticket','stablecoins','risque_charia'}
    for actor in actors:
        assert actor['website'].startswith('https://')
        assert set(actor['fields']) == required_fields
        assert actor['orientation']['status'] == 'PROPOSITION'
        for field in actor['fields'].values():
            assert field['text'] and field['status'] and field['source_ids']
        assert all(actor[k] is False for k in ['partnership_verified','listing_verified',
                                              'investors_committed_verified','sharia_ethigone_validated'])
        ticket = actor['ticket']
        assert ticket['applicable_ethigone'] is False
        assert ticket['amount'] is None or ticket['amount'] > 0
        assert ticket['scope']
        for fee in actor['fees']:
            assert fee['ethigone_quote'] is False and fee['payer'] and fee['basis'] and fee['tax']
    by_id = {a['id']:a for a in actors}
    assert by_id['A07']['ticket']['amount'] is None
    assert by_id['A09']['ticket']['amount'] is None
    assert by_id['A02']['ticket']['amount'] == 500000 and by_id['A02']['ticket']['status'] == 'A_VERIFIER'
    assert by_id['A08']['ticket']['amount'] == 5000
    assert by_id['A10']['ticket']['amount'] == 10
    assert by_id['A06']['ticket']['amount'] == 100
    assert by_id['A10']['fields']['risque_charia']['status'] == 'REJETE'
    assert by_id['A02']['fields']['risque_charia']['status'] == 'REJETE'
    fees = {f['id']:f for f in by_id['A06']['fees']}
    assert fees['F-LITA-INV']['tax'] == 'TTC'
    assert [t['rate'] for t in fees['F-LITA-INV']['tiers']] == [0.035,0.025,0.015]
    tiers = fees['F-LITA-INV']['tiers']
    assert tiers[0]['max_exclusive'] == tiers[1]['min'] == 15000
    assert tiers[1]['max_exclusive'] == tiers[2]['min'] == 30000
    assert fees['F-LITA-EMET']['rate'] == 0.08 and fees['F-LITA-EMET']['tax'] == 'HT'
    assert (fees['F-LITA-EMET']['fixed_min'],fees['F-LITA-EMET']['fixed_max']) == (2000,3000)
    assert fees['F-LITA-HOLD']['adopted'] is False

    assert routes['active_routes_verified'] == 0
    assert routes['priority_route_ids'] == ['V01','V02']
    assert [r['id'] for r in routes['routes']] == routes['priority_route_ids']
    for route in routes['routes']:
        assert set(route['actor_ids']) <= ids and route['status'] == 'PROPOSITION'
        assert route['listing_verified'] is False and route['professional_validation_complete'] is False
        assert route['fees_for_ethigone'] is None
        assert route['gates'] and route['stop_if'] and route['functional_entry']['url'].startswith('https://')
    assert routes['routes'][0]['actor_ids'] == ['A07']
    assert routes['routes'][1]['actor_ids'] == ['A06']
    assert by_id['A07']['stablecoin_access'] == by_id['A06']['stablecoin_access'] == 'NON_ETABLI'

    assert sprint['decision_modele']['modele'] == 3 and sprint['niche_adoptee'] is None
    assert sprint['date_limite'] == '2026-11-17' and sprint['extension_automatique'] is False
    assert [s['lot'] for s in sprint['stages']] == [f'J{i}' for i in range(1,8)]
    assert [s['date_nominale'] for s in sprint['stages']] == [f'2026-11-{i}' for i in range(11,18)]
    assert [s['etat'] for s in sprint['stages']] == ['termine']*3 + ['a_faire']*4
    assert sprint['stages'][2]['date_nominale'] == '2026-11-13'
    assert sprint['stages'][2]['termine_le'] == '2026-11-14'
    for stage in sprint['stages']:
        for path in stage['preuves']:
            assert (ROOT/path).is_file() or ROOT/path == OUTPUT
    detail = (ROOT/'REPERTOIRE_INVESTISSEURS.md').read_text()
    assert set(re.findall(r'^## (A\d+) —',detail,re.M)) == ids
    bibliography = (ROOT/'SOURCES_J3.md').read_text()
    assert set(re.findall(r'^## (J3-[SP]\d+) —',bibliography,re.M)) == source_ids

    files = sorted(p for p in ROOT.rglob('*') if p.is_file() and p != OUTPUT and '__pycache__' not in p.parts)
    links = 0
    for path in files:
        content = path.read_text(encoding='utf-8')
        if path.suffix != '.py':
            forbidden = [r'appgprj_', r'appgver_', r'appgdep_', r'\.chatgpt\.site',
                         r'Automation_[A-Za-z0-9]+',r'gh[pousr]_[A-Za-z0-9]{20,}',
                         r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
                         r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}',r'/workspace/']
            assert not any(re.search(p,content) for p in forbidden), f'Marqueur privé: {path.name}'
        if path.suffix == '.md':
            for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',content):
                if re.match(r'[A-Za-z][A-Za-z0-9+.-]*:',target) or target.startswith('#'):
                    continue
                destination = (path.parent/target.split('#',1)[0]).resolve()
                assert destination.is_file() or destination == OUTPUT, f'Lien absent: {target}'
                links += 1
    manifest = []
    for path in files:
        b = path.read_bytes()
        manifest.append({'path':str(path.relative_to(ROOT)), 'sha256':hashlib.sha256(b).hexdigest(),
                         'git_blob_sha1':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()})
    proof = {'lot':'J3','date_nominale':'2026-11-13','completed_on':'2026-11-14',
             'checked_at':datetime.now(timezone.utc).isoformat(),'passed':True,
             'actors':len(actors),'priority_routes':2,'active_ethigone_routes_verified':0,
             'sources':len(sources),'source_access':dict(Counter(s['access'] for s in sources)),
             'sources_rechecked_2026_11_14':8,'provenance_status_counts':dict(status_counts),
             'local_markdown_links_checked':links,
             'private_marker_scan':'passed; control-script patterns excluded',
             'agent_research':'gpt-6.1-sol called on 2026-11-13; no relaunch, no subdelegation',
             'astra_used':False,'visual_check':False,'professional_validation':False,
             'limitations':['Admission, partnership and capital not acquired','Native stablecoin path unproved for the two priorities',
                           'Indexed/inaccessible sources explicitly identified','Financial economics belongs to J4, still incomplete',
                           'No real contact, account creation, transaction or application change'],
             'publication':'Pre-publication file checks only. Remote head, content and hashes must be read after commit.',
             'manifest':manifest}
    OUTPUT.write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in proof.items() if k!='manifest'},ensure_ascii=False))

if __name__ == '__main__':
    verify()
