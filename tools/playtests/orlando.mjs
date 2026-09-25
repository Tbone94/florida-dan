// Orlando, end to end: Case 10 (bus → timeshare stay-awake → park gate → the mouse incident → Squeak Sneak (caught once,
// then out) → Kyle + the orange grove → Sir Chomps → trial) and Case 11 (payphone calls → I-4 cooler run → the gang
// arrives → Merle's fish fry → the gang → Space Squeak Mountain (barf, then the photo) → night sneak for the memo →
// the five-judge finale → THE END credits), then an endless Orlando day (gigs, the souvenir shop, the bus with all five
// stops). Every step asserts; set-piece screenshots go to argv (default /tmp/fd-orlando). PORT env picks the server.
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
import fs from 'fs';
const A = process.argv.slice(2), mobile = A.includes('mobile'), OUT = A.find(a => a.startsWith('/')) || '/tmp/fd-orlando', PORT = process.env.PORT || 8811;
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext(mobile ? { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 720 } });
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto(`http://localhost:${PORT}/index.html?t=` + Date.now()); await p.waitForTimeout(1500);
const tag = mobile ? 'm' : 'd';
const shot = async n => { await p.waitForTimeout(120); await p.screenshot({ path: `${OUT}/${tag}-${n}.png` }); };
const ev = (fn, a) => p.evaluate(fn, a);
await ev(() => {
  window.TRAILER = true; try { localStorage.clear(); } catch (e) { } begin(false);
  window.bad = []; window.log = [];
  window.step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } };
  window.snap = () => { Game.cam.x = Game.dan.x - VW / 2; Game.cam.y = Game.dan.y - VH / 2 - 10; step(2); };
  window.talk = (pick = 0) => { for (let i = 0; i < 500 && (Game.mode === 'talk' || Game.mode === 'scene'); i++) { if (Game.mode === 'scene') { Input.set('a', true); step(10); Input.set('a', false); continue; } step(6); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[Math.min(pick, cs.length - 1)].click(); else Input.press('a'); step(1); } };
  window.mash = () => { for (let i = 0; i < 60 * 12 && Game.mode === 'mash'; i++) { Input.press('a'); step(1); } };
  window.wrestle = () => { for (let i = 0; i < 60 * 30 && Game.mode === 'wrestle'; i++) { Input.press('a'); const w = Wrestle.w; if (w && w.prompt) Input.press(w.prompt); step(1); } };
  window.objection = (stopAt) => { for (let i = 0; i < 60 * 60 && (Game.mode === 'objection' || Game.mode === 'talk' || Game.mode === 'court'); i++) {
    if (stopAt && stopAt()) return;
    if (Game.mode === 'objection') { const s = Objection.s; if (s && s.phase === 'show' && s.list[s.i].lie && s.t > .3) Input.press('a'); if (s && s.phase === 'react' && s.t > .5) Input.press('a'); step(1); continue; }
    if (Game.mode === 'talk') { step(6); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[0].click(); else Input.press('a'); step(1); continue; }
    break; } };
  window.need = (ok, msg) => { if (!ok) bad.push(msg); };
  window.talkTo = id => { const n = Game.npcs.find(q => q.id === id); if (!n) { bad.push('no npc ' + id + ' in ' + Game.region + ' day ' + Game.day); return; } Object.assign(Game.dan, { x: n.x, y: n.y + 16, dir: 'up', ride: null }); Story.talk(n); };
  window.at = (spot, dx = 0, dy = 0, dir = 'down') => { Object.assign(Game.dan, { x: spot.x + dx, y: spot.y + dy, dir, ride: null }); snap(); };
  window.ixl = () => { const ix = interaction(); return ix ? ix.label : ''; };
  window.nextDay_ = () => { endDay('late'); step(2); $('nextBtn').click(); if (!$('credits').hidden) $('creditsBtn').click(); talk(); };
  // a real sneak along the open lanes (around the fountain and the bench); wave whenever a cone is on you
  window.sneakBot = (night) => { let t = 0, i = 0; const W = [[160, 150], [118, 190], [160, 250], [160, 340], [160, 420], [106, 444], [160, 480], [160, 624]]; if (night) { W.reverse(); W.push([160, 60]); W.shift(); }
    const keys = ['a', 'up', 'down', 'left', 'right'], off = () => keys.forEach(k => Input.set(k, false));
    while (Game.mode === 'sneak' && t++ < 60 * 90) { const s = Sneak.s; if (!s) break; if (s.done) { off(); step(1); continue; }
      const seen = s.guards.some(gd => Sneak.sees(gd, s.x, s.y)), wait = seen && s.sus > .2, [tx, ty] = W[Math.min(i, W.length - 1)];
      if (Math.hypot(tx - s.x, ty - s.y) < 6 && i < W.length - 1) i++;
      off(); if (wait) Input.set('a', true); else { if (tx > s.x + 3) Input.set('right', true); if (tx < s.x - 3) Input.set('left', true); if (ty > s.y + 3) Input.set('down', true); if (ty < s.y - 3) Input.set('up', true); }
      step(1); }
    off(); return t; };
  talk(); for (const id in ARCS) ARC(id).no = 999;
  Object.assign(Game.flags, { case1Won: true, case2Won: true, case3Won: true, case4Won: true, case5Won: true, case6Won: true, case7Won: true, case8Won: true, case9Won: true, keysFrom: 23, noChase: true, trashBaby: true });
  // the morning after the Atocha Job: nextDay sets orlandoFrom
  Game.mode = 'play'; World.load('keys'); Game.day = 28; nextDay(); talk();
  need(Game.flags.orlandoFrom === 29, 'orlandoFrom not set after day 28: ' + Game.flags.orlandoFrom);
  need(Cases.info().n === 10 && Cases.info().d === 1, 'day 29 is not case 10 day 1: ' + JSON.stringify(Cases.info()));
  need(!!Q('bus10'), 'no bus quest on day 29');
});
// ---- Case 10, day 1 ----
await ev(() => { at(World.spots.stationDoor, 0, 6); busMenu(); step(20); const cs = [...document.querySelectorAll('.choice')]; log.push('bus from the Keys: ' + cs.map(c => c.textContent).join(' | '));
  const c = cs.find(b => /Orlando/.test(b.textContent)); need(!!c, 'bus has no Orlando stop'); if (c) c.click(); step(2); talk(); step(5);
  need(ORLANDO(), 'not in Orlando after the bus'); need(qOpen('timeshare'), 'no timeshare quest on arrival'); need(!!questTarget(currentQuest()), 'no arrow to the timeshare'); snap(); });
