# PoV Runner — desenho

Status: fase 1 implementada · App interno (Google Apps Script + Google Sheets), 100% em português do Brasil.
Revisão de desenho: três leituras independentes (SC que conduz PoVs, engenharia de Apps Script,
fidelidade ao JSON do coletor) — os achados aceitos estão incorporados abaixo.

## 1. Objetivo

PoV Runner é o app em que o SC **planeja, executa e reporta uma PoV** (prova de valor) usando os
test cases da Test Case Library do POV Companion. A entrada é o mesmo JSON que o
`pov-companion-collector.js` gera (de preferência o `.pt-BR.json` traduzido pelo kit
`library-export`). As saídas são o **plano de testes**, o **status semanal** e o **relatório de
resultados** (HTML e PDF no Drive, versão interna ou para o cliente), com rastreabilidade de ponta a
ponta: critério de sucesso do cliente → casos vinculados → checklist de cada caso (pré-requisitos,
passos, resultado esperado, métricas) → status, resultado obtido, evidências, tentativas.

Fluxo: importar a biblioteca → criar a PoV → registrar os critérios de sucesso → montar o plano
(casos da taxonomia e casos definidos com o cliente) → gerar o plano e **registrar o aceite do plano**
→ executar (checklist, status, evidências, pendências, re-testes) → status semanal → **encerrar com o
aceite do resultado** e o desfecho.

É o irmão do PoV Killer (kill list competitiva): mesma fonte de dados e mesmo padrão de projeto
(planilha como banco, regras puras testadas em Node, camada Apps Script separada, página única
dark-neon). O PoV Killer escolhe **o que** provar contra quem; o PoV Runner registra **a prova**.

## 2. Fora de escopo (fase 1)

IA de qualquer tipo; escrever de volta no POV Companion (signoffs); editar o texto dos casos da
biblioteca (são literais); exportar para Google Docs; embutir imagens de evidência no PDF; mais de um
idioma.

## 3. Decisões

1. **Zero inferência.** Texto de caso é literal da biblioteca (PT quando traduzido, EN com o selo
   "tradução pendente" quando não). Sugestão de status e veredito de critério são regras
   determinísticas; o SC decide e pode sobrescrever o veredito com justificativa escrita.
2. **Planilha como banco** (projeto container-bound). A importação reescreve só as abas de referência
   (`Library`, `Taxonomia`, `Ambientes`); as de trabalho nunca são reescritas — só `orfao` é marcado.
3. **Nada se apaga.** Tirar um caso do plano desativa a linha; incluí-lo de novo a reativa com os
   resultados. Item de checklist avaliado que sai da biblioteca fica como `removido`. Caso que some
   do bundle vira **lápide** na `Library` (texto preservado, escondido do planejador).
4. **Linha de base.** Depois do aceite do plano, incluir/remover casos exige motivo e vira "mudança de
   escopo", listada no relatório.
5. **Duas audiências, uma regra.** `caseForAudience` decide o que o cliente vê — no relatório e no
   "modo cliente" da tela (para conduzir a PoV com a tela compartilhada). O cliente não vê:
   posicionamento competitivo, laboratório, notas da biblioteca, value drivers, docs internas, link do
   POV Companion, oportunidade, observações internas, causa/referência, tentativas, desfecho; links
   internos citados no texto literal viram "[link interno omitido]" (docs públicas ficam). Antes de
   salvar um documento do cliente, a **verificação de vazamento** lista concorrentes, e-mails e
   palavras internas encontrados (e links que escaparam) e pede confirmação — no PDF e no CSV. Textos
   livres do SC na versão do cliente também passam pela troca de links (só evidências marcadas para o
   cliente e docs públicas ficam); o motivo de "sem aceite formal" fica só na versão interna.
6. **Relatório claro** (tema de impressão, CSS simples) — pode ir ao cliente e o conversor HTML→PDF do
   Apps Script respeita.
