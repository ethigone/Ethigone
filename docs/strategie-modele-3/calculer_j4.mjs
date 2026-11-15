/** Modèle économique illustratif J4. Aucun accès réseau, aucune transaction.
 * Expressions uniques : calcul JS, formules XLSX et futur simulateur HTML.
 * Tous les paramètres économiques sont des HYPOTHESES, pas des devis.
 */
const f=(op,...args)=>({op,args});
const add=(...a)=>f('SUM',...a), sub=(a,b)=>f('-',a,b), mul=(...a)=>f('*',...a), div=(a,b)=>f('/',a,b);
const max=(...a)=>f('MAX',...a), min=(...a)=>f('MIN',...a), round=a=>f('ROUND',a,2);
const iff=(c,a,b)=>f('IF',c,a,b), gt=(a,b)=>f('>',a,b), ge=(a,b)=>f('>=',a,b), eq=(a,b)=>f('=',a,b);
const floor=a=>f('ROUNDDOWN',a,0), ceil=a=>f('ROUNDUP',a,0);
const R=[]; const row=(key,label,expr,unit='EUR',section='Opération')=>R.push({key,label,unit,section,expr});
row('sales_budget','Ventes budgétées HT',mul('quantity','sale_unit'));
row('goods','Achats HT',mul('quantity','purchase_unit'));
row('ethi_fee','Honoraires ETHIGONE HT hypothétiques',add('ethi_fixed',mul('ethi_rate','sales_budget')));
row('services','Services externes et prestations HT',add('logistics','inspection','warranty_paid','operator_fee','external_project','ethi_fee'));
row('cost_ht','Coût opération HT',add('goods','services'));
row('input_vat','TVA facturée sur achats et services',add(mul('goods','vat_goods'),mul('services','vat_services')));
row('deductible_vat','TVA déductible HYPOTHÈSE',mul('input_vat','vat_recovery'));
row('economic_cost','Coût économique avant incident',add('cost_ht',sub('input_vat','deductible_vat')));
row('cash_cost','Décaissements TTC avant retard',add('cost_ht','input_vat'));
row('deposit','Acompte client TTC (conditionnel)',mul('sales_budget',add(1,'vat_sales'),'deposit_rate'));
row('supplier_credit','Part des achats TTC différée',mul('goods',add(1,'vat_goods'),'supplier_credit_rate'));
row('baseline_vat_balance','Solde TVA nominal',sub(mul('sales_budget','vat_sales'),'deductible_vat'));
row('b0','Flux nominal J0 hors capitaux',sub('deposit',sub('cash_cost','supplier_credit')), 'EUR','Financement nominal');
row('b45','Flux nominal J45',sub(0,add(mul('supplier_credit',sub(1,'supplier_late')),max(0,'baseline_vat_balance'))),'EUR','Financement nominal');
row('b60','Flux nominal J60',sub(mul('sales_budget',add(1,'vat_sales')),'deposit'),'EUR','Financement nominal');
row('b90','Flux nominal J90',sub(0,mul('supplier_credit','supplier_late')),'EUR','Financement nominal');
row('b150','Flux nominal J150 (crédit TVA)',max(0,sub(0,'baseline_vat_balance')),'EUR','Financement nominal');
row('bc0','Cumul nominal J0','b0','EUR','Financement nominal');
row('bc45','Cumul nominal J45',add('bc0','b45'),'EUR','Financement nominal');
row('bc60','Cumul nominal J60',add('bc45','b60'),'EUR','Financement nominal');
row('bc90','Cumul nominal J90',add('bc60','b90'),'EUR','Financement nominal');
row('bc150','Cumul nominal J150',add('bc90','b150'),'EUR','Financement nominal');
row('capital_required','Pic de financement nominal arrondi au centime supérieur',div(ceil(mul(100,max(0,sub(0,min('bc0','bc45','bc60','bc90','bc150'))))),100),'EUR','Financement nominal');
row('investor_target','Capital investisseurs cible',div(ceil(mul(100,max(0,sub('capital_required','operator_capital')))),100),'EUR','Financement nominal');
row('investor_count','Nombre entier de participants',iff(gt('investor_target',0),ceil(div('investor_target','target_ticket')),0),'nombre','Financement nominal');
row('regular_ticket','Souscription égale arrondie au centime inférieur',iff(gt('investor_count',0),div(floor(div(mul('investor_target',100),'investor_count')),100),0),'EUR','Financement nominal');
row('last_ticket','Dernière souscription, ajustement centimes',iff(gt('investor_count',0),sub('investor_target',mul(sub('investor_count',1),'regular_ticket')),0),'EUR','Financement nominal');
row('capital_collected','Capital reçu après conversion',round(mul('investor_target','collection_ratio')),'EUR','Financement nominal');
row('execute','Exécution financée : 1 oui / 0 non',iff(ge(f('ROUND',mul('capital_collected',100),0),f('ROUND',mul('investor_target',100),0)),1,0),'binaire','Financement nominal');
row('capital_used','Capitaux engagés si exécution',mul('execute',add('operator_capital','capital_collected')),'EUR','Financement nominal');
row('sales','Ventes HT réalisées dans le scénario',mul('execute','sales_budget','price_factor'));
row('balance_customer','Solde client TTC facturé',mul('execute',sub(mul('sales_budget','price_factor',add(1,'vat_sales')),'deposit')));
row('bad_debt','Perte client TTC, sans reprise de TVA',mul('balance_customer','bad_debt_rate'));
row('receivable_collectible','Solde client recouvrable HYPOTHÈSE',sub('balance_customer','bad_debt'));
row('late_cost','Frais de retard HT, coûts réels simulés',mul('delay_days','holding_per_day','execute'));
row('late_vat','TVA sur frais de retard',mul('late_cost','vat_services'));
row('late_vat_credit','Crédit TVA sur retard HYPOTHÈSE',mul('late_vat','vat_recovery'));
row('total_economic_cost','Coût économique du scénario',add(mul('execute','economic_cost'),'late_cost',sub('late_vat','late_vat_credit')));
row('project_profit','Résultat opération avant impôt',sub(sub('sales','total_economic_cost'),'bad_debt'));
row('vat_balance','Solde TVA J45 du scénario',mul('execute',sub(mul('sales_budget','price_factor','vat_sales'),'deductible_vat')));
row('cf0','Flux J0 (acompte et dépenses)',mul('execute','b0'),'EUR','Trésorerie');
row('cf30','Flux J30 (livraison sans encaissement)',0,'EUR','Trésorerie');
row('cf45','Flux J45 (TVA et fournisseur)',sub(0,add(mul('execute','supplier_credit',sub(1,'supplier_late')),max(0,'vat_balance'))),'EUR','Trésorerie');
row('cf60','Flux J60 (client à échéance)',mul('receivable_collectible','due_fraction'),'EUR','Trésorerie');
row('cf90','Flux J90 (fournisseur différé)',sub(0,mul('execute','supplier_credit','supplier_late')),'EUR','Trésorerie');
row('cf120','Flux J120 (retard client et coûts)',sub(mul('receivable_collectible',sub(1,'due_fraction')),add('late_cost','late_vat')),'EUR','Trésorerie');
row('cf150','Flux J150 (crédits TVA supposés reçus)',add(max(0,sub(0,'vat_balance')),'late_vat_credit'),'EUR','Trésorerie');
let prior=null; for(const d of [0,30,45,60,90,120,150]){row('cum'+d,'Cumul hors capitaux J'+d,prior?add(prior,'cf'+d):'cf'+d,'EUR','Trésorerie'); row('cash'+d,'Trésorerie après capitaux J'+d,add('capital_used','cum'+d),'EUR','Trésorerie'); prior='cum'+d;}
row('actual_peak','Pic de besoin du scénario, centime supérieur',div(ceil(mul(100,max(0,sub(0,min(...[0,30,45,60,90,120,150].map(d=>'cum'+d)))))),100),'EUR','Trésorerie');
row('funding_gap','Besoin complémentaire non financé',div(ceil(mul(100,max(0,sub('actual_peak','capital_used')))),100),'EUR','Trésorerie');
row('ar60_gross','Créance client brute à J60',sub('balance_customer','cf60'),'EUR','Actifs');
row('ar60_net','Créance nette estimée à J60',sub('ar60_gross','bad_debt'),'EUR','Actifs');
row('stock0','Stock HT initial (pas un encaissement)',mul('execute','goods'),'EUR','Actifs');
row('stock150','Stock final : tout livré dans ces cas',0,'EUR','Actifs');
row('ar150','Créance finale : encaissée ou passée en perte',0,'EUR','Actifs');
row('investor_cap_share','Part des capitaux à risque investisseurs',iff(gt('capital_used',0),div(mul('execute','capital_collected'),'capital_used'),0),'ratio','Partage hypothétique');
row('investor_gain','Bénéfice investisseurs avant frais et impôt',iff(gt('investor_target',0),round(mul(max(0,'project_profit'),'investor_profit_share')),0),'EUR','Partage hypothétique');
row('investor_loss','Perte investisseurs limitée aux capitaux',round(mul(min(max(0,sub(0,'project_profit')),'capital_used'),'investor_cap_share')),'EUR','Partage hypothétique');
row('operator_gain','Bénéfice résiduel opérateur',sub(max(0,'project_profit'),'investor_gain'),'EUR','Partage hypothétique');
row('operator_loss','Perte opérateur sur capital',sub(min(max(0,sub(0,'project_profit')),'capital_used'),'investor_loss'),'EUR','Partage hypothétique');
row('uncovered_liabilities','Pertes excédant les capitaux',max(0,sub(sub(0,'project_profit'),'capital_used')),'EUR','Partage hypothétique');
row('investor_entitlement','Solde économique investisseurs (pas liquidité)',add(mul('execute','capital_collected'),'investor_gain',sub(0,'investor_loss')),'EUR','Partage hypothétique');
row('operator_entitlement','Solde économique capital opérateur',add(mul('execute','operator_capital'),'operator_gain',sub(0,'operator_loss')),'EUR','Partage hypothétique');
row('distribution_possible','Distribution simulable sans déficit : 1 / 0',iff(eq('funding_gap',0),'execute',0),'binaire','Partage hypothétique');
row('investor_distribution','Versement simulé après clôture',mul('distribution_possible','investor_entitlement'),'EUR','Partage hypothétique');
row('operator_distribution','Versement simulé au capital opérateur',mul('distribution_possible','operator_entitlement'),'EUR','Partage hypothétique');
row('operator_service_profit','Résultat prestation opérateur',mul('execute',sub('operator_fee','operator_internal_cost')),'EUR','Opérateur');
row('operator_profit','Résultat opérateur avant impôt',sub(add('operator_service_profit','operator_gain'),add('operator_loss',mul(sub(1,'execute'),'operator_abort_cost'))),'EUR','Opérateur');
row('stable_capital','Part du capital reçue après conversion',mul('capital_collected','stable_share'),'EUR','Investisseurs');
row('stable_wallets','Nombre estimé de conversions',iff(gt('stable_capital',0),ceil(mul('investor_count','stable_share')),0),'nombre','Investisseurs');
row('conversion_cost','Frais de conversion et réseau payés en plus',add(div(mul('stable_capital','conversion_rate'),sub(1,'conversion_rate')),mul('stable_wallets','network_eur')),'EUR','Investisseurs');
row('fx_effective','EUR par unité stablecoin USD HYPOTHÈSE',mul('eur_per_usd','fx_factor',sub(1,'depeg_rate')),'EUR/unité','Investisseurs');
row('stable_units','Unités stablecoin nécessaires, frais inclus',div(add('stable_capital','conversion_cost'),'fx_effective'),'unités','Investisseurs');
row('investor_refund','Capital reçu remboursé si sous-collecte',mul(sub(1,'execute'),'capital_collected'),'EUR','Investisseurs');
row('investor_profit_net','Résultat investisseurs après conversion, avant impôt',sub(sub('investor_gain','investor_loss'),'conversion_cost'),'EUR','Investisseurs');
row('investor_cash_out','Mise et frais externes investisseurs',add('capital_collected','conversion_cost'),'EUR','Investisseurs');
row('investor_return','Résultat / mise et frais, non annualisé',iff(gt('investor_cash_out',0),div('investor_profit_net','investor_cash_out'),null),'ratio','Investisseurs');
row('rejected_per_approved','Dossiers refusés / dossier accepté',div(sub(1,'acceptance_rate'),'acceptance_rate'),'nombre','ETHIGONE');
row('rejection_allocation','Coût des refus imputé par dossier',mul('rejected_per_approved','rejected_cost'),'EUR','ETHIGONE');
row('abort_cost','Coût ETHIGONE d’une collecte abandonnée',add('accepted_cost','rejection_allocation','cancel_external',mul('investor_count',add('onboarding_cost','refund_cost'))),'EUR','ETHIGONE');
row('failures_per_success','Collectes abandonnées / collecte aboutie',div(sub(1,'funding_success_rate'),'funding_success_rate'),'nombre','ETHIGONE');
row('failure_allocation','Coût des abandons imputé à un succès',mul('abort_cost','failures_per_success'),'EUR','ETHIGONE');
row('overhead_allocation','Charges fixes mensuelles / opérations prévues',div('monthly_overhead','monthly_operations'),'EUR','ETHIGONE');
row('ethi_delay','Coût interne de suivi du retard',mul('delay_days','ethi_delay_per_day'),'EUR','ETHIGONE');
row('ethi_variable_total','Coûts directs et refus sur opération réussie',add('accepted_cost','rejection_allocation',mul('investor_count',add('onboarding_cost','investor_service_cost')),'ethi_delay'),'EUR','ETHIGONE');
row('ethi_revenue','Chiffre d’affaires ETHIGONE HT',mul('execute','ethi_fee'),'EUR','ETHIGONE');
row('ethi_cost','Coût ETHIGONE complet imputé',add(iff(eq('execute',1),add('ethi_variable_total','failure_allocation'),'abort_cost'),'overhead_allocation'),'EUR','ETHIGONE');
row('ethi_profit','Résultat ETHIGONE avant impôt',sub('ethi_revenue','ethi_cost'),'EUR','ETHIGONE');
row('ethi_contribution','Contribution avant charges fixes mensuelles',sub('ethi_fee',add('ethi_variable_total','failure_allocation')),'EUR','Seuils');
row('break_even_operations','Opérations réussies / mois pour équilibre',iff(gt('ethi_contribution',0),ceil(div('monthly_overhead','ethi_contribution')),null),'nombre','Seuils');
row('fixed_cost_for_ticket','Coût par opération hors nombre de participants',add('accepted_cost','rejection_allocation','ethi_delay','overhead_allocation',mul(add('accepted_cost','rejection_allocation','cancel_external'),'failures_per_success')),'EUR','Seuils');
row('cost_per_investor','Coût marginal complet par participant',add('onboarding_cost','investor_service_cost',mul(add('onboarding_cost','refund_cost'),'failures_per_success')),'EUR','Seuils');
row('max_investors','Participants maximum à résultat ETHIGONE >= 0',max(0,floor(div(sub('ethi_fee','fixed_cost_for_ticket'),'cost_per_investor'))),'nombre','Seuils');
row('minimum_ticket','Ticket économique minimum moyen (égalitaire)',iff(gt('investor_target',0),iff(gt('max_investors',0),div(ceil(div(mul('investor_target',100),'max_investors')),100),null),null),'EUR','Seuils');
row('fee_break_even','Honoraires HT nécessaires à équilibre ETHIGONE',add('ethi_variable_total','failure_allocation','overhead_allocation'),'EUR','Seuils');
row('break_even_denominator','Coefficient de vente après défaut',sub(1,mul('bad_debt_rate',add(1,'vat_sales'))),'ratio','Seuils');
row('break_even_unit_price','Prix de vente HT pour équilibre opération',iff(gt('break_even_denominator',0),max(div('deposit',mul('quantity',add(1,'vat_sales'))),div(sub(add('economic_cost','late_cost',sub('late_vat','late_vat_credit')),mul('deposit','bad_debt_rate')),mul('quantity','break_even_denominator'))),null),'EUR/unité','Seuils');
row('refund_external_need','Frais externes d’abandon à financer par ETHIGONE',mul(sub(1,'execute'),add('cancel_external',mul('investor_count','refund_cost'))),'EUR','Collecte insuffisante');
row('check_cash_profit','Écart capitaux + résultat = trésorerie finale',sub('cash150',add('capital_used','project_profit')),'EUR','Contrôles');
row('check_capital_split','Écart partage économique et trésorerie finale',sub(add('investor_entitlement','operator_entitlement'),add('cash150','uncovered_liabilities')),'EUR','Contrôles');
row('check_tickets','Écart total souscriptions au centime',sub(add(mul(max(0,sub('investor_count',1)),'regular_ticket'),'last_ticket'),'investor_target'),'EUR','Contrôles');
export const rows=R;

