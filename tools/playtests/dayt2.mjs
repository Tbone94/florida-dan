import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 300)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  window.TRAILER = true; const out = [], log = s => out.push(s);
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 30); render(); hud(); Input.endFrame(); } };
  const talk = (re) => { for (let i = 0; i < 120 && Game.mode === 'talk'; i++) { step(20); const cs = [...document.querySelectorAll('.choice')]; const c = re ? cs.find(b => re.test(b.textContent)) || cs[0] : cs[0]; if (c) c.click(); else Input.press('a'); step(2); } };
  const npc = id => Game.npcs.find(n => n.id === id), go = (o, dy = 16) => { Object.assign(Game.dan, { x: o.x, y: o.y + dy, ride: null, dir: 'up', carry: null }); Game.mode = 'play'; };
  const act = () => { const a = interaction(); if (a) a.fn(); return a && a.label; };
  const mash = () => { for (let i = 0; i < 400 && Game.mode === 'mash'; i++) { Input.press('a'); step(1); } };
  begin(false); talk(); Object.assign(Game.flags, { case5Won: true, case6Won: true, case7Won: true, noChase: true }); Game.money = 600;
  World.load('daytona'); Game.day = 24; startDay(); talk();
  log('D24 daytona offers: ' + JSON.stringify(Game.day_.gig.offers));
  for (const id of ['donuts', 'helmet', 'pitcrew']) {
    const d = GIGS[id], giver = npc(d.giver); Game.day_.gig.offers = { [d.giver]: id }; Game.day_.gig.active = null; go(giver); Story.talk(giver); talk(/in\.”/);
    const acc = Game.day_.gig.active === id;
    if (id === 'donuts') for (const gp of World.props.filter(q => q.kind === 'garage').slice(0, 3)) { go({ x: gp.x + gp.w / 2, y: gp.y + gp.h + 8 }, 0); act(); step(2); }
    if (id === 'helmet') { const h = Game.pickups.find(q => q.kind === 'helmet'); go(h, 0); step(3); log('  carrying ' + Game.dan.carry); Object.assign(Game.dan, { x: giver.x, y: giver.y + 16 }); Game.mode = 'play'; Story.talk(giver); talk(); }
    if (id === 'pitcrew') { step(2); log('  pit mode ' + Game.mode); mash(); step(3); }
    log(`${id}: accepted=${acc} done=${Game.day_.gig.done.includes(id)}`);
  }
  for (const [who, shop] of [['needles', 'ink'], ['wrench', 'speed']]) { go(npc(who)); Story.talk(npc(who)); talk(/Browse/); log(`${shop} shop: ${[...ui.shopList.children].map(x => x.dataset.k).join(',')}`); for (const row of [...ui.shopList.children]) row.click(); Game.mode = 'play'; ui.shop.hidden = true; }
  log('owned: ' + Object.keys(Game.flags.up).join(','));
  headline('FLORIDA MAN TEST DAYTONA STORY', 6); const nb = World.props.find(q => q.kind === 'newsbox'); go({ x: nb.x + 6, y: nb.y + 6 }, 12); log('newsbox: ' + act()); talk(/Bury/); log('buried=' + !Game.day_.headlines.includes('FLORIDA MAN TEST DAYTONA STORY'));
  // cooler with nitro + horn
  Object.assign(Game.cooler, { x: Game.dan.x, y: Game.dan.y }); Game.dan.ride = 'cooler'; Game.gitCd = 0; yell(); step(5); Game.dan.ride = null; log('horn ok');
  // a lost race → retry path: force place 5
  Game.day = 22; Game.flags.raceWon = false; setQuests([['race', 'WIN']]); spawn();
  const car = Game.vehicles.find(v => v.id === 'car29'); go(car, 4); act(); step(100); DaytonaCases.raceDone('race', 5, 30); talk(); log('after loss: race on=' + Speedway.on + ' ride=' + Game.dan.ride + ' ai=' + Speedway.cars.length);
  Car.exit(); step(2); log('abort on exit: on=' + Speedway.on);
  // sleeping at the motel
  Game.day = 24; Game.hour = 21; go(World.spots.door, 4); log('motel: ' + act()); talk(); log('mode=' + Game.mode);
  $('nextBtn').click(); talk(); log('woke: day ' + Game.day + ' region ' + Game.region + ' at motel=' + (Math.hypot(Game.dan.x - World.spots.dan.x, Game.dan.y - World.spots.dan.y) < 4));
  // fishing off the pier
  go({ x: World.spots.pier.x, y: 21.4 * TS }, 0); Game.dan.dir = 'down'; const f = interaction(); log('pier: ' + (f && f.label)); if (f) { f.fn(); step(30); log('fish mode=' + Game.mode + ' ocean=' + (Fishing.f && Fishing.f.fish.every(x => OCEAN.includes(x.sp) || x.sp.junk))); Fishing.exit(); }
  // detector on the Daytona beach
  const s = Detector.spots(); log('beach loot spots: ' + s.length);
  return out.join('\n');
});
console.log(r); console.log('errors:', errs.length ? [...new Set(errs)].slice(0, 6) : 'none'); await b.close();
