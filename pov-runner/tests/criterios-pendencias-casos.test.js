const test = require('node:test');
const assert = require('node:assert/strict');
const { S, clone, seqIds, NOW, LATER, NODE, world } = require('./world');

const refs = () => ({ autor: 'sc@example.com', nowIso: NOW, newId: seqIds('k') });
const pov = { pov_id: 'p1', status: 'running', cliente: 'ACME', titulo: 'PoV' };

test('critérios: validação, criação com ordem, edição com conflito, PoV travada', () => {
  assert.equal(S.validateCriterion({ texto: 'ok' }).ok, false);
  assert.equal(S.validateCriterion({ texto: 'Bloquear malware', peso: 'essencial' }).ok, false);
  const a = S.saveCriterionRow([], pov, { texto: '  Bloquear malware  ' }, refs());
  assert.equal(a.created, true);
  assert.equal(a.row.texto, 'Bloquear malware');
  assert.equal(a.row.peso, 'obrigatorio', 'padrão obrigatório');
  assert.equal(a.row.ordem, 1);
  const b = S.saveCriterionRow([a.row], pov, { texto: 'Relatório em 1 clique', peso: 'desejavel' }, refs());
  assert.equal(b.row.ordem, 2);
  const e = S.saveCriterionRow([a.row], pov, { crit_id: a.row.crit_id, texto: 'Bloquear malware desconhecido', expected_atualizado_em: NOW }, Object.assign(refs(), { nowIso: LATER }));
  assert.equal(e.created, false);
  assert.equal(e.row.texto, 'Bloquear malware desconhecido');
  assert.throws(() => S.saveCriterionRow([e.row], pov, { crit_id: a.row.crit_id, texto: 'abc', expected_atualizado_em: NOW }, refs()), (x) => x.conflict === true);
  assert.throws(() => S.saveCriterionRow([], Object.assign({}, pov, { status: 'done' }), { texto: 'abc' }, refs()), /Reabra/);
});

test('criterionVerdict: regra automática e veredito manual com justificativa', () => {
  const c = { crit_id: 'c1', veredito_manual: '', justificativa: '' };
  const ex = (status, linked) => ({ ativo: true, status, criterios_ids: linked === false ? [] : ['c1'], caso_nome: status, exec_id: status });
  const v = (list) => S.criterionVerdict(c, list).final;
  assert.equal(v([]), 'no_cases');
  assert.equal(v([ex('not_applicable')]), 'no_cases', 'não aplicável não conta');
  assert.equal(v([ex('pass'), ex('pass')]), 'met');
  assert.equal(v([ex('pass'), ex('fail')]), 'not_met');
  assert.equal(v([ex('pass'), ex('in_progress')]), 'pending');
  assert.equal(v([ex('pass'), ex('blocked')]), 'pending');
  assert.equal(v([ex('pass'), ex('partial')]), 'partial');
  assert.equal(v([ex('pass'), ex('fail', false)]), 'met', 'só os vinculados');
  assert.equal(v([Object.assign(ex('fail'), { ativo: false }), ex('pass')]), 'met', 'removidos do plano não contam');
  const manual = S.setCriterionVerdict(Object.assign({ ativo: true, pov_id: 'p1' }, c), pov, { veredito_manual: 'met', justificativa: 'Validado em reunião com o cliente' }, refs());
  const mv = S.criterionVerdict(manual.row, [ex('fail')]);
  assert.equal(mv.final, 'met');
  assert.equal(mv.auto, 'not_met');
  assert.equal(mv.justificativa, 'Validado em reunião com o cliente');
  assert.throws(() => S.setCriterionVerdict(Object.assign({ ativo: true }, c), pov, { veredito_manual: 'met', justificativa: '' }, refs()), /Explique/);
  assert.throws(() => S.setCriterionVerdict(Object.assign({ ativo: true }, c), pov, { veredito_manual: 'ótimo', justificativa: 'porque sim' }, refs()), /inválido/);
  const back = S.setCriterionVerdict(manual.row, pov, { veredito_manual: '' }, refs());
  assert.equal(back.row.veredito_manual, '');
  assert.equal(back.row.justificativa, '');
});

