// FLORIDA DAN — Case 2 (the manatee video) and Case 3 (is the defendant a Skunk Ape?),
// then the endless swamp. Story.* hooks into this for days 5+.
'use strict';
const CASE_NAMES = { 1: 'THE FLAMINGO INCIDENT', 2: 'THE MANATEE MATTER', 3: 'THE SKUNK APE AFFAIR', 0: 'FREE ROAM' };
function findLand(tx, ty, dy, maxSteps = 30) {   // walk from a tile toward water; return the last good footing
  let last = null;
  for (let i = 0; i < maxSteps; i++, ty += dy) { const k = World.tile(Math.floor(tx), Math.floor(ty)); if (WALKABLE(k) && k !== T.SHALLOW) last = { x: tx * TS, y: (ty + .5) * TS }; else if (last) break; }
  return last;
}
function findTile(pred, x0, y0, x1, y1, seed) {
  const r = rng(seed); for (let i = 0; i < 800; i++) { const tx = Math.floor(x0 + r() * (x1 - x0)), ty = Math.floor(y0 + r() * (y1 - y0)); if (pred(World.tile(tx, ty), tx, ty)) return { x: (tx + .5) * TS, y: (ty + .5) * TS }; }
  return null;
}
const Cases = {
  info(day = Game.day) {
    const O = Game.flags.orlandoFrom;   // Orlando: the last two cases, the morning after the Atocha Job (orlando2.js)
    if (O && day >= O) { const d = day - O; return d < 3 ? { n: 10, d: d + 1 } : d < 6 ? { n: 11, d: d - 2 } : { n: 0, d: day - 22 }; }
    const K = Game.flags.keysFrom;   // the Keys: two cases starting the morning after the Daytona 250 (keys2.js)
    if (K && day >= K) { const d = day - K; return d < 3 ? { n: 8, d: d + 1 } : d < 6 ? { n: 9, d: d - 2 } : { n: 0, d: day - 22 }; }
    if (day <= 4) return { n: 1, d: day }; if (day <= 7) return { n: 2, d: day - 4 }; if (day <= 10) return { n: 3, d: day - 7 };
    if (day <= 13) return { n: 4, d: day - 10 }; if (day <= 16) return { n: 5, d: day - 13 }; if (day <= 19) return { n: 6, d: day - 16 }; if (day <= 22) return { n: 7, d: day - 19 }; return { n: 0, d: day - 22 };
  },
  name() { return CASE_NAMES[this.info().n]; },
  courtCase() { const kc = this.info(); if (ORLANDO() && kc.d === 3 && (kc.n === 10 || kc.n === 11)) return kc.n === 10 ? 'whimsy' : 'finale'; if (KEYS() && kc.d === 3 && (kc.n === 8 || kc.n === 9)) return kc.n === 8 ? 'republic' : 'galleon'; return Game.day === 4 ? 'flamingo' : Game.day === 7 ? 'manatee' : Game.day === 10 ? 'skunk' : Game.day === 13 && MIAMI() ? 'lambo' : Game.day === 16 && MIAMI() && Game.flags.flyer ? 'sinus' : Game.day === 19 && DAYTONA() ? 'donut' : Game.day === 22 && DAYTONA() && Game.flags.raceWon ? 'race' : null; },
  places() {
    if (this._p) return this._p;
    const M = World.spots.merle;
    return this._p = {
      kayden: { x: 35.5 * TS, y: 37.4 * TS },
      pam: findLand(47.5, 13, 1) || { x: M.x + 30, y: M.y + 30 },
      manny: findTile(k => k === T.WATER || k === T.DEEP, 42, 17, 50, 22, 5) || { x: M.x, y: M.y + 90 },
      trailcam: findTile(k => k === T.SAWGRASS, 8, 45, 12, 49, 7) || { x: 10 * TS, y: 47 * TS },
      den: findTile(k => k === T.SAWGRASS || k === T.MUD, 2, 53, 6, 57, 9) || { x: 4 * TS, y: 55 * TS },
      couch: { x: 22 * TS, y: 16.4 * TS },
    };
  },
  // extra people who live in the world from Case 2 on
  spawn() {
    const P = this.places(), n = this.info().n, day = Game.day;
    Game.npcs.push(makeNPC('kevin', 'Kevin', 37.3 * TS, 41.5 * TS, 'down'));
    if (n === 2 && day === 5) Game.npcs.push(makeNPC('kayden', 'Kayden', P.kayden.x, P.kayden.y, 'down', { wander: 12, quest: true }));
    if (n >= 2 || n === 0) Game.npcs.push(makeNPC('pam', 'Dr. Pam', P.pam.x, P.pam.y, 'down', { wander: 16, quest: n === 2 && day === 5 }));
    if (n === 2 && day === 5) for (let i = 0; i < 6; i++) { const s = findTile(k => k === T.WATER || k === T.DEEP, 26, 12, 40, 30, 100 + i * 13); if (s) Game.pickups.push({ kind: 'trash', x: s.x, y: s.y, bob: i }); }
    if (n === 3 && day >= 9) { // missed him on day 8? he's home at the den anyway
      const ape = this.makeApe(P.den.x, P.den.y); ape.state = 'den'; Game.animals.push(ape); }
  },
  makeApe(x, y) { return makeCritter('skunkape', x, y, { state: 'lurk', timer: 0, ape: true }); },

  setupDay(n) {
    const c = this.info(n), F = Game.flags;
    if (c.n >= 10) return OrlandoCases.setupDay(n);
    if (c.n >= 8) return KeysCases.setupDay(n);
    if (c.n >= 6) return DaytonaCases.setupDay(n);
    if (c.n >= 4) return MiamiCases.setupDay(n);
    if (c.n === 2 && c.d === 1) {
      setQuests([['kayden', 'Find the kid who filmed it (boat ramp)'], ['pam', 'Talk to Dr. Pam (Merle’s island)']]);
      return say([['', 'MONDAY. CASE TWO.'], [PHONE_B, 'Dan. The manatee video has forty million views.'], ['DAN', 'Is that a lot?'],
        [PHONE_B, 'It is the most-watched video in Florida history, Dan. It beat the guy who fought a Wendy’s.'],
        [PHONE_B, 'You’re charged with Unlawful Manatee Operation. Court is Wednesday.'], ['DAN', 'Manny consented, Brenda.'],
        [PHONE_B, 'The MANATEE cannot CONSENT, Dan. Find whoever filmed it. And get someone respectable to vouch for you. Anyone.']]);
    }
    if (c.n === 2 && c.d === 2) {
      setQuests([['lettuce', 'Buy 3 heads of lettuce (Gulp-N-Go)'], ['pool', 'Borrow Merle’s kiddie pool'], ['manny2', 'Find Manny after dark (east of Merle’s)']]);
      return say([[PHONE_B, 'Good news, Dan. The judge will allow a “character witness of the aquatic persuasion.”'], ['DAN', 'Manny?'],
        [PHONE_B, 'Manny. Get him to court. Nobody knows how. That’s your problem.'], ['TEXT: MERLE', 'manny likes lettuce. everybody knows that. u can borrow my kiddie pool for transport']]);
    }
    if (c.n === 2 && c.d === 3) { Game.hour = 8; setQuests([['court', 'Get to court by 10 AM']]); return say([['', 'WEDNESDAY. COURT DAY.'], [PHONE_B, 'Courthouse. Ten AM. Bring the manatee.'], ['DAN', 'He’s in the kiddie pool in the truck bed.'], [PHONE_B, 'Your truck doesn’t have WHEELS, Dan.'], ['DAN', '...He’s in the kiddie pool.']]); }
    if (c.n === 3 && c.d === 1) {
      setQuests([['trailcam', 'Check the trail cam in the Glades'], ['dogs', 'Buy 3 roller dogs for bait (0/3)'], ['lure', 'Set the bait in the Glades after dark']]);
      return say([['', 'MONDAY. CASE THREE.'], ['RADIO', '...a trail camera in the Everglades has captured a seven-foot creature drinking a Swamp Lite at 3 AM. Experts say it is either the legendary Skunk Ape, or “a guy.”'],
        ['RHONDA', '*knock knock* Dan. The Skunk Ape on that trail cam is wearing YOUR HAT.'], ['DAN', 'Lotta guys have this hat.'], ['RHONDA', 'It says DAN on it.'],
        [PHONE_B, 'Dan. They’re charging you with impersonating a cryptid. And “public mudity.” Court is Wednesday.'], [PHONE_B, 'The only defense is the REAL Skunk Ape. Which does not exist.'],
        ['DAN', 'Oh, it exists. We’ve met. I think. It was a long night.']]);
    }
    if (c.n === 3 && c.d === 2) {
      setQuests([['jorts', 'Buy XXXL Formal Jorts (Gulp-N-Go)'], ['rehearse', 'Rehearse the Skunk Ape’s testimony (Glades)'], ['reunion', 'Visit the Skunk Ape after 6 PM']]);
      return say([[PHONE_B, 'You FOUND it? Dan. DAN. Get it court-ready. That means pants.'], ['DAN', 'He’s more of a jorts guy.'], [PHONE_B, 'Then FORMAL jorts. And teach it to answer questions.']]);
    }
    if (c.n === 3 && c.d === 3) { Game.hour = 8; setQuests([['court', 'Get to court by 10 AM']]); return say([['', 'WEDNESDAY. COURT DAY.'], [PHONE_B, 'Is it coming?'], ['DAN', 'He’s already there. He took the bus.'], [PHONE_B, 'The Skunk Ape took the BUS?'], ['DAN', 'He’s got a senior pass.']]); }
    // endless
    setQuests([]);
    Favors.roll(MIAMI() ? 1 : 2);
    say([['', `DAY ${n}. ${pick(['The swamp is 91° and rising.', 'A pelican stares at Dan through the window.', 'Somewhere, a headline is waiting to happen.'])}`], ['DAN', pick(['Another beautiful day in paradise.', 'My head. My whole head.', 'Let’s make some news.', 'Florida Man of the Year, reporting for duty.'])]]);
  },

  tick(dt) {
    const c = this.info(), F = Game.flags;
    if (ORLANDO() || c.n >= 10) { OrlandoCases.tick(dt); Favors.tick(dt); return; }
    if (KEYS() || c.n >= 8) { KeysCases.tick(dt); Favors.tick(dt); return; }
    if (DAYTONA() || c.n >= 6) { DaytonaCases.tick(dt); Favors.tick(dt); return; }
    if (c.n >= 4 || MIAMI()) { MiamiCases.tick(dt); Favors.tick(dt); return; }
    if (c.n === 2 && c.d === 1) {
      if (F.contentStart != null && !F.contentDone) {
        const got = Game.headlines.length - F.contentStart; questText('content', `Do 3 Florida Man things for Kayden’s camera (${Math.min(3, got)}/3)`);
        if (got >= 3) { F.contentDone = true; done('content'); questText('kayden', 'Go back to Kayden (boat ramp)'); toast('KAYDEN (texting): BRO. BRO. come back to the ramp'); }
      }
      if (F.trashStart && !F.trashDone) { const n = Game.inv.trash || 0; questText('trash', `Fish trash out of the lagoon by boat (${Math.min(5, n)}/5)`); if (n >= 5) { F.trashDone = true; done('trash'); questText('pam', 'Bring the trash to Dr. Pam'); } }
      if (Q('kayden') && qDone('kayden') && Q('pam') && qDone('pam') && !F.c2d1) { F.c2d1 = true; addQuest('bed', 'Go home to bed'); }
    }
    if (c.n === 2 && c.d === 2) {
      questText('lettuce', `Buy 3 heads of lettuce (${Math.min(3, Game.inv.lettuce || 0)}/3)`); if ((Game.inv.lettuce || 0) >= 3) done('lettuce');
      if (Game.hour >= 20 && !F.mannyOut) { F.mannyOut = true; const P = this.places(); Game.animals.push(makeCritter('manatee', P.manny.x, P.manny.y, { spirit: true, sober: true })); toast('Something is glowing in the water east of Merle’s...'); }
    }
    if (c.n === 3 && c.d === 1) { questText('dogs', `Buy 3 roller dogs for bait (${Math.min(3, Game.inv.hotdog || 0)}/3)`); if ((Game.inv.hotdog || 0) >= 3) done('dogs'); }
    if (c.n === 3 && c.d === 2) { if (Game.flags.xxxl) done('jorts'); }
    // the ape runs to his den, leaving prints
    for (const a of Game.animals) if (a.ape && a.state === 'run') {
      const P = this.places(), dx = P.den.x - a.x, dy = P.den.y - a.y, d = Math.hypot(dx, dy);
      if (d < 6) { a.state = 'den'; continue; }
      a.x += dx / d * 70 * dt; a.y += dy / d * 70 * dt; a.flip = dx < 0;
      a.printT = (a.printT || 0) - dt; if (a.printT <= 0) { a.printT = .35; (Game.prints = Game.prints || []).push({ x: a.x + rnd(-3, 3), y: a.y }); }
    }
    Favors.tick(dt);
  },

  talk(n) {
    const c = this.info(), F = Game.flags;
    if (MIAMI() && MiamiCases.talk(n)) return true;
    if (DAYTONA() && DaytonaCases.talk(n)) return true;
    if (KEYS() && KeysCases.talk(n)) return true;   // endless Daytona days still fall through to favors
    if (ORLANDO() && OrlandoCases.talk(n)) return true;
    if (n.id === 'kayden' && c.n === 2) {
      n.quest = false;
      if (!F.kaydenAsk) {
        F.kaydenAsk = true; F.contentStart = Game.headlines.length;
        addQuest('content', 'Do 3 Florida Man things for Kayden’s camera (0/3)', false, 'kayden');
        say([['KAYDEN', 'YO. It’s the MANATEE GUY. Chat, it’s the manatee guy!'], ['DAN', 'Kid, I need you to delete that video.'], ['KAYDEN', 'Bro that video pays my phone bill.'],
          ['KAYDEN', 'Okay okay. I’ll delete it... if you give me BETTER content. Do three Florida Man things. On camera. Go.'], ['DAN', 'To get OUT of the news... I have to get IN the news.'], ['KAYDEN', 'That’s the algorithm, bro.']]);
        return true;
      }
      if (F.contentDone && qOpen('kayden')) {
        done('kayden'); headline('FLORIDA MAN DOES THREE FLORIDA MAN THINGS TO GET ONE FLORIDA MAN THING DELETED', 4);
        say([['KAYDEN', 'BRO. BROOOO. That was FIRE. Chat is LOSING it.'], ['KAYDEN', 'Manatee video: deleted. Well, “deleted.” It’s on like four other accounts.'], ['DAN', 'So I did all that for nothing.'], ['KAYDEN', 'You did it for CONTENT, bro.'], ['', 'Kayden gives Dan a fist bump. It is slightly sticky.']]);
        return true;
      }
      say([['KAYDEN', pick(['Do something crazy, bro. Chat is waiting.', 'Punch a gator. Chat LOVES gators.', 'Bro what if you got chased by the cops? For content.'])]]); return true;
    }
    if (n.id === 'pam') {
      if (c.n === 2 && c.d === 1 && qOpen('pam')) {
        if (!F.trashStart) {
          F.trashStart = true; addQuest('trash', 'Fish trash out of the lagoon by boat (0/5)', false, 'pam');
          say([['DR. PAM', 'You’re the man from the manatee video.'], ['DAN', 'Allegedly.'], ['DR. PAM', 'I’ve rescued manatees for thirty years. I have never seen one look that... happy.'],
            ['DR. PAM', 'I’ll write a letter for your case if you clean up the lagoon. Take your boat out and fish the trash out of the water. Five pieces.'], ['DAN', 'That’s it?'], ['DR. PAM', 'You’ll see.']]);
          return true;
        }
        if (F.trashDone) {
          done('pam'); Game.inv.trash = 0; F.pamLetter = true; headline('FLORIDA MAN CLEANS UP LAGOON, FINDS THREE RECLINERS, A WEDDING RING, AND "A GUY NAMED STEVE"', 3);
          say([['DR. PAM', 'Three recliners. A wedding ring. And... Steve.'], ['DAN', 'Steve’s fine. He was napping.'], ['DR. PAM', 'Here’s your letter, Dan. I wrote that you are “surprisingly gentle with sea cows.”'], ['DAN', 'That’s the nicest thing anyone’s ever said about me.']]);
          return true;
        }
        say([['DR. PAM', `That’s ${Game.inv.trash || 0}. The lagoon needs five. Use your boat.`]]); return true;
      }
      say([['DR. PAM', pick(['Manatees can hold their breath for twenty minutes. I can’t hold mine around you, Dan.', 'Stay off the manatees, Dan.', 'Did you know gators and manatees are actually pretty chill with each other? Unlike people.'])]]); return true;
    }
    if (n.id === 'merle' && c.n === 2 && c.d === 2 && qOpen('pool')) {
      Game.inv.pool = 1; done('pool');
      say([['MERLE', 'My kiddie pool? For MANNY? Heck yeah, Danny. It’s got a hole in it but so do I.'], ['', 'Got: one (1) kiddie pool. Cartoon sharks on it.']]); return true;
    }
    if (n.id === 'darlene' && c.n === 2 && c.d === 2 && (Game.inv.lettuce || 0) === 0 && !F.lettuceTalk) {
      F.lettuceTalk = true; say([['DARLENE', 'Lettuce? YOU want LETTUCE? Dan, in eleven years I have never seen you buy a vegetable.'], ['DAN', 'It’s for a friend.'], ['DARLENE', 'I’m putting it in the shop. I’m scared, Dan.']], () => { Game.mode = 'shop'; openShop('gulp'); }); return true;
    }
    // daily favors next, then everyday small talk
    if (Favors.talk(n)) return true;
    if (n.id === 'kevin') { say([['KEVIN', pick(['Five more minutes.', 'This dumpster’s rent-controlled, bro.', 'I used to be a dentist. Don’t ask.', 'If you see a raccoon named Gregory, tell him he owes me a sandwich.'])]]); return true; }
    return false;
  },
  shopExtras() {
    const c = this.info(), x = [];
    if (c.n === 2 && c.d === 2) x.push('lettuce');
    if (c.n === 3 && c.d === 2 && !Game.flags.xxxl) x.push('jortsXXXL');
    return x;
  },
  bought(k) {
    if (k === 'lettuce' && !Game.flags.lettuceHead) { Game.flags.lettuceHead = true; headline('FLORIDA MAN BUYS LETTUCE AT GAS STATION; CLERK "SHOOK"', 2); }
    if (k === 'jortsXXXL') { Game.flags.xxxl = true; Game.inv.jortsXXXL = 0; toast('Formal Jorts, XXXL. Darlene didn’t ask. Darlene has never looked more tired.'); }
  },

  // the next step only happens after dark (and night work isn't cut off at 10 PM)
  needsDark() { const c = this.info(); return !MIAMI() && !DAYTONA() && !KEYS() && ((c.n === 2 && c.d === 2 && qOpen('manny2')) || (c.n === 3 && c.d === 1 && qDone('dogs') && qOpen('lure')) || (c.n === 3 && c.d === 2 && qDone('rehearse') && qOpen('reunion'))); },
  darkAt() { const c = this.info(); return c.n === 3 && c.d === 2 ? 18 : 20; },
  waitDark() { return this.needsDark() && Game.hour < this.darkAt(); },
  nightWork() { const c = this.info(); if (ORLANDO() && c.n === 11 && c.d === 2 && qOpen('memo')) return true; return !MIAMI() && !DAYTONA() && !KEYS() && (this.needsDark() || (c.n === 3 && c.d === 1 && qOpen('track'))); },
  interactions() {
    const D = Game.dan, c = this.info(), F = Game.flags, P = this.places(), list = MiamiCases.interactions(), near = (p, r) => Math.hypot(D.x - p.x, D.y - p.y) < r;
    if (this.waitDark() && near(P.couch, 24)) list.push({ label: 'Sit on the couch till dark', fn: () => {
      say([['', 'Dan sits on the couch. He opens a Swamp Lite. The sun goes down. It is beautiful. He will never tell anyone.']], () => { Game.hour = c.n === 3 && c.d === 2 ? 18.2 : 20.2; });
    } });
    if (c.n === 3 && c.d === 1) {
      if (qOpen('trailcam') && near(P.trailcam, 22)) list.push({ label: 'Check the trail cam', fn: () => {
        done('trailcam'); headline('TRAIL CAM CAPTURES "SKUNK APE" DRINKING SWAMP LITE; SKUNK APE IS JUST A GUY NAMED DAN', 5);
        say([['', 'The photo: a seven-foot shape, covered head to toe in mud, holding a Swamp Lite, giving the camera a thumbs up.'], ['DAN', '...That’s a good photo of me though.'],
          ['', 'In the corner of the photo, behind Dan, something much bigger is also holding a Swamp Lite.'], ['DAN', 'Oh. OH.']]);
      } });
      if (qDone('dogs') && qOpen('lure') && near(P.trailcam, 26)) list.push({ label: Game.hour >= 20 ? 'Set out the roller dogs' : 'Set the bait (come back after dark)', fn: () => {
        if (Game.hour < 20) return toast('Too bright. Skunk Apes are night people. (Couch at home: “sit till dark.”)');
        if ((Game.inv.hotdog || 0) < 3) return toast('You ate the bait, Dan. Three roller dogs. Darlene’s got more.');
        Game.inv.hotdog -= 3; done('lure'); addQuest('track', 'Follow the footprints', false);
        const ape = this.makeApe(P.trailcam.x + 60, P.trailcam.y - 20); Game.animals.push(ape);
        ape.x += 400; Scene.play(this.lureScene(ape), () => { ape.state = 'run'; });   // offstage until it steps out
      } });
    }
    for (const a of Game.animals) if (a.ape && a.state === 'den' && near(a, 30)) {
      if (c.n === 3 && (!F.apeFriend || qOpen('track'))) list.push({ label: 'Approach the Skunk Ape', fn: () => this.apeMeet(a) });
      else if (c.n === 3 && c.d === 2 && qOpen('rehearse')) list.push({ label: 'Rehearse the testimony', fn: () => this.rehearse() });
      else if (c.n === 3 && c.d === 2 && qDone('rehearse') && qOpen('reunion')) list.push({ label: Game.hour >= 18 ? 'Hang out with the Skunk Ape' : 'Hang out (after 6 PM)', fn: () => Game.hour >= 18 ? this.reunion(a) : toast('The Skunk Ape is asleep. He sleeps like Dan: face down, one flip-flop on.') });
      else list.push({ label: 'Talk to the Skunk Ape', fn: () => say([['SKUNK APE', pick(['HRRM.', 'HRRRRM?', '*offers Dan a half-eaten roller dog*', '*points at the moon, then at Dan, then nods slowly*'])]]) });
    }
    return list;
  },
  apeMeet(a) {
    const F = Game.flags;
    say([['SKUNK APE', 'HRRRRRM.'], ['DAN', '...Hey, big guy. You drink Swamp Lite too?'], ['SKUNK APE', '*sniffs Dan* ...HRM.'], ['DAN', '', [
      ['Offer him a Swamp Lite', () => { if (Game.inv.beer > 0) Game.inv.beer--; headline('FLORIDA MAN SHARES BEER WITH SKUNK APE; "HE’S A GOOD LISTENER"', 4); return [['', '*crack*'], ['SKUNK APE', '*crack*'], ['', 'They drink in silence. It is the best conversation Dan has had in years.']]; }],
      ['Yell “GIT!”', () => { Sound.play('git'); Game.chill = Math.max(0, Game.chill - 20); return [['SKUNK APE', 'GIIIIIIIIIIIIT.'], ['', 'The Skunk Ape yells it back. Louder. The swamp goes silent. A bird falls out of a tree.'], ['DAN', '...Fair.'], ['', 'He respects you now.']]; }],
      ['Punch him', () => { hurtDan(20); headline('FLORIDA MAN PUNCHES SKUNK APE, SKUNK APE PUNCHES BACK; BOTH "FEEL GREAT ABOUT IT"', 5); return [['', '*POW*'], ['', '*POW POW POW*'], ['DAN', '(from the ground) ...Good hit.'], ['SKUNK APE', '*offers Dan a hand up*']]; }]]],
      ['', 'The Skunk Ape is now Dan’s friend. Dan did not have many of those.']], () => { F.apeFriend = true; done('track'); addQuest('bed', 'Go home to bed'); });
  },
  rehearse() {
    say([[PHONE_B, 'Okay, Mr. Ape. I’m going to ask you practice questions. Are you the defendant, Daniel Dupree?'], ['SKUNK APE', '', [
      ['“HRRM.” (no)', () => [[PHONE_B, 'Good. Great. And did you drink the Swamp Lite in the photo?'], ['SKUNK APE', 'HRRRRRRM.'], [PHONE_B, 'Is that a yes or a no?'], ['DAN', 'That’s a “we both did.”']]],
      ['*eats a roller dog*', () => [[PHONE_B, 'Is he... eating?'], ['DAN', 'He’s nervous, Brenda.']]],
      ['*hugs the phone*', () => [[PHONE_B, 'Why is it dark. Why is it warm. DAN.']]]]],
      [PHONE_B, 'I have never been more worried about a case in my life. See you Wednesday.']], () => { done('rehearse'); });
  },
  reunion(a) {
    const P = this.places(), chuck = makeGator(a.x + 26, a.y + 10, true); chuck.lurk = false; chuck.cd = 99; chuck.state = 'wander'; chuck.timer = 99; Game.animals.push(chuck);
    chuck.stun = 99; Scene.play(this.reunionScene(a, chuck), () => { chuck.stun = 0; say([['DAN', 'You two KNOW each other?'], ['SKUNK APE', 'HRRM. HRRRM HRM.'],
      ['DAN', 'Thirty years? Since the hurricane of ’96? That’s beautiful. That’s... I’m not crying. It’s the swamp.']], () => {
      done('reunion'); headline('ALLIGATOR AND SKUNK APE REUNITE AFTER 30 YEARS; FLORIDA MAN CRIES, BLAMES "SWAMP GAS"', 4); addQuest('bed', 'Go home to bed');
    }); });
  },
  // roller dogs on a log; something VERY large steps out of the sawgrass
  lureScene(ape) {
    const P = this.places(), x = P.trailcam.x, y = P.trailcam.y;
    const dogs = (cx, cy) => { OR(x + 8 - cx, y + 5 - cy, 20, 4, PAL.woodD); for (let i = 0; i < 3; i++) { R(x + 10 + i * 6 - cx, y + 2 - cy, 5, 3, PAL.mudL); R(x + 10 + i * 6 - cx, y + 2 - cy, 5, 1, PAL.red); } };
    return [SC.cam(x + 20, y - 8, 1.6, .7), SC.walk('dan', x + 2, y + 4, 45), SC.face('dan', 'right'), SC.prop('dogs', dogs), SC.sound('pickup'), SC.wait(.3),
      SC.walk('dan', x - 34, y + 8, 40), SC.face('dan', 'right'), SC.line('dan', 'shhh...', 1.2), SC.wait(.6),
      SC.place(ape, x + 80, y - 18), SC.walk(ape, x + 26, y + 2, 20), SC.line(ape, 'HRRRRRRRM.', 1.3),
      SC.unprop('dogs'), SC.sound('munch'), SC.shake(4), SC.emote('dan', '!', .8, PAL.red),
      SC.walk(ape, x + 130, y - 40, 120), SC.line('dan', 'HEY! Those were $2 each!', 1.6)];
  },
  // Chuck and the Skunk Ape: thirty years apart, and then a hug
  reunionScene(a, chuck) {
    return [SC.cam(a.x + 14, a.y - 6, 1.7, .6), SC.emote(chuck, '!', .7), SC.emote('dan', '?', .8), SC.line('dan', 'Chuck?!', 1), SC.line(chuck, '*hiss*', 1), SC.line(a, 'HRRRM?', 1.1), SC.line(chuck, '*HISS!!*', 1),
      SC.all([SC.emote(a, '…', 1.8, PAL.white), SC.emote(chuck, '…', 1.8, PAL.white)]), SC.wait(.7),
      SC.all([SC.walk(a, a.x + 10, a.y + 2, 18), SC.walk(chuck, a.x + 20, chuck.y - 2, 18)]), SC.all([SC.emote(a, '♥', 1.6, PAL.hat), SC.emote(chuck, '♥', 1.6, PAL.hat), SC.emote('dan', '♥', 1.6, PAL.hat)]), SC.wait(.6)];
  },
  manny2() {
    const F = Game.flags;
    if ((Game.inv.lettuce || 0) < 3 || !Game.inv.pool) return say([['MANNY THE MANATEE', 'Daaaniel. You came back.'], ['MANNY THE MANATEE', 'I do not testify on an empty stomach. Nor do I travel without a vessel.'], ['DAN', 'Lettuce and a kiddie pool. Got it.']]);
    Game.inv.lettuce -= 3;
    say([['MANNY THE MANATEE', 'Daaaniel. You brought... romaine.'], ['DAN', 'Three heads. And a kiddie pool. It has sharks on it.'], ['MANNY THE MANATEE', 'I will testify, Daniel. For the truth. And for the lettuce.'],
      ['MANNY THE MANATEE', 'Also, you should know: the video will show that YOU were not the first to ride me that night.'], ['DAN', 'What?'], ['MANNY THE MANATEE', 'Wednesday, Daniel.']], () => {
      done('manny2'); headline('FLORIDA MAN SEEN FEEDING LETTUCE TO MANATEE AT MIDNIGHT, WHISPERING "WE RIDE AT DAWN"', 3); addQuest('bed', 'Go home to bed');
      Game.animals = Game.animals.filter(a => !a.sober);
    });
  },
  sleepBlock() {
    const c = this.info(), open = Game.quests.filter(q => !q.done && !q.opt && q.id !== 'bed');
    if (this.courtCase()) return ORLANDO() ? (c.n === 11 ? 'Court. The LAST one. The Orange County Courthouse. GO.' : 'Court. Today. The Orange County Courthouse. GO.') : KEYS() ? 'Court. Today. The Monroe County Courthouse. GO.' : DAYTONA() ? 'Court. Today. The Volusia County Courthouse. GO.' : MIAMI() ? 'Court. Today. The Miami-Dade Courthouse. GO.' : 'Court. Today. The courthouse. East end of 29. GO.';
    if (c.n === 6 && c.d === 1 && !Game.flags.donutRun) return 'Brenda: the Grand Marshal thing is TODAY, Dan. Daytona. Go.';
    if (c.n === 7 && c.d === 3 && !Game.flags.raceWon) return 'Sleep? It’s RACE DAY.';
    if (c.n === 8 && c.d === 1 && !Game.flags.declared) return Game.flags.houseboat ? 'Sleep? The sunset’s the whole point of the houseboat.' : 'Brenda: You’re not even IN the Keys yet. (Greyhound, bridge, Captain Lou.)';
    if (c.n === 10 && c.d === 1 && !Game.flags.escaped) return Game.flags.suitOn ? 'Sleep? In a stolen mouse? Get OUT of the park first.' : 'Chad’s free tickets won’t use themselves. (Timeshare on I-Drive, then the park.)';
    if (c.n === 11 && c.d === 1 && !Game.flags.gangHere) return 'Brenda: The whole gang is stuck on I-4, Dan. Go GET them.';
    if (c.n === 2 || c.n === 3) return open.length ? `Still got stuff to do: ${open[0].text.toLowerCase().replace(/\s*\(.*\)$/, '')}.` : null;
    return Game.hour < 17 && open.length ? 'Too early. Even for Dan.' : null;   // story's done for today? bed whenever you like
  },
  event(name) { Favors.event(name); },
};
