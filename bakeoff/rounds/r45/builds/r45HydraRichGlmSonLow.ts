import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, offset, glow } from "../../../../src/index";
import { glow as glowKit } from "../../../../kits/glow";

export const meta = {
  "name": "The Five-Mawed Hydra",
  "description": "A God of War style five-headed hydra: a heavy serpent torso coiled on the ground, a spiked tail sweeping back, five scaled necks fanning up to armored skulls with hinged jaws, glowing ember eyes, gold-fitted bone plating and glowing teal runes along every spine."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  scale: "#3d5a4a",
  scaleDark: "#24352c",
  scaleBelly: "#b3ab8c",
  bone: "#d9cbaa",
  boneDark: "#8f8570",
  horn: "#cfc4a6",
  gold: "#c9973c",
  goldDark: "#7a5a22",
  ember: "#ff7a26",
  emberCore: "#ffd23f",
  crimson: "#7a1f26",
  claw: "#e8e0c8",
  rune: "#2fd8c8",
  ink: "#141a17",
  tooth: "#efe8d4",
};
const M = {
  neckRootC: [0, 1.5, 0.6] as [number, number, number],
  neckRootML: [0.8, 1.35, 0.35] as [number, number, number],
  neckRootMR: [-0.8, 1.35, 0.35] as [number, number, number],
  neckRootOL: [1.55, 1.15, 0.05] as [number, number, number],
  neckRootOR: [-1.55, 1.15, 0.05] as [number, number, number],
  headC: [0, 3.05, 1.5] as [number, number, number],
  headML: [1.05, 2.8, 1.35] as [number, number, number],
  headMR: [-1.05, 2.8, 1.35] as [number, number, number],
  headOL: [1.95, 2.35, 1.05] as [number, number, number],
  headOR: [-1.95, 2.35, 1.05] as [number, number, number],
  tailRoot: [0, 0.75, -1] as [number, number, number],
  spineTop: [0, 1.5, 0.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: any) {
  const R = rng(11);
  const body = J.body, t1 = J.tail1, t2 = J.tail2;

  // Torso loft: chest at z=2.2 back to tail root at z=-1
  const stations = [
    { at: [0, 0.55, 2.2], w: 0.9, h: 0.8 },
    { at: [0, 0.85, 1.4], w: 1.9, h: 1.5 },
    { at: [0, 1.0, 0.3], w: 2.5, h: 2.0 },
    { at: [0, 0.95, -0.4], w: 2.0, h: 1.75 },
    { at: [0, 0.78, -1.0], w: 1.1, h: 1.2 },
  ];
  const torso = b.loft(stations, {
    bone: [t1, body],
    color: P.scale,
    sectors: [[125, 235, P.scaleBelly]],
    sides: 10,
  });

  // belly plates with ember glow near chest
  for (let i = 0; i < 5; i++) {
    const z = 2.0 - i * 0.28;
    b.part(new THREE.BoxGeometry(0.9 - i * 0.05, 0.05, 0.1), P.ember, {
      bone: body, at: [0, 0.1 + i * 0.02, z], flat: true,
    });
    b.part(new THREE.BoxGeometry(1.0 - i * 0.05, 0.04, 0.05), P.ink, {
      bone: body, at: [0, 0.09 + i * 0.02, z + 0.08], flat: true,
    });
  }

  // gold collars at neck roots
  for (const k of ["neckRootC", "neckRootML", "neckRootMR", "neckRootOL", "neckRootOR"]) {
    const m = M[k];
    b.part(new THREE.TorusGeometry(0.34, 0.06, 6, 10), P.gold, {
      bone: body, at: [m[0], m[1] - 0.02, m[2]], rotation: [90, 0, 0], flat: true,
    });
  }

  // scale studs on upper flanks
  const skin = b.surface(torso);
  const hits = skin.scatter(70, { rng: R, minDist: 0.22, filter: (h: any) => h.n.y > 0.1 });
  for (const h of hits)
    b.stick(new THREE.ConeGeometry(0.06, 0.1, 5), P.scaleDark, h, { embed: 0.3 });

  // tail
  const tailPath = catmull([
    [0, 0.75, -1], [0, 0.65, -1.6], [0, 0.55, -2], [0.1, 0.35, -2.6], [0.35, 0.22, -3.1],
  ]);
  const tail = b.sweep(tailPath, [0.55, 0.05], {
    bone: [t1, t2],
    color: P.scale,
    sectors: [[125, 235, P.scaleBelly]],
    sides: 8,
  });
  b.along(tail, 6, (at: any) => {
    b.stick(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8), P.scaleDark, at, { embed: -0.1 });
  });
  for (const j of [t1, t2]) {
    b.part(new THREE.TorusGeometry(0.4, 0.03, 5, 10), P.ink, {
      bone: j, at: [j.at.x, j.at.y, j.at.z], rotation: [90, 0, 0], flat: true,
    });
  }
  // tail club spikes
  const tip = [0.35, 0.22, -3.1];
  b.part(new THREE.SphereGeometry(0.14, 6, 4), P.bone, { bone: t2, at: tip, flat: true });
  const dirs = [[0, 1, -0.3], [0.8, 0.3, -0.2], [-0.8, 0.3, -0.2], [0, 0.1, -1]];
  for (const d of dirs)
    b.spike(tip, d, 0.32, 0.06, { bone: t2, color: P.bone });

  // fore-limbs
  for (const s of [1, -1]) {
    const shoulder = [s * 1.1, 0.85, 1.6];
    const foot = [s * 1.4, 0.1, 1.9];
    const arm = b.chain(`torsoArm${s > 0 ? "L" : "R"}`, catmull([shoulder, [s * 1.35, 0.5, 1.7], foot]), {
      parent: body, names: [`torsoShoulder${s}`.replace("-", "R"), `torsoElbow${s}`.replace("-", "R"), `torsoWrist${s}`.replace("-", "R")], role: "arm",
    });
    b.sweep(arm, [0.3, 0.17], { color: P.scale });
    b.part(new THREE.SphereGeometry(0.24, 7, 5), P.scaleDark, {
      bone: arm.tip ?? body, at: [foot[0], 0.2, foot[2]], scale: [1.1, 0.7, 1.4], flat: true,
    });
    b.part(new THREE.TorusGeometry(0.2, 0.04, 5, 8), P.gold, {
      bone: body, at: [s * 1.3, 0.62, 1.68], rotation: [90, 0, 0], flat: true,
    });
    for (const a of [-0.5, 0, 0.5]) {
      b.spike([foot[0] + a * 0.25, 0.12, foot[2] + 0.2], [a * 0.6, -0.15, 1], 0.3, 0.05, {
        bone: arm.tip ?? body, color: P.claw,
      });
    }
  }
}
    return buildTorso;
  })(),
  // necks
  (() => {
type Ctx = { b: any; J: any; P: any; M: any };

function buildNecks({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const necks = [
    { id: "C", root: M.neckRootC, joints: ["neckC1", "neckC2", "neckC3"], head: M.headC, r: 0.34, mid: [0, 2.3, 0.95], s: 0 },
    { id: "ML", root: M.neckRootML, joints: ["neckML1", "neckML2", "neckML3"], head: M.headML, r: 0.26, mid: [1.35, 2.1, 0.55], s: 1 },
    { id: "MR", root: M.neckRootMR, joints: ["neckMR1", "neckMR2", "neckMR3"], head: M.headMR, r: 0.26, mid: [-1.35, 2.1, 0.55], s: -1 },
    { id: "OL", root: M.neckRootOL, joints: ["neckOL1", "neckOL2"], head: M.headOL, r: 0.2, mid: [2.3, 1.75, 0.3], s: 1 },
    { id: "OR", root: M.neckRootOR, joints: ["neckOR1", "neckOR2"], head: M.headOR, r: 0.2, mid: [-2.3, 1.75, 0.3], s: -1 },
  ];
  for (const n of necks) {
    const path = catmull([n.root, n.mid, n.head]);
    const chainBones = n.joints.map((j: string) => J[j]);
    const tube = b.sweep(path, (t: number) => n.r * (1.15 - 0.45 * t), {
      bone: chainBones,
      color: P.scale,
      sectors: [[125, 235, P.scaleBelly]],
      sides: 8,
    });
    // root gold collar and mid collar
    for (const t of [0.04, 0.5]) {
      const at = tube.at(t, 0);
      const rr = n.r * (1.15 - 0.45 * t) * 1.08;
      b.stick(new THREE.CylinderGeometry(rr, rr, 0.07, 8), P.gold, at, { embed: 0.5 });
      const ring = b.ring(path.at(t) ? frame(path.at(t), path.tangentAt(t)) : at, { count: 0 });
    }
    // outer-curve ridges
    for (let i = 1; i <= 6; i++) {
      const t = 0.12 + i * 0.12;
      const hit = tube.at(t, n.s === 0 ? 0 : n.s * 40 + 0);
      b.stick(new THREE.ConeGeometry(0.05, 0.14, 5), P.scaleDark, hit, { embed: 0.15 });
    }
    // inner-curve studs
    for (let i = 0; i < 3; i++) {
      const hit = tube.at(0.25 + i * 0.2, n.s === 0 ? 90 : -n.s * 70);
      b.stick(new THREE.SphereGeometry(0.035, 5, 4), P.scaleDark, hit, { embed: 0.3 });
    }
    // crimson throat patch facing forward under head
    const th = tube.at(0.9, 150);
    b.stick(new THREE.BoxGeometry(n.r * 0.9, 0.02, n.r * 1.2), P.crimson, th, { embed: 0.4 });
    // ink seam ring near head
    const sm = tube.at(0.8, 0);
    b.stick(new THREE.CylinderGeometry(n.r * 0.7, n.r * 0.7, 0.025, 8), P.ink, sm, { embed: 0.5 });
  }
}
    return buildNecks;
  })(),
  // heads
  (() => {
function buildHeads({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const heads = [
    { n: "C", s: 1.0, x: 0, jx: 0 },
    { n: "ML", s: 0.8, x: 1, jx: 0.1 },
    { n: "MR", s: 0.8, x: -1, jx: -0.1 },
    { n: "OL", s: 0.7, x: 1, jx: 0.15 },
    { n: "OR", s: 0.7, x: -1, jx: -0.15 },
  ];
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cone = (r: number, h: number, seg = 5) => new THREE.ConeGeometry(r, h, seg);

  for (const hd of heads) {
    const head = J["head" + hd.n];
    const jaw = J["jaw" + hd.n];
    const m = M["head" + hd.n];
    const S = hd.s;
    // local helper: position relative to head mount (x right-left in model space, y up, z forward)
    const p = (x: number, y: number, z: number): [number, number, number] => [m[0] + x * S, m[1] + y * S, m[2] + z * S];
    const put = (g: THREE.BufferGeometry, c: string, bone: any, at: [number, number, number], rot?: [number, number, number]) =>
      b.part(g, c, { bone, at, rotation: rot, flat: true });

    // skull cap and snout (upper jaw)
    put(box(0.34 * S, 0.22 * S, 0.34 * S), P.scale, head, p(0, 0.02, 0.02));
    put(box(0.24 * S, 0.12 * S, 0.34 * S), P.scale, head, p(0, -0.01, 0.26));
    put(box(0.2 * S, 0.04 * S, 0.3 * S), P.scale, head, p(0, 0.06, 0.28));
    // bone brow ridge and nose bridge
    put(box(0.38 * S, 0.05 * S, 0.14 * S), P.bone, head, p(0, 0.13, 0.12));
    put(box(0.08 * S, 0.03 * S, 0.2 * S), P.bone, head, p(0, 0.09, 0.3));
    put(box(0.07 * S, 0.025 * S, 0.12 * S), P.boneDark, head, p(0, 0.075, 0.44));
    // gold rear band
    put(box(0.37 * S, 0.24 * S, 0.04 * S), P.gold, head, p(0, 0.02, -0.14));
    put(box(0.38 * S, 0.02 * S, 0.05 * S), P.goldDark, head, p(0, 0.13, -0.14));
    // upper mouth interior and lip seam
    put(box(0.2 * S, 0.02 * S, 0.3 * S), P.crimson, head, p(0, -0.065, 0.26));
    for (const s of [1, -1]) {
      put(box(0.012 * S, 0.012 * S, 0.34 * S), P.ink, head, p(s * 0.125, -0.06, 0.27));
      // eyes
      put(new THREE.SphereGeometry(0.035 * S, 6, 4), P.ember, head, p(s * 0.15, 0.08, 0.2));
      put(new THREE.SphereGeometry(0.014 * S, 5, 4), P.emberCore, head, p(s * 0.165, 0.09, 0.225));
      put(box(0.05 * S, 0.02 * S, 0.07 * S), P.boneDark, head, p(s * 0.15, 0.125, 0.2));
      // cheek studs
      put(new THREE.SphereGeometry(0.018 * S, 5, 4), P.gold, head, p(s * 0.175, -0.02, 0.0));
      // nostrils
      put(box(0.02 * S, 0.01 * S, 0.04 * S), P.ink, head, p(s * 0.05, 0.085, 0.4));
      // horns: 3 segments swept back and out
      for (let i = 0; i < 3; i++) {
        const t = i / 3;
        const g = cone((0.04 - i * 0.01) * S, 0.14 * S, 5);
        put(g, i === 2 ? P.boneDark : P.horn, head, p(s * (0.1 + t * 0.12), 0.15 + t * 0.07, -0.05 - t * 0.12), [-70, 0, s * -25]);
      }
      // upper fangs and teeth
      for (const z of [0.4, 0.34]) {
        put(cone(0.018 * S, (z > 0.38 ? 0.1 : 0.05) * S, 5), P.tooth, head, p(s * 0.1, -0.1, z), [180, 0, 0]);
      }
      for (let i = 0; i < 4; i++)
        put(cone(0.012 * S, 0.04 * S, 4), P.tooth, head, p(s * 0.105, -0.085, 0.1 + i * 0.07), [180, 0, 0]);
    }
    put(box(0.1 * S, 0.02 * S, 0.02 * S), P.ink, head, p(0, -0.065, 0.43));
    // central/third horn
    if (hd.n === "C") {
      put(cone(0.05 * S, 0.3 * S, 5), P.horn, head, p(0, 0.2, -0.05), [-25, 0, 0]);
      put(box(0.06 * S, 0.02 * S, 0.1 * S), P.gold, head, p(0, 0.14, 0.0));
    }
    // lower jaw
    const jp = (x: number, y: number, z: number) => p(x, y - 0.12, z);
    put(box(0.2 * S, 0.06 * S, 0.4 * S), P.scaleDark, jaw, jp(0, 0.0, 0.28));
    put(box(0.16 * S, 0.02 * S, 0.34 * S), P.crimson, jaw, jp(0, 0.04, 0.28));
    put(box(0.1 * S, 0.02 * S, 0.14 * S), P.ember, jaw, jp(0, 0.05, 0.06));
    put(box(0.14 * S, 0.03 * S, 0.1 * S), P.scaleBelly, jaw, jp(0, -0.04, 0.4));
    put(box(0.17 * S, 0.05 * S, 0.06 * S), P.boneDark, jaw, jp(0, -0.02, 0.5));
    for (const s of [1, -1]) {
      put(box(0.012 * S, 0.012 * S, 0.38 * S), P.ink, jaw, jp(s * 0.102, 0.01, 0.28));
      for (let i = 0; i < 4; i++)
        put(cone(0.012 * S, 0.04 * S, 4), P.tooth, jaw, jp(s * 0.085, 0.07, 0.15 + i * 0.07));
      put(cone(0.018 * S, 0.09 * S, 5), P.tooth, jaw, jp(s * 0.075, 0.1, 0.46));
    }
  }
}
    return buildHeads;
  })(),
  // armor
  (() => {
function buildArmor({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // generic plate: faceted slab with gold trim, on a bone
  function plate(at: number[], w: number, h: number, d: number, bone: any, tilt = 0, rune = false) {
    const g = new THREE.BoxGeometry(w, h, d);
    b.part(g, P.bone, { bone, at, rotation: [tilt, 0, 0], flat: true });
    b.part(new THREE.BoxGeometry(w * 1.04, h * 0.18, d * 1.04), P.boneDark, {
      bone, at: [at[0], at[1] - h * 0.5, at[2]], rotation: [tilt, 0, 0], flat: true,
    });
    b.part(new THREE.BoxGeometry(w * 1.06, h * 0.08, d * 1.06), P.gold, {
      bone, at: [at[0], at[1] - h * 0.34, at[2]], rotation: [tilt, 0, 0], flat: true,
    });
    if (rune) {
      const y = at[1] + h * 0.5 + 0.01;
      const parts = [
        new THREE.BoxGeometry(0.04, 0.01, 0.26),
        new THREE.BoxGeometry(0.2, 0.01, 0.04),
        new THREE.BoxGeometry(0.04, 0.01, 0.14),
      ];
      const offs = [[0, 0, 0], [0, 0, 0.04], [0.08, 0, -0.06]];
      parts.forEach((g2, i) =>
        glowKit(b.part(g2, P.rune, { bone, at: [at[0] + offs[i][0], y, at[2] + offs[i][2]] }), 1.4),
      );
    }
  }

  function spike(at: number[], len: number, r: number, bone: any, dir: number[] = [0, 1, 0]) {
    b.part(new THREE.ConeGeometry(r, len, 6), P.bone, { bone, at, dir, flat: true });
    const tip = v(...at).addScaledVector(v(...dir).normalize(), len * 0.3);
    b.part(new THREE.ConeGeometry(r * 0.45, len * 0.45, 6), P.ink, {
      bone, at: [tip.x, tip.y, tip.z], dir, flat: true,
    });
    b.part(new THREE.CylinderGeometry(r * 1.15, r * 1.3, len * 0.1, 6), P.gold, {
      bone, at: [at[0], at[1] - len * 0.4, at[2]], flat: true,
    });
  }

  // torso dorsal plates: chest to tail root
  const zs = [1.45, 0.95, 0.4, -0.15, -0.7];
  const ys = [1.78, 2.02, 2.1, 1.98, 1.72];
  zs.forEach((z, i) => {
    const s = 1 - Math.abs(i - 2) * 0.12;
    plate([0, ys[i], z], 0.95 * s, 0.14, 0.62, J.body, -8 + i * 4, i === 1 || i === 2);
    if (i % 2 === 0) spike([0, ys[i] + 0.16, z], 0.42 * s, 0.09, J.body, [0, 1, -0.25]);
  });
  // side flank ridge studs
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      b.part(new THREE.ConeGeometry(0.07, 0.2, 5), P.boneDark, {
        bone: J.body, at: [s * (0.85 - i * 0.04), 1.85 - i * 0.05, 1.1 - i * 0.55],
        dir: [s * 0.8, 0.6, 0], flat: true,
      });

  // tail spikes shrinking
  const tailPts: [any, number[], number][] = [
    [J.tail1, [0, 1.0, -1.3], 0.34],
    [J.tail1, [0, 0.9, -1.75], 0.28],
    [J.tail2, [0, 0.72, -2.2], 0.22],
    [J.tail2, [0.03, 0.55, -2.6], 0.16],
    [J.tail2, [0.06, 0.4, -2.95], 0.1],
  ];
  tailPts.forEach(([bn, p, l], i) => spike(p, l, 0.07 - i * 0.01, bn, [0, 1, -0.3]));

  // neck scutes
  const necks: [any[], number[][], number][] = [
    [[J.neckC1, J.neckC2, J.neckC3], [[0, 1.95, 0.5], [0, 2.4, 0.95], [0, 2.85, 1.2], [0, 3.05, 1.3]], 0],
    [[J.neckML1, J.neckML2, J.neckML3], [[0.9, 1.75, 0.2], [1.2, 2.3, 0.55], [1.45, 2.7, 0.8], [1.2, 2.9, 1.1]], 1],
    [[J.neckMR1, J.neckMR2, J.neckMR3], [[-0.9, 1.75, 0.2], [-1.2, 2.3, 0.55], [-1.45, 2.7, 0.8], [-1.2, 2.9, 1.1]], -1],
    [[J.neckOL1, J.neckOL2, J.neckOL2], [[1.75, 1.5, -0.1], [2.25, 1.95, 0.2], [2.45, 2.3, 0.6], [2.2, 2.5, 0.9]], 1],
    [[J.neckOR1, J.neckOR2, J.neckOR2], [[-1.75, 1.5, -0.1], [-2.25, 1.95, 0.2], [-2.45, 2.3, 0.6], [-2.2, 2.5, 0.9]], -1],
  ];
  necks.forEach(([bones, pts, s]) => {
    pts.forEach((p, i) => {
      const bn = bones[Math.min(i, bones.length - 1)];
      const sc = 1 - i * 0.12;
      const out = s * 0.0;
      b.part(new THREE.BoxGeometry(0.2 * sc, 0.06, 0.2 * sc), P.bone, {
        bone: bn, at: [p[0] + out, p[1], p[2] - 0.12], rotation: [-25, 0, s * -10], flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.1 * sc, 0.11 * sc, 0.035, 6), P.gold, {
        bone: bn, at: [p[0], p[1] - 0.05, p[2] - 0.1], rotation: [-25, 0, 0], flat: true,
      });
      if (i >= 2)
        spike([p[0], p[1] + 0.1, p[2] - 0.15], 0.16, 0.035, bn, [s * 0.2, 1, -0.4]);
    });
  });

  // crest crowns
  function crest(bone: any, base: number[], n: number, size: number) {
    for (let i = 0; i < n; i++) {
      const a = (i - (n - 1) / 2) * 0.42;
      const len = size * (1 - Math.abs(a) * 0.35);
      const dir = [Math.sin(a), Math.cos(a) * 0.9, -0.45];
      const d = v(...dir).normalize();
      const c = v(...base).addScaledVector(d, len * 0.5);
      b.part(new THREE.ConeGeometry(size * 0.16, len, 4), P.bone, {
        bone, at: [c.x, c.y, c.z], dir, flat: true,
      });
      const t = v(...base).addScaledVector(d, len * 0.85);
      b.part(new THREE.ConeGeometry(size * 0.07, len * 0.3, 4), P.boneDark, {
        bone, at: [t.x, t.y, t.z], dir, flat: true,
      });
    }
    b.part(new THREE.BoxGeometry(size * 0.9, size * 0.12, size * 0.25), P.gold, {
      bone, at: [base[0], base[1] - 0.01, base[2]], flat: true,
    });
  }
  crest(J.headC, [M.headC[0], M.headC[1] + 0.2, M.headC[2] - 0.25], 5, 0.6);
  crest(J.headML, [M.headML[0], M.headML[1] + 0.15, M.headML[2] - 0.2], 3, 0.38);
  crest(J.headMR, [M.headMR[0], M.headMR[1] + 0.15, M.headMR[2] - 0.2], 3, 0.38);
}
    return buildArmor;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hydra" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.95,0.3], dir: [0,1,0], role: "spine" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,0.75,-1], dir: [0,-0.15,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.55,-2], dir: [0.1,-0.25,-1], role: "tail" });
  J["neckC1"] = b.joint("neckC1", { parent: J["body"], at: [0,1.5,0.6], dir: [0,0.85,0.53], role: "neck" });
  J["neckC2"] = b.joint("neckC2", { parent: J["neckC1"], at: [0,2.15,1], dir: [0,0.95,0.32], role: "neck" });
  J["neckC3"] = b.joint("neckC3", { parent: J["neckC2"], at: [0,2.75,1.25], dir: [0,0.9,0.45], role: "neck" });
  J["neckML1"] = b.joint("neckML1", { parent: J["body"], at: [0.8,1.35,0.35], dir: [0.25,0.9,0.36], role: "neck" });
  J["neckML2"] = b.joint("neckML2", { parent: J["neckML1"], at: [1.15,2,0.6], dir: [0.3,0.9,0.3], role: "neck" });
  J["neckML3"] = b.joint("neckML3", { parent: J["neckML2"], at: [1.4,2.55,0.85], dir: [0.25,0.85,0.45], role: "neck" });
  J["neckMR1"] = b.joint("neckMR1", { parent: J["body"], at: [-0.8,1.35,0.35], dir: [-0.25,0.9,0.36], role: "neck" });
  J["neckMR2"] = b.joint("neckMR2", { parent: J["neckMR1"], at: [-1.15,2,0.6], dir: [-0.3,0.9,0.3], role: "neck" });
  J["neckMR3"] = b.joint("neckMR3", { parent: J["neckMR2"], at: [-1.4,2.55,0.85], dir: [-0.25,0.85,0.45], role: "neck" });
  J["neckOL1"] = b.joint("neckOL1", { parent: J["body"], at: [1.55,1.15,0.05], dir: [0.6,0.8,0.1], role: "neck" });
  J["neckOL2"] = b.joint("neckOL2", { parent: J["neckOL1"], at: [2.15,1.7,0.2], dir: [0.5,0.8,0.33], role: "neck" });
  J["neckOR1"] = b.joint("neckOR1", { parent: J["body"], at: [-1.55,1.15,0.05], dir: [-0.6,0.8,0.1], role: "neck" });
  J["neckOR2"] = b.joint("neckOR2", { parent: J["neckOR1"], at: [-2.15,1.7,0.2], dir: [-0.5,0.8,0.33], role: "neck" });
  J["headC"] = b.joint("headC", { parent: J["neckC3"], at: [0,3.05,1.5], dir: [0,0.2,1], role: "head" });
  J["jawC"] = b.joint("jawC", { parent: J["headC"], at: [0,2.95,1.62], dir: [0,0.1,1], role: "jaw" });
  J["headML"] = b.joint("headML", { parent: J["neckML3"], at: [1.05,2.8,1.35], dir: [0.1,0.2,1], role: "head" });
  J["jawML"] = b.joint("jawML", { parent: J["headML"], at: [1.05,2.71,1.46], dir: [0.1,0.1,1], role: "jaw" });
  J["headMR"] = b.joint("headMR", { parent: J["neckMR3"], at: [-1.05,2.8,1.35], dir: [-0.1,0.2,1], role: "head" });
  J["jawMR"] = b.joint("jawMR", { parent: J["headMR"], at: [-1.05,2.71,1.46], dir: [-0.1,0.1,1], role: "jaw" });
  J["headOL"] = b.joint("headOL", { parent: J["neckOL2"], at: [1.95,2.35,1.05], dir: [0.15,0.2,1], role: "head" });
  J["jawOL"] = b.joint("jawOL", { parent: J["headOL"], at: [1.95,2.27,1.16], dir: [0.15,0.1,1], role: "jaw" });
  J["headOR"] = b.joint("headOR", { parent: J["neckOR2"], at: [-1.95,2.35,1.05], dir: [-0.15,0.2,1], role: "head" });
  J["jawOR"] = b.joint("jawOR", { parent: J["headOR"], at: [-1.95,2.27,1.16], dir: [-0.15,0.1,1], role: "jaw" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
