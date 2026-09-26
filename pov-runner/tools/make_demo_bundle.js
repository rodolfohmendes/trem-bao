#!/usr/bin/env node
/*
 * make_demo_bundle.js — gera src/DemoBundle.js (biblioteca de demonstração do PoV Runner).
 *
 * Dados SINTÉTICOS: o formato espelha o .pt-BR.json produzido pelo pov-companion-collector.js
 * (bundle da Test Case Library + blocos `pt` traduzidos), mas todo o conteúdo — nomes, textos,
 * ids, pessoas, concorrentes — é inventado para demonstração. Nada aqui vem da biblioteca real.
 *
 * Uso:  node tools/make_demo_bundle.js
 * Sem dependências (Node 22). Determinístico: ids = UUIDs derivados de sha1 de uma chave estável,
 * timestamps fixos; rodar duas vezes gera arquivos idênticos byte a byte.
 */
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const OUT_FILE = path.join(__dirname, '..', 'src', 'DemoBundle.js');

// ------------------------------------------------------------------ helpers

/** UUID (formato v5) derivado de sha1 de uma chave estável. */
function uuidFrom(key) {
  const h = crypto.createHash('sha1').update('pov-runner-demo:' + key).digest();
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString('hex');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

/** '2026-05-12 15:30' | '2026-05-12 15:30:01' -> '2026-05-12T15:30:00.000000Z' (formato da API). */
function ts(s) {
  const m = /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s);
  if (!m) throw new Error('bad timestamp spec: ' + s);
  return `${m[1]}T${m[2]}:${m[3]}:${m[4] || '00'}.000000Z`;
}

/** Soma 1 segundo a um timestamp spec (usado na auto-transição depois do sign-off). */
function plus1s(s) {
  const d = new Date(ts(s).replace('.000000Z', 'Z'));
  d.setUTCSeconds(d.getUTCSeconds() + 1);
  const iso = d.toISOString(); // 2026-05-12T15:30:01.000Z
  return iso.slice(0, 10) + ' ' + iso.slice(11, 19);
}

/** Sign-off de teste + auto-transição reviewed -> tested (1 s depois). */
function signoff(at, env, result = 'pass', actor = 'lab') {
  return [
    ['tr', plus1s(at), 'reviewed', 'tested', 'Auto-transition'],
    ['test', at, env, result, actor],
  ];
}

// ------------------------------------------------------------------ reference data

const NODE_TYPES = [
  { key: 'domain', label: 'Domain', abbrev: 'DOM', color: 'brand', icon: 'Network', label_pt: 'Domínio' },
  { key: 'feature', label: 'Feature', abbrev: 'FEA', color: 'green', icon: 'Sparkles', label_pt: 'Recurso' },
  { key: 'product', label: 'Product', abbrev: 'PRD', color: 'blue', icon: 'Box', label_pt: 'Produto' },
  { key: 'scenario', label: 'Scenario', abbrev: 'SCN', color: 'violet', icon: 'Beaker', label_pt: 'Cenário', version: 2 },
  { key: 'subdomain', label: 'Subdomain', abbrev: 'SUB', color: 'gray', icon: 'FolderTree', label_pt: 'Subdomínio' },
  { key: 'use-case', label: 'Use Case', abbrev: 'UC', color: 'teal', icon: 'Crosshair', label_pt: 'Use Case' },
];
const TYPE_BY_DEPTH = { 0: 'domain', 1: 'use-case', 2: 'scenario' };

// Árvore Domain > Use Case > Scenario (depth implícito pela posição; tipo padrão por depth,
// sobrescrito por `type` — ex.: Domain > Subdomain > Use Case em Cloud).
const TAXONOMY = [
  {
    key: 'ngfw', name: 'NGFW', name_pt: 'NGFW', brand_color: '#e4572e',
    description: 'Network security delivered by next-generation firewalls in hardware, virtual and cloud form factors.',
    description_pt: 'Segurança de rede entregue por firewalls de próxima geração em formatos físico, virtual e em nuvem.',
    children: [
      {
        key: 'ngfw-sia', version: 2, name: 'Securing Internet Access', name_pt: 'Proteção do acesso à Internet',
        description: 'Protect users and devices that browse the internet from web-borne threats.',
        description_pt: 'Proteger usuários e dispositivos que navegam na Internet contra ameaças originadas na web.',
        children: [
          { key: 'ngfw-sia-url', name: 'URL Filtering and Content Filtering', name_pt: 'Filtragem de URL e de conteúdo', description: '', description_pt: '' },
          {
            key: 'ngfw-sia-atp', name: 'Advanced Threat Prevention', name_pt: 'Advanced Threat Prevention',
            description: 'Inline prevention of exploits, malware and command-and-control traffic.',
            description_pt: 'Prevenção inline de exploits, malware e tráfego de comando e controle.',
          },
        ],
      },
      {
        key: 'ngfw-ac', name: 'Application Control', name_pt: 'Controle de aplicações',
        description: 'Identify and control applications regardless of port, protocol or encryption.',
        description_pt: 'Identificar e controlar aplicações independentemente de porta, protocolo ou criptografia.',
        children: [
          { key: 'ngfw-ac-appid', name: 'App-ID Policy', name_pt: 'Política de App-ID', description: '', description_pt: '' },
        ],
      },
      { key: 'ngfw-dcs', name: 'Data Center Segmentation', name_pt: 'Segmentação do data center', description: '', description_pt: '' },
    ],
  },
  {
    key: 'sase', name: 'SASE', name_pt: 'SASE', brand_color: '#2e86de',
    description: 'Secure access for users and branches delivered from the cloud.',
    description_pt: 'Acesso seguro para usuários e filiais entregue a partir da nuvem.',
    children: [
      {
        key: 'sase-sra', name: 'Secure Remote Access', name_pt: 'Acesso remoto seguro',
        description: 'Consistent security for users working from any location.',
        description_pt: 'Segurança consistente para usuários que trabalham de qualquer local.',
        children: [
          {
            key: 'sase-sra-ztna', name: 'ZTNA to Private Apps', name_pt: 'ZTNA para aplicações privadas',
            description: 'Least-privilege access to private applications without network-level access.',
            description_pt: 'Acesso de menor privilégio a aplicações privadas sem acesso em nível de rede.',
          },
          { key: 'sase-sra-data', name: 'SaaS and Data Protection', name_pt: 'Proteção de SaaS e dados', description: '', description_pt: '' },
        ],
      },
      {
        key: 'sase-branch', name: 'Branch Connectivity (SD-WAN)', name_pt: 'Conectividade de filiais (SD-WAN)',
        description: 'Application-aware connectivity for branch offices over multiple WAN links.',
        description_pt: 'Conectividade com reconhecimento de aplicações para filiais por meio de múltiplos links WAN.',
      },
      { key: 'sase-dem', name: 'Digital Experience Monitoring', name_pt: 'Monitoramento da experiência digital', description: '', description_pt: '' },
    ],
  },
  {
    key: 'cloud', name: 'Cloud', name_pt: 'Cloud', brand_color: '#10ac84',
    description: 'Security for cloud infrastructure, applications and workloads from code to runtime.',
    description_pt: 'Segurança para infraestrutura, aplicações e workloads em nuvem, do código ao runtime.',
    children: [
      {
        key: 'cloud-posture', name: 'Cloud Security Posture', name_pt: 'Postura de segurança em nuvem',
        description: 'Continuous visibility and compliance for cloud accounts.',
        description_pt: 'Visibilidade e conformidade contínuas para contas de nuvem.',
        children: [
          { key: 'cloud-posture-misconfig', name: 'Misconfiguration Detection', name_pt: 'Detecção de configurações incorretas', description: '', description_pt: '' },
        ],
      },
      {
        key: 'cloud-appsec', type: 'subdomain', name: 'Application Security', name_pt: 'Segurança de aplicações',
        description: 'Security of application code, dependencies and delivery pipelines.',
        description_pt: 'Segurança do código das aplicações, das dependências e dos pipelines de entrega.',
        children: [
          {
            key: 'cloud-c2c', type: 'use-case', name: 'Code to Cloud (IaC Scanning)', name_pt: 'Code to Cloud (varredura de IaC)',
            description: 'Find and fix misconfigurations in infrastructure as code before deployment.',
            description_pt: 'Encontrar e corrigir configurações incorretas em infraestrutura como código antes da implantação.',
          },
        ],
      },
      {
        key: 'cloud-k8s', name: 'Kubernetes Runtime Protection', name_pt: 'Proteção de runtime para Kubernetes', description: '', description_pt: '',
        children: [
          {
            key: 'cloud-k8s-admission', name: 'Admission Control', name_pt: 'Controle de admissão',
            description: 'Policy enforcement when workloads are deployed to the cluster.',
            description_pt: 'Aplicação de políticas quando workloads são implantados no cluster.',
          },
        ],
      },
    ],
  },
  {
    key: 'secops', name: 'SecOps', name_pt: 'SecOps', brand_color: '#8e44ad',
    description: 'Detection, investigation and response across the security operations center.',
    description_pt: 'Detecção, investigação e resposta em todo o centro de operações de segurança.',
    children: [
      {
        key: 'secops-ir', version: 2, name: 'Incident Response Automation', name_pt: 'Automação de resposta a incidentes',
        description: 'Automate triage, investigation and containment with playbooks.',
        description_pt: 'Automatizar triagem, investigação e contenção com playbooks.',
        children: [
          { key: 'secops-ir-playbook', name: 'Playbook-driven Containment', name_pt: 'Contenção orientada por playbook', description: '', description_pt: '' },
        ],
      },
      {
        key: 'secops-ep', name: 'Endpoint Protection', name_pt: 'Proteção de endpoints',
        description: 'Prevent, detect and respond to threats on endpoints.',
        description_pt: 'Prevenir, detectar e responder a ameaças em endpoints.',
        children: [
          { key: 'secops-ep-ransomware', name: 'Ransomware Prevention', name_pt: 'Prevenção de ransomware', description: '', description_pt: '' },
        ],
      },
    ],
  },
];

// Nós "aposentados": existem só embutidos em test_cases[].taxonomy (não vêm em taxonomy_nodes).
// Os nomes PT vão em taxonomy_nodes_pt_extra.
const RETIRED_NODES = [
  { key: '@xsiam', name: 'XSIAM', depth: 0, brand_color: '#5b6c8f', name_pt: 'XSIAM', description_pt: '' },
  {
    key: '@ese', name: 'Enhance SOC Efficiency', depth: 1, brand_color: null,
    name_pt: 'Aumentar a eficiência do SOC',
    description_pt: 'Reduzir o esforço manual dos analistas do SOC por meio de correlação e automação.',
  },
];

const COMPETITORS = [
  { key: 'a', name: 'Concorrente A' },
  { key: 'b', name: 'Concorrente B' },
  { key: 'c', name: 'Concorrente C' },
  { key: 'd', name: 'Concorrente D' },
];

const INDUSTRIES = [
  { key: 'fsi', name: 'FSI' },
  { key: 'healthcare', name: 'Healthcare' },
  { key: 'manufacturing', name: 'Manufacturing' },
  { key: 'retail', name: 'Retail' },
];

const VALUE_DRIVERS = [
  { key: 'risk', name: 'Reduce risk', description: 'Lower the likelihood and impact of security incidents.' },
  { key: 'efficiency', name: 'Operational efficiency', description: 'Reduce manual effort and time spent on security operations.' },
  { key: 'tco', name: 'Consolidation / TCO', description: 'Replace point products and lower the total cost of ownership.' },
  { key: 'ux', name: 'User experience', description: 'Keep users productive with fast and secure access.' },
];

const ENVIRONMENTS = [
  {
    key: 'lab-ref', name: 'Lab — Reference Topology', name_pt: 'Lab — Topologia de referência',
    description: 'Shared lab with the reference NGFW and SASE topology.',
    description_pt: 'Laboratório compartilhado com a topologia de referência de NGFW e SASE.',
  },
  {
    key: 'panos-112', name: 'PAN-OS 11.2 lab', name_pt: 'Laboratório PAN-OS 11.2',
    description: 'Hardware and VM-Series firewalls running PAN-OS 11.2.',
    description_pt: 'Firewalls físicos e VM-Series executando PAN-OS 11.2.',
  },
  {
    key: 'prisma-access', name: 'Prisma Access tenant', name_pt: 'Tenant do Prisma Access',
    description: 'Demo Prisma Access tenant managed by Strata Cloud Manager.',
    description_pt: 'Tenant de demonstração do Prisma Access gerenciado pelo Strata Cloud Manager.',
  },
  {
    key: 'xsiam', name: 'Cortex XSIAM tenant', name_pt: 'Tenant do Cortex XSIAM',
    description: 'Demo Cortex XSIAM tenant with sample data sources.',
    description_pt: 'Tenant de demonstração do Cortex XSIAM com fontes de dados de exemplo.',
  },
  {
    key: 'unspecified', name: 'Not specified', name_pt: 'Não especificado',
    description: 'Environment not recorded at sign-off.',
    description_pt: 'Ambiente não registrado no momento do sign-off.',
  },
];

const PREREQUISITES = [
  { key: 'panos-fw', name: 'Firewall running PAN-OS 11.x with active licenses', description: 'Hardware or VM-Series firewall with Advanced Threat Prevention, Advanced URL Filtering, Advanced WildFire and Advanced DNS Security licenses.' },
  { key: 'decrypt-cert', name: 'SSL decryption certificate deployed to endpoints', description: 'Forward trust certificate installed in the trusted root store of the test endpoints.' },
  { key: 'gp-endpoint', name: 'Test endpoint with GlobalProtect agent', description: '' },
  { key: 'cloud-account', name: 'Read-only cloud account onboarded', description: 'Sandbox cloud account onboarded with read-only permissions.' },
  { key: 'log-forwarding', name: 'Log forwarding to Strata Logging Service', description: 'Firewall log forwarding profile sending traffic, threat and URL logs.' },
  { key: 'xdr-agent', name: 'XDR agent installed on test hosts', description: '' },
];

// Tradução PT das métricas (glossário do GUIA: "Pass/Fail" -> "Aprovado/Reprovado").
const METRIC_PT = {
  'Pass/Fail': 'Aprovado/Reprovado',
  'MTTD': 'MTTD',
  'MTTR': 'MTTR',
  '> 80% reduction in alerts': '> 80% de redução nos alertas',
  'Time to onboard < 1 hour': 'Tempo de onboarding < 1 hora',
  'Time to configure < 15 minutes': 'Tempo de configuração < 15 minutos',
  'Detection rate on test URLs': 'Taxa de detecção nas URLs de teste',
  'Time to verdict': 'Tempo até o veredito',
  'Page load time increase < 10%': 'Aumento no tempo de carregamento das páginas < 10%',
  'Number of exploits blocked': 'Número de exploits bloqueados',
  'False positives': 'Falsos positivos',
  'Failover time < 3 seconds': 'Tempo de failover < 3 segundos',
  'Scan time per commit': 'Tempo de varredura por commit',
  'Time to first searchable log < 10 minutes': 'Tempo até o primeiro log pesquisável < 10 minutos',
  'Manual steps removed': 'Passos manuais eliminados',
  'Time to isolate < 1 minute': 'Tempo de isolamento < 1 minuto',
};

