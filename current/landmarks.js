// FLORIDA DAN — the rest of the swamp: places that fill the map out so it isn't all crammed on the west side.
// Bubba's Bait, Boats & Bail Bonds (upgrades), The Leaky Tiki (boat-up bar), Palmetto Pines Trailer Park,
// the Sunshine Motor Inn and a fireworks-and-boiled-peanuts stand. Built into the swamp map by buildWorld().
'use strict';
function addLandmarks(add) {
  // Bubba's: middle of the mainland shore, with a dock out into the lake
  add('bubba', 55.6, 38.3, 4.4, 2);
  for (let y = 32; y <= 37; y++) for (const x of [58, 59]) if (World.tile(x, y) !== T.GRASS || y >= 36) World.set(x, y, T.DOCK);
  add('crabtrap', 54.2, 40.4, .8, .6); add('crabtrap', 61, 40.2, .8, .6); add('bait', 60.7, 38.7, 1, 1);
  // The Leaky Tiki: the empty island out east — boat up, belly up
  for (let x = 60; x <= 63; x++) World.set(x, 19, T.DOCK);
  add('tiki', 64.4, 16.4, 4, 2); add('stool', 64.6, 19.4, .5, .4, false); add('stool', 66, 19.4, .5, .4, false); add('stool', 67.4, 19.4, .5, .4, false);
  add('torch', 63.4, 17.6, .4, .4); add('torch', 69, 17.6, .4, .4);
  // Palmetto Pines Trailer Park: the empty southeast
  World.fill(72, 46, 88, 58, T.GRASS);
  for (let x = 72; x <= 88; x++) World.set(x, 51, T.SAND);   // the park's one gravel lane
  add('ppsign', 71.4, 46.6, 3, .5);
  add('dwide', 73, 47.8, 4.2, 2, true, { c: '#f3d9a4' }); add('dwide', 79, 47.4, 4.2, 2, true, { c: '#bfe3e0' }); add('dwide', 84.6, 48, 4.2, 2, true, { c: '#f5c1cf' });
  add('dwide', 74, 53.6, 4.2, 2, true, { c: '#e6e1f5' }); add('dwide', 81.4, 54, 4.2, 2, true, { c: '#f3d9a4' });
  add('kpool', 78.6, 55.6, 2, 1.2, false); add('flamingo', 77.6, 50.4, .5, .4, false); add('flamingo', 83.4, 50.3, .5, .4, false); add('flamingo', 86.6, 55.9, .5, .4, false);
  add('clothes', 84.6, 52.8, 3, .4, false); add('gnome', 73.2, 50.3, .4, .4, false);
  // Sunshine Motor Inn + fireworks stand: the empty strip south of the road
  World.fill(27, 51, 38, 53, T.CONCRETE);
  add('motel', 27, 48, 11, 2.2); add('motelsign', 38.6, 50.8, 1, .6); add('icebox', 26, 50.2, 1, 1);
  addCabinJunk(add); add('newsbox', 21.3, 42.2, .7, .6);
  add('fireworks', 44.6, 47.6, 4, 1.8); add('pot', 49, 48.9, 1, 1);
  return {
    bubba: { x: 57.6 * TS, y: 41.2 * TS }, bubbaDock: { x: 58.5 * TS, y: 32.5 * TS }, tiki: { x: 66 * TS, y: 18.9 * TS }, tikiDock: { x: 61 * TS, y: 19.5 * TS },
    park: { x: 79 * TS, y: 51.5 * TS }, motel: { x: 32 * TS, y: 51 * TS }, fireworks: { x: 46.6 * TS, y: 50.2 * TS },
  };
}