await shot('01-arrive');
await ev(() => { talkTo('chad'); talk(); need(Game.mode === 'mash', 'stay-awake mash did not start: ' + Game.mode); step(60 * 4); });
await shot('02-timeshare');
await ev(() => { mash(); talk(); need(Game.flags.tickets && qOpen('park'), 'no tickets / park quest after the pitch');
  at(World.spots.gateOut, 0, 4, 'up'); need(/Enter SqueakyLand/.test(ixl()), 'no gate prompt: ' + ixl()); interaction().fn(); step(3);
  need(inPark(Game.dan.x, Game.dan.y), 'not inside the park'); need(qOpen('squeaky'), 'no Mr. Squeaky quest'); need(!!Game.npcs.find(n => n.id === 'squeaky'), 'no Mr. Squeaky'); snap(); });
await shot('03-park');
await ev(() => { talkTo('squeaky'); step(60 * 2.6); });
await shot('04-incident');
await ev(() => { talk(); need(Game.flags.suitOn && Game.dan.mascot, 'Dan not in the suit'); need(Game.mode === 'sneak', 'Squeak Sneak did not start: ' + Game.mode); step(60 * 2); });
await shot('05-sneak');
await ev(() => {
  // get caught once: park Dan in a guard's cone
  const s = Sneak.s, gd = s.guards[0]; s.sus = .97; s.x = gd.x + Math.cos(gd.a) * 30; s.y = gd.y + Math.sin(gd.a) * 30; Input.set('right', true); step(60 * 3); Input.set('right', false);
  need(Game.mode === 'talk', 'getting caught did not end the sneak: ' + Game.mode); talk(); step(3); need(Game.mode === 'sneak', 'retry did not restart the sneak: ' + Game.mode);
  const frames = sneakBot(false); log.push(`day sneak bot: ${Game.mode === 'sneak' ? 'STALLED' : 'finished'} in ${(frames / 60).toFixed(1)}s`);
  if (Game.mode === 'sneak') { Sneak.s.x = 160; Sneak.s.y = 594; Sneak.s.sus = 0; Input.set('down', true); step(60 * 3); Input.set('down', false); }
  talk(); need(Game.flags.escaped && !qOpen('escape'), 'did not escape the park'); need(qOpen('bed'), 'no bed quest after the escape'); need(!inPark(Game.dan.x, Game.dan.y), 'still inside the park');
  snap(); });
