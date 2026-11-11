/* SQL Detective 2.0 — Lumen OS: arranque, inicio de sesión, cinemáticas, escritorio, gestor de ventanas,
   barra de tareas, menú de inicio, notificaciones, sonidos, pantalla completa y organización de ventanas. */
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------- Iconos SVG (trazo, 24×24) ---------------- */
const ICON = {
  terminal: '<path d="M4 6l5 5-5 5"/><path d="M12 18h8"/>',
  mision: '<path d="M9 3h6l1 3H8z"/><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 11h6M9 15h4"/>',
  db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  expedientes: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="12" r="2"/><path d="M8.5 16.5c.8-1.4 2-2 3.5-2s2.7.6 3.5 2"/>',
  evidencias: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/><path d="M8 10.5h5M10.5 8v5"/>',
  camaras: '<path d="M3 8l10-3 2 6-10 3z"/><path d="M15 9l4-1 1 4-4 1"/><path d="M6 14l-1 6M5 20h4"/>',
  plano: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  timeline: '<path d="M12 3v18"/><circle cx="12" cy="7" r="2"/><circle cx="12" cy="13" r="2"/><circle cx="12" cy="19" r="1.5"/><path d="M14 7h6M4 13h6M14 19h4"/>',
  notas: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4"/><path d="M8 11h8M8 15h8M8 19h5"/>',
  manual: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  perfil: '<circle cx="12" cy="8" r="5"/><path d="M8.2 12.2L7 21l5-3 5 3-1.2-8.8"/>',
  fiscal: '<path d="M12 3v18M5 21h14"/><path d="M5 7h14"/><path d="M5 7l-3 7h6zM19 7l-3 7h6z"/>',
  guia: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><path d="M12 17.5v.5"/>',
  visor: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
  lumen: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v4M12 17v4"/>',
  layout: '<rect x="3" y="4" width="7" height="16" rx="1"/><rect x="12" y="4" width="9" height="7" rx="1"/><rect x="12" y="13" width="9" height="7" rx="1"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  exitfull: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  min: '<path d="M5 12h14"/>', max: '<rect x="5" y="5" width="14" height="14" rx="1"/>',
  restore: '<rect x="4" y="8" width="12" height="12" rx="1"/><path d="M8 8V4h12v12h-4"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>',
  logout: '<path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M18 12H9"/>', reset: '<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
};
const svg = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ''}</svg>`;
const BYTE_AVATAR = `<svg viewBox="0 0 48 48" class="byte-svg" aria-hidden="true"><rect x="6" y="9" width="36" height="28" rx="9" fill="#0d2430" stroke="#5cc8e0" stroke-width="2"/><circle class="byte-eye" cx="18" cy="23" r="3.6" fill="#5cc8e0"/><circle class="byte-eye" cx="30" cy="23" r="3.6" fill="#5cc8e0"/><path d="M18 31h12" stroke="#5cc8e0" stroke-width="2" stroke-linecap="round"/><path d="M24 9V4" stroke="#5cc8e0" stroke-width="2"/><circle cx="24" cy="4" r="2" fill="#e0b25c"/></svg>`;

/** Avatar de un personaje: foto real si existe, BYTE animado o iniciales. */
function avatar(who, cls = '') {
  if (who === 'byte') return `<div class="av ${cls} av-byte" title="BYTE">${BYTE_AVATAR}</div>`;
  const c = CHAR[who] || CHAR.sistema;
  if (PORTRAIT[who]) return `<div class="av ${cls}"><img src="${IMG(PORTRAIT[who], true)}" alt="${esc(c.name)}" loading="lazy"></div>`;
  return `<div class="av ${cls} av-txt" style="--c:${c.color}">${c.short}</div>`;
}

const OS = (() => {
  /* ---------------- Sonido (sintetizado con WebAudio: sin archivos) ---------------- */
  let actx = null;
  function audio() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } } if (actx && actx.state === 'suspended') actx.resume(); return actx; }
  function tone(f, d, type = 'sine', vol = 0.05, when = 0, slide = 0) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + when;
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + 0.02);
  }
  const SFX = {
    click: () => tone(1200, 0.04, 'square', 0.015),
    open: () => { tone(520, 0.08, 'sine', 0.03); tone(780, 0.1, 'sine', 0.025, 0.05); },
    close: () => tone(600, 0.1, 'sine', 0.025, 0, 0.6),
    notify: () => { tone(880, 0.12, 'triangle', 0.04); tone(1320, 0.18, 'triangle', 0.035, 0.1); },
    success: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.045, i * 0.09)); },
    error: () => { tone(220, 0.16, 'sawtooth', 0.025); tone(180, 0.2, 'sawtooth', 0.02, 0.12); },
    boot: () => { tone(110, 0.9, 'sine', 0.05, 0, 2); tone(220, 0.7, 'sine', 0.03, 0.3, 1.5); },
    stamp: () => { tone(90, 0.25, 'square', 0.05, 0, 0.5); }
  };
  function sfx(n) { if (!S.sound || !SFX[n]) return; try { SFX[n](); } catch (e) {} }

  /* ---------------- Pantalla completa ---------------- */
  function isFull() { return !!document.fullscreenElement; }
  function toggleFull() {
    try { if (isFull()) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => notify({ title: 'Pantalla completa', text: 'Tu navegador no permitió la pantalla completa. Prueba con la tecla F11.' })); }
    catch (e) { notify({ title: 'Pantalla completa', text: 'Prueba con la tecla F11.' }); }
  }
  document.addEventListener('fullscreenchange', () => { const b = $('#tbFull'); if (b) b.innerHTML = svg(isFull() ? 'exitfull' : 'full'); });

  /* ---------------- Arranque e inicio de sesión ---------------- */
  function boot(done) {
    const el = $('#boot'); el.classList.add('on');
    const lines = ['LUMEN OS 4.2 — Estación de investigación digital', 'Comprobando memoria ............ OK', 'Cargando motor SQLite (sql.js 1.10.3) ... OK',
      'Montando /casos/001/santa-aurora ....... OK', 'Cifrando canal con la Agencia Lumen ..... OK', 'Iniciando BYTE · asistente de terminal ... OK'];
    const box = $('#bootLines'); box.innerHTML = ''; let i = 0, fin = false;
    const finish = () => { if (fin) return; fin = true; clearInterval(t); el.classList.add('fade'); setTimeout(() => { el.classList.remove('on', 'fade'); done(); }, 350); window.removeEventListener('keydown', finish); el.removeEventListener('click', finish); };
    const t = setInterval(() => { if (i < lines.length) { box.insertAdjacentHTML('beforeend', `<div>${esc(lines[i++])}</div>`); } else finish(); }, 260);
    window.addEventListener('keydown', finish); el.addEventListener('click', finish);
  }
  function login(onEnter) {
    const el = $('#login'); el.classList.add('on');
    $('#loginBg').style.backgroundImage = `url("${IMG('I-01')}")`;
    $('#loginCase').style.backgroundImage = `url("${IMG('I-02', true)}")`;
    const n = $('#agentName'); n.value = S.agent || '';
    const done = MISSIONS.filter(m => S.done[m.id]).length;
    $('#loginStatus').textContent = S.introSeen ? `Caso 001 en curso · ${done}/10 misiones · ${S.xp} XP` : 'Caso 001 asignado · sin iniciar';
    $('#loginBtn').textContent = S.introSeen ? 'Continuar investigación' : 'Iniciar sesión';
    const go = e => {
      e && e.preventDefault();
      const name = n.value.trim().slice(0, 24); S.agent = name || 'Detective'; save();
      audio(); sfx('boot');
      el.classList.add('fade'); setTimeout(() => { el.classList.remove('on', 'fade'); onEnter(); }, 400);
    };
    $('#loginForm').onsubmit = go;
    $('#loginFull').onclick = toggleFull;
    setTimeout(() => n.focus(), 50);
    tickClock();
  }

  /* ---------------- Cinemáticas con fotografías ---------------- */
  function cinema(scenes, opts = {}) {
    const el = $('#cine'); el.classList.add('on'); let i = 0;
    const show = () => {
      const s = scenes[i]; const c = CHAR[s.who] || {};
      const bg = $('#cineBg');
      if (s.bg) { bg.classList.remove('kb'); void bg.offsetWidth; bg.style.backgroundImage = `url("${IMG(s.bg)}")`; bg.classList.add('kb'); }
      if (s.scene) $('#cineScene').textContent = s.scene;
      $('#cinePortrait').innerHTML = s.portrait ? `<img src="${IMG(s.portrait)}" alt="">` : '';
      $('#cinePortrait').classList.toggle('on', !!s.portrait);
      $('#cineLine').innerHTML = (c.narr ? `<div class="cine-text narr">${s.text}</div>` : `${avatar(s.who, 'lg')}<div><div class="cine-who" style="color:${c.color}">${c.name}</div><div class="cine-text">${s.text}</div></div>`) + (s.extra || '');
      $('#cineDots').innerHTML = scenes.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('');
      $('#cineNext').textContent = i === scenes.length - 1 ? (opts.last || 'Continuar ▶') : 'Continuar';
      $('#cineSkip').style.display = opts.noSkip ? 'none' : '';
      if (s.sfx) sfx(s.sfx);
    };
    const end = () => { el.classList.remove('on'); window.removeEventListener('keydown', key); opts.onDone && opts.onDone(); };
    const next = () => { if (i < scenes.length - 1) { i++; show(); } else end(); };
    const key = e => { if (['Enter', ' ', 'ArrowRight'].includes(e.key)) { e.preventDefault(); next(); } if (e.key === 'Escape' && !opts.noSkip) end(); };
    $('#cineNext').onclick = next; $('#cineSkip').onclick = end;
    window.addEventListener('keydown', key);
    show(); setTimeout(() => $('#cineNext').focus(), 30);
  }

  /* ---------------- Gestor de ventanas ---------------- */
  let root, zTop = 20, active = null, saveT = null;
  const wins = {};   // id -> {el, x,y,w,h, max, min, prev}
  const order = [];  // orden de apertura (barra de tareas)
  const GAP = 8, MINW = 300, MINH = 190;
  const isMobile = () => window.innerWidth < 760;
  function area() { return { w: root.clientWidth, h: root.clientHeight }; }
  function persist() { clearTimeout(saveT); saveT = setTimeout(() => {
    S.wins = {}; order.forEach(id => { const w = wins[id]; S.wins[id] = { x: w.x, y: w.y, w: w.w, h: w.h, max: w.max, min: w.min }; });
    S.winOrder = order.slice(); save(); }, 250); }
  function place(w) {
    const el = w.el;
    if (w.max) { el.style.left = '0px'; el.style.top = '0px'; el.style.width = '100%'; el.style.height = '100%'; }
    else { el.style.left = w.x + 'px'; el.style.top = w.y + 'px'; el.style.width = w.w + 'px'; el.style.height = w.h + 'px'; }
    el.classList.toggle('max', !!w.max); el.classList.toggle('min', !!w.min);
    const mb = el.querySelector('[data-w=max]'); if (mb) { mb.innerHTML = svg(w.max ? 'restore' : 'max'); mb.setAttribute('aria-label', w.max ? 'Restaurar' : 'Maximizar'); }
  }
  function clamp(w) {
    const A = area();
    w.w = Math.max(Math.min(w.w, A.w), Math.min(MINW, A.w)); w.h = Math.max(Math.min(w.h, A.h), Math.min(MINH, A.h));
    w.x = Math.min(Math.max(w.x, -w.w + 120), A.w - 120); w.y = Math.min(Math.max(w.y, 0), A.h - 40);
  }
  function defaultRect(app) {
    const A = area(); const n = order.length;
    const w = Math.min(app.w || 720, A.w - 40), h = Math.min(app.h || 520, A.h - 40);
    return { x: Math.max(10, Math.round((A.w - w) / 2) - 120 + (n % 6) * 34), y: Math.max(10, Math.round((A.h - h) / 2) - 60 + (n % 6) * 30), w, h };
  }
  function open(id, opt = {}) {
    const app = APPS[id]; if (!app) return null;
    if (wins[id]) { const w = wins[id]; if (w.min) { w.min = false; place(w); } focus(id); if (opt.refresh !== false && app.refresh) app.refresh(w.body, opt); persist(); return w; }
    const el = document.createElement('section'); el.className = 'win opening'; el.dataset.app = id; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', app.title);
    el.style.setProperty('--acc', app.accent || '#e0b25c');
    el.innerHTML = `<header class="win-hd"><span class="win-ic">${svg(app.icon)}</span><span class="win-title">${esc(app.title)}</span><span class="win-sub" data-sub></span>
      <div class="win-btns"><button data-w="min" aria-label="Minimizar" title="Minimizar">${svg('min')}</button><button data-w="max" aria-label="Maximizar" title="Maximizar">${svg('max')}</button><button data-w="close" class="x" aria-label="Cerrar" title="Cerrar">${svg('close')}</button></div></header>
      <div class="win-bd"></div>${['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(d => `<i class="rz rz-${d}" data-rz="${d}"></i>`).join('')}`;
    root.appendChild(el);
    const saved = (S.wins || {})[id];
    const r = opt.rect || (saved && !opt.fresh ? saved : defaultRect(app));
    const w = wins[id] = { el, body: el.querySelector('.win-bd'), x: r.x, y: r.y, w: r.w, h: r.h, max: !!(saved && saved.max && !opt.rect), min: false };
    clamp(w); place(w); order.push(id);
    bindWin(id); app.render(w.body, opt);
    focus(id); renderTaskbar(); persist();
    if (!opt.silent) sfx('open');
    setTimeout(() => el.classList.remove('opening'), 200);
    return w;
  }
  function close(id) {
    const w = wins[id]; if (!w) return;
    const app = APPS[id]; if (app.onClose) app.onClose(w.body);
    w.el.classList.add('closing'); sfx('close');
    setTimeout(() => w.el.remove(), 140);
    delete wins[id]; order.splice(order.indexOf(id), 1);
    if (active === id) { active = null; const top = topWin(); if (top) focus(top); }
    renderTaskbar(); persist();
  }
  function minimize(id) { const w = wins[id]; if (!w) return; w.min = true; place(w); if (active === id) { active = null; const t = topWin(); if (t) focus(t); } renderTaskbar(); persist(); }
  function toggleMax(id) { const w = wins[id]; if (!w) return; w.max = !w.max; w.min = false; place(w); focus(id); S.layout = 'free'; persist(); }
  function topWin() { let best = null, z = -1; order.forEach(id => { const w = wins[id]; if (!w.min && +w.el.style.zIndex > z) { z = +w.el.style.zIndex; best = id; } }); return best; }
  function focus(id) {
    const w = wins[id]; if (!w) return;
    if (w.min) { w.min = false; place(w); }
    if (active !== id) w.el.style.zIndex = ++zTop;
    active = id; $$('.win').forEach(e => e.classList.toggle('active', e === w.el)); renderTaskbar();
    if (APPS[id].onFocus) APPS[id].onFocus(w.body);
  }
  function bindWin(id) {
    const w = wins[id], el = w.el, hd = el.querySelector('.win-hd');
    el.addEventListener('pointerdown', () => { if (active !== id) focus(id); }, true);
    el.querySelector('[data-w=min]').onclick = e => { e.stopPropagation(); minimize(id); };
    el.querySelector('[data-w=max]').onclick = e => { e.stopPropagation(); toggleMax(id); };
    el.querySelector('[data-w=close]').onclick = e => { e.stopPropagation(); close(id); };
    hd.addEventListener('dblclick', e => { if (!e.target.closest('button')) toggleMax(id); });
    // arrastrar
    hd.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button') || isMobile()) return;
      e.preventDefault(); hd.setPointerCapture(e.pointerId);
      const A = area(), rb = root.getBoundingClientRect();
      let sx = e.clientX, sy = e.clientY, ox = w.x, oy = w.y, moved = false, snap = null;
      const ghost = $('#snapGhost');
      const mv = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy; if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
        if (!moved && w.max) { const relx = (sx - rb.left) / A.w; w.max = false; w.x = Math.round(sx - rb.left - w.w * relx); w.y = 0; ox = w.x; oy = w.y; }
        moved = true; el.classList.add('dragging');
        w.x = ox + dx; w.y = Math.max(0, oy + dy); place(w);
        const px = ev.clientX - rb.left, py = ev.clientY - rb.top;
        snap = py <= 2 ? 'max' : px <= 6 ? 'left' : px >= A.w - 6 ? 'right' : null;
        if (snap) { const g = snapRect(snap); ghost.style.cssText = `display:block;left:${g.x + rb.left}px;top:${g.y + rb.top}px;width:${g.w}px;height:${g.h}px`; } else ghost.style.display = 'none';
      };
      const up = () => {
        hd.removeEventListener('pointermove', mv); hd.removeEventListener('pointerup', up); hd.removeEventListener('pointercancel', up);
        el.classList.remove('dragging'); ghost.style.display = 'none';
        if (snap === 'max') { w.max = true; } else if (snap) { Object.assign(w, snapRect(snap)); }
        clamp(w); place(w); if (moved) { S.layout = 'free'; persist(); }
      };
      hd.addEventListener('pointermove', mv); hd.addEventListener('pointerup', up); hd.addEventListener('pointercancel', up);
    });
    // redimensionar
    el.querySelectorAll('[data-rz]').forEach(h => h.addEventListener('pointerdown', e => {
      if (e.button !== 0 || w.max || isMobile()) return;
      e.preventDefault(); e.stopPropagation(); h.setPointerCapture(e.pointerId);
      const d = h.dataset.rz, sx = e.clientX, sy = e.clientY, o = { x: w.x, y: w.y, w: w.w, h: w.h };
      el.classList.add('dragging');
      const mv = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (d.includes('e')) w.w = Math.max(MINW, o.w + dx);
        if (d.includes('s')) w.h = Math.max(MINH, o.h + dy);
        if (d.includes('w')) { const nw = Math.max(MINW, o.w - dx); w.x = o.x + (o.w - nw); w.w = nw; }
        if (d.includes('n')) { const nh = Math.max(MINH, o.h - dy); w.y = Math.max(0, o.y + (o.h - nh)); w.h = nh; }
        place(w);
      };
      const up = () => { h.removeEventListener('pointermove', mv); h.removeEventListener('pointerup', up); el.classList.remove('dragging'); clamp(w); place(w); S.layout = 'free'; persist(); if (APPS[id].onResize) APPS[id].onResize(w.body); };
      h.addEventListener('pointermove', mv); h.addEventListener('pointerup', up);
    }));
  }
  function snapRect(k) { const A = area(); if (k === 'left') return { x: 0, y: 0, w: Math.round(A.w / 2), h: A.h }; if (k === 'right') return { x: Math.round(A.w / 2), y: 0, w: A.w - Math.round(A.w / 2), h: A.h }; return { x: 0, y: 0, w: A.w, h: A.h }; }
  function setRect0(id, r) { const w = wins[id]; if (!w) return; Object.assign(w, r, { max: false, min: false }); place(w); }

  /* ---------------- Organizar: Modo estudio, Foco en la terminal, Investigación libre ---------------- */
  function layout(name, quiet, resizeOnly) {
    const A = area(), g = GAP;
    const setRect = (id, r) => { if (!wins[id] || (resizeOnly && wins[id].min)) return; setRect0(id, r); };
    if (name === 'study') {
      const wide = A.w >= 1180, mid = A.w >= 760;
      const need = wide ? ['mision', 'terminal', 'db', 'evidencias'] : ['mision', 'terminal'];
      if (!resizeOnly) { need.forEach(id => open(id, { silent: true, refresh: false })); order.slice().forEach(id => { if (!need.includes(id)) minimize(id); }); }
      if (wide) {
        const lw = Math.round(A.w * 0.27), rw = Math.round(A.w * 0.27), cw = A.w - lw - rw - 4 * g;
        const th = Math.round((A.h - 3 * g) * 0.55);
        setRect('mision', { x: g, y: g, w: lw, h: A.h - 2 * g });
        setRect('terminal', { x: lw + 2 * g, y: g, w: cw, h: A.h - 2 * g });
        setRect('db', { x: lw + cw + 3 * g, y: g, w: rw, h: th });
        setRect('evidencias', { x: lw + cw + 3 * g, y: th + 2 * g, w: rw, h: A.h - th - 3 * g });
      } else if (mid) {
        const lw = Math.round(A.w * 0.36);
        setRect('mision', { x: g, y: g, w: lw, h: A.h - 2 * g });
        setRect('terminal', { x: lw + 2 * g, y: g, w: A.w - lw - 3 * g, h: A.h - 2 * g });
      }
      if (!resizeOnly) focus('terminal');
    } else if (name === 'focus') {
      if (!resizeOnly) { ['mision', 'terminal'].forEach(id => open(id, { silent: true, refresh: false })); order.slice().forEach(id => { if (!['mision', 'terminal'].includes(id)) minimize(id); }); }
      const tw = Math.round(A.w * (A.w >= 900 ? 0.7 : 0.6));
      setRect('terminal', { x: g, y: g, w: tw - g, h: A.h - 2 * g });
      setRect('mision', { x: tw + g, y: g, w: A.w - tw - 2 * g, h: A.h - 2 * g });
      if (!resizeOnly) focus('terminal');
    } else {
      order.forEach((id, k) => { const app = APPS[id]; const w = Math.min(app.w || 720, A.w - 60), h = Math.min(app.h || 520, A.h - 60);
        setRect(id, { x: 30 + k * 36, y: 20 + k * 30, w, h }); });
      const t = topWin(); if (t) focus(t);
    }
    if (resizeOnly) { persist(); return; }
    S.layout = name; persist(); renderTaskbar();
    if (!quiet) notify({ title: 'Ventanas organizadas', text: { study: 'Modo estudio: misión, terminal, base de datos y evidencias a la vista.', focus: 'Foco en la terminal: más espacio para escribir SQL.', free: 'Investigación libre: ventanas en cascada.' }[name], icon: 'layout', time: 2600 });
  }
  function relayout() {
    if (!root) return; const A = area(); if (!A.w) return;
    if (['study', 'focus'].includes(S.layout) && !isMobile()) { layout(S.layout, true, true); order.forEach(id => { const w = wins[id]; clamp(w); place(w); }); }
    else order.forEach(id => { const w = wins[id]; clamp(w); place(w); });
  }
  let rT; window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { document.body.classList.toggle('mobile', isMobile()); relayout(); }, 120); });

  /* ---------------- Escritorio, barra de tareas, menú de inicio ---------------- */
  function desktop() {
    document.body.classList.toggle('mobile', isMobile());
    $('#os').classList.add('on'); root = $('#windows');
    $('#wallpaper').style.backgroundImage = `url("${IMG('I-03')}")`;
    renderIcons(); renderTaskbar(); tickClock();
    // restaurar ventanas abiertas de la sesión anterior
    const prev = (S.winOrder || []).filter(id => APPS[id] && !APPS[id].transient);
    if (prev.length) { prev.forEach(id => open(id, { silent: true })); prev.forEach(id => { if (S.wins[id] && S.wins[id].min) minimize(id); }); if (S.layout === 'study' || S.layout === 'focus') layout(S.layout, true); }
    return prev.length;
  }
  function renderIcons() {
    const list = Object.keys(APPS).filter(id => APPS[id].desk && (!APPS[id].visible || APPS[id].visible()));
    $('#deskIcons').innerHTML = list.map(id => { const a = APPS[id]; const b = a.badge ? a.badge() : 0;
      return `<button class="dicon" data-open="${id}" style="--acc:${a.accent}" title="${esc(a.title)}"><span class="dicon-tile">${svg(a.icon)}${b ? `<b class="badge">${b}</b>` : ''}</span><span class="dicon-lbl">${esc(a.short || a.title)}</span></button>`; }).join('');
    $$('#deskIcons .dicon').forEach(b => {
      b.onclick = () => { $$('#deskIcons .dicon').forEach(x => x.classList.toggle('sel', x === b)); if (isMobile() || matchMedia('(pointer:coarse)').matches) open(b.dataset.open); };
      b.ondblclick = () => open(b.dataset.open);
      b.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); open(b.dataset.open); } };
    });
  }
  function renderTaskbar() {
    const tb = $('#tbApps'); if (!tb) return;
    tb.innerHTML = order.map(id => { const a = APPS[id], w = wins[id];
      return `<button class="tb-app ${active === id && !w.min ? 'on' : ''} ${w.min ? 'mini' : ''}" data-tb="${id}" style="--acc:${a.accent}" title="${esc(a.title)}">${svg(a.icon)}<span>${esc(a.short || a.title)}</span></button>`; }).join('');
    $$('#tbApps .tb-app').forEach(b => b.onclick = () => { const id = b.dataset.tb, w = wins[id]; if (active === id && !w.min) minimize(id); else { focus(id); sfx('click'); } });
    const done = MISSIONS.filter(m => S.done[m.id]).length;
    $('#tbCase').textContent = `Caso 001 · ${done * 10}%`;
    const { r } = rankOf(S.xp); $('#tbRank').textContent = `${r[1]} · ${S.xp} XP`;
    $('#tbSound').innerHTML = svg(S.sound ? 'sound' : 'mute'); $('#tbSound').setAttribute('aria-label', S.sound ? 'Silenciar sonidos' : 'Activar sonidos');
    $('#tbFull').innerHTML = svg(isFull() ? 'exitfull' : 'full');
  }
  function tickClock() {
    const d = new Date(); const t = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    $$('[data-clock]').forEach(e => e.textContent = t);
    clearTimeout(tickClock._t); tickClock._t = setTimeout(tickClock, 15000);
  }
  function startMenu(force) {
    const m = $('#start'); const on = force !== undefined ? force : !m.classList.contains('on');
    m.classList.toggle('on', on); $('#tbStart').setAttribute('aria-expanded', on);
    if (!on) return;
    const { r } = rankOf(S.xp);
    $('#startUser').innerHTML = `<div class="su-av">${svg('lumen')}</div><div><b>${esc(S.agent || 'Detective')}</b><span>${r[1]} · ${S.xp} XP</span></div>`;
    const ids = Object.keys(APPS).filter(id => APPS[id].menu !== false && (!APPS[id].visible || APPS[id].visible()));
    $('#startApps').innerHTML = ids.map(id => `<button data-open="${id}" style="--acc:${APPS[id].accent}">${svg(APPS[id].icon)}<span>${esc(APPS[id].title)}</span></button>`).join('');
    $$('#startApps [data-open]').forEach(b => b.onclick = () => { startMenu(false); open(b.dataset.open); });
    setTimeout(() => { const f = $('#startApps button'); f && f.focus(); }, 20);
  }
  function organizer(force) {
    const m = $('#orgMenu'); const on = force !== undefined ? force : !m.classList.contains('on');
    m.classList.toggle('on', on); $('#tbOrg').setAttribute('aria-expanded', on);
    $$('#orgMenu [data-lay]').forEach(b => b.classList.toggle('cur', b.dataset.lay === S.layout));
  }

  /* ---------------- Notificaciones ---------------- */
  function notify(n) {
    const box = $('#notifs'); if (!box) return;
    const el = document.createElement('div'); el.className = 'notif'; el.setAttribute('role', 'status');
    const ic = n.who ? avatar(n.who, 'sm') : `<div class="notif-ic">${svg(n.icon || 'bell')}</div>`;
    el.innerHTML = `${ic}<div class="notif-tx"><b>${n.title}</b>${n.text ? `<span>${n.text}</span>` : ''}</div><button class="notif-x" aria-label="Cerrar notificación">${svg('close')}</button>`;
    box.appendChild(el); while (box.children.length > 3) box.firstElementChild.remove();
    if (n.sound !== false) sfx(n.sound || 'notify');
    const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 250); };
    el.querySelector('.notif-x').onclick = e => { e.stopPropagation(); kill(); };
    if (n.act) { el.classList.add('click'); el.onclick = () => { n.act(); kill(); }; }
    setTimeout(kill, n.time || 6500);
  }

  /* ---------------- Diálogo modal ---------------- */
  function modal(html, wide) {
    const m = $('#modal'); $('#modalBox').className = 'mbox' + (wide ? ' wide' : '');
    $('#modalBox').innerHTML = `<button class="mx" aria-label="Cerrar">${svg('close')}</button>` + html; m.classList.add('on');
    $('#modalBox .mx').onclick = closeModal; setTimeout(() => { const b = $('#modalBox button:not(.mx)'); b && b.focus(); }, 30);
  }
  function closeModal() { $('#modal').classList.remove('on'); }

  /* ---------------- Atajos globales ---------------- */
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if ($('#modal').classList.contains('on')) closeModal(); startMenu(false); organizer(false); }
    if (!$('#os').classList.contains('on')) return;
    if (e.altKey && e.shiftKey && !e.ctrlKey) {
      const k = e.key.toLowerCase();
      if (k === 'e') { e.preventDefault(); layout('study'); } if (k === 'f') { e.preventDefault(); layout('focus'); } if (k === 'l') { e.preventDefault(); layout('free'); }
    }
  });
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('#start, #tbStart')) startMenu(false);
    if (!e.target.closest('#orgMenu, #tbOrg')) organizer(false);
  });

  function bindChrome() {
    $('#tbStart').onclick = () => { sfx('click'); startMenu(); };
    $('#tbOrg').onclick = () => { sfx('click'); organizer(); };
    $$('#orgMenu [data-lay]').forEach(b => b.onclick = () => { organizer(false); layout(b.dataset.lay); });
    $('#tbSound').onclick = () => { S.sound = !S.sound; save(); renderTaskbar(); sfx('click'); };
    $('#tbFull').onclick = toggleFull;
    $('#tbRank').onclick = () => open('perfil');
    $('#tbCase').onclick = () => layout('study');
    $('#startStudy').onclick = () => { startMenu(false); layout('study'); };
    $('#startFull').onclick = () => { startMenu(false); toggleFull(); };
    $('#startLogout').onclick = () => { startMenu(false); logout(); };
    $('#startReset').onclick = () => { startMenu(false); GAME.askReset(); };
  }
  function logout() {
    order.slice().forEach(id => { wins[id].el.remove(); delete wins[id]; }); order.length = 0; active = null;
    $('#os').classList.remove('on'); GAME.start(true);
  }
  function refreshChrome() { renderIcons(); renderTaskbar(); }
  function isOpen(id) { return !!wins[id]; }
  function body(id) { return wins[id] && wins[id].body; }
  function setSub(id, txt) { const w = wins[id]; if (w) w.el.querySelector('[data-sub]').textContent = txt || ''; }
  function closeAll() { order.slice().forEach(id => { wins[id].el.remove(); delete wins[id]; }); order.length = 0; active = null; renderTaskbar(); }

  return { boot, login, cinema, desktop, open, close, minimize, focus, toggleMax, layout, notify, modal, closeModal, sfx, audio, bindChrome,
    refreshChrome, isOpen, body, setSub, toggleFull, closeAll, get active() { return active; }, wins, order, isMobile };
})();
