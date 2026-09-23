// FLORIDA DAN — engine: utils, input, sound, and the screen-FX shader that makes
// every substance look and feel different.
'use strict';
const VW = 320, VH = 180;
const $ = id => document.getElementById(id);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);
function hash2(x, y) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

// ---------- input ----------
const Input = (() => {
  const keys = new Set(), hit = new Set(), stick = { active: false, x: 0, y: 0, id: null };
  const MAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyE: 'a', Space: 'a', Enter: 'a', KeyQ: 'b', ShiftLeft: 'run', ShiftRight: 'run', KeyF: 'punch', KeyM: 'mute', Escape: 'pause', KeyP: 'pause', KeyJ: 'journal',
    Digit1: 's1', Digit2: 's2', Digit3: 's3', Digit4: 's4', Digit5: 's5', Digit6: 's6', Digit7: 's7', Digit8: 's8', Digit9: 's9' };
  addEventListener('keydown', e => {
    const k = MAP[e.code]; if (!k) return;
    if (e.target.tagName === 'BUTTON' && k === 'a') return;
    e.preventDefault(); if (!keys.has(k)) hit.add(k); keys.add(k); Sound.unlock();
  });
  addEventListener('keyup', e => { const k = MAP[e.code]; if (k) keys.delete(k); });
  addEventListener('blur', () => keys.clear());
  function bindStick(el, nub) {
    const move = e => {
      const r = el.getBoundingClientRect();
      let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
      stick.x = Math.abs(x) < .18 ? 0 : x; stick.y = Math.abs(y) < .18 ? 0 : y;
      nub.style.transform = `translate(${x * 38}px,${y * 38}px)`;
    };
    el.addEventListener('pointerdown', e => { stick.active = true; stick.id = e.pointerId; el.setPointerCapture(e.pointerId); move(e); Sound.unlock(); });
    el.addEventListener('pointermove', e => { if (stick.active && e.pointerId === stick.id) move(e); });
    const end = e => { if (e.pointerId !== stick.id) return; stick.active = false; stick.x = stick.y = 0; nub.style.transform = ''; };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }
  function bindButton(el, k) {
    el.addEventListener('pointerdown', e => { e.preventDefault(); keys.add(k); hit.add(k); Sound.unlock(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => el.addEventListener(ev, () => keys.delete(k)));
  }
  // Controller: standard layout (Xbox / PlayStation / most Bluetooth pads).
  // A use · B yell GIT · X punch · Y rap sheet · LB/RB pick item · LT use item · RT run · START pause · SELECT mute
  const PAD = { 0: 'a', 1: 'b', 2: 'punch', 3: 'journal', 4: 'prev', 5: 'next', 6: 'item', 7: 'run', 8: 'mute', 9: 'pause', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
  const padPrev = {}, padStick = { x: 0, y: 0 }, flick = { x: 0, y: 0 };
  let padActive = false, onPad = null;
  function poll() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let any = null;
    for (const p of pads) if (p && p.connected) { any = p; break; }
    padStick.x = padStick.y = 0;
    if (!any) return;
    for (const [i, k] of Object.entries(PAD)) {
      const b = any.buttons[i], on = !!b && (b.pressed || b.value > .5), was = padPrev[i];
      if (on && !was) { hit.add(k); keys.add(k); if (!padActive) { padActive = true; onPad && onPad(true); } Sound.unlock(); }
      if (!on && was) keys.delete(k);
      padPrev[i] = on;
    }
    let x = any.axes[0] || 0, y = any.axes[1] || 0;
    if (Math.hypot(x, y) < .25) x = y = 0;
    padStick.x = x; padStick.y = y;
    // a hard stick flick counts as a tap too (wrestling arrows, menus)
    const fx = x > .7 ? 1 : x < -.7 ? -1 : 0, fy = y > .7 ? 1 : y < -.7 ? -1 : 0;
    if (fx && fx !== flick.x) hit.add(fx > 0 ? 'right' : 'left');
    if (fy && fy !== flick.y) hit.add(fy > 0 ? 'down' : 'up');
    flick.x = fx; flick.y = fy;
    if (x || y) { if (!padActive) { padActive = true; onPad && onPad(true); } }
  }
  addEventListener('gamepadconnected', () => { Sound.unlock(); });
  addEventListener('keydown', () => { if (padActive) { padActive = false; onPad && onPad(false); } }, true);
  function rumble(strength, ms) {
    if (!padActive) return;
    try { for (const p of navigator.getGamepads()) if (p && p.vibrationActuator) p.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: strength, weakMagnitude: Math.min(1, strength * 1.2) }); } catch (e) { }
  }
  return {
    poll, rumble, get padActive() { return padActive; }, set onPad(fn) { onPad = fn; },
    held: k => keys.has(k), tapped: k => hit.has(k), press: k => hit.add(k), endFrame: () => hit.clear(), bindStick, bindButton,
    set: (k, on) => on ? keys.add(k) : keys.delete(k), releaseAll: () => keys.clear(),
    axis() {
      let x = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0), y = (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0);
      if (stick.active) { x = stick.x; y = stick.y; }
      else if (padStick.x || padStick.y) { x = padStick.x; y = padStick.y; }
      const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
      return { x, y };
    },
  };
})();

