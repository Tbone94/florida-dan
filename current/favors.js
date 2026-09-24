// FLORIDA DAN — daily favors from the locals. Two a day once the cases are over (one a day
// as a side job during cases), rolled from this pool. Each pays out and makes somebody's day.
'use strict';
const FAVORS = {
  fishfry: { giver: 'merle', text: 'Bring Merle 2 fish for the fryer', ask: 'Danny, I got a date with the turkey fryer tonight. Bring me two fish?',
    ready: () => Game.catchBag.filter(f => !f.junk).length >= 2,
    pay() { let n = 0; Game.catchBag = Game.catchBag.filter(f => f.junk || ++n > 2); Game.inv.fish = Game.catchBag.filter(f => !f.junk).length; Game.money += 15; giveItem('beer', 2, true); return 'Hot dang. Here’s $15 and two cold ones. Don’t tell the turkey.'; } },
  heist: { giver: 'darlene', text: 'Get Darlene’s roller dog machine back from the raccoons', ask: 'Dan. The raccoons stole my roller dog machine. The WHOLE machine. I saw them roll it toward the Glades.',
    setup() { const s = findTile(k => k === T.SAWGRASS || k === T.GRASS, 14, 38, 24, 43, Game.day * 31) || { x: 18 * TS, y: 41 * TS }; Game.pickups.push({ kind: 'rollerdog', x: s.x, y: s.y, favor: true }); for (let i = 0; i < 3; i++) Game.animals.push(makeCritter('raccoon', s.x + rnd(-20, 20), s.y + rnd(-14, 14))); toast('Word is the raccoons stashed it west of the Gulp-N-Go, by the Glades.'); },
    ready: () => Game.dan.carry === 'rollerdog',
    pay() { Game.dan.carry = null; Game.money += 20; giveItem('hotdog', 3, true); headline('FLORIDA MAN RECOVERS STOLEN ROLLER DOG MACHINE FROM RACCOON CARTEL', 4); return 'My BABY. Twenty bucks and three dogs, hon. They’ve been rollin’ since Tuesday.'; } },
  bounty: { giver: 'rhonda', text: 'Bag 15 ft of python for Rhonda', ask: 'The Glades are crawling with Burmese pythons. Bring me fifteen feet, Dan. And I’ll forget about a few things.',
    ready: () => Game.pythons.reduce((a, b) => a + b, 0) >= 15,
    pay() { const ft = Game.pythons.reduce((a, b) => a + b, 0); Game.pythons = []; Game.money += Math.round(ft * 4); Game.heat = Math.max(0, (Game.heat || 0) - 2); return `${ft.toFixed(1)} feet. $${Math.round(ft * 4)}. And your heat just cooled off. We never talked.`; } },
  tour: { giver: 'tourist', text: 'Show the tourist a REAL gator', ask: 'Excuse me, are there REAL alligators around here? Can you show me one? From a safe distance?',
    setup() { const t = Game.npcs.find(n => n.id === 'tourist' && !n.follow); if (t) { t.follow = true; t.wander = 0; } },
    tick() { const t = Game.npcs.find(n => n.follow); if (!t) return; if (Game.animals.some(a => a.type === 'gator' && Math.hypot(a.x - t.x, a.y - t.y) < 70)) Favors.complete('tour'); },
    pay() { const t = Game.npcs.find(n => n.follow); if (t) { t.follow = false; t.hx = t.x; t.hy = t.y; t.wander = 30; } Game.money += 10; headline('TOURIST SEES REAL ALLIGATOR, CALLS IT "BETTER THAN DISNEY"', 3); return 'OH MY GOSH. IT BLINKED AT ME. Here’s ten dollars. Best vacation EVER.'; } },
  kevin: { giver: 'kevin', text: 'Bring Kevin a scratch-off', ask: 'Bro. I got a feeling. A lottery feeling. Bring me a scratch-off. I’ll split it.',
    ready: () => Game.inv.scratch > 0,
    pay() { Game.inv.scratch--; Game.money += 20; headline('DUMPSTER RESIDENT KEVIN WINS $100 ON SCRATCH-OFF, BUYS DUMPSTER A RUG', 3); return '*scratch scratch* ...A HUNDRED BUCKS! Here’s twenty. I’m getting the dumpster a rug.'; } },
  porch: { giver: 'merle', text: 'Get Chuck off Merle’s porch', ask: 'Danny. Chuck is on my porch eatin’ my Crocs. The good ones. Get him OFF.',
    setup() { const M = World.spots.merle, c = makeGator(M.x - 24, M.y - 14, true); c.lurk = false; c.cd = 4; c.porch = true; c.hx = c.x; c.hy = c.y; Game.animals.push(c); },
    tick() { const c = Game.animals.find(a => a.porch); if (c && (c.state === 'flee' || c.belly > 0)) { c.porch = false; Favors.complete('porch'); } },
    pay() { Game.money += 10; giveItem('beer', 1, true); return 'He’s gone! My Crocs are... mostly intact. Ten bucks and a beer, Danny.'; } },
};
const Favors = {
  roll(n) {
    const keys = Object.keys(FAVORS).filter(k => Game.npcs.some(x => x.id === FAVORS[k].giver)), picked = [];
    while (picked.length < n && keys.length) picked.push(keys.splice(Math.floor(Math.random() * keys.length), 1)[0]);
    Game.favors = picked.map(id => ({ id, state: 'offered' }));
    for (const f of Game.favors) { const npc = Game.npcs.find(x => x.id === FAVORS[f.id].giver); if (npc) npc.quest = true; }
    const main = Cases.info().n === 0;
    for (const f of Game.favors) addQuest('fav_' + f.id, `${FAVORS[f.id].text}`, !main);
  },
  get(id) { return (Game.favors || []).find(f => f.id === id); },
  talk(n) {
    for (const f of Game.favors || []) {
      const d = FAVORS[f.id]; if (d.giver !== n.id) continue;
      if (f.state === 'offered') { f.state = 'active'; n.quest = false; d.setup && d.setup(); say([[n.name.toUpperCase(), d.ask], ['DAN', pick(['On it.', 'Say less.', 'For you? Anything. For a price.'])]]); return true; }
      if (f.state === 'active' && d.ready && d.ready()) { this.complete(f.id, n); return true; }
      if (f.state === 'active' && !Game.skipSide) { sideNag(n, [[n.name.toUpperCase(), pick(['Well? I’m waitin’.', 'Any luck?', 'Clock’s tickin’, Dan.'])]]); return true; }
    }
    return false;
  },
  complete(id, n) {
    const f = this.get(id); if (!f || f.state === 'done') return;
    f.state = 'done'; const line = FAVORS[id].pay(); done('fav_' + id); Sound.play('cash');
    const who = n ? n.name.toUpperCase() : (Game.npcs.find(x => x.id === FAVORS[id].giver) || { name: '' }).name.toUpperCase();
    say([[who, line]]);
    Game.flags.favorsDone = (Game.flags.favorsDone || 0) + 1;
    if (Game.flags.favorsDone === 10) headline('FLORIDA MAN DOES TEN FAVORS FOR NEIGHBORS; NEIGHBORS "DEEPLY SUSPICIOUS"', 2);
  },
  tick(dt) { for (const f of Game.favors || []) if (f.state === 'active' && FAVORS[f.id].tick) FAVORS[f.id].tick(); },
  event(name) { },
};
