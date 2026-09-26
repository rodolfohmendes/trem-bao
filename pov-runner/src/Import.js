/**
 * Import.js — do JSON do coletor (pov-companion-collector.js, de preferência o .pt-BR.json) para as
 * linhas das abas Library / Taxonomia / Ambientes, com validação, dry-run e as regras que protegem
 * o trabalho já registrado (lápides para casos removidos, tradução preservada, bundle parcial).
 *
 * Parte pura (testável em Node): validateBundle, bundleToRows, carryOverTranslations, addTombstones,
 *   markOrphans, dryRunImport.
 * Parte Apps Script (no fim do arquivo): leitura do Drive, upload, importação, demonstração.
 */

var COLLECTOR_SOURCE = 'pov-companion-collector.js';
var ACTOR_PLACEHOLDERS = ['Unknown', 'unknown', ''];

/**
 * Valida o bundle antes de qualquer gravação.
 * Retorna {ok, errors[], warnings[], partial} com mensagens em português. Um bundle parcial
 * (meta.partial = true) só passa com opts.allowPartial.
 */
function validateBundle(bundle, opts) {
  opts = opts || {};
  var errors = [], warnings = [];
  if (!bundle || typeof bundle !== 'object' || Array.isArray(bundle)) {
    return { ok: false, errors: ['O arquivo não é um JSON de objeto.'], warnings: [], partial: false };
  }
  var meta = bundle.meta || {};
  if (meta.source !== COLLECTOR_SOURCE) {
    errors.push('meta.source deveria ser "' + COLLECTOR_SOURCE + '" (o arquivo não veio do coletor).');
  }
  if (!Array.isArray(bundle.test_cases) || bundle.test_cases.length === 0) {
    errors.push('test_cases precisa ser uma lista não vazia.');
  } else {
    var seen = {}, dup = 0, semId = 0;
    bundle.test_cases.forEach(function (c) {
      if (!c || !c.id) { semId++; return; }
      if (seen[c.id]) dup++;
      seen[c.id] = true;
    });
    if (semId) errors.push(semId + ' test case(s) sem id.');
    if (dup) errors.push(dup + ' id(s) duplicado(s) em test_cases.');
  }
  ['taxonomy_nodes', 'node_types', 'environments'].forEach(function (k) {
    if (!Array.isArray(bundle[k]) || bundle[k].length === 0) errors.push('Lista obrigatória ausente ou vazia: ' + k + ' (o coletor pode ter falhado nesse endpoint; rode de novo).');
  });
  ['competitors', 'industries', 'value_drivers', 'prerequisites'].forEach(function (k) {
    if (bundle[k] !== undefined && bundle[k] !== null && !Array.isArray(bundle[k])) errors.push('Campo ' + k + ' deveria ser uma lista.');
  });
  var counts = meta.counts || {};
  Object.keys(counts).forEach(function (k) {
    if (Array.isArray(bundle[k]) && typeof counts[k] === 'number' && counts[k] !== bundle[k].length) {
      errors.push('meta.counts.' + k + ' (' + counts[k] + ') difere do tamanho de ' + k + ' (' + bundle[k].length + ').');
    }
  });
  var partial = meta.partial === true ||
    (typeof meta.library_total_reported === 'number' && Array.isArray(bundle.test_cases) && bundle.test_cases.length < meta.library_total_reported);
  if (partial) {
    var msg = 'Export parcial: ' + (Array.isArray(bundle.test_cases) ? bundle.test_cases.length : 0) + ' de ' + (meta.library_total_reported || '?') +
      ' test cases. Importar marcaria como órfãs execuções de casos que só faltaram no download.';
    if (opts.allowPartial) warnings.push(msg + ' Importação parcial autorizada: execuções de casos ausentes não serão marcadas como órfãs.');
    else errors.push(msg + ' Rode o coletor de novo ou confirme "importar mesmo assim".');
  }
  if (!meta.translation) warnings.push('O bundle não tem tradução (meta.translation): os casos aparecem em inglês com o selo "tradução pendente", exceto os que já tinham tradução da mesma versão.');
  return { ok: errors.length === 0, errors: errors, warnings: warnings, partial: partial };
}

