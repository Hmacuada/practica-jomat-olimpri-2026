/* Almacenamiento: localStorage con try/catch y respaldo en memoria si no está disponible
   (modo privado, datos del sitio bloqueados, etc.).
   Cada usuario (perfil) tiene su propio espacio: "jomat2026.u.<id>.<clave>". Solo la lista de perfiles
   y el perfil actual son compartidos. No hay servidor ni contraseñas: todo queda en este navegador. */
(function (G) {
  'use strict';
  const O = G.OLI;
  const PREFIX = 'jomat2026.';
  const GLOBAL_KEYS = { profiles: 1, current: 1, admin: 1, adminfail: 1, palette: 1 };
  const PROGRESS_KEYS = ['best', 'history', 'active', 'last', 'view', 'sprint', 'lastsprint', 'sprintbest'];
  const mem = {};
  let okCache = null, profileId = null;

  function usable() {
    if (okCache !== null) return okCache;
    try {
      const k = PREFIX + '__test';
      G.localStorage.setItem(k, '1');
      G.localStorage.removeItem(k);
      okCache = true;
    } catch (e) { okCache = false; }
    return okCache;
  }
  const scoped = (id, key) => PREFIX + (GLOBAL_KEYS[key] || !id ? '' : 'u.' + id + '.') + key;

  function rawGet(fk, def) {
    try {
      if (usable()) {
        const v = G.localStorage.getItem(fk);
        if (v !== null) return JSON.parse(v);
        return def;
      }
    } catch (e) { /* cae al respaldo */ }
    return fk in mem ? JSON.parse(mem[fk]) : def;
  }
  function rawSet(fk, val) {
    const j = JSON.stringify(val);
    mem[fk] = j;
    try { if (usable()) G.localStorage.setItem(fk, j); } catch (e) { /* sin espacio o bloqueado */ }
  }
  function rawRemove(fk) {
    delete mem[fk];
    try { if (usable()) G.localStorage.removeItem(fk); } catch (e) { /* nada */ }
  }

  const Store = O.Store = {
    persistent: () => usable(),
    /** Define de qué usuario son las claves de avance (null = ninguno). */
    use(id) { profileId = id || null; },
    profile: () => profileId,
    get: (key, def) => rawGet(scoped(profileId, key), def),
    set: (key, val) => rawSet(scoped(profileId, key), val),
    remove: key => rawRemove(scoped(profileId, key)),
    /** Lee una clave de otro usuario sin cambiar de usuario (para mostrar su resumen). */
    getFor: (id, key, def) => rawGet(scoped(id, key), def),
    removeFor: (id, key) => rawRemove(scoped(id, key)),
    /** Traspasa datos guardados antes de que existieran los usuarios (claves sin usuario) al usuario dado. */
    adoptLegacy(id) {
      PROGRESS_KEYS.forEach(k => {
        const legacy = scoped(null, k), v = rawGet(legacy, undefined);
        if (v !== undefined) { rawSet(scoped(id, k), v); rawRemove(legacy); }
      });
    }
  };

  /* ---------- Usuarios (perfiles locales) ---------- */
  const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const SESSION_GAP = 30 * 60 * 1000;

  O.Users = {
    /** Valida y normaliza un nombre: 2 a 24 letras (con tildes, espacios o guion); primera letra de cada palabra en mayúscula. */
    validate(raw) {
      const name = String(raw == null ? '' : raw).trim().replace(/\s+/g, ' ');
      if (name.length < 2 || name.length > 24) return { ok: false, error: 'Escribe tu nombre (entre 2 y 24 letras).' };
      if (!/^\p{L}[\p{L}\p{M}'’ -]*$/u.test(name)) return { ok: false, error: 'Usa solo letras, sin números ni símbolos.' };
      const pretty = name.split(' ').map(w => (w ? w[0].toLocaleUpperCase('es') + w.slice(1) : w)).join(' ');
      const id = slug(pretty);
      if (!id) return { ok: false, error: 'Escribe tu nombre usando letras.' };
      return { ok: true, name: pretty, id };
    },
    list: () => Store.get('profiles', []),
    current() {
      const id = Store.get('current', null);
      return id ? (O.Users.list().find(p => p.id === id) || null) : null;
    },
    /** Al abrir la página: activa el espacio del usuario actual. Devuelve {profile, returning} o null. */
    init() {
      const p = O.Users.current();
      Store.use(p ? p.id : null);
      if (!p) return null;
      const list = O.Users.list(), me = list.find(x => x.id === p.id);
      const back = !me.last || Date.now() - me.last > SESSION_GAP;
      if (back) { me.visits = (me.visits || 0) + 1; me.last = Date.now(); Store.set('profiles', list); }
      return { profile: me, returning: (me.visits || 1) > 1, newVisit: back };
    },
    /** Registra a un usuario nuevo o, si el nombre ya existe, entra con ese usuario. */
    register(raw) {
      const v = O.Users.validate(raw);
      if (!v.ok) return v;
      const list = O.Users.list();
      let p = list.find(x => x.id === v.id), isNew = false;
      if (!p) {
        p = { id: v.id, name: v.name, created: Date.now(), visits: 0 };
        list.push(p); isNew = true;
        Store.set('profiles', list);
        if (list.length === 1) Store.adoptLegacy(p.id);
      }
      return Object.assign({ ok: true, isNew }, O.Users.enter(p.id));
    },
    /** Entra con un usuario existente. */
    enter(id) {
      const list = O.Users.list(), p = list.find(x => x.id === id);
      if (!p) return { ok: false, error: 'No existe ese usuario.' };
      Store.use(p.id);
      Store.set('current', p.id);
      p.visits = (p.visits || 0) + 1; p.last = Date.now();
      Store.set('profiles', list);
      return { ok: true, profile: p, returning: p.visits > 1 };
    },
    /** Ejecuta fn con el espacio de otro usuario (para acciones de administración) y luego vuelve al anterior. */
    withUser(id, fn) {
      const prev = Store.profile();
      Store.use(id);
      try { return fn(); } finally { Store.use(prev); }
    },
    /** Cierra la sesión (el avance de cada usuario queda guardado). */
    logout() { Store.set('current', null); Store.use(null); },
    /** Elimina un usuario y todo su avance. */
    remove(id) {
      PROGRESS_KEYS.forEach(k => Store.removeFor(id, k));
      Store.set('profiles', O.Users.list().filter(p => p.id !== id));
      if (Store.get('current', null) === id) O.Users.logout();
    },
    /** Resumen de avance de un usuario (para la lista de bienvenida). */
    summary(id) {
      const best = Store.getFor(id, 'best', {});
      return { passed: O.LEVELS.filter(l => best[l.key] && best[l.key].pass).length, total: O.LEVELS.length, attempts: Store.getFor(id, 'history', []).length };
    }
  };

  /* ---------- Datos de la aplicación (del usuario actual) ---------- */
  O.Progress = {
    best: () => Store.get('best', {}),
    /** Registra el resultado de un nivel (conserva el mejor % y si alguna vez se superó el umbral). */
    record(key, g) {
      const best = Store.get('best', {}), old = best[key] || { pct: 0, pass: false };
      best[key] = { pct: Math.max(old.pct, g.pct), pass: old.pass || g.pass, points: g.points, total: g.total, ts: Date.now() };
      Store.set('best', best);
      return best;
    },
    unlockAll() {
      const best = Store.get('best', {});
      O.LEVELS.forEach(l => { if (!best[l.key]) best[l.key] = { pct: 0, pass: true, points: 0, total: 0, ts: Date.now(), manual: true }; else best[l.key].pass = true; });
      Store.set('best', best);
    },
    history: () => Store.get('history', []),
    upsertHistory(entry) {
      let h = Store.get('history', []);
      const i = h.findIndex(x => x.id === entry.id);
      if (i >= 0) h[i] = entry; else h.unshift(entry);
      h = h.slice(0, 30);
      Store.set('history', h);
    },
    active: () => Store.get('active', null),
    saveActive: x => Store.set('active', x),
    clearActive: () => Store.remove('active'),
    last: () => Store.get('last', null),
    saveLast: x => Store.set('last', x),
    view: () => Store.get('view', 'home'),
    saveView: v => Store.set('view', v),
    sprint: () => Store.get('sprint', null),
    saveSprint: x => Store.set('sprint', x),
    clearSprint: () => Store.remove('sprint'),
    lastSprint: () => Store.get('lastsprint', null),
    saveLastSprint: x => Store.set('lastsprint', x),
    sprintBest: () => Store.get('sprintbest', {}),
    /** Guarda el récord de una configuración (tema|dificultad|minutos). Devuelve si se superó el anterior. */
    recordSprint(key, sum) {
      const best = Store.get('sprintbest', {}), prev = best[key] || null;
      const isRecord = sum.correct > 0 && (!prev || sum.correct > prev.correct);
      if (isRecord) { best[key] = { correct: sum.correct, answered: sum.answered, pct: sum.pct, ts: Date.now() }; Store.set('sprintbest', best); }
      return { isRecord, prev };
    },
    resetAll() { PROGRESS_KEYS.forEach(k => Store.remove(k)); }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
