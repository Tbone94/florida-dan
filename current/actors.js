// FLORIDA DAN — everything that moves: Dan, the jon boat, the motorized cooler,
// gators, pythons, raccoons, pelicans, iguanas, cows, people.
'use strict';

// ---------- collision ----------
function canWalk(x, y) {
  for (const [ox, oy] of [[-4, 0], [4, 0], [0, -3], [0, 2]]) { const k = World.at(x + ox, y + oy); if (!WALKABLE(k) || World.solidAt(x + ox, y + oy)) return false; }
  for (const n of Game.npcs) if (n.solid !== false && Math.hypot(x - n.x, y - n.y) < 7) return false;
  return true;
}
function canBoat(x, y) { const air = hasUp('airboat') && Game.region === 'swamp'; for (const [ox, oy] of [[0, 0], [-8, 0], [8, 0], [0, -5], [0, 5]]) { const k = World.at(x + ox, y + oy); if (!BOATABLE(k) && !(air && k === T.SAWGRASS)) return false; } return true; }   // an airboat skims sawgrass
function canDrive(x, y) { for (const [ox, oy] of [[-6, 0], [6, 0], [0, -4], [0, 3]]) { const k = World.at(x + ox, y + oy); if (!DRIVABLE(k) || World.solidAt(x + ox, y + oy)) return false; } return true; }
const dirOf = (x, y) => Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up');

// ---------- Dan ----------
function moveDan(dt) {
  const D = Game.dan, F = Game.fx; let { x: ax, y: ay } = Input.axis();
  if (D.ride === 'car') return Car.tick(dt);
  if (D.hiding || D.ride === 'lambo' || D.anim === 'flop') { D.moving = false; return; }
  if (F.shroom > .4 && (ax || ay)) { ax = -ax * (Math.sin(Game.t * .3) > .6 ? 1 : -1); ay = ay; }    // left is right now. deal with it
  if (F.buzz > 55 && (ax || ay)) {
    const a = Math.atan2(ay, ax) + Math.sin(Game.t * 2.3) * (F.buzz - 55) / 45 * .9, m = Math.hypot(ax, ay);
    ax = Math.cos(a) * m; ay = Math.sin(a) * m;
  }
  D.moving = !!(ax || ay); D.idleT = D.moving ? 0 : (D.idleT || 0) + dt;
  if (!D.moving) { D.frame = 0; return; }
  D.dir = dirOf(ax, ay);
  D.stepT += dt; if (D.stepT > .16) { D.stepT = 0; D.frame ^= 1; }
  let sp = 56 * (F.powder > 0 ? 1.9 : 1) * (F.crash > 0 ? .55 : 1) * (F.high > 0 ? .85 : 1) * (Input.held('run') ? 1.35 : 1);
  if (D.ride === 'boat') {
    const air = hasUp('airboat'), k0 = World.at(D.x, D.y);
    sp = (air ? (k0 === T.SAWGRASS ? 70 : k0 === T.SHALLOW ? 84 : 116) : k0 === T.SHALLOW ? 42 : 78) * (F.powder > 0 ? 1.6 : 1) * (MIAMI() && hasUp('cigboat') ? 1.6 : 1);
    const nx = D.x + ax * sp * dt, ny = D.y + ay * sp * dt;
    if (canBoat(nx, D.y)) D.x = nx; if (canBoat(D.x, ny)) D.y = ny;
    Object.assign(Game.boat, { x: D.x, y: D.y, dir: D.dir });
    if (Math.random() < dt * 8) Game.parts.push({ kind: 'foam', x: D.x - ax * 14, y: D.y - ay * 8 + 3, vx: 0, vy: 0, life: .8 });
    if (Math.random() < dt * 5) Sound.play('engine');
  } else if (D.ride === 'cooler') {
    sp = (hasUp('boombox') ? 128 : 96) * (hasUp('nitro') && Input.held('run') ? 1.35 : 1) * (F.powder > 0 ? 1.5 : 1) * (World.at(D.x, D.y) === T.SAWGRASS ? .5 : 1);
    if (hasUp('boombox') && Math.random() < dt * 3) Game.parts.push({ kind: 'text', x: D.x + rnd(-8, 8), y: D.y - 18, vx: rnd(-8, 8), vy: -14, life: .9, text: '♪' });
    const nx = D.x + ax * sp * dt, ny = D.y + ay * sp * dt;
    if (canDrive(nx, D.y)) D.x = nx; else if (Math.abs(ax) > .5) bonk();
    if (canDrive(D.x, ny)) D.y = ny; else if (Math.abs(ay) > .5) bonk();
    Object.assign(Game.cooler, { x: D.x, y: D.y, dir: D.dir });
    if (Math.random() < dt * 9) Sound.play('engine');
    if (Math.random() < dt * 4) Game.parts.push({ kind: 'smoke', x: D.x - ax * 10, y: D.y - 2, vx: -ax * 10, vy: -6, life: .7 });
  } else {
    if (World.at(D.x, D.y) === T.SHALLOW) sp *= .5; else if (World.at(D.x, D.y) === T.SAWGRASS) sp *= .75;
    const nx = D.x + ax * sp * dt, ny = D.y + ay * sp * dt;
    if (canWalk(nx, D.y)) D.x = nx; if (canWalk(D.x, ny)) D.y = ny;
    if (Input.held('run') && Math.random() < dt * 9) Game.parts.push({ kind: 'dust', x: D.x - ax * 6, y: D.y, vx: -ax * 12, vy: -6, life: .45 });
    if (Game.fx.powder > 0 && Math.random() < dt * 20) Game.parts.push({ kind: 'speed', x: D.x - ax * 8, y: D.y - 8 + rnd(-6, 6), vx: -ax * 40, vy: -ay * 40, life: .25 });
  }
}
let bonkT = 0;
function bonk() { if (Game.t - bonkT < .8) return; bonkT = Game.t; Game.shake = 4; Sound.play('hurt'); toast(pick(['OW. Cooler’s fine though.', 'Who put that THERE?', 'Bonk.'])); }

