// FLORIDA DAN — SPACE SQUEAK MOUNTAIN. An on-rails coaster in the dark (Orlando, Case 11). Side view: the car
// climbs, drops, hills, a space tunnel, the ride-photo flash, the brakes. HOLD E on the drops to brace; ride a drop
// loose and NAUSEA jumps. Beer makes it way worse, a joint makes it chill. Max nausea = Dan barfs (the ride photo is
// ruined, ride again). Can't steer: it's a roller coaster, Dan. Mode 'coaster', 320x180 stage.
'use strict';
const COASTER_LEN = 3000;
// the track: [distance, height] (height in px from the top of the stage), smoothed between points
const COASTER_PTS = [[0, 140], [180, 140], [240, 132], [620, 34], [700, 28], [760, 36], [940, 162], [1020, 150], [1120, 96], [1200, 90], [1300, 150], [1360, 154],
  [1450, 110], [1520, 106], [1620, 160], [1700, 120], [1780, 124], [1860, 150], [1960, 70], [2040, 66], [2120, 80], [2300, 164], [2420, 150], [2480, 146], [2800, 146], [3000, 146]];
const COASTER_FLASH = 2200;   // the ride photo, halfway down the last drop
function coasterY(d) {
  const P = COASTER_PTS; if (d <= 0) return P[0][1]; if (d >= COASTER_LEN) return P[P.length - 1][1];
  let i = 0; while (i < P.length - 2 && d > P[i + 1][0]) i++;
  const [d0, y0] = P[i], [d1, y1] = P[i + 1], k = (d - d0) / (d1 - d0); return y0 + (y1 - y0) * sEase(k);
}
const Coaster = {
  s: null,
  start(o = {}) {
    this.s = { d: 20, v: 40, t: 0, sick: 0, brace: false, then: o.then, msg: '', msgT: 0, done: 0, barf: false, photo: null, flashT: 0, scream: 0, stars: [] };
    for (let i = 0; i < 70; i++) this.s.stars.push([Math.random() * 900, Math.random() * 180, Math.random() < .2 ? 2 : 1, Math.random() * .5 + .2]);
    Game.mode = 'coaster'; showHud(false); padFor(true); Sound.play('headline');
    this.say(`KEEP YOUR ARMS IN. HOLD ${K('a').replace(/<[^>]+>/g, '')} ON THE DROPS.`, 3);
  },
  say(m, t = 1.6) { this.s.msg = m; this.s.msgT = t; },
  slope(d) { return (coasterY(d + 6) - coasterY(d - 6)) / 12; },   // + = going down
  update(dt) {
    const s = this.s; if (!s) { Game.mode = 'play'; return; }
    s.t += dt; s.msgT -= dt; s.flashT -= dt;
    if (s.done) { s.done += dt; if (s.done > 1.6) this.finish(); return; }
    const F = Game.fx, sl = this.slope(s.d), lift = s.d > 200 && s.d < 690;
    s.brace = Input.held('a');
    // physics-ish: gravity on the slopes, a chain on the lift hill, brakes at the end
    if (lift) s.v = 58; else s.v = clamp(s.v + sl * 260 * dt - 6 * dt, 34, 330);
    if (s.d > 2420) s.v = Math.max(70, s.v - 240 * dt);
    s.d += s.v * dt;
    // the stomach
    const drop = sl > .45 && s.v > 90, buzz = 1 + F.buzz / 45, chill = F.high > 0 ? .5 : 1;
    if (drop) { s.sick += (s.brace ? .05 : .55) * buzz * chill * dt * (s.v / 150); s.scream = .4; }
    else s.sick = Math.max(0, s.sick - (s.brace ? .02 : .09) * dt);
    if (F.buzz > 40) s.sick += .012 * (F.buzz - 40) / 40 * dt * (s.v / 100);   // beer sloshes even on the flat bits
    s.scream = Math.max(0, s.scream - dt);
    // warnings a beat before each big drop
    const ahead = this.slope(s.d + s.v * .7); if (ahead > .5 && sl < .3 && s.msgT <= 0) this.say(pick(['DROP!', 'HERE IT COMES!', 'HOLD ON!']), .8);
    if (!s.photo && s.d >= COASTER_FLASH) { s.photo = { sick: s.sick, brace: s.brace }; s.flashT = .35; Game.flash = .6; Sound.play('pickup'); this.say('*FLASH* RIDE PHOTO!', 1.2); }
    if (s.sick >= 1 && !s.barf) { s.barf = true; Game.shake = 8; Sound.play('fail'); this.say(pick(['DAN BARFS. ON THE BIG DROP. ON EVERYONE.', 'OH NO. OH NO NO NO. (He barfed.)']), 2.4); Game.day_.coasterBarf = true; if (!Game.flags.barfHl) { Game.flags.barfHl = true; headline('FLORIDA MAN BARFS ON SPACE SQUEAK MOUNTAIN; ROW TWO "WILL NEVER BE THE SAME"', 4); } }
    if (Math.random() < dt * (s.v / 60)) Sound.play('engine');
    if (s.d >= 2680) { s.done = .01; if (!s.barf) Sound.play('catch'); }
  },
  finish() {
    const s = this.s; this.s = null; Game.mode = 'play'; showHud(true); padFor(false);
    Game.flags.coasterRides = (Game.flags.coasterRides || 0) + 1;
    if (s.then) s.then({ barf: s.barf, photo: s.photo });
  },
  draw() {
    const s = this.s; if (!s) return; const t = Game.t, cx = s.d - 110;
    // space, inside a mountain: navy, stars, a planet
    R(0, 0, VW, VH, '#0e0b24'); for (const [x, y, z, p] of s.stars) { const sx = ((x - cx * p) % 900 + 900) % 900 - 290; if (sx > -2 && sx < VW) R(sx, y, z, z, Math.floor(t * 3 + x) % 9 ? '#d8d4ff' : '#ffd23f'); }
    const px = 240 - (cx * .05) % 500; g.fillStyle = '#b86bd6'; g.beginPath(); g.arc(px, 50, 22, 0, 7); g.fill(); g.fillStyle = '#d99bf0'; g.beginPath(); g.arc(px - 6, 44, 9, 0, 7); g.fill(); R(px - 34, 50, 68, 2, '#ff9ec7');
    // the track: supports, ties, a neon rail
    for (let sx = -((cx % 24) + 24) % 24; sx < VW + 24; sx += 24) { const y = coasterY(cx + sx); R(sx, y + 4, 2, VH - y, '#3b2f4a'); }
    g.strokeStyle = PAL.ink; g.lineWidth = 5; g.beginPath(); for (let sx = -4; sx <= VW + 4; sx += 4) g.lineTo(sx, coasterY(cx + sx) + 1); g.stroke();
    g.strokeStyle = '#27c6b4'; g.lineWidth = 2; g.beginPath(); for (let sx = -4; sx <= VW + 4; sx += 4) g.lineTo(sx, coasterY(cx + sx)); g.stroke();
    for (let sx = -((cx % 10) + 10) % 10; sx < VW; sx += 10) R(sx, coasterY(cx + sx) + 2, 2, 2, '#ff5ea8');
    // the photo camera on its pole
    const fx = COASTER_FLASH - cx; if (fx > -20 && fx < VW + 20) { const fy = coasterY(COASTER_FLASH) - 34; R(fx, fy, 2, 20, PAL.grey); OR(fx - 5, fy - 6, 12, 7, PAL.greyD); R(fx + 5, fy - 4, 2, 3, s.flashT > 0 ? PAL.white : PAL.yellow); if (s.flashT > 0) { g.globalAlpha = .5; R(0, 0, VW, VH, PAL.white); g.globalAlpha = 1; } }
    // the car: Dan up front, Wendell Cheddarton (CEO, Squeaky Corp) right behind him
    const x = 110, y = coasterY(s.d), a = Math.atan(this.slope(s.d)) * .9;
    g.save(); g.translate(x, y - 2); g.rotate(a);
    const up = s.brace ? -2 : 0; g.drawImage(SPR.cheddarton.right[0], 0, 0, 16, 14, -20, -14 + (s.scream > 0 ? -2 : 0), 16, 14); g.drawImage(SPR.dan.right[0], 0, 0, 16, 14, -2, -14 + up, 16, 14);
    if (s.sick > .6) R(8, -8, 4, 2, '#86c94a');
    if (!s.brace && s.scream > 0) { R(0, -18, 2, 5, PAL.skin); R(10, -18, 2, 5, PAL.skin); }   // arms up
    OR(-24, -4, 44, 8, '#e0433a'); R(-24, -4, 44, 2, '#ff8a8a'); R(16, -2, 4, 3, PAL.yellow); R(-22, 4, 4, 3, PAL.ink); R(10, 4, 4, 3, PAL.ink);
    g.restore();
    if (s.scream > 0) { label(s.brace ? 'AAAAA' : 'AAAAAAAA!!', x + 6, y - 28, PAL.yellow, 6); if (Math.floor(t * 4) % 2) label('WOOO! FLORIDA!', x - 30, y - 40, '#ff9ec7', 5); }
    if (s.barf && s.done < .8) for (let i = 0; i < 6; i++) R(x + 14 + i * 3, y - 6 + ((t * 60 + i * 7) % 20), 2, 2, '#86c94a');
    // HUD: the stomach
    const k = clamp(s.sick, 0, 1); OR(92, 8, 136, 8, PAL.inkL); R(92, 8, 136 * k, 8, k > .7 && Math.floor(t * 8) % 2 ? PAL.red : k > .4 ? '#b6d84a' : '#86c94a');
    label('NAUSEA', 160, 26, PAL.white, 6); label('SPACE SQUEAK MOUNTAIN', 160, 176, '#27c6b4', 5);
    if (s.msgT > 0) msgBox(s.msg, 60);
  },
};
