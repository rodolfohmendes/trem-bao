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
