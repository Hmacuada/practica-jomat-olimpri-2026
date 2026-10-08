/* Tema 2: Múltiplos, divisores, factores primos, MCM y MCD, criterios de divisibilidad */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U, num = U.num, T = 'div';

  const CRITERIA = {
    2: 'Un número es divisible por 2 si termina en cifra par (0, 2, 4, 6, 8).',
    3: 'Un número es divisible por 3 si la suma de sus cifras es múltiplo de 3.',
    4: 'Un número es divisible por 4 si el número formado por sus dos últimas cifras es múltiplo de 4.',
    5: 'Un número es divisible por 5 si termina en 0 o en 5.',
    6: 'Un número es divisible por 6 si es par y además divisible por 3.',
    8: 'Un número es divisible por 8 si el número formado por sus tres últimas cifras es múltiplo de 8.',
    9: 'Un número es divisible por 9 si la suma de sus cifras es múltiplo de 9.',
    10: 'Un número es divisible por 10 si termina en 0.',
    12: 'Un número es divisible por 12 si es divisible por 3 y por 4 a la vez.'
  };
  const digitSum = n => String(n).split('').reduce((s, c) => s + +c, 0);

  O.reg({ id: 'div.divisibilidad', topic: T, name: 'Criterios de divisibilidad', mcOnly: true, gen(r, d) {
    const k = r.pick(d === 1 ? [2, 3, 5, 10] : d === 2 ? [3, 4, 6, 9] : [4, 6, 8, 9, 12]);
    const lo = d === 1 ? 100 : 1000, hi = d === 1 ? 999 : d === 2 ? 9999 : 99999;
    const m = r.int(Math.ceil(lo / k), Math.floor(hi / k)) * k;
    const wrong = [];
    let guard = 0;
    while (wrong.length < 3 && guard++ < 200) {
      const j = r.int(1, 2 * k) * (r.chance(0.5) ? 1 : -1);
      const w = m + j;
      if (j % k === 0 || w <= 0 || wrong.includes(w)) continue;
      wrong.push(w);
    }
    let extra = '';
    if (k === 3 || k === 9) extra = ` Por ejemplo, ${num(m)}: ${String(m).split('').join(' + ')} = ${digitSum(m)}.`;
    return {
      text: `¿Cuál de estos números es divisible por ${k}?`, answer: m, wrong,
      steps: [CRITERIA[k], `El único que cumple es ${num(m)}.${extra}`]
    };
  } });

  O.reg({ id: 'div.cuenta_multiplos', topic: T, name: 'Contar múltiplos', gen(r, d) {
    if (d <= 2) {
      const k = d === 1 ? r.int(3, 9) : r.int(4, 12);
      const N = d === 1 ? r.int(50, 120) : r.int(300, 900), A = d === 1 ? 1 : r.int(40, 200);
      const cnt = Math.floor(N / k) - Math.ceil(A / k) + 1;
      if (cnt < 4) U.fail();
      return {
        text: `¿Cuántos múltiplos de ${k} hay entre ${A} y ${N}, contando ${A === 1 ? 'el 1 y ' : ''}los extremos si corresponde?`,
        answer: cnt, wrong: [cnt + 1, cnt - 1, Math.floor((N - A) / k), Math.floor(N / k)],
        steps: [`El primer múltiplo de ${k} desde ${A} es ${Math.ceil(A / k) * k} (${Math.ceil(A / k)} × ${k}).`,
          `El último múltiplo hasta ${N} es ${Math.floor(N / k) * k} (${Math.floor(N / k)} × ${k}).`,
          `Hay ${Math.floor(N / k)} − ${Math.ceil(A / k)} + 1 = ${cnt} múltiplos.`]
      };
    }
    const [a, b] = r.pick([[4, 6], [6, 9], [4, 10], [6, 8], [10, 15], [8, 12], [6, 10]]);
    const L = U.lcm(a, b), N = r.int(200, 1000), c = Math.floor(N / L);
    if (c < 3) U.fail();
    return {
      text: `¿Cuántos números del 1 al ${N} son múltiplos de ${a} y de ${b} a la vez?`,
      answer: c, wrong: [Math.floor(N / a) + Math.floor(N / b), c + 1, c - 1, Math.floor(N / (a * b))],
      steps: [`Los números que son múltiplos de ${a} y de ${b} son los múltiplos de su MCM.`, `MCM(${a}, ${b}) = ${L}.`, `${N} ÷ ${L} = ${(N / L).toFixed(2).replace('.', ',')} → hay ${c} múltiplos de ${L} hasta ${N}.`]
    };
  } });

  O.reg({ id: 'div.divisores', topic: T, name: 'Cantidad de divisores', gen(r, d) {
    let n, guard = 0;
    do { n = d === 1 ? r.int(12, 50) : d === 2 ? r.int(50, 130) : r.int(130, 360); } while (U.divisors(n).length < 6 && ++guard < 100);
    const ds = U.divisors(n), t = ds.length, f = U.factorize(n);
    const steps = [`Los divisores de ${n} son: ${ds.join(', ')}.`, `En total son ${t} divisores.`];
    if (d === 3) steps.push(`También se puede calcular: ${n} = ${U.factStr(n)}; se suman 1 a cada exponente y se multiplica: ${f.map(([, e]) => `(${e}+1)`).join(' × ')} = ${t}.`);
    return {
      text: `¿Cuántos divisores tiene el número ${n}?`, answer: t,
      wrong: [t - 1, t + 1, t - 2, f.reduce((s, [, e]) => s + e, 0), t + 2], steps
    };
  } });

  O.reg({ id: 'div.factores_primos', topic: T, name: 'Factores primos', gen(r, d) {
    const primes = [2, 3, 5, 7, 11, 13];
    const maxN = d === 1 ? 100 : d === 2 ? 500 : 3000;
    let n, f, guard = 0;
    do {
      const ps = r.sample(primes, r.int(2, 3)).sort((a, b) => a - b);
      n = 1; f = [];
      ps.forEach(p => { const e = r.int(1, d === 1 ? 2 : 3); n *= p ** e; f.push([p, e]); });
    } while ((n > maxN || n < 12) && ++guard < 100);
    if (n > maxN) U.fail();
    const ps = f.map(x => x[0]), fs = U.factStr(n), kind = r.int(0, 2);
    if (kind === 0) return {
      text: `¿Cuál es el mayor factor primo de ${num(n)}?`, answer: Math.max(...ps),
      wrong: [ps.length > 1 ? ps[ps.length - 2] : ps[0] + 2, n / ps[0], ps.reduce((s, x) => s + x, 0), f[f.length - 1][1]],
      steps: [`Se descompone: ${num(n)} = ${fs}.`, `Los factores primos son ${ps.join(', ')}; el mayor es ${Math.max(...ps)}.`]
    };
    if (kind === 1) return {
      text: `Descompón ${num(n)} en factores primos. ¿Cuánto suman sus factores primos distintos?`, answer: ps.reduce((s, x) => s + x, 0),
      wrong: [f.reduce((s, [p, e]) => s + p * e, 0), ps.reduce((a, b) => a * b, 1), Math.max(...ps), ps.reduce((s, x) => s + x, 0) + 1],
      steps: [`${num(n)} = ${fs}.`, `Factores primos distintos: ${ps.join(', ')}.`, `Su suma es ${ps.join(' + ')} = ${ps.reduce((s, x) => s + x, 0)}.`]
    };
    const cnt = f.reduce((s, [, e]) => s + e, 0);
    return {
      text: `Si se escribe ${num(n)} como producto de factores primos (repitiendo los que se repiten), ¿cuántos factores primos se usan en total?`, answer: cnt,
      wrong: [ps.length, cnt + 1, cnt - 1, cnt + 2],
      steps: [`${num(n)} = ${fs}.`, `Contando cada repetición: ${f.map(([p, e]) => `${p} aparece ${e} ${e === 1 ? 'vez' : 'veces'}`).join(', ')}.`, `En total hay ${cnt} factores.`]
    };
  } });

  O.reg({ id: 'div.mcm_mcd', topic: T, name: 'MCM y MCD', gen(r, d) {
    let nums;
    if (d < 3) {
      let guard = 0;
      do {
        nums = d === 1 ? [r.int(4, 20), r.int(4, 20)] : [r.int(12, 60), r.int(12, 60)];
      } while ((nums[0] === nums[1] || U.gcd(nums[0], nums[1]) === 1) && ++guard < 100);
    } else {
      const g = r.int(2, 12), ms = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 3);
      nums = ms.map(m => g * m);
    }
    const wantLcm = r.chance(0.5), g = U.gcdAll(nums), l = U.lcmAll(nums), prod = nums.reduce((a, b) => a * b, 1);
    const fx = nums.map(n => `${n} = ${U.factStr(n)}`).join('; ');
    const list = nums.join(', ').replace(/, (\d+)$/, ' y $1');
    if (wantLcm) return {
      text: `¿Cuál es el mínimo común múltiplo (MCM) de ${list}?`, answer: l,
      wrong: [g, prod, l * 2, l / 2, l + nums[0]],
      steps: [`Se descompone cada número: ${fx}.`, `El MCM usa todos los factores primos con su mayor exponente.`, `MCM = ${l}.`]
    };
    return {
      text: `¿Cuál es el máximo común divisor (MCD) de ${list}?`, answer: g,
      wrong: [l, Math.min(...nums), g * 2, g / 2, g + 1],
      steps: [`Se descompone cada número: ${fx}.`, `El MCD usa solo los factores primos comunes con su menor exponente.`, `MCD = ${g}.`]
    };
  } });

  O.reg({ id: 'div.mcm_mcd_contexto', topic: T, name: 'Problemas de MCM y MCD', dev: true, gen(r, d) {
    if (r.chance(0.5)) {
      const POOL = d === 1 ? [4, 6, 8, 9, 10, 12, 15] : [4, 6, 8, 9, 10, 12, 15, 18, 20];
      let pair, L, H = 0, guard = 0;
      do {
        pair = r.sample(POOL, d === 3 ? 3 : 2);
        L = U.lcmAll(pair);
        const hs = [2, 3, 4, 5].filter(h => (60 * h) % L !== 0 && Math.floor(60 * h / L) >= 2);
        H = hs.length ? r.pick(hs) : 0;
      } while (!H && d > 1 && ++guard < 200);
      const tot = 60 * H;
      const list = pair.join(', ').replace(/, (\d+)$/, ' y $1');
      const lights = pair.length === 2 ? 'Dos luces' : 'Tres luces';
      if (d === 1) {
        return {
          text: `${lights} se encienden al mismo tiempo ahora. Se vuelven a encender cada ${list} minutos, respectivamente. ¿Después de cuántos minutos se encenderán juntas otra vez?`,
          answer: L, unit: 'min', wrong: [pair.reduce((a, b) => a * b, 1), U.gcdAll(pair), L * 2, pair.reduce((s, x) => s + x, 0)],
          steps: [`Hay que encontrar el MCM de ${list}.`, `MCM = ${L}.`, `Se encenderán juntas otra vez después de ${L} minutos.`]
        };
      }
      const cnt = Math.floor(tot / L);
      if (!H || cnt < 2 || tot % L === 0 || L < 6) U.fail();
      return {
        text: `${lights} se encienden al mismo tiempo ahora. Se vuelven a encender cada ${list} minutos, respectivamente. En las próximas ${H} horas, ¿cuántas veces se encienden juntas de nuevo (sin contar el momento de partida)?`,
        answer: cnt, wrong: [cnt + 1, cnt - 1, Math.floor(tot / pair[0]), L],
        steps: [`MCM de ${list} = ${L}: coinciden cada ${L} minutos.`, `${H} horas = ${tot} minutos.`, `${tot} ÷ ${L} = ${(tot / L).toFixed(2).replace('.', ',')}; solo cuentan los ciclos completos: ${cnt} veces.`]
      };
    }
    const g = r.int(2, 9);
    if (d < 3) {
      const [x, y] = r.sample([2, 3, 4, 5, 6, 7, 8, 9, 10], 2).sort((a, b) => a - b);
      const a = g * x, b = g * y, gg = U.gcd(a, b);
      const ask = d === 1 ? 0 : 1;
      return {
        text: `En un curso hay ${a} niñas y ${b} niños. Se quieren formar equipos con la misma cantidad de niñas y de niños, sin que sobre nadie y usando a todos. ${ask === 0 ? '¿Cuántos equipos se pueden formar como máximo?' : 'Si se forma el máximo de equipos, ¿cuántas niñas tiene cada equipo?'}`,
        answer: ask === 0 ? gg : a / gg, wrong: ask === 0 ? [U.lcm(a, b), a + b, gg * 2, Math.min(a, b)] : [gg, b / gg, a, a / gg + 1],
        steps: [`El máximo número de equipos es el MCD de ${a} y ${b}.`, `MCD(${a}, ${b}) = ${gg}.`, ask === 0 ? `Se pueden formar ${gg} equipos.` : `Cada equipo tiene ${a} ÷ ${gg} = ${a / gg} niñas.`]
      };
    }
    const m = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 3), a = g * m[0], b = g * m[1], c = g * m[2], gg = U.gcdAll([a, b, c]);
    return {
      text: `Una tienda tiene ${a} cuadernos, ${b} lápices y ${c} gomas. Se arman paquetes iguales con los tres productos, sin que sobre ninguno y con la mayor cantidad posible de paquetes. ¿Cuántos productos en total tiene cada paquete?`,
      answer: (a + b + c) / gg, wrong: [gg, a + b + c, (a + b + c) / gg + gg, (a + b + c) / (gg * 2)],
      steps: [`La mayor cantidad de paquetes es el MCD de ${a}, ${b} y ${c}.`, `MCD = ${gg}, así que se arman ${gg} paquetes.`, `Cada uno lleva ${a / gg} cuadernos, ${b / gg} lápices y ${c / gg} gomas.`, `Productos por paquete: ${a / gg} + ${b / gg} + ${c / gg} = ${(a + b + c) / gg}.`]
    };
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
