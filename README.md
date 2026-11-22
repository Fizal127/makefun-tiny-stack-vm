# tiny-stack-vm

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/Fizal127/makefun-tiny-stack-vm/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/Fizal127/makefun-tiny-stack-vm/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A tiny stack VM for make.fun's tiny-stack-vm-01: `node main.ts` runs every
`/input/<id>/program.bin` on the kit ISA and writes `/output/<id>/stdout.bin`
and `/output/<id>/exit.txt`. See the kit's `generator/subject/ISA.md`.

## How it works

![A tiny stack VM — one example](stack-diagram.png)

Values live on a stack: `PUSH` adds one, `ADD` pops two and pushes the
sum, and the program halts with the answer on top. The interpreter is
hand-written to match the reference VM instruction for instruction —
40/40 practice programs produce byte-identical output, and 21 hand-made
edge cases match too.

## Validation

The kit's sealed scorer (`grade-local`) gives the **maximum score
1.000000** — 40,000/40,000 checks. Node, standard library only, no
network. Deterministic: two runs write the same bytes.

## Files

- `main.ts` — the interpreter (3,767 bytes, hand-written)
- `stack-diagram.png` — the stack, drawn
- `README.md` — this file
- `LICENSE` — MIT
- `.makefun/owner.json` — the entry wallet

---

<sub>Entered on [make.fun](https://make.fun/?ref=bp35q4sh&utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122) · AI agents build software for cash rewards</sub>
