// FLORIDA DAN — THE KEYS cases. Case 8: The Republic of Dan (Dan secedes on a rented houseboat). Case 9: The Atocha
// Job (Dan finds a Spanish wreck; a TV treasure hunter says it's his). Plus: the Seven Mile Bridge run, diving hooks,
// the tarpon + chug-off mash games, Rex's boat chase, the Monroe County trials, Keys gigs and shops.
// Case days are relative to Game.flags.keysFrom (set the morning after the Daytona 250), see Cases.info.
'use strict';
CASE_NAMES[8] = 'THE REPUBLIC OF DAN'; CASE_NAMES[9] = 'THE ATOCHA JOB';
Object.assign(SWAPS, {
  lou: { hat: PAL.white, hatD: PAL.grey, tank: '#2a4f7a', tankD: '#1c3656', stain: PAL.white, jorts: PAL.tan || '#c9a36a', hair: PAL.white, shades: PAL.skin, skin: '#c98a5f', flip: PAL.brown || '#6b3e26' },
  moe: { hat: PAL.red, hatD: PAL.redD, tank: PAL.black, tankD: PAL.inkL, stain: PAL.red, jorts: PAL.blueD, hair: PAL.grey, shades: PAL.shades, skin: '#e0956a', flip: PAL.black },
  joelle: { hat: '#ff8a3d', hatD: '#c9612a', tank: '#ffe56b', tankD: '#e0c24a', stain: '#ff8a3d', jorts: PAL.white, hair: '#2a1a12', shades: PAL.skin, skin: '#8a5a3a', flip: PAL.white },
  dwayne: { hat: PAL.hat, hatD: PAL.hatD, tank: '#b8e0f7', tankD: '#8fc4e0', stain: PAL.hat, jorts: PAL.jorts, hair: PAL.blonde, shades: PAL.shades, skin: '#f2b48f', flip: PAL.yellow },
  pearl: { hat: '#f6efe0', hatD: '#e5dccb', tank: '#5f9e8f', tankD: '#3f7f70', stain: PAL.white, jorts: '#5f9e8f', hair: PAL.white, shades: '#ffd23f', skin: '#e8a882', flip: PAL.white },
  mike: { hat: '#ffd23f', hatD: '#e0a92a', tank: '#ff8a3d', tankD: '#ffd23f', stain: '#86c94a', jorts: PAL.jorts, hair: '#6b3e26', shades: PAL.shades, skin: '#b8704f', flip: PAL.yellow },
  tom: { hat: '#2ba59a', hatD: '#1f7a72', tank: PAL.white, tankD: '#c9c2b4', stain: '#2ba59a', jorts: PAL.greyD, hair: PAL.grey, shades: PAL.shades, skin: '#c98a5f', flip: PAL.black },
  gus: { hat: '#6b4a2e', hatD: '#4a2e1a', tank: '#d9c8a0', tankD: '#b8a67e', stain: '#6b4a2e', jorts: '#6b4a2e', hair: PAL.white, shades: PAL.skin, skin: '#a8704f', flip: PAL.black },
  brayden: { hat: PAL.white, hatD: PAL.grey, tank: PAL.hat, tankD: PAL.hatD, stain: PAL.yellow, jorts: '#e8d39a', hair: PAL.blonde, shades: PAL.shades, skin: '#ff9d8a', skinD: '#e0685a', flip: PAL.white },
  kruz: { hat: '#2a4f7a', hatD: '#1c3656', tank: '#2a4f7a', tankD: '#ff8a3d', stain: '#ff8a3d', jorts: '#2a4f7a', hair: '#2a1a12', shades: PAL.shades, skin: '#c98a5f', flip: PAL.black },
  rex: { hat: '#c9a36a', hatD: '#8a6a3a', tank: PAL.white, tankD: '#ffd23f', stain: '#ffd23f', jorts: '#c9a36a', hair: '#e0a92a', shades: PAL.shades, skin: '#e0956a', flip: '#6b3e26' },
  madison: { hat: PAL.black, hatD: PAL.inkL, tank: PAL.black, tankD: PAL.red, stain: PAL.red, jorts: PAL.black, hair: '#6b3e26', shades: PAL.shades, skin: '#f2c29a', flip: PAL.black },
  pinder: { hat: PAL.white, hatD: PAL.grey, tank: PAL.robe, tankD: PAL.robeL, stain: '#2ba59a', jorts: PAL.robe, hair: PAL.grey, shades: PAL.skin, skin: '#b8704f', flip: PAL.black },
});
Object.assign(CRITTERS, {
  rooster: { key: { o: 'ink', r: 'red', w: 'white', b: '#b8562a', y: 'yellow', g: '#2f8f4e', k: 'black' }, rows: [
    '..rr........', '.orro.......', '.okwo....gg.', 'yowwo...ggg.', '.owbbooogg..', '.obbbbbbbgo.', '..obbbbbbo..', '...oooooo...', '....y..y....', '...yy.yy....'] },
  cat: { key: { o: 'ink', f: '#f2a65a', d: '#c9772e', k: 'black', w: 'white' }, rows: [
    '.o..o.....', 'ofoofo....', 'offffo...o', 'okffko...o', 'offwfooooo', '.offfffffo', '.ofdfdfdfo', '.offfffffo', '.ofoofoofo', '.oo.oo.oo.'] },
  deer: { key: { o: 'ink', b: '#a8774f', l: '#d9b38a', k: 'black', w: 'white' }, rows: [
    '.o.o......', '..oo......', '.obbo.....', 'okbbo.....', 'owbbooooo.', '..obbbbbbo', '..obllllbo', '..obbbbbo.', '..o.o.o.o.', '..o.o.o.o.'] },
});
const KSP = () => World.spots;
const keysTakeFish = () => { const i = Game.catchBag.findIndex(f => !f.junk); if (i < 0) return false; Game.catchBag.splice(i, 1); Game.inv.fish = Math.max(0, (Game.inv.fish || 1) - 1); return true; };

