// FLORIDA DAN — the "blockbuster" trailer cut (trailer.html?cut=epic).
// Real gameplay, shot like a $200M summer tentpole that takes itself far too seriously:
// green-band rating card, a studio logo, letterbox, teal-and-orange, slow motion, lens flares,
// BRAAMs, a trailer-voice narrator, critic quotes, laurels... then the real game music drops.
// The score lives in trailer-epic-audio.js.
'use strict';
(() => {
if (!/cut=epic/.test(location.search)) return;

// ---------- look ----------
const css = `
  #ep { position: absolute; inset: 0; z-index: 9; pointer-events: none; }
  #ep [hidden] { display: none !important; }
  #ep > * { position: absolute; inset: 0; }
  #epVig { background: radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,.55) 100%); }
  #epFlare { mix-blend-mode: screen; overflow: hidden; }
  #epFlare i { position: absolute; display: block; border-radius: 50%; transform: translate(-50%, -50%); }
  #epFlare .core { width: 620px; height: 620px; background: radial-gradient(circle, rgba(255,251,240,1) 0%, rgba(255,222,160,.6) 9%, rgba(255,160,70,.2) 30%, transparent 68%); }
  #epFlare .streak { width: 3000px; height: 30px; background: radial-gradient(ellipse at center, rgba(215,240,255,1) 0%, rgba(90,170,255,.55) 25%, rgba(60,120,255,.12) 55%, transparent 72%); }
  #epFlare .g1 { width: 120px; height: 120px; background: radial-gradient(circle, rgba(120,200,255,.28), transparent 70%); }
  #epFlare .g2 { width: 260px; height: 260px; border: 3px solid rgba(150,215,255,.22); background: radial-gradient(circle, transparent 60%, rgba(120,190,255,.10) 100%); }
  #epFlare .g3 { width: 70px; height: 70px; background: rgba(255,180,90,.22); }
  #epFlare .g4 { width: 180px; height: 180px; background: radial-gradient(circle, rgba(255,120,200,.16), transparent 70%); }
  #epText .t { position: absolute; left: 0; right: 0; top: 50%; text-align: center; font: 700 104px/1.12 'Cinzel', serif; letter-spacing: .12em; color: #f6f1e7;
    text-shadow: 0 0 50px rgba(0,0,0,.85), 0 4px 18px rgba(0,0,0,.9); }
  #epText .t.gold, #epGfx .gold { background: linear-gradient(180deg, #fff8e0 0%, #f6d98a 30%, #c4913a 52%, #fff0b8 64%, #a06d22 88%, #6e4712 100%); -webkit-background-clip: text; background-clip: text; color: transparent; text-shadow: none; filter: drop-shadow(0 8px 24px rgba(0,0,0,.85)); }
  #epText .t.sm { font-size: 72px; }
  #epText.over .t:not(.meme) { top: 30%; }   /* over gameplay: sit above Dan, not on his face */
  #epText .t.neon { color: #fff0ff; text-shadow: 0 0 10px #ff4fd8, 0 0 30px #ff4fd8, 0 0 70px #b026ff, 0 0 120px #b026ff; }
  #epText .t.meme { top: auto; bottom: 175px; font: 500 52px/1.2 'Oswald', sans-serif; letter-spacing: .02em; color: #fff; text-shadow: 3px 3px 0 #000, 0 0 20px rgba(0,0,0,.8); }
  #epText .t.meme b { display: block; font-size: 84px; font-weight: 700; }
  #epGfx { background: #000; overflow: hidden; }
  #epFlash { background: #fff; opacity: 0; }
  #epBars i { position: absolute; left: 0; right: 0; height: 138px; background: #000; } #epBars i:first-child { top: 0; } #epBars i:last-child { bottom: 0; }
  #epGrain { width: 100%; height: 100%; mix-blend-mode: overlay; opacity: .26; }
  /* the game's own UI has to live inside the letterbox */
  #talk { bottom: 162px !important; } #toast { bottom: 160px !important; left: 40px !important; } #banner { top: 152px !important; }

  /* green band */
  .gb { position: absolute; inset: 0; background: #0a6e36; color: #fff; font-family: 'Oswald', sans-serif; text-align: center; display: grid; align-content: center; justify-items: center; gap: 26px; }
  .gb .l1 { font: 600 58px/1.18 'Oswald'; letter-spacing: .02em; } .gb .l1 b { font-weight: 700; text-decoration: underline; text-underline-offset: 8px; }
  .gb .l2 { font: 500 40px 'Oswald'; letter-spacing: .06em; opacity: .95; }
  .gb .gbx { border: 5px solid #fff; width: 1260px; margin-top: 22px; }
  .gb .gbx .hd { border-bottom: 5px solid #fff; font: 600 40px/1 'Oswald'; padding: 14px 0; letter-spacing: .04em; } .gb .gbx .hd b { text-decoration: underline; text-underline-offset: 6px; }
  .gb .row { display: flex; align-items: stretch; } .gb .F { font: 700 190px/1 'Oswald'; width: 260px; border-right: 5px solid #fff; display: grid; place-items: center; padding-bottom: 12px; }
  .gb .why { flex: 1; text-align: left; padding: 22px 34px; font: 500 36px/1.3 'Oswald'; } .gb .why b { display: block; font: 700 64px/1.05 'Oswald'; letter-spacing: .04em; margin-bottom: 8px; }
  /* studio logo */
  .studio { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 42%, #2a2f45 0%, #0b0d16 55%, #000 100%); display: grid; place-items: center; }
  .studio .rays { position: absolute; left: 50%; top: 40%; width: 3400px; height: 3400px; margin: -1700px 0 0 -1700px; background: repeating-conic-gradient(from 0deg, rgba(255,220,150,.10) 0deg 4deg, transparent 4deg 12deg); border-radius: 50%; -webkit-mask: radial-gradient(circle, #000 0%, transparent 55%); mask: radial-gradient(circle, #000 0%, transparent 55%); }
  .studio .ring { position: absolute; left: 50%; top: 40%; width: 330px; height: 330px; margin: -165px 0 0 -165px; border-radius: 50%; border: 16px solid transparent; background: radial-gradient(circle at 50% 60%, #3a6f5a, #0e2a22) padding-box, linear-gradient(160deg, #fff4c8, #d8a64a 35%, #7c5316 60%, #f7dd96 85%) border-box; box-shadow: 0 0 80px rgba(255,200,110,.35); overflow: hidden; }
  .studio .ring img { position: absolute; left: 50%; bottom: -10px; height: 270px; image-rendering: pixelated; transform: translateX(-50%); transform-origin: 50% 90%; }
  .studio .nm { position: absolute; left: 0; right: 0; top: 63%; text-align: center; font: 900 128px/1 'Cinzel', serif; letter-spacing: .12em; }
  .studio .pc { position: absolute; left: 0; right: 0; top: calc(63% + 142px); text-align: center; font: 700 44px 'Cinzel', serif; letter-spacing: .9em; color: #d9c79a; padding-left: .9em; }
  .studio .as { position: absolute; left: 0; right: 0; bottom: 150px; text-align: center; font: 400 30px 'Oswald'; letter-spacing: .3em; color: #9aa0b5; } .studio .as b { color: #e8e2d0; font-weight: 600; }
  .studio .shine, .ttl .shine { position: absolute; top: -10%; bottom: -10%; width: 300px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent); transform: skewX(-20deg); mix-blend-mode: screen; }
  /* black story cards reuse #epText over a black #epGfx */
  /* critic quotes + laurels */
  .qt { position: absolute; inset: 0; background: #000; display: grid; place-content: center; justify-items: center; gap: 30px; text-align: center; }
  .qt .st { font-size: 92px; letter-spacing: .18em; color: #f3c65a; text-shadow: 0 0 30px rgba(243,198,90,.45); }
  .qt .st span { display: inline-block; }
  .qt .q { font: 700 96px/1.1 'Cinzel', serif; letter-spacing: .06em; color: #f6f1e7; max-width: 1600px; }
  .qt .who { font: 500 40px 'Oswald'; letter-spacing: .32em; color: #a9a293; }
  .lau { position: absolute; inset: 0; background: #000; display: flex; justify-content: center; align-items: center; gap: 110px; }
  .lau .w { position: relative; width: 640px; height: 520px; display: grid; place-content: center; text-align: center; }
  .lau svg { position: absolute; inset: 0; }
  .lau .a { font: 700 30px 'Cinzel', serif; letter-spacing: .08em; color: #e9d59e; padding: 0 175px; } .lau .b { font: 500 28px/1.25 'Oswald'; letter-spacing: .06em; color: #cfc6b0; margin-top: 12px; padding: 0 175px; }
  /* title */
  .ttl { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 55%, #2b1606 0%, #0a0503 55%, #000 100%); display: grid; place-content: center; justify-items: center; overflow: hidden; }
  .ttl .tt { font: 900 250px/.92 'Cinzel', serif; letter-spacing: .06em; text-align: center; }
  .ttl .ts { margin-top: 44px; font: 700 44px 'Cinzel', serif; letter-spacing: .5em; color: #d9c49a; padding-left: .5em; }
  .ttl .em { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: #ffb347; box-shadow: 0 0 12px 3px rgba(255,140,40,.7); }
  /* end card */
  .endc { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 35%, #1b2233 0%, #07080d 60%, #000 100%); display: grid; justify-items: center; align-content: start; padding-top: 175px; text-align: center; }
  .endc .et { font: 900 150px/1 'Cinzel', serif; letter-spacing: .06em; }
  .endc .av { margin-top: 26px; font: 700 64px 'Cinzel', serif; letter-spacing: .3em; color: #f6f1e7; padding-left: .3em; }
  .endc .fr { margin-top: 18px; font: 500 36px 'Oswald'; letter-spacing: .28em; color: #f3c65a; }
  .endc .url { margin-top: 28px; font: 600 44px 'Oswald'; letter-spacing: .06em; color: #0b0d16; background: #f6f1e7; padding: 6px 30px 10px; }
  .endc .bill { position: absolute; left: 50%; bottom: 190px; width: 2350px; transform: translateX(-50%) scaleX(.62); font: 300 30px/1.18 'Oswald'; letter-spacing: .01em; color: #b9b3a6; text-transform: uppercase; }
  .endc .bill b { font-weight: 500; color: #ddd6c6; font-size: 40px; }
  .endc .rb { position: absolute; left: 110px; bottom: 175px; border: 4px solid #cfc8b8; color: #cfc8b8; font: 700 30px 'Oswald'; padding: 6px 12px; text-align: left; line-height: 1.05; }
  .endc .rb big { display: block; font-size: 84px; line-height: .9; }
`;
const st = document.createElement('style'); st.textContent = css; document.head.append(st);
const fl = document.createElement('link'); fl.rel = 'stylesheet'; fl.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Oswald:wght@300;400;500;600;700&display=swap'; document.head.append(fl);
const root = document.createElement('div'); root.id = 'ep';
root.innerHTML = `<svg width="0" height="0" style="position:absolute"><filter id="epWhip" x="-20%" y="0" width="140%" height="100%"><feGaussianBlur id="epWhipB" stdDeviation="0 0"/></filter></svg>
  <div id="epVig"></div><div id="epGfx" hidden></div>
  <div id="epFlare"><i class="streak"></i><i class="core"></i><i class="g1"></i><i class="g2"></i><i class="g3"></i><i class="g4"></i></div><div id="epText"></div><div id="epFlash"></div><canvas id="epGrain" width="480" height="270"></canvas><div id="epBars"><i></i><i></i></div>`;
stage.append(root);
const E = id => document.getElementById(id);
const screenEl = E('screen');

// film grain with its own RNG, so it never nudges the game's seeded randomness
let gs = 99; const grng = () => ((gs = (Math.imul(gs, 1103515245) + 12345) >>> 0) / 4294967296);
const gx = E('epGrain').getContext('2d'), gimg = gx.createImageData(480, 270);
function grain() { const d = gimg.data; for (let i = 0; i < d.length; i += 4) { const v = 128 + (grng() - .5) * 150; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } gx.putImageData(gimg, 0, 0); }

// ---------- slow motion: the whole sim runs on a per-shot clock ----------
const EP = { speed: 1, vt: 0, o: null, lastView: null, baseView: null };
const _update = update; update = function (dt) { _update(dt * EP.speed); };

// ---------- the grade: blockbuster teal and orange (on top of the game's time-of-day grade) ----------
const GR = { epic: [[.84, .98, 1.14], [1.13, 1.0, .84], 1.1], freeze: [[.95, .86, .7], [1.12, 1.0, .78], .3], miami: [[.98, .84, 1.16], [1.12, .95, 1.0], 1.22], none: [[1, 1, 1], [1, 1, 1], 1] };
const _grade = Look.grade;
Look.grade = function () {
  const G = _grade.call(Look), o = EP.o, k = o ? (typeof o.grade === 'function' ? o.grade(EP.lt, EP.vt) : o.grade || 'epic') : 'none', [a, b, s] = GR[k] || GR.epic;
  return this.g = { ...G, sh: G.sh.map((v, i) => v * a[i]), hi: G.hi.map((v, i) => v * b[i]), sat: G.sat * s };
};

// ---------- overlays ----------
function flare(p) {
  const f = E('epFlare'); if (!p || p[2] <= .01) { f.hidden = true; return; }
  f.hidden = false; const [x, y, k] = p, cx = 960, cy = 540, ch = f.children;
  ch[0].style.left = '960px'; ch[0].style.top = y + 'px'; ch[0].style.opacity = Math.min(1, k * .9);
  ch[1].style.left = x + 'px'; ch[1].style.top = y + 'px'; ch[1].style.opacity = Math.min(1, k);
  [.55, 1.25, 1.6, 2.05].forEach((m, i) => { const e = ch[2 + i]; e.style.left = (x + (cx - x) * m) + 'px'; e.style.top = (y + (cy - y) * m) + 'px'; e.style.opacity = Math.min(1, k); });
}
function texts(o, lt) {
  const box = E('epText'); if (!o.text) { box.innerHTML = ''; return; }
  if (box._o !== o) { box._o = o; box.innerHTML = o.text.map(([, , h, c]) => `<div class="t ${c || ''}">${h}</div>`).join(''); }
  [...box.children].forEach((el, i) => {
    const [t0, t1, , c = ''] = o.text[i], fin = /slam/.test(c) ? .06 : .45, k = Math.min(ease((lt - t0) / fin), 1 - ease((lt - (t1 - .3)) / .3));
    el.style.opacity = lt < t0 || lt > t1 ? 0 : k.toFixed(3);
    const s = /slam/.test(c) ? 1 + Math.max(0, .25 - (lt - t0) * 2.5) : 1 + (lt - t0) * .018;   // the slow push every trailer title card does
    el.style.transform = (/meme/.test(c) ? '' : 'translateY(-50%) ') + `scale(${s.toFixed(4)})`;
  });
}
function camPost(o, lt) {
  let v = Game.view || [0, 0, 1]; if (v === EP.lastView) v = EP.baseView;
  let z = o.zoom ? o.zoom(lt, EP.vt) : 1;
  for (const t of o.punch || []) { const k = lt - t; if (k >= 0 && k < .4) z *= 1 + .16 * (1 - k / .4) ** 2; }
  if (z !== 1) {
    const s = v[2] / z, cx = v[0] + v[2] / 2, cy = v[1] + v[2] / 2;
    EP.baseView = v; EP.lastView = Game.view = [clamp(cx - s / 2, 0, 1 - s), clamp(cy - s / 2, 0, 1 - s), s];
  }
  const tilt = o.tilt ? o.tilt(lt) : 0, D = o.dur;
  let wx = 0, blur = 0;
  if (o.whipIn) { const k = 1 - ease(lt / o.whipIn); wx += k * 520; blur = Math.max(blur, k * 46); }
  if (o.whipOut) { const k = ease((lt - (D - o.whipOut)) / o.whipOut); wx -= k * 520; blur = Math.max(blur, k * 46); }
  screenEl.style.transform = tilt || wx ? `translateX(${wx.toFixed(1)}px) rotate(${tilt.toFixed(3)}deg) scale(${(1 + Math.abs(tilt) * .036).toFixed(4)})` : '';
  E('epWhipB').setAttribute('stdDeviation', `${blur.toFixed(1)} 0`); screenEl.style.filter = blur > .5 ? 'url(#epWhip)' : '';
}

// ---------- the shot wrapper ----------
// o: dur, speed(lt, vt), zoom(lt, vt), tilt(lt), punch[], whipIn/whipOut, flare(lt) → [x, y, k], text [[t0, t1, html, cls]],
//    gfx (html over black), anim(lt, el), grade, flashIn, hl:false (swallow game headlines), bars:false, vo [[name, t]]
function ep(id, src, o) {
  src = src || {};
  const sh = { id, _o: o, dur: o.dur, sim: o.gfx ? false : (o.sim !== undefined ? o.sim : src.sim), frozen: src.frozen ? () => src.frozen(EP.vt) : undefined,
    setup() {
      EP.o = o; EP.vt = 0; EP.lt = 0; EP.speed = 1; EP.lastView = null;
      E('epText')._o = null; E('epText').innerHTML = ''; E('epText').className = o.gfx ? '' : 'over'; flare(null);
      const g = E('epGfx'); g.style.opacity = ''; g.hidden = !o.gfx; g.innerHTML = o.gfx ? (typeof o.gfx === 'function' ? o.gfx() : o.gfx) : '';
      E('epBars').hidden = o.bars === false; E('epVig').hidden = !!o.gfx;
      if (src.setup) src.setup(); else base();
      Game.dan.idleT = 0; Game.lens = 0; Game.camFx = 0;
      if (o.setup) o.setup();
    },
    step(lt, dt) {
      EP.lt = lt; EP.speed = o.speed ? o.speed(lt, EP.vt) : 1; EP.vt += dt * EP.speed;
      if (src.step) src.step(EP.vt, dt * EP.speed); if (o.step) o.step(lt, dt);
    },
    after(lt, dt) {
      if (src.after) src.after(EP.vt, dt * EP.speed); if (o.after) o.after(lt, dt);
      if (o.hl === false) headlineQ.length = 0;
      if (!o.gfx) camPost(o, lt); else { screenEl.style.transform = ''; screenEl.style.filter = ''; }
      texts(o, lt); flare(o.flare ? o.flare(lt) : null);
      if (o.anim) o.anim(lt, E('epGfx'));
      E('epFlash').style.opacity = o.flashIn ? Math.max(0, 1 - lt / o.flashIn).toFixed(3) : 0;
      ui.hudTop.hidden = true; ui.hotbar.hidden = true; if (o.talk === false) ui.talk.hidden = true;
      grain();
    },
    end() { if (src.end) src.end(); if (o.end) o.end(); EP.speed = 1; screenEl.style.transform = ''; screenEl.style.filter = ''; },
  };
  return sh;
}
// gfx-only shots still need the stepper to call after(): give them a no-op sim
const card = (id, dur, text, extra = {}) => ep(id, null, { dur, gfx: ' ', text, ...extra });

const V1s = Trailer.V1s, V2 = Trailer.V2;
const sprURL = (k, i = 0) => { const s = SPR.dan[k][i]; return s.toDataURL ? s.toDataURL() : s.src; };
const stars = n => `<div class="st">${'<span>★</span>'.repeat(n)}</div>`;
function quote(id, q, who, n = 5) {
  return ep(id, null, { dur: 1.5, gfx: `<div class="qt">${stars(n)}<div class="q">“${q}”</div><div class="who">— ${who}</div></div>`,
    anim(lt, g) {
      [...g.querySelectorAll('.st span')].forEach((s, i) => { const k = lt - i * .06; s.style.opacity = k > 0 ? 1 : 0; s.style.transform = `scale(${(1 + Math.max(0, .5 - k * 5)).toFixed(3)})`; });
      const q = g.querySelector('.q'), w = g.querySelector('.who'); q.style.opacity = Math.min(1, lt / .25); q.style.transform = `scale(${(1 + lt * .03).toFixed(4)})`; w.style.opacity = Math.min(1, Math.max(0, (lt - .3) / .25));
    } });
}
function laurel(flip) {   // a hand-built laurel wreath: leaves along two arcs
  let p = ''; for (let i = 0; i < 13; i++) { const a = Math.PI * (.62 + i * .062), r = 225, x = 320 + Math.cos(a) * r, y = 260 - Math.sin(a) * r * -1, rot = a * 180 / Math.PI + 90;
    p += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="15" ry="36" transform="rotate(${(rot + 28).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/><ellipse cx="${(x + 14).toFixed(1)}" cy="${(y - 10).toFixed(1)}" rx="11" ry="28" transform="rotate(${(rot - 30).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }
  return `<g fill="url(#lg)" ${flip ? 'transform="translate(640 0) scale(-1 1)"' : ''}>${p}</g>`;
}
const LAU = (a, b) => `<div class="w"><svg viewBox="0 0 640 520"><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8e2a0"/><stop offset=".5" stop-color="#c79a45"/><stop offset="1" stop-color="#8a6120"/></linearGradient></defs>${laurel(0)}${laurel(1)}</svg><div class="a">${a}</div><div class="b">${b}</div></div>`;

// ---------- custom shots ----------
const walkTo = (D, x0, y0, x1, y1, k, dir) => { D.x = lerp(x0, x1, k); D.y = lerp(y0, y1, k); D.dir = dir; D.moving = true; D.frame = Math.floor(EP.vt * 7) % 2; };
function convoyRoadY() {
  const dr = World.spots.drive; for (let dy = 0; dy < 40; dy += 2) for (const s of [1, -1]) { const y = dr.y + s * dy; let ok = true; for (let x = dr.x - 460; x < dr.x; x += 8) if (!canDrive(x, y)) { ok = false; break; } if (ok) return y; }
  return dr.y + 8;
}
const MONT = [['powder', V1s('powder')], ['drunk', V1s('drunk')], ['raccoon', V1s('raccoon')], ['shroom', V1s('shroom')], ['race', V2.race], ['abuela', V2.abuela], ['hurricane', V1s('hurricane')], ['parade', V2.parade]];

const SH = [
  // ===== PRE-ROLL =====
  ep('greenband', null, { dur: 3.5, bars: false, gfx: `<div class="gb"><div class="l1">THE FOLLOWING <b>PREVIEW</b> HAS BEEN APPROVED FOR<br>ABSOLUTELY NO AUDIENCES</div><div class="l2">BY THE FLORIDA DEPARTMENT OF CORRECTIONS</div>
      <div class="gbx"><div class="hd">THE <b>GAME</b> ADVERTISED HAS BEEN RATED</div><div class="row"><div class="F">F</div><div class="why"><b>FLORIDA</b>FOR PERVASIVE ALLEGATIONS, GATOR VIOLENCE,<br>ONE MANATEE, AND DAN</div></div></div></div>`,
    anim(lt, g) { g.style.opacity = Math.min(1, lt / .3, (3.5 - lt) / .25).toFixed(3); } }),
  ep('studio', null, { dur: 3.2, gfx: () => `<div class="studio"><div class="rays"></div><div class="ring"><img src="${sprURL('down')}" alt=""></div><div class="nm gold">SWAMP GAS</div><div class="pc">PICTURES</div><div class="as">IN ASSOCIATION WITH <b>GULP-N-GO ENTERTAINMENT</b></div><div class="shine"></div></div>`,
    flare: lt => [1180 - lt * 120, 290, .55 * Math.min(1, lt / .6) * Math.min(1, (3.2 - lt) / .4)],
    anim(lt, g) {
      const s = g.querySelector('.studio'); s.style.opacity = Math.min(1, lt / .5, (3.2 - lt) / .35).toFixed(3);
      g.querySelector('.rays').style.transform = `rotate(${(lt * 6).toFixed(2)}deg)`;
      const img = g.querySelector('img'), roar = lt > 1.25 && lt < 1.9; img.style.transform = `translateX(-50%) scale(${roar ? 1.08 + Math.sin(lt * 60) * .02 : 1})`;   // the "lion" roars. It is a burp.
      g.querySelector('.nm').style.transform = `scale(${(1.04 - lt * .012).toFixed(4)})`;
      g.querySelector('.shine').style.left = `${-400 + (lt - .6) * 1700}px`; g.querySelector('.as').style.opacity = Math.max(0, Math.min(1, (lt - 1.6) / .4));
    } }),
  // ===== ACT ONE: DEAD SERIOUS =====
  ep('dawn', null, { dur: 6.0, hl: true,
    setup() { base({ hour: 6.35 }); const D = Game.dan, d = World.spots.dockEnd; Object.assign(D, { x: d.x - 4, y: d.y, dir: 'right' }); T_.d = d; Game.npcs = Game.npcs.filter(n => n.id !== 'tourist'); Game.animals = Game.animals.filter(a => a.type !== 'gator' || Math.hypot(a.x - d.x, a.y - d.y) > 120); },
    after(lt) { const d = T_.d; camOn(d.x - 70 + lt * 11, d.y - 26 + lt * 2, 1.0 + lt * .055); if (at(lt, 4.45, 'hl')) headline('FLORIDA MAN SEEN STANDING ON DOCK; AUTHORITIES “MONITORING THE SITUATION”'); },
    flare: lt => [1540 - lt * 25, 250, .95 + Math.sin(lt * 1.3) * .05], vo: [['w1', .35], ['w2', 1.75], ['w3', 3.45]] }),
  card('legends', 4.0, [[.15, 2.3, 'EVERY STATE<br>HAS ITS LEGENDS.', 'sm'], [2.45, 3.25, 'FLORIDA HAS', 'sm'], [3.25, 4.0, 'ALLEGATIONS.', 'gold slam']]),
  ep('hero', null, { dur: 3.2, speed: () => .34, hl: false,
    setup() { base({ hour: 7.1 }); const D = Game.dan, d = World.spots.door; Object.assign(D, { x: d.x, y: d.y + 10, dir: 'down' }); T_.d = d; Game.npcs = Game.npcs.filter(n => n.id !== 'tourist'); },
    after(lt) { const D = Game.dan, d = T_.d; walkTo(D, d.x, d.y + 10, d.x, d.y + 40, Math.min(1, EP.vt / 1.1), 'down'); camOn(D.x, D.y - 4, 2.5 - lt * .05); },
    tilt: lt => -4.5 + lt * 1.1, flare: lt => [980, 250, .85], text: [[1.0, 3.2, 'ONE MAN.', 'gold']] }),
  ep('beer', null, { dur: 2.6, speed: () => .3, hl: false,
    setup() { base({ hour: 7.4 }); const D = Game.dan, d = World.spots.door; Object.assign(D, { x: d.x + 20, y: d.y + 34, dir: 'down' }); Game.npcs = Game.npcs.filter(n => n.id !== 'tourist'); },
    step(lt) { if (at(EP.vt, .12, 'beer')) useItem('beer'); },
    after(lt) { const D = Game.dan; D.dir = 'down'; camOn(D.x + 4, D.y - 10, 3.9 + lt * .08); },
    tilt: () => 3, flare: () => [640, 330, .7], text: [[.6, 2.6, 'FORTY-FOUR<br>YEARS OLD.', 'gold']] }),
  ep('cooler', V1s('cooler'), { dur: 2.6, speed: () => .45, hl: false, zoom: lt => 1.35 + lt * .03, after() { const D = Game.dan; camOn(D.x + 14, D.y - 2, 1.25); }, tilt: () => -3,
    flare: () => [1500, 300, .6], text: [[.7, 2.6, 'ONE MOTORIZED<br>COOLER.', 'gold']] }),
  card('fishcard', 2.0, [[.1, 2.0, 'HE JUST WANTED<br>TO FISH.', 'sm']]),
  ep('bite', V1s('cozy'), { dur: 6.6, hl: false,
    speed: (lt, vt) => vt < 3.0 ? 1 : .35, grade: (lt, vt) => vt >= 3.54 ? 'freeze' : 'epic',
    flare: lt => [1480, 280, lt < 4.57 ? .6 : 0],
    text: [[4.62, 6.6, '<b>Yep. That’s Dan.</b>You’re probably wondering how he got here.', 'meme']] }),
];
Trailer.dropAt = SH.reduce((t, s) => t + s.dur, 0);   // the moment the real music kicks in

SH.push(
  // ===== ACT TWO: THE DROP =====
  ep('wrestle', V1s('wrestle'), { dur: 3.0, speed: (lt, vt) => vt > .8 && vt < 1.05 ? .22 : 1.1, punch: [0, 1.0], tilt: () => -2.5, flashIn: .12 }),
  quote('q1', 'I WAS THERE.', 'DAN'),
  ep('chase', V2.chase, { dur: 3.0, tilt: lt => 4 - lt * 2, zoom: () => 1.05, whipIn: .18 }),
  ep('walkaway', null, { dur: 4.0, speed: () => .4,
    setup() { base({ hour: 19.7 }); const D = Game.dan, F = World.spots.fireworks; T_.F = F; Object.assign(D, { x: F.x, y: F.y + 20, dir: 'down' }); Game.npcs = Game.npcs.filter(n => n.id !== 'tourist'); Game.animals = Game.animals.filter(a => Math.hypot(a.x - F.x, a.y - F.y) > 140); T_.bl = []; },
    after(lt) {
      const D = Game.dan, F = T_.F; walkTo(D, F.x, F.y + 20, F.x, F.y + 44, Math.min(1, EP.vt / 1.6), 'down');
      Trailer.epicBooms.forEach((t, i) => { if (at(lt, t, 'x' + i)) { explode(F.x + [-26, 22, -8, 30, -34, 6, 18][i], F.y - [4, 14, 22, 2, 12, 28, 8][i]); Game.flash = .4; Game.shake = 5; T_.bl.push(lt); headlineQ.length = 0; } });
      if (at(lt, 2.7, 'hl')) headline('FLORIDA MAN WALKS AWAY FROM EXPLOSION WITHOUT LOOKING BACK; “COOL GUYS DON’T,” HE EXPLAINS');
      camOn(D.x, D.y - 22, 2.1 - lt * .07);
    },
    tilt: lt => Math.sin(lt * .9) * 3.5, flare: lt => { const b = T_.bl || []; const k = b.reduce((m, t) => Math.max(m, 1 - (lt - t) / .8), 0); return [960, 420, Math.max(.25, k)]; } }),
  quote('q2', 'HE OWES ME FORTY DOLLARS.', 'SKEETER, THE LEAKY TIKI'),
  ep('iguana', V1s('iguana'), { dur: 2.0, speed: () => .6, zoom: () => 1.1, tilt: () => 2, whipIn: .15 }),
  ep('skunk', V2.skunk, { dur: 2.5, tilt: () => -2, zoom: lt => 1 + lt * .04 }),
  ep('objection', V2.objection, { dur: 2.5, punch: [1.3], after(lt) { if (at(lt, 1.3, 'fl')) Game.flash = .5; } }),
  ep('laurels', null, { dur: 1.5, gfx: `<div class="lau">${LAU('OFFICIAL SELECTION', 'GULP-N-GO PARKING LOT<br>FILM FESTIVAL 2026')}${LAU('WINNER', 'BEST PERFORMANCE<br>BY A MANATEE')}</div>`,
    anim(lt, g) { [...g.querySelectorAll('.w')].forEach((w, i) => { const k = lt - i * .2; w.style.opacity = k > 0 ? Math.min(1, k / .2) : 0; w.style.transform = `scale(${(1.02 + lt * .02).toFixed(4)})`; }); } }),
  ep('court', V1s('court'), { dur: 2.5, speed: () => 1.3, punch: [1.25] }),
  // ===== ACT THREE: ESCALATION =====
  ep('miami', null, { dur: 6.0, grade: 'miami',
    setup() { base({ region: 'miami', day: 11, hour: 19.5 }); Game.flags.suit = true; const D = Game.dan; Object.assign(D, { x: 55.7 * TS, y: 5 * TS, dir: 'down' }); },
    after(lt) { const D = Game.dan; walkTo(D, 55.7 * TS, 5 * TS, 55.7 * TS, 11 * TS, lt / 6, 'down'); camOn(56 * TS, D.y + 10 - lt * 2, 1.05 + lt * .05); },
    tilt: lt => 2 - lt * .5, flare: lt => [1650, 240, .7], vo: [['f1', .3], ['f2', 1.55], ['f3', 3.55]],
    text: [[.3, 1.6, 'THIS FALL', 'sm'], [3.7, 6.0, 'MIAMI.', 'neon']] }),
  ep('lambo', V2.lambo, { dur: 4.0, grade: 'miami', speed: (lt, vt) => vt < 1.85 ? 1 : vt < 2.35 ? .24 : 1.3, flare: lt => [1700, 260, .5] }),
  ep('dance', V2.dance, { dur: 2.0, grade: 'miami', punch: [0], flashIn: .1 }),
  ep('boat', V2.boat, { dur: 2.0, grade: 'miami', tilt: lt => -3 + lt, whipIn: .15 }),
  card('daytona', 2.0, [[0, 1.0, 'AND THEN', 'sm'], [1.0, 2.0, 'DAYTONA.', 'gold slam']], { vo: [['d2', .95]] }),
  ep('convoy', null, { dur: 3.0,
    setup() {
      base({ region: 'daytona', day: 17, hour: 11 }); const dr = World.spots.drive;
      const y = T_.ry = convoyRoadY(), x1 = dr.x - 10, x0 = x1 - 150;
      const v = { kind: 'car', id: 'pace', x: x0, y, a: 0, v: 0, c: PAL.white, c2: PAL.red, num: 0 }; Game.vehicles = [v]; Car.enter(v);
      Convoy.on = true; Convoy.hist = []; for (let x = x0 - 300; x <= x0; x += 2) Convoy.hist.push({ x, y, a: 0 });
      T_.x0 = x0; T_.x1 = x1;
    },
    after(lt) { const v = Game.car; if (!v) return; v.x = lerp(T_.x0, T_.x1, Math.min(1, lt / 2.8)); v.y = T_.ry; v.a = 0; v.v = 40; Object.assign(Game.dan, { x: v.x, y: v.y }); Convoy.tick(); camOn(v.x - 50, v.y - 6, 1.2 + lt * .05); if (at(lt, .6, 'hl')) headline('40 RACE CARS FOLLOW FLORIDA MAN THROUGH DONUT DRIVE-THRU; NOBODY KNOWS WHY'); },
    end() { Convoy.on = false; Game.car = null; Game.dan.ride = null; },
    tilt: () => 3, flare: lt => [300 + lt * 200, 280, .6] }),
  ep('speedway', null, { dur: 3.0, speed: lt => lt > 1.2 && lt < 2.1 ? .3 : 1, hl: false,
    setup() {
      base({ region: 'daytona', day: 22, hour: 10 }); const v = { kind: 'car', id: 'car29', x: 0, y: 0, a: 0, v: 0, c: '#ffd23f', c2: PAL.red, num: 29 }; Game.vehicles = [v]; Car.enter(v);
      Speedway.start('race'); Speedway.count = 0; T_.s = 20; for (const c of Speedway.cars) c.prog += 18;
    },
    after(lt, dt) {
      const P = pathPts(), n = P.length, v = Game.car; if (!v) return; T_.s += dt * EP.speed * 190 / (1936 / n);
      const k = ((Math.floor(T_.s) % n) + n) % n, f = T_.s - Math.floor(T_.s), p = P[k], q = P[(k + 1) % n], a = Math.atan2(q.y - p.y, q.x - p.x);
      v.x = p.x + (q.x - p.x) * f + Math.cos(a + Math.PI / 2) * 4; v.y = p.y + (q.y - p.y) * f + Math.sin(a + Math.PI / 2) * 4; v.a = a; v.v = 190;
      Object.assign(Game.dan, { x: v.x, y: v.y }); ui.urgent.hidden = true; camOn(v.x, v.y - 4, 1.6);
    },
    end() { Speedway.on = false; Speedway.cars = []; Game.racing = false; Game.car = null; Game.dan.ride = null; },
    tilt: lt => -4 + lt * 2, whipIn: .15 }),
  ...MONT.map(([id, src], i) => ep('m_' + id, src, { dur: .5, flashIn: .07, hl: false, talk: false, zoom: lt => 1.1 + lt * .2, tilt: () => (i % 2 ? 3 : -3), grade: id === 'race' || id === 'abuela' ? 'miami' : 'epic' })),
  card('silence', 1.0, []),
  // ===== ACT FOUR: THE BUTTON =====
  ep('swears', null, { dur: 5.0, hl: false,
    setup() { base({ hour: 17.9 }); const D = Game.dan, d = World.spots.door; Object.assign(D, { x: d.x + 20, y: d.y + 34, dir: 'down' }); Game.npcs = Game.npcs.filter(n => n.id !== 'tourist'); Game.animals = Game.animals.filter(a => a.type !== 'gator'); },
    step(lt) { if (at(lt, 4.1, 'beer')) useItem('beer'); },
    after(lt) { const D = Game.dan; D.dir = 'down'; camOn(D.x, D.y - 8, 2.1 + lt * .09); },
    flare: () => [1720, 430, .75], vo: [['n1', .45], ['n2', 1.4], ['n3', 2.45]] }),
  ep('title', null, { dur: 5.5, gfx: `<div class="ttl"><div class="tt gold">FLORIDA<br>DAN</div><div class="ts">HE IS NOT A FLORIDA MAN</div><div class="shine"></div>${Array.from({ length: 70 }, () => '<i class="em"></i>').join('')}</div>`,
    vo: [['t1', 1.0]], flare: lt => [360 + lt * 260, 360, lt < .1 ? 0 : .7 * Math.min(1, (5.5 - lt) / .5)],
    anim(lt, g) {
      const t = g.querySelector('.tt'), k = Math.min(1, lt / .09); t.style.opacity = k; t.style.transform = `scale(${(1.1 - .1 * ease(lt / 5.5)).toFixed(4)})`;
      g.querySelector('.ts').style.opacity = Math.max(0, Math.min(1, (lt - 1.9) / .5)); g.querySelector('.shine').style.left = `${-400 + (lt - .2) * 1500}px`;
      g.querySelector('.ttl').style.opacity = Math.min(1, (5.5 - lt) / .35);
      [...g.querySelectorAll('.em')].forEach((e, i) => { const sp = 40 + (i * 37) % 70, x = (i * 283) % 1920 + Math.sin(lt * 1.3 + i) * 30, y = 1180 - ((lt * sp + (i * 131) % 1100) % 1250); e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.opacity = (.35 + ((i * 7) % 10) / 16).toFixed(2); });
    } }),
  ep('stinger', V1s('button'), { dur: 4.0, flare: () => [1600, 300, .4] }),
  ep('end', null, { dur: 6.5, gfx: `<div class="endc"><div class="et gold">FLORIDA DAN</div><div class="av">AVAILABLE NOW</div><div class="fr">FREE · NO ADS · PLAYS IN YOUR BROWSER</div><div class="url">tbone94.github.io/florida-dan</div>
      <div class="bill">SWAMP GAS PICTURES <b>PRESENTS</b> IN ASSOCIATION WITH GULP-N-GO ENTERTAINMENT A DAN PRODUCTION <b>“FLORIDA DAN”</b> DAN &nbsp;CHUCK THE GATOR &nbsp;RHONDA &nbsp;MANNY THE MANATEE &nbsp;AND TRASH BABY <b>AS HIMSELF</b><br>CASTING BY WHOEVER WAS AT THE GULP-N-GO &nbsp;MUSIC BY <b>A GUY WITH A BANJO</b> &nbsp;EDITED BY A RACCOON &nbsp;DIRECTOR OF PHOTOGRAPHY <b>A PELICAN</b> &nbsp;EXECUTIVE PRODUCER DAN’S MOM<br>BASED ON 79 TRUE HEADLINES &nbsp;<b>NONE OF WHICH ARE TRUE</b> &nbsp;NO MANATEES WERE HARMED &nbsp;SEVERAL GATORS WERE MILDLY INCONVENIENCED</div>
      <div class="rb"><big>F</big>FLORIDA</div></div>`,
    vo: [['r1', 3.2]], anim(lt, g) { const c = g.querySelector('.endc'); c.style.opacity = Math.min(1, lt / .4, (6.5 - lt) / .6); g.querySelector('.et').style.transform = `scale(${(1 + lt * .01).toFixed(4)})`; } }),
);
Trailer.epicBooms = [.25, .75, 1.2, 1.55, 2.0, 2.55, 3.2];
Trailer.setShots(SH);
Trailer.epicShots = SH;
Trailer.vo = []; for (const s of SH) for (const [n, t] of s._o.vo || []) Trailer.vo.push([n, +(s.start + t).toFixed(3)]);
})();
