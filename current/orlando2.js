// FLORIDA DAN — ORLANDO cases: the finale. Case 10: Unlicensed Whimsy (a timeshare pitch for free tickets, a hug that
// pops the mascot's head off, a stolen mouse suit, the Squeak Sneak out of the park). Case 11: The Florida Man Act
// (Squeaky Corp gets Tallahassee to make "Florida Man" a legal status; the whole cast comes to Orlando; the I-4 run,
// Merle's fish fry, Space Squeak Mountain, a night break-in at the castle, a five-judge panel, THE END).
// Plus Orlando gigs, Giant Discount Souvenir World, sprites, the court staging and the finale parade.
// Case days are relative to Game.flags.orlandoFrom (set the morning after the Atocha Job), see Cases.info.
'use strict';
CASE_NAMES[10] = 'UNLICENSED WHIMSY'; CASE_NAMES[11] = 'THE FLORIDA MAN ACT';
// mouse ears baked onto a sprite's head (the mascot, Dan in the suit)
const earsOn = (col = '#3a3440', inner = '#ff9ec7') => out => {
  for (const dir of ['down', 'up', 'right', 'left']) for (const fr of out[dir]) {
    const x = fr.getContext('2d'), at = dir === 'down' || dir === 'up' ? [0, 12] : [2, 10];
    for (const ex of at) { x.fillStyle = PAL.ink; x.fillRect(ex + 1, 0, 2, 1); x.fillRect(ex, 1, 4, 2); x.fillRect(ex + 1, 3, 2, 1); x.fillStyle = col; x.fillRect(ex + 1, 1, 2, 2); if (dir !== 'up') { x.fillStyle = inner; x.fillRect(ex + 1, 2, 1, 1); } }
  }
};
// no mustache (every sprite is a palette swap of Dan, stubble and all): paint the lip row skin, add a little lipstick
const noStache = (skin, lip = '#c94a5a') => out => {
  for (const fr of out.down) { const x = fr.getContext('2d'); x.fillStyle = skin; x.fillRect(5, 8, 6, 1); x.fillStyle = lip; x.fillRect(7, 9, 2, 1); }
  for (const fr of out.right) { const x = fr.getContext('2d'); x.fillStyle = skin; x.fillRect(8, 8, 4, 1); x.fillStyle = lip; x.fillRect(10, 9, 2, 1); }
  for (const fr of out.left) { const x = fr.getContext('2d'); x.fillStyle = skin; x.fillRect(4, 8, 4, 1); x.fillStyle = lip; x.fillRect(4, 9, 2, 1); }
};
const both = (...fs) => out => fs.forEach(f => f(out));
const MOUSE_PAL = { hat: '#3a3440', hatD: '#2a2630', hair: '#3a3440', hairL: '#4a4452', skin: '#f6e3cc', skinD: '#d9bfa4', shades: PAL.black, tank: '#7b4bc4', tankD: '#553089', stain: '#ffd23f', jorts: '#2f8f4e', jortsD: '#1f6a38', flip: '#ff8a3d' };
Object.assign(SWAPS, {
  squeaky: { ...MOUSE_PAL, post: earsOn() },
  danmouse: { ...MOUSE_PAL, stain: '#3d6fe0', post: earsOn() },   // Dan in the suit: same mouse, one beer stain
  kylesuit: { ...MOUSE_PAL, hat: '#6b3e26', hatD: '#4a2e1a', hair: '#6b3e26', skin: '#f2c29a', skinD: '#d9a07a', shades: '#f2c29a' },
  kyle: { hat: '#ff8a3d', hatD: '#c9612a', tank: '#ff9a2e', tankD: '#e07a1a', stain: '#3e8f5a', jorts: PAL.tan, hair: '#6b3e26', shades: '#f2c29a', skin: '#f2c29a', flip: PAL.white },
  enforcer: { hat: '#2a4f7a', hatD: '#1c3656', tank: PAL.white, tankD: '#c9c2b4', stain: '#27c6b4', jorts: '#2a4f7a', jortsD: '#1c3656', hair: '#2a1a12', shades: PAL.shades, skin: '#d9a07a', flip: PAL.black },
  chad: { hat: '#ffe07a', hatD: '#d9b441', hair: '#ffe07a', tank: '#9fd8ee', tankD: '#6fb8d8', stain: '#27c6b4', jorts: '#c9a86b', shades: '#e0433a', skin: '#f0a070', skinD: '#c9784a', flip: '#7a4a2b' },
  deb: { hat: '#c9a86b', hatD: '#9c7f48', tank: '#a8774f', tankD: '#8a5a3a', stain: '#557f3c', jorts: '#6b7a3a', hair: '#c46a3a', shades: PAL.shades, skin: '#d99a74', flip: '#6b4a2e', post: noStache('#d99a74') },
  dolores: { hat: PAL.white, hatD: '#c9c2b4', hair: '#d9c8ff', tank: '#ff8fc0', tankD: '#e06a9f', stain: PAL.white, jorts: '#ff8fc0', shades: '#b86bd6', skin: '#f2c29a', flip: PAL.white, post: noStache('#f2c29a', '#ff5ea8') },
  larry: { hat: '#e0433a', hatD: '#a82c2a', tank: '#ff8a3d', tankD: '#ffd23f', stain: '#86c94a', jorts: PAL.white, hair: PAL.grey, shades: PAL.shades, skin: '#e0956a', flip: '#e0433a' },
  gloria: { hat: '#2a1a12', hatD: '#1a100a', hair: '#2a1a12', tank: '#27c6b4', tankD: '#1b8f83', stain: '#ffd23f', jorts: '#553089', shades: '#ff5ea8', skin: '#b8704f', flip: '#ff5ea8', post: both(earsOn('#ff5ea8', PAL.white), noStache('#b8704f')) },
  todd: { hat: '#e0433a', hatD: '#a82c2a', tank: '#8d8a93', tankD: '#5d5a66', stain: '#e0433a', jorts: '#c9a86b', hair: '#6b3e26', shades: '#ff9d8a', skin: '#ff9d8a', skinD: '#e0685a', flip: PAL.white },
  pembrook: { hat: PAL.black, hatD: PAL.inkL, hair: PAL.black, tank: '#23304a', tankD: '#1a2236', stain: PAL.white, jorts: '#23304a', shades: '#f2c29a', skin: '#f2c29a', flip: PAL.black },
  cheddarton: { hat: PAL.white, hatD: PAL.grey, hair: PAL.white, tank: '#f2c14a', tankD: '#d9a02a', stain: '#e0433a', jorts: '#f2c14a', shades: PAL.shades, skin: '#f2b48f', flip: '#7a4a2b' },
  blossom: { hat: '#c46a3a', hatD: '#8e4a26', hair: '#c46a3a', tank: PAL.robe, tankD: PAL.robeL, stain: PAL.robeL, jorts: PAL.robe, shades: '#b8704f', skin: '#b8704f', skinD: '#8a5a3a', flip: PAL.black, post: noStache('#b8704f', '#8a3a3a') },
  brenda: { hat: '#8e4a26', hatD: '#6b3e26', hair: '#8e4a26', tank: '#34569e', tankD: '#274ba8', stain: PAL.white, jorts: '#23202b', shades: '#9fd8ee', skin: '#f2c29a', flip: PAL.black, post: noStache('#f2c29a') },
});
CRITTERS.duck = { key: { o: 'ink', w: 'white', g: '#2f8f4e', y: 'orange', b: '#a8774f', d: '#c9c2b4' }, rows: [
  '..oo......', '.oggo.....', '.oggko....', 'yyoggo....', '..oggo..o.', '..obwwoobo', '.obbwwwwbo', '.odwwwwwo.', '..oooooo..', '...y..y...'] };
const OSP = () => World.spots;
const oWho = id => Game.npcs.find(n => n.id === id);
const oFish = () => Game.catchBag.filter(f => !f.junk).length;
// the whole cast, in Orlando for the finale: [id, name, sprite, pool spot (tiles), courthouse spot (tiles)]
const GANG = [['brenda', 'Brenda', 'brenda', [5.5, 42.8], [83, 22.4]], ['o_merle', 'Merle', 'merle', [9.7, 40.2], [76.5, 24.8]], ['o_darlene', 'Darlene', 'darlene', [1.4, 42.6], [84.5, 24.8]],
  ['o_rhonda', 'Deputy Rhonda', 'rhonda', [3.4, 43.6], [74.5, 24.6]], ['o_kayden', 'Kayden', 'kayden', [7.6, 43.6], [86.5, 24.6]], ['o_abuela', 'Abuela', 'abuela', [10.6, 42.4], [72.5, 23.8]],
  ['o_tammy', 'Tammy Jo', 'tammy', [1.2, 40.2], [88, 23.6]], ['o_gus', 'Old Gus', 'gus', [10.9, 38.4], [78.2, 25.4]], ['o_pam', 'Dr. Pam', 'pam', [8.8, 44.8], [82, 25.6]]];
const SLIDES = [['PARADISE', 'KISSIMMEE, FL'], ['EQUITY!', 'IN A CONDO'], ['POINTS!!', 'THEY’RE LIKE MONEY'], ['YOUR KIDS', 'WILL FINALLY RESPECT YOU'], ['ACT NOW', 'PRICE GOES UP AT 4'], ['WEEK 7', 'OF FEBRUARY. FOREVER.']];

