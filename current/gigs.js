// FLORIDA MAN OPPORTUNITIES — short side gigs that pop up around the swamp. A few are offered each day (a $ over
// the giver's head), you take one at a time, they pay cash and make the paper. They never touch the main story:
// they're optional quests, and the arrow only points at one once the day's real objective is done.
'use strict';
const GIGS = {
  beer: { giver: 'skeeter', pay: 40, quest: 'Bring 6 Swamp Lites to Skeeter (Leaky Tiki)',
    offer: [['SKEETER', 'Supply boat sank. Again. Bar full of thirsty, zero beer.'], ['SKEETER', 'Bring me six Swamp Lites and I’ll pay you forty.']],
    talkActive: () => Game.inv.beer >= 6 ? (Game.inv.beer -= 6, 'done') : [['SKEETER', `Six Swamp Lites, Dan. You got ${Game.inv.beer || 0}.`]],
    hl: 'FLORIDA MAN DELIVERS BEER BY BOAT TO BAR THAT IS ALSO BASICALLY A BOAT' },
  pool: { giver: 'lurleen', pay: 30, quest: 'Get the gator out of Lurleen’s kiddie pool',
    offer: [['LURLEEN', 'Dan! There is an ALLIGATOR in the kiddie pool. The KIDDIE pool.'], ['LURLEEN', 'The kids named him Gregory. Gregory has to go.']],
    start() { const P = World.props.find(p => p.kind === 'kpool'); const a = makeGator(P.x + 16, P.y + 10, false); a.gig = 'pool'; a.cd = 1e9; Game.animals.push(a); },
    hl: 'FLORIDA MAN REMOVES ALLIGATOR FROM KIDDIE POOL; KIDS "WANTED TO KEEP HIM"' },
  mattress: { giver: 'rita', pay: 20, quest: 'Haul the Room 4 mattress to the Gulp-N-Go dumpster',
    offer: [['RITA', 'Room 4 checked out. The mattress did not. It has... seen things.'], ['RITA', 'Drag it to the dumpster at the Gulp-N-Go. Twenty bucks. Don’t look at it.']],
    start() { Game.pickups.push({ kind: 'mattress', x: 29.6 * TS, y: 52.3 * TS }); },
    hl: 'FLORIDA MAN HAULS MOTEL MATTRESS TO DUMPSTER, SAYS IT "HAS STORIES"' },
  fireworks: { giver: 'boomer', pay: 20, quest: 'Product-test 3 fireworks for Boomer (use them anywhere)',
    offer: [['BOOMER', 'Quality control, Dan. I need a man with no fear and no eyebrows.'], ['BOOMER', 'Three Freedom Rockets. Set ’em off anywhere. That’s the job.']],
    start() { giveItem('firework', 3); G_().fw0 = Game.day_.fireworks || 0; },
    check: () => (Game.day_.fireworks || 0) - (G_().fw0 || 0) >= 3,
    hl: 'FLORIDA MAN "PRODUCT TESTS" FIREWORKS OVER SWAMP; LOCAL FISH "RATTLED"' },
  trial: { giver: 'bubba', pay: 35, quest: 'Beat Bubba’s boat record (start at his dock)',
    offer: [['BUBBA', 'Lake record’s 40 seconds. My dock, round the Leaky Tiki, past your dock, back to mine.'], ['BUBBA', 'Beat it, I pay thirty-five. Lose, you tell everybody I’m faster.']],
    start() { G_().cp = -1; },
    hl: 'FLORIDA MAN SETS LAKE SPEED RECORD IN BOAT NAMED "SS BUDGET"' },
  cow: { giver: 'earl', pay: 25, quest: 'Herd Earl’s cow back into the pasture (yell GIT behind her)',
    offer: [['EARL', 'Bessie got out again. She’s standin’ on the highway, thinkin’ about her life.'], ['EARL', 'Get her back in the pasture. She only listens to yellin’.']],
    start() { const c = makeCritter('cow', 55 * TS, 44.6 * TS); c.herd = true; Game.animals.push(c); },
    check: () => { const c = Game.animals.find(a => a.herd); return !!c && c.x > 50.6 * TS && c.x < 69.4 * TS && c.y > 47.2 * TS && c.y < 57.2 * TS; },
    hl: 'FLORIDA MAN HERDS ESCAPED COW HOME USING ONLY YELLING' },
};
const G_ = () => Game.day_.gig || (Game.day_.gig = { offers: {}, active: null, done: [] });
// who the story needs on each case day: they never offer side gigs that day (so the story always gets the conversation)
const STORY_NPCS = { '4.1': ['valet'], '4.2': ['abuela', 'dj'], '4.3': ['raul', 'sheila'], '5.1': ['abuela', 'doc'], '5.2': ['doc'], '6.1': ['tammy'], '6.2': ['rusty', 'donna', 'tiny'], '7.1': ['rusty', 'chip'], '7.2': ['tammy', 'tiny', 'donna', 'wrench', 'chip'], '7.3': ['rusty', 'tammy'] , '8.1': ['lou'], '8.2': ['moe', 'pearl', 'brayden', 'mike'], '9.1': ['gus', 'tom'], '9.2': ['moe'] };
const storyBusy = id => { const c = Cases.info(); return (STORY_NPCS[c.n + '.' + c.d] || []).includes(id) || !!Q(id); };
const TRIAL_LIMIT = 40;
const trialPoints = () => { const S_ = World.spots; return [S_.bubbaDock, S_.tikiDock, S_.dockEnd, S_.bubbaDock]; };

