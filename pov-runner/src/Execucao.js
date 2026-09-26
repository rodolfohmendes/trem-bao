/**
 * Execucao.js — execução de um caso numa PoV (design §8): textos de exibição, checklist, sugestão de
 * status, regras de gravação (timestamps, tentativas, bloqueio com pendência, concorrência, PoV
 * travada), ações em lote e progresso.
 *
 * Checklist: um item por pré-requisito (chave = id), por passo (itens de `objectives` que não são
 * título/vazio; chave = texto EN normalizado), um item de aceite (resultado esperado) e um item por
 * métrica (medição: `obs` = valor medido). A chave usa o texto em inglês, que não muda quando a
 * tradução muda; itens avaliados que saem da biblioteca ficam com `removido: true` (nada se apaga).
 *
 * Parte pura: isBlankText, isHeaderItem, displayFields, checklistItems, buildChecklist, normalizeChecklist,
 *   checklistStats, checklistSummary, suggestStatus, validateExecutionInput, applyExecutionUpdate,
 *   refreshCaseVersion, bulkUpdateExecutions, computeProgress.
 * Parte Apps Script: saveExecution_, bulkUpdate_, refreshVersion_, attachEvidence_.
 */

/** Texto vazio para exibição: '' ou só "-" (o marcador de campo vazio da biblioteca). */
function isBlankText(s) {
  var t = String(s == null ? '' : s).trim();
  return t === '' || t === '-';
}

/** Item de objetivos que é título de seção ("Test steps:") ou vazio — vira subtítulo, não passo. */
function isHeaderItem(s) {
  var t = String(s == null ? '' : s).trim();
  return isBlankText(t) || /:$/.test(t);
}

/** Campos de exibição de um caso (PT, ou EN quando a tradução está pendente). */
function displayFields(row) {
  row = row || {};
  var pend = !!row.traducao_pendente;
  function pick(pt, en) { return pend ? (en || '') : (pt || en || ''); }
  function pickArr(pt, en) {
    en = Array.isArray(en) ? en : [];
    if (pend) return en;
    return Array.isArray(pt) && pt.length === en.length && pt.length ? pt : en;
  }
  return {
    id: row.id,
    custom: !!row.custom,
    name: pick(row.name_pt, row.name),
    name_en: row.name || '',
    summary: pick(row.summary_pt, row.summary),
    description: pick(row.description_pt, row.description),
    objectives: pickArr(row.objectives_pt, row.objectives),
    evaluation_metrics: pickArr(row.evaluation_metrics_pt, row.evaluation_metrics),
    expected_outcome: pick(row.expected_outcome_pt, row.expected_outcome),
    how_to: pick(row.how_to_pt, row.how_to),
    notes: pickArr(row.notes_pt, row.notes),
    prerequisites: (row.prerequisites || []).map(function (p) { return typeof p === 'object' ? p : { id: String(p), name: String(p), description: '' }; }),
    value_drivers: row.value_drivers || [],
    docs: (row.docs || []).map(function (d) { return { label: d.label || d.url || '', url: safeUrl(d.url), audience: d.audience || '', summary: d.summary || '' }; }),
    competitors: (row.competitors_lib || []).map(function (c) { return { name: c.name, stance: c.stance, stance_label: stanceLabel(c.stance), note: c.note || '' }; }),
    industries: row.industries || [],
    domain: row.domain || [],
    use_case: row.use_case || [],
    lifecycle: row.lifecycle || '',
    lifecycle_label: lifecycleLabel(row.lifecycle),
    tested: !!row.tested,
    test_result: row.test_result || '',
    test_result_label: labResultLabel(row.test_result),
    test_environment: row.test_environment || '',
    test_at: row.test_at || '',
    lab_tests: (row.lab_tests || []).map(function (t) { return { env: t.env, result: t.result, result_label: labResultLabel(t.result), at: t.at, by: t.by || '' }; }),
    lab_pass: (row.lab_tests || []).some(function (t) { return t.result === 'pass'; }) || row.test_result === 'pass',
    version: Number(row.version) || 0,
    url: safeUrl(row.url),
    removed: !!row.removido_em,
    translation_pending: pend,
  };
}

