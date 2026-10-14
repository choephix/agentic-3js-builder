```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Cozy Treehouse Diorama",
  description:
    "A storybook treehouse on a round grassy base: a thick old oak with a big low-poly leafy crown, a plank cabin with a red shingle roof, a glowing round window, a pennant flag and a door lantern, plus a rope ladder, a swing, bunting, mushrooms, flowers and a teal bicycle with a flower basket.",
};

export default function build() {
  const b: any = createBuilder({ name: "treehouse" });

  // ---------- palette ----------
  const C = {
    dirt: "#6d4c33",
    dirtDark: "#4e3524",
    grass: "#7cb342",
    grassDark: "#558b2f",
    grassLight: "#9ccc65",
    bark: "#6b4a2f",
    barkDark: "#4a3220",
    barkLight: "#8a6440",
    hole: "#24160c",
    leaf1: "#4caf50",
    leaf2: "#388e3c",
    leaf3: "#7bc96f",
    leaf4: "#2e7d32",
    wood: "#c08a52",
    woodAlt: "#a8743f",
    woodDark: "#8d5a2b",
    woodLight: "#deb07a",
    trim: "#f3e5c8",
    door: "#7b4a26",
    roof1: "#c0392b",
    roof2: "#a93226",
    roof3: "#e0533f",
    glow: "#ffd966",
    flame: "#ffb300",
    iron: "#2f2f36",
    gold: "#e0b84c",
    rope: "#d9c08c",
    shutter: "#3d8b6e",
    mushRed: "#e53935",
    cream: "#fff8e7",
    stem: "#f1e3c6",
    bike: "#2bb3a3",
    tire: "#262626",
    metal: "#b0b7bf",
    saddle: "#5d4037",
    wicker: "#c9a25e",
    flag: "#ffca28",
    stone: "#9e9e9e",
    stoneLight: "#bdbdbd",
    pink: "#f48fb1",
    yellow: "#ffeb3b",
    purple: "#b39ddb",
    white: "#ffffff",
    terracotta: "#d2693c",
    mat: "#b5443a",
    leafOrange: "#e6913a",
    owlEye: "#ffd54f",
    black: "#111111",
  };

  const R: any = rng(20241);
  const rand = (): number =>
    typeof R === "function" ? R() : typeof R.next === "function" ? R.next() : R.float();
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length) % arr.length];

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0, 0] });

  const G = 0.6; // ground top

  // ---------- helpers ----------
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const put = (geo: THREE.BufferGeometry, color: string, at: number[] | THREE.Vector3, bone: any = root) =>
    b.part(geo, color, { at: Array.isArray(at) ? at : at.toArray(), bone });
  const taper = (a: number[], c: number[], r1: number, r2: number, color: string, seg = 7, bone: any = root) => {
    const A = V(a[0], a[1], a[2]);
    const B = V(c[0], c[1], c[2]);
    const len = A.distanceTo(B);
    const geo = new THREE.CylinderGeometry(r2, r1, len, seg);
    return b.part(geo, color, {
      at: A.clone().add(B).multiplyScalar(0.5).toArray(),
      dir: B.clone().sub(A).normalize().toArray(),
      bone,
    });
  };
  const rod = (a: number[], c: number[], r: number, color: string, seg = 6, bone: any = root) =>
    taper(a, c, r, r, color, seg, bone);
  const box = (sx: number, sy: number, sz: number, color: string, at: number[], bone: any = root) =>
    put(new THREE.BoxGeometry(sx, sy, sz), color, at, bone);
  const ball = (r: number, color: string, at: number[], ws = 8, hs = 6, bone: any = root) =>
    put(new THREE.SphereGeometry(r, ws, hs), color, at, bone);

  // ================= BASE =================
  put(new THREE.CylinderGeometry(5.0, 4.75, 0.5, 28), C.dirt, [0, 0.25, 0]);
  put(new THREE.CylinderGeometry(4.92, 4.92, 0.1, 28), C.dirtDark, [0, 0.18, 0]);
  put(new THREE.CylinderGeometry(5.12, 5.05, 0.12, 28), C.grass, [0, 0.54, 0]);
  // grass lip dripping over the edge
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2 + rand() * 0.08;
    const g = new THREE.SphereGeometry(0.24 + rand() * 0.08, 6, 4);
    g.scale(1, 0.75, 0.8);
    put(g, i % 3 === 0 ? C.grassDark : C.grass, [Math.cos(a) * 5.0, 0.47, Math.sin(a) * 5.0]);
  }
  // pebbles in the dirt rim
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const g = new THREE.DodecahedronGeometry(0.07 + rand() * 0.05, 0);
    g.scale(1.3, 0.8, 1);
    put(g, pick([C.stone, C.stoneLight, C.dirtDark]), [Math.cos(a) * 4.92, 0.12 + rand() * 0.22, Math.sin(a) * 4.92]);
  }

  // ================= OAK =================
  const T = { x: 0, z: -0.6 };
  // trunk in three tapered pieces with knuckle spheres
  const trunkPts: [number[], number][] = [
    [[0, G - 0.05, -0.6], 0.88],
    [[0.1, 3.0, -0.6], 0.66],
    [[-0.05, 5.5, -0.7], 0.5],
    [[0.05, 7.7, -0.8], 0.32],
  ];
  for (let i = 0; i < trunkPts.length - 1; i++) {
    taper(trunkPts[i][0], trunkPts[i + 1][0], trunkPts[i][1], trunkPts[i + 1][1], C.bark, 9);
    if (i > 0) ball(trunkPts[i][1] * 1.02, C.bark, trunkPts[i][0], 9, 6);
  }
  const trunkR = (y: number) => {
    for (let i = 0; i < trunkPts.length - 1; i++) {
      const y0 = trunkPts[i][0][1], y1 = trunkPts[i + 1][0][1];
      if (y <= y1) {
        const t = (y - y0) / (y1 - y0);
        return {
          r: trunkPts[i][1] + (trunkPts[i + 1][1] - trunkPts[i][1]) * t,
          x: trunkPts[i][0][0] + (trunkPts[i + 1][0][0] - trunkPts[i][0][0]) * t,
          z: trunkPts[i][0][2] + (trunkPts[i + 1][0][2] - trunkPts[i][0][2]) * t,
        };
      }
    }
    return { r: 0.32, x: 0.05, z: -0.8 };
  };
  // bark ridges
  for (let i = 0; i < 30; i++) {
    const y = 1.0 + rand() * 5.6;
    const a = rand() * Math.PI * 2;
    if (Math.abs(a - Math.PI / 2) < 0.35 && y > 1.9 && y < 2.8) continue; // keep owl hole clear
    const tr = trunkR(y);
    const len = 0.35 + rand() * 0.6;
    const g = new THREE.CapsuleGeometry(0.055, len, 2, 5);
    put(g, rand() < 0.6 ? C.barkDark : C.barkLight, [tr.x + Math.cos(a) * (tr.r - 0.015), y, tr.z + Math.sin(a) * (tr.r - 0.015)]);
  }
  // roots
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.35;
    const s = [Math.cos(a) * 0.45, 1.15, T.z + Math.sin(a) * 0.45];
    const e = [Math.cos(a) * 1.75, G - 0.02, T.z + Math.sin(a) * 1.75];
    const m = [Math.cos(a) * 1.15, G + 0.18, T.z + Math.sin(a) * 1.15];
    taper(s, m, 0.36, 0.2, C.bark, 7);
    taper(m, e, 0.2, 0.07, C.bark, 6);
    ball(0.2, C.bark, m, 7, 5);
  }
  // knot hole with a peeking owl
  const hy = 2.3;
  const htr = trunkR(hy);
  const hz = htr.z + htr.r - 0.02;
  {
    const g = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12);
    g.rotateX(Math.PI / 2);
    g.scale(1, 1.35, 1);
    put(g, C.hole, [htr.x, hy, hz]);
    const rim = new THREE.TorusGeometry(0.21, 0.055, 5, 14);
    rim.scale(1, 1.35, 1);
    put(rim, C.barkLight, [htr.x, hy, hz + 0.03]);
    for (const sx of [-1, 1]) {
      ball(0.05, C.owlEye, [htr.x + sx * 0.065, hy + 0.04, hz + 0.05], 8, 6);
      ball(0.025, C.black, [htr.x + sx * 0.065, hy + 0.04, hz + 0.095], 6, 4);
      const ear = new THREE.ConeGeometry(0.03, 0.07, 4);
      put(ear, "#7a5a3c", [htr.x + sx * 0.09, hy + 0.14, hz + 0.02]);
    }
    const beak = new THREE.ConeGeometry(0.018, 0.05, 4);
    beak.rotateX(Math.PI);
    put(beak, C.flame, [htr.x, hy - 0.02, hz + 0.08]);
  }

  // crown branches
  const crownBranches: [number[], number[], number, number][] = [
    [[0, 6.0, -0.75], [-2.1, 8.1, -1.0], 0.28, 0.1],
    [[0, 6.2, -0.75], [2.2, 7.9, -0.7], 0.27, 0.1],
    [[0, 6.6, -0.8], [0.5, 8.6, -2.1], 0.24, 0.09],
    [[0, 6.9, -0.8], [-0.9, 9.0, -1.6], 0.2, 0.08],
  ];
  for (const [a, c, r1, r2] of crownBranches) taper(a, c, r1, r2, C.bark, 6);

  // swing branch
  const sbA = [-0.2, 3.8, -0.6];
  const sbB = [-3.2, 4.32, -0.2];
  taper(sbA, sbB, 0.32, 0.12, C.bark, 7);
  ball(0.12, C.bark, sbB, 6, 4);
  taper([-2.9, 4.27, -0.25], [-3.3, 4.75, -0.35], 0.07, 0.04, C.bark, 5);
  const branchAt = (x: number) => {
    const t = (x - sbA[0]) / (sbB[0] - sbA[0]);
    return [x, sbA[1] + (sbB[1] - sbA[1]) * t, sbA[2] + (sbB[2] - sbA[2]) * t];
  };

  // leafy crown (faceted icosahedra)
  const blobs: [number, number, number, number, string][] = [
    [0, 9.1, -1.0, 2.0, C.leaf1],
    [-1.9, 8.4, -0.9, 1.6, C.leaf2],
    [1.9, 8.3, -0.7, 1.6, C.leaf1],
    [0.3, 8.2, -2.5, 1.7, C.leaf4],
    [-1.3, 9.7, -1.9, 1.5, C.leaf2],
    [1.3, 9.8, -1.6, 1.4, C.leaf1],
    [-3.0, 7.7, -1.4, 1.1, C.leaf4],
    [3.0, 7.6, -1.2, 1.1, C.leaf2],
    [0, 10.5, -0.8, 1.3, C.leaf3],
    [-1.0, 8.4, 0.6, 1.1, C.leaf1],
    [1.15, 9.1, 0.4, 1.0, C.leaf3],
    [-2.2, 9.2, 0.0, 0.9, C.leaf3],
    [2.4, 9.0, -0.1, 0.9, C.leaf1],
    [-0.7, 7.7, -2.9, 1.0, C.leaf2],
    [1.6, 7.5, -2.4, 1.0, C.leaf4],
    [0.6, 10.9, -1.6, 0.9, C.leaf3],
    [-3.35, 4.8, -0.3, 0.55, C.leaf1],
    [-3.0, 5.05, -0.65, 0.45, C.leaf3],
  ];
  for (const [x, y, z, r, col] of blobs) {
    put(new THREE.IcosahedronGeometry(r, 1), col, [x, y, z]);
  }
  // light highlight clumps on top and small leaf tufts
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.5 + rand() * 2.6;
    const x = Math.cos(a) * rr;
    const z = -1.0 + Math.sin(a) * rr * 0.8;
    const y = 9.4 + (1 - rr / 3.1) * 1.4 + rand() * 0.3;
    put(new THREE.IcosahedronGeometry(0.35 + rand() * 0.3, 0), pick([C.leaf3, C.grassLight]), [x, y, z]);
  }
  // acorns hanging under the crown
  for (const p of [[-2.6, 7.0, -0.6], [2.5, 6.9, -0.4], [-0.4, 7.3, 1.0], [1.9, 7.1, -1.9]]) {
    const nut = new THREE.SphereGeometry(0.09, 7, 5);
    nut.scale(1, 1.3, 1);
    put(nut, C.woodAlt, p);
    const cap = new THREE.SphereGeometry(0.1, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    put(cap, C.barkDark, [p[0], p[1] + 0.06, p[2]]);
  }

  // ================= PLATFORM =================
  const PY = 4.4; // platform top
  const px0 = -1.4, px1 = 1.6, pz0 = -1.0, pz1 = 1.65;
  {
    const n = 10;
    const w = (px1 - px0) / n;
    for (let i = 0; i < n; i++) {
      box(w - 0.025, 0.08, pz1 - pz0 + (i % 2 ? 0.04 : 0), i % 2 ? C.woodAlt : C.wood, [px0 + w * (i + 0.5), PY - 0.04, (pz0 + pz1) / 2 + (i % 3 === 0 ? 0.02 : 0)]);
      // nail heads near the front edge
      ball(0.018, C.iron, [px0 + w * (i + 0.5), PY + 0.005, pz1 - 0.1], 4, 3);
    }
    box(px1 - px0 + 0.1, 0.16, 0.16, C.woodDark, [(px0 + px1) / 2, PY - 0.16, pz1 - 0.15]);
    box(px1 - px0 + 0.1, 0.16, 0.16, C.woodDark, [(px0 + px1) / 2, PY - 0.16, -0.25]);
    box(0.16, 0.16, pz1 - pz0, C.woodDark, [px0 + 0.1, PY - 0.16, (pz0 + pz1) / 2]);
    box(0.16, 0.16, pz1 - pz0, C.woodDark, [px1 - 0.1, PY - 0.16, (pz0 + pz1) / 2]);
    // diagonal braces from trunk
    rod([-0.3, 2.9, 0.0], [-1.25, PY - 0.2, pz1 - 0.2], 0.07, C.woodDark, 6);
    rod([0.35, 2.9, 0.0], [1.45, PY - 0.2, pz1 - 0.2], 0.07, C.woodDark, 6);
    rod([-0.5, 3.2, -0.6], [-1.3, PY - 0.2, -0.3], 0.06, C.woodDark, 6);
    rod([0.5, 3.2, -0.6], [1.5, PY - 0.2, -0.3], 0.06, C.woodDark, 6);
  }

  // railing
  const RH = 0.6;
  const post = (x: number, z: number) => {
    box(0.08, RH, 0.08, C.woodDark, [x, PY + RH / 2, z]);
    ball(0.055, C.woodDark, [x, PY + RH + 0.02, z], 6, 4);
  };
  const frontZ = pz1 - 0.05;
  const frontPosts = [-1.35, -0.6, 0.2, 0.9];
  for (const x of frontPosts) post(x, frontZ);
  post(1.55, frontZ);
  box(0.9 + 1.35, 0.06, 0.07, C.wood, [(0.9 - 1.35) / 2, PY + RH - 0.03, frontZ]);
  box(0.9 + 1.35, 0.05, 0.05, C.wood, [(0.9 - 1.35) / 2, PY + RH * 0.45, frontZ]);
  for (const sx of [-1.35, 1.55]) {
    post(sx, -0.95);
    post(sx, 0.35);
    box(0.07, 0.06, frontZ + 0.95, C.wood, [sx, PY + RH - 0.03, (frontZ - 0.95) / 2]);
    box(0.05, 0.05, frontZ + 0.95, C.wood, [sx, PY + RH * 0.45, (frontZ - 0.95) / 2]);
  }
  // bunting on the front rail
  {
    const cols = [C.roof3, C.flag, C.bike, C.cream, C.pink];
    const x0 = -1.3, x1 = 0.85, n = 9;
    for (let i = 0; i < n; i++) {
      const x = x0 + ((x1 - x0) * (i + 0.5)) / n;
      const g = new THREE.ConeGeometry(0.075, 0.16, 3);
      g.rotateX(Math.PI);
      g.scale(1, 1, 0.25);
      put(g, cols[i % cols.length], [x, PY + RH - 0.13, frontZ + 0.05]);
    }
  }

  // ================= CABIN =================
  const cx = 0.05, cz = 0.15, W = 2.1, D = 1.7, yb = PY, H = 1.55, rh = 0.85;
  const fz = cz + D / 2; // front wall
  {
    const rows = 7;
    const rhh = H / rows;
    for (let i = 0; i < rows; i++) {
      const e = i % 2 ? 0.035 : 0;
      box(W + e, rhh - 0.01, D + e, i % 2 ? C.woodAlt : C.wood, [cx, yb + rhh * (i + 0.5), cz]);
    }
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        box(0.14, H + 0.04, 0.14, C.woodDark, [cx + sx * (W / 2), yb + H / 2, cz + sz * (D / 2)]);
  }
  // gables
  {
    const s = new THREE.Shape();
    s.moveTo(-D / 2, 0);
    s.lineTo(D / 2, 0);
    s.lineTo(0, rh);
    s.lineTo(-D / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: W - 0.02, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    g.translate(-(W - 0.02) / 2, 0, 0);
    put(g, C.woodLight, [cx, yb + H, cz]);
    for (const sx of [-1, 1]) {
      const v = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12);
      v.rotateZ(Math.PI / 2);
      put(v, C.hole, [cx + sx * (W / 2), yb + H + 0.32, cz]);
      const vr = new THREE.TorusGeometry(0.12, 0.03, 4, 12);
      vr.rotateY(Math.PI / 2);
      put(vr, C.trim, [cx + sx * (W / 2 + 0.01), yb + H + 0.32, cz]);
    }
  }
  // roof
  {
    const theta = Math.atan2(rh, D / 2);
    const ridgeY = yb + H + rh;
    const run = D / 2 + 0.3;
    const L = run / Math.cos(theta);
    const RW = W + 0.5;
    const hw = RW / 2;
    for (const s of [1, -1]) {
      const rot = s * theta;
      const down = V(0, -Math.sin(theta), s * Math.cos(theta));
      const nrm = V(0, Math.cos(theta), s * Math.sin(theta));
      const ridge = V(cx, ridgeY, cz);
      const pg = new THREE.BoxGeometry(RW, 0.1, L);
      pg.rotateX(rot);
      const pc = ridge.clone().add(down.clone().multiplyScalar(L / 2)).add(nrm.clone().multiplyScalar(0.05));
      put(pg, C.roof2, pc);
      // barge boards
      for (const sx of [-1, 1]) {
        const bg = new THREE.BoxGeometry(0.07, 0.18, L + 0.05);
        bg.rotateX(rot);
        put(bg, C.trim, pc.clone().add(V(sx * (hw + 0.03), 0, 0)));
      }
      // shingles
      const rows = 6;
      const n = 9;
      const w = RW / n;
      for (let r = 0; r < rows; r++) {
        const dist = 0.14 + r * 0.27;
        const odd = r % 2 === 1;
        for (let c = 0; c <= n; c++) {
          let x0 = -hw + w * c - (odd ? w / 2 : 0);
          let x1 = x0 + w;
          x0 = Math.max(x0, -hw);
          x1 = Math.min(x1, hw);
          if (x1 - x0 < 0.06) continue;
          const sg = new THREE.BoxGeometry(x1 - x0 - 0.025, 0.045, 0.32);
          sg.rotateX(rot + s * 0.05);
          const p = ridge
            .clone()
            .add(down.clone().multiplyScalar(dist))
            .add(nrm.clone().multiplyScalar(0.12 + (odd ? 0.012 : 0)));
          p.x = cx + (x0 + x1) / 2;
          put(sg, pick([C.roof1, C.roof1, C.roof3, C.roof2]), p);
        }
      }
      // eave fascia
      const eave = ridge.clone().add(down.clone().multiplyScalar(L));
      const fg = new THREE.BoxGeometry(RW + 0.08, 0.1, 0.06);
      fg.rotateX(rot);
      put(fg, C.trim, eave.add(nrm.clone().multiplyScalar(0.02)));
    }
    const cap = new THREE.CylinderGeometry(0.1, 0.1, RW + 0.1, 6);
    cap.rotateZ(Math.PI / 2);
    put(cap, C.roof2, [cx, ridgeY + 0.15, cz]);
    for (const sx of [-1, 1]) ball(0.11, C.roof1, [cx + sx * (hw + 0.05), ridgeY + 0.15, cz], 6, 4);

    // ---- pennant flag ----
    const poleX = cx + W / 2 - 0.05;
    const poleBase = ridgeY + 0.2;
    const flagPole = b.joint("flagPole", { at: [poleX, poleBase, cz], parent: root });
    const flagJ = b.joint("flag", { at: [poleX, poleBase + 0.9, cz], parent: flagPole });
    rod([poleX, poleBase - 0.1, cz], [poleX, poleBase + 1.0, cz], 0.022, C.iron, 6, flagPole);
    ball(0.045, C.gold, [poleX, poleBase + 1.03, cz], 8, 6, flagPole);
    const fs = new THREE.Shape();
    fs.moveTo(0, 0);
    fs.lineTo(0.7, -0.15);
    fs.lineTo(0, -0.32);
    fs.lineTo(0, 0);
    const fgeo = new THREE.ExtrudeGeometry(fs, { depth: 0.02, bevelEnabled: false });
    fgeo.translate(0.02, 0, -0.01);
    put(fgeo, C.flag, [poleX, poleBase + 0.95, cz], flagJ);
    const em = new THREE.CylinderGeometry(0.055, 0.055, 0.035, 10);
    em.rotateX(Math.PI / 2);
    put(em, C.roof3, [poleX + 0.2, poleBase + 0.8, cz], flagJ);
    const stripe = new THREE.BoxGeometry(0.035, 0.26, 0.03);
    put(stripe, C.cream, [poleX + 0.06, poleBase + 0.8, cz], flagJ);
  }

  // door
  {
    const dx = cx - 0.5, dw = 0.6, dh = 1.12;
    box(dw, dh, 0.06, C.door, [dx, yb + dh / 2, fz + 0.03]);
    for (const o of [-0.15, 0.15]) box(0.025, dh - 0.06, 0.02, C.barkDark, [dx + o, yb + dh / 2, fz + 0.065]);
    box(dw + 0.16, 0.09, 0.08, C.trim, [dx, yb + dh + 0.04, fz + 0.04]);
    for (const sx of [-1, 1]) box(0.08, dh, 0.08, C.trim, [dx + sx * (dw / 2 + 0.04), yb + dh / 2, fz + 0.04]);
    ball(0.04, C.gold, [dx + 0.2, yb + 0.55, fz + 0.09], 6, 4);
    // little door window
    const dwin = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 10);
    dwin.rotateX(Math.PI / 2);
    put(dwin, C.glow, [dx, yb + 0.85, fz + 0.065]);
    const dwr = new THREE.TorusGeometry(0.09, 0.02, 4, 10);
    put(dwr, C.trim, [dx, yb + 0.85, fz + 0.075]);
    // welcome mat
    box(0.7, 0.025, 0.35, C.mat, [dx, yb + 0.012, fz + 0.25]);
    box(0.5, 0.027, 0.06, C.flag, [dx, yb + 0.014, fz + 0.25]);
  }
  // round window
  {
    const wx = cx + 0.5, wy = yb + 0.88;
    const g = new THREE.CylinderGeometry(0.3, 0.3, 0.04, 16);
    g.rotateX(Math.PI / 2);
    put(g, C.glow, [wx, wy, fz + 0.02]);
    put(new THREE.TorusGeometry(0.31, 0.065, 6, 16), C.trim, [wx, wy, fz + 0.05]);
    box(0.04, 0.6, 0.03, C.trim, [wx, wy, fz + 0.05]);
    box(0.6, 0.04, 0.03, C.trim, [wx, wy, fz + 0.05]);
    // window box with flowers
    box(0.72, 0.16, 0.2, C.woodDark, [wx, wy - 0.46, fz + 0.12]);
    box(0.74, 0.03, 0.22, C.wood, [wx, wy - 0.37, fz + 0.12]);
    const fc = [C.roof3, C.flag, C.pink, C.purple, C.cream];
    for (let i = 0; i < 6; i++) {
      const x = wx - 0.28 + i * 0.112;
      ball(0.06, C.leaf2, [x, wy - 0.34, fz + 0.12], 6, 4);
      ball(0.045, fc[i % fc.length], [x + 0.02, wy - 0.27, fz + 0.15], 6, 4);
    }
  }
  // side window with shutters (+X side)
  {
    const sxw = cx + W / 2 + 0.02, sy = yb + 0.9;
    box(0.04, 0.46, 0.44, C.glow, [sxw, sy, cz]);
    box(0.06, 0.5, 0.04, C.trim, [sxw + 0.01, sy, cz]);
    box(0.06, 0.04, 0.5, C.trim, [sxw + 0.01, sy, cz]);
    box(0.07, 0.07, 0.6, C.trim, [sxw + 0.02, sy - 0.27, cz]);
    box(0.07, 0.06, 0.56, C.trim, [sxw + 0.02, sy + 0.26, cz]);
    for (const sz of [-1, 1]) {
      box(0.04, 0.52, 0.22, C.shutter, [sxw + 0.03, sy, cz + sz * 0.36]);
      for (const o of [-0.12, 0.0, 0.12]) box(0.045, 0.03, 0.18, "#2f6e57", [sxw + 0.035, sy + o, cz + sz * 0.36]);
    }
  }
  // lantern by the door
  {
    const lx = cx - 0.95, ly = yb + 1.32;
    rod([lx, ly, fz], [lx, ly, fz + 0.24], 0.018, C.iron, 5);
    box(0.08, 0.14, 0.03, C.iron, [lx, ly, fz + 0.015]);
    const ly2 = ly - 0.24;
    rod([lx, ly, fz + 0.24], [lx, ly2 + 0.2, fz + 0.24], 0.01, C.iron, 4);
    const ring = new THREE.TorusGeometry(0.03, 0.01, 4, 8);
    put(ring, C.iron, [lx, ly2 + 0.19, fz + 0.24]);
    const capG = new THREE.ConeGeometry(0.12, 0.1, 4);
    capG.rotateY(Math.PI / 4);
    put(capG, C.iron, [lx, ly2 + 0.13, fz + 0.24]);
    box(0.13, 0.17, 0.13, C.glow, [lx, ly2, fz + 0.24]);
    const flameG = new THREE.ConeGeometry(0.03, 0.08, 5);
    put(flameG, C.flame, [lx, ly2 + 0.0, fz + 0.24]);
    box(0.16, 0.04, 0.16, C.iron, [lx, ly2 - 0.1, fz + 0.24]);
    for (const ox of [-1, 1])
      for (const oz of [-1, 1]) rod([lx + ox * 0.068, ly2 - 0.09, fz + 0.24 + oz * 0.068], [lx + ox * 0.068, ly2 + 0.09, fz + 0.24 + oz * 0.068], 0.01, C.iron, 4);
  }
  // potted plant on the porch
  {
    const ppx = 1.3, ppz = 1.25;
    put(new THREE.CylinderGeometry(0.14, 0.1, 0.22, 8), C.terracotta, [ppx, PY + 0.11, ppz]);
    put(new THREE.CylinderGeometry(0.155, 0.155, 0.05, 8), C.terracotta, [ppx, PY + 0.21, ppz]);
    put(new THREE.IcosahedronGeometry(0.2, 0), C.leaf1, [ppx, PY + 0.38, ppz]);
    ball(0.04, C.pink, [ppx + 0.1, PY + 0.48, ppz + 0.1], 6, 4);
    ball(0.04, C.pink, [ppx - 0.08, PY + 0.52, ppz + 0.05], 6, 4);
  }

  // ================= ROPE LADDER =================
  {
    const ladder = b.joint("ladder", { at: [1.22, PY, pz1], parent: root });
    const top = PY - 0.02, bot = G + 0.04;
    const zt = pz1 + 0.02, zb = pz1 + 0.25;
    for (const x of [1.0, 1.44]) {
      rod([x, top + 0.05, zt], [x, bot, zb], 0.025, C.rope, 5, ladder);
      put(new THREE.TorusGeometry(0.05, 0.02, 4, 8), C.rope, [x, top, zt], ladder);
    }
    const n = 12;
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 0.5);
      const y = top + (bot - top) * t;
      const z = zt + (zb - zt) * t;
      const rg = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6);
      rg.rotateZ(Math.PI / 2);
      put(rg, i % 2 ? C.wood : C.woodAlt, [1.22, y, z], ladder);
      for (const x of [1.0, 1.44]) ball(0.035, C.rope, [x, y - 0.03, z], 5, 4, ladder);
    }
  }

  // ================= SWING =================
  {
    const pA = branchAt(-2.2);
    const pB = branchAt(-2.8);
    const swing = b.joint("swing", { at: [-2.5, (pA[1] + pB[1]) / 2, -0.29], parent: root });
    const seatY = 1.35;
    for (const p of [pA, pB]) {
      const t = new THREE.TorusGeometry(0.2, 0.03, 4, 10);
      t.rotateY(Math.PI / 2);
      put(t, C.rope, p, swing);
      rod([p[0], p[1] - 0.18, p[2]], [p[0], seatY + 0.02, -0.29], 0.022, C.rope, 5, swing);
      ball(0.04, C.rope, [p[0], seatY - 0.06, -0.29], 5, 4, swing);
    }
    box(0.85, 0.07, 0.32, C.wood, [-2.5, seatY, -0.29], swing);
    box(0.85, 0.02, 0.06, C.woodDark, [-2.5, seatY + 0.04, -0.29], swing);
  }

  // ================= GROUND DETAILS =================
  // mushrooms
  const mushroom = (x: number, z: number, r: number, h: number, cap = C.mushRed) => {
    put(new THREE.CylinderGeometry(r * 0.38, r * 0.5, h, 8), C.stem, [x, G + h / 2, z]);
    const cg = new THREE.SphereGeometry(r, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    cg.scale(1, 0.72, 1);
    put(cg, cap, [x, G + h - 0.02, z]);
    put(new THREE.CylinderGeometry(r * 0.96, r * 0.6, 0.03, 10), C.trim, [x, G + h - 0.03, z]);
    if (cap === C.mushRed) {
      const dots = Math.round(5 + r * 10);
      for (let i = 0; i < dots; i++) {
        const al = (i / dots) * Math.PI * 2 + rand() * 0.4;
        const ph = 0.35 + (i % 2) * 0.55 + rand() * 0.1;
        const dg = new THREE.SphereGeometry(r * 0.13, 5, 3);
        dg.scale(1, 0.5, 1);
        put(dg, C.cream, [x + Math.sin(ph) * Math.cos(al) * r * 0.98, G + h - 0.02 + Math.cos(ph) * r * 0.72 * 0.98, z + Math.sin(ph) * Math.sin(al) * r * 0.98]);
      }
      ball(r * 0.14, C.cream, [x, G + h - 0.02 + r * 0.72, z], 5, 3);
    }
  };
  mushroom(-1.35, 1.25, 0.3, 0.42);
  mushroom(-0.95, 1.65, 0.18, 0.26);
  mushroom(-1.75, 0.85, 0.14, 0.2);
  mushroom(-1.6, 1.6, 0.1, 0.14, C.woodLight);
  mushroom(1.5, -1.7, 0.22, 0.3);
  mushroom(1.8, -1.35, 0.12, 0.17, C.woodLight);
  mushroom(-3.4, 2.4, 0.16, 0.22);

  // stepping stones from the ladder to the front
  for (const [x, z, r] of [[1.15, 2.35, 0.26], [0.85, 3.05, 0.24], [1.05, 3.75, 0.22], [0.75, 4.4, 0.2]]) {
    put(new THREE.CylinderGeometry(r, r * 1.05, 0.07, 7), pick([C.stone, C.stoneLight]), [x, G + 0.01, z]);
  }
  // rocks
  for (const [x, z, s] of [[-4.0, -1.5, 0.35], [-3.7, -2.1, 0.2], [3.6, -2.4, 0.3], [4.1, 0.6, 0.2], [-1.9, -3.8, 0.28]]) {
    const g = new THREE.DodecahedronGeometry(s, 0);
    g.scale(1.2, 0.65, 1);
    put(g, pick([C.stone, C.stoneLight]), [x, G + s * 0.25, z]);
  }
  // tree stump with rings
  {
    const sx = -2.9, sz = 2.0;
    put(new THREE.CylinderGeometry(0.32, 0.38, 0.4, 9), C.bark, [sx, G + 0.2, sz]);
    put(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 9), C.woodLight, [sx, G + 0.405, sz]);
    put(new THREE.TorusGeometry(0.18, 0.012, 3, 12).rotateX(Math.PI / 2), C.woodAlt, [sx, G + 0.418, sz]);
    put(new THREE.TorusGeometry(0.09, 0.012, 3, 10).rotateX(Math.PI / 2), C.woodAlt, [sx, G + 0.418, sz]);
  }
  // flowers
  const flowerCols = [C.pink, C.yellow, C.purple, C.white, C.roof3];
  for (let i = 0; i < 18; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 2.0 + rand() * 2.7;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (x > 1.7 && x < 3.6 && z > 2.0 && z < 3.0) continue; // bike spot
    if (x > 0.5 && x < 1.5 && z > 2.0) continue; // path
    const h = 0.14 + rand() * 0.12;
    rod([x, G, z], [x, G + h, z], 0.012, C.grassDark, 4);
    const col = flowerCols[i % flowerCols.length];
    for (let p = 0; p < 5; p++) {
      const pa = (p / 5) * Math.PI * 2;
      ball(0.035, col, [x + Math.cos(pa) * 0.045, G + h, z + Math.sin(pa) * 0.045], 5, 3);
    }
    ball(0.028, col === C.yellow ? C.flame : C.yellow, [x, G + h + 0.012, z], 5, 3);
  }
  // grass tufts
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 1.4 + rand() * 3.4;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (x > 1.7 && x < 3.6 && z > 2.0 && z < 3.0) continue;
    const col = pick([C.grassDark, C.grassLight, C.grass]);
    for (let k = 0; k < 3; k++) {
      const la = a + k * 2.1;
      const tip = [x + Math.cos(la) * 0.08, G + 0.22 + rand() * 0.1, z + Math.sin(la) * 0.08];
      taper([x, G - 0.01, z], tip, 0.035, 0.004, col, 4);
    }
  }
  // fallen leaves
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 1.3 + rand() * 3.2;
    const g = new THREE.BoxGeometry(0.14, 0.015, 0.08);
    g.rotateY(rand() * Math.PI);
    put(g, pick([C.leafOrange, C.flag, C.leaf3]), [Math.cos(a) * rr, G + 0.008, Math.sin(a) * rr]);
  }

  // ================= BICYCLE =================
  {
    const z = 2.5;
    const y0 = G + 0.34;
    const Rw = [2.1, y0, z], Fw = [3.15, y0, z];
    const BB = [2.52, y0 - 0.02, z];
    const S = [2.38, y0 + 0.5, z];
    const Ht = [2.98, y0 + 0.56, z];
    const Hb = [3.02, y0 + 0.4, z];
    for (const c of [Rw, Fw]) {
      put(new THREE.TorusGeometry(0.34, 0.035, 6, 20), C.tire, c);
      put(new THREE.TorusGeometry(0.305, 0.014, 4, 20), C.metal, c);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI + 0.3;
        const dx = Math.cos(a) * 0.3, dy = Math.sin(a) * 0.3;
        rod([c[0] + dx, c[1] + dy, c[2]], [c[0] - dx, c[1] - dy, c[2]], 0.006, C.metal, 3);
      }
      const hub = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 6);
      hub.rotateX(Math.PI / 2);
      put(hub, C.metal, c);
      // fender
      const fg = new THREE.TorusGeometry(0.4, 0.025, 4, 12, Math.PI * 0.7);
      fg.rotateZ(Math.PI * 0.15);
      put(fg, C.bike, c);
    }
    const tube = 0.028;
    rod(Rw, BB, tube * 0.8, C.bike);
    rod(Rw, S, tube * 0.8, C.bike);
    rod(BB, S, tube, C.bike);
    rod(S, Ht, tube, C.bike);
    rod(BB, Hb, tube * 1.1, C.bike);
    rod(Hb, Ht, tube * 1.3, C.bike);
    rod(Hb, Fw, tube * 0.8, C.bike);
    // seat
    rod(S, [S[0] - 0.03, S[1] + 0.12, z], 0.016, C.metal, 5);
    box(0.24, 0.06, 0.12, C.saddle, [S[0] - 0.05, S[1] + 0.15, z]);
    // handlebar
    const st = [2.95, y0 + 0.72, z];
    rod(Ht, st, 0.018, C.metal, 5);
    rod([st[0], st[1], z - 0.25], [st[0], st[1], z + 0.25], 0.015, C.metal, 5);
    for (const s of [-1, 1]) rod([st[0], st[1], z + s * 0.17], [st[0], st[1], z + s * 0.28], 0.025, C.tire, 5);
    ball(0.035, C.gold, [st[0] + 0.02, st[1] + 0.03, z + 0.12], 6, 4);
    // crank, chainring, chain, pedals
    put(new THREE.TorusGeometry(0.08, 0.015, 4, 12), C.metal, [BB[0], BB[1], z + 0.04]);
    rod([BB[0], BB[1], z + 0.05], [BB[0] + 0.08, BB[1] - 0.12, z + 0.06], 0.012, C.metal, 4);
    box(0.09, 0.02, 0.07, C.iron, [BB[0] + 0.08, BB[1] - 0.13, z + 0.1]);
    rod([BB[0] - 0.06, BB[1] + 0.06, z + 0.04], [Rw[0], Rw[1] + 0.04, z + 0.04], 0.006, C.iron, 3);
    rod([BB[0] - 0.06, BB[1] - 0.06, z + 0.04], [Rw[0], Rw[1] - 0.04, z + 0.04], 0.006, C.iron, 3);
    // kickstand
    rod([BB[0] - 0.05, BB[1], z - 0.04], [BB[0] - 0.18, G + 0.01, z - 0.2], 0.012, C.metal, 4);
    // basket with flowers
    const bc = [3.2, y0 + 0.6, z];
    box(0.26, 0.2, 0.32, C.wicker, bc);
    for (const o of [-0.06, 0.0, 0.06]) box(0.27, 0.018, 0.33, C.woodAlt, [bc[0], bc[1] + o, z]);
    rod([bc[0] - 0.13, bc[1] - 0.1, z], Hb, 0.01, C.metal, 4);
    ball(0.07, C.leaf1, [bc[0], bc[1] + 0.12, z - 0.06], 6, 4);
    ball(0.05, C.pink, [bc[0] + 0.04, bc[1] + 0.17, z + 0.06], 6, 4);
    ball(0.05, C.flag, [bc[0] - 0.05, bc[1] + 0.16, z + 0.02], 6, 4);
    ball(0.045, C.purple, [bc[0] + 0.02, bc[1] + 0.15, z - 0.1], 6, 4);
  }

  return b.root;
}
```