/** Nome de exibição de um registro de referência (mesma regra do build_base.py). */
function refName_(rec, preferPt) {
  if (!rec) return '';
  if (preferPt && rec.name_pt) return rec.name_pt;
  return rec.name || rec.label || rec.title || rec.id || '';
}

function textList_(arr) {
  return (Array.isArray(arr) ? arr : []).map(function (s) { return cleanText(s); });
}

function actorName_(actor) {
  var n = actor && actor.name ? String(actor.name) : '';
  return ACTOR_PLACEHOLDERS.indexOf(n) >= 0 ? '' : n;
}

/** Caso entra na biblioteca do app? Só publicados e compartilhados (campos ausentes = sim). */
function isShareableCase_(c) {
  if (c.published === false) return false;
  if (c.visibility !== undefined && c.visibility !== null && c.visibility !== 'shared') return false;
  return true;
}

/**
 * Converte o bundle nas linhas das abas.
 * Retorna {library, taxonomia, ambientes, config, pending, excluded[], unresolved{}}.
 */
function bundleToRows(bundle) {
  var meta = bundle.meta || {};
  var typeLabel = {}, typeLabelPt = {};
  (bundle.node_types || []).forEach(function (t) { typeLabel[t.id] = t.label; typeLabelPt[t.id] = t.label_pt || t.label; });
  var TYPE_PT_FALLBACK = { 'Domain': 'Domínio', 'Feature': 'Recurso', 'Product': 'Produto', 'Scenario': 'Cenário', 'Subdomain': 'Subdomínio', 'Use Case': 'Use Case' };
  var DEPTH_TYPE = { 0: 'Domain', 1: 'Use Case', 2: 'Scenario' };
  function idx(list, pt) { var o = {}; (list || []).forEach(function (r) { if (r && r.id) o[r.id] = refName_(r, pt); }); return o; }
  var envName = idx(bundle.environments, true);
  var indName = idx(bundle.industries, false);
  var vdName = idx(bundle.value_drivers, true);
  var compName = idx(bundle.competitors, false);
  var prereqById = {};
  (bundle.prerequisites || []).forEach(function (p) {
    if (p && p.id) prereqById[p.id] = { id: p.id, name: cleanText(refName_(p, true)), description: cleanText(p.description_pt || p.description || p.summary || '') };
  });
  var ptExtra = bundle.taxonomy_nodes_pt_extra || {};
  var origin = String(meta.origin || '').replace(/\/+$/, '');
  var unresolved = { prerequisites: 0, industries: 0, environments: 0, competitors: 0, value_drivers: 0 };

  // ---- taxonomia: nós do endpoint + nós que só existem embutidos nos casos (aposentados)
  var nodes = {};
  (bundle.taxonomy_nodes || []).forEach(function (n) {
    nodes[n.id] = { id: n.id, name: cleanText(n.name), name_pt: cleanText(n.name_pt || (ptExtra[n.id] && ptExtra[n.id].name) || n.name),
      type_id: n.type_id, depth: typeof n.depth === 'number' ? n.depth : null, parent_id: n.parent_id || null, parent_inferido: false,
      description: cleanText(n.description), description_pt: cleanText(n.description_pt), status: n.status || 'active', embedded: false };
  });
  (bundle.test_cases || []).forEach(function (c) {
    (c.taxonomy || []).forEach(function (t) {
      if (nodes[t.node_id]) return;
      var x = ptExtra[t.node_id] || {};
      nodes[t.node_id] = { id: t.node_id, name: cleanText(t.name), name_pt: cleanText(x.name || t.name), type_id: t.type_id,
        depth: typeof t.depth === 'number' ? t.depth : null, parent_id: null, parent_inferido: false, description: '',
        description_pt: cleanText(x.description), status: 'embedded-only', embedded: true };
    });
  });
  // /taxonomy/nodes não traz depth: calcula pela cadeia de pais ANTES da inferência (senão um nó ativo
  // nunca poderia ser escolhido como pai de um aposentado)
  function fillDepths() {
    Object.keys(nodes).forEach(function (nid) {
      var n = nodes[nid];
      if (typeof n.depth === 'number') return;
      var d = 0, seen = {}, p = n.parent_id ? nodes[n.parent_id] : null;
      while (p && !seen[p.id]) { seen[p.id] = true; d++; p = p.parent_id ? nodes[p.parent_id] : null; }
      n.depth = d;
    });
  }
  fillDepths();
  // pai dos nós embutidos: nó um nível acima que mais co-ocorre nos node_ids (marcações explícitas) dos mesmos casos;
  // empate → prefere outro nó embutido (aposentados andam juntos), depois o id (determinístico)
  var cooc = {};
  (bundle.test_cases || []).forEach(function (c) {
    var tagged = (c.node_ids || []).filter(function (id) { return nodes[id]; });
    tagged.forEach(function (id) {
      var n = nodes[id];
      if (!n.embedded || typeof n.depth !== 'number' || n.depth === 0) return;
      tagged.forEach(function (pid) {
        var p = nodes[pid];
        if (p && typeof p.depth === 'number' && p.depth === n.depth - 1) {
          cooc[id] = cooc[id] || {};
          cooc[id][pid] = (cooc[id][pid] || 0) + 1;
        }
      });
    });
  });
  Object.keys(cooc).forEach(function (nid) {
    var cands = Object.keys(cooc[nid]).sort(function (a, b) {
      return (cooc[nid][b] - cooc[nid][a]) || ((nodes[b].embedded ? 1 : 0) - (nodes[a].embedded ? 1 : 0)) || (a < b ? -1 : 1);
    });
    if (cands.length) { nodes[nid].parent_id = cands[0]; nodes[nid].parent_inferido = true; }
  });
  fillDepths();
  function pathPt(nid) {
    var chain = [], seen = {}, n = nodes[nid];
    while (n && !seen[n.id]) { seen[n.id] = true; chain.unshift(n.name_pt); n = n.parent_id ? nodes[n.parent_id] : null; }
    return chain.join(' › ');
  }
  function typeOf(n) { return typeLabel[n.type_id] || DEPTH_TYPE[n.depth] || ''; }
  var taxonomia = Object.keys(nodes).map(function (nid) {
    var n = nodes[nid];
    var type = typeOf(n);
    return { node_id: n.id, name: n.name, name_pt: n.name_pt, type: type, type_pt: typeLabelPt[n.type_id] || TYPE_PT_FALLBACK[type] || type,
      depth: n.depth, parent_id: n.parent_id || '', parent_inferido: n.parent_inferido, path_pt: pathPt(n.id),
      description: n.description, description_pt: n.description_pt, status: n.status };
  });
  taxonomia.sort(function (a, b) { return a.depth - b.depth || (a.path_pt < b.path_pt ? -1 : a.path_pt > b.path_pt ? 1 : (a.node_id < b.node_id ? -1 : 1)); });

  // ---- library (só casos publicados e compartilhados)
  var pending = 0, excluded = [];
  var library = [];
  (bundle.test_cases || []).forEach(function (c) {
    if (!isShareableCase_(c)) { excluded.push((c.pt && c.pt.name) || c.name || c.id); return; }
    var pt = c.pt && typeof c.pt === 'object' ? c.pt : null;
    var isPending = !pt || pt.source_version !== c.version;
    if (isPending) pending++;
    var testing = c.testing || {};
    var signoff = testing.latest_signoff || null;
    function namesOfType(label) {
      return (c.taxonomy || []).filter(function (t) {
        var n = nodes[t.node_id];
        return (typeLabel[t.type_id] || (n ? typeOf(n) : '')) === label;
      }).map(function (t) { return nodes[t.node_id] ? nodes[t.node_id].name_pt : t.name; });
    }
    var nodeIds = (c.node_ids && c.node_ids.length ? c.node_ids : (c.taxonomy || []).map(function (t) { return t.node_id; })).slice();
    var taxIds = nodeIds.slice();
    (c.taxonomy || []).forEach(function (t) { if (taxIds.indexOf(t.node_id) < 0) taxIds.push(t.node_id); });
    if (signoff && signoff.environment_id && !envName[signoff.environment_id]) unresolved.environments++;
    var labTests = Object.keys(testing.latest_by_environment || {}).map(function (envId) {
      var s = testing.latest_by_environment[envId] || {};
      return { env: envName[envId] || String(envId), result: s.result || '', at: s.at || '', by: actorName_(s.actor) };
    }).sort(function (a, b) { return a.at < b.at ? 1 : a.at > b.at ? -1 : 0; });
    library.push({
      id: c.id,
      name: cleanText(c.name), summary: cleanText(c.summary), description: cleanText(c.description),
      objectives: textList_(c.objectives), evaluation_metrics: textList_(c.evaluation_metrics),
      expected_outcome: cleanText(c.expected_outcome), how_to: cleanText(c.how_to),
      notes: (c.notes || []).map(function (n) { return cleanText(n && typeof n === 'object' ? n.body : n); }),
      lifecycle: c.lifecycle || '', published: c.published !== false, visibility: c.visibility || '',
      tested: !!testing.tested,
      test_result: signoff ? (signoff.result || '') : '',
      test_environment: signoff ? (envName[signoff.environment_id] || signoff.environment_id || '') : '',
      test_at: signoff ? (signoff.at || '') : '',
      test_by: signoff ? actorName_(signoff.actor) : '',
      lab_tests: labTests,
      domain: namesOfType('Domain'), use_case: namesOfType('Use Case'), scenario: namesOfType('Scenario'),
      node_ids: nodeIds, tax_ids: taxIds,
      docs: (c.docs || []).map(function (d) {
        return { label: cleanText(d.label || d.url || ''), url: safeUrl(d.url), audience: d.audience || '', summary: cleanText(d.summary) };
      }),
      prerequisites: (c.prereq_ids || []).map(function (p) {
        if (prereqById[p]) return prereqById[p];
        unresolved.prerequisites++;
        return { id: String(p), name: String(p), description: '' };
      }),
      value_drivers: (c.value_drivers || []).map(function (v) {
        var vid = v && typeof v === 'object' ? (v.value_driver_id || v.id) : v;
        var note = v && typeof v === 'object' ? cleanText(v.note || v.narrative || '') : '';
        if (!vdName[vid]) unresolved.value_drivers++;
        return (vdName[vid] || String(vid || '')) + (note ? ' — ' + note : '');
      }),
      competitors_lib: (c.competitors || []).map(function (x) {
        if (!compName[x.competitor_id]) unresolved.competitors++;
        return { name: compName[x.competitor_id] || String(x.competitor_id), stance: x.stance || 'unknown', note: cleanText(x.note) };
      }),
      industries: (c.industry_ids || []).map(function (i) { if (!indName[i]) unresolved.industries++; return indName[i] || String(i); }),
      version: Number(c.version) || 0, updated_at: c.updated_at || '',
      url: origin ? origin + '/library?case=' + encodeURIComponent(c.id) : '',
      name_pt: pt ? cleanText(pt.name) : '', summary_pt: pt ? cleanText(pt.summary) : '', description_pt: pt ? cleanText(pt.description) : '',
      objectives_pt: pt ? textList_(pt.objectives) : [], evaluation_metrics_pt: pt ? textList_(pt.evaluation_metrics) : [],
      expected_outcome_pt: pt ? cleanText(pt.expected_outcome) : '', how_to_pt: pt ? cleanText(pt.how_to) : '', notes_pt: pt ? textList_(pt.notes) : [],
      traducao_versao: pt ? (Number(pt.source_version) || 0) : 0,
      traducao_pendente: isPending,
      removido_em: '',
    });
  });
  library.sort(function (a, b) { var x = foldText(a.name_pt || a.name), y = foldText(b.name_pt || b.name); return x < y ? -1 : x > y ? 1 : (a.id < b.id ? -1 : 1); });

  var ambientes = (bundle.environments || []).map(function (e) {
    return { env_id: e.id, name: cleanText(e.name), name_pt: cleanText(e.name_pt || e.name), description_pt: cleanText(e.description_pt || e.description || ''), ativo: e.active !== false };
  });
  ambientes.sort(function (a, b) { var x = foldText(a.name_pt), y = foldText(b.name_pt); return x < y ? -1 : x > y ? 1 : 0; });

  var config = {
    library_export_date: meta.exported_at || '',
    library_total: String(library.length),
    translation_date: meta.translation ? (meta.translation.translated_at || '') : '',
    library_origin: origin,
    library_is_demo: meta.demo ? 'true' : 'false',
    app_version: APP_VERSION,
  };
  return { library: library, taxonomia: taxonomia, ambientes: ambientes, config: config, pending: pending, excluded: excluded, unresolved: unresolved };
}

