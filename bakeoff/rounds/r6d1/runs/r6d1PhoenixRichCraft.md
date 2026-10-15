1. **Bigger, clearer face.** The skull sphere goes from 0.115×0.105×0.14 to 0.13×0.12×0.15, and the eye decal from 0.11×0.082 to 0.15×0.11. In the close-up the eye was tiny and the head small against the wings. The next head render should show a big glowing amber eye that is the focal point.
2. **Fuller chest and clearer emblem.** The body radii go up a little. The fluff keep-out around the Pyro emblem grows from 0.14 to 0.24 and the emblem from 0.18 to 0.22, because gold fluff was hiding it from the front. The next front view should show a stronger chest and the emblem disc.
3. **Thigh blobs reseated.** The thigh spheres hung below the belly like yellow lumps in the side view. They are now smaller and sit inside the body line, so the side view should show a clean belly into slim legs.
4. **Pillars out of the way.** The two front pillars move from 40°/320° to 70°/290°, so they no longer stand in front of the legs and dais in the front view. The back two stay where they are, clear of the tail plumes.

<<<<<<< SEARCH
const body = b.sweep(spine, [0.13, 0.22, 0.27, 0.29, 0.25, 0.18], { color: BODY, sides: 10 });
=======
const body = b.sweep(spine, [0.14, 0.24, 0.3, 0.33, 0.28, 0.2], { color: BODY, sides: 10 });
>>>>>>> REPLACE

<<<<<<< SEARCH
glow(b.decal(body, EMBLEM, { at: chest, size: [0.18, 0.18] }), 0.7);
=======
glow(b.decal(body, EMBLEM, { at: chest, size: [0.22, 0.22] }), 0.7);
>>>>>>> REPLACE

<<<<<<< SEARCH
    filter: (h) => h.n.z > 0.2 && h.n.y < 0.7 && h.at.distanceTo(chest.at) > 0.14,
=======
    filter: (h) => h.n.z > 0.2 && h.n.y < 0.7 && h.at.distanceTo(chest.at) > 0.24,
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: hip.clone().add(V(0, -0.02, 0)),
      scale: [0.13, 0.22, 0.16],
=======
      at: hip.clone().add(V(0, 0.0, 0)),
      scale: [0.11, 0.15, 0.14],
>>>>>>> REPLACE

<<<<<<< SEARCH
    scale: [0.115, 0.105, 0.14],
=======
    scale: [0.13, 0.12, 0.15],
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.11, 0.082], mirror: s < 0 }), 0.8);
=======
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.15, 0.11], mirror: s < 0 }), 0.8);
>>>>>>> REPLACE

<<<<<<< SEARCH
for (const a of [40, 140, 220, 320]) {
=======
for (const a of [70, 140, 220, 290]) {
>>>>>>> REPLACE