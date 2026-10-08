/* Arranque: engancha la navegación y retoma una prueba en curso si la hay. */
(function (G) {
  'use strict';
  const O = G.OLI, UI = O.UI;

  function init() {
    UI.bindEvents();
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-nav]');
      if (!b) return;
      const where = b.dataset.nav;
      if (document.body.classList.contains('in-exam')) return;
      if (where === 'adult') UI.adultOptions(); else UI.go(where);
    });
    document.getElementById('brand').addEventListener('click', e => {
      e.preventDefault();
      if (!document.body.classList.contains('in-exam')) UI.go('home');
    });

    // Retomar prueba en curso (mismo set de preguntas y tiempo restante, calculado con la hora de término)
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
    if (O.Progress.view() === 'sprintresult' && O.Progress.lastSprint()) { UI.go('sprintresult', {}); return; }
    if (O.Progress.view() === 'results' && O.Progress.last()) { UI.go('results', { fromStorage: true }); return; }
    UI.go('home');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof globalThis !== 'undefined' ? globalThis : window);
