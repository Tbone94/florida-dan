// FLORIDA DAN — the week that decides whether Dan is legally a Florida Man.
'use strict';

// ---------- headlines: the game's real score ----------
const headlineQ = [];
function headline(text, allege = 5) {
  if (Game.day_.headlines.includes(text)) return;
  Game.day_.headlines.push(text); Game.headlines.push({ day: Game.day, text });
  Game.allegations = Math.min(100, Game.allegations + allege);
  headlineQ.push(text);
}

// ---------- dialogue ----------
// lines: [who, text] or [who, text, [[label, fn], ...]] for choices
function say(lines, then) {
  Game.talk = { q: lines.slice(), then: then || null, prev: Game.mode === 'talk' ? Game.talk && Game.talk.prev : Game.mode };
  Game.mode = 'talk'; showTalk();
}
function showTalk() {
  const [who, text, choices] = Game.talk.q[0];
  Game.talk.typed = 0; Game.talk.full = text; Game.talk.choices = choices || null;
  ui.talkWho.textContent = who; ui.talkWho.hidden = !who; ui.talkLine.textContent = '';
  ui.talkChoices.innerHTML = ''; ui.talk.hidden = false;
  ui.talk.classList.toggle('phone', /PHONE|TEXT|RADIO/.test(who));
}
function renderChoices() {
  const ch = Game.talk.choices; if (!ch || ui.talkChoices.childElementCount) return;
  ch.forEach(([label, fn], i) => {
    const b = document.createElement('button'); b.className = 'choice'; b.textContent = `${i + 1}. ${label}`;
    b.addEventListener('click', e => { e.stopPropagation(); pickChoice(i); }); ui.talkChoices.append(b);
  });
}
function pickChoice(i) { const ch = Game.talk.choices; if (!ch || !ch[i]) return; Sound.play('pickup'); const fn = ch[i][1]; Game.talk.choices = null; advanceTalk(fn); }
function updateTalk(dt) {
  const T_ = Game.talk;
  if (T_.typed < T_.full.length) {
    const before = Math.floor(T_.typed); T_.typed += dt * (Game.fx.powder > 0 ? 140 : 55);
    if (Math.floor(T_.typed) !== before && Math.floor(T_.typed) % 3 === 0) Sound.play('talk');
    ui.talkLine.textContent = T_.full.slice(0, Math.floor(T_.typed));
    if (Input.tapped('a')) { T_.typed = T_.full.length; ui.talkLine.textContent = T_.full; }
    return;
  }
  ui.talkLine.textContent = T_.full;
  if (T_.choices) { renderChoices(); for (let i = 0; i < T_.choices.length; i++) if (Input.tapped('s' + (i + 1))) pickChoice(i); return; }
  if (Input.tapped('a')) advanceTalk();
}
function advanceTalk(choiceFn) {
  const T_ = Game.talk; T_.q.shift();
  if (choiceFn) { const extra = choiceFn(); if (Game.mode === 'shop') { ui.talk.hidden = true; Game.talk = null; return; } if (Array.isArray(extra)) T_.q.unshift(...extra); }
  if (Game.talk !== T_) return;                       // the choice started a new conversation
  if (T_.q.length) return showTalk();
  ui.talk.hidden = true; Game.mode = T_.prev === 'talk' ? 'play' : (T_.prev || 'play'); Game.talk = null;
  if (T_.then) T_.then();
}

let toastT = 0;
function toast(msg, secs = 3) { ui.toast.textContent = msg; ui.toast.hidden = false; toastT = secs; }

