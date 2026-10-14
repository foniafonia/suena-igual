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
