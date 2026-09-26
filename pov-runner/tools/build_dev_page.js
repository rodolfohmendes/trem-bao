#!/usr/bin/env node
/**
 * build_dev_page.js — gera dev/index.dev.html: o Index.html com os parciais embutidos, o código
 * compartilhado (clientSharedCode) avaliado a partir das regras puras e um google.script.run FALSO
 * que implementa TODAS as api* de Code.js em memória, com as mesmas regras puras (src/*.js) sobre o
 * DEMO_BUNDLE. Serve para desenvolver e testar a interface sem publicar no Apps Script (abrir o
 * arquivo no navegador ou rodar o Playwright em tests/ui.smoke.js).
 *
 * O "servidor" falso espelha a composição feita nas funções *_ do Apps Script (saveExecution_,
 * bulkUpdate_, addToPlan_, saveReport_…): mesma ordem, mesmas regras, mesmas respostas. As tabelas
 * ficam em window.__db (mutáveis) para o teste simular edição concorrente.
 *
 *   node tools/build_dev_page.js   →   dev/index.dev.html
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');

const PURE = ['Schema.js', 'Labels.js', 'DemoBundle.js', 'Import.js', 'Catalog.js', 'Povs.js', 'Criterios.js', 'Pendencias.js', 'CasosProprios.js', 'Plano.js', 'Execucao.js', 'Relatorio.js'];
const pureCode = PURE.map(read).join('\n;\n');

/** Avalia clientSharedCode() em Node a partir dos mesmos arquivos (o que o Apps Script faria no template). */
function sharedCode() {
  // eslint-disable-next-line no-new-func
  return new Function(pureCode + '\nreturn clientSharedCode();')();
}

