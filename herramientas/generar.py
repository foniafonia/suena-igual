"""Genera los PDF de la baraja de «Suena igual» (19/10/2026): uno por regla, pronunciación y tinta.

Cada PDF: las caras (9 por A4, 63 × 88 mm, centradas, con marcas de corte), los dorsos en espejo para imprimir a
doble cara girando por el borde largo, y la hoja de reglas. Todo vectorial, con las fuentes del juego (Atkinson
Hyperlegible y Jost). Las cartas salen de mazos.json, que vuelca node herramientas/mazos.js con el mismo código del juego.

Uso:  python3 herramientas/generar.py            (todas)      python3 herramientas/generar.py inicio-es   (una)
Salida: pdf/suena-igual-<regla>-<es|seseo>-<color|ahorro>.pdf
"""
import io, json, math, pathlib, sys, tempfile
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from reportlab.lib.colors import Color, HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as RLFont
from reportlab.pdfgen import canvas
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, KeepTogether, FrameBreak, ListFlowable, ListItem

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent
TMP = pathlib.Path(tempfile.mkdtemp(prefix='suena-fuentes-'))


def fuente(nombre, woff2, peso=None):
    t = TTFont(str(RAIZ / 'fuentes' / woff2))
    if peso and 'fvar' in t:
        t = instancer.instantiateVariableFont(t, {'wght': peso})
    t.flavor = None
    ruta = TMP / (nombre + '.ttf'); t.save(str(ruta))
    pdfmetrics.registerFont(RLFont(nombre, str(ruta)))


fuente('Atk', 'atkinson-hyperlegible-400-latin.woff2')
fuente('AtkB', 'atkinson-hyperlegible-700-latin.woff2')
fuente('Jost', 'jost-latin.woff2', 600)

W, H = 63.0, 88.0
X0, Y0 = 10.5, 16.5
PW, PH = 210.0, 297.0
COL = {'rojo': '#D9413A', 'azul': '#2B74C9', 'verde': '#25985A', 'amarillo': '#E8B21E'}
TXT = {'rojo': '#C2342D', 'azul': '#2B74C9', 'verde': '#1D7F49', 'amarillo': '#A87C00'}   # tonos oscuros para los símbolos grandes
MARINO, ORO, TINTA = '#123A5C', '#F4B93A', '#10231A'
PIE = 'Gabinete Fönia · ColmenIA'


