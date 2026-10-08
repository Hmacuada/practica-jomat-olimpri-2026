/* Motor de prueba: arma preguntas a partir de los generadores, planifica simulacros, corrige.
   No toca el DOM, así que también corre en Node (ver tests/). */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U;

  /* ---------- Etapas y niveles ---------- */
  O.STAGES = [
    { id: 'C', name: 'Clasificatoria', mc: 15, open: 15, dev: 0, minutes: 90 },
    { id: 'S', name: 'Semifinal', mc: 10, open: 5, dev: 5, minutes: 90 },
    { id: 'F', name: 'Gran Final', mc: 5, open: 5, dev: 5, minutes: 90 }
  ];
  O.DIFFS = ['Fácil', 'Medio', 'Olímpico'];
  O.PASS = 70; // % para desbloquear lo siguiente
  O.LEVELS = [];
  O.STAGES.forEach((st, si) => [1, 2, 3].forEach(d => O.LEVELS.push({ key: st.id + d, stage: st, stageIdx: si, diff: d })));
  O.levelByKey = k => O.LEVELS.find(l => l.key === k);
  O.totalQuestions = st => st.mc + st.open + st.dev;
  O.topicName = id => (O.TOPICS.find(t => t.id === id) || {}).name || id;
  O.TYPE_NAMES = { mc: 'Selección múltiple', open: 'Respuesta abierta', dev: 'Problema de desarrollo' };

  /* ---------- Construcción de una pregunta ---------- */
  const LETTERS = ['A', 'B', 'C', 'D'];
  O.LETTERS = LETTERS;

  function kindOf(a) {
    if (typeof a === 'string') return 'text';
    if (a && a.isFrac) return 'frac';
    return Number.isInteger(a) ? 'int' : 'dec';
  }
  function decimalsOk(x) { return Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-6; }

  function validAnswer(a, kind, allowNeg) {
    if (kind === 'text') return a.length > 0;
    if (kind === 'frac') return Number.isFinite(a.n) && Number.isFinite(a.d) && a.d > 1 && a.n > 0 && a.d <= 5000 && a.n <= 100000;
    return Number.isFinite(a) && (allowNeg || a >= 0) && Math.abs(a) < 1e12 && decimalsOk(a);
  }

  function validWrong(w, ans, kind, allowNeg) {
    if (w === undefined || w === null) return false;
    if (kind === 'text') return typeof w === 'string' && w.length > 0;
    if (kind === 'frac') return typeof w === 'object' && w.isFrac && Number.isFinite(w.n) && Number.isFinite(w.d) && w.d > 1 && w.n > 0 && w.d <= 5000 && w.n <= 100000;
    if (typeof w !== 'number' || !Number.isFinite(w) || Math.abs(w) >= 1e12) return false;
    if (kind === 'int') return Number.isInteger(w) && (allowNeg || w >= 0);
    return decimalsOk(w) && (allowNeg || ans < 0 || w >= 0);
  }

  function padCandidates(ans, kind) {
    const out = [];
    if (kind === 'int') {
      [1, -1, 2, -2, 3, -3, 5, -5, 10, -10, 4, -4, 20, -20, 100, -100].forEach(d => out.push(ans + d));
      out.push(ans * 2, ans * 10);
    } else if (kind === 'dec') {
      [0.1, -0.1, 0.5, -0.5, 1, -1, 0.01, -0.01, 2, -2, 10, -10].forEach(d => out.push(U.round(ans + d)));
      out.push(U.round(ans * 10), U.round(ans / 10), U.round(ans * 2));
    } else if (kind === 'frac') {
      const { n, d } = ans, mk = (a, b) => U.frac(a, b, ans.mixed);
      out.push(mk(n + 1, d), mk(n, d + 1), mk(n - 1, d), mk(n, d - 1), mk(d, n), mk(n + 1, d + 1),
        mk(n + 2, d), mk(n, d + 2), mk(n * 2, d + 1), mk(n + d, d + 1), mk(n + 3, d), mk(n, d + 3));
    }
    return out;
  }

  /** Convierte lo que devuelve un generador en una pregunta lista para mostrar. */
  function finalize(raw, type, r) {
    if (!raw || typeof raw.text !== 'string' || !raw.text || !Array.isArray(raw.steps) || !raw.steps.length) throw new Error('malformada');
    let ans = raw.answer;
    if (ans && ans.isFrac && ans.d === 1) ans = ans.n;
    if (ans && ans.isFrac && ans.mixed && ans.n < ans.d) ans = Object.assign({}, ans, { mixed: false });
    const kind = kindOf(ans);
    if (type !== 'mc' && kind === 'text') throw new Error('respuesta de texto en pregunta abierta');
    if (!validAnswer(ans, kind, raw.allowNeg)) throw new Error('respuesta inválida');
    const q = {
      type, topic: raw.topic, genId: raw.genId, d: raw.d, text: raw.text, svg: raw.svg || '',
      unit: raw.unit || '', kind, answer: ans, steps: raw.steps, allowNeg: !!raw.allowNeg,
      display: U.fmt(ans, raw.unit)
    };
    if (type === 'mc') {
      const seen = new Set([U.key(ans)]);
      let wrongs = [];
      for (let w of (raw.wrong || [])) {
        if (kind === 'frac' && w && w.isFrac) { if (w.d === 1) continue; if (ans.mixed) w = Object.assign({}, w, { mixed: true }); }
        if (!validWrong(w, ans, kind, raw.allowNeg)) continue;
        const k = U.key(w);
        if (seen.has(k)) continue;
        seen.add(k); wrongs.push(w);
      }
      wrongs = r.shuffle(wrongs).slice(0, 3);
      if (wrongs.length < 3 && kind !== 'text') {
        const pads = r.shuffle(padCandidates(ans, kind));
        for (const w of pads) {
          if (wrongs.length >= 3) break;
          if (!validWrong(w, ans, kind, raw.allowNeg)) continue;
          const k = U.key(w);
          if (seen.has(k)) continue;
          seen.add(k); wrongs.push(w);
        }
      }
      if (wrongs.length < 3) throw new Error('pocas alternativas');
      const all = r.shuffle([ans].concat(wrongs));
      q.options = all.map(v => U.fmt(v, raw.unit));
      q.correct = all.indexOf(ans);
      // alternativas con el mismo texto visible serían ambiguas
      if (new Set(q.options).size !== 4) throw new Error('alternativas repetidas');
    }
    return q;
  }

  /** item = {i, type, topic, gen, d}. Reintenta con sub-semillas determinísticas si un intento no sirve. */
  O.buildQuestion = function (seed, item, maxTries = 40) {
    const g = O.GENS.find(x => x.id === item.gen);
    let lastErr;
    for (let attempt = 0; attempt < maxTries; attempt++) {
      try {
        const r = new O.RNG(`${seed}:${item.i}:${attempt}`);
        const raw = g.gen(r, item.d);
        raw.topic = g.topic; raw.genId = g.id; raw.d = item.d;
        const q = finalize(raw, item.type, r);
        q.i = item.i; q.attempt = attempt;
        return q;
      } catch (e) { lastErr = e; }
    }
    throw new Error(`No se pudo generar ${item.gen}: ${lastErr && lastErr.message}`);
  };

  /* ---------- Plan de un simulacro ---------- */
  function usable(topic, type) {
    return O.GENS.filter(g => g.topic === topic && (type === 'mc' || !g.mcOnly) && (type !== 'dev' || g.dev));
  }
  O.usable = usable;

  /** Decide, solo con la semilla, qué tema, tipo y generador va en cada posición. */
  O.planExam = function (seed, stage, diff) {
    const r = new O.RNG(seed + ':plan');
    const types = [];
    for (let k = 0; k < stage.mc; k++) types.push('mc');
    for (let k = 0; k < stage.open; k++) types.push('open');
    for (let k = 0; k < stage.dev; k++) types.push('dev');
    const n = types.length, ids = O.TOPICS.map(t => t.id);
    let seq = [];
    while (seq.length < n) {
      const t = r.shuffle(ids);
      if (seq.length && t[0] === seq[seq.length - 1]) t.push(t.shift());
      seq = seq.concat(t);
    }
    const bump = stage.id === 'C' ? 0 : stage.id === 'S' ? 0.3 : 0.5;
    const used = {}; let last = null;
    return types.map((type, i) => {
      const topic = seq[i];
      const cand = usable(topic, type);
      let pool = cand.filter(g => g.id !== last);
      if (!pool.length) pool = cand;
      const min = Math.min(...pool.map(g => used[g.id] || 0));
      const g = r.pick(pool.filter(x => (used[x.id] || 0) === min));
      used[g.id] = (used[g.id] || 0) + 1; last = g.id;
      const d = Math.min(3, diff + (diff < 3 && r.chance(bump) ? 1 : 0));
      return { i, type, topic, gen: g.id, d };
    });
  };

  O.buildAll = function (seed, stage, diff) {
    return O.planExam(seed, stage, diff).map(item => O.buildQuestion(seed, item));
  };

  /** Pregunta suelta para la práctica libre. */
  O.practiceQuestion = function (seed, topic, diff, allowDev) {
    const r = new O.RNG(seed + ':p');
    const roll = r.next();
    const type = allowDev && roll > 0.75 ? 'dev' : roll > 0.45 ? 'mc' : 'open';
    const topics = topic === 'all' ? O.TOPICS.map(t => t.id) : [topic];
    const t = r.pick(topics);
    const g = r.pick(usable(t, type));
    return O.buildQuestion(seed, { i: 0, type, topic: t, gen: g.id, d: diff });
  };

  /* ---------- Respuestas abiertas ---------- */
  /** Devuelve los valores posibles que representa lo escrito (vacío si no se entiende). */
  O.parseAnswer = function (raw) {
    let s = String(raw == null ? '' : raw).replace(/[−–—]/g, '-').trim();
    s = s.replace(/[a-zA-Z²³°%$°]/g, '').trim();
    if (!s) return [];
    let m = s.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (m) {
      const w = +m[1], n = +m[2], d = +m[3];
      if (!d) return [];
      return [(m[1].startsWith('-') ? -1 : 1) * (Math.abs(w) + n / d)];
    }
    s = s.replace(/\s+/g, '');
    m = s.match(/^(-?\d+)\/(\d+)$/);
    if (m) { const d = +m[2]; return d ? [+m[1] / d] : []; }
    const out = [];
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) out.push(parseFloat(s.replace(/\./g, '').replace(',', '.')));
    const t = s.replace(',', '.');
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(t)) out.push(parseFloat(t));
    return out;
  };
  O.checkOpen = function (q, input) {
    const target = q.kind === 'frac' ? q.answer.n / q.answer.d : q.answer;
    const tol = 1e-9 * Math.max(1, Math.abs(target));
    return O.parseAnswer(input).some(v => Math.abs(v - target) <= tol);
  };

  /* ---------- Corrección ---------- */
  /** answers: {i: opción(número) | texto | {t,f}}, selfEval: {i: 0|0.5|1}  → puntaje y desglose */
  O.grade = function (questions, answers, selfEval) {
    selfEval = selfEval || {};
    const per = [], byTopic = {};
    let points = 0;
    questions.forEach(q => {
      const a = answers[q.i];
      let pts = 0, state = 'blank';
      if (q.type === 'mc') {
        if (typeof a === 'number') { state = a === q.correct ? 'ok' : 'bad'; pts = state === 'ok' ? 1 : 0; }
      } else if (q.type === 'open') {
        if (a !== undefined && String(a).trim() !== '') { state = O.checkOpen(q, a) ? 'ok' : 'bad'; pts = state === 'ok' ? 1 : 0; }
      } else {
        const ev = selfEval[q.i];
        if (ev === undefined) state = 'pending';
        else { pts = ev; state = ev === 1 ? 'ok' : ev === 0.5 ? 'partial' : 'bad'; }
      }
      points += pts;
      per.push({ i: q.i, state, pts });
      const b = byTopic[q.topic] || (byTopic[q.topic] = { pts: 0, total: 0 });
      b.pts += pts; b.total += 1;
    });
    const total = questions.length;
    const pct = total ? points / total * 100 : 0;
    return { points, total, pct, pass: points * 100 >= O.PASS * total, per, byTopic, pending: per.filter(p => p.state === 'pending').length };
  };

  /** ¿Está desbloqueado el nivel de índice idx dado el mejor % por nivel? */
  O.isUnlocked = function (idx, best) {
    if (idx === 0) return true;
    const prev = best[O.LEVELS[idx - 1].key];
    return !!prev && prev.pass === true;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