// ============================================================ "servidor" falso (roda no navegador)
// Esta função é serializada com toString() e colada DEPOIS do código puro, dentro de um IIFE: os
// nomes livres (planImport, buildPovView, applyExecutionUpdate…) resolvem para as regras puras.
/* eslint-disable no-undef */
function devServer(TEMPLATE, GasTemplate) {
  'use strict';
  var OWNER = 'dev@example.com';
  var render = GasTemplate.compile(TEMPLATE);
  var fmt = fixedOffsetFormatter(-180);
  var clock = null; // ISO fixo durante o seed
  function nowIso() { return clock || new Date().toISOString(); }

  // ids previsíveis com cara de UUID (PRNG com semente)
  var rnd = (function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })(20260926);
  function hex(n) { var s = ''; while (s.length < n) s += Math.floor(rnd() * 16).toString(16); return s; }
  function uuid() { return hex(8) + '-' + hex(4) + '-4' + hex(3) + '-' + (8 + Math.floor(rnd() * 4)).toString(16) + hex(3) + '-' + hex(12); }
  function driveId() { var abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', s = '1'; while (s.length < 33) s += abc[Math.floor(rnd() * abc.length)]; return s; }
  function clone(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }

  // ---------------------------------------------------------------- "planilha" em memória
  var db = {
    session: { email: OWNER },
    library: [], taxonomia: [], ambientes: [], povs: [], criterios: [], casos_proprios: [], execucoes: [], tentativas: [],
    pendencias: [], historico: [], relatorios: [], config: {}, files: {},
  };
  var TABLE = {};
  TABLE[SHEETS.LIBRARY] = 'library'; TABLE[SHEETS.TAXONOMIA] = 'taxonomia'; TABLE[SHEETS.AMBIENTES] = 'ambientes'; TABLE[SHEETS.POVS] = 'povs';
  TABLE[SHEETS.CRITERIOS] = 'criterios'; TABLE[SHEETS.CASOS_PROPRIOS] = 'casos_proprios'; TABLE[SHEETS.EXECUCOES] = 'execucoes';
  TABLE[SHEETS.TENTATIVAS] = 'tentativas'; TABLE[SHEETS.PENDENCIAS] = 'pendencias'; TABLE[SHEETS.HISTORICO] = 'historico'; TABLE[SHEETS.RELATORIOS] = 'relatorios';

  /** Ida e volta pela "célula": mesmas conversões de Sheets.js (json, bool, num, texto). */
  function norm(name, obj) {
    var def = SCHEMA[name], out = {};
    def.columns.forEach(function (c) {
      var v = obj[c];
      if (def.json.indexOf(c) >= 0) out[c] = v === undefined || v === null || v === '' ? [] : clone(v);
      else if (def.bool.indexOf(c) >= 0) out[c] = v === true || v === 'TRUE' || v === 'true';
      else if (def.num.indexOf(c) >= 0) { var n = Number(v); out[c] = v === '' || v === null || v === undefined || isNaN(n) ? 0 : n; }
      else out[c] = v === undefined || v === null ? '' : String(v);
    });
    return out;
  }
  function readTable(name) { return clone(db[TABLE[name]]); }
  function writeTable(name, rows) { db[TABLE[name]] = (rows || []).map(function (r) { return norm(name, r); }); }
  function appendRows(name, rows) { (rows || []).forEach(function (r) { db[TABLE[name]].push(norm(name, r)); }); }
  function updateRowsByKey(name, rows) {
    var key = SCHEMA[name].key, list = db[TABLE[name]];
    (rows || []).forEach(function (r) {
      for (var i = 0; i < list.length; i++) if (list[i][key] === r[key]) { list[i] = norm(name, r); return; }
      throw new Error('Registro não encontrado em ' + name + ': ' + r[key]);
    });
  }
  function getConfigAll() { return clone(db.config); }
  function setConfigMany(obj) { Object.keys(obj).forEach(function (k) { db.config[k] = obj[k] == null ? '' : String(obj[k]); }); }
  function withId(obj, key) { var o = clone(obj); o[key] = uuid(); return o; }
  function appendEvents(events) { if (events && events.length) appendRows(SHEETS.HISTORICO, events.map(function (ev) { return withId(ev, 'evento_id'); })); }

  // ---------------------------------------------------------------- Code.js: guard_
  function guard(role) {
    var email = String(db.session.email || '').toLowerCase();
    if (!email) throw new Error('Não consegui identificar seu usuário Google. Abra o app com a conta corporativa; se estiver logado em várias contas, use uma janela ou perfil do navegador só com ela.');
    var cfg = getConfigAll();
    if (!isAuthorizedUser(email, cfg.usuarios)) throw new Error('Seu usuário (' + email + ') não está autorizado a usar o ' + APP_NAME + '. Fale com o administrador.');
    var admin = isAdminUser(email, cfg.admins, OWNER);
    if (role === 'admin' && !admin) throw new Error('Somente administradores do ' + APP_NAME + ' podem fazer isto.');
    return { email: email, admin: admin, visibilidade: cfg.visibilidade === 'todos' ? 'todos' : 'equipe' };
  }

  // ---------------------------------------------------------------- Povs.js / Plano.js (parte Apps Script)
  function findPov(povId) {
    var found = null;
    readTable(SHEETS.POVS).forEach(function (p) { if (p.pov_id === povId) found = p; });
    if (!found) throw new Error('PoV não encontrada: ' + povId);
    return found;
  }
  function requirePovAccess(povId, user) {
    var pov = findPov(povId);
    if (!canAccessPov(pov, user.email, user.admin, user.visibilidade)) throw new Error('Você não faz parte da equipe desta PoV. Peça ao responsável para incluir seu e-mail no campo Equipe.');
    return pov;
  }
  function listPovs(filter, user) {
    return listPovSummaries(readTable(SHEETS.POVS), readTable(SHEETS.EXECUCOES), readTable(SHEETS.CRITERIOS), filter || {},
      { email: user.email, isAdmin: user.admin, visibilidade: user.visibilidade });
  }
  function readCaseIndex(taxonomia) {
    return caseIndex(readTable(SHEETS.LIBRARY), readTable(SHEETS.CASOS_PROPRIOS), taxonomia || readTable(SHEETS.TAXONOMIA));
  }
  function findCaseRow(caseId) {
    if (isCustomCaseId(caseId)) {
      var c = readTable(SHEETS.CASOS_PROPRIOS).filter(function (x) { return x.caso_id === caseId; })[0];
      return c ? customToLibraryRow(c, readTable(SHEETS.TAXONOMIA).reduce(function (o, n) { o[n.node_id] = n; return o; }, {})) : null;
    }
    return readTable(SHEETS.LIBRARY).filter(function (r) { return r.id === caseId; })[0] || null;
  }
  function getPovView(povId, user) {
    var pov = requirePovAccess(povId, user);
    var taxonomia = readTable(SHEETS.TAXONOMIA);
    return buildPovView(pov, {
      execucoes: readTable(SHEETS.EXECUCOES), caseIdx: readCaseIndex(taxonomia), taxonomia: taxonomia,
      historico: readTable(SHEETS.HISTORICO), criterios: readTable(SHEETS.CRITERIOS), pendencias: readTable(SHEETS.PENDENCIAS),
      tentativas: readTable(SHEETS.TENTATIVAS), relatorios: readTable(SHEETS.RELATORIOS), hoje: fmt(nowIso(), 'isodate'),
    });
  }
  function savePov(input, user) {
    var refs = { autor: user.email, nowIso: nowIso(), newId: uuid, library_export_date: db.config.library_export_date || '' };
    var res;
    if (input && input.pov_id) {
      res = updatePovRow(requirePovAccess(input.pov_id, user), input, refs);
      updateRowsByKey(SHEETS.POVS, [res.row]);
    } else {
      res = createPovRow(input || {}, refs);
      appendRows(SHEETS.POVS, [res.row]);
    }
    appendEvents(res.events);
    return res.row;
  }
  function povContext(povId) {
    return {
      pendencias: readTable(SHEETS.PENDENCIAS).filter(function (p) { return p.pov_id === povId; }),
      critIds: readTable(SHEETS.CRITERIOS).reduce(function (o, c) { if (c.pov_id === povId && c.ativo) o[c.crit_id] = true; return o; }, {}),
    };
  }
  function lockedMsg(pov) { return 'A PoV está "' + povStatusLabel(pov.status) + '". Reabra a PoV para mudar execuções e plano.'; }

  // ---------------------------------------------------------------- Relatorio.js (parte Apps Script)
  function competitorNames(library) {
    var names = {};
    (library || []).forEach(function (r) { (r.competitors_lib || []).forEach(function (c) { if (c.name) names[c.name] = true; }); });
    return Object.keys(names);
  }
  function reportModel(povId, opts, user) {
    var pov = requirePovAccess(povId, user);
    var taxonomia = readTable(SHEETS.TAXONOMIA);
    var library = readTable(SHEETS.LIBRARY);
    var extra = String(db.config.concorrentes_extra || '').split(/[,;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    return buildReportModel(pov, {
      execucoes: readTable(SHEETS.EXECUCOES), caseIdx: caseIndex(library, readTable(SHEETS.CASOS_PROPRIOS), taxonomia), taxonomia: taxonomia,
      criterios: readTable(SHEETS.CRITERIOS), pendencias: readTable(SHEETS.PENDENCIAS), tentativas: readTable(SHEETS.TENTATIVAS),
    }, opts, { autor: user.email, nowIso: nowIso(), fmt: fmt, config: getConfigAll(), competitorNames: competitorNames(library).concat(extra) });
  }
  var FOLDER_ID = driveId();
  function driveUrl(id) { return 'https://drive.google.com/file/d/' + id + '/view?usp=drivesdk'; }
  // PDF mínimo válido (uma página em branco com um título) para o "Baixar PDF"
  var TINY_PDF = btoa('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n' +
    '4 0 obj<</Length 58>>stream\nBT /F1 18 Tf 72 770 Td (PoV Runner - PDF de desenvolvimento) Tj ET\nendstream endobj\n' +
    '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');

  // ---------------------------------------------------------------- Import.js (parte Apps Script)
  function currentImportState() {
    return { library: readTable(SHEETS.LIBRARY), taxonomia: readTable(SHEETS.TAXONOMIA), ambientes: readTable(SHEETS.AMBIENTES),
      execucoes: readTable(SHEETS.EXECUCOES), povs: readTable(SHEETS.POVS) };
  }
  /**
   * "Próximo export" da biblioteca de demonstração: qualquer id do Drive que não seja um upload devolve
   * uma variação do DEMO_BUNDLE (1 caso novo, 1 alterado, 1 removido), para o dry-run ter o que mostrar.
   */
  function nextDemoExport() {
    var b = clone(DEMO_BUNDLE);
    b.meta.exported_at = '2026-09-26T12:00:00.000Z';
    var dns = b.test_cases.filter(function (c) { return /DNS Security/.test(c.name); })[0];
    if (dns) {
      var nova = clone(dns);
      nova.id = '0d1e2f30-4152-4637-8899-aabbccddeeff';
      nova.name = 'Advanced DNS Security: block newly registered domains';
      if (nova.pt) { nova.pt.name = 'Advanced DNS Security: bloquear domínios recém-registrados'; }
      b.test_cases.push(nova);
      dns.version = Number(dns.version) + 1;
      dns.updated_at = '2026-09-25T10:00:00.000Z';
    }
    b.test_cases = b.test_cases.filter(function (c) { return !/SD-WAN/.test(c.name); });
    b.meta.counts.test_cases = b.test_cases.length;
    b.meta.library_total_reported = b.test_cases.length;
    return b;
  }
  function readBundle(fileIdOrUrl) {
    var m = String(fileIdOrUrl || '').match(/[-\w]{25,}/);
    if (!m) throw new Error('Informe o id ou a URL de um arquivo do Drive.');
    var f = db.files[m[0]];
    if (!f) return nextDemoExport();
    try { return JSON.parse(String(f.text).replace(/^﻿/, '')); } catch (e) { throw new Error('O arquivo "' + f.name + '" não é um JSON válido.'); }
  }
  function importBundle(bundle, opts) {
    opts = opts || {};
    var current = currentImportState();
    var plan = planImport(bundle, current, opts, nowIso());
    if (plan.dry.execucoes_orfas_em_pov_ativa > 0 && !opts.confirmOrphans) {
      throw new Error(plan.dry.execucoes_orfas_em_pov_ativa + ' execução(ões) de PoVs em execução ou concluídas ficariam órfãs. Revise o dry-run e confirme.');
    }
    setConfigMany({ import_em_andamento: 'true' });
    writeTable(SHEETS.LIBRARY, plan.rows.library);
    writeTable(SHEETS.TAXONOMIA, plan.rows.taxonomia);
    writeTable(SHEETS.AMBIENTES, plan.rows.ambientes);
    updateRowsByKey(SHEETS.EXECUCOES, plan.orphanChanges);
    var cfg = plan.rows.config;
    cfg.last_import_at = nowIso();
    cfg.last_import_by = String(db.session.email || '').toLowerCase();
    cfg.last_import_obs = plan.validation.partial ? 'importação parcial autorizada' : '';
    cfg.import_em_andamento = 'false';
    setConfigMany(cfg);
    return plan.dry;
  }
  function importDemo() {
    var hasLibrary = db.library.length > 0;
    if (hasLibrary && db.config.library_is_demo !== 'true') throw new Error('A planilha já tem a biblioteca real importada; a demonstração não pode sobrescrevê-la.');
    return importBundle(clone(DEMO_BUNDLE), { confirmOrphans: true });
  }

  function adminInfo() {
    var user = guard();
    var cfg = getConfigAll();
    var info = {
      admin: user.admin,
      last_import_at: cfg.last_import_at || '', last_import_by: cfg.last_import_by || '', last_import_obs: cfg.last_import_obs || '',
      library_export_date: cfg.library_export_date || '', library_total: cfg.library_total || '0',
      translation_date: cfg.translation_date || '', library_is_demo: cfg.library_is_demo === 'true',
      import_incompleto: cfg.import_em_andamento === 'true', app_version: APP_VERSION, drive_folder_id: cfg.drive_folder_id || '',
    };
    if (user.admin) {
      info.settings = { usuarios: cfg.usuarios || '', admins: cfg.admins || '', visibilidade: cfg.visibilidade || 'equipe',
        drive_folder_id: cfg.drive_folder_id || '', concorrentes_extra: cfg.concorrentes_extra || '' };
    }
    return info;
  }

  // ================================================================ API (espelho de Code.js)
  var api = {
    apiBootstrap: function () {
      var user = guard();
      var loaded = db.library.length > 0;
      var cfg = getConfigAll();
      return {
        user: user.email, admin: user.admin, visibilidade: user.visibilidade, library_loaded: loaded,
        import_incompleto: cfg.import_em_andamento === 'true',
        catalog: loaded ? buildCatalog(readTable(SHEETS.LIBRARY), readTable(SHEETS.TAXONOMIA), readTable(SHEETS.AMBIENTES), cfg) : null,
        povs: listPovs({}, user), app_version: APP_VERSION,
      };
    },
    apiListPovs: function (filter) { return listPovs(filter || {}, guard()); },
    apiSavePov: function (input) {
      var user = guard();
      var row = savePov(input || {}, user);
      return getPovView(row.pov_id, user);
    },
    apiTransitionPov: function (povId, action, input) {
      var user = guard();
      var res = transitionPov(requirePovAccess(povId, user), action, input || {}, { autor: user.email, nowIso: nowIso() });
      updateRowsByKey(SHEETS.POVS, [res.row]);
      appendEvents(res.events);
      return getPovView(povId, user);
    },
    apiGetPov: function (povId) { return getPovView(povId, guard()); },

    apiAddToPlan: function (povId, caseIds, selectedNodeIds, motivo) {
      var user = guard();
      var pov = requirePovAccess(povId, user);
      var taxonomia = readTable(SHEETS.TAXONOMIA);
      var res = addCasesToPlan(readTable(SHEETS.EXECUCOES), pov, caseIds || [], readCaseIndex(taxonomia), taxonomia,
        { autor: user.email, nowIso: nowIso(), newId: uuid, selectedNodeIds: selectedNodeIds || [], motivo: motivo || '' });
      appendRows(SHEETS.EXECUCOES, res.created);
      updateRowsByKey(SHEETS.EXECUCOES, res.updated);
      appendEvents(res.events);
      return { result: { added: res.added, reactivated: res.reactivated, skipped: res.skipped, unknown: res.unknown.length }, view: getPovView(povId, user) };
    },
    apiRemoveFromPlan: function (povId, execIds, motivo) {
      var user = guard();
      var pov = requirePovAccess(povId, user);
      var res = removeFromPlan(readTable(SHEETS.EXECUCOES), pov, execIds || [], { autor: user.email, nowIso: nowIso(), motivo: motivo || '' });
      updateRowsByKey(SHEETS.EXECUCOES, res.updated);
      appendEvents(res.events);
      return { result: { removed: res.updated.length }, view: getPovView(povId, user) };
    },
    apiSaveExecution: function (input) {
      var user = guard();
      input = input || {};
      // saveExecution_
      var row = null;
      readTable(SHEETS.EXECUCOES).forEach(function (e) { if (e.exec_id === input.exec_id) row = e; });
      if (!row) throw new Error('Execução não encontrada. Recarregue a PoV.');
      var pov = requirePovAccess(row.pov_id, user);
      var caseRow = findCaseRow(row.test_case_id);
      var pc = povContext(row.pov_id);
      var res;
      try {
        res = applyExecutionUpdate(row, input, { pov: pov, caseRow: caseRow, autor: user.email, nowIso: nowIso(), pendencias: pc.pendencias, critIds: pc.critIds, newId: uuid });
      } catch (e) {
        if (e.conflict) return { conflict: true, message: e.message, server: planItemView(row, caseRow) };
        throw e;
      }
      updateRowsByKey(SHEETS.EXECUCOES, [res.row]);
      if (res.attempt) appendRows(SHEETS.TENTATIVAS, [withId(res.attempt, 'tentativa_id')]);
      if (res.newPendencia) appendRows(SHEETS.PENDENCIAS, [res.newPendencia]);
      appendEvents(res.events);
      // apiSaveExecution
      return { conflict: false, saved: { exec_id: res.row.exec_id, status: res.row.status, atualizado_em: res.row.atualizado_em, suggestion: suggestStatus(res.row.checklist) },
        view: getPovView(res.row.pov_id, user) };
    },
    apiBulkUpdate: function (povId, execIds, changes, expected) {
      var user = guard();
      var pov = requirePovAccess(povId, user);
      var pc = povContext(povId);
      var res = bulkUpdateExecutions(readTable(SHEETS.EXECUCOES), pov, execIds || [], changes || {}, expected || {}, { autor: user.email, nowIso: nowIso(), critIds: pc.critIds });
      updateRowsByKey(SHEETS.EXECUCOES, res.updated);
      appendRows(SHEETS.TENTATIVAS, res.attempts.map(function (a) { return withId(a, 'tentativa_id'); }));
      appendEvents(res.events);
      return { result: { updated: res.updated.length, conflicts: res.conflicts }, view: getPovView(povId, user) };
    },
    apiRefreshVersion: function (execId) {
      var user = guard();
      var row = readTable(SHEETS.EXECUCOES).filter(function (e) { return e.exec_id === execId; })[0];
      if (!row) throw new Error('Execução não encontrada.');
      var pov = requirePovAccess(row.pov_id, user);
      var res = refreshCaseVersion(row, findCaseRow(row.test_case_id), pov, { autor: user.email, nowIso: nowIso() });
      updateRowsByKey(SHEETS.EXECUCOES, [res.row]);
      appendEvents([res.event]);
      return getPovView(res.row.pov_id, user);
    },
    apiAttachEvidence: function (execId, fileName, mimeType, base64) {
      var user = guard();
      var row = readTable(SHEETS.EXECUCOES).filter(function (e) { return e.exec_id === execId; })[0];
      if (!row) throw new Error('Execução não encontrada.');
      var pov = requirePovAccess(row.pov_id, user);
      if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error(lockedMsg(pov));
      var raw = String(base64 || '');
      if (raw.length > Math.ceil(LIMITS.uploadBytes * 4 / 3) + 8) throw new Error('Arquivo maior que ' + Math.round(LIMITS.uploadBytes / 1048576) + ' MB. Suba no Drive e cole o link.');
      if (!raw.length) throw new Error('Arquivo vazio.');
      var safeName = String(fileName || 'evidencia').replace(/[\\/]/g, '_').slice(0, 120);
      return { label: safeName, url: driveUrl(driveId()), cliente: false };
    },
    apiSaveCriterion: function (povId, input) {
      var user = guard();
      var pov = requirePovAccess(povId, user);
      var res = saveCriterionRow(readTable(SHEETS.CRITERIOS), pov, input || {}, { autor: user.email, nowIso: nowIso(), newId: uuid });
      if (res.created) appendRows(SHEETS.CRITERIOS, [res.row]); else updateRowsByKey(SHEETS.CRITERIOS, [res.row]);
      appendEvents(res.events);
      return getPovView(povId, user);
    },
    apiRemoveCriterion: function (povId, critId) {
      var user = guard();
      var pov = requirePovAccess(povId, user);
      if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error('A PoV está "' + povStatusLabel(pov.status) + '". Reabra a PoV para mudar os critérios.');
      var cur = readTable(SHEETS.CRITERIOS).filter(function (c) { return c.crit_id === critId && c.pov_id === povId; })[0];
      if (!cur) throw new Error('Critério não encontrado.');
      cur.ativo = false;
      cur.autor = user.email;
      cur.atualizado_em = nowIso();
      updateRowsByKey(SHEETS.CRITERIOS, [cur]);
      appendEvents([{ pov_id: povId, exec_id: '', test_case_id: '', tipo: 'criterio', de: 'ativo', para: 'removido', nota: cur.texto, autor: user.email, em: cur.atualizado_em }]);
      return getPovView(povId, user);
    },
    apiSetVerdict: function (povId, critId, input) {
      var user = guard();
      var pov = requirePovAccess(povId, user);
      var cur = readTable(SHEETS.CRITERIOS).filter(function (c) { return c.crit_id === critId && c.pov_id === povId; })[0];
      var res = setCriterionVerdict(cur, pov, input || {}, { autor: user.email, nowIso: nowIso() });
      updateRowsByKey(SHEETS.CRITERIOS, [res.row]);
      appendEvents(res.events);
      return getPovView(povId, user);
    },
    apiSavePendencia: function (povId, input) {
      var user = guard();
      var pov = requirePovAccess(povId, user);
      var refs = { autor: user.email, nowIso: nowIso(), newId: uuid };
      if (LOCKED_POV_STATUSES.indexOf(pov.status) >= 0) throw new Error('A PoV está "' + povStatusLabel(pov.status) + '". Reabra a PoV para mudar pendências.');
      if (input && input.pend_id) {
        var cur = readTable(SHEETS.PENDENCIAS).filter(function (p) { return p.pend_id === input.pend_id && p.pov_id === povId; })[0];
        var res = updatePendenciaRow(cur, input, refs);
        updateRowsByKey(SHEETS.PENDENCIAS, [res.row]);
        appendEvents(res.events);
      } else {
        var created = createPendenciaRow(pov, input || {}, (input && input.exec_ids) || [], refs).row;
        appendRows(SHEETS.PENDENCIAS, [created]);
        appendEvents([{ pov_id: povId, exec_id: '', test_case_id: '', tipo: 'pendencia', de: '', para: 'aberta', nota: created.descricao, autor: user.email, em: refs.nowIso }]);
      }
      return getPovView(povId, user);
    },
    apiSaveCustomCase: function (povId, input) {
      var user = guard();
      var pov = requirePovAccess(povId, user);
      var refs = { autor: user.email, nowIso: nowIso(), newId: uuid };
      if (input && input.caso_id) {
        var cur = readTable(SHEETS.CASOS_PROPRIOS).filter(function (c) { return c.caso_id === input.caso_id && c.pov_id === povId; })[0];
        var upd = updateCustomCaseRow(cur, pov, input, refs);
        updateRowsByKey(SHEETS.CASOS_PROPRIOS, [upd.row]);
        appendEvents([{ pov_id: povId, exec_id: '', test_case_id: upd.row.caso_id, tipo: 'plano', de: '', para: 'caso próprio editado', nota: upd.row.nome + (upd.textChanged ? ' (versão ' + upd.row.versao + ')' : ''), autor: user.email, em: refs.nowIso }]);
      } else {
        var created = createCustomCaseRow(pov, input || {}, refs).row;
        var taxonomia = readTable(SHEETS.TAXONOMIA);
        var res = addCasesToPlan(readTable(SHEETS.EXECUCOES), pov, [created.caso_id], caseIndex([], [created], taxonomia), taxonomia,
          { autor: user.email, nowIso: refs.nowIso, newId: refs.newId, selectedNodeIds: created.use_case_id ? [created.use_case_id] : [], motivo: (input && input.motivo) || '' });
        appendRows(SHEETS.CASOS_PROPRIOS, [created]);
        appendRows(SHEETS.EXECUCOES, res.created);
        appendEvents(res.events);
      }
      return getPovView(povId, user);
    },

    apiPreviewReport: function (povId, opts) {
      var model = reportModel(povId, opts || {}, guard());
      return { html: render(model), casos: model.casos.length, vazamentos: model.vazamentos, publico: model.publico, tipo: model.tipo };
    },
    apiSaveReport: function (povId, opts) {
      var user = guard();
      opts = opts || {};
      var model = reportModel(povId, opts, user);
      if (model.vazamentos.length && !opts.confirmarVazamentos) return { needs_confirmation: true, vazamentos: model.vazamentos };
      var pov = findPov(povId);
      render(model); // o HTML seria gravado no Drive
      var base = reportFileBaseName(pov.cliente, model.tipo, model.publico, fmt(nowIso(), 'stamp'));
      var htmlId = driveId(), pdfId = driveId();
      var row = {
        relatorio_id: uuid(), pov_id: pov.pov_id, tipo: model.tipo, publico: model.publico, casos: model.casos.length,
        aprovados: model.progress.aprovados, autor: user.email, criado_em: nowIso(), html_url: driveUrl(htmlId), pdf_url: driveUrl(pdfId),
        library_export_date: db.config.library_export_date || '',
      };
      appendRows(SHEETS.RELATORIOS, [row]);
      appendEvents([{ pov_id: pov.pov_id, exec_id: '', test_case_id: '', tipo: 'relatorio', de: '', para: model.tipo + ' (' + model.publico + ')', nota: base, autor: user.email, em: row.criado_em }]);
      return { relatorio_id: row.relatorio_id, html_url: row.html_url, pdf_url: row.pdf_url, pdf_id: pdfId, pdf_error: '',
        folder_url: 'https://drive.google.com/drive/folders/' + FOLDER_ID, name: base };
    },
    apiPdfBase64: function (povId, pdfId) {
      var user = guard();
      requirePovAccess(povId, user);
      var rel = readTable(SHEETS.RELATORIOS).filter(function (r) { return r.pov_id === povId && String(r.pdf_url).indexOf(pdfId) >= 0; })[0];
      if (!rel) throw new Error('Relatório não encontrado para esta PoV.');
      var pov = findPov(povId);
      return { name: reportFileBaseName(pov.cliente, rel.tipo, rel.publico, fmt(rel.criado_em, 'stamp')) + '.pdf', base64: TINY_PDF };
    },
    apiExportCsv: function (povId, opts) {
      var user = guard();
      var model = reportModel(povId, { tipo: 'resultados', publico: (opts && opts.publico) || 'interno' }, user);
      var pov = findPov(povId);
      return { name: reportFileBaseName(pov.cliente, 'resultados', model.publico, fmt(nowIso(), 'stamp')) + '.csv', csv: reportToCsv(model) };
    },

    apiAdminInfo: function () { return adminInfo(); },
    apiSaveSettings: function (settings) {
      var user = guard('admin');
      settings = settings || {};
      var out = {};
      if (settings.usuarios !== undefined) out.usuarios = String(settings.usuarios).slice(0, 5000);
      if (settings.admins !== undefined) {
        out.admins = parseEmails(settings.admins).join(', ');
        if (!isAdminUser(user.email, out.admins, OWNER)) throw new Error('Você se removeria da lista de administradores. Mantenha seu e-mail ou peça para o dono do app.');
      }
      if (settings.visibilidade !== undefined) out.visibilidade = settings.visibilidade === 'todos' ? 'todos' : 'equipe';
      if (settings.concorrentes_extra !== undefined) out.concorrentes_extra = String(settings.concorrentes_extra).slice(0, 2000);
      if (settings.drive_folder_id !== undefined && settings.drive_folder_id !== '') {
        var m = String(settings.drive_folder_id).match(/[-\w]{25,}/);
        if (!m) throw new Error('Informe o id ou a URL de uma pasta do Drive.');
        out.drive_folder_id = m[0]; // no Apps Script: confere que a conta que publicou abre a pasta
      }
      setConfigMany(out);
      return adminInfo();
    },
    apiUploadBundle: function (fileName, text) {
      guard('admin');
      var bundle;
      try { bundle = JSON.parse(String(text || '').replace(/^﻿/, '')); } catch (e) { throw new Error('O arquivo escolhido não é um JSON válido.'); }
      var v = validateBundle(bundle, { allowPartial: true });
      if (!v.ok) throw new Error('Arquivo inválido: ' + v.errors.join(' '));
      var id = driveId();
      var name = String(fileName || 'pov-companion-library.json').replace(/[\\/]/g, '_');
      db.files[id] = { name: name, text: String(text) };
      return { file_id: id, url: driveUrl(id), name: name };
    },
    apiImportDryRun: function (fileIdOrUrl, opts) {
      guard('admin');
      return planImport(readBundle(fileIdOrUrl), currentImportState(), Object.assign({}, opts || {}, { dryRun: true }), nowIso()).dry;
    },
    apiImportConfirm: function (fileIdOrUrl, opts) {
      guard('admin');
      return importBundle(readBundle(fileIdOrUrl), opts || {});
    },
    apiLoadDemo: function () {
      guard('admin');
      return importDemo();
    },
  };

  // ================================================================ seed (estado rico para as telas)
  function seed() {
    var DAY = 86400000;
    var base = new Date();
    function at(daysAgo, hh, mm) { // horário de Brasília (UTC-3)
      var d = new Date(base.getTime() - daysAgo * DAY);
      var ymd = fixedOffsetFormatter(-180)(d.toISOString(), 'isodate').split('-');
      return new Date(Date.UTC(+ymd[0], +ymd[1] - 1, +ymd[2], (hh || 10) + 3, mm || 0)).toISOString();
    }
    function day(offset) { return fmt(new Date(base.getTime() + offset * DAY).toISOString(), 'isodate'); }
    function as(email, iso, fn) {
      var save = [db.session.email, clock];
      db.session.email = email; clock = iso;
      try { return fn(); } finally { db.session.email = save[0]; clock = save[1]; }
    }
    var ANA = 'ana.souza@example.com', BRUNO = 'bruno.lima@example.com', DEV = OWNER;

    // biblioteca de demonstração
    as(DEV, at(21, 9), function () { importDemo(); });
    var lib = db.library;
    function caseId(re) { var r = lib.filter(function (x) { return re.test(x.name) || re.test(x.name_pt); })[0]; if (!r) throw new Error('seed: caso ' + re); return r.id; }
    function nodeId(name) { var n = db.taxonomia.filter(function (x) { return x.name_pt === name || x.name === name; })[0]; if (!n) throw new Error('seed: nó ' + name); return n.node_id; }
    function execOf(povId, tcId) { return db.execucoes.filter(function (e) { return e.pov_id === povId && e.test_case_id === tcId && e.ativo; })[0]; }
    function marks(e, fn) { return e.checklist.map(function (c, i) { var r = fn(c, i); return { k: c.k, ok: r && typeof r === 'object' ? r.ok : r, obs: r && typeof r === 'object' ? r.obs || '' : '' }; }); }
    function save(email, iso, e, input) {
      input.exec_id = e.exec_id;
      input.expected_atualizado_em = execById(e.exec_id).atualizado_em;
      return as(email, iso, function () { var r = api.apiSaveExecution(input); if (r.conflict) throw new Error('seed: conflito'); return r; });
    }
    function execById(id) { return db.execucoes.filter(function (e) { return e.exec_id === id; })[0]; }
    function critId(povId, re) { return db.criterios.filter(function (c) { return c.pov_id === povId && re.test(c.texto); })[0].crit_id; }

    // ------------------------------------------------ PoV A — Banco Exemplo (em execução, plano aceito)
    var A = as(DEV, at(18, 10), function () {
      return api.apiSavePov({
        cliente: 'Banco Exemplo', titulo: 'PoV NGFW + SASE', oportunidade: 'OPP-2026-0412 · renovação do perímetro + SASE',
        responsavel: DEV, equipe: ANA + ', ' + BRUNO, contato_cliente: 'Carla Mendes (Gerente de Segurança da Informação)',
        inicio: day(-14), fim_previsto: day(10), ambiente: 'Laboratório PAN-OS 11.2',
        objetivo: 'Comprovar, no laboratório do banco, a proteção do acesso à Internet (URL, DNS, WildFire, descriptografia) e o acesso remoto com Prisma Access, com evidências para o comitê de arquitetura.',
        observacoes: 'Cliente compara com a solução atual de outro fabricante; decisão no comitê do fim do mês.',
      }).pov;
    });
    var povA = A.pov_id;
    as(DEV, at(17, 11), function () {
      api.apiSaveCriterion(povA, { texto: 'Bloquear phishing e malware desconhecido sem impacto perceptível na navegação', peso: 'obrigatorio' });
      api.apiSaveCriterion(povA, { texto: 'Controlar aplicações não autorizadas, inclusive em portas não padrão e em tráfego criptografado', peso: 'obrigatorio' });
      api.apiSaveCriterion(povA, { texto: 'Acesso remoto dos colaboradores com experiência igual ou melhor que a VPN atual', peso: 'desejavel' });
    });
    var ORPHAN_ID = caseId(/Segmentação baseada em zonas/);
    var ids1 = [/URL Filtering/, /WildFire/, /DNS Security/, /Descriptografia SSL/].map(caseId);
    var ids2 = [/App-ID: bloquear/, /App-ID: control|portas não padrão/].map(caseId);
    var ids3 = [/Prisma Access: acesso/, /ZTNA para/, /Enterprise DLP/].map(caseId);
    var ids4 = [/SD-WAN/].map(caseId);
    as(DEV, at(16, 9), function () {
      api.apiAddToPlan(povA, ids1, [nodeId('Proteção do acesso à Internet')], '');
      api.apiAddToPlan(povA, ids2, [nodeId('Controle de aplicações')], '');
      api.apiAddToPlan(povA, ids3, [nodeId('Acesso remoto seguro')], '');
      api.apiAddToPlan(povA, ids4, [nodeId('Conectividade de filiais (SD-WAN)')], '');
      api.apiAddToPlan(povA, [ORPHAN_ID], [nodeId('Segmentação do data center')], '');
    });
    as(ANA, at(15, 14), function () {
      api.apiSaveCustomCase(povA, {
        nome: 'Envio dos logs do firewall para o SIEM do banco', resumo: 'Integração definida com o time de SOC do cliente: os logs de ameaça precisam chegar ao SIEM corporativo.',
        use_case_id: nodeId('Proteção do acesso à Internet'),
        objetivos: ['Configurar o encaminhamento de logs via syslog TLS para o coletor do banco.', 'Gerar um evento de ameaça de teste.', 'Localizar o evento no SIEM e conferir os campos.'],
        resultado_esperado: 'O evento de ameaça aparece no SIEM em até 5 minutos, com usuário, aplicação e regra.',
        metricas: ['Latência até o SIEM (min)'], como_testar: 'Usar o perfil de encaminhamento "SIEM-Banco" e o arquivo de teste EICAR no endpoint do laboratório.',
      });
    });
    var custom = db.casos_proprios.filter(function (c) { return c.pov_id === povA; })[0];
    var eUrl = execOf(povA, ids1[0]), eWf = execOf(povA, ids1[1]), eDns = execOf(povA, ids1[2]), eSsl = execOf(povA, ids1[3]);
    var eApp = execOf(povA, ids2[0]), eApp2 = execOf(povA, ids2[1]), ePa = execOf(povA, ids3[0]), eZt = execOf(povA, ids3[1]), eDlp = execOf(povA, ids3[2]);
    var eSd = execOf(povA, ids4[0]), eOr = execOf(povA, ORPHAN_ID), eCu = execOf(povA, custom.caso_id);
    var c1 = critId(povA, /phishing/), c2 = critId(povA, /aplicações não autorizadas/), c3 = critId(povA, /Acesso remoto/);
    as(DEV, at(15, 16), function () {
      function bulk(ids, ch) { var r = api.apiBulkUpdate(povA, ids.map(function (e) { return e.exec_id; }), ch, {}); if (r.result.conflicts.length) throw new Error('seed: bulk'); }
      bulk([eUrl, eWf], { criterio_add: c1 });
      bulk([eSsl, eApp, eApp2], { criterio_add: c2 });
      bulk([ePa, eZt], { criterio_add: c3 });
      bulk([eUrl, eWf, eSsl, eApp], { prioridade: 'high' });
      bulk([eSd, eOr], { prioridade: 'low' });
      bulk([eUrl, eWf, eDns, eSsl], { responsavel: 'Ana Souza' });
      bulk([eApp, eApp2, eOr, eCu], { responsavel: 'Bruno Lima' });
      bulk([ePa, eZt, eDlp, eSd], { responsavel: 'dev@example.com' });
      bulk([eApp2, eCu], { data_prevista: day(0) });
      bulk([eZt], { data_prevista: day(2) });
      bulk([eSd], { data_prevista: day(4) });
      bulk([ePa], { data_prevista: day(-1) });
    });
    as(DEV, at(14, 17), function () {
      api.apiTransitionPov(povA, 'aceitar_plano', { por: 'Carla Mendes (Gerente de Segurança da Informação)', em: day(-14), obs: 'Aceite por e-mail após a reunião de kickoff.' });
    });
    as(BRUNO, at(13, 9), function () {
      api.apiSavePendencia(povA, { descricao: 'Ativar a licença de avaliação do Advanced WildFire no firewall de teste', responsavel_tipo: 'panw', responsavel_nome: 'Bruno Lima (SE)', prazo: day(-11), exec_ids: [eWf.exec_id] });
    });
    as(DEV, at(13, 15), function () {
      api.apiSaveReport(povA, { tipo: 'plano', publico: 'cliente', confirmarVazamentos: true });
    });
    // URL Filtering: aprovado, com evidência para o cliente
    save(ANA, at(12, 10), eUrl, {
      status: 'pass', checklist: marks(execById(eUrl.exec_id), function (c) { return c.t === 'met' ? { ok: true, obs: c.i === 0 ? 'Pass' : '20/20 URLs bloqueadas' } : true; }),
      resultado_obtido: 'Todas as 20 URLs de phishing do conjunto de teste foram bloqueadas; a página de bloqueio apareceu e cada tentativa ficou no log com a categoria.',
      evidencias: [{ label: 'Print da página de bloqueio', url: 'https://drive.google.com/file/d/1Xb9cDeFgHiJkLmNoPqRsTuVwXyZ012345/view', cliente: true },
        { label: 'Export do log de URL Filtering', url: 'https://confluence.example.com/pov/banco-exemplo/url-log', cliente: false }],
      executado_por: 'Ana Souza', testemunha: 'Carla Mendes', ambiente: 'Laboratório PAN-OS 11.2',
      observacoes: 'Carla pediu para repetir com a lista de URLs do CSIRT do banco na próxima semana.',
    });
    // WildFire: reprovado → pendência resolvida → aprovado no re-teste
    save(BRUNO, at(11, 11), eWf, {
      status: 'fail', causa: 'configuracao', referencia: 'TAC 03045871',
      checklist: marks(execById(eWf.exec_id), function (c) { return c.t === 'prereq' ? true : c.t === 'out' ? false : c.t === 'step' ? (c.i === 0 ? true : false) : null; }),
      resultado_obtido: 'Na primeira rodada o perfil de análise não enviava arquivos para a nuvem: nenhum veredito em 30 minutos.',
      executado_por: 'Bruno Lima',
    });
    as(BRUNO, at(10, 16), function () {
      var p = db.pendencias.filter(function (x) { return x.pov_id === povA; })[0];
      api.apiSavePendencia(povA, { pend_id: p.pend_id, acao: 'resolver', resolucao: 'Licença ativada pelo time de licenciamento; perfil corrigido.', expected_atualizado_em: p.atualizado_em });
    });
    save(BRUNO, at(9, 10), eWf, {
      status: 'pass', causa: '', referencia: 'TAC 03045871',
      checklist: marks(execById(eWf.exec_id), function (c) { return c.t === 'met' ? { ok: true, obs: c.i === 0 ? 'Pass' : '4 min' } : true; }),
      resultado_obtido: 'Re-teste após a correção do perfil: os 3 arquivos desconhecidos receberam veredito malicioso em menos de 5 minutos e foram bloqueados no segundo download.',
      evidencias: [{ label: 'Relatório do WildFire', url: 'https://drive.google.com/file/d/1QwErTyUiOpAsDfGhJkLzXcVbNm98765/view', cliente: true }],
    });
    // DNS: parcial (menciona o concorrente no resultado → aparece na verificação de vazamento)
    save(ANA, at(8, 14), eDns, {
      status: 'partial', causa: 'produto', referencia: 'FR-18422',
      checklist: marks(execById(eDns.exec_id), function (c) { return c.t === 'step' ? (c.i < 3 ? true : false) : c.t === 'met' ? { ok: c.i === 0 ? true : false, obs: c.i === 0 ? 'DGA: 100%' : 'túnel: detectado após 12 min' } : c.t === 'out' ? true : true; }),
      resultado_obtido: 'Os domínios DGA foram bloqueados na hora; o tunelamento via DNS foi detectado, mas só 12 minutos depois. A solução atual (Concorrente B) não detectou nenhum dos dois.',
      executado_por: 'Ana Souza', testemunha: 'Equipe de redes do banco',
    });
    // Descriptografia: bloqueado com pendência aberta e atrasada
    save(ANA, at(7, 11), eSsl, {
      status: 'blocked', causa: 'ambiente_cliente',
      checklist: marks(execById(eSsl.exec_id), function (c) { return c.t === 'prereq' ? (c.i === 0 ? true : false) : null; }),
      nova_pendencia: { descricao: 'Instalar o certificado da CA interna do banco nos endpoints de teste', responsavel_tipo: 'cliente', responsavel_nome: 'Equipe de PKI do banco', prazo: day(-3) },
    });
    // App-ID: aprovado (depois a biblioteca "muda" → caso alterado)
    save(BRUNO, at(6, 15), eApp, {
      status: 'pass', checklist: marks(execById(eApp.exec_id), function () { return true; }),
      resultado_obtido: 'BitTorrent, Tor e proxies anônimos bloqueados por App-ID independentemente da porta.', executado_por: 'Bruno Lima',
    });
    // DLP: não aplicável em lote
    as(DEV, at(5, 10), function () { api.apiBulkUpdate(povA, [eDlp.exec_id], { nao_aplicavel: { motivo: 'O banco não usa o SaaS de armazenamento previsto no caso; fica para a fase 2.' } }, {}); });
    // caso que depois saiu da biblioteca (órfão), avaliado antes
    save(BRUNO, at(4, 16), eOr, {
      status: 'pass', checklist: marks(execById(eOr.exec_id), function () { return true; }),
      resultado_obtido: 'Política por zona com User-ID aplicada ao grupo de tesouraria.', executado_por: 'Bruno Lima',
    });
    // Prisma Access: em andamento
    save(DEV, at(1, 15, 20), ePa, {
      status: 'in_progress', checklist: marks(execById(ePa.exec_id), function (c) { return c.t === 'prereq' ? true : c.t === 'step' ? (c.i < 2 ? true : null) : null; }),
      escopo_cliente: 'Dois notebooks do time de tesouraria, conectando pela rede doméstica; comparar com a VPN atual no mesmo dia.',
      ambiente: 'Tenant do Prisma Access',
    });
    // a biblioteca "mudou" depois que o App-ID entrou no plano; e um caso foi removido da biblioteca
    var libApp = db.library.filter(function (r) { return r.id === eApp.test_case_id; })[0];
    execById(eApp.exec_id).versao_caso = Math.max(0, Number(libApp.version) - 1);
    execById(eApp.exec_id).versao_avaliada = Math.max(0, Number(libApp.version) - 1);
    db.library.filter(function (r) { return r.id === ORPHAN_ID; })[0].removido_em = at(2, 8);
    execById(eOr.exec_id).orfao = true;

    // ------------------------------------------------ PoV B — Varejo Exemplo (planejamento)
    var B = as(ANA, at(3, 9), function () {
      return api.apiSavePov({ cliente: 'Varejo Exemplo', titulo: 'PoV Cloud', responsavel: ANA, equipe: DEV, inicio: day(3), fim_previsto: day(17),
        ambiente: 'Conta AWS de homologação', contato_cliente: 'Diego Ramos (Arquiteto de Nuvem)',
        objetivo: 'Mostrar visibilidade de postura e de identidades na conta AWS de homologação antes da migração do e-commerce.' }).pov;
    });
    as(ANA, at(3, 10), function () {
      api.apiSaveCriterion(B.pov_id, { texto: 'Identificar buckets públicos e identidades com privilégio excessivo em até 24 h', peso: 'obrigatorio' });
      api.apiAddToPlan(B.pov_id, [/CSPM/, /CIEM/, /Varredura de IaC/].map(caseId), [nodeId('Postura de segurança em nuvem')], '');
      var cb = critId(B.pov_id, /buckets/);
      var ex = db.execucoes.filter(function (e) { return e.pov_id === B.pov_id; }).map(function (e) { return e.exec_id; });
      api.apiBulkUpdate(B.pov_id, ex.slice(0, 2), { criterio_add: cb }, {});
    });

    // ------------------------------------------------ PoV C — Indústria Exemplo (concluída, vitória técnica)
    var C = as(DEV, at(62, 9), function () {
      return api.apiSavePov({ cliente: 'Indústria Exemplo', titulo: 'PoV Cortex XDR + XSIAM', oportunidade: 'OPP-2026-0107', responsavel: DEV, equipe: BRUNO,
        inicio: day(-58), fim_previsto: day(-42), ambiente: 'Tenant do Cortex XSIAM',
        objetivo: 'Validar a prevenção de ransomware nos endpoints da fábrica e a correlação de incidentes no SOC.' }).pov;
    });
    as(DEV, at(61, 10), function () {
      api.apiSaveCriterion(C.pov_id, { texto: 'Impedir a criptografia de arquivos por ransomware nos endpoints da fábrica', peso: 'obrigatorio' });
      api.apiSaveCriterion(C.pov_id, { texto: 'Reduzir o volume de alertas do SOC com agrupamento em incidentes', peso: 'obrigatorio' });
      api.apiAddToPlan(C.pov_id, [/proteção comportamental contra ransomware/, /Playbook de contenção/, /XSIAM: ingerir/].map(caseId), [], '');
      var ex = db.execucoes.filter(function (e) { return e.pov_id === C.pov_id; });
      api.apiBulkUpdate(C.pov_id, [ex[0].exec_id], { criterio_add: critId(C.pov_id, /ransomware/) }, {});
      api.apiBulkUpdate(C.pov_id, [ex[1].exec_id, ex[2].exec_id], { criterio_add: critId(C.pov_id, /alertas/) }, {});
      api.apiTransitionPov(C.pov_id, 'aceitar_plano', { por: 'Roberto Lima (CISO)', em: day(-60) });
    });
    db.execucoes.filter(function (e) { return e.pov_id === C.pov_id; }).forEach(function (e, i) {
      save(i === 1 ? BRUNO : DEV, at(55 - i * 3, 14), e, {
        status: i === 1 ? 'partial' : 'pass', checklist: marks(execById(e.exec_id), function (c) { return i === 1 && c.t === 'step' && c.i === 0 ? false : true; }),
        resultado_obtido: i === 1 ? 'Playbook isolou o endpoint; a abertura de chamado no ITSM do cliente ficou para a produção.' : 'Comportamento conforme o esperado no ambiente da fábrica.',
      });
    });
    as(DEV, at(45, 17), function () {
      api.apiTransitionPov(C.pov_id, 'encerrar', { resumo_executivo: 'Os dois critérios obrigatórios foram atendidos; o cliente seguiu para a compra.', proximos_passos: 'Planejar o rollout por planta.',
        desfecho: 'tech_win', competidor: 'Concorrente D', aceite_por: 'Roberto Lima (CISO)', aceite_em: day(-45) });
    });
  }
  // parâmetros da página de desenvolvimento: ?vazio=1 (sem biblioteca nem PoVs), ?usuario=<e-mail>,
  // ?grande=1 (biblioteca com ~460 casos, para medir o planejador)
  var params = {};
  String(location.search || '').replace(/^\?/, '').split('&').filter(Boolean).forEach(function (kv) {
    var i = kv.indexOf('=');
    params[decodeURIComponent(i < 0 ? kv : kv.slice(0, i))] = i < 0 ? '1' : decodeURIComponent(kv.slice(i + 1));
  });
  if (!params.vazio) seed();
  if (params.grande && db.library.length) {
    var baseLib = db.library.filter(function (r) { return !r.removido_em; });
    for (var copy = 1; db.library.length < 459; copy++) {
      baseLib.forEach(function (r) {
        if (db.library.length >= 459) return;
        var c = clone(r);
        c.id = r.id.slice(0, 24) + ('000000000000' + copy).slice(-12);
        c.name = r.name + ' (variant ' + copy + ')';
        if (c.name_pt) c.name_pt = r.name_pt + ' (variante ' + copy + ')';
        db.library.push(c);
      });
    }
    db.config.library_total = String(db.library.length);
  }
  if (params.usuario) db.session.email = params.usuario;
  clock = null;

  // ================================================================ google.script.run falso
  function runner(ok, ko) {
    var r = {};
    r.withSuccessHandler = function (f) { return runner(f, ko); };
    r.withFailureHandler = function (f) { return runner(ok, f); };
    r.withUserObject = function () { return r; };
    Object.keys(api).forEach(function (name) {
      r[name] = function () {
        var args = JSON.parse(JSON.stringify(Array.prototype.slice.call(arguments)));
        setTimeout(function () {
          var out;
          try { out = api[name].apply(null, args); out = out === undefined ? null : JSON.parse(JSON.stringify(out)); }
          catch (e) { var err = new Error(e && e.message ? e.message : String(e)); if (ko) ko(err); else console.error(err); return; }
          if (ok) ok(out);
        }, 25);
      };
    });
    return r;
  }
  window.google = { script: { run: runner(null, null) } };
  window.__db = db;
  window.__dev = { api: api, setUser: function (email) { db.session.email = email; } };
}
/* eslint-enable no-undef */

// ============================================================ montagem da página
let index = read('Index.html');
const replacements = [
  ["<?!= include('styles.css'); ?>", read('styles.css.html')],
  ['<?!= clientSharedCode(); ?>', sharedCode()],
];
replacements.forEach(([from, to]) => {
  if (index.indexOf(from) < 0) throw new Error('Index.html sem o scriptlet ' + from);
  index = index.split(from).join(to);
});
const APP_INCLUDE = "<?!= include('app.js'); ?>";
if (index.indexOf(APP_INCLUDE) < 0) throw new Error('Index.html sem o scriptlet ' + APP_INCLUDE);
const [before, after] = index.split(APP_INCLUDE);
if (/<\?/.test(before + after)) throw new Error('Index.html tem scriptlets que o build de dev não conhece.');

const gasTemplate = fs.readFileSync(path.join(__dirname, 'gas_template.js'), 'utf8');
const mockJs = [
  '(function () {',
  pureCode,
  ';',
  'var __gt = {};',
  '(function (self) {', gasTemplate, '}).call(__gt, __gt);',
  '(' + devServer.toString() + ')(' + JSON.stringify(read('relatorio.html')) + ', __gt.GasTemplate);',
  '})();',
].join('\n').replace(/<\/script/gi, '<\\/script');

const out = before +
  '<!-- ============ DEV: google.script.run falso (tools/build_dev_page.js) ============ -->\n' +
  '<script>\n' + mockJs + '\n</script>\n' +
  read('app.js.html') + after;

fs.mkdirSync(path.join(ROOT, 'dev'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dev', 'index.dev.html'), out);
console.log('dev/index.dev.html gerado (' + Math.round(out.length / 1024) + ' KB)');
