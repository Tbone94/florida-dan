// FLORIDA DAN — the stuff in Dan's pockets and what it does to him.
'use strict';
const ITEMS = {
  beer: { name: 'Swamp Lite', price: 2, desc: 'Buzz. Sloppy steering. Double vision. Keep going and you black out somewhere weird.' },
  cig: { name: 'Menthol Cig', price: 1, desc: 'Chill. A lil cough. Makes Dan feel like a cowboy.' },
  joint: { name: 'Swamp Doobie', price: 0, desc: 'Slow-mo, colors pop, gators chill out, fish bite more. Munchies.' },
  shroom: { name: 'Cow Pie Shroom', price: 0, desc: 'The world melts. Controls get weird. Animals start talkin’. Something waits in the water.' },
  powder: { name: '“Sinus Medicine”', price: 0, desc: 'It’s for his sinuses. 2x speed, jittery, then a nasty crash.' },
  energy: { name: 'Gator Juice Energy', price: 4, desc: 'Speed boost. Heart goes brrrrr.' },
  hotdog: { name: 'Roller Dog (Day 4)', price: 2, desc: 'Big chill... or big trouble. Keep a toilet in mind.' },
  scratch: { name: 'Scratch-Off', price: 3, desc: 'Florida Frenzy! Win up to $100. You won’t.' },
  gummy: { name: 'Gator Gummies', price: 12, desc: 'A long, strong high. The munchies will be biblical.' },
  cafecito: { name: 'Cafecito', price: 2, desc: 'Cuban coffee. Legal rocket fuel. Speed + chill.' },
  pastelito: { name: 'Pastelito', price: 2, desc: 'Guava and cheese. Fixes everything for about a minute.' },
  suit: { name: 'Pastel Suit', price: 30, desc: 'Seafoam jacket, pink tee. Instant Miami. Required for yachts.' },
  bale: { name: 'Bale of “Sinus Medicine”', price: 0, desc: 'Found on the beach. Belongs to somebody. Somebody bad.' },
  lettuce: { name: 'Head of Lettuce', price: 1, desc: 'A vegetable. At the Gulp-N-Go. Somehow.' },
  jortsXXXL: { name: 'Formal Jorts, XXXL', price: 8, desc: 'Black denim. For weddings, funerals, and cryptid testimony.' },
  firework: { name: 'Freedom Rocket', price: 10, desc: 'Throw it. Boom. Everything within a mile respects you now.' },
};
const HOTBAR = ['beer', 'cig', 'joint', 'shroom', 'powder', 'energy', 'hotdog', 'scratch', 'firework', 'gummy', 'cafecito', 'pastelito'];

function giveItem(k, n = 1, quiet) {
  Game.inv[k] = (Game.inv[k] || 0) + n;
  if (!quiet) { Sound.play('pickup'); flashSlot(k); }
}

