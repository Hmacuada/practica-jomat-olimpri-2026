/* Generador de números aleatorios con semilla (mulberry32 + hash xmur3).
   La misma semilla produce siempre la misma secuencia: sirve para retomar o repetir un simulacro. */
(function (G) {
  'use strict';
  const O = G.OLI = G.OLI || {};

  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  class RNG {
    constructor(seed) {
      this.seed = String(seed);
      this._f = mulberry32(xmur3(this.seed)());
    }
    next() { return this._f(); }
    /** Entero en [a, b] */
    int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); }
    /** Entero en [a, b] con paso s (a, a+s, a+2s, ...) */
    step(a, b, s) { return a + s * this.int(0, Math.floor((b - a) / s)); }
    pick(arr) { return arr[this.int(0, arr.length - 1)]; }
    chance(p) { return this.next() < p; }
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = this.int(0, i);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    sample(arr, k) { return this.shuffle(arr).slice(0, k); }
  }

  O.RNG = RNG;
  /** Semilla corta y legible para un simulacro nuevo (ej: "K7F3A9"). */
  O.newSeed = function () {
    return (Math.random().toString(36) + '000000').slice(2, 8).toUpperCase();
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
