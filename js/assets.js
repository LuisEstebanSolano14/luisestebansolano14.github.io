/* SQL Detective 2.0 — manifiesto de imágenes.
   Todas las rutas de imagen del juego pasan por IMG(), así la versión de un solo archivo
   (npm run build) puede sustituirlas por datos incrustados. */
"use strict";
const ASSET_BASE = 'assets/img/';
const ASSETS = {
  // escenarios
  'I-01': 'escenarios/I-01_agencia_oficina', 'I-02': 'escenarios/I-02_colegio_fachada', 'I-03': 'escenarios/I-03_lima_nocturna',
  'I-04': 'escenarios/I-04_secretaria_alerta', 'I-05': 'escenarios/I-05_sala_servidores', 'I-06': 'escenarios/I-06_biblioteca',
  'I-07': 'escenarios/I-07_laboratorio', 'I-08': 'escenarios/I-08_auditorio_piano', 'I-09': 'escenarios/I-09_pasillo_expendedora',
  'I-10': 'escenarios/I-10_sala_profesores', 'I-11': 'escenarios/I-11_pasillo_2piso',
  // personajes
  'P-01r': 'personajes/P-01r_ortega_retrato', 'P-03r': 'personajes/P-03r_ramiro_retrato', 'P-04r': 'personajes/P-04r_molina_retrato',
  'P-05r': 'personajes/P-05r_bruno_retrato', 'P-05b': 'personajes/P-05b_bruno_confesion', 'P-06r': 'personajes/P-06r_sofia_retrato',
  'P-07r': 'personajes/P-07r_tomas_retrato', 'P-08r': 'personajes/P-08r_valeria_retrato', 'P-08b': 'personajes/P-08b_valeria_final',
  // evidencias
  'E-01': 'evidencias/E-01_monitor_alerta', 'E-02': 'evidencias/E-02_ficha_valeria', 'E-03': 'evidencias/E-03_puerta_lector',
  'E-04': 'evidencias/E-04_tarjeta_PRF03', 'E-05': 'evidencias/E-05_programa_concierto', 'E-07': 'evidencias/E-07_cctv_pasillo',
  'E-08': 'evidencias/E-08_libro_prestamo', 'E-09': 'evidencias/E-09_llaves_aula101', 'E-10': 'evidencias/E-10_ticket_expendedora',
  'E-11': 'evidencias/E-11_partituras_escritorio', 'E-12': 'evidencias/E-12_tarjeta_TMP09', 'E-13': 'evidencias/E-13_experimento_registro',
  // texturas y cámaras
  'T-01': 'texturas/T-01_mesa_evidencias', 'T-02': 'texturas/T-02_carpeta_expediente',
  'CAM-01': 'camaras/CAM-01_auditorio', 'CAM-02': 'camaras/CAM-02_biblioteca', 'CAM-03': 'camaras/CAM-03_pasillo2',
  'CAM-04': 'camaras/CAM-04_servidores', 'CAM-05': 'camaras/CAM-05_pasillo1', 'CAM-06': 'camaras/CAM-06_laboratorio'
};
/** Ruta (o dato incrustado) de una imagen. small=true devuelve la versión reducida. */
function IMG(key, small) {
  const p = ASSETS[key]; if (!p) { console.warn('[SQLD] imagen desconocida', key); return ''; }
  const path = ASSET_BASE + p + (small ? '-sm' : '') + '.webp';
  return (window.__INLINE_IMG && window.__INLINE_IMG[path]) || path;
}