function useItem(k) {
  if (Game.mode !== 'play' && Game.mode !== 'fish') return;
  if (!(Game.inv[k] > 0)) { toast(`No ${ITEMS[k].name}. ${pick(['Tragic.', 'Life is pain.', 'Gulp-N-Go sells some. Probably.'])}`); Sound.play('fail'); return; }
  const F = Game.fx, D = Game.dan, L = Game.day_;
  Game.inv[k]--;
  D.anim = k; D.animT = 1.5;
  switch (k) {
    case 'beer': {
      F.buzz = Math.min(130, F.buzz + 22); Game.chill = Math.min(100, Game.chill + 12); L.beers++; Game.inv.can = (Game.inv.can || 0) + 1;
      Sound.play('crack');
      toast(F.buzz > 80 ? pick(["Dan's seein' two of everything. Twice the gators.", 'Wooo. WOOOO. Okay.', 'The ground is movin’, Brenda.']) : pick(['*crack* ...ahhhhh.', 'Breakfast of champions.', 'Hydration.', 'Tastes like freedom and aluminum.', 'That’s the good sh*t.']));
      if (L.beers === 6) headline(`FLORIDA MAN DRINKS SIX BEERS BEFORE ${Game.hour < 12 ? 'NOON' : 'DINNER'}, CITES "HYDRATION"`, 5);
      if (F.buzz >= 110) blackout();
      break;
    }
    case 'cig': F.cig = 25; Game.chill = Math.min(100, Game.chill + 10); Sound.play('cough'); toast(pick(['*cough* ...hell yeah.', 'Dan smokes like a man with no plans.', 'One of these days he’ll quit. Not today, Satan.'])); L.cigs++; break;
    case 'joint':
      F.high = 50; Game.chill = Math.min(100, Game.chill + 30); Sound.play('cough'); L.joints++;
      toast(pick(['Ohhh... oh the colors, man.', 'The swamp is BREATHING. Cool cool cool.', 'Dan is one with the marsh now.']));
      setTimeout(() => { if (Game.fx.high > 0) toast('MUNCHIES. Dan would kill a man for a roller dog.'); }, 14000);
      break;
    case 'shroom':
      F.shroom = 45; L.shrooms++; Sound.play('trip');
      toast(pick(['Uh oh. The trees are lookin’ at me.', 'Colors have SOUNDS now.', 'Why is my hand so... interesting.']));
      Story.event('shroom');
      break;
    case 'powder':
      F.powder = 28; F.crash = 0; Sound.play('sniff'); L.powder++; Game.chill = Math.min(100, Game.chill + 20);
      toast(pick(['IT’S FOR MY SINUSES. I CAN BREATHE THROUGH MY EYES NOW.', 'MEDICINAL. DOCTOR-ISH APPROVED.', 'WOOOOO MY SINUSES HAVE NEVER BEEN CLEARER!!!']));
      if (L.powder === 1) headline('FLORIDA MAN CLAIMS WHITE POWDER IS "SINUS MEDICINE," RUNS 40 MPH DOWN COUNTY ROAD 29', 8);
      if (F.shroom > 0) { headline('FLORIDA MAN "ASCENDS" ON UNKNOWN SUBSTANCES; WITNESSES SAY HE "WAS GLOWING AND KEPT SAYING MANATEE"', 10); Game.shake = 8; }
      break;
    case 'gummy': F.high = 110; Game.chill = 100; Sound.play('munch'); L.joints++; toast(pick(['Chewy. Tropical. Kicking in... never? ...OH. OH, there it is.', 'Dan ate the whole bag. Dan has made a choice.'])); setTimeout(() => { if (Game.fx.high > 0) toast('BIBLICAL MUNCHIES. Dan would sell the cooler for a pastelito.'); }, 12000); break;
    case 'cafecito': F.powder = Math.max(F.powder, 9); Game.chill = Math.min(100, Game.chill + 15); Sound.play('crack'); toast(pick(['*sip* ...Dan can see through time.', 'Abuela’s cafecito hits different. It hits EVERYTHING.', 'Dan’s eyelids are now permanently open.'])); break;
    case 'pastelito': Game.chill = Math.min(100, Game.chill + 30); if (F.high > 0) { Game.chill = 100; toast('Munchies: DEFEATED. Guava is God.'); } else toast(pick(['Flaky. Sweet. Life-changing.', 'Crumbs everywhere. Worth it.'])); Sound.play('munch'); break;
    case 'energy': F.powder = Math.max(F.powder, 12); Sound.play('crack'); toast('GATOR JUICE. My heart is doin’ a drum solo.'); break;
    case 'hotdog': {
      Sound.play('munch'); L.hotdogs++;
      if (F.high > 0) { Game.chill = 100; toast('The munchies have been SLAIN. Best hot dog of Dan’s life.'); headline('FLORIDA MAN EATS GAS STATION ROLLER DOG WHILE "EXTREMELY HIGH," RATES IT 11 OUT OF 10', 4); break; }
      if (Math.random() < .45) { Game.urgent = 35; toast('Oh no. Oh NO. That dog was NOT right. FIND A TOILET.'); Sound.play('fail'); }
      else { Game.chill = Math.min(100, Game.chill + 25); toast(pick(['Been spinnin’ since Thursday. Perfect.', 'Tastes like gas station. Delicious.'])); }
      break;
    }
    case 'scratch': {
      const r = Math.random(), win = r < .02 ? 100 : r < .1 ? 20 : r < .3 ? 5 : 0;
      Game.money += win; Sound.play(win ? 'cash' : 'fail'); L.scratchers++;
      toast(win ? (win === 100 ? '$100!!! DAN IS RICH. DAN IS A MILLIONAIRE (HUNDREDAIRE)!' : `Won $${win}. Dan’s a financial genius.`) : pick(['Nothin’. Florida Frenzy my ass.', 'Lost. The state of Florida thanks you.', 'Zip. Zilch. Scratch dust.']));
      if (win >= 20) react('cheer');
      if (win === 100) headline('FLORIDA MAN WINS $100 ON SCRATCH-OFF, IMMEDIATELY SPENDS IT ON SCRATCH-OFFS', 3);
      break;
    }
    case 'firework': throwThing('firework'); break;
  }
  updateHotbar();
}

