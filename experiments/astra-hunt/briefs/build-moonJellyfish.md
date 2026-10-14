# Your build: moonJellyfish

You build one sample in this sandbox, `/home/cx/tmp-archive/astra-round/moonJellyfish`, following `GUIDE.md` here. The sandbox holds the SDK (`src/`, `kits/`), its docs (`docs/`, `GUIDE.md`) and the tools (`scripts/`, `harness/`); `samples/` is empty on purpose. This round tests whether a builder can make a strong model from the SDK and its docs alone.

## Subject

Slug `moonJellyfish`. Moon jellyfish (Aurelia aurita), drifting 0.6 m above the floor (it keeps that height). Translucent-looking bell about 30 cm across with the four horseshoe-shaped gonads visible on top, a fringe of many fine marginal tentacles, and four long frilly oral arms trailing below. Rig: bell rim segments that can pulse, each oral arm and tentacle bundle as a tentacle chain.

## Rules

- Work only inside `/home/cx/tmp-archive/astra-round/moonJellyfish`: run every command with that directory as the working directory, write only `samples/moonJellyfish.ts` and throwaway files under `scratch/moonJellyfish/`. Read nothing outside this sandbox except your own output under `~/tmp/public/nilo/agentic-3js-builder/preview/moonJellyfish/` and `~/tmp/public/nilo/agentic-3js-builder/snaps/moonJellyfish/`. Other samples, other checkouts and git history are off limits.
- At most 2 full renders (`npm run snap -- moonJellyfish v01`, then one fix-up `v02`); `preview` and `snap --report-only` are free and the way to check work between renders.
- The headless browser on 127.0.0.1:9333 is shared and already running; never start, stop or restart it.
- No git commands.

## Final reply

GUIDE.md's final reply, then a section "Friction": every place the SDK, its docs or its tools made the work harder (a wrong or missing doc line, a surprising default, a type that fought you, a helper you wished existed, a tool output you couldn't use), one line each with the file or helper it concerns, most costly first.
