/* Tema 1: Números grandes y operaciones combinadas */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U, num = U.num, $ = U.money, T = 'num';

  O.reg({ id: 'num.suma_resta', topic: T, name: 'Sumas y restas con números grandes', gen(r, d) {
    if (d === 1) {
      const a = r.int(1200, 9800), b = r.int(1200, 9800), s = a + b;
      const lugar = r.pick(['una feria', 'un estadio', 'un museo', 'un parque']);
      return {
        text: `En ${lugar} entraron ${num(a)} personas el sábado y ${num(b)} personas el domingo. ¿Cuántas personas entraron en total?`,
        answer: s, wrong: [Math.abs(a - b), s + 100, s - 100, s + 1000, s - 10],
        steps: [`Se suman los dos días: ${num(a)} + ${num(b)} = ${num(s)}.`]
      };
    }
    if (d === 2) {
      const a = r.int(10000, 60000), b = r.int(12000, 60000), c = r.int(1000, b - 1000), x = b - c, s = a + b + x;
      return {
        text: `En un festival asistieron ${num(a)} personas el viernes y ${num(b)} el sábado. El domingo asistieron ${num(c)} personas menos que el sábado. ¿Cuántas personas asistieron en total los tres días?`,
        answer: s, wrong: [a + b + c, a + b, a + 2 * b, s + 1000, s - 1000, s + 10000],
        steps: [`El domingo asistieron ${num(b)} − ${num(c)} = ${num(x)} personas.`,
          `Total: ${num(a)} + ${num(b)} + ${num(x)} = ${num(s)}.`]
      };
    }
    const A = r.int(300000, 900000), B = r.int(100000, 400000), C = r.int(100000, 300000), D = r.int(50000, 200000);
    if (A + B - C - D <= 0) U.fail();
    const s = A + B - C - D;
    return {
      text: `Una empresa tenía ${$(A)} en caja. Durante el mes recibió ${$(B)} por ventas, pagó ${$(C)} en sueldos y ${$(D)} en arriendo. ¿Cuánto dinero tiene al final del mes?`,
      answer: s, unit: '$', wrong: [A + B - C + D, A - B - C - D > 0 ? A - B - C - D : A + B, A + B - C, A + B + C + D, s + 10000, s - 100000],
      steps: [`Ingresos: ${$(A)} + ${$(B)} = ${$(A + B)}.`, `Gastos: ${$(C)} + ${$(D)} = ${$(C + D)}.`, `Queda: ${$(A + B)} − ${$(C + D)} = ${$(s)}.`]
    };
  } });

  O.reg({ id: 'num.prioridad', topic: T, name: 'Prioridad de operaciones', gen(r, d) {
    let expr, ans, wrong, steps;
    if (d === 1) {
      const k = r.int(0, 2);
      if (k === 0) {
        const a = r.int(5, 40), b = r.int(2, 9), c = r.int(2, 9);
        expr = `${a} + ${b} × ${c}`; ans = a + b * c; wrong = [(a + b) * c, a + b + c];
        steps = [`Primero la multiplicación: ${b} × ${c} = ${b * c}.`, `Luego la suma: ${a} + ${b * c} = ${ans}.`];
      } else if (k === 1) {
        const b = r.int(2, 9), c = r.int(2, 9), a = r.int(b * c + 1, b * c + 40);
        expr = `${a} − ${b} × ${c}`; ans = a - b * c; wrong = [(a - b) * c, a - b - c];
        steps = [`Primero la multiplicación: ${b} × ${c} = ${b * c}.`, `Luego la resta: ${a} − ${b * c} = ${ans}.`];
      } else {
        const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), e = r.int(2, 9);
        expr = `${a} × ${b} + ${c} × ${e}`; ans = a * b + c * e; wrong = [a * (b + c) * e, a * b + c + e, (a * b + c) * e];
        steps = [`Se hacen las multiplicaciones: ${a} × ${b} = ${a * b} y ${c} × ${e} = ${c * e}.`, `Luego se suma: ${a * b} + ${c * e} = ${ans}.`];
      }
    } else if (d === 2) {
      const k = r.int(0, 2);
      if (k === 0) {
        const a = r.int(3, 15), b = r.int(3, 15), c = r.int(2, 9), e = r.int(1, Math.min(30, (a + b) * c - 1));
        expr = `(${a} + ${b}) × ${c} − ${e}`; ans = (a + b) * c - e; wrong = [a + b * c - e, (a + b) * (c - e), (a + b) * c + e];
        steps = [`Primero el paréntesis: ${a} + ${b} = ${a + b}.`, `Luego multiplicar: ${a + b} × ${c} = ${(a + b) * c}.`, `Finalmente restar: ${(a + b) * c} − ${e} = ${ans}.`];
      } else if (k === 1) {
        const a = r.int(5, 40), b = r.int(3, 12), c = r.int(2, 9), f = r.int(2, 9), q = r.int(2, 9), e = f * q;
        expr = `${a} + ${b} × ${c} − ${e} ÷ ${f}`; ans = a + b * c - q;
        const ltr = ((a + b) * c - e) / f;
        wrong = [ltr, a + b * c - e, (a + b * c - e) / f, a + b * c + q];
        steps = [`Primero multiplicar y dividir: ${b} × ${c} = ${b * c} y ${e} ÷ ${f} = ${q}.`, `Luego sumar y restar de izquierda a derecha: ${a} + ${b * c} − ${q} = ${ans}.`];
      } else {
        const a = r.int(6, 15), b = r.int(6, 15), c = r.int(2, 9), e = r.int(2, 9);
        if (c * e >= a * b) U.fail();
        expr = `${a} × ${b} − ${c} × ${e}`; ans = a * b - c * e; wrong = [(a * b - c) * e, a * (b - c) * e, a * b + c * e];
        steps = [`Se hacen las multiplicaciones: ${a} × ${b} = ${a * b} y ${c} × ${e} = ${c * e}.`, `Luego se resta: ${a * b} − ${c * e} = ${ans}.`];
      }
    } else {
      const k = r.int(0, 2);
      if (k === 0) {
        const a = r.int(2, 9), b = r.int(5, 20), c = r.int(2, 9), e = r.int(2, 9), f = r.int(1, 30);
        expr = `${a} × (${b} + ${c} × ${e}) − ${f}`; ans = a * (b + c * e) - f;
        wrong = [a * (b + c) * e - f, a * b + c * e - f, a * (b + c * e - f), a * (b + c * e) + f];
        steps = [`Dentro del paréntesis, primero la multiplicación: ${c} × ${e} = ${c * e}.`, `Luego la suma: ${b} + ${c * e} = ${b + c * e}.`, `Multiplicamos: ${a} × ${b + c * e} = ${a * (b + c * e)}.`, `Restamos: ${a * (b + c * e)} − ${f} = ${ans}.`];
      } else if (k === 1) {
        const dd = r.pick([2, 3, 4, 5]), c = dd * r.int(2, 6), m = r.int(2, 12), b = r.int(3, 30), a = b + m, e = r.int(3, 40);
        expr = `(${a} − ${b}) × ${c} ÷ ${dd} + ${e}`; ans = m * c / dd + e;
        wrong = [a - b * c / dd + e, m * c / (dd + e), m * c / dd - e, m * c + e / dd];
        steps = [`Paréntesis: ${a} − ${b} = ${m}.`, `Multiplicar y dividir de izquierda a derecha: ${m} × ${c} = ${m * c}; ${m * c} ÷ ${dd} = ${m * c / dd}.`, `Sumar: ${m * c / dd} + ${e} = ${ans}.`];
      } else {
        const f = r.int(2, 6), s = f * r.int(2, 6), dd = r.int(1, s - 1), e = s - dd;
        const a = r.int(5, 40), b = r.int(2, 9), c = r.int(2, 9);
        expr = `${a} + ${b} × ${c} − (${dd} + ${e}) ÷ ${f}`; ans = a + b * c - s / f;
        wrong = [(a + b) * c - s / f, a + b * c - dd + e / f, a + b * c - s, a + b * c + s / f];
        steps = [`Paréntesis: ${dd} + ${e} = ${s}.`, `Multiplicar y dividir: ${b} × ${c} = ${b * c} y ${s} ÷ ${f} = ${s / f}.`, `Sumar y restar: ${a} + ${b * c} − ${s / f} = ${ans}.`];
      }
    }
    if (ans < 0 || !Number.isInteger(ans)) U.fail();
    return { text: `¿Cuál es el valor de ${expr}?`, answer: ans, wrong, steps };
  } });

  O.reg({ id: 'num.valor_posicional', topic: T, name: 'Valor posicional y descomposición', gen(r, d) {
    const len = [4, 6, 7][d - 1];
    const digs = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], len);
    const n = Number(digs.join(''));
    const names = ['unidades', 'decenas', 'centenas', 'unidades de mil', 'decenas de mil', 'centenas de mil', 'unidades de millón'];
    if (r.chance(0.5)) {
      const pos = r.int(0, len - 1), dig = digs[len - 1 - pos], val = dig * 10 ** pos;
      const wrong = [];
      for (let p = 0; p < len; p++) if (p !== pos) wrong.push(dig * 10 ** p);
      return {
        text: `En el número ${num(n)}, ¿cuál es el valor posicional del dígito ${dig}?`, answer: val, wrong,
        steps: [`El ${dig} está en el lugar de las ${names[pos]}.`, `Su valor es ${dig} × ${num(10 ** pos)} = ${num(val)}.`]
      };
    }
    const k = d + 1, positions = r.sample([...Array(len).keys()], k).sort((x, y) => y - x);
    const terms = positions.map(p => ({ p, dg: r.int(1, 9) }));
    const m = terms.reduce((s, t) => s + t.dg * 10 ** t.p, 0);
    const swap = terms.map(t => ({ ...t }));
    [swap[0].dg, swap[1].dg] = [swap[1].dg, swap[0].dg];
    const wswap = swap.reduce((s, t) => s + t.dg * 10 ** t.p, 0);
    return {
      text: `¿Qué número se obtiene al calcular ${terms.map(t => `${t.dg} × ${num(10 ** t.p)}`).join(' + ')}?`,
      answer: m, wrong: [wswap, m * 10, m / 10, m - terms[terms.length - 1].dg * 10 ** terms[terms.length - 1].p, m + 1],
      steps: terms.map(t => `${t.dg} × ${num(10 ** t.p)} = ${num(t.dg * 10 ** t.p)}`).concat([`Se suman todos: ${num(m)}.`])
    };
  } });

  O.reg({ id: 'num.redondeo', topic: T, name: 'Aproximar números', gen(r, d) {
    const len = [4, 5, 6][d - 1];
    const places = [[10, 'decena'], [100, 'centena'], [1000, 'unidad de mil'], [10000, 'decena de mil'], [100000, 'centena de mil']];
    const idx = d === 1 ? r.int(0, 1) : d === 2 ? r.int(1, 2) : r.int(2, 4);
    const [p, name] = places[idx];
    let n = r.int(10 ** (len - 1), 10 ** len - 2);
    if (n % p === 0) n++;
    const fl = Math.floor(n / p) * p, rd = Math.round(n / p) * p, dig = Math.floor((n % p) / (p / 10));
    return {
      text: `¿Cuál es la aproximación de ${num(n)} a la ${name} más cercana?`, answer: rd,
      wrong: [fl, fl + p, Math.round(n / (p * 10)) * p * 10, Math.round(n / (p / 10)) * (p / 10), rd + p, rd - p],
      steps: [`Se mira la cifra siguiente a la ${name}: es ${dig}.`,
        dig >= 5 ? `Como ${dig} es 5 o más, se sube a la ${name} siguiente.` : `Como ${dig} es menor que 5, la ${name} se mantiene.`,
        `El número aproximado es ${num(rd)}.`]
    };
  } });

  O.reg({ id: 'num.reparto_resto', topic: T, name: 'Repartos con resto', gen(r, d) {
    const item = r.pick([['lápices', 'm'], ['figuritas', 'f'], ['galletas', 'f'], ['naranjas', 'f'], ['bombones', 'm']]);
    const box = r.pick([['caja', 'cajas', 'f'], ['sobre', 'sobres', 'm'], ['bolsa', 'bolsas', 'f'], ['cajón', 'cajones', 'm']]);
    const qi = item[1] === 'f' ? 'Cuántas' : 'Cuántos', qb = box[2] === 'f' ? 'Cuántas' : 'Cuántos';
    const k = d === 1 ? r.int(4, 9) : d === 2 ? r.int(12, 48) : r.int(25, 99);
    let n = d === 1 ? r.int(100, 900) : d === 2 ? r.int(1000, 5000) : r.int(5000, 90000);
    n = n - (n % k) + r.int(1, k - 1);
    const q = Math.floor(n / k), rem = n % k;
    const kind = r.int(0, 2);
    if (kind === 0) return {
      text: `Se tienen ${num(n)} ${item[0]}, que se guardan en ${box[1]} con ${k} en cada ${box[0]}. ¿${qb} ${box[1]} se llenan por completo?`,
      answer: q, wrong: [q + 1, rem, q - 1, q + rem],
      steps: [`Se divide ${num(n)} ÷ ${k} = ${num(q)} y sobran ${rem}.`, `Se llenan ${num(q)} ${box[1]} por completo.`]
    };
    if (kind === 1) return {
      text: `Se tienen ${num(n)} ${item[0]}, que se guardan en ${box[1]} con ${k} en cada ${box[0]}. ¿${qi} ${item[0]} sobran sin guardar?`,
      answer: rem, wrong: [q, k - rem, rem + 1, rem - 1],
      steps: [`Se divide ${num(n)} ÷ ${k} = ${num(q)} y el resto es ${rem}.`, `Sobran ${rem} ${item[0]}.`]
    };
    return {
      text: `Se tienen ${num(n)} ${item[0]} y en cada ${box[0]} caben ${k}. ¿${qb} ${box[1]} se necesitan para guardar todos los objetos?`.replace('todos los objetos', item[1] === 'f' ? 'todas' : 'todos'),
      answer: q + 1, wrong: [q, q + 2, rem, q - 1],
      steps: [`Se divide ${num(n)} ÷ ${k} = ${num(q)} y sobran ${rem}.`, `Para esas ${rem} hace falta ${box[2] === 'f' ? 'otra' : 'otro'} ${box[0]} más: ${num(q)} + 1 = ${num(q + 1)}.`]
    };
  } });

  O.reg({ id: 'num.compras', topic: T, name: 'Compra y venta (ganancia)', dev: true, gen(r, d) {
    const p = U.person(r), n = d === 1 ? r.int(3, 8) : r.int(6, 15);
    const k = r.pick([10, 12, 20, 24]), cu = r.step(50, 300, 10), m = r.pick([20, 30, 40, 50, 60]);
    const box = k * cu, s = cu + m, units = n * k, cost = n * box;
    const art = r.pick(['lápices', 'gomas de borrar', 'cuadernos pequeños', 'pulseras']);
    if (d === 1) {
      const profit = n * k * m;
      return {
        text: `${p.name} compra ${n} cajas de ${art}. Cada caja contiene ${k} unidades y cuesta ${$(box)}. ${p.name} vende todas las unidades a ${$(s)} cada una. ¿Cuál es la ganancia total de ${p.name}?`,
        answer: profit, unit: '$', wrong: [units * s, cost, k * m, profit + box, units * m - cost],
        steps: [`Costo: ${n} × ${$(box)} = ${$(cost)}.`, `Unidades: ${n} × ${k} = ${units}. Ingreso: ${units} × ${$(s)} = ${$(units * s)}.`, `Ganancia: ${$(units * s)} − ${$(cost)} = ${$(profit)}.`]
      };
    }
    if (d === 2) {
      const x = r.int(2, k), sold = units - x, profit = sold * s - cost;
      if (profit <= 0) U.fail();
      return {
        text: `${p.name} compra ${n} cajas de ${art}. Cada caja contiene ${k} unidades y cuesta ${$(box)}. ${p.name} vende todas las unidades, excepto ${x}, a ${$(s)} cada una. ¿Cuál es la ganancia de ${p.name}?`,
        answer: profit, unit: '$', wrong: [units * s - cost, sold * s, cost, profit + x * s, profit - x * cu],
        steps: [`Costo: ${n} × ${$(box)} = ${$(cost)}.`, `Vende ${units} − ${x} = ${sold} unidades.`, `Ingreso: ${sold} × ${$(s)} = ${$(sold * s)}.`, `Ganancia: ${$(sold * s)} − ${$(cost)} = ${$(profit)}.`]
      };
    }
    const kk = r.pick([10, 12, 20, 24]), box3 = kk * cu, units3 = n * kk, cost3 = n * box3, half = units3 / 2, s2 = s - 10;
    const income = half * s + half * s2, profit = income - cost3;
    if (profit <= 0) U.fail();
    return {
      text: `${p.name} compra ${n} cajas de ${art}. Cada caja contiene ${kk} unidades y cuesta ${$(box3)}. ${p.name} vende la mitad de las unidades a ${$(s)} cada una y la otra mitad, en oferta, a ${$(s2)} cada una. ¿Cuál es la ganancia total de ${p.name}?`,
      answer: profit, unit: '$', wrong: [income, units3 * s - cost3, cost3, half * s - cost3, profit + 10 * half],
      steps: [`Costo: ${n} × ${$(box3)} = ${$(cost3)}.`, `Unidades: ${n} × ${kk} = ${units3}; la mitad son ${half}.`, `Ingreso: ${half} × ${$(s)} + ${half} × ${$(s2)} = ${$(half * s)} + ${$(half * s2)} = ${$(income)}.`, `Ganancia: ${$(income)} − ${$(cost3)} = ${$(profit)}.`]
    };
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
