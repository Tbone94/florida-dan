// Riso press. The game never draws colors — it draws INK DENSITIES into a small
// 320x180 buffer: red channel = blue ink, green = fluorescent pink, blue = yellow.
// This shader "prints" that buffer: each ink gets its own halftone screen angle,
// its own misregistration offset, patchy coverage and speckle, then the three
// passes multiply onto paper like real overprinted riso ink.
'use strict';
const Riso = (() => {
  const INK = { blue: [0, 120, 191], pink: [255, 72, 176], yellow: [255, 232, 0] };
  const PAPER = [243, 236, 221];
  let gl, cv, src, tex, U = {}, fb = null, fbCtx = null;

  const VS = `attribute vec2 p; varying vec2 uv;
    void main(){ uv = vec2(p.x*.5+.5, .5-p.y*.5); gl_Position = vec4(p,0.,1.); }`;

  const FS = `precision highp float;
    varying vec2 uv;
    uniform sampler2D tex;
    uniform vec2 src, res, o0, o1, o2;
    uniform float t, wob, cell;
    uniform vec3 tint, ink0, ink1, ink2, paper;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
      return mix(mix(h(i), h(i+vec2(1.,0.)), f.x), mix(h(i+vec2(0.,1.)), h(i+vec2(1.,1.)), f.x), f.y); }
    vec2 wobble(float k){ return vec2(sin(uv.y*17. + t*1.7 + k), cos(uv.x*13. + t*1.3 + k)*.6) * wob; }
    float screenDot(float d, vec2 fc, float a){
      vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * fc / cell;
      float r = sqrt(d) * .74, aa = 1.3 / cell;
      return smoothstep(r + aa, r - aa, length(fract(q) - .5));
    }
    float press(float d, float tn, vec2 fc, float ang, float seed){
      d = pow(clamp(d + tn, 0., 1.), .85);
      if (d < .025) return 0.;
      float c = mix(screenDot(d, fc, ang), 1., smoothstep(.6, .9, d));   // heavy ink prints solid
      c *= .84 + .16 * vn(fc * .012 + seed);                             // uneven drum pressure
      c *= step(.012, h(floor(fc / cell * 2.) + seed));                   // speckle drop-outs
      return c;
    }
    void main(){
      vec2 fc = uv * res, px = 1. / src;
      float b = texture2D(tex, uv + (o0 + wobble(0.)) * px).r;
      float p = texture2D(tex, uv + (o1 + wobble(2.1)) * px).g;
      float y = texture2D(tex, uv + (o2 + wobble(4.2)) * px).b;
      vec3 col = paper;
      col *= mix(vec3(1.), ink0, press(b, tint.x, fc, .26, 3.));
      col *= mix(vec3(1.), ink1, press(p, tint.y, fc, 1.31, 17.));
      col *= mix(vec3(1.), ink2, press(y, tint.z, fc, .79, 41.));
      col *= .94 + .06 * h(floor(fc));                    // paper tooth
      col *= .975 + .025 * vn(fc * vec2(.015, .22));      // fibres
      gl_FragColor = vec4(col, 1.);
    }`;

  function compile(type, s) {
    const sh = gl.createShader(type); gl.shaderSource(sh, s); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  }

  function init(canvas, source) {
    cv = canvas; src = source;
    gl = cv.getContext('webgl', { antialias: false, preserveDrawingBuffer: true });
    if (!gl) { fbCtx = cv.getContext('2d'); fb = document.createElement('canvas'); fb.width = src.width; fb.height = src.height; return false; }
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]
      .forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
    ['tex', 'src', 'res', 'o0', 'o1', 'o2', 't', 'wob', 'cell', 'tint', 'ink0', 'ink1', 'ink2', 'paper'].forEach(n => U[n] = gl.getUniformLocation(prog, n));
    const n3 = a => a.map(v => v / 255);
    gl.uniform3fv(U.ink0, n3(INK.blue)); gl.uniform3fv(U.ink1, n3(INK.pink)); gl.uniform3fv(U.ink2, n3(INK.yellow)); gl.uniform3fv(U.paper, n3(PAPER));
    gl.uniform1i(U.tex, 0);
    return true;
  }

  // o = { off: [[x,y],[x,y],[x,y]] in art px, wob, tint: [b,p,y] 0..1, t }
  function render(o) {
    if (!gl) return fallback(o);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.uniform2f(U.src, src.width, src.height);
    gl.uniform2f(U.res, cv.width, cv.height);
    gl.uniform2fv(U.o0, o.off[0]); gl.uniform2fv(U.o1, o.off[1]); gl.uniform2fv(U.o2, o.off[2]);
    gl.uniform1f(U.t, o.t); gl.uniform1f(U.wob, o.wob);
    gl.uniform1f(U.cell, Math.max(4, cv.width / src.width * .9));
    gl.uniform3fv(U.tint, o.tint);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // No WebGL: flat multiply of the three inks, no halftone. Still reads as riso-ish.
  function fallback(o) {
    const sctx = src.getContext('2d'), d = sctx.getImageData(0, 0, src.width, src.height), a = d.data;
    for (let i = 0; i < a.length; i += 4) {
      const b = Math.min(1, a[i] / 255 + o.tint[0]), p = Math.min(1, a[i + 1] / 255 + o.tint[1]), y = Math.min(1, a[i + 2] / 255 + o.tint[2]);
      for (let c = 0; c < 3; c++) {
        a[i + c] = PAPER[c] * (1 - b * (1 - INK.blue[c] / 255)) * (1 - p * (1 - INK.pink[c] / 255)) * (1 - y * (1 - INK.yellow[c] / 255));
      }
    }
    fb.getContext('2d').putImageData(d, 0, 0);
    fbCtx.imageSmoothingEnabled = false;
    fbCtx.drawImage(fb, 0, 0, cv.width, cv.height);
  }

  return { init, render };
})();
