# Conversation handoff: slow mammoth loading and beautiful progressive construction

This follows the conversation in the order it happened. Stefan’s questions have been lightly cleaned up for readability. The assistant’s answers are kept close to their original wording, with unnecessary repetition removed. Tool activity and the two research outputs are explained in plain language rather than pasted as raw commands or logs.

This is a record of the investigation and design discussion, not an implementation plan that Stefan has approved. The performance measurements describe the code and public deployment examined during the investigation. They should not be treated as a claim about any changes made independently afterward.

## 1. Recovering the public link

**Stefan:** What was the public link?

**Assistant:** The public showcase for this project is:

https://agentic-3d-builder-sdk-showcase.netlify.app/

It is hosted on Netlify. It was deployed in the 29 September session, and that was the link given most often there. The `/bakeoff` and `/lab` pages are under the same address.

Another public link appeared in this project’s sessions from 2 October:

https://nilo-creature-lab.netlify.app

That is the older Nilo Creature Lab site that this project grew out of, not this showcase. At the time of this first answer, neither site had been checked for availability. The mammoth investigation below subsequently exercised the SDK showcase.

**How the link was found:** The assistant searched previous local session logs for public URLs. This was link recovery, not a live-site verification.

## 2. Stefan reports slow loads and browser crashes

**Stefan:**

https://agentic-3d-builder-sdk-showcase.netlify.app/#pixelMammoth?panel=textures

Some pages, like the mammoth here, take a long time to open and about half the time crash my browser. Can you find out why?

**Assistant’s initial response:** I’m checking the model-building work and the Textures panel separately. The panel makes full-resolution copies of every texture, even for thumbnails; I’ll measure whether that or the mammoth itself is causing the slowdown.

That was an initial hypothesis, not the final diagnosis. The investigation found that the texture panel was not the main cause of the mammoth’s delay.

### What the assistant examined and which tools were used

The project is `agentic-3js-builder`, a TypeScript SDK for building skeleton-rigged three.js creatures, with sample modules and a Vite showcase. The main checkout used in the investigation was `/home/cx/noodlespace/agentic-3js-builder`.

The assistant read the project status and used the code-search tools to locate the mammoth, the showcase’s loading path, the texture panel, and the SDK’s construction and painting code. In plain language:

- The **Find tool** searched by behaviour, such as “where does the sample load?” or “where is paint baked?” It identified relevant files and sections.
- The **Read tool** opened those sections and the public site’s entry page and thumbnail index.
- The **Grep tool** found known names and literal references, such as `pixelMammoth`, `scatter`, texture readiness, and resource disposal.
- The **shell tool** started a local Vite showcase and a real headless Chromium browser. It also checked that the NVIDIA GPU was available.
- The **Eval tool** ran temporary Node diagnostics against the actual mammoth sample. These measured individual operations and tried an in-memory change without editing the SDK’s files.
- Two **background research agents** investigated independent parts of the problem: one read the sampling algorithm; the other profiled the actual public page in Chromium.

The originally documented GPU-browser launcher path was missing. The assistant found the launcher at `~/.omp/profiles/nilo/agent/skills/nilo-live-qa/chrome-nvidia.sh`, started Chromium on port 9333, and verified that WebGL was using the NVIDIA GeForce RTX 3060 rather than a software renderer. The local diagnostic showcase ran on `http://127.0.0.1:5193/`.

The key source files were:

- `samples/pixelMammoth.ts`: the mammoth’s actual construction function.
- `showcase/main.ts`: imports a sample, calls its construction function, and hands the finished object to the viewer.
- `showcase/viewer.ts`: stages, renders, and disposes the shown object.
- `showcase/textures.ts`: draws texture thumbnails and larger texture previews.
- `src/surface.ts`: surface sampling and fur-placement queries.
- `src/frame.ts` and `src/context.ts`: live positions and bone-transform calculations.
- `src/cards.ts`: batches fur cards into meshes.
- `src/builder.ts`, `src/bake.ts`, and `src/texture.ts`: finalization, procedural paint baking, and SVG textures.

### Research output one: reading the sampling algorithm

The source-reading agent found that `Surface.scatter(count)` tries to place random points on an existing surface. It rejects candidates that are too close to accepted points, fail a user-provided filter, or are buried inside another part of the surface.

The relevant source behaviour was:

