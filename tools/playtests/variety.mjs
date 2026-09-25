// The variety pass (sidequests.js), end to end: every new gig (offer → accept → do it → paid → headline → rap sheet),
// every new neighbor-story chapter (Keys: Miss Pearl ×3, Old Gus ×3; Daytona: Tiny ×2) incl. each choice branch,
// the fail/retry paths (melted pies, the mower wins, busted by the bodyguard, Mr. Toes spots you, Mama sees 3 bikers),
// and real driving/sneaking where it matters (cooler routes, the beach run, the bodyguard, tailing the cat).
// usage: node variety.mjs [outdir]   (PORT=8814 to hit another server; default 8811)
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
import fs from 'fs';
const OUT = process.argv.slice(2).find(a => a.startsWith('/')) || '/tmp/fd-variety', PORT = process.env.PORT || 8811;
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto(`http://localhost:${PORT}/index.html?t=${Date.now()}`); await p.waitForTimeout(1500);
const thrown = [], ev = async (fn, a) => { try { return await p.evaluate(fn, a); } catch (e) { thrown.push(String(e.message).split('\n')[0]); } };
const shot = async n => { await ev(() => { snap(); }); await p.waitForTimeout(100); await p.screenshot({ path: `${OUT}/${n}.png` }); };
await ev(() => {
  window.TRAILER = true; try { localStorage.clear(); } catch (e) { } begin(false);
  window.bad = []; window.log = [];
  window.need = (ok, msg) => { if (!ok) bad.push(msg); return ok; };
  window.step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } };
  window.snap = () => { if (Game.mode === 'play') { Game.cam.x = Game.dan.x - VW / 2; Game.cam.y = Game.dan.y - VH / 2 - 10; } step(2); };
  window.talk = (pick = 0) => { for (let i = 0; i < 400 && (Game.mode === 'talk' || Game.mode === 'scene'); i++) { if (Game.mode === 'scene') { Input.set('a', true); step(10); Input.set('a', false); continue; } step(6); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[Math.min(pick, cs.length - 1)].click(); else Input.press('a'); step(1); } };
  window.mash = () => { for (let i = 0; i < 60 * 12 && Game.mode === 'mash'; i++) { Input.press('a'); step(1); } };
  window.npc = id => Game.npcs.find(n => n.id === id);
  window.put = (x, y, ride = null) => { Object.assign(Game.dan, { x, y, ride }); if (ride === 'boat') Object.assign(Game.boat, { x, y }); if (ride === 'cooler') Object.assign(Game.cooler, { x, y }); };
  window.talkTo = (id, pick = 0) => { const n = npc(id); if (!need(n, `no npc ${id} in ${Game.region} day ${Game.day}`)) return; put(n.x, n.y + 16); Game.dan.dir = 'up'; Story.talk(n); talk(pick); };
  window.act = re => { const ix = interaction(); if (!need(ix && re.test(ix.label), `expected prompt ${re} at ${Math.round(Game.dan.x / TS)},${Math.round(Game.dan.y / TS)}, got: ${ix && ix.label}`)) return false; ix.fn(); return true; };
  window.go = (region, day, flags = {}) => { Input.releaseAll(); Game.mode = 'play'; ui.talk.hidden = true; Game.talk = null; World.load(region); Game.day = day; Object.assign(Game.flags, flags); startDay(); talk(); Game.quests = Game.quests.filter(q => q.opt); Game.favors = []; renderQuests(); };
  // hold the arrows toward each waypoint (tiles) until close; the real movement code does the rest
  window.drive = (pts, maxS = 40, until = () => false) => {
    for (const [tx, ty] of pts) {
      const X = tx * TS, Y = ty * TS; let f = 0;
      while (f++ < maxS * 60 && !until()) {
        const D = Game.dan, dx = X - D.x, dy = Y - D.y; if (Math.hypot(dx, dy) < 10) break;
        Input.releaseAll(); if (Math.abs(dx) > 4) Input.set(dx > 0 ? 'right' : 'left', true); if (Math.abs(dy) > 4) Input.set(dy > 0 ? 'down' : 'up', true);
        step(1); if (Game.mode !== 'play') { Input.releaseAll(); talk(); }
      }
      if (until()) break;
    }
    Input.releaseAll(); step(1);
  };
  window.money0 = 0;
  window.offerGig = id => {   // make this the giver's offer today, talk, say yes
    const d = GIGS[id], n = npc(d.giver); if (!need(n, `gig ${id}: giver ${d.giver} missing in ${Game.region}`)) return false;
    Game.day_.gig.offers = { [d.giver]: id }; Game.day_.gig.active = null;
    need(Gigs.offering(n), `gig ${id}: no $ over ${d.giver}`);
    talkTo(d.giver, 0); money0 = Game.money;
    return need(Gigs.active() === id && !!Q('gig_' + id), `gig ${id}: not accepted (active=${Gigs.active()})`);
  };
  window.hlKey = {};
  window.paid = (id, cash, key, re) => {
    need(Game.day_.gig.done.includes(id), `gig ${id}: not done`); need(!Gigs.active(), `gig ${id}: still active`);
    need(Game.money - money0 === cash, `gig ${id}: paid ${Game.money - money0}, expected ${cash}`);
    const h = Game.headlines.find(x => re.test(x.text)); need(h, `gig ${id}: no headline ${re}`); if (h) need(Sheet.keyFor(h.text) === key, `gig ${id}: headline goes to rap sheet key ${Sheet.keyFor(h.text)}, not ${key}`);
    log.push(`${id}: ok (+$${Game.money - money0})`);
  };
  window.arcStart = (id, ch) => {
    const s = ARC(id); Object.assign(s, { ch, st: 'idle', acted: false, no: 0 }); const n = npc(id);
    if (!need(n && Arcs.offering(n), `arc ${id} ch${ch + 1}: no pink ! (npc=${!!n}, gate=${Arcs.chapter(id) && Arcs.chapter(id).gate(Game.flags)})`)) return false;
    talkTo(id, 0); money0 = Game.money;
    return need(s.st === 'active' && !!Q('arc_' + id), `arc ${id} ch${ch + 1}: not started (st=${s.st})`);
  };
  window.arcDone = (id, ch, key, re) => {
    const s = ARC(id); need(s.ch === ch + 1 && s.st === 'idle', `arc ${id} ch${ch + 1}: not finished (ch=${s.ch} st=${s.st} acted=${s.acted})`);
    const h = Game.headlines.find(x => re.test(x.text)); need(h, `arc ${id} ch${ch + 1}: no headline ${re}`); if (h) need(Sheet.keyFor(h.text) === key, `arc ${id} ch${ch + 1}: rap sheet key ${Sheet.keyFor(h.text)}, not ${key}`);
    need(!Arcs.offering(npc(id)) || !Arcs.chapter(id), `arc ${id}: next chapter offered the same day`);
    log.push(`arc ${id} ch${ch + 1}: ok (+$${Game.money - money0})`);
  };
  window.arrow = (label, want) => { const q = currentQuest(), t = q && questTarget(q); need(!!t, `${label}: no objective arrow (quest ${q && q.id})`); if (want) need(t === want || (t && want && Math.hypot(t.x - want.x, t.y - want.y) < 2), `${label}: arrow points at ${t && Math.round(t.x / TS)},${t && Math.round(t.y / TS)}`); };
  talk(); Game.flags.noChase = true; Game.money = 100;
  Object.assign(Game.flags, { acquitted: true, case1Won: true, case2Won: true, case3Won: true, case4Won: true, case5Won: true, case6Won: true, case7Won: true });
});

