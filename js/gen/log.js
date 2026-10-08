/* Tema 11: Lógica y razonamiento tipo olimpiada */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U, num = U.num, $ = U.money, T = 'log';

  O.reg({ id: 'log.edades', topic: T, name: 'Problemas de edades', gen(r, d) {
    const [p1, p2] = U.persons(r, 2);
    if (d === 1) {
      const b = r.int(5, 20), diff = r.int(2, 12), a = b + diff, S = a + b;
      return {
        text: `${p1.name} y ${p2.name} tienen entre los dos ${S} años. ${p1.name} tiene ${diff} años más que ${p2.name}. ¿Cuántos años tiene ${p1.name}?`, answer: a, unit: 'años',
        wrong: [S / 2, b, S - diff, diff, a + 1, a - 1],
        steps: [`Si ${p1.name} tuviera la edad de ${p2.name}, la suma sería ${S} − ${diff} = ${S - diff}.`, `Entonces ${p2.name} tiene ${S - diff} ÷ 2 = ${b} años.`, `${p1.name} tiene ${b} + ${diff} = ${a} años.`]
      };
    }
    if (d === 2) {
      if (r.chance(0.5)) {
        const k = r.pick([2, 3, 4, 5]), x = r.int(4, 14), S = (k + 1) * x;
        return {
          text: `Hoy ${p1.name} tiene ${k === 2 ? 'el doble' : k === 3 ? 'el triple' : `${k} veces`} de la edad de ${p2.name}. Entre los dos suman ${S} años. ¿Cuántos años tiene ${p1.name}?`, answer: k * x, unit: 'años',
          wrong: [x, S / k | 0, S - k, S / 2, k * x + x],
          steps: [`Si ${p2.name} tiene 1 parte, ${p1.name} tiene ${k} partes: en total ${k + 1} partes.`, `Cada parte vale ${S} ÷ ${k + 1} = ${x}.`, `${p1.name} tiene ${k} × ${x} = ${k * x} años.`]
        };
      }
      const b = r.int(4, 15), diff = r.int(2, 10), a = b + diff, t = r.int(2, 8), S2 = a + b + 2 * t;
      return {
        text: `${p1.name} tiene ${diff} años más que ${p2.name}. Dentro de ${t} años, la suma de sus edades será ${S2} años. ¿Cuántos años tiene hoy ${p2.name}?`, answer: b, unit: 'años',
        wrong: [(S2 - diff) / 2 | 0, b + t, a, (S2 - 2 * t) / 2 | 0, b - 1],
        steps: [`Dentro de ${t} años cada uno tendrá ${t} años más, así que hoy suman ${S2} − ${2 * t} = ${S2 - 2 * t}.`, `Quitando la diferencia de ${diff}: ${S2 - 2 * t} − ${diff} = ${S2 - 2 * t - diff}; la mitad es la edad de ${p2.name}: ${b} años.`]
      };
    }
    for (let tr = 0; tr < 100; tr++) {
      const x = r.int(3, 12), k = r.pick([2, 3, 4]), t = r.int(1, 15), y = k * (x + t) - t;
      if (y > 70 || y <= x + 20) continue;
      return {
        text: `Hoy ${p1.name} tiene ${y} años y su hijo tiene ${x} años. ¿Dentro de cuántos años la edad de ${p1.name} será ${k === 2 ? 'el doble' : k === 3 ? 'el triple' : `${k} veces`} la edad de su hijo?`, answer: t, unit: 'años',
        wrong: [y - k * x, y - x, t + 1, t - 1 > 0 ? t - 1 : t + 2, (y + x) / k | 0],
        steps: [`Dentro de t años: ${y} + t = ${k} × (${x} + t).`, `${y} + t = ${k * x} + ${k}t → ${y - k * x} = ${k - 1}t.`, `t = ${y - k * x} ÷ ${k - 1} = ${t} años.`, `Comprobación: ${y + t} años y ${x + t} años: ${y + t} = ${k} × ${x + t}.`]
      };
    }
    U.fail();
  } });

  O.reg({ id: 'log.trabajar_atras', topic: T, name: 'Trabajar hacia atrás', dev: true, gen(r, d) {
    const nOps = d + 1;
    for (let tr = 0; tr < 200; tr++) {
      const s = r.int(2, 30);
      let v = s, ops = [], ok = true;
      for (let i = 0; i < nOps; i++) {
        const kinds = ['mul', 'add', 'sub', 'div'].filter(k => !ops.length || ops[ops.length - 1].k !== k);
        const k = r.pick(kinds);
        let a;
        if (k === 'mul') { a = r.int(2, 5); v *= a; }
        else if (k === 'add') { a = r.int(2, 20); v += a; }
        else if (k === 'sub') { if (v <= 4) { ok = false; break; } a = r.int(1, Math.min(20, v - 1)); v -= a; }
        else { const ds = [2, 3, 4, 5].filter(x => v % x === 0); if (!ds.length) { ok = false; break; } a = r.pick(ds); v /= a; }
        ops.push({ k, a });
      }
      if (!ok || v > 500 || v === s) continue;
      const ph = { mul: o => `lo multiplico por ${o.a}`, add: o => `le sumo ${o.a}`, sub: o => `le resto ${o.a}`, div: o => `lo divido por ${o.a}` };
      const story = ops.map(o => ph[o.k](o)).join(', luego ').replace(/, luego ([^,]+)$/, ' y luego $1');
      const inv = { mul: (x, a) => x / a, add: (x, a) => x - a, sub: (x, a) => x + a, div: (x, a) => x * a };
      let naive = v; ops.forEach(o => { naive = inv[o.k](naive, o.a); });
      const steps = []; let cur = v;
      for (let i = ops.length - 1; i >= 0; i--) {
        const o = ops[i], nx = inv[o.k](cur, o.a), sym = { mul: '÷', add: '−', sub: '+', div: '×' }[o.k];
        steps.push(`Deshacer "${ph[o.k](o)}": ${cur} ${sym} ${o.a} = ${nx}.`); cur = nx;
      }
      steps.push(`El número que pensé es ${s}.`);
      return {
        text: `Pienso un número. ${story[0].toUpperCase() + story.slice(1)} y obtengo ${v}. ¿Qué número pensé?`, answer: s,
        wrong: [naive, s + 1, s - 1, v - ops.filter(o => o.k === 'add').reduce((x, o) => x + o.a, 0), v / ops[0].a],
        steps: ['Se trabaja hacia atrás: se deshacen las operaciones en orden inverso, con la operación contraria.'].concat(steps)
      };
    }
    U.fail();
  } });

  O.reg({ id: 'log.conteo', topic: T, name: 'Contar posibilidades', gen(r, d) {
    const p = U.person(r);
    if (d === 1) {
      const a = r.int(2, 5), b = r.int(2, 5), c = r.int(2, 4);
      return {
        text: `${p.name} tiene ${a} poleras, ${b} pantalones y ${c} pares de zapatillas. ¿De cuántas formas distintas puede vestirse eligiendo una prenda de cada tipo?`, answer: a * b * c,
        wrong: [a + b + c, a * b, a * b + c, a * b * c + a, (a + b) * c],
        steps: [`Por cada polera hay ${b} pantalones, y por cada una de esas combinaciones hay ${c} zapatillas.`, `${a} × ${b} × ${c} = ${a * b * c} formas.`]
      };
    }
    if (d === 2) {
      if (r.chance(0.5)) {
        const n = r.int(5, 12);
        return {
          text: `En una reunión hay ${n} personas. Cada persona saluda con un apretón de manos a cada una de las demás, una sola vez por pareja. ¿Cuántos apretones de manos hay en total?`, answer: n * (n - 1) / 2,
          wrong: [n * (n - 1), n * n, n * (n + 1) / 2, n - 1, n * (n - 1) / 2 + n],
          steps: [`Cada persona saluda a ${n - 1} personas: ${n} × ${n - 1} = ${n * (n - 1)}.`, `Pero así cada saludo se contó dos veces (A con B y B con A).`, `Total: ${n * (n - 1)} ÷ 2 = ${n * (n - 1) / 2}.`]
        };
      }
      const m = r.int(4, 6), k = 3, ans = m * (m - 1) * (m - 2), digs = Array.from({ length: m }, (_, i) => i + 1);
      return {
        text: `¿Cuántos números de 3 cifras distintas se pueden formar usando los dígitos ${digs.join(', ').replace(/, (\d+)$/, ' y $1')}?`, answer: ans,
        wrong: [m ** k, m * k, ans / 2, m * (m - 1) * (m - 2) + m, ans - m],
        steps: [`Para la cifra de las centenas hay ${m} opciones.`, `Para las decenas quedan ${m - 1} opciones y para las unidades ${m - 2}.`, `${m} × ${m - 1} × ${m - 2} = ${ans}.`]
      };
    }
    const v = r.int(0, 2);
    if (v === 0) {
      const n = r.int(4, 6), f = Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1);
      return {
        text: `¿De cuántas maneras distintas pueden sentarse ${n} amigos en ${n} sillas puestas en una fila?`, answer: f,
        wrong: [n * n, n * (n - 1), f / n, f * n, f - n],
        steps: [`El primer asiento puede ocuparlo cualquiera de los ${n}; el segundo, uno de los ${n - 1} que quedan; y así sucesivamente.`, `${Array.from({ length: n }, (_, i) => n - i).join(' × ')} = ${f}.`]
      };
    }
    if (v === 1) {
      const ans = 4 * 4 * 3;
      return {
        text: `¿Cuántos números de 3 cifras distintas se pueden formar con los dígitos 0, 1, 2, 3 y 4?`, answer: ans,
        wrong: [5 * 4 * 3, 4 * 4 * 4, 5 * 5 * 5, ans + 12, 4 * 3 * 2],
        steps: [`La cifra de las centenas no puede ser 0: hay 4 opciones (1, 2, 3 o 4).`, `Para las decenas quedan 4 opciones (se puede usar 0, pero no el dígito ya usado).`, `Para las unidades quedan 3 opciones.`, `4 × 4 × 3 = ${ans}.`]
      };
    }
    const n = r.int(6, 10), tot = n * (n - 1) / 2;
    return {
      text: `En un torneo juegan ${n} equipos y cada equipo juega exactamente una vez contra cada uno de los demás. ¿Cuántos partidos se juegan en total?`, answer: tot,
      wrong: [n * (n - 1), n * n, tot + n, n - 1, tot - 1],
      steps: [`Cada equipo juega ${n - 1} partidos: ${n} × ${n - 1} = ${n * (n - 1)}.`, `Cada partido se contó dos veces, una por cada equipo: ${n * (n - 1)} ÷ 2 = ${tot}.`]
    };
  } });

  const BASE = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
  function magicSvg(grid, shown, target) {
    const c = 46, m = 6;
    let s = '';
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const x = m + j * c, y = m + i * c, isT = i === target[0] && j === target[1];
      s += U.sRect(x, y, c, c, isT ? 'shape hl' : 'shape');
      if (isT) s += U.sText(x + c / 2, y + c / 2, '?', 'lbl big');
      else if (shown[i][j]) s += U.sText(x + c / 2, y + c / 2, String(grid[i][j]), 'lbl big');
    }
    return U.svg(m * 2 + 3 * c, m * 2 + 3 * c, s, 'Cuadro mágico de 3 por 3 con algunas casillas completas');
  }
  O.reg({ id: 'log.cuadro_magico', topic: T, name: 'Cuadros mágicos', gen(r, d) {
    let g = BASE.map(row => row.slice());
    for (let k = r.int(0, 3); k > 0; k--) g = [0, 1, 2].map(i => [0, 1, 2].map(j => g[2 - j][i]));
    if (r.chance(0.5)) g = g.map(row => row.slice().reverse());
    const sc = d === 1 ? r.int(1, 2) : d === 2 ? r.int(1, 5) : r.int(2, 9), off = d === 1 ? r.int(0, 3) : d === 2 ? r.int(0, 10) : r.int(0, 20);
    g = g.map(row => row.map(v => v * sc + off));
    const S = 15 * sc + 3 * off, center = g[1][1];
    const shown = [[false, false, false], [false, false, false], [false, false, false]];
    const useRow = d === 1;
    let tr, tc;
    do { tr = r.int(0, 2); tc = r.int(0, 2); } while (tr === 1 && tc === 1);
    for (let j = 0; j < 3; j++) if (j !== tc) shown[tr][j] = true;
    let help;
    if (useRow) {
      let fr; do { fr = r.int(0, 2); } while (fr === tr);
      for (let j = 0; j < 3; j++) shown[fr][j] = true;
      help = [`La fila completa (${g[fr].join(' + ')}) suma ${S}, así que todas las filas, columnas y diagonales suman ${S}.`];
    } else {
      shown[1][1] = true;
      help = [`En un cuadro mágico de 3 × 3 el número del centro es la tercera parte de la suma mágica: ${center} × 3 = ${S}.`];
      if (d === 3) { const free = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (!shown[i][j] && !(i === tr && j === tc)) free.push([i, j]); const [a, b] = r.pick(free); shown[a][b] = true; }
    }
    const others = [0, 1, 2].filter(j => j !== tc).map(j => g[tr][j]), x = g[tr][tc];
    return {
      text: `En este cuadro mágico, todas las filas, columnas y diagonales suman lo mismo. ¿Qué número va en la casilla marcada con ?`,
      svg: magicSvg(g, shown, [tr, tc]), answer: x,
      wrong: [S - others[0], others[0] + others[1], S - others[1], x + sc, x - sc, center],
      steps: help.concat([`La fila de la casilla marcada tiene ${others.join(' y ')} más el número que falta: ${others.join(' + ')} + ? = ${S}.`, `? = ${S} − ${others[0] + others[1]} = ${x}.`])
    };
  } });

  O.reg({ id: 'log.sistemas', topic: T, name: 'Cabezas, patas y entradas', dev: true, gen(r, d) {
    const v = d === 1 ? 'animales' : d === 2 ? r.pick(['animales', 'entradas']) : r.pick(['arañas', 'entradas']);
    if (v === 'animales') {
      const h = r.int(d === 1 ? 3 : 8, d === 1 ? 10 : 25), k = r.int(d === 1 ? 3 : 8, d === 1 ? 10 : 25), N = h + k, P = 2 * h + 4 * k;
      if (h === k) U.fail();
      const askK = r.chance(0.5);
      return {
        text: `En un corral hay gallinas y conejos. En total se cuentan ${N} cabezas y ${P} patas. ¿Cuántos ${askK ? 'conejos' : 'gallinas'} hay?`, answer: askK ? k : h,
        wrong: askK ? [h, N / 2 | 0, P / 4 | 0, k + 1, k - 1] : [k, N / 2 | 0, P / 2 | 0, h + 1, h - 1],
        steps: [`Si los ${N} animales fueran gallinas, habría ${N} × 2 = ${2 * N} patas.`, `Sobran ${P} − ${2 * N} = ${P - 2 * N} patas; cada conejo tiene 2 patas más que una gallina.`, `Conejos: ${P - 2 * N} ÷ 2 = ${k}. Gallinas: ${N} − ${k} = ${h}.`]
      };
    }
    if (v === 'arañas') {
      const s = r.int(4, 18), f = r.int(4, 18), N = s + f, P = 8 * s + 6 * f;
      if (s === f) U.fail();
      return {
        text: `En un frasco hay arañas (8 patas) y moscas (6 patas). En total hay ${N} animales y ${P} patas. ¿Cuántas arañas hay?`, answer: s,
        wrong: [f, N / 2 | 0, P / 8 | 0, s + 1, s - 1],
        steps: [`Si los ${N} animales fueran moscas, habría ${N} × 6 = ${6 * N} patas.`, `Sobran ${P} − ${6 * N} = ${P - 6 * N} patas; cada araña tiene 2 patas más que una mosca.`, `Arañas: ${P - 6 * N} ÷ 2 = ${s}.`]
      };
    }
    const pa = r.pick([4000, 5000, 6000, 8000]), pc = r.pick([1000, 2000, 2500, 3000]), a = r.int(10, 60), c = r.int(10, 60), N = a + c, M = pa * a + pc * c;
    if (pa <= pc || a === c) U.fail();
    return {
      text: `En una función se vendieron ${N} entradas, algunas de adulto a ${$(pa)} y otras de niño a ${$(pc)}. En total se recaudaron ${$(M)}. ¿Cuántas entradas de adulto se vendieron?`, answer: a,
      wrong: [c, N / 2 | 0, M / pa | 0, a + 1, a - 1],
      steps: [`Si todas fueran de niño, se recaudaría ${N} × ${$(pc)} = ${$(N * pc)}.`, `Faltan ${$(M)} − ${$(N * pc)} = ${$(M - N * pc)}; cada entrada de adulto aporta ${$(pa - pc)} más.`, `Adultos: ${$(M - N * pc)} ÷ ${$(pa - pc)} = ${a}.`]
    };
  } });

  O.reg({ id: 'log.orden', topic: T, name: 'Ordenar con pistas', mcOnly: true, gen(r, d) {
    const k = d === 3 ? 5 : 4, people = U.persons(r, k), ps = people.map(p => p.name), order = r.shuffle(ps); // order[0] = más alto
    const fem = n => people.find(p => p.name === n).f;
    const alto = n => (fem(n) ? 'alta' : 'alto'), bajo = n => (fem(n) ? 'baja' : 'bajo');
    const clues = [];
    for (let i = 0; i < k - 1; i++) clues.push(r.chance(0.5) ? `${order[i]} es más ${alto(order[i])} que ${order[i + 1]}` : `${order[i + 1]} es más ${bajo(order[i + 1])} que ${order[i]}`);
    const shuffled = r.shuffle(clues);
    let question, ans, how;
    if (d === 1 || r.chance(0.35)) { question = '¿Quién tiene la mayor estatura?'; ans = order[0]; how = 'el primero de la lista'; }
    else if (d === 2 || r.chance(0.5)) { const low = r.chance(0.5); question = low ? '¿Quién tiene la menor estatura?' : '¿Quién tiene la segunda mayor estatura?'; ans = low ? order[k - 1] : order[1]; how = low ? 'el último de la lista' : 'el segundo de la lista'; }
    else { question = '¿Quién tiene la estatura del medio, con dos personas más altas y dos más bajas que ella?'; ans = order[2]; how = 'el que ocupa el medio'; }
    let opts = k === 4 ? ps : [ans, ...r.shuffle(ps.filter(x => x !== ans)).slice(0, 3)];
    return {
      text: `${k === 4 ? 'Cuatro' : 'Cinco'} amigos comparan sus estaturas. ${shuffled.join('. ')}. ${question}`, answer: ans, wrong: opts.filter(x => x !== ans),
      steps: [`Se ordenan las pistas encadenándolas: ${order.join(' > ')} (de más alto a más bajo).`, `La respuesta es ${how}: ${ans}.`]
    };
  } });

  function gridSvg(n, m) {
    const c = 30, mg = 8;
    let s = '';
    for (let i = 0; i <= n; i++) s += U.sLine(mg, mg + i * c, mg + m * c, mg + i * c, 'ln');
    for (let j = 0; j <= m; j++) s += U.sLine(mg + j * c, mg, mg + j * c, mg + n * c, 'ln');
    return U.svg(mg * 2 + m * c, mg * 2 + n * c, s, `Cuadrícula de ${n} por ${m}`);
  }
  O.reg({ id: 'log.cuadrados', topic: T, name: 'Contar cuadrados y rectángulos', gen(r, d) {
    const opts = d === 1 ? [['sq', 3, 3], ['sq', 2, 3], ['sq', 2, 2], ['sq', 3, 2]]
      : d === 2 ? [['sq', 4, 4], ['sq', 3, 4], ['sq', 4, 3], ['rect', 2, 2], ['rect', 2, 3], ['rect', 3, 2]]
        : [['rect', 3, 3], ['rect', 3, 4], ['rect', 4, 3], ['rect', 2, 5], ['sq', 5, 5], ['sq', 4, 5], ['sq', 5, 4], ['sq', 6, 6], ['sq', 8, 8]];
    const [kind, n, m] = r.pick(opts), mn = Math.min(n, m);
    let ans = 0; const parts = [];
    if (kind === 'sq') for (let k = 1; k <= mn; k++) { const c = (n - k + 1) * (m - k + 1); ans += c; parts.push(`de ${k}×${k}: ${(n - k + 1)} × ${(m - k + 1)} = ${c}`); }
    const c2 = x => x * (x + 1) / 2;
    if (kind === 'rect') ans = c2(n) * c2(m);
    const sq = (() => { let a = 0; for (let k = 1; k <= mn; k++) a += (n - k + 1) * (m - k + 1); return a; })();
    return {
      text: kind === 'sq' ? `En una cuadrícula de ${n} × ${m} cuadraditos, ¿cuántos cuadrados de cualquier tamaño se pueden contar?` : `En una cuadrícula de ${n} × ${m} cuadraditos, ¿cuántos rectángulos de cualquier tamaño (incluidos los cuadrados) se pueden contar?`,
      svg: gridSvg(n, m), answer: ans,
      wrong: kind === 'sq' ? [n * m, ans - 1, ans + 1, c2(n) * c2(m), ans + mn] : [sq, n * m, ans - c2(n), ans + 1, c2(n) + c2(m)],
      steps: kind === 'sq'
        ? [`Se cuentan por tamaño: ${parts.join('; ')}.`, `Total: ${ans}.`]
        : [`Un rectángulo queda determinado por 2 líneas horizontales y 2 verticales.`, `Líneas horizontales: ${n + 1}, formas de elegir 2: ${c2(n)}. Líneas verticales: ${m + 1}, formas de elegir 2: ${c2(m)}.`, `Total: ${c2(n)} × ${c2(m)} = ${ans}.`]
    };
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
