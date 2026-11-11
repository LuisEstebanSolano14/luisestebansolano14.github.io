# SQL Detective 2.0 — Capítulo 1 · Cambios, pruebas y limitaciones

## Corrección 2.0.1 · Sincronización entre la Terminal y la ventana Misión

- **Causa:** al cambiar de misión (`GAME.loadMission()` en `js/game.js`) solo se redibujaba la Terminal. La ventana Misión, y también Base de datos, Plano, Correo y las demás ventanas abiertas, conservaban el contenido anterior hasta resolver una misión o cerrarlas y abrirlas otra vez.
- **Solución:** `loadMission()` ahora redibuja todas las ventanas abiertas y la barra de tareas. Esto cubre «Siguiente misión», la barra de pasos, «Abrir la misión» desde el Correo, el cambio a Archivo libre, la misión 10 tras la confesión y el caso secreto.
- La ventana Misión vuelve al inicio de su contenido cuando cambia de misión (`js/apps.js`).
- **Pruebas nuevas:** 13 comprobaciones de transición entre misiones (`tests/playthrough.test.js`). Fallan en la versión anterior y pasan en esta.

## Resumen de cambios

**Qué se conserva sin cambios (contenido educativo)**
- `js/data.js` está intacto: la base de datos del caso, las 10 misiones, el caso secreto, las lecciones, los objetivos, las 3 pistas por misión, los sospechosos, las insignias, los rangos y los niveles.
- El motor SQL es SQLite real (sql.js) y crea una base nueva por misión.
- La validación por resultados, las explicaciones de errores, las reglas de XP (la primera pista es gratis y cada pista adicional resta 15 XP), las insignias y el botón «Restaurar datos» funcionan igual que en la v1. Esa lógica ahora vive en `js/engine.js` y `js/game.js`.

**Lumen OS (nuevo)**
- Arranque del sistema e inicio de sesión con nombre de agente, sobre la foto de la agencia.
- Escritorio con fondo cinematográfico e íconos SVG propios.
- Ventanas que se mueven, se redimensionan (bordes y esquinas), se superponen, se minimizan, se maximizan, se restauran, se cierran y se acoplan a los bordes.
- Barra de tareas, menú de inicio, notificaciones, sonidos sintetizados (se pueden silenciar) y pantalla completa.
- **Organizar:** Modo estudio, Foco en la terminal e Investigación libre, con atajos de teclado.
- Las posiciones de las ventanas se guardan y se restauran al volver.
- En pantallas estrechas las ventanas pasan a pantalla completa.

**Aplicaciones (nuevas)**
- Terminal SQL, con modo Archivo libre.
- Misión: lección, objetivo, pistas e informe.
- Base de datos.
- Correo Lumen: un correo por misión, más los mensajes de la historia.
- Expedientes: 6 fichas con retrato, notas, estado y evidencias vinculadas.
- Evidencias: 13 pruebas y 11 pistas.
- Visor de evidencias.
- Cámaras: 6 cámaras con reproducción, ruido y barrido animados.
- Plano del colegio: salas con su foto, `aula_id` y cantidad de accesos.
- Línea de tiempo: 26 hechos del 14 de marzo.
- Notas, Manual SQL, Perfil del agente e Informe al fiscal.

**Narrativa e imágenes**
- Cinemática de introducción con 7 escenas fotográficas.
- Confesión de Bruno y desenlace con Valeria, también con fotografías.
- 39 imágenes generadas y tratadas, más 3 derivadas por código (E-02, E-12 y las 6 cámaras) y la evidencia E-06 hecha en HTML. Detalle en `CREDITOS-IMAGENES.md`.
- Las evidencias llevan los textos exactos de la base SQL: PRF-03, las 23:12, EST-02 a las 22:40, el ticket de las 23:12:08, entre otros.

**Guardado**
- Nueva clave `sqlDetective.v2`.
- Si el navegador tiene progreso de la v1 (`sqlDetective.v1`), se **importa automáticamente**: misiones, XP, pistas, errores, insignias y borradores.

**Herramientas**
- `npm run build` genera `standalone/sql-detective-2.html`, con todas las imágenes incrustadas (7 MB).
- `scripts/serve.js` ahora sirve WebP correctamente.
- `tests/playthrough.test.js` se reescribió para la versión 2.0.

## Pruebas realizadas

La prueba automática juega el capítulo completo en **Google Chrome** (Playwright) en tres modos. Las tres ejecuciones terminaron en **80 de 80 comprobaciones correctas**:

1. `index.html` abierto con doble clic (`file://`);
2. `standalone/sql-detective-2.html` (un solo archivo);
3. `http://localhost:5173` (`npm start`).

