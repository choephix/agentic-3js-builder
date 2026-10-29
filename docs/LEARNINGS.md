# Learnings

What the experiments have settled about getting a good model from a text prompt fast. Each learning is a measured claim, the numbers behind it, the rounds that hold the evidence, and **Looks**: whether Stefan has judged the result by eye. Round details live in `docs/SPEED.md`; this file keeps only the conclusions.

When a round settles something, add it here. When a later round overturns or narrows a learning, rewrite that learning in place and name the round that changed it.

Terms: the **single call** is one model call writing the whole module from the craft v3 system prompt (arm `craft3`). **Parallel parts** is a planning call that splits the subject into parts, then one call per part, all at once (arm `parflat` on the flat-colour prompts). Times are from sending the request to holding working code, repairs included.

## Speed

- **High effort pays off in the plan, not in the parts.** Parallel parts with the planning call at high and the part calls at low: 127 s against 447 s for the single call at high, $0.43 against $0.61, 19 of 20 usable after one repair. Part calls at high bring parallel parts back to 436 s, at $1.80. The planning call takes about 97 s at high and 25 s at low. (r40) **Looks:** not judged yet. Rows on the r40 page, `look/#r40`.
- **Effort sets the time, and time follows thinking.** Sonnet 5.5 single call: low about 25–33 s, medium about 2.5–3 min, high about 8.5 min. (r30, r35) **Looks:** Stefan: high is night and day better than low; medium sits midway, leaning towards high.
- **Less work for the model saves time; telling it to think less doesn't.** Flat colour cuts medium time 37% and thinking 39% (r32flat). Decide-don't-draft, a visible build sheet and samplers in context changed nothing (r26–r32). Halving the ambition target saves about 10 s at low (r41).
- **Working examples cut thinking.** Three finished sample modules from `samples/`, each with the brief it answers, appended to the system prompt and picked to match the subject's body type (a quadruped brief gets wild boar, rhinoceros beetle and hippopotamus): 28 s against 63 s at low, thinking down from about 5.6k to 1.9k tokens. The builds are also smaller (median 78 parts against 103, 3.3k triangles against 4.4k), so part of the time saved is the model building less. Builds don't copy the examples (0.2% shared 8-token runs). Each build costs 3–4× more because the prompt changes per brief and misses the prompt cache; putting the examples after a shared cached prefix is untested. (r44) **Looks:** not judged yet. `look/#r44`.
- **Splitting the work saves time.** Parallel parts halves medium time with about 3× the triangles. Parts don't always fit together (r32par, r33); a box check plus fit repairs pulls them back into place (r42 control).
- **Haiku is cheaper, not faster.** At low it thinks about twice as much as Sonnet and finishes in the same time (61.8 s against 61.6 s), at about a tenth of the price. (r41)
- **A fast, cheap planner saves nothing.** GLM 5.3 Flash wrote the parallel-parts plan at high effort with the same guidance Sonnet gets; Sonnet 5.5 wrote the parts. With low parts: 74 s median against 122 s for a Sonnet plan, but GLM plans took 19–626 s (Sonnet's 56–159 s), so the slow briefs took up to 298 s longer, and the builds came out with two-thirds of the triangles (11.5k against 17.1k). GPT-6.1 Sol parts crashed 8–12 of 19 first renders. (r45) **Looks:** Stefan: slower and uglier; nothing saved.

## First look

- **Something can be on screen in 13–15 s, but nothing yet shown is a good first look.** Base-first (a base call, then the parts written against its code): the base is ready at 13.5 s, final at 34.8 s against 52.9 s for parallel parts with the box check, faster in 24 of 25 pairs, at $0.20 against $0.30. Its parts stray: a median of 14 meshes per build sit more than 15 cm outside their boxes, since base-first has no box repair. The base alone was never rendered, so nobody has seen what the 13.5 s picture looks like (r42). A separate blockout call: 15 s, $0.026, 1–2k triangles of flat boxes and tubes, the same size and placement as the medium build (bounding-box ratio 1.00) but drawn independently of it: colours and pose differ (r43's kraken is teal, its final purple; silhouette overlap 0.57), so the final replaces the blockout instead of refining it. Two-stage before these: first look at 21 s at low, 58 s at medium (r33). **Looks:** not judged yet. `look/#r42`, `look/#r43`.

## Reliability

- **Sonnet crashes are cheap.** One 3–6 s typecheck-gated edit repair at low fixes nearly all of them. (r33, r41)
- **GPT models break this SDK about half the time.** About half of first renders crash (Sonnet: 1–4 of 20); 61 of r37's 106 crashes are one `null` from `chain.tip`. They think little and stream slowly, and flat colour saves them no time. (r35, r37)

## Measuring

- **Compare timings inside one batch only.** The same setup ran up to 2× slower in another batch, and one brief's draws vary up to about 2× on their own (r36). In r41–r44, which ran side by side, the low single call took about 62 s against about 29 s in quieter batches.
- **Looks are Stefan's call, with every setup named.** Model judges and agent impressions are not evidence.