7. **Sem dados reais no repositório** (público): testes e a "biblioteca de demonstração" usam
   `src/DemoBundle.js`, sintético, com o mesmo formato do coletor. Nenhum host interno fixo no código:
   o link de cada caso usa `meta.origin` do bundle.
8. **Segurança do web app.** Roda como quem publicou e é aberto ao domínio; por isso toda função que
   alcança dados termina em `_` (fora do alcance do `google.script.run`), toda `api*` começa por
   `guard_()` e há controle por PoV (equipe) e por papel (administrador). Um teste estático garante isso.

## 4. Arquitetura

| Arquivo | Responsabilidade |
|---|---|
| `Schema.js` | abas, colunas (JSON/booleanas/números), enums, limites, `APP_VERSION` |
| `Labels.js` | rótulos PT, `slugify`, `foldText`, `safeUrl`, `cleanText`, `isIsoDate`, `fixedOffsetFormatter` |
| `Import.js` | `validateBundle`, `bundleToRows`, `carryOverTranslations`, `addTombstones`, `markOrphans`, `dryRunImport`, `planImport` + Drive/upload/demo |
| `Catalog.js` | `buildCatalog` (árvore + índice leve) e `clientSharedCode` (regras puras servidas ao navegador) + cache |
| `Povs.js` | `validatePov`, `createPovRow`, `updatePovRow`, `transitionPov`, acesso (`isAuthorizedUser`, `isAdminUser`, `canAccessPov`), `listPovSummaries` |
| `Criterios.js` | critérios de sucesso, `criterionVerdict`, `criteriaSummary` |
| `Pendencias.js` | pendências (o que falta, de quem, até quando), `pendenciasView` |
| `CasosProprios.js` | casos definidos com o cliente, `customToLibraryRow`, `caseIndex` |
| `Plano.js` | escopo, filtros, `useCaseFor`, `addCasesToPlan`, `removeFromPlan`, `groupPlan`, `scopeChanges`, `buildPovView` |
| `Execucao.js` | `displayFields`, checklist (`checklistItems`, `normalizeChecklist`, `checklistStats`, `suggestStatus`), `applyExecutionUpdate`, `refreshCaseVersion`, `bulkUpdateExecutions`, `computeProgress` |
| `Relatorio.js` | `redactText`, `caseForAudience`, `buildReportModel`, `leakCheck`, `reportFileBaseName`, `reportToCsv` + render/Drive |
| `Sheets.js` | acesso à planilha pelo cabeçalho real, Config, cache com chunking, lock com flush, usuário, fuso |
| `Code.js` | `doGet`, `include`, `onOpen`, `guard_`, menu e API (`api*`) |
| `Tests.js` | testes de integração no Apps Script (planilha marcada como fixture) e spike do PDF |
| `DemoBundle.js` | bundle sintético (gerado por `tools/make_demo_bundle.js`) |
| `Index.html`, `styles.css.html`, `app.js.html` | página única |
| `relatorio.html` | template do plano / status / resultados |

## 5. Modelo de dados

Cabeçalho na linha 1; listas como JSON na célula; tudo gravado como texto (`@`). Texto que começa
com `= + - @` recebe o prefixo `'` (não vira fórmula) e volta igual na leitura. As gravações seguem o
cabeçalho real da aba, então colunas novas de versões futuras não desalinham as linhas antigas.

- **Library** (referência): campos do caso (EN e `*_pt`), `lifecycle`, `published`, `visibility`,
  teste de laboratório mais recente (`test_*`) e por ambiente (`lab_tests`), `domain/use_case/scenario`,
  `node_ids` (marcações) e `tax_ids` (com ancestrais), `docs` (`{label,url,audience,summary}`, URL
  saneada), `prerequisites` (`{id,name,description}`), `value_drivers`, `competitors_lib`,
  `industries`, `version`, `url` (de `meta.origin`), `traducao_versao`, `traducao_pendente`,
  `removido_em` (lápide).
