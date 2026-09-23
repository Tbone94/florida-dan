// FLORIDA DAN — the loop: state, spawning, interaction, rendering, HUD, save.
'use strict';
const buf = document.createElement('canvas'); buf.width = VW; buf.height = VH;
g = buf.getContext('2d'); g.imageSmoothingEnabled = false;
const screenCv = $('screen'), stage = $('stage');
const isTouch = matchMedia('(pointer: coarse)').matches;
const SAVE_KEY = 'floridaDan.v2';

const Game = {
  mode: 'title', day: 1, hour: 6, t: 0, cam: { x: 0, y: 0 }, shake: 0, flash: 0, storm: 0, cold: false, urgent: 0,
  dan: { x: 0, y: 0, dir: 'down', frame: 0, stepT: 0, moving: false, ride: null, hurt: 0, anim: null, animT: 0 },
  boat: { x: 0, y: 0, dir: 'right' }, cooler: { x: 0, y: 0, dir: 'down' },
  inv: {}, money: 12, chill: 70, allegations: 12, fx: { buzz: 0, high: 0, shroom: 0, powder: 0, crash: 0, cig: 0 },
  flags: {}, headlines: [], quests: [], catchBag: [], pythons: [], npcs: [], animals: [], pickups: [], parts: [], projectiles: [], day_: null, talk: null,
};
const freshDayLog = () => ({ headlines: [], caught: [], bites: 0, beers: 0, cigs: 0, joints: 0, shrooms: 0, powder: 0, hotdogs: 0, scratchers: 0, gits: 0, fireworks: 0, pelican: 0, iguanaHits: 0, wrestles: 0, chuckSeen: false, dumpster: false });

function newGame() {
  Object.assign(Game, { day: 1, money: 12, allegations: 12, flags: {}, headlines: [], catchBag: [], pythons: [] });
  Game.inv = { beer: 2, cig: 3, joint: 1, shroom: 0, powder: 0, energy: 0, hotdog: 0, scratch: 1, firework: 0, bait: 1, fish: 0, can: 0, plywood: 0, sign: 0 };
  startDay();
}
function startDay() {
  const S_ = World.spots;
  Object.assign(Game, { hour: 6, chill: 70, urgent: 0, storm: 0, parts: [], projectiles: [], day_: freshDayLog() });
  Object.assign(Game.fx, { buzz: 0, high: 0, shroom: 0, powder: 0, crash: 0, cig: 0 });
  Object.assign(Game.dan, { x: S_.dan.x, y: S_.dan.y, dir: 'down', ride: null, hurt: 0 });
  Object.assign(Game.boat, { x: S_.boat.x, y: S_.boat.y, dir: 'right' });
  Object.assign(Game.cooler, { x: S_.cooler.x, y: S_.cooler.y, dir: 'down' });
  Game.inv.fish = Game.catchBag.filter(f => !f.junk).length;
  spawn();
  Game.cam.x = Game.dan.x - VW / 2; Game.cam.y = Game.dan.y - VH / 2 - 10;
  Game.mode = 'play'; showHud(true);
  Story.setupDay(Game.day);
  save();
  Sound.setMusic(true);
}