- Sampling is area-weighted, so larger triangles receive proportionally more candidates.
- Work is capped at **60 times the requested count**. For the mammoth’s request for 2,600 body-fur placements, that permits 156,000 candidate attempts.
- To enforce minimum spacing, each candidate is checked against previously accepted hits with a linear scan.
- The minimum-distance checks happen before the caller’s filter, so that filter does not reduce the work already spent checking distances.
- Candidates that reach the buried-point check cause a ray-intersection scan through the surface’s triangles.
- The surface caches its triangle data while the pose is unchanged, but it does not cache the result of every buried-point query.
- Candidate generation and hit construction allocate temporary vectors and other objects.

The agent identified the mammoth’s body request in `samples/pixelMammoth.ts:498-502`: `scatter(2600)` with a minimum distance of 0.1 metres and a filter. The head also requests 520 points with a minimum distance of 0.12 metres, and the sample has several smaller scatters for legs, snow, and other details.

The source locations supporting those findings were:

- `src/surface.ts:107-143`: refreshing and caching surface triangles.
- `src/surface.ts:147-168`: creating triangles and hits.
- `src/surface.ts:170-197`: scanning triangles for ray intersections.
- `src/surface.ts:448-489`: buried-point rejection and the sampling loop.

At this stage, these were algorithmic facts and likely hot spots, not measured causes of the browser crash. The agent recommended looking at a spatial index for minimum-distance checks and possibly accelerating ray queries. Those were recommendations, not implemented changes.

### Local measurements isolate the real hot spot

A temporary Node run called the mammoth’s real build function and counted the resulting objects. It measured approximately:

- **13,353 milliseconds** to construct the mammoth.
- **116 meshes** and **17,988 triangles**.
- One **1024 × 924** procedural paint texture and seven very small SVG textures.

A second temporary diagnostic measured each `scatter()` call individually:

- The total build took **13,241 milliseconds**.
- All scatter calls together took about **12,251 milliseconds**.
- Body-fur sampling alone took **11,471 milliseconds**.
- That body call requested **2,600** placements but accepted only **1,206**.
- It sampled a surface with only **176 triangles**.
- The other individual scatter calls were much smaller; the next-largest ones took around 150 milliseconds.

The crucial discovery was that a hit’s position is not a simple stored vector. Reading `Spot.at` recalculates its current position from its captured bone transforms. The minimum-distance loop repeatedly read that live position for every existing placement.

The relevant chain in the code was:

- `src/surface.ts:481`: compare each accepted hit’s position with the candidate.
- `src/frame.ts:94-96`: `Spot.at` clones the stored position and applies a blended bone transform.
- `src/context.ts:94-110`: `Capture.motion` clones and multiplies matrices; `Capture.blend` combines the transforms.

A diagnostic then compared the original behaviour with an in-memory change that reused positions only during each synchronous scatter call. No SDK source file was edited for this experiment.

| Local construction run | Time | Position reads during scatter | Actual position-transform calculations |
| --- | ---: | ---: | ---: |
| Original | 13.8 seconds | 78,618,285 | 78,618,285 |
| Diagnostic with per-scatter position reuse | 2.4 seconds | 78,618,285 | 46,099 |

The finished geometry attributes, geometry indices, and procedural paint pixels had the same checksum in both runs. This demonstrated identical geometry and paint data for this mammoth experiment. It was not a permanent fix or a proof covering every possible sample or callback.

**Assistant’s interim explanation:** The main bottleneck is the fur-placement algorithm, not large textures. The mammoth took about 13 seconds to build here, with 11.5 seconds spent placing body fur. That loop repeatedly recalculates bone transforms for distance checks—about 79 million position reads across the sample.

An in-memory diagnostic that reused those positions cut construction from 13.8 to 2.4 seconds, with identical geometry and paint data. I haven’t changed the source or deployed anything; the browser profile is checking the live site and crash-related evidence.

### Research output two: profiling the actual public page

The browser agent used a real Chromium browser connected to the shared NVIDIA browser. It recorded CPU profiles, long-running browser tasks, requests, texture-canvas dimensions, errors, and screenshots. It compared opening the mammoth with Textures selected against opening it with Info selected.

The browser showed the creature and its texture panel correctly. It reported 116 parts, about 18,000 triangles, and eight textures.

| Public-page measurement | Textures panel | Info panel |
| --- | ---: | ---: |
| Build time reported by the page | 11,038 milliseconds | 10,912 milliseconds |
| Longest uninterrupted main-thread task | 11,129 milliseconds | 10,968 milliseconds |
| Observed WebGL context losses | 0 | 0 |

The CPU profile confirmed that most of the delay was in the same sampling and live-position calculations found in the source. The measured nested call chain was approximately:

