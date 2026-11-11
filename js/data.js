/* SQL Detective — datos del juego: base de datos del Caso 001, personajes, misiones, insignias y niveles.
   Para crear un nuevo capítulo, añade aquí sus datos (ver README). */
"use strict";
/* =========================================================
   DATOS DEL CASO 001
   ========================================================= */
const SEED = `
CREATE TABLE aulas (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, piso INTEGER, tipo TEXT);
INSERT INTO aulas VALUES
(1,'Auditorio Principal',1,'eventos'),(2,'Aula 101',1,'clase'),(3,'Sala de Profesores',1,'administrativo'),
(4,'Biblioteca',2,'estudio'),(5,'Laboratorio de Química',2,'laboratorio'),(6,'Sala de Servidores',2,'restringido'),
(7,'Secretaría Académica',1,'administrativo');

CREATE TABLE profesores (id INTEGER PRIMARY KEY, nombre TEXT, apellido TEXT, materia TEXT, tarjeta TEXT UNIQUE);
INSERT INTO profesores VALUES
(1,'Elena','Vargas','Matemática','PRF-01'),(2,'Jorge','Quispe','Historia','PRF-02'),
(3,'Héctor','Molina','Música','PRF-03'),(4,'Patricia','León','Química','PRF-04'),(5,'Ramiro','Paz','Informática','PRF-05');

CREATE TABLE estudiantes (id INTEGER PRIMARY KEY, nombre TEXT, apellido TEXT, grado TEXT, promedio REAL, tarjeta TEXT UNIQUE, estado_registro TEXT);
INSERT INTO estudiantes VALUES
(1,'Ana','Torres','5to',16.8,'EST-01','activo'),
(2,'Bruno','Castañeda','5to',18.9,'EST-02','activo'),
(3,'Camila','Rojas','4to',15.2,'EST-03','activo'),
(4,'Diego','Huamán','5to',17.5,'EST-04','activo'),
(5,'Valeria','Ríos','5to',19.4,'EST-05','eliminado'),
(6,'Mateo','Sánchez','4to',14.9,'EST-06','activo'),
(7,'Sofía','Mendoza','5to',17.9,'EST-07','activo'),
(8,'Tomás','Gutiérrez','5to',16.1,'EST-08','activo'),
(9,'Lucía','Paredes','3ro',17.2,'EST-09','activo'),
(10,'Renato','Flores','3ro',15.8,'EST-10','retirado');

CREATE TABLE accesos (id INTEGER PRIMARY KEY, tarjeta TEXT, aula_id INTEGER REFERENCES aulas(id), fecha TEXT, hora TEXT, tipo TEXT);
INSERT INTO accesos VALUES
(1,'PRF-05',6,'2026-03-13','08:10','entrada'),(2,'PRF-05',6,'2026-03-13','08:55','salida'),
(3,'EST-02',4,'2026-03-13','15:00','entrada'),(4,'EST-02',4,'2026-03-13','16:30','salida'),
(5,'EST-05',4,'2026-03-13','15:10','entrada'),(6,'EST-05',4,'2026-03-13','17:00','salida'),
(7,'EST-01',2,'2026-03-14','08:00','entrada'),(8,'EST-05',2,'2026-03-14','08:00','entrada'),
(9,'PRF-01',2,'2026-03-14','08:02','entrada'),(10,'PRF-05',6,'2026-03-14','08:00','entrada'),
(11,'PRF-05',6,'2026-03-14','08:40','salida'),(12,'EST-01',2,'2026-03-14','09:30','salida'),
(13,'EST-05',2,'2026-03-14','09:30','salida'),(14,'PRF-01',2,'2026-03-14','09:31','salida'),
(15,'PRF-05',6,'2026-03-14','16:30','entrada'),(16,'PRF-05',6,'2026-03-14','17:10','salida'),
(17,'PRF-03',2,'2026-03-14','17:00','entrada'),(18,'EST-02',2,'2026-03-14','17:00','entrada'),
(19,'EST-04',2,'2026-03-14','17:02','entrada'),(20,'PRF-03',2,'2026-03-14','17:40','salida'),
(21,'EST-02',2,'2026-03-14','17:41','salida'),(22,'EST-04',2,'2026-03-14','17:41','salida'),
(23,'PRF-02',3,'2026-03-14','17:30','entrada'),(24,'PRF-02',3,'2026-03-14','18:10','salida'),
(25,'TMP-09',1,'2026-03-14','20:00','entrada'),(26,'EST-09',1,'2026-03-14','20:05','entrada'),
(27,'EST-03',1,'2026-03-14','20:05','entrada'),(28,'EST-07',5,'2026-03-14','22:10','entrada'),
(29,'EST-02',4,'2026-03-14','22:30','entrada'),(30,'EST-08',4,'2026-03-14','22:35','entrada'),
(31,'EST-02',4,'2026-03-14','23:01','salida'),(32,'PRF-03',6,'2026-03-14','23:05','entrada'),
(33,'EST-08',4,'2026-03-14','23:10','salida'),(34,'PRF-03',6,'2026-03-14','23:14','salida'),
(35,'EST-02',4,'2026-03-14','23:19','entrada'),(36,'TMP-09',1,'2026-03-14','23:30','salida'),
(37,'EST-09',1,'2026-03-14','23:30','salida'),(38,'EST-03',1,'2026-03-14','23:31','salida'),
(39,'EST-07',5,'2026-03-14','23:45','salida'),(40,'EST-02',4,'2026-03-14','23:50','salida');

CREATE TABLE eventos (id INTEGER PRIMARY KEY, fecha TEXT, hora TEXT, aula_id INTEGER REFERENCES aulas(id), tarjeta TEXT, descripcion TEXT);
INSERT INTO eventos VALUES
(1,'2026-03-14','08:00',2,'PRF-01','Clase de Matemática con 5to grado'),
(2,'2026-03-14','09:15',7,NULL,'Secretaría publica los finalistas de la Beca Horizonte: EST-05 y EST-02'),
(3,'2026-03-14','16:35',6,'PRF-05','Mantenimiento programado de la terminal de la Sala de Servidores'),
(4,'2026-03-14','17:00',2,'PRF-03','Ensayo del coro dirigido por el profesor de Música'),
(5,'2026-03-14','17:05',2,'EST-02','El asistente del coro ordena partituras en el escritorio del profesor'),
(6,'2026-03-14','17:42',3,'EST-02','Devolución de las llaves del Aula 101 en la Sala de Profesores'),
(7,'2026-03-14','17:45',3,NULL,'Prof. Molina reporta la pérdida de su tarjeta PRF-03'),
(8,'2026-03-14','18:00',7,NULL,'Secretaría entrega la tarjeta temporal TMP-09 al Prof. Molina (reemplaza PRF-03)'),
(9,'2026-03-14','18:05',NULL,'PRF-05','El Prof. Paz termina su turno y sale del colegio'),
(10,'2026-03-14','20:00',1,NULL,'Comienza el Concierto de fin de trimestre'),
(11,'2026-03-14','22:15',5,'EST-07','Registro automático del experimento para la feria de ciencias'),
(12,'2026-03-14','22:40',4,'EST-02','Préstamo del libro "Redes y seguridad informática"'),
(13,'2026-03-14','22:45',4,'EST-08','Préstamo del libro "Historia del Perú"'),
(14,'2026-03-14','22:58',5,'EST-07','Registro automático del experimento para la feria de ciencias'),
(15,'2026-03-14','23:00',1,'TMP-09','Solo de piano en el escenario del concierto'),
(16,'2026-03-14','23:12',6,'PRF-03','ALERTA: registro académico de EST-05 eliminado desde la terminal (sesión PRF-03)'),
(17,'2026-03-14','23:12',NULL,'EST-08','Compra en la máquina expendedora del primer piso'),
(18,'2026-03-14','23:25',5,'EST-07','Registro automático del experimento para la feria de ciencias');
`;

