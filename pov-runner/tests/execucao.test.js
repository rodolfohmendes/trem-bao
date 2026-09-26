const test = require('node:test');
const assert = require('node:assert/strict');
const { S, clone, ID, NOW, LATER, world } = require('./world');

function setup(ids) {
  const w = world();
  const res = w.plan(ids || [ID.DNS, ID.WILDFIRE]);
  const execs = res.created;
  const e = execs[0];
  const caseRow = w.idx[e.test_case_id];
  return Object.assign(w, { execs, e, caseRow, c: (extra) => w.ctx(Object.assign({ caseRow }, extra || {})) });
}

test('applyExecutionUpdate: status final grava timestamps, executado_por, versão avaliada e a tentativa', () => {
  const t = setup();
  const r = t.S.applyExecutionUpdate(t.e, { exec_id: t.e.exec_id, status: 'pass', resultado_obtido: '  Bloqueado.\r\nLog ok.  ' }, t.c());
  assert.equal(r.row.status, 'pass');
  assert.equal(r.row.iniciado_em, LATER);
  assert.equal(r.row.concluido_em, LATER);
  assert.equal(r.row.executado_por, 'sc@example.com');
  assert.equal(r.row.versao_avaliada, r.row.versao_caso);
  assert.equal(r.row.resultado_obtido, 'Bloqueado.\nLog ok.');
  assert.equal(r.row.tentativas, 1);
  assert.equal(r.row.primeiro_status, 'pass');
  assert.equal(r.attempt.n, 1);
  assert.equal(r.attempt.status, 'pass');
  assert.deepEqual(r.events.map((x) => [x.tipo, x.de, x.para]), [['status', 'not_started', 'pass']]);
  assert.equal(t.e.status, 'not_started', 'a linha original não é alterada');
  // voltar para não final limpa concluido_em mas mantém iniciado_em
  const back = t.S.applyExecutionUpdate(r.row, { exec_id: t.e.exec_id, status: 'in_progress' }, t.c({ nowIso: '2026-09-28T10:00:00.000Z' }));
  assert.equal(back.row.concluido_em, '');
  assert.equal(back.row.iniciado_em, LATER);
  assert.equal(back.attempt, null);
  // re-teste: nova tentativa, primeiro status preservado
  const fail = t.S.applyExecutionUpdate(back.row, { exec_id: t.e.exec_id, status: 'fail', causa: 'configuracao', referencia: 'TAC-123' }, t.c());
  const pass = t.S.applyExecutionUpdate(fail.row, { exec_id: t.e.exec_id, status: 'pass' }, t.c());
  assert.equal(pass.row.tentativas, 3);
  assert.equal(pass.row.primeiro_status, 'pass');
  assert.equal(fail.attempt.causa, 'configuracao');
  // salvar de novo com o mesmo status final não cria tentativa
  const same = t.S.applyExecutionUpdate(pass.row, { exec_id: t.e.exec_id, status: 'pass', resultado_obtido: 'ajuste' }, t.c());
  assert.equal(same.attempt, null);
  assert.equal(same.row.tentativas, 3);
});

test('applyExecutionUpdate: checklist só aceita chaves do caso; iniciado_em ao marcar um item', () => {
  const t = setup();
  const step = t.e.checklist.find((x) => x.t === 'step');
  const r = t.S.applyExecutionUpdate(t.e, { exec_id: t.e.exec_id, checklist: [{ k: step.k, ok: true, obs: ' visto ' }, { k: 'inventado', ok: false, obs: '' }] }, t.c());
  const s = r.row.checklist.find((x) => x.k === step.k);
  assert.equal(s.ok, true);
  assert.equal(s.obs, 'visto');
  assert.ok(!r.row.checklist.some((x) => x.k === 'inventado'));
  assert.equal(r.row.status, 'not_started');
  assert.equal(r.row.iniciado_em, LATER, 'marcar um item conta como início');
  assert.equal(r.row.concluido_em, '');
  assert.throws(() => t.S.applyExecutionUpdate(t.e, { exec_id: t.e.exec_id, checklist: [{ k: step.k, ok: 'talvez' }] }, t.c()), /marcação inválida/);
  const big = 'x'.repeat(1001);
  assert.throws(() => t.S.applyExecutionUpdate(t.e, { exec_id: t.e.exec_id, checklist: [{ k: step.k, ok: true, obs: big }] }, t.c()), /1000 caracteres/);
});

