/* Suena igual · ruido de fondo opcional (Gabinete Fönia · ColmenIA, 20/11/2026)
   Pedido en Skool por Evangelina García: entrenar la escucha de palabras con ruido (calle, cafetería, ruido blanco).
   El ruido se fabrica en el propio aparato con Web Audio: no se descarga ni se sube nada. Es un ruido SIMULADO,
   no una grabación real, y el nivel (suave, medio, fuerte) es aproximado: no está calibrado en decibelios.
   «Sonido propio»: la persona elige un audio de su aparato (la clase, el patio…); se queda en el aparato y no sale de él.
   Sin sintaxis nueva (ES5 con var): iPad antiguos. */
(function () {
  'use strict';
  var NOMBRES = { no: 'sin ruido', calle: 'calle', cafe: 'cafetería', blanco: 'ruido blanco', propio: 'sonido propio' };
  var NIVELES = ['', 'suave', 'medio', 'fuerte'];
  var TIPOS = ['no', 'calle', 'cafe', 'blanco', 'propio'];
  var GANANCIA = [0, 0.3, 0.7, 1.3];   /* sobre un ruido normalizado a RMS 0,25 */
  var VOLUMEN = [0, 0.25, 0.55, 1];    /* para el audio propio */

  function rnd() { return Math.random() * 2 - 1; }
  /* mezcla el final con el principio para que el bucle no dé un chasquido */
  function cierra(a, cf) {
    var n = a.length, i, w;   /* potencia constante: el ruido no «respira» al repetirse */
    for (i = 0; i < cf; i++) { w = Math.PI / 2 * i / cf; a[i] = a[i] * Math.sin(w) + a[n - cf + i] * Math.cos(w); }
    return a.subarray(0, n - cf);
  }
  function normaliza(a, rms) {
    var s = 0, i, k, v;
    for (i = 0; i < a.length; i++) s += a[i] * a[i];
    k = rms / (Math.sqrt(s / a.length) || 1);
    for (i = 0; i < a.length; i++) { v = a[i] * k; a[i] = v > 0.95 ? 0.95 : (v < -0.95 ? -0.95 : v); }
    return a;
  }

  /* devuelve un Float32Array listo para repetir en bucle */
  function genera(tipo, sr, seg) {
    var cf = Math.round(sr * 0.4), n = Math.round(sr * seg) + cf, a = new Float32Array(n), i, b, v, c;
    if (tipo === 'blanco') {
      for (i = 0; i < n; i++) a[i] = rnd();
    } else if (tipo === 'calle') {
      /* retumbo grave continuo (ruido marrón) con «coches» que pasan: subidas y bajadas lentas, y un poco de siseo */
      var env = new Float32Array(n), c0, w, amp, d, desde, hasta;
      b = 0;
      for (i = 0; i < n; i++) { b = (b + 0.03 * rnd()) / 1.03; a[i] = b; env[i] = 0.35; }
      for (c = 0; c < Math.max(2, Math.round(seg / 3)); c++) {
        c0 = Math.random() * n; w = (0.8 + Math.random() * 1.6) * sr; amp = 0.5 + Math.random() * 0.7;
        desde = Math.max(0, Math.floor(c0 - 3 * w)); hasta = Math.min(n, Math.ceil(c0 + 3 * w));
        for (i = desde; i < hasta; i++) { d = (i - c0) / w; env[i] += amp * Math.exp(-d * d); }
      }
      for (i = 0; i < n; i++) a[i] = a[i] * env[i] + 0.03 * rnd();
    } else if (tipo === 'cafe') {
      /* murmullo: ocho «voces» (ruido filtrado entre ~150 Hz y ~2,5 kHz) que suben y bajan al ritmo de las sílabas, con pausas;
         más un retumbo suave de sala. No se entiende nada: es el efecto de varias conversaciones a la vez. */
      var V = 8, lpA, lpB, kA, kB, e, obj, resta, x, rum = 0, kE = 1 - Math.exp(-1 / (0.025 * sr));
      for (v = 0; v < V; v++) {
        lpA = 0; lpB = 0; e = 0; obj = 0; resta = 0;
        kA = 1 - Math.exp(-2 * Math.PI * (1200 + Math.random() * 1500) / sr);
        kB = 1 - Math.exp(-2 * Math.PI * (150 + Math.random() * 150) / sr);
        for (i = 0; i < n; i++) {
          if (resta <= 0) { resta = Math.round((0.08 + Math.random() * 0.22) * sr); obj = Math.random() < 0.28 ? 0 : 0.4 + Math.random() * 0.6; }
          resta--; e += (obj - e) * kE;
          x = rnd(); lpA += kA * (x - lpA); lpB += kB * (x - lpB);
          a[i] += (lpA - lpB) * e;
        }
      }
      for (i = 0; i < n; i++) { rum = (rum + 0.03 * rnd()) / 1.03; a[i] += rum; }
    } else {
      return new Float32Array(0);
    }
    return normaliza(cierra(a, cf), 0.25);
  }

  /* motor: arranca y para el ruido. getCtx devuelve el AudioContext del juego (ya desbloqueado por un toque) */
  function crea(getCtx) {
    var cache = {}, st = { src: null, gan: null, el: null, url: null, nombre: '', on: false, tipo: 'no', nivel: 2 };
    function buf(ctx, tipo) {
      if (cache[tipo]) return cache[tipo];
      var sr = 22050, d = genera(tipo, sr, tipo === 'cafe' ? 10 : 8), b = ctx.createBuffer(1, d.length, sr);
      if (b.copyToChannel) b.copyToChannel(d, 0); else b.getChannelData(0).set(d);
      cache[tipo] = b; return b;
    }
    function para() {
      try { if (st.src) { st.src.stop(0); st.src.disconnect(); } } catch (e) { }
      try { if (st.gan) st.gan.disconnect(); } catch (e) { }
      try { if (st.el) st.el.pause(); } catch (e) { }
      st.src = null; st.gan = null; st.el = null; st.on = false;
    }
    function arranca(tipo, nivel) {
      para();
      nivel = nivel >= 1 && nivel <= 3 ? nivel : 2; st.tipo = tipo; st.nivel = nivel;
      if (tipo === 'no' || TIPOS.indexOf(tipo) < 0) return false;
      try {
        if (tipo === 'propio') {
          if (!st.url) return false;
          st.el = new Audio(st.url); st.el.loop = true; st.el.volume = VOLUMEN[nivel];
          var p = st.el.play(); if (p && p.catch) p.catch(function () { });
          st.on = true; return true;
        }
        var ctx = getCtx(); if (!ctx) return false;
        var s = ctx.createBufferSource(), g = ctx.createGain(), t = ctx.currentTime;
        s.buffer = buf(ctx, tipo); s.loop = true;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(GANANCIA[nivel], t + 0.4);
        s.connect(g); g.connect(ctx.destination); s.start(0);
        st.src = s; st.gan = g; st.on = true; return true;
      } catch (e) { para(); return false; }
    }
    function cambia(nivel) {
      nivel = nivel >= 1 && nivel <= 3 ? nivel : st.nivel; st.nivel = nivel;
      try {
        if (st.on && st.gan) { var ctx = getCtx(), t = ctx.currentTime; st.gan.gain.cancelScheduledValues(t); st.gan.gain.setValueAtTime(st.gan.gain.value, t); st.gan.gain.linearRampToValueAtTime(GANANCIA[nivel], t + 0.2); }
        if (st.on && st.el) st.el.volume = VOLUMEN[nivel];
      } catch (e) { }
    }
    function elige(file) {
      try { if (st.url && window.URL && URL.revokeObjectURL) URL.revokeObjectURL(st.url); } catch (e) { }
      st.url = null; st.nombre = '';
      if (!file) return false;
      try { st.url = URL.createObjectURL(file); st.nombre = String(file.name || 'audio').slice(0, 40); return true; } catch (e) { return false; }
    }
    return { arranca: arranca, para: para, cambia: cambia, elige: elige, hayPropio: function () { return !!st.url; }, nombrePropio: function () { return st.nombre; }, estado: function () { return { on: st.on, tipo: st.tipo, nivel: st.nivel }; } };
  }

  /* texto para el informe y los avisos: «cafetería, nivel medio» */
  function descripcion(tipo, nivel) { return tipo === 'no' ? 'sin ruido' : NOMBRES[tipo] + ', nivel ' + NIVELES[nivel]; }

  window.RuidoSuena = { genera: genera, crea: crea, descripcion: descripcion, NOMBRES: NOMBRES, NIVELES: NIVELES, TIPOS: TIPOS };
})();