await shot('06-escaped');
await ev(() => { log.push('day 29 headlines: ' + Game.day_.headlines.length); nextDay_(); });
// ---- Case 10, day 2 ----
await ev(() => {
  need(Cases.info().n === 10 && Cases.info().d === 2, 'day 30 is not case 10 day 2: ' + JSON.stringify(Cases.info())); need(!Game.dan.mascot, 'still in the suit on day 2');
  need(qOpen('kyle') && qOpen('video'), 'day 30 quests missing: ' + Game.quests.map(q => q.id));
  talkTo('chad'); talk(); need(Game.flags.kyleTip, 'Chad gave no tip'); talkTo('kyle'); talk(); need(qOpen('oranges'), 'no orange quest');
  // punch the grove until six oranges are in hand
  for (let k = 0; k < 40 && (Game.inv.orange || 0) < 6; k++) {
    const tr = World.props.filter(q => q.kind === 'otree')[k % 6]; Object.assign(Game.dan, { x: tr.x + 6, y: tr.y + 16, dir: 'up', ride: null }); Game.punchCd = 0; Input.press('punch'); step(3);
    for (const o of Game.pickups.filter(q => q.kind === 'orange')) { Game.dan.x = o.x; Game.dan.y = o.y; step(2); }
  }
  snap(); need((Game.inv.orange || 0) >= 6, 'could not punch 6 oranges: ' + Game.inv.orange);
});
await shot('07-grove');
await ev(() => { talkTo('kyle'); talk(); need(Game.flags.kyleIn && !qOpen('kyle'), 'Kyle did not agree to testify');
  talkTo('todd'); talk(); const a = Game.animals.find(q => q.chomps); need(!!a, 'no Sir Chomps');
  if (a) { a.cd = 99; Object.assign(Game.dan, { x: a.x + 14, y: a.y, dir: 'left' }); a.lurk = false; a.stun = 0; step(1); need(/WRESTLE/.test(ixl()), 'no wrestle prompt at Sir Chomps: ' + ixl()); interaction().fn(); step(30); } });
await shot('08-chomps');
await ev(() => { need(Game.mode === 'wrestle', 'Sir Chomps wrestle did not start: ' + Game.mode); wrestle(); talk(); need(Game.flags.phoneGot && !qOpen('video'), 'no phone from Sir Chomps'); need(qOpen('bed'), 'no bed quest on day 30'); nextDay_(); });
// ---- Case 10, day 3: court ----
await ev(() => { need(Cases.courtCase() === 'whimsy', 'no whimsy court case on day 31: ' + Cases.courtCase()); at(World.spots.court, 0, 8, 'up'); need(/courthouse/.test(ixl()), 'no courthouse prompt: ' + ixl()); interaction().fn(); step(10); talk(); step(3); });
await shot('09-court10');
await ev(() => { objection(); step(10); need(Game.flags.case10Won, 'case 10 not won'); endDay('late'); step(2); $('nextBtn').click(); need(!$('credits').hidden && /WHIMSY/.test($('credits').querySelector('h2').textContent), 'no case 10 credits'); $('creditsBtn').click(); talk();
  need(Cases.info().n === 11 && Cases.info().d === 1, 'day 32 not case 11 day 1: ' + JSON.stringify(Cases.info())); need(ORLANDO(), 'not in Orlando on day 32'); need(!Game.view, 'camera zoom left on after court'); });
// ---- Case 11, day 1 ----
await ev(() => { need(qOpen('calls'), 'no calls quest'); at(World.spots.phone, 0, 2, 'up'); need(/witnesses/.test(ixl()), 'no payphone prompt: ' + ixl()); interaction().fn(); talk(); need(qOpen('i4'), 'no I-4 quest after the calls');
  const c = Game.cooler; at(c); need(/cooler/i.test(ixl()), 'cannot ride the cooler: ' + ixl()); interaction().fn();
  const o = World.spots.onramp; Object.assign(Game.dan, { x: o.x, y: o.y }); Object.assign(Game.cooler, { x: o.x, y: o.y }); step(1); need(/FLOOR IT/.test(ixl()), 'no I-4 prompt on the cooler: ' + ixl()); interaction().fn();
  need(Game.mode === 'bridge' && Bridge.s.skin === 'i4', 'I-4 run did not start'); Input.set('up', true); step(60 * 5); });
await shot('10-i4');
await ev(() => { let n = 0; while (Game.mode === 'bridge' && n++ < 60 * 90) step(1); Input.set('up', false); log.push('I-4 best ' + Game.flags.i4Best);
  step(60 * 2.5); });
