1. **Head sat sunk between the shoulders.** The neck was only 0.2 m long and the pauldrons were huge rocks hiding the face. I raised the neck and head by about 0.15 m, shrank and lowered the pauldron stack, and shrank the trapezius rocks so the face and horns read in every view.
2. **Eyes were half hidden under the brow.** I enlarged the glowing eye decals and raised and thinned the brow wedges, so the angry glare stays but the molten eyes show.
3. **Everything was near-black purple.** Genshin's cel look needs lighter, bluer-violet basalt. I lifted the lit and shadow tones of the plates, rocks and horns so the cel steps read and the lava seams contrast against mid-tone stone.
4. **Knee guards were big blobs in front of the legs.** I shrank them and tucked them in, so the legs and gold ankle bands read.
5. **The lava pool read as flat salmon.** I lowered its glow so it looks like deep orange molten rock.
6. **The horns were plain dark rods.** I added a gold band on each, tying them to the rest of the gold trim.

<<<<<<< SEARCH
      [0, 2.95, 0.2],
=======
      [0, 3.1, 0.22],
>>>>>>> REPLACE

<<<<<<< SEARCH
const head = b.joint("head", { parent: neck, at: [0, 2.95, 0.2], dir: [0, 0.05, 1], role: "head" });
=======
const head = b.joint("head", { parent: neck, at: [0, 3.1, 0.22], dir: [0, 0.05, 1], role: "head" });
>>>>>>> REPLACE

<<<<<<< SEARCH
const HORN = "#2b2640";
=======
const HORN = "#3a3358";
>>>>>>> REPLACE

<<<<<<< SEARCH
  [cel("#4b4666", "#2e2a45"), cel("#403b5a", "#292540"), cel("#564f72", "#34304d")],
=======
  [cel("#6a6492", "#3c3760"), cel("#5d5886", "#37325a"), cel("#767099", "#433e68")],
>>>>>>> REPLACE

<<<<<<< SEARCH
  [cel("#443f60", "#2a2641"), cel("#3a3555", "#26223c"), cel("#4f496c", "#312d4a")],
=======
  [cel("#625c8a", "#38335a"), cel("#585280", "#332e54"), cel("#6c6694", "#3f3a62")],
>>>>>>> REPLACE

<<<<<<< SEARCH
const ROCK_LIT = cel(mottle("#5d5784", "#4f4a74", { size: 0.2, seed: 1 }), mottle("#37314f", "#2e2a46", { size: 0.2, seed: 1 }));
const ROCK_MID = cel("#4a4568", "#2c2845");
const ROCK_DARK = cel("#363250", "#201d35");
=======
const ROCK_LIT = cel(mottle("#7c76a8", "#6a6494", { size: 0.2, seed: 1 }), mottle("#4a4470", "#3c3862", { size: 0.2, seed: 1 }));
const ROCK_MID = cel("#625c8a", "#38335a");
const ROCK_DARK = cel("#48426c", "#2a2548");
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(b.part(new THREE.CylinderGeometry(1.9, 1.95, 0.03, 9), LAVA_DEEP, { bone: hips, at: [0, FLOOR + 0.012, 0], flat: true }), 0.9);
=======
  glow(b.part(new THREE.CylinderGeometry(1.9, 1.95, 0.03, 9), LAVA_DEEP, { bone: hips, at: [0, FLOOR + 0.012, 0], flat: true }), 0.7);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(rock(0.44), ROCK_LIT, { bone: shoulder, at: [s * 1.22, 2.7, 0], scale: [1.1, 0.75, 1], rotation: [0, s * 20, 0], flat: true });
    b.part(rock(0.25), ROCK_MID, { bone: shoulder, at: [s * 1.36, 2.98, -0.05], rotation: [20, s * 30, 10], flat: true });
    b.spike([s * 1.42, 3.0, -0.05], [s * 0.6, 1, 0], 0.28, 0.09, { bone: shoulder, color: ROCK_DARK, sides: 6 });
=======
    b.part(rock(0.38), ROCK_LIT, { bone: shoulder, at: [s * 1.3, 2.6, 0], scale: [1.1, 0.75, 1], rotation: [0, s * 20, 0], flat: true });
    b.part(rock(0.2), ROCK_MID, { bone: shoulder, at: [s * 1.42, 2.84, -0.05], rotation: [20, s * 30, 10], flat: true });
    b.spike([s * 1.46, 2.9, -0.05], [s * 0.6, 1, 0], 0.24, 0.08, { bone: shoulder, color: ROCK_DARK, sides: 6 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.part(new THREE.OctahedronGeometry(0.12, 0), LAVA_HOT, { bone: shoulder, at: [s * 1.22, 2.85, 0.47], scale: [1, 1.4, 0.8] }), 1.4);
=======
    glow(b.part(new THREE.OctahedronGeometry(0.11, 0), LAVA_HOT, { bone: shoulder, at: [s * 1.3, 2.68, 0.4], scale: [1, 1.4, 0.8] }), 1.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(rock(0.3), ROCK_MID, { bone: chest, at: [s * 0.5, 2.95, -0.02], scale: [1, 0.8, 1], flat: true });
=======
    b.part(rock(0.22), ROCK_MID, { bone: chest, at: [s * 0.55, 2.88, -0.1], scale: [1, 0.8, 1], flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(rock(0.27), ROCK_LIT, { bone: knee, at: lp[1].clone().add(V(0, 0, 0.26)), scale: [1, 1.1, 0.8], flat: true });
=======
    b.part(rock(0.21), ROCK_LIT, { bone: knee, at: lp[1].clone().add(V(0, 0, 0.24)), scale: [1, 1.1, 0.8], flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const eyeGeo = new THREE.PlaneGeometry(0.24 * HK, 0.12 * HK);
=======
    const eyeGeo = new THREE.PlaneGeometry(0.3 * HK, 0.15 * HK);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.34 * HK, 0.1 * HK, 0.22 * HK), ROCK_DARK, { bone: head, at: hl(0.44, 0.33, s * 0.17), rotation: [0, 0, s * 14] });
=======
    b.part(new THREE.BoxGeometry(0.34 * HK, 0.08 * HK, 0.22 * HK), ROCK_DARK, { bone: head, at: hl(0.44, 0.375, s * 0.17), rotation: [0, 0, s * 14] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.spike(p2, td, 0.2, 0.05, { bone: head, color: LAVA_HOT, sides: 6 }), 1.3);
=======
    glow(b.spike(p2, td, 0.2, 0.05, { bone: head, color: LAVA_HOT, sides: 6 }), 1.3);
    const hornCurve = bezier(p0, p1, p2);
    b.part(new THREE.TorusGeometry(0.115, 0.03, 5, 8), GOLD, { bone: head, at: hornCurve.at(0.3), dir: hornCurve.tangentAt(0.3), axis: "z" });
>>>>>>> REPLACE