Lista de comprobaciones:

- ✓ Inicio de sesión con la foto de la agencia (I-01)
- ✓ Cinemática de introducción con 7 escenas fotográficas
- ✓ El correo de bienvenida de Ortega se abre al empezar
- ✓ La guía de bienvenida se completa y se cierra
- ✓ Modo estudio abre Misión, Terminal, Base de datos y Evidencias
- ✓ En Modo estudio ninguna ventana tapa a otra
- ✓ La terminal tiene espacio cómodo (630 px de ancho en 1440 × 900)
- ✓ Detecta errores de sintaxis
- ✓ Sugiere el nombre correcto de la tabla
- ✓ Sugiere el nombre correcto de una columna
- ✓ BYTE entrega la primera pista
- ✓ La segunda pista descuenta 15 XP (la primera es gratis)
- ✓ Rechaza un resultado incompleto en la misión 1
- ✓ Misiones 1 a 9 resueltas con consultas reales (la misión 5 muestra la tarjeta PRF-03 desde SQLite)
- ✓ XP acumulada tras 9 misiones: 885
- ✓ Aparece la app «Informe al fiscal» en el escritorio
- ✓ Expedientes muestra el expediente de Bruno
- ✓ E-06 (registro de la terminal) se construye con HTML
- ✓ Cámaras: se amplía una cámara desbloqueada
- ✓ Imágenes cargadas correctamente (71 en pantalla, 0 rotas)
- ✓ Fondo de escritorio cinematográfico (I-03)
- ✓ Las notas se guardan
- ✓ Una acusación incorrecta se explica
- ✓ Confesión con el retrato de Bruno (P-05b)
- ✓ Tras la acusación se carga la misión 10
- ✓ UPDATE sin WHERE se detecta y se restaura
- ✓ Misión 10 resuelta
- ✓ El desenlace lleva al caso secreto
- ✓ Caso secreto resuelto
- ✓ Las 10 misiones y el caso secreto quedan completados
- ✓ Insignias obtenidas (Primera huella, Perseverancia, Instinto puro, Caso cerrado, Búho nocturno)
- ✓ Archivo libre ejecuta consultas sin evaluar
- ✓ Arrastrar, redimensionar, minimizar, restaurar, maximizar, restaurar con doble clic y cerrar ventanas
- ✓ La ventana activa pasa al frente (superposición)
- ✓ Se escribe en la terminal sin interferencias de las ventanas; Ctrl + Enter ejecuta
- ✓ Foco en la terminal y vuelta al Modo estudio con Alt + Shift + E
- ✓ Menú de inicio y doble clic en los íconos abren aplicaciones
- ✓ Tras recargar: progreso, nombre del agente y ventanas restaurados, sin repetir la cinemática
- ✓ Sin errores de JavaScript
- ✓ Migra el progreso de la versión 1.0 (misiones, XP y misión actual)
- ✓ Móvil (390 × 844): ventanas a pantalla completa, misión 1 resoluble, sin errores

**Revisión manual con capturas** (1440 × 900 y 1280 × 720):
- inicio de sesión, cinemáticas y Modo estudio;
- todas las aplicaciones;
- logos retocados y textos de las evidencias revisados con zoom;
- al cambiar el tamaño del navegador, las ventanas abiertas fuera del Modo estudio no se minimizan.

## Limitaciones pendientes

- **Navegadores:** solo se probó en Google Chrome. Edge, al usar el mismo motor, debería comportarse igual; **Firefox y Safari no se probaron**.
- **Inmersión:** es una aplicación de navegador. La barra del navegador solo desaparece en pantalla completa, y el navegador exige activarla con un clic del jugador.
- **Guardado por origen:** el progreso de `file://`, de `localhost` y de la versión de un solo archivo puede no compartirse entre sí; depende del navegador.
- **Móvil:** funciona, pero la experiencia está pensada para escritorio. En el celular no se arrastran ni redimensionan ventanas.
- **Imagen P-04r** (retrato de Molina): mide 680 × 843, menos que los demás retratos. Se ve bien en el tamaño en que se muestra; para igualarla, regénerala con su ficha y reemplaza el archivo.
- **Sonido:** solo efectos sintetizados (clics, avisos, éxito, error). No hay música ni voces.
- **Prueba automática:** necesita `npx playwright install chromium` o la variable `CHROME_PATH` apuntando a un Chrome instalado.
- **Alcance:** los capítulos 2 a 4 no están desarrollados. El desenlace anuncia el siguiente caso («el fantasma del laboratorio»).