function drawDan(x, y, t) {
  const D = Game.dan, F = Game.fx;
  if (D.hiding || D.ride === 'lambo' || D.ride === 'car' || (D.hurt > 0 && Math.floor(t * 20) % 2)) return;
  const spr = SPR[Game.flags.suit && MIAMI() ? 'dansuit' : 'dan'][D.dir][D.moving ? D.frame : 0];
  if (D.ride === 'boat') return drawBoat(x, y, Game.boat.dir, t, true);
  if (D.ride === 'cooler') return drawCooler(x, y, Game.cooler.dir, t, true);
  const wading = World.at(D.x, D.y) === T.SHALLOW;
  shadow(x, y + 1, 12);
  const bob = D.moving ? (D.frame ? -1 : 0) : Math.round(Math.sin(t * 2) * .5);
  if (D.anim === 'flop') {   // flat on his back, stars circling
    g.save(); g.translate(Math.round(x), Math.round(y - 5)); g.rotate(D.dir === 'left' ? Math.PI / 2 : -Math.PI / 2); g.drawImage(SPR.dan.down[0], -8, -11); g.restore();
    for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; R(x + Math.cos(a) * 8, y - 12 + Math.sin(a) * 3, 2, 2, PAL.yellow); }
    return;
  }
  const hop = D.anim === 'cheer' ? -Math.round(Math.abs(Math.sin((1.3 - D.animT) * Math.PI * 1.6)) * 8) : 0;   // two happy hops
  const idle = !D.moving && !D.anim ? Math.floor((D.idleT || 0) / 3.2) % 4 : 0, idleOn = (D.idleT || 0) > 6;
  if (hop) { shadow(x, y + 1, 12); g.drawImage(spr, Math.round(x - 8), Math.round(y - 21 + hop)); R(x - 9, y - 22 + hop, 2, 4, PAL.skin); R(x + 7, y - 22 + hop, 2, 4, PAL.skin); return; }
  if (idleOn && idle === 1) { const look = SPR[Game.flags.suit && MIAMI() ? 'dansuit' : 'dan'][Math.floor(t * .8) % 2 ? 'left' : 'right'][0]; shadow(x, y + 1, 12); g.drawImage(look, Math.round(x - 8), Math.round(y - 21 + bob)); return; }   // looks around
  if (wading) { g.drawImage(spr, 0, 0, 16, 16, Math.round(x - 8), Math.round(y - 15 + bob), 16, 16); R(x - 9, y, 18, 1, PAL.foam); }
  else g.drawImage(spr, Math.round(x - 8), Math.round(y - 21 + bob));
  const hx = D.dir === 'left' ? x - 9 : x + 6, hy = y - 11 + bob;
  const chugging = D.anim === 'beer' && D.animT < 1.1 && D.animT > .3;
  if ((D.anim === 'beer' && !chugging) || D.anim === 'energy') { OR(hx, hy - 4, 3, 5, D.anim === 'beer' ? PAL.blue : PAL.black); R(hx, hy - 4, 3, 1, PAL.tin); }
  if (D.anim === 'cig' || D.anim === 'joint') { R(D.dir === 'left' ? x - 7 : x + 3, y - 14 + bob, 4, 1, PAL.white); R(D.dir === 'left' ? x - 8 : x + 7, y - 14 + bob, 1, 1, PAL.orange); }
  if (D.anim === 'hotdog') { OR(hx - 1, hy - 2, 5, 2, PAL.redD); }
  if (chugging) { OR(hx, hy - 9, 3, 5, PAL.blue); R(hx, hy - 9, 3, 1, PAL.tin); if (Math.floor(t * 8) % 2) R(hx + (D.dir === 'left' ? -2 : 4), hy - 10, 1, 1, PAL.white); }   // chug: can up at the mouth
  if (idleOn && !D.moving && !D.anim) {
    if (idle === 0 && Math.floor(t * 6) % 2) R(x - 2, y - 9 + bob, 3, 2, PAL.skin);                            // belly scratch
    if (idle === 2) { R(x - 10, y - 23, 2, 5, PAL.skin); R(x + 8, y - 23, 2, 5, PAL.skin); }                  // big stretch
    if (idle === 3 && Math.floor(t * 2) % 2) label('z', x + 8, y - 26 - (t * 4) % 6, PAL.white, 6);          // dozing standing up
  }
  if (D.punchT > 0) {   // the fist
    const k = D.punchT / .18, reach = 5 + (1 - k) * 6, dx = D.dir === 'right' ? 1 : D.dir === 'left' ? -1 : 0, dy = D.dir === 'down' ? 1 : D.dir === 'up' ? -1 : 0;
    const fx = x + dx * reach - 2, fy = y - 12 + dy * reach * .6 - 1;
    OR(fx, fy, 4, 4, PAL.skin); if (k > .4) { R(fx - dx * 5, fy + 1, 3, 1, PAL.white); R(fx - dx * 4, fy + 3, 2, 1, PAL.white); }
  }
  if (F.powder > 0) { R(x - 3, y - 13 + bob, 1, 1, PAL.white); }   // "sinus medicine" residue
  if (hasUp('aviators') && D.dir !== 'up') R(x - 4, y - 16 + bob, 8, 1, PAL.yellow);   // gold aviators
  Detector.draw(x, y, t); drawTattoos(x, y, bob);
  if (D.carry) { const s = SPR.icons[D.carry]; if (s) g.drawImage(s, Math.round(x - 5), Math.round(y - 33 + bob)); }
}