export function evaluate(expr,v){
  if(expr===null || typeof expr==='number') return expr;
  if(typeof expr==='string'){if(!(expr in v))throw Error('Variable absente: '+expr);return v[expr];}
  const {op,args}=expr;
  if(op==='IF')return evaluate(args[0],v)?evaluate(args[1],v):evaluate(args[2],v);
  const a=args.map(x=>evaluate(x,v)); if(a.some(x=>x===null))throw Error('Valeur indisponible dans '+op);
  switch(op){case 'SUM':return a.reduce((x,y)=>x+y,0);case '-':return a[0]-a[1];case '*':return a.reduce((x,y)=>x*y,1);case '/':if(a[1]===0)throw Error('Division par zéro');return a[0]/a[1];case 'MAX':return Math.max(...a);case 'MIN':return Math.min(...a);case '>':return +(a[0]>a[1]);case '>=':return +(a[0]>=a[1]);case '=':return +(a[0]===a[1]);case 'ROUND':{const n=10**a[1];return Math.sign(a[0])*Math.round((Math.abs(a[0])+1e-10)*n)/n;}case 'ROUNDUP':return Math.sign(a[0])*Math.ceil(Math.abs(a[0])*10**a[1]-1e-10)/10**a[1];case 'ROUNDDOWN':return Math.sign(a[0])*Math.floor(Math.abs(a[0])*10**a[1]+1e-10)/10**a[1];default:throw Error('Opérateur inconnu '+op);}
}
export function toExcel(expr,ref){
  if(expr===null)return '"n.a."'; if(typeof expr==='number')return String(expr); if(typeof expr==='string'){if(!ref[expr])throw Error('Cellule absente '+expr);return ref[expr];}
  const a=expr.args.map(x=>toExcel(x,ref)); return ['-','*','/','>','>=','='].includes(expr.op)?'('+a.join(expr.op)+')':expr.op+'('+a.join(',')+')';
}
export function inputsFor(data,opId,caseId='base',overrides={}){
  const v={}; for(const p of data.parameters)v[p.key]=p.values[opId]; const c=data.cases.find(x=>x.id===caseId);if(!c)throw Error('Cas inconnu');Object.assign(v,c.values,overrides);return v;
}
export function calculate(data,opId,caseId='base',overrides={}){
  const v=inputsFor(data,opId,caseId,overrides);
  for(const p of [...data.parameters,...data.case_parameters]){const x=v[p.key];if(typeof x!=='number'||!Number.isFinite(x)||x<p.min||x>p.max||(p.integer&&!Number.isInteger(x)))throw Error('Entrée invalide: '+p.key);}
  if(v.deposit_rate>v.price_factor)throw Error('Acompte supérieur au montant de vente réduit');
  if(v.due_fraction<1 && v.delay_days!==60)throw Error('Solde tardif modélisé à J120 : retard de 60 jours requis');
  for(const r of rows)v[r.key]=evaluate(r.expr,v); return v;
}
