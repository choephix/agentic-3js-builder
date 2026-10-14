import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Lighthouse Isle",
  description:
    "A stylized red-and-white lighthouse on a tiny rocky island, with a keeper's cottage, jetty, rowboat, pine tree, picket fence, seagulls and a shallow lagoon.",
};

export default function build() {
  const b: any = createBuilder({ name: "lighthouse_isle" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const R: any = rng(42);
  const rand = (): number =>
    typeof R === "function" ? R() : R.next ? R.next() : R.float ? R.float() : Math.random();
  const rr = (a: number, c: number) => a + (c - a) * rand();

  const P = (geo: THREE.BufferGeometry, color: string, at: number[]) =>
    b.part(geo, color, { at, bone: root });

  const facet = (g: THREE.BufferGeometry) => {
    const n = g.index ? g.toNonIndexed() : g;
    n.computeVertexNormals();
    return n;
  };

  // radial jitter for organic, faceted island layers
  const rocky = (g: THREE.BufferGeometry, amt: number, seed: number) => {
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const a = Math.atan2(x, z);
      const k =
        1 +
        amt *
          (Math.sin(a * 3 + seed) * 0.55 +
            Math.sin(a * 7 + seed * 2.3) * 0.3 +
            Math.sin(a * 11 + seed * 0.7) * 0.15);
      p.setXYZ(i, x * k, y, z * k);
    }
    return facet(g);
  };

  // place a box-like geometry facing outward at azimuth a (0 = +Z, +pi/2 = +X)
  const outward = (geo: THREE.BufferGeometry, a: number, r: number, y: number, color: string) => {
    geo.rotateY(a);
    return P(geo, color, [Math.sin(a) * r, y, Math.cos(a) * r]);
  };

  // ---------------- palette ----------------
  const C = {
    deep: "#2f8cc4",
    shallow: "#5cc6d6",
    foam: "#eaf8f6",
    sand: "#ecd59c",
    rock: "#7a7f88",
    rockDark: "#5d626b",
    rockLight: "#9aa0a8",
    grass: "#6aab48",
    grassLight: "#8cc95a",
    red: "#d9342b",
    white: "#f5f0e4",
    stone: "#cbc3b2",
    iron: "#2a2f37",
    glass: "#a8dbea",
    lamp: "#ffd23f",
    lens: "#fff0a6",
    wood: "#8a5a32",
    woodDark: "#5e3a1f",
    plank: "#b88752",
    slate: "#3c5a82",
    shutter: "#2e7d6b",
    pine: "#2d6a3c",
    pineLight: "#3f8a4a",
    trunk: "#6b4425",
    boat: "#e07a33",
    boatIn: "#f2d7a6",
    gullGrey: "#9ca6b0",
    beak: "#f2b134",
    flowerA: "#ff6f91",
    flowerB: "#ffe35a",
    flowerC: "#ffffff",
    flowerD: "#b07cff",
  };

  // ---------------- sea ----------------
  P(new THREE.CylinderGeometry(7.6, 7.6, 0.06, 28), C.deep, [0, 0.03, 0]);
  P(rocky(new THREE.CylinderGeometry(5.3, 5.3, 0.075, 24), 0.08, 3), C.shallow, [0, 0.0375, 0]);
  {
    const g = new THREE.TorusGeometry(4.55, 0.1, 4, 28);
    g.rotateX(Math.PI / 2);
    g.scale(1, 0.4, 1);
    P(facet(g), C.foam, [0, 0.08, 0]);
  }
  // little wave dashes on the water
  for (let i = 0; i < 26; i++) {
    const a = rr(0, Math.PI * 2);
    const r = rr(5.6, 7.2);
    const g = new THREE.BoxGeometry(rr(0.35, 0.7), 0.02, 0.07);
    g.rotateY(a + Math.PI / 2 + rr(-0.2, 0.2));
    P(g, C.foam, [Math.sin(a) * r, 0.065, Math.cos(a) * r]);
  }

  // ---------------- island ----------------
  P(rocky(new THREE.CylinderGeometry(4.35, 4.7, 0.26, 18), 0.07, 5), C.sand, [0, 0.13, 0]);
  P(rocky(new THREE.CylinderGeometry(3.3, 4.0, 1.25, 14, 2), 0.09, 1), C.rock, [0, 0.625, 0]);
  P(rocky(new THREE.CylinderGeometry(3.05, 3.35, 0.22, 14), 0.09, 1), C.grass, [0, 1.35, 0]);
  P(rocky(new THREE.CylinderGeometry(2.6, 2.75, 0.06, 12), 0.1, 4), C.grassLight, [0, 1.47, 0]);
  const G = 1.46; // ground level on top of island

  // shoreline boulders
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + rr(-0.12, 0.12);
    if (Math.abs(((a + Math.PI) % (Math.PI * 2)) - Math.PI - 0.15) < 0.35) continue; // keep jetty clear
    const r = rr(3.7, 4.3);
    const s = rr(0.25, 0.55);
    const g = new THREE.DodecahedronGeometry(s, 0);
    g.scale(rr(0.9, 1.4), rr(0.6, 1.0), rr(0.9, 1.3));
    g.rotateY(rr(0, Math.PI));
    g.rotateX(rr(-0.3, 0.3));
    const col = [C.rock, C.rockDark, C.rockLight][i % 3];
    P(facet(g), col, [Math.sin(a) * r, s * 0.45, Math.cos(a) * r]);
  }

  // ---------------- lighthouse ----------------
  // plinth
  P(facet(new THREE.CylinderGeometry(1.38, 1.5, 0.55, 8)), C.stone, [0, G + 0.27, 0]);
  P(facet(new THREE.CylinderGeometry(1.42, 1.42, 0.08, 8)), C.rockLight, [0, G + 0.58, 0]);
  const T0 = G + 0.62;
  const TH = 8;
  const rBot = 1.15, rTop = 0.8;
  const Rt = (y: number) => rBot - ((y - T0) / TH) * (rBot - rTop);

  const bands = 5;
  for (let i = 0; i < bands; i++) {
    const y0 = T0 + (i * TH) / bands;
    const y1 = T0 + ((i + 1) * TH) / bands;
    P(
      facet(new THREE.CylinderGeometry(Rt(y1), Rt(y0), y1 - y0, 16)),
      i % 2 === 0 ? C.red : C.white,
      [0, (y0 + y1) / 2, 0],
    );
  }
  const TT = T0 + TH;

  // door with arch
  {
    const r = Rt(T0 + 0.5);
    P(new THREE.BoxGeometry(0.62, 0.95, 0.14), C.woodDark, [0, T0 + 0.475, r + 0.02]);
    const arch = new THREE.CylinderGeometry(0.31, 0.31, 0.14, 8, 1, false, Math.PI / 2, Math.PI);
    arch.rotateX(Math.PI / 2);
    P(facet(arch), C.woodDark, [0, T0 + 0.95, r + 0.02]);
    const frame = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 8, 1, false, Math.PI / 2, Math.PI);
    frame.rotateX(Math.PI / 2);
    P(facet(frame), C.white, [0, T0 + 0.95, r - 0.03]);
    P(new THREE.BoxGeometry(0.8, 0.95, 0.1), C.white, [0, T0 + 0.475, r - 0.03]);
    P(new THREE.BoxGeometry(0.04, 0.8, 0.03), C.wood, [0.12, T0 + 0.45, r + 0.1]);
    P(new THREE.BoxGeometry(0.04, 0.8, 0.03), C.wood, [-0.12, T0 + 0.45, r + 0.1]);
    P(new THREE.SphereGeometry(0.04, 6, 4), C.beak, [0.2, T0 + 0.5, r + 0.11]);
    // step + lamp over door
    P(new THREE.BoxGeometry(1.0, 0.16, 0.5), C.stone, [0, G + 0.08, 1.62]);
    P(new THREE.BoxGeometry(0.1, 0.1, 0.14), C.iron, [0, T0 + 1.42, r + 0.06]);
    P(new THREE.SphereGeometry(0.08, 6, 4), C.lamp, [0, T0 + 1.36, r + 0.12]);
  }

  // spiral of windows
  const wins = [
    { y: T0 + 2.0, a: 0.9 },
    { y: T0 + 3.6, a: -0.7 },
    { y: T0 + 5.2, a: 0.5 },
    { y: T0 + 6.7, a: -1.0 },
  ];
  for (const w of wins) {
    const r = Rt(w.y);
    outward(new THREE.BoxGeometry(0.42, 0.66, 0.12), w.a, r, w.y, C.iron);
    outward(new THREE.BoxGeometry(0.3, 0.52, 0.12), w.a, r + 0.03, w.y + 0.01, C.glass);
    outward(new THREE.BoxGeometry(0.03, 0.52, 0.04), w.a, r + 0.09, w.y + 0.01, C.iron);
    outward(new THREE.BoxGeometry(0.3, 0.03, 0.04), w.a, r + 0.09, w.y + 0.01, C.iron);
    outward(new THREE.BoxGeometry(0.5, 0.06, 0.16), w.a, r + 0.04, w.y - 0.36, C.white);
  }

  // corbels and gallery deck
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    outward(new THREE.BoxGeometry(0.12, 0.28, 0.4), a, rTop + 0.12, TT - 0.12, C.iron);
  }
  P(facet(new THREE.CylinderGeometry(1.0, rTop, 0.12, 16)), C.iron, [0, TT - 0.03, 0]);
  P(facet(new THREE.CylinderGeometry(1.36, 1.36, 0.16, 16)), C.iron, [0, TT + 0.11, 0]);
  const deckTop = TT + 0.19;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    P(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 4), C.iron, [
      Math.sin(a) * 1.3,
      deckTop + 0.3,
      Math.cos(a) * 1.3,
    ]);
  }
  for (const h of [0.6, 0.32]) {
    const g = new THREE.TorusGeometry(1.3, 0.03, 4, 24);
    g.rotateX(Math.PI / 2);
    P(g, C.iron, [0, deckTop + h, 0]);
  }

  // lantern room
  P(facet(new THREE.CylinderGeometry(0.82, 0.82, 0.42, 8)), C.red, [0, deckTop + 0.21, 0]);
  const L0 = deckTop + 0.42;
  const LH = 1.1;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    outward(new THREE.BoxGeometry(0.06, LH, 0.06), a, 0.76, L0 + LH / 2, C.iron);
  }
  {
    const g = new THREE.TorusGeometry(0.78, 0.035, 4, 8);
    g.rotateX(Math.PI / 2);
    g.rotateY(Math.PI / 8);
    P(g, C.iron, [0, L0 + LH * 0.5, 0]);
  }
  // the light: glowing core and fresnel lens rings
  P(new THREE.CylinderGeometry(0.12, 0.18, 0.3, 6), C.iron, [0, L0 + 0.15, 0]);
  P(facet(new THREE.IcosahedronGeometry(0.3, 0)), C.lamp, [0, L0 + 0.55, 0]);
  for (const [dy, rad] of [
    [0.3, 0.32],
    [0.45, 0.42],
    [0.6, 0.44],
    [0.75, 0.38],
    [0.88, 0.26],
  ]) {
    const g = new THREE.TorusGeometry(rad, 0.035, 4, 12);
    g.rotateX(Math.PI / 2);
    P(g, C.lens, [0, L0 + dy, 0]);
  }
  const LT = L0 + LH;
  P(facet(new THREE.CylinderGeometry(0.95, 0.95, 0.09, 8)), C.iron, [0, LT + 0.045, 0]);
  P(facet(new THREE.ConeGeometry(0.92, 0.72, 8)), C.red, [0, LT + 0.45, 0]);
  P(facet(new THREE.SphereGeometry(0.16, 8, 6)), C.iron, [0, LT + 0.86, 0]);
  P(new THREE.CylinderGeometry(0.015, 0.02, 0.6, 4), C.iron, [0, LT + 1.2, 0]);
  P(facet(new THREE.ConeGeometry(0.06, 0.18, 4)), C.beak, [0, LT + 1.55, 0]);
  // weather vane arrow
  P(new THREE.BoxGeometry(0.5, 0.025, 0.025), C.iron, [0, LT + 1.32, 0]);
  {
    const g = new THREE.ConeGeometry(0.06, 0.14, 4);
    g.rotateZ(-Math.PI / 2);
    P(g, C.iron, [0.3, LT + 1.32, 0]);
    P(new THREE.BoxGeometry(0.02, 0.14, 0.14), C.iron, [-0.25, LT + 1.32, 0]);
  }

  // ---------------- keeper's cottage ----------------
  const cx = -2.0, cz = -0.6;
  const W = 1.4, D = 1.2, H = 0.9;
  P(new THREE.BoxGeometry(W + 0.1, 0.12, D + 0.1), C.stone, [cx, G + 0.06, cz]);
  P(new THREE.BoxGeometry(W, H, D), C.white, [cx, G + 0.12 + H / 2, cz]);
  const eave = G + 0.12 + H;
  {
    const s = new THREE.Shape();
    s.moveTo(-0.78, 0);
    s.lineTo(0.78, 0);
    s.lineTo(0, 0.58);
    s.lineTo(-0.78, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.62, bevelEnabled: false });
    g.translate(0, 0, -0.81);
    g.rotateY(Math.PI / 2);
    g.computeVertexNormals();
    P(g, C.slate, [cx, eave, cz]);
    P(new THREE.BoxGeometry(1.66, 0.06, 0.06), C.iron, [cx, eave + 0.58, cz]);
  }
  // chimney
  P(new THREE.BoxGeometry(0.24, 0.62, 0.24), C.stone, [cx - 0.42, eave + 0.55, cz + 0.2]);
  P(new THREE.BoxGeometry(0.3, 0.07, 0.3), C.rockDark, [cx - 0.42, eave + 0.88, cz + 0.2]);
  // door
  const fz = cz + D / 2;
  P(new THREE.BoxGeometry(0.36, 0.66, 0.05), C.shutter, [cx + 0.35, G + 0.12 + 0.33, fz + 0.02]);
  P(new THREE.SphereGeometry(0.03, 5, 4), C.beak, [cx + 0.47, G + 0.45, fz + 0.06]);
  P(new THREE.BoxGeometry(0.5, 0.05, 0.25), C.slate, [cx + 0.35, G + 0.86, fz + 0.12]);
  // front window with shutters + flower box
  const wx = cx - 0.3, wy = G + 0.6;
  P(new THREE.BoxGeometry(0.36, 0.36, 0.05), C.iron, [wx, wy, fz + 0.01]);
  P(new THREE.BoxGeometry(0.28, 0.28, 0.05), C.glass, [wx, wy, fz + 0.03]);
  P(new THREE.BoxGeometry(0.03, 0.28, 0.03), C.white, [wx, wy, fz + 0.06]);
  P(new THREE.BoxGeometry(0.28, 0.03, 0.03), C.white, [wx, wy, fz + 0.06]);
  P(new THREE.BoxGeometry(0.14, 0.38, 0.04), C.shutter, [wx - 0.27, wy, fz + 0.03]);
  P(new THREE.BoxGeometry(0.14, 0.38, 0.04), C.shutter, [wx + 0.27, wy, fz + 0.03]);
  P(new THREE.BoxGeometry(0.42, 0.1, 0.12), C.wood, [wx, wy - 0.24, fz + 0.07]);
  for (let i = 0; i < 5; i++) {
    const col = [C.flowerA, C.flowerB, C.flowerD, C.flowerA, C.flowerC][i];
    P(new THREE.IcosahedronGeometry(0.045, 0), col, [wx - 0.16 + i * 0.08, wy - 0.16, fz + 0.08]);
  }
  // side window (facing -X)
  {
    const sx = cx - W / 2;
    P(new THREE.BoxGeometry(0.05, 0.34, 0.34), C.iron, [sx - 0.01, wy, cz]);
    P(new THREE.BoxGeometry(0.05, 0.26, 0.26), C.glass, [sx - 0.03, wy, cz]);
    P(new THREE.BoxGeometry(0.04, 0.38, 0.14), C.shutter, [sx - 0.03, wy, cz - 0.25]);
    P(new THREE.BoxGeometry(0.04, 0.38, 0.14), C.shutter, [sx - 0.03, wy, cz + 0.25]);
  }
  // barrel and crates
  {
    const bx = cx + 0.95, bz = cz + 0.35;
    P(facet(new THREE.CylinderGeometry(0.2, 0.2, 0.46, 8)), C.wood, [bx, G + 0.23, bz]);
    for (const h of [0.08, 0.38]) {
      const g = new THREE.TorusGeometry(0.205, 0.02, 3, 8);
      g.rotateX(Math.PI / 2);
      P(g, C.iron, [bx, G + h, bz]);
    }
    const c1 = new THREE.BoxGeometry(0.34, 0.3, 0.34);
    c1.rotateY(0.3);
    P(c1, C.plank, [cx + 0.9, G + 0.15, cz - 0.15]);
    const c2 = new THREE.BoxGeometry(0.26, 0.24, 0.26);
    c2.rotateY(-0.2);
    P(c2, C.plank, [cx + 0.92, G + 0.42, cz - 0.15]);
  }

  // ---------------- pine tree ----------------
  {
    const px = 1.85, pz = -1.55;
    P(facet(new THREE.CylinderGeometry(0.08, 0.11, 0.6, 6)), C.trunk, [px, G + 0.3, pz]);
    const tiers = [
      [0.7, 0.9, 0.85],
      [0.55, 0.75, 1.35],
      [0.38, 0.6, 1.8],
    ];
    tiers.forEach(([r, h, y], i) => {
      P(facet(new THREE.ConeGeometry(r, h, 7)), i % 2 ? C.pineLight : C.pine, [px, G + y, pz]);
    });
    const p2x = 2.35, p2z = -0.6;
    P(facet(new THREE.CylinderGeometry(0.05, 0.07, 0.35, 5)), C.trunk, [p2x, G + 0.17, p2z]);
    P(facet(new THREE.ConeGeometry(0.4, 0.6, 6)), C.pineLight, [p2x, G + 0.6, p2z]);
    P(facet(new THREE.ConeGeometry(0.28, 0.45, 6)), C.pine, [p2x, G + 0.95, p2z]);
  }

  // ---------------- picket fence (east edge) ----------------
  {
    const fr = 2.75;
    const a0 = 0.55, a1 = 1.55, n = 10;
    let prev: number | null = null;
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      const g = new THREE.BoxGeometry(0.07, 0.42, 0.04);
      outward(g, a, fr, G + 0.21, C.white);
      const tip = new THREE.ConeGeometry(0.05, 0.08, 4);
      P(tip, C.white, [Math.sin(a) * fr, G + 0.46, Math.cos(a) * fr]);
      if (prev !== null) {
        const m = (a + prev) / 2;
        const len = 2 * fr * Math.sin((a - prev) / 2) + 0.04;
        for (const h of [0.14, 0.3]) {
          const rail = new THREE.BoxGeometry(len, 0.04, 0.03);
          rail.rotateY(m);
          const rr2 = fr * Math.cos((a - prev) / 2) - 0.03;
          P(rail, C.white, [Math.sin(m) * rr2, G + h, Math.cos(m) * rr2]);
        }
      }
      prev = a;
    }
  }

  // ---------------- path, steps, jetty ----------------
  const pathPts = [
    [0.05, 2.0],
    [0.2, 2.4],
    [0.3, 2.8],
    [0.4, 3.15],
  ];
  pathPts.forEach(([x, z], i) => {
    const g = new THREE.CylinderGeometry(0.2, 0.22, 0.06, 6);
    g.rotateY(i * 0.7);
    P(facet(g), C.stone, [x, G + 0.02, z]);
  });
  const jx = 0.6;
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    const t = (i + 1) / steps;
    const y = G - t * (G - 0.62);
    const z = 3.25 + t * 0.85;
    P(new THREE.BoxGeometry(0.8, 0.14, 0.26), C.stone, [jx, y - 0.07, z]);
    P(new THREE.BoxGeometry(0.8, Math.max(0.1, y - 0.07), 0.24), C.rockDark, [
      jx,
      (y - 0.14) / 2,
      z,
    ]);
  }
  const deckY = 0.6;
  const jz0 = 4.1, jz1 = 6.8;
  for (let z = jz0 + 0.12; z < jz1; z += 0.24) {
    const g = new THREE.BoxGeometry(1.0 + rr(-0.04, 0.04), 0.06, 0.2);
    g.rotateY(rr(-0.03, 0.03));
    P(g, rand() > 0.3 ? C.plank : C.wood, [jx, deckY, z]);
  }
  P(new THREE.BoxGeometry(0.08, 0.1, jz1 - jz0), C.woodDark, [jx - 0.45, deckY - 0.08, (jz0 + jz1) / 2]);
  P(new THREE.BoxGeometry(0.08, 0.1, jz1 - jz0), C.woodDark, [jx + 0.45, deckY - 0.08, (jz0 + jz1) / 2]);
  for (const z of [4.4, 5.55, 6.7]) {
    for (const s of [-1, 1]) {
      P(facet(new THREE.CylinderGeometry(0.07, 0.08, 0.95, 6)), C.woodDark, [
        jx + s * 0.5,
        0.47,
        z,
      ]);
      P(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 6), C.iron, [jx + s * 0.5, 0.15, z]);
    }
  }
  // rope coil on the jetty
  {
    const g = new THREE.TorusGeometry(0.12, 0.035, 4, 10);
    g.rotateX(Math.PI / 2);
    P(g, C.boatIn, [jx - 0.2, deckY + 0.05, 6.4]);
    P(g.clone().scale(0.6, 1, 0.6), C.boatIn, [jx - 0.2, deckY + 0.09, 6.4]);
  }
  // lifebuoy on a post
  {
    for (let k = 0; k < 4; k++) {
      const g = new THREE.TorusGeometry(0.22, 0.07, 5, 4, Math.PI / 2);
      g.rotateZ((k * Math.PI) / 2);
      g.rotateY(Math.PI / 2);
      P(facet(g), k % 2 ? C.white : C.red, [jx + 0.6, 0.62, 5.55]);
    }
  }

  // ---------------- rowboat ----------------
  {
    const bx = 1.75, bz = 5.5, by = 0.3;
    const hull = new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    hull.scale(0.5, 0.36, 1.25);
    P(facet(hull), C.boat, [bx, by, bz]);
    const rim = new THREE.TorusGeometry(1, 0.06, 3, 14);
    rim.rotateX(Math.PI / 2);
    rim.scale(0.5, 1, 1.25);
    P(rim, C.white, [bx, by, bz]);
    const inside = new THREE.CylinderGeometry(1, 1, 0.02, 12);
    inside.scale(0.44, 1, 1.15);
    P(inside, C.boatIn, [bx, by - 0.04, bz]);
    for (const z of [-0.45, 0.35]) {
      P(new THREE.BoxGeometry(0.86, 0.05, 0.18), C.wood, [bx, by - 0.02, bz + z]);
    }
    // oars resting across
    for (const s of [-1, 1]) {
      const g = new THREE.CylinderGeometry(0.025, 0.025, 1.5, 4);
      g.rotateX(Math.PI / 2);
      g.rotateY(s * 0.25);
      P(g, C.plank, [bx + s * 0.2, by + 0.04, bz - 0.05]);
      const blade = new THREE.BoxGeometry(0.12, 0.02, 0.32);
      blade.rotateY(s * 0.25);
      P(blade, C.plank, [bx + s * 0.2 - s * 0.17, by + 0.04, bz - 0.72]);
    }
    // mooring line to jetty post
    const lineG = new THREE.CylinderGeometry(0.015, 0.015, 0.75, 3);
    lineG.rotateZ(Math.PI / 2 - 0.25);
    P(lineG, C.boatIn, [bx - 0.6, by + 0.2, 6.65]);
  }

  // ---------------- seagulls ----------------
  const gull = (x: number, y: number, z: number, yaw: number) => {
    const body = new THREE.SphereGeometry(0.11, 7, 5);
    body.scale(0.85, 0.85, 1.4);
    body.rotateY(yaw);
    P(facet(body), C.white, [x, y + 0.11, z]);
    const head = new THREE.SphereGeometry(0.07, 6, 4);
    const hx = Math.sin(yaw) * 0.13, hz = Math.cos(yaw) * 0.13;
    P(facet(head), C.white, [x + hx, y + 0.22, z + hz]);
    const beak = new THREE.ConeGeometry(0.025, 0.09, 4);
    beak.rotateX(Math.PI / 2);
    beak.rotateY(yaw);
    P(beak, C.beak, [x + hx * 1.55, y + 0.21, z + hz * 1.55]);
    for (const s of [-1, 1]) {
      const wing = new THREE.BoxGeometry(0.03, 0.08, 0.24);
      wing.rotateY(yaw);
      P(wing, C.gullGrey, [
        x + Math.cos(yaw) * s * 0.09,
        y + 0.13,
        z - Math.sin(yaw) * s * 0.09 - Math.cos(yaw) * 0.03,
      ]);
      P(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 3), C.beak, [
        x + Math.cos(yaw) * s * 0.04,
        y + 0.03,
        z - Math.sin(yaw) * s * 0.04,
      ]);
    }
    const tail = new THREE.BoxGeometry(0.08, 0.03, 0.1);
    tail.rotateY(yaw);
    P(tail, C.iron, [x - hx * 1.2, y + 0.13, z - hz * 1.2]);
  };
  gull(cx + 0.45, eave + 0.58, cz, 0.6);
  gull(jx + 0.5, 0.95, 6.7, -0.4);
  gull(1.3 * Math.sin(2.2), deckTop, 1.3 * Math.cos(2.2), 2.2);

  // ---------------- grass tufts & flowers ----------------
  const inCottage = (x: number, z: number) =>
    x > cx - W / 2 - 0.2 && x < cx + W / 2 + 0.4 && z > cz - D / 2 - 0.2 && z < cz + D / 2 + 0.3;
  let placed = 0, tries = 0;
  while (placed < 40 && tries < 400) {
    tries++;
    const a = rr(0, Math.PI * 2);
    const r = rr(1.65, 2.65);
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (inCottage(x, z)) continue;
    if (Math.abs(x - 0.25) < 0.45 && z > 1.6) continue; // path
    if (Math.hypot(x - 1.85, z + 1.55) < 0.5) continue; // pine
    placed++;
    if (placed % 3 === 0) {
      const col = [C.flowerA, C.flowerB, C.flowerC, C.flowerD][placed % 4];
      P(new THREE.CylinderGeometry(0.01, 0.01, 0.16, 3), C.pine, [x, G + 0.08, z]);
      P(facet(new THREE.IcosahedronGeometry(0.05, 0)), col, [x, G + 0.17, z]);
    } else {
      for (let k = 0; k < 3; k++) {
        const g = new THREE.ConeGeometry(0.035, rr(0.16, 0.26), 3);
        g.rotateZ(rr(-0.35, 0.35));
        g.rotateX(rr(-0.35, 0.35));
        P(g, k % 2 ? C.grassLight : C.pineLight, [x + rr(-0.05, 0.05), G + 0.1, z + rr(-0.05, 0.05)]);
      }
    }
  }

  return b.root;
}
