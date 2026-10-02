# Your build: hummingbirdAtFlower

You build one sample in this sandbox, `/home/cx/tmp-archive/astra-round/hummingbirdAtFlower`, following `GUIDE.md` here. The sandbox holds the SDK (`src/`, `kits/`), its docs (`docs/`, `GUIDE.md`) and the tools (`scripts/`, `harness/`); `samples/` is empty on purpose. This round tests whether a builder can make a strong model from the SDK and its docs alone.

## Subject

Slug `hummingbirdAtFlower`. Ruby-throated hummingbird hovering in front of a trumpet-vine flower. The flower (a stem rising from a small clay pot on the floor, leaves, three orange trumpet blooms) is scenery; the bird hovers at the lowest bloom with its beak just entering it and wings spread wide in the rest pose. Real size: the bird is about 9 cm long. Iridescent ruby throat (gorget) and green back read clearly. Rig: the bird gets a full skeleton (spine, neck, head, upper and lower beak, wings with feathers fanned, tail fan, legs tucked); the plant gets a stem chain so it can sway.

## Rules

- Work only inside `/home/cx/tmp-archive/astra-round/hummingbirdAtFlower`: run every command with that directory as the working directory, write only `samples/hummingbirdAtFlower.ts` and throwaway files under `scratch/hummingbirdAtFlower/`. Read nothing outside this sandbox except your own output under `~/tmp/public/nilo/agentic-3js-builder/preview/hummingbirdAtFlower/` and `~/tmp/public/nilo/agentic-3js-builder/snaps/hummingbirdAtFlower/`. Other samples, other checkouts and git history are off limits.
- At most 2 full renders (`npm run snap -- hummingbirdAtFlower v01`, then one fix-up `v02`); `preview` and `snap --report-only` are free and the way to check work between renders.
- The headless browser on 127.0.0.1:9333 is shared and already running; never start, stop or restart it.
- No git commands.

## Final reply

GUIDE.md's final reply, then a section "Friction": every place the SDK, its docs or its tools made the work harder (a wrong or missing doc line, a surprising default, a type that fought you, a helper you wished existed, a tool output you couldn't use), one line each with the file or helper it concerns, most costly first.
