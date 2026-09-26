const test = require('node:test');
const assert = require('node:assert/strict');
const { S, clone, ID, NODE, NOW, LATER, world } = require('./world');

test('coveredNodeIds e caseMatchesFilters (escopo, busca PT/EN sem acento, indústria, laboratório, descontinuados)', () => {
  const w = world();
  const cat = S.buildCatalog(w.rows.library, w.tax, w.rows.ambientes, w.rows.config);
  const cov = S.coveredNodeIds([NODE.NGFW], w.tax);
  assert.ok(cov[NODE.SIA] && cov[NODE.URLF] && !cov[NODE.SASE]);
  const inNgfw = cat.cases.filter((c) => S.caseMatchesFilters(c, { covered: cov }));
  assert.ok(inNgfw.length >= 7);
  const byName = (q) => cat.cases.filter((c) => S.caseMatchesFilters(c, { q })).map((c) => c.id);
  assert.ok(byName('descriptografia').includes(ID.SSL), 'busca em PT');
  assert.ok(byName('decryption').includes(ID.SSL), 'busca em EN');
  assert.ok(byName('DESCRIPTOGRAFIA ssl').includes(ID.SSL), 'várias palavras, sem caixa');
  const dep = cat.cases.find((c) => c.id === ID.ALERT_GROUPING);
  assert.equal(S.caseMatchesFilters(dep, {}), false, 'descontinuado escondido por padrão');
  assert.equal(S.caseMatchesFilters(dep, { showDeprecated: true }), true);
  const url = cat.cases.find((c) => c.id === ID.URL_FILTER);
  assert.equal(S.caseMatchesFilters(url, { industry: 'Healthcare' }), false);
  assert.equal(S.caseMatchesFilters(url, { industry: 'FSI' }), true);
  const semInd = cat.cases.find((c) => !c.industries.length);
  assert.equal(S.caseMatchesFilters(semInd, { industry: 'Healthcare' }), true, 'sem indústria marcada fica');
  const ai = cat.cases.find((c) => c.id === ID.AI_ACCESS);
  assert.equal(S.caseMatchesFilters(ai, { onlyLabPass: true }), false);
});

test('useCaseFor resolve pelo tipo do nó, subindo por cenário e subdomínio, com fallback determinístico', () => {
  const w = world();
  const taxById = Object.fromEntries(w.tax.map((n) => [n.node_id, n]));
  const uc = (id, sel) => (S.useCaseFor(w.lib(id), sel ? S.coveredNodeIds(sel, w.tax) : null, taxById) || {}).node_id;
  assert.equal(uc(ID.SSL, [NODE.APPCTRL]), NODE.APPCTRL, 'use case selecionado');
  assert.equal(uc(ID.SSL, [NODE.SIA]), NODE.SIA);
  assert.equal(uc(ID.URL_FILTER, [NODE.URLF]), NODE.SIA, 'cenário selecionado → use case pai');
  assert.equal(uc(ID.IAC, [NODE.APPSEC]), NODE.C2C, 'subdomínio selecionado → use case abaixo dele');
  assert.equal(uc(ID.ZTNA, [NODE.SASE]), NODE.SRA, 'domínio selecionado');
  assert.equal(uc(ID.URL_FILTER, null), NODE.SIA, 'sem seleção: use case pai do cenário marcado');
  assert.equal(uc(ID.XSIAM_INGEST, null), uc(ID.XSIAM_INGEST, null), 'determinístico');
  assert.ok(uc(ID.IAC, null), 'sempre encontra um use case quando o caso tem');
});

