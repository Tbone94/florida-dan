// The Keys, end to end: Case 8 (bus → Seven Mile Bridge run → Captain Lou → the declaration → flag/citizens/sunset → trial)
// and Case 9 (snorkel doubloon → Rex → Gus + tarpon → wreck dive → Rex boat chase → claim → trial → credits), then an
// endless Keys day. Every step asserts; screenshots of the set pieces go to argv[2] (default /tmp/fd-keys).
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
import fs from 'fs';
const A = process.argv.slice(2), mobile = A.includes('mobile'), OUT = A.find(a => a.startsWith('/')) || '/tmp/fd-keys';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext(mobile ? { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 720 } });
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:8811/index.html?t=' + Date.now()); await p.waitForTimeout(1500);
const tag = mobile ? 'm' : 'd';
const shot = async n => { await p.waitForTimeout(120); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
const ev = (fn, a) => p.evaluate(fn, a);
await ev(() => {
  window.TRAILER = true; try { localStorage.clear(); } catch (e) { } begin(false);
  window.bad = []; window.log = [];
  window.step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } };
  window.snap = () => { Game.cam.x = Game.dan.x - VW / 2; Game.cam.y = Game.dan.y - VH / 2 - 10; step(2); };
  window.talk = (pick = 0) => { for (let i = 0; i < 400 && (Game.mode === 'talk' || Game.mode === 'scene'); i++) { if (Game.mode === 'scene') { Input.set('a', true); step(10); Input.set('a', false); continue; } step(6); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[Math.min(pick, cs.length - 1)].click(); else Input.press('a'); step(1); } };
  window.mash = () => { for (let i = 0; i < 60 * 12 && Game.mode === 'mash'; i++) { Input.press('a'); step(1); } };
  window.dance = () => { for (let i = 0; i < 60 * 16 && Game.mode === 'dance'; i++) { const s = Dance.s; if (s) { const n = s.seq.find(q => q.hit === null && Math.abs(q.t - s.t) < .06); if (n) Input.press(n.dir); } step(1); } };
  window.objection = () => { for (let i = 0; i < 60 * 40 && (Game.mode === 'objection' || Game.mode === 'talk' || Game.mode === 'court'); i++) {
    if (Game.mode === 'objection') { const s = Objection.s; if (s && s.phase === 'show' && s.list[s.i].lie && s.t > .3) Input.press('a'); if (s && s.phase === 'react' && s.t > .5) Input.press('a'); step(1); continue; }
    if (Game.mode === 'talk') { step(6); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[0].click(); else Input.press('a'); step(1); continue; }
    break; } };
  window.need = (ok, msg) => { if (!ok) bad.push(msg); };
  window.talkTo = id => { const n = Game.npcs.find(q => q.id === id); if (!n) { bad.push('no npc ' + id + ' in ' + Game.region); return; } Object.assign(Game.dan, { x: n.x, y: n.y + 16, dir: 'up', ride: null }); Story.talk(n); };
  window.nextDay_ = () => { endDay('late'); step(2); $('nextBtn').click(); if (!$('credits').hidden) $('creditsBtn').click(); talk(); };
  talk(); for (const id in ARCS) ARC(id).no = 999;
  Object.assign(Game.flags, { case1Won: true, case2Won: true, case3Won: true, case4Won: true, case5Won: true, case6Won: true, case7Won: true, noChase: true, trashBaby: true });
  // the morning after the Daytona 250: nextDay sets keysFrom
  Game.mode = 'play'; World.load('daytona'); Game.day = 22; nextDay(); talk();
  need(Game.flags.keysFrom === 23, 'keysFrom not set after day 22: ' + Game.flags.keysFrom);
  need(Cases.info().n === 8 && Cases.info().d === 1, 'day 23 is not case 8 day 1');
  need(!!Q('bus8'), 'no bus quest on day 23');
});
// ---- Case 8, day 1 ----
await ev(() => { const s = World.spots.stationDoor; Object.assign(Game.dan, { x: s.x, y: s.y + 6 }); busMenu(); step(20); const c = [...document.querySelectorAll('.choice')].find(b => /Keys/.test(b.textContent)); need(!!c, 'bus has no Keys stop'); if (c) c.click(); step(2); talk(); step(5);
  need(KEYS(), 'not in the Keys after the bus'); need(qOpen('bridge'), 'no bridge quest on arrival'); snap(); });
await shot('01-arrive');
await ev(() => { const c = Game.cooler; Object.assign(Game.dan, { x: c.x, y: c.y }); let ix = interaction(); need(ix && /cooler/i.test(ix.label), 'cannot ride cooler at Marathon: ' + (ix && ix.label)); ix.fn();
  const w = World.spots.bridgeW; Object.assign(Game.dan, { x: w.x, y: w.y }); Object.assign(Game.cooler, { x: w.x, y: w.y }); ix = interaction(); need(ix && /FLOOR IT/.test(ix.label), 'no bridge prompt on the cooler: ' + (ix && ix.label)); ix.fn(); need(Game.mode === 'bridge', 'bridge minigame did not start');
  Input.set('up', true); step(60 * 6); });
