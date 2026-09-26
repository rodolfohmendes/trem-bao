/**
 * Catalog.js — catálogo compacto para o planejador: árvore da taxonomia, índice leve dos casos
 * (sem os textos longos), indústrias e ambientes. Os contadores por nó são calculados no navegador.
 *
 * Parte pura: buildCatalog, clientSharedCode. Parte Apps Script: getCatalog_ (cache), invalidateCatalogCache_.
 */

function buildCatalog(library, taxonomia, ambientes, config) {
  var byId = {};
  (taxonomia || []).forEach(function (n) {
    byId[n.node_id] = { node_id: n.node_id, name: n.name_pt || n.name, name_en: n.name, type: n.type, type_pt: n.type_pt, depth: Number(n.depth),
      parent_id: n.parent_id || null, status: n.status, children: [] };
  });
  var roots = [];
  Object.keys(byId).forEach(function (id) {
    var n = byId[id];
    if (n.parent_id && byId[n.parent_id]) byId[n.parent_id].children.push(n); else roots.push(n);
  });
  function sortRec(list) {
    list.sort(function (a, b) { var x = foldText(a.name), y = foldText(b.name); return x < y ? -1 : x > y ? 1 : 0; });
    list.forEach(function (n) { sortRec(n.children); });
  }
  sortRec(roots);

  var pending = 0, industries = {};
  var cases = (library || []).filter(function (r) { return !r.removido_em; }).map(function (r) {
    var f = displayFields(r);
    if (f.translation_pending) pending++;
    (r.industries || []).forEach(function (i) { industries[i] = true; });
    return {
      id: r.id, name: f.name, name_en: f.name_en, summary: f.summary, node_ids: r.node_ids || [], industries: r.industries || [],
      domain: r.domain || [], use_case: r.use_case || [], lifecycle: r.lifecycle || '', lifecycle_label: f.lifecycle_label,
      tested: f.tested, lab_pass: f.lab_pass, test_result_label: f.test_result_label, translation_pending: f.translation_pending,
      n_prereqs: f.prerequisites.length, n_steps: f.objectives.filter(function (o) { return !isHeaderItem(o); }).length,
    };
  });
  return {
    tree: roots,
    cases: cases,
    industries: Object.keys(industries).sort(),
    ambientes: (ambientes || []).filter(function (a) { return a.ativo; }).map(function (a) { return a.name_pt || a.name; }),
    meta: {
      total: cases.length,
      translation_pending: pending,
      library_export_date: (config && config.library_export_date) || '',
      last_import_at: (config && config.last_import_at) || '',
      translation_date: (config && config.translation_date) || '',
      is_demo: !!(config && config.library_is_demo === 'true'),
      import_incompleto: !!(config && config.import_em_andamento === 'true'),
      app_version: APP_VERSION,
    },
  };
}

/**
 * Código-fonte das regras puras que a página também usa (filtros do planejador, checklist, rótulos,
 * filtro de audiência), gerado a partir das próprias funções do servidor: uma única fonte de verdade.
 */
function clientSharedCode() {
  var consts = { LIFECYCLE_PT: LIFECYCLE_PT, LAB_RESULT_PT: LAB_RESULT_PT, EXEC_STATUS_PT: EXEC_STATUS_PT, POV_STATUS_PT: POV_STATUS_PT,
    PRIORITY_PT: PRIORITY_PT, STANCE_PT: STANCE_PT, CHECK_TYPE_PT: CHECK_TYPE_PT, CHECK_MARK_PT: CHECK_MARK_PT, VERDICT_PT: VERDICT_PT,
    WEIGHT_PT: WEIGHT_PT, CAUSE_PT: CAUSE_PT, PENDING_OWNER_PT: PENDING_OWNER_PT, OUTCOME_PT: OUTCOME_PT,
    EXEC_STATUSES: EXEC_STATUSES, FINAL_STATUSES: FINAL_STATUSES, PRIORITIES: PRIORITIES, FAIL_CAUSES: FAIL_CAUSES, PENDING_OWNERS: PENDING_OWNERS,
    POV_OUTCOMES: POV_OUTCOMES, CRITERION_VERDICTS: CRITERION_VERDICTS, LIMITS: LIMITS, REDACTED: REDACTED, PUBLIC_URL_HOSTS: PUBLIC_URL_HOSTS };
  var fns = [foldText, safeUrl, shortDateTime, dateBr, isIsoDate, fixedOffsetFormatter, isBlankText, isHeaderItem, coveredNodeIds, caseMatchesFilters,
    checklistStats, checklistSummary, suggestStatus, isFinalStatus, urlHost_, redactText, caseForAudience,
    lifecycleLabel, labResultLabel, execStatusLabel, povStatusLabel, priorityLabel, stanceLabel, verdictLabel, weightLabel, causeLabel,
    pendingOwnerLabel, outcomeLabel, checkMarkLabel, priorityRank];
  return Object.keys(consts).map(function (k) { return 'var ' + k + ' = ' + JSON.stringify(consts[k]) + ';'; }).join('\n') + '\n' +
    fns.map(function (f) { return String(f); }).join('\n');
}

// ============================================================ Apps Script (não roda em Node)

var CATALOG_CACHE_KEY = 'catalog-v2';

/**
 * Catálogo em cache, com a chave amarrada à importação (Config.last_import_at): quem leu a biblioteca
 * antiga grava sob a chave antiga, que ninguém mais consulta depois de uma importação nova.
 */
function getCatalog_() {
  var cfg = getConfigAll_();
  var key = CATALOG_CACHE_KEY + '-' + String(cfg.last_import_at || '0').replace(/[^0-9]/g, '');
  var cached = cacheGetBig_(key);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) { cacheRemoveBig_(key); }
  }
  var catalog = buildCatalog(readTable_(SHEETS.LIBRARY), readTable_(SHEETS.TAXONOMIA), readTable_(SHEETS.AMBIENTES), cfg);
  cachePutBig_(key, JSON.stringify(catalog), 1800);
  return catalog;
}

function invalidateCatalogCache_() {
  var cfg = getConfigAll_();
  cacheRemoveBig_(CATALOG_CACHE_KEY + '-' + String(cfg.last_import_at || '0').replace(/[^0-9]/g, ''));
}
