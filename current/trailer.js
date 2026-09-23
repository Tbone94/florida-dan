// FLORIDA DAN — director mode. Every shot is the real game, set up and puppeteered,
// stepped one exact 1/60s frame at a time so the recorder never drops a frame.
'use strict';
const FPS = 60;
let seed = 7;
Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const T_ = {};
const Trailer = { extra: null };

// ---------- helpers ----------
function hideUI() {
  ['talk', 'card', 'fishHud', 'wrestle', 'raccoon', 'toast', 'prompt', 'hudTop', 'quests', 'hotbar', 'urgent', 'title', 'gazette', 'shop', 'journal', 'credits', 'pad', 'questToggle', 'rotate']
    .forEach(id => { const e = $(id); if (e) e.hidden = true; });
  ui.fishMsg.textContent = ''; ui.wrestlePrompt.textContent = '';
}
function base(o = {}) {
  Game.day = 5; Game.flags = {}; Game.catchBag = []; Game.pythons = []; Game.money = 40;
  Game.inv = { beer: 9, cig: 5, joint: 2, shroom: 2, powder: 2, energy: 1, hotdog: 1, scratch: 1, firework: 2, bait: 3, fish: 0, can: 3, plywood: 0, sign: 0 };
  Game.mode = 'play'; Game.day_ = freshDayLog(); Game.day_.duiDone = true;
  Object.assign(Game.fx, { buzz: 0, high: 0, shroom: 0, powder: 0, crash: 0, cig: 0 });
  Object.assign(Game, { storm: 0, cold: false, urgent: 0, chill: 100, shake: 0, flash: 0, parts: [], projectiles: [], talk: null, view: [0, 0, 1], hour: o.hour || 11, courtChuck: 0 });
  headlineQ.length = 0; Fishing.f = null; Wrestle.w = null; Events.t = 1e9;
  Object.assign(Game.dan, { ride: null, hurt: 0, anim: null, animT: 0, moving: false, frame: 0, dir: 'down', x: World.spots.dan.x, y: World.spots.dan.y });
  spawn(); Game.pickups = []; Game.quests = [];
  Game.animals = Game.animals.filter(a => a.type !== 'raccoon' && a.type !== 'pelican');   // no surprise thefts on camera
  Input.releaseAll(); Input.endFrame();
  hideUI(); Trailer.extra = null; banner.text = null;
}
function camOn(x, y, z = 1, oy = 0) {
  Game.cam.x = x - VW / 2; Game.cam.y = y - VH / 2 - 10;
  Game.view = [.5 - .5 / z, .5 - .5 / z + oy, 1 / z];
}
const ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
const at = (lt, t0, key) => { if (lt >= t0 && !T_[key]) { T_[key] = true; return true; } return false; };
const npc = id => Game.npcs.find(n => n.id === id);
const worldToScreen = (x, y) => [x - Math.round(clamp(Game.cam.x, 0, MW * TS - VW)), y - Math.round(clamp(Game.cam.y, 0, MH * TS - VH))];
function sayNow(lines) { say(lines); Game.talk.typed = 0; }
function liveTalk(dt) { if (Game.mode === 'talk') tickWorld(dt); }

// ---------- overlays (trailer-only DOM, animated per frame) ----------
const banner = { text: null, t0: 0 };
function showCard(html, cls = '') { const c = $('tcard'); c.className = cls; c.innerHTML = html; c.hidden = false; }
function hideCard() { $('tcard').hidden = true; }

