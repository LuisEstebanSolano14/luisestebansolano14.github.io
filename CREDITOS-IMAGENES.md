# Créditos de las imágenes · SQL Detective 2.0 · Capítulo 1

Todas las fotografías son **imágenes generadas con IA** a partir de los prompts de la *Biblia visual del Capítulo 1*. Las personas que aparecen son **personajes ficticios**.

- **Generación:** Google Gemini, modelo Nano Banana 2 (`gemini-3.1-flash-image`), noviembre de 2026. Las genera el autor del proyecto. El retrato de prueba P-04r se generó en el Playground de Google AI Studio.
- **Coherencia visual:** cada escena con personajes o lugares ya existentes se generó adjuntando como referencia su ficha (P-0X) o la imagen del lugar.
- **Tratamiento:** con ImageMagick, Pillow y OpenCV.
  - Gradación de color común: sombras azul petróleo y luces ámbar, con grano fino.
  - Exportación a WebP en dos tamaños.
  - Retoque de tres logos pequeños (en I-04, I-07 e I-08).
  - Superposición de los textos exactos de las evidencias, para que coincidan con la base SQL.
- **Originales sin modificar:** no se incluyen en el juego. Las fichas de referencia (P-01 … P-08) se usaron solo en la producción.

| Código | Archivo | Origen |
|---|---|---|
| I-01 … I-11 | `assets/img/escenarios/` | Generadas (I-01 con referencia del retrato P-01r; I-03, I-06, I-07, I-09 e I-10 con referencias de lugar) |
| P-01r … P-08r, P-05b, P-08b | `assets/img/personajes/` | Generadas con su ficha como referencia |
| E-01, E-03, E-04, E-05, E-08, E-09, E-10, E-11, E-13 | `assets/img/evidencias/` | Generadas y luego rotuladas (textos añadidos por código) |
| E-07 | `assets/img/evidencias/` | Generada como variante de I-11, con filtro de cámara de seguridad y datos superpuestos |
| E-02 | `assets/img/evidencias/` | **Derivada** por código: ficha escolar compuesta sobre T-01 con el retrato P-08r |
| E-12 | `assets/img/evidencias/` | **Derivada** por código de E-04 (tarjeta TMP-09) |
| E-06 | — | Construida con HTML y CSS (`terminalEvidenceHTML` en `js/story.js`) |
| T-01, T-02 | `assets/img/texturas/` | Generadas |
| CAM-01 … CAM-06 | `assets/img/camaras/` | **Derivadas** de I-05, I-06, I-07, I-08, I-09 e I-11 con filtro de vigilancia (la hora se dibuja en vivo) |

Las imágenes generadas con Gemini pueden llevar la marca de agua invisible **SynthID**, que Google incluye para identificarlas como contenido generado por IA.
