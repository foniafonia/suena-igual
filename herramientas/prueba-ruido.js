const vm = require('vm'), fs = require('fs');
const R = __dirname + '/../';
const w = { Math, Date, console, setTimeout, clearTimeout, Float32Array, JSON, URL: { createObjectURL() { return 'blob:x'; }, revokeObjectURL() {} }, Audio: function (u) { this.u = u; this.play = () => { w.__audioPlay = (w.__audioPlay || 0) + 1; }; this.pause = () => { w.__audioPause = (w.__audioPause || 0) + 1; }; } };
w.window = w; vm.createContext(w);
vm.runInContext(fs.readFileSync(R + 'ruido.js', 'utf8'), w);
const RS = w.RuidoSuena;
let fallos = 0; const ok = (n, c, x) => { if (!c) fallos++; console.log((c ? 'ok     ' : 'FALLO  ') + n + (x !== undefined ? '  ' + x : '')); };
function zcr(a) { let z = 0; for (let i = 1; i < a.length; i++) if ((a[i] >= 0) !== (a[i - 1] >= 0)) z++; return z / a.length; }
function rms(a) { let s = 0; for (const v of a) s += v * v; return Math.sqrt(s / a.length); }
function modula(a, sr) { const v = 2205, m = []; for (let i = 0; i + v <= a.length; i += v) { let s = 0; for (let k = 0; k < v; k++) s += a[i + k] ** 2; m.push(Math.sqrt(s / v)); } const mu = m.reduce((x, y) => x + y) / m.length; return Math.sqrt(m.reduce((x, y) => x + (y - mu) ** 2, 0) / m.length) / mu; }
const SR = 22050, res = {};
for (const t of ['blanco', 'calle', 'cafe']) {
  const a = RS.genera(t, SR, t === 'cafe' ? 10 : 8); res[t] = a;
  const nan = Array.prototype.some.call(a, v => !isFinite(v)), pico = a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  ok(t + ': largo ' + (a.length / SR).toFixed(1) + ' s, sin NaN, pico<1', a.length > SR * 7 && !nan && pico <= 0.95, 'pico ' + pico.toFixed(2));
  ok(t + ': RMS cerca de 0,25', Math.abs(rms(a) - 0.25) < 0.03, rms(a).toFixed(3));
  let dd = 0; for (let i = 1; i < a.length; i++) dd += (a[i] - a[i - 1]) ** 2; dd = Math.sqrt(dd / a.length);
  const salto = Math.abs(a[0] - a[a.length - 1]);
  ok(t + ': el bucle enlaza sin salto mayor que 4 veces el salto normal entre muestras', salto < 4 * dd, salto.toFixed(3) + ' frente a ' + dd.toFixed(3));
  const ventana = (ini) => rms(a.subarray(ini, ini + 4000)), cola = ventana(a.length - 4000), cab = ventana(0);
  ok(t + ': sin bache de volumen en la costura', cab / cola > 0.6 && cab / cola < 1.6, 'cabeza ' + cab.toFixed(3) + ' cola ' + cola.toFixed(3));
  console.log('        cruces por cero ' + zcr(a).toFixed(3) + ' · variación de volumen ' + modula(a, SR).toFixed(2));
}
ok('blanco: muy agudo (cruces > 0,4)', zcr(res.blanco) > 0.4);
ok('calle: grave (cruces < 0,2)', zcr(res.calle) < 0.2, zcr(res.calle).toFixed(3));
ok('cafe: intermedio (entre calle y blanco)', zcr(res.cafe) > zcr(res.calle) && zcr(res.cafe) < zcr(res.blanco), zcr(res.cafe).toFixed(3));
ok('calle: el volumen sube y baja (coches)', modula(res.calle, SR) > 0.25, modula(res.calle, SR).toFixed(2));
ok('blanco: volumen estable', modula(res.blanco, SR) < 0.1, modula(res.blanco, SR).toFixed(2));
ok('tipo desconocido da vacío', RS.genera('nada', SR, 1).length === 0);
// motor con AudioContext falso
const ev = [];
const ctx = { currentTime: 0, createBuffer(c, n, sr) { ev.push('buf ' + n); const d = new Float32Array(n); return { copyToChannel(x) { d.set(x); }, getChannelData() { return d; } }; },
  createBufferSource() { return { connect() { ev.push('src.conectado'); }, disconnect() {}, start() { ev.push('start'); }, stop() { ev.push('stop'); }, set buffer(b) { this._b = b; }, loop: false }; },
  createGain() { return { gain: { value: 0, setValueAtTime() {}, linearRampToValueAtTime(v) { ev.push('gan ' + v); }, cancelScheduledValues() {} }, connect() { ev.push('gan.conectado'); }, disconnect() {} }; }, destination: {} };
const M = RS.crea(() => ctx);
ok('arranca calle nivel 2', M.arranca('calle', 2) === true && M.estado().on && ev.includes('start') && ev.includes('gan 0.7'), ev.join(' | '));
M.cambia(3); ok('cambia a fuerte', ev.includes('gan 1.3'));
M.para(); ok('para', !M.estado().on && ev.includes('stop'));
ok('sin ruido no arranca', M.arranca('no', 2) === false && !M.estado().on);
ok('propio sin archivo no arranca', M.arranca('propio', 2) === false);
M.elige({ name: 'clase.mp3' }); ok('propio con archivo arranca (Audio en bucle)', M.arranca('propio', 1) === true && w.__audioPlay === 1 && M.nombrePropio() === 'clase.mp3');
M.para(); ok('propio para', w.__audioPause === 1);
ok('descripcion', RS.descripcion('cafe', 2) === 'cafetería, nivel medio' && RS.descripcion('no', 2) === 'sin ruido', RS.descripcion('cafe', 2));
const M2 = RS.crea(() => null); ok('sin AudioContext: no falla y no suena', M2.arranca('calle', 2) === false);
console.log(fallos ? 'FALLOS: ' + fallos : 'todo bien');