function spawn() {
  const S_ = World.spots;
  Game.npcs = [
    makeNPC('merle', 'Merle', S_.merle.x, S_.merle.y, 'down', { wander: 18 }),
    makeNPC('darlene', 'Darlene', S_.darlene.x, S_.darlene.y, 'down'),
    makeNPC('rhonda', 'Deputy Rhonda', S_.rhonda.x, S_.rhonda.y, 'left', { wander: 70 }),
    makeNPC('tourist', 'Tourist', 26 * TS, 46.6 * TS, 'down', { wander: 60 }),
    makeNPC('tourist', 'Tourist', 60 * TS, 43 * TS, 'down', { wander: 60 }),
  ];
  if (Game.day === 2) { Game.npcs[1].quest = true; Game.npcs[2].quest = true; Game.npcs[0].quest = true; }
  if (Game.day === 1) Game.npcs[0].quest = true;
  if (!gatorOK) gatorMap();
  const A = Game.animals = [], tries = (n, fn) => { for (let i = 0, k = 0; i < n && k < 800; k++) if (fn()) i++; };
  tries(10, () => { const tx = 1 + Math.floor(Math.random() * (MW - 2)), ty = 1 + Math.floor(Math.random() * 34), k = World.tile(tx, ty), x = (tx + .5) * TS, y = (ty + .5) * TS; if ((k === T.WATER || k === T.DEEP) && Math.hypot(x - Game.dan.x, y - Game.dan.y) > 150) { A.push(makeGator(x, y, false)); return true; } });
  tries(3, () => { const x = rnd(2, 19) * TS, y = rnd(40, 58) * TS; if (WET(World.at(x, y))) { A.push(makeGator(x, y, false)); return true; } });
  let best = null, bd = 1e9;
  for (let y = 12; y < 30; y++) for (let x = 28; x < 42; x++) if (World.tile(x, y) <= T.WATER) { const d = Math.hypot(x - 36, y - 18); if (d < bd) { bd = d; best = [x, y]; } }
  if (best && Game.day < 4) A.push(makeGator((best[0] + .5) * TS, (best[1] + .5) * TS, true));
  tries(6, () => { const x = rnd(3, 18) * TS, y = rnd(41, 57) * TS; if (World.at(x, y) === T.SAWGRASS) { A.push(makePython(x, y)); return true; } });
  A.push(makeCritter('raccoon', 38 * TS, 41.5 * TS), makeCritter('raccoon', 14 * TS, 21 * TS));
  A.push(makeCritter('pelican', S_.dockEnd.x - 20, S_.dockEnd.y - 8), makeCritter('pelican', S_.ramp.x + 10, S_.ramp.y + 30));
  for (let i = 0; i < 4; i++) A.push(makeCritter('iguana', rnd(24, 70) * TS, rnd(38.5, 42.5) * TS));
  for (let i = 0; i < 5; i++) A.push(makeCritter('cow', rnd(52, 67) * TS, rnd(48.5, 56) * TS));
  if (Game.flags.trashBaby) A.push(makeCritter('raccoon', Game.dan.x + 14, Game.dan.y, { pet: true }));
  const P = Game.pickups = [], put = (kind, x, y) => { if (WALKABLE(World.at(x, y)) && World.at(x, y) !== T.SHALLOW && !World.solidAt(x, y)) P.push({ kind, x, y }); };
  put('beer', 23 * TS, 18.6 * TS); put('bait', S_.dockEnd.x - 40, S_.dockEnd.y + 1); put('bait', S_.ramp.x, 38.5 * TS); put('cig', 14 * TS, 19.4 * TS);
  if (Game.day === 1) put('joint', 22 * TS, 16.5 * TS);
  if (Game.day === 2) put('firework', 47 * TS, 13.6 * TS);
  for (let i = 0; i < 7; i++) { const x = rnd(55, 66) * TS, y = rnd(48.5, 56) * TS; P.push({ kind: 'cowpie', x, y }); }
  for (let i = 0, k = 0; i < 7 && k < 600; k++) { const x = rnd(3, MW - 3) * TS, y = rnd(3, MH - 3) * TS; const t = World.at(x, y); if ((t === T.GRASS || t === T.SAND) && !World.solidAt(x, y)) { P.push({ kind: pick(['beer', 'beer', 'cig', 'bait', 'scratch', 'hotdog', 'energy']), x, y }); i++; } }
}

