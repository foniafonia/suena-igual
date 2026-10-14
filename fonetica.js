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
  raiz.Fonetica = { fonemas: fonemas, primero: function (w) { return fonemas(w)[0]; }, ultimo: function (w) { var f = fonemas(w); return f[f.length - 1]; },
    tiene: function (w, s) { return fonemas(w).map(rasgo).indexOf(s) >= 0; }, nombre: nombre, corto: corto, rasgo: rasgo };
})(typeof window !== 'undefined' ? window : globalThis);
