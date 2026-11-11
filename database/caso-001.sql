-- SQL Detective · Caso 001: El misterio del estudiante desaparecido
-- Generado desde js/data.js con: npm run export-db

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
