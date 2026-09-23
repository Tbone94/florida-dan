import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  window.TRAILER = true; const out = [];
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 30); render(); hud(); Input.endFrame(); } };
  const talk = (pickRe) => { for (let i = 0; i < 80 && Game.mode === 'talk'; i++) { const cs = [...document.querySelectorAll('.choice')]; const c = pickRe ? cs.find(b => pickRe.test(b.textContent)) || cs[0] : cs[0]; if (c) c.click(); else Input.press('a'); step(3); } };
  begin(false); talk(); Game.flags.noChase = true; Game.money = 400;
  // --- swamp: Gazette bribe
  headline('FLORIDA MAN TEST STORY ONE', 8); const al0 = Game.allegations, n0 = Game.headlines.length;
  const nb = World.props.find(q => q.kind === 'newsbox'); Object.assign(Game.dan, { x: nb.x + 6, y: nb.y + 18, ride: null }); Game.mode = 'play';
  let it = interaction(); out.push('swamp newsbox prompt: ' + (it && it.label)); it.fn(); talk(/Bury/);
  out.push(`bribe: headline gone=${!Game.day_.headlines.includes('FLORIDA MAN TEST STORY ONE')} evidence ${n0}→${Game.headlines.length} allegations ${al0}→${Game.allegations} money $${Game.money}`);
  // --- busted: pay off Rhonda
  Game.inv.beer = 3; Heat.cop = { x: Game.dan.x, y: Game.dan.y, dir: 'left', t: 0 }; Heat.busted(); talk(/Slip/);
  out.push(`cop payoff: beers kept=${Game.inv.beer} money $${Game.money}`);
  // --- Miami
  Game.day = 18; World.load('miami'); spawn(); Gigs.newDay(); Game.mode = 'play'; ui.talk.hidden = true; Game.talk = null;
  out.push('Miami offers: ' + JSON.stringify(Game.day_.gig.offers) + ' coral=' + !!Game.npcs.find(n => n.id === 'coral'));
  const coral = Game.npcs.find(n => n.id === 'coral'); Story.talk(coral); talk(/Browse/); out.push('surf shop: ' + [...ui.shopList.children].map(x => x.dataset.k).join(','));
  for (const row of [...ui.shopList.children]) row.click(); Game.mode = 'play'; ui.shop.hidden = true;
  out.push('owned: ' + ['detector', 'cigboat', 'aviators'].filter(hasUp).join(','));
  // detector: stand on a loot spot
  const spot = Detector.spots()[0]; Object.assign(Game.dan, { x: spot.x, y: spot.y, ride: null }); step(2); it = interaction(); out.push('detector: ' + (it && it.label)); const m0 = Game.money; it.fn(); out.push(`dug: +$${Game.money - m0}, spots left ${Detector.spots().length}`);
  // gigs
  for (const id of ['cafecito', 'pickles', 'rematch']) {
    const d = GIGS[id], giver = Game.npcs.find(n => n.id === d.giver); Game.day_.gig.offers = { [d.giver]: id }; Game.day_.gig.active = null; Game.mode = 'play';
    Object.assign(Game.dan, { x: giver.x, y: giver.y + 16, carry: null }); Story.talk(giver); talk(/in\.”/);
    const acc = Game.day_.gig.active === id;
    if (id === 'cafecito') { for (const t of World.props.filter(q => q.kind === 'guard').slice(0, 3)) { Object.assign(Game.dan, { x: t.x + 11, y: t.y + 20 }); const x = interaction(); if (x) x.fn(); step(2); } }
    if (id === 'pickles') { const c = Game.animals.find(a => a.pickles); Object.assign(Game.dan, { x: c.x + 6, y: c.y }); const x = interaction(); if (x) x.fn(); Object.assign(Game.dan, { x: giver.x, y: giver.y + 16 }); Story.talk(giver); talk(); }
    if (id === 'rematch') { Object.assign(Game.dan, { ride: null }); for (let i = 0; i < 400 && Race.on; i++) { Game.dan.y += 4; step(1); } step(3); talk(); }
    out.push(`${id}: accepted=${acc} done=${Game.day_.gig.done.includes(id)}`);
  }
  return out.join('\n');
});
console.log(r); console.log('errors:', errs.length ? errs : 'none'); await b.close();