- `scatter`: 9.58 seconds.
- Its minimum-distance predicate: 9.37 seconds.
- Reading the live position: 8.77 seconds.
- Blending bone transforms: 8.17 seconds.
- Calculating individual bone motion: 3.98 seconds.

These times are nested, so they must not be added together. Matrix blending and multiplication dominated. Garbage collection contributed roughly 457 milliseconds. A local profile with readable function names confirmed the same `Spot.at` → `Capture.blend` → `Capture.motion` chain and identified secondary paint-bake dilation work around one second.

The public-page evidence also established:

- WebGL used the **RTX 3060**, not a software renderer.
- The mammoth’s own module was about **4.6 KB** and took about **158 milliseconds** to fetch in the Textures run. Downloading that module was not the eleven-second delay.
- The page made **266 HTTP requests**, transferring about **2.58 MB** in that run. Separately, it generated 551 data-URL events; those are not additional network downloads.
- There were **185 HTTP script requests**, including unrelated sample modules. Eagerly importing the catalog to obtain names was a secondary inefficiency.
- The Textures panel used **11 canvases**, with about **15.55 MB** of raw RGBA pixel capacity, or 14.83 MiB. This included three paint-sized canvases, an atlas overlay, and seven tiny SVG thumbnails.
- There was no observed continuous idle rendering storm. Captured drawing calls were concentrated after construction.
- There were no observed public-page errors, failed requests, console warnings/errors, or WebGL context losses.
- Two bounded local Info↔Textures cycles showed the panel’s canvases returning consistently between zero and eleven, without rebuilding the creature. That is not proof of either a memory leak or the absence of one.

The browser exposed differing memory measurements: its CDP heap measurement was about 15.6 MB for Textures and 21.2 MB for Info, while `performance.memory` reported about 169.8 MB and 179.9 MB respectively. Neither should be presented as total browser RAM or evidence of a particular crash mechanism.

The browser agent did not observe a crash and did not intentionally stress the page until it crashed. The user’s reported crashes remain real observations; this investigation did not establish whether they involved memory exhaustion, GPU-driver problems, or browser termination of an unresponsive page.

### Evidence and cleanup

Session-local evidence included the public screenshots, raw profiles, network measurements, and consolidated findings. The most useful entries were:

- `local://live-profile-findings.md`
- `local://final-evidence.json`
- `local://public-textures.png`
- `local://public-{textures,info}-{profile,summary,snapshot,network}.json`

Those `local://` links refer to the investigation session’s scratch space, not public web links. Its physical directory was:

`/home/cx/.omp/agent/sessions/-noodlespace-agentic-3js-builder/2026-10-13T08-57-42-432Z_01a1347b-5d20-7042-a79a-0e6f0609a126/local/`

The diagnostic Vite server and GPU browser were stopped, and their temporary browser profile was removed. The investigation itself made no permanent SDK source change and no deployment.

### Assistant’s conclusion to Stefan

**Yes—the mammoth has a confirmed CPU bottleneck that freezes the page for about 11 seconds.** It happens with either Info or Textures open, so the texture panel isn’t the main cause.

The showcase rebuilds the creature in your browser whenever you open it. The mammoth requests 2,600 body-fur placements, but its spacing rules only allow about 1,206. The placement algorithm keeps trying until its attempt limit.

Each attempt checks distances against existing placements. Those checks unnecessarily recalculate the placements’ bone transforms—about 79 million position reads across the build.

The live browser profile confirmed that this loop dominates the delay. It runs synchronously on the browser’s UI thread, so the page cannot respond while it’s working.

**It can be fixed without reducing the mammoth’s detail.** The diagnostic reuse of positions produced identical geometry and paint data for this sample. The scoped remedy proposed was in `Surface.scatter()` (`src/surface.ts`): reuse positions during a scatter operation and use a spatial grid for nearby-point checks instead of scanning every existing placement.

**The slowdown is proven; the actual crash mechanism isn’t yet identified.** The long unresponsive task explains the freezing, but doesn’t establish whether Stefan’s crashes are memory-related, GPU-related, or browser termination.

There is also a secondary inefficiency: the showcase downloads unrelated sample modules just to populate names.

No source changes or deployment had been made by this investigation. The recommendation was to fix the shared placement algorithm first; it should also help other fur-heavy samples.

## 3. Stefan asks about visibly building the creature over time

**Stefan:** Explore the possibility of showing these objects being generated in the browser in real time, so the user can watch them build up visually. Should we make the whole thing asynchronous and add arbitrary little millisecond sleeps between functions, or how might that work?

