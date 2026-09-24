// FLORIDA DAN — DAYTONA cases. Case 6: The Pace Car Problem (days 17-19). Case 7: The Daytona 250 (days 20-22).
// Plus: drivable cars, the pace-car convoy, the race (AI cars on the oval), the mash minigame (pit stops, arm
// wrestling), the Volusia County trials, the Daytona side gigs, Ink & Regret, and Wrench's Speed Shop.
'use strict';
CASE_NAMES[6] = 'THE PACE CAR PROBLEM'; CASE_NAMES[7] = 'THE DAYTONA 250';
Object.assign(SWAPS, {
  tammy: { hat: PAL.white, hatD: PAL.tankD, tank: PAL.red, tankD: PAL.redD, stain: PAL.white, jorts: PAL.black, hair: PAL.blonde, shades: PAL.shades, skin: '#f2b48f', flip: PAL.white },
  rusty: { hat: '#2f8f4e', hatD: '#1f6a38', tank: '#2f8f4e', tankD: PAL.yellow, stain: PAL.yellow, jorts: PAL.greyD, hair: PAL.grey, shades: PAL.skin, skin: '#e0956a', flip: PAL.black },
  donna: { hat: '#ff8fc0', hatD: PAL.hat, tank: '#fbe3ee', tankD: '#ff8fc0', stain: '#d9a05b', jorts: PAL.greyD, hair: '#c46a3a', shades: PAL.skin, skin: '#f2b48f', flip: PAL.white },
  tiny: { hat: PAL.black, hatD: PAL.inkL, tank: PAL.black, tankD: PAL.inkL, stain: PAL.orange, jorts: PAL.blueD, hair: PAL.grey, shades: PAL.shades, skin: '#e0956a', flip: PAL.black },
  needles: { hat: PAL.purple, hatD: PAL.purpleD, tank: PAL.black, tankD: PAL.neon, stain: PAL.teal, jorts: PAL.black, hair: PAL.neon, shades: PAL.shades, skin: '#f2c29a', flip: PAL.black },
  wrench: { hat: PAL.red, hatD: PAL.redD, tank: PAL.greyD, tankD: PAL.inkL, stain: PAL.black, jorts: PAL.blueD, hair: PAL.hair, shades: PAL.skin, skin: '#d99a74', flip: PAL.black },
  biker: { hat: PAL.black, hatD: PAL.inkL, tank: PAL.black, tankD: PAL.greyD, stain: PAL.grey, jorts: PAL.blueD, hair: PAL.hair, shades: PAL.shades, skin: '#e0956a', flip: PAL.black },
  chip: { hat: '#86c94a', hatD: '#5a9a2e', tank: '#86c94a', tankD: PAL.black, stain: PAL.black, jorts: PAL.white, hair: PAL.blonde, shades: PAL.shades, skin: '#f2b48f', flip: PAL.white },
  pettibone: { hat: PAL.white, hatD: PAL.grey, tank: PAL.robe, tankD: PAL.robeL, stain: PAL.red, jorts: PAL.robe, hair: PAL.white, shades: PAL.shades, skin: '#e8a882', flip: PAL.black },
});
const PHONE_T = 'PHONE: TAMMY JO (RADIO)';