function blackout() {
  const S_ = World.spots, at = (p, dx = 0, dy = 0) => p ? [p.x + dx, p.y + dy] : null;
  const away = MIAMI() ? [   // Miami and Daytona wake-ups (the swamp spots don't exist there)
    ['the Hotel Neon fountain', ...(at(S_.door, 0, 20) || []), 'FLORIDA MAN FOUND ASLEEP IN HOTEL FOUNTAIN, TOLD STAFF HE WAS "A WATER FEATURE"'],
    ['the end of the pier, holding a stranger’s bait bucket', ...(at(S_.pier) || []), 'FLORIDA MAN WAKES UP ON PIER WITH STRANGER’S BAIT BUCKET, SAYS THEY’RE "CLOSE NOW"'],
    ['Café Abuela’s patio, under a tablecloth', ...(at(S_.cafe, 0, 16) || []), 'FLORIDA MAN FOUND UNDER CAFÉ TABLECLOTH; ABUELA FED HIM ANYWAY'],
  ] : DAYTONA() ? [
    ['the Ocean Breeze ice machine', ...(at(S_.door, 0, 20) || []), 'FLORIDA MAN FOUND HUGGING MOTEL ICE MACHINE, CALLS IT "HIS PIT CREW"'],
    ['the courthouse steps, wearing a checkered flag', ...(at(S_.court, 0, 20) || []), 'FLORIDA MAN SLEEPS ON COURTHOUSE STEPS WRAPPED IN CHECKERED FLAG'],
    ['a bench at the bus station', ...(at(S_.stationDoor, 0, 20) || []), 'FLORIDA MAN FOUND ASLEEP AT BUS STATION, TELLS GREYHOUND "NOT TODAY"'],
  ] : null;
  const spots = away ? away.filter(s => s.length === 4) : [
    ['the roof of the Gulp-N-Go', World.spots.darlene.x + 10, World.spots.darlene.y - 30, 'FLORIDA MAN FOUND ASLEEP ON GAS STATION ROOF, CLAIMS HE "WAS GUARDING IT"'],
    ['the cow pasture, spooning a cow', World.spots.pasture.x, World.spots.pasture.y, 'FLORIDA MAN FOUND SPOONING COW; COW "DID NOT PRESS CHARGES"'],
    ['Merle’s porch, wearing a traffic cone', World.spots.merle.x - 20, World.spots.merle.y + 10, 'FLORIDA MAN WAKES UP IN TRAFFIC CONE, HAS "NO REGRETS"'],
    ['the middle of County Road 29', 40 * TS, 44.6 * TS, 'FLORIDA MAN FOUND NAPPING IN MIDDLE OF COUNTY ROAD, SAYS ROAD "WAS WARM"'],
    ['the porta-potty', World.spots.darlene.x - 80, World.spots.darlene.y + 20, 'FLORIDA MAN SPENDS NIGHT IN PORTA-POTTY, CALLS IT "A STAYCATION"'],
  ];
  const [where, x, y, head] = pick(spots);
  if (Game.car && typeof Car !== 'undefined') Car.exit(); Game.dan.ride = null;
  say([['', 'Everything goes black...'], ['', `Dan wakes up in ${where}. It's ${Math.min(20, Math.floor(Game.hour) + 3)}:00. His mouth tastes like a pennies.`],
    ['DAN', pick(['...Nobody saw that.', 'Where are my flip-flops. Where is my DIGNITY.', 'Brenda can never know about this.'])]], () => {
    let p = [x, y + 12];   // nearest walkable spot to where he's supposed to wake up
    for (let r = 0; r < 120 && !canWalk(p[0], p[1]); r += 4) for (let a = 0; a < 6.28; a += .5) { const q = [x + Math.cos(a) * r, y + Math.sin(a) * r]; if (canWalk(q[0], q[1])) { p = q; break; } }
    Game.dan.x = p[0]; Game.dan.y = p[1];
    Game.hour = Math.min(20.5, Game.hour + 3); Game.fx.buzz = 20; Game.chill = 40;
    headline(head, 7);
    Story.event('blackout');
  });
}