await shot('02-bridge');
await ev(() => { let n = 0; while (Game.mode === 'bridge' && n++ < 60 * 90) step(1); Input.set('up', false); log.push('bridge done, best ' + Game.flags.bridgeBest);
  need(Game.mode === 'play' && Game.dan.ride === 'cooler' && Game.dan.x > 46 * TS, 'bridge run did not land on Big Pine'); need(qOpen('lou'), 'no Lou quest after bridge'); talk(); });
await ev(() => { talkTo('lou'); talk(); need(qOpen('sunset'), 'no sunset quest after Lou'); const d = World.spots.door; Object.assign(Game.dan, { x: d.x + 4, y: d.y, ride: null }); Game.hour = 12;
  let ix = interaction(); need(ix && /Wait for the sunset/.test(ix.label), 'no wait-for-sunset prompt: ' + (ix && ix.label)); ix.fn(); ix = interaction(); need(ix && /Toast/.test(ix.label), 'no toast prompt after 6 PM'); ix.fn(); step(60 * 9); snap(); });
await shot('03-declaration');
await ev(() => { talk(); need(Game.flags.declared, 'not declared after the scene'); need(qOpen('bed'), 'no bed quest after declaring'); log.push('day 23 headlines: ' + Game.day_.headlines.length); nextDay_(); });
// ---- Case 8, day 2 ----
await ev(() => {
  need(Cases.info().n === 8 && Cases.info().d === 2, 'day 24 is not case 8 day 2: ' + JSON.stringify(Cases.info()));
  need(['flag', 'citizens', 'sunset2'].every(q => qOpen(q)), 'day 24 quests missing: ' + Game.quests.map(q => q.id));
  talkTo('moe'); talk(); need(qOpen('flag'), 'flag done without lobsters');
  Game.inv.lobster = 3; talkTo('moe'); talk(); need(Game.flags.flagBack && !qOpen('flag'), 'flag not returned for 3 lobsters');
  talkTo('pearl'); talk(); need(!Game.flags.citCat, 'cat joined without a fish');
  Game.catchBag.push({ name: 'Snapper', lb: 3 }); Game.inv.fish = 1; talkTo('pearl'); talk(); need(Game.flags.citCat, 'cat did not join for a fish');
  const r = Game.animals.find(a => a.citizen); need(!!r, 'no citizen rooster'); if (r) { const d = World.spots.door; r.x = d.x + 30; r.y = d.y; step(3); }
  need(Game.flags.citRooster, 'rooster not a citizen at the houseboat');
  talkTo('brayden'); step(30); talk(); mash(); talk(); need(Game.flags.citBrayden, 'Brayden did not join after the chug-off');
  need(!qOpen('citizens'), 'citizens quest still open');
  Game.hour = 12; talkTo('mike'); step(20); talk(); need(Game.hour >= 17, 'waiting for the show did not jump to 5 PM');
  talkTo('mike'); step(20); talk(); need(Game.mode === 'dance', 'sunset dance did not start: ' + Game.mode); step(60 * 3);
});
await shot('04-sunset');
await ev(() => { dance(); talk(); need(Game.flags.recognized && !qOpen('sunset2'), 'not recognized after the dance'); nextDay_(); });
// ---- Case 8, day 3: court ----
await ev(() => {
  need(Cases.courtCase() === 'republic', 'no republic court case on day 25: ' + Cases.courtCase());
  const c = World.spots.court; Object.assign(Game.dan, { x: c.x, y: c.y + 8, ride: null }); const ix = interaction(); need(ix && /courthouse/.test(ix.label), 'no courthouse prompt'); ix.fn(); talk(); objection(); step(10);
  need(Game.flags.case8Won, 'case 8 not won'); nextDay_();
  need(Cases.info().n === 9 && Cases.info().d === 1, 'day 26 not case 9 day 1'); need(KEYS(), 'not in the Keys on day 26');
});
// ---- Case 9, day 1 ----
await ev(() => {
  need(qOpen('snorkel'), 'no snorkel quest'); need(!Game.view, 'camera zoom left on after court: ' + JSON.stringify(Game.view)); log.push('fx on day 26: ' + JSON.stringify(Game.fx) + ' kick ' + Game.kick);
  const o = World.spots.oldbridge; Object.assign(Game.dan, { x: o.x, y: o.y + 4, dir: 'down', ride: null }); step(2); snap();
  const ix = interaction(); need(ix && /Dive/.test(ix.label), 'no dive prompt at the old bridge: ' + (ix && ix.label)); ix.fn(); step(20);
  const cs = [...document.querySelectorAll('.choice')]; const dv = cs.find(c => /Dive/.test(c.textContent)); if (dv) dv.click(); else Input.press('a'); step(3); talk(); step(3);
  need(Game.mode === 'dive', 'dive did not start: ' + Game.mode);
  Input.set('down', true); step(60 * 1.5); Input.set('down', false);
});
await shot('05-dive');
await ev(() => { const s = Dive.s; const dbl = s.things.find(t => t.k === 'doubloon'); need(!!dbl, 'no doubloon in the bridge dive'); if (dbl) Dive.take(dbl);
  s.y = 20; step(2); Input.press('a'); step(80); need(Game.mode !== 'dive', 'could not climb out'); talk();
  need(Game.flags.doubloon && qOpen('gus'), 'doubloon/Gus quest missing'); need(!!Game.npcs.find(n => n.id === 'rex'), 'Rex never showed up');
  talkTo('gus'); talk(); need(qOpen('tarpon'), 'no tarpon quest');
  const tp = World.spots.tarpon; Object.assign(Game.dan, { x: tp.x, y: tp.y - 6, ride: null }); let ix = interaction(); need(ix && /tarpon/.test(ix.label), 'no tarpon prompt: ' + (ix && ix.label)); ix.fn(); step(60); });
