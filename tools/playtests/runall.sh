#!/bin/zsh
S=$(cd "$(dirname "$0")" && pwd)
cd ~/Projects/_tools/record-kit
fail=0
run() { local out; out=$(./node/bin/node "$@" 2>&1); if echo "$out" | grep -qE "^(page )?errors: none"; then echo "PASS $*:t"; else echo "FAIL $*"; echo "$out" | tail -8; fail=1; fi }
run $S/court1.mjs; run $S/court1.mjs desktop; run $S/gigs.mjs; run $S/up.mjs; run $S/tb2.mjs; run $S/seq.mjs; run $S/wanda.mjs; run $S/p2.mjs; run $S/dayt.mjs; run $S/dayt2.mjs; run $S/fullrun.mjs mobile
exit $fail
