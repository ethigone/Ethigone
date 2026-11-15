"""Contrôle documentaire J4. Les preuves et scripts J1–J3 ne sont pas modifiés."""
import hashlib
import json
import pathlib
import re
import subprocess
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / 'preuves/j4-verification.json'
def read(p): return json.loads((ROOT / p).read_text())
data = read('data/operations-j4.json')
result = read('data/resultats-j4.json')
sources = read('data/sources-j4.json')
sprint = read('data/sprint.json')
assert data['as_of'] == result['as_of'] == '2026-11-15'
assert len(data['operations']) == 3 and len(data['cases']) == 4
assert len(result['cases']) == 12 and len(result['alternatives']) == 18 and len(result['comparators']) == 3
subprocess.run(['node', '--input-type=module', '-e', "import fs from 'node:fs'; import assert from 'node:assert/strict'; import {rows,calculate} from './calculer_j4.mjs'; const d=JSON.parse(fs.readFileSync('data/operations-j4.json')); const f=JSON.parse(fs.readFileSync('data/formules-j4.json')); const r=JSON.parse(fs.readFileSync('data/resultats-j4.json')); assert.deepEqual(f.rows,rows); for(const c of r.cases){const v=calculate(d,c.operation_id,c.case_id); assert.equal(JSON.stringify(c.values),JSON.stringify(Object.fromEntries(rows.map(x=>[x.key,v[x.key]]))));}"], cwd=ROOT, check=True)
assert not any(data[k] for k in ['contract_validated','sharia_validated','distribution_route_validated','price_or_ticket_adopted'])
ids = {s['id'] for s in sources['sources']}
for p in data['parameters'] + data['case_parameters'] + data['cases']:
    assert p['status'] == 'HYPOTHESE'
    assert set(p['source_ids']) <= ids
for p in data['unknowns']:
    assert p['status'] == 'A_VERIFIER' and p['value'] is None
for a in result['alternatives']:
    assert a['status'] == 'HYPOTHESE' and not a['available'] and not a['sharia_validated']
assert sprint['date_limite'] == '2026-11-17' and not sprint['extension_automatique']
assert [s['etat'] for s in sprint['stages']] == ['termine']*4 + ['a_faire']*3
assert read('preuves/j4-calculs.json')['passed']
tableur = read('preuves/j4-tableur.json')
assert tableur['formula_comparisons_passed'] and tableur['formula_error_count'] == 0
assert tableur['native_recalculation']['passed'] and tableur['native_recalculation']['cases'] == 4
links = 0
for md in ROOT.glob('*.md'):
    for target in re.findall(r'\]\(([^)]+)\)', md.read_text()):
        if re.match(r'https?://|#|mailto:', target): continue
        local = target.split('#')[0]
        if (md.parent / local) == OUT: continue
        assert (md.parent / local).exists(), (md.name, target)
        links += 1
json_count = 0
for p in ROOT.rglob('*.json'):
    if p == OUT: continue
    json.loads(p.read_text()); json_count += 1
private_patterns = [r'gh[pousr]_[A-Za-z0-9]{25,}', r'github_pat_[A-Za-z0-9_]{30,}', r'BEGIN ' + r'PRIVATE KEY', r'Auto' + r'mation_[0-9a-f]{20,}', r'https://[^\s"<>]*\.vercel\.app', r'/workspace/' + r'scratch/']
hashes = {}
for p in sorted(ROOT.rglob('*')):
    if not p.is_file() or p == OUT: continue
    b = p.read_bytes()
    if p.suffix == '.xlsx':
        with zipfile.ZipFile(p) as z:
            text = '\n'.join(z.read(n).decode('utf-8', 'ignore') for n in z.namelist() if n.endswith('.xml'))
    else: text = b.decode('utf-8')
    for pattern in private_patterns:
        assert not re.search(pattern, text), (p.name, 'marqueur privé')
    hashes[str(p.relative_to(ROOT))] = {'sha256':hashlib.sha256(b).hexdigest(),'git_blob':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()}
report = {'as_of':'2026-11-15','stage':'J4','status':'checks_passed_before_publication','operations':3,'scenarios':4,'scenario_results':12,'alternatives':18,'comparators':3,'public_primary_pages_reopened':2,'hypotheses_explicit':True,'json_files_checked':json_count,'local_markdown_links_checked':links,'privacy_marker_scan_passed':True,'schedule_end_preserved':'2026-11-17','historical_proofs_preserved':True,'calculation_checks':read('preuves/j4-calculs.json')['checks'],'xlsx_formula_comparisons':tableur['formula_comparisons'],'native_recalculated_values_checked':tableur['native_recalculation']['numeric_or_na_comparisons'],'rendered_ranges_reviewed':6,'browser_visual_test':False,'agent_review':{'model':'gpt-6.1-sol','count':1,'subdelegation':False,'professional_opinion':False},'remote_publication':'Relire tête et contenu après publication ; aucune empreinte de commit auto-référente dans cette preuve.','files':hashes}
OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='files'},ensure_ascii=False))
