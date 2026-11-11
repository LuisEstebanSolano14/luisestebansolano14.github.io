// Exporta la base de datos del Caso 001 (definida en js/data.js) a:
//   database/caso-001.sql     -> script SQL legible
//   database/caso-001.sqlite  -> archivo SQLite para abrir con DB Browser for SQLite, DBeaver, etc.
// Uso: npm run export-db
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'js/data.js'), 'utf8');
const m = src.match(/const SEED = `([\s\S]*?)`;/);
if (!m) throw new Error('No se encontró SEED en js/data.js');
const seed = m[1].trim() + '\n';
fs.mkdirSync(path.join(root, 'database'), { recursive: true });
fs.writeFileSync(path.join(root, 'database/caso-001.sql'), '-- SQL Detective · Caso 001: El misterio del estudiante desaparecido\n-- Generado desde js/data.js con: npm run export-db\n\n' + seed);
const initSqlJs = require(path.join(root, 'vendor/sql-asm.js'));
initSqlJs().then(SQL => {
  const db = new SQL.Database(); db.run(seed);
  fs.writeFileSync(path.join(root, 'database/caso-001.sqlite'), Buffer.from(db.export()));
  console.log('Exportados database/caso-001.sql y database/caso-001.sqlite');
});