What happens to texture generation? Can that happen after the 3D gets built, or the other way around? What are our options? I haven’t actually seen the functions, so I don’t know what can be done with them.

**Additional source reading:** The assistant read the builder’s finalization interface, the SVG rasterization code, the paint-sheet packing and baking code, card batching and tinting, the sample-loading path, and the viewer’s staging and cleanup behaviour. It also read the model-facing API and conventions. This was code inspection for a design discussion, not a new implementation or runtime demonstration of progressive construction.

### Assistant’s answer: distinguish responsiveness from presentation

**Yes—we can make the creature visibly assemble while it’s being generated. But I would separate “keeping the browser responsive” from “making the construction interesting to watch.”** Arbitrary sleeps mix those two concerns and don’t solve a long-running function.

I read the builder and texture code. Here’s what it allows.

### What happens today

The sample is one synchronous function. Calls such as `b.sweep()`, `b.extrude()` and `b.cards()` create geometry immediately and return handles that later calls use.

The scene already exists inside the builder during construction, but the showcase only displays it after the sample returns.

There is also a hidden finishing step: reading `b.root` bakes the procedural paints into a texture sheet. It isn’t just retrieving the scene.

So progressive construction is feasible, but the current build-and-display contract needs to expose an unfinished scene separately from finishing it.

### Async: where it would help

**I wouldn’t make every builder function asynchronous.** That would force `await` throughout all samples, including cheap operations that don’t need it.

Instead:

- Keep ordinary geometry helpers synchronous.
- Add an asynchronous build driver with explicit construction checkpoints.
- Make expensive operations resumable internally, so they can yield partway through their work.

For example, the mammoth could have checkpoints for body → legs → head and tusks → coat → snow → finished paint. Those are illustrative stages, not an existing API.

The important distinction:

> A pause after `scatter()` cannot keep the browser responsive while `scatter()` itself is running.

That operation needs to process candidates in chunks. Likewise, a large paint bake needs to yield inside its pixel-processing loops.

For responsiveness, a reasonable starting point is roughly 4–8 milliseconds of work, then give control back to the browser. That is a tunable work budget, not a compulsory delay after every function.

Also, merely adding `async`, or using `await Promise.resolve()`, doesn’t give the browser a reliable opportunity to paint. We need an actual browser-task yield, such as `scheduler.yield()` with a fallback.

### Our options for the visual build-up

| Approach | What the user would see | Tradeoff |
| --- | --- | --- |
| Live construction at checkpoints | Actual parts appear as construction reaches each stage | Simple authoring; expensive functions still need internal chunking |
| Live construction with streamed batches | Fur, scales or other repeated details accumulate gradually | More work inside those helpers; smoothest genuine build-up |
| Build off the UI thread in a worker | Parts appear as the worker sends completed geometry batches | Keeps the page responsive, but requires transferring geometry and reconstructing the render scene |
| Build first, then animate a reveal | An attractive assembly sequence using finished geometry | Easiest visual effect, but it does not eliminate the initial build stall |

**My recommendation is live checkpoints first, with chunking for genuinely expensive helpers.** An optional “watch it build” mode can deliberately slow the presentation; normal loading should run as fast as possible.

One detail matters for the mammoth: `b.cards()` currently batches many fur cards into a few meshes, rather than creating one mesh per hair tuft. To show fur growing gradually, we should stream or reveal portions of those batches—not create thousands of separate meshes.

### Textures: before or after geometry?

There are several different mechanisms, and they have different dependencies:

| Mechanism | Current behaviour | Possible staging |
| --- | --- | --- |
| Flat colours | Assigned when a mesh is created | Available immediately |
| Procedural paints | Geometry is prepared first; `b.root` packs and paints the shared texture sheet | Show unpainted geometry first, then apply the completed paint sheet |
| SVG textures | `svg()` returns a texture immediately and starts asynchronous image decoding/rasterisation | Start these early, while geometry is being built |
| Paint-tinted cards | The paint is sampled once at each card’s root to produce vertex colours | Colours arrive with card geometry; they don’t wait for the shared paint sheet |

### Procedural paint is naturally geometry-first

A paint is a function of the surface’s position and normal. The bake needs the actual geometry, and the shared texture layout depends on all the painted parts.

We can define the paint functions beforehand, but we cannot produce the final geometry-specific sheet beforehand.

The straightforward sequence is:

1. Show the geometry with a temporary solid material.
2. Finish the geometry and calculate the final texture layout.
3. Bake the paint in chunks.
4. Apply the finished texture.

We could also visibly fill the texture sheet tile by tile once its layout is fixed. That is possible, but more complicated than switching to the finished sheet.

**We should not repeatedly read `b.root` to show progress:** adding painted parts causes the whole sheet to be repacked and rebaked.

### SVGs can start early

SVG drawings are largely independent of the creature’s geometry. The mammoth already creates its fur drawings near the beginning of its build.

There is one visual catch: the texture’s transparency defines the shape of the fur, leaves or feathers. Before an SVG is ready, its cards can be invisible; showing them without their texture would show rectangles. I would prepare those small textures early and display the cards when their drawings are ready.

### The design I would choose

**A small build-progress interface around the existing builder—not sleeps scattered through every sample.**

It would expose the unfinished scene, let samples identify meaningful stages, and let expensive helpers yield internally. The viewer would attach that scene once and refresh it as it grows, rather than repeatedly replacing it—the current replacement path disposes the previous scene’s resources.

Then the visual sequence can be: structure and body first, textured details as they become ready, final surface paint last. Optional presentation pacing stays separate from computation.

That gives us genuine, understandable construction to watch without turning the SDK into an `await`-everywhere API.

## 4. Stefan considers a mirrored asynchronous SDK and clarifies the priority

**Stefan:** If much of this change needs to live in the SDK, and I want to keep things clean, should we build a mirror of the entire SDK that is asynchronous instead of synchronous? Or is it clean enough to make the SDK asynchronous from the start and have the pauses multiplied by zero by default?

I want to keep something close to the current functionality, but also have a very beautiful version where the object gets built visually in front of the user—including the geometry getting created and textures getting drawn.

Part of the point is preventing the page from freezing as the model loads, but the priority is making it visually beautiful, even if we need to change things around to overlap some animations. That is how I imagine it, and I want to keep talking about it.

This clarified an important priority: Stefan is not asking only for a faster loader or a progress indicator. He wants an attractive, watchable construction experience, while preserving something close to the current SDK’s functionality.

### Assistant’s answer: one construction implementation, separate presentation

**I wouldn’t mirror the SDK, and I wouldn’t make everything asynchronous with “delay × 0.” I’d keep one construction implementation, with a separate system for presenting the construction beautifully.**

Your priority changes the design: this is not merely a loading indicator. It’s a watchable assembly sequence that also keeps the page responsive.

### Why neither of those approaches is ideal

A mirrored SDK would mean maintaining two versions of geometry generation, painting, skinning and placement. Fixes could diverge, and we would have to prove both produce the same creature.

Async everywhere with zero delays avoids duplication, but changes every function’s contract: callers receive promises rather than usable parts. Zero delays don’t restore synchronous behaviour, and they don’t automatically prevent freezing—a single expensive loop can still block.

The useful distinction is not “synchronous SDK versus asynchronous SDK.” It is:

- Construction: what geometry and texture data must be computed?
- Scheduling: when does computation yield to the browser?
- Presentation: when and how does the user see the results?

Those should cooperate without becoming the same thing.

### One SDK, two ways to run expensive work

For computations that genuinely need interruption—fur placement and texture baking, for example—we can implement the work as resumable chunks.

The existing synchronous path runs those chunks straight through. A progressive path runs the same computation, yielding between chunks and reporting completed batches.

Cheap operations, such as creating one joint or one small primitive, stay synchronous.

That preserves the current functionality without duplicating the algorithms. It does require deliberate changes to the expensive helpers; an outside wrapper cannot interrupt their existing loops.

There is also no transparent switch that makes an existing synchronous sample yield halfway through. Samples intended for genuine progressive construction would need explicit stages, or another resumable authoring format. I would favour a few meaningful stages over hundreds of `await`s.

### Beauty needs its own timeline

**The construction order is not necessarily the most attractive reveal order.**

For example:

- The skeleton must exist before some geometry, but we may not want to show it.
- A whole batch of fur might finish at once, but we may want it to spread across the body.
- Texture pixels might be computed in atlas order, while the attractive effect is colour flowing over the creature’s surface.
- Several completed parts could animate into place together rather than arriving one after another.

So I’d give the viewer a presentation timeline that consumes completed construction batches.

Computation runs ahead whenever it can. The timeline decides how to reveal what is ready. That lets us overlap body assembly, fur reveal and surface painting without pretending every animation frame corresponds to a builder function.