function drawBoat(x, y, dir, t, withDan) {
  const bob = Math.sin(t * 2.2) * .8, horiz = dir === 'left' || dir === 'right';
  const w = horiz ? 32 : 16, h = horiz ? 14 : 30, bx = Math.round(x - w / 2), by = Math.round(y - h / 2 + bob);
  R(bx - 2, by + h - 1, w + 4, 2, PAL.foam);
  OR(bx, by, w, h, PAL.greyD); R(bx + 2, by + 2, w - 4, h - 4, PAL.grey); R(bx + 2, by + 2, w - 4, 2, PAL.tankD);
  if (horiz) { OR(bx + (dir === 'right' ? -4 : w), by + 3, 4, 7, PAL.ink); }
  else OR(bx + 5, by + (dir === 'down' ? -4 : h), 6, 4, PAL.ink);
  if (hasUp('airboat') && Game.region === 'swamp') {   // the fan cage, spinning, on the back
    const fx = horiz ? bx + (dir === 'right' ? 2 : w - 10) : bx + 4, fy = horiz ? by - 10 : by + (dir === 'down' ? 2 : h - 10);
    OR(fx, fy, 8, 12, PAL.greyD); R(fx + 1, fy + 1, 6, 10, PAL.ink); const a = t * 40; R(fx + 3 + Math.round(Math.cos(a) * 2), fy + 5 + Math.round(Math.sin(a) * 4), 2, 2, PAL.white);
  }
  label(hasUp('airboat') && Game.region === 'swamp' ? 'SS BUDGET II' : 'SS BUDGET', x, by + h + 7, PAL.white, 5);
  if (withDan) g.drawImage(SPR.dan[Game.dan.dir][0], 0, 0, 16, 14, Math.round(x - 8), Math.round(y - 16 + bob), 16, 14);
}
function drawCooler(x, y, dir, t, withDan) {
  const jig = withDan && Game.dan.moving ? Math.round(Math.sin(t * 40)) * .5 : 0;
  shadow(x, y + 3, 20, 5);
  OR(x - 10, y - 8 + jig, 20, 10, PAL.white); R(x - 10, y - 8 + jig, 20, 3, PAL.red); R(x - 3, y - 4 + jig, 6, 2, PAL.greyD);
  OR(x - 11, y + 1, 4, 4, PAL.ink); OR(x + 7, y + 1, 4, 4, PAL.ink);
  R(x - 8, y - 1 + jig, 3, 2, PAL.yellow); R(x + 5, y - 1 + jig, 3, 2, PAL.yellow);   // headlights. why does it have headlights
  if (hasUp('stripes')) { R(x - 2, y - 8 + jig, 2, 10, PAL.blue); R(x + 1, y - 8 + jig, 1, 10, PAL.white); }
  if (withDan) g.drawImage(SPR.dan[Game.dan.dir][0], 0, 0, 16, 16, Math.round(x - 8), Math.round(y - 24 + jig), 16, 16);
}

