// FLORIDA DAN — SQUEAK SNEAK. Orlando's signature minigame: Dan, in a stolen mouse suit, has to get across
// SqueakyLand without Fun Enforcement noticing that Mr. Squeaky is walking funny and smells like Swamp Lite.
// Top-down, its own 320-wide stage that scrolls. Guards have vision cones: walk through one and SUSPICION climbs
// fast; HOLD E to stop and WAVE like a real mascot (they think you work here), it climbs way slower. Kids run up
// and hug you, which slows you down. GIT shakes them off, but a mouse yelling GIT is suspicious. Beer makes the big
// head wobble (steering drifts). Day: castle → front gate. Night (Case 11): front gate → the castle door (HQ).
// The Skip-A-Line wristband (souvenir shop) shrinks the cones. Mode 'sneak'.
'use strict';
const SNEAK_H = 640;
const SNEAK_MAP = {   // obstacles [x, y, w, h, kind] on a 320 x 640 slice of the park
  solid: [[0, 0, 22, 640, 'shops'], [298, 0, 22, 640, 'shops'], [108, 18, 104, 40, 'castle'],
    [40, 108, 64, 26, 'flowers'], [216, 108, 64, 26, 'flowers'], [134, 176, 52, 34, 'fountain'], [34, 236, 40, 20, 'cart'], [248, 244, 40, 20, 'cart'],
    [84, 306, 56, 22, 'planter'], [182, 306, 56, 22, 'planter'], [26, 372, 70, 34, 'cups'], [226, 372, 70, 34, 'cups'], [118, 436, 84, 16, 'bench'],
    [40, 506, 56, 22, 'flowers'], [226, 506, 56, 22, 'flowers'], [22, 600, 106, 40, 'wall'], [192, 600, 106, 40, 'wall']],
  guards: {
    day: [{ path: [[40, 160], [284, 160]], v: 40 }, { at: [160, 268], look: Math.PI / 2, sweep: 2.4, rate: .9 }, { path: [[112, 350], [112, 470]], v: 30 },
      { path: [[282, 474], [38, 474]], v: 46 }, { at: [70, 576], look: 0, sweep: .9, rate: .8 }, { at: [250, 576], look: Math.PI, sweep: .9, rate: .8 }],
    night: [{ path: [[40, 150], [284, 150]], v: 44 }, { at: [160, 90], look: Math.PI / 2, sweep: 1.4, rate: .7 }, { at: [160, 268], look: -Math.PI / 2, sweep: 2.6, rate: 1 },
      { path: [[210, 350], [210, 470]], v: 34 }, { path: [[38, 474], [282, 474]], v: 48 }, { path: [[282, 230], [282, 330]], v: 30 }],
  },
};
const Sneak = {
  s: null,
  start(o = {}) {
    const night = !!o.night, M = SNEAK_MAP;
    const guards = M.guards[night ? 'night' : 'day'].map(d => d.path ? { x: d.path[0][0], y: d.path[0][1], path: d.path, i: 1, v: d.v, a: 0 } : { x: d.at[0], y: d.at[1], base: d.look, sweep: d.sweep, rate: d.rate, a: d.look, ph: Math.random() * 6 });
    const kids = []; if (!night) for (const [x, y] of [[190, 120], [60, 290], [270, 420], [160, 540], [250, 210]]) kids.push({ x, y, hx: x, hy: y, cd: 0, hug: 0, f: Math.random() * 6 });
    this.s = { night, x: 160, y: night ? 586 : 76, vx: 0, vy: 0, sus: 0, t: 0, guards, kids, slow: 0, wave: false, face: night ? 'up' : 'down', msg: '', msgT: 0, done: 0, won: false, then: o.then, seen: 0, cam: 0 };
    this.s.cam = clamp(this.s.y - 100, 0, SNEAK_H - VH);
    Game.mode = 'sneak'; showHud(false); padFor(true); Sound.play('headline');
    this.say(night ? 'AFTER HOURS. GET TO THE CASTLE DOOR.' : 'GET TO THE FRONT GATE. ACT NATURAL. BE A MOUSE.', 2.6);
  },
  say(m, t = 1.8) { this.s.msg = m; this.s.msgT = t; },
  range: () => hasUp('wristband') ? 52 : 68,
  solidAt(x, y) { for (const [ox, oy, w, h, k] of SNEAK_MAP.solid) { if (k === 'fountain' ? Math.hypot((x - ox - w / 2) / (w / 2), (y - oy - h / 2) / (h / 2)) < 1 : x > ox && x < ox + w && y > oy && y < oy + h) return true; } return false; },
  sees(gd, x, y) {
    const dx = x - gd.x, dy = y - gd.y, d = Math.hypot(dx, dy); if (d > this.range() || d < 2) return d < 10;
    let da = Math.atan2(dy, dx) - gd.a; da = Math.atan2(Math.sin(da), Math.cos(da)); return Math.abs(da) < .5;
  },
  update(dt) {
    const s = this.s; if (!s) { Game.mode = 'play'; return; }
    s.t += dt; s.msgT -= dt;
    if (s.done) { s.done += dt; if (s.done > 1.4) this.finish(); return; }
    const F = Game.fx, ax = Input.axis(), wob = F.buzz > 40 ? Math.sin(s.t * 2.1) * (F.buzz - 40) * .012 : 0;
    s.wave = Input.held('a');
    const run = Input.held('run') && !s.wave, sp = (run ? 92 : 62) * (s.slow > 0 ? .45 : 1) * (F.powder > 0 ? 1.2 : 1) * (F.high > 0 ? .8 : 1);
    s.slow = Math.max(0, s.slow - dt);
    let mx = s.wave ? 0 : ax.x + wob, my = s.wave ? 0 : ax.y; const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
    const nx = clamp(s.x + mx * sp * dt, 26, 294), ny = clamp(s.y + my * sp * dt, 30, SNEAK_H - 8);
    if (!this.solidAt(nx, s.y)) s.x = nx; if (!this.solidAt(s.x, ny)) s.y = ny;
    s.moving = ml > .15 && !s.wave; if (s.moving) s.face = Math.abs(mx) > Math.abs(my) ? (mx > 0 ? 'right' : 'left') : (my > 0 ? 'down' : 'up');
    // the guards walk their beats (or stand and sweep a flashlight)
    for (const gd of s.guards) {
      if (gd.path) { const [tx, ty] = gd.path[gd.i], dx = tx - gd.x, dy = ty - gd.y, d = Math.hypot(dx, dy); if (d < 2) gd.i = (gd.i + 1) % gd.path.length; else { gd.x += dx / d * gd.v * dt; gd.y += dy / d * gd.v * dt; gd.a = Math.atan2(dy, dx); } }
      else gd.a = gd.base + Math.sin(s.t * gd.rate + gd.ph) * gd.sweep / 2;
    }
    const seen = s.guards.some(gd => this.sees(gd, s.x, s.y));
    const rate = !seen ? -.32 : s.wave ? .16 : run ? 3.2 : s.moving ? 1.15 : .55;   // a JOGGING mouse is the most suspicious thing in the park
    s.sus = clamp(s.sus + rate * dt, 0, 1);
    if (seen && !s.seen) { Sound.play('talk'); this.say(s.wave ? pick(['*waves* They wave back...', 'Just a mouse. Doing mouse stuff.']) : pick(['FUN ENFORCEMENT: ...Squeaky? That you?', 'FUN ENFORCEMENT: Why is the mouse jogging?', `HOLD ${K('a').replace(/<[^>]+>/g, '')}: WAVE LIKE YOU WORK HERE!`]), 1.2); }
    s.seen = seen;
    // kids: they see Mr. Squeaky and they RUN at him
    for (const k of s.kids) {
      k.cd = Math.max(0, k.cd - dt); k.f += dt;
      const dx = s.x - k.x, dy = s.y - k.y, d = Math.hypot(dx, dy);
      if (k.hug > 0) { k.hug -= dt; k.x = s.x + Math.sin(k.f * 9) * 3 - 6; k.y = s.y + 4; if (k.hug <= 0) { k.cd = 4; k.hx = k.x; k.hy = k.y; } continue; }
      if (d < 70 && k.cd <= 0) { k.x += dx / d * 58 * dt; k.y += dy / d * 58 * dt; if (d < 9) { k.hug = 1.6; s.slow = 1.6; Sound.play('pickup'); this.say(pick(['KID: MR. SQUEAKY!!!', 'KID: HUG! HUG! HUG!', 'KID: Why do you smell like my dad?']), 1.2); } }
      else { const hx = k.hx - k.x, hy = k.hy - k.y, hd = Math.hypot(hx, hy); if (hd > 2) { k.x += hx / hd * 30 * dt; k.y += hy / hd * 30 * dt; } }
    }
    if (Input.tapped('b')) {
      Sound.play('git'); let shook = 0; for (const k of s.kids) if (Math.hypot(k.x - s.x, k.y - s.y) < 40) { k.hug = 0; k.cd = 5; k.x += (k.x - s.x) * .8; k.hy = k.y; k.hx = k.x; shook++; }
      s.slow = 0; if (s.guards.some(gd => Math.hypot(gd.x - s.x, gd.y - s.y) < 150)) { s.sus = Math.min(1, s.sus + .28); this.say('A mouse yelling GIT. Very suspicious.', 1.4); } else if (shook) this.say('GIT! (the kids scatter)', 1);
    }
    s.cam += (clamp(s.y - (s.night ? 110 : 80), 0, SNEAK_H - VH) - s.cam) * Math.min(1, dt * 5);
    if (s.sus >= 1) { s.done = .01; s.won = false; Game.shake = 6; Sound.play('siren'); this.say('CODE CHEESE! FUN ENFORCEMENT HAS THE MOUSE!', 2); return; }
    const goal = s.night ? s.y < 66 && Math.abs(s.x - 160) < 22 : s.y > 598 && Math.abs(s.x - 160) < 32;
    if (goal) { s.done = .01; s.won = true; Sound.play('catch'); this.say(s.night ? 'THE CASTLE DOOR. IT’S UNLOCKED. OF COURSE IT IS.' : 'THE FRONT GATE. FREEDOM. AND I-4.', 2); }
  },
  finish() {
    const s = this.s; this.s = null; Game.mode = 'play'; showHud(true); padFor(false);
    if (s.won && !s.night && s.t < 60 && !Game.flags.sneakFast) { Game.flags.sneakFast = true; headline('"MR. SQUEAKY" CROSSES ENTIRE THEME PARK IN UNDER A MINUTE; GUESTS REPORT MOUSE "HAULING ASS"', 3); }
    if (s.then) s.then({ won: s.won, t: s.t });
  },
  // ---------- drawing ----------
  draw() {
    const s = this.s; if (!s) return; const t = Game.t, cy = Math.round(s.cam);
    // pavers
    R(0, 0, VW, VH, s.night ? '#b9a8b8' : '#f1e6d2');
    for (let y = -(cy % 16); y < VH; y += 16) for (let x = 0; x < VW; x += 16) { const wy = y + cy; if (((x / 16) + Math.floor(wy / 16)) % 2 === 0) { g.globalAlpha = .06; R(x, y, 16, 16, PAL.ink); g.globalAlpha = 1; } R(x + hash2(x, Math.floor(wy / 16)) * 14, y + hash2(Math.floor(wy / 16), x) * 14, 1, 1, ['#27c6b4', '#ff5ea8', '#ffd23f', '#8d8a93'][(x / 16) % 4]); }
    R(142, 0, 36, VH, s.night ? '#c9b8c4' : '#f7ecd9');   // Main Street's middle stripe
    for (const [ox, oy, w, h, k] of SNEAK_MAP.solid) { const y = oy - cy; if (y > VH + 10 || y + h < -60) continue; this.drawSolid(ox, y, w, h, k, t, s.night); }
    // the goal
    if (s.night) { if (72 - cy > -20) { OR(148, 40 - cy, 24, 20, '#7a4a2b'); if (Math.floor(t * 3) % 2) label('↑ HQ', 160, 34 - cy, PAL.yellow, 6); } }
    else { const gy = 600 - cy; if (gy < VH + 20) { R(128, gy, 64, 40, '#e8e2d2'); for (let i = 0; i < 4; i++) OR(134 + i * 16, gy + 4, 6, 12, PAL.grey); if (Math.floor(t * 3) % 2) label('↓ EXIT', 160, gy - 4, PAL.red, 6); } }
    // vision cones (flashlights at night)
    const rg = this.range();
    for (const gd of s.guards) {
      const x = gd.x, y = gd.y - cy; if (y < -80 || y > VH + 80) continue;
      g.globalAlpha = s.night ? .34 : .22; g.fillStyle = this.sees(gd, s.x, s.y) ? '#ff4a3d' : s.night ? '#fff3b0' : '#ffd23f';
      g.beginPath(); g.moveTo(x, y); for (let i = 0; i <= 10; i++) { const a = gd.a - .5 + i / 10; g.lineTo(x + Math.cos(a) * rg, y + Math.sin(a) * rg); } g.fill(); g.globalAlpha = 1;
    }
    // kids, guards, Dan: back to front
    const L = [];
    for (const k of s.kids) L.push([k.y, () => { const x = Math.round(k.x), y = Math.round(k.y - cy); if (y < -20 || y > VH + 20) return; shadow(x, y + 1, 8); g.drawImage(SPR.tourist.down[Math.floor(k.f * 6) % 2], x - 5, y - 14, 11, 15); if (k.hug > 0) label('♥', x, y - 18, PAL.hat, 7); }]);
    for (const gd of s.guards) L.push([gd.y, () => { const x = Math.round(gd.x), y = Math.round(gd.y - cy); if (y < -30 || y > VH + 30) return; const d = dirOf(Math.cos(gd.a), Math.sin(gd.a)); shadow(x, y + 1, 12); g.drawImage(SPR.enforcer[d][gd.path ? Math.floor(t * 6) % 2 : 0], x - 8, y - 21); if (s.night) R(x + Math.cos(gd.a) * 6 - 1, y - 10 + Math.sin(gd.a) * 3, 3, 3, PAL.yellow); }]);
    L.push([s.y, () => { const x = Math.round(s.x), y = Math.round(s.y - cy), spr = SPR.danmouse[s.wave ? 'down' : s.face][s.moving ? Math.floor(t * 8) % 2 : 0]; shadow(x, y + 1, 12);
      const hb = Game.fx.buzz > 40 ? Math.round(Math.sin(t * 3) * 2) : 0; g.drawImage(spr, x - 8, y - 21 + (s.moving ? Math.floor(t * 8) % 2 : 0));
      if (hb) mouseHead(x + hb, y - 19, 4);
      if (s.wave) { const w = Math.sin(t * 14) > 0; R(x + (w ? 7 : 8), y - 20 + (w ? 0 : 2), 3, 3, PAL.white); R(x - 10, y - 12, 3, 3, PAL.white); } }]);
    L.sort((a, b) => a[0] - b[0]).forEach(e => e[1]());
    if (s.night) { g.globalAlpha = .38; R(0, 0, VW, VH, '#0b0a24'); g.globalAlpha = 1; for (let i = 0; i < 20; i++) R((hash2(i, 4) * VW) | 0, (hash2(i, 9) * 30) | 0, 1, 1, PAL.white); }
    // HUD: suspicion
    const k = s.sus; OR(92, 8, 136, 8, PAL.inkL); R(92, 8, 136 * k, 8, k > .7 && Math.floor(t * 8) % 2 ? PAL.red : k > .4 ? PAL.orange : PAL.yellow);
    label('SUSPICION', 160, 26, PAL.white, 6); mouseHead(80, 13, 4);
    if (s.msgT > 0) msgBox(s.msg, 46);   // up top: the phone pad lives at the bottom
    else if (s.t < 5) msgBox(isTouch && !Input.padActive ? 'STICK: SNEAK · HOLD E: WAVE LIKE A MASCOT' : `${Input.padActive ? 'STICK' : 'ARROWS'}: SNEAK · HOLD ${K('a').replace(/<[^>]+>/g, '')}: WAVE LIKE A MASCOT`, 46);
  },
  drawSolid(x, y, w, h, k, t, night) {
    switch (k) {
      case 'shops': { R(x, y, w, h, night ? '#c7a0b8' : '#f7c6d9'); for (let i = Math.floor(-y / 40) * 40; i < h && y + i < VH; i += 40) { const yy = y + i; OR(x === 0 ? 4 : x + 4, yy + 6, 14, 26, night ? '#ffe9a8' : PAL.waterL); R(x === 0 ? 2 : x + 2, yy + 2, 18, 4, ['#27c6b4', '#ff5ea8', '#ffd23f'][(i / 40) % 3 | 0]); } R(x === 0 ? w - 1 : x, y, 1, h, PAL.ink); return; }
      case 'castle': { OR(x, y - 30, w, h + 30, '#ffe79a'); for (let i = 0; i < w; i += 8) R(x + i, y - 34, 5, 4, '#ffe79a'); OR(x - 6, y - 50, 20, h + 50, '#fff0b8'); OR(x + w - 14, y - 50, 20, h + 50, '#fff0b8'); OR(x + w / 2 - 10, y + h - 22, 20, 22, '#7a4a2b'); mouseHead(x + w / 2, y - 44, 6); return; }
      case 'flowers': { OR(x, y, w, h, '#3e8f5a'); for (let i = 0; i < 14; i++) R(x + 3 + hash2(i, x) * (w - 6), y + 3 + hash2(x, i) * (h - 6), 2, 2, ['#ff5ea8', '#ffd23f', PAL.white][i % 3]); return; }
      case 'fountain': { g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2 + 1, h / 2 + 1, 0, 0, 7); g.fill(); g.fillStyle = '#e8e2d2'; g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 7); g.fill(); g.fillStyle = '#4fd0e8'; g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2 - 4, h / 2 - 4, 0, 0, 7); g.fill(); mouseHead(x + w / 2, y + h / 2 - 4, 4); for (let i = 0; i < 5; i++) { const q = (t * 1.3 + i / 5) % 1; R(x + w / 2 + Math.sin(i * 2) * q * 14, y + h / 2 - 12 + q * q * 16, 2, 2, '#d8f7f5'); } return; }
      case 'cart': { OR(x, y, w, h, PAL.white); R(x, y, w, 4, '#ff5ea8'); for (let i = 0; i < w; i += 5) R(x + i, y - 8, 5, 6, i % 10 ? PAL.white : '#ff5ea8'); label('CHURROS', x + w / 2, y + 13, '#ff5ea8', 4); return; }
      case 'planter': { OR(x, y, w, h, '#c9a36a'); R(x + 2, y + 2, w - 4, h - 8, '#3e8f5a'); for (let i = 0; i < w - 8; i += 7) R(x + 4 + i, y + 4, 3, 3, '#86c94a'); return; }
      case 'cups': { OR(x, y, w, h, '#b8e0f7'); for (let i = 0; i < 3; i++) { const a = t * 1.4 + i * 2.1, cx = x + w / 2 + Math.cos(a) * (w / 2 - 12), cyy = y + h / 2 + Math.sin(a) * (h / 2 - 8); OR(cx - 6, cyy - 5, 12, 8, ['#ff5ea8', '#ffd23f', '#b86bd6'][i]); } return; }
      case 'bench': { OR(x, y, w, 6, PAL.wood); OR(x, y + 8, w, 4, PAL.woodD); for (let i = 6; i < w; i += 24) R(x + i, y + 12, 3, 4, PAL.ink); return; }
      case 'wall': { R(x, y, w, h, '#f7c6d9'); R(x, y, w, 1, PAL.ink); for (let i = 0; i < w; i += 8) R(x + i, y - 4, 5, 4, '#f7c6d9'); return; }
    }
  },
};
