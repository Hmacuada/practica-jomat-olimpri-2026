/* Interfaz: utilidades comunes (render de texto con fracciones, modales, navegación entre vistas). */
(function (G) {
  'use strict';
  const O = G.OLI, U = O.U;
  const UI = O.UI = { views: {}, handlers: {}, state: {}, leave: null };

  UI.$ = (sel, el) => (el || document).querySelector(sel);
  UI.$$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  UI.esc = U.esc;

  const FRAC_RE = /\[\[(?:(\d+) )?(\d+|\?)\/(\d+|\?)\]\]/g;
  /** Texto de los generadores → HTML seguro (escapa, dibuja fracciones y saltos de línea). */
  UI.rich = t => U.esc(String(t)).replace(FRAC_RE, (m, w, n, d) =>
    (w ? `<span class="whole">${w}</span>` : '') +
    `<span class="frac" role="math" aria-label="${n} sobre ${d}"><span class="fn">${n}</span><span class="fd">${d}</span></span>`
  ).replace(/\n/g, '<br>');
  /** Igual que rich pero en texto plano (para etiquetas de accesibilidad). */
  UI.plain = t => String(t).replace(FRAC_RE, (m, w, n, d) => `${w ? w + ' ' : ''}${n}/${d}`);

  UI.fmtTime = secs => {
    secs = Math.max(0, secs);
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  };
  UI.fmtDate = ts => {
    try { return new Date(ts).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return new Date(ts).toISOString().slice(0, 16).replace('T', ' '); }
  };
  UI.pct = x => `${Math.round(x)} %`;
  UI.levelName = key => { const lv = O.levelByKey(key); return lv ? `${lv.stage.name} · ${O.DIFFS[lv.diff - 1]}` : key; };
  UI.announce = msg => { const el = UI.$('#live'); if (el) { el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 30); } };

  UI.main = () => document.getElementById('main');
  UI.setMain = html => { UI.main().innerHTML = html; };

  /** Despacho de eventos por delegación: data-act="nombre" (click) y data-in="nombre" (input/change). */
  function dispatch(kind) {
    return e => {
      const attr = kind === 'click' ? 'act' : 'in';
      const el = e.target.closest(`[data-${attr}]`);
      if (!el || !UI.main().contains(el)) return;
      const fn = UI.handlers[el.dataset[attr]];
      if (fn) fn(el, e);
    };
  }
  UI.bindEvents = () => {
    const m = UI.main();
    m.addEventListener('click', dispatch('click'));
    m.addEventListener('input', dispatch('in'));
    m.addEventListener('change', dispatch('in'));
    m.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.matches('[data-enter]')) { e.preventDefault(); const fn = UI.handlers[e.target.dataset.enter]; if (fn) fn(e.target, e); }
    });
  };

  /** Cambia de vista. Cada vista se define en UI.views[nombre](params). */
  UI.go = (name, params) => {
    // Sin usuario solo se puede ver la bienvenida; la administración exige sesión de administrador
    if (name === 'admin') { if (!UI.adminActive || !UI.adminActive()) name = O.Users.current() ? 'home' : 'welcome'; }
    else if (name !== 'welcome' && !O.Users.current()) name = 'welcome';
    if (UI.leave) { try { UI.leave(); } catch (e) { /* nada */ } UI.leave = null; }
    UI.handlers = {};
    document.body.classList.toggle('in-exam', name === 'exam' || name === 'sprintrun');
    document.body.classList.toggle('in-welcome', name === 'welcome');
    UI.renderUser();
    UI.$$('.navbtn').forEach(b => b.removeAttribute('aria-current'));
    const nb = UI.$(`.navbtn[data-nav="${name === 'results' ? 'home' : name.startsWith('sprint') ? 'sprint' : name}"]`);
    if (nb) nb.setAttribute('aria-current', 'page');
    UI.state.view = name;
    UI.views[name](params || {});
    window.scrollTo(0, 0);
    UI.main().focus({ preventScroll: true });
  };

  /* ---------- Modal accesible con atrapa-foco, sin alert/confirm ---------- */
  UI.modal = function (opts) {
    const root = UI.$('#modal-root'), prev = document.activeElement;
    root.innerHTML = `<div class="overlay"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
      <h2 id="mTitle">${U.esc(opts.title)}</h2><div class="mbody">${opts.html || ''}</div><div class="mact"></div></div></div>`;
    const modal = UI.$('.modal', root), act = UI.$('.mact', modal);
    function close() {
      document.removeEventListener('keydown', onKey, true);
      root.innerHTML = '';
      if (prev && prev.focus && document.contains(prev)) prev.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape' && opts.dismissable !== false) { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        const f = UI.$$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal).filter(x => !x.disabled);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    }
    const api = { close, el: modal };
    (opts.actions || [{ label: 'Cerrar' }]).forEach((a, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn ' + (a.cls || ''); b.textContent = a.label;
      if (a.primary) b.dataset.primary = '1';
      b.addEventListener('click', () => {
        if (a.keepOpen) { if (a.onClick) a.onClick(api); return; }
        close(); if (a.onClick) a.onClick(api);
      });
      act.appendChild(b);
      if (a.focus || (i === 0 && !(opts.actions || []).some(x => x.focus))) setTimeout(() => b.focus(), 0);
    });
    document.addEventListener('keydown', onKey, true);
    // Enter dentro de un campo del modal activa el botón principal
    modal.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') { const p = UI.$('[data-primary]', modal); if (p) { e.preventDefault(); p.click(); } }
    });
    if (opts.onOpen) opts.onOpen(modal, api);
    return api;
  };

  /* ---------- Usuario actual: iniciales y color del avatar ---------- */
  const AVATAR_COLORS = ['#0d7048', '#1f6f8b', '#6a4c93', '#a23b72', '#8a5a00', '#b4481a'];
  UI.initial = name => (String(name).trim()[0] || '?').toLocaleUpperCase('es');
  UI.avatarColor = name => { let h = 0; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AVATAR_COLORS[h % AVATAR_COLORS.length]; };
  UI.avatarHtml = (name, cls) => `<span class="avatar ${cls || ''}" style="background:${UI.avatarColor(name)}" aria-hidden="true">${U.esc(UI.initial(name))}</span>`;
  /** Muestra u oculta el nombre del usuario en el encabezado. */
  UI.renderUser = () => {
    const p = O.Users.current(), box = UI.$('#userbox');
    if (!box) return;
    box.hidden = !p;
    if (!p) return;
    const av = UI.$('#uAvatar');
    av.textContent = UI.initial(p.name); av.style.background = UI.avatarColor(p.name);
    UI.$('#uName').textContent = p.name;
    UI.renderSwatches();
    const n2 = UI.$('#uName2'); if (n2) n2.textContent = p.name;
  };

  /* ---------- Selector de color ---------- */
  /** Dibuja los botones de color en todos los contenedores [data-swatches] y marca el elegido. */
  UI.renderSwatches = () => {
    const cur = O.Theme.current();
    UI.$$('[data-swatches]').forEach(box => {
      box.innerHTML = O.Theme.PALETTES.map(p => `<button type="button" class="swatch" role="radio" aria-checked="${p.id === cur}" data-palette-id="${p.id}"
        aria-label="Verde ${U.esc(p.name)}" title="${U.esc(p.name)}" style="background:${p.swatch};color:${p.light['accent-ink']}"></button>`).join('');
    });
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-palette-id]');
    if (!b) return;
    const bi = UI.$$('[data-swatches]').indexOf(b.closest('[data-swatches]'));
    const id = O.Theme.set(b.dataset.paletteId);
    UI.renderSwatches();
    const box = UI.$$('[data-swatches]')[bi], f = box && box.querySelector(`[data-palette-id="${id}"]`);
    if (f) f.focus();
    UI.announce('Color ' + O.Theme.byId(id).name + ' elegido.');
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
