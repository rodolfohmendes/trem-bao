const test = require('node:test');
const assert = require('node:assert/strict');
const { S, clone, ID, imported } = require('./world');

const rows = imported();
const lib = (id) => clone(rows.library.find((r) => r.id === id));

test('displayFields usa PT quando traduzido e EN quando a tradução está pendente ou incompleta', () => {
  const wf = S.displayFields(lib(ID.WILDFIRE));
  assert.equal(wf.translation_pending, false);
  assert.equal(wf.name, lib(ID.WILDFIRE).name_pt);
  assert.equal(wf.name_en, lib(ID.WILDFIRE).name);
  const xdr = S.displayFields(lib(ID.XDR_ISOLATE));
  assert.equal(xdr.translation_pending, true);
  assert.equal(xdr.name, lib(ID.XDR_ISOLATE).name);
  const stale = S.displayFields(lib(ID.APPID_PORTS));
  assert.deepEqual(stale.objectives, lib(ID.APPID_PORTS).objectives, 'desatualizada → EN');
  const torto = lib(ID.DNS); torto.objectives_pt = torto.objectives_pt.slice(1);
  assert.deepEqual(S.displayFields(torto).objectives, torto.objectives, 'array PT de tamanho diferente → EN (índices alinhados)');
  const sd = S.displayFields(lib(ID.SDWAN));
  assert.equal(sd.lab_pass, true, 'aprovado em algum ambiente de laboratório');
  assert.equal(sd.test_result, 'fail');
  assert.equal(S.displayFields(lib(ID.AI_ACCESS)).lab_pass, false);
});

test('isHeaderItem / isBlankText seguem o GUIA (títulos terminam com ":", "-" é vazio)', () => {
  assert.equal(S.isHeaderItem('Passos do teste:'), true);
  assert.equal(S.isHeaderItem('-'), true);
  assert.equal(S.isHeaderItem('  '), true);
  assert.equal(S.isHeaderItem('Verificar o log: bloqueado'), false);
  assert.equal(S.isBlankText('-'), true);
  assert.equal(S.isBlankText('- O endpoint é isolado.'), false);
});

test('checklistItems: pré-requisito por id, passos sem títulos, um aceite, métricas; chave pelo texto EN', () => {
  const cspm = lib(ID.CSPM);
  const items = S.checklistItems(cspm);
  const steps = items.filter((i) => i.t === 'step');
  assert.equal(steps.length, 4, '5 objetivos, 1 é título');
  assert.ok(!steps.some((s) => /:$/.test(s.txt)));
  assert.deepEqual(steps.map((s) => s.i), [0, 2, 3, 4], 'índice original preservado');
  assert.equal(items.filter((i) => i.t === 'out').length, 1);
  assert.equal(items.filter((i) => i.t === 'prereq').length, cspm.prerequisites.length);
  assert.ok(items.filter((i) => i.t === 'prereq').every((i) => i.k === 'prereq:' + cspm.prerequisites[i.i].id));
  assert.equal(items.filter((i) => i.t === 'met').length, 2);
  const enKey = S.checklistItems(Object.assign(clone(cspm), { traducao_pendente: true })).map((i) => i.k);
  assert.deepEqual(items.map((i) => i.k), enKey, 'chave igual em PT e EN');

  const ciem = S.checklistItems(lib(ID.CIEM)).filter((i) => i.t === 'step');
  assert.equal(ciem.length, 2, 'item "-" não vira passo');
  const ai = S.checklistItems(lib(ID.AI_ACCESS));
  assert.equal(ai.filter((i) => i.t === 'out').length, 0, 'resultado esperado vazio não vira aceite');

  const dup = clone(cspm); dup.objectives = ['Do it', 'Do it']; dup.objectives_pt = ['Fazer', 'Fazer'];
  const keys = S.checklistItems(dup).filter((i) => i.t === 'step').map((i) => i.k);
  assert.notEqual(keys[0], keys[1], 'textos repetidos ganham sufixo de ocorrência');
});

