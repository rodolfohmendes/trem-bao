/**
 * gas_template.js — avaliador mínimo de scriptlets do HtmlService (<? ?>, <?= ?>, <?!= ?>) para
 * testar o onepager.html fora do Apps Script (Node e página de desenvolvimento).
 * <?= expr ?> escapa HTML (como o Apps Script); <?!= expr ?> imprime cru; <? código ?> executa.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GasTemplate = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function compile(src) {
    var code = 'var __out=[];\n';
    var re = /<\?(!?=?)([\s\S]*?)\?>/g;
    var last = 0, m;
    while ((m = re.exec(src))) {
      code += '__out.push(' + JSON.stringify(src.slice(last, m.index)) + ');\n';
      var kind = m[1], body = m[2];
      if (kind === '=') code += '__out.push(__esc(' + body + '));\n';
      else if (kind === '!=') code += '__out.push(String(' + body + '));\n';
      else code += body + '\n';
      last = m.index + m[0].length;
    }
    code += '__out.push(' + JSON.stringify(src.slice(last)) + ');\nreturn __out.join("");';
    // eslint-disable-next-line no-new-func
    var fn = new Function('model', '__esc', code);
    return function (model) { return fn(model, escapeHtml); };
  }
  return { compile: compile, escapeHtml: escapeHtml };
});
