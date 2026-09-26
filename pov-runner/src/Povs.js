/**
 * Povs.js — cadastro da PoV (design §5.4), ciclo de vida (aceite do plano → execução → encerramento
 * com aceite do resultado; reabrir; cancelar), controle de acesso e a lista da tela inicial.
 *
 * Parte pura: validatePov, createPovRow, updatePovRow, transitionPov, parseEmails, isAuthorizedUser,
 *   isAdminUser, canAccessPov, listPovSummaries.
 * Parte Apps Script: findPov_, requirePovAccess_, savePov_, transitionPov_, listPovs_, appendEvents_, withId_.
 */

var POV_TEXT_FIELDS = ['cliente', 'titulo', 'oportunidade', 'responsavel', 'equipe', 'contato_cliente', 'ambiente', 'objetivo', 'observacoes', 'inicio', 'fim_previsto'];

/** Valida os campos da PoV. Retorna {ok, errors[]} com mensagens em português. */
function validatePov(input) {
  var errors = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['Dados da PoV ausentes.'] };
  var cliente = String(input.cliente || '').trim(), titulo = String(input.titulo || '').trim();
  if (cliente.length < 2) errors.push('Informe o cliente.');
  if (titulo.length < 2) errors.push('Informe o título da PoV.');
  if (cliente.length > LIMITS.short) errors.push('Cliente passou de ' + LIMITS.short + ' caracteres.');
  if (titulo.length > LIMITS.short) errors.push('Título passou de ' + LIMITS.short + ' caracteres.');
  [['oportunidade', 'Oportunidade'], ['responsavel', 'Responsável'], ['equipe', 'Equipe'], ['contato_cliente', 'Contato no cliente']].forEach(function (f) {
    if (String(input[f[0]] || '').length > LIMITS.medium) errors.push(f[1] + ' passou de ' + LIMITS.medium + ' caracteres.');
  });
  if (String(input.ambiente || '').length > LIMITS.short) errors.push('Ambiente passou de ' + LIMITS.short + ' caracteres.');
  [['objetivo', 'Objetivo'], ['observacoes', 'Observações'], ['resumo_executivo', 'Resumo executivo'], ['proximos_passos', 'Próximos passos']].forEach(function (f) {
    if (String(input[f[0]] || '').length > LIMITS.long) errors.push(f[1] + ' passou de ' + LIMITS.long + ' caracteres.');
  });
  if (input.inicio && !isIsoDate(input.inicio)) errors.push('Data de início inválida (use AAAA-MM-DD).');
  if (input.fim_previsto && !isIsoDate(input.fim_previsto)) errors.push('Data de fim inválida (use AAAA-MM-DD).');
  if (isIsoDate(input.inicio) && isIsoDate(input.fim_previsto) && input.fim_previsto < input.inicio) errors.push('O fim previsto é anterior ao início.');
  return { ok: errors.length === 0, errors: errors };
}

function cleanPovFields_(input) {
  var out = {};
  POV_TEXT_FIELDS.forEach(function (f) { if (input[f] !== undefined) out[f] = String(input[f] == null ? '' : input[f]).replace(/\r\n/g, '\n').trim(); });
  return out;
}

function povEvent_(pov, de, para, nota, refs, tipo) {
  return { pov_id: pov.pov_id, exec_id: '', test_case_id: '', tipo: tipo || 'pov', de: de || '', para: para || '', nota: nota || '', autor: refs.autor, em: refs.nowIso };
}

/** Nova PoV (pura). refs: {autor, nowIso, newId, library_export_date}. */
function createPovRow(input, refs) {
  var v = validatePov(input);
  if (!v.ok) throw new Error(v.errors.join(' '));
  var f = cleanPovFields_(input);
  var row = {};
  SCHEMA.PoVs.columns.forEach(function (c) { row[c] = ''; });
  POV_TEXT_FIELDS.forEach(function (k) { row[k] = f[k] || ''; });
  row.pov_id = refs.newId();
  row.status = 'planning';
  row.criado_por = refs.autor;
  row.autor = refs.autor;
  row.criado_em = refs.nowIso;
  row.atualizado_em = refs.nowIso;
  row.library_export_date = refs.library_export_date || '';
  if (!row.responsavel) row.responsavel = refs.autor;
  return { row: row, events: [povEvent_(row, '', 'planning', 'PoV criada', refs)] };
}

function checkPovConflict_(current, input) {
  if (input.expected_atualizado_em !== undefined && input.expected_atualizado_em !== null &&
      String(input.expected_atualizado_em) !== String(current.atualizado_em || '')) {
    var err = new Error(conflictMessage('Esta PoV', current, true));
    err.conflict = true;
    throw err;
  }
}

