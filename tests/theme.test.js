/* Pruebas de las paletas de color: node tests/theme.test.js
   - contraste WCAG de texto (>= 4,5:1) y de gráficos (>= 3:1) en las 4 paletas, modo claro y oscuro
   - la paleta por defecto ("pasto") coincide exactamente con css/styles.css
   - el verde de marca se distingue del verde de "correcto"
   - guardado y recuperación de la paleta */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
['rng.js', 'util.js', 'engine.js', 'storage.js', 'theme.js'].forEach(f => require(path.join(root, 'js', f)));
const O = globalThis.OLI, T = O.Theme;

let errors = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { errors++; console.log('  ✗ ' + m); } };

const lum = hex => { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const hue = hex => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return 0; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };

console.log('Contraste de las paletas:');
const TEXT = [['ink', 'bg'], ['ink', 'surface'], ['ink', 'surface2'], ['ink', 'accent-soft'], ['muted', 'bg'], ['muted', 'surface'], ['muted', 'surface2'], ['muted', 'accent-soft'],
  ['accent-text', 'bg'], ['accent-text', 'surface'], ['accent-text', 'surface2'], ['accent-text', 'accent-soft'], ['accent-ink', 'accent'], ['ok', 'ok-soft'], ['ok', 'surface'], ['ok', 'bg'], ['cv-flagink', 'accent-text']];
const GRAPHIC = [['accent-text', 'surface'], ['accent-text', 'surface2']];
T.PALETTES.forEach(p => {
  ['light', 'dark'].forEach(scheme => {
    const t = p[scheme];
    TEXT.forEach(([f, b]) => ok(ratio(t[f], t[b]) >= 4.5, `${p.id}/${scheme}: ${f} sobre ${b} = ${ratio(t[f], t[b]).toFixed(2)} (mín. 4,5)`));
    GRAPHIC.forEach(([f, b]) => ok(ratio(t[f], t[b]) >= 3, `${p.id}/${scheme}: gráficos ${f} sobre ${b} = ${ratio(t[f], t[b]).toFixed(2)} (mín. 3)`));
    ok(ratio(t['accent-text'], t['cv-mark']) >= 4.5, `${p.id}/${scheme}: número del mapa (accent-text sobre cv-mark) ${ratio(t['accent-text'], t['cv-mark']).toFixed(2)}`);
    const dh = Math.abs(hue(t.accent) - hue(t.ok)), diff = Math.min(dh, 360 - dh);
    ok(diff >= 25, `${p.id}/${scheme}: el verde de marca y el de "correcto" se parecen (${Math.round(diff)}°)`);
  });
  console.log(`  ${p.id.padEnd(7)} ${p.name.padEnd(8)} acento ${p.light.accent} / ${p.dark.accent}`);
});
ok(new Set(T.PALETTES.map(p => p.id)).size === T.PALETTES.length && new Set(T.PALETTES.map(p => p.light.accent)).size === T.PALETTES.length, 'las paletas son distintas entre sí');
ok(T.PALETTES.length >= 3, 'hay varias paletas para elegir');
ok(T.PALETTES.every(p => /^#[0-9a-f]{6}$/.test(p.swatch)), 'cada paleta tiene color de muestra');

console.log('Paleta por defecto = CSS:');
{
  const css = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');
  const darkRe = /@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\}\s*\}/g;
  const dark = {}, light = {};
  const decl = (txt, into) => { const re = /--([a-z0-9-]+):\s*([^;]+);/g; let m; while ((m = re.exec(txt))) into[m[1]] = m[2].trim().toLowerCase(); };
  let m; while ((m = darkRe.exec(css))) decl(m[1], dark);
  const lightCss = css.replace(darkRe, '');
  const rootRe = /:root \{([\s\S]*?)\}/g; while ((m = rootRe.exec(lightCss))) decl(m[1], light);
  const pasto = T.byId('pasto'); let n = 0;
  ['light', 'dark'].forEach(scheme => {
    const css_ = scheme === 'light' ? light : dark;
    Object.keys(pasto[scheme]).forEach(k => { n++; ok(css_[k] === pasto[scheme][k].toLowerCase(), `CSS (${scheme}) --${k}: "${css_[k]}" ≠ paleta "${pasto[scheme][k]}"`); });
  });
  ok(T.DEFAULT === 'pasto', 'la paleta por defecto es pasto');
  console.log(`  ${n} variables comparadas con styles.css.`);
}

console.log('Elegir y guardar:');
{
  ok(T.current() === 'pasto', 'sin elegir, la paleta es la de por defecto');
  ok(T.set('menta') === 'menta' && T.current() === 'menta', 'se guarda la paleta elegida');
  ok(T.set('no-existe') === 'pasto' && T.current() === 'pasto', 'una paleta desconocida vuelve a la de por defecto');
  O.Store.use('tiziano'); T.set('lima'); O.Store.use('camila');
  ok(T.current() === 'lima', 'la paleta es del dispositivo (no cambia al cambiar de usuario)');
  const v = T.vars('lima', 'light');
  ok(v['--accent'] === '#9ad94a' && v['--accent-text'] === '#456f09' && v['--cv-m3'], 'vars() entrega variables CSS con prefijo "--"');
  ok(T.hsl(122, 50, 50) === '#40bf46' || /^#[0-9a-f]{6}$/.test(T.hsl(122, 50, 50)), 'hsl() entrega un color hexadecimal');
}

console.log(`\n${checks} comprobaciones.`);
if (errors) { console.log(`✗ ${errors} problema(s).`); process.exit(1); }
console.log('✓ Todo en orden.');
