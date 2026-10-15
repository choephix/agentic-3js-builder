1. **Lid caps and posts read as black.** The iron paint is near-black, so the open lid's end arcs and chest posts look like holes. I'm switching `IRON` to blued steel, so they read as hextech-blue metal.
2. **The base inlay looks like a stray strip.** It is a flat gold band half-hidden by coins. I'm making it aqua and adding a glowing hex ring just outside it, so the base reads as hextech.
3. **The silhouette is a flat, wide mound.** I'm adding a planted jewelled greatsword in the left pile: blade, crossguard with end caps, wrapped grip, ruby pommel and a glowing fuller. It adds a tall vertical accent that breaks the mass and fits the League style.

<<<<<<< SEARCH
const IRON = metal("iron", { seed: 2 });
=======
const IRON = metal("blued", { seed: 2, polish: 0.5 });
>>>>>>> REPLACE

<<<<<<< SEARCH
      [1.0, 0.14],
      [1.1, 0.14],
      [1.1, 0.152],
      [1.0, 0.152],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 6, color: GILT_OLD, bone: root, name: "hexInlay" },
=======
      [1.0, 0.14],
      [1.1, 0.14],
      [1.1, 0.156],
      [1.0, 0.156],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 6, color: "#2a6f9a", bone: root, name: "hexInlay" },
>>>>>>> REPLACE

<<<<<<< SEARCH
  const sparks: ReturnType<typeof frame>[] = [];
=======
  // ---- glowing hextech ring on the base --------------------------------------------------------------------------------
  glow(
    b.lathe(
      [
        [1.14, 0.14],
        [1.19, 0.14],
        [1.19, 0.162],
        [1.14, 0.162],
      ],
      { at: [0, 0, 0], axis: [0, 1, 0], segments: 6, color: "#5ff2ff", bone: root, name: "hexGlowRing" },
    ),
    1.1,
  );

  // ---- planted greatsword ------------------------------------------------------------------------------------------------
  {
    const tip = V(-0.45, 0.14, 0.02);
    const dir = V(0.1, 1, -0.05).normalize();
    const C = tip.clone().addScaledVector(dir, 0.55);
    const Q = aim(dir);
    const { L, D } = xf(C, Q);
    const bladeX = D(1, 0, 0);
    const bladeY = D(0, 1, 0);
    b.extrude(
      [
        [-0.038, 0],
        [-0.03, -0.45],
        [0, -0.55, "sharp"],
        [0.03, -0.45],
        [0.038, 0],
      ],
      { at: C, x: bladeX, y: bladeY, thickness: 0.016, bevel: 0.004, color: SILVER, bone: root, name: "swordBlade" },
    );
    glow(
      b.extrude(
        [
          [-0.006, -0.03],
          [-0.005, -0.42],
          [0.005, -0.42],
          [0.006, -0.03],
        ],
        { at: C, x: bladeX, y: bladeY, thickness: 0.021, color: "#5ff2ff", bone: root, name: "swordFuller" },
      ),
      1,
    );
    b.part(new THREE.BoxGeometry(0.22, 0.032, 0.05), GILT, { bone: root, at: L(0, 0.008, 0), quat: Q, name: "swordGuard" });
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.024, 7, 5), GOLD_FLAT, { bone: root, at: L(s * 0.112, 0.008, 0), flat: true, name: "swordGuardCap" });
    b.part(new THREE.CylinderGeometry(0.015, 0.017, 0.13, 7), "#7a1428", { bone: root, at: L(0, 0.08, 0), quat: Q, flat: true, name: "swordGrip" });
    for (const k of [0.04, 0.08, 0.12])
      b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.009, 7), GOLD_FLAT, { bone: root, at: L(0, k, 0), quat: Q, flat: true, name: "swordWrap" });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD_FLAT, { bone: root, at: L(0, 0.155, 0), flat: true, name: "swordPommel" });
    gem(L(0, 0.178, 0), D(0, 1, 0), 0.03, GEM.ruby, 0.7);
    gem(L(0, 0.025, 0.026), D(0, 0.1, 1), 0.022, GEM.aqua, 0.7, 6);
  }

  const sparks: ReturnType<typeof frame>[] = [];
>>>>>>> REPLACE