var PT_FIELDS_ = ['name_pt', 'summary_pt', 'description_pt', 'objectives_pt', 'evaluation_metrics_pt', 'expected_outcome_pt', 'how_to_pt', 'notes_pt'];

/**
 * Preserva a tradução já importada quando o bundle novo não traz bloco `pt` para um caso cuja
 * versão não mudou (mesma regra do translate_merge --previous). Vale também para nomes PT da
 * taxonomia e dos ambientes. Muda `rows` no lugar; retorna {carried, lost} (quantidades).
 */
function carryOverTranslations(rows, current) {
  var cur = {};
  ((current && current.library) || []).forEach(function (r) { cur[r.id] = r; });
  var carried = 0, lost = 0;
  rows.library.forEach(function (r) {
    var old = cur[r.id];
    if (!r.traducao_pendente || !old || old.traducao_pendente) return;
    if (Number(old.traducao_versao) === Number(r.version) && !r.name_pt) {
      PT_FIELDS_.forEach(function (f) { r[f] = old[f]; });
      r.traducao_versao = old.traducao_versao;
      r.traducao_pendente = false;
      rows.pending--;
      carried++;
    } else {
      lost++;
    }
  });
  var curTax = {};
  ((current && current.taxonomia) || []).forEach(function (n) { curTax[n.node_id] = n; });
  rows.taxonomia.forEach(function (n) {
    var old = curTax[n.node_id];
    if (old && n.name_pt === n.name && old.name_pt && old.name === n.name) {
      n.name_pt = old.name_pt;
      if (!n.description_pt && old.description_pt) n.description_pt = old.description_pt;
    }
  });
  // caminhos PT dependem dos nomes: recalcula
  var byId = {};
  rows.taxonomia.forEach(function (n) { byId[n.node_id] = n; });
  rows.taxonomia.forEach(function (n) {
    var chain = [], seen = {}, x = n;
    while (x && !seen[x.node_id]) { seen[x.node_id] = true; chain.unshift(x.name_pt); x = x.parent_id ? byId[x.parent_id] : null; }
    n.path_pt = chain.join(' › ');
  });
  var curEnv = {};
  ((current && current.ambientes) || []).forEach(function (e) { curEnv[e.env_id] = e; });
  rows.ambientes.forEach(function (e) {
    var old = curEnv[e.env_id];
    if (old && e.name_pt === e.name && old.name === e.name && old.name_pt) { e.name_pt = old.name_pt; if (!e.description_pt) e.description_pt = old.description_pt; }
  });
  return { carried: carried, lost: lost };
}