- **Taxonomia**: `node_id, name, name_pt, type, type_pt, depth, parent_id, parent_inferido, path_pt, …, status`.
  Use case é identificado pelo **tipo** (`Use Case`), não pela profundidade (há subdomínios). Nós que só
  existem embutidos nos casos (aposentados) ganham pai por co-ocorrência nas marcações (`node_ids`),
  com desempate determinístico.
- **Ambientes**: sugestões para o campo ambiente.
- **PoVs**: identificação, período, `objetivo`, equipe (e-mails = quem vê a PoV), `status`
  (`planning → running → done`, ou `cancelled`), aceite do plano (`plano_aceite_*`), encerramento
  (`resumo_executivo`, `proximos_passos`, `resultado_aceite_*`, `desfecho`, `competidor`), `pasta_id`,
  auditoria.
- **Criterios**: `texto`, `peso` (obrigatório | desejável), `ordem`, `veredito_manual` + `justificativa`.
- **CasosProprios**: `custom:<uuid>`, por PoV, com `nome, resumo, objetivos[], resultado_esperado,
  metricas[], como_testar, use_case_id, versao` (sobe quando o texto muda).
- **Execucoes** (PoV × caso): snapshot (`caso_nome`, `versao_caso`, `use_case_id/nome/path`),
  planejamento (`prioridade`, `responsavel`, `data_prevista`, `escopo_cliente`, `criterios_ids`),
  execução (`status`, `checklist`, `resultado_obtido`, `evidencias [{label,url,cliente}]`,
  `observacoes`, `causa`, `referencia`, `ambiente`, `executado_por`, `testemunha`), ciclo
  (`tentativas`, `primeiro_status`, `versao_avaliada`, `iniciado_em`, `concluido_em`), escopo
  (`ativo`, `orfao`, `incluido_apos_aceite`, `removido_em`, `removido_apos_aceite`, `motivo_escopo`), auditoria.
  A mudança de escopo é um fato gravado na hora (não uma comparação de datas).
- **Tentativas**: foto de cada vez que um caso chega a um status final (re-teste).
- **Pendencias**: `descricao`, `responsavel_tipo` (cliente | panw | parceiro), `responsavel_nome`,
  `prazo`, `status` (aberta | resolvida), `exec_ids`, `resolucao`.
- **Historico** (append-only): `pov | aceite | plano | escopo | status | versao | criterio | pendencia | relatorio`.
- **Relatorios**: documentos gerados (tipo, audiência, links).
- **Config**: estado da importação, `usuarios`, `admins`, `visibilidade` (equipe | todos),
  `drive_folder_id`, `concorrentes_extra`, `import_em_andamento`.

## 6. Importação

Entrada: id/URL de arquivo no Drive ou arquivo do computador (gravado em `PoV Runner/importacoes/`).
Validação: `meta.source`, ids únicos, listas de referência não vazias (`taxonomy_nodes`, `node_types`,
`environments`), todo `meta.counts.*` igual ao tamanho da lista, e **export parcial** (`meta.partial`
ou total reportado maior que a lista) recusado sem autorização explícita — com autorização, casos
ausentes continuam na biblioteca como estavam (sem lápide, sem órfão). O dry-run nunca recusa um
export parcial: mostra o que a importação parcial autorizada faria. Só entram casos `published` e `visibility = shared` (os demais aparecem no
dry-run). Textos EN recebem a limpeza do `build_base` (`""` → `"`). Tradução já importada é
preservada quando o bundle novo vem sem `pt` para a mesma versão.

Dry-run: novos, alterados, removidos, excluídos, execuções que ficarão órfãs (e quantas em PoVs em
execução/concluídas — exige confirmação), reabilitadas, com caso alterado, com ciclo de vida alterado
(descontinuado/rascunho), referências não resolvidas, traduções preservadas/perdidas, avisos.

