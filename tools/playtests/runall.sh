#!/bin/zsh
S=$(cd "$(dirname "$0")" && pwd)
python3 $S/lint.py >/dev/null && echo "PASS lint" || { echo "FAIL lint"; python3 $S/lint.py; exit 1; }
cd ~/Projects/_tools/record-kit
fail=0
run() { local out; out=$(./node/bin/node "$@" 2>&1); if echo "$out" | grep -qE "^(page )?errors: none"; then echo "PASS $*:t"; else echo "FAIL $*"; echo "$out" | tail -8; fail=1; fi }
run $S/court1.mjs; run $S/court1.mjs desktop; run $S/gigs.mjs; run $S/up.mjs; run $S/tb2.mjs; run $S/seq.mjs; run $S/wanda.mjs; run $S/p2.mjs; run $S/dayt.mjs; run $S/dayt2.mjs; run $S/fixes.mjs; run $S/lambo.mjs; run $S/phone.mjs; run $S/phone.mjs mobile; run $S/flam.mjs; run $S/fixes2.mjs; run $S/arcs.mjs; run $S/scenes.mjs /tmp/fd-scenes; run $S/fullrun.mjs mobile; run $S/fullrun.mjs
exit $fail
