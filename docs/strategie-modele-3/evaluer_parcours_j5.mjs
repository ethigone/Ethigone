/** J5 : contrôle documentaire de données SYNTHÉTIQUES, sans I/O ni exécution financière. */
export function evaluateDossier(d, rules, reference, asOf) {
  const errors = [];
  const fail = (code, detail) => errors.push({code, detail});
  const action = d.action;
  const isRefund = action === 'rembourser';
  const dateOK = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)
    && Number.isFinite(Date.parse(x)) && new Date(x).toISOString().slice(0,10) === x;
  if (!dateOK(asOf)) fail('DATE_CONTROLE_INVALIDE', 'Une date ISO réelle est obligatoire.');
  if (d.synthetic !== true) fail('DOSSIER_REEL_NON_PRIS_EN_CHARGE', 'Moteur réservé aux simulations publiques anonymes.');
  if (d.status !== 'HYPOTHESE') fail('STATUT_SIMULATION_REQUIS', 'Une simulation ne peut valoir fait validé.');
  if (!Object.hasOwn(rules.required_evidence_by_action, action)) fail('ACTION_INCONNUE', String(action));
  if (!rules.contracts.some(x => x.id === d.contract)) fail('CONTRAT_NON_DEFINI', 'C01/C02/C03 à distinguer.');
  if (!['V01','V02','DEMO-AUTRE'].includes(d.route)) fail('VOIE_NON_DEFINIE', 'La voie doit être documentée sans admission présumée.');
  if (!d.version || !/^[0-9a-f]{64}$/.test(d.pack_sha256 || '')) fail('DOSSIER_NON_VERSIONNE', 'Version et empreinte déclarée requises.');
  const required = new Set(isRefund ? rules.refund_evidence : []);
  for (const id of rules.required_evidence_by_action[action] || []) {
    const stage = rules.stages.find(s => s.id === id);
    if (!stage) fail('REGLE_ETAPE_ABSENTE', id);
    else for (const typ of stage.evidence_types) required.add(typ);
  }
  const flags = d.flags || {};
  if (!isRefund && flags.stablecoin_conversion) required.add('fx_review');
  if (!isRefund && flags.onchain_record) required.add('token_rights');
  if (!isRefund && d.contract === 'C03') required.add('equity_documents');
  if (!isRefund && d.contract === 'C02') required.add('murabaha_sequence');
  const evidence = Array.isArray(d.evidence) ? d.evidence : [];
  if (new Set(evidence.map(e=>e.id)).size !== evidence.length) fail('PREUVE_ID_DUPLIQUE', 'Identifiants de pièces non uniques.');
  for (const typ of required) {
    const found = evidence.filter(e => e.type === typ);
    if (found.length !== 1) { fail('PREUVE_MANQUANTE_OU_DUPLIQUEE', typ); continue; }
    const e = found[0];
    if (e.synthetic !== true || e.status !== 'HYPOTHESE' || !e.id?.startsWith('SYNTHETIC-')) fail('PREUVE_NON_SYNTHETIQUE', typ);
    if (e.issuer_role !== rules.evidence_roles[typ]) fail('ROLE_PREUVE_INCORRECT', typ);
    if (e.version !== d.version || e.pack_sha256 !== d.pack_sha256) fail('VERSION_PREUVE_INCOHERENTE', typ);
    if (!dateOK(e.valid_until) || !dateOK(asOf) || e.valid_until < asOf) fail('PREUVE_EXPIREE_OU_NON_DATEE', typ);
  }
  if (!isRefund) {
    for (const k of ['countries_reviewed','retail_reviewed','mandates_reviewed']) {
      if (d.scope?.[k] !== true) fail('PERIMETRE_NON_EXAMINE', k);
    }
    if (d.route === 'V01' && flags.parallel_campaign !== false) fail('CAMPAGNE_PARALLELE_ETHISX', 'V01 et V02 ne sont pas deux collectes simultanées acquises.');
    if (d.route === 'V02' && d.contract !== 'C03') fail('LITA_ACTIONS_DROITS_INCOHERENTS', 'V02 examine les actions, pas le partage J4 d’un lot.');
    const e = d.economics || {};
    if (e.model_version !== reference.version || e.inputs_sha256 !== reference.inputs_sha256 || e.reference !== reference.reference)
      fail('MODELE_NON_RAPPROCHE', 'Le budget et sa version doivent correspondre aux références.');
    if (e.inputs_changed !== false) fail('RECALCUL_ET_REINFORMATION_REQUIS', 'Prix, TVA, frais ou contrat modifiés.');
    if (e.model_version === 'J4-1.0' && d.contract !== 'C01') fail('J4_INCOMPATIBLE_AVEC_CONTRAT', 'C02/C03 nécessitent leurs propres calculs et droits.');
    if (!Number.isSafeInteger(e.ethi_profit_cents) || e.ethi_profit_cents < 0) fail('ECONOMIE_ETHIGONE_NON_VIABLE', 'Coût complet négatif ou inconnu.');
    if (e.ethi_profit_cents !== reference.ethi_profit_cents || e.funding_gap_cents !== reference.funding_gap_cents)
      fail('RESULTATS_NON_RAPPROCHES', 'Les résultats déclarés diffèrent du modèle de référence.');
    if (e.funding_gap_cents !== 0) fail('DEFICIT_TRESORERIE', 'Besoin de trésorerie non couvert ou inconnu.');
  }
  const money = d.money || {};
  const amount = key => {
    const n = money[key];
    if (!Number.isSafeInteger(n) || n < 0) { fail('MONTANT_INVALIDE', key); return null; }
    return n;
  };
  const beforeBuy = ['acquerir','revendre'].includes(action);
  const cashAction = ['collecter','acquerir','revendre','distribuer','rembourser','cloturer'].includes(action);
  if (cashAction && flags.legal_hold !== false) fail('GEL_LEGAL_OU_STATUT_INCONNU', 'Décision du prestataire/professionnel requise avant mouvement.');
  if (cashAction && flags.incident_open !== false) fail('INCIDENT_NON_RESOLU', 'La reprise n’est pas automatique.');
  if (beforeBuy) {
    const target = amount('target_cents'), collected = amount('collected_cents');
    if (target !== reference.investor_target_cents || target === 0) fail('OBJECTIF_NON_RAPPROCHE', 'Seuil contractuel différent du budget ou besoin nul.');
    if (collected !== null && target !== null && collected < target) fail('COLLECTE_INSUFFISANTE', 'Aucun achat ; préparer annulation et remboursement.');
    if (collected !== null && target !== null && collected > target) fail('SURCOLLECTE_NON_TRAITEE', 'Traiter l’excédent avant toute libération.');
    for (const [need, got, code] of [['operator_required_cents','operator_received_cents','APPORT_OPERATEUR_MANQUANT'],['deposit_required_cents','deposit_received_cents','ACOMPTE_CLIENT_MANQUANT']]) {
      const a=amount(need), b=amount(got);
      if(a!==reference[need]) fail('APPORT_OU_ACOMPTE_CIBLE_MODIFIE', need);
      if(a!==null && b!==null && b<a) fail(code, 'Ne pas compter une promesse comme cash disponible.');
    }
    if (flags.reflection_expired !== true) fail('DELAI_REFLEXION_NON_TERMINE', 'Délai applicable à vérifier avant libération ; aucun nombre universel codé.');
  }
  if (['collecter','acquerir','revendre','rembourser'].includes(action)) {
    const cost=amount('refund_cost_cents'), budget=amount('external_refund_budget_cents');
    if (cost!==null && budget!==null && budget<cost) fail('FRAIS_REMBOURSEMENT_NON_FINANCES', 'Ne pas déduire silencieusement les coûts du capital collecté.');
  }
  if (action === 'revendre') {
    if (flags.ownership_verified !== true || flags.possession_verified !== true) fail('PROPRIETE_POSSESSION_NON_ETABLIES', 'Titre et possession à prouver avant la revente requise.');
    if (d.contract === 'C02') {
      const a=Date.parse(flags.acquisition_at), b=Date.parse(flags.resale_at);
      if (!Number.isFinite(a) || !Number.isFinite(b) || a>=b) fail('SEQUENCE_MURABAHA_INVALIDE', 'Acquisition/risque réel antérieur à la revente.');
    }
  }
  if (isRefund) {
    if (flags.operation_started !== false) fail('OPERATION_DEJA_ENGAGEE', 'Le remboursement de collecte annulée ne vaut pas liquidation d’un lot.');
    if (flags.refund_origin_verified !== true) fail('DESTINATION_REMBOURSEMENT_NON_VERIFIEE', 'Destination contrôlée par le prestataire selon ses obligations.');
    const collected=amount('collected_cents'), refund=amount('refund_cents'), cash=amount('cash_available_cents');
    if (collected!==null && refund!==null && collected!==refund) fail('REMBOURSEMENT_CAPITAL_INCOHERENT', 'Rapprocher le capital EUR effectivement reçu.');
    if (cash!==null && refund!==null && cash<refund) fail('CASH_REMBOURSEMENT_INSUFFISANT', 'Ne pas confondre créance et argent disponible.');
  }
  if (['distribuer','cloturer'].includes(action)) {
    const cash=amount('cash_available_cents'), pay=amount('distribution_cents'), reserve=amount('liabilities_and_reserves_cents');
    if(cash!==null && pay!==null && reserve!==null && cash-pay<reserve) fail('DISTRIBUTION_SUPERIEURE_AU_CASH_LIBRE', 'Préserver passifs et réserves.');
    if(amount('remaining_stock_cents')!==0 || amount('remaining_receivables_cents')!==0) fail('ACTIFS_NON_LIQUIDES', 'Ce contrôleur simple ne simule qu’une sortie finale en cash, pas une cession approuvée de droits.');
  }
  if (action === 'cloturer') {
    if(amount('remaining_cash_cents')!==0 || amount('remaining_liabilities_cents')!==0 || amount('liabilities_and_reserves_cents')!==0)
      fail('SOLDES_NON_CLOTURES', 'Résoudre les soldes et réserves avant clôture finale.');
  }
  return {schema_version:1,dossier_id:d.id,action,checked_on:asOf,simulation_only:true,
    financial_execution_authorized:false,professional_validation:false,
    result:errors.length?'SIMULATION_BLOQUEE':'SIMULATION_COHERENTE',
    required_evidence:[...required].sort(),errors,
    warning:'Contrôle de cohérence de déclarations fictives ; aucun avis, signature, autorisation ou preuve réelle authentifiés.'};
}