// ================= SWAMP: Wayne's oregano (both branches) =================
await ev(() => {
  go('swamp', 25); if (!offerGig('oregano')) return; arrow('oregano');
  const t = World.spots.tiki; put(t.x, t.y); const h0 = Game.heat; act(/Hand off Wayne/); talk();
  paid('oregano', 40, 'gigOregano', /OREGANO PIZZA NIGHT/); need(Game.heat > h0, 'oregano: delivering did not add heat');
  go('swamp', 26); if (!offerGig('oregano')) return;
  const r = npc('rhonda'); put(r.x, r.y + 14); step(1); put(r.x, r.y + 14); act(/Talk to Rhonda/); talk(1); step(3); talk();
  need(Gigs.active() === 'oregano', 'oregano: “Nothin’.” should keep the job going');
  put(r.x, r.y + 14); act(/Talk to Rhonda/); talk(0);
  paid('oregano', 15, 'gigSnitch', /IT WAS ACTUALLY OREGANO/); need(Game.day_.gig.done.includes('oregano'), 'oregano (rhonda) not done');
});

// ================= MIAMI: paparazzi (real sneaking), water taxi =================
await ev(() => {
  go('miami', 25); if (!offerGig('paparazzi')) return;
  const c = npc('celeb'), gd = Game.npcs.find(n => n.guard); if (!need(c && gd, 'paparazzi: no celebrity/bodyguard on the beach')) return; arrow('paparazzi', c);
  // busted: walking while he looks
  const P = G_().pap; put(gd.x - 90, gd.y); Object.assign(P, { st: 'scan', k: 0 }); Input.set('right', true); step(4); Input.releaseAll();
  need(P.busts === 1 && Game.dan.x <= gd.x - 60, `paparazzi: walking during a scan did not get Dan busted (busts=${P.busts})`);
});
await ev(() => { const gd = Game.npcs.find(n => n.guard); put(gd.x - 60, gd.y - 26); Object.assign(G_().pap, { st: 'warn', k: .2 }); step(1); });
await shot('mia-paparazzi-warn');
await ev(() => {
  // the real sneak: only move while he's calm
  const c = npc('celeb'), P = G_().pap; put(63.5 * TS, 24 * TS); let f = 0;
  const pts = [[65, 23.8], [68.4, 24.1]]; let i = 0;
  while (f++ < 60 * 60 && i < pts.length) {
    const [tx, ty] = pts[i], dx = tx * TS - Game.dan.x, dy = ty * TS - Game.dan.y;
    if (Math.hypot(dx, dy) < 6) { i++; continue; }
    Input.releaseAll();
    if (P.st === 'calm' && P.k < P.next - .15) { if (Math.abs(dx) > 3) Input.set(dx > 0 ? 'right' : 'left', true); if (Math.abs(dy) > 3) Input.set(dy > 0 ? 'down' : 'up', true); }
    step(1);
  }
  Input.releaseAll(); step(1);
  need(i >= pts.length, `paparazzi: sneak never reached the celebrity (busts=${P.busts})`); need(P.busts === 1, `paparazzi: busted while only moving when he was calm (busts=${P.busts})`);
  act(/SNAP THE PHOTO/); talk(); need(P.photo && !npc('celeb'), 'paparazzi: photo not taken / celeb still there'); arrow('paparazzi (sell)', npc('valet'));
  talkTo('valet'); paid('paparazzi', 45, 'gigPaparazzi', /PHOTO OF CELEBRITY’S FEET/);
  // three busts is its own headline
  go('miami', 26); offerGig('paparazzi'); const P2 = G_().pap, gd = Game.npcs.find(n => n.guard);
  for (let k = 0; k < 3; k++) { put(gd.x - 60, gd.y); Object.assign(P2, { st: 'scan', k: 0 }); Input.set('left', true); step(3); Input.releaseAll(); }
  need(Game.headlines.some(h => Sheet.keyFor(h.text) === 'papBusted'), 'paparazzi: 3 busts made no headline'); Gigs.drop();
});
await ev(() => {
  go('miami', 27); ARC('coral').ch = 9; if (!offerGig('yacht')) return; arrow('yacht', Game.boat);
  const B = Game.boat; put(B.x, B.y, 'boat'); arrow('yacht (in boat)');
  drive([[3.4, 28], [3.6, 25.8]], 20);
});
await shot('mia-yacht-dock');
await ev(() => { act(/Pick up the party guests/); need(G_().yt.aboard === 3, 'yacht: guests not aboard'); drive([[3.2, 28]], 3); });
await shot('mia-yacht-aboard');
await ev(() => {
  drive([[1.5, 27], [1.5, 34.5]], 20); step(2);
  const y = G_().yt; need(y.fell && y.over && y.aboard === 2, `yacht: nobody fell overboard past y 33 (fell=${y.fell})`); arrow('yacht (chad)', y.over);
});
await shot('mia-yacht-overboard');
await ev(() => {
  const y = G_().yt; drive([[1.5, 40.5], [6.2, 43.6]], 25); act(/Drop the guests/); need(!Game.day_.gig.done.includes('yacht'), 'yacht: completed with Chad still in the bay');
  drive([[1.5, 40.5], [1.5, 34], [y.over.x / TS, y.over.y / TS]], 25); act(/Fish Chad/); need(y.aboard === 3, 'yacht: Chad not back aboard');
  drive([[1.5, 34], [1.5, 40.5], [6.2, 43.6]], 25); act(/Drop the guests/); talk(); paid('yacht', 40, 'gigYacht', /WATER TAXI TO YACHT PARTY/);
});