function checkKey_(t, text) {
  return t + ':' + foldText(text).replace(/\s+/g, ' ').trim().slice(0, 160);
}

/**
 * Itens avaliáveis de um caso: [{t, k, i, txt}]. `row` é a linha da Library (ou caso próprio);
 * o texto exibido vem de displayFields, a chave do texto EN.
 */
function checklistItems(row) {
  var f = displayFields(row);
  var enObj = Array.isArray(row.objectives) ? row.objectives : [];
  var enMet = Array.isArray(row.evaluation_metrics) ? row.evaluation_metrics : [];
  var seen = {};
  // chave pelo texto EN; só textos repetidos ganham sufixo de ocorrência (#2, #3…), para que inserir
  // um item novo não desloque as chaves dos demais
  function key(t, text) {
    var base = checkKey_(t, text);
    seen[base] = (seen[base] || 0) + 1;
    return seen[base] > 1 ? base + '#' + seen[base] : base;
  }
  var out = [];
  f.prerequisites.forEach(function (p, i) { out.push({ t: 'prereq', k: 'prereq:' + p.id, i: i, txt: p.name }); });
  f.objectives.forEach(function (text, i) {
    if (isHeaderItem(text)) return;
    out.push({ t: 'step', k: key('step', enObj[i] !== undefined ? enObj[i] : text), i: i, txt: String(text) });
  });
  if (!isBlankText(f.expected_outcome)) out.push({ t: 'out', k: 'out', i: 0, txt: f.expected_outcome });
  f.evaluation_metrics.forEach(function (text, i) {
    if (isBlankText(text)) return;
    out.push({ t: 'met', k: key('met', enMet[i] !== undefined ? enMet[i] : text), i: i, txt: String(text) });
  });
  return out;
}

/** Checklist em branco para um caso novo no plano. */
function buildChecklist(row) {
  return checklistItems(row).map(function (it) { return { t: it.t, k: it.k, i: it.i, txt: it.txt, ok: null, obs: '' }; });
}

function isEvaluated_(c) {
  return c && (c.ok !== null && c.ok !== undefined || !!c.obs);
}

/**
 * Alinha o checklist gravado com os itens atuais do caso (a biblioteca pode ter mudado).
 * Casa pela chave; sem chave (gravação antiga), por tipo+índice com o mesmo texto. Itens avaliados
 * que não existem mais ficam no fim com `removido: true`; os não avaliados somem.
 * Retorna {checklist, changed}.
 */
function normalizeChecklist(saved, row) {
  saved = Array.isArray(saved) ? saved : [];
  var items = checklistItems(row);
  var used = {};
  function find(it) {
    for (var a = 0; a < saved.length; a++) if (!used[a] && !saved[a].removido && saved[a].k === it.k) return a;
    for (var b = 0; b < saved.length; b++) {
      var s = saved[b];
      if (!used[b] && !s.removido && s.t === it.t && s.i === it.i && foldText(s.txt) === foldText(it.txt)) return b;
    }
    return -1;
  }
  var changed = false;
  var out = items.map(function (it) {
    var j = find(it);
    if (j < 0) { changed = true; return { t: it.t, k: it.k, i: it.i, txt: it.txt, ok: null, obs: '' }; }
    used[j] = true;
    var s = saved[j];
    if (s.i !== it.i || s.txt !== it.txt || s.k !== it.k) changed = true;
    return { t: it.t, k: it.k, i: it.i, txt: it.txt, ok: CHECK_VALUES.indexOf(s.ok) >= 0 ? s.ok : null, obs: s.obs ? String(s.obs) : '' };
  });
  saved.forEach(function (s, j) {
    if (used[j]) return;
    if (s.removido || isEvaluated_(s)) {
      if (!s.removido) changed = true;
      out.push({ t: s.t, k: s.k || (s.t + ':' + s.i), i: s.i, txt: s.txt || '', ok: CHECK_VALUES.indexOf(s.ok) >= 0 ? s.ok : null, obs: s.obs || '', removido: true });
    } else {
      changed = true;
    }
  });
  return { checklist: out, changed: changed };
}

