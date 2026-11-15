import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {calculate} from './calculer_j4.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const d=JSON.parse(fs.readFileSync(path.join(root,'data/operations-j4.json'),'utf8'));
let checks=0;const ok=(condition,msg)=>{assert(condition,msg);checks++;};
const near=(a,b,msg,tol=1e-7)=>ok(Math.abs(a-b)<tol,msg+': '+a+' / '+b);
const calc=(id='O1',c='base',overrides={})=>calculate(d,id,c,overrides);
// Oracles arithmétiques indépendants, calculés sans réutiliser les expressions.
const oracles={O1:[22440,6120,2748,-1132.5,2040],O2:[32950,9450,4180,-1121.25,1029.69],O3:[35450,6150,2860,-1740,1865.79]};
for(const o of d.operations){
 const b=calc(o.id);['investor_target','project_profit','operator_profit','ethi_profit','minimum_ticket'].forEach((k,i)=>near(b[k],oracles[o.id][i],o.id+' '+k));
 for(const c of d.cases){const r=calc(o.id,c.id);near(r.check_cash_profit,0,'Cash / résultat');near(r.check_capital_split,0,'Partage / cash');near(r.check_tickets,0,'Arrondis des tickets');ok(Number.isInteger(r.investor_count),'Nombre entier');near(r.execute*r.deposit+r.cf60+r.receivable_collectible*(1-r.due_fraction),r.sales*(1+r.vat_sales)-r.bad_debt,'Acompte et solde sans double compte');if(r.funding_gap===0)ok(Math.min(...[0,30,45,60,90,120,150].map(x=>r['cash'+x]))>=-1e-7,'Pas de déficit masqué');}
 const loss=calc(o.id,'perte');ok(loss.project_profit<0&&loss.investor_gain===0&&loss.operator_gain===0,'Perte sans bénéfice distribué');
 const delay=calc(o.id,'retard');ok(delay.ar60_net>0,'Créance restante');ok(delay.cash60<b.cash60,'Décalage réel de cash');near(b.project_profit-delay.project_profit,b.holding_per_day*60,'Coût du retard');near(b.ethi_profit-delay.ethi_profit,b.ethi_delay_per_day*60,'Suivi interne retard');
 const u=calc(o.id,'collecte');near(u.project_profit,0,'Aucune opération sous-collectée');near(u.investor_refund,u.capital_collected,'Restitution EUR reçu');near(u.operator_profit,-b.operator_abort_cost,'Charge opérateur abandon');near(u.ethi_profit,-u.abort_cost-u.overhead_allocation,'Charge ETHIGONE abandon');ok(u.investor_profit_net<0,'Conversion irrécouvrable');ok(u.refund_external_need>0,'Payeur des frais externes identifié');
 const t=calc(o.id,'base',{target_ticket:b.minimum_ticket});ok(t.ethi_profit>=-1e-7,'Ticket seuil couvre coûts');ok(t.investor_count===b.max_investors,'Seuil entier exact');
 const below=calc(o.id,'base',{target_ticket:b.minimum_ticket-.01});ok(below.ethi_profit<0,'Un centime sous seuil crée déficit');
 const a=calc(o.id,'base',{deposit_rate:.4});ok(a.investor_target<=b.investor_target,'Acompte réduit capital');near(a.project_profit,b.project_profit,'Acompte ne crée pas bénéfice');
 const c45=calc(o.id,'base',{supplier_credit_rate:.75});near(c45.investor_target,b.investor_target,'Crédit avant client ne réduit pas pic');
 const c90=calc(o.id,'base',{supplier_credit_rate:.75,supplier_late:1});ok(c90.investor_target<b.investor_target,'Crédit après client réduit pic');near(c90.project_profit,b.project_profit,'Crédit ne supprime pas achat');
 const v=calc(o.id,'base',{vat_recovery:0});near(b.project_profit-v.project_profit,b.input_vat,'TVA non déduite est une charge');near(v.check_cash_profit,0,'TVA cash réconciliée');
 const lowAccept=calc(o.id,'base',{acceptance_rate:.2});ok(lowAccept.ethi_profit<b.ethi_profit,'Plus de refus augmente coûts');
 const fx=calc(o.id,'base',{fx_factor:.8});near(fx.stable_units,b.stable_units/.8,'Change affecte unités nécessaires');near(fx.project_profit,b.project_profit,'Change investisseurs non imputé deux fois au lot');
 const ticket100=calc(o.id,'base',{target_ticket:100});ok(ticket100.ethi_profit<b.ethi_profit,'Coût retail 100 EUR');
}
// Défauts révélés lors de la contre-revue indépendante : fraction de centime et égalité monétaire.
const fractional=calc('O1','base',{ethi_fixed:900.001});ok(fractional.cash45>=0,'Pic financé au centime supérieur');near(fractional.capital_required,28440.01,'Plafond du pic');
const full=calc('O1','base',{ethi_fixed:900.01,vat_recovery:0});near(full.execute,1,'100 % collecté malgré flottants');ok(full.cash45>=-1e-7,'Pas de manque à 100 %');
const catastrophic=calc('O1','perte',{price_factor:.5,bad_debt_rate:.9,due_fraction:.1,delay_days:60,holding_per_day:500});ok(catastrophic.funding_gap>0,'Déficit incident visible');near(catastrophic.investor_distribution,0,'Distribution bloquée');ok(catastrophic.break_even_unit_price===null,'Pas de faux seuil lorsque coefficient négatif');
const noInv=calc('O1','base',{operator_capital:100000});near(noInv.investor_count,0,'Sans investisseur');ok(noInv.minimum_ticket===null&&noInv.investor_return===null,'Mesures non applicables non nulles numériquement');near(noInv.check_cash_profit,0,'Surcapitalisation reste du cash');
for(const overrides of [{acceptance_rate:0},{target_ticket:0},{purchase_unit:null},{collection_ratio:1.1},{due_fraction:.5,delay_days:0}]){assert.throws(()=>calc('O1','base',overrides));checks++;}
const report={as_of:d.as_of,checks,passed:true,independent_oracles:15,scope:'Conservation, capitaux au centime, scénarios, actifs, TVA, refus, seuils entiers, alternatives, change, cas invalides.'};
fs.writeFileSync(path.join(root,'preuves/j4-calculs.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
