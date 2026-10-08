/* Tema 8: Ángulos, triángulos y cuadriláteros */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U, num = U.num, T = 'ang';
  const R = x => U.round(x, 6);
  const deg = x => `${num(x)}°`;
  const rad = a => a * Math.PI / 180;

  /** Arco de circunferencia entre dos ángulos (grados, antihorario) */
  function arc(cx, cy, rr, a1, a2) {
    const p = a => [cx + rr * Math.cos(rad(a)), cy - rr * Math.sin(rad(a))];
    const s = p(a1), e = p(a2);
    return `<path class="ln arc" d="M ${U.r1(s[0])} ${U.r1(s[1])} A ${rr} ${rr} 0 ${a2 - a1 > 180 ? 1 : 0} 0 ${U.r1(e[0])} ${U.r1(e[1])}"/>`;
  }

  function angleSvg(theta, mode, lab1, lab2) {
    // mode 'comp': el ángulo theta y el que falta hasta 90°. mode 'sup': hasta 180°.
    const ox = mode === 'sup' ? 120 : 40, oy = 130, len = 150, tot = mode === 'sup' ? 180 : 90;
    const pt = (a, l) => [ox + l * Math.cos(rad(a)), oy - l * Math.sin(rad(a))];
    let s = '';
    if (mode === 'sup') s += U.sLine(ox - len, oy, ox + len, oy);
    else s += U.sLine(ox, oy, ox + len, oy) + U.sLine(ox, oy, ox, oy - len);
    const e = pt(theta, len - 10);
    s += U.sLine(ox, oy, e[0], e[1], 'ln hl');
    s += arc(ox, oy, 34, 0, theta);
    s += arc(ox, oy, 50, theta, tot);
    const m1 = pt(theta / 2, 62), m2 = pt((theta + tot) / 2, 78);
    s += U.sText(m1[0], m1[1], lab1, 'lbl b');
    s += U.sText(m2[0], m2[1], lab2, 'lbl b');
    if (mode === 'comp') s += U.sRect(ox, oy - 12, 12, 12, 'rightang');
    return U.svg(mode === 'sup' ? 270 : 210, 150, s, mode === 'sup' ? 'Dos ángulos sobre una recta' : 'Dos ángulos que forman un ángulo recto');
  }

  O.reg({ id: 'ang.complementarios', topic: T, name: 'Ángulos complementarios y suplementarios', gen(r, d) {
    if (d === 1) {
      const comp = r.chance(0.5), th = comp ? r.int(10, 80) : r.int(20, 160);
      if (th % 5 !== 0 && r.chance(0.5)) U.fail();
      const tot = comp ? 90 : 180, ans = tot - th;
      return {
        text: `En la figura, los dos ángulos ${comp ? 'forman en conjunto un ángulo recto (90°)' : 'están sobre una recta y suman 180°'}. Uno de ellos mide ${deg(th)}. ¿Cuánto mide el ángulo marcado con x?`,
        svg: angleSvg(th, comp ? 'comp' : 'sup', deg(th), 'x'), answer: ans, unit: '°',
        wrong: [comp ? 180 - th : 90 - th > 0 ? 90 - th : th, th, tot + th > 0 ? 360 - th : th, ans + 10, ans - 10 > 0 ? ans - 10 : ans + 5],
        steps: [`Los dos ángulos suman ${tot}°.`, `x = ${tot}° − ${th}° = ${ans}°.`]
      };
    }
    if (d === 2) {
      const comp = r.chance(0.5), k = r.step(10, comp ? 60 : 80, 2), tot = comp ? 90 : 180;
      const ans = (tot + k) / 2;
      return {
        text: `Un ángulo mide ${k}° más que su ${comp ? 'complemento' : 'suplemento'}. ¿Cuánto mide ese ángulo?`, answer: ans, unit: '°',
        wrong: [ans - k, tot - ans, k, tot - k, ans + k / 2],
        steps: [`Si el ángulo es x, su ${comp ? 'complemento' : 'suplemento'} es ${tot} − x, y x = (${tot} − x) + ${k}.`, `Entonces los dos ángulos suman ${tot} y se diferencian en ${k}: el mayor es (${tot} + ${k}) ÷ 2 = ${ans}°.`]
      };
    }
    const comp = r.chance(0.5), m = comp ? r.pick([2, 5, 8]) : r.pick([2, 3, 4, 5, 8, 11]), tot = comp ? 90 : 180, ans = tot / (m + 1);
    return {
      text: `La medida del ${comp ? 'complemento' : 'suplemento'} de un ángulo es ${m === 2 ? 'el doble de' : m === 3 ? 'el triple de' : `${m} veces`} la medida de ese ángulo. ¿Cuánto mide el ángulo?`, answer: ans, unit: '°',
      wrong: [ans * m, tot / m, tot / 2, ans + 10, tot - ans - ans],
      steps: [`Si el ángulo es x, su ${comp ? 'complemento' : 'suplemento'} es ${m}x.`, `x + ${m}x = ${tot}°, es decir ${m + 1}x = ${tot}°.`, `x = ${tot} ÷ ${m + 1} = ${ans}°.`]
    };
  } });

  O.reg({ id: 'ang.triangulo', topic: T, name: 'Ángulos de un triángulo', gen(r, d) {
    if (d === 1) {
      const A = r.step(30, 85, 5), B = r.step(30, 85, 5), C = 180 - A - B;
      if (C < 25 || C > 110) U.fail();
      const pos = r.int(0, 2), labs = [deg(A), deg(B), deg(C)];
      labs[pos] = 'x';
      const known = [A, B, C].filter((_, i) => i !== pos);
      const ans = [A, B, C][pos];
      return {
        text: `En el triángulo de la figura, ¿cuánto mide el ángulo x?`, svg: U.svgTri(A, B, labs[0], labs[1], labs[2]), answer: ans, unit: '°',
        wrong: [360 - known[0] - known[1], 90 - known[0], known[0] + known[1], 180 - known[0], ans + 10],
        steps: [`Los ángulos interiores de un triángulo suman 180°.`, `x = 180° − ${known[0]}° − ${known[1]}° = ${ans}°.`]
      };
    }
    if (d === 2) {
      if (r.chance(0.5)) {
        const apex = r.step(20, 120, 2), b = (180 - apex) / 2;
        return {
          text: `En un triángulo isósceles, el ángulo desigual (el del vértice superior) mide ${deg(apex)}. ¿Cuánto mide cada uno de los ángulos iguales de la base?`,
          svg: U.svgTri(b, b, 'x', 'x', deg(apex)), answer: b, unit: '°',
          wrong: [180 - apex, apex, 90 - apex, b + 10, (180 - apex) / 3 | 0],
          steps: [`Los tres ángulos suman 180°: queda 180° − ${apex}° = ${180 - apex}° para los dos de la base.`, `Como son iguales, cada uno mide ${180 - apex} ÷ 2 = ${b}°.`]
        };
      }
      const b = r.step(30, 80, 5), apex = 180 - 2 * b;
      return {
        text: `Un triángulo isósceles tiene dos ángulos iguales de ${deg(b)} cada uno. ¿Cuánto mide el tercer ángulo?`, svg: U.svgTri(b, b, deg(b), deg(b), 'x'), answer: apex, unit: '°',
        wrong: [180 - b, b, 360 - 2 * b, apex + 10, 90 - b],
        steps: [`Los dos ángulos iguales suman ${b} + ${b} = ${2 * b}°.`, `El tercero mide 180° − ${2 * b}° = ${apex}°.`]
      };
    }
    if (r.chance(0.5)) {
      const A = r.int(30, 80), B = r.int(30, 80);
      if (A + B >= 150) U.fail();
      return {
        text: `En un triángulo, dos ángulos interiores miden ${deg(A)} y ${deg(B)}. ¿Cuánto mide el ángulo exterior correspondiente al tercer vértice (adyacente al ángulo interior desconocido)?`, answer: A + B, unit: '°',
        wrong: [180 - A - B, 180 - A, A + B + 10, 360 - A - B, 180 + A + B - 180 + 5],
        steps: [`El tercer ángulo interior mide 180° − ${A}° − ${B}° = ${180 - A - B}°.`, `El ángulo exterior y el interior suman 180°: 180° − ${180 - A - B}° = ${A + B}°.`, `(El exterior es igual a la suma de los dos interiores opuestos: ${A}° + ${B}°.)`]
      };
    }
    const k = r.pick([5, 10, 15, 20]), x = (180 - 3 * k) / 3;
    if (!Number.isInteger(x) || x - 0 < 20) U.fail();
    return {
      text: `Los ángulos de un triángulo miden x, x + ${k}° y x + ${2 * k}°. ¿Cuánto mide el ángulo mayor?`, answer: x + 2 * k, unit: '°',
      wrong: [x, x + k, 180 - x, x + 2 * k + 10, 60 + 2 * k],
      steps: [`Suman 180°: x + (x + ${k}) + (x + ${2 * k}) = 180 → 3x + ${3 * k} = 180.`, `3x = ${180 - 3 * k}, así que x = ${x}°.`, `El mayor es x + ${2 * k} = ${x + 2 * k}°.`]
    };
  } });

  O.reg({ id: 'ang.cuad_angulos', topic: T, name: 'Ángulos de cuadriláteros', gen(r, d) {
    if (d === 1) {
      const a = r.step(60, 120, 5), b = r.step(60, 130, 5), c = r.step(50, 110, 5), x = 360 - a - b - c;
      if (x < 40 || x > 140) U.fail();
      return {
        text: `Tres ángulos de un cuadrilátero miden ${deg(a)}, ${deg(b)} y ${deg(c)}. ¿Cuánto mide el cuarto ángulo?`, answer: x, unit: '°',
        wrong: [180 - a - b - c > 0 ? 180 - a - b - c : x + 10, a + b + c, x + 10, x - 10, 360 - a - b],
        steps: [`Los ángulos interiores de un cuadrilátero suman 360°.`, `${a} + ${b} + ${c} = ${a + b + c}.`, `Cuarto ángulo: 360° − ${a + b + c}° = ${x}°.`]
      };
    }
    if (d === 2) {
      const th = r.step(40, 80, 5);
      const kind = r.pick(['consec', 'opuesto', 'suma']);
      if (kind === 'consec') return {
        text: `Un paralelogramo tiene un ángulo de ${deg(th)}. ¿Cuánto mide cada ángulo consecutivo a ese ángulo?`, answer: 180 - th, unit: '°',
        wrong: [th, 360 - th, 90 - th, 180 - th + 10, 360 - 2 * th],
        steps: [`En un paralelogramo los ángulos consecutivos suman 180°.`, `180° − ${th}° = ${180 - th}°.`]
      };
      if (kind === 'opuesto') return {
        text: `En un romboide (paralelogramo) un ángulo mide ${deg(th)}. ¿Cuánto suman los otros tres ángulos?`, answer: 360 - th, unit: '°',
        wrong: [180 - th, 360 - 2 * th, 180 + th, 360 - th + 10],
        steps: [`Los cuatro ángulos suman 360°.`, `Los otros tres suman 360° − ${th}° = ${360 - th}°.`, `(Son ${th}° el opuesto y ${180 - th}° cada uno de los consecutivos.)`]
      };
      return {
        text: `Un rombo tiene un ángulo de ${deg(th)}. ¿Cuánto mide el ángulo más grande del rombo?`, answer: 180 - th, unit: '°',
        wrong: [th, 360 - 2 * th, 90 + th, 180 - th - 10],
        steps: [`En un rombo los ángulos opuestos son iguales y los consecutivos suman 180°.`, `Los ángulos son ${th}°, ${180 - th}°, ${th}° y ${180 - th}°; el mayor es ${180 - th}°.`]
      };
    }
    if (r.chance(0.5)) {
      const k = r.pick([10, 15, 20]), x = (360 - 6 * k) / 4;
      if (!Number.isInteger(x)) U.fail();
      return {
        text: `Los cuatro ángulos de un cuadrilátero miden x, x + ${k}°, x + ${2 * k}° y x + ${3 * k}°. ¿Cuánto mide el mayor de ellos?`, answer: x + 3 * k, unit: '°',
        wrong: [x, x + 2 * k, 90 + 3 * k, x + 3 * k + 10, 360 - 3 * x],
        steps: [`Suman 360°: 4x + ${6 * k} = 360, así que 4x = ${360 - 6 * k} y x = ${x}°.`, `El mayor es x + ${3 * k} = ${x + 3 * k}°.`]
      };
    }
    const th = r.step(55, 80, 5);
    return {
      text: `En un trapecio isósceles, los dos ángulos de la base mayor miden ${deg(th)} cada uno. ¿Cuánto mide cada ángulo de la base menor?`, answer: 180 - th, unit: '°',
      wrong: [th, 360 - 2 * th, 90 + th, 180 - th + 5, 90 - th],
      steps: [`Los ángulos que están sobre un mismo lado inclinado suman 180° (lados paralelos).`, `Cada ángulo de la base menor mide 180° − ${th}° = ${180 - th}°.`]
    };
  } });

  const QUAD = {
    'Cuadrado': 'tiene sus cuatro lados iguales y sus cuatro ángulos rectos.',
    'Rectángulo': 'tiene cuatro ángulos rectos, pero sus lados no son todos iguales.',
    'Rombo': 'tiene sus cuatro lados iguales, pero sus ángulos no son rectos.',
    'Romboide': 'tiene sus lados opuestos paralelos e iguales, pero ni sus lados ni sus ángulos son todos iguales.',
    'Trapecio': 'tiene exactamente un par de lados paralelos.',
    'Trapezoide': 'no tiene ningún par de lados paralelos.'
  };
  O.reg({ id: 'ang.clasificar', topic: T, name: 'Clasificar triángulos y cuadriláteros', mcOnly: true, gen(r, d) {
    if (d < 3 || r.chance(0.4)) {
      const names = d === 1 ? ['Cuadrado', 'Rectángulo', 'Rombo', 'Trapecio'] : Object.keys(QUAD);
      const target = r.pick(names), others = r.shuffle(Object.keys(QUAD).filter(n => n !== target)).slice(0, 3);
      return {
        text: `Un cuadrilátero ${QUAD[target]} ¿Cómo se llama este cuadrilátero?`, answer: target, wrong: others,
        steps: [`Las pistas coinciden con el ${target.toLowerCase()}: ${QUAD[target].replace(/\.$/, '')}.`, `Los otros se descartan: ${others.map(o => `el ${o.toLowerCase()} ${QUAD[o].replace(/\.$/, '')}`).join('; ')}.`]
      };
    }
    const kind = r.pick(['eq', 'iso', 'esc', 'no']);
    let a, b, c;
    if (kind === 'eq') { a = b = c = r.int(3, 15); }
    else if (kind === 'iso') { a = b = r.int(4, 15); c = r.int(2, 2 * a - 1); if (c === a) U.fail(); }
    else if (kind === 'esc') { do { a = r.int(3, 12); b = r.int(a + 1, 14); c = r.int(b + 1, a + b - 1 > b + 1 ? a + b - 1 : b + 2); } while (!(a + b > c) && (c = a + b - 1) <= b); if (a === b || b === c || a === c) U.fail(); }
    else { a = r.int(2, 8); b = r.int(2, 8); c = a + b + r.int(0, 4); }
    const ok = a + b > c && a + c > b && b + c > a;
    const sides = [a, b, c].sort((x, y) => x - y);
    let ans;
    if (!ok) ans = 'No se puede formar un triángulo';
    else if (a === b && b === c) ans = 'Equilátero';
    else if (a === b || b === c || a === c) ans = 'Isósceles';
    else ans = 'Escaleno';
    const opts = ['Equilátero', 'Isósceles', 'Escaleno', 'No se puede formar un triángulo'];
    return {
      text: `Se dispone de tres segmentos que miden ${r.shuffle([a, b, c]).map(x => x + ' cm').join(', ').replace(/, ([^,]+)$/, ' y $1')}. Con ellos se intenta construir un triángulo. ¿Cuál de las siguientes opciones describe correctamente el resultado?`,
      answer: ans, wrong: opts.filter(o => o !== ans),
      steps: ok
        ? [`Se comparan los lados ${sides.join(', ')}: ${ans === 'Equilátero' ? 'los tres son iguales' : ans === 'Isósceles' ? 'hay dos iguales' : 'los tres son distintos'}.`, `Es ${ans.toLowerCase()}.`]
        : [`Para formar un triángulo, los dos lados menores deben sumar más que el mayor.`, `${sides[0]} + ${sides[1]} = ${sides[0] + sides[1]}, que no supera a ${sides[2]}.`, `No se puede formar un triángulo.`]
    };
  } });

  O.reg({ id: 'ang.desigualdad_triangular', topic: T, name: 'Formar triángulos con varillas', mcOnly: true, gen(r, d) {
    const mx = d === 1 ? 12 : d === 2 ? 20 : 40;
    const fmt = t => t.slice().sort((x, y) => x - y).join(', ') + ' cm';
    let good;
    do { const a = r.int(2, mx), b = r.int(2, mx), lo = Math.abs(a - b) + 1, hi = a + b - 1; if (lo > hi) continue; good = [a, b, r.int(lo, hi)]; } while (!good);
    const bad = [];
    let guard = 0;
    while (bad.length < 3 && guard++ < 200) {
      const a = r.int(2, mx), b = r.int(2, mx);
      const c = bad.length === 0 && d >= 2 ? a + b : a + b + r.int(1, Math.max(2, d * 3));
      const t = [a, b, c];
      if (t.some(x => x > 2 * mx)) continue;
      if (!bad.some(q => fmt(q) === fmt(t)) && fmt(t) !== fmt(good)) bad.push(t);
    }
    if (bad.length < 3) U.fail();
    return {
      text: `Se dispone de varillas de distintos largos. ¿Con cuál de los siguientes grupos de tres varillas es posible construir un triángulo?`,
      answer: fmt(good), wrong: bad.map(fmt),
      steps: [`En un triángulo, la suma de los dos lados menores debe ser mayor que el lado mayor.`, ...[good, ...bad].map(t => { const s = t.slice().sort((x, y) => x - y); return `${fmt(t)}: ${s[0]} + ${s[1]} = ${s[0] + s[1]} ${s[0] + s[1] > s[2] ? 'es mayor que' : s[0] + s[1] === s[2] ? 'es igual a' : 'es menor que'} ${s[2]} → ${s[0] + s[1] > s[2] ? 'sí se puede' : 'no se puede'}.`; })]
    };
  } });

  function clockSvg(h, m) {
    const cx = 90, cy = 90, rr = 76;
    let s = `<circle class="shape" cx="${cx}" cy="${cy}" r="${rr}"/>`;
    for (let i = 0; i < 12; i++) {
      const a = rad(i * 30), x1 = cx + (rr - 7) * Math.sin(a), y1 = cy - (rr - 7) * Math.cos(a), x2 = cx + rr * Math.sin(a), y2 = cy - rr * Math.cos(a);
      s += U.sLine(x1, y1, x2, y2, 'ln');
    }
    [[12, 0], [3, 90], [6, 180], [9, 270]].forEach(([n, a]) => { s += U.sText(cx + (rr - 20) * Math.sin(rad(a)), cy - (rr - 20) * Math.cos(rad(a)), String(n), 'lbl b'); });
    const hh = 30 * (h % 12) + 0.5 * m, mm = 6 * m;
    s += U.sLine(cx, cy, cx + 38 * Math.sin(rad(hh)), cy - 38 * Math.cos(rad(hh)), 'ln hand-h');
    s += U.sLine(cx, cy, cx + 58 * Math.sin(rad(mm)), cy - 58 * Math.cos(rad(mm)), 'ln hand-m');
    s += U.sCirc(cx, cy, 4);
    return U.svg(180, 180, s, `Reloj que marca las ${h}:${String(m).padStart(2, '0')}`);
  }

  O.reg({ id: 'ang.reloj', topic: T, name: 'Ángulo entre las manecillas', gen(r, d) {
    if (d === 1 && r.chance(0.5)) {
      if (r.chance(0.5)) {
        const m = r.step(5, 55, 5);
        return {
          text: `El minutero de un reloj gira durante ${m} minutos. ¿Cuántos grados recorre en ese tiempo?`, answer: m * 6, unit: '°',
          wrong: [m * 30, m * 12, m * 60 / 10 + 6, m * 6 + 30, m * 3],
          steps: [`En 60 minutos el minutero da una vuelta completa: 360°.`, `En 1 minuto recorre 360° ÷ 60 = 6°.`, `En ${m} minutos: ${m} × 6° = ${m * 6}°.`]
        };
      }
      const h0 = r.int(1, 6), h1 = h0 + r.int(2, 5);
      return {
        text: `¿Cuántos grados recorre la manecilla de las horas entre las ${h0}:00 y las ${h1}:00?`, answer: (h1 - h0) * 30, unit: '°',
        wrong: [(h1 - h0) * 6, (h1 - h0) * 60, (h1 - h0) * 15, h1 * 30, (h1 - h0) * 30 + 30],
        steps: [`En 12 horas la manecilla da una vuelta completa: 360°.`, `En 1 hora recorre 360° ÷ 12 = 30°.`, `De las ${h0}:00 a las ${h1}:00 pasan ${h1 - h0} horas: ${h1 - h0} × 30° = ${(h1 - h0) * 30}°.`]
      };
    }
    const h = r.int(1, 11), m = d === 1 ? 0 : d === 2 ? r.pick([15, 30, 45]) : r.pick([10, 20, 40, 50]);
    let ang = Math.abs(30 * h - 5.5 * m);
    if (ang > 180) ang = 360 - ang;
    ang = R(ang);
    const time = `${h}:${String(m).padStart(2, '0')}`;
    return {
      text: `¿Cuál es la medida del menor ángulo que forman las manecillas de un reloj a las ${time}?`, svg: clockSvg(h, m), answer: ang, unit: '°',
      wrong: [R(Math.abs(30 * h - 6 * m) > 180 ? 360 - Math.abs(30 * h - 6 * m) : Math.abs(30 * h - 6 * m)), R(360 - ang), R(30 * h > 180 ? 360 - 30 * h : 30 * h), R(ang + 15), R(ang + 30), R(Math.abs(ang - 30))],
      steps: [`En 1 hora la manecilla de las horas gira 30°, así que a las ${time} marca ${num(30 * h)}° + ${num(R(0.5 * m))}° = ${num(R(30 * h + 0.5 * m))}° (cada minuto avanza 0,5°).`,
        `El minutero marca ${m} × 6° = ${m * 6}°.`, `La diferencia es |${num(R(30 * h + 0.5 * m))} − ${m * 6}| = ${num(R(Math.abs(30 * h + 0.5 * m - 6 * m)))}°${Math.abs(30 * h + 0.5 * m - 6 * m) > 180 ? `; el ángulo menor es 360° − ese valor = ${num(ang)}°` : ''}.`]
    };
  } });

  O.reg({ id: 'ang.razon_angulos', topic: T, name: 'Ángulos y razones', dev: true, gen(r, d) {
    const variant = d === 1 ? 'tri' : d === 2 ? r.pick(['iso', 'tri']) : r.pick(['quad', 'iso', 'tri2']);
    if (variant === 'tri' || variant === 'tri2') {
      let ps, s, guard = 0;
      do { ps = [r.int(1, 7), r.int(1, 7), r.int(1, 7)].sort((a, b) => a - b); s = ps[0] + ps[1] + ps[2]; } while ((180 % s !== 0 || ps[0] === ps[2] || s < 6) && ++guard < 300);
      if (180 % s) U.fail();
      const u = 180 / s;
      const diff = variant === 'tri2';
      return {
        text: `Los ángulos de un triángulo están en la razón ${r.shuffle(ps).join(' : ')}. ${diff ? '¿Cuántos grados más mide el ángulo mayor que el menor?' : '¿Cuánto mide el ángulo mayor?'}`,
        answer: diff ? (ps[2] - ps[0]) * u : ps[2] * u, unit: '°',
        wrong: diff ? [ps[2] * u, ps[0] * u, u, (ps[2] - ps[0]) * u + u] : [ps[0] * u, ps[1] * u, u, 180 / ps[2], ps[2] * u + u],
        steps: [`Los ángulos suman 180° y hay ${ps.join(' + ')} = ${s} partes.`, `Cada parte mide 180° ÷ ${s} = ${u}°.`, diff ? `Diferencia: (${ps[2]} − ${ps[0]}) × ${u}° = ${(ps[2] - ps[0]) * u}°.` : `El mayor tiene ${ps[2]} partes: ${ps[2]} × ${u}° = ${ps[2] * u}°.`]
      };
    }
    if (variant === 'iso') {
      const k = r.pick([2, 3, 4, 7, 10]), b = 180 / (k + 2);
      return {
        text: `En un triángulo isósceles, la medida del ángulo desigual es ${k === 2 ? 'el doble de' : k === 3 ? 'el triple de' : `${k} veces`} la medida de cada uno de los ángulos iguales. ¿Cuánto mide el ángulo desigual?`,
        answer: k * b, unit: '°', wrong: [b, 180 - b, 180 - 2 * b, k * b + b, 180 / k],
        steps: [`Si cada ángulo igual mide x, el desigual mide ${k}x.`, `x + x + ${k}x = 180°, es decir ${k + 2}x = 180° → x = ${b}°.`, `El ángulo desigual mide ${k} × ${b}° = ${k * b}°.`]
      };
    }
    const sets = [[1, 2, 3, 4], [2, 3, 3, 4], [3, 4, 5, 6], [1, 2, 4, 5], [2, 2, 3, 5], [1, 3, 4, 4]];
    const ps = r.pick(sets), s = ps.reduce((a, b) => a + b, 0), u = 360 / s;
    if (!Number.isInteger(u)) U.fail();
    const mx = Math.max(...ps);
    return {
      text: `Los cuatro ángulos de un cuadrilátero están en la razón ${ps.join(' : ')}. ¿Cuánto mide el mayor?`, answer: mx * u, unit: '°',
      wrong: [u, Math.min(...ps) * u, mx * u + u, 360 / mx, 180 - mx],
      steps: [`Los ángulos de un cuadrilátero suman 360° y hay ${ps.join(' + ')} = ${s} partes.`, `Cada parte mide 360° ÷ ${s} = ${u}°.`, `El mayor tiene ${mx} partes: ${mx} × ${u}° = ${mx * u}°.`]
    };
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