const CHAR = {
  ortega:{name:'Inspectora Carmen Ortega',short:'CO',color:'#d9b25f'},
  byte:{name:'BYTE · asistente de terminal',short:'BY',color:'#6fa8ff'},
  molina:{name:'Prof. Héctor Molina',short:'HM',color:'#b892ff'},
  ramiro:{name:'Prof. Ramiro Paz',short:'RP',color:'#62cf9e'},
  bruno:{name:'Bruno Castañeda',short:'BC',color:'#e86f63'},
  valeria:{name:'Valeria Ríos',short:'VR',color:'#f3d48a'},
  narr:{name:'',short:'',narr:true}
};

const INTRO = [
  {scene:'LIMA · 14 DE MARZO · 23:12', who:'narr', text:'En el Colegio Santa Aurora todos duermen… salvo una pantalla. En la Secretaría Académica parpadea una alerta silenciosa: un registro académico acaba de desaparecer.'},
  {scene:'AGENCIA LUMEN · A LA MAÑANA SIGUIENTE', who:'ortega', text:'Detective, bienvenido a la Agencia Lumen. Me habría gustado darte una bienvenida con café, pero tenemos un caso.'},
  {who:'ortega', text:'Valeria Ríos, la mejor alumna del colegio, era finalista de la <b>Beca Horizonte</b>. El ganador se anuncia mañana… y su registro académico ya no aparece en el sistema.'},
  {who:'ortega', text:'No hay testigos. Pero tenemos algo mejor: la <b>base de datos del colegio</b>. Cada puerta, cada tarjeta y cada evento quedaron registrados.'},
  {who:'byte', text:'¡Hola! Soy BYTE, el asistente de la terminal. Te enseñaré a interrogar a la base de datos con un idioma llamado <b>SQL</b>. No necesitas saber programar: empezamos desde cero.'},
  {who:'ortega', text:'Las bases de datos no mienten, detective. Solo hay que hacerles las preguntas correctas. Manos a la obra.'}
];

const SUSPECTS = [
  {id:'bruno', name:'Bruno Castañeda', role:'Estudiante de 5.º · tarjeta EST-02', unlock:4, notes:[
    [4,'Segundo mejor promedio (18.9): rival directo de Valeria por la beca.'],
    [7,'Estaba en el segundo piso esa noche (Biblioteca).'],
    [8,'Salió de la biblioteca a las 23:01 y volvió a las 23:19.'],
    [9,'Estuvo en el escritorio de Molina (17:05) y en la Sala de Profesores (17:42), justo antes de que la tarjeta PRF-03 desapareciera. Pidió un libro de seguridad informática.']]},
  {id:'molina', name:'Prof. Héctor Molina', role:'Música · asesor de la beca · PRF-03', unlock:5, notes:[
    [5,'Su tarjeta PRF-03 entró a la Sala de Servidores a las 23:05.'],
    [6,'Reportó la pérdida de PRF-03 a las 17:45. Desde las 18:00 usa la tarjeta temporal TMP-09.'],
    [6,'Dice que a las 23:00 tocaba el piano en el concierto (TMP-09 registra su entrada al auditorio a las 20:00 y su salida a las 23:30).']], cleared:9},
  {id:'ramiro', name:'Prof. Ramiro Paz', role:'Informática · administra los servidores · PRF-05', unlock:5, notes:[
    [5,'Entró dos veces a la Sala de Servidores de día (mantenimiento).'],
    [6,'Según los eventos, terminó su turno y salió del colegio a las 18:05.']], cleared:6},
  {id:'sofia', name:'Sofía Mendoza', role:'Estudiante de 5.º · tarjeta EST-07', unlock:7, notes:[
    [7,'Pasó la noche en el Laboratorio de Química (segundo piso).'],
    [8,'No registró ninguna salida entre las 23:00 y las 23:20.'],
    [9,'Su experimento registró actividad a las 22:58 y 23:25.']], cleared:9},
  {id:'tomas', name:'Tomás Gutiérrez', role:'Estudiante de 5.º · tarjeta EST-08', unlock:7, notes:[
    [7,'Estaba en la Biblioteca esa noche.'],
    [8,'Salió de la biblioteca a las 23:10.'],
    [9,'A las 23:12 compraba en la máquina expendedora del primer piso.']], cleared:9}
];