/**
 * Lápides: casos referenciados por alguma execução que sumiram do bundle continuam na Library com
 * `removido_em` (e escondidos do planejador), para que o painel e o relatório tenham o texto que foi
 * avaliado. Muda `rows.library` no lugar; retorna a quantidade de lápides.
 */
function addTombstones(rows, current, nowIso) {
  var inNew = {};
  rows.library.forEach(function (r) { inNew[r.id] = true; });
  var cur = {};
  ((current && current.library) || []).forEach(function (r) { cur[r.id] = r; });
  var needed = {};
  ((current && current.execucoes) || []).forEach(function (e) { if (!inNew[e.test_case_id] && cur[e.test_case_id]) needed[e.test_case_id] = true; });
  var n = 0;
  Object.keys(needed).sort().forEach(function (id) {
    var r = JSON.parse(JSON.stringify(cur[id]));
    if (!r.removido_em) r.removido_em = nowIso;
    rows.library.push(r);
    n++;
  });
  return n;
}

/**
 * Marca `orfao` nas execuções: órfã = o caso não veio no bundle (lápide não conta).
 * `bundleIds` = {id: true} dos casos do bundle; `keepMissing` (import parcial) não cria órfãos novos.
 * Retorna só as linhas que mudaram. Casos próprios (custom:) nunca ficam órfãos.
 */
