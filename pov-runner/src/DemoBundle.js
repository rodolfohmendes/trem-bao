/*
 * DemoBundle.js — GERADO AUTOMATICAMENTE por tools/make_demo_bundle.js. Não edite à mão.
 *
 * Dados SINTÉTICOS com o mesmo formato do .pt-BR.json produzido pelo pov-companion-collector.js
 * (bundle da Test Case Library com os blocos `pt` traduzidos). Usado pela ação de admin
 * "Carregar biblioteca de demonstração" e pelos testes.
 * NÃO é conteúdo real da biblioteca: casos, textos, ids, pessoas e concorrentes são fictícios.
 *
 * Para regenerar: node tools/make_demo_bundle.js
 */
var DEMO_BUNDLE = {
 "meta": {
  "source": "pov-companion-collector.js",
  "origin": "https://pov-companion.example.com",
  "exported_at": "2026-09-20T12:00:00.000Z",
  "library_total_reported": 26,
  "partial": false,
  "details_fetched": 0,
  "counts": {
   "test_cases": 26,
   "taxonomy_nodes": 25,
   "competitors": 4,
   "industries": 4,
   "value_drivers": 4,
   "environments": 5,
   "prerequisites": 6,
   "tools": 0
  },
  "facets": null,
  "translation": {
   "lang": "pt-BR",
   "translated_at": "2026-09-20T13:00:00.000Z",
   "method": "sintético (dados de demonstração)",
   "cases_translated": 25,
   "fields": [
    "name",
    "summary",
    "description",
    "objectives",
    "evaluation_metrics",
    "expected_outcome",
    "how_to",
    "notes"
   ]
  },
  "demo": true
 },
 "test_cases": [
  {
   "id": "05a032ba-8ebd-5d1c-a587-89e0e19cc9ac",
   "version": 3,
   "name": "ADEM: monitor user experience for SaaS applications",
   "summary": "Use ADEM to measure the end-to-end experience of remote users and isolate the segment that causes degradation.",
   "description": "The help desk receives complaints about slow video calls but cannot tell whether the problem is the device, the home network, the ISP or the application. This test enables ADEM synthetic tests and introduces latency on the lab Wi-Fi.",
   "objectives": [
    "Enable synthetic application tests for two SaaS applications.",
    "Identify the degraded segment after introducing latency."
   ],
   "evaluation_metrics": [
    "MTTR",
    "Pass/Fail"
   ],
   "expected_outcome": "ADEM shows the drop in the experience score and points to the local Wi-Fi segment as the cause.",
   "how_to": "",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-02-12T15:15:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
    "999db8af-0e97-519b-ae45-72ce529f5caf"
   ],
   "prereq_ids": [
    "77228bf9-b95d-538b-b99b-c36b752b1f98"
   ],
   "industry_ids": [],
   "value_drivers": [
    {
     "value_driver_id": "0693a370-12a3-5d91-adbb-a834d48535ef",
     "note": "Faster troubleshooting for the help desk."
    }
   ],
   "competitors": [
    {
     "competitor_id": "18f0b61d-a337-5c8e-ba05-6a00c8e414f6",
     "stance": "unknown",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "e293fc63-eeb1-5eca-b72e-dc7b22d85819",
     "label": "Autonomous DEM",
     "url": "https://docs.paloaltonetworks.com/autonomous-dem",
     "summary": "Synthetic tests, experience score and segment analysis.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "7642d4f0-cd1d-5670-874b-cc3b6fdd3c18",
     "at": "2026-06-24T10:45:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "53c7ebd0-5534-5f38-85b2-4befa37bd5e4",
     "at": "2026-06-24T10:45:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
     "assignee_id": null,
     "fields": [],
     "reason": null
    },
    {
     "id": "013fb657-b246-5e48-8310-ab2d22bf090a",
     "at": "2026-06-11T13:20:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "test-review",
     "to_state": "reviewed",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Scope confirmed with product team"
    }
   ],
   "author_id": "31f2ba13-cf14-599e-92bc-3871feb8da99",
   "assignee_id": null,
   "created_at": "2026-02-12T15:15:00.000000Z",
   "updated_at": "2026-06-24T10:45:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "53c7ebd0-5534-5f38-85b2-4befa37bd5e4",
     "at": "2026-06-24T10:45:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "cf2ba073-ed17-5d17-81d4-1bb3677d18d1": {
      "id": "53c7ebd0-5534-5f38-85b2-4befa37bd5e4",
      "at": "2026-06-24T10:45:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
     "name": "SASE",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#2e86de"
    },
    {
     "node_id": "999db8af-0e97-519b-ae45-72ce529f5caf",
     "name": "Digital Experience Monitoring",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "ADEM: monitorar a experiência do usuário em aplicações SaaS",
    "summary": "Usar o ADEM para medir a experiência de ponta a ponta dos usuários remotos e isolar o segmento que causa a degradação.",
    "description": "O help desk recebe reclamações sobre chamadas de vídeo lentas, mas não consegue dizer se o problema está no dispositivo, na rede doméstica, no ISP ou na aplicação. Este teste habilita os testes sintéticos do ADEM e introduz latência no Wi-Fi do laboratório.",
    "objectives": [
     "Habilitar testes sintéticos de aplicação para duas aplicações SaaS.",
     "Identificar o segmento degradado após introduzir latência."
    ],
    "evaluation_metrics": [
     "MTTR",
     "Aprovado/Reprovado"
    ],
    "expected_outcome": "O ADEM mostra a queda no experience score e aponta o segmento de Wi-Fi local como a causa.",
    "how_to": "",
    "notes": [],
    "source_version": 3,
    "source_updated_at": "2026-06-24T10:45:01.000000Z"
   }
  },
  {
   "id": "30094008-85fb-5c67-a321-65f8f6b473f1",
   "version": 1,
   "name": "Advanced DNS Security: detect DGA and DNS tunneling",
   "summary": "Demonstrate detection and sinkholing of DGA domains and DNS tunneling attempts.",
   "description": "Malware often uses algorithmically generated domains and DNS tunneling for command and control. This test replays DGA lookups and a DNS tunneling tool from a lab host.",
   "objectives": [
    "Detect lookups to DGA domains.",
    "Detect DNS tunneling traffic.",
    "Sinkhole malicious domains and identify the infected host.",
    "Forward DNS Security logs to Strata Logging Service.",
    "Review the results in the threat log."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "MTTD"
   ],
   "expected_outcome": "DGA and tunneling queries are detected, sinkholed and attributed to the source host.",
   "how_to": "",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-02-17T10:10:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
    "f32215b1-1cae-5d0f-a71b-24e82fba887c",
    "c21fe636-e2df-58c8-8bb4-092ee68bafba"
   ],
   "prereq_ids": [
    "680ea218-71ee-5581-b927-33d3c916c3bb",
    "9e7dc55c-7c27-5963-a909-6565dd2508e6"
   ],
   "industry_ids": [],
   "value_drivers": [
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "3a5ccbbb-91fe-50cc-a82a-08ed86f6df50",
     "stance": "advantage",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "c124fee4-1c39-52c6-bff3-c70f2d3c5d90",
     "label": "Advanced DNS Security administration",
     "url": "https://docs.paloaltonetworks.com/dns-security/administration",
     "summary": "DNS Security categories, sinkhole and logging.",
     "audience": "customer"
    },
    {
     "id": "720f92f9-8829-53fe-ab57-1460b456d580",
     "label": "DNS test domains",
     "url": "https://docs.paloaltonetworks.com/dns-security/administration/test-connectivity",
     "summary": "Test domains used to validate each detection category.",
     "audience": "internal"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "7d84e651-8245-569c-8e49-d7851472ef0d",
     "at": "2026-05-06T13:50:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "1c927c13-76e2-5c38-8393-2f594413fef1",
     "at": "2026-05-06T13:50:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
     "assignee_id": null,
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "cc60d71a-a31e-5ca6-94c4-6dca1859c342",
   "assignee_id": null,
   "created_at": "2026-02-17T10:10:00.000000Z",
   "updated_at": "2026-05-06T13:50:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "1c927c13-76e2-5c38-8393-2f594413fef1",
     "at": "2026-05-06T13:50:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "ed140dce-14cf-5908-accd-dd50e040209a": {
      "id": "1c927c13-76e2-5c38-8393-2f594413fef1",
      "at": "2026-05-06T13:50:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
     "name": "NGFW",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#e4572e"
    },
    {
     "node_id": "f32215b1-1cae-5d0f-a71b-24e82fba887c",
     "name": "Securing Internet Access",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "c21fe636-e2df-58c8-8bb4-092ee68bafba",
     "name": "Advanced Threat Prevention",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Advanced DNS Security: detectar DGA e tunelamento via DNS",
    "summary": "Demonstrar a detecção e o sinkhole de domínios DGA e de tentativas de tunelamento via DNS.",
    "description": "Malware frequentemente usa domínios gerados por algoritmo e tunelamento via DNS para comando e controle. Este teste reproduz consultas DGA e uma ferramenta de tunelamento via DNS a partir de um host do laboratório.",
    "objectives": [
     "Detectar consultas a domínios DGA.",
     "Detectar tráfego de tunelamento via DNS.",
     "Aplicar sinkhole aos domínios maliciosos e identificar o host infectado.",
     "Encaminhar os logs de DNS Security ao Strata Logging Service.",
     "Revisar os resultados no log de ameaças."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "MTTD"
    ],
    "expected_outcome": "As consultas DGA e de tunelamento são detectadas, direcionadas ao sinkhole e atribuídas ao host de origem.",
    "how_to": "",
    "notes": [],
    "source_version": 1,
    "source_updated_at": "2026-05-06T13:50:01.000000Z"
   }
  },
  {
   "id": "42ed23df-d183-5420-a77b-1defc795dcc6",
   "version": 1,
   "name": "Advanced Threat Prevention: block exploit attempts against data center servers",
   "summary": "Show that vulnerability protection blocks known exploit attempts against internal servers.",
   "description": "A lab attacker host launches exploits for public CVEs against a vulnerable test server placed in the data center zone. Advanced Threat Prevention is applied to the inter-zone rules.",
   "objectives": [
    "Block exploit attempts for at least five public CVEs."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "Number of exploits blocked"
   ],
   "expected_outcome": "All exploit attempts are blocked and logged with the matching threat ID and CVE.",
   "how_to": "",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-03-19T13:35:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
    "f32215b1-1cae-5d0f-a71b-24e82fba887c",
    "69440cf3-38b7-5237-b4b0-5fc18972f303",
    "c21fe636-e2df-58c8-8bb4-092ee68bafba"
   ],
   "prereq_ids": [
    "680ea218-71ee-5581-b927-33d3c916c3bb"
   ],
   "industry_ids": [],
   "value_drivers": [],
   "competitors": [
    {
     "competitor_id": "3a5ccbbb-91fe-50cc-a82a-08ed86f6df50",
     "stance": "advantage",
     "note": ""
    },
    {
     "competitor_id": "237b59fd-0e66-5901-ada3-6886b884a2c8",
     "stance": "advantage",
     "note": ""
    },
    {
     "competitor_id": "18f0b61d-a337-5c8e-ba05-6a00c8e414f6",
     "stance": "unknown",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "2cc2a146-a466-5488-b081-7cf5def04c4f",
     "label": "Advanced Threat Prevention administration",
     "url": "https://docs.paloaltonetworks.com/advanced-threat-prevention/administration",
     "summary": "Vulnerability protection profiles and threat logs.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "80b3e0e3-5259-5663-9fad-d00dd000a774",
     "at": "2026-06-10T10:20:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "b1b687ec-157f-542e-a033-e0aece6c69cf",
     "at": "2026-06-10T10:20:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
     "assignee_id": null,
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "cc60d71a-a31e-5ca6-94c4-6dca1859c342",
   "assignee_id": null,
   "created_at": "2026-03-19T13:35:00.000000Z",
   "updated_at": "2026-06-10T10:20:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "b1b687ec-157f-542e-a033-e0aece6c69cf",
     "at": "2026-06-10T10:20:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "ed140dce-14cf-5908-accd-dd50e040209a": {
      "id": "b1b687ec-157f-542e-a033-e0aece6c69cf",
      "at": "2026-06-10T10:20:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
     "name": "NGFW",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#e4572e"
    },
    {
     "node_id": "f32215b1-1cae-5d0f-a71b-24e82fba887c",
     "name": "Securing Internet Access",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "69440cf3-38b7-5237-b4b0-5fc18972f303",
     "name": "Data Center Segmentation",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "c21fe636-e2df-58c8-8bb4-092ee68bafba",
     "name": "Advanced Threat Prevention",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Advanced Threat Prevention: bloquear tentativas de exploit contra servidores do data center",
    "summary": "Mostrar que a proteção contra vulnerabilidades bloqueia tentativas conhecidas de exploit contra servidores internos.",
    "description": "Um host atacante do laboratório lança exploits para CVEs públicas contra um servidor de teste vulnerável posicionado na zona do data center. O Advanced Threat Prevention é aplicado às regras entre zonas.",
    "objectives": [
     "Bloquear tentativas de exploit para pelo menos cinco CVEs públicas."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "Número de exploits bloqueados"
    ],
    "expected_outcome": "Todas as tentativas de exploit são bloqueadas e registradas em log com o threat ID e a CVE correspondentes.",
    "how_to": "",
    "notes": [],
    "source_version": 1,
    "source_updated_at": "2026-06-10T10:20:01.000000Z"
   }
  },
  {
   "id": "bad1e6ac-6be4-5679-974a-a22a0cb63032",
   "version": 1,
   "name": "Advanced Threat Prevention: detect command-and-control traffic",
   "summary": "Show inline detection of command-and-control traffic from an infected lab host, including unknown C2 patterns.",
   "description": "An infected host sends beacons to an external server over HTTP and over custom protocols. This test runs a C2 simulation framework on a lab host and checks that Advanced Threat Prevention detects and blocks the traffic inline.",
   "objectives": [
    "Detect C2 beacons sent over HTTP.",
    "Detect C2 traffic that uses a custom protocol on a non-standard port.",
    "Identify the infected host in the threat log."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "MTTD"
   ],
   "expected_outcome": "C2 sessions are blocked and the infected host is identified in the threat log.",
   "how_to": "",
   "lifecycle": "test-review",
   "published": false,
   "visibility": "shared",
   "shared_at": "2026-08-18T10:00:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
    "f32215b1-1cae-5d0f-a71b-24e82fba887c",
    "c21fe636-e2df-58c8-8bb4-092ee68bafba"
   ],
   "prereq_ids": [
    "680ea218-71ee-5581-b927-33d3c916c3bb"
   ],
   "industry_ids": [],
   "value_drivers": [
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "3d850490-35a6-57ef-a962-04aa3c02aa8e",
     "stance": "advantage",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "30988349-a6db-5cc8-a449-e6d686111ed5",
     "label": "Advanced Threat Prevention administration",
     "url": "https://docs.paloaltonetworks.com/advanced-threat-prevention/administration",
     "summary": "Inline cloud analysis for command-and-control traffic.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "fa5e6bd9-e343-5617-a85c-3c3f0f8f3444",
     "at": "2026-08-18T10:00:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": null,
     "to_state": "test-review",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "31f2ba13-cf14-599e-92bc-3871feb8da99",
   "assignee_id": null,
   "created_at": "2026-08-18T10:00:00.000000Z",
   "updated_at": "2026-08-18T10:00:00.000000Z",
   "testing": {
    "latest_signoff": null,
    "latest_by_environment": {},
    "tested": false
   },
   "taxonomy": [
    {
     "node_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
     "name": "NGFW",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#e4572e"
    },
    {
     "node_id": "f32215b1-1cae-5d0f-a71b-24e82fba887c",
     "name": "Securing Internet Access",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "c21fe636-e2df-58c8-8bb4-092ee68bafba",
     "name": "Advanced Threat Prevention",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Advanced Threat Prevention: detectar tráfego de comando e controle",
    "summary": "Mostrar a detecção inline de tráfego de comando e controle a partir de um host infectado do laboratório, incluindo padrões de C2 desconhecidos.",
    "description": "Um host infectado envia beacons para um servidor externo via HTTP e via protocolos personalizados. Este teste executa um framework de simulação de C2 em um host do laboratório e verifica que o Advanced Threat Prevention detecta e bloqueia o tráfego inline.",
    "objectives": [
     "Detectar beacons de C2 enviados via HTTP.",
     "Detectar tráfego de C2 que usa um protocolo personalizado em uma porta não padrão.",
     "Identificar o host infectado no log de ameaças."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "MTTD"
    ],
    "expected_outcome": "As sessões de C2 são bloqueadas e o host infectado é identificado no log de ameaças.",
    "how_to": "",
    "notes": [],
    "source_version": 1,
    "source_updated_at": "2026-08-18T10:00:00.000000Z"
   }
  },
  {
   "id": "db600f83-95e6-58d0-9dbb-2acda993a967",
   "version": 2,
   "name": "Advanced URL Filtering: block phishing categories",
   "summary": "Demonstrate inline categorization and blocking of phishing and newly registered domains.",
   "description": "Users receive links to credential-harvesting pages hosted on newly registered domains. This test enables Advanced URL Filtering with inline cloud analysis and blocks the \"\"phishing\"\", \"\"malware\"\" and \"\"newly-registered-domain\"\" categories.",
   "objectives": [
    "Block access to URLs in the phishing category.",
    "Demonstrate inline cloud analysis on a page that is not yet categorized.",
    "Show the block page presented to the user.",
    "Review the URL Filtering log entries."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "Detection rate on test URLs"
   ],
   "expected_outcome": "Phishing URLs are blocked, the user sees the block page and each attempt is logged with its category.",
   "how_to": "1) Create a URL Filtering profile with phishing, malware and newly-registered-domain set to block.\n2) Enable inline cloud analysis in the profile.\n3) Attach the profile to the outbound security policy rule.\n4) Browse to the test URLs from the test endpoint.\n5) Review Monitor > Logs > URL Filtering.",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-01-20T14:00:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
    "f32215b1-1cae-5d0f-a71b-24e82fba887c",
    "588276ef-03f0-549a-8097-8698dfcaf90c"
   ],
   "prereq_ids": [
    "680ea218-71ee-5581-b927-33d3c916c3bb",
    "962eb694-c351-5077-9cfb-379d75fa4f46"
   ],
   "industry_ids": [
    "c933ac16-3ac5-5a90-bc71-f6da0fe05685",
    "b80a06f2-3755-5426-b0c8-6752330c1391"
   ],
   "value_drivers": [
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "3a5ccbbb-91fe-50cc-a82a-08ed86f6df50",
     "stance": "advantage",
     "note": ""
    },
    {
     "competitor_id": "3d850490-35a6-57ef-a962-04aa3c02aa8e",
     "stance": "unknown",
     "note": "Not evaluated in the lab."
    }
   ],
   "docs": [
    {
     "id": "14edd68b-1832-5226-ba5f-876c19796df8",
     "label": "Advanced URL Filtering administration",
     "url": "https://docs.paloaltonetworks.com/advanced-url-filtering/administration",
     "summary": "Configure URL Filtering profiles and inline categorization.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "c0423a51-16a3-505e-8013-ad9597253f7b",
     "at": "2026-04-09T16:10:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "b35ce2dc-1ade-515b-b0b0-73940998e712",
     "at": "2026-04-09T16:10:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
     "assignee_id": null,
     "fields": [],
     "reason": null
    },
    {
     "id": "fd163b75-cb02-5d97-a620-25ac4add005c",
     "at": "2026-03-27T09:30:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "test-review",
     "to_state": "reviewed",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Validated in lab"
    }
   ],
   "author_id": "853d0cc2-de3f-5391-84bd-1387b6c4751d",
   "assignee_id": null,
   "created_at": "2026-01-20T14:00:00.000000Z",
   "updated_at": "2026-04-09T16:10:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "b35ce2dc-1ade-515b-b0b0-73940998e712",
     "at": "2026-04-09T16:10:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "ed140dce-14cf-5908-accd-dd50e040209a": {
      "id": "b35ce2dc-1ade-515b-b0b0-73940998e712",
      "at": "2026-04-09T16:10:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
     "name": "NGFW",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#e4572e"
    },
    {
     "node_id": "f32215b1-1cae-5d0f-a71b-24e82fba887c",
     "name": "Securing Internet Access",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "588276ef-03f0-549a-8097-8698dfcaf90c",
     "name": "URL Filtering and Content Filtering",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Advanced URL Filtering: bloquear categorias de phishing",
    "summary": "Demonstrar a categorização inline e o bloqueio de phishing e de domínios recém-registrados.",
    "description": "Os usuários recebem links para páginas de coleta de credenciais hospedadas em domínios recém-registrados. Este teste habilita o Advanced URL Filtering com análise inline na nuvem e bloqueia as categorias \"phishing\", \"malware\" e \"newly-registered-domain\".",
    "objectives": [
     "Bloquear o acesso a URLs da categoria phishing.",
     "Demonstrar a análise inline na nuvem em uma página que ainda não foi categorizada.",
     "Mostrar a página de bloqueio apresentada ao usuário.",
     "Revisar as entradas de log de URL Filtering."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "Taxa de detecção nas URLs de teste"
    ],
    "expected_outcome": "As URLs de phishing são bloqueadas, o usuário vê a página de bloqueio e cada tentativa é registrada em log com sua categoria.",
    "how_to": "1) Criar um perfil de URL Filtering com phishing, malware e newly-registered-domain configurados como block.\n2) Habilitar a análise inline na nuvem no perfil.\n3) Anexar o perfil à regra de política de segurança de saída.\n4) Navegar até as URLs de teste a partir do endpoint de teste.\n5) Revisar Monitor > Logs > URL Filtering.",
    "notes": [],
    "source_version": 2,
    "source_updated_at": "2026-04-09T16:10:01.000000Z"
   }
  },
  {
   "id": "a58c571c-6068-51f8-9235-e7bf451ba89d",
   "version": 2,
   "name": "Advanced WildFire: detect unknown malware in sandbox",
   "summary": "Show that unknown files are analyzed in the sandbox and that a verdict and protection are delivered automatically.",
   "description": "The firewall forwards unknown files seen in allowed traffic to Advanced WildFire. The test downloads benign test samples and a WildFire test file to confirm forwarding, verdict and signature distribution.",
   "objectives": [
    "Download the WildFire test file described at https://docs.paloaltonetworks.com/advanced-wildfire/administration/verify-wildfire-submissions and verify that it receives a malicious verdict.",
    "Show the WildFire analysis report for the sample."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "Time to verdict"
   ],
   "expected_outcome": "The test file is forwarded, receives a malicious verdict and a subsequent download is blocked.",
   "how_to": "",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-02-03T11:45:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
    "f32215b1-1cae-5d0f-a71b-24e82fba887c",
    "c21fe636-e2df-58c8-8bb4-092ee68bafba"
   ],
   "prereq_ids": [],
   "industry_ids": [],
   "value_drivers": [],
   "competitors": [
    {
     "competitor_id": "237b59fd-0e66-5901-ada3-6886b884a2c8",
     "stance": "advantage",
     "note": ""
    },
    {
     "competitor_id": "18f0b61d-a337-5c8e-ba05-6a00c8e414f6",
     "stance": "parity",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "82e89c08-c3ef-5801-8c58-c2c9dad4067f",
     "label": "Advanced WildFire administration",
     "url": "https://docs.paloaltonetworks.com/advanced-wildfire/administration",
     "summary": "File forwarding, verdicts and test files.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "cc281a8b-9c63-5a73-9485-746f639bd12a",
     "at": "2026-04-22T14:25:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "35749cf1-3fb7-5854-870b-3180b33676cc",
     "at": "2026-04-22T14:25:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "31f2ba13-cf14-599e-92bc-3871feb8da99",
   "assignee_id": null,
   "created_at": "2026-02-03T11:45:00.000000Z",
   "updated_at": "2026-04-22T14:25:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "35749cf1-3fb7-5854-870b-3180b33676cc",
     "at": "2026-04-22T14:25:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "2d904bf9-d706-590b-9b76-f4e185f44787": {
      "id": "35749cf1-3fb7-5854-870b-3180b33676cc",
      "at": "2026-04-22T14:25:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
     "name": "NGFW",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#e4572e"
    },
    {
     "node_id": "f32215b1-1cae-5d0f-a71b-24e82fba887c",
     "name": "Securing Internet Access",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "c21fe636-e2df-58c8-8bb4-092ee68bafba",
     "name": "Advanced Threat Prevention",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Advanced WildFire: detectar malware desconhecido em sandbox",
    "summary": "Mostrar que arquivos desconhecidos são analisados na sandbox e que um veredito e a proteção são entregues automaticamente.",
    "description": "O firewall encaminha para o Advanced WildFire os arquivos desconhecidos vistos no tráfego permitido. O teste baixa amostras de teste benignas e um arquivo de teste do WildFire para confirmar o encaminhamento, o veredito e a distribuição de assinaturas.",
    "objectives": [
     "Baixar o arquivo de teste do WildFire descrito em https://docs.paloaltonetworks.com/advanced-wildfire/administration/verify-wildfire-submissions e verificar que ele recebe um veredito malicious.",
     "Mostrar o relatório de análise do WildFire para a amostra."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "Tempo até o veredito"
    ],
    "expected_outcome": "O arquivo de teste é encaminhado, recebe um veredito malicious e um download posterior é bloqueado.",
    "how_to": "",
    "notes": [],
    "source_version": 2,
    "source_updated_at": "2026-04-22T14:25:01.000000Z"
   }
  },
  {
   "id": "c1524c64-6cf7-5861-86d5-de97dd6493e1",
   "version": 2,
   "name": "AI Access Security: control GenAI app usage",
   "summary": "Discover the GenAI applications in use and apply controls for sanctioned, tolerated and unsanctioned applications.",
   "description": "-",
   "objectives": [
    "Discover the GenAI applications used in the last 7 days.",
    "Block uploads to unsanctioned GenAI applications."
   ],
   "evaluation_metrics": [
    "Pass/Fail"
   ],
   "expected_outcome": "",
   "how_to": "",
   "lifecycle": "draft",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-08-04T16:00:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
    "b7c11b34-d42e-5de3-8e87-169c3254628d",
    "9d809db2-5932-53ce-a50c-4e13fe95ba03"
   ],
   "prereq_ids": [],
   "industry_ids": [],
   "value_drivers": [],
   "competitors": [],
   "docs": [],
   "notes": [],
   "history": [
    {
     "id": "6990dce6-76b2-5667-a43f-8709f045ae78",
     "at": "2026-08-12T09:40:00.000000Z",
     "actor": {
      "user_id": "cc60d71a-a31e-5ca6-94c4-6dca1859c342",
      "name": "Demo Author 2",
      "email": "author2@example.com",
      "on_behalf_of": null
     },
     "kind": "edit",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": null,
     "fields": [
      "objectives"
     ],
     "reason": null
    }
   ],
   "author_id": "cc60d71a-a31e-5ca6-94c4-6dca1859c342",
   "assignee_id": null,
   "created_at": "2026-08-04T16:00:00.000000Z",
   "updated_at": "2026-08-12T09:40:00.000000Z",
   "testing": {
    "latest_signoff": null,
    "latest_by_environment": {},
    "tested": false
   },
   "taxonomy": [
    {
     "node_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
     "name": "SASE",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#2e86de"
    },
    {
     "node_id": "b7c11b34-d42e-5de3-8e87-169c3254628d",
     "name": "Secure Remote Access",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "9d809db2-5932-53ce-a50c-4e13fe95ba03",
     "name": "SaaS and Data Protection",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "AI Access Security: controlar o uso de aplicações de GenAI",
    "summary": "Descobrir as aplicações de GenAI em uso e aplicar controles para aplicações autorizadas, toleradas e não autorizadas.",
    "description": "-",
    "objectives": [
     "Descobrir as aplicações de GenAI usadas nos últimos 7 dias.",
     "Bloquear uploads para aplicações de GenAI não autorizadas."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado"
    ],
    "expected_outcome": "",
    "how_to": "",
    "notes": [],
    "source_version": 2,
    "source_updated_at": "2026-08-12T09:40:00.000000Z"
   }
  },
  {
   "id": "8c23af92-1939-5803-8085-c3d0003b548b",
   "version": 2,
   "name": "Alert grouping reduces analyst fatigue",
   "summary": "Measure how many raw alerts are grouped into incidents over one week of lab data.",
   "description": "Analysts spend most of their time triaging duplicate alerts. This test compares the number of raw alerts with the number of incidents after grouping.",
   "objectives": [
    "Compare raw alerts and incidents for the same period."
   ],
   "evaluation_metrics": [
    "> 80% reduction in alerts",
    "MTTR"
   ],
   "expected_outcome": "The number of incidents is at least 80% lower than the number of raw alerts.",
   "how_to": "",
   "lifecycle": "deprecated",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-01-16T09:05:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "49bc07ea-a6a8-56f3-b4ad-d003ae7e62d3",
    "8bdb7daa-c744-5112-aa22-37ef28624529",
    "843f0898-a241-58e6-827d-5284afb07555"
   ],
   "prereq_ids": [],
   "industry_ids": [],
   "value_drivers": [
    "3ad8092e-c7eb-5ceb-b314-0bba2318cf9d"
   ],
   "competitors": [
    {
     "competitor_id": "237b59fd-0e66-5901-ada3-6886b884a2c8",
     "stance": "unknown",
     "note": ""
    }
   ],
   "docs": [],
   "notes": [],
   "history": [
    {
     "id": "9a4611ee-af48-57d4-a717-5e76b5a6319e",
     "at": "2026-06-29T16:20:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "deprecated",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Superseded by a newer test case"
    },
    {
     "id": "cf74c160-e88a-5901-97d7-4b49633a25be",
     "at": "2026-01-16T09:05:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": null,
     "to_state": "reviewed",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "853d0cc2-de3f-5391-84bd-1387b6c4751d",
   "assignee_id": null,
   "created_at": "2026-01-16T09:05:00.000000Z",
   "updated_at": "2026-06-29T16:20:00.000000Z",
   "testing": {
    "latest_signoff": null,
    "latest_by_environment": {},
    "tested": false
   },
   "taxonomy": [
    {
     "node_id": "dbeb9348-8c18-538d-8080-54fc337f08f1",
     "name": "SecOps",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#8e44ad"
    },
    {
     "node_id": "49bc07ea-a6a8-56f3-b4ad-d003ae7e62d3",
     "name": "XSIAM",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#5b6c8f"
    },
    {
     "node_id": "8bdb7daa-c744-5112-aa22-37ef28624529",
     "name": "Incident Response Automation",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "843f0898-a241-58e6-827d-5284afb07555",
     "name": "Enhance SOC Efficiency",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "O agrupamento de alertas reduz a fadiga dos analistas",
    "summary": "Medir quantos alertas brutos são agrupados em incidentes ao longo de uma semana de dados do laboratório.",
    "description": "Os analistas passam a maior parte do tempo fazendo a triagem de alertas duplicados. Este teste compara o número de alertas brutos com o número de incidentes após o agrupamento.",
    "objectives": [
     "Comparar alertas brutos e incidentes no mesmo período."
    ],
    "evaluation_metrics": [
     "> 80% de redução nos alertas",
     "MTTR"
    ],
    "expected_outcome": "O número de incidentes é pelo menos 80% menor que o número de alertas brutos.",
    "how_to": "",
    "notes": [],
    "source_version": 2,
    "source_updated_at": "2026-06-29T16:20:00.000000Z"
   }
  },
  {
   "id": "d0cb3991-c7f6-57bd-a333-b703e93a8659",
   "version": 3,
   "name": "App-ID: block unsanctioned applications",
   "summary": "Show that App-ID identifies and blocks unsanctioned applications regardless of port, protocol or evasive techniques.",
   "description": "The customer wants to prevent the use of unsanctioned applications (for example, remote access tools and personal file sharing) on the corporate network. This test uses App-ID in the security policy to allow sanctioned applications and block the rest.",
   "objectives": [
    "Verify that App-ID identifies the application in the traffic log, not only the port.",
    "Demonstrate a security policy rule with action \"\"Deny\"\" that blocks an unsanctioned application category.",
    "Validate that sanctioned applications keep working after the rule is applied."
   ],
   "evaluation_metrics": [
    "Pass/Fail"
   ],
   "expected_outcome": "Unsanctioned applications are blocked and logged with the correct application name; sanctioned applications are allowed.",
   "how_to": "1) Create an application filter for the unsanctioned category.\n2) Add a security policy rule that denies the filter above the allow rules.\n3) From a test endpoint, open the unsanctioned application.\n4) Check Monitor > Logs > Traffic for the deny entries.",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-01-14T13:20:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
    "00731697-9610-5d4c-b1e0-495924c6157a",
    "9a97cfed-597b-5e8c-b3e2-cb70069736a8"
   ],
   "prereq_ids": [
    "680ea218-71ee-5581-b927-33d3c916c3bb"
   ],
   "industry_ids": [],
   "value_drivers": [
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    },
    {
     "value_driver_id": "ceac6358-c623-5c44-97be-876db394b7f9",
     "note": "Replaces a separate proxy for application control."
    }
   ],
   "competitors": [
    {
     "competitor_id": "3a5ccbbb-91fe-50cc-a82a-08ed86f6df50",
     "stance": "advantage",
     "note": ""
    },
    {
     "competitor_id": "237b59fd-0e66-5901-ada3-6886b884a2c8",
     "stance": "parity",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "ae25976e-7c51-579a-8d56-ff34aab2044f",
     "label": "App-ID overview",
     "url": "https://docs.paloaltonetworks.com/pan-os/11-2/pan-os-admin/app-id",
     "summary": "How App-ID identifies applications and how to use them in policy.",
     "audience": "customer"
    },
    {
     "id": "40c0abb3-6ee4-551f-8e73-13c8faa79785",
     "label": "App-ID demo checklist",
     "url": "https://docs.paloaltonetworks.com/best-practices",
     "summary": "Checklist to prepare the application control demonstration.",
     "audience": "internal"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "60b5a129-b8cf-59d1-b72b-43a950d517f4",
     "at": "2026-06-18T15:05:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": [],
     "reason": null
    },
    {
     "id": "664ed88f-9ae0-52ef-9884-eaa1a6a0bb29",
     "at": "2026-03-02T10:40:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "af75e64f-dc98-5706-a04c-d59777384191",
     "at": "2026-03-02T10:40:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
     "assignee_id": null,
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "853d0cc2-de3f-5391-84bd-1387b6c4751d",
   "assignee_id": null,
   "created_at": "2026-01-14T13:20:00.000000Z",
   "updated_at": "2026-06-18T15:05:00.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "60b5a129-b8cf-59d1-b72b-43a950d517f4",
     "at": "2026-06-18T15:05:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "2d904bf9-d706-590b-9b76-f4e185f44787": {
      "id": "60b5a129-b8cf-59d1-b72b-43a950d517f4",
      "at": "2026-06-18T15:05:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
      "assignee_id": null,
      "fields": null,
      "reason": null
     },
     "ed140dce-14cf-5908-accd-dd50e040209a": {
      "id": "af75e64f-dc98-5706-a04c-d59777384191",
      "at": "2026-03-02T10:40:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
     "name": "NGFW",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#e4572e"
    },
    {
     "node_id": "00731697-9610-5d4c-b1e0-495924c6157a",
     "name": "Application Control",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "9a97cfed-597b-5e8c-b3e2-cb70069736a8",
     "name": "App-ID Policy",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "App-ID: bloquear aplicações não autorizadas",
    "summary": "Mostrar que o App-ID identifica e bloqueia aplicações não autorizadas independentemente de porta, protocolo ou técnicas evasivas.",
    "description": "O cliente quer impedir o uso de aplicações não autorizadas (por exemplo, ferramentas de acesso remoto e compartilhamento pessoal de arquivos) na rede corporativa. Este teste usa App-ID na política de segurança para permitir as aplicações autorizadas e bloquear as demais.",
    "objectives": [
     "Verificar que o App-ID identifica a aplicação no log de tráfego, e não apenas a porta.",
     "Demonstrar uma regra de política de segurança com ação \"Deny\" que bloqueia uma categoria de aplicações não autorizadas.",
     "Validar que as aplicações autorizadas continuam funcionando depois que a regra é aplicada."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado"
    ],
    "expected_outcome": "As aplicações não autorizadas são bloqueadas e registradas em log com o nome correto da aplicação; as aplicações autorizadas são permitidas.",
    "how_to": "1) Criar um filtro de aplicações para a categoria não autorizada.\n2) Adicionar uma regra de política de segurança que nega o filtro acima das regras de permissão.\n3) A partir de um endpoint de teste, abrir a aplicação não autorizada.\n4) Verificar Monitor > Logs > Traffic para as entradas de negação.",
    "notes": [],
    "source_version": 3,
    "source_updated_at": "2026-06-18T15:05:00.000000Z"
   }
  },
  {
   "id": "324b6d9d-c8d9-5689-a42f-ad87b04b0109",
   "version": 3,
   "name": "App-ID: control applications on non-standard ports",
   "summary": "Verify that applications are identified and controlled when they run on non-standard ports.",
   "description": "Many applications can be moved to arbitrary ports to evade port-based rules. This test runs a known application on a non-standard port and checks that App-ID still identifies it and applies the policy.",
   "objectives": [
    "Run SSH on TCP port 8443 and verify that it is identified as ssh.",
    "Use the application-default service so that ssh is only allowed on its standard port."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "Time to configure < 15 minutes"
   ],
   "expected_outcome": "ssh on port 8443 is identified correctly and denied by the rule that uses application-default.",
   "how_to": "",
   "lifecycle": "test-review",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-02-10T09:00:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
    "00731697-9610-5d4c-b1e0-495924c6157a",
    "9a97cfed-597b-5e8c-b3e2-cb70069736a8"
   ],
   "prereq_ids": [
    "680ea218-71ee-5581-b927-33d3c916c3bb"
   ],
   "industry_ids": [],
   "value_drivers": [],
   "competitors": [],
   "docs": [
    {
     "id": "e19f98e7-1b6c-501c-ae76-645b43b7d17e",
     "label": "Application-default service",
     "url": "https://docs.paloaltonetworks.com/pan-os/11-2/pan-os-admin/app-id/use-application-objects-in-policy",
     "summary": "Using the application-default service in security policy rules.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "1505c1a1-cb6f-53e6-9605-fcc69ca61704",
     "at": "2026-07-21T16:40:00.000000Z",
     "actor": {
      "user_id": "cc60d71a-a31e-5ca6-94c4-6dca1859c342",
      "name": "Demo Author 2",
      "email": "author2@example.com",
      "on_behalf_of": null
     },
     "kind": "edit",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": null,
     "fields": [
      "objectives",
      "expected_outcome"
     ],
     "reason": null
    },
    {
     "id": "6adc70e6-7618-5686-9fbc-f197cd1b732a",
     "at": "2026-06-30T11:15:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "test-review",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Needs updated screenshots"
    },
    {
     "id": "823a0e2c-79f7-58e8-ac10-b1dfbaa3a760",
     "at": "2026-03-04T10:20:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "test-review",
     "to_state": "reviewed",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    },
    {
     "id": "63dd818a-f8ed-5a28-9015-bf86f35757fe",
     "at": "2026-02-10T09:00:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": null,
     "to_state": "test-review",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "cc60d71a-a31e-5ca6-94c4-6dca1859c342",
   "assignee_id": null,
   "created_at": "2026-02-10T09:00:00.000000Z",
   "updated_at": "2026-07-21T16:40:00.000000Z",
   "testing": {
    "latest_signoff": null,
    "latest_by_environment": {},
    "tested": false
   },
   "taxonomy": [
    {
     "node_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
     "name": "NGFW",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#e4572e"
    },
    {
     "node_id": "00731697-9610-5d4c-b1e0-495924c6157a",
     "name": "Application Control",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "9a97cfed-597b-5e8c-b3e2-cb70069736a8",
     "name": "App-ID Policy",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "App-ID: controlar aplicações em portas não padrão",
    "summary": "Verificar que as aplicações são identificadas e controladas quando executadas em portas não padrão.",
    "description": "Muitas aplicações podem ser movidas para portas arbitrárias para evadir regras baseadas em porta. Este teste executa uma aplicação conhecida em uma porta não padrão e verifica que o App-ID ainda a identifica e aplica a política.",
    "objectives": [
     "Executar SSH na porta TCP 8080 e verificar que é identificado como ssh.",
     "Usar o serviço application-default para que ssh seja permitido apenas em sua porta padrão."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "Tempo de configuração < 15 minutos"
    ],
    "expected_outcome": "O ssh na porta 8080 é identificado corretamente e negado pela regra que usa application-default.",
    "how_to": "",
    "notes": [],
    "source_version": 2,
    "source_updated_at": "2026-06-30T11:15:00.000000Z"
   }
  },
  {
   "id": "6b8350a3-f9a3-5ea4-8428-745226ff11b5",
   "version": 1,
   "name": "Automated containment playbook",
   "summary": "Run a playbook that isolates the endpoint, blocks the indicator on the firewall and opens a ticket.",
   "description": "Containment today depends on manual steps across three teams. This test triggers a playbook from a malware incident that isolates the host, adds the malicious domain to an external dynamic list and opens a ticket in the ticketing system.",
   "objectives": [
    "Trigger the playbook automatically from a malware incident.",
    "Isolate the affected endpoint.",
    "Block the malicious domain on the firewall through an external dynamic list.",
    "Open a ticket with the incident summary.",
    "Measure the time from detection to containment."
   ],
   "evaluation_metrics": [
    "MTTR",
    "Pass/Fail",
    "Manual steps removed"
   ],
   "expected_outcome": "- The endpoint is isolated.\n- The domain is blocked on the firewall.\n- A ticket is opened without manual action.",
   "how_to": "1) Import the containment playbook and set it as the default for malware incidents.\n2) Configure the firewall and ticketing integrations.\n3) Run the test malware sample on the lab host.\n4) Follow the playbook run in the incident work plan.",
   "lifecycle": "test-review",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-07-06T13:10:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "dbeb9348-8c18-538d-8080-54fc337f08f1",
    "8bdb7daa-c744-5112-aa22-37ef28624529",
    "cef43209-8214-57e1-b481-3227749831de"
   ],
   "prereq_ids": [
    "f764d1e3-d94f-5733-b8e5-9ba69d31b607",
    "9e7dc55c-7c27-5963-a909-6565dd2508e6"
   ],
   "industry_ids": [],
   "value_drivers": [
    {
     "value_driver_id": "3ad8092e-c7eb-5ceb-b314-0bba2318cf9d",
     "note": ""
    },
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "3a5ccbbb-91fe-50cc-a82a-08ed86f6df50",
     "stance": "parity",
     "note": ""
    },
    {
     "competitor_id": "18f0b61d-a337-5c8e-ba05-6a00c8e414f6",
     "stance": "advantage",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "8a06ef3d-0210-58b6-932a-7fa5461b9944",
     "label": "Playbooks",
     "url": "https://docs.paloaltonetworks.com/cortex/cortex-xsiam/playbooks",
     "summary": "Building and triggering automation playbooks.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "8c57341c-7577-5916-a686-cb77e18280a6",
     "at": "2026-07-06T13:10:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": null,
     "to_state": "test-review",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "cc60d71a-a31e-5ca6-94c4-6dca1859c342",
   "assignee_id": null,
   "created_at": "2026-07-06T13:10:00.000000Z",
   "updated_at": "2026-07-06T13:10:00.000000Z",
   "testing": {
    "latest_signoff": null,
    "latest_by_environment": {},
    "tested": false
   },
   "taxonomy": [
    {
     "node_id": "dbeb9348-8c18-538d-8080-54fc337f08f1",
     "name": "SecOps",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#8e44ad"
    },
    {
     "node_id": "8bdb7daa-c744-5112-aa22-37ef28624529",
     "name": "Incident Response Automation",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "cef43209-8214-57e1-b481-3227749831de",
     "name": "Playbook-driven Containment",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Playbook de contenção automatizada",
    "summary": "Executar um playbook que isola o endpoint, bloqueia o indicador no firewall e abre um ticket.",
    "description": "Hoje a contenção depende de passos manuais entre três equipes. Este teste dispara um playbook a partir de um incidente de malware que isola o host, adiciona o domínio malicioso a uma external dynamic list e abre um ticket no sistema de tickets.",
    "objectives": [
     "Disparar o playbook automaticamente a partir de um incidente de malware.",
     "Isolar o endpoint afetado.",
     "Bloquear o domínio malicioso no firewall por meio de uma external dynamic list.",
     "Abrir um ticket com o resumo do incidente.",
     "Medir o tempo desde a detecção até a contenção."
    ],
    "evaluation_metrics": [
     "MTTR",
     "Aprovado/Reprovado",
     "Passos manuais eliminados"
    ],
    "expected_outcome": "- O endpoint é isolado.\n- O domínio é bloqueado no firewall.\n- Um ticket é aberto sem ação manual.",
    "how_to": "1) Importar o playbook de contenção e defini-lo como padrão para incidentes de malware.\n2) Configurar as integrações com o firewall e com o sistema de tickets.\n3) Executar a amostra de malware de teste no host do laboratório.\n4) Acompanhar a execução do playbook no work plan do incidente.",
    "notes": [],
    "source_version": 1,
    "source_updated_at": "2026-07-06T13:10:00.000000Z"
   }
  },
  {
   "id": "33d47561-bbbe-59c0-b0b1-01469f56335d",
   "version": 2,
   "name": "CIEM: identify over-privileged cloud identities",
   "summary": "Find identities with unused or excessive permissions and suggest least-privilege policies.",
   "description": "Cloud identities accumulate permissions over time. This test reviews the effective permissions of users and roles in the onboarded account and highlights unused permissions.",
   "objectives": [
    "List the identities with administrative permissions.",
    "Show unused permissions over the last 90 days.",
    "-"
   ],
   "evaluation_metrics": [
    "Pass/Fail"
   ],
   "expected_outcome": "Over-privileged identities are listed with a recommended least-privilege policy.",
   "how_to": "",
   "lifecycle": "reviewed",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-04-14T13:45:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
    "7f2eac05-d581-5e01-8439-dff2efce29dc"
   ],
   "prereq_ids": [
    "d29f1e12-81a9-521c-a4b0-e0fd6367dcde"
   ],
   "industry_ids": [],
   "value_drivers": [
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    }
   ],
   "competitors": [],
   "docs": [],
   "notes": [],
   "history": [
    {
     "id": "ea3cf1f2-018d-556b-9795-56c1a3f5efc5",
     "at": "2026-07-02T15:00:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "test-review",
     "to_state": "reviewed",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Steps reviewed; ready for lab"
    },
    {
     "id": "abf67208-1d3e-596e-b369-591908f8afc7",
     "at": "2026-04-14T13:45:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": null,
     "to_state": "test-review",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "cc60d71a-a31e-5ca6-94c4-6dca1859c342",
   "assignee_id": null,
   "created_at": "2026-04-14T13:45:00.000000Z",
   "updated_at": "2026-07-02T15:00:00.000000Z",
   "testing": {
    "latest_signoff": null,
    "latest_by_environment": {},
    "tested": false
   },
   "taxonomy": [
    {
     "node_id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
     "name": "Cloud",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#10ac84"
    },
    {
     "node_id": "7f2eac05-d581-5e01-8439-dff2efce29dc",
     "name": "Cloud Security Posture",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "CIEM: identificar identidades de nuvem com privilégios excessivos",
    "summary": "Encontrar identidades com permissões não usadas ou excessivas e sugerir políticas de menor privilégio.",
    "description": "As identidades de nuvem acumulam permissões ao longo do tempo. Este teste revisa as permissões efetivas de usuários e roles na conta que passou pelo onboarding e destaca as permissões não usadas.",
    "objectives": [
     "Listar as identidades com permissões administrativas.",
     "Mostrar as permissões não usadas nos últimos 90 dias.",
     "-"
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado"
    ],
    "expected_outcome": "As identidades com privilégios excessivos são listadas com uma política de menor privilégio recomendada.",
    "how_to": "",
    "notes": [],
    "source_version": 2,
    "source_updated_at": "2026-07-02T15:00:00.000000Z"
   }
  },
  {
   "id": "13157127-8f2e-5a98-9e83-573b2eb8f1fc",
   "version": 3,
   "name": "Cortex XDR: isolate a compromised endpoint",
   "summary": "Isolate a compromised endpoint from the network while keeping it connected to the console for investigation.",
   "description": "When an endpoint is compromised, the SOC must cut its network access quickly without losing visibility. This test isolates a lab host from the console and verifies that only the console communication remains.",
   "objectives": [
    "Isolate the host from the console.",
    "Verify that the host can still be investigated with Live Terminal."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "Time to isolate < 1 minute"
   ],
   "expected_outcome": "The host loses network access except for the console connection, and the isolation is recorded in the audit log.",
   "how_to": "",
   "lifecycle": "reviewed",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-05-27T11:30:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "dbeb9348-8c18-538d-8080-54fc337f08f1",
    "8bdb7daa-c744-5112-aa22-37ef28624529",
    "f8f9a071-aa50-50ae-8fec-fc916740d37a"
   ],
   "prereq_ids": [
    "f764d1e3-d94f-5733-b8e5-9ba69d31b607"
   ],
   "industry_ids": [],
   "value_drivers": [],
   "competitors": [],
   "docs": [
    {
     "id": "f07703ff-9011-5240-ac4e-4a83181d21b1",
     "label": "Isolate an endpoint",
     "url": "https://docs.paloaltonetworks.com/cortex/cortex-xdr/response-actions",
     "summary": "Network isolation and Live Terminal response actions.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "06e69cce-1654-5aeb-8c93-b33213af5f43",
     "at": "2026-09-15T14:50:00.000000Z",
     "actor": {
      "user_id": "853d0cc2-de3f-5391-84bd-1387b6c4751d",
      "name": "Demo Author 1",
      "email": "author1@example.com",
      "on_behalf_of": null
     },
     "kind": "edit",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": null,
     "fields": [
      "description"
     ],
     "reason": null
    },
    {
     "id": "3bc8da33-fe25-549e-acb5-efbc6b07936a",
     "at": "2026-08-19T10:30:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "test-review",
     "to_state": "reviewed",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    },
    {
     "id": "870ed644-c1d3-5a46-a1c6-129fcdda0781",
     "at": "2026-05-27T11:30:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": null,
     "to_state": "test-review",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "853d0cc2-de3f-5391-84bd-1387b6c4751d",
   "assignee_id": null,
   "created_at": "2026-05-27T11:30:00.000000Z",
   "updated_at": "2026-09-15T14:50:00.000000Z",
   "testing": {
    "latest_signoff": null,
    "latest_by_environment": {},
    "tested": false
   },
   "taxonomy": [
    {
     "node_id": "dbeb9348-8c18-538d-8080-54fc337f08f1",
     "name": "SecOps",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#8e44ad"
    },
    {
     "node_id": "8bdb7daa-c744-5112-aa22-37ef28624529",
     "name": "Incident Response Automation",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "f8f9a071-aa50-50ae-8fec-fc916740d37a",
     "name": "Endpoint Protection",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    }
   ]
  },
  {
   "id": "335dbac5-1109-5e16-94a9-cd4de215c03c",
   "version": 2,
   "name": "Cortex XDR: prevent credential theft from memory",
   "summary": "Show that the XDR agent blocks attempts to read credentials from the memory of the authentication process.",
   "description": "Attackers dump credentials from memory to move laterally. This test runs common credential dumping techniques on a protected lab host and checks prevention and the resulting alert.",
   "objectives": [
    "Block credential dumping attempts against the authentication process.",
    "Map the alert to the corresponding MITRE ATT&CK technique."
   ],
   "evaluation_metrics": [
    "Pass/Fail"
   ],
   "expected_outcome": "Each attempt is blocked and the alert shows the technique and the process tree.",
   "how_to": "",
   "lifecycle": "tested",
   "published": true,
   "visibility": "private",
   "shared_at": "2026-07-14T09:10:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "dbeb9348-8c18-538d-8080-54fc337f08f1",
    "f8f9a071-aa50-50ae-8fec-fc916740d37a"
   ],
   "prereq_ids": [
    "f764d1e3-d94f-5733-b8e5-9ba69d31b607"
   ],
   "industry_ids": [
    "c933ac16-3ac5-5a90-bc71-f6da0fe05685"
   ],
   "value_drivers": [
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "18f0b61d-a337-5c8e-ba05-6a00c8e414f6",
     "stance": "parity",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "ae4d6ee5-e26e-554a-bd7f-7235b4a5e2c8",
     "label": "Cortex XDR exploit and malware protection",
     "url": "https://docs.paloaltonetworks.com/cortex/cortex-xdr/endpoint-security",
     "summary": "Endpoint protection modules and their alerts.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "cf19718f-d8fe-5d76-8ad2-36e28a339438",
     "at": "2026-08-06T14:20:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "ba218707-f939-5106-88d2-c8ed531be063",
     "at": "2026-08-06T14:20:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "cc60d71a-a31e-5ca6-94c4-6dca1859c342",
   "assignee_id": null,
   "created_at": "2026-07-14T09:10:00.000000Z",
   "updated_at": "2026-08-06T14:20:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "ba218707-f939-5106-88d2-c8ed531be063",
     "at": "2026-08-06T14:20:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "2d904bf9-d706-590b-9b76-f4e185f44787": {
      "id": "ba218707-f939-5106-88d2-c8ed531be063",
      "at": "2026-08-06T14:20:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "dbeb9348-8c18-538d-8080-54fc337f08f1",
     "name": "SecOps",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#8e44ad"
    },
    {
     "node_id": "f8f9a071-aa50-50ae-8fec-fc916740d37a",
     "name": "Endpoint Protection",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Cortex XDR: impedir o roubo de credenciais da memória",
    "summary": "Mostrar que o agente XDR bloqueia tentativas de ler credenciais da memória do processo de autenticação.",
    "description": "Atacantes extraem credenciais da memória para se mover lateralmente. Este teste executa técnicas comuns de extração de credenciais em um host protegido do laboratório e verifica a prevenção e o alerta resultante.",
    "objectives": [
     "Bloquear tentativas de extração de credenciais contra o processo de autenticação.",
     "Mapear o alerta para a técnica correspondente do MITRE ATT&CK."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado"
    ],
    "expected_outcome": "Cada tentativa é bloqueada e o alerta mostra a técnica e a árvore de processos.",
    "how_to": "",
    "notes": [],
    "source_version": 2,
    "source_updated_at": "2026-08-06T14:20:01.000000Z"
   }
  },
  {
   "id": "120d98b2-8f29-5913-a42a-c1aaf5202401",
   "version": 2,
   "name": "Cortex XDR: ransomware behavioral protection",
   "summary": "Show that the XDR agent stops ransomware behavior and that the resulting alert explains the attack.",
   "description": "Signature-based antivirus did not stop a recent ransomware simulation. This test runs a ransomware simulator on a protected host and checks behavioral prevention and the resulting alert.",
   "objectives": [
    "Block the ransomware simulator before files are encrypted.",
    "Show the causality chain in the alert.",
    "Verify that the agent reports the prevention to the console."
   ],
   "evaluation_metrics": [
    "Pass/Fail"
   ],
   "expected_outcome": "The simulator is terminated, no files are encrypted and a prevention alert shows the full causality chain.",
   "how_to": "1) Assign the default prevention policy to the test host.\n2) Take a snapshot of the test host.\n3) Run the ransomware simulator from a user folder.\n4) Review the alert and the causality view.\n5) Revert the host to the snapshot.",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-02-05T08:30:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "dbeb9348-8c18-538d-8080-54fc337f08f1",
    "f8f9a071-aa50-50ae-8fec-fc916740d37a",
    "8b98c52c-657a-5b1a-a06f-3d21988e19ab"
   ],
   "prereq_ids": [
    "f764d1e3-d94f-5733-b8e5-9ba69d31b607"
   ],
   "industry_ids": [
    "45f15b8b-065e-5c08-b188-6a371892e85f",
    "32dde312-13cf-53b2-a89d-258cb1cc2f2a"
   ],
   "value_drivers": [
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "3d850490-35a6-57ef-a962-04aa3c02aa8e",
     "stance": "advantage",
     "note": ""
    },
    {
     "competitor_id": "18f0b61d-a337-5c8e-ba05-6a00c8e414f6",
     "stance": "advantage",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "7b18e57b-220b-5096-a749-7f94f515c693",
     "label": "Cortex XDR prevention profiles",
     "url": "https://docs.paloaltonetworks.com/cortex/cortex-xdr",
     "summary": "Endpoint prevention policies and profiles.",
     "audience": "customer"
    },
    {
     "id": "cbf6456a-bb0b-5c7d-9fa0-10e05ba15652",
     "label": "Ransomware simulation guidance",
     "url": "https://docs.paloaltonetworks.com/cortex/cortex-xdr/endpoint-security",
     "summary": "Safe use of simulators on lab hosts.",
     "audience": "internal"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "6751007b-d0d2-5080-9e9f-8ffb277ca625",
     "at": "2026-04-16T10:55:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "82c0a23c-8d63-5737-b107-16313634dca5",
     "at": "2026-04-16T10:55:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "31f2ba13-cf14-599e-92bc-3871feb8da99",
   "assignee_id": null,
   "created_at": "2026-02-05T08:30:00.000000Z",
   "updated_at": "2026-04-16T10:55:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "82c0a23c-8d63-5737-b107-16313634dca5",
     "at": "2026-04-16T10:55:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "2d904bf9-d706-590b-9b76-f4e185f44787": {
      "id": "82c0a23c-8d63-5737-b107-16313634dca5",
      "at": "2026-04-16T10:55:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "dbeb9348-8c18-538d-8080-54fc337f08f1",
     "name": "SecOps",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#8e44ad"
    },
    {
     "node_id": "f8f9a071-aa50-50ae-8fec-fc916740d37a",
     "name": "Endpoint Protection",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "8b98c52c-657a-5b1a-a06f-3d21988e19ab",
     "name": "Ransomware Prevention",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Cortex XDR: proteção comportamental contra ransomware",
    "summary": "Mostrar que o agente XDR interrompe o comportamento de ransomware e que o alerta resultante explica o ataque.",
    "description": "O antivírus baseado em assinaturas não impediu uma simulação recente de ransomware. Este teste executa um simulador de ransomware em um host protegido e verifica a prevenção comportamental e o alerta resultante.",
    "objectives": [
     "Bloquear o simulador de ransomware antes que os arquivos sejam criptografados.",
     "Mostrar a cadeia de causalidade no alerta.",
     "Verificar que o agente reporta a prevenção ao console."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado"
    ],
    "expected_outcome": "O simulador é encerrado, nenhum arquivo é criptografado e um alerta de prevenção mostra a cadeia de causalidade completa.",
    "how_to": "1) Atribuir a política de prevenção padrão ao host de teste.\n2) Tirar um snapshot do host de teste.\n3) Executar o simulador de ransomware a partir de uma pasta de usuário.\n4) Revisar o alerta e a visão de causalidade.\n5) Reverter o host para o snapshot.",
    "notes": [],
    "source_version": 2,
    "source_updated_at": "2026-04-16T10:55:01.000000Z"
   }
  },
  {
   "id": "6537ce05-a73d-5c0a-938f-9c7402e5418b",
   "version": 1,
   "name": "CSPM: detect public storage bucket",
   "summary": "Detect a storage bucket exposed to the internet and show the alert with remediation steps.",
   "description": "A misconfigured storage bucket with public read access is a common cause of data exposure. This test onboards a read-only cloud account, creates a public bucket and checks detection and remediation guidance.",
   "objectives": [
    "Onboard a cloud account with read-only permissions.",
    "Test steps:",
    "Create a storage bucket with public read access.",
    "Wait for the next scan and open the alert.",
    "Show the remediation steps in the alert."
   ],
   "evaluation_metrics": [
    "MTTD",
    "Pass/Fail"
   ],
   "expected_outcome": "An alert is raised for the public bucket with severity, affected resource and remediation steps.",
   "how_to": "",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-03-23T10:00:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
    "7f2eac05-d581-5e01-8439-dff2efce29dc",
    "86ffa026-0a1e-5901-a938-87f502096855"
   ],
   "prereq_ids": [
    "d29f1e12-81a9-521c-a4b0-e0fd6367dcde"
   ],
   "industry_ids": [
    "45f15b8b-065e-5c08-b188-6a371892e85f"
   ],
   "value_drivers": [
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "3a5ccbbb-91fe-50cc-a82a-08ed86f6df50",
     "stance": "parity",
     "note": ""
    },
    {
     "competitor_id": "18f0b61d-a337-5c8e-ba05-6a00c8e414f6",
     "stance": "advantage",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "a3e985b2-e7f5-5109-856f-1d29c3085b83",
     "label": "Cloud posture management",
     "url": "https://docs.paloaltonetworks.com/cortex/cortex-cloud",
     "summary": "Onboarding cloud accounts and reviewing posture findings.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "d776304d-5233-52e3-bb8a-c94407c70eb2",
     "at": "2026-06-16T09:30:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "a3dd01e2-b122-5d36-b2d1-b4cb15507fd2",
     "at": "2026-06-16T09:30:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "4e070af0-9d1a-5c2f-9823-8841c153e354",
     "assignee_id": null,
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "853d0cc2-de3f-5391-84bd-1387b6c4751d",
   "assignee_id": null,
   "created_at": "2026-03-23T10:00:00.000000Z",
   "updated_at": "2026-06-16T09:30:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "a3dd01e2-b122-5d36-b2d1-b4cb15507fd2",
     "at": "2026-06-16T09:30:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "4e070af0-9d1a-5c2f-9823-8841c153e354",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "4e070af0-9d1a-5c2f-9823-8841c153e354": {
      "id": "a3dd01e2-b122-5d36-b2d1-b4cb15507fd2",
      "at": "2026-06-16T09:30:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "4e070af0-9d1a-5c2f-9823-8841c153e354",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
     "name": "Cloud",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#10ac84"
    },
    {
     "node_id": "7f2eac05-d581-5e01-8439-dff2efce29dc",
     "name": "Cloud Security Posture",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "86ffa026-0a1e-5901-a938-87f502096855",
     "name": "Misconfiguration Detection",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "CSPM: detectar bucket de armazenamento público",
    "summary": "Detectar um bucket de armazenamento exposto à Internet e mostrar o alerta com os passos de remediação.",
    "description": "Um bucket de armazenamento mal configurado com acesso público de leitura é uma causa comum de exposição de dados. Este teste faz o onboarding de uma conta de nuvem somente leitura, cria um bucket público e verifica a detecção e as orientações de remediação.",
    "objectives": [
     "Fazer o onboarding de uma conta de nuvem com permissões somente leitura.",
     "Passos do teste:",
     "Criar um bucket de armazenamento com acesso público de leitura.",
     "Aguardar a próxima varredura e abrir o alerta.",
     "Mostrar os passos de remediação no alerta."
    ],
    "evaluation_metrics": [
     "MTTD",
     "Aprovado/Reprovado"
    ],
    "expected_outcome": "Um alerta é gerado para o bucket público com severidade, recurso afetado e passos de remediação.",
    "how_to": "",
    "notes": [],
    "source_version": 1,
    "source_updated_at": "2026-06-16T09:30:01.000000Z"
   }
  },
  {
   "id": "4d342b4e-3ad0-58e5-b6e2-57f6f1dfdb3b",
   "version": 2,
   "name": "Enterprise DLP: block sensitive file upload",
   "summary": "Detect and block uploads of files that contain sensitive data to unsanctioned cloud storage.",
   "description": "The customer must prevent documents with credit card numbers and national ID numbers from leaving through personal cloud storage. This test applies an Enterprise DLP profile to the web traffic of Prisma Access users.",
   "objectives": [
    "Detect credit card numbers in an uploaded document.",
    "Block the upload to a personal cloud storage application.",
    "Show the DLP incident with the matched data pattern."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "False positives"
   ],
   "expected_outcome": "The upload is blocked, the user is notified and a DLP incident is created with the matched pattern.",
   "how_to": "",
   "lifecycle": "test-review",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-04-02T11:25:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
    "b7c11b34-d42e-5de3-8e87-169c3254628d",
    "9d809db2-5932-53ce-a50c-4e13fe95ba03"
   ],
   "prereq_ids": [
    "77228bf9-b95d-538b-b99b-c36b752b1f98",
    "962eb694-c351-5077-9cfb-379d75fa4f46"
   ],
   "industry_ids": [
    "c933ac16-3ac5-5a90-bc71-f6da0fe05685",
    "45f15b8b-065e-5c08-b188-6a371892e85f"
   ],
   "value_drivers": [
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "3a5ccbbb-91fe-50cc-a82a-08ed86f6df50",
     "stance": "advantage",
     "note": ""
    },
    {
     "competitor_id": "237b59fd-0e66-5901-ada3-6886b884a2c8",
     "stance": "unknown",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "5bf5c4bf-c1e5-5655-820a-8887d07078a1",
     "label": "Enterprise DLP administration",
     "url": "https://docs.paloaltonetworks.com/enterprise-dlp/administration",
     "summary": "Data patterns, data profiles and DLP incidents.",
     "audience": "customer"
    },
    {
     "id": "8d9a1b28-2d97-5d72-bfb2-ea0e02301b85",
     "label": "Sample documents for DLP tests",
     "url": "https://docs.paloaltonetworks.com/enterprise-dlp/administration/data-patterns",
     "summary": "Which predefined data patterns to use with synthetic test documents.",
     "audience": "internal"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "c9708c0e-8ce9-5b54-b2f5-e0e936fdf651",
     "at": "2026-07-08T14:10:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "test-review",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Needs updated screenshots"
    },
    {
     "id": "8688a56e-1d8e-58de-b1f1-95fb435682f6",
     "at": "2026-05-25T10:00:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "test-review",
     "to_state": "reviewed",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    },
    {
     "id": "28ad6255-992c-5f30-b3c1-4edef1d23944",
     "at": "2026-04-02T11:25:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": null,
     "to_state": "test-review",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "853d0cc2-de3f-5391-84bd-1387b6c4751d",
   "assignee_id": null,
   "created_at": "2026-04-02T11:25:00.000000Z",
   "updated_at": "2026-07-08T14:10:00.000000Z",
   "testing": {
    "latest_signoff": null,
    "latest_by_environment": {},
    "tested": false
   },
   "taxonomy": [
    {
     "node_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
     "name": "SASE",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#2e86de"
    },
    {
     "node_id": "b7c11b34-d42e-5de3-8e87-169c3254628d",
     "name": "Secure Remote Access",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "9d809db2-5932-53ce-a50c-4e13fe95ba03",
     "name": "SaaS and Data Protection",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Enterprise DLP: bloquear o upload de arquivos sensíveis",
    "summary": "Detectar e bloquear uploads de arquivos que contêm dados sensíveis para armazenamento em nuvem não autorizado.",
    "description": "O cliente precisa impedir que documentos com números de cartão de crédito e números de documento de identidade nacional saiam por armazenamento pessoal em nuvem. Este teste aplica um perfil de Enterprise DLP ao tráfego web dos usuários do Prisma Access.",
    "objectives": [
     "Detectar números de cartão de crédito em um documento enviado.",
     "Bloquear o upload para uma aplicação pessoal de armazenamento em nuvem.",
     "Mostrar o incidente de DLP com o padrão de dados correspondente."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "Falsos positivos"
    ],
    "expected_outcome": "O upload é bloqueado, o usuário é notificado e um incidente de DLP é criado com o padrão correspondente.",
    "how_to": "",
    "notes": [],
    "source_version": 2,
    "source_updated_at": "2026-07-08T14:10:00.000000Z"
   }
  },
  {
   "id": "5364a800-dd8c-59fc-9b65-3f1d1a340225",
   "version": 3,
   "name": "IaC scanning in CI pipeline",
   "summary": "Scan Terraform templates in the CI pipeline and fail the build on high-severity misconfigurations.",
   "description": "Misconfigurations are cheaper to fix before deployment. This test adds an IaC scan step to the pipeline of a sample repository and checks that findings are reported in the pull request and in the console.",
   "objectives": [
    "Connect a sample GitHub repository.",
    "Add the IaC scan step to the CI pipeline.",
    "Fail the build on high-severity findings.",
    "Show fix suggestions in the pull request."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "Scan time per commit"
   ],
   "expected_outcome": "The pipeline fails on the misconfigured template and the pull request shows the findings with suggested fixes.",
   "how_to": "1) Connect the sample repository to the console.\n2) Add the scan step to the pipeline definition with a high-severity threshold.\n3) Open a pull request that adds a public storage bucket in Terraform.\n4) Check the pipeline result and the pull request comments.",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-02-26T14:20:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
    "7f2eac05-d581-5e01-8439-dff2efce29dc",
    "4d19e319-eb1c-54f4-9a7a-027e4d59cf94",
    "7c360b69-cd3f-5958-a316-7238a754fbe1"
   ],
   "prereq_ids": [],
   "industry_ids": [],
   "value_drivers": [
    {
     "value_driver_id": "3ad8092e-c7eb-5ceb-b314-0bba2318cf9d",
     "note": "Fixing issues before deployment reduces rework."
    }
   ],
   "competitors": [
    {
     "competitor_id": "237b59fd-0e66-5901-ada3-6886b884a2c8",
     "stance": "advantage",
     "note": ""
    },
    {
     "competitor_id": "3d850490-35a6-57ef-a962-04aa3c02aa8e",
     "stance": "unknown",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "158e6da4-8629-5c85-9e11-1e734a984ef3",
     "label": "IaC scanning",
     "url": "https://docs.paloaltonetworks.com/cortex/cortex-cloud/application-security",
     "summary": "Scanning infrastructure as code in repositories and pipelines.",
     "audience": "customer"
    },
    {
     "id": "1b2df04d-9e3f-556a-ae20-8d34579c01a5",
     "label": "CI integration notes",
     "url": "https://docs.paloaltonetworks.com/cortex/cortex-cloud/application-security/ci-cd",
     "summary": "Pipeline snippets used in the lab repository.",
     "audience": "internal"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "79dc4735-ad98-57fb-a009-581d88b50d73",
     "at": "2026-07-15T11:35:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "2dd04e98-879e-5f6a-b267-e9475667deff",
     "at": "2026-07-15T11:35:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "4e070af0-9d1a-5c2f-9823-8841c153e354",
     "assignee_id": null,
     "fields": [],
     "reason": null
    },
    {
     "id": "16b767ae-bc79-5297-a543-de6c3427aaf4",
     "at": "2026-07-01T10:05:00.000000Z",
     "actor": {
      "user_id": "31f2ba13-cf14-599e-92bc-3871feb8da99",
      "name": "Demo Author 3",
      "email": "author3@example.com",
      "on_behalf_of": null
     },
     "kind": "edit",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": null,
     "fields": [
      "node_ids"
     ],
     "reason": null
    }
   ],
   "author_id": "31f2ba13-cf14-599e-92bc-3871feb8da99",
   "assignee_id": null,
   "created_at": "2026-02-26T14:20:00.000000Z",
   "updated_at": "2026-07-15T11:35:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "2dd04e98-879e-5f6a-b267-e9475667deff",
     "at": "2026-07-15T11:35:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "4e070af0-9d1a-5c2f-9823-8841c153e354",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "4e070af0-9d1a-5c2f-9823-8841c153e354": {
      "id": "2dd04e98-879e-5f6a-b267-e9475667deff",
      "at": "2026-07-15T11:35:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "4e070af0-9d1a-5c2f-9823-8841c153e354",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
     "name": "Cloud",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#10ac84"
    },
    {
     "node_id": "7f2eac05-d581-5e01-8439-dff2efce29dc",
     "name": "Cloud Security Posture",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "4d19e319-eb1c-54f4-9a7a-027e4d59cf94",
     "name": "Application Security",
     "type_id": "85c62e50-0c13-57b7-88de-e835a401dbbf",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "7c360b69-cd3f-5958-a316-7238a754fbe1",
     "name": "Code to Cloud (IaC Scanning)",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Varredura de IaC no pipeline de CI",
    "summary": "Fazer a varredura de templates Terraform no pipeline de CI e fazer o build falhar em configurações incorretas de alta severidade.",
    "description": "Configurações incorretas são mais baratas de corrigir antes da implantação. Este teste adiciona uma etapa de varredura de IaC ao pipeline de um repositório de exemplo e verifica que os findings são reportados no pull request e no console.",
    "objectives": [
     "Conectar um repositório de exemplo do GitHub.",
     "Adicionar a etapa de varredura de IaC ao pipeline de CI.",
     "Fazer o build falhar em findings de alta severidade.",
     "Mostrar sugestões de correção no pull request."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "Tempo de varredura por commit"
    ],
    "expected_outcome": "O pipeline falha no template mal configurado e o pull request mostra os findings com as correções sugeridas.",
    "how_to": "1) Conectar o repositório de exemplo ao console.\n2) Adicionar a etapa de varredura à definição do pipeline com um limite de severidade alta.\n3) Abrir um pull request que adiciona um bucket de armazenamento público em Terraform.\n4) Verificar o resultado do pipeline e os comentários do pull request.",
    "notes": [],
    "source_version": 3,
    "source_updated_at": "2026-07-15T11:35:01.000000Z"
   }
  },
  {
   "id": "2b1c480d-2b61-5212-8c1e-0b1695195e3a",
   "version": 1,
   "name": "Kubernetes admission control",
   "summary": "Block the deployment of pods that violate policy, such as privileged containers or images with critical vulnerabilities.",
   "description": "Developers can deploy workloads directly to the cluster. This test enables the admission controller and tries to deploy a privileged pod and an image with a critical CVE.",
   "objectives": [
    "Test steps:",
    "Deploy a privileged pod.",
    "Deploy an image with a critical vulnerability.",
    "Verify that both deployments are blocked at admission."
   ],
   "evaluation_metrics": [
    "Pass/Fail"
   ],
   "expected_outcome": "Both deployments are rejected with a message that names the violated policy.",
   "how_to": "",
   "lifecycle": "test-review",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-05-05T10:50:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
    "dd671bef-f078-5d15-b549-344179afb8a6",
    "7b568705-5ad1-5d6d-ac1f-8c1de9b924bf"
   ],
   "prereq_ids": [],
   "industry_ids": [],
   "value_drivers": [],
   "competitors": [
    {
     "competitor_id": "18f0b61d-a337-5c8e-ba05-6a00c8e414f6",
     "stance": "parity",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "ea19f358-3425-5a83-8b2c-dcdec7ea6114",
     "label": "Kubernetes admission control",
     "url": "https://docs.paloaltonetworks.com/cortex/cortex-cloud/runtime-security/kubernetes",
     "summary": "Admission rules for Kubernetes clusters.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "4091ce64-c576-5ffb-b24c-9ff6afafc697",
     "at": "2026-05-05T10:50:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": null,
     "to_state": "test-review",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "853d0cc2-de3f-5391-84bd-1387b6c4751d",
   "assignee_id": null,
   "created_at": "2026-05-05T10:50:00.000000Z",
   "updated_at": "2026-05-05T10:50:00.000000Z",
   "testing": {
    "latest_signoff": null,
    "latest_by_environment": {},
    "tested": false
   },
   "taxonomy": [
    {
     "node_id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
     "name": "Cloud",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#10ac84"
    },
    {
     "node_id": "dd671bef-f078-5d15-b549-344179afb8a6",
     "name": "Kubernetes Runtime Protection",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "7b568705-5ad1-5d6d-ac1f-8c1de9b924bf",
     "name": "Admission Control",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Controle de admissão no Kubernetes",
    "summary": "Bloquear a implantação de pods que violam a política, como contêineres privilegiados ou imagens com vulnerabilidades críticas.",
    "description": "Os desenvolvedores podem implantar workloads diretamente no cluster. Este teste habilita o admission controller e tenta implantar um pod privilegiado e uma imagem com uma CVE crítica.",
    "objectives": [
     "Passos do teste:",
     "Implantar um pod privilegiado.",
     "Implantar uma imagem com uma vulnerabilidade crítica.",
     "Verificar que as duas implantações são bloqueadas na admissão."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado"
    ],
    "expected_outcome": "As duas implantações são rejeitadas com uma mensagem que indica a política violada.",
    "how_to": "",
    "notes": [],
    "source_version": 1,
    "source_updated_at": "2026-05-05T10:50:00.000000Z"
   }
  },
  {
   "id": "1914f05b-7ede-5a86-9234-4c87c62dddd5",
   "version": 2,
   "name": "Prisma Access: remote user access with GlobalProtect",
   "summary": "Connect remote users to Prisma Access with the GlobalProtect app and apply a consistent security policy.",
   "description": "Remote users connect today through a legacy VPN concentrator. This test onboards users to Prisma Access with GlobalProtect, authenticates them with SSO and applies the same security policy used on premises.",
   "objectives": [
    "Onboard a test user group to Prisma Access for mobile users.",
    "Authenticate users with SSO and MFA.",
    "Apply URL Filtering and Threat Prevention to remote user traffic.",
    "Verify that the user connects to the closest location."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "Time to onboard < 1 hour"
   ],
   "expected_outcome": "Remote users connect with SSO, their traffic is inspected and the logs show the user identity and location.",
   "how_to": "",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-02-24T12:00:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
    "b7c11b34-d42e-5de3-8e87-169c3254628d"
   ],
   "prereq_ids": [
    "77228bf9-b95d-538b-b99b-c36b752b1f98"
   ],
   "industry_ids": [
    "b80a06f2-3755-5426-b0c8-6752330c1391"
   ],
   "value_drivers": [
    {
     "value_driver_id": "0693a370-12a3-5d91-adbb-a834d48535ef",
     "note": ""
    },
    {
     "value_driver_id": "ceac6358-c623-5c44-97be-876db394b7f9",
     "note": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "3a5ccbbb-91fe-50cc-a82a-08ed86f6df50",
     "stance": "parity",
     "note": ""
    },
    {
     "competitor_id": "237b59fd-0e66-5901-ada3-6886b884a2c8",
     "stance": "advantage",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "dc416012-3df0-5e2c-a74b-94eb2b74f0bc",
     "label": "Prisma Access administration",
     "url": "https://docs.paloaltonetworks.com/prisma-access/administration",
     "summary": "Onboarding mobile users and applying security policy.",
     "audience": "customer"
    },
    {
     "id": "f033e0c9-c266-592b-82aa-e75e4d99700e",
     "label": "GlobalProtect app",
     "url": "https://docs.paloaltonetworks.com/globalprotect",
     "summary": "GlobalProtect app installation and connection methods.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "b0a84c2c-d99d-500f-8da6-a27789af83bf",
     "at": "2026-05-14T14:30:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "f27bb78c-2f4b-5e02-97a7-7e2607c99d31",
     "at": "2026-05-14T14:30:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
     "assignee_id": null,
     "fields": [],
     "reason": null
    },
    {
     "id": "64bd609f-7a99-5c4a-be06-10cf7fcdc653",
     "at": "2026-04-28T09:00:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "test-review",
     "to_state": "reviewed",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "853d0cc2-de3f-5391-84bd-1387b6c4751d",
   "assignee_id": null,
   "created_at": "2026-02-24T12:00:00.000000Z",
   "updated_at": "2026-05-14T14:30:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "f27bb78c-2f4b-5e02-97a7-7e2607c99d31",
     "at": "2026-05-14T14:30:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "cf2ba073-ed17-5d17-81d4-1bb3677d18d1": {
      "id": "f27bb78c-2f4b-5e02-97a7-7e2607c99d31",
      "at": "2026-05-14T14:30:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
     "name": "SASE",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#2e86de"
    },
    {
     "node_id": "b7c11b34-d42e-5de3-8e87-169c3254628d",
     "name": "Secure Remote Access",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Prisma Access: acesso de usuários remotos com GlobalProtect",
    "summary": "Conectar usuários remotos ao Prisma Access com o aplicativo GlobalProtect e aplicar uma política de segurança consistente.",
    "description": "Hoje os usuários remotos se conectam por um concentrador VPN legado. Este teste faz o onboarding dos usuários no Prisma Access com GlobalProtect, autentica-os com SSO e aplica a mesma política de segurança usada on-premises.",
    "objectives": [
     "Fazer o onboarding de um grupo de usuários de teste no Prisma Access para usuários móveis.",
     "Autenticar os usuários com SSO e MFA.",
     "Aplicar URL Filtering e Threat Prevention ao tráfego dos usuários remotos.",
     "Verificar que o usuário se conecta à localização mais próxima."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "Tempo de onboarding < 1 hora"
    ],
    "expected_outcome": "Os usuários remotos se conectam com SSO, seu tráfego é inspecionado e os logs mostram a identidade e a localização do usuário.",
    "how_to": "",
    "notes": [],
    "source_version": 2,
    "source_updated_at": "2026-05-14T14:30:01.000000Z"
   }
  },
  {
   "id": "2ce24d7c-cfdb-53d8-bd40-a51d0d663f33",
   "version": 4,
   "name": "Prisma SD-WAN: application-based path selection",
   "summary": "Steer business-critical applications to the best-performing WAN link and fail over when a link degrades.",
   "description": "A branch has an MPLS link and a broadband internet link. The customer wants voice and video to use the link with the lowest latency and to fail over automatically without dropping calls.",
   "objectives": [
    "Define path policies for voice, video and bulk traffic.",
    "Introduce packet loss on the primary link.",
    "Verify that voice traffic moves to the secondary link within the SLA.",
    "Show application performance per link in the dashboard."
   ],
   "evaluation_metrics": [
    "Failover time < 3 seconds",
    "Pass/Fail"
   ],
   "expected_outcome": "Voice and video fail over to the healthy link within the SLA without dropped calls.",
   "how_to": "",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-01-27T09:20:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
    "059a10ef-9213-5637-9858-3fbaeecec4d5",
    "999db8af-0e97-519b-ae45-72ce529f5caf"
   ],
   "prereq_ids": [],
   "industry_ids": [
    "b80a06f2-3755-5426-b0c8-6752330c1391"
   ],
   "value_drivers": [
    {
     "value_driver_id": "0693a370-12a3-5d91-adbb-a834d48535ef",
     "note": ""
    },
    {
     "value_driver_id": "3ad8092e-c7eb-5ceb-b314-0bba2318cf9d",
     "note": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "237b59fd-0e66-5901-ada3-6886b884a2c8",
     "stance": "parity",
     "note": ""
    },
    {
     "competitor_id": "3d850490-35a6-57ef-a962-04aa3c02aa8e",
     "stance": "parity",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "73ed037a-e559-5335-8ce1-615e7cc3596a",
     "label": "Prisma SD-WAN administration",
     "url": "https://docs.paloaltonetworks.com/prisma-sd-wan/administration",
     "summary": "Path policies, application SLAs and link monitoring.",
     "audience": "customer"
    }
   ],
   "notes": [
    {
     "id": "d28114f8-9606-5392-8276-1249901bf51c",
     "at": "2026-08-27T17:05:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "body": "Retest failed after the link simulator upgrade; failover took about 6 seconds. Rerun scheduled."
    }
   ],
   "history": [
    {
     "id": "abc40e73-6a44-58d9-ad33-5cb9ea033dc8",
     "at": "2026-08-27T16:30:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "fail",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": [],
     "reason": null
    },
    {
     "id": "c2b1fd9a-5b6e-561d-83c6-dfb74fcce9dd",
     "at": "2026-05-12T15:30:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "a615d1ab-b7e6-59b6-aa5e-e420e09f1b16",
     "at": "2026-05-12T15:30:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
     "assignee_id": null,
     "fields": [],
     "reason": null
    },
    {
     "id": "277f2ef9-17ad-5083-9792-6d561b0aaf4b",
     "at": "2026-04-15T11:10:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "test-review",
     "to_state": "reviewed",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Validated in lab"
    }
   ],
   "author_id": "31f2ba13-cf14-599e-92bc-3871feb8da99",
   "assignee_id": null,
   "created_at": "2026-01-27T09:20:00.000000Z",
   "updated_at": "2026-08-27T17:05:00.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "abc40e73-6a44-58d9-ad33-5cb9ea033dc8",
     "at": "2026-08-27T16:30:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "fail",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "2d904bf9-d706-590b-9b76-f4e185f44787": {
      "id": "abc40e73-6a44-58d9-ad33-5cb9ea033dc8",
      "at": "2026-08-27T16:30:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "fail",
      "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
      "assignee_id": null,
      "fields": null,
      "reason": null
     },
     "cf2ba073-ed17-5d17-81d4-1bb3677d18d1": {
      "id": "a615d1ab-b7e6-59b6-aa5e-e420e09f1b16",
      "at": "2026-05-12T15:30:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
     "name": "SASE",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#2e86de"
    },
    {
     "node_id": "059a10ef-9213-5637-9858-3fbaeecec4d5",
     "name": "Branch Connectivity (SD-WAN)",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "999db8af-0e97-519b-ae45-72ce529f5caf",
     "name": "Digital Experience Monitoring",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Prisma SD-WAN: seleção de caminho baseada em aplicação",
    "summary": "Direcionar aplicações críticas para o negócio ao link WAN de melhor desempenho e fazer failover quando um link se degrada.",
    "description": "Uma filial tem um link MPLS e um link de internet banda larga. O cliente quer que voz e vídeo usem o link com a menor latência e façam failover automaticamente sem derrubar chamadas.",
    "objectives": [
     "Definir políticas de caminho para tráfego de voz, vídeo e em massa.",
     "Introduzir perda de pacotes no link primário.",
     "Verificar que o tráfego de voz migra para o link secundário dentro do SLA.",
     "Mostrar o desempenho das aplicações por link no dashboard."
    ],
    "evaluation_metrics": [
     "Tempo de failover < 3 segundos",
     "Aprovado/Reprovado"
    ],
    "expected_outcome": "Voz e vídeo fazem failover para o link saudável dentro do SLA, sem queda de chamadas.",
    "how_to": "",
    "notes": [
     "O reteste falhou após a atualização do simulador de links; o failover levou cerca de 6 segundos. Nova execução agendada."
    ],
    "source_version": 4,
    "source_updated_at": "2026-08-27T17:05:00.000000Z"
   }
  },
  {
   "id": "d708ab77-f41f-5e8d-b239-1c138164154f",
   "version": 1,
   "name": "Runtime protection for containers",
   "summary": "Detect and prevent suspicious process and network activity inside running containers.",
   "description": "An attacker who gains a shell in a container may download tools and open reverse connections. This test runs these actions in a lab container and checks detection and prevention by the runtime defender.",
   "objectives": [
    "Detect an interactive shell started in a running container.",
    "Prevent the execution of a binary that is not part of the image.",
    "Detect an outbound connection to a known malicious IP address."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "MTTD"
   ],
   "expected_outcome": "- Each action generates a runtime event.\n- The unknown binary is blocked.",
   "how_to": "",
   "lifecycle": "capability-review",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-06-22T15:35:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
    "dd671bef-f078-5d15-b549-344179afb8a6"
   ],
   "prereq_ids": [],
   "industry_ids": [
    "32dde312-13cf-53b2-a89d-258cb1cc2f2a"
   ],
   "value_drivers": [],
   "competitors": [
    {
     "competitor_id": "3a5ccbbb-91fe-50cc-a82a-08ed86f6df50",
     "stance": "unknown",
     "note": ""
    }
   ],
   "docs": [],
   "notes": [],
   "history": [
    {
     "id": "a098b563-14b9-57b2-af05-32ebb372e848",
     "at": "2026-07-29T10:15:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "capability-review",
     "to_state": "capability-review",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Awaiting confirmation of supported container runtimes"
    },
    {
     "id": "77f443bc-1048-57ac-9b68-405535333d90",
     "at": "2026-06-22T15:35:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": null,
     "to_state": "capability-review",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "cc60d71a-a31e-5ca6-94c4-6dca1859c342",
   "assignee_id": null,
   "created_at": "2026-06-22T15:35:00.000000Z",
   "updated_at": "2026-07-29T10:15:00.000000Z",
   "testing": {
    "latest_signoff": null,
    "latest_by_environment": {},
    "tested": false
   },
   "taxonomy": [
    {
     "node_id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
     "name": "Cloud",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#10ac84"
    },
    {
     "node_id": "dd671bef-f078-5d15-b549-344179afb8a6",
     "name": "Kubernetes Runtime Protection",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Proteção de runtime para contêineres",
    "summary": "Detectar e impedir atividade suspeita de processos e de rede dentro de contêineres em execução.",
    "description": "Um atacante que obtém um shell em um contêiner pode baixar ferramentas e abrir conexões reversas. Este teste executa essas ações em um contêiner do laboratório e verifica a detecção e a prevenção pelo defender de runtime.",
    "objectives": [
     "Detectar um shell interativo iniciado em um contêiner em execução.",
     "Impedir a execução de um binário que não faz parte da imagem.",
     "Detectar uma conexão de saída para um endereço IP sabidamente malicioso."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "MTTD"
    ],
    "expected_outcome": "- Cada ação gera um evento de runtime.\n- O binário desconhecido é bloqueado.",
    "how_to": "",
    "notes": [],
    "source_version": 1,
    "source_updated_at": "2026-07-29T10:15:00.000000Z"
   }
  },
  {
   "id": "8b6eaa5b-6bf0-531c-983c-b6f4099787af",
   "version": 5,
   "name": "SSL/TLS decryption with category exceptions",
   "summary": "Decrypt outbound TLS traffic for inspection while excluding sensitive categories such as financial services and health.",
   "description": "Most threats hide in encrypted traffic. The customer requires decryption for inspection but must not decrypt personal banking and health sites. This test configures forward proxy decryption with category-based exceptions.",
   "objectives": [
    "Decrypt outbound HTTPS traffic with SSL Forward Proxy.",
    "Exclude the financial-services and health-and-medicine categories from decryption.",
    "Verify that threats inside decrypted sessions are detected.",
    "Show the decryption log with decrypted and excluded sessions.",
    "Confirm that applications that use certificate pinning are handled by the exclusion list.",
    "Measure the impact on page load time."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "Page load time increase < 10%"
   ],
   "expected_outcome": "Traffic is decrypted and inspected except for the excluded categories; excluded sessions appear as no-decrypt in the logs.",
   "how_to": "1) Import or generate the forward trust certificate and deploy it to the test endpoints.\n2) Create a decryption policy rule with action decrypt for the outbound zone.\n3) Add a no-decrypt rule above it for the excluded categories.\n4) Browse to test sites in each category and download the EICAR file over HTTPS.\n5) Review the decryption and threat logs.",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-01-08T15:30:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
    "f32215b1-1cae-5d0f-a71b-24e82fba887c",
    "00731697-9610-5d4c-b1e0-495924c6157a",
    "588276ef-03f0-549a-8097-8698dfcaf90c"
   ],
   "prereq_ids": [
    "680ea218-71ee-5581-b927-33d3c916c3bb",
    "962eb694-c351-5077-9cfb-379d75fa4f46"
   ],
   "industry_ids": [
    "c933ac16-3ac5-5a90-bc71-f6da0fe05685",
    "45f15b8b-065e-5c08-b188-6a371892e85f"
   ],
   "value_drivers": [
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    },
    {
     "value_driver_id": "0693a370-12a3-5d91-adbb-a834d48535ef",
     "note": "Decryption exceptions preserve privacy for personal browsing."
    }
   ],
   "competitors": [
    {
     "competitor_id": "237b59fd-0e66-5901-ada3-6886b884a2c8",
     "stance": "parity",
     "note": ""
    },
    {
     "competitor_id": "3d850490-35a6-57ef-a962-04aa3c02aa8e",
     "stance": "advantage",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "38b28c9c-5e4f-55ab-9130-790f4f21f4d0",
     "label": "Decryption overview",
     "url": "https://docs.paloaltonetworks.com/pan-os/11-2/pan-os-admin/decryption",
     "summary": "Decryption concepts, policy and profiles.",
     "audience": "customer"
    },
    {
     "id": "0966cd9b-ffbd-539f-9e6d-b290e56b0249",
     "label": "Decryption exclusions",
     "url": "https://docs.paloaltonetworks.com/pan-os/11-2/pan-os-admin/decryption/decryption-exclusions",
     "summary": "Predefined and custom exclusions from decryption.",
     "audience": "customer"
    },
    {
     "id": "f4a91f33-0429-5700-9ddd-d6d0f8f14b94",
     "label": "Decryption sizing notes",
     "url": "https://docs.paloaltonetworks.com/best-practices",
     "summary": "Sizing considerations before enabling decryption in a PoV.",
     "audience": "internal"
    }
   ],
   "notes": [
    {
     "id": "bb09d27d-57e2-5883-b26e-06683d5fdd08",
     "at": "2026-05-20T09:15:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "body": "Use the predefined exclusion list before creating custom exclusions."
    }
   ],
   "history": [
    {
     "id": "952b2f6d-2e4c-5fa0-afed-c281de9180a5",
     "at": "2026-05-28T11:00:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "bc99515c-a154-5f99-8f3b-c08922565fa3",
     "at": "2026-05-28T11:00:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
     "assignee_id": null,
     "fields": [],
     "reason": null
    },
    {
     "id": "79b643f1-4f90-53e3-b9d2-92633bfd5c3d",
     "at": "2026-05-19T17:45:00.000000Z",
     "actor": {
      "user_id": "853d0cc2-de3f-5391-84bd-1387b6c4751d",
      "name": "Demo Author 1",
      "email": "author1@example.com",
      "on_behalf_of": null
     },
     "kind": "edit",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": null,
     "fields": [
      "how_to"
     ],
     "reason": null
    },
    {
     "id": "10db8ca2-40dd-5ade-9ec0-c44ded304f73",
     "at": "2026-04-30T10:05:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "test-review",
     "to_state": "reviewed",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Validated in lab"
    }
   ],
   "author_id": "853d0cc2-de3f-5391-84bd-1387b6c4751d",
   "assignee_id": null,
   "created_at": "2026-01-08T15:30:00.000000Z",
   "updated_at": "2026-05-28T11:00:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "bc99515c-a154-5f99-8f3b-c08922565fa3",
     "at": "2026-05-28T11:00:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "ed140dce-14cf-5908-accd-dd50e040209a": {
      "id": "bc99515c-a154-5f99-8f3b-c08922565fa3",
      "at": "2026-05-28T11:00:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "ed140dce-14cf-5908-accd-dd50e040209a",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
     "name": "NGFW",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#e4572e"
    },
    {
     "node_id": "f32215b1-1cae-5d0f-a71b-24e82fba887c",
     "name": "Securing Internet Access",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "00731697-9610-5d4c-b1e0-495924c6157a",
     "name": "Application Control",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "588276ef-03f0-549a-8097-8698dfcaf90c",
     "name": "URL Filtering and Content Filtering",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Descriptografia SSL/TLS com exceções por categoria",
    "summary": "Descriptografar o tráfego TLS de saída para inspeção, excluindo categorias sensíveis como serviços financeiros e saúde.",
    "description": "A maioria das ameaças se esconde no tráfego criptografado. O cliente exige descriptografia para inspeção, mas não pode descriptografar sites bancários pessoais e de saúde. Este teste configura a descriptografia por forward proxy com exceções baseadas em categoria.",
    "objectives": [
     "Descriptografar o tráfego HTTPS de saída com SSL Forward Proxy.",
     "Excluir as categorias financial-services e health-and-medicine da descriptografia.",
     "Verificar que ameaças dentro de sessões descriptografadas são detectadas.",
     "Mostrar o log de descriptografia com as sessões descriptografadas e excluídas.",
     "Confirmar que as aplicações que usam certificate pinning são tratadas pela lista de exclusão.",
     "Medir o impacto no tempo de carregamento das páginas."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "Aumento no tempo de carregamento das páginas < 10%"
    ],
    "expected_outcome": "O tráfego é descriptografado e inspecionado, exceto nas categorias excluídas; as sessões excluídas aparecem como no-decrypt nos logs.",
    "how_to": "1) Importar ou gerar o certificado forward trust e implantá-lo nos endpoints de teste.\n2) Criar uma regra de política de descriptografia com ação decrypt para a zona de saída.\n3) Adicionar uma regra no-decrypt acima dela para as categorias excluídas.\n4) Navegar até sites de teste de cada categoria e baixar o arquivo EICAR via HTTPS.\n5) Revisar os logs de descriptografia e de ameaças.",
    "notes": [
     "Usar a lista de exclusão predefinida antes de criar exclusões personalizadas."
    ],
    "source_version": 5,
    "source_updated_at": "2026-05-28T11:00:01.000000Z"
   }
  },
  {
   "id": "274ab424-219e-5a2a-8a77-6615fe7f95de",
   "version": 3,
   "name": "XSIAM: ingest firewall logs and stitch incidents",
   "summary": "Ingest NGFW logs into Cortex XSIAM and show how related alerts are stitched into a single incident.",
   "description": "The SOC receives alerts from the firewall and from the endpoints in separate consoles. This test forwards firewall logs to Cortex XSIAM, generates activity from a lab host and shows the stitched incident with network and endpoint data.",
   "objectives": [
    "Onboard the firewall log data source.",
    "Verify that logs are parsed and searchable within minutes.",
    "Generate network and endpoint activity from the same host.",
    "Show a single incident that groups the related alerts."
   ],
   "evaluation_metrics": [
    "Pass/Fail",
    "Time to first searchable log < 10 minutes"
   ],
   "expected_outcome": "Firewall logs are searchable and the related alerts appear as one incident with a causality view.",
   "how_to": "",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-01-30T10:40:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "49bc07ea-a6a8-56f3-b4ad-d003ae7e62d3",
    "8bdb7daa-c744-5112-aa22-37ef28624529",
    "843f0898-a241-58e6-827d-5284afb07555"
   ],
   "prereq_ids": [
    "9e7dc55c-7c27-5963-a909-6565dd2508e6"
   ],
   "industry_ids": [
    "c933ac16-3ac5-5a90-bc71-f6da0fe05685"
   ],
   "value_drivers": [
    {
     "id": "3ad8092e-c7eb-5ceb-b314-0bba2318cf9d",
     "narrative": "Fewer consoles for the SOC."
    },
    {
     "id": "ceac6358-c623-5c44-97be-876db394b7f9",
     "narrative": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "3a5ccbbb-91fe-50cc-a82a-08ed86f6df50",
     "stance": "advantage",
     "note": ""
    },
    {
     "competitor_id": "237b59fd-0e66-5901-ada3-6886b884a2c8",
     "stance": "advantage",
     "note": ""
    },
    {
     "competitor_id": "3d850490-35a6-57ef-a962-04aa3c02aa8e",
     "stance": "parity",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "cf13088d-688e-5e78-9b41-b7d832ec011a",
     "label": "Cortex XSIAM data sources",
     "url": "https://docs.paloaltonetworks.com/cortex/cortex-xsiam",
     "summary": "Onboarding data sources and searching ingested logs.",
     "audience": "customer"
    },
    {
     "id": "d96b7774-fd3b-5318-9622-f3db016a3326",
     "label": "Incident stitching lab script",
     "url": "https://docs.paloaltonetworks.com/cortex/cortex-xsiam/incidents",
     "summary": "Activity used in the lab to generate a stitched incident.",
     "audience": "internal"
    }
   ],
   "notes": [
    {
     "id": "4c0ef732-ddbf-594f-9cc7-358f1b9720c3",
     "at": "2026-07-10T12:00:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "body": "Taxonomy still references the previous XSIAM domain; keep until the library is re-mapped."
    }
   ],
   "history": [
    {
     "id": "884dfd71-f1c5-57af-b639-eca8fdc4fff9",
     "at": "2026-06-05T14:00:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "c663259b-6655-5e74-a6ab-a376c4590f82",
     "at": "2026-06-05T14:00:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "807b9adf-16a3-56b9-bde9-96a318c06615",
     "assignee_id": null,
     "fields": [],
     "reason": null
    },
    {
     "id": "a3e612a3-4779-5b1b-9ab9-031fd877532f",
     "at": "2026-05-18T09:25:00.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "test-review",
     "to_state": "reviewed",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "31f2ba13-cf14-599e-92bc-3871feb8da99",
   "assignee_id": null,
   "created_at": "2026-01-30T10:40:00.000000Z",
   "updated_at": "2026-07-10T12:00:00.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "c663259b-6655-5e74-a6ab-a376c4590f82",
     "at": "2026-06-05T14:00:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "807b9adf-16a3-56b9-bde9-96a318c06615",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "807b9adf-16a3-56b9-bde9-96a318c06615": {
      "id": "c663259b-6655-5e74-a6ab-a376c4590f82",
      "at": "2026-06-05T14:00:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "807b9adf-16a3-56b9-bde9-96a318c06615",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "dbeb9348-8c18-538d-8080-54fc337f08f1",
     "name": "SecOps",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#8e44ad"
    },
    {
     "node_id": "49bc07ea-a6a8-56f3-b4ad-d003ae7e62d3",
     "name": "XSIAM",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#5b6c8f"
    },
    {
     "node_id": "8bdb7daa-c744-5112-aa22-37ef28624529",
     "name": "Incident Response Automation",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "843f0898-a241-58e6-827d-5284afb07555",
     "name": "Enhance SOC Efficiency",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "XSIAM: ingerir logs de firewall e correlacionar incidentes",
    "summary": "Ingerir logs de NGFW no Cortex XSIAM e mostrar como alertas relacionados são correlacionados em um único incidente.",
    "description": "O SOC recebe alertas do firewall e dos endpoints em consoles separados. Este teste encaminha os logs do firewall ao Cortex XSIAM, gera atividade a partir de um host do laboratório e mostra o incidente correlacionado com dados de rede e de endpoint.",
    "objectives": [
     "Fazer o onboarding da fonte de dados de logs do firewall.",
     "Verificar que os logs são processados e ficam pesquisáveis em minutos.",
     "Gerar atividade de rede e de endpoint a partir do mesmo host.",
     "Mostrar um único incidente que agrupa os alertas relacionados."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado",
     "Tempo até o primeiro log pesquisável < 10 minutos"
    ],
    "expected_outcome": "Os logs do firewall ficam pesquisáveis e os alertas relacionados aparecem como um único incidente com uma visão de causalidade.",
    "how_to": "",
    "notes": [
     "A taxonomia ainda referencia o domínio XSIAM anterior; manter até que a biblioteca seja remapeada."
    ],
    "source_version": 3,
    "source_updated_at": "2026-07-10T12:00:00.000000Z"
   }
  },
  {
   "id": "67dbcd4b-9508-53fa-9414-12202d0a7b0d",
   "version": 2,
   "name": "Zone-based segmentation with User-ID policies",
   "summary": "Segment data center tiers into zones and restrict access by user group with User-ID.",
   "description": "The data center has a flat network where every server can reach every other server. This test places the web, application and database tiers in separate zones and allows only the required applications between them, with administrative access limited to an IT group.",
   "objectives": [
    "Create zones for the web, application and database tiers.",
    "Allow only the required applications between tiers.",
    "Restrict SSH and RDP to the IT administrators group using User-ID."
   ],
   "evaluation_metrics": [
    "Pass/Fail"
   ],
   "expected_outcome": "Only allowed applications cross zone boundaries and administrative access is limited to the IT group.",
   "how_to": "",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-03-11T08:50:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
    "69440cf3-38b7-5237-b4b0-5fc18972f303"
   ],
   "prereq_ids": [],
   "industry_ids": [
    "32dde312-13cf-53b2-a89d-258cb1cc2f2a"
   ],
   "value_drivers": [
    "17090326-1960-50a7-88ac-6cdc07ef9c16",
    "ceac6358-c623-5c44-97be-876db394b7f9"
   ],
   "competitors": [],
   "docs": [],
   "notes": [],
   "history": [
    {
     "id": "dcca3705-4679-5055-8b49-e43d64b26e0d",
     "at": "2026-06-03T15:40:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "723b32c1-737c-560c-b85e-0a5f78b41b39",
     "at": "2026-06-03T15:40:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Unknown",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "31f2ba13-cf14-599e-92bc-3871feb8da99",
   "assignee_id": null,
   "created_at": "2026-03-11T08:50:00.000000Z",
   "updated_at": "2026-06-03T15:40:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "723b32c1-737c-560c-b85e-0a5f78b41b39",
     "at": "2026-06-03T15:40:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Unknown",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "2d904bf9-d706-590b-9b76-f4e185f44787": {
      "id": "723b32c1-737c-560c-b85e-0a5f78b41b39",
      "at": "2026-06-03T15:40:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Unknown",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "2d904bf9-d706-590b-9b76-f4e185f44787",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
     "name": "NGFW",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#e4572e"
    },
    {
     "node_id": "69440cf3-38b7-5237-b4b0-5fc18972f303",
     "name": "Data Center Segmentation",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "Segmentação baseada em zonas com políticas User-ID",
    "summary": "Segmentar as camadas do data center em zonas e restringir o acesso por grupo de usuários com User-ID.",
    "description": "O data center tem uma rede plana em que todo servidor alcança qualquer outro servidor. Este teste coloca as camadas web, aplicação e banco de dados em zonas separadas e permite apenas as aplicações necessárias entre elas, com acesso administrativo limitado a um grupo de TI.",
    "objectives": [
     "Criar zonas para as camadas web, aplicação e banco de dados.",
     "Permitir apenas as aplicações necessárias entre as camadas.",
     "Restringir SSH e RDP ao grupo de administradores de TI usando User-ID."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado"
    ],
    "expected_outcome": "Somente as aplicações permitidas cruzam os limites entre zonas e o acesso administrativo fica limitado ao grupo de TI.",
    "how_to": "",
    "notes": [],
    "source_version": 2,
    "source_updated_at": "2026-06-03T15:40:01.000000Z"
   }
  },
  {
   "id": "5106ea9d-2c51-5820-afa3-5fd29b014570",
   "version": 1,
   "name": "ZTNA to private application",
   "summary": "Provide least-privilege access to a private web application without exposing the network.",
   "description": "A private web application hosted in the data center must be reachable only by an authorized group. This test publishes the application through Prisma Access with a ZTNA Connector and grants access by user group.",
   "objectives": [
    "Deploy a ZTNA Connector next to the private application.",
    "Allow access only to members of the authorized group.",
    "Verify that other hosts on the same subnet are not reachable."
   ],
   "evaluation_metrics": [
    "Pass/Fail"
   ],
   "expected_outcome": "Authorized users reach the application; unauthorized users and other hosts are blocked.",
   "how_to": "1) Reserve the ZTNA lab VM as described in https://intranet.example.com/wiki/pov-lab.\n2) Deploy the ZTNA Connector VM in the application network.\n3) Add the application as a target in Strata Cloud Manager.\n4) Create a security rule that allows the authorized group to reach the application.\n5) Test access with an authorized and an unauthorized user.",
   "lifecycle": "tested",
   "published": true,
   "visibility": "shared",
   "shared_at": "2026-03-05T10:30:00.000000Z",
   "saved_to_library": true,
   "authored_for_catalog": false,
   "node_ids": [
    "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
    "b7c11b34-d42e-5de3-8e87-169c3254628d",
    "a7a8ca79-3fd1-5e91-b85d-a021e73c1b3a"
   ],
   "prereq_ids": [
    "77228bf9-b95d-538b-b99b-c36b752b1f98"
   ],
   "industry_ids": [],
   "value_drivers": [
    {
     "value_driver_id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
     "note": ""
    }
   ],
   "competitors": [
    {
     "competitor_id": "3d850490-35a6-57ef-a962-04aa3c02aa8e",
     "stance": "advantage",
     "note": ""
    }
   ],
   "docs": [
    {
     "id": "9362b7a0-7a06-52fb-8086-a3d1b7eb0b96",
     "label": "ZTNA Connector",
     "url": "https://docs.paloaltonetworks.com/prisma-access/administration/ztna-connector",
     "summary": "Deploying the ZTNA Connector and publishing private applications.",
     "audience": "customer"
    }
   ],
   "notes": [],
   "history": [
    {
     "id": "0857ac35-f2b7-5dae-b509-fc6ddec2b391",
     "at": "2026-05-21T16:15:01.000000Z",
     "actor": {
      "user_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
      "name": "Demo Reviewer",
      "email": "reviewer@example.com",
      "on_behalf_of": null
     },
     "kind": "transition",
     "from_state": "reviewed",
     "to_state": "tested",
     "transition_id": null,
     "publish_effect": null,
     "result": null,
     "environment_id": null,
     "assignee_id": "50dc04f5-6fe4-5e22-8a48-f8410829d2e9",
     "fields": [],
     "reason": "Auto-transition"
    },
    {
     "id": "7cccd60f-0b45-52e6-9e33-92a885dcb121",
     "at": "2026-05-21T16:15:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
     "assignee_id": null,
     "fields": [],
     "reason": null
    }
   ],
   "author_id": "cc60d71a-a31e-5ca6-94c4-6dca1859c342",
   "assignee_id": null,
   "created_at": "2026-03-05T10:30:00.000000Z",
   "updated_at": "2026-05-21T16:15:01.000000Z",
   "testing": {
    "latest_signoff": {
     "id": "7cccd60f-0b45-52e6-9e33-92a885dcb121",
     "at": "2026-05-21T16:15:00.000000Z",
     "actor": {
      "user_id": null,
      "name": "Lab Team",
      "email": "",
      "on_behalf_of": null
     },
     "kind": "test",
     "from_state": null,
     "to_state": null,
     "transition_id": null,
     "publish_effect": null,
     "result": "pass",
     "environment_id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
     "assignee_id": null,
     "fields": null,
     "reason": null
    },
    "latest_by_environment": {
     "cf2ba073-ed17-5d17-81d4-1bb3677d18d1": {
      "id": "7cccd60f-0b45-52e6-9e33-92a885dcb121",
      "at": "2026-05-21T16:15:00.000000Z",
      "actor": {
       "user_id": null,
       "name": "Lab Team",
       "email": "",
       "on_behalf_of": null
      },
      "kind": "test",
      "from_state": null,
      "to_state": null,
      "transition_id": null,
      "publish_effect": null,
      "result": "pass",
      "environment_id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
      "assignee_id": null,
      "fields": null,
      "reason": null
     }
    },
    "tested": true
   },
   "taxonomy": [
    {
     "node_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
     "name": "SASE",
     "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
     "depth": 0,
     "brand_color": "#2e86de"
    },
    {
     "node_id": "b7c11b34-d42e-5de3-8e87-169c3254628d",
     "name": "Secure Remote Access",
     "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
     "depth": 1,
     "brand_color": null
    },
    {
     "node_id": "a7a8ca79-3fd1-5e91-b85d-a021e73c1b3a",
     "name": "ZTNA to Private Apps",
     "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
     "depth": 2,
     "brand_color": null
    }
   ],
   "pt": {
    "name": "ZTNA para aplicação privada",
    "summary": "Fornecer acesso de menor privilégio a uma aplicação web privada sem expor a rede.",
    "description": "Uma aplicação web privada hospedada no data center deve ser acessível apenas por um grupo autorizado. Este teste publica a aplicação por meio do Prisma Access com um ZTNA Connector e concede acesso por grupo de usuários.",
    "objectives": [
     "Implantar um ZTNA Connector ao lado da aplicação privada.",
     "Permitir o acesso apenas aos membros do grupo autorizado.",
     "Verificar que outros hosts da mesma sub-rede não são alcançáveis."
    ],
    "evaluation_metrics": [
     "Aprovado/Reprovado"
    ],
    "expected_outcome": "Os usuários autorizados alcançam a aplicação; usuários não autorizados e outros hosts são bloqueados.",
    "how_to": "1) Reservar a VM de laboratório de ZTNA conforme descrito em https://intranet.example.com/wiki/pov-lab.\n2) Implantar a VM do ZTNA Connector na rede da aplicação.\n3) Adicionar a aplicação como destino no Strata Cloud Manager.\n4) Criar uma regra de segurança que permite ao grupo autorizado alcançar a aplicação.\n5) Testar o acesso com um usuário autorizado e com um não autorizado.",
    "notes": [],
    "source_version": 1,
    "source_updated_at": "2026-05-21T16:15:01.000000Z"
   }
  }
 ],
 "taxonomy_nodes": [
  {
   "id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
   "version": 1,
   "name": "NGFW",
   "description": "Network security delivered by next-generation firewalls in hardware, virtual and cloud form factors.",
   "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
   "parent_id": null,
   "forest_parent_id": null,
   "placed": true,
   "status": "active",
   "brand_color": "#e4572e",
   "name_pt": "NGFW",
   "description_pt": "Segurança de rede entregue por firewalls de próxima geração em formatos físico, virtual e em nuvem."
  },
  {
   "id": "f32215b1-1cae-5d0f-a71b-24e82fba887c",
   "version": 2,
   "name": "Securing Internet Access",
   "description": "Protect users and devices that browse the internet from web-borne threats.",
   "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "parent_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
   "forest_parent_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Proteção do acesso à Internet",
   "description_pt": "Proteger usuários e dispositivos que navegam na Internet contra ameaças originadas na web."
  },
  {
   "id": "588276ef-03f0-549a-8097-8698dfcaf90c",
   "version": 1,
   "name": "URL Filtering and Content Filtering",
   "description": "",
   "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
   "parent_id": "f32215b1-1cae-5d0f-a71b-24e82fba887c",
   "forest_parent_id": "f32215b1-1cae-5d0f-a71b-24e82fba887c",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Filtragem de URL e de conteúdo",
   "description_pt": ""
  },
  {
   "id": "c21fe636-e2df-58c8-8bb4-092ee68bafba",
   "version": 1,
   "name": "Advanced Threat Prevention",
   "description": "Inline prevention of exploits, malware and command-and-control traffic.",
   "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
   "parent_id": "f32215b1-1cae-5d0f-a71b-24e82fba887c",
   "forest_parent_id": "f32215b1-1cae-5d0f-a71b-24e82fba887c",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Advanced Threat Prevention",
   "description_pt": "Prevenção inline de exploits, malware e tráfego de comando e controle."
  },
  {
   "id": "00731697-9610-5d4c-b1e0-495924c6157a",
   "version": 1,
   "name": "Application Control",
   "description": "Identify and control applications regardless of port, protocol or encryption.",
   "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "parent_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
   "forest_parent_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Controle de aplicações",
   "description_pt": "Identificar e controlar aplicações independentemente de porta, protocolo ou criptografia."
  },
  {
   "id": "9a97cfed-597b-5e8c-b3e2-cb70069736a8",
   "version": 1,
   "name": "App-ID Policy",
   "description": "",
   "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
   "parent_id": "00731697-9610-5d4c-b1e0-495924c6157a",
   "forest_parent_id": "00731697-9610-5d4c-b1e0-495924c6157a",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Política de App-ID",
   "description_pt": ""
  },
  {
   "id": "69440cf3-38b7-5237-b4b0-5fc18972f303",
   "version": 1,
   "name": "Data Center Segmentation",
   "description": "",
   "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "parent_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
   "forest_parent_id": "f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Segmentação do data center",
   "description_pt": ""
  },
  {
   "id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
   "version": 1,
   "name": "SASE",
   "description": "Secure access for users and branches delivered from the cloud.",
   "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
   "parent_id": null,
   "forest_parent_id": null,
   "placed": true,
   "status": "active",
   "brand_color": "#2e86de",
   "name_pt": "SASE",
   "description_pt": "Acesso seguro para usuários e filiais entregue a partir da nuvem."
  },
  {
   "id": "b7c11b34-d42e-5de3-8e87-169c3254628d",
   "version": 1,
   "name": "Secure Remote Access",
   "description": "Consistent security for users working from any location.",
   "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "parent_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
   "forest_parent_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Acesso remoto seguro",
   "description_pt": "Segurança consistente para usuários que trabalham de qualquer local."
  },
  {
   "id": "a7a8ca79-3fd1-5e91-b85d-a021e73c1b3a",
   "version": 1,
   "name": "ZTNA to Private Apps",
   "description": "Least-privilege access to private applications without network-level access.",
   "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
   "parent_id": "b7c11b34-d42e-5de3-8e87-169c3254628d",
   "forest_parent_id": "b7c11b34-d42e-5de3-8e87-169c3254628d",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "ZTNA para aplicações privadas",
   "description_pt": "Acesso de menor privilégio a aplicações privadas sem acesso em nível de rede."
  },
  {
   "id": "9d809db2-5932-53ce-a50c-4e13fe95ba03",
   "version": 1,
   "name": "SaaS and Data Protection",
   "description": "",
   "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
   "parent_id": "b7c11b34-d42e-5de3-8e87-169c3254628d",
   "forest_parent_id": "b7c11b34-d42e-5de3-8e87-169c3254628d",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Proteção de SaaS e dados",
   "description_pt": ""
  },
  {
   "id": "059a10ef-9213-5637-9858-3fbaeecec4d5",
   "version": 1,
   "name": "Branch Connectivity (SD-WAN)",
   "description": "Application-aware connectivity for branch offices over multiple WAN links.",
   "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "parent_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
   "forest_parent_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Conectividade de filiais (SD-WAN)",
   "description_pt": "Conectividade com reconhecimento de aplicações para filiais por meio de múltiplos links WAN."
  },
  {
   "id": "999db8af-0e97-519b-ae45-72ce529f5caf",
   "version": 1,
   "name": "Digital Experience Monitoring",
   "description": "",
   "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "parent_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
   "forest_parent_id": "ac1f23ca-54e0-5f78-b18d-74ef413d2713",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Monitoramento da experiência digital",
   "description_pt": ""
  },
  {
   "id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
   "version": 1,
   "name": "Cloud",
   "description": "Security for cloud infrastructure, applications and workloads from code to runtime.",
   "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
   "parent_id": null,
   "forest_parent_id": null,
   "placed": true,
   "status": "active",
   "brand_color": "#10ac84",
   "name_pt": "Cloud",
   "description_pt": "Segurança para infraestrutura, aplicações e workloads em nuvem, do código ao runtime."
  },
  {
   "id": "7f2eac05-d581-5e01-8439-dff2efce29dc",
   "version": 1,
   "name": "Cloud Security Posture",
   "description": "Continuous visibility and compliance for cloud accounts.",
   "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "parent_id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
   "forest_parent_id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Postura de segurança em nuvem",
   "description_pt": "Visibilidade e conformidade contínuas para contas de nuvem."
  },
  {
   "id": "86ffa026-0a1e-5901-a938-87f502096855",
   "version": 1,
   "name": "Misconfiguration Detection",
   "description": "",
   "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
   "parent_id": "7f2eac05-d581-5e01-8439-dff2efce29dc",
   "forest_parent_id": "7f2eac05-d581-5e01-8439-dff2efce29dc",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Detecção de configurações incorretas",
   "description_pt": ""
  },
  {
   "id": "4d19e319-eb1c-54f4-9a7a-027e4d59cf94",
   "version": 1,
   "name": "Application Security",
   "description": "Security of application code, dependencies and delivery pipelines.",
   "type_id": "85c62e50-0c13-57b7-88de-e835a401dbbf",
   "parent_id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
   "forest_parent_id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Segurança de aplicações",
   "description_pt": "Segurança do código das aplicações, das dependências e dos pipelines de entrega."
  },
  {
   "id": "7c360b69-cd3f-5958-a316-7238a754fbe1",
   "version": 1,
   "name": "Code to Cloud (IaC Scanning)",
   "description": "Find and fix misconfigurations in infrastructure as code before deployment.",
   "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "parent_id": "4d19e319-eb1c-54f4-9a7a-027e4d59cf94",
   "forest_parent_id": "4d19e319-eb1c-54f4-9a7a-027e4d59cf94",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Code to Cloud (varredura de IaC)",
   "description_pt": "Encontrar e corrigir configurações incorretas em infraestrutura como código antes da implantação."
  },
  {
   "id": "dd671bef-f078-5d15-b549-344179afb8a6",
   "version": 1,
   "name": "Kubernetes Runtime Protection",
   "description": "",
   "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "parent_id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
   "forest_parent_id": "1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Proteção de runtime para Kubernetes",
   "description_pt": ""
  },
  {
   "id": "7b568705-5ad1-5d6d-ac1f-8c1de9b924bf",
   "version": 1,
   "name": "Admission Control",
   "description": "Policy enforcement when workloads are deployed to the cluster.",
   "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
   "parent_id": "dd671bef-f078-5d15-b549-344179afb8a6",
   "forest_parent_id": "dd671bef-f078-5d15-b549-344179afb8a6",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Controle de admissão",
   "description_pt": "Aplicação de políticas quando workloads são implantados no cluster."
  },
  {
   "id": "dbeb9348-8c18-538d-8080-54fc337f08f1",
   "version": 1,
   "name": "SecOps",
   "description": "Detection, investigation and response across the security operations center.",
   "type_id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
   "parent_id": null,
   "forest_parent_id": null,
   "placed": true,
   "status": "active",
   "brand_color": "#8e44ad",
   "name_pt": "SecOps",
   "description_pt": "Detecção, investigação e resposta em todo o centro de operações de segurança."
  },
  {
   "id": "8bdb7daa-c744-5112-aa22-37ef28624529",
   "version": 2,
   "name": "Incident Response Automation",
   "description": "Automate triage, investigation and containment with playbooks.",
   "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "parent_id": "dbeb9348-8c18-538d-8080-54fc337f08f1",
   "forest_parent_id": "dbeb9348-8c18-538d-8080-54fc337f08f1",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Automação de resposta a incidentes",
   "description_pt": "Automatizar triagem, investigação e contenção com playbooks."
  },
  {
   "id": "cef43209-8214-57e1-b481-3227749831de",
   "version": 1,
   "name": "Playbook-driven Containment",
   "description": "",
   "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
   "parent_id": "8bdb7daa-c744-5112-aa22-37ef28624529",
   "forest_parent_id": "8bdb7daa-c744-5112-aa22-37ef28624529",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Contenção orientada por playbook",
   "description_pt": ""
  },
  {
   "id": "f8f9a071-aa50-50ae-8fec-fc916740d37a",
   "version": 1,
   "name": "Endpoint Protection",
   "description": "Prevent, detect and respond to threats on endpoints.",
   "type_id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "parent_id": "dbeb9348-8c18-538d-8080-54fc337f08f1",
   "forest_parent_id": "dbeb9348-8c18-538d-8080-54fc337f08f1",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Proteção de endpoints",
   "description_pt": "Prevenir, detectar e responder a ameaças em endpoints."
  },
  {
   "id": "8b98c52c-657a-5b1a-a06f-3d21988e19ab",
   "version": 1,
   "name": "Ransomware Prevention",
   "description": "",
   "type_id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
   "parent_id": "f8f9a071-aa50-50ae-8fec-fc916740d37a",
   "forest_parent_id": "f8f9a071-aa50-50ae-8fec-fc916740d37a",
   "placed": true,
   "status": "active",
   "brand_color": null,
   "name_pt": "Prevenção de ransomware",
   "description_pt": ""
  }
 ],
 "taxonomy_nodes_pt_extra": {
  "49bc07ea-a6a8-56f3-b4ad-d003ae7e62d3": {
   "name": "XSIAM",
   "description": ""
  },
  "843f0898-a241-58e6-827d-5284afb07555": {
   "name": "Aumentar a eficiência do SOC",
   "description": "Reduzir o esforço manual dos analistas do SOC por meio de correlação e automação."
  }
 },
 "node_types": [
  {
   "id": "c195f0f5-5f2b-59c0-83d9-1a62612dc139",
   "version": 1,
   "label": "Domain",
   "abbrev": "DOM",
   "color": "brand",
   "icon": "Network",
   "label_pt": "Domínio"
  },
  {
   "id": "084059f1-9e26-52dd-87d7-a3ed5a9961a8",
   "version": 1,
   "label": "Feature",
   "abbrev": "FEA",
   "color": "green",
   "icon": "Sparkles",
   "label_pt": "Recurso"
  },
  {
   "id": "9f5e88d8-ce5b-5007-b098-ddca32f47d63",
   "version": 1,
   "label": "Product",
   "abbrev": "PRD",
   "color": "blue",
   "icon": "Box",
   "label_pt": "Produto"
  },
  {
   "id": "01fae65e-3bbd-54ce-96a1-11877aa810d4",
   "version": 2,
   "label": "Scenario",
   "abbrev": "SCN",
   "color": "violet",
   "icon": "Beaker",
   "label_pt": "Cenário"
  },
  {
   "id": "85c62e50-0c13-57b7-88de-e835a401dbbf",
   "version": 1,
   "label": "Subdomain",
   "abbrev": "SUB",
   "color": "gray",
   "icon": "FolderTree",
   "label_pt": "Subdomínio"
  },
  {
   "id": "7d2fca89-d2d1-5cf7-a8b5-617f7977597c",
   "version": 1,
   "label": "Use Case",
   "abbrev": "UC",
   "color": "teal",
   "icon": "Crosshair",
   "label_pt": "Use Case"
  }
 ],
 "competitors": [
  {
   "id": "3a5ccbbb-91fe-50cc-a82a-08ed86f6df50",
   "version": 1,
   "name": "Concorrente A",
   "description": ""
  },
  {
   "id": "237b59fd-0e66-5901-ada3-6886b884a2c8",
   "version": 1,
   "name": "Concorrente B",
   "description": ""
  },
  {
   "id": "3d850490-35a6-57ef-a962-04aa3c02aa8e",
   "version": 1,
   "name": "Concorrente C",
   "description": ""
  },
  {
   "id": "18f0b61d-a337-5c8e-ba05-6a00c8e414f6",
   "version": 1,
   "name": "Concorrente D",
   "description": ""
  }
 ],
 "industries": [
  {
   "id": "c933ac16-3ac5-5a90-bc71-f6da0fe05685",
   "version": 1,
   "name": "FSI",
   "description": ""
  },
  {
   "id": "45f15b8b-065e-5c08-b188-6a371892e85f",
   "version": 1,
   "name": "Healthcare",
   "description": ""
  },
  {
   "id": "32dde312-13cf-53b2-a89d-258cb1cc2f2a",
   "version": 1,
   "name": "Manufacturing",
   "description": ""
  },
  {
   "id": "b80a06f2-3755-5426-b0c8-6752330c1391",
   "version": 1,
   "name": "Retail",
   "description": ""
  }
 ],
 "value_drivers": [
  {
   "id": "17090326-1960-50a7-88ac-6cdc07ef9c16",
   "version": 1,
   "name": "Reduce risk",
   "description": "Lower the likelihood and impact of security incidents."
  },
  {
   "id": "3ad8092e-c7eb-5ceb-b314-0bba2318cf9d",
   "version": 1,
   "name": "Operational efficiency",
   "description": "Reduce manual effort and time spent on security operations."
  },
  {
   "id": "ceac6358-c623-5c44-97be-876db394b7f9",
   "version": 1,
   "name": "Consolidation / TCO",
   "description": "Replace point products and lower the total cost of ownership."
  },
  {
   "id": "0693a370-12a3-5d91-adbb-a834d48535ef",
   "version": 1,
   "name": "User experience",
   "description": "Keep users productive with fast and secure access."
  }
 ],
 "environments": [
  {
   "id": "2d904bf9-d706-590b-9b76-f4e185f44787",
   "version": 1,
   "name": "Lab — Reference Topology",
   "description": "Shared lab with the reference NGFW and SASE topology.",
   "active": true,
   "name_pt": "Lab — Topologia de referência",
   "description_pt": "Laboratório compartilhado com a topologia de referência de NGFW e SASE."
  },
  {
   "id": "ed140dce-14cf-5908-accd-dd50e040209a",
   "version": 1,
   "name": "PAN-OS 11.2 lab",
   "description": "Hardware and VM-Series firewalls running PAN-OS 11.2.",
   "active": true,
   "name_pt": "Laboratório PAN-OS 11.2",
   "description_pt": "Firewalls físicos e VM-Series executando PAN-OS 11.2."
  },
  {
   "id": "cf2ba073-ed17-5d17-81d4-1bb3677d18d1",
   "version": 1,
   "name": "Prisma Access tenant",
   "description": "Demo Prisma Access tenant managed by Strata Cloud Manager.",
   "active": true,
   "name_pt": "Tenant do Prisma Access",
   "description_pt": "Tenant de demonstração do Prisma Access gerenciado pelo Strata Cloud Manager."
  },
  {
   "id": "807b9adf-16a3-56b9-bde9-96a318c06615",
   "version": 1,
   "name": "Cortex XSIAM tenant",
   "description": "Demo Cortex XSIAM tenant with sample data sources.",
   "active": true,
   "name_pt": "Tenant do Cortex XSIAM",
   "description_pt": "Tenant de demonstração do Cortex XSIAM com fontes de dados de exemplo."
  },
  {
   "id": "4e070af0-9d1a-5c2f-9823-8841c153e354",
   "version": 1,
   "name": "Not specified",
   "description": "Environment not recorded at sign-off.",
   "active": true,
   "name_pt": "Não especificado",
   "description_pt": "Ambiente não registrado no momento do sign-off."
  }
 ],
 "prerequisites": [
  {
   "id": "680ea218-71ee-5581-b927-33d3c916c3bb",
   "version": 1,
   "name": "Firewall running PAN-OS 11.x with active licenses",
   "description": "Hardware or VM-Series firewall with Advanced Threat Prevention, Advanced URL Filtering, Advanced WildFire and Advanced DNS Security licenses."
  },
  {
   "id": "962eb694-c351-5077-9cfb-379d75fa4f46",
   "version": 1,
   "name": "SSL decryption certificate deployed to endpoints",
   "description": "Forward trust certificate installed in the trusted root store of the test endpoints."
  },
  {
   "id": "77228bf9-b95d-538b-b99b-c36b752b1f98",
   "version": 1,
   "name": "Test endpoint with GlobalProtect agent",
   "description": ""
  },
  {
   "id": "d29f1e12-81a9-521c-a4b0-e0fd6367dcde",
   "version": 1,
   "name": "Read-only cloud account onboarded",
   "description": "Sandbox cloud account onboarded with read-only permissions."
  },
  {
   "id": "9e7dc55c-7c27-5963-a909-6565dd2508e6",
   "version": 1,
   "name": "Log forwarding to Strata Logging Service",
   "description": "Firewall log forwarding profile sending traffic, threat and URL logs."
  },
  {
   "id": "f764d1e3-d94f-5733-b8e5-9ba69d31b607",
   "version": 1,
   "name": "XDR agent installed on test hosts",
   "description": ""
  }
 ],
 "tools": [],
 "coverage": null
};
