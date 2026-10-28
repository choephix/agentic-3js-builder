import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame, catmull, offset } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Sylvaglow Lumibloom",
  "description": "A towering Pandora-style bioluminescent alien plant: a spiral helicoradian-like stalk crowned by a glowing bell flower, drooping tendril fronds, big fan leaves, and glowing ground pods and roots."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  barkDark: "#1b1840",
  bark: "#2c2a63",
  barkLight: "#44418a",
  leafTeal: "#0f6e7a",
  leafDeep: "#0a3f5a",
  veinCyan: "#35f2ff",
  glowMagenta: "#ff3fd8",
  glowViolet: "#9a5bff",
  glowGreen: "#6dff9c",
  petalPink: "#c04cff",
  petalLight: "#f08aff",
  coreWhite: "#e9ffff",
  soil: "#14102a",
  moss: "#1f7a6a",
};
const M = {
  baseTop: [0, 0.5, 0] as [number, number, number],
  trunkMid: [0, 1.6, 0.15] as [number, number, number],
  leafRingL: [0.1, 1.5, 0.15] as [number, number, number],
  trunkTop: [0, 2.5, 0.3] as [number, number, number],
  crownRing: [0, 2.45, 0.3] as [number, number, number],
  flowerBase: [0, 2.55, 0.3] as [number, number, number],
  flowerCore: [0, 3, 0.3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // baseRoots
  (() => {
function buildBaseRoots({ b, J, P, M }: Ctx) {
  const R = rng(21);
  const bone = J.root;
  const DEG = Math.PI / 180;
  type V = [number, number, number];

  // ---- ground helpers ----
  const MOUND: [number, number][] = [
    [1.45, 0],
    [1.38, 0.05],
    [1.0, 0.13],
    [0.5, 0.2],
    [0.3, 0.3],
    [0, 0.3],
  ];
  const groundH = (r: number) => {
    if (r >= 1.45) return 0;
    for (let i = 0; i < MOUND.length - 1; i++) {
      const [r0, h0] = MOUND[i];
      const [r1, h1] = MOUND[i + 1];
      if (r <= r0 && r >= r1) return h1 + ((h0 - h1) * (r - r1)) / (r0 - r1);
    }
    return 0.3;
  };
  const polar = (aDeg: number, r: number, lift = 0): V => {
    const a = aDeg * DEG;
    return [Math.sin(a) * r, groundH(r) + lift, Math.cos(a) * r];
  };
  const flatBlob = (rad: number, sx: number, sy: number, sz: number) => {
    const g = new THREE.SphereGeometry(rad, 7, 4);
    g.scale(sx, sy, sz);
    return g;
  };
  const GLOWS = [P.glowMagenta, P.glowViolet, P.veinCyan, P.glowGreen];

  // ---- soil mound and central hub ----
  b.lathe(
    [[0, 0], ...MOUND.slice(0, 5).map(([r, h]) => [r, h] as [number, number]), [0, 0.3]],
    { at: [0, 0, 0], bone, segments: 18, color: P.soil },
  );
  b.lathe(
    [
      [0, 0.15],
      [0.78, 0.15],
      [0.64, 0.3],
      [0.5, 0.45],
      [0.43, 0.56],
      [0, 0.56],
    ],
    { at: [0, 0, 0], bone, segments: 8, color: P.bark },
  );
  b.lathe(
    [
      [0, 0.4],
      [0.66, 0.4],
      [0.58, 0.47],
      [0, 0.47],
    ],
    { at: [0, 0, 0], bone, segments: 8, color: P.barkLight },
  );
  glow(
    b.part(new THREE.TorusGeometry(0.435, 0.018, 5, 16), P.veinCyan, {
      at: [0, 0.535, 0],
      bone,
      dir: [0, 1, 0],
      axis: "z",
    }),
    1.3,
  );

  // ---- six buttress roots ----
  for (let i = 0; i < 6; i++) {
    const aDeg = 30 + 60 * i + (R() - 0.5) * 6;
    const a = aDeg * DEG;
    const L = 1.22 + R() * 0.22;
    const wob = (R() - 0.5) * 0.14;
    const px = Math.cos(a);
    const pz = -Math.sin(a);
    const pt = (rad: number, y: number, w = 0): V => [
      Math.sin(a) * rad + px * w,
      y,
      Math.cos(a) * rad + pz * w,
    ];
    const path = [
      pt(0.08, 0.66),
      pt(0.35, 0.54),
      pt(0.7, 0.28, wob * 0.3),
      pt(L * 0.86, 0.11, wob * 0.8),
      pt(L, 0.04, wob),
    ];
    const root = b.sweep(path, (t) => [0.04 + 0.15 * Math.pow(1 - t, 1.2), 0.035 + 0.11 * Math.pow(1 - t, 1.2)], {
      bone,
      up: [0, 1, 0],
      color: (t: number) => (t > 0.8 ? P.barkDark : P.bark),
      sectors: [[-55, 55, P.barkLight, 0.05, 0.88]],
      caps: "round",
    });

    // glowing veins
    glow(
      b.sweep(root.line(0, 0.004).slice(0.06, 0.92), [0.015, 0.006], {
        bone,
        color: P.veinCyan,
        sides: 5,
      }),
      1.4,
    );
    const sgn = i % 2 ? 1 : -1;
    glow(
      b.sweep(root.line(38 * sgn, 0.004).slice(0.28, 0.78), [0.011, 0.005], {
        bone,
        color: i % 3 === 0 ? P.glowViolet : P.veinCyan,
        sides: 5,
      }),
      1.2,
    );
    glow(
      b.sweep(root.line(-42 * sgn, 0.004).slice(0.36, 0.86), [0.01, 0.004], {
        bone,
        color: P.veinCyan,
        sides: 5,
      }),
      1.2,
    );

    // glowing dots seated on the root
    [0.2, 0.42, 0.6, 0.78].forEach((t, k) => {
      const ang = (k % 2 ? 1 : -1) * (58 + R() * 10);
      glow(
        b.stick(new THREE.SphereGeometry(0.022 + 0.006 * (1 - t), 6, 4), k % 2 ? P.glowMagenta : P.glowViolet, root.at(t, ang), {
          embed: 0.3,
        }),
        1.4,
      );
    });

    // moss on the upward face
    b.stick(flatBlob(0.07, 1.2, 0.45, 1.8), P.moss, root.at(0.5 + R() * 0.15, 22 * sgn), {
      embed: 0.35,
    });
  }

  // ---- glowing pods ----
  const pods: [number, number, number, string][] = [
    [2, 1.0, 0.14, P.glowMagenta],
    [-8, 1.28, 0.09, P.glowGreen],
    [58, 0.95, 0.12, P.glowViolet],
    [66, 1.22, 0.08, P.glowMagenta],
    [118, 1.05, 0.14, P.glowGreen],
    [126, 1.3, 0.09, P.glowViolet],
    [182, 1.0, 0.15, P.glowMagenta],
    [240, 1.12, 0.12, P.glowGreen],
    [302, 1.02, 0.13, P.glowViolet],
  ];
  const hiDir = new THREE.Vector3(0.35, 0.75, 0.55).normalize();
  for (const [ang, r, s, col] of pods) {
    const [x, y, z] = polar(ang, r);
    b.part(new THREE.CylinderGeometry(s * 0.55, s * 0.95, s * 0.5, 6), P.moss, {
      at: [x, y + s * 0.1, z],
      bone,
    });
    glow(
      b.part(new THREE.IcosahedronGeometry(s, 1), col, { at: [x, y + s * 0.75, z], bone, flat: true }),
      1.1,
    );
    glow(
      b.part(new THREE.SphereGeometry(s * 0.2, 5, 4), P.coreWhite, {
        at: [x + hiDir.x * s * 0.92, y + s * 0.75 + hiDir.y * s * 0.92, z + hiDir.z * s * 0.92],
        bone,
      }),
      1.6,
    );
  }

  // ---- mushroom lamps ----
  const mush: [number, number, number, number, string][] = [
    [20, 1.3, 0.2, 0.09, P.glowViolet],
    [70, 0.75, 0.14, 0.07, P.glowMagenta],
    [130, 0.8, 0.26, 0.12, P.veinCyan],
    [170, 1.3, 0.18, 0.08, P.glowMagenta],
    [236, 0.78, 0.22, 0.1, P.glowViolet],
    [312, 1.28, 0.28, 0.13, P.veinCyan],
    [352, 0.72, 0.15, 0.07, P.glowGreen],
  ];
  for (const [ang, r, h, rc, col] of mush) {
    const [x, y, z] = polar(ang, r);
    b.part(new THREE.CylinderGeometry(rc * 0.2, rc * 0.3, h + 0.02, 6), P.barkLight, {
      at: [x, y + h / 2 - 0.01, z],
      bone,
    });
    glow(
      b.lathe(
        [
          [0, 0],
          [rc, 0],
          [rc * 0.98, 0.02],
          [rc * 0.7, rc * 0.45],
          [0, rc * 0.58],
        ],
        { at: [x, y + h, z], bone, segments: 8, color: col },
      ),
      0.9,
    );
    for (let k = 0; k < 2; k++) {
      const sa = (ang + k * 140 + 30) * DEG;
      glow(
        b.part(new THREE.SphereGeometry(rc * 0.12, 5, 4), P.coreWhite, {
          at: [x + Math.sin(sa) * rc * 0.45, y + h + rc * 0.5, z + Math.cos(sa) * rc * 0.45],
          bone,
        }),
        1.5,
      );
    }
  }

  // ---- moss patches and tufts on the ground ----
  const mossSpots: [number, number, number][] = [
    [10, 0.62, 0.2],
    [88, 1.38, 0.18],
    [150, 1.35, 0.22],
    [200, 0.65, 0.17],
    [260, 1.36, 0.2],
    [330, 0.7, 0.19],
    [45, 1.42, 0.16],
    [215, 1.4, 0.15],
  ];
  for (const [ang, r, s] of mossSpots) {
    const [x, y, z] = polar(ang, r);
    b.part(flatBlob(s, 1, 0.16, 0.75), P.moss, {
      at: [x, y, z],
      bone,
      rotation: [0, R() * 180, 0],
    });
  }
  for (let i = 0; i < 8; i++) {
    const ang = i * 45 + 14 + R() * 10;
    const r = 0.6 + R() * 0.8;
    const [x, y, z] = polar(ang, r, 0.04);
    b.part(new THREE.ConeGeometry(0.025, 0.1, 5), "#2fa68a", { at: [x, y, z], bone });
  }

  // ---- glowing ground dots ----
  let placed = 0;
  let guard = 0;
  while (placed < 20 && guard++ < 400) {
    const ang = R() * 360;
    const near = [30, 90, 150, 210, 270, 330].some((ra) => {
      const d = Math.abs(((ang - ra + 540) % 360) - 180);
      return Math.abs(d - 180) < 12;
    });
    if (near) continue;
    const r = 0.5 + R() * 0.95;
    const s = 0.012 + R() * 0.018;
    const [x, y, z] = polar(ang, r, 0.006);
    glow(
      b.part(new THREE.CylinderGeometry(s, s, 0.01, 6), GLOWS[placed % 4], { at: [x, y, z], bone }),
      1.3,
    );
    placed++;
  }
}
    return buildBaseRoots;
  })(),
  // trunk
  (() => {
function buildTrunk({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const CYAN = P.veinCyan;
  const MAG = P.glowMagenta;
  const VIO = P.glowViolet;
  const GRN = P.glowGreen;

  // Rigid bone for things placed at a given height.
  const boneFor = (y: number) => (y < 1.4 ? J.trunk1 : y < 2.0 ? J.trunk2 : J.trunk3);
  const allBones = [J.trunk1, J.trunk2, J.trunk3];

  // ---------- trunk body ----------
  const pts: number[][] = [
    [0, 0.5, 0],
    [0, 0.95, 0.04],
    [0, 1.4, 0.1],
    [0, 2.0, 0.2],
    [0, 2.5, 0.3],
  ];
  const spine = catmull(pts);

  const ribs: [number, number, string][] = [];
  for (let k = 0; k < 8; k++) {
    const a = 22.5 + 45 * k;
    ribs.push([a - 7, a + 7, P.barkDark]);
  }

  const trunk = b.sweep(spine, [0.4, 0.33, 0.3, 0.27, 0.22], {
    section: { ngon: 8 },
    bone: allBones,
    color: P.bark,
    bands: [
      [0.18, P.barkDark],
      [0.62, P.bark],
      [1, P.barkLight],
    ],
    sectors: ribs,
    caps: "flat",
  });
  const skin = b.surface(trunk);

  // ---------- glowing spiral dots ----------
  const TURNS = 2.5;
  const ang = (t: number) => 90 + t * 360 * TURNS;
  const N = 46;
  for (let i = 0; i < N; i++) {
    const t = 0.07 + (0.88 * i) / (N - 1);
    const hit = trunk.at(t, ang(t));
    const big = i % 5 === 0;
    const col = big ? VIO : CYAN;
    const rad = (big ? 0.03 : 0.02) * (0.7 + 0.5 * (1 - t));
    glow(b.stick(new THREE.SphereGeometry(rad, 6, 4), col, hit, { embed: 0.35 }), big ? 1.6 : 1.3);
  }

  // ---------- twisting vein ribbons ----------
  const ribbon = (offDeg: number, color: string, rad: number, t0: number, t1: number) => {
    const p: number[][] = [];
    const M2 = 54;
    for (let i = 0; i < M2; i++) {
      const t = t0 + ((t1 - t0) * i) / (M2 - 1);
      const h = trunk.at(t, ang(t) + offDeg, 0.006);
      p.push([h.at.x, h.at.y, h.at.z]);
    }
    glow(b.sweep(catmull(p), rad, { color, sides: 6, bone: allBones, caps: "round" }), 1.2);
  };
  ribbon(28, CYAN, 0.011, 0.05, 0.95);
  ribbon(208, VIO, 0.009, 0.1, 0.92);

  // ---------- short glowing cracks ----------
  for (let i = 0; i < 12; i++) {
    const t = 0.1 + r() * 0.75;
    const a = 22.5 + 45 * Math.floor(r() * 8);
    const h0 = trunk.at(t, a, 0.004);
    const h1 = trunk.at(Math.min(0.97, t + 0.035 + r() * 0.03), a + (r() - 0.5) * 10, 0.004);
    glow(
      b.rod([h0.at.x, h0.at.y, h0.at.z], [h1.at.x, h1.at.y, h1.at.z], 0.006, i % 4 === 0 ? MAG : CYAN, {
        bone: boneFor(h0.at.y),
      }),
      1.3,
    );
  }

  // ---------- knobbly bumps ----------
  const bumpGeos = [0.045, 0.06, 0.035].map((s, k) => {
    const g = new THREE.IcosahedronGeometry(s, 0);
    g.scale(1, 0.6 + 0.15 * k, 1);
    return g;
  });
  const hits = skin.scatter(26, {
    rng: r,
    minDist: 0.19,
    filter: (h: any) => h.at.y > 0.8 && h.at.y < 2.3,
  });
  hits.forEach((h: any, i: number) => {
    b.stick(bumpGeos[i % 3], i % 2 ? P.barkLight : P.bark, h, { embed: 0.35, spin: r() * 360 });
    if (i % 4 === 0) {
      glow(
        b.stick(new THREE.SphereGeometry(0.014, 5, 4), i % 8 === 0 ? MAG : VIO, h.moved([0, 0.035, 0]), {
          embed: 0.3,
        }),
        1.5,
      );
    }
  });

  // ---------- turned rings: base sleeve, leaf node, crown collar ----------
  const ringAt = (y: number, z: number, outline: number[][], color: string, segs = 8) => {
    const t = spine.closestT([0, y, z]);
    const c = spine.at(t);
    const tan = spine.tangentAt(t);
    b.lathe(outline as any, { at: c, axis: tan, segments: segs, color, bone: boneFor(c.y) });
    return { t, c, tan };
  };
  const glowTorus = (c: THREE.Vector3, tan: THREE.Vector3, R: number, tube: number, lift: number, color: string) => {
    const at = c.clone().addScaledVector(tan, lift);
    glow(
      b.part(new THREE.TorusGeometry(R, tube, 4, 16), color, { at, dir: tan, axis: "z", bone: boneFor(c.y) }),
      1.4,
    );
  };

  // base sleeve
  const base = ringAt(
    0.64,
    0.02,
    [
      [0.28, -0.1],
      [0.45, -0.09],
      [0.47, -0.05],
      [0.41, 0.04],
      [0.35, 0.07],
    ],
    P.barkDark,
  );
  glowTorus(base.c, base.tan, 0.43, 0.011, 0.025, CYAN);

  // leaf node (trunkMid)
  const node = ringAt(
    1.5,
    0.15,
    [
      [0.2, -0.08],
      [0.33, -0.06],
      [0.37, 0],
      [0.33, 0.08],
      [0.2, 0.1],
    ],
    P.barkLight,
  );
  glowTorus(node.c, node.tan, 0.345, 0.01, 0.0, VIO);
  b.ring(frame(node.c, node.tan), { count: 12, radius: 0.36 }, (item: any) => {
    if (item.i === 3 || item.i === 9) return;
    glow(
      b.stick(new THREE.SphereGeometry(0.022, 6, 4), item.i % 2 ? MAG : GRN, item, {
        embed: 0.35,
        bone: J.trunk2,
      }),
      1.5,
    );
  });

  // crown collar (crownRing)
  const col = ringAt(
    2.45,
    0.3,
    [
      [0.17, -0.05],
      [0.27, -0.04],
      [0.31, 0.0],
      [0.285, 0.05],
      [0.2, 0.075],
    ],
    P.barkLight,
  );
  glowTorus(col.c, col.tan, 0.292, 0.012, 0.055, CYAN);
  glowTorus(col.c, col.tan, 0.3, 0.01, -0.02, VIO);
  b.ring(frame(col.c, col.tan), { count: 12, radius: 0.305 }, (item: any) => {
    glow(
      b.stick(new THREE.SphereGeometry(0.02, 6, 4), item.i % 3 === 0 ? MAG : item.i % 3 === 1 ? CYAN : GRN, item, {
        embed: 0.35,
        bone: J.trunk3,
      }),
      1.6,
    );
  });
  // collar teeth: little dark spikes pointing up around the rim
  b.ring(frame(col.c.clone().addScaledVector(col.tan, 0.05), col.tan), { count: 8, radius: 0.24, tilt: 18 }, (item: any) => {
    b.spike(item, item, 0.07, 0.025, { color: P.bark, bone: J.trunk3, sides: 5 } as any);
  });
}
    return buildTrunk;
  })(),
  // fanLeaves
  (() => {
type Ctx = {
  b: Builder;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildFanLeaves({ b, J, P, M }: Ctx) {
  const DEG = Math.PI / 180;
  const R = rng(23);
  const LEAF_B = "#138590"; // second teal tone for alternating lobes
  const DOT = [P.glowMagenta, P.glowViolet];
  const AMAX = 72; // fan half-angle in degrees
  const UNDER = new THREE.Vector3(0, -0.015, 0);

  type LeafOpts = {
    origin: [number, number, number];
    yaw: number;
    Lt: number;
    sc: number;
    n: number;
    details: boolean;
    bone: any;
  };

  // One fan leaf: petiole, glowing rib, scalloped wedge lobes with a deep underside layer, veins and rim dots.
  const leaf = (s: number, o: LeafOpts) => {
    const { origin, yaw, Lt, sc, n, bone, details } = o;
    const yaw0 = yaw * DEG;
    const dirH = (th: number) => new THREE.Vector3(s * Math.cos(th), 0, Math.sin(th));
    // vertical profile of the midrib: rises, peaks, then droops
    const off = (u: number) => 0.03 + 2.0 * u - 2.4 * u * u;
    const M3 = (u: number) => {
      const p = new THREE.Vector3(origin[0], origin[1], origin[2]).addScaledVector(dirH(yaw0), Lt * u);
      p.y = origin[1] + off(u) * sc;
      return p;
    };
    const F = M3(0.3);
    const L0 = 0.7 * Lt;
    const r0 = 0.05 * sc + 0.01;
    const rayPt = (aDeg: number, t: number, lift = 0) => {
      const a = aDeg * DEG;
      const k = Math.abs(aDeg) / AMAX;
      const Li = L0 * (1 - 0.38 * k * k);
      const dist = r0 + (Li - r0) * t;
      const p = F.clone().addScaledVector(dirH(yaw0 + a), dist);
      const ueq = 0.3 + (Math.cos(a) * dist) / Lt;
      p.y = origin[1] + off(ueq) * sc - 0.4 * sc * Math.pow(k, 1.3) * t + lift;
      return p;
    };
    const TS = [0, 1 / 3, 2 / 3, 1];
    const ray = (aDeg: number, lift = 0) => TS.map((t) => rayPt(aDeg, t, lift));
    const ang = (i: number) => -AMAX + (2 * AMAX * i) / (n - 1);

    // petiole from the trunk to the fan root
    b.sweep(catmull([M3(0), M3(0.12), M3(0.22), M3(0.31)]), [0.05 * sc + 0.012, 0.022 * sc + 0.008], {
      color: P.barkLight,
      bone,
      sides: 6,
    });
    if (details) {
      b.part(new THREE.SphereGeometry(0.1, 7, 5), P.bark, {
        bone,
        at: M3(0.02),
        scale: [1, 0.8, 1],
      });
    }

    // wedge lobes: top layer in leafTeal tones, underside in leafDeep
    for (let i = 0; i < n - 1; i++) {
      const A = ray(ang(i));
      const B = ray(ang(i + 1));
      b.membrane(catmull(A), catmull(B), {
        color: i % 2 ? LEAF_B : P.leafTeal,
        thickness: 0.016,
        scallop: 0.14,
        bone,
      });
      b.membrane(
        catmull(A.map((p) => p.clone().add(UNDER))),
        catmull(B.map((p) => p.clone().add(UNDER))),
        { color: P.leafDeep, thickness: 0.012, scallop: 0.14, bone },
      );
    }

    // central glowing rib
    glow(
      b.sweep(catmull(ray(0, 0.016)), [0.016 * sc + 0.004, 0.005], {
        color: P.veinCyan,
        bone,
        sides: 5,
      }),
      1.3,
    );

    // glowing veins along the other rays
    for (let i = 0; i < n; i++) {
      if (i * 2 === n - 1) continue;
      glow(
        b.sweep(catmull(ray(ang(i), 0.011)), [0.01 * sc + 0.002, 0.004], {
          color: P.veinCyan,
          bone,
          sides: 5,
        }),
        1.1,
      );
    }

    // cross veins and mid-lobe dots
    if (details) {
      for (let i = 0; i < n - 1; i++) {
        const pa = rayPt(ang(i), 0.62, 0.011);
        const pb = rayPt(ang(i + 1), 0.62, 0.011);
        glow(b.rod(pa, pb, 0.0045, { color: P.veinCyan, bone, sides: 5 }), 1);
        const mid = rayPt((ang(i) + ang(i + 1)) / 2, 0.86, 0.014);
        glow(
          b.part(new THREE.SphereGeometry(0.015, 6, 4), DOT[(i + 1) % 2], { bone, at: mid }),
          1.6,
        );
      }
    }

    // rim dots at every ray tip
    for (let i = 0; i < n; i++) {
      const p = rayPt(ang(i), 1, 0.012);
      const r = 0.012 + 0.018 * sc + R() * 0.003;
      glow(b.part(new THREE.SphereGeometry(r, 6, 4), DOT[i % 2], { bone, at: p }), 1.7);
    }
  };

  for (const s of [1, -1]) {
    const bone = s > 0 ? J.leafL : J.leafR;
    const base = M.leafRingL;
    // the two huge primary fan leaves
    leaf(s, {
      origin: [s * Math.abs(base[0]), base[1], base[2]],
      yaw: 6,
      Lt: 1.45,
      sc: 1,
      n: 9,
      details: true,
      bone,
    });
    // smaller secondary leaves: one low and swept back, one high and swept forward
    leaf(s, {
      origin: [s * 0.1, 1.3, 0.1],
      yaw: -50,
      Lt: 0.8,
      sc: 0.55,
      n: 5,
      details: false,
      bone,
    });
    leaf(s, {
      origin: [s * 0.1, 1.78, 0.2],
      yaw: 50,
      Lt: 0.8,
      sc: 0.55,
      n: 5,
      details: false,
      bone,
    });
  }
}
    return buildFanLeaves;
  })(),
  // flowerCrown
  (() => {
function buildFlowerCrown({ b, J, P, M }: Ctx) {
  const bone = J.flowerHead;
  const R = rng(4242);
  const base = new THREE.Vector3(...M.flowerBase);
  const core = new THREE.Vector3(...M.flowerCore);
  const UP = new THREE.Vector3(0, 1, 0);
  const rel = (x: number, y: number, z: number) => new THREE.Vector3(base.x + x, base.y + y, base.z + z);
  const polar = (rad: number, a: number, y: number) => rel(Math.sin(a) * rad, y, Math.cos(a) * rad);
  const arr = (v: THREE.Vector3) => [v.x, v.y, v.z] as [number, number, number];

  const GLOWCOLS = [P.veinCyan, P.glowMagenta, P.glowGreen, P.glowViolet, P.coreWhite];

  const orb = (at: THREE.Vector3, r: number, color: string, strength = 1.2, seg = 6) =>
    glow(b.part(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 2)), color, { at: arr(at), bone, flat: true }), strength);

  const vein = (a: THREE.Vector3, c: THREE.Vector3, r = 0.006, color = P.veinCyan) =>
    glow(b.rod(arr(a), arr(c), r, color, { bone, sides: 5 }), 1.3);

  // ---- bell cup: lathe-turned shell, outer wall then inner wall
  const cup: any[] = [
    [0, 0], [0.22, 0], [0.3, 0.12], [0.42, 0.32], [0.55, 0.52], [0.62, 0.62],
    [0.57, 0.62], [0.46, 0.52], [0.34, 0.32], [0.24, 0.12], [0.12, 0.08], [0, 0.08],
  ];
  b.lathe(cup, { at: arr(base), axis: [0, 1, 0], segments: 10, color: P.petalPink, bone });

  // inner lining glow ring deep in the cup
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.012, 10), P.glowMagenta, { at: arr(rel(0, 0.09, 0)), bone });
  glow(b.part(new THREE.TorusGeometry(0.17, 0.02, 5, 14), P.glowMagenta, { at: arr(core.clone().add(new THREE.Vector3(0, -0.02, 0))), dir: [0, 1, 0], axis: "z", bone }), 1.3);

  // rim torus and beads
  b.part(new THREE.TorusGeometry(0.6, 0.026, 5, 20), P.petalLight, { at: arr(rel(0, 0.62, 0)), dir: [0, 1, 0], axis: "z", bone });
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    orb(polar(0.62, a, 0.64), 0.016, i % 2 ? P.glowMagenta : P.coreWhite, 1.2, 5);
  }

  // base collar under the bell
  b.part(new THREE.TorusGeometry(0.26, 0.04, 5, 12), P.barkLight, { at: arr(rel(0, 0.02, 0)), dir: [0, 1, 0], axis: "z", bone });
  b.part(new THREE.TorusGeometry(0.3, 0.025, 5, 12), P.moss, { at: arr(rel(0, -0.02, 0)), dir: [0, 1, 0], axis: "z", bone });

  // ---- outer bell veins, between the petals
  const prof: [number, number][] = [[0.3, 0.12], [0.42, 0.32], [0.55, 0.52], [0.62, 0.62]];
  for (let i = 0; i < 10; i++) {
    const a = ((i + 0.5) / 10) * Math.PI * 2;
    const pts = prof.map(([r, y]) => arr(polar(r + 0.016, a, y)));
    glow(b.sweep(pts, 0.007, { color: P.veinCyan, bone, sides: 5, caps: "round" }), 1.2);
  }

  // ---- petal builder
  const OUT: [number, number, string?][] = [
    [-0.09, 0], [-0.17, 0.2], [-0.15, 0.4], [0, 0.55, "sharp"], [0.15, 0.4], [0.17, 0.2], [0.09, 0],
  ];
  function petal(a: number, o: { r0: number; y0: number; lean: number; len: number; wid: number; color: string; tip: string; veins: boolean }) {
    const r = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const t = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const ph = (o.lean * Math.PI) / 180;
    const axis = r.clone().multiplyScalar(Math.sin(ph)).addScaledVector(UP, Math.cos(ph)).normalize();
    const origin = rel(r.x * o.r0, o.y0, r.z * o.r0);
    const outline: any[] = OUT.map(([x, y, s]) => (s ? [x * o.wid, y * o.len, "sharp"] : [x * o.wid, y * o.len]));
    b.extrude(outline, {
      at: arr(origin), x: arr(t), y: arr(axis), thickness: [0.032, 0.012], smoothing: 1, color: o.color, bone,
    });
    // lighter tip cap
    const tipOutline: any[] = [
      [-0.15 * o.wid, 0.38 * o.len], [0, 0.575 * o.len, "sharp"], [0.15 * o.wid, 0.38 * o.len],
    ];
    b.extrude(tipOutline, {
      at: arr(origin), x: arr(t), y: arr(axis), thickness: 0.024, color: o.tip, bone,
    });
    // inner (upward) face direction
    const n = new THREE.Vector3().crossVectors(t, axis).normalize();
    if (n.y < 0.0) n.negate();
    // we want the face visible from inside/above: choose the side with larger y
    const P3 = (u: number, v: number) =>
      origin.clone().addScaledVector(t, u * o.wid).addScaledVector(axis, v * o.len).addScaledVector(n, 0.011);
    if (o.veins) {
      vein(P3(0, 0.04), P3(0, 0.5));
      vein(P3(0, 0.25), P3(-0.1, 0.46), 0.005);
      vein(P3(0, 0.25), P3(0.1, 0.46), 0.005);
    }
  }

  // outer ring: 10 broad flaring petals
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    petal(a, { r0: 0.4, y0: 0.3, lean: 55 + (i % 2) * 6, len: 0.6 + (i % 2) * 0.03, wid: 1.15, color: P.petalPink, tip: P.petalLight, veins: true });
  }
  // inner ring: 8 smaller, more upright violet petals
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) / 8) * Math.PI * 2;
    petal(a, { r0: 0.17, y0: 0.1, lean: 24, len: 0.5, wid: 0.7, color: P.glowViolet, tip: P.petalLight, veins: false });
  }

  // ---- glowing core
  glow(b.part(new THREE.SphereGeometry(0.13, 8, 6), P.coreWhite, { at: arr(core), bone, flat: true }), 1.8);
  glow(b.part(new THREE.SphereGeometry(0.075, 6, 4), P.glowMagenta, { at: arr(core.clone().add(new THREE.Vector3(0, 0.12, 0))), bone, flat: true }), 1.6);

  // ---- stamens
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    const h = 0.5 + R() * 0.12;
    const from = polar(0.06, a, 0.2);
    const mid = polar(0.12, a, 0.38);
    const tip = polar(0.2 + R() * 0.05, a, h);
    b.rod(arr(from), arr(mid), 0.009, P.barkLight, { bone, sides: 5 });
    b.rod(arr(mid), arr(tip), 0.006, P.petalLight, { bone, sides: 5 });
    orb(tip, 0.026, i % 3 === 0 ? P.glowGreen : i % 3 === 1 ? P.glowMagenta : P.veinCyan, 1.5, 6);
  }

  // ---- floating spores above the flower
  for (let i = 0; i < 20; i++) {
    const a = R() * Math.PI * 2;
    const rad = Math.sqrt(R()) * 0.78;
    const y = 0.7 + R() * 0.15;
    const r = 0.016 + R() * 0.02;
    orb(polar(rad, a, y), r, GLOWCOLS[i % GLOWCOLS.length], 1.4, 6);
  }
}
    return buildFlowerCrown;
  })(),
  // tendrils
  (() => {
function buildTendrils({ b, J, P, M }: Ctx) {
  const r = rng(1407);
  const C = M.crownRing;
  const VIOL = "#5a3aa8";
  const BELL = "#6d3fc4";
  const TIPS = [P.veinCyan, P.glowMagenta, P.glowGreen];
  const COUNT = 14;
  const lerpN = (a: number, c: number, t: number) => a + (c - a) * t;

  const beadGeo = new THREE.SphereGeometry(1, 6, 4);

  for (let i = 0; i < COUNT; i++) {
    const a = (i / COUNT) * Math.PI * 2 + (r() - 0.5) * 0.12;
    const reach = 0.78 + 0.37 * (((i * 5) % 7) / 6) + r() * 0.05; // 0.78..1.2
    const R = Math.min(reach, 1.15);
    const yEnd = 0.55 + (i % 3) * 0.38 + r() * 0.18;
    const pt = (rad: number, y: number, swirl: number): [number, number, number] => [
      C[0] + Math.sin(a + swirl) * rad,
      y,
      C[2] + Math.cos(a + swirl) * rad,
    ];
    const path = [
      pt(0.24, 2.38, 0),
      pt(0.24 + 0.3 * R, 2.46, 0.04),
      pt(0.24 + 0.72 * (R - 0.24), lerpN(2.46, yEnd, 0.3), 0.12),
      pt(R, lerpN(2.46, yEnd, 0.7), 0.2),
      pt(R + 0.05, yEnd, 0.27),
    ];
    const curve = path;
    // build a smooth curve through the points
    const cat = new THREE.CatmullRomCurve3(curve.map((p) => new THREE.Vector3(...p)), false, "centripetal");
    const samples = cat.getSpacedPoints(24).map((v) => [v.x, v.y, v.z] as [number, number, number]);

    const chain = b.chain(`tendrilsT${i}_`, samples, {
      parent: J.tendril1,
      count: 3,
      role: "tentacle",
      group: "tendrils",
    });
    const last = chain.joints[chain.joints.length - 1];

    const sw = b.sweep(chain, (t: number) => 0.05 * Math.pow(1 - t, 0.8) + 0.012, {
      color: P.bark,
      bands: [
        [0.6, P.bark],
        [1, VIOL],
      ],
      sides: 6,
    });

    // root knob where the tendril leaves the collar
    b.part(new THREE.SphereGeometry(0.058, 6, 5), P.barkLight, {
      at: pt(0.25, 2.39, 0),
      bone: chain.joints[0],
    });

    // glowing beads along the length
    const tc = TIPS[i % 3];
    [0.2, 0.42, 0.64, 0.84].forEach((t, k) => {
      const hit = sw.at(t, k % 2 ? -70 : 70);
      const rad = 0.018 - 0.009 * t;
      const col = k % 2 ? P.glowViolet : tc;
      glow(
        b.stick(beadGeo, col, hit, { embed: 0.3, scale: [rad, rad, rad] }),
        1.3,
      );
    });

    // tip: bark cup, glowing bulb, white highlight
    const endP = cat.getPoint(1);
    const tan = cat.getTangent(1);
    const T: [number, number, number] = [tan.x, tan.y, tan.z];
    const E: [number, number, number] = [endP.x, endP.y, endP.z];
    const br = 0.05 + (i % 3) * 0.009 + r() * 0.006;
    b.part(new THREE.CylinderGeometry(0.03, 0.015, 0.06, 6), P.barkLight, {
      at: offset(E, T, -0.015),
      dir: T,
      bone: last,
    });
    const bc = offset(E, T, br * 0.6);
    glow(b.part(new THREE.SphereGeometry(br, 8, 6), tc, { at: bc, bone: last }), 1.6);
    glow(
      b.part(new THREE.SphereGeometry(br * 0.38, 6, 4), P.coreWhite, {
        at: offset(bc, [0.3, 0.7, 0.6], br * 0.62),
        bone: last,
      }),
      2,
    );
  }

  // ring of tiny hanging bell buds under the collar
  const bellOutline: [number, number][] = [
    [0, 0.06],
    [0.018, 0.05],
    [0.032, 0.015],
    [0.045, -0.04],
    [0.025, -0.03],
    [0, -0.015],
  ].map(([x, y]) => [x * 1.3, y * 1.3] as [number, number]);
  const NB = 10;
  for (let k = 0; k < NB; k++) {
    const a = ((k + 0.5) / NB) * Math.PI * 2;
    const x = C[0] + Math.sin(a) * 0.235;
    const z = C[2] + Math.cos(a) * 0.235;
    b.lathe(bellOutline, {
      at: [x, 2.38, z],
      bone: J.trunk3,
      color: k % 2 ? BELL : P.petalPink,
      segments: 8,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.014, 6, 4), k % 2 ? P.veinCyan : P.glowMagenta, {
        at: [x, 2.38 - 0.06, z],
        bone: J.trunk3,
      }),
      1.5,
    );
  }
}
    return buildTendrils;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "lumibloom" });
  const J: Record<string, Joint> = {};
  J["root"] = b.joint("root", { at: [0,0.1,0], dir: [0,1,0], role: "spine" });
  J["trunk1"] = b.joint("trunk1", { parent: J["root"], at: [0,0.5,0], dir: [0,1,0.05], role: "spine" });
  J["trunk2"] = b.joint("trunk2", { parent: J["trunk1"], at: [0,1.4,0.1], dir: [0,1,0.1], role: "spine" });
  J["trunk3"] = b.joint("trunk3", { parent: J["trunk2"], at: [0,2,0.2], dir: [0,1,0.1], role: "spine" });
  J["flowerHead"] = b.joint("flowerHead", { parent: J["trunk3"], at: [0,2.55,0.3], dir: [0,1,0], role: "head" });
  J["leafL"] = b.joint("leafL", { parent: J["trunk2"], at: [0.1,1.5,0.15], dir: [1,0.4,0], role: "arm", group: "leaves" });
  J["leafR"] = b.joint("leafR", { parent: J["trunk2"], at: [-0.1,1.5,0.15], dir: [-1,0.4,0], role: "arm", group: "leaves" });
  J["tendril1"] = b.joint("tendril1", { parent: J["trunk3"], at: [0,2.45,0.3], dir: [0,-1,0.3], role: "tentacle", group: "tendrils" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
