// cutscenes: set up each story moment, play it, grab stills (contact sheet per scene), make sure it ends back in play
//   node scenes.mjs <outdir> [sceneName]
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
import { execFileSync } from 'child_process'; import fs from 'fs';
const OUT = process.argv[2] || '/tmp/fd-scenes', only = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
const FF = '/Users/happycamper/Projects/_tools/record-kit/ffmpeg';
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 960, height: 540 } })).newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
await p.evaluate(() => {
  window.TRAILER = true; try { localStorage.clear(); } catch (e) { } begin(false);
  window.step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } };
  window.talk = () => { for (let i = 0; i < 400 && Game.mode === 'talk'; i++) { step(6); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[0].click(); else Input.press('a'); step(1); } };
  window.go = (region, day, flags) => { Game.mode = 'play'; ui.talk.hidden = true; Game.talk = null; World.load(region); Game.day = day; Object.assign(Game.flags, flags || {}); startDay(); talk(); };
});
// each scene: setup (returns nothing; must leave the game in 'talk' or 'scene' on the way into the cutscene)
const SCENES = JSON.parse(fs.readFileSync(new URL('./scenes.json', import.meta.url)));
const res = {};
for (const [name, setup] of Object.entries(SCENES)) {
  if (only && name !== only) continue;
  for (const fn of fs.readdirSync(OUT)) if (fn.startsWith(name + '_')) fs.rmSync(`${OUT}/${fn}`);
  await p.evaluate(setup);
  let shots = 0, sawScene = false;
  for (let f = 0; f < 60 * 40; f += 1) {
    const st = await p.evaluate(() => { if (Game.mode === 'talk') { const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[0].click(); else if (Game.talk && Game.talk.typed >= Game.talk.full.length) Input.press('a'); } step(1); return { mode: Game.mode, scene: Scene.on() }; });
    if (st.scene) sawScene = true;
    if (st.scene && f % (+process.env.EVERY || 40) === 0 && shots < (+process.env.MAX || 12)) await p.screenshot({ path: `${OUT}/${name}_${String(shots++).padStart(2, '0')}.png` });
    if (sawScene && st.mode === 'play') break;
  }
  const end = await p.evaluate(() => Game.mode);
  if (shots) execFileSync(FF, ['-y', '-loglevel', 'error', '-pattern_type', 'glob', '-i', `${OUT}/${name}_*.png`, '-vf', 'scale=480:-1,tile=4x' + Math.ceil(shots / 4) + ':padding=4:color=white', '-frames:v', '1', `${OUT}/${name}.png`]);
  res[name] = sawScene ? (end === 'play' ? `ok (${shots} stills)` : 'ended in ' + end) : 'no scene';
}
console.log(res); const bad = Object.values(res).filter(v => !v.startsWith('ok') && !v.startsWith('ended in gazette'));
console.log('errors:', errs.length ? [...new Set(errs)].slice(0, 6) : bad.length ? 'SCENES FAILED ' + bad.join('; ') : 'none'); await b.close();