// ---------- interaction ----------
function facingPoint(dist) { const D = Game.dan, d = D.dir; return { x: D.x + (d === 'right' ? dist : d === 'left' ? -dist : 0), y: D.y + (d === 'down' ? dist : d === 'up' ? -dist : 0) }; }
function interaction() {
  const D = Game.dan, near = (o, r) => Math.hypot(D.x - o.x, D.y - o.y) < r;
  if (!D.ride) for (const n of Game.npcs) if (near(n, 24)) return { label: `Talk to ${n.name}`, fn: () => Story.talk(n) };
  for (const a of Game.animals) {
    if (a.spirit && near(a, 56) && Game.fx.shroom > 0) return { label: 'Approach the glowing manatee', fn: () => Story.manny() };
    if (D.ride) continue;
    if (a.type === 'gator' && !a.lurk && a.stun <= 0 && near(a, 24)) return { label: a.chuck ? 'WRESTLE CHUCK' : 'WRESTLE THE GATOR', fn: () => wrestleGator(a) };
    if (a.type === 'python' && a.state !== 'bagged' && near(a.segs[0], 20)) return { label: 'GRAB THE PYTHON', fn: () => grabPython(a) };
  }
  if (D.ride === 'boat') {
    for (const dist of [14, 22]) { const p = facingPoint(dist), k = World.at(p.x, p.y); if (WALKABLE(k) && k !== T.SHALLOW && canWalk(p.x, p.y)) return { label: 'Hop out', fn: () => { D.ride = null; D.x = p.x; D.y = p.y; } }; }
    return { label: 'Cast a line', fn: () => Fishing.start(World.at(D.x, D.y), false) };
  }
  if (D.ride === 'cooler') return { label: 'Park the cooler', fn: () => { D.ride = null; D.y += 10; if (!canWalk(D.x, D.y)) D.y -= 10; } };
  const st = Story.interactions(); if (st.length) return st[0];
  if (near(Game.boat, 26)) return { label: 'Board the SS Budget', fn: () => { D.ride = 'boat'; D.x = Game.boat.x; D.y = Game.boat.y; Sound.play('engine'); } };
  if (near(Game.cooler, 18)) return { label: 'Ride the motorized cooler', fn: () => { D.ride = 'cooler'; D.x = Game.cooler.x; D.y = Game.cooler.y; Sound.play('engine'); if (Game.fx.buzz > 50 || Game.fx.powder > 0) Game.day_.dui = true; } };
  const p = facingPoint(16), k = World.at(p.x, p.y), here = World.at(D.x, D.y);
  if (k === T.DEEP || k === T.WATER || (k === T.SHALLOW && here === T.DOCK)) return { label: 'Cast from here', fn: () => Fishing.start(k, true) };
  return null;
}
function wrestleGator(a) {
  Wrestle.start({ foe: a.chuck ? 'chuck' : 'gator', arena: 'swamp', onWin: () => {
    a.stun = 10; a.state = 'flee'; a.timer = 12; a.cd = 12; Game.chill = Math.min(100, Game.chill + 25); Game.day_.wrestles++;
    if (a.chuck) { done('chuck'); headline('FLORIDA MAN WRESTLES ALLIGATOR NAMED "CHUCK," CALLS IT "A DISAGREEMENT BETWEEN FRIENDS"', 8); }
    else if (Game.day_.wrestles === 1) headline('FLORIDA MAN WRESTLES ALLIGATOR "FOR FUN"; ALLIGATOR "NOT HAVING FUN"', 6);
    toast(pick(['Gator: humbled.', 'Dan flexes at nobody.', 'That’s what I thought, lizard.']));
  }, onLose: () => { gatorBite(a, Game.dan.x - a.x, Game.dan.y - a.y, Math.hypot(Game.dan.x - a.x, Game.dan.y - a.y) || 1); } });
}
function grabPython(a) {
  a.stun = 99;
  Wrestle.start({ foe: 'python', arena: 'swamp', onWin: () => { a.state = 'bagged'; Game.pythons.push(a.len); toast(`Bagged a ${a.len} ft Burmese python. Rhonda pays $25/ft.`); if (Game.pythons.length === 1) headline(`FLORIDA MAN CATCHES ${a.len}-FOOT PYTHON WITH BARE HANDS, WEARING FLIP-FLOPS`, 5); },
    onLose: () => { a.stun = 0; a.state = 'flee'; a.timer = 3; toast('The python slithered off. Dan got hugged a lil. Not in a nice way.'); } });
}
function yell() {
  if (Game.gitCd > 0) return; Game.gitCd = .8; Game.day_.gits++; Sound.play('git');
  const D = Game.dan; Game.parts.push({ kind: 'text', x: D.x, y: D.y - 30, vx: 0, vy: -12, life: 1, text: pick(['GIT!', 'GO ON, GIT!', 'NOT TODAY, SATAN!', 'GIT OUTTA HERE!', 'SHOO, YOU SUMBITCH!']) });
  for (const a of Game.animals) if (!a.pet && !a.spirit && Math.hypot(a.x - D.x, a.y - D.y) < (a.chuck ? 96 : 84)) { a.state = 'flee'; a.timer = 3.5; a.cd = 4; if (a.chuck) { done('chuck'); if (!Game.flags.chuckGit) { Game.flags.chuckGit = true; setTimeout(() => toast('Chuck hisses and backs off. You have Chuck’s respect. For now.'), 600); } } }
  for (const n of Game.npcs) if (Math.hypot(n.x - D.x, n.y - D.y) < 50) { n.scared = 1; if (n.id === 'tourist' && !Game.day_.yelledTourist) { Game.day_.yelledTourist = true; headline('FLORIDA MAN YELLS "GIT" AT TOURIST FROM OHIO', 4); } }
}

