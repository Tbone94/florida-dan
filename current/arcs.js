// FLORIDA DAN — neighbor stories. Every local has a short chain of chaotic little quests that unlocks as Dan
// clears cases. A pink ! over someone = they've got a story for you. Finishing a chapter pays, and the neighbor
// goes on record for Dan (a character reference knocks the Florida Man meter down).
'use strict';
const AS = () => World.spots;
const arcNear = (p, r) => p && Math.hypot(Game.dan.x - p.x, Game.dan.y - p.y) < r;
const who = id => Game.npcs.find(n => n.id === id);
const bigFish = lbs => Game.catchBag.find(f => !f.junk && !f.legend && f.lbs >= lbs);
const takeFish = f => { Game.catchBag.splice(Game.catchBag.indexOf(f), 1); Game.inv.fish = Game.catchBag.filter(x => !x.junk).length; };
const SWAMP = () => !MIAMI() && !DAYTONA() && !KEYS();

// chapter: { gate, where ('swamp'|'miami'), ask: lines, text, target(), ready()/take() (bring it back), or act: { at(), when(), wait, label, run(finish) }, pay(): lines, cash, ref }
const ARCS = {
  merle: [
    { gate: () => Game.day >= 2, where: 'swamp', text: 'Merle’s date: bring him a 6 lb+ fish to impress her',
      ask: [['MERLE', 'Danny. Sit down. I got a DATE.'], ['DAN', 'With who?'], ['MERLE', '...Darlene. From the Gulp-N-Go.'], ['DAN', 'MERLE.'], ['MERLE', 'I need a gift. A real one. A fish. A BIG fish. Six pounds or better. That’s how my daddy did it.']],
      target: () => bigFish(6) ? who('merle') : AS().dockEnd, ready: () => !!bigFish(6), take: () => takeFish(bigFish(6)),
      pay: () => [['MERLE', 'Look at her. Look at the SIZE of her. Darlene’s gonna cry.'], ['DAN', 'It’s a fish, Merle.'], ['MERLE', 'It’s a STATEMENT, Danny.']], cash: 25, ref: 4 },
    { gate: F => F.acquitted, where: 'swamp', text: 'Wingman Merle’s date at the Leaky Tiki (after 6 PM, it’s on the island)',
      ask: [['MERLE', 'Second date. Leaky Tiki. Tonight. I need a wingman.'], ['DAN', 'I’m the BEST wingman.'], ['MERLE', 'You are the ONLY wingman. Just... don’t tell the flamingo story.']],
      act: { at: () => AS().tiki, when: () => Game.hour >= 18, wait: 'Wingman Merle (after 6 PM)', label: 'Wingman Merle’s date', run: fin => say([
        ['', 'Merle and Darlene share a basket of fried pickles. It is very romantic. Dan pulls up a stool.'], ['DARLENE', 'So, Dan. Merle says you two go way back.'],
        ['DAN', '', [
          ['Tell the flamingo story', () => [['DAN', 'So it’s 3 AM, right, and the flamingo’s wearing MY hat—'], ['MERLE', 'DANNY.'], ['DARLENE', '...Wait. Keep going.'], ['', 'Darlene laughs so hard she snorts. Merle is in love.']]],
          ['Hype Merle up', () => [['DAN', 'Merle once fought a gator for a bag of Funyuns. And won. And shared.'], ['DARLENE', 'You shared your Funyuns?'], ['MERLE', '...Only with the gator.'], ['', 'Darlene puts her hand on Merle’s hand.']]],
          ['Order a round for the whole bar', () => { Game.money = Math.max(0, Game.money - 10); return [['SKEETER', 'ROUND ON DAN!'], ['', 'The bar cheers. The bar is four guys and a pelican. The pelican cheers loudest.']]; }]]],
        ['', 'A gator surfaces under the deck, looks at the lovebirds, and sinks back down. Even he knows.']], () => { headline('FLORIDA MAN WINGMANS AT SWAMP BAR; DATE GOES "SHOCKINGLY WELL"', 3); fin(); }) },
      pay: () => [['MERLE', 'Danny. She held my hand. With the pickle hand. I’m never washin’ it.']], cash: 30, ref: 5 },
    { gate: F => F.case2Won, where: 'swamp', text: 'Merle’s proposal: bring 3 Freedom Rockets to the fireworks stand after 7 PM',
      ask: [['MERLE', 'I’m gonna do it, Danny. I’m gonna ask her.'], ['DAN', 'MERLE!'], ['MERLE', 'Fireworks stand. Tonight. When she says yes, you light three Freedom Rockets. When she says no, you light three Freedom Rockets and I run.']],
      act: { at: () => AS().fireworks, when: () => Game.hour >= 19 && (Game.inv.firework || 0) >= 3, wait: () => (Game.inv.firework || 0) < 3 ? 'Proposal rockets (need 3 Freedom Rockets)' : 'Proposal rockets (after 7 PM)', label: 'Light the proposal rockets', run: fin => {
        Game.inv.firework -= 3; const S = AS().fireworks, keep = ['merle', 'darlene'].map(id => who(id)).filter(Boolean).map(n => ({ n, x: n.x, y: n.y, hx: n.hx, hy: n.hy }));
        Scene.play([SC.cam(S.x, S.y - 14, 1.5, .7), SC.place('merle', S.x - 12, S.y + 22, 'right'), SC.place('darlene', S.x + 12, S.y + 22, 'left'), SC.walk('dan', S.x - 30, S.y + 30, 50), SC.face('dan', 'right'),
          SC.emote('merle', '♥', 1.1, PAL.hat), SC.say([['MERLE', '(down on one knee; his knee makes a sound) Darlene. You’re the best thing that ever happened at a gas station.'], ['DARLENE', '...Yes. YES, you idiot.']]),
          SC.all([SC.emote('merle', '♥', 1.4, PAL.hat), SC.emote('darlene', '♥', 1.4, PAL.hat)]), SC.line('dan', 'HIT IT!', .8),
          ...SC_ROCKET(S.x - 24, S.y + 10), SC.wait(.3), ...SC_ROCKET(S.x + 26, S.y + 10), SC.wait(.3),
          SC.fly(ROCKET, S.x - 30, S.y + 10, S.x + 4, S.y - 8, .4, 20, true), SC.fx(() => { explode(S.x, S.y - 12); Game.shake = 8; Game.flash = .7; Look.mark('scorch', S.x, S.y + 10, { big: 1 }, true); for (let i = 0; i < 14; i++) Look.mark('paper', S.x + rnd(-30, 30), S.y + rnd(0, 26), {}, true); }),
          SC.line('boomer', 'THAT’S MY WHOLE INVENTORY—', 1.3), SC.cam(S.x, S.y - 50, 1.2, .6),
          ...[0, 1, 2, 3, 4, 5, 6, 7].flatMap(i => SC_ROCKET(S.x - 50 + i * 14, S.y, 70 + (i % 3) * 20, .15)), SC.wait(1.4)],
          () => { keep.forEach(k => Object.assign(k.n, { x: k.x, y: k.y, hx: k.hx, hy: k.hy })); headline('FLORIDA MAN’S PROPOSAL FIREWORKS IGNITE ENTIRE FIREWORKS STAND; BRIDE CALLS IT "PERFECT"', 6); fin(); }); } },
      pay: () => [['MERLE', 'Forget the forty bucks, Danny. Forget it forever. You’re my best man.'], ['DAN', 'I’ll wear my good jorts.']], cash: 60, ref: 8, after: () => { Game.flags.merleDebt = false; Game.flags.bestMan = true; } },
  ],
  darlene: [
    { gate: () => Game.day >= 3, where: 'swamp', text: 'Stake out the Gulp-N-Go dumpster after 8 PM (the roller dog thief)',
      ask: [['DARLENE', 'Somebody’s been stealing roller dogs. Every night. Twelve dogs. Gone.'], ['DAN', 'It wasn’t me.'], ['DARLENE', 'I KNOW it wasn’t you, you pay for yours. Mostly. Stake out the dumpster tonight.']],
      act: { at: () => ({ x: AS().darlene.x - 60, y: AS().darlene.y + 24 }), when: () => Game.hour >= 20, wait: 'Stake out the dumpster (after 8 PM)', label: 'Stake out the dumpster', run: fin => {
        const x = AS().darlene.x - 60, y = AS().darlene.y + 24, greg = makeCritter('raccoon', x + 400, y, { gregory: true });
        Game.animals.push(greg);
        Scene.play([SC.cam(x, y - 8, 1.7, .6), SC.walk('dan', x - 18, y + 8, 45), SC.face('dan', 'right'), SC.line('dan', 'shhh...', 1.2), SC.wait(.5), SC.emote('dan', 'Z', .8, PAL.white),
          SC.place(greg, x + 4, y - 8), SC.emote(greg, '!', .7), SC.walk(greg, x + 6, y + 6, 20), SC.line(greg, '*chitter*', 1), SC.emote('dan', '?', .8), SC.line('dan', '...Gregory?', 1.2)],
          () => say([['', 'An hour passed. Dan ate a roller dog. It was evidence.'], ['', 'The raccoon is wearing a tiny bucket hat. Dan knows that hat.'],
        ['DAN', '', [
          ['Punch Gregory', () => { hurtDan(8); return [['', '*POW* Gregory punches back. Harder. Gregory has done this before.'], ['', 'He drops the roller dogs and flees into the night, bucket hat and all.']]; }],
          ['Offer Gregory a Swamp Lite', () => { if (Game.inv.beer > 0) Game.inv.beer--; return [['', 'Gregory accepts. They drink. Gregory agrees to rob the Circle K across the county line instead.'], ['DAN', 'That’s called diplomacy.']]; }],
          ['Yell “GIT!”', () => { Sound.play('git'); return [['DAN', 'GIIIIIT!'], ['', 'Gregory gits. He leaves a note: “FINE.” It is written in mustard.']]; }]]]],
        () => { Game.animals = Game.animals.filter(a => a !== greg); headline('FLORIDA MAN FOILS RACCOON ROLLER DOG HEIST; RACCOON "WILL BE BACK"', 3); fin(); }));
      } },
      pay: () => [['DARLENE', 'Gregory. I KNEW it. Here, hon. And take some dogs. They’re, uh. They were in the dumpster a little.']], cash: 20, ref: 4, after: () => giveItem('hotdog', 2, true) },
    { gate: F => F.acquitted, where: 'swamp', text: 'Pass Darlene’s “secret shopper” test (talk to her)',
      ask: [['DARLENE', 'Corporate’s sending a secret shopper. If this store looks like a Florida Man store, I’m fired.'], ['DAN', 'What’s a Florida Man store?'], ['DARLENE', 'THIS ONE, Dan. Come back and practice being a normal customer with me.']],
      act: { at: () => who('darlene') || AS().darlene, when: () => true, label: 'Practice being a normal customer', run: fin => say([['DARLENE', 'Okay. I’m the secret shopper. Say something normal.'], ['DAN', '', [
        ['“Nice weather.”', () => [['DARLENE', '...Perfect. Normal. Keep going.'], ['DAN', 'Hurricane’s comin’ Thursday, might ride it out on the roof with a cooler.'], ['DARLENE', 'DAN.']]],
        ['“Pump 3, and a pack of menthols.”', () => [['DARLENE', 'Oh my God. That’s it. That’s a normal man.'], ['DAN', '...and do you sell live bait AND nunchucks.'], ['DARLENE', 'SO close.']]],
        ['“Is the ice machine accepting raccoons today?”', () => [['DARLENE', 'I’m going to be fired.']]]]],
        ['', 'The real secret shopper walks in. He is wearing jorts, a visor, and holding a live iguana.'], ['SECRET SHOPPER', 'Five stars. Most Florida gas station I have ever seen. Corporate is going to LOVE this.'], ['DARLENE', '...I got a raise?']], () => { fin(); }) },
      pay: () => [['DARLENE', 'Dan. They’re making me regional manager. Of THIS. Here’s thirty bucks. Don’t ever change. Actually, change a little.']], cash: 30, ref: 4 },
    { gate: F => F.case2Won && ARC('merle').ch >= 3, where: 'swamp', text: 'Darlene’s bachelorette: borrow Rita’s karaoke machine + bring 6 Swamp Lites',
      ask: [['DARLENE', 'Merle and me are gettin’ HITCHED. I need a bachelorette. At the Sunshine Motor Inn pool.'], ['DAN', 'I’m in charge?'], ['DARLENE', 'Nobody else said yes. Get Rita’s karaoke machine. And six Swamp Lites. Minimum.']],
      act: { at: () => who('rita') || AS().motel, when: () => true, label: 'Borrow Rita’s karaoke machine', back: true, run: fin => say([['RITA', 'The karaoke machine? It only plays one song.'], ['DAN', 'Which song?'], ['RITA', '“Friends in Low Places.” It is stuck on it. Forever. It’s yours.']], fin) },
      ready: () => (Game.inv.beer || 0) >= 6, take: () => { Game.inv.beer -= 6; }, readyHint: 'Six Swamp Lites, Dan. SIX.',
      pay: () => [['', 'The bachelorette party goes until 2 AM. “Friends in Low Places” plays 41 times. A gator attends. Nobody asks who invited him.'], ['DARLENE', 'Best night of my LIFE. You’re a good man, Dan Dupree. Don’t tell anybody I said that.']],
      cash: 40, ref: 8, after: () => headline('BACHELORETTE PARTY AT SUNSHINE MOTOR INN ENDS WITH KARAOKE AND ONE (1) ALLIGATOR', 4) },
  ],
  rhonda: [
    { gate: () => Game.day >= 5, where: 'swamp', text: 'Catch whoever’s tagging “FLORIDA MAN WAS HERE” (Kevin’s dumpster, after 8 PM)',
      ask: [['RHONDA', 'Somebody spray-painted “FLORIDA MAN WAS HERE” on the water tower. And my cruiser. And my MOM.'], ['DAN', 'Wasn’t me.'], ['RHONDA', 'I know. It’s spelled right. Find out who. I hear it happens at night, by the dumpster.']],
      act: { at: () => who('kevin') || { x: 37.3 * TS, y: 41.5 * TS }, when: () => Game.hour >= 20, wait: 'Stake out the tagger (after 8 PM)', label: 'Catch the tagger', run: fin => say([
        ['', 'A figure in a trench coat shakes a spray can. It is Kevin. The trench coat is a garbage bag.'], ['KEVIN', 'Bro. It’s art. I’m reclaiming the narrative.'], ['DAN', '', [
          ['Turn Kevin in', () => [['RHONDA', 'KEVIN. Of course. Come on, Picasso.'], ['KEVIN', 'Worth it. Tell my dumpster I love it.']]],
          ['Cover for Kevin', () => { giveItem('scratch', 2, true); return [['DAN', '(to Rhonda) It was... a raccoon. Big one. Named Gregory.'], ['RHONDA', '...Gregory CAN’T SPELL, Dan.'], ['KEVIN', '(later) Thanks, bro. Two scratch-offs. My whole fortune.']]; }]]]],
        () => { headline('LOCAL “ARTIST” TAGS WATER TOWER "FLORIDA MAN WAS HERE"; FLORIDA MAN "IMPRESSED BY THE SPELLING"', 2); fin(); }) },
      pay: () => [['RHONDA', 'Case closed. I owe you one, Dupree. Don’t make me regret it. You will make me regret it.']], cash: 25, ref: 5 },
    { gate: F => F.acquitted && Game.day >= 6, where: 'swamp', text: 'Ride along with Rhonda (don’t touch anything)',
      ask: [['RHONDA', 'The Sheriff says I need “community outreach.” You’re the community. Get in the cruiser. Don’t touch ANYTHING.']],
      act: { at: () => who('rhonda') || AS().rhonda, when: () => !Heat.cop, label: 'Get in Rhonda’s cruiser', run: fin => say([['', 'The cruiser smells like coffee and regret. Rhonda pulls out onto County Road 29.'], ['DAN', '', [
        ['Touch the siren', () => { Sound.play('siren'); return [['', 'WEEOOWEEOO. Four cars pull over. One of them is Merle. He surrenders immediately.'], ['RHONDA', 'DAN.']]; }],
        ['Eat her donut', () => [['', 'Dan eats Rhonda’s donut. It was a jelly. It was her birthday donut.'], ['RHONDA', '...I’m going to arrest you for that someday. Not today. But someday.']]],
        ['Sit perfectly still and behave', () => [['', 'Dan sits perfectly still for eleven minutes. It is the longest he has ever behaved.'], ['RHONDA', 'Dan? Are you okay? Blink twice if you’re having a stroke.']]]]],
        ['', 'They catch a guy doing 90 in a golf cart. It is Wayne. The golf cart is full of oregano.']], () => { Game.heat = 0; headline('DEPUTY TAKES FLORIDA MAN ON RIDE-ALONG; "SOMEHOW HE WAS THE CALM ONE"', 2); fin(); }) },
      pay: () => [['RHONDA', 'That’s outreach. I’m telling the Sheriff it went great. Your stars are wiped. Don’t make me regret it.']], cash: 0, ref: 6 },
    { gate: F => F.case3Won, where: 'swamp', text: 'Give a speech at Rhonda’s promotion (courthouse, after 5 PM)',
      ask: [['RHONDA', 'They’re making me Sergeant. There’s a ceremony. Somebody has to give a speech about me.'], ['DAN', 'I’d be honored.'], ['RHONDA', 'You were not my first choice. You were my ninth. Courthouse steps, after five.']],
      act: { at: () => AS().court, when: () => Game.hour >= 17, wait: 'Rhonda’s promotion speech (after 5 PM)', label: 'Give Rhonda’s promotion speech', run: fin => say([['', 'Dan taps the microphone. It is Merle’s karaoke mic. It is still playing “Friends in Low Places.”'], ['DAN', '', [
        ['Tell them she’s arrested you 40 times', () => [['DAN', 'This woman has arrested me forty times. FORTY. She is the best there is.'], ['', 'The crowd weeps. Rhonda weeps. The Sheriff arrests Dan for an old parking ticket, then lets him go out of respect.']]],
        ['Tell them she caught Gregory', () => [['DAN', 'She brought down Gregory. A raccoon. In a bucket hat. Nobody else could.'], ['', 'A raccoon in the crowd boos. Everyone ignores him.']]],
        ['Just salute', () => [['', 'Dan salutes. He holds it for a full minute. It is the most dignified thing he has ever done. Rhonda salutes back.']]]]]], () => { headline('FLORIDA MAN GIVES SPEECH AT DEPUTY’S PROMOTION; DEPUTY "HAS NEVER BEEN PROUDER OR MORE CONFUSED"', 3); fin(); }) },
      pay: () => [['SGT. RHONDA', 'Sergeant. SERGEANT, Dan. ...Thanks. Here. It’s from the “community outreach” budget. Buy something legal.']], cash: 50, ref: 10 },
  ],
  kevin: [
    { gate: () => Game.day >= 5, where: 'swamp', text: 'Wrestle a gator so Kevin can study its teeth (then tell Kevin)',
      ask: [['KEVIN', 'Bro. I used to be a dentist. I wanna get back in. I need to see a gator’s teeth. Up close. For my portfolio.'], ['DAN', 'You want ME to open a gator’s mouth.'], ['KEVIN', 'I want you to HOLD it open. I’ll do the rest. From over here.']],
      start: s => { s.w = Game.day_.wrestles; s.d = Game.day; }, ready: s => Game.day_.wrestles > (s.d === Game.day ? s.w : 0), readyHint: 'Gator. Teeth. Wrestle one, bro.',
      pay: () => [['KEVIN', 'Bro. Eighty teeth. ZERO cavities. That gator flosses more than I do.'], ['KEVIN', 'I’m opening a practice. In the dumpster. Dr. Kevin, D.D.S. (Dumpster Dental Services).']], cash: 20, ref: 3, after: () => headline('DUMPSTER RESIDENT OPENS DENTAL PRACTICE; FIRST PATIENT AN ALLIGATOR', 2) },
    { gate: F => F.case2Won, where: 'swamp', text: 'Talk Rita out of evicting Kevin’s dumpster',
      ask: [['KEVIN', 'Bro. Rita says my dumpster is on motel property. She’s evicting it. It’s rent-controlled, bro. I pay in compliments.']],
      act: { at: () => who('rita') || AS().motel, when: () => true, label: 'Negotiate for Kevin’s dumpster', run: fin => say([['RITA', 'That dumpster is on MY lot, Dan.'], ['DAN', '', [
        ['“He’s a dentist now.”', () => [['RITA', '...Does he take insurance?'], ['DAN', 'He takes compliments.'], ['RITA', 'Fine. He can stay. I need a filling.']]],
        ['“He’s basically security.”', () => [['RITA', 'He IS always there.'], ['DAN', 'Always. Watching. Like a gargoyle.'], ['RITA', 'Fine. The gargoyle stays.']]],
        ['Pay his rent ($20)', () => { Game.money = Math.max(0, Game.money - 20); return [['RITA', 'Twenty bucks? For a dumpster? ...Deal. Best tenant I got.']]; }]]]], fin) },
      pay: () => [['KEVIN', 'Bro. BRO. You saved my home. Here — my lucky scratch-offs. I scratched ’em already, but emotionally they’re still lucky.']], cash: 15, ref: 4 },
  ],
  skeeter: [
    { gate: F => F.acquitted, where: 'swamp', text: 'Get the Leaky Tiki a band: buy Bubba’s Big Mouth Billy Bass, then tell Skeeter',
      ask: [['SKEETER', 'Bar needs live music. Band quit. Band was one guy. He moved to Ocala.'], ['DAN', 'I know a singer.'], ['SKEETER', 'Who?'], ['DAN', 'A fish. On a plaque. Bubba sells him.']],
      ready: () => hasUp('billy'), readyHint: 'Bubba’s got the singin’ fish. Sixty bucks. Worth every penny.',
      pay: () => [['', 'Dan loans Skeeter the Billy Bass for one night. It sings “Take Me to the River” eleven times. The bar goes FERAL.'], ['SKEETER', 'Best night we ever had. Here’s the door money. The door is a bucket.']], cash: 60, ref: 3, after: () => headline('SWAMP BAR BOOKS SINGING PLASTIC FISH AS HEADLINER; SHOW "SOLD OUT"', 3) },
    { gate: F => F.case2Won, where: 'swamp', text: 'Win Leaky Tiki trivia night (talk to Skeeter after 6 PM)',
      ask: [['SKEETER', 'Trivia night. Florida edition. Fifty bucks to the winner. Nobody’s ever won. Nobody’s ever stayed sober long enough.']],
      act: { at: () => who('skeeter') || AS().tiki, when: () => Game.hour >= 18, wait: 'Trivia night (after 6 PM)', label: 'Play trivia night', run: fin => {
        let right = 0; const Qn = (q, opts, good) => ['SKEETER', q, opts.map((o, i) => [o, () => { if (i === good) { right++; return [['SKEETER', 'CORRECT!']]; } return [['SKEETER', 'Wrong. Drink.']]; }])];
        say([Qn('Question one: what’s the state bird of Florida?', ['A mockingbird', 'A pelican', 'A flamingo wearing a hat'], 0),
          Qn('Question two: how many teeth does an alligator have?', ['About 80', 'Twelve, but they’re big', 'Depends who’s askin’'], 0),
          Qn('Final question: what’s the state of Florida’s official pie?', ['Key lime', 'Gas station pie', 'Whatever’s left'], 0)],
          () => { const cash = right * 15; Game.money += cash; say([['SKEETER', right === 3 ? 'THREE FOR THREE! Dan Dupree is the smartest man in the swamp. God help us.' : `${right} outta 3. That’s $${cash}. Better than anybody’s ever done.`]], fin); if (right === 3) headline('FLORIDA MAN WINS SWAMP BAR TRIVIA; LOCALS "DEEPLY SHAKEN"', 2); });
      } },
      pay: () => [['SKEETER', 'You’re banned from trivia now. You’re too good. It’s bad for business.']], cash: 0, ref: 3 },
  ],
  lurleen: [
    { gate: () => Game.day >= 3, where: 'swamp', text: 'Get Lurleen a lawn gnome (Boomer has one, he’ll take a Swamp Lite)',
      ask: [['LURLEEN', 'Dan Dupree. You still owe me a lawn gnome. You took Gnomeo to Daytona in 2019 and came back WITHOUT him.'], ['DAN', 'Gnomeo made his choice.'], ['LURLEEN', 'Boomer’s got a gnome at the fireworks stand. Get it.']],
      act: { at: () => who('boomer') || AS().fireworks, when: () => (Game.inv.beer || 0) >= 1, wait: 'Trade Boomer for the gnome (bring a Swamp Lite)', label: 'Trade Boomer a Swamp Lite for his gnome', back: true, run: fin => { Game.inv.beer--; say([['BOOMER', 'The gnome? He’s been out here six years. He’s seen things. Fireworks things.'], ['', 'The gnome is missing an eyebrow and smells like sulfur.'], ['BOOMER', 'Take care of him. His name is Kevin.'], ['DAN', 'We have a Kevin.'], ['BOOMER', 'Now you have two.']], fin); } },
      ready: s => s.acted, readyHint: 'The gnome, Dan. Boomer’s stand.',
      pay: () => [['LURLEEN', 'Oh, he’s PERFECT. He’s missing an eyebrow. Just like my ex-husband.']], cash: 20, ref: 4 },
    { gate: F => F.case2Won, where: 'swamp', text: 'Win the Palmetto Pines HOA election (the park, after 5 PM)',
      ask: [['LURLEEN', 'HOA election tonight. Gloria from lot 9 is running unopposed. Gloria banned FLAMINGOS, Dan.'], ['DAN', 'Not on my watch.'], ['LURLEEN', 'Then run. Park, after five. Bring your A game. Or any game.']],
      act: { at: () => AS().park, when: () => Game.hour >= 17, wait: 'HOA election (after 5 PM)', label: 'Give your HOA campaign speech', run: fin => say([['', 'Eleven residents on lawn chairs. One goat. Gloria glares from lot 9.'], ['DAN', '', [
        ['“Flamingos for everybody!”', () => [['', 'The crowd erupts. The goat erupts. Pink flamingos are installed on every lawn by midnight.']]],
        ['“Free kiddie pool Fridays!”', () => [['', 'A man in the back weeps. “My kids,” he says. “My kids can finally have a gator-free pool.” That was not the promise.']]],
        ['“No rules.”', () => [['', 'Pure silence. Then thunder. The residents chant “NO RULES” until 3 AM. Gloria moves to Naples.']]]]]],
        () => { headline('FLORIDA MAN ELECTED TRAILER PARK HOA PRESIDENT; FIRST ACT BANS "BANNING THINGS"', 4); fin(); }) },
      pay: () => [['LURLEEN', 'President Dupree! I’m your VP. We’re going to do SO many illegal things. Legally.']], cash: 30, ref: 5 },
  ],
  bubba: [
    { gate: F => F.acquitted, where: 'swamp', text: 'Pose for Bubba’s new billboard (talk to Bubba)',
      ask: [['BUBBA', 'I need a new billboard. Somethin’ that says “bail bonds” AND “bait.” I need a face. A guilty face. A face like yours.']],
      act: { at: () => who('bubba') || AS().bubba, when: () => true, label: 'Pose for the billboard', run: fin => say([['BUBBA', 'Okay. Look into the camera. Give me “I did it, but I got bailed out.”'], ['DAN', '', [
        ['Flex', () => [['', '*click* Dan flexes. Something in his shoulder pops. It is the best photo ever taken in Collier County.']]],
        ['Hold up a live bass', () => [['', '*click* The bass looks more guilty than Dan. Bubba loves it.']]],
        ['Point at the camera like it owes you money', () => [['', '*click* Bubba tears up. “That’s it. That’s the face of bail.”']]]]]], () => { headline('FLORIDA MAN’S FACE NOW ON BAIL BONDS BILLBOARD; COUNTY "NOT SURPRISED"', 3); fin(); }) },
      pay: () => [['BUBBA', 'You’re famous now, Dan. Sort of. Here’s your modeling fee. It’s mostly quarters.']], cash: 40, ref: 2 },
  ],
  boomer: [
    { gate: () => Game.day >= 4, where: 'swamp', text: 'Bring Boomer 6 empties for rocket casings',
      ask: [['BOOMER', 'I’m building the finale. The BIG one. I need empty cans. Six. Swamp Lite cans make the best casings. Don’t ask why. Physics.']],
      ready: () => (Game.inv.can || 0) >= 6, take: () => { Game.inv.can -= 6; }, readyHint: 'Six empties. Drink up, it’s for science.',
      pay: () => [['BOOMER', 'PERFECT. These are gonna make the loudest thing in Florida. Here, take two rockets for yourself. Point ’em at the sky. Mostly.']], cash: 20, ref: 2, after: () => giveItem('firework', 2, true) },
  ],
  earl: [
    { gate: () => Game.day >= 3, where: 'swamp', text: 'Throw Bessie the cow a birthday party (bring a roller dog to the pasture)',
      ask: [['EARL', 'It’s Bessie’s birthday. She’s eleven. Nobody ever throws a cow a party, Dan. Nobody.'], ['DAN', 'I will.'], ['EARL', 'She likes roller dogs. Don’t tell the other cows.']],
      act: { at: () => { const c = Game.animals.find(a => a.type === 'cow'); return c || { x: 60 * TS, y: 52 * TS }; }, r: 30, when: () => (Game.inv.hotdog || 0) >= 1, wait: 'Bessie’s party (bring a roller dog)', label: 'Sing happy birthday to Bessie', run: fin => { Game.inv.hotdog--; say([['DAN', '♪ Happy birthday, dear Bessieeee ♪'], ['BESSIE', 'Moo.'], ['', 'Bessie eats the roller dog. Then the plate. Then some of Dan’s shirt. She has never been happier.']], () => { Game.chill = 100; headline('FLORIDA MAN THROWS BIRTHDAY PARTY FOR COW; COW "CONFUSED BUT TOUCHED"', 3); fin(); }); } },
      pay: () => [['EARL', 'She’s smilin’. Cows can’t smile. She’s SMILIN’, Dan.']], cash: 25, ref: 3 },
  ],
  rita: [
    { gate: F => F.case3Won, where: 'swamp', text: 'Evict the guest in Room 6 (Sunshine Motor Inn, after 8 PM)',
      ask: [['RITA', 'Somebody’s been living in Room 6 for nine years. Never paid. Never opened the door. Just... hums.'], ['DAN', 'I’ll handle it.'], ['RITA', 'After dark. It only hums after dark.']],
      act: { at: () => AS().motel, when: () => Game.hour >= 20, wait: 'Room 6 (after 8 PM)', label: 'Knock on Room 6', run: fin => say([['', '*knock knock*'], ['???', 'HRRRRRM.'], ['DAN', '...GARY?'], ['GARY THE SKUNK APE', 'HRRM!'],
        ['', 'The Skunk Ape has been renting Room 6 as a “vacation home.” He has a mini fridge. It is full of Swamp Lite.'], ['DAN', '', [
          ['Let Gary stay (Dan covers him)', () => { Game.money = Math.max(0, Game.money - 20); return [['RITA', 'He... pays now? Twenty a week? From YOU? ...Fine. He’s quiet. Mostly.']]; }],
          ['Tell Rita he’s a “celebrity guest”', () => [['RITA', 'A CELEBRITY? Put him on the sign.'], ['', 'The Sunshine Motor Inn sign now reads: “AS SEEN ON TRAIL CAM.” Occupancy doubles.']]]]]],
        () => { headline('MOTEL DISCOVERS SKUNK APE HAS BEEN LIVING IN ROOM 6 FOR NINE YEARS; REVIEWS "EXCELLENT"', 4); fin(); }) },
      pay: () => [['RITA', 'Nine years of rent, solved in one night. Here. And tell Gary to stop using all the towels.']], cash: 40, ref: 4 },
  ],
  // ---------- Miami: things to do once the witnesses are sorted ----------
  abuela: [
    { gate: () => MIAMI(), where: 'miami', text: 'Abuela’s dominoes game at the park by the café (after 5 PM)',
      ask: [['ABUELA', 'Mijo. Tonight, dominoes. The old men at the park have cheated me for forty years.'], ['DAN', 'You want me to cheat back?'], ['ABUELA', 'I want you to WIN. How is your business.']],
      act: { at: () => AS().cafe, r: 34, when: () => Game.hour >= 17, wait: 'Dominoes night (after 5 PM)', label: 'Play dominoes for Abuela', run: fin => {
        const win = Math.random() < .6;
        say([['', 'Four old men. One card table. The air smells like cigars and consequences.'], ['DON RAMÓN', 'Who is this? The Florida Man? Siéntate, gringo.'], ['DAN', '', [
          ['Slam every domino as loud as possible', () => [['', 'SLAM. SLAM. SLAM. The old men are deeply intimidated.']]],
          ['Trash talk in Spanglish', () => [['DAN', 'Ay, Ramón, tu domino es muy... pequeño.'], ['DON RAMÓN', '...¿Qué?']]],
          ['Let Abuela coach you', () => [['ABUELA', 'The double six. NO, the OTHER double six. Ay, Dios mío.']]]]],
          ['', win ? 'Dan plays the last domino. CAPICÚA. The old men stand and applaud. One cries.' : 'Dan loses. Badly. The old men buy him a cafecito out of pity.']],
          () => { if (win) { Game.money += 30; headline('FLORIDA MAN BEATS LITTLE HAVANA DOMINOES CHAMPS; "HE SLAMMED SO HARD"', 3); } giveItem('cafecito', 1, true); fin(); });
      } },
      pay: () => [['ABUELA', 'Forty years, mijo. FORTY. Come, eat. You are too skinny for a man so round.']], cash: 20, ref: 3, after: () => giveItem('pastelito', 2, true) },
  ],
  sheila: [
    { gate: () => MIAMI(), where: 'miami', text: 'Dive for Sheila’s husband Marty (he’s in a coffee can at the bottom of the condo pool)',
      ask: [['SHEILA', 'Dan, honey. My late husband Marty is at the bottom of the condo pool.'], ['DAN', 'Oh no.'], ['SHEILA', 'In a coffee can, Dan. His ashes. The board “accidentally” knocked him in. Get Marty.']],
      act: { at: () => AS().condo, r: 34, when: () => true, label: 'Dive for Marty', run: fin => say([['', 'Dan cannonballs into the condo pool. Eleven retirees scream. One applauds.'], ['', 'At the bottom: a Folgers can, a hearing aid, and a set of teeth that is not Marty’s.'], ['DAN', '', [
        ['Bring up just Marty', () => [['SHEILA', 'MARTY! Oh, he looks wonderful.'], ['DAN', 'He’s a can, Sheila.'], ['SHEILA', 'He was ALWAYS a can.']]],
        ['Bring up everything', () => [['', 'Dan returns the hearing aid to Irv, the teeth to nobody, and Marty to Sheila. The condo board is furious. Sheila is delighted.']]]]]],
        () => { headline('FLORIDA MAN CANNONBALLS INTO CONDO POOL TO RESCUE WOMAN’S HUSBAND (HE’S IN A COFFEE CAN)', 4); fin(); }) },
      pay: () => [['SHEILA', 'You’re a mensch, Dan. A soggy, terrible mensch. Here — Marty would’ve wanted you to have this. He was cheap, so it’s not much.']], cash: 50, ref: 4 },
  ],
  raul: [
    { gate: () => MIAMI(), where: 'miami', text: 'Film Raul’s skate trick for the ’Gram (talk to Raul)',
      ask: [['RAUL', 'Florida Man! I need a camera guy. I’m gonna jump the fountain at the Hotel Neon. On rollerblades. Backwards.']],
      act: { at: () => who('raul') || AS().door, r: 30, when: () => true, label: 'Film Raul’s trick', run: fin => say([['RAUL', 'Rolling? ROLLING?'], ['DAN', '', [
        ['“Rolling!” (it isn’t)', () => [['', 'Raul lands it. Perfectly. The greatest trick of his life. Nobody recorded it.'], ['RAUL', '...Do it again? DO IT AGAIN.'], ['', 'He does it again. Into the fountain. That one gets 3 million views.']]],
        ['“Rolling!” (it is, vertically)', () => [['', 'Raul clears the fountain, a valet, and a small dog. Dan filmed it vertically. The internet approves.']]],
        ['Try the trick yourself', () => { hurtDan(10); return [['', 'Dan jumps the fountain. On flip-flops. He does not clear the fountain. He becomes part of the fountain.'], ['RAUL', 'BRO. That’s the one. THAT’S the video.']]; }]]]],
        () => { headline('FLORIDA MAN FILMS SKATER’S FOUNTAIN JUMP; ACCIDENTALLY BECOMES THE VIRAL PART', 3); fin(); }) },
      pay: () => [['RAUL', 'We’re famous, bro. Here’s your cut. Brand deal money. It’s paid in energy drinks, but also some money.']], cash: 30, ref: 2, after: () => giveItem('energy', 2, true) },
  ],
  coral: [
    { gate: () => MIAMI(), where: 'miami', text: 'Take Coral’s surf lesson (at the beach by the surf shack)',
      ask: [['CORAL', 'Dude. You’ve lived in Florida your whole life and you’ve never surfed?'], ['DAN', 'I’ve ridden a cooler into a lake.'], ['CORAL', 'That’s... close. Lesson’s on me. Meet me on the sand.']],
      act: { at: () => AS().surf || AS().pier, r: 40, when: () => true, label: 'Take the surf lesson', run: fin => say([['CORAL', 'Paddle, paddle, paddle... POP UP!'], ['DAN', '', [
        ['Pop up like a pro', () => [['', 'Dan pops up. He stands. He RIDES. For almost two seconds. It is the greatest moment of his life.']]],
        ['Pop up on the cooler instead', () => [['', 'Dan paddles out on his motorized cooler. The headlights come on. A lifeguard radios the Coast Guard. They come. They take photos.']]],
        ['Just float and drink a beer', () => [['CORAL', 'That’s... honestly, that’s most of surfing, dude.']]]]]],
        () => { headline('FLORIDA MAN TAKES SURF LESSON; "HE’S A NATURAL," SAYS INSTRUCTOR, WHO IS LYING', 2); fin(); }) },
      pay: () => [['CORAL', 'You’re a surfer now, dude. Sort of. Here, the shack pays interns. You’re my intern now. You’re fired. Here’s your pay.']], cash: 25, ref: 2 },
  ],
};

