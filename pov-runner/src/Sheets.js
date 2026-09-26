/**
 * Sheets.js — camada de acesso à planilha (única parte do app que fala com SpreadsheetApp),
 * mais Config, cache com chunking, lock, usuário e relógio. Não roda em Node.
 *
 * Tudo aqui termina em "_": o google.script.run não consegue chamar funções privadas, então nada
 * desta camada fica exposto ao navegador (a API pública é só o que está em Code.js).
 *
 * As gravações seguem o cabeçalho REAL da aba (linha 1), não a ordem do SCHEMA: se uma versão nova
 * do app acrescentar colunas, ensureSheets_() as adiciona no fim e as linhas antigas continuam
 * alinhadas. Todas as células são gravadas como texto puro ('@'), o que preserva datas ISO, JSON e
 * zeros à esquerda.
 */

var CELL_LIMIT = 50000;

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(name) {
  var sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('Aba não encontrada: ' + name + '. Use o menu "PoV Runner › Criar abas que faltam".');
  return sh;
}

/** Cria as abas que faltam, acrescenta colunas novas ao cabeçalho e protege (aviso) as de referência. */
function ensureSheets_() {
  var ss = ss_();
  Object.keys(SCHEMA).forEach(function (name) {
    var def = SCHEMA[name];
    var sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      sh.getRange(1, 1, 1, def.columns.length).setNumberFormat('@').setValues([def.columns]).setFontWeight('bold');
      sh.setFrozenRows(1);
    } else {
      var headers = headers_(sh);
      var missing = def.columns.filter(function (c) { return headers.indexOf(c) < 0; });
      if (missing.length) {
        sh.getRange(1, headers.length + 1, 1, missing.length).setNumberFormat('@').setValues([missing]).setFontWeight('bold');
      }
    }
    if (def.protected) {
      var already = sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).length > 0;
      if (!already) sh.protect().setDescription('Somente o PoV Runner escreve aqui (importação da biblioteca).').setWarningOnly(true);
    }
  });
  var def0 = ss.getSheetByName('Página1') || ss.getSheetByName('Sheet1') || ss.getSheetByName('Planilha1');
  if (def0 && def0.getLastRow() === 0 && ss.getSheets().length > Object.keys(SCHEMA).length) ss.deleteSheet(def0);
  SpreadsheetApp.flush();
}

/** Cabeçalho atual da aba (sem colunas vazias no fim). */
function headers_(sh) {
  var lastCol = sh.getLastColumn();
  if (lastCol < 1) return [];
  var row = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  while (row.length && row[row.length - 1] === '') row.pop();
  return row;
}

function serializeValue_(def, col, v, tableName) {
  if (v === undefined || v === null) return '';
  var out;
  if (def.json.indexOf(col) >= 0) out = JSON.stringify(v);
  else if (def.bool.indexOf(col) >= 0) return v === true || v === 'TRUE' || v === 'true' ? 'TRUE' : 'FALSE';
  else out = String(v);
  if (out.length > CELL_LIMIT - 10) {
    throw new Error('O campo "' + col + '" de ' + tableName + ' passou do limite de ' + CELL_LIMIT + ' caracteres por célula' +
      (def.key ? '' : '') + '. Encurte o texto.');
  }
  // Nunca vira fórmula: o apóstrofo é o prefixo de texto do Sheets (e é removido na leitura, se sobrar).
  if (/^[=+\-@]/.test(out) && def.json.indexOf(col) < 0) out = "'" + out;
  return out;
}

