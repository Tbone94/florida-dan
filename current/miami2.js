// FLORIDA DAN — Miami set pieces: the brakeless Lambo, the Club Sinus dance-off, the Ocean
// Drive race, the yacht party, the Señor Pelícano boat chase, and both Miami-Dade trials.
'use strict';

// ---------- the pink Lambo: it only goes forward, and it goes forward FAST ----------
const Lambo = {
  car: null,
  enter(v) { this.car = v; v.v = 30; v.t = 0; v.warned = false; Game.dan.ride = 'lambo'; Game.dan.x = v.x; Game.dan.y = v.y; Sound.play('engine'); toast('Push-to-start. Nice. Where are the... where are the BRAKES?', 3.5); },
  tick(dt) {
    const v = this.car; if (!v || Game.dan.ride !== 'lambo' || Game.mode !== 'play') return;
    v.t += dt; v.v = Math.min(210, v.v + dt * 48);
    v.a += Input.axis().x * dt * 2.8;
    if (v.t > 8) { v.a += Math.sin(0 - v.a) * dt * 1.4; if (!v.warned) { v.warned = true; toast('THE GAS PEDAL IS STUCK. THE OCEAN IS RIGHT THERE.', 3); Game.shake = 4; } }
    const nx = v.x + Math.cos(v.a) * v.v * dt, ny = v.y + Math.sin(v.a) * v.v * dt;
    if (WET(World.at(nx, ny))) { v.x = nx; v.y = ny; return this.sink(); }
    if (World.solidAt(nx, ny) || nx < 12 || ny < 12 || ny > MH * TS - 12) { v.a += Math.PI * .7; v.v *= .5; Game.shake = 6; Sound.play('hurt'); toast(pick(['BONK.', 'Scratched it. It’s fine. It’s FINE.', 'That was a palm tree. The palm tree won.'])); return; }
    v.x = nx; v.y = ny; Object.assign(Game.dan, { x: v.x, y: v.y, dir: dirOf(Math.cos(v.a), Math.sin(v.a)) });
    if (Math.random() < dt * 12) Sound.play('engine');
    if (Math.random() < dt * 20) Game.parts.push({ kind: 'speed', x: v.x - Math.cos(v.a) * 14, y: v.y - Math.sin(v.a) * 14, vx: -Math.cos(v.a) * 40, vy: -Math.sin(v.a) * 40, life: .25 });
  },
  sink() {
    const v = this.car; this.car = null; Game.flags.lamboSunk = true; Look.mark('skid', v.x - 150, v.y, { x2: v.x - 12, y2: v.y }, true); Game.vehicles = []; Game.dan.ride = null;   // skid marks into the Atlantic, forever
    splash(v.x, v.y, 30); Sound.play('splash'); Game.shake = 10; Game.flash = .5;
    const shore = { x: 71.5 * TS, y: v.y }; Object.assign(Game.dan, { x: shore.x, y: clamp(shore.y, 3 * TS, 57 * TS), dir: 'right' });
    say([['', '*SPLOOSH*'], ['', 'The pink Lamborghini drives directly into the Atlantic Ocean. It floats for one beautiful second. Then it does not.'],
      ['', 'Dan wades back to shore. A crowd has gathered. Every phone is out.'], ['TOURIST', 'Sir, why did you drive into the ocean?!'], ['DAN', 'The car don’t surf.'],
      [PHONE_B, 'Dan. DAN. You’re trending in fourteen countries.']], () => {
      headline('FLORIDA MAN VALETS PINK LAMBORGHINI DIRECTLY INTO ATLANTIC OCEAN; "THE CAR DON’T SURF," HE EXPLAINS', 9);
      done('valet'); addQuest('bed', 'Go back to the Hotel Neon (sleep)');
    });
  },
  draw(cx, cy, t) {
    for (const v of Game.vehicles || []) if (v.kind === 'lambo') {
      const x = Math.round(v.x - cx), y = Math.round(v.y - cy);
      shadow(x, y + 5, 30, 7);
      g.save(); g.translate(x, y); g.rotate(v.a);
      g.fillStyle = PAL.ink; g.fillRect(-16, -8, 32, 16); g.fillStyle = '#ff5ea8'; g.fillRect(-15, -7, 30, 14);
      g.fillStyle = '#ffc2d6'; g.fillRect(-15, -7, 30, 3); g.fillStyle = '#9fe8f0'; g.fillRect(2, -5, 6, 10); g.fillStyle = '#c23a7d'; g.fillRect(-16, -8, 3, 16);
      g.fillStyle = PAL.black; for (const [wx, wy] of [[-10, -9], [7, -9], [-10, 7], [7, 7]]) g.fillRect(wx, wy, 5, 2);
      if (Game.dan.ride === 'lambo') { g.fillStyle = PAL.skin; g.fillRect(-4, -3, 5, 6); g.fillStyle = PAL.hat; g.fillRect(-5, -4, 5, 3); }
      g.restore();
      if (Game.dan.ride !== 'lambo') label('PINK LAMBO', x, y - 12, '#ff5ea8', 7);
    }
  },
};

