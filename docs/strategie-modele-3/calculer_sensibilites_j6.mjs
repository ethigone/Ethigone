import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {calculate} from './calculer_j4.mjs';
const d=JSON.parse(readFileSync(new URL('./data/operations-j4.json',import.meta.url),'utf8'));
const variants=[
['base',{},[-1132.5,-1121.25,-1740]],
['ticket_2500',{target_ticket:2500},[82.5,633.75,150]],
['ticket_2500_volume_3',{target_ticket:2500,monthly_operations:3},[-417.5,133.75,-350]],
['ticket_2500_acceptation_20pct',{target_ticket:2500,acceptance_rate:0.2},[-386.25,165,-318.75]],
['ticket_500_service_10',{onboarding_cost:4,investor_service_cost:6},[-142.5,330.75,-178]],
['ticket_2500_volume_3_acceptation_20pct',{target_ticket:2500,monthly_operations:3,acceptance_rate:0.2},null],
['ticket_2500_retard',{target_ticket:2500},null]];
const results=[];
for(const [name,overrides,expected] of variants)for(const [i,id] of ['O1','O2','O3'].entries()){
 const scenario=name.endsWith('_retard')?'retard':'base';
 const v=calculate(d,id,scenario,overrides);
 // Contre-calcul indépendant du résultat ETHIGONE, sans lire les expressions du moteur.
 const n=Math.ceil(v.investor_target/v.target_ticket);
 const refus=(1-v.acceptance_rate)/v.acceptance_rate*v.rejected_cost;
 const abandon=v.accepted_cost+refus+v.cancel_external+n*(v.onboarding_cost+v.refund_cost);
 const cout=v.accepted_cost+refus+n*(v.onboarding_cost+v.investor_service_cost)+v.delay_days*v.ethi_delay_per_day+abandon*(1-v.funding_success_rate)/v.funding_success_rate+v.monthly_overhead/v.monthly_operations;
 const independent=Math.round((v.ethi_fee-cout)*100)/100;
 assert.equal(v.ethi_profit,independent);
 if(expected)assert.equal(v.ethi_profit,expected[i]);
 assert.equal(v.check_tickets,0);
 results.push({operation_id:id,niche_id:'N0'+(i+1),variant:name,scenario,overrides,status:'HYPOTHESE',investor_target:v.investor_target,participants:v.investor_count,regular_ticket:v.regular_ticket,last_ticket:v.last_ticket,ethi_fee:v.ethi_fee,ethi_profit:v.ethi_profit,independent_profit:independent,passed:true});
}
const proof={as_of:'2026-11-16',status:'HYPOTHESE',tests_passed:true,cases:results.length,financial_execution_authorized:false,price_or_ticket_adopted:false,method:'Moteur J4 inchangé + contre-calcul arithmétique distinct des coûts ETHIGONE pour 21 variantes. Les seuils de volonté de payer ne sont pas validés.',results};
if(process.argv.includes('--write'))writeFileSync(new URL('./data/sensibilites-j6.json',import.meta.url),JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify(proof));
