/* Tema 5: Razones y proporciones */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U, num = U.num, $ = U.money, T = 'raz';
  const rt = (x, y) => `${x} : ${y}`;
  const R = x => U.round(x, 6);

  O.reg({ id: 'raz.razon_simple', topic: T, name: 'Razones y su forma simple', mcOnly: true, gen(r, d) {
    if (d < 3) {
      let x, y;
      do { x = r.int(1, 9); y = r.int(1, 9); } while (x === y || U.gcd(x, y) !== 1);
      const g = r.int(2, 7), a = x * g, b = y * g;
      const ctx = r.pick([['niñas', 'niños', 'En un curso hay'], ['mujeres', 'hombres', 'En un taller hay'], ['perros', 'gatos', 'En una veterinaria hay'], ['manzanas', 'peras', 'En una frutera hay']]);
      if (d === 2 && r.chance(0.5)) return {
        text: `${ctx[2]} ${a} ${ctx[0]} y ${b} ${ctx[1]}. ¿Cuál es la razón entre las ${ctx[0]} y el total, escrita en su forma más simple?`,
        answer: rt(x, x + y), wrong: [rt(x, y), rt(y, x + y), rt(x + y, x), rt(x, x + y + 1)],
        steps: [`El total es ${a} + ${b} = ${a + b}.`, `La razón es ${a} : ${a + b}.`, `Se simplifica dividiendo por ${g}: ${rt(x, x + y)}.`]
      };
      return {
        text: `${ctx[2]} ${a} ${ctx[0]} y ${b} ${ctx[1]}. ¿Cuál es la razón entre ${ctx[0]} y ${ctx[1]}, escrita en su forma más simple?`,
        answer: rt(x, y), wrong: [rt(y, x), rt(x, x + y), rt(x + y, y), rt(x, y + 1)],
        steps: [`La razón es ${a} : ${b}.`, `Se divide ambos números por su MCD (${g}): ${rt(x, y)}.`]
      };
    }
    let x, y, z, w;
    do { x = r.int(1, 7); y = r.int(2, 9); z = r.int(1, 9); w = r.int(2, 9); } while (U.gcd(x, y) !== 1 || U.gcd(z, w) !== 1 || y === z || U.gcd(x * z, y * w) !== 1);
    return {
      text: `La razón entre A y B es ${rt(x, y)}, y la razón entre B y C es ${rt(z, w)}. ¿Cuál es la razón entre A y C?`,
      answer: rt(x * z, y * w), wrong: [rt(x, w), rt(y, z), rt(x + z, y + w), rt(x * w, y * z)],
      steps: [`A/B = ${x}/${y} y B/C = ${z}/${w}.`, `A/C = (A/B) × (B/C) = ${x}/${y} × ${z}/${w} = ${x * z}/${y * w}.`, `La razón entre A y C es ${rt(x * z, y * w)}.`]
    };
  } });

  O.reg({ id: 'raz.proporcion_directa', topic: T, name: 'Proporcionalidad directa', gen(r, d) {
    if (d === 1) {
      const a = r.int(2, 6), b = r.int(7, 12), u = r.step(300, 1500, 50), P = u * a;
      const art = r.pick(['cuadernos', 'lápices', 'helados', 'revistas']);
      return {
        text: `${a} ${art} iguales cuestan ${$(P)}. ¿Cuánto cuestan ${b} ${art} iguales?`, answer: u * b, unit: '$',
        wrong: [P * b, u * (b - a), P + (b - a) * 100, u * b + u, u * (b - 1)],
        steps: [`Precio de uno: ${$(P)} ÷ ${a} = ${$(u)}.`, `Precio de ${b}: ${b} × ${$(u)} = ${$(u * b)}.`]
      };
    }
    if (d === 2) {
      const a = r.int(2, 9), u = r.int(4, 15), b = r.int(10, 30), item = r.pick(['panes', 'empanadas', 'galletas', 'sándwiches']);
      return {
        text: `Con ${a} kg de harina se preparan ${a * u} ${item}. ¿Cuántos kilogramos de harina se necesitan para preparar ${b * u} ${item}?`, answer: b, unit: 'kg',
        wrong: [b * u, a * u, b - a, b + a, b * a],
        steps: [`Con 1 kg se preparan ${a * u} ÷ ${a} = ${u} ${item}.`, `Para ${b * u} ${item} se necesitan ${b * u} ÷ ${u} = ${b} kg.`]
      };
    }
    const u = r.int(40, 95), h = r.int(2, 6);
    const ans = R(u * (h + 0.5));
    return {
      text: `Un tren recorre ${u * 2} km en 2 horas. Si mantiene la misma velocidad, ¿cuántos kilómetros recorre en ${h} horas y media?`, answer: ans, unit: 'km',
      wrong: [u * h, u * (h + 1), R(u * (h + 0.3)), u * 2 * h, R(ans + u)],
      steps: [`Velocidad: ${u * 2} ÷ 2 = ${u} km por hora.`, `${h} horas y media son ${num(h + 0.5)} horas.`, `Distancia: ${u} × ${num(h + 0.5)} = ${num(ans)} km.`]
    };
  } });

  O.reg({ id: 'raz.reparto', topic: T, name: 'Repartos proporcionales', dev: true, gen(r, d) {
    const [p1, p2] = U.persons(r, 2);
    if (d === 1) {
      let x, y;
      do { x = r.int(1, 5); y = r.int(2, 7); } while (x >= y || U.gcd(x, y) !== 1);
      const u = r.step(500, 5000, 500), T2 = (x + y) * u;
      return {
        text: `${p1.name} y ${p2.name} se reparten ${$(T2)} en la razón ${rt(x, y)}. ¿Cuánto dinero recibe ${p2.name}?`, answer: y * u, unit: '$',
        wrong: [x * u, T2 / y, T2 / 2, (y + 1) * u, u],
        steps: [`En total son ${x} + ${y} = ${x + y} partes.`, `Cada parte vale ${$(T2)} ÷ ${x + y} = ${$(u)}.`, `${p2.name} recibe ${y} partes: ${y} × ${$(u)} = ${$(y * u)}.`]
      };
    }
    if (d === 2) {
      const ps = r.sample([1, 2, 3, 4, 5, 6], 3).sort((a, b) => a - b), s = ps[0] + ps[1] + ps[2], u = r.step(200, 2000, 100), tot = s * u;
      return {
        text: `Tres amigos juntan ${$(tot)} y se lo reparten en la razón ${ps.join(' : ')}. ¿Cuánto más dinero recibe el que más recibe que el que menos recibe?`, answer: (ps[2] - ps[0]) * u, unit: '$',
        wrong: [ps[2] * u, ps[0] * u, tot / s, (ps[2] - ps[0]) * u + u, ps[1] * u],
        steps: [`En total son ${ps.join(' + ')} = ${s} partes y cada parte vale ${$(tot)} ÷ ${s} = ${$(u)}.`, `El que más recibe: ${ps[2]} × ${$(u)} = ${$(ps[2] * u)}. El que menos: ${ps[0]} × ${$(u)} = ${$(ps[0] * u)}.`, `Diferencia: ${$(ps[2] * u)} − ${$(ps[0] * u)} = ${$((ps[2] - ps[0]) * u)}.`]
      };
    }
    let x, y;
    do { x = r.int(3, 9); y = r.int(1, x - 1); } while (U.gcd(x, y) !== 1);
    const u = r.step(500, 5000, 500), D = (x - y) * u;
    return {
      text: `${p1.name} y ${p2.name} se reparten un premio en la razón ${rt(x, y)}. ${p1.name} recibe ${$(D)} más que ${p2.name}. ¿De cuánto era el premio?`, answer: (x + y) * u, unit: '$',
      wrong: [D, x * u, (x + y) * u - u, D * (x + y), (x - y) * (x + y) * u / (x - y) + u],
      steps: [`La diferencia entre las partes es ${x} − ${y} = ${x - y} partes, y equivale a ${$(D)}.`, `Cada parte vale ${$(D)} ÷ ${x - y} = ${$(u)}.`, `El premio tiene ${x} + ${y} = ${x + y} partes: ${x + y} × ${$(u)} = ${$((x + y) * u)}.`]
    };
  } });

  O.reg({ id: 'raz.escala', topic: T, name: 'Escalas', gen(r, d) {
    if (d === 3 && r.chance(0.4)) {
      const S = r.pick([25000, 50000, 100000]), k = r.int(3, 16), Rkm = R(k * S / 100000);
      return {
        text: `Dos pueblos están a ${num(Rkm)} km de distancia. En un mapa con escala 1 : ${num(S)}, ¿cuántos centímetros los separan?`, answer: k, unit: 'cm',
        wrong: [R(k * 10), R(k / 10), Rkm, R(Rkm * 100000), R(k * 100)].map(x => Math.round(x)),
        steps: [`${num(Rkm)} km = ${num(R(Rkm * 100000))} cm.`, `En el mapa: ${num(R(Rkm * 100000))} ÷ ${num(S)} = ${k} cm.`]
      };
    }
    const S = r.pick(d === 1 ? [100, 500, 1000] : d === 2 ? [2000, 5000, 10000] : [25000, 50000, 100000]);
    const L = r.int(2, 12), km = S >= 25000, cm = L * S;
    const ans = R(km ? cm / 100000 : cm / 100);
    const what = r.pick(km ? ['dos ciudades', 'un pueblo y una playa'] : ['la sala y el patio', 'dos esquinas del parque']);
    return {
      text: `En un plano con escala 1 : ${num(S)}, la distancia entre ${what} mide ${L} cm. ¿Cuál es la distancia real en ${km ? 'kilómetros' : 'metros'}?`,
      answer: ans, unit: km ? 'km' : 'm', wrong: [cm, R(cm / 1000), R(ans * 10), R(ans / 10), R(cm / (km ? 1000 : 10))],
      steps: [`1 cm del plano son ${num(S)} cm reales, entonces ${L} cm son ${L} × ${num(S)} = ${num(cm)} cm.`, km ? `${num(cm)} cm ÷ 100.000 = ${num(ans)} km.` : `${num(cm)} cm ÷ 100 = ${num(ans)} m.`]
    };
  } });

  O.reg({ id: 'raz.proporcion_inversa', topic: T, name: 'Proporcionalidad inversa', gen(r, d) {
    if (d < 3) {
      const w1 = r.pick(d === 1 ? [2, 3, 4, 5, 6] : [4, 6, 8, 9, 10, 12]), D1 = r.int(d === 1 ? 6 : 10, d === 1 ? 20 : 36), tot = w1 * D1;
      const cands = U.divisors(tot).filter(x => x !== w1 && x > 1 && x <= 30);
      if (!cands.length) U.fail();
      const w2 = r.pick(cands), D2 = tot / w2;
      const ctx = r.pick(['obreros pintan una casa', 'máquinas llenan un estanque', 'albañiles construyen un muro']);
      return {
        text: `${w1} ${ctx} en ${D1} días. Si todos trabajan al mismo ritmo, ¿en cuántos días lo harían ${w2}?`, answer: D2, unit: 'días',
        wrong: [R(D1 * w2 / w1), D1 + w2 - w1, D1, tot, D2 + 1],
        steps: [`Más personas hacen el trabajo en menos tiempo (proporcionalidad inversa).`, `El trabajo total es ${w1} × ${D1} = ${tot} "días de una persona".`, `Con ${w2}: ${tot} ÷ ${w2} = ${D2} días.`]
      };
    }
    for (let k = 0; k < 100; k++) {
      const w1 = r.int(3, 8), D1 = r.int(12, 30), x = r.int(2, D1 - 4), m = r.int(1, 6);
      const rem = w1 * (D1 - x), days = rem / (w1 + m);
      if (!Number.isInteger(days)) continue;
      return {
        text: `${w1} trabajadores pueden terminar una obra en ${D1} días. Después de trabajar ${x} días, se unen ${m} trabajadores más (todos al mismo ritmo). ¿Cuántos días más se demoran en terminar la obra?`, answer: days, unit: 'días',
        wrong: [D1 - x, R(D1 * w1 / (w1 + m)), days + 1, days - 1, D1 - x - m],
        steps: [`Trabajo total: ${w1} × ${D1} = ${w1 * D1}. En ${x} días se hizo ${w1} × ${x} = ${w1 * x}.`, `Falta: ${w1 * D1} − ${w1 * x} = ${rem}.`, `Ahora trabajan ${w1 + m}: ${rem} ÷ ${w1 + m} = ${days} días.`]
      };
    }
    U.fail();
  } });

  O.reg({ id: 'raz.mezclas', topic: T, name: 'Mezclas y recetas en razón', dev: true, gen(r, d) {
    let x, y;
    do { x = r.int(1, 6); y = r.int(2, 8); } while (x === y || U.gcd(x, y) !== 1);
    const k = r.int(2, 9), things = r.pick([['pintura blanca', 'pintura azul', 'tarros'], ['jugo concentrado', 'agua', 'vasos'], ['harina', 'azúcar', 'tazas']]);
    if (d === 1) return {
      text: `Para una receta se mezcla ${things[0]} y ${things[1]} en la razón ${rt(x, y)}. Si se usan ${y * k} ${things[2]} de ${things[1]}, ¿${things[2] === 'tazas' ? 'cuántas' : 'cuántos'} ${things[2]} de ${things[0]} se usan?`, answer: x * k,
      wrong: [y * k + x, (x + y) * k, k, x * k + k, y * k - x],
      steps: [`${things[1][0].toUpperCase() + things[1].slice(1)}: ${y} partes = ${y * k} ${things[2]}, entonces 1 parte = ${k}.`, `${things[0][0].toUpperCase() + things[0].slice(1)}: ${x} partes = ${x} × ${k} = ${x * k} ${things[2]}.`]
    };
    if (d === 2) return {
      text: `Para una receta se mezcla ${things[0]} y ${things[1]} en la razón ${rt(x, y)}. Si se usan ${x * k} ${things[2]} de ${things[0]}, ¿${things[2] === 'tazas' ? 'cuántas' : 'cuántos'} ${things[2]} tiene la mezcla en total?`, answer: (x + y) * k,
      wrong: [y * k, x * k + y, (x + y) * k - k, x * k * 2, (x + y) * k + k],
      steps: [`${things[0][0].toUpperCase() + things[0].slice(1)}: ${x} partes = ${x * k}, entonces 1 parte = ${k}.`, `La mezcla tiene ${x} + ${y} = ${x + y} partes: ${x + y} × ${k} = ${(x + y) * k} ${things[2]}.`]
    };
    const z = r.int(1, 6), ps = [x, y, z], s = x + y + z, mx = Math.max(...ps), mn = Math.min(...ps), tot = s * k;
    return {
      text: `Un jugo se prepara con tres ingredientes en la razón ${ps.join(' : ')}. Si se preparan ${tot} litros de jugo, ¿cuántos litros más lleva del ingrediente mayor que del menor?`, answer: (mx - mn) * k, unit: 'L',
      wrong: [mx * k, mn * k, k, (mx - mn) * k + k, tot / (mx - mn)].map(v => (Number.isInteger(v) ? v : Math.round(v))),
      steps: [`Las partes son ${ps.join(' + ')} = ${s}, y 1 parte vale ${tot} ÷ ${s} = ${k} L.`, `Mayor: ${mx} × ${k} = ${mx * k} L. Menor: ${mn} × ${k} = ${mn * k} L.`, `Diferencia: ${mx * k} − ${mn * k} = ${(mx - mn) * k} L.`]
    };
  } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