/** Contagens do checklist (itens `removido` não contam). */
function checklistStats(checklist) {
  function bucket() { return { total: 0, ok: 0, nok: 0, na: 0, pend: 0 }; }
  var s = { prereq: bucket(), step: bucket(), out: bucket(), met: bucket(), measured: 0 };
  (checklist || []).forEach(function (c) {
    if (c.removido) return;
    var b = s[c.t];
    if (!b) return;
    b.total++;
    if (c.ok === true) b.ok++;
    else if (c.ok === false) b.nok++;
    else if (c.ok === 'na') b.na++;
    else b.pend++;
    if (c.t === 'met' && c.obs) s.measured++;
  });
  s.out.state = s.out.total ? (s.out.ok ? true : s.out.nok ? false : s.out.na ? 'na' : null) : undefined;
  s.steps_evaluable = s.step.total - s.step.na;
  return s;
}

/** Resumo curto para tabelas: "3/5 passos · aceite ✓". */
function checklistSummary(checklist) {
  var s = checklistStats(checklist);
  var parts = [];
  if (s.steps_evaluable > 0) parts.push(s.step.ok + '/' + s.steps_evaluable + ' passos');
  if (s.out.total) parts.push('aceite ' + (s.out.state === true ? '✓' : s.out.state === false ? '✗' : s.out.state === 'na' ? 'n/a' : '—'));
  if (s.met.total) parts.push(s.measured + '/' + s.met.total + ' medidas');
  return parts.join(' · ') || '—';
}

/**
 * Sugestão determinística de status (só dica; o SC decide):
 * pré-requisito não atendido → bloqueado; aceite atendido → aprovado (parcial se algum passo não
 * feito ou medição fora do esperado); aceite não atendido → reprovado; sem aceite marcado, os
 * passos decidem (todos feitos → aprovado; mistura → parcial; nenhum → reprovado; incompleto → em andamento).
 */
function suggestStatus(checklist) {
  var s = checklistStats(checklist);
  if (s.prereq.nok > 0) return 'blocked';
  var stepsEval = s.step.ok + s.step.nok;
  var downgrade = s.step.nok > 0 || s.met.nok > 0;
  if (s.out.state === true) return downgrade ? 'partial' : 'pass';
  if (s.out.state === false) return 'fail';
  if (s.out.total && s.out.state === null) return stepsEval || s.measured ? 'in_progress' : null;
  if (stepsEval === 0) return s.measured ? 'in_progress' : null;
  if (s.step.pend > 0) return 'in_progress';
  if (s.step.nok === 0) return s.met.nok > 0 ? 'partial' : 'pass';
  return s.step.ok > 0 ? 'partial' : 'fail';
}

function isFinalStatus(status) {
  return FINAL_STATUSES.indexOf(status) >= 0;
}

