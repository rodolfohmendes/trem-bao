/**
 * Plano.js — plano de testes da PoV (design §7): escopo pela taxonomia, filtros, inclusão/remoção de
 * casos (com motivo depois do aceite do plano), agrupamento por use case, mudanças de escopo e a visão
 * completa da PoV que a tela consome.
 *
 * Parte pura: coveredNodeIds, caseMatchesFilters, isUseCaseNode, useCaseFor, addCasesToPlan, removeFromPlan,
 *   planItemView, groupPlan, scopeChanges, buildPovView.
 * Parte Apps Script: addToPlan_, removeFromPlan_, getPovView_, findCaseRow_, readCaseIndex_.
 * `coveredNodeIds` e `caseMatchesFilters` também rodam no navegador (ver clientSharedCode em Catalog.js).
 */

/** Ids dos nós selecionados mais todos os descendentes. `taxonomia` = [{node_id, parent_id}]. */
function coveredNodeIds(nodeIds, taxonomia) {
  var children = {};
  (taxonomia || []).forEach(function (n) {
    if (!n.parent_id) return;
    (children[n.parent_id] = children[n.parent_id] || []).push(n.node_id);
  });
  var covered = {};
  function walk(id) {
    if (covered[id]) return;
    covered[id] = true;
    (children[id] || []).forEach(walk);
  }
  (nodeIds || []).forEach(walk);
  return covered;
}

/**
 * Filtro do planejador sobre um caso do catálogo ({name, name_en, summary, node_ids, industries, lab_pass, lifecycle}).
 * f: {covered: {nodeId:true} | null, q, industry, onlyLabPass, showDeprecated}.
 */
function caseMatchesFilters(c, f) {
  f = f || {};
  if (f.covered && !(c.node_ids || []).some(function (id) { return f.covered[id]; })) return false;
  if (!f.showDeprecated && c.lifecycle === 'deprecated') return false;
  if (f.onlyLabPass && !c.lab_pass) return false;
  if (f.industry && c.industries && c.industries.length && c.industries.indexOf(f.industry) < 0) return false;
  var q = foldText(f.q || '').trim();
  if (q) {
    var hay = foldText([c.name, c.name_en, c.summary].join(' '));
    var ok = q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
    if (!ok) return false;
  }
  return true;
}

/** Nó é um Use Case? Pelo tipo; sem tipo, pela profundidade 1. */
function isUseCaseNode(n) {
  if (!n) return false;
  if (n.type) return n.type === 'Use Case';
  return Number(n.depth) === 1;
}

function taxIndex_(taxonomia) {
  var o = {};
  (taxonomia || []).forEach(function (n) { o[n.node_id] = n; });
  return o;
}

function useCaseAncestor_(n, taxById) {
  var guard = 0;
  while (n && guard++ < 12) {
    if (isUseCaseNode(n)) return n;
    n = n.parent_id ? taxById[n.parent_id] : null;
  }
  return null;
}

/**
 * Use case que agrupa o caso no plano (determinístico):
 * 1. o primeiro use case do caso (em tax_ids, que inclui ancestrais) coberto pela seleção;
 * 2. o use case ancestral de um nó do caso coberto pela seleção (ex.: selecionou um cenário);
 * 3. sem seleção: o use case pai do primeiro cenário marcado no caso; senão o use case do caso com menor caminho.
 * Retorna o nó da Taxonomia ou null.
 */
function useCaseFor(caseRow, covered, taxById) {
  var ids = (caseRow.tax_ids && caseRow.tax_ids.length ? caseRow.tax_ids : caseRow.node_ids) || [];
  var nodes = ids.map(function (id) { return taxById[id]; }).filter(Boolean);
  var ucs = nodes.filter(isUseCaseNode);
  if (covered) {
    for (var i = 0; i < ucs.length; i++) if (covered[ucs[i].node_id]) return ucs[i];
    for (var j = 0; j < nodes.length; j++) {
      if (!covered[nodes[j].node_id]) continue;
      var anc = useCaseAncestor_(nodes[j], taxById);
      if (anc) return anc;
    }
  }
  var tagged = (caseRow.node_ids || []).map(function (id) { return taxById[id]; }).filter(Boolean);
  for (var k = 0; k < tagged.length; k++) {
    if (isUseCaseNode(tagged[k])) continue;
    var a = tagged[k].parent_id ? useCaseAncestor_(taxById[tagged[k].parent_id], taxById) : null;
    if (a && Number(tagged[k].depth) > Number(a.depth)) return a;
  }
  if (!ucs.length) return null;
  return ucs.slice().sort(function (a, b) { var x = foldText(a.path_pt || a.name_pt), y = foldText(b.path_pt || b.name_pt); return x < y ? -1 : x > y ? 1 : 0; })[0];
}

