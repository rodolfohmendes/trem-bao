/**
 * Pendencias.js — o que falta para a PoV andar (licença, usuário de teste, SPAN, janela de mudança…),
 * com responsável (cliente, Palo Alto Networks ou parceiro), prazo e os casos afetados. Um caso só
 * pode ficar "Bloqueado" com uma pendência aberta vinculada (design §8.5).
 *
 * Parte pura: validatePendencia, createPendenciaRow, updatePendenciaRow, pendenciasView.
 * Parte Apps Script: savePendencia_.
 */

function validatePendencia(input) {
  var errors = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['Dados da pendência ausentes.'] };
  var d = String(input.descricao || '').trim();
  if (d.length < 3) errors.push('Descreva a pendência (o que falta).');
  if (d.length > LIMITS.medium) errors.push('A descrição da pendência passou de ' + LIMITS.medium + ' caracteres.');
  if (PENDING_OWNERS.indexOf(input.responsavel_tipo || 'cliente') < 0) errors.push('Responsável inválido: cliente, Palo Alto Networks ou parceiro.');
  if (String(input.responsavel_nome || '').length > LIMITS.short) errors.push('Nome do responsável passou de ' + LIMITS.short + ' caracteres.');
  if (input.prazo && !isIsoDate(input.prazo)) errors.push('Prazo inválido (use AAAA-MM-DD).');
  if (String(input.resolucao || '').length > LIMITS.medium) errors.push('A resolução passou de ' + LIMITS.medium + ' caracteres.');
  return { ok: errors.length === 0, errors: errors };
}

/** Nova pendência (pura). refs: {autor, nowIso, newId}. */
function createPendenciaRow(pov, input, execIds, refs) {
  if (!pov) throw new Error('PoV não encontrada.');
  var v = validatePendencia(input);
  if (!v.ok) throw new Error(v.errors.join(' '));
  return {
    row: {
      pend_id: refs.newId(), pov_id: pov.pov_id, descricao: String(input.descricao).trim(), responsavel_tipo: input.responsavel_tipo || 'cliente',
      responsavel_nome: String(input.responsavel_nome || '').trim(), prazo: input.prazo || '', status: 'aberta',
      exec_ids: (execIds || input.exec_ids || []).filter(function (x, i, a) { return x && a.indexOf(x) === i; }), resolucao: '',
      autor: refs.autor, criado_em: refs.nowIso, atualizado_em: refs.nowIso, resolvida_em: '',
    },
  };
}

/**
 * Edita/resolve/reabre uma pendência (pura). input: campos + {acao: 'resolver'|'reabrir'?, expected_atualizado_em}.
 * Retorna {row, events[]}.
 */
function updatePendenciaRow(cur, input, refs) {
  if (!cur) throw new Error('Pendência não encontrada.');
  if (input.expected_atualizado_em !== undefined && input.expected_atualizado_em !== null && String(input.expected_atualizado_em) !== String(cur.atualizado_em || '')) {
    var err = new Error(conflictMessage('Esta pendência', cur, true));
    err.conflict = true;
    throw err;
  }
  var r = JSON.parse(JSON.stringify(cur));
  ['descricao', 'responsavel_tipo', 'responsavel_nome', 'prazo', 'resolucao'].forEach(function (f) { if (input[f] !== undefined) r[f] = String(input[f] || '').trim(); });
  if (Array.isArray(input.exec_ids)) r.exec_ids = input.exec_ids.filter(function (x, i, a) { return x && a.indexOf(x) === i; });
  var v = validatePendencia(r);
  if (!v.ok) throw new Error(v.errors.join(' '));
  var events = [];
  if (input.acao === 'resolver' && r.status !== 'resolvida') {
    r.status = 'resolvida';
    r.resolvida_em = refs.nowIso;
    events.push({ pov_id: r.pov_id, exec_id: '', test_case_id: '', tipo: 'pendencia', de: 'aberta', para: 'resolvida', nota: r.descricao + (r.resolucao ? ' — ' + r.resolucao : ''), autor: refs.autor, em: refs.nowIso });
  } else if (input.acao === 'reabrir' && r.status !== 'aberta') {
    r.status = 'aberta';
    r.resolvida_em = '';
    events.push({ pov_id: r.pov_id, exec_id: '', test_case_id: '', tipo: 'pendencia', de: 'resolvida', para: 'aberta', nota: r.descricao, autor: refs.autor, em: refs.nowIso });
  }
  r.autor = refs.autor;
  r.atualizado_em = refs.nowIso;
  return { row: r, events: events };
}

/** Lista para a tela/relatórios: abertas primeiro (prazo mais próximo), com casos afetados e atraso. hoje = 'AAAA-MM-DD'. */
function pendenciasView(pendencias, execs, hoje) {
  var nameOf = {};
  (execs || []).forEach(function (e) { nameOf[e.exec_id] = e.caso_nome; });
  return (pendencias || []).slice().sort(function (a, b) {
    if (a.status !== b.status) return a.status === 'aberta' ? -1 : 1;
    var pa = a.prazo || '9999', pb = b.prazo || '9999';
    return pa < pb ? -1 : pa > pb ? 1 : (String(a.criado_em) < String(b.criado_em) ? -1 : 1);
  }).map(function (p) {
    return {
      pend_id: p.pend_id, descricao: p.descricao, responsavel_tipo: p.responsavel_tipo, responsavel_label: pendingOwnerLabel(p.responsavel_tipo),
      responsavel_nome: p.responsavel_nome, prazo: p.prazo, status: p.status, atrasada: p.status === 'aberta' && !!p.prazo && !!hoje && p.prazo < hoje,
      exec_ids: p.exec_ids || [], casos: (p.exec_ids || []).map(function (id) { return nameOf[id] || ''; }).filter(Boolean),
      resolucao: p.resolucao, resolvida_em: p.resolvida_em, criado_em: p.criado_em, atualizado_em: p.atualizado_em, autor: p.autor,
    };
  });
}

// ============================================================ Apps Script (não roda em Node)

/** Cria (sem pend_id) ou edita/resolve/reabre uma pendência. */
function savePendencia_(povId, input, user) {
  return withLock_(function () {
    var pov = requirePovAccess_(povId, user);
    var refs = { autor: user.email, nowIso: nowIso_(), newId: function () { return Utilities.getUuid(); } };
    if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error('A PoV está "' + povStatusLabel(pov.status) + '". Reabra a PoV para mudar pendências.');
    if (input && input.pend_id) {
      var cur = readTable_(SHEETS.PENDENCIAS).filter(function (p) { return p.pend_id === input.pend_id && p.pov_id === povId; })[0];
      var res = updatePendenciaRow(cur, input, refs);
      updateRowsByKey_(SHEETS.PENDENCIAS, [res.row]);
      appendEvents_(res.events);
      return res.row;
    }
    var created = createPendenciaRow(pov, input || {}, (input && input.exec_ids) || [], refs).row;
    appendRows_(SHEETS.PENDENCIAS, [created]);
    appendEvents_([{ pov_id: povId, exec_id: '', test_case_id: '', tipo: 'pendencia', de: '', para: 'aberta', nota: created.descricao, autor: user.email, em: refs.nowIso }]);
    return created;
  });
}