// ------------------------------------------------------------------ people (fictícios)

const AUTHORS = [1, 2, 3].map(n => ({
  id: uuidFrom('user:author-' + n), name: 'Demo Author ' + n, email: `author${n}@example.com`,
}));
const REVIEWER = { id: uuidFrom('user:reviewer'), name: 'Demo Reviewer', email: 'reviewer@example.com' };
const LAB_ACTOR = { user_id: null, name: 'Lab Team', email: '', on_behalf_of: null };
// como nos dados reais: sign-off sem autor identificado
const UNKNOWN_ACTOR = { user_id: null, name: 'Unknown', email: '', on_behalf_of: null };

// ------------------------------------------------------------------ test cases
//
// nodes: chaves de use cases / cenários (o domínio e os pais entram automaticamente);
//        '@xsiam' / '@ese' são os nós aposentados (só embutidos).
// taxonomyOnly: chaves que ficam só em taxonomy[] (ancestral), fora de node_ids — como nos
//        casos reais que apontam para nós aposentados.
// valueDrivers (os três formatos que o build_base.py aceita):
//   ['risk', 'nota']                 -> { value_driver_id, note }
//   'risk'                           -> "<id>"
//   { id: 'risk', narrative: '...' } -> { id, narrative }
// history (qualquer ordem; sai ordenado do mais novo para o mais antigo):
//   ['test', at, envKey, 'pass'|'fail', 'lab'|'unknown']
//   ['tr', at, from|null, to, reason|null]
//   ['edit', at, [fields]]
// published / visibility: padrão true / 'shared'.
// pt: null  -> caso sem bloco `pt` (tradução pendente)
// ptStale   -> { source_version, source_updated_at } de uma versão anterior (tradução desatualizada)
// Artefatos de importação intencionais: aspas duplicadas ""x"" no inglês (o pt usa "x"), itens de
// objetivo tipo cabeçalho ("Test steps:") e "-", expected_outcome começando com "- ", URLs no texto.

