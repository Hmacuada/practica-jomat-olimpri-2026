/* Paletas de color (todas verdes). La paleta por defecto ("pasto") vive también en css/styles.css;
   las demás se aplican cambiando variables CSS en <html>. Cada paleta tiene versión clara y oscura.
   El test tests/theme.test.js comprueba los contrastes y que "pasto" coincida con el CSS. */
(function (G) {
  'use strict';
  const O = G.OLI;

  /* ---------- Utilidades de color ---------- */
  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  }

  /** Colores del paisaje de la portada derivados del tono (H) de la paleta. */
  function cover(H, dark, accentInk) {
    return dark
      ? { 'cv-s1': hsl(H, 45, 7), 'cv-s2': hsl(H, 35, 17), 'cv-far': hsl(H, 28, 19), 'cv-m1': hsl(H, 30, 25), 'cv-m1s': hsl(H, 30, 20),
          'cv-m2': hsl(H, 32, 34), 'cv-m2s': hsl(H, 32, 28), 'cv-m3': hsl(H, 36, 43), 'cv-m3s': hsl(H, 36, 36), 'cv-hill': hsl(H, 34, 22),
          'cv-mark': hsl(H, 40, 9), 'cv-flagink': accentInk }
      : { 'cv-s1': hsl(H, 45, 87), 'cv-s2': hsl(H, 60, 96), 'cv-far': hsl(H, 26, 84), 'cv-m1': hsl(H, 38, 66), 'cv-m1s': hsl(H, 38, 57),
          'cv-m2': hsl(H, 46, 42), 'cv-m2s': hsl(H, 46, 35), 'cv-m3': hsl(H, 56, 28), 'cv-m3s': hsl(H, 56, 22), 'cv-hill': hsl(H + 8, 52, 66),
          'cv-mark': '#fffdf3', 'cv-flagink': '#ffffff' };
  }

  /* ---------- Paletas ---------- */
  // Claves de interfaz → variable CSS: bg, surface, surface2, ink, muted, line, accent, accent-ink, accent-text, accent-soft, ok, ok-soft
  const PALETTES = [
    {
      id: 'pasto', name: 'Pasto', hue: 122, swatch: '#27832a',
      light: { bg: '#f2f8ee', surface: '#fcfff9', surface2: '#e8f1e2', ink: '#1c2a1d', muted: '#4f6350', line: '#d2e2cb', accent: '#27832a', 'accent-ink': '#ffffff', 'accent-text': '#1f6f22', 'accent-soft': '#daf0d3', ok: '#0a7350', 'ok-soft': '#d5f0e4' },
      dark: { bg: '#0f1a10', surface: '#162617', surface2: '#1e3220', ink: '#e8f3e8', muted: '#a9c2a9', line: '#2e472f', accent: '#6fd36a', 'accent-ink': '#0a2410', 'accent-text': '#6fd36a', 'accent-soft': '#1d3b1f', ok: '#5fd8b0', 'ok-soft': '#123a2d' }
    },
    {
      id: 'bosque', name: 'Bosque', hue: 156, swatch: '#0d7048',
      light: { bg: '#f1f7f0', surface: '#fbfefa', surface2: '#e6f0e4', ink: '#1b2a21', muted: '#4d6156', line: '#cfe0cc', accent: '#0d7048', 'accent-ink': '#ffffff', 'accent-text': '#0d7048', 'accent-soft': '#d6eee0', ok: '#2c7a14', 'ok-soft': '#e1f4d4' },
      dark: { bg: '#0e1913', surface: '#15241b', surface2: '#1c3025', ink: '#e7f2ea', muted: '#a8c1b2', line: '#2c4538', accent: '#4fd08e', 'accent-ink': '#062117', 'accent-text': '#4fd08e', 'accent-soft': '#1b3a2b', ok: '#a6e36f', 'ok-soft': '#1f3416' }
    },
    {
      id: 'menta', name: 'Menta', hue: 168, swatch: '#5fd3b0',
      light: { bg: '#eefaf6', surface: '#fafffd', surface2: '#dff3ec', ink: '#14302a', muted: '#44645c', line: '#c6e6dc', accent: '#5fd3b0', 'accent-ink': '#06302a', 'accent-text': '#0b6b58', 'accent-soft': '#cdf3e8', ok: '#2a7517', 'ok-soft': '#e2f4d6' },
      dark: { bg: '#0b1a17', surface: '#112620', surface2: '#19362e', ink: '#e4f6f0', muted: '#a5c7bc', line: '#25463b', accent: '#5fd3b0', 'accent-ink': '#06302a', 'accent-text': '#5fd3b0', 'accent-soft': '#17392f', ok: '#a6e36f', 'ok-soft': '#1f3416' }
    },
    {
      id: 'lima', name: 'Lima', hue: 85, swatch: '#9ad94a',
      light: { bg: '#f6faea', surface: '#fdfff6', surface2: '#ecf3d8', ink: '#222e10', muted: '#55633a', line: '#d9e4b8', accent: '#9ad94a', 'accent-ink': '#1b2d08', 'accent-text': '#456f09', 'accent-soft': '#e6f5c8', ok: '#0b7350', 'ok-soft': '#d6f0e5' },
      dark: { bg: '#121a09', surface: '#1a2610', surface2: '#243318', ink: '#eef5dc', muted: '#bccaa0', line: '#38491f', accent: '#b6ef5e', 'accent-ink': '#1a2a05', 'accent-text': '#b6ef5e', 'accent-soft': '#2a3d14', ok: '#5fd8b0', 'ok-soft': '#123a2d' }
    }
  ];
  PALETTES.forEach(p => {
    p.light = Object.assign({}, p.light, cover(p.hue, false, p.light['accent-ink']));
    p.dark = Object.assign({}, p.dark, cover(p.hue, true, p.dark['accent-ink']));
  });
  const DEFAULT = 'pasto';

  const isDark = () => { try { return G.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; } };

  O.Theme = {
    PALETTES, DEFAULT, hsl,
    byId: id => PALETTES.find(p => p.id === id) || PALETTES[0],
    /** Variables de una paleta para un esquema ('light' | 'dark'), con el prefijo "--". */
    vars(id, scheme) {
      const t = O.Theme.byId(id)[scheme === 'dark' ? 'dark' : 'light'], out = {};
      Object.keys(t).forEach(k => { out['--' + k] = t[k]; });
      return out;
    },
    current() { const id = O.Store ? O.Store.get('palette', DEFAULT) : DEFAULT; return O.Theme.byId(id).id; },
    /** Aplica la paleta guardada (o la indicada). La paleta por defecto usa el CSS tal cual. */
    apply(id) {
      const root = G.document && G.document.documentElement;
      if (!root) return;
      id = id || O.Theme.current();
      const names = Object.keys(O.Theme.vars(DEFAULT, 'light'));
      names.forEach(n => root.style.removeProperty(n));
      if (id !== DEFAULT) {
        const v = O.Theme.vars(id, isDark() ? 'dark' : 'light');
        Object.keys(v).forEach(n => root.style.setProperty(n, v[n]));
      }
      root.dataset.palette = id;
    },
    set(id) {
      id = O.Theme.byId(id).id;
      if (O.Store) O.Store.set('palette', id);
      O.Theme.apply(id);
      return id;
    }
  };

  if (G.document) {
    O.Theme.apply();
    try { G.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => O.Theme.apply()); } catch (e) { /* navegadores antiguos */ }
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
