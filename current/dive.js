// FLORIDA DAN — diving. Anywhere there's water in the Keys, Dan can go under: side view like the fishing screen.
// Swim for coins, conch shells, lobster and junk; watch the air (surface to breathe, E at the surface to climb
// out and keep what you grabbed). Barracuda bite, jellyfish sting. Beer makes you wobbly, a joint makes it
// slow and pretty, shrooms make the fish talk. Cases slip their own loot in with Dive.start({ extra }).
'use strict';

const DIVE_W = 640, DV_SURF = 34, DV_FLOOR = 166;
const DIVE_LOOT = {
  coin: { name: 'gold coin', cash: 8, c: '#ffd23f' }, conch: { name: 'conch shell', cash: 4, c: '#ffb3a7' }, lobster: { name: 'spiny lobster', item: 'lobster', c: '#e0433a' },
  can: { name: 'Swamp Lite can', trash: 1, c: '#3d6fe0' }, flop: { name: 'one flip-flop', trash: 1, c: '#ffd23f' }, plate: { name: 'Ohio license plate', trash: 1, c: '#fbf7ef' },
};
const DIVE_ZONES = {   // what's down there depends where you went in
  reef: { floor: '#e8d39a', loot: { conch: 4, lobster: 3, coin: 1, can: 1 }, cuda: 2, jelly: 2, coral: 1 },
  bridge: { floor: '#c9b077', loot: { coin: 3, can: 3, plate: 2, flop: 2, lobster: 1 }, cuda: 1, jelly: 1, pylons: 1 },
  harbor: { floor: '#a89770', loot: { can: 5, flop: 3, plate: 2, conch: 1 }, cuda: 0, jelly: 1, murk: 1 },
  flats: { floor: '#efe0b0', loot: { conch: 3, can: 2, flop: 1, lobster: 1 }, cuda: 0, jelly: 1, grass: 1 },
};
const Dive = {
  s: null,
  start(o = {}) {
    const zone = DIVE_ZONES[o.zone] ? o.zone : 'reef', Z = DIVE_ZONES[zone], things = [];
    const bag = Object.entries(Z.loot).flatMap(([k, w]) => Array(w).fill(k));
    for (let i = 0; i < 11; i++) things.push({ k: pick(bag), x: 40 + Math.random() * (DIVE_W - 80), y: DV_FLOOR - 6 - Math.random() * (i < 7 ? 8 : 60), t: Math.random() * 6 });
    for (const e of o.extra || []) things.push({ x: 60 + Math.random() * (DIVE_W - 120), y: DV_FLOOR - 8, t: 0, ...e });
    const foes = [];
    for (let i = 0; i < Z.cuda; i++) foes.push({ k: 'cuda', x: Math.random() * DIVE_W, y: 70 + Math.random() * 70, vx: (Math.random() < .5 ? -1 : 1) * 38, cd: 0 });
    for (let i = 0; i < Z.jelly; i++) foes.push({ k: 'jelly', x: 60 + Math.random() * (DIVE_W - 120), y: 60 + Math.random() * 80, ph: Math.random() * 6, cd: 0 });
    this.s = { zone, Z, things, foes, bubbles: [], x: o.x0 || DIVE_W / 2, y: DV_SURF - 2, vx: 0, vy: 0, air: 1, got: [], t: 0, face: 1, then: o.then, msg: '', msgT: 0, out: 0, talkT: 3 };
    Game.mode = 'dive'; showHud(false); padFor(true); Sound.play('splash');
    this.say(o.intro || pick(['Dan holds his nose. Goes under.', 'SPLOOSH.', 'The water is 84°. Dan is home.']), 2);
  },
  say(m, t = 1.8) { this.s.msg = m; this.s.msgT = t; },
  airMax: () => hasUp('snorkel') ? 1.6 : 1,
  update(dt) {
    const s = this.s; if (!s) { Game.mode = 'play'; return; }
    const F = Game.fx, slow = F.high > 0 ? .6 : 1; dt *= slow;
    s.t += dt; s.msgT -= dt;
    if (s.out) { s.out += dt; if (s.out > .9) this.finish(); return; }
    const ax = Input.axis(), kick = Input.held('run'), wob = F.buzz > 40 ? Math.sin(s.t * 2) * (F.buzz - 40) * .02 : 0;
    const acc = (kick ? 230 : 150) * (hasUp('fins') ? 1.35 : 1);
    s.vx += (ax.x + wob) * acc * dt; s.vy += (ax.y * acc - 18) * dt;   // a little buoyancy: Dan floats. Dan has always floated.
    s.vx *= Math.pow(.12, dt); s.vy *= Math.pow(.12, dt);
    s.x = clamp(s.x + s.vx * dt, 8, DIVE_W - 8); s.y = clamp(s.y + s.vy * dt, DV_SURF - 4, DV_FLOOR - 6);
    if (Math.abs(ax.x) > .2) s.face = ax.x > 0 ? 1 : -1;
    const under = s.y > DV_SURF + 4;
    if (under) s.air -= dt * (kick ? .085 : .055) / this.airMax() * (F.cig > 0 ? 1.4 : 1);
    else s.air = Math.min(1, s.air + dt * .7);
    if (under && Math.random() < dt * (kick ? 7 : 3)) s.bubbles.push({ x: s.x + s.face * 5, y: s.y - 6, life: 2 });
    for (const b of s.bubbles) { b.y -= 26 * dt; b.x += Math.sin(b.y * .2) * .3; b.life -= dt; } s.bubbles = s.bubbles.filter(b => b.life > 0 && b.y > DV_SURF);
    // grab things you swim into
    for (const it of s.things) { it.t += dt; if (!it.took && Math.abs(it.x - s.x) < 11 && Math.abs(it.y - s.y) < 11) this.take(it); }
    // the locals
    for (const f of s.foes) {
      f.cd = Math.max(0, f.cd - dt);
      if (f.k === 'cuda') { const chase = Math.abs(f.x - s.x) < 90 && Math.abs(f.y - s.y) < 40 && under; f.x += (chase ? Math.sign(s.x - f.x) * 70 : f.vx) * dt; if (!chase && (f.x < 20 || f.x > DIVE_W - 20)) f.vx *= -1; if (chase) f.y += Math.sign(s.y - f.y) * 20 * dt; }
      else { f.ph += dt; f.y += Math.sin(f.ph * 1.3) * 12 * dt; f.x += Math.cos(f.ph * .4) * 6 * dt; }
      if (!f.cd && Math.abs(f.x - s.x) < (f.k === 'cuda' ? 14 : 9) && Math.abs(f.y - s.y) < 9) this.hurt(f);
    }
    if (F.shroom > 0 && (s.talkT -= dt) <= 0) { s.talkT = 4 + Math.random() * 3; this.say(pick(['A GROUPER: “You again.”', 'A SNAPPER: “He’s not even wearing fins.”', 'THE REEF: “...Dan.”', 'A CRAB: “Florida Man. Florida MAN.”', 'A TURTLE: “Take the plastic. Please.”']), 2.4); }
    if (s.air <= 0) this.blackout();
    if (!under && s.t > .6 && (Input.tapped('a') || Input.tapped('b'))) this.surface();
  },
  take(it) {
    const s = this.s; it.took = true; s.got.push(it); Sound.play('pickup');
    const L = DIVE_LOOT[it.k]; this.say(it.say || `+ ${L ? L.name : it.name}`, 1.2);
    if (it.onTake) it.onTake();
  },
  hurt(f) {
    const s = this.s; f.cd = 1.4; Game.shake = 4; Sound.play('hurt'); s.air -= f.k === 'cuda' ? .18 : .1; s.vx += (s.x < f.x ? -1 : 1) * 120; s.vy -= 40;
    if (f.k === 'cuda') { const lost = s.got.filter(g => !g.keep).pop(); if (lost) { s.got.splice(s.got.indexOf(lost), 1); lost.took = false; lost.x = s.x; lost.y = DV_FLOOR - 6; } }
    this.say(f.k === 'cuda' ? pick(['BARRACUDA. It took a bite AND your stuff.', 'The barracuda has no respect for Dan.']) : pick(['JELLYFISH. Do NOT pee on Dan.', 'Stung. Right on the jorts.']), 1.8);
    Game.day_.stings = (Game.day_.stings || 0) + 1;
    if (f.k === 'jelly' && Game.day_.stings === 2) headline('FLORIDA MAN STUNG BY JELLYFISH TWICE IN ONE DAY, BLAMES "THE JELLYFISH"', 3);
  },
  blackout() {
    const s = this.s, kept = s.got.filter(g => g.keep); s.got = kept; s.out = .01; Game.shake = 6; Sound.play('fail');
    this.say('Everything goes blue... Dan wakes up floating. He lost his haul.', 2.4); s.lostAll = true;
  },
  surface() { const s = this.s; s.out = .01; Sound.play('splash'); if (!s.got.length) this.say('Nothin’. The ocean keeps its secrets.', 1.4); },
  finish() {
    const s = this.s; this.s = null; Game.mode = 'play'; showHud(true); padFor(false);
    let cash = 0; const names = [];
    for (const it of s.got) { const L = DIVE_LOOT[it.k]; if (L) { if (L.cash) cash += L.cash; if (L.item) giveItem(L.item, 1, true); if (L.trash) Game.inv.trash = (Game.inv.trash || 0) + 1; } if (it.give) giveItem(it.give, 1, true); names.push(L ? L.name : it.name); }
    if (cash) { Game.money += cash; Sound.play('cash'); }
    const F = Game.flags; F.dives = (F.dives || 0) + 1;
    if (F.dives === 1) headline('FLORIDA MAN GOES SNORKELING IN JORTS; REEF "DISAPPOINTED BUT NOT SURPRISED"', 2);
    if (s.got.some(g => g.k === 'lobster') && !F.lobsterHl) { F.lobsterHl = true; headline('FLORIDA MAN CATCHES LOBSTER WITH BARE HANDS, NAMES IT, RELEASES IT, CATCHES IT AGAIN', 3); }
    if (!s.lostAll && s.got.length) toast(`Dan climbs out with: ${names.slice(0, 4).join(', ')}${names.length > 4 ? '…' : ''}${cash ? ` (+$${cash})` : ''}`, 3.5);
    updateHotbar && updateHotbar();
    if (s.then) s.then({ got: s.got, cash, lost: !!s.lostAll });
  },
  // ---------- drawing (320-wide window that follows Dan across a 640-wide seabed) ----------
  draw() {
    const s = this.s; if (!s) return; const t = Game.t, Z = s.Z, cx = clamp(s.x - 160, 0, DIVE_W - 320);
    // water column: bright at the top, deep blue at the bottom
    for (let y = 0; y < VH; y += 6) { const k = y / VH; R(0, y, VW, 6, `rgb(${Math.round(40 - 30 * k)},${Math.round(190 - 110 * k)},${Math.round(205 - 70 * k)})`); }
    R(0, 0, VW, DV_SURF - 6, '#8fdcef'); for (let x = 0; x < VW; x += 8) R(x, DV_SURF - 6 + Math.round(Math.sin((x + cx) * .08 + t * 3) * 1.5), 8, 3, '#d8f7f5');
    // god rays
    g.globalAlpha = .08; for (let i = 0; i < 5; i++) { const rx = ((i * 97 - cx * .3) % 400 + 400) % 400 - 40; g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(rx, DV_SURF); g.lineTo(rx + 18, DV_SURF); g.lineTo(rx + 60, VH); g.lineTo(rx + 30, VH); g.fill(); } g.globalAlpha = 1;
    if (Z.pylons) for (let px = 60; px < DIVE_W; px += 150) { const x = px - cx; OR(x, DV_SURF, 16, DV_FLOOR - DV_SURF, '#8d8a93'); R(x + 3, DV_SURF, 3, DV_FLOOR - DV_SURF, '#a9a6ae'); }
    if (Z.murk) { g.globalAlpha = .18; R(0, 60, VW, VH, '#556b4a'); g.globalAlpha = 1; }
    // the floor
    R(0, DV_FLOOR, VW, VH - DV_FLOOR, Z.floor); for (let x = 0; x < VW; x += 3) if (hash2(x + cx, 9) > .7) R(x, DV_FLOOR + 1 + hash2(x, cx) * 10, 2, 1, PAL.sandD);
    for (let i = 0; i < 26; i++) { const wx = (i * 53 + 17) % DIVE_W - cx; if (wx < -20 || wx > VW + 20) continue;
      if (Z.coral && i % 3 === 0) { const c = ['#ff7a8a', '#ffb347', '#b86bd6', '#ff5ea8'][i % 4]; OR(wx, DV_FLOOR - 14, 4, 14, c); OR(wx - 5, DV_FLOOR - 10, 4, 6, c); OR(wx + 5, DV_FLOOR - 18, 4, 8, c); }
      else if (i % 2 || Z.grass) for (let b = 0; b < 3; b++) R(wx + b * 3, DV_FLOOR - 8 - b * 2 + Math.sin(t * 2 + i + b) * 1, 1, 8 + b * 2, '#3e8f5a'); }
    // loot
    for (const it of s.things) { if (it.took) continue; const x = it.x - cx, y = it.y; if (x < -10 || x > VW + 10) continue; this.drawLoot(it, x, y, t); }
    // the locals
    for (const f of s.foes) { const x = f.x - cx; if (x < -30 || x > VW + 30) continue;
      if (f.k === 'cuda') { const d = f.vx > 0 || (Math.abs(f.x - s.x) < 90 && s.x > f.x) ? 1 : -1; OR(x - 12, f.y - 2, 24, 5, '#b8c4cc'); R(x - 12, f.y + 1, 24, 1, '#8d9aa4'); R(x + d * 10, f.y - 1, 2, 1, PAL.black); R(x - d * 13, f.y - 4, 3, 9, '#8d9aa4'); for (let k = -8; k < 8; k += 4) R(x + k, f.y - 2, 1, 1, '#5d6a74'); }
      else { g.globalAlpha = .8; OR(x - 5, f.y - 5, 10, 6, '#f2c6f0'); g.globalAlpha = 1; for (let k = 0; k < 4; k++) R(x - 4 + k * 3, f.y + 1, 1, 6 + Math.sin(t * 4 + k) * 2, '#e7a6e3'); } }
    // Dan, swimming (rotated sideways), in a mask
    const x = Math.round(s.x - cx), y = Math.round(s.y), sw = Math.sin(t * (Input.held('run') ? 14 : 8));
    g.save(); g.translate(x, y); g.scale(s.face, 1); g.rotate(Math.PI / 2 + sw * .05); g.drawImage(SPR.dan.down[Math.floor(t * 6) % 2], -8, -11); g.restore();
    R(x + s.face * 4 - 2, y - 5, 5, 3, '#27c6b4'); R(x + s.face * 4 - 1, y - 4, 3, 1, '#d8f7f5'); R(x + s.face * 2, y - 11, 1, 6, PAL.ink);   // mask + snorkel
    for (const b of s.bubbles) R(b.x - cx, b.y, 2, 2, '#d8f7f5');
    // HUD: air, haul, hint
    const air = clamp(s.air, 0, 1); OR(8, 8, 80, 7, PAL.inkL); R(8, 8, 80 * air, 7, air < .25 && Math.floor(t * 6) % 2 ? PAL.red : air < .4 ? PAL.yellow : PAL.teal); label('AIR', 98, 15, PAL.white, 6, 'left');
    const cash = s.got.reduce((n, it) => n + ((DIVE_LOOT[it.k] || {}).cash || 0), 0); label(`HAUL ${s.got.length}${cash ? ` · $${cash}` : ''}`, 312, 15, PAL.yellow, 6, 'right');
    if (s.y <= DV_SURF + 4 && s.t > 1) label(`${K('a').replace(/<[^>]+>/g, '')} CLIMB OUT`, 160, 50, PAL.white, 6);
    if (s.msgT > 0) msgBox(s.msg, 152);
    if (s.t < 3 && s.y < 60 && s.msgT <= 0) label(isTouch ? 'STICK: SWIM · PUSH ALL THE WAY: KICK' : 'ARROWS: SWIM · SHIFT: KICK', 160, 172, PAL.white, 6);
  },
  drawLoot(it, x, y, t) {
    const L = DIVE_LOOT[it.k], bob = Math.round(Math.sin(it.t * 2) * 1);
    if (it.draw) return it.draw(x, y + bob, t);
    switch (it.k) {
      case 'coin': OR(x - 2, y - 2 + bob, 5, 5, L.c); if (Math.floor(t * 3 + it.x) % 5 === 0) R(x, y - 1 + bob, 1, 1, PAL.white); break;
      case 'conch': OR(x - 4, y - 3, 8, 6, L.c); R(x - 2, y - 2, 4, 1, '#ffe3dc'); break;
      case 'lobster': { const w = Math.round(Math.sin(t * 5 + it.x)); OR(x - 5, y - 2, 10, 4, L.c); R(x - 8, y - 3 + w, 3, 1, L.c); R(x + 5, y - 3 - w, 3, 1, L.c); R(x + 4, y - 1, 1, 1, PAL.black); break; }
      case 'can': OR(x - 2, y - 3, 4, 6, L.c); R(x - 2, y - 3, 4, 1, '#c9c2b4'); break;
      case 'flop': OR(x - 4, y - 1, 8, 3, L.c); break;
      case 'plate': OR(x - 5, y - 3, 10, 6, L.c); R(x - 3, y - 1, 6, 1, PAL.red); break;
      default: OR(x - 3, y - 3, 6, 6, it.c || PAL.yellow);
    }
  },
};
ICONS.lobster = { key: { o: 'ink', r: 'red', d: 'redD', k: 'black' }, rows: [
  'r........r', '.r......r.', '..oooooo..', '.orrrrrro.', 'orkrrrrkro', 'orrrrrrrro', '.orrddrro.', '..orrrro..', '...orro...', '..oo..oo..'] };
ITEMS.lobster = { name: 'Spiny Lobster', price: 0, desc: 'Grabbed with bare hands. It is mad about it.' };