// ---------- quests ----------
function Q(id) { return Game.quests.find(q => q.id === id); }
function done(id) { const q = Q(id); if (q && !q.done) { q.done = true; Sound.play('catch'); toast('✓ ' + q.text.replace(/\s*\(.*\)$/, '')); } renderQuests(); }
function setQuests(list) { Game.quests = list.map(([id, text, opt]) => ({ id, text, opt: !!opt, done: false })); renderQuests(); }
function addQuest(id, text, opt, before) {
  if (Q(id)) return; const q = { id, text, opt: !!opt, done: false }, i = before ? Game.quests.findIndex(x => x.id === before) : -1;
  if (i >= 0) Game.quests.splice(i, 0, q); else Game.quests.push(q); renderQuests();
}
const currentQuest = () => Game.quests.find(q => !q.done && !q.opt);
// where the objective arrow points
function questTarget(q) {
  const S_ = World.spots, who = id => Game.npcs.find(n => n.id === id);
  switch (q && q.id) {
    case 'boat': return Game.dan.ride === 'boat' ? null : Game.boat;
    case 'fish': return Game.dan.ride === 'boat' ? null : S_.dockEnd;
    case 'merle': case 'merle2': case 'party': return who('merle') || S_.merle;
    case 'sleep1': case 'sleep2': case 'board': return S_.door;
    case 'darlene': case 'stock': return who('darlene') || S_.darlene;
    case 'ice': return S_.icemachine;
    case 'rhonda': return who('rhonda') || S_.rhonda;
    case 'sign': return { x: S_.door.x - 34, y: S_.door.y };
    case 'plywood': return { x: 37.7 * TS, y: 40.6 * TS };
    case 'manny': return Game.animals.find(a => a.spirit);
    case 'court': return S_.court;
  }
  return null;
}
function questText(id, text) { const q = Q(id); if (q && q.text !== text) { q.text = text; renderQuests(); } }