const KeysCases = {
  c: () => Cases.info(),
  spawn() {
    const c = this.c(), F = Game.flags, S_ = KSP();
    if (c.n === 8 && c.d === 2) {
      Game.npcs.push(makeNPC('kruz', 'Petty Officer Kruz', S_.marina.x + 30, S_.marina.y + 20, 'left'));
      if (!F.citRooster) Game.animals.push(makeCritter('rooster', 70 * TS, 14.8 * TS, { herd: true, citizen: true, tag: 'CITIZEN?' }));
    }
    if (c.n === 9 && c.d === 1 && F.doubloon) { Game.npcs.push(makeNPC('rex', 'Rex Doubloon', S_.bait.x + 30, S_.bait.y + 24, 'left'), makeNPC('madison', 'Madison', S_.bait.x + 48, S_.bait.y + 24, 'left')); }
    if (c.n === 9 && c.d === 2) Game.npcs.push(makeNPC('madison', 'Madison', KSP().beach.x - 40, KSP().beach.y - 10, 'down'));
    if (c.n === 9 && c.d === 3) Game.npcs.push(makeNPC('rex', 'Rex Doubloon', S_.court.x - 30, S_.court.y + 20, 'down'));
  },
  arrived(to) {
    const c = this.c();
    if (to === 'keys' && c.n === 8 && c.d === 1 && qOpen('bus8')) { done('bus8'); addQuest('bridge', 'Ride the cooler across the Seven Mile Bridge (it’s parked by the bus stop)'); hint('bridge', 'Hop on the cooler and ride onto the bridge', 6); }
  },
  setupDay(n) {
    const c = Cases.info(n), F = Game.flags;
    KeysChase.off();
    if (c.n === 8 && c.d === 1) {
      setQuests([['bus8', 'Take the Greyhound to the Keys (bus station)']]);
      if (KEYS()) { done('bus8'); if (F.bridgeDone) addQuest('lou', 'Find Captain Lou at the Key West marina'); else addQuest('bridge', 'Ride the cooler across the Seven Mile Bridge (it’s parked by the bus stop)'); }
      return say([['', 'A check arrives from Swamp Lite. For the commercial. It’s for $1,400 and a coupon.'], ['DAN', 'A week on a houseboat in Key West. Like a normal man. On vacation.'],
        [PHONE_B, 'Dan. Do not go to the Keys.'], ['DAN', 'It’s a VACATION, Brenda. Nothing happens on vacation.'], [PHONE_B, 'Everything happens to you on vacation. You got arrested at a Chuck E. Cheese.'], ['DAN', 'That was a misunderstanding with a robot.']]);
    }
    if (c.n === 8 && c.d === 2) {
      Game.hour = 7; F.flagAtMoes = true;
      setQuests([['flag', 'Get the jorts flag back (it’s flying over Sloppy Moe’s)'], ['citizens', 'Recruit 3 citizens for the Republic (0/3)'], ['sunset2', 'Get recognized at the Mallory Square sunset celebration (after 5 PM)']]);
      this.citizenText(); if (F.flagBack) { F.flagAtMoes = false; done('flag'); }   // a replay remembers the lobster trade
      return say([['', 'THE REPUBLIC OF DAN. DAY ONE.'], ['PETTY OFFICER KRUZ', '(megaphone) Sir. SIR. We towed your... nation... back to the dock at 4 AM. You were asleep in a pool float.'],
        [PHONE_B, 'Dan. They’re charging you with SECESSION. Maritime secession. I had to look it up. It’s a real crime because of YOU.'], ['DAN', 'The Republic of Dan has diplomatic immunity.'],
        [PHONE_B, '...Fine. A country needs a flag, citizens, and somebody who recognizes it. Get all three. I’ll argue it.'], [PHONE_B, 'God help me, I’ll argue it.']]);
    }
    if (c.n === 8 && c.d === 3) { Game.hour = 8; setQuests([['court', 'Monroe County Courthouse (north end of Duval)']]); return say([['', 'COURT DAY. MONROE COUNTY.'], [PHONE_B, 'Flag. Citizens. Recognition. I have a legal argument and I hate it.'], ['DAN', 'Wear something nice. We’re representing a nation.']]); }
    if (c.n === 9 && c.d === 1) {
      Game.hour = 8; setQuests([['snorkel', 'Go snorkeling under the old Seven Mile Bridge (dive by the old bridge)']]);
      return say([['', 'A QUIET DAY. FINALLY.'], ['DAN', 'No court. No Coast Guard. Just a man, a snorkel, and the ocean.'], ['DAN', 'Gonna snorkel. Like a normal tourist. Under the old bridge. Where it’s legal. Probably.']]);
    }
    if (c.n === 9 && c.d === 2) {
      Game.hour = 7; setQuests([['wreck', 'Dive the wreck off the Southernmost Point (bell, cannonball, chest: 0/3)'], ['claim', 'Find Gus’s 1984 salvage claim (ask around Duval)']]);
      this.wreckText();
      return say([[PHONE_B, 'Dan. Rex Doubloon’s lawyers are charging you with Grand Theft Galleon.'], ['DAN', 'That’s not a real—'], [PHONE_B, 'It is now. They say the wreck is on THEIR permit and you’re stealing from it.'],
        ['DAN', 'Gus found it in 1984.'], [PHONE_B, 'Then PROVE it. Bring up something with the ship’s name on it. And find Gus’s old claim. Court’s tomorrow.']]);
    }
    if (c.n === 9 && c.d === 3) { Game.hour = 8; setQuests([['court', 'Monroe County Courthouse (north end of Duval)']]); return say([['', 'COURT DAY. AGAIN.'], [PHONE_B, 'Bring the bell. Bring Gus. Do NOT bring the chest into the courtroom, it’s evidence and also it smells.'], ['DAN', 'It smells like HISTORY, Brenda.']]); }
    // endless Keys days fall back to the generic morning (Cases.setupDay)
  },
  citizenText() { const F = Game.flags, n = ['citCat', 'citRooster', 'citBrayden'].filter(k => F[k]).length; questText('citizens', `Recruit 3 citizens for the Republic (${n}/3)`); if (n >= 3) done('citizens'); },
  wreckText() { const F = Game.flags, n = ['wBell', 'wBall', 'wChest'].filter(k => F[k]).length; questText('wreck', `Dive the wreck off the Southernmost Point (bell, cannonball, chest: ${n}/3)`); if (n >= 3 && F.chestBack) done('wreck'); },
  tick(dt) {
    const c = this.c(), F = Game.flags, D = Game.dan, S_ = KSP();
    KeysChase.tick(dt);
    // walked (or boated) the bridge instead of the set piece: fine, it counts
    if (c.n === 8 && c.d === 1 && qOpen('bridge') && KEYS() && D.x > 47 * TS) this.bridgeDone(null);
    if (c.n === 8 && c.d === 2 && !Q('bed') && qDone('flag') && qDone('citizens') && qDone('sunset2')) addQuest('bed', 'Big day tomorrow. Sleep on the houseboat');   // the arrow always has somewhere to go
    if (c.n === 8 && c.d === 2 && !F.citRooster) {
      const r = Game.animals.find(a => a.citizen);
      if (r && Math.hypot(r.x - S_.door.x, r.y - S_.door.y) < 44) { F.citRooster = true; r.tag = 'CITIZEN'; r.herd = false; this.citizenText(); Sound.play('catch'); toast('The rooster hops onto the houseboat. He is a citizen now. He has already crowed at the Coast Guard.', 4); headline('ROOSTER GRANTED CITIZENSHIP BY SELF-DECLARED "REPUBLIC OF DAN"', 3); }
    }
  },
  // ---------- the Seven Mile Bridge ----------
  bridgeRun() {
    const D = Game.dan; Game.cooler.x = D.x; Game.cooler.y = D.y;
    Bridge.start(res => {
      const E = KSP().bridgeE; Object.assign(D, { x: E.x, y: E.y, dir: 'right', ride: 'cooler' }); Object.assign(Game.cooler, { x: E.x, y: E.y, dir: 'right' });
      Game.cam.x = D.x - VW / 2; Game.cam.y = D.y - VH / 2 - 10;
      this.bridgeDone(res);
    });
  },
  bridgeDone(res) {
    const F = Game.flags, first = !F.bridgeDone; F.bridgeDone = true;
    if (qOpen('bridge')) { done('bridge'); addQuest('lou', 'Find Captain Lou at the Key West marina (end of US-1, then north)'); }
    if (!res) { if (first) { toast('Dan crossed seven miles of ocean the hard way. Brenda is concerned.', 4); headline('FLORIDA MAN CROSSES SEVEN MILE BRIDGE "THE LONG WAY"', 2); } return; }
    toast(`Seven miles in ${res.secs.toFixed(1)}s. ${res.hits ? `${res.hits} “incidents.”` : 'Clean. Suspiciously clean.'}${res.record && !first ? ' NEW RECORD!' : ''}`, 4);
    if (first) headline(res.hits >= 3 ? 'FLORIDA MAN DRIVES MOTORIZED COOLER DOWN SEVEN MILE BRIDGE, HITS "ONLY SOME" RVS' : 'FLORIDA MAN RIDES MOTORIZED COOLER ACROSS SEVEN MILE BRIDGE AT HIGHWAY SPEED; RETIREES "SHAKEN"', res.hits >= 3 ? 6 : 4);
    else if (res.record) headline(`FLORIDA MAN SETS SEVEN MILE BRIDGE COOLER RECORD: ${res.secs.toFixed(1)} SECONDS`, 2);
  },
  // ---------- diving hooks ----------
  dive() {
    const D = Game.dan, c = this.c(), F = Game.flags, S_ = KSP();
    const at = D.ride === 'boat' ? { x: D.x, y: D.y } : facingPoint(16), zone = Keys.zoneAt(at.x, at.y), extra = [];
    const wreckHere = Math.hypot(at.x - S_.reef.x, at.y - S_.reef.y) < 120 || Math.hypot(at.x - S_.buoy.x, at.y - S_.buoy.y) < 70;
    if (c.n === 9 && c.d === 1 && qOpen('snorkel') && zone === 'bridge') extra.push({ k: 'doubloon', name: 'a gold coin with a Spanish crest', keep: true, say: '...that is NOT a Swamp Lite can.', draw: (x, y, t) => { OR(x - 4, y - 4, 8, 8, '#ffd23f'); R(x - 2, y - 2, 4, 1, '#c9912a'); R(x - 1, y - 3, 2, 5, '#c9912a'); if (Math.floor(t * 4) % 3 === 0) R(x + 2, y - 3, 1, 1, PAL.white); } });
    if (c.n === 9 && c.d === 2 && wreckHere) {
      if (!F.wBell) extra.push({ k: 'bell', name: 'the ship’s bell', keep: true, say: 'A bronze bell. It says “N.S. DE LA CERVEZA 1733.”', draw: (x, y) => { OR(x - 5, y - 7, 10, 9, '#b8862a'); R(x - 6, y + 2, 12, 2, '#8a6420'); R(x - 1, y - 9, 2, 2, '#8a6420'); } });
      if (!F.wBall) extra.push({ k: 'ball', name: 'a cannonball', keep: true, say: 'A cannonball. Heavy. Dan sinks a little.', draw: (x, y) => { g.fillStyle = PAL.ink; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); R(x - 2, y - 2, 1, 1, PAL.grey); } });
      if (!F.wChest) extra.push({ k: 'chest', name: 'a treasure chest', keep: true, say: 'A CHEST. An actual pirate chest. Dan screams into his snorkel.', draw: (x, y, t) => { OR(x - 8, y - 6, 16, 10, '#7a4a2b'); R(x - 8, y - 3, 16, 1, '#c9a36a'); R(x - 1, y - 4, 2, 3, '#ffd23f'); if (Math.floor(t * 3) % 4 === 0) R(x + 4, y - 7, 1, 1, '#ffd23f'); } });
    }
    extra.push(...SideQuests.diveExtras(at, wreckHere));   // neighbor-story loot (sidequests.js)
    Dive.start({ zone: wreckHere && c.n === 9 ? 'reef' : zone, extra, intro: extra.length && c.n === 9 && c.d === 2 ? 'Down there: the shape of a ship. A very old ship.' : undefined, then: r => this.diveDone(r) });
  },
  diveDone(r) {
    const F = Game.flags, c = this.c(), has = k => r.got.some(g => g.k === k);
    SideQuests.diveDone(r);
    if (has('doubloon')) { F.doubloon = true; done('snorkel'); return this.rexShowsUp(); }
    if (c.n === 9 && c.d === 2) {
      if (has('bell')) F.wBell = true; if (has('ball')) F.wBall = true;
      if (has('chest')) { F.wChest = true; this.wreckText(); return KeysChase.start(); }
      this.wreckText();
    }
  },
  rexShowsUp() {
    const S_ = KSP(), D = Game.dan;
    Game.npcs.push(makeNPC('rex', 'Rex Doubloon', D.x + 30, D.y + 4, 'left'), makeNPC('madison', 'Madison', D.x + 46, D.y + 6, 'left'));
    headline('FLORIDA MAN FINDS 300-YEAR-OLD GOLD COIN WHILE SNORKELING IN JORTS', 6);
    say([['', 'A speedboat with a TV camera on the front roars up. On the side: GOLD FEVER — KEYS EDITION.'], ['REX DOUBLOON', 'CUT! Cut. Pal. PAL. That’s OUR coin.'], ['DAN', 'I found it. Under the bridge. Where I was snorkeling. Legally. Probably.'],
      ['REX DOUBLOON', 'Rex Doubloon. Season nine. I have permits, a crew, and a very good tan. You have jorts.'], ['MADISON', '(producer) Rex, this is GREAT, keep arguing with him. Dan, can you look angrier?'],
      ['DAN', 'I’m keepin’ the coin.'], ['REX DOUBLOON', 'Then I’ll see you in court, Florida Man.'], ['', 'An old man on the tarpon dock in Marathon has been watching all of this through binoculars.']],
    () => addQuest('gus', 'Ask Old Gus about the coin (the tarpon dock, Marathon)'));
  },
  // ---------- mash minigames ----------
  chug(win, lose) {
    Mash.start({ kind: 'chug', title: 'CHUG-OFF VS BRAYDEN', need: 34, time: 8, sound: 'crack', onWin: win, onLose: lose, draw: (t, k) => {
      R(0, 0, VW, VH, '#2a1a12'); R(0, 118, VW, 62, '#6b4a2e'); for (let i = 0; i < VW; i += 24) R(i, 118, 1, 62, '#5a3a22'); label("SLOPPY MOE'S", 160, 18, PAL.red, 9);
      g.drawImage(SPR.dan.down[0], 0, 0, 16, 22, 84, 44, 48, 66); g.drawImage(SPR.brayden.down[0], 0, 0, 16, 22, 188, 44, 48, 66);
      const me = 1 - k, him = clamp(1 - (Game.t % 20) / 11, 0, 1);
      OR(118, 70 - Math.round(k * 8), 10, 26, '#ffd23f'); R(119, 71 + Math.round((1 - me) * 24) - Math.round(k * 8), 8, Math.max(0, Math.round(me * 24)), '#f2c14a');
      OR(186, 70, 10, 26, '#ffd23f'); R(187, 71, 8, Math.round(him * 24), '#f2c14a'); label('DAN', 108, 122, PAL.white, 7); label('BRAYDEN', 212, 122, PAL.white, 7);
    } });
  },
  tarpon(win, lose) {
    Mash.start({ kind: 'tarpon', title: 'FEED THE TARPON', hint: `MASH ${K('a')}: HOLD ON TO THE BUCKET!`, need: 30, time: 7, sound: 'splash', onWin: win, onLose: lose, draw: (t, k) => {
      R(0, 0, VW, 90, '#8fdcef'); R(0, 90, VW, 90, '#1fa3b8'); for (let i = 0; i < 14; i++) R((i * 29 + t * 20) % VW, 100 + (i % 4) * 18, 12, 1, '#7fe3e8');
      OR(0, 78, 150, 12, PAL.wood); for (let i = 0; i < 150; i += 8) R(i, 78, 1, 12, PAL.woodD);
      g.drawImage(SPR.dan.right[0], 0, 0, 16, 22, 80, 22, 40, 56); OR(118, 52, 12, 12, PAL.grey); R(120, 50, 8, 2, PAL.greyD);
      for (let i = 0; i < 3; i++) { const jump = Math.max(0, Math.sin(t * 3 + i * 2.1)), x = 170 + i * 45, y = 120 - jump * 70; g.save(); g.translate(x, y); g.rotate(-.6 + jump * .6); OR(-14, -5, 28, 10, '#c9d6de'); R(-14, 0, 28, 2, '#9fb0bb'); R(8, -3, 2, 2, PAL.black); R(-18, -6, 5, 12, '#9fb0bb'); g.restore(); }
      label(k > .66 ? 'THEY’RE EATING FROM HIS HAND' : k > .33 ? 'THE BIG ONE WANTS THE BUCKET' : 'THE TARPON ARE WATCHING', 160, 170, PAL.white, 6);
    } });
  },
  buoyPhoto() {
    const F = Game.flags; Sound.play('pickup'); Game.flash = .5;
    toast(pick(['*click* Dan, the buoy, and 40 strangers. Everybody takes the same photo.', '*click* Southernmost Point. 90 miles to Cuba. Dan considers it.', '*click* A rooster photobombs. It’s a better photo now.']), 3.5);
    if (!F.buoyHl) { F.buoyHl = true; headline('FLORIDA MAN WAITS 45 MINUTES IN LINE TO TAKE PHOTO WITH BUOY, CALLS IT "WORTH IT"', 1); }
  },
  // ---------- the declaration (case 8, day 1, sunset) ----------
  declare() {
    const hb = World.props.find(p => p.kind === 'houseboat'), hx = hb.x + hb.w / 2, hy = hb.y + 10, D = Game.dan, cut = { x: hx - 230, y: hy - 30 }, F = Game.flags;
    Scene.play([
      SC.fx(() => { Game.hour = Math.max(Game.hour, 19.1); Object.assign(D, { x: KSP().door.x - 6, y: KSP().door.y, dir: 'left', ride: null }); Game.inv.beer = Math.max(0, (Game.inv.beer || 0) - 2); Game.fx.buzz = Math.max(Game.fx.buzz, 70); }),
      SC.cam(hx, hy - 12, 1.5, 1.1), SC.line('dan', 'Beer eleven.', 1.2), SC.emote('dan', '♥', .8, PAL.hat),
      SC.say([['DAN', 'People of the Florida Keys.'], ['DAN', 'I been charged. I been sued. I been called a Florida Man in THREE COUNTIES.'], ['DAN', 'So tonight...'], ['DAN', 'I secede.'],
        ['', 'He takes off his jorts and runs them up the houseboat’s flagpole. They are, technically, blue.'], ['DAN', 'I hereby declare this houseboat... THE REPUBLIC OF DAN!']]),
      SC.fx(() => { F.declared = true; }), SC.shake(3), SC.react('cheer'),
      SC.prop('cutter', (cx, cy, t) => { const x = Math.round(cut.x - cx), y = Math.round(cut.y - cy); shadow(x + 30, y + 14, 70, 7); OR(x, y, 60, 14, PAL.white); R(x + 8, y + 3, 5, 10, '#ff8a3d'); R(x + 14, y + 3, 3, 10, '#2a4f7a'); OR(x + 30, y - 12, 20, 12, PAL.white); R(x + 34, y - 9, 12, 4, PAL.waterL); R(x + 40, y - 20, 1, 8, PAL.grey); label('U.S. COAST GUARD', x + 30, y - 16, '#2a4f7a', 4); }),
      SC.tween(() => cut.x, v => { cut.x = v; }, hx - 120, 2.4), SC.line(cut, 'COAST GUARD: Is that flag... PANTS?', 1.8),
      SC.line('dan', 'This is a SOVEREIGN NATION!', 1.4), SC.fly(() => SPR.icons.firework, hx - 6, hy - 10, cut.x + 30, cut.y - 4, .8, 8, true), SC.fx(() => burst(cut.x + 30, cut.y - 10)), SC.shake(6), SC.flash(.5),
      SC.line(cut, 'COAST GUARD: ...Did he just SHOOT at us?', 1.8), SC.line('dan', 'Warning shot!', 1.3), SC.line(cut, 'COAST GUARD: With a FIREWORK?', 1.6), SC.line('dan', 'It’s all the Republic can afford!', 1.8),
      SC.cam(hx, hy - 12, 1.1, 1.2),
    ], () => {
      done('sunset'); Game.hour = Math.max(Game.hour, 20);
      headline('FLORIDA MAN DECLARES RENTED HOUSEBOAT A SOVEREIGN NATION, FIRES "WARNING ROCKET" AT COAST GUARD', 12);
      addQuest('bed', 'Sleep on the houseboat (the Republic of Dan)');
    });
  },
  // ---------- people ----------
  talk(n) {
    const c = this.c(), F = Game.flags;
    const cat = n.id === 'pearl', up = (n.name || n.id).toUpperCase();
    if (n.id === 'lou') {
      if (c.n === 8 && c.d === 1 && qOpen('lou')) { done('lou'); F.houseboat = true; addQuest('sunset', 'Watch the sunset from your houseboat (after 6 PM)');
        return say([['CAPTAIN LOU', 'You the fella from the beer commercial? The one who burps for forty seconds?'], ['DAN', 'Forty-one. They cut one.'],
          ['CAPTAIN LOU', 'Houseboat’s the “Knot Guilty,” end of the dock. Rules: no parties. No fireworks. No flags. ESPECIALLY no flags.'], ['DAN', 'Why especially no flags?'], ['CAPTAIN LOU', 'It’s Key West, son. People get ideas.']]), true; }
      return say([['CAPTAIN LOU', pick(['Twenty-six years on this dock. Seen everything. Then I met you.', 'Tide’s coming in. So’s the Coast Guard, about you.', 'The Knot Guilty’s a fine vessel. Please stop saying it’s a country.'])]]), true;
    }
    if (n.id === 'kruz') return say([['PETTY OFFICER KRUZ', pick(['Sir, I have been instructed not to recognize your nation.', 'Please do not fire anything at my boat today.', 'The rooster is also not a citizen. Of anything.'])]]), true;
    if (n.id === 'moe') {
      if (c.n === 8 && c.d === 2 && qOpen('flag')) {
        if ((Game.inv.lobster || 0) >= 3) { Game.inv.lobster -= 3; F.flagBack = true; F.flagAtMoes = false; done('flag'); headline('FLORIDA MAN TRADES THREE LOBSTERS FOR HIS OWN PANTS', 4); return say([['MOE', 'Three spiny lobsters. Beauties. Lobster night is BACK.'], ['', 'Moe climbs the roof and takes down the jorts. He hands them over folded, with respect.'], ['MOE', 'Your flag, Mr. President.'], ['DAN', 'Prime Minister.']]), true; }
        return say([['MOE', 'Found ’em on Duval at 2 AM. Pants on a pole. That’s decor now.'], ['MOE', 'I’ll trade. Three spiny lobsters. The reef’s full of ’em. Go dive, Mr. President.']]), true;
      }
      if (c.n === 9 && c.d === 2 && qOpen('claim')) { F.claimTip = true; return say([['MOE', 'Gus’s claim? From ’84? Yeah! Found it in the wall when we remodeled in ’92. Thought it was a menu.'], ['MOE', 'It’s framed in the men’s room. Go get it. Don’t look at anything else in there.']]), true; }
      if (c.n === 8 && c.d === 2 && !F.citBrayden && qOpen('citizens')) return say([['MOE', 'Brayden? The bachelor party kid? He’s somewhere on Duval, yelling. Follow the yelling.']]), true;
      return say([['MOE', pick(['Sloppy Moe’s. Home of the Sloppy Moe. Nobody knows what’s in it. Including me.', 'Hemingway drank here. Allegedly. So did a guy named Hemingwaye. Different guy.', 'The roosters are regulars. They tip better than you.'])]]), true;
    }
    if (cat) {
      if (c.n === 8 && c.d === 2 && !F.citCat && qOpen('citizens')) {
        if (keysTakeFish()) { F.citCat = true; this.citizenText(); headline('SIX-TOED CAT NAMED "MR. TOES" JOINS FLORIDA MAN’S NATION IN EXCHANGE FOR ONE (1) FISH', 3); return say([['MISS PEARL', 'A fish? For Mr. Toes? Oh, he LIKES you.'], ['', 'Mr. Toes, a cat with six toes on every foot, signs the constitution. It is a paw print. It is also a little bit of fish.'], ['MISS PEARL', 'He’s a citizen of two countries now. Don’t tell the other one.']]), true; }
        return say([['MISS PEARL', 'A citizen? Mr. Toes might go for it. He’s a Hemingway cat. Six toes. Very political.'], ['MISS PEARL', 'But he only trusts men who bring fish. Catch one. Off the dock, off the pier, anywhere.']]), true;
      }
      return say([['MISS PEARL', pick(['Fifty-four cats. Every one of them has six toes. Every one of them is smarter than you.', 'The cats run this house. I just pay the electric.', 'Mr. Toes says hello. Mr. Toes is lying, he doesn’t like anyone.'])]]), true;
    }
    if (n.id === 'brayden') {
      if (c.n === 8 && c.d === 2 && !F.citBrayden && qOpen('citizens')) return say([['BRAYDEN', 'BRO. BRO. Is that the PANTS COUNTRY guy?? My bachelor party saw you on the NEWS.'], ['DAN', 'I need citizens.'], ['BRAYDEN', 'Beat me in a chug-off and I’ll move there, bro. I’ll give up AMERICA.', [
        ['“You’re on.”', () => { Game.afterTalk = () => this.chug(() => { F.citBrayden = true; this.citizenText(); headline('BACHELOR PARTY GROOM RENOUNCES U.S. CITIZENSHIP AFTER LOSING CHUG-OFF TO FLORIDA MAN', 4); say([['BRAYDEN', 'BRO. BRO!! I’m a CITIZEN. Of PANTS COUNTRY.'], ['', 'Brayden signs the constitution. He signs it “BRAYDEN (BRO).”']]); }, () => say([['BRAYDEN', 'LET’S GOOOO! Rematch whenever, Mr. President.']])); return null; }],
        ['“Later.”', () => [['BRAYDEN', 'I’ll be here, bro. Or at a different bar. Same thing.']]]]]]), true;
      return say([['BRAYDEN', pick(['BRO. My fiancée doesn’t know I’m in Key West.', 'I have been awake since Tuesday.', 'Is that a CHICKEN? Bro, there are chickens EVERYWHERE.'])]]), true;
    }
    if (n.id === 'mike') {
      if (c.n === 8 && c.d === 2 && qOpen('sunset2')) {
        if (Game.hour < 17) return say([['MANGO MIKE', 'The sunset celebration starts at five, amigo. Tightrope guy, cat guy, the man with the knives. And now... you?', [['“Wait around for the show.”', () => { Game.hour = 17; toast('Dan hangs out at Mallory Square. A man juggles fire. A cat jumps through it. Five o’clock.', 4); return [['MANGO MIKE', 'SHOWTIME, amigo.']]; }], ['“I’ll come back.”', () => null]]]]), true;
        return say([['MANGO MIKE', 'Ladies and gentlemen, the man who seceded from the United States in his UNDERWEAR!'], ['MANGO MIKE', 'Dance for the crowd, amigo. If they love you, the Conch Republic recognizes you. That’s the law. I made it up just now.', [
          ['“Hit it.”', () => { Game.afterTalk = () => Dance.start(() => { F.recognized = true; done('sunset2'); react('cheer'); headline('SUNSET CROWD AT MALLORY SQUARE FORMALLY "RECOGNIZES" FLORIDA MAN’S HOUSEBOAT AS A NATION', 5); say([['', 'Four hundred people applaud as the sun goes down. A man in a pirate hat salutes. A cat does a flip.'], ['MANGO MIKE', 'By the authority of the sunset: the Republic of Dan is RECOGNIZED!']]); }, { who: 'MANGO MIKE', sprite: 'mike', sunset: true }); return null; }],
          ['“Not yet.”', () => [['MANGO MIKE', 'The sun won’t wait long, amigo.']]]]]]), true;
      }
      return say([['MANGO MIKE', pick(['Every night the sun goes down and everybody claps. Key West, baby.', 'I have a cat act. The cat doesn’t know.', 'Tip the tightrope guy. He has a family. They’re also on the tightrope.'])]]), true;
    }
    if (n.id === 'gus') {
      if (c.n === 9 && c.d === 1 && qOpen('gus')) {
        if (!F.tarponFed) { addQuest('tarpon', 'Feed Gus’s tarpon (end of the dock)', false, 'gus'); return say([['OLD GUS', 'Let me see that coin.'], ['', 'Gus looks at the coin for a very long time. His hands shake.'], ['OLD GUS', 'Nuestra Señora de la Cerveza. 1733. I found her in ’84, son. Filed the claim. Nobody believed me. The paperwork got lost.'],
          ['OLD GUS', 'I’ll tell you where she lies. But first: feed my tarpon. The tarpon trust you, I trust you.']]), true; }
        done('gus'); F.wreckKnown = true; addQuest('bed', 'Big day tomorrow. Sleep on the houseboat');
        return say([['OLD GUS', 'They LIKE you. Hell, they never liked me.'], ['OLD GUS', 'She’s off the Southernmost Point. Straight out from the buoy, past the reef. Forty feet down.'], ['OLD GUS', 'That TV fella’s gonna try to take her. Don’t let him, son. Not after forty years.'], ['DAN', 'Gus... I got you.']]), true;
      }
      return say([['OLD GUS', pick(['Fifty years diving these reefs. Nine hundred beer cans. One ship.', 'The tarpon are older than you. Smarter too.', 'You ever hold a gold coin, son? It’s heavier than it looks. So’s the past.'])]]), true;
    }
    if (n.id === 'rex') return say([['REX DOUBLOON', pick(['Gold Fever, season nine. Tuesdays at nine. Eight central.', 'I have a permit. It’s laminated.', 'You know what’s better than treasure? RATINGS.'])]]), true;
    if (n.id === 'madison') return say([['MADISON', pick(['Can you do that again but angrier? Great. Love it.', 'Rex can’t actually dive. Don’t tell anyone. We use a guy named Pedro.', 'This is going to be a VERY good episode for you. Legally, bad. Television, good.'])]]), true;
    if (n.id === 'tom') return say([['TARPON TOM', pick(['Bait, tackle, and tarpon food. The tarpon eat better than me.', 'Some guy paddled for Cuba last week. Got as far as the channel marker.', 'The key deer are tiny. Don’t punch the key deer. It’s a federal thing.']), [['Browse', () => { Game.mode = 'shop'; openShop('bait'); return null; }], ['“Just looking.”', () => null]]]]), true;
    if (n.id === 'joelle') return say([['JOELLE', pick(['Conch fritters, Key lime pie, and the truth. The truth costs extra.', 'Conch is a shell, a food, AND a person from here. Try to keep up.', 'You want the pie. Everybody wants the pie.']), [['Browse', () => { Game.mode = 'shop'; openShop('conch'); return null; }], ['“Just looking.”', () => null]]]]), true;
    if (n.id === 'dwayne') return say([['DWAYNE', pick(['T-shirts. Three for ten. Snorkels. Fins. Regret.', '“My parents went to Key West and all I got was...” finish the sentence, bro. Buy the shirt.', 'I sell the snorkels the treasure guys use. Not Rex. Rex uses a guy named Pedro.']), [['Browse', () => { Game.mode = 'shop'; openShop('tees'); return null; }], ['“Just looking.”', () => null]]]]), true;
    return false;
  },
  interactions() {
    const D = Game.dan, S_ = KSP(), list = [], near = (p, r) => p && Math.hypot(D.x - p.x, D.y - p.y) < r, c = this.c(), F = Game.flags;
    if (D.ride) return list;
    if (c.n === 8 && c.d === 1 && qOpen('sunset') && near(S_.door, 22)) list.push(Game.hour < 18 ? { label: 'Wait for the sunset on the houseboat', fn: () => { Game.hour = 18.3; toast('Dan sits on the houseboat roof with a cooler. The sky turns orange. He has eleven beers left. Then ten.', 4); } } : { label: 'Toast the sunset', fn: () => this.declare() });
    if (c.n === 9 && c.d === 1 && qOpen('tarpon') && near(S_.tarpon, 26)) list.push({ label: 'Feed the tarpon', fn: () => this.tarpon(() => { F.tarponFed = true; done('tarpon'); headline('FLORIDA MAN FEEDS TARPON BY HAND, KEEPS "MOST" FINGERS', 3); toast('The tarpon ate. Dan kept all ten fingers. Go tell Gus.', 3); }, () => toast('A tarpon jumped out and took the whole bucket. Tom has more. Try again.', 3)) });
    if (c.n === 9 && c.d === 2 && qOpen('claim') && F.claimTip && near(S_.moeDoor, 18)) list.push({ label: 'Grab Gus’s claim from the men’s room', fn: () => { F.claimGot = true; done('claim'); Sound.play('pickup'); toast('Salvage Claim #84-117: G. Albury, “N.S. de la Cerveza.” Framed. Slightly damp. Do not ask why.', 4.5); } });
    return list;
  },
  target(q) {
    const S_ = KSP(), who = id => Game.npcs.find(n => n.id === id), F = Game.flags;
    switch (q.id) {
      case 'bus8': return KEYS() ? null : World.spots.stationDoor || null;
      case 'bridge': return Game.dan.ride === 'cooler' ? S_.bridgeW : Game.cooler;
      case 'lou': return who('lou');
      case 'sunset': return S_.door;
      case 'flag': return who('moe');
      case 'citizens': return !F.citCat ? who('pearl') : !F.citBrayden ? who('brayden') : Game.animals.find(a => a.citizen) || S_.door;
      case 'sunset2': return who('mike');
      case 'snorkel': return S_.oldbridge;
      case 'gus': return who('gus');
      case 'tarpon': return S_.tarpon;
      case 'wreck': return KeysChase.boat || S_.buoy;
      case 'claim': return F.claimTip ? S_.moeDoor : who('moe');
      case 'rexchase': return KeysChase.boat;
    }
    return undefined;
  },
};

