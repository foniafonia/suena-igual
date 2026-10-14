/* Suena igual · el juego (Gabinete Fönia · ColmenIA, 14/10/2026)
   Juego de cartas de turnos: se echa una carta si es del mismo COLOR que la de arriba o si su
   palabra SUENA IGUAL según la regla de la partida (el mismo sonido al principio, el mismo al
   final, el mismo sonido de un par mínimo o el mismo número de sílabas). Se juzga por el sonido,
   no por la letra: «casa», «queso» y «kilo» casan porque empiezan por /k/.
   Si se intenta echar una que no vale, el juego dice por qué y apunta qué dos sonidos se han
   confundido: eso es el informe.
   Banco y voz: los del Snake de palabras (241 palabras, voz Piper). Sin dibujos.
   Sin sintaxis nueva (ES2017, sin ?. ni ??): iPad antiguos. */
(function () {
  'use strict';
  var F = window.Fonetica, BANCO = window.BANCO;
  function $(i) { return document.getElementById(i); }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined && x !== null) e.textContent = x; return e; }
  function baraja(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function ahora() { return Date.now(); }
  var QS; try { QS = new URLSearchParams(location.search); } catch (e) { QS = { get: function () { return null; } }; }

  /* ====================== opciones ====================== */
  var REGLAS = ['inicio', 'final', 'par', 'silabas'];
  var PARES = { rl: ['r', 'l'], bp: ['b', 'p'], td: ['t', 'd'], kg: ['k', 'g'], sz: ['s', 'z'], fz: ['f', 'z'] };
  var FIJO = REGLAS.indexOf(QS.get('regla')) >= 0;
  var OPC = {
    regla: FIJO ? QS.get('regla') : 'inicio',
    foco: (QS.get('foco') || '').toLowerCase().replace(/[^a-zñ]/g, '').slice(0, 2),      /* un sonido que no debe faltar (regla inicio/final) */
    par: PARES[QS.get('par')] ? QS.get('par') : 'rl',
    modo: QS.get('modo') === 'dos' ? 'dos' : 'maquina',
    mano: QS.get('mano') === '7' ? 7 : 5,
    pista: QS.get('pista') === '1'
  };
  var KOPC = 'suena-igual-opc';
  if (!FIJO) { try { var g = JSON.parse(localStorage.getItem(KOPC) || 'null'); if (g && REGLAS.indexOf(g.regla) >= 0) { OPC.regla = g.regla; OPC.foco = g.foco || ''; OPC.par = PARES[g.par] ? g.par : 'rl'; OPC.modo = g.modo === 'dos' ? 'dos' : 'maquina'; OPC.mano = g.mano === 7 ? 7 : 5; OPC.pista = !!g.pista; } } catch (e) { } }
  if (FIJO) document.body.className += ' fijado';
  function guardaOpc() { if (FIJO) return; try { localStorage.setItem(KOPC, JSON.stringify(OPC)); } catch (e) { } }

  /* ====================== la regla ====================== */
  /* clave de sonido de una palabra según la regla (las cartas con la misma clave casan) */
  function clave(w, n) {
    if (OPC.regla === 'inicio') return F.primero(w);
    if (OPC.regla === 'final') return F.ultimo(w);
    if (OPC.regla === 'silabas') return n >= 4 ? '4' : String(n);
    var p = PARES[OPC.par], a = F.tiene(w, p[0]), b = F.tiene(w, p[1]);
    return a && !b ? p[0] : (b && !a ? p[1] : null);
  }
  function nombreClave(k) {
    if (OPC.regla === 'silabas') return k === '4' ? '4 o más sílabas' : k + ' sílaba' + (k === '1' ? '' : 's');
    if (OPC.regla === 'par') return 'tiene ' + F.corto(k);
    return F.corto(k);
  }
  function reglaTexto() {
    if (OPC.regla === 'inicio') return 'el mismo sonido al PRINCIPIO';
    if (OPC.regla === 'final') return 'el mismo sonido al FINAL';
    if (OPC.regla === 'silabas') return 'el mismo número de SÍLABAS';
    var p = PARES[OPC.par]; return 'las dos con ' + F.corto(p[0]) + ' o las dos con ' + F.corto(p[1]);
  }
  function porQue(carta, arriba) {
    var w = '«' + carta.w + '»', a = '«' + arriba.w + '»';
    if (OPC.regla === 'inicio') return w + ' empieza por ' + F.corto(carta.son) + ' y ' + a + ' por ' + F.corto(arriba.son);
    if (OPC.regla === 'final') return w + ' acaba en ' + F.corto(carta.son) + ' y ' + a + ' en ' + F.corto(arriba.son);
    if (OPC.regla === 'silabas') return w + ' tiene ' + nombreClave(carta.son) + ' y ' + a + ' ' + nombreClave(arriba.son);
    return w + ' tiene ' + F.corto(carta.son) + ' y ' + a + ' tiene ' + F.corto(arriba.son);
  }
  function porQueSi(carta, arriba) {
    if (OPC.regla === 'inicio') return 'las dos empiezan por ' + F.corto(carta.son);
    if (OPC.regla === 'final') return 'las dos acaban en ' + F.corto(carta.son);
    if (OPC.regla === 'silabas') return 'las dos tienen ' + nombreClave(carta.son);
    return 'las dos tienen ' + F.corto(carta.son);
  }

  /* ====================== la baraja ====================== */
  var COLORES = ['rojo', 'azul', 'verde', 'amarillo'];
  var NOMBRE_COLOR = { rojo: 'ROJO', azul: 'AZUL', verde: 'VERDE', amarillo: 'AMARILLO' };
  /* Cuatro grupos de sonido con palabras de sobra (si la logopeda pide un sonido, ese entra seguro),
     diez palabras por grupo repartidas en los cuatro colores, y ocho cartas especiales. */
  function grupos() {
    var por = {};
    BANCO.forEach(function (p) { var k = clave(p[0], p[1]); if (k === null || k === undefined) return; (por[k] = por[k] || []).push(p); });
    if (OPC.regla === 'par') return PARES[OPC.par].map(function (k) { return [k, por[k] || []]; });
    var lista = Object.keys(por).map(function (k) { return [k, por[k]]; }).filter(function (x) { return x[1].length >= 5; }).sort(function (a, b) { return b[1].length - a[1].length; });
    var foco = OPC.foco ? (OPC.foco === 'r' ? 'rr' : OPC.foco) : '';
    var res = [];
    if (foco && OPC.regla !== 'silabas') lista.forEach(function (x) { if (x[0] === foco) res.push(x); });
    lista.forEach(function (x) { if (res.length < 4 && res.indexOf(x) < 0) res.push(x); });
    return res;
  }
  var nId = 0;
  function nuevaBaraja() {
    var gs = grupos(), cartas = [], porGrupo = OPC.regla === 'par' ? 18 : 10;
    gs.forEach(function (gr) {
      baraja(gr[1]).slice(0, porGrupo).forEach(function (p, i) { cartas.push({ id: ++nId, tipo: 'palabra', w: p[0], n: p[1], son: gr[0], color: COLORES[i % 4] }); });
    });
    COLORES.forEach(function (c) { cartas.push({ id: ++nId, tipo: 'roba2', color: c }); cartas.push({ id: ++nId, tipo: 'pasa', color: c }); });
    cartas.push({ id: ++nId, tipo: 'comodin', color: null }); cartas.push({ id: ++nId, tipo: 'comodin', color: null });
    return { cartas: baraja(cartas), grupos: gs.map(function (x) { return x[0]; }) };
  }

  /* la página de imprimir solo necesita la baraja */
  if (!document.getElementById('app')) { window.__suena = { OPC: OPC, PARES: PARES, nuevaBaraja: nuevaBaraja, nombreClave: nombreClave, reglaTexto: reglaTexto, NOMBRE_COLOR: NOMBRE_COLOR }; return; }

  /* ====================== sonido y voz ====================== */
  var AC = window.AudioContext || window.webkitAudioContext, actx = null, sonido = true;
  function audioListo() { if (!AC) return; try { if (!actx) actx = new AC(); if (actx.state === 'suspended' && actx.resume) actx.resume(); } catch (e) { actx = null; } }
  function nota(f, t0, dur, tipo, vol) {
    if (!actx || !sonido) return;
    try { var o = actx.createOscillator(), gn = actx.createGain(), t = actx.currentTime + t0; o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t); gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(gn); gn.connect(actx.destination); o.start(t); o.stop(t + dur + 0.05); } catch (e) { }
  }
  function sfxOk() { nota(660, 0, 0.1, 'triangle'); nota(880, 0.07, 0.14, 'triangle'); }
  function sfxMal() { nota(220, 0, 0.16, 'sine', 0.2); nota(165, 0.1, 0.2, 'sine', 0.2); }
  function sfxFin() { [523, 659, 784, 1047].forEach(function (f, i) { nota(f, i * 0.12, 0.2, 'triangle'); }); }
  var voz = null;
  function di(w) {
    if (!sonido || !window.VOZ_SNAKE || !window.VOZ_SNAKE[w]) return;
    try { if (voz) voz.pause(); voz = new Audio('voz/' + window.VOZ_SNAKE[w] + '.mp3'); var p = voz.play(); if (p && p.catch) p.catch(function () { }); } catch (e) { }
  }

  /* ====================== estado de la partida ====================== */
  var G = null;
  var NOMBRE_J = ['Tú', 'La máquina'];
  function nombreJ(i) { return OPC.modo === 'dos' ? (i ? 'Jugador naranja' : 'Jugador verde') : NOMBRE_J[i]; }
  function nuevaPartida() {
    var b = nuevaBaraja();
    G = { mazo: b.cartas, grupos: b.grupos, descarte: [], manos: [[], []], turno: 0, color: null, roba: 0, inicio: ahora(), tJug: ahora(),
      jug: [], intentos: [], robadas: [0, 0], fin: false, ganador: -1, enviado: false, ocupado: false, robo: false, ultimaCarta: [false, false] };
    for (var k = 0; k < OPC.mano; k++) { G.manos[0].push(G.mazo.pop()); G.manos[1].push(G.mazo.pop()); }
    /* la primera de arriba siempre es una palabra */
    var i = G.mazo.length - 1; while (i >= 0 && G.mazo[i].tipo !== 'palabra') i--;
    var primera = G.mazo.splice(i, 1)[0]; G.descarte.push(primera); G.color = primera.color;
  }
  function arriba() { return G.descarte[G.descarte.length - 1]; }
  function vale(c) {
    var a = arriba();
    if (c.tipo === 'comodin') return true;
    if (c.color === G.color) return true;
    if (c.tipo !== 'palabra') return a.tipo === c.tipo;
    return a.tipo === 'palabra' && c.son === a.son;
  }
  function roba(j, n) {
    for (var k = 0; k < n; k++) {
      if (!G.mazo.length) { var tope = G.descarte.pop(); G.mazo = baraja(G.descarte); G.descarte = [tope]; }
      if (!G.mazo.length) return;
      G.manos[j].push(G.mazo.pop());
    }
    G.robadas[j] += n;
  }

  /* ====================== pantalla ====================== */
  function cartaDOM(c, opts) {
    opts = opts || {};
    var b = el(opts.boton ? 'button' : 'div', 'carta ' + (c.color || 'negra') + (opts.grande ? ' grande' : '') + (opts.oculta ? ' oculta' : ''));
    if (opts.boton) b.type = 'button';
    if (opts.oculta) { b.appendChild(el('span', 'dorso', '♪')); return b; }
    if (c.tipo === 'palabra') {
      b.appendChild(el('span', 'pal', c.w));
      if (OPC.pista) b.appendChild(el('span', 'son', nombreClave(c.son)));
      b.setAttribute('aria-label', c.w + ', carta ' + NOMBRE_COLOR[c.color].toLowerCase());
    } else {
      var txt = c.tipo === 'roba2' ? '+2' : (c.tipo === 'pasa' ? '⊘' : '★'), sub = c.tipo === 'roba2' ? 'Roba 2' : (c.tipo === 'pasa' ? 'Pasa turno' : 'Elige color');
      b.appendChild(el('span', 'esp', txt)); b.appendChild(el('span', 'son', sub));
      b.setAttribute('aria-label', sub + (c.color ? ', ' + NOMBRE_COLOR[c.color].toLowerCase() : ''));
    }
    return b;
  }
  function aviso(txt, clase) { var a = $('aviso'); a.textContent = txt; a.className = 'aviso ' + (clase || ''); }
  var ultToque = 0;
  function alTocar(e, f) {
    e.addEventListener('touchend', function (ev) { ultToque = ahora(); ev.preventDefault(); f(); }, { passive: false });
    e.addEventListener('click', function () { if (ahora() - ultToque < 500) return; f(); });
  }
  function pinta() {
    if (!G) return;
    var j = G.turno, humano = OPC.modo === 'dos' || j === 0, visible = OPC.modo === 'dos' ? j : 0;
    $('regla').innerHTML = ''; $('regla').appendChild(document.createTextNode('Casan por color o por ')); $('regla').appendChild(el('b', null, reglaTexto()));
    $('mazoN').textContent = G.mazo.length;
    var rival = OPC.modo === 'dos' ? 1 - visible : 1;
    $('rivalNombre').textContent = nombreJ(rival); $('rivalN').textContent = G.manos[rival].length + (G.manos[rival].length === 1 ? ' carta' : ' cartas');
    var rv = $('rivalCartas'); rv.innerHTML = ''; for (var k = 0; k < Math.min(G.manos[rival].length, 9); k++) rv.appendChild(cartaDOM({}, { oculta: true }));
    var mesa = $('arriba'); mesa.innerHTML = ''; var a = arriba(); var ca = cartaDOM(a, { grande: true });
    if (a.tipo === 'comodin' && G.color) { ca.className += ' elegido-' + G.color; ca.appendChild(el('span', 'son', 'ahora: ' + NOMBRE_COLOR[G.color])); }
    if (a.tipo === 'palabra') alTocar(ca, function () { audioListo(); di(a.w); });
    mesa.appendChild(ca);
    $('colorAhora').className = 'color-ahora ' + G.color; $('colorAhora').textContent = 'Color: ' + NOMBRE_COLOR[G.color];
    $('turno').textContent = G.fin ? '' : (humano ? (OPC.modo === 'dos' ? 'Turno de ' + nombreJ(j).toLowerCase() : 'Te toca') : 'Juega la máquina…');
    $('turno').className = 'turno j' + j;
    var mano = $('mano'); mano.innerHTML = '';
    G.manos[visible].forEach(function (c) {
      var b = cartaDOM(c, { boton: true });
      if (!humano || G.fin) b.disabled = true;
      alTocar(b, function () { if (!b.disabled) intenta(visible, c, b); });
      mano.appendChild(b);
    });
    $('bRobar').disabled = !humano || G.fin || G.ocupado;
    $('bRobar').textContent = G.robo ? 'Pasar' : 'Robar carta';
    $('miNombre').textContent = OPC.modo === 'dos' ? nombreJ(visible) : 'Tus cartas';
  }

  /* ====================== jugar ====================== */
  function intenta(j, c, boton) {
    if (!G || G.fin || G.ocupado || G.turno !== j) return;
    audioListo();
    var ms = ahora() - G.tJug, a = arriba();
    if (!vale(c)) {
      /* solo cuenta como confusión de sonido si NO es del mismo color: entonces ha creído que sonaba igual */
      var conf = (c.tipo === 'palabra' && a.tipo === 'palabra') ? [c.son, a.son] : null;
      G.intentos.push({ j: j, w: c.w || c.tipo, arriba: a.w || a.tipo, conf: conf, ms: ms });
      sfxMal(); if (boton) { boton.className += ' mal'; setTimeout(function () { boton.className = boton.className.replace(' mal', ''); }, 600); }
      aviso(c.tipo === 'palabra' && a.tipo === 'palabra' ? 'No vale: ' + porQue(c, a) + ', y no es del mismo color.' : 'No vale: no es del mismo color ni del mismo tipo.', 'fallo');
      return;
    }
    juega(j, c, ms);
  }
  function juega(j, c, ms) {
    var a = arriba(), mano = G.manos[j], i = mano.indexOf(c);
    mano.splice(i, 1); G.descarte.push(c); G.robo = false;
    var porSonido = c.tipo === 'palabra' && a.tipo === 'palabra' && c.son === a.son;
    G.jug.push({ j: j, w: c.w || c.tipo, tipo: c.tipo, porSonido: porSonido, porColor: c.color === G.color, ms: ms });
    if (c.tipo === 'palabra') { di(c.w); aviso('✔ ' + c.w + (porSonido ? ' · ' + porQueSi(c, a) : ' · mismo color'), 'bien'); }
    else aviso(c.tipo === 'roba2' ? '+2: el otro roba dos cartas.' : (c.tipo === 'pasa' ? '⊘ El otro pierde el turno.' : '★ Elige el color.'), 'bien');
    sfxOk();
    if (c.tipo !== 'comodin') G.color = c.color;
    if (!mano.length) { gana(j); return; }
    if (mano.length === 1) { var u = $('ultima'); u.textContent = '¡Última carta de ' + nombreJ(j).toLowerCase() + '!'; u.className = 'ultima on'; setTimeout(function () { u.className = 'ultima'; }, 1800); }
    if (c.tipo === 'comodin') { if (OPC.modo === 'maquina' && j === 1) { G.color = colorMaquina(); aviso('★ La máquina elige ' + NOMBRE_COLOR[G.color] + '.', 'bien'); siguiente(c); } else eligeColor(function (col) { G.color = col; siguiente(c); }); pinta(); return; }
    siguiente(c);
  }
  function siguiente(c) {
    var otro = 1 - G.turno;
    if (c && c.tipo === 'roba2') { roba(otro, 2); }
    if (c && (c.tipo === 'roba2' || c.tipo === 'pasa')) { /* el otro pierde el turno: vuelve a tocar al mismo */ cambiaTurno(G.turno); return; }
    cambiaTurno(otro);
  }
  function cambiaTurno(j) {
    G.turno = j; G.tJug = ahora(); G.robo = false;
    if (OPC.modo === 'dos') { pinta(); tapa(j); return; }
    pinta();
    if (j === 1) { G.ocupado = true; setTimeout(turnoMaquina, 1100); }
  }
  function robar() {
    if (!G || G.fin || G.ocupado) return;
    var j = G.turno; audioListo();
    if (G.robo) { aviso('Pasas el turno.', ''); cambiaTurno(1 - j); return; }
    roba(j, 1); G.robo = true;
    var nueva = G.manos[j][G.manos[j].length - 1];
    aviso(nueva && vale(nueva) ? 'Has robado una carta que vale: puedes echarla.' : 'Has robado. Si no puedes echar ninguna, toca «Pasar».', '');
    pinta();
  }
  /* la máquina: si puede, echa una que case por SONIDO (y la dice en voz alta: hace de modelo);
     si no, por color; si no, especial; si no, roba. Elige el color que más tiene. */
  function colorMaquina() { var n = { rojo: 0, azul: 0, verde: 0, amarillo: 0 }; G.manos[1].forEach(function (c) { if (c.color) n[c.color]++; }); return COLORES.slice().sort(function (a, b) { return n[b] - n[a]; })[0]; }
  function turnoMaquina() {
    if (!G || G.fin) return;
    var m = G.manos[1], a = arriba(), ok = m.filter(vale);
    var porSon = ok.filter(function (c) { return c.tipo === 'palabra' && a.tipo === 'palabra' && c.son === a.son; });
    var pal = ok.filter(function (c) { return c.tipo === 'palabra'; });
    var elegida = porSon[0] || pal[0] || ok.filter(function (c) { return c.tipo !== 'comodin'; })[0] || ok[0];
    if (!elegida) {
      roba(1, 1); var nueva = m[m.length - 1];
      if (nueva && vale(nueva)) { aviso('La máquina roba y echa una.', ''); setTimeout(function () { G.ocupado = false; juega(1, nueva, 0); }, 900); pinta(); return; }
      aviso('La máquina roba y pasa.', ''); G.ocupado = false; cambiaTurno(0); return;
    }
    G.ocupado = false; juega(1, elegida, 0);
  }
  function eligeColor(f) {
    var v = $('vColor'); v.className = 'velo on'; var c = $('colores'); c.innerHTML = '';
    COLORES.forEach(function (col) { var b = el('button', 'bcolor ' + col, NOMBRE_COLOR[col]); b.type = 'button'; b.onclick = function () { v.className = 'velo'; f(col); }; c.appendChild(b); });
  }
  function tapa(j) {
    var v = $('vTapa'); $('tapaQuien').textContent = 'Turno del ' + nombreJ(j).toLowerCase(); $('tapaQuien').className = 'j' + j; v.className = 'velo on';
  }
  function gana(j) {
    G.fin = true; G.ganador = j; sfxFin(); pinta();
    setTimeout(fin, 900);
  }

  /* ====================== informe ====================== */
  function mediana(a) { if (!a.length) return null; var s = a.slice().sort(function (x, y) { return x - y; }); return s[Math.floor(s.length / 2)]; }
  function filas(parcial) {
    var J = 0, jug = G.jug.filter(function (x) { return x.j === J; }), mal = G.intentos.filter(function (x) { return x.j === J; });
    var pal = jug.filter(function (x) { return x.tipo === 'palabra'; }), son = pal.filter(function (x) { return x.porSonido; });
    var tot = jug.length + mal.length, prec = tot ? jug.length / tot : null;
    var confs = {}; mal.forEach(function (x) { if (x.conf) { var k = F.corto(x.conf[0]) + ' por ' + F.corto(x.conf[1]); if (OPC.regla === 'silabas') k = x.conf[0] + ' por ' + x.conf[1] + ' sílabas'; confs[k] = (confs[k] || 0) + 1; } });
    var med = mediana(jug.concat(mal).map(function (x) { return x.ms; })), seg = Math.max(1, Math.round((ahora() - G.inicio) / 1000));
    var como = prec === null || tot < 4 ? 'sin dato' : (prec >= 0.85 ? 'bien' : (prec >= 0.6 ? 'regular' : 'le cuesta'));
    var ck = Object.keys(confs).sort(function (a, b) { return confs[b] - confs[a]; });
    return [
      ['Regla', 'casan por color o por ' + reglaTexto().replace('PRINCIPIO', 'principio').replace('FINAL', 'final').replace('SÍLABAS', 'sílabas') + (OPC.foco && OPC.regla !== 'par' && OPC.regla !== 'silabas' ? ' (con ' + F.corto(OPC.foco === 'r' ? 'rr' : OPC.foco) + ' seguro)' : '')],
      ['Partida', (OPC.modo === 'dos' ? 'dos jugadores' : 'contra la máquina') + ' · ' + (parcial ? 'sin terminar' : (G.ganador === 0 ? 'ganada' : 'perdida'))],
      ['Cartas echadas', jug.length + ' (' + son.length + ' por sonido, ' + (pal.length - son.length) + ' por color, ' + (jug.length - pal.length) + ' especiales)'],
      ['Por sonido', son.length ? son.slice(0, 8).map(function (x) { return x.w; }).join(', ') : 'ninguna'],
      ['Intentos que no valían', mal.length + (mal.length ? ' · ' + mal.slice(0, 5).map(function (x) { return '«' + x.w + '» sobre «' + x.arriba + '»'; }).join(' · ') : '')],
      ['Acierto al elegir', prec === null ? 'sin datos' : Math.round(prec * 100) + ' % (' + jug.length + ' bien, ' + mal.length + ' que no valían)'],
      ['Sonidos que confunde', ck.length ? ck.map(function (k) { return k + ' ×' + confs[k]; }).join(', ') : 'ninguno detectado'],
      ['Tiempo por jugada', med === null ? 'sin datos' : (med / 1000).toFixed(1).replace('.', ',') + ' s (mediana)'],
      ['Cartas robadas', String(G.robadas[0])],
      ['Duración', Math.floor(seg / 60) + ' min ' + (seg % 60) + ' s'],
      ['Cómo va', como],
      ['Qué le cuesta', ck.length ? 'cree que suenan igual: ' + ck.slice(0, 2).join(', ') : (mal.length ? 'echar sin mirar el color ni el sonido' : '—')],
      ['Qué toca ahora', como === 'bien' ? 'cambiar de regla o de sonido' : (como === 'sin dato' ? 'jugar una partida entera' : 'repetir esta regla con la pista de sonido activada')]
    ];
  }
  function fin() {
    var v = $('vFin'); v.className = 'velo on';
    var gano = G.ganador === 0;
    $('finTit').textContent = OPC.modo === 'dos' ? '¡Gana el ' + nombreJ(G.ganador).toLowerCase() + '!' : (gano ? '¡Has ganado!' : 'Esta vez gana la máquina');
    var j0 = G.jug.filter(function (x) { return x.j === 0; }), m0 = G.intentos.filter(function (x) { return x.j === 0; }), t = j0.length + m0.length;
    $('finRes').innerHTML = '';
    [[j0.length, 'echadas'], [j0.filter(function (x) { return x.porSonido; }).length, 'por sonido'], [m0.length, 'no valían'], [t ? Math.round(j0.length / t * 100) + ' %' : '—', 'acierto']].forEach(function (x) { var d = el('div'); d.appendChild(el('b', null, x[0])); d.appendChild(document.createTextNode(x[1])); $('finRes').appendChild(d); });
    if (OPC.modo === 'dos') $('finRes').appendChild(el('p', 'nota', 'El informe es del jugador verde.'));
    window.dispatchEvent(new CustomEvent('suena:fin', { detail: { filas: filas(false) } }));
  }

  /* ====================== arranque ====================== */
  function juegaYa() {
    audioListo(); guardaOpc();
    ['vInicio', 'vFin', 'vPausa'].forEach(function (x) { $(x).className = 'velo'; });
    nuevaPartida(); aviso('Echa una carta del mismo color o que suene igual. Toca la de arriba para oírla.', '');
    if (OPC.modo === 'dos') { pinta(); tapa(0); } else pinta();
  }
  alTocar($('bRobar'), robar);
  $('bTapa').onclick = function () { $('vTapa').className = 'velo'; pinta(); };
  $('bSonido').onclick = function () { sonido = !sonido; $('bSonido').textContent = sonido ? '🔊' : '🔇'; audioListo(); };
  $('bPausa').onclick = function () { if (G && !G.fin) $('vPausa').className = 'velo on'; };
  $('bSigue').onclick = function () { $('vPausa').className = 'velo'; };
  $('bAcabar').onclick = function () { $('vPausa').className = 'velo'; if (G && !G.fin) { G.fin = true; G.ganador = -1; fin(); } };
  $('bOtra').onclick = juegaYa;
  $('bJugar').onclick = juegaYa;
  function muestraInicio() {
    $('inicioRegla').innerHTML = ''; $('inicioRegla').appendChild(document.createTextNode('Casan por color o por ')); $('inicioRegla').appendChild(el('b', null, reglaTexto()));
    $('vInicio').className = 'velo on';
  }
  muestraInicio();
  window.__suena = { OPC: OPC, PARES: PARES, REGLAS: REGLAS, estado: function () { return G; }, filas: filas, juega: juegaYa, muestraInicio: muestraInicio, guardaOpc: guardaOpc,
    intenta: intenta, robar: robar, vale: vale, clave: clave, grupos: grupos, nombreClave: nombreClave, reglaTexto: reglaTexto, nuevaBaraja: nuevaBaraja, turnoMaquina: turnoMaquina };
})();
