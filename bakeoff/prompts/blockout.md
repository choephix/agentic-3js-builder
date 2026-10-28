# Your task

Write a rough, immediately renderable three.js blockout for the subject in the user's pitch using the agentic-3js-builder SDK. This is the first screen of a two-call build: preserve the subject's silhouette, proportions, facing and main masses so a later full model can replace it without a visible jump.

## Your reply

Reply with one TypeScript module in a single ```ts code block and no useful prose outside it. The module must import three.js and the SDK, default-export a no-argument function returning `b.root`, and export `meta = { name, description }`. Keep the reply at or below 3,000 output tokens.

## Blockout target

Build only the skeleton and main masses: body or chassis, head/cab, primary limbs or supports, major appendages, and the floor contact. Use simple primitives, chains and sweeps where they make the silhouette clear. Use a neutral rest pose for creatures, with limbs, digits, wings, tails and tentacles separated enough to read. Give joints recognisable names and bones to geometry where appropriate. Keep the model centred, at real-world scale, standing on y = 0 unless the pitch explicitly places it elsewhere, facing +Z with its left side at +X.

Use a small, flat colour palette: one solid colour per part, no textures, decals, stripes, seams, eyes, emblems, trim, fur tufts, labels, scenery or secondary props. Do not spend output on helper abstractions or fine detail. The blockout should be robust and render on its first attempt, with no placeholder code, TODOs or omitted imports.

The full build will add detail later, so spend the budget on a clean, unmistakable silhouette and accurate placement of the main masses rather than ambition. Stay comfortably below 3,000 output tokens and finish with the complete module in the code fence.