Gravação, sob lock: todas as células são serializadas e o limite de 50.000 caracteres conferido
**antes** de limpar a primeira aba; `Config.import_em_andamento` marca a janela; `Execucoes` só tem a
coluna `orfao` alterada, linha a linha. Idempotente.

## 7. Plano

Planejador: árvore da taxonomia (qualquer profundidade) com contadores que respeitam os filtros
(busca PT/EN sem acento, indústria, "só aprovados no laboratório", descontinuados) e a lista de casos.
Incluir: no máximo 200 por vez; já ativo → ignora; inativo → reativa; lápide/caso de outra PoV → recusa;
senão cria com checklist em branco e o **use case do grupo**: o use case do caso coberto pela seleção
(subindo por cenário/subdomínio), ou, sem seleção, o pai do cenário marcado, ou o de menor caminho.
Depois do aceite do plano: motivo obrigatório (evento de escopo). Casos definidos com o cliente
entram no plano ao serem criados.

## 8. Execução

**Checklist** (`checklistItems`): pré-requisitos (chave = id), passos (itens de `objectives` que não
são título terminando em ":" nem "-"; chave = texto EN normalizado + ocorrência), um item de aceite
(resultado esperado; `obs` = observado) e métricas (medição; `obs` = valor medido, avaliação
opcional). Marcações: `true | false | 'na' | null`. `normalizeChecklist` casa pela chave (a tradução
pode mudar sem mexer nas marcações), preserva avaliados que saíram como `removido`.

**Sugestão de status**: pré-requisito não atendido → bloqueado; aceite atendido → aprovado (parcial se
algum passo não feito ou medição fora); aceite não atendido → reprovado; sem aceite, os passos
decidem; avaliação incompleta → em andamento.

**Gravação** (`applyExecutionUpdate`), sob lock e com concorrência otimista: valida tudo (limites,
links http/https, JSON ≤ 49.000 caracteres); recusa PoV concluída/cancelada; **bloqueado exige
pendência aberta vinculada** (pode ser criada no mesmo salvamento); `iniciado_em` na primeira mudança;
`concluido_em` ao chegar a status final (limpo se voltar); cada chegada a status final gera uma
**tentativa** (re-teste) e grava `versao_avaliada`; eventos no histórico. Em conflito, a API devolve a
versão do servidor e a tela mantém o rascunho (descartar ou sobrescrever).

**Ações em lote**: prioridade, responsável, data, vincular/desvincular critério, não aplicável (com
motivo) — linha a linha, conflitos reportados sem derrubar o lote.

**Critérios de sucesso** (`criterionVerdict`), sobre os casos vinculados ativos, ignorando "não
aplicável": nenhum → sem casos; algum reprovado → não atendido; todos aprovados → atendido; algum
não concluído → pendente; senão → parcialmente atendido. Manchete: "X de Y critérios obrigatórios
atendidos"; avisos de critério sem caso e caso sem critério.

**Progresso**: total, por status, concluídos, % concluído, taxa de aprovação (aprovados / avaliados),
aprovados após re-teste.

## 9. Telas

- **PoVs**: contadores, filtros (status, só as minhas, busca), cartões com progresso por status,
  critérios obrigatórios e desfecho. Nova PoV.
- **PoV** (cabeçalho com ações por status: editar, registrar aceite do plano, encerrar, reabrir,
  cancelar) e abas **Execução** (tabela por use case, filtros, lote, painel de execução), **Plano**
  (planejador e casos próprios), **Critérios**, **Pendências**, **Relatório** (plano / resultados /
  status × interno / cliente, pré-visualização, verificação de vazamento, PDF no Drive, baixar PDF,
  CSV, documentos gerados) e **Histórico**.
- **Modo cliente** (chave no topo): esconde o que é interno em todas as telas, com a mesma regra dos
  documentos (`caseForAudience`/`redactText`): histórico, tentativas (só a linha "re-executado"),
  itens de checklist que saíram da biblioteca, observações internas, laboratório, posicionamento,
  motivo de "sem aceite formal", configurações da Administração; a audiência dos documentos fica
  travada em Cliente e a pré-visualização/"abrir em nova aba" nunca mostra um documento interno.
