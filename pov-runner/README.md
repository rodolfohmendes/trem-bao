# PoV Runner

App interno (Google Apps Script + Google Sheets, 100% em português) para **planejar, executar e
reportar provas de valor (PoVs)** com os test cases da Test Case Library do POV Companion. Lê o mesmo
JSON que o `pov-companion-collector.js` gera (de preferência o `.pt-BR.json` do kit
`library-export`) e produz o plano de testes, o status semanal e o relatório de resultados — em
versão interna ou para o cliente — com rastreabilidade de critério de sucesso → caso → checklist →
evidência.

Desenho completo: [`docs/design.md`](docs/design.md). Irmão do PoV Killer (kill list competitiva):
mesma fonte de dados e mesmo padrão de projeto.

## O que ele faz

- **Biblioteca**: importa o bundle do coletor (Drive ou arquivo), com dry-run, proteção contra export
  parcial, preservação de tradução e de texto de casos que saíram da biblioteca.
- **PoV**: cliente, período, equipe (quem vê a PoV), objetivo, **critérios de sucesso** (obrigatórios
  e desejáveis) e o ciclo planejamento → aceite do plano → execução → encerramento com aceite do
  resultado e desfecho.
- **Plano**: casos escolhidos pela taxonomia (Domínio › Use Case › Cenário) com filtros, mais casos
  **definidos com o cliente**; prioridade, responsável, data prevista, como executar no cliente.
  Depois do aceite do plano, mudanças de escopo exigem motivo e vão para o relatório.
- **Execução**: checklist por caso (pré-requisitos, passos, resultado esperado, métricas medidas),
  sugestão de status, evidências (links ou arquivos no Drive, marcadas para o cliente ou internas),
  **pendências** (o que falta, de quem, até quando — obrigatórias para "Bloqueado"), **re-testes**
  com histórico de tentativas, ações em lote e concorrência otimista.
- **Documentos**: plano de testes, status da PoV e relatório de resultados, em HTML/PDF no Drive e
  CSV; a versão do cliente omite o que é interno e passa por uma **verificação de vazamento**.
- **Modo cliente** na tela, para conduzir a PoV com a tela compartilhada.

## Estrutura

```
src/                 código do Apps Script (clasp faz push desta pasta)
  Schema.js            abas, colunas, enums e limites (fonte única)
  Labels.js            rótulos PT e utilidades (datas, slug, links seguros)
  Import.js            JSON do coletor → abas; validação, dry-run, lápides, tradução preservada
  Catalog.js           catálogo do planejador + código puro servido ao navegador
  Povs.js              PoV, ciclo de vida, acesso (usuários, administradores, equipe)
  Criterios.js         critérios de sucesso e veredito
  Pendencias.js        pendências
  CasosProprios.js     casos definidos com o cliente
  Plano.js             escopo, inclusão/remoção, agrupamento, visão da PoV
  Execucao.js          checklist, gravação da execução, lote, progresso
  Relatorio.js         documentos, audiência, verificação de vazamento, CSV, Drive
  Sheets.js            acesso à planilha, Config, cache, lock, fuso
  Code.js              doGet, menu, guard_ e a API do front (api*)
  Tests.js             testes de integração no Apps Script + spike do PDF
  DemoBundle.js        biblioteca SINTÉTICA de demonstração (mesmo formato do coletor)
  Index.html · styles.css.html · app.js.html   a página única (dark-neon)
  relatorio.html       template dos documentos (tema claro, imprime bem)
  appsscript.json      manifesto (V8, web app executando como o dono, acesso ao domínio)
tests/               testes Node (node --test) e smoke da UI com Playwright
tools/               make_demo_bundle.js, build_dev_page.js, gas_template.js
docs/design.md       desenho
dev/                 página de desenvolvimento gerada, exemplos de documentos e screenshots
```

## Desenvolver

```bash
npm install          # só o Playwright, para o smoke da UI
npm test             # regras puras, template e as regras de segurança do web app
npm run dev:ui       # gera dev/index.dev.html e percorre a UI inteira no Chromium (screenshots em dev/shots/)
npm run demo:bundle  # regenera src/DemoBundle.js (determinístico)
```

`dev/index.dev.html` abre direto no navegador: é o app completo sobre a biblioteca de demonstração,
com um `google.script.run` falso que roda as mesmas regras puras do servidor. `npm test` também grava
exemplos dos seis documentos em `dev/relatorio-<tipo>-<audiência>.html`.

## Publicar (uma vez)

1. Com a **conta corporativa** (o e-mail de quem usa só é conhecido dentro do mesmo domínio Google
   Workspace), crie uma planilha "PoV Runner" e abra **Extensões › Apps Script**.
