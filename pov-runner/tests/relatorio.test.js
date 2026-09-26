const test = require('node:test');
const assert = require('node:assert/strict');
const { S, clone, ID, NODE, NOW, LATER, world } = require('./world');

/** PoV com plano aceito, 4 casos (1 aprovado após re-teste, 1 bloqueado, 1 incluído depois do aceite, 1 removido), critérios e pendências. */
function scenario() {
  const w = world();
  let pov = S.transitionPov(w.pov, 'aceitar_plano', { por: 'Maria (CISO)', em: '2026-09-26' }, w.refs).row;
  pov = Object.assign({}, pov, { objetivo: 'Provar prevenção inline', oportunidade: 'OPP-123 (SFDC)', observacoes: 'Concorrente A no deal', resumo_executivo: 'Critérios atendidos.' });
  const base = S.addCasesToPlan([], w.pov, [ID.WILDFIRE, ID.ZTNA, ID.SDWAN], w.idx, w.tax, Object.assign({}, w.refs, { selectedNodeIds: [] })).created;
  const extra = S.addCasesToPlan(base, pov, [ID.SSL], w.idx, w.tax, Object.assign({}, w.refs, { nowIso: LATER, motivo: 'Pedido do cliente' })).created;
  const c1 = S.saveCriterionRow([], pov, { texto: 'Bloquear malware desconhecido', peso: 'obrigatorio' }, w.refs).row;
  const c2 = S.saveCriterionRow([c1], pov, { texto: 'Acesso a app privada sem VPN', peso: 'desejavel' }, w.refs).row;
  const [wf, ztna, sd] = base;
  const ctx = (id) => w.ctx({ pov, caseRow: w.idx[id], critIds: { [c1.crit_id]: true, [c2.crit_id]: true } });
  const wfItems = wf.checklist.map((c) => ({ k: c.k, ok: c.t === 'met' ? null : true, obs: c.t === 'met' ? '2 min' : '' }));
  let r = S.applyExecutionUpdate(wf, { exec_id: wf.exec_id, status: 'fail', causa: 'configuracao', referencia: 'TAC-1' }, ctx(ID.WILDFIRE));
  const att = [r.attempt];
  r = S.applyExecutionUpdate(r.row, { exec_id: wf.exec_id, status: 'pass', checklist: wfItems, criterios_ids: [c1.crit_id], resultado_obtido: 'Veredito em 2 min. Log em https://intranet.example.com/log/1',
    observacoes: 'Concorrente A demorou 20 min', evidencias: [{ label: 'Print do veredito', url: 'https://drive.google.com/ev1', cliente: true }, { label: 'Log bruto', url: 'https://drive.google.com/ev2' }] },
  Object.assign(ctx(ID.WILDFIRE), { nowIso: '2026-09-28T10:00:00.000Z' }));
  att.push(r.attempt);
  const wfDone = r.row;
  const blocked = S.applyExecutionUpdate(ztna, { exec_id: ztna.exec_id, status: 'blocked', criterios_ids: [c2.crit_id], data_prevista: '2026-10-02', responsavel: 'ana@example.com',
    nova_pendencia: { descricao: 'Liberar a VM do conector', responsavel_tipo: 'cliente', prazo: '2026-09-20' } }, ctx(ID.ZTNA));
  const removed = S.removeFromPlan([sd], pov, [sd.exec_id], Object.assign({}, w.refs, { nowIso: LATER, motivo: 'Filial fora do escopo' })).updated[0];
  const execs = [wfDone, blocked.row, removed, extra[0]];
  const data = { execucoes: execs, caseIdx: w.idx, taxonomia: w.tax, criterios: [c1, c2], pendencias: [blocked.newPendencia], tentativas: att };
  const refs = { autor: 'sc@example.com', nowIso: '2026-09-28T12:00:00.000Z', config: { library_export_date: '2026-09-20T12:00:00.000Z', translation_date: '2026-09-20T13:00:00.000Z' },
    competitorNames: ['Concorrente A', 'Concorrente B'] };
  const model = (tipo, publico, extraOpts) => S.buildReportModel(pov, data, Object.assign({ tipo, publico }, extraOpts || {}), refs);
  return { w, pov, data, refs, model, wfDone, blocked, removed, c1, c2 };
}

test('redactText troca links internos e mantém os permitidos e os de documentação pública', () => {
  const t = 'Veja https://intranet.example.com/wiki/x, depois https://docs.paloaltonetworks.com/a e https://drive.google.com/ok.';
  const r = S.redactText(t, { 'https://drive.google.com/ok': true });
  assert.equal(r.count, 1);
  assert.equal(r.text, 'Veja [link interno omitido], depois https://docs.paloaltonetworks.com/a e https://drive.google.com/ok.');
  assert.equal(S.redactText('', {}).text, '');
});

