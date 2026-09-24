// phone calls play as one self-running call; texts go to Dan's phone (not the talk box); cooler whistle offers
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const mobile = process.argv[2] === 'mobile';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext(mobile ? { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 720 } });
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  window.TRAILER = true; try { localStorage.clear(); } catch (e) { } begin(false);
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } }, bad = [];
  if (!Game.talk || !Game.talk.q[0].call) bad.push('day 1 Brenda call is not a packed call');
  if (Game.talk.q.some(e => Array.isArray(e) && /^TEXT/.test(e[0]))) bad.push('a text is still in the talk box');
  let f = 0; while (Game.mode === 'talk' && f < 60 * 30) { step(1); f++; }
  if (Game.mode !== 'play') bad.push('call never hung up by itself');
  step(3); if (!Phone.cur || Phone.cur.msgs.length !== 2) bad.push('Merle texts not on the phone');
  step(60 * 12); if (Phone.cur) bad.push('phone never put away');
  Game.day = 2; startDay(); let taps = 0; for (let i = 0; i < 100 && Game.mode === 'talk'; i++) { step(20); Input.press('a'); taps++; step(1); }
  if (taps > 8) bad.push('day 2 intro still takes ' + taps + ' taps');
  Game.day_.usedCooler = true; Game.cooler.x += 320; const d = World.spots.door; Object.assign(Game.dan, { x: d.x, y: d.y + 20, dir: 'down', ride: null });
  const ix = interaction(); if (!ix || !/Whistle/.test(ix.label)) bad.push('no whistle prompt: ' + (ix && ix.label));
  else { ix.fn(); for (let i = 0; i < 60 * 16 && Game.cooler.home; i++) step(1); if (Math.hypot(Game.cooler.x - Game.dan.x, Game.cooler.y - Game.dan.y) > 60) bad.push('cooler never came'); }
  return { taps, bad };
});
console.log(JSON.stringify(r)); errs.push(...r.bad);
console.log('errors:', errs.length ? errs : 'none'); await b.close();
