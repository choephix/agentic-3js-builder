1. **Floating kickstand.** The kickstand foot hung about 0.2 m above the deck. It now starts at the frame cradle, reaches down to the stage and ends in a foot pad, so it is seated on the floor.
2. **Fender glow.** The fenders were large, flat orange shapes with no Overwatch tech feel. I added cyan emissive edge strips along both outer rims. They sharpen the silhouette and tie the fenders to the glowing tyre rings.
3. **Hologram emblem.** It read as a thin edge-on sliver from the side view. It now has a crossed second card so it reads from every angle, plus a glowing base ring.
4. **Mirrors.** The mirror housings were dark navy hexagons that vanished against the handlebars. They are now orange with a bright glass face, in the team palette.

## Edits

<<<<<<< SEARCH
    at: [0.15, 0.33, 0.1],
    aim: [0.18, 0.29, -0.1],
=======
    at: [0.13, 0.34, 0.1],
    aim: [0.2, 0.095, -0.12],
>>>>>>> REPLACE

<<<<<<< SEARCH
  R(kick, V(0.15, 0.33, 0.1), V(0.18, 0.29, -0.1), 0.012, CHROME, 6);
  G(box(0.05, 0.012, 0.04), BLACK, kick, V(0.18, 0.285, -0.1));
=======
  R(kick, V(0.13, 0.34, 0.1), V(0.2, 0.095, -0.12), 0.012, CHROME, 6);
  R(kick, V(0.17, 0.2, -0.01), V(0.18, 0.17, -0.03), 0.02, ORANGE, 6);
  G(box(0.06, 0.012, 0.05), BLACK, kick, V(0.2, 0.086, -0.12));
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.cards([frame([hx, 0.7, hz], [0, 1, 0])], HOLO, { size: [0.5, 0.5], lean: 0, sink: 0, bone: chassis }),
      1.3,
    );
=======
      b.cards([frame([hx, 0.7, hz], [0, 1, 0])], HOLO, { size: [0.5, 0.5], lean: 0, sink: 0, cross: true, bone: chassis }),
      1.3,
    );
    glow(G(new THREE.TorusGeometry(0.075, 0.008, 6, 6), CYAN, chassis, V(hx, 0.095, hz), { dir: [0, 1, 0], axis: "z" }), 1.3);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // tail light + plate
=======
  // fender edge glow strips
  for (const sx of [1, -1]) {
    const rim: number[][] = [];
    for (let a = 62; a >= -104; a -= 11) {
      const r = (a * Math.PI) / 180;
      rim.push([sx * 0.172, AXLE_R.y + 0.452 * Math.cos(r), AXLE_R.z + 0.452 * Math.sin(r)]);
    }
    glow(b.sweep(catmull(rim), 0.005, { color: CYAN, bone: chassis, sides: 5 }), 1.3);
  }
  // tail light + plate
>>>>>>> REPLACE

<<<<<<< SEARCH
  // front fender
=======
  // front fender glow strips
  for (const sx of [1, -1]) {
    const rim: number[][] = [];
    for (let a = 70; a >= -35; a -= 11) {
      const r = (a * Math.PI) / 180;
      rim.push([sx * 0.067, AXLE_F.y + 0.402 * Math.cos(r), AXLE_F.z + 0.402 * Math.sin(r)]);
    }
    glow(b.sweep(catmull(rim), 0.004, { color: CYAN, bone: steer, sides: 5 }), 1.3);
  }
  // front fender
>>>>>>> REPLACE

<<<<<<< SEARCH
    R(steer, V(s * 0.38, 1.49, 0.27), offset(V(s * 0.38, 1.49, 0.27), md, 0.03), 0.052, NV, 6);
=======
    R(steer, V(s * 0.38, 1.49, 0.27), offset(V(s * 0.38, 1.49, 0.27), md, 0.03), 0.052, ORANGE_P, 8);
>>>>>>> REPLACE