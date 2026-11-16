#!/usr/bin/env python3
"""Contrôle local J5 ; aucune requête réseau, aucun acte financier.

python verifier_j5.py [--base-tree arbre-git-public.json] [--write-proof]
La vérification distante après commit est distincte de ce contrôle local.
"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
PREFIX = 'docs/strategie-modele-3/'
CHANGED_EXISTING = {'CHECKPOINT.md', 'README.md', 'data/sprint.json'}
NEW_FILES = {
    'J5_PARCOURS.md', 'CONTRATS_ET_QUESTIONS_J5.md', 'COMPARAISON_SOLUTIONS_J5.md',
    'SOURCES_J5.md', 'data/parcours-j5.json', 'data/questions-j5.json',
    'data/solutions-j5.json', 'data/sources-j5.json', 'data/dossiers-j5.json',
    'evaluer_parcours_j5.mjs', 'test_parcours_j5.mjs', 'verifier_j5.py',
    'preuves/j5-parcours.json', 'preuves/j5-verification.json'
}
def read(name):
    return json.loads((ROOT/name).read_text(encoding='utf-8'))
def blob_sha(raw):
    return hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
def require(condition, detail):
    if not condition:
        raise AssertionError(detail)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-tree',type=Path)
    parser.add_argument('--write-proof',action='store_true')
    args=parser.parse_args()
    parsed=list(ROOT.rglob('*.json'))
    for f in parsed:
        json.loads(f.read_text(encoding='utf-8'))
    wf,qs,sol,src,ds=[read('data/'+n+'-j5.json') for n in ['parcours','questions','solutions','sources','dossiers']]
    require((len(wf['stages']),len(wf['roles']),len(wf['contracts']),len(qs['questions']),len(sol['solutions']),len(src['sources']))==(12,12,3,20,7,18),'Comptages J5')
    sources={x['id'] for x in src['sources']}
    roles={x['id'] for x in wf['roles']}
    stages={x['id'] for x in wf['stages']}
    require(len(sources)==18 and len(roles)==12 and len(stages)==12,'Identifiants dupliqués')
    for s in src['sources']:
        require(s['consulted_on']=='2026-11-16' and s['coordinator_reviewed'] and bool(s['limit']),'Source sans date/revue/limite')
        require(urlsplit(s['url']).scheme=='https','URL primaire manquante')
    require(len({s['url'] for s in src['sources']})==18,'Source dupliquée')
    statuses={'CONFIRME','HYPOTHESE','RISQUE','A_VERIFIER','PROPOSITION','DECIDE','REJETE'}
    def walk(o):
        if isinstance(o,dict):
            if 'status' in o: require(o['status'] in statuses,'Statut inconnu')
            if 'sources' in o and isinstance(o['sources'],list) and all(isinstance(x,str) for x in o['sources']):
                require(set(o['sources'])<=sources,'Provenance inconnue')
            for v in o.values(): walk(v)
        elif isinstance(o,list):
            for v in o: walk(v)
    for obj in [wf,qs,sol,src,ds]: walk(obj)
    for st in wf['stages']:
        require(st['accountable_role'] in roles and set(st['review_roles'])<=roles,'Rôle d’étape inconnu')
        require(set(st['evidence_types'])<=set(wf['evidence_roles']),'Pièce typée inconnue')
        require(all(st[k] for k in ['inputs','checks','output','ownership_money_risk','stop']),'Étape vide')
    for q in qs['questions']:
        require(set(q['owner_roles'])<=roles and set(q['stages'])<=stages,'Question sans responsable/étape valide')
        require(q['professional_answer_received'] is False,'Réponse professionnelle inventée')
    require(wf['normal_path']==['P01','P02','P03','P04','P05','P06','P07','P08','P09','P11','P12'],'Chemin normal incorrect')
    require(set(wf['incident_path']['from_stages'])<=stages and wf['incident_path']['to_stage']=='P10','Branche incident incorrecte')
    require(wf['financial_execution_authorized'] is False and wf['real_dossier_validated'] is False and wf['contract_adopted'] is None and wf['niche_adopted'] is None,'Validation indue')
    for s in sol['solutions']:
        require(not s['access_verified'] and not s['partnership_acquired'] and not s['sharia_validated'],'Accès/partenariat/conformité acquis à tort')
    require(sol['priority_routes_changed'] is False and sol['reason_to_prefer_ethigone']['observed'] is False,'Décision finale J6 inventée')
    actual,demo=ds['dossiers']
    require(actual['evidence']==[] and actual['synthetic'] is False,'État réel altéré')
    require(demo['synthetic'] and all(e['synthetic'] and e['id'].startswith('SYNTHETIC-') for e in demo['evidence']),'Données non fictives dans démonstration')
    ref=ds['model_reference']
    require(ref['inputs_sha256']==hashlib.sha256((ROOT/'data/operations-j4.json').read_bytes()).hexdigest(),'Empreinte J4 incohérente')
    j4=read('data/resultats-j4.json')
    alt=next(x for x in j4['alternatives'] if x['operation_id']=='O1' and x['id']=='ticket_minimum')
    base=next(x['values'] for x in j4['cases'] if x['operation_id']=='O1' and x['case_id']=='base')
    require(ref['investor_target_cents']==round(100*alt['investor_target']) and ref['ethi_profit_cents']==round(100*alt['ethi_profit']),'Recopie résultats J4 incorrecte')
    require(ref['operator_required_cents']==round(100*(base['capital_required']-base['investor_target'])) and ref['deposit_required_cents']==round(100*base['deposit']),'Apport/acompte de référence incorrect')
    require(demo['money']['cash_available_cents']==sum(demo['money'][k] for k in ['collected_cents','operator_received_cents','deposit_received_cents']),'Cash initial synthétique non rapproché')
    node=subprocess.run(['node',str(ROOT/'test_parcours_j5.mjs')],cwd=ROOT,check=True,capture_output=True,text=True)
    test=json.loads(node.stdout)
    proof=read('preuves/j5-parcours.json')
    require(test['passed'] and test['tests']==proof['tests_count']==49,'Tests ou preuve J5 incohérents')
    require(proof['actual_documentary_state']['result']=='SIMULATION_BLOQUEE','État réel non bloqué')
    require(not proof['financial_execution_authorized'],'Exécution réelle indue')
    engine=(ROOT/'evaluer_parcours_j5.mjs').read_text()
    require(not re.search(r'\b(fetch|XMLHttpRequest|WebSocket|eval)\s*\(',engine),'Moteur avec effet externe')
    require('import ' not in engine and 'writeFile' not in engine,'Moteur non autonome')
    sprint=read('data/sprint.json')
    states={x['lot']:x['etat'] for x in sprint['stages']}
    require(all(states['J'+str(i)]=='termine' for i in range(1,6)) and states['J6']=='a_faire' and states['J7']=='a_faire','Avancement incohérent')
    require(sprint['date_limite']=='2026-11-17' and sprint['extension_automatique'] is False,'Fin prolongée')
    require(sprint['niche_adoptee'] is None,'Niche adoptée à tort')
    # Les liens Markdown locaux sont contrôlés sur tous les livrables présents.
    links=[]
    for f in ROOT.rglob('*.md'):
        for raw in re.findall(r'\]\(([^)]+)\)',f.read_text(encoding='utf-8')):
            url=raw.strip('<>')
            if url.startswith(('https://','http://','#','mailto:')): continue
            target=(f.parent/unquote(url.split('#')[0])).resolve()
            being_written=args.write_proof and target==ROOT/'preuves/j5-verification.json'
            require(target.is_relative_to(ROOT) and (target.exists() or being_written),f'Lien local cassé : {f.name} {url}')
            links.append(str(target.relative_to(ROOT)))
    # Détection de marqueurs privés, pas une preuve exhaustive d'absence de secret.
    for name in sorted((NEW_FILES|CHANGED_EXISTING)-{'preuves/j5-verification.json'}):
        raw=(ROOT/name).read_text(encoding='utf-8')
        for pat in [r'Automation_[0-9a-f]{12,}',r'gh[pousr]_[A-Za-z0-9]{20,}',r'-----BEGIN [A-Z ]*PRIVATE KEY-----',r'https?://[^\s)"<>]*\.vercel\.app',r'/workspace/scratch/[a-f0-9]+',r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}']:
            require(not re.search(pat,raw),f'Marqueur à examiner dans {name}')
    preservation=None
    if args.base_tree:
        tree=json.loads(args.base_tree.read_text())
        require(not tree.get('truncated'), 'Arbre de base tronqué')
        entries=[e for e in tree['tree'] if e['type']=='blob']
        old={e['path']:e['sha'] for e in entries}
        kept=0
        for path,sha in old.items():
            if path.startswith(PREFIX):
                relative=path[len(PREFIX):]
                require((ROOT/relative).is_file(),'Ancien fichier absent : '+relative)
                if relative not in CHANGED_EXISTING:
                    require(blob_sha((ROOT/relative).read_bytes())==sha,'Ancien livrable modifié : '+relative)
                    kept+=1
        require(kept==40,'Base J4 attendue : 40 fichiers de dossier préservés')
        for name in NEW_FILES:
            require(PREFIX+name not in old,'Collision sur nouveau fichier')
        preservation=dict(base_commit='6d2e25aaa3b96b595172c4910a3e1e40e0db6f4f',base_tree='5c23baf38ff34e8b780d5b19497698148d2fb06a',base_repository_files=len(entries),folder_files_preserved=kept,repository_files_to_preserve=len(entries)-len(CHANGED_EXISTING),new_files=len(NEW_FILES),updated_files=len(CHANGED_EXISTING),scope=PREFIX,remote_after_commit='À vérifier séparément après publication ; aucune preuve distante prétendue par ce script.')
    checks={
        'schema_version':1,'as_of':'2026-11-16','passed':True,'tests':49,
        'counts':{'stages':12,'roles':12,'contracts':3,'questions':20,'solutions':7,'sources':18},
        'json_parsed':len(parsed),'local_markdown_links':len(links),
        'source_provenance_checked':True,'j4_references_checked':True,
        'calendar_checked':True,'private_marker_scan_passed':True,
        'financial_execution_authorized':False,'visual_test_performed':False,
        'preservation':preservation,
        'artifacts':[dict(path=n,sha256=hashlib.sha256((ROOT/n).read_bytes()).hexdigest(),git_blob=blob_sha((ROOT/n).read_bytes())) for n in sorted((NEW_FILES|CHANGED_EXISTING)-{'preuves/j5-verification.json'})],
        'limits':['Contrôles documentaires/logiciels, pas expertise juridique ni charia.','Les anciennes preuves J1–J4 sont conservées sans réexécution ou réécriture.','Aucun test visuel nécessaire au lot textuel J5 ; J7 HTML reste à produire.']}
    if args.write_proof:
        (ROOT/'preuves/j5-verification.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:checks[k] for k in ['passed','tests','counts','local_markdown_links','preservation']},ensure_ascii=False))

if __name__=='__main__':
    main()
