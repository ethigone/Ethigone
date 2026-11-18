/* Interactions locales : filtres, export et contrôleur documentaire. Aucun réseau. */
(function(){'use strict';
const pack=globalThis.ETHIGONE_J8;
if(!pack)return;
const $=s=>document.querySelector(s);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const download=(name,obj)=>{const u=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);};
document.querySelectorAll('.interactive').forEach(e=>e.hidden=false);
const records=[...document.querySelectorAll('.records .record')];
if($('#search')){
 const filter=()=>{const q=norm($('#search').value);const group=$('#group').value;let n=0;records.forEach(e=>{e.hidden=!((!group||e.dataset.group===group)&&norm(e.textContent).includes(q));if(!e.hidden)n++;});$('#count').textContent=n+' fiche'+(n>1?'s':'')+' affichée'+(n>1?'s':'')+' sur '+records.length;};
 $('#search').addEventListener('input',filter);$('#group').addEventListener('change',filter);filter();
 $('#export-records').addEventListener('click',()=>{
 const key=$('#export-records').dataset.export;let all;
 if(key==='sources')all=pack.sources.map(s=>s.record);
 else{const map={niches:['niches','niches'],entreprises:['entreprises','companies'],investisseurs:['investisseurs','actors'],parcours:['parcours-j5','stages']};const [f,k]=map[key];all=pack.datasets['data/'+f+'.json'][k];}
 const visible=new Set(records.filter(e=>!e.hidden).map(e=>e.id));
 download('ethigone-'+key+'-selection.json',{exported_at:new Date().toISOString(),scope:'Données documentaires historiques. Aucune validation commerciale ni professionnelle.',filter:{search:$('#search').value,group:$('#group').value},records:all.filter(x=>visible.has(x.id))});
 });
}
let opened=[];
const expandPrint=()=>{opened=[...document.querySelectorAll('details')].map(e=>[e,e.open]);opened.forEach(([e])=>e.open=true);};
const restorePrint=()=>{opened.forEach(([e,o])=>e.open=o);opened=[];};
window.addEventListener('beforeprint',expandPrint);window.addEventListener('afterprint',restorePrint);
$('#print')?.addEventListener('click',()=>window.print());
if($('#workflow-case')){
 let out;
 const run=()=>{const choice=$('#workflow-case').value;const examples=pack.datasets['data/dossiers-j5.json'];const d=JSON.parse(JSON.stringify(examples.dossiers[choice==='real'?0:1]));
 if(choice==='short')d.money.collected_cents=d.money.target_cents-1;
 if(choice==='incident')d.flags.incident_open=true;
 if(choice==='title'){d.action='revendre';d.flags.ownership_verified=false;}
 if(choice==='c03'){d.contract='C03';d.route='V02';}
 const result=pack.workflow.evaluateDossier(d,pack.datasets['data/parcours-j5.json'],examples.model_reference,'2026-11-16');out={example:choice,dossier:d,result};
 $('#workflow-result').innerHTML='<p class="badge">'+(result.result==='SIMULATION_COHERENTE'?'EXEMPLE FICTIF COHÉRENT':'CONTRÔLE BLOQUÉ')+'</p><p><strong>Exécution financière : jamais autorisée.</strong> '+safe(result.warning)+'</p><p>'+result.errors.length+' anomalie(s) détectée(s) ; '+result.required_evidence.length+' type(s) de pièces requis.</p>'+ (result.errors.length?'<ul>'+result.errors.map(e=>'<li><strong>'+safe(e.code.replaceAll('_',' '))+'</strong> — '+safe(e.detail)+'</li>').join('')+'</ul>':'<p>La cohérence des déclarations ne prouve ni la réalité des pièces ni la validité des droits.</p>');
 };$('#workflow-case').addEventListener('change',run);$('#workflow-export').addEventListener('click',()=>download('ethigone-controle-fictif.json',out));run();
}
})();
