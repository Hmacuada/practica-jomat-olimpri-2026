/* Arranque: usuario actual, navegación y retomar una sesión en curso. */
(function (G) {
  'use strict';
  const O = G.OLI, UI = O.UI;

  /** Retoma lo que el usuario actual dejó a medias (prueba, contra reloj o resultados); si no, va al inicio. */
  UI.resume = function () {
    const active = O.Progress.active();
    if (active && O.levelByKey(active.key)) {
      if (Date.now() >= active.endAt) { UI.finishExam(true); return; }
      UI.go('exam');
      return;
    }
    const sp = O.Progress.sprint();
    if (sp && sp.cfg) {
      if (Date.now() >= sp.endAt) { UI.finishSprint(); return; }
      UI.go('sprintrun');
      return;
    }
    UI.go('home');
  };

  function init() {
    try { history.scrollRestoration = 'manual'; } catch (e) { /* nada */ }
    UI.bindEvents();
    const session = O.Users.init();   // activa el espacio del usuario guardado (si lo hay)
    UI.state.greet = !session ? null : !session.newVisit ? 'hola' : session.returning ? 'back' : 'new';

    document.addEventListener('click', e => {
      const b = e.target.closest('[data-nav]');
      if (!b) return;
      if (document.body.classList.contains('in-exam')) return;
      const where = b.dataset.nav;
      UI.go(where === 'switch' ? 'welcome' : where);
    });

    // El logo es también la entrada oculta de administración: 7 toques seguidos (en 4 segundos).
    let taps = [];
    document.getElementById('brand').addEventListener('click', e => {
      e.preventDefault();
      if (document.body.classList.contains('in-exam')) return;
      const now = Date.now();
      taps = taps.filter(t => now - t < 4000); taps.push(now);
      if (taps.length >= 7) { taps = []; UI.adminEntry(); return; }
      UI.go(O.Users.current() ? 'home' : 'welcome');
    });
    // Alternativa para el administrador: abrir la dirección con #admin
    const fromHash = () => {
      if (location.hash !== '#admin') return;
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* nada */ }
      UI.adminEntry();
    };
    window.addEventListener('hashchange', fromHash);

    if (!session) { UI.go('welcome'); fromHash(); return; }
    // Retomar: resultados abiertos, o lo que estaba en curso
    const hadResults = O.Progress.view() === 'results' && O.Progress.last() && !O.Progress.active() && !O.Progress.sprint();
    const hadSprintResults = O.Progress.view() === 'sprintresult' && O.Progress.lastSprint() && !O.Progress.active() && !O.Progress.sprint();
    if (hadResults) UI.go('results', { fromStorage: true });
    else if (hadSprintResults) UI.go('sprintresult', {});
    else UI.resume();
    fromHash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof globalThis !== 'undefined' ? globalThis : window);
