/** Cohérence J7 et préparation hors ligne, sans modifier les preuves historiques. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {prepare,buildBundle,root} from './preparer_j8.mjs';
import {calculate,rows} from './calculer_j4.mjs';
import {evaluateDossier} from './evaluer_parcours_j5.mjs';

const pack=prepare(), ds=pack.datasets;
const d=ds['data/operations-j4.json'], results=ds['data/resultats-j4.json'];
const decision=ds['data/decision-j6.json'], sprint=ds['data/sprint.json'];
const checks=[];let numericComparisons=0;
function check(name,fn){fn();checks.push({name,passed:true});}
function near(a,b){assert.equal(typeof a,typeof b);if(a===null){assert.equal(b,null);return;}
  assert(Number.isFinite(a)&&Number.isFinite(b));assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);numericComparisons++;}
function plain(x){return JSON.parse(JSON.stringify(x));}

check('Modèle décidé, niche proposée et calendrier courant',()=>{
  assert.equal(sprint.decision_modele.modele,3);assert.equal(sprint.decision_modele.statut,'DECIDE');
  assert.equal(sprint.niche_adoptee,null);assert.equal(decision.niche_adopted,null);
  assert.equal(decision.status,'PROPOSITION');assert.equal(decision.primary_niche,'N02');
  assert.equal(decision.fallback_niche,'N01');assert.equal(decision.reserve_niche,'N03');
  assert.equal(decision.financial_execution_authorized,false);assert.equal(decision.independent_agent_review,false);
  assert.equal(sprint.stages.find(s=>s.lot==='J6').etat,'termine');
  assert.equal(sprint.date_limite,'2026-11-18');assert.equal(sprint.extension_automatique,false);
  assert.equal(sprint.stages.find(s=>s.lot==='J8').date_nominale,'2026-11-18');
});
check('Entités reliées sans ressusciter E16 ni inventer de besoin',()=>{
  const niches=ds['data/niches.json'].niches, companies=ds['data/entreprises.json'].companies;
  const actors=ds['data/investisseurs.json'].actors;
  for(const list of [niches,companies,actors])assert.equal(new Set(list.map(x=>x.id)).size,list.length);
  assert.equal(companies.length,17);assert.equal(actors.length,10);assert.equal(niches.length,6);
  const counts={};for(const c of companies){
    assert(niches.some(n=>n.id===c.niche_id));counts[c.niche_id]=(counts[c.niche_id]||0)+1;
    assert.equal(c.finance_need_verified,false);assert.equal(c.interest_in_ethigone_verified,false);
    assert.equal(c.order_verified,false);assert.equal(c.net_margin,null);
  }
  assert.deepEqual(counts,{N01:6,N02:6,N03:5});assert(!companies.some(x=>x.id==='E16'));
  for(const id of decision.operator_candidates)assert.equal(companies.find(c=>c.id===id).niche_id,'N02');
  assert.equal(companies.find(c=>c.id===decision.fallback_candidate).niche_id,'N01');
  for(const op of d.operations)assert(niches.some(n=>n.id===op.niche_id));
  for(const route of ds['data/voies-investisseurs.json'].routes){for(const id of route.actor_ids)assert(actors.some(a=>a.id===id));}
  assert.equal(ds['data/voies-investisseurs.json'].active_routes_verified,0);
  for(const actor of actors)for(const key of ['partnership_verified','listing_verified','investors_committed_verified','sharia_ethigone_validated'])assert.equal(actor[key],false);
});
check('Sources J6 transcrites exactement sans nouvelle consultation',()=>{
  const lines=fs.readFileSync(path.join(root,'SOURCES_J6.md'),'utf8').split('\n').filter(l=>l.startsWith('| S6-'));
  const parsed=lines.map(l=>l.trim().slice(1,-1).split('|').map(x=>x.trim()));
  const sources=ds['data/sources-j6.json'].sources;
  assert.equal(sources.length,5);
  sources.forEach((s,i)=>{
    assert.deepEqual([s.id,s.url,s.observation,s.limit],parsed[i]);assert.equal(s.consulted_on,'2026-11-16');
  });assert.equal(sources.at(-1).access,'ECHEC');
  assert.equal(pack.sources.length,124);assert.equal(pack.manifest.counts.source_references,695);
});
check('Toutes expressions et douze résultats J4 concordent',()=>{
  assert.deepEqual(ds['data/formules-j4.json'].rows,rows);
  for(const result of results.cases){const v=calculate(d,result.operation_id,result.case_id);
    for(const r of rows)near(v[r.key],result.values[r.key]);
    for(const key of ['check_cash_profit','check_capital_split','check_tickets'])near(v[key],0);
  }
});
check('Dix-huit alternatives et vingt-et-une sensibilités rapprochées',()=>{
  for(const alt of results.alternatives){const v=calculate(d,alt.operation_id,'base',alt.overrides);
    for(const k of ['investor_target','ethi_profit','investor_count','minimum_ticket','break_even_operations','project_profit','funding_gap'])near(v[k],alt[k]);
    assert.equal(alt.available,false);assert.equal(alt.sharia_validated,false);
  }
  const sensitivities=ds['data/sensibilites-j6.json'];assert.equal(sensitivities.results.length,21);
  for(const s of sensitivities.results){const v=calculate(d,s.operation_id,s.scenario,s.overrides);
    for(const key of ['investor_target','regular_ticket','last_ticket','ethi_fee','ethi_profit'])near(v[key],s[key]);
    near(v.investor_count,s.participants);near(v.ethi_profit,s.independent_profit);near(v.check_tickets,0);
  }
  assert.equal(sensitivities.results.find(s=>s.operation_id==='O2'&&s.variant==='ticket_2500').ethi_profit,633.75);
  assert.equal(sensitivities.results.find(s=>s.operation_id==='O2'&&s.variant==='ticket_2500_volume_3_acceptation_20pct').ethi_profit,-335);
});

const js=buildBundle(pack);const context=vm.createContext({}, {codeGeneration:{strings:false,wasm:false}});
new vm.Script(js).runInContext(context,{timeout:5000});const offline=context.ETHIGONE_J8;
check('Script classique embarqué sans réseau ni imports et données identiques',()=>{
  assert(!/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(js));
  assert(!/^\s*(?:import|export)\s/m.test(js));assert(!/<\/script/i.test(js));
  assert.deepEqual(plain(offline.datasets),ds);assert.deepEqual(plain(offline.sources),pack.sources);
  assert.deepEqual(plain(offline.documents),pack.documents);
  assert.equal(offline.datasets['data/presentation-j8.json'].html_delivery.completed,false);
});
check('Même moteur embarqué sur scénarios, variantes et erreurs',()=>{
  for(const result of results.cases){const v=offline.economics.calculate(d,result.operation_id,result.case_id);
    for(const r of rows)near(v[r.key],result.values[r.key]);
  }
  for(const s of ds['data/sensibilites-j6.json'].results){
    const actual=offline.economics.calculate(d,s.operation_id,s.scenario,s.overrides);
    const expected=calculate(d,s.operation_id,s.scenario,s.overrides);
    for(const row of rows)near(actual[row.key],expected[row.key]);
  }
  for(const values of [{target_ticket:0},{purchase_unit:null},{acceptance_rate:0},{collection_ratio:1.1},{due_fraction:.5,delay_days:0}])assert.throws(()=>offline.economics.calculate(d,'O2','base',values));
});
check('Parcours, rôles et exemples cohérents ; exécution toujours interdite',()=>{
  const rules=ds['data/parcours-j5.json'], examples=ds['data/dossiers-j5.json'];
  const roles=new Set(rules.roles.map(r=>r.id));const stages=new Set(rules.stages.map(s=>s.id));
  for(const stage of rules.stages){assert(roles.has(stage.accountable_role));stage.review_roles.forEach(r=>assert(roles.has(r)));}
  const endpoints=ds['data/presentation-j8.json'].workflow.endpoint_labels;
  for(const flow of rules.flows){for(const r of [flow.from_role,flow.to_role,flow.control_role]){
    if(roles.has(r))continue;
    assert(endpoints[r],'Extrémité de flux non reconnue '+r);
    if(endpoints[r].kind==='role_group')endpoints[r].role_ids.forEach(id=>assert(roles.has(id)));
    else assert.equal(endpoints[r].label,r);
  }}
  for(const question of ds['data/questions-j5.json'].questions){question.owner_roles.forEach(r=>assert(roles.has(r)));question.stages.forEach(s=>assert(stages.has(s)));assert.equal(question.professional_answer_received,false);}
  for(const dossier of examples.dossiers){
    const expected=evaluateDossier(dossier,rules,examples.model_reference,examples.as_of);
    const actual=offline.workflow.evaluateDossier(dossier,rules,examples.model_reference,examples.as_of);
    assert.deepEqual(plain(actual),expected);assert.equal(actual.financial_execution_authorized,false);
  }
});
check('Contenu échappé pour insertion dans HTML',()=>{
  const altered=structuredClone(pack);altered.datasets['test']= {text:'</script><script>alert(1)</script>&\u2028'};
  const script=buildBundle(altered);assert(!/<\/script/i.test(script));
  const isolated=vm.createContext({},{codeGeneration:{strings:false,wasm:false}});
  new vm.Script(script).runInContext(isolated,{timeout:5000});
  assert.equal(isolated.ETHIGONE_J8.datasets.test.text,altered.datasets.test.text);
});

let historical;
check('Tests historiques rejoués en copie temporaire uniquement',()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ethigone-j7-'));
  try{
    fs.cpSync(root,tmp,{recursive:true});
    const run=(name)=>JSON.parse(execFileSync(process.execPath,[path.join(tmp,name)],{encoding:'utf8',timeout:15000}));
    const j4=run('test_calculs_j4.mjs'),j5=run('test_parcours_j5.mjs'),j6=run('calculer_sensibilites_j6.mjs');
    assert.equal(j4.passed,true);assert.equal(j5.passed,true);assert.deepEqual(j6,ds['data/sensibilites-j6.json']);
    run('generer_resultats_j4.mjs');
    for(const name of ['data/resultats-j4.json','data/formules-j4.json','preuves/j4-calculs.json'])assert.equal(fs.readFileSync(path.join(tmp,name),'utf8'),fs.readFileSync(path.join(root,name),'utf8'));
    historical={j4_checks:j4.checks,j5_cases:j5.tests,j6_sensitivities:j6.cases,original_proofs_unchanged:true};
  }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
check('Manifest exact et toutes preuves déclarées présentes',()=>{
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'data/manifest-j8.json'),'utf8')),pack.manifest);
  for(const stage of sprint.stages)for(const proof of stage.preuves){
    if(proof!=='preuves/j7-verification.json')assert(fs.existsSync(path.join(root,proof)),proof);
  }
  for(const name of decision.reference_documents)assert(fs.existsSync(path.join(root,name)),name);
});
const proof={as_of:'2026-11-17',passed:true,scope:'Cohérence J6 et préparation J8 uniquement',
  base_commit:pack.manifest.base_commit,counts:pack.manifest.counts,numeric_comparisons:numericComparisons,
  classic_bundle_bytes:Buffer.byteLength(js),checks,historical,
  execution:'Node.js et VM JavaScript sans réseau ; pas contrôle visuel navigateur',
  html_created:false,visual_browser_check:false,financial_execution_authorized:false,
  limits:['Sources publiques non reconsultées le 17 ; dates historiques conservées.',
    'Ni validation commerciale ni avis professionnel. Publication distante vérifiée séparément après commit.']};
if(process.argv.includes('--write-proof'))fs.writeFileSync(path.join(root,'preuves/j7-verification.json'),JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify({passed:true,groups:checks.length,numeric_comparisons:numericComparisons,historical,counts:pack.manifest.counts}));
