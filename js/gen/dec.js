/* Tema 4: Decimales y porcentajes */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U, num = U.num, $ = U.money, fr = U.fr, F = U.frac, T = 'dec';
  const R = x => U.round(x, 6);

  O.reg({ id: 'dec.suma_resta', topic: T, name: 'Sumar y restar decimales', gen(r, d) {
    const p = U.person(r);
    if (d === 1) {
      const A = r.int(15, 95), B = r.int(15, 95), s = R((A + B) / 10);
      return {
        text: `${p.name} tiene dos listones. Uno mide ${num(A / 10)} m y el otro ${num(B / 10)} m. ¿Cuántos metros miden juntos?`,
        answer: s, unit: 'm', wrong: [R((A + B) / 100), R(s * 10), R(Math.abs(A - B) / 10), R(s + 1)],
        steps: [`Se alinean las comas y se suma: ${num(A / 10)} + ${num(B / 10)} = ${num(s)}.`]
      };
    }
    if (d === 2) {
      const A = r.int(1000, 9999), B = r.int(11, 99), s = R(A / 100 + B / 10);
      return {
        text: `${p.name} corrió ${num(A / 100)} km el lunes y ${num(B / 10)} km el martes. ¿Cuántos kilómetros corrió en total?`,
        answer: s, unit: 'km', wrong: [R((A + B) / 100), R(s * 10), R(s / 10), R(A / 100 + B / 100 * 10 + 1)],
        steps: [`Se escribe ${num(B / 10)} como ${num(B * 10 / 100)} para alinear las cifras decimales.`, `${num(A / 100)} + ${num(B * 10 / 100)} = ${num(s)}.`]
      };
    }
    const A = r.int(2000, 6000), B = r.int(100, 900), C = r.int(500, 2500);
    const s = R(A / 100 + B / 10 - C / 100);
    if (s <= 0) U.fail();
    return {
      text: `Un estanque tenía ${num(A / 100)} litros de agua. Se le agregaron ${num(B / 10)} litros y luego se sacaron ${num(C / 100)} litros. ¿Cuántos litros quedaron?`,
      answer: s, unit: 'L', wrong: [R(A / 100 + B / 10 + C / 100), R(A / 100 - B / 10 - C / 100 > 0 ? A / 100 - B / 10 - C / 100 : A / 100), R((A + B - C) / 100), R(s * 10), R(s + 1)],
      steps: [`Primero se suma: ${num(A / 100)} + ${num(B / 10)} = ${num(R(A / 100 + B / 10))}.`, `Luego se resta: ${num(R(A / 100 + B / 10))} − ${num(C / 100)} = ${num(s)}.`]
    };
  } });

  O.reg({ id: 'dec.mult_div', topic: T, name: 'Multiplicar y dividir decimales', gen(r, d) {
    if (d === 1) {
      const a = r.int(11, 99) / 10, n = r.int(2, 9), ans = R(a * n);
      const obj = r.pick(['bolsa de naranjas', 'tabla de madera', 'paquete de arroz', 'cinta']);
      const u = obj.startsWith('bolsa') || obj.startsWith('paquete') ? 'kg' : 'm';
      return {
        text: `Cada ${obj} ${u === 'kg' ? 'pesa' : 'mide'} ${num(a)} ${u}. ¿Cuántos ${u === 'kg' ? 'kilogramos pesan' : 'metros miden'} ${n} iguales?`,
        answer: ans, unit: u, wrong: [R(ans * 10), R(ans / 10), R(a + n), R(a * (n + 1))],
        steps: [`${num(a)} × ${n} = ${num(ans)}.`, `Se multiplica como si fueran enteros (${a * 10} × ${n} = ${a * 10 * n}) y se vuelve a poner la coma: ${num(ans)}.`]
      };
    }
    if (d === 2) {
      const n = r.int(3, 9), q = r.int(12, 99) / 10 + (r.chance(0.5) ? r.int(1, 9) / 100 : 0), total = R(q * n);
      return {
        text: `Se reparten ${num(total)} litros de jugo en ${n} jarras iguales. ¿Cuántos litros hay en cada jarra?`,
        answer: R(q), unit: 'L', wrong: [R(q * 10), R(q / 10), R(total - n), R(q + 0.1)],
        steps: [`Se divide ${num(total)} ÷ ${n} = ${num(R(q))}.`, `Comprobación: ${num(R(q))} × ${n} = ${num(total)}.`]
      };
    }
    if (r.chance(0.5)) {
      const a = r.int(11, 59) / 10, b = r.int(11, 59) / 10, ans = R(a * b);
      return {
        text: `Una terraza rectangular mide ${num(a)} m de largo y ${num(b)} m de ancho. ¿Cuál es su área en m²?`,
        answer: ans, unit: 'm²', wrong: [R(ans * 10), R(ans / 10), R(2 * (a + b)), R(a + b)],
        steps: [`Área = largo × ancho = ${num(a)} × ${num(b)}.`, `${a * 10} × ${b * 10} = ${R(a * b * 100)}; como hay dos cifras decimales en total, ${num(ans)}.`]
      };
    }
    const dv = r.pick([0.2, 0.25, 0.4, 0.5, 0.75, 1.5]), q = r.int(5, 40), total = R(dv * q);
    return {
      text: `De una cuerda de ${num(total)} m se cortan trozos de ${num(dv)} m cada uno. ¿Cuántos trozos se obtienen?`,
      answer: q, wrong: [q * 10, R(total * dv), q + 1, q - 1],
      steps: [`Se divide ${num(total)} ÷ ${num(dv)}.`, `Se multiplican ambos por ${dv * 100 % 10 === 0 ? 10 : 100} para no tener decimales: ${num(R(total * (dv * 100 % 10 === 0 ? 10 : 100)))} ÷ ${num(R(dv * (dv * 100 % 10 === 0 ? 10 : 100)))} = ${q}.`]
    };
  } });

  O.reg({ id: 'dec.comparar', topic: T, name: 'Comparar y ordenar decimales', mcOnly: true, gen(r, d) {
    const I = r.int(0, 9), vals = [];
    const big = r.chance(0.5);
    let guard = 0;
    const lead = r.int(1, 9);
    while (vals.length < 4 && guard++ < 300) {
      const len = r.int(1, d === 1 ? 2 : 3);
      let digits = String(r.int(1, 10 ** len - 1)).padStart(len, '0');
      if (d === 3 && digits[0] !== String(lead)) digits = String(lead) + digits.slice(1);
      const v = R(I + Number('0.' + digits));
      if (!vals.includes(v)) vals.push(v);
    }
    if (vals.length < 4) U.fail();
    const sorted = vals.slice().sort((x, y) => x - y), ans = big ? sorted[3] : sorted[0];
    return {
      text: `¿Cuál de estos números decimales es el ${big ? 'mayor' : 'menor'}?`, answer: ans, wrong: vals.filter(v => v !== ans),
      steps: [`Se comparan cifra a cifra desde la coma, completando con ceros: ${sorted.map(v => num(v)).join(' < ')}.`, `El ${big ? 'mayor' : 'menor'} es ${num(ans)}.`]
    };
  } });

  O.reg({ id: 'dec.porcentaje_de', topic: T, name: 'Calcular porcentajes', gen(r, d) {
    if (d === 1) {
      const p = r.pick([10, 20, 25, 50, 75]), N = 20 * r.int(3, 40), ans = N * p / 100;
      return {
        text: `¿Cuánto es el ${p} % de ${num(N)}?`, answer: ans,
        wrong: [N * p, N / p, N - ans, ans * 10],
        steps: [`${p} % = ${p}/100 = ${num(p / 100)}.`, `${num(N)} × ${num(p / 100)} = ${num(ans)}.`]
      };
    }
    if (d === 2) {
      const p = r.pick([5, 15, 30, 35, 40, 45, 60, 12, 8, 90]), N = r.pick([20, 40, 50, 60, 80, 120, 200, 250, 300, 400, 500]) * r.int(1, 4), ans = N * p / 100;
      if (!Number.isInteger(ans)) U.fail();
      return {
        text: `¿Cuánto es el ${p} % de ${num(N)}?`, answer: ans,
        wrong: [N * p, N / p, N - ans, ans * 10, ans / 10],
        steps: [`El 10 % de ${num(N)} es ${num(N / 10)}, el 1 % es ${num(N / 100)}.`, `${p} % de ${num(N)} = ${num(N)} × ${p} ÷ 100 = ${num(ans)}.`]
      };
    }
    if (r.chance(0.5)) {
      const p = r.pick([10, 20, 25, 30, 40, 50, 60, 75]), q = r.pick([10, 20, 25, 40, 50]), N = 100 * r.int(2, 20);
      const m = N * q / 100, ans = m * p / 100;
      if (!Number.isInteger(ans)) U.fail();
      return {
        text: `¿Cuánto es el ${p} % del ${q} % de ${num(N)}?`, answer: ans,
        wrong: [N * (p + q) / 100, m, N * p / 100, ans * 10],
        steps: [`Primero el ${q} % de ${num(N)}: ${num(N)} × ${q} ÷ 100 = ${num(m)}.`, `Luego el ${p} % de ${num(m)}: ${num(m)} × ${p} ÷ 100 = ${num(ans)}.`]
      };
    }
    const p = r.pick([10, 20, 25, 30, 40, 50, 60, 75]), N = 20 * r.int(2, 40), v = N * p / 100;
    if (!Number.isInteger(v)) U.fail();
    return {
      text: `El ${p} % de un número es ${num(v)}. ¿Cuál es ese número?`, answer: N,
      wrong: [v * p / 100, v + p, v * p, Math.round(v / 10)],
      steps: [`Si el ${p} % es ${num(v)}, el 1 % es ${num(v)} ÷ ${p} = ${num(R(v / p))}.`, `El 100 % es ${num(R(v / p))} × 100 = ${num(N)}.`]
    };
  } });

  O.reg({ id: 'dec.descuento_aumento', topic: T, name: 'Descuentos, aumentos e IVA', dev: true, gen(r, d) {
    const P = 100 * r.int(5, 120), art = r.pick(['una mochila', 'unas zapatillas', 'un juego de mesa', 'una bicicleta', 'un balón', 'un reloj']);
    if (d === 1) {
      const p = r.pick([10, 20, 25, 30, 50]), disc = P * p / 100, fin = P - disc;
      return {
        text: `${art[0].toUpperCase() + art.slice(1)} cuesta ${$(P)} y tiene un ${p} % de descuento. ¿Cuánto hay que pagar?`,
        answer: fin, unit: '$', wrong: [disc, P + disc, P - p, fin + disc / 2 | 0],
        steps: [`Descuento: ${p} % de ${$(P)} = ${$(disc)}.`, `Precio final: ${$(P)} − ${$(disc)} = ${$(fin)}.`]
      };
    }
    if (d === 2) {
      const iva = r.chance(0.6), p = iva ? 19 : r.pick([10, 15, 20, 25, 30]), inc = P * p / 100, fin = P + inc;
      return {
        text: iva
          ? `El precio neto de ${art} es ${$(P)}. Al precio neto se le suma el IVA, que es 19 %. ¿Cuál es el precio final?`
          : `${art[0].toUpperCase() + art.slice(1)} costaba ${$(P)} y su precio subió un ${p} %. ¿Cuál es el nuevo precio?`,
        answer: fin, unit: '$', wrong: [inc, P - inc, P + p, fin + P / 10],
        steps: [`${p} % de ${$(P)} = ${$(inc)}.`, `Precio final: ${$(P)} + ${$(inc)} = ${$(fin)}.`]
      };
    }
    const p1 = r.pick([10, 20, 30, 40, 50]), p2 = r.pick([10, 20, 30]), step1 = P - P * p1 / 100, fin = step1 - step1 * p2 / 100;
    if (!Number.isInteger(fin)) U.fail();
    return {
      text: `${art[0].toUpperCase() + art.slice(1)} cuesta ${$(P)}. Primero le hacen un ${p1} % de descuento y, sobre el nuevo precio, otro ${p2} % de descuento. ¿Cuánto hay que pagar?`,
      answer: fin, unit: '$', wrong: [P - P * (p1 + p2) / 100, step1, P * (100 - p1) / 100 - P * p2 / 100, fin + 1000],
      steps: [`Primer descuento: ${p1} % de ${$(P)} = ${$(P * p1 / 100)}; queda ${$(step1)}.`, `Segundo descuento (sobre ${$(step1)}): ${p2} % = ${$(step1 * p2 / 100)}.`, `Precio final: ${$(step1)} − ${$(step1 * p2 / 100)} = ${$(fin)}.`, `Ojo: no es lo mismo que un descuento único de ${p1 + p2} %.`]
    };
  } });

  O.reg({ id: 'dec.conversiones', topic: T, name: 'Fracción, decimal y porcentaje', gen(r, d) {
    if (d === 1 || (d === 2 && r.chance(0.5))) {
      const b = r.pick(d === 1 ? [2, 4, 5, 10, 20, 25, 50] : [8, 40, 16, 20, 25]), a = r.int(1, b - 1);
      const p = R(a / b * 100);
      return {
        text: `Expresa ${fr(a, b)} como porcentaje.`, answer: p, unit: '%',
        wrong: [R(p / 10), R(p * 10), a, b, R(a / b)],
        steps: [`${fr(a, b)} = ${a} ÷ ${b} = ${num(R(a / b))}.`, `${num(R(a / b))} × 100 = ${num(p)} %.`]
      };
    }
    if (d === 2) {
      const [a, b] = r.pick([[35, 100], [45, 100], [6, 10], [125, 1000], [8, 100], [75, 100], [24, 100]]);
      const dec = a / b, f = F(a, b);
      return {
        text: `Expresa ${num(dec)} como fracción irreducible.`, answer: f,
        wrong: [F(a, b * 10), F(a * 10, b), F(1, a), F(b, a), F(a + 1, b)],
        steps: [`${num(dec)} = ${fr(a, b)}.`, `Se simplifica dividiendo por ${U.gcd(a, b)}: ${U.fmt(f)}.`]
      };
    }
    const W = r.pick([20, 25, 40, 50, 80, 200, 250, 400, 500]), part = r.int(1, W - 1), p = R(part / W * 100);
    return {
      text: `¿Qué porcentaje de ${W} es ${part}?`, answer: p, unit: '%',
      wrong: [R(p / 10), R(p * 10), R(part / W), R(W / part), R(100 - p)],
      steps: [`Se divide la parte por el total: ${part} ÷ ${W} = ${num(R(part / W))}.`, `Se multiplica por 100: ${num(R(part / W))} × 100 = ${num(p)} %.`]
    };
  } });

  O.reg({ id: 'dec.porcentaje_problema', topic: T, name: 'Problemas de porcentaje', dev: true, gen(r, d) {
    for (let tries = 0; tries < 200; tries++) {
      const N = 100 * r.int(d === 1 ? 1 : 2, d === 1 ? 4 : 8), p = r.pick([10, 20, 25, 30, 40, 50, 60, 75]), q = r.pick([10, 20, 25, 40, 50]);
      const a = N * p / 100, rest = N - a, b = rest * q / 100, none = rest - b;
      if (![a, rest, b, none].every(Number.isInteger)) continue;
      if (d === 1) {
        const kind = r.pick(['niñas', 'ganó']);
        void kind;
        return {
          text: `En un colegio hay ${num(N)} estudiantes y el ${p} % son niñas. ¿Cuántos niños hay?`, answer: rest,
          wrong: [a, N - p, a + rest / 2, rest + a],
          steps: [`Niñas: ${p} % de ${num(N)} = ${num(a)}.`, `Niños: ${num(N)} − ${num(a)} = ${num(rest)}.`]
        };
      }
      if (d === 2) return {
        text: `En un curso de ${num(N)} estudiantes, el ${p} % practica fútbol. De los que no practican fútbol, el ${q} % practica básquetbol. ¿Cuántos estudiantes no practican ninguno de los dos deportes?`,
        answer: none, wrong: [N - a - N * q / 100, rest, b, N - a - b + b],
        steps: [`Fútbol: ${p} % de ${num(N)} = ${num(a)}. No practican fútbol: ${num(N)} − ${num(a)} = ${num(rest)}.`, `Básquetbol: ${q} % de ${num(rest)} = ${num(b)}.`, `Ninguno: ${num(rest)} − ${num(b)} = ${num(none)}.`]
      };
      return {
        text: `En un curso de ${num(N)} estudiantes, el ${p} % practica fútbol. De los que no practican fútbol, el ${q} % practica básquetbol. ¿Qué porcentaje del curso no practica ninguno de los dos deportes?`,
        answer: R(none / N * 100), unit: '%', wrong: [R(100 - p - q), R(rest / N * 100), R(b / N * 100), R(a / N * 100)],
        steps: [`Fútbol: ${num(a)} estudiantes. Sin fútbol: ${num(rest)}.`, `Básquetbol: ${q} % de ${num(rest)} = ${num(b)}.`, `Ninguno: ${num(rest)} − ${num(b)} = ${num(none)} estudiantes.`, `${num(none)} ÷ ${num(N)} = ${num(R(none / N))} → ${num(R(none / N * 100))} %.`]
      };
    }
    U.fail();
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