test('addCasesToPlan: cria, ignora repetidos, reativa, recusa desconhecidos/lápides e guarda o snapshot', () => {
  const w = world();
  const r1 = w.plan([ID.DNS, ID.DNS, ID.WILDFIRE, 'nao-existe'], { selectedNodeIds: [NODE.SIA] });
  assert.equal(r1.added, 2);
  assert.deepEqual(r1.unknown, ['nao-existe']);
  const e = r1.created[0];
  assert.equal(e.use_case_id, NODE.SIA);
  assert.equal(e.use_case_nome, 'Proteção do acesso à Internet');
  assert.equal(e.use_case_path, 'NGFW › Proteção do acesso à Internet');
  assert.equal(e.caso_nome, S.displayFields(w.lib(ID.DNS)).name);
  assert.equal(e.versao_caso, w.lib(ID.DNS).version);
  assert.equal(e.status, 'not_started');
  assert.equal(e.ordem, 1);
  assert.equal(e.incluido_apos_aceite, false);
  assert.ok(e.checklist.length > 0 && e.checklist.every((c) => c.ok === null));
  const r2 = S.addCasesToPlan(r1.created, w.pov, [ID.DNS], w.idx, w.tax, w.refs);
  assert.equal(r2.skipped, 1);
  const removed = S.removeFromPlan(r1.created, w.pov, [e.exec_id], w.refs).updated[0];
  assert.equal(removed.ativo, false);
  assert.ok(removed.removido_em);
  const r3 = S.addCasesToPlan([removed, r1.created[1]], w.pov, [ID.DNS], w.idx, w.tax, w.refs);
  assert.equal(r3.reactivated, 1);
  assert.equal(r3.updated[0].exec_id, e.exec_id, 'mesma linha, resultados preservados');
  assert.equal(r3.updated[0].removido_em, '');
  const tomb = Object.assign({}, w.idx, { [ID.CSPM]: Object.assign(clone(w.lib(ID.CSPM)), { removido_em: NOW }) });
  assert.deepEqual(S.addCasesToPlan([], w.pov, [ID.CSPM], tomb, w.tax, w.refs).unknown, [ID.CSPM], 'lápide não entra no plano');
  assert.throws(() => S.addCasesToPlan([], w.pov, Array.from({ length: 201 }, (_, i) => 'c' + i), w.idx, w.tax, w.refs), /No máximo 200/);
  assert.throws(() => S.addCasesToPlan([], Object.assign({}, w.pov, { status: 'done' }), [ID.DNS], w.idx, w.tax, w.refs), /Reabra/);
});

test('depois do aceite do plano, incluir e remover exigem motivo e viram mudança de escopo', () => {
  const w = world();
  const base = w.plan([ID.DNS, ID.WILDFIRE]).created;
  const pov = S.transitionPov(w.pov, 'aceitar_plano', { por: 'Maria (CISO)', em: '2026-09-26' }, w.refs).row;
  assert.throws(() => S.addCasesToPlan(base, pov, [ID.SSL], w.idx, w.tax, w.refs), /motivo/);
  const add = S.addCasesToPlan(base, pov, [ID.SSL], w.idx, w.tax, Object.assign({}, w.refs, { nowIso: LATER, motivo: 'Cliente pediu teste de descriptografia' }));
  assert.equal(add.created[0].incluido_apos_aceite, true);
  assert.equal(add.events[0].tipo, 'escopo');
  assert.throws(() => S.removeFromPlan(base, pov, [base[0].exec_id], w.refs), /motivo/);
  const rem = S.removeFromPlan(base, pov, [base[0].exec_id], Object.assign({}, w.refs, { nowIso: LATER, motivo: 'Fora do escopo do contrato' }));
  assert.equal(rem.events[0].tipo, 'escopo');
  const all = [rem.updated[0], base[1], add.created[0]];
  const sc = S.scopeChanges(all, pov);
  assert.deepEqual(sc.incluidos.map((x) => x.motivo), ['Cliente pediu teste de descriptografia']);
  assert.deepEqual(sc.removidos.map((x) => x.motivo), ['Fora do escopo do contrato']);
  assert.deepEqual(S.scopeChanges(all, w.pov), { incluidos: [], removidos: [] }, 'sem aceite não há linha de base');
});

