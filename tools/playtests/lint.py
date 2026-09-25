#!/usr/bin/env python3
# Catches the bug that bit us 3 times: code swallowed by a trailing // comment (whistle, Lambo sink, a talk ending),
# plus plain syntax errors (node --check). Prose comments that merely look like code go in ALLOW as file:first-words.
import re, pathlib, subprocess, sys
cur = pathlib.Path(__file__).resolve().parent.parent.parent / 'current'
ALLOW = ('// FLORIDA DAN', '// walk someone to', 'let VW = 320;', '// Trash Baby: face him', '// label() lives', '// gfx-only shots', "// tips wait out", '// chapter: {', '// a real sneak along', '// phone calls play as one')
bad = 0
for f in sorted(cur.glob('*.js')) + sorted(cur.parent.glob('tools/playtests/*.mjs')):   # the tests too: a // comment ate half a test line once
    r = subprocess.run(['node', '--check', str(f)], capture_output=True, text=True)
    if r.returncode: print('SYNTAX', f.name, r.stderr.strip().split('\n')[-1]); bad = 1
    for i, line in enumerate(f.read_text().split('\n'), 1):
        code = re.sub(r"'(\\.|[^'\\])*'|\"(\\.|[^\"\\])*\"|`(\\.|[^`\\])*`", "''", line)
        j = code.find('//')
        if j < 0 or any(a in line for a in ALLOW): continue
        if re.search(r"[A-Za-z_]\w*(\.\w+)+\s*(=|\+=|-=)\s*[^=]|\)\s*;|\bif \(|\breturn\b.*;", code[j + 2:]):
            print(f'SWALLOWED? {f.name}:{i}: {line.strip()[-140:]}'); bad = 1
# all the game's scripts share one global scope: two files declaring the same const/let breaks the second one at load
# (bit us: SURF, takeFish). Glue them together in index.html order and let node find the clash.
import tempfile
order = re.findall(r'<script src="([a-z0-9-]+\.js)', (cur / 'index.html').read_text())
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as t: t.write('\n'.join((cur / f).read_text().replace("'use strict';", '') for f in order)); tmp = t.name
r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
if r.returncode: print('CLASH across scripts:', [l for l in r.stderr.split('\n') if 'Error' in l][:1]); bad = 1
print('errors: none' if not bad else 'errors: see above'); sys.exit(bad)