test('criteriaSummary: manchete de obrigatórios e avisos de rastreabilidade', () => {
  const crits = [
    { crit_id: 'a', pov_id: 'p1', ativo: true, ordem: 2, texto: 'A', peso: 'obrigatorio' },
    { crit_id: 'b', pov_id: 'p1', ativo: true, ordem: 1, texto: 'B', peso: 'obrigatorio' },
    { crit_id: 'c', pov_id: 'p1', ativo: true, ordem: 3, texto: 'C', peso: 'desejavel' },
    { crit_id: 'd', pov_id: 'p1', ativo: false, ordem: 4, texto: 'D', peso: 'obrigatorio' },
    { crit_id: 'e', pov_id: 'p2', ativo: true, ordem: 1, texto: 'E', peso: 'obrigatorio' },
  ];
  const execs = [
    { exec_id: '1', ativo: true, status: 'pass', criterios_ids: ['a', 'c'], caso_nome: 'um' },
    { exec_id: '2', ativo: true, status: 'fail', criterios_ids: ['b'], caso_nome: 'dois' },
    { exec_id: '3', ativo: true, status: 'pass', criterios_ids: [], caso_nome: 'três' },
  ];
  const s = S.criteriaSummary(crits, execs, 'p1');
  assert.deepEqual(s.list.map((c) => c.texto), ['B', 'A', 'C'], 'ordem e só ativos da PoV');
  assert.deepEqual(s.list.map((c) => c.n), [1, 2, 3]);
  assert.equal(s.obrigatorios, 2);
  assert.equal(s.obrigatorios_atendidos, 1);
  assert.equal(s.obrigatorios_nao_atendidos, 1);
  assert.equal(s.atendidos, 2);
  assert.deepEqual(s.casos_sem_criterio, ['três']);
  assert.deepEqual(S.criteriaSummary([], execs, 'p1').casos_sem_criterio, [], 'sem critérios não há aviso');
});

test('pendências: validação, criação, resolver/reabrir com eventos e visão ordenada com atraso', () => {
  assert.equal(S.validatePendencia({ descricao: 'ab' }).ok, false);
  assert.equal(S.validatePendencia({ descricao: 'Licença', responsavel_tipo: 'chefe' }).ok, false);
  assert.equal(S.validatePendencia({ descricao: 'Licença', prazo: '2026-13-01' }).ok, false);
  const p = S.createPendenciaRow(pov, { descricao: 'Licença de avaliação', responsavel_tipo: 'panw', prazo: '2026-09-20' }, ['e1', 'e1', ''], refs()).row;
  assert.deepEqual(p.exec_ids, ['e1']);
  assert.equal(p.status, 'aberta');
  const r = S.updatePendenciaRow(p, { acao: 'resolver', resolucao: 'Licença aplicada', expected_atualizado_em: NOW }, Object.assign(refs(), { nowIso: LATER }));
  assert.equal(r.row.status, 'resolvida');
  assert.equal(r.row.resolvida_em, LATER);
  assert.equal(r.events[0].para, 'resolvida');
  assert.throws(() => S.updatePendenciaRow(r.row, { acao: 'reabrir', expected_atualizado_em: NOW }, refs()), (e) => e.conflict === true);
  const re = S.updatePendenciaRow(r.row, { acao: 'reabrir' }, refs());
  assert.equal(re.row.status, 'aberta');
  assert.equal(re.row.resolvida_em, '');
  const later = S.createPendenciaRow(pov, { descricao: 'SPAN no switch', responsavel_tipo: 'cliente', prazo: '2026-10-10' }, [], refs()).row;
  const semPrazo = S.createPendenciaRow(pov, { descricao: 'Usuário de teste', responsavel_tipo: 'cliente' }, [], refs()).row;
  const view = S.pendenciasView([semPrazo, r.row, later, p], [{ exec_id: 'e1', caso_nome: 'Caso 1' }], '2026-09-26');
  assert.deepEqual(view.map((x) => x.descricao), ['Licença de avaliação', 'SPAN no switch', 'Usuário de teste', 'Licença de avaliação']);
  assert.equal(view[0].atrasada, true);
  assert.equal(view[1].atrasada, false);
  assert.deepEqual(view[0].casos, ['Caso 1']);
  assert.equal(view[0].responsavel_label, 'Palo Alto Networks');
});

