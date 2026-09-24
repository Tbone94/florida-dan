// 9/24 bug pass regressions: mid-day saves keep dawn story flags, boats boardable in Miami/Daytona, early trash counts,
// shopkeeper nags don't wall off the shop, passing out in the boat tows it home, declined gigs go away, bales on a replay
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  window.TRAILER = true; try { localStorage.clear(); } catch (e) { } begin(false);
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } }, bad = [], log = [];
  const talk = () => { for (let i = 0; i < 300 && Game.mode === 'talk'; i++) { step(8); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[0].click(); else Input.press('a'); step(1); } };
  const go = (region, day, flags = {}) => { Game.mode = 'play'; ui.talk.hidden = true; Game.talk = null; World.load(region); Game.day = day; Object.assign(Game.flags, flags); startDay(); talk(); };
  talk(); Game.flags.noChase = true;
  // 1. mid-day save: story flags from dawn, owned stuff live
  go('swamp', 6, { case1Won: true }); Game.flags.mannyOut = true; Game.flags.up = { billy: true }; Game.flags.flamingos = [{ r: 'swamp', x: 1, y: 1 }]; save();
  const sf = JSON.parse(localStorage.getItem(SAVE_KEY)).flags;
  if (sf.mannyOut) bad.push('mid-day save kept mannyOut'); if (!sf.up || !sf.up.billy) bad.push('mid-day save lost an upgrade'); if (!sf.flamingos || !sf.flamingos.length) bad.push('mid-day save lost flamingos');
  Game.flags.flamingos = []; delete Game.flags.mannyOut;
  // 2. boats boardable
  for (const [reg, day] of [['miami', 18], ['daytona', 23], ['swamp', 24]]) {
    go(reg, day, { case3Won: true, case4Won: true, case5Won: true, case6Won: true, case7Won: true });
    const B = Game.boat; let best = null, bd = 1e9;
    for (let a = 0; a < 6.28; a += .2) for (let d = 4; d < 60; d += 2) { const x = B.x + Math.cos(a) * d, y = B.y + Math.sin(a) * d; if (canWalk(x, y) && !WET(World.at(x, y)) && d < bd) { bd = d; best = { x, y }; } }
    Object.assign(Game.dan, best, { ride: null }); const ix = interaction(); log.push(`${reg} boat: ${ix && ix.label}`);
    if (!ix || !/Board/.test(ix.label)) bad.push(`can't board the boat in ${reg} (nearest land ${bd | 0}px)`);
  }
  // 3. trash grabbed before Dr. Pam still counts
  go('swamp', 5, { case1Won: true }); Game.inv.trash = 2; const pam = Game.npcs.find(n => n.id === 'pam') || { id: 'pam', name: 'Dr. Pam', x: 0, y: 0 };
  if (!Game.flags.trashStart) { Story.talk(pam); talk(); } log.push('trash after Pam: ' + Game.inv.trash); if (Game.inv.trash !== 2) bad.push('Pam zeroed the trash already collected');
  // 4. shopkeeper nag has a way to the counter
  go('swamp', 7, { case1Won: true }); for (const id in ARCS) ARC(id).no = Game.day; Game.favors = [{ id: 'heist', state: 'active' }]; const dar = Game.npcs.find(n => n.id === 'darlene');
  Story.talk(dar); step(40); log.push('darlene says: ' + (Game.talk ? JSON.stringify(Game.talk.q.map(e => e.call ? 'CALL' : e[1])).slice(0, 200) : Game.mode)); const ch = [...document.querySelectorAll('.choice')].map(c => c.textContent); log.push('darlene nag: ' + ch.join(' / '));
  const buy = [...document.querySelectorAll('.choice')].find(c => /buy/.test(c.textContent)); if (!buy) bad.push('favor nag walls off Darlene’s shop');
  else { buy.click(); step(2); for (let i = 0; i < 20 && Game.mode === 'talk' && !document.querySelector('.choice'); i++) { Input.press('a'); step(20); } const cs = [...document.querySelectorAll('.choice')]; const sh = cs.find(c => /shop|buy|browse/i.test(c.textContent)); if (sh) sh.click(); step(2); log.push('mode after buy: ' + Game.mode); if (Game.mode !== 'shop') bad.push('buy option did not reach the shop'); closeShop(); }
  Game.favors = [];
  // 5. pass out in the boat: boat goes home
  Object.assign(Game.dan, { ride: 'boat' }); Game.boat.x += 200; blackout(); talk(); const home = World.spots.boat;
  if (Math.hypot(Game.boat.x - home.x, Game.boat.y - home.y) > 2) bad.push('boat stranded after blackout');
  // 6. declined gig goes away
  go('swamp', 8, { case1Won: true }); const G = Game.gigs || (Game.flags.gigs); const offers = (typeof G_ === 'function' ? G_() : G).offers; const who = Object.keys(offers).find(k => k !== 'bubba');
  if (who) { const n = Game.npcs.find(q => q.id === who); if (n) { Gigs.offer(n); talk(); /* clicks "I'm in" */ } log.push('gig test npc: ' + who); }
  // 7. bales re-count on a replayed day 14
  go('miami', 14, { case3Won: true, case4Won: true, balesDone: true }); log.push('bales flag on replay: ' + Game.flags.balesDone); if (Game.flags.balesDone) bad.push('balesDone survives the replay');
  return { log, bad };
});
console.log(r.log.join('\n')); errs.push(...r.bad);
console.log('errors:', errs.length ? errs : 'none'); await b.close();
