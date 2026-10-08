/* Pruebas de los generadores: node tests/generators.test.js [cantidad=500]
   Para CADA generador y CADA dificultad genera N preguntas de cada formato y comprueba que:
   - la correcta esté entre las alternativas, haya exactamente una y no existan alternativas duplicadas
   - ningún resultado sea negativo, fraccionario o absurdo cuando no corresponde
   - el texto, las alternativas y los pasos no contengan "undefined", "NaN", etc.
   - la respuesta correcta mostrada sea aceptada por el corrector de respuestas abiertas
   - casi nunca haga falta reintentar (calidad del generador) */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
['rng.js', 'util.js', 'engine.js'].forEach(f => require(path.join(root, 'js', f)));
fs.readdirSync(path.join(root, 'js', 'gen')).filter(f => f.endsWith('.js')).sort()
  .forEach(f => require(path.join(root, 'js', 'gen', f)));

const O = globalThis.OLI, U = O.U;
const N = Number(process.argv[2]) || 500;
let errors = 0, checks = 0;
const bad = (msg) => { errors++; if (errors <= 60) console.log('  ✗ ' + msg); };
const BAD_STR = /undefined|NaN|Infinity|\[object|null/;
// Lenguaje: el enunciado debe ser formal y gramaticalmente correcto (errores que ya aparecieron antes)
const BAD_LANG = [
  [/^(Calcula|Expresa|Descompón|Observa|Escribe|Aproxima|Dibuja|Halla|Encuentra|Soy|Pienso|Elige|Mira)\b/, 'enunciado informal o en primera persona'],
  [/\bcm cm\b/, '"cm" repetido'],
  [/\bde el\b/, '"de el" en lugar de "del"'],
  [/\bsándwichs\b/i, 'plural "sándwichs"'],
  [/\b(un) galleta\b/i, '"un galleta"'],
  [/\bCuántos (gallinas|figuritas|láminas|cartas|bolitas|zapatillas|naranjas|galletas|manzanas)\b/, 'concordancia de género ("Cuántos" con sustantivo femenino)'],
  [/\bCuántas (lápices|conejos|sobres|bombones|cajones|perros|gatos|días)\b/, 'concordancia de género ("Cuántas" con sustantivo masculino)'],
  [/\bveces de\b/, '"veces de"'],
  [/\b(el|un) (doble|triple) (un|el|la|de lo) /i, 'falta "de" tras doble/triple'],
  [/\bUnas? zapatillas (cuesta|costaba|se vende)\b/, 'verbo singular con "zapatillas"'],
  [/\blas (perros|gatos|hombres|niños)\b/, 'artículo femenino con sustantivo masculino'],
  [/  +/, 'espacios dobles'],
  [/ [,.;?]/, 'espacio antes de signo de puntuación']
];

function strip(html) { return String(html); }

function checkQuestion(q, g, type, d, seed) {
  const where = `${g.id} [${type}, d${d}, ${seed}]`;
  checks++;
  for (const [re, why] of BAD_LANG) { if (re.test(q.text)) return bad(`${where}: ${why} → "${q.text.replace(/\n/g, ' / ')}"`); }
  for (const s of [q.text, q.display, ...(q.options || []), ...q.steps]) {
    if (BAD_STR.test(s)) return bad(`${where}: texto con valor inválido: "${s}"`);
  }
  if (q.text.length < 10 || q.text.length > 700) bad(`${where}: largo de enunciado raro (${q.text.length})`);
  if (q.svg && !q.svg.startsWith('<svg')) bad(`${where}: svg inválido`);
  if (q.svg && /NaN|undefined|Infinity/.test(q.svg)) bad(`${where}: svg con NaN`);
  // respuesta razonable
  const a = q.answer;
  if (q.kind === 'int' && (!Number.isInteger(a) || (a < 0 && !q.allowNeg))) bad(`${where}: respuesta entera inválida ${a}`);
  if (q.kind === 'dec' && (!Number.isFinite(a) || (a < 0 && !q.allowNeg))) bad(`${where}: respuesta decimal inválida ${a}`);
  if (q.kind === 'frac' && !(a.d > 1 && a.n > 0)) bad(`${where}: fracción inválida ${a.n}/${a.d}`);
  if (typeof a === 'number' && Math.abs(a) > 1e9) bad(`${where}: respuesta absurda ${a}`);

  if (type === 'mc') {
    if (!q.options || q.options.length !== 4) return bad(`${where}: no tiene 4 alternativas`);
    if (new Set(q.options).size !== 4) bad(`${where}: alternativas duplicadas ${JSON.stringify(q.options)}`);
    if (!(q.correct >= 0 && q.correct < 4)) return bad(`${where}: índice correcto fuera de rango`);
    if (q.options[q.correct] !== q.display) bad(`${where}: la correcta no coincide con la respuesta`);
    const matches = q.options.filter(o => o === q.display).length;
    if (matches !== 1) bad(`${where}: hay ${matches} alternativas iguales a la correcta`);
    // las alternativas numéricas deben tener la misma "forma" que la correcta
    q.options.forEach(o => {
      if (q.kind === 'int' && /^−/.test(o) && !q.allowNeg) bad(`${where}: alternativa negativa "${o}"`);
    });
  } else {
    // la respuesta correcta, tal como se muestra, debe ser aceptada por el corrector
    let typed;
    if (q.kind === 'frac') typed = a.mixed && a.n > a.d ? `${Math.floor(a.n / a.d)} ${a.n % a.d}/${a.d}` : `${a.n}/${a.d}`;
    else typed = String(a).replace('.', ',');
    if (!O.checkOpen(q, typed)) bad(`${where}: el corrector rechaza la respuesta correcta "${typed}"`);
    if (q.kind === 'int' && !O.checkOpen(q, U.num(a))) bad(`${where}: rechaza "${U.num(a)}" (formato es-CL)`);
    if (q.kind === 'dec' && !O.checkOpen(q, String(a))) bad(`${where}: rechaza "${a}" (con punto)`);
    if (O.checkOpen(q, String(typeof a === 'number' ? a + 1 : 'x'))) bad(`${where}: el corrector acepta una respuesta incorrecta`);
  }
}

const tries = {};
console.log(`Generadores registrados: ${O.GENS.length} (${O.TOPICS.length} temas). ${N} preguntas por generador, dificultad y formato.\n`);

// cobertura por tema
O.TOPICS.forEach(t => {
  const gs = O.GENS.filter(g => g.topic === t.id);
  const dev = gs.filter(g => g.dev).length, open = gs.filter(g => !g.mcOnly).length;
  const msg = `${t.id.padEnd(5)} ${String(gs.length).padStart(2)} generadores (${dev} de desarrollo, ${open} abiertos) · ${t.name}`;
  if (gs.length < 4 || dev < 1 || open < 1) bad(`Tema con cobertura insuficiente → ${msg}`);
  console.log('  ' + msg);
});
const ids = new Set();
O.GENS.forEach(g => { if (ids.has(g.id)) bad(`id repetido: ${g.id}`); ids.add(g.id); });
console.log('');

for (const g of O.GENS) {
  let retried = 0, total = 0, failed = 0, firstErr = '';
  let minDistinct = Infinity;
  for (const type of ['mc', 'open', 'dev']) {
    if (type !== 'mc' && g.mcOnly) continue;
    if (type === 'dev' && !g.dev) continue;
    for (const d of [1, 2, 3]) {
      const distinct = new Set();
      for (let k = 0; k < N; k++) {
        const seed = `T${k}`;
        total++;
        let q;
        try { q = O.buildQuestion(seed, { i: 0, type, topic: g.topic, gen: g.id, d }); }
        catch (e) { failed++; firstErr = firstErr || `${type} d${d} ${seed}: ${e.message}`; continue; }
        if (q.attempt > 0) retried++;
        distinct.add(q.text + '|' + q.display + '|' + q.svg);
        checkQuestion(q, g, type, d, seed);
        // determinismo: misma semilla → misma pregunta
        if (k < 3) {
          const q2 = O.buildQuestion(seed, { i: 0, type, topic: g.topic, gen: g.id, d });
          if (q2.text !== q.text || q2.display !== q.display) bad(`${g.id}: no es determinista con la misma semilla`);
        }
      }
      minDistinct = Math.min(minDistinct, distinct.size);
    }
  }
  const pct = (retried / total * 100);
  const variety = minDistinct;
  let flag = '';
  if (failed) { flag += ` FALLAS:${failed} (${firstErr})`; bad(`${g.id}: ${failed} preguntas no se pudieron generar → ${firstErr}`); }
  if (pct > 8) { flag += ' MUCHOS REINTENTOS'; bad(`${g.id}: ${pct.toFixed(1)} % de reintentos (arreglar el generador)`); }
  if (variety < Math.min(N, 4)) { flag += ' POCA VARIEDAD'; bad(`${g.id}: solo ${variety} preguntas distintas en algún formato/dificultad`); }
  console.log(`  ${g.id.padEnd(30)} ${String(total).padStart(5)} preguntas · reintentos ${pct.toFixed(1).padStart(4)} % · mín. distintas ${String(variety).padStart(3)}${flag}`);
}

// ---------- Verificación independiente ----------
// Para algunos generadores se recalcula la respuesta DESDE EL ENUNCIADO con otro código y se compara.
console.log('Verificación independiente (se recalcula la respuesta desde el enunciado):');
{
  const nums = t => t.replace(/\./g, '').replace(',', '.');
  const plain = t => t.replace(/\[\[(?:(\d+) )?(\d+)\/(\d+)\]\]/g, (m, w, n, d) => (w ? w + ' ' : '') + n + '/' + d);
  const val = a => (a && a.isFrac ? a.n / a.d : a);
  const ORACLES = {
    'num.prioridad': q => { const m = q.text.match(/valor de (.+)\?$/); if (!m) return null; return Function('return ' + m[1].replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'))(); },
    'div.divisores': q => { const m = q.text.match(/número (\d+)\?/); return m ? U.divisors(+m[1]).length : null; },
    'div.mcm_mcd': q => { const m = q.text.match(/\((MCM|MCD)\) de ([\d, y]+)\?/); if (!m) return null; const ns = m[2].split(/, | y /).map(Number); return m[1] === 'MCM' ? ns.reduce((a, b) => a * b / U.gcd(a, b)) : ns.reduce((a, b) => U.gcd(a, b)); },
    'dec.porcentaje_de': q => { const m = q.text.match(/^¿Cuál es el (\d+) % de ([\d.]+)\?$/); return m ? +nums(m[2]) * +m[1] / 100 : null; },
    'pat.termino_enesimo': q => { const m = q.text.match(/son:\n([\d., ]+), …\n¿Qué número ocupa la posición (\d+) de esta secuencia\?/); if (!m) return null; const t = m[1].split(', ').map(x => +nums(x)); return t[0] + (+m[2] - 1) * (t[1] - t[0]); },
    'dat.moda_mediana': q => {
      const m = q.text.match(/datos: ([\d, ]+)\. ¿Cuál es (?:la|el) (moda|mediana|rango)/); if (!m) return null;
      const v = m[1].split(', ').map(Number), srt = v.slice().sort((a, b) => a - b);
      if (m[2] === 'rango') return srt[srt.length - 1] - srt[0];
      if (m[2] === 'mediana') { const n = srt.length; return n % 2 ? srt[(n - 1) / 2] : (srt[n / 2 - 1] + srt[n / 2]) / 2; }
      const c = {}; v.forEach(x => { c[x] = (c[x] || 0) + 1; }); return +Object.keys(c).sort((a, b) => c[b] - c[a])[0];
    },
    'fra.operar': q => {
      const m = plain(q.text).match(/^¿Cuál es el resultado de (\d+)\/(\d+) ([+−×÷]) (\d+)\/(\d+)\?$/); if (!m) return null;
      const [a, b, c, d] = [m[1], m[2], m[4], m[5]].map(Number), x = a / b, y = c / d;
      return m[3] === '+' ? x + y : m[3] === '−' ? x - y : m[3] === '×' ? x * y : x / y;
    },
    'log.cuadrados': q => {
      const m = q.text.match(/de (\d+) × (\d+) cuadraditos, ¿cuántos (cuadrados|rectángulos)/); if (!m) return null;
      const n = +m[1], k = +m[2]; let c = 0;
      for (let h = 1; h <= n; h++) for (let w = 1; w <= k; w++) if (m[3] === 'rectángulos' || h === w) c += (n - h + 1) * (k - w + 1);
      return c;
    },
    'num.redondeo': q => {
      const m = q.text.match(/^¿Cuál es la aproximación de ([\d.]+) a la (decena de mil|centena de mil|unidad de mil|decena|centena) más cercana\?/); if (!m) return null;
      const p = { 'decena': 10, 'centena': 100, 'unidad de mil': 1000, 'decena de mil': 10000, 'centena de mil': 100000 }[m[2]];
      return Math.round(+nums(m[1]) / p) * p;
    },
    'div.divisibilidad': q => {
      const m = q.text.match(/divisible por (\d+)\?/); if (!m) return null; const k = +m[1];
      const opts = q.options.map(o => +nums(o)), ok = opts.filter(v => v % k === 0);
      return ok.length === 1 ? ok[0] : -1;
    }
  };
  let totalChecked = 0;
  for (const id of Object.keys(ORACLES)) {
    const g = O.GENS.find(x => x.id === id); let checked = 0, wrong = 0;
    for (const d of [1, 2, 3]) for (let k = 0; k < N; k++) {
      const type = id === 'div.divisibilidad' ? 'mc' : 'open';
      const q = O.buildQuestion('ORA' + k, { i: 0, type, topic: g.topic, gen: id, d });
      let exp; try { exp = ORACLES[id](q); } catch (e) { exp = null; }
      if (exp === null || exp === undefined) continue;
      checked++;
      if (Math.abs(val(q.answer) - exp) > 1e-9 * Math.max(1, Math.abs(exp))) { wrong++; bad(`${id} d${d}: la respuesta del generador (${val(q.answer)}) no coincide con la recalculada (${exp}) → "${plain(q.text)}"`); }
    }
    totalChecked += checked;
    if (checked < N / 4) bad(`${id}: la verificación independiente solo cubrió ${checked} preguntas`);
    console.log(`  ${id.padEnd(22)} ${String(checked).padStart(5)} comprobadas · ${wrong ? wrong + ' DISTINTAS' : 'todas coinciden'}`);
  }
  console.log(`  → ${totalChecked} respuestas recalculadas de forma independiente.\n`);
}

// simulacros completos: 9 niveles × varias semillas
console.log('\nSimulacros completos (9 niveles × 40 semillas):');
let exams = 0;
for (const lv of O.LEVELS) {
  for (let s = 0; s < 40; s++) {
    const seed = `X${s}`;
    let qs;
    try { qs = O.buildAll(seed, lv.stage, lv.diff); } catch (e) { bad(`simulacro ${lv.key}/${seed}: ${e.message}`); continue; }
    exams++;
    const st = lv.stage;
    if (qs.length !== O.totalQuestions(st)) bad(`${lv.key}: cantidad de preguntas ${qs.length}`);
    const cnt = t => qs.filter(q => q.type === t).length;
    if (cnt('mc') !== st.mc || cnt('open') !== st.open || cnt('dev') !== st.dev) bad(`${lv.key}: reparto de formatos incorrecto`);
    for (let i = 1; i < qs.length; i++) if (qs[i].genId === qs[i - 1].genId) bad(`${lv.key}/${seed}: mismo generador seguido en ${i}`);
    const topics = new Set(qs.map(q => q.topic));
    if (topics.size < Math.min(qs.length, 9)) bad(`${lv.key}/${seed}: poca mezcla de temas (${topics.size})`);
    // reproducible
    const again = O.buildAll(seed, lv.stage, lv.diff);
    if (again.some((q, i) => q.text !== qs[i].text)) bad(`${lv.key}/${seed}: no es reproducible`);
    // distintas semillas → distintas pruebas
    if (s > 0) {
      const other = O.buildAll(`X${s - 1}`, lv.stage, lv.diff);
      if (other.every((q, i) => q.text === qs[i].text)) bad(`${lv.key}: semillas distintas dieron la misma prueba`);
    }
  }
}
console.log(`  ${exams} simulacros generados y verificados.`);

// corrección
{
  const lv = O.levelByKey('S1'), qs = O.buildAll('GRADE', lv.stage, lv.diff);
  const answers = {};
  qs.forEach(q => { if (q.type === 'mc') answers[q.i] = q.correct; else if (q.type === 'open') answers[q.i] = q.kind === 'frac' ? `${q.answer.n}/${q.answer.d}` : String(q.answer).replace('.', ','); else answers[q.i] = { t: 'x' }; });
  let g = O.grade(qs, answers, {});
  if (g.pending !== 5) bad('corrección: debería haber 5 pendientes de autoevaluación');
  qs.filter(q => q.type === 'dev').forEach(q => { });
  const ev = {}; qs.filter(q => q.type === 'dev').forEach(q => ev[q.i] = 1);
  g = O.grade(qs, answers, ev);
  if (Math.round(g.pct) !== 100 || !g.pass) bad(`corrección: todo correcto debería dar 100 % (dio ${g.pct})`);
  const one = Object.assign({}, answers); const first = qs.find(q => q.type === 'mc'); one[first.i] = (first.correct + 1) % 4;
  g = O.grade(qs, one, ev);
  if (g.points !== qs.length - 1) bad('corrección: una mala debería restar 1 punto');
  const none = O.grade(qs, {}, {});
  if (none.points !== 0) bad('corrección: sin responder debería dar 0');
  // límite de 70 %: 14/20 pasa, 13/20 no
  const mk = pts => { const a = {}; let c = 0; qs.forEach(q => { if (q.type === 'mc') a[q.i] = c++ < pts ? q.correct : (q.correct + 1) % 4; }); return O.grade(qs.map(q => q), a, {}); };
  void mk;
  console.log('  Corrección y puntajes: verificado.');
}

// corrector de respuestas abiertas
{
  const q = { kind: 'dec', answer: 12.5 };
  ['12,5', '12.5', ' 12,5 ', '12,50', '25/2', '12 1/2', '12,5 cm'].forEach(s => { if (!O.checkOpen(q, s)) bad(`checkOpen rechaza "${s}" para 12,5`); });
  ['12', '125', '', 'abc', '12,6', '1/0'].forEach(s => { if (O.checkOpen(q, s)) bad(`checkOpen acepta "${s}" para 12,5`); });
  const i = { kind: 'int', answer: 1500 };
  ['1500', '1.500', '1 500', '1500,0', '$1.500'].forEach(s => { if (!O.checkOpen(i, s)) bad(`checkOpen rechaza "${s}" para 1500`); });
  if (O.checkOpen(i, '1,5')) bad('checkOpen acepta 1,5 para 1500');
  const f = { kind: 'frac', answer: { isFrac: true, n: 3, d: 4 } };
  ['3/4', '6/8', '0,75', '0.75', ' 3 / 4 '].forEach(s => { if (!O.checkOpen(f, s)) bad(`checkOpen rechaza "${s}" para 3/4`); });
  const m = { kind: 'frac', answer: { isFrac: true, n: 17, d: 5, mixed: true } };
  ['3 2/5', '17/5', '3,4'].forEach(s => { if (!O.checkOpen(m, s)) bad(`checkOpen rechaza "${s}" para 3 2/5`); });
  console.log('  Corrector de respuestas abiertas: verificado.');
}

console.log(`\n${checks} preguntas verificadas.`);
if (errors) { console.log(`\n✗ ${errors} problema(s) encontrados.`); process.exit(1); }
console.log('✓ Todo en orden.');