// ================= DAYTONA: beach run (fail + real run), pelicans, Tiny's mama =================
await ev(() => {
  go('daytona', 25); if (!offerGig('beachrun')) return; arrow('beachrun', Game.cooler);
  const P = GIGS.beachrun.pts(); put(P[0].x, P[0].y, 'cooler'); step(2); const br = G_().br; need(br.cp === 1, 'beachrun: did not start at the ramp');
  hud(); need(/BEAT THE MOWER/.test(ui.urgent.textContent) && !ui.urgent.hidden, 'beachrun: no timer on the HUD: ' + ui.urgent.textContent);
  put(74 * TS, 40 * TS, 'cooler'); br.t = 26; step(2); need(br.cp === -1, 'beachrun: timeout did not reset');
  put(P[0].x, P[0].y, 'cooler'); step(2); need(br.cp === 1, 'beachrun: did not restart');
  drive([[74, 40]], 10); step(1);
});
await shot('day-beachrun');
await ev(() => {
  drive([[74, 52], [74, 8], [70.5, 30]], 20, () => !Gigs.active()); const br = G_().br;
  need(br.won, `beachrun: real drive did not win (cp=${br.cp} t=${br.t && br.t.toFixed(1)})`); log.push(`beach run driven in ${br.t && br.t.toFixed(1)}s`);
  paid('beachrun', 35, 'gigBeachRun', /BEATS GUY ON RIDING MOWER/);
});
await ev(() => {
  go('daytona', 26); if (!offerGig('gulls')) return; step(2);
  const birds = Game.animals.filter(a => a.gull); need(birds.length === 3, 'gulls: pelicans not on the roof: ' + birds.length); arrow('gulls');
  const t = World.spots.tattoo; put(t.x - 30, t.y + 40); snap();
});
await shot('day-gulls');
await ev(() => {
  for (let k = 0; k < 3; k++) {
    const a = Game.animals.find(x => x.gull && !x.bonked); if (!a) break;
    put(a.px, a.py + 44); Game.dan.dir = 'up'; step(1); const c0 = Game.inv.can; punch(); need(Game.inv.can === c0 - 1, 'gulls: punch with nothing in reach did not throw a can'); step(50);
  }
  step(60); paid('gulls', 25, 'gigGulls', /PELICANS OFF TATTOO PARLOR/); need(!Game.animals.some(a => a.gull), 'gulls: bonked pelicans never flew off');
});
// Tiny, chapter 1: the escort (strikes, reset, then home)
await ev(() => {
  go('daytona', 27); Game.flags.sqDay = {}; if (!arcStart('tiny', 0)) return; arrow('tiny ch1', World.spots.stationDoor);
  const S = World.spots.stationDoor; put(S.x, S.y + 8); act(/Meet Tiny’s mama/); talk(); const M = SideQuests.tmp.mama; need(M && npc('mama'), 'tiny ch1: no mama');
  put(S.x + 40, S.y + 20); step(60); const m = npc('mama'); need(m && Math.hypot(m.x - Game.dan.x, m.y - Game.dan.y) < 40, 'tiny ch1: mama is not following Dan');
});
await shot('day-mama-follow');
await ev(() => {
  const bk = npc('biker'); for (let k = 0; k < 3; k++) { const m = npc('mama'); if (!m) break; SideQuests.tmp.mama && (SideQuests.tmp.mama.cd = 0); put(bk.x + 20, bk.y); Object.assign(m, { x: bk.x + 10, y: bk.y }); step(2); talk(); }
  need(!SideQuests.tmp.mama && !npc('mama'), 'tiny ch1: 3 biker sightings did not send Mama back to the bus');
  const S = World.spots.stationDoor; put(S.x, S.y + 8); act(/Meet Tiny’s mama/); talk(); const d = World.spots.door, m = npc('mama');
  put(d.x, d.y + 20); Object.assign(m, { x: d.x, y: d.y + 36 }); step(3); talk(); need(ARC('tiny').acted, 'tiny ch1: arriving at the motel did not count');
  talkTo('tiny'); arcDone('tiny', 0, 'mamaEscort', /WITHOUT HER SEEING A SINGLE BIKER/);
});
// Tiny, chapter 2: Bike Night, all three choices
for (const [pick, key, re] of [[0, 'dentalCon', /DENTAL CONVENTION FOR ONE/], [1, 'hellsGranny', /HELL’S GRANNY/], [2, 'mamaArm', /ARM-WRESTLES BIKER’S MOTHER/]]) {
  await ev(([pick]) => {
    go('daytona', 28 + pick); if (!arcStart('tiny', 1)) return; Game.hour = 21;
    const S = World.spots.saloon; put(S.x, S.y + 16); act(/Walk into Bike Night/); for (let i = 0; i < 60 * 4 && Game.mode === 'scene'; i++) step(1);
  }, [pick]);
  if (pick === 0) await shot('day-bikenight');
  await ev(([pick, key, re]) => {
    talk(pick); if (Game.mode === 'mash') { step(30); }
  }, [pick, key, String(re)]);
  if (pick === 2) await p.screenshot({ path: `${OUT}/day-mama-armwrestle.png` });
  await ev(([key, src]) => { mash(); talk(); const re = new RegExp(src.slice(1, -1)); arcDone('tiny', 1, key, re); need(!npc('mama'), 'tiny ch2: mama left over after Bike Night'); }, [key, String(re)]);
}