const Gigs = {
  newDay() {
    const G = G_(); G.offers = {}; G.active = null;
    if (Game.day < 2) return;
    const ids = Object.keys(GIGS).filter(id => { const d = GIGS[id]; return Game.npcs.some(n => n.id === d.giver) && !storyBusy(d.giver) && (!d.ok || d.ok()); }).sort(() => Math.random() - .5).slice(0, Game.region === 'swamp' ? 3 : 2);   // nobody offers a gig on a day they're in the story
    for (const id of ids) G.offers[GIGS[id].giver] = id;
  },
  offering: n => { const G = G_(); return !G.active && !!G.offers[n.id]; },
  hasOffer: id => Gigs.offering({ id }),
  active: () => G_().active,
  drop() { const G = G_(); if (!G.active) return; G.active = null; Game.quests = Game.quests.filter(q => !q.gig); renderQuests(); toast('Side gig abandoned. They’ll get over it.'); },
  // the offer conversation
  offerLines(n) {
    const id = G_().offers[n.id], d = GIGS[id], last = d.offer[d.offer.length - 1];
    return [...d.offer.slice(0, -1), [last[0], last[1], [[`“I’m in.” ($${d.pay})`, () => { Gigs.accept(id); return null; }], ['“Not today.”', () => { delete G_().offers[n.id]; return [[n.name.toUpperCase(), 'Suit yourself.']]; }]]]];
  },
  offer(n) { say(Gigs.offerLines(n)); },
  // returns true if the gig system handled this conversation
  talk(n) {
    const G = G_(), id = G.active, d = id && GIGS[id];
    if (d && d.giver === n.id) {
      const r = d.talkActive ? d.talkActive() : d.check && d.check() ? 'done' : [[n.name.toUpperCase(), 'Well? ' + d.quest + '.']];
      if (r === 'done') Gigs.complete(id); else sideNag(n, r);
      return true;
    }
    if (n.id !== 'bubba' && Gigs.offering(n)) { Gigs.offer(n); return true; }
    return false;
  },
  accept(id) {
    const G = G_(), d = GIGS[id]; G.active = id; delete G.offers[d.giver];
    addQuest('gig_' + id, d.quest, true); const q = Q('gig_' + id); if (q) q.gig = true; renderQuests();
    d.start && d.start(); Sound.play('pickup');
  },
  complete(id) {
    const G = G_(), d = GIGS[id]; if (G.active !== id) return;
    G.active = null; G.done.push(id); done('gig_' + id);
    Game.money += d.pay; Sound.play('cash'); toast(`Gig done: +$${d.pay}`); react('cheer');
    headline(d.hl, 2);
    if (id === 'pool') Game.animals = Game.animals.filter(a => a.gig !== 'pool');
  },
  tick(dt) {
    const G = G_(), id = G.active; if (!id) return;
    const d = GIGS[id];
    if (id === 'rematch' && Race.on && !(Cases.info().n === 4 && Cases.info().d === 3)) Race.tick(dt);
    if (d.check && id !== 'beer' && d.check()) return Gigs.complete(id);
    if (id === 'trial') {
      const P = trialPoints(), D = Game.dan, near = (p, r) => Math.hypot(D.x - p.x, D.y - p.y) < r;
      if (G.cp === -1) { if (D.ride === 'boat' && near(P[0], 40)) { G.cp = 1; G.t = 0; Sound.play('siren'); toast('GO GO GO!', 1.5); } return; }
      G.t += dt;
      if (near(P[G.cp], 42)) { G.cp++; Sound.play('cash'); if (G.cp >= P.length) return Gigs.complete('trial'); }
      if (G.t > TRIAL_LIMIT) { G.cp = -1; Sound.play('fail'); toast('Too slow. Back to Bubba’s dock to try again.'); }
    }
  },
  timer: () => { const G = G_(); return G.active === 'trial' && G.cp >= 1 ? Math.max(0, Math.ceil(TRIAL_LIMIT - G.t)) : 0; },
  interactions() {
    const D = Game.dan;
    if (D.carry === 'mattress') { const dm = World.props.find(p => p.kind === 'dumpster'); if (dm && Math.hypot(D.x - dm.x - 12, D.y - dm.y - 8) < 32) return { label: 'Toss the mattress', fn: () => { D.carry = null; Sound.play('boom'); Gigs.complete('mattress'); } }; }
    const S_ = World.spots, near = (p, r) => p && Math.hypot(D.x - p.x, D.y - p.y) < r;
    const nb = World.props.find(p => p.kind === 'newsbox'); if (nb && !D.ride && near({ x: nb.x + 6, y: nb.y + 6 }, 18)) return { label: 'Bribe the Swamp Gazette', fn: () => Bribe.open() };
    return MiamiGigs.interaction() || DaytonaGigs.interaction() || KeysGigs.interaction() || Detector.interaction();
  },
  // where the objective arrow points while a gig is the thing to do
  target(q) {
    const id = q.id.slice(4), who = n => Game.npcs.find(x => x.id === n);
    if (id === 'beer') return who('skeeter');
    if (id === 'pool') return Game.animals.find(a => a.gig === 'pool');
    if (id === 'mattress') return Game.pickups.find(p => p.kind === 'mattress') || (Game.dan.carry === 'mattress' ? World.props.find(p => p.kind === 'dumpster') : null);
    if (id === 'trial') { const G = G_(), P = trialPoints(); return G.cp >= 1 ? P[G.cp] : P[0]; }
    if (id === 'cow') return Game.animals.find(a => a.herd);
    return MiamiGigs.target(id) || DaytonaGigs.target(id) || KeysGigs.target(id);
  },
  // race buoys (only while the trial is on)
  draw(cx, cy, t) {
    const G = G_(); if (G.active !== 'trial' || !World.spots.bubbaDock) return;
    trialPoints().forEach((p, i) => {
      if (i === 0 && G.cp >= 1 && G.cp < 3) return;
      const x = Math.round(p.x - cx), y = Math.round(p.y - cy + Math.sin(t * 3 + i)), next = (G.cp === -1 && i === 0) || G.cp === i;
      OR(x - 4, y - 6, 8, 8, next ? PAL.orange : PAL.greyD); R(x - 2, y - 4, 4, 2, PAL.white);
      if (next) label(i === 0 && G.cp === -1 ? 'START' : String(i), x, y - 10, PAL.yellow, 6);
    });
  },
};

// a $ over the head of anyone with work today
function drawGigBubble(n, x, y, t) {
  if (!Gigs.offering(n) || Game.mode !== 'play') return;
  const by = y - 34 + Math.round(Math.sin(t * 4 + n.x) * 1.5);
  OR(x - 6, by - 6, 12, 11, PAL.ink); R(x - 1, by + 5, 3, 2, PAL.ink); label('$', x + .5, by + 3, PAL.green || '#86c94a', 7);
}
