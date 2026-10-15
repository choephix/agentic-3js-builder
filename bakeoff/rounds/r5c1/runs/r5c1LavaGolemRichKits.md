1. **Molten colours were washed out.** Glow was adding emissive on top of lit, bright base colours, so the lava read as salmon pink. I deepened the lava, hot-orange and red values so the glow stays saturated.
2. **The basalt was near-black and lost its form.** I lightened its lit and shadow tones and added a cool lavender light tone. The plate shapes now read, and the contrast against the lava is stronger, which suits the Genshin look.
3. **A big orange cone rose behind the head.** It was the torso loft's round cap, which extends one radius past a 1.2 m wide top station. I switched the loft to flat caps and narrowed the last station so the neck and head sit cleanly on the shoulders.
4. **The setting was missing.** I added a basalt ground slab under the golem with a glowing molten ring, plus drifting ember diamonds. They tie the halo and the body together and add the sparkle the style wants.

<<<<<<< SEARCH
const BASALT = cel(mottle("#5a5273", "#4b4463", { size: 0.25, seed: 3 }), "#2b2742");
const BASALT_DK = cel(mottle("#3f3956", "#342f49", { size: 0.2, seed: 5 }), "#1d1a2f");
const BASALT_LT = cel("#80779e", "#463f63");
=======
const BASALT = cel(mottle("#7b719c", "#685e8a", { size: 0.25, seed: 3 }), "#3a3560");
const BASALT_DK = cel(mottle("#564e78", "#4a4269", { size: 0.2, seed: 5 }), "#2a2547");
const BASALT_LT = cel("#a79dc6", "#5e5584");
>>>>>>> REPLACE

<<<<<<< SEARCH
const MOLTEN = "#ff6418";
const HOT = "#ffb02e";
const WHITEHOT = "#fff1a6";
const RED = "#e0300c";
=======
const MOLTEN = "#d93a06";
const HOT = "#ff9412";
const WHITEHOT = "#ffe27a";
const RED = "#c01e08";
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: [0, 2.68, 0.13], w: 1.2, h: 0.7 },
    ],
    { bone: spine, color: MOLTEN },
  );
=======
      { at: [0, 2.62, 0.13], w: 1.1, h: 0.62 },
    ],
    { bone: spine, color: MOLTEN, caps: "flat" },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  // slightly open mouth, showing the molten throat
=======
  // scorched ground slab with a molten ring
  b.part(new THREE.CylinderGeometry(1.35, 1.45, 0.05, 10), BASALT_DK, { bone: hips, at: [0, 0.025, 0.05], flat: true });
  glow(
    b.part(new THREE.TorusGeometry(1.2, 0.035, 4, 20), MOLTEN, {
      bone: hips,
      at: [0, 0.055, 0.05],
      rotation: [90, 0, 0],
      flat: true,
    }),
    1.2,
  );
  // drifting embers
  for (let i = 0; i < 16; i++) {
    const a = i * 2.4;
    const r = 1.0 + (i % 4) * 0.28;
    const y = 0.7 + ((i * 0.27) % 2.9);
    glow(
      b.part(new THREE.OctahedronGeometry(0.025 + (i % 3) * 0.012), i % 2 ? HOT : WHITEHOT, {
        bone: hips,
        at: [r * Math.cos(a), y, r * Math.sin(a) * 0.8],
        scale: [1, 1.6, 1],
        flat: true,
      }),
      1.6,
    );
  }

  // slightly open mouth, showing the molten throat
>>>>>>> REPLACE