await shot('06-tarpon');
await ev(() => { mash(); talk(); need(Game.flags.tarponFed, 'tarpon not fed'); talkTo('gus'); talk(); need(Game.flags.wreckKnown, 'Gus never told the wreck spot'); nextDay_(); });
// ---- Case 9, day 2 ----
await ev(() => {
  need(Cases.info().n === 9 && Cases.info().d === 2, 'day 27 not case 9 day 2');
  const b = World.spots.buoy; Object.assign(Game.boat, { x: World.spots.reef.x, y: World.spots.reef.y }); Object.assign(Game.dan, { x: Game.boat.x, y: Game.boat.y, ride: 'boat', dir: 'down' }); step(2);
  const ix = interaction(); need(ix && /Dive/.test(ix.label), 'no dive prompt from the boat: ' + (ix && ix.label)); ix.fn(); step(20);
  const cs = [...document.querySelectorAll('.choice')]; const dv = cs.find(c => /Dive/.test(c.textContent)); if (dv) dv.click(); step(3); talk(); step(3);
  need(Game.mode === 'dive', 'wreck dive did not start');
  step(60); const s = Dive.s; for (const k of ['bell', 'ball', 'chest']) { const it = s.things.find(t => t.k === k); need(!!it, 'no ' + k + ' in the wreck dive'); if (it) Dive.take(it); }
  s.y = 20; step(2); Input.press('a'); step(80); talk();
  need(Game.flags.wBell && Game.flags.wBall && Game.flags.wChest, 'wreck finds not saved');
  need(!!KeysChase.boat && qOpen('rexchase'), 'Rex chase did not start');
  // chase: sit on him in the boat
  for (let i = 0; i < 60 * 8 && KeysChase.boat; i++) { const kb = KeysChase.boat; Object.assign(Game.dan, { x: kb.x + 6, y: kb.y, ride: 'boat' }); Object.assign(Game.boat, { x: kb.x + 6, y: kb.y }); step(1); }
  talk(); need(Game.flags.chestBack && !qOpen('rexchase'), 'chest not recovered');
  talkTo('moe'); talk(); const m = World.spots.moeDoor; Object.assign(Game.dan, { x: m.x, y: m.y + 4, ride: null }); const ix2 = interaction(); need(ix2 && /claim/.test(ix2.label), 'no claim prompt: ' + (ix2 && ix2.label)); if (ix2) ix2.fn();
  need(!qOpen('claim'), 'claim quest open'); need(!qOpen('wreck'), 'wreck quest open: ' + (Q('wreck') || {}).text);
  nextDay_();
});
// ---- Case 9, day 3: court → credits → endless ----
await ev(() => {
  need(Cases.courtCase() === 'galleon', 'no galleon court case');
  const c = World.spots.court; Object.assign(Game.dan, { x: c.x, y: c.y + 8, ride: null }); interaction().fn(); talk(); objection(); step(10);
  need(Game.flags.case9Won, 'case 9 not won'); need(Game.flags.creditsPending === 9 || !$('gazette').hidden, 'no credits queued');
  nextDay_(); need(Cases.info().n === 0, 'day 29 not endless: ' + JSON.stringify(Cases.info())); need(Game.mode === 'play', 'endless morning stuck in ' + Game.mode);
  // the bus now has all four stops from the Keys
  const s = World.spots.stationDoor; Object.assign(Game.dan, { x: s.x, y: s.y + 6, ride: null }); busMenu(); step(20); const stops = [...document.querySelectorAll('.choice')].map(c => c.textContent); log.push('bus: ' + stops.join(' | ')); need(stops.length >= 4, 'bus missing stops');
  talk(); snap();
});
await shot('07-endless');
const r = await ev(() => ({ bad, log }));
console.log(r.log.join('\n')); errs.push(...r.bad);
console.log('errors:', errs.length ? errs : 'none'); await b.close();
