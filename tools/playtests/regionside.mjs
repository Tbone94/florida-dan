// side-job etiquette in every region (9/26): whoever the story needs right now doesn't pitch a side job or story,
// and while any side job (arc or gig) is under way nobody else pitches a new one (no "!" / "$" over their heads either).
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  window.TRAILER = true; try { localStorage.clear(); } catch (e) { } begin(false);
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } }, bad = [], out = {};
  const talk = () => { for (let i = 0; i < 300 && (Game.mode === 'talk' || Game.mode === 'scene'); i++) { step(12); const c = document.querySelector('.choice'); if (c) c.click(); else Input.press('a'); } };
  const WON = ['acquitted', 'case2Won', 'case3Won', 'case4Won', 'case5Won', 'case6Won', 'case7Won', 'case8Won', 'case9Won', 'case10Won', 'case11Won'];
  const flagsFor = n => { const F = {}; WON.slice(0, n - 1).forEach(k => F[k] = true); if (n > 5) F.flyer = true; if (n > 6) F.donutRun = true; if (n > 7) { F.raceWon = true; F.keysFrom = 23; } if (n > 8) { F.declared = true; F.houseboat = true; } if (n > 9) F.orlandoFrom = 29; if (n > 10) Object.assign(F, { tickets: true, escaped: true, kyleIn: true, phoneGot: true }); if (n > 11) Object.assign(F, { gangHere: true, fishFry: true, ridePhoto: true, memo: true, theEnd: true }); return F; };
  // [label, case, day, region]
  const SPOTS = [['swamp case 2', 2, 5, 'swamp'], ['miami case 5', 5, 14, 'miami'], ['daytona case 7', 7, 20, 'daytona'], ['keys case 9', 9, 26, 'keys'], ['orlando case 11', 11, 32, 'orlando'],
    ['swamp endless', 12, 35, 'swamp'], ['miami endless', 12, 35, 'miami'], ['daytona endless', 12, 35, 'daytona'], ['keys endless', 12, 35, 'keys'], ['orlando endless', 12, 35, 'orlando']];
  const gig0 = Object.keys(GIGS)[0];
  for (const [lb, n, day, reg] of SPOTS) {
    Object.assign(Game, { day, money: 300, flags: flagsFor(n), headlines: [], catchBag: [], pythons: [] }); Game.mode = 'play'; ui.talk.hidden = true; Game.talk = null;
    World.load(reg); startDay(); talk(); step(5);
    const G = Game.day_.gig || (Game.day_.gig = { offers: {}, active: null, done: [] }), npcs = Game.npcs.filter(x => !x.hidden);
    const wanted = npcs.filter(x => storyWants(x)).map(x => x.id);
    // 1) the person the story needs: no side pitch
    for (const x of npcs) if (storyWants(x)) { G.offers[x.id] = gig0; if (Gigs.offering(x)) bad.push(`${lb}: ${x.id} pitches a gig while the story needs them`); if (Arcs.offering(x)) bad.push(`${lb}: ${x.id} pitches their story while the main story needs them`); delete G.offers[x.id]; }
    // 2) mid-arc: nobody pitches
    for (const x of npcs) G.offers[x.id] = gig0;
    Game.flags.arcs = Game.flags.arcs || {}; Game.flags.arcs.__busy = { ch: 0, st: 'active' };
    const pitching = npcs.filter(x => Gigs.offering(x) || Arcs.offering(x)).map(x => x.id);
    if (pitching.length) bad.push(`${lb}: mid-errand pitches from ${pitching.join(',')}`);
    delete Game.flags.arcs.__busy;
    // 3) mid-gig: no neighbor stories get pitched either
    G.active = gig0; const arcPitch = npcs.filter(x => Arcs.offering(x)).map(x => x.id); if (arcPitch.length) bad.push(`${lb}: arcs pitched mid-gig by ${arcPitch.join(',')}`); G.active = null;
    // sanity: with nothing going on, a free neighbor can still offer
    const free = npcs.find(x => !storyWants(x)); const canOffer = free ? Gigs.offering(free) : null;
    for (const x of npcs) delete G.offers[x.id];
    out[lb] = { region: Game.region, npcs: npcs.length, storyNeeds: wanted, freeCanOffer: canOffer };
    if (free && !canOffer) bad.push(`${lb}: a free neighbor (${free.id}) can't offer anything at all`);
  }
  return { out, bad };
});
console.log(JSON.stringify(r.out, null, 1)); errs.push(...r.bad);
console.log('errors:', errs.length ? errs : 'none'); await b.close();
