#!/usr/bin/env python3
# Catches the bug that bit us 3 times: code swallowed by a trailing // comment (whistle, Lambo sink, a talk ending),
# plus plain syntax errors (node --check). Prose comments that merely look like code go in ALLOW as file:first-words.
import re, pathlib, subprocess, sys
cur = pathlib.Path(__file__).resolve().parent.parent.parent / 'current'
ALLOW = ('// FLORIDA DAN', '// walk someone to', 'let VW = 320;', '// Trash Baby: face him', '// label() lives', '// gfx-only shots', "// tips wait out", '// chapter: {')
bad = 0
for f in sorted(cur.glob('*.js')):
    r = subprocess.run(['node', '--check', str(f)], capture_output=True, text=True)
    if r.returncode: print('SYNTAX', f.name, r.stderr.strip().split('\n')[-1]); bad = 1
    for i, line in enumerate(f.read_text().split('\n'), 1):
        code = re.sub(r"'(\\.|[^'\\])*'|\"(\\.|[^\"\\])*\"|`(\\.|[^`\\])*`", "''", line)
        j = code.find('//')
        if j < 0 or any(a in line for a in ALLOW): continue
        if re.search(r"[A-Za-z_]\w*(\.\w+)+\s*(=|\+=|-=)\s*[^=]|\)\s*;|\bif \(|\breturn\b.*;", code[j + 2:]):
            print(f'SWALLOWED? {f.name}:{i}: {line.strip()[-140:]}'); bad = 1
print('errors: none' if not bad else 'errors: see above'); sys.exit(bad)
