# Your build: articulatedDeskLamp

You build one sample in this sandbox, `/home/cx/tmp-archive/astra-round/articulatedDeskLamp`, following `GUIDE.md` here. The sandbox holds the SDK (`src/`, `kits/`), its docs (`docs/`, `GUIDE.md`) and the tools (`scripts/`, `harness/`); `samples/` is empty on purpose. This round tests whether a builder can make a strong model from the SDK and its docs alone.

## Subject

Slug `articulatedDeskLamp`. Spring-balanced articulated desk lamp (an Anglepoise-style lamp), real size, standing on its weighted base on the floor (treat the floor as the desk top). Base, turntable, two arm sections with the visible tension springs and their links, a conical shade with a bulb inside that glows, cable running along the arms to the base. Rig: a mechanical skeleton with hinge joints at base swivel, lower arm, elbow, and shade tilt, so the lamp can be posed like a puppet.

## Rules

- Work only inside `/home/cx/tmp-archive/astra-round/articulatedDeskLamp`: run every command with that directory as the working directory, write only `samples/articulatedDeskLamp.ts` and throwaway files under `scratch/articulatedDeskLamp/`. Read nothing outside this sandbox except your own output under `~/tmp/public/nilo/agentic-3js-builder/preview/articulatedDeskLamp/` and `~/tmp/public/nilo/agentic-3js-builder/snaps/articulatedDeskLamp/`. Other samples, other checkouts and git history are off limits.
- At most 2 full renders (`npm run snap -- articulatedDeskLamp v01`, then one fix-up `v02`); `preview` and `snap --report-only` are free and the way to check work between renders.
- The headless browser on 127.0.0.1:9333 is shared and already running; never start, stop or restart it.
- No git commands.

## Final reply

GUIDE.md's final reply, then a section "Friction": every place the SDK, its docs or its tools made the work harder (a wrong or missing doc line, a surprising default, a type that fought you, a helper you wished existed, a tool output you couldn't use), one line each with the file or helper it concerns, most costly first.
