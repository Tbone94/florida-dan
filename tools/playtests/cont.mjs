import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext(); const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
await p.evaluate(() => { localStorage.clear(); begin(false); Object.assign(Game.flags, { case5Won: true, case6Won: true, up: { nitro: 1, tatgator: 1 } }); World.load('daytona'); Game.day = 20; startDay(); });
await p.reload(); await p.waitForTimeout(1500);
const r = await p.evaluate(() => { const lbl = ui.continueBtn.textContent; ui.continueBtn.click(); return new Promise(res => setTimeout(() => res(`${lbl} → region=${Game.region} day=${Game.day} case=${Cases.name()} car29=${!!(Game.vehicles || []).find(v => v.id === 'car29')} upgrades=${Object.keys(Game.flags.up || {}).join(',')} quests=${Game.quests.map(q => q.id).join(',')}`), 1200)); });
console.log(r); console.log('errors:', errs.length ? errs : 'none'); await b.close();
