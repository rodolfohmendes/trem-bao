const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { compile } = require('../tools/gas_template');
const { S, clone, ID, NOW, LATER, world } = require('./world');

const render = compile(fs.readFileSync(path.join(__dirname, '..', 'src', 'relatorio.html'), 'utf8'));

function build(tipo, publico) {
  const w = world();
  let pov = S.transitionPov(w.pov, 'aceitar_plano', { por: 'Maria <b>(CISO)</b>', em: '2026-09-26' }, w.refs).row;
  pov = Object.assign({}, pov, { cliente: 'Banco <Exemplo>', objetivo: 'Provar prevenção', resumo_executivo: 'Tudo certo', proximos_passos: 'Proposta' });
  const execs = S.addCasesToPlan([], w.pov, [ID.CSPM, ID.PLAYBOOK, ID.XDR_ISOLATE, ID.ZTNA], w.idx, w.tax, w.refs).created;
  const crit = S.saveCriterionRow([], pov, { texto: 'Detectar bucket público' }, w.refs).row;
  const e0 = execs[0];
  const done = S.applyExecutionUpdate(e0, { exec_id: e0.exec_id, status: 'partial', criterios_ids: [crit.crit_id],
    checklist: e0.checklist.map((c, i) => ({ k: c.k, ok: i % 2 ? false : true, obs: c.t === 'met' ? '15 min' : '' })), resultado_obtido: '<script>alert(1)</script>',
    evidencias: [{ label: 'Print', url: 'https://drive.google.com/x', cliente: true }] }, w.ctx({ pov, caseRow: w.idx[e0.test_case_id], critIds: { [crit.crit_id]: true } })).row;
  const data = { execucoes: [done].concat(execs.slice(1)), caseIdx: w.idx, taxonomia: w.tax, criterios: [crit], pendencias: [], tentativas: [] };
  return S.buildReportModel(pov, data, { tipo, publico }, { autor: 'sc@example.com', nowIso: LATER, config: { library_export_date: NOW }, competitorNames: ['Concorrente A'] });
}

for (const tipo of ['plano', 'resultados', 'status']) {
  for (const publico of ['interno', 'cliente']) {
    test(`template renderiza ${tipo} / ${publico} sem scriptlets sobrando e com HTML escapado`, () => {
      const html = render(build(tipo, publico));
      assert.ok(!/<\?/.test(html), 'nenhum scriptlet sobrou');
      assert.ok(!/undefined|NaN|\[object Object\]/.test(html), 'nada de undefined/NaN/[object Object] no documento');
      assert.match(html, /Banco &lt;Exemplo&gt;/, 'valores escapados');
      assert.ok(!/<script>alert/.test(html), 'texto do usuário nunca vira HTML');
      assert.match(html, /background: #ffffff/, 'tema claro de impressão');
      if (publico === 'interno') assert.match(html, /USO INTERNO — Palo Alto Networks/);
      else {
        assert.ok(!/USO INTERNO/.test(html));
        assert.match(html, /Preparado para Banco &lt;Exemplo&gt;/);
        assert.ok(!/pov-companion\.example\.com/.test(html), 'sem link do POV Companion');
        assert.ok(!/intranet\.example\.com/.test(html), 'sem link interno do texto literal');
        assert.ok(!/Concorrente A/.test(html), 'sem posicionamento competitivo');
      }
      if (tipo === 'resultados') {
        assert.match(html, /critérios obrigatórios atendidos/);
        assert.match(html, /Aceite do resultado/);
        if (publico === 'cliente') assert.match(html, /Data e assinatura/);
      }
      if (tipo === 'plano') assert.match(html, /Casos de teste/);
      if (tipo === 'status') assert.ok(!/Detalhamento/.test(html));
      fs.mkdirSync(path.join(__dirname, '..', 'dev'), { recursive: true });
      fs.writeFileSync(path.join(__dirname, '..', 'dev', `relatorio-${tipo}-${publico}.html`), html);
    });
  }
}

test('detalhamento mostra títulos de passos, aceite com observado e métricas medidas', () => {
  const html = render(build('resultados', 'interno'));
  assert.match(html, /Passos do teste:/, 'item-título vira subtítulo');
  assert.match(html, /Resultado esperado/);
  assert.match(html, /15 min/, 'valor medido');
  assert.match(html, /tradução pendente/, 'caso sem tradução marcado na versão interna');
  assert.match(html, /Parcial/);
});

test('plano do cliente COM detalhamento: textos da biblioteca aparecem e nada interno aparece (asserções não vazias)', () => {
  const w = world();
  const execs = S.addCasesToPlan([], w.pov, [ID.ZTNA, ID.APPID_BLOCK], w.idx, w.tax, w.refs).created;
  const data = { execucoes: execs, caseIdx: w.idx, taxonomia: w.tax };
  const refs = { autor: 'sc@example.com', nowIso: LATER, competitorNames: ['Concorrente A'] };
  const interno = render(S.buildReportModel(w.pov, data, { tipo: 'plano', publico: 'interno' }, refs));
  const cliente = render(S.buildReportModel(w.pov, data, { tipo: 'plano', publico: 'cliente', detalhe: true }, refs));
  for (const s of ['intranet.example.com', 'pov-companion.example.com', 'Concorrente A']) {
    assert.ok(interno.includes(s), 'a versão interna tem "' + s + '" (a checagem do cliente não é vazia)');
    assert.ok(!cliente.includes(s), 'a versão do cliente não tem "' + s + '"');
  }
  assert.match(cliente, /Como testar/);
  assert.match(cliente, /\[link interno omitido\]/);
});

test('sem aceite formal: o cliente vê só que não houve aceite; o motivo fica na versão interna', () => {
  const w = world();
  const pov = S.transitionPov(w.pov, 'aceitar_plano', { sem_aceite: true, motivo: 'Cliente aprovou por e-mail informal' }, w.refs).row;
  const data = { execucoes: [], caseIdx: w.idx, taxonomia: w.tax };
  const refs = { autor: 'sc@example.com', nowIso: LATER };
  const c = render(S.buildReportModel(pov, data, { tipo: 'status', publico: 'cliente' }, refs));
  const i = render(S.buildReportModel(pov, data, { tipo: 'status', publico: 'interno' }, refs));
  assert.match(c, /sem aceite formal do plano/);
  assert.ok(!/aprovou por e-mail informal/.test(c));
  assert.match(i, /aprovou por e-mail informal/);
});
