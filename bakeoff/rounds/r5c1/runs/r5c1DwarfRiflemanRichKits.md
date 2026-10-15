1. **Boot soles:** the dark blue-black slabs under the boots read as floating platforms, wider and longer than the boots. I replaced them with a narrower brown sole and a longer, fuller boot, which gives the dwarf a sturdier footprint.
2. **Face:** the pink cheek balls dominated the face and the eyes were tiny. I shrank the cheeks and enlarged the eyes slightly, so the blue irises read from a distance.
3. **Goggles:** the goggles floated on the helm with nothing holding them. I added a leather strap ring around the helm that they sit on.
4. **Braids:** they hung over the tabard and hid the gold emblem. I shortened them so the emblem shows.
5. **Powder keg:** I added a fuse and a glowing ember on top of the keg, which gives a warm accent in the Warcraft engineer style.

<<<<<<< SEARCH
    b.capsule(V(s * 0.125, 0.06, -0.02), V(s * 0.125, 0.06, 0.16), [0.063, 0.059], LEATHER_D, { bone: ankle });
    b.part(new THREE.BoxGeometry(0.145, 0.026, 0.3), IRON_F, { bone: ankle, at: [s * 0.125, 0.013, 0.065] });
=======
    b.capsule(V(s * 0.125, 0.07, -0.04), V(s * 0.125, 0.07, 0.19), [0.07, 0.066], LEATHER_D, { bone: ankle });
    b.part(new THREE.BoxGeometry(0.13, 0.03, 0.31), "#2e1c10", { bone: ankle, at: [s * 0.125, 0.015, 0.07] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.SphereGeometry(0.05, 8, 6), CHEEK, { bone: head, at: [s * 0.072, 1.25, 0.14], scale: [1, 0.9, 0.9] });
=======
    b.part(new THREE.SphereGeometry(0.038, 8, 6), CHEEK, { bone: head, at: [s * 0.075, 1.255, 0.145], scale: [1, 0.85, 0.85] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.SphereGeometry(0.021, 8, 6), "#f4efe6", { bone: head, at: [ex, 1.305, 0.172], scale: [1, 0.85, 0.7] });
    b.part(new THREE.CircleGeometry(0.0115, 10), "#2f7fd0", { bone: head, at: [ex, 1.305, 0.1875], dir: [0, 0, 1], axis: "z" });
    b.part(new THREE.CircleGeometry(0.0055, 8), "#10131c", { bone: head, at: [ex, 1.305, 0.1882], dir: [0, 0, 1], axis: "z" });
=======
    b.part(new THREE.SphereGeometry(0.026, 8, 6), "#f4efe6", { bone: head, at: [ex, 1.305, 0.175], scale: [1, 0.85, 0.7] });
    b.part(new THREE.CircleGeometry(0.0145, 10), "#2f7fd0", { bone: head, at: [ex, 1.305, 0.1945], dir: [0, 0, 1], axis: "z" });
    b.part(new THREE.CircleGeometry(0.007, 8), "#10131c", { bone: head, at: [ex, 1.305, 0.1953], dir: [0, 0, 1], axis: "z" });
    b.part(new THREE.CircleGeometry(0.0032, 6), "#ffffff", { bone: head, at: [ex + s * 0.004, 1.311, 0.196], dir: [0, 0, 1], axis: "z" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.012), GOLD_D, { bone: head, at: [0, 1.405, 0.192] });
=======
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.012), GOLD_D, { bone: head, at: [0, 1.405, 0.192] });
  ring(0.131, 0.009, V(0, 1.397, 0.07), [0, 1, 0], LEATHER_D, head, 14);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const bp = catmull([V(bx, 0.92, 0.255), V(bx * 1.15, 0.82, 0.265), V(bx * 1.3, 0.7, 0.272), V(bx * 1.4, 0.57, 0.278)]);
=======
    const bp = catmull([V(bx, 0.92, 0.255), V(bx * 1.15, 0.85, 0.262), V(bx * 1.3, 0.77, 0.268), V(bx * 1.4, 0.67, 0.272)]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), GOLD, { bone: chestJ, at: V(0.0, kegC.y + 0.108, kegC.z), dir: [0, 1, 0] });
=======
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), GOLD, { bone: chestJ, at: V(0.0, kegC.y + 0.108, kegC.z), dir: [0, 1, 0] });
  b.rod(V(0, kegC.y + 0.115, kegC.z), V(0.02, kegC.y + 0.17, kegC.z - 0.02), 0.005, "#d9c9a0", { bone: chestJ });
  glow(
    b.part(new THREE.SphereGeometry(0.015, 6, 4), "#ff7a1a", { bone: chestJ, at: V(0.02, kegC.y + 0.176, kegC.z - 0.02) }),
    1.8,
  );
>>>>>>> REPLACE