// ---------- sound: everything is synthesized, no files ----------
const Sound = (() => {
  let ac = null, master = null, muted = false, musicOn = false, musicT = 0;
  function unlock() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination); } catch (e) { ac = null; }
  }
  function tone(f, dur, type = 'square', vol = .15, slide = 0, delay = 0) {
    if (!ac || muted) return;
    const t = ac.currentTime + delay, o = ac.createOscillator(), gn = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + dur);
    gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(gn); gn.connect(master); o.start(t); o.stop(t + dur + .02);
  }
  function noise(dur, vol = .2, hp = 800, delay = 0) {
    if (!ac || muted) return;
    const t = ac.currentTime + delay, len = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain();
    s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t + dur);
    s.connect(f); f.connect(gn); gn.connect(master); s.start(t);
  }
  const FX = {
    pickup: () => { tone(660, .08, 'square', .1); tone(990, .1, 'square', .1, 0, .07); },
    crack: () => { noise(.12, .3, 2500); tone(180, .15, 'sine', .1, -80, .05); noise(.4, .08, 4000, .12); },
    cough: () => { noise(.12, .25, 300); noise(.15, .25, 300, .2); noise(.1, .2, 300, .45); },
    sniff: () => { noise(.35, .2, 3000); tone(1200, .3, 'sawtooth', .04, 800, .1); },
    munch: () => { for (let i = 0; i < 4; i++) noise(.05, .2, 1200, i * .09); },
    trip: () => { for (let i = 0; i < 6; i++) tone(300 + i * 90, .5, 'sine', .06, 200, i * .08); },
    splash: () => { noise(.35, .25, 500); },
    chomp: () => { noise(.08, .35, 200); tone(90, .2, 'square', .15, -40); },
    hurt: () => { tone(300, .25, 'sawtooth', .15, -220); },
    git: () => { tone(220, .12, 'sawtooth', .12, 60); tone(260, .18, 'sawtooth', .12, -40, .1); },
    cash: () => { tone(1320, .06, 'square', .1); tone(1760, .12, 'square', .1, 0, .06); },
    headline: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, .18, 'square', .09, 0, i * .07)); noise(.3, .1, 5000, .3); },
    reel: () => tone(900 + Math.random() * 200, .03, 'square', .03),
    snap: () => { noise(.06, .4, 3000); tone(1400, .1, 'sine', .1, -1200); },
    catch: () => { [392, 523, 659, 784].forEach((f, i) => tone(f, .14, 'triangle', .14, 0, i * .08)); },
    boom: () => { noise(.8, .45, 60); tone(70, .6, 'sine', .3, -40); },
    siren: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 700 : 950, .22, 'sine', .08, 0, i * .22); },
    talk: () => tone(180 + Math.random() * 140, .035, 'square', .04),
    engine: () => tone(60 + Math.random() * 20, .08, 'sawtooth', .04),
    punch: () => { noise(.07, .45, 150); tone(140, .12, 'square', .18, -80); noise(.05, .2, 2500, .02); },
    whiff: () => { noise(.18, .12, 1800); },
    fail: () => { tone(300, .2, 'square', .1, -100); tone(200, .35, 'square', .1, -80, .2); },
  };
  // the soundtrack: scheduled a hair ahead on the audio clock so it never drifts.
  // swamp-punk in E minor — stompy kick, banjo rolls, walking bass; the mood changes the band.
  const ROOTS = [82.41, 65.41, 98, 73.42], CH = [[0, 7, 12, 15, 19], [0, 7, 12, 16, 19], [0, 7, 12, 16, 19], [0, 7, 12, 14, 19]];
  const ROLL = [0, 2, 4, 1, 3, 2, 4, 1, 0, 3, 2, 4, 1, 2, 3, 4];
  let nextT = 0, stepN = 0;
  function playStep(i, d, mood, s16) {
    const st = i % 16, bar = Math.floor(i / 16) % 4, root = ROOTS[bar], ch = CH[bar];
    const chase = mood === 'chase', night = mood === 'night', trip = mood === 'trip', slow = mood === 'slow';
    if (!night && !trip && (st === 0 || st === 8 || (chase && st % 4 === 0) || (!slow && st === 10))) { tone(150, .18, 'sine', .16, -110, d); noise(.02, .05, 3000, d); }
    if (!night && (st === 4 || st === 12)) noise(.12, chase ? .09 : .06, 1500, d);
    if (!night && (chase || st % 2 === 0)) noise(.035, st % 4 === 2 ? .03 : .018, 7000, d);
    if ([0, 3, 6, 8, 11, 14].includes(st) && !(night && st % 8)) tone(root * (st === 6 || st === 14 ? 1.5 : 1) * (chase && st === 8 ? 2 : 1), s16 * 1.8, 'triangle', .08, 0, d);
    if (slow && st % 2) return;
    if (night && st % 4) return;
    const f = root * 4 * Math.pow(2, ch[ROLL[st]] / 12);
    if (trip) tone(f * (1 + Math.sin(i * .37) * .04), s16 * 2.5, 'sine', .03, Math.sin(i) * 40, d);
    else tone(f, .09, 'square', chase ? .022 : .017, 0, d);
    if (chase && st % 8 === 0) tone(root * 8, s16 * 3, 'sawtooth', .012, root * 2, d);
  }
  function music(dt, mood) {
    if (!ac || muted || !musicOn) return;
    const bpm = { speed: 150, chase: 152, slow: 84, trip: 96, night: 100 }[mood] || 116, s16 = 60 / bpm / 4;
    if (nextT < ac.currentTime) nextT = ac.currentTime + .05;
    while (nextT < ac.currentTime + .15) { playStep(stepN++, nextT - ac.currentTime, mood, s16); nextT += s16; }
  }
  // everybody gets a voice: [base pitch, wobble, waveform]
  const VOICES = { DAN: [140, 50, 'square'], MERLE: [92, 30, 'sawtooth'], DARLENE: [330, 120, 'square'], RHONDA: [205, 25, 'triangle'], BRENDA: [270, 70, 'sine'],
    TOURIST: [340, 170, 'sine'], JUDGE: [112, 18, 'triangle'], MANNY: [66, 12, 'sine'], KEVIN: [105, 15, 'sawtooth'], BAILIFF: [130, 20, 'triangle'],
    PROSECUTOR: [240, 40, 'triangle'], JUROR: [280, 160, 'square'], JURY: [260, 200, 'square'], 'TRASH BABY': [950, 300, 'square'], RADIO: [200, 60, 'sawtooth'] };
  function voice(who) {
    if (!ac || muted) return;
    who = (who || '').toUpperCase();
    if (!who) return noise(.015, .03, 6000);                               // narration: a typewriter tick
    if (/CHUCK|RACCOON|\?\?\?/.test(who)) return noise(.09, .07, 2500);   // hiss
    const k = Object.keys(VOICES).find(v => who.includes(v)), v = k ? VOICES[k] : [180, 120, 'square'];
    tone(v[0] + Math.random() * v[1], .06, v[2], /PHONE|TEXT|RADIO/.test(who) ? .035 : .05);
  }
  const RUMBLE = { punch: [.55, 110], chomp: [.7, 200], boom: [1, 450], hurt: [.45, 160], snap: [.5, 120], crack: [.15, 60], catch: [.3, 120], headline: [.25, 90] };
  return { unlock, play: n => { if (RUMBLE[n]) Input.rumble(...RUMBLE[n]); FX[n] && FX[n](); }, tone, music, voice, setMusic: v => musicOn = v,
    toggleMute() { muted = !muted; return muted; }, get muted() { return muted; } };
})();

