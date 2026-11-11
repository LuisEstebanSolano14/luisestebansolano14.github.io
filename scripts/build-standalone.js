// Genera standalone/sql-detective-2.html: UN solo archivo con todo incrustado
// (estilos, fuentes, imágenes WebP, motor SQLite y juego). Uso: npm run build
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
let html = read('index.html');
const fonts = read('css/fonts.css').replace(/url\(\.\.\/assets\/fonts\/([^)]+)\)/g, (_, f) =>
  `url(data:font/woff2;base64,${fs.readFileSync(path.join(root, 'assets/fonts', f)).toString('base64')})`);
const inline = s => s.replace(/<\/script/gi, '<\\/script');
const swap = (needle, replacement) => {
  if (!html.includes(needle)) throw new Error('No se encontró en index.html: ' + needle);
  html = html.split(needle).join(replacement);
};
// imágenes: todas las rutas de js/assets.js (tamaño grande y reducido) como datos base64
const assetsSrc = read('js/assets.js');
const base = assetsSrc.match(/ASSET_BASE = '([^']+)'/)[1];
const paths = [...assetsSrc.matchAll(/'([A-Z]+-\d+[a-z]?)': '([^']+)'/g)].map(m => m[2]);
const map = {};
let bytes = 0, missing = [];
for (const p of paths) for (const suf of ['', '-sm']) {
  const rel = base + p + suf + '.webp', file = path.join(root, rel);
  if (!fs.existsSync(file)) { missing.push(rel); continue; }
  const buf = fs.readFileSync(file); bytes += buf.length;
  map[rel] = 'data:image/webp;base64,' + buf.toString('base64');
}
if (missing.length) throw new Error('Faltan imágenes: ' + missing.join(', '));
swap('<link rel="stylesheet" href="css/fonts.css">', `<style>\n${fonts}</style>`);
swap('<link rel="stylesheet" href="css/os.css">', `<style>\n${read('css/os.css')}</style>`);
swap('<script src="js/assets.js"></script>', `<script>window.__INLINE_IMG=${JSON.stringify(map)};</script>\n<script>\n${inline(assetsSrc)}\n</script>`);
for (const src of ['vendor/sql-asm.js', 'js/data.js', 'js/engine.js', 'js/story.js', 'js/os.js', 'js/apps.js', 'js/game.js'])
  swap(`<script src="${src}"></script>`, `<script>\n${inline(read(src))}\n</script>`);
fs.mkdirSync(path.join(root, 'standalone'), { recursive: true });
const out = path.join(root, 'standalone', 'sql-detective-2.html');
fs.writeFileSync(out, html);
console.log(`Creado ${path.relative(root, out)} (${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB; ${Object.keys(map).length} imágenes, ${(bytes / 1024 / 1024).toFixed(2)} MB en WebP)`);