// ---------- the shot list ----------
const SHOTS = [
  { id: 'cozy', dur: 4.0, setup() {
      base({ hour: 6.7 }); const D = Game.dan; D.dir = 'right';
      const d = World.spots.dockEnd;
      Game.animals = Game.animals.filter(a => a.type !== 'gator' || Math.hypot(a.x - d.x, a.y - d.y) > 200);
      const gt = makeGator(0, 0, false); T_.gt = gt; Game.animals.push(gt);
      let gy = d.y + 20; while (!WET(World.at(d.x - 70, gy)) && gy < d.y + 60) gy += 4;
      T_.gp = [d.x - 70, gy + 6];
    },
    step(lt) { Input.set('right', lt > .45 && lt < 1.75); if (at(lt, 2.1, 'beer0')) useItem('beer'); },
    frozen: lt => lt > 3.55,
    after(lt) {
      const D = Game.dan, gt = T_.gt;
      if (lt < 3.0) { gt.x = T_.gp[0]; gt.y = T_.gp[1]; gt.lurk = true; gt.dir = 'right'; }
      else if (lt < 3.4) { const k = ease((lt - 3.0) / .4); gt.lurk = false; gt.state = 'chase'; gt.x = lerp(T_.gp[0], D.x - 14, k); gt.y = lerp(T_.gp[1], D.y + 4, k); gt.dir = dirOf(D.x - gt.x, D.y - gt.y); }
      if (at(lt, 3.4, 'bite0')) { gt.chomp = 99; Game.shake = 5; splash(D.x, D.y, 8); D.dir = 'left'; toast('HE BIT MY ASS! MY ACTUAL ASS!'); }
      if (lt >= 3.4) { gt.x = D.x - 18; gt.y = D.y + 3; gt.dir = 'right'; gt.lurk = false; }
      if (lt > 3.45) D.hurt = 0;   // no blink on the freeze-frame
      const z = lt < 3.55 ? 1.25 + lt * .03 : 1.37 + ease((lt - 3.55) / .12) * .75;
      const fk = ease((lt - 3.4) / .15), fx = lerp(D.x - 30 * (1 - ease(lt / 3)), (D.x + gt.x) / 2 + 6, fk);
      camOn(fx, D.y - 6, z);
    } },
  { id: 'card1', dur: 1.5, sim: false, setup() { showCard('<div class="big">DAN IS <em>NOT</em><br>A FLORIDA MAN.</div>', 'slam'); }, end() { hideCard(); } },
  { id: 'cooler', dur: 2.5, setup() {
      base({ hour: 11 }); const D = Game.dan; D.x = 36.5 * TS; D.y = 44.6 * TS; D.dir = 'right'; D.ride = 'cooler'; Object.assign(Game.cooler, { x: D.x, y: D.y, dir: 'right' });
      const r = npc('rhonda'); Object.assign(r, { x: 51.5 * TS, y: 43.2 * TS, hx: 51.5 * TS, hy: 43.2 * TS, wander: 0, dir: 'left' });
      Game.npcs = Game.npcs.filter(n => n.id !== 'tourist');
    },
    step() { Input.set('right', true); },
    after(lt) { const D = Game.dan; if (at(lt, .9, 'h2')) headline('FLORIDA MAN CITED FOR DUI ON MOTORIZED COOLER; ASKS DEPUTY IF SHE "WANTS A COLD ONE"'); camOn(D.x + 26, D.y - 26, 1.25); } },
  { id: 'fish', dur: 2.5, setup() {
      base({ hour: 16 }); Game.dan.ride = 'boat'; Game.inv.bait = 3;
      Fishing.start(T.DEEP, false); const f = Fishing.f; f.fish = []; f.merleZone = true;
      const fi = { sp: SPECIES[1], lbs: 6.8, x: 205, y: 96, hy: 96, dir: 1, spd: 14, want: 0 };
      f.fish.push(fi, { sp: SPECIES[0], lbs: .8, x: 260, y: 130, hy: 130, dir: -1, spd: 12, want: 0 }, { sp: SPECIES[3], lbs: 9, x: 150, y: 150, hy: 150, dir: 1, spd: 10, want: 0 });
      f.phase = 'wait'; f.lure.x = fi.x; f.lure.y = fi.y; Fishing.hook(fi); T_.fi = fi;
    },
    step(lt) { Input.set('a', lt < .5 || lt > 1.5); },
    after(lt) {
      const f = Fishing.f; if (!f) return;
      if (f.phase === 'fight') { f.tension = .5 + .22 * Math.sin(lt * 9); f.slack = 0; f.stam = 1; }
      if (at(lt, .5, 'jump')) { f.jump = { t: 0, x0: T_.fi.x }; Fishing.msg('JUMP! LET OFF!', .9); }
      if (at(lt, 1.35, 'chuck')) { f.gator = { x: T_.fi.x + 34, y: T_.fi.y + 12, chuck: true, flee: false }; Fishing.msg('CHUCK!!', 1); }
      Game.view = [0, 0, 1];
    } },
  { id: 'wrestle', dur: 2.5, setup() {
      base({ hour: 12 }); Wrestle.start({ foe: 'gator', arena: 'swamp' }); Wrestle.w.promptT = 99;
    },
    step(lt) { if (Math.floor(lt * 60) % 5 === 0) Input.press('a'); if (at(lt, .85, 'hit')) Input.press('left'); },
    after(lt) {
      const w = Wrestle.w; if (!w) return;
      if (at(lt, .45, 'p1')) { w.prompt = 'left'; w.window = 1; Wrestle.msg('THRASH! PRESS ◀'); }
      if (at(lt, 1.25, 'p2')) { w.prompt = 'up'; w.window = .3; Wrestle.msg('THRASH! PRESS ▲'); }
      if (at(lt, 1.95, 'win')) w.grip = 150;
      else if (lt < 1.95) w.grip = clamp(w.grip, 28, 88);
      Game.view = [0, 0, 1];
    } },
  { id: 'raccoon', dur: 1.5, setup() { base(); Game.mode = 'raccoon'; Minigame.r = { t: 0, mash: 0 }; ui.raccoon.hidden = false; },
    step(lt) { if (Math.floor(lt * 60) % 4 === 0) Input.press('a'); },
    after() { Minigame.r.mash = Math.min(Minigame.r.mash, 12); Game.view = [0, 0, 1]; } },
  { id: 'iguana', dur: 2.0, setup() {
      base({ hour: 7.4 }); Game.cold = true;
      const p = World.props.find(p => p.kind === 'palm' && p.y > 38 * TS && p.y < 43 * TS && p.x > 22 * TS && canWalk(p.x + 4, p.y + 14)) || World.props.find(p => p.kind === 'palm');
      const D = Game.dan; D.x = p.x + 4; D.y = p.y + 14; D.dir = 'down'; T_.palm = p;
    },
    step(lt) {
      const D = Game.dan;
      for (const [t0, k] of [[.1, 'i1'], [.6, 'i2'], [1.1, 'i3']]) if (at(lt, t0, k)) Game.animals.push(makeCritter('iguana', D.x + rnd(-2, 2), D.y + 1, { falling: true, z: 72, vz: 0 }));
    },
    after(lt) { const D = Game.dan; camOn(D.x, D.y - 22, 1.5); } },
  { id: 'brenda', dur: 2.5, setup() {
      base({ hour: 18.7 }); const D = Game.dan, d = World.spots.dockEnd; D.x = d.x - 6; D.y = d.y; D.dir = 'right';
      sayNow([['PHONE: BRENDA (PUBLIC DEFENDER)', 'Four days, Dan. No headlines. Act. NORMAL.']]);
    },
    after(lt, dt) { liveTalk(dt); const D = Game.dan; camOn(D.x + 20, D.y - 4, 1.15 + lt * .08); } },
  { id: 'drunk', dur: 2.0, setup() {
      base({ hour: 14 }); const D = Game.dan; D.x = World.spots.door.x + 30; D.y = World.spots.door.y + 22; D.dir = 'right';
      Game.fx.buzz = 82; ui.hudTop.hidden = false; ui.hotbar.hidden = false; updateHotbar();
    },
    step(lt) { Input.set('right', lt > .3); Input.set('down', Math.sin(lt * 5) > .3); if (at(lt, .08, 'b')) useItem('beer'); },
    after(lt) { const D = Game.dan; Game.fx.buzz = clamp(Game.fx.buzz, 80, 104); camOn(D.x, D.y - 10, 1.3); } },
  { id: 'blackout', dur: 2.5, setup() {
      base({ hour: 9.3 }); const P = World.spots.pasture; T_.P = P;
      Game.dan.x = -500; Game.dan.y = -500;
      Game.animals = Game.animals.filter(a => a.type !== 'cow' || Math.hypot(a.x - P.x, a.y - P.y) > 50);
      const cow = makeCritter('cow', P.x, P.y); cow.timer = 99; T_.cow = cow; Game.animals.push(cow);
      sayNow([['', 'Everything goes black...']]);
      Trailer.extra = () => {
        const [sx, sy] = worldToScreen(P.x, P.y);
        g.save(); g.translate(Math.round(sx - 4), Math.round(sy - 11)); g.rotate(-Math.PI / 2); g.drawImage(SPR.dan.right[0], -11, -8); g.restore();
        label('z Z z', sx - 2, sy - 30 - Math.sin(Game.t * 2) * 2, PAL.white, 7);
      };
    },
    after(lt, dt) {
      liveTalk(dt);
      const c = T_.cow; c.x = T_.P.x; c.y = T_.P.y; c.vx = c.vy = 0; c.moving = false; c.flip = false; if (at(lt, 1.5, 'moo')) c.moo = 1.4;
      if (at(lt, .9, 'wake')) { ui.talk.hidden = true; Game.talk = null; Game.mode = 'play'; }
      if (at(lt, 1.15, 'hb')) headline('FLORIDA MAN FOUND SPOONING COW; COW "DID NOT PRESS CHARGES"');
      Game.flash = 0; $('tfade').style.opacity = lt < .9 ? 1 : Math.max(0, 1 - (lt - .9) * 6);
      camOn(T_.P.x, T_.P.y - 12, 1.6);
    }, end() { $('tfade').style.opacity = 0; } },
  { id: 'powder', dur: 2.0, setup() {
      base({ hour: 12 }); const D = Game.dan; D.x = 23 * TS; D.y = 44.6 * TS; D.dir = 'right';
      Game.npcs = Game.npcs.filter(n => n.id !== 'tourist');
    },
    step(lt) { if (at(lt, .02, 'sniff')) useItem('powder'); Input.set('right', lt > .22); Input.set('run', true); },
    after(lt) { const D = Game.dan; camOn(D.x + 34, D.y - 14, 1.25 + Math.sin(lt * 30) * .01); } },
  { id: 'fireworks', dur: 2.5, setup() {
      base({ hour: 19.3 }); const D = Game.dan; D.x = 27.3 * TS; D.y = 42.8 * TS; D.dir = 'right';
      const t = Game.npcs.filter(n => n.id === 'tourist'); if (t[0]) Object.assign(t[0], { x: 33 * TS, y: 43.6 * TS, hx: 33 * TS, hy: 43.6 * TS, wander: 10 });
      Game.animals.push(makeCritter('raccoon', 36 * TS, 42.8 * TS), makeCritter('pelican', 31 * TS, 43 * TS));
    },
    step(lt) { if (at(lt, .3, 'throw')) useItem('firework'); },
    after(lt) { camOn(32 * TS, 41.2 * TS, 1.1); } },
  { id: 'hurricane', dur: 2.0, setup() {
      base({ hour: 17.6 }); const M = World.spots.merle, D = Game.dan; D.x = M.x - 26; D.y = M.y + 6; D.dir = 'right';
      Game.storm = 1; sayNow([['MERLE', 'WANDA! WANDA! WANDA!']]);
      Trailer.extra = () => {   // a lawn flamingo achieves flight
        const k = T_.lt / 2, x = -30 + k * (VW + 60), y = 40 + Math.sin(k * 9) * 14;
        g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(k * 14); g.drawImage(SPR.flamingo, -4, -7); g.restore();
        const k2 = (T_.lt - .7) / 1.3; if (k2 > 0) { g.save(); g.translate(Math.round(-20 + k2 * (VW + 40)), Math.round(120 - k2 * 50)); g.rotate(-k2 * 8); OR(-7, -3, 14, 2, PAL.teal); OR(-7, 1, 2, 6, PAL.white); OR(5, 1, 2, 6, PAL.white); g.restore(); }
      };
    },
    after(lt, dt) {
      Game.storm = 1; liveTalk(dt); if (at(lt, .75, 'l1') || at(lt, 1.55, 'l2')) Game.flash = .9;
      T_.lt = lt;
      const M = World.spots.merle; camOn(M.x - 12, M.y - 18, 1.3);
    } },
  { id: 'shroom', dur: 3.0, setup() {
      base({ hour: 19.9 }); const M = World.spots.merle, D = Game.dan;
      let y = M.y; while (!WET(World.at(M.x, y + 16)) && y < M.y + 200) y += 4;
      D.x = M.x; D.y = y; D.dir = 'down'; Game.fx.shroom = 40;
      Game.npcs = Game.npcs.filter(n => n.id !== 'merle');
      const man = makeCritter('manatee', M.x + 6, y + 40, { spirit: true }); Game.animals.push(man);
      const rac = makeCritter('raccoon', D.x - 26, D.y - 2), pel = makeCritter('pelican', D.x + 28, D.y - 4);
      rac.timer = pel.timer = 99; Game.animals.push(rac, pel); T_.rac = rac; T_.pel = pel; T_.racP = [rac.x, rac.y]; T_.pelP = [pel.x, pel.y];
      Trailer.extra = () => {
        const lt = T_.lt;
        if (lt > .3) { const [x, y2] = worldToScreen(T_.rac.x, T_.rac.y); label('We are all Florida Men, Dan.', x, y2 - 18, PAL.neon, 6); }
        if (lt > 1.0) { const [x, y2] = worldToScreen(T_.pel.x, T_.pel.y); label('Have you tried being a bird?', x, y2 - 20, PAL.yellow, 6); }
      };
    },
    step(lt) { if (at(lt, 1.6, 'manny')) sayNow([['MANNY THE MANATEE SPIRIT', 'Daaaaaaaniel...']]); },
    after(lt, dt) {
      liveTalk(dt); Game.fx.shroom = 40; T_.lt = lt;
      for (const [c, p] of [[T_.rac, T_.racP], [T_.pel, T_.pelP]]) { c.vx = c.vy = 0; c.state = 'wander'; c.x = p[0]; c.y = p[1]; c.moving = false; }
      const D = Game.dan; camOn(D.x, D.y + 14, 1.3 + Math.sin(lt * 2) * .08);
    } },
  { id: 'stack', dur: 2.5, sim: false, setup() {
      const hs = ['FLORIDA MAN WRESTLES ALLIGATOR "FOR FUN"; ALLIGATOR "NOT HAVING FUN"', 'FLORIDA MAN REMOVES RACCOON FROM GAS STATION ICE MACHINE USING HIS FACE',
        'FLORIDA MAN RETURNS SHOPPING CART VIA SWAMP', 'FLORIDA MAN YELLS "GIT" AT TOURIST FROM OHIO', 'FLORIDA MAN HAS "INCIDENT" IN GAS STATION PARKING LOT, BLAMES ROLLER DOG',
        'FLORIDA MAN FOUND RIDING MANATEE DURING HURRICANE; "IT WAS SPIRITUAL"'];
      const st = $('tstack'); st.innerHTML = ''; st.hidden = false;
      hs.forEach((h, i) => { const d = document.createElement('div'); d.className = 'clip'; d.innerHTML = `<small>THE SWAMP GAZETTE</small>${h}`; d.style.left = [8, 44, 16, 50, 6, 30][i] + '%'; d.style.top = [8, 14, 40, 44, 66, 30][i] + '%'; d.dataset.r = [-5, 4, 3, -4, -2, 5][i]; st.append(d); });
      $('tdim').style.opacity = .6;
    },
    after(lt) {
      [...$('tstack').children].forEach((d, i) => { const k = lt - i * .25; d.style.opacity = k > 0 ? 1 : 0; const s = k > 0 ? 1 + Math.max(0, .5 - k * 6) : 1.5; d.style.transform = `rotate(${d.dataset.r}deg) scale(${s.toFixed(3)})`; });
      Game.view = Game.view || [0, 0, 1];
    }, end() { $('tstack').hidden = true; $('tdim').style.opacity = 0; } },
  { id: 'court', dur: 4.0, setup() {
      base(); Game.mode = 'court'; Game.courtChuck = 1;
      sayNow([['JUDGE HARLAN', 'IS THAT A GOD DAMN ALLIGATOR IN MY COURTROOM?']]); Game.talk.prev = 'court';
    },
    step(lt) {
      if (at(lt, 1.6, 'fight')) { ui.talk.hidden = true; Game.talk = null; Game.mode = 'court'; Wrestle.start({ foe: 'chuck', arena: 'court' }); Wrestle.w.promptT = 99; }
      if (lt > 1.6 && Math.floor(lt * 60) % 5 === 0) Input.press('a');
      if (at(lt, 2.2, 'hit')) Input.press('right');
    },
    after(lt) {
      const w = Wrestle.w;
      if (w) { if (at(lt, 1.9, 'pr')) { w.prompt = 'right'; w.window = 1; Wrestle.msg('THRASH! PRESS ▶'); } if (at(lt, 2.6, 'cw')) w.grip = 150; else if (lt < 2.6) w.grip = clamp(w.grip, 30, 90); }
      Game.view = [0, 0, 1];
    } },
  { id: 'black', dur: .5, sim: false, setup() { base(); showCard('', 'black'); }, end() { hideCard(); } },
  { id: 'title', dur: 4.0, sim: false, setup() { showCard('<div class="logo">Florida<br>Dan</div><div class="sub">“I’m <em>not</em> a Florida Man.”</div>', 'title'); }, after(lt) {
      const c = $('tcard'), s = 1 + Math.max(0, .6 - lt * 5); c.querySelector('.logo').style.transform = `rotate(-3deg) scale(${s.toFixed(3)})`;
      c.querySelector('.sub').style.opacity = lt > .9 ? 1 : 0;
    }, end() { hideCard(); } },
  { id: 'button', dur: 4.0, setup() {
      base({ hour: 11.5 }); const D = Game.dan; D.x = 40 * TS; D.y = 44.6 * TS; D.dir = 'right'; D.ride = 'cooler'; Object.assign(Game.cooler, { x: D.x, y: D.y, dir: 'right' });
      const r = npc('rhonda'); Object.assign(r, { x: D.x + 24, y: D.y - 2, hx: D.x + 24, hy: D.y - 2, wander: 0, dir: 'left' });
      Game.npcs = Game.npcs.filter(n => n.id !== 'tourist');
      sayNow([['RHONDA', 'It has HEADLIGHTS, Dan. Why does it have headlights.']]);
    },
    step(lt) { if (at(lt, 2.3, 'dan')) sayNow([['DAN', '...Want a cold one?']]); },
    after(lt, dt) { liveTalk(dt); const D = Game.dan; npc('rhonda').dir = 'left'; camOn(D.x + 12, D.y - 12, 2); } },
  { id: 'end', dur: 4.0, sim: false, setup() { base(); showCard('<div class="logo sm">Florida<br>Dan</div><div class="soon">COMING SOON</div><div class="tag">Gators. Jorts. Allegations.</div>', 'title end'); }, after(lt) { $('tcard').style.opacity = lt > 3.4 ? Math.max(0, 1 - (lt - 3.4) / .6) : 1; } },
];
let t = 0; for (const s of SHOTS) { s.start = t; t += s.dur; }
Trailer.total = t;
Trailer.shots = SHOTS.map(s => [s.id, +s.start.toFixed(3), s.dur]);