// ---------- gators ----------
function makeGator(x, y, chuck) { return { type: 'gator', x, y, hx: x, hy: y, dir: 'right', state: 'wander', lurk: true, tx: x, ty: y, timer: 0, chomp: 0, cd: 2, stun: 0, seed: Math.random(), chuck }; }
let gatorOK;
function gatorMap() {
  gatorOK = new Uint8Array(MW * MH);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const k = World.tile(x, y);
    if (WET(k)) { gatorOK[y * MW + x] = 1; continue; }
    if (k === T.DOCK || k === T.ROAD || k === T.CONCRETE) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (WET(World.tile(x + dx, y + dy))) gatorOK[y * MW + x] = 1;
  }
}
const gatorCan = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return tx >= 0 && ty >= 0 && tx < MW && ty < MH && gatorOK[ty * MW + tx] && !World.solidAt(x, y); };

function updateGator(gt, dt) {
  const D = Game.dan, dx = D.x - gt.x, dy = D.y - gt.y, dist = Math.hypot(dx, dy);
  gt.cd -= dt; gt.chomp -= dt; gt.timer -= dt; gt.stun -= dt;
  if (gt.belly > 0) { gt.belly -= dt; gt.lurk = false; return; }   // lying belly-up, thinking about its choices
  if (gt.stun > 0) { gt.lurk = false; return; }
  const range = gt.chuck ? 110 : 76, active = Game.mode === 'play';
  if (gt.state === 'flee') { if (gt.timer <= 0) gt.state = 'wander'; }
  else if (active && gt.cd <= 0 && (Game.gatorCalm || 0) <= 0 && dist < range && gatorCan(D.x, D.y + 2) && (gt.chaseT || 0) < 7) {
    if (gt.state !== 'chase') { if (gt.chuck && !Game.day_.chuckSeen) { Game.day_.chuckSeen = true; toast("Oh hell no. It's CHUCK."); } }
    gt.state = 'chase';
  } else if (gt.state === 'chase') gt.state = 'wander';
  gt.chaseT = gt.state === 'chase' ? (gt.chaseT || 0) + dt : 0;
  if (gt.chaseT >= 7) { gt.state = 'wander'; gt.cd = 10; gt.chaseT = 0; }   // gave up; it's hot out
  let vx = 0, vy = 0, sp = 0;
  if (gt.state === 'chase') { vx = dx / dist; vy = dy / dist; sp = (gt.chuck ? 46 : 38) * (Game.fx.high > 0 ? .6 : 1); }
  else if (gt.state === 'flee') { vx = -dx / (dist || 1); vy = -dy / (dist || 1); sp = 60; }
  else {
    if (gt.timer <= 0 || Math.hypot(gt.tx - gt.x, gt.ty - gt.y) < 4) { gt.timer = rnd(3, 7); const a = rnd(0, 6.28), r = rnd(20, 70); gt.tx = gt.hx + Math.cos(a) * r; gt.ty = gt.hy + Math.sin(a) * r; }
    const ex = gt.tx - gt.x, ey = gt.ty - gt.y, ed = Math.hypot(ex, ey) || 1; vx = ex / ed; vy = ey / ed; sp = 11;
  }
  const nx = gt.x + vx * sp * dt, ny = gt.y + vy * sp * dt;
  if (gatorCan(nx, gt.y)) gt.x = nx; else gt.tx = gt.x;
  if (gatorCan(gt.x, ny)) gt.y = ny; else gt.ty = gt.y;
  if (sp) gt.dir = dirOf(vx, vy);
  gt.lurk = gt.state === 'wander' && WET(World.at(gt.x, gt.y)) && World.at(gt.x, gt.y) !== T.SHALLOW;
  if (gt.state === 'chase' && dist < (gt.chuck ? 14 : 11) && gt.cd <= 0 && active && D.hurt <= 0) gatorBite(gt, dx, dy, dist);
}
function gatorBite(gt, dx, dy, dist) {
  if (Math.random() < .5) Look.mark('flip', Game.dan.x + rnd(-6, 6), Game.dan.y + 4);   // he lost a flip-flop
  gt.chomp = .45; gt.cd = hasUp('tooth') ? 24 : 14; gt.state = 'wander'; Game.gatorCalm = 6;   // after a bite every gator gives Dan a moment
  knockback(dx / dist, dy / dist, hasUp('waders') ? 12 : 22);
  Sound.play('chomp'); hurtDan(hasUp('waders') ? 7 : 15); react('flop');
  Game.day_.bites++;
  let msg = pick(['OW! SON OF A BITCH!', 'HE BIT MY ASS! MY ACTUAL ASS!', "That's my good leg, you scaly f*ck!", 'NOT THE JORTS!', 'Mother of GOD that hurts!']);
  if (Game.inv.beer > 0 && Math.random() < .5) { Game.inv.beer--; msg = `${gt.chuck ? 'Chuck' : 'Gator'} stole a Swamp Lite. Rude as hell.`; }
  else if (Game.inv.fish > 0 && Math.random() < .5) { Game.inv.fish--; Game.catchBag.pop(); msg = `${gt.chuck ? 'Chuck' : 'A gator'} ate one of your fish. Outta the BAG.`; }
  toast(msg);
  if (Game.day_.bites === 3) headline('FLORIDA MAN BITTEN BY GATORS THREE TIMES IN ONE DAY, SAYS HE "HAD IT HANDLED"', 6);
}
function knockback(nx, ny, d) {
  const D = Game.dan;
  for (let i = d; i > 0; i -= 3) { const x = D.x + nx * i, y = D.y + ny * i; if (D.ride === 'boat' ? canBoat(x, y) : D.ride === 'cooler' ? canDrive(x, y) : canWalk(x, y)) { D.x = x; D.y = y; break; } }
  if (D.ride === 'boat') Object.assign(Game.boat, { x: D.x, y: D.y }); if (D.ride === 'cooler') Object.assign(Game.cooler, { x: D.x, y: D.y });
}
// big body reactions: 'cheer' (jump, arms up, confetti) and 'flop' (flat on his back, seeing stars)
function react(kind) {
  const D = Game.dan; if (D.ride) return;
  D.anim = kind; D.animT = kind === 'flop' ? .9 : 1.3; D.idleT = 0;
  if (kind === 'cheer') for (let i = 0; i < 14; i++) Game.parts.push({ kind: 'confetti', x: D.x, y: D.y - 22, vx: rnd(-40, 40), vy: rnd(-70, -30), life: rnd(.8, 1.3), c: pick([PAL.hat, PAL.yellow, PAL.teal, PAL.white]) });
}
function hurtDan(n) { Game.dan.hurt = .7; Game.shake = 5; Game.chill = Math.max(0, Game.chill - n); splash(Game.dan.x, Game.dan.y, 6); }

