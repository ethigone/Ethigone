/** Préparation reproductible J8 : lit uniquement les sources locales explicites.
 * --out chemin.js écrit un script classique embarquable, sans import/fetch/CDN.
 * --manifest met à jour l'inventaire des sources. Sans option : contrôle et résumé.
 * Aucun HTML, accès réseau, paiement ou donnée utilisateur.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

export const root=path.dirname(fileURLToPath(import.meta.url));
export const jsonFiles=[
  'sprint','niches','sources-transversales','entreprises','sources-j2','reperage',
  'investisseurs','sources-j3','voies-investisseurs','operations-j4','resultats-j4',
  'formules-j4','sources-j4','parcours-j5','questions-j5','solutions-j5',
  'sources-j5','dossiers-j5','decision-j6','sensibilites-j6','sources-j6','presentation-j8'
].map(n=>'data/'+n+'.json');
const engines=['calculer_j4.mjs','evaluer_parcours_j5.mjs'];
const documentFiles=['J6_RECOMMANDATION.md','CONTRE_REVUE_J6.md','DOSSIER_TERRAIN_J6.md','SOURCES_J6.md','MODELE_CALCULS_J4.md'];
const sourceFiles=['data/niches.json','data/sources-transversales.json',
  'data/sources-j2.json','data/sources-j3.json','data/sources-j4.json',
  'data/sources-j5.json','data/sources-j6.json'];
export function fileFingerprint(p){
  const b=fs.readFileSync(path.join(root,p));
  return {path:p,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),
    git_blob_sha1:createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')};
}
export function prepare(){
  const datasets=Object.fromEntries(jsonFiles.map(p=>[p,JSON.parse(fs.readFileSync(path.join(root,p),'utf8'))]));
  const documents=Object.fromEntries(documentFiles.map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')]));
  const sources=sourceFiles.flatMap(p=>datasets[p].sources.map(s=>({id:s.id,dataset:p,record:s})));
  if(new Set(sources.map(s=>s.id)).size!==sources.length)throw Error('Identifiants source dupliqués');
  const sourceIds=new Set(sources.map(s=>s.id)); let referenceCount=0;
  function walk(x,where){
    if(Array.isArray(x)){x.forEach((y,i)=>walk(y,where+'['+i+']'));return;}
    if(!x||typeof x!=='object')return;
    for(const [key,value] of Object.entries(x)){
      if(['source_ids','sources'].includes(key)&&Array.isArray(value)&&value.every(v=>typeof v==='string')){
        for(const id of value){if(!sourceIds.has(id))throw Error('Source absente '+id+' dans '+where);referenceCount++;}
      }else walk(value,where+'.'+key);
    }
  }
  Object.entries(datasets).forEach(([p,x])=>walk(x,p));
  const manifest={schema_version:1,prepared_on:'2026-11-17',scope:'Préparation de données, pas livraison HTML',
    base_commit:'d81bdcc8ec0553694010ec65c70690117da057ff',
    all_source_dates_preserved:true,html_completed:false,financial_execution_authorized:false,
    data_files:jsonFiles.map(fileFingerprint),engines:engines.map(fileFingerprint),documents:documentFiles.map(fileFingerprint),
    counts:{datasets:jsonFiles.length,niches:datasets['data/niches.json'].niches.length,
      companies:datasets['data/entreprises.json'].companies.length,
      investor_entry_points:datasets['data/investisseurs.json'].actors.length,
      baseline_scenarios:datasets['data/resultats-j4.json'].cases.length,
      alternatives:datasets['data/resultats-j4.json'].alternatives.length,
      sensitivities:datasets['data/sensibilites-j6.json'].results.length,
      workflow_stages:datasets['data/parcours-j5.json'].stages.length,
      professional_questions:datasets['data/questions-j5.json'].questions.length,
      source_records:sources.length,source_references:referenceCount},
    source_note:'124 notices ne signifient pas 124 sites ou confirmations indépendantes ; mandats/hypothèses sans URL et tentatives échouées inclus.'};
  return {manifest,datasets,documents,sources};
}
export function buildBundle(pack=prepare()){
  const safeJSON=JSON.stringify(pack).replace(/</g,'\\u003c').replace(/>/g,'\\u003e')
    .replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  // Seuls les mots-clés d'export sont retirés ; aucune formule n'est recopiée/réécrite.
  const calculation=fs.readFileSync(path.join(root,engines[0]),'utf8')
    .replace(/^export const rows=R;/m,'const rows=R;').replace(/^export function /gm,'function ');
  const workflow=fs.readFileSync(path.join(root,engines[1]),'utf8').replace(/^export function /gm,'function ');
  for(const text of [calculation,workflow])if(/^\s*(import|export)\s/m.test(text))throw Error('Adaptation des exports à réexaminer');
  return '// ETHIGONE J8 — données historiques et simulations. Aucune opération réelle.\n'+
    '(function(){"use strict";\nconst pack='+safeJSON+';\n'+
    'const economics=(function(){\n'+calculation+'\nreturn Object.freeze({rows,evaluate,toExcel,inputsFor,calculate});})();\n'+
    'const workflow=(function(){\n'+workflow+'\nreturn Object.freeze({evaluateDossier});})();\n'+
    'globalThis.ETHIGONE_J8=Object.freeze({...pack,economics,workflow});\n})();\n';
}
function main(){
  const args=process.argv.slice(2); const allowed=new Set(['--manifest','--out']);
  for(let i=0;i<args.length;i++){if(!allowed.has(args[i]))throw Error('Option inconnue '+args[i]);if(args[i]==='--out'){if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Chemin --out requis');i++;}}
  const pack=prepare();
  if(args.includes('--manifest'))fs.writeFileSync(path.join(root,'data/manifest-j8.json'),JSON.stringify(pack.manifest,null,2)+'\n');
  if(args.includes('--out')){
    const output=path.resolve(args[args.indexOf('--out')+1]);
    if(!output.endsWith('.js'))throw Error('Sortie .js requise');
    if([...jsonFiles,...engines].some(p=>path.resolve(root,p)===output))throw Error('Source protégée');
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,buildBundle(pack));
  }
  console.log(JSON.stringify(pack.manifest.counts));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
