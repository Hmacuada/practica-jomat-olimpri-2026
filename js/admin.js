/* Administrador: contraseña local para proteger las opciones de adultos.
   IMPORTANTE: no hay servidor, así que esto es un candado dentro del navegador. Evita cambios por accidente
   o curiosidad, pero no es seguridad real: quien sepa programar puede saltárselo desde la consola.
   La contraseña nunca se guarda en texto plano: se guarda un hash SHA-256 repetido, con sal aleatoria. */
(function (G) {
  'use strict';
  const O = G.OLI, Store = O.Store;

  /* ---------- SHA-256 (implementación propia, sin dependencias; se prueba contra el módulo crypto de Node) ---------- */
  const primes = [];
  for (let n = 2; primes.length < 64; n++) if (primes.every(p => n % p)) primes.push(n);
  const frac = x => x - Math.floor(x);
  const K = primes.map(p => Math.floor(frac(Math.cbrt(p)) * 4294967296));
  const H0 = primes.slice(0, 8).map(p => Math.floor(frac(Math.sqrt(p)) * 4294967296));
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));

  function sha256(msg) {
    const H = H0.slice(), l = msg.length;
    const padLen = ((l + 9 + 63) >> 6) << 6, buf = new Uint8Array(padLen);
    buf.set(msg); buf[l] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(padLen - 8, Math.floor(l / 0x20000000)); dv.setUint32(padLen - 4, (l << 3) >>> 0);
    const w = new Uint32Array(64);
    for (let off = 0; off < padLen; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25), ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22), maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    const out = new Uint8Array(32), odv = new DataView(out.buffer);
    H.forEach((v, i) => odv.setUint32(i * 4, v));
    return out;
  }
  const utf8 = s => new TextEncoder().encode(s);
  const toHex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  const concat = (...arrs) => { const out = new Uint8Array(arrs.reduce((n, a) => n + a.length, 0)); let o = 0; arrs.forEach(a => { out.set(a, o); o += a.length; }); return out; };

  /** SHA-256 de un texto, en hexadecimal. */
  O.sha256hex = text => toHex(sha256(utf8(text)));

  const ROUNDS = 30000;
  /** Hash lento: SHA-256 repetido con sal, para que adivinar la contraseña sea más costoso. */
  function slowHash(password, saltHex, rounds) {
    const salt = utf8(saltHex), pw = utf8(password);
    let h = sha256(concat(salt, utf8(':'), pw));
    for (let i = 0; i < rounds; i++) h = sha256(concat(h, salt, pw));
    return toHex(h);
  }
  function randomSalt() {
    const a = new Uint8Array(16);
    try { G.crypto.getRandomValues(a); } catch (e) { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); }
    return toHex(a);
  }
  const safeEqual = (x, y) => { if (x.length !== y.length) return false; let r = 0; for (let i = 0; i < x.length; i++) r |= x.charCodeAt(i) ^ y.charCodeAt(i); return r === 0; };

  const MIN_LEN = 6, MAX_LEN = 64, FREE_TRIES = 5;

  O.Admin = {
    MIN_LEN, MAX_LEN,
    isSet: () => !!Store.get('admin', null),
    check(pw) {
      if (typeof pw !== 'string' || pw.length < MIN_LEN) return `La contraseña debe tener al menos ${MIN_LEN} caracteres.`;
      if (pw.length > MAX_LEN) return `La contraseña puede tener como máximo ${MAX_LEN} caracteres.`;
      if (/^\s|\s$/.test(pw)) return 'La contraseña no puede empezar ni terminar con espacios.';
      return null;
    },
    /** Crea o cambia la contraseña. */
    setPassword(pw) {
      const err = O.Admin.check(pw);
      if (err) return { ok: false, error: err };
      const salt = randomSalt();
      Store.set('admin', { salt, rounds: ROUNDS, hash: slowHash(pw, salt, ROUNDS) });
      Store.set('adminfail', { n: 0, until: 0 });
      return { ok: true };
    },
    /** Segundos de espera restantes por demasiados intentos fallidos (0 si no hay bloqueo). */
    waitSeconds(now = Date.now()) {
      const f = Store.get('adminfail', { n: 0, until: 0 });
      return f.until > now ? Math.ceil((f.until - now) / 1000) : 0;
    },
    /** Comprueba la contraseña. Tras 5 fallos seguidos hay que esperar, y la espera crece con cada nuevo fallo. */
    verify(pw, now = Date.now()) {
      const rec = Store.get('admin', null);
      if (!rec) return { ok: false, error: 'Todavía no hay contraseña de administrador.' };
      const wait = O.Admin.waitSeconds(now);
      if (wait > 0) return { ok: false, locked: true, wait, error: `Demasiados intentos. Espere ${wait} segundos.` };
      const good = typeof pw === 'string' && safeEqual(slowHash(pw, rec.salt, rec.rounds), rec.hash);
      const f = Store.get('adminfail', { n: 0, until: 0 });
      if (good) { Store.set('adminfail', { n: 0, until: 0 }); return { ok: true }; }
      f.n = (f.n || 0) + 1;
      if (f.n >= FREE_TRIES) f.until = now + Math.min(15 * 60, 60 * Math.pow(2, f.n - FREE_TRIES)) * 1000;
      Store.set('adminfail', f);
      const left = Math.max(0, FREE_TRIES - f.n);
      return { ok: false, error: left > 0 ? `Contraseña incorrecta. Quedan ${left} intento${left === 1 ? '' : 's'} antes de una espera.` : 'Contraseña incorrecta. Debe esperar antes de volver a intentar.', wait: O.Admin.waitSeconds(now) };
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
