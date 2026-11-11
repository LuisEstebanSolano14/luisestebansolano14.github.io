/* SQL Detective 2.0 — narrativa de Lumen OS para el Capítulo 1:
   retratos, cinemáticas, correos, evidencias, línea de tiempo, cámaras y plano.
   Las misiones, la base de datos y los sospechosos originales siguen en data.js (sin cambios). */
"use strict";

CHAR.sofia = { name: 'Sofía Mendoza', short: 'SM', color: '#7ad3e0' };
CHAR.tomas = { name: 'Tomás Gutiérrez', short: 'TG', color: '#e0a07a' };
CHAR.secretaria = { name: 'Secretaría Académica', short: 'SA', color: '#c9d2e0' };
CHAR.fiscal = { name: 'Fiscalía de Lima · Mesa de partes', short: 'FL', color: '#c9d2e0' };
CHAR.sistema = { name: 'Lumen OS', short: 'LO', color: '#e0b25c' };

/** Retrato fotográfico de cada personaje (BYTE no tiene foto: es una IA). */
const PORTRAIT = { ortega: 'P-01r', ramiro: 'P-03r', molina: 'P-04r', bruno: 'P-05r', sofia: 'P-06r', tomas: 'P-07r', valeria: 'P-08r' };

/* ---------------- Cinemática de introducción (textos de INTRO, data.js) ---------------- */
const INTRO_SCENES = [
  { bg: 'I-02', scene: 'LIMA · 14 DE MARZO · 23:12', who: 'narr', text: 'En el Colegio Santa Aurora todos duermen… salvo una pantalla.' },
  { bg: 'I-04', scene: 'SECRETARÍA ACADÉMICA · 23:12', who: 'narr', text: 'En la Secretaría Académica parpadea una alerta silenciosa: un registro académico acaba de desaparecer.' },
  { bg: 'I-01', scene: 'AGENCIA LUMEN · A LA MAÑANA SIGUIENTE', who: 'ortega', text: INTRO[1].text },
  { bg: 'I-01', who: 'ortega', text: INTRO[2].text },
  { bg: 'I-05', scene: 'SALA DE SERVIDORES DEL COLEGIO', who: 'ortega', text: INTRO[3].text },
  { bg: 'I-03', scene: 'LUMEN OS · TERMINAL', who: 'byte', text: INTRO[4].text },
  { bg: 'I-01', who: 'ortega', text: INTRO[5].text }
];

/* ---------------- Evidencias ----------------
   unlock: 'intro' o el id de la misión que la revela. img: clave de ASSETS. html: evidencia construida con código. */