// ---------- drivable cars ----------
const Car = {
  enter(v) { Game.dan.ride = 'car'; Game.car = v; v.v = 0; Object.assign(Game.dan, { x: v.x, y: v.y }); Sound.play('engine'); },
  exit() {
    const v = Game.car, D = Game.dan; if (!v) return;
    for (const [ox, oy] of [[0, 18], [18, 0], [-18, 0], [0, -18]]) if (canWalk(v.x + ox, v.y + oy)) { D.x = v.x + ox; D.y = v.y + oy; break; }
    D.ride = null; Game.car = null; v.v = 0;
  },
  top() { const k = World.at(Game.dan.x, Game.dan.y); return (k === T.TRACK ? 205 : k === T.ROAD || k === T.ROADV || k === T.CONCRETE ? 150 : k === T.SAND ? 115 : 80) * (hasUp('nitro') && Input.held('run') ? 1.3 : 1); },
  tick(dt) {
    const v = Game.car, D = Game.dan; if (!v) { D.ride = null; return; }
    if (Speedway.frozen()) { v.v = 0; return; }
    const { x: ax, y: ay } = Input.axis(), push = Math.hypot(ax, ay) > .25;
    if (push) {
      const want = Math.atan2(ay, ax); let da = ((want - v.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      v.a += clamp(da, -3.4 * dt, 3.4 * dt); v.v = Math.min(Car.top(), v.v + 170 * dt * (Math.abs(da) < 1.6 ? 1 : -.6));
    } else v.v *= Math.max(0, 1 - 2.2 * dt);
    const nx = v.x + Math.cos(v.a) * v.v * dt, ny = v.y + Math.sin(v.a) * v.v * dt;
    if (canDrive(nx, ny)) { v.x = nx; v.y = ny; } else { if (v.v > 60) { Game.shake = 3; Sound.play('hurt'); } v.v *= .3; }
    Object.assign(D, { x: v.x, y: v.y, dir: dirOf(Math.cos(v.a), Math.sin(v.a)), moving: v.v > 5 });
    if (v.v > 40 && Math.random() < dt * 10) Sound.play('engine');
    if (hasUp('nitro') && Input.held('run') && v.v > 60 && Math.random() < dt * 20) Game.parts.push({ kind: 'fire', x: v.x - Math.cos(v.a) * 12, y: v.y - Math.sin(v.a) * 12, vx: -Math.cos(v.a) * 30, vy: -Math.sin(v.a) * 30, life: .5 });
  },
  drawOne(v, cx, cy, t, withDan) {
    const x = Math.round(v.x - cx), y = Math.round(v.y - cy);
    shadow(x, y + 5, 26, 7);
    g.save(); g.translate(x, y); g.rotate(v.a);
    g.fillStyle = PAL.ink; g.fillRect(-13, -7, 26, 14); g.fillStyle = v.c || PAL.white; g.fillRect(-12, -6, 24, 12);
    g.fillStyle = v.c2 || PAL.red; g.fillRect(-12, -1, 24, 2);                     // stripe
    g.fillStyle = '#9fd8ee'; g.fillRect(2, -4, 5, 8); g.fillStyle = PAL.ink; g.fillRect(-13, -7, 2, 14);   // windshield, spoiler
    if (v.lights && Math.floor(t * 6) % 2) { g.fillStyle = PAL.yellow; g.fillRect(-4, -6, 3, 2); g.fillStyle = PAL.orange; g.fillRect(-4, 4, 3, 2); }
    if (withDan) { g.fillStyle = PAL.hat; g.fillRect(-3, -3, 4, 6); }
    g.restore();
    if (v.num) label(String(v.num), x, y - 10, v.numC || PAL.white, 6);
  },
  drawAll(cx, cy, t) {
    Convoy.draw(cx, cy, t);
    for (const v of Game.vehicles || []) if (v.kind === 'car') Car.drawOne(v, cx, cy, t, Game.car === v);
    for (const v of Speedway.cars) Car.drawOne(v, cx, cy, t, false);
  },
};

// ---------- the pace car convoy: the whole field follows Dan wherever he goes ----------
const Convoy = {
  on: false, hist: [],
  tick() { if (!this.on || !Game.car) return; const v = Game.car; const last = this.hist[this.hist.length - 1]; if (!last || Math.hypot(last.x - v.x, last.y - v.y) > 2) this.hist.push({ x: v.x, y: v.y, a: v.a }); if (this.hist.length > 700) this.hist.shift(); },
  draw(cx, cy, t) {
    if (!this.on) return; const H = this.hist, cols = ['#e0433a', '#4f7bd1', '#ffd23f', '#1a1423', '#86c94a', '#ff8a3d', '#7b4bc4', '#f4efe6', '#27c6b4', '#e0433a'];
    for (let i = 0; i < 10; i++) { const p = H[H.length - 1 - (i + 1) * 12]; if (!p) break; Car.drawOne({ x: p.x, y: p.y, a: p.a, c: cols[i], c2: PAL.white, num: [3, 8, 24, 43, 88, 11, 9, 20, 48, 18][i] }, cx, cy, t, false); }
  },
};

// ---------- the oval: progress, laps, the field ----------
const PATH = { pts: null };
const pathPts = () => PATH.pts || (PATH.pts = ovalPath(96));
function nearestIdx(x, y, from, win = 8) {
  const P = pathPts(), N = P.length; let best = from, bd = 1e9;
  for (let k = -win; k <= win; k++) { const i = ((from + k) % N + N) % N, d = Math.hypot(P[i].x - x, P[i].y - y); if (d < bd) { bd = d; best = i; } }
  return [best, bd];
}
const Speedway = {
  on: false, cars: [], mode: null,
  frozen() { return this.on && this.count > 0; },
  start(mode) {
    const P = pathPts(), N = P.length, v = Game.car; if (!v) return;
    this.on = true; this.mode = mode; this.count = mode === 'race' ? 3 : 1.5; this.t = 0; this.done = false; Game.racing = true;
    this.laps = mode === 'race' ? 5 : 1; this.me = { idx: 0, prog: 0 };
    // line up at the start/finish (the player 4th on the grid in a race)
    const start = (k, lane) => { const i = ((-k * 2) % N + N) % N, p = P[i], q = P[(i + 1) % N], a = Math.atan2(q.y - p.y, q.x - p.x); return { x: p.x + Math.cos(a + Math.PI / 2) * lane, y: p.y + Math.sin(a + Math.PI / 2) * lane, a, i }; };
    const me = start(mode === 'race' ? 2 : 0, 0); Object.assign(v, { x: me.x, y: me.y, a: me.a, v: 0 }); this.me = { idx: me.i, prog: me.i ? me.i - N : 0 };   // grid slots sit just behind the line
    if (mode === 'race') {
      const cols = [['#86c94a', '#1a1423', 88], ['#e0433a', PAL.white, 3], ['#4f7bd1', PAL.yellow, 24], ['#ffd23f', PAL.red, 8], ['#1a1423', '#e0433a', 43], ['#ff8a3d', PAL.white, 11], ['#7b4bc4', PAL.white, 9]];
      this.cars = cols.map(([c, c2, num], k) => { const g0 = k < 2 ? k : k + 1, s = start(g0, (k % 2 ? 1 : -1) * 10); return { x: s.x, y: s.y, a: s.a, c, c2, num, prog: -g0 * 2, lane: (k % 2 ? 1 : -1) * 10, sp: 168 + k * 3 + Math.random() * 6 + (num === 88 ? 10 : 0) }; });
    } else this.cars = [];
    Sound.play('siren'); toast(mode === 'race' ? 'DRIVERS... START YOUR ENGINES.' : 'Qualifying. One lap. Floor it.', 2.5);
  },
  place() { return 1 + this.cars.filter(c => c.prog > this.me.prog).length; },
  tick(dt) {
    if (!this.on) return;
    const P = pathPts(), N = P.length, seg = 1936 / N, v = Game.car, D = Game.dan;
    if (this.count > 0) { const c0 = Math.ceil(this.count); this.count -= dt; if (Math.ceil(this.count) !== c0 && this.count > 0) Sound.tone(660, .15, 'square', .08); if (this.count <= 0) { Sound.tone(990, .4, 'square', .1); toast('GO GO GO!', 1.2); } return; }
    this.t += dt;
    if (!v || D.ride !== 'car') { this.abort('Dan got out of the car mid-race. The crowd boos. Get back in the #29 to try again.'); return; }
    const [i] = nearestIdx(v.x, v.y, this.me.idx); let d = i - this.me.idx; if (d > N / 2) d -= N; if (d < -N / 2) d += N; this.me.idx = i; this.me.prog += d;
    for (const c of this.cars) {   // the field: rubber-banded a little so it's always a race
      const gap = this.me.prog - c.prog, sp = c.sp + clamp(gap * 1.5, -18, 26);
      c.prog += sp * dt / seg; const k = ((Math.floor(c.prog) % N) + N) % N, f = c.prog - Math.floor(c.prog), p = P[k], q = P[(k + 1) % N], a = Math.atan2(q.y - p.y, q.x - p.x);
      c.x = p.x + (q.x - p.x) * f + Math.cos(a + Math.PI / 2) * c.lane; c.y = p.y + (q.y - p.y) * f + Math.sin(a + Math.PI / 2) * c.lane; c.a = a;
      const bd = Math.hypot(c.x - v.x, c.y - v.y);
      if (bd < 13) {   // trading paint: a shove sideways and a little speed lost (same at 60 or 120 Hz)
        v.v *= Math.pow(.97, dt * 60); Game.shake = 2; if (Math.random() < dt * 4) Sound.play('hurt');
        const px = v.x + (v.x - c.x) / (bd || 1) * 40 * dt, py = v.y + (v.y - c.y) / (bd || 1) * 40 * dt; if (canDrive(px, py)) { v.x = px; v.y = py; }
      }
    }
    const lap = Math.floor(this.me.prog / N) + 1;
    if (this.me.prog >= this.laps * N) return this.finish();
    this.hudText = this.mode === 'race' ? `LAP ${clamp(lap, 1, this.laps)}/${this.laps} · P${this.place()}` : `LAP TIME ${this.t.toFixed(1)}s`;
  },
  finish() {
    const place = this.mode === 'race' ? this.place() : 1, t = this.t, mode = this.mode;
    this.on = false; Game.racing = false; this.cars = []; this.hudText = '';
    DaytonaCases.raceDone(mode, place, t);
  },
  abort(msg) { this.on = false; Game.racing = false; this.cars = []; this.hudText = ''; toast(msg, 4); },
  hud() { return !this.on ? '' : this.count > 0 ? `${Math.ceil(this.count)}...` : this.hudText || ''; },
};

// ---------- the mash minigame (pit stops, arm wrestling): mash E before time runs out ----------
const Mash = {
  s: null,
  start(o) {
    this.s = { ...o, n: 0, t: 0 }; Game.mode = 'mash'; ui.raccoon.hidden = false;
    ui.raccoon.querySelector('.ttl').textContent = o.title; ui.raccoon.querySelector('.hint').innerHTML = o.hint || `MASH ${K('a')}!`; ui.raccoonFill.style.width = '0%';
    showHud(false); padFor(true); Sound.play('headline');
  },
  update(dt) {
    const s = this.s; if (!s) { Game.mode = 'play'; return; }
    s.t += dt;
    if (Input.tapped('a') || ['up', 'down', 'left', 'right'].some(k => Input.tapped(k))) { s.n++; Game.shake = 2; Sound.play(s.sound || 'reel'); }
    ui.raccoonFill.style.width = Math.min(100, s.n / s.need * 100) + '%';
    const hn = `${Math.max(0, Math.ceil(s.time - s.t))}s · MASH ${K('a')}!`; if (s._h !== hn) { s._h = hn; ui.raccoon.querySelector('.hint').innerHTML = hn; }
    if (s.n >= s.need) this.finish(true); else if (s.t >= s.time) this.finish(false);
  },
  finish(won) {
    const s = this.s; this.s = null; ui.raccoon.hidden = true; Game.mode = 'play'; showHud(true); padFor(false);
    ui.raccoon.querySelector('.ttl').textContent = 'RACCOON ON FACE'; ui.raccoon.querySelector('.hint').textContent = 'MASH E TO PEEL IT OFF';
    if (won) { Sound.play('catch'); s.onWin && s.onWin(); } else { Sound.play('fail'); s.onLose && s.onLose(); }
  },
  draw() {
    const s = this.s; if (!s) return; const t = Game.t, k = Math.min(1, s.n / s.need);
    if (s.kind === 'arm') {   // Dan vs Tiny, arms locked on a bar table
      R(0, 0, VW, VH, '#3a2618'); R(0, 110, VW, 70, '#6b4a2e'); for (let i = 0; i < VW; i += 20) R(i, 110, 1, 70, '#5a3a22');
      g.drawImage(SPR.tiny.down[0], 0, 0, 16, 22, 188, 40, 48, 66); g.drawImage(SPR.dan.down[0], 0, 0, 16, 22, 84, 40, 48, 66); label('TINY', 212, 118, PAL.white, 7); label('DAN', 108, 118, PAL.white, 7);
      const a = -.9 + k * 1.8 + Math.sin(t * 30) * .04; g.save(); g.translate(160, 118); g.rotate(a); g.fillStyle = PAL.ink; g.fillRect(-3, -40, 12, 42); g.fillStyle = PAL.skin; g.fillRect(-2, -39, 10, 40); g.restore();
    } else {   // pit stop: the #29 on jacks, four tires to swap
      R(0, 0, VW, VH, '#4a4a55'); R(0, 136, VW, 44, '#3a3a44'); R(0, 132, VW, 4, PAL.yellow);
      OR(60, 84, 200, 40, '#2f8f4e'); R(60, 100, 200, 4, PAL.yellow); label('29', 160, 99, PAL.white, 10); OR(170, 76, 40, 12, '#9fd8ee');
      for (let i = 0; i < 4; i++) { const done = k * 4 > i + .999, x = [74, 214, 90, 230][i], y = i < 2 ? 116 : 116; OR(x, y + (done ? 0 : Math.round(Math.sin(t * 20 + i) * 1)), 22, 18, done ? PAL.black : '#6b6a73'); if (done) R(x + 8, y + 6, 6, 6, PAL.grey); }
      g.drawImage(SPR.dan.right[Math.floor(t * 12) % 2], 30, 110);
    }
  },
};

// ---------- the cases ----------
const DSP = () => World.spots;
const DaytonaCases = {
  c: () => Cases.info(),
  spawn() {
    const c = this.c(), F = Game.flags, S_ = DSP();
    if (c.n === 6 && c.d === 1 && F.marshal && !F.donutRun) Game.vehicles.push({ kind: 'car', id: 'pace', x: S_.pits.x + 4, y: S_.pits.y - 30, a: -Math.PI / 2, v: 0, c: PAL.white, c2: PAL.yellow, lights: true });
    if (c.n === 7) {
      Game.npcs.push(makeNPC('chip', 'Chip Sterling', 22.4 * TS + 10, (21.5 + 3 * 3.4) * TS + 44, 'down'));
      Game.vehicles.push({ kind: 'car', id: 'car29', x: S_.pits.x + 4, y: S_.pits.y - 24, a: -Math.PI / 2, v: 0, c: '#2f8f4e', c2: PAL.yellow, num: 29, numC: PAL.yellow });
    }
  },
  arrived(to) {
    const c = this.c();
    if (to === 'daytona' && c.n === 6 && c.d === 1 && qOpen('bus6')) { done('bus6'); addQuest('marshal', 'Report to Tammy Jo in the pits (through the speedway tunnel)'); }
  },
  setupDay(n) {
    const c = Cases.info(n), F = Game.flags;
    Speedway.on = false; Speedway.cars = []; Convoy.on = false; Convoy.hist = []; Game.racing = false; Game.car = null;
    if (c.n === 6 && c.d === 1) {
      setQuests([['bus6', 'Take the Greyhound to Daytona (bus station)']]);
      if (DAYTONA()) { done('bus6'); addQuest('marshal', 'Report to Tammy Jo in the pits (through the speedway tunnel)'); }
      return say([['', 'A letter arrives. It is printed on a checkered flag.'], ['LETTER', 'DEAR FLORIDA MAN OF THE YEAR: You have been selected as GRAND MARSHAL of the Daytona 250! Drive the pace car. Wave. Do NOT stop anywhere.'],
        [PHONE_B, 'Dan. Do not go to Daytona.'], ['DAN', 'Brenda, they’re letting me drive the PACE CAR.'], [PHONE_B, 'That is exactly why you should not go to Daytona.']]);
    }
    if (c.n === 6 && c.d === 2) {
      setQuests([['rusty', 'Help Rusty Lugnuts with a pit stop (garage #29, infield)'], ['donna', 'Get Donna from the Donut Hut to testify'], ['bed', 'Court is tomorrow (sleep at the Ocean Breeze Motel)', true]]);
      return say([['', 'DAYTONA. DAY TWO.'], [PHONE_B, 'Dan. You led FORTY race cars through a donut drive-thru.'], ['DAN', 'Under caution, Brenda. It was very safe.'],
        [PHONE_B, 'The charges are Reckless Pacing and Unlawful Parade. Court is tomorrow. Get witnesses. Racing people. Donut people.'], ['DAN', 'My people.']]);
    }
    if (c.n === 6 && c.d === 3) { Game.hour = 8; setQuests([['court', 'Volusia County Courthouse (north end of Courthouse Row)']]); return say([['', 'COURT DAY. VOLUSIA COUNTY.'], [PHONE_B, 'Please, Dan. Just once. Be a normal man in a courtroom.'], ['DAN', 'I’ve never been more normal.']]); }
    if (c.n === 7 && c.d === 1) {
      setQuests([['qualify', 'Qualify: one lap in the #29 under 18 seconds (pit road)'], ['chip', 'Meet the competition (the Gator Juice garage, #88)', true]]);
      return say([['', 'DAYTONA. RACE WEEK.'], ['RUSTY', 'Dan! Car’s ready. Swamp Lite paid for the paint job. They paid in Swamp Lite.'], ['RUSTY', 'All you gotta do is qualify. One lap. Under eighteen seconds. Don’t hit the wall. Or the lake.'], ['DAN', 'I have never hit a lake.'], ['RUSTY', 'Merle told me about the lake.']]);
    }
    if (c.n === 7 && c.d === 2) {
      setQuests([['clues', 'Find out who sabotaged the #29 (ask around: 0/3)'], ['tires', 'Get new tires from Wrench’s Speed Shop (Main Street)'], ['accuse', 'Confront the saboteur']]);
      return say([['RUSTY', 'DAN. Somebody cut the brake lines and slashed all four tires. Last night. In MY garage.'], ['DAN', 'Who would sabotage a car sponsored by beer?'], ['RUSTY', 'Somebody who don’t wanna lose to one. Ask around. Tammy Jo, Tiny, Donna. Somebody saw somethin’.']]);
    }
    if (c.n === 7 && c.d === 3) {
      Game.hour = 10; setQuests([['race', 'WIN THE DAYTONA 250 (get in the #29 on pit road)']]);
      return say([['', 'RACE DAY.'], ['TAMMY JO', 'Two hundred and fifty miles, Dan! ...Okay, five laps. Budget cuts.'], ['RUSTY', 'Just drive. Don’t think. You’re good at that.'], ['DAN', 'Thank you.']]);
    }
  },
  tick(dt) {
    const c = this.c(), F = Game.flags, D = Game.dan;
    Convoy.tick(); Speedway.tick(dt);
    if (c.n === 6 && c.d === 1 && Convoy.on && Game.car && Game.car.id === 'pace') {
      // one full lap = the parade lap; then Dan smells donuts
      const L = Game.day_, [i] = nearestIdx(Game.car.x, Game.car.y, L._pi || 0, 12); if (L._pi !== undefined) { let d = i - L._pi; if (d > 48) d -= 96; if (d < -48) d += 96; L._pp = (L._pp || 0) + d; } L._pi = i;
      if (qOpen('pacelap') && (L._pp || 0) >= 90) { done('pacelap'); addQuest('donuts', 'Take the field to the Donut Hut drive-thru (Main Street)'); say([[PHONE_T, 'Beautiful lap, Dan! Now bring ’em into pit road. Slowly.'], ['DAN', '...Tammy, do you smell that?'], [PHONE_T, 'Smell what?'], ['DAN', 'Donuts.'], [PHONE_T, 'Dan. DAN. Do NOT take them off the track.']]); }
      if (qOpen('donuts') && Math.hypot(D.x - DSP().drive.x, D.y - DSP().drive.y) < 34) this.donutRun();
    }
  },
  donutRun() {
    const F = Game.flags; F.donutRun = true; done('donuts'); Game.car.v = 0; Look.mark('skid', Game.car.x - 180, Game.car.y, { x2: Game.car.x, y2: Game.car.y }, true);   // forty cars' worth of rubber through the drive-thru
    Scene.play(this.donutScene(), () => say([
      ['DAN', 'Forty-one dozen glazed. And a coffee. Put it on NASCAR.'], ['', 'It takes two hours. Every driver gets a donut. The race is postponed. Nobody is mad. Everyone is a little mad.'], [PHONE_T, 'Dan... the cops are here.']],
    () => { headline('FLORIDA MAN LEADS ENTIRE NASCAR FIELD THROUGH DONUT DRIVE-THRU UNDER CAUTION FLAG', 10); Convoy.on = false; Convoy.hist = []; Car.exit(); Game.vehicles = Game.vehicles.filter(v => v.id !== 'pace'); react('cheer');
      addQuest('bed', 'Sleep it off at the Ocean Breeze Motel'); }));
  },
  // the whole field in the drive-thru line: pan down it, then donuts out the window
  donutScene() {
    const v = Game.car, H = Convoy.hist, dr = DSP().drive, spk = { x: dr.x, y: dr.y - 6 }, cars = [];
    for (let i = 1; i <= 10; i++) { const p = H[H.length - 1 - i * 12]; if (p) cars.push(p); }
    const tail = cars[cars.length - 1] || v;
    return [SC.cam(v.x, v.y - 6, 1.3, .5), SC.cam(tail.x, tail.y - 6, 1.15, 2.0), SC.line('dan', 'All forty of ’em. Single file.', 1.2), SC.cam(dr.x, dr.y - 10, 1.6, 1.0),
      SC.line(spk, 'Welcome to Donut Hut, what can I get—', 1.5), SC.line(spk, '...oh my God.', 1.2), SC.emote('dan', '♥', 1, PAL.hat),
      ...cars.slice(0, 6).map((c, i) => SC.fly(DONUT, dr.x, dr.y - 4, c.x, c.y - 4, .9 + i * .08, 7)), SC.cam(v.x - 40, v.y - 8, 1.25, 1.2)];
  },
  raceDone(mode, place, t) {
    const F = Game.flags;
    if (mode === 'qualify') {
      if (t <= 18) { done('qualify'); F.qualified = true; addQuest('bed', 'Rest up at the Ocean Breeze Motel', true); headline('FLORIDA MAN QUALIFIES FOR DAYTONA 250 IN CAR SPONSORED BY SWAMP LITE', 4); react('cheer'); say([[PHONE_T, `${t.toFixed(1)} seconds! You’re IN, Dan!`], ['RUSTY', '(in the background) THAT’S MY DRIVER!']]); }
      else say([[PHONE_T, `${t.toFixed(1)} seconds. Need eighteen, hon.`, [['“Again.”', () => { Game.afterTalk = () => Speedway.start('qualify'); return null; }], ['“Gimme a minute.”', () => { Car.exit(); return [[PHONE_T, 'The #29’s on pit road whenever you’re ready.']]; }]]]]);
      return;
    }
    if (place === 1) {
      F.raceWon = true; done('race'); headline('FLORIDA MAN WINS DAYTONA 250, DOES BURNOUT, CRACKS SWAMP LITE IN VICTORY LANE', 12);
      const car = Game.car; if (car) Look.mark('donuts', car.x, car.y, {}, true); Scene.play(car ? [SC.cam(car.x, car.y - 6, 1.6, .6), SC.tween(() => car.a, a => { car.a = a; for (let i = 0; i < 2; i++) Game.parts.push({ kind: 'dust', x: car.x + rnd(-10, 10), y: car.y + rnd(-4, 6), vx: rnd(-20, 20), vy: rnd(-16, -4), life: rnd(.6, 1.2) }); Game.dan.x = car.x; Game.dan.y = car.y; }, car.a + 12.6, 2.2), SC.sound('engine'), SC.line('dan', 'WOOOOOOOO!', 1.3)] : [], () => {
      Car.exit(); react('cheer'); Game.vehicles = Game.vehicles.filter(v => v.id !== 'car29');
      say([['', 'CHECKERED FLAG. DAN DUPREE WINS THE DAYTONA 250.'], ['TAMMY JO', 'YOU DID IT! YOU ACTUALLY DID IT!'], ['RUSTY', 'I’m crying. I’m not crying. It’s gasoline. In my eyes.'], ['', 'Chip Sterling storms into victory lane with a lawyer and a cease-and-desist.'],
        ['CHIP STERLING', 'I’m SUING. Unlicensed racing, unauthorized burnouts, and emotional damages. MY emotions.'], [PHONE_B, 'Dan, I just heard. Courthouse. Now. I’m already here.']], () => addQuest('court', 'Chip is suing you. Volusia County Courthouse, NOW.')); });
    } else {
      say([[PHONE_T, `P${place}. So close, Dan. Rusty says he’s got another set of tires.`], ['RUSTY', 'Go again?', [['“Again!”', () => { Game.afterTalk = () => { const v = Game.vehicles.find(v => v.id === 'car29'); if (v && Game.car !== v) Car.enter(v); Speedway.start('race'); }; return null; }], ['“Gimme a minute.”', () => { Car.exit(); return [['RUSTY', 'She’s on pit road. Don’t let the tires get cold.']]; }]]]]);
    }
  },
  talk(n) {
    const c = this.c(), F = Game.flags;
    if (n.id === 'tammy') {
      if (c.n === 6 && c.d === 1 && qOpen('marshal')) { F.marshal = true; done('marshal'); addQuest('pacelap', 'Lead the parade lap in the pace car (one lap around the oval)'); Game.vehicles.push({ kind: 'car', id: 'pace', x: DSP().pits.x + 4, y: DSP().pits.y - 30, a: -Math.PI / 2, v: 0, c: PAL.white, c2: PAL.yellow, lights: true });
        return say([['TAMMY JO', 'You’re the Grand Marshal? Oh, honey. Okay. The pace car’s right there on pit road.'], ['TAMMY JO', 'One lap. The whole field follows you. You go slow, they go slow. Then you bring ’em into pit road.'], ['TAMMY JO', 'Do NOT leave the track. Whatever you do.'], ['DAN', 'What would I even leave the track FOR?']]), true; }
      if (c.n === 7 && c.d === 2 && qOpen('clues') && !F.clueTammy) return this.clue('clueTammy', [['TAMMY JO', 'I saw a guy by the #29 garage at 2 AM. Green jacket. Big lizard on the back.'], ['DAN', 'A gator?'], ['TAMMY JO', 'A GATOR JUICE gator.']]), true;
      return say([['TAMMY JO', pick(['Speedway week, baby. Nobody sleeps. Some people shower.', 'I run the pits. I run Rusty. I run this whole town on four hours of sleep.', 'You drive like my mother. My mother won Talladega in ’79.'])]]), true;
    }
    if (n.id === 'rusty') {
      if (c.n === 6 && c.d === 2 && qOpen('rusty')) return say([['RUSTY', 'My pit crew quit. Went to work for Gator Juice Racing. Traitors, all of ’em.'], ['RUSTY', 'Help me run a pit stop drill and I’ll swear to the judge you’re a racin’ man.', [
        ['“Let’s do it.”', () => { Game.afterTalk = () => this.pitStop(() => { F.witRusty = true; done('rusty'); headline('FLORIDA MAN CHANGES FOUR TIRES IN RECORD TIME, IS NOT ON ANY PIT CREW', 4); say([['RUSTY', 'EIGHT SECONDS! I’ll testify, son. Hell, I’ll adopt you.']]); }, () => say([['RUSTY', 'Close! Shake it out and try again.']])); return null; }], ['“Later.”', () => [['RUSTY', 'Clock’s tickin’, Dan.']]]]]]), true;
      if (c.n === 7 && c.d === 3 && qOpen('race')) return say([['RUSTY', 'Get in the car, Dan! Pit road!']]), true;
      return say([['RUSTY', pick(['Forty years in racin’. Won once. It was a Tuesday.', 'That car’s held together with duct tape and prayer. Mostly tape.', 'You ever smell race fuel at sunrise? Me neither. I sleep till noon.'])]]), true;
    }
    if (n.id === 'donna') {
      if (c.n === 6 && c.d === 2 && qOpen('donna')) {
        if (Game.dan.carry === 'donutsign') { Game.dan.carry = null; F.signBack = true; F.witDonna = true; done('donna'); return say([['DONNA', 'MY SIGN! You got it back from TINY? Dan, I’d testify for you if you set this place on fire.'], ['DAN', 'Don’t tempt me.']]), true; }
        F.donutSign = true; questText('donna', 'Get Donna’s donut sign back from the bikers (The Iron Hog, Main Street)');
        return say([['DONNA', 'You’re the guy who brought forty race cars through my drive-thru. Best day of sales in history.'], ['DONNA', 'I’ll testify. But first — the Iron Hog bikers stole the sign off my roof last night. Get it back.'], ['DAN', 'Bikers. Great. Love bikers.']]), true;
      }
      if (c.n === 7 && c.d === 2 && qOpen('clues') && !F.clueDonna) return this.clue('clueDonna', [['DONNA', 'Some guy bought forty donuts at 3 AM with a company card. GATOR JUICE RACING. Didn’t tip.'], ['DAN', 'Monster.']]), true;
      return say([['DONNA', pick(['Welcome to Donut Hut. The drive-thru is closed to race cars now. There’s a sign.', 'Glazed, sprinkled, or “the Dan”: forty-one dozen and a coffee.', 'I’ve been up since 4. I’m running on sugar and spite.'])]]), true;
    }
    if (n.id === 'tiny') {
      if (c.n === 6 && c.d === 2 && qOpen('donna') && F.donutSign && Game.dan.carry !== 'donutsign') return say([['TINY', 'The donut sign? Yeah, we took it. It’s art now. It’s over the bar.'], ['TINY', 'Beat me arm wrestlin’ and it’s yours.', [
        ['Arm wrestle Tiny', () => { Game.afterTalk = () => this.armWrestle(() => { Game.dan.carry = 'donutsign'; headline('FLORIDA MAN ARM-WRESTLES BIKER NAMED "TINY" FOR A DONUT SIGN, WINS', 4); say([['TINY', '...Respect. Take the sign. Tell Donna we’re sorry. We’re not sorry.']]); }, () => say([['TINY', 'Heh. Come back when you’ve eaten.']])); return null; }], ['“Maybe later.”', () => [['TINY', 'I’ll be here. I’m always here.']]]]]]), true;
      if (c.n === 7 && c.d === 2 && qOpen('clues') && !F.clueTiny) return this.clue('clueTiny', [['TINY', 'Guy sold me a Gator Juice jacket last night for twenty bucks. Said he was “done with it.” Had brake fluid on the sleeve.'], ['DAN', 'That’s evidence!'], ['TINY', 'That’s my jacket now.']]), true;
      return say([['TINY', pick(['They call me Tiny because I’m huge. That’s the joke. Nobody laughs.', 'Bike Week’s every week if you believe in yourself.', 'You ride? No? What do you do. Cooler? ...Respect.'])]]), true;
    }
    if (n.id === 'chip') {
      if (c.n === 7 && c.d === 2 && qOpen('accuse') && ['clueTammy', 'clueTiny', 'clueDonna'].every(k => F[k])) return say([['DAN', 'Green jacket at 2 AM. Forty donuts on a company card. Brake fluid on the sleeve. It was YOU, Chip.'], ['CHIP STERLING', '...That’s circumstantial. And also I have a very good lawyer.'], ['CHIP STERLING', 'See you on the track, swamp man. If your car makes it that far.']], () => { done('accuse'); F.accused = true; addQuest('bed', 'Race day is tomorrow. Sleep at the Ocean Breeze Motel', true); }), true;
      if (c.n === 7 && c.d === 1 && !F.metChip) { F.metChip = true; done('chip'); return say([['CHIP STERLING', 'Chip Sterling. Gator Juice Racing. Our drink has forty grams of sugar and a lawyer.'], ['CHIP STERLING', 'You’re the beer guy. Cute. I’ll see you in the rearview.'], ['DAN', 'Hey Chip. Nice outfit. Is it a costume?']]), true; }
      return say([['CHIP STERLING', pick(['Gator Juice: it’s what winners drink. Losers drink beer.', 'Don’t touch the car. Don’t look at the car. Don’t breathe near the car.', 'My dad owns this garage. And several others. And a senator.'])]]), true;
    }
    if (n.id === 'wrench') {
      if (c.n === 7 && c.d === 2 && qOpen('tires')) return say([['WRENCH', 'Four racing slicks. Sixty bucks. Or run my pit drill in under ten seconds and they’re free.', [
        ...(Game.money >= 60 ? [['Pay $60', () => { Game.money -= 60; Sound.play('cash'); done('tires'); return [['WRENCH', 'Pleasure. Tell Rusty he still owes me for 1998.']]; }]] : []),
        ['Run the drill', () => { Game.afterTalk = () => this.pitStop(() => { done('tires'); say([['WRENCH', 'Free tires, as promised. I hate it here.']]); }, () => say([['WRENCH', 'Too slow. Sixty bucks or try again.']])); return null; }], ['“Later.”', () => [['WRENCH', 'Tires ain’t goin’ anywhere. Unlike Rusty’s old ones.']]]]]]), true;
      return say([['WRENCH', 'Wrench’s Speed Shop. Whatcha need?', [['Browse', () => { Game.mode = 'shop'; openShop('speed'); return null; }], ['“Just looking.”', () => [['WRENCH', 'Lookin’s free. Touchin’s twenty.']]]]]]), true;
    }
    if (n.id === 'needles') return say([['NEEDLES', pick(['Ink & Regret. No refunds, no crying, no names of exes.', 'You want a gator? Everybody wants a gator. I can do a gator in my sleep. I have.', 'I only tattoo sober people. ...Mostly sober people.']), [['Browse', () => { Game.mode = 'shop'; openShop('ink'); return null; }], ['“I’m good.”', () => [['NEEDLES', 'That’s what they all say. Then they come back.']]]]]]), true;
    if (n.id === 'biker') return say([['BIKER', pick(['Nice cooler, man.', 'Tiny says you’re alright. That means you’re alright.', 'Bike Week is a state of mind. So is Daytona. So is jail.'])]]), true;
    return false;
  },
  clue(key, lines) {
    const F = Game.flags; F[key] = true; const n = ['clueTammy', 'clueTiny', 'clueDonna'].filter(k => F[k]).length;
    questText('clues', `Find out who sabotaged the #29 (ask around: ${n}/3)`); if (n >= 3) done('clues');
    say(lines);
  },
  pitStop(win, lose) { Mash.start({ kind: 'pit', title: 'PIT STOP!', need: 32, time: 8, sound: 'reel', onWin: win, onLose: lose }); },
  armWrestle(win, lose) { Mash.start({ kind: 'arm', title: 'ARM WRESTLE TINY', need: 40, time: 9, sound: 'punch', onWin: win, onLose: lose }); },
  interactions() {
    const D = Game.dan, list = [], near = (p, r) => p && Math.hypot(D.x - p.x, D.y - p.y) < r, c = this.c(), F = Game.flags;
    if (D.ride === 'car') { if (Speedway.on && !Speedway.frozen()) list.push({ label: 'Quit (hop out)', fn: () => Car.exit() }); if (!Speedway.on) list.push({ label: 'Hop out of the car', fn: () => { Car.exit(); if (Convoy.on) toast('The whole field stops and waits. Forty engines, idling. For you.'); } }); return list; }
    if (D.ride) return list;
    for (const v of Game.vehicles || []) if (v.kind === 'car' && near(v, 24)) {
      if (v.id === 'pace') list.push({ label: 'Get in the pace car', fn: () => { Car.enter(v); Convoy.on = true; Convoy.hist = []; toast('The whole field falls in behind you. Forty cars. Go slow.'); } });
      if (v.id === 'car29') list.push({ label: c.n === 7 && c.d === 1 && qOpen('qualify') ? 'Get in the #29 (qualify)' : c.n === 7 && c.d === 3 && qOpen('race') ? 'Get in the #29 (RACE)' : 'Get in the #29',
        fn: () => { Car.enter(v); if (c.n === 7 && c.d === 1 && qOpen('qualify')) Speedway.start('qualify'); else if (c.n === 7 && c.d === 3 && qOpen('race')) Speedway.start('race'); } });
    }
    return list;
  },
  target(q) {
    const S_ = DSP(), who = id => Game.npcs.find(n => n.id === id), veh = id => (Game.vehicles || []).find(v => v.id === id);
    switch (q.id) {
      case 'bus6': return DAYTONA() ? null : World.spots.stationDoor || null;
      case 'marshal': return who('tammy');
      case 'pacelap': return Game.car ? S_.finish : veh('pace');
      case 'donuts': return S_.drive;
      case 'rusty': return who('rusty');
      case 'donna': return Game.dan.carry === 'donutsign' ? who('donna') : Game.flags.donutSign ? who('tiny') : who('donna');
      case 'qualify': return Game.car ? S_.finish : veh('car29');
      case 'chip': case 'accuse': return who('chip');
      case 'clues': { const F = Game.flags; return !F.clueTammy ? who('tammy') : !F.clueTiny ? who('tiny') : who('donna'); }
      case 'tires': return who('wrench');
      case 'race': return Game.car ? null : veh('car29');
    }
    return undefined;
  },
};
ICONS.donutsign = { key: { o: 'ink', p: 'hat', w: 'white', y: 'yellow' }, rows: [
  '..........', 'oooooooooo', 'owwwwwwwwo', 'owppwppwwo', 'owpwwpwpwo', 'owppwppwwo', 'owwwwwwwwo', 'oooooooooo', '....oo....', '....oo....'] };

// ---------- Volusia County trials ----------
CLEAN_LIMIT[6] = 9; CLEAN_LIMIT[7] = 9;
CREDITS[6] = ['NOT GUILTY (OF PACING)', 'The drive-thru has a sign now: NO RACE CARS.<br>Donna sold a record 492 donuts. Rusty is sober-ish and back in business.<br>And Rusty’s driver just quit.', 'Next case'];
CREDITS[7] = ['DAYTONA 250 CHAMPION', 'Chip Sterling is doing community service: washing stock cars with a toothbrush.<br>The #29 hangs in Rusty’s garage. Swamp Lite made Dan a commercial. It is 40 seconds of him burping.<br><br>The swamp, Miami and Daytona are all yours now. Ride the Greyhound anytime.', 'Keep being Dan'];
const DaytonaCourt = {
  donut() {
    CourtCases.begin();
    say([['BAILIFF', 'All rise for the Honorable Judge Beau Pettibone.'], ['JUDGE PETTIBONE', 'Mr. Dupree. I have read about you. In three counties. At breakfast. It ruined three breakfasts.'], ...CourtCases.clean(6),
      ['JUDGE PETTIBONE', 'Reckless Pacing. Unlawful Parade. Prosecution.'], ['PROSECUTOR DUKE', 'Your Honor, I will describe the incident. The defense may object to anything false.'], ['BRENDA', '(whispering) Only the LIES, Dan.']],
    () => { Objection.speaker = 'PROSECUTOR DUKE'; Objection.run([
      { text: 'The defendant drove the pace car off the track.', lie: false, over: 'He did. We all watched. On television.' },
      { text: 'The defendant was going over 100 miles per hour.', lie: true, bust: 'He was doing eleven. The pace car was doing eleven. That is the WHOLE POINT of a pace car.' },
      { text: 'Forty race cars followed him into a Donut Hut.', lie: false, over: 'Forty-one, if you count the ambulance.' },
      { text: 'The defendant ordered one donut.', lie: true, bust: 'He ordered forty-one dozen. It’s on the receipt. It’s a very long receipt.' },
      { text: 'The defendant is a licensed race car driver.', lie: true, bust: 'He has a cooler license. That is not a thing.' },
    ], () => this.donutEnd()); });
  },
  donutEnd() {
    const F = Game.flags, wit = [F.witRusty && 'Rusty Lugnuts', F.witDonna && 'Donna'].filter(Boolean);
    say([['BRENDA', wit.length ? `The defense calls ${wit.join(' and ')}.` : 'The defense has... no witnesses. It’s been a long week, Your Honor.'],
      ...(F.witRusty ? [['RUSTY', 'He changed four tires in eight seconds, Your Honor. That man is a RACER.']] : []),
      ...(F.witDonna ? [['DONNA', 'Best sales day in Donut Hut history. I would like him to do it again. Every Sunday.']] : []),
      ['JUDGE PETTIBONE', '...The court finds the defendant NOT GUILTY of Reckless Pacing. The court was also hungry that day. The court got a donut.'],
      ['RUSTY', 'Your Honor, one more thing. My driver quit this morning. Dan... the Daytona 250 is in three days.'], ['DAN', 'Rusty. Are you asking me to drive a stock car.'], ['RUSTY', 'I’m BEGGIN’ you.'], [PHONE_B, 'Absolutely not.'], ['DAN', 'Absolutely yes.']],
    () => { headline('FLORIDA MAN CLEARED OF "RECKLESS PACING"; JUDGE "HUNGRY NOW"', 8); F.case6Won = true; F.creditsPending = 6; endDay('court'); });
  },
  race() {
    CourtCases.begin();
    say([['BAILIFF', 'All rise. Again. For Judge Pettibone. Again.'], ['JUDGE PETTIBONE', 'Mr. Dupree. Three days ago you were a defendant. Now you are the Daytona 250 champion. And a defendant.'], ...CourtCases.clean(7),
      ['JUDGE PETTIBONE', 'Sterling v. Dupree. Unlicensed racing. Unauthorized burnouts. Emotional damages.'], ['CHIP’S LAWYER', 'I will describe the facts, Your Honor.'], ['BRENDA', '(whispering) Lies only, Dan. You know the drill.']],
    () => { Objection.speaker = 'CHIP’S LAWYER'; Objection.run([
      { text: 'Mr. Dupree won the race.', lie: false, over: 'He did. By a lot. I watched it twice.' },
      { text: 'Mr. Sterling was home asleep the night the #29 was sabotaged.', lie: true, bust: 'He bought forty donuts at 3 AM on a company card. Donna kept the receipt.' },
      { text: 'Mr. Sterling has never owned a green Gator Juice jacket.', lie: true, bust: 'A biker named Tiny is wearing it RIGHT NOW. In the gallery. Wave, Tiny.' },
      { text: 'Mr. Dupree did a burnout in victory lane.', lie: false, over: 'For eleven minutes. The paint is still on the asphalt.' },
      { text: 'Mr. Sterling has a spotless record.', lie: true, bust: 'He has four speeding tickets and a restraining order from a mascot.' },
    ], () => this.raceEnd()); });
  },
  raceEnd() {
    const F = Game.flags;
    say([['JUDGE PETTIBONE', 'Mr. Sterling, is there anything you would like to say?'], ['CHIP STERLING', 'I... I just wanted to win ONE time. Without paying for it.'], ['', '*CRASH*'], ['', 'The doors burst open. It’s Chuck. He took the Greyhound again. He is wearing a tiny checkered flag.'],
      ['JUDGE PETTIBONE', 'IS THAT AN ALLIGATOR?'], ['DAN', 'That’s Chuck. He comes to all my trials. He’s like a support animal but mean.'], ['', 'Chuck walks up to Chip Sterling and sits on him. Chip confesses to everything, very quickly.'],
      ['JUDGE PETTIBONE', 'Case dismissed. Mr. Sterling, you are under arrest for sabotage. Mr. Dupree, you are... the Daytona 250 champion. God help us.'], ['BRENDA', 'Dan. You’re a champion.'], ['DAN', 'I’m still not a Florida Man.'], ['BRENDA', 'You are the MOST Florida Man.']],
    () => { headline('ENERGY DRINK MOGUL ARRESTED FOR SABOTAGING FLORIDA MAN’S STOCK CAR; FLORIDA MAN "NOT SURPRISED"', 10); F.case7Won = true; F.creditsPending = 7; endDay('court'); });
  },
};

// ---------- Daytona side gigs ----------
Object.assign(GIGS, {
  donuts: { giver: 'donna', pay: 30, quest: 'Deliver donuts to 3 garages in the speedway infield',
    offer: [['DONNA', 'The pit crews ordered donuts. Nobody delivers to the infield. Except, apparently, you.'], ['DONNA', 'Three garages. Thirty bucks. Don’t eat the product.']],
    start() { G_().garages = []; }, check: () => (G_().garages || []).length >= 3,
    hl: 'FLORIDA MAN DELIVERS DONUTS TO NASCAR PIT CREWS, EATS "ONLY FOUR"' },
  helmet: { giver: 'tiny', pay: 35, quest: 'Find Tiny’s lucky helmet on the beach and bring it back',
    offer: [['TINY', 'Lost my lucky helmet on the beach last night. Don’t ask how. I don’t know how.'], ['TINY', 'Find it, thirty-five bucks. Don’t wear it. It’s lucky for ME.']],
    start() { for (let k = 0; k < 300; k++) { const x = rnd(70, 78) * TS, y = rnd(4, 56) * TS; if (World.at(x, y) === T.SAND && !World.solidAt(x, y)) { Game.pickups.push({ kind: 'helmet', x, y }); break; } } },
    talkActive: () => Game.dan.carry === 'helmet' ? (Game.dan.carry = null, 'done') : [['TINY', 'Beach, man. Somewhere on the beach. Probably.']],
    hl: 'FLORIDA MAN RETURNS BIKER’S "LUCKY HELMET" FOUND IN SAND; BIKER WEEPS OPENLY' },
  pitcrew: { giver: 'tammy', pay: 30, quest: 'Run a pit crew drill for Tammy Jo (talk to her to start)',
    offer: [['TAMMY JO', 'The crews need a pace-setter for pit drills. Somebody fast. Or somebody who mashes buttons like a raccoon.'], ['TAMMY JO', 'Thirty bucks. Four tires. Go.']],
    start() { Game.afterTalk = () => DaytonaCases.pitStop(() => { G_().pitDone = true; }, () => toast('Too slow. Talk to Tammy Jo to try again.')); },
    talkActive: () => G_().pitDone ? 'done' : (Game.afterTalk = () => DaytonaCases.pitStop(() => { G_().pitDone = true; }, () => toast('Too slow. Talk to Tammy Jo to try again.')), [['TAMMY JO', 'Again! Tires! GO!']]),
    check: () => !!G_().pitDone,
    hl: 'FLORIDA MAN SETS PIT DRILL RECORD, IS NOT EMPLOYED BY ANY RACING TEAM' },
});
ICONS.helmet = { key: { o: 'ink', b: 'black', w: 'white', r: 'red' }, rows: [
  '..........', '...oooo...', '..obbbbo..', '.obbwwbbo.', '.obrrrrbo.', '.obbbbbbo.', '.oooooooo.', '..........', '..........', '..........'] };
const DaytonaGigs = {
  interaction() {
    const D = Game.dan, G = G_(), near = (p, r) => Math.hypot(D.x - p.x, D.y - p.y) < r;
    if (G.active === 'donuts') for (const p of World.props.filter(p => p.kind === 'garage')) if (!G.garages.includes(p.n) && near({ x: p.x + p.w / 2, y: p.y + p.h + 8 }, 24)) return { label: `Drop donuts at garage #${p.n}`, fn: () => { G.garages.push(p.n); Sound.play('pickup'); toast(`PIT CREW #${p.n}: “DONUTS!!!” (${G.garages.length}/3)`); questText('gig_donuts', `Deliver donuts to 3 garages in the speedway infield (${G.garages.length}/3)`); } };
    return null;
  },
  target(id) {
    const G = G_(), who = n => Game.npcs.find(x => x.id === n);
    if (id === 'donuts') { const p = World.props.find(p => p.kind === 'garage' && !G.garages.includes(p.n)); return p ? { x: p.x + p.w / 2, y: p.y + p.h + 8 } : null; }
    if (id === 'helmet') return Game.dan.carry === 'helmet' ? who('tiny') : Game.pickups.find(p => p.kind === 'helmet');
    if (id === 'pitcrew') return who('tammy');
    return null;
  },
};

// ---------- Ink & Regret, Wrench's Speed Shop ----------
Object.assign(UPGRADES, {
  tatmom: { name: '“MOM” Heart Tattoo', price: 60, desc: 'Classic. Timeless. Mom will not be impressed.', shop: 'ink' },
  tatgator: { name: 'Gator Tattoo', price: 90, desc: 'A gator. On your arm. It looks like Chuck.', shop: 'ink' },
  tatflorida: { name: 'Florida Outline Tattoo', price: 75, desc: 'The whole state. Upside down. Needles was drunk.', shop: 'ink' },
  nitro: { name: 'Nitrous Kit', price: 250, desc: 'Hold RUN in the cooler or any car: a lot faster, a little on fire.', shop: 'speed' },
  stripes: { name: 'Racing Stripes', price: 70, desc: 'For the cooler. Adds 0 mph. Adds 100% cool.', shop: 'speed' },
  horn: { name: 'Dixie Horn', price: 45, desc: 'Yell GIT on the cooler: it plays a horn. Everything scatters.', shop: 'speed' },
});
for (const k of ['tatmom', 'tatgator', 'tatflorida', 'nitro', 'stripes', 'horn']) ITEMS[k] = { ...UPGRADES[k], upgrade: true };
Object.assign(ICONS, {
  tatmom: { key: { o: 'ink', r: 'red', s: 'skin' }, rows: ['..........', '.oo...oo..', 'orro.orro.', 'orrrorrro.', 'orrrrrrro.', '.orrrrro..', '..orrro...', '...oro....', '....o.....', '..........'] },
  tatgator: { key: { o: 'ink', g: 'gator', d: 'gatorD', w: 'white' }, rows: ['..........', '..........', 'ooooooo...', 'ogggggoo..', 'ogwgggggoo', 'ogggggggwo', 'odddddddoo', 'oooooooo..', '..........', '..........'] },
  tatflorida: { key: { o: 'ink', g: 'grassL', b: 'blue' }, rows: ['..........', 'oooooooo..', 'oggggggo..', '.ooooggo..', '....ogggo.', '.....oggo.', '.....oggo.', '......ogo.', '......oo..', '..........'] },
  nitro: { key: { o: 'ink', b: 'blue', w: 'white', r: 'red' }, rows: ['...oo.....', '..owwo....', '..obbo....', '..obbo....', '..owwo....', '..obbo....', '..obbo....', '..obbo....', '...oo.....', '..rrrr....'] },
  stripes: { key: { o: 'ink', w: 'white', r: 'red', b: 'blue' }, rows: ['..........', 'oooooooooo', 'owwrrbbwwo', 'owwrrbbwwo', 'owwrrbbwwo', 'owwrrbbwwo', 'oooooooooo', '..........', '..........', '..........'] },
  horn: { key: { o: 'ink', y: 'yellow', d: 'orange' }, rows: ['..........', '........o.', '......oyo.', '....oyyyo.', 'ooooyyyyo.', 'oddoyyyyo.', 'ooooyyyyo.', '....oyyyo.', '......oyo.', '........o.'] },
});
function drawTattoos(x, y, bob) {   // tiny, but they're there
  if (hasUp('tatmom')) R(x - 7, y - 11 + bob, 2, 1, PAL.red);
  if (hasUp('tatgator')) R(x + 5, y - 11 + bob, 2, 2, PAL.gatorD);
  if (hasUp('tatflorida')) R(x - 7, y - 9 + bob, 1, 2, PAL.blue);
}