const PHONE_B = 'PHONE: BRENDA (PUBLIC DEFENDER)';
// each tourist question comes with its own answers
const TOURIST_TALKS = [
  [['TOURIST', 'Oh my gosh, are you a REAL Florida Man? Can I get a selfie?'], ['DAN', '', [
    ['Pose for the selfie', () => { Game.chill = Math.min(100, Game.chill + 8); return [['', '*click* Dan’s face will be on a fridge in Ohio forever.']]; }],
    ['“I’m NOT a Florida Man.”', () => [['TOURIST', 'That’s EXACTLY what a Florida Man would say!!']]],
    ['Offer them a roller dog', () => [['TOURIST', 'I... I’m going to go.']]]]]],
  [['TOURIST', 'Excuse me, which way to Disney?'], ['DAN', '', [
    ['Point at the swamp', () => [['TOURIST', 'Through... the alligators?'], ['DAN', 'Shortcut.']]],
    ['“Take a left at the gator. Keep goin’ till you regret it.”', () => [['TOURIST', 'Thank you so much!'], ['', 'The tourist heads confidently toward the gator.']]],
    ['“Disney? In THIS economy?”', () => [['TOURIST', '...Honestly? Fair.']]]]]],
  [['TOURIST', 'Is it safe to swim here?'], ['DAN', '', [
    ['“Totally.”', () => [['TOURIST', 'Great!'], ['DAN', '(It is not.)']]],
    ['“Only if you’re faster than Chuck.”', () => [['TOURIST', 'Who’s Chuck?'], ['DAN', 'You’ll know.']]],
    ['Point at the nearest gator', () => [['TOURIST', '...I’m gonna stay in the rental car.']]]]]],
  [['TOURIST', 'What IS that smell?'], ['DAN', '', [
    ['“That’s the swamp, bud.”', () => [['TOURIST', 'Does it always smell like that?'], ['DAN', 'Only on days that end in Y.']]],
    ['“That’s me.”', () => [['TOURIST', '...Oh.']]],
    ['“Freedom.”', () => [['TOURIST', 'It smells like feet.'], ['DAN', 'Same thing.']]]]]],
];
const Story = {
  setupDay(n) {
    const F = Game.flags;
    Game.cold = false; Game.storm = 0;
    if (n === 1) {
      setQuests([['boat', 'Take the boat out'], ['fish', 'Catch 3 fish (0/3)'], ['merle', 'Bring the fish to Merle'], ['chuck', 'Yell GIT at Chuck', true]]);
      say([
        [PHONE_B, 'Dan. It’s Brenda. Your hearing is FRIDAY.'], ['DAN', 'Hey Brenda. Is this about the flamingo?'], [PHONE_B, 'It’s about the flamingo, Dan.'],
        ['DAN', 'That flamingo came at ME.'], [PHONE_B, 'It was a LAWN flamingo. It was plastic. You fought it in the Gulp-N-Go parking lot for forty minutes.'],
        [PHONE_B, 'The complaint literally says “defendant is a Florida Man.” Four days, Dan. No headlines. Act. NORMAL.'],
        ['DAN', 'I’m not a Florida Man, Brenda. I’m a man. Who lives in Florida. Big difference.'],
        ['TEXT: MERLE', 'fish fry 2nite. bring 3 fish. NOT gar. last time was a whole thing'], ['TEXT: MERLE', 'also u still owe me $40'],
      ]);
    }
    if (n === 2) {
      F.stopSignOnRoof = true; Game.cold = true;
      setQuests([['darlene', 'Get Darlene to sign'], ['rhonda', 'Get Deputy Rhonda to sign'], ['merle2', 'Get Merle to sign'], ['python', 'Python bounty: $25/ft', true]]);
      say([
        ['', 'TUESDAY. 6:00 AM. 47°F. Florida is FREEZING. The iguanas are falling out of the trees.'], ['DAN', 'My nipples could cut glass.'],
        [PHONE_B, 'The judge wants CHARACTER WITNESSES. Three signatures. Upstanding members of the community.'], ['DAN', 'I know like four people, Brenda.'],
        [PHONE_B, 'Then get three of them.'], ['DAN', '...Hey, why is there a stop sign on my roof?'], [PHONE_B, 'I did not hear that. I am hanging up. Goodbye.'],
      ]);
    }
    if (n === 3) {
      setQuests([['plywood', 'Grab plywood from the dumpster'], ['board', 'Board up the cabin'], ['stock', 'Get 6 beers (0/6)'], ['party', 'Merle’s party (after 4 PM)']]);
      say([
        ['RADIO', '...Hurricane Wanda, Category Two, making landfall tonight. Residents are urged to evacuate, or at minimum, to not do anything stupid.'], ['DAN', 'Hurricane party.'],
        [PHONE_B, 'Dan. I can hear you thinking “hurricane party.” STAY. INSIDE.'],
        ['TEXT: MERLE', 'HURRICANE PARTY @ MINE 2NITE. BYOB. bring plywood. or dont. we’ll see what happens'], ['TEXT: MERLE', 'made a gumbo'],
      ]);
    }
    if (n === 4) {
      Game.hour = 8;
      setQuests([['court', 'Get to court by 10 AM'], ['pants', 'Find real pants', true]]);
      say([
        ['', 'THURSDAY IS A BLUR. NOBODY TALKS ABOUT THURSDAY.'], ['', 'FRIDAY. 8:00 AM. COURT AT 10.'],
        [PHONE_B, 'County Courthouse, east end of 29. Ten AM. Wear PANTS, Dan. Real ones.'], ['DAN', 'Jorts are pants.'], [PHONE_B, 'Jorts are HALF pants.'],
      ]);
    }
    if (n >= 5) {
      setQuests([['free', 'Free roam. Make headlines.', true]]);
      say([['', `DAY ${n}. The allegations are behind him. The swamp is ahead of him.`], ['DAN', pick(['Another beautiful day in paradise.', 'My head. My whole head.', 'Let’s make some news.'])]]);
    }
  },

  tick(dt) {
    const F = Game.flags, D = Game.dan, h = Game.hour;
    if (Game.day === 1) {
      if (D.ride === 'boat') done('boat');
      const n = Game.catchBag.filter(f => !f.junk).length;
      if (!Q('fish').done) { questText('fish', `Catch 3 fish (${Math.min(3, n)}/3)`); if (n >= 3) done('fish'); }
    }
    if (Game.day === 2 && Game.cold && h > 11) { Game.cold = false; toast('It warmed up to 61°. The iguanas have stopped falling. Mostly.'); }
    if (Game.day === 2 && !F.bday2 && Q('darlene').done && Q('rhonda').done && Q('merle2').done) {
      F.bday2 = true; addQuest('sleep2', 'Go home to bed');
      say([[PHONE_B, 'Three signatures?! Dan, I am... proud? Is this pride? It feels like indigestion.'], [PHONE_B, 'Tomorrow there’s a hurricane coming. You will STAY INSIDE.'], ['DAN', 'Totally. Yep. Inside. Hundred percent.']]);
    }
    if (Game.day === 3) {
      questText('stock', `Get 6 beers (${Math.min(6, Game.inv.beer)}/6)`); if (Game.inv.beer >= 6) done('stock');
      Game.storm = h < 13 ? 0 : clamp((h - 13) / 4, 0, 1);
      if (h > 16 && !F.partyNag) { F.partyNag = true; toast('TEXT FROM MERLE: WHERE U AT. THE GUMBO IS READY. WANDA IS HERE'); }
    }
    if (Game.day === 4) {
      if (h >= 10 && !F.late) { F.late = true; say([[PHONE_B, 'DAN. WHERE ARE YOU. The judge is doing a crossword. HE’S ANGRY-CROSSWORDING.'], ['DAN', 'On my way! Traffic!'], [PHONE_B, 'You live on a SWAMP, Dan.']]); }
    }
    if (Game.cold && Math.random() < dt * .5) {                                 // iguana rain
      const palm = World.props.find(p => p.kind === 'palm' && Math.hypot(p.x - D.x, p.y - D.y) < 34);
      if (palm) Game.animals.push(makeCritter('iguana', D.x + rnd(-8, 8), D.y + rnd(-3, 3), { falling: true, z: 60, vz: 0 }));
    }
    if (Game.urgent > 0) {
      Game.urgent -= dt;
      if (Game.urgent <= 0) { Game.urgent = 0; Game.shake = 6; Sound.play('fail'); headline(`FLORIDA MAN HAS "INCIDENT" ${World.region(D.x, D.y) === 'mainland' ? 'IN GAS STATION PARKING LOT' : 'IN HIS OWN SWAMP'}, BLAMES ROLLER DOG`, 6); say([['', 'Dan did not make it.'], ['DAN', '...We don’t talk about this. Ever.']]); }
    }
  },

  // --- people ---
  talk(n) {
    const F = Game.flags, day = Game.day;
    if (n.id === 'merle') return this.merle();
    if (n.id === 'darlene') return this.darlene();
    if (n.id === 'rhonda') return this.rhonda();
    if (n.id === 'tourist') return say(pick(TOURIST_TALKS));
  },
  merle() {
    const F = Game.flags, day = Game.day, real = Game.catchBag.filter(f => !f.junk);
    if (day === 1 && !F.fry) {
      if (real.length < 3) return say([['MERLE', real.length ? `That’s ${real.length}. I said THREE, Danny. Three is a number.` : 'Danny boy! Where’s my fish? Fryer’s hot. Well. It’s gettin’ there.'], ['MERLE', 'And watch out for Chuck. He’s been in a MOOD.']]);
      const gar = real.some(f => f.id === 'gar');
      return say([['MERLE', `HOT DANG! ${real.length} fish!`], ...(gar ? [['MERLE', '...Is that a GAR, Danny? I said NO GAR. You KNOW what happened last time.']] : []),
        ['MERLE', 'Now watch this. I got a frozen turkey too. Straight into the fryer. Frozen. Like God intended.'], ['DAN', 'Merle, I really don’t think you’re supposed to—'], ['', '*FWOOOOOOOOSH*']], () => {
        explode(World.spots.merle.x - 44, World.spots.merle.y + 10); for (let i = 0; i < 30; i++) Game.parts.push({ kind: 'fire', x: World.spots.merle.x - 44 + rnd(-10, 10), y: World.spots.merle.y + 6, vx: rnd(-8, 8), vy: rnd(-40, -10), life: rnd(1, 3) });
        F.fry = true; Game.catchBag = Game.catchBag.filter(f => f.junk); Game.inv.fish = 0;
        headline('FLORIDA MAN’S COUSIN DEEP-FRIES FROZEN TURKEY, SUMMONS FIRE DEPARTMENT; FLORIDA MAN SAYS HE "WAS JUST STANDING THERE"', 8);
        say([['MERLE', '...Worth it.'], ['MERLE', 'Here. Found this in the bottom of the fryer. It’s yours now. Don’t ask.'], ['', 'Got: “Sinus Medicine” ×1 (slot 5)'],
          ['DAN', 'It’s for my sinuses.'], ['MERLE', 'I didn’t ask, Danny.'], ['MERLE', 'Anyway you still owe me forty bucks.']], () => { giveItem('powder'); done('merle'); addQuest('sleep1', 'Go home to bed'); });
      });
    }
    if (day === 2 && !Q('merle2').done) {
      if (Game.money >= 40) return say([['MERLE', 'You got my forty?'], ['DAN', '', [['Pay Merle $40', () => { Game.money -= 40; Sound.play('cash'); done('merle2'); return [['MERLE', 'Pleasure doin’ business. I’ll sign it “Merle Haggard.” He’s a real guy. It’ll help.'], ['DAN', 'Merle, that’s a dead country singer.'], ['MERLE', 'Then he can’t deny it.']]; }], ['“What forty?”', () => [['MERLE', 'Don’t you “what forty” me, Daniel Wayne.']]]]]]);
      return say([['MERLE', 'Sign your paper? Sure. Soon as I see my forty dollars, Danny.'], ['MERLE', 'Sell some fish to Darlene. Bag some pythons for Rhonda. Scratch some tickets. I don’t care. Forty.'], ['DAN', `I got $${Game.money}.`], ['MERLE', 'Then you got ' + (40 - Game.money) + ' problems.']]);
    }
    if (day === 3 && Game.hour >= 16 && !F.party) return this.party();
    if (day === 3) return say([['MERLE', 'Party don’t start till 4, Danny. Wanda’s fashionably late.'], ['MERLE', 'Bring beer. Six. Minimum. It’s a CATEGORY TWO.']]);
    return say([['MERLE', pick(['You seen Chuck? He was eyein’ my flamingo again.', 'Don’t make it weird, Danny. Go fish.', 'I’m thinkin’ about gettin’ a second trailer. For my other trailer.', 'Did you know gators got weak jaw-openin’ muscles? You can hold ’em shut with one hand. Or two. I used two.'])]]);
  },
  darlene() {
    const F = Game.flags;
    const shop = () => { Game.mode = 'shop'; openShop(); return null; };
    const sell = () => { const n = Game.catchBag.filter(f => !f.junk && !f.legend).length; if (!n) return [['DARLENE', 'You ain’t got any fish, hon.']]; Game.money += n * 4; Game.catchBag = Game.catchBag.filter(f => f.junk || f.legend); Game.inv.fish = Game.catchBag.filter(f => !f.junk).length; Sound.play('cash'); return [['DARLENE', `${n} fish, $4 each. That’s $${n * 4}. Don’t tell the health department.`]]; };
    const opts = [['Shop', shop], ['Sell fish ($4 each)', sell], ['Leave', () => [['DARLENE', 'Bye, sugar. Don’t die.']]]];
    if (Game.day === 2 && !Q('darlene').done) {
      if (F.raccoonOut) { done('darlene'); return say([['DARLENE', 'You got it out! With your FACE! You’re a hero, Dan. A disgusting hero.'], ['', 'Darlene signs. Witness 1 of 3.'], ['DARLENE', 'Now what can I get ya?', opts]]); }
      return say([['DARLENE', 'Dan, baby, there is a RACCOON in my ice machine. Been in there since Sunday. He’s got a whole life in there now.'], ['DARLENE', 'Get him out and I’ll sign whatever you want. Anything else?', opts]], () => addQuest('ice', 'Get the raccoon out of the ice machine', false, 'darlene'));
    }
    if (Game.day === 4 && !Q('pants').done) opts.splice(2, 0, ['Buy “Formal Jorts” ($8)', () => { if (Game.money < 8) return [['DARLENE', 'They’re eight dollars, Dan.']]; Game.money -= 8; Game.flags.pants = true; done('pants'); return [['DARLENE', 'Formal Jorts. Black denim. For weddings, funerals, and arraignments.'], ['DAN', 'I feel like a lawyer.']]; }]);
    return say([['DARLENE', pick(['Welcome to the Gulp-N-Go, where the dogs are always rollin’.', 'Hey Dan. You look like hell. What’ll it be?', 'Pump 2 is broke. Pump 1 is haunted. What do you need?']), opts]]);
  },
  rhonda() {
    const F = Game.flags;
    const bounty = () => { const n = Game.pythons.length; if (!n) return [['RHONDA', 'State pays $25 a foot for Burmese pythons. Out in the Glades, west side. Bring ’em to me. Alive-ish.']]; const ft = Game.pythons.reduce((a, b) => a + b, 0), cash = Math.round(ft * 25); Game.money += cash; Game.pythons = []; Sound.play('cash'); done('python'); if (ft > 30) headline(`FLORIDA MAN TURNS IN ${Math.round(ft)} FEET OF PYTHON, SAYS HE "JUST GRABBED 'EM"`, 4); return [['RHONDA', `${ft.toFixed(1)} feet of python. That’s $${cash}. The Everglades thanks you, Dan. I do not.`]]; };
    if (Game.day === 2 && !Q('rhonda').done) {
      if (Game.inv.sign) { Game.inv.sign = 0; F.stopSignOnRoof = false; done('rhonda'); return say([['RHONDA', '...That’s my stop sign.'], ['DAN', 'Found it. On a roof. Wild, right?'], ['RHONDA', 'I will sign that you RETURNED it. That is ALL I am signing, Dan.'], ['', 'Witness 2 of 3. Technically.']]); }
      return say([['RHONDA', 'Morning, Dan. Somebody stole the stop sign off 29 and Fifth.'], ['RHONDA', 'You wouldn’t know anything about that.', [['“Absolutely not.”', () => [['RHONDA', 'Uh huh.']]], ['“...Define ‘stole.’”', () => [['RHONDA', 'I’m gonna pretend you said no.']]], ['Offer her a Swamp Lite', () => [['RHONDA', 'I am IN UNIFORM, Dan.']]]]],
        ['RHONDA', 'Bring it back and I’ll THINK about signing your little paper. Also—'], ...bounty()], () => addQuest('sign', 'Grab the stop sign off your roof', false, 'rhonda'));
    }
    return say([['RHONDA', pick(['Dan.', 'Keep it under 40 on that cooler, Dan.', 'I’m watchin’ you, Dan.'])], ['RHONDA', 'Something you need?', [['Turn in pythons', bounty], ['Nothing, officer', () => [['RHONDA', 'That’s what I thought.']]]]]]);
  },

  party() {
    const F = Game.flags; F.party = true; done('party');
    say([['MERLE', 'WANDA! WANDA! WANDA!'], ['MERLE', 'Danny! You made it! Here — gumbo. Secret ingredient’s from the cow field.'],
      ['DAN', '', [['Eat the gumbo', () => [['DAN', '*slurp* ...Merle, what’s in this?'], ['MERLE', 'Forty percent mushrooms.']]], ['“I’m good, thanks.”', () => [['MERLE', 'More for Chuck then.'], ['', 'Dan drinks a Swamp Lite. The Swamp Lite was ALSO forty percent mushrooms. Merle is a menace.']]]]],
      ['', 'Wanda arrives. The wind screams. Somewhere, a lawn flamingo achieves flight.'], ['???', 'Daaaaniel... come to the waaater...']], () => {
      Game.fx.shroom = 120; Sound.play('trip'); Game.flags.manny = true; addQuest('manny', '??? Follow the voice to the water');
      Game.animals.push(makeCritter('manatee', World.spots.merle.x - 60, World.spots.merle.y + 70, { spirit: true }));
    });
  },
  manny() {
    say([['MANNY THE MANATEE SPIRIT', 'Daaaaaniel.'], ['DAN', '...Mom?'], ['MANNY', 'I am Manny. Sea cow of truth. Guardian of the Warm Power Plant Outflow.'],
      ['MANNY', 'You seek to escape the allegations, Daniel.'], ['MANNY', 'But you cannot escape what you ARE.'], ['DAN', 'A man?'], ['MANNY', 'A FLORIDA man.'],
      ['DAN', 'Don’t you say that. Don’t you DARE say that to me.'], ['MANNY', 'On Friday, the beast will come for you. When it does... do not run.'],
      ['MANNY', 'Hold its jaws shut, Daniel. Their jaw-opening muscles are weak. This is science.'],
      ['DAN', '', [['“Can I ride you?”', () => [['MANNY', 'Touching a manatee is a felony in this state, Daniel.'], ['DAN', '...'], ['', 'Dan rides the manatee.']]], ['“What’s the meaning of life?”', () => [['MANNY', 'Lettuce. Warm water. Not getting hit by boats.'], ['DAN', 'Deep.'], ['', 'Dan rides the manatee anyway.']]]]],
    ], () => {
      done('manny'); Game.flash = 1;
      headline('FLORIDA MAN FOUND RIDING MANATEE DURING HURRICANE; "IT WAS SPIRITUAL," HE TELLS DEPUTIES', 10);
      Game.animals = Game.animals.filter(a => !a.spirit);
      endDay('manny');
    });
  },

  // --- world objects ---
  interactions() {
    const D = Game.dan, F = Game.flags, S_ = World.spots, list = [];
    const near = (p, r) => Math.hypot(D.x - p.x, D.y - p.y) < r;
    if (D.ride) return list;
    if (near(S_.door, 18)) {
      if (Game.day === 3 && Game.inv.plywood >= 2 && !F.boarded) list.push({ label: 'Board up the windows', fn: () => { Game.inv.plywood -= 2; F.boarded = true; Sound.play('chomp'); done('board'); toast('Boarded. Dan used the stop sign as a third board. Rhonda will never know.'); } });
      else list.push({ label: 'Hit the hay', fn: () => sleep() });
    }
    if (F.stopSignOnRoof && !Game.inv.sign && near({ x: S_.door.x - 34, y: S_.door.y }, 18)) list.push({ label: 'Climb the ladder to the roof', fn: () => say([['', 'Dan climbs onto the roof. He grabs the stop sign.'], ['', 'Dan falls off the roof.'], ['DAN', 'I MEANT to do that.']], () => { Game.inv.sign = 1; F.stopSignOnRoof = false; hurtDan(5); done('sign'); headline('FLORIDA MAN FALLS OFF ROOF WHILE RETRIEVING STOLEN STOP SIGN HE "DID NOT STEAL"', 5); }) });
    if (Game.day === 2 && !F.raccoonOut && near(S_.icemachine, 20)) list.push({ label: 'Reach into the ice machine', fn: () => Minigame.raccoon() });
    if (near({ x: 37.7 * TS, y: 40.6 * TS }, 20)) list.push({ label: 'Dig in the dumpster', fn: () => {
      if (Game.day === 3 && !F.plywood) { F.plywood = true; Game.inv.plywood = 2; done('plywood'); return say([['', 'Dan finds two sheets of plywood.'], ['', 'He also finds a man named Kevin, asleep.'], ['KEVIN', 'Five more minutes.'], ['', 'Dan lets Kevin sleep.']]); }
      if (!Game.day_.dumpster) { Game.day_.dumpster = true; const k = pick(['hotdog', 'scratch', 'beer', 'cig']); giveItem(k); return toast(`Dumpster had a ${ITEMS[k].name}. Still good. Probably.`); }
      toast(pick(['Nothing but regret in there.', 'Kevin says hi.', 'A raccoon hissed at you. Fair.']));
    } });
    if (Game.urgent > 0 && (near({ x: 25.8 * TS, y: 43.3 * TS }, 20) || near(S_.door, 20))) list.push({ label: 'USE THE TOILET', fn: () => { Game.urgent = 0; Sound.play('splash'); toast('...Made it. Dan has never been closer to God.'); Game.chill = 100; } });
    if (near(S_.court, 22)) list.push({ label: Game.day === 4 ? 'Enter the courthouse' : 'Courthouse (closed)', fn: () => { if (Game.day === 4) Court.start(); else toast(Game.day > 4 ? 'Dan waves at the courthouse. The courthouse does not wave back.' : 'Not till Friday. Dan is in no hurry.'); } });
    for (const p of Game.pickups) if (p.kind === 'cowpie' && near(p, 14)) list.push({ label: 'Pick the mushroom off the cow pie', fn: () => { p.got = true; giveItem('shroom'); toast(pick(['Harvested one (1) cow pie mushroom. Organic.', 'Dan wipes it on his tank top. Clean enough.'])); } });
    return list;
  },

  event(name) {
    if (name === 'shroom' && Game.day !== 3) {
      if (!Game.animals.some(a => a.spirit) && Game.flags.mannyMet !== true && Math.random() < .5) toast('...something is glowing out in the water.');
    }
    if (name === 'caught') { const f = Game.catchBag[Game.catchBag.length - 1]; if (f && f.id === 'cart') headline('FLORIDA MAN RETURNS SHOPPING CART VIA SWAMP; STORE "DOES NOT WANT IT"', 3); if (f && f.legend) headline('FLORIDA MAN LANDS LEGENDARY “BIG RONNIE,” WEEPS OPENLY AT DOCK', 5); }
  },
  hitNPC(n) {
    n.scared = 2;
    if (n.id === 'rhonda') { headline('FLORIDA MAN HITS DEPUTY WITH BEER CAN, SAYS IT WAS "A GREETING"', 10); say([['RHONDA', 'DID YOU JUST THROW A CAN AT ME?'], ['DAN', 'It’s how we say hi in my family.'], ['RHONDA', 'I am WRITING THAT DOWN.']]); }
    else if (n.id === 'tourist') { headline('FLORIDA MAN THROWS EMPTY AT TOURIST, CALLS IT "A WARM WELCOME"', 5); toast('The tourist screams in Midwestern.'); }
    else toast(`${n.name}: “DAN!”`);
  },
};