const EVIDENCE = [
  { id: 'E-01', unlock: 'intro', img: 'E-01', kind: 'Foto', title: 'Alerta en la Secretaría', place: 'Secretaría Académica · 23:12',
    desc: 'Monitor de la Secretaría Académica a las 23:12: «Registro eliminado · EST-05 · sesión PRF-03». Así empezó todo.' },
  { id: 'E-02', unlock: 'm3', img: 'E-02', kind: 'Documento', title: 'Ficha escolar de Valeria Ríos', place: 'Secretaría Académica',
    desc: 'Valeria Ríos, 5.º grado, promedio 19.4, tarjeta EST-05. Finalista de la Beca Horizonte. Su registro figura como «eliminado».' },
  { id: 'E-03', unlock: 'm5', img: 'E-03', kind: 'Foto', title: 'Puerta de la Sala de Servidores', place: 'Aula 6 · 2.º piso',
    desc: 'El lector de tarjetas registra cada entrada y salida. La noche del 14, la tarjeta PRF-03 entró a las 23:05 y salió a las 23:14.' },
  { id: 'E-04', unlock: 'm6', img: 'E-04', kind: 'Prueba', title: 'Tarjeta de acceso PRF-03', place: 'Objetos perdidos · Biblioteca',
    desc: 'Tarjeta del Prof. Héctor Molina, reportada como perdida a las 17:45. Fue hallada el 15/03 en el buzón de objetos perdidos de la biblioteca.' },
  { id: 'E-12', unlock: 'm6', img: 'E-12', kind: 'Prueba', title: 'Tarjeta temporal TMP-09', place: 'Secretaría Académica',
    desc: 'Entregada a Molina a las 18:00 para reemplazar PRF-03. Con ella entró al auditorio a las 20:00 y salió a las 23:30.' },
  { id: 'E-05', unlock: 'm6', img: 'E-05', kind: 'Documento', title: 'Programa del concierto', place: 'Auditorio Principal',
    desc: 'Programa del concierto de fin de trimestre: «23:00 · Solo de piano · Prof. Héctor Molina».' },
  { id: 'E-06', unlock: 'm6', html: 'terminal', kind: 'Registro', title: 'Registro de la terminal SRV-01', place: 'Sala de Servidores',
    desc: 'Bitácora de la terminal de la Sala de Servidores. La sesión abierta con PRF-03 cambió el estado del registro de EST-05.' },
  { id: 'E-07', unlock: 'm8', img: 'E-07', kind: 'Cámara', title: 'CAM 03 · Pasillo del 2.º piso · 23:04', place: 'Pasillo del 2.º piso',
    desc: 'Una figura con uniforme y mochila negra camina hacia la Sala de Servidores. No se ve el rostro, pero la franja reflectante de la mochila brilla con la luz.' },
  { id: 'E-08', unlock: 'm9', img: 'E-08', kind: 'Prueba', title: 'Libro «Redes y seguridad informática»', place: 'Biblioteca',
    desc: 'Préstamo registrado a las 22:40 del 14/03 a la tarjeta EST-02.' },
  { id: 'E-09', unlock: 'm9', img: 'E-09', kind: 'Foto', title: 'Llaves del Aula 101', place: 'Sala de Profesores',
    desc: 'Devueltas a las 17:42 por el asistente del coro (EST-02). Tres minutos después, Molina reportó la pérdida de su tarjeta.' },
  { id: 'E-11', unlock: 'm9', img: 'E-11', kind: 'Foto', title: 'Escritorio del Prof. Molina', place: 'Sala de Profesores',
    desc: 'Partituras revueltas y un portacredencial vacío. A las 17:05, el asistente del coro (EST-02) ordenó partituras en este escritorio.' },
  { id: 'E-10', unlock: 'm9', img: 'E-10', kind: 'Prueba', title: 'Ticket de la máquina expendedora', place: 'Pasillo del 1.er piso',
    desc: 'Compra a las 23:12:08 pagada con la tarjeta EST-08 (Tomás), en el primer piso: lejos de la terminal del segundo.' },
  { id: 'E-13', unlock: 'm9', img: 'E-13', kind: 'Registro', title: 'Registro del experimento de EST-07', place: 'Laboratorio de Química',
    desc: 'El experimento de Sofía registró actividad a las 22:58 y 23:25, y su tarjeta no marcó salida del laboratorio hasta las 23:45.' }
];

/** Evidencia E-06 construida con HTML (no es una fotografía). */
function terminalEvidenceHTML() {
  const L = [
    ['23:05:12', 'puerta aula 6 · acceso concedido · tarjeta PRF-03', ''],
    ['23:09:40', 'login terminal SRV-01 · sesión PRF-03', ''],
    ['23:11:58', '> SELECT * FROM estudiantes WHERE id = 5;', 'cmd'],
    ['23:12:03', "> UPDATE estudiantes SET estado_registro = 'eliminado' WHERE id = 5;", 'cmd'],
    ['23:12:03', '1 fila modificada · ALERTA enviada a Secretaría Académica', 'warn'],
    ['23:13:50', 'logout · sesión PRF-03', ''],
    ['23:14:02', 'puerta aula 6 · salida · tarjeta PRF-03', '']
  ];
  return `<div class="crt"><div class="crt-hd">SRV-01 · Sistema académico Santa Aurora · bitácora 14/03/2026</div>${L.map(l => `<div class="crt-l ${l[2]}"><span>${l[0]}</span>${esc(l[1])}</div>`).join('')}<div class="crt-l"><span>&nbsp;</span><i class="crt-cur"></i></div></div>`;
}