const OrlandoCases = {
  c: () => Cases.info(),
  spawn() {
    const c = this.c(), F = Game.flags, S_ = OSP(), N = Game.npcs, add = (...a) => N.push(makeNPC(...a));
    if (typeof PICKUP_LINES !== 'undefined') PICKUP_LINES.orange = ['An orange! Fresh off the tree. Slightly punched.', 'Orange. Dan considers eating it. Kyle needs it more.'];
    if (!(c.n === 10 && c.d === 1 && F.suitOn)) add('squeaky', 'Mr. Squeaky', S_.photo.x, S_.photo.y, 'down');
    if (c.n === 10 && c.d === 1) for (const [x, y] of [[37.5, 13.4], [41.6, 13.2], [36.8, 11.6]]) add('tourist', 'Tourist', x * TS, y * TS, 'up', { wander: 10 });
    if (!(c.n === 10 && c.d === 1)) add('kyle', 'Kyle', S_.orange.x, S_.orange.y, 'down');
    if (c.n === 10 && c.d === 2) { add('todd', 'Todd', S_.gators.x + 52, S_.gators.y, 'down'); add('pembrook', 'Mr. Pembrook', S_.court.x - 30, S_.court.y + 22, 'down'); }
    if (c.n === 10 && c.d === 3) { add('pembrook', 'Mr. Pembrook', S_.court.x - 30, S_.court.y + 22, 'down'); add('cheddarton', 'Wendell Cheddarton', S_.court.x + 30, S_.court.y + 22, 'down'); }
    if (c.n === 11 && c.d === 2 && !F.ridePhoto) add('cheddarton', 'Wendell Cheddarton', S_.coaster.x + 26, S_.coaster.y + 8, 'down');
    if (c.n === 11 && F.gangHere) this.spawnGang(c.d === 3 ? 4 : 3);
  },
  spawnGang(k = 3) {
    for (const g_ of GANG) { const [id, name, spr] = g_, [tx, ty] = g_[k]; if (!oWho(id)) Game.npcs.push(makeNPC(id, name, tx * TS, ty * TS, 'down', { sprite: spr })); }
    if (k === 3 && !Game.animals.some(a => a.ape)) Game.animals.push(makeCritter('skunkape', 4.8 * TS, 45.4 * TS, { ape: true, state: 'den' }));
  },
  arrived(to) {
    const c = this.c();
    if (to === 'orlando' && c.n === 10 && c.d === 1 && qOpen('bus10')) { done('bus10'); addQuest('timeshare', 'Sit through a timeshare pitch (I-Drive)'); }
    if (to === 'orlando' && !Game.flags.orlandoFirst) { Game.flags.orlandoFirst = true; headline('FLORIDA MAN ARRIVES IN ORLANDO WITH A COOLER; MOUSE "AWARE"', 2); }
  },
  setupDay(n) {
    const c = Cases.info(n), F = Game.flags; Game.dan.mascot = false;
    if (c.n === 10 && c.d === 1) {
      setQuests([['bus10', 'Take the Greyhound to Orlando (bus station)']]);
      if (ORLANDO()) { done('bus10'); addQuest('timeshare', 'Sit through a timeshare pitch (I-Drive)'); }
      return say([['', 'A postcard arrives at the houseboat. It has a mouse on it.'], ['', '“YOU’VE WON 2 FREE DAYS AT SQUEAKYLAND!* (*90-minute presentation required)”'], ['DAN', 'Free. My favorite price.'],
        [PHONE_B, 'Dan. What did I say. On the parade float. In front of four thousand people.'], ['DAN', 'Don’t go to Orlando. But it’s FREE, Brenda. It’s a timeshare thing.'],
        [PHONE_B, 'A timeshare. In Orlando. With YOU. That’s three bad things.'], ['DAN', 'I sit, I nod, I get the tickets, I get a picture with the mouse.'],
        [PHONE_B, 'Do NOT touch the mouse, Dan. The mouse has a legal department the size of Ohio.']]);
    }
    if (c.n === 10 && c.d === 2) {
      Game.hour = 7; setQuests([['kyle', 'Find Kyle, the guy in the suit (ask Chad)'], ['video', 'Find the dad who filmed it (Gator Jamboree)']]);
      return say([['', 'Dan wakes up in the mouse suit. Best sleep of his life. He takes it off. Mostly.'], [PHONE_B, 'Dan. Squeaky Corp filed at 6 AM. Grand Theft Mouse. Impersonating a Mascot.'],
        [PHONE_B, 'And “Unlicensed Whimsy.” It’s a real Orange County law. Since 1971.'], ['DAN', 'The guy GAVE me the suit, Brenda. Kyle. He quit. In his underwear.'],
        [PHONE_B, 'Then find Kyle. And somebody filmed it. Somebody ALWAYS filmed it.'], ['TEXT: KAYDEN', 'bro ur trending in orlando. some dad from ohio posted it. hes at the gator place']]);
    }
    if (c.n === 10 && c.d === 3) { Game.hour = 8; setQuests([['court', 'Orange County Courthouse (by Lake Lola)']]); return say([['', 'COURT DAY. ORANGE COUNTY.'], [PHONE_B, 'Kyle. The video. And do NOT wear the ears.'], ['DAN', 'What ears?'], [PHONE_B, 'The ones on your head right now, Dan.']]); }
    if (c.n === 11 && c.d === 1) {
      Game.hour = 7; setQuests([['calls', 'Call in your witnesses (payphone, Kingdom Inn)']]);
      return say([['RADIO', '...at 3 AM, Tallahassee passed the Florida Man Act. Sponsor: Squeaky Corp.'], ['RADIO', 'Anyone ruled a “Florida Man” is banned from every park, beach and boat ramp. And coolers.'],
        ['RADIO', 'Motorized ones. First name on the docket: Daniel Wayne Dupree.'], ['DAN', '...They can’t take the COOLER.'],
        [PHONE_B, 'Dan. This is the big one. A court decides, for good, if you’re a Florida Man.'], [PHONE_B, 'Eleven cases. Every headline. Every gator. They’re bringing ALL of it.'],
        ['DAN', 'Then I’m bringing everybody.'], [PHONE_B, '...Everybody?'], ['DAN', 'Everybody, Brenda.']]);
    }
    if (c.n === 11 && c.d === 2) {
      Game.hour = 7; setQuests([['coaster', 'Ride Space Squeak Mountain (the park)'], ['memo', 'After dark: sneak into the castle (the memo)'], ['gang', 'Hang out with the gang (0/5)', true]]);
      return say([[PHONE_B, 'Squeaky Corp’s whole case is your headlines. Read out loud. All of them.'], [PHONE_B, 'I need proof THEY wrote that law. And proof you’re no worse than anyone in this state.'],
        ['DAN', 'Nobody in this state is better than me, Brenda.'], [PHONE_B, 'PROVE it. Cheddarton rides Space Squeak Mountain every morning. It’s in his memoir.'],
        ['TEXT: KYLE', 'its kyle. HQ is in the castle. safe code is 1234. i had the safe for a week in 2020']]);
    }
    if (c.n === 11 && c.d === 3) {
      Game.hour = 8; setQuests([['court', 'THE LAST TRIAL. Orange County Courthouse']]);
      return say([['', 'THE LAST COURT DAY.'], [PHONE_B, 'The photo. The memo. The gang. You ready?'], ['DAN', 'Brenda. You’re calling me from across the hall.'], [PHONE_B, 'It’s tradition, Dan.'], [PHONE_B, 'Whatever happens... it’s been an honor. Don’t make it weird.'], ['DAN', 'I’m gonna make it SO weird.']]);
    }
    // endless Orlando days fall back to the generic morning (Cases.setupDay)
  },
  tick(dt) {
    const c = this.c(), F = Game.flags, D = Game.dan;
    if (ORLANDO()) Orlando.tick(dt);
    D.mascot = c.n === 10 && c.d === 1 && !!F.suitOn;
    if (c.n === 10 && c.d === 2 && qOpen('oranges')) { const n = Math.min(6, Game.inv.orange || 0); questText('oranges', `Punch orange trees for Kyle (${n}/6)`); if (n >= 6) done('oranges'); }
    if (c.n === 11 && c.d === 1 && qOpen('fishfry')) { const n = Math.min(3, oFish()); questText('fishfry', n >= 3 ? 'Bring the fish to Merle (motel pool)' : `Catch 3 fish for Merle (${n}/3, Lake Lola)`); }
    if (c.n === 11 && c.d === 2 && qOpen('gang')) { const n = Object.keys(F.gangTalk || {}).length; questText('gang', `Hang out with the gang (${Math.min(5, n)}/5)`); if (n >= 5) { done('gang'); headline('FLORIDA MAN’S ENTIRE SUPPORT SYSTEM CHECKS INTO ONE MOTEL; MOTEL "OVERWHELMED, HONORED"', 2); } }
  },
  enteredPark() {
    const c = this.c();
    if (c.n === 10 && c.d === 1 && !Q('squeaky')) { done('timeshare'); done('park'); addQuest('squeaky', 'Get a photo with Mr. Squeaky (the castle)'); hint('mouse', 'The mouse is by the castle. Straight up Main Street', 5); }
    if (!Game.flags.parkHl) { Game.flags.parkHl = true; headline('FLORIDA MAN ENTERS SQUEAKYLAND IN JORTS; CHURRO STANDS "ON ALERT"', 2); }
  },
  // ---------- Case 10, day 1 ----------
  stayAwake(win, lose) {
    Mash.start({ kind: 'awake', title: 'STAY AWAKE (90-MINUTE PITCH)', hint: `MASH ${K('a')}: KEEP YOUR EYES OPEN!`, need: 36, time: 10, sound: 'talk', onWin: win, onLose: lose, draw: (t, k) => {
      R(0, 0, VW, VH, '#3a3050'); R(0, 120, VW, 60, '#5a4a3a'); for (let i = 0; i < VW; i += 20) R(i, 120, 1, 60, '#4a3a2a');
      OR(36, 12, 170, 92, '#f4f1ea'); R(36, 12, 170, 4, '#27c6b4'); const sl = SLIDES[Math.floor(t / 1.6) % SLIDES.length];
      label(sl[0], 121, 50, '#27c6b4', 9); label(sl[1], 121, 72, '#e0433a', 6); if (sl[0] === 'EQUITY!') for (let i = 0; i < 6; i++) R(70 + i * 16, 96 - i * 5, 10, i * 5 + 2, '#86c94a');
      g.drawImage(SPR.chad.left[Math.floor(t * 4) % 2], 0, 0, 16, 22, 214, 50, 32, 44); R(206, 64, 10, 2, PAL.ink);
      g.drawImage(SPR.dan.up[0], 0, 0, 16, 22, 96, 108, 48, 66); OR(90, 150, 60, 8, '#8d8a93');
      label(['...AND THE POOL IS HEATED...', '...POINTS ROLL OVER...', '...ASK ME ABOUT FEBRUARY...'][Math.floor(t / 2.2) % 3], 230, 106, PAL.white, 4);
      const el = Mash.s ? Mash.s.t : 0, lid = clamp(el / 7 - k * 1.1 + .05, 0, .82), lh = Math.round(lid * 90);   // eyelids: they droop with time, mashing opens them
      R(0, 0, VW, lh, PAL.black); R(0, VH - lh, VW, lh, PAL.black); if (lid > .55) label('Z z z', 270, 74, PAL.white, 7);
    } });
  },
  incident(n) {
    const D = Game.dan, F = Game.flags, x = n.x, y = n.y, head = (() => { const c = document.createElement('canvas'); c.width = c.height = 24; const old = g; g = c.getContext('2d'); mouseHead(12, 15, 6); R(9, 15, 6, 4, '#f6e3cc'); R(10, 15, 1, 1, PAL.black); R(13, 15, 1, 1, PAL.black); g = old; return c; })();
    Scene.play([
      SC.cam(x, y - 8, 1.6, .8), SC.walk('dan', x - 16, y + 2, 50), SC.face('dan', 'right'), SC.face(n, 'left'),
      SC.line('dan', 'Mr. Squeaky! Big fan! Picture?', 1.4), SC.emote(n, '♥', .8, PAL.hat), SC.line('dan', 'Bring it in, buddy!', 1.1),
      SC.walk('dan', x - 7, y + 2, 70), SC.shake(5), SC.sound('punch'), SC.fx(() => { n.sprite = 'kylesuit'; }), SC.fly(head, x, y - 20, x + 46, y + 14, .9, 10, true),
      SC.all([SC.emote('dan', '!', 1, PAL.red), SC.emote(n, '!', 1, PAL.red)]),
      SC.say([['', 'Dan hugs too hard. Mr. Squeaky’s head pops off and rolls into the flower bed.'], ['', 'Inside the suit: a sweaty guy named Kyle. Three hundred kids gasp at once.'],
        ['KYLE', 'Oh thank GOD. I’ve been in there since 2019.'], ['DAN', 'Buddy. You okay?'], ['KYLE', 'I’m on break. Forever. You want the suit? Take the suit.'],
        ['DAN', '...The kids are still lookin’ at me, Kyle.'], ['KYLE', 'Then be the mouse, man. Be the mouse.']]),
      SC.fx(() => { n.sprite = 'kyle'; }), SC.walk(n, x + 30, y + 150, 80), SC.hide(n),
      SC.fx(() => { F.suitOn = true; D.mascot = true; Sound.play('pickup'); Game.flash = .4; }), SC.emote('dan', '♥', .9, PAL.hat), SC.react('cheer'),
      SC.say([['', 'Dan puts on the suit. It smells like churros and fear. The kids CHEER.'], ['DAN', '(muffled) HEY KIDS! IT’S ME! THE MOUSE!'],
        ['', 'It is 94 degrees out. Inside the suit it is 140. There is a Swamp Lite in the pouch.'], ['', 'Mr. Squeaky takes his head off in front of three hundred children and SHOTGUNS it.']]),
      SC.fx(() => { D.anim = 'beer'; D.animT = 1.5; Sound.play('crack'); }), SC.wait(1.3), SC.line('dan', 'AHHHHH.', 1),
      SC.say([['KID', 'MOMMY WHY IS MR. SQUEAKY DAN'], ['FUN ENFORCEMENT', '(radio) CODE CHEESE. CODE CHEESE. Squeaky is off-script at the castle.'], ['DAN', '(head back on) ...gotta go, kids. Mouse stuff.']]),
    ], () => {
      headline('FLORIDA MAN STEALS MOUSE COSTUME, CHUGS BEER IN FRONT OF 300 CHILDREN; SQUEAKY CORP "DEVASTATED"', 12);
      done('squeaky'); addQuest('escape', 'Escape the park in the mouse suit'); this.runForIt();
    });
  },
  runForIt() { Sneak.start({ then: r => r.won ? this.escaped() : this.caught() }); },
  escaped() {
    const F = Game.flags, D = Game.dan, S_ = OSP(); F.escaped = true; done('escape');
    Object.assign(D, { x: S_.gateOut.x, y: S_.gateOut.y + 10, dir: 'down', ride: null }); Game.cam.x = D.x - VW / 2; Game.cam.y = D.y - VH / 2 - 10;
    headline('MYSTERY MOUSE ESCAPES SQUEAKYLAND, SEEN ON I-4 "WAVING AT TRAFFIC"', 4);
    say([['', 'Dan waddles out the gate, across the parking lot, and onto I-4.'], ['', 'Traffic is not moving. Forty cars honk. He waves at every one.'], ['TEXT: BRENDA', 'dan why is there a mouse on the news. DAN']], () => addQuest('bed', 'Lay low at the Kingdom Inn'));
  },
  caught() {
    const D = Game.dan, S_ = OSP(); Object.assign(D, { x: S_.photo.x + 30, y: S_.photo.y + 20 }); Game.cam.x = D.x - VW / 2; Game.cam.y = D.y - VH / 2 - 10;
    say([['FUN ENFORCEMENT', 'Sir. SIR. Mice do not RUN.'], ['', 'They walk Dan back to the castle. He slips away behind a churro cart.'], ['DAN', '', [['Make another run for it', () => { Game.afterTalk = () => this.runForIt(); return null; }], ['Catch your breath first', () => [['', 'Dan hides behind the cart. It is 140 degrees in the suit. (E: make a run for it)']]]]]]);
  },
  // ---------- Case 11 ----------
  calls() {
    say([['PHONE: MERLE', 'Danny! A TRIAL? In ORLANDO? I’ll bring the turkey fryer!'], ['DAN', 'Bring everybody, Merle.'], ['PHONE: MERLE', 'Darlene’s closin’ the Gulp-N-Go. First time since ’09.'],
      ['PHONE: ABUELA', 'Mijo. I heard. I am bringing pastelitos and a chancla.'], ['PHONE: TAMMY JO', 'The whole pit crew’s comin’, sugar. Tiny cried.'], ['PHONE: OLD GUS', 'Tarpon can feed themselves one day. I’m comin’, son.'],
      ['TEXT: KAYDEN', 'bro im livestreaming the whole trial. chat is SO ready'], ['TEXT: MERLE', 'bus left. gary has his own seat. manny is in a kiddie pool in the aisle'],
      ['', 'An hour later.'], ['TEXT: MERLE', 'bus is stuck on I-4. we have not moved. rhonda is yelling at a cone']],
    () => { done('calls'); addQuest('i4', 'Ride the cooler to the I-4 on-ramp (east)'); hint('i4', 'The cooler’s parked by the Kingdom Inn. Ride it east to the I-4 on-ramp', 6); });
  },
  i4Run() { const D = Game.dan; Game.cooler.x = D.x; Game.cooler.y = D.y; Bridge.start(res => this.i4Done(res), { skin: 'i4' }); },
  i4Done(res) {
    const F = Game.flags, S_ = OSP(), D = Game.dan, first = !F.i4Done; F.i4Done = true;
    Object.assign(D, { x: S_.arrive.x + 22, y: S_.arrive.y + 30, dir: 'down', ride: 'cooler' }); Object.assign(Game.cooler, { x: D.x, y: D.y, dir: 'down' }); Game.cam.x = D.x - VW / 2; Game.cam.y = D.y - VH / 2 - 10;
    if (first) headline(res.hits >= 3 ? 'FLORIDA MAN DRIVES MOTORIZED COOLER DOWN I-4 SHOULDER, HITS "A FEW" CONES' : 'FLORIDA MAN RIDES MOTORIZED COOLER DOWN I-4 TO RESCUE STRANDED GREYHOUND; TRAFFIC "STILL NOT MOVING"', 5);
    if (qOpen('i4')) return this.gangArrives();
    toast(`I-4 in ${res.secs.toFixed(1)}s. ${res.hits ? `${res.hits} cones.` : 'Not one cone.'} Traffic did not move the whole time.`, 3.5);
  },
  gangArrives() {
    const F = Game.flags, S_ = OSP(), ax = S_.arrive.x, ay = S_.arrive.y; F.gangHere = true; done('i4');
    GANG.forEach(([id, name, spr], i) => { if (!oWho(id)) Game.npcs.push(makeNPC(id, name, ax - 60 + i * 13, ay - 4 + (i % 2) * 6, 'down', { sprite: spr })); });
    const ape = makeCritter('skunkape', ax - 80, ay + 6, { ape: true, state: 'den' }); Game.animals.push(ape);
    Scene.play([
      SC.cam(ax - 20, ay - 10, 1.3, .8), SC.line('o_merle', 'DANNY!', 1.1), SC.line('o_darlene', 'I closed the Gulp-N-Go for this, Dan.', 1.6), SC.line('o_rhonda', 'I’m off duty. Don’t test it.', 1.4),
      SC.line('o_kayden', 'CHAT. CHAT. IT’S HIM.', 1.3), SC.line(ape, 'HRRRM.', 1), SC.emote('dan', '♥', .8, PAL.hat), SC.line('brenda', 'Dan.', 1.2),
      SC.say([['DAN', '...Brenda? You’re REAL?'], ['BRENDA', 'Eleven cases. Nine thousand phone calls. Hi.'], ['DAN', 'You’re taller than your voice.'], ['BRENDA', 'That doesn’t mean anything, Dan.']]),
      SC.all(GANG.map(([id], i) => SC.walk(id, GANG[i][3][0] * TS, GANG[i][3][1] * TS, 80))), SC.fx(() => { ape.x = 4.8 * TS; ape.y = 45.4 * TS; }),
    ], () => {
      for (const [id, , , [tx, ty]] of GANG) { const n = oWho(id); if (n) Object.assign(n, { x: tx * TS, y: ty * TS, hx: tx * TS, hy: ty * TS, moving: false, dir: 'down' }); }   // a skipped scene leaves them mid-walk
      ape.x = 4.8 * TS; ape.y = 45.4 * TS;
      headline('ENTIRE CAST OF FLORIDA MAN’S LIFE PILES OFF ONE GREYHOUND ON I-4; DRIVER "NEEDS A MINUTE"', 3);
      addQuest('fishfry', 'Catch 3 fish for Merle (0/3, Lake Lola)'); toast('The whole gang checks into the Kingdom Inn. Manny takes the pool.', 3.5);
    });
  },
  fishFry() {
    const F = Game.flags, m = oWho('o_merle'); let k = 0; Game.catchBag = Game.catchBag.filter(f => f.junk || ++k > 3); Game.inv.fish = oFish();
    const fx = m.x + 14, fy = m.y - 4;
    Scene.play([
      SC.fx(() => { Game.hour = Math.max(Game.hour, 18.6); }), SC.cam(m.x - 30, m.y, 1.4, .9), SC.line('o_merle', 'Three fish, Danny. Just like old times.', 1.6), SC.sound('splash'),
      SC.fx(() => { for (let i = 0; i < 30; i++) Game.parts.push({ kind: 'fire', x: fx + rnd(-6, 6), y: fy - rnd(0, 30), vx: rnd(-10, 10), vy: rnd(-40, -10), life: rnd(.6, 1.8) }); }), SC.sound('boom'), SC.shake(6), SC.flash(.4),
      SC.all([SC.emote('o_rhonda', '!', 1, PAL.red), SC.emote('o_darlene', '!', 1, PAL.red), SC.emote('dan', '!', 1, PAL.red)]), SC.line('o_rhonda', '...I’m not even gonna write it down.', 1.6), SC.react('cheer'),
      SC.say([['', 'The fryer goes WHOOSH. A palm tree catches fire. Just a little. Just like day one.'], ['DARLENE', 'First fish fry you ever didn’t burn a DOCK down, Merle.'], ['ABUELA', 'Needs salt.'], ['OLD GUS', 'Best fish I ever had in a motel parking lot.'],
        ['DAN', '...Y’all came all this way. For me.'], ['MERLE', 'Course we did, Danny. You’d do it for us. You DID do it for us. Like eleven times.'], ['', 'Gary hands Dan a Swamp Lite. Nobody says anything for a while. It’s nice.']]),
    ], () => { F.fishFry = true; done('fishfry'); giveItem('beer', 1, true); headline('FLORIDA MAN HOSTS FISH FRY AT MOTEL POOL; PALM TREE "MOSTLY FINE"', 5); addQuest('bed', 'Big day tomorrow. Sleep at the Kingdom Inn'); });
  },
  coaster() { Coaster.start({ then: r => this.coasterDone(r) }); },
  coasterDone(r) {
    const F = Game.flags, c = this.c();
    if (r.barf) return say([['RIDE OPERATOR', pick(['Sir. SIR. The photo is... it’s mostly barf. Ride again? Line’s only two hours.', 'You barfed on the big drop. You and everyone behind you. Again?'])], ['', 'Tip: HOLD E on the drops. And maybe fewer beers first.']]);
    if (c.n === 11 && c.d === 2 && qOpen('coaster')) {
      F.ridePhoto = true; done('coaster'); const ch = oWho('cheddarton'); if (ch) ch.hidden = true;
      headline('SQUEAKY CORP CEO PHOTOGRAPHED SHOTGUNNING BEER ON ROLLER COASTER, SHIRTLESS, BEHIND FLORIDA MAN', 6);
      return say([['', 'The ride photo prints. Row one: Dan, thumbs up. Row two: the CEO of Squeaky Corp.'], ['', 'He is shotgunning a Swamp Lite on the big drop. Shirt off. Screaming “FLORIDA!”'],
        ['DAN', '...Brenda’s gonna LOVE this.'], ['PHOTO BOOTH', 'That’s $29.99 for the photo, sir.'], ['DAN', 'Worth every penny.']], () => { Game.money = Math.max(0, Game.money - 30); });
    }
    toast(pick(['Ride photo: Dan, thumbs up, eyes closed. Row two: a CEO screaming. $29.99.', 'Space Squeak Mountain: survived. Dan buys the photo. And a keychain of the photo.']), 3.5);
    if (F.coasterRides === 3) headline('FLORIDA MAN RIDES SPACE SQUEAK MOUNTAIN THREE TIMES IN A ROW, "STILL GOT IT DOWN"', 2);
  },
  memo() { say([['', Game.flags.memoTry ? 'Back in the suit. Back over the wall.' : 'Dan digs the mouse suit out of the motel closet. Nobody ever asked for it back.'], ['DAN', '(muffled) Mouse stuff.']], () => { Game.flags.memoTry = true; Sneak.start({ night: true, then: r => this.memoDone(r) }); }); },
  memoDone(r) {
    const F = Game.flags, D = Game.dan, S_ = OSP();
    if (!r.won) return say([['FUN ENFORCEMENT', 'Sir, the park is CLOSED. Why are you in a trash can.'], ['', 'Dan waits in the trash can till they leave. It’s a nice trash can. Try again?']]);
    F.memo = true; done('memo'); Object.assign(D, { x: S_.gateOut.x, y: S_.gateOut.y + 10, dir: 'down' }); Game.cam.x = D.x - VW / 2; Game.cam.y = D.y - VH / 2 - 10;
    headline('FLORIDA MAN BREAKS INTO THEME PARK CASTLE AT NIGHT, TAKES ONE (1) MEMO AND ONE (1) CHURRO', 5);
    say([['', 'Squeaky HQ. A safe behind a painting of the mouse. Code: 1-2-3-4. Kyle was right.'], ['', 'A memo: “FLORIDA MAN ACT, DRAFT 9. By Squeaky Corp Legal. Do NOT let Tallahassee see.”'],
      ['DAN', 'They WROTE the law. The mouse wrote the LAW.'], ['', 'Also in the safe: forty churros. Dan takes one. For the road.']], () => addQuest('bed', 'Sleep at the Kingdom Inn. Big day.'));
  },
  // ---------- people ----------
  talk(n) {
    const c = this.c(), F = Game.flags, gt = F.gangTalk = F.gangTalk || {}, hang = id => { if (c.n === 11 && c.d === 2) gt[id] = 1; };
    switch (n.id) {
      case 'chad':
        if (c.n === 10 && c.d === 1 && qOpen('timeshare')) return say([['CHAD', 'DAN! Buddy! Pal! Sit, sit, have a warm water. You’re gonna LOVE this.'], ['CHAD', 'Ninety minutes. Stay awake, you get two SqueakyLand passes. Fall asleep...'],
          ['CHAD', '...you own a condo in Kissimmee. The seventh week of February. Forever.', [['“Let’s do this.”', () => { Game.afterTalk = () => this.stayAwake(() => this.gotTickets(), () => say([['CHAD', 'You fell asleep, buddy. You signed. I tore it up. I’m not a MONSTER.'], ['CHAD', 'From slide one?']])); return null; }], ['“Gimme a minute.”', () => [['CHAD', 'Take your time! Don’t. The slideshow is warming up.']]]]]]), true;
        if (c.n === 10 && c.d === 2 && qOpen('kyle') && !F.kyleTip) { F.kyleTip = true; questText('kyle', 'Find Kyle at the Big Orange (west)'); return say([['CHAD', 'Kyle? Big Orange juice stand. He came in asking about “jobs with no head.”'], ['CHAD', 'Also: you want a condo? No? Worth a shot.']]), true; }
        return say([['CHAD', pick(['Dan! Ninety more minutes? I have NEW slides.', 'The condo’s still available. It’s always available. That’s the problem.', 'I sold eleven timeshares today. To the same guy.'])]]), true;
      case 'squeaky':
        if (c.n === 10 && c.d === 1 && qOpen('squeaky')) return this.incident(n), true;
        return say([['MR. SQUEAKY', pick(['*waves silently*', '*does a little dance*', '*points at your beer, shakes his head slowly*', '*mimes a lawsuit*'])]]), true;
      case 'kyle':
        if (c.n === 10 && c.d === 2 && qOpen('kyle')) {
          if (!Q('oranges')) { addQuest('oranges', 'Punch orange trees for Kyle (0/6)', false, 'kyle'); hint('punch', `Trees respect punches. ${K('punch')} next to an orange tree`, 6);
            return say([['KYLE', 'Oh no. It’s you. The beer mouse.'], ['DAN', 'Kyle. I need you in court. Tell ’em you GAVE me the suit.'], ['KYLE', 'Squeaky Corp says if I testify I’ll never work in Orlando again.'],
              ['KYLE', 'And I NEED this job. Juice. No head. Sunlight. But I’m behind.'], ['KYLE', 'Six oranges from the grove. I can’t reach. Punch ’em loose? Gently. Or not.']]), true; }
          if ((Game.inv.orange || 0) >= 6) { Game.inv.orange -= 6; F.kyleIn = true; done('oranges'); done('kyle'); headline('FORMER MOUSE FINDS PEACE AT GIANT ORANGE; "I CAN SEE THE SKY"', 3); this.day2Check();
            return say([['KYLE', 'Six! The boss is gonna cry. I’m gonna cry. I’m crying.'], ['KYLE', 'I’ll testify. I gave you the suit. Freely. Joyfully. In my underwear.'], ['DAN', 'That’s all we need, buddy.']]), true; }
          return say([['KYLE', `Six oranges, man. You’ve got ${Game.inv.orange || 0}. The trees are right there. Punch ’em.`]]), true;
        }
        return say([['KYLE', pick(['I can see the SKY, Dan. Every day. It’s so big.', 'Fresh squeezed. No head. Best job I ever had.', 'Sometimes I still hear the parade music in my sleep.'])]]), true;
      case 'deb':
        if (c.n === 10 && c.d === 2 && qOpen('video')) { if (!F.chompsOut) this.chompsOut(); return say([['WRANGLER DEB', 'The Ohio dad? Todd? He’s by the pond, crying. Sir Chomps ate his phone.'], ['WRANGLER DEB', 'Chomps’ll cough it up if somebody wrestles him. Nobody wrestles him.'], ['DAN', 'Say no more.']]), true; }
        return say([['WRANGLER DEB', pick(['Gator Jamboree! Forty gators, one emu, zero refunds.', 'Sir Chomps is fourteen feet of attitude. He likes you. That’s bad.', 'I’ve been bit nine times. Florida record’s eleven. I’m close.'])]]), true;
      case 'todd':
        if (c.n === 10 && c.d === 2 && qOpen('video')) { if (!F.chompsOut) this.chompsOut(); return say([['TODD', 'You’re the MOUSE GUY! I filmed the whole thing! Four million views!'], ['TODD', 'Then I dropped my phone in the gator pond. Sir Chomps ate it. Whole.'], ['DAN', 'I’ll get it back, Todd.'], ['TODD', 'From the GATOR?']]), true; }
        return say([['TODD', pick(['We drove from Columbus. Nineteen hours. The kids hate me.', 'Four hundred videos of the castle and one of you. Guess which one went viral.', 'Is it always this hot? It’s MARCH.'])]]), true;
      case 'pembrook': return say([['MR. PEMBROOK', pick(['Squeak, Squeak & Partners. I bill in six-minute increments. This is one.', 'The mouse doesn’t sue. The mouse ENFORCES.', 'Please stop calling me “the rat lawyer.”'])]]), true;
      case 'cheddarton': return say([['CHEDDARTON', pick(['Squeaky Corp NEVER loses, Mr. Dupree.', 'Do you know what the Magic costs? $139. Plus parking.', 'I ride Space Squeak Mountain every morning. It keeps me YOUNG.'])]]), true;
      case 'enforcer': return say([['FUN ENFORCEMENT', pick(['Sir, please enjoy the park at a normal walking speed.', 'No coolers past the gate. Especially ones with headlights.', 'Have a MAGICAL day. That’s an order.'])]]), true;
      case 'larry': return say([['LAVA LARRY', pick(['Volcano Golf! It erupts on the hour. It’s a propane tank. Don’t tell the kids.', 'Hole 18 goes INTO the volcano. Nobody’s ever made par.', 'Ducks. It’s always ducks.'])]]), true;
      case 'gloria': return say([['GLORIA', pick(['Giant Discount Souvenir World. Everything’s 70% off. It has been since 1994.', 'Mouse ears! Legally distinct! He’s grey!', 'Turkey legs. Don’t ask what bird.']), [['Browse', () => { Game.mode = 'shop'; openShop('souvenir'); return null; }], ['“Just looking.”', () => null]]]]), true;
      case 'dolores': return say([['DOLORES', pick(['Sunset Acres. Fifty-five and up. We have three pickleball courts and eleven feuds.', 'Dinner’s at 4:30, dear. After that we’re feral.', 'My golf cart does 19 miles an hour. Illegally.'])]]), true;
      case 'brenda':
        hang('brenda'); return say([['BRENDA', c.n === 11 && c.d === 3 ? 'Court’s at ten. You look nervous, Dan. Good. That means you care.' : pick(['I read every headline, Dan. Every one. I have a binder. It’s four binders.', 'You know what? In person, you’re... exactly what I pictured.', 'Nine years of public defending. Eleven of them were you.'])]]), true;
      case 'o_merle':
        if (c.n === 11 && c.d === 1 && qOpen('fishfry')) return oFish() >= 3 ? (this.fishFry(), true) : (say([['MERLE', `Three fish, Danny. You got ${oFish()}. Lake Lola’s full of ’em. So’s the gator pond, but, y’know. Gators.`]]), true);
        hang('o_merle'); return say([['MERLE', pick(['Remember day one, Danny? The fish fry? You burned the dock down.', 'Orlando’s got nothin’ on the swamp. ’Cept air conditioning.', 'Chuck’s comin’ separate. He don’t do buses.'])]]), true;
      case 'o_darlene': hang('o_darlene'); return say([['DARLENE', pick(['Eleven years. One Swamp Lite, one scratch-off. Every morning. You never won once.', 'I brought roller dogs. From home. They’ve been spinnin’ since Tuesday.'])], ['DARLENE', 'You never once stopped smiling, Dan. That’s gotta count for somethin’.']]), true;
      case 'o_rhonda': hang('o_rhonda'); return say([['RHONDA', pick(['I’m off duty. I brought the citation book anyway. Habit.', 'Nine arrests. You were polite every time. Weird, but polite.'])], ['RHONDA', '...You’re a good man, Dan. Tell anybody I said that and I’ll deny it.']]), true;
      case 'o_kayden': hang('o_kayden'); return say([['KAYDEN', pick(['BRO. Two million people on the stream. Chat says you GOT this.', 'Bro I’ve made so much money off you. Like, thank you. Genuinely.'])]]), true;
      case 'o_abuela': hang('o_abuela'); giveItem('pastelito', 1, true); return say([['ABUELA', 'Mijo. Eat. You look thin. You look like a man on trial.'], ['', 'Abuela hands Dan a pastelito. She has forty more in her purse.']]), true;
      case 'o_tammy': hang('o_tammy'); return say([['TAMMY JO', pick(['Pit crew’s here, sugar. Tiny drove the hauler. It’s still on I-4.', 'Win this one like you won the 250. Stupid and fast.'])]]), true;
      case 'o_gus': hang('o_gus'); return say([['OLD GUS', pick(['I brought the bell, son. From the wreck. For luck.', 'Forty years nobody believed me. Then you did. Now I believe in you.'])]]), true;
      case 'o_pam': hang('o_pam'); return say([['DR. PAM', pick(['Manny insisted on the pool. He says the chlorine is “bracing.”', 'You’re still surprisingly gentle with sea cows, Dan. I checked.'])]]), true;
    }
    return false;
  },
  gotTickets() {
    Game.flags.tickets = true; done('timeshare'); addQuest('park', 'Use the free passes at the SqueakyLand gate');
    headline('FLORIDA MAN SURVIVES 90-MINUTE TIMESHARE PITCH, SIGNS NOTHING; SALESMAN "IN THERAPY"', 3);
    say([['CHAD', '...Ninety minutes. You didn’t sign. NOBODY doesn’t sign.'], ['CHAD', 'Here. Two passes. Go. Please. I need to sit in my car and think.']]);
  },
  chompsOut() {
    const F = Game.flags, S_ = OSP(); F.chompsOut = true; questText('video', 'Wrestle Sir Chomps for Todd’s phone');
    const a = makeGator(S_.gators.x - 6, S_.gators.y + 18, false); Object.assign(a, { chomps: true, lurk: false, cd: 3, hx: S_.gators.x - 6, hy: S_.gators.y + 26, win: () => this.chompsWon(a) }); Game.animals.push(a);
  },
  chompsWon(a) {
    const F = Game.flags; a.stun = 10; a.state = 'flee'; a.timer = 12; a.cd = 12; a.belly = 1.8; a.chomps = false; a.win = null; F.phoneGot = true; done('video'); this.day2Check();
    headline('FLORIDA MAN WRESTLES GATOR NAMED "SIR CHOMPS" TO GET OHIO DAD’S PHONE BACK', 6);
    say([['', 'Sir Chomps coughs up an iPhone. 4% battery. The video is still on it.'], ['TODD', 'MY PHONE! Take the video. Take all of it. The lawyers can have it.'], ['TODD', 'You wanna see the other 400? They’re all the castle.']]);
  },
  day2Check() { const F = Game.flags; if (F.kyleIn && F.phoneGot) addQuest('bed', 'Court’s tomorrow. Sleep at the Kingdom Inn'); },
  interactions() {
    const D = Game.dan, S_ = OSP(), list = [], near = (p, r) => p && Math.hypot(D.x - p.x, D.y - p.y) < r, c = this.c(), F = Game.flags, park = inPark(D.x, D.y);
    if (D.ride) return list;
    if (c.n === 10 && c.d === 1 && qOpen('escape') && park) list.push({ label: 'MAKE A RUN FOR IT (in the suit)', fn: () => this.runForIt() });
    if (near(S_.phone, 20)) list.push(c.n === 11 && c.d === 1 && qOpen('calls') ? { label: 'Call in your witnesses (payphone)', fn: () => this.calls() } : { label: 'Use the payphone', fn: () => toast(pick(['It takes quarters. Dan has a bottle cap and a dream.', 'Dan calls his own number. It goes to voicemail. It’s full of Brenda.']), 3) });
    if (park && near(S_.coaster, 26)) list.push({ label: 'Ride Space Squeak Mountain', fn: () => this.coaster() });
    if (c.n === 11 && c.d === 2 && qOpen('memo')) {
      if (near(S_.gateOut, 26) && !park && Game.hour >= 20) list.push({ label: 'Sneak into SqueakyLand after hours', fn: () => this.memo() });
      if (park && near(S_.castle, 30)) list.push({ label: 'Squeaky HQ (locked till after dark)', fn: () => toast('The castle door says CAST ONLY. A guard is eating a turkey leg in front of it. Come back after dark.', 3.5) });
      if (near(S_.door, 22) && Game.hour < 20) list.push({ label: 'Wait for dark with the gang', fn: () => { Game.hour = 20.1; toast('Everyone sits by the pool. Gary tries the hot tub. The hot tub does not survive. It’s dark.', 4); } });
    }
    for (const a of Game.animals) if (a.ape && near(a, 30)) list.push({ label: 'Hang out with Gary', fn: () => { const gt = F.gangTalk = F.gangTalk || {}; if (c.n === 11 && c.d === 2) gt.gary = 1; giveItem('beer', 1, true);
      say([['SKUNK APE', pick(['HRRRM.', 'HRRM HRM.', '*offers Dan half a churro*'])], ['', pick(['Gary hands Dan a Swamp Lite. They watch the traffic on I-4 not move.', 'Gary is wearing a SqueakyLand poncho. He looks happy. It’s hard to tell.'])]]); } });
    return list;
  },
  target(q) {
    const S_ = OSP(), F = Game.flags, D = Game.dan, park = inPark(D.x, D.y);
    switch (q.id) {
      case 'bus10': return ORLANDO() ? null : World.spots.stationDoor || null;
      case 'timeshare': return oWho('chad');
      case 'park': return park ? null : S_.gateOut;
      case 'squeaky': return park ? oWho('squeaky') : S_.gateOut;
      case 'escape': return park ? S_.gateIn : null;
      case 'kyle': return F.kyleTip || Q('oranges') ? oWho('kyle') : oWho('chad');
      case 'oranges': return (Game.inv.orange || 0) >= 6 ? oWho('kyle') : Game.pickups.find(p => p.kind === 'orange') || S_.grove;
      case 'video': return Game.animals.find(a => a.chomps) || oWho('todd') || oWho('deb');
      case 'calls': return S_.phone;
      case 'i4': return D.ride === 'cooler' ? S_.onramp : Game.cooler;
      case 'fishfry': return oFish() >= 3 ? oWho('o_merle') : S_.lola;
      case 'coaster': return park ? S_.coaster : S_.gateOut;
      case 'memo': return Game.hour < 20 ? S_.door : park ? S_.castle : S_.gateOut;
      case 'gang': { const gt = F.gangTalk || {}; return Game.npcs.find(n => GANG.some(g_ => g_[0] === n.id) && !gt[n.id]) || null; }
    }
    return undefined;
  },
};