A small amount of buffering is useful: insisting that the animation show the exact instant each calculation finishes would make its pacing depend on the user’s hardware.

### What the visual effects could actually do

There are two levels of “watching it build.”

**Literal construction:**

- Completed geometry batches enter the scene.
- Fur cards appear as batches become available.
- Finished texture regions become available progressively.

**Art-directed presentation:**

- Geometry grows or unfolds into its final shape.
- Fur spreads in a chosen direction.
- Surface colour wipes across the body.
- Several details assemble simultaneously.

We can combine them. The calculation supplies real results; the viewer controls their appearance.

Importantly, those effects should not move or deform the builder’s working geometry. Later surface queries use that geometry to place things correctly. Presentation effects need to live in the rendering layer, leaving construction coordinates unchanged.

### Textures fit that separation too

For the current SDK:

- SVG drawings can prepare early, independently of much of the geometry.
- The procedural paint sheet needs the painted geometry and its final layout.
- Once that layout is fixed, paint computation can be chunked.
- The viewer can reveal finished paint gradually, independently of the order in which its pixels were calculated.

That means we can make textures look as though they are being drawn over the creature without forcing the paint algorithm to calculate pixels in an aesthetically pleasing order.

### My recommendation

Keep the SDK focused on correct construction plus progress, and put timing, easing, reveal direction and overlapping animations in the showcase.

Normal loading would use the fastest responsive schedule. “Watch it build” would use the same results with intentional presentation pacing—not arbitrary sleeps inside geometry functions.

Before choosing the exact interface, I’d settle one creative question: do you imagine watching a craft process—parts being placed and surfaces painted—or something more magical, where the creature grows into existence? Both fit this structure, but they call for different presentation effects.

**Status of that question:** Stefan had not chosen between these presentation directions in this conversation. Neither direction was implemented, and no exact progressive-build interface was selected.

## 5. Stefan challenges the maintenance objection: are tests enough?

Stefan quoted the assistant’s statement:

> A mirrored SDK would mean maintaining two versions of geometry generation, painting, skinning and placement. Fixes could diverge, and we would have to prove both produce the same creature.

**Stefan:** But unit tests can solve that, can’t they? They are cheap in the AI era. Or am I being a little overly confident?

### Assistant’s answer

**Yes—tests can make a mirrored SDK viable. You’re slightly overconfident about what they eliminate, not about their usefulness.** Tests detect divergence; they don’t eliminate the work of implementing each fix twice. AI makes tests faster to write, but doesn’t automatically make their expectations correct or their coverage complete.

We could build strong parity checks: run both versions with the same inputs and random seeds, then compare geometry, bone weights, UVs and texture pixels. That would catch many mistakes. But identical finished creatures don’t establish correct progressive behaviour: intermediate frames, texture readiness and responsiveness need separate checks. Both implementations can also pass tests that share the same mistaken assumptions.

**Your testing idea is good; I’d apply it to two runners sharing one implementation.** One runner completes the construction immediately; the other advances it in chunks. Test their final results for parity, then verify the progressive presentation separately. A genuinely separate implementation is defensible if it needs fundamentally different algorithms—not merely different pacing.

## 6. Where the conversation stands

Stefan then asked for this handoff so none of the discussion would be lost. He wanted it to follow the actual conversation closely, in plain language, including an explanation of the tools used and the findings from the two research outputs. He allowed light cleanup of his wording and removal of unnecessary repetition.

The established findings are the measured synchronous sampling bottleneck, its live bone-transform cost, the successful local position-reuse diagnostic for the mammoth, and the actual texture and viewer lifecycle described above. The investigation did not identify the precise mechanism behind Stefan’s browser crashes.

The proposed architecture is still a recommendation, not a decision or implemented feature: one construction implementation, resumable expensive computations, synchronous and progressive execution, and a separate art-directed presentation timeline. A fully mirrored asynchronous SDK was discussed but not approved or categorically ruled out. Testing was discussed as a way to establish parity, not performed as part of a new progressive implementation.

Stefan’s central intent is to preserve something close to the current SDK while creating a beautiful visual construction experience. Responsiveness matters, but visual beauty is the stated priority. Do not silently reduce that to merely showing a spinner, adding sleeps, or animating a finished model while leaving the loading freeze unchanged.

No progressive SDK, worker pipeline, presentation timeline, incremental paint bake, or assembly animation was implemented in this discussion. No implementation was authorized by the request to write this file. The concrete next discussion is the visual direction and then the smallest interface that supports it without duplicating the construction algorithms or changing every cheap helper into a promise-returning function.