test('casos próprios: validação, versão sobe só quando o texto muda, conversão para linha da biblioteca', () => {
  const w = world();
  assert.equal(S.validateCustomCase({ nome: 'ab' }).ok, false);
  assert.ok(S.validateCustomCase({ nome: 'Caso X' }).errors.some((e) => /passo/.test(e)));
  const c = S.createCustomCaseRow(w.pov, { nome: 'Integração com o SIEM', objetivos: 'Enviar logs\n\nVer alerta\n', metricas: ['Tempo até o alerta'], resultado_esperado: 'Alerta em 5 min',
    use_case_id: NODE.IRA }, w.refs).row;
  assert.match(c.caso_id, /^custom:/);
  assert.deepEqual(c.objetivos, ['Enviar logs', 'Ver alerta'], 'uma linha por passo, sem linhas vazias');
  assert.equal(c.versao, 1);
  const same = S.updateCustomCaseRow(c, w.pov, { nome: c.nome, objetivos: c.objetivos, metricas: c.metricas, resultado_esperado: c.resultado_esperado, use_case_id: NODE.SIA }, w.refs);
  assert.equal(same.row.versao, 1, 'mudar só o use case não muda a versão');
  const edit = S.updateCustomCaseRow(c, w.pov, { nome: c.nome, objetivos: ['Enviar logs', 'Ver alerta', 'Abrir ticket'], resultado_esperado: c.resultado_esperado }, w.refs);
  assert.equal(edit.row.versao, 2);
  assert.throws(() => S.updateCustomCaseRow(c, Object.assign({}, w.pov, { status: 'done' }), { nome: 'abc', objetivos: ['a'] }, w.refs), /Reabra/);
  const row = S.customToLibraryRow(c, Object.fromEntries(w.tax.map((n) => [n.node_id, n])));
  assert.equal(row.custom, true);
  assert.equal(row.traducao_pendente, false);
  assert.deepEqual(row.tax_ids, [NODE.SECOPS, NODE.IRA], 'ancestrais do use case');
  const f = S.displayFields(row);
  assert.equal(f.name, 'Integração com o SIEM');
  assert.equal(S.checklistItems(row).filter((i) => i.t === 'step').length, 2);
  const idx = S.caseIndex(w.rows.library, [c], w.tax);
  assert.equal(idx[c.caso_id].custom, true);
  const other = Object.assign({}, w.pov, { pov_id: 'outra' });
  assert.deepEqual(S.addCasesToPlan([], other, [c.caso_id], idx, w.tax, w.refs).unknown, [c.caso_id], 'caso próprio não entra em outra PoV');
  assert.equal(S.isCustomCaseId(c.caso_id), true);
});

test('mensagem de conflito concorda em gênero e usa o horário de Brasília; visão traz atualizado_em dos casos próprios e ids sem critério', () => {
  assert.equal(S.conflictMessage('Esta PoV', { autor: 'ana@x.com', atualizado_em: '2026-09-26T02:30:00.000Z' }, true),
    'Esta PoV foi alterada por ana@x.com em 25/09/2026 23:30 (horário de Brasília).');
  assert.equal(S.conflictMessage('Este caso', {}), 'Este caso foi alterado por outra pessoa.');
  const w = world();
  const c = S.createCustomCaseRow(w.pov, { nome: 'Caso do cliente', objetivos: ['Passo'] }, w.refs).row;
  const idx = S.caseIndex(w.rows.library, [c], w.tax);
  const execs = S.addCasesToPlan([], w.pov, [c.caso_id], idx, w.tax, w.refs).created;
  const crit = S.saveCriterionRow([], w.pov, { texto: 'Algum critério' }, w.refs).row;
  const view = S.buildPovView(w.pov, { execucoes: execs, caseIdx: idx, taxonomia: w.tax, criterios: [crit] });
  assert.equal(view.casos_proprios[0].atualizado_em, c.atualizado_em);
  assert.deepEqual(view.criterios.casos_sem_criterio_ids, [execs[0].exec_id]);
});
