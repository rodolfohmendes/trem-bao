/**
 * Labels.js — rótulos em português para os estados (os valores internos ficam em inglês nas abas)
 * e utilidades de texto usadas pelas regras puras, pela tela e pelo template.
 */
var LIFECYCLE_PT = {
  'draft': 'Rascunho',
  'capability-review': 'Revisão de capacidade',
  'test-review': 'Em revisão de teste',
  'awaiting-fix': 'Aguardando correção',
  'changes-requested': 'Alterações solicitadas',
  'reviewed': 'Revisado',
  'tested': 'Testado',
  'deprecated': 'Descontinuado',
};

/** Resultado do teste de laboratório da biblioteca (testing.latest_signoff.result). */
var LAB_RESULT_PT = {
  'pass': 'Aprovado',
  'fail': 'Reprovado',
};

var EXEC_STATUS_PT = {
  'not_started': 'Não iniciado',
  'in_progress': 'Em andamento',
  'pass': 'Aprovado',
  'partial': 'Parcial',
  'fail': 'Reprovado',
  'blocked': 'Bloqueado',
  'not_applicable': 'Não aplicável',
};

var POV_STATUS_PT = {
  'planning': 'Planejamento',
  'running': 'Em execução',
  'done': 'Concluída',
  'cancelled': 'Cancelada',
};

var PRIORITY_PT = {
  'high': 'Alta',
  'medium': 'Média',
  'low': 'Baixa',
};

var STANCE_PT = {
  'advantage': 'Vantagem',
  'parity': 'Paridade',
  'disadvantage': 'Desvantagem',
  'unknown': 'Indefinido',
};

var CHECK_TYPE_PT = {
  'prereq': 'Pré-requisito',
  'step': 'Passo',
  'out': 'Resultado esperado',
  'met': 'Métrica',
};

/** Rótulo da marcação de um item do checklist, por tipo. */
var CHECK_MARK_PT = {
  prereq: { 'true': 'Atendido', 'false': 'Não atendido', 'na': 'Não se aplica', 'null': 'Não verificado' },
  step: { 'true': 'Feito', 'false': 'Não feito', 'na': 'Não se aplica', 'null': 'Não avaliado' },
  out: { 'true': 'Atendido', 'false': 'Não atendido', 'na': 'Não se aplica', 'null': 'Não avaliado' },
  met: { 'true': 'Dentro do esperado', 'false': 'Fora do esperado', 'na': 'Não se aplica', 'null': 'Não avaliado' },
};

var VERDICT_PT = {
  'met': 'Atendido',
  'partial': 'Parcialmente atendido',
  'not_met': 'Não atendido',
  'pending': 'Pendente',
  'no_cases': 'Sem casos vinculados',
};

var WEIGHT_PT = { 'obrigatorio': 'Obrigatório', 'desejavel': 'Desejável' };

var CAUSE_PT = {
  'produto': 'Produto',
  'configuracao': 'Configuração',
  'ambiente_cliente': 'Ambiente do cliente',
  'fora_escopo': 'Fora do escopo',
  'aguardando_fix': 'Aguardando correção',
  'outro': 'Outro',
};

var PENDING_OWNER_PT = { 'cliente': 'Cliente', 'panw': 'Palo Alto Networks', 'parceiro': 'Parceiro' };

var OUTCOME_PT = { 'tech_win': 'Vitória técnica', 'tech_loss': 'Derrota técnica', 'no_decision': 'Sem decisão', 'open': 'Em aberto' };

function lifecycleLabel(v) { return LIFECYCLE_PT[v] || v || ''; }
function labResultLabel(v) { return LAB_RESULT_PT[v] || v || ''; }
function execStatusLabel(v) { return EXEC_STATUS_PT[v] || v || ''; }
function povStatusLabel(v) { return POV_STATUS_PT[v] || v || ''; }
function priorityLabel(v) { return PRIORITY_PT[v] || v || ''; }
function stanceLabel(v) { return STANCE_PT[v] || v || ''; }
function verdictLabel(v) { return VERDICT_PT[v] || v || ''; }
function weightLabel(v) { return WEIGHT_PT[v] || v || ''; }
function causeLabel(v) { return CAUSE_PT[v] || v || ''; }
function pendingOwnerLabel(v) { return PENDING_OWNER_PT[v] || v || ''; }
function outcomeLabel(v) { return OUTCOME_PT[v] || v || ''; }
function checkMarkLabel(t, ok) { var m = CHECK_MARK_PT[t] || CHECK_MARK_PT.step; return m[String(ok === undefined ? null : ok)] || ''; }

/**
 * Formatador de datas ISO com deslocamento fixo em minutos (ex.: -180 para America/Sao_Paulo).
 * Formatos: 'date' dd/MM/aaaa · 'datetime' dd/MM/aaaa HH:mm · 'stamp' aaaa-MM-dd_HHmm · 'isodate' aaaa-MM-dd.
 * No Apps Script o formatador injetado usa Utilities.formatDate no fuso do script; este é o de Node e do navegador.
 */
function fixedOffsetFormatter(offsetMinutes) {
  function p(n) { return (n < 10 ? '0' : '') + n; }
  return function (iso, kind) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var t = new Date(d.getTime() + (offsetMinutes || 0) * 60000);
    var Y = t.getUTCFullYear(), M = p(t.getUTCMonth() + 1), D = p(t.getUTCDate()), h = p(t.getUTCHours()), m = p(t.getUTCMinutes());
    if (kind === 'date') return D + '/' + M + '/' + Y;
    if (kind === 'stamp') return Y + '-' + M + '-' + D + '_' + h + m;
    if (kind === 'isodate') return Y + '-' + M + '-' + D;
    return D + '/' + M + '/' + Y + ' ' + h + ':' + m;
  };
}

/** Ordem de prioridade para ordenação: alta primeiro. */
function priorityRank(v) {
  var order = { high: 0, medium: 1, low: 2 };
  return v in order ? order[v] : 3;
}

/** Texto sem acentos, minúsculo, só [a-z0-9-] — para nomes de arquivo e ids locais. */
function slugify(s, fallback) {
  var out = String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/g, '');
  return out || (fallback || '');
}

/** Normaliza texto para busca: minúsculo e sem acentos. */
function foldText(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Data de calendário 'AAAA-MM-DD' válida. */
function isIsoDate(s) {
  var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

/** 'AAAA-MM-DDTHH:MM…' → 'AAAA-MM-DD HH:MM' (vazio se não for data). */
function shortDateTime(iso) {
  var s = String(iso || '');
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s) ? s.slice(0, 10) + ' ' + s.slice(11, 16) : s.slice(0, 10);
}

/** 'AAAA-MM-DD…' → 'DD/MM/AAAA' (vazio se não for data). */
function dateBr(iso) {
  var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[3] + '/' + m[2] + '/' + m[1] : '';
}

/** Só aceita links http(s) — docs da biblioteca e evidências nunca viram javascript: ou data:. */
function safeUrl(u) {
  var s = String(u || '').trim();
  return /^https?:\/\/[^\s"'<>]+$/i.test(s) ? s : '';
}

/** Limpeza leve de artefatos de importação: aspas duplicadas ("" → ") e \r\n → \n. */
function cleanText(s) {
  if (typeof s !== 'string') return s == null ? '' : String(s);
  return s.replace(/""/g, '"').replace(/\r\n/g, '\n').trim();
}