/* ---------------- MISIONES ---------------- */
const L1='Nivel 1 · Detective novato', L2='Nivel 2 · Investigador', L3='Nivel 3 · Analista', L4='Nivel 4 · Detective avanzado', L5='Nivel 5 · Experto forense', L6='Nivel 6 · Maestro SQL';
const MISSIONS = [
{ id:'m1', level:L1, title:'El archivo del colegio', map:[7],
  concepts:[
    {k:'Base de datos',d:'Un archivo organizado de información. Está formada por tablas.'},
    {k:'Tabla, fila y columna',d:'Una tabla es como una hoja de cálculo: cada columna es una característica (nombre, promedio…) y cada fila es un registro (un estudiante).'},
    {k:'SELECT * FROM',d:'Pide todas las columnas (*) de una tabla.',ex:'SELECT * FROM aulas;'}],
  dialog:[
    {who:'ortega',text:'Primero lo primero: conozcamos a los estudiantes. Necesito ver la lista completa.'},
    {who:'byte',text:'Para pedirle datos a la base de datos usamos SQL. Mira el concepto de abajo y escribe tu primera consulta en la terminal.'}],
  lesson:`<p>Una <b>base de datos</b> es como un archivador. Cada cajón es una <b>tabla</b>: <code>estudiantes</code>, <code>profesores</code>, <code>aulas</code>…</p>
<table><tr><th>id</th><th>nombre</th><th>piso</th></tr><tr><td>1</td><td>Auditorio Principal</td><td>1</td></tr><tr><td>4</td><td>Biblioteca</td><td>2</td></tr></table>
<p>Las <b>columnas</b> (id, nombre, piso) son las características; cada <b>fila</b> es un registro.</p>
<p>Para leer una tabla usamos dos palabras clave:</p>
<ul><li><code>SELECT</code> → qué columnas quiero ver. El asterisco <code>*</code> significa «todas».</li><li><code>FROM</code> → de qué tabla.</li></ul>
<pre>SELECT * FROM aulas;</pre><p class="muted">El punto y coma final es opcional. Las palabras clave pueden ir en mayúsculas o minúsculas.</p>`,
  objective:'Muestra <b>todas las columnas</b> y <b>todas las filas</b> de la tabla <code>estudiantes</code>.',
  chips:['SELECT','*','FROM','estudiantes'],
  hints:['Necesitas dos palabras clave: una para elegir columnas y otra para indicar la tabla.','El asterisco <code>*</code> significa «todas las columnas» y la tabla se llama <code>estudiantes</code>.','La estructura es: <code>SELECT ___ FROM ___________;</code>'],
  check:{ref:'SELECT * FROM estudiantes', keys:['id'], exactCols:true},
  success:[{who:'byte',text:'¡Tu primera consulta! <code>SELECT *</code> pidió todas las columnas y <code>FROM estudiantes</code> indicó la tabla. Obtuviste 10 filas: 10 estudiantes.'},
           {who:'ortega',text:'Fíjate en la columna <code>estado_registro</code>. Hay valores que no son como los demás…'}],
  clue:{t:'La lista de estudiantes',d:'El colegio tiene 10 estudiantes. La columna estado_registro indica si su expediente académico está activo.'}},

{ id:'m2', level:L1, title:'Solo lo necesario', map:[7],
  concepts:[{k:'SELECT columnas',d:'Elige solo algunas columnas, separadas por comas. Aparecen en el orden en que las escribas.',ex:'SELECT nombre, piso FROM aulas;'}],
  dialog:[{who:'ortega',text:'Demasiada información nubla el juicio. Quiero ver solo nombres, apellidos y promedios.'},
          {who:'byte',text:'En lugar de <code>*</code> puedes escribir los nombres de las columnas que quieres, separadas por comas.'}],
  lesson:`<p>El <code>*</code> trae todo, pero a veces solo necesitas algunas columnas. Escríbelas separadas por <b>comas</b>:</p>
<pre>SELECT nombre, piso FROM aulas;</pre>
<p>Los nombres de las columnas deben escribirse exactamente como aparecen en la tabla (puedes verlos en el panel <b>Base de datos</b>).</p>`,
  objective:'Muestra solo las columnas <code>nombre</code>, <code>apellido</code> y <code>promedio</code> de todos los estudiantes.',
  chips:['SELECT','nombre',',','apellido','promedio','FROM','estudiantes'],
  hints:['Reemplaza el <code>*</code> por la lista de columnas que necesitas.','Separa cada columna con una coma: <code>columna1, columna2, …</code>','La estructura es: <code>SELECT ______, ________, ________ FROM estudiantes;</code>'],
  check:{ref:'SELECT nombre, apellido, promedio FROM estudiantes', keys:['nombre','apellido','promedio'], exactCols:true},
  success:[{who:'byte',text:'Exacto. Al nombrar columnas concretas, el resultado muestra solo lo que pediste y en ese orden. Menos ruido, más claridad.'},
           {who:'ortega',text:'Los promedios van de 0 a 20. Dos de ellos están muy por encima del resto… lo recordaremos.'}],
  clue:{t:'Promedios',d:'Las notas van de 0 a 20. Hay dos promedios que destacan claramente.'}},

{ id:'m3', level:L2, title:'El registro fantasma', map:[7],
  concepts:[{k:'WHERE',d:'Filtra filas: solo aparecen las que cumplen la condición. Los textos van entre comillas simples.',ex:"SELECT * FROM aulas WHERE piso = 2;"}],
  dialog:[{who:'ortega',text:'El sistema no borró el registro del todo: lo marcó como <i>eliminado</i> y ocultó sus notas. Encuéntralo.'},
          {who:'byte',text:'Para quedarte solo con algunas filas, usa <code>WHERE</code> seguido de una condición.'}],
  lesson:`<p><code>WHERE</code> funciona como un filtro: solo pasan las filas que cumplen la condición.</p>
<pre>SELECT * FROM aulas WHERE piso = 2;</pre>
<p>Si comparas con un <b>texto</b>, escríbelo entre <b>comillas simples</b> y exactamente igual que en la tabla:</p>
<pre>SELECT * FROM aulas WHERE tipo = 'clase';</pre>`,
  objective:'Encuentra al estudiante cuyo <code>estado_registro</code> es <code>\'eliminado\'</code>.',
  chips:['SELECT','*','FROM','estudiantes','WHERE','estado_registro','=',"'eliminado'"],
  hints:['Empieza como en la misión 1 y añade un filtro al final con <code>WHERE</code>.','La condición compara la columna <code>estado_registro</code> con el texto <code>\'eliminado\'</code> (con comillas simples).','La estructura es: <code>SELECT * FROM estudiantes WHERE _______________ = \'_________\';</code>'],
  check:{ref:"SELECT * FROM estudiantes WHERE estado_registro = 'eliminado'", keys:['nombre']},
  success:[{who:'byte',text:'<code>WHERE</code> revisó las 10 filas y solo dejó pasar la que cumplía <code>estado_registro = \'eliminado\'</code>.'},
           {who:'ortega',text:'Valeria Ríos, tarjeta EST-05, promedio 19.4. Alguien quería que desapareciera de la competencia. La pregunta es: ¿quién ganaba con eso?'}],
  clue:{t:'La víctima',d:'Valeria Ríos (EST-05), promedio 19.4. Su registro aparece como «eliminado».'}},

{ id:'m4', level:L2, title:'¿A quién le conviene?', map:[7],
  concepts:[{k:'Operadores de comparación',d:'= igual, <> distinto, > mayor, < menor, >= mayor o igual, <= menor o igual.',ex:'SELECT * FROM aulas WHERE piso >= 2;'},
            {k:'ORDER BY',d:'Ordena los resultados. ASC de menor a mayor (por defecto); DESC de mayor a menor.',ex:'SELECT * FROM aulas ORDER BY nombre ASC;'}],
  dialog:[{who:'ortega',text:'Solo los estudiantes con promedio de 18 o más podían aspirar a la Beca Horizonte. Quiero verlos ordenados del mejor al peor.'}],
  lesson:`<p>Además de <code>=</code> puedes comparar números con:</p>
<table><tr><th>Operador</th><th>Significa</th></tr><tr><td><code>&gt;</code> / <code>&lt;</code></td><td>mayor / menor que</td></tr><tr><td><code>&gt;=</code> / <code>&lt;=</code></td><td>mayor o igual / menor o igual</td></tr><tr><td><code>&lt;&gt;</code></td><td>distinto de</td></tr></table>
<p>Para ordenar, añade <code>ORDER BY</code> al final. <code>DESC</code> ordena de mayor a menor; <code>ASC</code> (por defecto) de menor a mayor.</p>
<pre>SELECT nombre, piso FROM aulas
WHERE piso >= 1
ORDER BY piso DESC;</pre>
<p class="muted">El orden importa: SELECT → FROM → WHERE → ORDER BY.</p>`,
  objective:'Muestra <code>nombre</code>, <code>apellido</code> y <code>promedio</code> de los estudiantes con promedio <b>mayor o igual a 18</b>, ordenados del promedio <b>más alto al más bajo</b>.',
  chips:['SELECT','FROM','estudiantes','WHERE','promedio','>=','18','ORDER BY','DESC'],
  hints:['Necesitas un filtro (<code>WHERE</code>) y un orden (<code>ORDER BY</code>). Primero va el filtro.','«Mayor o igual» se escribe <code>&gt;=</code>. Para ordenar de mayor a menor usa <code>DESC</code>.','La estructura es: <code>SELECT nombre, apellido, promedio FROM estudiantes WHERE ________ &gt;= __ ORDER BY ________ ____;</code>'],
  check:{ref:'SELECT nombre, apellido, promedio FROM estudiantes WHERE promedio >= 18 ORDER BY promedio DESC', keys:['nombre'], ordered:true},
  success:[{who:'byte',text:'<code>WHERE promedio &gt;= 18</code> filtró a los candidatos y <code>ORDER BY promedio DESC</code> puso primero el promedio más alto.'},
           {who:'ortega',text:'Solo dos finalistas: Valeria y <b>Bruno Castañeda</b>. Sin el registro de Valeria, Bruno gana la beca. Eso es un motivo… pero un motivo no es una prueba.'}],
  clue:{t:'Un posible motivo',d:'Bruno Castañeda (18.9) es el único rival de Valeria por la Beca Horizonte.'}},

{ id:'m5', level:L2, title:'La puerta de los secretos', map:[6],
  concepts:[{k:'AND · OR · NOT',d:'Combinan condiciones. AND: se deben cumplir todas. OR: basta con una. NOT: niega una condición.',ex:"SELECT * FROM aulas WHERE piso = 2 AND tipo = 'estudio';"}],
  dialog:[{who:'ramiro',text:'Soy Ramiro Paz, administro los servidores. El registro se borró desde la terminal de la <b>Sala de Servidores</b>: es el aula con <code>id = 6</code>.'},
          {who:'ortega',text:'Cada puerta del colegio se abre con tarjeta y queda registrada en la tabla <code>accesos</code>. Revisemos quién entró ahí el día del incidente.'}],
  lesson:`<p>Con <code>AND</code> exiges que se cumplan <b>varias</b> condiciones a la vez:</p>
<pre>SELECT * FROM aulas
WHERE piso = 2 AND tipo = 'estudio';</pre>
<ul><li><code>AND</code>: deben cumplirse todas.</li><li><code>OR</code>: basta con que se cumpla una.</li><li><code>NOT</code>: invierte una condición (<code>NOT piso = 1</code>).</li></ul>
<p>En la tabla <code>accesos</code> las fechas tienen el formato <code>'AAAA-MM-DD'</code> y van entre comillas: <code>'2026-03-14'</code>.</p>`,
  objective:'Muestra todos los registros de <code>accesos</code> de la Sala de Servidores (<code>aula_id = 6</code>) del día <code>\'2026-03-14\'</code>.',
  chips:['SELECT','*','FROM','accesos','WHERE','aula_id','=','6','AND','fecha',"'2026-03-14'"],
  hints:['Necesitas dos condiciones en el <code>WHERE</code>: una para el aula y otra para la fecha.','Une las dos condiciones con <code>AND</code>. La fecha es texto, así que va entre comillas simples.','La estructura es: <code>SELECT * FROM accesos WHERE aula_id = _ AND _____ = \'__________\';</code>'],
  check:{ref:"SELECT * FROM accesos WHERE aula_id = 6 AND fecha = '2026-03-14'", keys:['tarjeta','hora']},
  success:[{who:'byte',text:'<code>AND</code> exigió las dos cosas: aula 6 <b>y</b> fecha 14 de marzo. Sin la fecha, también habrías visto accesos del día 13.'},
           {who:'ortega',text:'PRF-05 es Ramiro, de mantenimiento por la mañana y la tarde. Pero mira las 23:05… la tarjeta <b>PRF-03</b>. Esa es del <b>Prof. Héctor Molina</b>, asesor de la beca.'}],
  clue:{t:'Entrada nocturna',d:'La tarjeta PRF-03 (Prof. Molina) entró a la Sala de Servidores a las 23:05 y salió a las 23:14.'}},

{ id:'m6', level:L3, title:'La tarjeta perdida', map:[3,6],
  concepts:[{k:'LIKE',d:'Busca textos que siguen un patrón. % = cualquier cantidad de caracteres; _ = exactamente un carácter.',ex:"SELECT * FROM aulas WHERE nombre LIKE '%Sala%';"}],
  dialog:[{who:'molina',text:'¿Yo? ¡Imposible! Esa noche estaba en el concierto. Y además… esa tarjeta la <b>perdí</b> por la tarde. ¡Revisen los eventos!'},
          {who:'byte',text:'La tabla <code>eventos</code> tiene descripciones largas. Para buscar textos que <i>contengan</i> algo usamos <code>LIKE</code>.'}],
  lesson:`<p><code>=</code> exige que el texto sea idéntico. <code>LIKE</code> busca por <b>patrón</b>:</p>
<ul><li><code>%</code> representa cualquier cantidad de caracteres (incluso ninguno).</li><li><code>_</code> representa exactamente un carácter.</li></ul>
<pre>-- nombres que contienen "Sala" en cualquier parte
SELECT * FROM aulas WHERE nombre LIKE '%Sala%';</pre>
<p class="muted">'Sala%' = empieza con Sala · '%Sala' = termina con Sala · '%Sala%' = contiene Sala.</p>`,
  objective:'Busca en <code>eventos</code> todos los eventos cuya <code>descripcion</code> <b>contenga</b> el texto <code>PRF-03</code>.',
  chips:['SELECT','*','FROM','eventos','WHERE','descripcion','LIKE',"'%PRF-03%'"],
  hints:['No sabes en qué parte de la descripción aparece el código, así que necesitas un patrón con comodines.','Pon <code>%</code> antes y después del texto buscado: <code>\'%PRF-03%\'</code>.','La estructura es: <code>SELECT * FROM eventos WHERE ___________ LIKE \'%______%\';</code>'],
  check:{ref:"SELECT * FROM eventos WHERE descripcion LIKE '%PRF-03%'", keys:['descripcion']},
  success:[{who:'byte',text:'<code>LIKE \'%PRF-03%\'</code> encontró todas las descripciones que mencionan la tarjeta, sin importar dónde estaba el código dentro del texto.'},
           {who:'ortega',text:'Molina reportó la pérdida a las 17:45 y desde las 18:00 usa la tarjeta temporal TMP-09. Alguien <b>tomó</b> PRF-03 y la usó para borrar el registro a las 23:12. Y Ramiro salió del colegio a las 18:05: queda descartado.'}],
  clue:{t:'Tarjeta robada',d:'PRF-03 se perdió antes de las 17:45. A las 23:12 alguien borró el registro de EST-05 usando esa tarjeta.'}},

{ id:'m7', level:L3, title:'El segundo piso', map:[4,5,6],
  concepts:[{k:'IN',d:'Atajo para comparar con una lista de valores: aula_id IN (4, 5, 6).',ex:'SELECT * FROM aulas WHERE id IN (4, 5, 6);'},
            {k:'DISTINCT',d:'Elimina las filas repetidas del resultado.',ex:'SELECT DISTINCT piso FROM aulas;'}],
  dialog:[{who:'ortega',text:'La Sala de Servidores está en el segundo piso, junto a la Biblioteca (aula 4) y el Laboratorio (aula 5). Quien usó la tarjeta tenía que estar cerca.'},
          {who:'ortega',text:'Quiero la lista de tarjetas que se movieron por esas aulas desde las 22:00 del día 14. Cada tarjeta una sola vez.'}],
  lesson:`<p><code>IN</code> compara con una lista. Estas dos consultas son equivalentes:</p>
<pre>SELECT * FROM aulas WHERE id = 4 OR id = 5 OR id = 6;
SELECT * FROM aulas WHERE id IN (4, 5, 6);</pre>
<p><code>DISTINCT</code> va justo después de <code>SELECT</code> y elimina las filas repetidas:</p>
<pre>SELECT DISTINCT piso FROM aulas;</pre>
<p class="muted">Las horas están guardadas como texto 'HH:MM', así que <code>hora &gt;= '22:00'</code> funciona perfectamente.</p>`,
  objective:'Muestra la lista <b>sin repetidos</b> de <code>tarjeta</code> que registraron accesos en las aulas <b>4, 5 o 6</b> el <code>\'2026-03-14\'</code> con <code>hora &gt;= \'22:00\'</code>.',
  chips:['SELECT','DISTINCT','tarjeta','FROM','accesos','WHERE','aula_id','IN','(4, 5, 6)','AND','fecha','hora',">= '22:00'"],
  hints:['Selecciona solo la columna <code>tarjeta</code> y elimina duplicados con <code>DISTINCT</code>.','Tienes tres condiciones unidas por <code>AND</code>: aula (con <code>IN</code>), fecha y hora.','La estructura es: <code>SELECT DISTINCT tarjeta FROM accesos WHERE aula_id IN (_, _, _) AND fecha = \'__________\' AND hora &gt;= \'_____\';</code>'],
  check:{ref:"SELECT DISTINCT tarjeta FROM accesos WHERE aula_id IN (4,5,6) AND fecha = '2026-03-14' AND hora >= '22:00'", keys:['tarjeta'], distinct:true},
  success:[{who:'byte',text:'<code>IN (4, 5, 6)</code> cubrió las tres aulas de una vez y <code>DISTINCT</code> dejó cada tarjeta una sola vez, aunque se usara varias veces.'},
           {who:'ortega',text:'Además de la tarjeta robada, había tres estudiantes en el segundo piso: <b>EST-02</b> (Bruno), <b>EST-07</b> (Sofía Mendoza) y <b>EST-08</b> (Tomás Gutiérrez). Abrí sus expedientes.'}],
  clue:{t:'Testigos del segundo piso',d:'Esa noche estuvieron en el segundo piso: Bruno (EST-02), Sofía (EST-07), Tomás (EST-08) y la tarjeta robada PRF-03.'}},

{ id:'m8', level:L3, title:'Diecinueve minutos', map:[4,5,6],
  concepts:[{k:'BETWEEN',d:'Filtra valores dentro de un rango, incluyendo los extremos.',ex:'SELECT * FROM estudiantes WHERE promedio BETWEEN 15 AND 17;'},
            {k:'LIMIT',d:'Limita cuántas filas se muestran (en SQL Server se usa TOP).',ex:'SELECT * FROM accesos LIMIT 5;'}],
  dialog:[{who:'ortega',text:'La tarjeta robada entró a las 23:05 y salió a las 23:14. Quien la usó tuvo que <b>salir</b> de donde estaba justo antes y <b>volver</b> justo después.'},
          {who:'ortega',text:'Muéstrame todos los movimientos entre las 23:00 y las 23:20 de esa noche, en orden cronológico.'}],
  lesson:`<p><code>BETWEEN</code> filtra un rango (incluye ambos extremos):</p>
<pre>SELECT * FROM estudiantes
WHERE promedio BETWEEN 15 AND 17;</pre>
<p>Es lo mismo que <code>promedio &gt;= 15 AND promedio &lt;= 17</code>, pero más legible. También sirve con textos como horas: <code>hora BETWEEN '10:00' AND '11:00'</code>.</p>
<p><b>Extra:</b> <code>LIMIT 5</code> al final muestra solo las primeras 5 filas. En SQL Server se escribe <code>SELECT TOP 5 …</code>.</p>`,
  objective:'Muestra los registros de <code>accesos</code> del <code>\'2026-03-14\'</code> con <code>hora</code> <b>entre</b> <code>\'23:00\'</code> y <code>\'23:20\'</code>, <b>ordenados por hora</b>.',
  chips:['SELECT','*','FROM','accesos','WHERE','fecha','=',"'2026-03-14'",'AND','hora','BETWEEN',"'23:00'","'23:20'",'ORDER BY'],
  hints:['Combina un filtro de fecha con <code>AND</code> y un rango de horas con <code>BETWEEN … AND …</code>.','Termina con <code>ORDER BY hora</code> para verlo cronológicamente.','La estructura es: <code>SELECT * FROM accesos WHERE fecha = \'2026-03-14\' AND hora BETWEEN \'_____\' AND \'_____\' ORDER BY ____;</code>'],
  check:{ref:"SELECT * FROM accesos WHERE fecha = '2026-03-14' AND hora BETWEEN '23:00' AND '23:20' ORDER BY hora", keys:['tarjeta','hora'], ordered:true},
  success:[{who:'byte',text:'<code>BETWEEN \'23:00\' AND \'23:20\'</code> aisló la ventana del crimen y <code>ORDER BY hora</code> la convirtió en una línea de tiempo.'},
           {who:'ortega',text:'Sofía nunca salió del laboratorio. Pero <b>Bruno</b> salió de la biblioteca a las 23:01 y volvió a las 23:19, y <b>Tomás</b> salió a las 23:10. Uno de los dos… necesitamos saber qué hicieron.'}],
  clue:{t:'La ventana del crimen',d:'23:01 sale Bruno · 23:05 entra PRF-03 · 23:10 sale Tomás · 23:14 sale PRF-03 · 23:19 vuelve Bruno.'}},

{ id:'m9', level:L5, title:'Uniendo las piezas', map:[3,4,5,6],
  concepts:[{k:'INNER JOIN',d:'Une dos tablas usando una columna en común. Solo aparecen las filas que tienen pareja en ambas tablas.',ex:'SELECT e.nombre, a.hora\nFROM accesos a\nINNER JOIN estudiantes e ON a.tarjeta = e.tarjeta;'},
            {k:'Alias de tabla',d:'Un nombre corto para una tabla (FROM eventos ev) que permite escribir ev.columna.'}],
  dialog:[{who:'byte',text:'Los eventos guardan códigos de tarjeta, pero los nombres están en la tabla <code>estudiantes</code>. Es hora de aprender tu técnica más poderosa: <b>unir tablas</b>.'},
          {who:'ortega',text:'Quiero ver cada evento junto al nombre del estudiante que lo protagonizó. Ahí estará la verdad.'}],
  lesson:`<p><code>INNER JOIN</code> une dos tablas a través de una columna que comparten. Aquí, ambas tienen <code>tarjeta</code>:</p>
<pre>SELECT e.nombre, a.hora, a.tipo
FROM accesos a
INNER JOIN estudiantes e ON a.tarjeta = e.tarjeta;</pre>
<ul><li><code>accesos a</code> y <code>estudiantes e</code> son <b>alias</b>: nombres cortos para cada tabla.</li><li><code>ON</code> indica qué columnas deben coincidir.</li><li><code>e.nombre</code> significa «la columna nombre de la tabla e».</li></ul>
<p class="muted">Solo aparecen los eventos cuya tarjeta pertenece a un estudiante.</p>`,
  objective:'Une <code>eventos</code> con <code>estudiantes</code> por la columna <code>tarjeta</code> y muestra el <code>nombre</code> del estudiante, la <code>hora</code> y la <code>descripcion</code> de cada evento.',
  chips:['SELECT','e.nombre','ev.hora','ev.descripcion','FROM','eventos ev','INNER JOIN','estudiantes e','ON','ev.tarjeta = e.tarjeta'],
  hints:['Empieza con <code>FROM eventos ev</code> y luego añade <code>INNER JOIN estudiantes e ON …</code>.','La condición de unión es que la tarjeta del evento sea igual a la tarjeta del estudiante: <code>ev.tarjeta = e.tarjeta</code>.','La estructura es: <code>SELECT e.______, ev.____, ev.___________ FROM eventos ev INNER JOIN estudiantes e ON ev.tarjeta = e._______;</code>'],
  check:{ref:'SELECT e.nombre, ev.hora, ev.descripcion FROM eventos ev INNER JOIN estudiantes e ON ev.tarjeta = e.tarjeta', keys:['nombre','hora']},
  success:[{who:'byte',text:'El <code>JOIN</code> emparejó cada evento con su estudiante gracias a la columna <code>tarjeta</code>. Así pasamos de códigos a personas.'},
           {who:'ortega',text:'Ya tenemos todas las piezas: quién estuvo cerca de la tarjeta, quién se movió en la ventana del crimen y quién tiene coartada. Revisa los <b>Expedientes</b> y haz tu acusación.'}],
  clue:{t:'Coartadas',d:'Tomás compraba en el primer piso a las 23:12. El experimento de Sofía registró actividad a las 22:58 y 23:25. Bruno estuvo junto al escritorio de Molina (17:05) y en la Sala de Profesores (17:42), y pidió un libro de seguridad informática.'},
  accuse:true},

{ id:'m10', level:L6, title:'Restaurar la verdad', map:[6,7],
  concepts:[{k:'UPDATE … SET … WHERE',d:'Modifica datos existentes. ¡Sin WHERE cambia TODAS las filas!',ex:"UPDATE aulas SET tipo = 'estudio' WHERE id = 2;"},
            {k:'INSERT y DELETE',d:'INSERT INTO agrega filas nuevas; DELETE FROM elimina filas. Ambos se aprenden a fondo en el Nivel 6.',ex:"INSERT INTO aulas VALUES (8, 'Gimnasio', 1, 'deporte');\nDELETE FROM aulas WHERE id = 8;"}],
  dialog:[{who:'ramiro',text:'Les doy acceso de escritura a la base de datos. El registro de Valeria sigue ahí, solo está marcado como eliminado. Pueden reactivarlo.'},
          {who:'ramiro',text:'Pero <b>cuidado</b>: un <code>UPDATE</code> sin <code>WHERE</code> cambia <b>todas</b> las filas. Renato Flores, por ejemplo, está retirado y debe seguir así.'}],
  lesson:`<p>Hasta ahora solo <b>leímos</b> datos. <code>UPDATE</code> los <b>modifica</b>:</p>
<pre>UPDATE aulas
SET tipo = 'estudio'
WHERE id = 2;</pre>
<ul><li><code>UPDATE tabla</code> → qué tabla cambiar.</li><li><code>SET columna = valor</code> → el nuevo valor.</li><li><code>WHERE</code> → <b>qué filas</b>. ¡Sin él se cambian todas!</li></ul>
<p class="muted">Tranquilo: esta es una copia de práctica. Si algo sale mal, «Restaurar datos» la deja como al principio. Después puedes comprobar el cambio con un SELECT.</p>`,
  objective:'Cambia el <code>estado_registro</code> de Valeria Ríos (<code>id = 5</code>) a <code>\'activo\'</code> <b>sin modificar a ningún otro estudiante</b>.',
  chips:['UPDATE','estudiantes','SET','estado_registro','=',"'activo'",'WHERE','id','=','5'],
  hints:['Usa <code>UPDATE estudiantes SET …</code> y no olvides el <code>WHERE</code>.','El nuevo valor es el texto <code>\'activo\'</code> y la fila es la de <code>id = 5</code>.','La estructura es: <code>UPDATE estudiantes SET _______________ = \'______\' WHERE __ = _;</code>'],
  custom:'restore',
  success:[{who:'ramiro',text:'Registro restaurado. Las notas de Valeria vuelven a ser visibles para el comité de la beca.'},
           {who:'byte',text:'<code>UPDATE</code> cambió el valor y <code>WHERE id = 5</code> garantizó que solo se tocara una fila. Esa es la diferencia entre un detective y un desastre.'}],
  clue:{t:'Justicia restaurada',d:'El registro académico de Valeria Ríos vuelve a estar activo.'}}
];