/* ---------------- Línea de tiempo del 14 de marzo ---------------- */
const TIMELINE = [
  { t: '09:15', u: 'm4', who: ['valeria', 'bruno'], text: 'Secretaría publica los finalistas de la Beca Horizonte: EST-05 y EST-02.', src: 'eventos' },
  { t: '16:35', u: 'm5', who: ['ramiro'], text: 'Mantenimiento programado de la terminal de la Sala de Servidores (PRF-05).', src: 'eventos' },
  { t: '17:00', u: 'm9', who: ['molina', 'bruno'], text: 'Ensayo del coro en el Aula 101: Molina (PRF-03) y su asistente EST-02.', src: 'accesos' },
  { t: '17:05', u: 'm9', who: ['bruno'], text: 'El asistente del coro ordena partituras en el escritorio de Molina.', src: 'eventos', ev: 'E-11' },
  { t: '17:42', u: 'm9', who: ['bruno'], text: 'EST-02 devuelve las llaves del Aula 101 en la Sala de Profesores.', src: 'eventos', ev: 'E-09' },
  { t: '17:45', u: 'm6', who: ['molina'], text: 'Molina reporta la pérdida de su tarjeta PRF-03.', src: 'eventos', ev: 'E-04' },
  { t: '18:00', u: 'm6', who: ['molina'], text: 'Secretaría entrega la tarjeta temporal TMP-09 a Molina.', src: 'eventos', ev: 'E-12' },
  { t: '18:05', u: 'm6', who: ['ramiro'], text: 'Ramiro Paz termina su turno y sale del colegio.', src: 'eventos' },
  { t: '20:00', u: 'm6', who: ['molina'], text: 'Comienza el concierto; TMP-09 entra al Auditorio.', src: 'accesos' },
  { t: '22:10', u: 'm7', who: ['sofia'], text: 'Sofía (EST-07) entra al Laboratorio de Química.', src: 'accesos' },
  { t: '22:30', u: 'm7', who: ['bruno'], text: 'Bruno (EST-02) entra a la Biblioteca.', src: 'accesos' },
  { t: '22:35', u: 'm7', who: ['tomas'], text: 'Tomás (EST-08) entra a la Biblioteca.', src: 'accesos' },
  { t: '22:40', u: 'm9', who: ['bruno'], text: 'EST-02 pide prestado «Redes y seguridad informática».', src: 'eventos', ev: 'E-08' },
  { t: '22:58', u: 'm9', who: ['sofia'], text: 'El experimento de Sofía registra actividad en el laboratorio.', src: 'eventos', ev: 'E-13' },
  { t: '23:00', u: 'm6', who: ['molina'], text: 'Solo de piano de Molina en el escenario (TMP-09).', src: 'eventos', ev: 'E-05' },
  { t: '23:01', u: 'm8', who: ['bruno'], text: 'Bruno sale de la Biblioteca.', src: 'accesos' },
  { t: '23:04', u: 'm8', who: [], text: 'CAM 03 graba una figura con mochila reflectante rumbo a la Sala de Servidores.', src: 'cámaras', ev: 'E-07' },
  { t: '23:05', u: 'm5', who: [], text: 'La tarjeta PRF-03 entra a la Sala de Servidores.', src: 'accesos', ev: 'E-03' },
  { t: '23:10', u: 'm8', who: ['tomas'], text: 'Tomás sale de la Biblioteca.', src: 'accesos' },
  { t: '23:12', u: 'intro', who: ['valeria'], text: 'El registro académico de EST-05 es eliminado desde la terminal (sesión PRF-03).', src: 'eventos', ev: 'E-01', key: true },
  { t: '23:12', u: 'm9', who: ['tomas'], text: 'EST-08 compra en la máquina expendedora del primer piso.', src: 'eventos', ev: 'E-10' },
  { t: '23:14', u: 'm5', who: [], text: 'La tarjeta PRF-03 sale de la Sala de Servidores.', src: 'accesos' },
  { t: '23:19', u: 'm8', who: ['bruno'], text: 'Bruno vuelve a entrar a la Biblioteca.', src: 'accesos' },
  { t: '23:25', u: 'm9', who: ['sofia'], text: 'Nuevo registro automático del experimento de Sofía.', src: 'eventos', ev: 'E-13' },
  { t: '23:30', u: 'm6', who: ['molina'], text: 'Termina el concierto; TMP-09 sale del Auditorio.', src: 'accesos' },
  { t: '23:50', u: 'secret', who: ['bruno'], text: 'Bruno sale por última vez de la Biblioteca: su cuarto movimiento de la noche.', src: 'accesos' }
];

/* ---------------- Cámaras ---------------- */
const CAMERAS = [
  { id: 'CAM-01', name: 'CAM 01 · Auditorio', room: 1, unlock: 'm6', start: '23:00:00' },
  { id: 'CAM-02', name: 'CAM 02 · Biblioteca', room: 4, unlock: 'm7', start: '22:58:00' },
  { id: 'CAM-03', name: 'CAM 03 · Pasillo 2.º piso', room: 0, unlock: 'm7', start: '23:00:30' },
  { id: 'CAM-04', name: 'CAM 04 · Sala de Servidores', room: 6, unlock: 'm5', start: '23:03:00' },
  { id: 'CAM-05', name: 'CAM 05 · Pasillo 1.er piso', room: 0, unlock: 'm9', start: '23:10:00' },
  { id: 'CAM-06', name: 'CAM 06 · Laboratorio', room: 5, unlock: 'm7', start: '22:55:00' }
];

