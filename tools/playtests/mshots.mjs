// mobile screenshots: node mshots.mjs <tag>
import { chromium, devices } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const tag = process.argv[2] || 'before', OUT = '/Users/happycamper/Projects/florida-dan/promo/mobile';
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [name, dev] of [['iphone', { ...devices['iPhone 14 landscape'] }], ['android', { ...devices['Pixel 7 landscape'] }], ['iphone-portrait', { ...devices['iPhone 14'] }]]) {
  delete dev.defaultBrowserType;
  const ctx = await b.newContext(dev); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(name + ': ' + e.message));
  await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/${tag}-${name}-title.png` });
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} begin(false); });
  await p.waitForTimeout(600);
  for (let i = 0; i < 12; i++) { await p.evaluate(() => { if (Game.mode === 'talk') Input.press('a'); }); await p.waitForTimeout(250); }
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/${tag}-${name}-play.png` });
  await ctx.close();
}
console.log('errors:', errs.length ? errs : 'none'); await b.close();