// ---------- update ----------
function update(dt) {
  Game.t += dt;
  if (toastT > 0 && (toastT -= dt) <= 0) ui.toast.hidden = true;
  Game.flash = Math.max(0, Game.flash - dt * 2); Game.shake = Math.max(0, Game.shake - dt * 18);
  updateHeadlineBanner(dt);
  switch (Game.mode) {
    case 'title': Game.cam.x = 300 + Math.sin(Game.t * .05) * 260; Game.cam.y = 180 + Math.sin(Game.t * .04) * 120; for (const a of Game.animals) if (a.type === 'gator') updateGator(a, dt); return;
    case 'talk': updateTalk(dt); tickWorld(dt * .0); return;
    case 'fish': Fishing.update(dt); tickFx(dt); updateParts(dt); return;
    case 'wrestle': Wrestle.update(dt); return;
    case 'raccoon': Minigame.updateRaccoon(dt); return;
    case 'court': return;
    case 'shop': if (Input.tapped('pause') || Input.tapped('b')) closeShop(); return;
    case 'journal': if (Input.tapped('journal') || Input.tapped('pause') || Input.tapped('a') || Input.tapped('b')) closeJournal(); return;
    case 'gazette': return;
  }
  // --- play ---
  if (Input.tapped('journal') || Input.tapped('pause')) return openJournal();
  HOTBAR.forEach((k, i) => { if (Input.tapped('s' + (i + 1))) { Game.sel = i; useItem(k); } });
  if (Input.tapped('prev')) selSlot(-1); if (Input.tapped('next')) selSlot(1);
  if (Input.tapped('item')) useItem(HOTBAR[Game.sel || 0]);
  if (Input.tapped('mute')) toast(Sound.toggleMute() ? 'Sound off.' : 'Sound on.');
  tickFx(dt);
  Game.hour += dt / 30 * (Game.fx.high > 0 ? .6 : 1) * (Game.fx.powder > 0 ? 1.3 : 1);
  Game.chill = Math.max(0, Game.chill - dt * .2);
  Game.gitCd = (Game.gitCd || 0) - dt;
  if (Game.chill <= 0) { Game.chill = 40; headline('FLORIDA MAN SCREAMS AT PELICAN FOR 40 MINUTES; PELICAN UNBOTHERED', 4); return say([['', 'Dan has run out of chill.'], ['DAN', 'WHAT ARE YOU LOOKIN AT, PELICAN? HUH? YEAH, YOU. YOU AND YOUR STUPID FACE-BAG!'], ['', 'The pelican is unbothered. Dan feels better, weirdly.']]); }
  if (Game.hour >= 22) { Game.hour = 22; return say([['', 'It’s 10 PM. The mosquitoes have unionized.'], ['DAN', 'Aight. Bed. Wherever I’m standing is bed now.']], () => endDay('late')); }
  moveDan(dt);
  if (Game.storm > .3 && !Game.dan.ride) { const nx = Game.dan.x + Game.storm * 16 * dt; if (canWalk(nx, Game.dan.y)) Game.dan.x = nx; }
  tickWorld(dt);
  Story.tick(dt);
  Events.tick(dt);
  if (Input.tapped('b')) yell();
  if (Input.tapped('throw')) throwThing('can');
  for (const p of Game.pickups) if (p.kind !== 'cowpie' && !Game.dan.ride && Math.hypot(p.x - Game.dan.x, p.y - Game.dan.y) < 12) {
    p.got = true; giveItem(p.kind); toast(pick(PICKUP_LINES[p.kind] || [`Got ${ITEMS[p.kind] ? ITEMS[p.kind].name : p.kind}.`]));
  }
  Game.pickups = Game.pickups.filter(p => !p.got);
  if (Game.day_.dui && Game.dan.ride === 'cooler' && !Game.day_.duiDone) { const r = Game.npcs.find(n => n.id === 'rhonda'); if (r && Math.hypot(r.x - Game.dan.x, r.y - Game.dan.y) < 90) { Game.day_.duiDone = true; Sound.play('siren'); Game.dan.ride = null; headline('FLORIDA MAN CITED FOR DUI ON MOTORIZED COOLER; ASKS DEPUTY IF SHE "WANTS A COLD ONE"', 10); say([['RHONDA', '*WHOOP WHOOP* Pull that cooler OVER, Dan.'], ['DAN', 'It’s a cooler, Rhonda. It’s not a VEHICLE.'], ['RHONDA', 'It has a MOTOR. It has HEADLIGHTS, Dan. Why does it have headlights.'], ['DAN', '...Want a cold one? It’s right here. I’m sittin’ on ’em.'], ['RHONDA', 'I’m writing you a ticket AND I’m taking a beer.']], () => { if (Game.inv.beer > 0) Game.inv.beer--; }); } }
  const act = interaction();
  ui.prompt.textContent = act ? `${Input.padActive ? 'Ⓐ ' : isTouch ? '' : '[E] '}${act.label}` : '';
  ui.prompt.hidden = !act;
  if (act && Input.tapped('a')) act.fn();
  const D = Game.dan, look = D.ride ? 26 : 12, lx = D.dir === 'right' ? look : D.dir === 'left' ? -look : 0, ly = D.dir === 'down' ? look * .6 : D.dir === 'up' ? -look * .6 : 0;
  Game.cam.x += (D.x + lx - VW / 2 - Game.cam.x) * Math.min(1, dt * 5); Game.cam.y += (D.y + ly - VH / 2 - 10 - Game.cam.y) * Math.min(1, dt * 5);
}
function tickFx(dt) {
  const F = Game.fx, hadPowder = F.powder > 0;
  F.buzz = Math.max(0, F.buzz - dt * .45); F.high = Math.max(0, F.high - dt); F.shroom = Math.max(0, F.shroom - dt);
  F.powder = Math.max(0, F.powder - dt); F.crash = Math.max(0, F.crash - dt); F.cig = Math.max(0, F.cig - dt);
  if (hadPowder && F.powder === 0) { F.crash = 16; toast(pick(['...oh no. The crash. Dan is a husk.', 'Sinuses: clear. Soul: empty.', 'Dan feels like a wet sock.'])); }
  const D = Game.dan; if (D.animT > 0 && (D.animT -= dt) <= 0) D.anim = null; D.hurt -= dt;
}
function tickWorld(dt) {
  for (const a of Game.animals) { if (a.type === 'gator') updateGator(a, dt); else if (a.type === 'python') updatePython(a, dt); else if (a.type !== 'manatee') updateCritter(a, dt); }
  for (const n of Game.npcs) { if (n.scared > 0) { n.scared -= dt; continue; } updateNPC(n, dt); }
  updateProjectiles(dt); updateParts(dt);
}
const PICKUP_LINES = {
  beer: ['Found a warm Swamp Lite. Still counts.', 'A beer! In the grass! Easter egg for adults.'], cig: ['Found a loose menthol. Score.', 'Cigarette. Slightly damp. Still good.'],
  joint: ['Found a doobie in the couch cushions. Merry Christmas, Dan.'], bait: ['Tub of nightcrawlers. Still wiggly.', 'Bait! Mostly alive!'],
  scratch: ['A scratch-off! Unscratched! Destiny!'], hotdog: ['A roller dog. On the ground. Wrapped. ...Mostly wrapped.'], energy: ['Gator Juice! Half full! Nobody’s spit in it! Probably!'],
  firework: ['A Freedom Rocket! Merle’s “hurricane supply.” (Slot 9, throws it)'],
};