/** Valida a entrada da tela. Retorna {ok, errors[]}. */
function validateExecutionInput(input) {
  var errors = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['Dados da execução ausentes.'] };
  if (!input.exec_id) errors.push('Execução não informada.');
  if (input.status !== undefined && EXEC_STATUSES.indexOf(input.status) < 0) errors.push('Status inválido.');
  if (input.prioridade !== undefined && PRIORITIES.indexOf(input.prioridade) < 0) errors.push('Prioridade inválida.');
  if (input.causa !== undefined && input.causa !== '' && FAIL_CAUSES.indexOf(input.causa) < 0) errors.push('Causa inválida.');
  if (input.data_prevista !== undefined && input.data_prevista !== '' && !isIsoDate(input.data_prevista)) errors.push('Data prevista inválida (use AAAA-MM-DD).');
  function len(field, max, label) {
    if (input[field] !== undefined && input[field] !== null && String(input[field]).length > max) errors.push(label + ' passou de ' + max + ' caracteres.');
  }
  len('resultado_obtido', LIMITS.result, 'Resultado obtido');
  len('observacoes', LIMITS.long, 'Observações internas');
  len('escopo_cliente', LIMITS.long, 'Como executar neste cliente');
  len('ambiente', LIMITS.short, 'Ambiente');
  len('executado_por', LIMITS.short, 'Executado por');
  len('testemunha', LIMITS.short, 'Testemunha');
  len('responsavel', LIMITS.short, 'Responsável');
  len('referencia', LIMITS.short, 'Referência');
  if (input.checklist !== undefined) {
    if (!Array.isArray(input.checklist)) errors.push('Checklist em formato inválido.');
    else input.checklist.forEach(function (c) {
      if (!c || typeof c.k !== 'string') { errors.push('Item de checklist em formato inválido.'); return; }
      if (CHECK_VALUES.indexOf(c.ok) < 0) errors.push('Item de checklist com marcação inválida.');
      if (c.obs && String(c.obs).length > LIMITS.obs) errors.push('Observação de item passou de ' + LIMITS.obs + ' caracteres.');
    });
  }
  if (input.criterios_ids !== undefined && (!Array.isArray(input.criterios_ids) || input.criterios_ids.some(function (x) { return typeof x !== 'string'; }))) {
    errors.push('Critérios de sucesso em formato inválido.');
  }
  if (input.evidencias !== undefined) {
    if (!Array.isArray(input.evidencias)) errors.push('Evidências em formato inválido.');
    else {
      if (input.evidencias.length > LIMITS.evidences) errors.push('No máximo ' + LIMITS.evidences + ' evidências por caso.');
      input.evidencias.forEach(function (e) {
        if (!e || !safeUrl(e.url)) errors.push('Evidência com link inválido (use http:// ou https://): ' + (e && e.url ? String(e.url).slice(0, 60) : '(vazio)'));
        else if (String(e.url).length > LIMITS.url) errors.push('Link de evidência passou de ' + LIMITS.url + ' caracteres.');
        if (e && e.label && String(e.label).length > LIMITS.short) errors.push('Rótulo de evidência passou de ' + LIMITS.short + ' caracteres.');
      });
    }
  }
  if (input.nova_pendencia) {
    var v = validatePendencia(input.nova_pendencia);
    if (!v.ok) errors = errors.concat(v.errors);
  }
  return { ok: errors.length === 0, errors: errors };
}

/** Mensagem padrão de conflito de concorrência otimista. */
function conflictMessage(what, row) {
  return what + ' foi alterado por ' + (row.autor || 'outra pessoa') + (row.atualizado_em ? ' em ' + shortDateTime(row.atualizado_em) + ' (UTC)' : '') + '.';
}

function lockedPovMessage_(pov) {
  return 'A PoV está "' + povStatusLabel(pov.status) + '". Reabra a PoV para mudar execuções e plano.';
}

function jsonFits_(value, label) {
  if (JSON.stringify(value || []).length > LIMITS.jsonCell) throw new Error(label + ' ficou grande demais para uma célula da planilha. Encurte as observações.');
}

/**
 * Aplica a gravação de uma execução (pura).
 * row: linha atual de Execucoes; input: campos da tela (+ expected_atualizado_em);
 * ctx: {pov, caseRow (linha da Library/caso próprio, ou null), autor, nowIso, pendencias (da PoV), critIds ({id:true} ativos da PoV), newId}.
 * Retorna {row, events[], attempt|null, newPendencia|null, conflict:false}. Em conflito, lança Error com .conflict = true.
 */