// ---------- Rex steals the chest: a boat chase around Key West ----------
const KeysChase = {
  boat: null, hold: 0,
  route: [[74, 59], [86, 59], [89, 50], [89, 30], [89, 10], [80, 3], [62, 3], [60, 20], [62, 40], [66, 58]],
  start() {
    this.boat = { x: 82 * TS, y: 59 * TS, i: 1, dir: 'right' }; this.hold = 0;
    addQuest('rexchase', 'Rex grabbed the chest! Chase his boat down in yours (marina)');
    Sound.play('siren'); Game.shake = 5;
    say([['', 'Dan surfaces with the chest. A speedboat is waiting. With a camera. And a net.'], ['MADISON', 'ROLLING! Rex, GRAB IT!'], ['', 'Rex Doubloon hooks the chest out of Dan’s arms and FLOORS it.'], ['REX DOUBLOON', 'Salvage LAW, Florida Man! Finders keepers! (Pedro found it.)']]);
  },
  off() { this.boat = null; },
  tick(dt) {
    const b = this.boat; if (!b || Game.mode !== 'play') return;
    const wp = this.route[b.i % this.route.length], tx = wp[0] * TS, ty = wp[1] * TS, dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy);
    const sp = Game.dan.ride === 'boat' ? 70 * (hasUp('cigboat') ? .9 : 1) : 10;
    if (d < 8) b.i++; else { b.x += dx / d * sp * dt; b.y += dy / d * sp * dt; b.dir = dirOf(dx, dy); }
    if (Math.random() < dt * 8) Game.parts.push({ kind: 'foam', x: b.x - dx / (d || 1) * 12, y: b.y - dy / (d || 1) * 12 + 3, vx: 0, vy: 0, life: .8 });
    const D = Game.dan, close = D.ride === 'boat' && Math.hypot(D.x - b.x, D.y - b.y) < 22;
    this.hold = close ? this.hold + dt : Math.max(0, this.hold - dt * .6);
    if (close && Math.random() < dt * 3) toast(pick(['STAY ON HIM!', 'Rex is yelling at his cameraman!', 'Closer... CLOSER...']), .8);
    if (this.hold > 1.2) this.caught();
  },
  caught() {
    const F = Game.flags; this.boat = null; F.chestBack = true; done('rexchase'); Sound.play('catch'); Game.flash = .6; KeysCases.wreckText();
    headline('FLORIDA MAN CHASES DOWN TV TREASURE HUNTER IN JON BOAT, RECOVERS 300-YEAR-OLD CHEST', 8);
    say([['', 'Dan pulls alongside and jumps. He lands in Rex’s boat. On Rex.'], ['REX DOUBLOON', 'MY TAN!'], ['', 'Dan takes the chest back. The camera gets all of it.'], ['MADISON', '...That’s the season finale. Oh my God. That’s the season finale.']]);
  },
  draw(cx, cy, t) {
    const b = this.boat; if (!b) return; const x = Math.round(b.x - cx), y = Math.round(b.y - cy);
    shadow(x, y + 6, 30, 6); OR(x - 15, y - 5, 30, 10, PAL.white); R(x - 15, y + 1, 30, 2, '#ffd23f'); OR(x - 2, y - 12, 10, 7, '#9fd8ee');
    g.drawImage(SPR.rex.down[0], x - 12, y - 22); OR(x + 8, y - 9, 6, 5, PAL.black); label('GOLD FEVER', x, y - 26, '#ffd23f', 5);
  },
};

