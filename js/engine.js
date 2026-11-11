/* SQL Detective 2.0 — motor SQL: SQLite real (sql.js), resaltado, explicación de errores y validación por resultados.
   Lógica conservada de la versión 1 (mismas reglas de validación y mismos mensajes); solo se separó de la interfaz. */
"use strict";
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ENGINE = (() => {
  let SQL = null;
  const refCache = {};
  const TB = ['estudiantes', 'profesores', 'aulas', 'accesos', 'eventos'];
  const KW = ['SELECT','FROM','WHERE','AND','OR','NOT','ORDER','BY','ASC','DESC','LIKE','IN','BETWEEN','DISTINCT','LIMIT','GROUP','HAVING','AS','ON','JOIN','INNER','LEFT','RIGHT','OUTER','UPDATE','SET','INSERT','INTO','VALUES','DELETE','CREATE','TABLE','DROP','PRIMARY','KEY','FOREIGN','REFERENCES','NULL','IS','TOP','CASE','WHEN','THEN','ELSE','END','UNION','ALL','EXISTS','INTEGER','TEXT','REAL','ALTER','ADD','COLUMN','OFFSET'];
  const FN = ['COUNT','SUM','AVG','MIN','MAX','LOWER','UPPER','LENGTH','ROUND','SUBSTR','COALESCE'];

  function init() { return initSqlJs().then(s => { SQL = s; return s; }); }
  function freshDB() { const d = new SQL.Database(); d.run(SEED); return d; }
  function execAll(d, sql) {
    let last = null, changed = 0, count = 0;
    for (const st of d.iterateStatements(sql)) {
      const cols = st.getColumnNames(); const rows = [];
      while (st.step()) rows.push(st.get());
      count++;
      if (cols.length) last = { columns: cols, values: rows }; else changed += d.getRowsModified();
    }
    return { last, changed, count };
  }
  function runRef(sql) { if (!refCache[sql]) { const d = freshDB(); refCache[sql] = execAll(d, sql).last; d.close(); } return refCache[sql]; }

  function highlight(src) {
    const re = /(--[^\n]*)|('(?:[^']|'')*'?)|("(?:[^"])*"?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_áéíóúñÁÉÍÓÚÑ][\wáéíóúñÁÉÍÓÚÑ]*)|([\s\S])/g;
    let out = '', m;
    while ((m = re.exec(src))) {
      if (m[1]) out += `<span class="tk-c">${esc(m[1])}</span>`;
      else if (m[2] || m[3]) out += `<span class="tk-s">${esc(m[2] || m[3])}</span>`;
      else if (m[4]) out += `<span class="tk-n">${m[4]}</span>`;
      else if (m[5]) { const u = m[5].toUpperCase(); out += KW.includes(u) ? `<span class="tk-k">${esc(m[5])}</span>` : FN.includes(u) ? `<span class="tk-f">${esc(m[5])}</span>` : TB.includes(m[5].toLowerCase()) ? `<span class="tk-t">${esc(m[5])}</span>` : esc(m[5]); }
      else out += esc(m[6]);
    }
    return out + '\n';
  }
  const stripComments = s => s.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();

  /* ---------- explicación de errores (igual que la v1) ---------- */
  function lev(a, b) { a = a.toLowerCase(); b = b.toLowerCase(); const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
  function closest(w, list) { let best = null, bd = 99; list.forEach(x => { const d = lev(w, x); if (d < bd) { bd = d; best = x; } }); return bd <= Math.max(2, Math.floor(w.length / 3)) ? best : null; }
  function allColumns(db) { const s = new Set(); TB.forEach(t => db.exec(`PRAGMA table_info(${t})`)[0].values.forEach(c => s.add(c[1]))); return [...s]; }
  function explainError(msg, sql, db) {
    let problem = '', meaning = '', hint = '', x;
    if ((x = msg.match(/no such table: (\S+)/))) {
      const t = x[1].replace(/^main\./, ''); const c = closest(t, TB);
      problem = `La tabla <code>${esc(t)}</code> no existe.`;
      meaning = 'SQLite buscó una tabla con ese nombre y no la encontró. Los nombres de tabla deben escribirse exactamente igual.';
      hint = c ? `¿Quisiste decir <code>${c}</code>?` : `Las tablas disponibles son: ${TB.map(t => `<code>${t}</code>`).join(', ')}.`;
    } else if ((x = msg.match(/no such column: (\S+)/))) {
      const col = x[1]; const bare = col.split('.').pop(); const c = closest(bare, allColumns(db));
      problem = `La columna <code>${esc(col)}</code> no existe.`;
      meaning = 'SQLite no encontró una columna con ese nombre en las tablas de tu consulta.';
      const quoted = new RegExp(`"${bare}"`).test(sql);
      hint = quoted ? `Parece que escribiste un texto entre comillas <b>dobles</b>. En SQL los textos van entre comillas <b>simples</b>: <code>'${esc(bare)}'</code>.`
        : c && c !== bare ? `¿Quisiste decir <code>${c}</code>? Revisa la app <b>Base de datos</b>.`
        : `Si querías escribir un <b>valor de texto</b> (no una columna), ponlo entre comillas simples: <code>'${esc(bare)}'</code>. Si es una columna, revisa en qué tabla está.`;
    } else if ((x = msg.match(/near "([^"]*)": syntax error/))) {
      const tok = x[1]; const kw = closest(tok.toUpperCase(), ['SELECT','FROM','WHERE','ORDER','GROUP','HAVING','DISTINCT','BETWEEN','LIKE','UPDATE','SET','INSERT','DELETE','JOIN','INNER','LIMIT']);
      problem = `Hay un error de sintaxis cerca de <code>${esc(tok)}</code>.`;
      meaning = 'La sintaxis es la «gramática» de SQL. La base de datos no entendió la consulta a partir de esa palabra o símbolo.';
      if (kw && kw !== tok.toUpperCase()) hint = `¿Quisiste escribir <code>${kw}</code>? Revisa la ortografía de las palabras clave.`;
      else if (/^(FROM|WHERE|ORDER|GROUP|AND|OR)$/i.test(tok)) hint = `Revisa lo que va justo <b>antes</b> de <code>${esc(tok)}</code>: puede sobrar una coma, faltar una columna o un valor.`;
      else if (tok === ',') hint = 'Revisa las comas: separan columnas, pero no debe haber una coma antes de FROM ni dos seguidas.';
      else hint = 'Revisa el orden de las palabras (SELECT → FROM → WHERE → ORDER BY), las comas entre columnas y las comillas simples en los textos.';
    } else if (/incomplete input/.test(msg)) {
      problem = 'La consulta está incompleta.'; meaning = 'SQLite llegó al final de lo que escribiste esperando algo más.';
      hint = 'Quizá falta cerrar una comilla <code>\'</code> o un paréntesis, o completar la instrucción (por ejemplo, el nombre de la tabla después de FROM).';
    } else if (/unrecognized token/.test(msg)) {
      problem = 'Hay un símbolo que SQLite no reconoce.'; meaning = 'Suele pasar con comillas sin cerrar o caracteres extraños.';
      hint = 'Revisa que cada texto empiece y termine con comilla simple: <code>\'texto\'</code>.';
    } else if ((x = msg.match(/ambiguous column name: (\S+)/))) {
      problem = `La columna <code>${esc(x[1])}</code> es ambigua.`; meaning = 'Esa columna existe en más de una de las tablas que estás uniendo, y SQLite no sabe cuál quieres.';
      hint = `Escribe el alias de la tabla delante: por ejemplo <code>e.${esc(x[1])}</code> o <code>ev.${esc(x[1])}</code>.`;
    } else if (/misuse of aggregate/.test(msg)) {
      problem = 'Uso incorrecto de una función de agregación.'; meaning = 'Funciones como COUNT o SUM no pueden ir dentro de WHERE.';
      hint = 'Para filtrar por un conteo usa <code>HAVING</code> después de <code>GROUP BY</code>.';
    } else if (/UNIQUE constraint|NOT NULL constraint|FOREIGN KEY/.test(msg)) {
      problem = 'Se violó una regla de la tabla.'; meaning = esc(msg); hint = 'Revisa que no estés duplicando una clave o dejando vacío un dato obligatorio. Puedes restaurar los datos.';
    } else {
      problem = 'SQLite devolvió un error.'; meaning = `Mensaje original: <code>${esc(msg)}</code>`; hint = 'Compara tu consulta con el ejemplo del concepto y revisa ortografía, comas y comillas.';
    }
    return { problem, meaning, hint };
  }

  /* ---------- validación por resultados (igual que la v1) ---------- */
  function norm(v) { if (v === null || v === undefined) return '∅'; if (typeof v === 'number') return String(Math.round(v * 1e4) / 1e4); return String(v); }
  function compare(user, spec) {
    const exp = runRef(spec.ref);
    const uc = user.columns.map(c => c.toLowerCase());
    let uSig, eSig;
    if (spec.valueMode) {
      if (user.columns.length !== exp.columns.length) return { ok: false, title: 'Las columnas no cuadran', rows: [['Problema', `Tu resultado tiene ${user.columns.length} columna(s) y la evidencia necesita ${exp.columns.length}.`], ['Pista', 'Revisa qué columnas pide el objetivo (por ejemplo, la tarjeta y su conteo).']] };
      const sig = r => r.map(norm).sort().join('¦');
      uSig = user.values.map(sig); eSig = exp.values.map(sig);
    } else {
      const missing = spec.keys.filter(k => !uc.includes(k));
      if (missing.length) return { ok: false, title: 'Falta información en tu resultado', rows: [['Problema', `Tu resultado no incluye la columna ${missing.map(k => `<code>${k}</code>`).join(', ')}.`], ['Qué significa', 'La consulta funciona, pero no muestra los datos que necesitamos para la investigación.'], ['Pista', 'Revisa la lista de columnas después de <code>SELECT</code> (o usa <code>*</code> si el objetivo pide todas).']] };
      if (spec.exactCols) {
        const want = exp.columns.map(c => c.toLowerCase());
        const same = want.length === uc.length && want.every(c => uc.includes(c));
        if (!same) {
          const extra = uc.filter(c => !want.includes(c)), lack = want.filter(c => !uc.includes(c));
          return { ok: false, title: 'Las columnas no son las que pide la misión', rows: [['Problema', lack.length ? `Faltan columnas: ${lack.map(c => `<code>${c}</code>`).join(', ')}.` : `Sobran columnas: ${extra.map(c => `<code>${c}</code>`).join(', ')}.`], ['Qué significa', 'Las columnas que aparecen dependen de lo que escribas después de <code>SELECT</code>.'], ['Pista', want.length > 4 ? 'El objetivo pide todas las columnas: ¿qué símbolo significa «todas»?' : `La misión pide exactamente: ${want.map(c => `<code>${c}</code>`).join(', ')}.`]] };
        }
      }
      const idx = spec.keys.map(k => uc.indexOf(k)), eidx = spec.keys.map(k => exp.columns.map(c => c.toLowerCase()).indexOf(k));
      uSig = user.values.map(r => idx.map(i => norm(r[i])).join('¦')); eSig = exp.values.map(r => eidx.map(i => norm(r[i])).join('¦'));
    }
    if (spec.distinct && new Set(uSig).size !== uSig.length) return { ok: false, title: 'Hay datos repetidos', rows: [['Problema', 'Algunas tarjetas aparecen más de una vez en tu resultado.'], ['Qué significa', 'Una misma tarjeta pudo abrir varias puertas; la misión pide cada una solo una vez.'], ['Pista', 'Hay una palabra que va justo después de <code>SELECT</code> y elimina las filas repetidas. Muestra solo la columna <code>tarjeta</code>.']] };
    const count = a => a.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {});
    const ue = count(uSig), ee = count(eSig);
    const sameSet = uSig.length === eSig.length && Object.keys(ee).every(k => ue[k] === ee[k]);
    if (!sameSet) {
      const n = user.values.length, k = exp.values.length;
      const allExpIn = Object.keys(ee).every(x => (ue[x] || 0) >= ee[x]);
      const allUserIn = Object.keys(ue).every(x => (ee[x] || 0) >= ue[x]);
      if (n === 0) return { ok: false, title: 'Ninguna fila coincide', rows: [['Problema', 'Tu consulta no devolvió filas.'], ['Qué significa', 'Ninguna fila cumplió tus condiciones. Muchas veces es un texto escrito distinto a como está en la tabla.'], ['Pista', 'Revisa que los textos coincidan exactamente (mayúsculas, guiones, acentos), que vayan entre comillas simples y que uses el operador correcto.']] };
      if (n > k && allExpIn) return { ok: false, title: 'Sobran filas', rows: [['Problema', `Obtuviste ${n} filas, pero la evidencia apunta a ${k}.`], ['Qué significa', 'Tus resultados incluyen filas que no corresponden: el filtro está incompleto.'], ['Pista', 'Revisa tu <code>WHERE</code>: ¿incluiste todas las condiciones del objetivo?']] };
      if (n < k && allUserIn) return { ok: false, title: 'Faltan filas', rows: [['Problema', `Obtuviste ${n} fila(s), pero deberían ser ${k}.`], ['Qué significa', 'Tu filtro es demasiado estricto y deja fuera evidencia importante.'], ['Pista', 'Revisa las condiciones y los operadores (por ejemplo, <code>&gt;</code> frente a <code>&gt;=</code>, o los límites de un rango).']] };
      return { ok: false, title: 'Estas no son las filas que buscamos', rows: [['Problema', `Obtuviste ${n} fila(s), pero no son las correctas${n === k ? ' (la cantidad coincide, el contenido no)' : ''}.`], ['Qué significa', 'La consulta es válida, pero las condiciones no describen lo que pide el objetivo.'], ['Pista', 'Vuelve a leer el objetivo y compara cada condición de tu <code>WHERE</code> con él.']] };
    }
    if (spec.ordered && uSig.join('\n') !== eSig.join('\n')) return { ok: false, title: 'Casi: falta el orden', rows: [['Problema', 'Las filas son las correctas, pero no están en el orden pedido.'], ['Qué significa', 'Sin <code>ORDER BY</code>, la base de datos devuelve las filas en el orden que le resulte cómodo.'], ['Pista', 'Usa <code>ORDER BY</code> con la columna adecuada y revisa si necesitas <code>ASC</code> o <code>DESC</code>.']] };
    return { ok: true };
  }
  /** Validación de la misión 10 (UPDATE). Devuelve {v, reset}: reset=true si hay que restaurar la base. */
  function checkRestore(res, work) {
    const base = freshDB(); const orig = base.exec('SELECT * FROM estudiantes ORDER BY id')[0].values; base.close();
    let now; try { now = work.exec('SELECT * FROM estudiantes ORDER BY id')[0]?.values || []; } catch (e) { now = []; }
    const fail = (title, rows, flag = true) => ({ v: { ok: false, level: 'err', title, rows: rows.concat([['Datos', '↺ Restauré automáticamente la base de datos para que lo intentes de nuevo.']]) }, reset: true, restoreErr: flag });
    if (now.length !== orig.length) return fail('¡Se perdieron estudiantes!', [['Problema', `La tabla ahora tiene ${now.length} estudiantes en lugar de ${orig.length}.`], ['Qué significa', 'Se eliminaron o agregaron filas. Esta misión solo necesita modificar un valor.'], ['Pista', 'Usa <code>UPDATE … SET … WHERE …</code>, no DELETE ni INSERT.']], false);
    const changed = []; let valeriaOk = false, valeriaOther = false;
    now.forEach((row, i) => { const o = orig[i]; const diff = row.some((v, j) => norm(v) !== norm(o[j]));
      if (row[0] === 5) { valeriaOk = row[6] === 'activo'; valeriaOther = row.some((v, j) => j !== 6 && norm(v) !== norm(o[j])); }
      else if (diff) changed.push(`${row[1]} ${row[2]}`); });
    if (changed.length) return fail('¡Cambiaste a otros estudiantes!', [['Problema', `Además de Valeria se modificó: ${changed.slice(0, 4).join(', ')}${changed.length > 4 ? '…' : ''}.`], ['Qué significa', 'Un <code>UPDATE</code> sin <code>WHERE</code> (o con una condición demasiado amplia) cambia todas las filas que la cumplen.'], ['Pista', 'Añade <code>WHERE id = 5</code> para tocar solo la fila de Valeria.']]);
    if (valeriaOther) return fail('Cambiaste otro dato de Valeria', [['Problema', 'Se modificó una columna distinta de <code>estado_registro</code>.'], ['Pista', 'En <code>SET</code> escribe solo <code>estado_registro = \'activo\'</code>.']]);
    if (valeriaOk) return { v: { ok: true }, reset: false };
    if (res.changed === 0 && res.last) return { v: { ok: false, level: 'info', title: 'Consulta de lectura', rows: [['Estado', 'El registro de Valeria sigue como <code>\'eliminado\'</code>. Un <code>SELECT</code> solo lee datos; para cambiarlos necesitas <code>UPDATE</code>.']] }, reset: false };
    return { v: { ok: false, title: 'El registro sigue sin restaurar', rows: [['Problema', 'El estado de Valeria no cambió a <code>\'activo\'</code>.'], ['Pista', 'Revisa que el valor sea exactamente <code>\'activo\'</code> (en minúsculas y entre comillas simples) y que el WHERE apunte a <code>id = 5</code>.']] }, reset: false, restoreErr: true };
  }
  return { init, freshDB, execAll, runRef, highlight, stripComments, explainError, compare, checkRestore, TB };
})();
