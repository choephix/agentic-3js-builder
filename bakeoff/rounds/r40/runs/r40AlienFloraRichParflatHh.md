<!-- call: plan -->

```json
{
  "name": "Pandoran Glow-Willow",
  "description": "A bioluminescent alien tree in the style of Avatar's Pandora: a twisted indigo trunk with spiral glowing veins, big umbrella fronds, hanging luminous tendrils and seed pods, and a ring of glowing mushrooms and fiddleheads on a mossy base.",
  "builderName": "pandoranGlowWillow",
  "size": [3.2, 3.6, 3.2],
  "layout": "Static model, joints: []. The tree stands at x=0, z=0 and its widest reach is the canopy and the root flare, about 3.2 m across. Height is 3.6 m. Azimuth means degrees from +Z toward +X (+X is the model's left), so 0 is front, 90 is left, 180 is back and 270 is right. From the ground up: (1) a low mossy mound (radius ~1.3, height ~0.25) with 6 buttress roots flaring out from the trunk base at azimuths 0, 60, 120, 180, 240 and 300; (2) a thick trunk that tapers from radius 0.55 at y=0.4 to 0.3 at y=2.2 with a gentle S-curve (centre drifts at most 0.15 m in x or z) and a slow spiral twist, plus a flared crown knuckle at y~2.3; (3) a crown of 8 big fronds that arch up and outward from the crown mount, and a taller, tightly curled fiddlehead spire at the top (tip at y=3.6); (4) 14-18 hanging tendrils that fall from the underside of the fronds at radius 0.9-1.5, with glowing pods, ending at y~0.5-1.4; (5) ground flora at the radial gaps between roots (azimuths 30, 90, 150, 210, 270, 330 at radius 0.9-1.5): glowing mushrooms, curled fiddleheads and bulb sprouts. Avatar look: deep indigo and teal bodies in simple blocky or faceted shapes, with the wow coming from neon cyan, magenta and violet glow in veins, rims, pods, mushroom caps and spores. Every glowing piece is a separate small flat-colour part (use the glow kit). Dark outline-colour pieces sit under or behind glowing trim to make it pop. Colour by place: warmer or lighter on top surfaces, cooler and darker below. Moss sits on upward faces of roots, and glow pools near the base of the trunk and in the knots.",
  "palette": {
    "barkDark": "#1b1d3b",
    "barkMid": "#2e3668",
    "barkLight": "#46549a",
    "mossTeal": "#1f6f73",
    "mossBright": "#2f9e8f",
    "groundDark": "#0f1230",
    "groundMoss": "#1a4a56",
    "rockViolet": "#3a3668",
    "leafDeep": "#14385a",
    "leafMid": "#1e7a8c",
    "leafTeal": "#2bb5a8",
    "veinCyan": "#3ff5e6",
    "glowAqua": "#8dfff2",
    "glowBlue": "#4aa8ff",
    "glowViolet": "#a46bff",
    "glowMagenta": "#ff4fd8",
    "podPink": "#e0509c",
    "mushroomCap": "#7b3fd1",
    "stemPale": "#c9d7ff",
    "sporeYellow": "#fff08a",
    "outline": "#0a0b1e"
  },
  "mounts": {
    "groundCenter": [0, 0, 0],
    "trunkBase": [0, 0.4, 0],
    "trunkMid": [0.08, 1.3, -0.05],
    "crown": [0, 2.3, 0],
    "frondRing": [0, 2.45, 0],
    "spireTip": [0, 3.6, 0],
    "tendrilRing": [0, 2.5, 0],
    "rootTipRadius": [1.45, 0.08, 0]
  },
  "joints": [],
  "parts": [
    {
      "id": "baseRoots",
      "builds": "The mossy mound (a flattened faceted lathe or sphere in groundMoss, with darker groundDark skirt rings) and 6 chunky buttress roots at azimuths 0, 60, 120, 180, 240 and 300. Each root is a swept tube in barkMid that starts at the trunk base (r~0.3, y~0.5) and arcs down to the floor, tapering to r~0.05 at a radius of 1.45 m. Each root has a barkLight highlight strip on its upper face, mossTeal and mossBright moss patches on its upward faces, a thin glowing cyan vein (veinCyan, a thin sweep) running along its spine, and a small dark outline-coloured knuckle near the tip. A few rockViolet faceted rocks sit half-sunk in the mound at the gaps between roots, but not in the flora gap slots (azimuths 30, 90, 150, 210, 270, 330 at radius 0.9-1.5), which stay free for the flora part. The glow veins on the roots lead up into the trunk's veins at trunkBase.",
      "box": [[-1.6, 0, -1.6], [1.6, 0.7, 1.6]],
      "attaches": "Roots end under trunkBase (the trunk part's lower end sinks into the mound top at y~0.45). The mound centre is groundCenter.",
      "joints": [],
      "floor": true,
      "budget": 170
    },
    {
      "id": "trunk",
      "builds": "The main trunk: a loft or sweep from trunkBase (r 0.55) via trunkMid (r~0.42) to crown (r 0.3), with a gentle S-curve and a faceted section ({ngon:7} or 8 sides) in barkMid. Darker barkDark vertical ridge strips and barkLight highlight ridges wrap on it, with 5-6 chunky bark plates (extruded, slightly overlapping) per level. The signature is 3 spiral glowing veins in veinCyan and glowAqua that twist up the trunk from the root veins to the crown, built as sweeps or along-chains of small glowing capsules lifted slightly off the skin, with dark outline under-strokes. Add 4-5 big knots or burls: outline-coloured hollow rings with glowing glowMagenta and glowViolet orbs inside. Two short stub branches at y~1.6 (azimuth 100 and 260) end in glowing bulbs (glowBlue) that carry small moss caps. At y~2.0-2.35 the trunk flares into a crown knuckle (a faceted ball or lathe in barkLight, r~0.42) ringed by 8 socket nubs, where the fronds attach. The trunk top ends exactly at the crown mount (y 2.3-2.5), with a small mossBright top.",
      "box": [[-0.7, 0.4, -0.7], [0.7, 2.55, 0.7]],
      "attaches": "Bottom sits in the baseRoots mound at trunkBase. Top knuckle ends at crown, where the canopy fronds and spire start. Tendril roots start under the knuckle on the tendrilRing.",
      "joints": [],
      "floor": false,
      "budget": 180
    },
    {
      "id": "canopyFronds",
      "builds": "The crown of 8 large arching fronds from frondRing at azimuths 0, 45, 90, ..., 315. Each frond is a thick curved stem (swept tube in leafDeep) that rises ~0.5 m and arches outward to radius ~1.5 m, about 0.2 m lower than the stem top, and carries a broad extruded leaf blade (leafMid with a leafTeal tip, a leaf-shaped outline with smoothing, thickness ~0.03) lying along the stem. On each blade, a central glowing midrib (veinCyan sweep) and 4-6 pairs of angled glowing side veins (glowAqua thin rods). A rim of tiny glowBlue dots runs along the blade edge, with an outline-coloured underside strip. Alternate fronds tilt higher (even) and lower (odd) so the silhouette is bold, like an umbrella. Along the top, 3 smaller upright secondary fronds (leafTeal) in a ring at radius 0.3, and at the crown centre a tall spiral fiddlehead spire (spiral sweep in leafMid, ending in a glowing glowMagenta bulb, tip y=3.6) that is the highest point of the model, with 2 curled glowing tendrils (glowViolet) beside it. Underside of the blades is leafDeep/barkDark (cool and dark), the top is warmer teal.",
      "box": [[-1.6, 2.25, -1.6], [1.6, 3.6, 1.6]],
      "attaches": "Frond stems root on the crown knuckle sockets at frondRing (r~0.4). The spire stands on crown. Frond tips end near radius 1.5, which is where the tendrils hang below them.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "hangingTendrils",
      "builds": "14-18 hanging bioluminescent tendrils (willow style) that start at tendrilRing under the knuckle and frond stems, at radius 0.7-1.5 at various azimuths (but not directly through the trunk), and drop to y between 0.5 and 1.4. Each tendril is a thin swept tube (r 0.035 tapering to 0.012) in barkLight or leafTeal with a gentle S-curve, glowing with small beads (glowAqua or glowViolet spheres) spaced along it and a glowing tip bulb, alternating glowMagenta, glowBlue and glowAqua. Include 5-6 bigger seed pods on the longer tendrils: faceted teardrop lathes in podPink with outline-coloured calyx caps and a glowing core (glowMagenta) showing through a slit or a ring. A few tendrils fork into two thinner ones. Add 14-20 floating spore motes (tiny sporeYellow and glowAqua octahedra or low-poly spheres, r 0.015-0.03) drifting in the air around the tree between y 0.8 and 3.0, at radius 0.6-1.6, spaced apart and not touching anything.",
      "box": [[-1.55, 0.5, -1.55], [1.55, 2.55, 1.55]],
      "attaches": "Tendrils root at tendrilRing under the crown and fronds, and none touch the floor (lowest tip y~0.5). Spores float free in the air.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "groundFlora",
      "builds": "Ground-level glowing flora in the gaps between the buttress roots at azimuths 30, 90, 150, 210, 270 and 330, radius 0.9-1.5, plus 4 tiny extras at radius 1.5-1.6. Each gap holds a cluster: (a) 2-3 glowing mushrooms of different heights (0.15-0.5 m): a stemPale faceted stem, a mushroomCap lathe cap with an underside gill ring in glowViolet, and a glowing rim and spot dots on top in glowMagenta or glowAqua; (b) a curled fiddlehead sprout (spiral sweep in mossBright, with a glowing tip) 0.2-0.45 m tall; (c) one bulb sprout, a fat glowBlue bulb in a leafDeep 3-leaf cup. Add a few flat glowing moss pads (glowAqua discs, r 0.06-0.12, just above the mound) and small leafTeal grass blades (extruded) in tufts. Sizes vary by azimuth: the tallest mushroom (0.5 m) sits at azimuth 330, the cutest tiny ones at azimuth 90 and 150. Everything sits on y>=0 and on the mound or the groundMoss floor patch. Add a thin flat groundMoss floor patch disc (r~1.55, 0.02 m thick, faceted) under the clusters so they connect with the mound.",
      "box": [[-1.6, 0, -1.6], [1.6, 0.9, 1.6]],
      "attaches": "Clusters stand around the baseRoots mound at groundCenter, in the gaps between the roots, and don't overlap the roots. Heights are at most 0.9 m, so nothing reaches the trunk.",
      "joints": [],
      "floor": true,
      "budget": 160
    }
  ]
}
```