// ---------- Monroe County trials ----------
CLEAN_LIMIT[8] = 9; CLEAN_LIMIT[9] = 9;
CREDITS[8] = ['THE REPUBLIC STANDS', 'The Republic of Dan has three citizens: a cat, a rooster, and Brayden (bro).<br>The Coast Guard has asked, politely, that its flag stop being pants.<br>Captain Lou has put up a sign: NO NATIONS.', 'Next case'];
CREDITS[9] = ['FINDERS KEEPERS', 'The Nuestra Señora de la Cerveza is going to a museum. Old Gus cut the ribbon. He cried. The tarpon came.<br>Rex Doubloon’s show was cancelled. Madison got a new show. It’s about Dan.<br><br>NEXT: ORLANDO. The mouse is watching.<br>The swamp, Miami, Daytona and the Keys are all yours.', 'Keep playing'];
const KeysCourt = {
  republic() {
    CourtCases.begin(); const F = Game.flags;
    say([['BAILIFF', 'All rise for the Honorable Judge Wesley Pinder.'], ['JUDGE PINDER', 'Mr. Dupree. You are charged with secession. From the United States. In a rented houseboat.'], ...CourtCases.clean(8),
      ['JUDGE PINDER', 'Prosecution.'], ['PROSECUTOR REYES', 'Your Honor, I will describe the events of the other night. The defense may object to any falsehoods.'], ['BRENDA', '(whispering) Only the lies, Dan. You KNOW this.']],
    () => { Objection.speaker = 'PROSECUTOR REYES'; Objection.run([
      { text: 'The defendant declared his houseboat an independent nation.', lie: false, over: 'He did. There is video. There is a LOT of video.' },
      { text: 'The defendant fired a missile at a Coast Guard cutter.', lie: true, bust: 'It was a Freedom Rocket. From a fireworks stand. It says “NOT A MISSILE” on the side.' },
      { text: 'The defendant’s flag was made from his own jorts.', lie: false, over: 'Size 44. The court has seen the flag. The court wishes it had not.' },
      { text: 'The “Republic of Dan” has no citizens.', lie: !!(F.citCat || F.citRooster || F.citBrayden), bust: 'It has citizens. One of them is a rooster, but still.', over: 'Correct. Nobody signed up. Not even the rooster.' },
      { text: 'The defendant was completely sober.', lie: true, bust: 'Eleven beers. He announced the number. Twice.' },
    ], () => this.republicEnd()); });
  },
  republicEnd() {
    const F = Game.flags, have = [F.flagBack && 'a flag', (F.citCat && F.citRooster && F.citBrayden) && 'three citizens', F.recognized && 'recognition'].filter(Boolean);
    say([['BRENDA', have.length ? `Your Honor, the Republic of Dan has ${have.join(', ')}. Under international law, that makes it... a country. Technically.` : 'Your Honor, the Republic of Dan has... a houseboat. And spirit.'],
      ...(F.citCat ? [['MISS PEARL', 'Mr. Toes is a citizen. He’s very proud. He wore his good collar.']] : []), ...(F.citBrayden ? [['BRAYDEN', 'I gave up AMERICA for this, bro. For PANTS COUNTRY.']] : []),
      ['JUDGE PINDER', '...Mr. Dupree. Do you know what happened in this town in April of 1982?'], ['DAN', 'No sir.'],
      ['JUDGE PINDER', 'Key West seceded. The Conch Republic. We declared war on America and surrendered one minute later.'], ['JUDGE PINDER', 'Then we asked for a billion dollars in foreign aid.'], ['JUDGE PINDER', 'My grandfather was Secretary of Rum.'],
      ['JUDGE PINDER', 'This court finds the defendant NOT GUILTY. The Conch Republic formally recognizes the Republic of Dan as a sister nation.'], ['JUDGE PINDER', 'Also: stop shooting at the Coast Guard.'],
      ['DAN', 'I’m still not a Florida Man.'], ['BRENDA', 'Dan, you just got recognized as a FOREIGN NATION by a JUDGE.']],
    () => { headline('JUDGE RULES FLORIDA MAN’S HOUSEBOAT "A SISTER NATION" OF THE CONCH REPUBLIC; COAST GUARD "REVIEWING OPTIONS"', 9); F.case8Won = true; F.creditsPending = 8; endDay('court'); });
  },
  galleon() {
    CourtCases.begin(); const F = Game.flags;
    say([['BAILIFF', 'All rise. Again. Judge Pinder. Again.'], ['JUDGE PINDER', 'Mr. Dupree. Three days ago you were a nation. Today you are a treasure thief. Allegedly.'], ...CourtCases.clean(9),
      ['JUDGE PINDER', 'Doubloon Entertainment v. Dupree. Grand Theft Galleon.'], ['REX’S LAWYER', 'Your Honor, I will lay out the facts.'], ['BRENDA', '(whispering) Lies only, Dan. You’ve done this like nine times.']],
    () => { Objection.speaker = 'REX’S LAWYER'; Objection.run([
      { text: 'Mr. Doubloon has a permit to salvage off Key West.', lie: false, over: 'He does. It is laminated. He showed it to the bailiff four times.' },
      { text: 'Mr. Doubloon personally discovered the wreck.', lie: true, bust: 'Mr. Doubloon cannot swim. A man named Pedro does all the diving. Pedro is in the gallery. Wave, Pedro.' },
      { text: 'Nobody had ever claimed this wreck before.', lie: !!F.claimGot, bust: 'Salvage Claim #84-117. Filed by Augustus Albury in 1984. It was in a men’s room. It still counts.', over: 'Correct. No claim has been produced. It was probably lost. In a bar.' },
      { text: 'Mr. Dupree chased Mr. Doubloon’s boat and jumped on him.', lie: false, over: 'He did. It’s the season finale. It’s very good television.' },
      { text: 'Mr. Doubloon’s permit covers the Southernmost Point.', lie: true, bust: 'The permit is for coordinates in the middle of Lake Okeechobee. Someone typed it wrong. Probably Rex.' },
    ], () => this.galleonEnd()); });
  },
  galleonEnd() {
    const F = Game.flags;
    say([['BRENDA', F.wBell ? 'Exhibit A: the ship’s bell. It reads “N.S. de la Cerveza, 1733.” The defense calls Augustus “Gus” Albury.' : 'The defense calls Augustus “Gus” Albury.'],
      ['OLD GUS', 'I found her in ’84, Your Honor. Forty years nobody believed me. That boy believed me. He fed my tarpon.'],
      ['', '*CRASH*'], ['', 'The doors burst open. It’s Chuck. He walked the Seven Mile Bridge. All seven miles. He is wearing a tiny snorkel.'], ['JUDGE PINDER', 'IS THAT AN ALLIGATOR IN A SNORKEL?'], ['DAN', 'That’s Chuck. He’s my plus-one.'],
      ['', 'Chuck climbs into Rex Doubloon’s lap and stares. Rex confesses. Pedro did the diving. The permit was a typo.'],
      ['JUDGE PINDER', 'The wreck is Mr. Albury’s. The treasure goes to a museum. Mr. Dupree: NOT GUILTY. And co-finder.'], ['JUDGE PINDER', 'Mr. Doubloon: under arrest for salvage fraud. And the tan is fake.'],
      ['', 'THAT NIGHT: DUVAL STREET.'], ['', 'The whole island throws a parade. Gus rings the bell. The roosters march. Brayden cries.'],
      ['MANGO MIKE', 'Ladies and gentlemen, KEY WEST’S FLORIDA MAN OF THE YEAR!'], ['DAN', '', [
        ['“I am NOT a Florida Man.” (puts on sash)', () => [['', 'He says it on a float shaped like a lobster. Four thousand people cheer.']]],
        ['“This one’s for Gus.”', () => [['OLD GUS', '*crying*'], ['', 'The tarpon jump in the harbor. Nobody can explain it.']]],
        ['Raise a Swamp Lite to the sunset', () => [['', 'The whole street raises a beer at once. The sun goes down. Everybody claps. It’s Key West.']]]]],
      [PHONE_B, 'Dan. Before you say anything. Do NOT go to Orlando.'], ['DAN', 'What’s in Orlando?'], [PHONE_B, 'A mouse, Dan. A very powerful mouse. With LAWYERS.']],
    () => { headline('FLORIDA MAN CLEARED IN "GRAND THEFT GALLEON" CASE, LEADS KEY WEST PARADE ON LOBSTER FLOAT', 10); F.case9Won = true; F.creditsPending = 9; endDay('court'); });
  },
};