- **Administração**: importação (Drive ou arquivo), dry-run, confirmações, demonstração, estado e,
  para administradores, configurações (usuários, administradores, visibilidade, pasta do Drive,
  concorrentes extras para a verificação de vazamento).

## 10. Documentos

`buildReportModel(pov, dados, {tipo, publico, detalhe}, refs)`:

- **Plano de testes**: objetivo, critérios (com casos vinculados), escopo por use case, pré-requisitos
  e pendências, agenda (data prevista × responsável), tabela de casos, detalhamento opcional (padrão:
  compacto para o cliente).
- **Status da PoV**: progresso, critérios com situação, pendências abertas, próximas execuções.
- **Relatório de resultados**: resumo executivo, manchete dos critérios, progresso, pendências,
  resultados por caso, mudanças de escopo desde o aceite, próximos passos, detalhamento (checklist
  marcado, aceite observado, métricas medidas, resultado obtido, evidências da audiência, re-teste),
  aceite do resultado (bloco de assinatura na versão do cliente).

Datas no fuso do script (formatador injetado). Arquivos na pasta da PoV (`PoV Runner/<cliente>/<PoV>`,
versões internas em `interno/`), nome `pov-runner_<cliente>_<tipo>_<audiência>_<AAAA-MM-DD_HHmm>`.
Compartilhamento com o domínio; se a política bloquear, leitura para quem gerou e a equipe. O PDF
também pode ser baixado direto pela tela. CSV (`;`, BOM, células anti-fórmula) segue a audiência.

## 11. Segurança, concorrência e erros

- `guard_()` em toda `api*`: e-mail identificado (senão, orienta usar só a conta corporativa),
  `Config.usuarios` (e-mails, "Nome <e-mail>" ou @domínios; vazio = domínio do web app), administrador
  (quem publicou — gravado nas propriedades do script no primeiro acesso ao web app, porque em menus o
  usuário efetivo é quem clicou — ou `Config.admins`) para importação/demonstração/configurações; menus
  e testes também exigem administrador. Administradores sempre passam pela lista de usuários, e salvar
  uma lista que exclui quem salva é recusado (ninguém fica trancado para fora). Visibilidade por PoV (`equipe`: criador, responsável e e-mails do campo equipe;
  `todos`: qualquer usuário autorizado).
- Sem `ALLOWALL` (o app não pode ser embutido em outro site). HTML sempre escapado; links só http(s).
- Toda gravação sob `LockService` com `SpreadsheetApp.flush()` antes de soltar o lock; concorrência
  otimista em PoV, execução, critério, pendência e caso próprio. Atualizações escrevem só as colunas do
  app (colunas acrescentadas à mão ficam intactas). A pasta do Drive configurada nunca é trocada em
  silêncio: inacessível ou na lixeira → erro claro. Cache do catálogo amarrado à importação.
- Reabrir uma PoV tira o aceite e o desfecho anteriores (ficam no histórico): uma PoV em execução não
  mostra resultado aceito.
- Uploads: até 10 MB (conferido na tela e no servidor), gravados fora do lock.

## 12. Testes

- Node (`npm test`): importação, checklist, execução, plano, PoV/acesso, critérios/pendências/casos
  próprios, documentos, template (6 combinações), código compartilhado com o navegador, serialização
  da planilha e as regras de segurança (análise estática transitiva).
- UI (`npm run dev:ui`): página de desenvolvimento com `google.script.run` falso sobre as regras puras;
  Playwright percorre as telas e tira screenshots.
- Apps Script (`runAllTests`, planilha marcada `Config.ambiente = fixture`): importação da demo,
  PoV, critérios, plano, aceite, execução com bloqueio/re-teste/conflito, documentos no Drive, CSV,
  encerramento/reabertura, cache. `spikeReportPdf` confere o PDF.