function drawLandmark(p, x, y, w, h, t) {
  if (drawCabinJunk(p, x, y, t)) return true;
  switch (p.kind) {
    case 'bubba': {   // a tin-roof bait shack on stilts, hand-lettered to death
      shadow(x + w / 2, y + h + 2, w + 8, 6);
      OR(x, y - 10, w, h + 10, '#8a9a6a'); for (let i = 0; i < h + 10; i += 4) R(x, y - 10 + i, w, 1, '#6f7d55');
      OR(x - 4, y - 24, w + 8, 14, PAL.tin); for (let i = 0; i < w + 8; i += 4) R(x - 4 + i, y - 24, 1, 14, PAL.tinD); R(x + 20, y - 21, 10, 4, PAL.rust);
      OR(x + 8, y + 2, 16, 10, PAL.waterL); R(x + 8, y + 7, 16, 1, PAL.ink);                               // window
      OR(x + 36, y + h - 18, 12, 18, PAL.woodD); R(x + 45, y + h - 9, 2, 2, PAL.yellow);                  // door
      OR(x + 50, y + 1, 26, 9, PAL.white); label('LIVE', x + 63, y + 9, PAL.red, 6);
      R(x + 10, y - 30, 2, 8, PAL.woodD); R(x + w - 12, y - 30, 2, 8, PAL.woodD);
      OR(x + w / 2 - 76, y - 50, 152, 21, PAL.yellow); label("BUBBA'S", x + w / 2, y - 41, PAL.red, 7); label('BAIT · BOATS · BAIL BONDS', x + w / 2, y - 32, PAL.ink, 6);
      break;
    }
    case 'crabtrap': { shadow(x + 7, y + 10, 14); OR(x, y, 13, 9, PAL.greyD); for (let i = 2; i < 13; i += 3) R(x + i, y + 1, 1, 7, PAL.grey); R(x, y + 4, 13, 1, PAL.grey); break; }
    case 'bait': { shadow(x + 8, y + 15, 14); OR(x + 2, y + 1, 12, 12, PAL.white); R(x + 2, y + 1, 12, 3, PAL.blue); R(x + 4, y + 7, 8, 2, PAL.orange); break; }
    case 'tiki': {   // thatch roof, bamboo bar, a sign that has seen things
      shadow(x + w / 2, y + h + 3, w + 10, 7);
      OR(x + 4, y + 4, w - 8, h - 2, '#c9a05a'); for (let i = 6; i < w - 8; i += 6) R(x + 4 + i, y + 4, 2, h - 2, '#a57f3e');   // bamboo bar
      R(x + 6, y - 6, 3, 12, PAL.woodD); R(x + w - 9, y - 6, 3, 12, PAL.woodD);
      g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(x - 7, y - 3); g.lineTo(x + w / 2, y - 26); g.lineTo(x + w + 7, y - 3); g.closePath(); g.fill();
      g.fillStyle = '#d6b25e'; g.beginPath(); g.moveTo(x - 5, y - 4); g.lineTo(x + w / 2, y - 24); g.lineTo(x + w + 5, y - 4); g.closePath(); g.fill();
      for (let i = -4; i < w + 4; i += 5) R(x + i, y - 5 - (Math.abs(i - w / 2) < 12 ? 0 : 0), 2, 3, '#a57f3e');   // ragged thatch fringe
      OR(x + w / 2 - 22, y - 38, 44, 10, '#2f8f4e'); label('THE LEAKY TIKI', x + w / 2, y - 30, PAL.yellow, 6);
      if (Math.floor(t * 1.5) % 2) R(x + w - 16, y + 1, 3, 4, PAL.orange);   // a drink with an umbrella in it
      break;
    }
    case 'stool': { R(x + 1, y - 4, 7, 3, PAL.woodL); R(x + 3, y - 1, 2, 6, PAL.woodD); break; }
    case 'torch': { R(x + 2, y - 12, 2, 18, PAL.woodD); const f = Math.sin(t * 9 + x) > 0; R(x + 1, y - 17, 4, 5, f ? PAL.orange : PAL.yellow); R(x + 2, y - 19, 2, 2, PAL.yellow); break; }
    case 'ppsign': { R(x + 6, y - 6, 2, 12, PAL.woodD); R(x + 38, y - 6, 2, 12, PAL.woodD); OR(x - 22, y - 20, 90, 13, '#2f8f4e'); label('PALMETTO PINES', x + 23, y - 11, PAL.white, 6); break; }
    case 'dwide': {   // single-wide trailers, each its own pastel
      shadow(x + w / 2, y + h + 2, w + 6, 5);
      OR(x, y - 8, w, h + 8, p.c); R(x, y - 8, w, 3, PAL.white); R(x, y + h - 4, w, 4, PAL.greyD);
      OR(x + 7, y - 2, 12, 8, PAL.waterL); OR(x + w - 18, y - 2, 12, 8, PAL.waterL); OR(x + w / 2 - 4, y + 2, 9, h - 6, PAL.greyD);
      OR(x + w / 2 - 7, y + h - 1, 15, 4, PAL.concreteD);   // cinder-block steps
      if ((p.x + p.y) % 3 < 1) { R(x + w - 10, y - 14, 1, 6, PAL.grey); R(x + w - 14, y - 15, 9, 2, PAL.grey); }   // a satellite dish, for the stories
      break;
    }
    case 'kpool': { OR(x, y, w, h, '#4fb3e8'); R(x + 2, y + 2, w - 4, 2, PAL.foam); R(x, y, w, 2, '#ff8fc0'); break; }
    case 'clothes': { R(x, y - 16, 1, 18, PAL.woodD); R(x + w - 1, y - 16, 1, 18, PAL.woodD); R(x, y - 15, w, 1, PAL.grey);
      [['#e0433a', 4], ['#4f7bd1', 14], ['#f4efe6', 24], ['#ffd23f', 34]].forEach(([c, ox]) => R(x + ox, y - 14 + Math.round(Math.sin(t * 2 + ox) * .6), 7, 8, c)); break; }
    case 'gnome': { R(x + 1, y - 7, 5, 4, PAL.red); R(x + 2, y - 9, 3, 2, PAL.red); R(x + 1, y - 3, 5, 3, PAL.white); R(x + 1, y, 5, 3, PAL.blue); break; }
    case 'motel': {   // long, low, salmon; every door slightly ajar
      shadow(x + w / 2, y + h + 2, w + 8, 6);
      OR(x, y - 10, w, h + 10, '#f2a58a'); R(x, y - 10, w, 5, '#2ba59a'); R(x, y + h - 3, w, 3, PAL.concreteD);
      for (let i = 0; i < 7; i++) { const dx = x + 8 + i * 24; OR(dx, y + h - 20, 10, 17, '#2ba59a'); R(dx + 8, y + h - 12, 1, 1, PAL.yellow); OR(dx + 13, y - 1, 8, 7, PAL.waterL); label(String(i + 1), dx + 5, y + h - 21, PAL.white, 6); }
      break;
    }
    case 'motelsign': {
      R(x + 6, y - 30, 3, 36, PAL.greyD);
      OR(x - 28, y - 50, 62, 20, '#ff8a3d'); label('SUNSHINE', x + 3, y - 41, PAL.white, 6); label('MOTOR INN', x + 3, y - 33, PAL.yellow, 6);
      const on = Math.floor(t * 1.2) % 4 !== 0; OR(x - 22, y - 27, 50, 8, PAL.ink); label(on ? 'VACANCY' : 'VAC NCY', x + 3, y - 21, on ? PAL.neon : PAL.greyD, 5);
      break;
    }
    case 'icebox': { shadow(x + 8, y + 15, 14); OR(x + 1, y - 4, 14, 17, PAL.white); R(x + 1, y - 4, 14, 4, PAL.blue); label('ICE', x + 8, y + 8, PAL.blue, 6); break; }
    case 'fireworks': {   // a plywood stand with a hand-painted sign and a pot of peanuts going
      shadow(x + w / 2, y + h + 2, w + 6, 5);
      OR(x, y - 2, w, h + 2, PAL.woodL); for (let i = 4; i < w; i += 8) R(x + i, y - 2, 1, h + 2, PAL.woodD);
      R(x + 2, y - 16, 2, 14, PAL.woodD); R(x + w - 4, y - 16, 2, 14, PAL.woodD);
      for (let i = 0; i < w + 4; i += 8) R(x - 2 + i, y - 18, 8, 4, i % 16 ? PAL.white : PAL.red);   // striped awning
      OR(x + 4, y - 32, w - 8, 12, PAL.yellow); label('FIREWORKS', x + w / 2, y - 23, PAL.red, 6);
      OR(x + w / 2 - 50, y + h + 4, 100, 9, PAL.white); label('& BOILED PEANUTS', x + w / 2, y + h + 12, PAL.red, 6);
      break;
    }
    case 'pot': { shadow(x + 8, y + 14, 14); OR(x + 2, y + 2, 12, 9, PAL.greyD); R(x + 3, y + 2, 10, 2, PAL.mudL);
      if (Math.floor(t * 3) % 2) { g.globalAlpha = .5; R(x + 5, y - 3 - (t * 6) % 5, 3, 3, PAL.white); g.globalAlpha = 1; } break; }
    default: return false;
  }
  return true;
}
