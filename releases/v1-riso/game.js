// Florida Dan — the day: input, Dan, the jon boat, gators, vices, Merle, HUD, main loop.
'use strict';
const $ = id => document.getElementById(id);
const buf = document.createElement('canvas'); buf.width = VW; buf.height = VH;
g = buf.getContext('2d'); g.imageSmoothingEnabled = false;
const screen = $('screen'), stage = $('stage');
const pick = a => a[Math.floor(Math.random() * a.length)];

// ---------- input ----------
const keys = new Set(), hit = new Set();
const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyE: 'a', Space: 'a', Enter: 'a', KeyQ: 'b', ShiftLeft: 'b', ShiftRight: 'b', Digit1: 'beer', Digit2: 'cig', Digit3: 'joint' };
addEventListener('keydown', e => { const k = KEYMAP[e.code]; if (!k || e.target.tagName === 'BUTTON' && k === 'a' && S.mode === 'title') return; e.preventDefault(); if (!keys.has(k)) hit.add(k); keys.add(k); });
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys.delete(k); });
addEventListener('blur', () => keys.clear());
const held = k => keys.has(k), tapped = k => hit.has(k);

const stick = { active: false, x: 0, y: 0, id: null }, stEl = $('stick'), nub = $('nub');
function moveStick(e) {
  const r = stEl.getBoundingClientRect();
  let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
  const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
  stick.x = Math.abs(x) < .2 ? 0 : x; stick.y = Math.abs(y) < .2 ? 0 : y;
  nub.style.transform = `translate(${x * 38}px,${y * 38}px)`;
}
stEl.addEventListener('pointerdown', e => { stick.active = true; stick.id = e.pointerId; stEl.setPointerCapture(e.pointerId); moveStick(e); });
stEl.addEventListener('pointermove', e => { if (stick.active && e.pointerId === stick.id) moveStick(e); });
const endStick = e => { if (e.pointerId !== stick.id) return; stick.active = false; stick.x = stick.y = 0; nub.style.transform = ''; };
stEl.addEventListener('pointerup', endStick); stEl.addEventListener('pointercancel', endStick);
function bindBtn(id, k) {
  const b = $(id);
  b.addEventListener('pointerdown', e => { e.preventDefault(); keys.add(k); hit.add(k); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, () => keys.delete(k)));
}
bindBtn('btnA', 'a'); bindBtn('btnB', 'b');
['talk', 'card'].forEach(id => $(id).addEventListener('pointerdown', () => hit.add('a')));

function axis() {
  let x = (held('right') ? 1 : 0) - (held('left') ? 1 : 0), y = (held('down') ? 1 : 0) - (held('up') ? 1 : 0);
  if (stick.active) { x = stick.x; y = stick.y; }
  const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
  return { x, y };
}

// ---------- state ----------
const S = { mode: 'title', day: 1, hour: 6, chill: 65, buzz: 0, high: 0, t: 0, inv: { beer: 1, cig: 1, joint: 0, bait: 0 }, fish: [],
  dan: { x: 0, y: 0, dir: 'down', moving: false, inBoat: false, hurt: 0 }, boat: { x: 0, y: 0, dir: 'right' },
  gators: [], pickups: [], parts: [], anim: { beer: 0, cig: 0 }, cam: { x: 0, y: 0 }, talkQ: [], talkDone: null, log: null, todo: [], gitCd: 0, chuckSeen: false };
let gatorOK;

function newDay() {
  const sp = World.spots;
  Object.assign(S, { hour: 6, buzz: 0, high: 0, chill: 65, gitCd: 0, chuckSeen: false, parts: [] });
  Object.assign(S.dan, { x: sp.dan.x, y: sp.dan.y, dir: 'down', inBoat: false, hurt: 0 });
  Object.assign(S.boat, { x: sp.boat.x, y: sp.boat.y, dir: 'right' });
  S.log = { beers: 0, cigs: 0, joints: 0, bites: 0, gits: 0, chuckGit: false, passedOut: false, meltdowns: 0, caught: [], steals: [], snapped: 0, merle: false, lostItems: 0 };
  S.todo = [
    { id: 'beer', text: 'Crack a cold one' },
    { id: 'boat', text: 'Take the jon boat out' },
    { id: 'fish', text: 'Catch 3 fish for the fry (0/3)' },
    { id: 'merle', text: "Bring 'em to Merle's trailer (east)" },
    { id: 'chuck', text: 'Tell Chuck to GIT' },
  ];
  renderTodo();
  spawnPickups(); spawnGators();
}

