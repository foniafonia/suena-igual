/* Suena igual · lo que rodea al juego (Gabinete Fönia · ColmenIA)
   Portada, «Prepara la partida» con enlace para la familia, informe al acabar, tarjeta de la
   comunidad (portada, pausa, final y «antes de irte») y recuento anónimo, también por canal
   (?c=wa, tg, fb, ig, sk, ln) para saber de dónde llega la gente. Con ?yo=1 un aparato deja de
   contar. Aprendido del Snake de palabras. Sin sintaxis nueva: iPad antiguos. */
(function () {
  var S = window.__suena; if (!S) return;
  var O = S.OPC, QS; try { QS = new URLSearchParams(location.search); } catch (e) { QS = { get: function () { return null; } }; }
  function $(i) { return document.getElementById(i); }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined && x !== null) e.textContent = x; return e; }
  var SKOOL = 'https://www.skool.com/logopedia-7339/about';
  var CONTADOR = 'https://abacus.jasoncameron.dev/hit/foniafonia-juegos/';
  var FIJO = document.body.className.indexOf('fijado') >= 0;

  /* ---------- recuento ---------- */
  var MIO = false;
  try { if (QS.get('yo') === '1') localStorage.setItem('suena-no-contar', '1'); if (QS.get('yo') === '0') localStorage.removeItem('suena-no-contar'); MIO = localStorage.getItem('suena-no-contar') === '1'; } catch (e) { }
  function hoy() { var d = new Date(); return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); }
  function suma(k) { if (MIO) return; try { new Image().src = CONTADOR + k + '?t=' + Date.now().toString(36); } catch (e) { } }
  var CANAL = (function () { var c = (QS.get('c') || '').toLowerCase(); return /^(wa|tg|fb|ig|sk|ln)$/.test(c) ? c : ''; })();
  suma('suena_aperturas'); suma('suena_aperturas_' + hoy());
  if (CANAL) suma('suena_canal_' + CANAL);
  try {
    if (!MIO && !localStorage.getItem('suena-visto')) { localStorage.setItem('suena-visto', hoy()); suma('suena_personas'); suma('suena_personas_' + hoy()); if (CANAL) suma('suena_personas_canal_' + CANAL); }
  } catch (e) { }
  if (FIJO) suma('suena_aperturas_enlace_familia');

  /* ---------- tarjeta de la comunidad ---------- */
  function tarjeta(donde, titulo, sub) {
    var a = el('a', 'cta'); a.href = SKOOL; a.target = '_blank'; a.rel = 'noopener';
    a.appendChild(el('span', 'cta-abeja', '🐝'));
    var t = el('span', 'cta-txt'); t.appendChild(el('b', null, titulo)); t.appendChild(el('span', null, sub));
    var l = el('span', 'cta-lista'); ['🐍 Snake de palabras', '🏎️ FonoKart', '🃏 y los que van saliendo'].forEach(function (x) { l.appendChild(el('i', null, x)); }); t.appendChild(l);
    a.appendChild(t); a.appendChild(el('span', 'cta-ir', 'Entrar en la comunidad →'));
    a.addEventListener('click', function (ev) {
      if (!MIO) { suma('suena_skool_' + donde); suma('suena_skool_dia_' + hoy()); try { if (!localStorage.getItem('suena-fue-a-skool')) { localStorage.setItem('suena-fue-a-skool', '1'); suma('suena_skool_personas'); if (CANAL) suma('suena_skool_canal_' + CANAL); } } catch (e) { } }
      ev.preventDefault(); var w = null; try { w = window.open(SKOOL, '_blank'); if (w) w.opener = null; } catch (e) { w = null; }
      if (!w) setTimeout(function () { location.href = SKOOL; }, 350);
    });
    return a;
  }
  function firma(p) {
    p.appendChild(el('p', 'firma', 'Una pieza del laboratorio de Gabinete Fönia y ColmenIA'));
    var n = el('p', 'nota'); n.appendChild(document.createTextNode('Sin registro. Las partidas no salen de este aparato si no las compartes tú. Solo se cuenta, de forma anónima, cuánta gente lo usa. '));
    var a = el('a', null, 'Privacidad'); a.href = 'privacidad.html'; n.appendChild(a); p.appendChild(n);
  }

  /* ---------- portada ---------- */
  var portada = el('div', 'velo portada'); portada.id = 'vPortada';
  var tp = el('div', 'tarjeta'); portada.appendChild(tp);
  tp.appendChild(el('h1', null, '🃏 Suena igual'));
  tp.appendChild(el('p', 'lema', 'El juego de cartas de los sonidos: se echa carta si es del mismo color o si la palabra SUENA igual.'));
  var ej = el('div', 'cartas-ejemplo'); [['rojo', 'casa'], ['azul', 'queso'], ['verde', 'kilo']].forEach(function (x) { var c = el('div', 'carta ' + x[0]); c.appendChild(el('span', 'pal', x[1])); ej.appendChild(c); }); tp.appendChild(ej);
  tp.appendChild(el('p', 'mini', 'Casa, queso y kilo casan: empiezan por el mismo SONIDO aunque se escriban distinto.'));
  var bJ = el('button', 'btn ancho', '▶ Jugar contra la máquina'); bJ.type = 'button'; tp.appendChild(bJ);
  var bD = el('button', 'btn s ancho'); bD.type = 'button'; bD.appendChild(document.createTextNode('👥 Dos jugadores')); bD.appendChild(el('small', null, 'en el mismo aparato, pasándolo')); tp.appendChild(bD);
  var bP = el('button', 'btn s ancho'); bP.type = 'button'; bP.appendChild(document.createTextNode('🧑‍⚕️ Preparar una partida')); bP.appendChild(el('small', null, 'Elige el sonido o el par y manda el enlace a la familia')); tp.appendChild(bP);
  var ch = el('ul', 'trabaja'); ['Conciencia fonológica', 'Pares mínimos', 'Sonido inicial y final', 'Sílabas', 'Lectura'].forEach(function (x) { ch.appendChild(el('li', null, x)); }); tp.appendChild(ch);
  tp.appendChild(el('p', 'mini', 'De 6 años en adelante, para quien ya lee palabras · móvil, tableta u ordenador · 241 palabras con voz'));
  tp.appendChild(tarjeta('portada', 'Más juegos como este', 'En ColmenIA, la comunidad de logopedas y maestras que usan la IA en su trabajo.'));
  var idea = el('a', 'idea', '💡 ¿Echas algo en falta o has visto un fallo? Cuéntalo en la comunidad'); idea.href = SKOOL; idea.target = '_blank'; idea.rel = 'noopener'; idea.onclick = function () { suma('suena_skool_idea_portada'); }; tp.appendChild(idea);
  var imp = el('a', 'idea', '🖨️ Imprimir las cartas para jugar en la mesa'); imp.href = 'imprimir.html'; imp.onclick = function () { imp.href = 'imprimir.html' + enlaceParams(); suma('suena_imprimir'); }; tp.appendChild(imp);
  firma(tp);
  document.body.appendChild(portada);
  if (!FIJO) { $('vInicio').className = 'velo'; portada.className = 'velo portada on'; }
  bJ.onclick = function () { O.modo = 'maquina'; portada.className = 'velo portada'; S.muestraInicio(); };
  bD.onclick = function () { O.modo = 'dos'; portada.className = 'velo portada'; S.muestraInicio(); };
  bP.onclick = abrePrepara;

  /* ---------- prepara la partida ---------- */
  var prep = el('div', 'velo portada'); prep.id = 'vPrepara';
  var tq = el('div', 'tarjeta prep'); prep.appendChild(tq); document.body.appendChild(prep);
  var E = {};
  var OBJ = [
    ['ini-r', 'Erre al principio', 'rana, ratón, regalo…', { regla: 'inicio', foco: 'r' }],
    ['ini-s', 'Ese al principio', 'sol, sopa, silla…', { regla: 'inicio', foco: 's' }],
    ['ini-k', 'K al principio', 'casa, queso, kilo…', { regla: 'inicio', foco: 'k' }],
    ['rl', 'Par R / L', 'pera frente a pelo', { regla: 'par', par: 'rl' }],
    ['bp', 'Par B / P', 'bota frente a pato', { regla: 'par', par: 'bp' }],
    ['td', 'Par T / D', 'tos frente a dos', { regla: 'par', par: 'td' }],
    ['kg', 'Par K / G', 'casa frente a gato', { regla: 'par', par: 'kg' }],
    ['sz', 'Par S / Z (seseo)', 'casa frente a caza', { regla: 'par', par: 'sz' }],
    ['fin', 'Sonido del final', 'mesa, casa… / sol, papel…', { regla: 'final' }],
    ['sil', 'Número de sílabas', 'contar golpes de voz', { regla: 'silabas' }]
  ];
  function opt(sel, lista, val) { sel.innerHTML = ''; lista.forEach(function (o) { var x = el('option', null, o[1]); x.value = o[0]; sel.appendChild(x); }); sel.value = val; }
  function campo(lbl, id, lista) { var d = el('div', 'campo'), l = el('label', null, lbl); l.htmlFor = id; var s = el('select'); s.id = id; d.appendChild(l); d.appendChild(s); return [d, s, lista]; }
  function enlaceParams() {
    var p = ['regla=' + E.regla];
    if (E.regla === 'par') p.push('par=' + E.par); else if (E.foco && E.regla === 'inicio') p.push('foco=' + E.foco);
    if (E.modo === 'dos') p.push('modo=dos'); if (E.mano === 7) p.push('mano=7'); if (E.pista) p.push('pista=1');
    return '?' + p.join('&');
  }
  function abrePrepara() {
    E = { regla: O.regla, foco: O.foco, par: O.par, modo: O.modo, mano: O.mano, pista: O.pista };
    portada.className = 'velo portada'; $('vInicio').className = 'velo'; $('vFin').className = 'velo';
    pintaPrepara(); prep.className = 'velo portada on';
  }
  function pintaPrepara() {
    tq.innerHTML = '';
    tq.appendChild(el('h1', null, '🧑‍⚕️ Prepara la partida'));
    tq.appendChild(el('h2', null, '1 · ¿Qué quieres trabajar?'));
    var ob = el('div', 'objs');
    OBJ.forEach(function (o) {
      var c = o[3], on = c.regla === E.regla && (c.regla === 'par' ? c.par === E.par : (c.regla === 'inicio' ? c.foco === E.foco : true));
      var b = el('button', on ? 'on' : ''); b.type = 'button'; b.appendChild(document.createTextNode(o[1])); b.appendChild(el('small', null, o[2]));
      b.onclick = function () { E.regla = c.regla; E.foco = c.foco || ''; if (c.par) E.par = c.par; pintaPrepara(); };
      ob.appendChild(b);
    });
    tq.appendChild(ob);
    tq.appendChild(el('h2', null, '2 · Cómo se juega'));
    var f = el('div', 'fila2');
    var m = campo('Jugadores', 'pModo'); f.appendChild(m[0]); opt(m[1], [['maquina', 'Contra la máquina'], ['dos', 'Dos jugadores']], E.modo); m[1].onchange = function () { E.modo = m[1].value; };
    var n = campo('Cartas en la mano', 'pMano'); f.appendChild(n[0]); opt(n[1], [['5', '5 (más corta)'], ['7', '7']], String(E.mano)); n[1].onchange = function () { E.mano = parseInt(n[1].value, 10); };
    var pi = campo('Ayuda', 'pPista'); f.appendChild(pi[0]); opt(pi[1], [['0', 'Sin pista: tiene que oírlo'], ['1', 'Con pista: la carta dice el sonido']], E.pista ? '1' : '0'); pi[1].onchange = function () { E.pista = pi[1].value === '1'; };
    tq.appendChild(f);
    var r = el('div', 'resumen', 'Casan por color o por ' + resumenRegla()); tq.appendChild(r);
    var bj = el('button', 'btn', '▶ Jugar ahora'); bj.type = 'button'; bj.onclick = function () { aplica(); prep.className = 'velo portada'; S.muestraInicio(); suma('suena_partida_preparada'); };
    var be = el('button', 'btn s', '🔗 Enlace para la familia'); be.type = 'button';
    var bi = el('button', 'btn s', '🖨️ Imprimir estas cartas'); bi.type = 'button'; bi.onclick = function () { suma('suena_imprimir'); location.href = 'imprimir.html' + enlaceParams(); };
    var fila = el('div'); fila.style.textAlign = 'center'; fila.appendChild(bj); fila.appendChild(be); fila.appendChild(bi); tq.appendChild(fila);
    var caja = el('div', 'enlace'); tq.appendChild(caja);
    be.onclick = function () {
      var url = location.protocol + '//' + location.host + location.pathname + enlaceParams();
      caja.innerHTML = ''; caja.className = 'enlace on';
      caja.appendChild(el('label', null, 'Mándale este enlace. Abre el juego ya preparado:'));
      var i = el('input'); i.type = 'text'; i.readOnly = true; i.value = url; i.onclick = function () { try { i.select(); } catch (e) { } }; caja.appendChild(i);
      var dicho = el('p', 'ok-copia'); dicho.setAttribute('role', 'status');
      var bc = el('button', 'btn mini', '📋 Copiar'); bc.type = 'button'; bc.onclick = function () { copia(url, dicho); };
      var bs = el('button', 'btn s mini', '📤 Compartir'); bs.type = 'button'; bs.onclick = function () { comparte('🃏 Suena igual: casan por color o por ' + resumenRegla() + '. Una partida al día:', url); };
      var mm = el('div', 'minis'); mm.appendChild(bc); mm.appendChild(bs); caja.appendChild(mm); caja.appendChild(dicho);
      suma('suena_enlace_familia');
    };
    var bv = el('button', 'btn s mini', '← Volver'); bv.type = 'button'; bv.onclick = function () { prep.className = 'velo portada'; portada.className = 'velo portada on'; };
    var fv = el('div'); fv.style.textAlign = 'center'; fv.appendChild(bv); tq.appendChild(fv);
  }
  function resumenRegla() {
    var pr = { rl: 'las dos con R o las dos con L', bp: 'las dos con B o las dos con P', td: 'las dos con T o las dos con D', kg: 'las dos con K o las dos con G', sz: 'las dos con S o las dos con Z', fz: 'las dos con F o las dos con Z' };
    if (E.regla === 'inicio') return 'el mismo sonido al principio' + (E.foco ? ' (con ' + (E.foco === 'r' ? 'R fuerte' : E.foco.toUpperCase()) + ' seguro)' : '');
    if (E.regla === 'final') return 'el mismo sonido al final';
    if (E.regla === 'silabas') return 'el mismo número de sílabas';
    return pr[E.par];
  }
  function aplica() { O.regla = E.regla; O.foco = E.foco; O.par = E.par; O.modo = E.modo; O.mano = E.mano; O.pista = E.pista; S.guardaOpc(); }
  function copia(t, donde) {
    function dicho(ok) { donde.textContent = ok ? '✔ Copiado.' : 'No se ha podido copiar: mantén pulsado el texto y cópialo a mano.'; }
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(function () { dicho(true); }, function () { dicho(false); }); return; } } catch (e) { }
    try { var x = document.createElement('textarea'); x.value = t; x.style.position = 'fixed'; x.style.top = '-999px'; document.body.appendChild(x); x.select(); var ok = document.execCommand('copy'); document.body.removeChild(x); dicho(ok); } catch (e) { dicho(false); }
  }
  function comparte(t, url) {
    try { if (navigator.share) { navigator.share(url ? { text: t, url: url } : { text: t }).catch(function () { }); return; } } catch (e) { }
    window.open('https://wa.me/?text=' + encodeURIComponent(t + (url ? ' ' + url : '')), '_blank');
  }

  /* ---------- partidas y final ---------- */
  var bJugar = $('bJugar'), bOtra = $('bOtra');
  [bJugar, bOtra].forEach(function (b) { b.addEventListener('click', function () { suma('suena_partidas'); suma('suena_partidas_' + hoy()); }); });
  $('pausaCta').appendChild(FIJO ? el('span') : tarjeta('pausa', '¿Te vas? Llévate más juegos', 'En ColmenIA, la comunidad de logopedas y maestras.'));
  var textoInforme = '';
  window.addEventListener('suena:fin', function (ev) {
    suma('suena_partidas_terminadas');
    var filas = ev.detail.filas, c = $('finInforme'); c.innerHTML = '';
    var inf = el('div', 'informe'); inf.appendChild(el('h2', null, '📋 Informe de la partida'));
    var dl = el('dl'), lin = ['🃏 Suena igual · informe de la partida'];
    filas.forEach(function (f) { var dt = el('dt', null, f[0]), dd = el('dd', null, f[1]); if (/Acierto|confunde|Cómo va/.test(f[0])) dd.className = 'clave'; dl.appendChild(dt); dl.appendChild(dd); lin.push(f[0] + ': ' + f[1]); });
    lin.push('Lo mide el juego con las cartas que intenta echar: orienta, no diagnostica.');
    textoInforme = lin.join('\n'); inf.appendChild(dl);
    var dicho = el('p', 'ok-copia'); dicho.setAttribute('role', 'status');
    var b1 = el('button', 'btn mini', '📤 Enviar a mi logopeda'); b1.type = 'button'; b1.onclick = function () { comparte(textoInforme, ''); suma('suena_informe_compartido'); };
    var b2 = el('button', 'btn s mini', '📋 Copiar'); b2.type = 'button'; b2.onclick = function () { copia(textoInforme, dicho); };
    var mm = el('div', 'minis'); mm.appendChild(b1); mm.appendChild(b2); inf.appendChild(mm); inf.appendChild(dicho);
    c.appendChild(inf); c.appendChild(el('p', 'nota', 'Este informe no sale de este aparato si no lo compartes tú.'));
    var x = $('finExtra'); x.innerHTML = '';
    if (!FIJO) { var bp = el('button', 'btn s', '🧑‍⚕️ Cambiar la partida'); bp.type = 'button'; bp.onclick = abrePrepara; x.appendChild(bp); }
    x.appendChild(tarjeta('final', '¡Partida hecha! ¿Quieres más juegos así?', 'Están en ColmenIA, la comunidad de logopedas y maestras.'));
  });

  /* ---------- antes de irte (una vez por visita; nunca en mitad de una partida ni en enlaces de familia) ---------- */
  var desp = el('div', 'despedida'); desp.id = 'vDespedida';
  var dc = el('div', 'despedida-caja'); var dx = el('button', 'despedida-x', '✕'); dx.type = 'button'; dx.setAttribute('aria-label', 'Cerrar');
  dc.appendChild(dx); dc.appendChild(el('p', 'despedida-t', 'Antes de irte…')); dc.appendChild(tarjeta('despedida', 'Llévate más juegos como este', 'Están en ColmenIA, la comunidad de logopedas y maestras.'));
  desp.appendChild(dc); document.body.appendChild(desp); dx.onclick = function () { desp.className = 'despedida'; };
  var visto = false, fuera = 0;
  function jugando() { var g = S.estado(); return g && !g.fin && $('vPausa').className.indexOf(' on') < 0; }
  function despide(por) { if (visto || FIJO || jugando()) return; try { if (localStorage.getItem('suena-fue-a-skool')) return; } catch (e) { } visto = true; desp.className = 'despedida on'; suma('suena_despedida_vista'); suma('suena_despedida_' + por); }
  document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) despide('raton'); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) fuera = Date.now(); else if (fuera && Date.now() - fuera > 8000) setTimeout(function () { despide('vuelta'); }, 600); });

  window.__suenaColmenia = { suma: suma, CANAL: CANAL, MIO: MIO, abrePrepara: abrePrepara };
})();
