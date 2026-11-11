# SQL Detective 2.0 — Lumen OS · Capítulo 1

Videojuego de misterio para aprender SQL desde cero. El jugador inicia sesión en **Lumen OS**, la estación de trabajo de la Agencia Lumen, y resuelve el caso con consultas que se ejecutan sobre una base de datos **SQLite real** dentro del navegador ([sql.js](https://github.com/sql-js/sql.js)).

Funciona **sin internet y sin instalar nada**. No usa servicios externos, APIs ni cuentas.

---

## Cómo jugar (lo más rápido)

| Opción | Qué abrir |
|---|---|
| **Versión de carpeta** (recomendada) | Descomprime el ZIP y haz **doble clic en `index.html`**, en la carpeta principal |
| **Un solo archivo** | `standalone/sql-detective-2.html`: lleva todo incrustado (imágenes incluidas), se puede copiar solo |
| **Servidor local** | En una terminal: `npm start` y abre **http://localhost:5173** |

**Consejos:**
- Usa el botón **Pantalla completa** al iniciar sesión, o la tecla F11.
- El juego está pensado para pantallas de 1280 × 720 o más. En el celular funciona con las ventanas a pantalla completa.
- El progreso se guarda solo en el navegador (clave `sqlDetective.v2`). Si jugaste la versión 1.0 en el mismo navegador, tu avance se importa automáticamente.

## Controles de Lumen OS

| Acción | Cómo |
|---|---|
| Abrir una aplicación | Doble clic en su ícono del escritorio, o desde el menú **Lumen** |
| Mover / redimensionar | Arrastra la barra de título / los bordes y esquinas |
| Minimizar, maximizar, cerrar | Botones de la ventana · doble clic en el título para maximizar |
| Acoplar a media pantalla | Arrastra la ventana al borde izquierdo o derecho, o arriba para maximizar |
| **Modo estudio** | Botón **Organizar** o `Alt + Shift + E`: Misión · Terminal · Base de datos · Evidencias |
| Foco en la terminal | `Alt + Shift + F` |
| Investigación libre (cascada) | `Alt + Shift + L` |
| Ejecutar la consulta | `Ctrl + Enter` o **▶ Ejecutar** |

## Aplicaciones

- **Terminal SQL**: editor con resaltado, botones de palabras clave, ejecución real en SQLite, explicación de errores y modo **Archivo libre** para practicar.
- **Misión**: diálogo, lección, objetivo, pistas de BYTE e informe de cada misión.
- **Base de datos**: tablas, columnas y un vistazo rápido a cada tabla.
- **Correo Lumen**: cada misión llega como un correo, además de los mensajes de la historia.
- **Expedientes**: retratos, notas y estado de la víctima y de cada sospechoso.
- **Evidencias** y **Visor**: fotos de las pruebas y las pistas reunidas.
- **Cámaras**: 6 cámaras de seguridad que se desbloquean con la investigación.
- **Plano del colegio**: salas con su foto y su `aula_id`.
- **Línea de tiempo**: los hechos del 14 de marzo que confirmas con tus consultas.
- **Notas**, **Manual SQL** y **Perfil del agente** (rango, XP e insignias).
- **Informe al fiscal**: la acusación, cuando reúnes todas las pruebas.

---

## Estructura del proyecto

```
sql-detective/
├── index.html                ← ENTRADA DEL JUEGO (versión de carpeta)
├── standalone/
│   └── sql-detective-2.html  ← versión de un solo archivo (npm run build)
├── css/
│   ├── fonts.css             ← fuentes locales
│   └── os.css                ← estilos de Lumen OS y de todas las aplicaciones
├── js/
│   ├── data.js               ← CONTENIDO EDUCATIVO ORIGINAL (sin cambios): base del caso, misiones,
│   │                           pistas, sospechosos, insignias, rangos y niveles
│   ├── assets.js             ← manifiesto de imágenes (IMG)
│   ├── engine.js             ← motor SQL: ejecución, validación por resultados, explicación de errores
│   ├── story.js              ← narrativa 2.0: cinemáticas, correos, evidencias, línea de tiempo, cámaras, plano
│   ├── os.js                 ← Lumen OS: arranque, sesión, ventanas, barra de tareas, notificaciones, sonido
│   ├── apps.js               ← las aplicaciones
│   └── game.js               ← estado, guardado (con migración desde la v1), misiones, XP, insignias, historia
├── assets/
│   ├── img/                  ← 80 imágenes WebP tratadas (escenarios, personajes, evidencias, texturas, cámaras)
│   └── fonts/                ← Inter, Playfair Display y JetBrains Mono (+ licencias)
├── vendor/sql-asm.js         ← SQLite compilado a JavaScript (sql.js 1.10.3)
├── database/                 ← caso-001.sql y caso-001.sqlite (npm run export-db)
├── scripts/                  ← servidor local, versión de un solo archivo, exportación de la base
├── tests/playthrough.test.js ← prueba automática de todo el capítulo
├── CAMBIOS-2.0.md            ← resumen de cambios, pruebas y limitaciones
└── CREDITOS-IMAGENES.md      ← origen y tratamiento de cada imagen
```

## Comandos (requieren Node.js 18 o superior)

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las herramientas de desarrollo (solo para pruebas y regenerar archivos) |
| `npm start` | Servidor local en http://localhost:5173 (`node scripts/serve.js 8080` para otro puerto) |
| `npm run build` | Regenera `standalone/sql-detective-2.html` |
| `npm run export-db` | Regenera `database/` a partir de `js/data.js` |
| `npm test` | Juega el capítulo completo en un navegador real y verifica todo |
| `npm test -- standalone` | La misma prueba sobre la versión de un solo archivo |

Antes de `npm test` por primera vez, instala el navegador de pruebas con `npx playwright install chromium`. También puedes usar un Chrome ya instalado: `CHROME_PATH=/ruta/a/chrome npm test`.

## Cómo se validan las respuestas (sin cambios respecto a la v1)

El juego **no compara textos**. Ejecuta tu consulta y una consulta de referencia (`check.ref`) sobre una copia limpia de la base, y compara los **resultados**. Cualquier consulta que llegue a la misma evidencia es correcta. La misión 10 (`UPDATE`) revisa el estado final de la tabla y restaura la base si se modificaron otros estudiantes.

## Cómo modificar el juego

- **Misiones, pistas, lecciones y datos de la base:** `js/data.js`. Luego `npm run export-db` y `npm run build`.
- **Correos, evidencias, línea de tiempo, cámaras y plano:** `js/story.js`.
- **Imágenes:** añade el archivo WebP en `assets/img/` y su clave en `js/assets.js`.
- **Colores:** variables al inicio de `css/os.css`.

## Licencias de terceros

- sql.js: MIT (`vendor/sql.js-LICENSE.txt`).
- Fuentes Inter, Playfair Display y JetBrains Mono: SIL Open Font License 1.1 (`assets/fonts/LICENSE-*.txt`).
- Imágenes: ver `CREDITOS-IMAGENES.md`.
