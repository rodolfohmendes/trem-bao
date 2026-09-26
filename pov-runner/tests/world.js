/**
 * world.js — estado de teste montado a partir da biblioteca sintética (DemoBundle.js): importação,
 * índice de casos, ids conhecidos e atalhos para PoV/execução. Cada chamada devolve cópias novas.
 */
const { loadSrc, clone, seqIds } = require('./harness');

const S = loadSrc();
const NOW = '2026-09-26T12:00:00.000Z';
const LATER = '2026-09-27T09:30:00.000Z';

// casos do bundle sintético (ids determinísticos gerados por tools/make_demo_bundle.js)
const ID = {
  WILDFIRE: 'a58c571c-6068-51f8-9235-e7bf451ba89d', // objetivo com link público de docs
  ZTNA: '5106ea9d-2c51-5820-afa3-5fd29b014570', // how_to com link de intranet
  APPID_BLOCK: 'd0cb3991-c7f6-57bd-a333-b703e93a8659', // aspas duplicadas no EN; 2 ambientes de lab
  APPID_PORTS: '324b6d9d-c8d9-5689-a42f-ad87b04b0109', // tradução desatualizada
  XDR_ISOLATE: '13157127-8f2e-5a98-9e83-573b2eb8f1fc', // sem bloco pt
  SDWAN: '2ce24d7c-cfdb-53d8-bd40-a51d0d663f33', // lab: fail (mais recente) + pass
  AI_ACCESS: 'c1524c64-6cf7-5861-86d5-de97dd6493e1', // descrição "-", resultado esperado ""
  ALERT_GROUPING: '8c23af92-1939-5803-8085-c3d0003b548b', // descontinuado, nós aposentados, value drivers como id
  XSIAM_INGEST: '274ab424-219e-5a2a-8a77-6615fe7f95de', // nós aposentados, value driver {id, narrative}
  CSPM: '6537ce05-a73d-5c0a-938f-9c7402e5418b', // objetivo-título "Test steps:"
  CIEM: '33d47561-bbbe-59c0-b0b1-01469f56335d', // objetivo "-"
  PLAYBOOK: '6b8350a3-f9a3-5ea4-8428-745226ff11b5', // resultado esperado começando com "- "
  URL_FILTER: 'db600f83-95e6-58d0-9dbb-2acda993a967', // aspas duplicadas na descrição EN
  IAC: '5364a800-dd8c-59fc-9b65-3f1d1a340225', // subdomínio
  ZONE: '67dbcd4b-9508-53fa-9414-12202d0a7b0d', // ator "Unknown"
  DNS: '30094008-85fb-5c67-a321-65f8f6b473f1',
  SSL: '8b6eaa5b-6bf0-531c-983c-b6f4099787af',
  UNPUBLISHED: 'bad1e6ac-6be4-5679-974a-a22a0cb63032',
  PRIVATE: '335dbac5-1109-5e16-94a9-cd4de215c03c',
};
const NODE = {
  NGFW: 'f3d50a25-e896-5d5c-a0ec-7a6b8ba287c6',
  SIA: 'f32215b1-1cae-5d0f-a71b-24e82fba887c', // use case Securing Internet Access
  URLF: '588276ef-03f0-549a-8097-8698dfcaf90c', // cenário URL Filtering
  APPCTRL: '00731697-9610-5d4c-b1e0-495924c6157a',
  DCSEG: '69440cf3-38b7-5237-b4b0-5fc18972f303',
  SASE: 'ac1f23ca-54e0-5f78-b18d-74ef413d2713',
  SRA: 'b7c11b34-d42e-5de3-8e87-169c3254628d',
  ZTNA_SCN: 'a7a8ca79-3fd1-5e91-b85d-a021e73c1b3a',
  CLOUD: '1aa959eb-12b8-5e6e-9bbb-06c0d6566f1c',
  APPSEC: '4d19e319-eb1c-54f4-9a7a-027e4d59cf94', // subdomínio
  C2C: '7c360b69-cd3f-5958-a316-7238a754fbe1', // use case sob o subdomínio
  SECOPS: 'dbeb9348-8c18-538d-8080-54fc337f08f1',
  IRA: '8bdb7daa-c744-5112-aa22-37ef28624529',
  XSIAM_RET: '49bc07ea-a6a8-56f3-b4ad-d003ae7e62d3',
  SOC_RET: '843f0898-a241-58e6-827d-5284afb07555',
};

function emptyState() {
  return { library: [], taxonomia: [], ambientes: [], execucoes: [], povs: [] };
}

/** Biblioteca importada (sem estado anterior). */
function imported(bundle) {
  const plan = S.planImport(clone(bundle || S.DEMO_BUNDLE), emptyState(), {}, NOW);
  return plan.rows;
}

/** Mundo pronto: biblioteca, taxonomia, índice de casos, uma PoV e helpers. */
function world() {
  const rows = imported();
  const newId = seqIds('id');
  const refs = { autor: 'sc@example.com', nowIso: NOW, newId };
  const pov = S.createPovRow({ cliente: 'Banco Exemplo', titulo: 'PoV NGFW', equipe: 'ana@example.com' }, refs).row;
  const idx = S.caseIndex(rows.library, [], rows.taxonomia);
  function lib(id) { return rows.library.find((r) => r.id === id); }
  function plan(ids, extra) {
    return S.addCasesToPlan([], pov, ids, idx, rows.taxonomia, Object.assign({}, refs, extra || {}));
  }
  function ctx(extra) {
    return Object.assign({ pov, caseRow: null, autor: 'sc@example.com', nowIso: LATER, pendencias: [], critIds: {}, newId }, extra || {});
  }
  return { S, rows, lib, idx, pov, refs, newId, plan, ctx, tax: rows.taxonomia };
}

module.exports = { S, clone, seqIds, NOW, LATER, ID, NODE, emptyState, imported, world };