test('applyExecutionUpdate: validações, PoV travada, execução removida e conflito com a flag conflict', () => {
  const t = setup();
  const bad = (input, re) => assert.throws(() => t.S.applyExecutionUpdate(t.e, Object.assign({ exec_id: t.e.exec_id }, input), t.c()), re);
  bad({ status: 'talvez' }, /Status inválido/);
  bad({ prioridade: 'urgente' }, /Prioridade inválida/);
  bad({ causa: 'azar' }, /Causa inválida/);
  bad({ data_prevista: '31/12/2026' }, /Data prevista inválida/);
  bad({ evidencias: [{ label: 'x', url: 'javascript:alert(1)' }] }, /link inválido/);
  bad({ evidencias: Array.from({ length: 31 }, (_, i) => ({ url: 'https://e.com/' + i })) }, /No máximo 30/);
  bad({ resultado_obtido: 'x'.repeat(10001) }, /Resultado obtido passou/);
  assert.throws(() => t.S.applyExecutionUpdate(t.e, { exec_id: t.e.exec_id, status: 'pass' }, t.c({ pov: Object.assign({}, t.pov, { status: 'done' }) })), /Reabra a PoV/);
  assert.throws(() => t.S.applyExecutionUpdate(Object.assign({}, t.e, { ativo: false }), { exec_id: t.e.exec_id, status: 'pass' }, t.c()), /removido do plano/);
  try {
    t.S.applyExecutionUpdate(Object.assign({}, t.e, { atualizado_em: '2026-09-26T13:00:00.000Z', autor: 'ana@example.com' }), { exec_id: t.e.exec_id, status: 'pass', expected_atualizado_em: NOW }, t.c());
    assert.fail('deveria dar conflito');
  } catch (err) {
    assert.equal(err.conflict, true);
    assert.match(err.message, /Este caso foi alterado por ana@example.com em 26\/09\/2026 10:00 \(horário de Brasília\)/);
  }
});

test('bloqueado exige pendência aberta vinculada (existente ou criada no mesmo salvamento)', () => {
  const t = setup();
  assert.throws(() => t.S.applyExecutionUpdate(t.e, { exec_id: t.e.exec_id, status: 'blocked' }, t.c()), /pendência/);
  const closed = [{ pend_id: 'p1', status: 'resolvida', exec_ids: [t.e.exec_id] }];
  assert.throws(() => t.S.applyExecutionUpdate(t.e, { exec_id: t.e.exec_id, status: 'blocked' }, t.c({ pendencias: closed })), /pendência/);
  const open = [{ pend_id: 'p1', status: 'aberta', exec_ids: [t.e.exec_id] }];
  assert.equal(t.S.applyExecutionUpdate(t.e, { exec_id: t.e.exec_id, status: 'blocked' }, t.c({ pendencias: open })).row.status, 'blocked');
  const r = t.S.applyExecutionUpdate(t.e, { exec_id: t.e.exec_id, status: 'blocked',
    nova_pendencia: { descricao: 'Liberar a porta 443', responsavel_tipo: 'cliente', responsavel_nome: 'Rede', prazo: '2026-10-01' } }, t.c());
  assert.equal(r.newPendencia.status, 'aberta');
  assert.deepEqual(r.newPendencia.exec_ids, [t.e.exec_id]);
  assert.ok(r.events.some((x) => x.tipo === 'pendencia'));
  assert.throws(() => t.S.applyExecutionUpdate(t.e, { exec_id: t.e.exec_id, status: 'blocked', nova_pendencia: { descricao: 'x', responsavel_tipo: 'chefe' } }, t.c()), /Responsável inválido|Descreva/);
});

test('evidências: rótulo padrão, flag de cliente e links só http(s); critérios só os da PoV', () => {
  const t = setup();
  const r = t.S.applyExecutionUpdate(t.e, { exec_id: t.e.exec_id, evidencias: [{ url: 'https://drive.google.com/file/d/abc/view', cliente: true }, { label: 'log', url: 'https://example.com/log' }],
    criterios_ids: ['c1', 'c1', 'c9'] }, t.c({ critIds: { c1: true } }));
  assert.equal(r.row.evidencias[0].label, 'drive.google.com/file/d/abc/view');
  assert.equal(r.row.evidencias[0].cliente, true);
  assert.equal(r.row.evidencias[1].cliente, false);
  assert.deepEqual(r.row.criterios_ids, ['c1'], 'sem repetição e só critérios ativos da PoV');
  assert.ok(r.events.some((x) => x.tipo === 'criterio'));
});

