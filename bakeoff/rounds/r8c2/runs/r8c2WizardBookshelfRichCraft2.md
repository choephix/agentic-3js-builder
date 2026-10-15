1. **Wood looked fuzzy and noisy.** The 0.035 grain size turned the purple wood into static, so I made it larger-scale and slightly brighter. The shelf now reads as clean fantasy timber, and the glowing emblems and gold trim stand out more.
2. **Flames were too small.** They read as tiny specks at normal viewing size, so I enlarged them. The candles are the main light story of the piece and should carry more weight.
3. **The front of the setting was empty.** The rug and the front of the dais lacked a focal magic moment, so I added a levitating open spellbook with glowing runed pages. Above it hover a rune-circle halo, a golden orb and stars. It sits low in front of the plinth, so the shelves stay clear and the anime magic-shop feel gets a bit more spectacle.

<<<<<<< SEARCH
  const WOOD_V = lit(grain("#432763", "#6a41a0", { size: 0.035, axis: "y" }));
  const WOOD_H = lit(grain("#432763", "#6a41a0", { size: 0.035, axis: "x" }));
=======
  const WOOD_V = lit(grain("#4a2a6e", "#7a4fb8", { size: 0.09, axis: "y" }));
  const WOOD_H = lit(grain("#4a2a6e", "#7a4fb8", { size: 0.09, axis: "x" }));
>>>>>>> REPLACE

<<<<<<< SEARCH
      { size: [0.045, 0.085], cross: true, vary: 0.15, rng: rng(9), bone: root },
=======
      { size: [0.06, 0.115], cross: true, vary: 0.15, rng: rng(9), bone: root },
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Flames
=======
  // Levitating spellbook in front of the plinth
  const PAGE_RUNES = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="80" fill="#f6ecd0"/>
      <path d="M8 14 H52 M8 24 H46 M8 34 H52 M8 44 H40 M8 54 H50 M8 64 H34" stroke="#2fb8d8" stroke-width="3" stroke-linecap="round"/>
      <circle cx="46" cy="64" r="5" fill="none" stroke="#e8325a" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );
  const bk: V = [0, 0.17, 0.58];
  box(0.32, 0.014, 0.21, "#6b2f9a", [bk[0], bk[1], bk[2]]);
  box(0.34, 0.006, 0.22, GOLD, [bk[0], bk[1] - 0.008, bk[2]]);
  for (const s of [1, -1]) {
    box(0.15, 0.014, 0.19, PAGES, [s * 0.078, bk[1] + 0.016, bk[2]], { rotation: [0, 0, s * 9] });
    glow(
      P(new THREE.BoxGeometry(0.13, 0.002, 0.17), "#ffffff", [s * 0.078, bk[1] + 0.026, bk[2]], {
        rotation: [0, 0, s * 9],
        texture: PAGE_RUNES,
      }),
      0.8,
    );
  }
  glow(
    P(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", [0, bk[1] + 0.14, bk[2]], {
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE_CIRCLE,
    }),
    1.2,
  );
  glow(P(new THREE.SphereGeometry(0.035, 10, 7), "#ffffff", [0, bk[1] + 0.2, bk[2]], { texture: ORB_GOLD }), 1.5);
  for (const [dx, dy, dz] of [[0.14, 0.26, 0.04], [-0.15, 0.22, -0.02], [0.02, 0.32, 0.08]] as V[])
    glow(
      b.extrude(star4(0.025), {
        at: [bk[0] + dx, bk[1] + dy, bk[2] + dz],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.005,
        color: "#ffe9a0",
        bone: root,
      }),
      1.5,
    );

  // Flames
>>>>>>> REPLACE