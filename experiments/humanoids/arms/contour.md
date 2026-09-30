# Arm C: contour

Your toolkit is the SDK in `docs/api.md` plus contoured sections, which you build first, then use for both subjects: sweeps whose cross-section you shape along their length, so a torso, thigh, calf, forearm, foot or head gets the section it has in life rather than a circle or an ellipse.

## Contoured sections

- A sweep's section is set per source t by its reach in four directions from the path, front, back, left and right (along the section's axes, the same axes as `[rx, ry]`), and by its roundness, from a box with softened corners through an ellipse to fuller. The reaches and roundness are keyed or are functions of t, and a key can change quickly over a short distance (a shelf under a chest muscle) or smoothly.
- Contoured sweeps work wherever sweeps do: paths and chains, smooth and rigid skin, caps, `extend`, colour functions, bands, sectors, paints, `sweep.at`, `sweep.line`, `sweep.curve` and surface queries.
- It is an option on `sweep` (and so on everything built on it), or a function in `src/experimental/contour.ts` if that is cleaner; samples import it from there. Changes to `src/sweep.ts` and other existing `src/` files are strictly additive: every existing sample builds exactly as before. Another builder may be editing the same file: re-read before each edit.
- The API reads like the rest of `docs/api.md`: few names, few options. A doc comment at the top of `src/experimental/contour.ts` documents it in `docs/api.md` style (the module exists even if it only re-exports); your samples use only what it documents.

## Order of work

1. Build contoured sections. Prove them on a throwaway `samples/contourTest.ts`: up to 3 snapshots, outside the subject budget. Delete that file once the subjects start.
2. Build both subjects with them. Keep improving the toolkit while you build them, and record each change in your notes.