function markOrphans(execucoes, bundleIds, keepMissing) {
  var changed = [];
  (execucoes || []).forEach(function (e) {
    if (String(e.test_case_id).indexOf('custom:') === 0) return;
    var missing = !bundleIds[e.test_case_id];
    var orfao = missing ? (keepMissing ? !!e.orfao : true) : false;
    if (!!e.orfao !== orfao) { e.orfao = orfao; changed.push(e); }
  });
  return changed;
}

/**
 * Dry-run: compara as linhas novas com o estado atual. `current` = {library, execucoes, povs}.
 * Retorna contagens e listas curtas (nomes) para a tela de administração.
 */
function dryRunImport(rows, current, validation, translationInfo, keepMissing) {
  var curById = {};
  ((current && current.library) || []).forEach(function (r) { if (!r.removido_em) curById[r.id] = r; });
  var newById = {};
  rows.library.forEach(function (r) { if (!r.removido_em) newById[r.id] = r; });
  var novos = [], alterados = [], removidos = [];
  rows.library.forEach(function (r) {
    if (r.removido_em) return;
    var cur = curById[r.id];
    if (!cur) novos.push(r.name_pt || r.name);
    else if (String(cur.version) !== String(r.version) || (cur.updated_at || '') !== (r.updated_at || '')) alterados.push(r.name_pt || r.name);
  });
  Object.keys(curById).forEach(function (id) { if (!newById[id]) removidos.push(curById[id].name_pt || curById[id].name); });
  var povStatus = {};
  ((current && current.povs) || []).forEach(function (p) { povStatus[p.pov_id] = p.status; });
  var execs = ((current && current.execucoes) || []).filter(function (e) { return e.ativo && String(e.test_case_id).indexOf('custom:') !== 0; });
  var orfas = [], orfasAtivas = 0, reabilitadas = 0, casoAlterado = [], cicloAlterado = [];
  execs.forEach(function (e) {
    var n = newById[e.test_case_id];
    if (!n) {
      if (!e.orfao && !keepMissing) {
        orfas.push(e.caso_nome || e.test_case_id);
        if (povStatus[e.pov_id] === 'running' || povStatus[e.pov_id] === 'done') orfasAtivas++;
      }
      return;
    }
    if (e.orfao) reabilitadas++;
    if (String(n.version) !== String(e.versao_caso)) casoAlterado.push(e.caso_nome || n.name_pt || n.name);
    if (n.lifecycle === 'deprecated' || n.lifecycle === 'draft') cicloAlterado.push((e.caso_nome || n.name_pt || n.name) + ' (' + lifecycleLabel(n.lifecycle) + ')');
  });
  var unresolvedTotal = Object.keys(rows.unresolved || {}).reduce(function (s, k) { return s + rows.unresolved[k]; }, 0);
  return {
    total_novo: Object.keys(newById).length,
    total_atual: Object.keys(curById).length,
    novos: novos, alterados: alterados, removidos: removidos,
    excluidos: rows.excluded || [],
    execucoes_orfas: orfas,
    execucoes_orfas_em_pov_ativa: orfasAtivas,
    execucoes_reabilitadas: reabilitadas,
    execucoes_caso_alterado: casoAlterado,
    execucoes_ciclo_alterado: cicloAlterado,
    referencias_nao_resolvidas: unresolvedTotal,
    referencias_detalhe: rows.unresolved || {},
    traducao_pendente: rows.pending,
    traducoes_preservadas: translationInfo ? translationInfo.carried : 0,
    traducoes_perdidas: translationInfo ? translationInfo.lost : 0,
    parcial: !!(validation && validation.partial),
    avisos: (validation && validation.warnings) || [],
    library_export_date: rows.config.library_export_date,
    is_demo: rows.config.library_is_demo === 'true',
  };
}

