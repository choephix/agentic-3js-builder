1. **Fix the suction cups.** The raised underside ribbon is swallowing their lower halves, leaving crescents. Replace it with a thin, surface-following membrane and build paired rows of clearly recessed suckers.
2. **Strengthen the rising silhouette.** Lift the rear tentacles into taller, inward-curling shapes so the eight arms no longer repeat the same shallow hook.
3. **Sharpen the expression.** Lower the inner brows, slim the nose bridge, and remove the exposed orange eye-globe edges that compete with the eye drawings.
4. **Finish the carapace.** Add broad rear armor facets and restrained luminous details so the side and rear feel as designed as the front.
5. **Improve the water connection.** Replace the chunky splash wedges with thinner, tapered splash shapes. Keep the airborne droplets—they read as intentional water, not disconnected anatomy.

<<<<<<< SEARCH
    [
      [0.64, 1.81, -0.56],
      [1.17, 1.49, -1.09],
      [1.88, 1.24, -1.57],
      [2.56, 1.44, -1.86],
      [2.88, 2.04, -1.94],
      [2.72, 2.49, -1.91],
    ],
    [
      [0.24, 1.88, -0.79],
      [0.41, 1.63, -1.48],
      [0.63, 1.65, -2.27],
      [0.9, 2.02, -2.96],
      [0.86, 2.65, -3.15],
      [0.61, 3.0, -3.03],
    ],
=======
    [
      [0.64, 1.81, -0.56],
      [1.22, 1.63, -1.03],
      [2.02, 1.81, -1.48],
      [2.72, 2.43, -1.7],
      [2.91, 3.25, -1.64],
      [2.63, 3.73, -1.48],
      [2.34, 3.63, -1.35],
    ],
    [
      [0.24, 1.88, -0.79],
      [0.43, 1.71, -1.49],
      [0.77, 1.95, -2.25],
      [1.15, 2.54, -2.81],
      [1.24, 3.25, -2.93],
      [0.98, 3.74, -2.72],
      [0.7, 3.63, -2.56],
    ],
>>>>>>> REPLACE

<<<<<<< SEARCH
  ball("face.bridge", [0, 2.68, 0.74], [0.27, 0.48, 0.23], shellPaint, head, 8);
=======
  ball("face.bridge", [0, 2.68, 0.74], [0.205, 0.38, 0.21], shellPaint, head, 8);
>>>>>>> REPLACE

<<<<<<< SEARCH
      C.eye,
      head,
      12,
    );

    glow(
=======
      C.ink,
      head,
      12,
    );

    glow(
>>>>>>> REPLACE

<<<<<<< SEARCH
        size: [0.69, 0.445],
=======
        size: [0.72, 0.475],
>>>>>>> REPLACE

<<<<<<< SEARCH
        [s * 0.22, 3.035, 0.79],
        [s * 0.49, 3.19, 0.77],
        [s * 0.97, 3.08, 0.65],
        [s * 1.12, 2.89, 0.51],
        [s * 0.86, 2.94, 0.87],
        [s * 0.4, 3.015, 0.97],
=======
        [s * 0.22, 2.955, 0.8],
        [s * 0.49, 3.17, 0.77],
        [s * 0.97, 3.12, 0.65],
        [s * 1.12, 2.96, 0.51],
        [s * 0.86, 3.0, 0.87],
        [s * 0.4, 2.94, 0.97],
>>>>>>> REPLACE

<<<<<<< SEARCH
        [s * 0.25, 3.055, 0.85],
        [s * 0.51, 3.15, 0.85],
        [s * 0.92, 3.05, 0.77],
=======
        [s * 0.25, 2.985, 0.85],
        [s * 0.51, 3.135, 0.85],
        [s * 0.92, 3.09, 0.77],
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let i = 0; i < 3; i++) {
      ball(
        `templeLight${side}${i}`,
        [s * (0.93 - i * 0.035), 3.15 + i * 0.145, 0.18 - i * 0.018],
        [0.044, 0.078, 0.039],
        C.cyan,
        mantleRig.joints[0],
        6,
      );
    }
