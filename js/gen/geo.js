/* Tema 7: Perímetro, área y volumen (con figuras dibujadas por código) */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U, num = U.num, $ = U.money, T = 'geo';
  const R = x => U.round(x, 6);

  /* ---------- Dibujos ---------- */
  function rectSvg(w, h, labW, labH, title) {
    const sc = Math.min(230 / w, 140 / h), W = w * sc, H = h * sc, ml = 56, mt = 20;
    let s = U.sRect(ml, mt, W, H, 'shape');
    s += U.sText(ml + W / 2, mt + H + 16, labW);
    s += U.sText(ml - 8, mt + H / 2, labH, 'lbl', 'end');
    return U.svg(ml + W + 20, mt + H + 34, s, title || 'Rectángulo');
  }

  function lShapeSvg(W, H, w, h) {
    const sc = Math.min(220 / W, 150 / H), m = 44;
    const X = x => m + x * sc, Y = y => m + (H - y) * sc;
    const pts = [[0, 0], [W, 0], [W, H - h], [W - w, H - h], [W - w, H], [0, H]].map(p => [X(p[0]), Y(p[1])]);
    let s = U.sPoly(pts, 'shape');
    s += U.sText(X(W / 2), Y(0) + 16, `${W} cm`);
    s += U.sText(X(0) - 8, Y(H / 2), `${H} cm`, 'lbl', 'end');
    s += U.sText(X(W - w / 2), Y(H - h) - 13, `${w} cm`);
    s += U.sText(X(W - w) + 9, Y(H - h / 2), `${h} cm`, 'lbl', 'start');
    return U.svg(X(W) + 50, Y(0) + 34, s, 'Figura en forma de L con sus medidas');
  }

  function triSvg(kind, b, h, off, slant) {
    const sc = Math.min(230 / (b + (kind === 'par' ? off : 0)), 130 / h), m = 40;
    const X = x => m + x * sc, Y = y => m + (h - y) * sc;
    let pts;
    if (kind === 'tri') pts = [[0, 0], [b, 0], [off, h]];
    else pts = [[0, 0], [b, 0], [b + off, h], [off, h]];
    let s = U.sPoly(pts.map(p => [X(p[0]), Y(p[1])]), 'shape');
    s += U.sLine(X(off), Y(h), X(off), Y(0), 'ln dash');
    s += U.sRect(X(off) - (off > 0 ? 9 : 0), Y(0) - 9, 9, 9, 'rightang');
    s += U.sText(X(b / 2), Y(0) + 16, `${b} cm`);
    s += U.sText(X(off) + 6, Y(h / 2), `${h} cm`, 'lbl', 'start');
    s += U.sText(X(off / 2) - 8, Y(h / 2) - 8, `${slant} cm`, 'lbl', 'end');
    const maxX = kind === 'tri' ? b : b + off;
    return U.svg(X(maxX) + 40, Y(0) + 34, s, kind === 'tri' ? 'Triángulo con su base, altura y un lado' : 'Paralelogramo con su base, altura y un lado');
  }

  function prismSvg(l, a, h, labH) {
    const sc = 120 / Math.max(l, a, h), L = l * sc, Hh = h * sc, dx = a * sc * 0.5, dy = -a * sc * 0.4, fx = 50, fy = 36 + Math.abs(dy) + 0;
    const front = [[fx, fy + 0], [fx + L, fy], [fx + L, fy + Hh], [fx, fy + Hh]];
    const top = [[fx, fy], [fx + dx, fy + dy], [fx + L + dx, fy + dy], [fx + L, fy]];
    const right = [[fx + L, fy], [fx + L + dx, fy + dy], [fx + L + dx, fy + Hh + dy], [fx + L, fy + Hh]];
    let s = U.sPoly(top, 'shape soft') + U.sPoly(right, 'shape soft2') + U.sPoly(front, 'shape');
    s += U.sText(fx + L / 2, fy + Hh + 16, `${l} cm`);
    s += U.sText(fx - 8, fy + Hh / 2, labH || `${h} cm`, 'lbl', 'end');
    s += U.sText(fx + L + dx / 2 + 12, fy + Hh + dy / 2 + 14, `${a} cm`, 'lbl', 'start');
    return U.svg(fx + L + dx + 60, fy + Hh + 30, s, 'Prisma rectangular con largo, ancho y alto');
  }

  /* ---------- Generadores ---------- */
  O.reg({ id: 'geo.rectangulo', topic: T, name: 'Perímetro y área del rectángulo', gen(r, d) {
    const u = r.pick(['cm', 'm']);
    if (d === 1) {
      const w = r.int(5, 20), h = r.int(3, 14);
      if (w === h) U.fail();
      const area = r.chance(0.5), P = 2 * (w + h), A = w * h;
      return {
        text: `El rectángulo de la figura mide ${w} ${u} de largo y ${h} ${u} de ancho. ¿Cuál es su ${area ? 'área' : 'perímetro'}?`,
        svg: rectSvg(w, h, `${w} ${u}`, `${h} ${u}`), answer: area ? A : P, unit: area ? u + '²' : u,
        wrong: area ? [P, w + h, 2 * w + h, A + w] : [A, w + h, 2 * w + h, P + 2],
        steps: area ? [`Área = largo × ancho = ${w} × ${h} = ${A} ${u}².`] : [`Perímetro = 2 × (largo + ancho) = 2 × (${w} + ${h}) = ${P} ${u}.`]
      };
    }
    if (d === 2) {
      const w = r.int(6, 25), h = r.int(3, 18);
      if (w === h) U.fail();
      const P = 2 * (w + h), A = w * h;
      return {
        text: `Un rectángulo tiene perímetro ${P} ${u} y uno de sus lados mide ${w} ${u}. ¿Cuál es su área?`,
        svg: rectSvg(w, h, `${w} ${u}`, '?'), answer: A, unit: u + '²',
        wrong: [P * w, w * (P / 2), h, P, A + w, (P - w) * w],
        steps: [`La suma de largo y ancho es la mitad del perímetro: ${P} ÷ 2 = ${P / 2} ${u}.`, `El otro lado mide ${P / 2} − ${w} = ${h} ${u}.`, `Área = ${w} × ${h} = ${A} ${u}².`]
      };
    }
    if (r.chance(0.5)) {
      const a = r.int(3, 15), P = 4 * a;
      return {
        text: `El perímetro de un cuadrado es ${P} ${u}. ¿Cuál es su área?`, answer: a * a, unit: u + '²',
        wrong: [P * P, 2 * a, P, a * 4, a * a + a],
        steps: [`Un cuadrado tiene 4 lados iguales: ${P} ÷ 4 = ${a} ${u}.`, `Área = ${a} × ${a} = ${a * a} ${u}².`]
      };
    }
    const w = r.int(6, 24), h = r.int(3, 16);
    if (w === h) U.fail();
    return {
      text: `Un rectángulo tiene un área de ${w * h} ${u}² y uno de sus lados mide ${w} ${u}. ¿Cuál es su perímetro?`, svg: rectSvg(w, h, `${w} ${u}`, '?'),
      answer: 2 * (w + h), unit: u,
      wrong: [w * h, w + h, 2 * w + h, 2 * w * h, 2 * (w + h) + 2],
      steps: [`El otro lado mide ${w * h} ÷ ${w} = ${h} ${u}.`, `Perímetro = 2 × (${w} + ${h}) = ${2 * (w + h)} ${u}.`]
    };
  } });

  O.reg({ id: 'geo.figura_L', topic: T, name: 'Figuras compuestas', gen(r, d) {
    const W = r.int(8, 20), H = r.int(7, 16), w = r.int(2, W - 3), h = r.int(2, H - 3);
    const A = W * H - w * h, P = 2 * (W + H);
    const askP = d === 3 && r.chance(0.5);
    return {
      text: `La figura está formada quitando un rectángulo de una esquina de un rectángulo más grande. Observa las medidas. ¿Cuál es ${askP ? 'su perímetro' : 'su área'}?`,
      svg: lShapeSvg(W, H, w, h), answer: askP ? P : A, unit: askP ? 'cm' : 'cm²',
      wrong: askP ? [P + 2 * (w + h), W + H + w + h, W * H, P - 2 * w, P + w + h] : [W * H, W * H + w * h, (W - w) * H, W * H - w, (W - w) * (H - h)],
      steps: askP
        ? [`Si se "empujan" los lados escalonados hacia afuera, el perímetro no cambia: es igual al del rectángulo que la encierra.`, `Perímetro = 2 × (${W} + ${H}) = ${P} cm.`]
        : [`Se calcula el rectángulo completo: ${W} × ${H} = ${W * H} cm².`, `Se resta el rectángulo que falta: ${w} × ${h} = ${w * h} cm².`, `Área = ${W * H} − ${w * h} = ${A} cm².`]
    };
  } });

  const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
  O.reg({ id: 'geo.triangulo_paralelogramo', topic: T, name: 'Área de triángulos y paralelogramos', gen(r, d) {
    const [p, q, s] = r.pick(TRIPLES);
    const kind = d === 1 ? 'tri' : r.pick(['tri', 'par']);
    const off = p, h = q, b = off + r.int(3, 10), slant = s;
    if (kind === 'tri' && (b * h) % 2) U.fail();
    const svg = triSvg(kind, b, h, off, slant);
    if (d < 3) {
      const area = kind === 'tri' ? b * h / 2 : b * h;
      return {
        text: `Observa ${kind === 'tri' ? 'el triángulo' : 'el paralelogramo'}. La línea punteada es la altura. ¿Cuál es su área?`, svg, answer: area, unit: 'cm²',
        wrong: kind === 'tri' ? [b * h, b * slant / 2, (b + h) / 2 * 2, b * slant, area + b] : [b * slant, b * h / 2, 2 * (b + slant), area + b],
        steps: kind === 'tri'
          ? [`Se usan la base y la altura (la altura es la línea punteada, no el lado inclinado).`, `Área = base × altura ÷ 2 = ${b} × ${h} ÷ 2 = ${area} cm².`]
          : [`Se usan la base y la altura (la altura es la línea punteada, no el lado inclinado).`, `Área = base × altura = ${b} × ${h} = ${area} cm².`]
      };
    }
    const area = kind === 'tri' ? b * h / 2 : b * h;
    return {
      text: `${kind === 'tri' ? 'Un triángulo' : 'Un paralelogramo'} tiene un área de ${area} cm² y una altura de ${h} cm. ¿Cuánto mide su base?`, svg: triSvg(kind, b, h, off, slant).replace(`${b} cm`, '? cm'),
      answer: b, unit: 'cm', wrong: kind === 'tri' ? [area / h, b * 2, b / 2 | 0, area - h, area / slant | 0] : [area * h, b * 2, b - 1, area - h],
      steps: kind === 'tri'
        ? [`Área = base × altura ÷ 2, entonces base = Área × 2 ÷ altura.`, `Base = ${area} × 2 ÷ ${h} = ${b} cm.`]
        : [`Área = base × altura, entonces base = Área ÷ altura.`, `Base = ${area} ÷ ${h} = ${b} cm.`]
    };
  } });

  O.reg({ id: 'geo.prisma', topic: T, name: 'Volumen y superficie de prismas', gen(r, d) {
    if (d === 1) {
      const l = r.int(3, 12), a = r.int(2, 9), h = r.int(2, 10), V = l * a * h;
      return {
        text: `Un prisma rectangular mide ${l} cm de largo, ${a} cm de ancho y ${h} cm de alto. ¿Cuál es su volumen?`, svg: prismSvg(l, a, h),
        answer: V, unit: 'cm³', wrong: [l + a + h, 2 * (l * a + l * h + a * h), l * a, V + l * a, V - h],
        steps: [`Volumen = largo × ancho × alto = ${l} × ${a} × ${h} = ${V} cm³.`]
      };
    }
    if (d === 2) {
      const l = r.int(3, 14), a = r.int(2, 10), h = r.int(2, 12), S = 2 * (l * a + l * h + a * h);
      if (r.chance(0.35)) {
        const c = r.int(2, 12);
        return {
          text: `Un cubo tiene una arista de ${c} cm. ¿Cuál es el área de toda su superficie?`, answer: 6 * c * c, unit: 'cm²',
          wrong: [c ** 3, 4 * c * c, 6 * c, 12 * c, c * c],
          steps: [`Un cubo tiene 6 caras cuadradas iguales.`, `Cada cara: ${c} × ${c} = ${c * c} cm².`, `Superficie = 6 × ${c * c} = ${6 * c * c} cm².`]
        };
      }
      return {
        text: `Una caja con forma de prisma rectangular mide ${l} cm de largo, ${a} cm de ancho y ${h} cm de alto. ¿Cuál es el área de toda su superficie (las 6 caras)?`, svg: prismSvg(l, a, h),
        answer: S, unit: 'cm²', wrong: [l * a * h, l * a + l * h + a * h, 2 * l * a + 2 * l * h, 2 * (l * a + l * h), S - 2 * a * h],
        steps: [`Hay tres pares de caras iguales: ${l}×${a} = ${l * a}, ${l}×${h} = ${l * h} y ${a}×${h} = ${a * h}.`, `Superficie = 2 × (${l * a} + ${l * h} + ${a * h}) = 2 × ${l * a + l * h + a * h} = ${S} cm².`]
      };
    }
    if (r.chance(0.5)) {
      const l = r.pick([20, 30, 40, 50, 60, 80, 100]), a = r.pick([20, 30, 40, 50, 60]), h = r.pick([20, 30, 40, 50, 60]), V = l * a * h;
      return {
        text: `Una pecera con forma de prisma mide ${l} cm de largo, ${a} cm de ancho y ${h} cm de alto. ¿Cuántos litros de agua caben si se llena por completo? (1 litro = 1.000 cm³)`, svg: prismSvg(l, a, h),
        answer: V / 1000, unit: 'L', wrong: [V, V / 100, V / 10000, (l + a + h) / 10, V / 1000 + 10],
        steps: [`Volumen = ${l} × ${a} × ${h} = ${num(V)} cm³.`, `Como 1 litro son 1.000 cm³: ${num(V)} ÷ 1.000 = ${num(V / 1000)} litros.`]
      };
    }
    const l = r.int(4, 15), a = r.int(3, 12), h = r.int(3, 12), V = l * a * h;
    return {
      text: `Un prisma rectangular tiene un volumen de ${num(V)} cm³. Su largo es ${l} cm y su ancho es ${a} cm. ¿Cuánto mide su alto?`, svg: prismSvg(l, a, h, '? cm'),
      answer: h, unit: 'cm', wrong: [V / l, V - l * a, l * a / h | 0, h + 1, h - 1, V / (l + a)],
      steps: [`Volumen = largo × ancho × alto, entonces alto = Volumen ÷ (largo × ancho).`, `Largo × ancho = ${l} × ${a} = ${l * a}.`, `Alto = ${num(V)} ÷ ${l * a} = ${h} cm.`]
    };
  } });

  O.reg({ id: 'geo.baldosas', topic: T, name: 'Cubrir superficies', dev: true, gen(r, d) {
    const L = r.int(3, 9), A = r.int(3, 8), t = r.pick([25, 50]);
    const nx = 100 * L / t, ny = 100 * A / t, cnt = nx * ny;
    if (d === 1) return {
      text: `El piso de una sala rectangular mide ${L} m de largo y ${A} m de ancho. Se cubrirá con baldosas cuadradas de ${t} cm de lado. ¿Cuántas baldosas se necesitan?`, answer: cnt,
      wrong: [L * A, cnt * t / 100 | 0, nx + ny, L * A * 100 / t, cnt * 2],
      steps: [`En el largo caben ${L} m = ${L * 100} cm ÷ ${t} cm = ${nx} baldosas.`, `En el ancho caben ${A * 100} ÷ ${t} = ${ny} baldosas.`, `Total: ${nx} × ${ny} = ${cnt} baldosas.`]
    };
    if (d === 2) {
      const price = r.step(300, 1500, 100), tot = cnt * price;
      return {
        text: `El piso de una sala rectangular mide ${L} m de largo y ${A} m de ancho. Se cubrirá con baldosas cuadradas de ${t} cm de lado que cuestan ${$(price)} cada una. ¿Cuánto cuestan todas las baldosas?`, answer: tot, unit: '$',
        wrong: [cnt, L * A * price, cnt * price / 2, (nx + ny) * price, tot + price],
        steps: [`Baldosas en el largo: ${L * 100} ÷ ${t} = ${nx}. En el ancho: ${A * 100} ÷ ${t} = ${ny}.`, `Total de baldosas: ${nx} × ${ny} = ${cnt}.`, `Costo: ${cnt} × ${$(price)} = ${$(tot)}.`]
      };
    }
    const a = r.int(1, 2), b = r.int(1, 2), wall = L * A, cnt3 = (wall - a * b) * 10000 / (t * t);
    return {
      text: `Una pared rectangular de ${L} m de largo y ${A} m de alto se cubrirá con cerámicas cuadradas de ${t} cm de lado. La pared tiene una ventana rectangular de ${a} m por ${b} m que no se cubre. ¿Cuántas cerámicas se necesitan?`, answer: cnt3,
      wrong: [wall * 10000 / (t * t), (wall - a * b), (wall - a * b) * 100 / t, cnt3 + a * b * 10000 / (t * t), cnt3 + 1],
      steps: [`Área de la pared: ${L} × ${A} = ${wall} m². Área de la ventana: ${a} × ${b} = ${a * b} m².`, `Área a cubrir: ${wall} − ${a * b} = ${wall - a * b} m² = ${num((wall - a * b) * 10000)} cm².`, `Cada cerámica cubre ${t} × ${t} = ${t * t} cm².`, `Cerámicas: ${num((wall - a * b) * 10000)} ÷ ${t * t} = ${cnt3}.`]
    };
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