function done(id, text) {
  const o = S.todo.find(t => t.id === id); if (!o) return;
  if (text) o.text = text;
  if (!o.done && !text) { o.done = true; }
  renderTodo();
}

function spawnPickups() {
  const x0 = World.spots.dockEnd.x / TS - 4.5;
  const fixed = [['beer', 19.9, 18.9], ['joint', 20.4, 18.5], ['cig', 12.6, 18.7], ['bait', x0 + 1.5, 22.6], ['bait', 13.5, 21.3], ['beer', 45.5, 16.2],
    ['cig', 41.2, 13.2], ['beer', 40.5, 31], ['bait', 5, 5.5], ['beer', 22, 20.5], ['bait', 43, 15.8]];
  S.pickups = [];
  const ok = (x, y) => WALKABLE(World.at(x, y)) && World.at(x, y) !== T.SHALLOW && !World.solidAt(x, y);
  for (const [kind, tx, ty] of fixed) { const x = tx * TS, y = ty * TS; if (ok(x, y)) S.pickups.push({ kind, x, y }); }
  for (let n = 0, tries = 0; n < 5 && tries < 400; tries++) {
    const x = (2 + Math.random() * (MW - 4)) * TS, y = (2 + Math.random() * (MH - 4)) * TS;
    if (ok(x, y) && World.at(x, y) === T.GRASS) { S.pickups.push({ kind: Math.random() < .6 ? 'beer' : 'cig', x, y }); n++; }
  }
}

function spawnGators() {
  if (!gatorOK) {
    gatorOK = new Uint8Array(MW * MH);
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const k = World.tile(x, y);
      if (WET(k)) { gatorOK[y * MW + x] = 1; continue; }
      if (k === T.DOCK) continue;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (WET(World.tile(x + dx, y + dy))) gatorOK[y * MW + x] = 1;
    }
  }
  S.gators = [];
  const mk = (x, y, chuck) => S.gators.push({ x, y, hx: x, hy: y, dir: 'right', state: 'wander', lurk: true, tx: x, ty: y, timer: 0, chomp: 0, cd: 2, seed: Math.random(), chuck });
  for (let n = 0, tries = 0; n < 7 && tries < 500; tries++) {
    const tx = 1 + Math.floor(Math.random() * (MW - 2)), ty = 1 + Math.floor(Math.random() * (MH - 2)), k = World.tile(tx, ty);
    const x = (tx + .5) * TS, y = (ty + .5) * TS;
    if ((k === T.WATER || k === T.DEEP) && Math.hypot(x - S.dan.x, y - S.dan.y) > 140) { mk(x, y, false); n++; }
  }
  let best = null, bd = 1e9;   // Chuck lives in the channel by Merle's
  for (let y = 10; y < 26; y++) for (let x = 30; x < 42; x++) if (World.tile(x, y) === T.WATER || World.tile(x, y) === T.DEEP) { const d = Math.hypot(x - 37, y - 17); if (d < bd) { bd = d; best = [x, y]; } }
  if (best) mk((best[0] + .5) * TS, (best[1] + .5) * TS, true);
}

// ---------- messages ----------
let toastT = 0;
function toast(msg, secs = 2.6) { txt(ui.toast, msg); toastT = secs; }
function say(lines, then) { S.talkQ = lines.slice(); S.talkDone = then || null; S.mode = 'talk'; showLine(); }
function showLine() {
  const [who, line] = S.talkQ[0];
  txt(ui.talkWho, who); txt(ui.talkLine, line); ui.talk.hidden = false;
}
function advanceTalk() {
  S.talkQ.shift();
  if (S.talkQ.length) return showLine();
  ui.talk.hidden = true; S.mode = 'walk';
  const f = S.talkDone; S.talkDone = null; if (f) f();
}