function scopeEvent_(pov, e, para, nota, refs, afterBaseline) {
  return { pov_id: pov.pov_id, exec_id: e.exec_id, test_case_id: e.test_case_id, tipo: afterBaseline ? 'escopo' : 'plano', de: '', para: para, nota: nota || '', autor: refs.autor, em: refs.nowIso };
}

function lockedPlan_(pov) {
  if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error('A PoV está "' + povStatusLabel(pov.status) + '". Reabra a PoV para mudar o plano.');
}

/**
 * Inclui casos no plano (pura).
 * caseIdx: {id: linha da Library ou caso próprio}; refs: {autor, nowIso, newId, selectedNodeIds, motivo}.
 * Depois do aceite do plano, exige motivo (vira evento de escopo).
 * Retorna {created[], updated[], events[], added, reactivated, skipped, unknown[]}.
 */
function addCasesToPlan(execucoes, pov, caseIds, caseIdx, taxonomia, refs) {
  if (!pov) throw new Error('PoV não encontrada.');
  lockedPlan_(pov);
  caseIds = (caseIds || []).filter(function (id, i, a) { return id && a.indexOf(id) === i; });
  if (caseIds.length > LIMITS.planBatch) throw new Error('No máximo ' + LIMITS.planBatch + ' casos por inclusão. Refine a seleção.');
  var baseline = !!pov.plano_aceite_em;
  var motivo = String(refs.motivo || '').trim();
  if (baseline && motivo.length < 3) throw new Error('O plano já foi aceito pelo cliente: informe o motivo da mudança de escopo.');
  var taxById = taxIndex_(taxonomia);
  var covered = refs.selectedNodeIds && refs.selectedNodeIds.length ? coveredNodeIds(refs.selectedNodeIds, taxonomia) : null;
  var mine = (execucoes || []).filter(function (e) { return e.pov_id === pov.pov_id; });
  var byCase = {};
  mine.forEach(function (e) {
    var cur = byCase[e.test_case_id];
    if (!cur || (e.ativo && !cur.ativo)) byCase[e.test_case_id] = e;
  });
  var ordem = mine.reduce(function (m, e) { return Math.max(m, Number(e.ordem) || 0); }, 0);
  var out = { created: [], updated: [], events: [], added: 0, reactivated: 0, skipped: 0, unknown: [] };
  caseIds.forEach(function (id) {
    var lib = caseIdx[id];
    var cur = byCase[id];
    if (cur && cur.ativo) { out.skipped++; return; }
    if (!lib || lib.removido_em || (lib.custom && lib.pov_id && lib.pov_id !== pov.pov_id)) { out.unknown.push(id); return; }
    var f = displayFields(lib);
    var uc = useCaseFor(lib, covered, taxById);
    if (cur) {
      var r = JSON.parse(JSON.stringify(cur));
      r.ativo = true;
      r.orfao = false;
      r.removido_em = '';
      r.incluido_apos_aceite = baseline;
      r.motivo_escopo = baseline ? motivo : '';
      r.checklist = normalizeChecklist(r.checklist, lib).checklist;
      r.autor = refs.autor;
      r.atualizado_em = refs.nowIso;
      out.updated.push(r);
      out.reactivated++;
      out.events.push(scopeEvent_(pov, r, 'reincluído', baseline ? motivo : f.name, refs, baseline));
      return;
    }
    var row = {
      exec_id: refs.newId(), pov_id: pov.pov_id, test_case_id: id,
      use_case_id: uc ? uc.node_id : '', use_case_nome: uc ? (uc.name_pt || uc.name) : '', use_case_path: uc ? uc.path_pt : '',
      caso_nome: f.name, versao_caso: Number(lib.version) || 0, versao_avaliada: 0, ordem: ++ordem, prioridade: 'medium', responsavel: '', data_prevista: '',
      escopo_cliente: '', criterios_ids: [], ativo: true, orfao: false, status: 'not_started', checklist: buildChecklist(lib), resultado_obtido: '',
      evidencias: [], observacoes: '', causa: '', referencia: '', ambiente: '', executado_por: '', testemunha: '', tentativas: 0, primeiro_status: '',
      iniciado_em: '', concluido_em: '', incluido_apos_aceite: baseline, removido_em: '', motivo_escopo: baseline ? motivo : '',
      autor: refs.autor, criado_em: refs.nowIso, atualizado_em: refs.nowIso,
    };
    out.created.push(row);
    out.added++;
    out.events.push(scopeEvent_(pov, row, 'incluído', baseline ? motivo : f.name, refs, baseline));
  });
  return out;
}