// ---------- Orange County trials ----------
CLEAN_LIMIT[10] = 9; CLEAN_LIMIT[11] = 9;
CREDITS[10] = ['WHIMSY LICENSED', 'Kyle juices oranges now. He can see the sky.<br>Todd’s video hit six million views. The castle videos did not.<br>Dan has a $25 whimsy license. It’s laminated.', 'Next case'];
CREDITS[11] = ['THE END', 'Eleven cases. Five counties. One sash, one sister nation, one whimsy license.<br>Daniel Wayne Dupree: a Florida Man. He said so himself. In open court.<br><br>The swamp, Miami, Daytona, the Keys and Orlando are all yours. Forever.', 'Keep being Dan',
  'Starring Dan, Brenda (in person), Merle, Darlene, Deputy Rhonda, Kayden, Dr. Pam, Kevin, Abuela, Tammy Jo, Old Gus, Kyle, Trash Baby, Manny, Gary the Skunk Ape, and Chuck as himself.'];
const OrlandoCourt = {
  whimsy() {
    CourtCases.begin(); const F = Game.flags; Game.courtExtra.ceo = true;
    say([['BAILIFF', 'All rise for the Honorable Judge Beverly Blossom.'], ['JUDGE BLOSSOM', 'Squeaky Corporation versus Daniel Wayne Dupree. My, what a crowd.'], ...CourtCases.clean(10),
      ['JUDGE BLOSSOM', 'Grand Theft Mouse. Mascot Impersonation. And Unlicensed Whimsy.'], ['MR. PEMBROOK', 'Your Honor, Squeaky Corp will prove this man stole a MOUSE.'], ['BRENDA', '(whispering) Lies only, Dan. You’ve done this TEN times.']],
    () => { Objection.speaker = 'MR. PEMBROOK'; Objection.run([
      { text: 'The defendant wore the Mr. Squeaky suit inside SqueakyLand.', lie: false, over: 'He did. There are 900 photos. He’s doing a thumbs-up in all of them.' },
      { text: 'The defendant attacked Mr. Squeaky and tore his head off.', lie: true, bust: 'He HUGGED him. Too hard. The head came off on its own.' },
      { text: 'The suit was stolen from a Squeaky Corp employee.', lie: !!F.kyleIn, bust: 'The employee GAVE it to him, then left in his underwear. Kyle is here. Hi, Kyle.', over: 'Nobody can find the employee. Very convenient for the mouse.' },
      { text: 'The defendant drank a beer in front of 300 children.', lie: false, over: 'One beer. Four seconds. The children were, frankly, impressed.' },
      { text: 'Mr. Squeaky has never once taken his head off in public.', lie: !!F.phoneGot, bust: 'Todd’s video, minute two. The head pops off and a man named Kyle says “thank GOD.”', over: 'No footage says otherwise. The mouse’s record stands.' },
    ], () => this.whimsyEnd()); });
  },
  whimsyEnd() {
    const F = Game.flags;
    say([['BRENDA', F.kyleIn ? 'The defense calls Kyle. Formerly Mr. Squeaky.' : 'The defense calls... nobody. Kyle is at a juice stand.'], ...(F.kyleIn ? [['KYLE', 'I gave him the suit. Best day of my life. I saw the SUN, Your Honor.']] : []),
      ['MR. PEMBROOK', 'Squeaky Corp’s CEO would like to address the court.'], ['', 'A man in a mouse-ear tie stands. Wendell Cheddarton. He smells like money and churros.'],
      ['CHEDDARTON', 'That man ruined the Magic. The children saw Mr. Squeaky DRINK.'], ['DAN', 'Kids see their dads drink every Saturday, man.'],
      ['', '*CRASH*'], ['', 'The doors burst open. It’s Chuck. He took I-4. He is wearing mouse ears.'], ['JUDGE BLOSSOM', 'Is that— are those EARS?'], ['DAN', 'That’s Chuck. He comes to all my trials. He got the ears at the outlet.'],
      ['', 'Chuck eats Mr. Pembrook’s briefcase. Mr. Pembrook withdraws two charges.'], ['JUDGE BLOSSOM', 'The suit was a gift. The head came off by itself. Not guilty of theft or impersonation.'],
      ['JUDGE BLOSSOM', 'Unlicensed Whimsy... Mr. Dupree, you owe the county one $25 whimsy license.'], ['DAN', 'I’m still not a Florida Man.'], ['BRENDA', 'You got sued by a MOUSE, Dan.'],
      ['CHEDDARTON', '(on the steps) Squeaky Corp never loses, Mr. Dupree. I have friends in Tallahassee.'], ['CHEDDARTON', 'You’ll be hearing from us. And our mouse.']],
    () => { Game.money = Math.max(0, Game.money - 25); headline('JUDGE: FLORIDA MAN "NOT A MOUSE THIEF," MUST BUY $25 WHIMSY LICENSE; GATOR IN EARS EATS BRIEFCASE', 10); F.case10Won = true; F.creditsPending = 10; endDay('court'); });
  },
  finale() {
    CourtCases.begin(); const F = Game.flags, E = Game.courtExtra; E.panel = true; E.ceo = true; E.gang = !!F.gangHere; Game.courtJudge = 'JUDGE HARLAN';
    say([['BAILIFF', 'All rise. For the first time in Florida history: a five-judge panel.'], ['', 'In walk Judge Harlan, Judge Vega, Judge Pettibone, Judge Pinder and Judge Blossom.'],
      ['JUDGE HARLAN', 'Mr. Dupree. Eleven cases. Five counties. We ALL asked to be here.'], ['JUDGE PINDER', 'I brought the rooster. He’s in the gallery. He has seniority.'], ...CourtCases.clean(11),
      ['JUDGE HARLAN', 'In re: Daniel Wayne Dupree. A petition under the Florida Man Act.'], ['JUDGE HARLAN', 'The question is simple. Is the respondent... a Florida Man?'],
      ['MR. PEMBROOK', 'Your Honors, Squeaky Corp will now read the respondent’s headlines. All of them.'], ['BRENDA', '(whispering) Last time, Dan. Lies only. Make it count.']],
    () => { Objection.speaker = 'MR. PEMBROOK'; Objection.run([
      { text: 'The respondent once wrestled an alligator in open court.', lie: false, over: 'He did. In MY courtroom. I kept the alligator.' },
      { text: 'The respondent rode a manatee through a hurricane.', lie: false, over: 'Forty million views. The manatee testified. Very persuasive manatee.' },
      { text: 'The respondent personally ran the Sinus Cartel.', lie: true, bust: 'A PELICAN ran the Sinus Cartel. Señor Pelícano. He’s doing ten to twenty.' },
      { text: 'Squeaky Corp had nothing to do with the Florida Man Act.', lie: !!F.memo, bust: 'Exhibit M: the memo. “Draft 9. By Squeaky Corp Legal.” From their own safe.', over: 'Nobody can prove otherwise. The mouse is very careful.' },
      { text: 'No respectable Floridian acts like the respondent.', lie: !!F.ridePhoto, bust: 'Exhibit P: your CEO. Shirtless. Shotgunning a beer on Space Squeak Mountain.', over: 'The court has no evidence to the contrary. Sadly.' },
      { text: 'Nobody in this state would vouch for the respondent.', lie: !!F.gangHere, bust: 'Counselor. Turn around.', over: 'The gallery is... empty. That’s rough, son.' },
    ], () => this.finaleEnd()); });
  },
  finaleEnd() {
    const F = Game.flags, E = Game.courtExtra, gang = !!F.gangHere;
    say([['BRENDA', gang ? 'The defense calls... everybody.' : 'The defense calls Daniel Dupree. That’s it. That’s the list.'], ...(gang ? [['', 'The doors open. They just keep coming in.'],
      ['MERLE', 'Merle Dupree. Cousin. He fixed my roof in a hurricane. With a stop sign.'], ['DARLENE', 'Eleven years he’s bought a Swamp Lite and asked about my kids. Every day.'],
      ['RHONDA', 'I’ve arrested him nine times. He’s never once been mean to me.'], ['ABUELA', 'He returned the cartel’s medicine. With a flyer. He is an idiot. He is MY idiot.'],
      ['TAMMY JO', 'He won the Daytona 250 and gave the trophy to the pit crew.'], ['OLD GUS', 'Forty years nobody believed me. He did.'],
      ['SKUNK APE', 'HRRRM. HRM HRRRRM.'], ['BRENDA', 'Gary says “he shares his beer.”'], ['', 'From the kiddie pool in the aisle, a manatee says “Daaaniel.” Everyone hears it.']] : []),
      ['CHEDDARTON', 'OBJECTION! Friends are NOT evidence!'], ['', '*CRASH*'], ['', 'The doors explode inward. It’s Chuck. Of course it’s Chuck. Tiny tie. Mouse ears.'],
      ['JUDGE HARLAN', '...Hey, Chuck.'], ['JUDGE PINDER', 'Chuck.'], ['JUDGE BLOSSOM', 'Hi, Chuck.'], ['', 'Chuck walks over to Cheddarton, sits on him, and stays there. Nobody moves him.'],
      ['JUDGE HARLAN', 'Mr. Dupree. Eleven cases ago you stood in my courtroom and I asked for your plea.'], ['JUDGE HARLAN', 'You said being a Florida Man was a lifestyle. I said that wasn’t a plea.'],
      ['JUDGE HARLAN', 'I was right. It isn’t a plea. It isn’t a crime, either.'], ['JUDGE HARLAN', 'The Florida Man Act is struck down. The petition is DENIED. The cooler stays.'],
      ['JUDGE HARLAN', 'One more question, son. For the record. For all of us.'], ['JUDGE HARLAN', 'Are you a Florida Man?', [
        ['“I am NOT a Florida Man.”', () => [['', 'The whole gallery, all at once:'], ['EVERYBODY', 'YES YOU ARE!'], ['DAN', '...Yeah. Yeah, I am.'], ['DAN', 'I’m a Florida Man. And these are my Florida people.'], ['BRENDA', 'Eleven cases, Dan. You finally said it.']]],
        ['“...Yeah. I am.”', () => [['DAN', 'I fight gators. I ride manatees. I lose my pants. A lot.'], ['DAN', 'And every time I fell in the swamp, somebody in this room pulled me out.'], ['DAN', 'So yeah. Florida Man. Proud of it.'], ['BRENDA', 'Eleven cases, Dan. You finally said it.']]],
        ['Crack a Swamp Lite', () => { Sound.play('crack'); return [['', '*crack*'], ['JUDGE HARLAN', '...Is that a Swamp Lite?'], ['DAN', 'Want one?'], ['JUDGE HARLAN', 'Eleven cases ago I said “after.” ...Yeah. Now.'], ['', 'Four hundred cans open at once. Five judges. One gator. Brenda.'], ['BRENDA', 'Dan. You didn’t even answer the question.'], ['DAN', 'That WAS the answer, Brenda.']]; }]]],
      ['', 'Brenda hugs Dan. Chuck hugs Dan. Gary hugs everyone. Rhonda allows it.'],
      ['JUDGE HARLAN', 'Court is adjourned. Forever. Somebody get the alligator a lawyer.']],
    () => { E.hug = true; headline('FLORIDA MAN ACT STRUCK DOWN; FLORIDA MAN ADMITS HE IS "A FLORIDA MAN" IN OPEN COURT; ALLIGATOR SITS ON CEO', 15); this.parade(); });
  },
  parade() {
    Game.scene = 'finale'; Game.mode = 'court';
    say([['', 'THAT NIGHT. SQUEAKYLAND. They’ve never let a Florida Man lead the parade. Until now.'], ['KYLE', '(back in the suit, by choice, one night only) Ladies and gentlemen... FLORIDA MAN!'],
      ['', 'Merle waves the turkey fryer. Manny waves a flipper. Trash Baby steals a churro.'], ['BRENDA', 'So. What now?'],
      ['DAN', 'The swamp. Miami. Daytona. The Keys. Orlando. It’s all ours, Brenda.'], ['DAN', 'Wanna get a Swamp Lite?'], ['BRENDA', '...Yeah. Yeah, I do.']],
    () => { headline('FLORIDA MAN LEADS SQUEAKYLAND PARADE ON GIANT COOLER FLOAT; MOUSE "FINE WITH IT, HONESTLY"', 6); Game.flags.case11Won = true; Game.flags.theEnd = true; Game.flags.creditsPending = 11; endDay('court'); });
  },
};
// the court, Orlando style: the five-judge panel, the CEO's table, the whole gang in the gallery, Chuck in ears
function drawOrlandoCourt(E, t) {
  if (E.panel) {
    R(52, 0, 216, 18, '#6b4a2e'); for (let x = 60; x < 268; x += 20) R(x, 0, 1, 18, '#5a3d25');   // five judges don't fit under the motto
    OR(56, 18, 208, 34, PAL.woodD); R(56, 18, 208, 4, PAL.woodL); OR(148, 23, 24, 11, PAL.yellow); OR(152, 25, 16, 7, PAL.blue);
    [['judge', 'HARLAN'], ['vega', 'VEGA'], ['pettibone', 'PETTIBONE'], ['pinder', 'PINDER'], ['blossom', 'BLOSSOM']].forEach(([s, nm], i) => { const x = 72 + i * 40; g.drawImage(SPR[s].down[0], 0, 0, 16, 18, x, 2, 16, 18); label(nm, x + 8, i % 2 ? 50 : 43, PAL.yellow, 4); });
  }
  if (E.ceo) { g.drawImage(SPR.pembrook.down[0], 244, 50); g.drawImage(SPR.cheddarton.down[0], 270, 50); if (E.hug) { OR(262, 66, 30, 9, PAL.gator); R(268, 63, 4, 3, '#3a3440'); R(280, 63, 4, 3, '#3a3440'); } }
  if (E.gang) {
    ['merle', 'darlene', 'rhonda', 'kayden', 'abuela'].forEach((s, i) => g.drawImage(SPR[s].up[0], 0, 0, 16, 14, 8 + i * 20, 158, 16, 14));
    ['tammy', 'gus', 'pam', 'kyle'].forEach((s, i) => g.drawImage(SPR[s].up[0], 0, 0, 16, 14, 222 + i * 20, 158, 16, 14));
    g.save(); g.translate(294, 118); g.scale(1.3, 1.3); g.drawImage(SPR.skunkape, 0, 0); g.restore(); label('GARY', 305, 114, PAL.yellow, 5);
    OR(106, 162, 36, 10, PAL.blue); R(108, 164, 32, 2, PAL.waterL); g.drawImage(SPR.manatee, 112, 152 + Math.sin(t * 2)); label('MANNY', 124, 150, PAL.glow, 5);
  }
  if (E.hug) { const b = Math.round(Math.abs(Math.sin(t * 6)) * 2); label('♥', 165, 112 - b, PAL.hat, 10); for (let i = 0; i < 20; i++) R((hash2(i, 1) * VW + t * 30) % VW, (hash2(i, 2) * VH + t * (40 + i)) % VH, 2, 1, [PAL.hat, PAL.yellow, PAL.teal, PAL.white][i % 4]); }
}
// the last parade: fireworks over the Cheese Castle, the whole cast on a giant cooler float with its headlights on
function drawFinale(t) {
  for (let y = 0; y < 110; y += 5) { const k = y / 110; R(0, y, VW, 5, `rgb(${Math.round(14 + 40 * k)},${Math.round(12 + 20 * k)},${Math.round(40 + 50 * k)})`); }
  for (let i = 0; i < 40; i++) R((hash2(i, 3) * VW) | 0, (hash2(i, 7) * 90) | 0, 1, 1, Math.floor(t * 2 + i) % 7 ? '#d8d4ff' : PAL.yellow);
  // the castle
  const cx = 230; OR(cx - 40, 58, 80, 52, '#3d3358'); for (const [x, w, h] of [[-46, 14, 64], [32, 14, 64], [-20, 14, 80], [8, 14, 80], [-8, 16, 96]]) { OR(cx + x, 110 - h, w, h, '#4a3f6a'); g.fillStyle = '#6a5a9a'; g.beginPath(); g.moveTo(cx + x - 2, 110 - h); g.lineTo(cx + x + w / 2, 110 - h - 16); g.lineTo(cx + x + w + 2, 110 - h); g.fill(); }
  for (let i = 0; i < 8; i++) R(cx - 36 + i * 10, 76 + (i % 2) * 14, 4, 5, '#ffe9a8'); mouseHead(cx, 2, 4, '#6a5a9a');
  // fireworks
  for (let i = 0; i < 5; i++) { const ph = (t * .45 + i * .21) % 1, bx = 40 + hash2(i, Math.floor(t * .45 + i * .21)) * 240, by = 20 + hash2(Math.floor(t * .45 + i * .21), i) * 40, col = ['#ff5ea8', '#ffd23f', '#27c6b4', '#b86bd6', '#ff8a3d'][i];
    if (ph < .25) R(bx, by + (1 - ph / .25) * 60, 1, 4, col); else { const r = (ph - .25) * 50; g.globalAlpha = Math.max(0, 1 - (ph - .25) / .75); for (let k = 0; k < 14; k++) { const a = k / 14 * 6.28; R(bx + Math.cos(a) * r, by + Math.sin(a) * r + (ph - .25) * 10, 2, 2, col); } g.globalAlpha = 1; } }
  // the street + crowd
  R(0, 110, VW, 70, '#8d7a8a'); for (let x = 0; x < VW; x += 16) R(x, 110, 1, 70, '#7d6a7a'); R(0, 110, VW, 2, '#f7c6d9');
  for (let i = 0; i < 18; i++) { const x = 4 + i * 18, bob = Math.round(Math.abs(Math.sin(t * 5 + i)) * 2); OR(x, 162 - bob, 9, 14, [PAL.hat, PAL.teal, PAL.yellow, PAL.white, PAL.orange][i % 5]); R(x + 1, 156 - bob, 7, 6, i % 3 ? PAL.skin : '#b8704f'); if (i % 4 === 0) mouseHead(x + 4, 152 - bob, 2); }
  // the float: a giant cooler, headlights blazing
  const fx = 22 + Math.sin(t * .6) * 4, fy = 96 + Math.round(Math.sin(t * 2) * 1);
  OR(fx, fy, 188, 34, PAL.white); R(fx, fy, 188, 7, PAL.red); R(fx + 6, fy + 12, 176, 2, '#e8e2d2'); R(fx + 180, fy + 14, 8, 6, PAL.yellow); R(fx + 180, fy + 24, 8, 4, PAL.yellow);
  g.globalAlpha = .25; g.fillStyle = '#fff6d0'; g.beginPath(); g.moveTo(fx + 188, fy + 16); g.lineTo(fx + 260, fy + 4); g.lineTo(fx + 260, fy + 40); g.fill(); g.globalAlpha = 1;
  label('FLORIDA MAN', fx + 94, fy + 26, PAL.red, 9);
  const cast = [['brenda', 8], ['merle', 26], ['darlene', 44], ['rhonda', 62], ['dan', 88], ['kayden', 118], ['abuela', 136], ['tammy', 154], ['gus', 172]];
  for (const [who, x] of cast) g.drawImage(SPR[who].down[Math.floor(t * 3 + x) % 2], fx + x, fy - 20 + (who === 'dan' ? Math.round(Math.sin(t * 6)) : 0));
  R(fx + 92, fy - 12, 9, 2, PAL.hat); R(fx + 93, fy - 10, 2, 5, PAL.hat);   // the old sash
  g.drawImage(SPR.squeaky.down[Math.floor(t * 4) % 2], fx + 104, fy - 21);
  g.save(); g.translate(fx - 18, fy - 22); g.scale(1.4, 1.4); g.drawImage(SPR.skunkape, 0, 0); g.restore();
  OR(fx + 40, fy + 36, 22, 6, PAL.gator); OR(fx + 60, fy + 37, 8, 4, PAL.gator); R(fx + 44, fy + 33, 3, 3, '#3a3440'); R(fx + 52, fy + 33, 3, 3, '#3a3440'); R(fx + 49, fy + 40, 2, 3, PAL.red);   // Chuck: tie + ears
  OR(fx + 120, fy + 36, 30, 8, PAL.blue); g.drawImage(SPR.manatee, fx + 124, fy + 26 + Math.sin(t * 1.5) * 2); R(fx + 160, fy + 34, 7, 5, PAL.grey); R(fx + 162, fy + 32, 3, 2, PAL.black);   // Manny + Trash Baby
  for (let i = 0; i < 50; i++) { const x = (hash2(i, 1) * VW + t * 20 * (hash2(i, 5) - .5) + VW) % VW, y = (hash2(i, 2) * VH + t * (30 + hash2(i, 3) * 40)) % VH; R(x, y, 2, 2, [PAL.hat, PAL.yellow, PAL.teal, PAL.white][i % 4]); }
}

