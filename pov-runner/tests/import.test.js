const test = require('node:test');
const assert = require('node:assert/strict');
const { S, clone, NOW, ID, NODE, emptyState, imported } = require('./world');

const B = () => clone(S.DEMO_BUNDLE);

test('validateBundle aceita o bundle do coletor e rejeita o que não é dele', () => {
  const ok = S.validateBundle(B());
  assert.equal(ok.ok, true, ok.errors.join(' '));
  assert.equal(ok.partial, false);

  const outro = B(); outro.meta.source = 'outro';
  assert.match(S.validateBundle(outro).errors[0], /meta\.source/);

  const dup = B(); dup.test_cases.push(clone(dup.test_cases[0]));
  const r = S.validateBundle(dup);
  assert.ok(r.errors.some((e) => /duplicado/.test(e)));
  assert.ok(r.errors.some((e) => /meta\.counts\.test_cases/.test(e)), 'contagem declarada diferente da lista');

  const semTax = B(); semTax.taxonomy_nodes = [];
  assert.ok(S.validateBundle(semTax).errors.some((e) => /taxonomy_nodes/.test(e)), 'lista de referência vazia = coletor falhou');

  const envErrada = B(); envErrada.meta.counts.environments = 99;
  assert.ok(S.validateBundle(envErrada).errors.some((e) => /meta\.counts\.environments/.test(e)));

  assert.equal(S.validateBundle(null).ok, false);
  assert.equal(S.validateBundle([]).ok, false);
  assert.equal(S.validateBundle({ meta: { source: 'pov-companion-collector.js' }, test_cases: [] }).ok, false);
});

test('bundle parcial só passa com autorização explícita', () => {
  const p = B(); p.meta.partial = true;
  const r = S.validateBundle(p);
  assert.equal(r.ok, false);
  assert.equal(r.partial, true);
  assert.match(r.errors.join(' '), /Export parcial/);
  const r2 = S.validateBundle(p, { allowPartial: true });
  assert.equal(r2.ok, true);
  assert.match(r2.warnings.join(' '), /parcial autorizada/);

  const menor = B(); menor.meta.library_total_reported = 500;
  assert.equal(S.validateBundle(menor).partial, true, 'total reportado maior que a lista = parcial');
});

test('bundleToRows: só casos publicados e compartilhados; textos limpos; referências resolvidas', () => {
  const rows = imported();
  const byId = Object.fromEntries(rows.library.map((r) => [r.id, r]));
  assert.equal(rows.library.length, 24);
  assert.equal(rows.excluded.length, 2);
  assert.ok(!byId[ID.UNPUBLISHED] && !byId[ID.PRIVATE]);
  const missing = S.SCHEMA.Library.columns.filter((c) => !(c in rows.library[0]));
  assert.deepEqual(missing, [], 'toda coluna do SCHEMA existe na linha');

  const raw = S.DEMO_BUNDLE.test_cases.find((c) => c.id === ID.URL_FILTER);
  assert.ok(/""/.test(raw.description + raw.objectives.join(' ')), 'fixture tem aspas duplicadas no EN');
  const cleaned = byId[ID.URL_FILTER];
  assert.ok(!/""/.test(cleaned.description + cleaned.objectives.join(' ')), 'aspas duplicadas viram aspas simples');

  const pb = byId[ID.PLAYBOOK];
  assert.equal(pb.prerequisites.length, 2);
  assert.ok(pb.prerequisites.every((p) => p.id && p.name && 'description' in p), 'pré-requisitos com id, nome e descrição');
  assert.ok(pb.prerequisites.some((p) => p.description.length > 10));

  assert.deepEqual(byId[ID.ZONE].value_drivers, ['Reduce risk', 'Consolidation / TCO'], 'value drivers como id simples');
  assert.match(byId[ID.XSIAM_INGEST].value_drivers[0], / — /, 'value driver {id, narrative} vira "nome — nota"');

  assert.equal(byId[ID.ZONE].test_by, '', 'ator "Unknown" vira vazio');
  const sd = byId[ID.SDWAN];
  assert.equal(sd.test_result, 'fail');
  assert.equal(sd.lab_tests.length, 2, 'um teste de laboratório por ambiente');
  assert.deepEqual(sd.lab_tests.map((t) => t.result), ['fail', 'pass'], 'mais recente primeiro');

  assert.equal(byId[ID.WILDFIRE].url, 'https://pov-companion.example.com/library?case=' + ID.WILDFIRE, 'link montado com meta.origin');
  const noOrigin = B(); delete noOrigin.meta.origin;
  assert.equal(S.bundleToRows(noOrigin).library[0].url, '', 'sem origin não há link (nenhum host fixo no código)');

  const iac = byId[ID.IAC];
  assert.ok(iac.tax_ids.includes(NODE.CLOUD) && iac.tax_ids.includes(NODE.APPSEC) && iac.tax_ids.includes(NODE.C2C), 'tax_ids inclui ancestrais');
  assert.equal(rows.config.library_is_demo, 'true');
  assert.equal(rows.config.library_origin, 'https://pov-companion.example.com');
});

