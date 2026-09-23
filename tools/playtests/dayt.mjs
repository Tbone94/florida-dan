import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 300)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  window.TRAILER = true; const out = [], log = s => out.push(s);
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 30); render(); hud(); Input.endFrame(); } };
  const talk = (re) => { for (let i = 0; i < 120 && Game.mode === 'talk'; i++) { const cs = [...document.querySelectorAll('.choice')]; const c = re ? cs.find(b => re.test(b.textContent)) || cs[0] : cs[0]; if (c) c.click(); else Input.press('a'); step(3); } };
  const arrow = () => { const q = currentQuest(); if (!q) return 'none'; let tg; try { tg = questTarget(q); } catch (e) { return q.id + '→ERR ' + e.message; } return q.id + (tg ? '→ok' : '→(no target)'); };
  const npc = id => Game.npcs.find(n => n.id === id);
  const go = (o, dy = 16) => { Object.assign(Game.dan, { x: o.x, y: o.y + dy, ride: null, dir: 'up' }); Game.mode = 'play'; };
  const act = () => { const a = interaction(); if (a) a.fn(); return a && a.label; };
  const mash = () => { for (let i = 0; i < 400 && Game.mode === 'mash'; i++) { Input.press('a'); step(1); } };
  const objection = () => { for (let i = 0; i < 900 && (Game.mode === 'objection' || Game.mode === 'talk' || Game.mode === 'court'); i++) { if (Game.mode === 'objection') { const s = Objection.s; if (s && s.phase === 'show' && s.list[s.i].lie) Input.press('a'); step(2); } else if (Game.mode === 'talk') talk(); else step(2); if (Game.mode === 'gazette') break; } };
  const nextDay = () => { endDay('sleep'); if (Game.flags.creditsPending) { $('nextBtn').click(); $('creditsBtn').click(); } else $('nextBtn').click(); talk(); };
  const drivePath = (from, count) => { const P = pathPts(), N = P.length; for (let k = 0; k < count; k++) { const q = P[(from + k) % N]; Game.car.x = q.x; Game.car.y = q.y; Game.dan.x = q.x; Game.dan.y = q.y; step(1); if (Game.mode === 'talk') break; } };
  // ---- setup: Miami, day 17, after Case 5
  begin(false); talk(); Game.flags.case5Won = true; Game.flags.noChase = true; Game.money = 300;
  World.load('miami'); Game.day = 17; startDay(); log('D17 quests: ' + Game.quests.map(q => q.id).join(',') + ' | arrow ' + arrow()); talk();
  go(World.spots.stationDoor, 4); log('station: ' + act()); talk(/Daytona/); step(5); talk(); step(3);
  log(`arrived: region=${Game.region} quests=${Game.quests.map(q => q.id + (q.done ? '✓' : '')).join(',')} arrow ${arrow()}`);
  go(npc('tammy')); Story.talk(npc('tammy')); talk(); log('after Tammy: ' + Game.quests.map(q => q.id + (q.done ? '✓' : '')).join(',') + ' | arrow ' + arrow());
  const pace = Game.vehicles.find(v => v.id === 'pace'); go(pace, 4); log('pace car: ' + act() + ' ride=' + Game.dan.ride + ' convoy=' + Convoy.on);
  drivePath(0, 100); talk(); log('after lap: ' + Game.quests.map(q => q.id + (q.done ? '✓' : '')).join(',') + ' | arrow ' + arrow());
  const dr = World.spots.drive; Game.car.x = dr.x; Game.car.y = dr.y; step(2); talk(); step(2);
  log(`donut run: donutRun=${!!Game.flags.donutRun} ride=${Game.dan.ride} arrow ${arrow()} headlines=${Game.day_.headlines.length}`);
  // ---- day 18
  nextDay(); log('D18: ' + Game.quests.map(q => q.id).join(',') + ' | region ' + Game.region + ' | arrow ' + arrow());
  go(npc('rusty')); Story.talk(npc('rusty')); talk(/do it/); log('mode after Rusty choice: ' + Game.mode); mash(); talk(); log('witRusty=' + !!Game.flags.witRusty);
  go(npc('donna')); Story.talk(npc('donna')); talk(); log('donna quest: ' + Q('donna').text + ' | arrow ' + arrow());
  go(npc('tiny')); Story.talk(npc('tiny')); talk(/Arm/); log('mode: ' + Game.mode); mash(); talk(); log('carry=' + Game.dan.carry);
  go(npc('donna')); Story.talk(npc('donna')); talk(); log('witDonna=' + !!Game.flags.witDonna + ' signBack=' + !!Game.flags.signBack);
  // ---- day 19: court
  nextDay(); log('D19 courtCase=' + Cases.courtCase() + ' | arrow ' + arrow());
  go(World.spots.court, -4); log('court: ' + act()); objection(); log('after court: mode=' + Game.mode + ' case6Won=' + !!Game.flags.case6Won);
  $('nextBtn').click(); if (!$('credits').hidden) { log('credits: ' + $('credits').querySelector('h2').textContent); $('creditsBtn').click(); } talk();
  // ---- day 20: qualify
  log('D20: ' + Game.quests.map(q => q.id).join(',') + ' | arrow ' + arrow());
  go(npc('chip')); Story.talk(npc('chip')); talk(); log('met chip=' + !!Game.flags.metChip);
  const c29 = Game.vehicles.find(v => v.id === 'car29'); go(c29, 4); log('#29: ' + act()); step(60); drivePath(0, 100); talk(); step(3); talk();
  log('qualified=' + !!Game.flags.qualified + ' | arrow ' + arrow()); if (Game.car) Car.exit();
  // ---- day 21
  nextDay(); log('D21: ' + Game.quests.map(q => q.id).join(','));
  for (const id of ['tammy', 'tiny', 'donna']) { go(npc(id)); Story.talk(npc(id)); talk(); }
  log('clues done=' + (Q('clues') || {}).done + ' | arrow ' + arrow());
  go(npc('wrench')); Story.talk(npc('wrench')); talk(/Pay/); log('tires=' + (Q('tires') || {}).done);
  go(npc('chip')); Story.talk(npc('chip')); talk(); log('accused=' + !!Game.flags.accused);
  // ---- day 22: race
  nextDay(); log('D22: ' + Game.quests.map(q => q.id).join(',') + ' | arrow ' + arrow());
  const r29 = Game.vehicles.find(v => v.id === 'car29'); go(r29, 4); log('race: ' + act() + ' on=' + Speedway.on + ' ai=' + Speedway.cars.length);
  step(100); const idx = Speedway.me.idx; drivePath(idx, 96 * 5 + 10); log('race state: on=' + Speedway.on + ' raceWon=' + !!Game.flags.raceWon); talk(); log('arrow ' + arrow() + ' courtCase=' + Cases.courtCase());
  go(World.spots.court, -4); log('court2: ' + act()); objection(); log('case7Won=' + !!Game.flags.case7Won);
  $('nextBtn').click(); if (!$('credits').hidden) { log('credits: ' + $('credits').querySelector('h2').textContent); $('creditsBtn').click(); } talk();
  log('D23: case=' + JSON.stringify(Cases.info()) + ' region=' + Game.region);
  go(World.spots.stationDoor, 4); act(); step(40); log('bus options: ' + [...document.querySelectorAll('.choice')].map(c => c.textContent).join(' / ')); talk(/Nowhere/);
  return out.join('\n');
});
console.log(r); console.log('errors:', errs.length ? [...new Set(errs)].slice(0, 6) : 'none'); await b.close();