// ---------- vices ----------
const LINES = {
  beer: ['*crack* ...ahhh.', 'Breakfast of champions.', 'Hydration.', 'Tastes like freedom and aluminum.'],
  cig: ['*cough* ...nice.', 'Dan smokes like a man with no plans.', "He'll quit one of these days. Not today."],
  joint: ['Oh... oh the colors, man.', 'The swamp is breathing. Cool.', 'Dan is one with the marsh now.'],
  pickup: {
    beer: ['Found a warm Natty. Still counts.', 'A beer in the grass! Easter egg for adults.', 'Half a six-pack. Somebody’s loss.'],
    cig: ['Pack of Reds. Three left. Score.', "Cigs. Don't tell the cardiologist."],
    joint: ['Found a joint in the couch cushions. Merry Christmas.'],
    bait: ['Tub of nightcrawlers. Still wiggly.', 'Bait! Mostly alive.'],
  },
  bite: ['OW! SON OF A—', 'He bit me! On a TUESDAY!', "That's my good leg!", 'Not the shorts! These are my good jorts!'],
  git: ['GIT!', 'GO ON, GIT!', 'NOT TODAY, SATAN!', 'GIT! GIT!'],
};
function useVice(kind) {
  if (S.mode !== 'walk' && S.mode !== 'fish') return;
  if (S.inv[kind] <= 0) { toast(kind === 'beer' ? 'Cooler’s empty. Tragic.' : kind === 'cig' ? 'Out of smokes.' : 'No joint. Check the couch.'); return; }
  S.inv[kind]--;
  if (kind === 'beer') { S.buzz += 19; S.chill += 14; S.log.beers++; S.anim.beer = 1.4; done('beer'); }
  if (kind === 'cig') { S.chill += 11; S.log.cigs++; S.anim.cig = 6; }
  if (kind === 'joint') { S.chill += 30; S.high = 45; S.log.joints++; S.anim.cig = 8; }
  S.chill = Math.min(100, S.chill);
  toast(S.buzz >= 70 && kind === 'beer' ? "Dan's gettin' wobbly." : pick(LINES[kind]));
  if (S.buzz >= 100) passOut();
}
function passOut() {
  S.log.passedOut = true;
  say([['DAN', "I'm jus' gonna... lay down... for a sec..."], ['', 'Dan lies down for a sec. The sec lasts until morning.']], () => endDay('passout'));
}

