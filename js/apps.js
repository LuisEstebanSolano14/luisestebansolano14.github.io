/* SQL Detective 2.0 — aplicaciones de Lumen OS. */
"use strict";

/** Diálogo con retratos fotográficos (misiones y correos). */
function dlgHTML(lines, delay = 0) {
  return lines.map((l, i) => { const c = CHAR[l.who];
    if (c.narr) return `<div class="dlg narr" style="animation-delay:${delay + i * .1}s"><div class="bub">${l.text}</div></div>`;
    return `<div class="dlg" style="animation-delay:${delay + i * .1}s">${avatar(l.who)}<div class="bub"><div class="n" style="color:${c.color}">${c.name}</div>${l.text}</div></div>`; }).join('');
}
const tableNames = ['estudiantes', 'profesores', 'aulas', 'accesos', 'eventos'];
const tableDesc = { estudiantes: 'Alumnos y su estado académico', profesores: 'Docentes y sus tarjetas', aulas: 'Espacios del colegio', accesos: 'Cada vez que una tarjeta abre una puerta', eventos: 'Todo lo que registró el sistema' };
const evById = id => EVIDENCE.find(e => e.id === id);
const evUnlocked = () => EVIDENCE.filter(e => GAME.isUnlocked(e.unlock));
function evThumb(e, cls = '') {
  const media = e.img ? `<img src="${IMG(e.img, true)}" alt="${esc(e.title)}" loading="lazy">` : `<div class="ev-html-mini">${svg('terminal')}<span>SRV-01</span></div>`;
  return `<button class="evc ${cls} ${S.evSeen[e.id] ? '' : 'new'}" data-ev="${e.id}"><div class="evc-media">${media}</div><div class="evc-tx"><span class="evc-k">${e.kind} · ${e.id}</span><b>${esc(e.title)}</b></div></button>`;
}
function bindEv(root) { root.querySelectorAll('[data-ev]').forEach(b => b.onclick = () => GAME.openEvidence(b.dataset.ev)); }
function suspectStage() { return GAME.doneCount(); }
/** Fondo fotográfico (textura) con velo oscuro. Se aplica en línea para que la ruta sea relativa al documento. */
const texBg = (key, a = .8, b = .9) => `background-image:linear-gradient(rgba(11,15,23,${a}),rgba(11,15,23,${b})),url('${IMG(key, true)}')`;

/* ======================================================================
   TERMINAL SQL (editor, chips, ejecución, retroalimentación, resultados)
   ====================================================================== */
