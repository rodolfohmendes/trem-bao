/**
 * Testes estáticos da camada Apps Script: serialização das células (Sheets.js) e as regras de
 * segurança do web app (toda função pública é api*, doGet, include, onOpen, menu* ou teste; toda
 * api* começa por guard_; funções de menu/teste exigem administrador; nenhuma chamada a função
 * privada inexistente).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadSrc, SRC } = require('./harness');

const G = loadSrc(['Schema.js', 'Sheets.js']);
const FILES = fs.readdirSync(SRC).filter((f) => f.endsWith('.js'));
const SOURCES = Object.fromEntries(FILES.map((f) => [f, fs.readFileSync(path.join(SRC, f), 'utf8')]));

/** Funções de topo: {name, file, body}. Corpo = a linha (função de uma linha) ou até o "}" na coluna 0. */
function topLevelFunctions() {
  const out = [];
  for (const [file, src] of Object.entries(SOURCES)) {
    const re = /^function\s+([A-Za-z_$][\w$]*)\s*\(/gm;
    let m;
    while ((m = re.exec(src))) {
      const lineEnd = src.indexOf('\n', m.index);
      const line = src.slice(m.index, lineEnd < 0 ? undefined : lineEnd);
      const oneLiner = /\}\s*$/.test(line) && (line.match(/\{/g) || []).length === (line.match(/\}/g) || []).length;
      const end = oneLiner ? m.index + line.length : src.indexOf('\n}', m.index) + 2;
      out.push({ name: m[1], file, body: src.slice(m.index, end) });
    }
  }
  return out;
}
const FUNCS = topLevelFunctions();
const ALL_SRC = Object.values(SOURCES).join('\n');
const DEFINED = new Set([...ALL_SRC.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map((m) => m[1]));
const GAS = /\b(SpreadsheetApp|DriveApp|Session|Utilities|HtmlService|CacheService|LockService|PropertiesService|ScriptApp|MimeType|Logger)\./;
const PUBLIC_OK = /^(api[A-Z]\w*|doGet|include|onOpen|menu[A-Z]\w*|runAllTests|spikeReportPdf)$/;

test('Sheets: serialização anti-fórmula reversível, JSON, booleanos, números e limite por célula', () => {
  const def = G.SCHEMA.Execucoes;
  const ser = (col, v) => G.serializeValue_(def, col, v, 'Execucoes');
  const de = (col, v) => G.deserializeValue_(def, col, v);
  assert.equal(ser('resultado_obtido', '=HYPERLINK("x")'), "'=HYPERLINK(\"x\")");
  assert.equal(de('resultado_obtido', "'=HYPERLINK(\"x\")"), '=HYPERLINK("x")', 'se o Sheets devolver o apóstrofo, ele é removido');
  assert.equal(de('resultado_obtido', '=HYPERLINK("x")'), '=HYPERLINK("x")', 'se o Sheets engolir o apóstrofo, o texto já volta certo');
  ['+1', '-1', '@x', '- Logs'].forEach((s) => assert.equal(de('resultado_obtido', ser('resultado_obtido', s)), s));
  assert.equal(ser('checklist', [{ k: 'a', ok: true }]), '[{"k":"a","ok":true}]');
  assert.deepEqual(de('checklist', ''), []);
  assert.deepEqual(de('checklist', '{quebrado'), []);
  assert.equal(ser('ativo', true), 'TRUE');
  assert.equal(de('ativo', 'TRUE'), true);
  assert.equal(de('ativo', true), true);
  assert.equal(de('ativo', ''), false);
  assert.equal(de('ordem', '7'), 7);
  assert.equal(de('ordem', ''), 0);
  assert.equal(ser('resultado_obtido', null), '');
  assert.throws(() => ser('resultado_obtido', 'x'.repeat(50000)), /limite de 50000/);
  const headers = ['exec_id', 'coluna_manual', 'status'];
  assert.deepEqual(G.rowToValues_(def, headers, { exec_id: 'e1', status: 'pass', coluna_manual: 'x' }, 'Execucoes'), ['e1', '', 'pass'], 'grava pelo cabeçalho real');
});

test('segurança: toda função pública que alcança serviços do Apps Script (direta ou indiretamente) é uma porta conhecida', () => {
  // fecho transitivo: quem usa um serviço, ou chama alguém que usa, "toca dados"
  const touches = new Set(FUNCS.filter((f) => GAS.test(f.body)).map((f) => f.name));
  let grew = true;
  while (grew) {
    grew = false;
    FUNCS.forEach((f) => {
      if (touches.has(f.name)) return;
      const body = f.body.replace(/^function[^{]*\{/, '');
      if ([...touches].some((n) => new RegExp('\\b' + n.replace(/\$/g, '\\$') + '\\(').test(body))) { touches.add(f.name); grew = true; }
    });
  }
  assert.ok(touches.has('readTable_') && touches.has('apiBootstrap'), 'análise enxerga a camada de dados');
  const offenders = FUNCS.filter((f) => touches.has(f.name) && !f.name.endsWith('_') && !PUBLIC_OK.test(f.name)).map((f) => f.file + ':' + f.name);
  assert.deepEqual(offenders, [], 'funções que alcançam dados precisam terminar em "_" (o google.script.run não as chama)');
});

test('segurança: toda api* passa pelo guard_ antes de qualquer outra coisa (exceto garantir as abas)', () => {
  const apis = FUNCS.filter((f) => /^api[A-Z]/.test(f.name));
  assert.ok(apis.length >= 25, 'API completa: ' + apis.length);
  const bad = apis.filter((f) => {
    const stmts = f.body.replace(/^function[^{]*\{/, '').trim().split('\n').map((l) => l.trim()).filter(Boolean);
    const first = stmts[0] === 'ensureSheetsOnce_();' ? stmts[1] : stmts[0];
    return !/guard_\(/.test(first);
  }).map((f) => f.name);
  assert.deepEqual(bad, []);
  const adminOnly = ['apiUploadBundle', 'apiImportDryRun', 'apiImportConfirm', 'apiLoadDemo', 'apiSaveSettings'];
  adminOnly.forEach((n) => assert.match(FUNCS.find((f) => f.name === n).body, /guard_\('admin'\)/, n + ' exige administrador'));
  FUNCS.filter((f) => /^menu[A-Z]|^runAllTests$|^spikeReportPdf$/.test(f.name))
    .forEach((f) => assert.match(f.body, /guard_\('admin'\)/, f.name + ' exige administrador (o google.script.run alcança funções de menu)'));
});

test('segurança: web app sem ALLOWALL e sem chamadas a funções privadas inexistentes', () => {
  const all = ALL_SRC;
  assert.ok(!/XFrameOptionsMode\.ALLOWALL/.test(all), 'não permite embutir o app em qualquer site');
  const called = new Set([...all.matchAll(/\b([A-Za-z][\w$]*_)\(/g)].map((m) => m[1]));
  const missing = [...called].filter((n) => !DEFINED.has(n));
  assert.deepEqual(missing, []);
  const html = ['Index.html', 'relatorio.html'].map((f) => fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n');
  assert.ok(/include\('styles\.css'\)/.test(html) && /include\('app\.js'\)/.test(html) && /clientSharedCode\(\)/.test(html));
});

test('manifesto: V8, fuso de São Paulo, web app do domínio executando como o dono, escopos mínimos', () => {
  const m = JSON.parse(fs.readFileSync(path.join(SRC, 'appsscript.json'), 'utf8'));
  assert.equal(m.runtimeVersion, 'V8');
  assert.equal(m.timeZone, 'America/Sao_Paulo');
  assert.deepEqual(m.webapp, { executeAs: 'USER_DEPLOYING', access: 'DOMAIN' });
  assert.ok(m.oauthScopes.includes('https://www.googleapis.com/auth/userinfo.email'));
  assert.ok(m.oauthScopes.every((s) => /^https:\/\/www\.googleapis\.com\/auth\//.test(s)));
});