const SECRET = { id:'secret', level:L4, title:'Caso secreto: el búho nocturno', map:[4],
  concepts:[{k:'COUNT',d:'Cuenta filas. COUNT(*) cuenta todas.',ex:'SELECT COUNT(*) FROM estudiantes;'},
            {k:'GROUP BY',d:'Agrupa filas con el mismo valor para calcular algo por grupo.',ex:'SELECT piso, COUNT(*) FROM aulas GROUP BY piso;'},
            {k:'HAVING',d:'Filtra grupos (como WHERE, pero después de agrupar).',ex:'SELECT piso, COUNT(*) FROM aulas GROUP BY piso HAVING COUNT(*) > 3;'}],
  dialog:[{who:'ortega',text:'Caso cerrado… casi. Ramiro dice que una tarjeta se movió muchísimo esa noche, más que cualquier otra. Quiero saber cuál.'},
          {who:'byte',text:'Esto es un adelanto del <b>Nivel 4</b>: contar y agrupar. Lee el concepto con calma.'}],
  lesson:`<p><code>COUNT(*)</code> cuenta filas. Con <code>GROUP BY</code> cuenta <b>por grupo</b>:</p>
<pre>SELECT piso, COUNT(*)
FROM aulas
GROUP BY piso;</pre>
<p>Esto devuelve una fila por piso con su cantidad de aulas. Para quedarte solo con algunos grupos usa <code>HAVING</code> (va después de GROUP BY):</p>
<pre>SELECT piso, COUNT(*) FROM aulas
GROUP BY piso
HAVING COUNT(*) &gt; 3;</pre>
<p class="muted">WHERE filtra filas antes de agrupar; HAVING filtra grupos después.</p>`,
  objective:'Del <code>\'2026-03-14\'</code> con <code>hora &gt;= \'22:00\'</code>, cuenta cuántos accesos tuvo cada <code>tarjeta</code> y muestra <b>solo las que tengan más de 2</b>. El resultado debe tener dos columnas: la tarjeta y su conteo.',
  chips:['SELECT','tarjeta',',','COUNT(*)','FROM','accesos','WHERE','AND','GROUP BY','HAVING','> 2'],
  hints:['Primero filtra con <code>WHERE</code> (fecha y hora), luego agrupa con <code>GROUP BY tarjeta</code>.','Para quedarte con los grupos grandes usa <code>HAVING COUNT(*) &gt; 2</code>.','La estructura es: <code>SELECT tarjeta, COUNT(*) FROM accesos WHERE fecha = \'2026-03-14\' AND hora &gt;= \'22:00\' GROUP BY _______ HAVING ________ &gt; 2;</code>'],
  check:{ref:"SELECT tarjeta, COUNT(*) FROM accesos WHERE fecha = '2026-03-14' AND hora >= '22:00' GROUP BY tarjeta HAVING COUNT(*) > 2", valueMode:true},
  success:[{who:'byte',text:'<code>GROUP BY</code> formó un grupo por tarjeta, <code>COUNT(*)</code> contó sus accesos y <code>HAVING</code> dejó solo los grupos con más de 2.'},
           {who:'ortega',text:'EST-02, cuatro movimientos en una noche. Nuestro búho nocturno era Bruno. Esto será útil en el juicio. Buen trabajo, detective: ya estás listo para el Nivel 4.'}],
  clue:{t:'El búho nocturno',d:'EST-02 (Bruno) registró 4 accesos después de las 22:00: más que nadie.'},
  xp:150 };

