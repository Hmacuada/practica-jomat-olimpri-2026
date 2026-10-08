/* Pruebas de usuarios (perfiles locales), almacenamiento por usuario y contraseña de administrador:
   node tests/users.test.js */
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
['rng.js', 'util.js', 'engine.js', 'storage.js', 'admin.js'].forEach(f => require(path.join(root, 'js', f)));
const O = globalThis.OLI, U = O.Users, P = O.Progress, S = O.Store, A = O.Admin;

let errors = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { errors++; console.log('  ✗ ' + msg); } };
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg}: esperado ${JSON.stringify(b)}, obtenido ${JSON.stringify(a)}`);

console.log('SHA-256 propio contra el de Node:');
{
  const vectors = ['', 'abc', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(63), 'a'.repeat(64), 'a'.repeat(65), 'a'.repeat(1000), 'Contraseña ñandú 🎓', 'jomat2026'];
  for (let i = 0; i < 300; i++) vectors.push(crypto.randomBytes(1 + (i * 7) % 200).toString('latin1'));
  vectors.forEach(v => ok(O.sha256hex(v) === crypto.createHash('sha256').update(Buffer.from(new TextEncoder().encode(v))).digest('hex'), `sha256 distinto para "${v.slice(0, 20)}" (${v.length})`));
  eq(O.sha256hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'vector oficial de "abc"');
  console.log(`  ${vectors.length} entradas comparadas.`);
}

console.log('Validación de nombres:');
{
  eq(U.validate('tiziano'), { ok: true, name: 'Tiziano', id: 'tiziano' }, 'minúscula → Capitalizado');
  eq(U.validate('  TIZIANO  ').name, 'TIZIANO', 'conserva mayúsculas escritas');
  eq(U.validate('ana maría').name, 'Ana María', 'dos palabras con tilde');
  eq(U.validate('María José').id, 'maria-jose', 'id sin tilde ni espacios');
  eq(U.validate('Maria  Jose').id, 'maria-jose', 'espacios dobles normalizados');
  eq(U.validate('Ñandú').id, 'nandu', 'ñ → n');
  ok(!U.validate('').ok && !U.validate('   ').ok && !U.validate(null).ok, 'vacío rechazado');
  ok(!U.validate('A').ok, 'un solo carácter rechazado');
  ok(!U.validate('x'.repeat(25)).ok, 'más de 24 caracteres rechazado');
  ok(!U.validate('Tiz1ano').ok && !U.validate('Tiziano!').ok && !U.validate('<b>Hola</b>').ok && !U.validate('12').ok, 'números y símbolos rechazados');
  ok(U.validate("D'Angelo").ok && U.validate('Ana-Sofía').ok, 'apóstrofo y guion permitidos');
  ok(!U.validate('-Ana').ok, 'no puede empezar con guion');
}

console.log('Registro, entrada y aislamiento entre usuarios:');
{
  eq(U.init(), null, 'sin usuario al comenzar');
  // datos antiguos (antes de existir usuarios) deben pasar al primer usuario
  S.use(null); S.set('best', { C1: { pct: 80, pass: true } }); S.set('history', [{ id: 'x' }]);
  const r1 = U.register('tiziano');
  ok(r1.ok && r1.isNew && r1.profile.name === 'Tiziano', 'registro nuevo');
  eq(P.best().C1.pct, 80, 'los datos antiguos pasaron al primer usuario');
  eq(S.get('best', 'legacy-gone'), { C1: { pct: 80, pass: true } }, 'el primer usuario los ve');
  S.use(null); eq(S.get('best', 'vacío'), 'vacío', 'ya no quedan datos sin usuario'); S.use('tiziano');
  eq(U.current().id, 'tiziano', 'usuario actual');

  P.record('C2', { pct: 90, pass: true, points: 27, total: 30 });
  const r2 = U.register('Camila');
  ok(r2.ok && r2.isNew, 'segundo usuario');
  eq(P.best(), {}, 'el segundo usuario empieza sin avance');
  eq(P.history(), [], 'ni historial');
  P.record('C1', { pct: 50, pass: false, points: 15, total: 30 });
  U.enter('tiziano');
  eq(Object.keys(P.best()).sort(), ['C1', 'C2'], 'Tiziano conserva solo lo suyo');
  eq(P.best().C1.pct, 80, 'el avance de Tiziano no se mezcla con el de Camila');
  eq(U.summary('camila'), { passed: 0, total: 9, attempts: 0 }, 'resumen de otro usuario sin cambiar de usuario');
  eq(U.summary('tiziano').passed, 2, 'resumen de Tiziano');
  eq(S.profile(), 'tiziano', 'sigue siendo Tiziano');

  const again = U.register('  tiziano ');
  ok(again.ok && !again.isNew && again.profile.id === 'tiziano', 'el mismo nombre entra al usuario existente');
  eq(U.list().length, 2, 'no se duplican usuarios');
  ok(!U.register('x1').ok, 'registro con nombre inválido falla');

  // persistir sesión: init recupera al usuario actual
  S.use(null);
  const i = U.init();
  ok(i && i.profile.id === 'tiziano', 'init recupera al usuario actual');
  eq(P.best().C2.pct, 90, 'init activa el espacio del usuario');

  // visitas: nueva sesión tras 30 min
  const list = U.list(), me = list.find(p => p.id === 'tiziano'); me.last = Date.now() - 31 * 60 * 1000; S.set('profiles', list);
  const v0 = me.visits; const j = U.init();
  eq(j.profile.visits, v0 + 1, 'una visita nueva suma una sesión');
  ok(j.newVisit === true, 'init marca la visita nueva');
  const k = U.init();
  eq(k.profile.visits, v0 + 1, 'recargar enseguida no suma visitas');
  ok(k.newVisit === false, 'recargar enseguida no es visita nueva');

  // acciones de administración sobre otro usuario
  U.enter('tiziano');
  U.withUser('camila', () => P.unlockAll());
  eq(S.profile(), 'tiziano', 'withUser restaura el usuario');
  eq(U.summary('camila').passed, 9, 'desbloquear niveles de otro usuario');
  eq(U.summary('tiziano').passed, 2, 'sin afectar al actual');
  U.withUser('camila', () => P.resetAll());
  eq(U.summary('camila'), { passed: 0, total: 9, attempts: 0 }, 'borrar avance de otro usuario');
  try { U.withUser('camila', () => { throw new Error('boom'); }); } catch (e) { /* esperado */ }
  eq(S.profile(), 'tiziano', 'withUser restaura aunque falle');

  U.remove('camila');
  eq(U.list().map(p => p.id), ['tiziano'], 'eliminar usuario');
  eq(S.getFor('camila', 'best', 'nada'), 'nada', 'se borraron sus datos');
  eq(U.current().id, 'tiziano', 'eliminar a otro no cierra la sesión');
  U.logout();
  eq(U.current(), null, 'cerrar sesión');
  eq(S.profile(), null, 'sin espacio activo');
  U.enter('tiziano'); U.remove('tiziano');
  eq(U.current(), null, 'eliminar al usuario actual cierra la sesión');
  eq(U.list(), [], 'sin usuarios');
}

console.log('Contraseña de administrador:');
{
  ok(!A.isSet(), 'al inicio no hay contraseña');
  ok(!A.verify('cualquiera').ok, 'verificar sin contraseña definida falla');
  ok(A.setPassword('corta').ok === false && A.setPassword('x'.repeat(65)).ok === false && A.setPassword(' conespacio').ok === false, 'contraseñas inválidas rechazadas');
  ok(A.setPassword('Sol-y-Luna-2026').ok, 'crear contraseña válida');
  ok(A.isSet(), 'queda definida');
  const saved = JSON.stringify(S.get('admin', null));
  ok(!saved.includes('Sol-y-Luna-2026') && !saved.toLowerCase().includes('sol-y-luna'), 'la contraseña NO se guarda en texto plano');
  const rec = S.get('admin', null);
  ok(/^[0-9a-f]{64}$/.test(rec.hash) && /^[0-9a-f]{32}$/.test(rec.salt) && rec.rounds >= 10000, 'se guarda hash, sal y rondas');
  ok(A.verify('Sol-y-Luna-2026').ok, 'contraseña correcta aceptada');
  ok(!A.verify('sol-y-luna-2026').ok && !A.verify('').ok && !A.verify(null).ok && !A.verify('Sol-y-Luna-2026 ').ok, 'incorrectas rechazadas (mayúsculas, vacía, espacio)');
  A.setPassword('Sol-y-Luna-2026');
  ok(S.get('admin', null).salt !== rec.salt, 'cada vez se usa una sal distinta');

  // bloqueo por intentos fallidos
  const t0 = 1000000;
  S.set('adminfail', { n: 0, until: 0 });
  let r; for (let i = 1; i <= 4; i++) { r = A.verify('mala', t0); ok(!r.ok && !r.locked, `fallo ${i} sin bloqueo`); }
  r = A.verify('mala', t0);
  ok(!r.ok && r.wait === 60, 'al 5.º fallo seguido hay que esperar 60 s');
  r = A.verify('Sol-y-Luna-2026', t0 + 1000);
  ok(!r.ok && r.locked && r.wait === 59, 'bloqueado: ni la contraseña correcta funciona durante la espera');
  r = A.verify('Sol-y-Luna-2026', t0 + 61000);
  ok(r.ok, 'pasada la espera, la correcta entra');
  eq(S.get('adminfail', null), { n: 0, until: 0 }, 'un acierto reinicia el contador');
  const T = t0 + 200000;
  for (let i = 0; i < 5; i++) A.verify('mala', T);
  ok(A.waitSeconds(T) === 60, 'de nuevo: 5 fallos → 60 s');
  A.verify('mala', T + 10000);
  ok(A.waitSeconds(T + 10000) === 50, 'mientras espera, los intentos no cuentan ni extienden la espera');
  A.verify('mala', T + 61000);
  ok(A.waitSeconds(T + 61000) === 120, 'cumplida la espera, otro fallo la duplica (120 s)');
  let t = T + 61000;
  for (let i = 0; i < 12; i++) { t += (A.waitSeconds(t) + 1) * 1000; A.verify('mala', t); }
  ok(A.waitSeconds(t) === 900, 'la espera tiene tope de 15 minutos');

  // el bloqueo y la contraseña son compartidos por todos los usuarios
  U.register('Tiziano'); S.use('tiziano');
  ok(A.isSet(), 'la contraseña de administrador no pertenece a un usuario');
  U.remove('tiziano');
  ok(A.isSet(), 'borrar usuarios no borra la contraseña');
}

console.log(`\n${checks} comprobaciones.`);
if (errors) { console.log(`✗ ${errors} problema(s).`); process.exit(1); }
console.log('✓ Todo en orden.');