// ---------- gators ----------
const gatorCan = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return tx >= 0 && ty >= 0 && tx < MW && ty < MH && gatorOK[ty * MW + tx] && !World.solidAt(x, y); };
function target() { return S.dan; }
function updateGators(dt) {
  const D = target();
  for (const gt of S.gators) {
    gt.cd -= dt; gt.chomp -= dt; gt.timer -= dt;
    const dx = D.x - gt.x, dy = D.y - gt.y, dist = Math.hypot(dx, dy);
    const range = gt.chuck ? 100 : 72;
    if (gt.state === 'flee') { if (gt.timer <= 0) gt.state = 'wander'; }
    else if (S.mode !== 'title' && gt.cd <= 0 && dist < range && gatorCan(D.x, D.y + 2)) {
      if (gt.state !== 'chase' && gt.chuck && !S.chuckSeen) { S.chuckSeen = true; toast("Oh no. It's Chuck."); }
      gt.state = 'chase';
    } else if (gt.state === 'chase') gt.state = 'wander';
    let vx = 0, vy = 0, sp = 0;
    if (gt.state === 'chase') { vx = dx / dist; vy = dy / dist; sp = gt.chuck ? 44 : 37; }
    else if (gt.state === 'flee') { vx = -dx / (dist || 1); vy = -dy / (dist || 1); sp = 58; }
    else {
      if (gt.timer <= 0 || Math.hypot(gt.tx - gt.x, gt.ty - gt.y) < 4) {
        gt.timer = 3 + Math.random() * 4;
        const a = Math.random() * 6.28, r = 20 + Math.random() * 60;
        gt.tx = gt.hx + Math.cos(a) * r; gt.ty = gt.hy + Math.sin(a) * r;
      }
      const ex = gt.tx - gt.x, ey = gt.ty - gt.y, ed = Math.hypot(ex, ey) || 1;
      vx = ex / ed; vy = ey / ed; sp = 11;
    }
    const nx = gt.x + vx * sp * dt, ny = gt.y + vy * sp * dt;
    if (gatorCan(nx, gt.y)) gt.x = nx; else gt.tx = gt.x;
    if (gatorCan(gt.x, ny)) gt.y = ny; else gt.ty = gt.y;
    if (sp > 0) gt.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up');
    gt.lurk = gt.state === 'wander' && WET(World.at(gt.x, gt.y)) && World.at(gt.x, gt.y) !== T.SHALLOW;
    if (gt.state === 'chase' && dist < (gt.chuck ? 13 : 10) && gt.cd <= 0) bite(gt, dx, dy, dist);
  }
}
function bite(gt, dx, dy, dist) {
  gt.chomp = .45; gt.cd = 5; gt.state = 'wander';
  const D = S.dan, push = 20;
  for (let i = push; i > 0; i -= 4) { const nx = D.x + dx / dist * i, ny = D.y + dy / dist * i; if (D.inBoat ? canBoat(nx, ny) : canWalk(nx, ny)) { D.x = nx; D.y = ny; break; } }
  D.hurt = .6; S.chill = Math.max(0, S.chill - 15); S.log.bites++;
  splash(D.x, D.y, 8);
  let msg = pick(LINES.bite);
  if (S.inv.beer > 0 && Math.random() < .6) { S.inv.beer--; S.log.lostItems++; msg = `${gt.chuck ? 'Chuck' : 'Gator'} took a Natty Light. Rude.`; }
  else if (D.inBoat && S.fish.length && Math.random() < .5) { const f = S.fish.pop(); S.log.steals.push({ name: f.name, chuck: gt.chuck }); msg = `${gt.chuck ? 'Chuck' : 'A gator'} snatched your ${f.name} outta the boat!`; }
  toast(msg);
}
function yell() {
  if (S.gitCd > 0) return;
  S.gitCd = .9; S.log.gits++; S.chill = Math.min(100, S.chill + 2);
  const D = S.dan; S.parts.push({ kind: 'git', x: D.x, y: D.y - 22, vx: 0, vy: -10, life: 1, text: pick(LINES.git) });
  let chuckHeard = false;
  for (const gt of S.gators) if (Math.hypot(gt.x - D.x, gt.y - D.y) < (gt.chuck ? 95 : 80)) { gt.state = 'flee'; gt.timer = 3.5; gt.cd = 4; if (gt.chuck) chuckHeard = true; }
  if (chuckHeard && !S.log.chuckGit) { S.log.chuckGit = true; done('chuck'); setTimeout(() => toast('Chuck hisses and backs off. Respect.'), 700); }
}

// ---------- movement ----------
function canWalk(x, y) {
  for (const [ox, oy] of [[-4, 0], [4, 0], [0, -3], [0, 2]]) { const k = World.at(x + ox, y + oy); if (!WALKABLE(k) || World.solidAt(x + ox, y + oy)) return false; }
  return Math.hypot(x - World.spots.merle.x, y - World.spots.merle.y) > 7;
}
function canBoat(x, y) { for (const [ox, oy] of [[0, 0], [-8, 0], [8, 0], [0, -5], [0, 5]]) if (!BOATABLE(World.at(x + ox, y + oy))) return false; return true; }

function moveDan(dt) {
  const D = S.dan; let { x: ax, y: ay } = axis();
  if (S.buzz > 60 && (ax || ay)) {   // drunk steering
    const a = Math.atan2(ay, ax) + Math.sin(S.t * 2.3) * (S.buzz - 60) / 40 * .7, m = Math.hypot(ax, ay);
    ax = Math.cos(a) * m; ay = Math.sin(a) * m;
  }
  D.moving = !!(ax || ay);
  if (!D.moving) return;
  D.dir = Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 'right' : 'left') : (ay > 0 ? 'down' : 'up');
  if (D.inBoat) {
    const sp = World.at(D.x, D.y) === T.SHALLOW ? 40 : 72;
    const nx = D.x + ax * sp * dt, ny = D.y + ay * sp * dt;
    if (canBoat(nx, D.y)) D.x = nx; if (canBoat(D.x, ny)) D.y = ny;
    S.boat.x = D.x; S.boat.y = D.y; S.boat.dir = D.dir;
    if (Math.random() < dt * 6) S.parts.push({ kind: 'foam', x: D.x - ax * 14, y: D.y - ay * 8, vx: 0, vy: 0, life: .8 });
  } else {
    const sp = World.at(D.x, D.y) === T.SHALLOW ? 26 : 54;
    const nx = D.x + ax * sp * dt, ny = D.y + ay * sp * dt;
    if (canWalk(nx, D.y)) D.x = nx; if (canWalk(D.x, ny)) D.y = ny;
  }
}