/** Remove (desativa) execuções do plano (pura). Depois do aceite do plano, exige motivo. Retorna {updated[], events[]}. */
function removeFromPlan(execucoes, pov, execIds, refs) {
  if (!pov) throw new Error('PoV não encontrada.');
  lockedPlan_(pov);
  var baseline = !!pov.plano_aceite_em;
  var motivo = String(refs.motivo || '').trim();
  if (baseline && motivo.length < 3) throw new Error('O plano já foi aceito pelo cliente: informe o motivo da mudança de escopo.');
  var want = {};
  (execIds || []).forEach(function (id) { want[id] = true; });
  var out = { updated: [], events: [] };
  (execucoes || []).forEach(function (e) {
    if (!want[e.exec_id] || e.pov_id !== pov.pov_id || !e.ativo) return;
    var r = JSON.parse(JSON.stringify(e));
    r.ativo = false;
    r.removido_em = refs.nowIso;
    r.motivo_escopo = baseline ? motivo : (motivo || '');
    r.autor = refs.autor;
    r.atualizado_em = refs.nowIso;
    out.updated.push(r);
    out.events.push(scopeEvent_(pov, e, 'removido', baseline ? motivo : e.caso_nome, refs, baseline));
  });
  if (!out.updated.length) throw new Error('Nenhum caso ativo do plano foi informado.');
  return out;
}

/** Item do plano como a tela e o relatório enxergam (execução + caso). */
function planItemView(e, lib) {
  var f = lib ? displayFields(lib) : null;
  var cl = lib ? normalizeChecklist(e.checklist, lib).checklist : (e.checklist || []);
  return {
    exec_id: e.exec_id, test_case_id: e.test_case_id, ordem: Number(e.ordem) || 0,
    prioridade: e.prioridade || 'medium', prioridade_label: priorityLabel(e.prioridade || 'medium'),
    status: e.status || 'not_started', status_label: execStatusLabel(e.status || 'not_started'),
    name: f ? f.name : (e.caso_nome || e.test_case_id), name_en: f && !f.custom ? f.name_en : '', summary: f ? f.summary : '',
    custom: !!(f && f.custom), translation_pending: f ? f.translation_pending : false,
    orfao: !f || !!e.orfao || !!(f && f.removed), caso_alterado: !!f && !f.removed && Number(e.versao_caso) !== f.version,
    versao_caso: Number(e.versao_caso) || 0, versao_atual: f ? f.version : 0, versao_avaliada: Number(e.versao_avaliada) || 0,
    lifecycle: f ? f.lifecycle : '', lifecycle_label: f ? f.lifecycle_label : '', lab_pass: f ? f.lab_pass : false,
    checklist: cl, resumo_checklist: checklistSummary(cl), sugestao: suggestStatus(cl),
    criterios_ids: e.criterios_ids || [], responsavel: e.responsavel || '', data_prevista: e.data_prevista || '', escopo_cliente: e.escopo_cliente || '',
    resultado_obtido: e.resultado_obtido || '', evidencias: e.evidencias || [], observacoes: e.observacoes || '',
    causa: e.causa || '', causa_label: e.causa ? causeLabel(e.causa) : '', referencia: e.referencia || '',
    ambiente: e.ambiente || '', executado_por: e.executado_por || '', testemunha: e.testemunha || '',
    tentativas: Number(e.tentativas) || 0, primeiro_status: e.primeiro_status || '',
    iniciado_em: e.iniciado_em || '', concluido_em: e.concluido_em || '', autor: e.autor || '', atualizado_em: e.atualizado_em || '',
    incluido_apos_aceite: !!e.incluido_apos_aceite, motivo_escopo: e.motivo_escopo || '',
    use_case_id: e.use_case_id || '', url: f ? f.url : '',
  };
}

/**
 * Agrupa as execuções ativas por use case (pura). Usa o nome/caminho gravados quando o nó sumiu da
 * taxonomia. Grupos na ordem do caminho; dentro, prioridade e ordem; "Sem use case" e órfãos no fim.
 */
