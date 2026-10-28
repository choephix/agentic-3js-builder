<!-- call: plan -->

```json
{
  "name": "Neon Cabinet '84",
  "description": "A synthwave-styled 1980s upright arcade cabinet with glowing marquee, angled screen, joystick control panel and neon side-art.",
  "builderName": "neonArcadeCabinet",
  "size": [0.76, 1.85, 0.95],
  "layout": "Classic upright cabinet. Width 0.76 (x), height 1.85, depth 0.95 (z), +Z is the front. A tall side-profile silhouette: a narrow base plinth at the floor, a front-facing lower body with coin door, a control panel sticking out forward at y~1.0 (a sloped deck, slightly tilted up toward the player), a screen bezel recessed above it leaning back about 12 degrees, and a marquee box on top, with the cabinet back being a plain vertical panel. The sides are dark navy-purple panels with big synthwave art: a magenta-to-cyan striped sun disc, a neon grid horizon and cyan/magenta diagonal stripes, built as small flat parts seated on the side faces (x=+-0.38). Neon cyan and magenta edge trim runs round the side panel edges and the marquee. Glowing parts (marquee, screen, buttons, coin slots, trim) use the glow kit. All surfaces are flat colours.",
  "palette": {
    "body": "#1b1033",
    "bodyDark": "#10081f",
    "bodyLight": "#2c1a52",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bd6",
    "neonPink": "#ff6ec7",
    "sunYellow": "#ffd23f",
    "sunOrange": "#ff7a3d",
    "gridPurple": "#7a2cff",
    "black": "#07040d",
    "screenGlow": "#2a1a6e",
    "screenLine": "#6df7ff",
    "chrome": "#c9cde0",
    "metalDark": "#3a3550",
    "buttonRed": "#ff3355",
    "buttonBlue": "#3b7bff",
    "buttonYellow": "#ffe14a",
    "coinRed": "#d3203f",
    "white": "#f4f0ff"
  },
  "mounts": {
    "plinthTop": [0, 0.12, 0],
    "coinDoorCentre": [0, 0.55, 0.43],
    "controlDeckFront": [0, 1.0, 0.47],
    "controlDeckBack": [0, 0.98, 0.2],
    "screenCentre": [0, 1.3, 0.2],
    "marqueeCentre": [0, 1.7, 0.12],
    "sideLeft": [0.38, 0.9, 0],
    "sideRight": [-0.38, 0.9, 0]
  },
  "joints": [],
  "parts": [
    {
      "id": "cabinetShell",
      "builds": "Main body: two side panels (profile extruded: tall with angled front step down to the control deck, sloped cutout for the screen, rounded back top), back panel, base plinth with kick plate, interior-hidden front lower panel, top cap under the marquee, bottom trim. Side panels are body colour with bodyLight edge bevel strips, neon cyan and magenta edge piping run along front edges and the plinth top. Feet in black. Back has vent slots in bodyDark and a small power-plug panel in metalDark.",
      "box": [[-0.38, 0, -0.475], [0.38, 1.6, 0.475]],
      "attaches": "Rests on floor; control deck sits on sideLeft/sideRight at controlDeckFront; marquee seats on top at marqueeCentre; coin door sits at coinDoorCentre.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "sideArt",
      "builds": "Synthwave artwork on both outer side faces (x=+-0.385 outward): a big striped sunset disc (yellow to orange to magenta bands with horizontal gaps) built from stacked disc/segment extrudes, a perspective neon grid floor in gridPurple/neonCyan lines below the horizon, two or three diagonal cyan and magenta speed stripes, small white stars and a pair of black mountain silhouettes in zigzag. Mirrored for both sides, kept thin (about 5mm) and seated on the side panels.",
      "box": [[-0.395, 0.1, -0.45], [0.395, 1.6, 0.45]],
      "attaches": "Sits on sideLeft and sideRight mounts, flush on the side panels of cabinetShell.",
      "joints": [],
      "floor": false,
      "budget": 150
    },
    {
      "id": "controlPanel",
      "builds": "Sloped control deck jutting forward at y~1.0 to z=0.47: deck slab in bodyLight with neonMagenta front lip and chrome edge trim, a ball-top joystick (base plate, shaft, red ball) on the left of the centre, a cluster of six glowing round buttons in red/blue/yellow on the right, two small player-start buttons, a sticker strip with white text-like blocks and neon lines, and screw heads. Below the deck a front fascia panel with the coin door: two coin slots in coinRed housing with glowing slits, a return tray in black, a metal-dark door frame with neon cyan outline, and a lock.",
      "box": [[-0.37, 0.3, 0.2], [0.37, 1.05, 0.48]],
      "attaches": "Deck back edge at controlDeckBack, front at controlDeckFront; coin door centred at coinDoorCentre on the cabinetShell front.",
      "joints": [],
      "floor": false,
      "budget": 200
    },
    {
      "id": "screenAssembly",
      "builds": "Recessed CRT section: black bezel frame leaning back about 12 degrees, a glowing screen plane in screenGlow with a synthwave scene (small sun disc, grid lines in screenLine, horizon glow, pixel spaceship and a few alien invaders blocks) and subtle scanline strips, a curved glass look from a slightly larger transparent-looking lighter plate border, bezel inner trim in neonCyan, a speaker grille with slots below the marquee, and the chrome-like corner brackets.",
      "box": [[-0.34, 1.05, 0.05], [0.34, 1.55, 0.4]],
      "attaches": "Centred on screenCentre; bottom meets controlDeckBack, top tucks under marquee.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "marquee",
      "builds": "Top marquee box: a slightly deeper black housing with bevelled front, a bright glowing backlit title panel in neonMagenta to neonCyan bands with big blocky letter-like shapes spelling an arcade title in white and sunYellow built from small boxes, a small sun and grid motif at each end, neon tube outline round the panel edge in neonPink and neonCyan, a top cap with ventilation fins, and two tiny corner lights on top.",
      "box": [[-0.38, 1.6, -0.475], [0.38, 1.85, 0.4]],
      "attaches": "Sits on top of cabinetShell at marqueeCentre; front face above screenAssembly.",
      "joints": [],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: marquee -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildMarquee({ b, J, P, M }: Ctx) {
  // ---------------------------------------------------------------- helpers
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const lit = <T,>(t: T, s = 1) => glow(t as any, s) as T;
  const tube = (p: number[], q: number[], r: number, color: string, s = 1.2) =>
    lit(b.capsule(p, q, r, color, { sides: 6 }), s);
  // neon rectangle in a z-plane (front) or an x-plane (side)
  const rectFront = (cx: number, cy: number, w: number, h: number, z: number, r: number, color: string, s = 1.2) => {
    const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
    tube([x0, y1, z], [x1, y1, z], r, color, s);
    tube([x0, y0, z], [x1, y0, z], r, color, s);
    tube([x0, y0, z], [x0, y1, z], r, color, s);
    tube([x1, y0, z], [x1, y1, z], r, color, s);
  };
  const rectSide = (x: number, z0: number, z1: number, y0: number, y1: number, r: number, color: string, s = 1.2) => {
    tube([x, y1, z0], [x, y1, z1], r, color, s);
    tube([x, y0, z0], [x, y0, z1], r, color, s);
    tube([x, y0, z0], [x, y1, z0], r, color, s);
    tube([x, y0, z1], [x, y1, z1], r, color, s);
  };
  const merged = (geos: THREE.BufferGeometry[], color: string, s = 1) => {
    const g = mergeGeometries(geos)!;
    return lit(b.part(g, color, { at: [0, 0, 0] }), s);
  };

  // ---------------------------------------------------------------- housing (side-profile extrude, bevelled front)
  const BASE = 1.6;
  b.extrude(
    [
      [-0.475, 0],
      [0.36, 0],
      [0.4, 0.025],
      [0.4, 0.195],
      [0.36, 0.22],
      [-0.44, 0.22],
      [-0.475, 0.19],
    ],
    { at: [0, BASE, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.76, color: P.black },
  );
  // bottom lip where it meets the cabinet
  box(0.77, 0.012, 0.85, P.metalDark, 0, 1.606, -0.055);

  // ---------------------------------------------------------------- top cap + vent fins + corner lights
  box(0.76, 0.016, 0.83, P.metalDark, 0, 1.828, -0.055);
  box(0.74, 0.003, 0.012, P.bodyLight, 0, 1.8375, 0.345);
  for (let i = 0; i < 11; i++) {
    const z = -0.42 + i * 0.062;
    box(0.6, 0.012, 0.01, P.bodyDark, 0, 1.841, z);
    box(0.6, 0.002, 0.012, P.bodyLight, 0, 1.8475, z);
  }
  const corner: [number, string][] = [
    [0.34, P.neonCyan],
    [-0.34, P.neonPink],
  ];
  for (const [x, c] of corner) {
    b.part(new THREE.CylinderGeometry(0.011, 0.013, 0.006, 8), P.chrome, { at: [x, 1.838, 0.325] });
    lit(
      b.part(new THREE.SphereGeometry(0.0075, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), c, {
        at: [x, 1.8405, 0.325],
      }),
      1.6,
    );
  }

  // ---------------------------------------------------------------- front bezel frame
  const FY = 1.71;
  const FZ = 0.4;
  box(0.02, 0.17, 0.01, P.metalDark, 0.35, FY, FZ + 0.005);
  box(0.02, 0.17, 0.01, P.metalDark, -0.35, FY, FZ + 0.005);
  box(0.72, 0.015, 0.01, P.metalDark, 0, FY + 0.0775, FZ + 0.005);
  box(0.72, 0.015, 0.01, P.metalDark, 0, FY - 0.0775, FZ + 0.005);
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 8), P.chrome, {
        at: [sx * 0.35, FY + sy * 0.0775, FZ + 0.0115],
        dir: [0, 0, 1],
      });

  // ---------------------------------------------------------------- backlit title panel, magenta -> cyan bands
  const cMag = new THREE.Color(P.neonMagenta);
  const cCy = new THREE.Color(P.neonCyan);
  const PH = 0.14;
  const bandH = PH / 6;
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const col = "#" + cMag.clone().lerp(cCy, t).getHexString();
    const y = FY + PH / 2 - bandH * (i + 0.5);
    lit(box(0.68, bandH + 0.0004, 0.006, col, 0, y, FZ + 0.003), 1.15);
  }

  // neon tube outlines
  rectFront(0, FY, 0.7, 0.155, FZ + 0.0115, 0.0035, P.neonPink, 1.4);
  rectFront(0, FY, 0.676, 0.136, FZ + 0.0085, 0.0022, P.neonCyan, 1.4);

  // ---------------------------------------------------------------- blocky title "NEON"
  const FONT: Record<string, string[]> = {
    N: ["10001", "11001", "10101", "10101", "10011", "10001", "10001"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  };
  const word = "NEON";
  const c = 0.0145;
  const totalW = word.length * 6 * c - c;
  const x0 = -totalW / 2;
  const layer = (dx: number, dy: number, z: number, depth: number) => {
    const geos: THREE.BufferGeometry[] = [];
    [...word].forEach((ch, li) => {
      const rows = FONT[ch];
      rows.forEach((row, r) => {
        let k = 0;
        while (k < 5) {
          if (row[k] !== "1") {
            k++;
            continue;
          }
          let n = 1;
          while (k + n < 5 && row[k + n] === "1") n++;
          const w = n * c;
          const cx = x0 + li * 6 * c + (k + n / 2) * c + dx;
          const cy = FY + 3.5 * c - (r + 0.5) * c + dy;
          geos.push(new THREE.BoxGeometry(w, c, depth).translate(cx, cy, z));
          k += n;
        }
      });
    });
    return geos;
  };
  merged(layer(0.0045, -0.0045, FZ + 0.0075, 0.003), P.black, 0.3);
  merged(layer(0.0024, -0.0024, FZ + 0.0095, 0.003), P.sunYellow, 1.2);
  merged(layer(0, 0, FZ + 0.0125, 0.003), P.white, 1.3);
  // yellow rules above and below the title
  lit(box(0.36, 0.004, 0.003, P.sunYellow, 0, FY + 0.0545, FZ + 0.0075), 1.2);
  lit(box(0.36, 0.004, 0.003, P.sunYellow, 0, FY - 0.0555, FZ + 0.0075), 1.2);

  // ---------------------------------------------------------------- end motifs: sun + grid on a dark badge
  const SUN_Y = 1.718;
  const R = 0.04;
  for (const sx of [1, -1]) {
    const mx = sx * 0.28;
    box(0.112, 0.12, 0.0016, P.bodyDark, mx, FY, FZ + 0.0068);
    // sun half-disc
    lit(
      b.part(new THREE.CircleGeometry(R, 14, 0, Math.PI), P.sunYellow, { at: [mx, SUN_Y, FZ + 0.0086] }),
      1.3,
    );
    for (const h of [0.011, 0.023]) {
      const w = 2 * Math.sqrt(R * R - h * h) * 0.99;
      lit(box(w, 0.0045, 0.001, P.sunOrange, mx, SUN_Y + h, FZ + 0.0092), 1.3);
    }
    // horizon line
    lit(box(0.108, 0.003, 0.0015, P.neonCyan, mx, SUN_Y - 0.001, FZ + 0.0092), 1.4);
    // perspective grid
    for (let k = -3; k <= 3; k++)
      lit(
        b.rod([mx + k * 0.005, SUN_Y - 0.003, FZ + 0.0088], [mx + k * 0.0165, 1.655, FZ + 0.0088], 0.0012, P.neonMagenta, {
          sides: 4,
        }),
        1.1,
      );
    [0.013, 0.026, 0.039, 0.052].forEach((d) => {
      const y = SUN_Y - d;
      const hw = 0.02 + (d / 0.063) * 0.033;
      lit(box(hw * 2, 0.0022, 0.0015, P.neonMagenta, mx, y, FZ + 0.0092), 1.1);
    });
    // stars
    for (const [dx, y] of [
      [-0.044, 1.755],
      [0.046, 1.752],
      [-0.03, 1.766],
      [0.02, 1.767],
    ])
      lit(box(0.004, 0.004, 0.0015, P.white, mx + dx, y, FZ + 0.0088), 1.4);
  }

  // ---------------------------------------------------------------- bevel neon strips + front corner trim
  tube([-0.37, 1.81, 0.3816], [0.37, 1.81, 0.3816], 0.0028, P.neonCyan, 1.3);
  tube([-0.37, 1.6099, 0.3816], [0.37, 1.6099, 0.3816], 0.0028, P.neonMagenta, 1.3);
  for (const sx of [1, -1]) {
    tube([sx * 0.378, 1.628, 0.4], [sx * 0.378, 1.792, 0.4], 0.0028, sx > 0 ? P.neonCyan : P.neonMagenta, 1.2);
  }

  // ---------------------------------------------------------------- side panels with neon outline
  for (const sx of [1, -1]) {
    box(0.003, 0.15, 0.74, P.bodyLight, sx * 0.3795, 1.71, -0.05);
    rectSide(sx * 0.3815, -0.4, 0.32, 1.646, 1.774, 0.002, sx > 0 ? P.neonMagenta : P.neonCyan, 1.2);
    // small stripe motif
    lit(box(0.002, 0.012, 0.16, P.neonCyan, sx * 0.382, 1.725, -0.2), 1.1);
    lit(box(0.002, 0.012, 0.11, P.neonMagenta, sx * 0.382, 1.700, -0.225), 1.1);
    lit(box(0.002, 0.012, 0.07, P.sunYellow, sx * 0.382, 1.675, -0.245), 1.1);
  }

  // ---------------------------------------------------------------- back: vent slots and a tiny label
  const r = rng(84);
  for (let i = 0; i < 6; i++) {
    const y = 1.655 + i * 0.022;
    box(0.2, 0.008, 0.004, P.metalDark, -0.15, y, -0.4765);
    box(0.2, 0.002, 0.005, P.black, -0.15, y, -0.4768);
  }
  box(0.1, 0.06, 0.004, P.metalDark, 0.2, 1.7, -0.4765);
  for (let i = 0; i < 4; i++) box(0.06 * (0.5 + r() * 0.5), 0.004, 0.005, P.chrome, 0.2 - 0.015, 1.72 - i * 0.012, -0.4768);
}
```

