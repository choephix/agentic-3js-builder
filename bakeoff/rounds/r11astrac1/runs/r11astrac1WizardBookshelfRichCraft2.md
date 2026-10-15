1. **Calm the materials.** Reduce the noisy wood grain and mottled gold so the silhouette, bindings and celestial ornament read first.
2. **Finish the side elevations.** Add recessed teal panels, slim gilded borders and large celestial medallions—the three-quarter view deserves as much care as the front.
3. **Repair the manuscript display.** Replace the floating-looking support with a proper inclined reading wedge and turn the illustrated page toward the viewer.
4. **Enrich the focal details.** Give exposed book covers matching insignia and the divination orb a luminous constellation.
5. **Seat the small fittings.** Connect the crown’s companion star and move the lower rivets onto the actual plinth face.

<<<<<<< SEARCH
  const wood = grain("#272b45", "#44465f", {
=======
  const wood = grain("#34374d", "#3c4057", {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const shelfWood = grain("#30344d", "#51516b", {
=======
  const shelfWood = grain("#3a3d53", "#454960", {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const brass = metal("brass", { polish: 0.48, tarnish: 0.16 });
  const gilding = metal("gilt", { polish: 0.6, tarnish: 0.06 });
=======
  const brass = paint((_p, n) =>
    mix("#ac8144", "#e8c882", 0.48 + 0.32 * n.y + 0.12 * n.z),
  );
  const gilding = metal("gilt", { polish: 0.35, tarnish: 0.015, size: 0.18 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const manuscript = svg(
=======
  const coverTexture = svg(
    `<svg viewBox="0 0 240 320">
      <g fill="none" stroke="#dcb976">
        <path d="M16 16H224V304H16Z" stroke-width="3"/>
        <path d="M25 25H215V295H25Z" stroke-width="1.5"/>
        <path d="M25 55L55 25M185 25L215 55M25 265L55 295M185 295L215 265" stroke-width="3"/>
        <circle cx="120" cy="156" r="65" stroke-width="2"/>
        <circle cx="120" cy="156" r="55" stroke-width="1.5"/>
        <path d="M120 91L139 137L185 156L139 175L120 221L101 175L55 156L101 137Z" stroke-width="3"/>
        <path d="M73 109L167 203M167 109L73 203" stroke-width="1.5"/>
      </g>
      <circle cx="120" cy="156" r="25" fill="#293345" stroke="#f1d599" stroke-width="3"/>
      <path d="M130 138C100 134 99 178 132 175C111 165 111 149 130 138Z" fill="#f1d599"/>
      <path d="M120 47L125 58L120 69L115 58ZM120 251L125 262L120 273L115 262Z" fill="#f1d599"/>
    </svg>`,
    { size: 512 },
  );

  const orbConstellation = svg(
    `<svg viewBox="0 0 200 200">
      <g fill="none" stroke="#c6fff5" stroke-width="2.5">
        <path d="M40 119L67 69L112 87L149 44M67 69L83 146L139 133"/>
        <circle cx="67" cy="69" r="8"/>
        <circle cx="139" cy="133" r="6"/>
      </g>
      <g fill="#edffef">
        <path d="M149 31L153 40L163 44L153 48L149 58L145 48L135 44L145 40Z"/>
        <circle cx="40" cy="119" r="4"/>
        <circle cx="112" cy="87" r="4"/>
        <circle cx="83" cy="146" r="4"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const manuscript = svg(
>>>>>>> REPLACE

<<<<<<< SEARCH
  const floorLevels = [0.33, 0.98, 1.63];
=======
  // Recessed-looking side panels, bounded by the structural stiles.
  for (const s of [-1, 1]) {
    box("side_panel_field", [s * 0.987, 1.30, 0.015], [0.018, 1.67, 0.455], C.teal);
    for (const z of [-0.224, 0.254]) {
      box("side_panel_vertical_moulding", [s * 1.001, 1.30, z],
        [0.021, 1.72, 0.026], brass);
    }
    for (const y of [0.45, 2.15]) {
      box("side_panel_horizontal_moulding", [s * 1.001, y, 0.015],
        [0.021, 0.026, 0.50], brass);
    }
    cyl("side_celestial_medallion_mount", [s * 1.007, 1.32, 0.015],
      0.181, 0.02, brass, [s, 0, 0], 0.181, 24);
    plate("side_celestial_medallion", [s * 1.02, 1.32, 0.015],
      0.342, 0.342, sealTexture, [s, 0, 0]);
    for (const y of [0.73, 1.91]) {
      b.extrude([[0, 0.095], [0.04, 0], [0, -0.095], [-0.04, 0]], {
        at: [s * 1.005, y, 0.015],
        x: [0, 0, s], y: [0, 1, 0],
        thickness: 0.014, color: brass, bone: root,
        name: "side_panel_lozenge",
      });
      rod("side_panel_fine_inlay",
        [s * 1.003, y - 0.20, 0.015],
        [s * 1.003, y - 0.105, 0.015], 0.004, brass);
      rod("side_panel_fine_inlay",
        [s * 1.003, y + 0.105, 0.015],
        [s * 1.003, y + 0.20, 0.015], 0.004, brass);
    }
  }

  const floorLevels = [0.33, 0.98, 1.63];
>>>>>>> REPLACE

<<<<<<< SEARCH
  diamond("moon_companion_star", 0.072, 2.872, -0.19, 0.065, 0.09);
=======
  rod("moon_star_hidden_stem", [0.018, 2.785, -0.205],
    [0.072, 2.872, -0.205], 0.005, brass);
  diamond("moon_companion_star", 0.072, 2.872, -0.19, 0.065, 0.09);
>>>>>>> REPLACE

<<<<<<< SEARCH
    piece("spine", [0, h / 2, d / 2 - 0.014], [w, h, 0.028], colors[style]);
    b.part(new THREE.PlaneGeometry(w * 0.88, h * 0.94), "#ffffff", {
=======
    piece("spine", [0, h / 2, d / 2 - 0.014], [w, h, 0.028], colors[style]);
    for (const s of [-1, 1]) {
      b.part(new THREE.PlaneGeometry(d * 0.87, h * 0.88), "#ffffff", {
        at: p(s * (w / 2 + 0.0025), h / 2, 0),
        dir: new THREE.Vector3(s, 0, 0).applyQuaternion(q),
        up: new THREE.Vector3(0, 1, 0).applyQuaternion(q),
        axis: "z", texture: coverTexture, bone: root,
        name: `${name}_cover_illuminations`,
      });
    }
    b.part(new THREE.PlaneGeometry(w * 0.88, h * 0.94), "#ffffff", {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const orbSkin = b.surface(orb);
=======
  glow(b.decal(orb, orbConstellation, {
    at: [ox + 0.025, 1.315, oz + 0.19],
    dir: [0, 0, 1], size: [0.245, 0.245],
    segments: 10, lift: 0.002, bone: root,
    name: "orb_luminous_constellation",
  }), 1.15);
  const orbSkin = b.surface(orb);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // A loose illuminated manuscript rests on the stacked books.
  box("manuscript_support", [-0.01, 1.815, 0.04], [0.285, 0.037, 0.24], C.dark, [-12, 0, 0]);
  const sheet = b.part(new THREE.BoxGeometry(0.286, 0.008, 0.29), C.cream, {
    at: [-0.01, 1.845, 0.04], rotation: [-12, 0, 0], bone: root, name: "laid_out_manuscript",
  });
  const sheetNormal = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), -12 * Math.PI / 180);
  const sheetUp = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(1, 0, 0), -12 * Math.PI / 180);
  b.part(new THREE.PlaneGeometry(0.274, 0.278), "#ffffff", {
    at: new THREE.Vector3(-0.01, 1.845, 0.04).addScaledVector(sheetNormal, 0.0048),
    dir: sheetNormal, up: sheetUp, axis: "z",
    texture: manuscript, bone: root, name: "manuscript_illuminations",
  });
=======
  // A small wedge seats the entire manuscript and presents its art forward.
  const readingAngle = 35 * Math.PI / 180;
  const readingDepth = 0.29 * Math.cos(readingAngle);
  const readingRise = 0.29 * Math.sin(readingAngle);
  b.extrude([
    [-readingDepth / 2, 0],
    [readingDepth / 2, 0],
    [readingDepth / 2, 0.009],
    [-readingDepth / 2, readingRise + 0.009],
  ], {
    at: [-0.01, 1.796, 0.04],
    x: [0, 0, 1], y: [0, 1, 0], thickness: 0.264,
    color: C.dark, bone: root, name: "manuscript_reading_wedge",
  });
  const sheetCenter = new THREE.Vector3(-0.01, 1.809 + readingRise / 2, 0.04);
  const sheetNormal = new THREE.Vector3(0, 1, 0).applyAxisAngle(
    new THREE.Vector3(1, 0, 0), readingAngle);
  const sheetUp = new THREE.Vector3(0, 0, -1).applyAxisAngle(
    new THREE.Vector3(1, 0, 0), readingAngle);
  const sheet = b.part(new THREE.BoxGeometry(0.286, 0.008, 0.29), C.cream, {
    at: sheetCenter, rotation: [35, 0, 0], bone: root,
    name: "laid_out_manuscript",
  });
  b.part(new THREE.PlaneGeometry(0.274, 0.278), "#ffffff", {
    at: sheetCenter.clone().addScaledVector(sheetNormal, 0.0048),
    dir: sheetNormal, up: sheetUp, axis: "z",
    texture: manuscript, bone: root, name: "manuscript_illuminations",
  });
  rod("manuscript_retaining_lip",
    [-0.16, 1.816, 0.04 + readingDepth / 2],
    [0.14, 1.816, 0.04 + readingDepth / 2],
    0.008, brass);
>>>>>>> REPLACE

<<<<<<< SEARCH
      ball("frame_rivet", [x, y, 0.372], 0.012, gilding, [1, 1, 0.48]);
=======
      const faceZ = y < 1 ? 0.343 : 0.365;
      ball("frame_rivet", [x, y, faceZ], 0.012, gilding, [1, 1, 0.48]);
>>>>>>> REPLACE