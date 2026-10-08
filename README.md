# Práctica JOMAT OLIMPRI 2026 · 6° básico

Web de práctica de matemática para las olimpiadas **JOMAT OLIMPRI 2026**, categoría **6° básico**. Hecha para que un niño de 11 años practique en el computador, con el mismo formato de la prueba real y preguntas que **cambian en cada intento**.

> Proyecto personal y no oficial. No está afiliado a la organización de las olimpiadas.

Todo funciona en el navegador: HTML + CSS + JavaScript puro, sin frameworks, sin build, sin servidor y sin llamadas a internet. Los datos (avance, historial) se guardan solo en el navegador.

## Cómo abrirla

**En línea (sin instalar nada):** https://hmacuada.github.io/practica-jomat-olimpri-2026/

**Opción 1 (sin conexión):** haz doble clic en `index.html`.

**Opción 2 (servidor local, opcional):**

```bash
node tools/serve.js        # abre http://localhost:8080
```

## Qué incluye

| Etapa | Preguntas | Tiempo |
|---|---|---|
| Clasificatoria | 30 (15 de alternativas + 15 de respuesta abierta) | 90 min |
| Semifinal | 20 (10 alternativas + 5 abiertas + 5 problemas de desarrollo) | 90 min |
| Gran Final | 15 (5 alternativas + 5 abiertas + 5 problemas de desarrollo) | 90 min |

- **Progresión:** se empieza en Clasificatoria · Fácil. Con **70 % o más** se abre el siguiente nivel. Cada etapa tiene 3 dificultades (Fácil, Medio, Olímpico), así que hay 9 niveles que se abren en orden. El porcentaje se cambia en `js/engine.js` (`O.PASS`).
- **Prueba:** reloj de 90 minutos siempre visible (amarillo con 10 min, rojo con 5), calculado con la hora de término, así que sigue correcto si se cambia de pestaña. Al llegar a 0 se entrega sola. Navegador de preguntas (respondida / marcada / sin responder) y confirmación de entrega dentro de la página. Si se recarga, se retoma con las mismas preguntas y el tiempo que quedaba.
- **Práctica libre:** por tema y dificultad, sin reloj y con corrección inmediata.
- **Práctica contra reloj:** se elige tema (o todos mezclados), dificultad y duración (3, 5, 10, 15 o 20 minutos) y se responde la mayor cantidad de preguntas posible. Cada respuesta se corrige al instante (si es correcta, avanza sola; si no, muestra la respuesta correcta). Atajos de teclado: `A`–`D` o `1`–`4` para las alternativas y `Enter` para continuar. Se puede saltar una pregunta. Al terminar se muestran respuestas correctas, precisión, tiempo promedio por pregunta, mejor racha, resultado por tema y una revisión de lo fallado; se guarda la **mejor marca** por configuración. Si se recarga la página, la sesión se retoma con el tiempo que quedaba.
- **Resultados:** puntaje, desglose por tema (mejor y peor), revisión pregunta por pregunta con el procedimiento, historial de intentos y "Hacer otro simulacro" (preguntas nuevas) o "Repetir este mismo simulacro" (misma semilla).
- **Problemas de desarrollo:** no se corrigen solos. El niño escribe su procedimiento, ve la solución paso a paso y se autoevalúa (*Lo logré* = 1 punto, *Casi* = 0,5, *No lo logré* = 0). Conviene que un adulto los revise con él.
- **Respuestas abiertas:** aceptan coma o punto decimal, espacios, `1.500` como 1500, fracciones `a/b` y números mixtos (`2 1/3`).

## Usuarios y administración

- **Ingreso por nombre:** la primera vez aparece una portada ilustrada donde el niño escribe su nombre. A partir de ahí la página lo saluda («¡Bienvenido, Tiziano!», «¡Hola de nuevo!…») y guarda su avance, historial y marcas **por usuario**. En un mismo computador pueden practicar varias personas: «Cambiar usuario» muestra la lista. No hay contraseña de usuario, y todo se guarda solo en el navegador.
- **Opciones de administrador (ocultas):** desbloquear niveles, borrar avance y eliminar usuarios **no aparecen en ninguna parte de la interfaz**. El administrador entra tocando el logo (π) 7 veces seguidas en 4 segundos, o abriendo la dirección con `#admin` al final. La primera vez crea una contraseña (mínimo 6 caracteres); después se la piden en cada acceso. La sesión de administrador se cierra sola a los 10 minutos sin actividad, y tras 5 contraseñas incorrectas seguidas hay que esperar (la espera crece hasta 15 minutos). Dentro hay una lista de usuarios con las acciones por usuario y el cambio de contraseña.
- **Límites (importante):** al no haber servidor, esto es un candado dentro del navegador. La contraseña se guarda solo como hash SHA-256 repetido con sal (nunca en texto plano ni en el código), así que protege de cambios por accidente o curiosidad, pero **no es seguridad real**: quien sepa programar puede saltárselo desde la consola del navegador. Si se olvida la contraseña, solo se recupera borrando los datos del sitio (lo que también borra el avance). Cada navegador/dispositivo tiene sus propios usuarios y su propia contraseña.

