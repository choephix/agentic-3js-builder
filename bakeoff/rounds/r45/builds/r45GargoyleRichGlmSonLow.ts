import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, limb, bezier, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Cathedral Gargoyle of the Rain-Ledge",
  "description": "A gothic stone-carved gargoyle crouched on a mossy cathedral ledge, snarling over the edge with glowing amber eyes, folded wings rising behind it like a spire."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  stoneLight: "#9a968c",
  stone: "#7d7a72",
  stoneDark: "#5a5854",
  stoneDeep: "#46443f",
  rainStain: "#66635b",
  moss: "#5e7a3c",
  mossDark: "#3f5626",
  lichen: "#b8a878",
  hornStone: "#4a463e",
  hornTip: "#35322c",
  claw: "#3c3a34",
  teeth: "#c9c2ae",
  gum: "#5a2c34",
  tongue: "#7a3a48",
  eyeGlow: "#ffb23e",
  eyeEmber: "#ff7a1e",
  copperVerdigris: "#7a9a8a",
  copperDark: "#4e6a5e",
  mortar: "#3e3c38",
  membraneWarm: "#6e6455",
};
const M = {
  ledgeTop: [0, 0.35, -0.05] as [number, number, number],
  ledgeLip: [0, 0.36, 1.26] as [number, number, number],
  neckSocket: [0, 1.48, 0.24] as [number, number, number],
  shoulderL: [0.34, 1.22, 0.1] as [number, number, number],
  shoulderR: [-0.34, 1.22, 0.1] as [number, number, number],
  hipSocketL: [0.3, 0.85, -0.3] as [number, number, number],
  hipSocketR: [-0.3, 0.85, -0.3] as [number, number, number],
  wingRootL: [0.3, 1.34, -0.22] as [number, number, number],
  wingRootR: [-0.3, 1.34, -0.22] as [number, number, number],
  tailRoot: [0, 0.72, -0.6] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // ledge
  (() => {
function buildLedge({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], bone: undefined as any });
  // main slab body
  box(2.8, 0.2, 2.6, P.stone, 0, 0.1, -0.1);
  // upper course, top at 0.35
  box(2.8, 0.1, 2.5, P.stoneLight, 0, 0.25, -0.05);
  // stepped-in lower base
  box(2.6, 0.04, 2.3, P.stoneDark, 0, 0.02, -0.1);
  // moulded drip edge (roll) at front
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 2.8, 8), P.stoneLight, { at: [0, 0.3, 1.31], dir: [1, 0, 0] });
  box(2.8, 0.04, 0.1, P.stoneDark, 0, 0.2, 1.35);
  // front lip cap
  box(2.8, 0.03, 0.12, P.stoneLight, 0, 0.335, 1.29);
  // gutter channel
  box(2.4, 0.02, 0.1, P.copperDark, 0, 0.355, 1.12);
  box(2.4, 0.04, 0.02, P.copperVerdigris, 0, 0.36, 1.18);
  box(2.4, 0.04, 0.02, P.copperVerdigris, 0, 0.36, 1.06);
  // corbels at both ends
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 3), P.stoneDark, {
      at: [s * 1.2, 0.17, -1.3],
      dir: [1, 0, 0],
      rotation: [0, 0, 0],
    });
    box(0.3, 0.12, 0.5, P.stoneDeep, s * 1.2, 0.06, -1.1);
  }
  // masonry joints on front face and top
  for (let i = -3; i <= 3; i++) {
    box(0.02, 0.18, 0.012, P.mortar, i * 0.38, 0.16, 1.405);
    box(0.012, 0.005, 2.3, P.mortar, i * 0.38 + 0.19, 0.352, -0.05);
  }
  box(2.8, 0.012, 0.012, P.mortar, 0, 0.2, 1.405);
  // rain streaks
  for (let i = 0; i < 12; i++) {
    const x = (R() - 0.5) * 2.5;
    const h = 0.08 + R() * 0.12;
    box(0.025 + R() * 0.03, h, 0.01, P.rainStain, x, 0.3 - h / 2, 1.408);
  }
  // waterspout face
  const sp = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 8, 1, false, 0, Math.PI);
  b.part(sp, P.copperVerdigris, { at: [0, 0.18, 1.45], dir: [0, 0, 1], rotation: [90, 0, 0] });
  box(0.14, 0.08, 0.05, P.copperDark, 0, 0.1, 1.5);
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.035, 0.012, 5, 8), P.copperDark, { at: [s * 0.08, 0.22, 1.52], dir: [0, 0, 1], axis: "z" });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.copperDark, { at: [s * 0.08, 0.22, 1.52] });
  }
  box(0.2, 0.025, 0.04, P.copperDark, 0, 0.26, 1.5);
  // moss patches and tufts
  for (let i = 0; i < 9; i++) {
    const x = (R() - 0.5) * 2.5;
    const z = (R() - 0.5) * 2.2;
    b.part(new THREE.CylinderGeometry(0.1 + R() * 0.1, 0.1, 0.02, 6), i % 2 ? P.moss : P.mossDark, {
      at: [x, 0.352, z],
    });
  }
  for (let i = 0; i < 3; i++)
    for (let k = 0; k < 3; k++)
      b.part(new THREE.ConeGeometry(0.02, 0.07, 4), P.mossDark, {
        at: [-0.76 + i * 0.76 + k * 0.03, 0.375, -0.5 + k * 0.02],
      });
  // lichen discs at corners
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 8), P.lichen, { at: [sx * 1.25, 0.353, sz * 1.0] });
  // pockmarks
  for (let i = 0; i < 16; i++)
    b.part(new THREE.SphereGeometry(0.014 + R() * 0.01, 5, 3), P.stoneDeep, {
      at: [(R() - 0.5) * 2.6, 0.35, (R() - 0.5) * 2.2],
      scale: [1, 0.3, 1],
    });
  // gutter lichen tufts
  for (const s of [1, -1]) b.part(new THREE.ConeGeometry(0.025, 0.05, 4), P.lichen, { at: [s * 1.2, 0.38, 1.12] });
}
    return buildLedge;
  })(),
  // torso
  (() => {
function buildTorso({ b, J, P, M }: any) {
  const R = rng(11);
  const hips = J.hips, chest = J.chest, tailJ = J.tail;

  // body loft over spine
  const stations = [
    { at: [0, 1.0, -0.62], w: 0.5, h: 0.5 },
    { at: [0, 0.98, -0.35], w: 0.78, h: 0.7 },
    { at: [0, 0.98, -0.05], w: 0.8, h: 0.68 },
    { at: [0, 1.0, 0.2], w: 0.86, h: 0.7 },
    { at: [0, 1.12, 0.3], w: 0.62, h: 0.5 },
  ];
  const body = b.loft(stations, { bone: [hips, chest], color: P.stone });
  // belly underside
  b.loft(
    [
      { at: [0, 0.62, -0.3], w: 0.5, h: 0.2 },
      { at: [0, 0.6, 0.0], w: 0.6, h: 0.22 },
      { at: [0, 0.6, 0.22], w: 0.6, h: 0.2 },
    ],
    { bone: [hips, chest], color: P.stoneDark },
  );
  // upper back highlight
  b.loft(
    [
      { at: [0, 1.28, -0.5], w: 0.4, h: 0.12 },
      { at: [0, 1.32, -0.1], w: 0.5, h: 0.12 },
      { at: [0, 1.4, 0.2], w: 0.46, h: 0.1 },
    ],
    { bone: [hips, chest], color: P.stoneLight },
  );
  // rump peak
  b.part(new THREE.IcosahedronGeometry(0.3, 0), P.stoneLight, { bone: hips, at: [0, 1.0, -0.6], scale: [1.2, 0.9, 1] , flat: true });

  // spine vertebra studs
  const spine = catmull([[0, 1.3, -0.62], [0, 1.34, -0.35], [0, 1.4, -0.05], [0, 1.5, 0.22]]);
  b.along(spine, 9, (at: any) => {
    b.stick(new THREE.ConeGeometry(0.04, 0.1, 4), P.stoneDeep, at, { bone: at.t < 0.4 ? hips : chest });
  });
  // moss tufts
  for (let i = 0; i < 6; i++) {
    const p = spine.at(0.08 + i * 0.16);
    b.part(new THREE.IcosahedronGeometry(0.035 + R() * 0.02, 0), i % 2 ? P.moss : P.mossDark, {
      bone: i < 3 ? hips : chest, at: [p.x + (R() - 0.5) * 0.12, p.y - 0.01, p.z], flat: true,
    });
  }

  // abdominal blocks
  for (let r = 0; r < 2; r++)
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.12, 0.05, 0.1), P.stoneDeep, {
        bone: hips, at: [s * 0.08, 0.5 + 0.0, -0.1 + r * 0.2],
      });

  // sternum plate
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.3), P.stoneDark, { bone: chest, at: [0, 0.9, 0.42], rotation: [-35, 0, 0] });
  b.part(new THREE.BoxGeometry(0.02, 0.05, 0.3), P.stoneDeep, { bone: chest, at: [0, 0.93, 0.43], rotation: [-35, 0, 0] });

  // shoulder plates + flutes, ribs, rain streaks
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.18, 0.34), P.stoneLight, {
      bone: chest, at: [s * 0.4, 1.28, 0.08], rotation: [0, 0, -s * 25],
    });
    for (let f = 0; f < 3; f++)
      b.part(new THREE.BoxGeometry(0.2, 0.02, 0.02), P.stoneDeep, {
        bone: chest, at: [s * 0.42, 1.37 - f * 0.02 + 0.0, -0.04 + f * 0.1], rotation: [0, 0, -s * 25],
      });
    b.part(new THREE.IcosahedronGeometry(0.05, 0), P.mossDark, { bone: chest, at: [s * 0.3, 1.38, -0.12], flat: true });
    for (let i = 0; i < 3; i++) {
      b.rod([s * 0.4, 1.12 - i * 0.02, -0.2 + i * 0.17], [s * 0.38, 0.8 - i * 0.02, -0.18 + i * 0.17], 0.012, P.stoneDark, { bone: chest });
      b.rod([s * 0.37, 1.2, -0.3 + i * 0.2], [s * 0.37, 0.75, -0.3 + i * 0.2], 0.01, P.rainStain, { bone: hips });
    }
  }

  // tail
  const tp = catmull([
    [0, 0.8, -0.7], [0.1, 0.62, -1.1], [0.5, 0.5, -1.35], [0.95, 0.42, -1.2], [0.85, 0.37, -0.95], [0.7, 0.36, -0.9],
  ]);
  const tail = b.chain("torsoTail", tp, { parent: tailJ, count: 4, role: "tail" });
  b.sweep(tail, (t: number) => 0.17 * (1 - t) + 0.035, { color: P.stone });
  b.along(tail, 12, (at: any) => {
    b.part(new THREE.TorusGeometry(0.16 * (1 - at.t) + 0.04, 0.008, 4, 8), P.stoneDeep, {
      at: at.at, dir: at.axis, bone: at.bone,
    });
  });
  const end = tp.at(1);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.spike([end.x, end.y + 0.02, end.z], [Math.cos(a) * 0.6, 0.4, Math.sin(a) * 0.6 - 0.2], 0.16, 0.03, {
      color: P.stoneDeep, bone: tail.joints[3],
    });
  }
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head, jaw = J.jaw;
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
  const sph = (r: number, w = 6, h = 5) => new THREE.SphereGeometry(r, w, h);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });
  const H = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) => put(g, c, at, head, o);
  const Jw = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) => put(g, c, at, jaw, o);

  // skull: cranium, muzzle
  H(sph(0.27, 8, 6), P.stone, [0, 1.68, 0.35], { scale: [1.35, 1, 1.25] });
  H(box(0.4, 0.2, 0.34), P.stoneLight, [0, 1.62, 0.7], { rotation: [8, 0, 0] });
  H(box(0.3, 0.1, 0.2), P.stone, [0, 1.74, 0.62]);
  // brow ridge
  H(box(0.62, 0.1, 0.24), P.stoneLight, [0, 1.8, 0.58]);
  for (const s of [1, -1]) {
    H(box(0.3, 0.09, 0.2), P.stoneLight, [s * 0.18, 1.83, 0.6], { rotation: [0, 0, s * -14] });
    H(box(0.16, 0.04, 0.06), P.stoneDeep, [s * 0.13, 1.88, 0.69], { rotation: [0, 0, s * -25] });
    H(box(0.16, 0.04, 0.06), P.stoneDeep, [s * 0.27, 1.87, 0.67], { rotation: [0, 0, s * 25] });
    // sockets and eyes
    H(sph(0.07, 6, 4), P.stoneDeep, [s * 0.15, 1.72, 0.63], { scale: [1.1, 1, 0.7] });
    const eye = H(sph(0.052, 6, 5), P.eyeGlow, [s * 0.15, 1.72, 0.665]);
    glow(eye, 1.4);
    const pup = H(box(0.014, 0.07, 0.01), P.eyeEmber, [s * 0.15, 1.72, 0.713]);
    glow(pup, 1.4);
    // cheeks flutes
    for (let i = 0; i < 3; i++)
      H(box(0.015, 0.012, 0.16), P.stoneDark, [s * 0.285, 1.6 + i * 0.03, 0.5], { rotation: [0, 0, s * 8], });
    H(sph(0.09, 6, 4), P.stone, [s * 0.24, 1.55, 0.55], { scale: [0.8, 1, 1.1] });
    // nostrils
    H(sph(0.022, 5, 4), P.stoneDeep, [s * 0.06, 1.66, 0.88]);
    // ears
    H(cone(0.07, 0.2, 4), P.stoneDark, [s * 0.34, 1.75, 0.15], { rotation: [0, 0, s * -70] });
    // horns
    const pts: number[][] = [];
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      pts.push([s * (0.2 + 0.18 * Math.sin(t * 1.6)), 1.9 + 0.2 * t + 0.07 * t * t, 0.28 - 0.45 * t]);
    }
    const hp = b.catmull ? null : null;
    void hp;
  }
  // horns via rods for reliable shape
  for (const s of [1, -1]) {
    const hp = [
      [s * 0.2, 1.9, 0.3], [s * 0.3, 1.97, 0.18], [s * 0.37, 2.03, 0.02], [s * 0.38, 2.1, -0.12],
    ];
    for (let i = 0; i < 3; i++) {
      const a = hp[i], c = hp[i + 1];
      b.rod(a, c, [0.065 - i * 0.015, 0.05 - i * 0.015], i == 2 ? P.hornTip : P.hornStone, { bone: head, sides: 6 });
      const m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
      H(new THREE.TorusGeometry(0.058 - i * 0.015, 0.01, 4, 6), P.stoneDark, m, { rotation: [90, 0, 0] });
    }
    H(cone(0.03, 0.09, 5), P.hornTip, [s * 0.385, 2.14, -0.15], { rotation: [-30, 0, 0] });
    // upper fangs
    for (let i = 0; i < 4; i++) {
      const l = i == 0 ? 0.11 : 0.06;
      H(cone(i == 0 ? 0.025 : 0.017, l, 5), P.teeth, [s * (0.07 + i * 0.065), 1.5 - l / 2 + 0.02, 0.8 - i * 0.08], { rotation: [180, 0, 0] });
    }
    // lower fangs
    for (let i = 0; i < 4; i++) {
      const l = i == 0 ? 0.1 : 0.055;
      Jw(cone(i == 0 ? 0.022 : 0.016, l, 5), P.teeth, [s * (0.07 + i * 0.06), 1.44 + l / 2, 0.8 - i * 0.09]);
    }
    Jw(box(0.07, 0.09, 0.4), P.stoneDark, [s * 0.15, 1.42, 0.65], { rotation: [0, s * 8, 0] });
    Jw(sph(0.06, 5, 4), P.stone, [s * 0.2, 1.4, 0.55]);
  }
  H(cone(0.04, 0.15, 5), P.hornStone, [0, 1.93, 0.55], { rotation: [-25, 0, 0] });
  // crown chisel marks
  for (let i = 0; i < 6; i++)
    H(box(0.1, 0.01, 0.015), P.stoneDeep, [(R() - 0.5) * 0.3, 1.92, 0.2 + R() * 0.25], { rotation: [0, R() * 90, 0] });
  // upper lip/gum
  H(box(0.34, 0.04, 0.3), P.gum, [0, 1.52, 0.72]);
  H(box(0.12, 0.05, 0.1), P.stoneDark, [0, 1.62, 0.9]);
  // lower jaw
  Jw(box(0.3, 0.09, 0.4), P.stoneDark, [0, 1.41, 0.65]);
  Jw(box(0.22, 0.03, 0.3), P.gum, [0, 1.46, 0.66]);
  Jw(box(0.12, 0.03, 0.26), P.tongue, [0, 1.475, 0.7], { rotation: [-4, 0, 0] });
  Jw(box(0.12, 0.1, 0.1), P.stone, [0, 1.38, 0.86]);
  Jw(cone(0.04, 0.12, 5), P.stoneDark, [0, 1.3, 0.84], { rotation: [180, 0, 0] });
  // collar of scales
  for (let r = 0; r < 2; r++)
    for (let i = 0; i < 9; i++) {
      const a = (i / 8 - 0.5) * Math.PI * 1.5;
      H(box(0.14, 0.12, 0.05), r ? P.stone : P.stoneLight, [Math.sin(a) * 0.3, 1.46 + r * 0.1 + Math.cos(a) * 0.04, 0.12 - r * 0.05 - (1 - Math.cos(a)) * 0.05], { rotation: [-20, a * 57, 0] });
    }
  void frame; void M;
}
    return buildHead;
  })(),
  // limbs
  (() => {
function buildLimbs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Stone studs and bands seated on a limb.
  const stud = (at: THREE.Vector3, r: number, color: string, bone: any) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), color, { at, bone, flat: true });

  const claw = (base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, bone: any) => {
    const tip = base.clone().addScaledVector(dir, len);
    tip.y -= len * 0.35;
    b.sweep([base, base.clone().lerp(tip, 0.5).add(V(0, 0.005, 0)), tip], [r, 0.002], {
      color: P.claw, bone, caps: "point", sides: 6,
    });
    b.part(new THREE.CylinderGeometry(r * 1.35, r * 1.35, 0.012, 6), P.stoneLight,
      { at: base, bone, dir: dir.toArray() as any });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // ---- LEGS ----
    const hip = V(s * 0.3, 0.85, -0.3);
    const legs: [number, number, string][] = [
      [s * 0.42, -0.1, "front"],
      [s * 0.5, -1.1, "back"],
    ];
    // single leg chain on the joint; the front foot is the IK target
    const foot = V(legs[0][0], 0.06, legs[0][1]);
    const pts = limb(hip, foot, [0.42, 0.4, 0.22], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`limbsLeg${side}`, pts, {
      parent: J["leg" + side],
      names: [`limbsHip${side}`, `limbsKnee${side}`, `limbsHock${side}`, `limbsAnkle${side}`],
      role: "leg",
    });
    b.sweep(leg, (t: number) => 0.13 - 0.07 * t + 0.05 * Math.sin(Math.PI * Math.min(1, t * 1.6)), {
      color: P.stone, sides: 6,
      sectors: [[120, 240, P.stoneDark], [-40, 40, P.stoneLight]],
    });
    const knee = pts[1];
    stud(knee.clone().add(V(0, 0, 0.1)), 0.06, P.stoneLight, leg.joints[1]);
    stud(knee.clone().add(V(s * 0.08, 0.02, 0.06)), 0.035, P.stoneLight, leg.joints[1]);
    b.spike(pts[2], V(0, 0.35, -1).normalize().toArray() as any, 0.12, 0.03, { color: P.hornStone, bone: leg.joints[2] });
    // front foot toes
    const ankle = pts[3];
    for (const dx of [-0.07, 0, 0.07]) {
      const a = ankle.clone().add(V(dx, -0.02, 0));
      const b2 = a.clone().add(V(dx * 0.6, 0, 0.14));
      b.capsule(a, b2, 0.032, P.stone, { bone: leg.tip ?? leg.joints[2] });
      claw(b2, V(dx * 0.5, 0, 1).normalize(), 0.1, 0.02, leg.tip ?? leg.joints[2]);
    }
    claw(ankle.clone().add(V(0, -0.02, -0.04)), V(0, 0, -1), 0.07, 0.018, leg.tip ?? leg.joints[2]);
    b.part(new THREE.BoxGeometry(0.22, 0.04, 0.3), P.stoneDark, {
      at: ankle.clone().add(V(0, -0.02, 0.05)), bone: leg.tip ?? leg.joints[2],
    });

    // rear perched foot: a haunch strut from the hip to the back edge
    const bFoot = V(legs[1][0], 0.06, legs[1][1]);
    const bk = V(s * 0.46, 0.55, -0.75);
    b.sweep([hip.clone().add(V(s * 0.04, -0.05, -0.05)), bk, bFoot.clone().add(V(0, 0.1, 0.05))], [0.1, 0.05], {
      color: P.stoneDark, sides: 6, bone: J["leg" + side],
    });
    stud(bk, 0.055, P.stoneLight, J["leg" + side]);
    for (const dx of [-0.07, 0, 0.07]) {
      const a = bFoot.clone().add(V(dx, 0.02, 0));
      const e = a.clone().add(V(dx * 0.5, -0.01, 0.15));
      b.capsule(a, e, 0.03, P.stone, { bone: J["leg" + side] });
      claw(e, V(0, -0.1, 1).normalize(), 0.09, 0.018, J["leg" + side]);
    }
    claw(bFoot.clone().add(V(0, 0.02, -0.05)), V(0, 0, -1), 0.06, 0.016, J["leg" + side]);

    // ---- ARMS ----
    const sh = V(s * 0.34, 1.22, 0.1);
    const fist = V(s * 0.42, 0.5, 1.2);
    const ap = limb(sh, fist, [0.62, 0.62], [[s * 0.8, 0, -0.6]]);
    const arm = b.chain(`limbsArm${side}`, ap, {
      parent: J["arm" + side],
      names: [`limbsShoulder${side}`, `limbsElbow${side}`, `limbsWrist${side}`],
      role: "arm",
    });
    b.sweep(arm, (t: number) => 0.14 - 0.05 * t + 0.03 * Math.sin(Math.PI * t), {
      color: P.stone, sides: 6,
      sectors: [[120, 240, P.stoneDark], [-40, 40, P.stoneLight]],
    });
    const el = ap[1];
    stud(el.clone().add(V(s * 0.08, 0, -0.08)), 0.065, P.stoneLight, arm.joints[1]);
    b.spike(el, V(s * 0.5, 0.3, -1).normalize().toArray() as any, 0.13, 0.035, { color: P.hornStone, bone: arm.joints[1] });
    b.part(new THREE.IcosahedronGeometry(0.06, 0), P.moss, { at: el.clone().add(V(0, 0.08, 0.05)), bone: arm.joints[1], flat: true });
    // bracer bands
    for (const t of [0.6, 0.8]) {
      const c = arm.at(t);
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.025, 8), P.stoneDeep, {
        at: c.at, bone: c.bone, dir: c.tangent.toArray() as any,
      });
    }
    // rain streak
    b.rod(ap[1].clone().add(V(0, 0.05, 0.09)), fist.clone().add(V(0, 0.07, 0.04)), 0.012, P.rainStain, { bone: arm.joints[1] });
    // fist
    const wr = arm.joints[2];
    b.part(new THREE.BoxGeometry(0.2, 0.12, 0.18), P.stone, { at: fist.clone().add(V(0, 0.04, 0)), bone: wr });
    for (const dx of [-0.07, 0, 0.07]) {
      const k = fist.clone().add(V(dx, 0.04, 0.1));
      const f2 = k.clone().add(V(0, -0.02, 0.1));
      b.capsule(k, f2, 0.032, P.stone, { bone: wr });
      stud(k.clone().add(V(0, 0.03, 0)), 0.02, P.stoneLight, wr);
      claw(f2, V(0, -0.5, 1).normalize(), 0.11, 0.02, wr);
    }
    const th = fist.clone().add(V(-s * 0.1, 0.02, 0.0));
    b.capsule(th, th.clone().add(V(-s * 0.06, 0, 0.1)), 0.03, P.stone, { bone: wr });
    claw(th.clone().add(V(-s * 0.06, 0, 0.1)), V(-s * 0.3, -0.3, 1).normalize(), 0.08, 0.018, wr);
  }
}
    return buildLimbs;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const R = rng(11);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = J["wing" + side];
    const root0 = M["wingRoot" + side];
    // key points of the arm: shoulder, elbow, wrist
    const sh: [number, number, number] = [s * 0.3, 1.34, -0.22];
    const el: [number, number, number] = [s * 0.62, 1.78, -0.42];
    const wr: [number, number, number] = [s * 0.95, 2.32, -0.6];
    const arm = b.chain("wing" + side + "Arm", catmull([sh, el, wr]), {
      parent: root,
      names: [`wings${side}1`, `wings${side}2`, `wings${side}3`],
      role: "wing",
    });
    b.sweep(arm, [0.085, 0.05], { color: P.stone, caps: "round" });
    // joint knobs
    for (const p of [el, wr]) {
      b.part(new THREE.SphereGeometry(0.075, 6, 5), P.stoneDark, { at: p, bone: root, flat: true });
    }
    // scapula shield
    b.part(new THREE.SphereGeometry(0.2, 7, 5), P.stoneLight, {
      at: [s * 0.3, 1.38, -0.2], scale: [0.9, 0.7, 1.2], bone: root, flat: true,
    });
    b.part(new THREE.SphereGeometry(0.12, 6, 4), P.stoneDark, {
      at: [s * 0.36, 1.46, -0.12], scale: [0.8, 0.6, 1], bone: root, flat: true,
    });
    // finger tips
    const tips: [number, number, number][] = [
      [s * 0.98, 2.45, -0.7],
      [s * 1.2, 2.05, -0.8],
      [s * 1.15, 1.7, -0.9],
      [s * 0.85, 1.35, -0.95],
    ];
    const fingers = tips.map((t, i) => {
      const mid: [number, number, number] = [
        (wr[0] + t[0]) / 2 + s * 0.04,
        (wr[1] + t[1]) / 2 + 0.06,
        (wr[2] + t[2]) / 2 - 0.02,
      ];
      const path = catmull([wr, mid, t]);
      b.sweep(path, [0.04, 0.012], { color: P.stoneDark, bone: root, caps: "round" });
      b.sweep(path, [0.018, 0.006], { color: P.stoneLight, bone: root, shift: [0, 0.03] });
      // claw
      b.spike(t, [s * 0.0, -0.5, -0.3], 0.1, 0.022, { color: P.claw, bone: root });
      return { path, t };
    });
    // leading-edge studs
    for (let i = 0; i < 6; i++) {
      const t = (i + 0.5) / 6;
      const a = arm.at(t);
      b.part(new THREE.SphereGeometry(0.028, 5, 4), P.stoneLight, { at: a.at, bone: root, flat: true });
    }
    // membranes between fingers
    const edges = [wr, ...[]];
    const chains = fingers.map((f) => f.path);
    b.membrane(polyline([sh, el, wr]), chains[0], { color: P.membraneWarm, thickness: 0.012, bone: root });
    for (let i = 0; i < 3; i++) {
      b.membrane(chains[i], chains[i + 1], {
        color: i === 2 ? P.stoneDark : P.membraneWarm,
        thickness: 0.012,
        scallop: 0.15,
        bone: root,
      });
    }
    b.membrane(polyline([sh, [s * 0.35, 1.3, -0.5], tips[3]]), chains[3], {
      color: P.stoneDark, thickness: 0.012, bone: root,
    });
    // rain streaks
    for (let i = 0; i < 4; i++) {
      const f = fingers[i].path;
      b.sweep(f.slice(0.2, 0.9), 0.006, { color: P.rainStain, bone: root, shift: [0.0, -0.02] });
    }
    // rosettes
    for (const [p, r] of [[[s * 0.55, 1.72, -0.5], 0.09], [[s * 0.78, 1.95, -0.52], 0.07]] as const) {
      b.part(new THREE.CylinderGeometry(r, r, 0.03, 8), P.lichen, {
        at: p as any, dir: [s * 0.2, 0.3, 1], bone: root, flat: true,
      });
      b.part(new THREE.CylinderGeometry(r * 0.4, r * 0.4, 0.045, 6), P.stoneDark, {
        at: p as any, dir: [s * 0.2, 0.3, 1], bone: root, flat: true,
      });
    }
    // moss tufts
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.ConeGeometry(0.035, 0.07, 5), i % 2 ? P.moss : P.mossDark, {
        at: [s * (0.4 + i * 0.2 + R() * 0.05), 1.3 + R() * 0.05, -0.8 + R() * 0.1],
        bone: root, flat: true,
      });
    }
  }
}
    return buildWings;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "gargoyleLedge" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.9,-0.3], dir: [0,0.5,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,1.2,0.05], dir: [0,0.6,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1.42,0.22], dir: [0,0.55,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.58,0.38], dir: [0,0.3,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.5,0.5], dir: [0,0.15,1], role: "jaw" });
  J["wingL"] = b.joint("wingL", { parent: J["chest"], at: [0.3,1.34,-0.22], dir: [0.75,0.65,-0.55], role: "wing" });
  J["wingR"] = b.joint("wingR", { parent: J["chest"], at: [-0.3,1.34,-0.22], dir: [-0.75,0.65,-0.55], role: "wing" });
  J["armL"] = b.joint("armL", { parent: J["chest"], at: [0.34,1.22,0.1], dir: [0.5,-0.75,0.55], role: "arm" });
  J["armR"] = b.joint("armR", { parent: J["chest"], at: [-0.34,1.22,0.1], dir: [-0.5,-0.75,0.55], role: "arm" });
  J["legL"] = b.joint("legL", { parent: J["hips"], at: [0.3,0.85,-0.3], dir: [0.35,-1,0.1], role: "leg" });
  J["legR"] = b.joint("legR", { parent: J["hips"], at: [-0.3,0.85,-0.3], dir: [-0.35,-1,0.1], role: "leg" });
  J["tail"] = b.joint("tail", { parent: J["hips"], at: [0,0.72,-0.6], dir: [0,-0.2,-1], role: "tail" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
