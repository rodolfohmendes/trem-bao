const test = require('node:test');
const assert = require('node:assert/strict');
const { S, clone, seqIds, NOW, LATER } = require('./world');

const refs = () => ({ autor: 'sc@example.com', nowIso: NOW, newId: seqIds('p'), library_export_date: '2026-09-20T12:00:00.000Z' });

test('validatePov: obrigatórios, datas de calendário e limites', () => {
  assert.deepEqual(S.validatePov({ cliente: 'ACME', titulo: 'PoV' }), { ok: true, errors: [] });
  const r = S.validatePov({ cliente: 'A', titulo: '', inicio: '2026-02-30', fim_previsto: 'amanhã', objetivo: 'x'.repeat(5001) });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /cliente/.test(e)));
  assert.ok(r.errors.some((e) => /título/.test(e)));
  assert.ok(r.errors.some((e) => /início inválida/.test(e)), '30/02 não existe');
  assert.ok(r.errors.some((e) => /fim inválida/.test(e)));
  assert.ok(r.errors.some((e) => /Objetivo passou/.test(e)));
  assert.ok(S.validatePov({ cliente: 'AB', titulo: 'CD', inicio: '2026-10-10', fim_previsto: '2026-10-01' }).errors.some((e) => /anterior/.test(e)));
});

test('createPovRow e updatePovRow (campos, concorrência, travada)', () => {
  const c = S.createPovRow({ cliente: ' ACME ', titulo: 'PoV SASE', equipe: 'Ana <ana@example.com>' }, refs());
  const p = c.row;
  assert.equal(p.cliente, 'ACME');
  assert.equal(p.status, 'planning');
  assert.equal(p.criado_por, 'sc@example.com');
  assert.equal(p.responsavel, 'sc@example.com', 'responsável padrão = quem criou');
  assert.equal(p.library_export_date, '2026-09-20T12:00:00.000Z');
  assert.ok(S.SCHEMA.PoVs.columns.every((col) => col in p));
  assert.equal(c.events[0].para, 'planning');
  const u = S.updatePovRow(p, { titulo: 'PoV SASE v2', status: 'done', expected_atualizado_em: NOW }, Object.assign(refs(), { nowIso: LATER }));
  assert.equal(u.row.titulo, 'PoV SASE v2');
  assert.equal(u.row.status, 'planning', 'status só muda por transição');
  assert.throws(() => S.updatePovRow(u.row, { titulo: 'x y', expected_atualizado_em: NOW }, refs()), (e) => e.conflict === true && /alterado por/.test(e.message));
  assert.throws(() => S.updatePovRow(Object.assign({}, p, { status: 'done' }), { titulo: 'x y' }, refs()), /Reabra/);
});

test('transitionPov: aceite do plano, encerramento com aceite/desfecho, reabrir e cancelar', () => {
  const p = S.createPovRow({ cliente: 'ACME', titulo: 'PoV' }, refs()).row;
  assert.throws(() => S.transitionPov(p, 'aceitar_plano', {}, refs()), /quem aceitou/);
  assert.throws(() => S.transitionPov(p, 'aceitar_plano', { sem_aceite: true, motivo: 'x' }, refs()), /sem aceite formal/);
  const a = S.transitionPov(p, 'aceitar_plano', { por: 'Maria (CISO)', em: '2026-09-25' }, refs());
  assert.equal(a.row.status, 'running');
  assert.equal(a.row.plano_aceite_em, '2026-09-25');
  assert.deepEqual(a.events.map((e) => e.tipo), ['aceite', 'pov']);
  const semAceite = S.transitionPov(p, 'aceitar_plano', { sem_aceite: true, motivo: 'Cliente aprovou por e-mail' }, refs()).row;
  assert.match(semAceite.plano_aceite_obs, /^Sem aceite formal: Cliente aprovou/);
  assert.equal(semAceite.plano_aceite_em, NOW.slice(0, 10));
  assert.throws(() => S.transitionPov(a.row, 'aceitar_plano', { por: 'X Y' }, refs()), /planejamento/);
  assert.throws(() => S.transitionPov(a.row, 'encerrar', {}, refs()), /aceitou o resultado/);
  assert.throws(() => S.transitionPov(a.row, 'encerrar', { aceite_por: 'Maria', desfecho: 'ganhou' }, refs()), /Desfecho inválido/);
  const d = S.transitionPov(a.row, 'encerrar', { aceite_por: 'Maria (CISO)', desfecho: 'tech_win', competidor: 'Concorrente A', resumo_executivo: 'Tudo certo', proximos_passos: 'Proposta' }, refs()).row;
  assert.equal(d.status, 'done');
  assert.equal(d.desfecho, 'tech_win');
  assert.equal(d.resumo_executivo, 'Tudo certo');
  assert.throws(() => S.transitionPov(d, 'reabrir', { motivo: '' }, refs()), /reaberta/);
  assert.equal(S.transitionPov(d, 'reabrir', { motivo: 'Teste extra pedido' }, refs()).row.status, 'running', 'com plano aceito volta para execução');
  assert.equal(S.transitionPov(Object.assign({}, p, { status: 'cancelled' }), 'reabrir', { motivo: 'Retomada do deal' }, refs()).row.status, 'planning');
  assert.equal(S.transitionPov(p, 'cancelar', { motivo: 'Deal perdido antes' }, refs()).row.status, 'cancelled');
  assert.throws(() => S.transitionPov(d, 'cancelar', { motivo: 'qualquer' }, refs()), /encerrada/);
  assert.throws(() => S.transitionPov(p, 'voar', {}, refs()), /Ação desconhecida/);
  assert.throws(() => S.transitionPov(a.row, 'encerrar', { aceite_por: 'M M', expected_atualizado_em: 'velho' }, refs()), (e) => e.conflict === true);
});

