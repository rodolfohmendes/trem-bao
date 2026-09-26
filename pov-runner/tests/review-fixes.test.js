/**
 * Regressões dos achados da revisão de código (cada teste reproduz o cenário que falhava).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { S, clone, seqIds, NOW, LATER, ID, NODE, imported, world } = require('./world');
const { loadSrc } = require('./harness');

test('export parcial autorizado: casos que só faltaram no download continuam (sem lápide, sem órfão, fora de "removidos")', () => {
  const first = imported();
  const part = clone(S.DEMO_BUNDLE);
  part.test_cases = part.test_cases.filter((c) => c.id !== ID.WILDFIRE && c.id !== ID.SSL);
  part.meta.counts.test_cases = part.test_cases.length;
  part.meta.partial = true;
  const execs = [{ exec_id: 'e1', pov_id: 'p1', test_case_id: ID.WILDFIRE, ativo: true, orfao: false, caso_nome: 'WF', versao_caso: 2 }];
  const current = { library: first.library, taxonomia: first.taxonomia, ambientes: first.ambientes, execucoes: execs, povs: [{ pov_id: 'p1', status: 'running' }] };
  for (const opts of [{ allowPartial: true }, { dryRun: true }]) {
    const plan = S.planImport(part, current, opts, NOW);
    const wf = plan.rows.library.find((r) => r.id === ID.WILDFIRE);
    assert.ok(wf && !wf.removido_em, 'caso mantido como estava');
    assert.ok(plan.rows.library.find((r) => r.id === ID.SSL), 'mesmo sem execução');
    assert.deepEqual(plan.dry.removidos, []);
    assert.deepEqual(plan.dry.execucoes_orfas, []);
    assert.equal(plan.dry.execucoes_orfas_em_pov_ativa, 0);
    assert.deepEqual(plan.orphanChanges, []);
    assert.equal(plan.rows.config.library_total, '24');
  }
});

test('pai de nó aposentado pode ser um nó ativo (profundidade calculada antes da inferência)', () => {
  const b = clone(S.DEMO_BUNDLE);
  b.test_cases.forEach((c) => {
    if (c.node_ids.includes(NODE.SOC_RET)) c.node_ids = [NODE.SECOPS, NODE.SOC_RET];
  });
  const rows = S.bundleToRows(b);
  const soc = rows.taxonomia.find((n) => n.node_id === NODE.SOC_RET);
  assert.equal(soc.parent_id, NODE.SECOPS);
  assert.equal(soc.parent_inferido, true);
  assert.equal(soc.path_pt, 'SecOps › Aumentar a eficiência do SOC');
});

test('mudança de escopo é um fato gravado, não uma comparação de datas', () => {
  const w = world();
  const execs = w.plan([ID.DNS, ID.SSL]).created;
  // removido durante o planejamento (sem motivo), no mesmo dia do aceite
  const early = S.removeFromPlan(execs, w.pov, [execs[1].exec_id], Object.assign({}, w.refs, { nowIso: '2026-09-26T10:00:00.000Z' })).updated[0];
  assert.equal(early.removido_apos_aceite, false);
  const pov = S.transitionPov(w.pov, 'aceitar_plano', { por: 'Maria', em: '2026-09-20' }, w.refs).row;
  assert.deepEqual(S.scopeChanges([execs[0], early], pov).removidos, [], 'remoção anterior ao aceite não aparece, mesmo com aceite retroativo');
  const late = S.removeFromPlan([execs[0]], pov, [execs[0].exec_id], Object.assign({}, w.refs, { motivo: 'Fora do contrato' })).updated[0];
  assert.equal(late.removido_apos_aceite, true);
  assert.deepEqual(S.scopeChanges([late, early], pov).removidos.map((x) => x.motivo), ['Fora do contrato']);
  const back = S.addCasesToPlan([late], pov, [ID.DNS], w.idx, w.tax, Object.assign({}, w.refs, { motivo: 'Voltou' })).updated[0];
  assert.equal(back.removido_apos_aceite, false, 'reinclusão limpa o fato');
});

test('reabrir limpa aceite e desfecho (guardados no evento) e o relatório não mostra aceite de PoV em execução', () => {
  const w = world();
  let pov = S.transitionPov(w.pov, 'aceitar_plano', { por: 'Maria' }, w.refs).row;
  pov = S.transitionPov(pov, 'encerrar', { aceite_por: 'Maria (CISO)', aceite_em: '2026-09-30', desfecho: 'tech_win', competidor: 'Concorrente A' }, w.refs).row;
  const r = S.transitionPov(pov, 'reabrir', { motivo: 'Teste adicional pedido' }, w.refs);
  assert.equal(r.row.status, 'running');
  assert.deepEqual([r.row.resultado_aceite_em, r.row.resultado_aceite_por, r.row.desfecho, r.row.competidor], ['', '', '', '']);
  assert.match(r.events[0].nota, /encerramento anterior: aceite em 2026-09-30 por Maria \(CISO\), Vitória técnica/);
  const m = S.buildReportModel(Object.assign({}, pov, { status: 'running' }), { execucoes: [], caseIdx: w.idx, taxonomia: w.tax }, { tipo: 'resultados', publico: 'interno' }, { autor: 'a', nowIso: NOW });
  assert.equal(m.pov.resultado_aceite, null, 'dados antigos de uma PoV reaberta não aparecem como atuais');
  assert.equal(m.pov.desfecho_label, '');
  const list = S.listPovSummaries([Object.assign({}, pov, { status: 'running' })], [], [], {}, { isAdmin: true });
  assert.equal(list[0].desfecho_label, '');
});

test('datas padrão do aceite usam o dia local (refs.hoje), não o dia UTC', () => {
  const w = world();
  const r = S.transitionPov(w.pov, 'aceitar_plano', { por: 'Maria' }, { autor: 'a', nowIso: '2026-09-27T01:30:00.000Z', hoje: '2026-09-26' });
  assert.equal(r.row.plano_aceite_em, '2026-09-26');
});

test('caso próprio grande demais é recusado antes de gravar; checklist do plano nunca passa do limite da célula', () => {
  const w = world();
  const big = { nome: 'Caso enorme', objetivos: Array.from({ length: 45 }, (_, i) => 'x'.repeat(990) + i), resultado_esperado: 'y'.repeat(4000),
    metricas: Array.from({ length: 10 }, (_, i) => 'm'.repeat(190) + i) };
  assert.match(S.validateCustomCase(big).errors.join(' '), /grande demais/);
  const lib = Object.assign(clone(w.lib(ID.DNS)), { id: 'fat', objectives: Array.from({ length: 80 }, (_, i) => 'z'.repeat(900) + i), objectives_pt: [] });
  assert.throws(() => S.addCasesToPlan([], w.pov, ['fat'], Object.assign({}, w.idx, { fat: lib }), w.tax, w.refs), /grande demais/);
});

test('lista de usuários aceita "Nome <email>", e-mails e domínios; nunca confunde e-mail com domínio', () => {
  assert.equal(S.isAuthorizedUser('ana@x.com', 'Ana Souza <Ana@X.com>, @y.com'), true);
  assert.equal(S.isAuthorizedUser('bob@y.com', 'Ana Souza <ana@x.com>, @y.com'), true);
  assert.equal(S.isAuthorizedUser('bob@x.com', 'ana@x.com'), false, 'e-mail de uma pessoa não libera o domínio dela');
  assert.equal(S.isAuthorizedUser('bob@x.com', '  '), true);
});

test('lote "não aplicável": motivo limitado, versão avaliada gravada, resultado longo demais vira conflito', () => {
  const w = world();
  const [a, b] = w.plan([ID.DNS, ID.WILDFIRE]).created;
  const ctx = w.ctx();
  const r = S.bulkUpdateExecutions([a], w.pov, [a.exec_id], { nao_aplicavel: { motivo: 'Sem SaaS' } }, {}, ctx);
  assert.equal(r.updated[0].versao_avaliada, a.versao_caso);
  assert.throws(() => S.bulkUpdateExecutions([a], w.pov, [a.exec_id], { nao_aplicavel: { motivo: 'm'.repeat(501) } }, {}, ctx), /motivo passou/);
  const full = Object.assign(clone(b), { resultado_obtido: 'r'.repeat(9990) });
  const r2 = S.bulkUpdateExecutions([full], w.pov, [b.exec_id], { nao_aplicavel: { motivo: 'Cliente sem o recurso' } }, {}, ctx);
  assert.equal(r2.updated.length, 0);
  assert.match(r2.conflicts[0].motivo, /longo demais/);
});

test('re-teste de um status final para outro atualiza concluido_em', () => {
  const w = world();
  const e = w.plan([ID.DNS]).created[0];
  const pass = S.applyExecutionUpdate(e, { exec_id: e.exec_id, status: 'pass' }, w.ctx({ nowIso: '2026-09-27T10:00:00.000Z' })).row;
  const fail = S.applyExecutionUpdate(pass, { exec_id: e.exec_id, status: 'fail' }, w.ctx({ nowIso: '2026-10-05T10:00:00.000Z' })).row;
  assert.equal(fail.concluido_em, '2026-10-05T10:00:00.000Z');
  assert.equal(fail.tentativas, 2);
});

test('marca do resultado esperado não sobrevive a um texto novo (vira item removido)', () => {
  const w = world();
  const e = w.plan([ID.DNS]).created[0];
  const done = S.applyExecutionUpdate(e, { exec_id: e.exec_id, checklist: e.checklist.map((c) => ({ k: c.k, ok: true, obs: '' })) }, w.ctx({ caseRow: w.lib(ID.DNS) })).row;
  const changed = Object.assign(clone(w.lib(ID.DNS)), { expected_outcome: 'Something completely different', expected_outcome_pt: 'Algo totalmente diferente', version: 9 });
  const n = S.normalizeChecklist(done.checklist, changed).checklist;
  const out = n.find((c) => c.t === 'out' && !c.removido);
  assert.equal(out.ok, null, 'novo aceite em branco');
  assert.ok(n.some((c) => c.t === 'out' && c.removido && c.ok === true), 'marca antiga preservada como removida');
  const same = S.normalizeChecklist(done.checklist, Object.assign(clone(w.lib(ID.DNS)), { expected_outcome_pt: 'Só a tradução mudou' })).checklist;
  assert.equal(same.find((c) => c.t === 'out').ok, true, 'mudar só a tradução mantém a marca');
});

test('versão do cliente: textos livres do SC passam pela troca de links; motivo de "sem aceite" fica interno; verificação cobre tudo que aparece', () => {
  const w = world();
  let pov = S.transitionPov(w.pov, 'aceitar_plano', { sem_aceite: true, motivo: 'Concorrente A já aprovado pelo CISO' }, w.refs).row;
  pov = Object.assign({}, pov, { titulo: 'PoV NGFW vs Concorrente A', objetivo: 'Detalhes em https://wiki.corp.example.com/pov', competidor: 'Rival Networks' });
  const execs = w.plan([ID.DNS, ID.SSL]).created;
  const e0 = execs[0];
  const step = e0.checklist.find((c) => c.t === 'step');
  const ev = 'https://drive.google.com/file/d/CLIENTE/view';
  const done = S.applyExecutionUpdate(e0, { exec_id: e0.exec_id, status: 'pass', resultado_obtido: 'Bloqueado. Rival Networks não bloqueia.',
    checklist: [{ k: step.k, ok: true, obs: 'log em https://jira.corp.example.com/SEC-9 e ' + ev }],
    evidencias: [{ label: 'print', url: ev, cliente: true }, { label: 'interno', url: 'https://drive.google.com/file/d/INTERNO/view' }] }, w.ctx({ pov, caseRow: w.idx[e0.test_case_id] })).row;
  const removed = S.removeFromPlan([execs[1]], pov, [execs[1].exec_id], Object.assign({}, w.refs, { motivo: 'Concorrente A ganha aqui' })).updated[0];
  const pend = S.createPendenciaRow(pov, { descricao: 'Liberar porta', responsavel_tipo: 'cliente', responsavel_nome: 'joao@cliente.com' }, [], w.refs).row;
  const data = { execucoes: [done, removed], caseIdx: w.idx, taxonomia: w.tax, pendencias: [pend] };
  const refs = { autor: 'sc@example.com', nowIso: LATER, competitorNames: ['Concorrente A'] };
  const m = S.buildReportModel(pov, data, { tipo: 'resultados', publico: 'cliente' }, refs);
  assert.equal(m.pov.plano_aceite.sem_aceite, true);
  assert.equal(m.pov.plano_aceite.obs, '', 'motivo interno não vai para o cliente');
  assert.match(m.pov.objetivo, /\[link interno omitido\]/);
  const c = m.casos.find((x) => x.exec_id === e0.exec_id);
  const obs = c.steps.find((s) => !s.header && s.obs).obs;
  assert.ok(obs.includes('[link interno omitido]') && obs.includes(ev), 'link interno trocado; evidência do cliente mantida');
  const tipos = (onde) => m.vazamentos.filter((h) => h.onde.startsWith(onde)).map((h) => h.tipo);
  assert.ok(tipos('Título da PoV').includes('concorrente'));
  assert.ok(tipos('Mudança de escopo').includes('concorrente'));
  assert.ok(m.vazamentos.some((h) => h.tipo === 'concorrente' && h.trecho === 'Rival Networks'), 'concorrente da própria PoV entra na verificação');
  assert.ok(!m.vazamentos.some((h) => h.onde.startsWith('Pendência (responsável)')), 'e-mail do responsável pela pendência é permitido');
  const mi = S.buildReportModel(pov, data, { tipo: 'resultados', publico: 'interno' }, refs);
  assert.match(mi.pov.plano_aceite.obs, /Concorrente A já aprovado/, 'a versão interna mantém o motivo');
  assert.ok(mi.casos[0].steps.some((s) => /jira\.corp/.test(s.obs)), 'a versão interna mantém os links');
  // rede de segurança: link que escapou de todas as trocas ainda é apontado
  const m2 = clone(m);
  m2.casos[0].testemunha = 'ver https://intranet.example.com/x';
  assert.ok(S.leakCheck(m2, [], {}).some((h) => h.tipo === 'link' && /intranet/.test(h.trecho)));
});

test('Sheets: atualização escreve só as colunas do app (colunas manuais intactas), em trechos contíguos, e volta igual', () => {
  const G = loadSrc(['Schema.js', 'Sheets.js']);
  // planilha falsa em memória, só com o que Sheets.js usa
  function fakeSheet(grid) {
    const calls = { setValues: 0 };
    const sh = {
      grid,
      getLastRow: () => grid.length,
      getLastColumn: () => Math.max(0, ...grid.map((r) => r.length)),
      getRange: (r, c, nr, nc) => ({
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (grid[r - 1 + i] || [])[c - 1 + j] ?? '')),
        setValues: (vals) => { calls.setValues++; vals.forEach((row, i) => row.forEach((v, j) => { grid[r - 1 + i] = grid[r - 1 + i] || []; grid[r - 1 + i][c - 1 + j] = typeof v === 'string' && v.startsWith("'") ? v.slice(1) : v; })); return this; },
        setNumberFormat: function () { return this; },
      }),
    };
    return { sh, calls };
  }
  const cols = G.SCHEMA.Pendencias.columns;
  const header = cols.slice(0, 3).concat(['nota_manual']).concat(cols.slice(3));
  const row = (id, desc, nota) => header.map((h) => (h === 'pend_id' ? id : h === 'descricao' ? desc : h === 'nota_manual' ? nota : h === 'exec_ids' ? '[]' : h === 'status' ? 'aberta' : ''));
  const { sh, calls } = fakeSheet([header.slice(), row('p1', 'a', 'nota 1'), row('p2', 'b', 'nota 2'), row('p3', 'c', 'nota 3')]);
  const env = new Function('G', 'sh', `
    const ss = { getSheetByName: () => sh };
    globalThis.SpreadsheetApp = { getActiveSpreadsheet: () => ss };
    return G;`)(G, sh);
  assert.ok(env);
  const rows = G.readTable_('Pendencias');
  assert.equal(rows.length, 3);
  assert.equal(rows[0].descricao, 'a');
  rows[1].descricao = '=SOMA(1)'; rows[2].descricao = 'c2';
  G.updateRowsByKey_('Pendencias', [rows[1], rows[2]]);
  const idx = (h) => header.indexOf(h);
  assert.deepEqual(sh.grid.slice(1).map((r) => r[idx('nota_manual')]), ['nota 1', 'nota 2', 'nota 3'], 'coluna manual intacta');
  assert.equal(sh.grid[2][idx('descricao')], '=SOMA(1)', 'o Sheets guardaria como texto (prefixo) e a leitura devolve igual');
  assert.equal(G.readTable_('Pendencias')[1].descricao, '=SOMA(1)');
  assert.equal(calls.setValues, 2, 'um trecho de linhas contíguas × dois segmentos de colunas do app');
  delete globalThis.SpreadsheetApp;
});
