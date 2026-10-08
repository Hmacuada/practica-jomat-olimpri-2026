/* Interfaz: pantalla de inicio (mapa de progreso, historial, opciones para adultos). */
(function (G) {
  'use strict';
  const O = G.OLI, UI = O.UI, esc = UI.esc;

  const LOCK = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3H9z"/></svg>';
  const CHECK = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.2 16.6 4.9 12.3l-1.4 1.4 5.7 5.7L21 7.6l-1.4-1.4z"/></svg>';
  const PLAY = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';

  function levelButton(lv, idx, best) {
    const b = best[lv.key], unlocked = O.isUnlocked(idx, best), passed = b && b.pass;
    const name = O.DIFFS[lv.diff - 1];
    const bestTxt = b && b.total ? `Mejor: ${UI.pct(b.pct)}` : (passed ? 'Desbloqueado' : 'Sin intentos');
    if (!unlocked) {
      const need = O.LEVELS[idx - 1];
      return `<button class="lvl" type="button" disabled aria-label="${esc(lv.stage.name)}, ${name}: bloqueado. Supera ${esc(UI.levelName(need.key))} con ${O.PASS} % para abrirlo.">
        <span><strong>${name}</strong><small>Bloqueado</small></span>${LOCK}</button>`;
    }
    return `<button class="lvl ${passed ? 'done' : 'open'}" type="button" data-act="start" data-key="${lv.key}"
      aria-label="${esc(lv.stage.name)}, ${name}. ${esc(bestTxt)}. ${passed ? 'Superado.' : ''} Pulsa para empezar.">
      <span><strong>${name}</strong><small>${esc(bestTxt)}</small></span>${passed ? CHECK : PLAY}</button>`;
  }

  UI.views.home = function () {
    O.Progress.saveView('home');
    const best = O.Progress.best(), hist = O.Progress.history().slice(0, 10), last = O.Progress.last();
    const stagesHtml = O.STAGES.map((st, si) => `
      <li class="stage">
        <h3><span class="num" aria-hidden="true">${si + 1}</span>${esc(st.name)}</h3>
        <p class="meta">${O.totalQuestions(st)} preguntas · ${st.minutes} minutos<br>${st.mc} de alternativas${st.open ? ` · ${st.open} de respuesta abierta` : ''}${st.dev ? ` · ${st.dev} de desarrollo` : ''}</p>
        <ul class="levels">${O.LEVELS.filter(l => l.stageIdx === si).map(lv => `<li>${levelButton(lv, O.LEVELS.indexOf(lv), best)}</li>`).join('')}</ul>
      </li>`).join('');

    const histHtml = hist.length ? `<div class="table-wrap"><table class="hist"><caption class="sr-only">Últimos intentos</caption>
      <thead><tr><th scope="col">Fecha</th><th scope="col">Etapa</th><th scope="col">Dificultad</th><th scope="col">Puntaje</th><th scope="col">Código</th></tr></thead><tbody>
      ${hist.map(h => { const lv = O.levelByKey(h.key); return `<tr><td data-label="Fecha">${UI.fmtDate(h.ts)}</td><td data-label="Etapa">${esc(lv ? lv.stage.name : h.key)}</td><td data-label="Dificultad">${lv ? O.DIFFS[lv.diff - 1] : ''}</td>
        <td class="num" data-label="Puntaje"><span><strong>${h.points % 1 ? String(h.points).replace('.', ',') : h.points}/${h.total}</strong> · ${UI.pct(h.pct)} ${h.pass ? '<span class="chip ok">Superado</span>' : ''}</span></td><td class="num muted" data-label="Código">${esc(h.seed)}</td></tr>`; }).join('')}
      </tbody></table></div>` : '<p class="muted">Todavía no hay intentos. ¡Empieza por la Clasificatoria · Fácil!</p>';

    const me = O.Users.current(), greet = UI.state.greet;
    const hello = !me ? '¡Hola!' : greet === 'new' ? `¡Bienvenido, ${me.name}!` : greet === 'back' ? `¡Hola de nuevo, ${me.name}!` : `¡Hola, ${me.name}!`;
    UI.state.greet = 'hola';
    const passedCount = O.LEVELS.filter(l => best[l.key] && best[l.key].pass).length;
    UI.setMain(`
      <section class="hero">
        <h1>${esc(hello)}</h1>
        <p>¡Vamos a practicar para la olimpiada! Cada simulacro tiene preguntas nuevas, como en la prueba real. Para abrir el siguiente nivel necesitas al menos <strong>${O.PASS} %</strong> de puntaje.</p>
      </section>
      <section aria-labelledby="mapTitle">
        <h2 id="mapTitle">Tu camino a la Gran Final <span class="chip">${passedCount} de ${O.LEVELS.length} niveles superados</span></h2>
        <ol class="stages" style="list-style:none;padding:0">${stagesHtml}</ol>
        <div class="legend-line"><span>Los niveles se abren en orden. Cada simulacro dura 90 minutos y el tiempo corre aunque cambies de pestaña.</span></div>
      </section>
      <div class="two" style="margin-top:20px">
        <section class="card" aria-labelledby="histTitle"><h2 id="histTitle">Últimos intentos</h2>${histHtml}
          ${last ? '<p style="margin-top:12px"><button class="btn small" type="button" data-act="showlast">Ver resultados del último simulacro</button></p>' : ''}</section>
        <div>
        <section class="card" aria-labelledby="sprintTitle"><h2 id="sprintTitle">Práctica contra reloj</h2>
          <p>Elija un tema, una dificultad y una duración, y responda la mayor cantidad de preguntas antes de que termine el tiempo.</p>
          <p class="btn-row"><button class="btn primary" type="button" data-act="sprint">Ir a contra reloj</button></p>
        </section>
        <section class="card" aria-labelledby="pracTitle"><h2 id="pracTitle">Práctica libre por tema</h2>
          <p>Sin reloj y con corrección inmediata después de cada pregunta. Elige el tema y la dificultad que quieras repasar.</p>
          <p class="btn-row"><button class="btn primary" type="button" data-act="practice">Ir a práctica libre</button></p>
          <p class="hint">Los problemas de desarrollo no se corrigen solos: se comparan con la solución paso a paso. Es ideal que un adulto los revise junto al niño.</p>
        </section>
        </div>
      </div>`);

    UI.handlers.start = el => UI.confirmStart(el.dataset.key);
    UI.handlers.practice = () => UI.go('practice');
    UI.handlers.sprint = () => UI.go('sprint');
    UI.handlers.showlast = () => UI.go('results', { fromStorage: true });
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
