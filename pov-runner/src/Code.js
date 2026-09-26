/**
 * Code.js — ponto de entrada do web app, menu da planilha e API chamada pelo front (google.script.run).
 *
 * Segurança: o web app roda como quem o publicou e fica aberto ao domínio, então TODA função pública
 * (sem "_" no fim) é uma porta de entrada. Por isso: as funções internas terminam em "_" (o
 * google.script.run não as alcança), toda api* começa por guard_() (usuário identificado, autorizado,
 * e administrador quando a ação é de administração) e as funções de menu também exigem administrador.
 * Toda api* devolve objetos serializáveis em JSON; erros viram mensagens em português.
 */

function doGet() {
  var t = HtmlService.createTemplateFromFile('Index');
  return t.evaluate()
    .setTitle(APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Inclui um parcial HTML (styles.css.html, app.js.html) no template. */
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu(APP_NAME)
    .addItem('Abrir o app', 'menuShowAppUrl')
    .addItem('Criar abas que faltam', 'menuEnsureSheets')
    .addSeparator()
    .addItem('Carregar biblioteca de demonstração', 'menuLoadDemo')
    .addItem('Rodar testes de integração (planilha de fixture)', 'runAllTests')
    .addItem('Spike do PDF do relatório', 'spikeReportPdf')
    .addToUi();
}

/**
 * Identifica e autoriza quem chama. role: 'user' (padrão) ou 'admin'.
 * Retorna {email, admin, visibilidade}. Config: usuarios (e-mails/@domínios), admins, visibilidade (equipe|todos).
 */
function guard_(role) {
  var email = currentUserEmail_();
  if (!email) {
    throw new Error('Não consegui identificar seu usuário Google. Abra o app com a conta corporativa; se estiver logado em várias contas, use uma janela ou perfil do navegador só com ela.');
  }
  var cfg = {};
  try { cfg = getConfigAll_(); } catch (e) { cfg = {}; } // planilha nova, antes de ensureSheets_: sem restrições ainda
  if (!isAuthorizedUser(email, cfg.usuarios)) throw new Error('Seu usuário (' + email + ') não está autorizado a usar o ' + APP_NAME + '. Fale com o administrador.');
  var admin = isAdminUser(email, cfg.admins, ownerEmail_());
  if (role === 'admin' && !admin) throw new Error('Somente administradores do ' + APP_NAME + ' podem fazer isto.');
  return { email: email, admin: admin, visibilidade: cfg.visibilidade === 'todos' ? 'todos' : 'equipe' };
}

// ---------------------------------------------------------------- menu (planilha)

function menuShowAppUrl() {
  guard_('admin');
  var url = '';
  try { url = ScriptApp.getService().getUrl() || ''; } catch (e) { url = ''; }
  var html = url
    ? '<p style="font-family:Arial">URL do web app:</p><p style="font-family:Arial"><a href="' + url + '" target="_blank" rel="noopener">' + url + '</a></p>'
    : '<p style="font-family:Arial">O app ainda não foi implantado. No editor: <b>Implantar › Nova implantação › App da Web</b> (executar como: eu; acesso: qualquer pessoa no domínio).</p>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(520).setHeight(140), APP_NAME);
}

function menuEnsureSheets() {
  guard_('admin');
  ensureSheets_();
}

function menuLoadDemo() {
  guard_('admin');
  ensureSheets_();
  var r = importDemoBundle_();
  SpreadsheetApp.getUi().alert('Biblioteca de demonstração importada: ' + r.total_novo + ' test cases sintéticos.');
}

/** Garante as abas uma vez por versão do app (evita reler cabeçalhos a cada chamada). */
function ensureSheetsOnce_() {
  var key = 'schema-ok-' + APP_VERSION;
  var cache = CacheService.getScriptCache();
  var names = ss_().getSheets().map(function (s) { return s.getName(); });
  var missing = Object.keys(SCHEMA).some(function (n) { return names.indexOf(n) < 0; });
  if (!missing && cache.get(key)) return;
  withLock_(ensureSheets_);
  cache.put(key, '1', 21600);
}

// ---------------------------------------------------------------- API do front: início e PoVs

function apiBootstrap() {
  var user = guard_();
  ensureSheetsOnce_();
  var loaded = sheet_(SHEETS.LIBRARY).getLastRow() >= 2;
  var cfg = getConfigAll_();
  return {
    user: user.email,
    admin: user.admin,
    visibilidade: user.visibilidade,
    library_loaded: loaded,
    import_incompleto: cfg.import_em_andamento === 'true',
    catalog: loaded ? getCatalog_() : null,
    povs: listPovs_({}, user),
    app_version: APP_VERSION,
  };
}

function apiListPovs(filter) {
  return listPovs_(filter || {}, guard_());
}

function apiSavePov(input) {
  var user = guard_();
  var row = savePov_(input || {}, user);
  return getPovView_(row.pov_id, user);
}

function apiTransitionPov(povId, action, input) {
  var user = guard_();
  transitionPov_(povId, action, input || {}, user);
  return getPovView_(povId, user);
}

function apiGetPov(povId) {
  return getPovView_(povId, guard_());
}

// ---------------------------------------------------------------- plano, execução, critérios, pendências

function apiAddToPlan(povId, caseIds, selectedNodeIds, motivo) {
  var user = guard_();
  var result = addToPlan_(povId, caseIds || [], selectedNodeIds || [], motivo || '', user);
  return { result: result, view: getPovView_(povId, user) };
}

function apiRemoveFromPlan(povId, execIds, motivo) {
  var user = guard_();
  var result = removeFromPlan_(povId, execIds || [], motivo || '', user);
  return { result: result, view: getPovView_(povId, user) };
}

function apiSaveExecution(input) {
  var user = guard_();
  var saved = saveExecution_(input || {}, user);
  if (saved.conflict) return saved;
  return { conflict: false, saved: { exec_id: saved.row.exec_id, status: saved.row.status, atualizado_em: saved.row.atualizado_em, suggestion: saved.suggestion },
    view: getPovView_(saved.row.pov_id, user) };
}

function apiBulkUpdate(povId, execIds, changes, expected) {
  var user = guard_();
  var result = bulkUpdate_(povId, execIds || [], changes || {}, expected || {}, user);
  return { result: result, view: getPovView_(povId, user) };
}

function apiRefreshVersion(execId) {
  var user = guard_();
  return getPovView_(refreshVersion_(execId, user), user);
}

function apiAttachEvidence(execId, fileName, mimeType, base64) {
  return attachEvidence_(execId, fileName, mimeType, base64, guard_());
}

function apiSaveCriterion(povId, input) {
  var user = guard_();
  saveCriterion_(povId, input || {}, user);
  return getPovView_(povId, user);
}

function apiRemoveCriterion(povId, critId) {
  var user = guard_();
  deactivateCriterion_(povId, critId, user);
  return getPovView_(povId, user);
}

function apiSetVerdict(povId, critId, input) {
  var user = guard_();
  setVerdict_(povId, critId, input || {}, user);
  return getPovView_(povId, user);
}

function apiSavePendencia(povId, input) {
  var user = guard_();
  savePendencia_(povId, input || {}, user);
  return getPovView_(povId, user);
}

function apiSaveCustomCase(povId, input) {
  var user = guard_();
  saveCustomCase_(povId, input || {}, user);
  return getPovView_(povId, user);
}

// ---------------------------------------------------------------- documentos

function apiPreviewReport(povId, opts) {
  return previewReport_(povId, opts || {}, guard_());
}

function apiSaveReport(povId, opts) {
  return saveReport_(povId, opts || {}, guard_());
}

function apiPdfBase64(povId, pdfId) {
  return pdfBase64_(povId, pdfId, guard_());
}

function apiExportCsv(povId, opts) {
  return exportCsv_(povId, opts || {}, guard_());
}

// ---------------------------------------------------------------- administração

function apiAdminInfo() {
  var user = guard_();
  var cfg = getConfigAll_();
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

function apiSaveSettings(settings) {
  var user = guard_('admin');
  settings = settings || {};
  var out = {};
  if (settings.usuarios !== undefined) out.usuarios = String(settings.usuarios).slice(0, 5000);
  if (settings.admins !== undefined) {
    out.admins = parseEmails(settings.admins).join(', ');
    if (!isAdminUser(user.email, out.admins, ownerEmail_())) throw new Error('Você se removeria da lista de administradores. Mantenha seu e-mail ou peça para o dono do app.');
  }
  if (settings.visibilidade !== undefined) out.visibilidade = settings.visibilidade === 'todos' ? 'todos' : 'equipe';
  if (settings.concorrentes_extra !== undefined) out.concorrentes_extra = String(settings.concorrentes_extra).slice(0, 2000);
  if (settings.drive_folder_id === '') out.drive_folder_id = '';
  else if (settings.drive_folder_id !== undefined) {
    var m = String(settings.drive_folder_id).match(/[-\w]{25,}/);
    if (!m) throw new Error('Informe o id ou a URL de uma pasta do Drive.');
    try { DriveApp.getFolderById(m[0]).getName(); } catch (e) { throw new Error('Não consegui abrir a pasta ' + m[0] + ' com a conta que publicou o app.'); }
    out.drive_folder_id = m[0];
  }
  withLock_(function () { setConfigMany_(out); });
  return apiAdminInfo();
}

function apiUploadBundle(fileName, text) {
  guard_('admin');
  return uploadBundleText_(fileName, text);
}

function apiImportDryRun(fileIdOrUrl, opts) {
  guard_('admin');
  return importDryRun_(fileIdOrUrl, opts || {});
}

function apiImportConfirm(fileIdOrUrl, opts) {
  guard_('admin');
  return importBundle_(readBundleFromDrive_(fileIdOrUrl), opts || {});
}

function apiLoadDemo() {
  guard_('admin');
  return importDemoBundle_();
}