test('normalizeChecklist preserva marcações quando a tradução muda ou um passo é inserido', () => {
  const base = lib(ID.DNS);
  const cl = S.buildChecklist(base).map((c) => (c.t === 'step' ? Object.assign(c, { ok: true, obs: 'ok ' + c.i }) : c));
  // tradução nova (texto PT diferente, EN igual)
  const retrad = clone(base); retrad.objectives_pt = retrad.objectives_pt.map((t) => t + ' (revisado)');
  const n1 = S.normalizeChecklist(cl, retrad);
  assert.ok(n1.checklist.filter((c) => c.t === 'step').every((c) => c.ok === true), 'marcas mantidas');
  assert.ok(n1.checklist.filter((c) => c.t === 'step').every((c) => /revisado/.test(c.txt)), 'texto atualizado para a tradução nova');
  // passo inserido no começo: os demais continuam marcados, o novo fica em branco
  const ins = clone(base); ins.objectives = ['New first step'].concat(ins.objectives); ins.objectives_pt = ['Novo primeiro passo'].concat(ins.objectives_pt);
  const n2 = S.normalizeChecklist(cl, ins);
  const steps = n2.checklist.filter((c) => c.t === 'step' && !c.removido);
  assert.equal(steps[0].ok, null);
  assert.ok(steps.slice(1).every((c) => c.ok === true));
  assert.equal(n2.changed, true);
});

test('normalizeChecklist: item avaliado que sai da biblioteca fica como removido; não avaliado some', () => {
  const base = lib(ID.DNS);
  const cl = S.buildChecklist(base);
  const stepsIdx = cl.map((c, i) => [c, i]).filter(([c]) => c.t === 'step').map(([, i]) => i);
  cl[stepsIdx[0]].ok = false; cl[stepsIdx[0]].obs = 'falhou';
  const cut = clone(base);
  cut.objectives = cut.objectives.slice(2); cut.objectives_pt = cut.objectives_pt.slice(2);
  const n = S.normalizeChecklist(cl, cut);
  const removed = n.checklist.filter((c) => c.removido);
  assert.equal(removed.length, 1, 'só o avaliado foi preservado');
  assert.equal(removed[0].ok, false);
  assert.equal(removed[0].obs, 'falhou');
  const again = S.normalizeChecklist(n.checklist, cut);
  assert.equal(again.checklist.filter((c) => c.removido).length, 1, 'estável em nova normalização');
  const stats = S.checklistStats(n.checklist);
  assert.equal(stats.step.nok, 0, 'removidos não contam nas estatísticas');
});

test('normalizeChecklist aceita checklist antigo sem chave (casa por tipo, índice e texto)', () => {
  const base = lib(ID.WILDFIRE);
  const legacy = S.checklistItems(base).map((it) => ({ t: it.t, i: it.i, txt: it.txt, ok: true, obs: '' }));
  const n = S.normalizeChecklist(legacy, base);
  assert.ok(n.checklist.every((c) => c.ok === true && c.k));
});

test('checklistStats, checklistSummary e suggestStatus', () => {
  const mk = (arr) => arr.map(([t, ok, obs], i) => ({ t, k: t + i, i, txt: t, ok, obs: obs || '' }));
  const table = [
    [[['prereq', false], ['step', true], ['out', true]], 'blocked'],
    [[['step', null], ['out', null]], null],
    [[['step', true], ['step', true], ['out', true]], 'pass'],
    [[['step', true], ['step', false], ['out', true]], 'partial'],
    [[['step', true], ['out', false]], 'fail'],
    [[['step', true], ['step', null], ['out', null]], 'in_progress'],
    [[['step', true], ['step', true]], 'pass'],
    [[['step', true], ['step', false]], 'partial'],
    [[['step', false], ['step', false]], 'fail'],
    [[['step', true], ['step', null]], 'in_progress'],
    [[['step', 'na'], ['step', true], ['out', true], ['met', false, '12 min']], 'partial'],
    [[['met', null, '3 min']], 'in_progress'],
    [[['step', 'na'], ['step', 'na']], null],
  ];
  table.forEach(([items, expected], i) => assert.equal(S.suggestStatus(mk(items)), expected, 'linha ' + i));
  const cl = mk([['step', true], ['step', 'na'], ['step', null], ['out', true], ['met', null, '4 min'], ['met', null, '']]);
  const st = S.checklistStats(cl);
  assert.equal(st.steps_evaluable, 2);
  assert.equal(st.measured, 1);
  assert.equal(st.out.state, true);
  assert.equal(S.checklistSummary(cl), '1/2 passos · aceite ✓ · 1/2 medidas');
  assert.equal(S.checklistSummary([]), '—');
});