<!-- call: cabinetShell -->

```ts
import * as THREE from "three";
import { polyline } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCabinetShell({ b, J, P, M }: Ctx) {
  void J;
  void M;

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    at: [number, number, number],
    dir: [number, number, number],
    color: string,
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir });

  type P2 = [number, number];

  // Moves every vertex of a counter-clockwise (z, y) polygon inward by d with mitred corners.
  const inset = (pts: P2[], d: number): P2[] => {
    const n = pts.length;
    return pts.map((cur, i) => {
      const prev = pts[(i - 1 + n) % n];
      const next = pts[(i + 1) % n];
      const norm = (a: P2, c: P2): P2 => {
        const dx = c[0] - a[0];
        const dy = c[1] - a[1];
        const l = Math.hypot(dx, dy) || 1;
        return [-dy / l, dx / l];
      };
      const n1 = norm(prev, cur);
      const n2 = norm(cur, next);
      let mx = n1[0] + n2[0];
      let my = n1[1] + n2[1];
      const ml = Math.hypot(mx, my) || 1;
      mx /= ml;
      my /= ml;
      const k = d / Math.max(0.3, mx * n1[0] + my * n1[1]);
      return [cur[0] + mx * k, cur[1] + my * k] as P2;
    });
  };

  const to3 = (pts: P2[], x: number): [number, number, number][] => pts.map(([z, y]) => [x, y, z]);

  // ---------- side profile (z, y), counter-clockwise ----------
  const O: P2[] = [
    [-0.475, 0.06],
    [0.36, 0.06],
    [0.44, 0.14],
    [0.47, 0.2],
    [0.47, 1.0],
    [0.4, 1.06],
    [0.3, 1.6],
    [-0.43, 1.6],
    [-0.475, 1.55],
  ];
  const bevelPath = inset(O, 0.012);
  const pipePath = inset(O, 0.03);

  for (const s of [1, -1]) {
    // side panel
    b.extrude(O as any, { at: [s * 0.365, 0, 0], x: [0, 0, 1], thickness: 0.03, color: P.body });

    // bodyLight bevel strip around the perimeter
    b.sweep(polyline(to3(bevelPath, s * 0.376), { closed: true }), 0.0055, {
      color: P.bodyLight,
      sides: 6,
      smooth: false,
    });

    // black T-molding on the front edge
    b.sweep(polyline(to3(O.slice(2, 7), s * 0.365)), 0.011, { color: P.black, sides: 6 });

    // neon piping
    const x = s * 0.378;
    glow(
      b.sweep(polyline(to3(pipePath.slice(2, 7), x)), 0.005, { color: P.neonCyan, sides: 6 }),
      1.3,
    );
    glow(
      b.sweep(polyline(to3([pipePath[7], pipePath[8], pipePath[0]], x)), 0.005, {
        color: P.neonCyan,
        sides: 6,
      }),
      1.3,
    );
    glow(
      b.sweep(polyline(to3(pipePath.slice(0, 3), x)), 0.005, { color: P.neonMagenta, sides: 6 }),
      1.3,
    );
    glow(
      b.sweep(polyline(to3([pipePath[6], pipePath[7]], x)), 0.005, { color: P.neonMagenta, sides: 6 }),
      1.3,
    );

    // chrome bolts on the side panel
    for (const [z, y] of [
      [0.405, 0.45],
      [0.405, 0.8],
      [-0.41, 0.45],
      [-0.41, 1.3],
    ]) {
      cyl(0.01, 0.01, 0.006, 6, [s * 0.381, y, z], [s, 0, 0], P.chrome);
    }

    // black leveling feet with chrome stems
    for (const z of [-0.38, 0.3]) {
      cyl(0.035, 0.04, 0.025, 8, [s * 0.3, 0.0125, z], [0, 1, 0], P.black);
      cyl(0.012, 0.012, 0.02, 6, [s * 0.3, 0.035, z], [0, 1, 0], P.chrome);
    }

    // front fascia posts
    box(0.02, 0.82, 0.02, s * 0.34, 0.55, 0.435, P.bodyLight);
  }

  // ---------- plinth, kick plate ----------
  box(0.72, 0.1, 0.8, 0, 0.09, -0.04, P.bodyDark);
  box(0.68, 0.1, 0.02, 0, 0.09, 0.375, P.black);
  b.rod([-0.34, 0.14, 0.385], [0.34, 0.14, 0.385], 0.004, P.chrome, { sides: 6 });
  glow(box(0.68, 0.01, 0.01, 0, 0.15, 0.436, P.neonMagenta), 1.3);

  // ---------- front lower panel (behind the coin door), shelf and top cap ----------
  box(0.7, 0.82, 0.04, 0, 0.55, 0.41, P.body);
  box(0.7, 0.02, 0.84, 0, 0.96, -0.02, P.bodyDark);
  box(0.7, 0.02, 0.7, 0, 1.59, -0.065, P.bodyDark);
  box(0.72, 0.008, 0.008, 0, 1.596, 0.288, P.bodyLight);
  glow(box(0.7, 0.004, 0.004, 0, 1.584, 0.29, P.neonCyan), 1.2);
  // back top cap filling the rounded corner between the sides
  box(0.7, 0.05, 0.04, 0, 1.575, -0.455, P.body);

  // ---------- back panel ----------
  box(0.7, 1.49, 0.03, 0, 0.805, -0.46, P.body);
  b.rod([-0.35, 0.07, -0.476], [0.35, 0.07, -0.476], 0.006, P.bodyLight, { sides: 6 });

  // vent plate and slots
  box(0.34, 0.2, 0.006, 0, 1.34, -0.478, P.metalDark);
  for (let i = 0; i < 9; i++) box(0.28, 0.01, 0.004, 0, 1.26 + i * 0.018, -0.4815, P.black);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    cyl(0.007, 0.007, 0.005, 6, [sx * 0.15, 1.34 + sy * 0.085, -0.4825], [0, 0, -1], P.chrome);
  }

  // rear access door frame
  const dz = -0.4775;
  box(0.52, 0.012, 0.006, 0, 1.1, dz, P.bodyLight);
  box(0.52, 0.012, 0.006, 0, 0.5, dz, P.bodyLight);
  box(0.012, 0.6, 0.006, 0.25, 0.8, dz, P.bodyLight);
  box(0.012, 0.6, 0.006, -0.25, 0.8, dz, P.bodyLight);
  for (const sx of [-1, 1]) for (const y of [0.54, 1.06]) {
    cyl(0.008, 0.008, 0.005, 6, [sx * 0.21, y, dz - 0.002], [0, 0, -1], P.chrome);
  }
  box(0.04, 0.1, 0.012, 0.19, 0.8, dz - 0.003, P.chrome);
  cyl(0.013, 0.013, 0.008, 8, [-0.19, 0.8, dz - 0.003], [0, 0, -1], P.chrome);
  box(0.006, 0.014, 0.004, -0.19, 0.8, dz - 0.008, P.black);

  // power-plug panel
  box(0.16, 0.12, 0.006, 0.2, 0.3, -0.478, P.metalDark);
  box(0.06, 0.04, 0.006, 0.17, 0.31, -0.483, P.black);
  box(0.03, 0.02, 0.006, 0.23, 0.335, -0.483, P.buttonRed);
  cyl(0.011, 0.011, 0.008, 8, [0.23, 0.29, -0.483], [0, 0, -1], P.chrome);
  glow(box(0.01, 0.01, 0.005, 0.145, 0.265, -0.483, P.neonCyan), 1.5);
  for (const [px, py] of [
    [0.13, 0.35],
    [0.27, 0.25],
  ]) {
    cyl(0.006, 0.006, 0.005, 6, [px, py, -0.483], [0, 0, -1], P.chrome);
  }
  // power cable
  b.sweep(
    [
      [0.17, 0.31, -0.485],
      [0.17, 0.29, -0.494],
      [0.17, 0.15, -0.494],
      [0.13, 0.02, -0.494],
    ],
    0.007,
    { color: P.black, sides: 6 },
  );
}
```