test('groupPlan: grupos por caminho, prioridade e ordem; nome gravado quando o nó some; órfãos no fim', () => {
  const w = world();
  const execs = w.plan([ID.DNS, ID.ZTNA, ID.SSL, ID.CSPM]).created;
  execs[2].prioridade = 'high';
  execs[3].use_case_id = 'no-que-sumiu';
  execs[3].use_case_nome = 'Use case antigo';
  execs[3].use_case_path = 'Cloud › Use case antigo';
  const orphan = Object.assign(clone(execs[0]), { exec_id: 'orf', test_case_id: 'sumiu', caso_nome: 'Caso antigo', orfao: true });
  const groups = S.groupPlan(execs.concat([orphan]), w.idx, w.tax);
  const names = groups.map((g) => g.name);
  assert.equal(names[names.length - 1], 'Casos removidos da biblioteca');
  assert.ok(names.includes('Use case antigo'), 'usa o nome gravado');
  const sia = groups.find((g) => g.use_case_id === execs[0].use_case_id);
  assert.equal(sia.items[0].prioridade, 'high', 'alta primeiro');
  assert.equal(groups.find((g) => g.use_case_id === 'orfaos').items[0].name, 'Caso antigo');
  const sorted = groups.filter((g) => g.use_case_id !== 'orfaos').map((g) => S.foldText(g.path || g.name));
  assert.deepEqual(sorted, sorted.slice().sort());
});

test('planItemView sinaliza caso alterado, sugestão e resumo do checklist', () => {
  const w = world();
  const e = w.plan([ID.DNS]).created[0];
  const changed = Object.assign(clone(w.lib(ID.DNS)), { version: 99 });
  const v = S.planItemView(e, changed);
  assert.equal(v.caso_alterado, true);
  assert.equal(v.versao_atual, 99);
  assert.equal(v.sugestao, null);
  assert.match(v.resumo_checklist, /passos/);
  assert.equal(S.planItemView(e, null).orfao, true);
});

test('buildPovView junta PoV, grupos, progresso, critérios, pendências, tentativas, casos próprios e histórico', () => {
  const w = world();
  const execs = w.plan([ID.DNS, ID.WILDFIRE]).created;
  const crit = S.saveCriterionRow([], w.pov, { texto: 'Detectar DGA', peso: 'obrigatorio' }, w.refs).row;
  execs[0].criterios_ids = [crit.crit_id];
  execs[0].status = 'pass';
  const custom = S.createCustomCaseRow(w.pov, { nome: 'Integração com SIEM', objetivos: ['Enviar logs'], resultado_esperado: 'Alerta em 5 min' }, w.refs).row;
  const idx = S.caseIndex(w.rows.library, [custom], w.tax);
  const plus = S.addCasesToPlan(execs, w.pov, [custom.caso_id], idx, w.tax, w.refs).created;
  const pend = S.createPendenciaRow(w.pov, { descricao: 'Usuário de teste', responsavel_tipo: 'cliente', prazo: '2026-09-20' }, [execs[1].exec_id], w.refs).row;
  const hist = [{ pov_id: w.pov.pov_id, exec_id: execs[0].exec_id, tipo: 'status', de: 'not_started', para: 'pass', nota: '', autor: 'a', em: LATER },
    { pov_id: 'outra', tipo: 'pov', de: '', para: 'planning', em: LATER }];
  const view = S.buildPovView(w.pov, { execucoes: execs.concat(plus), caseIdx: idx, taxonomia: w.tax, historico: hist, criterios: [crit], pendencias: [pend],
    tentativas: [{ pov_id: w.pov.pov_id, exec_id: execs[0].exec_id, n: 1, status: 'pass', em: LATER }], relatorios: [], hoje: '2026-09-26' });
  assert.equal(view.progress.total, 3);
  assert.equal(view.criterios.list[0].veredito, 'met');
  assert.equal(view.pendencias[0].atrasada, true);
  assert.deepEqual(view.pendencias[0].casos, [execs[1].caso_nome]);
  assert.equal(view.tentativas[execs[0].exec_id].length, 1);
  assert.equal(view.casos_proprios.length, 1);
  assert.equal(view.historico.length, 1, 'só eventos desta PoV');
  assert.equal(view.historico[0].para, 'Aprovado', 'rótulo PT');
  assert.ok(view.details[ID.DNS].checklist_items.length > 0);
  assert.ok(view.details[custom.caso_id], 'detalhe do caso próprio');
  assert.equal(view.in_plan.length, 3);
});
