// launch-polish regressions: story can't be skipped, blackout away from home, gigs across the bus, race retry, saves
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const out = await p.evaluate(() => {
  window.TRAILER = true; try { localStorage.clear(); } catch (e) { } begin(false);
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } };
  const talk = (pick = 0) => { for (let i = 0; i < 300 && Game.mode === 'talk'; i++) { step(8); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[Math.min(pick, cs.length - 1)].click(); else Input.press('a'); step(1); } };
  const go = (region, day, flags = {}) => { Game.mode = 'play'; ui.talk.hidden = true; Game.talk = null; World.load(region); Game.day = day; Object.assign(Game.flags, flags); startDay(); talk(); };
  const next = () => { endDay('late'); step(2); $('nextBtn').click(); if (!$('credits').hidden) $('creditsBtn').click(); talk(); return Game.day; };
  const r = {}, ok = (k, v) => r[k] = v ? 'ok' : 'FAIL';
  // 1 story guard
  go('swamp', 11, { case3Won: true, acquitted: true, case2Won: true }); ok('day11 swamp sleep replays 11', next() === 11 && qOpen('bus'));
  go('swamp', 13); ok('day13 stranded in swamp -> back to 11', next() === 11);
  go('miami', 14, { case4Won: true, flyer: false }); ok('day14 no flyer replays 14', next() === 14);
  go('miami', 16, { flyer: true }); ok('day16 missed court replays 16', next() === 16);
  go('miami', 17, { case5Won: true }); ok('day17 still in Miami replays 17', next() === 17 && qOpen('bus6'));
  go('miami', 12); ok('day12 normal advance', next() === 13);
  // 2 blackout away from home
  for (const reg of ['miami', 'daytona']) { go(reg, reg === 'miami' ? 12 : 18); blackout(); talk(); ok('blackout on map ' + reg, Game.dan.x > 0 && Game.dan.y > 0 && canWalk(Game.dan.x, Game.dan.y)); }
  // 3 gig across the bus
  go('swamp', 25, { case5Won: true }); Gigs.accept && Gigs.accept('trial'); const had = !!Gigs.active(); travel('daytona'); talk(); step(30);
  ok('gig dropped on travel', had && !Gigs.active() && !Game.quests.some(q => q.gig));
  // 4 qualify fail -> choices, "later" gets you out
  go('daytona', 20, { case5Won: true, case6Won: true }); const v = Game.vehicles.find(v => v.id === 'car29');
  if (v) { Car.enter(v); DaytonaCases.raceDone('qualify', 1, 25); step(30); const cs = () => [...document.querySelectorAll('.choice')]; for (let i = 0; i < 20 && !cs().length; i++) { Input.press('a'); step(8); }
    const n = cs().length; talk(1); ok('qualify fail offers again/later + exits car', n === 2 && Game.dan.ride !== 'car' && !Speedway.on); } else r.qualify = 'no car29';
  // 5 no cop chase mid-race
  Game.racing = true; Game.heat = 5; Heat.end(); step(60); ok('no chase while racing', !Heat.cop); Game.racing = false; Game.heat = 0;
  // 6 mid-day save keeps dawn headlines
  go('swamp', 25); const h0 = Game.headlines.length; headline('FLORIDA MAN TEST SAVE HEADLINE', 5); step(400); save(); const s = JSON.parse(localStorage.getItem('floridaDan.save') || localStorage.getItem(SAVE_KEY));
  ok('mid-day save keeps dawn headlines', s.headlines.length === h0);
  // 7 Skunk Ape: night work isn't cut off at 10 PM; missed him on day 8? he's at the den on day 9
  go('swamp', 8, { case2Won: true }); Game.flags.apeFriend = false; done('trailcam'); done('dogs'); Game.hour = 21.99; step(90); ok('10 PM waits for the Skunk Ape', Game.mode === 'play' && Game.hour > 22);
  ok('before dark the arrow goes to the couch', (() => { Game.hour = 12; const t = questTarget(currentQuest()); return t && t === Cases.places().couch; })());
  go('swamp', 9, { case2Won: true }); Game.flags.apeFriend = false; { const ape = Game.animals.find(a => a.ape); Game.dan.x = ape.x + 14; Game.dan.y = ape.y; step(2); const a1 = interaction(); a1 && a1.fn(); talk(); step(2); const a2 = interaction(); ok('day 9 without day 8: meet then rehearse', a1 && /Approach/.test(a1.label) && a2 && /Rehearse/.test(a2.label)); }
  // 8 bed as soon as the day's story is done
  go('miami', 15, { case4Won: true }); Game.quests.forEach(q => q.done = true); Game.hour = 9; ok('sleep early once the story is done', !Cases.sleepBlock() && sleepReady());
  // 9 the Gazette bribe cools you way down
  go('swamp', 25); headline('FLORIDA MAN TEST BRIBE HEADLINE', 8); Game.heat = 4; const al = Game.allegations; Game.money = 200; Bribe.bury('FLORIDA MAN TEST BRIBE HEADLINE'); ok('bribe: -3 stars, double allegations back', Game.heat <= 1 && al - Game.allegations >= 16);
  return r;
});
console.log(out); const bad = Object.values(out).filter(v => v !== 'ok');
console.log(bad.length ? 'FAILURES: ' + bad.length : 'all fixes ok'); console.log('errors:', errs.length ? [...new Set(errs)].slice(0, 6) : 'none'); await b.close();