function drawGator(gt, cx, cy, t) {
  const big = gt.chuck ? 1.4 : 1, d = gt.dir, x0 = Math.round(gt.x - cx), y0 = Math.round(gt.y - cy);
  const parts = [];
  const put = (u, v, lu, lv, c) => parts.push([u * big, v * big, lu * big, lv * big, c]);
  const sw = Math.sin(t * (gt.state === 'chase' ? 12 : 4) + gt.seed * 7);
  if (gt.belly > 0) {   // belly-up: pale tummy, legs in the air, eyes xx'd
    const wig = Math.sin(t * 22) * 1.2;
    put(-18, -1.5, 12, 3, PAL.gator); put(-8, -5, 16, 10, PAL.belly); for (let i = -6; i < 8; i += 3) put(i, -4, 1, 8, PAL.sandD);
    put(8, -4, 12, 8, PAL.belly); put(-5, -9 + wig, 3, 4, PAL.gatorD); put(3, -9 - wig, 3, 4, PAL.gatorD); put(-5, 5 - wig, 3, 4, PAL.gatorD); put(3, 5 + wig, 3, 4, PAL.gatorD);
    put(12, -3, 1, 1, PAL.ink); put(13, -2, 1, 1, PAL.ink); put(12, 2, 1, 1, PAL.ink); put(13, 1, 1, 1, PAL.ink);
  } else if (gt.lurk) {
    put(-10, -1.5, 14, 3, PAL.gatorD); for (let i = -8; i < 4; i += 3) put(i, -1.5, 1, 1, PAL.gatorL);
    put(8, -3, 3, 2, PAL.gatorD); put(8, 1, 3, 2, PAL.gatorD); put(9, -3, 1, 1, PAL.yellow); put(9, 2, 1, 1, PAL.yellow);
    put(12, -1.5, 6, 3, PAL.gatorD);
  } else {
    for (let i = 0; i < 4; i++) put(-20 + i * 4, -1.5 - (3 - i) * .3 + sw * (4 - i) * .5, 5, 2.5 + i * .8, PAL.gator);
    const leg = Math.sin(t * 14) * (gt.state === 'chase' ? 1.6 : .5);
    put(-5 + leg, -7, 3, 3, PAL.gatorD); put(-5 - leg, 5, 3, 3, PAL.gatorD); put(4 - leg, -7, 3, 3, PAL.gatorD); put(4 + leg, 5, 3, 3, PAL.gatorD);
    put(-8, -5, 16, 10, PAL.gator); put(-6, -4, 12, 1, PAL.gatorL);
    for (let i = -6; i < 7; i += 3) { put(i, -2, 2, 1, PAL.gatorD); put(i, 1, 2, 1, PAL.gatorD); }
    put(8, -4, 7, 8, PAL.gator);
    if (gt.chomp > 0) { put(15, -5, 8, 3, PAL.gator); put(15, 2, 8, 3, PAL.gator); put(15, -2, 7, 4, PAL.red); put(16, -2, 1, 1, PAL.white); put(18, 1, 1, 1, PAL.white); }
    else { put(15, -3, 8, 6, PAL.gator); put(16, -1, 7, 1, PAL.gatorD); put(22, -3, 1, 1, PAL.white); put(22, 2, 1, 1, PAL.white); }
    put(9, -5, 2, 2, PAL.yellow); put(9, 3, 2, 2, PAL.yellow); put(10, -5, 1, 1, PAL.black); put(10, 3, 1, 1, PAL.black);
    if (gt.chuck) { put(-1, -7, 6, 3, PAL.hat); put(4, -6, 2, 1, PAL.hatD); }   // Chuck wears a pink visor. nobody knows why
    if (gt.stun > 0) label('✶ ✶', 0 + x0, y0 - 14, PAL.yellow, 6);
  }
  const map = ([u, v, lu, lv]) => d === 'right' ? [x0 + u, y0 + v, lu, lv] : d === 'left' ? [x0 - u - lu, y0 + v, lu, lv] : d === 'down' ? [x0 + v, y0 + u, lv, lu] : [x0 + v, y0 - u - lu, lv, lu];
  if (!gt.lurk) shadow(x0, y0 + 6 * big, 26 * big, 6);
  for (const p of parts) { const [x, y, w, h] = map(p); R(x - 1, y - 1, w + 2, h + 2, PAL.ink); }
  for (const p of parts) { const [x, y, w, h] = map(p); R(x, y, w, h, p[4]); }
  if (gt.chuck && !gt.lurk) label('CHUCK', x0, y0 - 16, PAL.hat, 6);
}