function groupPlan(execucoes, caseIdx, taxonomia) {
  var taxById = taxIndex_(taxonomia);
  var groups = {}, orphans = [];
  (execucoes || []).filter(function (e) { return e.ativo; }).forEach(function (e) {
    var lib = caseIdx[e.test_case_id];
    var item = planItemView(e, lib);
    if (item.orfao) { orphans.push(item); return; }
    var uc = e.use_case_id ? taxById[e.use_case_id] : null;
    var key = e.use_case_id || 'sem-use-case';
    var name = uc ? (uc.name_pt || uc.name) : (e.use_case_nome || 'Sem use case');
    var path = uc ? uc.path_pt : (e.use_case_path || '');
    if (!groups[key]) groups[key] = { use_case_id: key, name: name, path: path, items: [] };
    groups[key].items.push(item);
  });
  function byPrio(a, b) { return priorityRank(a.prioridade) - priorityRank(b.prioridade) || a.ordem - b.ordem; }
  var list = Object.keys(groups).map(function (k) { return groups[k]; });
  list.sort(function (a, b) {
    if (a.use_case_id === 'sem-use-case') return 1;
    if (b.use_case_id === 'sem-use-case') return -1;
    var x = foldText(a.path || a.name), y = foldText(b.path || b.name);
    return x < y ? -1 : x > y ? 1 : 0;
  });
  function prog(items) { return computeProgress(items.map(function (i) { return { ativo: true, status: i.status, tentativas: i.tentativas, primeiro_status: i.primeiro_status }; })); }
  list.forEach(function (g) { g.items.sort(byPrio); g.progress = prog(g.items); });
  if (orphans.length) {
    orphans.sort(byPrio);
    list.push({ use_case_id: 'orfaos', name: 'Casos removidos da biblioteca', path: '', items: orphans, progress: prog(orphans) });
  }
  return list;
}

/** Mudanças de escopo desde o aceite do plano: incluídos depois e removidos depois (com motivo e último status). */
function scopeChanges(execucoes, pov) {
  var out = { incluidos: [], removidos: [] };
  if (!pov || !pov.plano_aceite_em) return out;
  var since = String(pov.plano_aceite_em);
  (execucoes || []).filter(function (e) { return e.pov_id === pov.pov_id; }).forEach(function (e) {
    var item = { exec_id: e.exec_id, caso: e.caso_nome, motivo: e.motivo_escopo || '', status: e.status, status_label: execStatusLabel(e.status) };
    if (e.ativo && e.incluido_apos_aceite) out.incluidos.push(item);
    else if (!e.ativo && e.removido_em && String(e.removido_em).slice(0, 10) >= since.slice(0, 10)) out.removidos.push(item);
  });
  return out;
}

/** Detalhe literal do caso para o painel de execução (textos + itens do checklist). */
function caseDetail(lib) {
  var f = displayFields(lib);
  f.checklist_items = checklistItems(lib);
  return f;
}

/**
 * Tudo que a tela precisa para uma PoV (pura).
 * data: {execucoes, caseIdx, taxonomia, historico, criterios, pendencias, tentativas, relatorios, hoje}.
 */
function buildPovView(pov, data) {
  var mine = (data.execucoes || []).filter(function (e) { return e.pov_id === pov.pov_id; });
  var active = mine.filter(function (e) { return e.ativo; });
  var caseIdx = data.caseIdx || {};
  var details = {};
  active.forEach(function (e) { if (caseIdx[e.test_case_id]) details[e.test_case_id] = caseDetail(caseIdx[e.test_case_id]); });
  var attempts = {};
  (data.tentativas || []).filter(function (t) { return t.pov_id === pov.pov_id; }).forEach(function (t) {
    (attempts[t.exec_id] = attempts[t.exec_id] || []).push({ n: t.n, status: t.status, status_label: execStatusLabel(t.status), resultado_obtido: t.resultado_obtido,
      causa: t.causa, causa_label: t.causa ? causeLabel(t.causa) : '', referencia: t.referencia, executado_por: t.executado_por, em: t.em });
  });
  Object.keys(attempts).forEach(function (k) { attempts[k].sort(function (a, b) { return a.n - b.n; }); });
  var nameOfExec = {};
  mine.forEach(function (e) { nameOfExec[e.exec_id] = e.caso_nome; });
  var hist = (data.historico || []).filter(function (h) { return h.pov_id === pov.pov_id; })
    .sort(function (a, b) { return String(b.em) < String(a.em) ? -1 : String(b.em) > String(a.em) ? 1 : 0; }).slice(0, 300);
  var custom = {};
  Object.keys(caseIdx).forEach(function (id) { var c = caseIdx[id]; if (c.custom && c.pov_id === pov.pov_id && !c.removido_em) custom[id] = c; });
  return {
    pov: pov,
    pov_status_label: povStatusLabel(pov.status),
    desfecho_label: pov.desfecho ? outcomeLabel(pov.desfecho) : '',
    locked: LOCKED_POV_STATUSES.indexOf(pov.status) >= 0,
    groups: groupPlan(active, caseIdx, data.taxonomia),
    progress: computeProgress(active),
    criterios: criteriaSummary(data.criterios, active, pov.pov_id),
    pendencias: pendenciasView((data.pendencias || []).filter(function (p) { return p.pov_id === pov.pov_id; }), mine, data.hoje),
    escopo: scopeChanges(mine, pov),
    details: details,
    tentativas: attempts,
    casos_proprios: Object.keys(custom).map(function (id) {
      var c = custom[id];
      return { caso_id: id, nome: c.name, resumo: c.summary, objetivos: c.objectives, resultado_esperado: c.expected_outcome, metricas: c.evaluation_metrics,
        como_testar: c.how_to, use_case_id: (c.node_ids || [])[0] || '', versao: c.version, atualizado_em: c.updated_at || '' };
    }),
    in_plan: active.map(function (e) { return e.test_case_id; }),
    relatorios: (data.relatorios || []).filter(function (r) { return r.pov_id === pov.pov_id; })
      .sort(function (a, b) { return String(b.criado_em) < String(a.criado_em) ? -1 : 1; }),
    historico: hist.map(function (h) {
      var de = h.tipo === 'status' ? execStatusLabel(h.de) : h.tipo === 'pov' ? povStatusLabel(h.de) : h.de;
      var para = h.tipo === 'status' ? execStatusLabel(h.para) : h.tipo === 'pov' ? povStatusLabel(h.para) : h.para;
      var caso = h.exec_id ? (nameOfExec[h.exec_id] || '') : (h.test_case_id && caseIdx[h.test_case_id] ? displayFields(caseIdx[h.test_case_id]).name : '');
      return { tipo: h.tipo, de: de, para: para, nota: h.nota, autor: h.autor, em: h.em, caso: caso };
    }),
  };
}

