/* Interfaz: práctica libre por tema (sin reloj, con corrección inmediata). */
(function (G) {
  'use strict';
  const O = G.OLI, UI = O.UI, esc = UI.esc, rich = UI.rich;

  function st() {
    return UI.state.practice || (UI.state.practice = { topic: 'all', diff: 1, dev: false, q: null, res: null, n: 0, ok: 0 });
  }

  function newQuestion(s) {
    s.q = O.practiceQuestion(`${O.newSeed()}${s.n}`, s.topic, s.diff, s.dev);
    s.res = null;
  }

  function setup(s) {
    UI.setMain(`
      <section class="card" aria-labelledby="pTitle">
        <h1 id="pTitle" style="font-size:1.6rem">Práctica libre por tema</h1>
        <p class="muted">Sin límite de tiempo. Después de cada pregunta ves enseguida si estuvo bien y cómo se resuelve.</p>
        <div class="form-grid">
          <label class="field">Tema
            <select data-in="p-topic">
              <option value="all" ${s.topic === 'all' ? 'selected' : ''}>Todos los temas mezclados</option>
              ${O.TOPICS.map(t => `<option value="${t.id}" ${s.topic === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}
            </select></label>
          <label class="field">Dificultad
            <select data-in="p-diff">${O.DIFFS.map((d, i) => `<option value="${i + 1}" ${s.diff === i + 1 ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
        </div>
        <label class="check"><input type="checkbox" data-in="p-dev" ${s.dev ? 'checked' : ''}> Incluir problemas de desarrollo (se autoevalúan)</label>
        <div class="btn-row" style="margin-top:18px"><button class="btn primary" type="button" data-act="p-start">Empezar</button>
          <button class="btn ghost" type="button" data-act="p-home">Volver al inicio</button></div>
      </section>`);
    const H = UI.handlers;
    H['p-topic'] = el => { s.topic = el.value; };
    H['p-diff'] = el => { s.diff = +el.value; };
    H['p-dev'] = el => { s.dev = el.checked; };
    H['p-start'] = () => { s.n = 0; s.ok = 0; newQuestion(s); render(s); };
    H['p-home'] = () => UI.go('home');
  }

  function render(s) {
    const q = s.q, res = s.res;
    let ans = '', fb = '';
    if (q.type === 'mc') {
      ans = `<fieldset class="opts" ${res ? 'disabled' : ''}><legend>Seleccione una alternativa</legend>${q.options.map((o, k) => {
        let cls = 'opt';
        if (res) { cls += ' locked'; if (k === q.correct) cls += ' right'; else if (k === res.pick) cls += ' wrong'; }
        return `<label class="${cls}"><input type="radio" name="opt" value="${k}" data-in="p-pick" ${res && res.pick === k ? 'checked' : ''}>
          <span class="letter" aria-hidden="true">${O.LETTERS[k]}</span><span class="sr-only">Alternativa ${O.LETTERS[k]}: </span><span class="otext">${rich(o)}</span></label>`;
      }).join('')}</fieldset>`;
    } else if (q.type === 'open') {
      ans = `<label for="pans" style="font-weight:700;display:block;margin-bottom:6px">Respuesta${q.unit && q.unit !== '$' ? ` (en ${esc(q.unit)})` : q.unit === '$' ? ' (en pesos)' : ''}</label>
        <div class="inputrow">${q.unit === '$' ? '<span class="unit">$</span>' : ''}<input id="pans" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" data-enter="p-check" value="${res ? esc(res.val) : ''}" ${res ? 'readonly' : ''}>${q.unit && q.unit !== '$' ? `<span class="unit">${esc(q.unit)}</span>` : ''}</div>
        <p class="hint">${UI.hintFor(q)}</p>
        ${res ? '' : '<p style="margin-top:12px"><button class="btn primary" type="button" data-act="p-check">Comprobar</button></p>'}`;
    } else {
      ans = res
        ? `<div class="userbox">${(res.text || '').trim() ? esc(res.text) : '<em>No escribiste nada</em>'}</div>`
        : `<label for="pproc" style="font-weight:700;display:block;margin-bottom:6px">Procedimiento</label>
           <textarea id="pproc" placeholder="Escriba los pasos de la resolución…"></textarea>
           <p class="hint">Este problema no se corrige automáticamente: pulse «Ver solución» y compare el procedimiento.</p>
           <p style="margin-top:12px"><button class="btn primary" type="button" data-act="p-show">Ver solución</button></p>`;
    }
    if (res && (q.type !== 'dev' || res.shown)) {
      const good = q.type === 'dev' ? null : res.ok;
      fb = `<div class="feedback ${good === null ? '' : good ? 'ok' : 'bad'}" role="status" tabindex="-1" id="fb">
        <h3>${q.type === 'dev' ? 'Solución paso a paso' : good ? 'Respuesta correcta' : 'Respuesta incorrecta. Revisemos la solución.'}</h3>
        ${q.type !== 'dev' && !good ? `<p>La respuesta correcta es <strong>${rich(q.type === 'mc' ? `${O.LETTERS[q.correct]}) ${q.options[q.correct]}` : q.display)}</strong>.</p>` : ''}
        ${q.type === 'dev' ? `<p>Respuesta: <strong>${rich(q.display)}</strong></p>` : ''}
        <ol class="steps">${q.steps.map(x => `<li>${rich(x)}</li>`).join('')}</ol>
        ${q.type === 'dev' && res.ev === undefined ? `<div class="selfeval" role="group" aria-label="Autoevaluación"><p>Autoevaluación: ¿cómo resultó el procedimiento?</p><div class="btn-row">${[[1, 'Lo logré'], [0.5, 'Casi'], [0, 'No lo logré']].map(([v, t]) => `<button class="btn small" type="button" data-act="p-eval" data-v="${v}">${t}</button>`).join('')}</div></div>` : ''}
        ${q.type !== 'dev' || res.ev !== undefined ? '<div class="btn-row" style="margin-top:14px"><button class="btn primary" type="button" data-act="p-next" id="pnext">Siguiente pregunta</button><button class="btn ghost" type="button" data-act="p-setup">Cambiar tema</button></div>' : ''}
      </div>`;
    }
    UI.setMain(`
      <div class="pstats"><button class="btn small ghost" type="button" data-act="p-setup">← Cambiar tema</button>
        <span class="chip">${esc(O.topicName(q.topic))}</span><span class="chip">${O.DIFFS[s.diff - 1]}</span><span class="chip">${O.TYPE_NAMES[q.type]}</span>
        <span class="chip ok" aria-live="polite">${s.ok % 1 ? String(s.ok).replace('.', ',') : s.ok} de ${s.n} correctas</span></div>
      <article class="qcard">
        <div class="qtext">${rich(q.text)}</div>
        ${q.svg ? `<div class="qfig">${q.svg}</div>` : ''}
        <div class="qanswer">${ans}</div>
        ${fb}
      </article>`);

    const H = UI.handlers;
    H['p-pick'] = el => { if (s.res) return; const k = +el.value; s.res = { pick: k, ok: k === q.correct }; s.n++; if (s.res.ok) s.ok++; render(s); focusFb(); };
    H['p-check'] = () => {
      if (s.res) return;
      const inp = UI.$('#pans');
      if (!inp.value.trim()) { inp.focus(); return; }
      const ok = O.checkOpen(q, inp.value);
      s.res = { val: inp.value, ok }; s.n++; if (ok) s.ok++; render(s); focusFb();
    };
    H['p-show'] = () => { s.res = { text: UI.$('#pproc').value, shown: true }; render(s); focusFb(); };
    H['p-eval'] = el => { s.res.ev = +el.dataset.v; s.n++; s.ok += s.res.ev; render(s); const b = UI.$('#pnext'); if (b) b.focus(); };
    H['p-next'] = () => { newQuestion(s); render(s); window.scrollTo(0, 0); const f = UI.$('.qtext'); if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); } };
    H['p-setup'] = () => { s.q = null; s.res = null; UI.views.practice(); };
  }

  function focusFb() { const f = UI.$('#fb'); if (f) { f.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); const b = UI.$('#pnext') || f; b.focus({ preventScroll: true }); } }

  UI.views.practice = function () {
    O.Progress.saveView('home');
    const s = st();
    if (s.q) render(s); else setup(s);
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
