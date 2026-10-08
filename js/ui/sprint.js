/* Interfaz: práctica contra reloj (tema, dificultad y duración a elección; preguntas seguidas con corrección inmediata). */
(function (G) {
  'use strict';
  const O = G.OLI, UI = O.UI, esc = UI.esc, rich = UI.rich;
  const DURATIONS = [3, 5, 10, 15, 20];

  let run = null, plan = null, q = null, fb = null, timerId = null, autoId = null, said = {}, keyFn = null;

  const cfgKey = c => `${c.topic}|${c.diff}|${c.minutes}`;
  const topicLabel = t => (t === 'all' ? 'Todos los temas' : O.topicName(t));
  const cfgName = c => `${topicLabel(c.topic)} · ${O.DIFFS[c.diff - 1]} · ${c.minutes} min`;
  const fmt1 = x => String(Math.round(x * 10) / 10).replace('.', ',');
  function save() { O.Progress.saveSprint(run); }

  /* ---------- Configuración ---------- */
  UI.views.sprint = function () {
    O.Progress.saveView('home');
    const s = UI.state.sprintCfg || (UI.state.sprintCfg = { topic: 'all', diff: 1, minutes: 5 });
    const best = O.Progress.sprintBest();
    const rows = Object.keys(best).map(k => ({ k, ...best[k] })).sort((a, b) => b.ts - a.ts).slice(0, 8);
    UI.setMain(`
      <section class="card" aria-labelledby="sTitle">
        <h1 id="sTitle" style="font-size:1.6rem">Práctica contra reloj</h1>
        <p class="muted">Responda la mayor cantidad posible de preguntas antes de que termine el tiempo. Después de cada respuesta se muestra si fue correcta. Las preguntas son de alternativas y de respuesta abierta; no se incluyen problemas de desarrollo.</p>
        <div class="form-grid">
          <label class="field">Tema
            <select data-in="s-topic">
              <option value="all" ${s.topic === 'all' ? 'selected' : ''}>Todos los temas mezclados</option>
              ${O.TOPICS.map(x => `<option value="${x.id}" ${s.topic === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}
            </select></label>
          <label class="field">Dificultad
            <select data-in="s-diff">${O.DIFFS.map((x, i) => `<option value="${i + 1}" ${s.diff === i + 1 ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
          <label class="field">Duración
            <select data-in="s-min">${DURATIONS.map(x => `<option value="${x}" ${s.minutes === x ? 'selected' : ''}>${x} minutos</option>`).join('')}</select></label>
        </div>
        <p class="callout" id="sRec" aria-live="polite"></p>
        <div class="btn-row" style="margin-top:18px"><button class="btn primary" type="button" data-act="s-start">Comenzar</button>
          <button class="btn ghost" type="button" data-act="s-home">Volver al inicio</button></div>
      </section>
      <section class="card" aria-labelledby="sRecTitle" style="margin-top:20px"><h2 id="sRecTitle">Mejores marcas</h2>
        ${rows.length ? `<div class="table-wrap"><table class="hist"><caption class="sr-only">Mejores marcas contra reloj</caption>
          <thead><tr><th scope="col">Configuración</th><th scope="col">Correctas</th><th scope="col">Precisión</th><th scope="col">Fecha</th></tr></thead><tbody>
          ${rows.map(r => { const [tp, df, mn] = r.k.split('|'); return `<tr><td data-label="Configuración">${esc(cfgName({ topic: tp, diff: +df, minutes: +mn }))}</td><td class="num" data-label="Correctas"><strong>${r.correct}</strong> de ${r.answered}</td><td class="num" data-label="Precisión">${UI.pct(r.pct)}</td><td class="num muted" data-label="Fecha">${UI.fmtDate(r.ts)}</td></tr>`; }).join('')}
          </tbody></table></div>` : '<p class="muted">Todavía no hay marcas. ¡Complete la primera sesión!</p>'}
      </section>`);

    const showRec = () => {
      const b = best[cfgKey(s)];
      const el = UI.$('#sRec');
      if (el) el.innerHTML = b ? `Mejor marca con esta configuración: <strong>${b.correct} correctas</strong> de ${b.answered} respondidas (${UI.pct(b.pct)}).` : 'Todavía no hay marca con esta configuración.';
    };
    showRec();
    const H = UI.handlers;
    H['s-topic'] = el => { s.topic = el.value; showRec(); };
    H['s-diff'] = el => { s.diff = +el.value; showRec(); };
    H['s-min'] = el => { s.minutes = +el.value; showRec(); };
    H['s-start'] = () => UI.startSprint(s);
    H['s-home'] = () => UI.go('home');
  };

  UI.startSprint = function (cfg) {
    const now = Date.now();
    run = { cfg: { topic: cfg.topic, diff: cfg.diff, minutes: cfg.minutes }, seed: O.newSeed(), startAt: now, endAt: now + cfg.minutes * 60000, qStart: now, log: [] };
    save();
    O.Progress.saveView('sprintrun');
    UI.go('sprintrun');
  };

  /* ---------- Sesión en curso ---------- */
  UI.views.sprintrun = function () {
    if (!run) run = O.Progress.sprint();
    if (!run) { UI.go('sprint'); return; }
    if (Date.now() >= run.endAt) { UI.finishSprint(); return; }
    plan = O.planSprint(run.seed, run.cfg.topic, run.cfg.diff);
    O.Progress.saveView('sprintrun');
    said = {}; fb = null;
    UI.setMain(`
      <div class="exambar" role="region" aria-label="Datos de la práctica contra reloj">
        <div class="title"><strong>Contra reloj</strong><small>${esc(cfgName(run.cfg))}</small></div>
        <div class="sprintstats" aria-live="off"><span class="chip ok" id="sOk"></span><span class="chip" id="sAns"></span><span class="chip" id="sStreak"></span></div>
        <div class="timer-wrap"><span class="timer-msg" id="tmsg" aria-hidden="true"></span><div class="timer" id="timer" role="timer" aria-label="Tiempo restante">--:--</div></div>
        <button class="btn" type="button" data-act="s-end">Terminar</button>
      </div>
      <div id="sarea"></div>`);
    renderQuestion();
    tick();
    timerId = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    keyFn = onKey;
    document.addEventListener('keydown', keyFn);
    UI.leave = () => {
      clearInterval(timerId); timerId = null; clearTimeout(autoId); autoId = null;
      document.removeEventListener('visibilitychange', tick);
      if (keyFn) { document.removeEventListener('keydown', keyFn); keyFn = null; }
    };

    const H = UI.handlers;
    H['s-pick'] = el => { if (fb) return; const k = +el.value; commit({ ok: k === q.correct, val: k }); };
    H['s-check'] = () => {
      if (fb) return;
      const inp = UI.$('#sans');
      if (!inp.value.trim()) { inp.focus(); return; }
      commit({ ok: O.checkOpen(q, inp.value), val: inp.value.trim() });
    };
    H['s-skip'] = () => { if (fb) return; logEntry({ ok: null, val: null }); next(); };
    H['s-next'] = () => next();
    H['s-end'] = () => {
      UI.modal({
        title: '¿Terminar la práctica?',
        html: `<p>Se mostrará el resumen con las respuestas entregadas hasta ahora. Quedan <strong>${UI.fmtTime(Math.max(0, Math.ceil((run.endAt - Date.now()) / 1000)))}</strong> de tiempo.</p>`,
        actions: [{ label: 'Seguir practicando', cls: 'ghost', focus: true }, { label: 'Sí, terminar', cls: 'primary', onClick: () => UI.finishSprint() }]
      });
    };
  };

  function logEntry(res) {
    const idx = run.log.length;
    run.log.push({ i: idx, topic: q.topic, genId: q.genId, type: q.type, ok: res.ok, val: res.val, ms: Date.now() - run.qStart });
    save();
  }

  function commit(res) {
    logEntry(res);
    fb = res;
    renderQuestion();
    if (res.ok) autoId = setTimeout(next, 800);
    else { const b = UI.$('#snext'); if (b) b.focus(); }
  }

  function next() {
    if (!run) return;
    clearTimeout(autoId); autoId = null;
    fb = null;
    run.qStart = Date.now();
    save();
    renderQuestion();
  }

  function renderQuestion() {
    const idx = run.log.length - (fb ? 1 : 0);
    q = O.buildQuestion(run.seed, plan[idx]);
    const sum = O.sprintSummary(run.log);
    UI.$('#sOk').textContent = `${sum.correct} correcta${sum.correct === 1 ? '' : 's'}`;
    UI.$('#sAns').textContent = `${sum.answered} respondida${sum.answered === 1 ? '' : 's'}`;
    UI.$('#sStreak').textContent = `Racha: ${sum.currentStreak}`;
    let ans;
    if (q.type === 'mc') {
      ans = `<fieldset class="opts" ${fb ? 'disabled' : ''}><legend>Seleccione una alternativa</legend>${q.options.map((o, k) => {
        let cls = 'opt';
        if (fb) { cls += ' locked'; if (k === q.correct) cls += ' right'; else if (k === fb.val) cls += ' wrong'; }
        return `<label class="${cls}"><input type="radio" name="opt" value="${k}" data-in="s-pick" ${fb && fb.val === k ? 'checked' : ''}>
          <span class="letter" aria-hidden="true">${O.LETTERS[k]}</span><span class="sr-only">Alternativa ${O.LETTERS[k]}: </span><span class="otext">${rich(o)}</span></label>`;
      }).join('')}</fieldset>`;
    } else {
      ans = `<label for="sans" style="font-weight:700;display:block;margin-bottom:6px">Respuesta${q.unit && q.unit !== '$' ? ` (en ${esc(q.unit)})` : q.unit === '$' ? ' (en pesos)' : ''}</label>
        <div class="inputrow">${q.unit === '$' ? '<span class="unit">$</span>' : ''}<input id="sans" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" data-enter="s-check" value="${fb ? esc(fb.val) : ''}" ${fb ? 'readonly' : ''}>${q.unit && q.unit !== '$' ? `<span class="unit">${esc(q.unit)}</span>` : ''}</div>
        <p class="hint">${UI.hintFor(q)}</p>
        ${fb ? '' : '<p style="margin-top:12px"><button class="btn primary" type="button" data-act="s-check">Comprobar</button></p>'}`;
    }
    let feedback = '';
    if (fb) {
      const right = q.type === 'mc' ? `${O.LETTERS[q.correct]}) ${q.options[q.correct]}` : q.display;
      feedback = `<div class="feedback ${fb.ok ? 'ok' : 'bad'}" role="status" id="sfb">
        <h3>${fb.ok ? 'Respuesta correcta' : 'Respuesta incorrecta'}</h3>
        ${fb.ok ? '' : `<p>La respuesta correcta es <strong>${rich(right)}</strong>.</p>`}
        <details><summary style="cursor:pointer;font-weight:700;min-height:36px">Resolución paso a paso</summary><ol class="steps">${q.steps.map(x => `<li>${rich(x)}</li>`).join('')}</ol></details>
        <div class="btn-row" style="margin-top:12px"><button class="btn primary" type="button" data-act="s-next" id="snext">Siguiente pregunta</button></div>
      </div>`;
    }
    UI.$('#sarea').innerHTML = `
      <article class="qcard" aria-labelledby="sqtitle">
        <div class="qhead"><h2 class="qnum" id="sqtitle" tabindex="-1">Pregunta ${idx + 1}</h2>
          <span><span class="chip">${esc(O.topicName(q.topic))}</span> <span class="chip">${O.TYPE_NAMES[q.type]}</span></span></div>
        <div class="qtext">${rich(q.text)}</div>
        ${q.svg ? `<div class="qfig">${q.svg}</div>` : ''}
        <div class="qanswer">${ans}</div>
        ${feedback}
        ${fb ? '' : `<div class="qctl"><button class="btn ghost" type="button" data-act="s-skip">Saltar pregunta</button>
          <span class="keyhint">${q.type === 'mc' ? 'Atajos: <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> para responder' : 'Presione <kbd>Enter</kbd> para comprobar'}</span></div>`}
      </article>`;
    if (!fb) {
      // se difiere: UI.go devuelve el foco al contenedor principal justo después de dibujar la vista
      setTimeout(() => {
        const inp = UI.$('#sans'), title = UI.$('#sqtitle');
        if (inp) inp.focus(); else if (title) title.focus({ preventScroll: true });
      }, 0);
    }
  }

  /** Atajos de teclado: A–D / 1–4 eligen alternativa; Enter, espacio o → pasan a la siguiente tras responder. */
  function onKey(e) {
    if (!run || e.ctrlKey || e.metaKey || e.altKey) return;
    if (UI.$('#modal-root').children.length) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' && e.target.type === 'text') return;
    if (fb) {
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') && tag !== 'button') { e.preventDefault(); next(); }
      return;
    }
    if (q && q.type === 'mc') {
      const k = 'abcd'.indexOf(e.key.toLowerCase());
      const n = ['1', '2', '3', '4'].indexOf(e.key);
      const pick = k >= 0 ? k : n;
      if (pick >= 0) {
        e.preventDefault();
        const inp = UI.$$('.opt input')[pick];
        if (inp) { inp.checked = true; commit({ ok: pick === q.correct, val: pick }); }
      }
    }
  }

  function tick() {
    if (!run) return;
    const ms = run.endAt - Date.now(), secs = Math.max(0, Math.ceil(ms / 1000));
    const t = UI.$('#timer');
    if (t) {
      t.textContent = UI.fmtTime(secs);
      t.className = 'timer' + (secs <= 30 ? ' danger' : secs <= 60 ? ' warn' : '');
      const m = UI.$('#tmsg');
      if (m) {
        m.textContent = secs <= 30 ? '¡Últimos 30 segundos!' : secs <= 60 ? 'Último minuto' : '';
        m.className = 'timer-msg' + (secs <= 30 ? ' danger' : '');
      }
      if (secs <= 60 && secs > 30 && !said.w60) { said.w60 = true; UI.announce('Queda menos de un minuto.'); }
      if (secs <= 30 && !said.w30) { said.w30 = true; UI.announce('Quedan menos de 30 segundos.'); }
    }
    if (ms <= 0) UI.finishSprint();
  }

  /** Cierra la sesión, calcula el resumen y revisa si hay una nueva mejor marca. */
  UI.finishSprint = function () {
    if (!run) run = O.Progress.sprint();
    if (!run) return;
    const r = run;
    run = null; q = null; fb = null;
    if (timerId) { clearInterval(timerId); timerId = null; }
    clearTimeout(autoId); autoId = null;
    const res = { id: `${r.seed}-${r.startAt}`, cfg: r.cfg, seed: r.seed, startAt: r.startAt, ts: Date.now(), log: r.log };
    const sum = O.sprintSummary(res.log);
    res.record = O.Progress.recordSprint(cfgKey(res.cfg), sum);
    O.Progress.saveLastSprint(res);
    O.Progress.clearSprint();
    O.Progress.saveView('sprintresult');
    UI.go('sprintresult', { res });
    UI.announce('La práctica contra reloj terminó.');
  };

  /* ---------- Resumen ---------- */
  let rfilter = 'bad';
  UI.views.sprintresult = function (p) {
    const res = (p && p.res) || O.Progress.lastSprint();
    if (!res) { UI.go('sprint'); return; }
    O.Progress.saveView('sprintresult');
    const sum = O.sprintSummary(res.log), pl = O.planSprint(res.seed, res.cfg.topic, res.cfg.diff);
    const rec = res.record || {};
    const nm = O.Users.current() ? ', ' + esc(O.Users.current().name) : '';
    const msg = rec.isRecord
      ? `<div class="callout ok"><strong>¡Nueva mejor marca${nm}!</strong> ${sum.correct} correctas${rec.prev ? ` (la marca anterior era ${rec.prev.correct})` : ''}.</div>`
      : sum.answered === 0 ? '<div class="callout warn">No se respondió ninguna pregunta en esta sesión.</div>'
        : rec.prev ? `<div class="callout">La mejor marca con esta configuración es de <strong>${rec.prev.correct} correctas</strong>. Esta vez fueron ${sum.correct}.</div>` : '';
    const topics = O.TOPICS.filter(t => sum.byTopic[t.id]).map(t => ({ t, ...sum.byTopic[t.id], pct: sum.byTopic[t.id].ok / sum.byTopic[t.id].total * 100 })).sort((a, b) => b.pct - a.pct);
    const topicsHtml = res.cfg.topic === 'all' && topics.length > 1
      ? `<section class="card" aria-labelledby="stTitle" style="margin-top:20px"><h2 id="stTitle">Resultado por tema</h2><ul class="topics">${topics.map(r => `<li><span>${esc(r.t.name)}</span>
        <div class="bar ${r.pct >= O.PASS ? 'good' : r.pct < 40 ? 'low' : ''}" role="img" aria-label="${Math.round(r.pct)} por ciento"><i style="width:${Math.round(r.pct)}%"></i></div>
        <span class="num"><strong>${r.ok}/${r.total}</strong></span></li>`).join('')}</ul></section>` : '';
    const items = res.log.map(e => ({ e, q: O.buildQuestion(res.seed, pl[e.i]) }));
    const shown = items.filter(x => rfilter === 'all' || x.e.ok !== true);
    const fakeLast = { answers: {}, selfEval: {} };
    items.forEach(x => { if (x.e.ok !== null) fakeLast.answers[x.q.i] = x.e.val; });
    const stateOf = e => (e.ok === true ? 'ok' : e.ok === false ? 'bad' : 'blank');
    UI.setMain(`
      <section class="card" aria-labelledby="srTitle">
        <h1 id="srTitle" style="font-size:1.5rem">Resultados · Contra reloj</h1>
        <p class="muted">${esc(cfgName(res.cfg))} · código <strong>${esc(res.seed)}</strong></p>
        <div class="score">
          <div class="ring ${sum.pct >= O.PASS ? 'pass' : ''}" style="--p:${Math.round(sum.pct)}" aria-hidden="true"><span>${Math.round(sum.pct)} %</span></div>
          <div><div class="big">${sum.correct}<small> correctas de ${sum.answered}</small></div>
            <p class="muted" style="margin:6px 0 0">Precisión: ${UI.pct(sum.pct)}</p></div>
        </div>
        <div class="statgrid">
          <div class="stat"><strong>${sum.answered}</strong><span>Preguntas respondidas</span></div>
          <div class="stat"><strong>${fmt1(sum.avgSec)} s</strong><span>Tiempo promedio por pregunta</span></div>
          <div class="stat"><strong>${sum.bestStreak}</strong><span>Mejor racha de correctas</span></div>
          <div class="stat"><strong>${sum.skipped}</strong><span>Preguntas saltadas</span></div>
        </div>
        <div style="margin-top:16px">${msg}</div>
        <div class="btn-row" style="margin-top:16px">
          <button class="btn primary" type="button" data-act="sr-again">Intentar de nuevo</button>
          <button class="btn" type="button" data-act="sr-config">Cambiar configuración</button>
          <button class="btn ghost" type="button" data-act="sr-home">Volver al inicio</button>
        </div>
      </section>
      ${topicsHtml}
      <section aria-labelledby="srvTitle" style="margin-top:20px">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:center">
          <h2 id="srvTitle" style="margin:0">Revisión</h2>
          <div class="filters" role="group" aria-label="Filtrar preguntas">
            <button class="btn small" type="button" data-act="sr-filter" data-v="bad" aria-pressed="${rfilter === 'bad'}">Solo falladas o saltadas</button>
            <button class="btn small" type="button" data-act="sr-filter" data-v="all" aria-pressed="${rfilter === 'all'}">Todas (${items.length})</button>
          </div>
        </div>
        ${shown.length ? shown.map(x => UI.reviewItem(x.q, { i: x.q.i, state: stateOf(x.e), pts: x.e.ok ? 1 : 0 }, fakeLast)).join('') : `<div class="callout ok" style="margin-top:14px">${items.length ? '¡No hay preguntas falladas ni saltadas!' : 'No hay preguntas para revisar.'}</div>`}
      </section>`);

    const H = UI.handlers;
    H['sr-again'] = () => UI.startSprint(res.cfg);
    H['sr-config'] = () => { UI.state.sprintCfg = { ...res.cfg }; UI.go('sprint'); };
    H['sr-home'] = () => UI.go('home');
    H['sr-filter'] = el => { rfilter = el.dataset.v; const y = window.scrollY; UI.views.sprintresult({ res }); window.scrollTo(0, y); };
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