// ---------- pythons (the Glades) ----------
function makePython(x, y) { const segs = []; for (let i = 0; i < 16; i++) segs.push({ x: x - i * 2.5, y }); return { type: 'python', x, y, a: rnd(0, 6.28), segs, len: +(rnd(8, 17)).toFixed(1), state: 'wander', timer: 0, stun: 0 }; }
function updatePython(p, dt) {
  const D = Game.dan, dist = Math.hypot(D.x - p.x, D.y - p.y);
  p.timer -= dt; p.stun -= dt;
  if (p.stun > 0 || p.state === 'bagged') return;
  if (dist < 50 && p.state !== 'flee') { p.state = 'flee'; p.timer = 2.5; }
  if (p.timer <= 0) { p.state = 'wander'; p.timer = rnd(1, 3); p.a += rnd(-1.5, 1.5); }
  if (p.state === 'flee') p.a = Math.atan2(p.y - D.y, p.x - D.x) + Math.sin(Game.t * 3) * .5;
  const sp = p.state === 'flee' ? 30 : 12, nx = p.x + Math.cos(p.a) * sp * dt, ny = p.y + Math.sin(p.a) * sp * dt;
  if (World.region(nx, ny) === 'glades' && WALKABLE(World.at(nx, ny))) { p.x = nx; p.y = ny; } else p.a += 2;
  p.segs[0].x = p.x + Math.cos(Game.t * 6 + p.len) * 1.2; p.segs[0].y = p.y;
  for (let i = 1; i < p.segs.length; i++) { const a = p.segs[i - 1], b = p.segs[i], d = Math.hypot(a.x - b.x, a.y - b.y); if (d > 2.5) { b.x = a.x + (b.x - a.x) / d * 2.5; b.y = a.y + (b.y - a.y) / d * 2.5; } }
}
function drawPython(p, cx, cy) {
  if (p.state === 'bagged') return;
  for (let pass = 0; pass < 2; pass++) for (let i = p.segs.length - 1; i >= 0; i--) {
    const s = p.segs[i], r = i === 0 ? 5 : Math.max(2, 4.5 - i * .15), x = s.x - cx, y = s.y - cy;
    if (pass === 0) R(x - r / 2 - 1, y - r / 2 - 1, r + 2, r + 2, PAL.ink);
    else { R(x - r / 2, y - r / 2, r, r, i % 3 === 0 ? PAL.brown : PAL.tan); if (i === 0) { R(x + 1, y - 2, 1, 1, PAL.black); } }
  }
  if (p.stun > 0) label('✶', p.x - cx, p.y - cy - 8, PAL.yellow, 7);
}

