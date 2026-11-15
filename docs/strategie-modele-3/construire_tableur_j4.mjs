/** Auteur XLSX : @oai/artifact-tool. Exécuter dans un répertoire temporaire
 * disposant de cette dépendance. Arguments : dossier de ce lot, dossier sortie.
 * Le moteur autonome calculer_j4.mjs ne dépend pas de cette bibliothèque.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const [root,outputDir]=process.argv.slice(2);
if(!root||!outputDir)throw Error('Usage : construire_tableur_j4.mjs DOSSIER_LOT DOSSIER_SORTIE');
const {rows,toExcel,calculate}=await import(pathToFileURL(path.join(root,'calculer_j4.mjs')));
const data=JSON.parse(await fs.readFile(path.join(root,'data/operations-j4.json'),'utf8'));
await fs.mkdir(outputDir,{recursive:true});
const wb=Workbook.create();
const sheets=Object.fromEntries(['Synthese','Hypotheses','Calculs','Comparateur'].map(name=>[name,wb.worksheets.add(name)]));
const fmtMoney='#,##0.00;(#,##0.00);"–"';
const fmtNumber='#,##0;(#,##0);"–"';
const fmtRatio='0.0%;(0.0%);"–"';
const cols=['D','E','F'];
const put=(s,cell,value)=>s.getRange(cell).values=[[value]];
const formula=(s,cell,value)=>s.getRange(cell).formulas=[[value]];
function baseStyle(s,last){
 s.showGridLines=false;
 s.getRange(`A1:B${last}`).format.columnWidth=2;
 s.getRange(`C1:C${last}`).format.columnWidth=77;
 s.getRange(`D1:F${last}`).format.columnWidth=20;
 s.getRange(`G1:G${last}`).format.columnWidth=3;
 s.getRange(`H1:H${last}`).format.columnWidth=74;
 s.getRange(`C1:H${last}`).format.font={name:'Arial',size:10,color:'#172333'};
 s.getRange(`C1:H${last}`).format.rowHeight=24;
 s.getRange(`C1:H${last}`).format.verticalAlignment='center';
 s.getRange(`D1:F${last}`).setNumberFormat(fmtMoney);
 s.getRange(`D1:F${last}`).format.horizontalAlignment='right';
 s.getRange('C2').format.font={name:'Arial',size:15,bold:true,color:'#172333'};
 s.getRange('C3:F3').format.borders={bottom:{style:'thin',color:'#596B80'}};
}
function header(s,r){
 s.getRange(`C${r}:F${r}`).values=[['Indicateur','N01 Filtration','N02 Emballages','N03 PC']];
 s.getRange(`C${r}:F${r}`).format={fill:'#243A53',font:{bold:true,color:'#FFFFFF'},horizontalAlignment:'center',rowHeight:28};
}
function band(s,r,label){
 put(s,`C${r}`,label);s.getRange(`C${r}:F${r}`).format.fill='#E8EDF3';s.getRange(`C${r}:F${r}`).format.font.bold=true;
}
function caseLink(s){put(s,'C4','Scénario choisi');formula(s,'D4',"='Hypotheses'!E4");s.getRange('D4:F4').format.font.color='#00803D';}
function formatUnit(s,r,unit){s.getRange(`D${r}:F${r}`).setNumberFormat(unit==='ratio'?fmtRatio:['nombre','binaire','jours'].includes(unit)?fmtNumber:fmtMoney);}
const h=sheets.Hypotheses;baseStyle(h,115);h.tabColor='#677E99';put(h,'C2','Hypothèses modifiables');put(h,'C4','Scénario : 1 base, 2 perte, 3 retard, 4 collecte');put(h,'D4',1);h.getRange('D4').setNumberFormat('0');
formula(h,'E4','=CHOOSE(D4,"Base","Perte","Retard","Collecte 80 %")');
h.getRange('D4').format.fill='#FFF2CC';h.getRange('D4').format.font.color='#0000FF';h.getRange('E4').format.font.color='#00803D';
h.getRange('D4').dataValidation={rule:{type:'whole',operator:'between',formula1:1,formula2:4}};
put(h,'C5','Cellules jaunes : entrées fictives. Résultats avant impôts sur bénéfices.');
put(h,'H5','Provenance commune : J4-H00, cadrage de simulation du 15/11/2026.');
header(h,7);const inputRows={};let hr=8;
for(const p of data.parameters){inputRows[p.key]=hr;put(h,`C${hr}`,p.label);h.getRange(`D${hr}:F${hr}`).values=[data.operations.map(o=>p.values[o.id])];h.getRange(`D${hr}:F${hr}`).format.fill='#FFF2CC';h.getRange(`D${hr}:F${hr}`).format.font.color='#0000FF';formatUnit(h,hr,p.unit);put(h,`H${hr}`,`HYPOTHÈSE — ${p.unit}`);if(p.integer)h.getRange(`D${hr}:F${hr}`).dataValidation={rule:{type:'whole',operator:'between',formula1:p.min,formula2:p.max}};hr++;}
hr+=1;band(h,hr++,'Paramètres actifs du scénario (modifier les cas sous chaque ligne)');
const caseRows={};
for(const p of data.case_parameters){inputRows[p.key]=hr;caseRows[p.key]=hr;put(h,`C${hr}`,p.label+' — actif');h.getRange(`C${hr}:F${hr}`).format.fill='#E8EDF3';h.getRange(`C${hr}:F${hr}`).format.font.bold=true;formatUnit(h,hr,p.unit);put(h,`H${hr}`,'HYPOTHÈSE — sélection du seul scénario en D4');
 for(const col of cols)formula(h,`${col}${hr}`,`=CHOOSE($D$4,${[1,2,3,4].map(n=>col+(hr+n)).join(',')})`);
 for(let i=0;i<4;i++){const rr=hr+i+1;put(h,`C${rr}`,data.cases[i].name);h.getRange(`D${rr}:F${rr}`).values=[[data.cases[i].values[p.key],data.cases[i].values[p.key],data.cases[i].values[p.key]]];h.getRange(`D${rr}:F${rr}`).format.fill='#FFF2CC';h.getRange(`D${rr}:F${rr}`).format.font.color='#0000FF';formatUnit(h,rr,p.unit);}
 hr+=5;
}
h.freezePanes.freezeRows(7);
const c=sheets.Calculs;baseStyle(c,155);put(c,'C2','Calculs et trésorerie du lot');caseLink(c);put(c,'C5','Lecture : opération, cash daté, actifs, partage, trois parties, seuils.');header(c,6);
put(c,'C7','Entrées utilisables : 1 oui / 0 non');c.getRange('D7:F7').setNumberFormat('0');
const refs={};for(let i=0;i<3;i++){
 const col=cols[i];refs[col]={};const checks=[];
 for(const p of [...data.parameters,...data.case_parameters]){const ref=`'Hypotheses'!${col}${inputRows[p.key]}`;refs[col][p.key]=ref;checks.push(`ISNUMBER(${ref})`,`${ref}>=${p.min}`,`${ref}<=${p.max}`);if(p.integer)checks.push(`${ref}=INT(${ref})`);}
 checks.push(`${refs[col].deposit_rate}<=${refs[col].price_factor}`,`OR(${refs[col].due_fraction}=1,${refs[col].delay_days}=60)`);
 formula(c,`${col}7`,`=IF(AND(${checks.join(',')}),1,0)`);
}
const calcRows={};let cr=9,section='';
for(const r of rows){if(r.section!==section){section=r.section;band(c,cr++,section);}calcRows[r.key]=cr;put(c,`C${cr}`,r.label);put(c,`H${cr}`,r.unit);formatUnit(c,cr,r.unit);for(const col of cols){const expression=`=IF(${col}$7=1,${toExcel(r.expr,refs[col])},NA())`;formula(c,`${col}${cr}`,expression);c.getRange(`${col}${cr}`).format.font.color=expression.includes('Hypotheses')?'#00803D':'#172333';refs[col][r.key]=col+cr;}if(r.section==='Contrôles')c.getRange(`D${cr}:F${cr}`).setNumberFormat('0.00');cr++;}
c.freezePanes.freezeRows(6);
const s=sheets.Synthese;baseStyle(s,44);s.tabColor='#243A53';put(s,'C2','ETHIGONE — économie de trois lots');caseLink(s);put(s,'C5','Montants en EUR. Simulations anonymisées au 15/11/2026, aucun devis ni contrat validé.');header(s,7);
const summaryKeys=[
 ['Financement et opération',null],['investor_target','Capital investisseurs cible'],['investor_count','Participants au ticket indicatif'],['execute','Exécution financée : 1 oui / 0 non'],['project_profit','Résultat opération avant impôt'],['cash60','Cash à J60 après capitaux'],['ar60_net','Créances nettes estimées à J60'],['funding_gap','Besoin complémentaire non financé'],
 ['Résultats des trois parties',null],['operator_profit','Opérateur : prestation et capital, avant impôt'],['investor_profit_net','Investisseurs : après conversion, avant impôt'],['ethi_profit','ETHIGONE : coûts complets, avant impôt'],
 ['Seuils conditionnels',null],['minimum_ticket','Ticket moyen minimal pour équilibre ETHIGONE'],['max_investors','Nombre maximal de participants compatible'],['fee_break_even','Honoraires HT nécessaires au ticket testé'],['break_even_operations','Opérations abouties / mois pour équilibre'],['break_even_unit_price','Prix unitaire de vente HT pour équilibre du lot'],
 ['Collecte et clôture',null],['investor_refund','Capital EUR remboursé si sous-collecte'],['refund_external_need','Frais d’abandon à financer par ETHIGONE'],['investor_distribution','Versement investisseurs simulé à clôture'],['cash150','Cash final avant répartition']
];let sr=8;
for(const [key,label] of summaryKeys){if(label===null){band(s,sr++,key);continue;}put(s,`C${sr}`,label);for(const col of cols)formula(s,`${col}${sr}`,`='Calculs'!${col}${calcRows[key]}`);formatUnit(s,sr,rows.find(r=>r.key===key).unit);if(['ethi_profit','operator_profit','investor_profit_net','project_profit'].includes(key))s.getRange(`D${sr}:F${sr}`).conditionalFormats.add('cellIs',{operator:'lessThan',formula:0,format:{fill:'#FBE5E3',font:{color:'#A61C1C',bold:true}}});sr++;}
put(s,'C33','Les résultats ne sont ni garantis, ni des marges observées.');put(s,'C34','« n.a. » : aucun seuil fini ou mesure non applicable.');put(s,'C35','Changer Hypotheses!D4, puis les cellules jaunes du scénario choisi.');put(s,'C36','L’égalité de partage suppose des capitaux exposés aux pertes.');put(s,'C37','Les distributions sont bloquées si un déficit de cash existe.');
put(s,'H9','Les petits tickets augmentent les coûts de service.');put(s,'H12','Cash et créance sont deux actifs différents.');put(s,'H20','Seuils de simulation ; aucun ticket adopté.');put(s,'H26','Abandon : achat arrêté. Frais hors remboursement.');
const p=sheets.Comparateur;baseStyle(p,37);put(p,'C2','Comparateur public Lita France');caseLink(p);put(p,'C5','Barème seul ; aucun coût ajouté au modèle principal, aucun accord acquis.');header(p,7);p.getRange('C7:F7').values=[['Barème commun','Valeur',null,null]];p.getRange('E7:F7').format.fill='#FFFFFF';
const compInputs=[['Fixe entreprise minimum HT',2000],['Fixe entreprise maximum HT',3000],['Commission entreprise HT / collecte',.08],['Seuil investisseur 1',15000],['Seuil investisseur 2',30000],['Taux investisseur sous seuil 1 TTC',.035],['Taux investisseur sous seuil 2 TTC',.025],['Taux investisseur dès seuil 2 TTC',.015],['TVA hypothétique sur frais entreprise',.2]];
for(let i=0;i<compInputs.length;i++){const r=9+i;put(p,`C${r}`,compInputs[i][0]);put(p,`D${r}`,compInputs[i][1]);p.getRange(`D${r}`).format.font.color='#0000FF';p.getRange(`D${r}`).format.fill='#FFF2CC';p.getRange(`D${r}`).setNumberFormat([11,14,15,16,17].includes(r)?fmtRatio:fmtMoney);put(p,`H${r}`,r===17?'HYPOTHÈSE fiscale, pas un tarif TTC confirmé':'CONFIRMÉ : barème public, relu le 15/11/2026');}
band(p,18,'Application au capital nominal, en EUR (sans projet réel)');header(p,19);
const labels={20:'Base de collecte simulée',21:'Frais entreprise, borne basse HT',22:'Frais entreprise, borne haute HT',23:'Décaissement borne basse, TVA hypothétique',24:'Décaissement borne haute, TVA hypothétique',25:'Frais investisseurs additionnels TTC'};
for(const [r,label]of Object.entries(labels))put(p,'C'+r,label);
for(const col of cols){formula(p,col+'20',`='Calculs'!${col}${calcRows.investor_target}`);formula(p,col+'21',`=$D$9+$D$11*${col}20`);formula(p,col+'22',`=$D$10+$D$11*${col}20`);formula(p,col+'23',`=${col}21*(1+$D$17)`);formula(p,col+'24',`=${col}22*(1+$D$17)`);const ticket=`'Calculs'!${col}${calcRows.regular_ticket}`,last=`'Calculs'!${col}${calcRows.last_ticket}`,n=`'Calculs'!${col}${calcRows.investor_count}`;const fee=t=>`${t}*IF(${t}<$D$12,$D$14,IF(${t}<$D$13,$D$15,$D$16))`;formula(p,col+'25',`=ROUND(MAX(0,${n}-1)*${fee(ticket)}+${fee(last)},2)`);}
put(p,'C28','Les 5 % de suivi concernent une holding dédiée ; exclus de ce modèle.');put(p,'C29','Un barème actions ne devient pas un contrat de financement de lot.');put(p,'C30','EthisX : tarif complet inconnu. Provisions génériques dans les hypothèses.');put(p,'C32','Source J4-S01 : politique de prix Lita, consultée le 15/11/2026');put(p,'H32','https://lita.co/fr/prix');put(p,'C33','Source J4-S02 : CGU du 1/10/2026, consultées le 15/11/2026');put(p,'H33','https://lita.co/fr/cgu');
// Contrôles moteur XLSX sur les quatre cas, trois opérations et chaque formule.
let comparisons=0;const failures=[];
function compare(opId,caseId,overrides={}){const i=data.operations.findIndex(o=>o.id===opId),col=cols[i],expected=calculate(data,opId,caseId,overrides);for(const r of rows){const actual=c.getRange(`${col}${calcRows[r.key]}`).values[0][0];const want=expected[r.key]===null?'n.a.':expected[r.key];comparisons++;if(typeof want==='number'?typeof actual!=='number'||Math.abs(actual-want)>1e-6:actual!==want)failures.push({opId,caseId,key:r.key,want,actual});}}
for(let j=0;j<4;j++){put(h,'D4',j+1);wb.recalculate();for(const o of data.operations)compare(o.id,data.cases[j].id);if(process.env.J4_NATIVE_QA_DIR){await fs.mkdir(process.env.J4_NATIVE_QA_DIR,{recursive:true});const qa=await SpreadsheetFile.exportXlsx(wb);await qa.save(path.join(process.env.J4_NATIVE_QA_DIR,`cas-${data.cases[j].id}.xlsx`));}}
put(h,'D4',1);const buyRow=inputRows.purchase_unit;put(h,`D${buyRow}`,41);wb.recalculate();compare('O1','base',{purchase_unit:41});put(h,`D${buyRow}`,40);
// Champ absent d’un cas inactif : base conservée ; sélection du cas vide : erreur visible.
const testCell=`D${caseRows.price_factor+2}`;const original=h.getRange(testCell).values[0][0];put(h,testCell,null);wb.recalculate();compare('O1','base');put(h,'D4',2);wb.recalculate();const missingResult=c.getRange(`D${calcRows.project_profit}`).values[0][0];if(typeof missingResult==='number')failures.push({key:'missing_input_must_not_be_zero',actual:missingResult});put(h,testCell,original);put(h,'D4',1);
wb.recalculate();
if(failures.length){await fs.writeFile(path.join(outputDir,'erreurs-tableur.json'),JSON.stringify(failures,null,2));throw Error('Écarts de calcul : '+failures.length+' '+JSON.stringify(failures.slice(0,3)));}
const errorScan=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},maxChars:4000});
await fs.writeFile(path.join(outputDir,'controle-formules.txt'),errorScan.ndjson);
const summaryInspect=await wb.inspect({kind:'table',range:'Synthese!C7:F30',include:'values,formulas',tableMaxRows:24,tableMaxCols:4,maxChars:5000});
await fs.writeFile(path.join(outputDir,'inspection-synthese.txt'),summaryInspect.ndjson);
for(const [name,range,file]of [['Synthese','C2:H37','synthese'],['Hypotheses','C2:H28','hypotheses'],['Hypotheses',`C${caseRows.price_factor}:H${caseRows.price_factor+14}`,'scenarios'],['Calculs','C2:H30','calculs'],['Calculs',`C${calcRows.cf0-1}:H${calcRows.cash150}`,'tresorerie'],['Comparateur','C2:H33','comparateur']]){const blob=await wb.render({sheetName:name,range,scale:1,format:'png'});await fs.writeFile(path.join(outputDir,file+'.png'),new Uint8Array(await blob.arrayBuffer()));}
const xlsx=await SpreadsheetFile.exportXlsx(wb);await xlsx.save(path.join(outputDir,'ETHIGONE_J4_MODELE.xlsx'));
await fs.writeFile(path.join(outputDir,'controle-tableur.json'),JSON.stringify({as_of:data.as_of,engine:'@oai/artifact-tool',comparisons,all_numeric_rows_match:failures.length===0,cases_tested:4,operations_tested:3,input_mutation_test:true,missing_inactive_case_test:true,missing_active_case_visible:true,native_excel_or_libreoffice_test:false,formula_error_scan:errorScan.ndjson,inputRows,caseRows,calcRows},null,2)+'\n');
console.log(JSON.stringify({comparisons,failures:failures.length,xlsx:'ETHIGONE_J4_MODELE.xlsx',rendered_ranges:6,formula_error_scan:errorScan.ndjson}));
