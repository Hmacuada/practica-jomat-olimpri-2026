/* Interfaz: portada y registro/ingreso de usuario. El perfil se guarda solo en este navegador (sin contraseña). */
(function (G) {
  'use strict';
  const O = G.OLI, UI = O.UI, esc = UI.esc;

  const FACTS = [
    'El número π (3,14159…) tiene infinitos decimales y nunca se repiten siguiendo un patrón.',
    'Para sumar 1 + 2 + 3 + … + 100, empareja los extremos: 1 + 100, 2 + 99, 3 + 98… son 50 parejas que suman 101, o sea 5.050.',
    'El 2 es el único número primo que es par. Y el 1 no es primo ni compuesto.',
    'Un cuadrado mágico de 3 × 3 con los números del 1 al 9 siempre tiene el 5 en el centro.',
    'Si multiplicas cualquier número por 9, las cifras del resultado siempre suman un múltiplo de 9.',
    'Un cubo tiene 6 caras, 12 aristas y 8 vértices.',
    'Los babilonios contaban de 60 en 60, y de ahí vienen los 60 minutos de una hora.'
  ];

  /** Portada ilustrada: un camino que sube por tres montañas (Clasificatoria, Semifinal, Gran Final) hasta una bandera con π. */
  function coverSvg() {
    const syms = [
      ['×', 52, 150, 46, '0s'], ['÷', 240, 100, 44, '-2s'], ['+', 430, 95, 38, '-4s'], ['√', 290, 178, 40, '-1s'],
      ['%', 596, 128, 40, '-3s'], ['π', 590, 218, 58, '-5s'], ['∑', 42, 252, 36, '-2.5s'], ['²', 150, 150, 32, '-3.5s']
    ].map(([t, x, y, sz, dl], i) => `<text class="cv-sym${i === 5 ? ' cv-big' : ''}" x="${x}" y="${y}" font-size="${sz}" style="animation-delay:${dl};animation-duration:${6 + (i % 4)}s">${t}</text>`).join('');
    const stars = [[40, 30], [90, 55], [180, 28], [260, 52], [330, 24], [410, 48], [470, 26], [560, 40], [610, 70], [30, 110], [200, 80], [380, 90]]
      .map(([x, y], i) => `<circle class="cv-star" cx="${x}" cy="${y}" r="${i % 3 ? 1.6 : 2.2}"/>`).join('');
    return `<svg class="cover" viewBox="0 0 640 420" role="img" aria-label="Ilustración: un camino con tres paradas sube por las montañas hasta una bandera con la letra pi, rodeado de símbolos matemáticos que flotan">
      <defs>
        <linearGradient id="cvSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="cv-s1"/><stop offset="1" class="cv-s2"/></linearGradient>
        <radialGradient id="cvGlow"><stop offset="0" class="cv-g1"/><stop offset="1" class="cv-g2"/></radialGradient>
        <clipPath id="cvClip"><rect width="640" height="420" rx="28"/></clipPath>
      </defs>
      <g clip-path="url(#cvClip)">
        <rect width="640" height="420" fill="url(#cvSky)"/>
        ${stars}
        <circle cx="110" cy="95" r="92" fill="url(#cvGlow)"/>
        <circle class="cv-sun" cx="110" cy="95" r="40"/>
        <g class="cv-cloud"><ellipse cx="330" cy="62" rx="46" ry="13"/><ellipse cx="358" cy="52" rx="28" ry="12"/><ellipse cx="305" cy="54" rx="22" ry="10"/></g>
        <g class="cv-cloud cv-cloud2"><ellipse cx="560" cy="170" rx="38" ry="10"/><ellipse cx="582" cy="162" rx="22" ry="9"/></g>
        <path class="cv-far" d="M0 300 L70 235 L140 290 L215 215 L300 300 L380 240 L470 310 L560 230 L640 290 L640 420 L0 420Z"/>
        ${syms}
        <polygon class="cv-m1" points="0,420 150,250 300,420"/><polygon class="cv-m1s" points="150,250 300,420 205,420"/>
        <polygon class="cv-m2" points="190,420 340,175 500,420"/><polygon class="cv-m2s" points="340,175 500,420 405,420"/>
        <polygon class="cv-snow" points="340,175 321.6,205 331,198 340,210 350,198 359.6,205"/>
        <polygon class="cv-m3" points="360,420 520,92 680,420"/><polygon class="cv-m3s" points="520,92 680,420 585,420"/>
        <polygon class="cv-snow" points="520,92 497.6,138 509,128 520,142 531,128 542.4,138"/>
        <path class="cv-hill" d="M0 420 L0 366 C110 336 200 388 320 372 S520 346 640 376 L640 420Z"/>
        <path class="cv-trail" d="M30 396 C100 380 140 350 190 322 S300 270 352 238 S460 190 505 160 S516 122 520 102"/>
        <g class="cv-marks">
          <circle class="cv-mark" cx="190" cy="322" r="15"/><text class="cv-marknum" x="190" y="322">1</text>
          <circle class="cv-mark" cx="352" cy="238" r="15"/><text class="cv-marknum" x="352" y="238">2</text>
          <circle class="cv-mark" cx="505" cy="160" r="15"/><text class="cv-marknum" x="505" y="160">3</text>
        </g>
        <line class="cv-pole" x1="520" y1="94" x2="520" y2="46"/>
        <g class="cv-flag"><polygon class="cv-flagfill" points="520,46 568,59 520,74"/><text class="cv-flagpi" x="536" y="62">π</text></g>
      </g>
    </svg>`;
  }

  function profilesHtml(current) {
    const list = O.Users.list();
    if (!list.length) return '';
    return `<ul class="wl-profiles" aria-label="Usuarios de este computador">${list.map(p => {
      const s = O.Users.summary(p.id);
      return `<li><button class="wl-profile" type="button" data-act="wl-pick" data-id="${esc(p.id)}">
        ${UI.avatarHtml(p.name, 'lg')}
        <span class="wl-pname"><strong>${esc(p.name)}</strong><small>${s.passed} de ${s.total} niveles superados${current && current.id === p.id ? ' · usuario actual' : ''}</small></span>
      </button></li>`;
    }).join('')}</ul>`;
  }

  UI.views.welcome = function () {
    const current = O.Users.current(), list = O.Users.list(), hasProfiles = list.length > 0;
    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
    UI.setMain(`
      <div class="welcome">
        <div class="wl-left">
          <div class="wl-art">${coverSvg()}</div>
          <div class="wl-copy">
            <span class="chip">Olimpiadas de matemática · 6° básico</span>
            <h1 class="wl-title">JOMAT OLIMPRI <span>2026</span></h1>
            <p class="wl-sub">El camino a la Gran Final empieza aquí.</p>
            <ol class="wl-steps" aria-label="Las tres etapas">
              <li><b>1</b>Clasificatoria</li><li><b>2</b>Semifinal</li><li><b>3</b>Gran Final</li>
            </ol>
            <p class="wl-fact"><strong>¿Sabías que…?</strong> ${esc(fact)}</p>
          </div>
        </div>
        <div class="wl-right">
          <section class="card wl-card" aria-labelledby="wlTitle">
            ${hasProfiles ? `<h2 id="wlTitle">¿Quién va a practicar hoy?</h2>${profilesHtml(current)}
              <div class="wl-or"><span>¿No estás en la lista?</span></div>
              <label class="field" for="wlName">Soy nuevo, mi nombre es
                <input id="wlName" type="text" maxlength="24" autocomplete="given-name" autocapitalize="words" spellcheck="false" placeholder="Escribe tu nombre" data-enter="wl-enter"></label>`
        : `<h2 id="wlTitle">¡Bienvenido! ¿Cómo te llamas?</h2>
              <p class="muted">Escribe tu nombre para registrarte. La página te saludará y guardará tu avance.</p>
              <label class="field" for="wlName">Tu nombre
                <input id="wlName" type="text" maxlength="24" autocomplete="given-name" autocapitalize="words" spellcheck="false" placeholder="Por ejemplo: Tiziano" data-enter="wl-enter"></label>`}
            <p class="form-error" id="wlErr" role="alert"></p>
            <div class="btn-row"><button class="btn primary big" type="button" data-act="wl-enter">${hasProfiles ? 'Registrarme y entrar' : 'Entrar y empezar'}</button>
              ${current ? `<button class="btn ghost" type="button" data-act="wl-back">← Seguir como ${esc(current.name)}</button>` : ''}</div>
            <p class="hint">Tu nombre y tu avance se guardan solo en este navegador. No hace falta contraseña.</p>
          </section>
        </div>
      </div>`);

    const H = UI.handlers;
    H['wl-enter'] = () => {
      const inp = UI.$('#wlName'), err = UI.$('#wlErr');
      const r = O.Users.register(inp.value);
      if (!r.ok) { err.textContent = r.error; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
      UI.state.greet = r.isNew ? 'new' : 'back';
      UI.renderUser();
      UI.resume();
    };
    H['wl-pick'] = el => {
      const r = O.Users.enter(el.dataset.id);
      if (!r.ok) return;
      UI.state.greet = 'back';
      UI.renderUser();
      UI.resume();
    };
    H['wl-back'] = () => UI.resume();
    setTimeout(() => { const i = UI.$('#wlName'); if (i && !hasProfiles) i.focus({ preventScroll: true }); }, 0);
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