// ---------- random chaos ----------
const Events = {
  t: 40,
  tick(dt) {
    if ((this.t -= dt) > 0) return;
    this.t = rnd(45, 80);
    const ev = pick(['lovebugs', 'merletext', 'mosquitos', 'brenda', 'tourist', 'sirens', 'weather']);
    if (ev === 'lovebugs') { toast('LOVEBUG SEASON. They’re doin’ it. On your FACE.'); for (let i = 0; i < 40; i++) Game.parts.push({ kind: 'bug', x: Game.dan.x + rnd(-80, 80), y: Game.dan.y + rnd(-60, 40), vx: rnd(-20, 20), vy: rnd(-20, 20), life: rnd(4, 8) }); }
    if (ev === 'merletext') toast('TEXT FROM MERLE: ' + pick(['u up', 'chuck is on my porch again. hes eatin my crocs', 'found a boat in my yard. not mine. is it yours', 'do u know how to get a raccoon out of a toilet asking for a friend', 'lottery numbers are 4 8 15 16 23 42 trust me', 'I think my trailer is haunted by a tourist']), 4.5);
    if (ev === 'mosquitos' && World.region(Game.dan.x, Game.dan.y) === 'glades') { toast('Mosquitos the size of sparrows. Dan donates a pint.'); Game.chill = Math.max(0, Game.chill - 10); }
    if (ev === 'brenda') toast(`TEXT FROM BRENDA: ${Game.allegations > 60 ? 'why is my phone blowing up with your name' : pick(['how are we doing. be honest', 'remember: NORMAL', 'please do not do anything on camera'])}`, 4.5);
    if (ev === 'sirens') Sound.play('siren');
    if (ev === 'weather' && Game.day !== 3) toast(pick(['It’s 96 degrees and 100% humidity. The air is soup.', 'Sudden downpour. 4 minutes. Then sun. Classic.', 'A thunderstorm rolled in, got bored, and left.']));
  },
};