2. `npm i -g @google/clasp && clasp login`; copie `.clasp.json.example` para `.clasp.json` com o
   **Script ID** (Configurações do projeto) e rode `clasp push`.
   Sem clasp: crie no editor os arquivos com os mesmos nomes (`app.js.html` vira o HTML `app.js`,
   `styles.css.html` vira `styles.css`, `relatorio.html` vira `relatorio`, `Index.html` vira `Index`)
   e cole o conteúdo; substitua o `appsscript.json` (mostre o manifesto em Configurações do projeto).
3. Recarregue a planilha: menu **PoV Runner › Criar abas que faltam**.
4. **Implantar › Nova implantação › App da Web**: executar como **Eu**, acesso **qualquer pessoa em
   paloaltonetworks.com**. Copie a URL (menu **PoV Runner › Abrir o app** também mostra).
5. No app, **Administração**:
   - Configurações: administradores (além de você), usuários autorizados (vazio = qualquer pessoa do
     domínio; aceita `@dominio.com`), visibilidade das PoVs (**equipe**, o padrão: cada PoV só é vista
     por quem a criou, o responsável e os e-mails do campo Equipe; ou **todos**) e a **pasta do Drive**
     — recomendado um Drive compartilhado do time, para os documentos não ficarem no Meu Drive de uma
     pessoa.
   - Importe a biblioteca (abaixo) ou, para experimentar, **Carregar demonstração**.

## Importar / atualizar a biblioteca

Coletor no console do POV Companion → (opcional, recomendado) tradução dos casos novos com o kit
`library-export` → JSON no Drive (ou escolha o arquivo no computador) → **Administração › Analisar
(dry-run)** → confirmar. PoVs, critérios, execuções, pendências e documentos são preservados; casos
que saíram da biblioteca continuam com o último texto nas PoVs que os usam; um export parcial só é
importado com confirmação explícita.

## Conduzir uma PoV

1. **Nova PoV** (cliente, período, equipe por e-mail, objetivo) → aba **Critérios**: o que o cliente
   precisa ver para considerar a PoV um sucesso.
2. **Plano**: escolha use cases/casos na taxonomia e crie os casos definidos com o cliente; na
   Execução, vincule casos a critérios, defina prioridade, responsável e data (também em lote).
3. **Relatório › Plano de testes** (versão do cliente) → apresente → **Registrar aceite do plano**.
4. **Execução**: para cada caso, checklist, status (a sugestão ajuda), resultado obtido e evidências;
   bloqueios viram pendências com dono e prazo. Use o **Modo cliente** ao compartilhar a tela.
5. **Relatório › Status da PoV** para o acompanhamento semanal.
6. **Encerrar PoV**: resumo executivo, próximos passos, aceite do resultado e desfecho (interno) →
   **Relatório de resultados** para o cliente (com bloco de assinatura) e a versão interna.

## Dados e segurança

- O conteúdo da biblioteca é interno da Palo Alto Networks: ele vive na planilha e no Drive de quem
  publica, **nunca neste repositório**. `src/DemoBundle.js` e os testes usam dados sintéticos.
- O web app roda como o dono e fica aberto ao domínio. Por isso toda função do servidor que alcança
  dados é privada (`_`), toda `api*` passa por `guard_()` e um teste estático
  (`tests/sheets-security.test.js`) falha se alguém quebrar essa regra.
- Documentos do cliente: sem campos internos, links internos do texto trocados por "[link interno
  omitido]" e confirmação quando a verificação encontra concorrentes, e-mails ou palavras internas.

## Testes de integração no Apps Script

Numa **cópia** da planilha (ou planilha nova com o mesmo script), grave na aba Config a chave
`ambiente` = `fixture` e rode **PoV Runner › Rodar testes de integração** (ou `runAllTests` no
editor). Os testes usam a biblioteca de demonstração embutida; nada precisa estar no Drive. Depois,
**Spike do PDF do relatório** gera um PDF para conferência visual (tabelas, ✓/✗, acentos, quebras de
página). Se o PDF do servidor não ficar bom, a tela oferece "Abrir em nova aba → Imprimir → Salvar
como PDF".

## Limites conhecidos

- O conversor HTML→PDF do Apps Script tem CSS limitado; o template usa só o que ele respeita, e a rota
  de impressão pelo navegador está sempre disponível.
- Evidências anexadas: até 10 MB por arquivo (maiores: suba no Drive e cole o link).
- Até 200 casos por inclusão/ação em lote; uma célula da planilha guarda até 50.000 caracteres (o app
  avisa antes de estourar).