=======
    for (let i = 0; i < 3; i++) {
      glow(
        ball(
          `templeLight${side}${i}`,
          [s * (0.93 - i * 0.035), 3.15 + i * 0.145, 0.18 - i * 0.018],
          [0.044, 0.078, 0.039],
          C.cyan,
          mantleRig.joints[0],
          6,
        ),
        0.8,
      );
    }

    plate(
      `mantleRearPanel${side}`,
      [
        [s * 0.06, 3.0, -0.91],
        [s * 0.65, 3.14, -0.82],
        [s * 0.82, 3.55, -0.69],
        [s * 0.57, 4.07, -0.76],
        [s * 0.03, 4.59, -0.65],
        [s * 0.19, 3.8, -0.98],
      ],
      s > 0 ? "#226f7b" : "#308d8e",
      mantleRig.joints[1],
      0.065,
    );

    tube(
      `mantleRearRidge${side}`,
      [
        [s * 0.63, 3.12, -0.86],
        [s * 0.77, 3.53, -0.74],
        [s * 0.51, 4.08, -0.79],
        [s * 0.06, 4.67, -0.61],
      ],
      [0.035, 0.032, 0.02, 0.004],
      C.paleJade,
      mantleRig.joints[1],
    );

    // Three broad vent marks follow the rear armor rather than adding
    // small, noisy scales across the silhouette.
    for (let i = 0; i < 3; i++) {
      const y = 3.26 + i * 0.19;
      const width = 0.39 - i * 0.06;
      tube(
        `mantleRearVent${side}${i}`,
        [
          [s * 0.24, y, -0.985],
          [s * width, y + 0.045, -0.95],
          [s * (width + 0.17), y + 0.11, -0.87],
        ],
        [0.035, 0.031, 0.008],
        C.ink,
        mantleRig.joints[1],
      );
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(tentacle.line(cupAngle, -0.018).slice(0.07, 0.94), [0.18, 0.025], {
      color: underside,
      bone: chain,
      sides: 6,
      smooth: false,
      name: `tentacle${label}.innerRibbon`,
    });

    for (let i = 0; i < 8; i++) {
      const t = 0.13 + i * 0.103;
      const alternate = i % 2 === 0 ? -15 : 15;
      const hit = tentacle.at(t, cupAngle + alternate);
      const r = 0.174 * Math.pow(1 - t, 0.8) + 0.025;
      const h = r * 0.43;

      b.stick(
        new THREE.CylinderGeometry(r * 0.94, r * 0.68, h, 8),
        cupPaint,
        hit,
        {
          embed: 0.18,
          name: `tentacle${label}.cup${i + 1}.foot`,
        },
      );

      const rimFrame = hit.moved([0, h * 0.75, 0]);
      const rimGeo = new THREE.TorusGeometry(r * 0.76, r * 0.2, 4, 10);
      rimGeo.rotateX(-Math.PI / 2);
      b.stick(rimGeo, C.salmon, rimFrame, {
        embed: 0.05,
        name: `tentacle${label}.cup${i + 1}.lip`,
      });

      const discGeo = new THREE.CircleGeometry(r * 0.69, 12);
      discGeo.rotateX(-Math.PI / 2);
      b.stick(discGeo, "#ffffff", hit.moved([0, h * 0.79, 0]), {
        texture: cupDrawing,
        embed: 0,
        name: `tentacle${label}.cup${i + 1}.throat`,
      });
    }
=======
    // The underside is a thin skin between two actual surface paths.
    // Unlike a second thick tube, it cannot engulf the suckers.
    b.membrane(
      tentacle.line(cupAngle - 58, 0.006).slice(0.07, 0.97),
      tentacle.line(cupAngle + 58, 0.006).slice(0.07, 0.97),
      {
        color: underside,
        bone: chain,
        thickness: 0.012,
        rows: 5,
        cols: 22,
        name: `tentacle${label}.innerRibbon`,
      },
    );

    for (let i = 0; i < 7; i++) {
      const t = 0.15 + i * 0.123;
      const rows = i < 5 ? [-33, 33] : [0];

      for (let row = 0; row < rows.length; row++) {
        const hit = tentacle.at(t, cupAngle + rows[row]);
        const r = (i < 5 ? 0.137 : 0.16) * Math.pow(1 - t, 0.8) + 0.02;
        const h = r * 0.52;
        const name = `tentacle${label}.cup${i + 1}_${row + 1}`;

        b.stick(
          new THREE.CylinderGeometry(r * 0.89, r * 0.66, h, 8),
          cupPaint,
          hit,
          {
            embed: 0.13,
            name: `${name}.foot`,
          },
        );

        const rimGeo = new THREE.TorusGeometry(r * 0.73, r * 0.19, 4, 10);
        rimGeo.rotateX(-Math.PI / 2);
        b.stick(rimGeo, C.salmon, hit.moved([0, h * 0.57, 0]), {
          embed: 0,
          name: `${name}.lip`,
        });

        const discGeo = new THREE.CircleGeometry(r * 0.69, 12);
        discGeo.rotateX(-Math.PI / 2);
        b.stick(discGeo, "#ffffff", hit.moved([0, h * 0.6, 0]), {
          texture: cupDrawing,
          embed: 0,
          name: `${name}.throat`,
        });
      }
    }
>>>>>>> REPLACE

<<<<<<< SEARCH
    const height = 0.31 + random() * 0.46;
    const base = [x * r, 0.285, z * r];
    const lean = 0.18 + random() * 0.18;
    const width = 0.12 + random() * 0.11;

    const splash = b.extrude(
      [
        [-width, 0],
        [width, 0],
        [lean + width * 0.5, height * 0.65],
        [lean, height],
        [lean - width * 0.4, height * 0.83],
        [-width * 0.65, height * 0.29],
      ],
      {
        at: base,
        x: [z, 0, -x],
        y: [x * 0.22, 1, z * 0.22],
        thickness: 0.045,
        color: i % 3 === 0 ? "#4faeb4" : "#246b82",
        bone: core,
        name: `water.splashBlade${i + 1}`,
      },
    );

    const tip = splash.local([lean, height * 0.96, 0.028]);
=======
    const height = 0.36 + random() * 0.51;
    const base = [x * r, 0.285, z * r];
    const lean = 0.2 + random() * 0.2;
    const width = 0.075 + random() * 0.065;

    const splash = b.extrude(
      [
        [-width, 0],
        [width, 0],
        [width * 0.82, height * 0.3],
        [lean * 0.7 + width * 0.3, height * 0.76],
        [lean, height, "sharp"],
        [lean * 0.65 - width * 0.24, height * 0.75],
        [-width * 0.45, height * 0.25],
      ],
      {
        at: base,
        x: [z, 0, -x],
        y: [x * 0.22, 1, z * 0.22],
        thickness: [0.035, 0.008],
        smoothing: 1,
        color: i % 3 === 0 ? "#4faeb4" : "#246b82",
        bone: core,
        name: `water.splashBlade${i + 1}`,
      },
    );

    const tip = splash.local([lean, height * 0.96, 0.015]);

    const root = splash.local([width * 0.7, height * 0.12, 0.023]);
    const middle = splash.local([
      lean * 0.7 + width * 0.2,
      height * 0.73,
      0.014,
    ]);
    b.sweep(
      bezier(root, middle, tip),
      [0.018, 0.004],
      {
        color: C.foam,
        bone: core,
        sides: 5,
        smooth: false,
        name: `water.splashHighlight${i + 1}`,
      },
    );
>>>>>>> REPLACE