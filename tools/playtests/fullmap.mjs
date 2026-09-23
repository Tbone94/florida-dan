// renders a whole region to one PNG: node fullmap.mjs swamp|miami out.png
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
import fs from 'fs';
const [reg = 'swamp', out = '/Users/happycamper/Projects/florida-dan/promo/ui/map-swamp.png'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const data = await p.evaluate(reg => {
  window.TRAILER = true; World.load(reg); Game.day = 5; Game.hour = 12; Game.flags = {}; Game.inv = Game.inv || {}; Game.day_ = freshDayLog(); spawn(); Game.mode = 'title'; Game.shake = 0;
  const W = MW * TS, H = MH * TS, big = document.createElement('canvas'); big.width = W; big.height = H; const bx = big.getContext('2d');
  for (let y = 0; y < H; y += VH) for (let x = 0; x < W; x += VW) {
    Game.cam.x = x; Game.cam.y = y; g.setTransform(1, 0, 0, 1, 0, 0); drawWorld();
    bx.drawImage(buf, 0, 0, VW, VH, Math.min(x, W - VW), Math.min(y, H - VH), VW, VH);
  }
  bx.fillStyle = '#fff'; bx.font = 'bold 12px monospace';
  for (let tx = 0; tx < MW; tx += 10) bx.fillText(tx, tx * TS + 2, 12);
  for (let ty = 0; ty < MH; ty += 10) bx.fillText(ty, 2, ty * TS + 12);
  return big.toDataURL('image/png').split(',')[1];
}, reg);
fs.writeFileSync(out, Buffer.from(data, 'base64')); console.log('wrote', out); await b.close();