// ---------- Club Sinus dance-off ----------
const Dance = {
  s: null,
  start(then, o = {}) {   // o: { who, title, sprite, sunset } — Mallory Square reuses the club dance-off
    const seq = []; for (let i = 0; i < 16; i++) seq.push({ dir: pick(['up', 'down', 'left', 'right']), t: 1.4 + i * .6, hit: null });
    this.s = { seq, t: 0, score: 0, then, o, who: o.who || 'DJ FLAMINGO', flash: '', flashT: 0 }; Game.mode = 'dance'; showHud(false); padFor(true);   // the HUD sat on top of the arrow lane
    ui.wrestle.hidden = false; ui.wrestleMsg.textContent = 'DANCE-OFF!'; ui.gripFill.style.width = '0%';
    ui.wrestle.querySelector('.hint').textContent = 'HIT THE ARROW WHEN IT REACHES THE BOX · 11 OF 16 TO WIN';
    Sound.play('headline');
  },
  update(dt) {
    const s = this.s; if (!s) { Game.mode = 'play'; return; }
    s.t += dt; s.flashT -= dt;
    const hit = ['up', 'down', 'left', 'right'].find(k => Input.tapped(k)) || (isTouch ? Wrestle.swipe() : null);   // a flick of the touch stick counts (keyboard arrows are already taps)
    if (hit) {
      const n = s.seq.find(n => n.hit === null && Math.abs(n.t - s.t) < .24);
      if (n && n.dir === hit) { n.hit = true; s.score++; s.flash = pick(['NICE!', 'SMOOTH!', 'HIPS DON’T LIE!', 'WEDDING MOVES!']); Sound.play('cash'); }
      else { if (n) n.hit = false; s.flash = pick(['MISS!', 'DAD MOVES!', 'OOF.']); Sound.play('fail'); }
      s.flashT = .5;
    }
    for (const n of s.seq) if (n.hit === null && s.t - n.t > .24) { n.hit = false; s.flash = 'MISS!'; s.flashT = .4; }
    ui.gripFill.style.width = (s.score / 11 * 100) + '%'; ui.wrestleMsg.textContent = s.flashT > 0 ? s.flash : `DANCE-OFF! ${s.score}/16`;
    if (s.t > s.seq[s.seq.length - 1].t + .9) this.finish();
  },
  finish() {
    const s = this.s; this.s = null; showHud(true); padFor(false); ui.wrestle.hidden = true; ui.wrestle.querySelector('.hint').textContent = `MASH ${KT('a')} · HIT THE ARROW WHEN HE THRASHES`; Game.mode = 'play';
    if (s.score >= 11) s.then();
    else say([[s.who, `${s.score} out of 16? My GRANDMA hits more beats than that.`], [s.who, 'Again. From the top?', [['“Hit it.”', () => { s.again = true; }], ['“Gimme a minute.”', () => [[s.who, 'Take your time, abuelo. The floor ain’t goin’ nowhere.']]]]]], () => { if (s.again) Dance.start(s.then, s.o); });
  },
  sunsetBg(t) {   // Mallory Square: the sun going into the Gulf, a crowd, a guy with a cat act
    for (let y = 0; y < 110; y += 5) { const k = y / 110; R(0, y, VW, 5, `rgb(${Math.round(255 - 40 * k)},${Math.round(120 + 60 * k)},${Math.round(90 + 60 * (1 - k))})`); }
    g.fillStyle = '#ffe36b'; g.beginPath(); g.arc(VW / 2, 104, 26, Math.PI, 0); g.fill(); R(0, 104, VW, 30, '#2a7fa0'); for (let i = 0; i < 12; i++) R(40 + i * 21, 108 + (i % 3) * 5, 10, 1, '#ffd29a');
    R(0, 128, VW, 52, '#b8b3a8'); for (let x = 0; x < VW; x += 16) R(x, 128, 1, 52, '#a09b90');
    for (let i = 0; i < 14; i++) { const x = 8 + i * 23, bob = Math.round(Math.abs(Math.sin(t * 5 + i)) * 2); OR(x, 116 - bob, 8, 12, [PAL.hat, PAL.teal, PAL.yellow, PAL.white, PAL.orange][i % 5]); R(x + 1, 111 - bob, 6, 5, i % 3 ? PAL.skin : '#b8704f'); }
  },
  draw() {
    const s = this.s, t = Game.t; if (!s) return;
    if (s.o.sunset) this.sunsetBg(t); else {
    R(0, 0, VW, VH, '#150f24');
    for (let y = 0; y < 5; y++) for (let x = 0; x < 10; x++) { const on = (x + y + Math.floor(t * 4)) % 3 === 0; R(x * 32, 70 + y * 16, 31, 15, on ? ['#ff4fd8', '#27c6b4', '#ffd23f'][(x + y) % 3] : '#2a2136'); }
    for (let i = 0; i < 5; i++) { g.globalAlpha = .18; g.fillStyle = ['#ff4fd8', '#27c6b4', '#ffd23f'][i % 3]; g.beginPath(); g.moveTo(40 + i * 60, 0); g.lineTo(20 + i * 60 + Math.sin(t * 2 + i) * 40, 150); g.lineTo(70 + i * 60 + Math.sin(t * 2 + i) * 40, 150); g.fill(); } g.globalAlpha = 1;
    label('CLUB SINUS', VW / 2, 16, '#27c6b4', 9); }
    const next = s.seq.find(n => n.hit === null), pose = next ? next.dir : 'down', bounce = Math.round(Math.abs(Math.sin(t * 6)) * 3);
    g.drawImage(SPR.dan[pose === 'up' ? 'up' : pose === 'left' ? 'left' : pose === 'right' ? 'right' : 'down'][Math.floor(t * 6) % 2], 176, 64 - bounce);
    g.drawImage(SPR[s.o.sprite || 'dj'].down[Math.floor(t * 5) % 2], 120, 64 - Math.round(Math.abs(Math.cos(t * 6)) * 3));
    OR(14, 138, 292, 26, '#0c0a10'); OR(30, 140, 22, 22, '#3b2f4a');
    const arrow = (x, y, dir, c) => { g.save(); g.translate(x, y); g.rotate({ right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[dir]); g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(9, 0); g.lineTo(-6, -8); g.lineTo(-6, 8); g.fill(); g.fillStyle = c; g.beginPath(); g.moveTo(6, 0); g.lineTo(-4, -5.5); g.lineTo(-4, 5.5); g.fill(); g.restore(); };
    for (const n of s.seq) { const x = 41 + (n.t - s.t) * 110; if (x < 20 || x > 310 || n.hit === true) continue; arrow(x, 151, n.dir, n.hit === false ? '#5d5a66' : { up: '#ff4fd8', down: '#27c6b4', left: '#ffd23f', right: '#ff8a3d' }[n.dir]); }
  },
};

// ---------- the Ocean Drive race ----------
const Race = {
  on: false, finish: 44 * TS,
  start() {
    const r = Game.npcs.find(n => n.id === 'raul'); if (!r) return;
    this.on = true; r.race = true; r.skate = 0; r.x = 57 * TS; r.y = 10 * TS;
    if (!Game.dan.ride) { Game.dan.x = 56.4 * TS; Game.dan.y = 10 * TS; }
    note('Race to the Flamingo Hotel! (Raul is fast. A cafecito or the cooler would help.)', 4); Sound.play('siren');
  },
  tick(dt) {
    const r = Game.npcs.find(n => n.id === 'raul'), D = Game.dan; if (!r) return;
    r.y += 84 * dt; r.dir = 'down'; r.moving = true; r.t += dt; if (Math.floor(r.t * 6) % 2 !== r.frame) r.frame ^= 1;
    if (D.y >= this.finish && Math.abs(D.x - 57 * TS) < 80) return this.end(true);
    if (r.y >= this.finish) this.end(false);
  },
  end(won) {
    this.lastWon = won;
    this.on = false; const r = Game.npcs.find(n => n.id === 'raul'); if (r) { r.race = false; r.skate = 1; }
    if (won) { done('raul'); Game.flags.witRaul = true; headline('FLORIDA MAN BEATS ROLLERBLADER IN OCEAN DRIVE RACE; ROLLERBLADER "DEVASTATED," DEMANDS REMATCH', 3); say([['RAUL', 'NO WAY. NO WAY, BRO. You beat me. I’ll testify. I’ll testify SO hard.']]); }
    else say([['RAUL', 'Too slow, Florida Man! Grab a cafecito and try again, bro. I’ll be skating.']]);
  },
};

// ---------- the yacht party: blend in, don't get thrown in the bay ----------
const GUESTS = [
  ['HEDGE FUND GUY', 'So, bro. What do you do?', [['“Crypto.”', true, 'Based. Based, bro.'], ['“I wrestle alligators.”', false, 'That’s... not a job, bro.'], ['“I got a jon boat named SS Budget.”', false, 'Is that... a startup?']]],
  ['INFLUENCER', 'Is this your first yacht?', [['“It’s my fourth this week.”', true, 'Oh my GOD, same.'], ['“I live in a swamp.”', false, 'Like... a metaphorical swamp?'], ['“I thought it was just a big boat.”', false, 'Security?']]],
  ['WOMAN IN SUNGLASSES', 'Have you tried the... medicine?', [['“Only for my sinuses.”', true, 'Mm. Discreet. I like you.'], ['“I brought my own.”', false, 'From... WHERE?'], ['“Is that the roller dog stuff?”', false, 'The WHAT?']]],
];
const Party = {
  sus: 0,
  begin() {
    this.sus = 0; const spots = [[10, 26], [9.5, 31], [10.5, 34]];
    GUESTS.forEach((gst, i) => Game.npcs.push(makeNPC('guest', gst[0][0] + gst[0].slice(1).toLowerCase(), spots[i][0] * TS, spots[i][1] * TS, 'left', { sprite: ['dj', 'sheila', 'goon'][i], guest: i, quest: true })));
    Sound.play('headline'); note('You’re in. Blend in with 3 guests. Don’t say anything Florida.', 4);
  },
  talk(n) {
    const [who, q, opts] = GUESTS[n.guest];
    if (n.talked) return say([[who, pick(['Great party, right?', 'Love your suit.', 'Have you seen the boss? He’s... unusual.'])]]);
    say([[who, q, opts.map(([label, good, reply]) => [label, () => {
      n.talked = true; n.quest = false;
      if (!good) { this.sus++; Game.shake = 3; note(`SUSPICION ${'■'.repeat(this.sus)}${'□'.repeat(3 - this.sus)}`, 2); }
      const out = [[who, reply]];
      if (this.sus >= 3) out.push(['', 'Two goons pick Dan up by the suit and throw him into Biscayne Bay.'], ['DAN', '(from the water) WORTH IT.'], ['BOUNCER', 'Come back when you’re less... you.']);
      return out;
    }])]], () => {
      if (this.sus >= 3) { this.sus = 0; splash(Game.dan.x, Game.dan.y, 20); Game.npcs.filter(g => g.guest !== undefined).forEach(g => { g.talked = false; g.quest = true; }); headline('FLORIDA MAN THROWN OFF YACHT PARTY FOR "BEING TOO FLORIDA"', 3); return; }
      if (Game.npcs.filter(g => g.guest !== undefined).every(g => g.talked)) { done('mingle'); note('Nobody suspects a thing. The boss is by the boats.'); }
    });
  },
  boss() {
    say([['', 'The crowd parts. At the end of the dock, in a tiny white suit and tiny gold chain, stands the boss of the Sinus Cartel.'], ['', 'It is a pelican.'],
      ['SEÑOR PELÍCANO', '*SQUAWK*'], ['DAN', 'YOU. You’ve been stealing my fish since MONDAY.'], ['SEÑOR PELÍCANO', '*squawk squawk* (it sounds smug)'],
      ['', 'The pelican leaps into a cigarette boat and guns it into the bay.'], ['DET. ROCKET', '(in an earpiece) DUPREE. GET IN YOUR BOAT.']], () => BoatChase.start());
  },
};

// ---------- Señor Pelícano boat chase (stay on his tail for a second to catch him) ----------
const BoatChase = {
  boat: null, hold: 0,
  route: [[2, 30], [2, 50], [6.5, 56], [6.5, 42], [1.5, 20], [1.5, 6], [6.5, 3], [6.5, 18]],
  start() {
    this.boat = { x: 2 * TS, y: 46 * TS, i: 1, dir: 'down' }; this.hold = 0;   // he gets a head start down the bay
    Game.npcs = Game.npcs.filter(g => g.guest === undefined);
    addQuest('chase', 'Chase Señor Pelícano in your boat (marina)!'); Sound.play('siren');
  },
  tick(dt) {
    const b = this.boat; if (!b || Game.mode !== 'play') return;
    const wp = this.route[b.i % this.route.length], tx = wp[0] * TS, ty = wp[1] * TS, dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy);
    const sp = Game.dan.ride === 'boat' ? 68 : 14;
    if (d < 6) b.i++; else { b.x += dx / d * sp * dt; b.y += dy / d * sp * dt; b.dir = dirOf(dx, dy); }
    if (Math.random() < dt * 8) Game.parts.push({ kind: 'foam', x: b.x - dx / (d || 1) * 12, y: b.y - dy / (d || 1) * 12 + 3, vx: 0, vy: 0, life: .8 });
    const D = Game.dan, close = D.ride === 'boat' && Math.hypot(D.x - b.x, D.y - b.y) < 20;
    this.hold = close ? this.hold + dt : Math.max(0, this.hold - dt * .6);
    if (close && Math.random() < dt * 3) note(pick(['STAY ON HIM!', 'Closer... CLOSER...', 'He’s squawking at you!']), .8);
    if (this.hold > 1.1) this.caught();
  },
  caught() {
    this.boat = null; done('chase'); done('boss'); Sound.play('catch'); Game.flash = .6;
    headline('FLORIDA MAN CATCHES SINUS CARTEL BOSS IN BOAT CHASE; BOSS IS A PELICAN', 7);
    say([['', 'Dan pulls alongside, reaches over, and grabs Señor Pelícano by the tiny gold chain.'], ['SEÑOR PELÍCANO', '*SQUAWK!!*'], ['DAN', 'Hello, fish thief.'],
      ['DET. TUBBS', '(pulling up in a pastel speedboat) Dupree. You did it.'], ['DET. ROCKET', 'Señor Pelícano, you’re under arrest for trafficking sinus medicine, and for about forty counts of fish theft.'],
      ['DAN', 'Add one more. He took my bass on Monday.']], () => addQuest('bed', 'Go back to the Hotel Neon (sleep)'));
  },
  draw(cx, cy, t) {
    const b = this.boat; if (!b) return;
    const x = Math.round(b.x - cx), y = Math.round(b.y - cy + Math.sin(t * 6)), horiz = b.dir === 'left' || b.dir === 'right', w = horiz ? 30 : 14, h = horiz ? 12 : 28;
    R(x - w / 2 - 2, y + h / 2 - 1, w + 4, 2, PAL.foam); OR(x - w / 2, y - h / 2, w, h, PAL.white); R(x - w / 2 + 2, y - 1, w - 4, 2, '#ff4fd8');
    g.drawImage(SPR.pelican, x - 7, y - 20); R(x - 3, y - 9, 6, 2, PAL.white); R(x - 1, y - 7, 2, 1, PAL.yellow);   // tiny suit + chain
    label('SEÑOR PELÍCANO', x, y - 24, PAL.yellow, 7);
  },
};

