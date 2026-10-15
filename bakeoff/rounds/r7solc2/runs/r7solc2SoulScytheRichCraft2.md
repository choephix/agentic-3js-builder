1. **Repair the hanging chain.** Its links currently read as disconnected horizontal discs. Alternating upright links will form a continuous, believable chain.
2. **Sharpen the blade in depth.** The side view exposes a thick luminous cutting wall. Tapering the bevel into a genuine knife edge preserves the impressive front silhouette without the slab-like profile.
3. **Strengthen the blade’s visual hierarchy.** More deliberate warm bone/cool shadow planes, broader inscriptions, and finer soul channels make the blade feel sculpted rather than outlined.
4. **Make the captive spirit more threatening.** Replace the cheerful ghost expression with an angular, predatory wraith face, and darken its surrounding glow so the face remains the focal point.

<<<<<<< SEARCH
  const bladeBone = paint((p, n) => {
    const weather = noise(p, 0.18, 25);
    const v = Math.sin(p.x * 35 + p.y * 13 + weather * 8);
    return mix(
      mix("#c3c9ac", "#f3e1b4", 0.52 + n.y * 0.14),
      "#9bbaa9",
      Math.max(0, v - 0.72) * 0.22,
    );
  });
=======
  const bladeBone = paint((p, n) => {
    const weather = noise(p, 0.18, 25);
    const light = n.x * 0.25 + n.y * 0.8 + Math.abs(n.z) * 0.38;
    const lit = mix("#dfc797", "#fff0c6", 0.35 + weather * 0.4);
    const shadow = mix("#82998d", "#bdc6aa", 0.3 + weather * 0.4);
    const plane = light > 0.26 ? lit : shadow;
    const vein = Math.sin(p.x * 35 + p.y * 13 + weather * 8);
    return mix(plane, "#637e75", Math.max(0, vein - 0.83) * 0.28);
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
      <path d="M22 76 Q39 72 45 89 Q24 94 22 76Z" fill="#143d45"/>
      <path d="M77 75 Q58 75 56 90 Q74 92 77 75Z" fill="#143d45"/>
      <path d="M50 88 L44 103 L55 102Z" fill="#24746b"/>
      <path d="M34 104 Q49 111 66 102 L61 116 L54 111 L47 120
               L42 112 L35 115Z" fill="#1d5958"/>
=======
      <path d="M19 72 L43 83 L44 94 L29 87Z" fill="#143d45"/>
      <path d="M81 72 L57 83 L56 94 L72 87Z" fill="#143d45"/>
      <path d="M26 78 L38 84 L32 84Z M74 78 L62 84 L68 84Z" fill="#f2fff0"/>
      <path d="M50 88 L43 103 L57 103Z" fill="#24746b"/>
      <path d="M32 111 L40 103 L47 108 L51 104 L57 108 L65 103
               L69 111 L61 108 L57 119 L52 112 L47 121 L42 111 L37 116Z"
            fill="#143d45"/>
>>>>>>> REPLACE

<<<<<<< SEARCH
  glow(
    ball("Captive soul body", [0, 1.896, 0.018], [0.079, 0.139, 0.07], C.teal, 1),
    1,
  );
=======
  glow(
    ball("Captive soul body", [0, 1.896, 0.018], [0.075, 0.139, 0.065], "#239e91", 1),
    0.65,
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
    const linkGeometry = new THREE.TorusGeometry(0.024, 0.005, 5, 12);
    linkGeometry.rotateX(Math.PI / 2);
    linkGeometry.scale(0.79, 1.18, 1);
    linkGeometry.rotateY(i % 2 ? Math.PI / 2 : 0);
=======
    const linkGeometry = new THREE.TorusGeometry(0.024, 0.005, 5, 12);
    // Keep the long axis along the chain tangent. Alternate the planes,
    // rather than rotating horizontal hoops around their own normal.
    linkGeometry.scale(0.79, 1.18, 1);
    linkGeometry.rotateY(i % 2 ? Math.PI / 2 : 0);
>>>>>>> REPLACE

<<<<<<< SEARCH
  function bladePoint(index: number, across: number, z: number): P {
    const o = outer[index];
    const i = inner[index];
    return [
      o[0] + (i[0] - o[0]) * across,
      o[1] + (i[1] - o[1]) * across,
      index === outer.length - 1 ? Math.sign(z) * 0.001 : z,
    ];
  }
=======
  function bladePoint(index: number, across: number, z: number): P {
    const o = outer[index];
    const i = inner[index];
    // The last thirteen percent of the face converges to a real edge.
    // All attached edge strips use this same taper, so no luminous wall
    // or floating highlight survives in the side silhouette.
    const edgeTaper =
      across <= 0.87 ? 1 : 1 - Math.min(1, (across - 0.87) / 0.13) * 0.975;
    return [
      o[0] + (i[0] - o[0]) * across,
      o[1] + (i[1] - o[1]) * across,
      index === outer.length - 1
        ? Math.sign(z) * 0.0005
        : z * edgeTaper,
    ];
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
          k % 3 === 1 ? agedBone : bladeBone,
=======
          bladeBone,
>>>>>>> REPLACE

<<<<<<< SEARCH
          k % 2 ? "#c8d4bf" : "#d6dec7",
=======
          k % 2 ? "#91b3a4" : "#acc9b5",
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(groove, 0.010, {
=======
    b.sweep(groove, 0.0075, {
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep(core, [0.005, 0.0055, 0.005, 0.004, 0.003, 0.001], {
=======
      b.sweep(core, [0.0035, 0.004, 0.0035, 0.003, 0.002, 0.0005], {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const runePlacements = [
    { x: 0.37, y: 2.853, w: 0.113, h: 0.177, roll: -27 },
    { x: 0.65, y: 2.947, w: 0.126, h: 0.183, roll: -2 },
    { x: 0.93, y: 2.862, w: 0.117, h: 0.177, roll: 29 },
    { x: 1.18, y: 2.653, w: 0.103, h: 0.162, roll: 43 },
    { x: 1.405, y: 2.325, w: 0.074, h: 0.129, roll: 58 },
  ];
=======
  const runePlacements = [
    { x: 0.37, y: 2.866, w: 0.145, h: 0.209, roll: -27 },
    { x: 0.65, y: 2.954, w: 0.158, h: 0.227, roll: -2 },
    { x: 0.93, y: 2.871, w: 0.147, h: 0.213, roll: 29 },
    { x: 1.18, y: 2.661, w: 0.127, h: 0.191, roll: 43 },
    { x: 1.405, y: 2.331, w: 0.088, h: 0.15, roll: 58 },
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
      <path d="M39 8 L62 32 L49 45 L64 65 L42 106 L17 79 L31 60
               L17 42 L39 8Z" fill="none" stroke="#325853" stroke-width="9"/>
      <path d="M39 8 L62 32 L49 45 L64 65 L42 106 L17 79 L31 60
               L17 42 L39 8Z" fill="none" stroke="#bd9970" stroke-width="4"/>
      <path d="M40 24 L40 91 M26 43 L51 62 L31 79 M50 35 L30 59"
            fill="none" stroke="#a4ead0" stroke-width="4"/>
=======
      <path d="M39 8 L62 32 L49 45 L64 65 L42 106 L17 79 L31 60
               L17 42 L39 8Z" fill="#617e70" stroke="#325853" stroke-width="7"/>
      <path d="M39 8 L62 32 L49 45 L64 65 L42 106 L17 79 L31 60
               L17 42 L39 8Z" fill="none" stroke="#e1c28b" stroke-width="3.5"/>
      <path d="M40 24 L40 91 M26 43 L51 62 L31 79 M50 35 L30 59"
            fill="none" stroke="#b9f3d3" stroke-width="5"/>
>>>>>>> REPLACE