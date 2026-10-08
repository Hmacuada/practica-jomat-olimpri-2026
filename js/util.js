/* Utilidades matemáticas, de formato (es-CL) y de dibujo SVG compartidas por los generadores. */
(function (G) {
  'use strict';
  const O = G.OLI = G.OLI || {};
  const U = O.U = {};

  /* ---------- Registro de generadores ---------- */
  O.GENS = [];
  O.TOPICS = [
    { id: 'num', name: 'Números grandes y operaciones combinadas' },
    { id: 'div', name: 'Múltiplos, divisores, MCM y MCD' },
    { id: 'fra', name: 'Fracciones' },
    { id: 'dec', name: 'Decimales y porcentajes' },
    { id: 'raz', name: 'Razones y proporciones' },
    { id: 'pat', name: 'Patrones y ecuaciones' },
    { id: 'geo', name: 'Perímetro, área y volumen' },
    { id: 'ang', name: 'Ángulos, triángulos y cuadriláteros' },
    { id: 'cart', name: 'Plano cartesiano y transformaciones' },
    { id: 'dat', name: 'Datos, promedio y probabilidad' },
    { id: 'log', name: 'Lógica y razonamiento' }
  ];
  /** Registra un generador: {id, topic, name, dev?, mcOnly?, gen(r, d)} */
  O.reg = function (g) {
    // Si el generador se "rechaza" a sí mismo (U.fail), se vuelve a intentar con el mismo azar siguiente.
    const inner = g.gen;
    g.gen = function (r, d) {
      for (let i = 0; i < 25; i++) {
        try { return inner(r, d); } catch (e) { if (e.message !== 'reject') throw e; }
      }
      throw new Error('reject');
    };
    O.GENS.push(g);
  };

  /* ---------- Matemática básica ---------- */
  U.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
  U.lcm = (a, b) => a / U.gcd(a, b) * b;
  U.gcdAll = arr => arr.reduce((x, y) => U.gcd(x, y));
  U.lcmAll = arr => arr.reduce((x, y) => U.lcm(x, y));
  U.round = (x, d = 6) => Number(x.toFixed(d));
  U.fail = () => { throw new Error('reject'); };
  U.isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  U.factorize = n => {
    const f = []; let x = n;
    for (let p = 2; p * p <= x; p++) {
      let e = 0;
      while (x % p === 0) { x /= p; e++; }
      if (e) f.push([p, e]);
    }
    if (x > 1) f.push([x, 1]);
    return f;
  };
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  U.sup = e => String(e).split('').map(c => SUP[+c]).join('');
  U.factStr = n => U.factorize(n).map(([p, e]) => (e > 1 ? p + U.sup(e) : String(p))).join(' × ');
  U.divisors = n => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };

  /* ---------- Fracciones ---------- */
  // {isFrac, n, d, mixed?, raw?}. Por defecto se simplifica; raw=true conserva n/d tal cual.
  U.frac = (n, d = 1, mixed = false) => {
    if (d < 0) { n = -n; d = -d; }
    const g = U.gcd(n, d) || 1;
    return { isFrac: true, n: n / g, d: d / g, mixed };
  };
  U.raw = (n, d) => ({ isFrac: true, n, d, raw: true });
  U.fv = f => f.n / f.d;
  U.fadd = (a, b) => U.frac(a.n * b.d + b.n * a.d, a.d * b.d);
  U.fsub = (a, b) => U.frac(a.n * b.d - b.n * a.d, a.d * b.d);
  U.fmul = (a, b) => U.frac(a.n * b.n, a.d * b.d);
  U.fdiv = (a, b) => U.frac(a.n * b.d, a.d * b.n);
  /** Marcado de fracción para texto: [[n/d]] o [[w n/d]] (la interfaz lo dibuja bonito). */
  U.fr = (n, d) => `[[${n}/${d}]]`;
  U.mix = (w, n, d) => `[[${w} ${n}/${d}]]`;

  /* ---------- Formato es-CL ---------- */
  U.num = x => {
    x = U.round(x, 6);
    const neg = x < 0;
    const [i, f] = Math.abs(x).toString().split('.');
    const g = i.length >= 4 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : i;
    return (neg ? '−' : '') + g + (f ? ',' + f : '');
  };
  U.fmtFrac = f => {
    if (f.d === 1) return U.num(f.n);
    if (f.mixed && f.n > f.d) {
      const w = Math.floor(f.n / f.d), rem = f.n - w * f.d;
      return rem ? `[[${w} ${rem}/${f.d}]]` : U.num(w);
    }
    return `[[${f.n}/${f.d}]]`;
  };
  U.fmt = (v, unit) => {
    if (typeof v === 'string') return v;
    const s = v && v.isFrac ? U.fmtFrac(v) : U.num(v);
    if (!unit) return s;
    return unit === '$' ? '$' + s : unit === '°' ? s + '°' : s + ' ' + unit;
  };
  U.money = n => '$' + U.num(n);
  U.key = v => {
    if (typeof v === 'string') return 's:' + v;
    if (v && v.isFrac) { const g = U.gcd(v.n, v.d) || 1; return 'f:' + v.n / g + '/' + v.d / g; }
    return 'n:' + U.round(v, 6);
  };
  U.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Contextos ---------- */
  U.NAMES = [['Camila', 'f'], ['Matías', 'm'], ['Sofía', 'f'], ['Benjamín', 'm'], ['Valentina', 'f'], ['Joaquín', 'm'],
    ['Isidora', 'f'], ['Tomás', 'm'], ['Antonia', 'f'], ['Vicente', 'm'], ['Javiera', 'f'], ['Agustín', 'm'],
    ['Catalina', 'f'], ['Diego', 'm'], ['Fernanda', 'f'], ['Cristóbal', 'm'], ['Emilia', 'f'], ['Martín', 'm'],
    ['Florencia', 'f'], ['Sebastián', 'm'], ['Constanza', 'f'], ['Felipe', 'm']];
  U.person = r => { const [name, g] = r.pick(U.NAMES); return { name, f: g === 'f' }; };
  U.persons = (r, k) => r.sample(U.NAMES, k).map(([name, g]) => ({ name, f: g === 'f' }));

  /* ---------- SVG ---------- */
  U.svg = (w, h, inner, label) =>
    `<svg class="fig" viewBox="0 0 ${Math.round(w)} ${Math.round(h)}" style="max-width:${Math.round(w * 1.5)}px" role="img" aria-label="${U.esc(label || 'Figura del problema')}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  const r1 = x => Math.round(x * 10) / 10;
  U.r1 = r1;
  U.sText = (x, y, s, cls = 'lbl', anchor = 'middle') =>
    `<text class="${cls}" x="${r1(x)}" y="${r1(y)}" text-anchor="${anchor}" dominant-baseline="middle">${U.esc(s)}</text>`;
  U.sLine = (x1, y1, x2, y2, cls = 'ln') =>
    `<line class="${cls}" x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}"/>`;
  U.sPoly = (pts, cls = 'shape') =>
    `<polygon class="${cls}" points="${pts.map(p => r1(p[0]) + ',' + r1(p[1])).join(' ')}"/>`;
  U.sRect = (x, y, w, h, cls = 'shape') =>
    `<rect class="${cls}" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"/>`;
  U.sCirc = (x, y, rad, cls = 'pt') => `<circle class="${cls}" cx="${r1(x)}" cy="${r1(y)}" r="${rad}"/>`;

  /** Plano cartesiano. points:[{x,y,label}], polys:[{pts:[[x,y]..],cls}], segs:[{a:[x,y],b:[x,y],cls}] */
  U.svgGrid = o => {
    const { x0 = 0, x1 = 10, y0 = 0, y1 = 10, cell = 26, points = [], polys = [], segs = [], label = 'Plano cartesiano' } = o;
    const m = 26, W = (x1 - x0) * cell + m * 2, H = (y1 - y0) * cell + m * 2;
    const X = x => m + (x - x0) * cell, Y = y => m + (y1 - y) * cell;
    let s = '';
    for (let x = x0; x <= x1; x++) s += U.sLine(X(x), Y(y0), X(x), Y(y1), 'grid');
    for (let y = y0; y <= y1; y++) s += U.sLine(X(x0), Y(y), X(x1), Y(y), 'grid');
    if (x0 <= 0 && x1 >= 0) s += U.sLine(X(0), Y(y0), X(0), Y(y1), 'axis');
    if (y0 <= 0 && y1 >= 0) s += U.sLine(X(x0), Y(0), X(x1), Y(0), 'axis');
    for (let x = x0; x <= x1; x++) s += U.sText(X(x), Y(y0) + 14, String(x).replace('-', '−'), 'tick');
    for (let y = y0; y <= y1; y++) s += U.sText(X(x0) - 13, Y(y), String(y).replace('-', '−'), 'tick');
    polys.forEach(p => { s += U.sPoly(p.pts.map(q => [X(q[0]), Y(q[1])]), p.cls || 'shape'); });
    segs.forEach(g => { s += U.sLine(X(g.a[0]), Y(g.a[1]), X(g.b[0]), Y(g.b[1]), g.cls || 'ln'); });
    points.forEach(p => {
      s += U.sCirc(X(p.x), Y(p.y), 5);
      if (p.label) s += U.sText(X(p.x) + 11, Y(p.y) - 11, p.label, 'lbl b');
    });
    return U.svg(W, H, s, label);
  };

  /** Triángulo dado por ángulos A (izq.), B (der.) con etiquetas en cada vértice. */
  U.svgTri = (A, B, labA, labB, labC, title) => {
    const rad = d => d * Math.PI / 180, C = 180 - A - B, L = 200;
    const AC = L * Math.sin(rad(B)) / Math.sin(rad(C));
    const pa = [0, 0], pb = [L, 0], pc = [AC * Math.cos(rad(A)), AC * Math.sin(rad(A))];
    const pts = [pa, pb, pc];
    const minx = Math.min(...pts.map(p => p[0])), maxx = Math.max(...pts.map(p => p[0])), maxy = pc[1];
    const sc = Math.min(1, 240 / (maxx - minx), 150 / maxy), m = 34;
    const W = (maxx - minx) * sc + m * 2, H = maxy * sc + m * 2;
    const T = p => [m + (p[0] - minx) * sc, m + (maxy - p[1]) * sc];
    const P = pts.map(T), cen = [(P[0][0] + P[1][0] + P[2][0]) / 3, (P[0][1] + P[1][1] + P[2][1]) / 3];
    let s = U.sPoly(P, 'shape');
    [labA, labB, labC].forEach((lab, i) => {
      if (lab == null) return;
      const dx = cen[0] - P[i][0], dy = cen[1] - P[i][1], len = Math.hypot(dx, dy) || 1;
      s += U.sText(P[i][0] + dx / len * 27, P[i][1] + dy / len * 27, lab, 'lbl b');
    });
    return U.svg(W, H, s, title || 'Triángulo con ángulos');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
