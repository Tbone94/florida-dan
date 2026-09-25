// FLORIDA DAN — side quests, variety pass (2026-09-24). New gigs and neighbor stories built on verbs the regions
// didn't have yet: photos, tailing a cat at night, a bodyguard you sneak past, a boat escort, a legendary fish,
// timed cooler runs, throwing empties, a water taxi, an escort past bikers, and choices that change the payout.
// Everything here is data plus small hooks: gigs.js calls SideQuests.tick/interaction/target/draw/timer, keys2.js
// calls SideQuests.diveExtras/diveDone, arcs.js knows where: 'keys'. Chapters marked sq: 1 are driven from here.
'use strict';
Object.assign(SWAPS, {
  mama: { hat: PAL.white, hatD: PAL.grey, tank: '#ff8fc0', tankD: '#e0609a', stain: '#ffd23f', jorts: '#b8e0f7', hair: PAL.white, shades: '#c9c2b4', skin: '#f2b48f', flip: PAL.white },
  celeb: { hat: PAL.white, hatD: '#e5dccb', tank: PAL.white, tankD: '#e5dccb', stain: '#ffd23f', jorts: PAL.white, hair: PAL.black, shades: '#ffd23f', skin: '#c98a62', flip: PAL.white },
});
SHOPKEEPS.push('tom', 'joelle', 'dwayne');   // a Keys gig must not wall off the counter either