// ---------- Miami-Dade trials ----------
CLEAN_LIMIT[4] = 9; CLEAN_LIMIT[5] = 9;
CREDITS[4] = ['CASE DISMISSED', 'The octopus got a record deal.<br>“THE CAR DON’T SURF” is number one in eleven countries.<br>Dan got free cafecito for life.', 'Next case'];
CREDITS[5] = ['HONORARY DETECTIVE DAN', 'The Sinus Cartel is busted. Señor Pelícano is doing ten to twenty in a very nice aviary.<br>The swamp and Miami are both yours: ride the Greyhound anytime.<br><br>(More of Florida is coming.)', 'Keep being Dan'];
// court cast: a tiny pelican in a tiny orange jumpsuit (and a tiny hat Chuck is about to eat), Chuck's tiny sunglasses,
// DJ Flamingo wearing the octopus, and the props that fly across the room
const MIAMI_HAT = (() => { const c = document.createElement('canvas'); c.width = 9; c.height = 5; const x = c.getContext('2d'); x.fillStyle = '#1b1320'; x.fillRect(0, 3, 9, 2); x.fillRect(2, 0, 5, 4); x.fillStyle = '#ff4fd8'; x.fillRect(2, 2, 5, 1); return c; })();
const MIAMI_BADGE = (() => { const c = document.createElement('canvas'); c.width = 7; c.height = 8; const x = c.getContext('2d'); x.fillStyle = '#1b1320'; x.fillRect(0, 0, 7, 8); x.fillStyle = '#ff9ecf'; x.fillRect(1, 1, 5, 6); x.fillStyle = '#9fe8f0'; x.fillRect(3, 2, 1, 4); x.fillRect(2, 3, 3, 2); return c; })();
const miamiPelican = (a, t) => {
  const bob = a.moving ? Math.round(Math.abs(Math.sin(t * 14))) : 0;
  g.save(); g.translate(Math.round(a.x), Math.round(a.y - 18 - bob)); if (a.flip) g.scale(-1, 1); g.scale(1.5, 1.5); g.translate(-7, 0);
  g.drawImage(SPR.pelican, 0, 0);
  R(1, 6, 8, 4, '#ff8a1e'); R(4, 6, 1, 4, '#c85a10');
  if (a.hat) g.drawImage(MIAMI_HAT, 1, -4);
  g.restore();
};
const miamiShades = a => {
  const c = (Game.courtActors || []).find(x => x.id === 'chuck'); if (!c || c.belly) return;
  a.y = c.y + 3; const k = c.dir === 'right' ? 1 : -1, x = Math.round(c.x + k * 14), y = Math.round(c.y);
  for (const oy of [-9, 4]) { R(x - 3, y + oy, 6, 5, PAL.ink); R(x - 2, y + oy + 1, 4, 3, '#3b3f8c'); R(x - 1, y + oy + 1, 1, 1, PAL.white); }
  R(x - 1, y - 4, 2, 8, PAL.ink);
};
const miamiDJ = (a, t) => {
  const img = SPR.dj[a.dir || 'down'][a.moving ? a.frame || 0 : 0], x = Math.round(a.x), top = Math.round(a.y - img.height);
  g.drawImage(img, x - 8, top);
  const w = Math.round(Math.sin(t * 6)), o = '#ff5a3c';
  R(x - 6, top - 10, 12, 8, PAL.ink); R(x - 5, top - 9, 10, 7, o); R(x - 3, top - 9, 3, 2, '#ffa08a');
  R(x - 4, top - 6, 3, 3, PAL.white); R(x + 1, top - 6, 3, 3, PAL.white); R(x - 3, top - 5, 1, 1, PAL.ink); R(x + 2, top - 5, 1, 1, PAL.ink);
  for (let i = 0; i < 5; i++) { const tx = x - 7 + i * 3 + (i === 0 ? -1 : i === 4 ? 1 : 0), len = 3 + ((i + w) & 1) + (i === 0 || i === 4 ? 3 : 0); R(tx - 1, top - 3, 3, len + 1, PAL.ink); R(tx, top - 3, 1, len, o); }
};

