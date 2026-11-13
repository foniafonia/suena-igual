/* Suena igual · familias de palabras (campos semánticos) para la regla «campo» (13/11/2026, pedido en Skool).
   Cada palabra está en UNA sola familia: las dudosas (pollo, que es animal y comida) se quedan fuera.
   Las palabras salen del banco del Snake y del de sílabas; las prendas que faltaban van en BANCO_CAMPOS, con su voz Piper. */
window.BANCO_CAMPOS = [["gorro", 2], ["bufanda", 3], ["guante", 2], ["abrigo", 3], ["zapatilla", 4], ["cinturón", 3], ["camiseta", 4], ["chaleco", 3]];
window.CAMPOS = {
  comida: { n: 'comida', w: ['arroz', 'azúcar', 'caramelo', 'chicle', 'chocolate', 'fresa', 'fruta', 'helado', 'jugo', 'leche', 'lechuga', 'limón', 'manzana', 'melón', 'mermelada', 'miel', 'naranja', 'nuez', 'pan', 'pastel', 'patata', 'pepino', 'piña', 'plátano', 'queso', 'sandía', 'sopa', 'tomate', 'uva', 'zanahoria', 'zumo', 'melocotón', 'nata', 'pera', 'pomelo', 'seta', 'lima', 'migas'] },
  ropa: { n: 'ropa', w: ['bota', 'calcetín', 'camisa', 'chaqueta', 'falda', 'pantalón', 'pañuelo', 'sombrero', 'vestido', 'zapato', 'pijama', 'gorro', 'bufanda', 'guante', 'abrigo', 'zapatilla', 'cinturón', 'camiseta', 'chaleco'] },
  animales: { n: 'animales', w: ['araña', 'ballena', 'burro', 'cocodrilo', 'conejo', 'dinosaurio', 'elefante', 'foca', 'gallina', 'gato', 'gusano', 'hipopótamo', 'jirafa', 'león', 'lobo', 'mariposa', 'mono', 'oso', 'paloma', 'pato', 'perro', 'pez', 'pájaro', 'rana', 'ratón', 'sapo', 'serpiente', 'tigre', 'tortuga', 'vaca', 'zorro', 'mofeta', 'mula', 'petirrojo', 'potro', 'poni', 'toro', 'topo', 'tiburón', 'tucán', 'loro', 'lagarto', 'nutria'] },
  cuerpo: { n: 'cuerpo', w: ['boca', 'cabeza', 'dedo', 'diente', 'nariz', 'ojo', 'pelo', 'pie', 'uña', 'mano', 'mejilla', 'labio', 'tobillo', 'nuca'] },
  casa: { n: 'cosas de casa', w: ['cama', 'mesa', 'silla', 'sillón', 'cuchara', 'cuchillo', 'plato', 'taza', 'vaso', 'lámpara', 'llave', 'espejo', 'toalla', 'reloj', 'sábana', 'tenedor', 'tetera', 'nevera', 'lavadora'] },
  transporte: { n: 'transportes', w: ['bicicleta', 'coche', 'moto', 'taxi', 'tren', 'helicóptero', 'metro'] }
};