const SideQuests = {
  tmp: {}, day: null, region: null,   // per-day scratch: who's in the boat, who's following Dan, the cat being tailed
  PIE_T: 30, BEACH_T: 25,
  near: (p, r) => !!p && Math.hypot(Game.dan.x - p.x, Game.dan.y - p.y) < r,
  who: id => Game.npcs.find(n => n.id === id),
  at: (x, y) => ({ x: x * TS, y: y * TS }),
  // neighbor stories: never while the case needs that person, and one chapter a day
  free(id) { const c = Cases.info(); return !(STORY_NPCS[c.n + '.' + c.d] || []).includes(id); },
  fresh: id => (Game.flags.sqDay || {})[id] !== Game.day,
  mark(id) { (Game.flags.sqDay = Game.flags.sqDay || {})[id] = Game.day; },
  nag: (id, text) => SideQuests.free(id) ? text : null,   // on a day the case needs them, an unfinished story never walls off the talk
  arcs() { const out = []; for (const id in ARCS) { const c = Arcs.chapter(id), s = ARC(id); if (c && c.sq && s.st === 'active' && Arcs.hereOK(c)) out.push([id, c, s]); } return out; },
  gig: () => GIGS[G_().active],
  // ---------- hooks ----------
  tick(dt) {
    if (this.day !== Game.day || this.region !== Game.region) { this.tmp = {}; this.day = Game.day; this.region = Game.region; }
    for (const [, c, s] of this.arcs()) if (c.tick) c.tick(s, dt);
    const d = this.gig(); if (d && d.tick) d.tick(dt);
    for (const a of Game.animals) if (a.gone != null) { a.gone -= dt; a.y -= 40 * dt; a.state = 'flee'; }   // bonked birds fly off
    const drop = a => (a.gone != null && a.gone <= 0) || (a.gull && a.gone == null && G_().active !== 'gulls');   // flown off, or the job's over
    if (Game.animals.some(drop)) Game.animals = Game.animals.filter(a => !drop(a));
  },
  interaction() {
    const d = this.gig(); if (d && d.interaction) { const r = d.interaction(); if (r) return r; }
    for (const [, c, s] of this.arcs()) if (c.interaction) { const r = c.interaction(s); if (r) return r; }
    return null;
  },
  target(id) { const d = GIGS[id]; return d && d.target ? d.target() : undefined; },
  draw(cx, cy, t) {
    const d = this.gig(); if (d && d.draw) d.draw(cx, cy, t);
    for (const [, c, s] of this.arcs()) if (c.draw) c.draw(s, cx, cy, t);
  },
  timer() { const d = this.gig(); return d && d.timer ? d.timer() : 0; },
  timerLabel() { const d = this.gig(); return (d && d.timerLabel) || 'BEAT THE RECORD'; },
  diveExtras(at, wreckHere) { const out = []; for (const [, c, s] of this.arcs()) if (c.diveExtra) { const e = c.diveExtra(s, at, wreckHere); if (e) out.push(e); } return out; },
  diveDone(r) { for (const [, c, s] of this.arcs()) if (c.diveDone) c.diveDone(s, r); },
  // ---------- little drawings ----------
  cone(x, y, n, next) { OR(x - 3, y - 9, 6, 9, next ? PAL.orange : PAL.greyD); R(x - 2, y - 6, 4, 2, PAL.white); R(x - 5, y, 10, 2, PAL.ink); if (next) label(String(n), x, y - 13, PAL.yellow, 6); },
  bottle() { if (this._b) return this._b; const c = document.createElement('canvas'); c.width = 4; c.height = 9; const x = c.getContext('2d'); x.fillStyle = PAL.ink; x.fillRect(0, 2, 4, 7); x.fillRect(1, 0, 2, 3); x.fillStyle = '#8a5a2a'; x.fillRect(1, 3, 2, 5); return (this._b = c); },
  person(id, x, y, rows = 22) { const s = SPR[id] && SPR[id].down[0]; if (s) g.drawImage(s, 0, 0, 16, rows, Math.round(x - 8), Math.round(y - rows), 16, rows); },

  // ---------- Keys: Miss Pearl's cats ----------
  CAT_NAMES: ['Hemingway', 'Captain Mittens', 'Six-Pack', 'Admiral Beans', 'Tiny Toes', 'Duchess of Duval', 'Gregory II', 'Mayor Whiskers'],
  catSpots: [[80.5, 25.5], [67.5, 10.5], [72.5, 45], [70, 25.5], [84, 42]],
  ensureCats(s) {   // five cats around Key West while the census is on (new days only bring back the three at the house)
    const cats = Game.animals.filter(a => a.type === 'cat' && !a.toes);
    for (let i = 0; cats.length + i < 5 && i < this.catSpots.length; i++) { const [x, y] = this.catSpots[i]; Game.animals.push(makeCritter('cat', x * TS, y * TS, { census: true })); }
  },
  snapCat(c, s) {
    c.snapped = true; s.n = (s.n || 0) + 1; c.tag = this.CAT_NAMES[(s.n - 1 + Game.day) % this.CAT_NAMES.length].toUpperCase();
    Game.flash = .55; Sound.play('pickup');
    const bomb = Game.animals.some(a => a.type === 'rooster' && Math.hypot(a.x - c.x, a.y - c.y) < 40);
    toast(`*click* ${c.tag}. ${bomb ? 'A rooster photobombs it. Somehow it’s better.' : pick(['Six toes on every foot. Glaring.', 'He licked the lens.', 'Blurry. Majestic. Suspicious.', 'Pure contempt. Perfect.'])} (${Math.min(4, s.n)}/4)`, 3);
    questText('arc_pearl', `Photograph 4 of Miss Pearl’s six-toed cats for the census (${Math.min(4, s.n)}/4)`);
    if (s.n >= 4) toast('That’s four cats. Back to Miss Pearl at the Six-Toe House.', 3);
  },
  // the tail: Mr. Toes walks his route; every so often he looks back. Freeze, or he goes home.
  tailPath: [[68.8, 41.4], [68.8, 44.4], [75.4, 44.4], [75.4, 33], [75.4, 26.2], [77.4, 24.2]],
  tailStart(fin) {
    const P = this.tailPath.map(([x, y]) => this.at(x, y)), cat = makeCritter('cat', P[0].x, P[0].y, { tag: 'MR. TOES', toes: true });
    Game.animals.push(cat); this.tmp.tail = { cat, P, i: 1, st: 'walk', k: 0, next: rnd(3.5, 4.5), grace: 2.5, fin };
    Sound.play('talk'); toast('Mr. Toes slips out the cat door. Follow him. When he looks back: FREEZE.', 4);
    hint('sqTail', 'Tailing: stay close-ish. When Mr. Toes turns around (?!), let go of everything', 6);
  },
  tailTick(dt) {
    const X = this.tmp.tail; if (!X) return;
    const c = X.cat, D = Game.dan, d = Math.hypot(D.x - c.x, D.y - c.y);
    if (!Game.animals.includes(c)) { this.tmp.tail = null; return; }
    X.k += dt;
    if (X.st === 'walk') {
      const p = X.P[X.i], dx = p.x - c.x, dy = p.y - c.y, dd = Math.hypot(dx, dy);
      if (dd < 2) { X.i++; if (X.i >= X.P.length) return this.tailWin(); X.st = 'warn'; X.k = 0; }
      else { const st = Math.min(dd, 28 * dt); c.x += dx / dd * st; c.y += dy / dd * st; c.flip = dx < 0; c.moving = true; }
      if (X.st === 'walk' && (X.next -= dt) <= 0) { X.st = 'warn'; X.k = 0; }
    } else if (X.st === 'warn') { c.moving = false; if (X.k > .6) { X.st = 'look'; X.k = 0; } }
    else { c.moving = false; c.flip = D.x < c.x; if (D.moving && d < 150) return this.tailFail('seen'); if (X.k > 1.5) { X.st = 'walk'; X.k = 0; X.next = rnd(3, 5); } }
    Object.assign(c, { hx: c.x, hy: c.y, vx: 0, vy: 0, timer: 9, state: 'wander' });   // the house AI never drags him home mid-route
    if ((X.grace -= dt) > 0) return;   // a head start: Dan was standing at the cat door
    if (d < 20) return this.tailFail('close');
    if (d > 190) return this.tailFail('lost');
  },
  tailFail(why) {
    const X = this.tmp.tail; this.tmp.tail = null; if (!X) return; this.tmp.lastFail = why; Game.animals = Game.animals.filter(a => a !== X.cat); Sound.play('fail');
    toast({ seen: 'Mr. Toes turns. Sees you. Stares into your soul. Goes home. (Try again: the Six-Toe House)', close: 'Too close! Mr. Toes hisses and bolts home. (Try again: the Six-Toe House)', lost: 'You lost him. Somewhere on Duval, a cat is laughing. (Try again: the Six-Toe House)' }[why], 4);
  },
  tailWin() {
    const X = this.tmp.tail, c = X.cat, j = this.who('joelle'), keep = j && { x: j.x, y: j.y, hx: j.hx, hy: j.hy };
    Scene.play([SC.cam(c.x + 8, c.y - 10, 1.6, .7), SC.emote(c, '♥', 1, PAL.hat), ...(j ? [SC.walk('joelle', c.x + 16, c.y, 45), SC.face('joelle', 'left')] : []),
      SC.line(j || c, 'FRITTER! My baby!', 1.5), SC.line('dan', '...FRITTER?', 1.2),
      SC.say([['JOELLE', 'Six years he’s come for fritters. Every night at nine. He’s basically my boyfriend.'], ['DAN', 'Miss Pearl thinks he’s at church.']]), SC.line(c, '*purrs*', 1.1), SC.emote('dan', '!', .8), SC.camOn('dan', 1, .5, -10)],
    () => {
      if (j && keep) Object.assign(j, keep);
      Game.animals = Game.animals.filter(a => a !== c); this.tmp.tail = null;
      headline('SIX-TOED CAT FOUND LIVING DOUBLE LIFE AS "FRITTER" AT CONCH SHACK; FLORIDA MAN "FOLLOWED HIM FOR THREE BLOCKS"', 2);
      X.fin();
    });
  },
  blowDry(fin) {
    Mash.start({ kind: 'blowdry', title: 'BLOW-DRY MR. TOES', hint: `MASH ${K('a')}: MAXIMUM FLUFF!`, need: 30, time: 8, sound: 'reel',
      onWin: () => this.catShow(fin), onLose: () => toast('Mr. Toes bit the hair dryer. He’s still wet. Try again.', 3),
      draw: (t, k) => {
        Dance.sunsetBg(t);
        g.drawImage(SPR.dan.right[Math.floor(t * 8) % 2], 0, 0, 16, 22, 70, 70, 40, 55);
        OR(108, 88, 14, 7, PAL.greyD); R(110, 94, 4, 8, PAL.greyD);   // the hair dryer
        for (let i = 0; i < 4; i++) R(124 + ((t * 90 + i * 11) % 40), 90 + (i % 3) * 3, 6, 1, PAL.white);
        const fluff = 4 + k * 22, cx = 200, cy = 100;
        for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28 + t * .5, r = 16 + fluff * .6; OR(cx + Math.cos(a) * r - 4, cy + Math.sin(a) * r * .8 - 4, 8, 8, '#f2a65a'); }
        g.drawImage(SPR.cat, cx - 20, cy - 20, 40, 40);
        label(k > .66 ? 'HE’S A DANDELION' : k > .33 ? 'THE FLUFF IS RISING' : 'STILL A WET RAT', 160, 170, PAL.white, 6);
      } });
  },
  catShow(fin) {
    const M = World.spots.mallory, F = Game.flags, toes = makeCritter('cat', M.x - 26, M.y + 8, { tag: 'MR. TOES', toes: true }), duch = makeCritter('cat', M.x + 30, M.y + 8, { tag: 'DUCHESS', toes: true });
    Game.animals.push(toes, duch);
    const cast = ['pearl', 'mike', 'joelle'].map(id => this.who(id)).filter(Boolean).map(n => ({ n, x: n.x, y: n.y, hx: n.hx, hy: n.hy }));
    Scene.play([SC.place('dan', M.x - 14, M.y + 26, 'up'), SC.place('pearl', M.x - 32, M.y + 16, 'right'), SC.place('mike', M.x + 2, M.y + 4, 'down'),
      ...(F.toesCustody ? [SC.place('joelle', M.x - 50, M.y + 24, 'right')] : []), SC.cam(M.x, M.y - 2, 1.6, .7),
      SC.line('mike', 'THE KEY WEST CAT SHOW!', 1.6), SC.say([['MANGO MIKE', 'Eleven-time champion: DUCHESS. A Persian. From MIAMI.'], ['MANGO MIKE', 'And the challenger: MR. TOES. Blow-dried tonight by a Florida Man.']]),
      SC.line(duch, '*sneers*', 1.1), SC.emote(toes, '!', .8),
      ...(F.toesCustody ? [SC.line('joelle', 'THAT’S MY FRITTER!', 1.3)] : []),
      SC.line('mike', 'BEST IN TOES: MR. TOES!', 1.8), SC.react('cheer'), SC.shake(3), SC.emote(toes, '♥', 1, PAL.hat),
      SC.line('pearl', 'ELEVEN YEARS!', 1.3), SC.wait(.4), SC.camOn('dan', 1, .5, -10)],
    () => {
      cast.forEach(k => Object.assign(k.n, { x: k.x, y: k.y, hx: k.hx, hy: k.hy }));
      Game.animals = Game.animals.filter(a => a !== toes && a !== duch);
      headline('SIX-TOED CAT WINS "BEST IN TOES" AT KEY WEST CAT SHOW AFTER FLORIDA MAN BLOW-DRIES HIM INTO "A DANDELION"', 3);
      fin();
    });
  },

  // ---------- Keys: Old Gus ----------
  gusWreck() {
    const X = this.tmp; if (X.gusScene) return; X.gusScene = true;
    const D = Game.dan, gp = { x: D.x - 10, y: D.y - 2 }, wx = D.x + 34, wy = D.y + 12;
    Scene.play([SC.cam(D.x, D.y - 10, 1.7, .8), SC.say([['OLD GUS', 'There she is. Forty feet down. I can see her from here.'], ['DAN', 'That’s a reef, Gus.'], ['OLD GUS', 'I KNOW what I see, son.']]),
      SC.fly(() => this.bottle(), gp.x, gp.y - 14, wx, wy, .9, 10, true), SC.fx(() => splash(wx, wy, 12)), SC.sound('splash'),
      SC.line(gp, 'Say hi to the crew, old girl.', 1.8), SC.emote('dan', '♥', 1, PAL.hat),
      SC.fx(() => { for (let i = 0; i < 4; i++) splash(wx + rnd(-40, 40), wy + rnd(-12, 12), 8); }), SC.line('dan', 'TARPON!', 1.1), SC.wait(.5), SC.camOn('dan', 1, .5, -10)],
    () => {
      X.gusAboard = false; X.gusScene = false; const n = this.who('gus'); if (n) n.hidden = false;
      headline('FLORIDA MAN TAKES 81-YEAR-OLD TREASURE DIVER TO SAY GOODBYE TO HIS SHIPWRECK; EVERYBODY ON THE BOAT "HAS SOMETHING IN THEIR EYE"', 1);
      Arcs.finish('gus');
    });
  },
  silver: { id: 'silver', name: 'OLD SILVER', tag: 'OLD SILVER', lb: [142, 142], pull: 1.05, jump: .5, w: 0, legend: true, h: .36, c1: '#e8f0f4', c2: '#ffffff', q: ['OLD SILVER. There’s a 1986 hook scar on his lip. Gus is going to cry.'] },
  silverCast() {
    for (const a of Game.animals) if (a.type === 'pelican' && Math.hypot(a.x - Game.dan.x, a.y - Game.dan.y) < 160) { a.state = 'flee'; a.timer = 10; }   // nobody steals THIS fish
    Fishing.start(T.DEEP, true); const f = Fishing.f; if (!f) return;
    const y = f.bottom - 24; f.fish = [{ sp: this.silver, lbs: 142, x: 236, y, hy: y, dir: -1, spd: 16, want: 0 }];
    Fishing.msg('Something BIG is down there...', 2);
  },

  // ---------- Daytona: Tiny's mama ----------
  mamaStart(fin) {
    const S_ = World.spots, n = makeNPC('mama', 'Mama', S_.arrive.x + 10, S_.arrive.y + 6, 'down');
    Game.npcs.push(n); this.tmp.mama = { n, fin, strikes: 0, cd: 0 };
    say([['MAMA', 'There he is! Tiny’s DENTIST friend!'], ['DAN', 'That’s me. Teeth guy.'], ['MAMA', 'Walk me to the motel, sweetie. I hear Daytona has... MOTORCYCLE people.']]);
  },
  mamaTick(dt) {
    const M = this.tmp.mama; if (!M) return; const n = M.n, D = Game.dan;
    if (!Game.npcs.includes(n)) { this.tmp.mama = null; return; }
    const dx = D.x - n.x, dy = D.y - n.y, d = Math.hypot(dx, dy);
    n.moving = d > 22; if (n.moving) { const sp = Math.min(70, d * 2) * dt; n.x += dx / d * sp; n.y += dy / d * sp; n.dir = dirOf(dx, dy); n.t += dt; if (Math.floor(n.t * 6) % 2 !== n.frame) n.frame ^= 1; }
    n.hx = n.x; n.hy = n.y; M.cd -= dt;
    const door = World.spots.door;
    if (Math.hypot(n.x - door.x, n.y - door.y) < 40) {
      this.tmp.mama = null;
      return say([['MAMA', 'What a LOVELY motel. It smells like tires.'], ['MAMA', 'Tell Tiny I’m proud of him. All those little teeth.']], () => {
        Game.npcs = Game.npcs.filter(x => x !== n);
        headline('FLORIDA MAN ESCORTS BIKER’S MOTHER THROUGH DAYTONA WITHOUT HER SEEING A SINGLE BIKER; "A MIRACLE"', 2); M.fin();
      });
    }
    const b = Game.npcs.find(x => x.id === 'biker' && Math.hypot(x.x - n.x, x.y - n.y) < 44);
    if (!b || M.cd > 0) return;
    M.strikes++; M.cd = 3; b.scared = 2;
    if (M.strikes === 1) return say([['MAMA', 'Oh my. That man has a SKULL on his vest.'], ['DAN', 'He’s a... dentist. Skulls are teeth.'], ['MAMA', '...Huh.']]);
    if (M.strikes === 2) return say([['MAMA', 'ANOTHER one? Daniel, is this a DENTIST CONVENTION?'], ['DAN', 'Yes. Biggest one in the state. Keep walkin’.']]);
    this.tmp.mama = null;
    say([['MAMA', 'That one has a tattoo of a skull EATING a tooth. I’m going back to the bus station, Daniel.'], ['', 'Mama marches back to the Greyhound. (Meet her there to try again. Maybe go around the bikers.)']], () => { Game.npcs = Game.npcs.filter(x => x !== n); });
  },
  bikeNight(fin) {
    const S_ = World.spots, sx = S_.saloon.x, sy = S_.saloon.y + 16, mama = makeNPC('mama', 'Mama', sx - 40, sy + 14, 'right'), F = Game.flags;
    Game.npcs.push(mama);
    const t = this.who('tiny'), keep = t && { x: t.x, y: t.y, hx: t.hx, hy: t.hy };
    let branch = null;
    const done = () => {
      if (t && keep) Object.assign(t, keep); Game.npcs = Game.npcs.filter(x => x !== mama);
      if (branch === 'lie') { Game.money += 10; F.tinyMama = 'lie'; headline('BIKER BAR POSES AS DENTAL CONVENTION FOR ONE (1) VISITING MOTHER', 2); }
      else if (branch === 'truth') { Game.allegations = Math.max(0, Game.allegations - 4); F.tinyMama = 'truth'; headline('BIKER’S 74-YEAR-OLD MOTHER REVEALED AS FORMER "HELL’S GRANNY," POPS WHEELIE AT BIKE NIGHT', 1); }
      else { F.tinyMama = 'arm'; headline('FLORIDA MAN ARM-WRESTLES BIKER’S MOTHER AT BIKE NIGHT; MOTHER "WENT EASY ON HIM"', 3); }
      fin();
    };
    Scene.play([SC.cam(sx, sy - 10, 1.6, .7), SC.place('dan', sx - 22, sy + 18, 'up'), SC.walk(mama, sx - 8, sy + 10, 40), SC.line(mama, 'What a lovely office!', 1.4),
      ...(t ? [SC.place('tiny', sx + 16, sy + 6, 'left'), SC.line('tiny', 'MAMA! Welcome to... work.', 1.5), SC.emote('tiny', '!', .8)] : []),
      SC.line(mama, 'Why all the LEATHER?', 1.5)],
    () => say([['TINY', '(whispering) Dan. HELP.'], ['DAN', '', [
      ['“It’s a dental conference.” (keep the lie)', () => { branch = 'lie'; return [['', 'Forty bikers put on paper masks at the same time. One of them flosses. It’s beautiful.'], ['MAMA', 'Such PROFESSIONALS.'], ['TINY', '(crying) I love these guys.']]; }],
      ['Tell Mama the truth', () => { branch = 'truth'; return [['DAN', 'Ma’am. Tiny’s not a dentist. He’s a biker. A real good one.'], ['MAMA', '...Oh, HONEY. I know. I’ve known since ’98. I rode with the Hell’s Grannies.'], ['', 'Mama takes Tiny’s Harley for a lap and pops a wheelie out of the lot. Forty bikers salute.']]; }],
      ['Arm-wrestle Mama for the truth', () => { branch = 'arm'; Game.afterTalk = () => this.mamaArm(done); return null; }]]]], () => { if (branch !== 'arm') done(); }));
  },
  mamaArm(done) {
    const after = lines => say(lines, done);
    Mash.start({ kind: 'mama', title: 'ARM-WRESTLE MAMA', need: 32, time: 8, sound: 'punch',
      onWin: () => after([['', 'Dan wins. Barely. Mama cracks her knuckles like a bag of ice.'], ['MAMA', 'Fine. He’s a BIKER. I knew it. I rode with the Hell’s Grannies, you know.']]),
      onLose: () => after([['', 'Mama slams Dan’s arm through the table. The bar goes silent. Then FERAL.'], ['MAMA', 'Hell’s Grannies, ’71, sweetie. Where do you think Tiny GETS it?']]),
      draw: (t, k) => {
        R(0, 0, VW, VH, '#3a2618'); R(0, 110, VW, 70, '#6b4a2e'); for (let i = 0; i < VW; i += 20) R(i, 110, 1, 70, '#5a3a22'); label('THE IRON HOG · BIKE NIGHT', 160, 170, PAL.orange, 7);
        g.drawImage(SPR.mama.down[0], 0, 0, 16, 22, 188, 40, 48, 66); g.drawImage(SPR.dan.down[0], 0, 0, 16, 22, 84, 40, 48, 66); label('MAMA', 212, 118, PAL.white, 7); label('DAN', 108, 118, PAL.white, 7);
        const a = -.9 + k * 1.8 + Math.sin(t * 30) * .04; g.save(); g.translate(160, 118); g.rotate(a); g.fillStyle = PAL.ink; g.fillRect(-3, -40, 12, 42); g.fillStyle = PAL.skin; g.fillRect(-2, -39, 10, 40); g.restore();
      } });
  },

  // ---------- Miami: the paparazzi job ----------
  papSpawn() {
    if (this.who('celeb')) return;
    Game.npcs.push(makeNPC('celeb', 'Mr. Worldwide-ish', 68.4 * TS, 25.5 * TS, 'down'), makeNPC('goon', 'Bodyguard', 66.8 * TS, 25.9 * TS, 'right', { guard: true }));
  },
  papClear() { Game.npcs = Game.npcs.filter(n => n.id !== 'celeb' && !n.guard); },
  papBust(p, gd) {
    const D = Game.dan; p.busts++; p.st = 'calm'; p.k = 0; p.next = rnd(2.2, 3.4);
    for (const off of [120, 100, 80, 60]) if (canWalk(gd.x - off, D.y)) { D.x = gd.x - off; break; } Game.shake = 5; Sound.play('hurt'); hurtDan(3);
    toast(pick(['BODYGUARD: NO. PHOTOS.', 'BODYGUARD: I SAW THAT. Back to the palm trees.', 'BODYGUARD: Sir. SIR. Walk away.']), 2.5);
    if (p.busts === 3) headline('BODYGUARD THROWS FLORIDA MAN OFF SOUTH BEACH THREE TIMES; FLORIDA MAN "UNDETERRED"', 3);
  },

  // ---------- Miami: the water taxi ----------
  YT_PICK: [3.6, 25.8], YT_DROP: [6.2, 43.6],
};

