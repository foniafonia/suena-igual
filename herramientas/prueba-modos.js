/* node herramientas/prueba-modos.js — modos nuevos de Suena igual (13/11/2026). Carga la página en jsdom, sin servidor. */
var fs = require('fs'), path = require('path'), fallos = 0, RAIZ = path.join(__dirname, '..');
function ok(n, c, x) { if (!c) fallos++; console.log((c ? 'ok     ' : 'FALLO  ') + n + (x !== undefined ? '  ' + x : '')); }
var J = require('/Users/joseaserraf/Developer/ACADEMIA-MEMBRESIA-LOGOPED-IA-visual/node_modules/jsdom');
var h = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').replace(/<script src="([^"?]*)(\?[^"]*)?"><\/script>/g, function (m, u) { try { return '<script>' + fs.readFileSync(path.join(RAIZ, u), 'utf8') + '<\/script>'; } catch (e) { return ''; } });
function abre(q) { var errs = [], vc = new J.VirtualConsole(); vc.on('jsdomError', function (e) { errs.push(e.message); });
  var d = new J.JSDOM(h, { url: 'https://foniafonia.github.io/suena-igual/' + q, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, beforeParse: function (w) { w.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); }; w.fetch = function () { return Promise.resolve({ ok: true, json: function () { return Promise.resolve({}); } }); }; } });
  d.errs = errs; return d; }
var EXTRA = null;
module.exports = { abre: abre, ok: ok };
if (require.main === module) {
  /* sílaba del principio con M */
  var d = abre('?regla=silini&foco=m'), S = d.window.__suena, gs = S.grupos();
  ok('silini + M: cuatro sílabas, todas de M', gs.length === 4 && gs.every(function (g) { return /^m[aeiou]$/.test(g[0]); }), gs.map(function (g) { return g[0] + ':' + g[1].length; }).join(' '));
  var b = S.nuevaBaraja(), pal = b.cartas.filter(function (c) { return c.tipo === 'palabra'; }), F = d.window.Fonetica;
  ok('…cada carta empieza de verdad por su sílaba', pal.every(function (c) { return F.silabaIni(c.w).son === c.son; }), pal.slice(0, 6).map(function (c) { return c.w + '=' + c.son; }).join(' '));
  ok('…y todas tienen voz Piper', pal.every(function (c) { return d.window.VOZ_SNAKE[c.w] && fs.existsSync(path.join(RAIZ, 'voz', d.window.VOZ_SNAKE[c.w] + '.mp3')); }), pal.filter(function (c) { return !d.window.VOZ_SNAKE[c.w]; }).map(function (c) { return c.w; }).join(' '));
  ok('regla en pantalla', /misma SÍLABA al PRINCIPIO/.test(S.reglaTexto()));
  ['p', 's', 't', 'l', 'd', 'n'].forEach(function (c) { var g = abre('?regla=silini&foco=' + c).window.__suena.grupos(); ok('silini + ' + c.toUpperCase() + ': cuatro sílabas con 5 palabras o más', g.length === 4 && g.every(function (x) { return x[0].charAt(0) === c && x[1].length >= 5; }), g.map(function (x) { return x[0] + ':' + x[1].length; }).join(' ')); });
  /* sílaba del final, sin foco */
  var e = abre('?regla=silfin'), SE = e.window.__suena, ge = SE.grupos(), FE = e.window.Fonetica, be = SE.nuevaBaraja().cartas.filter(function (c) { return c.tipo === 'palabra'; });
  ok('silfin: cuatro sílabas fáciles', ge.length === 4 && ge.every(function (g) { return /^[mpstldn][aeiou]$/.test(g[0]); }), ge.map(function (g) { return g[0] + ':' + g[1].length; }).join(' '));
  ok('…cada carta acaba de verdad en su sílaba', be.every(function (c) { return FE.silabaFin(c.w).son === c.son; }));
  /* el resto no cambia: inicio solo con el banco de siempre */
  var f = abre('?regla=inicio'), SF = f.window.__suena, extra = {}; (f.window.BANCO_SILABAS || []).forEach(function (p) { extra[p[0]] = 1; });
  var usa = SF.nuevaBaraja().cartas.filter(function (c) { return c.tipo === 'palabra' && extra[c.w]; });
  ok('las reglas de antes no usan las palabras nuevas', usa.length === 0, usa.map(function (c) { return c.w; }).join(' '));
  /* familias de palabras */
  var g = abre('?regla=campo'), SG = g.window.__suena, gg = SG.grupos(), C = g.window.CAMPOS, bg = SG.nuevaBaraja().cartas.filter(function (c) { return c.tipo === 'palabra'; });
  ok('campo: comida, ropa, animales y cuerpo, con 5 palabras o más', gg.map(function (x) { return x[0]; }).join() === 'comida,ropa,animales,cuerpo' && gg.every(function (x) { return x[1].length >= 5; }), gg.map(function (x) { return x[0] + ':' + x[1].length; }).join(' '));
  ok('…cada carta es de su familia', bg.every(function (c) { return C[c.son].w.indexOf(c.w) >= 0; }));
  ok('…y todas tienen voz Piper', bg.every(function (c) { return g.window.VOZ_SNAKE[c.w] && fs.existsSync(path.join(RAIZ, 'voz', g.window.VOZ_SNAKE[c.w] + '.mp3')); }), bg.filter(function (c) { return !g.window.VOZ_SNAKE[c.w]; }).map(function (c) { return c.w; }).join(' '));
  var arr = bg[0], misma = bg.filter(function (c) { return c.son === arr.son && c.color !== arr.color; })[0], otra = bg.filter(function (c) { return c.son !== arr.son && c.color !== arr.color; })[0];
  var Gs = SG.estado(); if (!Gs) { SG.juega(); Gs = SG.estado(); } Gs.descarte.push(arr); Gs.color = arr.color;
  ok('vale la de la misma familia y no la de otra', SG.vale(misma) === true && SG.vale(otra) === false, arr.w + ' / ' + misma.w + ' / ' + otra.w);
  ok('regla en pantalla', /misma FAMILIA \(comida, ropa, animales, cuerpo\)/.test(SG.reglaTexto()), SG.reglaTexto());
  var h2 = abre('?regla=campo&campos=animales,cuerpo,casa,transporte').window.__suena.grupos();
  ok('campo con otras cuatro familias por el enlace', h2.map(function (x) { return x[0]; }).join() === 'animales,cuerpo,casa,transporte' && h2.every(function (x) { return x[1].length >= 5; }), h2.map(function (x) { return x[0] + ':' + x[1].length; }).join(' '));
  var se = abre('?regla=campo&pron=seseo').window.__suena.grupos();
  ok('con seseo no se quitan palabras con z (aquí no importa el sonido)', se.some(function (x) { return x[1].some(function (p) { return p[0] === 'zapato'; }); }));
  var malos = [].concat(d.errs, e.errs, f.errs, g.errs).filter(function (x) { return !/Not implemented|Could not load/.test(x); });
  ok('sin errores de página', !malos.length, malos.slice(0, 2).join(' ; '));
  console.log(fallos ? fallos + ' FALLOS' : 'Todo correcto'); process.exit(fallos ? 1 : 0);
}