/**
 * Pipeline puro completo: valida, converte, preserva traduções, cria lápides, calcula órfãos e o dry-run.
 * current = {library, taxonomia, ambientes, execucoes, povs}. Não muda `current`.
 */
function planImport(bundle, current, opts, nowIso) {
  opts = opts || {};
  // o dry-run nunca recusa um export parcial: mostra o que a importação parcial (autorizada) faria
  var v = validateBundle(bundle, opts.dryRun ? { allowPartial: true } : opts);
  if (!v.ok) throw new Error('Arquivo inválido: ' + v.errors.join(' '));
  var keepMissing = v.partial && (!!opts.allowPartial || !!opts.dryRun);
  var rows = bundleToRows(bundle);
  if (keepMissing) {
    // export parcial autorizado: casos que só faltaram no download continuam como estavam (sem lápide)
    var got = {};
    rows.library.forEach(function (r) { got[r.id] = true; });
    ((current && current.library) || []).forEach(function (r) { if (!got[r.id]) rows.library.push(JSON.parse(JSON.stringify(r))); });
    rows.config.library_total = String(rows.library.filter(function (r) { return !r.removido_em; }).length);
  }
  var tr = carryOverTranslations(rows, current);
  var bundleIds = {};
  rows.library.forEach(function (r) { if (!r.removido_em) bundleIds[r.id] = true; });
  var dry = dryRunImport(rows, current, v, tr, keepMissing);
  addTombstones(rows, current, nowIso);
  var execCopy = JSON.parse(JSON.stringify((current && current.execucoes) || []));
  var orphanChanges = markOrphans(execCopy, bundleIds, keepMissing);
  return { rows: rows, dry: dry, orphanChanges: orphanChanges, validation: v };
}

