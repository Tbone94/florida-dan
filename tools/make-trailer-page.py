# Regenerates current/trailer.html (director mode) from current/index.html. Run after changing index.html.
import pathlib
cur = pathlib.Path(__file__).resolve().parent.parent / 'current'
s = (cur / 'index.html').read_text()
import re
s = re.sub(r'(<script src="engine\.js[^"]*"></script>)', r'<script>window.TRAILER = true;</script>\n\1', s, 1)
s = re.sub(r'(<script src="ui\.js([^"]*)"></script>)', r'\1\n<script src="trailer.js\2"></script>\n<script src="trailer-news.js\2"></script>\n<script src="trailer-epic.js\2"></script>\n<script src="trailer-epic-audio.js\2"></script>', s, 1)
s = s.replace('<title>Florida Dan</title>', '<title>Florida Dan — trailer director</title>')
s = s.replace('  @media (prefers-reduced-motion: reduce)', '''  /* director-mode overlays */
  #prompt, #hint, #objective { display: none !important; }
  #banner { transition: none !important; width: min(40em, 70%); }
  #tdim, #tfade { position: absolute; inset: 0; background: #0f0b15; opacity: 0; pointer-events: none; z-index: 5; }
  #tfade { background: #000; z-index: 7; }
  #tcard { position: absolute; inset: 0; z-index: 8; display: grid; place-items: center; align-content: center; gap: .3em; background: #0f0b15; text-align: center; }
  #tcard.black { background: #000; }
  #tcard .big { font-family: var(--display); font-size: 150px; line-height: .95; color: var(--paper); text-shadow: 7px 7px 0 var(--pink); text-transform: uppercase; transform: rotate(-2deg); }
  #tcard .big em { color: var(--yellow); font-style: normal; }
  #tcard.title { background: radial-gradient(ellipse at 50% 40%, #ff5ea8 0%, #ff8a3d 38%, #1a1423 80%); }
  #tcard .logo { font-family: var(--display); font-size: 230px; line-height: .85; text-transform: uppercase; color: var(--yellow); text-shadow: 8px 8px 0 var(--pink), 16px 16px 0 var(--ink); transform: rotate(-3deg); }
  #tcard .logo.sm { font-size: 170px; }
  #tcard .sub { font-family: var(--display); font-size: 64px; color: var(--paper); text-shadow: 4px 4px 0 var(--ink); text-transform: uppercase; margin-top: .4em; }
  #tcard .sub em { color: var(--teal); font-style: normal; }
  #tcard .soon { font-family: var(--display); font-size: 84px; color: var(--paper); text-shadow: 5px 5px 0 var(--ink); margin-top: .35em; letter-spacing: .04em; }
  #tcard .tag { font-family: var(--pixel); font-weight: 700; font-size: 34px; color: var(--yellow); text-shadow: 3px 3px 0 var(--ink); margin-top: .2em; }
  #tcard.miami { background: linear-gradient(180deg, #2a0f3d 0%, #7b2a8c 45%, #ff4fd8 75%, #ffb36b 100%); }
  #tcard.miami .big { text-shadow: 7px 7px 0 #27c6b4, 14px 14px 0 #1a0b24; }
  #tcard.miami .big em { color: #ffd23f; }
  #tcard.raps { background: #1a1423; }
  #tcard .rap { background: var(--paper); color: var(--ink); border: 6px solid var(--ink); box-shadow: 16px 16px 0 var(--red); padding: .5em 1.1em .6em; transform: rotate(-1.5deg); text-align: left; max-width: 80%; }
  #tcard .rh { font-family: var(--pixel); font-weight: 700; font-size: 34px; letter-spacing: .15em; color: var(--red); margin-bottom: .4em; }
  #tcard .rap ol { margin: 0; padding: 0; list-style: none; }
  #tcard .rap li { font-family: var(--display); font-size: 66px; line-height: 1.08; text-transform: uppercase; transform-origin: left center; }
  #tcard .rap li::before { content: '✗ '; color: var(--red); }
  #tcard .url { font-family: var(--pixel); font-weight: 700; font-size: 40px; color: var(--ink); background: var(--paper); border: 4px solid var(--ink); box-shadow: 6px 6px 0 var(--pink); padding: .12em .6em; margin-top: .25em; letter-spacing: .02em; }
  #tcard .stk { position: absolute; top: 50%; font-family: var(--display); font-size: 64px; letter-spacing: .04em; color: var(--ink); background: var(--yellow); border: 5px solid var(--ink); box-shadow: 8px 8px 0 var(--ink); padding: .08em .45em .12em; }
  #tcard .stk.l { left: 11%; transform: translateY(-50%) rotate(-8deg); }
  #tcard .stk.r { right: 11%; transform: translateY(-50%) rotate(7deg); background: var(--teal); }
  #tstack { position: absolute; inset: 0; z-index: 6; }
  .clip { position: absolute; width: 44%; background: var(--paper); color: var(--ink); border: 5px solid var(--ink); box-shadow: 12px 12px 0 var(--red); padding: .35em .6em .5em; font-family: var(--display); font-size: 44px; line-height: 1.02; text-transform: uppercase; }
  .clip small { display: block; font-family: var(--pixel); font-size: 20px; letter-spacing: .2em; color: var(--red); margin-bottom: .2em; }
  @media (prefers-reduced-motion: reduce)''')
s = s.replace('    <div id="talk" hidden>', '    <div id="tdim"></div><div id="tstack" hidden></div><div id="tfade"></div><div id="tcard" hidden></div>\n    <div id="talk" hidden>')
(cur / 'trailer.html').write_text(s)
print('trailer.html regenerated')