const CASES = [
  // =============================================================== NGFW (8 + 1 não publicado)
  {
    key: 'ngfw-app-id-block', nodes: ['ngfw-ac-appid'], lifecycle: 'tested', version: 3, author: 1,
    created: '2026-01-14 13:20',
    prereqs: ['panos-fw'], industries: [],
    valueDrivers: [['risk', ''], ['tco', 'Replaces a separate proxy for application control.']],
    competitors: [['a', 'advantage', ''], ['b', 'parity', '']],
    docs: [
      { label: 'App-ID overview', url: 'https://docs.paloaltonetworks.com/pan-os/11-2/pan-os-admin/app-id', summary: 'How App-ID identifies applications and how to use them in policy.', audience: 'customer' },
      { label: 'App-ID demo checklist', url: 'https://docs.paloaltonetworks.com/best-practices', summary: 'Checklist to prepare the application control demonstration.', audience: 'internal' },
    ],
    notes: [],
    history: [
      ['test', '2026-06-18 15:05', 'lab-ref', 'pass'],
      ...signoff('2026-03-02 10:40', 'panos-112'),
    ],
    en: {
      name: 'App-ID: block unsanctioned applications',
      summary: 'Show that App-ID identifies and blocks unsanctioned applications regardless of port, protocol or evasive techniques.',
      description: 'The customer wants to prevent the use of unsanctioned applications (for example, remote access tools and personal file sharing) on the corporate network. This test uses App-ID in the security policy to allow sanctioned applications and block the rest.',
      objectives: [
        'Verify that App-ID identifies the application in the traffic log, not only the port.',
        'Demonstrate a security policy rule with action ""Deny"" that blocks an unsanctioned application category.',
        'Validate that sanctioned applications keep working after the rule is applied.',
      ],
      evaluation_metrics: ['Pass/Fail'],
      expected_outcome: 'Unsanctioned applications are blocked and logged with the correct application name; sanctioned applications are allowed.',
      how_to: '1) Create an application filter for the unsanctioned category.\n2) Add a security policy rule that denies the filter above the allow rules.\n3) From a test endpoint, open the unsanctioned application.\n4) Check Monitor > Logs > Traffic for the deny entries.',
    },
    pt: {
      name: 'App-ID: bloquear aplicações não autorizadas',
      summary: 'Mostrar que o App-ID identifica e bloqueia aplicações não autorizadas independentemente de porta, protocolo ou técnicas evasivas.',
      description: 'O cliente quer impedir o uso de aplicações não autorizadas (por exemplo, ferramentas de acesso remoto e compartilhamento pessoal de arquivos) na rede corporativa. Este teste usa App-ID na política de segurança para permitir as aplicações autorizadas e bloquear as demais.',
      objectives: [
        'Verificar que o App-ID identifica a aplicação no log de tráfego, e não apenas a porta.',
        'Demonstrar uma regra de política de segurança com ação "Deny" que bloqueia uma categoria de aplicações não autorizadas.',
        'Validar que as aplicações autorizadas continuam funcionando depois que a regra é aplicada.',
      ],
      expected_outcome: 'As aplicações não autorizadas são bloqueadas e registradas em log com o nome correto da aplicação; as aplicações autorizadas são permitidas.',
      how_to: '1) Criar um filtro de aplicações para a categoria não autorizada.\n2) Adicionar uma regra de política de segurança que nega o filtro acima das regras de permissão.\n3) A partir de um endpoint de teste, abrir a aplicação não autorizada.\n4) Verificar Monitor > Logs > Traffic para as entradas de negação.',
    },
  },
  {
    key: 'ngfw-app-id-ports', nodes: ['ngfw-ac-appid'], lifecycle: 'test-review', version: 3, author: 2,
    created: '2026-02-10 09:00',
    prereqs: ['panos-fw'], industries: [], valueDrivers: [], competitors: [],
    docs: [
      { label: 'Application-default service', url: 'https://docs.paloaltonetworks.com/pan-os/11-2/pan-os-admin/app-id/use-application-objects-in-policy', summary: 'Using the application-default service in security policy rules.', audience: 'customer' },
    ],
    notes: [],
    history: [
      ['edit', '2026-07-21 16:40', ['objectives', 'expected_outcome']],
      ['tr', '2026-06-30 11:15', 'reviewed', 'test-review', 'Needs updated screenshots'],
      ['tr', '2026-03-04 10:20', 'test-review', 'reviewed', null],
      ['tr', '2026-02-10 09:00', null, 'test-review', null],
    ],
    // Tradução feita sobre a versão 2 (antes da edição que trocou a porta 8080 -> 8443).
    ptStale: { source_version: 2, source_updated_at: '2026-06-30 11:15' },
    en: {
      name: 'App-ID: control applications on non-standard ports',
      summary: 'Verify that applications are identified and controlled when they run on non-standard ports.',
      description: 'Many applications can be moved to arbitrary ports to evade port-based rules. This test runs a known application on a non-standard port and checks that App-ID still identifies it and applies the policy.',
      objectives: [
        'Run SSH on TCP port 8443 and verify that it is identified as ssh.',
        'Use the application-default service so that ssh is only allowed on its standard port.',
      ],
      evaluation_metrics: ['Pass/Fail', 'Time to configure < 15 minutes'],
      expected_outcome: 'ssh on port 8443 is identified correctly and denied by the rule that uses application-default.',
      how_to: '',
    },
    pt: {
      name: 'App-ID: controlar aplicações em portas não padrão',
      summary: 'Verificar que as aplicações são identificadas e controladas quando executadas em portas não padrão.',
      description: 'Muitas aplicações podem ser movidas para portas arbitrárias para evadir regras baseadas em porta. Este teste executa uma aplicação conhecida em uma porta não padrão e verifica que o App-ID ainda a identifica e aplica a política.',
      objectives: [
        'Executar SSH na porta TCP 8080 e verificar que é identificado como ssh.',
        'Usar o serviço application-default para que ssh seja permitido apenas em sua porta padrão.',
      ],
      expected_outcome: 'O ssh na porta 8080 é identificado corretamente e negado pela regra que usa application-default.',
      how_to: '',
    },
  },
  {
    key: 'ngfw-aurl-phishing', nodes: ['ngfw-sia-url'], lifecycle: 'tested', version: 2, author: 1,
    created: '2026-01-20 14:00',
    prereqs: ['panos-fw', 'decrypt-cert'], industries: ['fsi', 'retail'],
    valueDrivers: [['risk', '']],
    competitors: [['a', 'advantage', ''], ['c', 'unknown', 'Not evaluated in the lab.']],
    docs: [
      { label: 'Advanced URL Filtering administration', url: 'https://docs.paloaltonetworks.com/advanced-url-filtering/administration', summary: 'Configure URL Filtering profiles and inline categorization.', audience: 'customer' },
    ],
    notes: [],
    history: [
      ...signoff('2026-04-09 16:10', 'panos-112'),
      ['tr', '2026-03-27 09:30', 'test-review', 'reviewed', 'Validated in lab'],
    ],
    en: {
      name: 'Advanced URL Filtering: block phishing categories',
      summary: 'Demonstrate inline categorization and blocking of phishing and newly registered domains.',
      description: 'Users receive links to credential-harvesting pages hosted on newly registered domains. This test enables Advanced URL Filtering with inline cloud analysis and blocks the ""phishing"", ""malware"" and ""newly-registered-domain"" categories.',
      objectives: [
        'Block access to URLs in the phishing category.',
        'Demonstrate inline cloud analysis on a page that is not yet categorized.',
        'Show the block page presented to the user.',
        'Review the URL Filtering log entries.',
      ],
      evaluation_metrics: ['Pass/Fail', 'Detection rate on test URLs'],
      expected_outcome: 'Phishing URLs are blocked, the user sees the block page and each attempt is logged with its category.',
      how_to: '1) Create a URL Filtering profile with phishing, malware and newly-registered-domain set to block.\n2) Enable inline cloud analysis in the profile.\n3) Attach the profile to the outbound security policy rule.\n4) Browse to the test URLs from the test endpoint.\n5) Review Monitor > Logs > URL Filtering.',
    },
    pt: {
      name: 'Advanced URL Filtering: bloquear categorias de phishing',
      summary: 'Demonstrar a categorização inline e o bloqueio de phishing e de domínios recém-registrados.',
      description: 'Os usuários recebem links para páginas de coleta de credenciais hospedadas em domínios recém-registrados. Este teste habilita o Advanced URL Filtering com análise inline na nuvem e bloqueia as categorias "phishing", "malware" e "newly-registered-domain".',
      objectives: [
        'Bloquear o acesso a URLs da categoria phishing.',
        'Demonstrar a análise inline na nuvem em uma página que ainda não foi categorizada.',
        'Mostrar a página de bloqueio apresentada ao usuário.',
        'Revisar as entradas de log de URL Filtering.',
      ],
      expected_outcome: 'As URLs de phishing são bloqueadas, o usuário vê a página de bloqueio e cada tentativa é registrada em log com sua categoria.',
      how_to: '1) Criar um perfil de URL Filtering com phishing, malware e newly-registered-domain configurados como block.\n2) Habilitar a análise inline na nuvem no perfil.\n3) Anexar o perfil à regra de política de segurança de saída.\n4) Navegar até as URLs de teste a partir do endpoint de teste.\n5) Revisar Monitor > Logs > URL Filtering.',
    },
  },
  {
    key: 'ngfw-awf-sandbox', nodes: ['ngfw-sia-atp'], lifecycle: 'tested', version: 2, author: 3,
    created: '2026-02-03 11:45',
    prereqs: [], industries: [], valueDrivers: [],
    competitors: [['b', 'advantage', ''], ['d', 'parity', '']],
    docs: [
      { label: 'Advanced WildFire administration', url: 'https://docs.paloaltonetworks.com/advanced-wildfire/administration', summary: 'File forwarding, verdicts and test files.', audience: 'customer' },
    ],
    notes: [],
    history: [...signoff('2026-04-22 14:25', 'lab-ref')],
    en: {
      name: 'Advanced WildFire: detect unknown malware in sandbox',
      summary: 'Show that unknown files are analyzed in the sandbox and that a verdict and protection are delivered automatically.',
      description: 'The firewall forwards unknown files seen in allowed traffic to Advanced WildFire. The test downloads benign test samples and a WildFire test file to confirm forwarding, verdict and signature distribution.',
      objectives: [
        'Download the WildFire test file described at https://docs.paloaltonetworks.com/advanced-wildfire/administration/verify-wildfire-submissions and verify that it receives a malicious verdict.',
        'Show the WildFire analysis report for the sample.',
      ],
      evaluation_metrics: ['Pass/Fail', 'Time to verdict'],
      expected_outcome: 'The test file is forwarded, receives a malicious verdict and a subsequent download is blocked.',
      how_to: '',
    },
    pt: {
      name: 'Advanced WildFire: detectar malware desconhecido em sandbox',
      summary: 'Mostrar que arquivos desconhecidos são analisados na sandbox e que um veredito e a proteção são entregues automaticamente.',
      description: 'O firewall encaminha para o Advanced WildFire os arquivos desconhecidos vistos no tráfego permitido. O teste baixa amostras de teste benignas e um arquivo de teste do WildFire para confirmar o encaminhamento, o veredito e a distribuição de assinaturas.',
      objectives: [
        'Baixar o arquivo de teste do WildFire descrito em https://docs.paloaltonetworks.com/advanced-wildfire/administration/verify-wildfire-submissions e verificar que ele recebe um veredito malicious.',
        'Mostrar o relatório de análise do WildFire para a amostra.',
      ],
      expected_outcome: 'O arquivo de teste é encaminhado, recebe um veredito malicious e um download posterior é bloqueado.',
      how_to: '',
    },
  },
  {
    key: 'ngfw-dns-dga', nodes: ['ngfw-sia-atp'], lifecycle: 'tested', version: 1, author: 2,
    created: '2026-02-17 10:10',
    prereqs: ['panos-fw', 'log-forwarding'], industries: [],
    valueDrivers: [['risk', '']],
    competitors: [['a', 'advantage', '']],
    docs: [
      { label: 'Advanced DNS Security administration', url: 'https://docs.paloaltonetworks.com/dns-security/administration', summary: 'DNS Security categories, sinkhole and logging.', audience: 'customer' },
      { label: 'DNS test domains', url: 'https://docs.paloaltonetworks.com/dns-security/administration/test-connectivity', summary: 'Test domains used to validate each detection category.', audience: 'internal' },
    ],
    notes: [],
    history: [...signoff('2026-05-06 13:50', 'panos-112')],
    en: {
      name: 'Advanced DNS Security: detect DGA and DNS tunneling',
      summary: 'Demonstrate detection and sinkholing of DGA domains and DNS tunneling attempts.',
      description: 'Malware often uses algorithmically generated domains and DNS tunneling for command and control. This test replays DGA lookups and a DNS tunneling tool from a lab host.',
      objectives: [
        'Detect lookups to DGA domains.',
        'Detect DNS tunneling traffic.',
        'Sinkhole malicious domains and identify the infected host.',
        'Forward DNS Security logs to Strata Logging Service.',
        'Review the results in the threat log.',
      ],
      evaluation_metrics: ['Pass/Fail', 'MTTD'],
      expected_outcome: 'DGA and tunneling queries are detected, sinkholed and attributed to the source host.',
      how_to: '',
    },
    pt: {
      name: 'Advanced DNS Security: detectar DGA e tunelamento via DNS',
      summary: 'Demonstrar a detecção e o sinkhole de domínios DGA e de tentativas de tunelamento via DNS.',
      description: 'Malware frequentemente usa domínios gerados por algoritmo e tunelamento via DNS para comando e controle. Este teste reproduz consultas DGA e uma ferramenta de tunelamento via DNS a partir de um host do laboratório.',
      objectives: [
        'Detectar consultas a domínios DGA.',
        'Detectar tráfego de tunelamento via DNS.',
        'Aplicar sinkhole aos domínios maliciosos e identificar o host infectado.',
        'Encaminhar os logs de DNS Security ao Strata Logging Service.',
        'Revisar os resultados no log de ameaças.',
      ],
      expected_outcome: 'As consultas DGA e de tunelamento são detectadas, direcionadas ao sinkhole e atribuídas ao host de origem.',
      how_to: '',
    },
  },
  {
    key: 'ngfw-decryption', nodes: ['ngfw-sia-url', 'ngfw-ac'], lifecycle: 'tested', version: 5, author: 1,
    created: '2026-01-08 15:30',
    prereqs: ['panos-fw', 'decrypt-cert'], industries: ['fsi', 'healthcare'],
    valueDrivers: [['risk', ''], ['ux', 'Decryption exceptions preserve privacy for personal browsing.']],
    competitors: [['b', 'parity', ''], ['c', 'advantage', '']],
    docs: [
      { label: 'Decryption overview', url: 'https://docs.paloaltonetworks.com/pan-os/11-2/pan-os-admin/decryption', summary: 'Decryption concepts, policy and profiles.', audience: 'customer' },
      { label: 'Decryption exclusions', url: 'https://docs.paloaltonetworks.com/pan-os/11-2/pan-os-admin/decryption/decryption-exclusions', summary: 'Predefined and custom exclusions from decryption.', audience: 'customer' },
      { label: 'Decryption sizing notes', url: 'https://docs.paloaltonetworks.com/best-practices', summary: 'Sizing considerations before enabling decryption in a PoV.', audience: 'internal' },
    ],
    notes: [
      {
        at: '2026-05-20 09:15',
        body: 'Use the predefined exclusion list before creating custom exclusions.',
        body_pt: 'Usar a lista de exclusão predefinida antes de criar exclusões personalizadas.',
      },
    ],
    history: [
      ...signoff('2026-05-28 11:00', 'panos-112'),
      ['edit', '2026-05-19 17:45', ['how_to']],
      ['tr', '2026-04-30 10:05', 'test-review', 'reviewed', 'Validated in lab'],
    ],
    en: {
      name: 'SSL/TLS decryption with category exceptions',
      summary: 'Decrypt outbound TLS traffic for inspection while excluding sensitive categories such as financial services and health.',
      description: 'Most threats hide in encrypted traffic. The customer requires decryption for inspection but must not decrypt personal banking and health sites. This test configures forward proxy decryption with category-based exceptions.',
      objectives: [
        'Decrypt outbound HTTPS traffic with SSL Forward Proxy.',
        'Exclude the financial-services and health-and-medicine categories from decryption.',
        'Verify that threats inside decrypted sessions are detected.',
        'Show the decryption log with decrypted and excluded sessions.',
        'Confirm that applications that use certificate pinning are handled by the exclusion list.',
        'Measure the impact on page load time.',
      ],
      evaluation_metrics: ['Pass/Fail', 'Page load time increase < 10%'],
      expected_outcome: 'Traffic is decrypted and inspected except for the excluded categories; excluded sessions appear as no-decrypt in the logs.',
      how_to: '1) Import or generate the forward trust certificate and deploy it to the test endpoints.\n2) Create a decryption policy rule with action decrypt for the outbound zone.\n3) Add a no-decrypt rule above it for the excluded categories.\n4) Browse to test sites in each category and download the EICAR file over HTTPS.\n5) Review the decryption and threat logs.',
    },
    pt: {
      name: 'Descriptografia SSL/TLS com exceções por categoria',
      summary: 'Descriptografar o tráfego TLS de saída para inspeção, excluindo categorias sensíveis como serviços financeiros e saúde.',
      description: 'A maioria das ameaças se esconde no tráfego criptografado. O cliente exige descriptografia para inspeção, mas não pode descriptografar sites bancários pessoais e de saúde. Este teste configura a descriptografia por forward proxy com exceções baseadas em categoria.',
      objectives: [
        'Descriptografar o tráfego HTTPS de saída com SSL Forward Proxy.',
        'Excluir as categorias financial-services e health-and-medicine da descriptografia.',
        'Verificar que ameaças dentro de sessões descriptografadas são detectadas.',
        'Mostrar o log de descriptografia com as sessões descriptografadas e excluídas.',
        'Confirmar que as aplicações que usam certificate pinning são tratadas pela lista de exclusão.',
        'Medir o impacto no tempo de carregamento das páginas.',
      ],
      expected_outcome: 'O tráfego é descriptografado e inspecionado, exceto nas categorias excluídas; as sessões excluídas aparecem como no-decrypt nos logs.',
      how_to: '1) Importar ou gerar o certificado forward trust e implantá-lo nos endpoints de teste.\n2) Criar uma regra de política de descriptografia com ação decrypt para a zona de saída.\n3) Adicionar uma regra no-decrypt acima dela para as categorias excluídas.\n4) Navegar até sites de teste de cada categoria e baixar o arquivo EICAR via HTTPS.\n5) Revisar os logs de descriptografia e de ameaças.',
    },
  },
  {
    key: 'ngfw-dc-segmentation', nodes: ['ngfw-dcs'], lifecycle: 'tested', version: 2, author: 3,
    created: '2026-03-11 08:50',
    prereqs: [], industries: ['manufacturing'],
    valueDrivers: ['risk', 'tco'],
    competitors: [],
    docs: [],
    notes: [],
    history: [...signoff('2026-06-03 15:40', 'lab-ref', 'pass', 'unknown')],
    en: {
      name: 'Zone-based segmentation with User-ID policies',
      summary: 'Segment data center tiers into zones and restrict access by user group with User-ID.',
      description: 'The data center has a flat network where every server can reach every other server. This test places the web, application and database tiers in separate zones and allows only the required applications between them, with administrative access limited to an IT group.',
      objectives: [
        'Create zones for the web, application and database tiers.',
        'Allow only the required applications between tiers.',
        'Restrict SSH and RDP to the IT administrators group using User-ID.',
      ],
      evaluation_metrics: ['Pass/Fail'],
      expected_outcome: 'Only allowed applications cross zone boundaries and administrative access is limited to the IT group.',
      how_to: '',
    },
    pt: {
      name: 'Segmentação baseada em zonas com políticas User-ID',
      summary: 'Segmentar as camadas do data center em zonas e restringir o acesso por grupo de usuários com User-ID.',
      description: 'O data center tem uma rede plana em que todo servidor alcança qualquer outro servidor. Este teste coloca as camadas web, aplicação e banco de dados em zonas separadas e permite apenas as aplicações necessárias entre elas, com acesso administrativo limitado a um grupo de TI.',
      objectives: [
        'Criar zonas para as camadas web, aplicação e banco de dados.',
        'Permitir apenas as aplicações necessárias entre as camadas.',
        'Restringir SSH e RDP ao grupo de administradores de TI usando User-ID.',
      ],
      expected_outcome: 'Somente as aplicações permitidas cruzam os limites entre zonas e o acesso administrativo fica limitado ao grupo de TI.',
      how_to: '',
    },
  },
  {
    key: 'ngfw-dc-exploit', nodes: ['ngfw-dcs', 'ngfw-sia-atp'], lifecycle: 'tested', version: 1, author: 2,
    created: '2026-03-19 13:35',
    prereqs: ['panos-fw'], industries: [], valueDrivers: [],
    competitors: [['a', 'advantage', ''], ['b', 'advantage', ''], ['d', 'unknown', '']],
    docs: [
      { label: 'Advanced Threat Prevention administration', url: 'https://docs.paloaltonetworks.com/advanced-threat-prevention/administration', summary: 'Vulnerability protection profiles and threat logs.', audience: 'customer' },
    ],
    notes: [],
    history: [...signoff('2026-06-10 10:20', 'panos-112')],
    en: {
      name: 'Advanced Threat Prevention: block exploit attempts against data center servers',
      summary: 'Show that vulnerability protection blocks known exploit attempts against internal servers.',
      description: 'A lab attacker host launches exploits for public CVEs against a vulnerable test server placed in the data center zone. Advanced Threat Prevention is applied to the inter-zone rules.',
      objectives: ['Block exploit attempts for at least five public CVEs.'],
      evaluation_metrics: ['Pass/Fail', 'Number of exploits blocked'],
      expected_outcome: 'All exploit attempts are blocked and logged with the matching threat ID and CVE.',
      how_to: '',
    },
    pt: {
      name: 'Advanced Threat Prevention: bloquear tentativas de exploit contra servidores do data center',
      summary: 'Mostrar que a proteção contra vulnerabilidades bloqueia tentativas conhecidas de exploit contra servidores internos.',
      description: 'Um host atacante do laboratório lança exploits para CVEs públicas contra um servidor de teste vulnerável posicionado na zona do data center. O Advanced Threat Prevention é aplicado às regras entre zonas.',
      objectives: ['Bloquear tentativas de exploit para pelo menos cinco CVEs públicas.'],
      expected_outcome: 'Todas as tentativas de exploit são bloqueadas e registradas em log com o threat ID e a CVE correspondentes.',
      how_to: '',
    },
  },

  {
    // Caso extra: published false (não publicado), de resto completo.
    key: 'ngfw-atp-c2', nodes: ['ngfw-sia-atp'], lifecycle: 'test-review', version: 1, author: 3,
    published: false,
    created: '2026-08-18 10:00',
    prereqs: ['panos-fw'], industries: [],
    valueDrivers: [['risk', '']],
    competitors: [['c', 'advantage', '']],
    docs: [
      { label: 'Advanced Threat Prevention administration', url: 'https://docs.paloaltonetworks.com/advanced-threat-prevention/administration', summary: 'Inline cloud analysis for command-and-control traffic.', audience: 'customer' },
    ],
    notes: [],
    history: [['tr', '2026-08-18 10:00', null, 'test-review', null]],
    en: {
      name: 'Advanced Threat Prevention: detect command-and-control traffic',
      summary: 'Show inline detection of command-and-control traffic from an infected lab host, including unknown C2 patterns.',
      description: 'An infected host sends beacons to an external server over HTTP and over custom protocols. This test runs a C2 simulation framework on a lab host and checks that Advanced Threat Prevention detects and blocks the traffic inline.',
      objectives: [
        'Detect C2 beacons sent over HTTP.',
        'Detect C2 traffic that uses a custom protocol on a non-standard port.',
        'Identify the infected host in the threat log.',
      ],
      evaluation_metrics: ['Pass/Fail', 'MTTD'],
      expected_outcome: 'C2 sessions are blocked and the infected host is identified in the threat log.',
      how_to: '',
    },
    pt: {
      name: 'Advanced Threat Prevention: detectar tráfego de comando e controle',
      summary: 'Mostrar a detecção inline de tráfego de comando e controle a partir de um host infectado do laboratório, incluindo padrões de C2 desconhecidos.',
      description: 'Um host infectado envia beacons para um servidor externo via HTTP e via protocolos personalizados. Este teste executa um framework de simulação de C2 em um host do laboratório e verifica que o Advanced Threat Prevention detecta e bloqueia o tráfego inline.',
      objectives: [
        'Detectar beacons de C2 enviados via HTTP.',
        'Detectar tráfego de C2 que usa um protocolo personalizado em uma porta não padrão.',
        'Identificar o host infectado no log de ameaças.',
      ],
      expected_outcome: 'As sessões de C2 são bloqueadas e o host infectado é identificado no log de ameaças.',
      how_to: '',
    },
  },

  // =============================================================== SASE (6)
  {
    key: 'sase-prisma-access-gp', nodes: ['sase-sra'], lifecycle: 'tested', version: 2, author: 1,
    created: '2026-02-24 12:00',
    prereqs: ['gp-endpoint'], industries: ['retail'],
    valueDrivers: [['ux', ''], ['tco', '']],
    competitors: [['a', 'parity', ''], ['b', 'advantage', '']],
    docs: [
      { label: 'Prisma Access administration', url: 'https://docs.paloaltonetworks.com/prisma-access/administration', summary: 'Onboarding mobile users and applying security policy.', audience: 'customer' },
      { label: 'GlobalProtect app', url: 'https://docs.paloaltonetworks.com/globalprotect', summary: 'GlobalProtect app installation and connection methods.', audience: 'customer' },
    ],
    notes: [],
    history: [
      ...signoff('2026-05-14 14:30', 'prisma-access'),
      ['tr', '2026-04-28 09:00', 'test-review', 'reviewed', null],
    ],
    en: {
      name: 'Prisma Access: remote user access with GlobalProtect',
      summary: 'Connect remote users to Prisma Access with the GlobalProtect app and apply a consistent security policy.',
      description: 'Remote users connect today through a legacy VPN concentrator. This test onboards users to Prisma Access with GlobalProtect, authenticates them with SSO and applies the same security policy used on premises.',
      objectives: [
        'Onboard a test user group to Prisma Access for mobile users.',
        'Authenticate users with SSO and MFA.',
        'Apply URL Filtering and Threat Prevention to remote user traffic.',
        'Verify that the user connects to the closest location.',
      ],
      evaluation_metrics: ['Pass/Fail', 'Time to onboard < 1 hour'],
      expected_outcome: 'Remote users connect with SSO, their traffic is inspected and the logs show the user identity and location.',
      how_to: '',
    },
    pt: {
      name: 'Prisma Access: acesso de usuários remotos com GlobalProtect',
      summary: 'Conectar usuários remotos ao Prisma Access com o aplicativo GlobalProtect e aplicar uma política de segurança consistente.',
      description: 'Hoje os usuários remotos se conectam por um concentrador VPN legado. Este teste faz o onboarding dos usuários no Prisma Access com GlobalProtect, autentica-os com SSO e aplica a mesma política de segurança usada on-premises.',
      objectives: [
        'Fazer o onboarding de um grupo de usuários de teste no Prisma Access para usuários móveis.',
        'Autenticar os usuários com SSO e MFA.',
        'Aplicar URL Filtering e Threat Prevention ao tráfego dos usuários remotos.',
        'Verificar que o usuário se conecta à localização mais próxima.',
      ],
      expected_outcome: 'Os usuários remotos se conectam com SSO, seu tráfego é inspecionado e os logs mostram a identidade e a localização do usuário.',
      how_to: '',
    },
  },
  {
    key: 'sase-ztna-private-app', nodes: ['sase-sra-ztna'], lifecycle: 'tested', version: 1, author: 2,
    created: '2026-03-05 10:30',
    prereqs: ['gp-endpoint'], industries: [],
    valueDrivers: [['risk', '']],
    competitors: [['c', 'advantage', '']],
    docs: [
      { label: 'ZTNA Connector', url: 'https://docs.paloaltonetworks.com/prisma-access/administration/ztna-connector', summary: 'Deploying the ZTNA Connector and publishing private applications.', audience: 'customer' },
    ],
    notes: [],
    history: [...signoff('2026-05-21 16:15', 'prisma-access')],
    en: {
      name: 'ZTNA to private application',
      summary: 'Provide least-privilege access to a private web application without exposing the network.',
      description: 'A private web application hosted in the data center must be reachable only by an authorized group. This test publishes the application through Prisma Access with a ZTNA Connector and grants access by user group.',
      objectives: [
        'Deploy a ZTNA Connector next to the private application.',
        'Allow access only to members of the authorized group.',
        'Verify that other hosts on the same subnet are not reachable.',
      ],
      evaluation_metrics: ['Pass/Fail'],
      expected_outcome: 'Authorized users reach the application; unauthorized users and other hosts are blocked.',
      how_to: '1) Reserve the ZTNA lab VM as described in https://intranet.example.com/wiki/pov-lab.\n2) Deploy the ZTNA Connector VM in the application network.\n3) Add the application as a target in Strata Cloud Manager.\n4) Create a security rule that allows the authorized group to reach the application.\n5) Test access with an authorized and an unauthorized user.',
    },
    pt: {
      name: 'ZTNA para aplicação privada',
      summary: 'Fornecer acesso de menor privilégio a uma aplicação web privada sem expor a rede.',
      description: 'Uma aplicação web privada hospedada no data center deve ser acessível apenas por um grupo autorizado. Este teste publica a aplicação por meio do Prisma Access com um ZTNA Connector e concede acesso por grupo de usuários.',
      objectives: [
        'Implantar um ZTNA Connector ao lado da aplicação privada.',
        'Permitir o acesso apenas aos membros do grupo autorizado.',
        'Verificar que outros hosts da mesma sub-rede não são alcançáveis.',
      ],
      expected_outcome: 'Os usuários autorizados alcançam a aplicação; usuários não autorizados e outros hosts são bloqueados.',
      how_to: '1) Reservar a VM de laboratório de ZTNA conforme descrito em https://intranet.example.com/wiki/pov-lab.\n2) Implantar a VM do ZTNA Connector na rede da aplicação.\n3) Adicionar a aplicação como destino no Strata Cloud Manager.\n4) Criar uma regra de segurança que permite ao grupo autorizado alcançar a aplicação.\n5) Testar o acesso com um usuário autorizado e com um não autorizado.',
    },
  },
  {
    key: 'sase-adem', nodes: ['sase-dem'], lifecycle: 'tested', version: 3, author: 3,
    created: '2026-02-12 15:15',
    prereqs: ['gp-endpoint'], industries: [],
    valueDrivers: [['ux', 'Faster troubleshooting for the help desk.']],
    competitors: [['d', 'unknown', '']],
    docs: [
      { label: 'Autonomous DEM', url: 'https://docs.paloaltonetworks.com/autonomous-dem', summary: 'Synthetic tests, experience score and segment analysis.', audience: 'customer' },
    ],
    notes: [],
    history: [
      ...signoff('2026-06-24 10:45', 'prisma-access'),
      ['tr', '2026-06-11 13:20', 'test-review', 'reviewed', 'Scope confirmed with product team'],
    ],
    en: {
      name: 'ADEM: monitor user experience for SaaS applications',
      summary: 'Use ADEM to measure the end-to-end experience of remote users and isolate the segment that causes degradation.',
      description: 'The help desk receives complaints about slow video calls but cannot tell whether the problem is the device, the home network, the ISP or the application. This test enables ADEM synthetic tests and introduces latency on the lab Wi-Fi.',
      objectives: [
        'Enable synthetic application tests for two SaaS applications.',
        'Identify the degraded segment after introducing latency.',
      ],
      evaluation_metrics: ['MTTR', 'Pass/Fail'],
      expected_outcome: 'ADEM shows the drop in the experience score and points to the local Wi-Fi segment as the cause.',
      how_to: '',
    },
    pt: {
      name: 'ADEM: monitorar a experiência do usuário em aplicações SaaS',
      summary: 'Usar o ADEM para medir a experiência de ponta a ponta dos usuários remotos e isolar o segmento que causa a degradação.',
      description: 'O help desk recebe reclamações sobre chamadas de vídeo lentas, mas não consegue dizer se o problema está no dispositivo, na rede doméstica, no ISP ou na aplicação. Este teste habilita os testes sintéticos do ADEM e introduz latência no Wi-Fi do laboratório.',
      objectives: [
        'Habilitar testes sintéticos de aplicação para duas aplicações SaaS.',
        'Identificar o segmento degradado após introduzir latência.',
      ],
      expected_outcome: 'O ADEM mostra a queda no experience score e aponta o segmento de Wi-Fi local como a causa.',
      how_to: '',
    },
  },
  {
    key: 'sase-dlp-upload', nodes: ['sase-sra-data'], lifecycle: 'test-review', version: 2, author: 1,
    created: '2026-04-02 11:25',
    prereqs: ['gp-endpoint', 'decrypt-cert'], industries: ['fsi', 'healthcare'],
    valueDrivers: [['risk', '']],
    competitors: [['a', 'advantage', ''], ['b', 'unknown', '']],
    docs: [
      { label: 'Enterprise DLP administration', url: 'https://docs.paloaltonetworks.com/enterprise-dlp/administration', summary: 'Data patterns, data profiles and DLP incidents.', audience: 'customer' },
      { label: 'Sample documents for DLP tests', url: 'https://docs.paloaltonetworks.com/enterprise-dlp/administration/data-patterns', summary: 'Which predefined data patterns to use with synthetic test documents.', audience: 'internal' },
    ],
    notes: [],
    history: [
      ['tr', '2026-07-08 14:10', 'reviewed', 'test-review', 'Needs updated screenshots'],
      ['tr', '2026-05-25 10:00', 'test-review', 'reviewed', null],
      ['tr', '2026-04-02 11:25', null, 'test-review', null],
    ],
    en: {
      name: 'Enterprise DLP: block sensitive file upload',
      summary: 'Detect and block uploads of files that contain sensitive data to unsanctioned cloud storage.',
      description: 'The customer must prevent documents with credit card numbers and national ID numbers from leaving through personal cloud storage. This test applies an Enterprise DLP profile to the web traffic of Prisma Access users.',
      objectives: [
        'Detect credit card numbers in an uploaded document.',
        'Block the upload to a personal cloud storage application.',
        'Show the DLP incident with the matched data pattern.',
      ],
      evaluation_metrics: ['Pass/Fail', 'False positives'],
      expected_outcome: 'The upload is blocked, the user is notified and a DLP incident is created with the matched pattern.',
      how_to: '',
    },
    pt: {
      name: 'Enterprise DLP: bloquear o upload de arquivos sensíveis',
      summary: 'Detectar e bloquear uploads de arquivos que contêm dados sensíveis para armazenamento em nuvem não autorizado.',
      description: 'O cliente precisa impedir que documentos com números de cartão de crédito e números de documento de identidade nacional saiam por armazenamento pessoal em nuvem. Este teste aplica um perfil de Enterprise DLP ao tráfego web dos usuários do Prisma Access.',
      objectives: [
        'Detectar números de cartão de crédito em um documento enviado.',
        'Bloquear o upload para uma aplicação pessoal de armazenamento em nuvem.',
        'Mostrar o incidente de DLP com o padrão de dados correspondente.',
      ],
      expected_outcome: 'O upload é bloqueado, o usuário é notificado e um incidente de DLP é criado com o padrão correspondente.',
      how_to: '',
    },
  },
  {
    // Caso de borda: description "-" e expected_outcome vazio.
    key: 'sase-ai-access', nodes: ['sase-sra-data'], lifecycle: 'draft', version: 2, author: 2,
    created: '2026-08-04 16:00',
    prereqs: [], industries: [], valueDrivers: [], competitors: [], docs: [], notes: [],
    history: [['edit', '2026-08-12 09:40', ['objectives']]],
    en: {
      name: 'AI Access Security: control GenAI app usage',
      summary: 'Discover the GenAI applications in use and apply controls for sanctioned, tolerated and unsanctioned applications.',
      description: '-',
      objectives: [
        'Discover the GenAI applications used in the last 7 days.',
        'Block uploads to unsanctioned GenAI applications.',
      ],
      evaluation_metrics: ['Pass/Fail'],
      expected_outcome: '',
      how_to: '',
    },
    pt: {
      name: 'AI Access Security: controlar o uso de aplicações de GenAI',
      summary: 'Descobrir as aplicações de GenAI em uso e aplicar controles para aplicações autorizadas, toleradas e não autorizadas.',
      description: '-',
      objectives: [
        'Descobrir as aplicações de GenAI usadas nos últimos 7 dias.',
        'Bloquear uploads para aplicações de GenAI não autorizadas.',
      ],
      expected_outcome: '',
      how_to: '',
    },
  },
  {
    // Único caso testado com resultado "fail" (reteste depois de um pass).
    key: 'sase-sdwan-path', nodes: ['sase-branch', 'sase-dem'], lifecycle: 'tested', version: 4, author: 3,
    created: '2026-01-27 09:20',
    prereqs: [], industries: ['retail'],
    valueDrivers: [['ux', ''], ['efficiency', '']],
    competitors: [['b', 'parity', ''], ['c', 'parity', '']],
    docs: [
      { label: 'Prisma SD-WAN administration', url: 'https://docs.paloaltonetworks.com/prisma-sd-wan/administration', summary: 'Path policies, application SLAs and link monitoring.', audience: 'customer' },
    ],
    notes: [
      {
        at: '2026-08-27 17:05',
        body: 'Retest failed after the link simulator upgrade; failover took about 6 seconds. Rerun scheduled.',
        body_pt: 'O reteste falhou após a atualização do simulador de links; o failover levou cerca de 6 segundos. Nova execução agendada.',
      },
    ],
    history: [
      ['test', '2026-08-27 16:30', 'lab-ref', 'fail'],
      ...signoff('2026-05-12 15:30', 'prisma-access'),
      ['tr', '2026-04-15 11:10', 'test-review', 'reviewed', 'Validated in lab'],
    ],
    en: {
      name: 'Prisma SD-WAN: application-based path selection',
      summary: 'Steer business-critical applications to the best-performing WAN link and fail over when a link degrades.',
      description: 'A branch has an MPLS link and a broadband internet link. The customer wants voice and video to use the link with the lowest latency and to fail over automatically without dropping calls.',
      objectives: [
        'Define path policies for voice, video and bulk traffic.',
        'Introduce packet loss on the primary link.',
        'Verify that voice traffic moves to the secondary link within the SLA.',
        'Show application performance per link in the dashboard.',
      ],
      evaluation_metrics: ['Failover time < 3 seconds', 'Pass/Fail'],
      expected_outcome: 'Voice and video fail over to the healthy link within the SLA without dropped calls.',
      how_to: '',
    },
    pt: {
      name: 'Prisma SD-WAN: seleção de caminho baseada em aplicação',
      summary: 'Direcionar aplicações críticas para o negócio ao link WAN de melhor desempenho e fazer failover quando um link se degrada.',
      description: 'Uma filial tem um link MPLS e um link de internet banda larga. O cliente quer que voz e vídeo usem o link com a menor latência e façam failover automaticamente sem derrubar chamadas.',
      objectives: [
        'Definir políticas de caminho para tráfego de voz, vídeo e em massa.',
        'Introduzir perda de pacotes no link primário.',
        'Verificar que o tráfego de voz migra para o link secundário dentro do SLA.',
        'Mostrar o desempenho das aplicações por link no dashboard.',
      ],
      expected_outcome: 'Voz e vídeo fazem failover para o link saudável dentro do SLA, sem queda de chamadas.',
      how_to: '',
    },
  },

  // =============================================================== Cloud (5)
  {
    key: 'cloud-cspm-bucket', nodes: ['cloud-posture-misconfig'], lifecycle: 'tested', version: 1, author: 1,
    created: '2026-03-23 10:00',
    prereqs: ['cloud-account'], industries: ['healthcare'],
    valueDrivers: [['risk', '']],
    competitors: [['a', 'parity', ''], ['d', 'advantage', '']],
    docs: [
      { label: 'Cloud posture management', url: 'https://docs.paloaltonetworks.com/cortex/cortex-cloud', summary: 'Onboarding cloud accounts and reviewing posture findings.', audience: 'customer' },
    ],
    notes: [],
    history: [...signoff('2026-06-16 09:30', 'unspecified')],
    en: {
      name: 'CSPM: detect public storage bucket',
      summary: 'Detect a storage bucket exposed to the internet and show the alert with remediation steps.',
      description: 'A misconfigured storage bucket with public read access is a common cause of data exposure. This test onboards a read-only cloud account, creates a public bucket and checks detection and remediation guidance.',
      objectives: [
        'Onboard a cloud account with read-only permissions.',
        'Test steps:',
        'Create a storage bucket with public read access.',
        'Wait for the next scan and open the alert.',
        'Show the remediation steps in the alert.',
      ],
      evaluation_metrics: ['MTTD', 'Pass/Fail'],
      expected_outcome: 'An alert is raised for the public bucket with severity, affected resource and remediation steps.',
      how_to: '',
    },
    pt: {
      name: 'CSPM: detectar bucket de armazenamento público',
      summary: 'Detectar um bucket de armazenamento exposto à Internet e mostrar o alerta com os passos de remediação.',
      description: 'Um bucket de armazenamento mal configurado com acesso público de leitura é uma causa comum de exposição de dados. Este teste faz o onboarding de uma conta de nuvem somente leitura, cria um bucket público e verifica a detecção e as orientações de remediação.',
      objectives: [
        'Fazer o onboarding de uma conta de nuvem com permissões somente leitura.',
        'Passos do teste:',
        'Criar um bucket de armazenamento com acesso público de leitura.',
        'Aguardar a próxima varredura e abrir o alerta.',
        'Mostrar os passos de remediação no alerta.',
      ],
      expected_outcome: 'Um alerta é gerado para o bucket público com severidade, recurso afetado e passos de remediação.',
      how_to: '',
    },
  },
  {
    key: 'cloud-ciem-permissions', nodes: ['cloud-posture'], lifecycle: 'reviewed', version: 2, author: 2,
    created: '2026-04-14 13:45',
    prereqs: ['cloud-account'], industries: [],
    valueDrivers: [['risk', '']],
    competitors: [], docs: [], notes: [],
    history: [
      ['tr', '2026-07-02 15:00', 'test-review', 'reviewed', 'Steps reviewed; ready for lab'],
      ['tr', '2026-04-14 13:45', null, 'test-review', null],
    ],
    en: {
      name: 'CIEM: identify over-privileged cloud identities',
      summary: 'Find identities with unused or excessive permissions and suggest least-privilege policies.',
      description: 'Cloud identities accumulate permissions over time. This test reviews the effective permissions of users and roles in the onboarded account and highlights unused permissions.',
      objectives: [
        'List the identities with administrative permissions.',
        'Show unused permissions over the last 90 days.',
        '-',
      ],
      evaluation_metrics: ['Pass/Fail'],
      expected_outcome: 'Over-privileged identities are listed with a recommended least-privilege policy.',
      how_to: '',
    },
    pt: {
      name: 'CIEM: identificar identidades de nuvem com privilégios excessivos',
      summary: 'Encontrar identidades com permissões não usadas ou excessivas e sugerir políticas de menor privilégio.',
      description: 'As identidades de nuvem acumulam permissões ao longo do tempo. Este teste revisa as permissões efetivas de usuários e roles na conta que passou pelo onboarding e destaca as permissões não usadas.',
      objectives: [
        'Listar as identidades com permissões administrativas.',
        'Mostrar as permissões não usadas nos últimos 90 dias.',
        '-',
      ],
      expected_outcome: 'As identidades com privilégios excessivos são listadas com uma política de menor privilégio recomendada.',
      how_to: '',
    },
  },
  {
    key: 'cloud-iac-ci', nodes: ['cloud-c2c', 'cloud-posture'], lifecycle: 'tested', version: 3, author: 3,
    created: '2026-02-26 14:20',
    prereqs: [], industries: [],
    valueDrivers: [['efficiency', 'Fixing issues before deployment reduces rework.']],
    competitors: [['b', 'advantage', ''], ['c', 'unknown', '']],
    docs: [
      { label: 'IaC scanning', url: 'https://docs.paloaltonetworks.com/cortex/cortex-cloud/application-security', summary: 'Scanning infrastructure as code in repositories and pipelines.', audience: 'customer' },
      { label: 'CI integration notes', url: 'https://docs.paloaltonetworks.com/cortex/cortex-cloud/application-security/ci-cd', summary: 'Pipeline snippets used in the lab repository.', audience: 'internal' },
    ],
    notes: [],
    history: [
      ...signoff('2026-07-15 11:35', 'unspecified'),
      ['edit', '2026-07-01 10:05', ['node_ids']],
    ],
    en: {
      name: 'IaC scanning in CI pipeline',
      summary: 'Scan Terraform templates in the CI pipeline and fail the build on high-severity misconfigurations.',
      description: 'Misconfigurations are cheaper to fix before deployment. This test adds an IaC scan step to the pipeline of a sample repository and checks that findings are reported in the pull request and in the console.',
      objectives: [
        'Connect a sample GitHub repository.',
        'Add the IaC scan step to the CI pipeline.',
        'Fail the build on high-severity findings.',
        'Show fix suggestions in the pull request.',
      ],
      evaluation_metrics: ['Pass/Fail', 'Scan time per commit'],
      expected_outcome: 'The pipeline fails on the misconfigured template and the pull request shows the findings with suggested fixes.',
      how_to: '1) Connect the sample repository to the console.\n2) Add the scan step to the pipeline definition with a high-severity threshold.\n3) Open a pull request that adds a public storage bucket in Terraform.\n4) Check the pipeline result and the pull request comments.',
    },
    pt: {
      name: 'Varredura de IaC no pipeline de CI',
      summary: 'Fazer a varredura de templates Terraform no pipeline de CI e fazer o build falhar em configurações incorretas de alta severidade.',
      description: 'Configurações incorretas são mais baratas de corrigir antes da implantação. Este teste adiciona uma etapa de varredura de IaC ao pipeline de um repositório de exemplo e verifica que os findings são reportados no pull request e no console.',
      objectives: [
        'Conectar um repositório de exemplo do GitHub.',
        'Adicionar a etapa de varredura de IaC ao pipeline de CI.',
        'Fazer o build falhar em findings de alta severidade.',
        'Mostrar sugestões de correção no pull request.',
      ],
      expected_outcome: 'O pipeline falha no template mal configurado e o pull request mostra os findings com as correções sugeridas.',
      how_to: '1) Conectar o repositório de exemplo ao console.\n2) Adicionar a etapa de varredura à definição do pipeline com um limite de severidade alta.\n3) Abrir um pull request que adiciona um bucket de armazenamento público em Terraform.\n4) Verificar o resultado do pipeline e os comentários do pull request.',
    },
  },
  {
    key: 'cloud-k8s-admission', nodes: ['cloud-k8s-admission'], lifecycle: 'test-review', version: 1, author: 1,
    created: '2026-05-05 10:50',
    prereqs: [], industries: [], valueDrivers: [],
    competitors: [['d', 'parity', '']],
    docs: [
      { label: 'Kubernetes admission control', url: 'https://docs.paloaltonetworks.com/cortex/cortex-cloud/runtime-security/kubernetes', summary: 'Admission rules for Kubernetes clusters.', audience: 'customer' },
    ],
    notes: [],
    history: [['tr', '2026-05-05 10:50', null, 'test-review', null]],
    en: {
      name: 'Kubernetes admission control',
      summary: 'Block the deployment of pods that violate policy, such as privileged containers or images with critical vulnerabilities.',
      description: 'Developers can deploy workloads directly to the cluster. This test enables the admission controller and tries to deploy a privileged pod and an image with a critical CVE.',
      objectives: [
        'Test steps:',
        'Deploy a privileged pod.',
        'Deploy an image with a critical vulnerability.',
        'Verify that both deployments are blocked at admission.',
      ],
      evaluation_metrics: ['Pass/Fail'],
      expected_outcome: 'Both deployments are rejected with a message that names the violated policy.',
      how_to: '',
    },
    pt: {
      name: 'Controle de admissão no Kubernetes',
      summary: 'Bloquear a implantação de pods que violam a política, como contêineres privilegiados ou imagens com vulnerabilidades críticas.',
      description: 'Os desenvolvedores podem implantar workloads diretamente no cluster. Este teste habilita o admission controller e tenta implantar um pod privilegiado e uma imagem com uma CVE crítica.',
      objectives: [
        'Passos do teste:',
        'Implantar um pod privilegiado.',
        'Implantar uma imagem com uma vulnerabilidade crítica.',
        'Verificar que as duas implantações são bloqueadas na admissão.',
      ],
      expected_outcome: 'As duas implantações são rejeitadas com uma mensagem que indica a política violada.',
      how_to: '',
    },
  },
  {
    key: 'cloud-container-runtime', nodes: ['cloud-k8s'], lifecycle: 'capability-review', version: 1, author: 2,
    created: '2026-06-22 15:35',
    prereqs: [], industries: ['manufacturing'], valueDrivers: [],
    competitors: [['a', 'unknown', '']],
    docs: [], notes: [],
    history: [
      ['tr', '2026-07-29 10:15', 'capability-review', 'capability-review', 'Awaiting confirmation of supported container runtimes'],
      ['tr', '2026-06-22 15:35', null, 'capability-review', null],
    ],
    en: {
      name: 'Runtime protection for containers',
      summary: 'Detect and prevent suspicious process and network activity inside running containers.',
      description: 'An attacker who gains a shell in a container may download tools and open reverse connections. This test runs these actions in a lab container and checks detection and prevention by the runtime defender.',
      objectives: [
        'Detect an interactive shell started in a running container.',
        'Prevent the execution of a binary that is not part of the image.',
        'Detect an outbound connection to a known malicious IP address.',
      ],
      evaluation_metrics: ['Pass/Fail', 'MTTD'],
      expected_outcome: '- Each action generates a runtime event.\n- The unknown binary is blocked.',
      how_to: '',
    },
    pt: {
      name: 'Proteção de runtime para contêineres',
      summary: 'Detectar e impedir atividade suspeita de processos e de rede dentro de contêineres em execução.',
      description: 'Um atacante que obtém um shell em um contêiner pode baixar ferramentas e abrir conexões reversas. Este teste executa essas ações em um contêiner do laboratório e verifica a detecção e a prevenção pelo defender de runtime.',
      objectives: [
        'Detectar um shell interativo iniciado em um contêiner em execução.',
        'Impedir a execução de um binário que não faz parte da imagem.',
        'Detectar uma conexão de saída para um endereço IP sabidamente malicioso.',
      ],
      expected_outcome: '- Cada ação gera um evento de runtime.\n- O binário desconhecido é bloqueado.',
      how_to: '',
    },
  },

  // =============================================================== SecOps (5 + 1 privado)
  {
    // Usa os nós aposentados XSIAM / Enhance SOC Efficiency.
    key: 'secops-xsiam-ingest', nodes: ['secops-ir', '@xsiam', '@ese'], taxonomyOnly: ['secops'], lifecycle: 'tested', version: 3, author: 3,
    created: '2026-01-30 10:40',
    prereqs: ['log-forwarding'], industries: ['fsi'],
    valueDrivers: [{ id: 'efficiency', narrative: 'Fewer consoles for the SOC.' }, { id: 'tco', narrative: '' }],
    competitors: [['a', 'advantage', ''], ['b', 'advantage', ''], ['c', 'parity', '']],
    docs: [
      { label: 'Cortex XSIAM data sources', url: 'https://docs.paloaltonetworks.com/cortex/cortex-xsiam', summary: 'Onboarding data sources and searching ingested logs.', audience: 'customer' },
      { label: 'Incident stitching lab script', url: 'https://docs.paloaltonetworks.com/cortex/cortex-xsiam/incidents', summary: 'Activity used in the lab to generate a stitched incident.', audience: 'internal' },
    ],
    notes: [
      {
        at: '2026-07-10 12:00',
        body: 'Taxonomy still references the previous XSIAM domain; keep until the library is re-mapped.',
        body_pt: 'A taxonomia ainda referencia o domínio XSIAM anterior; manter até que a biblioteca seja remapeada.',
      },
    ],
    history: [
      ...signoff('2026-06-05 14:00', 'xsiam'),
      ['tr', '2026-05-18 09:25', 'test-review', 'reviewed', null],
    ],
    en: {
      name: 'XSIAM: ingest firewall logs and stitch incidents',
      summary: 'Ingest NGFW logs into Cortex XSIAM and show how related alerts are stitched into a single incident.',
      description: 'The SOC receives alerts from the firewall and from the endpoints in separate consoles. This test forwards firewall logs to Cortex XSIAM, generates activity from a lab host and shows the stitched incident with network and endpoint data.',
      objectives: [
        'Onboard the firewall log data source.',
        'Verify that logs are parsed and searchable within minutes.',
        'Generate network and endpoint activity from the same host.',
        'Show a single incident that groups the related alerts.',
      ],
      evaluation_metrics: ['Pass/Fail', 'Time to first searchable log < 10 minutes'],
      expected_outcome: 'Firewall logs are searchable and the related alerts appear as one incident with a causality view.',
      how_to: '',
    },
    pt: {
      name: 'XSIAM: ingerir logs de firewall e correlacionar incidentes',
      summary: 'Ingerir logs de NGFW no Cortex XSIAM e mostrar como alertas relacionados são correlacionados em um único incidente.',
      description: 'O SOC recebe alertas do firewall e dos endpoints em consoles separados. Este teste encaminha os logs do firewall ao Cortex XSIAM, gera atividade a partir de um host do laboratório e mostra o incidente correlacionado com dados de rede e de endpoint.',
      objectives: [
        'Fazer o onboarding da fonte de dados de logs do firewall.',
        'Verificar que os logs são processados e ficam pesquisáveis em minutos.',
        'Gerar atividade de rede e de endpoint a partir do mesmo host.',
        'Mostrar um único incidente que agrupa os alertas relacionados.',
      ],
      expected_outcome: 'Os logs do firewall ficam pesquisáveis e os alertas relacionados aparecem como um único incidente com uma visão de causalidade.',
      how_to: '',
    },
  },
  {
    // Usa os nós aposentados; caso depreciado.
    key: 'secops-alert-grouping', nodes: ['secops-ir', '@xsiam', '@ese'], taxonomyOnly: ['secops'], lifecycle: 'deprecated', version: 2, author: 1,
    created: '2026-01-16 09:05',
    prereqs: [], industries: [],
    valueDrivers: ['efficiency'],
    competitors: [['b', 'unknown', '']],
    docs: [], notes: [],
    history: [
      ['tr', '2026-06-29 16:20', 'reviewed', 'deprecated', 'Superseded by a newer test case'],
      ['tr', '2026-01-16 09:05', null, 'reviewed', null],
    ],
    en: {
      name: 'Alert grouping reduces analyst fatigue',
      summary: 'Measure how many raw alerts are grouped into incidents over one week of lab data.',
      description: 'Analysts spend most of their time triaging duplicate alerts. This test compares the number of raw alerts with the number of incidents after grouping.',
      objectives: ['Compare raw alerts and incidents for the same period.'],
      evaluation_metrics: ['> 80% reduction in alerts', 'MTTR'],
      expected_outcome: 'The number of incidents is at least 80% lower than the number of raw alerts.',
      how_to: '',
    },
    pt: {
      name: 'O agrupamento de alertas reduz a fadiga dos analistas',
      summary: 'Medir quantos alertas brutos são agrupados em incidentes ao longo de uma semana de dados do laboratório.',
      description: 'Os analistas passam a maior parte do tempo fazendo a triagem de alertas duplicados. Este teste compara o número de alertas brutos com o número de incidentes após o agrupamento.',
      objectives: ['Comparar alertas brutos e incidentes no mesmo período.'],
      expected_outcome: 'O número de incidentes é pelo menos 80% menor que o número de alertas brutos.',
      how_to: '',
    },
  },
  {
    key: 'secops-containment-playbook', nodes: ['secops-ir-playbook'], lifecycle: 'test-review', version: 1, author: 2,
    created: '2026-07-06 13:10',
    prereqs: ['xdr-agent', 'log-forwarding'], industries: [],
    valueDrivers: [['efficiency', ''], ['risk', '']],
    competitors: [['a', 'parity', ''], ['d', 'advantage', '']],
    docs: [
      { label: 'Playbooks', url: 'https://docs.paloaltonetworks.com/cortex/cortex-xsiam/playbooks', summary: 'Building and triggering automation playbooks.', audience: 'customer' },
    ],
    notes: [],
    history: [['tr', '2026-07-06 13:10', null, 'test-review', null]],
    en: {
      name: 'Automated containment playbook',
      summary: 'Run a playbook that isolates the endpoint, blocks the indicator on the firewall and opens a ticket.',
      description: 'Containment today depends on manual steps across three teams. This test triggers a playbook from a malware incident that isolates the host, adds the malicious domain to an external dynamic list and opens a ticket in the ticketing system.',
      objectives: [
        'Trigger the playbook automatically from a malware incident.',
        'Isolate the affected endpoint.',
        'Block the malicious domain on the firewall through an external dynamic list.',
        'Open a ticket with the incident summary.',
        'Measure the time from detection to containment.',
      ],
      evaluation_metrics: ['MTTR', 'Pass/Fail', 'Manual steps removed'],
      expected_outcome: '- The endpoint is isolated.\n- The domain is blocked on the firewall.\n- A ticket is opened without manual action.',
      how_to: '1) Import the containment playbook and set it as the default for malware incidents.\n2) Configure the firewall and ticketing integrations.\n3) Run the test malware sample on the lab host.\n4) Follow the playbook run in the incident work plan.',
    },
    pt: {
      name: 'Playbook de contenção automatizada',
      summary: 'Executar um playbook que isola o endpoint, bloqueia o indicador no firewall e abre um ticket.',
      description: 'Hoje a contenção depende de passos manuais entre três equipes. Este teste dispara um playbook a partir de um incidente de malware que isola o host, adiciona o domínio malicioso a uma external dynamic list e abre um ticket no sistema de tickets.',
      objectives: [
        'Disparar o playbook automaticamente a partir de um incidente de malware.',
        'Isolar o endpoint afetado.',
        'Bloquear o domínio malicioso no firewall por meio de uma external dynamic list.',
        'Abrir um ticket com o resumo do incidente.',
        'Medir o tempo desde a detecção até a contenção.',
      ],
      expected_outcome: '- O endpoint é isolado.\n- O domínio é bloqueado no firewall.\n- Um ticket é aberto sem ação manual.',
      how_to: '1) Importar o playbook de contenção e defini-lo como padrão para incidentes de malware.\n2) Configurar as integrações com o firewall e com o sistema de tickets.\n3) Executar a amostra de malware de teste no host do laboratório.\n4) Acompanhar a execução do playbook no work plan do incidente.',
    },
  },
  {
    key: 'secops-xdr-ransomware', nodes: ['secops-ep-ransomware'], lifecycle: 'tested', version: 2, author: 3,
    created: '2026-02-05 08:30',
    prereqs: ['xdr-agent'], industries: ['healthcare', 'manufacturing'],
    valueDrivers: [['risk', '']],
    competitors: [['c', 'advantage', ''], ['d', 'advantage', '']],
    docs: [
      { label: 'Cortex XDR prevention profiles', url: 'https://docs.paloaltonetworks.com/cortex/cortex-xdr', summary: 'Endpoint prevention policies and profiles.', audience: 'customer' },
      { label: 'Ransomware simulation guidance', url: 'https://docs.paloaltonetworks.com/cortex/cortex-xdr/endpoint-security', summary: 'Safe use of simulators on lab hosts.', audience: 'internal' },
    ],
    notes: [],
    history: [...signoff('2026-04-16 10:55', 'lab-ref')],
    en: {
      name: 'Cortex XDR: ransomware behavioral protection',
      summary: 'Show that the XDR agent stops ransomware behavior and that the resulting alert explains the attack.',
      description: 'Signature-based antivirus did not stop a recent ransomware simulation. This test runs a ransomware simulator on a protected host and checks behavioral prevention and the resulting alert.',
      objectives: [
        'Block the ransomware simulator before files are encrypted.',
        'Show the causality chain in the alert.',
        'Verify that the agent reports the prevention to the console.',
      ],
      evaluation_metrics: ['Pass/Fail'],
      expected_outcome: 'The simulator is terminated, no files are encrypted and a prevention alert shows the full causality chain.',
      how_to: '1) Assign the default prevention policy to the test host.\n2) Take a snapshot of the test host.\n3) Run the ransomware simulator from a user folder.\n4) Review the alert and the causality view.\n5) Revert the host to the snapshot.',
    },
    pt: {
      name: 'Cortex XDR: proteção comportamental contra ransomware',
      summary: 'Mostrar que o agente XDR interrompe o comportamento de ransomware e que o alerta resultante explica o ataque.',
      description: 'O antivírus baseado em assinaturas não impediu uma simulação recente de ransomware. Este teste executa um simulador de ransomware em um host protegido e verifica a prevenção comportamental e o alerta resultante.',
      objectives: [
        'Bloquear o simulador de ransomware antes que os arquivos sejam criptografados.',
        'Mostrar a cadeia de causalidade no alerta.',
        'Verificar que o agente reporta a prevenção ao console.',
      ],
      expected_outcome: 'O simulador é encerrado, nenhum arquivo é criptografado e um alerta de prevenção mostra a cadeia de causalidade completa.',
      how_to: '1) Atribuir a política de prevenção padrão ao host de teste.\n2) Tirar um snapshot do host de teste.\n3) Executar o simulador de ransomware a partir de uma pasta de usuário.\n4) Revisar o alerta e a visão de causalidade.\n5) Reverter o host para o snapshot.',
    },
  },
  {
    // Sem bloco `pt`: tradução pendente.
    key: 'secops-xdr-isolate', nodes: ['secops-ep', 'secops-ir'], lifecycle: 'reviewed', version: 3, author: 1,
    created: '2026-05-27 11:30',
    prereqs: ['xdr-agent'], industries: [], valueDrivers: [], competitors: [],
    docs: [
      { label: 'Isolate an endpoint', url: 'https://docs.paloaltonetworks.com/cortex/cortex-xdr/response-actions', summary: 'Network isolation and Live Terminal response actions.', audience: 'customer' },
    ],
    notes: [],
    history: [
      ['edit', '2026-09-15 14:50', ['description']],
      ['tr', '2026-08-19 10:30', 'test-review', 'reviewed', null],
      ['tr', '2026-05-27 11:30', null, 'test-review', null],
    ],
    en: {
      name: 'Cortex XDR: isolate a compromised endpoint',
      summary: 'Isolate a compromised endpoint from the network while keeping it connected to the console for investigation.',
      description: 'When an endpoint is compromised, the SOC must cut its network access quickly without losing visibility. This test isolates a lab host from the console and verifies that only the console communication remains.',
      objectives: [
        'Isolate the host from the console.',
        'Verify that the host can still be investigated with Live Terminal.',
      ],
      evaluation_metrics: ['Pass/Fail', 'Time to isolate < 1 minute'],
      expected_outcome: 'The host loses network access except for the console connection, and the isolation is recorded in the audit log.',
      how_to: '',
    },
    pt: null,
  },
  {
    // Caso extra: visibility "private", de resto completo.
    key: 'secops-xdr-credential-theft', nodes: ['secops-ep'], lifecycle: 'tested', version: 2, author: 2,
    visibility: 'private',
    created: '2026-07-14 09:10',
    prereqs: ['xdr-agent'], industries: ['fsi'],
    valueDrivers: [['risk', '']],
    competitors: [['d', 'parity', '']],
    docs: [
      { label: 'Cortex XDR exploit and malware protection', url: 'https://docs.paloaltonetworks.com/cortex/cortex-xdr/endpoint-security', summary: 'Endpoint protection modules and their alerts.', audience: 'customer' },
    ],
    notes: [],
    history: [...signoff('2026-08-06 14:20', 'lab-ref')],
    en: {
      name: 'Cortex XDR: prevent credential theft from memory',
      summary: 'Show that the XDR agent blocks attempts to read credentials from the memory of the authentication process.',
      description: 'Attackers dump credentials from memory to move laterally. This test runs common credential dumping techniques on a protected lab host and checks prevention and the resulting alert.',
      objectives: [
        'Block credential dumping attempts against the authentication process.',
        'Map the alert to the corresponding MITRE ATT&CK technique.',
      ],
      evaluation_metrics: ['Pass/Fail'],
      expected_outcome: 'Each attempt is blocked and the alert shows the technique and the process tree.',
      how_to: '',
    },
    pt: {
      name: 'Cortex XDR: impedir o roubo de credenciais da memória',
      summary: 'Mostrar que o agente XDR bloqueia tentativas de ler credenciais da memória do processo de autenticação.',
      description: 'Atacantes extraem credenciais da memória para se mover lateralmente. Este teste executa técnicas comuns de extração de credenciais em um host protegido do laboratório e verifica a prevenção e o alerta resultante.',
      objectives: [
        'Bloquear tentativas de extração de credenciais contra o processo de autenticação.',
        'Mapear o alerta para a técnica correspondente do MITRE ATT&CK.',
      ],
      expected_outcome: 'Cada tentativa é bloqueada e o alerta mostra a técnica e a árvore de processos.',
      how_to: '',
    },
  },
];

