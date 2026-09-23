// phone screenshots of every menu sheet (checks nothing is clipped): node menus.mjs <outdir>
import { chromium, devices } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const OUT = process.argv[2] || '/tmp/fd-menus';
const b = await chromium.launch({ channel: 'chrome' }); const errs = [];
for (const [nm, d] of [['pixel', 'Pixel 7 landscape'], ['iphone', 'iPhone 14 landscape']]) {
  const dev = { ...devices[d] }; delete dev.defaultBrowserType;
  const p = await (await b.newContext(dev)).newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
  await p.evaluate(() => $('howtoBtn').click()); await p.waitForTimeout(200); await p.screenshot({ path: `${OUT}/${nm}-howto.png` });
  await p.evaluate(() => { $('howtoClose').click(); window.TRAILER = true; localStorage.clear(); begin(false); Game.mode = 'play'; ui.talk.hidden = true; Game.money = 500; openShop('bubba'); });
  await p.waitForTimeout(200); await p.screenshot({ path: `${OUT}/${nm}-shop.png` });
  await p.evaluate(() => { closeShop(); endDay('sleep'); }); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/${nm}-gazette.png` });
  const top = await p.evaluate(() => $('gazette').querySelector('.paper').getBoundingClientRect().top);
  console.log(nm, 'gazette top', top);
}
console.log('errors:', errs.length ? errs : 'none'); await b.close();