function facing(dist) {
  const d = S.dan.dir;
  return { x: S.dan.x + (d === 'right' ? dist : d === 'left' ? -dist : 0), y: S.dan.y + (d === 'down' ? dist : d === 'up' ? -dist : 0) };
}
function interaction() {
  const D = S.dan, M = World.spots.merle;
  if (!D.inBoat && Math.hypot(D.x - M.x, D.y - M.y) < 26) return { label: 'Talk to Merle', fn: talkMerle };
  if (D.inBoat) {
    for (const dist of [14, 20]) {
      const p = facing(dist), k = World.at(p.x, p.y);
      if (WALKABLE(k) && k !== T.SHALLOW && canWalk(p.x, p.y)) return { label: 'Hop out', fn: () => { D.inBoat = false; D.x = p.x; D.y = p.y; } };
    }
    return { label: 'Cast a line', fn: () => Fishing.start(World.at(D.x, D.y), false) };
  }
  if (Math.hypot(D.x - S.boat.x, D.y - S.boat.y) < 24) return { label: 'Hop in the jon boat', fn: () => { D.inBoat = true; D.x = S.boat.x; D.y = S.boat.y; done('boat'); } };
  const door = World.spots.door;
  if (Math.hypot(D.x - door.x, D.y - door.y) < 18) return { label: 'Hit the hay', fn: sleep };
  const p = facing(15), k = World.at(p.x, p.y), here = World.at(D.x, D.y);
  if (k === T.DEEP || k === T.WATER || (k === T.SHALLOW && here === T.DOCK)) return { label: 'Cast from here', fn: () => Fishing.start(k, true) };
  return null;
}
function sleep() {
  if (S.hour < 17) { toast("It's " + clock() + ". Merle'd never let you live that down."); return; }
  say([['DAN', pick(['Welp. That’s a day.', 'Nite, swamp.', 'Another one for the books.'])]], () => endDay('sleep'));
}

// ---------- Merle ----------
function talkMerle() {
  const L = S.log, real = S.fish.filter(f => !f.junk), carts = S.fish.filter(f => f.id === 'cart');
  const lines = [];
  if (carts.length) { lines.push(['MERLE', 'Is that a... Publix cart? Leave it by the trailer. I got plans.']); S.fish = S.fish.filter(f => f.id !== 'cart'); }
  if (L.merle) lines.push(['MERLE', pick(["Fryer's hot, Danny. Go on. Bring a lawn chair tomorrow.", 'You seen Chuck today? He was eyein’ my flamingo.', 'Don’t make it weird, Danny. Go fish.'])]);
  else if (real.length >= 3) {
    const gars = real.filter(f => f.id === 'gar').length, big = real.slice().sort((a, b) => b.lbs - a.lbs)[0];
    lines.push(['MERLE', `Hot DANG, Danny! ${real.length} fish!`]);
    if (gars) lines.push(['MERLE', `...Is that a GAR? I said NO GAR. You know what happened last time.`]);
    lines.push(['MERLE', `That ${big.name.toLowerCase()} is a chunky boy. Straight in the turkey fryer.`], ['MERLE', "Here. Two cold ones. And we're square on that forty. Mostly."]);
    L.merle = true; S.inv.beer += 2; S.chill = Math.min(100, S.chill + 20);
    S.fish = S.fish.filter(f => f.junk);
    done('merle');
  } else if (real.length) lines.push(['MERLE', `That's ${real.length}. I said three, Danny. Three's a number.`]);
  else lines.push(['MERLE', S.day === 1 ? "Danny boy! Where's my fish? Fry's at sundown." : "Back again? Fry's every night now. It's a lifestyle."], ['MERLE', 'And watch out for Chuck. He’s in a mood.']);
  say(lines);
}

