import { chromium, devices } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const dev = { ...devices['Pixel 7 landscape'] }; delete dev.defaultBrowserType;
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext(dev); const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  begin(false); window.__stop = true;
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 30); render(); hud(); Input.endFrame(); } };
  for (let i = 0; i < 60 && Game.mode !== 'play'; i++) { Input.press('a'); step(3); }
  const log = [], snap = tag => log.push(`${tag}: mode=${Game.mode} banner=${ui.banner.classList.contains('show')} talk=${!ui.talk.hidden} chase=${!!Heat.cop}`);
  Game.day = 5; Game.flags.noChase = false; Game.heat = 2;
  headline('FLORIDA MAN TEST HEADLINE; TEST PASSES', 9);   // heat -> 4: a chase is now due
  say([['DAN', 'Hey Rhonda.'], ['RHONDA', 'Hey Dan.']]);
  step(5); snap('headline + dialogue fired together');
  for (let i = 0; i < 30 && Game.mode === 'talk'; i++) { Input.press('a'); step(6); }
  step(3); snap('dialogue closed');
  step(30); snap('mid-headline');
  step(200); snap('after headline');
  return log.join('\n') + '\nbanner width px: ' + ui.banner.getBoundingClientRect().width.toFixed(0) + ' of stage ' + stage.getBoundingClientRect().width.toFixed(0);
});
console.log(r); console.log('errors:', errs.length ? errs : 'none'); await b.close();