test('refreshCaseVersion ajusta o checklist à versão nova e registra evento', () => {
  const t = setup([ID.DNS]);
  const e = Object.assign(clone(t.e), { versao_caso: 0 });
  const r = t.S.refreshCaseVersion(e, t.caseRow, t.pov, { autor: 'sc@example.com', nowIso: LATER });
  assert.equal(r.row.versao_caso, t.caseRow.version);
  assert.equal(r.event.tipo, 'versao');
  assert.throws(() => t.S.refreshCaseVersion(e, Object.assign(clone(t.caseRow), { removido_em: NOW }), t.pov, { autor: 'a', nowIso: LATER }), /não existe mais/);
  assert.throws(() => t.S.refreshCaseVersion(e, t.caseRow, Object.assign({}, t.pov, { status: 'cancelled' }), { autor: 'a', nowIso: LATER }), /Reabra/);
});

test('bulkUpdateExecutions aplica por linha, reporta conflitos e marca não aplicável com motivo', () => {
  const t = setup([ID.DNS, ID.WILDFIRE, ID.SSL]);
  const [a, b, c] = t.execs;
  const changed = Object.assign(clone(c), { atualizado_em: '2026-09-26T15:00:00.000Z', autor: 'ana@example.com' });
  const execs = [a, b, changed];
  const expected = { [a.exec_id]: a.atualizado_em, [b.exec_id]: b.atualizado_em, [c.exec_id]: c.atualizado_em };
  const r = t.S.bulkUpdateExecutions(execs, t.pov, [a.exec_id, b.exec_id, c.exec_id], { prioridade: 'high', responsavel: 'ana@example.com', criterio_add: 'k1' }, expected, t.c({ critIds: { k1: true } }));
  assert.equal(r.updated.length, 2);
  assert.deepEqual(r.conflicts.map((x) => x.exec_id), [c.exec_id]);
  assert.ok(r.updated.every((x) => x.prioridade === 'high' && x.responsavel === 'ana@example.com' && x.criterios_ids.includes('k1')));
  const na = t.S.bulkUpdateExecutions([a], t.pov, [a.exec_id], { nao_aplicavel: { motivo: 'Cliente não usa SaaS' } }, {}, t.c());
  assert.equal(na.updated[0].status, 'not_applicable');
  assert.match(na.updated[0].resultado_obtido, /Não aplicável: Cliente não usa SaaS/);
  assert.equal(na.attempts.length, 1);
  assert.throws(() => t.S.bulkUpdateExecutions([a], t.pov, [a.exec_id], { nao_aplicavel: { motivo: '' } }, {}, t.c()), /motivo/);
  assert.throws(() => t.S.bulkUpdateExecutions([a], t.pov, [], {}, {}, t.c()), /Selecione/);
  assert.throws(() => t.S.bulkUpdateExecutions([a], t.pov, [a.exec_id], { criterio_add: 'zz' }, {}, t.c()), /Critério de sucesso não encontrado/);
  assert.throws(() => t.S.bulkUpdateExecutions([a], Object.assign({}, t.pov, { status: 'done' }), [a.exec_id], { prioridade: 'low' }, {}, t.c()), /Reabra/);
});

test('computeProgress: concluídos, taxa de aprovação e aprovados após re-teste', () => {
  const e = (status, extra) => Object.assign({ ativo: true, status }, extra || {});
  const p = S.computeProgress([e('pass'), e('pass', { tentativas: 2, primeiro_status: 'fail' }), e('partial'), e('fail'), e('blocked'), e('not_applicable'),
    e('not_started'), e('in_progress'), Object.assign(e('pass'), { ativo: false })]);
  assert.equal(p.total, 8);
  assert.equal(p.concluidos, 5);
  assert.equal(p.pct_concluido, 63);
  assert.equal(p.avaliados, 4);
  assert.equal(p.taxa_aprovacao, 50);
  assert.equal(p.aprovados_apos_reteste, 1);
  assert.equal(p.reexecutados, 1);
  assert.equal(S.computeProgress([]).taxa_aprovacao, null);
});
