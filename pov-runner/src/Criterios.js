/**
 * Criterios.js — critérios de sucesso da PoV (o que o cliente combinou que precisa ver) e o
 * veredito de cada um a partir dos casos vinculados (design §8.4).
 *
 * Veredito automático (determinístico), sobre as execuções ativas vinculadas, ignorando "não aplicável":
 *   nenhuma vinculada → sem casos; alguma reprovada → não atendido; todas aprovadas → atendido;
 *   alguma ainda não concluída (não iniciado / em andamento / bloqueado) → pendente; senão → parcialmente atendido.
 * O SC pode sobrescrever o veredito com uma justificativa escrita (fica registrado).
 *
 * Parte pura: validateCriterion, saveCriterionRow, setCriterionVerdict, criterionVerdict, criteriaSummary.
 * Parte Apps Script: saveCriterion_, deactivateCriterion_, setVerdict_.
 */

function validateCriterion(input) {
  var errors = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['Dados do critério ausentes.'] };
  var t = String(input.texto || '').trim();
  if (t.length < 3) errors.push('Descreva o critério de sucesso.');
  if (t.length > LIMITS.medium) errors.push('O critério passou de ' + LIMITS.medium + ' caracteres.');
  if (input.peso !== undefined && CRITERION_WEIGHTS.indexOf(input.peso) < 0) errors.push('Peso inválido: use obrigatório ou desejável.');
  return { ok: errors.length === 0, errors: errors };
}

/**
 * Cria (sem crit_id) ou edita um critério (pura). rows: critérios atuais (todas as PoVs).
 * refs: {autor, nowIso, newId}. Retorna {row, created, events[]}.
 */
function saveCriterionRow(rows, pov, input, refs) {
  if (!pov) throw new Error('PoV não encontrada.');
  if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error('A PoV está "' + povStatusLabel(pov.status) + '". Reabra a PoV para mudar os critérios.');
  var v = validateCriterion(input);
  if (!v.ok) throw new Error(v.errors.join(' '));
  var mine = (rows || []).filter(function (c) { return c.pov_id === pov.pov_id; });
  if (input.crit_id) {
    var cur = mine.filter(function (c) { return c.crit_id === input.crit_id; })[0];
    if (!cur) throw new Error('Critério não encontrado.');
    if (input.expected_atualizado_em !== undefined && input.expected_atualizado_em !== null && String(input.expected_atualizado_em) !== String(cur.atualizado_em || '')) {
      var err = new Error(conflictMessage('Este critério', cur));
      err.conflict = true;
      throw err;
    }
    var r = JSON.parse(JSON.stringify(cur));
    r.texto = String(input.texto).trim();
    if (input.peso) r.peso = input.peso;
    r.autor = refs.autor;
    r.atualizado_em = refs.nowIso;
    return { row: r, created: false, events: [{ pov_id: pov.pov_id, exec_id: '', test_case_id: '', tipo: 'criterio', de: '', para: 'editado', nota: r.texto, autor: refs.autor, em: refs.nowIso }] };
  }
  var ordem = mine.reduce(function (m, c) { return Math.max(m, Number(c.ordem) || 0); }, 0) + 1;
  var row = { crit_id: refs.newId(), pov_id: pov.pov_id, ordem: ordem, texto: String(input.texto).trim(), peso: input.peso || 'obrigatorio', ativo: true,
    veredito_manual: '', justificativa: '', autor: refs.autor, criado_em: refs.nowIso, atualizado_em: refs.nowIso };
  return { row: row, created: true, events: [{ pov_id: pov.pov_id, exec_id: '', test_case_id: '', tipo: 'criterio', de: '', para: 'criado', nota: row.texto, autor: refs.autor, em: refs.nowIso }] };
}

/** Sobrescreve (ou limpa, com veredito '') o veredito automático. Justificativa obrigatória ao sobrescrever. */
function setCriterionVerdict(cur, pov, input, refs) {
  if (!cur || !cur.ativo) throw new Error('Critério não encontrado.');
  if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error('A PoV está "' + povStatusLabel(pov.status) + '". Reabra a PoV para mudar os critérios.');
  var ver = String(input.veredito_manual || '');
  if (ver && CRITERION_VERDICTS.indexOf(ver) < 0) throw new Error('Veredito inválido.');
  var just = String(input.justificativa || '').trim();
  if (ver && just.length < 5) throw new Error('Explique por que o veredito foi definido manualmente.');
  if (just.length > LIMITS.medium) throw new Error('A justificativa passou de ' + LIMITS.medium + ' caracteres.');
  var r = JSON.parse(JSON.stringify(cur));
  var de = r.veredito_manual || 'auto';
  r.veredito_manual = ver;
  r.justificativa = ver ? just : '';
  r.autor = refs.autor;
  r.atualizado_em = refs.nowIso;
  return { row: r, events: [{ pov_id: cur.pov_id, exec_id: '', test_case_id: '', tipo: 'criterio', de: de, para: ver || 'auto', nota: ver ? just : 'veredito automático', autor: refs.autor, em: refs.nowIso }] };
}