// ------------------------------------------------------------------ build

function build() {
  const typeId = {};
  const nodeTypes = NODE_TYPES.map(t => {
    typeId[t.key] = uuidFrom('node-type:' + t.key);
    return { id: typeId[t.key], version: t.version || 1, label: t.label, abbrev: t.abbrev, color: t.color, icon: t.icon, label_pt: t.label_pt };
  });

  // taxonomy_nodes (sem depth, como o endpoint /taxonomy/nodes) + índice interno
  const nodeByKey = {};
  const taxonomyNodes = [];
  let order = 0;
  (function walk(list, parent, depth) {
    for (const n of list) {
      const id = uuidFrom('node:' + n.key);
      const typeKey = n.type || TYPE_BY_DEPTH[depth];
      nodeByKey[n.key] = { key: n.key, id, name: n.name, depth, type_id: typeId[typeKey], brand_color: depth === 0 ? n.brand_color : null, parentKey: parent ? parent.key : null, order: order++, retired: false };
      taxonomyNodes.push({
        id, version: n.version || 1, name: n.name, description: n.description, type_id: typeId[typeKey],
        parent_id: parent ? nodeByKey[parent.key].id : null, forest_parent_id: parent ? nodeByKey[parent.key].id : null,
        placed: true, status: 'active', brand_color: depth === 0 ? n.brand_color : null,
        name_pt: n.name_pt, description_pt: n.description_pt,
      });
      if (n.children) walk(n.children, n, depth + 1);
    }
  })(TAXONOMY, null, 0);

  const ptExtra = {};
  for (const r of RETIRED_NODES) {
    const id = uuidFrom('node:retired:' + r.key.slice(1));
    nodeByKey[r.key] = { key: r.key, id, name: r.name, depth: r.depth, type_id: typeId[TYPE_BY_DEPTH[r.depth]], brand_color: r.brand_color, parentKey: null, order: 1000 + order++, retired: true };
    ptExtra[id] = { name: r.name_pt, description: r.description_pt };
  }

  const ref = (list, prefix) => {
    const byKey = {};
    const items = list.map(x => {
      const id = uuidFrom(prefix + ':' + x.key);
      byKey[x.key] = id;
      return { id, x };
    });
    return { byKey, items };
  };
  const comp = ref(COMPETITORS, 'competitor');
  const ind = ref(INDUSTRIES, 'industry');
  const vd = ref(VALUE_DRIVERS, 'value-driver');
  const env = ref(ENVIRONMENTS, 'environment');
  const pre = ref(PREREQUISITES, 'prerequisite');
  const need = (map, key, what) => { if (!map[key]) throw new Error(`unknown ${what}: ${key}`); return map[key]; };

  const testCases = CASES.map(spec => {
    const k = spec.key;
    const author = AUTHORS[spec.author - 1];

    // nós: os informados + ancestrais; ordem = depth, depois posição na árvore
    const set = new Map();
    for (const nk of spec.nodes) {
      let n = need(nodeByKey, nk, 'node');
      while (n) { set.set(n.key, n); n = n.parentKey ? nodeByKey[n.parentKey] : null; }
    }
    const nodes = [...set.values()].sort((a, b) => a.depth - b.depth || a.order - b.order);
    const taxonomyOnly = new Set(spec.taxonomyOnly || []);
    for (const t of taxonomyOnly) if (!set.has(t)) throw new Error(`${k}: taxonomyOnly node ${t} must be an ancestor`);

    // history (mais novo primeiro)
    const history = spec.history.map((h, i) => {
      const base = { id: uuidFrom(`history:${k}:${h[0]}:${h[1]}`), at: ts(h[1]) };
      const empty = { transition_id: null, publish_effect: null };
      if (h[0] === 'test') {
        const actor = { lab: LAB_ACTOR, unknown: UNKNOWN_ACTOR }[h[4] || 'lab'];
        if (!actor) throw new Error(`bad test actor in ${k}: ${h[4]}`);
        return { ...base, actor: { ...actor }, kind: 'test', from_state: null, to_state: null, ...empty, result: h[3], environment_id: need(env.byKey, h[2], 'environment'), assignee_id: null, fields: [], reason: null };
      }
      if (h[0] === 'tr') {
        return { ...base, actor: { user_id: REVIEWER.id, name: REVIEWER.name, email: REVIEWER.email, on_behalf_of: null }, kind: 'transition', from_state: h[2], to_state: h[3], ...empty, result: null, environment_id: null, assignee_id: REVIEWER.id, fields: [], reason: h[4] };
      }
      if (h[0] === 'edit') {
        return { ...base, actor: { user_id: author.id, name: author.name, email: author.email, on_behalf_of: null }, kind: 'edit', from_state: null, to_state: null, ...empty, result: null, environment_id: null, assignee_id: null, fields: h[2].slice(), reason: null };
      }
      throw new Error(`bad history kind in ${k}: ${h[0]}`);
    }).sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));

    // testing: sign-off = entrada 'test' mais recente (com fields: null, como na API)
    const tests = history.filter(h => h.kind === 'test');
    const asSignoff = h => ({ ...h, actor: { ...h.actor }, fields: null });
    const latestByEnv = {};
    for (const t of tests) if (!latestByEnv[t.environment_id]) latestByEnv[t.environment_id] = asSignoff(t);
    const testing = {
      latest_signoff: tests.length ? asSignoff(tests[0]) : null,
      latest_by_environment: latestByEnv,
      tested: tests.length > 0,
    };

    const createdAt = ts(spec.created);
    const updatedAt = [...history.map(h => h.at), ...spec.notes.map(n => ts(n.at))].reduce((m, at) => (at > m ? at : m), createdAt);

    const tc = {
      id: uuidFrom('case:' + k),
      version: spec.version,
      name: spec.en.name,
      summary: spec.en.summary,
      description: spec.en.description,
      objectives: spec.en.objectives.slice(),
      evaluation_metrics: spec.en.evaluation_metrics.slice(),
      expected_outcome: spec.en.expected_outcome,
      how_to: spec.en.how_to,
      lifecycle: spec.lifecycle,
      published: spec.published !== undefined ? spec.published : true,
      visibility: spec.visibility || 'shared',
      shared_at: createdAt,
      saved_to_library: true,
      authored_for_catalog: false,
      node_ids: nodes.filter(n => !taxonomyOnly.has(n.key)).map(n => n.id),
      prereq_ids: spec.prereqs.map(p => need(pre.byKey, p, 'prerequisite')),
      industry_ids: spec.industries.map(i => need(ind.byKey, i, 'industry')),
      value_drivers: spec.valueDrivers.map(v => {
        if (typeof v === 'string') return need(vd.byKey, v, 'value driver');
        if (Array.isArray(v)) return { value_driver_id: need(vd.byKey, v[0], 'value driver'), note: v[1] };
        return { id: need(vd.byKey, v.id, 'value driver'), narrative: v.narrative };
      }),
      competitors: spec.competitors.map(([c, stance, note]) => ({ competitor_id: need(comp.byKey, c, 'competitor'), stance, note })),
      docs: spec.docs.map((d, i) => ({ id: uuidFrom(`doc:${k}:${i}`), label: d.label, url: d.url, summary: d.summary, audience: d.audience })),
      notes: spec.notes.map((n, i) => ({ id: uuidFrom(`note:${k}:${i}`), at: ts(n.at), actor: { ...LAB_ACTOR }, body: n.body })),
      history,
      author_id: author.id,
      assignee_id: null,
      created_at: createdAt,
      updated_at: updatedAt,
      testing,
      taxonomy: nodes.map(n => ({ node_id: n.id, name: n.name, type_id: n.type_id, depth: n.depth, brand_color: n.brand_color })),
    };
    if (spec.pt) {
      tc.pt = {
        name: spec.pt.name,
        summary: spec.pt.summary,
        description: spec.pt.description,
        objectives: spec.pt.objectives.slice(),
        evaluation_metrics: spec.en.evaluation_metrics.map(m => need(METRIC_PT, m, 'metric translation')),
        expected_outcome: spec.pt.expected_outcome,
        how_to: spec.pt.how_to,
        notes: spec.notes.map(n => n.body_pt),
        source_version: spec.ptStale ? spec.ptStale.source_version : spec.version,
        source_updated_at: spec.ptStale ? ts(spec.ptStale.source_updated_at) : updatedAt,
      };
    }
    return tc;
  });

  // o coletor ordena os casos por nome
  testCases.sort((a, b) => {
    const x = a.name.toLowerCase(), y = b.name.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  });

  const bundle = {
    meta: {
      source: 'pov-companion-collector.js',
      origin: 'https://pov-companion.example.com',
      exported_at: '2026-09-20T12:00:00.000Z',
      library_total_reported: testCases.length,
      partial: false,
      details_fetched: 0,
      counts: {
        test_cases: testCases.length,
        taxonomy_nodes: taxonomyNodes.length,
        competitors: COMPETITORS.length,
        industries: INDUSTRIES.length,
        value_drivers: VALUE_DRIVERS.length,
        environments: ENVIRONMENTS.length,
        prerequisites: PREREQUISITES.length,
        tools: 0,
      },
      facets: null,
      translation: {
        lang: 'pt-BR',
        translated_at: '2026-09-20T13:00:00.000Z',
        method: 'sintético (dados de demonstração)',
        cases_translated: testCases.filter(c => c.pt).length,
        fields: ['name', 'summary', 'description', 'objectives', 'evaluation_metrics', 'expected_outcome', 'how_to', 'notes'],
      },
      demo: true,
    },
    test_cases: testCases,
    taxonomy_nodes: taxonomyNodes,
    taxonomy_nodes_pt_extra: ptExtra,
    node_types: nodeTypes,
    competitors: comp.items.map(({ id, x }) => ({ id, version: 1, name: x.name, description: '' })),
    industries: ind.items.map(({ id, x }) => ({ id, version: 1, name: x.name, description: '' })),
    value_drivers: vd.items.map(({ id, x }) => ({ id, version: 1, name: x.name, description: x.description })),
    environments: env.items.map(({ id, x }) => ({ id, version: 1, name: x.name, description: x.description, active: true, name_pt: x.name_pt, description_pt: x.description_pt })),
    prerequisites: pre.items.map(({ id, x }) => ({ id, version: 1, name: x.name, description: x.description })),
    tools: [],
    coverage: null,
  };
  return { bundle, retiredIds: new Set(RETIRED_NODES.map(r => nodeByKey[r.key].id)), domainOf: c => c.taxonomy.find(t => t.depth === 0 && !RETIRED_NODES.some(r => nodeByKey[r.key].id === t.node_id)).name };
}

