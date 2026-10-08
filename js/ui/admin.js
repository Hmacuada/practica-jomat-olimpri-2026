/* Interfaz: administración (solo con contraseña de administrador).
   Es un candado dentro del navegador, sin servidor: ver js/admin.js para sus límites. */
(function (G) {
  'use strict';
  const O = G.OLI, UI = O.UI, esc = UI.esc;
  const SESSION_MS = 10 * 60 * 1000;

  UI.state.adminUntil = 0;
  UI.adminActive = () => Date.now() < (UI.state.adminUntil || 0);
  UI.adminTouch = () => { UI.state.adminUntil = Date.now() + SESSION_MS; };
  const leaveAdmin = () => { UI.state.adminUntil = 0; UI.go(O.Users.current() ? 'home' : 'welcome'); };

  const field = (id, label, auto) => `<label class="field" for="${id}" style="margin-top:10px">${label}<input id="${id}" type="password" autocomplete="${auto || 'off'}" maxlength="${O.Admin.MAX_LEN}"></label>`;

  /** Entrada a la administración: pide la contraseña (o la crea la primera vez). */
  UI.adminEntry = function () {
    if (document.body.classList.contains('in-exam')) return;
    if (UI.adminActive()) { UI.go('admin'); return; }
    if (O.Admin.isSet()) askPassword(); else createPassword();
  };

  function askPassword() {
    UI.modal({
      title: 'Acceso de administrador',
      html: `<p>Esta zona es solo para el administrador. Ingrese la contraseña.</p>${field('adPw', 'Contraseña', 'current-password')}<p class="form-error" id="adErr" role="alert"></p>`,
      actions: [{ label: 'Cancelar', cls: 'ghost' }, {
        label: 'Entrar', cls: 'primary', primary: true, keepOpen: true,
        onClick: api => {
          const inp = UI.$('#adPw'), err = UI.$('#adErr'), r = O.Admin.verify(inp.value);
          if (r.ok) { api.close(); UI.adminTouch(); UI.go('admin'); return; }
          err.textContent = r.error; inp.value = ''; inp.focus();
        }
      }],
      onOpen: () => setTimeout(() => { const i = UI.$('#adPw'); if (i) i.focus(); }, 0)
    });
  }

  function createPassword() {
    UI.modal({
      title: 'Crear contraseña de administrador',
      html: `<p>Todavía no hay contraseña de administrador en este navegador. Cree una para proteger las opciones de adultos (mínimo ${O.Admin.MIN_LEN} caracteres).</p>
        ${field('adNew', 'Contraseña nueva', 'new-password')}${field('adNew2', 'Repita la contraseña', 'new-password')}
        <p class="form-error" id="adErr" role="alert"></p>
        <p class="hint">Guárdela bien. Si se olvida, solo se puede recuperar borrando los datos del sitio en el navegador (eso también borra el avance guardado).</p>`,
      actions: [{ label: 'Cancelar', cls: 'ghost' }, {
        label: 'Crear contraseña', cls: 'primary', primary: true, keepOpen: true,
        onClick: api => {
          const a = UI.$('#adNew'), b = UI.$('#adNew2'), err = UI.$('#adErr');
          if (a.value !== b.value) { err.textContent = 'Las contraseñas no coinciden.'; b.value = ''; b.focus(); return; }
          const r = O.Admin.setPassword(a.value);
          if (!r.ok) { err.textContent = r.error; a.focus(); return; }
          api.close(); UI.adminTouch(); UI.go('admin');
        }
      }],
      onOpen: () => setTimeout(() => { const i = UI.$('#adNew'); if (i) i.focus(); }, 0)
    });
  }

  function changePassword() {
    UI.modal({
      title: 'Cambiar contraseña',
      html: `${field('adOld', 'Contraseña actual', 'current-password')}${field('adNew', 'Contraseña nueva', 'new-password')}${field('adNew2', 'Repita la contraseña nueva', 'new-password')}<p class="form-error" id="adErr" role="alert"></p>`,
      actions: [{ label: 'Cancelar', cls: 'ghost' }, {
        label: 'Guardar', cls: 'primary', primary: true, keepOpen: true,
        onClick: api => {
          const o = UI.$('#adOld'), a = UI.$('#adNew'), b = UI.$('#adNew2'), err = UI.$('#adErr');
          const v = O.Admin.verify(o.value);
          if (!v.ok) { err.textContent = v.error; o.value = ''; o.focus(); return; }
          if (a.value !== b.value) { err.textContent = 'Las contraseñas nuevas no coinciden.'; b.value = ''; b.focus(); return; }
          const r = O.Admin.setPassword(a.value);
          if (!r.ok) { err.textContent = r.error; a.focus(); return; }
          api.close(); UI.adminTouch(); UI.announce('La contraseña se cambió.');
        }
      }],
      onOpen: () => setTimeout(() => { const i = UI.$('#adOld'); if (i) i.focus(); }, 0)
    });
  }

  function confirmAction(title, html, label, cls, fn) {
    UI.modal({ title, html, actions: [{ label: 'Cancelar', cls: 'ghost', focus: true }, { label, cls: cls || 'primary', onClick: () => { if (!UI.adminActive()) { leaveAdmin(); return; } UI.adminTouch(); fn(); } }] });
  }

  UI.views.admin = function () {
    UI.adminTouch();
    const users = O.Users.list(), cur = O.Users.current();
    const rows = users.map(p => {
      const s = O.Users.summary(p.id);
      return `<tr><td data-label="Usuario"><span>${UI.avatarHtml(p.name)} <strong>${esc(p.name)}</strong>${cur && cur.id === p.id ? ' <span class="chip">actual</span>' : ''}</span></td>
        <td class="num" data-label="Niveles superados">${s.passed} de ${s.total}</td><td class="num" data-label="Intentos">${s.attempts}</td>
        <td data-label="Acciones"><div class="btn-row">
          <button class="btn small" type="button" data-act="ad-unlock" data-id="${esc(p.id)}" data-name="${esc(p.name)}">Desbloquear niveles</button>
          <button class="btn small" type="button" data-act="ad-reset" data-id="${esc(p.id)}" data-name="${esc(p.name)}">Borrar avance</button>
          <button class="btn small danger" type="button" data-act="ad-del" data-id="${esc(p.id)}" data-name="${esc(p.name)}">Eliminar usuario</button></div></td></tr>`;
    }).join('');
    UI.setMain(`
      <section class="card" aria-labelledby="adTitle">
        <h1 id="adTitle" style="font-size:1.6rem">Administración</h1>
        <p class="muted">Zona solo para el administrador. La sesión se cierra sola después de 10 minutos sin actividad.</p>
        <div class="btn-row"><button class="btn primary" type="button" data-act="ad-exit">Salir de administración</button></div>
      </section>
      <section class="card" aria-labelledby="adUsers" style="margin-top:20px"><h2 id="adUsers">Usuarios</h2>
        ${users.length ? `<div class="table-wrap"><table class="hist"><caption class="sr-only">Usuarios registrados en este navegador</caption>
          <thead><tr><th scope="col">Usuario</th><th scope="col">Niveles superados</th><th scope="col">Intentos</th><th scope="col">Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : '<p class="muted">Todavía no hay usuarios registrados en este navegador.</p>'}
      </section>
      <section class="card" aria-labelledby="adSec" style="margin-top:20px"><h2 id="adSec">Seguridad</h2>
        <p>La contraseña de administrador se guarda solo en este navegador (nunca en texto plano).</p>
        <p class="btn-row"><button class="btn" type="button" data-act="ad-pass">Cambiar contraseña</button></p>
      </section>`);

    const H = UI.handlers, again = () => UI.views.admin();
    H['ad-exit'] = () => leaveAdmin();
    H['ad-pass'] = () => changePassword();
    H['ad-unlock'] = el => confirmAction(`¿Desbloquear los niveles de ${el.dataset.name}?`, '<p>Se abrirán los 9 niveles, incluso los que no se han superado.</p>', 'Sí, desbloquear', 'primary', () => { O.Users.withUser(el.dataset.id, () => O.Progress.unlockAll()); again(); });
    H['ad-reset'] = el => confirmAction(`¿Borrar el avance de ${el.dataset.name}?`, '<p>Se borrarán el progreso, el historial, las marcas y cualquier prueba en curso. El usuario se conserva. No se puede deshacer.</p>', 'Sí, borrar avance', 'danger', () => { O.Users.withUser(el.dataset.id, () => O.Progress.resetAll()); again(); });
    H['ad-del'] = el => confirmAction(`¿Eliminar a ${el.dataset.name}?`, '<p>Se eliminará el usuario y todo su avance. No se puede deshacer.</p>', 'Sí, eliminar usuario', 'danger', () => { O.Users.remove(el.dataset.id); UI.renderUser(); again(); });
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