// ---------- critters: raccoons, pelicans, iguanas, cows ----------
function makeCritter(type, x, y, extra = {}) { return { type, x, y, hx: x, hy: y, vx: 0, vy: 0, timer: 0, state: 'wander', flip: false, stun: 0, z: 0, ...extra }; }
function updateCritter(c, dt) {
  const D = Game.dan, dx = D.x - c.x, dy = D.y - c.y, dist = Math.hypot(dx, dy);
  c.timer -= dt; c.stun -= dt;
  if (c.stun > 0) return;
  if (c.type === 'raccoon' && c.pet) {                      // Trash Baby follows Dan, judges him silently
    if (Game.flags.tbStay) {                                  // ...unless she's been told to stay: potter around her spot
      if (c.hx === undefined) { c.hx = c.x; c.hy = c.y; }
      const hx = c.hx - c.x, hy = c.hy - c.y, hd = Math.hypot(hx, hy);
      if (hd > 3) { const sp = hd > 60 ? 70 : 30; c.x += hx / hd * sp * dt; c.y += hy / hd * sp * dt; c.flip = hx < 0; c.moving = true; } else c.moving = false;
      return;
    }
    if (dist > 22) { c.x += dx / dist * Math.min(dist * 3, 70) * dt; c.y += dy / dist * Math.min(dist * 3, 70) * dt; c.flip = dx < 0; c.moving = true; } else c.moving = false;
    return;
  }
  if (c.type === 'iguana' && c.falling) { c.z -= c.vz * dt; c.vz += 260 * dt; if (c.z <= 0) { c.z = 0; c.falling = false; c.stun = 5; Sound.play('chomp'); if (dist < 12) { hurtDan(6); toast(pick(['AN IGUANA JUST FELL ON MY HEAD.', 'Frozen iguana to the dome. Classic Tuesday.', 'It’s raining lizards, Brenda!'])); Game.day_.iguanaHits++; if (Game.day_.iguanaHits === 1) headline('FLORIDA MAN STRUCK BY FROZEN IGUANA, CALLS IT "A SIGN FROM GOD"', 4); } } return; }
  c.cd = (c.cd || 0) - dt;
  const loot = !hasUp('fanny') && ['hotdog', 'beer', 'cig', 'scratch'].some(i => Game.inv[i] > 0);   // the fanny pack: zipped
  if (c.type === 'raccoon' && !c.pet && c.state !== 'flee' && c.state !== 'steal' && dist < 60 && loot && c.cd <= 0 && (Game.raccoonCd || 0) <= 0 && Game.mode === 'play') { c.state = 'steal'; Game.raccoonCd = 25; }   // one bandit at a time, ~25s apart
  if (c.type === 'pelican' && Game.inv.fish > 0 && dist < 90 && c.state !== 'flee') c.state = 'steal';
  if (c.state === 'steal') {
    c.x += dx / (dist || 1) * 44 * dt; c.y += dy / (dist || 1) * 44 * dt; c.flip = dx < 0;
    if (dist < 10) {
      c.state = 'flee'; c.timer = 6; if (c.type === 'raccoon') c.cd = 60;
      if (c.type === 'pelican' && Game.inv.fish > 0) { Game.inv.fish--; const f = Game.catchBag.pop(); toast(`A pelican just swallowed your ${f ? f.name.toLowerCase() : 'fish'} WHOLE. Fly away, you beaky bastard.`); Game.day_.pelican++; headline('PELICAN STEALS FLORIDA MAN’S FISH, FLIES OFF "LAUGHING"', 3); }
      else if (c.type === 'raccoon') { const k = ['hotdog', 'beer', 'cig', 'scratch'].find(i => Game.inv[i] > 0); if (k) { Game.inv[k]--; toast(`Raccoon snatched your ${ITEMS[k].name.toLowerCase()} and ran. Little bandit.`); headline('RACCOON ROBS FLORIDA MAN IN BROAD DAYLIGHT; POLICE "NOT INVOLVED"', 3); } }
    }
    return;
  }
  if (c.state === 'flee') { c.x -= dx / (dist || 1) * 60 * dt; c.y -= dy / (dist || 1) * 60 * dt; c.flip = dx > 0; if (c.timer <= 0) { c.state = 'wander'; c.hx = c.x; c.hy = c.y; } return; }
  if (c.timer <= 0) { c.timer = rnd(2, 5); const a = rnd(0, 6.28), s = c.type === 'cow' ? 5 : 10; c.vx = Math.cos(a) * s; c.vy = Math.sin(a) * s; if (Math.random() < .3) c.vx = c.vy = 0; }
  const nx = c.x + c.vx * dt, ny = c.y + c.vy * dt;
  const okT = c.type === 'pelican' ? true : c.type === 'cow' ? World.region(nx, ny) === 'pasture' && !World.solidAt(nx, ny) : WALKABLE(World.at(nx, ny)) && !World.solidAt(nx, ny);
  if (okT && Math.hypot(nx - c.hx, ny - c.hy) < 90) { c.x = nx; c.y = ny; if (c.vx) c.flip = c.vx < 0; } else c.timer = 0;
  c.moving = !!(c.vx || c.vy);
  if (c.type === 'cow' && Math.random() < dt * .04) { Sound.tone(110, .5, 'sawtooth', .05, -30); c.moo = 1.2; }
  c.moo = (c.moo || 0) - dt;
}
function drawCritter(c, cx, cy, t) {
  const x = Math.round(c.x - cx), y = Math.round(c.y - cy), s = SPR[c.type + (c.flip ? 'L' : '')];
  if (!s) return;
  if (c.type === 'skunkape') {   // big boy, drawn at 1.6x with a glow when it's dark
    const w = s.width * 1.6, h = s.height * 1.6, bob = c.state === 'run' ? Math.round(Math.sin(t * 16)) : 0;
    shadow(x, y + 1, 22, 5); g.drawImage(s, Math.round(x - w / 2), Math.round(y - h + bob), w, h);
    if (Game.hour >= 19) { g.globalAlpha = .5 + Math.sin(t * 3) * .2; R(x - 5, y - h + 7, 3, 2, '#fff7b0'); R(x + 2, y - h + 7, 3, 2, '#fff7b0'); g.globalAlpha = 1; }
    if (Game.flags.apeFriend) label('GARY', x, y - h - 3, PAL.yellow, 7);
    return;
  }
  if (c.type === 'pelican' && c.state !== 'wander') { const f = Math.sin(t * 14) > 0; shadow(x, y + 8, 12, 3); g.drawImage(s, x - 7, y - 26 + (f ? -2 : 0)); return; }
  shadow(x, y + 1, s.width);
  const hop = c.moving ? (Math.floor(t * 8) % 2) : 0;
  g.drawImage(s, x - (s.width >> 1), y - s.height - c.z + hop);
  if (c.stun > 0 && c.type !== 'iguana') label('✶', x, y - s.height - 4, PAL.yellow, 7);
  if (c.type === 'cow' && c.moo > 0) label('MOO', x + 6, y - 14, PAL.white, 6);
  if (c.pet && Game.tbFace === c && Game.mode === 'play') {   // an E bubble over his head when you're looking at him
    const by = y - s.height - 14 + Math.round(Math.sin(t * 5)); OR(x - 6, by - 6, 12, 11, PAL.ink); R(x - 1, by + 5, 3, 2, PAL.ink); label(Input.padActive ? 'A' : 'E', x + .5, by + 3, PAL.yellow, 7);
  } else if (c.pet) label('TRASH BABY', x, y - s.height - 4, PAL.grey, 5);
  if (c.tag) label(c.tag, x, y - s.height - 6, PAL.yellow, 5);
}

