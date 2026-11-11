/* SQL Detective 2.0 — estado, guardado, misiones, XP, insignias y flujo narrativo del Capítulo 1.
   Las reglas educativas son las de la versión 1: mismas misiones, validación, pistas, XP e insignias. */
"use strict";
const KEY1 = 'sqlDetective.v1', KEY2 = 'sqlDetective.v2';
const DEFAULT = () => ({ xp: 0, done: {}, hints: {}, errors: {}, badges: [], clues: [], accused: false, accuseTries: 0, sandboxRuns: 0, current: 0,
  introSeen: false, tutorialSeen: false, drafts: {}, finished: false, queries: 0,
  // 2.0
  v: 2, agent: '', sound: true, layout: 'study', wins: {}, winOrder: [], mailRead: {}, evSeen: {}, notes: '', restoreErr: false, migrated: false, imported: false });
let S = DEFAULT();
(function loadState() {
  try {
    const raw = localStorage.getItem(KEY2);
    if (raw) { S = Object.assign(DEFAULT(), JSON.parse(raw)); return; }
    const v1 = localStorage.getItem(KEY1);
    if (v1) {   // migración desde SQL Detective 1.0: se conserva todo el progreso educativo
      const o = JSON.parse(v1);
      ['xp', 'done', 'hints', 'errors', 'badges', 'clues', 'accused', 'accuseTries', 'sandboxRuns', 'current', 'introSeen', 'tutorialSeen', 'drafts', 'finished', 'queries']
        .forEach(k => { if (o[k] !== undefined) S[k] = o[k]; });
      if (o._restoreErr) S.restoreErr = true;
      S.migrated = true; S.imported = true; S.tutorialSeen = false; // la guía de Lumen OS es nueva
    }
  } catch (e) { S = DEFAULT(); }
})();
function save() { try { localStorage.setItem(KEY2, JSON.stringify(S)); } catch (e) {} }
function rankOf(xp) { let r = RANKS[0], next = null; for (let i = 0; i < RANKS.length; i++) { if (xp >= RANKS[i][0]) { r = RANKS[i]; next = RANKS[i + 1] || null; } } return { r, next }; }

