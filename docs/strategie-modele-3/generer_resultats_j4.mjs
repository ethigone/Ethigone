import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {calculate,rows} from './calculer_j4.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(fs.readFileSync(path.join(root,'data/operations-j4.json'),'utf8'));
const results={schema_version:1,as_of:data.as_of,model_version:data.version,status:'HYPOTHESE',kind:'Résultats calculés, non observations commerciales',engine:'calculer_j4.mjs',cases:[],alternatives:[],comparators:[]};
for(const op of data.operations){
 for(const c of data.cases){const r=calculate(data,op.id,c.id);results.cases.push({operation_id:op.id,case_id:c.id,status:'HYPOTHESE',values:Object.fromEntries(rows.map(x=>[x.key,r[x.key]]))});}
 const base=calculate(data,op.id);
 for(const [id,label,overrides] of [
  ['reference','Hypothèses de base',{}],
  ['acompte40','Acompte client de 40 %',{deposit_rate:.4}],
  ['credit45','75 % achat différé, paiement J45',{supplier_credit_rate:.75}],
  ['credit90','75 % achat différé, paiement J90',{supplier_credit_rate:.75,supplier_late:1}],
  ['apport_double','Apport opérateur doublé',{operator_capital:base.operator_capital*2}],
  ['ticket_minimum','Ticket au seuil économique calculé',{target_ticket:base.minimum_ticket}]
 ]){if(overrides.target_ticket===null)continue;const r=calculate(data,op.id,'base',overrides);results.alternatives.push({operation_id:op.id,id,label,status:'HYPOTHESE',available:false,sharia_validated:false,overrides,investor_target:r.investor_target,ethi_profit:r.ethi_profit,investor_count:r.investor_count,minimum_ticket:r.minimum_ticket,break_even_operations:r.break_even_operations,project_profit:r.project_profit,funding_gap:r.funding_gap});}
 const rate=t=>t<15000?.035:t<30000?.025:.015;
 const feesInv=Math.round((Math.max(0,base.investor_count-1)*base.regular_ticket*rate(base.regular_ticket)+base.last_ticket*rate(base.last_ticket))*100)/100;
 results.comparators.push({operation_id:op.id,source_ids:['J4-S01','J4-S02'],status:'HYPOTHESE',basis_eur:base.investor_target,description:'Application arithmétique du barème public Lita, sans admission, devis ni adoption. Ne pas additionner au modèle principal.',enterprise_low_ht:2000+.08*base.investor_target,enterprise_high_ht:3000+.08*base.investor_target,investors_fees_added_ttc:feesInv,dedicated_holding_fee_included:false,ethigone_quote:false});
}
fs.writeFileSync(path.join(root,'data/resultats-j4.json'),JSON.stringify(results,null,2)+'\n');
fs.writeFileSync(path.join(root,'data/formules-j4.json'),JSON.stringify({schema_version:1,model_version:data.version,description:'Arbres d’expression communs au moteur JavaScript et aux formules XLSX; aucune requête réseau.',rows},null,2)+'\n');
console.log(JSON.stringify({cases:results.cases.length,alternatives:results.alternatives.length,comparators:results.comparators.length}));