/** Edição dos campos (pura). O status só muda por transitionPov. Retorna {row, events}. */
function updatePovRow(current, input, refs) {
  if (!current) throw new Error('PoV não encontrada.');
  if (LOCKED_POV_STATUSES.indexOf(current.status) >= 0) throw new Error('A PoV está "' + povStatusLabel(current.status) + '". Reabra a PoV para editar.');
  checkPovConflict_(current, input);
  var merged = JSON.parse(JSON.stringify(current));
  var f = cleanPovFields_(input);
  Object.keys(f).forEach(function (k) { merged[k] = f[k]; });
  var v = validatePov(merged);
  if (!v.ok) throw new Error(v.errors.join(' '));
  merged.autor = refs.autor;
  merged.atualizado_em = refs.nowIso;
  return { row: merged, events: [] };
}

/**
 * Transições do ciclo de vida (pura). action:
 *  - 'aceitar_plano' (planejamento → em execução): {por, em, obs} ou {sem_aceite: true, motivo}
 *  - 'encerrar' (em execução → concluída): {resumo_executivo, proximos_passos, desfecho, competidor, aceite_por, aceite_em, aceite_obs} ou {sem_aceite, motivo}
 *  - 'reabrir' (concluída/cancelada → em execução ou planejamento): {motivo}
 *  - 'cancelar' (planejamento/em execução → cancelada): {motivo}
 * Retorna {row, events}.
 */
function transitionPov(current, action, input, refs) {
  if (!current) throw new Error('PoV não encontrada.');
  input = input || {};
  checkPovConflict_(current, input);
  var r = JSON.parse(JSON.stringify(current));
  var events = [];
  var motivo = String(input.motivo || '').trim();
  function need(cond, msg) { if (!cond) throw new Error(msg); }
  function dateOr(d) { return d && isIsoDate(d) ? d : (refs.hoje || refs.nowIso.slice(0, 10)); }
  if (action === 'aceitar_plano') {
    need(current.status === 'planning', 'O aceite do plano é registrado com a PoV em planejamento.');
    if (input.sem_aceite) {
      need(motivo.length >= 5, 'Explique por que a PoV começa sem aceite formal do plano.');
      r.plano_aceite_por = '';
      r.plano_aceite_obs = 'Sem aceite formal: ' + motivo;
    } else {
      need(String(input.por || '').trim().length >= 2, 'Informe quem aceitou o plano no cliente (nome e cargo).');
      r.plano_aceite_por = String(input.por).trim().slice(0, LIMITS.short);
      r.plano_aceite_obs = String(input.obs || '').trim().slice(0, LIMITS.medium);
    }
    r.plano_aceite_em = dateOr(input.em);
    r.status = 'running';
    events.push(povEvent_(r, '', 'plano aceito', r.plano_aceite_por ? 'por ' + r.plano_aceite_por : r.plano_aceite_obs, refs, 'aceite'));
    events.push(povEvent_(r, 'planning', 'running', '', refs));
  } else if (action === 'encerrar') {
    need(current.status === 'running', 'Só uma PoV em execução pode ser encerrada.');
    need(!input.desfecho || POV_OUTCOMES.indexOf(input.desfecho) >= 0, 'Desfecho inválido.');
    ['resumo_executivo', 'proximos_passos'].forEach(function (k) { if (input[k] !== undefined) r[k] = String(input[k] || '').replace(/\r\n/g, '\n').trim(); });
    var v = validatePov(r);
    if (!v.ok) throw new Error(v.errors.join(' '));
    if (input.sem_aceite) {
      need(motivo.length >= 5, 'Explique por que a PoV termina sem aceite formal do resultado.');
      r.resultado_aceite_por = '';
      r.resultado_aceite_obs = 'Sem aceite formal: ' + motivo;
    } else {
      need(String(input.aceite_por || '').trim().length >= 2, 'Informe quem aceitou o resultado no cliente, ou marque "sem aceite formal" com o motivo.');
      r.resultado_aceite_por = String(input.aceite_por).trim().slice(0, LIMITS.short);
      r.resultado_aceite_obs = String(input.aceite_obs || '').trim().slice(0, LIMITS.medium);
    }
    r.resultado_aceite_em = dateOr(input.aceite_em);
    r.desfecho = input.desfecho || 'open';
    r.competidor = String(input.competidor || '').trim().slice(0, LIMITS.short);
    r.status = 'done';
    events.push(povEvent_(r, '', 'resultado aceito', r.resultado_aceite_por ? 'por ' + r.resultado_aceite_por : r.resultado_aceite_obs, refs, 'aceite'));
    events.push(povEvent_(r, 'running', 'done', outcomeLabel(r.desfecho), refs));
  } else if (action === 'reabrir') {
    need(LOCKED_POV_STATUSES.indexOf(current.status) >= 0, 'Só uma PoV concluída ou cancelada pode ser reaberta.');
    need(motivo.length >= 5, 'Explique por que a PoV está sendo reaberta.');
    r.status = current.plano_aceite_em ? 'running' : 'planning';
    var antes = current.resultado_aceite_em ? ' (encerramento anterior: aceite em ' + current.resultado_aceite_em +
      (current.resultado_aceite_por ? ' por ' + current.resultado_aceite_por : '') + (current.desfecho ? ', ' + outcomeLabel(current.desfecho) : '') + ')' : '';
    // o aceite e o desfecho anteriores ficam no histórico; na PoV reaberta eles não valem mais
    r.resultado_aceite_em = ''; r.resultado_aceite_por = ''; r.resultado_aceite_obs = ''; r.desfecho = ''; r.competidor = '';
    events.push(povEvent_(r, current.status, r.status, motivo + antes, refs));
  } else if (action === 'cancelar') {
    need(current.status === 'planning' || current.status === 'running', 'Esta PoV já está encerrada.');
    need(motivo.length >= 5, 'Explique por que a PoV está sendo cancelada.');
    r.status = 'cancelled';
    events.push(povEvent_(r, current.status, 'cancelled', motivo, refs));
  } else {
    throw new Error('Ação desconhecida: ' + action);
  }
  r.autor = refs.autor;
  r.atualizado_em = refs.nowIso;
  return { row: r, events: events };
}