// ---------- screen FX ----------
const Screen = (() => {
  let gl, cv, src, U = {}, ctx2d = null;
  const VS = 'attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x*.5+.5, .5-p.y*.5); gl_Position = vec4(p,0.,1.); }';
  const FS = `precision mediump float;
    varying vec2 uv;
    uniform sampler2D tex;
    uniform float t, drunk, high, shroom, powder, crash, flash, night, cig;
    uniform vec3 tint, view;
    vec3 hue(vec3 c, float a){ vec3 k = vec3(.57735); float ca = cos(a); return c*ca + cross(k, c)*sin(a) + k*dot(k, c)*(1. - ca); }
    vec3 S(vec2 u){ return texture2D(tex, clamp(u, .001, .999)).rgb; }
    void main(){
      vec2 u = view.xy + uv * view.z;
      u.x += sin(t*1.3 + u.y*3.) * .006 * drunk;
      u.y += cos(t*1.1 + u.x*2.) * .004 * drunk;
      u += vec2(sin(u.y*16. + t*2.), cos(u.x*12. + t*1.7)) * .007 * shroom;
      u = (u - .5) * (1. + sin(t*1.4) * .025 * shroom) + .5;
      u += (vec2(fract(sin(t*91.7)*437.1), fract(sin(t*57.3)*913.7)) - .5) * .003 * powder;
      vec3 c = S(u);
      if (drunk > .01) c = mix(c, S(u + vec2(.012 + sin(t*.9)*.008, cos(t*.7)*.006) * drunk), .42 * min(1., drunk));
      if (powder > .01) { float o = .0035 * powder; c.r = S(u + vec2(o, 0.)).r; c.b = S(u - vec2(o, 0.)).b; }
      c *= tint;
      float l = dot(c, vec3(.299, .587, .114));
      c = mix(vec3(l), c, 1. + .45*high + .7*shroom + .3*powder - .75*crash);
      if (shroom > .01) c = mix(c, hue(c, t*1.1 + u.y*5. + u.x*2.), .6 * shroom);
      c += vec3(.07, .03, -.03) * high;
      if (powder > .01) c = (c - .5) * (1. + .2*powder) + .5;
      float v = smoothstep(.9, .3, length(uv - .5) * (1. + night*.5 + crash*.7));
      c *= mix(1., v, .25 + night*.45 + crash*.45 + cig*.12);
      c = mix(c, vec3(1.), flash);
      gl_FragColor = vec4(c, 1.);
    }`;
  function init(canvas, source) {
    cv = canvas; src = source;
    gl = cv.getContext('webgl', { antialias: false, preserveDrawingBuffer: true });
    if (!gl) { ctx2d = cv.getContext('2d'); return; }
    const sh = (type, s) => { const x = gl.createShader(type); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
    const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
    ['t', 'drunk', 'high', 'shroom', 'powder', 'crash', 'flash', 'night', 'cig', 'tint', 'view'].forEach(n => U[n] = gl.getUniformLocation(prog, n));
  }
  function present(fx) {
    if (!gl) { ctx2d.imageSmoothingEnabled = false; ctx2d.drawImage(src, 0, 0, cv.width, cv.height); return; }
    gl.viewport(0, 0, cv.width, cv.height);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    for (const k of ['t', 'drunk', 'high', 'shroom', 'powder', 'crash', 'flash', 'night', 'cig']) gl.uniform1f(U[k], fx[k] || 0);
    gl.uniform3fv(U.tint, fx.tint || [1, 1, 1]);
    gl.uniform3fv(U.view, fx.view || [0, 0, 1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  return { init, present };
})();