test('bundleToRows: tradução pendente sem bloco pt ou com versão diferente', () => {
  const rows = imported();
  const byId = Object.fromEntries(rows.library.map((r) => [r.id, r]));
  assert.equal(rows.pending, 2);
  assert.equal(byId[ID.XDR_ISOLATE].traducao_pendente, true);
  assert.equal(byId[ID.XDR_ISOLATE].name_pt, '');
  assert.equal(byId[ID.APPID_PORTS].traducao_pendente, true);
  assert.notEqual(byId[ID.APPID_PORTS].traducao_versao, byId[ID.APPID_PORTS].version);
  assert.equal(byId[ID.WILDFIRE].traducao_pendente, false);
});

test('taxonomia: tipos, subdomínio, profundidade calculada e pai inferido dos nós aposentados', () => {
  const rows = imported();
  const byId = Object.fromEntries(rows.taxonomia.map((n) => [n.node_id, n]));
  assert.equal(byId[NODE.NGFW].type, 'Domain');
  assert.equal(byId[NODE.NGFW].depth, 0);
  assert.equal(byId[NODE.SIA].type, 'Use Case');
  assert.equal(byId[NODE.SIA].path_pt, 'NGFW › Proteção do acesso à Internet');
  assert.equal(byId[NODE.APPSEC].type, 'Subdomain');
  assert.equal(byId[NODE.C2C].type, 'Use Case');
  assert.equal(byId[NODE.C2C].depth, 2, 'use case sob subdomínio fica na profundidade 2');
  assert.equal(byId[NODE.XSIAM_RET].status, 'embedded-only');
  assert.equal(byId[NODE.SOC_RET].status, 'embedded-only');
  assert.equal(byId[NODE.SOC_RET].name_pt, 'Aumentar a eficiência do SOC');
  // co-ocorrência só em node_ids; empate prefere o nó aposentado → o use case aposentado fica sob o domínio aposentado
  assert.equal(byId[NODE.SOC_RET].parent_id, NODE.XSIAM_RET);
  assert.equal(byId[NODE.SOC_RET].parent_inferido, true);
  assert.equal(byId[NODE.SIA].parent_inferido, false);
  assert.ok(rows.taxonomia.every((n) => typeof n.depth === 'number'));
});

test('carryOverTranslations preserva a tradução quando o bundle novo vem sem pt e a versão não mudou', () => {
  const first = imported();
  const semPt = B();
  semPt.test_cases.forEach((c) => { delete c.pt; });
  const wf = semPt.test_cases.find((c) => c.id === ID.WILDFIRE);
  const dns = semPt.test_cases.find((c) => c.id === ID.DNS);
  dns.version += 1; // mudou: não dá para reaproveitar
  const rows = S.bundleToRows(semPt);
  const info = S.carryOverTranslations(rows, { library: first.library, taxonomia: first.taxonomia, ambientes: first.ambientes });
  const byId = Object.fromEntries(rows.library.map((r) => [r.id, r]));
  assert.equal(byId[wf.id].traducao_pendente, false);
  assert.equal(byId[wf.id].name_pt, first.library.find((r) => r.id === wf.id).name_pt);
  assert.equal(byId[dns.id].traducao_pendente, true);
  assert.ok(info.carried >= 20);
  assert.ok(info.lost >= 1);
  assert.equal(rows.pending, rows.library.filter((r) => r.traducao_pendente).length, 'contador de pendentes coerente');
});

