/* Interfaz: resultados (puntaje, desglose por tema, revisión pregunta por pregunta, autoevaluación). */
(function (G) {
  'use strict';
  const O = G.OLI, UI = O.UI, U = O.U, esc = UI.esc, rich = UI.rich;
  let filter = 'all';

  /** Corrige un intento, actualiza mejor puntaje e historial. Devuelve preguntas y nota. */
  UI.recordLast = function (last) {
    const lv = O.levelByKey(last.key), qs = O.buildAll(last.seed, lv.stage, lv.diff);
    const g = O.grade(qs, last.answers, last.selfEval);
    O.Progress.record(last.key, g);
    O.Progress.upsertHistory({ id: last.id, ts: last.ts, key: last.key, seed: last.seed, points: g.points, total: g.total, pct: g.pct, pass: g.pass, pending: g.pending });
    return { qs, g };
  };

  const pts = x => String(x).replace('.', ',');
  const STATE = {
    ok: ['Correcta', 'ok'], bad: ['Incorrecta', 'bad'], blank: ['Sin responder', 'warn'], partial: ['Casi', 'warn'], pending: ['Por autoevaluar', 'warn']
  };

  function reviewItem(q, per, last) {
    const a = last.answers[q.i], [label, cls] = STATE[per.state];
    let body = '';
    if (q.type === 'mc') {
      const mine = typeof a === 'number' ? `${O.LETTERS[a]}) ${rich(q.options[a])}` : '<em>Sin responder</em>';
      body = `<div class="answers"><div class="row"><span class="k">Respuesta entregada</span><span class="v ${per.state === 'ok' ? 'ok' : per.state === 'bad' ? 'bad' : ''}">${mine}</span></div>
        <div class="row"><span class="k">Respuesta correcta</span><span class="v ok">${O.LETTERS[q.correct]}) ${rich(q.options[q.correct])}</span></div></div>`;
    } else if (q.type === 'open') {
      const has = a !== undefined && String(a).trim() !== '';
      body = `<div class="answers"><div class="row"><span class="k">Respuesta entregada</span><span class="v ${per.state === 'ok' ? 'ok' : per.state === 'bad' ? 'bad' : ''}">${has ? esc(a) : '<em>Sin responder</em>'}</span></div>
        <div class="row"><span class="k">Respuesta correcta</span><span class="v ok">${rich(q.display)}</span></div></div>`;
    } else {
      const v = a || { t: '', f: '' }, hasF = (v.f || '').trim() !== '';
      const match = hasF ? O.checkOpen(q, v.f) : null;
      const cur = last.selfEval[q.i];
      body = `<div class="answers"><div class="row"><span class="k">Procedimiento escrito</span></div>
        <div class="procbox">${(v.t || '').trim() ? esc(v.t) : '<em>No escribiste nada</em>'}</div>
        ${hasF ? `<div class="row"><span class="k">Respuesta final escrita</span><span class="v ${match ? 'ok' : 'bad'}">${esc(v.f)} ${match ? '✔ coincide con la solución' : '✘ no coincide con la solución'}</span></div>` : ''}
        <div class="row"><span class="k">Respuesta correcta</span><span class="v ok">${rich(q.display)}</span></div></div>`;
      body += `<div class="selfeval" role="group" aria-label="Autoevaluación de la pregunta ${q.i + 1}">
        <p>Compare el procedimiento escrito con la solución y seleccione el resultado de la autoevaluación:</p>
        <div class="btn-row">${[[1, 'Lo logré'], [0.5, 'Casi'], [0, 'No lo logré']].map(([v2, t]) =>
          `<button type="button" class="btn small" data-act="eval" data-i="${q.i}" data-v="${v2}" aria-pressed="${cur === v2}">${t}</button>`).join('')}</div></div>`;
    }
    return `<article class="review-item ${per.state}" id="rev-${q.i}">
      <div class="review-head"><strong>Pregunta ${q.i + 1}</strong><span class="chip ${cls}">${label}</span><span class="chip">${esc(O.topicName(q.topic))}</span><span class="chip">${O.TYPE_NAMES[q.type]}</span></div>
      <div class="qtext" style="font-size:1.08rem">${rich(q.text)}</div>
      ${q.svg ? `<div class="qfig">${q.svg}</div>` : ''}
      ${body}
      <details${q.type === 'dev' ? ' open' : ''}><summary style="cursor:pointer;font-weight:700;min-height:36px">Resolución paso a paso</summary>
        <ol class="steps">${q.steps.map(s => `<li>${rich(s)}</li>`).join('')}</ol></details>
    </article>`;
  }

  UI.reviewItem = reviewItem;

  UI.views.results = function (p) {
    const last = p.last || O.Progress.last();
    if (!last) { UI.go('home'); return; }
    O.Progress.saveView('results');
    const lv = O.levelByKey(last.key), idx = O.LEVELS.indexOf(lv), next = O.LEVELS[idx + 1];
    const { qs, g } = UI.recordLast(last);   // vuelve a corregir (y mantiene historial al día)
    const pctTxt = Math.round(g.pct);
    const nm = O.Users.current() ? ', ' + esc(O.Users.current().name) : '';

    let msg;
    if (g.pass && next) msg = `<div class="callout ok"><strong>¡Muy bien${nm}!</strong> Superaste el ${O.PASS} %. Se abrió el nivel <strong>${esc(UI.levelName(next.key))}</strong>.</div>`;
    else if (g.pass) msg = `<div class="callout ok"><strong>¡Increíble${nm}!</strong> Superaste el ${O.PASS} % en el último nivel. Ya completaste todo el camino. ¡Sigue practicando para la olimpiada!</div>`;
    else {
      const need = Math.ceil((O.PASS / 100 * g.total - g.points) * 2) / 2;
      msg = `<div class="callout warn"><strong>Casi${nm}.</strong> Te faltaron ${pts(need)} punto${need === 1 ? '' : 's'} para llegar al ${O.PASS} %. Revisa abajo cómo se resuelve cada pregunta e inténtalo de nuevo con preguntas nuevas.</div>`;
    }
    const pend = g.pending ? `<div class="callout warn" style="margin-top:10px"><strong>Te falta autoevaluar ${g.pending} problema${g.pending > 1 ? 's' : ''} de desarrollo.</strong> Mira la solución en la revisión y elige «Lo logré», «Casi» o «No lo logré». Tu puntaje se actualiza al instante.</div>` : '';
    const auto = last.auto ? '<p class="callout warn" style="margin-bottom:12px">Se acabó el tiempo, así que la prueba se entregó sola.</p>' : '';

    const topicRows = O.TOPICS.filter(t => g.byTopic[t.id]).map(t => ({ t, ...g.byTopic[t.id], pct: g.byTopic[t.id].pts / g.byTopic[t.id].total * 100 })).sort((a, b) => b.pct - a.pct);
    const topicsHtml = topicRows.map(r => `<li><span>${esc(r.t.name)}</span>
      <div class="bar ${r.pct >= O.PASS ? 'good' : r.pct < 40 ? 'low' : ''}" role="img" aria-label="${Math.round(r.pct)} por ciento"><i style="width:${Math.round(r.pct)}%"></i></div>
      <span class="num"><strong>${pts(r.pts)}/${r.total}</strong></span></li>`).join('');
    const bestT = topicRows[0], worstT = topicRows[topicRows.length - 1];
    const topicNote = topicRows.length > 1 && bestT.pct !== worstT.pct
      ? `<p>Tu mejor tema fue <strong>${esc(bestT.t.name)}</strong>. El que más conviene repasar es <strong>${esc(worstT.t.name)}</strong>.</p>` : '';

    const shown = qs.map((q, i) => ({ q, per: g.per[i] })).filter(x => filter === 'all' || ['bad', 'blank', 'partial', 'pending'].includes(x.per.state));
    UI.setMain(`
      <section class="card" aria-labelledby="resTitle">
        <h1 id="resTitle" style="font-size:1.5rem">Resultados · ${esc(UI.levelName(last.key))}</h1>
        ${auto}
        <div class="score">
          <div class="ring ${g.pass ? 'pass' : ''}" style="--p:${pctTxt}" aria-hidden="true"><span>${pctTxt} %</span></div>
          <div><div class="big">${pts(g.points)}<small> / ${g.total} puntos</small></div>
            <p class="muted" style="margin:6px 0 0">${pctTxt} % de puntaje · código del simulacro <strong>${esc(last.seed)}</strong></p>
            <span class="chip ${g.pass ? 'ok' : 'warn'}">${g.pass ? `Superado (${O.PASS} % o más)` : `Meta: ${O.PASS} %`}</span></div>
        </div>
        <div style="margin-top:16px">${msg}${pend}</div>
        <div class="btn-row" style="margin-top:16px">
          ${g.pass && next ? `<button class="btn primary" type="button" data-act="nextlevel">Ir a ${esc(UI.levelName(next.key))}</button>` : ''}
          <button class="btn ${g.pass && next ? '' : 'primary'}" type="button" data-act="again">Hacer otro simulacro</button>
          <button class="btn" type="button" data-act="repeat">Repetir este mismo simulacro</button>
          <button class="btn ghost" type="button" data-act="home">Volver al inicio</button>
        </div>
      </section>
      <section class="card" aria-labelledby="topTitle"><h2 id="topTitle">Resultado por tema</h2>${topicNote}<ul class="topics">${topicsHtml}</ul></section>
      <section aria-labelledby="revTitle" style="margin-top:20px">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:center">
          <h2 id="revTitle" style="margin:0">Revisión pregunta por pregunta</h2>
          <div class="filters" role="group" aria-label="Filtrar preguntas">
            <button class="btn small" type="button" data-act="filter" data-v="all" aria-pressed="${filter === 'all'}">Todas (${qs.length})</button>
            <button class="btn small" type="button" data-act="filter" data-v="bad" aria-pressed="${filter === 'bad'}">Solo las que fallé o dejé en blanco</button>
          </div>
        </div>
        ${shown.length ? shown.map(x => reviewItem(x.q, x.per, last)).join('') : '<div class="callout ok" style="margin-top:14px">¡No hay preguntas falladas! 🎉</div>'}
      </section>`);

    const H = UI.handlers;
    H.home = () => UI.go('home');
    H.again = () => UI.confirmStart(last.key);
    H.repeat = () => UI.confirmStart(last.key, last.seed);
    H.nextlevel = () => UI.confirmStart(next.key);
    H.filter = el => { filter = el.dataset.v; const y = window.scrollY; UI.views.results({ last }); window.scrollTo(0, y); };
    H.eval = el => {
      last.selfEval[el.dataset.i] = +el.dataset.v;
      O.Progress.saveLast(last);
      const y = window.scrollY;
      UI.views.results({ last });
      window.scrollTo(0, y);
      const b = UI.$(`[data-act="eval"][data-i="${el.dataset.i}"][data-v="${el.dataset.v}"]`);
      if (b) b.focus({ preventScroll: true });
    };
  };

})(typeof globalThis !== 'undefined' ? globalThis : window);