// ============================================================ Apps Script (não roda em Node)

/** Lê e parseia um JSON do Drive a partir de um id ou URL de arquivo. */
function readBundleFromDrive_(fileIdOrUrl) {
  var m = String(fileIdOrUrl || '').match(/[-\w]{25,}/);
  if (!m) throw new Error('Informe o id ou a URL de um arquivo do Drive.');
  var file;
  try { file = DriveApp.getFileById(m[0]); } catch (e) { throw new Error('Não consegui abrir o arquivo no Drive (id ' + m[0] + '). Confira o link e se a conta que publicou o app tem acesso a ele.'); }
  var text = file.getBlob().getDataAsString('UTF-8');
  try { return JSON.parse(text.replace(/^﻿/, '')); } catch (e) { throw new Error('O arquivo "' + file.getName() + '" não é um JSON válido.'); }
}

function currentImportState_() {
  return { library: readTable_(SHEETS.LIBRARY), taxonomia: readTable_(SHEETS.TAXONOMIA), ambientes: readTable_(SHEETS.AMBIENTES),
    execucoes: readTable_(SHEETS.EXECUCOES), povs: readTable_(SHEETS.POVS) };
}

/** Dry-run para a administração: valida e compara, sem gravar. */
function importDryRun_(fileIdOrUrl, opts) {
  var bundle = readBundleFromDrive_(fileIdOrUrl);
  return planImport(bundle, currentImportState_(), Object.assign({}, opts || {}, { dryRun: true }), nowIso_()).dry;
}