const TERM = (() => {
  let ta, hl, gut;
  function render(b) {
    b.innerHTML = `<div class="term">
      <div class="term-top"><div class="seg" role="tablist" aria-label="Modo de la terminal"><button data-mode="mission" role="tab">Caso 001</button><button data-mode="sandbox" role="tab">Archivo libre</button></div>
        <span class="term-path" id="termPath"></span><span class="kbd">SQLite</span></div>
      <div class="editor"><div class="gutter" id="gutter">1</div><pre id="hl" aria-hidden="true"></pre><textarea id="sql" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Editor de consultas SQL" placeholder="Escribe aquí tu consulta SQL…"></textarea></div>
      <div class="chiprow" id="chips"></div>
      <div class="runbar"><button class="btn gold" id="runBtn">▶ Ejecutar</button><span class="kbd">Ctrl + Enter</span><span class="sp"></span>
        <button class="btn small ghost" id="clearBtn" title="Borrar el editor">Limpiar</button><button class="btn small ghost" id="restoreBtn" title="Devuelve los datos a su estado original">↺ Restaurar datos</button></div>
      <div id="feedback" aria-live="polite"></div>
      <div class="results" id="results"><div class="empty">Los resultados de tus consultas aparecerán aquí.</div></div></div>`;
    ta = b.querySelector('#sql'); hl = b.querySelector('#hl'); gut = b.querySelector('#gutter');
    ta.addEventListener('input', () => { sync(); const k = GAME.mode === 'sandbox' ? 'sandbox' : GAME.mission().id; S.drafts[k] = ta.value; save(); });
    ta.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); GAME.run(ta.value); }
      if (e.key === 'Tab') { e.preventDefault(); insert('  ', true); }
    });
    b.querySelector('#runBtn').onclick = () => GAME.run(ta.value);
    b.querySelector('#clearBtn').onclick = () => { ta.value = ''; ta.dispatchEvent(new Event('input')); ta.focus(); };
    b.querySelector('#restoreBtn').onclick = () => GAME.restoreData();
    b.querySelectorAll('[data-mode]').forEach(x => x.onclick = () => GAME.setMode(x.dataset.mode));
    b.addEventListener('click', e => { const r = e.target.closest('[data-act=report]'); if (r) { OS.open('mision'); const s = OS.body('mision').querySelector('.success'); s && s.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
    reset();
  }
  function sync() { if (!ta) return; hl.innerHTML = ENGINE.highlight(ta.value); ta.style.height = 'auto'; ta.style.height = Math.max(132, ta.scrollHeight) + 'px'; const lines = ta.value.split('\n').length; gut.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>'); }
  function header() {
    if (!ta) return; const m = GAME.mode;
    document.querySelectorAll('.term [data-mode]').forEach(x => { const on = (x.dataset.mode === 'sandbox') === (m === 'sandbox'); x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
    document.querySelector('.term [data-mode=mission]').textContent = m === 'secret' ? 'Caso secreto' : 'Caso 001';
    $('#termPath').textContent = m === 'sandbox' ? `${(S.agent || 'detective').toLowerCase().replace(/\s+/g, '-')}@lumen:~/archivo-libre` : `${(S.agent || 'detective').toLowerCase().replace(/\s+/g, '-')}@lumen:~/caso-001/${GAME.mission().id}`;
    OS.setSub('terminal', m === 'sandbox' ? 'Archivo libre' : (m === 'secret' ? 'Caso secreto' : `Misión ${S.current + 1}`));
    const tset = new Set(tableNames);
    const kws = m === 'sandbox' ? ['SELECT', '*', 'FROM', 'WHERE', 'AND', 'ORDER BY', 'GROUP BY', 'COUNT(*)', 'LIMIT'] : GAME.mission().chips;
    $('#chips').innerHTML = kws.map(k => `<button class="kchip ${/^[A-Z(*]/.test(k) && !tset.has(k) ? 'k' : ''} ${tset.has(k) ? 't' : ''}" data-k="${esc(k)}">${esc(k)}</button>`).join('');
    $$('#chips .kchip').forEach(b => b.onclick = () => insert(b.dataset.k));
  }
  function reset() {
    if (!ta) return; const k = GAME.mode === 'sandbox' ? 'sandbox' : GAME.mission().id;
    ta.value = S.drafts[k] || ''; sync(); header();
    $('#feedback').innerHTML = ''; $('#results').innerHTML = '<div class="empty">Los resultados de tus consultas aparecerán aquí.</div>';
  }
  function insert(t, raw) {
    if (!ta) { OS.open('terminal'); }
    const s = ta.selectionStart ?? ta.value.length, e = ta.selectionEnd ?? ta.value.length, before = ta.value.slice(0, s);
    let ins = t;
    if (!raw) { const needSpace = before.length && !/[\s(]$/.test(before) && t !== ',' && t !== ';'; ins = (needSpace ? ' ' : '') + t + (t === ',' ? ' ' : ''); }
    ta.value = before + ins + ta.value.slice(e);
    const p = s + ins.length; ta.focus(); ta.setSelectionRange(p, p); ta.dispatchEvent(new Event('input'));
  }
  function feedback(kind, title, rows, extra = '') {
    if (!OS.isOpen('terminal')) OS.open('terminal');
    const icon = { err: '✖', warn: '!', ok: '✓', info: 'i' }[kind];
    const retry = (kind === 'err' || kind === 'warn') && GAME.mode !== 'sandbox' ? `<div class="fb-retry">↻ Corrige tu consulta y vuelve a ejecutarla. Equivocarse es parte de toda investigación.</div>` : '';
    $('#feedback').innerHTML = `<div class="feedback ${kind}"><div class="head">${icon} ${title}</div>${rows.map(r => `<div class="row"><div class="l">${r[0]}</div><div>${r[1]}</div></div>`).join('')}${retry}${extra}</div>`;
  }
  function results(r, state, label) {
    const el = $('#results'); if (!el) return;
    if (state === 'error') { el.innerHTML = '<div class="empty">No hay resultados porque la consulta tuvo un error.</div>'; return; }
    if (!r) { el.innerHTML = '<div class="empty">La instrucción se ejecutó, pero no devuelve una tabla de resultados.</div>'; return; }
    const max = 300, rows = r.values.slice(0, max);
    el.innerHTML = `<div class="meta"><span>${label || 'Resultado'} · ${r.values.length} fila${r.values.length === 1 ? '' : 's'} · ${r.columns.length} columna${r.columns.length === 1 ? '' : 's'}</span>${r.values.length > max ? `<span>mostrando ${max}</span>` : ''}</div>` +
      (r.values.length ? `<div class="tablewrap"><table class="res"><thead><tr>${r.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(v => v === null ? '<td class="null">NULL</td>' : typeof v === 'number' ? `<td class="num">${v}</td>` : `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
        : `<div class="tablewrap"><table class="res"><thead><tr>${r.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead></table><div class="empty" style="border:0">La consulta no devolvió filas: ninguna cumple las condiciones.</div></div>`);
  }
  function peek(n) {
    if (!OS.isOpen('terminal')) OS.open('terminal'); else OS.focus('terminal');
    const r = ENGINE.execAll(GAME.work, `SELECT * FROM ${n} LIMIT 8`).last;
    feedback('info', `👁 Vistazo a <code>${n}</code>`, [['Nota', 'Esto es solo una vista previa (8 filas) y no cuenta para la misión. ¡La consulta la escribes tú!']]);
    results(r, null, 'Vistazo');
  }
  function detach() { ta = hl = gut = null; }
  return { render, reset, header, insert, feedback, results, peek, detach, focus: () => ta && ta.focus(), get ta() { return ta; } };
})();

/* ======================================================================
   REGISTRO DE APLICACIONES
   ====================================================================== */
const APPS = {
  /* ---------------- Terminal ---------------- */
  terminal: { title: 'Terminal SQL', short: 'Terminal', icon: 'terminal', accent: '#e0b25c', w: 760, h: 620, desk: true,
    render: b => TERM.render(b), refresh: () => TERM.header(), onClose: () => TERM.detach() },

  /* ---------------- Misión (instrucciones, lección, objetivo, pistas, informe) ---------------- */
  mision: { title: 'Misión', icon: 'mision', accent: '#f3d48a', w: 460, h: 640, desk: true,
    render(b) { this.refresh(b); },
    refresh(b) {
      const mode = GAME.mode, ui = GAME.unlockedIndex();
      let track = `<nav class="track" aria-label="Misiones del Capítulo 1">`;
      MISSIONS.forEach((m, i) => { const cls = S.done[m.id] ? 'done' : (i <= ui ? '' : 'lock'); const cur = mode === 'mission' && i === S.current ? 'cur' : '';
        track += `<button class="step ${cls} ${cur}" data-step="${i}" title="${esc(m.title)}" aria-label="Misión ${i + 1}: ${esc(m.title)}">${S.done[m.id] ? '✓' : i + 1}</button>`; });
      track += `<button class="step secret ${S.done.secret ? 'done' : ''} ${S.finished ? '' : 'lock'} ${mode === 'secret' ? 'cur' : ''}" data-step="secret" title="Caso secreto" aria-label="Caso secreto">${S.finished ? '★' : '?'}</button></nav>`;
      if (mode === 'sandbox') {
        if (b.dataset.mid !== 'sandbox') { b.dataset.mid = 'sandbox'; b.scrollTop = 0; }
        b.innerHTML = `<div class="app-pad">${track}<div class="mtitle"><div class="kicker">Archivo libre</div><h2>Practica sin presión</h2></div>
          ${dlgHTML([{ who: 'byte', text: 'Aquí puedes escribir cualquier consulta sobre la base de datos del caso. Nada se evalúa y puedes romper lo que quieras: «Restaurar datos» lo arregla todo.' }])}
          <div class="objective"><span class="kicker">Ideas para explorar</span><ul><li><code>SELECT * FROM profesores;</code></li><li><code>SELECT * FROM aulas WHERE piso = 2;</code></li><li><code>SELECT tipo, COUNT(*) FROM accesos GROUP BY tipo;</code></li><li><code>SELECT * FROM eventos ORDER BY hora DESC LIMIT 5;</code></li></ul></div>
          <p class="muted small">Consultas en el archivo: ${S.sandboxRuns}. ${S.badges.includes('explorer') ? '' : 'Ejecuta 10 para ganar la insignia «Curiosidad».'}</p>
          <button class="btn" data-back>← Volver al caso</button></div>`;
        b.querySelector('[data-back]').onclick = () => GAME.setMode('mission');
      } else {
        const m = GAME.mission(), done = !!S.done[m.id], used = S.hints[m.id] || 0;
        if (b.dataset.mid !== m.id) { b.dataset.mid = m.id; b.scrollTop = 0; }   // misión nueva: empezar desde arriba
        const num = mode === 'secret' ? 'Caso secreto' : `Misión ${S.current + 1} de 10`;
        let h = `<div class="app-pad">${track}<div class="mtitle"><div class="kicker">${num} · ${m.level}</div><h2>${m.title}</h2></div>
          ${dlgHTML(m.dialog)}
          <details class="lesson" ${done ? '' : 'open'}><summary>Concepto: ${m.concepts.map(c => c.k).join(' · ')}</summary><div class="inner">${m.lesson}</div></details>
          <div class="objective"><span class="kicker">Objetivo</span>${m.objective}</div>`;
        if (!done) {
          h += `<div class="hints">${m.hints.slice(0, used).map((t, i) => `<div class="hint">${avatar('byte', 'xs')}<div><div class="n">PISTA ${i + 1} · BYTE</div>${t}</div></div>`).join('')}</div>`;
          if (used < m.hints.length) h += `<button class="btn small ${(S.errors[m.id] || 0) >= 2 ? 'pulse' : ''}" data-hint>💡 Pedir pista a BYTE (${used + 1}/${m.hints.length})</button><div class="hintnote">${used === 0 ? 'La primera pista es gratis. Las siguientes reducen en 15 XP la recompensa de esta misión.' : 'Recompensa actual: ' + GAME.missionXP(m) + ' XP'}</div>`;
          else h += `<div class="hintnote">Ya viste todas las pistas. ¡Tú puedes!</div>`;
        } else {
          let next = '';
          if (mode === 'secret') next = `<button class="btn gold" data-go="desk">Volver al escritorio</button>`;
          else if (m.accuse && !S.accused) next = `<button class="btn gold pulse" data-go="fiscal">⚖ Enviar el Informe al fiscal</button>`;
          else if (m.id === 'm10') next = `<button class="btn gold" data-go="ending">Ver el desenlace ▶</button>`;
          else next = `<button class="btn gold" data-go="next">Siguiente misión ▶</button>`;
          const evs = EVIDENCE.filter(e => e.unlock === m.id);
          h += `<div class="success"><span class="kicker">✓ Misión resuelta · informe</span>${dlgHTML(m.success)}
            <div class="cluecard"><div class="kicker">Pista añadida al inventario</div><div class="t">${m.clue.t}</div>${m.clue.d}</div>
            ${evs.length ? `<div class="kicker" style="margin-top:12px">Evidencias nuevas</div><div class="evgrid small">${evs.map(e => evThumb(e)).join('')}</div>` : ''}
            <div class="btnrow">${next}</div></div>`;
        }
        b.innerHTML = h + '</div>';
        const hb = b.querySelector('[data-hint]'); if (hb) hb.onclick = () => { GAME.useHint(); const hs = b.querySelectorAll('.hint'); hs[hs.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
        b.querySelectorAll('[data-go]').forEach(x => x.onclick = () => { const a = x.dataset.go;
          if (a === 'next') GAME.nextMission(); if (a === 'fiscal') OS.open('fiscal'); if (a === 'ending') GAME.ending(); if (a === 'desk') OS.minimize('mision'); });
        bindEv(b);
      }
      b.querySelectorAll('[data-step]').forEach(x => x.onclick = () => { const i = x.dataset.step; GAME.goMission(i === 'secret' ? 'secret' : +i); });
      OS.setSub('mision', mode === 'sandbox' ? 'Archivo libre' : mode === 'secret' ? 'Caso secreto' : `${S.current + 1}/10`);
    } },

  /* ---------------- Base de datos ---------------- */
  db: { title: 'Base de datos', icon: 'db', accent: '#7fa7e8', w: 420, h: 560, desk: true,
    render(b) { this.refresh(b); },
    refresh(b) {
      const d = GAME.work; if (!d) return;
      const open = b.dataset.open || 'estudiantes';
      b.innerHTML = `<div class="app-pad"><p class="muted small">Copia de solo lectura de la base del Colegio Santa Aurora. Haz clic en una tabla para ver sus columnas.</p>` + tableNames.map(n => {
        const cols = d.exec(`PRAGMA table_info(${n})`)[0].values; const cnt = d.exec(`SELECT COUNT(*) FROM ${n}`)[0].values[0][0];
        return `<div class="tbl ${n === open ? 'open' : ''}" data-n="${n}"><button class="th" aria-expanded="${n === open}"><b>${n}</b><span>${cnt} filas</span></button><div class="cols"><div class="muted small">${tableDesc[n]}</div>${cols.map(c => `<div class="col"><span>${c[1]}${c[5] ? '<span class="pk">PK</span>' : ''}</span><i>${(c[2] || '').toLowerCase()}</i></div>`).join('')}<div class="acts"><button class="btn small" data-peek="${n}">Vistazo</button><button class="btn small ghost" data-ins="${n}">Insertar nombre</button></div></div></div>`;
      }).join('') + '</div>';
      b.querySelectorAll('.tbl .th').forEach(t => t.onclick = () => { b.dataset.open = t.parentElement.dataset.n; this.refresh(b); });
      b.querySelectorAll('[data-peek]').forEach(x => x.onclick = () => TERM.peek(x.dataset.peek));
      b.querySelectorAll('[data-ins]').forEach(x => x.onclick = () => { OS.focus('terminal'); TERM.insert(x.dataset.ins); });
    } },

  /* ---------------- Correo ---------------- */
  correo: { title: 'Correo Lumen', short: 'Correo', icon: 'correo', accent: '#7fa7e8', w: 900, h: 600, desk: true,
    list() {
      const L = [];
      FIXED_MAIL.forEach((m, k) => { if (m.when === 'intro' || GAME.isUnlocked(m.when)) L.push({ ...m, ord: m.when === 'intro' ? -10 + k : (m.when === 'accused' ? 95 : m.when === 'm10' ? 120 : MISSIONS.findIndex(x => x.id === m.when) * 10 + 5) }); });
      const ui = GAME.unlockedIndex();
      MISSIONS.forEach((m, i) => { if (i <= ui || S.done[m.id]) L.push({ id: 'm:' + i, from: m.dialog[0].who, subject: `Misión ${i + 1} · ${m.title}`, time: '', ord: i * 10 + 1, mission: i,
        body: dlgHTML(m.dialog) + `<div class="objective"><span class="kicker">Objetivo</span>${m.objective}</div>`, action: { label: S.done[m.id] ? 'Revisar la misión' : 'Abrir la misión', act: 'mission:' + i } }); });
      if (S.finished) L.push({ id: 'm:secret', from: 'ortega', subject: 'Caso secreto · El búho nocturno', ord: 130, body: dlgHTML(SECRET.dialog) + `<div class="objective"><span class="kicker">Objetivo</span>${SECRET.objective}</div>`, action: { label: 'Abrir el caso secreto', act: 'mission:secret' } });
      return L.sort((a, b) => b.ord - a.ord);
    },
    badge() { return this.list().filter(m => !S.mailRead[m.id]).length; },
    render(b, opt) { b.dataset.sel = (opt && opt.mail) || b.dataset.sel || ''; this.refresh(b); },
    refresh(b, opt) {
      if (opt && opt.mail) b.dataset.sel = opt.mail;
      const L = this.list(); let sel = b.dataset.sel; if (!L.find(m => m.id === sel)) sel = (L.find(m => !S.mailRead[m.id]) || L[0]).id;
      b.dataset.sel = sel; S.mailRead[sel] = true; save();
      const m = L.find(x => x.id === sel); const c = CHAR[m.from];
      b.innerHTML = `<div class="mail"><div class="mail-list" role="list">${L.map(x => `<button class="mail-it ${x.id === sel ? 'on' : ''} ${S.mailRead[x.id] ? '' : 'unread'}" data-mail="${x.id}" role="listitem">${avatar(x.from, 'sm')}<div><div class="mi-top"><b>${esc(CHAR[x.from].name)}</b><span>${x.time || ''}</span></div><div class="mi-sub">${esc(x.subject)}</div></div></button>`).join('')}</div>
        <article class="mail-read"><header>${avatar(m.from, 'md')}<div><h3>${esc(m.subject)}</h3><div class="muted small">De: ${esc(c.name)} · Para: ${esc(S.agent || 'Detective')} · Caso 001</div></div></header>
        <div class="mail-body">${m.body}${m.photo ? `<img class="mail-photo" src="${IMG(m.photo)}" alt="">` : ''}</div>
        ${m.attach && m.attach.length ? `<div class="kicker">Adjuntos</div><div class="evgrid small">${m.attach.map(id => evThumb(evById(id))).join('')}</div>` : ''}
        ${m.action ? `<div class="btnrow"><button class="btn gold" data-mact="${m.action.act}">${m.action.label}</button></div>` : ''}</article></div>`;
      b.querySelectorAll('[data-mail]').forEach(x => x.onclick = () => { b.dataset.sel = x.dataset.mail; this.refresh(b); OS.refreshChrome(); });
      b.querySelectorAll('[data-mact]').forEach(x => x.onclick = () => { const a = x.dataset.mact.split(':'); if (a[0] === 'mission') GAME.goMission(a[1] === 'secret' ? 'secret' : +a[1]); });
      bindEv(b); OS.refreshChrome();
    } },

  /* ---------------- Expedientes ---------------- */
  expedientes: { title: 'Expedientes', icon: 'expedientes', accent: '#c9d2e0', w: 940, h: 620, desk: true,
    rel: { bruno: ['E-07', 'E-08', 'E-09', 'E-11'], molina: ['E-04', 'E-12', 'E-05', 'E-06'], ramiro: ['E-03'], sofia: ['E-13'], tomas: ['E-10'], valeria: ['E-02', 'E-01'] },
    people() {
      const st = suspectStage();
      const L = [{ id: 'valeria', name: 'Valeria Ríos', role: 'Estudiante de 5.º · tarjeta EST-05 · víctima', open: !!S.done.m3, status: 'VÍCTIMA', notes: [[3, 'Mejor promedio del colegio (19.4) y finalista de la Beca Horizonte.'], [3, 'Su registro académico fue marcado como «eliminado» a las 23:12.']] }];
      SUSPECTS.forEach(s => { const cleared = s.cleared && st >= s.cleared, culprit = s.id === 'bruno' && S.accused;
        L.push({ id: s.id, name: s.name, role: s.role, open: st >= s.unlock, status: culprit ? 'CULPABLE' : cleared ? 'COARTADA' : 'SOSPECHOSO', notes: s.notes }); });
      return L;
    },
    render(b) { this.refresh(b); },
    refresh(b) {
      const st = suspectStage(); const P = this.people();
      let sel = b.dataset.sel; if (!P.find(p => p.id === sel && p.open)) sel = (P.find(p => p.open) || {}).id;
      b.dataset.sel = sel || '';
      const p = P.find(x => x.id === sel);
      const stCls = s => ({ 'CULPABLE': 'red', 'COARTADA': 'green', 'VÍCTIMA': 'blue', 'SOSPECHOSO': 'gold' }[s]);
      const list = P.map(x => x.open ? `<button class="sus ${x.id === sel ? 'on' : ''}" data-sus="${x.id}">${avatar(x.id, 'md')}<div><b>${esc(x.name)}</b><span>${esc(x.role.split('·')[0])}</span><em class="st ${stCls(x.status)}">${x.status}</em></div></button>`
        : `<div class="sus locked">${svg('lock')}<div><b>Expediente sellado</b><span>Se abre con la investigación</span></div></div>`).join('');
      let det = `<div class="exp-empty">${svg('expedientes')}<p>Aún no hay expedientes abiertos. Resuelve la misión 3 para identificar a la víctima.</p></div>`;
      if (p) {
        const notes = p.notes.filter(n => st >= n[0]).map(n => `<li>${n[1]}</li>`).join('');
        const evs = (this.rel[p.id] || []).map(evById).filter(e => GAME.isUnlocked(e.unlock));
        const canAccuse = S.done.m9 && !S.accused && p.id !== 'valeria';
        det = `<div class="exp-card"><div class="exp-photo"><img src="${IMG(p.id === 'bruno' && S.accused ? 'P-05b' : PORTRAIT[p.id])}" alt="Retrato de ${esc(p.name)}"></div>
          <div class="exp-info"><div class="kicker">Expediente · ${p.id === 'valeria' ? 'víctima' : 'persona de interés'}</div><h2>${esc(p.name)}</h2><div class="muted">${esc(p.role)}</div><em class="st big ${stCls(p.status)}">${p.status}</em>
          <h4>Notas de la investigación</h4><ul class="notes">${notes || '<li class="muted">Aún no hay notas.</li>'}</ul>
          ${evs.length ? `<h4>Evidencias vinculadas</h4><div class="evgrid small">${evs.map(e => evThumb(e)).join('')}</div>` : ''}
          ${canAccuse ? `<div class="btnrow"><button class="btn gold" data-fiscal>⚖ Ir al Informe al fiscal</button></div>` : ''}</div></div>`;
      }
      b.innerHTML = `<div class="exp" style="${texBg('T-02', .86, .9)}"><aside class="exp-list">${list}</aside><section class="exp-det">${det}</section></div>`;
      b.querySelectorAll('[data-sus]').forEach(x => x.onclick = () => { b.dataset.sel = x.dataset.sus; this.refresh(b); });
      const f = b.querySelector('[data-fiscal]'); if (f) f.onclick = () => OS.open('fiscal');
      bindEv(b);
    } },

  /* ---------------- Evidencias ---------------- */
  evidencias: { title: 'Evidencias', icon: 'evidencias', accent: '#e87a6e', w: 640, h: 560, desk: true,
    badge() { return evUnlocked().filter(e => !S.evSeen[e.id]).length; },
    render(b) { this.refresh(b); },
    refresh(b) {
      const f = b.dataset.f || 'todas'; const U = evUnlocked(); const all = [...MISSIONS, SECRET];
      const clues = all.filter(m => S.done[m.id]);
      const shown = U.filter(e => f === 'todas' || (f === 'fotos' && ['Foto', 'Cámara', 'Prueba'].includes(e.kind)) || (f === 'docs' && ['Documento', 'Registro'].includes(e.kind)));
      b.innerHTML = `<div class="evapp" style="${texBg('T-01', .72, .82)}"><div class="evbar"><div class="seg">${[['todas', 'Todas'], ['fotos', 'Fotos y pruebas'], ['docs', 'Documentos'], ['pistas', 'Pistas']].map(x => `<button data-f="${x[0]}" class="${f === x[0] ? 'on' : ''}">${x[1]}</button>`).join('')}</div><span class="muted small">${U.length}/${EVIDENCE.length} evidencias · ${clues.length}/${all.length} pistas</span></div>
        ${f === 'pistas' ? `<div class="clues">${clues.map(m => `<div class="cluecard"><div class="kicker">${esc(m.title)}</div><div class="t">${m.clue.t}</div>${m.clue.d}</div>`).join('') || '<p class="muted">Resuelve misiones para reunir pistas.</p>'}${all.filter(m => !S.done[m.id]).map(() => `<div class="lockedfile">${svg('lock')} Pista sin descubrir</div>`).join('')}</div>`
        : `<div class="evgrid">${shown.map(e => evThumb(e)).join('')}${f === 'todas' ? EVIDENCE.filter(e => !GAME.isUnlocked(e.unlock)).map(() => `<div class="evc locked">${svg('lock')}<span>Por descubrir</span></div>`).join('') : ''}</div>`}</div>`;
      b.querySelectorAll('[data-f]').forEach(x => x.onclick = () => { b.dataset.f = x.dataset.f; this.refresh(b); });
      bindEv(b);
    } },

  /* ---------------- Visor de evidencias ---------------- */
  visor: { title: 'Visor de evidencias', short: 'Visor', icon: 'visor', accent: '#e87a6e', w: 820, h: 640, menu: false, transient: true,
    render(b, opt) { b.dataset.ev = (opt && opt.ev) || b.dataset.ev || 'E-01'; this.refresh(b); },
    refresh(b, opt) {
      if (opt && opt.ev) b.dataset.ev = opt.ev;
      const U = evUnlocked(); let e = evById(b.dataset.ev); if (!e || !GAME.isUnlocked(e.unlock)) e = U[0];
      S.evSeen[e.id] = true; save();
      const k = U.indexOf(e);
      const src = MISSIONS.find(m => m.id === e.unlock) || (e.unlock === 'intro' ? { title: 'Correo de la inspectora Ortega' } : null);
      b.innerHTML = `<div class="visor"><div class="visor-media">${e.img ? `<img src="${IMG(e.img)}" alt="${esc(e.title)}">` : terminalEvidenceHTML()}</div>
        <div class="visor-info"><div><span class="kicker">${e.kind} · ${e.id} · ${esc(e.place)}</span><h3>${esc(e.title)}</h3><p>${e.desc}</p>${src ? `<p class="muted small">Descubierta en: ${esc(src.title)}</p>` : ''}</div>
        <div class="visor-nav"><button class="btn small ghost" data-nav="-1" ${k <= 0 ? 'disabled' : ''} aria-label="Evidencia anterior">◀</button><span class="muted small">${k + 1} / ${U.length}</span><button class="btn small ghost" data-nav="1" ${k >= U.length - 1 ? 'disabled' : ''} aria-label="Evidencia siguiente">▶</button></div></div></div>`;
      b.querySelectorAll('[data-nav]').forEach(x => x.onclick = () => { b.dataset.ev = U[k + +x.dataset.nav].id; this.refresh(b); });
      OS.setSub('visor', e.id); OS.refreshChrome(); GAME.refreshAll(['evidencias']);
    } },

  /* ---------------- Cámaras ---------------- */
  camaras: { title: 'Cámaras de seguridad', short: 'Cámaras', icon: 'camaras', accent: '#b79ceb', w: 900, h: 600, desk: true,
    render(b) { b.dataset.t0 = Date.now(); this.refresh(b); clearInterval(b._iv); b._iv = setInterval(() => this.tick(b), 1000); },
    onClose(b) { clearInterval(b._iv); },
    tick(b) {
      const dt = Math.floor((Date.now() - +b.dataset.t0) / 1000);
      b.querySelectorAll('[data-clock0]').forEach(el => { const [h, m, s] = el.dataset.clock0.split(':').map(Number); const t = (h * 3600 + m * 60 + s + dt) % 86400;
        el.textContent = `14-03-2026 ${String(t / 3600 | 0).padStart(2, '0')}:${String(t % 3600 / 60 | 0).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; });
    },
    refresh(b) {
      const big = b.dataset.big;
      const cam = c => { const on = GAME.isUnlocked(c.unlock);
        return on ? `<button class="cam ${big === c.id ? 'big' : ''}" data-cam="${c.id}" aria-label="${esc(c.name)}"><img src="${IMG(c.id, big !== c.id)}" alt=""><i class="cam-noise"></i><i class="cam-scan"></i>
          <span class="cam-name">${esc(c.name)}</span><span class="cam-rec"><i></i>REC</span><span class="cam-time" data-clock0="${c.start}"></span></button>`
          : `<div class="cam off"><i class="cam-noise"></i><span class="cam-name">${esc(c.name)}</span><div class="cam-lock">${svg('lock')}<b>Señal cifrada</b><span>Se desbloquea al avanzar en el caso</span></div></div>`; };
      const archive = S.done.m8 ? `<button class="btn small" data-ev="E-07">Archivo · CAM 03 · 23:04:17</button>` : `<span class="muted small">${svg('lock')} Grabación clave por descubrir</span>`;
      b.innerHTML = `<div class="cams"><div class="cams-bar"><span class="kicker">Grabaciones del 14/03/2026 · Colegio Santa Aurora</span>${archive}</div>
        ${big ? `<div class="cam-one">${cam(CAMERAS.find(c => c.id === big))}<button class="btn small ghost" data-grid>← Ver todas las cámaras</button></div>` : `<div class="camgrid">${CAMERAS.map(cam).join('')}</div>`}</div>`;
      b.querySelectorAll('[data-cam]').forEach(x => x.onclick = () => { b.dataset.big = big ? '' : x.dataset.cam; this.refresh(b); });
      const g = b.querySelector('[data-grid]'); if (g) g.onclick = () => { b.dataset.big = ''; this.refresh(b); };
      bindEv(b); this.tick(b);
    } },

  /* ---------------- Plano ---------------- */
  plano: { title: 'Plano del colegio', short: 'Plano', icon: 'plano', accent: '#5cc8a0', w: 860, h: 560, desk: true,
    render(b) { this.refresh(b); },
    refresh(b) {
      const focus = GAME.mode === 'sandbox' ? [] : (GAME.mission().map || []);
      const sel = b.dataset.room || (focus[0] ? String(focus[0]) : '6');
      const R = (id, x, y, w, h, label) => `<g class="room ${focus.includes(+id) ? 'focus' : ''} ${sel === String(id) ? 'sel' : ''}" data-room="${id}" tabindex="0" role="button" aria-label="${esc(ROOMS[id].name)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/><text x="${x + 8}" y="${y + 18}">${label}</text>${/^\d$/.test(id) ? `<text class="id" x="${x + 8}" y="${y + h - 8}">aula_id ${id}</text>` : ''}</g>`;
      const r = ROOMS[sel];
      let stats = '';
      if (/^\d$/.test(sel)) { const d = GAME.work; const n = d.exec(`SELECT COUNT(*) FROM accesos WHERE aula_id = ${sel} AND fecha = '2026-03-14'`)[0].values[0][0]; stats = `<p class="small">Accesos registrados el 14/03: <b>${n}</b></p><button class="btn small" data-ins="aula_id = ${sel}">Insertar «aula_id = ${sel}» en la terminal</button>`; }
      b.innerHTML = `<div class="plano"><svg class="mapsvg" viewBox="0 0 400 330" role="img" aria-label="Plano del Colegio Santa Aurora">
        <text class="fl" x="6" y="14">SEGUNDO PISO</text><rect class="floor" x="2" y="20" width="396" height="130" rx="8"/>
        ${R(4, 12, 30, 130, 84, 'Biblioteca')}${R(5, 150, 30, 120, 84, 'Laboratorio')}${R(6, 278, 30, 110, 84, 'Servidores')}${R('p2', 12, 120, 376, 24, 'Pasillo · 2.º piso')}
        <text class="fl" x="6" y="174">PRIMER PISO</text><rect class="floor" x="2" y="180" width="396" height="146" rx="8"/>
        ${R(1, 12, 190, 150, 70, 'Auditorio')}${R(2, 170, 190, 100, 70, 'Aula 101')}${R(7, 278, 190, 110, 70, 'Secretaría')}${R(3, 12, 266, 150, 52, 'Sala de Profesores')}${R('p1', 170, 266, 218, 52, 'Pasillo · expendedora')}</svg>
        <aside class="plano-side">${r.img ? `<img src="${IMG(r.img, true)}" alt="${esc(r.name)}">` : `<div class="noimg">${svg('plano')}</div>`}<h3>${esc(r.name)}</h3><p class="muted small">${r.floor === 2 ? 'Segundo piso' : 'Primer piso'}${/^\d$/.test(sel) ? ` · aula_id ${sel}` : ''}</p><p>${r.note}</p>${stats}
        <p class="muted small">${focus.length ? 'En rojo: las zonas clave de la misión actual.' : 'Haz clic en una sala para ver su foto.'}</p></aside></div>`;
      b.querySelectorAll('[data-room]').forEach(x => { const go = () => { b.dataset.room = x.dataset.room; this.refresh(b); }; x.onclick = go; x.onkeydown = e => { if (e.key === 'Enter') go(); }; });
      const ins = b.querySelector('[data-ins]'); if (ins) ins.onclick = () => { OS.focus('terminal'); TERM.insert(ins.dataset.ins); };
    } },

  /* ---------------- Línea de tiempo ---------------- */
  timeline: { title: 'Línea de tiempo · 14 de marzo', short: 'Línea de tiempo', icon: 'timeline', accent: '#5cc8e0', w: 620, h: 600, desk: true,
    render(b) { this.refresh(b); },
    refresh(b) {
      const night = b.dataset.night === '1';
      const U = TIMELINE.filter(t => GAME.isUnlocked(t.u)).filter(t => !night || t.t >= '22:00');
      const locked = TIMELINE.filter(t => !GAME.isUnlocked(t.u)).length;
      b.innerHTML = `<div class="app-pad"><div class="tl-bar"><label class="switch"><input type="checkbox" ${night ? 'checked' : ''} data-night> Solo la noche (22:00–24:00)</label><span class="muted small">${TIMELINE.length - locked}/${TIMELINE.length} hechos confirmados</span></div>
        <ol class="tl">${U.map(t => `<li class="${t.key ? 'key' : ''} ${t.t >= '23:00' && t.t <= '23:20' ? 'win' : ''}"><time>${t.t}</time><div class="tl-b"><p>${t.text}</p><div class="tl-meta">${t.who.map(w => avatar(w, 'xs')).join('')}<span class="chip">${t.src}</span>${t.ev && GAME.isUnlocked(evById(t.ev).unlock) ? `<button class="chip link" data-ev="${t.ev}">${t.ev}</button>` : ''}</div></div></li>`).join('')}</ol>
        ${locked ? `<p class="lockedfile">${svg('lock')} ${locked} hechos por confirmar con tus consultas</p>` : ''}
        <p class="muted small">La franja dorada marca la ventana del crimen (23:00–23:20).</p></div>`;
      b.querySelector('[data-night]').onchange = e => { b.dataset.night = e.target.checked ? '1' : ''; this.refresh(b); };
      bindEv(b);
    } },

  /* ---------------- Notas ---------------- */
  notas: { title: 'Notas', icon: 'notas', accent: '#e8c68a', w: 420, h: 460, desk: true,
    render(b) {
      b.innerHTML = `<div class="notes-app"><label class="muted small" for="notesTa">Tus apuntes se guardan automáticamente.</label><textarea id="notesTa" spellcheck="true" placeholder="· ¿Quién gana si Valeria desaparece?\n· Revisar puertas con tarjeta\n· Hora clave: 23:12"></textarea></div>`;
      const t = b.querySelector('textarea'); t.value = S.notes || ''; t.oninput = () => { S.notes = t.value; save(); };
    } },

  /* ---------------- Manual SQL ---------------- */
  manual: { title: 'Manual SQL', icon: 'manual', accent: '#e8c68a', w: 640, h: 600, desk: true,
    render(b) { this.refresh(b); },
    refresh(b) {
      const list = [...MISSIONS, SECRET].filter(m => S.done[m.id] || (GAME.mode !== 'sandbox' && GAME.mission() === m));
      const learned = new Set(); Object.keys(LEARNED).forEach(k => { if (S.done[k]) LEARNED[k].forEach(x => learned.add(x)); });
      b.innerHTML = `<div class="app-pad"><div class="kicker">Manual del detective</div><h2>Conceptos aprendidos</h2>
        ${list.length ? list.map(m => m.concepts.map(c => `<div class="concept"><div class="h"><b>${c.k}</b><span class="muted small">${m.title}${S.done[m.id] ? '' : ' · en curso'}</span></div><div>${c.d}</div>${c.ex ? `<pre>${esc(c.ex)}</pre>` : ''}</div>`).join('')).join('') : '<p class="muted">Aún no hay conceptos.</p>'}
        <div class="concept"><div class="h"><b>Orden de una consulta</b></div><pre>SELECT columnas\nFROM tabla\nWHERE condiciones\nGROUP BY columna\nHAVING condición_de_grupo\nORDER BY columna ASC|DESC\nLIMIT n;</pre></div>
        <h3>Niveles</h3><div class="levels">${LEVELS.map(l => `<div class="level"><div class="n">NIVEL ${l.n}</div><b>${l.t}</b><div class="c">${l.c.map(c => `<span class="chip ${learned.has(c) ? 'ok' : ''}">${learned.has(c) ? '✓ ' : ''}${c}</span>`).join('')}</div></div>`).join('')}</div>
        <div class="btnrow"><button class="btn small" data-tut>Repetir la guía de bienvenida</button></div></div>`;
      b.querySelector('[data-tut]').onclick = () => OS.open('guia');
    } },

  /* ---------------- Perfil del agente: rango, XP, insignias ---------------- */
  perfil: { title: 'Perfil del agente', short: 'Perfil', icon: 'perfil', accent: '#e0b25c', w: 620, h: 600, desk: true,
    render(b) { this.refresh(b); },
    refresh(b) {
      const { r, next } = rankOf(S.xp); const pct = next ? ((S.xp - r[0]) / (next[0] - r[0])) * 100 : 100;
      const hints = Object.values(S.hints).reduce((a, x) => a + x, 0);
      b.innerHTML = `<div class="app-pad"><div class="prof-hd">${svg('lumen', 'big')}<div><div class="kicker">Agencia Lumen · Agente</div><h2>${esc(S.agent || 'Detective')}</h2><div>${r[1]}</div></div></div>
        <div class="xpbar"><i style="width:${Math.min(100, pct)}%"></i></div><div class="muted small">${next ? `${S.xp} / ${next[0]} XP para «${next[1]}»` : `${S.xp} XP · rango máximo`}</div>
        <div class="stats"><div><b>${GAME.doneCount()}/10</b><span>Misiones</span></div><div><b>${S.queries || 0}</b><span>Consultas</span></div><div><b>${hints}</b><span>Pistas usadas</span></div><div><b>${S.badges.length}/${BADGES.length}</b><span>Insignias</span></div></div>
        <h3>Insignias</h3><div class="badges">${BADGES.map(x => `<div class="bdg ${S.badges.includes(x.id) ? 'got' : ''}"><div class="ic">${x.ic}</div><b>${x.n}</b><span>${x.d}</span></div>`).join('')}</div>
        <div class="btnrow"><button class="btn small danger" data-reset>Reiniciar progreso</button></div></div>`;
      b.querySelector('[data-reset]').onclick = () => GAME.askReset();
    } },

  /* ---------------- Informe al fiscal (acusación) ---------------- */
  fiscal: { title: 'Informe al fiscal', short: 'Fiscal', icon: 'fiscal', accent: '#e87a6e', w: 820, h: 600, desk: true,
    visible: () => !!S.done.m9, badge: () => (S.done.m9 && !S.accused ? 1 : 0),
    render(b) { this.refresh(b); },
    refresh(b, msg) {
      if (!S.done.m9) { b.innerHTML = `<div class="app-pad"><p class="muted">Necesitas resolver la misión 9 para preparar el informe.</p></div>`; return; }
      if (S.accused) { b.innerHTML = `<div class="fiscal" style="${texBg('T-02')}"><div class="fiscal-in"><div class="kicker">Informe enviado</div><h2>Responsable identificado</h2><div class="sus-pick done"><div class="pick on"><img src="${IMG('P-05b', true)}" alt=""><b>Bruno Castañeda</b><span>EST-02</span></div></div><p>La Fiscalía recibió el informe. ${S.done.m10 ? 'El registro de Valeria ya fue restaurado.' : 'Falta la última misión: restaurar el registro de Valeria.'}</p>${S.done.m10 ? '' : '<div class="btnrow"><button class="btn gold" data-m10>Ir a la misión 10 ▶</button></div>'}</div></div>`;
        const m10 = b.querySelector('[data-m10]'); if (m10) m10.onclick = () => GAME.goMission(9); return; }
      const opts = ['bruno', 'tomas', 'sofia', 'molina', 'ramiro'];
      b.innerHTML = `<div class="fiscal" style="${texBg('T-02')}"><div class="fiscal-in"><div class="kicker">Momento de la verdad</div><h2>¿Quién borró el registro de Valeria?</h2>
        <p class="muted">Revisa tus pistas, la línea de tiempo y los expedientes. Si te equivocas, la inspectora te explicará por qué y podrás volver a intentarlo.</p>
        <div class="sus-pick">${opts.map(o => `<button class="pick" data-s="${o}"><img src="${IMG(PORTRAIT[o], true)}" alt=""><b>${CHAR[o].name}</b><span>${SUSPECTS.find(s => s.id === o).role.split('·')[0]}</span></button>`).join('')}</div>
        <div data-msg>${msg || ''}</div><div class="btnrow"><button class="btn small ghost" data-open="expedientes">Ver expedientes</button><button class="btn small ghost" data-open="timeline">Ver línea de tiempo</button></div></div></div>`;
      b.querySelectorAll('[data-s]').forEach(x => x.onclick = () => {
        const r = GAME.accuse(x.dataset.s);
        if (r && !r.ok) this.refresh(b, `<div class="feedback warn"><div class="head">! ${r.t}</div>${dlgHTML([{ who: 'ortega', text: r.d + ' Piénsalo otra vez, detective.' }])}</div>`);
        else { OS.close('fiscal'); }
      });
      b.querySelectorAll('[data-open]').forEach(x => x.onclick = () => OS.open(x.dataset.open));
    } },

  /* ---------------- Guía de bienvenida (tutorial) ---------------- */
  guia: { title: 'Bienvenida a Lumen OS', short: 'Guía', icon: 'guia', accent: '#5cc8e0', w: 640, h: 540, desk: false, transient: true,
    render(b) { b.dataset.i = 0; this.refresh(b); },
    refresh(b) {
      const i = +b.dataset.i || 0;
      const slides = [
        `<div class="kicker">Guía · 1 de 5</div><h2>¿Qué es una base de datos?</h2><p>Imagina un gran <b>archivador</b> donde el colegio guarda toda su información ordenada. Eso es una base de datos.</p><p>Cada cajón del archivador es una <b>tabla</b>. Nuestro caso tiene cinco: <code>estudiantes</code>, <code>profesores</code>, <code>aulas</code>, <code>accesos</code> y <code>eventos</code>.</p>`,
        `<div class="kicker">Guía · 2 de 5</div><h2>Filas y columnas</h2><p>Una tabla se parece a una hoja de cálculo. <b>Haz clic</b> en un encabezado para ver una columna, o en una celda para ver una fila:</p>
         <table class="tut-table" id="tutT"><thead><tr><th data-c="0">id</th><th data-c="1">nombre</th><th data-c="2">grado</th><th data-c="3">promedio</th></tr></thead><tbody><tr><td>1</td><td>Ana</td><td>5to</td><td>16.8</td></tr><tr><td>2</td><td>Bruno</td><td>5to</td><td>18.9</td></tr><tr><td>3</td><td>Camila</td><td>4to</td><td>15.2</td></tr></tbody></table><p id="tutMsg" class="muted">Las <b>columnas</b> son características; las <b>filas</b> son registros individuales.</p>`,
        `<div class="kicker">Guía · 3 de 5</div><h2>La terminal SQL</h2><p>En la ventana <b>Terminal SQL</b> escribes consultas en <b>SQL</b>, el idioma para hablar con las bases de datos.</p><pre class="sqlex">SELECT * FROM aulas;</pre><p>Pulsa <b>▶ Ejecutar</b> (o <span class="kbd">Ctrl + Enter</span>) y verás el resultado como una tabla. Los botones de palabras clave te ayudan a escribir sin errores.</p>`,
        `<div class="kicker">Guía · 4 de 5</div><h2>Tu estación Lumen OS</h2><ul><li>Las ventanas se <b>mueven</b> desde su barra de título, se <b>redimensionan</b> desde los bordes y se pueden <b>minimizar</b>, <b>maximizar</b> y <b>cerrar</b>.</li><li>El botón <b>Organizar</b> de la barra de tareas acomoda todo en <b>Modo estudio</b>: misión, terminal, base de datos y evidencias a la vista.</li><li>Atajos: <span class="kbd">Alt + Shift + E</span> Modo estudio · <span class="kbd">Alt + Shift + F</span> Foco en la terminal.</li><li>Usa el botón de <b>pantalla completa</b> para una experiencia inmersiva.</li></ul>`,
        `<div class="kicker">Guía · 5 de 5</div><h2>Cómo se juega</h2><ul><li>Cada misión explica un concepto y te da un <b>objetivo</b>.</li><li>Si te equivocas, BYTE te explica el problema y puedes intentarlo de nuevo, <b>sin castigo</b>.</li><li>Las <b>pistas</b> están para ayudarte: la primera es gratis.</li><li>Cada consulta correcta revela <b>evidencias</b>, abre <b>expedientes</b>, cámaras y hechos de la <b>línea de tiempo</b>.</li><li>Gana <b>XP</b>, sube de rango y colecciona <b>insignias</b>. Tu progreso se guarda automáticamente.</li></ul>`
      ];
      b.innerHTML = `<div class="app-pad guide">${slides[i]}<div class="btnrow sb"><button class="btn ghost" data-p ${i ? '' : 'disabled'}>← Atrás</button><button class="btn gold" data-n>${i === slides.length - 1 ? '¡Empezar la investigación!' : 'Siguiente →'}</button></div></div>`;
      b.querySelector('[data-p]').onclick = () => { b.dataset.i = i - 1; this.refresh(b); };
      b.querySelector('[data-n]').onclick = () => { if (i < slides.length - 1) { b.dataset.i = i + 1; this.refresh(b); } else GAME.finishTutorial(); };
      const t = b.querySelector('#tutT');
      if (t) { const clear = () => { t.querySelectorAll('.hc,.hr').forEach(x => x.classList.remove('hc', 'hr')); };
        t.querySelectorAll('th').forEach(th => th.onclick = () => { clear(); const c = +th.dataset.c; th.classList.add('hc'); t.querySelectorAll('tbody tr').forEach(tr => tr.children[c].classList.add('hc')); b.querySelector('#tutMsg').innerHTML = `Esto es una <b>columna</b>: <code>${th.textContent}</code>. Guarda el mismo tipo de dato para todos los estudiantes.`; });
        t.querySelectorAll('tbody tr').forEach(tr => tr.onclick = () => { clear(); tr.classList.add('hr'); b.querySelector('#tutMsg').innerHTML = `Esto es una <b>fila</b>: todos los datos de <b>${tr.children[1].textContent}</b>. Cada fila es un registro.`; }); }
    } }
};