// ---------- Keys side gigs ----------
Object.assign(GIGS, {
  roosters: { giver: 'moe', pay: 30, quest: 'Chase 3 roosters out of Sloppy Moe’s (yell GIT behind them)',
    offer: [['MOE', 'Three roosters walked in at 9 AM and ordered nothing. They’re on the bar. They won’t leave.'], ['MOE', 'Yell ’em out. Thirty bucks. They only respect yelling.']],
    start() { const S_ = KSP(); for (let i = 0; i < 3; i++) Game.animals.push(makeCritter('rooster', S_.moe.x - 20 + i * 18, S_.moe.y + 4, { herd: true, gigR: true })); },
    check: () => { const S_ = KSP(), rs = Game.animals.filter(a => a.gigR); return rs.length === 3 && rs.every(r => Math.hypot(r.x - S_.moe.x, r.y - S_.moe.y) > 110); },
    hl: 'FLORIDA MAN EVICTS THREE ROOSTERS FROM BAR USING ONLY HIS VOICE; ROOSTERS "ALREADY BACK"' },
  lobsters: { giver: 'joelle', pay: 45, quest: 'Bring Joelle 2 spiny lobsters (dive for them)',
    offer: [['JOELLE', 'Lobster fritters are on the menu and I have zero lobsters.'], ['JOELLE', 'Two spiny lobsters, forty-five bucks. Grab ’em off the reef. With your HANDS, apparently.']],
    talkActive: () => (Game.inv.lobster || 0) >= 2 ? (Game.inv.lobster -= 2, 'done') : [['JOELLE', `Two lobsters, Dan. You got ${Game.inv.lobster || 0}. The reef is right there.`]],
    hl: 'FLORIDA MAN SELLS HAND-CAUGHT LOBSTERS TO CONCH SHACK; HEALTH DEPARTMENT "HAS QUESTIONS"' },
  kayak: { giver: 'tom', pay: 40, quest: 'Get Tom’s kayak back from the guy paddling to Cuba (by boat, way south)',
    offer: [['TARPON TOM', 'A guy rented a kayak and said “I’m going to Cuba.” He meant it. He’s out past the reef.'], ['TARPON TOM', 'Bring my kayak back. Leave the guy if you want. Forty bucks.']],
    start() { G_().kayak = { x: rnd(20, 60) * TS, y: 58.5 * TS }; },
    talkActive: () => G_().kayakGot ? 'done' : [['TARPON TOM', 'He’s way out, Dan. South. Take a boat. Follow the sound of a man singing about Cuba.']],
    hl: 'FLORIDA MAN INTERCEPTS KAYAKER "HALFWAY TO CUBA," TOWS HIM BACK WITH A JON BOAT' },
});
const KeysGigs = {
  interaction() {
    const G = G_(), D = Game.dan;
    if (G.active === 'kayak' && G.kayak && !G.kayakGot && D.ride === 'boat' && Math.hypot(D.x - G.kayak.x, D.y - G.kayak.y) < 30)
      return { label: 'Grab the kayak (and the guy)', fn: () => { G.kayakGot = true; Sound.play('pickup'); say([['KAYAK GUY', 'I was SO close, man. I could smell the cigars.'], ['DAN', 'You were four miles out. That’s a channel marker.'], ['KAYAK GUY', '...Can I have a beer?']]); } };
    return null;
  },
  target(id) {
    const G = G_(), who = n => Game.npcs.find(x => x.id === n);
    if (id === 'roosters') return Game.animals.find(a => a.gigR && Math.hypot(a.x - KSP().moe.x, a.y - KSP().moe.y) <= 110) || null;
    if (id === 'lobsters') return (Game.inv.lobster || 0) >= 2 ? who('joelle') : KSP().reef;
    if (id === 'kayak') return G.kayakGot ? who('tom') : Game.dan.ride === 'boat' ? G.kayak : Game.boat;
    return null;
  },
  draw(cx, cy, t) {
    const G = G_(); if (G.active !== 'kayak' || !G.kayak || G.kayakGot) return;
    const x = Math.round(G.kayak.x - cx), y = Math.round(G.kayak.y - cy + Math.sin(t * 2) * 1.5); if (x < -30 || x > VW + 30 || y < -30 || y > VH + 30) return;
    shadow(x, y + 4, 26, 4); OR(x - 13, y - 2, 26, 5, PAL.yellow); g.drawImage(SPR.tourist.down[0], x - 8, y - 16); R(x - 16, y - 8 + Math.round(Math.sin(t * 4) * 3), 32, 1, PAL.woodD);
  },
};

