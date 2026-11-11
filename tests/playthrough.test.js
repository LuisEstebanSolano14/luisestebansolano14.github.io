// SQL Detective 2.0 — prueba automática: juega el Capítulo 1 completo dentro de Lumen OS y verifica
// motor SQL, misiones, pistas, imágenes, ventanas, Modo estudio, guardado, migración desde la v1 y móvil.
// Requisitos: npm install  y  npx playwright install chromium
// Uso: npm test                 -> prueba index.html
//      npm test -- standalone   -> prueba standalone/sql-detective-2.html
//      npm test -- http://localhost:5173  -> prueba la versión servida con npm start
// Variable opcional CHROME_PATH para usar un Chrome ya instalado.
const { chromium } = require('playwright');
const path = require('path');
const target = process.argv[2] === 'standalone' ? 'standalone/sql-detective-2.html' : 'index.html';
const url = /^https?:/.test(process.argv[2] || '') ? process.argv[2] : 'file://' + path.resolve(__dirname, '..', target).replace(/\\/g, '/');
let fails = 0, passes = 0;
const check = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); cond ? passes++ : fails++; };

const SOLS = [
  "SELECT * FROM estudiantes",
  "SELECT nombre, apellido, promedio FROM estudiantes",
  "SELECT nombre FROM estudiantes WHERE estado_registro = 'eliminado'",
  "SELECT nombre, apellido, promedio FROM estudiantes WHERE promedio >= 18 ORDER BY promedio DESC",
  "SELECT * FROM accesos WHERE fecha = '2026-03-14' AND aula_id = 6",
  "SELECT * FROM eventos WHERE descripcion LIKE '%PRF-03%'",
  "SELECT DISTINCT tarjeta FROM accesos WHERE aula_id IN (4,5,6) AND fecha='2026-03-14' AND hora >= '22:00'",
  "SELECT * FROM accesos WHERE fecha='2026-03-14' AND hora BETWEEN '23:00' AND '23:20' ORDER BY hora",
  "SELECT e.nombre, ev.hora, ev.descripcion FROM eventos ev INNER JOIN estudiantes e ON ev.tarjeta = e.tarjeta"];

