/**
 * CasosProprios.js — casos de teste definidos com o cliente (apps, integrações e números dele) que a
 * biblioteca não tem. Pertencem a uma PoV, têm id "custom:<uuid>" e passam pelo mesmo plano,
 * execução, critérios e relatório que os da biblioteca, marcados como "definido com o cliente".
 * O texto de um caso da biblioteca continua somente leitura (design §7.3).
 *
 * Parte pura: validateCustomCase, createCustomCaseRow, updateCustomCaseRow, customToLibraryRow, caseIndex.
 * Parte Apps Script: saveCustomCase_.
 */

var CUSTOM_PREFIX = 'custom:';

function isCustomCaseId(id) {
  return String(id || '').indexOf(CUSTOM_PREFIX) === 0;
}

function cleanList_(arr, max, maxLen) {
  return (Array.isArray(arr) ? arr : String(arr || '').split(/\r?\n/)).map(function (s) { return String(s || '').trim(); })
    .filter(function (s) { return s; }).slice(0, max).map(function (s) { return s.slice(0, maxLen); });
}

function validateCustomCase(input) {
  var errors = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['Dados do caso ausentes.'] };
  var nome = String(input.nome || '').trim();
  if (nome.length < 3) errors.push('Dê um nome ao caso.');
  if (nome.length > LIMITS.short) errors.push('O nome passou de ' + LIMITS.short + ' caracteres.');
  if (String(input.resumo || '').length > LIMITS.obs) errors.push('O resumo passou de ' + LIMITS.obs + ' caracteres.');
  if (String(input.resultado_esperado || '').length > LIMITS.long) errors.push('O resultado esperado passou de ' + LIMITS.long + ' caracteres.');
  if (String(input.como_testar || '').length > LIMITS.long) errors.push('"Como testar" passou de ' + LIMITS.long + ' caracteres.');
  var objs = cleanList_(input.objetivos, 1000, 100000);
  if (!objs.length && !String(input.resultado_esperado || '').trim()) errors.push('Informe ao menos um passo/objetivo ou o resultado esperado.');
  if (objs.length > 50) errors.push('No máximo 50 passos.');
  if (objs.some(function (o) { return o.length > LIMITS.obs; })) errors.push('Cada passo pode ter até ' + LIMITS.obs + ' caracteres.');
  var mets = cleanList_(input.metricas, 1000, 100000);
  if (mets.length > 10) errors.push('No máximo 10 métricas.');
  if (mets.some(function (o) { return o.length > LIMITS.short; })) errors.push('Cada métrica pode ter até ' + LIMITS.short + ' caracteres.');
  if (!errors.length) {
    // o checklist do caso (passos + aceite + métricas) precisa caber numa célula da planilha
    var probe = customToLibraryRow(Object.assign({ caso_id: 'custom:probe', versao: 1, ativo: true }, customFields_(input)), {});
    if (JSON.stringify(buildChecklist(probe)).length > LIMITS.jsonCell) errors.push('O caso ficou grande demais para uma célula da planilha: encurte os passos ou o resultado esperado.');
  }
  return { ok: errors.length === 0, errors: errors };
}

function customFields_(input) {
  return {
    nome: String(input.nome || '').trim(),
    resumo: String(input.resumo || '').trim(),
    objetivos: cleanList_(input.objetivos, 50, LIMITS.obs),
    resultado_esperado: String(input.resultado_esperado || '').replace(/\r\n/g, '\n').trim(),
    metricas: cleanList_(input.metricas, 10, LIMITS.short),
    como_testar: String(input.como_testar || '').replace(/\r\n/g, '\n').trim(),
    use_case_id: String(input.use_case_id || ''),
  };
}

/** Novo caso próprio (pura). refs: {autor, nowIso, newId}. */
function createCustomCaseRow(pov, input, refs) {
  if (!pov) throw new Error('PoV não encontrada.');
  if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error('A PoV está "' + povStatusLabel(pov.status) + '". Reabra a PoV para mudar o plano.');
  var v = validateCustomCase(input);
  if (!v.ok) throw new Error(v.errors.join(' '));
  var f = customFields_(input);
  var row = { caso_id: CUSTOM_PREFIX + refs.newId(), pov_id: pov.pov_id, versao: 1, ativo: true, autor: refs.autor, criado_em: refs.nowIso, atualizado_em: refs.nowIso };
  Object.keys(f).forEach(function (k) { row[k] = f[k]; });
  return { row: row };
}

