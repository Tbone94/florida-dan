// UX tour: phone-landscape screenshots of every mechanic a new player meets. node tour.mjs [outdir] [desktop]
import { chromium, devices } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
import fs from 'fs';
const OUT = process.argv[2] || '/tmp/fd-tour', desk = process.argv[3] === 'desktop';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const dev = desk ? { viewport: { width: 1280, height: 720 } } : (d => (delete d.defaultBrowserType, d))({ ...devices['Pixel 7 landscape'] });
const ctx = await b.newContext(dev); const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1500);
let n = 0; const shot = async name => { await p.screenshot({ path: `${OUT}/${String(++n).padStart(2, '0')}-${name}.png` }); };
await shot('title');
await p.evaluate(() => {
  window.TRAILER = true;   // freeze the real rAF loop; we drive frames
  window.step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } };
  window.talkAll = () => { for (let i = 0; i < 300 && Game.mode === 'talk'; i++) { step(10); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[0].click(); else Input.press('a'); step(1); } };
  window.tp = (x, y) => { Game.dan.x = x; Game.dan.y = y; Game.dan.ride = null; };
  try { localStorage.clear(); } catch (e) { } begin(false);
});
const S = (js, f = 20) => p.evaluate(([js, f]) => { const r = eval(js); step(f); return r; }, [js, f]);
await S('0', 40); await shot('intro-talk');
await S('for (let i=0;i<300&&Game.mode==="talk"&&!document.querySelector(".choice");i++){step(8);Input.press("a");step(1)}', 10); await shot('first-choice');
await S('talkAll()', 90); await shot('day1-play');
await S('step(240)', 1); await shot('day1-later');
await S('openJournal()', 10); await shot('fridge');
await S('closeJournal(); openShop("gulp")', 10); await shot('shop');
await S('closeShop(); const g=Game.animals.find(a=>a.type==="gator"); if(g) tp(g.x+18,g.y); Game.flags.hints={}', 30); await shot('near-gator');
await S('Fishing.start(T.DEEP, true)', 120); await shot('fishing');
await S('Game.mode="play"; ui.fishHud.hidden=true; const g=Game.animals.find(a=>a.type==="gator"); wrestleGator(g)', 60); await shot('wrestle');
// day 2: side gigs
await S('Game.mode="play"; for(const k of ["wrestle"]) ui[k].hidden=true; Game.day=2; startDay(); talkAll()', 60);
await S('const G=Game.day_.gig, id=G&&Object.keys(G.offers)[0], n=id&&Game.npcs.find(x=>x.id===id); if(n) tp(n.x-40,n.y); window._gig=id', 40); await shot('gig-bubble');
await S('const n=Game.npcs.find(x=>x.id===_gig); if(n) tp(n.x-14,n.y)', 10); await shot('gig-prompt');
await S('const a=interaction(); a&&a.fn()', 40); await S('for (let i=0;i<30&&Game.mode==="talk"&&!document.querySelector(".choice");i++){step(8);Input.press("a");step(1)}', 10); await shot('gig-offer');
await S('talkAll()', 60); await shot('gig-active');
await S('const nb=World.props.find(p=>p.kind==="newsbox"); tp(nb.x+6,nb.y+20)', 20); await shot('newsbox-prompt');
await S('headline("FLORIDA MAN TEST HEADLINE FOR BRIBE",5); step(400); const a=interaction(); a&&a.fn()', 30); await shot('bribe');
await S('if(Game.mode==="talk") talkAll(); if(Game.mode==="shop") closeShop(); Game.mode="play"; Heat.stars=3; Heat.start && Heat.start()', 120); await shot('chase');
// Miami
await S('Heat.cop=null; Game.mode="play"; World.load("miami"); Game.day=12; Object.assign(Game.flags,{case3Won:true}); startDay(); talkAll()', 90); await shot('miami');
// Daytona
await S('World.load("daytona"); Game.day=18; Object.assign(Game.flags,{case5Won:true}); startDay(); talkAll()', 90); await shot('daytona');
await S('const v=(Game.vehicles||[]).find(v=>v.id==="car29")||(Game.vehicles||[])[0]; if(v){tp(v.x,v.y+20); Car.enter(v)}', 60); await shot('daytona-car');
await S('Speedway.start("qualify")', 200); await shot('speedway');
await S('Speedway.abort("x"); Game.mode="play"; DaytonaCases.pitStop(()=>{},()=>{})', 60); await shot('mash');
await S('Game.mode="play"; ui.card && (ui.card.hidden=true); endDay("sleep")', 120); await shot('gazette');
console.log(n, 'shots in', OUT); console.log('errors:', errs.length ? [...new Set(errs)].slice(0, 8) : 'none');
await b.close();