// ---------- Orlando side gigs ----------
Object.assign(GIGS, {
  ducks: { giver: 'larry', pay: 30, quest: 'Yell 3 ducks off the Volcano Golf course',
    offer: [['LAVA LARRY', 'Three ducks. On the 18th hole. IN the volcano. Every day at noon.'], ['LAVA LARRY', 'Yell ’em off the course. Thirty bucks. They respect volume.']],
    start() { const S_ = OSP(); for (let i = 0; i < 3; i++) Game.animals.push(makeCritter('duck', S_.volcano.x - 20 + i * 20, S_.volcano.y - 8, { herd: true, gigD: true })); },
    check: () => { const S_ = OSP(), ds = Game.animals.filter(a => a.gigD); return ds.length === 3 && ds.every(d => Math.hypot(d.x - S_.volcano.x, d.y - S_.volcano.y) > 120); },
    hl: 'FLORIDA MAN CHASES DUCKS OFF VOLCANO MINI GOLF COURSE; DUCKS "BACK TOMORROW AT NOON"' },
  earlybird: { giver: 'dolores', pay: 35, quest: 'Bring Dolores 4 roller dogs (Sunset Acres)',
    offer: [['DOLORES', 'Early bird is at 4:30, dear. The kitchen “ran out of hot dogs.” Again. Suspicious.'], ['DOLORES', 'Four roller dogs. Thirty-five dollars. Don’t tell Harold.']],
    talkActive: () => (Game.inv.hotdog || 0) >= 4 ? (Game.inv.hotdog -= 4, 'done') : [['DOLORES', `Four dogs, dear. You have ${Game.inv.hotdog || 0}. The souvenir place sells them. God knows why.`]],
    hl: 'FLORIDA MAN SMUGGLES ROLLER DOGS INTO RETIREMENT COMMUNITY EARLY BIRD; BINGO "NEVER THE SAME"' },
  wrangle: { giver: 'deb', pay: 40, quest: 'Wrestle Deb’s gator out of the Sunset Acres pond',
    offer: [['WRANGLER DEB', 'One of mine got out. He’s in the Sunset Acres pond, scaring the pickleball league.'], ['WRANGLER DEB', 'Wrestle him out. Forty bucks. Don’t tell him I called him cute.']],
    start() { const S_ = OSP(), a = makeGator(S_.pond.x, S_.pond.y + 6, false); Object.assign(a, { gig: 'wrangle', lurk: false, cd: 3, hx: S_.pond.x, hy: S_.pond.y + 20 }); Game.animals.push(a); },
    hl: 'FLORIDA MAN WRESTLES ALLIGATOR OUT OF RETIREMENT COMMUNITY POND; RESIDENTS "WANTED AN ENCORE"' },
});
Object.assign(STORY_NPCS, { '10.1': ['chad', 'squeaky'], '10.2': ['chad', 'kyle', 'deb', 'todd'], '11.1': ['o_merle'], '11.2': ['cheddarton'] });
const OrlandoGigs = {
  interaction() { return null; },
  target(id) {
    const who = n => Game.npcs.find(x => x.id === n);
    if (id === 'ducks') return Game.animals.find(a => a.gigD && Math.hypot(a.x - OSP().volcano.x, a.y - OSP().volcano.y) <= 120) || null;
    if (id === 'earlybird') return (Game.inv.hotdog || 0) >= 4 ? who('dolores') : who('gloria');
    if (id === 'wrangle') return Game.animals.find(a => a.gig === 'wrangle') || null;
    return null;
  },
};

