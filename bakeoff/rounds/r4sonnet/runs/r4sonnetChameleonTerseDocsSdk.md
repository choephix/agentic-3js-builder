```ts
import * as THREE from "three";
import type { OutlinePoint } from "agentic-3js-builder";
import {
  catmull,
  countershade,
  createBuilder,
  gradient,
  grain,
  limb,
  mottle,
  paint,
  rng,
  spiral,
  spots,
  stripes,
} from "agentic-3js-builder";

export const meta = {
  name: "Chameleon",
  description:
    "A stylized panther/veiled chameleon on a mossy bough: laterally flattened striped body, tall casque, turret eyes with scale rosettes, pincer feet gripping the branch, a spiral-curled tail, a twig with leaves and berries. Fully rigged, with a separate jaw.",
};

type V3 = [number, number, number];
type Key = [number, number, number];
const v = (x: number, y: number, z: number): V3 => [x, y, z];

// piecewise-linear profile lookup: keys are [t, a, b]
const prof = (t: number, keys: Key[]): [number, number] => {
  const first = keys[0]!;
  if (t <= first[0]) return [first[1], first[2]];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1]!;
    const c = keys[i]!;
    if (t <= c[0]) {
      const u = (t - a[0]) / (c[0] - a[0]);
      return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
    }
  }
  const last = keys[keys.length - 1]!;
  return [last[1], last[2]];
};

// ---------- palette ----------
const GREEN = "#6cc24a";
const GREEN_D = "#3a9248";
const TEAL = "#2fb9a6";
const YELLOW = "#f3d54a";
const BELLY = "#e6efae";
const CREAM = "#f7f0bd";
const ORANGE = "#f28b2e";
const ORANGE_D = "#e3622a";
const DARK = "#1f1c19";
const MOUTH = "#4a2b2b";
const CLAW = "#eadfc4";
const CREST = "#f2b640";
const LID = "#b8dc6c";
const IRIS = "#f0b82e";
const BUMP = "#fff0a8";
const RIDGE = "#c9e46c";
const BARK_A = "#6e4b2e";
const BARK_B = "#82593a";
const BARK_C = "#4a301d";
const WOOD_A = "#d9b57e";
const WOOD_B = "#c19a62";
const MOSS = "#66a23e";
const MOSS_D = "#3f7a33";
const LEAF = "#2f8f46";
const LEAF_2 = "#4aa83e";
const LEAF_L = "#8fd16b";
const LEAF_VEIN = "#cdeb94";
const BERRY = "#e5482e";

// ---------- branch geometry shared constants ----------
const BR = 0.05; // branch radius, axis at y = BR so it rests on the floor
const topY = (x: number) => BR + Math.sqrt(Math.max(0, BR * BR - x * x));
const WY = topY(0.028) + 0.01; // wrist height over the branch

export default function build() {
  const b = createBuilder({ name: "chameleon" });
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const bump = (r: number) => new THREE.SphereGeometry(r, 6, 4).scale(1, 0.55, 1);

  // ---------- paints ----------
  const bars = stripes(
    stripes(GREEN, TEAL, { size: 0.058, width: 0.3, wobble: 0.5, seed: 2 }),
    YELLOW,
    { size: 0.116, width: 0.12, wobble: 0.6, seed: 7 },
  );
  const dorsal = countershade(bars, BELLY, { level: -0.3, soft: 0.3 });
  const freckled = spots(dorsal, ORANGE, { size: 0.03, amount: 0.1, seed: 5 });
  const coat = paint((p, n) => {
    const onFlank = p.z > -0.075 && p.z < 0.125 && p.y > 0.15 && p.y < 0.22 && Math.abs(p.x) < 0.05;
    if (onFlank && Math.abs(n.y) < 0.18 && Math.abs(n.x) > 0.8) return CREAM;
    return freckled;
  });
  const jawCoat = countershade(coat, BELLY, { level: -0.15, soft: 0.3 });
  const tailCoat = paint((_p, _n, s) => {
    const a = ((s[1] % 360) + 360) % 360;
    const belly = a > 105 && a < 255;
    const ring = Math.floor(s[0] * 24) % 3;
    if (s[0] > 0.94) return ORANGE;
    if (belly) return ring === 0 ? "#cfe38d" : BELLY;
    return ring === 0 ? TEAL : ring === 1 ? GREEN : GREEN_D;
  });
  const barkBody = mottle(grain(BARK_A, BARK_B, { size: 0.009, axis: "z" }), BARK_C, {
    size: 0.07,
    contrast: 0.6,
    seed: 4,
  });
  const bark = paint((p, n) => {
    if (Math.abs(n.z) > 0.85) {
      return Math.floor(Math.hypot(p.x, p.y - BR) / 0.006) % 2 === 0 ? WOOD_A : WOOD_B;
    }
    return barkBody;
  });
  const mossPaint = mottle(MOSS, MOSS_D, { size: 0.015, contrast: 0.9, seed: 8 });

  // =====================================================
  // SKELETON
  // =====================================================
  const T0 = v(0, 0.186, -0.095);
  const NECK_BASE = v(0, 0.202, 0.12);
  const trunkPath = catmull([
    T0,
    v(0, 0.196, -0.04),
    v(0, 0.2, 0.02),
    v(0, 0.198, 0.075),
    NECK_BASE,
    v(0, 0.218, 0.15),
    v(0, 0.232, 0.172),
  ]);

  const hips = b.joint("hips", { at: T0, dir: [0, 0, 1], role: "spine" });
  const tNeck = trunkPath.closestT(NECK_BASE);
  const spine = b.chain("spine", trunkPath.slice(0, tNeck), { parent: hips, count: 4, role: "spine" });
  const neck = b.chain("neck", trunkPath.slice(tNeck, 1), { parent: spine, count: 3, role: "neck" });
  const chest = spine.joints[spine.joints.length - 1]!;

  const head = b.joint("head", { parent: neck, at: trunkPath.at(1), dir: [0, 0, 1], role: "head" });
  const hl = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hl(0.0, -0.022),
    aim: hl(0.108, -0.0135),
    role: "jaw",
  });

  // tail: lead-in then a spiral coil hanging off the end of the branch
  const leadIn: V3[] = [
    T0,
    v(0, 0.178, -0.15),
    v(0, 0.16, -0.2),
    v(0, 0.133, -0.243),
    v(0, 0.105, -0.268),
  ];
  const coilStart = v(0, 0.08, -0.278);
  const coilCenter = v(0, 0.08, -0.326);
  const coil = spiral(coilCenter, coilStart, [1, 0, 0], { turns: 1.15, r1: 0.019, pitch: 0.032 });
  const tailPts: V3[] = [...leadIn, coilStart];
  for (let i = 1; i <= 14; i++) {
    const p = coil.at(i / 14);
    tailPts.push(v(p.x, p.y, p.z));
  }
  const tailPath = catmull(tailPts);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 9, role: "tail" });

  // =====================================================
  // BODY
  // =====================================================
  const bodyProf: Key[] = [
    [0.0, 0.028, 0.044],
    [0.11, 0.034, 0.054],
    [0.35, 0.039, 0.063],
    [0.63, 0.04, 0.065],
    [0.79, 0.032, 0.053],
    [0.9, 0.025, 0.037],
    [1.0, 0.022, 0.03],
  ];
  const trunk = b.sweep(trunkPath, (t) => prof(t, bodyProf), {
    bone: [spine, neck],
    color: coat,
    sides: 12,
    shift: (t): [number, number] => [0, -0.012 * Math.min(1, Math.max(0, (1 - t) / 0.35))],
  });

  // dorsal crest of little cones, running up the neck
  b.along(
    trunk,
    16,
    (at) => {
      const u = Math.min(1, Math.max(0, (at.t - 0.04) / 0.86));
      const h = 0.008 + 0.016 * Math.sin(Math.PI * u);
      const root = at.moved([0, -0.004, 0]);
      b.spike(root, root, h + 0.004, 0.0068, { color: CREST, sides: 5 });
    },
    { from: 0.04, to: 0.9 },
  );

  // cream bumps along the lateral line
  for (const deg of [90, 270]) {
    for (let i = 0; i < 9; i++) {
      const t = 0.12 + i * 0.065;
      const hit = trunk.at(t, deg);
      const r = 0.0075 + 0.003 * Math.sin((i / 8) * Math.PI);
      b.stick(bump(r), YELLOW, hit, { embed: 0.45 });
    }
  }

  // hex tubercle scales scattered over the flanks
  const skin = b.surface(trunk);
  const scaleHits = skin.scatter(60, {
    rng: rng(21),
    minDist: 0.022,
    filter: (h) => h.at.z > -0.09 && h.at.z < 0.14 && h.n.y < 0.85,
  });
  scaleHits.forEach((h, i) => {
    const col = i % 4 === 0 ? ORANGE : i % 4 === 1 ? YELLOW : TEAL;
    b.stick(new THREE.CylinderGeometry(0.0062, 0.0075, 0.005, 6), col, h, {
      embed: 0.4,
      spin: i * 37,
      flat: true,
    });
  });

  // =====================================================
  // TAIL
  // =====================================================
  const tailTube = b.sweep(tail, (t) => 0.028 * Math.pow(Math.max(0, 1 - t), 1.1) + 0.007, {
    color: tailCoat,
  });
  b.along(
    tailTube,
    8,
    (at) => {
      const u = Math.min(1, Math.max(0, (at.t - 0.03) / 0.39));
      const root = at.moved([0, -0.003, 0]);
      b.spike(root, root, 0.005 + 0.011 * (1 - u), 0.005, { color: CREST, sides: 5 });
    },
    { from: 0.03, to: 0.42 },
  );

  // =====================================================
  // HEAD
  // =====================================================
  const skullProf: Key[] = [
    [0, 0.025, 0.031],
    [0.2, 0.027, 0.033],
    [0.45, 0.025, 0.03],
    [0.75, 0.017, 0.021],
    [1, 0.009, 0.011],
  ];
  const skull = b.sweep(
    catmull([hl(-0.012, 0.012), hl(0.045, 0.014), hl(0.108, 0.002)]),
    (t) => prof(t, skullProf),
    { bone: head, color: coat, sides: 8 },
  );

  // dark mouth interior filling the seam between the jaws
  const fillProf: Key[] = [
    [0, 0.019, 0.0055],
    [0.5, 0.0165, 0.005],
    [1, 0.0075, 0.003],
  ];
  b.sweep(
    catmull([hl(0.004, -0.0195), hl(0.05, -0.0165), hl(0.098, -0.0105)]),
    (t) => prof(t, fillProf),
    { bone: head, color: MOUTH, sides: 6 },
  );

  // lower jaw, its own part on the jaw joint
  const jawProf: Key[] = [
    [0, 0.021, 0.012],
    [0.4, 0.019, 0.0105],
    [0.75, 0.0135, 0.0075],
    [1, 0.007, 0.0045],
  ];
  b.sweep(
    catmull([hl(0.0, -0.0285), hl(0.052, -0.0245), hl(0.108, -0.0135)]),
    (t) => prof(t, jawProf),
    { bone: jaw, color: jawCoat, sides: 8 },
  );

  // casque: tall back-swept helmet fin
  const casqueOutline: OutlinePoint[] = [
    [0.088, 0.012, "sharp"],
    [0.056, 0.04],
    [0.02, 0.062],
    [-0.006, 0.081],
    [-0.034, 0.094, "sharp"],
    [-0.026, 0.06],
    [-0.022, 0.03],
    [-0.014, 0.012, "sharp"],
  ];
  b.extrude(casqueOutline, {
    at: hl(0, 0),
    thickness: [0.012, 0.006],
    bevel: 0.002,
    smoothing: 1,
    color: gradient(coat, ORANGE, hl(0, 0.04), hl(0, 0.095)),
    bone: head,
  });

  // brow ridges hugging the skull, and nostrils
  const sk = b.surface(skull);
  const ridgeStations: Array<[number, number]> = [
    [0.1, 0.007],
    [0.075, 0.011],
    [0.05, 0.0125],
    [0.025, 0.013],
    [0.0, 0.013],
  ];
  for (const s of [1, -1]) {
    const pts: number[][] = [];
    for (const [f, l] of ridgeStations) {
      const hit = sk.nearest(hl(f, 0.07, s * l));
      pts.push(hit.at.clone().addScaledVector(hit.n, 0.0012).toArray());
    }
    b.sweep(catmull(pts), [0.0046, 0.0034], { bone: head, color: RIDGE, sides: 6 });
    b.part(sph(0.0028, 5, 4), DARK, { at: hl(0.102, 0.0045, s * 0.0075), bone: head });
  }

  // turret eyes with lid ring, iris, pupil, glint and scale rosettes
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const gaze = new THREE.Vector3(s * 0.72, 0.1, 0.68).normalize();
    const ec = hl(0.034, 0.02, s * 0.03);
    const eye = b.joint(`eye${S}`, { parent: head, at: ec, dir: gaze });
    const side = new THREE.Vector3().crossVectors(gaze, new THREE.Vector3(0, 1, 0)).normalize();
    const upv = new THREE.Vector3().crossVectors(side, gaze).normalize();
    const spot = (d: number, a = 0, c = 0) =>
      ec.clone().addScaledVector(gaze, d).addScaledVector(side, a).addScaledVector(upv, c);

    b.part(sph(0.022, 10, 8), coat, { at: ec, bone: eye });
    b.part(new THREE.TorusGeometry(0.0118, 0.0032, 5, 12), LID, {
      at: spot(0.0187),
      dir: gaze,
      axis: "z",
      bone: eye,
    });
    b.part(new THREE.CylinderGeometry(0.0098, 0.0098, 0.004, 10), IRIS, {
      at: spot(0.0212),
      dir: gaze,
      bone: eye,
    });
    b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 8), DARK, {
      at: spot(0.0235),
      dir: gaze,
      bone: eye,
    });
    b.part(sph(0.0017, 5, 4), "#ffffff", { at: spot(0.0258, 0.002, 0.0024), bone: eye });

    const rosettes = [
      { rho: 0.017, n: 11, r: 0.0033, c: BUMP },
      { rho: 0.0201, n: 14, r: 0.0028, c: TEAL },
    ];
    for (const ring of rosettes) {
      const d = Math.sqrt(0.022 * 0.022 - ring.rho * ring.rho);
      for (let k = 0; k < ring.n; k++) {
        const a = (k / ring.n) * Math.PI * 2;
        b.part(sph(ring.r, 5, 4), ring.c, {
          at: spot(d, Math.cos(a) * ring.rho, Math.sin(a) * ring.rho),
          bone: eye,
        });
      }
    }
  }

  // =====================================================
  // LIMBS: arms and legs with pincer (zygodactyl) feet
  // =====================================================
  const makeLimb = (front: boolean, s: number) => {
    const S = s > 0 ? "L" : "R";
    const kind = front ? "F" : "H";
    const root = front ? v(s * 0.03, 0.172, 0.085) : v(s * 0.025, 0.168, -0.078);
    const foot = front ? v(s * 0.028, WY, 0.105) : v(s * 0.028, WY, -0.098);
    const pts = limb(
      root,
      foot,
      front ? [0.06, 0.06] : [0.064, 0.062],
      front ? [s, 0, -0.35] : [s, 0, 0.3],
    );
    const chain = b.chain(front ? `arm${S}` : `leg${S}`, pts, {
      parent: front ? chest : hips,
      names: front ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`] : [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: front ? "arm" : "leg",
    });
    const j = chain.joints;

    b.sweep(chain, front ? [0.0145, 0.0108, 0.0085] : [0.016, 0.0115, 0.0088], { color: coat });
    // shoulder / thigh muscle, elbow / knee knob with a little spur, palm pad
    b.part(sph(front ? 0.021 : 0.025), coat, {
      at: v(s * (front ? 0.038 : 0.036), root[1], root[2]),
      bone: j[0]!,
    });
    b.part(sph(0.0115, 7, 5), coat, { at: pts[1]!, bone: j[1]! });
    b.spike(pts[1]!, [s * 0.8, 0.1, front ? -0.6 : 0.5], 0.017, 0.0065, {
      color: CLAW,
      bone: j[1]!,
      sides: 5,
    });
    b.part(sph(0.012, 7, 5), coat, { at: pts[2]!, bone: j[2]! });

    const specs: Array<{ id: string; yaw: number; len: [number, number]; r: [number, number]; claws: number }> = [
      { id: "a", yaw: -15, len: [0.022, 0.019], r: [0.0092, 0.0066], claws: 3 },
      { id: "b", yaw: 30, len: [0.021, 0.017], r: [0.0078, 0.0056], claws: 2 },
    ];
    for (const sp of specs) {
      const yaw = THREE.MathUtils.degToRad(sp.yaw);
      const dir = new THREE.Vector3(s * Math.sin(yaw), 0, Math.cos(yaw));
      const p0 = new THREE.Vector3(...foot);
      const p1 = p0.clone().addScaledVector(dir, sp.len[0]);
      p1.y = topY(p1.x) + 0.0055;
      const p2 = p1.clone().addScaledVector(dir, sp.len[1]);
      p2.y = topY(p2.x) + 0.0055;

      const toe = b.chain(
        `digit${kind}${S}${sp.id}`,
        catmull([p0.toArray(), p1.toArray(), p2.toArray()]),
        { parent: chain, role: "digit" },
      );
      b.sweep(toe, sp.r, { color: coat, sides: 6 });

      const last = toe.joints[toe.joints.length - 1]!;
      const tdir = p2.clone().sub(p1).normalize();
      const lat = new THREE.Vector3(tdir.z, 0, -tdir.x).normalize();
      for (let k = 0; k < sp.claws; k++) {
        const m = k - (sp.claws - 1) / 2;
        const cdir = tdir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), m * 0.3);
        cdir.y -= 0.25;
        cdir.normalize();
        const base = p2.clone().addScaledVector(lat, m * 0.004);
        b.spike(base, cdir, 0.012, 0.0028, { color: CLAW, bone: last, sides: 5 });
      }
    }
  };
  for (const front of [true, false]) {
    for (const s of [1, -1]) makeLimb(front, s);
  }

  // =====================================================
  // BRANCH AND PROPS
  // =====================================================
  const branch = b.sweep(
    [v(0, BR, -0.22), v(0, BR, 0.34)],
    (t) => BR - 0.007 * Math.pow(Math.abs(t - 0.45) * 2, 3),
    { color: bark, caps: "flat", sides: 12, bone: hips, name: "branch" },
  );
  const bs = b.surface(branch);
  const branchHit = (z: number, deg: number) => {
    const a = THREE.MathUtils.degToRad(deg);
    const sx = Math.sin(a);
    const cy = Math.cos(a);
    return bs.ray([sx * 0.2, BR + cy * 0.2, z], [-sx, -cy, 0]);
  };

  // bark knots
  const knots: Array<[number, number, number]> = [
    [-0.14, 70, 0.014],
    [-0.02, -75, 0.012],
    [0.2, 80, 0.015],
    [0.12, -80, 0.011],
    [0.3, -60, 0.013],
    [-0.19, -40, 0.012],
  ];
  for (const [z, deg, r] of knots) {
    const hit = branchHit(z, deg);
    if (hit) b.stick(bump(r), BARK_C, hit, { embed: 0.4, flat: true });
  }
  // moss clumps
  const mossGeo = new THREE.SphereGeometry(0.026, 8, 5).scale(1.2, 0.45, 1.6);
  const mossSpots: Array<[number, number]> = [
    [-0.165, 8],
    [0.275, -30],
    [0.04, 70],
  ];
  for (const [z, deg] of mossSpots) {
    const hit = branchHit(z, deg);
    if (hit) b.stick(mossGeo, mossPaint, hit, { embed: 0.3 });
  }

  // twig with leaves and berries
  const twigBark = barkBody;
  b.sweep(
    catmull([v(-0.03, 0.075, 0.27), v(-0.075, 0.13, 0.285), v(-0.11, 0.19, 0.3), v(-0.14, 0.24, 0.31)]),
    [0.0095, 0.0035],
    { color: twigBark, bone: hips, sides: 6 },
  );

  const leafShape = (sc: number): OutlinePoint[] => [
    [0, 0, "sharp"],
    [0.025 * sc, 0.016 * sc],
    [0.06 * sc, 0.021 * sc],
    [0.1 * sc, 0.007 * sc],
    [0.118 * sc, 0, "sharp"],
    [0.1 * sc, -0.007 * sc],
    [0.06 * sc, -0.021 * sc],
    [0.025 * sc, -0.016 * sc],
  ];
  const leaf = (at: V3, along: V3, sc: number, base: string, tipCol: string) => {
    const x = new THREE.Vector3(...along).normalize();
    const y = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), x).normalize();
    const len = 0.118 * sc;
    const col = paint((_p, _n, s) =>
      Math.abs(s[1]) < 0.0018 * sc * (1 - s[0] / len) ? LEAF_VEIN : s[0] > len * 0.62 ? tipCol : base,
    );
    b.extrude(leafShape(sc), {
      at,
      x,
      y,
      thickness: 0.0035,
      bevel: 0.001,
      smoothing: 1,
      color: col,
      bone: hips,
    });
  };
  leaf(v(-0.075, 0.13, 0.285), v(-0.9, 0.3, 0.25), 1.0, LEAF, LEAF_L);
  leaf(v(-0.11, 0.19, 0.3), v(-0.45, 0.35, 0.75), 0.9, LEAF_2, LEAF_L);
  leaf(v(-0.14, 0.24, 0.31), v(-0.2, 0.9, 0.25), 0.8, LEAF, LEAF_L);

  const berrySpots: V3[] = [v(-0.085, 0.155, 0.275), v(-0.102, 0.168, 0.305), v(-0.08, 0.145, 0.3)];
  for (const p of berrySpots) {
    b.part(sph(0.0075, 7, 5), BERRY, { at: p, bone: hips });
    b.part(sph(0.0016, 4, 3), ORANGE_D, { at: v(p[0], p[1] + 0.0072, p[2]), bone: hips });
  }

  return b.root;
}
```