// ============================================================ Apps Script (não roda em Node)

/** Library + casos próprios (todos), indexados por id. */
function readCaseIndex_(taxonomia) {
  return caseIndex(readTable_(SHEETS.LIBRARY), readTable_(SHEETS.CASOS_PROPRIOS), taxonomia || readTable_(SHEETS.TAXONOMIA));
}

function findCaseRow_(caseId) {
  if (isCustomCaseId(caseId)) {
    var c = readTable_(SHEETS.CASOS_PROPRIOS).filter(function (x) { return x.caso_id === caseId; })[0];
    return c ? customToLibraryRow(c, readTable_(SHEETS.TAXONOMIA).reduce(function (o, n) { o[n.node_id] = n; return o; }, {})) : null;
  }
  return readTable_(SHEETS.LIBRARY).filter(function (r) { return r.id === caseId; })[0] || null;
}

function getPovView_(povId, user) {
  var pov = requirePovAccess_(povId, user);
  var taxonomia = readTable_(SHEETS.TAXONOMIA);
  return buildPovView(pov, {
    execucoes: readTable_(SHEETS.EXECUCOES), caseIdx: readCaseIndex_(taxonomia), taxonomia: taxonomia,
    historico: readTable_(SHEETS.HISTORICO), criterios: readTable_(SHEETS.CRITERIOS), pendencias: readTable_(SHEETS.PENDENCIAS),
    tentativas: readTable_(SHEETS.TENTATIVAS), relatorios: readTable_(SHEETS.RELATORIOS), hoje: fmt_()(nowIso_(), 'isodate'),
  });
}

function addToPlan_(povId, caseIds, selectedNodeIds, motivo, user) {
  return withLock_(function () {
    var pov = requirePovAccess_(povId, user);
    var taxonomia = readTable_(SHEETS.TAXONOMIA);
    var res = addCasesToPlan(readTable_(SHEETS.EXECUCOES), pov, caseIds, readCaseIndex_(taxonomia), taxonomia,
      { autor: user.email, nowIso: nowIso_(), newId: function () { return Utilities.getUuid(); }, selectedNodeIds: selectedNodeIds || [], motivo: motivo || '' });
    appendRows_(SHEETS.EXECUCOES, res.created);
    updateRowsByKey_(SHEETS.EXECUCOES, res.updated);
    appendEvents_(res.events);
    return { added: res.added, reactivated: res.reactivated, skipped: res.skipped, unknown: res.unknown.length };
  });
}

function removeFromPlan_(povId, execIds, motivo, user) {
  return withLock_(function () {
    var pov = requirePovAccess_(povId, user);
    var res = removeFromPlan(readTable_(SHEETS.EXECUCOES), pov, execIds, { autor: user.email, nowIso: nowIso_(), motivo: motivo || '' });
    updateRowsByKey_(SHEETS.EXECUCOES, res.updated);
    appendEvents_(res.events);
    return { removed: res.updated.length };
  });
}