// ---------------------------------------------------------------- acesso

/** E-mails de um texto livre ("Ana <ana@x.com>, bob@y.com") em minúsculas, sem repetição. */
function parseEmails(text) {
  var out = [];
  (String(text || '').toLowerCase().match(/[a-z0-9._%+'-]+@[a-z0-9.-]+\.[a-z]{2,}/g) || []).forEach(function (e) { if (out.indexOf(e) < 0) out.push(e); });
  return out;
}

/**
 * Pode usar o app? `usuariosCfg` = lista de e-mails e/ou domínios ("@empresa.com"), separados por
 * vírgula, espaço ou linha. Vazio = qualquer e-mail identificado (o acesso do web app já limita ao domínio).
 */
function isAuthorizedUser(email, usuariosCfg) {
  email = String(email || '').toLowerCase();
  if (!email || email.indexOf('@') < 0) return false;
  var text = String(usuariosCfg || '').toLowerCase();
  var emails = parseEmails(text);
  var domains = (text.match(/(^|[\s,;<])(@[a-z0-9.-]+\.[a-z]{2,})/g) || []).map(function (d) { return d.replace(/^[\s,;<]+/, ''); });
  if (!emails.length && !domains.length) return true;
  return emails.indexOf(email) >= 0 || domains.some(function (d) { return email.slice(-d.length) === d; });
}

/** Administrador: quem publicou o app (dono dos dados) ou quem está em Config.admins. */
function isAdminUser(email, adminsCfg, ownerEmail) {
  email = String(email || '').toLowerCase();
  if (!email) return false;
  if (ownerEmail && email === String(ownerEmail).toLowerCase()) return true;
  return parseEmails(adminsCfg).indexOf(email) >= 0;
}

/**
 * Vê/edita a PoV? Em Config.visibilidade = 'todos', qualquer usuário autorizado; no padrão
 * ('equipe'), só administradores, quem criou, o responsável e os e-mails do campo equipe.
 */
function canAccessPov(pov, email, isAdmin, visibilidade) {
  if (isAdmin || visibilidade === 'todos') return true;
  email = String(email || '').toLowerCase();
  if (!email) return false;
  if (String(pov.criado_por || '').toLowerCase() === email) return true;
  return parseEmails(pov.responsavel).indexOf(email) >= 0 || parseEmails(pov.equipe).indexOf(email) >= 0;
}

/**
 * Lista para a tela inicial com o progresso e os critérios de cada PoV visível.
 * filter: {status, q, mine}. access: {email, isAdmin, visibilidade}.
 * Ordem: em execução, planejamento, concluída, cancelada; depois atualização mais recente.
 */
function listPovSummaries(povs, execucoes, criterios, filter, access) {
  filter = filter || {};
  access = access || {};
  var byPov = {}, critByPov = {};
  (execucoes || []).forEach(function (e) { (byPov[e.pov_id] = byPov[e.pov_id] || []).push(e); });
  (criterios || []).forEach(function (c) { (critByPov[c.pov_id] = critByPov[c.pov_id] || []).push(c); });
  var rank = { running: 0, planning: 1, done: 2, cancelled: 3 };
  var q = foldText(filter.q || '').trim();
  var email = String(access.email || '').toLowerCase();
  return (povs || []).filter(function (p) {
    if (!canAccessPov(p, email, access.isAdmin, access.visibilidade)) return false;
    if (filter.status && p.status !== filter.status) return false;
    if (filter.mine && email) {
      var mine = String(p.criado_por || '').toLowerCase() === email || parseEmails(p.responsavel).indexOf(email) >= 0 || parseEmails(p.equipe).indexOf(email) >= 0;
      if (!mine) return false;
    }
    if (q && foldText([p.cliente, p.titulo, p.oportunidade, p.responsavel].join(' ')).indexOf(q) < 0) return false;
    return true;
  }).map(function (p) {
    var ex = byPov[p.pov_id] || [];
    var cs = criteriaSummary(critByPov[p.pov_id] || [], ex, p.pov_id);
    return {
      pov_id: p.pov_id, cliente: p.cliente, titulo: p.titulo, oportunidade: p.oportunidade, responsavel: p.responsavel,
      inicio: p.inicio, fim_previsto: p.fim_previsto, status: p.status, status_label: povStatusLabel(p.status),
      desfecho: p.status === 'done' ? p.desfecho : '', desfecho_label: p.status === 'done' && p.desfecho ? outcomeLabel(p.desfecho) : '', plano_aceito: !!p.plano_aceite_em,
      atualizado_em: p.atualizado_em, progress: computeProgress(ex),
      criterios: { total: cs.total, obrigatorios: cs.obrigatorios, obrigatorios_atendidos: cs.obrigatorios_atendidos },
    };
  }).sort(function (a, b) {
    var ra = a.status in rank ? rank[a.status] : 9, rb = b.status in rank ? rank[b.status] : 9;
    if (ra !== rb) return ra - rb;
    return String(b.atualizado_em) < String(a.atualizado_em) ? -1 : String(b.atualizado_em) > String(a.atualizado_em) ? 1 : 0;
  });
}

// ============================================================ Apps Script (não roda em Node)

function findPov_(povId) {
  var found = null;
  readTable_(SHEETS.POVS).forEach(function (p) { if (p.pov_id === povId) found = p; });
  if (!found) throw new Error('PoV não encontrada: ' + povId);
  return found;
}

/** PoV que o usuário pode ver/editar, ou erro. */
function requirePovAccess_(povId, user) {
  var pov = findPov_(povId);
  if (!canAccessPov(pov, user.email, user.admin, user.visibilidade)) throw new Error('Você não faz parte da equipe desta PoV. Peça ao responsável para incluir seu e-mail no campo Equipe.');
  return pov;
}

/** Cria (sem pov_id) ou edita os campos (com pov_id) de uma PoV. */
function savePov_(input, user) {
  return withLock_(function () {
    var refs = { autor: user.email, nowIso: nowIso_(), newId: function () { return Utilities.getUuid(); }, library_export_date: getConfig_('library_export_date') };
    var res;
    if (input && input.pov_id) {
      res = updatePovRow(requirePovAccess_(input.pov_id, user), input, refs);
      updateRowsByKey_(SHEETS.POVS, [res.row]);
    } else {
      res = createPovRow(input || {}, refs);
      appendRows_(SHEETS.POVS, [res.row]);
    }
    appendEvents_(res.events);
    return res.row;
  });
}

function transitionPov_(povId, action, input, user) {
  return withLock_(function () {
    var now = nowIso_();
    var res = transitionPov(requirePovAccess_(povId, user), action, input || {}, { autor: user.email, nowIso: now, hoje: fmt_()(now, 'isodate') });
    updateRowsByKey_(SHEETS.POVS, [res.row]);
    appendEvents_(res.events);
    return res.row;
  });
}

function listPovs_(filter, user) {
  return listPovSummaries(readTable_(SHEETS.POVS), readTable_(SHEETS.EXECUCOES), readTable_(SHEETS.CRITERIOS), filter || {},
    { email: user.email, isAdmin: user.admin, visibilidade: user.visibilidade });
}

function withId_(obj, key) {
  var o = JSON.parse(JSON.stringify(obj));
  o[key] = Utilities.getUuid();
  return o;
}

/** Grava eventos no Historico (append-only). */
function appendEvents_(events) {
  if (!events || !events.length) return;
  appendRows_(SHEETS.HISTORICO, events.map(function (ev) { return withId_(ev, 'evento_id'); }));
}