// ---------- day end ----------
function endDay(reason) {
  S.mode = 'gazette';
  Gazette.show(reason);
}
$('nextBtn').addEventListener('click', () => {
  ui.gazette.hidden = true; S.day++; newDay(); S.mode = 'walk'; showHud(true);
  say([['', `Day ${S.day}. 6:00 AM. The swamp is already 84 degrees.`], ['DAN', pick(['Another beautiful day in paradise.', 'Mornin’, swamp.', 'My head. My whole head.'])]]);
});
$('startBtn').addEventListener('click', start);
function start() {
  ui.title.hidden = true; newDay(); S.mode = 'walk'; showHud(true);
  say([['TEXT FROM MERLE', 'fish fry 2nite. bring 3 fish'], ['TEXT FROM MERLE', 'NOT gar. last time was a whole thing'], ['TEXT FROM MERLE', 'also u still owe me $40'],
    ['DAN', "...Mornin' to you too, Merle."], ['', 'The jon boat is tied up at the end of the dock. Merle lives on the island to the east.']]);
}

// ---------- particles ----------
function splash(x, y, n) { for (let i = 0; i < n; i++) S.parts.push({ kind: 'splash', x, y, vx: (Math.random() - .5) * 50, vy: -20 - Math.random() * 30, life: .5 + Math.random() * .3 }); }
function updateParts(dt) {
  if (S.anim.cig > 0 && Math.random() < dt * 5) S.parts.push({ kind: 'smoke', x: S.dan.x + 6, y: S.dan.y - 12, vx: 4 + Math.random() * 4, vy: -8, life: 1.6 });
  for (const p of S.parts) { p.x += p.vx * dt; p.y += p.vy * dt; if (p.kind === 'splash') p.vy += 120 * dt; p.life -= dt; }
  S.parts = S.parts.filter(p => p.life > 0);
}
function drawParts(cx, cy) {
  for (const p of S.parts) {
    const x = p.x - cx, y = p.y - cy;
    if (p.kind === 'smoke') { const s = 2 + (1.6 - p.life) * 3; R(x - s / 2, y - s / 2, s, s, C.smoke); }
    else if (p.kind === 'splash') R(x, y, 1, 2, C.foam);
    else if (p.kind === 'foam') R(x - 2, y, 4, 1, C.foam);
    else if (p.kind === 'git') { g.font = '700 9px "Pixelify Sans", monospace'; g.textAlign = 'center'; g.fillStyle = C.pink; g.fillText(p.text, Math.round(x), Math.round(y)); }
  }
}

// ---------- update ----------
function update(dt) {
  S.t += dt;
  if (toastT > 0 && (toastT -= dt) <= 0) txt(ui.toast, '');
  if (S.mode === 'title') { if (tapped('a')) return start(); S.cam.x = 260 + Math.sin(S.t * .06) * 180; S.cam.y = 200 + Math.sin(S.t * .045) * 70; updateGators(dt); return; }
  if (S.mode === 'talk') { if (tapped('a')) advanceTalk(); return; }
  if (S.mode === 'gazette') return;
  if (tapped('beer')) useVice('beer'); if (tapped('cig')) useVice('cig'); if (tapped('joint')) useVice('joint');
  // the clock, the buzz, the chill
  S.hour += dt / 32 * (S.high > 0 ? .6 : 1);
  S.buzz = Math.max(0, S.buzz - dt * .3);
  S.high = Math.max(0, S.high - dt);
  S.chill = Math.max(0, S.chill - dt * .22);
  for (const k in S.anim) S.anim[k] = Math.max(0, S.anim[k] - dt);
  S.gitCd -= dt; S.dan.hurt -= dt;
  if (S.chill <= 0) {
    S.log.meltdowns++; S.chill = 35;
    say([['', 'Dan has run out of chill.'], ['DAN', 'WHAT ARE YOU LOOKIN AT, PELICAN? HUH? YEAH, YOU!'], ['', 'The pelican is unbothered. Dan feels a little better.']]);
    return;
  }
  if (S.hour >= 21 && S.mode === 'walk') { say([['', "It's 9 PM. The mosquitoes have unionized."], ['DAN', 'Aight. Bed.']], () => endDay('late')); return; }
  if (S.mode === 'fish') { Fishing.update(dt); updateParts(dt); return; }

  moveDan(dt);
  updateGators(dt);
  updateParts(dt);
  if (tapped('b')) yell();
  for (const p of S.pickups) if (!S.dan.inBoat && Math.hypot(p.x - S.dan.x, p.y - S.dan.y) < 11) {
    p.got = true; S.inv[p.kind]++; toast(pick(LINES.pickup[p.kind]));
  }
  S.pickups = S.pickups.filter(p => !p.got);
  const act = interaction();
  txt(ui.prompt, act ? `${isTouch ? 'E' : '[E]'}  ${act.label}` : '');
  if (act && tapped('a')) act.fn();

  // camera
  const tx = S.dan.x - VW / 2, ty = S.dan.y - VH / 2 - 8;
  S.cam.x += (tx - S.cam.x) * Math.min(1, dt * 6); S.cam.y += (ty - S.cam.y) * Math.min(1, dt * 6);
}

