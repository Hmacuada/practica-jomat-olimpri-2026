/* Interfaz: pantalla de prueba (reloj, navegador de preguntas, respuestas, entrega). */
(function (G) {
  'use strict';
  const O = G.OLI, UI = O.UI, esc = UI.esc, rich = UI.rich;
  let exam = null, qs = null, timerId = null, said = {};

  UI.hintFor = function (q) {
    if (q.kind === 'frac') return q.answer.mixed ? 'Escriba una fracción como 7/3 o un número mixto como 2 1/3 (entero, espacio y fracción).' : 'Escriba la fracción en la forma a/b, por ejemplo 3/4.';
    if (q.kind === 'dec') return 'Puede usar coma o punto decimal, por ejemplo 3,5.';
    return 'Escriba únicamente el número, sin unidades.';
  };
  UI.isAnswered = function (q, a) {
    if (q.type === 'mc') return typeof a === 'number';
    if (q.type === 'open') return a !== undefined && String(a).trim() !== '';
    return !!(a && ((a.t || '').trim() || (a.f || '').trim()));
  };

  /** Pantalla de confirmación antes de empezar (también para repetir un simulacro con la misma semilla). */
  UI.confirmStart = function (key, seed) {
    const lv = O.levelByKey(key);
    UI.modal({
      title: `${lv.stage.name} · ${O.DIFFS[lv.diff - 1]}`,
      html: `<p>Son <strong>${O.totalQuestions(lv.stage)} preguntas</strong> y tienes <strong>${lv.stage.minutes} minutos</strong>. El tiempo empieza a correr cuando pulses «Comenzar».</p>
        <ul><li>Puedes marcar preguntas para revisarlas después.</li><li>Si recargas la página, la prueba sigue donde la dejaste.</li><li>Si el tiempo se acaba, la prueba se entrega sola.</li></ul>
        ${seed ? `<p class="hint">Es el mismo simulacro de antes (código ${esc(seed)}).</p>` : ''}`,
      actions: [{ label: 'Todavía no', cls: 'ghost' }, { label: 'Comenzar', cls: 'primary', focus: true, onClick: () => UI.startExam(key, seed) }]
    });
  };

  UI.startExam = function (key, seed) {
    const lv = O.levelByKey(key), now = Date.now();
    exam = { seed: seed || O.newSeed(), key, startAt: now, endAt: now + lv.stage.minutes * 60000, answers: {}, marks: {}, cur: 0 };
    O.Progress.saveActive(exam);
    O.Progress.saveView('exam');
    UI.go('exam');
  };

  function save() { O.Progress.saveActive(exam); }

  UI.views.exam = function () {
    if (!exam) exam = O.Progress.active();
    if (!exam) { UI.go('home'); return; }
    const lv = O.levelByKey(exam.key);
    try { qs = O.buildAll(exam.seed, lv.stage, lv.diff); }
    catch (e) { O.Progress.clearActive(); exam = null; UI.go('home'); return; }
    if (Date.now() >= exam.endAt) { UI.finishExam(true); return; }
    O.Progress.saveView('exam');
    said = {};
    UI.setMain(`
      <div class="exambar" role="region" aria-label="Datos de la prueba">
        <div class="title"><strong>${esc(lv.stage.name)} · ${O.DIFFS[lv.diff - 1]}</strong><small id="progressTxt"></small></div>
        <div class="timer-wrap"><span class="timer-msg" id="tmsg" aria-hidden="true"></span><div class="timer" id="timer" role="timer" aria-label="Tiempo restante">--:--</div></div>
        <button class="btn primary" type="button" data-act="submit">Entregar</button>
      </div>
      <div class="examgrid">
        <div id="qarea"></div>
        <aside class="qnav" aria-label="Navegador de preguntas">
          <h2>Preguntas</h2>
          <div class="qgrid" id="qgrid"></div>
          <ul class="qlegend"><li><i class="a"></i>Respondida</li><li><i class="m"></i>Marcada para revisar</li><li><i></i>Sin responder</li><li><i class="c"></i>Pregunta actual</li></ul>
          <p class="qprogress" id="qprogress"></p>
        </aside>
      </div>`);
    renderQuestion(false);
    renderNav();
    tick();
    timerId = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    UI.leave = () => { clearInterval(timerId); timerId = null; document.removeEventListener('visibilitychange', tick); };

    const H = UI.handlers;
    H.pick = el => { exam.answers[exam.cur] = +el.value; save(); renderNav(); };
    H.text = el => { exam.answers[exam.cur] = el.value; save(); renderNav(); };
    H.proc = el => { const a = exam.answers[exam.cur] || { t: '', f: '' }; a.t = el.value; exam.answers[exam.cur] = a; save(); renderNav(); };
    H.final = el => { const a = exam.answers[exam.cur] || { t: '', f: '' }; a.f = el.value; exam.answers[exam.cur] = a; save(); renderNav(); };
    H.clear = () => { delete exam.answers[exam.cur]; save(); renderQuestion(true); renderNav(); };
    H.mark = () => { exam.marks[exam.cur] = !exam.marks[exam.cur]; if (!exam.marks[exam.cur]) delete exam.marks[exam.cur]; save(); renderQuestion(false); renderNav(); UI.$('[data-act="mark"]').focus(); };
    H.prev = () => go(exam.cur - 1);
    H.next = () => go(exam.cur + 1);
    H.goto = el => go(+el.dataset.i);
    H.submit = () => confirmSubmit();
  };

  function go(i) {
    if (i < 0 || i >= qs.length) return;
    exam.cur = i; save();
    renderQuestion(true); renderNav();
  }

  function renderQuestion(focusTitle) {
    const i = exam.cur, q = qs[i], a = exam.answers[i], total = qs.length;
    let ans = '';
    if (q.type === 'mc') {
      ans = `<fieldset class="opts"><legend>Seleccione una alternativa</legend>${q.options.map((o, k) => `
        <label class="opt"><input type="radio" name="opt" value="${k}" data-in="pick" ${a === k ? 'checked' : ''}>
        <span class="letter" aria-hidden="true">${O.LETTERS[k]}</span><span class="sr-only">Alternativa ${O.LETTERS[k]}: </span><span class="otext">${rich(o)}</span></label>`).join('')}</fieldset>
        <p style="margin-top:12px"><button class="btn small ghost" type="button" data-act="clear">Borrar respuesta</button></p>`;
    } else if (q.type === 'open') {
      ans = `<label for="ans" style="font-weight:700;display:block;margin-bottom:6px">Respuesta${q.unit && q.unit !== '$' ? ` (en ${esc(q.unit)})` : q.unit === '$' ? ' (en pesos)' : ''}</label>
        <div class="inputrow">${q.unit === '$' ? '<span class="unit">$</span>' : ''}<input id="ans" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" data-in="text" value="${esc(a || '')}">${q.unit && q.unit !== '$' ? `<span class="unit">${esc(q.unit)}</span>` : ''}</div>
        <p class="hint">${UI.hintFor(q)}</p>`;
    } else {
      const v = a || { t: '', f: '' };
      ans = `<label for="proc" style="font-weight:700;display:block;margin-bottom:6px">Procedimiento</label>
        <textarea id="proc" data-in="proc" placeholder="Escriba los pasos de la resolución…">${esc(v.t || '')}</textarea>
        <label for="final" style="font-weight:700;display:block;margin:14px 0 6px">Respuesta final (opcional)</label>
        <div class="inputrow"><input id="final" type="text" autocomplete="off" spellcheck="false" data-in="final" value="${esc(v.f || '')}"></div>
        <p class="hint">Este problema no se corrige automáticamente. Al entregar la prueba se mostrará la solución paso a paso para realizar la autoevaluación.</p>`;
    }
    const marked = !!exam.marks[i];
    UI.$('#qarea').innerHTML = `
      <article class="qcard" aria-labelledby="qtitle">
        <div class="qhead"><h2 class="qnum" id="qtitle" tabindex="-1">Pregunta ${i + 1} <span class="muted" style="font-weight:400">de ${total}</span></h2>
          <span class="chip">${O.TYPE_NAMES[q.type]}</span></div>
        <div class="qtext">${rich(q.text)}</div>
        ${q.svg ? `<div class="qfig">${q.svg}</div>` : ''}
        <div class="qanswer">${ans}</div>
        <div class="qctl">
          <button class="btn" type="button" data-act="prev" ${i === 0 ? 'disabled' : ''}>← Anterior</button>
          <div class="mid"><button class="btn ${marked ? 'marked' : ''}" type="button" data-act="mark" aria-pressed="${marked}">${marked ? '⚑ Marcada para revisar' : '⚐ Marcar para revisar'}</button></div>
          <button class="btn primary" type="button" data-act="next" ${i === total - 1 ? 'disabled' : ''}>Siguiente →</button>
        </div>
      </article>`;
    if (focusTitle) UI.$('#qtitle').focus({ preventScroll: false });
  }

  function renderNav() {
    const g = UI.$('#qgrid');
    if (!g) return;
    let answered = 0, marked = 0;
    g.innerHTML = qs.map((q, i) => {
      const ok = UI.isAnswered(q, exam.answers[i]), mk = !!exam.marks[i], cur = i === exam.cur;
      if (ok) answered++; if (mk) marked++;
      return `<button type="button" class="qb ${ok ? 'answered' : ''} ${mk ? 'marked' : ''} ${cur ? 'current' : ''}" data-act="goto" data-i="${i}"
        ${cur ? 'aria-current="step"' : ''} aria-label="Pregunta ${i + 1}: ${ok ? 'respondida' : 'sin responder'}${mk ? ', marcada para revisar' : ''}${cur ? ', pregunta actual' : ''}">${i + 1}</button>`;
    }).join('');
    UI.$('#qprogress').textContent = `${answered} de ${qs.length} respondidas${marked ? ` · ${marked} marcada${marked > 1 ? 's' : ''}` : ''}`;
    UI.$('#progressTxt').textContent = `${answered} de ${qs.length} respondidas`;
  }

  function tick() {
    if (!exam) return;
    const ms = exam.endAt - Date.now(), secs = Math.max(0, Math.ceil(ms / 1000));
    const t = UI.$('#timer');
    if (t) {
      t.textContent = UI.fmtTime(secs);
      t.className = 'timer' + (secs <= 300 ? ' danger' : secs <= 600 ? ' warn' : '');
      const m = UI.$('#tmsg');
      if (m) {
        m.textContent = secs <= 300 ? '¡Menos de 5 minutos!' : secs <= 600 ? 'Menos de 10 minutos' : '';
        m.className = 'timer-msg' + (secs <= 300 ? ' danger' : '');
      }
      if (secs <= 600 && secs > 300 && !said.w10) { said.w10 = true; UI.announce('Quedan menos de 10 minutos.'); }
      if (secs <= 300 && !said.w5) { said.w5 = true; UI.announce('Quedan menos de 5 minutos.'); }
    }
    if (ms <= 0) UI.finishExam(true);
  }

  function confirmSubmit() {
    const total = qs.length;
    let answered = 0;
    qs.forEach((q, i) => { if (UI.isAnswered(q, exam.answers[i])) answered++; });
    const blank = total - answered, marked = Object.keys(exam.marks).length;
    const secs = Math.max(0, Math.ceil((exam.endAt - Date.now()) / 1000));
    UI.modal({
      title: '¿Entregar la prueba?',
      html: `<p>Has respondido <strong>${answered} de ${total}</strong> preguntas. Aún te quedan <strong>${UI.fmtTime(secs)}</strong> de tiempo.</p>
        ${blank ? `<p class="callout warn">Tienes <strong>${blank}</strong> pregunta${blank > 1 ? 's' : ''} sin responder.</p>` : '<p class="callout ok">Respondiste todas las preguntas.</p>'}
        ${marked ? `<p class="callout" style="margin-top:10px">Tienes <strong>${marked}</strong> marcada${marked > 1 ? 's' : ''} para revisar.</p>` : ''}
        <p class="hint" style="margin-top:12px">Después de entregar no se pueden cambiar las respuestas.</p>`,
      actions: [{ label: 'Seguir revisando', cls: 'ghost', focus: true }, { label: 'Sí, entregar', cls: 'primary', onClick: () => UI.finishExam(false) }]
    });
  }

  /** Cierra la prueba, corrige y muestra los resultados. */
  UI.finishExam = function (auto) {
    if (!exam) exam = O.Progress.active();
    if (!exam) return;
    const e = exam;
    exam = null; qs = null;
    if (timerId) { clearInterval(timerId); timerId = null; }
    const last = { id: `${e.seed}-${e.startAt}`, seed: e.seed, key: e.key, ts: Date.now(), startAt: e.startAt, answers: e.answers, marks: e.marks, selfEval: {}, auto: !!auto };
    O.Progress.saveLast(last);
    O.Progress.clearActive();
    UI.recordLast(last);
    UI.go('results', { last, justFinished: true });
    if (auto) UI.announce('Se acabó el tiempo y la prueba se entregó sola.');
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