// ---------- throwing: empty cans (F), fireworks ----------
function throwThing(kind) {
  const D = Game.dan;
  if (kind === 'can') { if (!(Game.inv.can > 0)) { toast('No empties to throw. Drink more? (Dan’s words, not ours.)'); return; } Game.inv.can--; }
  const d = D.dir, vx = d === 'right' ? 1 : d === 'left' ? -1 : 0, vy = d === 'down' ? 1 : d === 'up' ? -1 : 0;
  Game.projectiles.push({ kind, x: D.x + vx * 8, y: D.y - 10, vx: vx * 150, vy: vy * 150, z: 10, vz: 60, life: kind === 'firework' ? 1.2 : 1 });
  Sound.play('git');
}
function updateProjectiles(dt) {
  for (const p of Game.projectiles) {
    p.x += p.vx * dt; p.y += p.vy * dt; p.vz -= 180 * dt; p.z = Math.max(0, p.z + p.vz * dt); p.life -= dt;
    if (p.kind === 'firework') { Game.parts.push({ kind: 'spark', x: p.x, y: p.y - p.z, vx: rnd(-20, 20), vy: rnd(-20, 5), life: .4 }); if (p.life <= 0) explode(p.x, p.y); continue; }
    for (const a of Game.animals) if (Math.hypot(a.x - p.x, a.y - p.y) < 12 && a.state !== 'bagged') {
      a.stun = 2.5; a.state = a.type === 'gator' ? 'flee' : 'flee'; a.timer = 3; p.life = 0; Sound.play('chomp'); toast(pick(['BONK! Right in the noggin.', 'Direct hit. Dan was a pitcher in 9th grade.', 'Can to the face. Respect.'])); break;
    }
    for (const n of Game.npcs) if (Math.hypot(n.x - p.x, n.y - p.y) < 10) { p.life = 0; Sound.play('hurt'); Story.hitNPC(n); break; }
  }
  Game.projectiles = Game.projectiles.filter(p => p.life > 0);
}
function explode(x, y) {
  Sound.play('boom'); Game.shake = 10; Game.flash = .6;
  for (let i = 0; i < 40; i++) { const a = rnd(0, 6.28), s = rnd(20, 90); Game.parts.push({ kind: 'spark', x, y: y - 16, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(.4, 1), c: pick([PAL.red, PAL.white, PAL.blue, PAL.yellow]) }); }
  for (const a of Game.animals) if (Math.hypot(a.x - x, a.y - y) < 110) { a.state = 'flee'; a.timer = 6; a.stun = 1.5; }
  const L = Game.day_; L.fireworks++;
  const where = World.region(x, y) === 'mainland' ? 'THE GULP-N-GO' : World.region(x, y) === 'pasture' ? 'A COW PASTURE' : World.region(x, y) === 'glades' ? 'THE EVERGLADES' : 'HIS OWN SWAMP';
  if (L.fireworks === 1) headline(`FLORIDA MAN SETS OFF FIREWORKS AT ${where} "TO SCARE THE GATORS," SCARES EVERYONE ELSE`, 6);
  for (const n of Game.npcs) if (Math.hypot(n.x - x, n.y - y) < 90) n.scared = 2;
}
function drawProjectiles(cx, cy) {
  for (const p of Game.projectiles) {
    const x = p.x - cx, y = p.y - cy - p.z;
    shadow(p.x - cx, p.y - cy, 5, 2);
    if (p.kind === 'can') OR(x - 1, y - 2, 3, 4, PAL.blue); else { OR(x - 1, y - 3, 3, 6, PAL.red); R(x, y - 5, 1, 2, PAL.yellow); }
  }
}
