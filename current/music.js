// FLORIDA DAN — the band. Songs (songs.js) are little tracker patterns; this synth plays them
// live in the game (scheduled a hair ahead on the audio clock) and offline for the trailer.
'use strict';
const Music = (() => {
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  const PC = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  // "E4 - . G4" → {step: {n, len}}; '-' holds the last note, '.' rests, a bare number is semitones above the chord root
  function parse(str) {
    const map = {}; let cur = null;
    str.trim().split(/\s+/).forEach((t, i) => {
      if (t === '-') { if (cur) cur.len++; return; }
      cur = null; if (t === '.') return;
      const slide = t.endsWith('~'); if (slide) t = t.slice(0, -1);   // '~' = 808 glide in from the last note
      const m = /^([A-G][#b]?)(\d)$/.exec(t);
      cur = m ? { n: PC[m[1]] + (+m[2] + 1) * 12, len: 1, slide } : { rel: +t, len: 1, slide };
      map[i] = cur;
    });
    map._len = str.trim().split(/\s+/).length; return map;
  }

  // ---------- the rig: one per audio context ----------
  function rig(ctx, dest) {
    if (ctx._fdRig) return ctx._fdRig;
    const R = { ctx };
    R.bus = ctx.createGain(); R.lp = ctx.createBiquadFilter(); R.lp.type = 'lowpass'; R.lp.frequency.value = 20000;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3.5; comp.attack.value = .004; comp.release.value = .14;
    const lim = ctx.createDynamicsCompressor(); lim.threshold.value = -4; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .08;
    R.bus.gain.value = .8; R.bus.connect(R.lp); R.lp.connect(comp); comp.connect(lim); lim.connect(dest);
    R.pump = ctx.createGain(); R.pump.connect(R.bus);                       // sidechain: the kick ducks this
    const len = Math.floor(ctx.sampleRate * 2.2), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.4); }
    R.verb = ctx.createConvolver(); R.verb.buffer = ir; const vg = ctx.createGain(); vg.gain.value = .32; R.verb.connect(vg); vg.connect(R.bus);
    R.dly = ctx.createDelay(2); const fb = ctx.createGain(), dlp = ctx.createBiquadFilter(), dg = ctx.createGain();
    fb.gain.value = .36; dlp.type = 'lowpass'; dlp.frequency.value = 2400; dg.gain.value = .42;
    R.dly.connect(dlp); dlp.connect(fb); fb.connect(R.dly); dlp.connect(dg); dg.connect(R.bus);
    const nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; R.noise = nb;
    R.curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) R.curve[i] = Math.tanh((i / 511.5 - 1) * 2.4);
    R.pumpDepth = .45;
    return ctx._fdRig = R;
  }

  // ---------- building blocks ----------
  function osc(R, type, f, t, end, det = 0) { const o = R.ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = det; o.start(t); o.stop(end + .05); return o; }
  function amp(R, t, a, peak, hold, rel, out) {
    const g = R.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + a + hold); g.gain.exponentialRampToValueAtTime(.0004, t + a + hold + rel); g.connect(out); return g;
  }
  function filt(R, type, f, q, out) { const b = R.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; b.connect(out); return b; }
  function pan(R, p, out) { const s = R.ctx.createStereoPanner(); s.pan.value = p; s.connect(out); return s; }
  function send(R, node, amt, to) { const g = R.ctx.createGain(); g.gain.value = amt; node.connect(g); g.connect(to); }
  function nz(R, t, dur) { const s = R.ctx.createBufferSource(); s.buffer = R.noise; s.loop = true; s.start(t, Math.random() * .5); s.stop(t + dur + .05); return s; }

  // ---------- the band ----------
  const I = {
    kick(R, t, v = 1) {
      const o = osc(R, 'sine', 160, t, t + .4); o.frequency.exponentialRampToValueAtTime(44, t + .12);
      o.connect(amp(R, t, .002, .8 * v, .03, .28, R.bus));
      nz(R, t, .02).connect(filt(R, 'highpass', 3500, .7, amp(R, t, .001, .22 * v, 0, .012, R.bus)));
      const p = R.pump.gain; p.setValueAtTime(R.pumpDepth, t); p.linearRampToValueAtTime(1, t + .21);
    },
    snare(R, t, v = 1, gated) {
      const g = amp(R, t, .001, (gated ? .34 : .42) * v, gated ? .17 : 0, gated ? .025 : .15, R.bus); send(R, g, gated ? .45 : .2, R.verb);
      nz(R, t, .3).connect(filt(R, gated ? 'lowpass' : 'bandpass', gated ? 5200 : 1900, .7, g));
      const b = osc(R, 'triangle', 210, t, t + .12); b.frequency.exponentialRampToValueAtTime(150, t + .08); b.connect(amp(R, t, .001, .22 * v, 0, .09, R.bus));
    },
    clap(R, t, v = 1) {
      for (const k of [0, .011, .023]) nz(R, t + k, .03).connect(filt(R, 'bandpass', 1250, 1.1, amp(R, t + k, .001, .38 * v, 0, .025, R.bus)));
      const tail = amp(R, t + .03, .001, .24 * v, 0, .16, R.bus); send(R, tail, .35, R.verb); nz(R, t + .03, .2).connect(filt(R, 'bandpass', 1400, .9, tail));
    },
    hat(R, t, v = 1, open) { nz(R, t, open ? .3 : .05).connect(filt(R, 'highpass', 7600, .6, amp(R, t, .001, .3 * v, 0, open ? .24 : .04, pan(R, .22, R.bus)))); },
    rim(R, t, v = 1) { osc(R, 'square', 820, t, t + .03).connect(filt(R, 'bandpass', 1700, 2, amp(R, t, .001, .24 * v, 0, .03, pan(R, -.15, R.bus)))); },
    shaker(R, t, v = 1) { nz(R, t, .06).connect(filt(R, 'bandpass', 6000, 1.5, amp(R, t, .015, .13 * v, 0, .05, pan(R, .35, R.bus)))); },
    crash(R, t, v = 1) { const g = amp(R, t, .001, .22 * v, 0, 1.7, R.bus); send(R, g, .3, R.verb); nz(R, t, 1.8).connect(filt(R, 'highpass', 5200, .5, g)); },
    b808(R, t, f, dur, v = 1, from) {
      const ws = R.ctx.createWaveShaper(); ws.curve = R.curve; ws.connect(amp(R, t, .004, .34 * v, dur * .55, Math.max(.12, dur * .5), R.pump));
      const o = osc(R, 'sine', from || f, t, t + dur * 1.2 + .1); if (from) o.frequency.exponentialRampToValueAtTime(f, t + .07); o.connect(ws);
      const h = osc(R, 'triangle', (from || f) * 2, t, t + dur + .1); if (from) h.frequency.exponentialRampToValueAtTime(f * 2, t + .07);
      const hg = R.ctx.createGain(); hg.gain.value = .18; h.connect(hg); hg.connect(ws);
    },
    saw(R, t, f, dur, v = 1, bright = 1) {   // gritty filtered bass
      const lp = filt(R, 'lowpass', 180, 5, amp(R, t, .004, .2 * v, Math.max(0, dur - .06), .08, R.pump));
      lp.frequency.setValueAtTime(180, t); lp.frequency.linearRampToValueAtTime(900 + 900 * bright, t + .012); lp.frequency.exponentialRampToValueAtTime(260, t + .18);
      for (const d of [-9, 9]) osc(R, 'sawtooth', f, t, t + dur + .1, d).connect(lp);
    },
    banjo(R, t, f, v = 1, p = 0) {
      const g = amp(R, t, .001, .16 * v, 0, .3, pan(R, p, R.pump)); send(R, g, .12, R.verb);
      const pk = filt(R, 'peaking', 3200, 1, g); pk.gain.value = 10; const hp = filt(R, 'highpass', 320, .7, pk);   // bright twangy pick
      for (const [type, mul, lvl] of [['square', 1, 1], ['triangle', 2, .6]]) {
        const o = osc(R, type, f * mul * 1.014, t, t + .35); o.frequency.exponentialRampToValueAtTime(f * mul, t + .025);
        const lg = R.ctx.createGain(); lg.gain.value = lvl; o.connect(lg); lg.connect(hp);
      }
    },
    whistle(R, t, f, dur, v = 1) {
      const g = amp(R, t, .025, .16 * v, dur * .8, .14, pan(R, .08, R.bus)); send(R, g, .3, R.dly); send(R, g, .25, R.verb);
      const lfo = osc(R, 'sine', 5.6, t, t + dur + .2), lg = R.ctx.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * .014, t + .22); lfo.connect(lg);
      for (const [type, lvl] of [['sine', 1], ['triangle', .55], ['square', .07]]) {
        const o = osc(R, type, f * .97, t, t + dur + .2); o.frequency.exponentialRampToValueAtTime(f, t + .045); lg.connect(o.frequency);
        const og = R.ctx.createGain(); og.gain.value = lvl; o.connect(og); og.connect(g);
      }
    },
    synth(R, t, f, dur, v = 1) {
      const g = amp(R, t, .012, .085 * v, dur * .85, .2, R.bus); send(R, g, .35, R.dly); send(R, g, .3, R.verb);
      const lp = filt(R, 'lowpass', 3400, 1.5, g);
      for (const [type, mul, det, lvl] of [['sawtooth', 1, -12, 1], ['sawtooth', 1, 12, 1], ['square', .5, 0, .45]]) {
        const o = osc(R, type, f * mul, t, t + dur + .25, det), og = R.ctx.createGain(); og.gain.value = lvl; o.connect(og); og.connect(lp);
      }
    },
    twang(R, t, f, dur, v = 1) {   // tremolo swamp guitar with a little slide into every note
      const g = amp(R, t, .004, .16 * v, dur * .7, .3, pan(R, -.2, R.bus)); send(R, g, .5, R.verb); send(R, g, .18, R.dly);
      const trem = R.ctx.createGain(); trem.gain.value = .7; trem.connect(g);
      const lfo = osc(R, 'sine', 6.5, t, t + dur + .4), lg = R.ctx.createGain(); lg.gain.value = .3; lfo.connect(lg); lg.connect(trem.gain);
      const lp = filt(R, 'lowpass', 4200, 1, trem);
      for (const [type, lvl] of [['triangle', 1], ['square', .22]]) {
        const o = osc(R, type, f * .94, t, t + dur + .4); o.frequency.exponentialRampToValueAtTime(f, t + .06);
        const og = R.ctx.createGain(); og.gain.value = lvl; o.connect(og); og.connect(lp);
      }
    },
    siren(R, t, f, dur, v = 1) {
      const g = amp(R, t, .01, .07 * v, dur * .8, .15, R.bus); send(R, g, .25, R.dly);
      const o = osc(R, 'sawtooth', f, t, t + dur + .2), lfo = osc(R, 'sine', 7, t, t + dur + .2), lg = R.ctx.createGain(); lg.gain.value = f * .02; lfo.connect(lg); lg.connect(o.frequency);
      o.connect(filt(R, 'bandpass', 1600, .8, g));
    },
    pad(R, t, notes, dur, v = 1) {
      const g = amp(R, t, .3, .03 * v, Math.max(0, dur - .45), .5, R.pump); send(R, g, .45, R.verb);
      const lp = filt(R, 'lowpass', 1200, .5, g);
      for (const n of notes) for (const d of [-14, 14]) osc(R, 'sawtooth', N(n), t, t + dur + .6, d).connect(lp);
    },
    arp(R, t, f, v = 1) { const g = amp(R, t, .002, .05 * v, 0, .14, pan(R, -.25, R.pump)); send(R, g, .4, R.dly); osc(R, 'square', f, t, t + .2).connect(filt(R, 'lowpass', 2600, 2, g)); },
    riser(R, t, dur, v = 1) {
      const g = R.ctx.createGain(); g.gain.setValueAtTime(.0005, t); g.gain.exponentialRampToValueAtTime(.2 * v, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + .02); g.connect(R.bus); send(R, g, .3, R.verb);
      const bp = filt(R, 'bandpass', 300, 1.2, g); bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(9000, t + dur); nz(R, t, dur).connect(bp);
      const o = osc(R, 'sawtooth', 110, t, t + dur); o.frequency.exponentialRampToValueAtTime(880, t + dur); const og = R.ctx.createGain(); og.gain.value = .25; o.connect(og); og.connect(bp);
    },
    impact(R, t, v = 1) { const o = osc(R, 'sine', 90, t, t + 1.2); o.frequency.exponentialRampToValueAtTime(30, t + 1); o.connect(amp(R, t, .002, .8 * v, .05, 1, R.bus)); I.crash(R, t, v); },
  };

  // ---------- the sequencer ----------
  const ROLLS = { fwd: [0, 1, 2, 0, 1, 2, 0, 2, 0, 1, 3, 0, 1, 2, 0, 3], alt: [3, 2, 1, 0, 3, 1, 2, 0, 3, 2, 1, 0, 2, 1, 3, 1] };
  function prep(S) { if (S._p) return; S._p = true; for (const k of ['bass', 'lead', 'lead2']) if (S[k]) S['_' + k] = parse(S[k]); }
  // plays one 16th step of one section. bar = bar index inside the section, st = 0..15
  function step(R, song, name, bar, st, t, s16, o = {}) {
    const S = song.sec[name]; prep(S);
    const chords = S.chords || song.chords, ch = chords[bar % chords.length];
    const idx = bar * 16 + st, hit = p => p ? p[idx % p.length] : '.';
    if (st % 2) t += (o.swing ?? song.swing ?? 0) * s16;
    const drums = !o.noDrums && !S.noDrums;
    if (drums) {
      let k = hit(S.kick); if (o.night && k !== '.' && st !== 0) k = '.';
      if (k !== '.') I.kick(R, t, k === 'o' ? 1 : .82);
      const sn = hit(S.snare); if (sn !== '.' && !o.night) I.snare(R, t, sn === 'o' ? 1 : .6, song.gated);
      if (hit(S.clap) !== '.') I.clap(R, t, o.night ? .5 : 1);
      if (hit(S.rim) !== '.') I.rim(R, t);
      const h = o.fast ? (st % 2 ? 'x' : 'o') : hit(S.hat);
      if (h !== '.' && !(o.lofi && st % 2)) I.hat(R, t, h === 'o' ? 1 : .6, h === 'O');
      if (hit(S.shaker) !== '.') I.shaker(R, t);
    }
    const note = (m, key) => { const e = m && m[idx % m._len]; return e ? { f: N(e.n ?? ch.r + e.rel), len: e.len * s16, e } : null; };
    const b = note(S._bass);
    if (b) {
      const wob = o.trip ? 1 + Math.sin(t * 3) * .03 : 1;
      if ((S.bassType || song.bassType) === '808') I.b808(R, t, b.f * wob, b.len, 1, b.e.slide ? R.lastBass : null); else I.saw(R, t, b.f * wob, b.len, 1, o.lofi ? 0 : 1);
      R.lastBass = b.f * wob;
    }
    if (!o.noLead) for (const k of ['_lead', '_lead2']) {
      const l = note(S[k]); if (!l) continue;
      const f = l.f * (o.trip ? 1 + Math.sin(t * 2.3) * .02 : 1), v = k === '_lead2' ? .6 : 1;
      I[(k === '_lead2' && S.lead2Type) || S.leadType || song.leadType](R, t, f, l.len, v);
    }
    if (S.banjo && !(o.lofi && st % 2)) { const r = ROLLS[S.banjo] || ROLLS.fwd; I.banjo(R, t, N(ch.v[r[st] % ch.v.length]) * (o.trip ? 1 + Math.sin(t * 5) * .015 : 1), st % 4 === 0 ? 1 : .75, st % 2 ? .3 : -.3); }
    if (S.twangArp && st % 2 === 0) I.twang(R, t, N(ch.v[[0, 1, 2, 3, 2, 1, 0, 1][st / 2 % 8]]), s16 * 2, .45);
    if (S.arp && !o.lofi) I.arp(R, t, N(ch.v[[0, 1, 2, 3, 2, 3, 1, 2][st % 8]] + (st >= 8 ? 12 : 0)), .8);
    if (S.pad && st === 0) I.pad(R, t, ch.v.slice(0, 3), s16 * 16, o.trip ? 1.4 : 1);
    if (S.sirens && st === 0 && bar % 2 === 0) { I.siren(R, t, 950, s16 * 3); I.siren(R, t + s16 * 4, 700, s16 * 3); I.siren(R, t + s16 * 8, 950, s16 * 3); I.siren(R, t + s16 * 12, 700, s16 * 3); }
  }
  // the song's full arrangement laid out bar by bar: [[section, barInSection], ...]
  function layout(song) {
    if (song._bars) return song._bars;
    const bars = []; for (const n of song.order) for (let b = 0; b < (song.sec[n].bars || 4); b++) bars.push([n, b]);
    return song._bars = bars;
  }
  function barAt(song, bar) { const L = layout(song), loop = song.loopAt || 0; return bar < L.length ? L[bar] : L[loop + (bar - L.length) % (L.length - loop)]; }

  // ---------- live play (the game) ----------
  const live = { R: null, cur: null, pos: {}, nextT: 0 };
  function pick(mood) {
    const mia = typeof MIAMI === 'function' && MIAMI();
    const base = mia ? ['ocean', 108] : ['swamp', 122];
    switch (mood) {
      case 'chase': return { key: 'chase', song: 'chase', bpm: 156, o: {}, lp: 20000 };
      case 'speed': return { key: 'speed' + mia, song: base[0], bpm: 150, o: { fast: 1 }, lp: 20000 };
      case 'slow': return { key: 'slow' + mia, song: base[0], bpm: 84, o: { lofi: 1, swing: .22 }, lp: 1300 };
      case 'trip': return { key: 'trip', song: 'gators', bpm: 74, o: { trip: 1 }, lp: 2400 };
      case 'night': return mia ? { key: 'nightm', song: 'ocean', bpm: 96, o: { night: 1 }, lp: 5000 } : { key: 'night', song: 'gators', bpm: 92, o: {}, lp: 20000 };
      default: return { key: 'norm' + mia, song: base[0], bpm: base[1], o: {}, lp: 20000 };
    }
  }
  function tick(ctx, dest, mood) {
    const R = live.R || (live.R = rig(ctx, dest));
    const want = pick(mood), sw = !live.cur || live.cur.key !== want.key, urgent = want.key === 'chase', G = R.bus.gain;
    if (sw && !live.fading && live.cur && !urgent) { live.fading = true; G.setTargetAtTime(.25, ctx.currentTime, .4); }   // ease the old song down...
    if (!sw && live.fading) { live.fading = false; G.setTargetAtTime(.8, ctx.currentTime, .2); }                       // (mood flickered back)
    if (live.nextT < ctx.currentTime) live.nextT = ctx.currentTime + .05;
    while (live.nextT < ctx.currentTime + .15) {
      const c = live.cur, p = c ? live.pos[c.song] || 0 : 0;
      if (sw && (!c || p % 16 === 0 || urgent)) {   // ...switch on the next bar line, and bring the new one up (the chase just kicks the door in)
        live.cur = want; live.fading = false; R.lp.frequency.setTargetAtTime(want.lp, live.nextT, .25);
        G.cancelScheduledValues(live.nextT); G.setValueAtTime(urgent ? .5 : .25, live.nextT); G.linearRampToValueAtTime(.8, live.nextT + (urgent ? .3 : 1.5));
        R.pumpDepth = SONGS[want.song].pump ?? .45; R.dly.delayTime.setValueAtTime(60 / want.bpm * .75, live.nextT);
        if (want.song === 'chase' || (c && c.song !== want.song && !live.pos[want.song])) live.pos[want.song] = (SONGS[want.song].enter || 0) * 16;
        return tick(ctx, dest, mood);
      }
      const cur = live.cur, i = live.pos[cur.song] || 0, s16 = 60 / cur.bpm / 4, song = SONGS[cur.song], [name, bar] = barAt(song, Math.floor(i / 16));
      step(R, song, name, bar, i % 16, live.nextT, s16, cur.o);
      live.pos[cur.song] = i + 1; live.nextT += s16;
    }
  }

  // ---------- offline (the trailer): play one section from t0 to t1 ----------
  function span(R, songId, name, t0, t1, bpm, o = {}, barOff = 0) {
    const song = SONGS[songId], s16 = 60 / bpm / 4, bars = song.sec[name].bars || 4;
    R.pumpDepth = song.pump ?? .45; R.dly.delayTime.setValueAtTime(s16 * 3, t0);
    for (let i = 0, t = t0; t < t1 - 1e-6; i++, t = t0 + i * s16) step(R, song, name, (Math.floor(i / 16) + barOff) % bars, i % 16, t, s16, o);
  }
  // offline: the whole arrangement from the top (the soundtrack preview files)
  function arrange(R, songId, t0, bars, bpm, o = {}) {
    const song = SONGS[songId], s16 = 60 / (bpm || song.bpm) / 4;
    R.pumpDepth = song.pump ?? .45; R.dly.delayTime.setValueAtTime(s16 * 3, t0);
    for (let i = 0; i < bars * 16; i++) { const [n, b] = barAt(song, Math.floor(i / 16)); step(R, song, n, b, i % 16, t0 + i * s16, s16, o); }
  }
  return { rig, tick, span, arrange, I, N, reset() { live.pos = {}; live.cur = null; } };
})();
