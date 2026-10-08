/* Tema 10: Datos, promedio, moda, mediana y probabilidad básica */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U, num = U.num, fr = U.fr, F = U.frac, T = 'dat';
  const R = x => U.round(x, 6);
  const listText = a => a.map(num).join(', ').replace(/, ([^,]+)$/, ' y $1');

  O.reg({ id: 'dat.promedio', topic: T, name: 'Promedio (media aritmética)', gen(r, d) {
    const p = U.person(r);
    const variant = d === 1 ? 0 : d === 2 ? r.pick([1, 2]) : r.pick([2, 3]);
    if (variant === 0) {
      const n = r.int(4, 6);
      for (let t = 0; t < 100; t++) {
        const v = Array.from({ length: n }, () => r.int(5, 40)), S = v.reduce((a, b) => a + b, 0);
        if (S % n) continue;
        return {
          text: `${p.name} obtuvo los siguientes puntajes en cinco partidas de un juego: ${listText(v)}. ¿Cuál es el promedio de sus puntajes?`.replace('cinco', ['cuatro', 'cinco', 'seis'][n - 4]),
          answer: S / n, wrong: [S, Math.max(...v), S / n + 1, S / (n + 1), [...v].sort((a, b) => a - b)[Math.floor(n / 2)]],
          steps: [`Se suman todos los puntajes: ${v.join(' + ')} = ${S}.`, `Se divide por la cantidad de datos (${n}): ${S} ÷ ${n} = ${S / n}.`]
        };
      }
      U.fail();
    }
    if (variant === 1) {
      const n = r.pick([4, 5]);
      for (let t = 0; t < 100; t++) {
        const g = Array.from({ length: n }, () => r.int(30, 70)), S = g.reduce((a, b) => a + b, 0);
        if (S % n) continue;
        return {
          text: `Las notas de ${p.name} en ${n === 4 ? 'cuatro' : 'cinco'} pruebas fueron ${listText(g.map(x => x / 10))}. ¿Cuál es el promedio de sus notas?`,
          answer: R(S / n / 10), wrong: [R(S / 10), R(S / (n + 1) / 10), R(S / n), R(Math.max(...g) / 10), R(S / n / 10 + 0.1)],
          steps: [`Se suman las notas: ${g.map(x => num(x / 10)).join(' + ')} = ${num(S / 10)}.`, `Se divide por ${n}: ${num(S / 10)} ÷ ${n} = ${num(R(S / n / 10))}.`]
        };
      }
      U.fail();
    }
    if (variant === 2) {
      const n = r.pick([4, 5]);
      for (let t = 0; t < 100; t++) {
        const g = Array.from({ length: n }, () => r.int(30, 70)), S = g.reduce((a, b) => a + b, 0);
        if (S % n) continue;
        const known = g.slice(0, n - 1), x = g[n - 1], m = S / n / 10;
        return {
          text: `El promedio de las ${n === 4 ? 'cuatro' : 'cinco'} notas de ${p.name} es ${num(m)}. Las primeras ${n - 1} notas fueron ${listText(known.map(v => v / 10))}. ¿Qué nota obtuvo en la última prueba?`,
          answer: x / 10, wrong: [m, R(known.reduce((a, b) => a + b, 0) / (n - 1) / 10), R(S / 10), R((x + 5) / 10), R(Math.min(7, (x + 10) / 10))],
          steps: [`Si el promedio es ${num(m)} con ${n} notas, las notas suman ${num(m)} × ${n} = ${num(R(m * n))}.`, `Las ${n - 1} primeras suman ${num(R(known.reduce((a, b) => a + b, 0) / 10))}.`, `La última es ${num(R(m * n))} − ${num(R(known.reduce((a, b) => a + b, 0) / 10))} = ${num(x / 10)}.`]
        };
      }
      U.fail();
    }
    const n = r.int(3, 7), m = r.int(8, 30), m2 = m + r.int(2, 6), x = m2 * (n + 1) - n * m;
    return {
      text: `El promedio de ${n} números es ${m}. Al agregar un número más, el promedio sube a ${m2}. ¿Cuál es el número que se agregó?`, answer: x,
      wrong: [m2, n * m, m2 * (n + 1), x - m, x + n],
      steps: [`Al principio los ${n} números suman ${n} × ${m} = ${n * m}.`, `Con el nuevo, son ${n + 1} números con promedio ${m2}: suman ${n + 1} × ${m2} = ${m2 * (n + 1)}.`, `El número agregado es ${m2 * (n + 1)} − ${n * m} = ${x}.`]
    };
  } });

  O.reg({ id: 'dat.moda_mediana', topic: T, name: 'Moda, mediana y rango', gen(r, d) {
    const ask = d === 1 ? 'moda' : d === 2 ? r.pick(['mediana', 'moda']) : r.pick(['mediana', 'rango']);
    const n = d === 1 ? 7 : d === 2 ? 9 : 8, mx = d === 1 ? 9 : 20;
    for (let t = 0; t < 300; t++) {
      const v = Array.from({ length: n }, () => r.int(1, mx)), freq = {};
      v.forEach(x => { freq[x] = (freq[x] || 0) + 1; });
      const top = Math.max(...Object.values(freq)), modes = Object.keys(freq).filter(k => freq[k] === top);
      if (ask === 'moda' && (modes.length !== 1 || top < 2)) continue;
      if (ask !== 'moda' && modes.length !== 1 && t < 250) continue;
      const s = v.slice().sort((a, b) => a - b), med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2, range = s[n - 1] - s[0], mode = +modes[0];
      const data = v.join(', ');
      if (ask === 'moda') return {
        text: `Se registraron los siguientes datos: ${data}. ¿Cuál es la moda?`, answer: mode,
        wrong: [s[Math.floor(n / 2)], s[n - 1], s[0], R(v.reduce((a, b) => a + b, 0) / n), +Object.keys(freq).filter(k => +k !== mode).sort((a, b) => freq[b] - freq[a])[0]].map(x => Math.round(x)),
        steps: [`La moda es el dato que más se repite.`, `Conteo: ${Object.keys(freq).sort((a, b) => a - b).map(k => `${k} → ${freq[k]}`).join('; ')}.`, `La moda es ${mode}.`]
      };
      if (ask === 'mediana') return {
        text: `Se registraron los siguientes datos: ${data}. ¿Cuál es la mediana?`, answer: med,
        wrong: [v[Math.floor(n / 2)], mode, R(v.reduce((a, b) => a + b, 0) / n), s[Math.floor(n / 2)] + 1, s[n / 2 - 1] === undefined ? 1 : s[Math.floor((n - 1) / 2)]],
        steps: [`Primero se ordenan de menor a mayor: ${s.join(', ')}.`, n % 2 ? `Como hay ${n} datos (cantidad impar), la mediana es el del medio: el dato ${(n + 1) / 2}º, que es ${med}.` : `Como hay ${n} datos (cantidad par), la mediana es el promedio de los dos del medio: (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${num(med)}.`]
      };
      return {
        text: `Se registraron los siguientes datos: ${data}. ¿Cuál es el rango (diferencia entre el valor mayor y el valor menor)?`, answer: range,
        wrong: [s[n - 1], s[n - 1] + s[0], range + 1, range - 1, s[n - 1] - s[1]],
        steps: [`El dato mayor es ${s[n - 1]} y el menor es ${s[0]}.`, `Rango = ${s[n - 1]} − ${s[0]} = ${range}.`]
      };
    }
    U.fail();
  } });

  function barsSvg(cats, vals, step, showVals) {
    const mxv = Math.max(...vals), top = Math.ceil(mxv / step) * step + (mxv % step === 0 ? step : 0);
    const bw = 40, gap = 24, ml = 44, mt = 16, H = 150, W = ml + cats.length * (bw + gap) + 8;
    const Y = v => mt + H - v / top * H;
    let s = '';
    for (let v = 0; v <= top; v += step) { s += U.sLine(ml, Y(v), W - 6, Y(v), 'grid') + U.sText(ml - 6, Y(v), String(v), 'tick', 'end'); }
    s += U.sLine(ml, mt, ml, mt + H, 'axis') + U.sLine(ml, mt + H, W - 6, mt + H, 'axis');
    vals.forEach((v, i) => {
      const x = ml + gap / 2 + i * (bw + gap);
      s += U.sRect(x, Y(v), bw, mt + H - Y(v), 'bar');
      if (showVals) s += U.sText(x + bw / 2, Y(v) - 8, String(v), 'lbl b');
      s += U.sText(x + bw / 2, mt + H + 14, cats[i], 'tick');
    });
    return U.svg(W, mt + H + 28, s, 'Gráfico de barras: ' + cats.map((c, i) => `${c} ${vals[i]}`).join(', '));
  }
  const SETS = [
    { title: 'el deporte favorito de los estudiantes de un colegio', who: 'estudiantes', verb: 'eligieron el deporte:', cats: ['Fútbol', 'Básquet', 'Tenis', 'Natación', 'Vóleibol'] },
    { title: 'la mascota que tienen los niños de un curso', who: 'niños', verb: 'tienen como mascota:', cats: ['Perro', 'Gato', 'Pez', 'Conejo', 'Ave'] },
    { title: 'la fruta preferida de los estudiantes', who: 'estudiantes', verb: 'prefieren esta fruta:', cats: ['Manzana', 'Pera', 'Uva', 'Naranja', 'Plátano'] }
  ];
  O.reg({ id: 'dat.barras', topic: T, name: 'Gráficos de barras', gen(r, d) {
    const set = r.pick(SETS), k = d === 1 ? 4 : 5, cats = r.sample(set.cats, k);
    if (d < 3) {
      const step = r.pick([5, 10]), vals = Array.from({ length: k }, () => step * r.int(1, 8));
      const i = r.int(0, k - 1);
      if (d === 1) return {
        text: `El gráfico muestra ${set.title}. ¿Cuántos ${set.who} corresponden a la categoría «${cats[i]}»?`, svg: barsSvg(cats, vals, step, false), answer: vals[i],
        wrong: [vals[i] + step, vals[i] - step, vals[i] + step / 2, Math.max(...vals)],
        steps: [`Se busca la barra de "${cats[i]}" y se mira hasta dónde llega en el eje vertical.`, `Llega a ${vals[i]}.`]
      };
      let j; do { j = r.int(0, k - 1); } while (j === i || vals[i] === vals[j]);
      if (r.chance(0.5)) {
        const tot = vals.reduce((a, b) => a + b, 0);
        return {
          text: `El gráfico muestra ${set.title}. ¿Cuántos ${set.who} respondieron en total?`, svg: barsSvg(cats, vals, step, true), answer: tot,
          wrong: [tot - vals[i], tot + step, Math.max(...vals), tot - step, Math.round(tot / k)],
          steps: [`Se suman todas las barras: ${vals.join(' + ')} = ${tot}.`]
        };
      }
      return {
        text: `El gráfico muestra ${set.title}. ¿Cuántos ${set.who} más corresponden a la categoría «${cats[i]}» que a la categoría «${cats[j]}»?`.replace('más', vals[i] > vals[j] ? 'más' : 'menos'), svg: barsSvg(cats, vals, step, true), answer: Math.abs(vals[i] - vals[j]),
        wrong: [vals[i] + vals[j], Math.abs(vals[i] - vals[j]) + step, Math.max(vals[i], vals[j]), Math.abs(vals[i] - vals[j]) - 1 > 0 ? Math.abs(vals[i] - vals[j]) - 1 : step],
        steps: [`"${cats[i]}": ${vals[i]} y "${cats[j]}": ${vals[j]}.`, `Diferencia: ${Math.max(vals[i], vals[j])} − ${Math.min(vals[i], vals[j])} = ${Math.abs(vals[i] - vals[j])}.`]
      };
    }
    const Tt = r.pick([40, 50, 100, 200, 250]), units = Tt / 5;
    if (units < k) U.fail();
    const cuts = r.sample([...Array(units - 1).keys()].map(x => x + 1), k - 1).sort((a, b) => a - b);
    const parts = [cuts[0], ...cuts.slice(1).map((c, i) => c - cuts[i]), units - cuts[k - 2]], vals = parts.map(p => p * 5);
    if (vals.some(v => v <= 0)) U.fail();
    const i = r.int(0, k - 1), pct = R(vals[i] / Tt * 100);
    return {
      text: `El gráfico muestra ${set.title}. ¿Qué porcentaje del total de ${set.who} corresponde a la categoría «${cats[i]}»?`, svg: barsSvg(cats, vals, Tt <= 50 ? 5 : Tt <= 100 ? 10 : 20, true), answer: pct, unit: '%',
      wrong: [R(pct * 10), R(pct / 10), vals[i], R(vals[i] / Tt), R(100 - pct)],
      steps: [`Total: ${vals.join(' + ')} = ${Tt}.`, `"${cats[i]}": ${vals[i]} de ${Tt}.`, `${vals[i]} ÷ ${Tt} = ${num(R(vals[i] / Tt))} → ${num(pct)} %.`]
    };
  } });

  const COLORS = [['roja', 'rojas'], ['azul', 'azules'], ['verde', 'verdes'], ['amarilla', 'amarillas']];
  O.reg({ id: 'dat.probabilidad', topic: T, name: 'Probabilidad básica', gen(r, d) {
    if (d === 1 || (d === 2 && r.chance(0.35))) {
      const cs = COLORS.slice(0, 3), cnt = cs.map(() => r.int(2, 9)), tot = cnt.reduce((a, b) => a + b, 0), i = r.int(0, 2);
      const bag = cs.map((c, j) => `${cnt[j]} ${cnt[j] === 1 ? c[0] : c[1]}`).join(', ').replace(/, ([^,]+)$/, ' y $1');
      if (d === 2) {
        const not = r.chance(0.5);
        if (not) return {
          text: `Una bolsa contiene ${bag}. Se extrae una bolita al azar. ¿Cuál es la probabilidad de que la bolita extraída NO sea ${cs[i][0]}?`, answer: F(tot - cnt[i], tot),
          wrong: [F(cnt[i], tot), F(tot - cnt[i], cnt[i]), F(cnt[i], tot - cnt[i]), F(1, 2), F(tot - cnt[i], tot + 1)],
          steps: [`Hay ${tot} bolitas en total y ${cnt[i]} son ${cs[i][1]}, así que ${tot - cnt[i]} no lo son.`, `P = casos favorables ÷ casos posibles = ${fr(tot - cnt[i], tot)}${U.gcd(tot - cnt[i], tot) > 1 ? ` = ${U.fmt(F(tot - cnt[i], tot))}` : ''}.`]
        };
        const j = (i + 1) % 3, fav = cnt[i] + cnt[j];
        return {
          text: `Una bolsa contiene ${bag}. Se extrae una bolita al azar. ¿Cuál es la probabilidad de que la bolita extraída sea ${cs[i][0]} o ${cs[j][0]}?`, answer: F(fav, tot),
          wrong: [F(cnt[i], tot), F(fav, tot - fav), F(fav, tot + 1), F(1, 3), F(cnt[i] * cnt[j], tot * tot)],
          steps: [`Casos favorables: ${cnt[i]} + ${cnt[j]} = ${fav}. Casos posibles: ${tot}.`, `P = ${fr(fav, tot)}${U.gcd(fav, tot) > 1 ? ` = ${U.fmt(F(fav, tot))}` : ''}.`]
        };
      }
      return {
        text: `Una bolsa contiene ${bag}. Se extrae una bolita al azar. ¿Cuál es la probabilidad de que la bolita extraída sea ${cs[i][0]}?`, answer: F(cnt[i], tot),
        wrong: [F(cnt[i], tot - cnt[i]), F(1, 3), F(tot - cnt[i], tot), F(1, tot), F(cnt[i], tot + 1)],
        steps: [`Casos favorables (bolitas ${cs[i][1]}): ${cnt[i]}. Casos posibles (todas las bolitas): ${tot}.`, `P = ${fr(cnt[i], tot)}${U.gcd(cnt[i], tot) > 1 ? ` = ${U.fmt(F(cnt[i], tot))}` : ''}.`]
      };
    }
    if (d === 3 && r.chance(0.5)) {
      const y = r.int(6, 14), x = r.int(1, y - 2), k = y - x;
      return {
        text: `En una bolsa hay ${x} bolitas rojas y ${y} bolitas de otros colores. ¿Cuántas bolitas rojas se deben agregar para que la probabilidad de extraer una bolita roja sea ${fr(1, 2)}?`, answer: k,
        wrong: [y, x, k + 1, k - 1, (x + y) / 2 | 0],
        steps: [`Para que la probabilidad sea ${fr(1, 2)}, las bolitas rojas deben ser la mitad del total, o sea, igual a las otras.`, `Hay ${y} bolitas de otros colores, así que deben haber ${y} rojas.`, `Hay que agregar ${y} − ${x} = ${k} bolitas rojas.`]
      };
    }
    if (r.chance(0.5)) {
      const props = [['un número par', [2, 4, 6]], ['un número primo', [2, 3, 5]], ['un múltiplo de 3', [3, 6]], ['un número mayor que 4', [5, 6]], ['un número menor que 3', [1, 2]], ['un número que no sea 1', [2, 3, 4, 5, 6]], ['un múltiplo de 2 o de 3', [2, 3, 4, 6]], ['un número impar mayor que 1', [3, 5]]];
      const [name, set] = r.pick(props), a = set.length;
      return {
        text: `Se lanza un dado común (con caras del 1 al 6). ¿Cuál es la probabilidad de obtener ${name}?`, answer: F(a, 6),
        wrong: [F(a, 5), F(1, 6), F(6 - a, 6), F(a + 1, 6), F(a, 7)],
        steps: [`Resultados posibles: 1, 2, 3, 4, 5 y 6 (son 6).`, `Resultados favorables (${name}): ${set.join(', ')} (son ${a}).`, `P = ${fr(a, 6)}${U.gcd(a, 6) > 1 ? ` = ${U.fmt(F(a, 6))}` : ''}.`]
      };
    }
    const N = r.pick([10, 12, 15, 20, 24, 30]), kind = r.pick(['mult', 'primo', 'mayor']);
    let fav, name;
    if (kind === 'mult') { const m = r.pick([3, 4, 5]); fav = Math.floor(N / m); name = `un múltiplo de ${m}`; }
    else if (kind === 'primo') { fav = Array.from({ length: N }, (_, i) => i + 1).filter(U.isPrime).length; name = 'un número primo'; }
    else { const m = r.int(3, N - 3); fav = N - m; name = `un número mayor que ${m}`; }
    return {
      text: `Una caja contiene ${N} tarjetas numeradas del 1 al ${N}. Se extrae una tarjeta al azar. ¿Cuál es la probabilidad de que la tarjeta extraída tenga ${name}?`, answer: F(fav, N),
      wrong: [F(fav, N - fav), F(N - fav, N), F(fav + 1, N), F(1, N)],
      steps: [`Casos posibles: ${N}. Casos favorables: ${fav}.`, `P = ${fr(fav, N)}${U.gcd(fav, N) > 1 ? ` = ${U.fmt(F(fav, N))}` : ''}.`]
    };
  } });

  O.reg({ id: 'dat.promedio_ponderado', topic: T, name: 'Promedio con tabla de frecuencias', dev: true, gen(r, d) {
    const notes = d === 1 ? [4, 5, 6, 7] : [3, 4, 5, 6, 7];
    for (let t = 0; t < 300; t++) {
      const Tt = d === 1 ? 10 : r.pick([20, 25]), k = notes.length;
      const cuts = r.sample([...Array(Tt - 1).keys()].map(x => x + 1), k - 1).sort((a, b) => a - b);
      const f = [cuts[0], ...cuts.slice(1).map((c, i) => c - cuts[i]), Tt - cuts[k - 2]];
      const S = notes.reduce((s, n, i) => s + n * f[i], 0);
      if ((S * 100) % Tt) continue;
      const mean = R(S / Tt);
      const simple = R(notes.reduce((a, b) => a + b, 0) / k);
      if (simple === mean) continue;
      return {
        text: `En una prueba, la distribución de las notas de un curso fue la siguiente:\n${notes.map((n, i) => `• ${f[i]} ${f[i] === 1 ? 'estudiante obtuvo' : 'estudiantes obtuvieron'} nota ${n}`).join('\n')}\n¿Cuál es el promedio de las notas del curso?`, answer: mean,
        wrong: [simple, S, R(mean + 0.5), R(S / k), notes[f.indexOf(Math.max(...f))]],
        steps: [`Hay ${f.join(' + ')} = ${Tt} estudiantes.`, `Se multiplica cada nota por la cantidad de estudiantes: ${notes.map((n, i) => `${n}×${f[i]} = ${n * f[i]}`).join('; ')}.`, `Suma de todas las notas: ${S}.`, `Promedio = ${S} ÷ ${Tt} = ${num(mean)}.`, `Ojo: no es el promedio simple de las notas distintas (${num(simple)}), porque no todas tienen la misma cantidad de estudiantes.`]
      };
    }
    U.fail();
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
