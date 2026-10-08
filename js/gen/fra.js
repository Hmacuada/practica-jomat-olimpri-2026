/* Tema 3: Fracciones (equivalentes, comparar, operar, números mixtos) */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U, num = U.num, $ = U.money, fr = U.fr, mix = U.mix, F = U.frac, T = 'fra';

  /** Fracción propia irreductible n/d con d en [dmin, dmax] */
  function coprimePair(r, dmin, dmax) {
    for (let k = 0; k < 200; k++) {
      const d = r.int(dmin, dmax), n = r.int(1, d - 1);
      if (U.gcd(n, d) === 1) return [n, d];
    }
    return [1, dmin + 1];
  }

  /** "n/d" y, si se simplifica a otra cosa, "= resultado" */
  const simp = (n, d, ans) => fr(n, d) + (ans.n !== n || ans.d !== d ? ` = ${U.fmt(ans)}` : '');

  /** Fracción propia irreductible con valor <= maxV */
  function smallPair(r, dmin, dmax, maxV) {
    for (let k = 0; k < 200; k++) {
      const [n, d] = coprimePair(r, dmin, dmax);
      if (n / d <= maxV) return [n, d];
    }
    return [1, dmax];
  }

  O.reg({ id: 'fra.equivalentes', topic: T, name: 'Fracciones equivalentes', mcOnly: true, gen(r, d) {
    const [a, b] = coprimePair(r, 2, d === 1 ? 9 : 12);
    const k = r.int(2, d === 1 ? 5 : 8);
    return {
      text: `¿Cuál de las siguientes fracciones es equivalente a ${fr(a, b)}?`,
      answer: U.raw(a * k, b * k),
      wrong: [U.raw(a + k, b + k), U.raw(a * k, b + k), U.raw(a + k, b * k), U.raw(b * k, a * k), U.raw(a * k, b * k + 1)],
      steps: [`Para obtener una fracción equivalente se multiplica el numerador y el denominador por el mismo número.`,
        `${a} × ${k} = ${a * k} y ${b} × ${k} = ${b * k}, entonces ${fr(a, b)} = ${fr(a * k, b * k)}.`,
        `Sumar el mismo número arriba y abajo (como ${fr(a + k, b + k)}) no mantiene el valor de la fracción.`]
    };
  } });

  O.reg({ id: 'fra.falta_numero', topic: T, name: 'Completar fracciones equivalentes', gen(r, d) {
    const [a, b] = coprimePair(r, 2, d === 1 ? 9 : 12), k = r.int(2, 9);
    if (d === 1) return {
      text: `¿Qué número falta para que la igualdad sea verdadera?\n${fr(a, b)} = ${fr('?', b * k)}`, answer: a * k, wrong: [a + k, a * k + b, b * k],
      steps: [`De ${b} a ${b * k} se multiplicó por ${k}.`, `Hay que multiplicar el numerador por lo mismo: ${a} × ${k} = ${a * k}.`]
    };
    if (d === 2) return {
      text: `¿Qué número falta para que la igualdad sea verdadera?\n${fr(a, b)} = ${fr(a * k, '?')}`, answer: b * k, wrong: [b + k, a * k + b, b * k + 1],
      steps: [`De ${a} a ${a * k} se multiplicó por ${k}.`, `Hay que multiplicar el denominador por lo mismo: ${b} × ${k} = ${b * k}.`]
    };
    const k1 = r.int(2, 6), k2 = r.int(2, 7);
    return {
      text: `¿Qué número falta para que la igualdad sea verdadera?\n${fr('?', b * k1)} = ${fr(a * k2, b * k2)}`, answer: a * k1, wrong: [a * k2, a * k1 + 1, b * k1, a * k2 / k2 + k1],
      steps: [`Se simplifica la fracción de la derecha dividiendo por ${k2}: ${fr(a * k2, b * k2)} = ${fr(a, b)}.`, `De ${b} a ${b * k1} se multiplicó por ${k1}, así que el numerador es ${a} × ${k1} = ${a * k1}.`]
    };
  } });

  O.reg({ id: 'fra.comparar', topic: T, name: 'Comparar y ordenar fracciones', mcOnly: true, gen(r, d) {
    let fs = [], guard = 0;
    const biggest = r.chance(0.5);
    do {
      fs = [];
      if (d === 1) {
        if (r.chance(0.5)) {
          const D = r.int(6, 12), ns = r.sample([...Array(D - 1).keys()].map(x => x + 1), 4);
          fs = ns.map(n => U.raw(n, D));
        } else {
          const n = r.int(1, 4), ds = r.sample([...Array(12 - n).keys()].map(x => x + n + 1), 4);
          fs = ds.map(dd => U.raw(n, dd));
        }
      } else {
        const lo = d === 2 ? 0.1 : 0.4, hi = d === 2 ? 0.95 : 0.9;
        while (fs.length < 4) {
          const [n, dd] = coprimePair(r, d === 2 ? 3 : 7, d === 2 ? 12 : 15), v = n / dd;
          if (v < lo || v > hi || fs.some(f => Math.abs(f.n / f.d - v) < (d === 2 ? 0.03 : 0.012))) { if (++guard > 400) break; continue; }
          fs.push(U.raw(n, dd));
        }
      }
    } while (fs.length < 4 && ++guard < 400);
    if (fs.length < 4) U.fail();
    const vals = fs.map(f => f.n / f.d);
    if (new Set(vals.map(v => v.toFixed(6))).size < 4) U.fail();
    const sorted = fs.slice().sort((x, y) => x.n / x.d - y.n / y.d);
    const ans = biggest ? sorted[3] : sorted[0];
    const sameDen = fs.every(f => f.d === fs[0].d), sameNum = fs.every(f => f.n === fs[0].n);
    const steps = [];
    if (sameDen) steps.push('Con el mismo denominador, es mayor la fracción de mayor numerador.');
    else if (sameNum) steps.push('Con el mismo numerador, es mayor la fracción de menor denominador (se divide en menos partes).');
    else steps.push(`Se convierten a decimales (aproximados): ${fs.map(f => `${fr(f.n, f.d)} ≈ ${num(U.round(f.n / f.d, 3))}`).join('; ')}.`);
    steps.push(`Ordenadas de menor a mayor: ${sorted.map(f => fr(f.n, f.d)).join(' < ')}.`);
    return {
      text: `¿Cuál de estas fracciones es la ${biggest ? 'mayor' : 'menor'}?`, answer: ans, wrong: fs.filter(f => f !== ans), steps
    };
  } });

  O.reg({ id: 'fra.operar', topic: T, name: 'Operar con fracciones', gen(r, d) {
    let text, ans, wrong, steps;
    const L = (x, y) => U.lcm(x, y);
    if (d === 1) {
      const [a, b] = coprimePair(r, 2, 8), m = r.pick([1, 2, 3]), dd = b * m;
      const c = r.int(1, dd - 1), x = F(a, b), y = F(c, dd), add = r.chance(0.5);
      if (!add && x.n * y.d <= y.n * x.d) U.fail();
      ans = add ? U.fadd(x, y) : U.fsub(x, y);
      const lc = L(b, dd);
      text = `¿Cuál es el resultado de ${fr(a, b)} ${add ? '+' : '−'} ${fr(c, dd)}?`;
      wrong = add ? [F(a + c, b + dd), F(a + c, b), F(a + c, dd)] : [F(a - c, b - dd), F(a - c, b), F(Math.abs(a - c), dd)];
      steps = [`El denominador común es ${lc}.`, `${fr(a, b)} = ${fr(a * lc / b, lc)} y ${fr(c, dd)} = ${fr(c * lc / dd, lc)}.`,
        `${fr(a * lc / b, lc)} ${add ? '+' : '−'} ${fr(c * lc / dd, lc)} = ${simp(add ? a * lc / b + c * lc / dd : a * lc / b - c * lc / dd, lc, ans)}.`];
    } else if (d === 2) {
      const [a, b] = coprimePair(r, 2, 9);
      let c, dd; do { [c, dd] = coprimePair(r, 2, 9); } while (dd === b);
      const op = r.pick(['+', '−', '×']), x = F(a, b), y = F(c, dd);
      if (op === '−' && x.n * y.d <= y.n * x.d) U.fail();
      const lc = L(b, dd);
      if (op === '×') {
        ans = U.fmul(x, y); text = `¿Cuál es el resultado de ${fr(a, b)} × ${fr(c, dd)}?`;
        wrong = [F(a * c, b + dd), U.fadd(x, y), F(a * dd, b * c), F(a + c, b * dd)];
        steps = [`Se multiplican los numeradores y los denominadores: ${fr(a * c, b * dd)}.`, `Se simplifica: ${U.fmt(ans)}.`];
      } else {
        const add = op === '+';
        ans = add ? U.fadd(x, y) : U.fsub(x, y); text = `¿Cuál es el resultado de ${fr(a, b)} ${op} ${fr(c, dd)}?`;
        wrong = add ? [F(a + c, b + dd), F(a + c, lc), F(a + c, b * dd), F(a * c, b * dd)] : [F(a - c, b - dd), F(a - c, lc), F(Math.abs(a - c), b * dd)];
        steps = [`El denominador común (MCM de ${b} y ${dd}) es ${lc}.`, `${fr(a, b)} = ${fr(a * lc / b, lc)} y ${fr(c, dd)} = ${fr(c * lc / dd, lc)}.`,
          `${fr(a * lc / b, lc)} ${op} ${fr(c * lc / dd, lc)} = ${simp(add ? a * lc / b + c * lc / dd : a * lc / b - c * lc / dd, lc, ans)}.`];
      }
    } else {
      const k = r.int(0, 2);
      if (k === 0) {
        const ds = [2, 3, 4, 6, 8, 9, 12];
        const b = r.pick(ds), dd = r.pick(ds), f = r.pick(ds);
        const a = r.int(1, b - 1), c = r.int(1, dd - 1), e = r.int(1, f - 1);
        const s = U.fadd(F(a, b), F(c, dd));
        if (U.fv(s) <= U.fv(F(e, f))) U.fail();
        ans = U.fsub(s, F(e, f));
        text = `¿Cuál es el resultado de ${fr(a, b)} + ${fr(c, dd)} − ${fr(e, f)}?`;
        wrong = [U.fadd(U.fadd(F(a, b), F(c, dd)), F(e, f)), F(a + c - e, b + dd - f), U.fsub(F(a, b), U.fsub(F(c, dd), F(e, f)))];
        steps = [`Primero ${fr(a, b)} + ${fr(c, dd)} = ${U.fmt(s)}.`, `Luego ${U.fmt(s)} − ${fr(e, f)} = ${U.fmt(ans)}.`];
      } else if (k === 1) {
        const [a, b] = coprimePair(r, 2, 9), [c, dd] = coprimePair(r, 2, 9);
        ans = U.fdiv(F(a, b), F(c, dd));
        text = `¿Cuál es el resultado de ${fr(a, b)} ÷ ${fr(c, dd)}?`;
        wrong = [U.fmul(F(a, b), F(c, dd)), F(b * c, a * dd), F(a * dd, b + c), F(a * c, b * dd + 1)];
        steps = [`Dividir por una fracción es multiplicar por su inversa: ${fr(a, b)} × ${fr(dd, c)}.`, `${fr(a * dd, b * c)} = ${U.fmt(ans)}.`];
      } else {
        const [a, b] = coprimePair(r, 2, 9), [c, dd] = coprimePair(r, 2, 9), [e, f] = coprimePair(r, 2, 9);
        const p = U.fmul(F(a, b), F(c, dd));
        ans = U.fadd(p, F(e, f));
        text = `¿Cuál es el resultado de ${fr(a, b)} × ${fr(c, dd)} + ${fr(e, f)}?`;
        wrong = [U.fmul(U.fadd(F(a, b), F(e, f)), F(c, dd)), U.fadd(U.fadd(F(a, b), F(c, dd)), F(e, f)), F(a * c + e, b * dd + f)];
        steps = [`Primero la multiplicación: ${fr(a, b)} × ${fr(c, dd)} = ${U.fmt(p)}.`, `Luego la suma: ${U.fmt(p)} + ${fr(e, f)} = ${U.fmt(ans)}.`];
      }
    }
    if (ans.d === 1) U.fail();
    return { text, answer: ans, wrong, steps };
  } });

  O.reg({ id: 'fra.mixtos', topic: T, name: 'Números mixtos y fracciones impropias', gen(r, d) {
    const [rr, dn] = coprimePair(r, 2, 9), w = r.int(1, 9), n = w * dn + rr;
    const mk = (w2, r2) => F(w2 * dn + r2, dn, true);
    const variant = d === 1 ? r.int(0, 1) : d === 2 ? r.pick([0, 1, 2]) : r.pick([2, 3, 4]);
    if (variant === 0) return {
      text: `¿Cuál es el resultado al expresar ${fr(n, dn)} como número mixto?`, answer: mk(w, rr),
      wrong: [mk(w + 1, rr), rr + 1 < dn ? mk(w, rr + 1) : mk(w, rr - 1), mk(w - 1, rr), w < dn ? mk(rr, w) : mk(w + 2, rr), mk(w, dn - rr)],
      steps: [`Se divide ${n} ÷ ${dn} = ${w} y sobra ${rr}.`, `El cociente es la parte entera y el resto es el nuevo numerador: ${mix(w, rr, dn)}.`]
    };
    if (variant === 1) return {
      text: `¿Cuál es el resultado al expresar ${mix(w, rr, dn)} como fracción impropia?`, answer: F(n, dn),
      wrong: [F(w + rr, dn), F(w * rr + dn, dn), F(n, rr), F(w * dn, rr)],
      steps: [`Se multiplica la parte entera por el denominador: ${w} × ${dn} = ${w * dn}.`, `Se suma el numerador: ${w * dn} + ${rr} = ${n}.`, `Resultado: ${fr(n, dn)}.`]
    };
    if (variant === 2) {
      const [r2, d2] = d === 2 ? [coprimePair(r, dn, dn)[0], dn] : coprimePair(r, 2, 9), w2 = r.int(1, 6);
      const x = F(n, dn), y = F(w2 * d2 + r2, d2), s = U.fadd(x, y);
      if (s.d === 1 || s.n < s.d) U.fail();
      return {
        text: `¿Cuál es el resultado de ${mix(w, rr, dn)} + ${mix(w2, r2, d2)}? Exprese la respuesta como número mixto.`, answer: F(s.n, s.d, true),
        wrong: [F((w + w2) * (dn + d2) + rr + r2, dn + d2, true), F((w + w2) * dn + rr + r2, dn, true), F(s.n + 1, s.d, true), F(s.n - 1, s.d, true), F(s.n, s.d + 1, true)],
        steps: [`Se pasan a fracciones impropias: ${mix(w, rr, dn)} = ${fr(n, dn)} y ${mix(w2, r2, d2)} = ${fr(w2 * d2 + r2, d2)}.`, `Se suman: ${fr(n, dn)} + ${fr(w2 * d2 + r2, d2)} = ${fr(s.n, s.d)}.`, `Se vuelve a número mixto: ${U.fmt(F(s.n, s.d, true))}.`]
      };
    }
    if (variant === 3) {
      const w1 = r.int(3, 9), w2 = r.int(1, w1 - 1), a1 = r.int(1, dn - 2), a2 = r.int(a1 + 1, dn - 1);
      const x = F(w1 * dn + a1, dn), y = F(w2 * dn + a2, dn), s = U.fsub(x, y);
      if (s.d === 1) U.fail();
      return {
        text: `¿Cuál es el resultado de ${mix(w1, a1, dn)} − ${mix(w2, a2, dn)}? Exprese la respuesta como número mixto.`, answer: F(s.n, s.d, true),
        wrong: [F((w1 - w2) * dn + (a2 - a1), dn, true), F(s.n + 1, s.d, true), F(s.n - 1, s.d, true), F((w1 - w2 + 1) * dn + (a2 - a1), dn, true)],
        steps: [`Como ${a1} es menor que ${a2}, conviene pasar a fracciones impropias.`, `${mix(w1, a1, dn)} = ${fr(w1 * dn + a1, dn)} y ${mix(w2, a2, dn)} = ${fr(w2 * dn + a2, dn)}.`, `${fr(w1 * dn + a1, dn)} − ${fr(w2 * dn + a2, dn)} = ${fr(x.n * y.d - y.n * x.d, x.d * y.d)} = ${U.fmt(F(s.n, s.d, true))}.`]
      };
    }
    const k = r.int(2, 6), p = F(k * n, dn);
    if (p.d === 1) U.fail();
    return {
      text: `¿Cuál es el resultado de ${k} × ${mix(w, rr, dn)}? Exprese la respuesta como número mixto.`, answer: F(p.n, p.d, true),
      wrong: [F(k * w * dn + rr, dn, true), F(p.n + 1, p.d, true), F(p.n - 1, p.d, true), F(k * w * dn + k + rr, dn, true)],
      steps: [`${mix(w, rr, dn)} = ${fr(n, dn)}.`, `${k} × ${fr(n, dn)} = ${fr(k * n, dn)}.`, `En número mixto: ${U.fmt(F(p.n, p.d, true))}.`]
    };
  } });

  O.reg({ id: 'fra.de_cantidad', topic: T, name: 'Fracción de una cantidad', dev: true, gen(r, d) {
    const p = U.person(r), money = r.chance(0.6);
    const [a, b] = coprimePair(r, 2, d === 1 ? 6 : 8), [c, dd] = coprimePair(r, 2, 8);
    const thing = r.pick(['figuritas', 'láminas', 'bolitas', 'cartas']);
    const unit = money ? '$' : '';
    const fmt = x => (money ? $(x) : num(x));
    if (d === 1) {
      const k = money ? r.int(2, 30) : r.int(2, 12), N = b * k * (money ? 100 : 1);
      const part = N / b * a, left = N - part;
      return {
        text: money
          ? `${p.name} tenía ${$(N)} y gastó ${fr(a, b)} de ese dinero. ¿Cuánto dinero le queda?`
          : `${p.name} tenía ${N} ${thing} y regaló ${fr(a, b)} de ellas. ¿Cuántas ${thing} le quedan?`,
        answer: left, unit, wrong: [part, N / a * b, left + part, N - a],
        steps: [`${fmt(N)} ÷ ${b} = ${fmt(N / b)} (es ${fr(1, b)} del total).`, `${fr(a, b)} del total: ${fmt(N / b)} × ${a} = ${fmt(part)}.`, `Le quedan ${fmt(N)} − ${fmt(part)} = ${fmt(left)}.`]
      };
    }
    const k = r.int(1, money ? 6 : 4), N = b * dd * 2 * k * (money ? 50 : 1);
    const gasto1 = N / b * a, rem1 = N - gasto1, gasto2 = rem1 / dd * c, rem2 = rem1 - gasto2;
    if (d === 2) return {
      text: money
        ? `${p.name} tenía ${$(N)}. Gastó ${fr(a, b)} en un libro y ${fr(c, dd)} de lo que le quedó en un helado. ¿Cuánto dinero le queda?`
        : `${p.name} tenía ${num(N)} ${thing}. Regaló ${fr(a, b)} de ellas a su hermano y ${fr(c, dd)} de las que le quedaron a una amiga. ¿Cuántas ${thing} le quedan?`,
      answer: rem2, unit, wrong: [N - gasto1 - N / dd * c, rem1, N - gasto2, gasto1 + gasto2],
      steps: [`Primer gasto: ${fmt(N)} ÷ ${b} × ${a} = ${fmt(gasto1)}. Quedan ${fmt(N)} − ${fmt(gasto1)} = ${fmt(rem1)}.`, `Segundo gasto (de lo que quedó): ${fmt(rem1)} ÷ ${dd} × ${c} = ${fmt(gasto2)}.`, `Quedan ${fmt(rem1)} − ${fmt(gasto2)} = ${fmt(rem2)}.`]
    };
    const half = rem2 / 2, rem3 = rem2 - half;
    return {
      text: money
        ? `${p.name} tenía ${$(N)}. Gastó ${fr(a, b)} en un libro, luego ${fr(c, dd)} de lo que le quedaba en un helado y finalmente la mitad de lo que le quedó en el transporte. ¿Cuánto dinero le queda?`
        : `${p.name} tenía ${num(N)} ${thing}. Regaló ${fr(a, b)} de ellas a su hermano, luego ${fr(c, dd)} de las que le quedaban a una amiga y finalmente la mitad de las que le quedaron a un primo. ¿Cuántas ${thing} le quedan?`,
      answer: rem3, unit, wrong: [rem2, half, rem2 - N / 2, N - gasto1 - gasto2 - N / 2],
      steps: [`Tras el primer gasto: ${fmt(N)} − ${fmt(gasto1)} = ${fmt(rem1)}.`, `Tras el segundo: ${fmt(rem1)} − ${fmt(gasto2)} = ${fmt(rem2)}.`, `La mitad de ${fmt(rem2)} es ${fmt(half)}, así que quedan ${fmt(rem2)} − ${fmt(half)} = ${fmt(rem3)}.`]
    };
  } });

  O.reg({ id: 'fra.parte_restante', topic: T, name: 'Qué fracción falta', gen(r, d) {
    const p = U.person(r);
    const [thing, de, verb0, verb1] = r.pick([['el libro', 'del libro', 'leyó', 'falta por leer'], ['la tarea', 'de la tarea', 'hizo', 'falta por hacer'], ['el camino', 'del camino', 'recorrió', 'falta por recorrer'], ['el estanque', 'del estanque', 'llenó', 'falta por llenar']]);
    const verb = [verb0, verb1];
    const [a, b] = smallPair(r, 3, d === 1 ? 8 : 10, d === 3 ? 0.3 : 0.45);
    let c, dd;
    if (d === 1) { dd = b; c = r.int(1, b - 1 - a); if (c < 1) U.fail(); } else { [c, dd] = smallPair(r, 3, 10, d === 3 ? 0.3 : 0.45); }
    const s = U.fadd(F(a, b), F(c, dd));
    if (U.fv(s) >= 0.95) U.fail();
    const rest = U.fsub(F(1, 1), s);
    if (d < 3) return {
      text: `El lunes ${p.name} ${verb[0]} ${fr(a, b)} ${de} y el martes ${fr(c, dd)} ${de}. ¿Qué fracción ${de} ${verb[1]}?`,
      answer: rest, wrong: [s, F(b - a, b), F(dd - c, dd), F(b + dd - a - c, b + dd)],
      steps: [`Lo que ya hizo: ${fr(a, b)} + ${fr(c, dd)} = ${U.fmt(s)}.`, `El total es 1 entero: 1 − ${U.fmt(s)} = ${U.fmt(rest)}.`]
    };
    const [e, f] = smallPair(r, 3, 10, 0.3), s3 = U.fadd(s, F(e, f));
    if (U.fv(s3) >= 0.97) U.fail();
    const rest3 = U.fsub(F(1, 1), s3);
    return {
      text: `El lunes ${p.name} ${verb[0]} ${fr(a, b)} ${de}, el martes ${fr(c, dd)} y el miércoles ${fr(e, f)}. ¿Qué fracción ${de} ${verb[1]}?`,
      answer: rest3, wrong: [s3, rest, U.fsub(F(1, 1), F(e, f)), F(b + dd + f - a - c - e, b + dd + f)],
      steps: [`Lo que ya hizo: ${fr(a, b)} + ${fr(c, dd)} + ${fr(e, f)} = ${U.fmt(s3)}.`, `Lo que falta: 1 − ${U.fmt(s3)} = ${U.fmt(rest3)}.`]
    };
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
