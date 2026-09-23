// FLORIDA DAN — the shareable front page: today's Swamp Gazette as a 1080x1350 image
// (Instagram/phone friendly) with a real snapshot from the day and a link back to the game.
'use strict';
const PLAY_URL = 'tbone94.github.io/florida-dan';
function snapshot() { const c = document.createElement('canvas'); c.width = VW0; c.height = VH; c.getContext('2d').drawImage(buf, Math.floor((VW - VW0) / 2), 0, VW0, VH, 0, 0, VW0, VH); return c; }   // centre 320 of a wide frame
function wrapText(x, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
async function frontPage() {
  try { await Promise.all([document.fonts.load('80px Anton'), document.fonts.load('700 28px "Pixelify Sans"')]); } catch (e) { }
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), INK = '#1a1423', RED = '#e0433a', PAPER = '#fbf7ef';
  const days = ['', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'FRIDAY'];
  x.fillStyle = PAPER; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 5000; i++) { x.fillStyle = `rgba(26,20,35,${(Math.random() * .045).toFixed(3)})`; x.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  x.fillStyle = INK; x.textAlign = 'center'; x.font = '104px Anton, Impact, sans-serif'; x.fillText('THE SWAMP GAZETTE', W / 2, 138);
  x.fillRect(56, 156, W - 112, 6); x.fillRect(56, 168, W - 112, 2);
  x.font = '700 26px "Pixelify Sans", monospace'; x.fillStyle = RED;
  x.fillText(`${days[Game.day] || 'DAY ' + Game.day} EDITION  ·  50¢  ·  ${MIAMI() ? 'MIAMI-DADE' : 'COLLIER COUNTY'}`, W / 2, 206);
  // the photo: a real frame from Dan's day, kept pixel-crisp
  const pw = 968, ph = pw * 9 / 16, py = 232;
  x.fillStyle = INK; x.fillRect(W / 2 - pw / 2 - 8, py - 8, pw + 16, ph + 16);
  x.imageSmoothingEnabled = false; x.drawImage(Game.photo || buf, W / 2 - pw / 2, py, pw, ph);
  x.font = 'italic 700 20px "Pixelify Sans", monospace'; x.fillStyle = '#5d5a66'; x.textAlign = 'right';
  x.fillText('Photo: a concerned neighbor', W / 2 + pw / 2, py + ph + 34);
  // headlines
  const hs = (Game.day_.headlines || []).slice(), main = hs.pop() || 'FLORIDA MAN HAS NORMAL DAY; EXPERTS BAFFLED';
  x.textAlign = 'left'; x.fillStyle = INK;
  let size = 76, lines;
  do { x.font = `${size}px Anton, Impact, sans-serif`; lines = wrapText(x, main.toUpperCase(), W - 112); size -= 4; } while (lines.length > 3 && size > 44);
  size += 4; let y = py + ph + 50 + size;
  for (const l of lines) { x.fillText(l, 56, y); y += size * 1.04; }
  x.font = '38px Anton, Impact, sans-serif';
  for (const h of hs.slice(-3).reverse()) {
    const ls = wrapText(x, h.toUpperCase(), W - 112).slice(0, 2);
    if (y + 16 + ls.length * 42 > H - 128) break;
    x.fillRect(56, y - 14, W - 112, 2); y += 30;
    for (const l of ls) { x.fillText(l, 56, y); y += 42; }
  }
  // footer: the meter + where to play
  x.fillStyle = INK; x.fillRect(0, H - 112, W, 112);
  x.font = '700 24px "Pixelify Sans", monospace'; x.fillStyle = PAPER; x.fillText('FLORIDA MAN ALLEGATION METER', 56, H - 70);
  x.fillStyle = '#2a2136'; x.fillRect(56, H - 56, 420, 22); x.fillStyle = RED; x.fillRect(56, H - 56, 420 * Game.allegations / 100, 22);
  x.fillStyle = '#ffd23f'; x.font = '44px Anton, Impact, sans-serif'; x.fillText(`${Game.allegations}%`, 492, H - 33);
  x.textAlign = 'right'; x.font = '44px Anton, Impact, sans-serif'; x.fillStyle = '#ffd23f'; x.fillText('PLAY FLORIDA DAN', W - 56, H - 62);
  x.font = '700 24px "Pixelify Sans", monospace'; x.fillStyle = PAPER; x.fillText(PLAY_URL, W - 56, H - 28);
  return c;
}
async function shareFrontPage() {
  const btn = $('shareBtn'); btn.disabled = true; btn.textContent = 'Printing…';
  try {
    const c = await frontPage(), blob = await new Promise(r => c.toBlob(r, 'image/png'));
    const name = `swamp-gazette-day-${Game.day}.png`, file = new File([blob], name, { type: 'image/png' });
    let shared = false;
    if (isTouch && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'The Swamp Gazette', text: `Florida Man strikes again. ${PLAY_URL}` }); shared = true; } catch (e) { shared = e && e.name === 'AbortError'; }
    }
    if (!shared) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
    btn.textContent = 'Saved ✓';
  } catch (e) { console.error(e); btn.textContent = 'Couldn’t save — try again'; }
  setTimeout(() => { btn.disabled = false; btn.textContent = 'Save front page'; }, 2500);
}