<!-- call: sideArt -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildSideArt({ b, P }: Ctx) {
  // ---------------------------------------------------------------------------------------------
  // Side-art space: (z, y) on the side face. Every layer is a thin slab seated on the side panel;
  // each colour (and glow strength) is merged across both sides into one part.
  // ---------------------------------------------------------------------------------------------
  type Pt = [number, number];
  const FACE = 0.381; // just inside the 0.38/0.385 panel face
  const layer = (i: number) => ({
    x: FACE + (i === 0 ? 0 : 0.002 + (i - 1) * 0.001),
    t: i === 0 ? 0.002 : 0.001,
  });

  // Own colours (4) on top of the palette.
  const DUSK = "#a0239e";
  const SKY_MID = "#4a1a7a";
  const SKY_LOW = "#35165f";
  const FLOOR = "#14072e";

  const buckets = new Map<string, { color: string; glow: number; geos: THREE.BufferGeometry[] }>();

  const dedupe = (pts: Pt[]) => {
    const out: Pt[] = [];
    for (const p of pts) {
      const q = out[out.length - 1];
      if (!q || Math.hypot(q[0] - p[0], q[1] - p[1]) > 1e-5) out.push(p);
    }
    while (out.length > 1 && Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) < 1e-5)
      out.pop();
    return out;
  };

  // Add a flat shape (outline in z,y) on both sides at a layer.
  const add = (color: string, glowS: number, outline: Pt[], li: number) => {
    const pts = dedupe(outline);
    if (pts.length < 3) return;
    const L = layer(li);
    const key = `${color}|${glowS}`;
    let bucket = buckets.get(key);
    if (!bucket) buckets.set(key, (bucket = { color, glow: glowS, geos: [] }));
    for (const s of [1, -1]) {
      const shape = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(s === 1 ? -z : z, y)));
      const geo = new THREE.ExtrudeGeometry(shape, { depth: L.t, bevelEnabled: false, curveSegments: 1 });
      geo.rotateY((s * Math.PI) / 2);
      geo.translate(s * L.x, 0, 0);
      bucket.geos.push(geo);
    }
  };

  const rect = (z0: number, y0: number, z1: number, y1: number): Pt[] => [
    [z0, y0],
    [z1, y0],
    [z1, y1],
    [z0, y1],
  ];

  // A thin line as a quad, extended by its half width so joined corners close up.
  const lineQuad = (a: Pt, c: Pt, w: number): Pt[] => {
    const dz = c[0] - a[0];
    const dy = c[1] - a[1];
    const len = Math.hypot(dz, dy) || 1;
    const ux = dz / len;
    const uy = dy / len;
    const p0: Pt = [a[0] - ux * w, a[1] - uy * w];
    const p1: Pt = [c[0] + ux * w, c[1] + uy * w];
    const nx = -uy * w;
    const ny = ux * w;
    return [
      [p0[0] + nx, p0[1] + ny],
      [p1[0] + nx, p1[1] + ny],
      [p1[0] - nx, p1[1] - ny],
      [p0[0] - nx, p0[1] - ny],
    ];
  };

  const sparkle = (cz: number, cy: number, arm: number): Pt[] => {
    const w = arm * 0.28;
    return [
      [cz, cy + arm],
      [cz + w, cy + w],
      [cz + arm, cy],
      [cz + w, cy - w],
      [cz, cy - arm],
      [cz - w, cy - w],
      [cz - arm, cy],
      [cz - w, cy + w],
    ];
  };

  // ---------------------------------------------------------------------------------------------
  // Layout constants
  // ---------------------------------------------------------------------------------------------
  const HORIZON = 0.72;
  const SUN_C: Pt = [-0.15, 0.95];
  const SUN_R = 0.25;

  // L0 backdrop: L-shaped dark panel (full width low, set back above the control deck).
  add(
    P.bodyDark,
    0,
    [
      [-0.44, 0.14],
      [0.44, 0.14],
      [0.44, 0.95],
      [0.14, 0.95],
      [0.14, 1.5],
      [-0.41, 1.5],
      [-0.44, 1.47],
    ],
    0,
  );

  // L1 sky, in dusk bands from the horizon glow up into night.
  add(DUSK, 0.35, rect(-0.42, HORIZON, 0.42, 0.8), 1);
  add(
    SKY_MID,
    0,
    [
      [-0.42, 0.8],
      [0.42, 0.8],
      [0.42, 0.935],
      [0.124, 0.935],
      [0.124, 1.0],
      [-0.42, 1.0],
    ],
    1,
  );
  add(SKY_LOW, 0, rect(-0.42, 1.0, 0.12, 1.2), 1);
  add(
    P.body,
    0,
    [
      [-0.42, 1.2],
      [0.12, 1.2],
      [0.12, 1.478],
      [-0.4, 1.478],
      [-0.42, 1.455],
    ],
    1,
  );
  // Floor base
  add(FLOOR, 0, rect(-0.42, 0.17, 0.42, HORIZON), 1);

  // L2 sun halo (clipped at horizon)
  {
    const pts: Pt[] = [];
    const R = SUN_R + 0.015;
    const n = 30;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([SUN_C[0] + Math.sin(a) * R, Math.max(HORIZON, SUN_C[1] + Math.cos(a) * R)]);
    }
    add(DUSK, 0.45, pts, 2);
  }

  // L2 floor grid: radiating lines converge on the horizon; horizontals bunch up toward it.
  for (let k = -7; k <= 7; k++) {
    const zb = k * 0.055;
    const z0 = zb * (0.02 / 0.55);
    add(
      P.gridPurple,
      1,
      [
        [z0 - 0.0005, 0.7],
        [z0 + 0.0005, 0.7],
        [zb + 0.0024, 0.172],
        [zb - 0.0024, 0.172],
      ],
      2,
    );
  }
  for (let j = 1; j <= 9; j++) {
    const f = Math.pow(j / 9, 1.7);
    const y = HORIZON - 0.53 * f;
    const hh = 0.0008 + 0.0018 * f;
    add(P.neonCyan, 1, rect(-0.42, y - hh, 0.42, y + hh), 2);
  }

  // L2 inner neon border following the L-shaped silhouette.
  {
    const path: Pt[] = [
      [-0.428, 0.152],
      [0.428, 0.152],
      [0.428, 0.938],
      [0.128, 0.938],
      [0.128, 1.488],
      [-0.4, 1.488],
      [-0.428, 1.46],
      [-0.428, 0.152],
    ];
    for (let i = 0; i < path.length - 1; i++) add(P.neonMagenta, 1, lineQuad(path[i], path[i + 1], 0.0015), 2);
  }

  // Speed stripes (tapering, rising to the right) in the upper sky.
  {
    const defs: [number, string, number][] = [
      [1.24, P.neonMagenta, 0.02],
      [1.29, P.neonCyan, 0.026],
      [1.34, P.neonMagenta, 0.018],
    ];
    for (const [ya, col, w] of defs)
      add(
        col,
        1,
        [
          [-0.42, ya],
          [0.12, ya + 0.06],
          [0.12, ya + 0.06 + w],
          [-0.42, ya + w * 0.15],
        ],
        2,
      );
    // front-block speed stripes
    add(
      P.neonCyan,
      1,
      [
        [0.16, 0.76],
        [0.42, 0.83],
        [0.42, 0.847],
        [0.16, 0.766],
      ],
      2,
    );
    add(
      P.neonMagenta,
      1,
      [
        [0.16, 0.79],
        [0.42, 0.865],
        [0.42, 0.878],
        [0.16, 0.795],
      ],
      2,
    );
  }

  // Stars
  {
    const r = rng(11);
    let placed = 0;
    let guard = 0;
    while (placed < 16 && guard++ < 400) {
      let z: number;
      let y: number;
      if (placed < 6) {
        z = -0.39 + r() * 0.47;
        y = 1.435 + r() * 0.03;
      } else if (placed < 12) {
        z = -0.4 + r() * 0.5;
        y = 0.98 + r() * 0.44;
        if (y > 1.22 && y < 1.42) continue; // keep clear of stripes
      } else {
        z = 0.18 + r() * 0.22;
        y = 0.89 + r() * 0.035;
      }
      const dist = Math.hypot(z - SUN_C[0], y - SUN_C[1]);
      if (placed < 12 && dist < SUN_R + 0.04) continue;
      const big = placed % 3 === 0;
      const arm = big ? 0.013 : 0.006;
      add(P.white, 1.2, big ? sparkle(z, y, arm) : sparkle(z, y, arm * 1.3), 2);
      placed++;
    }
  }

  // L3 sun: striped slices, gaps widening toward the horizon, yellow -> orange -> magenta.
  {
    const cols = [
      P.sunYellow,
      P.sunYellow,
      P.sunOrange,
      P.sunOrange,
      P.neonMagenta,
      P.neonMagenta,
      P.neonMagenta,
    ];
    const th = [0.075, 0.07, 0.065, 0.06, 0.055, 0.05, 0.045];
    const gp = [0.01, 0.012, 0.016, 0.02, 0.024, 0.028, 0];
    const hw = (y: number) => {
      const dy = Math.min(Math.abs(y - SUN_C[1]), SUN_R * 0.998);
      return Math.sqrt(SUN_R * SUN_R - dy * dy);
    };
    let cursor = SUN_C[1] + SUN_R;
    for (let i = 0; i < 7; i++) {
      const top = cursor;
      const bot = Math.max(top - th[i], HORIZON);
      cursor = bot - gp[i];
      if (top <= HORIZON + 0.004) break;
      const n = 4;
      const right: Pt[] = [];
      const left: Pt[] = [];
      for (let j = 0; j <= n; j++) {
        const y = top + ((bot - top) * j) / n;
        right.push([SUN_C[0] + hw(y), y]);
        left.push([SUN_C[0] - hw(y), y]);
      }
      add(cols[i], 0.65, [...right, ...left.reverse()], 3);
    }
  }

  // L3 sun reflection dashes on the grid floor
  {
    const dashes: [number, number, string][] = [
      [0.695, 0.1, P.sunYellow],
      [0.655, 0.12, P.sunYellow],
      [0.605, 0.14, P.sunOrange],
      [0.54, 0.15, P.sunOrange],
      [0.46, 0.14, P.neonMagenta],
    ];
    for (const [y, hz, col] of dashes) add(col, 0.8, rect(SUN_C[0] - hz, y - 0.004, SUN_C[0] + hz, y + 0.004), 3);
  }

  // L4 black mountain silhouettes, zigzag peaks
  const ridge: Pt[] = [
    [-0.42, 0.78],
    [-0.35, 0.87],
    [-0.31, 0.83],
    [-0.24, 0.94],
    [-0.18, 0.84],
    [-0.13, 0.87],
    [-0.07, 0.78],
    [-0.02, 0.8],
    [0.04, 0.725],
    [0.1, 0.74],
    [0.19, 0.85],
    [0.24, 0.81],
    [0.31, 0.91],
    [0.37, 0.81],
    [0.42, 0.84],
  ];
  add(P.black, 0, [...ridge, [0.42, 0.714], [-0.42, 0.714]], 4);

  // L5 neon rim along the ridge and the horizon glow line
  for (let i = 0; i < ridge.length - 1; i++) add(P.neonCyan, 1.1, lineQuad(ridge[i], ridge[i + 1], 0.0017), 5);
  add(P.neonPink, 1.2, rect(-0.42, HORIZON - 0.005, 0.42, HORIZON + 0.004), 5);

  // ---------------------------------------------------------------------------------------------
  // Emit: one part per colour/glow bucket (both sides merged).
  // ---------------------------------------------------------------------------------------------
  for (const [key, bucket] of buckets) {
    const merged = mergeGeometries(bucket.geos);
    if (!merged) continue;
    const part = b.part(merged, bucket.color, { at: [0, 0, 0], name: `sideArt.${key}` });
    if (bucket.glow > 0) glow(part, bucket.glow);
  }
}
```

<!-- call: controlPanel -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildControlPanel({ b, P, M }: Ctx) {
  const r = rng(84);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- deck frame: origin O at the middle of the deck top, d along the deck (back to front), n = surface normal ----
  const back = M.controlDeckBack;
  const front = M.controlDeckFront;
  const dy = front[1] - back[1];
  const dz = front[2] - back[2];
  const L = Math.hypot(dy, dz);
  const HL = L / 2;
  const tilt = Math.atan2(dy, dz);
  const tiltDeg = (tilt * 180) / Math.PI;
  const dDir = V(0, Math.sin(tilt), Math.cos(tilt));
  const nDir = V(0, Math.cos(tilt), -Math.sin(tilt));
  const O = V(0, (back[1] + front[1]) / 2, (back[2] + front[2]) / 2);
  const D = (u: number, v: number, lift: number) =>
    O.clone().add(V(u, 0, 0)).addScaledVector(dDir, v).addScaledVector(nDir, lift);

  // ---- helpers ----
  const put = (geo: THREE.BufferGeometry, color: string, at: THREE.Vector3, rotation: number[] = [0, 0, 0], strength = 0) => {
    const p = b.part(geo, color, { at, rotation: rotation as [number, number, number] });
    if (strength > 0) glow(p, strength);
    return p;
  };
  // parts lying on the deck: local y is the deck normal, local z runs along the deck
  const onDeck = (geo: THREE.BufferGeometry, color: string, u: number, v: number, base: number, h: number, yaw = 0, s = 0) =>
    put(geo, color, D(u, v, base + h / 2), [-tiltDeg, yaw, 0], s);
  const dBox = (w: number, h: number, d: number, color: string, u: number, v: number, base: number, yaw = 0, s = 0) =>
    onDeck(new THREE.BoxGeometry(w, h, d), color, u, v, base, h, yaw, s);
  const dCyl = (rt: number, rb: number, h: number, seg: number, color: string, u: number, v: number, base: number, s = 0) =>
    onDeck(new THREE.CylinderGeometry(rt, rb, h, seg), color, u, v, base, h, 0, s);
  // parts on the vertical front fascia
  const fBox = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, s = 0, rotZ = 0) =>
    put(new THREE.BoxGeometry(w, h, d), color, V(x, y, z), [0, 0, rotZ], s);
  const fCyl = (r0: number, h: number, seg: number, color: string, x: number, y: number, z: number, s = 0) =>
    put(new THREE.CylinderGeometry(r0, r0, h, seg), color, V(x, y, z), [90, 0, 0], s);

  // text-like runs of blocks
  const runLayout = (n: number, lo: number, hi: number, gap: number, cx: number) => {
    const ws = Array.from({ length: n }, () => lo + r() * (hi - lo));
    const total = ws.reduce((a, c) => a + c, 0) + gap * (n - 1);
    let x = cx - total / 2;
    return ws.map((w) => {
      const c = x + w / 2;
      x += w + gap;
      return { c, w };
    });
  };

  const rectOutline = (u: number, v: number, w: number, d: number, color: string, t = 0.004, base = 0.002, h = 0.004) => {
    dBox(w, h, t, color, u, v - d / 2 + t / 2, base, 0, 1.2);
    dBox(w, h, t, color, u, v + d / 2 - t / 2, base, 0, 1.2);
    dBox(t, h, d - 2 * t, color, u - w / 2 + t / 2, v, base, 0, 1.2);
    dBox(t, h, d - 2 * t, color, u + w / 2 - t / 2, v, base, 0, 1.2);
  };

  // ================= DECK SLAB =================
  dBox(0.74, 0.04, L, P.bodyLight, 0, 0, -0.04);
  dBox(0.7, 0.006, L - 0.02, P.bodyDark, 0, 0, -0.046); // shadowed underside
  // chrome trim: both sides, back edge, front top edge
  for (const s of [1, -1]) dBox(0.008, 0.01, L, P.chrome, s * 0.366, 0, 0);
  dBox(0.724, 0.01, 0.01, P.chrome, 0, -HL + 0.005, 0);
  dBox(0.724, 0.01, 0.01, P.chrome, 0, HL - 0.005, 0);
  // neon magenta front lip + cyan underline
  dBox(0.744, 0.03, 0.006, P.neonMagenta, 0, HL + 0.003, -0.03, 0, 1.3);
  dBox(0.744, 0.005, 0.008, P.neonCyan, 0, HL + 0.004, -0.0375, 0, 1.2);

  // ================= INLAYS =================
  const inlays = [
    { u: -0.17, w: 0.2, color: P.neonCyan },
    { u: 0.19, w: 0.24, color: P.neonMagenta },
  ];
  const IV = 0.02;
  const ID = 0.156;
  for (const il of inlays) {
    dBox(il.w, 0.004, ID, P.black, il.u, IV, 0);
    rectOutline(il.u, IV, il.w - 0.008, ID - 0.008, il.color);
    // corner screws
    for (const su of [-1, 1])
      for (const sv of [-1, 1])
        dCyl(0.005, 0.005, 0.004, 8, P.chrome, il.u + su * (il.w / 2 - 0.016), IV + sv * (ID / 2 - 0.016), 0.004);
  }

  // diagonal neon speed stripes outside the inlays
  for (const s of [1, -1]) {
    dBox(0.007, 0.003, 0.1, P.neonMagenta, s * 0.327, 0.0, 0, s * 20, 1.2);
    dBox(0.007, 0.003, 0.1, P.neonCyan, s * 0.346, 0.0, 0, s * 20, 1.2);
  }

  // ================= JOYSTICK (player's left = model -x) =================
  const JU = -0.17;
  const JV = 0.025;
  put(new THREE.TorusGeometry(0.052, 0.0022, 4, 18), P.neonCyan, D(JU, JV, 0.007), [90 - tiltDeg, 0, 0], 1.2);
  dCyl(0.042, 0.042, 0.004, 14, P.chrome, JU, JV, 0.004);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    dCyl(0.0042, 0.0042, 0.003, 8, P.metalDark, JU + Math.cos(a) * 0.033, JV + Math.sin(a) * 0.033, 0.008);
  }
  dCyl(0.011, 0.03, 0.016, 12, P.black, JU, JV, 0.008); // rubber dust gaiter
  dCyl(0.0045, 0.0045, 0.03, 8, P.chrome, JU, JV, 0.016); // shaft
  dCyl(0.009, 0.009, 0.004, 10, P.metalDark, JU, JV, 0.024); // collar
  onDeck(new THREE.SphereGeometry(0.016, 12, 8), P.buttonRed, JU, JV, 0.03, 0.032); // ball top
  put(new THREE.SphereGeometry(0.0042, 6, 4), P.white, D(JU - 0.006, JV - 0.005, 0.046 + 0.011), [0, 0, 0], 1);

  // ================= SIX ACTION BUTTONS =================
  const cols = [P.buttonRed, P.buttonYellow, P.buttonBlue];
  const topRow = [0.125, 0.195, 0.265];
  const botRow = [0.105, 0.175, 0.245];
  const button = (u: number, v: number, color: string) => {
    dCyl(0.027, 0.027, 0.005, 12, P.black, u, v, 0);
    dCyl(0.0235, 0.0235, 0.002, 12, P.chrome, u, v, 0.005);
    dCyl(0.019, 0.022, 0.012, 12, color, u, v, 0.006, 1.4);
    dCyl(0.008, 0.008, 0.0015, 8, P.white, u, v - 0.004, 0.018, 1);
  };
  topRow.forEach((u, i) => button(u, -0.025, cols[i]));
  botRow.forEach((u, i) => button(u, 0.045, cols[(i + 1) % 3]));

  // ================= PLAYER START BUTTONS =================
  [
    { u: -0.032, c: P.buttonYellow },
    { u: 0.032, c: P.buttonBlue },
  ].forEach(({ u, c }) => {
    dCyl(0.016, 0.016, 0.004, 10, P.chrome, u, 0.025, 0);
    dCyl(0.011, 0.013, 0.01, 10, c, u, 0.025, 0.004, 1.3);
    dCyl(0.005, 0.005, 0.0012, 6, P.white, u, 0.022, 0.014, 1);
    // tiny "P1/P2" label blocks
    runLayout(2, 0.004, 0.007, 0.0035, u).forEach(({ c: cx, w }) => dBox(w, 0.002, 0.007, P.white, cx, -0.012, 0));
  });

  // ================= STICKER STRIP =================
  const SV = -0.098;
  dBox(0.68, 0.004, 0.04, P.black, 0, SV, 0);
  dBox(0.68, 0.003, 0.004, P.neonMagenta, 0, SV - 0.0225, 0, 0, 1.2);
  dBox(0.68, 0.003, 0.004, P.neonCyan, 0, SV + 0.0225, 0, 0, 1.2);
  const strip = (cx: number, n: number, color: string) =>
    runLayout(n, 0.006, 0.016, 0.005, cx).forEach(({ c, w }) => {
      const d = 0.008 + r() * 0.008;
      dBox(w, 0.002, d, color, c, SV + (r() - 0.5) * 0.004, 0.004);
    });
  strip(-0.235, 8, P.white);
  strip(0, 11, P.sunYellow);
  strip(0.235, 8, P.white);
  for (const s of [1, -1]) {
    dCyl(0.007, 0.007, 0.002, 8, P.neonPink, s * 0.333, SV, 0.004, 1.1);
    dBox(0.003, 0.002, 0.02, P.neonCyan, s * 0.31, SV, 0.004, 0, 1.1);
  }

  // ================= FRONT FASCIA =================
  const FZ = M.coinDoorCentre[2]; // front face of the fascia
  const FY = M.coinDoorCentre[1];
  fBox(0.72, 0.67, 0.04, P.body, 0, 0.635, FZ - 0.02);
  fBox(0.64, 0.6, 0.003, P.bodyDark, 0, 0.63, FZ + 0.0015);
  for (const s of [1, -1]) fBox(0.012, 0.67, 0.006, P.bodyLight, s * 0.354, 0.635, FZ + 0.001);
  fBox(0.72, 0.04, 0.004, P.bodyDark, 0, 0.32, FZ + 0.002);
  fBox(0.72, 0.012, 0.006, P.bodyLight, 0, 0.304, FZ + 0.001);
  // neon lines
  fBox(0.7, 0.005, 0.004, P.neonMagenta, 0, 0.945, FZ + 0.002, 1.2);
  fBox(0.7, 0.004, 0.004, P.neonCyan, 0, 0.932, FZ + 0.002, 1.2);
  fBox(0.7, 0.004, 0.004, P.neonCyan, 0, 0.345, FZ + 0.002, 1.2);
  fBox(0.7, 0.005, 0.004, P.neonMagenta, 0, 0.333, FZ + 0.002, 1.2);
  // diagonal neon stripes flanking the door
  for (const s of [1, -1]) {
    fBox(0.014, 0.2, 0.003, P.neonMagenta, s * 0.24, FY, FZ + 0.0045, 1.2, s * 28);
    fBox(0.014, 0.2, 0.003, P.neonCyan, s * 0.265, FY, FZ + 0.0045, 1.2, s * 28);
    fBox(0.014, 0.2, 0.003, P.neonPink, s * 0.29, FY, FZ + 0.0045, 1.2, s * 28);
  }

  // "INSERT COIN" sign above the door
  fBox(0.23, 0.055, 0.004, P.metalDark, 0, 0.84, FZ + 0.0045);
  fBox(0.214, 0.04, 0.003, P.black, 0, 0.84, FZ + 0.0075);
  runLayout(6, 0.01, 0.022, 0.006, -0.052).forEach(({ c, w }) =>
    fBox(w, 0.012 + r() * 0.006, 0.002, P.sunYellow, c, 0.84, FZ + 0.0095, 1.3),
  );
  runLayout(4, 0.01, 0.022, 0.006, 0.06).forEach(({ c, w }) =>
    fBox(w, 0.012 + r() * 0.006, 0.002, P.sunYellow, c, 0.84, FZ + 0.0095, 1.3),
  );
  for (const s of [1, -1]) fCyl(0.005, 0.003, 8, P.neonPink, s * 0.1, 0.8125, FZ + 0.0085, 1.2);

  // ================= COIN DOOR =================
  const DZ = FZ + 0.009; // door frame centre (depth 0.012)
  fBox(0.32, 0.4, 0.012, P.metalDark, 0, FY, DZ);
  // cyan neon outline
  const OL = 0.28;
  const OH = 0.36;
  const OT = 0.005;
  const OZ = FZ + 0.0165;
  fBox(OL, OT, 0.003, P.neonCyan, 0, FY + OH / 2 - OT / 2, OZ, 1.3);
  fBox(OL, OT, 0.003, P.neonCyan, 0, FY - OH / 2 + OT / 2, OZ, 1.3);
  fBox(OT, OH - 2 * OT, 0.003, P.neonCyan, -OL / 2 + OT / 2, FY, OZ, 1.3);
  fBox(OT, OH - 2 * OT, 0.003, P.neonCyan, OL / 2 - OT / 2, FY, OZ, 1.3);
  // black recessed door plate
  fBox(OL - 2 * OT - 0.002, OH - 2 * OT - 0.002, 0.003, P.black, 0, FY, OZ);
  // door screws and hinges
  for (const sx of [1, -1])
    for (const sy of [1, -1]) fCyl(0.0055, 0.004, 8, P.chrome, sx * 0.152, FY + sy * 0.192, FZ + 0.017);
  for (const y of [FY - 0.12, FY + 0.12]) {
    put(new THREE.CylinderGeometry(0.0065, 0.0065, 0.05, 8), P.chrome, V(-0.166, y, DZ));
  }

  // coin slots in coinRed housings
  for (const s of [1, -1]) {
    const x = s * 0.07;
    const hz = FZ + 0.018 + 0.009;
    fBox(0.075, 0.125, 0.018, P.coinRed, x, 0.635, hz);
    fBox(0.06, 0.1, 0.004, P.chrome, x, 0.64, hz + 0.011);
    fBox(0.008, 0.048, 0.003, P.sunYellow, x, 0.652, hz + 0.0135, 1.5); // glowing slit
    fBox(0.016, 0.003, 0.002, P.coinRed, x, 0.62, hz + 0.0135); // slit label bar
    runLayout(3, 0.004, 0.008, 0.003, x).forEach(({ c, w }) =>
      fBox(w, 0.006, 0.002, P.black, c, 0.605, hz + 0.0135),
    );
    // coin-return button
    fCyl(0.0135, 0.008, 10, P.chrome, x, 0.535, FZ + 0.021);
    fCyl(0.009, 0.004, 8, P.buttonRed, x, 0.535, FZ + 0.0255, 1.0);
  }

  // lock
  fCyl(0.02, 0.01, 12, P.chrome, 0, 0.6, FZ + 0.022);
  fCyl(0.012, 0.004, 10, P.metalDark, 0, 0.6, FZ + 0.0265);
  fBox(0.004, 0.013, 0.002, P.black, 0, 0.6, FZ + 0.0285);
  fCyl(0.004, 0.002, 6, P.black, 0, 0.608, FZ + 0.0285);

  // coin return tray
  const tz = FZ + 0.0165 + 0.012;
  fBox(0.14, 0.06, 0.024, P.black, 0, 0.42, tz);
  fBox(0.15, 0.008, 0.028, P.chrome, 0, 0.455, tz + 0.001);
  fBox(0.11, 0.032, 0.004, P.metalDark, 0, 0.418, tz + 0.014);
  fBox(0.09, 0.003, 0.002, P.neonCyan, 0, 0.44, tz + 0.0145, 1.2);
  runLayout(5, 0.006, 0.012, 0.004, 0).forEach(({ c, w }) => fBox(w, 0.005, 0.002, P.white, c, 0.468, FZ + 0.0175));
}
```