class Hoja:
    """Dibuja con coordenadas en mm, origen arriba a la izquierda (como el SVG de la página)."""

    def __init__(self, c, ox=0.0, oy=0.0):
        self.c, self.ox, self.oy = c, ox, oy

    def p(self, x, y):
        return (self.ox + x) * mm, (PH - (self.oy + y)) * mm

    def rrect(self, x, y, w, h, r, fill=None, stroke=None, sw=0.3, fcol=None, alpha=1.0):
        c = self.c; c.saveState()
        if fill: c.setFillColor(HexColor(fill)); c.setFillAlpha(alpha)
        if stroke: c.setStrokeColor(HexColor(stroke)); c.setLineWidth(sw * mm)
        x1, y1 = self.p(x, y + h)
        c.roundRect(x1, y1, w * mm, h * mm, r * mm, stroke=1 if stroke else 0, fill=1 if fill else 0)
        c.restoreState()

    def clip_rrect(self, x, y, w, h, r):
        c = self.c; x1, y1 = self.p(x, y + h)
        pth = c.beginPath(); pth.roundRect(x1, y1, w * mm, h * mm, r * mm); c.clipPath(pth, stroke=0, fill=0)

    def line(self, x1, y1, x2, y2, col='#000000', sw=0.25, alpha=1.0, cap=0):
        c = self.c; c.saveState(); c.setStrokeColor(HexColor(col)); c.setLineWidth(sw * mm); c.setStrokeAlpha(alpha); c.setLineCap(cap)
        a, b = self.p(x1, y1), self.p(x2, y2); c.line(a[0], a[1], b[0], b[1]); c.restoreState()

    def circ(self, cx, cy, r, fill=None, stroke=None, sw=0.3, alpha=1.0):
        c = self.c; c.saveState()
        if fill: c.setFillColor(HexColor(fill)); c.setFillAlpha(alpha)
        if stroke: c.setStrokeColor(HexColor(stroke)); c.setLineWidth(sw * mm); c.setStrokeAlpha(alpha)
        a = self.p(cx, cy); c.circle(a[0], a[1], r * mm, stroke=1 if stroke else 0, fill=1 if fill else 0); c.restoreState()

    def poly(self, pts, fill=None, stroke=None, sw=0.3):
        c = self.c; c.saveState(); pth = c.beginPath()
        for i, (x, y) in enumerate(pts):
            a = self.p(x, y); (pth.moveTo if i == 0 else pth.lineTo)(a[0], a[1])
        pth.close()
        if fill: c.setFillColor(HexColor(fill))
        if stroke: c.setStrokeColor(HexColor(stroke)); c.setLineWidth(sw * mm); c.setLineJoin(1)
        c.drawPath(pth, stroke=1 if stroke else 0, fill=1 if fill else 0); c.restoreState()

    def texto(self, x, y, s, fnt, mmtam, col=TINTA, alin='c', alpha=1.0, esp=0):
        c = self.c; c.saveState(); c.setFillColor(HexColor(col)); c.setFillAlpha(alpha); c.setFont(fnt, mmtam * mm)
        a = self.p(x, y)
        if esp:
            ancho = pdfmetrics.stringWidth(s, fnt, mmtam * mm) + esp * mm * (len(s) - 1)
            t = c.beginText(a[0] - (ancho / 2 if alin == 'c' else (ancho if alin == 'd' else 0)), a[1]); t.setFont(fnt, mmtam * mm); t.setCharSpace(esp * mm); t.textOut(s); c.drawText(t)
        elif alin == 'c': c.drawCentredString(a[0], a[1], s)
        elif alin == 'd': c.drawRightString(a[0], a[1], s)
        else: c.drawString(a[0], a[1], s)
        c.restoreState()

    def ancho(self, s, fnt, mmtam):
        return pdfmetrics.stringWidth(s, fnt, mmtam * mm) / mm


def forma(h, palo, x, y, t, col, giro=False):
    s = -1 if giro else 1
    if palo == 'rojo':
        h.poly([(x, y - s * t), (x + t * 1.05, y + s * t * .8), (x - t * 1.05, y + s * t * .8)], fill=col, stroke='#ffffff', sw=.35)
    elif palo == 'azul':
        h.circ(x, y, t * .9, fill=col, stroke='#ffffff', sw=.35)
    elif palo == 'verde':
        h.poly([(x - t * .82, y - t * .82), (x + t * .82, y - t * .82), (x + t * .82, y + t * .82), (x - t * .82, y + t * .82)], fill=col, stroke='#ffffff', sw=.35)
    else:
        h.poly([(x, y - t), (x + t * .85, y), (x, y + t), (x - t * .85, y)], fill=col, stroke='#ffffff', sw=.35)


def trama(h, palo, x, y, w, hh, col, alpha):
    """Trama del palo sobre el rectángulo (x, y, w, hh), recortada por quien llame."""
    if palo == 'rojo':   # rayas a 45°
        paso = 2.4
        for k in range(-int(hh / paso) - 2, int(w / paso) + 3):
            h.line(x + k * paso, y + hh, x + k * paso + hh, y, col, 1.0, alpha)
    elif palo == 'azul':  # puntos
        for i in range(int(w / 2.6) + 1):
            for j in range(int(hh / 2.6) + 1):
                h.circ(x + 1.3 + i * 2.6, y + 1.3 + j * 2.6, .6, fill=col, alpha=alpha)
    elif palo == 'verde':  # líneas horizontales
        for j in range(int(hh / 2.4) + 1):
            h.line(x, y + j * 2.4 + .45, x + w, y + j * 2.4 + .45, col, .9, alpha)
    else:                  # cuadrícula en diagonal
        paso = 2.6
        for k in range(-int(hh / paso) - 2, int(w / paso) + 3):
            h.line(x + k * paso, y + hh, x + k * paso + hh, y, col, .7, alpha)
            h.line(x + k * paso, y, x + k * paso + hh, y + hh, col, .7, alpha)


