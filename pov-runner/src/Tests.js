/**
 * Tests.js — testes de integração no Apps Script, rodados de dentro do editor (ou pelo menu
 * "PoV Runner › Rodar testes de integração") numa PLANILHA DE FIXTURE, nunca na de produção.
 *
 * Pré-requisito (uma vez): numa cópia da planilha (ou planilha nova com este script), na aba
 * Config, grave a chave `ambiente` = `fixture`. Os testes importam a biblioteca de demonstração
 * (sintética, embutida em DemoBundle.js) — não precisam de arquivo no Drive.
 *
 * As regras puras são as mesmas testadas em Node (tests/*.test.js); aqui o que interessa é o
 * caminho real: abas → importação → PoV → critérios → plano → aceite → execução → relatório no Drive → PDF.
 */

var failures_ = [];
function assert_(cond, msg) { if (!cond) failures_.push(msg); }
function expectError_(fn, re, msg) {
  try { fn(); failures_.push(msg + ' (deveria ter falhado)'); } catch (e) { if (!re.test(e.message)) failures_.push(msg + ' (mensagem: ' + e.message + ')'); }
}

function runAllTests() {
  var user = guard_('admin');
  failures_ = [];
  ensureSheets_();
  var cfg = getConfigAll_();
  if (cfg.ambiente !== 'fixture') throw new Error('Recusado: esta planilha não está marcada como fixture (Config: ambiente = fixture).');
  [SHEETS.POVS, SHEETS.CRITERIOS, SHEETS.CASOS_PROPRIOS, SHEETS.EXECUCOES, SHEETS.TENTATIVAS, SHEETS.PENDENCIAS, SHEETS.HISTORICO, SHEETS.RELATORIOS, SHEETS.LIBRARY]
    .forEach(function (n) { writeTable_(n, []); });
  setConfig_('library_is_demo', 'true');
  user.visibilidade = 'equipe';

  // 1) importação da demo, duas vezes (idempotência)
  var r1 = importDemoBundle_();
  var shared = DEMO_BUNDLE.test_cases.filter(function (c) { return c.published !== false && (!c.visibility || c.visibility === 'shared'); }).length;
  assert_(r1.total_novo === shared, 'import: esperava ' + shared + ' casos compartilhados, veio ' + r1.total_novo);
  assert_(r1.excluidos.length === DEMO_BUNDLE.test_cases.length - shared, 'import: casos não publicados/privados ficam de fora');
  var r2 = importDemoBundle_();
  assert_(r2.novos.length === 0 && r2.alterados.length === 0 && r2.removidos.length === 0, 'import: segunda importação sem diferenças');
  var lib = readTable_(SHEETS.LIBRARY);
  assert_(lib.length === shared, 'Library: ' + shared + ' linhas, veio ' + lib.length);
  assert_(Array.isArray(lib[0].objectives) && typeof lib[0].tested === 'boolean' && typeof lib[0].version === 'number', 'Library: tipos voltam convertidos');
  assert_(/^\d{4}-\d{2}-\d{2}T/.test(lib[0].updated_at), 'Library: datas ISO preservadas, veio ' + lib[0].updated_at);
  var dash = lib.filter(function (r) { return /^- /.test(r.expected_outcome); });
  assert_(dash.length >= 1, 'Library: texto que começa com "- " volta igual (sem prefixo anti-fórmula)');
  assert_(readTable_(SHEETS.TAXONOMIA).some(function (n) { return n.status === 'embedded-only' && n.parent_inferido; }), 'Taxonomia: nós embutidos com pai inferido');
  assert_(readTable_(SHEETS.AMBIENTES).length === DEMO_BUNDLE.environments.length, 'Ambientes gravados');

  // 2) PoV: criação, edição e conflito
  var pov = savePov_({ cliente: 'Cliente Fixture', titulo: 'PoV de integração', inicio: '2026-10-01', fim_previsto: '2026-10-15', objetivo: '=não vira fórmula', equipe: user.email }, user);
  assert_(pov.status === 'planning', 'PoV: nasce em planejamento');
  var pov2 = savePov_({ pov_id: pov.pov_id, ambiente: 'Lab', expected_atualizado_em: pov.atualizado_em }, user);
  assert_(pov2.ambiente === 'Lab', 'PoV: edição grava');
  expectError_(function () { savePov_({ pov_id: pov.pov_id, ambiente: 'X', expected_atualizado_em: pov.atualizado_em }, user); }, /alterad/, 'PoV: conflito');
  assert_(findPov_(pov.pov_id).objetivo === '=não vira fórmula', 'PoV: texto com "=" volta igual');

  // 3) critérios e plano
  var c1 = saveCriterion_(pov.pov_id, { texto: 'Bloquear malware desconhecido', peso: 'obrigatorio' }, user);
  var ids = lib.filter(function (r) { return !r.traducao_pendente; }).slice(0, 5).map(function (r) { return r.id; });
  var a1 = addToPlan_(pov.pov_id, ids, [], '', user);
  assert_(a1.added === 5, 'plano: 5 incluídos, veio ' + a1.added);
  assert_(addToPlan_(pov.pov_id, ids, [], '', user).skipped === 5, 'plano: repetidos são ignorados');
  var view = getPovView_(pov.pov_id, user);
  var first = view.groups[0].items[0];
  removeFromPlan_(pov.pov_id, [first.exec_id], '', user);
  assert_(getPovView_(pov.pov_id, user).progress.total === 4, 'plano: remoção desativa');
  assert_(addToPlan_(pov.pov_id, [first.test_case_id], [], '', user).reactivated === 1, 'plano: reinclusão reativa a mesma linha');
  saveCustomCase_(pov.pov_id, { nome: 'Integração com o SIEM do cliente', objetivos: ['Enviar logs', 'Ver alerta no SIEM'], resultado_esperado: 'Alerta aparece em 5 min' }, user);
  assert_(getPovView_(pov.pov_id, user).progress.total === 6, 'caso próprio entra no plano');

  // 4) aceite do plano → escopo exige motivo
  transitionPov_(pov.pov_id, 'aceitar_plano', { por: 'Maria (CISO)' }, user);
  assert_(findPov_(pov.pov_id).status === 'running', 'aceite do plano: PoV em execução');
  expectError_(function () { addToPlan_(pov.pov_id, [lib[10].id], [], '', user); }, /motivo/, 'escopo: inclusão depois do aceite exige motivo');

  // 5) execução: checklist, bloqueio com pendência, conflito, link inválido, re-teste
  view = getPovView_(pov.pov_id, user);
  var item = view.groups[0].items[0];
  bulkUpdate_(pov.pov_id, [item.exec_id], { criterio_add: c1.crit_id }, {}, user);
  item = getPovView_(pov.pov_id, user).groups[0].items[0];
  expectError_(function () { saveExecution_({ exec_id: item.exec_id, status: 'blocked' }, user); }, /pendência/, 'bloqueado exige pendência');
  var b = saveExecution_({ exec_id: item.exec_id, expected_atualizado_em: item.atualizado_em, status: 'blocked',
    nova_pendencia: { descricao: 'Liberar porta 443 no firewall do cliente', responsavel_tipo: 'cliente', prazo: '2026-10-05' } }, user);
  assert_(!b.conflict && b.row.status === 'blocked', 'bloqueado com pendência nova');
  var fail = saveExecution_({ exec_id: item.exec_id, expected_atualizado_em: b.row.atualizado_em, status: 'fail', causa: 'configuracao' }, user);
  assert_(fail.row.tentativas === 1 && fail.row.primeiro_status === 'fail', 'primeira tentativa registrada');
  var marks = fail.row.checklist.map(function (c) { return { k: c.k, ok: c.t === 'prereq' ? true : true, obs: '' }; });
  var pass = saveExecution_({ exec_id: item.exec_id, expected_atualizado_em: fail.row.atualizado_em, status: 'pass', checklist: marks, resultado_obtido: 'Bloqueou como esperado.',
    evidencias: [{ label: 'print', url: 'https://example.com/print.png', cliente: true }] }, user);
  assert_(pass.row.tentativas === 2 && !!pass.row.concluido_em, 're-teste: segunda tentativa');
  assert_(readTable_(SHEETS.TENTATIVAS).filter(function (t) { return t.exec_id === item.exec_id; }).length === 2, 'Tentativas: 2 registros');
  var conflict = saveExecution_({ exec_id: item.exec_id, expected_atualizado_em: item.atualizado_em, status: 'fail' }, user);
  assert_(conflict.conflict === true && conflict.server, 'execução: conflito devolve a versão do servidor');
  expectError_(function () { saveExecution_({ exec_id: item.exec_id, evidencias: [{ label: 'x', url: 'javascript:alert(1)' }] }, user); }, /link inválido/, 'execução: link inválido');
  var pv = getPovView_(pov.pov_id, user);
  assert_(pv.progress.aprovados_apos_reteste === 1, 'progresso: aprovado após re-teste');
  assert_(pv.criterios.list[0].veredito === 'met', 'critério atendido pelo caso aprovado');

  // 6) documentos (HTML + PDF), vazamento, CSV
  var prev = previewReport_(pov.pov_id, { tipo: 'resultados', publico: 'cliente' }, user);
  assert_(prev.html.indexOf('Relatório de resultados') >= 0 && prev.html.indexOf('USO INTERNO') < 0, 'relatório do cliente sem marca interna');
  var saved = saveReport_(pov.pov_id, { tipo: 'resultados', publico: 'interno' }, user);
  assert_(!!saved.html_url, 'relatório: HTML salvo');
  assert_(!!saved.pdf_url, 'relatório: PDF salvo (' + (saved.pdf_error || 'ok') + ')');
  assert_(listReportsCount_(pov.pov_id) === 1, 'Relatorios: registro gravado');
  var csv = exportCsv_(pov.pov_id, { publico: 'cliente' }, user);
  assert_(csv.csv.indexOf('Observações internas') < 0, 'CSV do cliente sem colunas internas');

  // 7) encerrar trava; reabrir destrava
  transitionPov_(pov.pov_id, 'encerrar', { resumo_executivo: 'Critérios atendidos.', desfecho: 'tech_win', aceite_por: 'Maria (CISO)' }, user);
  expectError_(function () { saveExecution_({ exec_id: item.exec_id, status: 'fail' }, user); }, /Reabra/, 'PoV concluída trava execuções');
  transitionPov_(pov.pov_id, 'reabrir', { motivo: 'Cliente pediu um teste extra' }, user);
  assert_(findPov_(pov.pov_id).status === 'running', 'reabrir volta para em execução');

  // 8) catálogo com cache
  invalidateCatalogCache_();
  var cat = getCatalog_();
  assert_(cat.cases.length === shared, 'catálogo: ' + shared + ' casos');
  assert_(JSON.stringify(getCatalog_().meta) === JSON.stringify(cat.meta), 'catálogo: cache devolve o mesmo');

  var msg = failures_.length ? 'FALHAS (' + failures_.length + '):\n- ' + failures_.join('\n- ') : 'OK — todos os testes de integração passaram. Relatório: ' + (saved.pdf_url || saved.html_url);
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { /* sem UI quando rodado pelo editor */ }
  return msg;
}

function listReportsCount_(povId) {
  return readTable_(SHEETS.RELATORIOS).filter(function (r) { return r.pov_id === povId; }).length;
}

/**
 * Spike do PDF: gera o relatório de resultados (versão do cliente) da primeira PoV e salva no Drive.
 * Abra o arquivo e confira tabelas, ✓/✗, quebras de página, acentos e o tempo de geração no log.
 * Se algo falhar, a rota é "Abrir em nova aba → Imprimir → Salvar como PDF" (a tela oferece isso).
 */
function spikeReportPdf() {
  var user = guard_('admin');
  var povs = readTable_(SHEETS.POVS);
  if (!povs.length) throw new Error('Crie uma PoV (ou rode runAllTests numa planilha de fixture) antes do spike.');
  var t0 = new Date().getTime();
  var res = saveReport_(povs[0].pov_id, { tipo: 'resultados', publico: 'cliente', confirmarVazamentos: true }, user);
  var msg = (res.pdf_url ? 'PDF salvo: ' + res.pdf_url : 'PDF falhou: ' + res.pdf_error) + ' (' + (new Date().getTime() - t0) + ' ms)';
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { /* editor */ }
  return msg;
}
