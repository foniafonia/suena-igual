/* Vuelca las barajas de imprimir (todas las reglas, pronunciaciones) a herramientas/mazos.json, con el mismo código
   del juego (juego.js + imprimir.html), para que generar.py dibuje los PDF con exactamente las mismas cartas.
   Uso: node herramientas/mazos.js     (necesita jsdom: ver JSDOM abajo; es una herramienta de desarrollo) */
var fs = require('fs'), path = require('path');
var JSDOM = require(process.env.JSDOM || path.join(process.env.HOME, 'Developer/ACADEMIA-MEMBRESIA-LOGOPED-IA-visual/node_modules/jsdom')).JSDOM;
var dir = path.join(__dirname, '..');
var html = fs.readFileSync(path.join(dir, 'imprimir.html'), 'utf8').replace(/<script src="([^"?]+)\?v=\d+"><\/script>/g, function (m, f) { return '<script>' + fs.readFileSync(path.join(dir, f), 'utf8') + '</script>'; });
var d = new JSDOM(html, { runScripts: 'dangerously', url: 'https://foniafonia.github.io/suena-igual/imprimir.html?yo=1' });
var w = d.window, doc = w.document, $ = function (s) { return doc.querySelector(s); };
var VARIANTES = [['inicio'], ['final'], ['silabas'], ['par', 'rl'], ['par', 'bp'], ['par', 'td'], ['par', 'kg'], ['par', 'sz'], ['par', 'fz']], out = [];
['es', 'seseo'].forEach(function (pron) {
  VARIANTES.forEach(function (v) {
    if (pron === 'seseo' && v[1] === 'sz') return;
    $('#oRegla').value = v[0]; $('#oPron').value = pron; if (v[1]) $('#oPar').value = v[1]; $('#oTinta').value = 'color'; $('#oPista').checked = false;
    w.__imprimir.pinta();
    var B = w.__imprimir.baraja(), bloques = [];
    [].forEach.call(doc.querySelectorAll('.reglas .cols > div'), function (div) {
      var b = { titulo: div.querySelector('h3').textContent, parrafos: [], items: null, ord: false, palos: null };
      [].forEach.call(div.children, function (c) {
        if (c.tagName === 'P') b.parrafos.push(c.textContent);
        else if (c.tagName === 'UL' || c.tagName === 'OL') { b.ord = c.tagName === 'OL'; b.items = [].map.call(c.children, function (li) { return li.textContent; }); }
        else if (c.className === 'palos') b.palos = [].map.call(c.children, function (s) { return s.textContent; });
      });
      bloques.push(b);
    });
    out.push({ id: v[0] + (v[1] ? '-' + v[1] : '') + '-' + pron, regla: v[0], par: v[1] || null, pron: pron,
      titulo: $('.reglas .firma span:last-child').textContent, cartas: B.todas, palabras: B.palabras, blancas: B.blancas, bloques: bloques });
  });
});
fs.writeFileSync(path.join(__dirname, 'mazos.json'), JSON.stringify(out));
console.log(out.length + ' barajas →', 'herramientas/mazos.json');