test('caseForAudience: cliente perde campos internos e links internos do texto literal; interno fica igual', () => {
  const w = world();
  const f = S.displayFields(w.lib(ID.ZTNA));
  const c = S.caseForAudience(f, 'cliente');
  assert.deepEqual([c.competitors, c.lab_tests, c.notes, c.value_drivers], [[], [], [], []]);
  assert.equal(c.url, '');
  assert.equal(c.name_en, '');
  assert.ok(c.docs.every((d) => d.audience === 'customer'));
  assert.ok(!/intranet\.example\.com/.test(c.how_to));
  assert.match(c.how_to, /\[link interno omitido\]/);
  assert.equal(c.redactions, 1);
  const wf = S.caseForAudience(S.displayFields(w.lib(ID.WILDFIRE)), 'cliente');
  assert.match(wf.objectives.join(' '), /docs\.paloaltonetworks\.com/, 'docs públicas ficam');
  assert.deepEqual(S.caseForAudience(f, 'interno').how_to, f.how_to);
});

test('relatório de resultados interno: manchete, re-teste, tentativas, escopo, causa, observações e tudo interno', () => {
  const s = scenario();
  const m = s.model('resultados', 'interno');
  assert.equal(m.titulo, 'Relatório de resultados');
  assert.equal(m.marca, 'USO INTERNO — Palo Alto Networks');
  assert.equal(m.headline.obrigatorios, 1);
  assert.equal(m.headline.obrigatorios_atendidos, 1);
  assert.equal(m.criterios[0].veredito, 'met');
  assert.equal(m.criterios[1].veredito, 'pending', 'caso bloqueado deixa o critério pendente');
  assert.equal(m.casos.length, 3, 'removido não entra na lista de casos');
  const wf = m.casos.find((c) => c.exec_id === s.wfDone.exec_id);
  assert.match(wf.reteste, /tentativa 2 em 28\/09\/2026 \(primeiro resultado: Reprovado\)/);
  assert.equal(wf.tentativas.length, 2);
  assert.equal(wf.causa, 'Configuração');
  assert.equal(wf.referencia, 'TAC-1');
  assert.equal(wf.observacoes, 'Concorrente A demorou 20 min');
  assert.equal(wf.evidencias.length, 2);
  assert.ok(wf.competitors.length > 0);
  assert.ok(wf.url.startsWith('https://pov-companion.example.com/'));
  assert.equal(wf.aceite.mark, 'ok');
  assert.ok(wf.metricas.every((x) => x.valor === '2 min'));
  assert.deepEqual(m.escopo.incluidos.map((x) => x.motivo), ['Pedido do cliente']);
  assert.deepEqual(m.escopo.removidos.map((x) => x.motivo), ['Filial fora do escopo']);
  assert.equal(m.pov.oportunidade, 'OPP-123 (SFDC)');
  assert.equal(m.pendencias.length, 1);
  assert.equal(m.pendencias[0].atrasada, true);
  assert.deepEqual(m.vazamentos, [], 'versão interna não verifica vazamento');
  assert.equal(m.gerado.data, '28/09/2026 09:00', 'data no fuso de Brasília (fmt padrão -03:00)');
  assert.equal(m.detalhe, true);
});

test('relatório de resultados para o cliente: sem campos internos, evidências marcadas, links internos trocados e vazamentos listados', () => {
  const s = scenario();
  const m = s.model('resultados', 'cliente');
  assert.equal(m.marca, 'Preparado para Banco Exemplo · Palo Alto Networks · Confidencial');
  assert.equal(m.pov.oportunidade, '');
  assert.equal(m.pov.observacoes, '');
  const wf = m.casos.find((c) => c.exec_id === s.wfDone.exec_id);
  assert.deepEqual(wf.evidencias.map((e) => e.label), ['Print do veredito'], 'só evidências marcadas para o cliente');
  assert.equal(wf.evidencias_internas, 1);
  assert.equal(wf.observacoes, '');
  assert.equal(wf.causa, '');
  assert.deepEqual(wf.tentativas, []);
  assert.match(wf.reteste, /tentativa 2/, 're-teste aparece para o cliente');
  assert.deepEqual([wf.competitors, wf.notes, wf.value_drivers], [[], [], []]);
  assert.equal(wf.url, '');
  assert.equal(wf.lab, '');
  assert.match(wf.resultado_obtido, /\[link interno omitido\]/);
  assert.ok(m.redacoes >= 1);
  assert.ok(m.vazamentos.some((v) => v.tipo === 'link'));
  assert.deepEqual(m.avisos_rastreabilidade, { criterios_sem_casos: [], casos_sem_criterio: [] });
});