function deserializeValue_(def, col, v) {
  if (def.json.indexOf(col) >= 0) {
    if (v === '' || v === null || v === undefined) return [];
    try { return JSON.parse(v); } catch (e) { return []; }
  }
  if (def.bool.indexOf(col) >= 0) return v === true || v === 'TRUE' || v === 'true';
  if (def.num && def.num.indexOf(col) >= 0) {
    if (v === '' || v === null || v === undefined) return 0;
    var n = Number(v);
    return isNaN(n) ? 0 : n;
  }
  if (v instanceof Date) return v.toISOString();
  if (v === null || v === undefined) return '';
  var s = String(v);
  if (/^'[=+\-@]/.test(s)) s = s.slice(1);
  return s;
}

function rowToValues_(def, headers, obj, tableName) {
  return headers.map(function (h) {
    if (def.columns.indexOf(h) < 0) return ''; // coluna desconhecida (manual): não é do app
    try {
      return serializeValue_(def, h, obj[h], tableName);
    } catch (e) {
      throw new Error(e.message + ' (registro ' + (obj[def.key] || '?') + ')');
    }
  });
}

function readTable_(name) {
  var def = SCHEMA[name];
  var sh = sheet_(name);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var headers = headers_(sh);
  var data = sh.getRange(2, 1, last - 1, headers.length).getValues();
  var keyIdx = headers.indexOf(def.key);
  var rows = [];
  for (var i = 0; i < data.length; i++) {
    if (keyIdx >= 0 && (data[i][keyIdx] === '' || data[i][keyIdx] === null)) continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      if (def.columns.indexOf(headers[j]) < 0) continue;
      obj[headers[j]] = deserializeValue_(def, headers[j], data[i][j]);
    }
    def.columns.forEach(function (c) { if (!(c in obj)) obj[c] = deserializeValue_(def, c, ''); });
    rows.push(obj);
  }
  return rows;
}

/** Serializa uma tabela inteira (confere o limite por célula) sem tocar na planilha. */
function prepareTable_(name, rows) {
  var def = SCHEMA[name];
  return [def.columns].concat((rows || []).map(function (r) { return rowToValues_(def, def.columns, r, name); }));
}