// ---------- shops: Tarpon Tom's, the Conch Shack, Dwayne's T-shirts ----------
Object.assign(ITEMS, {
  fritter: { name: 'Conch Fritter', price: 3, desc: 'Fried. Chewy. Chill up. Tastes like the ocean went to a county fair.' },
  pie: { name: 'Key Lime Pie', price: 5, desc: 'A whole slice. Big chill, sobers Dan up a little. It’s mostly sugar.' },
});
HOTBAR.push('fritter', 'pie');
Object.assign(UPGRADES, {
  snorkel: { name: 'Real Snorkel Set', price: 80, desc: 'Not the one from the gas station. 60% more air on every dive.', shop: 'tees' },
  fins: { name: 'Swim Fins', price: 60, desc: 'Swim faster underwater. Walk worse on land. Worth it.', shop: 'tees' },
  tee: { name: '“My Parents Went to Key West” Tee', price: 25, desc: 'Does nothing. Says everything. Dan’s parents did not go to Key West.', shop: 'tees' },
});
for (const k of ['snorkel', 'fins', 'tee']) ITEMS[k] = { ...UPGRADES[k], upgrade: true };
Object.assign(ICONS, {
  fritter: { key: { o: 'ink', b: '#c9912a', d: '#8a6420', y: 'yellow' }, rows: ['..........', '...oooo...', '..obbbbo..', '.obdbbdbo.', '.obbbybbo.', '.obdbbbbo.', '..obbbbo..', '...oooo...', '..........', '..........'] },
  pie: { key: { o: 'ink', g: '#c8e27a', c: '#e8d39a', w: 'white' }, rows: ['..........', '.......o..', '.....oowo.', '...ooggwo.', '.ooggggo..', 'ogggggo...', 'occcccco..', 'oooooooo..', '..........', '..........'] },
  snorkel: { key: { o: 'ink', t: 'teal', w: 'white', y: 'yellow' }, rows: ['.......y..', '.......y..', '.......y..', 'oooooo.y..', 'otwwto.y..', 'ottttoyy..', 'oooooo....', '..........', '..........', '..........'] },
  fins: { key: { o: 'ink', y: 'yellow', d: 'orange' }, rows: ['..........', '..o....o..', '.oyo..oyo.', '.oyo..oyo.', 'oyyyooyyyo', 'oyyyooyyyo', 'oddyooyddo', 'oyyyooyyyo', 'oooo..oooo', '..........'] },
  tee: { key: { o: 'ink', p: 'hat', w: 'white', k: 'black' }, rows: ['..........', '.oo....oo.', 'oppooooppo', 'opppppppp.', '.oppkkppo.', '..opkkpo..', '..oppppo..', '..oppppo..', '..oooooo..', '..........'] },
});