<!-- call: hangingTendrils -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHangingTendrils({ b, P, M }: Ctx) {
  const rand = rng(41);
  const topY = M.tendrilRing[1] + 0.02; // just under the crown / frond stems
  const BEAD = [P.glowAqua, P.glowViolet];
  const TIP = [P.glowMagenta, P.glowBlue, P.glowAqua];
  const STEM = [P.barkLight, P.leafTeal];
  const podSet = new Set([1, 4, 7, 10, 12, 15]);
  const forkSet = new Set([2, 8, 13]);
  const keep: THREE.Vector3[] = []; // sample points of every strand, so spores stay clear
  const DEG = 180 / Math.PI;

  const bead = (at: THREE.Vector3, r: number, color: string, strength = 1.3) =>
    glow(b.part(new THREE.SphereGeometry(r, 8, 6), color, { at }), strength);

  const sample = (path: { at(t: number): THREE.Vector3 }) => {
    for (let i = 0; i <= 12; i++) keep.push(path.at(i / 12).clone());
  };

  // A seed pod hanging from the strand end E: pink teardrop, dark calyx cap, glowing slits.
  const pod = (E: THREE.Vector3, az: number) => {
    b.lathe(
      [
        [0, 0],
        [0.018, 0.03],
        [0.05, 0.08],
        [0.075, 0.14],
        [0.07, 0.19],
        [0.045, 0.225],
        [0, 0.235],
      ],
      { at: [E.x, E.y - 0.26, E.z], segments: 8, color: P.podPink },
    );
    b.lathe(
      [
        [0, 0],
        [0.078, 0],
        [0.09, 0.03],
        [0.05, 0.065],
        [0.02, 0.1],
        [0, 0.1],
      ],
      { at: [E.x, E.y - 0.075, E.z], segments: 8, color: P.outline },
    );
    for (const off of [0, Math.PI]) {
      const phi = az + off;
      glow(
        b.part(new THREE.BoxGeometry(0.02, 0.11, 0.024), P.glowMagenta, {
          at: [E.x + Math.sin(phi) * 0.071, E.y - 0.14, E.z + Math.cos(phi) * 0.071],
          rotation: [0, phi * DEG, 0],
        }),
        1.5,
      );
    }
    bead(new THREE.Vector3(E.x, E.y - 0.262, E.z), 0.02, P.glowMagenta, 1.6);
  };

  for (let i = 0; i < 16; i++) {
    const az = ((i * 22.5 + (i % 2 ? 6 : -4) + rand() * 6) * Math.PI) / 180;
    const r = [0.8, 1.3, 1.0, 1.4, 0.75, 1.2, 1.05, 1.35][(i * 3) % 8] + rand() * 0.05;
    const isPod = podSet.has(i);
    const endY = isPod ? 0.82 + rand() * 0.12 : 0.62 + rand() * 0.75;
    const rad = new THREE.Vector3(Math.sin(az), 0, Math.cos(az));
    const tan = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
    const amp = 0.05 + rand() * 0.04;
    const phase = rand() * 6.28;
    const drift = (rand() - 0.4) * 0.12;
    const pts: THREE.Vector3[] = [];
    for (const s of [0, 0.25, 0.5, 0.75, 1]) {
      const y = topY + (endY - topY) * Math.pow(s, 0.9);
      const sway = amp * (Math.sin(phase + s * 5.6) - Math.sin(phase));
      const rr = r + drift * s;
      pts.push(
        new THREE.Vector3(rad.x * rr + tan.x * sway, y, rad.z * rr + tan.z * sway),
      );
    }
    const path = new (Object.getPrototypeOf({}).constructor)() && null;
    void path;
    const curve = catmullPath(pts);
    const stemColor = STEM[i % 2];
    b.sweep(curve, [0.035, 0.026, 0.019, 0.014, 0.012], {
      color: stemColor,
      sides: 6,
      caps: "round",
    });
    sample(curve);

    // dark collar where it hangs from the canopy
    b.part(new THREE.CylinderGeometry(0.03, 0.055, 0.06, 6), P.outline, {
      at: [pts[0].x, topY - 0.015, pts[0].z],
    });

    // beads
    const ts = [0.26, 0.5, 0.74].map((t) => t + (rand() - 0.5) * 0.06);
    ts.forEach((t, k) => bead(curve.at(t), 0.026 + rand() * 0.01, BEAD[(i + k) % 2]));

    const E = pts[4];
    if (isPod) pod(E, az);
    else bead(E, 0.042, TIP[i % 3], 1.5);

    // forks
    if (forkSet.has(i)) {
      const B = curve.at(0.42);
      const sgn = i % 2 ? 1 : -1;
      const e2 = new THREE.Vector3(
        B.x + tan.x * 0.22 * sgn + rad.x * 0.05,
        0.7 + rand() * 0.25,
        B.z + tan.z * 0.22 * sgn + rad.z * 0.05,
      );
      const f = catmullPath([
        B,
        new THREE.Vector3(B.x + tan.x * 0.07 * sgn, B.y - 0.14, B.z + tan.z * 0.07 * sgn),
        new THREE.Vector3(
          (B.x + e2.x) / 2 + tan.x * 0.04 * sgn,
          (B.y + e2.y) / 2,
          (B.z + e2.z) / 2 + tan.z * 0.04 * sgn,
        ),
        e2,
      ]);
      b.sweep(f, [0.02, 0.014, 0.009], { color: STEM[(i + 1) % 2], sides: 6, caps: "round" });
      sample(f);
      bead(B, 0.03, P.glowViolet);
      bead(e2, 0.034, TIP[(i + 1) % 3], 1.5);
    }
  }

  // floating spore motes
  const motes: THREE.Vector3[] = [];
  let tries = 0;
  while (motes.length < 18 && tries < 800) {
    tries++;
    const a = rand() * Math.PI * 2;
    const rr = 0.75 + rand() * 0.75;
    const p = new THREE.Vector3(Math.sin(a) * rr, 0.85 + rand() * 1.45, Math.cos(a) * rr);
    if (keep.some((k) => k.distanceTo(p) < 0.14)) continue;
    if (motes.some((m) => m.distanceTo(p) < 0.3)) continue;
    motes.push(p);
  }
  motes.forEach((p, k) => {
    const rr = 0.015 + rand() * 0.015;
    glow(
      b.part(
        new THREE.OctahedronGeometry(rr, 0),
        k % 2 ? P.glowAqua : P.sporeYellow,
        { at: p, rotation: [rand() * 90, rand() * 90, rand() * 90] },
      ),
      1.7,
    );
  });

  function catmullPath(points: THREE.Vector3[]) {
    return makeCatmull(points);
  }
}

