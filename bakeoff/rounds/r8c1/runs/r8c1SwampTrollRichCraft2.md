1. **Eyes:** the amber eyes were small and mostly buried under the lid and brow, so the face didn't read from the front. I enlarged them, pushed the pupils forward and raised the lids.
2. **Tusks:** they were stubby and hidden behind the chin and necklace, but they are the troll's identity cue. I made them thicker, longer and curved higher and wider so they read from the front and side.
3. **Mohawk:** from the front it was three thin spikes. I thickened the blades and added a wider flanking row, so the crest has body from every angle and a stronger Warcraft silhouette.
4. **Totem wings:** they were oversized flat teal sheets that cut across the troll's hand and the side view. I shrank them and moved the hanging fetishes in under the wings.
5. **Cauldron:** it was almost black and merged with the shadows. I lightened the iron paint and fittings so its shape reads against the mud.

## Edits

<<<<<<< SEARCH
    const eye = blob(AMBER, head, hc(s * 0.075, 0.03, 0.13), 0.032);
=======
    const eye = blob(AMBER, head, hc(s * 0.075, 0.03, 0.132), 0.04);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(sphereG(6, 4), INK, { bone: head, at: hc(s * 0.075, 0.03, 0.157), scale: [0.0048, 0.022, 0.0066] });
=======
    b.part(sphereG(6, 4), INK, { bone: head, at: hc(s * 0.075, 0.03, 0.17), scale: [0.006, 0.03, 0.008] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    blob(SKIN, head, hc(s * 0.075, 0.049, 0.139), [0.036, 0.018, 0.03]); // heavy lid
=======
    blob(SKIN, head, hc(s * 0.075, 0.062, 0.138), [0.042, 0.016, 0.032]); // heavy lid
>>>>>>> REPLACE

<<<<<<< SEARCH
    const path = bezier(hc(s * 0.075, -0.135, 0.12), hc(s * 0.125, -0.15, 0.245), hc(s * 0.115, -0.015, 0.275));
    b.sweep(path, [0.034, 0.004], { color: TUSKP, bone: jaw, caps: { start: "flat", end: "point" } });
=======
    const path = bezier(hc(s * 0.08, -0.135, 0.12), hc(s * 0.155, -0.175, 0.265), hc(s * 0.145, 0.04, 0.3));
    b.sweep(path, [0.044, 0.004], { color: TUSKP, bone: jaw, caps: { start: "flat", end: "point" } });
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (const [dx, dz, kk] of [[0, 0, 1], [0.034, 0.012, 0.74], [-0.034, -0.012, 0.74]]) {
=======
    for (const [dx, dz, kk] of [[0, 0, 1], [0.034, 0.012, 0.8], [-0.034, -0.012, 0.8], [0.07, 0.02, 0.5], [-0.07, -0.02, 0.5]]) {
>>>>>>> REPLACE

<<<<<<< SEARCH
        thickness: [0.032, 0.008],
=======
        thickness: [0.05, 0.012],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [[0.14, 0.04], [0.5, 0.2, "sharp"], [0.42, 0.02], [0.46, -0.1, "sharp"], [0.34, -0.06], [0.3, -0.2, "sharp"], [0.14, -0.1]],
=======
      [[0.12, 0.03], [0.36, 0.15, "sharp"], [0.3, 0.02], [0.33, -0.08, "sharp"], [0.24, -0.05], [0.21, -0.14, "sharp"], [0.12, -0.08]],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const wp = [TX + xd[0] * s * 0.4, G + 0.8, TZ + xd[2] * s * 0.4] as V;
=======
    const wp = [TX + xd[0] * s * 0.26, G + 0.78, TZ + xd[2] * s * 0.26] as V;
>>>>>>> REPLACE

<<<<<<< SEARCH
const POTP = mottle("#26262d", "#4a4c58", { size: 0.1, seed: 9 });
=======
const POTP = mottle("#3c4050", "#6e7488", { size: 0.1, seed: 9 });
>>>>>>> REPLACE

<<<<<<< SEARCH
const IRON = "#34343c";
=======
const IRON = "#5c5c6a";
>>>>>>> REPLACE