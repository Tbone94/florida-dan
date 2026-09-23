// FLORIDA DAN — the soundtrack. Four originals, written as tracker patterns for music.js.
// Drums: 16 chars a bar (x hit, o accent, O open hat, . rest). Notes: 16 tokens a bar
// (E4 = note, - = hold, . = rest, 7 = semitones above the chord root, ~ = 808 glide).
'use strict';
const SONGS = {
  // "SWAMP LITE" — the main theme. Banjo trap: stomp-clap, 808 slides, a whistled hook.
  swamp: {
    bpm: 122, swing: .06, bassType: '808', leadType: 'whistle', pump: .5, enter: 4, loopAt: 4,
    chords: [{ r: 40, v: [59, 64, 67, 71] }, { r: 36, v: [55, 60, 64, 67] }, { r: 43, v: [55, 59, 62, 67] }, { r: 38, v: [57, 62, 66, 69] }],   // Em C G D
    order: ['intro', 'a', 'a2', 'b', 'a', 'a2'],
    sec: {
      intro: {
        banjo: 'fwd',
        kick: '................' + '................' + 'o.......o.......' + 'o...o...o...o.o.',
        hat: '................' + '................' + 'x.o.x.o.x.o.x.o.' + 'x.o.x.o.xxxxxxxx',
        bass: '. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 0 - - - - - - - - - - - - - - - 0 - - - - - - - - - - - 12~ - - -',
      },
      a: {
        banjo: 'fwd',
        kick: 'o.....x...x.....' + 'o.....x...x.....' + 'o.....x...x.....' + 'o.....x...x..x.x',
        clap: '....x.......x...', snare: '....x.......x...',
        hat: 'x.o.x.o.x.o.x.o.' + 'x.o.x.o.x.o.x.o.' + 'x.o.x.o.x.o.x.o.' + 'x.o.x.o.x.xxxxxx',
        bass: '0 - - - - - 0 - - - 0 - 12~ - 7 - 0 - - - - - 0 - - - 0 - 12~ - 7 - 0 - - - - - 0 - - - 0 - 12~ - 7 - 0 - - - - - 0 - 0 - 12~ - 7 - 12 -',
        lead: 'B4 . B4 . G4 . A4 B4 - - . . D5 - B4 -   C5 - - . B4 . A4 . G4 - - - E4 - - .   D5 . D5 . B4 . D5 E5 - - . . G5 - E5 -   F#5 - - . E5 . D5 . A4 - - - - - . .',
      },
      a2: {
        banjo: 'fwd', pad: true,
        kick: 'o.....x...x.....' + 'o.....x...x.....' + 'o.....x...x.....' + 'o...o...o...o.o.',
        clap: '....x.......x...' + '....x.......x...' + '....x.......x...' + '....x.......x.xx', snare: '....o.......o...',
        hat: 'xxo.xxo.xxo.xxo.' + 'x.o.xxo.x.o.xxo.' + 'x.o.x.o.x.o.x.o.' + 'xxxxxxxxxxxxxxxx',
        bass: '0 - - - - - 0 - - - 0 - 12~ - 7 - 0 - - - - - 0 - - - 0 - 12~ - 7 - 0 - - - - - 0 - - - 0 - 12~ - 7 - 0 - - - - - 0 - 0 - 12~ - 7 - 12 -',
        lead: 'B4 . B4 . G4 . A4 B4 - - . . D5 - B4 -   C5 - - . B4 . A4 . G4 - - - E4 - - .   D5 . D5 . B4 . D5 E5 - - . . G5 - E5 -   F#5 - - . E5 . D5 . E5 - - - - - - -',
      },
      b: {   // the breakdown: half-time, pads, big 808
        banjo: 'alt', pad: true,
        kick: 'o...............', clap: '........x.......', hat: '..x...x...x...x.',
        bass: '0 - - - - - - - - - - - - - - -',
        lead: 'E5 - - - - - - - D5 - - - B4 - - -   C5 - - - - - - - B4 - - - G4 - - -   B4 - - - - - - - A4 - - - G4 - - -   F#4 - - - - - - - A4 - - - D5 - - -',
      },
      fin: {   // the trailer's everything-at-once finale
        banjo: 'fwd', pad: true, arp: true,
        kick: 'o...o...o...o...' + 'o...o...o...o...' + 'o...o...o...o...' + 'o...o...o...o.o.',
        clap: '....x.......x...', snare: '....o.......o...',
        hat: 'xxoxxxoxxxoxxxox',
        bass: '0 - - - - - 0 - - - 0 - 12~ - 7 - 0 - - - - - 0 - - - 0 - 12~ - 7 - 0 - - - - - 0 - - - 0 - 12~ - 7 - 0 - - - - - 0 - 0 - 12~ - 7 - 12 -',
        lead: 'B4 . B4 . G4 . A4 B4 - - . . D5 - B4 -   C5 - - . B4 . A4 . G4 - - - E4 - - .   D5 . D5 . B4 . D5 E5 - - . . G5 - E5 -   F#5 - - . E5 . D5 . E5 - - - - - - -',
      },
    },
  },

  // "NIGHT GATORS" — slow swamp blues. Tremolo guitar, rimshots, crickets-in-your-ears energy.
  gators: {
    bpm: 92, swing: .14, bassType: '808', leadType: 'twang', pump: .75,
    chords: [{ r: 40, v: [52, 59, 64, 67] }, { r: 45, v: [57, 60, 64, 69] }, { r: 40, v: [52, 59, 64, 67] }, { r: 47, v: [54, 57, 59, 63] }],   // Em Am Em B7
    order: ['a', 'b', 'a', 'b'],
    sec: {
      a: {
        pad: true,
        kick: 'o.........x.....', rim: '....x.......x...', shaker: '..x.x.x...x.x.x.',
        bass: '0 - - . 7 - - . 12 - - . 10 - 7 -',
        lead: 'B4 - - - . . G4 . A4 - B4 - . . . .   C5 - - - B4 - A4 - E4 - - - . . . .   G4 - - - A4 - B4 - D5 - B4 - . . . .   D#5 - - - - - F#4 - A4 - - - B4 - - -',
      },
      b: {
        pad: true, twangArp: true,
        kick: 'o.........x.....', rim: '....x.......x..x', shaker: '..x...x...x...x.',
        bass: '0 - - . 7 - - . 12 - - . 10 - 7 -',
      },
    },
  },

  // "PULL OVER, DAN" — the chase. Bluegrass punk, four on the floor, a lead that won't stop running.
  chase: {
    bpm: 156, swing: 0, bassType: 'saw', leadType: 'synth', pump: .6,
    chords: [{ r: 40, v: [59, 64, 67, 71] }, { r: 40, v: [59, 64, 67, 71] }, { r: 36, v: [55, 60, 64, 67] }, { r: 47, v: [54, 59, 63, 66] }],   // Em Em C B
    order: ['a', 'a', 'b', 'a'],
    sec: {
      a: {
        banjo: 'fwd',
        kick: 'o...x...o...x...', snare: '....o.......o...', hat: 'x.o.x.o.x.o.x.o.',
        bass: '0 . 0 . 0 . 0 . 0 . 0 . 7 . 12 .',
        lead: 'E5 . G5 . A5 . A#5 B5 - - . . . . . .   B5 . A#5 . A5 . G5 . E5 - - - . . D5 .   E5 . G5 . A5 . A#5 B5 - - . . D6 . B5 .   D#5 - - - F#5 - - - B5 - - - A5 - G5 -',
      },
      b: {
        banjo: 'alt', sirens: true,
        kick: 'o...o...o...o...', snare: '....o.......o.o.', hat: 'xxoxxxoxxxoxxxox',
        bass: '0 . 0 . 12 . 0 . 0 . 0 . 12 . 7 .',
      },
    },
  },

  // "OCEAN DRIVE" — Miami. Synthwave: gated snare, octave bass, arpeggios, a sunset lead.
  ocean: {
    bpm: 108, swing: 0, bassType: 'saw', leadType: 'synth', pump: .3, gated: true, enter: 4, loopAt: 4,
    chords: [{ r: 45, v: [57, 60, 64, 69] }, { r: 41, v: [53, 57, 60, 65] }, { r: 48, v: [55, 60, 64, 67] }, { r: 43, v: [55, 59, 62, 67] }],   // Am F C G
    order: ['intro', 'a', 'b', 'a', 'b'],
    sec: {
      intro: {
        pad: true, arp: true, hat: '..x...x...x...x.',
        bass: '0 . 12 . 0 . 12 . 0 . 12 . 0 . 12 .',
      },
      a: {
        pad: true, arp: true,
        kick: 'o...o...o...o...', snare: '....o.......o...', hat: 'xxoxxxoxxxoxxxox',
        bass: '0 . 12 . 0 . 12 . 0 . 12 . 0 . 12 .',
        lead: 'E5 - - - D5 - C5 - D5 - E5 - - - A4 -   C5 - - - - - A4 - C5 - D5 - C5 - A4 -   G5 - - - E5 - - - D5 - C5 - D5 - E5 -   D5 - - - - - - - B4 - - - G4 - - -',
      },
      b: {
        pad: true, arp: true,
        kick: 'o...o...o...o...', snare: '....o.......o...', clap: '....x.......x...', hat: 'xxoxxxoxxxoxxxox',
        bass: '0 . 12 . 0 . 12 . 0 . 12 . 0 . 12 .',
        lead: 'A5 - - - G5 - E5 - - - C5 - D5 - E5 -   F5 - - - E5 - C5 - - - A4 - C5 - - -   E5 - - - D5 - C5 - G4 - - - C5 - E5 -   D5 - - - - - - - - - - - . . . .',
      },
    },
  },
};