(async () => {
  console.log('Probando', target);
  const opts = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
  const browser = await chromium.launch(opts);
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url);
  await page.evaluate(() => localStorage.clear()); await page.reload();
  const S = () => page.evaluate(() => window.__sqld.S);
  const rect = id => page.evaluate(i => { const r = document.querySelector(`.win[data-app=${i}]`); if (!r || r.classList.contains('min')) return null; const b = r.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }, id);
  const overlap = (a, b) => a && b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const run = async q => { await page.evaluate(() => window.__sqld.OS.focus('terminal')); await page.fill('#sql', q); await page.click('#runBtn'); await page.waitForTimeout(120); return (await page.textContent('#feedback')).replace(/\s+/g, ' '); };
  const ok = t => t.includes('Correcto');
  const inWin = async (id, sel) => { await page.evaluate(i => window.__sqld.OS.focus(i), id); await page.click(`.win[data-app=${id}] ${sel}`); };
  const cineAll = async () => { while (await page.isVisible('#cine.on')) { await page.click('#cineNext'); await page.waitForTimeout(60); } };

  /* 1. arranque, inicio de sesión, cinemática y guía */
  await page.waitForSelector('#boot.on', { timeout: 30000 });
  await page.keyboard.press('Space');
  await page.waitForSelector('#login.on');
  check(await page.evaluate(() => getComputedStyle(document.getElementById('loginBg')).backgroundImage.includes(IMG('I-01').slice(-60))), 'Inicio de sesión con la foto de la agencia (I-01)');
  await page.fill('#agentName', 'Agurto'); await page.click('#loginBtn');
  await page.waitForSelector('#cine.on');
  const scenes = await page.$$eval('#cineDots i', d => d.length);
  check(scenes === 7, 'Cinemática de introducción con 7 escenas fotográficas');
  await cineAll();
  await page.waitForSelector('.win[data-app=guia]');
  check(await page.isVisible('.win[data-app=correo]'), 'El correo de bienvenida de Ortega se abre al empezar');
  for (let i = 0; i < 5; i++) await page.click('.win[data-app=guia] [data-n]');
  await page.waitForTimeout(300);
  check(!(await page.$('.win[data-app=guia]')), 'La guía de bienvenida se completa y se cierra');

  /* 2. Modo estudio */
  const R = { m: await rect('mision'), t: await rect('terminal'), d: await rect('db'), e: await rect('evidencias') };
  check(R.m && R.t && R.d && R.e, 'Modo estudio abre Misión, Terminal, Base de datos y Evidencias');
  check(!overlap(R.m, R.t) && !overlap(R.t, R.d) && !overlap(R.t, R.e) && !overlap(R.d, R.e) && !overlap(R.m, R.d), 'En Modo estudio ninguna ventana tapa a otra');
  check(R.t.w >= 520, `La terminal tiene espacio cómodo (${Math.round(R.t.w)} px de ancho)`);

  /* 3. errores explicados y pistas de BYTE */
  check((await run('SELEC * FROM estudiantes')).includes('error de sintaxis'), 'Detecta errores de sintaxis');
  check((await run('SELECT * FROM estudiante')).includes('estudiantes'), 'Sugiere el nombre correcto de la tabla');
  check((await run('SELECT nombres FROM estudiantes')).includes('¿Quisiste decir <code>nombre</code>') || (await page.textContent('#feedback')).includes('Quisiste decir nombre'), 'Sugiere el nombre correcto de una columna');
  await inWin('mision', '[data-hint]');
  check((await page.$$('.win[data-app=mision] .hint')).length === 1, 'BYTE entrega la primera pista');
  await inWin('mision', '[data-hint]');
  check((await page.textContent('.win[data-app=mision]')).includes('Recompensa actual: 85 XP'), 'La segunda pista descuenta 15 XP (la primera es gratis)');
  check((await run('SELECT nombre FROM estudiantes')).includes('columnas'), 'Rechaza un resultado incompleto en la misión 1');

  /* 4. misiones 1 a 9 con SQL real */
  for (let i = 0; i < SOLS.length; i++) {
    const fb = await run(SOLS[i]);
    check(ok(fb), `Misión ${i + 1} resuelta`);
    if (i === 4) check((await page.textContent('#results')).includes('PRF-03'), 'Misión 5: el resultado real de SQLite muestra la tarjeta PRF-03');
    if (i < 8) {
      await inWin('mision', '[data-go=next]'); await page.waitForTimeout(80);
      const sync = await page.evaluate(n => ({ h: document.querySelector('.win[data-app=mision] h2').textContent, want: window.__sqld.MISSIONS[n].title,
        cur: document.querySelector('.win[data-app=mision] .step.cur')?.dataset.step, term: document.getElementById('termPath').textContent, top: document.querySelector('.win[data-app=mision] .win-bd').scrollTop }), i + 1);
      check(sync.h === sync.want && sync.cur === String(i + 1) && sync.term.endsWith('m' + (i + 2)) && sync.top === 0, `Siguiente misión: la ventana Misión pasa sin cerrarla a la misión ${i + 2} («${sync.h}»), igual que la terminal`);
    }
  }
  // navegar con la barra de pasos y desde el correo, sin cerrar ventanas
  await inWin('mision', '[data-step="2"]'); await page.waitForTimeout(80);
  check((await page.textContent('.win[data-app=mision] h2')) === (await page.evaluate(() => window.__sqld.MISSIONS[2].title)) && (await page.textContent('#termPath')).endsWith('m3'), 'Saltar a la misión 3 desde la barra de pasos actualiza Misión y Terminal');
  await page.evaluate(() => window.__sqld.OS.open('correo', { mail: 'm:5' })); await inWin('correo', '[data-mact]'); await page.waitForTimeout(80);
  check((await page.textContent('.win[data-app=mision] h2')) === (await page.evaluate(() => window.__sqld.MISSIONS[5].title)), 'Abrir una misión desde el Correo actualiza la ventana Misión');
  await inWin('terminal', '[data-mode=sandbox]'); await page.waitForTimeout(80);
  check((await page.textContent('.win[data-app=mision]')).includes('Practica sin presión'), 'Cambiar a Archivo libre actualiza la ventana Misión');
  await inWin('terminal', '[data-mode=mission]');
  await inWin('mision', '[data-step="8"]'); await page.waitForTimeout(80);
  const st = await S();
  check(st.done.m9 && st.xp > 800, `XP acumulada tras 9 misiones: ${st.xp}`);
  check(await page.isVisible('.dicon[data-open=fiscal]'), 'Aparece la app «Informe al fiscal» en el escritorio');

  /* 5. imágenes integradas en las apps */
  for (const a of ['expedientes', 'camaras', 'plano', 'timeline', 'correo', 'perfil', 'manual', 'notas']) { await page.evaluate(id => window.__sqld.OS.open(id), a); await page.waitForTimeout(150); }
  await inWin('expedientes', '[data-sus=bruno]');
  check((await page.textContent('.win[data-app=expedientes]')).includes('Bruno Castañeda'), 'Expedientes muestra el expediente de Bruno');
  await page.evaluate(() => window.__sqld.GAME.openEvidence('E-07'));
  await page.waitForSelector('.win[data-app=visor] img');
  await page.evaluate(() => window.__sqld.GAME.openEvidence('E-06'));
  check(await page.isVisible('.win[data-app=visor] .crt'), 'E-06 (registro de la terminal) se construye con HTML');
  await inWin('camaras', '[data-cam=CAM-04]');
  check(await page.isVisible('.win[data-app=camaras] .cam.big'), 'Cámaras: se amplía una cámara desbloqueada');
  await page.waitForTimeout(1200);
  const imgs = await page.evaluate(async () => { const L = [...document.querySelectorAll('img')]; await Promise.all(L.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); return { n: L.length, bad: L.filter(i => !i.naturalWidth).map(i => i.src.slice(-40)) }; });
  check(imgs.n > 20 && imgs.bad.length === 0, `Imágenes cargadas correctamente (${imgs.n} en pantalla, ${imgs.bad.length} rotas)${imgs.bad.length ? ': ' + imgs.bad.join(', ') : ''}`);
  check(await page.evaluate(() => getComputedStyle(document.getElementById('wallpaper')).backgroundImage.includes(IMG('I-03').slice(-60))), 'Fondo de escritorio cinematográfico (I-03)');
  await page.evaluate(() => window.__sqld.OS.focus('notas')); await page.fill('#notesTa', 'Sospecho de EST-02');
  check((await S()).notes === 'Sospecho de EST-02', 'Las notas se guardan');

  /* 6. acusación, confesión y misión 10 */
  await page.evaluate(() => window.__sqld.OS.open('fiscal'));
  await inWin('fiscal', '[data-s=tomas]');
  check((await page.textContent('.win[data-app=fiscal]')).includes('coartada'), 'Una acusación incorrecta se explica');
  await inWin('fiscal', '[data-s=bruno]');
  await page.waitForSelector('#cine.on');
  await page.click('#cineNext'); await page.click('#cineNext'); await page.waitForTimeout(100);
  check(await page.isVisible('#cinePortrait.on') && (await page.getAttribute('#cinePortrait img', 'src')) === (await page.evaluate(() => IMG('P-05b'))), 'Confesión con el retrato de Bruno (P-05b)');
  await cineAll();
  await page.waitForTimeout(300);
  check((await S()).accused && (await S()).current === 9, 'Tras la acusación se carga la misión 10');
  check((await page.textContent('.win[data-app=mision] h2')) === (await page.evaluate(() => window.__sqld.MISSIONS[9].title)), 'La ventana Misión muestra la misión 10 tras la confesión');
  check((await run("UPDATE estudiantes SET estado_registro = 'activo'")).includes('otros estudiantes'), 'UPDATE sin WHERE se detecta y se restaura');
  check(ok(await run("UPDATE estudiantes SET estado_registro = 'activo' WHERE id = 5")), 'Misión 10 resuelta');
  await inWin('mision', '[data-go=ending]');
  await page.waitForSelector('#cine.on'); await cineAll(); await page.waitForTimeout(300);
  check((await page.evaluate(() => window.__sqld.mode)) === 'secret', 'El desenlace lleva al caso secreto');
  check((await page.textContent('.win[data-app=mision] h2')) === (await page.evaluate(() => window.__sqld.SECRET.title)) && (await page.textContent('#termPath')).endsWith('secret'), 'La ventana Misión muestra el caso secreto sin reabrirla');
  check(ok(await run("SELECT tarjeta, COUNT(*) FROM accesos WHERE fecha='2026-03-14' AND hora>='22:00' GROUP BY tarjeta HAVING COUNT(*)>2")), 'Caso secreto resuelto');
  const fin = await S();
  check(fin.finished && Object.keys(fin.done).length === 11, 'Las 10 misiones y el caso secreto quedan completados');
  check(fin.badges.includes('closed') && fin.badges.includes('secret') && fin.badges.includes('first'), `Insignias obtenidas: ${fin.badges.join(', ')}`);

  /* 7. Archivo libre */
  await inWin('terminal', '[data-mode=sandbox]');
  check((await run('SELECT * FROM profesores')).includes('Consulta ejecutada'), 'Archivo libre ejecuta consultas sin evaluar');
  await inWin('terminal', '[data-mode=mission]');

  /* 8. gestor de ventanas */
  await page.evaluate(() => window.__sqld.OS.layout('study', true)); await page.waitForTimeout(200);
  let a = await rect('terminal');
  const hd = await page.$('.win[data-app=terminal] .win-hd');
  const hb = await hd.boundingBox();
  await page.mouse.move(hb.x + 200, hb.y + 15); await page.mouse.down(); await page.mouse.move(hb.x + 120, hb.y + 75, { steps: 6 }); await page.mouse.up();
  let b2 = await rect('terminal');
  check(Math.abs(b2.x - (a.x - 80)) < 3 && Math.abs(b2.y - (a.y + 60)) < 3, 'Arrastrar una ventana desde su barra de título');
  const rw = await (await page.$('.win[data-app=terminal] .rz-e')).boundingBox();
  await page.mouse.move(rw.x + 3, rw.y + 40); await page.mouse.down(); await page.mouse.move(rw.x - 97, rw.y + 40, { steps: 6 }); await page.mouse.up();
  const c2 = await rect('terminal');
  check(Math.abs(c2.w - (b2.w - 100)) < 4 && Math.abs(c2.x - b2.x) < 2, 'Redimensionar una ventana desde su borde');
  await page.click('.win[data-app=terminal] [data-w=min]');
  check(!(await rect('terminal')) && await page.isVisible('.tb-app.mini[data-tb=terminal]'), 'Minimizar a la barra de tareas');
  await page.click('.tb-app[data-tb=terminal]');
  check(!!(await rect('terminal')), 'Restaurar desde la barra de tareas');
  await page.click('.win[data-app=terminal] [data-w=max]');
  const mx = await rect('terminal'); const area = await page.evaluate(() => document.getElementById('windows').getBoundingClientRect().width);
  check(Math.abs(mx.w - area) < 2, 'Maximizar ocupa todo el escritorio');
  await page.dblclick('.win[data-app=terminal] .win-title');
  check((await rect('terminal')).w < area - 50, 'Doble clic en la barra de título restaura el tamaño');
  await page.click('.win[data-app=terminal] .win-hd');
  await page.click('.win[data-app=plano] .win-hd').catch(() => {});
  await page.evaluate(() => window.__sqld.OS.focus('plano'));
  const zP = await page.evaluate(() => +document.querySelector('.win[data-app=plano]').style.zIndex);
  await page.click('.tb-app[data-tb=terminal]'); await page.waitForTimeout(50);
  const zT = await page.evaluate(() => +document.querySelector('.win[data-app=terminal]').style.zIndex);
  check(zT > zP, 'La ventana activa pasa al frente (superposición)');
  await page.click('.win[data-app=plano] [data-w=close]'); await page.waitForTimeout(200);
  check(!(await page.$('.win[data-app=plano]')), 'Cerrar una ventana');
  // la terminal sigue funcionando con ventanas superpuestas y atajos
  await page.fill('#sql', ''); await page.click('#sql'); await page.keyboard.type("SELECT * FROM aulas WHERE piso = 2;");
  check((await page.inputValue('#sql')).endsWith('piso = 2;'), 'Se escribe en la terminal sin interferencias de las ventanas');
  await page.keyboard.press('Control+Enter'); await page.waitForTimeout(150);
  check((await page.textContent('#results')).includes('3 filas'), 'Ctrl + Enter ejecuta la consulta (3 aulas en el piso 2)');
  await page.click('#tbOrg'); await page.click('#orgMenu [data-lay=focus]'); await page.waitForTimeout(200);
  const ft = await rect('terminal');
  check(ft.w > 900 && !(await rect('db')), 'Foco en la terminal: terminal grande y el resto minimizado');
  await page.keyboard.press('Alt+Shift+E'); await page.waitForTimeout(200);
  check(!!(await rect('db')) && !!(await rect('evidencias')), 'Atajo Alt+Shift+E vuelve al Modo estudio');
  await page.evaluate(() => window.__sqld.OS.close('notas'));
  await page.click('#tbStart'); check(await page.isVisible('#start.on'), 'Menú de inicio');
  await page.click('#startApps [data-open=notas]'); await page.waitForTimeout(200);
  check(!!(await rect('notas')) && !(await page.isVisible('#start.on')), 'El menú de inicio abre aplicaciones');
  await page.evaluate(() => window.__sqld.OS.close('plano')); await page.evaluate(() => window.__sqld.OS.order.slice().forEach(i => window.__sqld.OS.minimize(i)));
  await page.dblclick('.dicon[data-open=plano]'); await page.waitForTimeout(200);
  check(!!(await rect('plano')), 'Doble clic en un ícono del escritorio abre su aplicación');
  await page.evaluate(() => window.__sqld.OS.layout('study', true));

  /* 9. guardado y recuperación */
  await page.reload();
  await page.waitForSelector('#boot.on'); await page.keyboard.press('Space'); await page.waitForSelector('#login.on');
  check((await page.textContent('#loginStatus')).includes('10/10'), 'Tras recargar, el inicio de sesión muestra el progreso guardado');
  check((await page.inputValue('#agentName')) === 'Agurto', 'Recuerda el nombre del agente');
  await page.click('#loginBtn'); await page.waitForSelector('#os.on'); await page.waitForTimeout(400);
  check(!(await page.isVisible('#cine.on')), 'No repite la cinemática');
  check(!!(await rect('terminal')) && !!(await rect('mision')), 'Restaura las ventanas de la sesión anterior');
  const st2 = await S();
  check(st2.finished && st2.done.secret && st2.accused, 'Progreso recuperado de localStorage');
  check(errors.length === 0, 'Sin errores de JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await ctx.close();

  /* 10. migración desde SQL Detective 1.0 */
  const c3 = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const p3 = await c3.newPage();
  const e3 = []; p3.on('pageerror', e => e3.push(e.message));
  await p3.goto(url);
  await p3.evaluate(() => { localStorage.clear(); localStorage.setItem('sqlDetective.v1', JSON.stringify({ xp: 340, done: { m1: true, m2: true, m3: true }, hints: { m1: 1 }, errors: {}, badges: ['first'], clues: ['m1', 'm2', 'm3'], current: 3, introSeen: true, tutorialSeen: true, drafts: {} })); });
  await p3.reload(); await p3.waitForSelector('#boot.on'); await p3.keyboard.press('Space'); await p3.waitForSelector('#login.on');
  await p3.click('#loginBtn'); await p3.waitForSelector('#os.on'); await p3.waitForTimeout(500);
  const m3 = await p3.evaluate(() => window.__sqld.S);
  check(m3.done.m3 && m3.xp === 340 && m3.current === 3, 'Migra el progreso de la versión 1.0 (misiones, XP y misión actual)');
  check(e3.length === 0, 'Sin errores al migrar');
  await c3.close();

  /* 11. móvil */
  const c4 = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const p4 = await c4.newPage();
  const e4 = []; p4.on('pageerror', e => e4.push(e.message));
  await p4.goto(url); await p4.evaluate(() => localStorage.clear()); await p4.reload();
  await p4.waitForSelector('#boot.on'); await p4.keyboard.press('Space'); await p4.waitForSelector('#login.on');
  await p4.click('#loginBtn'); await p4.waitForSelector('#cine.on'); await p4.click('#cineSkip');
  await p4.waitForSelector('.win[data-app=guia]'); for (let i = 0; i < 5; i++) await p4.click('.win[data-app=guia] [data-n]');
  await p4.evaluate(() => window.__sqld.OS.open('terminal')); await p4.waitForTimeout(350);
  const tr = await p4.evaluate(() => { const b = document.querySelector('.win[data-app=terminal]').getBoundingClientRect(); return { w: b.width }; });
  check(tr.w >= 389, 'Móvil: las ventanas ocupan toda la pantalla');
  await p4.fill('#sql', 'SELECT * FROM estudiantes'); await p4.click('#runBtn'); await p4.waitForTimeout(150);
  check((await p4.textContent('#feedback')).includes('Correcto'), 'Móvil: se puede resolver la misión 1');
  check(e4.length === 0, 'Móvil: sin errores de JavaScript' + (e4.length ? ': ' + e4.join(' | ') : ''));
  await c4.close();

  await browser.close();
  console.log(`\n${passes} comprobaciones correctas, ${fails} fallidas`);
  console.log(fails ? `${fails} prueba(s) fallaron` : 'Todas las pruebas pasaron');
  process.exit(fails ? 1 : 0);
})();
