/**
 * Relatorio.js — documentos da PoV (design §10): plano de testes, relatório de resultados e status
 * semanal, cada um em versão interna ou para o cliente; filtro de audiência (o mesmo que a tela usa
 * no "modo cliente"), verificação de vazamento, nome de arquivo e CSV; renderização e Drive.
 *
 * Parte pura: redactText, caseForAudience, buildReportModel, leakCheck, reportFileBaseName, reportToCsv.
 * Parte Apps Script: previewReport_, saveReport_, exportCsv_, pdfBase64_, pastas do Drive.
 */

var REPORT_TITLES = { plano: 'Plano de testes', resultados: 'Relatório de resultados', status: 'Status da PoV' };
var REDACTED = '[link interno omitido]';
/** Sites públicos de documentação: links para eles podem ir para o cliente. */
var PUBLIC_URL_HOSTS = ['docs.paloaltonetworks.com', 'www.paloaltonetworks.com', 'paloaltonetworks.com', 'pan.dev'];

function urlHost_(u) {
  var m = String(u || '').match(/^https?:\/\/([^\/?#:]+)/i);
  return m ? m[1].toLowerCase() : '';
}

/**
 * Troca por "[link interno omitido]" todo link do texto que não esteja em `allowed` ({url:true}) nem
 * aponte para um site público de documentação (PUBLIC_URL_HOSTS).
 */
function redactText(text, allowed) {
  var n = 0;
  var out = String(text == null ? '' : text).replace(/https?:\/\/[^\s<>"')\]]+/gi, function (u) {
    var clean = u.replace(/[.,;:!?]+$/, '');
    var tail = u.slice(clean.length);
    if ((allowed && allowed[clean]) || PUBLIC_URL_HOSTS.indexOf(urlHost_(clean)) >= 0) return u;
    n++;
    return REDACTED + tail;
  });
  return { text: out, count: n };
}

/**
 * Campos de exibição filtrados pela audiência. 'cliente' remove posicionamento competitivo, status de
 * laboratório, notas da biblioteca, value drivers, docs internas e o link do POV Companion, e troca
 * links internos citados no texto literal. Retorna uma cópia com `redactions` (quantos links trocados).
 */
function caseForAudience(fields, publico) {
  var f = JSON.parse(JSON.stringify(fields || {}));
  f.redactions = 0;
  if (publico !== 'cliente') return f;
  f.docs = (f.docs || []).filter(function (d) { return d.url && d.audience === 'customer'; });
  var allowed = {};
  f.docs.forEach(function (d) { allowed[d.url] = true; });
  function r(s) { var x = redactText(s, allowed); f.redactions += x.count; return x.text; }
  ['summary', 'description', 'expected_outcome', 'how_to'].forEach(function (k) { f[k] = r(f[k]); });
  f.objectives = (f.objectives || []).map(r);
  f.evaluation_metrics = (f.evaluation_metrics || []).map(r);
  f.prerequisites = (f.prerequisites || []).map(function (p) { return { id: p.id, name: r(p.name), description: r(p.description || '') }; });
  f.competitors = [];
  f.lab_tests = [];
  f.tested = false;
  f.test_result = ''; f.test_result_label = ''; f.test_environment = ''; f.test_at = '';
  f.notes = [];
  f.value_drivers = [];
  f.url = '';
  f.name_en = '';
  f.translation_pending = false;
  return f;
}

function markOf_(ok) { return ok === true ? 'ok' : ok === false ? 'nok' : ok === 'na' ? 'na' : 'pend'; }

/**
 * Modelo do documento.
 * data: {execucoes, caseIdx, taxonomia, criterios, pendencias, tentativas};
 * opts: {tipo: 'plano'|'resultados'|'status', publico: 'interno'|'cliente', detalhe: bool};
 * refs: {autor, nowIso, fmt(iso, kind), config: {library_export_date, translation_date}, competitorNames: []}.
 */
function buildReportModel(pov, data, opts, refs) {
  opts = opts || {};
  var tipo = REPORT_TYPES.indexOf(opts.tipo) >= 0 ? opts.tipo : 'resultados';
  var publico = AUDIENCES.indexOf(opts.publico) >= 0 ? opts.publico : 'interno';
  var interno = publico === 'interno';
  var comResultados = tipo !== 'plano';
  var detalhe = tipo === 'status' ? false : (opts.detalhe !== undefined ? !!opts.detalhe : !(tipo === 'plano' && !interno));
  var fmt = refs.fmt || fixedOffsetFormatter(-180);
  var caseIdx = data.caseIdx || {};
  var mine = withCurrentNames((data.execucoes || []).filter(function (e) { return e.pov_id === pov.pov_id; }), caseIdx, data.taxonomia);
  var active = mine.filter(function (e) { return e.ativo; });
  var groups = groupPlan(active, caseIdx, data.taxonomia);
  var crit = criteriaSummary(data.criterios, active, pov.pov_id);
  var critNum = {};
  crit.list.forEach(function (c) { critNum[c.crit_id] = 'C' + c.n; });
  var attemptsBy = {};
  (data.tentativas || []).forEach(function (t) { if (t.pov_id === pov.pov_id) (attemptsBy[t.exec_id] = attemptsBy[t.exec_id] || []).push(t); });
  var redactions = 0;
  function redactCount_(r) { redactions += r.count; return r.text; }
  // links que podem ir para o cliente: evidências marcadas para o cliente (texto livre do SC também passa pela troca)
  var clientUrls = {};
  active.forEach(function (e) { (e.evidencias || []).forEach(function (x) { if (x.cliente === true && safeUrl(x.url)) clientUrls[safeUrl(x.url)] = true; }); });
  function sc(text) { return interno ? (text || '') : redactCount_(redactText(text || '', clientUrls)); }

  var n = 0;
  var casos = [];
  var porUseCase = groups.map(function (g) {
    var prio = { high: 0, medium: 0, low: 0 };
    g.items.forEach(function (it) {
      prio[it.prioridade] = (prio[it.prioridade] || 0) + 1;
      var lib = caseIdx[it.test_case_id];
      var f0 = lib ? displayFields(lib) : null;
      var f = f0 ? caseForAudience(f0, publico) : null;
      if (f) redactions += f.redactions;
      var byTi = {};
      (it.checklist || []).forEach(function (c) { if (!c.removido) byTi[c.t + ':' + c.i] = c; });
      function mark(c) { return comResultados && c ? markOf_(c.ok) : null; }
      function markLabel(t, c) { return comResultados && c ? checkMarkLabel(t, c.ok) : ''; }
      var steps = f ? (f.objectives || []).map(function (text, i) {
        if (isHeaderItem(text)) return isBlankText(text) ? null : { header: true, text: text };
        var c = byTi['step:' + i];
        return { header: false, text: text, mark: mark(c), mark_label: markLabel('step', c), obs: comResultados && c ? sc(c.obs) : '' };
      }).filter(Boolean) : [];
      var outItem = byTi['out:0'];
      var attempts = (attemptsBy[it.exec_id] || []).slice().sort(function (a, b) { return a.n - b.n; });
      var lastAttempt = attempts.length ? attempts[attempts.length - 1] : null;
      var evid = (it.evidencias || []).filter(function (e) { return safeUrl(e.url) && (interno || e.cliente === true); });
      var d = {
        n: ++n,
        exec_id: it.exec_id,
        name: it.name,
        name_en: interno && f && f.name_en && f.name_en !== f.name ? f.name_en : '',
        custom: it.custom,
        use_case: g.name,
        prioridade: it.prioridade,
        prioridade_label: it.prioridade_label,
        responsavel: it.responsavel,
        data_prevista: dateBr(it.data_prevista),
        status: it.status,
        status_label: it.status_label,
        resumo_checklist: comResultados ? it.resumo_checklist : '',
        executado_por: comResultados ? it.executado_por : '',
        data: comResultados ? fmt(it.concluido_em || '', 'date') : '',
        criterios: (it.criterios_ids || []).map(function (id) { return critNum[id]; }).filter(Boolean).join(', '),
        orfao: it.orfao,
        summary: f && !isBlankText(f.summary) ? f.summary : '',
        description: f && !isBlankText(f.description) ? f.description : '',
        steps: steps,
        aceite: f && !isBlankText(f.expected_outcome) ? { text: f.expected_outcome, mark: mark(outItem), mark_label: markLabel('out', outItem), obs: comResultados && outItem ? sc(outItem.obs) : '' } : null,
        metricas: f ? (f.evaluation_metrics || []).map(function (text, i) {
          if (isBlankText(text)) return null;
          var c = byTi['met:' + i];
          return { text: text, valor: comResultados && c ? sc(c.obs) : '', mark: comResultados && c && (c.ok === true || c.ok === false) ? markOf_(c.ok) : null,
            mark_label: comResultados && c && (c.ok === true || c.ok === false) ? checkMarkLabel('met', c.ok) : '' };
        }).filter(Boolean) : [],
        prereqs: f ? (f.prerequisites || []).map(function (p, i) {
          var c = byTi['prereq:' + i];
          return { text: p.name, description: p.description || '', mark: mark(c), mark_label: markLabel('prereq', c), obs: comResultados && c ? sc(c.obs) : '' };
        }) : [],
        removidos: interno && comResultados ? (it.checklist || []).filter(function (c) { return c.removido; }).map(function (c) { return { text: c.txt, mark: markOf_(c.ok), obs: c.obs }; }) : [],
        how_to: f && !isBlankText(f.how_to) ? f.how_to : '',
        docs: f ? f.docs.filter(function (x) { return x.url; }).map(function (x) { return { label: x.label, url: x.url }; }) : [],
        escopo_cliente: sc(it.escopo_cliente),
        resultado_obtido: comResultados ? sc(it.resultado_obtido) : '',
        evidencias: comResultados ? evid.map(function (e) { return { label: e.label || e.url, url: safeUrl(e.url) }; }) : [],
        evidencias_internas: comResultados && !interno ? (it.evidencias || []).length - evid.length : 0,
        testemunha: comResultados ? it.testemunha : '',
        ambiente: it.ambiente,
        reteste: comResultados && it.tentativas > 1 && lastAttempt ? 'Re-executado: tentativa ' + it.tentativas + ' em ' + fmt(lastAttempt.em, 'date') +
          (it.primeiro_status && it.primeiro_status !== it.status ? ' (primeiro resultado: ' + execStatusLabel(it.primeiro_status) + ')' : '') : '',
        // somente interno
        tentativas: interno && comResultados ? attempts.map(function (t) {
          return { n: t.n, status_label: execStatusLabel(t.status), em: fmt(t.em, 'datetime'), causa: t.causa ? causeLabel(t.causa) : '', referencia: t.referencia || '', resultado: t.resultado_obtido || '' };
        }) : [],
        causa: interno && comResultados && it.causa ? causeLabel(it.causa) : '',
        referencia: interno && comResultados ? it.referencia : '',
        observacoes: interno && comResultados ? it.observacoes : '',
        notes: interno && f ? f.notes.filter(function (t) { return !isBlankText(t); }) : [],
        value_drivers: interno && f ? f.value_drivers : [],
        lab: interno && f0 && !f0.custom ? (f0.lab_tests.length ? f0.lab_tests.map(function (t) { return t.result_label + ' em ' + t.env + (t.at ? ' (' + dateBr(t.at) + ')' : ''); }).join('; ') : 'não testado no laboratório') : '',
        lifecycle_label: interno && f0 ? f0.lifecycle_label : '',
        competitors: interno && f ? f.competitors : [],
        url: interno && f ? f.url : '',
        translation_pending: interno && f0 ? f0.translation_pending : false,
        caso_alterado: interno ? it.caso_alterado : false,
        versao: interno ? 'v' + it.versao_caso + (it.versao_avaliada && it.versao_avaliada !== it.versao_caso ? ' (avaliado na v' + it.versao_avaliada + ')' : '') : '',
      };
      casos.push(d);
    });
    var pr = g.progress;
    return { name: g.name, total: pr.total, alta: prio.high, media: prio.medium, baixa: prio.low, concluidos: pr.concluidos, aprovados: pr.aprovados,
      parciais: pr.parciais, reprovados: pr.reprovados, bloqueados: pr.bloqueados, nao_aplicaveis: pr.nao_aplicaveis, taxa: pr.taxa_aprovacao };
  });

  // agenda: casos não concluídos com data prevista (plano: todos com data)
  var agendaMap = {};
  casos.forEach(function (c) {
    if (!c.data_prevista) return;
    if (tipo !== 'plano' && isFinalStatus(c.status)) return;
    var it = active.filter(function (e) { return e.exec_id === c.exec_id; })[0];
    var key = it ? it.data_prevista : '';
    (agendaMap[key] = agendaMap[key] || []).push({ n: c.n, name: c.name, responsavel: c.responsavel, use_case: c.use_case, status_label: c.status_label });
  });
  var agenda = Object.keys(agendaMap).sort().map(function (k) { return { data: dateBr(k), itens: agendaMap[k] }; });
  var pend = pendenciasView((data.pendencias || []).filter(function (p) { return p.pov_id === pov.pov_id; }), mine, fmt(refs.nowIso, 'isodate'))
    .filter(function (p) { return p.status === 'aberta' || (interno && tipo === 'resultados'); })
    .map(function (p) { p.descricao = sc(p.descricao); p.resolucao = sc(p.resolucao); return p; });
  var escopo = tipo === 'plano' ? { incluidos: [], removidos: [] } : scopeChanges(mine, pov);
  escopo.incluidos.concat(escopo.removidos).forEach(function (x) { x.motivo = sc(x.motivo); });

  var progress = computeProgress(active);
  var cfg = refs.config || {};
  var periodo = [dateBr(pov.inicio), dateBr(pov.fim_previsto)].filter(Boolean).join(' a ');
  var marca = interno ? 'USO INTERNO — Palo Alto Networks' : 'Preparado para ' + pov.cliente + ' · Palo Alto Networks · Confidencial';
  var model = {
    tipo: tipo, publico: publico, interno: interno, resultados: tipo === 'resultados', status: tipo === 'status', plano: tipo === 'plano', detalhe: detalhe,
    titulo: REPORT_TITLES[tipo],
    marca: marca,
    pov: {
      cliente: pov.cliente, titulo: pov.titulo, oportunidade: interno ? pov.oportunidade : '', responsavel: pov.responsavel, equipe: pov.equipe,
      contato_cliente: pov.contato_cliente, periodo: periodo, ambiente: pov.ambiente, status_label: povStatusLabel(pov.status), objetivo: sc(pov.objetivo),
      observacoes: interno ? (pov.observacoes || '') : '',
      // "sem aceite formal: <motivo>" é anotação interna; o cliente só vê que não houve aceite formal
      plano_aceite: pov.plano_aceite_em ? { em: dateBr(pov.plano_aceite_em), por: pov.plano_aceite_por, sem_aceite: !pov.plano_aceite_por,
        obs: interno || pov.plano_aceite_por ? sc(pov.plano_aceite_obs) : '' } : null,
      // aceite do resultado só vale para a PoV encerrada (uma PoV reaberta ainda está mudando)
      resultado_aceite: pov.status === 'done' && pov.resultado_aceite_em ? { em: dateBr(pov.resultado_aceite_em), por: pov.resultado_aceite_por, sem_aceite: !pov.resultado_aceite_por,
        obs: interno || pov.resultado_aceite_por ? sc(pov.resultado_aceite_obs) : '' } : null,
      resumo_executivo: tipo === 'resultados' ? sc(pov.resumo_executivo) : '',
      proximos_passos: tipo !== 'plano' ? sc(pov.proximos_passos) : '',
      desfecho_label: interno && pov.status === 'done' && pov.desfecho ? outcomeLabel(pov.desfecho) : '',
      competidor: interno && pov.status === 'done' ? (pov.competidor || '') : '',
    },
    gerado: { data: fmt(refs.nowIso, 'datetime'), autor: refs.autor || '' },
    library: { export_date: dateBr(cfg.library_export_date), translation_date: dateBr(cfg.translation_date) },
    progress: progress,
    criterios: crit.list.map(function (c) {
      return { n: c.n, texto: sc(c.texto), peso_label: c.peso_label, obrigatorio: c.peso === 'obrigatorio', veredito: c.veredito, veredito_label: c.veredito_label,
        manual: c.manual, justificativa: sc(c.justificativa), casos: c.casos.map(function (x) { return x.name; }) };
    }),
    headline: { total: crit.total, atendidos: crit.atendidos, obrigatorios: crit.obrigatorios, obrigatorios_atendidos: crit.obrigatorios_atendidos,
      obrigatorios_nao_atendidos: crit.obrigatorios_nao_atendidos },
    avisos_rastreabilidade: interno ? { criterios_sem_casos: crit.sem_casos, casos_sem_criterio: crit.casos_sem_criterio } : { criterios_sem_casos: [], casos_sem_criterio: [] },
    por_use_case: porUseCase,
    use_cases: groups.map(function (g) { return g.name; }),
    casos: casos,
    agenda: agenda,
    pendencias: pend,
    escopo: escopo,
    redacoes: redactions,
    execucao_ids: active.map(function (e) { return e.exec_id; }),
  };
  var names = (refs.competitorNames || []).concat(String(pov.competidor || '').split(/[,;\/|]+| e | and /i).map(function (s) { return s.trim(); }));
  model.vazamentos = interno ? [] : leakCheck(model, names, clientUrls);
  return model;
}

/**
 * Procura, na versão do cliente, o que não deveria sair: nomes de concorrentes, e-mails e links em
 * texto livre e palavras de classificação interna. Retorna [{onde, tipo, trecho}] para a tela confirmar.
 */
function leakCheck(model, competitorNames, allowedUrls) {
  var hits = [];
  var names = (competitorNames || []).filter(function (x) { return String(x || '').trim().length >= 3; });
  var words = /\b(uso interno|internal only|internal|interno|confidencial interno|concorrente|competidor|competitor|battlecard|kill ?list)\b/i;
  function scan(onde, text, opts) {
    var s = String(text || '').split(REDACTED).join(' ');
    if (!s) return;
    names.forEach(function (nm) {
      var re = new RegExp('(^|[^\\w])' + String(nm).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\w])', 'i');
      if (re.test(s)) hits.push({ onde: onde, tipo: 'concorrente', trecho: nm });
    });
    if (!(opts && opts.allowEmail)) {
      var em = s.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
      if (em) hits.push({ onde: onde, tipo: 'e-mail', trecho: em[0] });
    }
    var w = s.match(words);
    if (w) hits.push({ onde: onde, tipo: 'palavra', trecho: w[0] });
    (s.match(/https?:\/\/[^\s<>"')\]]+/gi) || []).forEach(function (u) {
      var clean = u.replace(/[.,;:!?]+$/, '');
      if (!(allowedUrls && allowedUrls[clean]) && PUBLIC_URL_HOSTS.indexOf(urlHost_(clean)) < 0) hits.push({ onde: onde, tipo: 'link', trecho: clean });
    });
  }
  scan('Título da PoV', model.pov.titulo);
  scan('Objetivo da PoV', model.pov.objetivo);
  scan('Ambiente e contato', [model.pov.ambiente, model.pov.contato_cliente].join(' '), { allowEmail: true });
  if (model.pov.plano_aceite) scan('Aceite do plano', [model.pov.plano_aceite.por, model.pov.plano_aceite.obs].join(' '), { allowEmail: true });
  if (model.pov.resultado_aceite) scan('Aceite do resultado', [model.pov.resultado_aceite.por, model.pov.resultado_aceite.obs].join(' '), { allowEmail: true });
  model.escopo.incluidos.concat(model.escopo.removidos).forEach(function (x) { scan('Mudança de escopo', x.caso + ' ' + x.motivo); });
  scan('Resumo executivo', model.pov.resumo_executivo);
  scan('Próximos passos', model.pov.proximos_passos);
  model.criterios.forEach(function (c) { scan('Critério C' + c.n, c.texto + ' ' + (c.justificativa || '')); });
  model.pendencias.forEach(function (p) {
    scan('Pendência', p.descricao + ' ' + (p.resolucao || ''));
    scan('Pendência (responsável)', p.responsavel_nome, { allowEmail: true });
  });
  model.casos.forEach(function (c) {
    var onde = '#' + c.n + ' ' + c.name;
    scan(onde, c.name);
    if (!model.detalhe) return; // sem detalhamento o documento só mostra nome, use case, status e resumo do checklist
    scan(onde, [c.summary, c.description, c.how_to, c.escopo_cliente].join('\n'));
    c.prereqs.forEach(function (p) { scan(onde + ' (pré-requisito)', p.text + ' ' + (p.description || '') + ' ' + (p.obs || '')); });
    c.steps.forEach(function (s) { scan(onde + ' (passo)', s.text + ' ' + (s.obs || '')); });
    if (c.aceite) scan(onde + ' (resultado esperado)', c.aceite.text + ' ' + (c.aceite.obs || ''));
    scan(onde + ' (resultado obtido)', c.resultado_obtido);
    c.metricas.forEach(function (m) { scan(onde + ' (métrica)', m.text + ' ' + (m.valor || '')); });
    c.evidencias.forEach(function (e) { scan(onde + ' (evidência)', e.label, { allowEmail: true }); });
    scan(onde + ' (execução)', [c.ambiente, c.testemunha].join(' '), { allowEmail: true });
  });
  if (model.redacoes) hits.push({ onde: 'Textos da biblioteca', tipo: 'link', trecho: model.redacoes + ' link(s) interno(s) trocado(s) por "' + REDACTED + '"' });
  return hits;
}

/** Nome base do arquivo: pov-runner_<cliente>_<tipo>_<publico>_<AAAA-MM-DD_HHmm>. */
function reportFileBaseName(cliente, tipo, publico, stamp) {
  return 'pov-runner_' + slugify(cliente, 'sem-cliente') + '_' + (tipo || 'resultados') + '_' + (publico === 'cliente' ? 'cliente' : 'interno') + '_' + String(stamp || '');
}

/** CSV (separador ';', com BOM) de um modelo; as colunas seguem a audiência do modelo. */
function reportToCsv(model) {
  function cell(v) {
    var s = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // não vira fórmula no Excel/Sheets
    return '"' + s.replace(/"/g, '""') + '"';
  }
  var header = ['#', 'Use case', 'Caso', 'Prioridade', 'Responsável', 'Data prevista', 'Critérios de sucesso', 'Status', 'Checklist', 'Resultado obtido',
    'Evidências', 'Executado por', 'Testemunha', 'Concluído em'];
  if (model.interno) header = header.concat(['Caso (EN)', 'Tentativas', 'Causa', 'Referência', 'Observações internas', 'Link POV Companion']);
  var lines = [header.map(cell).join(';')];
  model.casos.forEach(function (c) {
    var row = [c.n, c.use_case, c.name, c.prioridade_label, c.responsavel, c.data_prevista, c.criterios, c.status_label, c.resumo_checklist, c.resultado_obtido,
      c.evidencias.map(function (e) { return e.url; }).join(' '), c.executado_por, c.testemunha, c.data];
    if (model.interno) row = row.concat([c.name_en, c.tentativas.length, c.causa, c.referencia, c.observacoes, c.url]);
    lines.push(row.map(cell).join(';'));
  });
  return '﻿' + lines.join('\r\n') + '\r\n';
}

// ============================================================ Apps Script (não roda em Node)

function competitorNames_(library) {
  var names = {};
  (library || []).forEach(function (r) { (r.competitors_lib || []).forEach(function (c) { if (c.name) names[c.name] = true; }); });
  return Object.keys(names);
}

function buildReportModelFromSheets_(povId, opts, user) {
  var pov = requirePovAccess_(povId, user);
  var taxonomia = readTable_(SHEETS.TAXONOMIA);
  var library = readTable_(SHEETS.LIBRARY);
  var extra = String(getConfig_('concorrentes_extra') || '').split(/[,;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
  return buildReportModel(pov, {
    execucoes: readTable_(SHEETS.EXECUCOES), caseIdx: caseIndex(library, readTable_(SHEETS.CASOS_PROPRIOS), taxonomia), taxonomia: taxonomia,
    criterios: readTable_(SHEETS.CRITERIOS), pendencias: readTable_(SHEETS.PENDENCIAS), tentativas: readTable_(SHEETS.TENTATIVAS),
  }, opts, { autor: user.email, nowIso: nowIso_(), fmt: fmt_(), config: getConfigAll_(), competitorNames: competitorNames_(library).concat(extra) });
}

function renderReportHtml_(model) {
  var t = HtmlService.createTemplateFromFile('relatorio');
  t.model = model;
  return t.evaluate().getContent();
}

function previewReport_(povId, opts, user) {
  var model = buildReportModelFromSheets_(povId, opts, user);
  return { html: renderReportHtml_(model), casos: model.casos.length, vazamentos: model.vazamentos, publico: model.publico, tipo: model.tipo };
}

/**
 * Gera HTML + PDF no Drive (pasta da PoV; versões internas em interno/) e registra em Relatorios.
 * A versão do cliente com alertas de vazamento só é salva com opts.confirmarVazamentos.
 */
function saveReport_(povId, opts, user) {
  opts = opts || {};
  var model = buildReportModelFromSheets_(povId, opts, user);
  if (model.vazamentos.length && !opts.confirmarVazamentos) {
    return { needs_confirmation: true, vazamentos: model.vazamentos };
  }
  var pov = findPov_(povId);
  var html = renderReportHtml_(model);
  var base = reportFileBaseName(pov.cliente, model.tipo, model.publico, fmt_()(nowIso_(), 'stamp'));
  var folder = getPovFolder_(pov);
  if (model.interno) folder = getSubfolder_(folder, 'interno');
  var htmlFile = folder.createFile(Utilities.newBlob(html, MimeType.HTML, base + '.html'));
  var pdfUrl = '', pdfError = '', pdfId = '';
  try {
    var pdf = Utilities.newBlob(html, MimeType.HTML, base + '.html').getAs(MimeType.PDF).setName(base + '.pdf');
    var pdfFile = folder.createFile(pdf);
    shareWithTeam_(pdfFile, pov, user);
    pdfUrl = pdfFile.getUrl();
    pdfId = pdfFile.getId();
  } catch (e) {
    pdfError = 'Não foi possível gerar o PDF no servidor (' + e.message + '). Abra o documento em nova aba e use Imprimir → Salvar como PDF.';
  }
  shareWithTeam_(htmlFile, pov, user);
  var row = {
    relatorio_id: Utilities.getUuid(), pov_id: pov.pov_id, tipo: model.tipo, publico: model.publico, casos: model.casos.length,
    aprovados: model.progress.aprovados, autor: user.email, criado_em: nowIso_(), html_url: htmlFile.getUrl(), pdf_url: pdfUrl, pdf_id: pdfId,
    library_export_date: getConfig_('library_export_date'),
  };
  withLock_(function () {
    appendRows_(SHEETS.RELATORIOS, [row]);
    appendEvents_([{ pov_id: pov.pov_id, exec_id: '', test_case_id: '', tipo: 'relatorio', de: '', para: model.tipo + ' (' + model.publico + ')', nota: base, autor: user.email, em: row.criado_em }]);
  });
  return { relatorio_id: row.relatorio_id, html_url: row.html_url, pdf_url: pdfUrl, pdf_id: pdfId, pdf_error: pdfError, folder_url: folder.getUrl(), name: base };
}

/** PDF salvo, em base64, para a tela baixar direto (útil quando o compartilhamento do domínio é bloqueado). */
function pdfBase64_(povId, pdfId, user) {
  requirePovAccess_(povId, user);
  var rel = readTable_(SHEETS.RELATORIOS).filter(function (r) { return r.pov_id === povId && pdfId && (r.pdf_id === pdfId || String(r.pdf_url).indexOf(pdfId) >= 0); })[0];
  if (!rel) throw new Error('Relatório não encontrado para esta PoV.');
  var file = DriveApp.getFileById(pdfId);
  return { name: file.getName(), base64: Utilities.base64Encode(file.getBlob().getBytes()) };
}

function exportCsv_(povId, opts, user) {
  opts = opts || {};
  var model = buildReportModelFromSheets_(povId, { tipo: 'resultados', publico: opts.publico || 'interno', detalhe: true }, user);
  if (model.vazamentos.length && !opts.confirmarVazamentos) return { needs_confirmation: true, vazamentos: model.vazamentos };
  var pov = findPov_(povId);
  return { name: reportFileBaseName(pov.cliente, 'resultados', model.publico, fmt_()(nowIso_(), 'stamp')) + '.csv', csv: reportToCsv(model) };
}

// ---------------------------------------------------------------- pastas do Drive

/**
 * Pasta raiz do app. Configurada (Administração) e inacessível ou na lixeira → erro claro (nunca troca
 * a pasta por conta própria). Sem configuração → "PoV Runner" no Meu Drive de quem publicou.
 */
function getRootFolder_() {
  var rootId = getConfig_('drive_folder_id');
  if (rootId) {
    var root = null;
    try { root = DriveApp.getFolderById(rootId); if (root.isTrashed()) root = null; } catch (e) { root = null; }
    if (!root) throw new Error('A pasta do Drive configurada (' + rootId + ') não está acessível para a conta que publicou o app ou está na lixeira. Ajuste em Administração › Configurações.');
    return root;
  }
  var it = DriveApp.getRootFolder().getFoldersByName(APP_NAME);
  var created = it.hasNext() ? it.next() : DriveApp.getRootFolder().createFolder(APP_NAME);
  setConfig_('drive_folder_id', created.getId());
  return created;
}

function getSubfolder_(parent, name) {
  var clean = String(name || '').replace(/[\\/]/g, '-').trim().slice(0, 120) || 'sem-nome';
  var it = parent.getFoldersByName(clean);
  return it.hasNext() ? it.next() : parent.createFolder(clean);
}

/** Pasta da PoV (criada uma vez, sob lock, e lembrada em PoVs.pasta_id — renomear o cliente não a divide). */
function getPovFolder_(pov) {
  if (pov.pasta_id) { try { return DriveApp.getFolderById(pov.pasta_id); } catch (e) { /* recriada abaixo */ } }
  return withLock_(function () {
    var cur = findPov_(pov.pov_id);
    if (cur.pasta_id) { try { return DriveApp.getFolderById(cur.pasta_id); } catch (e) { /* segue */ } }
    var folder = getSubfolder_(getSubfolder_(getRootFolder_(), cur.cliente || 'sem-cliente'), (cur.titulo || 'PoV') + ' — ' + String(cur.pov_id).slice(0, 8));
    cur.pasta_id = folder.getId();
    updateRowsByKey_(SHEETS.POVS, [cur]);
    return folder;
  });
}

/** Compartilha com o domínio; se a política bloquear, dá leitura a quem gerou e à equipe da PoV. */
function shareWithTeam_(file, pov, user) {
  try {
    file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    var emails = [user && user.email].concat(parseEmails(pov.responsavel), parseEmails(pov.equipe)).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
    emails.forEach(function (em) { try { file.addViewer(em); } catch (e2) { /* e-mail fora do domínio ou sem conta */ } });
  }
}
