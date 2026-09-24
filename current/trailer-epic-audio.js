// FLORIDA DAN — the blockbuster cut's score (trailer.html?cut=epic).
// Act one: drone, a slow sad-piano cover of "Swamp Lite", BRAAMs on every title card, a ticking clock into the bite.
// Record scratch. Silence. Then the real song drops with timpani and a choir that has no business being there.
// The narrator is mixed in by the recorder (Trailer.vo), ducking the music under it.
'use strict';
(() => {
if (!/cut=epic/.test(location.search)) return;
Trailer.renderAudio = async function () {
  const SR = 48000, total = Trailer.total, ctx = new OfflineAudioContext(2, Math.ceil(SR * total), SR);
  const S = {}; for (const s of Trailer.epicShots) S[s.id] = s.start;
  const D = Trailer.dropAt, N = n => 440 * Math.pow(2, (n - 69) / 12);
  const master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -12; comp.ratio.value = 4; comp.connect(master);
  // a big cathedral-ish reverb, built from decaying noise
  const verb = ctx.createConvolver(); { const L = SR * 4.5, ir = ctx.createBuffer(2, L, SR); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 3.2); } verb.buffer = ir; }
  const vg = ctx.createGain(); vg.gain.value = .5; verb.connect(vg); vg.connect(comp);
  const nbuf = ctx.createBuffer(1, SR * 2, SR); { const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(x * 3.2); }
  function out(node, pan = 0, wet = 0) { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(comp); if (wet) { const w = ctx.createGain(); w.gain.value = wet; node.connect(w); w.connect(verb); } }
  function env(t, a, peak, dur, wet = 0, pan = 0) { const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0006, t + dur); out(g, pan, wet); return g; }
  function tone(t, f, dur, type = 'sine', vol = .1, slide = 0, pan = 0, attack = .004, wet = 0) {
    if (t < 0 || t > total) return; const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + dur);
    o.connect(env(t, attack, vol, dur, wet, pan)); o.start(t); o.stop(t + dur + .05); return o;
  }
  function noise(t, dur, vol = .2, type = 'highpass', freq = 1000, q = .7, pan = 0, attack = .002, f1, wet = 0) {
    if (t < 0 || t > total) return; const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(); s.buffer = nbuf; s.loop = true;
    f.type = type; f.frequency.setValueAtTime(freq, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q;
    s.connect(f); f.connect(env(t, attack, vol, dur, wet, pan)); s.start(t, Math.random()); s.stop(t + dur + .05); return f;
  }

  // ---------- the trailer toolkit ----------
  function braam(t, dur = 3.2, v = 1, root = 28) {   // the Inception horn: distorted detuned brass through a filter that blats open
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 4; f.frequency.setValueAtTime(90, t); f.frequency.linearRampToValueAtTime(1500, t + .1); f.frequency.exponentialRampToValueAtTime(240, t + dur);
    const ws = ctx.createWaveShaper(); ws.curve = curve; const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.32 * v, t + .04); g.gain.setValueAtTime(.32 * v, t + dur * .35); g.gain.exponentialRampToValueAtTime(.0006, t + dur);
    f.connect(ws); ws.connect(g); out(g, 0, .45);
    for (const n of [root, root + 12, root + 19, root + 24]) for (const d of [-14, -5, 6, 15]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = N(n); o.detune.value = d; const og = ctx.createGain(); og.gain.value = n === root ? .5 : .28; o.connect(og); og.connect(f); o.start(t); o.stop(t + dur + .05); }
    tone(t, N(root), dur, 'sine', .55 * v, 0, 0, .03);   // sub
    noise(t, .35, .25 * v, 'lowpass', 400, .7, 0, .01, 120);
  }
  function hit(t, v = 1) {   // trailer impact: sub drop, body, metal, tail
    tone(t, 72, 1.6, 'sine', .8 * v, -46, 0, .002); noise(t, .6, .45 * v, 'lowpass', 900, .7, 0, .002, 80, .4);
    for (const [m, a] of [[1, .12], [1.41, .09], [2.07, .07], [2.93, .05], [4.1, .04]]) tone(t, 180 * m, 2.2, 'sine', a * v, 0, (m % 1) - .5, .002, .9);
    noise(t, 2.6, .07 * v, 'highpass', 4500, .5, 0, .002, 0, .8);
  }
  const swell = (t, d = 1.2, v = .25) => noise(t - d, d, v, 'bandpass', 300, 1, 0, d * .97, 6000, .5);   // reverse suck into a hit
  function piano(t, n, dur = 2.4, v = .12, pan = 0) {
    const f = N(n); for (const [m, a] of [[1, 1], [2, .45], [3, .18], [4, .08]]) tone(t, f * m, dur / m ** .4, 'sine', v * a, 0, pan, .004, .75);
    noise(t, .03, v * .15, 'bandpass', f * 4, 2, pan);
  }
  function choir(t, notes, dur, v = .06) {   // "aah": vibrato saws through two vowel formants
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + Math.min(.8, dur * .4)); g.gain.setValueAtTime(v, t + dur * .7); g.gain.linearRampToValueAtTime(0, t + dur); out(g, 0, .9);
    const f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(); f1.type = f2.type = 'bandpass'; f1.frequency.value = 720; f1.Q.value = 5; f2.frequency.value = 1150; f2.Q.value = 6; f1.connect(g); f2.connect(g);
    for (const n of notes) for (const d of [-9, 0, 9]) { const o = ctx.createOscillator(), l = ctx.createOscillator(), lg = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = N(n); o.detune.value = d; l.frequency.value = 5 + d * .03; lg.gain.value = 9; l.connect(lg); lg.connect(o.detune); o.connect(f1); o.connect(f2); o.start(t); o.stop(t + dur + .1); l.start(t); l.stop(t + dur + .1); }
  }
  function drone(t0, t1, v = .12) {
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + 2); g.gain.setValueAtTime(v, t1 - 1); g.gain.linearRampToValueAtTime(0, t1); out(g, 0, .5);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.connect(g);
    for (const [n, d] of [[28, 0], [40, -6], [40, 6], [47, 3]]) { const o = ctx.createOscillator(); o.type = n === 28 ? 'sine' : 'sawtooth'; o.frequency.value = N(n); o.detune.value = d; o.connect(lp); o.start(t0); o.stop(t1 + .1); }
    const air = noise(t0, t1 - t0, v * .25, 'bandpass', 2400, 3, 0, 2); if (air) air.frequency.linearRampToValueAtTime(3600, t1);
  }
  const timp = (t, v = .5) => { tone(t, 78, .9, 'sine', v, -16, 0, .002, .4); noise(t, .1, v * .35, 'lowpass', 500); };
  const roll = (t0, t1, v = .3) => { for (let t = t0; t < t1; t += .045) timp(t, .08 + v * (t - t0) / (t1 - t0)); };
  const tick = (t, v = .2) => { noise(t, .018, v, 'highpass', 3200); tone(t, 1900, .02, 'square', v * .15); };
  const kick = (t, v = .8) => { tone(t, 150, .25, 'sine', v, -110); noise(t, .02, .2, 'highpass', 3000); };
  const crash = (t, v = .3) => noise(t, 2, v, 'highpass', 5000, .5, -.2, .002, 0, .3);
  const whoosh = (t, d = .4, v = .14) => noise(t, d, v, 'bandpass', 500, 1.2, 0, d * .6, 6000);
  const chomp = t => { noise(t, .12, .6, 'lowpass', 900); tone(t, 95, .25, 'square', .22, -45); };
  const boom = (t, v = 1) => { noise(t, 1.6, .6 * v, 'lowpass', 500, .7, 0, .002, 60, .5); tone(t, 62, 1.2, 'sine', .6 * v, -30); noise(t, .08, .3 * v, 'highpass', 2000); };
  const scratch = t => { tone(t, 900, .42, 'sawtooth', .18, -780); noise(t, .4, .28, 'bandpass', 1500, 2); };
  const crack = t => { noise(t, .06, .35, 'highpass', 3000); noise(t + .04, .5, .08, 'highpass', 6000); for (let i = 0; i < 3; i++) tone(t + .55 + i * .16, 150 - i * 12, .1, 'sine', .12, -40); };
  const crickets = (t0, t1, v = .04) => { for (let t = t0; t < t1; t += .09) if (Math.random() < .6) tone(t, 4200 + Math.random() * 300, .05, 'sine', v, 0, Math.random() - .5); };
  const siren = (t0, t1) => { for (let t = t0, i = 0; t < t1; t += .22, i++) tone(t, i % 2 ? 700 : 950, .22, 'sine', .04); };
  const blips = (t, n, b = 180) => { for (let i = 0; i < n; i++) tone(t + i * .055, b + Math.random() * 140, .035, 'square', .03); };
  function burp(t) {   // the studio "lion" roars
    const o = ctx.createOscillator(), l = ctx.createOscillator(), lg = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(95, t); o.frequency.linearRampToValueAtTime(70, t + .6); l.frequency.value = 23; lg.gain.value = 18; l.connect(lg); lg.connect(o.frequency);
    f.type = 'lowpass'; f.frequency.value = 520; f.Q.value = 3; o.connect(f); f.connect(env(t, .03, .4, .7, .5)); o.start(t); o.stop(t + .75); l.start(t); l.stop(t + .75);
    noise(t, .6, .08, 'bandpass', 300, 2, 0, .05);
  }
  function engine(t, d = 1.6) {   // a stock car clearing its throat
    const o = ctx.createOscillator(), ws = ctx.createWaveShaper(), f = ctx.createBiquadFilter(); ws.curve = curve; o.type = 'sawtooth';
    o.frequency.setValueAtTime(48, t); o.frequency.exponentialRampToValueAtTime(190, t + d * .55); o.frequency.exponentialRampToValueAtTime(120, t + d);
    f.type = 'lowpass'; f.frequency.value = 900; o.connect(f); f.connect(ws); ws.connect(env(t, .05, .16, d, .2)); o.start(t); o.stop(t + d + .05);
  }
  function shepard(t0, t1, v = .07) {   // the endless riser: octave-spaced sines climbing forever
    const oct = 1.25, lo = 55, span = 7;
    for (let i = 0; i < span; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.connect(g); out(g, 0, .3);
      for (let t = t0; t <= t1 + 1e-6; t += .02) {
        const p = ((i + (t - t0) / oct) % span), f = lo * Math.pow(2, p), a = Math.sin(Math.PI * p / span) ** 2 * v * (.4 + .6 * (t - t0) / (t1 - t0));
        if (t === t0) { o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); } else { o.frequency.setValueAtTime(f, t); g.gain.linearRampToValueAtTime(a, t); }
      }
      g.gain.linearRampToValueAtTime(0, t1 + .02); o.start(t0); o.stop(t1 + .05);
    }
  }

  // =============== PRE-ROLL ===============
  noise(0, S.studio, .012, 'lowpass', 180, .7, 0, .5);   // projector-room hum
  choir(S.studio + .05, [52, 59, 64, 67, 71], 3.2, .045); tone(S.studio + .05, N(40), 3.2, 'sine', .12, 0, 0, .8, .5);
  for (let i = 0; i < 5; i++) tone(S.studio + .3 + i * .12, N([76, 79, 83, 86, 88][i]), 1.6, 'sine', .035, 0, i % 2 ? .4 : -.4, .01, .9);   // twinkle
  burp(S.studio + 1.28);

  // =============== ACT ONE ===============
  drone(S.dawn, S.bite + 4.6, .1);
  // the hook, as a slow sad piano: Swamp Lite's whistle line at a funeral tempo
  const HOOK = [[71, 1], [71, .5], [67, .5], [69, .5], [71, 1.5], [74, 1], [71, 1.5], [72, 1.5], [71, .5], [69, .5], [67, 1], [64, 2]];
  const BASS = [40, 36, 43, 38];
  let t = S.dawn + .6, k = 0;
  while (t < S.bite + 2.6) {
    const [n, d] = HOOK[k % HOOK.length]; piano(t, n, d * 1.6 + .8, .1);
    if (k % 6 === 0) { const b = BASS[Math.floor(k / 6) % 4]; piano(t, b, 4, .09, -.2); piano(t, b + 12, 4, .05, .2); }
    t += d * .78; k++;
  }
  // BRAAMs land on every card
  swell(S.legends + 3.25, 1.0, .2); braam(S.legends + 3.25, 3.6, 1); timp(S.legends + 3.25, .7);
  braam(S.hero + 1.0, 3.0, .85); swell(S.hero + 1.0, .8, .15);
  braam(S.beer + .6, 2.8, .85, 26); tone(S.beer + .1, 3000, .05, 'sine', 0);
  crack(S.beer + .12 / .3);   // the can, in slow motion
  braam(S.cooler + .7, 3.0, .9, 31);
  for (let t2 = S.cooler; t2 < S.cooler + 2.4; t2 += .05) tone(t2, 40 + Math.sin(t2 * 7) * 2, .07, 'sawtooth', .03);   // slow-mo cooler motor
  choir(S.fishcard, [64, 67, 71], 2.2, .05);
  // the bite: a clock that won't stop, getting faster, strings pulling tight
  const freeze = S.bite + 4.57;
  for (let t2 = S.bite, dt = .5; t2 < freeze - .02; t2 += dt, dt = Math.max(.11, dt * .95)) tick(t2, .16 + .1 * (t2 - S.bite) / 4.6);
  { const o = tone(S.bite + 1.5, N(52), freeze - S.bite - 1.5, 'sawtooth', .05, N(64) - N(52), 0, 2.4, .6); }
  shepard(S.bite + 2.2, freeze, .05);
  chomp(S.bite + 4.14); scratch(freeze);
  // ...and then nothing. Just the caption.

  // =============== THE DROP ===============
  hit(D, 1.1); crash(D, .4); kick(D, 1);
  const mg = ctx.createGain(); mg.gain.value = .9; mg.connect(master);
  const MR = Music.rig(ctx, mg), BPM = 120, MIA = { arp: 1, gated: 1, pad: 1 };
  const sec = (name, t0, t1, o) => Music.span(MR, 'swamp', name, t0, t1 || t0 + 8, BPM, o);
  sec('a', D); sec('a2', D + 8); sec('a', D + 16);
  // the epic layer: timpani on every bar, a choir following the chords (Em C G D)
  const CH = [[52, 59, 64, 67], [48, 55, 60, 64], [55, 59, 62, 67], [50, 57, 62, 66]];
  for (let b = 0; b < 12; b++) { const tb = D + b * 2; timp(tb, .4); if (b % 4 === 3) roll(tb + 1.55, tb + 2, .25); choir(tb, CH[b % 4].map(n => n + 12), 2.05, .028); }
  // spot effects
  chomp(S.wrestle + .05); boom(S.wrestle + 1.0, .4); whoosh(S.wrestle + .9, .4, .1);
  for (const q of ['q1', 'q2']) { hit(S[q], .35); for (let i = 0; i < 5; i++) tone(S[q] + i * .06, N(84 + [0, 4, 7, 12, 16][i]), .7, 'sine', .03, 0, 0, .004, .8); }
  whoosh(S.chase - .1, .35); siren(S.chase, S.chase + 1.6); noise(S.chase + 1.4, .1, .25, 'lowpass', 600);
  Trailer.epicBooms.forEach((b, i) => boom(S.walkaway + b, .8 - i * .03));
  whoosh(S.iguana - .1, .3); for (const b of [.2, 1.2]) noise(S.iguana + b + .55, .08, .25, 'lowpass', 500);
  noise(S.objection + 1.3, .1, .35, 'lowpass', 300); hit(S.objection + 1.3, .5);
  hit(S.laurels, .3); for (let i = 0; i < 6; i++) tone(S.laurels + .05 + i * .07, N(79 + [0, 5, 7, 12, 17, 19][i]), .9, 'sine', .028, 0, 0, .004, .9);
  chomp(S.court + 1.6 / 1.3); hit(S.court + 1.25, .4);

  // =============== ACT THREE ===============
  const M = S.miami;
  sec('b', M, M + 6, MIA); Music.I.riser(MR, M + 4, 2, 1.1); swell(M + 6, 1, .15);
  hit(M + 3.7, .5); choir(M + 3.7, [64, 71, 76, 79], 2.3, .04);
  sec('a', M + 6, M + 14, MIA); crash(M + 6, .35);
  boom(S.lambo + 2.2, .9); noise(S.lambo + 2.2, 1.4, .3, 'lowpass', 900, .7, 0, .01, 0, .4);   // sploosh, slow-mo
  whoosh(S.boat - .1, .35);
  // Daytona: the band cuts, an engine clears its throat, BRAAM
  mg.gain.setValueAtTime(.9, S.daytona - .02); mg.gain.linearRampToValueAtTime(.0, S.daytona + .05);
  engine(S.daytona + .05, 1.0); braam(S.daytona + 1.0, 2.2, 1, 26); timp(S.daytona + 1.0, .7);
  mg.gain.setValueAtTime(0, S.convoy - .01); mg.gain.linearRampToValueAtTime(.9, S.convoy + .02);
  sec('a2', S.convoy, S.convoy + 6, MIA); hit(S.convoy, .6); crash(S.convoy, .35);
  for (let t2 = S.convoy; t2 < S.convoy + 3; t2 += .22) noise(t2, .2, .05, 'lowpass', 240);   // a parade of engines
  engine(S.speedway + .1, 1.2); noise(S.speedway + 1.2, .9, .12, 'bandpass', 900, 2, 0, .3, 200);
  // the montage: everything at once, a riser that never ends, a whoosh on every cut
  const MT = S.m_powder;
  sec('fin', MT, MT + 4, MIA); shepard(MT, MT + 4, .06); roll(MT + 3, MT + 4, .45);
  for (let i = 0; i < 8; i++) { whoosh(MT + i * .5 - .12, .25, .1); timp(MT + i * .5, .3); }
  mg.gain.setValueAtTime(.9, S.silence - .02); mg.gain.linearRampToValueAtTime(0, S.silence);
  hit(S.silence, .5);   // the cut to black lands, then nothing

  // =============== ACT FOUR ===============
  crickets(S.silence + .6, S.title, .035); crack(S.swears + 4.12);
  swell(S.title, 1.3, .25); braam(S.title, 5, 1.2); hit(S.title, 1); roll(S.title - 1.2, S.title, .4);
  choir(S.title + .05, [52, 59, 64, 67, 71, 76], 5.2, .06); crash(S.title, .35);
  crickets(S.stinger, S.end, .03); blips(S.stinger + .05, 16, 160); blips(S.stinger + 2.3, 6, 200);
  [466, 440, 415, 392].forEach((f, i) => tone(S.stinger + 3.0 + i * .22, f, i === 3 ? .6 : .2, 'sawtooth', .05, i === 3 ? -40 : 0));
  // end card: the song, proud and a little too loud, fading out
  mg.gain.setValueAtTime(.9, S.end); sec('a', S.end, total); kick(S.end, .9); hit(S.end, .5);
  choir(S.end, [64, 71, 76], 6.2, .03);
  mg.gain.setValueAtTime(.9, total - 2); mg.gain.linearRampToValueAtTime(0, total - .05);

  const buf = await ctx.startRendering(), n = buf.length, dv = new DataView(new ArrayBuffer(44 + n * 4)), w = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true); dv.setUint32(24, SR, true); dv.setUint32(28, SR * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 4, true);
  const L = buf.getChannelData(0), Rr = buf.getChannelData(1);
  for (let i = 0; i < n; i++) { dv.setInt16(44 + i * 4, clamp(L[i], -1, 1) * 32767, true); dv.setInt16(46 + i * 4, clamp(Rr[i], -1, 1) * 32767, true); }
  let s = ''; const u = new Uint8Array(dv.buffer); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode(...u.subarray(i, i + 32768));
  return btoa(s);
};
})();