/**
 * Importação efetiva, tudo ou nada, sob lock. Todas as células são serializadas (e o limite por
 * célula conferido) ANTES de a primeira aba ser limpa. Retorna o dry-run aplicado.
 */
function importBundle_(bundle, opts) {
  opts = opts || {};
  return withLock_(function () {
    var current = currentImportState_();
    if (opts.requireDemoOrEmpty && current.library.length && getConfig_('library_is_demo') !== 'true') {
      throw new Error('A planilha já tem a biblioteca real importada; a demonstração não pode sobrescrevê-la.');
    }
    var plan = planImport(bundle, current, opts, nowIso_());
    if (plan.dry.execucoes_orfas_em_pov_ativa > 0 && !opts.confirmOrphans) {
      throw new Error(plan.dry.execucoes_orfas_em_pov_ativa + ' execução(ões) de PoVs em execução ou concluídas ficariam órfãs. Revise o dry-run e confirme.');
    }
    var prepared = [
      [SHEETS.LIBRARY, prepareTable_(SHEETS.LIBRARY, plan.rows.library)],
      [SHEETS.TAXONOMIA, prepareTable_(SHEETS.TAXONOMIA, plan.rows.taxonomia)],
      [SHEETS.AMBIENTES, prepareTable_(SHEETS.AMBIENTES, plan.rows.ambientes)],
    ];
    setConfigMany_({ import_em_andamento: 'true' });
    prepared.forEach(function (p) { writePrepared_(p[0], p[1]); });
    updateRowsByKey_(SHEETS.EXECUCOES, plan.orphanChanges);
    var cfg = plan.rows.config;
    cfg.last_import_at = nowIso_();
    cfg.last_import_by = currentUserEmail_();
    cfg.last_import_obs = plan.validation.partial ? 'importação parcial autorizada' : '';
    cfg.import_em_andamento = 'false';
    setConfigMany_(cfg);
    invalidateCatalogCache_();
    return plan.dry;
  });
}

/**
 * Recebe o texto de um arquivo escolhido no computador, confere que é um bundle do coletor e o
 * guarda no Drive (PoV Runner/importacoes/). Devolve o id para o dry-run/importação normais.
 */
function uploadBundleText_(fileName, text) {
  var bundle;
  try { bundle = JSON.parse(String(text || '').replace(/^﻿/, '')); } catch (e) { throw new Error('O arquivo escolhido não é um JSON válido.'); }
  var v = validateBundle(bundle, { allowPartial: true });
  if (!v.ok) throw new Error('Arquivo inválido: ' + v.errors.join(' '));
  var folder = getSubfolder_(getRootFolder_(), 'importacoes');
  var name = String(fileName || 'pov-companion-library.json').replace(/[\\/]/g, '_');
  var file = folder.createFile(Utilities.newBlob(String(text), 'application/json', name));
  return { file_id: file.getId(), url: file.getUrl(), name: file.getName() };
}

/** Importa a biblioteca sintética de demonstração (só com a Library vazia ou já em modo demo). */
function importDemoBundle_() {
  // a checagem "biblioteca vazia ou já demo" é refeita dentro do lock (importBundle_), sem janela de corrida
  return importBundle_(JSON.parse(JSON.stringify(DEMO_BUNDLE)), { confirmOrphans: true, requireDemoOrEmpty: true });
}
