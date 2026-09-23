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
  const reg = o.region || 'swamp'; if (Game.region !== reg) World.load(reg);
  Game.day = o.day || 5; Game.scene = null; Game.courtExtra = {}; Game.vehicles = []; BoatChase.boat = null; Race.on = false; Objection.s = null; Dance.s = null;
  Game.dan.hiding = false; Game.dan.carry = null; ui.fishMsg.textContent = ''; $('heat').hidden = true;
  ui.wrestle.querySelector('.hint').textContent = 'MASH E · HIT THE ARROW WHEN HE THRASHES'; Game.flags = { noChase: true }; Heat.end(); Game.heat = 0; Game.catchBag = []; Game.pythons = []; Game.money = 40;
  Game.inv = { beer: 9, cig: 5, joint: 2, shroom: 2, powder: 2, energy: 1, hotdog: 1, scratch: 1, firework: 2, bait: 3, fish: 0, can: 3, plywood: 0, sign: 0 };
  Game.mode = 'play'; Game.day_ = freshDayLog(); Game.day_.duiDone = true;
  Object.assign(Game.fx, { buzz: 0, high: 0, shroom: 0, powder: 0, crash: 0, cig: 0 });
  Object.assign(Game, { storm: 0, cold: false, urgent: 0, chill: 100, shake: 0, flash: 0, parts: [], projectiles: [], talk: null, view: [0, 0, 1], hour: o.hour || 11, courtChuck: 0 });
  headlineQ.length = 0; Fishing.f = null; Wrestle.w = null; Events.t = 1e9;
  Object.assign(Game.dan, { ride: null, hurt: 0, anim: null, animT: 0, moving: false, frame: 0, dir: 'down', x: World.spots.dan.x, y: World.spots.dan.y });
  spawn(); Game.pickups = []; Game.quests = [];
  Game.animals = Game.animals.filter(a => a.type !== 'raccoon' && a.type !== 'pelican');   // no surprise thefts on camera
  Input.releaseAll(); Input.endFrame();
  hideUI(); Trailer.extra = null; banner.text = null; Game.lens = 0; Game.camFx = 0;
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
const V1 = [
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
// ---------- v2: everything Dan got up to after Case One ----------
const slamIn = (lt, sel = '.big') => { const e = $('tcard').querySelector(sel); if (e) e.style.transform = `rotate(-2deg) scale(${(1 + Math.max(0, .5 - lt * 5)).toFixed(3)})`; };
const V2 = {
  chase: { dur: 3.5, setup() {
      base({ hour: 13 }); const D = Game.dan, h = World.spots.hide || { x: 25.8 * TS, y: 43.3 * TS };
      T_.h = h; T_.x0 = h.x + 84; D.x = T_.x0; D.y = h.y; D.dir = 'left';
      Game.npcs = Game.npcs.filter(n => n.id !== 'tourist'); const r = npc('rhonda'); if (r) r.hidden = true;
      Game.heat = 5; Heat.cop = { x: D.x + 118, y: D.y, dir: 'left', t: 0 }; Heat.lostT = 0;
      ui.hudTop.hidden = false; toast('RHONDA: DAN! PULL OVER! ...OR WALK OVER! WHATEVER YOU’RE DOING!');
    },
    step(lt) { Heat.lostT = 0; },
    after(lt) {
      const D = Game.dan, h = T_.h;
      if (lt < 1.4) { D.x = lerp(T_.x0, h.x, ease(lt / 1.4)); D.y = h.y; D.moving = true; D.dir = 'left'; if (Math.floor(lt * 10) % 2 !== D.frame) D.frame ^= 1; }
      if (at(lt, 1.4, 'hide')) { D.hiding = true; D.moving = false; toast('Dan hides in the porta-potty.'); Game.shake = 3; }
      if (at(lt, 1.75, 'hh')) headline('FLORIDA MAN HIDES FROM POLICE IN PORTA-POTTY; DEPUTY "NOT GOING IN THERE"');
      Game.heat = 5; const c = Heat.cop; camOn(c ? (Math.min(c.x, D.x + 90) + h.x) / 2 : h.x, h.y - 16, 1.35);
    } },
  charges: { dur: 3.0, sim: false, setup() {
      base(); showCard('<div class="rap"><div class="rh">DAN’S RAP SHEET · NEW CHARGES</div><ol>' + ['UNLAWFUL MANATEE OPERATION', 'IMPERSONATING A CRYPTID', 'PUBLIC MUDITY', 'GRAND THEFT LAMBO', 'POSSESSION WITH INTENT TO CLEAR SINUSES'].map(c => `<li>${c}</li>`).join('') + '</ol></div>', 'raps');
    },
    after(lt) { [...$('tcard').querySelectorAll('li')].forEach((li, i) => { const k = lt - .25 - i * .38; li.style.opacity = k > 0 ? 1 : 0; li.style.transform = `scale(${(1 + Math.max(0, .35 - k * 4)).toFixed(3)})`; }); },
    end() { hideCard(); } },
  objection: { dur: 3.0, setup() {
      base(); CourtCases.begin(); Game.courtExtra = { manny: true }; Objection.speaker = null;
      Objection.run([{ text: 'The defendant is a trained, professional manatee jockey.', lie: true, bust: 'Nobody trained him. Look at him.' }], () => { });
    },
    step(lt) { if (at(lt, 1.3, 'obj')) Input.press('a'); },
    after(lt) { ui.fishMsg.textContent = lt >= 1.3 && lt < 2.2 ? 'OBJECTION!' : ''; Game.view = [0, 0, 1]; },
    end() { ui.fishMsg.textContent = ''; ui.talk.hidden = true; } },
  skunk: { dur: 3.0, setup() {
      base({ hour: 20.7 }); const P = Cases.places().trailcam, D = Game.dan;
      D.x = P.x + 10; D.y = P.y; D.dir = 'right';
      const ape = Cases.makeApe(D.x - 34, D.y - 3); ape.state = 'lurk'; T_.ape = ape; Game.animals.push(ape);
    },
    step(lt) { if (at(lt, .2, 'beer')) useItem('beer'); if (at(lt, .85, 'hrm')) sayNow([['SKUNK APE', 'HRRRRRRRM.']]); },
    after(lt, dt) {
      liveTalk(dt); const D = Game.dan, a = T_.ape; a.x = D.x - 34; a.y = D.y - 3;
      if (at(lt, 1.55, 'turn')) { D.dir = 'left'; Game.shake = 2; ui.talk.hidden = true; Game.talk = null; Game.mode = 'play'; }
      if (at(lt, 1.7, 'hs')) headline('FLORIDA MAN SHARES BEER WITH SKUNK APE; "HE’S A GOOD LISTENER"');
      camOn(D.x - 16, D.y - 20, 1.55);
    } },
  card3: { dur: 3.0, sim: false, setup() { base(); showCard('<div class="big">THEN HE WENT<br>TO <em>MIAMI.</em></div>', 'slam miami'); }, after(lt) { slamIn(lt); }, end() { hideCard(); } },
  lambo: { dur: 3.5, setup() {
      base({ region: 'miami', day: 11, hour: 12 }); const D = Game.dan;
      const v = { kind: 'lambo', x: 55 * TS, y: 13 * TS, a: 0, v: 0, t: 0 }; Game.vehicles = [v]; T_.v = v; T_.x0 = v.x;
      let x = v.x; while (!WET(World.at(x, v.y)) && x < MW * TS) x += 4; T_.sx = x + 10;
      Object.assign(D, { ride: 'lambo', x: v.x, y: v.y, dir: 'right' });
      toast('Push-to-start. Nice. Where are the... where are the BRAKES?');
    },
    after(lt, dt) {
      const D = Game.dan, v = T_.v;
      if (lt < 2.0) {
        v.x = lerp(T_.x0, T_.sx, Math.pow(lt / 2, 1.8)); D.x = v.x; D.y = v.y;
        if (Math.random() < .6) Game.parts.push({ kind: 'speed', x: v.x - 14, y: v.y + rnd(-5, 5), vx: -60, vy: 0, life: .25 });
        if (at(lt, 1.0, 'stuck')) { toast('THE GAS PEDAL IS STUCK. THE OCEAN IS RIGHT THERE.'); Game.shake = 3; }
      }
      if (at(lt, 2.0, 'sploosh')) { ui.toast.hidden = true; toastT = 0; Game.vehicles = []; splash(v.x, v.y, 30); Game.shake = 10; Game.flash = .5; Object.assign(D, { ride: null, x: T_.sx - 30, y: v.y + 6, dir: 'right' }); }
      if (at(lt, 2.1, 'hl')) headline('FLORIDA MAN VALETS INFLUENCER’S PINK LAMBORGHINI DIRECTLY INTO ATLANTIC OCEAN; "THE CAR DON’T SURF," HE EXPLAINS');
      if (at(lt, 2.45, 'surf')) sayNow([['DAN', 'The car don’t surf.']]);
      liveTalk(dt);
      camOn(lt < 2 ? v.x + 30 : T_.sx - 14, v.y - 10, 1.3);
    } },
  abuela: { dur: 2.5, setup() {
      base({ region: 'miami', day: 12, hour: 9.5 }); Game.flags.suit = true; const D = Game.dan, c = World.spots.cafe;
      const a = npc('abuela'); if (a) Object.assign(a, { x: c.x, y: c.y, hx: c.x, hy: c.y, wander: 0, dir: 'down' });
      D.x = c.x + 4; D.y = c.y + 22; D.dir = 'up';
      sayNow([['ABUELA', 'First you buy a cafecito. Then you SIT. Then you listen to my story.']]);
    },
    after(lt, dt) { liveTalk(dt); if (at(lt, 1.9, 'long')) sayNow([['DAN', '...How long is the story?']]); const c = World.spots.cafe; camOn(c.x + 2, c.y + 4, 1.9); } },
  race: { dur: 2.5, setup() {
      base({ region: 'miami', day: 13, hour: 11 }); Game.flags.suit = true; Game.inv.cafecito = 2;
      const r = npc('raul'); T_.r = r; Object.assign(r, { race: true, skate: 1, x: 57.3 * TS, y: 9 * TS, dir: 'down' });
      Object.assign(Game.dan, { x: 55.7 * TS, y: 9 * TS - 6, dir: 'down' });
      toast('Race to the Flamingo Hotel! (Raul is fast.)');
    },
    step(lt) { if (at(lt, .15, 'caf')) useItem('cafecito'); },
    after(lt) {
      const D = Game.dan, r = T_.r, y0 = 9 * TS;
      r.y = y0 + lt * 82; r.moving = true; r.dir = 'down'; if (Math.floor(lt * 8) % 2 !== r.frame) r.frame ^= 1;
      D.y = y0 - 6 + lt * 70 + Math.max(0, lt - .6) * Math.max(0, lt - .6) * 30; D.x = 55.7 * TS; D.dir = 'down'; D.moving = true; if (Math.floor(lt * 12) % 2 !== D.frame) D.frame ^= 1;
      if (Math.random() < .5) Game.parts.push({ kind: 'speed', x: D.x + rnd(-4, 4), y: D.y - 12, vx: 0, vy: -50, life: .2 });
      if (at(lt, 1.8, 'won')) headline('FLORIDA MAN BEATS ROLLERBLADER IN OCEAN DRIVE RACE; ROLLERBLADER "DEVASTATED," DEMANDS REMATCH');
      camOn(56.5 * TS, (D.y + r.y) / 2 - 8, 1.5);
    } },
  party: { dur: 2.5, setup() {
      base({ region: 'miami', day: 15, hour: 19.8 }); Game.flags.suit = true; Party.begin(); ui.toast.hidden = true; toastT = 0;
      const gst = Game.npcs.find(n => n.guest === 2); T_.g = gst; gst.wander = 0; gst.dir = 'left';
      Object.assign(Game.dan, { x: gst.x - 20, y: gst.y, dir: 'right' });
      sayNow([['WOMAN IN SUNGLASSES', 'Have you tried the... medicine?']]);
    },
    after(lt, dt) { liveTalk(dt); if (at(lt, 1.3, 'sinus')) sayNow([['DAN', '“Only for my sinuses.”']]); const gst = T_.g; gst.dir = 'left'; Game.dan.dir = 'right'; camOn(gst.x - 10, gst.y - 8, 2); } },
  dance: { dur: 2.5, setup() {
      base({ region: 'miami', day: 12, hour: 22 }); Dance.start(() => { });
      const s = Dance.s; s.t = .95; s.score = 8; for (const n of s.seq) if (n.t < s.t) n.hit = true;
    },
    step() { const s = Dance.s; if (!s) return; s.seq.forEach((n, i) => { if (n.hit === null && s.t >= n.t - .02 && !T_['n' + i]) { T_['n' + i] = true; Input.press(n.dir); } }); },
    after(lt) { if (at(lt, 1.5, 'hd')) headline('FLORIDA MAN WINS DANCE-OFF AT CLUB SINUS; DJ "SHOOK," CROWD "CONFUSED BUT INTO IT"'); Game.view = [0, 0, 1]; },
    end() { ui.wrestle.hidden = true; } },
  boat: { dur: 2.5, setup() {
      base({ region: 'miami', day: 16, hour: 17 }); const D = Game.dan;
      BoatChase.boat = { x: 76 * TS, y: 44 * TS, i: 1, dir: 'right' }; BoatChase.hold = 0;
      Object.assign(D, { ride: 'boat', dir: 'right', x: 72 * TS, y: 44 * TS }); toast('STAY ON HIM!');
    },
    step() { BoatChase.hold = 0; },
    after(lt) {
      const D = Game.dan, b = BoatChase.boat, bx = 76 * TS + lt * 58, y = 44 * TS;
      b.x = bx; b.y = y; b.dir = 'right'; if (Math.random() < .5) Game.parts.push({ kind: 'foam', x: bx - 16, y: y + 3, vx: 0, vy: 0, life: .8 });
      const gap = lt < 1.6 ? lerp(84, 34, ease(lt / 1.6)) : 34;
      D.x = bx - gap; D.y = y + 2; D.dir = 'right'; Object.assign(Game.boat, { x: D.x, y: D.y, dir: 'right' });
      if (Math.random() < .5) Game.parts.push({ kind: 'foam', x: D.x - 16, y: D.y + 3, vx: 0, vy: 0, life: .8 });
      if (at(lt, 1.6, 'got')) { Game.flash = .6; Game.shake = 4; headline('FLORIDA MAN CATCHES SINUS CARTEL BOSS IN BOAT CHASE; BOSS IS A PELICAN'); }
      camOn(bx - 20, y - 12, 1.45);
    } },
  stack: { dur: 3.5, sim: false, setup() {
      const hs = ['FLORIDA MAN WRESTLES ALLIGATOR "FOR FUN"; ALLIGATOR "NOT HAVING FUN"', 'FLORIDA MAN EVADES DEPUTY ON MOTORIZED COOLER; DEPUTY "NOT MAD, JUST DISAPPOINTED"',
        'TRAIL CAM CAPTURES "SKUNK APE" DRINKING SWAMP LITE; SKUNK APE IS JUST A GUY NAMED DAN', 'FLORIDA MAN THROWN OFF YACHT PARTY FOR "BEING TOO FLORIDA"',
        'FLORIDA MAN OBJECTS AT EVERY LIE, IS RIGHT EVERY TIME; LAWYERS "FURIOUS"', 'FLORIDA MAN BEATS ROLLERBLADER IN OCEAN DRIVE RACE; ROLLERBLADER "DEVASTATED," DEMANDS REMATCH'];
      const st = $('tstack'); st.innerHTML = ''; st.hidden = false;
      const L = [3, 52, 5, 50, 3, 51], Tp = [4, 8, 36, 38, 67, 66], Rr = [-3, 3, 2, -3, -2, 3];   // a readable grid, not a pile
      hs.forEach((h, i) => { const d = document.createElement('div'); d.className = 'clip'; d.innerHTML = `<small>THE SWAMP GAZETTE</small>${h}`; d.style.left = L[i] + '%'; d.style.top = Tp[i] + '%'; d.dataset.r = Rr[i]; st.append(d); });
      $('tdim').style.opacity = .6;
    },
    after(lt) {
      [...$('tstack').children].forEach((d, i) => { const k = lt - i * .35; d.style.opacity = k > 0 ? 1 : 0; const s = k > 0 ? 1 + Math.max(0, .5 - k * 6) : 1.5; d.style.transform = `rotate(${d.dataset.r}deg) scale(${s.toFixed(3)})`; });
    }, end() { $('tstack').hidden = true; $('tdim').style.opacity = 0; } },
  parade: { dur: 4.0, setup() { base(); Game.scene = 'parade'; Game.mode = 'court'; },
    after(lt) { if (at(lt, .4, 'fm')) headline('FLORIDA MAN NAMED FLORIDA MAN OF THE YEAR; INSISTS HE IS "NOT A FLORIDA MAN" WHILE WEARING THE SASH'); Game.view = [0, 0, 1]; },
    end() { Game.scene = null; } },
};
const V1s = id => V1.find(s => s.id === id);
Object.assign(V1s('cooler'), { dur: 2.0 }); Object.assign(V1s('fireworks'), { dur: 2.0 }); Object.assign(V1s('brenda'), { dur: 2.0 }); Object.assign(V1s('shroom'), { dur: 3.0 }); Object.assign(V1s('court'), { dur: 4.5 });
Object.assign(V1s('end'), { setup() { base(); showCard('<div class="stk l">FREE</div><div class="stk r">NO ADS</div><div class="logo sm">Florida<br>Dan</div><div class="soon">AVAILABLE NOW</div><div class="url">tbone94.github.io/florida-dan</div><div class="tag">In your browser · install on your phone</div>', 'title end'); } });
let SHOTS = ['cozy', 'card1', 'cooler', 'fish', 'wrestle', 'iguana', 'brenda', 'blackout', 'powder', 'chase', 'shroom', 'court',
  'charges', 'objection', 'skunk', 'card3', 'lambo', 'abuela', 'race', 'party', 'dance', 'boat', 'stack', 'parade', 'black', 'title', 'button', 'end'].map(id => V2[id] ? { id, ...V2[id] } : V1s(id));
Trailer.setShots = list => { SHOTS = list; let t = 0; for (const s of SHOTS) { s.start = t; t += s.dur; } Trailer.total = t; Trailer.shots = SHOTS.map(s => [s.id, +s.start.toFixed(3), s.dur]); cur = -1; };   // other cuts (trailer-news.js) swap the list
Trailer.V1s = id => V1s(id); Trailer.V2 = V2;

// ---------- the frame stepper ----------
var cur = -1;
Trailer.setShots(SHOTS);
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
  if (headlineQ.length && Trailer.onHeadline) { const h = headlineQ.shift(); headlineQ.length = 0; Trailer.onHeadline(h.text || h, T); }
  if (headlineQ.length) { const h = headlineQ.shift(); banner.text = h.text || h; banner.t0 = T; headlineQ.length = 0; ui.bannerText.textContent = banner.text; ui.bannerKick.textContent = 'BREAKING · SWAMP GAZETTE'; ui.banner.classList.remove('fresh'); }
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
  const riser = (t, d) => Music.I.riser(MR, t, d, 1.2), impact = (t, v = 1) => Music.I.impact(MR, t, v);
  const crickets = (t0, t1, v = .04) => { for (let t = t0; t < t1; t += .09) if (Math.random() < .6) tone(t, 4200 + Math.random() * 300, .05, 'sine', v, 0, Math.random() - .5); };

  // ---- the score: ONE song (Swamp Lite) start to finish, laid down in whole 4-bar sections so it never restarts.
  // Miami doesn't switch songs: the same groove just picks up synthwave shimmer (arps, gated snare, pads).
  const mg = ctx.createGain(); mg.gain.value = .9; mg.connect(master);
  const MR = Music.rig(ctx, mg), BPM2 = 120;
  const sec = (name, t0, o) => Music.span(MR, 'swamp', name, t0, t0 + 8, BPM2, o);
  const MIA = { arp: 1, gated: 1, pad: 1 };
  const siren = (t0, t1) => { for (let t = t0, i = 0; t < t1; t += .22, i++) tone(t, i % 2 ? 700 : 950, .22, 'sine', .035); };
  const soft = t => { [523, 659, 784, 1046].forEach((f, i) => tone(t + i * .05, f, .14, 'square', .025)); };   // quieter headline sting

  // cold open (unchanged from v1): banjo, the bite, the record scratch, one beat of silence
  Music.span(MR, 'swamp', 'intro', 0, 3.4, BPM2, { noDrums: true });
  crickets(0, 3.5, .03); noise(S.cozy + 2.1, .12, .3, 'highpass', 2500);
  chomp(S.cozy + 3.4); scratch(S.cozy + 3.55); mg.gain.setValueAtTime(0, 3.42); mg.gain.setValueAtTime(.9, 4);
  crash(4, .25);
  sec('a', 4); sec('a2', 12); sec('a', 20); sec('a2', 28);
  sec('b', 36);                                   // breakdown under the new charges / trial / Skunk Ape
  riser(42, 2); crash(44, .3);                    // ...and it builds back into the hook for Miami
  sec('a', 44, MIA); sec('a2', 52, MIA);
  sec('fin', 60, MIA);                            // headlines + parade: everything at once
  sec('intro', 68, { noDrums: true, pad: 1 });    // title: the banjo, alone, proud
  kick(68, .9); crash(68, .35);
  mg.gain.setValueAtTime(.9, 71.6); mg.gain.linearRampToValueAtTime(0, 72);
  // the button: the band stops for the joke (crickets, then wah wah wah waaah)
  crickets(S.button, S.end, .03); blips(S.button + .05, 16, 160); blips(S.button + 2.3, 6, 200);
  [466, 440, 415, 392].forEach((f, i) => tone(S.button + 3.0 + i * .22, f, i === 3 ? .6 : .2, 'sawtooth', .05, i === 3 ? -40 : 0));
  // end slate: the hook one more time, fading out
  mg.gain.setValueAtTime(.9, S.end); sec('a', S.end); kick(S.end, .9);
  mg.gain.setValueAtTime(.9, S.end + 2.4); mg.gain.linearRampToValueAtTime(0, S.end + 3.95);

  // a few spot effects, kept quiet under the music
  siren(S.cooler + .9, S.cooler + 1.8); soft(S.cooler + .9);
  noise(S.fish + 1.45, .3, .15, 'lowpass', 700); chomp(S.fish + 2.0);
  chomp(S.wrestle + .05); soft(S.iguana + .85);
  boom(S.blackout); soft(S.blackout + 1.15); soft(S.powder + .05);
  siren(S.chase, S.chase + 1.4); noise(S.chase + 1.4, .1, .25, 'lowpass', 600); soft(S.chase + 1.75);
  chomp(S.court + 1.6);
  for (let i = 0; i < 5; i++) noise(S.charges + .25 + i * .38, .08, .22, 'lowpass', 900);   // rubber stamps
  noise(S.objection + 1.3, .08, .3, 'lowpass', 300); soft(S.skunk + 1.7);
  boom(S.lambo + 2.0); noise(S.lambo + 2.0, 1.0, .25, 'lowpass', 900); soft(S.lambo + 2.1);
  soft(S.race + 1.8); soft(S.dance + 1.5); soft(S.boat + 1.62);
  for (let i = 0; i < 6; i++) noise(S.stack + i * .35, .08, .18, 'bandpass', 2500, 1);   // paper slaps
  soft(S.parade + .4);

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
