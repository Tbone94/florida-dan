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
    const v = this.car; this.car = null; Game.flags.lamboSunk = true; Look.mark('skid', v.x - 150, v.y, { x2: v.x - 12, y2: v.y }, true);   // skid marks into the Atlantic, forever Game.vehicles = []; Game.dan.ride = null;
    splash(v.x, v.y, 30); Sound.play('splash'); Game.shake = 10; Game.flash = .5;
    const shore = { x: 71.5 * TS, y: v.y }; Object.assign(Game.dan, { x: shore.x, y: clamp(shore.y, 3 * TS, 57 * TS), dir: 'right' });
    say([['', '*SPLOOSH*'], ['', 'The pink Lamborghini drives directly into the Atlantic Ocean. It floats for one beautiful second. Then it does not.'],
      ['', 'Dan wades back to shore. A crowd has gathered. Every phone is out.'], ['TOURIST', 'Sir, why did you drive into the ocean?!'], ['DAN', 'The car don’t surf.'],
      [PHONE_B, 'Dan. DAN. You’re trending in fourteen countries.']], () => {
      headline('FLORIDA MAN VALETS INFLUENCER’S PINK LAMBORGHINI DIRECTLY INTO ATLANTIC OCEAN; "THE CAR DON’T SURF," HE EXPLAINS', 9);
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
  start(then) {
    const seq = []; for (let i = 0; i < 16; i++) seq.push({ dir: pick(['up', 'down', 'left', 'right']), t: 1.4 + i * .6, hit: null });
    this.s = { seq, t: 0, score: 0, then, flash: '', flashT: 0 }; Game.mode = 'dance'; padFor(true);
    ui.wrestle.hidden = false; ui.wrestleMsg.textContent = 'DANCE-OFF!'; ui.gripFill.style.width = '0%';
    ui.wrestle.querySelector('.hint').textContent = 'HIT THE ARROW WHEN IT REACHES THE BOX · 11 OF 16 TO WIN';
    Sound.play('headline');
  },
  update(dt) {
    const s = this.s; if (!s) { Game.mode = 'play'; return; }
    s.t += dt; s.flashT -= dt;
    const hit = ['up', 'down', 'left', 'right'].find(k => Input.tapped(k));
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
    const s = this.s; this.s = null; padFor(false); ui.wrestle.hidden = true; ui.wrestle.querySelector('.hint').textContent = 'MASH E · HIT THE ARROW WHEN HE THRASHES'; Game.mode = 'play';
    if (s.score >= 11) s.then();
    else say([['DJ FLAMINGO', `${s.score} out of 16? My GRANDMA hits more beats than that.`], ['DJ FLAMINGO', 'Again. From the top?', [['“Hit it.”', () => { s.again = true; }], ['“Gimme a minute.”', () => [['DJ FLAMINGO', 'Take your time, abuelo. The floor ain’t goin’ nowhere.']]]]]], () => { if (s.again) Dance.start(s.then); });
  },
  draw() {
    const s = this.s, t = Game.t; if (!s) return;
    R(0, 0, VW, VH, '#150f24');
    for (let y = 0; y < 5; y++) for (let x = 0; x < 10; x++) { const on = (x + y + Math.floor(t * 4)) % 3 === 0; R(x * 32, 70 + y * 16, 31, 15, on ? ['#ff4fd8', '#27c6b4', '#ffd23f'][(x + y) % 3] : '#2a2136'); }
    for (let i = 0; i < 5; i++) { g.globalAlpha = .18; g.fillStyle = ['#ff4fd8', '#27c6b4', '#ffd23f'][i % 3]; g.beginPath(); g.moveTo(40 + i * 60, 0); g.lineTo(20 + i * 60 + Math.sin(t * 2 + i) * 40, 150); g.lineTo(70 + i * 60 + Math.sin(t * 2 + i) * 40, 150); g.fill(); } g.globalAlpha = 1;
    label('CLUB SINUS', VW / 2, 16, '#27c6b4', 9);
    const next = s.seq.find(n => n.hit === null), pose = next ? next.dir : 'down', bounce = Math.round(Math.abs(Math.sin(t * 6)) * 3);
    g.drawImage(SPR.dan[pose === 'up' ? 'up' : pose === 'left' ? 'left' : pose === 'right' ? 'right' : 'down'][Math.floor(t * 6) % 2], 176, 64 - bounce);
    g.drawImage(SPR.dj.down[Math.floor(t * 5) % 2], 120, 64 - Math.round(Math.abs(Math.cos(t * 6)) * 3));
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
    toast('Race to the Flamingo Hotel! (Raul is fast. A cafecito or the cooler would help.)', 4); Sound.play('siren');
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
    Sound.play('headline'); toast('You’re in. Blend in with 3 guests. Don’t say anything Florida.', 4);
  },
  talk(n) {
    const [who, q, opts] = GUESTS[n.guest];
    if (n.talked) return say([[who, pick(['Great party, right?', 'Love your suit.', 'Have you seen the boss? He’s... unusual.'])]]);
    say([[who, q, opts.map(([label, good, reply]) => [label, () => {
      n.talked = true; n.quest = false;
      if (!good) { this.sus++; Game.shake = 3; toast(`SUSPICION ${'■'.repeat(this.sus)}${'□'.repeat(3 - this.sus)}`, 2); }
      const out = [[who, reply]];
      if (this.sus >= 3) out.push(['', 'Two goons pick Dan up by the suit and throw him into Biscayne Bay.'], ['DAN', '(from the water) WORTH IT.'], ['BOUNCER', 'Come back when you’re less... you.']);
      return out;
    }])]], () => {
      if (this.sus >= 3) { this.sus = 0; splash(Game.dan.x, Game.dan.y, 20); Game.npcs.filter(g => g.guest !== undefined).forEach(g => { g.talked = false; g.quest = true; }); headline('FLORIDA MAN THROWN OFF YACHT PARTY FOR "BEING TOO FLORIDA"', 3); return; }
      if (Game.npcs.filter(g => g.guest !== undefined).every(g => g.talked)) { done('mingle'); toast('Nobody suspects a thing. The boss is by the boats.'); }
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
    if (close && Math.random() < dt * 3) toast(pick(['STAY ON HIM!', 'Closer... CLOSER...', 'He’s squawking at you!']), .8);
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
const MiamiCourt = {
  lambo() {
    CourtCases.begin();
    say([['BAILIFF', 'All rise for the Honorable Judge Esperanza Vega.'], ['JUDGE VEGA', 'Mr. Dupree. Collier County sent me a warning about you. It was forty pages.'], ['DAN', 'Only forty?'], ...CourtCases.clean(4),
      ['JUDGE VEGA', 'Grand Theft Lambo. Prosecution.'], ['PROSECUTOR CHAD', 'Your Honor, I will describe the events. The defense may object to anything false.'], ['BRENDA', '(whispering) Only the LIES, Dan.']],
    () => { Objection.speaker = 'PROSECUTOR CHAD'; Objection.run([
      { text: 'The defendant took the car without permission.', lie: true, bust: 'The valet literally ASKED him to move it. It’s on video.' },
      { text: 'The car is pink.', lie: false, over: 'It is EXTREMELY pink, Counselor.' },
      { text: 'The defendant drove into the ocean on purpose.', lie: true, bust: 'The gas pedal was stuck. We all saw the video. Everyone on Earth saw the video.' },
      { text: 'When the car was recovered, an octopus was inside it.', lie: false, over: '...That did happen. I still don’t understand it.' },
      { text: 'The defendant has never been to court before.', lie: true, bust: 'He has been to court FOUR TIMES this month, Chad.' },
    ], () => this.lamboEnd()); });
  },
  lamboEnd() {
    const F = Game.flags, wit = [F.witAbuela && 'Abuela', F.witRaul && 'Raul', F.witSheila && 'Sheila'].filter(Boolean);
    say([['BRENDA', wit.length ? `The defense calls ${wit.join(' and ')}.` : 'The defense has... no witnesses, Your Honor. It’s been a week.'],
      ...(F.witAbuela ? [['ABUELA', 'He listened to my WHOLE story. Forty-five minutes. He is a good boy.']] : []),
      ...(F.witRaul ? [['RAUL', 'He beat me down Ocean Drive, Your Honor. On a cafecito. LEGEND.']] : []),
      ...(F.witSheila ? [['SHEILA', 'He got the Canadian off my chair. I would die for this man.']] : []),
      ['DJ FLAMINGO', 'Your Honor... I want to drop the charges.'], ['JUDGE VEGA', 'Why?'], ['DJ FLAMINGO', 'The octopus video has ninety million views. My new single is called “THE CAR DON’T SURF.” It’s number one.'],
      ['JUDGE VEGA', '...Case dismissed. Everyone out. And somebody find that octopus a lawyer.']],
    () => { headline('FLORIDA MAN CLEARED IN PINK LAMBO CASE AFTER OCTOPUS GOES VIRAL; "THE CAR DON’T SURF" HITS NUMBER ONE', 10); F.case4Won = true; F.creditsPending = 4; endDay('court'); });
  },
  sinus() {
    CourtCases.begin();
    say([['BAILIFF', 'All rise. The United States of Florida versus... a pelican.'], ['JUDGE VEGA', 'Mr. Dupree. We meet again. You’re not the defendant this time. You’re the WITNESS.'], ['DAN', 'That’s a first.'], ...CourtCases.clean(5),
      ['', 'At the defense table sits Señor Pelícano, in a tiny orange jumpsuit.'], ['DEFENSE ATTORNEY', 'Your Honor, my client is a simple pelican. The defense may object to... wait, that’s YOUR job, Mr. Dupree. Object to my lies.']],
    () => { Objection.speaker = 'DEFENSE ATTORNEY'; Objection.run([
      { text: 'My client is just a regular pelican who enjoys fish.', lie: true, bust: 'He has a GOLD CHAIN, Counselor.' },
      { text: 'My client has never been on a yacht.', lie: true, bust: 'We have forty photos of him on a yacht. In a suit.' },
      { text: 'Pelicans cannot operate cigarette boats.', lie: true, bust: 'This one can. He did. Mr. Dupree chased him.' },
      { text: 'The defendant’s bales washed up on South Beach.', lie: false, over: 'That part’s true. Dan tried to RETURN them.' },
      { text: 'My client has never stolen a fish from Daniel Dupree.', lie: true, bust: 'He stole a bass on MONDAY, Your Honor. I was THERE.' },
    ], () => this.sinusEnd()); });
  },
  sinusEnd() {
    const F = Game.flags;
    say([['DET. ROCKET', 'Your Honor, Mr. Dupree went undercover in a pastel suit and blended in at a cartel yacht party.'], ['JUDGE VEGA', 'HIM? Blended in?'], ['DET. TUBBS', 'Mostly. He got thrown in the bay once.'],
      ['', '*CRASH*'], ['', 'The doors burst open. It’s Chuck. He took the Greyhound. He is wearing tiny sunglasses.'], ['JUDGE VEGA', 'IS THAT AN ALLIGATOR IN MY COURTROOM?'], ['DAN', 'He does this. You get used to it.'],
      ['', 'Chuck walks straight to Señor Pelícano and eats his tiny hat. The pelican confesses to everything.'], ['SEÑOR PELÍCANO', '*sad squawk*'],
      ['JUDGE VEGA', 'Guilty. Ten to twenty in a very nice aviary. And Mr. Dupree...'], ['JUDGE VEGA', 'By the power vested in me by absolutely nobody, Miami-Dade names you... Honorary Detective.'],
      ['DET. ROCKET', 'Here’s your badge, partner. It’s pastel.'], ['DAN', 'I’m not a detective.'], ['BRENDA', 'Dan.'], ['DAN', 'I’m also not a Florida Man.'], ['BRENDA', 'DAN.']],
    () => { headline('FLORIDA MAN BUSTS SINUS CARTEL RUN BY A PELICAN; "I KNEW IT WAS THAT PELICAN," HE SAYS', 10); F.case5Won = true; F.creditsPending = 5; endDay('court'); });
  },
};
