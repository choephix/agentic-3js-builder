#!/usr/bin/env bash
# r36: craft3 reruns of 5 r35 briefs, strictly one request at a time, to compare per-request timing with the parallel r35 runs.
# usage: bakeoff/r36_serial.sh s|t   (s = Sonnet 5.5, t = GPT-6.1 Terra); analysis: bakeoff/r36_compare.py
set -u
cd /home/cx/noodlespace/agentic-3js-builder
mkdir -p scratch/r36/logs
P=${1:-s}
if [ "$P" = t ]; then S=openai-codex/gpt-6.1-terra; else S=anthropic/claude-sonnet-5-5; fi
SUBJ=axolotl,gunblade,calderMobile,alebrije,gargoyle
COMMON="--arm-set arms-r33two.json --pitches pitches-r24.json --levels rich --subjects $SUBJ --max-tokens 120000 --arms craft3 --model $S --concurrency 1"
L=scratch/r36/logs
npx tsx scripts/twostage.ts warm --arm-set arms-r33two.json --model $S >$L/warm$P.log 2>&1
for rep in 1 2 3; do
  for e in low medium; do
    r=r36$P${e:0:1}$rep
    echo "$(date +%T) start $r" >>$L/serial$P.log
    npx tsx scripts/bakeoff.ts run $r $COMMON --effort $e >$L/$r.log 2>&1
    echo "$(date +%T) done $r" >>$L/serial$P.log
  done
done
echo "$(date +%T) all done" >>$L/serial$P.log