const GAME = (() => {
  let work = null, mode = 'mission';
  const mission = () => mode === 'secret' ? SECRET : MISSIONS[S.current];
  const doneCount = () => MISSIONS.filter(m => S.done[m.id]).length;
  function unlockedIndex() { let i = 0; while (i < MISSIONS.length && S.done[MISSIONS[i].id]) i++; if (i === 9 && !S.accused) return 8; return Math.min(i, MISSIONS.length - 1); }
  function isUnlocked(u) { if (u === 'intro') return true; if (u === 'accused') return S.accused; if (u === 'secret') return !!S.done.secret; return !!S.done[u]; }
  function missionXP(m) { const base = m.xp || 100; const used = S.hints[m.id] || 0; return Math.max(Math.round(base * .55), base - 15 * Math.max(0, used - 1)); }

  /* ---------------- misiones ---------------- */
  function loadMission() {
    if (work) work.close();
    work = ENGINE.freshDB();
    if (mode !== 'sandbox') S.current = Math.min(S.current, unlockedIndex());
    save();
    // Un cambio de misión o de modo afecta a todas las ventanas abiertas (Misión, Base de datos, Plano, Correo…):
    // se vuelven a dibujar todas, no solo la terminal.
    TERM.reset(); refreshAll(); OS.refreshChrome();
  }
  function goMission(i) {
    if (i === 'secret') { if (!S.finished) return OS.notify({ title: 'Caso secreto', text: 'Termina el capítulo para desbloquearlo.', icon: 'lock' }); mode = 'secret'; }
    else { if (i > unlockedIndex()) return OS.notify({ title: 'Misión bloqueada', text: 'Resuelve la misión anterior para continuar la investigación.', icon: 'lock' }); mode = 'mission'; S.current = i; }
    loadMission();
    if (!OS.isOpen('mision') || !OS.isOpen('terminal') || S.layout !== 'study') OS.layout(S.layout === 'focus' ? 'focus' : 'study', true);
    OS.focus('terminal');
  }
  function setMode(m) { if (m === mode) return; if (m === 'sandbox') mode = 'sandbox'; else mode = (mode === 'secret' && m === 'secret') ? 'secret' : 'mission'; loadMission(); }
  function nextMission() { S.current = Math.min(S.current + 1, MISSIONS.length - 1); mode = 'mission'; save(); loadMission(); OS.focus('terminal'); }

  function run(sql) {
    if (!ENGINE.stripComments(sql)) return TERM.feedback('warn', 'La terminal está vacía', [['Problema', 'No hay ninguna consulta para ejecutar.'], ['Pista', 'Escribe una consulta o usa los botones de palabras clave debajo del editor.']]);
    S.queries = (S.queries || 0) + 1;
    let res;
    try { res = ENGINE.execAll(work, sql); }
    catch (e) { refreshAll(['db']); return onSqlError(String(e.message || e), sql); }
    if (!S.badges.includes('first')) gainBadge('first');
    TERM.results(res.last);
    if (mode === 'sandbox') {
      S.sandboxRuns++; save(); if (S.sandboxRuns >= 10) gainBadge('explorer');
      TERM.feedback('ok', 'Consulta ejecutada', [['Resultado', res.last ? `${res.last.values.length} fila(s).` : `Filas modificadas: ${res.changed}.`]]);
      refreshAll(['db', 'mision']); return;
    }
    refreshAll(['db']);
    const m = mission();
    let v;
    if (m.custom === 'restore') {
      const r = ENGINE.checkRestore(res, work); v = r.v;
      if (r.restoreErr) S.restoreErr = true;
      if (r.reset) { work.close(); work = ENGINE.freshDB(); refreshAll(['db']); }
    }
    else if (!res.last) v = { ok: false, level: 'warn', title: 'Necesitamos ver resultados', rows: [['Problema', res.changed ? `Tu instrucción modificó ${res.changed} fila(s), pero esta misión necesita una consulta <code>SELECT</code> que muestre datos.` : 'Tu instrucción no devolvió una tabla de resultados.'], ['Qué significa', 'Solo las consultas <code>SELECT</code> muestran datos. Las instrucciones como UPDATE o DELETE cambian datos, pero no los muestran.'], ['Pista', 'Empieza tu consulta con <code>SELECT</code>. Si cambiaste datos, pulsa «Restaurar datos».']] };
    else v = ENGINE.compare(res.last, m.check);
    if (v.ok) onSuccess(m);
    else { if (v.level !== 'info') { S.errors[m.id] = (S.errors[m.id] || 0) + 1; save(); OS.sfx('error'); } TERM.feedback(v.level || 'warn', v.title, v.rows); nudgeHint(); }
  }
  function onSqlError(msg, sql) {
    const m = mode !== 'sandbox' ? mission() : null;
    if (m) { S.errors[m.id] = (S.errors[m.id] || 0) + 1; save(); }
    const x = ENGINE.explainError(msg, sql, work);
    OS.sfx('error');
    TERM.feedback('err', 'Error en la consulta', [['Problema', x.problem], ['Qué significa', x.meaning], ['Pista', x.hint]], `<div class="fb-raw">SQLite: ${esc(msg)}</div>`);
    TERM.results(null, 'error');
    nudgeHint();
  }
  function nudgeHint() { if (mode !== 'sandbox' && (S.errors[mission().id] || 0) >= 2) refreshAll(['mision']); }
  function useHint() {
    const m = mission(); if (S.hints[m.id] >= m.hints.length) return;
    S.hints[m.id] = (S.hints[m.id] || 0) + 1; save(); OS.sfx('click'); refreshAll(['mision']);
  }
  function restoreData() { if (work) work.close(); work = ENGINE.freshDB(); refreshAll(['db']); TERM.feedback('info', '↺ Datos restaurados', [['Estado', 'La base de datos de esta misión volvió a su estado original.']]); }

  function onSuccess(m) {
    const first = !S.done[m.id];
    if (first) {
      const xp = missionXP(m); S.done[m.id] = true; S.clues.push(m.id); S.xp += xp;
      if (!(S.hints[m.id] > 0)) { const clean = Object.keys(S.done).filter(k => !(S.hints[k] > 0)).length; if (clean >= 3) gainBadge('clean3'); }
      if ((S.errors[m.id] || 0) >= 3) gainBadge('persist');
      if (m.id === 'm10' && !S.restoreErr && !(S.errors.m10 > 0)) gainBadge('surgeon');
      if (m.id === 'm10') { S.finished = true; gainBadge('closed'); }
      if (m.id === 'secret') gainBadge('secret');
      save();
      OS.sfx('success'); confetti();
      TERM.feedback('ok', '¡Correcto! +' + xp + ' XP', [['Resultado', 'Tu consulta obtuvo exactamente la evidencia que necesitábamos.'], ['Siguiente', 'Lee el informe en la ventana <b>Misión</b> para saber qué descubriste.']], `<div class="fb-act"><button class="btn small gold" data-act="report">Ver informe ▶</button></div>`);
      OS.notify({ title: `Pista obtenida: ${m.clue.t}`, text: `+${xp} XP · ${m.title}`, icon: 'evidencias', sound: false, act: () => OS.open('evidencias') });
      const newEv = EVIDENCE.filter(e => e.unlock === m.id);
      if (newEv.length === 1) setTimeout(() => OS.notify({ title: 'Nueva evidencia', text: newEv[0].title, icon: 'evidencias', act: () => openEvidence(newEv[0].id) }), 900);
      else if (newEv.length > 1) setTimeout(() => OS.notify({ title: `${newEv.length} evidencias nuevas`, text: newEv.map(e => e.title).join(' · '), icon: 'evidencias', act: () => OS.open('evidencias') }), 900);
      const newMail = FIXED_MAIL.filter(x => x.when === m.id);
      newMail.forEach(x => setTimeout(() => OS.notify({ title: 'Nuevo correo', text: x.subject, who: x.from, act: () => OS.open('correo', { mail: x.id }) }), 1400));
      if (m.accuse && !S.accused) setTimeout(() => OS.notify({ title: 'Inspectora Ortega', text: 'Ya tienes todas las piezas. Revisa los expedientes y envía tu <b>Informe al fiscal</b>.', who: 'ortega', time: 9000, act: () => OS.open('fiscal') }), 2200);
      const ni = unlockedIndex();
      if (mode === 'mission' && !m.accuse && m.id !== 'm10' && ni > MISSIONS.indexOf(m)) setTimeout(() => OS.notify({ title: 'Nuevo correo', text: `Misión ${ni + 1} · ${MISSIONS[ni].title}`, who: MISSIONS[ni].dialog[0].who, act: () => OS.open('correo', { mail: 'm:' + ni }) }), 2600);
    } else {
      TERM.feedback('ok', '¡Correcto otra vez!', [['Resultado', 'Ya habías resuelto esta misión, así que no suma XP, pero tu consulta es válida.']], `<div class="fb-act"><button class="btn small gold" data-act="report">Ver informe ▶</button></div>`);
    }
    refreshAll(); OS.refreshChrome();
    if (OS.isOpen('mision')) setTimeout(() => { const b = OS.body('mision'); const s = b && b.querySelector('.success'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 200);
  }
  function gainBadge(id) {
    if (S.badges.includes(id)) return; S.badges.push(id); save();
    const b = BADGES.find(x => x.id === id);
    setTimeout(() => OS.notify({ title: `Insignia desbloqueada: ${b.n}`, text: b.d, icon: 'perfil', act: () => OS.open('perfil') }), 700);
    OS.refreshChrome(); refreshAll(['perfil']);
  }
  function openEvidence(id) { S.evSeen[id] = true; save(); OS.open('visor', { ev: id }); OS.refreshChrome(); refreshAll(['evidencias']); }

  /* ---------------- acusación, confesión y desenlace ---------------- */
  function accuse(s) {
    S.accuseTries++; save();
    if (ACCUSE[s].ok) return accuseRight();
    OS.sfx('error'); return ACCUSE[s];
  }
  function accuseRight() {
    S.accused = true; if (S.accuseTries === 1) gainBadge('accuse');
    const bonus = S.accuseTries === 1 ? 50 : 20; S.xp += bonus; save();
    OS.sfx('stamp'); confetti();
    OS.cinema([
      { bg: 'I-10', scene: 'SALA DE PROFESORES · 14/03 · 17:42', who: 'ortega', text: 'Bruno Castañeda. Como asistente del coro, estuvo junto al escritorio de Molina a las 17:05 y devolvió llaves en la Sala de Profesores a las 17:42. Tres minutos después, la tarjeta PRF-03 «desapareció».' },
      { bg: 'I-11', scene: 'PASILLO DEL 2.º PISO · 23:04', who: 'ortega', text: 'Esa noche salió de la biblioteca a las 23:01. A las 23:05 la tarjeta robada abrió la Sala de Servidores y a las 23:12 borró el registro de Valeria. A las 23:19, Bruno volvió a la biblioteca.' },
      { bg: 'I-01', scene: 'SALA DE ENTREVISTAS · AGENCIA LUMEN', who: 'bruno', portrait: 'P-05b', text: '…Yo solo quería la beca. Mi familia no puede pagar la universidad. Pensé que nadie revisaría los registros de las puertas.' },
      { bg: 'I-04', scene: 'SECRETARÍA ACADÉMICA', who: 'ortega', text: 'Siempre hay alguien que revisa los registros. Hoy fue un detective con SQL. Ahora, devolvámosle a Valeria lo que es suyo.', extra: `<div class="cine-stamp">CULPABLE · +${bonus} XP${S.accuseTries === 1 ? ' por acertar al primer intento' : ''}</div>` }
    ], { last: 'Última misión: restaurar el registro ▶', noSkip: false, onDone: () => {
      S.current = 9; mode = 'mission'; save(); loadMission(); OS.refreshChrome(); refreshAll();
      OS.layout('study', true); OS.notify({ title: 'Nuevo correo', text: 'Caso 001 · Informe recibido (Fiscalía)', who: 'fiscal', act: () => OS.open('correo', { mail: 'fiscal' }) });
    } });
  }
  function ending() {
    confetti(160); OS.sfx('success');
    const totalHints = Object.values(S.hints).reduce((a, b) => a + b, 0);
    OS.cinema([
      { bg: 'I-02', scene: 'COLEGIO SANTA AURORA · A LA MAÑANA SIGUIENTE', who: 'valeria', portrait: 'P-08b', text: 'Me dijeron que fue usted quien encontró la verdad. Mañana anunciarán la beca… y mi nombre volverá a estar en la lista. Gracias, detective.' },
      { bg: 'I-01', scene: 'AGENCIA LUMEN', who: 'ortega', text: 'Para ser tu primer caso, nada mal. Empezaste sin saber qué era una tabla y terminaste uniendo tablas y corrigiendo datos. Así se forma un detective de datos.' },
      { bg: 'I-07', who: 'ortega', text: 'Ah, y una cosa más… Ramiro encontró algo raro en los registros del laboratorio. Lo llaman «el fantasma». Te quiero en ese caso.',
        extra: `<div class="cine-stats"><div><b>${S.xp}</b><span>XP total</span></div><div><b>${rankOf(S.xp).r[1]}</b><span>Rango</span></div><div><b>${totalHints}</b><span>Pistas usadas</span></div></div><div class="cine-secret">${svg('lock')} Caso secreto desbloqueado: «El búho nocturno» (COUNT, GROUP BY y HAVING)</div>` }
    ], { last: 'Jugar el caso secreto ▶', onDone: () => { OS.refreshChrome(); refreshAll(); goMission('secret'); } });
  }

  /* ---------------- utilidades de interfaz ---------------- */
  function refreshAll(only) {
    Object.keys(APPS).forEach(id => { if ((!only || only.includes(id)) && OS.isOpen(id) && APPS[id].refresh) APPS[id].refresh(OS.body(id)); });
  }
  function askReset() {
    OS.modal(`<h2>¿Reiniciar el progreso?</h2><p>Se borrarán tu XP, insignias, pistas, correos leídos, notas y misiones completadas en este navegador. No se puede deshacer.</p><div class="mrow"><button class="btn ghost" id="rNo">Cancelar</button><button class="btn danger" id="rYes">Sí, reiniciar</button></div>`);
    $('#rNo').onclick = OS.closeModal;
    $('#rYes').onclick = () => { S = DEFAULT(); S.migrated = true; save(); location.reload(); };
  }

  /* ---------------- arranque ---------------- */
  function start(relogin) {
    const enter = () => {
      if (!S.introSeen) OS.cinema(INTRO_SCENES, { last: 'Abrir mi estación de trabajo ▶', onDone: () => { S.introSeen = true; save(); desktop(true); } });
      else desktop(false);
    };
    if (relogin) OS.login(enter); else OS.boot(() => OS.login(enter));
  }
  function desktop(first) {
    const restored = OS.desktop();
    mode = 'mission'; S.current = Math.min(S.current, unlockedIndex());
    loadMission();
    if (!S.tutorialSeen) { OS.closeAll(); OS.open('correo', { mail: 'intro', silent: true }); OS.open('guia'); }
    else if (!restored) OS.layout(S.layout === 'focus' ? 'focus' : 'study', true);
    if (S.imported) { S.imported = false; save(); setTimeout(() => OS.notify({ title: 'Progreso importado', text: 'Recuperamos tu avance de SQL Detective 1.0: misiones, XP e insignias.', icon: 'reset', time: 9000 }), 1200); }
    const unread = APPS.correo.badge(); if (unread && S.tutorialSeen) setTimeout(() => OS.notify({ title: `Tienes ${unread} correo(s) sin leer`, text: 'Abre Correo Lumen.', icon: 'correo', act: () => OS.open('correo') }), 900);
  }
  function finishTutorial() { S.tutorialSeen = true; save(); OS.close('guia'); OS.layout('study'); }

  return { get mode() { return mode; }, get work() { return work; }, mission, unlockedIndex, isUnlocked, missionXP, doneCount, loadMission, goMission, setMode, nextMission,
    run, useHint, restoreData, accuse, ending, refreshAll, askReset, start, finishTutorial, openEvidence };
})();

/* ---------------- confeti (de la v1) ---------------- */
function confetti(n = 90) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#fx'), x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const cols = ['#f3d48a', '#e0b25c', '#ffffff', '#5cc8e0', '#b5862e'];
  const ps = Array.from({ length: n }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .35, vx: (Math.random() - .5) * 12, vy: -Math.random() * 11 - 4, s: Math.random() * 6 + 3, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[Math.random() * cols.length | 0], l: 1 }));
  let f = 0; (function tick() { x.clearRect(0, 0, c.width, c.height); ps.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += p.vr; p.l -= .008; x.save(); x.globalAlpha = Math.max(0, p.l); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); }); if (++f < 150) requestAnimationFrame(tick); else x.clearRect(0, 0, c.width, c.height); })();
}

/* ---------------- inicio ---------------- */
ENGINE.init().then(() => {
  window.__sqld = { get S() { return S; }, MISSIONS, SECRET, GAME, OS, ENGINE, run: sql => GAME.run(sql), get mode() { return GAME.mode; } };
  OS.bindChrome();
  const ld = $('#loading'); ld.classList.add('fade'); setTimeout(() => ld.remove(), 400);
  GAME.start(false);
}).catch(e => { $('#loading').innerHTML = `<div class="ld-err"><h2>No se pudo iniciar SQLite</h2><p>${esc(e.message || e)}</p></div>`; });