const ACCUSE = {
  bruno:{ok:true},
  tomas:{t:'Tomás tiene coartada',d:'A las 23:12, en el mismo minuto en que se borró el registro, Tomás compraba en la máquina expendedora del <b>primer piso</b>. No podía estar frente a la terminal del segundo piso.'},
  sofia:{t:'Sofía tiene coartada',d:'Su tarjeta muestra que no salió del laboratorio entre las 22:10 y las 23:45, y su experimento registró actividad a las 22:58 y 23:25.'},
  molina:{t:'Molina tiene coartada',d:'A las 23:00 tocaba el piano en el escenario con su tarjeta temporal TMP-09. Además, él mismo reportó la pérdida de PRF-03 a las 17:45.'},
  ramiro:{t:'Ramiro tiene coartada',d:'Terminó su turno y salió del colegio a las 18:05. Su tarjeta PRF-05 no registra ningún acceso nocturno.'}
};

const RANKS = [[0,'Detective novato'],[300,'Investigador'],[600,'Analista'],[900,'Detective avanzado'],[1200,'Experto forense'],[1500,'Maestro SQL']];
const BADGES = [
  {id:'first',ic:'🔍',n:'Primera huella',d:'Ejecuta tu primera consulta.'},
  {id:'clean3',ic:'🧠',n:'Instinto puro',d:'Resuelve 3 misiones sin pedir pistas.'},
  {id:'persist',ic:'🔥',n:'Perseverancia',d:'Resuelve una misión después de 3 o más intentos fallidos.'},
  {id:'accuse',ic:'⚖️',n:'Ojo de halcón',d:'Acusa al culpable al primer intento.'},
  {id:'surgeon',ic:'🩺',n:'Mano firme',d:'Restaura el registro sin errores.'},
  {id:'closed',ic:'📁',n:'Caso cerrado',d:'Completa el Capítulo 1.'},
  {id:'explorer',ic:'🧭',n:'Curiosidad',d:'Ejecuta 10 consultas en el Archivo libre.'},
  {id:'secret',ic:'🦉',n:'Búho nocturno',d:'Resuelve el caso secreto.'}
];
const LEVELS = [
  {n:1,t:'Detective novato',c:['Base de datos','Tablas','SELECT','FROM','SELECT *'],m:['m1','m2']},
  {n:2,t:'Investigador',c:['WHERE','Comparaciones','AND / OR / NOT','ORDER BY'],m:['m3','m4','m5']},
  {n:3,t:'Analista',c:['LIKE','IN','BETWEEN','DISTINCT','LIMIT'],m:['m6','m7','m8']},
  {n:4,t:'Detective avanzado',c:['COUNT','SUM','AVG','MIN / MAX','GROUP BY','HAVING'],m:['secret']},
  {n:5,t:'Experto forense',c:['INNER JOIN','LEFT JOIN','Relaciones','Subconsultas'],m:['m9']},
  {n:6,t:'Maestro SQL',c:['INSERT','UPDATE','DELETE','CREATE TABLE','Claves'],m:['m10']}
];
const LEARNED = {m1:['Base de datos','Tablas','SELECT','FROM','SELECT *'],m3:['WHERE'],m4:['Comparaciones','ORDER BY'],m5:['AND / OR / NOT'],m6:['LIKE'],m7:['IN','DISTINCT'],m8:['BETWEEN','LIMIT'],m9:['INNER JOIN','Relaciones'],m10:['UPDATE'],secret:['COUNT','GROUP BY','HAVING']};