// ---------- people ----------
function makeNPC(id, name, x, y, dir = 'down', extra = {}) { return { id, name, sprite: id, x, y, hx: x, hy: y, dir, frame: 0, t: 0, wander: 0, ...extra }; }
function updateNPC(n, dt) {
  n.t += dt;
  if (n.follow) {   // a tourist tagging along to see a gator
    const D = Game.dan, dx = D.x - n.x, dy = D.y - n.y, d = Math.hypot(dx, dy);
    n.moving = d > 26; if (n.moving) { n.x += dx / d * Math.min(80, d * 2) * dt; n.y += dy / d * Math.min(80, d * 2) * dt; n.dir = dirOf(dx, dy); if (Math.floor(n.t * 6) % 2 !== n.frame) n.frame ^= 1; }
    return;
  }
  const D = Game.dan, dist = Math.hypot(D.x - n.x, D.y - n.y);
  if (dist < 40) { n.dir = dirOf(D.x - n.x, D.y - n.y); n.moving = false; return; }
  if (!n.wander) return;
  n.wt = (n.wt || 0) - dt;
  if (n.wt <= 0) { n.wt = rnd(1.5, 4); const a = rnd(0, 6.28); n.vx = Math.random() < .4 ? 0 : Math.cos(a) * 14; n.vy = Math.random() < .4 ? 0 : Math.sin(a) * 14; }
  const nx = n.x + n.vx * dt, ny = n.y + n.vy * dt;
  if (Math.hypot(nx - n.hx, ny - n.hy) < n.wander && WALKABLE(World.at(nx, ny)) && !World.solidAt(nx, ny)) { n.x = nx; n.y = ny; n.moving = !!(n.vx || n.vy); if (n.moving) n.dir = dirOf(n.vx, n.vy); } else n.wt = 0;
  if (n.moving && Math.floor(n.t * 6) % 2 !== n.frame) n.frame ^= 1;
}
function drawNPC(n, cx, cy, t) {
  if (n.hidden) return;
  const x = Math.round(n.x - cx), y = Math.round(n.y - cy), s = SPR[n.sprite][n.dir][n.moving ? n.frame : 0];
  shadow(x, y + 1, 12); g.drawImage(s, x - 8, y - 21 + (n.moving ? 0 : Math.round(Math.sin(t * 2 + n.x) * .5)));
  if (Scene.on()) { } else if (n.quest) { const b = Math.sin(t * 5) * 2; label('!', x, y - 26 + b, PAL.yellow, 10); } else if (Game.mode === 'play' && Arcs.offering(n)) { const b = Math.sin(t * 4 + 1) * 2; label('!', x, y - 26 + b, PAL.hat, 10); } else drawGigBubble(n, x, y, t);
  if (n.id === 'rhonda') R(x - 5, y - 17, 10, 1, PAL.shades);
}
