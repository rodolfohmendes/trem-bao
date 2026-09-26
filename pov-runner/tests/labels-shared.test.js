const test = require('node:test');
const assert = require('node:assert/strict');
const { S } = require('./world');

test('rótulos PT e utilidades de texto', () => {
  assert.equal(S.execStatusLabel('not_applicable'), 'Não aplicável');
  assert.equal(S.povStatusLabel('running'), 'Em execução');
  assert.equal(S.verdictLabel('no_cases'), 'Sem casos vinculados');
  assert.equal(S.checkMarkLabel('step', true), 'Feito');
  assert.equal(S.checkMarkLabel('prereq', false), 'Não atendido');
  assert.equal(S.checkMarkLabel('out', 'na'), 'Não se aplica');
  assert.equal(S.checkMarkLabel('met', null), 'Não avaliado');
  assert.equal(S.lifecycleLabel('novo-estado'), 'novo-estado', 'valor desconhecido passa como está');
  assert.equal(S.slugify('Banco Ação & Cia. — 2026'), 'banco-acao-cia-2026');
  assert.equal(S.slugify('***', 'x'), 'x');
  assert.equal(S.foldText('AÇÃO'), 'acao');
  assert.equal(S.safeUrl('https://ok.com/a?b=1'), 'https://ok.com/a?b=1');
  ['javascript:alert(1)', 'data:text/html,x', 'ftp://x', 'https://a b', 'https://x.com/"onmouseover'].forEach((u) => assert.equal(S.safeUrl(u), '', u));
  assert.equal(S.cleanText('Clique em ""OK""\r\n'), 'Clique em "OK"');
  assert.equal(S.isIsoDate('2026-02-28'), true);
  assert.equal(S.isIsoDate('2026-02-29'), false);
  assert.equal(S.dateBr('2026-09-05T10:00:00Z'), '05/09/2026');
  assert.equal(S.shortDateTime('2026-09-05T10:07:00Z'), '2026-09-05 10:07');
});

test('fixedOffsetFormatter formata no fuso pedido (virada de dia incluída)', () => {
  const f = S.fixedOffsetFormatter(-180);
  assert.equal(f('2026-09-26T02:30:00.000Z', 'date'), '25/09/2026', '23:30 em Brasília ainda é dia 25');
  assert.equal(f('2026-09-26T02:30:00.000Z', 'datetime'), '25/09/2026 23:30');
  assert.equal(f('2026-09-26T02:30:00.000Z', 'stamp'), '2026-09-25_2330');
  assert.equal(f('2026-09-26T02:30:00.000Z', 'isodate'), '2026-09-25');
  assert.equal(f('', 'date'), '');
  assert.equal(f('não é data', 'date'), '');
});

test('clientSharedCode roda sozinho no navegador (sem depender de nada do servidor)', () => {
  const code = S.clientSharedCode();
  // escopo isolado: só o que o código define
  const names = ['foldText', 'caseMatchesFilters', 'coveredNodeIds', 'suggestStatus', 'checklistSummary', 'caseForAudience', 'redactText', 'fixedOffsetFormatter',
    'checkMarkLabel', 'execStatusLabel', 'isHeaderItem', 'safeUrl', 'EXEC_STATUS_PT', 'LIMITS', 'PRIORITIES'];
  // eslint-disable-next-line no-new-func
  const B = new Function('"use strict";\n' + code + '\nreturn {' + names.join(',') + '};')();
  assert.equal(B.foldText('Ação'), 'acao');
  assert.equal(B.caseMatchesFilters({ name: 'Descriptografia', node_ids: ['a'], industries: [], lab_pass: true, lifecycle: 'tested' }, { q: 'descripto', covered: { a: true } }), true);
  assert.deepEqual(Object.keys(B.coveredNodeIds(['a'], [{ node_id: 'b', parent_id: 'a' }])).sort(), ['a', 'b']);
  const cl = [{ t: 'step', k: 's', i: 0, ok: true }, { t: 'out', k: 'out', i: 0, ok: true }];
  assert.equal(B.suggestStatus(cl), 'pass');
  assert.equal(B.checklistSummary(cl), S.checklistSummary(cl));
  const f = { docs: [{ url: 'https://docs.paloaltonetworks.com/x', audience: 'internal' }], summary: 'veja https://intranet.example.com/a', description: '', expected_outcome: '', how_to: '',
    objectives: [], evaluation_metrics: [], competitors: [{ name: 'X' }], lab_tests: [], notes: ['n'], value_drivers: [] };
  assert.deepEqual(B.caseForAudience(f, 'cliente'), S.caseForAudience(f, 'cliente'), 'mesma regra dos dois lados');
  assert.equal(B.fixedOffsetFormatter(0)('2026-01-02T03:04:00Z', 'datetime'), '02/01/2026 03:04');
  assert.equal(B.checkMarkLabel('step', 'na'), 'Não se aplica');
  assert.equal(B.execStatusLabel('blocked'), 'Bloqueado');
  assert.equal(B.isHeaderItem('Passos:'), true);
  assert.equal(B.safeUrl('javascript:x'), '');
  assert.equal(B.PRIORITIES.length, 3);
  assert.equal(B.LIMITS.uploadBytes, 10 * 1024 * 1024);
});