await shot('11-gang-arrives');
await ev(() => { talk(); need(Game.flags.gangHere && !qOpen('i4'), 'the gang did not arrive'); need(qOpen('fishfry'), 'no fish fry quest'); need(!!Game.npcs.find(n => n.id === 'brenda'), 'no Brenda in person');
  need(Game.flags.bridgeBest === undefined, 'I-4 run wrote the Seven Mile Bridge record');
  // a real cast at Lake Lola works (freshwater)
  at(World.spots.dockEnd, 0, 0, 'right'); need(/Cast/.test(ixl()), 'no fishing at Lake Lola: ' + ixl());
  for (let i = 0; i < 3; i++) Game.catchBag.push({ name: 'Largemouth Bass', lbs: 4 }); Game.inv.fish = 3; step(2); need(/Bring the fish/.test(Q('fishfry').text), 'fish fry quest text not updated: ' + Q('fishfry').text);
  at(World.spots.pool, 0, 0); snap(); });
await shot('12-pool');
await ev(() => { talkTo('o_merle'); step(60 * 2.2); });
await shot('13-fishfry');
await ev(() => { talk(); need(Game.flags.fishFry && qOpen('bed'), 'no fish fry'); nextDay_(); });
// ---- Case 11, day 2 ----
await ev(() => {
  need(Cases.info().n === 11 && Cases.info().d === 2, 'day 33 not case 11 day 2'); need(qOpen('coaster') && qOpen('memo'), 'day 33 quests missing: ' + Game.quests.map(q => q.id));
  for (const id of ['brenda', 'o_merle', 'o_darlene', 'o_rhonda', 'o_kayden']) { talkTo(id); talk(); } step(2); need(!qOpen('gang'), 'gang quest still open: ' + (Q('gang') || {}).text);
  at(World.spots.gateOut, 0, 4, 'up'); interaction().fn(); step(3); need(inPark(Game.dan.x, Game.dan.y), 'free pass did not work on day 33');
  // ride drunk: barf
  Game.fx.buzz = 100; at(World.spots.coaster, 0, 0, 'up'); need(/Space Squeak/.test(ixl()), 'no coaster prompt: ' + ixl()); interaction().fn(); need(Game.mode === 'coaster', 'coaster did not start');
  let n = 0; while (Game.mode === 'coaster' && n++ < 60 * 60) step(1); talk(); need(!Game.flags.ridePhoto && Game.day_.coasterBarf, 'drunk ride did not barf');
  Game.fx.buzz = 0; interaction().fn(); Input.set('a', true); step(60 * 9); });
await shot('14-coaster');
await ev(() => { let n = 0; while (Game.mode === 'coaster' && n++ < 60 * 60) step(1); Input.set('a', false); talk(); need(Game.flags.ridePhoto && !qOpen('coaster'), 'no ride photo on a braced sober ride');
  at(World.spots.door, 0, 4, 'up'); need(/Wait for dark/.test(ixl()), 'no wait-for-dark prompt: ' + ixl()); interaction().fn(); need(Game.hour >= 20, 'did not get dark');
  at(World.spots.gateOut, 0, 4, 'up'); need(/after hours/.test(ixl()), 'no night sneak prompt: ' + ixl()); interaction().fn(); talk(); need(Game.mode === 'sneak' && Sneak.s.night, 'night sneak did not start'); step(60 * 2); });
await shot('15-sneak-night');
await ev(() => { const frames = sneakBot(true); log.push(`night sneak bot: ${Game.mode === 'sneak' ? 'STALLED' : 'finished'} in ${(frames / 60).toFixed(1)}s, won=${!!Game.flags.memo || Game.mode === 'talk'}`);
  if (Game.mode === 'sneak') { Sneak.s.x = 160; Sneak.s.y = 70; Sneak.s.sus = 0; Input.set('up', true); step(60 * 3); Input.set('up', false); }
  talk(); if (!Game.flags.memo && Q('memo') && qOpen('memo')) { log.push('night sneak bot got caught; retrying by hand'); at(World.spots.gateOut, 0, 4, 'up'); interaction().fn(); talk(); Sneak.s.x = 160; Sneak.s.y = 70; Input.set('up', true); step(60 * 3); Input.set('up', false); talk(); }
  need(Game.flags.memo && !qOpen('memo'), 'no memo'); Game.hour = 22.5; step(5); need(Game.mode === 'play' || Game.mode === 'talk', 'weird mode at 10:30 PM: ' + Game.mode); talk(); nextDay_(); });