// ---------- the frame stepper ----------
let cur = -1;
Trailer.frame = function (i) {
  const T = i / FPS, dt = 1 / FPS;
  let k = SHOTS.findIndex(s => T >= s.start && T < s.start + s.dur); if (k < 0) k = SHOTS.length - 1;
  const sh = SHOTS[k];
  if (k !== cur) { if (cur >= 0 && SHOTS[cur].end) SHOTS[cur].end(); for (const key in T_) delete T_[key]; seed = 1000 + k * 77; cur = k; sh.setup(); }
  const lt = T - sh.start;
  if (sh.step) sh.step(lt, dt);
  if (sh.sim !== false && !(sh.frozen && sh.frozen(lt))) update(dt);
  if (sh.after) sh.after(lt, dt);
  if (sh.sim !== false || k === 0) { render(); hud(); }
  ui.prompt.hidden = true;
  // BREAKING banner: any headline the game fires gets the trailer slam
  if (headlineQ.length) { banner.text = headlineQ.shift(); banner.t0 = T; headlineQ.length = 0; ui.bannerText.textContent = banner.text; }
  const bk = T - banner.t0, on = banner.text && bk < 2.1;
  ui.banner.style.transform = on ? `translate(-50%, ${bk < .12 ? (-160 + 160 * ease(bk / .12)).toFixed(1) : 0}%) rotate(-1deg) scale(${bk < .2 ? (1.12 - (bk / .2) * .12).toFixed(3) : 1})` : 'translate(-50%,-170%) rotate(-1deg)';
  Input.endFrame();
  return T;
};

