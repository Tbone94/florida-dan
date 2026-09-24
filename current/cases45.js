// FLORIDA DAN — MIAMI. Case 4: Grand Theft Lambo (days 11-13). Case 5: Operation Sinus (days 14-16).
'use strict';
CASE_NAMES[4] = 'GRAND THEFT LAMBO'; CASE_NAMES[5] = 'OPERATION SINUS';
const MSP = () => World.spots;
const MiamiCases = {
  c() { return Cases.info(); },
  // ---------- who's around ----------
  spawn() {
    const c = this.c(), F = Game.flags, S_ = MSP();
    Game.npcs.push(makeNPC('doc', 'Dr. Sniffles', 64.6 * TS, 34.4 * TS, 'down'));
    if (c.n === 4 && c.d === 2) Game.npcs.push(makeNPC('dj', 'DJ Flamingo', S_.club.x + 16, S_.club.y + 6, 'down', { quest: true }));
    if (c.n === 4 && c.d === 3 && !F.canadianGone) Game.npcs.push(makeNPC('tourist', 'The Canadian', 49.5 * TS, 57.8 * TS, 'up', { canadian: true }));
    if (c.n === 5) { Game.npcs.push(makeNPC('rocket', 'Det. Rocket', 49.5 * TS, 28.4 * TS, 'down'), makeNPC('tubbs', 'Det. Tubbs', 51 * TS, 28.4 * TS, 'down')); }
    if (c.n === 5 && c.d === 1 && !F.balesDone) this.spawnBales();
    if (c.n === 5 && c.d === 2) Game.npcs.push(makeNPC('goon', 'Bouncer', 11 * TS, 27.6 * TS, 'left', { bouncer: true }));
    if (c.n === 4 && c.d === 1 && !F.lamboSunk) Game.vehicles = [{ kind: 'lambo', x: S_.lambo.x, y: S_.lambo.y, a: Math.PI / 2 }];
    else Game.vehicles = [];
  },
  spawnBales() {
    for (let i = 0; i < 6; i++) Game.pickups.push({ kind: 'bale', x: rnd(64, 71) * TS, y: rnd(4, 56) * TS });
    for (let i = 0; i < 2; i++) Game.npcs.push(makeNPC('goon', 'Cartel Goon', rnd(62, 70) * TS, (i ? 50 : 8) * TS, 'down', { baleGrab: true }));
  },
  arrived(to) {
    const c = this.c();
    if (to === 'miami' && c.n === 4 && c.d === 1 && !Game.flags.checkedIn) { done('bus'); addQuest('checkin', 'Check in at the Hotel Neon (Ocean Drive)'); }
  },

  // ---------- the days ----------
  setupDay(n) {
    const c = Cases.info(n), F = Game.flags;
    if (c.n === 4 && c.d === 1 && MIAMI()) {   // continued a day-11 save that was made after the bus ride
      setQuests(F.lamboSunk ? [['bed', 'Go back to the Hotel Neon (sleep)']] : F.checkedIn ? [['valet', 'Talk to the valet out front']] : [['checkin', 'Check in at the Hotel Neon (Ocean Drive)']]);
      return say([['', 'SOUTH BEACH. Dan wakes up on a bench outside the Hotel Neon. He is not sure how.']]);
    }
    if (c.n === 4 && c.d === 1) {
      setQuests([['bus', 'Catch the Greyhound to Miami (bus stop by the mailbox)']]);
      return say([['', 'A letter arrives. It is laminated.'], ['LETTER', 'CONGRATULATIONS, FLORIDA MAN OF THE YEAR! Your prize: one (1) free weekend at the HOTEL NEON, South Beach. Greyhound ticket enclosed.'],
        [PHONE_B, 'Dan. Do NOT go to Miami.'], ['DAN', 'It’s free, Brenda.'], [PHONE_B, 'Nothing in Miami is free, Dan. NOTHING.'], ['TEXT: MERLE', 'bring me back a shot glass. and a boat']]);
    }
    if (c.n === 4 && c.d === 2) {
      setQuests([['dj', 'Apologize to DJ Flamingo (Club Sinus)'], ['fishcar', 'Fish the Lambo out of the ocean (end of the pier)'], ['abuela', 'Get Abuela to be your witness (Café Abuela)']]);
      return say([['', 'SOUTH BEACH. DAY TWO.'], [PHONE_B, 'Dan. You drove a stranger’s Lamborghini into the Atlantic Ocean.'], ['DAN', 'The valet ASKED me to move it.'],
        [PHONE_B, 'It belongs to DJ Flamingo. He has eleven million followers and a lawyer named Chad. Grand Theft Lambo. Court is tomorrow.'],
        [PHONE_B, 'Apologize. Get his car back. Find witnesses. Miami witnesses. Normal ones.'], ['DAN', 'Normal. In Miami. Got it.']]);
    }
    if (c.n === 4 && c.d === 3) {
      setQuests([['raul', 'Race Raul down Ocean Drive (he’s skating the sidewalk)'], ['sheila', 'Help Sheila from Boca (condo pool)'], ['court', 'Miami-Dade Courthouse (when you’re ready)']]);
      return say([['', 'COURT DAY. MIAMI-DADE.'], [PHONE_B, 'Two more witnesses, Dan. Then court. Please be wearing pants.'], ['DAN', 'Jorts, Brenda.'], [PHONE_B, 'I KNOW.']]);
    }
    if (c.n === 5 && c.d === 1) {
      F.suit = false;
      F.balesDone = false;   // a replayed day 14 re-counts (bales already in the bag still count)
      setQuests([['bales', 'Grab the bales on the beach before the goons do (0/4)'], ['flyer', 'Return the bales to their owner (post a flyer at Café Abuela)']]);
      return say([['RADIO', '...after last night’s storm, dozens of mystery bales have washed up on South Beach. Locals call them “square grouper.” Police say: do NOT touch them.'],
        ['DAN', 'Somebody lost their stuff. That’s sad.'], ['DAN', 'I’m gonna return it. Like a good citizen. There might be a reward.'], ['', 'Two men in black suits are already jogging toward the beach.']]);
    }
    if (c.n === 5 && c.d === 2) {
      setQuests([['suit', 'Buy a pastel suit (Pastel Suits boutique)'], ['yacht', 'Get into the yacht party (marina, after 8 PM)'], ['mingle', 'Blend in with 3 party guests'], ['boss', 'Find the boss']]);
      return say([['DET. ROCKET', 'Morning, Dupree. Big night. The cartel’s throwing a yacht party at the marina.'], ['DET. TUBBS', 'You’re going in. Undercover. You need a pastel suit, a password, and confidence.'],
        ['DAN', 'I have ONE of those.'], ['DET. TUBBS', 'Which one?'], ['DAN', 'I’ll know it when I see it.'], ['DET. ROCKET', 'Password’s “medical.” Don’t blow it.']]);
    }
    if (c.n === 5 && c.d === 3) { Game.hour = 9; setQuests([['court', 'Miami-Dade Courthouse']]); return say([['', 'FINAL DAY.'], [PHONE_B, 'Dan, I’m told you arrested a pelican.'], ['DAN', 'I didn’t ARREST him, Brenda. I CAUGHT him. Rocket arrested him.'], [PHONE_B, 'Please get to the courthouse.']]); }
  },

  tick(dt) {
    const c = this.c(), F = Game.flags, D = Game.dan;
    Lambo.tick(dt);
    if (c.n === 5 && c.d === 1 && !F.balesDone) {
      const n = Game.inv.bale || 0; questText('bales', `Grab the bales on the beach before the goons do (${Math.min(4, n)}/4)`);
      if (n >= 4) { F.balesDone = true; done('bales'); toast('That’s four. Somebody’s gonna be SO grateful.'); }
      for (const gn of Game.npcs.filter(g => g.baleGrab)) {   // the goons race you for them
        const b = Game.pickups.filter(p => p.kind === 'bale').sort((p, q) => Math.hypot(p.x - gn.x, p.y - gn.y) - Math.hypot(q.x - gn.x, q.y - gn.y))[0];
        if (!b) continue; const dx = b.x - gn.x, dy = b.y - gn.y, d = Math.hypot(dx, dy) || 1;
        gn.x += dx / d * 30 * dt; gn.y += dy / d * 30 * dt; gn.dir = dirOf(dx, dy); gn.moving = true; gn.t += dt; if (Math.floor(gn.t * 6) % 2 !== gn.frame) gn.frame ^= 1;
        if (d < 8) { b.got = true; toast('A goon grabbed a bale! They’re FAST for guys in suits.'); if (Game.pickups.filter(p => p.kind === 'bale' && !p.got).length + (Game.inv.bale || 0) < 4) Game.pickups.push({ kind: 'bale', x: rnd(64, 71) * TS, y: rnd(4, 56) * TS }); }
      }
    }
    if (c.n === 4 && c.d === 3 && Race.on) Race.tick(dt);
    BoatChase.tick(dt);
  },

  // ---------- talking ----------
  talk(n) {
    const c = this.c(), F = Game.flags;
    if (n.guest !== undefined) return Party.talk(n), true;   // party guests borrow other people's looks; they're guests first
    if (n.id === 'valet' && c.n === 4 && c.d === 1 && F.checkedIn && !F.lamboSunk) return say([['VALET', 'Sir! SIR. Can you move that pink Lambo? I’m on break. Keys are in it.'], ['DAN', 'Do I LOOK like I work here?'], ['VALET', 'You look like you’d do it.'], ['DAN', '...Yeah.']]), true;
    if (n.id === 'dj') {
      if (c.n === 4 && c.d === 2 && qOpen('dj')) return say([['DJ FLAMINGO', 'YOU. You’re the guy. You put my Lambo in the OCEAN.'], ['DAN', 'In my defense, it was pink, and the ocean was right there.'],
        ['DJ FLAMINGO', 'I’ll drop the charges on ONE condition. Dance-off. Right now. On my floor.'], ['DAN', 'I’ve been training my whole life for this. Mostly at weddings.']], () => Dance.start(() => this.danceWon())), true;
      return say([['DJ FLAMINGO', pick(['Bro, the octopus video is at 90 million. I owe you. Kind of.', 'You can dance, old man. I hate that you can dance.'])]]), true;
    }
    if (n.id === 'abuela') {
      if (c.n === 4 && c.d === 2 && qOpen('abuela')) {
        if (!(Game.inv.cafecito > 0) && !F.abuelaSat) return say([['ABUELA', '¿Testigo? A witness? For YOU? Ay, mijo.'], ['ABUELA', 'First you buy a cafecito. Then you SIT. Then you listen to my story. Then we talk.'], ['ABUELA', 'The ventanita is open.', [['Buy a cafecito', () => { Game.mode = 'shop'; openShop('cafe'); return null; }], ['“How long is the story?”', () => [['ABUELA', 'Yes.']]]]]]), true;
        F.abuelaSat = true; if (Game.inv.cafecito > 0) Game.inv.cafecito--;
        return say([['', 'Dan sits. Dan sips. Abuela begins.'], ['ABUELA', 'In 1962 I came to Miami with one suitcase and a rooster named Fidel. Not THAT Fidel. A better Fidel.'],
          ['ABUELA', 'The rooster fought a man at the Orange Bowl. Won. The man is still missing a shoe.'], ['ABUELA', 'In 1980 I opened this ventanita. In 1981 I was robbed. In 1981, also, the robber was very sorry.'],
          ['ABUELA', 'In 1996 a hurricane took my roof. I kept selling coffee. Roof or no roof, Miami needs coffee.'], ['DAN', '(Dan has been sitting for 45 minutes. He has never been happier.)'],
          ['ABUELA', 'You listened to the whole thing. Nobody listens to the whole thing. I will be your witness, mijo.'], ['ABUELA', 'Also you are too skinny. Take a pastelito.']], () => { done('abuela'); giveItem('pastelito'); F.witAbuela = true; headline('FLORIDA MAN LISTENS TO ENTIRE 45-MINUTE STORY AT CAFÉ WINDOW; ABUELA "IMPRESSED"', 2); }), true;
      }
      return say([['ABUELA', pick(['¿Cafecito, mijo?', 'You look tired. Coffee. Now.', 'The rooster’s grandson still lives here. He is also named Fidel.'])], ['ABUELA', '¿Qué quieres?', [['Buy something', () => { Game.mode = 'shop'; openShop('cafe'); return null; }], ['“Just saying hola.”', () => [['ABUELA', 'Hola, mijo. Eat something.']]]]]]), true;
    }
    if (n.id === 'raul') {
      if (c.n === 4 && c.d === 3 && qOpen('raul')) return say([['RAUL', 'Yo yo yo! Florida Man! You wanna be my witness— I mean, you want ME to be YOUR witness?'], ['RAUL', 'Beat me to the Flamingo Hotel and I’ll testify. I don’t lose, bro. I’ve been skating Ocean Drive since 1987.'],
        ['DAN', '', [['“You’re on.” (race!)', () => { Race.start(); return [['RAUL', 'GO GO GO GO!']]; }], ['“Give me a minute.”', () => [['RAUL', 'Take your time, bro. I’ll be skating. Forever.']]]]]]), true;
      return say([['RAUL', pick(['Can’t stop, won’t stop, bro!', 'Ocean Drive is my runway.', 'You got a cafecito? My legs run on cafecito.'])]]), true;
    }
    if (n.id === 'sheila') {
      if (c.n === 4 && c.d === 3 && qOpen('sheila')) {
        if (F.canadianGone) return say([['SHEILA', 'You got rid of the Canadian! My HERO. I’ll testify. I’ll testify to ANYTHING.'], ['DAN', 'Just the truth.'], ['SHEILA', 'Even better.']], () => { done('sheila'); F.witSheila = true; }), true;
        return say([['SHEILA', 'You. Florida. Come here. You see that man on MY lounge chair?'], ['SHEILA', 'That’s the Canadian. Every morning he puts his towel on my chair at 5 AM. Every. Morning.'], ['SHEILA', 'Get him off my chair and I’ll be your witness, sweetie.'], ['DAN', 'Oh, I know exactly what to say to him.']]), true;
      }
      return say([['SHEILA', pick(['Sweetie, you need sunscreen. And a haircut. And a wife.', 'I’ve lived in this condo since 1991. I’ve seen THINGS.', 'The Canadian’s back. I can feel it.'])]]), true;
    }
    if (n.canadian) return say([['THE CANADIAN', 'Sorry, eh? Is this chair taken? I got here at 5.'], ['DAN', '(Maybe a firm “GIT” would help.)']]), true;
    if (n.id === 'doc') {
      if (c.n === 5 && c.d === 1 && F.flyer && !F.docTalk) return say([['DR. SNIFFLES', 'Shh. SHH. The sinus medicine? I don’t know where it comes from. Nobody knows.'], ['DAN', 'Rocket and Tubbs are standing right behind me.'], ['DR. SNIFFLES', 'Okay a yacht. It comes from a yacht. The boss throws a party at the marina tomorrow night. Password’s “medical.” I never said that.']], () => { F.docTalk = true; done('doc'); addQuest('bed', 'Go back to the hotel (sleep)'); }), true;
      return say([['DR. SNIFFLES', pick(['Welcome to the clinic. I am a doctor. It says so on my coat. In Sharpie.', 'Sinuses clogged? Soul clogged? Step into my tent.', 'My medical license is in the car. The car is in the ocean. Long story.'])], ['DR. SNIFFLES', 'Consultation?', [['See the “medicine”', () => { Game.mode = 'shop'; openShop('clinic'); return null; }], ['“I’m good, doc.”', () => [['DR. SNIFFLES', 'That’s what they all say. Then they come back.']]]]]]), true;
    }
    if (n.id === 'rocket' || n.id === 'tubbs') {
      const who = n.id === 'rocket' ? 'DET. ROCKET' : 'DET. TUBBS';
      return say([[who, pick(n.id === 'rocket' ? ['Pastel is a lifestyle, Dupree.', 'I haven’t slept since 1986.', 'You ever wonder why the pelicans in this city are so well-dressed?'] : ['Stay frosty, Dupree.', 'My partner thinks you’re an asset. I think you’re a liability. We’re both right.', 'Nice jorts. Undercover?'])]]), true;
    }
    if (n.bouncer) {
      if (Game.hour < 20) return say([['BOUNCER', 'Party’s at eight. Come back looking expensive.']]), true;
      if (!F.suit) return say([['BOUNCER', 'Jorts? JORTS? At a yacht party? Get a suit, man.']]), true;
      if (qOpen('yacht')) return say([['BOUNCER', 'Password.'], ['DAN', '', [
        ['“Medical.”', () => { done('yacht'); F.inParty = true; Party.begin(); return [['BOUNCER', '...Nice suit. Go ahead.'], ['', 'Dan boards the yacht. Everybody is wearing sunglasses at night. Everybody.']]; }],
        ['“Sinus.”', () => [['BOUNCER', 'Close. Try again.']]], ['“Swamp Lite?”', () => [['BOUNCER', 'What? No.']]]]]]), true;
      return say([['BOUNCER', 'You’re in, man. Go mingle.']]), true;
    }
    if (n.id === 'valet') return say([['VALET', pick(['Welcome to the Hotel Neon.', 'Please don’t touch the cars, sir.', 'We don’t talk about the Lambo.'])]]), true;
    return false;
  },
  danceWon() { done('dj'); F_().witDJ = true; headline('FLORIDA MAN WINS DANCE-OFF AT CLUB SINUS; DJ "SHOOK," CROWD "CONFUSED BUT INTO IT"', 4); say([['DJ FLAMINGO', '...Okay. OKAY. You can DANCE, old man.'], ['DJ FLAMINGO', 'I’ll tell the judge you’re cool. But I still need my car back.']]); },

  // ---------- doing things ----------
  interactions() {
    const D = Game.dan, c = this.c(), F = Game.flags, S_ = MSP(), list = [], near = (p, r) => p && Math.hypot(D.x - p.x, D.y - p.y) < r;
    if (!MIAMI()) {   // the bus stop on County Road 29
      if (c.n === 4 && c.d === 1 && qOpen('bus') && near({ x: 20.3 * TS, y: 43.5 * TS }, 26)) list.push({ label: 'Catch the Greyhound to Miami', fn: () => travel('miami') });
      else if (F.case5Won && near({ x: 20.3 * TS, y: 43.5 * TS }, 26)) list.push({ label: 'Greyhound', fn: () => busMenu() });
      return list;
    }
    if (D.ride) return list;
    if (c.n === 4 && c.d === 1 && !F.checkedIn && near(S_.door, 20)) list.push({ label: 'Check in at the Hotel Neon', fn: () => say([['DESK CLERK', 'Florida Man of the Year! Welcome. Your room has a view of the parking garage.'], ['DAN', 'Classy.']], () => { F.checkedIn = true; done('checkin'); addQuest('valet', 'Talk to the valet out front'); }) });
    for (const v of Game.vehicles || []) if (v.kind === 'lambo' && !F.lamboSunk && near(v, 24) && F.checkedIn) list.push({ label: 'Get in the pink Lambo', fn: () => Lambo.enter(v) });
    if (c.n === 4 && c.d === 2 && qOpen('fishcar') && near(S_.pier, 26)) list.push({ label: 'Fish for the Lambo', fn: () => Fishing.start(T.DEEP, true, 'lambo') });
    if (c.n === 4 && c.d === 3 && qDone('raul') && qDone('sheila') && qOpen('court')) { }
    if (c.n === 5 && c.d === 1 && F.balesDone && !F.flyer && near(S_.cafe, 30)) list.push({ label: 'Post a FOUND flyer at the café', fn: () => this.flyer() });
    if (c.n === 5 && c.d === 2 && F.suit && Game.hour < 20 && near(S_.door, 20)) list.push({ label: 'Nap until the party (8 PM)', fn: () => say([['', 'Dan naps in a pastel suit. He dreams of pelicans.']], () => { Game.hour = 20.1; }) });
    if (c.n === 5 && c.d === 2 && !F.suit && near(S_.boutique, 24)) list.push({ label: 'Shop at Pastel Suits', fn: () => { Game.mode = 'shop'; openShop('suits'); } });
    if (c.n === 5 && c.d === 2 && Q('mingle') && qDone('mingle') && qOpen('boss') && near(S_.boat, 60)) list.push({ label: 'Confront the boss', fn: () => Party.boss() });
    return list;
  },
  flyer() {
    const F = Game.flags;
    say([['', 'Dan tapes a flyer to the café window: “FOUND: 4 BALES OF YOUR STUFF. REWARD WELCOME. CALL DAN.” He writes his real phone number.'],
      ['', 'Eleven seconds later, a pastel convertible screeches up.'], ['DET. ROCKET', 'Miami-Dade Vice. Put the bales down, Dupree.'], ['DET. TUBBS', 'Slowly. And the flyer. Especially the flyer.'],
      ['DAN', 'I was RETURNING them!'], ['DET. ROCKET', 'To the CARTEL?'], ['DAN', 'To the OWNER. Who... is the cartel. Okay. I see it now.'],
      [PHONE_B, 'Dan. They’re charging you with possession with intent to clear sinuses.'], ['DET. TUBBS', 'Or. You help us catch the Sinus Cartel, and this goes away.'],
      ['DET. ROCKET', 'Start with the “doctor” on the beach. He knows things.']], () => {
      F.flyer = true; Game.inv.bale = 0; done('flyer'); addQuest('doc', 'Ask Dr. Sniffles where the “medicine” comes from (beach tent)');
      headline('FLORIDA MAN FINDS 4 BALES OF "SINUS MEDICINE," POSTS FLYER: "FOUND: YOUR STUFF. CALL DAN"', 6);
    });
  },
  shopExtras() { return []; },
  bought(k) { if (k === 'suit') { Game.flags.suit = true; done('suit'); toast('Dan is now wearing a pastel suit. He looks like a very tired sherbet.'); headline('FLORIDA MAN BUYS PASTEL SUIT, IMMEDIATELY SPILLS CAFECITO ON IT', 2); } },
  target(q) {
    const S_ = MSP(), who = id => Game.npcs.find(n => n.id === id);
    switch (q.id) {
      case 'bus': return MIAMI() ? null : { x: 20.3 * TS, y: 43.5 * TS };
      case 'checkin': return S_.door;
      case 'valet': return who('valet');
      case 'dj': return who('dj') || S_.club;
      case 'fishcar': return S_.pier;
      case 'abuela': return who('abuela');
      case 'raul': return who('raul');
      case 'sheila': return Game.flags.canadianGone ? who('sheila') : (Game.npcs.find(n => n.canadian) || who('sheila'));
      case 'bales': return Game.pickups.find(p => p.kind === 'bale');
      case 'flyer': return S_.cafe;
      case 'doc': return who('doc');
      case 'suit': return S_.boutique;
      case 'yacht': return Game.npcs.find(n => n.bouncer);
      case 'mingle': return Game.npcs.find(n => n.guest !== undefined && !n.talked);
      case 'boss': case 'chase': return BoatChase.boat || S_.boat;
      case 'bed': case 'sleep4': return S_.door;
      case 'court': return S_.court;
    }
    return null;
  },
};
const F_ = () => Game.flags;