// ---------- particles ----------
function splash(x, y, n) { for (let i = 0; i < n; i++) Game.parts.push({ kind: 'splash', x, y, vx: rnd(-25, 25), vy: rnd(-50, -20), life: rnd(.5, .8) }); }
function updateParts(dt) {
  const D = Game.dan;
  if ((D.anim === 'cig' || D.anim === 'joint' || Game.fx.cig > 0) && Math.random() < dt * 3) Game.parts.push({ kind: 'smoke', x: D.x + 5, y: D.y - 16, vx: rnd(2, 8), vy: -9, life: 1.6 });
  for (const p of Game.parts) { p.x += p.vx * dt; p.y += p.vy * dt; if (p.kind === 'splash' || p.kind === 'spark') p.vy += 120 * dt; if (p.kind === 'bug') { p.vx += rnd(-80, 80) * dt; p.vy += rnd(-80, 80) * dt; } p.life -= dt; }
  Game.parts = Game.parts.filter(p => p.life > 0);
  if (Game.parts.length > 400) Game.parts.splice(0, Game.parts.length - 400);
}
function drawParts(cx, cy) {
  for (const p of Game.parts) {
    const x = p.x - cx, y = p.y - cy;
    if (p.kind === 'smoke') { const s = 2 + (1.6 - p.life) * 3; g.globalAlpha = Math.min(.7, p.life); R(x - s / 2, y - s / 2, s, s, PAL.tankD); g.globalAlpha = 1; }
    else if (p.kind === 'splash') R(x, y, 1, 2, PAL.foam);
    else if (p.kind === 'foam') R(x - 2, y, 4, 1, PAL.foam);
    else if (p.kind === 'spark') R(x, y, 2, 2, p.c || PAL.yellow);
    else if (p.kind === 'fire') { R(x - 1, y - 1, 3, 3, p.life > 1.5 ? PAL.yellow : PAL.orange); }
    else if (p.kind === 'speed') R(x, y, 6, 1, PAL.white);
    else if (p.kind === 'bug') { R(x, y, 2, 1, PAL.black); R(x + 2, y, 1, 1, PAL.red); }
    else if (p.kind === 'text') label(p.text, x, y, PAL.yellow, 9);
  }
}