const ARC = id => { const F = Game.flags; F.arcs = F.arcs || {}; return F.arcs[id] || (F.arcs[id] = { ch: 0, st: 'idle' }); };
const Arcs = {
  chapter(id) { const L = ARCS[id], s = ARC(id); return L && L[s.ch]; },
  hereOK: c => c.where === 'miami' ? MIAMI() : c.where === 'daytona' ? DAYTONA() : c.where === 'keys' ? KEYS() : SWAMP(),
  // a pink ! : this neighbor has a new chapter for you (never while the story needs them)
  offering(n) {
    const c = this.chapter(n.id), s = ARC(n.id);
    return !!c && s.st === 'idle' && s.no !== Game.day && this.hereOK(c) && c.gate(Game.flags) && !Game.quests.some(q => !q.done && !q.opt && q.id.startsWith(n.id)) && Game.mode !== 'title';
  },
  talk(n) {
    // a step that happens by talking to someone (Rita's karaoke machine, Boomer's gnome...)
    for (const id in ARCS) { const s2 = ARC(id), c2 = this.chapter(id); if (c2 && s2.st === 'active' && c2.act && !s2.acted && this.hereOK(c2) && c2.act.at() === n) { this.act(id); return true; } }
    const c = this.chapter(n.id), s = ARC(n.id); if (!c) return false;
    const up = n.name.toUpperCase();
    if (s.st === 'active') {
      const acted = !c.act || s.acted;
      if (acted && (!c.ready || c.ready(s))) { if (c.take) c.take(s); this.finish(n.id); return true; }
      if (c.readyHint && (!c.act || s.acted)) { sideNag(n, [[up, c.readyHint]]); return true; }
      return false;
    }
    if (!this.offering(n)) return false;
    say([...c.ask.slice(0, -1), [...c.ask[c.ask.length - 1], [['“I’m in.”', () => { this.start(n.id); return null; }], ['“Not today.”', () => { s.no = Game.day; return [[up, pick(['Suit yourself.', 'Your loss, Dan.', 'Fine. FINE.'])]]; }]]]]);
    return true;
  },
  start(id) {
    const c = this.chapter(id), s = ARC(id); s.st = 'active'; s.acted = false; if (c.start) c.start(s);
    this.quest(id); hint('arcq', 'Neighbor stories live on your fridge to-do. The arrow points once the day’s main job is done.', 6);
  },
  quest(id) { const c = this.chapter(id); addQuest('arc_' + id, c.text, true); const q = Q('arc_' + id); if (q) { q.arc = id; q.done = false; } renderQuests(); },
  // finish a chapter: pay, the neighbor goes on record for Dan, and the next chapter waits for the story to move on
  finish(id) {
    const c = this.chapter(id), s = ARC(id), n = who(id), up = n ? n.name.toUpperCase() : id.toUpperCase();
    const lines = c.pay ? c.pay() : [];
    say(lines.length ? lines : [[up, 'Thanks, Dan.']], () => {
      if (c.cash) { Game.money += c.cash; Sound.play('cash'); }
      if (c.ref) Game.allegations = Math.max(0, Game.allegations - c.ref);
      if (c.after) c.after();
      done('arc_' + id); react('cheer');
      toast(`${c.cash ? `+$${c.cash} · ` : ''}${up.split(' ')[0]} vouches for you: FLA MAN −${c.ref || 0}%`, 3.5);
      s.ch++; s.st = 'idle'; s.acted = false;
      Game.flags.arcsDone = (Game.flags.arcsDone || 0) + 1;
      if (Game.flags.arcsDone === 12) headline('ENTIRE NEIGHBORHOOD SIGNS PETITION DECLARING FLORIDA MAN "NOT THAT BAD, ACTUALLY"', 1);
    });
  },
  // the spot where the chapter happens
  interaction() {
    if (Game.dan.ride) return null;
    for (const id in ARCS) {
      const s = ARC(id), c = this.chapter(id); if (!c || s.st !== 'active' || !c.act || s.acted || !this.hereOK(c)) continue;
      const A = c.act, p = A.at(); if (!arcNear(p, A.r || 26)) continue;
      return { label: A.when() ? A.label : this.wait(A), fn: () => this.act(id) };
    }
    return null;
  },
  wait: A => (typeof A.wait === 'function' ? A.wait() : A.wait) || A.label,
  act(id) {
    const s = ARC(id), c = this.chapter(id), A = c.act;
    if (!A.when()) return toast(this.wait(A), 2.5);
    A.run(() => { s.acted = true; if (!A.back && !c.ready) this.finish(id); else if (A.back) toast(`Now back to ${(who(id) || { name: id }).name}.`, 2.5); });
  },
  target(q) {
    const id = q.arc, c = this.chapter(id), s = ARC(id); if (!c || !this.hereOK(c)) return null;
    if (c.act && !s.acted) return c.act.at();
    if (c.target) return c.target(s);
    return who(id);
  },
  // re-post active chapters on the to-do each morning (setQuests wipes the list)
  newDay() { for (const id in ARCS) { const s = ARC(id); if (s.st === 'active' && this.chapter(id)) this.quest(id); } },
};