/** Apaga e reescreve uma aba de referência com valores já preparados (usado só pela importação). */
function writePrepared_(name, values) {
  var def = SCHEMA[name];
  var sh = sheet_(name);
  sh.clearContents();
  var range = sh.getRange(1, 1, values.length, def.columns.length);
  range.setNumberFormat('@');
  range.setValues(values);
  sh.getRange(1, 1, 1, def.columns.length).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function writeTable_(name, rows) {
  writePrepared_(name, prepareTable_(name, rows));
}

function appendRows_(name, objs) {
  if (!objs || !objs.length) return;
  var def = SCHEMA[name];
  var sh = sheet_(name);
  var headers = headers_(sh);
  var values = objs.map(function (o) { return rowToValues_(def, headers, o, name); });
  var range = sh.getRange(sh.getLastRow() + 1, 1, values.length, headers.length);
  range.setNumberFormat('@');
  range.setValues(values);
}

/**
 * Atualiza linhas existentes pela chave: uma leitura da coluna-chave e uma escrita por trecho de
 * linhas consecutivas (as linhas que não mudaram nunca são reescritas).
 */
function updateRowsByKey_(name, objs) {
  if (!objs || !objs.length) return;
  var def = SCHEMA[name];
  var sh = sheet_(name);
  var headers = headers_(sh);
  var keyCol = headers.indexOf(def.key) + 1;
  if (keyCol < 1) throw new Error('Coluna-chave ' + def.key + ' ausente em ' + name + '.');
  var last = sh.getLastRow();
  var keys = last >= 2 ? sh.getRange(2, keyCol, last - 1, 1).getValues() : [];
  var rowOf = {};
  for (var i = 0; i < keys.length; i++) rowOf[String(keys[i][0])] = i + 2;
  var items = objs.map(function (o) {
    var r = rowOf[String(o[def.key])];
    if (!r) throw new Error('Registro não encontrado em ' + name + ': ' + o[def.key]);
    return { row: r, values: rowToValues_(def, headers, o, name) };
  }).sort(function (a, b) { return a.row - b.row; });
  var start = 0;
  for (var k = 1; k <= items.length; k++) {
    if (k === items.length || items[k].row !== items[k - 1].row + 1 || items[k].row === items[k - 1].row) {
      var run = items.slice(start, k);
      var range = sh.getRange(run[0].row, 1, run.length, headers.length);
      range.setNumberFormat('@');
      range.setValues(run.map(function (x) { return x.values; }));
      start = k;
    }
  }
}

// ---------------------------------------------------------------- Config (chave/valor)

function getConfigAll_() {
  var out = {};
  readTable_(SHEETS.CONFIG).forEach(function (r) { out[r.chave] = r.valor; });
  return out;
}

function getConfig_(key) {
  return getConfigAll_()[key] || '';
}

function setConfigMany_(obj) {
  var sh = sheet_(SHEETS.CONFIG);
  var last = sh.getLastRow();
  var keys = last >= 2 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
  Object.keys(obj).forEach(function (key) {
    var value = obj[key] === undefined || obj[key] === null ? '' : String(obj[key]);
    if (/^[=+\-@]/.test(value)) value = "'" + value;
    var i = keys.indexOf(key);
    if (i >= 0) {
      sh.getRange(i + 2, 2).setNumberFormat('@').setValue(value);
    } else {
      sh.getRange(last + 1, 1, 1, 2).setNumberFormat('@').setValues([[key, value]]);
      keys.push(key);
      last++;
    }
  });
}

function setConfig_(key, value) {
  var o = {};
  o[key] = value;
  setConfigMany_(o);
}

// ---------------------------------------------------------------- Cache com chunking (limite de 100 KB por valor)

var CACHE_CHUNK = 90000;

function cachePutBig_(key, str, ttlSeconds) {
  var cache = CacheService.getScriptCache();
  var n = Math.ceil(str.length / CACHE_CHUNK);
  var entries = {};
  for (var i = 0; i < n; i++) entries[key + '.' + i] = str.substr(i * CACHE_CHUNK, CACHE_CHUNK);
  entries[key + '.meta'] = String(n);
  try { cache.putAll(entries, ttlSeconds || 600); } catch (e) { /* cache é otimização: sem ele o app só fica mais lento */ }
}

function cacheGetBig_(key) {
  var cache = CacheService.getScriptCache();
  var meta = cache.get(key + '.meta');
  if (!meta) return null;
  var n = Number(meta);
  var keys = [];
  for (var i = 0; i < n; i++) keys.push(key + '.' + i);
  var parts = cache.getAll(keys);
  var out = '';
  for (var j = 0; j < n; j++) {
    if (!parts[key + '.' + j]) return null;
    out += parts[key + '.' + j];
  }
  return out;
}

function cacheRemoveBig_(key) {
  var cache = CacheService.getScriptCache();
  var meta = cache.get(key + '.meta');
  var keys = [key + '.meta'];
  if (meta) for (var i = 0; i < Number(meta); i++) keys.push(key + '.' + i);
  cache.removeAll(keys);
}

// ---------------------------------------------------------------- lock, sessão e relógio

/**
 * Executa fn sob o lock do script (todas as gravações do app passam por aqui). O flush antes de
 * soltar o lock garante que o próximo a entrar leia o `atualizado_em` já gravado.
 */
function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Outra pessoa está gravando agora. Tente de novo em alguns segundos.');
  try {
    var out = fn();
    SpreadsheetApp.flush();
    return out;
  } finally {
    lock.releaseLock();
  }
}

/** E-mail de quem está usando o app ('' quando o Google não informa — ver guard_). */
function currentUserEmail_() {
  var email = '';
  try { email = Session.getActiveUser().getEmail(); } catch (e) { email = ''; }
  return String(email || '').toLowerCase();
}

/** E-mail da conta que publicou o web app (dona dos dados). */
function ownerEmail_() {
  var email = '';
  try { email = Session.getEffectiveUser().getEmail(); } catch (e) { email = ''; }
  return String(email || '').toLowerCase();
}

function nowIso_() {
  return new Date().toISOString();
}

/** Formatador de datas no fuso do script (mesma assinatura de fixedOffsetFormatter). */
function fmt_() {
  var tz = Session.getScriptTimeZone() || 'America/Sao_Paulo';
  var patterns = { date: 'dd/MM/yyyy', datetime: 'dd/MM/yyyy HH:mm', stamp: 'yyyy-MM-dd_HHmm', isodate: 'yyyy-MM-dd' };
  return function (iso, kind) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return Utilities.formatDate(d, tz, patterns[kind] || patterns.datetime);
  };
}