function applyExecutionUpdate(row, input, ctx) {
  var v = validateExecutionInput(input);
  if (!v.ok) throw new Error(v.errors.join(' '));
  if (!row) throw new Error('Execução não encontrada.');
  if (!row.ativo) throw new Error('Este caso foi removido do plano. Inclua-o de novo pelo Plano para editar.');
  var pov = ctx.pov;
  if (!pov) throw new Error('PoV não encontrada.');
  if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error(lockedPovMessage_(pov));
  if (input.expected_atualizado_em !== undefined && input.expected_atualizado_em !== null &&
      String(input.expected_atualizado_em) !== String(row.atualizado_em || '')) {
    var err = new Error(conflictMessage('Este caso', row));
    err.conflict = true;
    throw err;
  }
  var out = JSON.parse(JSON.stringify(row));
  var before = row.status || 'not_started';
  var events = [];

  if (input.checklist !== undefined) {
    var base = ctx.caseRow ? normalizeChecklist(out.checklist, ctx.caseRow).checklist : (out.checklist || []);
    var incoming = {};
    input.checklist.forEach(function (c) { incoming[c.k] = c; });
    out.checklist = base.map(function (c) {
      var n = incoming[c.k];
      if (!n || c.removido) return c;
      return { t: c.t, k: c.k, i: c.i, txt: c.txt, ok: n.ok, obs: String(n.obs || '').trim() };
    });
    jsonFits_(out.checklist, 'O checklist');
  }
  ['resultado_obtido', 'observacoes', 'escopo_cliente'].forEach(function (f) { if (input[f] !== undefined) out[f] = String(input[f] || '').replace(/\r\n/g, '\n').trim(); });
  ['ambiente', 'executado_por', 'testemunha', 'responsavel', 'referencia', 'data_prevista', 'causa'].forEach(function (f) { if (input[f] !== undefined) out[f] = String(input[f] || '').trim(); });
  if (input.prioridade !== undefined) out.prioridade = input.prioridade;
  if (input.criterios_ids !== undefined) {
    var valid = ctx.critIds || {};
    out.criterios_ids = input.criterios_ids.filter(function (id, i, a) { return valid[id] && a.indexOf(id) === i; });
    var beforeIds = (row.criterios_ids || []).slice().sort().join(','), afterIds = out.criterios_ids.slice().sort().join(',');
    if (beforeIds !== afterIds) events.push(ev_(row, 'criterio', beforeIds ? String((row.criterios_ids || []).length) : '0', String(out.criterios_ids.length), 'critérios de sucesso vinculados', ctx));
  }
  if (input.evidencias !== undefined) {
    out.evidencias = input.evidencias.map(function (e) {
      var url = safeUrl(e.url);
      return { label: String(e.label || '').trim() || url.replace(/^https?:\/\//i, '').slice(0, 80), url: url, cliente: e.cliente === true };
    });
    jsonFits_(out.evidencias, 'A lista de evidências');
  }
  var after = input.status !== undefined ? input.status : before;
  out.status = after;

  // bloqueio exige pendência aberta vinculada (existente ou criada agora)
  var newPend = null;
  if (input.nova_pendencia && String(input.nova_pendencia.descricao || '').trim()) {
    newPend = createPendenciaRow(pov, input.nova_pendencia, [row.exec_id], { autor: ctx.autor, nowIso: ctx.nowIso, newId: ctx.newId }).row;
    events.push(ev_(row, 'pendencia', '', 'aberta', newPend.descricao, ctx));
  }
  if (after === 'blocked') {
    var linked = (ctx.pendencias || []).some(function (p) { return p.status === 'aberta' && (p.exec_ids || []).indexOf(row.exec_id) >= 0; });
    if (!linked && !newPend) throw new Error('Para marcar como Bloqueado, registre a pendência que bloqueia o caso (o que falta, de quem, até quando).');
  }

  var touched = after !== 'not_started' || !!out.resultado_obtido || (out.evidencias || []).length > 0 ||
    (out.checklist || []).some(function (c) { return isEvaluated_(c); });
  if (!out.iniciado_em && touched) out.iniciado_em = ctx.nowIso;
  var attempt = null;
  if (isFinalStatus(after)) {
    if (!isFinalStatus(before) || !out.concluido_em) out.concluido_em = ctx.nowIso;
    if (!out.executado_por) out.executado_por = ctx.autor;
    out.versao_avaliada = Number(out.versao_caso) || 0;
    if (!isFinalStatus(before) || before !== after) {
      out.tentativas = (Number(row.tentativas) || 0) + 1;
      if (!out.primeiro_status) out.primeiro_status = after;
      attempt = {
        exec_id: row.exec_id, pov_id: row.pov_id, n: out.tentativas, status: after, checklist: out.checklist, resultado_obtido: out.resultado_obtido,
        evidencias: out.evidencias, causa: out.causa, referencia: out.referencia, executado_por: out.executado_por, ambiente: out.ambiente,
        versao_caso: out.versao_caso, autor: ctx.autor, em: ctx.nowIso,
      };
    }
  } else {
    out.concluido_em = '';
  }
  if (after !== before) events.unshift(ev_(row, 'status', before, after, '', ctx));
  out.autor = ctx.autor;
  out.atualizado_em = ctx.nowIso;
  return { row: out, events: events, attempt: attempt, newPendencia: newPend };
}

function ev_(row, tipo, de, para, nota, ctx) {
  return { pov_id: row.pov_id, exec_id: row.exec_id, test_case_id: row.test_case_id, tipo: tipo, de: de, para: para, nota: nota || '', autor: ctx.autor, em: ctx.nowIso };
}

/** "Atualizar para a versão atual": re-normaliza o checklist e grava a versão/nome atuais (pura). */
function refreshCaseVersion(row, caseRow, pov, ctx) {
  if (!row || !row.ativo) throw new Error('Execução não encontrada no plano.');
  if (!caseRow || caseRow.removido_em) throw new Error('O caso não existe mais na biblioteca; não há versão nova para aplicar.');
  if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error(lockedPovMessage_(pov));
  var out = JSON.parse(JSON.stringify(row));
  var norm = normalizeChecklist(out.checklist, caseRow);
  out.checklist = norm.checklist;
  var de = String(out.versao_caso);
  out.versao_caso = Number(caseRow.version) || 0;
  out.caso_nome = displayFields(caseRow).name;
  out.autor = ctx.autor;
  out.atualizado_em = ctx.nowIso;
  return { row: out, event: ev_(row, 'versao', de, String(out.versao_caso), norm.changed ? 'checklist ajustado à versão nova' : '', ctx) };
}

/**
 * Ações em lote na tabela de execução (pura). changes: {prioridade?, responsavel?, data_prevista?,
 * criterio_add?, criterio_remove?, nao_aplicavel?: {motivo}}. expected: {exec_id: atualizado_em visto}.
 * Linhas alteradas por outra pessoa entram em `conflicts` e não são gravadas; as demais seguem.
 * Retorna {updated[], conflicts[], events[], attempts[]}.
 */
function bulkUpdateExecutions(execucoes, pov, execIds, changes, expected, ctx) {
  if (!pov) throw new Error('PoV não encontrada.');
  if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error(lockedPovMessage_(pov));
  changes = changes || {};
  expected = expected || {};
  if (!execIds || !execIds.length) throw new Error('Selecione ao menos um caso.');
  if (execIds.length > LIMITS.planBatch) throw new Error('No máximo ' + LIMITS.planBatch + ' casos por ação em lote.');
  if (changes.prioridade !== undefined && PRIORITIES.indexOf(changes.prioridade) < 0) throw new Error('Prioridade inválida.');
  if (changes.data_prevista && !isIsoDate(changes.data_prevista)) throw new Error('Data prevista inválida (use AAAA-MM-DD).');
  if (changes.responsavel !== undefined && String(changes.responsavel).length > LIMITS.short) throw new Error('Responsável passou de ' + LIMITS.short + ' caracteres.');
  var na = changes.nao_aplicavel;
  if (na && String(na.motivo || '').trim().length < 3) throw new Error('Informe o motivo para marcar como Não aplicável.');
  var critIds = ctx.critIds || {};
  if (changes.criterio_add && !critIds[changes.criterio_add]) throw new Error('Critério de sucesso não encontrado.');
  var want = {};
  execIds.forEach(function (id) { want[id] = true; });
  var out = { updated: [], conflicts: [], events: [], attempts: [] };
  (execucoes || []).forEach(function (e) {
    if (!want[e.exec_id] || e.pov_id !== pov.pov_id || !e.ativo) return;
    if (expected[e.exec_id] !== undefined && String(expected[e.exec_id]) !== String(e.atualizado_em || '')) {
      out.conflicts.push({ exec_id: e.exec_id, caso: e.caso_nome, autor: e.autor, atualizado_em: e.atualizado_em });
      return;
    }
    var r = JSON.parse(JSON.stringify(e));
    var notes = [];
    if (changes.prioridade !== undefined && r.prioridade !== changes.prioridade) { r.prioridade = changes.prioridade; notes.push('prioridade ' + priorityLabel(changes.prioridade)); }
    if (changes.responsavel !== undefined) { r.responsavel = String(changes.responsavel).trim(); notes.push('responsável ' + (r.responsavel || '—')); }
    if (changes.data_prevista !== undefined) { r.data_prevista = changes.data_prevista || ''; notes.push('data ' + (r.data_prevista || '—')); }
    if (changes.criterio_add && (r.criterios_ids || []).indexOf(changes.criterio_add) < 0) { r.criterios_ids = (r.criterios_ids || []).concat([changes.criterio_add]); notes.push('critério vinculado'); }
    if (changes.criterio_remove) { r.criterios_ids = (r.criterios_ids || []).filter(function (x) { return x !== changes.criterio_remove; }); notes.push('critério desvinculado'); }
    var before = r.status;
    if (na && before !== 'not_applicable') {
      r.status = 'not_applicable';
      var motivo = 'Não aplicável: ' + String(na.motivo).trim();
      r.resultado_obtido = r.resultado_obtido ? r.resultado_obtido + '\n' + motivo : motivo;
      r.concluido_em = ctx.nowIso;
      if (!r.iniciado_em) r.iniciado_em = ctx.nowIso;
      r.tentativas = (Number(r.tentativas) || 0) + 1;
      if (!r.primeiro_status) r.primeiro_status = 'not_applicable';
      out.events.push(ev_(e, 'status', before, 'not_applicable', String(na.motivo).trim(), ctx));
      out.attempts.push({ exec_id: e.exec_id, pov_id: e.pov_id, n: r.tentativas, status: 'not_applicable', checklist: r.checklist, resultado_obtido: r.resultado_obtido,
        evidencias: r.evidencias, causa: r.causa, referencia: r.referencia, executado_por: r.executado_por || ctx.autor, ambiente: r.ambiente, versao_caso: r.versao_caso, autor: ctx.autor, em: ctx.nowIso });
      if (!r.executado_por) r.executado_por = ctx.autor;
    }
    if (notes.length) out.events.push(ev_(e, 'plano', '', 'lote', notes.join('; '), ctx));
    r.autor = ctx.autor;
    r.atualizado_em = ctx.nowIso;
    out.updated.push(r);
  });
  return out;
}

/** Progresso de uma lista de execuções (só as ativas contam). */
function computeProgress(execucoes) {
  var p = { total: 0, por_status: {}, concluidos: 0, pct_concluido: 0, avaliados: 0, aprovados: 0, parciais: 0, reprovados: 0, bloqueados: 0,
    nao_aplicaveis: 0, taxa_aprovacao: null, aprovados_apos_reteste: 0, reexecutados: 0 };
  EXEC_STATUSES.forEach(function (s) { p.por_status[s] = 0; });
  (execucoes || []).forEach(function (e) {
    if (!e.ativo) return;
    p.total++;
    var st = EXEC_STATUSES.indexOf(e.status) >= 0 ? e.status : 'not_started';
    p.por_status[st]++;
    if (isFinalStatus(st)) p.concluidos++;
    if ((Number(e.tentativas) || 0) > 1) p.reexecutados++;
    if (st === 'pass' && (Number(e.tentativas) || 0) > 1 && e.primeiro_status && e.primeiro_status !== 'pass') p.aprovados_apos_reteste++;
  });
  p.aprovados = p.por_status.pass;
  p.parciais = p.por_status.partial;
  p.reprovados = p.por_status.fail;
  p.bloqueados = p.por_status.blocked;
  p.nao_aplicaveis = p.por_status.not_applicable;
  p.avaliados = p.aprovados + p.parciais + p.reprovados;
  p.pct_concluido = p.total ? Math.round((p.concluidos / p.total) * 100) : 0;
  p.taxa_aprovacao = p.avaliados ? Math.round((p.aprovados / p.avaliados) * 100) : null;
  return p;
}

// ============================================================ Apps Script (não roda em Node)

function povContext_(povId) {
  return {
    pendencias: readTable_(SHEETS.PENDENCIAS).filter(function (p) { return p.pov_id === povId; }),
    critIds: readTable_(SHEETS.CRITERIOS).reduce(function (o, c) { if (c.pov_id === povId && c.ativo) o[c.crit_id] = true; return o; }, {}),
  };
}

/** Grava uma execução. Em conflito devolve {conflict:true, server} em vez de lançar (a tela mantém o rascunho). */
function saveExecution_(input, user) {
  return withLock_(function () {
    var execs = readTable_(SHEETS.EXECUCOES);
    var row = null;
    execs.forEach(function (e) { if (e.exec_id === (input && input.exec_id)) row = e; });
    if (!row) throw new Error('Execução não encontrada. Recarregue a PoV.');
    var pov = requirePovAccess_(row.pov_id, user);
    var caseRow = findCaseRow_(row.test_case_id);
    var pc = povContext_(row.pov_id);
    var res;
    try {
      res = applyExecutionUpdate(row, input, { pov: pov, caseRow: caseRow, autor: user.email, nowIso: nowIso_(), pendencias: pc.pendencias, critIds: pc.critIds,
        newId: function () { return Utilities.getUuid(); } });
    } catch (e) {
      if (e.conflict) return { conflict: true, message: e.message, server: planItemView(row, caseRow) };
      throw e;
    }
    updateRowsByKey_(SHEETS.EXECUCOES, [res.row]);
    if (res.attempt) appendRows_(SHEETS.TENTATIVAS, [withId_(res.attempt, 'tentativa_id')]);
    if (res.newPendencia) appendRows_(SHEETS.PENDENCIAS, [res.newPendencia]);
    appendEvents_(res.events);
    return { conflict: false, row: res.row, suggestion: suggestStatus(res.row.checklist) };
  });
}

function bulkUpdate_(povId, execIds, changes, expected, user) {
  return withLock_(function () {
    var pov = requirePovAccess_(povId, user);
    var pc = povContext_(povId);
    var res = bulkUpdateExecutions(readTable_(SHEETS.EXECUCOES), pov, execIds, changes, expected, { autor: user.email, nowIso: nowIso_(), critIds: pc.critIds });
    updateRowsByKey_(SHEETS.EXECUCOES, res.updated);
    appendRows_(SHEETS.TENTATIVAS, res.attempts.map(function (a) { return withId_(a, 'tentativa_id'); }));
    appendEvents_(res.events);
    return { updated: res.updated.length, conflicts: res.conflicts };
  });
}

function refreshVersion_(execId, user) {
  return withLock_(function () {
    var row = readTable_(SHEETS.EXECUCOES).filter(function (e) { return e.exec_id === execId; })[0];
    if (!row) throw new Error('Execução não encontrada.');
    var pov = requirePovAccess_(row.pov_id, user);
    var res = refreshCaseVersion(row, findCaseRow_(row.test_case_id), pov, { autor: user.email, nowIso: nowIso_() });
    updateRowsByKey_(SHEETS.EXECUCOES, [res.row]);
    appendEvents_([res.event]);
    return res.row.pov_id;
  });
}

/**
 * Anexa um arquivo de evidência: grava no Drive (pasta da PoV › evidencias) FORA do lock e devolve
 * {label, url} para a tela acrescentar à lista (a gravação da execução continua pelo Salvar).
 */
function attachEvidence_(execId, fileName, mimeType, base64, user) {
  var row = readTable_(SHEETS.EXECUCOES).filter(function (e) { return e.exec_id === execId; })[0];
  if (!row) throw new Error('Execução não encontrada.');
  var pov = requirePovAccess_(row.pov_id, user);
  if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error(lockedPovMessage_(pov));
  var raw = String(base64 || '');
  if (raw.length > Math.ceil(LIMITS.uploadBytes * 4 / 3) + 8) throw new Error('Arquivo maior que ' + Math.round(LIMITS.uploadBytes / 1048576) + ' MB. Suba no Drive e cole o link.');
  var bytes = Utilities.base64Decode(raw);
  if (!bytes.length) throw new Error('Arquivo vazio.');
  var folder = getSubfolder_(getPovFolder_(pov), 'evidencias');
  var safeName = String(fileName || 'evidencia').replace(/[\\/]/g, '_').slice(0, 120);
  var file = folder.createFile(Utilities.newBlob(bytes, mimeType || 'application/octet-stream', safeName));
  shareWithTeam_(file, pov, user);
  return { label: safeName, url: file.getUrl(), cliente: false };
}
