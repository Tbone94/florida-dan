// Florida Dan trailer recorder. Drives trailer.html (director mode) one exact frame at a time.
//   node florida-trailer.mjs samples            → one still per shot + contact sheet
//   node florida-trailer.mjs full               → every frame (1080p60) + offline soundtrack → mp4
import { chromium } from 'playwright';
import fs from 'fs';
import { execFileSync } from 'child_process';
const mode = process.argv[2] || 'samples';
const OUT = '/Users/happycamper/Projects/florida-dan/promo';
const FF = '/Users/happycamper/Projects/_tools/record-kit/ffmpeg';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('PAGEERROR', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
await page.goto('http://localhost:8811/trailer.html');
await page.waitForFunction(() => window.Trailer && window.Trailer.frame);
await page.evaluate(async () => { await document.fonts.load('700 20px "Pixelify Sans"'); await document.fonts.load('40px Anton'); await document.fonts.ready; });
const info = await page.evaluate(() => ({ total: Trailer.total, shots: Trailer.shots }));
const N = Math.round(info.total * 60);
console.log('total', info.total, 'frames', N);

if (mode === 'samples') {
  const dir = `${OUT}/samples`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  let f = 0, n = 0;
  for (const [id, start, dur] of info.shots) {
    const target = Math.round((start + dur * (process.argv[3] ? +process.argv[3] : .62)) * 60);
    await page.evaluate(([a, b]) => { for (let i = a; i <= b; i++) Trailer.frame(i); }, [f, target]);
    f = target + 1;
    await page.screenshot({ path: `${dir}/s_${String(n++).padStart(2, '0')}_${id}.png` });
  }
  execFileSync(FF, ['-y', '-loglevel', 'error', '-pattern_type', 'glob', '-i', `${dir}/s_*.png`, '-vf', 'scale=480:-1,tile=4x5:padding=6:color=white', '-frames:v', '1', `${dir}/contact.png`]);
  console.log('contact sheet', `${dir}/contact.png`);
}

if (mode === 'full' || mode === 'range') {
  const dir = `${OUT}/frames`; if (mode === 'full') fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const t0 = Date.now(), last = mode === 'range' ? +process.argv[3] : N;
  for (let i = 0; i < last; i++) {
    await page.evaluate(i => Trailer.frame(i), i);
    await page.screenshot({ path: `${dir}/f_${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 });
    if (i % 300 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  const b64 = await page.evaluate(() => Trailer.renderAudio());
  fs.writeFileSync(`${OUT}/trailer-audio.wav`, Buffer.from(b64, 'base64'));
  const mp4 = `${OUT}/florida-dan-trailer.mp4`;
  // tv-range yuv420p (plays right on phones/socials) + loudness to -14 LUFS (YouTube/TikTok target)
  execFileSync(FF, ['-y', '-loglevel', 'error', '-framerate', '60', '-i', `${dir}/f_%05d.jpg`, '-i', `${OUT}/trailer-audio.wav`,
    '-vf', 'scale=in_range=pc:out_range=tv,format=yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', mp4]);
  console.log('wrote', mp4, `${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