def marco(h, ox, oy, palo, ahorro):
    c, col = h.c, COL[palo]
    c.saveState()
    g = Hoja(c, h.ox + ox, h.oy + oy)
    g.rrect(2.2, 2.2, W - 4.4, H - 4.4, 4, fill='#ffffff' if ahorro else col, stroke=col if ahorro else None, sw=.6)
    c.saveState(); g.clip_rrect(2.2, 2.2, W - 4.4, H - 4.4, 4)
    trama(g, palo, 2.2, 2.2, W - 4.4, H - 4.4, col if ahorro else '#ffffff', .55 if ahorro else .38)
    c.restoreState()
    g.rrect(6.2, 6.2, W - 12.4, H - 12.4, 2.6, fill='#ffffff', stroke=col if ahorro else None, sw=.35)
    forma(g, palo, 10.6, 11.4, 2.6, col)
    forma(g, palo, W - 10.6, H - 11.4, 2.6, col, giro=True)
    c.restoreState()
    return g


def tam_pal(w):
    return round(min(12, 44 / (len(w) * 0.6)) * 10) / 10


def carta_cara(c, x, y, k, ahorro):
    h = Hoja(c)
    tipo = k['tipo']
    if tipo == 'blanca':
        g = Hoja(c, x, y)
        g.rrect(2.2, 2.2, W - 4.4, H - 4.4, 4, fill='#ffffff', stroke='#9aa6a0', sw=.5)
        c.saveState(); c.setDash(1.2, 1.2); g.rrect(11, 28, W - 22, 24, 3, stroke='#9aa6a0', sw=.35); c.restoreState()
        g.texto(W / 2, 56, 'escribe aquí una palabra', 'Atk', 2.8, '#8a968f')
        g.texto(W / 2, 71, 'Carta en blanco', 'AtkB', 3.4, '#6b7a72')
    elif tipo == 'comodin':
        g = Hoja(c, x, y); cx, cy = W / 2, H / 2
        c.saveState(); g.clip_rrect(2.2, 2.2, W - 4.4, H - 4.4, 4)
        for palo, qx, qy in (('rojo', 0, 0), ('azul', cx, 0), ('amarillo', 0, cy), ('verde', cx, cy)):
            g.rrect(qx, qy, cx + .3, cy + .3, 0, fill='#ffffff' if ahorro else COL[palo])
            c.saveState(); p = c.beginPath(); a = g.p(qx, qy + cy); p.rect(a[0], a[1], cx * mm, cy * mm); c.clipPath(p, stroke=0, fill=0)
            trama(g, palo, qx, qy, cx, cy, COL[palo] if ahorro else '#ffffff', .55 if ahorro else .38); c.restoreState()
        c.restoreState()
        g.rrect(2.2, 2.2, W - 4.4, H - 4.4, 4, stroke='#222222', sw=.6) if ahorro else None
        g.rrect(6.2, 6.2, W - 12.4, H - 12.4, 2.6, fill='#ffffff', stroke='#222222' if ahorro else None, sw=.35)
        for palo, fx, fy in (('rojo', 10.6, 11.4), ('azul', W - 10.6, 11.4), ('amarillo', 10.6, H - 11.4), ('verde', W - 10.6, H - 11.4)):
            forma(g, palo, fx, fy, 2.2, COL[palo])
        pts = []
        for i in range(10):
            r = 4.6 if i % 2 else 11; a = math.pi / 5 * i - math.pi / 2; pts.append((cx + r * math.cos(a), 38 + r * math.sin(a)))
        g.poly(pts, fill='#222222', stroke='#222222', sw=.6)
        g.texto(W / 2, 72, 'Elige color', 'AtkB', 4.2, TINTA)
        g.texto(W / 2, H - 9.6, PIE, 'Atk', 1.9, '#8a968f')
        return
    else:
        g = marco(h, x, y, k['color'], ahorro)
        if tipo == 'palabra':
            tam = tam_pal(k['w']); g.texto(W / 2, 44 + tam * .34, k['w'], 'AtkB', tam)
        elif tipo == 'roba2':
            g.texto(W / 2, 46, '+2', 'Jost', 19, TXT[k['color']]); g.texto(W / 2, 59, 'Roba 2', 'AtkB', 4.2, TINTA)
        elif tipo == 'pasa':
            col = TXT[k['color']]
            g.circ(W / 2, 38, 10, stroke=col, sw=3); g.line(W / 2 - 7, 45, W / 2 + 7, 31, col, 3, 1.0, 1)
            g.texto(W / 2, 72, 'Pasa turno', 'AtkB', 4.2, TINTA)
        g.texto(W / 2, H - 9.6, PIE, 'Atk', 1.9, '#8a968f')


