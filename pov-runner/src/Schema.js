/**
 * Schema.js — nomes das abas, colunas e enums (única fonte de verdade).
 * Colunas em `json` são gravadas como JSON na célula; `bool` como TRUE/FALSE; `num` voltam como número.
 * Sem dependência de serviços do Apps Script (testável em Node).
 */
var APP_VERSION = '0.1.0';
var APP_NAME = 'PoV Runner';

var SHEETS = {
  LIBRARY: 'Library',
  TAXONOMIA: 'Taxonomia',
  AMBIENTES: 'Ambientes',
  POVS: 'PoVs',
  CRITERIOS: 'Criterios',
  CASOS_PROPRIOS: 'CasosProprios',
  EXECUCOES: 'Execucoes',
  TENTATIVAS: 'Tentativas',
  PENDENCIAS: 'Pendencias',
  HISTORICO: 'Historico',
  RELATORIOS: 'Relatorios',
  CONFIG: 'Config',
};

var SCHEMA = {
  // ---------------------------------------------------------------- referência (reescritas pela importação)
  Library: {
    key: 'id',
    protected: true,
    columns: [
      'id', 'name', 'summary', 'description', 'objectives', 'evaluation_metrics', 'expected_outcome', 'how_to', 'notes',
      'lifecycle', 'published', 'visibility', 'tested', 'test_result', 'test_environment', 'test_at', 'test_by', 'lab_tests',
      'domain', 'use_case', 'scenario', 'node_ids', 'tax_ids', 'docs', 'prerequisites', 'value_drivers', 'competitors_lib', 'industries',
      'version', 'updated_at', 'url',
      'name_pt', 'summary_pt', 'description_pt', 'objectives_pt', 'evaluation_metrics_pt', 'expected_outcome_pt', 'how_to_pt', 'notes_pt',
      'traducao_versao', 'traducao_pendente', 'removido_em',
    ],
    json: ['objectives', 'evaluation_metrics', 'notes', 'lab_tests', 'domain', 'use_case', 'scenario', 'node_ids', 'tax_ids', 'docs',
      'prerequisites', 'value_drivers', 'competitors_lib', 'industries', 'objectives_pt', 'evaluation_metrics_pt', 'notes_pt'],
    bool: ['published', 'tested', 'traducao_pendente'],
    num: ['version', 'traducao_versao'],
  },
  Taxonomia: {
    key: 'node_id',
    protected: true,
    columns: ['node_id', 'name', 'name_pt', 'type', 'type_pt', 'depth', 'parent_id', 'parent_inferido', 'path_pt', 'description', 'description_pt', 'status'],
    json: [],
    bool: ['parent_inferido'],
    num: ['depth'],
  },
  Ambientes: {
    key: 'env_id',
    protected: true,
    columns: ['env_id', 'name', 'name_pt', 'description_pt', 'ativo'],
    json: [],
    bool: ['ativo'],
    num: [],
  },
  // ---------------------------------------------------------------- trabalho (a importação nunca reescreve)
  PoVs: {
    key: 'pov_id',
    columns: ['pov_id', 'cliente', 'titulo', 'oportunidade', 'responsavel', 'equipe', 'contato_cliente', 'inicio', 'fim_previsto',
      'status', 'ambiente', 'objetivo', 'observacoes',
      'plano_aceite_em', 'plano_aceite_por', 'plano_aceite_obs',
      'resumo_executivo', 'proximos_passos', 'resultado_aceite_em', 'resultado_aceite_por', 'resultado_aceite_obs', 'desfecho', 'competidor',
      'pasta_id', 'criado_por', 'autor', 'criado_em', 'atualizado_em', 'library_export_date'],
    json: [],
    bool: [],
    num: [],
  },
  Criterios: {
    key: 'crit_id',
    columns: ['crit_id', 'pov_id', 'ordem', 'texto', 'peso', 'ativo', 'veredito_manual', 'justificativa', 'autor', 'criado_em', 'atualizado_em'],
    json: [],
    bool: ['ativo'],
    num: ['ordem'],
  },
  CasosProprios: {
    key: 'caso_id',
    columns: ['caso_id', 'pov_id', 'nome', 'resumo', 'objetivos', 'resultado_esperado', 'metricas', 'como_testar', 'use_case_id',
      'versao', 'ativo', 'autor', 'criado_em', 'atualizado_em'],
    json: ['objetivos', 'metricas'],
    bool: ['ativo'],
    num: ['versao'],
  },
  Execucoes: {
    key: 'exec_id',
    columns: ['exec_id', 'pov_id', 'test_case_id', 'use_case_id', 'use_case_nome', 'use_case_path', 'caso_nome', 'versao_caso', 'versao_avaliada',
      'ordem', 'prioridade', 'responsavel', 'data_prevista', 'escopo_cliente', 'criterios_ids', 'ativo', 'orfao',
      'status', 'checklist', 'resultado_obtido', 'evidencias', 'observacoes', 'causa', 'referencia', 'ambiente', 'executado_por', 'testemunha',
      'tentativas', 'primeiro_status', 'iniciado_em', 'concluido_em', 'incluido_apos_aceite', 'removido_em', 'motivo_escopo',
      'autor', 'criado_em', 'atualizado_em'],
    json: ['criterios_ids', 'checklist', 'evidencias'],
    bool: ['ativo', 'orfao', 'incluido_apos_aceite'],
    num: ['versao_caso', 'versao_avaliada', 'ordem', 'tentativas'],
  },
  Tentativas: {
    key: 'tentativa_id',
    columns: ['tentativa_id', 'exec_id', 'pov_id', 'n', 'status', 'checklist', 'resultado_obtido', 'evidencias', 'causa', 'referencia',
      'executado_por', 'ambiente', 'versao_caso', 'autor', 'em'],
    json: ['checklist', 'evidencias'],
    bool: [],
    num: ['n', 'versao_caso'],
  },
  Pendencias: {
    key: 'pend_id',
    columns: ['pend_id', 'pov_id', 'descricao', 'responsavel_tipo', 'responsavel_nome', 'prazo', 'status', 'exec_ids', 'resolucao',
      'autor', 'criado_em', 'atualizado_em', 'resolvida_em'],
    json: ['exec_ids'],
    bool: [],
    num: [],
  },
  Historico: {
    key: 'evento_id',
    columns: ['evento_id', 'pov_id', 'exec_id', 'test_case_id', 'tipo', 'de', 'para', 'nota', 'autor', 'em'],
    json: [],
    bool: [],
    num: [],
  },
  Relatorios: {
    key: 'relatorio_id',
    columns: ['relatorio_id', 'pov_id', 'tipo', 'publico', 'casos', 'aprovados', 'autor', 'criado_em', 'html_url', 'pdf_url', 'library_export_date'],
    json: [],
    bool: [],
    num: ['casos', 'aprovados'],
  },
  Config: {
    key: 'chave',
    columns: ['chave', 'valor'],
    json: [],
    bool: [],
    num: [],
  },
};

