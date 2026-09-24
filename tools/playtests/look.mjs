// the look across the day: node look.mjs <outdir>   (contact sheet of the same spots at dawn / noon / golden / purple / night)
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
import { execFileSync } from 'child_process'; import fs from 'fs';
const OUT = process.argv[2] || '/tmp/fd-look'; fs.mkdirSync(OUT, { recursive: true });
const FF = '/Users/happycamper/Projects/_tools/record-kit/ffmpeg';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 960, height: 540 } }); const errs = [];
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 160)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const SPOTS = { cabin: ['swamp', 25, "const S = World.spots; [S.door.x + 30, S.door.y + 50]"], gulp: ['swamp', 25, "[World.spots.darlene.x - 20, World.spots.darlene.y + 50]"], miami: ['miami', 14, "[47.5 * TS, 30 * TS]"] };
const HOURS = (process.env.HOURS || '6.6,11,13,17.9,19.3,21.5').split(',').map(Number);
let n = 0;
for (const [nm, [reg, day, pos]] of Object.entries(SPOTS)) for (const h of HOURS) {
  await p.evaluate(([reg, day, pos, h]) => { window.TRAILER = true; try { localStorage.clear(); } catch (e) {} begin(false);
    const step = k => { for (let i = 0; i < k; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } };
    Game.mode = 'play'; ui.talk.hidden = true; World.load(reg); Game.day = day; Object.assign(Game.flags, { case3Won: true, case4Won: true }); startDay(); Game.mode = 'play'; ui.talk.hidden = true; Game.talk = null;
    const [x, y] = eval(pos); Game.dan.x = x; Game.dan.y = y; Game.hour = h; Look.mark('scorch', x - 30, y + 10); Look.mark('can', x + 14, y + 6); for (let i = 0; i < 30; i++) Look.mark('track', x - 60 + i * 3, y + 20);
    for (let i = 0; i < 20; i++) { Game.hour = h; step(1); } showHud(false); ui.prompt.hidden = true; ui.toast.hidden = true; ui.hint.hidden = true; }, [reg, day, pos, h]);
  await p.locator('#screen').screenshot({ path: `${OUT}/l_${String(n++).padStart(2, '0')}.png` });
}
execFileSync(FF, ['-y', '-loglevel', 'error', '-pattern_type', 'glob', '-i', `${OUT}/l_*.png`, '-vf', `scale=400:-1,tile=${HOURS.length}x${Object.keys(SPOTS).length}:padding=4:color=white`, '-frames:v', '1', `${OUT}/look.png`]);
console.log('errors:', errs.length ? [...new Set(errs)].slice(0, 5) : 'none'); await b.close();
