/** Tests de livraison : données, moteurs et interactions avec DOM minimal simulé.
 * Ce banc ne calcule pas la mise en page et ne remplace pas un navigateur.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import os from 'node:os';
import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
import {calculate,rows} from './calculer_j4.mjs';import {evaluateDossier} from './evaluer_parcours_j5.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const bundle=read('html/assets/donnees-et-moteurs.js');const context=vm.createContext({});vm.runInContext(bundle,context);const pack=context.ETHIGONE_J8,ds=pack.datasets;
const plain=x=>JSON.parse(JSON.stringify(x));const checks=[];let comparisons=0;
const check=(name,fn)=>{fn();checks.push({name,passed:true});};
const near=(a,b)=>{assert.equal(typeof a,typeof b);if(a===null){assert.equal(b,null);return;}assert(Number.isFinite(a)&&Number.isFinite(b));assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);comparisons++;};
check('Données sources exactes et dates historiques conservées',()=>{for(const [p,d] of Object.entries(ds))assert.deepEqual(plain(d),JSON.parse(read(p)));for(const [p,d] of Object.entries(pack.documents))assert.equal(d,read(p));assert.equal(pack.manifest.html_completed,true);assert.equal(pack.manifest.visual_browser_check,false);assert.equal(pack.sources.length,124);});
const data=ds['data/operations-j4.json'],published=ds['data/resultats-j4.json'];
check('Douze scénarios et 21 sensibilités : toutes sorties moteur identiques',()=>{
 for(const c of published.cases){const v=pack.economics.calculate(data,c.operation_id,c.case_id);for(const r of rows)near(v[r.key],c.values[r.key]);}
 for(const s of ds['data/sensibilites-j6.json'].results){const v=pack.economics.calculate(data,s.operation_id,s.scenario,s.overrides),ref=calculate(data,s.operation_id,s.scenario,s.overrides);for(const r of rows)near(v[r.key],ref[r.key]);near(v.ethi_profit,s.ethi_profit);near(v.check_tickets,0);}
 for(const a of published.alternatives){const v=pack.economics.calculate(data,a.operation_id,'base',a.overrides);for(const k of ['investor_target','ethi_profit','minimum_ticket','funding_gap'])near(v[k],a[k]);}
});
check('Erreurs de paramètres et inconnues conservées',()=>{for(const p of [{target_ticket:0},{purchase_unit:null},{acceptance_rate:0},{collection_ratio:1.1},{due_fraction:.5,delay_days:0}])assert.throws(()=>pack.economics.calculate(data,'O2','base',p));for(const c of ds['data/entreprises.json'].companies){assert.equal(c.finance_need_verified,false);assert.equal(c.net_margin,null);}});
class Element{
 constructor(){this.value='';this.hidden=false;this.listeners={};this.children=[];this.textContent='';this.dataset={};this.id='';this.innerHTML='';this.disabled=false;this.open=false;}
 append(...x){this.children.push(...x);} add(x){this.children.push(x);}addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(k,v){this[k]=v;}replaceChildren(){this.innerHTML='';}matches(){return true;}remove(){}click(){}
}
function sandbox(ids,selector,queryAll){let blob;
 const doc={readyState:'complete',body:new Element(),getElementById:id=>ids.get(id),createElement:()=>new Element(),querySelector:selector||((s)=>ids.get(s.slice(1))),querySelectorAll:queryAll||(()=>[])};
 const c={document:doc,Intl,Date,Option:class{constructor(text,value){this.text=text;this.value=value;}},Blob:class{constructor(parts){blob=parts.join('');}},URL:{createObjectURL:()=>'',revokeObjectURL(){}},setTimeout:fn=>fn(),listeners:{},addEventListener(k,f){this.listeners[k]=f;},print(){}};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(bundle,c);return {c,getExport:()=>JSON.parse(blob)};
}
check('Interface simulateur : base, variante, stress, reset, tous cas, export exact et erreur sans résultat périmé',()=>{
 const ids=new Map(['simulator-app','simulator-form','sim-operation','sim-case','sim-results','sim-error','sim-export','sim-parameters','sim-description','sim-ticket','sim-stress','sim-reset'].map(id=>[id,new Element()]));
 const {c,getExport}=sandbox(ids);vm.runInContext(read('html/assets/simulateur.js'),c);
 const exported=()=>{ids.get('sim-export').listeners.click();return getExport();};
 near(exported().results.ethi_profit,-1121.25);ids.get('sim-ticket').listeners.click();near(exported().results.ethi_profit,633.75);ids.get('sim-stress').listeners.click();near(exported().results.ethi_profit,-335);ids.get('sim-reset').listeners.click();near(exported().results.ethi_profit,-1121.25);
 for(const op of data.operations)for(const ca of data.cases){ids.get('sim-operation').value=op.id;ids.get('sim-case').value=ca.id;ids.get('sim-case').listeners.change();const ex=exported();assert.equal(ex.operation,op.id);assert.equal(ex.scenario,ca.id);const expected=calculate(data,op.id,ca.id);for(const r of rows)near(ex.results[r.key],expected[r.key]);assert(!/undefined|NaN/.test(ids.get('sim-results').innerHTML));assert.equal(ex.financial_execution_authorized,false);}
 const all=[];function visit(e){for(const x of e.children||[])if(x&&typeof x==='object'){all.push(x);visit(x);}}visit(ids.get('sim-parameters'));
 const field=all.find(x=>x.name==='target_ticket');field.value='';ids.get('simulator-form').listeners.input({target:field});assert(ids.get('sim-export').disabled);assert(ids.get('sim-error').textContent.includes('Calcul impossible'));assert.equal(ids.get('sim-results').innerHTML,'');ids.get('sim-reset').listeners.click();near(exported().results.ethi_profit,-1121.25);
 // A changed field, not only a predefined variant, must reach the engine and export.
 const price=all.find(x=>x.name==='sale_unit');price.value='3.1';ids.get('simulator-form').listeners.input({target:price});const ex=exported();near(ex.inputs.sale_unit,3.1);near(ex.results.ethi_profit,calculate(data,'O2','base',{sale_unit:3.1}).ethi_profit);
});
const fixtures=JSON.parse(execFileSync('python',[path.join(root,'verifier_html_j8.py'),'--fixtures'],{encoding:'utf8'}));
check('Filtres sur les textes HTML réels, sélections et exports cohérents',()=>{
 const map={'niches.html':['niches','priorite',1],'entreprises.html':['entreprises','N02',6],'investisseurs.html':['investisseurs','',10],'parcours.html':['parcours','incident',1],'sources.html':['sources','sources-j6',5]};
 for(const [page,[key,group,n]] of Object.entries(map)){
  const records=fixtures[page].map(x=>{const e=new Element();e.id=x.id;e.dataset.group=x.group;e.textContent=x.text;return e;});
  const ids=new Map(['search','group','export-records','count','print'].map(id=>[id,new Element()]));ids.get('export-records').dataset.export=key;
  const {c,getExport}=sandbox(ids,null,s=>s==='.records .record'?records:[]);vm.runInContext(read('html/assets/app.js'),c);assert(records.every(e=>!e.hidden));ids.get('group').value=group;ids.get('group').listeners.change();assert.equal(records.filter(e=>!e.hidden).length,n);ids.get('export-records').listeners.click();assert.equal(getExport().records.length,n);
  ids.get('search').value='zz_no_match_zz';ids.get('search').listeners.input();assert(records.every(e=>e.hidden));ids.get('export-records').listeners.click();assert.equal(getExport().records.length,0);
  if(key==='entreprises'){ids.get('group').value='';ids.get('search').value='turquet';ids.get('search').listeners.input();assert.deepEqual(records.filter(e=>!e.hidden).map(e=>e.id),['E10']);}
 }
});
check('Contrôleur documentaire : cas réel bloqué et scénarios fictifs sans autorisation',()=>{
 const ids=new Map(['workflow-case','workflow-export','workflow-result','print'].map(id=>[id,new Element()]));ids.get('workflow-case').value='real';const {c,getExport}=sandbox(ids);vm.runInContext(read('html/assets/app.js'),c);
 const cases={real:'SIMULATION_BLOQUEE',demo:'SIMULATION_COHERENTE',short:'SIMULATION_BLOQUEE',incident:'SIMULATION_BLOQUEE',title:'SIMULATION_BLOQUEE',c03:'SIMULATION_BLOQUEE'};
 for(const [ca,result] of Object.entries(cases)){ids.get('workflow-case').value=ca;ids.get('workflow-case').listeners.change();ids.get('workflow-export').listeners.click();const o=getExport();assert.equal(o.result.result,result);assert.equal(o.result.financial_execution_authorized,false);const ex=ds['data/dossiers-j5.json'];assert.deepEqual(o.result,evaluateDossier(o.dossier,plain(ds['data/parcours-j5.json']),plain(ex.model_reference),'2026-11-16'));if(ca==='short')assert(o.result.errors.some(e=>e.code==='COLLECTE_INSUFFISANTE'));}
});
check('Ouverture et restauration des détails pour impression (simulation DOM)',()=>{
 const a=new Element(),b=new Element();b.open=true;const ids=new Map([['print',new Element()]]);const {c}=sandbox(ids,null,s=>s==='details'?[a,b]:[]);vm.runInContext(read('html/assets/app.js'),c);c.listeners.beforeprint();assert(a.open&&b.open);c.listeners.afterprint();assert(!a.open&&b.open);
});
let historical;
check('177 contrôles J4, 49 cas J5 et 21 sensibilités J6 en copie temporaire',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ethigone-j8-'));try{fs.cpSync(root,tmp,{recursive:true});const run=n=>JSON.parse(execFileSync(process.execPath,[path.join(tmp,n)],{encoding:'utf8'}));const a=run('test_calculs_j4.mjs'),b=run('test_parcours_j5.mjs'),c=run('calculer_sensibilites_j6.mjs');assert(a.passed&&b.passed);assert.deepEqual(c,plain(ds['data/sensibilites-j6.json']));historical={j4_checks:a.checks,j5_cases:b.tests,j6_cases:c.cases};}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
const proof={as_of:'2026-11-18',passed:true,numeric_comparisons:comparisons,checks,historical,execution:'Node.js VM avec DOM minimal simulé ; pas navigateur ni moteur de mise en page',visual_browser_check:false,keyboard_mobile_print_browser_check:false,limitations:['Chromium local non lancé : socket système non permis.','Extension navigateur indisponible.','Navigateur disponible : ouverture file: refusée ; aucun contournement.','Les styles mobile/focus/impression sont présents ; rendu et accessibilité réelle non validés.'],financial_execution_authorized:false};
fs.writeFileSync(path.join(root,'preuves/j8-verification.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
