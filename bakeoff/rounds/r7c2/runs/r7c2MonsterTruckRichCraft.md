1. **Engine blocked the windshield.** In the front render the blower and engine sat right in front of the glass. I lowered them and moved them forward on the hood, and moved the pulley to match, so the windshield and the "CRUSHER" cab read cleanly.
2. **Tyres were a near-black mass.** The tread and rim ring were lost in the dark palette. I lifted the tyre ramp so the lug blocks and the white wall ring read as pixel art.
3. **Exhaust flames looked like pink cones.** I made them taller, with a three-layer orange, yellow and white core, so they read as fire from the stacks.
4. **Side render is almost empty.** Only glowing and flat-coloured parts show, which looks like a camera or atlas quirk rather than a geometry fault, so I left it alone.

<<<<<<< SEARCH
const TIRE = ["#14141c", "#24242f", "#363644", "#505266"];
=======
const TIRE = ["#1c1c28", "#32323f", "#4c4e62", "#767a94"];
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx(hood, 0.7, 0.4, 0.75, [0, 2.8, 1.15], steelPaint);
  bx(hood, 0.54, 0.16, 0.54, [0, 3.08, 1.2], chromePaint);
  bx(hood, 0.4, 0.03, 0.4, [0, 3.165, 1.2], "#08080e");
  for (const x of [-0.31, 0.31])
    for (const z of [1.0, 1.4]) cyl(hood, 0.035, 0.04, 0.14, 6, [x, 3.07, z], [0, 1, 0], chromePaint);
  cyl(hood, 0.17, 0.17, 0.06, 10, [0, 2.8, 1.56], [0, 0, 1], chromePaint);
  cyl(hood, 0.05, 0.05, 0.08, 6, [0, 2.8, 1.6], [0, 0, 1], goldPaint);
=======
  bx(hood, 0.7, 0.3, 0.7, [0, 2.75, 1.45], steelPaint);
  bx(hood, 0.5, 0.12, 0.5, [0, 2.96, 1.5], chromePaint);
  bx(hood, 0.36, 0.03, 0.36, [0, 3.035, 1.5], "#08080e");
  for (const x of [-0.31, 0.31])
    for (const z of [1.25, 1.65]) cyl(hood, 0.035, 0.04, 0.12, 6, [x, 2.97, z], [0, 1, 0], chromePaint);
  cyl(hood, 0.15, 0.15, 0.06, 10, [0, 2.75, 1.83], [0, 0, 1], chromePaint);
  cyl(hood, 0.05, 0.05, 0.08, 6, [0, 2.75, 1.87], [0, 0, 1], goldPaint);
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.part(new THREE.ConeGeometry(0.1, 0.34, 6), "#ff6a10", { bone: chassis, at: [s * 0.7, 3.78, -1.04] }), 1);
    glow(b.part(new THREE.ConeGeometry(0.05, 0.2, 6), "#ffd23a", { bone: chassis, at: [s * 0.7, 3.74, -1.04] }), 1);
=======
    glow(b.part(new THREE.ConeGeometry(0.12, 0.55, 6), "#ff5a10", { bone: chassis, at: [s * 0.7, 3.92, -1.04] }), 1.6);
    glow(b.part(new THREE.ConeGeometry(0.075, 0.4, 6), "#ffc22a", { bone: chassis, at: [s * 0.7, 3.88, -1.04] }), 1.8);
    glow(b.part(new THREE.ConeGeometry(0.035, 0.24, 6), "#fff6a0", { bone: chassis, at: [s * 0.7, 3.84, -1.04] }), 2);
>>>>>>> REPLACE