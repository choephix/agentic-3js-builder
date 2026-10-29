import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, frame, offset, rng } from "../../../../src/index";

export const meta = {
  "name": "Alebrije Jaguar-Eagle",
  "description": "A four-pawed jaguar chimera with a cream eagle head, hooked gold beak, wide fully-feathered painted wings and a plumed tail, covered in Oaxacan alebrije flowers, dots, chevrons and ink outlines."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  coatMain: "#e2621b",
  coatDeep: "#a83a10",
  belly: "#ffcf3f",
  cream: "#fff3d6",
  wingTeal: "#1fae9b",
  wingBlue: "#2f6fd1",
  wingDeep: "#22408f",
  featherRed: "#e23b4e",
  beakGold: "#f2a413",
  bone: "#f5e6c8",
  ink: "#26132e",
  white: "#fff8ec",
  eyeAmber: "#ffb020",
  mouthDark: "#4a1030",
  flowerMagenta: "#e0369c",
  flowerGreen: "#3fae4c",
  flowerRed: "#d62828",
  flowerPurple: "#7b3fd1",
  flowerCyan: "#25c8d8",
};
const M = {
  neckTop: [0, 1.56, 1.28] as [number, number, number],
  jawPivot: [0, 1.48, 1.52] as [number, number, number],
  shoulderL: [0.34, 1.5, 0.55] as [number, number, number],
  shoulderR: [-0.34, 1.5, 0.55] as [number, number, number],
  hipFrontL: [0.36, 0.9, 0.72] as [number, number, number],
  hipFrontR: [-0.36, 0.9, 0.72] as [number, number, number],
  hipBackL: [0.42, 0.95, -0.55] as [number, number, number],
  hipBackR: [-0.42, 0.95, -0.55] as [number, number, number],
  tailBase: [0, 1.18, -0.88] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const V = (p: any) => new THREE.Vector3(p.x, p.y, p.z);
  const lerpKeys = (keys: number[], t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
    const i = Math.min(Math.floor(x), keys.length - 2);
    return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
  };

  // ---------- body tube ----------
  const spine = catmull([
    [0, 1.1, -0.52],
    [0, 1.1, 0.05],
    [0, 1.15, 0.45],
    [0, 1.22, 0.8],
  ]);
  const RX = [0.46, 0.55, 0.5];
  const RY = [0.44, 0.5, 0.5];
  const torso = b.sweep(spine, (t: number) => [lerpKeys(RX, t), lerpKeys(RY, t)], {
    shift: [0, -0.05],
    bone: J.body,
    color: P.coatMain,
    sectors: [
      [-8, 8, P.coatDeep],
      [125, 150, P.belly],
      [150, 210, P.coatDeep],
      [210, 235, P.belly],
    ],
  });
  const skin = b.surface(torso);

  // ---------- neck ----------
  const neckPath = catmull([
    [0, 1.3, 0.72],
    [0, 1.42, 0.98],
    M.neckTop,
  ]);
  b.sweep(neckPath, [0.3, 0.22], {
    bone: J.neck,
    color: P.coatMain,
    caps: { start: "round", end: "flat" },
    sectors: [[135, 225, P.belly]],
  });

  // teal collar with cream chevrons
  {
    const tt = 0.78;
    const pt = neckPath.at(tt);
    const tan = neckPath.tangentAt(tt);
    const band = b.ring(frame(pt, tan), { count: 14, radius: 0.262 });
    b.sweep(catmull(band.items, { closed: true }), 0.03, { color: P.wingTeal, bone: J.neck });
    band.items.forEach((it: any, i: number) => {
      if (i % 2) return;
      const at = V(it.at).addScaledVector(V(it.axis), 0.03);
      b.part(new THREE.ConeGeometry(0.03, 0.07, 3), P.cream, { at: [at.x, at.y, at.z], dir: [0, -1, 0], bone: J.neck });
    });
  }

  // ---------- paired Oaxacan dots ----------
  const inkDot = new THREE.CylinderGeometry(0.03, 0.03, 0.016, 8);
  const creamDot = new THREE.CylinderGeometry(0.015, 0.015, 0.026, 8);
  for (const s of [1, -1]) {
    [[62, 0], [98, 0.5]].forEach(([a, off]) => {
      for (let i = 0; i < 8; i++) {
        const t = 0.1 + (i + off) * 0.105;
        const hit = torso.at(t, -s * a);
        b.stick(inkDot, P.ink, hit, { bone: J.body });
        b.stick(creamDot, P.cream, hit, { bone: J.body });
      }
    });
  }

  // ---------- toothed zigzag fur edge ----------
  const tooth = new THREE.ConeGeometry(0.04, 0.12, 4);
  for (const s of [1, -1]) {
    for (let i = 0; i < 16; i++) {
      const t = 0.04 + i * 0.062;
      const hit = torso.at(t, -s * 120);
      b.stick(tooth, P.belly, hit, { bone: J.body, embed: 0.25 });
    }
  }

  // ---------- chevron bands across the back ----------
  for (const z of [0.2, -0.35]) {
    const t = spine.closestT([0, 1.1, z]);
    [-52, -26, 0, 26, 52].forEach((a, k) => {
      const hit = torso.at(t, a);
      b.stick(new THREE.ConeGeometry(0.055, 0.11, 3), k % 2 ? P.belly : P.cream, hit, { bone: J.body, embed: 0.2 });
    });
  }

  // ---------- ink wave lines on the rump ----------
  for (const s of [1, -1]) {
    [0, -0.14].forEach((dy) => {
      const pts: number[][] = [];
      for (let i = 0; i < 6; i++) pts.push([s * 0.5, 1.15 + dy + (i % 2 ? 0.04 : -0.04), -0.5 + i * 0.08]);
      const path = skin.drape(catmull(pts), { lift: 0.008 });
      b.sweep(path, 0.008, { color: P.ink, bone: J.body });
    });
  }

  // ---------- chest ruff ----------
  const outline = (k: number): any[] => [
    [0, 0], [0.06 * k, 0.04 * k], [0.075 * k, 0.13 * k], [0.04 * k, 0.21 * k],
    [0, 0.26 * k, "sharp"], [-0.04 * k, 0.21 * k], [-0.075 * k, 0.13 * k], [-0.06 * k, 0.04 * k],
  ];
  const tipOutline = (k: number): any[] => [
    [-0.04 * k, 0.21 * k], [0, 0.26 * k, "sharp"], [0.04 * k, 0.21 * k], [0, 0.17 * k],
  ];
  const ruff = (xs: number[], y0: number, k: number, color: string, lift: number) => {
    for (const xa of xs) {
      const hit = skin.ray([xa, y0, 1.9], [0, -0.05, -1]);
      if (!hit) continue;
      const n = V(hit.n).normalize();
      const g = new THREE.Vector3(xa * 1.2, -1, -0.1);
      const d = g.addScaledVector(n, -g.dot(n)).normalize();
      const xd = new THREE.Vector3().crossVectors(d, n).normalize();
      const root = V(hit.at).addScaledVector(n, lift);
      const rt: [number, number, number] = [root.x, root.y, root.z];
      b.extrude(outline(k), { at: rt, x: [xd.x, xd.y, xd.z], y: [d.x, d.y, d.z], thickness: 0.014, color, bone: J.body });
      b.extrude(tipOutline(k), { at: rt, x: [xd.x, xd.y, xd.z], y: [d.x, d.y, d.z], thickness: 0.02, color: P.ink, bone: J.body });
      const a = root.clone().addScaledVector(n, 0.01);
      const e = root.clone().addScaledVector(d, 0.23 * k).addScaledVector(n, 0.01);
      b.rod([a.x, a.y, a.z], [e.x, e.y, e.z], 0.004, P.bone, { bone: J.body });
    }
  };
  ruff([-0.24, -0.12, 0, 0.12, 0.24], 1.55, 1, P.cream, 0.012);
  ruff([-0.3, -0.18, -0.06, 0.06, 0.18, 0.3].map((x) => x * 0.9), 1.42, 1.2, P.belly, 0.03);

  // ---------- shoulder medallions ----------
  for (const s of [1, -1]) {
    const hit = skin.nearest([s * 0.5, 1.35, 0.35]);
    const n = V(hit.n).normalize();
    const base = V(hit.at).addScaledVector(n, -0.02);
    const at: [number, number, number] = [base.x, base.y, base.z];
    const ax: [number, number, number] = [n.x, n.y, n.z];
    const disc = (r: number, h: number, c: string) =>
      b.lathe([[0, 0], [r, 0], [r, h], [0, h]], { at, axis: ax, segments: 16, color: c, bone: J.body });
    disc(0.17, 0.03, P.cream);
    disc(0.135, 0.04, P.flowerGreen);
    disc(0.1, 0.05, P.ink);
    disc(0.07, 0.06, P.flowerMagenta);
    disc(0.025, 0.07, P.cream);
    const cols = [P.flowerCyan, P.flowerRed];
    const ringC = V(hit.at).addScaledVector(n, 0.01);
    b.ring(frame([ringC.x, ringC.y, ringC.z], ax), { count: 8, radius: 0.2 }, (it: any) =>
      b.stick(new THREE.SphereGeometry(0.03, 6, 4), cols[it.i % 2], it, { bone: J.body, embed: 0.4 }),
    );
  }
}
    return buildTorso;
  })(),
  // eagleHead
  (() => {
function buildEagleHead({ b, J, P, M }: any) {
  const head = J.head;
  const jaw = J.jawLower;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skull ----------
  const HC: [number, number, number] = [0, 1.65, 1.5];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), P.cream, {
    bone: head, at: HC, scale: [0.3, 0.3, 0.34],
  });
  // neck cap hides the seam with the neck tube
  b.part(new THREE.SphereGeometry(0.25, 10, 8), P.cream, { bone: head, at: [M.neckTop[0], M.neckTop[1] + 0.02, M.neckTop[2] - 0.02] });
  // crown + nape patches
  b.part(new THREE.SphereGeometry(1, 10, 6), P.coatMain, { bone: head, at: [0, 1.91, 1.47], scale: [0.18, 0.07, 0.22] });
  b.part(new THREE.SphereGeometry(1, 10, 6), P.coatMain, { bone: head, at: [0, 1.66, 1.19], scale: [0.2, 0.2, 0.07] });
  // cheek spheres
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.14, 10, 8), P.cream, { bone: head, at: [s * 0.19, 1.5, 1.5] });
  }
  // paired dots on the crown
  const sk = b.surface(skull);
  for (const [az, el] of [[35, 68], [-35, 68], [180, 62], [150, 55], [-150, 55]] as number[][]) {
    const h = sk.around(skull.at).at(az, el);
    if (!h) continue;
    b.stick(new THREE.SphereGeometry(0.026, 8, 5), P.ink, h, { embed: 0.5, bone: head });
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), P.cream, h.moved([0, 0.012, 0]), { embed: 0.3, bone: head });
  }

  // ---------- helpers ----------
  const disc = (r: number, h: number, color: string, c: THREE.Vector3, n: THREE.Vector3, k: number) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 14), color, {
      bone: head, at: c.clone().addScaledVector(n, k), dir: n,
    });
  const medallion = (c: THREE.Vector3, n: THREE.Vector3, layers: [number, string][], bone: any) => {
    layers.forEach(([r, col], i) => {
      b.lathe([[0, 0], [r, 0], [r * 0.92, 0.012], [0, 0.016]], {
        at: c.clone().addScaledVector(n, i * 0.008), axis: n, segments: 14, color: col, bone,
      });
    });
  };

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    const n = V(s, 0.04, 0.5).normalize();
    const c = V(s * 0.255, 1.7, 1.66);
    disc(0.105, 0.04, P.ink, c, n, 0);
    disc(0.088, 0.03, P.white, c, n, 0.012);
    disc(0.064, 0.03, P.eyeAmber, c, n, 0.022);
    disc(0.038, 0.03, P.ink, c, n, 0.03);
    disc(0.014, 0.03, P.white, c.clone().add(V(-s * 0.0, 0.026, 0.0).add(V(s * -0.004, 0, 0.018))), n, 0.036);
    // brow stroke
    b.rod(V(s * 0.07, 1.885, 1.76), V(s * 0.25, 1.83, 1.62), 0.022, P.ink, { bone: head });
    b.rod(V(s * 0.1, 1.9, 1.74), V(s * 0.2, 1.87, 1.66), 0.011, P.cream, { bone: head, caps: "flat" });
  }

  // ---------- cheek discs ----------
  for (const s of [1, -1]) {
    const n = V(s, -0.3, 0.1).normalize();
    const c = V(s * 0.19, 1.5, 1.5).addScaledVector(n, 0.125);
    medallion(c, n, [[0.115, P.ink], [0.1, P.wingTeal], [0.07, P.cream], [0.04, P.flowerMagenta], [0.014, P.ink]], head);
  }

  // ---------- upper beak ----------
  const upperPath = catmull([[0, 1.62, 1.7], [0, 1.64, 1.88], [0, 1.6, 2.02], [0, 1.5, 2.08]]);
  const rU = (t: number): [number, number] => [0.115 - 0.085 * t, 0.125 - 0.095 * t];
  const beak = b.sweep(upperPath, rU, { bone: head, color: P.beakGold, sides: 8, caps: { start: "none", end: "point" } });
  b.sweep(upperPath, (t: number) => [rU(t)[0] + 0.01, rU(t)[1] + 0.01], {
    bone: head, color: P.wingTeal, from: 0, to: 0.17, sides: 8, caps: "none",
  });
  b.sweep(upperPath, (t: number) => [rU(t)[0] + 0.016, rU(t)[1] + 0.016], {
    bone: head, color: P.ink, from: 0.17, to: 0.2, sides: 8, caps: "none",
  });
  // culmen stripe
  b.along(beak, 6, (at: any) => {
    b.stick(new THREE.BoxGeometry(0.022, 0.02, 0.085), P.cream, at, { embed: 0.35, bone: head });
  }, { from: 0.24, to: 0.84 });
  // nostrils
  for (const a of [70, -70]) {
    const f = beak.at(0.3, a);
    b.stick(new THREE.BoxGeometry(0.014, 0.02, 0.075), P.ink, f, { embed: 0.4, bone: head });
  }
  // mouth interior under the upper beak
  const ua = beak.at(0.12, 180).at, ub = beak.at(0.78, 180).at;
  b.rod(ua, ub, [0.07, 0.014], P.mouthDark, { bone: head });

  // ---------- lower jaw (open) ----------
  const lowerPath = catmull([[0, 1.52, 1.66], [0, 1.42, 1.82], [0, 1.34, 1.95], [0, 1.31, 2.0]]);
  const rL = (t: number): [number, number] => [0.085 - 0.058 * t, 0.06 - 0.04 * t];
  const lower = b.sweep(lowerPath, rL, { bone: jaw, color: P.beakGold, sides: 8, caps: { start: "none", end: "point" } });
  const la = lower.at(0.1, 0).at, lb = lower.at(0.68, 0).at;
  b.rod(offset(la, [0, 1, 0], 0.005), offset(lb, [0, 1, 0], 0.005), [0.06, 0.016], P.mouthDark, { bone: jaw });
  const ta = lower.at(0.18, 0).at, tb = lower.at(0.6, 0).at;
  b.capsule(offset(ta, [0, 1, 0], 0.03), offset(tb, [0, 1, 0], 0.02), [0.026, 0.012], P.flowerRed, { bone: jaw });
  // cream stripe and ink dots on the lower beak
  b.along(lower, 4, (at: any) => {
    b.stick(new THREE.BoxGeometry(0.02, 0.016, 0.06), P.cream, at.moved ? at : at, { embed: 0.3, bone: jaw });
  }, { from: 0.3, to: 0.8 });
  for (const a of [180]) {
    b.stick(new THREE.BoxGeometry(0.012, 0.016, 0.08), P.ink, lower.at(0.35, a), { embed: 0.3, bone: jaw });
  }

  // ---------- feathers ----------
  const leaf = (L: number, w: number): any[] => [
    [0, 0, "sharp"], [w * 0.7, 0.12 * L], [w, 0.4 * L], [w * 0.7, 0.75 * L], [0, L, "sharp"],
    [-w * 0.7, 0.75 * L], [-w, 0.4 * L], [-w * 0.7, 0.12 * L],
  ];
  const feather = (
    base: THREE.Vector3, d: THREE.Vector3, o: THREE.Vector3, L: number, w: number,
    main: string, tip: string | null, shaft: string | null,
  ) => {
    d = d.clone().normalize();
    const x = new THREE.Vector3().crossVectors(d, o).normalize();
    const n = new THREE.Vector3().crossVectors(x, d).normalize();
    const common = { x: x.toArray() as [number, number, number], y: d.toArray() as [number, number, number], bone: head, smoothing: 1 };
    b.extrude(leaf(L * 1.07, w * 1.2), { ...common, at: base.clone().addScaledVector(d, -0.012), thickness: 0.016, color: P.ink });
    b.extrude(leaf(L, w), { ...common, at: base, thickness: 0.026, color: main });
    if (tip) {
      b.extrude(
        [[-w * 0.5, 0.76 * L], [0, 0.7 * L], [w * 0.5, 0.76 * L], [0, 0.985 * L, "sharp"]] as any,
        { x: common.x, y: common.y, bone: head, at: base, thickness: 0.03, color: tip },
      );
    }
    if (shaft) {
      b.rod(
        base.clone().addScaledVector(d, 0.03).addScaledVector(n, 0.015),
        base.clone().addScaledVector(d, L * 0.88).addScaledVector(n, 0.015),
        0.006, shaft, { bone: head, caps: "flat" },
      );
    }
  };

  // ---------- crest fan ----------
  const crestCols = [P.wingTeal, P.wingBlue, P.featherRed, P.featherRed, P.wingBlue, P.wingTeal];
  const angs = [-55, -33, -11, 11, 33, 55];
  const lens = [0.3, 0.36, 0.4, 0.4, 0.36, 0.3];
  angs.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const d = V(Math.sin(a) * 0.85, Math.cos(a), -0.3);
    const base = V(Math.sin(a) * 0.1, 1.9 - Math.abs(Math.sin(a)) * 0.04, 1.34);
    feather(base, d, V(0, 0, 1), lens[i], 0.062, crestCols[i], P.cream, P.bone);
  });

  // ---------- back-of-head ruff ----------
  const rows: [number, number, number, string][] = [[1.74, 1.3, 0.2, P.cream], [1.6, 1.26, 0.24, P.bone]];
  rows.forEach(([y, z, L, col], r) => {
    for (let i = 0; i < 8; i++) {
      const phi = ((-80 + i * (160 / 7) + (r ? 10 : 0)) * Math.PI) / 180;
      const o = V(Math.sin(phi), 0, -Math.cos(phi)).normalize();
      const d = V(Math.sin(phi) * 0.35, -0.8, -0.5);
      const base = V(Math.sin(phi) * 0.22, y, z - Math.cos(phi) * 0.06 + 0.02);
      feather(base, d, o, L, 0.058, col, r ? P.featherRed : null, null);
    }
  });
}
    return buildEagleHead;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const COAT = P.coatMain;
  const TEAL = P.wingTeal;
  const BLUE = P.wingBlue;
  const DEEP = P.wingDeep;
  const BELLY = P.belly;
  const CREAM = P.cream;
  const INK = P.ink;
  const BONE = P.bone;
  const CYAN = P.flowerCyan;

  // Feather outline in drawing coordinates: x along the feather, y across it.
  const outlineOf = (len: number, w: number): any[] => [
    [0, -w * 0.5],
    [len * 0.6, -w],
    [len * 0.92, -w * 0.7],
    [len, 0, "sharp"],
    [len * 0.92, w * 0.7],
    [len * 0.6, w],
    [0, w * 0.5],
  ];

  // A flat feather lying in a horizontal plane, pointing at `ang` degrees from the outward x axis toward -z.
  function feather(
    start: THREE.Vector3,
    ang: number,
    len: number,
    w: number,
    col: string,
    tipCol: string,
    bone: any,
    side: number,
    o: {
      lift?: number;
      tipFrom?: number;
      outline?: boolean;
      shaft?: boolean;
      notches?: boolean;
      dot?: boolean;
      thick?: number;
      zig?: boolean;
    } = {},
  ) {
    const a = (ang * Math.PI) / 180;
    const dx = side * Math.cos(a);
    const dz = -Math.sin(a);
    const X = V(dx, 0, dz);
    const Y = V(-dz, 0, dx);
    const at = start.clone();
    at.y += o.lift ?? 0;
    const pt = (u: number, v: number, h: number) =>
      at.clone().addScaledVector(X, u).addScaledVector(Y, v).add(V(0, h, 0));
    const thick = o.thick ?? 0.018;
    const dirArr = [dx, 0, dz];
    const yArr = [-dz, 0, dx];
    const tf = o.tipFrom ?? 0.78;
    if (o.outline !== false) {
      b.extrude(outlineOf(len + 0.016, w + 0.014), {
        at: pt(-0.008, 0, 0),
        x: dirArr,
        y: yArr,
        thickness: thick - 0.006,
        color: INK,
        bone,
      });
    }
    b.extrude(outlineOf(len, w), { at, x: dirArr, y: yArr, thickness: thick, color: col, bone });
    const wtf = w * (1 - (0.3 * (tf - 0.6)) / 0.32);
    b.extrude(
      [
        [tf * len, -wtf],
        [len * 0.92, -w * 0.7],
        [len, 0, "sharp"],
        [len * 0.92, w * 0.7],
        [tf * len, wtf],
      ] as any[],
      { at, x: dirArr, y: yArr, thickness: thick + 0.004, color: tipCol, bone },
    );
    if (o.shaft !== false) {
      b.rod(pt(0.04, 0, 0.012), pt(len * 0.93, 0, 0.012), 0.008, INK, { bone });
    }
    if (o.notches) {
      const sg = -side;
      for (const u of [0.6, 0.72]) {
        const uu = u * len;
        const e = w * 0.82 * sg;
        const i = w * 0.5 * sg;
        b.extrude(
          [
            [uu - 0.045, e],
            [uu + 0.045, e],
            [uu, i],
          ] as any[],
          { at, x: dirArr, y: yArr, thickness: thick + 0.01, color: CREAM, bone },
        );
      }
    }
    if (o.zig) {
      const L = len;
      const ww = w * 0.8;
      b.extrude(
        [
          [L * 0.5, -ww],
          [L * 0.56, -ww * 0.5],
          [L * 0.5, 0],
          [L * 0.56, ww * 0.5],
          [L * 0.5, ww],
          [L * 0.63, ww],
          [L * 0.69, ww * 0.5],
          [L * 0.63, 0],
          [L * 0.69, -ww * 0.5],
          [L * 0.63, -ww],
        ] as any[],
        { at, x: dirArr, y: yArr, thickness: thick + 0.004, color: CREAM, bone },
      );
    }
    if (o.dot) {
      b.part(new THREE.SphereGeometry(0.024, 6, 4), CREAM, {
        at: pt(len * 0.3, w * 0.4 * -side, 0.012),
        scale: [1, 0.5, 1],
        bone,
      });
    }
  }

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const j1 = J[`wing${L}1`];
    const j2 = J[`wing${L}2`];
    const jt = J[`wing${L}tip`];
    const sh = V(...((s > 0 ? M.shoulderL : M.shoulderR) as [number, number, number]));
    const el = j2.at.clone();
    const wr = jt.at.clone();

    // Arms
    b.capsule(sh, el, [0.13, 0.1], COAT, { bone: j1 });
    b.capsule(el, wr, [0.1, 0.07], COAT, { bone: j2 });
    const armDir1 = el.clone().sub(sh).normalize();
    const armDir2 = wr.clone().sub(el).normalize();
    b.part(new THREE.TorusGeometry(0.118, 0.022, 6, 12), TEAL, { at: el, dir: armDir1, axis: "z", bone: j2 });
    b.part(new THREE.TorusGeometry(0.088, 0.02, 6, 12), TEAL, { at: wr.clone().addScaledVector(armDir2, -0.1), dir: armDir2, axis: "z", bone: jt });
    // Leading-edge ridge
    b.rod(sh.clone().add(V(0, 0.03, 0.1)), el.clone().add(V(0, 0.03, 0.09)), 0.016, BONE, { bone: j1 });
    b.rod(el.clone().add(V(0, 0.03, 0.09)), wr.clone().add(V(0, 0.02, 0.065)), 0.014, BONE, { bone: j2 });

    // Primaries
    const lens = [0.7, 0.85, 0.95, 1.0, 1.0, 0.98, 0.95];
    for (let i = 0; i < 7; i++) {
      const t = 1 - i * 0.1;
      const start = wr.clone().lerp(el, 1 - t);
      const col = i % 2 === 0 ? TEAL : BLUE;
      feather(start, 15 + i * 10, lens[i], 0.1, col, DEEP, i < 3 ? jt : j2, s, {
        lift: -0.04 - i * 0.006,
        notches: true,
        dot: true,
      });
    }

    // Secondaries
    for (let i = 0; i < 6; i++) {
      const t = 0.95 - i * 0.13;
      const start = sh.clone().lerp(el, t);
      feather(start, 88 + i * 4, 0.78 - i * 0.02, 0.1, BELLY, INK, j1, s, {
        lift: -0.06 - i * 0.006,
        zig: true,
        dot: true,
        tipFrom: 0.82,
      });
    }

    // Coverts
    const covers: [THREE.Vector3, any, number][] = [];
    for (let i = 0; i < 4; i++) covers.push([sh.clone().lerp(el, 0.22 + i * 0.22), j1, i]);
    for (let i = 0; i < 3; i++) covers.push([el.clone().lerp(wr, 0.18 + i * 0.3), j2, 4 + i]);
    for (const [p, bone, i] of covers) {
      feather(p, 80 + (i % 3) * 5, 0.3, 0.075, BELLY, INK, bone, s, {
        lift: 0.085 + i * 0.003,
        outline: false,
        shaft: false,
        tipFrom: 0.72,
        thick: 0.02,
      });
    }

    // Pauldron: concentric discs stacked on the shoulder
    const axis = V(s * 0.45, 1, 0.15).normalize();
    const layers: [number, number, string][] = [
      [0.21, 0.05, COAT],
      [0.17, 0.03, CREAM],
      [0.125, 0.03, INK],
      [0.075, 0.035, CYAN],
    ];
    let cum = -0.02;
    for (const [r, h, c] of layers) {
      b.lathe(
        [
          [0, 0],
          [r, 0],
          [r * 0.94, h],
          [0, h * 1.15],
        ] as any[],
        {
          at: sh.clone().add(V(s * 0.03, 0.05, 0)).addScaledVector(axis, cum),
          axis: [axis.x, axis.y, axis.z],
          segments: 14,
          color: c,
          bone: j1,
        },
      );
      cum += h;
    }
  }
}
    return buildWings;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const COAT = P.coatMain, DEEP = P.coatDeep, CREAM = P.cream, INK = P.ink, BONE = P.bone;
  const CYAN = P.flowerCyan, GREEN = P.flowerGreen, RED = P.featherRed, BELLY = P.belly;
  const r = rng(11);

  type V = [number, number, number];
  const X = (s: number, p: V): V => [s * p[0], p[1], p[2]];
  const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
  const lerp3 = (a: V, c: V, t: number): V => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];

  const sph = (rad: number, w = 8, h = 6) => new THREE.SphereGeometry(rad, w, h);

  // band ring around a limb at point p, axis from a to c
  function band(p: V, a: V, c: V, rad: number, bone: any, color = INK, tube = 0.011) {
    b.part(new THREE.TorusGeometry(rad, tube, 5, 12), color, { bone, at: p, dir: sub(c, a), axis: "z" });
  }
  function chevron(p: V, a: V, c: V, rad: number, bone: any) {
    band(p, a, c, rad, bone, INK, 0.012);
    band(lerp3(p, c, 0.07), a, c, rad * 0.99, bone, CREAM, 0.008);
  }

  function tuft(at: V, bone: any, s: number) {
    const outline: [number, number, string?][] = [
      [0, 0], [0.032, 0.04], [0.026, 0.1], [0, 0.15, "sharp"], [-0.026, 0.1], [-0.032, 0.04],
    ];
    const tip: [number, number][] = [[-0.026, 0], [0.026, 0], [0, 0.05]];
    for (let k = -1; k <= 1; k++) {
      const y: V = [k * 0.35, -0.55, -1];
      const len = Math.hypot(...y);
      const yn: V = [y[0] / len, y[1] / len, y[2] / len];
      b.extrude(outline as any, { at, x: [1, 0, 0], y: yn, thickness: 0.01, color: CREAM, bone });
      const tipAt: V = [at[0] + yn[0] * 0.1, at[1] + yn[1] * 0.1, at[2] + yn[2] * 0.1];
      b.extrude(tip as any, { at: tipAt, x: [1, 0, 0], y: yn, thickness: 0.012, color: RED, bone });
    }
  }

  function paw(foot: V, s: number, bone: any) {
    const cx = foot[0], cz = foot[2] - 0.08;
    // main paw block
    b.part(sph(1, 10, 7), COAT, { bone, at: [cx, 0.07, cz], scale: [0.115, 0.07, 0.15] });
    b.part(sph(1, 8, 6), CREAM, { bone, at: [cx, 0.075, cz + 0.02], scale: [0.118, 0.065, 0.13] });
    // ink sole + cyan pads
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 10), INK, { bone, at: [cx, 0.006, cz + 0.01] });
    b.part(sph(0.05, 8, 5), CYAN, { bone, at: [cx, 0.012, cz + 0.03], scale: [1.2, 0.35, 1] });
    for (let i = 0; i < 4; i++) {
      const tx = cx + (i - 1.5) * 0.054;
      const tz = cz + 0.1;
      b.part(sph(0.04, 7, 5), CREAM, { bone, at: [tx, 0.042, tz], scale: [1, 0.95, 1.15] });
      b.part(sph(0.016, 6, 4), CYAN, { bone, at: [tx, 0.012, tz + 0.03], scale: [1, 0.4, 1] });
      b.part(new THREE.ConeGeometry(0.014, 0.075, 6), BONE, {
        bone, at: [tx, 0.034, tz + 0.075], dir: [0, -0.35, 1],
      });
      if (i < 3)
        b.part(new THREE.BoxGeometry(0.006, 0.05, 0.05), INK, { bone, at: [tx + 0.027, 0.045, tz + 0.025] });
    }
    // ink arc over the paw top
    band([cx, 0.1, cz + 0.02], [cx, 0, cz], [cx, 1, cz], 0.07, bone, INK, 0.006);
  }

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // ---------- FRONT ----------
    {
      const hip = X(s, [0.36, 0.9, 0.72]), knee = X(s, [0.36, 0.48, 0.8]);
      const ankle = X(s, [0.36, 0.24, 0.72]), foot = X(s, [0.36, 0.07, 0.86]);
      const jU = J["legFront" + S], jK = J["kneeFront" + S], jA = J["ankleFront" + S], jF = J["footFront" + S];
      // thigh
      b.part(sph(1, 10, 8), COAT, { bone: jU, at: lerp3(hip, knee, 0.2), scale: [0.19, 0.27, 0.2] });
      b.capsule(hip, knee, [0.15, 0.1], COAT, { bone: jU });
      b.part(sph(0.07, 7, 5), DEEP, { bone: jU, at: [hip[0] + s * 0.1, hip[1] - 0.1, hip[2] - 0.04] });
      // knee band + shin socks
      chevron(lerp3(knee, hip, 0.12), hip, knee, 0.105, jK);
      b.capsule(knee, ankle, [0.095, 0.07], CREAM, { bone: jK });
      b.capsule(ankle, lerp3(ankle, foot, 0.8), [0.07, 0.075], CREAM, { bone: jA });
      chevron(lerp3(ankle, knee, 0.15), knee, ankle, 0.075, jA);
      band(lerp3(knee, ankle, 0.5), knee, ankle, 0.08, jK, COAT, 0.016);
      // outer dot pair
      for (const dz of [-1, 1]) {
        const p: V = [hip[0] + s * 0.16, 0.78, hip[2] + dz * 0.07];
        b.part(sph(0.028, 6, 4), INK, { bone: jU, at: p });
        b.part(sph(0.014, 6, 4), CREAM, { bone: jU, at: [p[0] + s * 0.016, p[1], p[2]] });
      }
      tuft([ankle[0], ankle[1] + 0.02, ankle[2] - 0.07], jA, s);
      paw(foot, s, jF);
    }
    // ---------- BACK ----------
    {
      const hip = X(s, [0.42, 0.95, -0.55]), knee = X(s, [0.42, 0.52, -0.62]);
      const ankle = X(s, [0.42, 0.24, -0.68]), foot = X(s, [0.42, 0.07, -0.56]);
      const jU = J["legBack" + S], jK = J["kneeBack" + S], jA = J["ankleBack" + S], jF = J["footBack" + S];
      const hc: V = [hip[0], 0.82, -0.6];
      b.part(sph(0.24, 12, 9), COAT, { bone: jU, at: hc });
      b.part(sph(0.2, 10, 7), DEEP, { bone: jU, at: [hc[0] - s * 0.02, hc[1] - 0.12, hc[2] + 0.05] });
      b.capsule(lerp3(hip, knee, 0.2), knee, [0.16, 0.09], COAT, { bone: jU });
      // haunch rosette (lathed concentric discs facing outward)
      const rc: V = [hc[0] + s * 0.215, hc[1], hc[2]];
      const disc = (rad: number, off: number, col: string) =>
        b.part(new THREE.CylinderGeometry(rad, rad, 0.03, 14), col, {
          bone: jU, at: [rc[0] + s * off, rc[1], rc[2]], dir: [s, 0, 0],
        });
      disc(0.15, 0, BELLY);
      disc(0.12, 0.012, INK);
      disc(0.095, 0.022, CREAM);
      disc(0.06, 0.03, P.flowerMagenta);
      disc(0.032, 0.038, GREEN);
      // paired dots on haunch
      for (const [dy, dz] of [[0.2, -0.12], [0.2, 0.1], [-0.2, -0.1], [-0.2, 0.1]]) {
        const p: V = [hc[0] + s * 0.2, hc[1] + dy * 0.8, hc[2] + dz * 1.0];
        b.part(sph(0.026, 6, 4), INK, { bone: jU, at: p });
        b.part(sph(0.013, 6, 4), CREAM, { bone: jU, at: [p[0] + s * 0.015, p[1], p[2]] });
      }
      chevron(lerp3(knee, hip, 0.1), hip, knee, 0.1, jK);
      b.capsule(knee, ankle, [0.085, 0.07], CREAM, { bone: jK });
      b.capsule(ankle, lerp3(ankle, foot, 0.8), [0.07, 0.075], CREAM, { bone: jA });
      chevron(lerp3(ankle, knee, 0.15), knee, ankle, 0.075, jA);
      band(lerp3(knee, ankle, 0.5), knee, ankle, 0.08, jK, COAT, 0.016);
      tuft([ankle[0], ankle[1] + 0.02, ankle[2] - 0.07], jA, s);
      paw(foot, s, jF);
    }
  }
}
    return buildLegs;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- tail body ----
  const path = catmull([
    [0, 1.18, -0.78],
    [0, 1.12, -1.0],
    [0, 1.02, -1.25],
    [0, 1.0, -1.5],
    [0, 1.02, -1.78],
    [0, 1.12, -2.0],
    [0, 1.38, -2.2],
  ]);

  const bandDefs: [number, string][] = [
    [0.3, P.cream],
    [0.5, P.wingTeal],
    [0.65, P.cream],
    [0.8, P.wingTeal],
  ];
  const bands: [number, string][] = [];
  for (const [c, col] of bandDefs) {
    bands.push([c - 0.055, P.coatMain], [c - 0.04, P.ink], [c + 0.04, col], [c + 0.055, P.ink]);
  }
  bands.push([1, P.coatMain]);

  const tail = b.sweep(path, [0.14, 0.04], {
    bone: [J.tail1, J.tail2, J.tail3, J.tailTip],
    color: P.coatMain,
    bands,
    caps: { start: "round", end: "round" },
    sides: 10,
  });

  // magenta dots on band faces
  for (const [c] of bandDefs) {
    const pt = tail.at(c, 0);
    b.stick(new THREE.SphereGeometry(0.03, 8, 6), P.ink, pt, { embed: 0.3, scale: [1.25, 0.5, 1.25] });
    b.stick(new THREE.SphereGeometry(0.024, 8, 6), P.flowerMagenta, pt.moved([0, 0.008, 0]), { embed: 0.3, scale: [1, 0.5, 1] });
  }

  // dorsal spikes
  const tri = (w: number, h: number): [number, number][] => [[-w, 0], [w, 0], [0, h]];
  for (const t of [0.1, 0.2, 0.4, 0.575, 0.725, 0.9]) {
    const pt = tail.at(t, 0);
    const base = pt.moved([0, -0.02, 0]);
    const s = 1 - t * 0.5;
    const common = { x: [0, 0, -1] as [number, number, number], y: [0, 1, 0] as [number, number, number] };
    b.extrude(tri(0.07 * s, 0.16 * s), { at: base, ...common, thickness: 0.016, color: P.ink });
    b.extrude(tri(0.055 * s, 0.135 * s).map(([x, y]) => [x, y + 0.012] as [number, number]), {
      at: base, ...common, thickness: 0.024, color: P.featherRed,
    });
    b.extrude([[-0.025 * s, 0.09 * s], [0.025 * s, 0.09 * s], [0, 0.145 * s]], {
      at: base, ...common, thickness: 0.028, color: P.cream,
    });
  }

  // ---- plume ----
  const origin = J.tailTip.at.clone();
  const cols = [P.wingTeal, P.wingBlue, P.featherRed];
  for (let k = -3; k <= 3; k++) {
    const ak = Math.abs(k);
    const d = V(k * 0.24, 0.6 - 0.05 * ak, -0.75).normalize();
    const L = 0.78 - 0.06 * ak + (k % 2 ? 0 : 0.04);
    const wid = V(1, 0, 0).addScaledVector(d, -d.x).normalize(); // width direction ⟂ d
    const nrm = new THREE.Vector3().crossVectors(d, wid).normalize();
    // keep normal pointing up
    const up = nrm.y >= 0 ? 1 : -1;
    const col = cols[(k + 3) % 3];
    const base = origin.clone().addScaledVector(d, 0.02).addScaledVector(nrm, up * ak * 0.004);
    const opts = (th: number, color: string) => ({
      at: base, x: d.toArray() as [number, number, number], y: wid.toArray() as [number, number, number],
      thickness: th, color, bone: J.tailTip,
    });
    const leaf = (l: number, w: number): [number, number, "sharp"?][] => [
      [0, 0], [0.1 * l, 0.05 * w], [0.4 * l, 0.085 * w], [0.75 * l, 0.07 * w], [l, 0, "sharp"],
      [0.75 * l, -0.07 * w], [0.4 * l, -0.085 * w], [0.1 * l, -0.05 * w],
    ] as any;
    b.extrude(leaf(L * 1.03, 1.18) as any, opts(0.01, P.ink));
    b.extrude(leaf(L, 1) as any, opts(0.016, col));
    b.extrude([
      [0.7 * L, 0.0725], [0.75 * L, 0.07], [L, 0, "sharp"], [0.75 * L, -0.07], [0.7 * L, -0.0725],
    ] as any, opts(0.02, P.wingDeep));
    // shaft
    const p0 = base.clone().addScaledVector(nrm, up * 0.011);
    const p1 = p0.clone().addScaledVector(d, L * 0.95);
    b.rod(p0, p1, 0.006, P.ink, { bone: J.tailTip });
    // cream dots on the vane
    for (let i = 0; i < 3; i++) {
      const u = L * (0.22 + i * 0.17);
      const side = i % 2 ? 1 : -1;
      const pos = base.clone().addScaledVector(d, u).addScaledVector(wid, side * 0.03).addScaledVector(nrm, up * 0.013);
      b.part(new THREE.SphereGeometry(0.014, 6, 4), P.cream, {
        at: pos, bone: J.tailTip, scale: [1, 1, 0.5],
      });
    }
  }
}
    return buildTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.05,0], dir: [0,0,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["body"], at: [0,1.28,0.85], dir: [0,0.3,1], role: "spine", group: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.56,1.28], dir: [0,0.18,1], role: "head", group: "head" });
  J["jawLower"] = b.joint("jawLower", { parent: J["head"], at: [0,1.48,1.52], dir: [0,-0.4,1], role: "jaw", group: "head" });
  J["wingL1"] = b.joint("wingL1", { parent: J["body"], at: [0.34,1.5,0.55], dir: [0.75,0.55,-0.15], role: "wing", group: "wings" });
  J["wingL2"] = b.joint("wingL2", { parent: J["wingL1"], at: [1.05,2,0.4], dir: [0.85,0.18,-0.4], role: "wing", group: "wings" });
  J["wingLtip"] = b.joint("wingLtip", { parent: J["wingL2"], at: [1.85,2.15,0], dir: [0.8,-0.05,-0.6], role: "wing", group: "wings" });
  J["wingR1"] = b.joint("wingR1", { parent: J["body"], at: [-0.34,1.5,0.55], dir: [-0.75,0.55,-0.15], role: "wing", group: "wings" });
  J["wingR2"] = b.joint("wingR2", { parent: J["wingR1"], at: [-1.05,2,0.4], dir: [-0.85,0.18,-0.4], role: "wing", group: "wings" });
  J["wingRtip"] = b.joint("wingRtip", { parent: J["wingR2"], at: [-1.85,2.15,0], dir: [-0.8,-0.05,-0.6], role: "wing", group: "wings" });
  J["legFrontL"] = b.joint("legFrontL", { parent: J["body"], at: [0.36,0.9,0.72], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeFrontL"] = b.joint("kneeFrontL", { parent: J["legFrontL"], at: [0.36,0.48,0.8], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["ankleFrontL"] = b.joint("ankleFrontL", { parent: J["kneeFrontL"], at: [0.36,0.24,0.72], dir: [0,-0.55,0.8], role: "leg", group: "legs" });
  J["footFrontL"] = b.joint("footFrontL", { parent: J["ankleFrontL"], at: [0.36,0.07,0.86], dir: [0,-0.3,0.95], role: "leg", group: "legs" });
  J["legFrontR"] = b.joint("legFrontR", { parent: J["body"], at: [-0.36,0.9,0.72], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeFrontR"] = b.joint("kneeFrontR", { parent: J["legFrontR"], at: [-0.36,0.48,0.8], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["ankleFrontR"] = b.joint("ankleFrontR", { parent: J["kneeFrontR"], at: [-0.36,0.24,0.72], dir: [0,-0.55,0.8], role: "leg", group: "legs" });
  J["footFrontR"] = b.joint("footFrontR", { parent: J["ankleFrontR"], at: [-0.36,0.07,0.86], dir: [0,-0.3,0.95], role: "leg", group: "legs" });
  J["legBackL"] = b.joint("legBackL", { parent: J["body"], at: [0.42,0.95,-0.55], dir: [0,-1,-0.08], role: "leg", group: "legs" });
  J["kneeBackL"] = b.joint("kneeBackL", { parent: J["legBackL"], at: [0.42,0.52,-0.62], dir: [0,-1,0.05], role: "leg", group: "legs" });
  J["ankleBackL"] = b.joint("ankleBackL", { parent: J["kneeBackL"], at: [0.42,0.24,-0.68], dir: [0,-0.55,0.75], role: "leg", group: "legs" });
  J["footBackL"] = b.joint("footBackL", { parent: J["ankleBackL"], at: [0.42,0.07,-0.56], dir: [0,-0.3,0.95], role: "leg", group: "legs" });
  J["legBackR"] = b.joint("legBackR", { parent: J["body"], at: [-0.42,0.95,-0.55], dir: [0,-1,-0.08], role: "leg", group: "legs" });
  J["kneeBackR"] = b.joint("kneeBackR", { parent: J["legBackR"], at: [-0.42,0.52,-0.62], dir: [0,-1,0.05], role: "leg", group: "legs" });
  J["ankleBackR"] = b.joint("ankleBackR", { parent: J["kneeBackR"], at: [-0.42,0.24,-0.68], dir: [0,-0.55,0.75], role: "leg", group: "legs" });
  J["footBackR"] = b.joint("footBackR", { parent: J["ankleBackR"], at: [-0.42,0.07,-0.56], dir: [0,-0.3,0.95], role: "leg", group: "legs" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,1.18,-0.88], dir: [0,-0.08,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1,-1.45], dir: [0,0.08,-1], role: "tail", group: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.05,-1.95], dir: [0,0.45,-0.85], role: "tail", group: "tail" });
  J["tailTip"] = b.joint("tailTip", { parent: J["tail3"], at: [0,1.38,-2.18], dir: [0,0.5,-0.7], role: "tail", group: "tail" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