test('lápides e órfãos: caso removido do bundle continua com texto para as execuções', () => {
  const first = imported();
  const execs = [
    { exec_id: 'e1', pov_id: 'p1', test_case_id: ID.WILDFIRE, ativo: true, orfao: false, caso_nome: 'WF', versao_caso: 2 },
    { exec_id: 'e2', pov_id: 'p1', test_case_id: 'custom:abc', ativo: true, orfao: false, caso_nome: 'Próprio', versao_caso: 1 },
  ];
  const next = B();
  next.test_cases = next.test_cases.filter((c) => c.id !== ID.WILDFIRE);
  next.meta.counts.test_cases = next.test_cases.length;
  next.meta.library_total_reported = next.test_cases.length;
  const current = { library: first.library, taxonomia: first.taxonomia, ambientes: first.ambientes, execucoes: execs, povs: [{ pov_id: 'p1', status: 'running' }] };
  const plan = S.planImport(next, current, {}, NOW);
  const tomb = plan.rows.library.find((r) => r.id === ID.WILDFIRE);
  assert.ok(tomb, 'lápide mantida');
  assert.equal(tomb.removido_em, NOW);
  assert.deepEqual(plan.orphanChanges.map((e) => e.exec_id), ['e1'], 'caso próprio nunca fica órfão');
  assert.equal(plan.dry.execucoes_orfas.length, 1);
  assert.equal(plan.dry.execucoes_orfas_em_pov_ativa, 1);
  assert.equal(execs[0].orfao, false, 'planImport não muda o estado atual');
  // lápide some do catálogo
  const cat = S.buildCatalog(plan.rows.library, plan.rows.taxonomia, plan.rows.ambientes, {});
  assert.ok(!cat.cases.some((c) => c.id === ID.WILDFIRE));
  // import parcial autorizado não cria órfãos novos
  const partial = clone(next); partial.meta.partial = true;
  const p2 = S.planImport(partial, current, { allowPartial: true }, NOW);
  assert.deepEqual(p2.orphanChanges, []);
  // caso volta: execução órfã é reabilitada
  const back = S.markOrphans([{ exec_id: 'e1', test_case_id: ID.WILDFIRE, orfao: true }], { [ID.WILDFIRE]: true }, false);
  assert.equal(back[0].orfao, false);
});

test('dryRunImport reporta novos, alterados, removidos, excluídos, casos alterados e ciclo de vida', () => {
  const first = imported();
  const cur = clone(first.library).filter((r) => r.id !== ID.CSPM);
  cur.find((r) => r.id === ID.DNS).version = 0;
  cur.push(Object.assign(clone(first.library[0]), { id: 'sumiu', name_pt: 'Caso que sumiu' }));
  const execs = [
    { exec_id: 'a', pov_id: 'p', test_case_id: ID.SSL, ativo: true, orfao: false, caso_nome: 'SSL', versao_caso: 1 },
    { exec_id: 'b', pov_id: 'p', test_case_id: ID.ALERT_GROUPING, ativo: true, orfao: false, caso_nome: 'Alertas', versao_caso: 2 },
  ];
  const plan = S.planImport(B(), { library: cur, taxonomia: [], ambientes: [], execucoes: execs, povs: [] }, {}, NOW);
  const d = plan.dry;
  assert.equal(d.total_novo, 24);
  assert.deepEqual(d.novos.length, 1);
  assert.ok(d.alterados.length >= 1);
  assert.deepEqual(d.removidos, ['Caso que sumiu']);
  assert.equal(d.excluidos.length, 2);
  assert.ok(d.execucoes_caso_alterado.includes('SSL'), 'versão da biblioteca ≠ versão no plano');
  assert.ok(d.execucoes_ciclo_alterado.some((x) => /Descontinuado/.test(x)), 'caso do plano descontinuado');
  assert.equal(d.referencias_nao_resolvidas, 0);
  assert.equal(d.is_demo, true);
});

test('importar o mesmo bundle duas vezes é idempotente', () => {
  const r1 = imported();
  const p2 = S.planImport(B(), { library: r1.library, taxonomia: r1.taxonomia, ambientes: r1.ambientes, execucoes: [], povs: [] }, {}, NOW);
  const d = p2.dry;
  assert.deepEqual([d.novos, d.alterados, d.removidos, d.execucoes_orfas], [[], [], [], []]);
  assert.deepEqual(p2.rows.library, r1.library);
  assert.deepEqual(p2.rows.taxonomia, r1.taxonomia);
  assert.deepEqual(p2.rows.ambientes, r1.ambientes);
});

test('planImport recusa bundle inválido com a mensagem do campo', () => {
  const bad = B(); bad.meta.source = 'x';
  assert.throws(() => S.planImport(bad, emptyState(), {}, NOW), /Arquivo inválido: meta\.source/);
});
