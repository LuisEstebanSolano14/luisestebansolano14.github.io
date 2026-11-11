// Servidor local mínimo, sin dependencias. Uso: npm start  (o: node scripts/serve.js 8080)
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2] || process.env.PORT || 5173);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.woff2':'font/woff2', '.json':'application/json', '.sql':'text/plain; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.ico':'image/x-icon', '.md':'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, path.normalize(p));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Prohibido'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, () => console.log(`\n  SQL Detective listo en  http://localhost:${port}\n  (Ctrl + C para detener)\n`));