<!-- call: screenAssembly -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildScreenAssembly({ b, J, P, M }: Ctx) {
  // ---------------------------------------------------------------------------------------------
  // Frame: the screen plane leans back 12 degrees. Local +X = model left, +Y = up the screen,
  // +Z = out of the screen toward the player.
  // ---------------------------------------------------------------------------------------------
  const TILT = (12 * Math.PI) / 180;
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -TILT);
  const U = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  const O = new THREE.Vector3(...(M.screenCentre as [number, number, number])).addScaledVector(U, -0.015);
  const base = new THREE.Matrix4().compose(O, q, new THREE.Vector3(1, 1, 1));

  // Own colours (4): deep violet sky band, dark ground, glass rim, glass glint.
  const SKY_DEEP = "#4a2096";
  const GROUND = "#12062b";
  const GLASS = "#3a3080";
  const GLINT = "#7a6fe0";

  // ---------------------------------------------------------------------------------------------
  // Batching: every shape is transformed into model space and merged per colour + glow strength,
  // so the part stays light while carrying hundreds of small details.
  // ---------------------------------------------------------------------------------------------
  type Batch = { color: string; g: number; geos: THREE.BufferGeometry[] };
  const batches = new Map<string, Batch>();
  const push = (geo: THREE.BufferGeometry, color: string, g: number) => {
    const ng = geo.index ? geo.toNonIndexed() : geo;
    const key = `${color}|${g}`;
    let bt = batches.get(key);
    if (!bt) batches.set(key, (bt = { color, g, geos: [] }));
    bt.geos.push(ng);
  };
  const place = (x: number, y: number, z: number, rotZ = 0) => {
    const m = new THREE.Matrix4().makeRotationZ(rotZ);
    m.setPosition(x, y, z);
    return base.clone().multiply(m);
  };
  const box = (color: string, g: number, x: number, y: number, z: number, w: number, h: number, d: number, rotZ = 0) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    geo.applyMatrix4(place(x, y, z, rotZ));
    push(geo, color, g);
  };
  const cyl = (color: string, g: number, x: number, y: number, z: number, r: number, h: number, seg = 10) => {
    const geo = new THREE.CylinderGeometry(r, r, h, seg);
    geo.rotateX(Math.PI / 2);
    geo.applyMatrix4(place(x, y, z));
    push(geo, color, g);
  };
  const LD = 0.003; // layer thickness on the screen face
  const LZ = (n: number) => LD * n - LD / 2; // centre of layer n; its front face sits at LD * n
  const tri = (color: string, g: number, pts: [number, number][], n: number) => {
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), {
      depth: LD,
      bevelEnabled: false,
    });
    geo.translate(0, 0, LZ(n) - LD / 2);
    geo.applyMatrix4(base);
    push(geo, color, g);
  };
  const rectFrame = (color: string, g: number, hw: number, hh: number, t: number, lz: number, depth: number) => {
    box(color, g, 0, hh - t / 2, lz, 2 * hw, t, depth);
    box(color, g, 0, -hh + t / 2, lz, 2 * hw, t, depth);
    for (const s of [1, -1]) box(color, g, s * (hw - t / 2), 0, lz, t, 2 * hh - 2 * t, depth);
  };

  // Pixel art helper: rows of characters, legend maps char -> [colour, glow].
  const pixels = (
    rows: string[],
    legend: Record<string, [string, number]>,
    cx: number,
    cy: number,
    ps: number,
    layer: number,
  ) => {
    const h = rows.length;
    const w = rows[0].length;
    rows.forEach((row, r) => {
      for (let c = 0; c < w; c++) {
        const ch = row[c];
        const L = legend[ch];
        if (!L) continue;
        box(L[0], L[1], cx + (c - (w - 1) / 2) * ps, cy + ((h - 1) / 2 - r) * ps, LZ(layer), ps * 0.94, ps * 0.94, LD);
      }
    });
  };

  const FONT: Record<string, string[]> = {
    "1": [".#.", "##.", ".#.", ".#.", "###"],
    U: ["#.#", "#.#", "#.#", "#.#", "###"],
    P: ["##.", "#.#", "##.", "#..", "#.."],
    "0": ["###", "#.#", "#.#", "#.#", "###"],
    "8": ["###", "#.#", "###", "#.#", "###"],
    "4": ["#.#", "#.#", "###", "..#", "..#"],
    H: ["#.#", "#.#", "###", "#.#", "#.#"],
    I: ["###", ".#.", ".#.", ".#.", "###"],
  };
  const text = (str: string, x0: number, y: number, ps: number, color: string, layer: number) => {
    let x = x0;
    for (const ch of str) {
      const glyph = FONT[ch];
      if (glyph) {
        glyph.forEach((row, r) => {
          for (let c = 0; c < 3; c++)
            if (row[c] === "#") box(color, 1, x + c * ps, y + (2 - r) * ps, LZ(layer), ps * 0.94, ps * 0.94, LD);
        });
      }
      x += 4 * ps;
    }
  };

  // ---------------------------------------------------------------------------------------------
  // Dimensions of the screen window (local metres)
  // ---------------------------------------------------------------------------------------------
  const HW = 0.26;
  const HH = 0.17;
  const HOR = -0.02; // horizon height on the screen

  // ---------------------------------------------------------------------------------------------
  // Bezel: black frame, back plate, shelf, inner trims
  // ---------------------------------------------------------------------------------------------
  const BZ = 0.005; // bezel depth centre (spans -0.02 .. 0.03)
  box(P.black, 0, 0, 0.195, BZ, 0.64, 0.05, 0.05); // top bar
  box(P.black, 0, 0, -0.195, BZ, 0.64, 0.05, 0.05); // bottom bar
  for (const s of [1, -1]) box(P.black, 0, s * 0.29, 0, BZ, 0.06, 0.34, 0.05); // side bars
  box(P.black, 0, 0, 0, -0.03, 0.64, 0.44, 0.04); // back plate closing the recess
  // bevelled inner frame in metalDark, then glowing cyan trim just inside it
  rectFrame(P.metalDark, 0, 0.275, 0.185, 0.013, 0.03, 0.006);
  rectFrame(P.neonCyan, 1.2, 0.262, 0.172, 0.006, 0.0295, 0.009);
  // shelf under the bezel meeting the control deck, with a magenta glow lip
  box(P.bodyDark, 0, 0, -0.235, 0.05, 0.66, 0.02, 0.12);
  box(P.neonMagenta, 1.3, 0, -0.229, 0.1115, 0.62, 0.006, 0.004);
  box(P.metalDark, 0, 0, -0.226, 0.115, 0.66, 0.006, 0.006);

  // ---------------------------------------------------------------------------------------------
  // The CRT picture. Layers stack 3 mm apart so nothing shares a plane.
  // ---------------------------------------------------------------------------------------------
  box(P.screenGlow, 0.9, 0, 0, -0.005, 2 * HW, 2 * HH, 0.01); // base glow plate

  // horizon glow bands (layer 1) climbing from the horizon
  const bands: [string, number][] = [
    [P.neonMagenta, 0.012],
    [P.gridPurple, 0.02],
    [SKY_DEEP, 0.026],
  ];
  let by = HOR;
  for (const [c, h] of bands) {
    box(c, 0.9, 0, by + h / 2, LZ(1), 2 * HW, h, LD);
    by += h;
  }
  // dark ground below the horizon
  box(GROUND, 0.8, 0, (-HH + HOR) / 2, LZ(1), 2 * HW, HH + HOR, LD);

  // striped sunset sun (layer 2): horizontal slices with growing gaps toward the horizon
  const SC = 0.03;
  const SR = 0.085;
  const widthAt = (y: number) => {
    const d = Math.abs(y - SC);
    return d >= SR ? 0 : Math.sqrt(SR * SR - d * d);
  };
  {
    let y = HOR;
    let i = 0;
    while (y < SC + SR - 0.001) {
      const gap = Math.max(0, 0.011 - i * 0.002);
      const y0 = y + gap;
      const y1 = Math.min(y0 + 0.015, SC + SR);
      i++;
      y = y1;
      const hw = (widthAt(y0) + widthAt(y1)) / 2;
      if (hw < 0.004) continue;
      const t = ((y0 + y1) / 2 - HOR) / (SC + SR - HOR);
      const col = t < 0.34 ? P.neonPink : t < 0.67 ? P.sunOrange : P.sunYellow;
      box(col, 1.1, 0, (y0 + y1) / 2, LZ(2), 2 * hw, y1 - y0, LD);
    }
  }

  // stars (layer 3), only in open sky
  {
    const r = rng(84);
    let placed = 0;
    let tries = 0;
    while (placed < 16 && tries < 400) {
      tries++;
      const x = (r() * 2 - 1) * 0.245;
      const y = 0.035 + r() * 0.08;
      if (Math.hypot(x, y - SC) < SR + 0.02) continue;
      const s = placed % 4 === 0 ? 0.006 : 0.0035;
      box(P.white, 1, x, y, LZ(3), s, s, LD);
      if (placed % 4 === 0) {
        box(P.white, 1, x, y, LZ(3), s * 2.2, s * 0.45, LD);
        box(P.white, 1, x, y, LZ(3), s * 0.45, s * 2.2, LD);
      }
      placed++;
    }
  }

  // black zigzag mountains on the horizon (layer 3)
  const peaks: [number, number, number][] = [
    [-0.19, 0.07, 0.05],
    [-0.12, 0.05, 0.028],
    [0.19, 0.07, 0.055],
    [0.12, 0.045, 0.03],
  ];
  for (const [cx, hw, h] of peaks)
    tri(P.black, 0, [[cx - hw, HOR - 0.002], [cx, HOR + h], [cx + hw, HOR - 0.002]], 3);

  // neon perspective grid (layer 4): receding horizontals and converging verticals
  for (let k = 1; k <= 6; k++) {
    const y = Math.max(HOR - 0.15 * (k / 6) ** 2, -HH + 0.0015);
    box(P.screenLine, 1, 0, y, LZ(4), 2 * HW, 0.003, LD);
  }
  for (let j = -6; j <= 6; j++) {
    const xb = j * 0.065;
    const t = Math.min(1, HW / Math.max(Math.abs(xb), 1e-6));
    const dx = xb * t;
    const dy = -0.15 * t;
    const L = Math.hypot(dx, dy);
    box(P.screenLine, 1, dx / 2, HOR + dy / 2, LZ(4), 0.003, L, LD, Math.atan2(-dx, dy));
  }
  // bright horizon line (layer 5)
  box(P.neonPink, 1.4, 0, HOR, LZ(5), 2 * HW, 0.004, LD);

  // player ship and laser bolt (layer 5)
  const SHIP = [
    "....W....",
    "...WWW...",
    "..WWCWW..",
    ".WWWWWWW.",
    "WW.WWW.WW",
    "W...W...W",
  ];
  pixels(SHIP, { W: [P.white, 1], C: [P.neonCyan, 1.2] }, 0, -0.115, 0.0065, 5);
  box(P.sunYellow, 1.3, 0, -0.07, LZ(5), 0.004, 0.012, LD);
  box(P.sunYellow, 1.3, 0, -0.045, LZ(5), 0.004, 0.012, LD);

  // alien invaders row (layer 5)
  const INV_A = [
    "..#.....#..",
    "...#...#...",
    "..#######..",
    ".##.###.##.",
    "###########",
    "#.#######.#",
    "#.#.....#.#",
    "...##.##...",
  ];
  const INV_B = [
    "...##...",
    "..####..",
    ".######.",
    "##.##.##",
    "########",
    "..#..#..",
    ".#.##.#.",
    "#.#..#.#",
  ];
  const invColors = [P.neonPink, P.neonCyan, P.sunYellow, P.neonPink];
  [-0.2, -0.07, 0.07, 0.2].forEach((x, i) => {
    pixels(i % 2 === 0 ? INV_A : INV_B, { "#": [invColors[i], 1.1] }, x, 0.125, 0.0045, 5);
  });
  // an enemy bomb falling
  box(P.neonMagenta, 1.2, 0.2, 0.085, LZ(5), 0.003, 0.01, LD);
  box(P.neonMagenta, 1.2, 0.2, 0.07, LZ(5), 0.003, 0.01, LD);

  // score read-out (layer 5)
  text("1UP", -0.245, 0.151, 0.0028, P.neonPink, 5);
  text("0840", -0.19, 0.151, 0.0028, P.white, 5);
  text("HI", 0.165, 0.151, 0.0028, P.neonPink, 5);
  text("8400", 0.2, 0.151, 0.0028, P.white, 5);

  // subtle scanlines (layer 6)
  for (let y = -HH + 0.006; y < HH - 0.003; y += 0.012) box(P.black, 0, 0, y, LZ(6), 2 * HW, 0.0016, LD);

  // glass look (layer 7): lighter rim plate and glints
  rectFrame(GLASS, 0.5, HW, HH, 0.012, LZ(7), LD);
  box(GLINT, 0.6, -0.15, 0.085, LZ(7), 0.014, 0.12, LD, 0.45);
  box(GLINT, 0.6, -0.12, 0.062, LZ(7), 0.005, 0.085, LD, 0.45);

  // ---------------------------------------------------------------------------------------------
  // Bezel hardware: chrome corner brackets, screws, knobs, LEDs
  // ---------------------------------------------------------------------------------------------
  for (const sx of [1, -1])
    for (const sy of [1, -1]) {
      box(P.chrome, 0, sx * 0.29, sy * 0.214, 0.033, 0.06, 0.012, 0.006);
      box(P.chrome, 0, sx * 0.314, sy * 0.19, 0.033, 0.012, 0.06, 0.006);
      cyl(P.metalDark, 0, sx * 0.3, sy * 0.214, 0.0375, 0.0045, 0.004, 8);
    }
  for (const x of [-0.24, -0.208]) {
    cyl(P.metalDark, 0, x, -0.195, 0.034, 0.0105, 0.008, 10);
    cyl(P.chrome, 0, x, -0.195, 0.0385, 0.008, 0.003, 10);
    box(P.black, 0, x, -0.19, 0.0405, 0.002, 0.008, 0.002);
  }
  cyl(P.buttonRed, 1.3, 0.255, -0.195, 0.032, 0.0045, 0.004, 8);
  cyl(P.neonCyan, 1.3, 0.232, -0.195, 0.032, 0.0045, 0.004, 8);
  box(P.white, 0.6, -0.12, -0.195, 0.031, 0.05, 0.003, 0.002);
  box(P.neonMagenta, 1, -0.12, -0.2, 0.031, 0.03, 0.002, 0.002);

  // ---------------------------------------------------------------------------------------------
  // Speaker grille above the screen, tucked under the marquee
  // ---------------------------------------------------------------------------------------------
  const GY = 0.2425;
  box(P.metalDark, 0, 0, GY, BZ, 0.6, 0.045, 0.05);
  for (let i = 0; i < 21; i++) box(P.black, 0, (i - 10) * 0.0265, GY, 0.0305, 0.007, 0.03, 0.002);
  for (const s of [1, -1]) {
    box(P.chrome, 0, s * 0.295, GY, 0.0315, 0.012, 0.045, 0.003);
    cyl(P.metalDark, 0, s * 0.295, GY, 0.034, 0.003, 0.003, 6);
  }
  box(P.neonMagenta, 1.3, 0, 0.221, 0.03, 0.6, 0.004, 0.004);
  box(P.neonCyan, 1.3, 0, 0.2655, 0.03, 0.6, 0.004, 0.004);

  // ---------------------------------------------------------------------------------------------
  // Flush merged batches into parts; glowing ones use the glow kit
  // ---------------------------------------------------------------------------------------------
  let n = 0;
  for (const bt of batches.values()) {
    const merged = mergeGeometries(bt.geos, false);
    if (!merged) continue;
    const part = b.part(merged, bt.color, { at: [0, 0, 0], name: `screenAssembly.${n++}` });
    if (bt.g > 0) glow(part, bt.g);
  }
}
```