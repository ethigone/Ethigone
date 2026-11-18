/* Interface locale J8 : le moteur J4 embarqué reste l’unique source de calcul. */
(function () {
  'use strict';
  function init() {
    const app = document.getElementById('simulator-app');
    if (!app) return;
    const pack = window.ETHIGONE_J8;
    if (!pack || !pack.economics) return; // Le contenu statique reste utile.
    const data = pack.datasets['data/operations-j4.json'];
    const engine = pack.economics;
    const $ = id => document.getElementById(id);
    const form = $('simulator-form'), op = $('sim-operation'), scenario = $('sim-case');
    const result = $('sim-results'), error = $('sim-error'), exportButton = $('sim-export');
    const parameters = [...data.parameters, ...data.case_parameters];
    const fields = new Map();
    let snapshot = null;
    const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const number = new Intl.NumberFormat('fr-FR', {minimumFractionDigits:2, maximumFractionDigits:2});
    const money = value => value === null || value === undefined ? 'Indisponible / non applicable' : number.format(value) + ' EUR';
    const format = (value, unit) => value === null || value === undefined ? 'Indisponible / non applicable' : unit === 'ratio' ? number.format(value * 100) + ' %' : unit === 'EUR' ? money(value) : unit === 'binaire' ? (value === 1 ? 'Oui, dans le modèle' : 'Non, dans le modèle') : new Intl.NumberFormat('fr-FR',{maximumFractionDigits:unit === 'nombre' ? 2 : 4}).format(value) + (unit && unit !== 'nombre' ? ' '+unit : '');
    for (const item of data.operations) op.add(new Option(item.id+' — '+item.name,item.id));
    for (const item of data.cases) scenario.add(new Option(item.name,item.id));
    const groups = [
      ['Lot, coûts, TVA et financement', data.parameters.filter(p => !['stable_share','conversion_rate','network_eur','eur_per_usd','accepted_cost','acceptance_rate','rejected_cost','onboarding_cost','investor_service_cost','refund_cost','cancel_external','funding_success_rate','monthly_overhead','monthly_operations','ethi_delay_per_day'].includes(p.key))],
      ['Conversion et coûts complets ETHIGONE', data.parameters.filter(p => ['stable_share','conversion_rate','network_eur','eur_per_usd','accepted_cost','acceptance_rate','rejected_cost','onboarding_cost','investor_service_cost','refund_cost','cancel_external','funding_success_rate','monthly_overhead','monthly_operations','ethi_delay_per_day'].includes(p.key))],
      ['Paramètres du scénario',data.case_parameters]
    ];
    for (const [title, list] of groups) {
      const details = document.createElement('details'); details.className='card';
      const summary = document.createElement('summary'); summary.textContent=title+' — hypothèses modifiables'; details.append(summary);
      const grid = document.createElement('div'); grid.className='grid'; details.append(grid);
      for (const p of list) {
        const wrap=document.createElement('p'), label=document.createElement('label'), input=document.createElement('input'), hint=document.createElement('small');
        input.id='sim-input-'+p.key; input.name=p.key; input.type='number'; input.required=true; input.min=p.min; input.max=p.max; input.step=p.integer ? '1' : 'any'; input.inputMode='decimal';
        label.htmlFor=input.id; label.textContent=p.label+' ('+p.unit+')';
        hint.id=input.id+'-hint'; hint.textContent='De '+p.min+' à '+p.max+(p.integer ? ', entier.' : '.')+' HYPOTHÈSE.'; input.setAttribute('aria-describedby',hint.id);
        wrap.append(label,document.createElement('br'),input,document.createElement('br'),hint); grid.append(wrap); fields.set(p.key,input);
      }
      $('sim-parameters').append(details);
    }
    function invalidate(message) { snapshot=null; result.replaceChildren(); exportButton.disabled=true; error.textContent=message; error.hidden=!message; }
    function table(title, rows, caption) {
      return '<section class="card"><h2>'+esc(title)+'</h2><div class="table-wrap"><table><caption>'+esc(caption || 'HYPOTHÈSES — EUR avant impôt sauf indication')+'</caption><tbody>'+rows.map(([label,value])=>'<tr><th scope="row">'+esc(label)+'</th><td>'+esc(value)+'</td></tr>').join('')+'</tbody></table></div></section>';
    }
    function run() {
      invalidate('');
      try {
        const overrides={};
        for (const p of parameters) {
          const field=fields.get(p.key), value=field.value.trim()==='' ? null : Number(field.value);
          const valid=value!==null && Number.isFinite(value) && value>=p.min && value<=p.max && (!p.integer || Number.isInteger(value));
          field.setAttribute('aria-invalid',String(!valid));
          if (!valid) throw Error(p.label+' : saisie requise de '+p.min+' à '+p.max+(p.integer ? ' (entier)' : '')+'.');
          overrides[p.key]=value;
        }
        const v=engine.calculate(data,op.value,scenario.value,overrides);
        const row = key => { const meta=engine.rows.find(r=>r.key===key); return [meta.label,format(v[key],meta.unit)]; };
        let html='<p class="badge">Simulation actualisée • HYPOTHÈSES • C01 uniquement</p><p>'+esc(data.operations.find(o=>o.id===op.value).name)+' — '+esc(data.cases.find(c=>c.id===scenario.value).name)+'. Les valeurs ci-dessous reflètent les champs saisis, y compris leurs modifications.</p>';
        html+=table('Quatre résultats à lire séparément',['project_profit','operator_profit','investor_profit_net','ethi_profit'].map(row));
        html+='<p>Ces résultats décrivent des périmètres différents et ne doivent pas être additionnés. La prestation de l’opérateur est distincte du partage de son capital ; les honoraires ETHIGONE sont déjà un coût du lot.</p>';
        html+=table('Financement et souscriptions au centime',['capital_required','operator_capital','investor_target','capital_collected','investor_count','regular_ticket','last_ticket','check_tickets'].map(key => key==='operator_capital' ? ['Apport opérateur hypothétique',money(v[key])] : row(key)));
        html+='<p>Le ticket indicatif sert à compter les participants : ce n’est pas une souscription minimale adoptée. Les participants sauf le dernier prennent la souscription régulière ; le dernier absorbe l’ajustement de centimes. La somme cible est conservée.</p>';
        html+=table('Trésorerie et actifs : un bénéfice ne suffit pas',['actual_peak','funding_gap','cash60','cash150','stock0','ar60_gross','ar60_net','uncovered_liabilities','distribution_possible'].map(row));
        html+=table('Partage économique et versements conditionnels',['investor_gain','investor_loss','operator_gain','operator_loss','investor_entitlement','operator_entitlement','investor_distribution','operator_distribution','operator_service_profit'].map(row));
        html+='<p>Le partage positif C01 est une hypothèse ; les pertes de capital suivent les apports dans ce modèle, sous réserve des règles de faute et du contrat à instruire. Un droit économique n’est pas un versement disponible. Le modèle bloque les distributions s’il reste un besoin complémentaire non financé.</p>';
        html+=table('Frais et économie complète ETHIGONE',['ethi_revenue','ethi_cost','rejected_per_approved','rejection_allocation','failure_allocation','overhead_allocation','ethi_delay','conversion_cost','ethi_contribution','break_even_operations','max_investors','minimum_ticket','fee_break_even'].map(row));
        html+='<p>Le ticket économique moyen est un seuil calculé pour les coûts et volumes saisis, jamais un prix adopté. « Indisponible » au seuil mensuel signifie qu’aucun volume fini n’équilibre les charges fixes avec la contribution courante. Refus et collectes abandonnées sont imputés même aux dossiers aboutis. Les provisions tiers ne remplacent pas les devis absents.</p>';
        if (!v.execute) html+='<div class="callout"><strong>Sous-collecte : aucun achat et aucun acompte client dans le modèle.</strong><p>Capital EUR à rembourser : '+esc(money(v.investor_refund))+'. Frais de conversion perdus pour les investisseurs : '+esc(money(v.conversion_cost))+'. Frais externes d’abandon à financer séparément par ETHIGONE : '+esc(money(v.refund_external_need))+'. La disponibilité de cette trésorerie ETHIGONE n’est pas prouvée. Les remboursements sont hors trésorerie du lot ; le zéro du lot ne signifie pas absence de flux.</p></div>';
        html+='<section class="card"><h2>Calendrier de trésorerie du lot</h2><p>Flux hors capitaux ; trésorerie après capitaux, avant partage. Les encaissements à J120 sont réellement décalés. Aucun intérêt de retard.</p><div class="table-wrap"><table><caption>HYPOTHÈSES — flux et soldes en EUR</caption><thead><tr><th scope="col">Jour et événement</th><th scope="col">Flux</th><th scope="col">Cumul hors capitaux</th><th scope="col">Trésorerie après capitaux</th></tr></thead><tbody>'+data.timeline.map(t=>'<tr><th scope="row">J'+t.day+' — '+esc(t.event)+'</th><td>'+esc(money(v['cf'+t.day]))+'</td><td>'+esc(money(v['cum'+t.day]))+'</td><td>'+esc(money(v['cash'+t.day]))+'</td></tr>').join('')+'</tbody></table></div></section>';
        html+='<details class="card"><summary>Toutes les sorties du moteur J4 et contrôles</summary>'+table('Détail reproductible',engine.rows.map(r=>[r.label,format(v[r.key],r.unit)]))+'</details>';
        html+=table('Inconnues conservées',data.unknowns.map(u=>[u.key,'Inconnu (null) — '+u.meaning]));
        result.innerHTML=html;
        snapshot={schema_version:1, exported_at:new Date().toISOString(),status:'HYPOTHESE',contract_scope:'C01 uniquement ; aucun transfert C02/C03',financial_execution_authorized:false,price_or_ticket_adopted:false,operation:op.value,scenario:scenario.value,engine:'calculer_j4.mjs J4-1.0 embarqué par preparer_j8.mjs',inputs:overrides,results:v,unknowns:data.unknowns,limits:data.limits,verification_semantics:'false = preuve non obtenue, pas absence démontrée',source_dates_preserved:true};
        exportButton.disabled=false;
      } catch (err) { invalidate('Calcul impossible. '+err.message+' Les résultats précédents ont été effacés.'); }
    }
    function load(operation, caseId) {
      op.value=operation; scenario.value=caseId;
      const values=engine.inputsFor(data,operation,caseId);
      for (const [key,field] of fields) field.value=values[key]===null || values[key]===undefined ? '' : String(values[key]);
      $('sim-description').textContent=data.operations.find(o=>o.id===operation).description;
      run();
    }
    op.addEventListener('change',()=>load(op.value,scenario.value)); scenario.addEventListener('change',()=>load(op.value,scenario.value));
    form.addEventListener('submit',event=>{event.preventDefault();run();});
    form.addEventListener('input',event=>{if(event.target.matches('input'))run();});
    $('sim-ticket').addEventListener('click',()=>{fields.get('target_ticket').value='2500';run();});
    $('sim-stress').addEventListener('click',()=>{load('O2','base');fields.get('target_ticket').value='2500';fields.get('monthly_operations').value='3';fields.get('acceptance_rate').value='0.2';run();});
    $('sim-reset').addEventListener('click',()=>load('O2','base'));
    exportButton.addEventListener('click',()=>{
      if (!snapshot) return;
      const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)+'\n'],{type:'application/json;charset=utf-8'}));
      const link=document.createElement('a');link.href=url;link.download='ethigone-hypotheses-'+snapshot.operation+'-'+snapshot.scenario+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
    app.hidden=false; load('O2','base');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