/* ---------------- Plano ---------------- */
const ROOMS = {
  1: { name: 'Auditorio Principal', img: 'I-08', floor: 1, note: 'Escenario del concierto. Molina tocó el piano a las 23:00.' },
  2: { name: 'Aula 101', img: null, floor: 1, note: 'Clase de Matemática por la mañana y ensayo del coro a las 17:00.' },
  3: { name: 'Sala de Profesores', img: 'I-10', floor: 1, note: 'Llavero de aulas y escritorio del profesor de Música.' },
  4: { name: 'Biblioteca', img: 'I-06', floor: 2, note: 'Bruno y Tomás estudiaron aquí la noche del 14.' },
  5: { name: 'Laboratorio de Química', img: 'I-07', floor: 2, note: 'El experimento de Sofía para la feria de ciencias.' },
  6: { name: 'Sala de Servidores', img: 'I-05', floor: 2, note: 'Acceso restringido. Desde su terminal se borró el registro.' },
  7: { name: 'Secretaría Académica', img: 'I-04', floor: 1, note: 'Aquí saltó la alerta de las 23:12.' },
  p1: { name: 'Pasillo del 1.er piso', img: 'I-09', floor: 1, note: 'Máquina expendedora y escalera al segundo piso. No es un aula: no tiene aula_id.' },
  p2: { name: 'Pasillo del 2.º piso', img: 'I-11', floor: 2, note: 'Une la Biblioteca, el Laboratorio y la Sala de Servidores. No tiene aula_id.' }
};

/* ---------------- Correos fijos (los de cada misión se generan desde MISSIONS) ---------------- */
const FIXED_MAIL = [
  { id: 'intro', when: 'intro', from: 'ortega', time: '07:41', subject: 'Caso 001 — Te necesito en esto hoy', attach: ['E-01'],
    body: `<p>Detective:</p><p>${INTRO[2].text}</p><p>${INTRO[3].text}</p><p>Te asigné una estación de trabajo con acceso de lectura a esa base de datos. BYTE, el asistente de la terminal, te acompañará desde cero.</p><p>— C. Ortega</p>`,
    action: { label: 'Abrir la misión 1', act: 'mission:0' } },
  { id: 'ramiro', when: 'intro', from: 'ramiro', time: '07:12', subject: 'Credenciales de lectura para la Agencia Lumen', attach: [],
    body: '<p>Buenos días. Ya tienen acceso de <b>solo lectura</b> a una copia de la base de datos del colegio. Tiene cinco tablas: <code>estudiantes</code>, <code>profesores</code>, <code>aulas</code>, <code>accesos</code> y <code>eventos</code>.</p><p>Pueden verlas en la app <b>Base de datos</b>. Cualquier cambio que hagan en la copia se puede deshacer con «Restaurar datos».</p><p>Ramiro Paz · Informática</p>' },
  { id: 'finalistas', when: 'm4', from: 'secretaria', time: '09:20', subject: 'Lista oficial de finalistas · Beca Horizonte', attach: ['E-02'],
    body: '<p>A pedido de la Agencia Lumen, confirmamos que los finalistas de la Beca Horizonte, publicados el 14/03 a las 09:15, son:</p><ul><li><code>EST-05</code> · Valeria Ríos · 19.4</li><li><code>EST-02</code> · Bruno Castañeda · 18.9</li></ul><p>El ganador se anuncia mañana.</p>' },
  { id: 'fiscal', when: 'accused', from: 'fiscal', time: '13:05', subject: 'Caso 001 · Informe recibido', attach: ['E-07', 'E-04'],
    body: '<p>Recibimos el informe de la Agencia Lumen que identifica a <b>Bruno Castañeda (EST-02)</b> como responsable del cambio en el registro académico de EST-05.</p><p>Por tratarse de un menor de edad, el caso continuará con la dirección del colegio y su familia.</p>' },
  { id: 'valeria', when: 'm10', from: 'valeria', time: '08:02', subject: 'Gracias, detective', attach: [],
    body: '<p>Me dijeron que fue usted quien encontró la verdad. Mi registro volvió a estar activo y mi nombre está otra vez en la lista de la beca.</p><p>No sé cómo agradecérselo. Gracias por no rendirse con los datos.</p><p>Valeria</p>', photo: 'P-08b' }
];
