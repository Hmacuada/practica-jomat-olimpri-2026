/* Tema 6: Patrones, secuencias y ecuaciones simples */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U, num = U.num, $ = U.money, T = 'pat';

  const seqText = (arr) => arr.map(num).join(', ') + ', …';

  O.reg({ id: 'pat.siguiente', topic: T, name: 'Continuar una secuencia', gen(r, d) {
    const kinds = d === 1 ? ['arit'] : d === 2 ? ['arit-', 'geo', 'alt'] : ['dif', 'fib', 'cuad'];
    const kind = r.pick(kinds);
    let seq = [], next, rule, wrong;
    if (kind === 'arit' || kind === 'arit-') {
      const k = r.int(2, 9), s = kind === 'arit' ? r.int(1, 30) : r.int(60, 99);
      const sg = kind === 'arit' ? 1 : -1;
      for (let i = 0; i < 5; i++) seq.push(s + sg * k * i);
      next = s + sg * k * 5;
      rule = `Cada término ${sg > 0 ? 'aumenta' : 'disminuye'} en ${k}.`;
      wrong = [next + sg * 1, next - sg * 1, seq[4] + sg * (k + 1), seq[4] + sg * (k - 1), seq[4] + sg * 2 * k];
    } else if (kind === 'geo') {
      const m = r.pick([2, 3, 4]), s = r.int(1, 4);
      for (let i = 0; i < 5; i++) seq.push(s * m ** i);
      next = s * m ** 5;
      rule = `Cada término es el anterior multiplicado por ${m}.`;
      wrong = [seq[4] + seq[4] - seq[3], seq[4] + m, seq[4] * (m + 1), seq[4] * m + m];
    } else if (kind === 'alt') {
      const a = r.int(2, 9), b = r.int(1, 6), s = r.int(1, 20);
      if (a === b) U.fail();
      seq = [s]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 ? a : b));
      next = seq[5]; seq = seq.slice(0, 5);
      rule = `Se suma alternadamente ${a} y ${b}: ${seq.map((v, i) => i === 0 ? v : `+${i % 2 ? a : b}`).slice(0, 3).join(' ')} …; el siguiente paso es +${5 % 2 ? a : b}.`;
      wrong = [seq[4] + a, seq[4] + b, seq[4] + a + b, next + 1];
    } else if (kind === 'dif') {
      const s = r.int(1, 10), d0 = r.int(1, 4);
      let cur = s; seq = [s];
      for (let i = 0; i < 4; i++) { cur += d0 + i; seq.push(cur); }
      next = cur + d0 + 4;
      rule = `Las diferencias van aumentando de 1 en 1: ${[0, 1, 2, 3].map(i => '+' + (d0 + i)).join(', ')}, y el siguiente paso es +${d0 + 4}.`;
      wrong = [seq[4] + (d0 + 3), seq[4] + (d0 + 5), seq[4] + 2 * (d0 + 3), next + 1];
    } else if (kind === 'fib') {
      const a = r.int(1, 5), b = r.int(1, 6);
      seq = [a, b]; for (let i = 2; i < 5; i++) seq.push(seq[i - 1] + seq[i - 2]);
      next = seq[4] + seq[3];
      rule = `Cada término es la suma de los dos anteriores: ${seq[3]} + ${seq[4]} = ${next}.`;
      wrong = [seq[4] * 2, seq[4] + seq[2], seq[4] + seq[3] + 1, seq[4] + seq[4] - seq[3]];
    } else {
      const c = r.int(0, 9);
      for (let n = 1; n <= 5; n++) seq.push(n * n + c);
      next = 36 + c;
      rule = `Los términos son los cuadrados 1, 4, 9, 16, 25… ${c ? `más ${c}` : ''}. El siguiente es 6² ${c ? `+ ${c} ` : ''}= ${next}.`;
      wrong = [seq[4] + 9, seq[4] + 10, seq[4] + 12, 6 * 6 + c + 1];
    }
    return { text: `¿Cuál es el siguiente número de esta secuencia?\n${seqText(seq)}`, answer: next, wrong, steps: [rule, `El siguiente número es ${num(next)}.`] };
  } });

  O.reg({ id: 'pat.termino_enesimo', topic: T, name: 'Término en una posición', gen(r, d) {
    const a = r.int(1, 20), k = r.int(2, 9), shown = [a, a + k, a + 2 * k, a + 3 * k];
    if (d === 3 && r.chance(0.5)) {
      const pos = r.int(20, 120), X = a + (pos - 1) * k;
      return {
        text: `Los primeros términos de una secuencia son:\n${seqText(shown)}\n¿En qué posición de la secuencia aparece el número ${num(X)}?`, answer: pos,
        wrong: [pos + 1, pos - 1, (X - a) / k, Math.round(X / k), pos + k],
        steps: [`Cada término aumenta en ${k}, partiendo de ${a}.`, `El término de la posición n es ${a} + (n − 1) × ${k}.`, `${num(X)} − ${a} = ${num(X - a)}; ${num(X - a)} ÷ ${k} = ${(X - a) / k}; entonces n − 1 = ${(X - a) / k} y n = ${pos}.`]
      };
    }
    const n = d === 1 ? r.int(8, 15) : d === 2 ? r.int(20, 60) : r.int(80, 200), ans = a + (n - 1) * k;
    return {
      text: `Los primeros términos de una secuencia son:\n${seqText(shown)}\n¿Qué número ocupa la posición ${n} de esta secuencia?`, answer: ans,
      wrong: [a + n * k, n * k, a + (n - 2) * k, a + (n + 1) * k, ans + a],
      steps: [`Cada término aumenta en ${k}, partiendo de ${a}.`, `Para llegar a la posición ${n} se dan ${n - 1} saltos de ${k}: ${n - 1} × ${k} = ${num((n - 1) * k)}.`, `${a} + ${num((n - 1) * k)} = ${num(ans)}.`]
    };
  } });

  O.reg({ id: 'pat.ecuacion', topic: T, name: 'Ecuaciones simples', gen(r, d) {
    const n = r.int(2, 25);
    if (d === 1) {
      const k = r.int(0, 2), a = r.int(2, 30);
      if (k === 0) return { text: `¿Cuál es el valor de n que cumple ${'n'} + ${a} = ${n + a}?`, answer: n, wrong: [n + a + a, n + 2, a - n > 0 ? a - n : n + 1, n + a], steps: [`Para despejar n se resta ${a} a ambos lados: n = ${n + a} − ${a} = ${n}.`] };
      if (k === 1) return { text: `¿Cuál es el valor de n que cumple n − ${a} = ${n}?`, answer: n + a, wrong: [n - a > 0 ? n - a : n, n, n + a + 1, a - 1], steps: [`Para despejar n se suma ${a} a ambos lados: n = ${n} + ${a} = ${n + a}.`] };
      const m = r.int(2, 9); return { text: `¿Cuál es el valor de n que cumple ${m} × n = ${m * n}?`, answer: n, wrong: [m * n - m, m * n + m, n + m, m * n], steps: [`Para despejar n se divide por ${m}: n = ${m * n} ÷ ${m} = ${n}.`] };
    }
    if (d === 2) {
      const a = r.int(2, 9), b = r.int(2, 30), sign = r.chance(0.5) ? 1 : -1, c = a * n + sign * b;
      if (c <= 0) U.fail();
      const wr = sign > 0 ? (c + b) / a : (c - b) / a;
      if (r.chance(0.5)) return {
        text: `¿Cuál es el valor de n que cumple ${a} × n ${sign > 0 ? '+' : '−'} ${b} = ${c}?`, answer: n,
        wrong: [wr, c - sign * b, c / a - sign * b, n + 1, n - 1],
        steps: [`Primero se ${sign > 0 ? 'resta' : 'suma'} ${b} a ambos lados: ${a} × n = ${c} ${sign > 0 ? '−' : '+'} ${b} = ${a * n}.`, `Luego se divide por ${a}: n = ${a * n} ÷ ${a} = ${n}.`]
      };
      return {
        text: `${a === 2 || a === 3 ? `El ${a === 2 ? 'doble' : 'triple'} de un número, ${sign > 0 ? 'aumentado' : 'disminuido'} en ${b}, es ${c}.` : `Al multiplicar un número por ${a} y ${sign > 0 ? 'sumar' : 'restar'} ${b} al resultado, se obtiene ${c}.`} ¿Cuál es el número?`, answer: n,
        wrong: [wr, c - sign * b, c / a - sign * b, n + 1],
        steps: [`Se escribe la ecuación: ${a} × n ${sign > 0 ? '+' : '−'} ${b} = ${c}.`, `${a} × n = ${a * n}, así que n = ${n}.`]
      };
    }
    const a = r.int(3, 9), c = r.int(1, a - 1), b = r.int(1, 20), e = (a - c) * n + b;
    return {
      text: `¿Cuál es el valor de n que cumple ${a} × n + ${b} = ${c} × n + ${e}?`, answer: n,
      wrong: [(e + b) / (a - c), (e - b) / (a + c), e - b, n + 1, n - 1],
      steps: [`Se restan ${c} × n en ambos lados: ${a - c} × n + ${b} = ${e}.`, `Se resta ${b}: ${a - c} × n = ${e - b}.`, `Se divide por ${a - c}: n = ${n}.`]
    };
  } });

  function sticksSvg(kind) {
    const s = 30, gap = 34;
    let x0 = 10, out = '';
    const top = 18;
    for (let k = 1; k <= 3; k++) {
      const w = kind === 'sq' ? k * s : (k + 1) * s / 2;
      if (kind === 'sq') {
        for (let i = 0; i < k; i++) {
          out += U.sLine(x0 + i * s, top, x0 + (i + 1) * s, top, 'ln stick') + U.sLine(x0 + i * s, top + s, x0 + (i + 1) * s, top + s, 'ln stick');
        }
        for (let i = 0; i <= k; i++) out += U.sLine(x0 + i * s, top, x0 + i * s, top + s, 'ln stick');
      } else {
        const h = s * 0.87, P = i => [x0 + i * s / 2, i % 2 === 0 ? top + h : top];
        for (let i = 0; i <= k; i++) { const a = P(i), b = P(i + 1); out += U.sLine(a[0], a[1], b[0], b[1], 'ln stick'); }
        for (let i = 0; i < k; i++) { const a = P(i), b = P(i + 2); out += U.sLine(a[0], a[1], b[0], b[1], 'ln stick'); }
      }
      out += U.sText(x0 + w / 2, top + s + 20, `Figura ${k}`, 'tick');
      x0 += w + gap;
    }
    return U.svg(x0, top + s + 36, out, kind === 'sq' ? 'Cuadrados formados con palitos' : 'Triángulos formados con palitos');
  }

  O.reg({ id: 'pat.palitos', topic: T, name: 'Figuras con palitos', dev: true, gen(r, d) {
    const kind = r.pick(['sq', 'tri']), c = kind === 'sq' ? 3 : 2, name = kind === 'sq' ? 'cuadrados' : 'triángulos';
    const base = `Con palitos de fósforo se construyen ${name} consecutivos, uno a continuación del otro, formando una fila. La Figura 1 tiene 1 ${name.slice(0, -1)}, la Figura 2 tiene 2 ${name} y la Figura 3 tiene 3 ${name}.`;
    const svg = sticksSvg(kind);
    if (d < 3) {
      const n = d === 1 ? r.int(8, 15) : r.int(20, 60), ans = c * n + 1;
      return {
        text: `${base} ¿Cuántos palitos se necesitan para la Figura ${n}?`, svg, answer: ans,
        wrong: [(c + 1) * n, c * n, c * n + 2, c * (n + 1), ans + c],
        steps: [`Figura 1: ${c + 1} palitos; Figura 2: ${2 * c + 1}; Figura 3: ${3 * c + 1}. Cada figura nueva agrega ${c} palitos.`, `La regla es ${c} × n + 1, donde n es el número de la figura.`, `Para n = ${n}: ${c} × ${n} + 1 = ${ans}.`]
      };
    }
    const k = r.int(20, 70), tot = c * k + 1;
    return {
      text: `${base} Si una figura utiliza ${tot} palitos, ¿cuántos ${name} tiene esa figura?`, svg, answer: k,
      wrong: [Math.round(tot / (c + 1)), k + 1, k - 1, tot - 1, Math.round(tot / c)],
      steps: [`La regla es ${c} × n + 1 = cantidad de palitos.`, `${c} × n + 1 = ${tot} → ${c} × n = ${tot - 1}.`, `n = ${tot - 1} ÷ ${c} = ${k}.`]
    };
  } });

  O.reg({ id: 'pat.sumas', topic: T, name: 'Sumas de secuencias', gen(r, d) {
    if (d === 1) {
      const n = r.int(10, 20), s = n * (n + 1) / 2;
      return {
        text: `¿Cuál es el valor de la suma 1 + 2 + 3 + … + ${n}?`, answer: s, wrong: [n * (n + 1), n * n, s + n, s - n],
        steps: [`Si se escribe la suma al derecho y al revés, cada pareja suma lo mismo: 1 + ${n} = ${n + 1}, 2 + ${n - 1} = ${n + 1}, …`, `Hay ${n} parejas, así que el doble de la suma es ${n} × ${n + 1} = ${n * (n + 1)}.`, `La suma es ${n * (n + 1)} ÷ 2 = ${s}.`]
      };
    }
    if (d === 2) {
      if (r.chance(0.5)) {
        const n = r.int(30, 100), s = n * (n + 1) / 2;
        return {
          text: `¿Cuál es el valor de la suma 1 + 2 + 3 + … + ${n}?`, answer: s, wrong: [n * (n + 1), n * n, s + n, s - n],
          steps: [`Si se escribe la suma al derecho y al revés, cada pareja suma lo mismo: 1 + ${n} = ${n + 1}, 2 + ${n - 1} = ${n + 1}, …`, `Hay ${n} parejas, así que el doble de la suma es ${n} × ${n + 1} = ${num(n * (n + 1))}.`, `La suma es ${num(n * (n + 1))} ÷ 2 = ${num(s)}.`]
        };
      }
      const k = r.int(10, 40);
      return {
        text: `¿Cuál es la suma de los primeros ${k} números impares (1 + 3 + 5 + …)?`, answer: k * k, wrong: [k * (k + 1), k * k - k, 2 * k, k * k + k],
        steps: [`1 = 1×1, 1 + 3 = 4 = 2×2, 1 + 3 + 5 = 9 = 3×3: la suma de los primeros n impares es n × n.`, `${k} × ${k} = ${k * k}.`]
      };
    }
    if (r.chance(0.5)) {
      const A = r.int(10, 60), B = r.int(A + 20, A + 80), s = (A + B) * (B - A + 1) / 2;
      if (!Number.isInteger(s)) U.fail();
      return {
        text: `¿Cuál es la suma de todos los números enteros desde ${A} hasta ${B}, ambos incluidos?`, answer: s,
        wrong: [(A + B) * (B - A) / 2, (A + B) * (B - A + 1), B * (B + 1) / 2 - A * (A + 1) / 2 + A + 1, s + A],
        steps: [`Cantidad de números: ${B} − ${A} + 1 = ${B - A + 1}.`, `Cada pareja de extremos suma ${A} + ${B} = ${A + B}.`, `Suma = ${A + B} × ${B - A + 1} ÷ 2 = ${num(s)}.`]
      };
    }
    const a = r.int(2, 10), k = r.int(2, 6), n = r.int(10, 30), last = a + (n - 1) * k, s = n * (a + last) / 2;
    if (!Number.isInteger(s)) U.fail();
    return {
      text: `¿Cuál es la suma de los ${n} primeros términos de la siguiente secuencia?\n${seqText([a, a + k, a + 2 * k, a + 3 * k])}`, answer: s,
      wrong: [n * (a + last), n * last, s - a, (n - 1) * (a + last) / 2],
      steps: [`El último término (el ${n}º) es ${a} + ${n - 1} × ${k} = ${last}.`, `Se suman primero y último: ${a} + ${last} = ${a + last}.`, `Suma = ${n} × ${a + last} ÷ 2 = ${num(s)}.`]
    };
  } });

  O.reg({ id: 'pat.precios', topic: T, name: 'Descubrir valores desconocidos', dev: true, gen(r, d) {
    const [p1, p2] = r.pick([['cuaderno', 'lápiz'], ['sándwich', 'jugo'], ['helado', 'galleta']]);
    const c = r.step(500, 2500, 100), l = r.step(100, 900, 50);
    const pl = w => (w === 'lápiz' ? 'lápices' : w.endsWith('ch') ? w + 'es' : w + 's');
    const cap = s => s[0].toUpperCase() + s.slice(1);
    const art = x => (['cuaderno', 'sándwich', 'helado', 'lápiz', 'jugo'].includes(x) ? 'un' : 'una');
    if (d === 1) {
      const S1 = c + l, S2 = 2 * c + l, askC = r.chance(0.5);
      return {
        text: `${cap(art(p1))} ${p1} y ${art(p2)} ${p2} cuestan ${$(S1)}. Dos ${pl(p1)} y ${art(p2)} ${p2} cuestan ${$(S2)}. ¿Cuánto cuesta ${askC ? art(p1) + ' ' + p1 : art(p2) + ' ' + p2}?`,
        answer: askC ? c : l, unit: '$', wrong: askC ? [S2, S1 - c, S1 / 2, l, c + l] : [S1 - l, S2 - S1, S1 / 2, c, c + l],
        steps: [`La diferencia entre las dos compras es un ${p1}: ${$(S2)} − ${$(S1)} = ${$(c)}.`, `Entonces ${art(p2) === 'una' ? 'la' : 'el'} ${p2} cuesta ${$(S1)} − ${$(c)} = ${$(l)}.`, askC ? `El ${p1} cuesta ${$(c)}.` : `${art(p2) === 'una' ? 'La' : 'El'} ${p2} cuesta ${$(l)}.`]
      };
    }
    if (d === 2) {
      const A = 3 * c + 2 * l, B = c + 2 * l;
      return {
        text: `Tres ${pl(p1)} y dos ${pl(p2)} cuestan ${$(A)}. ${cap(art(p1))} ${p1} y dos ${pl(p2)} cuestan ${$(B)}. ¿Cuánto cuesta ${art(p2)} ${p2}?`, answer: l, unit: '$',
        wrong: [c, (A - B) / 2 + l, B / 2, A / 5, (A - B)],
        steps: [`Entre las dos compras hay 2 ${pl(p1)} de diferencia: ${$(A)} − ${$(B)} = ${$(A - B)}.`, `Entonces 1 ${p1} cuesta ${$(A - B)} ÷ 2 = ${$(c)}.`, `En la segunda compra: ${$(B)} − ${$(c)} = ${$(2 * l)} por dos ${pl(p2)}, o sea, ${$(l)} cada uno.`]
      };
    }
    const A = 2 * c + 3 * l, B = 2 * c + l;
    return {
      text: `Dos ${pl(p1)} y tres ${pl(p2)} cuestan ${$(A)}. Dos ${pl(p1)} y ${art(p2)} ${p2} cuestan ${$(B)}. ¿Cuánto cuestan en total ${art(p1)} ${p1} y ${art(p2)} ${p2}?`, answer: c + l, unit: '$',
      wrong: [c, l, A - B, (A + B) / 5 | 0, 2 * c + l],
      steps: [`Entre las dos compras hay 2 ${pl(p2)} de diferencia: ${$(A)} − ${$(B)} = ${$(A - B)}, así que 1 ${p2} cuesta ${$(l)}.`, `Dos ${pl(p1)} cuestan ${$(B)} − ${$(l)} = ${$(2 * c)}, entonces 1 ${p1} cuesta ${$(c)}.`, `Juntos: ${$(c)} + ${$(l)} = ${$(c + l)}.`]
    };
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
