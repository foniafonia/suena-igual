/* Suena igual · cómo suena cada palabra (castellano de España, con yeísmo).
   No es una transcripción completa: da lo que el juego necesita (el primer sonido, el último,
   qué sonidos tiene y cuántas sílabas) a partir de la escritura, con las reglas de siempre:
   c/qu/k → /k/; ce, ci, z → /θ/; ge, gi, j → /x/; gue, gui → /g/; h no suena; b = v;
   ll = y (delante de vocal); r al principio o rr → erre fuerte; ch → /tʃ/.
   Se usa en el juego y en sus pruebas. Sin sintaxis nueva: iPad antiguos. */
(function (raiz) {
  var VOC = 'aeiouáéíóúü';
  function sinTilde(c) { return { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u' }[c] || c; }
  function fonemas(palabra) {
    var w = String(palabra).toLowerCase(), f = [], i = 0;
    function v(k) { return k < w.length && VOC.indexOf(w.charAt(k)) >= 0; }
    while (i < w.length) {
      var c = w.charAt(i), d = w.charAt(i + 1), e = w.charAt(i + 2);
      if (VOC.indexOf(c) >= 0) { f.push(sinTilde(c)); i++; continue; }
      if (c === 'c' && d === 'h') { f.push('ch'); i += 2; continue; }
      if (c === 'l' && d === 'l') { f.push('y'); i += 2; continue; }
      if (c === 'r' && d === 'r') { f.push('rr'); i += 2; continue; }
      if (c === 'q' && d === 'u') { f.push('k'); i += 2; continue; }
      if (c === 'g' && d === 'u' && 'eéií'.indexOf(e) >= 0) { f.push('g'); i += 2; continue; }
      if (c === 'g' && d === 'ü') { f.push('g'); i += 1; continue; }
      if (c === 'c') { f.push('eéií'.indexOf(d) >= 0 ? 'z' : 'k'); i++; continue; }
      if (c === 'g') { f.push('eéií'.indexOf(d) >= 0 ? 'j' : 'g'); i++; continue; }
      if (c === 'z') { f.push('z'); i++; continue; }
      if (c === 'k') { f.push('k'); i++; continue; }
      if (c === 'j') { f.push('j'); i++; continue; }
      if (c === 'h') { i++; continue; }
      if (c === 'v' || c === 'b') { f.push('b'); i++; continue; }
      if (c === 'w') { f.push('u'); i++; continue; }
      if (c === 'x') { if (i === 0) f.push('s'); else { f.push('k'); f.push('s'); } i++; continue; }
      if (c === 'y') { f.push(v(i + 1) ? 'y' : 'i'); i++; continue; }
      if (c === 'r') { f.push(i === 0 || 'nls'.indexOf(w.charAt(i - 1)) >= 0 ? 'rr' : 'r'); i++; continue; }
      if (c === 'ñ') { f.push('ñ'); i++; continue; }
      if ('bdfglmnpstz'.indexOf(c) >= 0) { f.push(c); i++; continue; }
      i++;
    }
    return f;
  }
  /* cómo se le dice a un niño qué sonido es */
  var NOMBRE = { k: 'K (ca, que, qui, co, cu)', z: 'Z (za, ce, ci, zo, zu)', j: 'J (ja, ge, gi, jo, ju)', g: 'G (ga, gue, gui, go, gu)', b: 'B (b y v suenan igual)',
    y: 'Y (y, ll)', rr: 'R fuerte', r: 'R suave', ch: 'CH', 'ñ': 'Ñ' };
  function nombre(f) { return NOMBRE[f] || f.toUpperCase(); }
  function corto(f) { return { k: 'K', z: 'Z', j: 'J', g: 'G', b: 'B', y: 'Y', rr: 'RR', r: 'R', ch: 'CH', 'ñ': 'Ñ' }[f] || f.toUpperCase(); }
  /* para los pares mínimos, la erre suave y la fuerte cuentan como «R» */
  function rasgo(f) { return f === 'rr' ? 'r' : f; }
  /* 13/11/2026 · sílabas escritas (modo «la misma sílaba»). Reglas de siempre: ch, ll, rr y qu/gu+e,i cuentan como una consonante;
     pr, br, tr, dr, cr, gr, fr, pl, bl, cl, gl, fl, kl no se separan; vocal fuerte + fuerte o débil con tilde = hiato. */
  var FUERTE = 'aeoáéíóú', DEBIL = 'iuü';
  var GRUPO = ['pr', 'br', 'tr', 'dr', 'cr', 'gr', 'fr', 'pl', 'bl', 'cl', 'gl', 'fl', 'kl', 'kr'];
  function trozos(w) {   /* [{t:texto, v:true|false}] con los dígrafos juntos */
    var out = [], i = 0;
    while (i < w.length) {
      var c = w.charAt(i), d = w.charAt(i + 1), e = w.charAt(i + 2);
      if ((c === 'c' && d === 'h') || (c === 'l' && d === 'l') || (c === 'r' && d === 'r')) { out.push({ t: c + d, v: false }); i += 2; continue; }
      if ((c === 'q' || c === 'g') && d === 'u' && 'eéií'.indexOf(e) >= 0) { out.push({ t: c + d, v: false }); i += 2; continue; }
      if (c === 'y' && !(i + 1 < w.length && VOC.indexOf(d) >= 0)) { out.push({ t: c, v: true }); i++; continue; }
      out.push({ t: c, v: VOC.indexOf(c) >= 0 }); i++;
    }
    return out;
  }
  function hiato(a, b) { var x = a === 'y' ? 'i' : a, y = b === 'y' ? 'i' : b; return (FUERTE.indexOf(x) >= 0 && FUERTE.indexOf(y) >= 0) || 'íú'.indexOf(x) >= 0 || 'íú'.indexOf(y) >= 0 || (x === y); }
  function silabas(palabra) {
    var w = String(palabra).toLowerCase(), t = trozos(w), nuc = [], i = 0;
    /* núcleos: vocales seguidas que no hacen hiato */
    while (i < t.length) {
      if (!t[i].v) { i++; continue; }
      var ini = i; i++;
      while (i < t.length && t[i].v && !hiato(t[i - 1].t, t[i].t)) i++;
      nuc.push([ini, i - 1]);
    }
    if (!nuc.length) return [w];
    var cortes = [];
    for (var k = 0; k < nuc.length - 1; k++) {
      var a = nuc[k][1] + 1, b = nuc[k + 1][0], n = b - a;   /* consonantes entre dos núcleos: t[a..b-1] */
      var par = n >= 2 ? t[b - 2].t + t[b - 1].t : '';
      var corte = n <= 1 ? a : (GRUPO.indexOf(par) >= 0 ? b - 2 : b - 1);
      cortes.push(corte);
    }
    var res = [], desde = 0;
    cortes.forEach(function (c) { res.push(t.slice(desde, c).map(function (x) { return x.t; }).join('')); desde = c; });
    res.push(t.slice(desde).map(function (x) { return x.t; }).join(''));
    return res;
  }
  /* clave de sonido de una sílaba (casa y kilo no comparten sílaba; coche y koala sí: «ko»). La r suelta que no va
     al principio de palabra ni tras n, l, s es suave. */
  function sonSilaba(sil, alPrincipio, antes) {
    var f = fonemas(sil);
    if (!alPrincipio && f[0] === 'rr' && sil.charAt(0) === 'r' && sil.charAt(1) !== 'r' && 'nls'.indexOf(antes || '') < 0) f[0] = 'r';
    return f.join('');
  }
  function silabaIni(w) { var s = silabas(w); return { son: sonSilaba(s[0], true), esc: s[0] }; }
  function silabaFin(w) { var s = silabas(w), u = s[s.length - 1], previa = s.length > 1 ? s[s.length - 2] : ''; return { son: sonSilaba(u, s.length === 1, previa.charAt(previa.length - 1)), esc: u }; }
  raiz.Fonetica = { silabas: silabas, silabaIni: silabaIni, silabaFin: silabaFin, fonemas: fonemas, primero: function (w) { return fonemas(w)[0]; }, ultimo: function (w) { var f = fonemas(w); return f[f.length - 1]; },
    tiene: function (w, s) { return fonemas(w).map(rasgo).indexOf(s) >= 0; }, nombre: nombre, corto: corto, rasgo: rasgo };
})(typeof window !== 'undefined' ? window : globalThis);
