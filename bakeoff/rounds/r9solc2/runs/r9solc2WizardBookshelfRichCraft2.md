1. **Bring the recessed candle forward** so its flame and brass holder remain visible in the main three-quarter view.
2. **Give the orb a ceremonial setting:** an embroidered teal shelf runner, hanging star panel and gold tassels make it the unmistakable focal point.
3. **Soften the books’ flat, saturated leather** with subtle material variation while preserving their jewel-tone palette and crisp gilding.
4. **Replace the upper foreground book with an open illuminated manuscript.** Readable celestial diagrams, handwritten notes and a trailing bookmark give the setting a stronger sense of an interrupted magical study.

<<<<<<< SEARCH
    const origin = new THREE.Vector3(x, bottom, z);
    const p = (a: number, y: number, c: number) =>
      new THREE.Vector3(a, y, c).applyQuaternion(q).add(origin);

    function piece(size: V, at: V, fill: Fill, name: string) {
=======
    const origin = new THREE.Vector3(x, bottom, z);
    const p = (a: number, y: number, c: number) =>
      new THREE.Vector3(a, y, c).applyQuaternion(q).add(origin);
    const leather = mottle(
      mix(color, "#192136", 0.24),
      mix(color, "#c8aa87", 0.12),
      { size: 0.085, contrast: 0.45, seed: 23 },
    );

    function piece(size: V, at: V, fill: Fill, name: string) {
>>>>>>> REPLACE

<<<<<<< SEARCH
        [s * (width / 2 - 0.007), height / 2, 0],
        color,
        "leather book board",
=======
        [s * (width / 2 - 0.007), height / 2, 0],
        leather,
        "leather book board",
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0, height / 2, depth / 2 - 0.006],
      color,
      "leather spine",
=======
      [0, height / 2, depth / 2 - 0.006],
      leather,
      "leather spine",
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Armillary scrying instrument.
  const orbX = 0.075;
=======
  // A ceremonial silk runner turns the instrument's shelf into a small altar.
  const SILK = paint((p, n) =>
    mix(
      "#246d79",
      "#438e94",
      0.24 + Math.max(0, n.y) * 0.28 +
        0.035 * Math.sin(p.x * 550),
    ),
  );

  box(
    [0.075, 1.5685, 0.04],
    [0.29, 0.003, 0.488],
    SILK,
    [0, 0, 0],
    "silk runner across shelf",
  );
  box(
    [0.075, 1.510, 0.291],
    [0.29, 0.117, 0.005],
    SILK,
    [0, 0, 0],
    "hanging silk runner",
  );

  for (const x of [-0.061, 0.211]) {
    rod(
      [x, 1.571, -0.204],
      [x, 1.571, 0.286],
      0.003,
      GOLD,
      "runner woven gold border",
    );
    rod(
      [x, 1.567, 0.295],
      [x, 1.456, 0.295],
      0.003,
      GOLD,
      "runner hanging gold border",
    );
  }
  rod(
    [-0.069, 1.456, 0.295],
    [0.219, 1.456, 0.295],
    0.0035,
    GOLD,
    "runner lower hem",
  );
  star([0.075, 1.511, 0.297], 0.034, C.goldLight, 0.003);
  for (const x of [-0.021, 0.171]) {
    diamond([x, 1.511, 0.297], 0.012, 0.032, GOLD, 0.003);
  }

  for (const x of [-0.059, 0.075, 0.209]) {
    rod(
      [x, 1.455, 0.295],
      [x, 1.439, 0.295],
      0.003,
      GOLD,
      "tassel suspension",
    );
    ball([x, 1.439, 0.295], 0.0055, GOLD, [1, 0.8, 0.75], "tassel knot");
    b.part(new THREE.ConeGeometry(0.008, 0.023, 6), GOLD, {
      at: [x, 1.426, 0.295],
      bone: cabinet,
      name: "silk runner gold tassel",
    });
  }

  // Armillary scrying instrument.
  const orbX = 0.075;
>>>>>>> REPLACE

<<<<<<< SEARCH
  candle(0.628, 0.969, 0.082, 0.175);
=======
  candle(0.580, 0.969, 0.155, 0.175);
>>>>>>> REPLACE

<<<<<<< SEARCH
  flatBook(-0.614, 0.105, 0.422, C.ultramarine, -8);
  flatBook(-0.601, 0.185, 0.423, C.red, 7);

  for (let i = 0; i < 4; i++) {
=======
  flatBook(-0.614, 0.105, 0.422, C.ultramarine, -8);

  const OPEN_PAGES = svg(
    `<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="400" fill="#eddfbd"/>
      <path d="M23 22H294V378H23ZM346 22H617V378H346Z"
        fill="none" stroke="#b49a70" stroke-width="2.5"/>
      <path d="M31 30H286V370H31ZM354 30H609V370H354Z"
        fill="none" stroke="#d1b88c" stroke-width="1.5"/>
      <path d="M304 0H320V400H304Z" fill="#d2b98f"/>
      <path d="M320 0H334V400H320Z" fill="#dfcba5"/>
      <text x="159" y="62" text-anchor="middle" font-family="serif"
        font-size="22" letter-spacing="3" fill="#694d70">ORBIS LUNAE</text>
      <path d="M67 76H251" stroke="#b28a51" stroke-width="2"/>
      <g fill="none" stroke="#547f88" stroke-width="2.8">
        <circle cx="159" cy="184" r="74"/>
        <circle cx="159" cy="184" r="62" stroke-width="1.5"/>
        <ellipse cx="159" cy="184" rx="94" ry="28"
          transform="rotate(-27 159 184)"/>
        <path d="M159 96V272M71 184H247"/>
        <path d="M107 132L211 236M107 236L211 132" stroke-width="1.5"/>
      </g>
      <path d="M169 144A43 43 0 1 0 183 219A35 35 0 0 1 169 144Z"
        fill="#8c6d91"/>
      <g fill="#b48a4d">
        <path d="M225 117L229 128L240 132L229 136L225 147L221 136L210 132L221 128Z"/>
        <circle cx="93" cy="225" r="4"/>
        <circle cx="159" cy="110" r="4"/>
      </g>
      <g stroke="#92765e" stroke-width="2.7" stroke-linecap="round">
        <path d="M55 298H126M139 298H258M55 310H92M105 310H210
                 M55 322H164M179 322H258M55 334H116M129 334H242"/>
      </g>
      <text x="385" y="82" font-family="serif" font-size="48"
        fill="#8c5069">S</text>
      <path d="M380 92Q368 62 386 45Q407 49 416 34"
        fill="none" stroke="#b38b50" stroke-width="2.5"/>
      <g stroke="#7d6b60" stroke-width="3" stroke-linecap="round">
        <path d="M425 51H582M425 65H552M425 79H585
                 M378 106H448M460 106H584
                 M378 121H534M548 121H583
                 M378 136H416M429 136H581
                 M378 151H490M503 151H557
                 M378 176H458M472 176H584
                 M378 191H550M378 206H431M444 206H584
                 M378 221H489M505 221H566"/>
      </g>
      <g fill="none" stroke="#618b8b" stroke-width="2.8">
        <path d="M406 258L460 276L492 249L556 279L532 321L466 310L423 335Z"/>
        <circle cx="406" cy="258" r="5"/>
        <circle cx="460" cy="276" r="4"/>
        <circle cx="492" cy="249" r="5"/>
        <circle cx="556" cy="279" r="4"/>
        <circle cx="532" cy="321" r="5"/>
        <circle cx="466" cy="310" r="4"/>
        <circle cx="423" cy="335" r="5"/>
      </g>
      <text x="159" y="360" text-anchor="middle" font-family="serif"
        font-size="12" fill="#9c805c">XIV</text>
      <text x="481" y="360" text-anchor="middle" font-family="serif"
        font-size="12" fill="#9c805c">XV</text>
    </svg>`,
    { size: 1024 },
  );

  // The open volume rests on the remaining closed book. Its shallow valley
  // preserves the chunky primitive construction while exposing both drawings.
  const openCentre = new THREE.Vector3(-0.601, 0.185, 0.423);
  const yaw = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(0, THREE.MathUtils.degToRad(7), 0),
  );
  const openPoint = (v: V) =>
    new THREE.Vector3(...v).applyQuaternion(yaw).add(openCentre);

  for (const s of [-1, 1]) {
    const slope = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, 0, s * THREE.MathUtils.degToRad(11)),
    );
    const boardQ = yaw.clone().multiply(slope);

    b.part(new THREE.BoxGeometry(0.214, 0.012, 0.256), C.red, {
      at: openPoint([s * 0.103, 0.029, 0]),
      quat: boardQ,
      bone: cabinet,
      name: "open grimoire leather board",
    });
    b.part(new THREE.BoxGeometry(0.202, 0.018, 0.239), PAGES, {
      at: openPoint([s * 0.102, 0.044, 0]),
      quat: boardQ,
      bone: cabinet,
      name: "open grimoire page wedge",
    });

    const pageGeometry = new THREE.PlaneGeometry(0.202, 0.239);
    const uv = pageGeometry.getAttribute("uv");
    const pageIndex = s < 0 ? 0 : 1;
    for (let i = 0; i < uv.count; i++) {
      uv.setX(i, (uv.getX(i) + pageIndex) * 0.5);
    }
    b.part(pageGeometry, "#ffffff", {
      at: openPoint([s * 0.102, 0.054, 0]),
      quat: boardQ.clone().multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(-Math.PI / 2, 0, 0),
        ),
      ),
      texture: OPEN_PAGES,
      bone: cabinet,
      name: s < 0 ? "illuminated lunar diagram" : "annotated constellation page",
    });

    for (const z of [-0.121, 0.121]) {
      b.part(new THREE.BoxGeometry(0.025, 0.005, 0.024), GOLD, {
        at: openPoint([s * 0.191, 0.052, z]),
        quat: boardQ,
        bone: cabinet,
        name: "open grimoire corner protector",
      });
    }
  }

  b.sweep(
    [
      openPoint([0, 0.027, -0.129]),
      openPoint([0, 0.027, 0.129]),
    ],
    0.009,
    { color: C.red, sides: 6, bone: cabinet, name: "open grimoire spine" },
  );
  b.slab(
    [
      openPoint([-0.006, 0.034, 0.042]),
      openPoint([0.006, 0.034, 0.042]),
      openPoint([0.006, 0.034, 0.153]),
      openPoint([-0.006, 0.034, 0.153]),
    ],
    {
      thickness: 0.002,
      color: C.rose,
      bone: cabinet,
      name: "silk bookmark across page gutter",
    },
  );
  b.sweep(
    [
      openPoint([0, 0.034, 0.151]),
      openPoint([0, 0.015, 0.167]),
      openPoint([0, -0.035, 0.167]),
    ],
    0.0045,
    { color: C.rose, sides: 4, bone: cabinet, name: "trailing silk bookmark" },
  );
  b.part(new THREE.OctahedronGeometry(0.009), GOLD, {
    at: openPoint([0, -0.041, 0.167]),
    scale: [0.7, 1.4, 0.45],
    bone: cabinet,
    name: "bookmark gold pendant",
  });

  for (let i = 0; i < 4; i++) {
>>>>>>> REPLACE