// ---------- draw ----------
function drawWorld() {
  const cx = Math.round(Math.max(0, Math.min(MW * TS - VW, S.cam.x))), cy = Math.round(Math.max(0, Math.min(MH * TS - VH, S.cam.y))), t = S.t;
  drawTiles(cx, cy, t);
  const vis = (x, y, m = 48) => x > cx - m && x < cx + VW + m && y > cy - m && y < cy + VH + m * 1.5;
  for (const p of World.props) if (p.kind === 'lily' && vis(p.x, p.y)) drawProp(p, cx, cy, t);
  for (const gt of S.gators) if (gt.lurk && vis(gt.x, gt.y)) drawGator(gt, cx, cy, t);
  const list = [];
  for (const p of World.props) if (p.kind !== 'lily' && vis(p.x, p.y)) list.push([p.y + p.h, () => drawProp(p, cx, cy, t)]);
  for (const p of S.pickups) if (vis(p.x, p.y)) list.push([p.y, () => drawPickup(p, cx, cy, t)]);
  for (const gt of S.gators) if (!gt.lurk && vis(gt.x, gt.y)) list.push([gt.y, () => drawGator(gt, cx, cy, t)]);
  const D = S.dan, M = World.spots.merle;
  if (!D.inBoat) list.push([S.boat.y + 4, () => drawBoat(S.boat.x - cx, S.boat.y - cy, S.boat.dir, t, false)]);
  if (vis(M.x, M.y)) list.push([M.y, () => drawNPC(M.x - cx, M.y - cy, t)]);
  if (S.mode !== 'title') list.push([D.y + (D.inBoat ? 4 : 0), () => {
    if (D.hurt > 0 && Math.floor(t * 20) % 2) return;
    if (D.inBoat) drawBoat(D.x - cx, D.y - cy, S.boat.dir, t, true, D.dir);
    else drawDan(D.x - cx, D.y - cy, D.dir, D.moving, t, { wading: World.at(D.x, D.y) === T.SHALLOW, beer: S.anim.beer > 0, cig: S.anim.cig > 0 });
  }]);
  list.sort((a, b) => a[0] - b[0]).forEach(e => e[1]());
  drawParts(cx, cy);
}

// time-of-day as extra ink laid over the whole sheet: [blue, pink, yellow]
const SKY = [[0, [.4, .12, 0]], [5.5, [.3, .16, .04]], [6.5, [.04, .12, .12]], [8, [0, 0, 0]], [16, [0, 0, .02]], [18, [0, .1, .17]], [19.5, [.08, .2, .1]], [21, [.3, .14, .02]], [24, [.4, .12, 0]]];
function skyTint(h) {
  for (let i = 0; i < SKY.length - 1; i++) {
    const [h0, a] = SKY[i], [h1, b] = SKY[i + 1];
    if (h >= h0 && h <= h1) { const k = (h - h0) / (h1 - h0); return a.map((v, j) => v + (b[j] - v) * k); }
  }
  return [0, 0, 0];
}

function print() {
  const t = S.t, drunk = S.buzz / 40;
  const off = [
    [Math.sin(t * .23) * .15, Math.cos(t * .19) * .1],
    [.5 + drunk * .9 + Math.sin(t * .31) * .15, -.3 - drunk * .5],
    [-.4 - drunk * .6, .45 + Math.cos(t * .27) * .15],
  ];
  if (S.high > 0) { const k = Math.min(1, S.high / 6); off[1][0] += Math.sin(t * 1.1) * 1.8 * k; off[1][1] += Math.cos(t * .8) * 1.3 * k; }
  const tint = S.mode === 'title' ? [0, .03, .05] : skyTint(S.hour);
  if (S.high > 0) tint[1] += .05 + Math.sin(t * 2) * .03;
  Riso.render({ off, wob: Math.max(0, (S.buzz - 45) / 55) * .9, tint, t });
}