def carta_dorso(c, x, y, ahorro):
    g = Hoja(c, x, y); o = MARINO if ahorro else ORO; cx, cy = W / 2, H / 2 - 4
    g.rrect(2.2, 2.2, W - 4.4, H - 4.4, 4, fill='#ffffff' if ahorro else MARINO, stroke=MARINO, sw=.6)
    g.rrect(5, 5, W - 10, H - 10, 3, stroke=o, sw=.6)
    c.saveState(); c.setStrokeColor(HexColor(o)); c.setLineWidth(1.4 * mm)
    a = g.p(cx, cy); c.ellipse(a[0] - 19 * mm, a[1] - 12 * mm, a[0] + 19 * mm, a[1] + 12 * mm, stroke=1, fill=0); c.restoreState()
    # corchea: cabeza, plica y bandera
    c.saveState(); c.setFillColor(HexColor(o)); a = g.p(cx - 2.5, cy + 4.5); c.translate(a[0], a[1]); c.rotate(20)
    c.ellipse(-3.2 * mm, -2.3 * mm, 3.2 * mm, 2.3 * mm, stroke=0, fill=1); c.restoreState()
    g.rrect(cx + .2, cy - 8, 1.1, 12.8, 0, fill=o)
    c.saveState(); c.setFillColor(HexColor(o)); p = c.beginPath(); a = g.p(cx + 1.3, cy - 8); p.moveTo(*a)
    p.curveTo(*g.p(cx + 6.3, cy - 6), *g.p(cx + 6.3, cy - 1), *g.p(cx + 5.3, cy - 1)); p.curveTo(*g.p(cx + 4.6, cy - 4), *g.p(cx + 3.5, cy - 5), *g.p(cx + 1.3, cy - 5.2)); p.close(); c.drawPath(p, stroke=0, fill=1); c.restoreState()
    g.texto(cx, cy + 21, 'SUENA IGUAL', 'Jost', 5.2, o, esp=.55)


def marcas(c, linea):
    h = Hoja(c)
    for i in range(4):
        x, y = X0 + i * W, Y0 + i * H
        h.line(x, Y0 - 11, x, Y0 - 3); h.line(x, Y0 + 3 * H + 3, x, Y0 + 3 * H + 11)
        h.line(X0 - 7, y, X0 - 2.5, y); h.line(X0 + 3 * W + 2.5, y, X0 + 3 * W + 7, y)
    if linea:
        for r in range(3):
            for cc in range(3):
                h.rrect(X0 + cc * W, Y0 + r * H, W, H, 0, stroke='#b9c2bd', sw=.15)


