# Suena igual

Juego de cartas de sonidos. Se echa una carta si es del **mismo color** o si su palabra **suena igual** que la de arriba, según la regla de la partida:

- el mismo sonido al **principio** (casa, queso y kilo casan: suena /k/);
- el mismo sonido al **final**;
- un **par mínimo**: R/L, B/P, T/D, K/G, S/Z (la baraja solo lleva palabras con uno de los dos sonidos);
- el mismo número de **sílabas**.

Se juzga por el sonido, no por la letra. Si se intenta echar una carta que no vale, el juego dice por qué y apunta qué dos sonidos se han confundido. Al acabar, un informe que se puede compartir.

**Jugar:** https://foniafonia.github.io/suena-igual/ · **Imprimir las cartas:** `imprimir.html`

- Contra la máquina o dos jugadores en el mismo aparato.
- La regla se elige en «Preparar una partida» o por enlace: `?regla=inicio|final|par|silabas&foco=r&par=rl|bp|td|kg|sz&modo=dos&mano=7&pista=1&pron=es|seseo`.
- Pronunciación: con seseo (`pron=seseo`, y por defecto en aparatos con español que no sea de España) salen de la baraja las palabras con Z, CE o CI, porque la voz es de España, y no se ofrece el par S/Z.
- Enlace por canal para saber de dónde llega la gente: `?c=wa|tg|fb|ig|sk|ln`. Con `?yo=1`, un aparato deja de contar.
- Sin registro; las partidas no salen del aparato. Privacidad: `privacidad.html`. Estadísticas: `estadisticas.html`.
- Material de apoyo: no sustituye a la logopeda.

Una pieza del laboratorio de **Gabinete Fönia** y **ColmenIA** · [Comunidad de logopedas](https://www.skool.com/logopedia-7339/about)

## Créditos

- Idea y criterio clínico: José Aserraf. Código propio. No usa el nombre, las cartas ni el arte de ningún juego comercial.
- Palabras y voz: el banco de 241 palabras del «Snake de palabras», con voz Piper (Open Home Foundation), modelo `es_ES-sharvard-medium`, licencia CC BY 3.0.
- Letras: Atkinson Hyperlegible (Braille Institute) y Jost (Owen Earl), SIL Open Font License 1.1.
- `fonetica.js` saca el sonido de la escritura con las reglas del castellano de España con yeísmo (c/qu/k, ce/ci/z, ge/gi/j, gue/gui, h muda, b = v, ll = y, r inicial y rr). No es una transcripción completa.

## Baraja para imprimir (19/10/2026)
- `imprimir.html`: la baraja completa de la regla elegida (40 cartas de palabra, o 36 en pares, 8 «Roba 2»/«Pasa turno», 2 «Elige color» y cartas en blanco hasta completar hoja), con ajuste de seseo, tinta normal o de ahorro, pista del sonido opcional y hoja de reglas.
- `pdf/`: 34 PDF listos (17 barajas × color/ahorro): caras 9 por A4 (63 × 88 mm, marcas de corte), dorsos en espejo para doble cara por el borde largo y hoja de reglas. Nombre: `suena-igual-<regla>-<es|seseo>-<color|ahorro>.pdf`.
- Se regeneran con `node herramientas/mazos.js` (vuelca las barajas del propio código del juego a `mazos.json`) y `python3 herramientas/generar.py` (reportlab; fuentes del juego incrustadas). Si cambia el banco de palabras o las reglas, hay que volver a pasarlos.
- Cada palo tiene color, forma (▲ ● ■ ◆) y trama propios: se distinguen en blanco y negro y con daltonismo.
