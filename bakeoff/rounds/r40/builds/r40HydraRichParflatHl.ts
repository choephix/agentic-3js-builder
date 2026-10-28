import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, offset } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Hydra of the Broken Axes",
  "description": "A scarred, battle-worn five-headed Norse hydra in a gritty God of War style: slate-green scales, bone horns, rusted iron bands and embedded broken weapons, with ember-orange eyes and frost-blue runes glowing against the muted pelt."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  scaleDark: "#27332f",
  scaleMid: "#3a4f48",
  scaleLight: "#58776a",
  belly: "#a39b80",
  bellyDark: "#7b7359",
  bone: "#dcd2b6",
  boneDark: "#968b6f",
  hornDark: "#3b3029",
  claw: "#cfc4a8",
  ember: "#ff6a1a",
  emberHot: "#ffc247",
  frost: "#9fe0f2",
  iron: "#4b4e57",
  ironDark: "#25272d",
  rust: "#7a4328",
  bronze: "#a8793a",
  leather: "#4a3224",
  blood: "#7a1a14",
  scar: "#c9b8a0",
  mouth: "#6a1f26",
  tongue: "#a63a3a",
  pupil: "#120a08",
  ash: "#5a5648",
};
const M = {
  pelvis: [0, 2.1, -1] as [number, number, number],
  chestCentre: [0, 2.4, 1.3] as [number, number, number],
  neckBaseC: [0, 2.9, 1.5] as [number, number, number],
  neckBaseIL: [0.9, 2.8, 1.5] as [number, number, number],
  neckBaseIR: [-0.9, 2.8, 1.5] as [number, number, number],
  neckBaseOL: [1.3, 2.7, 1.4] as [number, number, number],
  neckBaseOR: [-1.3, 2.7, 1.4] as [number, number, number],
  headSocketC: [0, 5, 2.6] as [number, number, number],
  headSocketIL: [2, 4.5, 2.6] as [number, number, number],
  headSocketIR: [-2, 4.5, 2.6] as [number, number, number],
  headSocketOL: [2.95, 3.55, 2.55] as [number, number, number],
  headSocketOR: [-2.95, 3.55, 2.55] as [number, number, number],
  shoulderL: [1.15, 2, 1.4] as [number, number, number],
  shoulderR: [-1.15, 2, 1.4] as [number, number, number],
  hipL: [1.15, 2, -1.3] as [number, number, number],
  hipR: [-1.15, 2, -1.3] as [number, number, number],
  tailRoot: [0, 2.1, -1.7] as [number, number, number],
  tailTip: [0, 1.05, -5] as [number, number, number],
  backTop: [0, 3.3, 0.2] as [number, number, number],
  bellyBottom: [0, 1.2, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const body = b.loft(
    [
      { at: [0, 2.1, -1.9], w: 1.4, h: 1.5 },
      { at: [0, 2.1, -1], w: 2.0, h: 1.9 },
      { at: [0, 2.2, 0], w: 2.3, h: 2.1 },
      { at: [0, 2.4, 1.2], w: 2.4, h: 2.2 },
      { at: [0, 2.4, 2.1], w: 1.8, h: 1.8 },
    ],
    {
      bone: [J.pelvis, J.spine1, J.chest],
      color: P.scaleMid,
      sectors: [
        [-60, 60, P.scaleDark],
        [120, 240, P.belly],
        [100, 120, P.bellyDark],
        [240, 260, P.bellyDark],
      ],
    },
  );
  // rump cap and hip/shoulder masses
  b.part(new THREE.SphereGeometry(0.75, 10, 8), P.scaleMid, { bone: J.pelvis, at: [0, 2.1, -1.8] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.6, 8, 6), P.scaleMid, { bone: J.pelvis, at: [s * 1.1, 2.1, -1.3] });
    b.part(new THREE.SphereGeometry(0.65, 8, 6), P.scaleMid, { bone: J.chest, at: [s * 1.1, 2.1, 1.4] });
  }
  // collar mounds with spike rings
  for (const k of ["C", "IL", "IR", "OL", "OR"]) {
    const m = M["neckBase" + k];
    const mound = b.part(new THREE.SphereGeometry(0.5, 8, 6), P.scaleMid, { bone: J.chest, at: [m[0], m[1] - 0.05, m[2]] });
    b.ring(frame([m[0], m[1] + 0.3, m[2]], [0, 1, 0]), { count: 6, radius: 0.45 }, (it) =>
      b.spike(it, it, 0.16, 0.04, { color: P.bone, bone: J.chest }),
    );
  }
  // dorsal ridge
  for (let i = 0; i < 9; i++) {
    const z = 1.9 - i * 0.42;
    const sc = 0.5 + 0.5 * (z + 1.8) / 3.7;
    const y = 3.2 + 0.05 * (z > 0 ? 1 : 0) - (z < -1 ? 0.2 : 0);
    const bone = z > 0.9 ? J.chest : z > -0.4 ? J.spine1 : J.pelvis;
    b.part(new THREE.BoxGeometry(0.35 * sc, 0.1, 0.4), P.boneDark, { bone, at: [0, y, z] });
    b.part(new THREE.ConeGeometry(0.15 * sc, 0.5 * sc + 0.1, 5), P.bone, { bone, at: [0, y + 0.22 * sc + 0.1, z] });
  }
  // rib bands and belly plates
  for (let i = 0; i < 6; i++) {
    const z = -1 + i * 0.55;
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.1, 0.9, 0.12), P.bellyDark, { bone: J.spine1, at: [s * 1.14, 2.0, z], rotation: [0, 0, s * 12] });
    b.part(new THREE.BoxGeometry(0.9, 0.08, 0.3), P.bellyDark, { bone: J.spine1, at: [0, 1.17, z] });
  }
  // scars with ember seams, burns
  for (const [s, z, y] of [[1, 0.6, 2.5], [-1, -0.4, 2.7], [1, -1.0, 2.2]] as number[][]) {
    const x = s * 1.18;
    b.part(new THREE.BoxGeometry(0.05, 0.12, 1.0), P.scar, { bone: J.spine1, at: [x, y, z], rotation: [0, 0, s * -10] });
    glow(b.part(new THREE.BoxGeometry(0.06, 0.04, 0.7), P.ember, { bone: J.spine1, at: [x + s * 0.01, y, z] }), 1.5);
  }
  b.part(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 8), P.ash, { bone: J.spine1, at: [-1.15, 2.4, 0.5], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 6), P.blood, { bone: J.spine1, at: [-1.16, 2.4, 0.5], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 8), P.ash, { bone: J.spine1, at: [1.0, 1.7, -0.3], rotation: [0, 0, 90] });
  // axe in left flank
  b.part(new THREE.BoxGeometry(0.5, 0.45, 0.1), P.iron, { bone: J.spine1, at: [1.45, 2.5, 0.2], rotation: [0, 90, 0] });
  b.part(new THREE.BoxGeometry(0.1, 0.5, 0.06), P.rust, { bone: J.spine1, at: [1.45, 2.5, 0.48] });
  b.rod([1.2, 2.5, 0.2], [1.8, 2.7, 0.2], 0.04, P.leather, { bone: J.spine1 });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 6), P.leather, { bone: J.spine1, at: [1.8, 2.7, 0.2], rotation: [0, 0, 80] });
  // spear tip right shoulder
  b.spike([-1.15, 2.9, 1.5], [-1.9, 3.5, 1.7], null, 0.08, { color: P.iron, bone: J.chest });
  b.rod([-1.9, 3.5, 1.7], [-2.1, 3.7, 1.75], 0.045, P.boneDark, { bone: J.chest });
  // chain wrap
  const links = 22;
  for (let i = 0; i < links; i++) {
    const t = i / links * Math.PI * 2;
    const z = 0.4 + Math.sin(t) * 0.0 + (i / links - 0.5) * 1.2;
    const x = Math.sin(t) * 1.2;
    const y = 2.3 + Math.cos(t) * 1.1 + (i / links - 0.5) * 0.4;
    b.part(new THREE.TorusGeometry(0.07, 0.022, 4, 6), i % 3 ? P.ironDark : P.rust, {
      bone: J.spine1, at: [x * 1.05, y, z], rotation: [i % 2 ? 90 : 0, (t * 180) / Math.PI, 0],
    });
  }
  b.part(new THREE.BoxGeometry(0.3, 0.25, 0.1), P.iron, { bone: J.spine1, at: [0, 3.36, 0.4] });
  b.part(new THREE.BoxGeometry(0.14, 0.1, 0.12), P.bronze, { bone: J.spine1, at: [0, 3.36, 0.42] });
  // rune brands
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 10), P.ironDark, { bone: J.spine1, at: [s * 1.17, 2.0, -0.2], rotation: [0, 0, 90] });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const r = i % 2 ? 0.1 : 0.14;
      glow(
        b.part(new THREE.BoxGeometry(0.03, 0.14 + R() * 0.06, 0.04), P.frost, {
          bone: J.spine1,
          at: [s * 1.2, 2.0 + Math.cos(a) * 0.25, -0.2 + Math.sin(a) * 0.25],
          rotation: [(i * 37) % 60, 0, 0],
        }),
        1.6,
      );
    }
  }
}
    return buildTorso;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  // leg point sets (left side; mirrored by sign)
  const mir = (p: number[], s: number) => [p[0] * s, p[1], p[2]];

  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  const band = (bone: any, a: number[], d: number[], r: number, h: number, color: string) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 10), color, { bone, at: a, dir: d });

  const claws = (bone: any, c: number[], s: number) => {
    for (let i = -1; i <= 1; i++) {
      const base = [c[0] + i * 0.2 * s + i * 0.03 * s, 0.12, c[2] + 0.22];
      // toe
      b.part(new THREE.BoxGeometry(0.2, 0.16, 0.34), P.scaleDark, { bone, at: [base[0], 0.08, base[2]], rotation: [0, i * 12 * s, 0] });
      // dirt on toe
      b.part(new THREE.BoxGeometry(0.21, 0.05, 0.35), P.ash, { bone, at: [base[0], 0.025, base[2]], rotation: [0, i * 12 * s, 0] });
      // claw
      b.spike([base[0] + i * 0.05 * s, 0.1, base[2] + 0.15], [i * 0.15 * s, -0.25, 1], 0.3, 0.07, { bone, color: P.claw });
    }
  };

  const foot = (bone: any, c: number[], s: number) => {
    b.part(new THREE.BoxGeometry(0.6, 0.2, 0.5), P.scaleDark, { bone, at: [c[0], 0.1, c[2]] });
    b.part(new THREE.BoxGeometry(0.62, 0.06, 0.52), P.ash, { bone, at: [c[0], 0.03, c[2]] });
    claws(bone, c, s);
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // ---------- foreleg ----------
    const sh = mir([1.15, 2, 1.4], s);
    const el = mir([1.5, 1, 1.1], s);
    const wr = mir([1.4, 0.4, 1.5], s);
    const pw = mir([1.4, 0.15, 1.75], s);
    const sj = J["shoulderF" + L], ej = J["elbowF" + L], wj = J["wristF" + L], pj = J["pawF" + L];

    b.part(sph(0.62, 10, 8), P.scaleMid, { bone: sj, at: [sh[0], 1.95, sh[2]], scale: [1, 1.1, 1.1] });
    b.sweep([sh, el], [0.42, 0.34], { bone: sj, color: P.scaleMid, sides: 8 });
    b.sweep([el, wr], [0.34, 0.24], { bone: ej, color: P.scaleDark, sides: 8 });
    b.sweep([wr, [pw[0], 0.12, pw[2] - 0.1]], [0.24, 0.22], { bone: wj, color: P.scaleDark, sides: 8 });
    b.part(sph(0.3), P.scaleMid, { bone: ej, at: el });
    b.spike([el[0] + 0.2 * s, el[1], el[2] - 0.15], [s, 0.2, -0.6], 0.5, 0.12, { bone: ej, color: P.bone });
    // ash lower leg band
    band(wj, [wr[0], 0.3, wr[2] + 0.05], [0, 1, 0], 0.27, 0.22, P.ash);
    // inner belly-pale patch
    b.part(new THREE.BoxGeometry(0.05, 0.5, 0.3), P.belly, { bone: ej, at: [el[0] - 0.3 * s, 0.9, el[2] + 0.05] });
    // frost rune at shoulder
    glow(b.part(new THREE.BoxGeometry(0.03, 0.2, 0.08), P.frost, { bone: sj, at: [sh[0] + 0.6 * s, 2.05, sh[2]] }), 1.5);
    glow(b.part(new THREE.BoxGeometry(0.03, 0.08, 0.2), P.frost, { bone: sj, at: [sh[0] + 0.61 * s, 2.0, sh[2] + 0.04] }), 1.5);
    foot(pj, [pw[0], 0, pw[2] + 0.05], s);
    b.part(sph(0.26), P.scaleDark, { bone: pj, at: [pw[0], 0.22, pw[2] - 0.15] });

    // ---------- hindleg ----------
    const hp = mir([1.15, 2, -1.3], s);
    const kn = mir([1.55, 1.3, -0.65], s);
    const hk = mir([1.45, 0.85, -1.75], s);
    const hpw = mir([1.4, 0.15, -1.3], s);
    const hj = J["hipH" + L], kj = J["kneeH" + L], kj2 = J["hockH" + L], hpj = J["pawH" + L];

    b.part(sph(0.75, 10, 8), P.scaleMid, { bone: hj, at: [hp[0] + 0.1 * s, 1.95, hp[2] + 0.1], scale: [0.9, 1.1, 1.2] });
    b.sweep([hp, kn], [0.55, 0.4], { bone: hj, color: P.scaleMid, sides: 8 });
    b.part(sph(0.4), P.scaleMid, { bone: kj, at: kn });
    b.sweep([kn, hk], [0.4, 0.26], { bone: kj, color: P.scaleDark, sides: 8 });
    b.part(sph(0.28), P.scaleDark, { bone: kj2, at: hk });
    b.sweep([hk, [hpw[0], 0.2, hpw[2] - 0.1]], [0.26, 0.2], { bone: kj2, color: P.scaleDark, sides: 8 });
    b.spike([hk[0], hk[1] + 0.05, hk[2] - 0.2], [0, 0.3, -1], 0.5, 0.11, { bone: kj2, color: P.bone });
    band(kj2, [hpw[0], 0.35, hpw[2] - 0.15], [0, 1, 0.1], 0.23, 0.2, P.ash);
    // belly-pale inner patch
    b.part(new THREE.BoxGeometry(0.05, 0.6, 0.35), P.belly, { bone: hj, at: [hp[0] - 0.5 * s, 1.55, hp[2] + 0.2] });
    foot(hpj, [hpw[0], 0, hpw[2] + 0.05], s);
    if (s > 0) {
      // bronze band on left hock
      band(kj2, [hk[0] + 0.02, hk[1] - 0.2, hk[2] + 0.08], [0.05, 1, -0.2], 0.3, 0.2, P.bronze);
      band(kj2, [hk[0] + 0.02, hk[1] - 0.2, hk[2] + 0.08], [0.05, 1, -0.2], 0.31, 0.04, P.rust);
      // scar gash on thigh
      glow(b.part(new THREE.BoxGeometry(0.03, 0.08, 0.7), P.ember, { bone: hj, at: [hp[0] + 0.62, 1.8, hp[2] + 0.2], rotation: [0, 0, 20] }), 1.2);
      b.part(new THREE.BoxGeometry(0.04, 0.14, 0.8), P.scar, { bone: hj, at: [hp[0] + 0.6, 1.8, hp[2] + 0.2], rotation: [0, 0, 20] });
    }
    // hind shoulder-side rune dots omitted; rune on hip
  }

  // iron cuff with rust band and 4 rivets on right fore wrist
  {
    const wr = [-1.4, 0.55, 1.45];
    band(J.wristFR, wr, [0.05, 1, 0.2], 0.3, 0.25, P.iron);
    band(J.wristFR, [wr[0], wr[1] - 0.15, wr[2]], [0.05, 1, 0.2], 0.31, 0.06, P.rust);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      b.part(sph(0.04, 6, 4), P.bronze, { bone: J.wristFR, at: [wr[0] + Math.cos(a) * 0.3, wr[1] + 0.05, wr[2] + Math.sin(a) * 0.3] });
    }
  }

  // frayed leather strap + chain on left foreleg
  {
    const e = [1.48, 0.85, 1.15];
    band(J.elbowFL, e, [0.1, 1, 0.3], 0.36, 0.14, P.leather);
    for (let i = 0; i < 3; i++)
      b.part(new THREE.BoxGeometry(0.05, 0.2 + R() * 0.1, 0.03), P.leather, { bone: J.elbowFL, at: [e[0] + 0.1 + i * 0.1, 0.65, e[2] + 0.35] });
    for (let i = 0; i < 6; i++) {
      b.part(new THREE.TorusGeometry(0.06, 0.018, 5, 8), i % 2 ? P.ironDark : P.rust, {
        bone: J.elbowFL, at: [e[0] + 0.38, 0.85 - i * 0.07, e[2] + 0.1], rotation: [i % 2 ? 90 : 0, 90, 0],
      });
    }
  }
}
    return buildLegs;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const pts: number[][] = [
    [0, 2.1, -1.7], [0, 1.95, -2.5], [0, 1.7, -3.2], [0, 1.45, -3.9], [0, 1.2, -4.5], [0, 1.05, -4.95],
  ];
  const path = catmull(pts);
  const joints = [J.tail1, J.tail2, J.tail3, J.tail4, J.tail5, J.tail6];
  const rad = (t: number) => 0.6 * (1 - t) + 0.08 * t;
  const tube = b.sweep(path, [0.6, 0.07], {
    bone: joints,
    color: P.scaleDark,
    sectors: [[130, 230, P.belly]],
    sides: 8,
    caps: "round",
  });
  const boneAt = (t: number) => joints[Math.min(5, Math.floor(t * 6))];

  // dorsal spikes with dark bases
  const N = 9;
  for (let i = 0; i < N; i++) {
    const t = 0.06 + (i / (N - 1)) * 0.82;
    const p = tube.at(t, 0);
    const s = 1 - t * 0.75;
    b.stick(new THREE.CylinderGeometry(0.15 * s, 0.19 * s, 0.07, 6), P.boneDark, p, { embed: 0.3 });
    b.stick(new THREE.ConeGeometry(0.12 * s, 0.5 * s, 5), P.bone, p, { embed: -0.1 });
  }

  // ash dirt on underside
  for (let i = 0; i < 6; i++) {
    const t = 0.15 + i * 0.14;
    b.stick(new THREE.BoxGeometry(0.3 * (1 - t * 0.6), 0.03, 0.22), P.ash, tube.at(t, 180), { embed: 0.3 });
  }

  // iron ring with rust bands near middle
  const ringT = 0.45;
  const rp = tube.at(ringT, 0);
  const rr = rad(ringT) + 0.03;
  const ringAt = (t: number) => path.at(t);
  const addRing = (t: number, R: number, tube2: number, col: string) => {
    const c = ringAt(t);
    const tg = path.tangentAt(t);
    const m = b.part(new THREE.TorusGeometry(R, tube2, 5, 12), col, { at: c, dir: tg, axis: "z", bone: boneAt(t) });
    return m;
  };
  addRing(ringT, rad(ringT) + 0.04, 0.045, P.ironDark);
  addRing(ringT - 0.05, rad(ringT - 0.05) + 0.03, 0.03, P.rust);
  addRing(ringT + 0.05, rad(ringT + 0.05) + 0.03, 0.03, P.rust);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    const c = ringAt(ringT);
    b.part(new THREE.SphereGeometry(0.035, 5, 4), P.bronze, {
      at: [c.x + Math.sin(a) * (rr + 0.04), c.y + Math.cos(a) * (rr + 0.04), c.z],
      bone: boneAt(ringT),
    });
  }

  // chain wound twice
  const chainPts: number[][] = [];
  for (let i = 0; i <= 28; i++) {
    const u = i / 28;
    const t = 0.52 + u * 0.14;
    const c = ringAt(t);
    const a = u * Math.PI * 4;
    const R = rad(t) + 0.06;
    chainPts.push([c.x + Math.sin(a) * R, c.y + Math.cos(a) * R, c.z]);
  }
  chainPts.forEach((p, i) => {
    if (i % 2 === 0) {
      const g = new THREE.TorusGeometry(0.06, 0.018, 4, 8);
      b.part(g, i % 4 === 0 ? P.iron : P.rust, {
        at: p,
        rotation: [i % 4 === 0 ? 90 : 0, (i * 37) % 180, 0],
        bone: boneAt(0.6),
      });
    }
  });

  // harpoon near root
  const hp = tube.at(0.12, 70);
  b.stick(new THREE.ConeGeometry(0.1, 0.4, 4), P.iron, hp, { embed: 0.3 });
  b.stick(new THREE.BoxGeometry(0.16, 0.03, 0.03), P.rust, hp.moved([0, 0.12, 0]), { embed: 0 });
  b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 5), P.leather, hp.moved([0, 0.45, 0]), { embed: 0 });

  // scar with ember glow
  for (let i = 0; i < 6; i++) {
    const t = 0.3 + i * 0.07;
    const p = tube.at(t, -60 + i * 6);
    b.stick(new THREE.BoxGeometry(0.05, 0.02, 0.1), P.scar, p, { embed: 0.4 });
    glow(b.stick(new THREE.BoxGeometry(0.02, 0.015, 0.08), P.ember, p.moved([0, 0.005, 0]), { embed: 0.2 }), 1.5);
  }

  // frost runes ring at root
  for (let k = 0; k < 3; k++) {
    const p = tube.at(0.05, -50 + k * 50);
    const rune = b.stick(new THREE.BoxGeometry(0.1, 0.02, 0.16), P.ironDark, p, { embed: 0.3 });
    glow(b.stick(new THREE.BoxGeometry(0.03, 0.02, 0.12), P.frost, p.moved([0, 0.012, 0]), { embed: 0.2 }), 1.5);
    glow(b.stick(new THREE.BoxGeometry(0.08, 0.02, 0.03), P.frost, p.moved([0, 0.012, 0.02]), { embed: 0.2 }), 1.5);
  }

  // spade tip
  const tipAt = [0, 1.02, -4.95];
  const spade = b.extrude(
    [
      [0, -0.12], [0.3, -0.35], [0.4, -0.75], [0.12, -1.15], [0.02, -1.0], [-0.04, -1.2],
      [-0.12, -1.15], [-0.4, -0.75], [-0.3, -0.35],
    ],
    { at: tipAt, x: [1, 0, 0], y: [0, 0.05, -1], thickness: 0.07, bevel: 0.01, color: P.bone, bone: J.tail6 },
  );
  b.extrude(
    [[0, -0.2], [0.12, -0.4], [0.15, -0.75], [0, -0.95], [-0.15, -0.75], [-0.12, -0.4]],
    { at: [0, 1.02, -4.98], x: [1, 0, 0], y: [0, 0.05, -1], thickness: 0.1, color: P.boneDark, bone: J.tail6 },
  );
}
    return buildTail;
  })(),
  // headC
  (() => {
function buildHeadC({ b, J, P, M }: any) {
  const H = 1.25;
  const head = J.headC, jaw = J.jawC;
  const hp = new THREE.Vector3(...(M.headSocketC as number[]));
  const L = (x: number, y: number, z: number): [number, number, number] => [hp.x + x * H, hp.y + y * H, hp.z + z * H];

  // neck
  const neckPath = catmull([[0, 2.9, 1.5], [0, 3.6, 1.8], [0, 4.3, 1.95], [0, 4.8, 2.2], [0, 5.0, 2.55]]);
  const neck = b.sweep(neckPath, [0.5, 0.33], {
    bone: [J.neckC1, J.neckC2, J.neckC3, J.neckC4, head],
    color: P.scaleDark,
    sectors: [[125, 235, P.belly]],
  });
  b.along(neck, 7, (at: any) => {
    b.spike(at, at, 0.28, 0.07, { color: P.bone });
    b.stick(new THREE.CylinderGeometry(0.09, 0.11, 0.04, 6), P.boneDark, at, { embed: 0.3 });
  });
  for (let i = 0; i < 6; i++) {
    const p = neck.at(0.1 + i * 0.15, 180, 0.01);
    b.stick(new THREE.BoxGeometry(0.34, 0.03, 0.1), P.bellyDark, p, { embed: 0.3 });
  }

  // skull
  const part = (g: THREE.BufferGeometry, c: string, at: [number, number, number], opt: any = {}) =>
    b.part(g, c, { bone: head, at, ...opt });
  part(new THREE.BoxGeometry(0.9, 0.7, 0.9), P.scaleDark, L(0, 0, 0.05), { scale: [H, H, H] });
  part(new THREE.BoxGeometry(0.6, 0.38, 0.8), P.scaleMid, L(0, -0.12, 0.7), { scale: [H, H, H] });
  part(new THREE.BoxGeometry(0.62, 0.1, 0.75), P.scaleDark, L(0, 0.1, 0.72), { scale: [H, H, H] });
  // nostrils
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.08, 0.06, 0.06), P.pupil, L(s * 0.15, 0.1, 1.1));
    // eyes
    const e = L(s * 0.4, 0.17, 0.5);
    part(new THREE.BoxGeometry(0.22, 0.2, 0.12), P.pupil, e);
    glow(part(new THREE.SphereGeometry(0.1, 8, 6), P.emberHot, [e[0] + s * 0.02, e[1], e[2] + 0.05]), 1.5);
    part(new THREE.BoxGeometry(0.03, 0.15, 0.03), P.pupil, [e[0] + s * 0.02, e[1], e[2] + 0.15]);
    part(new THREE.BoxGeometry(0.28, 0.07, 0.26), P.boneDark, [e[0], e[1] + 0.15, e[2]], { rotation: [0, 0, -s * 12] });
    // cheek plates
    part(new THREE.BoxGeometry(0.06, 0.32, 0.4), P.bone, L(s * 0.48, -0.15, 0.2));
    b.spike(frame(L(s * 0.5, -0.2, 0.05), [s, -0.2, -0.5]), [s, -0.2, -0.5], 0.25, 0.05, { color: P.bone, bone: head });
    // horns
    const big = s;
    const hs = L(s * 0.25, 0.35, -0.15);
    const hp2 = catmull([hs, L(s * 0.55, 0.55, -0.35), L(s * 0.85, 0.5, -0.8), L(s * 0.95, 0.2, -1.1)]);
    b.sweep(hp2, [0.11 * H, 0.03], { bone: head, color: P.hornDark, caps: { end: "point" } });
    b.sweep(hp2.slice(0.8, 1), [0.04, 0.0], { bone: head, color: P.bone, caps: { end: "point" } });
    b.sweep(hp2.slice(0.45, 0.5), 0.1, { bone: head, color: P.boneDark });
  }
  // inner horns
  for (const s of [1, -1]) {
    const mid = L(s * 0.1, 0.38, -0.2);
    const tip = L(s * 0.15, 0.95, -0.9);
    b.sweep(catmull([mid, L(s * 0.15, 0.75, -0.4), tip]), [0.09 * H, 0.03], { bone: head, color: P.hornDark, caps: { end: "point" } });
    const pos = s > 0 ? [s * 0.3, 0.85, -0.55] : null;
    if (pos) {
      b.sweep(catmull([L(s * 0.3, 0.7, -0.35), L(s * 0.3, 0.9, -0.5)]), 0.075, { bone: head, color: P.iron });
      for (let i = 0; i < 4; i++) part(new THREE.SphereGeometry(0.02, 5, 4), P.rust, L(s * 0.3 + 0.08 * Math.cos(i * 1.57), 0.8, -0.43 + 0.08 * Math.sin(i * 1.57)));
    }
  }
  const mid = L(0, 0.4, -0.3);
  b.sweep(catmull([mid, L(0, 0.8, -0.6), L(0, 0.9, -1.1)]), [0.1 * H, 0.03], { bone: head, color: P.hornDark, caps: { end: "point" } });
  // frill
  for (let i = 0; i < 7; i++) {
    const a = -1.2 + i * 0.4;
    b.spike(L(Math.sin(a) * 0.4, 0.1 + Math.cos(a) * 0.2, -0.4), [Math.sin(a) * 0.6, 0.3, -1], 0.5, 0.06, { color: P.bone, bone: head });
  }
  // scar over left eye
  part(new THREE.BoxGeometry(0.03, 0.4, 0.05), P.scar, L(0.4, 0.3, 0.75), { rotation: [0, 0, 25] });
  glow(part(new THREE.BoxGeometry(0.012, 0.36, 0.055), P.ember, L(0.4, 0.3, 0.76), { rotation: [0, 0, 25] }), 1.2);
  // forehead rune
  glow(part(new THREE.BoxGeometry(0.04, 0.2, 0.03), P.frost, L(0, 0.37, 0.4)), 1.5);
  glow(part(new THREE.BoxGeometry(0.16, 0.035, 0.03), P.frost, L(0, 0.37, 0.4)), 1.5);
  // muzzle ring + chain
  part(new THREE.TorusGeometry(0.34, 0.035, 6, 12), P.iron, L(0, -0.1, 0.8), { scale: [H, H, H] });
  for (let i = 0; i < 4; i++) part(new THREE.TorusGeometry(0.04, 0.012, 5, 8), P.ironDark, L(0.0, -0.4 - i * 0.07, 0.85), { rotation: [i % 2 ? 90 : 0, 0, 0] });

  // upper teeth
  for (let i = 0; i < 6; i++) {
    for (const s of [1, -1]) {
      const z = 0.45 + i * 0.12;
      const big = i === 5;
      part(new THREE.ConeGeometry(big ? 0.05 : 0.035, big ? 0.28 : 0.15, 5), P.bone, L(s * 0.27, -0.38, z), { rotation: [180, 0, 0] });
    }
  }
  // lower jaw
  const jp = new THREE.Vector3(...(M.headSocketC as number[]));
  const J2 = (x: number, y: number, z: number): [number, number, number] => [jp.x + x * H, 4.85 + y * H, 2.85 + z * H];
  b.part(new THREE.BoxGeometry(0.55, 0.16, 0.9), P.scaleMid, { bone: jaw, at: J2(0, -0.1, 0.45), scale: [H, H, H] });
  b.part(new THREE.BoxGeometry(0.45, 0.06, 0.7), P.mouth, { bone: jaw, at: J2(0, 0.0, 0.4), scale: [H, H, H] });
  b.part(new THREE.BoxGeometry(0.22, 0.05, 0.5), P.tongue, { bone: jaw, at: J2(0, 0.05, 0.4), scale: [H, H, H] });
  for (let i = 0; i < 5; i++) for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.03, 0.12, 5), i === 2 && s > 0 ? P.boneDark : P.bone, { bone: jaw, at: J2(s * 0.24, 0.1, 0.15 + i * 0.15) });
  b.part(new THREE.BoxGeometry(0.4, 0.1, 0.3), P.scar, { bone: jaw, at: J2(0, -0.2, 0.7), scale: [H, H, H] });
}
    return buildHeadC;
  })(),
  // headsInner
  (() => {
function buildHeadsInner({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const H = 1.0;
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const neck = [1, 2, 3, 4].map((i) => J[`neckI${k}${i}`]);
    const head = J[`headI${k}`];
    const jaw = J[`jawI${k}`];
    const pts: number[][] = [
      [s * 0.9, 2.8, 1.5],
      [s * 1.3, 3.4, 1.8],
      [s * 1.65, 3.95, 2.0],
      [s * 1.9, 4.35, 2.25],
      [s * 2.0, 4.5, 2.6],
    ];
    const tube = b.sweep(pts, [0.42, 0.3], {
      bone: neck,
      color: P.scaleDark,
      sectors: [[125, 235, P.belly]],
      sides: 8,
    });
    // dorsal spikes
    b.along(tube, 5, (at) => {
      b.spike(at, at, 0.2 - at.t * 0.08, 0.05, { color: P.bone });
    });
    // neck bands
    for (const t of [0.3, 0.6]) {
      const p = tube.at(t, 180);
      b.stick(new THREE.BoxGeometry(0.3, 0.05, 0.12), P.bellyDark, p, { embed: 0.5 });
    }
    // skull
    const hp = (x: number, y: number, z: number) => head.local([s * 0, 0, 0]).clone().add(new THREE.Vector3(s * 2.0 + x * s, 4.5 + y, 2.6 + z));
    const skull = (x: number, y: number, z: number, w: number, h: number, d: number, c: string, bone = head) =>
      b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: hp(x, y, z) });
    skull(0, 0, 0.1, 0.62 * H, 0.5 * H, 0.7 * H, P.scaleMid);
    skull(0, -0.04, 0.55, 0.42 * H, 0.3 * H, 0.45 * H, P.scaleMid);
    skull(0, 0.2, 0.0, 0.6, 0.08, 0.45, P.scaleDark);
    skull(0, -0.15, 0.4, 0.4, 0.06, 0.5, P.bellyDark);
    // lower jaw
    const jp = (x: number, y: number, z: number) => new THREE.Vector3(s * 2.02 + x * s, 4.38 + y, 2.8 + z);
    b.part(new THREE.BoxGeometry(0.4, 0.14, 0.75), P.scaleMid, { bone: jaw, at: jp(0, -0.06, 0.3) });
    b.part(new THREE.BoxGeometry(0.3, 0.04, 0.55), P.mouth, { bone: jaw, at: jp(0, 0.03, 0.3) });
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.3), P.tongue, { bone: jaw, at: jp(0, 0.05, 0.3) });
    // teeth
    for (let i = 0; i < 5; i++) {
      for (const x of [-1, 1]) {
        const z = 0.55 + i * 0.07;
        b.spike(hp(x * 0.2, -0.17, z - 0.05), [0, -1, 0], i === 0 ? 0.14 : 0.09, 0.025, { color: P.bone, bone: head });
        b.spike(jp(x * 0.17, 0.03, 0.05 + i * 0.13), [0, 1, 0], i === 0 ? 0.12 : 0.08, 0.022, { color: P.bone, bone: jaw });
      }
    }
    // nostrils
    for (const x of [-1, 1]) b.part(new THREE.BoxGeometry(0.06, 0.05, 0.04), P.pupil, { bone: head, at: hp(x * 0.1, 0.06, 0.8) });
    // eyes
    for (const x of [-1, 1]) {
      const blind = false;
      glow(b.part(new THREE.SphereGeometry(0.09, 6, 4), P.emberHot, { bone: head, at: hp(x * 0.32, 0.1, 0.25) }), 1.5);
      b.part(new THREE.BoxGeometry(0.03, 0.11, 0.03), P.pupil, { bone: head, at: hp(x * 0.38, 0.1, 0.3) });
      b.part(new THREE.BoxGeometry(0.2, 0.06, 0.2), P.scaleDark, { bone: head, at: hp(x * 0.32, 0.2, 0.22) });
      void blind;
    }
    // frill
    for (let i = -2; i <= 2; i++) {
      b.spike(hp(i * 0.12, 0.1, -0.25), [i * 0.25 * s, 0.6, -0.8], 0.4 - Math.abs(i) * 0.05, 0.06, { color: P.bone, bone: head });
    }
    // brow rune
    glow(b.part(new THREE.BoxGeometry(0.03, 0.14, 0.03), P.frost, { bone: head, at: hp(0, 0.26, 0.4) }), 1.5);
    glow(b.part(new THREE.BoxGeometry(0.1, 0.03, 0.03), P.frost, { bone: head, at: hp(0, 0.27, 0.4) }), 1.5);
    // snout scar
    b.part(new THREE.BoxGeometry(0.3, 0.03, 0.04), P.scar, { bone: head, at: hp(0, 0.12, 0.62), rotation: [0, 0, 20] });
    glow(b.part(new THREE.BoxGeometry(0.2, 0.01, 0.02), P.ember, { bone: head, at: hp(0, 0.14, 0.64), rotation: [0, 0, 20] }), 1.2);
    if (s > 0) {
      // straight horns
      for (const x of [-1, 1]) {
        b.spike(hp(x * 0.22, 0.22, -0.05), [x * 0.35, 0.5, -0.8], 0.85, 0.08, { color: P.hornDark, bone: head });
        b.spike(hp(x * 0.22 + x * 0.25, 0.22 + 0.35, -0.05 - 0.55), [x * 0.35, 0.5, -0.8], 0.3, 0.03, { color: P.bone, bone: head });
      }
      // iron snout bands
      for (const z of [0.5, 0.7]) b.part(new THREE.BoxGeometry(0.46, 0.34, 0.06), P.iron, { bone: head, at: hp(0, -0.04, z) });
      b.part(new THREE.BoxGeometry(0.1, 0.1, 0.07), P.rust, { bone: head, at: hp(0, -0.04, 0.71) });
    } else {
      // curled ram horns
      for (const x of [-1, 1]) {
        const base = hp(x * 0.28, 0.12, -0.05);
        const c = new THREE.CatmullRomCurve3([
          base,
          base.clone().add(new THREE.Vector3(x * 0.3, 0.05, -0.2)),
          base.clone().add(new THREE.Vector3(x * 0.45, -0.2, -0.05)),
          base.clone().add(new THREE.Vector3(x * 0.3, -0.35, 0.2)),
          base.clone().add(new THREE.Vector3(x * 0.1, -0.2, 0.2)),
        ]);
        b.sweep(c.getPoints(10).map((p) => [p.x, p.y, p.z]), [0.09, 0.03], { bone: head, color: P.hornDark, sides: 6 });
      }
      // scarred cheek + leather patch
      b.part(new THREE.BoxGeometry(0.03, 0.2, 0.22), P.leather, { bone: head, at: hp(-0.33 * 1, -0.02, 0.05) });
      b.part(new THREE.BoxGeometry(0.03, 0.2, 0.22), P.leather, { bone: head, at: hp(0.33, -0.02, 0.05) });
      for (let i = 0; i < 4; i++)
        for (const x of [-1, 1]) b.part(new THREE.BoxGeometry(0.04, 0.015, 0.03), P.scar, { bone: head, at: hp(x * 0.35, -0.08 + i * 0.05, 0.05) });
    }
    // cheek spikes
    for (const x of [-1, 1]) b.spike(hp(x * 0.31, -0.1, 0.0), [x, -0.2, -0.4], 0.2, 0.05, { color: P.bone, bone: head });
  }
}
    return buildHeadsInner;
  })(),
  // headsOuter
  (() => {
function buildHeadsOuter({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const neck = [1, 2, 3, 4].map((i) => J[`neckO${N}${i}`]);
    const head = J[`headO${N}`];
    const jaw = J[`jawO${N}`];
    const H = 0.85;

    // neck
    const pts = [neck[0].at, neck[1].at, neck[2].at, neck[3].at, head.at].map((p) => [p.x, p.y, p.z] as [number, number, number]);
    const path = catmull(pts);
    const tube = b.sweep(path, [0.38, 0.24], { bone: neck, color: P.scaleDark });
    // throat strip
    b.sweep(path.slice(0.1, 1), [0.3, 0.17], { bone: neck, color: P.belly, shift: [0, 0] as any, sectors: undefined as any } as any);
    // dorsal spikes
    b.along(tube, 6, (at) => {
      b.spike(at, at, 0.2 - 0.02 * at.t * 5, 0.05, { color: P.bone });
    });

    // skull
    const sk = b.part(box(0.6 * H, 0.45 * H, 0.75 * H), P.scaleMid, { bone: head, at: head.local([0, 0.0, 0.0]) });
    b.part(box(0.4 * H, 0.3 * H, 0.55 * H), P.scaleMid, { bone: head, at: head.local([0, 0.0, 0.5 * H]) });
    // brows
    for (const e of [1, -1]) {
      const ex = e * 0.24 * H;
      b.part(box(0.22 * H, 0.1 * H, 0.35 * H), P.scaleDark, { bone: head, at: head.local([ex, 0.26 * H, 0.1 * H]) });
      const blind = s > 0 && e > 0;
      const eye = b.part(sph(0.075 * H), blind ? P.scar : P.emberHot, {
        bone: head, at: head.local([ex * 1.05, 0.15 * H, 0.22 * H]),
      });
      if (!blind) {
        glow(eye, 1.5);
        b.part(box(0.015, 0.08 * H, 0.02), P.pupil, { bone: head, at: head.local([ex * 1.2, 0.15 * H, 0.29 * H]) });
      } else {
        b.part(box(0.02, 0.02, 0.3 * H), P.scar, { bone: head, at: head.local([ex * 1.25, 0.15 * H, 0.24 * H]), rotation: [0, 0, 40] });
      }
      // nostril
      b.part(sph(0.03 * H, 5, 4), P.pupil, { bone: head, at: head.local([e * 0.1 * H, 0.14 * H, 0.78 * H]) });
    }
    // upper teeth
    for (let i = 0; i < 6; i++) {
      const z = 0.3 * H + i * 0.1 * H;
      for (const e of [1, -1]) {
        if (s < 0 && e > 0 && i === 3) continue; // broken tooth line
        b.spike(head.local([e * 0.2 * H, -0.17 * H, z]), [0, -1, 0], 0.1 * H, 0.025, { bone: head, color: P.bone });
      }
    }
    // jaw
    b.part(box(0.5 * H, 0.14 * H, 0.9 * H), P.scaleMid, { bone: jaw, at: jaw.local([0, -0.02, 0.35 * H]) });
    b.part(box(0.4 * H, 0.04, 0.7 * H), P.mouth, { bone: jaw, at: jaw.local([0, 0.06 * H, 0.35 * H]) });
    b.part(box(0.2 * H, 0.04, 0.5 * H), P.tongue, { bone: jaw, at: jaw.local([0, 0.09 * H, 0.35 * H]) });
    for (let i = 0; i < 5; i++)
      for (const e of [1, -1])
        b.spike(jaw.local([e * 0.2 * H, 0.08 * H, 0.1 + i * 0.1 * H]), [0, 1, 0], 0.08 * H, 0.02, { bone: jaw, color: P.bone });

    // horns
    const hornSpecs = s > 0 ? [[1, 0.5]] : [[1, 0.3]];
    for (const e of [1, -1]) {
      if (s < 0 && e > 0) continue;
      const broken = s > 0 && e > 0;
      const base = head.local([e * 0.22 * H, 0.28 * H, -0.2 * H]);
      const len = broken ? 0.25 : 0.55 * H;
      const h = b.spike(base, [e * 0.4, 0.6, -0.8], len, 0.09, { bone: head, color: P.hornDark });
      if (broken) {
        b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 8), P.rust, { bone: head, at: offset(base, [e * 0.4, 0.6, -0.8], 0.15), dir: [e * 0.4, 0.6, -0.8] });
        b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), P.leather, { bone: head, at: offset(base, [e * 0.4, 0.6, -0.8], 0.05), dir: [e * 0.4, 0.6, -0.8] });
      }
    }
    void hornSpecs;
    // cheek rune
    glow(b.part(box(0.02, 0.1, 0.06), P.frost, { bone: head, at: head.local([-0.31 * H, -0.02, 0.1 * H]) }), 1.5);
    glow(b.part(box(0.02, 0.1, 0.06), P.frost, { bone: head, at: head.local([0.31 * H, -0.02, 0.1 * H]) }), 1.5);

    if (s > 0) {
      // spear tip in jaw
      b.spike(jaw.local([0.25 * H, -0.1, 0.4]), [1, -0.3, 0.2], 0.5, 0.04, { bone: jaw, color: P.iron });
      b.rod(jaw.local([0.5 * H, -0.2, 0.45]), jaw.local([0.8, -0.3, 0.5]), 0.02, P.leather, { bone: jaw });
    } else {
      // neck wound
      const w = neck[1];
      b.part(sph(0.2, 7, 5), P.ash, { bone: w, at: w.local([-0.2, 0.2, 0.2]) });
      glow(b.part(box(0.04, 0.3, 0.06), P.ember, { bone: w, at: w.local([-0.3, 0.2, 0.25]) }), 1.5);
      b.part(new THREE.TorusGeometry(0.3, 0.04, 5, 10), P.bone, { bone: neck[2], at: neck[2].local([0, 0.1, 0]), dir: neck[2].dir([0, 1, 0]), axis: "z" });
    }
    void R; void frame; void M;
  }
}
    return buildHeadsOuter;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hydraGodOfWar" });
  const J: Record<string, Joint> = {};
  J["pelvis"] = b.joint("pelvis", { at: [0,2.1,-1], dir: [0,0,1], role: "spine", group: "torso" });
  J["spine1"] = b.joint("spine1", { parent: J["pelvis"], at: [0,2.2,0.1], dir: [0,0.1,1], role: "spine", group: "torso" });
  J["chest"] = b.joint("chest", { parent: J["spine1"], at: [0,2.4,1.3], dir: [0,0.1,1], role: "spine", group: "torso" });
  J["tail1"] = b.joint("tail1", { parent: J["pelvis"], at: [0,2.1,-1.7], dir: [0,-0.2,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1.95,-2.5], dir: [0,-0.3,-1], role: "tail", group: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.7,-3.2], dir: [0,-0.35,-1], role: "tail", group: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,1.45,-3.9], dir: [0,-0.35,-1], role: "tail", group: "tail" });
  J["tail5"] = b.joint("tail5", { parent: J["tail4"], at: [0,1.2,-4.5], dir: [0,-0.3,-1], role: "tail", group: "tail" });
  J["tail6"] = b.joint("tail6", { parent: J["tail5"], at: [0,1.05,-5], dir: [0,-0.1,-1], role: "tail", group: "tail" });
  J["shoulderFL"] = b.joint("shoulderFL", { parent: J["chest"], at: [1.15,2,1.4], dir: [0.2,-1,-0.1], role: "leg", group: "legs" });
  J["elbowFL"] = b.joint("elbowFL", { parent: J["shoulderFL"], at: [1.5,1,1.1], dir: [-0.1,-0.6,0.4], role: "leg", group: "legs" });
  J["wristFL"] = b.joint("wristFL", { parent: J["elbowFL"], at: [1.4,0.4,1.5], dir: [0,-0.5,0.4], role: "leg", group: "legs" });
  J["pawFL"] = b.joint("pawFL", { parent: J["wristFL"], at: [1.4,0.15,1.75], dir: [0,0,1], role: "leg", group: "legs" });
  J["shoulderFR"] = b.joint("shoulderFR", { parent: J["chest"], at: [-1.15,2,1.4], dir: [-0.2,-1,-0.1], role: "leg", group: "legs" });
  J["elbowFR"] = b.joint("elbowFR", { parent: J["shoulderFR"], at: [-1.5,1,1.1], dir: [0.1,-0.6,0.4], role: "leg", group: "legs" });
  J["wristFR"] = b.joint("wristFR", { parent: J["elbowFR"], at: [-1.4,0.4,1.5], dir: [0,-0.5,0.4], role: "leg", group: "legs" });
  J["pawFR"] = b.joint("pawFR", { parent: J["wristFR"], at: [-1.4,0.15,1.75], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipHL"] = b.joint("hipHL", { parent: J["pelvis"], at: [1.15,2,-1.3], dir: [0.3,-0.6,0.7], role: "leg", group: "legs" });
  J["kneeHL"] = b.joint("kneeHL", { parent: J["hipHL"], at: [1.55,1.3,-0.65], dir: [-0.1,-0.45,-1.1], role: "leg", group: "legs" });
  J["hockHL"] = b.joint("hockHL", { parent: J["kneeHL"], at: [1.45,0.85,-1.75], dir: [0,-0.7,0.35], role: "leg", group: "legs" });
  J["pawHL"] = b.joint("pawHL", { parent: J["hockHL"], at: [1.4,0.15,-1.3], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipHR"] = b.joint("hipHR", { parent: J["pelvis"], at: [-1.15,2,-1.3], dir: [-0.3,-0.6,0.7], role: "leg", group: "legs" });
  J["kneeHR"] = b.joint("kneeHR", { parent: J["hipHR"], at: [-1.55,1.3,-0.65], dir: [0.1,-0.45,-1.1], role: "leg", group: "legs" });
  J["hockHR"] = b.joint("hockHR", { parent: J["kneeHR"], at: [-1.45,0.85,-1.75], dir: [0,-0.7,0.35], role: "leg", group: "legs" });
  J["pawHR"] = b.joint("pawHR", { parent: J["hockHR"], at: [-1.4,0.15,-1.3], dir: [0,0,1], role: "leg", group: "legs" });
  J["neckC1"] = b.joint("neckC1", { parent: J["chest"], at: [0,2.9,1.5], dir: [0,0.8,0.4], role: "neck", group: "headC" });
  J["neckC2"] = b.joint("neckC2", { parent: J["neckC1"], at: [0,3.6,1.8], dir: [0,0.7,0.2], role: "neck", group: "headC" });
  J["neckC3"] = b.joint("neckC3", { parent: J["neckC2"], at: [0,4.3,1.95], dir: [0,0.5,0.25], role: "neck", group: "headC" });
  J["neckC4"] = b.joint("neckC4", { parent: J["neckC3"], at: [0,4.8,2.2], dir: [0,0.2,0.4], role: "neck", group: "headC" });
  J["headC"] = b.joint("headC", { parent: J["neckC4"], at: [0,5,2.6], dir: [0,-0.12,1], role: "head", group: "headC" });
  J["jawC"] = b.joint("jawC", { parent: J["headC"], at: [0,4.85,2.85], dir: [0,-0.05,1], role: "jaw", group: "headC" });
  J["neckIL1"] = b.joint("neckIL1", { parent: J["chest"], at: [0.9,2.8,1.5], dir: [0.3,0.7,0.3], role: "neck", group: "headsInner" });
  J["neckIL2"] = b.joint("neckIL2", { parent: J["neckIL1"], at: [1.3,3.4,1.8], dir: [0.3,0.6,0.2], role: "neck", group: "headsInner" });
  J["neckIL3"] = b.joint("neckIL3", { parent: J["neckIL2"], at: [1.65,3.95,2], dir: [0.25,0.5,0.25], role: "neck", group: "headsInner" });
  J["neckIL4"] = b.joint("neckIL4", { parent: J["neckIL3"], at: [1.9,4.35,2.25], dir: [0.1,0.2,0.4], role: "neck", group: "headsInner" });
  J["headIL"] = b.joint("headIL", { parent: J["neckIL4"], at: [2,4.5,2.6], dir: [0.12,-0.12,1], role: "head", group: "headsInner" });
  J["jawIL"] = b.joint("jawIL", { parent: J["headIL"], at: [2.02,4.38,2.8], dir: [0.1,-0.05,1], role: "jaw", group: "headsInner" });
  J["neckIR1"] = b.joint("neckIR1", { parent: J["chest"], at: [-0.9,2.8,1.5], dir: [-0.3,0.7,0.3], role: "neck", group: "headsInner" });
  J["neckIR2"] = b.joint("neckIR2", { parent: J["neckIR1"], at: [-1.3,3.4,1.8], dir: [-0.3,0.6,0.2], role: "neck", group: "headsInner" });
  J["neckIR3"] = b.joint("neckIR3", { parent: J["neckIR2"], at: [-1.65,3.95,2], dir: [-0.25,0.5,0.25], role: "neck", group: "headsInner" });
  J["neckIR4"] = b.joint("neckIR4", { parent: J["neckIR3"], at: [-1.9,4.35,2.25], dir: [-0.1,0.2,0.4], role: "neck", group: "headsInner" });
  J["headIR"] = b.joint("headIR", { parent: J["neckIR4"], at: [-2,4.5,2.6], dir: [-0.12,-0.12,1], role: "head", group: "headsInner" });
  J["jawIR"] = b.joint("jawIR", { parent: J["headIR"], at: [-2.02,4.38,2.8], dir: [-0.1,-0.05,1], role: "jaw", group: "headsInner" });
  J["neckOL1"] = b.joint("neckOL1", { parent: J["chest"], at: [1.3,2.7,1.4], dir: [0.7,0.3,0.2], role: "neck", group: "headsOuter" });
  J["neckOL2"] = b.joint("neckOL2", { parent: J["neckOL1"], at: [2,3,1.6], dir: [0.6,0.3,0.3], role: "neck", group: "headsOuter" });
  J["neckOL3"] = b.joint("neckOL3", { parent: J["neckOL2"], at: [2.55,3.3,1.9], dir: [0.3,0.2,0.3], role: "neck", group: "headsOuter" });
  J["neckOL4"] = b.joint("neckOL4", { parent: J["neckOL3"], at: [2.85,3.5,2.2], dir: [0.1,0.1,0.35], role: "neck", group: "headsOuter" });
  J["headOL"] = b.joint("headOL", { parent: J["neckOL4"], at: [2.95,3.55,2.55], dir: [0.3,-0.15,1], role: "head", group: "headsOuter" });
  J["jawOL"] = b.joint("jawOL", { parent: J["headOL"], at: [3,3.45,2.72], dir: [0.3,-0.1,1], role: "jaw", group: "headsOuter" });
  J["neckOR1"] = b.joint("neckOR1", { parent: J["chest"], at: [-1.3,2.7,1.4], dir: [-0.7,0.3,0.2], role: "neck", group: "headsOuter" });
  J["neckOR2"] = b.joint("neckOR2", { parent: J["neckOR1"], at: [-2,3,1.6], dir: [-0.6,0.3,0.3], role: "neck", group: "headsOuter" });
  J["neckOR3"] = b.joint("neckOR3", { parent: J["neckOR2"], at: [-2.55,3.3,1.9], dir: [-0.3,0.2,0.3], role: "neck", group: "headsOuter" });
  J["neckOR4"] = b.joint("neckOR4", { parent: J["neckOR3"], at: [-2.85,3.5,2.2], dir: [-0.1,0.1,0.35], role: "neck", group: "headsOuter" });
  J["headOR"] = b.joint("headOR", { parent: J["neckOR4"], at: [-2.95,3.55,2.55], dir: [-0.3,-0.15,1], role: "head", group: "headsOuter" });
  J["jawOR"] = b.joint("jawOR", { parent: J["headOR"], at: [-3,3.45,2.72], dir: [-0.3,-0.1,1], role: "jaw", group: "headsOuter" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