// ================= THE KEYS: pies, Miss Pearl, Old Gus =================
await ev(() => {
  Game.flags.keysFrom = 23; go('keys', 30); if (!offerGig('pies')) return; arrow('pies', Game.cooler);
  const S = World.spots, front = { x: S.conch.x, y: S.conch.y + 12 }; put(front.x, front.y, 'cooler'); act(/Load twelve key lime pies/);
  const pie = G_().pie; need(pie.on, 'pies: not loaded'); step(2); hud(); need(/PIES MELT IN/.test(ui.urgent.textContent), 'pies: no melt timer: ' + ui.urgent.textContent);
  pie.t = 31; step(2); need(!pie.on, 'pies: did not melt after 30s');
  put(front.x, front.y, 'cooler'); act(/Load twelve/); drive([[75.5, 24.6], [75.5, 30.6]], 10); step(1);
});
await shot('keys-pies-run');
await ev(() => {
  const pie = G_().pie; drive([[13.5, 30.6], [13.5, 39.6], [10.6, 39.6]], 30, () => !pie.on);
  need(pie.on, `pies: melted on the way (t=${pie.t.toFixed(1)})`); log.push(`pies driven in ${pie.t.toFixed(1)}s`);
  act(/Deliver the key lime pies/); talk(); paid('pies', 40, 'gigPies', /TWELVE KEY LIME PIES/);
  // the Keys shopkeepers keep their counters open while you owe them a gig
  go('keys', 31); offerGig('lobsters'); talkTo('joelle', 0); need(Game.mode === 'shop', 'Joelle’s shop is walled off by her own gig (' + Game.mode + ')'); if (Game.mode === 'shop') closeShop(); Gigs.drop();
});
// Miss Pearl: not on a case day she's in the story, then the census
await ev(() => {
  Game.flags.sqDay = {}; ARC('pearl').ch = 0; ARC('pearl').st = 'idle';
  go('keys', 24); need(!Arcs.offering(npc('pearl')), 'pearl: offered a story on case day 8.2 (she’s a witness that day)');
  // an unfinished census must not wall off Mr. Toes’ citizenship on 8.2
  Object.assign(ARC('pearl'), { ch: 0, st: 'active', n: 1 }); addQuest('citizens', 'Recruit 3 citizens for the Republic (0/3)'); Game.flags.citCat = false;
  Game.catchBag.push({ name: 'Snapper', lbs: 3 }); Game.inv.fish = 1; talkTo('pearl'); need(Game.flags.citCat, 'pearl: an active census walled off recruiting Mr. Toes on case day 8.2');
  Object.assign(ARC('pearl'), { ch: 0, st: 'idle', n: 0 }); Game.flags.citCat = false;
  go('keys', 32); if (!arcStart('pearl', 0)) return; step(3);
  need(Game.animals.filter(a => a.type === 'cat' && !a.toes).length >= 5, 'pearl ch1: not enough cats to photograph'); arrow('pearl ch1');
  for (let k = 0; k < 4; k++) { const c = Game.animals.find(a => a.type === 'cat' && !a.snapped && !a.toes); if (!c) break; put(c.x, c.y + 10); act(/Snap a photo of the cat/); step(2); }
  need(ARC('pearl').n === 4, 'pearl ch1: 4 photos not counted: ' + ARC('pearl').n);
});
await shot('keys-pearl-census');
await ev(() => { talkTo('pearl'); arcDone('pearl', 0, 'catCensus', /CAT CENSUS/); });
// chapter 2: tail Mr. Toes (get spotted once, then do it for real)
await ev(() => {
  go('keys', 33); if (!arcStart('pearl', 1)) return; Game.hour = 20;
  const S = World.spots.sixtoe; put(S.x, S.y + 14); act(/Wait for Mr. Toes/); const X = SideQuests.tmp.tail; need(X, 'pearl ch2: tail did not start');
  step(60 * 3); Object.assign(X, { st: 'look', k: 0 }); Input.set('down', true); step(3); Input.releaseAll();
  need(!SideQuests.tmp.tail && !Game.animals.some(a => a.toes), 'pearl ch2: moving while he looked back did not blow the tail');
  put(S.x, S.y + 14); act(/Wait for Mr. Toes/);
});
await ev(() => { let f = 0; while (f++ < 60 * 6) { const X = SideQuests.tmp.tail; if (!X) break; step(1); if (X.st !== 'walk') break; } });
await shot('keys-tail-lookback');
await ev(() => {
  let f = 0;
  while (f++ < 60 * 90 && SideQuests.tmp.tail && Game.mode === 'play') {
    const X = SideQuests.tmp.tail, c = X.cat, dx = c.x - Game.dan.x, dy = c.y - Game.dan.y; Input.releaseAll();
    if (X.st === 'walk' && Math.hypot(dx, dy) > 60) { if (Math.abs(dx) > 6) Input.set(dx > 0 ? 'right' : 'left', true); if (Math.abs(dy) > 6) Input.set(dy > 0 ? 'down' : 'up', true); }
    step(1);
  }
  Input.releaseAll(); log.push(`tail: ${f} frames, ends ${Game.mode}, hour ${Game.hour.toFixed(1)}, fail=${SideQuests.tmp.lastFail} dan ${(Game.dan.x / TS).toFixed(1)},${(Game.dan.y / TS).toFixed(1)}`);
  need(Game.mode === 'scene', 'pearl ch2: the real tail did not reach the conch shack (mode ' + Game.mode + ')');
  for (let i = 0; i < 60 * 4 && Game.mode === 'scene'; i++) step(1);
});
await shot('keys-fritter-scene');
await ev(() => {
  talk(); need(ARC('pearl').acted, 'pearl ch2: tail done but not counted'); need(!Game.animals.some(a => a.toes), 'pearl ch2: Mr. Toes left on the map');
  talkTo('pearl', 0); need(Game.flags.toesCustody, 'pearl ch2: “truth” did not set joint custody'); arcDone('pearl', 1, 'fritter', /DOUBLE LIFE AS "FRITTER"/);
  // the lie branch
  Object.assign(ARC('pearl'), { ch: 1, st: 'active', acted: true }); Game.flags.sqDay = {}; const m0 = Game.money; talkTo('pearl', 1);
  need(Game.headlines.some(h => Sheet.keyFor(h.text) === 'catGang'), 'pearl ch2: the gang lie made no headline'); need(Game.money - m0 === 35, 'pearl ch2 lie: paid ' + (Game.money - m0));
});
// chapter 3: the cat show
await ev(() => {
  go('keys', 34); if (!arcStart('pearl', 2)) return; Game.hour = 12;
  const M = World.spots.mallory; put(M.x, M.y + 10); const ix = interaction(); need(ix && /after 5 PM/.test(ix.label), 'pearl ch3: no wait prompt before 5 PM: ' + (ix && ix.label));
  Game.hour = 17.5; act(/Blow-dry Mr. Toes/); need(Game.mode === 'mash', 'pearl ch3: no blow-dry mash'); for (let i = 0; i < 16; i++) { Input.press('a'); step(1); }
});
await p.screenshot({ path: `${OUT}/keys-blowdry.png` });
await ev(() => { mash(); for (let i = 0; i < 60 * 5 && Game.mode === 'scene'; i++) step(1); });
await shot('keys-catshow');
await ev(() => { talk(); arcDone('pearl', 2, 'bestInToes', /BEST IN TOES/); need(!Game.animals.some(a => a.toes), 'pearl ch3: show cats left on the map'); });
// Old Gus: only after Case 9
await ev(() => {
  Game.flags.case9Won = false; go('keys', 35); need(!Arcs.offering(npc('gus')), 'gus: offered before Case 9 is won');
  Game.flags.case9Won = true; go('keys', 35); if (!arcStart('gus', 0)) return; arrow('gus ch1', Game.boat);
  const S = World.spots; put(S.tarpon.x, S.tarpon.y, 'boat'); act(/Pick up Old Gus/); need(SideQuests.tmp.gusAboard && npc('gus').hidden, 'gus ch1: not aboard');
  put(S.tarpon.x, S.tarpon.y + 40, null); step(2); need(!SideQuests.tmp.gusAboard && !npc('gus').hidden, 'gus ch1: hopping out did not drop Gus off');
  put(S.tarpon.x, S.tarpon.y, 'boat'); act(/Pick up Old Gus/); drive([[8, 54]], 5); arrow('gus ch1 (to the wreck)', S.buoy);
});
await shot('keys-gus-aboard');
await ev(() => { const S = World.spots; put(S.reef.x - 30, S.reef.y, 'boat'); step(2); need(Game.mode === 'scene', 'gus ch1: no scene at the wreck'); for (let i = 0; i < 60 * 5 && Game.mode === 'scene'; i++) step(1); });
await shot('keys-gus-wreck');
await ev(() => { talk(); arcDone('gus', 0, 'gusGoodbye', /SAY GOODBYE TO HIS SHIPWRECK/); need(!npc('gus').hidden, 'gus ch1: still hidden after the trip'); });
await ev(() => {
  go('keys', 36); if (!arcStart('gus', 1)) return; arrow('gus ch2', World.spots.buoy);
  const S = World.spots; put(S.reef.x, S.reef.y, 'boat'); KeysCases.dive(); need(Game.mode === 'dive', 'gus ch2: no dive');
  const it = Dive.s && Dive.s.things.find(t => t.k === 'guswatch'); need(it, 'gus ch2: the watch is not on the wreck'); if (it) Dive.take(it); Dive.surface(); for (let i = 0; i < 120 && Game.mode === 'dive'; i++) step(1);
  need(ARC('gus').watch, 'gus ch2: surfacing with the watch did not count'); arrow('gus ch2 (back to Gus)', npc('gus'));
  talkTo('gus'); arcDone('gus', 1, 'gusWatch', /1984 DIVE WATCH/);
});
await ev(() => {
  go('keys', 37); if (!arcStart('gus', 2)) return; const S = World.spots; put(S.dockEnd.x, S.dockEnd.y); Game.dan.dir = 'down'; Game.hour = 12;
  const ix = interaction(); need(!ix || !/Old Silver/.test(ix.label), 'gus ch3: Old Silver bites at noon'); step(2);
  Game.hour = 18.5; act(/Cast for Old Silver/); need(Game.mode === 'fish' && Fishing.f.fish.length === 1 && Fishing.f.fish[0].sp.id === 'silver', 'gus ch3: Old Silver not in the water');
  step(40);
});
await p.screenshot({ path: `${OUT}/keys-old-silver.png` });
await ev(() => {
  const fi = Fishing.f.fish[0]; Fishing.hook(fi); Fishing.land(fi); step(2); Input.press('a'); step(2);
  need(Game.mode === 'play', 'gus ch3: stuck after landing Old Silver: ' + Game.mode); step(2);
  need(ARC('gus').silver && !Game.catchBag.some(f => f.id === 'silver'), 'gus ch3: Old Silver not counted / still in the bag');
  talkTo('gus', 0); arcDone('gus', 2, 'silverMount', /MOUNTS IT IN RETIREE’S LIVING ROOM/); need(Game.money - money0 === 110, 'gus ch3 mount: paid ' + (Game.money - money0));
  Object.assign(ARC('gus'), { ch: 2, st: 'active', silver: true }); Game.flags.sqDay = {}; talkTo('gus', 1);
  need(Game.headlines.some(h => Sheet.keyFor(h.text) === 'silverFree'), 'gus ch3: letting him go made no headline');
});
const out = await ev(() => ({ bad, log, sheet: `${Sheet.count()}/${Sheet.total()}` })); out.bad.push(...thrown.map(t => 'THREW ' + t));
console.log(out.log.join('\n')); console.log('rap sheet', out.sheet);
console.log(out.bad.length ? 'FAILURES:\n  ' + out.bad.join('\n  ') : 'all variety quests ok');
console.log('errors:', errs.length || out.bad.length ? [...new Set(errs)].slice(0, 6).concat(out.bad.length ? ['asserts failed'] : []) : 'none'); await b.close();
