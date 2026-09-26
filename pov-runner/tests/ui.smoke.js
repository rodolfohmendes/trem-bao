/**
 * ui.smoke.js — passa pela interface inteira na página de desenvolvimento (dev/index.dev.html, com o
 * google.script.run falso de tools/build_dev_page.js) usando o Chromium do Playwright, e tira
 * screenshots em dev/shots/. Falha em qualquer erro de página/console (exceto fontes externas).
 *
 *   node tools/build_dev_page.js && node tests/ui.smoke.js      (ou: npm run dev:ui)
 */
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(ROOT, 'dev', 'shots');
const PAGE = 'file://' + path.join(ROOT, 'dev', 'index.dev.html');

async function launch() {
  try {
    return await chromium.launch();
  } catch (e) {
    // o Playwright instalado pode não bater com o build do navegador pré-instalado
    return chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  }
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, timezoneId: 'America/Sao_Paulo', locale: 'pt-BR', acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    // fontes do Google podem falhar sem rede/proxy: não é erro do app (qualquer outro recurso que falhe é)
    const fontFail = /Failed to load resource/.test(m.text()) && /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test((m.location() || {}).url || '');
    if (m.type() === 'error' && !fontFail) errors.push('console: ' + m.text() + ' @ ' + ((m.location() || {}).url || ''));
  });

  async function shot(name, opts) {
    // o topo é fixo (sticky): na captura da página inteira ele apareceria no meio se a página estivesse rolada
    if (opts && opts.fullPage) await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(SHOTS, name), ...(opts || {}) });
  }
  const step = (msg) => console.log('· ' + msg);
  const row = (name) => `#exec-list tr:has-text(${JSON.stringify(name)})`;
  const text = (sel) => page.textContent(sel);
  async function toast(re) {
    await page.waitForFunction((src) => {
      const t = document.getElementById('toast');
      return t.classList.contains('show') && new RegExp(src).test(t.textContent);
    }, re.source);
  }
  async function tab(name) {
    await page.click(`#pov-tabs button[data-tab=${name}]`);
    await page.waitForSelector(`#tab-${name}:not(.hidden)`);
  }
  async function home() {
    await page.click('#brand-home');
    await page.waitForSelector('#view-povs:not(.hidden) .pov-card');
  }
  async function openPov(cliente) {
    await page.click(`.pov-card:has-text(${JSON.stringify(cliente)})`);
    await page.waitForSelector('#view-pov:not(.hidden)');
    await page.waitForFunction((c) => document.querySelector('#pov-header h1') && document.querySelector('#pov-header h1').textContent.includes(c), cliente);
  }
  async function openPanel(name) {
    await page.click(row(name) + ' td.c-case');
    await page.waitForSelector('#exec-panel');
  }
  async function closed(sel) { await page.waitForSelector(sel, { state: 'detached' }); }
  async function answer(value) {
    await page.waitForSelector('.ask-modal #ask-text');
    await page.fill('.ask-modal #ask-text', value);
    await page.click('.ask-modal [data-act=yes]');
    await closed('.ask-modal');
  }

  // ------------------------------------------------------------ 01 início
  step('01 lista de PoVs');
  await page.goto(PAGE);
  await page.waitForSelector('#view-povs:not(.hidden) .pov-card');
  assert.equal(await text('#user-email'), 'dev@example.com');
  assert.ok((await page.$$('.pov-card')).length >= 3, 'ao menos 3 PoVs');
  assert.equal((await page.$$('#pov-counters .counter')).length, 4, '4 contadores');
  assert.match(await text('#pov-counters'), /Vitórias técnicas/);
  assert.match(await text('#povs-banners'), /demonstração/);
  assert.match(await text('.pov-card:has-text("Indústria Exemplo")'), /Vitória técnica/);
  await shot('01-povs.png');

  // ------------------------------------------------------------ 02 nova PoV
  step('02 nova PoV');
  await page.click('#btn-new-pov');
  await page.waitForSelector('#pov-form');
  await page.fill('#np-cliente', 'Saúde Exemplo');
  // Esc com rascunho pede confirmação; "Continuar editando" mantém o formulário
  await page.keyboard.press('Escape');
  await page.waitForSelector('.modal:has-text("Descartar as alterações?")');
  await page.click('.modal:has-text("Descartar as alterações?") [data-act=no]');
  assert.ok(await page.$('#pov-form'), 'formulário continua aberto');
  await page.fill('#np-titulo', 'PoV Prisma Access');
  await page.fill('#np-oportunidade', 'OPP-2026-0999');
  await page.fill('#np-contato', 'Paula Reis (CISO)');
  await page.fill('#np-equipe', 'ana.souza@example.com, bruno.lima@example.com');
  await page.fill('#np-inicio', '2026-10-05');
  await page.fill('#np-fim', '2026-10-23');
  await page.fill('#np-ambiente', 'Tenant do Prisma Access');
  await page.fill('#np-objetivo', 'Validar o acesso remoto dos médicos plantonistas às aplicações clínicas sem VPN, com inspeção de ameaças e DLP.');
  await shot('02-nova-pov.png');
  await page.click('#pov-form [data-act=ok]');
  await closed('#pov-form');
  await page.waitForSelector('#view-pov:not(.hidden)');
  assert.match(await text('#pov-header'), /Saúde Exemplo/);
  assert.match(await text('#pov-header .st'), /Planejamento/);
  assert.ok(await page.$('#btn-accept-plan'), 'ação de aceite do plano em planejamento');
  assert.match(await text('#crumbs'), /Saúde Exemplo — PoV Prisma Access/);

  // ------------------------------------------------------------ 03 execução da PoV A
  step('03 execução da PoV A');
  await home();
  assert.equal((await page.$$('.pov-card')).length, 4);
  await openPov('Banco Exemplo');
  await page.waitForSelector('#tab-exec:not(.hidden) .group');
  assert.ok((await page.$$('#exec-counters .counter')).length >= 8, 'contadores da execução');
  assert.ok((await page.$$('#exec-list .group')).length >= 3, 'grupos por use case');
  assert.ok(await page.$('#exec-list .badge.reexec'), 'badge re-executado');
  assert.ok(await page.$('#exec-list .badge.custom'), 'badge definido com o cliente');
  assert.ok(await page.$('#exec-list .badge:has-text("caso alterado")'), 'badge caso alterado');
  assert.ok(await page.$('#exec-list .badge:has-text("removido da biblioteca")'), 'badge removido');
  assert.ok(await page.$('#exec-list .badge:has-text("tradução pendente")'), 'badge tradução pendente');
  assert.match(await text('#exec-list'), /C1/);
  await page.check('#exec-today');
  assert.equal((await page.$$('#exec-list tbody tr')).length, 2, 'filtro "hoje"');
  await page.uncheck('#exec-today');
  await page.click('#exec-filter button[data-st=blocked]');
  assert.equal((await page.$$('#exec-list tbody tr')).length, 1, 'filtro por status');
  await page.click('#exec-filter button[data-st=""]');
  await shot('03-execucao.png', { fullPage: true });

  // ------------------------------------------------------------ 04 painel de execução
  step('04 painel de execução');
  await openPanel('ZTNA para aplicação privada');
  for (const t of ['prereq', 'step', 'out']) {
    for (const b of await page.$$(`#exec-panel .ck-item[data-t=${t}] button[data-ok=true]`)) await b.click();
  }
  const met = await page.$$('#exec-panel .ck-item[data-t=met] .ck-obs');
  for (const m of met) await m.fill('1,8 s');
  await page.waitForSelector('#ep-apply');
  assert.match(await text('#ep-hint'), /Sugestão pelo checklist: Aprovado/);
  await page.click('#ep-apply');
  assert.ok(await page.$('#ep-status button[data-st=pass].on'), 'sugestão aplicada');
  await page.fill('#ep-ev-label', 'Gravação da sessão ZTNA');
  await page.fill('#ep-ev-url', 'https://drive.google.com/file/d/1ZtNaGravacao0123456789abcdefXYZ/view');
  await page.check('#ep-ev-cliente');
  await page.click('#ep-ev-add');
  await page.setInputFiles('#ep-file', { name: 'log-ztna.txt', mimeType: 'text/plain', buffer: Buffer.from('acesso liberado 10:32') });
  await page.waitForFunction(() => document.querySelectorAll('#ep-ev-list .ev').length === 2);
  assert.ok(await page.$('#ep-ev-list .ev:has-text("Gravação da sessão ZTNA") .ev-cli:checked'), 'evidência marcada para o cliente');
  await page.fill('#ep-result', 'A aplicação interna abriu pelo ZTNA sem VPN em 1,8 s; o acesso ficou no log com usuário e dispositivo.');
  await page.fill('#ep-test', 'Carla Mendes');
  await shot('04-painel-execucao.png');
  await page.click('#ep-save');
  await closed('#exec-panel');
  await toast(/Caso salvo: Aprovado/);
  assert.match(await text(row('ZTNA para aplicação privada') + ' .c-st'), /Aprovado/);
  assert.match(await text(row('ZTNA para aplicação privada') + ' .c-ev'), /2/);

  // ------------------------------------------------------------ 05 conflito
  step('05 conflito de edição');
  await openPanel('Prisma Access: acesso de usuários remotos');
  const draft = 'Rascunho: conexão estável nos dois notebooks; latência média de 38 ms contra 95 ms da VPN atual.';
  await page.fill('#ep-result', draft);
  await page.evaluate(() => {
    const e = window.__db.execucoes.find((x) => /Prisma Access/.test(x.caso_nome) && x.ativo);
    e.autor = 'bruno.lima@example.com';
    e.atualizado_em = new Date().toISOString();
    e.prioridade = 'high';
    e.resultado_obtido = 'Teste parcial feito pelo Bruno.';
  });
  await page.click('#ep-save');
  await page.waitForSelector('#ep-conflict .conflict-box');
  assert.match(await text('#ep-conflict'), /alterado por bruno\.lima@example\.com/);
  assert.match(await text('#ep-conflict'), /Teste parcial feito pelo Bruno/);
  assert.ok(await page.$('#ep-discard') && await page.$('#ep-overwrite'), 'botões do conflito');
  assert.equal(await page.inputValue('#ep-result'), draft, 'rascunho mantido');
  await shot('05-conflito.png');
  await page.click('#ep-overwrite');
  await closed('#exec-panel');
  const savedResult = await page.evaluate(() => window.__db.execucoes.find((x) => /Prisma Access/.test(x.caso_nome) && x.ativo).resultado_obtido);
  assert.equal(savedResult, draft, 'sobrescrever grava o rascunho');

  // ------------------------------------------------------------ 06 bloqueado exige pendência
  step('06 bloqueado exige pendência');
  await openPanel('Prisma SD-WAN');
  await page.click('#ep-status button[data-st=blocked]');
  await page.waitForSelector('#ep-np-desc');
  await page.click('#ep-save');
  await toast(/registre a pendência/);
  assert.ok(await page.$('#exec-panel'), 'painel continua aberto depois do erro');
  await page.fill('#ep-np-desc', 'Liberar o link MPLS de teste da filial Centro');
  await page.selectOption('#ep-np-tipo', 'parceiro');
  await page.fill('#ep-np-nome', 'Integrador Exemplo');
  await page.fill('#ep-np-prazo', '2026-10-02');
  await page.click('#ep-save');
  await closed('#exec-panel');
  assert.match(await text(row('Prisma SD-WAN') + ' .c-st'), /Bloqueado/);
  await tab('pendencias');
  await page.waitForSelector('#pend-body .pend-item:has-text("Liberar o link MPLS")');
  assert.match(await text('#pend-body .pend-item:has-text("Liberar o link MPLS")'), /Parceiro — Integrador Exemplo/);
  assert.match(await text('#pend-headline'), /2 pendências abertas/);
  await shot('06-pendencias.png', { fullPage: true });

  // ------------------------------------------------------------ 07 ações em lote
  step('07 ações em lote');
  await tab('exec');
  await page.check(row('App-ID: control applications') + ' .row-sel');
  await page.check(row('Envio dos logs do firewall') + ' .row-sel');
  await page.waitForSelector('#bulk-bar:not(.hidden)');
  assert.match(await text('#bulk-bar'), /2 casos selecionados/);
  await page.selectOption('#bulk-prio', 'high');
  await toast(/2 casos atualizados/);
  assert.match(await text(row('App-ID: control applications') + ' .c-prio'), /Alta/);
  assert.match(await text(row('Envio dos logs do firewall') + ' .c-prio'), /Alta/);
  await shot('07-lote.png');
  await page.click('#bulk-na');
  await answer('Fora do escopo acordado para esta fase.');
  await page.waitForFunction(() => [...document.querySelectorAll('#exec-list tr')].filter((tr) => /App-ID: control applications|Envio dos logs/.test(tr.textContent) && /Não aplicável/.test(tr.querySelector('.c-st').textContent)).length === 2);
  await page.click('#bulk-clear');
  await page.waitForSelector('#bulk-bar.hidden', { state: 'attached' });

  // ------------------------------------------------------------ 08 plano
  step('08 plano');
  await tab('plano');
  await page.waitForSelector('#tree .tnode');
  await page.check('#tree label:has-text("Postura de segurança em nuvem") input');
  await page.fill('#plan-q', 'CIEM');
  await page.waitForFunction(() => document.querySelectorAll('#plan-list .plan-item').length === 1);
  await page.check('#plan-list .plan-item:has-text("CIEM") .psel');
  await page.fill('#plan-q', '');
  await page.waitForFunction(() => document.querySelectorAll('#plan-list .plan-item').length >= 3);
  await page.check('#plan-list .plan-item:has-text("CSPM") .psel');
  assert.match(await text('#btn-plan-add'), /Incluir no plano \(2\)/);
  await shot('08-plano.png', { fullPage: true });
  await page.click('#btn-plan-add');
  await answer('Cliente pediu para incluir postura de nuvem na mesma PoV.');
  await page.waitForSelector('#tab-exec:not(.hidden)');
  await toast(/2 casos incluídos/);
  assert.ok(await page.$(row('CIEM') + ' .badge:has-text("incluído após o aceite")'), 'inclusão depois do aceite marcada');
  assert.ok(await page.$(row('CSPM')), 'CSPM no plano');
  assert.ok(await page.$('#exec-list .group-title:has-text("Postura de segurança em nuvem")'), 'grupo do use case selecionado');
  // caso definido com o cliente
  await tab('plano');
  await page.click('#btn-custom-new');
  await page.waitForSelector('#custom-form');
  await page.fill('#cc-nome', 'Acesso ao core bancário via ZTNA');
  await page.fill('#cc-resumo', 'Aplicação crítica indicada pela tesouraria.');
  await page.selectOption('#cc-uc', { label: 'SASE › Acesso remoto seguro' });
  await page.fill('#cc-passos', 'Pré-condições:\nPublicar a aplicação do core bancário no ZTNA Connector.\nAcessar com um usuário da tesouraria.\nConferir o log de acesso.');
  await page.fill('#cc-esperado', 'A aplicação abre sem VPN e o acesso fica registrado com usuário e dispositivo.');
  await page.fill('#cc-metricas', 'Tempo de login (s)');
  await page.fill('#cc-motivo', 'Aplicação crítica indicada pelo cliente depois do aceite.');
  await page.click('#custom-form [data-act=ok]');
  await closed('#custom-form');
  await page.waitForSelector('#tab-exec:not(.hidden)');
  assert.ok(await page.$(row('Acesso ao core bancário via ZTNA') + ' .badge.custom'), 'caso próprio com badge');
  await openPanel('Acesso ao core bancário via ZTNA');
  assert.ok(await page.$('#exec-panel .ck-sub:has-text("Pré-condições:")'), 'título de seção vira subtítulo no checklist');
  assert.equal((await page.$$('#exec-panel .ck-item[data-t=step]')).length, 3, 'título não é avaliável');
  await page.click('#ep-cancel');
  await closed('#exec-panel');

  // ------------------------------------------------------------ 09 critérios
  step('09 critérios');
  await tab('criterios');
  await page.click('#btn-crit-new');
  await page.waitForSelector('#crit-form');
  await page.fill('#cr-texto', 'Postura de nuvem: apontar buckets públicos em até 24 h');
  await page.selectOption('#cr-peso', 'desejavel');
  await page.click('#crit-form [data-act=ok]');
  await closed('#crit-form');
  const critRow = '#crit-body tr:has-text("Postura de nuvem: apontar")';
  await page.waitForSelector(critRow);
  assert.match(await text(critRow), /Sem casos vinculados/);
  await page.click(critRow + ' button[data-act=verdict]');
  await page.waitForSelector('#verdict-form');
  await page.selectOption('#vd-sel', 'met');
  await page.fill('#vd-just', 'Demonstrado ao vivo na conta de homologação, com o arquiteto de nuvem do banco.');
  await page.click('#verdict-form [data-act=ok]');
  await closed('#verdict-form');
  await page.waitForSelector(critRow + ' .badge.manual');
  assert.match(await text(critRow), /Atendido/);
  assert.match(await text(critRow), /Demonstrado ao vivo/);
  await shot('09-criterios.png', { fullPage: true });

  // ------------------------------------------------------------ 10 relatório
  step('10 relatório');
  await tab('relatorio');
  await page.click('#rep-tipo button[data-v=resultados]');
  await page.click('#rep-publico button[data-v=cliente]');
  await page.waitForFunction(() => {
    const d = document.getElementById('preview').contentDocument;
    return d && d.body && /Preparado para Banco Exemplo/.test(d.body.textContent);
  });
  const body = await page.evaluate(() => document.getElementById('preview').contentDocument.body.textContent);
  assert.match(body, /Preparado para/);
  assert.doesNotMatch(body, /USO INTERNO/);
  assert.doesNotMatch(body, /Observações internas/);
  await page.waitForSelector('#rep-leaks .leak-panel');
  assert.match(await text('#rep-leaks'), /Concorrente B/);
  await shot('10-relatorio.png');
  await page.click('#btn-rep-save');
  await page.waitForSelector('#leak-confirm');
  await page.click('#leak-confirm [data-act=yes]');
  await page.waitForSelector('#rep-result a:has-text("PDF")');
  assert.match(await text('#rep-result'), /HTML/);
  await page.waitForSelector('#rep-history tr:has-text("Relatório de resultados")');
  const [pdf] = await Promise.all([page.waitForEvent('download'), page.click('#btn-rep-pdf')]);
  assert.match(pdf.suggestedFilename(), /\.pdf$/);
  const [csvDl] = await Promise.all([page.waitForEvent('download'), page.click('#btn-rep-csv')]);
  assert.match(csvDl.suggestedFilename(), /_cliente_.*\.csv$/);
  const csv = fs.readFileSync(await csvDl.path(), 'utf8');
  assert.equal(csv.charCodeAt(0), 0xfeff, 'CSV com BOM');
  assert.doesNotMatch(csv, /Observações internas/, 'CSV do cliente sem colunas internas');

  // ------------------------------------------------------------ 11 modo cliente
  step('11 modo cliente');
  await tab('exec');
  await openPanel('Advanced URL Filtering');
  assert.match(await text('#exec-panel'), /Posicionamento oficial/);
  assert.match(await text('#exec-panel'), /Observações internas/);
  await page.click('#ep-cancel');
  await closed('#exec-panel');
  await page.click('#btn-client-mode');
  await page.waitForSelector('#client-banner:not(.hidden)');
  assert.equal(await page.evaluate(() => localStorage.getItem('povrunner.modoCliente')), '1');
  assert.ok(await page.isHidden('#pov-tabs button[data-tab=historico]'), 'Histórico some no modo cliente');
  assert.doesNotMatch(await text('#pov-header'), /OPP-2026-0412|Observações internas/);
  await openPanel('Advanced URL Filtering');
  const clientPanel = await text('#exec-panel');
  assert.doesNotMatch(clientPanel, /Observações internas/);
  assert.doesNotMatch(clientPanel, /Posicionamento oficial/);
  assert.doesNotMatch(clientPanel, /POV Companion/);
  assert.doesNotMatch(clientPanel, /Export do log de URL Filtering/, 'evidência interna oculta');
  await shot('11-modo-cliente.png');
  await page.click('#ep-cancel');
  await closed('#exec-panel');
  await openPanel('ZTNA para aplicação privada');
  const ztna = await text('#exec-panel .case-doc');
  assert.match(ztna, /\[link interno omitido\]/, 'link interno trocado no texto do caso');
  assert.doesNotMatch(ztna, /intranet\.example\.com/);
  await page.click('#ep-cancel');
  await closed('#exec-panel');
  await tab('relatorio');
  assert.ok(await page.isDisabled('#rep-publico button[data-v=interno]'), 'audiência forçada para Cliente');
  await page.click('#btn-client-mode');
  await page.waitForSelector('#client-banner.hidden', { state: 'attached' });

  // ------------------------------------------------------------ 12 ciclo de vida
  step('12 aceite, encerramento e reabertura');
  await home();
  await openPov('Varejo Exemplo');
  await page.click('#btn-accept-plan');
  await page.waitForSelector('#accept-form');
  await page.fill('#ap-por', 'Diego Ramos (Arquiteto de Nuvem)');
  await page.click('#accept-form [data-act=ok]');
  await closed('#accept-form');
  await page.waitForFunction(() => /Em execução/.test(document.querySelector('#pov-header .st').textContent));
  assert.match(await text('#pov-header'), /Plano aceito em/);
  await home();
  await openPov('Banco Exemplo');
  await page.click('#btn-close-pov');
  await page.waitForSelector('#close-form');
  await page.fill('#cp-resumo', 'Os critérios obrigatórios de proteção do acesso à Internet foram comprovados; acesso remoto aprovado com ZTNA.');
  await page.fill('#cp-passos', 'Proposta comercial até o comitê de arquitetura.');
  await page.selectOption('#cp-desfecho', 'tech_win');
  await page.fill('#cp-competidor', 'Concorrente B');
  await page.fill('#cr-por', 'Carla Mendes (Gerente de Segurança da Informação)');
  await page.click('#close-form [data-act=ok]');
  await closed('#close-form');
  await page.waitForFunction(() => /Concluída/.test(document.querySelector('#pov-header .st').textContent));
  assert.match(await text('#pov-header'), /somente leitura/);
  assert.ok(await page.isDisabled('#btn-pov-edit'), 'editar desabilitado');
  assert.ok(await page.$('#tab-relatorio:not(.hidden)'), 'a PoV lembra a última aba');
  await tab('exec');
  await openPanel('Advanced URL Filtering');
  assert.equal(await page.$('#ep-save'), null, 'sem Salvar na PoV concluída');
  assert.ok(await page.$$eval('#exec-panel .modal-body input, #exec-panel .modal-body textarea, #exec-panel .modal-body select, #exec-panel .modal-body .mk',
    (els) => els.length > 0 && els.every((e) => e.disabled)), 'painel somente leitura');
  await shot('12-encerrada.png');
  await page.click('#ep-cancel');
  await closed('#exec-panel');
  await page.click('#btn-reopen');
  await answer('Cliente pediu um teste extra de ZTNA.');
  await page.waitForFunction(() => /Em execução/.test(document.querySelector('#pov-header .st').textContent));

  // ------------------------------------------------------------ 13 administração
  step('13 administração');
  await page.click('#btn-admin');
  await page.waitForSelector('#admin-info');
  assert.match(await text('#admin-info'), /Test cases/);
  await page.fill('#import-file', 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456/view');
  await page.click('#btn-dryrun');
  await page.waitForSelector('#dryrun .line');
  const dry = await text('#dryrun');
  assert.match(dry, /Novos/);
  assert.match(dry, /Execuções que ficarão órfãs/);
  assert.ok(await page.$('#imp-orphans'), 'confirmação de órfãs em PoV ativa');
  assert.ok(!(await page.isDisabled('#btn-import')));
  assert.ok(await page.$('#settings-card'), 'configurações para administrador');
  await page.fill('#set-conc', 'Fornecedor Regional X');
  await page.click('#btn-settings-save');
  await toast(/Configurações salvas/);
  await shot('13-admin.png', { fullPage: true });

  // ------------------------------------------------------------ 14 biblioteca vazia; usuário comum
  step('14 biblioteca vazia (administrador) e usuário comum');
  await page.goto(PAGE + '?vazio=1');
  await page.waitForSelector('#view-admin:not(.hidden) #admin-info');
  await toast(/ainda não foi importada/);
  await page.click('#btn-demo');
  await page.click('.modal:has-text("Carregar a biblioteca de demonstração?") [data-act=yes]');
  await toast(/demonstração carregada/);
  await page.click('#btn-back-app');
  await page.waitForSelector('#view-povs:not(.hidden)');
  assert.match(await text('#pov-list'), /Nenhuma PoV ainda/);
  await page.goto(PAGE + '?usuario=ana.souza@example.com');
  await page.waitForSelector('#view-povs:not(.hidden) .pov-card');
  const clientes = await page.$$eval('.pov-card .c', (els) => els.map((e) => e.textContent).sort());
  assert.deepEqual(clientes, ['Banco Exemplo', 'Varejo Exemplo'], 'visibilidade por equipe');
  await page.click('#btn-admin');
  await page.waitForSelector('#admin-info');
  assert.equal(await page.$('#settings-card'), null, 'sem configurações para usuário comum');
  assert.equal(await page.$('#import-card'), null, 'sem importação para usuário comum');
  assert.match(await text('#admin-body'), /Somente administradores/);
  await shot('14-usuario-comum.png');

  await browser.close();
  assert.deepEqual(errors, [], 'sem erros de JS na página');
  console.log('UI smoke OK — screenshots em dev/shots/');
})().catch((e) => { console.error(e); process.exit(1); });
