import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  window.TRAILER = true; const out = [];
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 30); render(); hud(); Input.endFrame(); } };
  begin(false); ui.talk.hidden = true; Game.talk = null; Game.mode = 'play'; Game.flags.noChase = true; Game.money = 500;
  const bub = Game.npcs.find(n => n.id === 'bubba'); out.push('Bubba spawned at shack: ' + !!bub + ', Skeeter: ' + !!Game.npcs.find(n => n.id === 'skeeter') + ', Lurleen: ' + !!Game.npcs.find(n => n.id === 'lurleen'));
  Object.assign(Game.dan, { x: bub.x, y: bub.y + 14, dir: 'up' }); const a = interaction(); out.push('prompt at Bubba: ' + (a && a.label));
  Game.mode = 'shop'; openShop('bubba'); out.push('for sale: ' + [...ui.shopList.children].map(b => b.dataset.k).join(','));
  for (const k of ['airboat', 'rod', 'boombox', 'waders', 'fanny', 'billy', 'neon', 'recliner']) { const row = [...ui.shopList.children].find(b => b.dataset.k === k); if (row) row.click(); }
  out.push(`bought all → money left $${Game.money}, shop open: ${!ui.shop.hidden}, flags: ${Object.keys(Game.flags.up || {}).join(',')}`);
  Game.mode = 'play'; ui.shop.hidden = true;
  // airboat over sawgrass
  const sg = (() => { for (let y = 40; y < 58; y++) for (let x = 2; x < 18; x++) if (World.tile(x, y) === T.SAWGRASS) return { x: (x + .5) * TS, y: (y + .5) * TS }; })();
  out.push('airboat can cross sawgrass: ' + canBoat(sg.x, sg.y));
  // recliner nap
  const rc = World.props.find(p => p.kind === 'recliner'); Object.assign(Game.dan, { x: rc.x + 8, y: rc.y + 4, ride: null }); Game.hour = 10; const n = interaction(); out.push('recliner prompt: ' + (n && n.label)); n.fn(); out.push('after nap clock: ' + clock());
  // fish value
  out.push('fish prices: bluegill .6lb $' + Upgrades.fishValue({ lbs: .6 }) + ', bass 4lb $' + Upgrades.fishValue({ lbs: 4 }) + ', catfish 12lb $' + Upgrades.fishValue({ lbs: 12 }));
  step(30); return out.join('\n');
});
console.log(r); console.log('errors:', errs.length ? errs : 'none'); await b.close();