## Los 11 temas (68 generadores)

Números grandes y operaciones combinadas · Múltiplos, divisores, MCM y MCD · Fracciones · Decimales y porcentajes · Razones y proporciones · Patrones y ecuaciones · Perímetro, área y volumen · Ángulos, triángulos y cuadriláteros · Plano cartesiano y transformaciones · Datos, promedio y probabilidad · Lógica y razonamiento.

No hay banco fijo de preguntas: cada generador crea números, nombres y contextos al azar y **calcula la respuesta con código**. Las alternativas incorrectas son errores típicos (por ejemplo, olvidar la prioridad de operaciones o sumar numeradores y denominadores). Las figuras (áreas, ángulos, plano cartesiano, relojes, gráficos de barras…) se dibujan con SVG generado por código.

## Estructura

```
index.html
css/styles.css
js/rng.js            azar con semilla (mulberry32): misma semilla = mismo simulacro
js/util.js           matemática básica, formato es-CL, fracciones, dibujo SVG
js/engine.js         motor: arma preguntas, planifica simulacros, corrige, niveles
js/gen/*.js          generadores de preguntas, un archivo por tema
js/storage.js        localStorage con try/catch y respaldo en memoria; usuarios (perfiles) y avance por usuario
js/admin.js          contraseña de administrador (SHA-256 propio con sal, bloqueo por intentos)
js/ui/*.js           interfaz: bienvenida, inicio, prueba, resultados, práctica, contra reloj, administración
js/main.js           arranque (retoma la prueba en curso)
tests/               pruebas en Node
tools/serve.js       servidor estático opcional
```

## Cómo agregar un generador nuevo

1. Elige el archivo del tema en `js/gen/` (por ejemplo `fra.js`) o crea uno y agrégalo con otra etiqueta `<script>` en `index.html` (y se carga solo en las pruebas).
2. Registra el generador:

```js
O.reg({
  id: 'fra.mi_generador',     // único: tema.nombre
  topic: 'fra',               // id del tema (ver O.TOPICS en js/util.js)
  name: 'Mi generador',
  dev: false,                 // true si sirve como problema de desarrollo (varios pasos)
  mcOnly: false,              // true si la respuesta es un texto (solo alternativas)
  gen(r, d) {                 // r = azar con semilla, d = dificultad 1, 2 o 3
    const a = r.int(2, 9), b = r.int(2, 9);
    return {
      text: `¿Cuánto es ${a} × ${b}?`,
      answer: a * b,                        // número, fracción U.frac(n, d) o texto
      wrong: [a + b, a * b + a, a * b - b], // errores típicos; el motor descarta repetidos
      steps: [`${a} × ${b} = ${a * b}.`],  // solución paso a paso
      unit: '',                             // opcional: 'cm', '$', '°', '%'…
      svg: ''                               // opcional: figura con U.svg(...)
    };
  }
});
```

Reglas útiles: redacta el enunciado en registro formal, como pregunta (`¿Cuál es…?`) o con el imperativo formal (`Exprese…`); usa **solo `r`** para el azar (nunca `Math.random`), llama a `U.fail()` si los números salieron mal (se reintenta solo), escribe fracciones en el texto como `U.fr(3, 4)` y números con `U.num(x)` (formato chileno).

3. Corre `node tests/generators.test.js` para comprobar el generador nuevo.

## Pruebas

```bash
node tests/generators.test.js        # 500 preguntas por generador, dificultad y formato
node tests/generators.test.js 2000   # más exhaustivo
node tests/users.test.js             # usuarios, avance por usuario y contraseña de administrador
npm test                             # ambas
```

Para cada generador comprueba que la correcta esté entre las alternativas, que haya exactamente una, que no haya alternativas duplicadas, que no aparezcan resultados negativos, fraccionarios o absurdos cuando no corresponde, que no haya textos con `undefined` o `NaN`, que la misma semilla dé la misma pregunta y que casi nunca haga falta reintentar. También revisa el **lenguaje** de cada enunciado: que sea formal (sin imperativos como «Calcula» ni primera persona) y sin errores conocidos de concordancia de género y número. Además arma 360 simulacros completos, verifica los planes de la práctica contra reloj (sin repetir el mismo generador seguidamente, sin problemas de desarrollo, reproducibles), prueba la corrección de puntajes y el lector de respuestas abiertas, y **recalcula de forma independiente** más de 13.000 respuestas a partir del enunciado.

Las pruebas de usuarios comprueban, entre otras cosas, que el SHA-256 propio coincide con el de Node en 310 entradas, que el avance de un usuario no se mezcla con el de otro, que los datos anteriores a los usuarios pasan al primer usuario, que la contraseña no se guarda en texto plano y que el bloqueo por intentos funciona.

## Licencia

MIT. Úsala, cámbiala y compártela libremente.
