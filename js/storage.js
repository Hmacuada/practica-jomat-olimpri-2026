/* Almacenamiento: localStorage con try/catch y respaldo en memoria si no está disponible
   (modo privado, datos del sitio bloqueados, etc.). */
(function (G) {
  'use strict';
  const O = G.OLI;
  const PREFIX = 'jomat2026.';
  const mem = {};
  let okCache = null;

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

  const Store = O.Store = {
    persistent: () => usable(),
    get(key, def) {
      try {
        if (usable()) {
          const v = G.localStorage.getItem(PREFIX + key);
          if (v !== null) return JSON.parse(v);
          return def;
        }
      } catch (e) { /* cae al respaldo */ }
      return key in mem ? JSON.parse(mem[key]) : def;
    },
    set(key, val) {
      const j = JSON.stringify(val);
      mem[key] = j;
      try { if (usable()) G.localStorage.setItem(PREFIX + key, j); } catch (e) { /* sin espacio o bloqueado */ }
    },
    remove(key) {
      delete mem[key];
      try { if (usable()) G.localStorage.removeItem(PREFIX + key); } catch (e) { /* nada */ }
    }
  };

  /* ---------- Datos de la aplicación ---------- */
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
    resetAll() { ['best', 'history', 'active', 'last', 'view'].forEach(k => Store.remove(k)); }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