const miamiStage = () => CT.add('jurypop', null, 97, 70, 'down', { anchor: true });   // jury reactions pop in the gap beside the box, not on a juror's face
const MiamiCourt = {
  lambo() {
    CourtCases.begin();
    say([['JUDGE VEGA', 'Mr. Dupree. Collier County sent me a warning about you. It was forty pages.'], ['DAN', 'Only forty?'], ...CourtCases.clean(4),
      ['PROSECUTOR CHAD', 'Grand Theft Lambo, Your Honor. I’ll describe the events. The defense may object to anything false.']],
    () => { Objection.speaker = 'PROSECUTOR CHAD'; Objection.run([
      { text: 'The defendant took the car without permission.', lie: true, bust: 'The valet literally ASKED him to move it. It’s on video.' },
      { text: 'The car is pink.', lie: false, over: 'It is EXTREMELY pink, Counselor.' },
      { text: 'The defendant drove into the ocean on purpose.', lie: true, bust: 'The gas pedal was stuck. Everyone on Earth saw the video.' },
      { text: 'When the car was recovered, an octopus was inside it.', lie: false, over: '...That did happen. I still don’t understand it.' },
      { text: 'The defendant has never been to court before.', lie: true, bust: 'He has been to court FOUR TIMES this month, Chad.' },
    ], () => this.lamboEnd()); });
  },
  // the witnesses walk in and vouch (bubbles), then DJ Flamingo shows up wearing the octopus and drops the charges
  lamboEnd() {
    miamiStage(); const F = Game.flags, wit = [F.witAbuela && ['abuela', 112, 'He heard my WHOLE story!'], F.witRaul && ['raul', 134, 'He beat me. On a cafecito!'], F.witSheila && ['sheila', 196, 'I would die for this man.']].filter(Boolean);
    wit.forEach(([id], i) => CT.add(id, id, 318 + i * 22, 118, 'left'));
    courtCut([
      ...(wit.length ? [SC.all(wit.map(([id, x]) => SC.walk(id, x, 100, 120))), SC.all(wit.map(([id]) => SC.face(id, 'down'))), ...wit.slice(0, -1).map(([id, , l]) => SC.line(id, l, 1.3))] : []),
      SC.fx(() => CT.add('dj', 'dj', 318, 118, 'left', { draw: miamiDJ })), SC.sound('headline'),
      SC.all([SC.walk('dj', 226, 100, 110), wit.length ? SC.line(wit[wit.length - 1][0], wit[wit.length - 1][2], 1.4) : SC.line('lawyer', 'We have... no witnesses.', 1.6)]),
      SC.face('dj', 'down'), SC.emote('jurypop', '!?', .9),
      SC.line('dj', 'I wanna drop the charges.', 1.5), SC.line('judge', 'Why?', 1),
      SC.say([['DJ FLAMINGO', 'The octopus video has ninety million views. My new single, “THE CAR DON’T SURF,” is number one.'],
        ['JUDGE VEGA', '...Case dismissed. And somebody find that octopus a lawyer.']]),
    ], () => { headline('FLORIDA MAN CLEARED IN PINK LAMBO CASE AFTER OCTOPUS GOES VIRAL; "THE CAR DON’T SURF" HITS NUMBER ONE', 10); F.case4Won = true; F.creditsPending = 4; endDay('court'); });
  },
  // the defendant waddles in: a pelican in a tiny orange jumpsuit
  sinus() {
    CourtCases.begin(); miamiStage();
    CT.add('pelican', null, 318, 118, 'left', { draw: miamiPelican, hat: true });
    courtCut([
      SC.all([SC.walk('pelican', 244, 100, 45), SC.emote('jurypop', '?!', 1.2)]),
      SC.line('pelican', '*smug squawk*', 1.3),
    ], () => say([['JUDGE VEGA', 'The United States of Florida versus... a pelican. Mr. Dupree, this time you’re the WITNESS.'], ['DAN', 'That’s a first.'], ...CourtCases.clean(5),
      ['DEFENSE ATTORNEY', 'My client is a simple pelican. The defense may obj— wait. That’s YOUR job, Mr. Dupree. Object to my lies.']],
    () => { Objection.speaker = 'DEFENSE ATTORNEY'; Objection.run([
      { text: 'My client is just a regular pelican who enjoys fish.', lie: true, bust: 'He has a GOLD CHAIN, Counselor.' },
      { text: 'My client has never been on a yacht.', lie: true, bust: 'We have forty photos of him on a yacht. In a suit.' },
      { text: 'Pelicans cannot operate cigarette boats.', lie: true, bust: 'This one can. He did. Mr. Dupree chased him.' },
      { text: 'The defendant’s bales washed up on South Beach.', lie: false, over: 'That part’s true. Dan tried to RETURN them.' },
      { text: 'My client has never stolen a fish from Daniel Dupree.', lie: true, bust: 'He stole a bass on MONDAY, Your Honor. I was THERE.' },
    ], () => this.sinusEnd()); }));
  },
  // Rocket and Tubbs testify, Chuck crashes in (Greyhound, tiny sunglasses) and eats the pelican's hat, Dan gets a pastel badge
  sinusEnd() {
    const F = Game.flags, thrown = Game.headlines.some(h => /THROWN OFF YACHT/.test(h.text));
    CT.add('rocket', 'rocket', 318, 118, 'left'); CT.add('tubbs', 'tubbs', 340, 118, 'left');
    courtCut([
      SC.all([SC.walk('rocket', 184, 100, 110), SC.walk('tubbs', 206, 100, 110)]), SC.face('rocket', 'down'), SC.face('tubbs', 'down'),
      SC.line('rocket', 'Dan went undercover. In pastel.', 1.6), SC.line('judge', 'HIM? Blended in?', 1.3),
      SC.line('tubbs', 'Mostly.', .9), SC.line('tubbs', thrown ? 'He got thrown in the bay.' : 'Nobody saw the jorts.', 1.4),
    ], () => this.sinusChuck(F));
  },
  sinusChuck(F) {
    const hat = () => { const p = (Game.courtActors || []).find(a => a.id === 'pelican'); if (p) p.hat = false; };
    courtCut([
      SC.wait(.3), SC.sound('boom'), SC.shake(10), SC.flash(.5),
      SC.fx(() => { Game.courtChuck = 1; CT.gator('chuck', 318, 118, 'left'); CT.add('shades', null, 318, 121, 'left', { draw: miamiShades }); }),
      SC.emote('jurypop', '!!', .9, PAL.red),
      SC.all([SC.walk('chuck', 280, 112, 80), SC.line('judge', 'ALLIGATOR IN MY COURTROOM?', 1.6)]),
      SC.line('dan', 'He took the Greyhound.', 1.4),
      SC.fx(() => { const c = (Game.courtActors || []).find(a => a.id === 'chuck'); if (c) c.chomp = 1; hat(); }), SC.sound('chomp'), SC.shake(5),
      SC.fly(MIAMI_HAT, 244, 82, 250, 110, .45, 9, true),
      SC.fx(() => { const c = (Game.courtActors || []).find(a => a.id === 'chuck'); if (c) c.chomp = 0; }), SC.sound('munch'),
      SC.line('pelican', '*sad squawk*', 1.3),
      SC.say([['JUDGE VEGA', 'The pelican confesses. Guilty. Ten to twenty in a very nice aviary.'],
        ['JUDGE VEGA', 'And Mr. Dupree: by the power vested in me by absolutely nobody, Miami-Dade names you... Honorary Detective.']]),
      SC.walk('rocket', 178, 114, 80), SC.face('rocket', 'left'),
      SC.all([SC.fly(MIAMI_BADGE, 174, 100, 160, 122, .5, 0, true), SC.line('rocket', 'Your badge. It’s pastel.', 1.5)]), SC.sound('cash'),
      SC.say([['DAN', 'I’m not a detective. I’m also not a Florida Man.'], ['BRENDA', 'DAN.']]),
    ], () => { headline('FLORIDA MAN BUSTS SINUS CARTEL RUN BY A PELICAN; "I KNEW IT WAS THAT PELICAN," HE SAYS', 10); F.case5Won = true; F.creditsPending = 5; endDay('court'); });
  },
};
