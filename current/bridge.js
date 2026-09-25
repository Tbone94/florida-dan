// FLORIDA DAN — the Seven Mile Bridge. A set piece: Dan floors the motorized cooler down seven miles of US-1
// over open water. Top-down, the road scrolls; pass the RVs (use the oncoming lane, carefully), dodge the boat
// trailer, the pelicans and the gusts. Can't fail — bumps just cost time. Drawn on its own 320x180 stage.
// Orlando reuses it as the I-4 run (skin 'i4'): two lanes one way, jammed traffic, lane closures, a mattress.
'use strict';

// a white message box that fits its text (two lines if it has to) — the bridge and dive screens share it
function msgBox(msg, cy) {
  let lines = [msg]; if (labelWidth(msg, 6) > 290) { const mid = msg.lastIndexOf(' ', Math.floor(msg.length / 2) + 6); lines = [msg.slice(0, mid), msg.slice(mid + 1)]; }
  const w = Math.min(310, Math.max(...lines.map(l => labelWidth(l, 6))) + 12), h = lines.length * 10 + 4;
  OR(160 - w / 2, cy - h / 2, w, h, PAL.inkL); R(160 - w / 2, cy - h / 2, w, 1, PAL.yellow); lines.forEach((l, i) => label(l, 160, cy - h / 2 + 10 + i * 10, PAL.white, 6));   // label() outlines in ink: dark text on white smears
}
const BRIDGE_MILES = 7, BRIDGE_PX = 900;   // px of road per mile
const LANE = { mine: 176, other: 144 }, RAIL = { l: 124, r: 196 };
const Bridge = {
  s: null,
  start(then, o = {}) {
    this.s = { skin: o.skin || 'keys', x: LANE.mine, v: 60, dist: 0, t: 0, hits: 0, obs: [], fx: [], spawnT: 1.2, gust: 0, gustT: 5 + Math.random() * 3, cans: 0, then, msg: '', msgT: 0, done: 0, scroll: 0 };
    Game.mode = 'bridge'; showHud(false); padFor(true); Sound.play('engine');
    this.say(this.s.skin === 'i4' ? 'I-4. THE GANG IS AT MILE 7. USE THE SHOULDER.' : 'SEVEN MILES. FLOOR IT.', 2.2);
  },
  say(m, t = 1.6) { this.s.msg = m; this.s.msgT = t; },
  update(dt) {
    const s = this.s; if (!s) { Game.mode = 'play'; return; }
    s.t += dt; s.msgT -= dt;
    if (s.done) { s.done += dt; s.v = Math.max(0, s.v - 200 * dt); s.scroll += s.v * dt; if (s.done > 1.6) this.finish(); return; }
    const F = Game.fx, ax = Input.axis(), wob = F.buzz > 40 ? Math.sin(s.t * 2.3) * (F.buzz - 40) * .9 : 0;
    const top = 230 * (F.powder > 0 ? 1.25 : 1) * (hasUp('nitro') && Input.held('run') ? 1.3 : 1);
    s.v += (ax.y < -.3 ? 150 : ax.y > .3 ? -260 : 40) * dt; s.v = clamp(s.v, 40, top);   // cruise creeps up on its own; up = gas, down = brake
    s.x += (ax.x * 95 + wob + s.gust * 70) * dt; s.x = clamp(s.x, RAIL.l + 9, RAIL.r - 9);
    if (s.x <= RAIL.l + 9.5 || s.x >= RAIL.r - 9.5) { if (s.v > 120 && Math.random() < dt * 8) { Game.shake = 2; Sound.play('whiff'); } s.v -= 60 * dt; }   // scraping the rail
    s.dist += s.v * dt; s.scroll += s.v * dt;
    // wind: the Keys don't care about your cooler
    if ((s.gustT -= dt) <= 0 && s.skin === 'i4') { s.gustT = 4 + Math.random() * 3; const lane = pick([LANE.mine, LANE.other]); s.obs.push({ k: 'closed', x: lane, y: -120, v: 0, w: 22, h: 70 }); this.say('LANE CLOSED AHEAD. MERGE!', 1.2); }
    else if (s.gustT <= 0) { s.gust = pick([-1, 1]) * (.8 + Math.random() * .6); s.gustT = 4 + Math.random() * 4; this.say('GUST!', 1); for (let i = 0; i < 14; i++) s.fx.push({ k: 'spray', x: s.gust > 0 ? RAIL.l - 10 : RAIL.r + 10, y: rnd(20, 170), vx: s.gust * rnd(60, 120), vy: rnd(-10, 10), life: .8 }); }
    s.gust *= Math.pow(.25, dt);
    // traffic
    if ((s.spawnT -= dt) <= 0 && s.dist < BRIDGE_MILES * BRIDGE_PX - 500) { this.spawn(); s.spawnT = rnd(.9, 1.7) * (s.v > 180 ? .8 : 1); }
    for (const o of s.obs) {
      o.y += (s.v - o.v) * dt; o.t = (o.t || 0) + dt;
      if (o.k === 'trailer') o.x = o.x0 + Math.sin(o.t * 3.2) * 9;
      if (o.k === 'pelican') { o.x += o.vx * dt; if (o.y > 40) o.low = true; }
      if (o.k === 'bike') o.x = RAIL.r - 12;
      if (!o.hit && Math.abs(o.x - s.x) < (o.w + 16) / 2 && Math.abs(o.y - 140) < (o.h + 14) / 2 && (o.k !== 'pelican' || o.low)) this.bump(o);
    }
    s.obs = s.obs.filter(o => o.y < 240 && o.y > -300 && o.x > -40 && o.x < 360);
    for (const f of s.fx) { f.x += f.vx * dt; f.y += (f.vy + s.v * .2) * dt; f.life -= dt; } s.fx = s.fx.filter(f => f.life > 0);
    if (Math.random() < dt * 8) Sound.play('engine');
    if (s.dist >= BRIDGE_MILES * BRIDGE_PX) { s.done = .01; this.say(s.skin === 'i4' ? 'THE GREYHOUND. HAZARDS ON. HE MADE IT.' : 'BIG PINE KEY. HE MADE IT.', 2); Sound.play('catch'); }
  },
  spawn() {
    const s = this.s, r = Math.random(), y = -60;
    if (s.skin === 'i4') {   // I-4: everybody's going your way, just slower. Much slower.
      if (r < .34) s.obs.push({ k: 'rv', x: pick([LANE.mine, LANE.other]), y, v: 40 + Math.random() * 40, w: 18, h: 40, c: pick(['#f3eee0', '#e8d39a', '#bfe3e0']) });
      else if (r < .7) s.obs.push({ k: 'car', up: true, x: pick([LANE.mine, LANE.other]), y, v: 60 + Math.random() * 60, w: 14, h: 22, c: pick(['#e0433a', '#4f7bd1', '#ffd23f', '#f4efe6', '#86c94a', '#ff5ea8']) });
      else if (r < .8) s.obs.push({ k: 'mattress', x: pick([LANE.mine, LANE.other]), y, v: 0, w: 16, h: 12 });
      else if (r < .88) s.obs.push({ k: 'bike', x: RAIL.r - 12, y, v: 0, w: 8, h: 14 });
      else s.obs.push({ k: 'can', x: pick([LANE.mine, LANE.other, (LANE.mine + LANE.other) / 2]), y, v: 0, w: 6, h: 8 });
      return;
    }
    if (r < .3) s.obs.push({ k: 'rv', x: LANE.mine, y, v: 95 + Math.random() * 30, w: 18, h: 40, c: pick(['#f3eee0', '#e8d39a', '#bfe3e0']) });
    else if (r < .58) s.obs.push({ k: 'car', x: LANE.other, y: y - 40, v: -170, w: 14, h: 22, c: pick(['#e0433a', '#4f7bd1', '#ffd23f', '#f4efe6', '#86c94a', '#ff5ea8']) });
    else if (r < .7) s.obs.push({ k: 'trailer', x: LANE.mine, x0: LANE.mine, y, v: 120, w: 20, h: 44 });
    else if (r < .82) { const fromL = Math.random() < .5; s.obs.push({ k: 'pelican', x: fromL ? RAIL.l - 20 : RAIL.r + 20, y: -10, v: s.v * .55, vx: fromL ? 55 : -55, w: 14, h: 8 }); }
    else if (r < .9) s.obs.push({ k: 'bike', x: RAIL.r - 12, y, v: 40, w: 8, h: 14 });
    else s.obs.push({ k: 'can', x: pick([LANE.mine, LANE.other, (LANE.mine + LANE.other) / 2]), y, v: 0, w: 6, h: 8 });
  },
  bump(o) {
    const s = this.s; o.hit = true;
    if (o.k === 'can') { s.cans++; giveItem('beer', 1, true); Sound.play('pickup'); this.say(pick(['Road beer!', 'Free Swamp Lite!', 'Finders keepers.']), 1); o.y = 999; return; }
    s.hits++; s.v *= o.k === 'pelican' ? .7 : .4; Game.shake = 5; Sound.play(o.k === 'pelican' ? 'cough' : 'hurt'); Input.rumble && Input.rumble(.6, 200);
    s.x += s.x < o.x ? -14 : 14;
    if (s.skin === 'i4') return this.say({ rv: pick(['BONK. A minivan full of mouse ears.', 'A tour bus. It honks in six languages.']), car: pick(['Fender bender! Nobody stops. It’s I-4.', 'BONK. The driver doesn’t look up from her phone.']), mattress: 'A MATTRESS. On I-4. Of course.', closed: 'ORANGE BARRELS. SO MANY BARRELS.', bike: 'Sorry! (It’s the orange guy. He sells oranges on I-4.)' }[o.k] || 'BONK.', 1.8);
    this.say({ rv: pick(['BONK. The RV doesn’t even notice.', 'Retirees. Seventy of ’em. All honking.']), car: 'HEAD-ON-ISH! Wrong lane, Dan!', trailer: 'The boat trailer fishtails. So does Dan.',
      pelican: 'A PELICAN. IN THE FACE.', bike: 'Sorry! SORRY! (The parrot says a bad word.)' }[o.k] || 'BONK.', 1.8);
    for (let i = 0; i < 8; i++) s.fx.push({ k: 'spark', x: s.x, y: 132, vx: rnd(-60, 60), vy: rnd(-60, 10), life: .35 });
  },
  finish() {
    const s = this.s; this.s = null; Game.mode = 'play'; showHud(true); padFor(false);
    const F = Game.flags, secs = s.t, key = s.skin === 'i4' ? 'i4Best' : 'bridgeBest', best = F[key];
    if (!best || secs < best) F[key] = +secs.toFixed(1);
    if (s.then) s.then({ secs, hits: s.hits, cans: s.cans, record: !best || secs < best });
  },
  draw() {
    const s = this.s; if (!s) return; const t = Game.t, sc = s.scroll;
    if (s.skin === 'i4') return this.drawI4(s, t, sc);
    // water, both sides, with glints scrolling past
    R(0, 0, VW, VH, '#1fa3b8'); for (let i = 0; i < 70; i++) { const gx = (hash2(i, 7) * VW) | 0, gy = ((hash2(i, 3) * 260 + sc * .9) % 260) - 40; R(gx, gy, 3 + (i % 3), 1, i % 4 ? '#7fe3e8' : '#d8f7f5'); }
    for (let i = 0; i < 9; i++) { const sy = ((i * 60 + sc * .9) % 540) - 60; R(0, sy, 10 + hash2(i, 1) * 30, 3, '#2bb6c4'); }
    // the old bridge, broken, off to the left
    for (let k = 0; k < 7; k++) { const oy = ((k * 110 + sc * .95) % 770) - 110; if (k % 4 !== 2) { OR(36, oy, 34, 96, '#b8b3a8'); R(38, oy + 4, 30, 1, '#96918a'); } for (let p = 0; p < 3; p++) R(44 + p * 10, oy + 96, 4, 8, '#8d8a93'); }
    // the deck
    R(RAIL.l - 6, 0, RAIL.r - RAIL.l + 12, VH, '#96918a'); R(RAIL.l, 0, RAIL.r - RAIL.l, VH, PAL.road);
    for (let y = -40; y < VH + 40; y += 24) { const dy = ((y + sc) % 240 + 240) % 240 - 40; R(159, dy, 2, 12, PAL.line); }
    for (const x of [RAIL.l - 4, RAIL.r + 1]) { R(x, 0, 3, VH, PAL.white); for (let y = -20; y < VH; y += 20) R(x, ((y + sc) % 200 + 200) % 200 - 20, 3, 2, '#c9c2b4'); }
    // traffic
    for (const o of s.obs) this.drawObs(o, t);
    // Dan on the cooler, pointed north
    const jig = Math.round(Math.sin(t * 40)) * .5, x = Math.round(s.x), y = 140;
    shadow(x, y + 8, 18, 5); OR(x - 8, y - 8 + jig, 16, 16, PAL.white); R(x - 8, y - 8 + jig, 16, 3, PAL.red); R(x - 6, y - 10, 3, 2, PAL.yellow); R(x + 3, y - 10, 3, 2, PAL.yellow);
    g.drawImage(SPR.dan.up[Math.floor(t * 8) % 2], x - 8, y - 20 + jig);
    for (const f of s.fx) R(f.x, f.y, f.k === 'spray' ? 2 : 1, f.k === 'spray' ? 1 : 1, f.k === 'spray' ? '#d8f7f5' : PAL.yellow);
    // HUD: the mile markers
    const k = clamp(s.dist / (BRIDGE_MILES * BRIDGE_PX), 0, 1);
    OR(40, 8, 240, 8, PAL.inkL); R(40, 8, 240 * k, 8, PAL.teal); for (let m = 1; m < BRIDGE_MILES; m++) R(40 + 240 * m / BRIDGE_MILES, 8, 1, 8, PAL.ink);
    label('SEVEN MILE BRIDGE', 160, 26, PAL.white, 7); label(`${(k * BRIDGE_MILES).toFixed(1)} MI · ${Math.round(s.v * .3)} MPH`, 160, 36, PAL.yellow, 6);
    if (s.msgT > 0) msgBox(s.msg, 65);
    if (s.t < 3) label(isTouch ? 'STICK: STEER · UP: GAS · DOWN: BRAKE' : '← → STEER · ↑ GAS · ↓ BRAKE', 160, 172, PAL.white, 6);
  },
  // the I-4 look: grass, palms, billboards, jersey barriers, two lanes going the same way, and the Greyhound at the end
  drawI4(s, t, sc) {
    R(0, 0, VW, VH, '#5aa83a'); for (let i = 0; i < 60; i++) { const gx = (hash2(i, 7) * VW) | 0, gy = ((hash2(i, 3) * 260 + sc) % 260) - 40; if (gx < RAIL.l - 14 || gx > RAIL.r + 14) R(gx, gy, 2, 2, '#3e7f2c'); }
    for (let i = 0; i < 6; i++) { const sy = ((i * 90 + sc) % 540) - 60, left = i % 2 === 0, bx = left ? 20 + hash2(i, 2) * 50 : 220 + hash2(i, 4) * 60;
      if (i % 3 === 0) { const x0 = left ? 14 : 214 + hash2(i, 4) * 24; R(x0 + 12, sy + 10, 2, 16, PAL.woodD); R(x0 + 56, sy + 10, 2, 16, PAL.woodD); OR(x0, sy - 6, 72, 16, PAL.white); R(x0, sy - 6, 72, 2, '#e0433a'); label(['SUE THE MOUSE', 'TIMESHARES!'][(i / 3) % 2], x0 + 36, sy + 5, PAL.ink, 4); }
      else { R(bx + 4, sy - 8, 2, 16, PAL.woodD); g.fillStyle = '#2c5e22'; g.beginPath(); g.arc(bx + 5, sy - 10, 9, 0, 7); g.fill(); } }
    R(RAIL.l - 10, 0, RAIL.r - RAIL.l + 20, VH, '#8d8a93'); R(RAIL.l, 0, RAIL.r - RAIL.l, VH, PAL.road);
    for (let y = -40; y < VH + 40; y += 24) { const dy = ((y + sc) % 240 + 240) % 240 - 40; R(159, dy, 2, 12, PAL.white); }
    for (const x of [RAIL.l - 6, RAIL.r + 1]) { R(x, 0, 5, VH, '#c9c2b4'); for (let y = -20; y < VH; y += 20) R(x, ((y + sc) % 200 + 200) % 200 - 20, 5, 1, '#a9a39a'); }
    const k0 = clamp(s.dist / (BRIDGE_MILES * BRIDGE_PX), 0, 1);
    if (k0 > .9) { const by = -120 + (k0 - .9) * 10 * 170; OR(LANE.other - 10, by, 22, 56, '#d7dde3'); R(LANE.other - 10, by + 10, 22, 4, '#3d6fe0'); label('GREYHOUND', LANE.other + 1, by + 24, '#3d6fe0', 4); if (Math.floor(t * 4) % 2) { R(LANE.other - 10, by + 54, 4, 2, PAL.orange); R(LANE.other + 8, by + 54, 4, 2, PAL.orange); } }
    for (const o of s.obs) this.drawObs(o, t);
    const jig = Math.round(Math.sin(t * 40)) * .5, x = Math.round(s.x), y = 140;
    shadow(x, y + 8, 18, 5); OR(x - 8, y - 8 + jig, 16, 16, PAL.white); R(x - 8, y - 8 + jig, 16, 3, PAL.red); R(x - 6, y - 10, 3, 2, PAL.yellow); R(x + 3, y - 10, 3, 2, PAL.yellow);
    g.drawImage(SPR.dan.up[Math.floor(t * 8) % 2], x - 8, y - 20 + jig);
    for (const f of s.fx) R(f.x, f.y, 1, 1, PAL.yellow);
    OR(40, 8, 240, 8, PAL.inkL); R(40, 8, 240 * k0, 8, '#ff9a2e'); for (let m = 1; m < BRIDGE_MILES; m++) R(40 + 240 * m / BRIDGE_MILES, 8, 1, 8, PAL.ink);
    label('I-4 · UNDER CONSTRUCTION SINCE 1991', 160, 26, PAL.white, 6); label(`MILE ${(k0 * BRIDGE_MILES).toFixed(1)} · ${Math.round(s.v * .3)} MPH · TRAFFIC: 4 MPH`, 160, 36, PAL.yellow, 5);
    if (s.msgT > 0) msgBox(s.msg, 65);
    if (s.t < 3) label(isTouch ? 'STICK: STEER · UP: GAS · DOWN: BRAKE' : '← → STEER · ↑ GAS · ↓ BRAKE', 160, 172, PAL.white, 6);
  },
  drawObs(o, t) {
    const x = Math.round(o.x), y = Math.round(o.y);
    switch (o.k) {
      case 'closed': for (let i = 0; i < 5; i++) { const by = y - 30 + i * 15; R(x - 5, by, 10, 11, '#ff8a3d'); R(x - 5, by + 3, 10, 2, PAL.white); R(x - 6, by + 10, 12, 2, PAL.ink); } label('CLOSED', x, y - 36, '#ff8a3d', 4); break;
      case 'mattress': shadow(x, y + 7, 18, 3); OR(x - 8, y - 6, 16, 12, '#f4efe6'); R(x - 6, y - 3, 12, 1, '#c9c2b4'); R(x - 4, y + 1, 5, 3, '#d9b35c'); break;
      case 'rv': shadow(x, y + o.h / 2 + 2, o.w + 4, 5); OR(x - 9, y - 20, 18, 40, o.c); R(x - 9, y - 6, 18, 3, PAL.orange); OR(x - 6, y - 17, 12, 5, PAL.waterL); R(x - 3, y + 6, 6, 8, PAL.greyD); R(x - 9, y + 18, 3, 2, PAL.red); R(x + 6, y + 18, 3, 2, PAL.red); break;
      case 'car': shadow(x, y + 12, 16, 4); OR(x - 7, y - 11, 14, 22, o.c); if (o.up) { OR(x - 5, y - 8, 10, 5, PAL.waterL); R(x - 6, y + 10, 3, 1, PAL.red); R(x + 3, y + 10, 3, 1, PAL.red); } else { OR(x - 5, y + 2, 10, 5, PAL.waterL); R(x - 6, y + 10, 3, 1, PAL.yellow); R(x + 3, y + 10, 3, 1, PAL.yellow); } break;
      case 'trailer': shadow(x, y + 24, 20, 4); R(x - 1, y + 10, 2, 12, PAL.greyD); OR(x - 10, y - 22, 20, 32, PAL.white); R(x - 10, y - 8, 20, 3, PAL.blue); OR(x - 4, y - 18, 8, 6, PAL.waterL); break;
      case 'pelican': { const img = SPR[o.vx > 0 ? 'pelican' : 'pelicanL']; if (o.low) shadow(x, y + 10, 12, 3); else shadow(x, y + 30, 8, 2); if (img) g.drawImage(img, x - 7, y - 8); break; }
      case 'bike': R(x - 3, y + 2, 6, 6, PAL.black); g.drawImage(SPR.tourist ? SPR.tourist.up[Math.floor(t * 8) % 2] : SPR.dan.up[0], x - 8, y - 14); R(x + 2, y - 14, 3, 3, PAL.red); R(x + 3, y - 16, 2, 2, PAL.green || '#86c94a'); break;
      case 'can': R(x - 2, y - 3, 4, 6, PAL.blue); R(x - 2, y - 3, 4, 1, '#c9c2b4'); break;
    }
  },
};