// ---------- render ----------
const SKY = [[0, [.4, .45, .75]], [5.5, [.55, .5, .7]], [6.5, [1, .82, .78]], [8, [1, 1, 1]], [16.5, [1, .97, .9]], [18.5, [1, .8, .66]], [20, [.72, .6, .8]], [21.5, [.45, .48, .78]], [24, [.4, .45, .75]]];
function skyTint(h) { for (let i = 0; i < SKY.length - 1; i++) { const [h0, a] = SKY[i], [h1, b] = SKY[i + 1]; if (h >= h0 && h <= h1) { const k = (h - h0) / (h1 - h0); return a.map((v, j) => v + (b[j] - v) * k); } } return [1, 1, 1]; }
const TALKY = ['The swamp remembers, Dan.', 'Moo is a state of mind.', 'I’m not a raccoon. I’m a feeling.', 'We are all Florida Men, Dan.', 'Have you tried being a bird?', 'The gator is you. You are the gator.', 'Tuesday is a construct.'];

function drawWorld() {
  const cx = Math.round(clamp(Game.cam.x, 0, MW * TS - VW) + (Math.random() - .5) * Game.shake), cy = Math.round(clamp(Game.cam.y, 0, MH * TS - VH) + (Math.random() - .5) * Game.shake), t = Game.t;
  drawTiles(cx, cy, t);
  const vis = (x, y, m = 60) => x > cx - m && x < cx + VW + m && y > cy - m && y < cy + VH + m * 1.5;
  for (const p of World.props) if (p.kind === 'lily' && vis(p.x, p.y)) drawProp(p, cx, cy, t);
  for (const a of Game.animals) if (a.type === 'gator' && a.lurk && vis(a.x, a.y)) drawGator(a, cx, cy, t);
  const L = [];
  for (const p of World.props) if (p.kind !== 'lily' && vis(p.x, p.y, 90)) L.push([p.y + p.h, () => drawProp(p, cx, cy, t)]);
  for (const p of Game.pickups) if (vis(p.x, p.y)) L.push([p.y, () => drawPickup(p, cx, cy, t)]);
  for (const a of Game.animals) if (vis(a.x, a.y)) {
    if (a.type === 'gator') { if (!a.lurk) L.push([a.y, () => drawGator(a, cx, cy, t)]); }
    else if (a.type === 'python') L.push([a.y, () => drawPython(a, cx, cy)]);
    else if (a.spirit) L.push([a.y, () => drawManatee(a, cx, cy, t)]);
    else L.push([a.y, () => drawCritter(a, cx, cy, t)]);
  }
  for (const n of Game.npcs) if (vis(n.x, n.y)) L.push([n.y, () => drawNPC(n, cx, cy, t)]);
  const D = Game.dan;
  if (D.ride !== 'boat') L.push([Game.boat.y + 4, () => drawBoat(Game.boat.x - cx, Game.boat.y - cy, Game.boat.dir, t, false)]);
  if (D.ride !== 'cooler') L.push([Game.cooler.y + 3, () => drawCooler(Game.cooler.x - cx, Game.cooler.y - cy, Game.cooler.dir, t, false)]);
  if (Game.mode !== 'title') L.push([D.y + (D.ride === 'boat' ? 4 : 0), () => drawDan(D.x - cx, D.y - cy, t)]);
  L.sort((a, b) => a[0] - b[0]).forEach(e => e[1]());
  drawProjectiles(cx, cy); drawParts(cx, cy);
  if (Game.fx.shroom > 0) for (const a of Game.animals) if (vis(a.x, a.y, 0) && !a.lurk && hash2(Math.floor(t / 4), a.x | 0) > .6) label(TALKY[Math.floor(hash2(Math.floor(t / 4), a.y | 0) * TALKY.length)], a.x - cx, a.y - cy - 24, PAL.neon, 6);
  if (Game.storm > 0) drawStorm(t);
}
function drawPickup(p, cx, cy, t) {
  const x = Math.round(p.x - cx), y = Math.round(p.y - cy);
  if (p.kind === 'cowpie') { g.drawImage(SPR.cowpie, x - 4, y - 5); g.drawImage(SPR.mushroom, x - 2, y - 12); return; }
  const b = Math.round(Math.sin(t * 3 + p.x) * 1.5); shadow(x, y + 1, 8, 2);
  const s = SPR.icons[p.kind]; if (s) g.drawImage(s, x - 5, y - 11 + b);
  if (Math.sin(t * 4 + p.y) > .8) R(x + 3, y - 12 + b, 1, 1, PAL.white);
}
function drawManatee(a, cx, cy, t) {
  const x = Math.round(a.x - cx), y = Math.round(a.y - cy + Math.sin(t * 1.5) * 3);
  g.globalAlpha = .35 + Math.sin(t * 3) * .15; g.fillStyle = PAL.glow; g.beginPath(); g.ellipse(x, y - 4, 26, 12, 0, 0, 7); g.fill(); g.globalAlpha = 1;
  g.drawImage(SPR.manatee, x - 12, y - 10);
  if (Game.fx.shroom > 0) label('MANNY', x, y - 16, PAL.glow, 7);
}
function drawStorm(t) {
  const s = Game.storm;
  g.globalAlpha = .55 * s; for (let i = 0; i < 120 * s; i++) { const x = (hash2(i, 1) * 400 + t * 220) % 360 - 20, y = (hash2(i, 2) * 220 + t * 380) % 200 - 10; R(x, y, 1, 5, PAL.waterL); } g.globalAlpha = 1;
  if (s > .6 && Math.random() < .004) { Game.flash = .8; setTimeout(() => Sound.play('boom'), 250); }
  if (s > .5 && Math.random() < .006) Game.parts.push({ kind: 'text', x: Game.cam.x - 10, y: Game.cam.y + rnd(20, 150), vx: 160, vy: -10, life: 2.5, text: pick(['🦩', 'a lawn chair', 'someone’s trampoline', 'a flamingo', 'Kevin']) });
}

