import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  window.TRAILER = true;
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 30); render(); hud(); Input.endFrame(); } };
  begin(false); ui.talk.hidden = true; Game.talk = null; Game.mode = 'play'; Game.flags.trashBaby = true; Game.flags.noChase = true; spawn();
  Game.npcs = []; Game.pickups = [];
  const D = Game.dan, tb = () => Game.animals.find(a => a.pet), out = [];
  Object.assign(D, { x: 30 * TS, y: 44.6 * TS, dir: 'right' }); Object.assign(tb(), { x: D.x - 18, y: D.y });
  let a = interaction(); out.push('walking away (TB behind): ' + (a ? a.label : 'no prompt'));
  D.dir = 'left'; a = interaction(); out.push('turned to face him: ' + (a ? a.label : 'no prompt') + ' | bubble target set: ' + (Game.tbFace === tb()));
  render(); a.fn();
  for (let i = 0; i < 20 && Game.mode === 'talk'; i++) { Input.press('a'); step(8); }
  const t0 = Math.hypot(tb().x - World.spots.door.x, tb().y - World.spots.door.y); step(240);
  const t1 = Math.hypot(tb().x - World.spots.door.x, tb().y - World.spots.door.y);
  out.push(`sent home: stay=${Game.flags.tbStay}, distance to porch ${t0.toFixed(0)}px -> ${t1.toFixed(0)}px after 8s`);
  Object.assign(D, { x: tb().x + 10, y: tb().y }); a = interaction(); out.push('at the porch: ' + (a ? a.label : 'none')); a.fn();
  out.push('called back: stay=' + Game.flags.tbStay);
  World.load('miami'); Game.flags.tbStay = false; spawn(); Game.npcs = []; Object.assign(Game.dan, { x: 60 * TS, y: 20 * TS, dir: 'left' }); Object.assign(tb(), { x: Game.dan.x - 18, y: Game.dan.y });
  a = interaction(); a.fn(); for (let i = 0; i < 20 && Game.mode === 'talk'; i++) { Input.press('a'); step(8); }
  out.push('Miami send-home: TB present=' + !!tb() + ' stay=' + Game.flags.tbStay);
  return out.join('\n');
});
console.log(r); console.log('errors:', errs.length ? errs : 'none'); await b.close();