// ---------- Giant Discount Souvenir World ----------
Object.assign(ITEMS, {
  orange: { name: 'Orange', price: 0, desc: 'Fresh. Punched off a tree. For Kyle.' },
  turkeyleg: { name: 'Giant Turkey Leg', price: 8, desc: 'Huge. Smoky. Big chill. Dan holds it like a scepter.' },
});
HOTBAR.push('turkeyleg');
Object.assign(UPGRADES, {
  ears: { name: 'Legally Distinct Mouse Ears', price: 35, desc: 'Grey. Round. NOT affiliated with anyone. Dan wears them everywhere.', shop: 'souvenir' },
  wristband: { name: 'Skip-A-Line Wristband (Unofficial)', price: 70, desc: 'Fun Enforcement looks right past you. Smaller vision cones when you sneak.', shop: 'souvenir' },
});
for (const k of ['ears', 'wristband']) ITEMS[k] = { ...UPGRADES[k], upgrade: true };
Object.assign(ICONS, {
  orange: { key: { o: 'ink', r: 'orange', d: '#e07a1a', g: 'grassD', l: 'grass' }, rows: ['....ll....', '....gl....', '..oooooo..', '.orrrrrro.', 'orrrrrrrdo', 'orrrrrrrdo', 'orrrrrrddo', '.orrrrddo.', '..oooooo..', '..........'] },
  turkeyleg: { key: { o: 'ink', b: '#a8642e', d: '#7a4a2b', w: 'white' }, rows: ['..........', '..oooo....', '.obbbbo...', 'obbdbbbo..', 'obbbbbbo..', '.obbbbdo..', '..obbbooo.', '...oo.oww.', '.......ow.', '..........'] },
  ears: { key: { o: 'ink', e: '#3a3440', p: '#ff9ec7', b: '#2a2630' }, rows: ['.ooo..ooo.', 'oeeeooeeeo', 'oepeooepeo', 'oeeeooeeeo', '.ooobbooo.', '...obbo...', '..obbbbo..', '.obbbbbbo.', '.oooooooo.', '..........'] },
  wristband: { key: { o: 'ink', y: 'yellow', t: 'teal', w: 'white' }, rows: ['..........', '..........', '.oooooooo.', 'oyyyyyyyyo', 'oytwtwtyyo', 'oyyyyyyyyo', '.oooooooo.', '..........', '..........', '..........'] },
});
