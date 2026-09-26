/**
 * harness.js — carrega os arquivos .js do Apps Script (scripts globais, sem módulos) num escopo
 * único do Node e devolve as funções/constantes de topo. As partes que usam serviços do Apps
 * Script (SpreadsheetApp, DriveApp…) existem no escopo mas não são chamadas pelos testes.
 */
const fs = require('node:fs');
const path = require('node:path');

const SRC = path.join(__dirname, '..', 'src');
const PURE = ['Schema.js', 'Labels.js', 'DemoBundle.js', 'Import.js', 'Catalog.js', 'Povs.js', 'Criterios.js', 'Pendencias.js', 'CasosProprios.js', 'Plano.js', 'Execucao.js', 'Relatorio.js'];

function loadSrc(files = PURE) {
  const code = files.map((f) => fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n;\n');
  const names = [...new Set([...code.matchAll(/^(?:function|var|const|let)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]))];
  // eslint-disable-next-line no-new-func
  return new Function(code + '\nreturn {' + names.join(',') + '};')();
}

/** Cópia profunda: os testes nunca compartilham estado mutável entre casos. */
function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

/** Gerador de ids previsível para os testes. */
function seqIds(prefix = 'id') {
  let n = 0;
  return () => `${prefix}-${++n}`;
}

module.exports = { loadSrc, clone, seqIds, PURE, SRC };