test('leakCheck encontra concorrente, e-mail e palavras internas em texto livre', () => {
  const s = scenario();
  const m = s.model('resultados', 'cliente');
  m.pov.resumo_executivo = 'Ganhamos do Concorrente A. Falar com joao@example.com. Uso interno.';
  const hits = S.leakCheck(m, ['Concorrente A']);
  const tipos = hits.filter((h) => h.onde === 'Resumo executivo').map((h) => h.tipo).sort();
  assert.deepEqual(tipos, ['concorrente', 'e-mail', 'palavra']);
  m.pov.resumo_executivo = 'Critérios atendidos.';
  assert.equal(S.leakCheck(m, ['Concorrente A']).filter((h) => h.onde === 'Resumo executivo').length, 0);
});

test('plano de testes: sem resultados; cliente compacto por padrão; agenda e pré-requisitos', () => {
  const s = scenario();
  const pi = s.model('plano', 'interno');
  assert.equal(pi.titulo, 'Plano de testes');
  assert.equal(pi.detalhe, true);
  assert.ok(pi.casos.every((c) => c.resultado_obtido === '' && c.evidencias.length === 0 && c.executado_por === ''));
  assert.ok(pi.casos.every((c) => c.steps.every((x) => x.header || x.mark === null)), 'sem marcações no plano');
  assert.deepEqual(pi.escopo, { incluidos: [], removidos: [] });
  assert.equal(pi.pov.resumo_executivo, '');
  assert.equal(pi.agenda.length, 1);
  assert.equal(pi.agenda[0].data, '02/10/2026');
  const pc = s.model('plano', 'cliente');
  assert.equal(pc.detalhe, false, 'plano do cliente é compacto por padrão');
  assert.equal(s.model('plano', 'cliente', { detalhe: true }).detalhe, true);
});

test('status da PoV: sem detalhamento, com pendências abertas e próximas execuções', () => {
  const s = scenario();
  const st = s.model('status', 'interno');
  assert.equal(st.titulo, 'Status da PoV');
  assert.equal(st.detalhe, false);
  assert.equal(st.pendencias.length, 1);
  assert.equal(st.agenda.length, 1, 'bloqueado com data prevista entra nas próximas execuções');
});

test('reportFileBaseName e CSV (BOM, aspas, anti-fórmula, colunas por audiência)', () => {
  assert.equal(S.reportFileBaseName('Banco Exemplo S/A', 'plano', 'cliente', '2026-09-28_0930'), 'pov-runner_banco-exemplo-s-a_plano_cliente_2026-09-28_0930');
  assert.equal(S.reportFileBaseName('', 'status', 'interno', 'x'), 'pov-runner_sem-cliente_status_interno_x');
  const s = scenario();
  const mi = s.model('resultados', 'interno');
  mi.casos[0].resultado_obtido = '=HYPERLINK("http://x")';
  mi.casos[0].name = 'Aspas "duplas"; e ponto e vírgula';
  const csv = S.reportToCsv(mi);
  assert.equal(csv.charCodeAt(0), 0xFEFF);
  const lines = csv.trim().split('\r\n');
  assert.equal(lines.length, 4);
  assert.match(lines[0], /Observações internas/);
  assert.ok(csv.includes('"\'=HYPERLINK(""http://x"")"'), 'fórmula neutralizada e aspas escapadas');
  assert.ok(csv.includes('"Aspas ""duplas""; e ponto e vírgula"'));
  const cc = S.reportToCsv(s.model('resultados', 'cliente'));
  assert.ok(!/Observações internas|Link POV Companion|Causa/.test(cc.split('\r\n')[0]));
});

test('pré-requisitos passam pelo filtro de audiência e pela verificação; sem detalhamento só o que aparece é verificado', () => {
  const s = scenario();
  const wfRow = s.w.idx[ID.WILDFIRE];
  const f = S.displayFields(Object.assign(clone(wfRow), { prerequisites: [{ id: 'p', name: 'Lab em https://intranet.example.com/lab', description: 'ver https://intranet.example.com/x' }] }));
  const c = S.caseForAudience(f, 'cliente');
  assert.equal(c.prerequisites[0].name, 'Lab em [link interno omitido]');
  assert.equal(c.prerequisites[0].description, 'ver [link interno omitido]');
  assert.equal(c.redactions, 2);
  const m = s.model('resultados', 'cliente');
  m.casos[0].prereqs = [{ text: 'Conta de teste do Concorrente A', description: '', obs: '' }];
  assert.ok(S.leakCheck(m, ['Concorrente A']).some((h) => /pré-requisito/.test(h.onde)));
  const compact = s.model('plano', 'cliente');
  assert.equal(compact.detalhe, false);
  compact.casos[0].steps = [{ text: 'Comparar com o Concorrente A', header: false }];
  assert.equal(S.leakCheck(compact, ['Concorrente A']).filter((h) => h.tipo === 'concorrente').length, 0, 'passo não aparece no plano compacto');
});