function sleep() {
  const F = Game.flags;
  if (Game.day === 1 && !F.fry) return toast('Can’t sleep. Merle’s fish fry. Three fish. It’s the only thing Dan’s ever been asked to do.');
  if (Game.day === 2 && !F.bday2 && Game.hour < 19) return toast('Still need those three signatures. Brenda’s counting on you. God help her.');
  if (Game.day === 3 && !F.party) return toast('Can’t sleep through a hurricane PARTY. That’s un-American.');
  if (Game.day === 4) return toast('Court. Today. The courthouse. East end of 29. GO.');
  if (Game.hour < 17 && Game.day >= 5) return toast('Too early. Even for Dan.');
  say([['DAN', pick(['Welp. That’s a day.', 'Nite, swamp.', 'Another one for the books. The police books.'])]], () => endDay('sleep'));
}

function endDay(reason) {
  Game.mode = 'gazette';
  Gazette.show(reason);
}

const Gazette = {
  show(reason) {
    const L = Game.day_, hs = L.headlines.slice();
    if (!hs.length) hs.push(pick(['FLORIDA MAN HAS NORMAL DAY; EXPERTS BAFFLED', 'LOCAL MAN DOES NOTHING NEWSWORTHY, NEIGHBORS "CONCERNED"']));
    const days = ['', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'FRIDAY'];
    $('gzMeta').textContent = `${days[Game.day] || 'DAY ' + Game.day} EDITION · 50¢ · COLLIER COUNTY`;
    $('gzHead').textContent = hs[hs.length - 1];
    const more = $('gzMore'); more.innerHTML = '';
    hs.slice(0, -1).reverse().forEach(h => { const li = document.createElement('li'); li.textContent = h; more.append(li); });
    const bl = $('gzBlotter'); bl.innerHTML = '';
    const caught = L.caught.map(f => `${f.name} ${f.lbs} lb`).join(', ') || 'nothing';
    [`Fish: ${caught}`, `Gator bites: ${L.bites}`, `Beers: ${L.beers} · Cigs: ${L.cigs}${L.joints ? ` · Doobies: ${L.joints}` : ''}${L.shrooms ? ` · Shrooms: ${L.shrooms}` : ''}${L.powder ? ` · “Sinus meds”: ${L.powder}` : ''}`,
      `Times yelled GIT: ${L.gits}`, `Wallet: $${Game.money}`].forEach(s => { const li = document.createElement('li'); li.textContent = s; bl.append(li); });
    $('gzMeter').style.width = Game.allegations + '%';
    $('gzMeterLabel').textContent = `${Game.allegations}% FLORIDA MAN`;
    ui.talk.hidden = true; showHud(false);
    ui.gazette.hidden = false; $('nextBtn').focus();
    Sound.play('headline');
  },
};