function render() {
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (Game.mode === 'fish') Fishing.draw();
  else if (Game.mode === 'wrestle') Wrestle.draw();
  else if (Game.mode === 'raccoon') Minigame.drawRaccoon();
  else if (Game.mode === 'court' || (Game.mode === 'talk' && Game.talk && Game.talk.prev === 'court') || (Game.mode === 'gazette' && Game.flags.inCourt)) Court.draw(Game.t);
  else drawWorld();
  if (window.Trailer && Trailer.extra) Trailer.extra();
  const F = Game.fx, sky = Game.mode === 'title' ? [1, 1, 1] : skyTint(Game.hour), storm = 1 - Game.storm * .35;
  Screen.present({ t: Game.t, drunk: clamp((F.buzz - 25) / 60, 0, 1.3), high: F.high > 0 ? Math.min(1, F.high / 8) : 0, shroom: F.shroom > 0 ? Math.min(1, F.shroom / 6) : 0,
    powder: F.powder > 0 ? Math.min(1, F.powder / 4) : 0, crash: F.crash > 0 ? Math.min(1, F.crash / 5) : 0, cig: F.cig > 0 ? 1 : 0, flash: Game.flash,
    night: Game.hour > 20 || Game.hour < 6 ? .8 : Game.hour > 18.5 ? .4 : 0, tint: sky.map(v => v * storm), view: Game.view });
}