def hoja_reglas(c, m):
    estilo = ParagraphStyle('t', fontName='Atk', fontSize=9.6, leading=13.4, textColor=HexColor(TINTA), spaceAfter=1.6 * mm)
    h3 = ParagraphStyle('h3', fontName='Jost', fontSize=12.6, leading=15, textColor=HexColor(MARINO), spaceBefore=3.6 * mm, spaceAfter=1.2 * mm)
    c.saveState(); c.setFillColor(HexColor(MARINO)); c.setFont('Jost', 9 * mm); c.drawString(16 * mm, (PH - 24) * mm, 'Suena igual')
    c.setFillColor(HexColor('#4f5f57')); c.setFont('Atk', 4 * mm); c.drawString(16 * mm, (PH - 31) * mm, 'Juego de cartas de sonidos · de 2 a 4 jugadores · a partir de 6 años · unos 15 minutos')
    c.setFillColor(HexColor('#8a968f')); c.setFont('Atk', 2.8 * mm); c.drawString(16 * mm, 9 * mm, 'Suena igual · ' + PIE); c.drawRightString((PW - 16) * mm, 9 * mm, m['titulo']); c.restoreState()
    bloques = []
    for b in m['bloques']:
        bl = [Paragraph(b['titulo'], h3)]
        for p in b['parrafos']: bl.append(Paragraph(p.replace('&', '&amp;'), estilo))
        if b['palos']:
            bl.append(Paragraph(' &nbsp;·&nbsp; '.join(x.replace(' · ', ': ') for x in b['palos']), ParagraphStyle('p', parent=estilo, fontName='AtkB')))
        if b['items']:
            its = [ListItem(Paragraph(i.replace('&', '&amp;'), estilo), leftIndent=11) for i in b['items']]
            bl.append(ListFlowable(its, bulletType='1' if b['ord'] else 'bullet', start='1' if b['ord'] else '•', bulletFontName='AtkB', bulletFontSize=9.6, leftIndent=11))
        bloques.append(bl)
    ancho = (PW - 32 - 9) / 2 * mm
    cols = [16 * mm, (16 + (PW - 32 - 9) / 2 + 9) * mm]
    col, y = 0, (PH - 38) * mm            # arriba de la columna, bajo el subtítulo
    fondo = 16 * mm
    for bl in bloques:
        alto = 0
        for f in bl: alto += f.wrapOn(c, ancho, 1000 * mm)[1] + f.getSpaceBefore() + f.getSpaceAfter()
        if y - alto < fondo:
            col += 1; y = (PH - 38) * mm
            if col > 1: raise SystemExit('La hoja de reglas no cabe en una página')
        for f in bl:
            y -= f.getSpaceBefore(); hh = f.wrapOn(c, ancho, 1000 * mm)[1]; f.drawOn(c, cols[col], y - hh); y -= hh + f.getSpaceAfter()


def pdf(m, ahorro, salida):
    c = canvas.Canvas(str(salida), pagesize=(PW * mm, PH * mm), pageCompression=1)
    c.setTitle('Suena igual · baraja para imprimir (%s)' % m['titulo']); c.setAuthor('Gabinete Fönia · ColmenIA'); c.setSubject('Cartas 63 × 88 mm, 9 por A4, con dorsos y hoja de reglas')
    cartas = m['cartas']; nh = math.ceil(len(cartas) / 9)
    for k in range(nh):
        grupo = cartas[k * 9:k * 9 + 9]
        marcas(c, True)
        for i, ca in enumerate(grupo): carta_cara(c, X0 + (i % 3) * W, Y0 + (i // 3) * H, ca, ahorro)
        c.showPage()
        marcas(c, True)
        for i in range(len(grupo)): carta_dorso(c, X0 + (2 - i % 3) * W, Y0 + (i // 3) * H, ahorro)
        c.showPage()
    hoja_reglas(c, m); c.showPage()
    c.save()


if __name__ == '__main__':
    mazos = json.loads((AQUI / 'mazos.json').read_text())
    (RAIZ / 'pdf').mkdir(exist_ok=True)
    sel = sys.argv[1:]
    n = 0
    for m in mazos:
        if sel and m['id'] not in sel: continue
        for ahorro in (False, True):
            nombre = 'suena-igual-%s-%s.pdf' % (m['id'], 'ahorro' if ahorro else 'color')
            pdf(m, ahorro, RAIZ / 'pdf' / nombre); n += 1
    print(n, 'PDF en', RAIZ / 'pdf')