// ---------- HUD ----------
const ui = {};
['timeLabel', 'dayLabel', 'chillFill', 'buzzFill', 'nBeer', 'nCig', 'nJoint', 'nBait', 'nFish', 'prompt', 'toast', 'todoList', 'fishHud', 'tensionFill', 'fishMsg',
  'talk', 'talkWho', 'talkLine', 'card', 'cardK', 'cardN', 'cardW', 'cardQ', 'title', 'gazette', 'clock', 'todo', 'inv', 'todoToggle', 'pad'].forEach(id => ui[id] = $(id));
function txt(el, v) { v = String(v); if (el._v !== v) { el._v = v; el.textContent = v; } }
function clock() { const h = Math.floor(S.hour), m = Math.floor(S.hour % 1 * 6) * 10, h12 = ((h + 11) % 12) + 1; return `${h12}:${m ? m : '00'} ${h < 12 || h >= 24 ? 'AM' : 'PM'}`; }
function renderTodo() {
  const real = S.log ? S.log.caught.filter(f => !f.junk).length : 0;
  const f = S.todo.find(t => t.id === 'fish'); if (f) { f.text = `Catch 3 fish for the fry (${Math.min(3, real)}/3)`; if (real >= 3) f.done = true; }
  ui.todoList.innerHTML = '';
  for (const o of S.todo) { const li = document.createElement('li'); li.textContent = (o.done ? '✓ ' : '☐ ') + o.text; if (o.done) li.className = 'done'; ui.todoList.append(li); }
}
function showHud(on) { ['clock', 'todo', 'inv', 'todoToggle'].forEach(k => ui[k].hidden = !on); ui.pad.hidden = !(on && isTouch); }
function hud() {
  if (S.mode === 'title' || S.mode === 'gazette') return;
  txt(ui.timeLabel, clock()); txt(ui.dayLabel, `Day ${S.day} · County Rd 29`);
  ui.chillFill.style.width = S.chill + '%'; ui.buzzFill.style.width = Math.min(100, S.buzz) + '%';
  txt(ui.nBeer, S.inv.beer); txt(ui.nCig, S.inv.cig); txt(ui.nJoint, S.inv.joint); txt(ui.nBait, S.inv.bait); txt(ui.nFish, S.fish.filter(f => !f.junk).length);
  if (S.mode !== 'walk') txt(ui.prompt, '');
}
['Beer', 'Cig', 'Joint'].forEach(k => $('use' + k).addEventListener('click', e => { e.currentTarget.blur(); useVice(k.toLowerCase()); }));
ui.todoToggle.addEventListener('click', () => ui.todo.classList.toggle('open'));

const isTouch = matchMedia('(pointer: coarse)').matches;
function resize() {
  const vw = innerWidth, vh = innerHeight, portrait = vh > vw * 1.1;
  const w = Math.floor(Math.min(vw, (portrait ? vh * .62 : vh) * 16 / 9)), h = Math.floor(w * 9 / 16);
  Object.assign(stage.style, { width: w + 'px', height: h + 'px', left: ((vw - w) / 2) + 'px', top: (portrait ? 12 : (vh - h) / 2) + 'px' });
  $('hud').style.fontSize = Math.max(11, Math.min(17, w / 58)) + 'px';
  const dpr = Math.min(2, devicePixelRatio || 1);
  screen.width = Math.round(w * dpr); screen.height = Math.round(h * dpr);
}
addEventListener('resize', resize);

// ---------- boot ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  update(dt);
  if (S.mode === 'fish') Fishing.draw(); else drawWorld();
  print(); hud();
  hit.clear();
  requestAnimationFrame(frame);
}
buildWorld(); bakeSprites(); resize();
Riso.init(screen, buf);
newDay();
document.fonts && document.fonts.load('700 9px "Pixelify Sans"').catch(() => {});
requestAnimationFrame(frame);
