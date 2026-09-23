# Stamps every local <script src> in index.html (and the trailer page) with ?v=<build> so a push
# always loads as one matched set instead of a mix of cached old + new files. Run before each push.
import pathlib, re, time
cur = pathlib.Path(__file__).resolve().parent.parent / 'current'
build = time.strftime('%Y%m%d%H%M')
for name in ['index.html', 'trailer.html']:
    p = cur / name
    if not p.exists(): continue
    s = re.sub(r'<script src="([a-z0-9-]+\.js)(\?v=[0-9]+)?"', lambda m: f'<script src="{m.group(1)}?v={build}"', p.read_text())
    p.write_text(s)
print('build', build)