/** Edição (pura): a versão sobe quando muda algum texto avaliável; o checklist se ajusta na execução. */
function updateCustomCaseRow(cur, pov, input, refs) {
  if (!cur || !cur.ativo) throw new Error('Caso não encontrado.');
  if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error('A PoV está "' + povStatusLabel(pov.status) + '". Reabra a PoV para mudar o plano.');
  if (input.expected_atualizado_em !== undefined && input.expected_atualizado_em !== null && String(input.expected_atualizado_em) !== String(cur.atualizado_em || '')) {
    var err = new Error(conflictMessage('Este caso', cur));
    err.conflict = true;
    throw err;
  }
  var v = validateCustomCase(input);
  if (!v.ok) throw new Error(v.errors.join(' '));
  var f = customFields_(input);
  var r = JSON.parse(JSON.stringify(cur));
  var textChanged = ['nome', 'resumo', 'resultado_esperado', 'como_testar'].some(function (k) { return r[k] !== f[k]; }) ||
    JSON.stringify(r.objetivos || []) !== JSON.stringify(f.objetivos) || JSON.stringify(r.metricas || []) !== JSON.stringify(f.metricas);
  Object.keys(f).forEach(function (k) { r[k] = f[k]; });
  if (textChanged) r.versao = (Number(cur.versao) || 1) + 1;
  r.autor = refs.autor;
  r.atualizado_em = refs.nowIso;
  return { row: r, textChanged: textChanged };
}

/** Caso próprio no formato de uma linha da Library (texto igual em "EN" e "PT"; nunca tradução pendente). */
function customToLibraryRow(c, taxById) {
  var uc = c.use_case_id && taxById && taxById[c.use_case_id] ? taxById[c.use_case_id] : null;
  var tax = [];
  var n = uc, guard = 0;
  while (n && guard++ < 10) { tax.unshift(n.node_id); n = n.parent_id ? taxById[n.parent_id] : null; }
  return {
    id: c.caso_id, custom: true, pov_id: c.pov_id,
    name: c.nome, summary: c.resumo || '', description: '', objectives: c.objetivos || [], evaluation_metrics: c.metricas || [],
    expected_outcome: c.resultado_esperado || '', how_to: c.como_testar || '', notes: [],
    lifecycle: '', published: true, visibility: 'shared', tested: false, test_result: '', test_environment: '', test_at: '', test_by: '', lab_tests: [],
    domain: [], use_case: uc ? [uc.name_pt || uc.name] : [], scenario: [], node_ids: uc ? [uc.node_id] : [], tax_ids: tax,
    docs: [], prerequisites: [], value_drivers: [], competitors_lib: [], industries: [],
    version: Number(c.versao) || 1, updated_at: c.atualizado_em || '', url: '',
    name_pt: c.nome, summary_pt: c.resumo || '', description_pt: '', objectives_pt: c.objetivos || [], evaluation_metrics_pt: c.metricas || [],
    expected_outcome_pt: c.resultado_esperado || '', how_to_pt: c.como_testar || '', notes_pt: [],
    traducao_versao: Number(c.versao) || 1, traducao_pendente: false, removido_em: c.ativo === false ? (c.atualizado_em || 'x') : '',
  };
}

/** Índice único id → linha (Library + casos próprios convertidos). */
function caseIndex(library, customCases, taxonomia) {
  var taxById = {};
  (taxonomia || []).forEach(function (n) { taxById[n.node_id] = n; });
  var idx = {};
  (library || []).forEach(function (r) { idx[r.id] = r; });
  (customCases || []).forEach(function (c) { idx[c.caso_id] = customToLibraryRow(c, taxById); });
  return idx;
}

// ============================================================ Apps Script (não roda em Node)

/** Cria (e já inclui no plano) ou edita um caso próprio. */
function saveCustomCase_(povId, input, user) {
  return withLock_(function () {
    var pov = requirePovAccess_(povId, user);
    var refs = { autor: user.email, nowIso: nowIso_(), newId: function () { return Utilities.getUuid(); } };
    if (input && input.caso_id) {
      var cur = readTable_(SHEETS.CASOS_PROPRIOS).filter(function (c) { return c.caso_id === input.caso_id && c.pov_id === povId; })[0];
      var upd = updateCustomCaseRow(cur, pov, input, refs);
      updateRowsByKey_(SHEETS.CASOS_PROPRIOS, [upd.row]);
      appendEvents_([{ pov_id: povId, exec_id: '', test_case_id: upd.row.caso_id, tipo: 'plano', de: '', para: 'caso próprio editado', nota: upd.row.nome + (upd.textChanged ? ' (versão ' + upd.row.versao + ')' : ''), autor: user.email, em: refs.nowIso }]);
      return { caso_id: upd.row.caso_id };
    }
    var created = createCustomCaseRow(pov, input || {}, refs).row;
    var taxonomia = readTable_(SHEETS.TAXONOMIA);
    // calcula a inclusão no plano ANTES de gravar: se a regra recusar (ex.: falta o motivo depois do
    // aceite do plano), nada fica gravado pela metade
    var res = addCasesToPlan(readTable_(SHEETS.EXECUCOES), pov, [created.caso_id], caseIndex([], [created], taxonomia), taxonomia,
      { autor: user.email, nowIso: refs.nowIso, newId: refs.newId, selectedNodeIds: created.use_case_id ? [created.use_case_id] : [], motivo: input.motivo || '' });
    appendRows_(SHEETS.CASOS_PROPRIOS, [created]);
    appendRows_(SHEETS.EXECUCOES, res.created);
    appendEvents_(res.events);
    return { caso_id: created.caso_id };
  });
}