/** Veredito de um critério. execs: execuções da PoV. Retorna {auto, final, manual, justificativa, linked[]}. */
function criterionVerdict(crit, execs) {
  var linked = (execs || []).filter(function (e) { return e.ativo && (e.criterios_ids || []).indexOf(crit.crit_id) >= 0; });
  var relevant = linked.filter(function (e) { return e.status !== 'not_applicable'; });
  var auto;
  if (!relevant.length) auto = 'no_cases';
  else if (relevant.some(function (e) { return e.status === 'fail'; })) auto = 'not_met';
  else if (relevant.every(function (e) { return e.status === 'pass'; })) auto = 'met';
  else if (relevant.some(function (e) { return !isFinalStatus(e.status); })) auto = 'pending';
  else auto = 'partial';
  var manual = crit.veredito_manual || '';
  return {
    auto: auto, manual: manual, final: manual || auto, justificativa: manual ? crit.justificativa || '' : '',
    linked: linked.map(function (e) { return { exec_id: e.exec_id, name: e.caso_nome, status: e.status }; }),
  };
}

/**
 * Resumo dos critérios da PoV: lista com veredito e as contagens da manchete
 * ("X de Y critérios obrigatórios atendidos"), mais avisos de rastreabilidade.
 */
function criteriaSummary(criterios, execs, povId) {
  var list = (criterios || []).filter(function (c) { return c.ativo && (!povId || c.pov_id === povId); })
    .sort(function (a, b) { return (Number(a.ordem) || 0) - (Number(b.ordem) || 0); })
    .map(function (c, idx) {
      var v = criterionVerdict(c, execs);
      return { crit_id: c.crit_id, n: idx + 1, texto: c.texto, peso: c.peso, peso_label: weightLabel(c.peso), veredito: v.final, veredito_label: verdictLabel(v.final),
        automatico: v.auto, automatico_label: verdictLabel(v.auto), manual: !!v.manual, justificativa: v.justificativa, casos: v.linked, atualizado_em: c.atualizado_em, autor: c.autor };
    });
  var obrig = list.filter(function (c) { return c.peso === 'obrigatorio'; });
  var activeIds = {};
  list.forEach(function (c) { activeIds[c.crit_id] = true; });
  var semCriterio = (execs || []).filter(function (e) {
    return e.ativo && !(e.criterios_ids || []).some(function (id) { return activeIds[id]; });
  }).map(function (e) { return e.caso_nome; });
  return {
    list: list,
    total: list.length,
    atendidos: list.filter(function (c) { return c.veredito === 'met'; }).length,
    obrigatorios: obrig.length,
    obrigatorios_atendidos: obrig.filter(function (c) { return c.veredito === 'met'; }).length,
    obrigatorios_nao_atendidos: obrig.filter(function (c) { return c.veredito === 'not_met'; }).length,
    sem_casos: list.filter(function (c) { return c.automatico === 'no_cases'; }).map(function (c) { return c.texto; }),
    casos_sem_criterio: list.length ? semCriterio : [],
  };
}

// ============================================================ Apps Script (não roda em Node)

function saveCriterion_(povId, input, user) {
  return withLock_(function () {
    var pov = requirePovAccess_(povId, user);
    var res = saveCriterionRow(readTable_(SHEETS.CRITERIOS), pov, input || {}, { autor: user.email, nowIso: nowIso_(), newId: function () { return Utilities.getUuid(); } });
    if (res.created) appendRows_(SHEETS.CRITERIOS, [res.row]); else updateRowsByKey_(SHEETS.CRITERIOS, [res.row]);
    appendEvents_(res.events);
    return res.row;
  });
}

function deactivateCriterion_(povId, critId, user) {
  return withLock_(function () {
    var pov = requirePovAccess_(povId, user);
    if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error('A PoV está "' + povStatusLabel(pov.status) + '". Reabra a PoV para mudar os critérios.');
    var cur = readTable_(SHEETS.CRITERIOS).filter(function (c) { return c.crit_id === critId && c.pov_id === povId; })[0];
    if (!cur) throw new Error('Critério não encontrado.');
    cur.ativo = false;
    cur.autor = user.email;
    cur.atualizado_em = nowIso_();
    updateRowsByKey_(SHEETS.CRITERIOS, [cur]);
    appendEvents_([{ pov_id: povId, exec_id: '', test_case_id: '', tipo: 'criterio', de: 'ativo', para: 'removido', nota: cur.texto, autor: user.email, em: cur.atualizado_em }]);
    return true;
  });
}

function setVerdict_(povId, critId, input, user) {
  return withLock_(function () {
    var pov = requirePovAccess_(povId, user);
    var cur = readTable_(SHEETS.CRITERIOS).filter(function (c) { return c.crit_id === critId && c.pov_id === povId; })[0];
    var res = setCriterionVerdict(cur, pov, input || {}, { autor: user.email, nowIso: nowIso_() });
    updateRowsByKey_(SHEETS.CRITERIOS, [res.row]);
    appendEvents_(res.events);
    return res.row;
  });
}