import { catmull as makeCatmull } from "agentic-3js-builder";
```

<!-- call: baseRoots -->

```ts
import * as THREE from "three";
import { rng, catmull, bezier } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBaseRoots({ b, J, P, M }: Ctx) {
  const r = rng(404);
  const rad = (d: number) => (d * Math.PI) / 180;

  // Azimuth is degrees from +Z toward +X.
  const pt = (a: number, rho: number, y: number, lat = 0): [number, number, number] => [
    Math.sin(a) * rho + Math.cos(a) * lat,
    y,
    Math.cos(a) * rho - Math.sin(a) * lat,
  ];

  // Angular distance in degrees between two azimuths.
  const angDist = (x: number, y: number) => {
    const d = Math.abs(((x - y) % 360 + 540) % 360 - 180);
    return d;
  };
  const azOf = (p: THREE.Vector3) => ((Math.atan2(p.x, p.z) * 180) / Math.PI + 360) % 360;

  // Small reusable geometry factories (low poly).
  const blob = (sx: number, sy: number, sz: number) =>
    new THREE.SphereGeometry(1, 6, 4).scale(sx, sy, sz);
  const disc = (rr: number, h: number, sides = 8) => new THREE.CylinderGeometry(rr, rr * 1.05, h, sides);
  const rockGeo = (s: number, sy = 0.7) => new THREE.IcosahedronGeometry(s, 0).scale(1, sy, 1.1);

  // ---------------------------------------------------------------- mound
  const mound = b.lathe(
    [
      [0, 0],
      [1.3, 0],
      [1.3, 0.04],
      [1.0, 0.16],
      [0.6, 0.24],
      [0.3, 0.265],
      [0, 0.27],
    ],
    { at: [0, 0, 0], segments: 14, color: P.groundMoss, name: "mound" },
  );
  // dark skirt rings
  b.lathe(
    [
      [1.2, 0],
      [1.4, 0],
      [1.4, 0.05],
      [1.3, 0.075],
      [1.2, 0.06],
    ],
    { at: [0, 0, 0], segments: 14, color: P.groundDark, name: "skirtA" },
  );
  b.lathe(
    [
      [1.36, 0],
      [1.48, 0],
      [1.48, 0.022],
      [1.36, 0.03],
    ],
    { at: [0, 0, 0], segments: 14, spin: 12, color: P.outline, name: "skirtB" },
  );

  const mSurf = b.surface(mound);

  // ---------------------------------------------------------------- mound surface detail
  const rootAz = [0, 60, 120, 180, 240, 300];
  const patches = mSurf.scatter(30, {
    rng: rng(11),
    minDist: 0.17,
    filter: (h) => {
      const rho = Math.hypot(h.at.x, h.at.z);
      if (h.n.y < 0.6 || rho < 0.68 || rho > 1.2) return false;
      const az = azOf(h.at);
      return rootAz.every((ra) => angDist(az, ra) > 17);
    },
  });
  patches.forEach((h, i) => {
    const k = i % 3;
    if (k === 0) b.stick(disc(0.07, 0.014, 7), P.groundDark, h, { embed: 0.4 });
    else if (k === 1) b.stick(blob(0.055, 0.025, 0.07), P.mossTeal, h, { embed: 0.3 });
    else {
      b.stick(blob(0.035, 0.016, 0.045), P.mossBright, h, { embed: 0.3 });
    }
  });

  // glowing pools between the roots near the trunk base
  for (let k = 0; k < 6; k++) {
    const a = rad(30 + 60 * k);
    const p = pt(a, 0.74, 1);
    const hit = mSurf.ray(p, [0, -1, 0]);
    if (!hit) continue;
    b.stick(disc(0.125, 0.02, 8), P.outline, hit, { embed: 0.55 });
    const top = hit.moved([0, 0.006, 0]);
    glow(b.stick(disc(0.088, 0.016, 8), P.veinCyan, top, { embed: 0.4 }), 1);
    glow(b.stick(new THREE.OctahedronGeometry(0.03, 0).scale(1, 1.4, 1), P.glowAqua, top.moved([0, 0.01, 0]), { embed: 0.2 }), 1.4);
  }

  // ---------------------------------------------------------------- buttress roots
  for (let i = 0; i < 6; i++) {
    const a = rad(rootAz[i]);
    const out = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const w = 0.04 + r() * 0.03;
    const sgn = i % 2 ? 1 : -1;
    const path = catmull([
      pt(a, 0.1, 0.4),
      pt(a, 0.42, 0.39, sgn * 0.02),
      pt(a, 0.78, 0.265, -sgn * w),
      pt(a, 1.12, 0.125, sgn * w * 0.8),
      pt(a, 1.45, 0.056, 0),
    ]);
    const root = b.sweep(path, (t: number) => {
      const rr = 0.05 + 0.22 * Math.pow(1 - t, 1.4);
      return [rr * 0.9, rr * 1.1] as [number, number];
    }, {
      section: { ngon: 8 },
      caps: "round",
      color: P.barkMid,
      sectors: [
        [-34, 34, P.barkLight, 0.12, 1],
        [125, 235, P.barkDark, 0.0, 1],
      ],
      name: `root${i}`,
    });

    // dark outline under-stroke + glowing vein on the spine
    const spineLow = root.line(0, 0.004).slice(0.14, 0.96);
    b.sweep(spineLow, 0.027, { color: P.outline, sides: 6, caps: "round", name: `veinShadow${i}` });
    const spineTop = root.line(0, 0.016).slice(0.14, 0.96);
    glow(b.sweep(spineTop, 0.013, { color: P.veinCyan, sides: 6, caps: "round", name: `vein${i}` }), 1.2);
    // beads along the vein
    b.along(spineTop, 3, (at) => {
      glow(b.part(new THREE.SphereGeometry(0.024, 6, 4), P.glowAqua, { at: at.at }), 1.4);
    });

    // moss on upward faces
    const hits = b.surface(root).scatter(7, {
      rng: rng(100 + i),
      minDist: 0.13,
      filter: (h) => h.n.y > 0.55 && Math.hypot(h.at.x, h.at.z) > 0.62 && Math.hypot(h.at.x, h.at.z) < 1.35,
    });
    hits.forEach((h, j) => {
      const s = 0.8 + r() * 0.7;
      if (j % 2 === 0) b.stick(blob(0.06, 0.028, 0.08), P.mossTeal, h, { embed: 0.3, scale: s });
      else b.stick(blob(0.04, 0.02, 0.055), P.mossBright, h, { embed: 0.3, scale: s, spin: r() * 90 });
    });

    // dark knuckle near the tip with a glowing eye
    const kn = root.at(0.8, 70);
    b.stick(new THREE.DodecahedronGeometry(0.058, 0).scale(1, 0.85, 1.1), P.outline, kn, { embed: 0.35 });
    glow(b.stick(new THREE.SphereGeometry(0.02, 6, 4), P.veinCyan, kn.moved([0, 0.05, 0]), { embed: 0.3 }), 1.3);

    // small glowing tip bead
    const tip = pt(a, 1.47, 0.07);
    glow(b.part(new THREE.SphereGeometry(0.026, 6, 4), P.glowAqua, { at: tip }), 1.4);

    // rootlets splitting from the sides
    for (const side of [90, -90]) {
      const h = root.at(0.5, side);
      const p0 = h.at.clone();
      const nn = h.n.clone();
      nn.y = 0;
      nn.normalize();
      const end = p0.clone().addScaledVector(nn, 0.2).addScaledVector(out, 0.28);
      end.y = 0.02;
      const ctrl = p0.clone().addScaledVector(nn, 0.12).addScaledVector(out, 0.1);
      ctrl.y = Math.max(p0.y - 0.02, 0.07);
      b.sweep(bezier(p0, ctrl, end), [0.04, 0.012], { color: P.barkMid, sides: 6, caps: "round", name: `rootlet${i}` });
      b.part(new THREE.SphereGeometry(0.014, 5, 3), P.mossBright, { at: [end.x, 0.022, end.z] });
    }
  }

  // ---------------------------------------------------------------- rocks (half-sunk, off the flora slots)
  const rocks: Array<[number, number, number, number]> = [
    // azimuth, radius, size, aspect
    [15, 1.5, 0.15, 0.7],
    [75, 1.5, 0.13, 0.8],
    [135, 1.5, 0.16, 0.65],
    [195, 1.5, 0.14, 0.75],
    [255, 1.5, 0.15, 0.7],
    [315, 1.5, 0.13, 0.8],
    [22, 1.56, 0.07, 0.8],
    [142, 1.56, 0.065, 0.8],
    [262, 1.56, 0.07, 0.8],
  ];
  rocks.forEach(([az, rho, s, asp], i) => {
    const a = rad(az);
    const p = pt(a, rho, s * asp * 0.35);
    const rock = b.part(rockGeo(s, asp), P.rockViolet, {
      at: p,
      rotation: [r() * 30, r() * 360, r() * 30],
      flat: true,
    });
    // moss cap on top
    b.part(blob(s * 0.62, s * 0.2, s * 0.62), i % 2 ? P.mossBright : P.mossTeal, {
      at: [p[0], p[1] + s * asp * 0.78, p[2]],
      rotation: [0, r() * 360, 0],
    });
    if (i % 3 === 0) {
      glow(
        b.part(new THREE.OctahedronGeometry(s * 0.28, 0).scale(0.6, 1.8, 0.6), P.glowViolet, {
          at: [p[0] + Math.cos(a) * s * 0.5, p[1] + s * 0.5, p[2] - Math.sin(a) * s * 0.5],
          rotation: [r() * 20, r() * 90, r() * 20],
        }),
        1.2,
      );
    }
    void rock;
  });
}
```

<!-- call: canopyFronds -->

```ts
import * as THREE from "three";
import { aim, catmull, rng, spiral } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildCanopyFronds({ b, J, P, M }: Ctx) {
  void J;
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const TEAL_TOP = "#48d6c0"; // own colour: warmer top of the small fronds

  // ---- merged-by-colour small parts -------------------------------------------------------
  type Bin = { color: string; strength: number; geos: THREE.BufferGeometry[] };
  const bins: Bin[] = [];
  const mk = (color: string, strength = 0) => {
    const bin: Bin = { color, strength, geos: [] };
    bins.push(bin);
    return bin;
  };
  const BIN = {
    vein: mk(P.glowAqua, 1.3),
    dark: mk(P.outline),
    dot: mk(P.glowBlue, 1.6),
    beadA: mk(P.glowAqua, 1.6),
    beadM: mk(P.glowMagenta, 1.7),
    beadV: mk(P.glowViolet, 1.6),
    collar: mk(P.barkDark),
    ring: mk(P.veinCyan, 1.5),
    leaflet: mk(P.leafTeal),
    spireRing: mk(P.glowAqua, 1.4),
  };
  const place = (geo: THREE.BufferGeometry, pos: THREE.Vector3, quat = new THREE.Quaternion()) => {
    geo.applyMatrix4(new THREE.Matrix4().compose(pos, quat, V(1, 1, 1)));
    return geo;
  };
  const rod = (bin: Bin, a: THREE.Vector3, c: THREE.Vector3, r: number, sides = 4) => {
    const d = c.clone().sub(a);
    const g = new THREE.CylinderGeometry(r, r, d.length(), sides, 1);
    bin.geos.push(place(g, a.clone().add(c).multiplyScalar(0.5), aim(d.normalize())));
  };
  const disc = (bin: Bin, pos: THREE.Vector3, dir: THREE.Vector3, r: number, h: number, sides = 8) => {
    bin.geos.push(place(new THREE.CylinderGeometry(r, r, h, sides, 1), pos, aim(dir.clone().normalize())));
  };
  const bead = (bin: Bin, pos: THREE.Vector3, r: number, w = 6, h = 4) => {
    bin.geos.push(place(new THREE.SphereGeometry(r, w, h), pos));
  };
  const cone = (bin: Bin, base: THREE.Vector3, dir: THREE.Vector3, r: number, len: number) => {
    const d = dir.clone().normalize();
    bin.geos.push(place(new THREE.ConeGeometry(r, len, 4, 1), base.clone().addScaledVector(d, len / 2), aim(d)));
  };
  const pv = (p: { x: number; y: number; z: number }) => V(p.x, p.y, p.z);

  // ---- one arching / upright frond ---------------------------------------------------------
  type Cfg = {
    az: number;
    prof: number[][];
    t0: number;
    W: number;
    n: THREE.Vector3;
    cup: number;
    lift: number;
    blade: string;
    tip: string;
    under: string;
    pairs: number;
    stemR: [number, number];
    bead: Bin;
    vs: number; // vein scale
  };

  const frond = (c: Cfg) => {
    const rad = V(Math.sin(c.az), 0, Math.cos(c.az));
    const tang = V(Math.cos(c.az), 0, -Math.sin(c.az));
    const spine = catmull(c.prof.map(([r, y]) => V(rad.x * r, y, rad.z * r)));

    // thick stem (cool, dark) with a socket collar and a glowing ring
    b.sweep(spine.slice(0, 0.84), c.stemR, { color: P.leafDeep, sides: 6 });
    const p0 = pv(spine.at(0));
    const T0 = pv(spine.tangentAt(0));
    disc(BIN.collar, p0.clone().addScaledVector(T0, 0.05), T0, c.stemR[0] * 1.35, 0.1, 7);
    const p1 = pv(spine.at(0.1));
    disc(BIN.ring, p1, pv(spine.tangentAt(0.1)), c.stemR[0] * 1.08, 0.016, 8);

    const width = (u: number) => c.W * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 0.8) + 0.01;
    const bladePt = (u: number, f: number, lift = 0) => {
      const t = c.t0 + u * (1 - c.t0);
      const p = pv(spine.at(t));
      const w = width(u);
      return p.addScaledVector(tang, f * w).addScaledVector(c.n, c.lift + lift - c.cup * Math.abs(f) * w);
    };
    const NB = 12;
    const SPLIT = 8;
    const edge = (side: number, scale: number, drop: number, k0: number, k1: number) => {
      const pts: THREE.Vector3[] = [];
      for (let k = k0; k <= k1; k++) pts.push(bladePt(k / NB, side * scale, -drop));
      return catmull(pts);
    };
    b.membrane(edge(1, 1, 0, 0, SPLIT), edge(-1, 1, 0, 0, SPLIT), {
      color: c.blade,
      thickness: 0.03,
      rows: 4,
      cols: 8,
    });
    b.membrane(edge(1, 1, 0, SPLIT, NB), edge(-1, 1, 0, SPLIT, NB), {
      color: c.tip,
      thickness: 0.03,
      rows: 4,
      cols: 5,
    });
    b.membrane(edge(1, 0.88, 0.024, 0, NB), edge(-1, 0.88, 0.024, 0, NB), {
      color: c.under,
      thickness: 0.016,
      rows: 3,
      cols: 8,
    });

    // outline-coloured underside strip
    const stripPts: THREE.Vector3[] = [];
    for (let k = 0; k <= 7; k++) stripPts.push(bladePt(0.06 + k * 0.125, 0, -0.034));
    b.sweep(catmull(stripPts), [0.026 * c.vs, 0.01], { color: P.outline, sides: 5 });

    // glowing midrib over a dark under-stroke
    const midPts = (lift: number) => {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 11; k++) pts.push(bladePt(0.03 + k * 0.085, 0, lift));
      return catmull(pts);
    };
    b.sweep(midPts(0.017), [0.024 * c.vs, 0.012 * c.vs], { color: P.outline, sides: 5 });
    glow(b.sweep(midPts(0.03), [0.014 * c.vs, 0.006], { color: P.veinCyan, sides: 5 }), 1.5);

    // angled side veins, in pairs, with dark under-strokes
    for (let j = 0; j < c.pairs; j++) {
      const u = 0.12 + j * (0.58 / c.pairs);
      const u2 = Math.min(u + 0.2, 0.96);
      for (const side of [1, -1]) {
        rod(BIN.vein, bladePt(u, 0, 0.03), bladePt(u2, side * 0.92, 0.03), 0.0065 * c.vs + 0.0015);
        rod(BIN.dark, bladePt(u, 0, 0.017), bladePt(u2, side * 0.92, 0.017), 0.011 * c.vs + 0.002);
      }
    }
    // rim of tiny blue dots
    for (const side of [1, -1])
      for (let k = 0; k < 9; k++) bead(BIN.dot, bladePt(0.1 + k * 0.1, side, 0.02), 0.013 * c.vs + 0.003, 4, 2);
    // tip bead
    bead(c.bead, bladePt(1, 0, 0.025), 0.03 * c.vs + 0.006);
  };

  // ---- 8 big umbrella fronds -----------------------------------------------------------------
  const y0 = M.frondRing[1] - 0.03;
  const evenProf = [
    [0.32, y0],
    [0.58, y0 + 0.36],
    [0.95, y0 + 0.55],
    [1.28, y0 + 0.51],
    [1.55, y0 + 0.3],
  ];
  const oddProf = [
    [0.32, y0],
    [0.56, y0 + 0.26],
    [0.92, y0 + 0.38],
    [1.25, y0 + 0.26],
    [1.5, y0 + 0.0],
  ];
  for (let i = 0; i < 8; i++) {
    const even = i % 2 === 0;
    frond({
      az: (i * Math.PI) / 4,
      prof: even ? evenProf : oddProf,
      t0: 0.28,
      W: (even ? 0.27 : 0.23) * (0.95 + R() * 0.1),
      n: V(0, 1, 0),
      cup: 0.35,
      lift: 0.045,
      blade: P.leafMid,
      tip: P.leafTeal,
      under: P.leafDeep,
      pairs: even ? 5 : 4,
      stemR: [0.065, 0.022],
      bead: even ? BIN.beadA : BIN.beadM,
      vs: 1,
    });
  }

  // ---- 3 smaller upright secondary fronds ----------------------------------------------------
  for (let k = 0; k < 3; k++) {
    const az = ((20 + k * 120) * Math.PI) / 180;
    const rad = V(Math.sin(az), 0, Math.cos(az));
    frond({
      az,
      prof: [
        [0.26, y0 - 0.02],
        [0.31, y0 + 0.3],
        [0.4, y0 + 0.58],
        [0.55, y0 + 0.78],
      ],
      t0: 0.25,
      W: 0.095,
      n: rad,
      cup: 0.3,
      lift: 0.03,
      blade: TEAL_TOP,
      tip: P.glowAqua,
      under: P.leafTeal,
      pairs: 3,
      stemR: [0.045, 0.015],
      bead: BIN.beadV,
      vs: 0.65,
    });
  }

  // ---- tall fiddlehead spire -----------------------------------------------------------------
  const stemP = catmull([V(0, 2.36, 0), V(0.04, 2.72, 0.02), V(-0.01, 3.08, -0.02), V(0, 3.44, 0)]);
  const curl = spiral(V(0, 3.44, 0.16), V(0, 3.44, 0), V(1, 0, 0), { turns: 1.2, r1: 0.045 });
  const spirePath = stemP.concat(curl);
  const spireR = (t: number) => (t < 0.6 ? 0.055 - 0.021 * (t / 0.6) : 0.034 - 0.024 * ((t - 0.6) / 0.4));
  b.sweep(spirePath, spireR, { color: P.leafMid, sides: 6 });
  for (const t of [0.1, 0.2, 0.3, 0.4, 0.5]) {
    const p = pv(spirePath.at(t));
    const T = pv(spirePath.tangentAt(t));
    disc(BIN.dark, p, T, spireR(t) + 0.016, 0.034, 7);
    disc(BIN.spireRing, p, T, spireR(t) + 0.01, 0.018, 7);
  }
  [0.14, 0.26, 0.38, 0.5, 0.64].forEach((t, k) => {
    const p = pv(spirePath.at(t));
    const phi = k * 2.4;
    cone(BIN.leaflet, p, V(Math.cos(phi), 0.55, Math.sin(phi)), 0.032, 0.17);
  });
  const sEnd = pv(spirePath.at(1));
  const sT = pv(spirePath.tangentAt(1));
  disc(BIN.dark, sEnd.clone().addScaledVector(sT, -0.005), sT, 0.034, 0.03, 6);
  bead(BIN.beadM, sEnd.clone().addScaledVector(sT, 0.035), 0.05);

  // ---- two curled glowing violet tendrils beside the spire -----------------------------------
  for (const s of [1, -1]) {
    const st = catmull([
      V(s * 0.13, 2.38, 0.03),
      V(s * 0.2, 2.66, 0.04),
      V(s * 0.25, 2.92, 0.02),
      V(s * 0.25, 3.06, 0.02),
    ]);
    const cu = spiral(V(s * 0.35, 3.06, 0.02), V(s * 0.25, 3.06, 0.02), V(0, 0, -s), { turns: 1.1, r1: 0.028 });
    const path = st.concat(cu);
    glow(b.sweep(path, [0.022, 0.008], { color: P.glowViolet, sides: 5 }), 1.5);
    bead(BIN.beadA, pv(path.at(1)), 0.022);
  }

  // ---- flush merged parts --------------------------------------------------------------------
  for (const bin of bins) {
    if (!bin.geos.length) continue;
    const merged = mergeGeometries(bin.geos);
    if (!merged) continue;
    const part = b.part(merged, bin.color, { at: [0, 0, 0], flat: true });
    if (bin.strength > 0) glow(part, bin.strength);
  }
}
```

<!-- call: groundFlora -->

```ts
import * as THREE from "three";
import { catmull, spiral, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildGroundFlora({ b, P }: Ctx) {
  const rand = rng(2024);
  const rr = (a: number, c: number) => a + (c - a) * rand();
  const Y = new THREE.Vector3(0, 1, 0);
  const X = new THREE.Vector3(1, 0, 0);
  const DEG = Math.PI / 180;
  type V3 = [number, number, number];

  // Own colours (kept to one extra: a lighter violet for cap tops).
  const CAP_HI = "#9d62f2";

  // ---------------------------------------------------------------- bucketed small pieces
  // Small repeated details (spots, beads, leaves, rims, outlines) are merged per colour and glow strength.
  type Bucket = { color: string; strength: number; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bucket>();
  const tiltQ = (phi: number, theta: number) =>
    new THREE.Quaternion()
      .setFromAxisAngle(Y, phi)
      .multiply(new THREE.Quaternion().setFromAxisAngle(X, theta));
  const add = (
    color: string,
    strength: number,
    geo: THREE.BufferGeometry,
    pos: V3,
    o: { q?: THREE.Quaternion; s?: V3 } = {},
  ) => {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...pos),
      o.q ?? new THREE.Quaternion(),
      new THREE.Vector3(...(o.s ?? [1, 1, 1])),
    );
    geo.applyMatrix4(m);
    const key = `${color}|${strength}`;
    let bk = buckets.get(key);
    if (!bk) buckets.set(key, (bk = { color, strength, geos: [] }));
    bk.geos.push(geo);
  };

  const sphere = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
  const cone = (r: number, h: number, seg = 5) => new THREE.ConeGeometry(r, h, seg).translate(0, h / 2, 0);
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const hemi = (r: number, w = 8, h = 3) => new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, Math.PI / 2);
  const torus = (r: number, tube: number, rad = 4, seg = 16) => new THREE.TorusGeometry(r, tube, rad, seg);
  const flatQ = new THREE.Quaternion().setFromAxisAngle(X, Math.PI / 2);

  const blade = (w: number, h: number) => {
    const s = new THREE.Shape();
    s.moveTo(-w, 0);
    s.lineTo(w, 0);
    s.lineTo(w * 0.55, h * 0.55);
    s.lineTo(0, h);
    s.lineTo(-w * 0.55, h * 0.55);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.005, bevelEnabled: false });
    g.translate(0, 0, -0.0025);
    return g;
  };

  // ---------------------------------------------------------------- ground model
  const ground = (r: number) => 0.02 + 0.1 * Math.max(0, 1 - (r / 1.3) ** 2);

  // floor patch + dark skirt so everything connects to the mound
  b.part(new THREE.CylinderGeometry(1.55, 1.55, 0.02, 14), P.groundMoss, { at: [0, 0.01, 0], flat: true });
  b.part(new THREE.CylinderGeometry(1.6, 1.6, 0.012, 14), P.groundDark, { at: [0, 0.006, 0], flat: true });

  // ---------------------------------------------------------------- mushroom
  const TOP: [number, number][] = [
    [0, 0.5],
    [0.45, 0.44],
    [0.78, 0.3],
    [0.98, 0.1],
  ];
  const topY = (f: number) => {
    for (let i = 0; i < TOP.length - 1; i++) {
      const [x0, y0] = TOP[i];
      const [x1, y1] = TOP[i + 1];
      if (f <= x1) return y0 + ((y1 - y0) * (f - x0)) / (x1 - x0);
    }
    return TOP[TOP.length - 1][1];
  };

  function mushroom(x: number, z: number, h: number, spot: string, rim: string, capColor: string = P.mushroomCap) {
    const gb = ground(Math.hypot(x, z));
    const R = 0.05 + 0.22 * h;
    const sR = 0.006 + 0.2 * R;
    const lx = rr(-0.02, 0.02);
    const lz = rr(-0.02, 0.02);
    const C: V3 = [x + lx, gb + h, z + lz];

    // stem: faceted, mossy foot, pale body
    b.sweep(
      catmull([
        [x, 0.004, z],
        [x + lx * 0.3, gb + h * 0.45, z + lz * 0.3],
        C,
      ]),
      (t: number) => sR * (1.55 - 0.75 * t),
      { sides: 6, color: P.stemPale, bands: [[0.14, P.mossTeal]], caps: { start: "flat", end: "flat" } },
    );
    // moss tufts at the foot
    for (let i = 0; i < 3; i++) {
      const a = rr(0, 6.28);
      add(P.mossBright, 0, sphere(0.022, 5, 3), [x + Math.sin(a) * sR * 1.7, gb + 0.004, z + Math.cos(a) * sR * 1.7], {
        s: [1, 0.6, 1],
      });
    }
    // glowing stem ring on taller ones
    if (h > 0.25) {
      add(P.glowAqua, 1.2, torus(sR * 1.12, 0.006, 4, 8), [x + lx * 0.6, gb + h * 0.72, z + lz * 0.6], { q: flatQ });
    }

    // cap: faceted lathe dome
    const prof: [number, number][] = [
      [0, -0.08],
      [0.5, -0.1],
      [1.0, -0.02],
      [0.98, 0.1],
      [0.78, 0.3],
      [0.45, 0.44],
      [0, 0.5],
    ].map(([px, py]) => [px * R, py * R] as [number, number]);
    const cap = b.lathe(prof, { at: C, axis: [0, 1, 0], segments: 8, spin: rr(0, 45), color: capColor });
    glow(cap, 0.5);

    // lighter top dome (warmer on top)
    add(CAP_HI, 0.6, hemi(0.4 * R, 8, 3), [C[0], C[1] + 0.4 * R, C[2]], { s: [1, 0.45, 1] });
    // underside gill block in violet
    add(P.glowViolet, 1.1, cyl(0.84 * R, 0.5 * R, 0.12 * R, 8), [C[0], C[1] - 0.1 * R, C[2]]);
    // dark outline band under the glowing rim, then the rim
    add(P.outline, 0, cyl(1.06 * R, 1.06 * R, 0.07 * R, 8), [C[0], C[1] + 0.0, C[2]]);
    add(rim, 1.4, torus(0.99 * R, Math.max(0.007, 0.04 * R), 4, 16), [C[0], C[1] + 0.08 * R, C[2]], { q: flatQ });
    // spots with outline underlays
    const n = R < 0.1 ? 3 : 5;
    const off = rr(0, 6.28);
    const sp = Math.max(0.013, 0.11 * R);
    for (let k = 0; k < n; k++) {
      const phi = off + (k * Math.PI * 2) / n;
      const f = 0.7;
      const px = C[0] + Math.sin(phi) * f * R;
      const pz = C[2] + Math.cos(phi) * f * R;
      const py = C[1] + topY(f) * R;
      const q = tiltQ(phi, 0.4);
      add(P.outline, 0, sphere(sp * 1.4, 5, 3), [px, py - 0.55 * sp, pz], { q, s: [1, 0.4, 1] });
      add(spot, 1.3, sphere(sp, 5, 3), [px, py - 0.2 * sp, pz], { q, s: [1, 0.45, 1] });
    }
    add(rim, 1.4, sphere(Math.max(0.011, 0.08 * R), 5, 3), [C[0], C[1] + 0.57 * R, C[2]]);
  }

  // ---------------------------------------------------------------- fiddlehead
  function fiddle(x: number, z: number, h: number) {
    const r0 = Math.hypot(x, z);
    const ux = x / r0;
    const uz = z / r0;
    const gb = ground(r0);
    const rc = h * 0.16;
    const stalkH = h - 2 * rc;
    const lean = 0.03;
    const T: V3 = [x + ux * lean, gb + stalkH, z + uz * lean];
    const stalk = catmull([
      [x, 0.004, z],
      [x + ux * lean * 0.2, gb + stalkH * 0.35, z + uz * lean * 0.2],
      [x + ux * lean * 0.7, gb + stalkH * 0.75, z + uz * lean * 0.7],
      T,
    ]);
    const center: V3 = [T[0] + ux * rc, T[1], T[2] + uz * rc];
    const axis: V3 = [uz, 0, -ux];
    const curl = spiral(center, T, axis, { turns: 1.2, r1: rc * 0.3 });
    const full = stalk.concat(curl);
    b.sweep(full, [0.02, 0.007], {
      sides: 6,
      color: (t: number) => (t < 0.5 ? P.mossTeal : P.mossBright),
    });
    // tip: dark calyx behind a glowing bulb
    const tp = curl.at(1);
    const tg = curl.tangentAt(1);
    const tipCol = rand() < 0.5 ? P.glowMagenta : P.glowAqua;
    add(P.outline, 0, sphere(0.03, 6, 4), [tp.x - tg.x * 0.02, tp.y - tg.y * 0.02, tp.z - tg.z * 0.02]);
    add(tipCol, 1.5, sphere(0.022, 6, 4), [tp.x, tp.y, tp.z]);
    // beads along the curl
    for (const t of [0.2, 0.45, 0.7]) {
      const p = curl.at(t);
      add(P.glowAqua, 1.3, sphere(0.012, 5, 3), [p.x, p.y, p.z]);
    }
    // leaflets up the stalk
    [0.35, 0.65, 0.9].forEach((tt, i) => {
      const p = stalk.at(tt);
      const side = i % 2 ? 1 : -1;
      const dx = ux * 0.3 + uz * side;
      const dz = uz * 0.3 - ux * side;
      const phi = Math.atan2(dx, dz);
      add(P.leafTeal, 0, cone(0.02, 0.09, 4), [p.x, p.y, p.z], { q: tiltQ(phi, 1.0), s: [1, 1, 0.3] });
    });
  }

  // ---------------------------------------------------------------- bulb sprout
  function bulb(x: number, z: number, s: number) {
    const r0 = Math.hypot(x, z);
    const gb = ground(r0) - 0.01;
    const ux = x / r0;
    const uz = z / r0;
    const cy = gb + s * 1.05;
    add(P.glowBlue, 1.3, sphere(s, 8, 5), [x, cy, z], { s: [1, 1.15, 1] });
    add(P.glowAqua, 1.5, sphere(s * 0.28, 5, 3), [x + ux * s * 0.5, cy + s * 0.5, z + uz * s * 0.5]);
    add(P.glowViolet, 1.4, sphere(s * 0.2, 5, 3), [x, cy + s * 1.15, z]);
    const a0 = Math.atan2(ux, uz) + 20 * DEG;
    for (let k = 0; k < 3; k++) {
      const phi = a0 + (k * Math.PI * 2) / 3;
      add(
        P.leafDeep,
        0,
        cone(s * 0.85, s * 3.2, 4),
        [x + Math.sin(phi) * s * 0.5, gb, z + Math.cos(phi) * s * 0.5],
        { q: tiltQ(phi, 0.42), s: [1, 1, 0.3] },
      );
    }
  }

  // ---------------------------------------------------------------- pads, grass, spores
  function pad(x: number, z: number, R: number) {
    const gb = ground(Math.hypot(x, z));
    add(P.outline, 0, cyl(R * 1.2, R * 1.2, 0.006, 8), [x, gb + 0.004, z]);
    add(P.veinCyan, 1.0, cyl(R, R, 0.01, 8), [x, gb + 0.008, z]);
    add(P.glowAqua, 1.3, cyl(R * 0.5, R * 0.5, 0.012, 8), [x, gb + 0.011, z]);
  }
  function tuft(x: number, z: number, count: number, hmax: number) {
    const gb = ground(Math.hypot(x, z)) - 0.005;
    for (let i = 0; i < count; i++) {
      const phi = rr(0, Math.PI * 2);
      const tilt = rr(0.12, 0.6);
      const hh = hmax * rr(0.6, 1);
      const col = i % 3 === 0 ? P.leafMid : i % 3 === 1 ? P.leafTeal : P.mossBright;
      add(col, 0, blade(0.014, hh), [x + Math.sin(phi) * 0.012, gb, z + Math.cos(phi) * 0.012], {
        q: tiltQ(phi, tilt),
      });
    }
  }
  function bud(x: number, z: number, h: number, col: string) {
    const gb = ground(Math.hypot(x, z));
    add(P.leafTeal, 0, cyl(0.007, 0.012, h, 5), [x, gb + h / 2 - 0.005, z]);
    add(P.outline, 0, sphere(0.036, 6, 4), [x, gb + h - 0.012, z], { s: [1, 0.7, 1] });
    add(col, 1.5, sphere(0.028, 6, 4), [x, gb + h + 0.005, z]);
  }

  // ---------------------------------------------------------------- clusters
  type Cl = {
    az: number;
    r: number;
    m: { dt: number; dr: number; h: number; spot: string; rim: string }[];
    f: { dt: number; dr: number; h: number }[];
    bu: { dt: number; dr: number; s: number };
    pads: { dt: number; dr: number; R: number }[];
    g: { dt: number; dr: number; n: number; h: number }[];
  };
  const MG = P.glowMagenta;
  const AQ = P.glowAqua;
  const clusters: Cl[] = [
    {
      az: 30,
      r: 1.2,
      m: [
        { dt: -0.16, dr: 0.05, h: 0.32, spot: MG, rim: AQ },
        { dt: 0.14, dr: -0.16, h: 0.2, spot: AQ, rim: MG },
      ],
      f: [
        { dt: 0.06, dr: 0.17, h: 0.38 },
        { dt: 0.24, dr: 0.05, h: 0.2 },
      ],
      bu: { dt: -0.14, dr: -0.18, s: 0.05 },
      pads: [
        { dt: 0.27, dr: -0.12, R: 0.09 },
        { dt: -0.3, dr: 0.18, R: 0.06 },
      ],
      g: [
        { dt: 0.0, dr: -0.22, n: 5, h: 0.14 },
        { dt: -0.3, dr: -0.05, n: 4, h: 0.1 },
      ],
    },
    {
      az: 90,
      r: 1.25,
      m: [
        { dt: -0.12, dr: 0.06, h: 0.17, spot: AQ, rim: MG },
        { dt: 0.1, dr: -0.08, h: 0.14, spot: MG, rim: AQ },
        { dt: 0.0, dr: 0.15, h: 0.11, spot: AQ, rim: MG },
      ],
      f: [{ dt: 0.2, dr: 0.1, h: 0.22 }],
      bu: { dt: -0.2, dr: -0.12, s: 0.035 },
      pads: [
        { dt: 0.25, dr: -0.15, R: 0.07 },
        { dt: -0.28, dr: 0.12, R: 0.06 },
      ],
      g: [{ dt: 0.0, dr: -0.22, n: 4, h: 0.1 }],
    },
    {
      az: 150,
      r: 1.25,
      m: [
        { dt: 0.13, dr: 0.05, h: 0.18, spot: MG, rim: AQ },
        { dt: -0.11, dr: -0.08, h: 0.15, spot: AQ, rim: MG },
        { dt: 0.0, dr: 0.17, h: 0.12, spot: MG, rim: AQ },
      ],
      f: [{ dt: -0.21, dr: 0.12, h: 0.25 }],
      bu: { dt: 0.2, dr: -0.14, s: 0.04 },
      pads: [
        { dt: -0.28, dr: -0.12, R: 0.07 },
        { dt: 0.3, dr: 0.1, R: 0.06 },
      ],
      g: [{ dt: 0.02, dr: -0.22, n: 4, h: 0.11 }],
    },
    {
      az: 210,
      r: 1.15,
      m: [
        { dt: 0.14, dr: 0.08, h: 0.36, spot: AQ, rim: MG },
        { dt: -0.16, dr: -0.06, h: 0.22, spot: MG, rim: AQ },
      ],
      f: [
        { dt: -0.02, dr: -0.2, h: 0.4 },
        { dt: -0.26, dr: 0.14, h: 0.18 },
      ],
      bu: { dt: 0.18, dr: -0.17, s: 0.055 },
      pads: [
        { dt: 0.3, dr: 0.12, R: 0.1 },
        { dt: -0.1, dr: 0.25, R: 0.07 },
      ],
      g: [
        { dt: 0.05, dr: 0.22, n: 5, h: 0.15 },
        { dt: -0.3, dr: -0.1, n: 4, h: 0.1 },
      ],
    },
    {
      az: 270,
      r: 1.2,
      m: [
        { dt: -0.14, dr: 0.06, h: 0.42, spot: MG, rim: AQ },
        { dt: 0.16, dr: -0.1, h: 0.26, spot: AQ, rim: MG },
        { dt: 0.02, dr: 0.2, h: 0.16, spot: MG, rim: AQ },
      ],
      f: [
        { dt: 0.05, dr: -0.2, h: 0.35 },
        { dt: -0.3, dr: -0.1, h: 0.2 },
      ],
      bu: { dt: -0.22, dr: -0.16, s: 0.06 },
      pads: [
        { dt: 0.3, dr: 0.12, R: 0.11 },
        { dt: -0.05, dr: 0.28, R: 0.07 },
      ],
      g: [
        { dt: 0.25, dr: -0.22, n: 5, h: 0.15 },
        { dt: -0.12, dr: 0.28, n: 4, h: 0.1 },
      ],
    },
    {
      az: 330,
      r: 1.15,
      m: [
        { dt: 0.1, dr: 0.1, h: 0.5, spot: AQ, rim: MG },
        { dt: -0.18, dr: -0.04, h: 0.3, spot: MG, rim: AQ },
        { dt: 0.24, dr: -0.18, h: 0.2, spot: AQ, rim: MG },
      ],
      f: [
        { dt: -0.05, dr: -0.22, h: 0.45 },
        { dt: -0.3, dr: 0.16, h: 0.22 },
      ],
      bu: { dt: 0.02, dr: -0.28, s: 0.06 },
      pads: [
        { dt: 0.32, dr: 0.12, R: 0.12 },
        { dt: -0.12, dr: 0.26, R: 0.08 },
      ],
      g: [
        { dt: 0.22, dr: 0.26, n: 5, h: 0.16 },
        { dt: -0.3, dr: -0.12, n: 4, h: 0.11 },
      ],
    },
  ];

  for (const cl of clusters) {
    const a = cl.az * DEG;
    const ux = Math.sin(a);
    const uz = Math.cos(a);
    const vx = Math.cos(a);
    const vz = -Math.sin(a);
    const at = (dt: number, dr: number): [number, number] => {
      const r = cl.r + dr;
      return [ux * r + vx * dt, uz * r + vz * dt];
    };
    // low moss hummock under the cluster
    const [cx, cz] = at(0, 0);
    add(P.mossTeal, 0, hemi(0.34, 8, 3), [cx, 0.012, cz], { s: [1, 0.22, 1] });
    add(P.mossBright, 0, hemi(0.2, 7, 3), [cx, 0.012, cz], { s: [1, 0.38, 1] });

    for (const g of cl.g) {
      const [x, z] = at(g.dt, g.dr);
      tuft(x, z, g.n, g.h);
    }
    for (const p of cl.pads) {
      const [x, z] = at(p.dt, p.dr);
      pad(x, z, p.R);
    }
    for (const m of cl.m) {
      const [x, z] = at(m.dt, m.dr);
      mushroom(x, z, m.h, m.spot, m.rim);
    }
    for (const f of cl.f) {
      const [x, z] = at(f.dt, f.dr);
      fiddle(x, z, f.h);
    }
    {
      const [x, z] = at(cl.bu.dt, cl.bu.dr);
      bulb(x, z, cl.bu.s);
    }
    // a couple of drifting spore specks near the cluster
    for (let i = 0; i < 2; i++) {
      const [x, z] = at(rr(-0.3, 0.3), rr(-0.25, 0.25));
      add(i ? P.glowAqua : P.sporeYellow, 1.5, sphere(0.011, 4, 3), [x, rr(0.2, 0.75), z]);
    }
  }

  // ---------------------------------------------------------------- tiny extras at radius 1.5-1.6
  const extras: [number, number, string][] = [
    [10, 1.52, "m1"],
    [130, 1.5, "b1"],
    [250, 1.53, "m2"],
    [310, 1.5, "b2"],
  ];
  for (const [az, r, kind] of extras) {
    const x = Math.sin(az * DEG) * r;
    const z = Math.cos(az * DEG) * r;
    if (kind === "m1") mushroom(x, z, 0.09, AQ, MG);
    else if (kind === "m2") mushroom(x, z, 0.11, MG, AQ);
    else if (kind === "b1") bud(x, z, 0.11, MG);
    else bud(x, z, 0.09, AQ);
  }

  // ---------------------------------------------------------------- glowing flecks on the floor patch
  for (let i = 0; i < 18; i++) {
    const az = rr(0, 360);
    if (Math.abs(((az + 30) % 60) - 30) < 6) continue; // keep off the root lines
    const r = rr(0.95, 1.5);
    add(i % 3 === 0 ? P.glowViolet : P.glowAqua, 1.3, cyl(0.014, 0.014, 0.006, 5), [
      Math.sin(az * DEG) * r,
      0.022,
      Math.cos(az * DEG) * r,
    ]);
  }

  // ---------------------------------------------------------------- flush merged pieces
  for (const bk of buckets.values()) {
    const geos = bk.geos.map((g) => (g.index ? g.toNonIndexed() : g));
    const merged = mergeGeometries(geos);
    if (!merged) continue;
    const part = b.part(merged, bk.color, { at: [0, 0, 0], flat: true });
    if (bk.strength > 0) glow(part, bk.strength);
  }
}
```

<!-- call: trunk -->

```ts
import * as THREE from "three";
import { catmull, frame, offset, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTrunk({ b, P }: Ctx) {
  const rand = rng(21);
  const V = THREE.Vector3;
  const DEG = Math.PI / 180;

  // ---- own colours (besides the palette) ----
  const PLATE_LO = "#3a4585";
  const PLATE_HI = "#5864b0";
  const RIDGE_LIGHT = "#6b7bd0";

  // ---- trunk shape: one analytic description, reused by every detail ----
  const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
  const smooth = (a: number, c: number, x: number) => {
    const t = clamp01((x - a) / (c - a));
    return t * t * (3 - 2 * t);
  };
  const Y0 = 0.4;
  const Y1 = 2.35;
  // gentle S-curve that settles back to x=z=0 for the knuckle
  const centre = (y: number) => {
    const u = clamp01((y - Y0) / (Y1 - Y0));
    const k = 1 - smooth(0.6, 0.9, u);
    return new V(0.08 * Math.sin(Math.PI * u) * k, y, -0.07 * Math.sin(2 * Math.PI * u) * k);
  };
  const TRUNK_KEYS = [0.57, 0.55, 0.52, 0.49, 0.46, 0.43, 0.41, 0.38, 0.36, 0.34, 0.32, 0.31, 0.3];
  const trunkR = (y: number) => {
    const f = clamp01((y - Y0) / (Y1 - Y0)) * (TRUNK_KEYS.length - 1);
    const i = Math.min(Math.floor(f), TRUNK_KEYS.length - 2);
    return TRUNK_KEYS[i] + (TRUNK_KEYS[i + 1] - TRUNK_KEYS[i]) * (f - i);
  };
  const COLLAR: [number, number][] = [
    [0.36, 0.68],
    [0.48, 0.64],
    [0.6, 0.56],
    [0.78, 0.47],
  ];
  const KNUCKLE: [number, number][] = [
    [1.97, 0.36],
    [2.12, 0.41],
    [2.24, 0.45],
    [2.36, 0.41],
    [2.43, 0.3],
  ];
  const lin = (pts: [number, number][], y: number) => {
    if (y < pts[0][0] || y > pts[pts.length - 1][0]) return 0;
    for (let i = 0; i < pts.length - 1; i++) {
      if (y <= pts[i + 1][0]) {
        const t = (y - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
        return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
      }
    }
    return 0;
  };
  const R = (y: number) => Math.max(trunkR(y), lin(COLLAR, y), lin(KNUCKLE, y));
  // a point on the skin at height y, azimuth az (0 = +Z, 90 = +X), lifted out along the normal
  const S = (y: number, az: number, lift = 0) => {
    const a = az * DEG;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const c = centre(y);
    const r = R(y) * 0.955;
    const dr = (R(y + 0.02) - R(y - 0.02)) / 0.04;
    const n = new V(dx, -dr, dz).normalize();
    const at = new V(c.x + dx * r, y, c.z + dz * r).addScaledVector(n, lift);
    return { at, n };
  };
  const fr = (y: number, az: number, lift = 0) => {
    const s = S(y, az, lift);
    return frame(s.at, s.n);
  };

  // ---- main bodies ----
  const trunkPts: THREE.Vector3[] = [];
  for (let i = 0; i < 14; i++) trunkPts.push(centre(Y0 + i * 0.15));
  b.sweep(catmull(trunkPts), TRUNK_KEYS, {
    color: P.barkMid,
    section: { ngon: 8 },
    caps: "flat",
    twist: 40,
  });

  // flared base collar that sinks into the mound
  b.lathe(
    [
      [0, 0.36],
      [0.68, 0.36],
      [0.64, 0.48],
      [0.56, 0.6],
      [0.47, 0.78],
      [0, 0.78],
    ],
    { at: [0, 0, 0], segments: 8, color: P.barkMid },
  );
  // dark skirt band at the very bottom of the collar
  b.lathe(
    [
      [0, 0.34],
      [0.7, 0.34],
      [0.68, 0.4],
      [0, 0.4],
    ],
    { at: [0, 0, 0], segments: 8, color: P.barkDark },
  );

  // crown knuckle
  b.lathe(
    [
      [0, 1.97],
      [0.36, 1.97],
      [0.41, 2.12],
      [0.45, 2.24],
      [0.41, 2.36],
      [0.3, 2.43],
      [0, 2.43],
    ],
    { at: [0, 0, 0], segments: 8, color: P.barkLight },
  );

  // mossy top
  b.lathe(
    [
      [0, 0],
      [0.32, 0],
      [0.29, 0.03],
      [0.2, 0.065],
      [0.08, 0.085],
      [0, 0.09],
    ],
    { at: [0, 2.42, 0], segments: 8, color: P.mossBright },
  );
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.32, 0.02],
      [0, 0.02],
    ],
    { at: [0, 2.405, 0], segments: 8, color: P.mossTeal },
  );
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 + 20) * DEG;
    glow(
      b.part(new THREE.SphereGeometry(0.016, 5, 4), i % 2 ? P.glowAqua : P.glowMagenta, {
        at: [Math.sin(a) * 0.22, 2.505 - 0.02, Math.cos(a) * 0.22],
      }),
      1.4,
    );
  }

  // ---- bands round the knuckle ----
  const ring = (y: number, lift: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 16; i++) pts.push(S(y, i * 22.5, lift).at);
    return catmull(pts, { closed: true });
  };
  b.sweep(ring(2.06, 0.005), 0.03, { color: P.outline });
  glow(b.sweep(ring(2.06, 0.028), 0.011, { color: P.veinCyan }), 1.3);

  // ---- ridges (dark strips with a light highlight beside) ----
  const route = (az0: number, y0: number, y1: number, twist: number, lift: number, wob = 0, n = 18) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const y = y0 + (y1 - y0) * t;
      const az = az0 + twist * t + wob * Math.sin(t * 11 + az0);
      pts.push(S(y, az, lift).at);
    }
    return catmull(pts);
  };
  for (let i = 0; i < 7; i++) {
    const az0 = i * 51.4 + 8;
    b.sweep(route(az0, 0.8, 2.0, 60, 0, 0, 12), (t) => 0.012 + 0.03 * Math.sin(Math.PI * t), {
      color: P.barkDark,
      sides: 6,
    });
    b.sweep(route(az0 + 24, 0.9, 1.95, 60, 0.02, 0, 12), (t) => 0.008 + 0.014 * Math.sin(Math.PI * t), {
      color: RIDGE_LIGHT,
      sides: 5,
    });
  }

  // ---- chunky bark plates in three levels ----
  const plate = (y: number, az: number, col: string) => {
    const s = S(y, az, 0.004);
    const up = new V(0, 1, 0).addScaledVector(s.n, -s.n.y).normalize();
    const side = new V().crossVectors(up, s.n).normalize();
    const th = (rand() - 0.5) * 0.5;
    const yy = up.clone().multiplyScalar(Math.cos(th)).addScaledVector(side, -Math.sin(th));
    const xx = side.clone().multiplyScalar(Math.cos(th)).addScaledVector(up, Math.sin(th));
    const w = R(y) * 0.52;
    const h = 0.15;
    const j = () => (rand() - 0.5) * 0.03;
    const pts: [number, number][] = [
      [-w * 0.95 + j(), -h * 0.75],
      [-w * 0.35, -h + j()],
      [w * 0.65, -h * 0.9 + j()],
      [w + j(), -h * 0.15],
      [w * 0.85, h * 0.8],
      [w * 0.05, h + j()],
      [-w * 0.8, h * 0.85 + j()],
      [-w * 1.02, h * 0.05],
    ];
    const back = pts.map(([x, yv]) => [x * 1.14, yv * 1.14] as [number, number]);
    b.extrude(back, {
      at: s.at.clone().addScaledVector(s.n, -0.008),
      x: xx,
      y: yy,
      thickness: 0.05,
      bevel: 0.008,
      color: P.barkDark,
    });
    b.extrude(pts, { at: s.at, x: xx, y: yy, thickness: 0.06, bevel: 0.012, color: col });
  };
  const moss = (y: number, az: number, col: string) => {
    const s = S(y, az, 0.02);
    b.stick(new THREE.IcosahedronGeometry(0.06, 0), col, frame(s.at, [s.n.x * 0.4, 1, s.n.z * 0.4]), {
      scale: [1.3, 0.45, 1],
      embed: 0.3,
      flat: true,
    });
  };
  for (let i = 0; i < 6; i++) {
    plate(0.78, i * 60 + 15, PLATE_LO);
    plate(1.22, i * 60 + 45, P.barkLight);
    if (i % 2 === 0) moss(0.78 + 0.15, i * 60 + 15, P.mossTeal);
    if (i % 2 === 1) moss(1.22 + 0.15, i * 60 + 45, P.mossBright);
  }
  for (let i = 0; i < 5; i++) plate(1.9, i * 72, PLATE_HI);

  // ---- spiral glowing veins ----
  const veins: [number, string, string][] = [
    [0, P.veinCyan, P.glowAqua],
    [120, P.glowAqua, P.veinCyan],
    [240, P.veinCyan, P.glowAqua],
  ];
  for (const [az0, main, core] of veins) {
    const twist = 300;
    const y0 = 0.45;
    const y1 = 2.15;
    b.sweep(route(az0, y0, y1, twist, 0.018, 10), (t) => 0.044 - 0.012 * t, { color: P.outline, sides: 6 });
    const mainPath = route(az0, y0, y1, twist, 0.05, 10);
    glow(b.sweep(mainPath, (t) => 0.026 - 0.007 * t, { color: main, sides: 6 }), 1.4);
    glow(b.sweep(route(az0, y0, y1, twist, 0.075, 10), (t) => 0.011 - 0.002 * t, { color: core, sides: 5 }), 1.8);
    for (let k = 0; k < 6; k++) {
      const t = 0.1 + k * 0.15;
      glow(
        b.part(new THREE.SphereGeometry(0.038 - 0.01 * t, 6, 5), k % 2 ? core : main, {
          at: mainPath.at(t),
        }),
        1.6,
      );
    }
  }

  // ---- knots / burls with glowing orbs ----
  const knots: [number, number, number, string][] = [
    [0.85, 40, 0.18, P.glowMagenta],
    [1.1, 205, 0.16, P.glowViolet],
    [1.4, 320, 0.15, P.glowMagenta],
    [1.85, 160, 0.13, P.glowViolet],
    [1.7, 20, 0.12, P.glowViolet],
  ];
  for (const [y, az, rr, orbCol] of knots) {
    const f = fr(y, az, 0);
    const s = rr / 0.16;
    b.stick(new THREE.IcosahedronGeometry(rr, 0), PLATE_LO, f, { scale: [1.15, 0.5, 1], embed: 0.3, flat: true });
    b.stick(new THREE.TorusGeometry(0.1 * s, 0.03 * s, 5, 8).rotateX(Math.PI / 2), P.outline, f.moved([0, 0.04 * s, 0]), {
      embed: 0.1,
      flat: true,
    });
    b.stick(new THREE.CylinderGeometry(0.078 * s, 0.078 * s, 0.03, 8), P.outline, f.moved([0, 0.04 * s, 0]), {
      embed: 0.3,
    });
    glow(
      b.stick(new THREE.SphereGeometry(0.058 * s, 7, 5), orbCol, f.moved([0, 0.05 * s, 0]), { embed: 0.2 }),
      1.9,
    );
    glow(
      b.stick(new THREE.SphereGeometry(0.016 * s, 4, 3), P.glowAqua, f.moved([0.02 * s, 0.1 * s, 0.02 * s]), {
        embed: 0.1,
      }),
      2,
    );
  }

  // ---- stub branches with glowing bulbs and moss caps ----
  for (const az of [100, 260]) {
    const s = S(1.6, az, 0);
    const n = s.n;
    const Y = new V(0, 1, 0);
    const p0 = s.at.clone().addScaledVector(n, -0.12);
    const p1 = s.at.clone().addScaledVector(n, 0.1).addScaledVector(Y, 0.02);
    const p2 = s.at.clone().addScaledVector(n, 0.26).addScaledVector(Y, 0.09);
    const p3 = s.at.clone().addScaledVector(n, 0.38).addScaledVector(Y, 0.2);
    const branch = b.sweep(catmull([p0, p1, p2, p3]), [0.1, 0.055], { color: P.barkMid, sides: 8 });
    b.stick(new THREE.CylinderGeometry(0.12, 0.145, 0.05, 8), P.barkDark, frame(s.at, n), { embed: 0.3 });
    const t = p3.clone().sub(p2).normalize();
    const bulbC = p3.clone().addScaledVector(t, 0.06);
    b.part(new THREE.TorusGeometry(0.078, 0.022, 5, 8), P.outline, { at: p3.clone().addScaledVector(t, 0.01), dir: t, axis: "z" });
    glow(b.part(new THREE.SphereGeometry(0.1, 8, 6), P.glowBlue, { at: bulbC }), 1.5);
    b.part(new THREE.SphereGeometry(0.128, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.mossTeal, {
      at: bulbC.clone().add(new V(0, 0.015, 0)),
      scale: [1, 0.75, 1],
    });
    b.part(new THREE.SphereGeometry(0.115, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.mossBright, {
      at: bulbC.clone().add(new V(0, 0.03, 0)),
      scale: [1, 0.7, 1],
    });
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + az;
      glow(
        b.part(new THREE.SphereGeometry(0.019, 5, 4), P.glowAqua, {
          at: bulbC.clone().add(new V(Math.cos(a) * 0.088, -0.04, Math.sin(a) * 0.088)),
        }),
        1.7,
      );
    }
    b.stick(new THREE.SphereGeometry(0.05, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.mossTeal, branch.at(0.4, 0), {
      scale: [1, 0.6, 1.3],
      embed: 0.3,
    });
    b.stick(new THREE.SphereGeometry(0.04, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.mossBright, branch.at(0.7, 10), {
      scale: [1, 0.6, 1.2],
      embed: 0.3,
    });
  }

  // ---- 8 frond sockets on the knuckle shoulder, glowing dots between ----
  for (let i = 0; i < 8; i++) {
    const f = fr(2.3, i * 45, 0);
    b.stick(new THREE.CylinderGeometry(0.085, 0.105, 0.07, 8), P.barkDark, f, { embed: 0.25 });
    glow(
      b.stick(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 8), i % 2 ? P.glowViolet : P.glowMagenta, f.moved([0, 0.03, 0]), {
        embed: 0.4,
      }),
      1.5,
    );
    glow(
      b.stick(new THREE.SphereGeometry(0.024, 5, 4), i % 2 ? P.glowAqua : P.veinCyan, fr(2.17, i * 45 + 22.5, 0), {
        embed: 0.3,
      }),
      1.6,
    );
  }

  // ---- glow pools and moss clumps at the base (gaps between roots) ----
  for (let i = 0; i < 6; i++) {
    const az = 30 + i * 60;
    const f = fr(0.54, az, 0);
    b.stick(new THREE.CylinderGeometry(0.11, 0.12, 0.03, 8), P.outline, f, { embed: 0.4 });
    glow(
      b.stick(new THREE.SphereGeometry(0.075, 7, 4), i % 2 ? P.glowAqua : P.veinCyan, f.moved([0, 0.012, 0]), {
        scale: [1, 0.4, 1],
        embed: 0.3,
      }),
      1.5,
    );
    const m = fr(0.72, az + 14, 0.01);
    b.stick(new THREE.IcosahedronGeometry(0.07, 0), i % 2 ? P.mossBright : P.mossTeal, m, {
      scale: [1.3, 0.5, 1],
      embed: 0.3,
      flat: true,
    });
  }
}
```