// ------------------------------------------------------------------ self-check

function check({ bundle: B, retiredIds, domainOf }) {
  const errors = [];
  const ok = (cond, msg) => { if (!cond) errors.push(msg); };
  const count = (arr, pred) => arr.filter(pred).length;

  ok(JSON.stringify(Object.keys(B)) === JSON.stringify(['meta', 'test_cases', 'taxonomy_nodes', 'taxonomy_nodes_pt_extra', 'node_types', 'competitors', 'industries', 'value_drivers', 'environments', 'prerequisites', 'tools', 'coverage']), 'top-level keys');
  for (const [k, n] of Object.entries(B.meta.counts)) ok(B[k].length === n, `meta.counts.${k}=${n} but array has ${B[k].length}`);
  ok(B.meta.library_total_reported === B.test_cases.length, 'library_total_reported');
  ok(B.meta.translation.cases_translated === count(B.test_cases, c => c.pt), 'cases_translated');
  ok(B.node_types.length === 6, 'node_types = 6');

  // ids únicos em todo o bundle
  const ids = [];
  const collect = (arr) => arr.forEach(x => ids.push(x.id));
  ['test_cases', 'taxonomy_nodes', 'node_types', 'competitors', 'industries', 'value_drivers', 'environments', 'prerequisites'].forEach(k => collect(B[k]));
  ids.push(...retiredIds);
  for (const c of B.test_cases) { collect(c.history); collect(c.docs); collect(c.notes); }
  ok(new Set(ids).size === ids.length, 'duplicate ids');
  ok(ids.every(id => /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)), 'id format');

  const nodeById = Object.fromEntries(B.taxonomy_nodes.map(n => [n.id, n]));
  const typeById = Object.fromEntries(B.node_types.map(t => [t.id, t]));
  const setOf = k => new Set(B[k].map(x => x.id));
  const envIds = setOf('environments'), preIds = setOf('prerequisites'), indIds = setOf('industries'), compIds = setOf('competitors'), vdIds = setOf('value_drivers');
  const vdIdOf = x => (typeof x === 'string' ? x : x.value_driver_id || x.id);
  const depthOf = n => { let d = 0; while (n.parent_id) { n = nodeById[n.parent_id]; d++; } return d; };
  const nodeNamed = name => B.taxonomy_nodes.find(n => n.name === name) || {};
  const envNamed = name => (B.environments.find(e => e.name === name) || {}).id;
  const URL_RE = /https?:\/\/[^\s"()]+[^\s"().,;:]/g;
  const urlsIn = s => s.match(URL_RE) || [];

  // taxonomia
  for (const n of B.taxonomy_nodes) {
    ok(!('depth' in n), `taxonomy node ${n.name} has depth`);
    ok(n.parent_id === null || nodeById[n.parent_id], `taxonomy node ${n.name} parent`);
    ok(n.parent_id === n.forest_parent_id, `taxonomy node ${n.name} forest_parent_id`);
    ok((n.parent_id === null) === (n.brand_color !== null), `brand_color only on domains (${n.name})`);
    ok(typeById[n.type_id], `taxonomy node ${n.name} type`);
    ok(typeof n.name_pt === 'string' && n.name_pt && typeof n.description_pt === 'string', `taxonomy node ${n.name} pt`);
    ok((n.description === '') === (n.description_pt === ''), `taxonomy node ${n.name} empty description stays empty`);
  }
  const domains = B.taxonomy_nodes.filter(n => n.parent_id === null).map(n => n.name);
  ok(JSON.stringify(domains) === JSON.stringify(['NGFW', 'SASE', 'Cloud', 'SecOps']), 'domains');
  ok([...retiredIds].every(id => !nodeById[id]), 'retired nodes must not be in taxonomy_nodes');
  ok(JSON.stringify(Object.keys(B.taxonomy_nodes_pt_extra).sort()) === JSON.stringify([...retiredIds].sort()), 'pt_extra keys = retired nodes');

  // casos
  const lifecycles = {};
  for (const c of B.test_cases) {
    const tag = `case "${c.name}"`;
    lifecycles[c.lifecycle] = (lifecycles[c.lifecycle] || 0) + 1;
    ok(c.node_ids.every(id => nodeById[id] || retiredIds.has(id)), `${tag}: node_ids`);
    ok(c.taxonomy.every(t => nodeById[t.node_id] || retiredIds.has(t.node_id)), `${tag}: taxonomy ids`);
    // node_ids = taxonomy[] na mesma ordem, exceto o domínio vivo dos casos com nós aposentados,
    // que só aparece em taxonomy[] (ancestral), como nos dados reais
    const taxIds = c.taxonomy.map(t => t.node_id);
    const onlyInTax = taxIds.filter(id => !c.node_ids.includes(id));
    const isRetiredCase = c.node_ids.some(id => retiredIds.has(id));
    ok(c.node_ids.every(id => taxIds.includes(id)) && JSON.stringify(taxIds.filter(id => c.node_ids.includes(id))) === JSON.stringify(c.node_ids), `${tag}: node_ids ⊆ taxonomy, same order`);
    ok(isRetiredCase ? onlyInTax.length === 1 && nodeById[onlyInTax[0]] && nodeById[onlyInTax[0]].parent_id === null : onlyInTax.length === 0, `${tag}: taxonomy-only nodes`);
    ok(c.taxonomy[0].depth === 0 && c.taxonomy.every((t, i, a) => i === 0 || a[i - 1].depth <= t.depth), `${tag}: taxonomy order`);
    ok(c.taxonomy.some(t => typeById[t.type_id].label === 'Use Case'), `${tag}: has a use case`);
    for (const t of c.taxonomy) {
      const n = nodeById[t.node_id];
      if (n) ok(n.name === t.name && n.type_id === t.type_id && n.brand_color === t.brand_color, `${tag}: embedded node ${t.name} mismatch`);
      if (n) ok(t.depth === depthOf(n), `${tag}: embedded depth of ${t.name} != parent chain`);
      if (n && n.parent_id) ok(taxIds.includes(n.parent_id), `${tag}: parent of ${t.name} missing from taxonomy`);
    }
    ok(c.prereq_ids.every(id => preIds.has(id)) && c.prereq_ids.length <= 3, `${tag}: prereq_ids`);
    ok(c.industry_ids.every(id => indIds.has(id)), `${tag}: industry_ids`);
    ok(c.competitors.every(x => compIds.has(x.competitor_id) && ['advantage', 'parity', 'unknown'].includes(x.stance)), `${tag}: competitors`);
    ok(c.value_drivers.every(x => vdIds.has(vdIdOf(x)) && (typeof x === 'string' || ['["value_driver_id","note"]', '["id","narrative"]'].includes(JSON.stringify(Object.keys(x))))), `${tag}: value_drivers`);
    ok(c.docs.length <= 3 && c.docs.every(d => d.url.startsWith('https://docs.paloaltonetworks.com/') && ['customer', 'internal'].includes(d.audience)), `${tag}: docs`);
    ok(typeof c.published === 'boolean' && ['shared', 'private'].includes(c.visibility), `${tag}: published/visibility`);
    ok(c.objectives.length >= 1 && c.objectives.length <= 6, `${tag}: objectives 1..6`);
    ok(c.evaluation_metrics.length >= 1 && c.evaluation_metrics.length <= 3, `${tag}: metrics 1..3`);
    ok(c.version >= 1 && c.version <= 5, `${tag}: version`);
    ok(c.history.length >= 1 && c.history.length <= 4, `${tag}: history 1..4`);
    ok(c.history.every((h, i, a) => i === 0 || a[i - 1].at >= h.at), `${tag}: history newest first`);
    ok(c.history.every(h => h.at >= c.created_at && h.at <= c.updated_at), `${tag}: history within created/updated`);
    ok(c.shared_at === c.created_at && c.created_at.startsWith('2026-') && c.updated_at.startsWith('2026-'), `${tag}: timestamps`);
    ok(c.history.every(h => h.kind !== 'test' || envIds.has(h.environment_id)), `${tag}: history environment_id`);

    // testing
    const t = c.testing;
    if (t.tested) {
      const newest = c.history.find(h => h.kind === 'test');
      ok(t.latest_signoff && newest && JSON.stringify({ ...newest, fields: null }) === JSON.stringify(t.latest_signoff), `${tag}: latest_signoff = newest test entry`);
      ok(envIds.has(t.latest_signoff.environment_id), `${tag}: signoff environment`);
      ok(JSON.stringify(t.latest_by_environment[t.latest_signoff.environment_id]) === JSON.stringify(t.latest_signoff), `${tag}: latest_by_environment`);
      ok(Object.keys(t.latest_by_environment).every(id => envIds.has(id)), `${tag}: latest_by_environment keys`);
    } else {
      ok(t.latest_signoff === null && Object.keys(t.latest_by_environment).length === 0, `${tag}: untested`);
    }
    ok(t.tested === (c.lifecycle === 'tested'), `${tag}: tested <=> lifecycle tested`);

    // pt
    if (c.pt) {
      const p = c.pt;
      ok(JSON.stringify(Object.keys(p)) === JSON.stringify(['name', 'summary', 'description', 'objectives', 'evaluation_metrics', 'expected_outcome', 'how_to', 'notes', 'source_version', 'source_updated_at']), `${tag}: pt keys`);
      ok(p.objectives.length === c.objectives.length, `${tag}: pt.objectives length`);
      ok(p.evaluation_metrics.length === c.evaluation_metrics.length, `${tag}: pt.evaluation_metrics length`);
      ok(p.notes.length === c.notes.length, `${tag}: pt.notes length`);
      for (const f of ['name', 'summary', 'description', 'expected_outcome', 'how_to']) {
        ok((c[f] === '') === (p[f] === ''), `${tag}: pt.${f} empty must stay empty`);
        ok((c[f] === '-') === (p[f] === '-'), `${tag}: pt.${f} "-" must stay "-"`);
        ok(c[f].split('\n').length === p[f].split('\n').length, `${tag}: pt.${f} line count`);
      }
      [...p.objectives, ...p.notes].forEach(s => ok(s !== '', `${tag}: empty pt item`));
      // fidelidade item a item: "-" continua "-", cabeçalho "…:" continua "…:", "- " inicial se mantém,
      // aspas duplicadas ""x"" do inglês viram "x", URLs ficam idênticas
      c.objectives.forEach((o, i) => {
        ok((o === '-') === (p.objectives[i] === '-'), `${tag}: objective ${i} "-" must stay "-"`);
        ok(o.endsWith(':') === p.objectives[i].endsWith(':'), `${tag}: objective ${i} header ":" must be kept`);
      });
      ok(c.expected_outcome.startsWith('- ') === p.expected_outcome.startsWith('- '), `${tag}: expected_outcome leading "- "`);
      const enText = [c.name, c.summary, c.description, ...c.objectives, c.expected_outcome, c.how_to, ...c.notes.map(n => n.body)];
      const ptText = [p.name, p.summary, p.description, ...p.objectives, p.expected_outcome, p.how_to, ...p.notes];
      ok(ptText.every(s => !s.includes('""')), `${tag}: pt must not keep doubled quotes`);
      enText.forEach((s, i) => { if (s.includes('""')) ok(ptText[i].includes('"'), `${tag}: pt must use normal quotes where EN has ""`); });
      enText.forEach((s, i) => urlsIn(s).forEach(u => ok(ptText[i].includes(u), `${tag}: URL ${u} must be kept verbatim in pt`)));
      ok(p.source_version === c.version || p.source_version === c.version - 1, `${tag}: pt.source_version`);
      ok(p.source_version === c.version ? p.source_updated_at === c.updated_at : p.source_updated_at < c.updated_at, `${tag}: pt.source_updated_at`);
    }
  }

  // distribuição e variedade exigidas
  const byDomain = {};
  B.test_cases.forEach(c => { const d = domainOf(c); byDomain[d] = (byDomain[d] || 0) + 1; });
  ok(B.test_cases.length === 26, 'exactly 26 cases (24 + 2 visibility extras)');
  ok(JSON.stringify(byDomain) === JSON.stringify({ ...byDomain, NGFW: 9, SASE: 6, Cloud: 5, SecOps: 6 }) && Object.keys(byDomain).length === 4, 'domain spread ' + JSON.stringify(byDomain));
  ok(JSON.stringify(Object.entries(lifecycles).sort()) === JSON.stringify(Object.entries({ tested: 16, 'test-review': 5, reviewed: 2, draft: 1, deprecated: 1, 'capability-review': 1 }).sort()), 'lifecycle spread ' + JSON.stringify(lifecycles));
  const signed = B.test_cases.filter(c => c.testing.tested);
  ok(count(signed, c => c.testing.latest_signoff.result === 'fail') === 1, 'exactly one failing sign-off');
  ok(signed.every(c => ['pass', 'fail'].includes(c.testing.latest_signoff.result)), 'sign-off results');
  const actorIs = (a, name) => a.name === name && a.user_id === null && a.email === '' && a.on_behalf_of === null;
  ok(signed.every(c => actorIs(c.testing.latest_signoff.actor, 'Lab Team') || actorIs(c.testing.latest_signoff.actor, 'Unknown')), 'sign-off actor');
  ok(count(B.test_cases, c => Object.keys(c.testing.latest_by_environment).length > 1) >= 1, 'a case with 2 environments');

  // --- itens da revisão de fidelidade
  // (1) nível Subdomain: Cloud > Application Security (Subdomain) > Code to Cloud (Use Case, depth 2)
  const sub = nodeNamed('Application Security'), c2c = nodeNamed('Code to Cloud (IaC Scanning)');
  ok(sub.id && typeById[sub.type_id].label === 'Subdomain' && sub.name_pt === 'Segurança de aplicações' && sub.parent_id === nodeNamed('Cloud').id, '(1) subdomain node');
  ok(c2c.parent_id === sub.id && typeById[c2c.type_id].label === 'Use Case' && depthOf(c2c) === 2, '(1) use case under subdomain');
  const iac = B.test_cases.find(c => c.node_ids.includes(c2c.id)) || { taxonomy: [], node_ids: [] };
  ok(iac.node_ids.includes(sub.id) && iac.taxonomy.some(t => t.node_id === sub.id && t.depth === 1 && typeById[t.type_id].label === 'Subdomain')
    && iac.taxonomy.some(t => t.node_id === c2c.id && t.depth === 2 && typeById[t.type_id].label === 'Use Case'), '(1) IaC case carries subdomain (depth 1) + use case (depth 2)');
  // (2) casos com nós aposentados: SecOps só em taxonomy[]; node_ids = XSIAM + Enhance SOC Efficiency + use case vivo
  const secops = nodeNamed('SecOps');
  B.test_cases.filter(c => c.node_ids.some(id => retiredIds.has(id))).forEach(c => {
    ok(!c.node_ids.includes(secops.id) && c.taxonomy[0].node_id === secops.id, `(2) ${c.name}: SecOps only in taxonomy`);
    const live = c.node_ids.filter(id => !retiredIds.has(id));
    ok(c.node_ids.length === 3 && c.node_ids.filter(id => retiredIds.has(id)).length === 2 && live.length === 1
      && typeById[nodeById[live[0]].type_id].label === 'Use Case' && nodeById[live[0]].parent_id === secops.id, `(2) ${c.name}: node_ids = 2 retired + 1 live SecOps use case`);
  });
  // (3) formatos de value_drivers
  ok(count(B.test_cases, c => c.value_drivers.some(x => typeof x === 'string')) >= 2, '(3) >= 2 cases with plain id strings');
  ok(count(B.test_cases, c => c.value_drivers.some(x => x && x.narrative !== undefined)) === 1, '(3) exactly 1 case with {id, narrative}');
  const vdCases = B.test_cases.filter(c => c.value_drivers.length);
  ok(count(vdCases, c => c.value_drivers.every(x => x && x.value_driver_id)) > vdCases.length / 2, '(3) most with {value_driver_id, note}');
  // (4) objetivos com item-cabeçalho "…:" seguido de passos, e item "-"
  ok(count(B.test_cases, c => c.objectives.some((o, i) => o.endsWith(':') && i < c.objectives.length - 1)) >= 2, '(4) >= 2 cases with a header objective followed by steps');
  ok(count(B.test_cases, c => c.objectives.includes('-')) >= 1, '(4) a case with a "-" objective');
  ok(B.test_cases.filter(c => c.pt).some(c => c.pt.objectives.includes('Passos do teste:')), '(4) pt header "Passos do teste:"');
  // (5) expected_outcome começando com "- "
  ok(count(B.test_cases, c => c.expected_outcome.startsWith('- ') && c.pt && c.pt.expected_outcome.startsWith('- ')) >= 2, '(5) >= 2 expected_outcome starting with "- " (EN and PT)');
  // (6) aspas duplicadas no inglês (descrição ou objetivo)
  ok(count(B.test_cases, c => c.pt && [c.description, ...c.objectives].some(s => s.includes('""'))) >= 2, '(6) >= 2 cases with doubled quotes in EN');
  // (7) URLs no texto: docs em um objetivo; link "interno" no how_to, sem entrada em docs[]
  ok(count(B.test_cases, c => c.objectives.some(o => o.includes('https://docs.paloaltonetworks.com/'))) >= 1, '(7) docs URL inside an objective');
  const intra = B.test_cases.filter(c => c.how_to.includes('https://intranet.example.com/wiki/pov-lab'));
  ok(intra.length === 1 && intra[0].pt && intra[0].pt.how_to.includes('https://intranet.example.com/wiki/pov-lab'), '(7) intranet link in exactly one how_to');
  ok(B.test_cases.every(c => c.docs.every(d => !d.url.includes('intranet'))), '(7) intranet link has no docs entry');
  // (8) visibilidade: 1 não publicado, 1 privado, ambos completos com pt atualizado
  const unpublished = B.test_cases.filter(c => c.published === false), priv = B.test_cases.filter(c => c.visibility === 'private');
  ok(unpublished.length === 1 && priv.length === 1 && unpublished[0] !== priv[0], '(8) one unpublished + one private case');
  ok([...unpublished, ...priv].every(c => c.pt && c.pt.source_version === c.version && c.summary && c.description && c.objectives.length && c.history.length), '(8) extras complete with pt');
  ok(B.test_cases.filter(c => !unpublished.includes(c) && !priv.includes(c)).every(c => c.published === true && c.visibility === 'shared'), '(8) all others published + shared');
  // (9) caso SD-WAN: fail mais recente no Lab, pass anterior no tenant do Prisma Access
  const failCase = signed.find(c => c.testing.latest_signoff.result === 'fail') || { testing: { latest_by_environment: {}, latest_signoff: {} } };
  const lbe = failCase.testing.latest_by_environment;
  ok(Object.keys(lbe).length === 2 && failCase.testing.latest_signoff.environment_id === envNamed('Lab — Reference Topology')
    && (lbe[envNamed('Lab — Reference Topology')] || {}).result === 'fail' && (lbe[envNamed('Prisma Access tenant')] || {}).result === 'pass'
    && lbe[envNamed('Prisma Access tenant')].at < failCase.testing.latest_signoff.at, '(9) fail case: 2 environments (fail newest on Lab, pass older on Prisma Access)');
  // (10) um sign-off com ator "Unknown"
  ok(count(signed, c => c.testing.latest_signoff.actor.name === 'Unknown') === 1, '(10) exactly one "Unknown" sign-off actor');
  // (11) pré-requisitos completos
  ok(B.prerequisites.every(p => JSON.stringify(Object.keys(p)) === '["id","version","name","description"]' && typeof p.description === 'string' && p.name && Number.isInteger(p.version)), '(11) prerequisite keys');
  ok(count(B.prerequisites, p => p.description !== '') >= 3, '(11) >= 3 prerequisites with description');
  ok(count(B.test_cases, c => c.how_to !== '') >= 6, 'how_to >= 6');
  ok(B.test_cases.filter(c => c.how_to !== '').every(c => /^1\) .+\n2\) /.test(c.how_to)), 'how_to numbered');
  ok(count(B.test_cases, c => c.prereq_ids.length) >= 8, 'prereqs >= 8');
  ok(count(B.test_cases, c => c.value_drivers.length) >= 6, 'value_drivers >= 6');
  ok(count(B.test_cases, c => c.industry_ids.length) >= 5, 'industries >= 5');
  ok(count(B.test_cases, c => c.competitors.length) >= 8, 'competitors >= 8');
  const stances = new Set(B.test_cases.flatMap(c => c.competitors.map(x => x.stance)));
  ok(stances.size === 3, 'all stances used');
  ok(count(B.test_cases, c => c.notes.length) === 3, 'notes in exactly 3 cases');
  const kinds = new Set(B.test_cases.flatMap(c => c.history.map(h => h.kind)));
  ok(kinds.size === 3, 'history kinds transition/test/edit');
  const reasons = B.test_cases.flatMap(c => c.history.map(h => h.reason));
  ok(reasons.includes('Auto-transition') && reasons.includes(null), 'Auto-transition and null reasons');
  ok(count(B.test_cases, c => c.history.some(h => h.reason && h.reason !== 'Auto-transition')) >= 3, 'human reasons >= 3');
  ok(count(B.test_cases, c => c.description === '-' && c.expected_outcome === '') === 1, 'edge case "-"');
  ok(count(B.test_cases, c => !('pt' in c)) === 1, 'exactly one case without pt');
  ok(count(B.test_cases, c => c.pt && c.pt.source_version === c.version - 1) === 1, 'exactly one stale pt');
  ok(count(B.test_cases, c => c.node_ids.some(id => retiredIds.has(id))) === 2, 'retired nodes in exactly 2 cases');
  ok(B.test_cases.filter(c => c.node_ids.some(id => retiredIds.has(id))).every(c => domainOf(c) === 'SecOps' && c.taxonomy.filter(t => retiredIds.has(t.node_id)).length === 2), 'retired nodes only in SecOps cases');
  ok(count(B.test_cases, c => c.taxonomy.filter(t => t.depth === 1).length >= 2) >= 1, 'a case with 2 use cases');
  ok(new Set(B.test_cases.map(c => c.version)).size === 5, 'versions 1..5 all used');

  // nada de conteúdo real: nenhuma URL/host fora dos permitidos
  const text = JSON.stringify(B);
  const urls = text.match(/https?:\/\/[^"\s)]+/g) || [];
  ok(urls.every(u => u.startsWith('https://docs.paloaltonetworks.com/') || u.startsWith('https://intranet.example.com/') || u === 'https://pov-companion.example.com'), 'unexpected URL in bundle');
  ok(!/@(?!example\.com)[a-z0-9-]+\.[a-z]/i.test(text), 'unexpected e-mail domain');

  if (errors.length) {
    console.error('Self-check FAILED:\n  - ' + errors.join('\n  - '));
    process.exit(1);
  }
}

// ------------------------------------------------------------------ write

const HEADER = `/*
 * DemoBundle.js — GERADO AUTOMATICAMENTE por tools/make_demo_bundle.js. Não edite à mão.
 *
 * Dados SINTÉTICOS com o mesmo formato do .pt-BR.json produzido pelo pov-companion-collector.js
 * (bundle da Test Case Library com os blocos \`pt\` traduzidos). Usado pela ação de admin
 * "Carregar biblioteca de demonstração" e pelos testes.
 * NÃO é conteúdo real da biblioteca: casos, textos, ids, pessoas e concorrentes são fictícios.
 *
 * Para regenerar: node tools/make_demo_bundle.js
 */
`;

const built = build();
check(built);
const out = HEADER + 'var DEMO_BUNDLE = ' + JSON.stringify(built.bundle, null, 1) + ';\n';
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, out, 'utf8');
console.log(`OK: ${path.relative(process.cwd(), OUT_FILE) || OUT_FILE} — ${built.bundle.test_cases.length} test cases, ${built.bundle.taxonomy_nodes.length} taxonomy nodes, ${Buffer.byteLength(out)} bytes`);
