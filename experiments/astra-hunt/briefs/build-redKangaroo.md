# Your build: redKangaroo

You build one sample in this sandbox, `/home/cx/tmp-archive/astra-round/redKangaroo`, following `GUIDE.md` here. The sandbox holds the SDK (`src/`, `kits/`), its docs (`docs/`, `GUIDE.md`) and the tools (`scripts/`, `harness/`); `samples/` is empty on purpose. This round tests whether a builder can make a strong model from the SDK and its docs alone.

## Subject

Slug `redKangaroo`. Red kangaroo buck, real size (about 1.6 m standing tall), upright on its long hind feet with the thick tail resting on the floor as the third support, short forearms held forward, big upright ears, and a joey peeking out of the pouch. Rig: spine, neck, head, jaw, ears, arms with digits, legs with the long hind feet, tail chain; the joey gets its own head and jaw joints.

## Rules

- Work only inside `/home/cx/tmp-archive/astra-round/redKangaroo`: run every command with that directory as the working directory, write only `samples/redKangaroo.ts` and throwaway files under `scratch/redKangaroo/`. Read nothing outside this sandbox except your own output under `~/tmp/public/nilo/agentic-3js-builder/preview/redKangaroo/` and `~/tmp/public/nilo/agentic-3js-builder/snaps/redKangaroo/`. Other samples, other checkouts and git history are off limits.
- At most 2 full renders (`npm run snap -- redKangaroo v01`, then one fix-up `v02`); `preview` and `snap --report-only` are free and the way to check work between renders.
- The headless browser on 127.0.0.1:9333 is shared and already running; never start, stop or restart it.
- No git commands.

## Final reply

GUIDE.md's final reply, then a section "Friction": every place the SDK, its docs or its tools made the work harder (a wrong or missing doc line, a surprising default, a type that fought you, a helper you wished existed, a tool output you couldn't use), one line each with the file or helper it concerns, most costly first.