// ---------- the neighbor stories ----------
Object.assign(ARCS, {
  pearl: [
    { sq: 1, gate: () => KEYS() && SideQuests.free('pearl'), where: 'keys', text: 'Photograph 4 of Miss Pearl’s six-toed cats for the census (0/4)',
      ask: [['MISS PEARL', 'The Hemingway Society wants a cat census. Photos of every cat. They think I’m “hoarding.”'], ['DAN', 'How many cats?'], ['MISS PEARL', 'Fifty-four. They’ll take four. Here’s my camera. It’s a disposable. Don’t waste the flash.']],
      start: s => { s.n = 0; },
      tick(s) { SideQuests.ensureCats(s); questText('arc_pearl', `Photograph 4 of Miss Pearl’s six-toed cats for the census (${Math.min(4, s.n || 0)}/4)`); },
      interaction(s) {
        if (Game.dan.ride || (s.n || 0) >= 4) return null;
        const c = Game.animals.filter(a => a.type === 'cat' && !a.snapped && !a.toes).sort((a, b) => Math.hypot(a.x - Game.dan.x, a.y - Game.dan.y) - Math.hypot(b.x - Game.dan.x, b.y - Game.dan.y))[0];
        return c && SideQuests.near(c, 24) ? { label: 'Snap a photo of the cat', fn: () => SideQuests.snapCat(c, s) } : null;
      },
      target: s => (s.n || 0) >= 4 ? SideQuests.who('pearl') : Game.animals.filter(a => a.type === 'cat' && !a.snapped && !a.toes).sort((a, b) => Math.hypot(a.x - Game.dan.x, a.y - Game.dan.y) - Math.hypot(b.x - Game.dan.x, b.y - Game.dan.y))[0],
      ready: s => (s.n || 0) >= 4 && SideQuests.free('pearl'), get readyHint() { return SideQuests.nag('pearl', 'Four cats, Dan. Six toes each. Say “tuna.”'); },
      pay: () => [['MISS PEARL', 'Oh, these are WONDERFUL. That one’s licking the lens. That’s Gregory the Second.'], ['MISS PEARL', 'Four cats. Fifty to go. Don’t tell the Society.']],
      cash: 30, ref: 3, after: () => { SideQuests.mark('pearl'); headline('FLORIDA MAN SUBMITS CAT CENSUS TO HEMINGWAY SOCIETY: FOUR CATS, ONE ROOSTER, ONE THUMB', 2); } },
    { sq: 1, gate: () => KEYS() && SideQuests.free('pearl') && SideQuests.fresh('pearl'), where: 'keys', text: 'Tail Mr. Toes after 8 PM (Six-Toe House). FREEZE when he looks back',
      ask: [['MISS PEARL', 'Every night, Mr. Toes goes out. Comes home at dawn smelling like FRIED FOOD.'], ['DAN', 'Cats do that.'], ['MISS PEARL', 'Follow him. Tonight. Don’t let him see you. He knows your face. He saw the photos.']],
      act: { at: () => SideQuests.tmp.tail ? SideQuests.tmp.tail.cat : World.spots.sixtoe, r: 30, when: () => Game.hour >= 20 && !SideQuests.tmp.tail, wait: () => SideQuests.tmp.tail ? 'Stay on him. Don’t get close.' : 'Tail Mr. Toes (after 8 PM)', label: 'Wait for Mr. Toes to sneak out', back: true, run: fin => SideQuests.tailStart(fin) },
      ready: () => SideQuests.free('pearl'),
      tick: (s, dt) => SideQuests.tailTick(dt),
      draw(s, cx, cy, t) { const X = SideQuests.tmp.tail; if (!X) return; const c = X.cat; if (X.st !== 'walk') label(X.st === 'warn' ? '?' : '!', c.x - cx + 14, c.y - cy - 8 + Math.round(Math.sin(t * 12)), X.st === 'warn' ? PAL.yellow : PAL.red, 10); },
      pay: () => [['MISS PEARL', 'Well? Where does my baby GO every night?'], ['DAN', '', [
        ['Tell her the truth (Joelle, fritters)', () => { Game.flags.toesCustody = true; return [['MISS PEARL', 'JOELLE? From the CONCH SHACK?'], ['MISS PEARL', '...Her fritters ARE very good. Fine. Joint custody. Weekends and fritter nights.']]; }],
        ['Say he’s in a street gang', () => { Game.money += 10; headline('SIX-TOED CAT LEADS KEY WEST STREET GANG, SAYS LOCAL MAN; CAT "DID NOT DENY IT"', 3); return [['MISS PEARL', 'A GANG? My baby is a GANGSTER?'], ['MISS PEARL', 'I have never been prouder. Ten extra. For his bail fund.']]; }]]]],
      cash: 25, ref: 4, after: () => SideQuests.mark('pearl') },
    { sq: 1, gate: () => KEYS() && SideQuests.free('pearl') && SideQuests.fresh('pearl'), where: 'keys', text: 'Blow-dry Mr. Toes for the Mallory Square cat show (after 5 PM)',
      ask: [['MISS PEARL', 'The Key West Cat Show. Tonight. Mallory Square.'], ['MISS PEARL', 'Mr. Toes has lost ELEVEN years running. To a Persian. Named DUCHESS.'], ['DAN', 'What do I do?'], ['MISS PEARL', 'Blow-dry him. He bites the groomers. He bit a DENTIST. You’re the only man stupid enough.']],
      act: { at: () => World.spots.mallory, r: 34, when: () => Game.hour >= 17, wait: 'Cat show (after 5 PM)', label: 'Blow-dry Mr. Toes for the cat show', run: fin => SideQuests.blowDry(fin) },
      pay: () => [['MISS PEARL', 'Eleven years. ELEVEN. And a Florida Man with a hair dryer did it.'], ['MISS PEARL', 'You’re an honorary cat now, Dan. It means nothing. It means EVERYTHING.']],
      cash: 40, ref: 6, after: () => SideQuests.mark('pearl') },
  ],
  gus: [
    { sq: 1, gate: F => KEYS() && F.case9Won && SideQuests.free('gus'), where: 'keys', text: 'Take Old Gus out to the wreck: pick him up at the end of the tarpon dock BY BOAT',
      ask: [['OLD GUS', 'Son. They’re hauling her up next month. For the museum.'], ['OLD GUS', 'I want to see her one more time. Where she lies. Before she’s a gift shop.'], ['DAN', 'I’ll get the boat.'], ['OLD GUS', 'End of the tarpon dock. I’ll bring the rum. The rum’s for her.']],
      interaction() {
        const X = SideQuests.tmp, D = Game.dan; if (X.gusAboard || D.ride !== 'boat' || !SideQuests.near(World.spots.tarpon, 48)) return null;
        return { label: 'Pick up Old Gus', fn: () => { const n = SideQuests.who('gus'); if (n) n.hidden = true; X.gusAboard = true; Sound.play('pickup'); toast('Gus climbs in with a bottle of rum and a folding chair. Head for the Southernmost Point buoy.', 4); } };
      },
      tick() {
        const X = SideQuests.tmp, D = Game.dan; if (!X.gusAboard || X.gusScene) return;
        if (D.ride !== 'boat') { X.gusAboard = false; const n = SideQuests.who('gus'); if (n) n.hidden = false; toast('Gus climbs out. “I’ll wait on the dock, son. I’m 81. I’m not swimming.”', 3.5); return; }
        if (SideQuests.near(World.spots.reef, 70) || SideQuests.near(World.spots.buoy, 60)) SideQuests.gusWreck();
      },
      draw(s, cx, cy) { if (!SideQuests.tmp.gusAboard) return; const D = Game.dan, vert = D.dir === 'up' || D.dir === 'down'; SideQuests.person('gus', D.x - cx + (vert ? 9 : D.dir === 'left' ? 13 : -13), D.y - cy + (vert ? 4 : 0), 12); },
      target: () => SideQuests.tmp.gusAboard ? World.spots.buoy : Game.dan.ride === 'boat' ? World.spots.tarpon : Game.boat,
      ready: () => false, get readyHint() { return SideQuests.nag('gus', 'The boat, son. Pick me up at the end of the dock.'); },
      pay: () => [['OLD GUS', 'Thank you, son. Drop an old man at his dock?'], ['', 'Dan drops Gus at the tarpon dock. The tarpon come up to say hello. They know him.']],
      cash: 30, ref: 5, after: () => SideQuests.mark('gus') },
    { sq: 1, gate: F => KEYS() && SideQuests.free('gus') && SideQuests.fresh('gus'), where: 'keys', text: 'Dive the wreck off the Southernmost Point for Gus’s lost dive watch (1984)',
      ask: [['OLD GUS', 'Back in ’84 I lost my dive watch on her. A Timex. My wife gave it to me.'], ['OLD GUS', 'It’s still down there, son. I can feel it. It’s probably still ticking. It’s a Timex.']],
      diveExtra: (s, at, wreckHere) => s.watch || !wreckHere ? null : { k: 'guswatch', name: 'Gus’s old Timex', keep: true, say: 'A Timex. 1984. Still ticking. It took a licking.', draw: (x, y, t) => { OR(x - 3, y - 3, 6, 6, '#c9c2b4'); R(x - 2, y - 2, 4, 4, PAL.white); R(x, y - 2, 1, 2, PAL.ink); R(x - 6, y - 1, 3, 2, '#6b4a2e'); R(x + 3, y - 1, 3, 2, '#6b4a2e'); if (Math.floor(t * 2) % 2) R(x, y, 2, 1, PAL.red); } },
      diveDone(s, r) { if (!s.watch && r.got.some(g => g.k === 'guswatch')) { s.watch = true; toast('Got Gus’s watch. Take it to him (the tarpon dock, Marathon).', 3.5); } },
      target: s => s.watch ? SideQuests.who('gus') : World.spots.buoy,
      ready: s => !!s.watch && SideQuests.free('gus'), get readyHint() { return SideQuests.nag('gus', 'Off the Southernmost Point, son. Dive by the buoy. Forty feet.'); },
      pay: () => [['OLD GUS', '...That’s it. She gave me this in 1979. Said it would outlast me.'], ['OLD GUS', 'It’s four minutes slow. It was ALWAYS four minutes slow.'], ['', 'Gus puts it on. He doesn’t say anything for a while. Neither does Dan.']],
      cash: 25, ref: 5, after: () => { SideQuests.mark('gus'); headline('FLORIDA MAN RECOVERS WIDOWER’S 1984 DIVE WATCH FROM SHIPWRECK; WATCH "STILL TICKING"', 1); } },
    { sq: 1, gate: F => KEYS() && SideQuests.free('gus') && SideQuests.fresh('gus'), where: 'keys', text: 'Catch Old Silver, the tarpon Gus has chased for 40 years (end of the tarpon dock, 6–10 PM)',
      ask: [['OLD GUS', 'There’s a tarpon off this dock. Old Silver. A hundred and forty pounds.'], ['OLD GUS', 'I’ve been chasing him since Carter.'], ['DAN', 'You want ME to catch him?'], ['OLD GUS', 'I want SOMEBODY to. Before one of us dies. He only bites at sunset.']],
      interaction() {
        const D = Game.dan; if (D.ride || !SideQuests.near(World.spots.dockEnd, 26)) return null;
        return Game.hour >= 18 ? { label: 'Cast for Old Silver', fn: () => SideQuests.silverCast() } : null;
      },
      tick(s) {
        const i = Game.catchBag.findIndex(f => f.id === 'silver');
        if (i >= 0) { Game.catchBag.splice(i, 1); Game.inv.fish = Game.catchBag.filter(f => !f.junk).length; s.silver = true; toast('OLD SILVER. 142 lb. Gus is going to lose his mind. Go get him.', 3.5); }
        if (!s.silver && Game.hour < 18 && !SideQuests.tmp.silverTold && SideQuests.near(World.spots.dockEnd, 30)) { SideQuests.tmp.silverTold = true; toast('Old Silver only bites at sunset. Come back after 6 PM.', 3); }
      },
      target: s => s.silver ? SideQuests.who('gus') : World.spots.dockEnd,
      ready: s => !!s.silver && SideQuests.free('gus'), get readyHint() { return SideQuests.nag('gus', 'Sunset, son. End of the dock. He only bites at sunset.'); },
      pay: () => [['OLD GUS', '...That’s him. That’s Old Silver. I gave him that scar in 1986.'], ['OLD GUS', 'He’s yours, son. You caught him. What’s it gonna be?', [
        ['Mount him on Gus’s wall', () => { Game.money += 80; headline('FLORIDA MAN LANDS 142-LB LEGENDARY TARPON, MOUNTS IT IN RETIREE’S LIVING ROOM', 4); return [['OLD GUS', 'Over the TV. I’ll talk to him during Jeopardy. Here, eighty bucks. Taxidermy guy owes me.']]; }],
        ['Let him go', () => { Game.allegations = Math.max(0, Game.allegations - 8); headline('FLORIDA MAN CATCHES LEGENDARY TARPON, LETS IT GO; RETIREE CRIES ON DOCK', 1); return [['', 'Dan and Gus ease Old Silver back into the water. He looks at them. Then he’s gone.'], ['OLD GUS', 'Forty years. And I finally let him go. Thank you, son.']]; }]]]],
      cash: 30, ref: 6, after: () => SideQuests.mark('gus') },
  ],
  // ---------- Daytona: Tiny ----------
  tiny: [
    { sq: 1, gate: F => DAYTONA() && F.case6Won && SideQuests.free('tiny'), where: 'daytona', text: 'Walk Tiny’s mama from the Greyhound to the motel. NO BIKERS',
      ask: [['TINY', 'Dan. My mama’s visiting from Ohio. She thinks I’m a DENTIST.'], ['DAN', 'Why would she think that?'], ['TINY', 'I told her in 1998. It got out of hand. I have a fake practice. It has a WEBSITE.'], ['TINY', 'Meet her at the Greyhound, walk her to the motel. If she sees ONE biker, I’m done.']],
      act: { at: () => SideQuests.tmp.mama ? World.spots.door : World.spots.stationDoor, r: 30, when: () => !SideQuests.tmp.mama, wait: 'Walk Mama to the motel (steer her clear of bikers)', label: 'Meet Tiny’s mama at the Greyhound', back: true, run: fin => SideQuests.mamaStart(fin) },
      ready: () => SideQuests.free('tiny'),
      tick: (s, dt) => SideQuests.mamaTick(dt),
      interaction() { const M = SideQuests.tmp.mama; return M && !Game.dan.ride && SideQuests.near(M.n, 22) ? { label: 'Talk to Mama', fn: () => say([['MAMA', pick(['Tiny tells me you’re a dentist too, sweetie. You have such... strong hands.', 'Everybody here is so TAN. And so hairy. Is it a hygienist thing?', 'I brought Tiny a sweater. It’s 94 degrees. He’s getting the sweater.'])]]) } : null; },
      pay: () => [['TINY', 'She called me. Said you were “a very nice dentist friend.”'], ['TINY', 'She thinks the whole TOWN is a dental convention.'], ['TINY', 'She’s staying through Bike Week. Help.']],
      cash: 30, ref: 4, after: () => SideQuests.mark('tiny') },
    { sq: 1, gate: F => DAYTONA() && SideQuests.free('tiny') && SideQuests.fresh('tiny'), where: 'daytona', text: 'Bike Night at the Iron Hog with Tiny’s mama (after 8 PM)',
      ask: [['TINY', 'Mama wants to see where I “work.” Tonight. I told her the Iron Hog is my office.'], ['DAN', 'It has a neon pig on it.'], ['TINY', 'It’s a PEDIATRIC practice. After eight. Please, Dan.']],
      act: { at: () => ({ x: World.spots.saloon.x, y: World.spots.saloon.y + 16 }), r: 34, when: () => Game.hour >= 20, wait: 'Bike Night (after 8 PM)', label: 'Walk into Bike Night with Mama', run: fin => SideQuests.bikeNight(fin) },
      pay: () => [['TINY', 'Whatever happened in there... Mama’s staying for Bike Week. On her OWN bike.'], ['TINY', 'You’re a real one, Dan. Here. It’s dentist money.']],
      cash: 40, ref: 6, after: () => SideQuests.mark('tiny') },
  ],
});

