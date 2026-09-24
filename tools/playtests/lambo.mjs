// Case 4: drive the Lambo into the Atlantic, then Dan has to be out of the car and walking again
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const out = await p.evaluate(() => {
  window.TRAILER = true; try { localStorage.clear(); } catch (e) { } begin(false);
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } };
  const talk = () => { for (let i = 0; i < 300 && Game.mode === 'talk'; i++) { step(8); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[0].click(); else Input.press('a'); step(1); } };
  talk(); Object.assign(Game.flags, { case1Won: true, case2Won: true, case3Won: true, noChase: true, checkedIn: true });
  Game.mode = 'play'; World.load('miami'); Game.day = 11; startDay(); talk();
  const v = (Game.vehicles || []).find(v => v.kind === 'lambo'); if (!v) return 'no lambo spawned';
  Lambo.enter(v); v.a = 0;   // point it east, at the ocean
  for (let i = 0; i < 60 * 30 && Lambo.car; i++) step(1);
  const sunk = Game.flags.lamboSunk; talk();
  const D = Game.dan, x0 = D.x; Input.set('left', true); step(40); Input.set('left', false);
  return `sunk ${sunk} | ride ${D.ride} | vehicles ${Game.vehicles.length} | walked ${Math.round(x0 - D.x)}px | prompt-able ${interaction() !== undefined}`;
});
console.log(out);
const ok = /sunk true \| ride null \| vehicles 0 \| walked [1-9]/.test(out);
if (!ok) errs.push('Dan is stuck after the Lambo sinks');
console.log('errors:', errs.length ? errs : 'none'); await b.close();