var EXEC_STATUSES = ['not_started', 'in_progress', 'pass', 'partial', 'fail', 'blocked', 'not_applicable'];
/** Status que encerram a execução do caso (contam como concluídos). */
var FINAL_STATUSES = ['pass', 'partial', 'fail', 'not_applicable'];
var POV_STATUSES = ['planning', 'running', 'done', 'cancelled'];
/** PoV nesses status fica somente leitura (reabrir = ação "Reabrir"). */
var LOCKED_POV_STATUSES = ['done', 'cancelled'];
var PRIORITIES = ['high', 'medium', 'low'];
/** Tipos de item do checklist: pré-requisito, passo (objetivo), aceite (resultado esperado), medição (métrica). */
var CHECK_TYPES = ['prereq', 'step', 'out', 'met'];
/** Marcação de um item: true (atendido/feito), false (não), 'na' (não se aplica), null (não avaliado). */
var CHECK_VALUES = [true, false, 'na', null];
var CRITERION_WEIGHTS = ['obrigatorio', 'desejavel'];
var CRITERION_VERDICTS = ['met', 'partial', 'not_met'];
var FAIL_CAUSES = ['produto', 'configuracao', 'ambiente_cliente', 'fora_escopo', 'aguardando_fix', 'outro'];
var PENDING_OWNERS = ['cliente', 'panw', 'parceiro'];
var POV_OUTCOMES = ['tech_win', 'tech_loss', 'no_decision', 'open'];
var REPORT_TYPES = ['plano', 'resultados', 'status'];
var AUDIENCES = ['interno', 'cliente'];

var LIMITS = {
  short: 200,        // cliente, título, executado por, testemunha, ambiente, rótulo de evidência, referência
  medium: 500,       // oportunidade, equipe, contato, critério de sucesso
  obs: 1000,         // observação/valor medido de um item do checklist
  url: 2000,         // link de evidência
  long: 5000,        // objetivo, observações, resumo executivo, próximos passos, escopo no cliente
  result: 10000,     // resultado obtido
  evidences: 30,     // evidências por execução
  jsonCell: 49000,   // margem sob o limite de 50.000 caracteres por célula do Sheets
  planBatch: 200,    // casos por inclusão/ação em lote
  uploadBytes: 10 * 1024 * 1024, // anexo de evidência (10 MB)
};