// ---------- soundtrack, rendered offline and cut to the shot list ----------
Trailer.renderAudio = async function () {
  const SR = 48000, total = Trailer.total, ctx = new OfflineAudioContext(2, Math.ceil(SR * total), SR);
  const S = {}; for (const s of SHOTS) S[s.id] = s.start;
  const master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
  const nbuf = ctx.createBuffer(1, SR * 2, SR); { const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const out = (node, pan = 0) => { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(comp); };
  function tone(t, f, dur, type = 'square', vol = .1, slide = 0, pan = 0, attack = .004) {
    if (t < 0 || t > total) return; const o = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + dur);
    g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(vol, t + attack); g2.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g2); out(g2, pan); o.start(t); o.stop(t + dur + .05); return o;
  }
  function noise(t, dur, vol = .2, type = 'highpass', freq = 1000, q = .7, pan = 0, attack = .002) {
    if (t < 0 || t > total) return; const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g2 = ctx.createGain();
    s.buffer = nbuf; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(vol, t + attack); g2.gain.exponentialRampToValueAtTime(.0008, t + dur);
    s.connect(f); f.connect(g2); out(g2, pan); s.start(t, Math.random()); s.stop(t + dur + .05); return f;
  }
  const kick = (t, v = .7) => { tone(t, 150, .22, 'sine', v, -110); noise(t, .02, .2, 'highpass', 3000); };
  const snare = (t, v = .35) => { noise(t, .16, v, 'bandpass', 1900, .8); tone(t, 210, .08, 'triangle', v * .5, -60); };
  const hat = (t, v = .08, open) => noise(t, open ? .18 : .04, v, 'highpass', 8000, .7, .25);
  const crash = (t, v = .3) => noise(t, 1.6, v, 'highpass', 5000, .5, -.2);
  const pluck = (t, f, v = .07, pan = .3) => { tone(t, f, .22, 'square', v, 0, pan); tone(t, f * 2, .12, 'triangle', v * .6, 0, pan); };
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  const BPM = 120, B = 60 / BPM;
  // swamp-punk groove: E minor, banjo-ish 16th rolls over a stompy kick
  const PROG = [[40, [64, 67, 71, 76]], [36, [60, 64, 67, 72]], [43, [62, 67, 71, 74]], [38, [62, 66, 69, 74]]];
  function groove(t0, t1, o = {}) {
    for (let t = t0, i = 0; t < t1 - 1e-6; t += B / 4, i++) {
      const bar = PROG[Math.floor(i / 16) % 4], st = i % 16, det = o.wobble ? 1 + Math.sin(t * 7) * .035 : 1;
      if (!o.noDrums) {
        if (o.half ? st === 0 : st % 8 === 0 || st === 10) kick(t);
        if (o.half ? st === 8 : st % 8 === 4) snare(t);
        if (st % 2 === 0 || o.fastHats) hat(t, st % 4 === 2 ? .1 : .06, st === 14);
      }
      if (st % 4 === 0 || st === 6 || st === 14) tone(t, N(bar[0]) * det, B * .9, 'triangle', .22, 0, 0);
      if (!o.noBanjo && st % 2 === 0) pluck(t, N(bar[1][(st / 2 + (i >> 4)) % 4] + (st >= 8 ? 12 : 0)) * det, .045, st % 4 ? .35 : -.35);
      if (o.pad && st === 0) for (const n of bar[1]) tone(t, N(n) * (1 + Math.sin(n) * .01), B * 4, 'sine', .05, o.trip ? 30 : 0, 0, .3);
    }
  }
  const hl = t => { [523, 659, 784, 1046].forEach((f, i) => tone(t + i * .05, f, .16, 'square', .05)); noise(t, .25, .08, 'highpass', 6000); };
  const chomp = t => { noise(t, .1, .5, 'lowpass', 900); tone(t, 95, .22, 'square', .2, -45); };
  const boom = t => { noise(t, 1.2, .6, 'lowpass', 400); tone(t, 70, .9, 'sine', .5, -45); };
  const blips = (t, n, base = 180) => { for (let i = 0; i < n; i++) tone(t + i * .055, base + Math.random() * 140, .035, 'square', .03); };
  const scratch = t => { const o = tone(t, 900, .42, 'sawtooth', .16, -780); noise(t, .4, .25, 'bandpass', 1500, 2); };
  const crickets = (t0, t1, v = .04) => { for (let t = t0; t < t1; t += .09) if (Math.random() < .6) tone(t, 4200 + Math.random() * 300, .05, 'sine', v, 0, Math.random() - .5); };

  // cold open: a fake cozy morning
  crickets(0, 3.5); for (let t = 0.2; t < 3.3; t += 1.1) tone(t, 1800, .12, 'sine', .04, 700, .4);
  [67, 71, 74, 79, 76, 74].forEach((n, i) => pluck(.3 + i * .5, N(n), .05, 0));
  tone(0, N(55), 3.6, 'sine', .05, 0, 0, .8);
  noise(S.cozy + 2.1, .12, .35, 'highpass', 2500); noise(S.cozy + 2.2, .35, .08, 'highpass', 4000);   // *crack*
  chomp(S.cozy + 3.4); scratch(S.cozy + 3.55);
  // band kicks in on the card
  crash(S.card1, .38); kick(S.card1, .9);
  groove(S.card1, S.brenda);
  tone(S.cooler + .2, 60, 2.2, 'sawtooth', .03, 20);
  for (let i = 0; i < 4; i++) tone(S.cooler + .9 + i * .22, i % 2 ? 700 : 950, .22, 'sine', .07);  // siren
  hl(S.cooler + .9);
  noise(S.fish + .5, .3, .25, 'lowpass', 900); noise(S.fish + 1.45, .35, .3, 'lowpass', 700); chomp(S.fish + 2.0);
  for (let t = S.fish; t < S.fish + .5; t += .05) tone(t, 950, .02, 'square', .025);
  chomp(S.wrestle + .05); tone(S.wrestle + .85, 1320, .08, 'square', .07); tone(S.wrestle + .9, 1760, .1, 'square', .07);
  tone(S.wrestle + 1.55, 300, .3, 'sawtooth', .12, -200); noise(S.wrestle + 1.55, .4, .3, 'lowpass', 800);
  [392, 523, 659, 784].forEach((f, i) => tone(S.wrestle + 1.95 + i * .07, f, .14, 'triangle', .12));
  for (let t = S.raccoon; t < S.raccoon + 1.4; t += .12) tone(t, 1900 + Math.random() * 900, .11, 'sawtooth', .07, 600);   // SKREEEE
  for (const d of [.83, 1.33, 1.83]) { noise(S.iguana + d, .08, .4, 'lowpass', 500); tone(S.iguana + d, 300, .2, 'sawtooth', .08, -200); }
  hl(S.iguana + .85);
  // breakdown: Brenda
  tone(S.brenda, 1200, .12, 'sine', .08); tone(S.brenda + .18, 1200, .12, 'sine', .08); blips(S.brenda + .2, 12);
  groove(S.brenda, S.drunk, { noDrums: true, noBanjo: true, pad: true });
  // drunk
  noise(S.drunk + .08, .12, .35, 'highpass', 2500); tone(S.drunk + 1.1, 95, .5, 'sawtooth', .1, -20);   // crack + burp
  groove(S.drunk, S.blackout, { wobble: true });
  // blackout
  boom(S.blackout); tone(S.blackout + 1.5, 120, .7, 'sawtooth', .08, -30); tone(S.blackout + 1.5, 180, .7, 'sawtooth', .04, -40);   // moo
  groove(S.blackout + 1.0, S.powder); hl(S.blackout + 1.15);
  // "sinus medicine"
  noise(S.powder, .4, .25, 'highpass', 3000); tone(S.powder + .1, 1200, .3, 'sawtooth', .04, 900); hl(S.powder + .05);
  groove(S.powder, S.fireworks, { fastHats: true });
  // fireworks
  for (let t = S.fireworks + .3; t < S.fireworks + 1.5; t += .03) noise(t, .03, .06, 'highpass', 6000);
  boom(S.fireworks + 1.5); hl(S.fireworks + 1.55);
  groove(S.fireworks, S.hurricane);
  // hurricane
  noise(S.hurricane, 2.0, .12, 'lowpass', 1500); boom(S.hurricane + .8); boom(S.hurricane + 1.6); blips(S.hurricane + .05, 8, 150);
  groove(S.hurricane, S.shroom, { half: true });
  // shrooms
  groove(S.shroom, S.stack, { half: true, pad: true, trip: true, wobble: true });
  for (let i = 0; i < 6; i++) tone(S.shroom + i * .4, 300 + i * 90, .8, 'sine', .04, 200);
  tone(S.shroom + 1.6, 110, 1.2, 'sawtooth', .05, 40); tone(S.shroom + 1.6, 165, 1.2, 'sine', .06, 50);   // "Daaaniel"
  // headline pile-up
  for (let i = 0; i < 6; i++) { kick(S.stack + i * .25, .6); noise(S.stack + i * .25, .12, .3, 'bandpass', 2500, 1); }
  for (let t = S.stack + 1.5; t < S.court; t += B / 8) snare(t, .08 + (t - S.stack - 1.5) * .2);
  // court
  crash(S.court, .5); boom(S.court); blips(S.court + .1, 16, 140);
  groove(S.court + 1.5, S.black);
  chomp(S.court + 1.6); tone(S.court + 2.2, 1320, .08, 'square', .07); [392, 523, 659, 784, 1046].forEach((f, i) => tone(S.court + 2.6 + i * .07, f, .16, 'triangle', .12));
  // title sting
  kick(S.title, 1); crash(S.title, .45); for (const n of [40, 52, 59, 64, 67, 71]) tone(S.title, N(n), 2.8, 'sawtooth', .035, 0, 0, .01);
  [76, 79, 83, 88].forEach((n, i) => pluck(S.title + 1 + i * .12, N(n), .06));
  // the button
  crickets(S.button, S.end, .03); blips(S.button + .05, 16, 160); blips(S.button + 2.3, 6, 200);
  [466, 440, 415, 392].forEach((f, i) => tone(S.button + 3.0 + i * .22, f, i === 3 ? .6 : .2, 'sawtooth', .06, i === 3 ? -40 : 0));   // wah wah wah waaah
  // end slate
  kick(S.end); crash(S.end, .3); groove(S.end, S.end + 3.0, { noDrums: true }); tone(S.end, N(40), 3.5, 'triangle', .15);

  const buf = await ctx.startRendering(), n = buf.length, dv = new DataView(new ArrayBuffer(44 + n * 4)), w = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true); dv.setUint32(24, SR, true); dv.setUint32(28, SR * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 4, true);
  const L = buf.getChannelData(0), Rr = buf.getChannelData(1);
  for (let i = 0; i < n; i++) { dv.setInt16(44 + i * 4, clamp(L[i], -1, 1) * 32767, true); dv.setInt16(46 + i * 4, clamp(Rr[i], -1, 1) * 32767, true); }
  let s = ''; const u = new Uint8Array(dv.buffer); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode(...u.subarray(i, i + 32768));
  return btoa(s);
};

// boot the director: big readable UI for a 1080p frame, no live loop
stage.style.setProperty('--u', '27px');
window.Trailer = Trailer;