// ---------- the gigs ----------
Object.assign(GIGS, {
  // Swamp: a delivery with a real choice
  oregano: { giver: 'wayne', quest: 'Deliver Wayne’s “oregano” to the Leaky Tiki (by boat) · or turn it in to Rhonda',
    get pay() { return G_().orB === 'rhonda' ? 15 : 40; },
    offer: [['WAYNE', 'Duuude. Skeeter ordered a... spice shipment. For the bar. Oregano. It’s for pizza.'], ['DAN', 'The Tiki doesn’t sell pizza.'], ['WAYNE', 'Not YET, man. Forty bucks. Rhonda’s been sniffin’ around, so, like... be cool.']],
    start() { G_().orB = null; G_().sniffed = false; },
    tick() {
      const G = G_(), r = SideQuests.who('rhonda');
      if (!G.sniffed && r && Math.hypot(r.x - Game.dan.x, r.y - Game.dan.y) < 50 && Game.mode === 'play') { G.sniffed = true; Heat.add(1); toast('RHONDA: Why do you smell like a PIZZA, Dan?', 3); }
    },
    interaction() {
      const G = G_(), r = SideQuests.who('rhonda'), D = Game.dan;
      if (G.orB) return null;
      if (!D.ride && SideQuests.near(World.spots.tiki, 30)) return { label: 'Hand off Wayne’s package', fn: () => say([['SKEETER', 'Wayne’s “oregano”? FINALLY. Pizza Night is BACK.'], ['DAN', 'You don’t have an oven.'], ['SKEETER', 'We have a grill, a generator, and a DREAM.']], () => { G.orB = 'tiki'; Heat.add(1); Gigs.complete('oregano'); }) };
      if (!D.ride && r && SideQuests.near(r, 24)) return { label: 'Talk to Rhonda (with Wayne’s package)', fn: () => say([['RHONDA', 'Dan. What’s in the bag.'], ['DAN', '', [
        ['Turn it in', () => { G.orB = 'rhonda'; return [['RHONDA', '...It’s oregano. It’s ACTUAL oregano, Dan. From a Publix.'], ['RHONDA', 'Fifteen bucks from the good-citizen jar. Don’t tell anybody I said “citizen.”'], ['TEXT: WAYNE', 'bro. u narced on my OREGANO?? it was REAL oregano. im hurt']]; }],
        ['“Nothin’.”', () => { Game.afterTalk = () => Story.talk(r); return null; }]]]], () => { if (G.orB === 'rhonda') { Game.heat = Math.max(0, (Game.heat || 0) - 1); Gigs.complete('oregano'); } }) };
      return null;
    },
    target: () => World.spots.tiki,
    get hl() { return G_().orB === 'rhonda' ? 'FLORIDA MAN TURNS IN NEIGHBOR’S "OREGANO" TO DEPUTY; IT WAS ACTUALLY OREGANO' : 'SWAMP BAR LAUNCHES "OREGANO PIZZA NIGHT"; NO PIZZA INVOLVED'; } },
  // Miami: sneak up on a celebrity, snap him, sell it through the valet
  paparazzi: { giver: 'valet', pay: 45, quest: 'Sneak up on the celebrity on the beach and snap a photo (FREEZE when the bodyguard turns)',
    offer: [['VALET', 'A celebrity is on the beach. BIG one. White suit, gold shades, says “DALÉ” a lot.'], ['VALET', 'Tabloids pay forty-five for a close-up. His bodyguard breaks cameras. And the guys holding them.']],
    start() { G_().pap = { st: 'calm', k: 0, next: 2.8, busts: 0, photo: false }; SideQuests.papSpawn(); },
    tick(dt) {
      const p = G_().pap; if (!p || p.photo) return;
      SideQuests.papSpawn(); const gd = Game.npcs.find(n => n.guard), c = SideQuests.who('celeb'), D = Game.dan; if (!gd || !c) return;
      p.k += dt; const d = Math.hypot(D.x - gd.x, D.y - gd.y);
      if (p.st === 'calm') { gd.dir = 'right'; if (p.k > p.next) { p.st = 'warn'; p.k = 0; } }
      else if (p.st === 'warn') { if (p.k > .55) { p.st = 'scan'; p.k = 0; } }
      else { gd.dir = dirOf(D.x - gd.x, D.y - gd.y); if (D.moving && d < 160) return SideQuests.papBust(p, gd); if (p.k > 1.6) { p.st = 'calm'; p.k = 0; p.next = rnd(2.2, 3.4); } }
      if (d < 16) SideQuests.papBust(p, gd);
    },
    interaction() {
      const p = G_().pap, c = SideQuests.who('celeb'), gd = Game.npcs.find(n => n.guard); if (!p || p.photo || Game.dan.ride) return null;
      if (c && SideQuests.near(c, 30)) return { label: 'SNAP THE PHOTO', fn: () => { p.photo = true; Game.flash = .8; Sound.play('pickup'); SideQuests.papClear(); questText('gig_paparazzi', 'Sell the celebrity photo to the Valet (Hotel Neon)'); say([['', '*CLICK*'], ['MR. WORLDWIDE-ISH', '...DALÉ?'], ['', 'It’s mostly his feet. The celebrity leaves in a golf cart. The feet are VERY recognizable.']]); } };
      if (gd && SideQuests.near(gd, 24)) return { label: 'Talk to the Bodyguard', fn: () => toast('BODYGUARD: No photos. No autographs. No eye contact. Especially you.', 3) };
      return null;
    },
    talkActive: () => G_().pap && G_().pap.photo ? 'done' : [['VALET', 'He’s on the beach, man. The bodyguard turns around a lot. Move when he’s not looking.']],
    target: () => G_().pap && G_().pap.photo ? SideQuests.who('valet') : SideQuests.who('celeb'),
    draw(cx, cy, t) {
      const p = G_().pap, gd = Game.npcs.find(n => n.guard), c = SideQuests.who('celeb'); if (!p || p.photo || !gd) return;
      if (p.st !== 'calm') label(p.st === 'warn' ? '?' : '!', gd.x - cx, gd.y - cy - 28 + Math.round(Math.sin(t * 12)), p.st === 'warn' ? PAL.yellow : PAL.red, 10);
      if (c) label('NO PHOTOS', c.x - cx, c.y - cy + 10, PAL.yellow, 5);
    },
    hl: 'FLORIDA MAN SELLS TABLOID PHOTO OF CELEBRITY’S FEET; CELEBRITY: "DALÉ"' },
  // Miami: water taxi to a yacht party, one guest goes overboard
  yacht: { giver: 'coral', pay: 40, quest: 'Water taxi: ferry 3 party guests from the bay dock to the yacht (by boat)',
    offer: [['CORAL', 'Dude. Yacht party in the bay. The water taxi guy quit. He got SEASICK. On a WATER TAXI.'], ['CORAL', 'Three guests on the bay dock. Get ’em to the big yacht down south. Forty bucks.'], ['CORAL', 'Don’t lose anybody.']],
    start() { G_().yt = { aboard: 0, fell: false, over: null }; },
    tick() {
      const y = G_().yt, D = Game.dan; if (!y) return;
      if (y.aboard === 3 && !y.fell && D.ride === 'boat' && D.y > 33 * TS) { y.fell = true; y.aboard = 2; y.over = canBoat(D.x + 20, D.y - 16) ? { x: D.x + 20, y: D.y - 16 } : { x: D.x, y: D.y - 16 }; splash(y.over.x, y.over.y, 12); Sound.play('splash'); toast('MAN OVERBOARD! Chad fell off doing a “boat pose.” Go back and get him.', 3.5); }
      if (y.over) y.over.x += Math.sin(Game.t) * .08;
    },
    interaction() {
      const y = G_().yt, D = Game.dan; if (!y || D.ride !== 'boat') return null;
      const [px, py] = SideQuests.YT_PICK, [dx, dy] = SideQuests.YT_DROP;
      if (y.aboard === 0 && !y.fell && SideQuests.near(SideQuests.at(px, py), 46)) return { label: 'Pick up the party guests', fn: () => { y.aboard = 3; Sound.play('pickup'); toast('Three guests climb in. One of them is named Chad. Chad stands up in the boat. Chad, SIT DOWN.', 3.5); } };
      if (y.over && SideQuests.near(y.over, 28)) return { label: 'Fish Chad out of the bay', fn: () => { y.over = null; y.aboard = 3; Sound.play('catch'); toast('Dan hauls Chad in by the shorts. Chad is fine. Chad wants to do it again.', 3); } };
      if (y.aboard > 0 && SideQuests.near(SideQuests.at(dx, dy), 46)) return { label: 'Drop the guests at the yacht', fn: () => {
        if (y.aboard < 3) return toast('One guest short. Chad is still in the bay. Somewhere. Yelling.', 3);
        y.aboard = 0; y.done = true; say([['', 'The guests climb the yacht ladder. The party cheers. Chad cannonballs off the top deck immediately.'], ['YACHT GUY', 'Water taxi guy! You want a drink?'], ['DAN', 'I’m workin’.'], ['DAN', '...Yes.']], () => Gigs.complete('yacht'));
      } };
      return null;
    },
    target() { const y = G_().yt; if (!y) return null; const [px, py] = SideQuests.YT_PICK, [dx, dy] = SideQuests.YT_DROP; if (y.over) return y.over; if (y.aboard === 0) return Game.dan.ride === 'boat' ? SideQuests.at(px, py) : Game.boat; return SideQuests.at(dx, dy); },
    draw(cx, cy, t) {
      const y = G_().yt; if (!y) return; const D = Game.dan, B = D.ride === 'boat' ? D : Game.boat;
      if (y.aboard === 0 && !y.fell && !y.done) for (let i = 0; i < 3; i++) SideQuests.person('tourist', SideQuests.YT_PICK[0] * TS + 6 + i * 11 - cx, (SideQuests.YT_PICK[1] - 1.9) * TS - cy + Math.round(Math.sin(t * 3 + i)));
      const dir = D.ride === 'boat' ? D.dir : Game.boat.dir, vert = dir === 'up' || dir === 'down', back = dir === 'up' || dir === 'left' ? 1 : -1;   // guests sit behind Dan
      for (let i = 0; i < y.aboard; i++) SideQuests.person('tourist', B.x - cx + (vert ? (i - 1) * 5 : back * (9 + i * 4)), B.y - cy + (vert ? 8 + (i % 2) * 5 : (i % 2) * 2) + 1, 9);
      if (y.over) { const x = y.over.x - cx, yy = y.over.y - cy + Math.sin(t * 3) * 1.5; SideQuests.person('tourist', x, yy, 9); label('HELP', x, yy - 12, PAL.white, 5); }
    },
    hl: 'FLORIDA MAN RUNS WATER TAXI TO YACHT PARTY IN JON BOAT, LOSES ONLY ONE GUEST (BRIEFLY)' },
  // Daytona: the beach run, a timed cooler race past three cones
  beachrun: { giver: 'wrench', pay: 35, quest: 'Wrench’s beach run: ride the cooler past 3 cones in 25s (start at the beach ramp)',
    offer: [['WRENCH', 'Daytona Beach. You can DRIVE on it. Legally. Mostly.'], ['WRENCH', 'Guy did the beach run on a RIDING MOWER in 25 seconds. Beat him on that cooler. Thirty-five bucks.']],
    pts: () => [SideQuests.at(70.5, 30), SideQuests.at(74, 52), SideQuests.at(74, 8), SideQuests.at(70.5, 30)],
    start() { G_().br = { cp: -1, t: 0 }; },
    tick(dt) {
      const b = G_().br, P = GIGS.beachrun.pts(), D = Game.dan; if (!b) return;
      if (b.cp === -1) { if (D.ride === 'cooler' && SideQuests.near(P[0], 40)) { b.cp = 1; b.t = 0; Sound.play('siren'); toast('GO GO GO! Cone 1 is way down south.', 1.5); } return; }
      b.t += dt;
      if (SideQuests.near(P[b.cp], 42) && D.ride === 'cooler') { b.cp++; Sound.play('cash'); if (b.cp >= P.length) { b.won = true; return Gigs.complete('beachrun'); } }
      if (b.t > SideQuests.BEACH_T) { b.cp = -1; Sound.play('fail'); toast('The mower wins. Back to the beach ramp to try again.', 3); }
    },
    timer: () => { const b = G_().br; return b && b.cp >= 1 ? Math.max(0, Math.ceil(SideQuests.BEACH_T - b.t)) : 0; },
    timerLabel: 'BEAT THE MOWER',
    target() { const b = G_().br, P = GIGS.beachrun.pts(); if (!b) return null; if (b.cp >= 1) return P[b.cp]; return Game.dan.ride === 'cooler' ? P[0] : Game.cooler; },
    draw(cx, cy) { const b = G_().br; if (!b) return; GIGS.beachrun.pts().forEach((p, i) => { if (i === 0 && b.cp >= 1 && b.cp < 3) return; SideQuests.cone(p.x - cx, p.y - cy, i === 0 && b.cp === -1 ? 'START' : String(i), (b.cp === -1 && i === 0) || b.cp === i); }); },
    hl: 'FLORIDA MAN SETS DAYTONA BEACH SPEED RECORD ON MOTORIZED COOLER, BEATS GUY ON RIDING MOWER' },
  // Daytona: throwing. Bonk three pelicans off the tattoo parlor roof with empties
  gulls: { giver: 'needles', pay: 25, quest: 'Bonk 3 pelicans off the Ink & Regret roof with empties (PUNCH with nothing in reach throws a can)',
    offer: [['NEEDLES', 'Pelicans. On my roof. They poop on customers MID-TATTOO. A guy got “MOM” with a splat in the O.'], ['NEEDLES', 'Chuck empties at ’em. Here, six empties. I drank ’em. For you. Twenty-five bucks.']],
    perch: [[55.3, 22.2], [56.1, 22.2], [58.8, 22.2]],
    start() { giveItem('can', 6); G_().bonks = 0; },
    tick(dt) {
      const G = G_(); if (G.bonks == null) return;
      const birds = Game.animals.filter(a => a.gull);
      if (!birds.length && G.bonks < 3) GIGS.gulls.perch.forEach(([x, y], i) => { if (i >= G.bonks) Game.animals.push(makeCritter('pelican', x * TS, y * TS, { gull: true, px: x * TS, py: y * TS, z: 30 })); });
      for (const a of Game.animals.filter(b => b.gull)) {
        if (!a.bonked && a.stun > 0) { a.bonked = true; a.gone = 1.4; G.bonks++; a.z = 30; Sound.play('chomp'); toast(`BONK! Pelican ${G.bonks} is OFF the roof. (${G.bonks}/3)`, 2); questText('gig_gulls', `Bonk 3 pelicans off the Ink & Regret roof with empties (${G.bonks}/3)`); if ((Game.inv.can || 0) < 3 - G.bonks) giveItem('can', 3, true); }
        if (!a.bonked) Object.assign(a, { x: a.px, y: a.py, z: 30, state: 'wander', vx: 0, vy: 0, timer: 9 });
      }
      if ((Game.inv.can || 0) === 0 && G.bonks < 3 && !G.moreCans) { G.moreCans = true; giveItem('can', 4, true); toast('NEEDLES: Out of empties? Here. I had more. I always have more.', 3); }
    },
    check: () => (G_().bonks || 0) >= 3,
    target() { const a = Game.animals.find(b => b.gull && !b.bonked); return a ? { x: a.x, y: a.y + 30 } : null; },
    hl: 'FLORIDA MAN CLEARS PELICANS OFF TATTOO PARLOR WITH EMPTY BEER CANS; PELICANS "FILING A COMPLAINT"' },
  // Keys: a timed cooler delivery down US-1
  pies: { giver: 'joelle', pay: 40, quest: 'Key lime pies to Tarpon Tom’s in Marathon by COOLER before they melt (load up at the Conch Shack)',
    offer: [['JOELLE', 'Tarpon Tom’s bait club ordered twelve key lime pies. In MARATHON. It’s 94 degrees.'], ['JOELLE', 'Your cooler has headlights. Bring it here, load up, FLOOR it.'], ['JOELLE', 'Thirty seconds or it’s soup. Forty bucks.']],
    start() { G_().pie = { on: false, t: 0 }; },
    tick(dt) { const p = G_().pie; if (!p || !p.on) return; p.t += dt; if (p.t > SideQuests.PIE_T) { p.on = false; Sound.play('fail'); toast('The pies melted. Key lime SOUP. Joelle has more: reload at the Conch Shack.', 3.5); } },
    timer: () => { const p = G_().pie; return p && p.on ? Math.max(0, Math.ceil(SideQuests.PIE_T - p.t)) : 0; },
    timerLabel: 'PIES MELT IN',
    interaction() {
      const p = G_().pie, D = Game.dan, S_ = World.spots; if (!p || p.done) return null;
      if (!p.on && D.ride === 'cooler' && SideQuests.near({ x: S_.conch.x, y: S_.conch.y + 12 }, 38)) return { label: 'Load twelve key lime pies into the cooler', fn: () => { p.on = true; p.t = 0; Sound.play('siren'); toast('GO GO GO! Tarpon Tom’s, Marathon. Thirty seconds.', 2); } };
      if (p.on && SideQuests.near(S_.bait, 44) && (D.ride === 'cooler' || Math.hypot(Game.cooler.x - D.x, Game.cooler.y - D.y) < 60)) return { label: 'Deliver the key lime pies', fn: () => { p.on = false; p.done = true; say([['TARPON TOM', 'PIES! Still cold! The bait club is going to riot. In a good way.'], ['DAN', 'I only ate one.'], ['TARPON TOM', 'There are eleven here.'], ['DAN', 'I only ate one on the BRIDGE.']], () => Gigs.complete('pies')); } };
      return null;
    },
    target() { const p = G_().pie, S_ = World.spots; if (!p) return null; if (p.on) return S_.bait; return Game.dan.ride === 'cooler' ? { x: S_.conch.x, y: S_.conch.y + 12 } : Game.cooler; },
    hl: 'FLORIDA MAN DELIVERS TWELVE KEY LIME PIES BY MOTORIZED COOLER AT 60 MPH; "ONLY ATE ONE"' },
});