// ---- Case 11, day 3: the finale ----
await ev(() => { need(Cases.courtCase() === 'finale', 'no finale court case on day 34: ' + Cases.courtCase()); need(!!Game.npcs.find(n => n.id === 'o_gus'), 'the gang is not at the courthouse');
  at(World.spots.court, 0, 8, 'up'); interaction().fn(); step(10); talk(); objection(() => Game.mode === 'objection'); step(20); });
await shot('16-court-panel');
await ev(() => { objection(() => Game.scene === 'finale'); step(60); });
await shot('17-finale-parade');
await ev(() => { objection(); talk(); step(5); need(Game.flags.case11Won && Game.flags.theEnd, 'case 11 not won'); need(!$('gazette').hidden, 'no gazette after the finale'); $('nextBtn').click(); step(2);
  need(!$('credits').hidden && $('credits').querySelector('h2').textContent === 'THE END', 'no THE END credits: ' + $('credits').querySelector('h2').textContent); });
await shot('18-credits');
await ev(() => { $('creditsBtn').click(); talk(); need(Cases.info().n === 0, 'day 35 not endless: ' + JSON.stringify(Cases.info())); need(Game.mode === 'play', 'endless morning stuck in ' + Game.mode); need(ORLANDO(), 'not in Orlando on day 35');
  at(World.spots.stationDoor, 0, 6); busMenu(); step(20); const stops = [...document.querySelectorAll('.choice')].map(c => c.textContent); log.push('bus from Orlando: ' + stops.join(' | '));
  for (const r of ['swamp', 'Miami', 'Daytona', 'Keys']) need(stops.some(s => s.includes(r)), 'bus missing ' + r); talk();
  // go home and back: the swamp bus lists Orlando
  travel('swamp'); talk(); step(3); at(World.spots.stationDoor || { x: 20.5 * TS, y: 43.5 * TS }); busMenu(); step(20); const home = [...document.querySelectorAll('.choice')].map(c => c.textContent); need(home.some(s => /Orlando/.test(s)), 'swamp bus has no Orlando: ' + home.join('|')); talk();
  travel('orlando'); talk(); step(3); need(ORLANDO(), 'could not bus back to Orlando'); });
// ---- endless Orlando: gigs + the souvenir shop ----
await ev(() => {
  Game.money = 500; talkTo('gloria'); for (let i = 0; i < 60 && !document.querySelector('.choice'); i++) { Input.press('a'); step(2); } const br = [...document.querySelectorAll('.choice')].find(c => /Browse/.test(c.textContent)); need(!!br, 'Gloria has no shop'); if (br) br.click(); step(3);
  need(Game.mode === 'shop' && /SOUVENIR/.test(document.querySelector('#shop h2').textContent), 'souvenir shop did not open');
  for (const k of ['ears', 'wristband', 'turkeyleg']) { const row = [...document.querySelectorAll('.shopRow')].find(r => r.dataset.k === k); need(!!row, 'shop missing ' + k); if (row) row.click(); step(1); }
  need(hasUp('ears') && hasUp('wristband') && Game.inv.turkeyleg >= 1, 'shop purchases failed'); closeShop(); talk(); useItem('turkeyleg'); step(5);
  const G = G_(); G.offers = {}; G.active = null;
  Gigs.accept('ducks'); for (const d of Game.animals.filter(a => a.gigD)) { d.x += 300; d.hx = d.x; } step(5); need(G.done.includes('ducks'), 'ducks gig did not complete');
  Gigs.accept('earlybird'); Game.inv.hotdog = 4; talkTo('dolores'); talk(); need(G.done.includes('earlybird'), 'early bird gig did not complete');
  Gigs.accept('wrangle'); const a = Game.animals.find(q => q.gig === 'wrangle'); need(!!a, 'no runaway gator'); if (a) { a.cd = 99; a.stun = 0; a.lurk = false; Object.assign(Game.dan, { x: a.x - 14, y: a.y, dir: 'right' }); step(1); const ix = interaction(); if (ix && /WRESTLE/.test(ix.label)) { ix.fn(); wrestle(); } }
  talk(); need(G.done.includes('wrangle'), 'wrangle gig did not complete');
  log.push('ears: ' + hasUp('ears') + ', end of endless: mode ' + Game.mode + (Game.talk ? ' talk ' + JSON.stringify(Game.talk.q[0]).slice(0, 80) : ''));
  talk(); Game.hour = 12; at(World.spots.photo, 34, 18); snap(); });
await shot('19-endless');
const r = await ev(() => ({ bad, log }));
console.log(r.log.join('\n')); errs.push(...r.bad);
console.log('errors:', errs.length ? errs : 'none'); await b.close();