test('acesso: e-mails, usuários autorizados, administradores e equipe da PoV', () => {
  assert.deepEqual(S.parseEmails('Ana <Ana@Example.com>; bob@x.io, ana@example.com'), ['ana@example.com', 'bob@x.io']);
  assert.equal(S.isAuthorizedUser('', ''), false, 'sem e-mail nunca');
  assert.equal(S.isAuthorizedUser('a@x.com', ''), true, 'sem lista = qualquer identificado');
  assert.equal(S.isAuthorizedUser('a@paloaltonetworks.com', '@paloaltonetworks.com'), true);
  assert.equal(S.isAuthorizedUser('a@evil-paloaltonetworks.com', '@paloaltonetworks.com'), false, 'sufixo exige o @');
  assert.equal(S.isAuthorizedUser('b@x.com', 'a@x.com, @y.com'), false);
  assert.equal(S.isAdminUser('dono@x.com', '', 'dono@x.com'), true);
  assert.equal(S.isAdminUser('adm@x.com', 'Adm <adm@x.com>', 'dono@x.com'), true);
  assert.equal(S.isAdminUser('zé@x.com', 'adm@x.com', 'dono@x.com'), false);
  const pov = { criado_por: 'c@x.com', responsavel: 'Resp <r@x.com>', equipe: 'e1@x.com, e2@x.com' };
  ['c@x.com', 'r@x.com', 'e2@x.com'].forEach((e) => assert.equal(S.canAccessPov(pov, e, false, 'equipe'), true, e));
  assert.equal(S.canAccessPov(pov, 'outro@x.com', false, 'equipe'), false);
  assert.equal(S.canAccessPov(pov, 'outro@x.com', true, 'equipe'), true, 'admin vê tudo');
  assert.equal(S.canAccessPov(pov, 'outro@x.com', false, 'todos'), true);
});

test('listPovSummaries filtra por visibilidade, status, "minhas" e busca; ordena por status e atualização', () => {
  const mk = (id, status, extra) => Object.assign({ pov_id: id, cliente: 'Cliente ' + id, titulo: 'PoV ' + id, status, criado_por: 'x@x.com', responsavel: '', equipe: '', atualizado_em: '2026-09-2' + id }, extra || {});
  const povs = [mk('1', 'done'), mk('2', 'running', { equipe: 'eu@x.com' }), mk('3', 'planning', { responsavel: 'eu@x.com' }), mk('4', 'running', { cliente: 'Varejo Ágil' }), mk('5', 'cancelled')];
  const execs = [{ pov_id: '2', ativo: true, status: 'pass' }, { pov_id: '2', ativo: true, status: 'not_started' }];
  const crits = [{ crit_id: 'c', pov_id: '2', ativo: true, peso: 'obrigatorio', texto: 'x', ordem: 1 }];
  const acc = { email: 'eu@x.com', isAdmin: false, visibilidade: 'equipe' };
  assert.deepEqual(S.listPovSummaries(povs, execs, crits, {}, acc).map((p) => p.pov_id), ['2', '3'], 'só as da equipe');
  const all = S.listPovSummaries(povs, execs, crits, {}, Object.assign({}, acc, { isAdmin: true }));
  assert.deepEqual(all.map((p) => p.pov_id), ['4', '2', '3', '1', '5'], 'em execução → planejamento → concluída → cancelada; mais recente primeiro');
  assert.equal(all.find((p) => p.pov_id === '2').progress.pct_concluido, 50);
  assert.equal(all.find((p) => p.pov_id === '2').criterios.obrigatorios, 1);
  assert.deepEqual(S.listPovSummaries(povs, execs, crits, { q: 'varejo agil' }, Object.assign({}, acc, { isAdmin: true })).map((p) => p.pov_id), ['4'], 'busca sem acento');
  assert.deepEqual(S.listPovSummaries(povs, execs, crits, { mine: true }, Object.assign({}, acc, { isAdmin: true })).map((p) => p.pov_id), ['2', '3']);
  assert.deepEqual(S.listPovSummaries(povs, execs, crits, { status: 'done' }, Object.assign({}, acc, { isAdmin: true })).map((p) => p.pov_id), ['1']);
});
