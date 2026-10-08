/* Tema 9: Plano cartesiano y transformaciones isométricas */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U, num = U.num, T = 'cart';
  const pt = (x, y) => `(${num(x)}, ${num(y)})`;
  const par = x => (x < 0 ? `(${num(x)})` : num(x));
  const nz = r => { let v; do { v = r.int(-5, 5); } while (v === 0); return v; };

  O.reg({ id: 'cart.coordenadas', topic: T, name: 'Leer coordenadas', mcOnly: true, gen(r, d) {
    const first = d === 1;
    const rng = first ? { x0: 0, x1: 9, y0: 0, y1: 9 } : { x0: -6, x1: 6, y0: -6, y1: 6 };
    const mk = () => first ? [r.int(1, 9), r.int(1, 9)] : [nz(r), nz(r)];
    const n = d === 3 ? 3 : 1, picks = [];
    let guard = 0;
    while (picks.length < n && guard++ < 100) { const p = mk(); if (!picks.some(q => q[0] === p[0] || q[1] === p[1])) picks.push(p); }
    if (picks.length < n) U.fail();
    const names = ['A', 'B', 'C'], target = r.int(0, n - 1), [x, y] = picks[target];
    if (x === y) U.fail();
    const cand = [pt(y, x), pt(-x, y), pt(x, -y), pt(x + 1, y), pt(x, y + 1), pt(x - 1, y), pt(x, y - 1), pt(-x, -y)];
    const wrong = cand.filter(c => first ? !c.includes('−') : true);
    return {
      text: `¿Cuáles son las coordenadas del punto ${names[target]}? (Se escribe primero el valor de x y luego el de y).`,
      svg: U.svgGrid({ ...rng, points: picks.map((p, i) => ({ x: p[0], y: p[1], label: names[i] })), label: 'Plano cartesiano con puntos' }),
      answer: pt(x, y), wrong,
      steps: [`Desde el origen, se lee primero el movimiento horizontal (x) y luego el vertical (y).`, `El punto ${names[target]} está en x = ${num(x)} e y = ${num(y)}: ${pt(x, y)}.`]
    };
  } });

  O.reg({ id: 'cart.distancia', topic: T, name: 'Distancias y áreas en el plano', gen(r, d) {
    if (d === 1) {
      const horiz = r.chance(0.5), k = r.int(1, 9), a = r.int(0, 9), b = r.int(0, 9);
      if (a === b) U.fail();
      const A = horiz ? [a, k] : [k, a], B = horiz ? [b, k] : [k, b], dist = Math.abs(a - b);
      return {
        text: `Los puntos A${pt(...A)} y B${pt(...B)} están en la misma ${horiz ? 'fila' : 'columna'}. ¿Cuántas unidades separan A de B?`,
        svg: U.svgGrid({ x0: 0, x1: 10, y0: 0, y1: 10, points: [{ x: A[0], y: A[1], label: 'A' }, { x: B[0], y: B[1], label: 'B' }], segs: [{ a: A, b: B, cls: 'ln hl' }] }),
        answer: dist, unit: 'unidades', wrong: [a + b, dist + 1, dist - 1, Math.max(a, b)],
        steps: [`Los dos puntos tienen ${horiz ? 'la misma coordenada y' : 'la misma coordenada x'}, así que solo hay que restar las otras coordenadas.`, `|${a} − ${b}| = ${dist} unidades.`]
      };
    }
    if (d === 2) {
      const horiz = r.chance(0.5), k = nz(r), a = -r.int(1, 6), b = r.int(1, 6);
      const A = horiz ? [a, k] : [k, a], B = horiz ? [b, k] : [k, b], dist = b - a;
      return {
        text: `Los puntos A${pt(...A)} y B${pt(...B)} están en la misma ${horiz ? 'fila' : 'columna'}. ¿Cuántas unidades separan A de B?`,
        svg: U.svgGrid({ x0: -7, x1: 7, y0: -7, y1: 7, cell: 20, points: [{ x: A[0], y: A[1], label: 'A' }, { x: B[0], y: B[1], label: 'B' }], segs: [{ a: A, b: B, cls: 'ln hl' }] }),
        answer: dist, unit: 'unidades', wrong: [Math.abs(b) - Math.abs(a) > 0 ? Math.abs(b) - Math.abs(a) : dist + 2, dist - 1, dist + 1, Math.abs(a) * b, Math.abs(a) + Math.abs(b) + 2],
        steps: [`A y B están a distinto lado del eje: se suman las distancias al eje.`, `${Math.abs(a)} + ${b} = ${dist} unidades.`, `(También: ${b} − (${num(a)}) = ${dist}.)`]
      };
    }
    const x1 = r.int(0, 4), x2 = r.int(x1 + 2, 10), y1 = r.int(0, 4), y2 = r.int(y1 + 2, 10);
    const w = x2 - x1, h = y2 - y1;
    return {
      text: `Los puntos A${pt(x1, y1)}, B${pt(x2, y1)} y C${pt(x2, y2)} son tres vértices de un rectángulo ABCD. ¿Cuál es el área del rectángulo?`,
      svg: U.svgGrid({ x0: 0, x1: 11, y0: 0, y1: 11, cell: 24, points: [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y1, label: 'B' }, { x: x2, y: y2, label: 'C' }], segs: [{ a: [x1, y1], b: [x2, y1], cls: 'ln hl' }, { a: [x2, y1], b: [x2, y2], cls: 'ln hl' }] }),
      answer: w * h, unit: 'unidades²', wrong: [2 * (w + h), w + h, w * h / 2, x2 * y2, (w + 1) * h],
      steps: [`Largo AB: ${x2} − ${x1} = ${w}. Ancho BC: ${y2} − ${y1} = ${h}.`, `Área = ${w} × ${h} = ${w * h} unidades cuadradas.`, `(El cuarto vértice sería D${pt(x1, y2)}.)`]
    };
  } });

  O.reg({ id: 'cart.transformar', topic: T, name: 'Traslaciones, reflexiones y rotaciones', mcOnly: true, gen(r, d) {
    if (d === 1) {
      const x = r.int(1, 6), y = r.int(1, 6), dx = r.int(1, 4), dy = r.int(1, 4), up = r.chance(0.5), right = r.chance(0.7);
      const sx = right ? 1 : -1, sy = up ? 1 : -1;
      if (x + sx * dx < 0 || y + sy * dy < 0) U.fail();
      const nx = x + sx * dx, ny = y + sy * dy;
      return {
        text: `El punto P${pt(x, y)} se traslada ${dx} ${dx === 1 ? 'unidad' : 'unidades'} ${right ? 'a la derecha' : 'a la izquierda'} y ${dy} ${dy === 1 ? 'unidad' : 'unidades'} ${up ? 'hacia arriba' : 'hacia abajo'}. ¿Cuáles son las nuevas coordenadas?`,
        svg: U.svgGrid({ x0: 0, x1: 10, y0: 0, y1: 10, points: [{ x, y, label: 'P' }] }),
        answer: pt(nx, ny), wrong: [pt(ny, nx), pt(x - sx * dx, y - sy * dy), pt(x + sx * dy, y + sy * dx), pt(x + sx * dx, y), pt(x, y + sy * dy)].filter(s => !s.includes('−')),
        steps: [`Moverse ${right ? 'a la derecha suma' : 'a la izquierda resta'} ${dx} a x: ${x} ${right ? '+' : '−'} ${dx} = ${nx}.`, `Moverse ${up ? 'hacia arriba suma' : 'hacia abajo resta'} ${dy} a y: ${y} ${up ? '+' : '−'} ${dy} = ${ny}.`, `Nuevas coordenadas: ${pt(nx, ny)}.`]
      };
    }
    let x, y;
    do { x = nz(r); y = nz(r); } while (Math.abs(x) === Math.abs(y));
    const all = {
      'ejeX': [x, -y], 'ejeY': [-x, y], 'ccw': [-y, x], 'cw': [y, -x], 'giro180': [-x, -y], 'diag': [y, x]
    };
    const choices = d === 2 ? ['ejeX', 'ejeY'] : ['ccw', 'cw', 'giro180', 'diag'];
    const k = r.pick(choices), res = all[k];
    const txt = {
      ejeX: `¿Cuáles son las coordenadas de su reflexión respecto del eje X (eje horizontal)?`,
      ejeY: `¿Cuáles son las coordenadas de su reflexión respecto del eje Y (eje vertical)?`,
      ccw: `Se rota 90° en sentido antihorario (contrario a las manecillas del reloj) con centro en el origen. ¿Cuáles son las coordenadas del punto rotado?`,
      cw: `Se rota 90° en sentido horario (como las manecillas del reloj) con centro en el origen. ¿Cuáles son las coordenadas del punto rotado?`,
      giro180: `Se rota 180° con centro en el origen. ¿Cuáles son las coordenadas del punto rotado?`,
      diag: `Se refleja respecto de la recta que pasa por el origen y por los puntos (1, 1), (2, 2), (3, 3)… ¿Cuáles son las coordenadas del punto reflejado?`
    }[k];
    const how = {
      ejeX: `Al reflejar respecto del eje X, x se mantiene y y cambia de signo: ${pt(x, -y)}.`,
      ejeY: `Al reflejar respecto del eje Y, y se mantiene y x cambia de signo: ${pt(-x, y)}.`,
      ccw: `Una rotación de 90° antihoraria cambia ${pt(x, y)} en (−y, x) = ${pt(-y, x)}.`,
      cw: `Una rotación de 90° horaria cambia ${pt(x, y)} en (y, −x) = ${pt(y, -x)}.`,
      giro180: `Una rotación de 180° cambia el signo de ambas coordenadas: ${pt(-x, -y)}.`,
      diag: `Al reflejar respecto de la diagonal se intercambian x e y: ${pt(y, x)}.`
    }[k];
    const wrong = Object.keys(all).filter(n => n !== k).map(n => pt(...all[n])).concat([pt(x, y)]);
    return {
      text: `El punto P${pt(x, y)} se transforma. ${txt}`,
      svg: U.svgGrid({ x0: -6, x1: 6, y0: -6, y1: 6, cell: 22, points: [{ x, y, label: 'P' }] }),
      answer: pt(...res), wrong, steps: [how, `Respuesta: ${pt(...res)}.`]
    };
  } });

  O.reg({ id: 'cart.movimientos', topic: T, name: 'Movimientos en la cuadrícula', gen(r, d) {
    for (let t = 0; t < 100; t++) {
      let x = r.int(2, 9), y = r.int(2, 9);
      const n = d === 1 ? 2 : d === 2 ? 3 : 4, moves = [], dirs = [['a la derecha', 1, 0], ['a la izquierda', -1, 0], ['hacia arriba', 0, 1], ['hacia abajo', 0, -1]];
      let cx = x, cy = y, ok = true;
      const partial = [];
      for (let i = 0; i < n; i++) {
        const dr = dirs[i === 0 ? r.int(0, 3) : (moves[i - 1][0] + r.int(1, 3)) % 4], k = r.int(1, 6);
        const idx = dirs.indexOf(dr);
        moves.push([idx, k]);
        cx += dr[1] * k; cy += dr[2] * k;
        if (cx < 0 || cy < 0 || cx > 20 || cy > 20) { ok = false; break; }
        partial.push([cx, cy]);
      }
      if (!ok) continue;
      const ask = d === 1 ? 'x' : d === 2 ? 'y' : 'suma';
      const ans = ask === 'x' ? cx : ask === 'y' ? cy : cx + cy;
      const mv = moves.map(([i, k]) => `${k} ${k === 1 ? 'unidad' : 'unidades'} ${dirs[i][0]}`).join(', luego ').replace(/, luego ([^,]+)$/, ' y luego $1');
      return {
        text: `Un punto parte en ${pt(x, y)} y se mueve ${mv}. ${ask === 'x' ? '¿Cuál es la coordenada x del punto final?' : ask === 'y' ? '¿Cuál es la coordenada y del punto final?' : '¿Cuánto suman las dos coordenadas del punto final?'}`,
        answer: ans, wrong: ask === 'suma' ? [cx, cy, ans + 2, ans - 2, x + y] : [ask === 'x' ? cy : cx, ans + 1, ans - 1, ask === 'x' ? x : y],
        steps: [`Se sigue cada movimiento: ${partial.map((p, i) => `${pt(...p)}`).join(' → ')}.`, `Punto final: ${pt(cx, cy)}.`, ask === 'x' ? `La coordenada x es ${cx}.` : ask === 'y' ? `La coordenada y es ${cy}.` : `Suma: ${cx} + ${cy} = ${cx + cy}.`]
      };
    }
    U.fail();
  } });

  const SHAPES = [['un cuadrado', 4], ['un rectángulo que no es cuadrado', 2], ['un triángulo equilátero', 3], ['un triángulo isósceles que no es equilátero', 1], ['un rombo que no es cuadrado', 2],
    ['un pentágono regular', 5], ['un hexágono regular', 6], ['un paralelogramo que no es rectángulo ni rombo', 0], ['un triángulo escaleno', 0], ['un trapecio isósceles', 1]];
  const VSYM = new Set('AHIMOTUVWXY'.split(''));
  O.reg({ id: 'cart.simetria', topic: T, name: 'Ejes de simetría', gen(r, d) {
    if (d === 1 || (d === 2 && r.chance(0.4))) {
      const [name, n] = r.pick(SHAPES.filter(s => s[1] > 0));
      return {
        text: `¿Cuántos ejes de simetría tiene ${name}?`, answer: n,
        wrong: [n + 1, n - 1 > 0 ? n - 1 : n + 2, n * 2, 0, 4],
        steps: [`Un eje de simetría divide la figura en dos mitades que coinciden al doblar.`, `${name[0].toUpperCase() + name.slice(1)} tiene ${n} ${n === 1 ? 'eje' : 'ejes'} de simetría.`]
      };
    }
    if (d === 2) {
      const [a, b] = r.sample(SHAPES, 2);
      return {
        text: `Si se suman los ejes de simetría de ${a[0]} y de ${b[0]}, ¿cuánto se obtiene?`, answer: a[1] + b[1],
        wrong: [a[1] * b[1], a[1] + b[1] + 1, a[1] + b[1] - 1, Math.max(a[1], b[1])].filter(v => v !== a[1] + b[1]),
        steps: [`${a[0][0].toUpperCase() + a[0].slice(1)} tiene ${a[1]} ejes.`, `${b[0][0].toUpperCase() + b[0].slice(1)} tiene ${b[1]} ejes.`, `Total: ${a[1]} + ${b[1]} = ${a[1] + b[1]}.`]
      };
    }
    const words = ['MATEMATICA', 'OLIMPIADA', 'TRIANGULO', 'PERIMETRO', 'FRACCION', 'PROBLEMA', 'DIVISORES', 'MULTIPLO', 'DECIMAL', 'VOLUMEN', 'GEOMETRIA', 'PROPORCION', 'SIMETRIA', 'AUTOMOVIL', 'UNIVERSO'];
    const w = r.pick(words), good = w.split('').filter(c => VSYM.has(c)), cnt = good.length;
    return {
      text: `Las letras A, H, I, M, O, T, U, V, W, X e Y tienen un eje de simetría vertical (se ven iguales a cada lado de una línea vertical). ¿Cuántas letras de la palabra ${w} tienen un eje de simetría vertical?`, answer: cnt,
      wrong: [cnt + 1, cnt - 1, w.length - cnt, new Set(good).size],
      steps: [`Se revisa cada letra de ${w.split('').join(' ')}.`, `Tienen eje vertical: ${good.join(', ')}.`, `En total son ${cnt} letras.`]
    };
  } });

  O.reg({ id: 'cart.area_poligono', topic: T, name: 'Área de figuras en el plano', dev: true, gen(r, d) {
    if (d < 3) {
      const neg = d === 2;
      const a = neg ? r.int(-5, 1) : r.int(0, 3), c = a + r.int(2, 6), b = neg ? r.int(-5, 0) : r.int(0, 3), f = b + r.int(2, 6), e = r.int(a, c);
      const base = c - a, h = f - b;
      if ((base * h) % 2) U.fail();
      const rg = neg ? { x0: -6, x1: 8, y0: -6, y1: 8, cell: 20 } : { x0: 0, x1: 10, y0: 0, y1: 10, cell: 24 };
      if (c > rg.x1 || f > rg.y1) U.fail();
      return {
        text: `Los vértices de un triángulo son A${pt(a, b)}, B${pt(c, b)} y C${pt(e, f)}. ¿Cuál es su área en unidades cuadradas?`,
        svg: U.svgGrid({ ...rg, points: [{ x: a, y: b, label: 'A' }, { x: c, y: b, label: 'B' }, { x: e, y: f, label: 'C' }], polys: [{ pts: [[a, b], [c, b], [e, f]], cls: 'shape' }], segs: [{ a: [e, f], b: [e, b], cls: 'ln dash' }] }),
        answer: base * h / 2, unit: 'unidades²', wrong: [base * h, base + h, base * h / 2 + base, (base + h) / 2 | 0, Math.abs(e - a) * h / 2 | 0],
        steps: [`La base AB es horizontal: ${num(c)} − ${par(a)} = ${base} unidades.`, `La altura es la distancia vertical de C a la base: ${num(f)} − ${par(b)} = ${h} unidades.`, `Área = base × altura ÷ 2 = ${base} × ${h} ÷ 2 = ${base * h / 2} unidades cuadradas.`]
      };
    }
    const y0 = r.int(0, 3), hh = r.int(2, 6), y1 = y0 + hh, x1 = r.int(0, 3), x2 = x1 + r.int(4, 8), x3 = x1 + r.int(0, 2), x4 = x3 + r.int(2, 5);
    const B = x2 - x1, bb = x4 - x3;
    if (((B + bb) * hh) % 2 || x4 > 11 || B === bb || y1 > 9) U.fail();
    return {
      text: `El trapecio ABCD tiene vértices A${pt(x1, y0)}, B${pt(x2, y0)}, C${pt(x4, y1)} y D${pt(x3, y1)}. ¿Cuál es su área en unidades cuadradas?`,
      svg: U.svgGrid({ x0: 0, x1: 12, y0: 0, y1: 10, cell: 22, points: [{ x: x1, y: y0, label: 'A' }, { x: x2, y: y0, label: 'B' }, { x: x4, y: y1, label: 'C' }, { x: x3, y: y1, label: 'D' }], polys: [{ pts: [[x1, y0], [x2, y0], [x4, y1], [x3, y1]], cls: 'shape' }] }),
      answer: (B + bb) * hh / 2, unit: 'unidades²', wrong: [(B + bb) * hh, B * hh, bb * hh, (B + bb) / 2 * hh + hh, B * bb],
      steps: [`Las bases son horizontales: AB = ${x2} − ${x1} = ${B} y DC = ${x4} − ${x3} = ${bb}.`, `La altura es la distancia vertical entre las bases: ${y1} − ${y0} = ${hh}.`, `Área = (base mayor + base menor) × altura ÷ 2 = (${B} + ${bb}) × ${hh} ÷ 2 = ${(B + bb) * hh / 2}.`]
    };
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
