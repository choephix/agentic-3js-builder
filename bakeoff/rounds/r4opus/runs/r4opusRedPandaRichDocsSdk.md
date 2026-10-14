```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  offset,
  lerp,
  vec,
  catmull,
  bezier,
  limb,
  countershade,
  paint,
  mottle,
  grain,
  gradient,
  spots,
  noise,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Red Panda on a Mossy Branch",
  description:
    "A delighted red panda balancing on a mossy fallen branch, rusty back and black belly, white face with red tear marks, white-rimmed ears, a ringed fluffy tail, clutching a bamboo shoot.",
};

export default function build() {
  const b = createBuilder({ name: "red-panda" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- palette ----------
  const RUST = "#b8461d";
  const RUST_L = "#d0652b";
  const RUST_D = "#7e2c12";
  const TEAR = "#a83a16";
  const BLACK = "#2a1916";
  const WHITE = "#f7f1e6";
  const CREAM = "#f0d4a0";
  const GINGER = "#c55b25";
  const TIP = "#6e2d14";
  const NOSE = "#1c1210";
  const EYE = "#160e0c";
  const MOUTH = "#5e1a24";
  const TONGUE = "#e66f7c";
  const CLAW = "#e8dcc6";
  const EAR_IN = "#3d1a10";
  const BARK = "#6b4a32";
  const BARK_D = "#43301f";
  const MOSS = "#557f28";
  const MOSS_L = "#94c447";
  const BAMBOO = "#86b842";
  const BAMBOO_N = "#5c8a26";
  const BAMBOO_L = "#b6dc68";
  const LEAF = "#4f8a2a";
  const LEAF_V = "#9cc760";
  const BLEAF = "#6aa83a";
  const CAP = "#b7a0dc";
  const CAP_DOT = "#f6f0ff";
  const STEM = "#eee3cf";
  const WHISKER = "#f4efe6";

  // ---------- textures ----------
  const tuftTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M3 64 C5 42 9 20 16 1 C21 22 26 42 29 64 Z" fill="#ffffff"/><path d="M10 62 C11 44 13 28 16 9 M22 62 C21 46 19 30 16 12" stroke="#b9b2a8" stroke-width="2.5" fill="none"/></svg>`,
    { size: 128 },
  );
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M2 64 L12 18 L18 64 Z M18 64 L30 2 L38 64 Z M36 64 L50 12 L56 64 Z M50 64 L60 32 L63 64 Z" fill="#ffffff"/><path d="M3 64 L7 46 L58 46 L62 64 Z" fill="#a6a6a6"/></svg>`,
    { size: 128 },
  );
  const ringsTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#5a3b26"/><circle cx="50" cy="50" r="44" fill="#d9b27c"/><g fill="none" stroke="#b07f4c" stroke-width="3"><circle cx="52" cy="49" r="36"/><circle cx="53" cy="48" r="27"/><circle cx="53" cy="49" r="18"/><circle cx="54" cy="49" r="10"/></g><circle cx="54" cy="49" r="3" fill="#8a5a32"/></svg>`,
    { size: 256 },
  );
  const blushTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 44"><ellipse cx="40" cy="22" rx="38" ry="20" fill="#f4a0a0"/><path d="M22 30 L30 14 M36 30 L44 14 M50 30 L58 14" stroke="#e0707a" stroke-width="4" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const smileTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><path d="M32 1 L32 14 M6 7 Q18 30 32 14 Q46 30 58 7" stroke="#2a1712" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`,
    { size: 256 },
  );

  // ---------- paints ----------
  const coat = countershade(mottle(RUST, RUST_L, { size: 0.06, seed: 4 }), BLACK, { level: -0.2 });
  const mossPaint = mottle(MOSS, MOSS_L, { size: 0.04, seed: 2 });
  const barkPaint = grain(BARK, BARK_D, { size: 0.015, axis: "z" });
  const branchPaint = paint((p, n) => {
    const m = n.y + (noise(p, 0.06, 3) - 0.5) * 0.9;
    return m > 0.3 ? mossPaint : barkPaint;
  });
  const tailBand = (t: number, p: THREE.Vector3) => {
    if (t > 0.93) return TIP;
    const v = t * 11 + (noise(p, 0.05, 5) - 0.5) * 0.45;
    return Math.floor(v) % 2 === 0 ? GINGER : CREAM;
  };
  const tailPaint = paint((p, _n, s) => tailBand(s[0], p));
  const leafPaint = (base: string, vein: string) =>
    paint((_p, _n, s) => (Math.abs(s[0]) < 0.0022 && s[1] > 0.004 ? vein : base));

  // ---------- helpers ----------
  const sc = (o: OutlinePoint[], k: number): OutlinePoint[] =>
    o.map((q) => (q.length === 3 ? [q[0] * k, q[1] * k, "sharp"] : [q[0] * k, q[1] * k]) as OutlinePoint);
  const LEAF_O: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.014, 0.02],
    [0.012, 0.055],
    [0, 0.09, "sharp"],
    [-0.012, 0.055],
    [-0.014, 0.02],
  ];
  type J = ReturnType<typeof b.joint>;
  const leaf = (
    base: THREE.Vector3,
    d: number[],
    k: number,
    color: ReturnType<typeof paint>,
    bone: J,
    roll = 0,
  ) => {
    const y = V(d[0], d[1], d[2]).normalize();
    let x = V(0, 1, 0).cross(y);
    if (x.lengthSq() < 1e-4) x = V(1, 0, 0);
    x.normalize().applyAxisAngle(y, roll);
    return b.extrude(sc(LEAF_O, k), { at: base, x, y, thickness: 0.003, smoothing: 1, color, bone, group: "leaves" });
  };

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.37, -0.16],
      [0, 0.372, -0.08],
      [0, 0.376, 0.02],
      [0, 0.38, 0.11],
    ]),
    { parent: root, names: ["hips", "spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.385, 0.11],
      [0, 0.415, 0.18],
      [0, 0.448, 0.24],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck", group: "body" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.448, 0.24], dir: [0, 0.05, 1], role: "head", group: "head" });
  const H = V(0, 0.472, 0.275);
  const hp = (x: number, y: number, z: number): [number, number, number] => [H.x + x, H.y + y, H.z + z];
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.045, 0.04), aim: hp(0, -0.065, 0.1), role: "jaw", group: "head" });

  const tailPath = catmull([
    [0, 0.37, -0.24],
    [0, 0.355, -0.36],
    [0, 0.375, -0.5],
    [0, 0.44, -0.63],
    [0, 0.54, -0.71],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 6, role: "tail", group: "tail" });

  // ---------- the mossy branch ----------
  const brPath = catmull([
    [0.03, 0.09, -0.8],
    [-0.015, 0.0845, -0.52],
    [0, 0.078, -0.25],
    [0, 0.073, 0],
    [0, 0.068, 0.25],
    [0.025, 0.0625, 0.5],
    [0.05, 0.057, 0.75],
  ]);
  const branch = b.sweep(brPath, (t: number) => 0.09 - 0.033 * t, {
    bone: root,
    color: branchPaint,
    sides: 10,
    smooth: false,
    caps: { start: "flat", end: "round" },
    name: "branch",
    group: "branch",
  });
  const brSurf = b.surface(branch);
  const topY = (x: number, z: number) => {
    const h = brSurf.ray([x, 1, z], [0, -1, 0]);
    return h ? vec(h.at).y : 0.15;
  };
  // cut end with growth rings
  {
    const t0 = vec(brPath.tangentAt(0)).normalize().negate();
    b.part(new THREE.CircleGeometry(0.084, 20), "#ffffff", {
      at: offset(brPath.at(0), t0, 0.002),
      dir: t0,
      axis: "z",
      texture: ringsTex,
      bone: root,
      group: "branch",
    });
  }
  // side twigs
  const twig1 = catmull([
    [0.02, 0.1, 0.42],
    [0.1, 0.16, 0.47],
    [0.18, 0.26, 0.5],
    [0.21, 0.36, 0.49],
  ]);
  const twig2 = catmull([
    [-0.02, 0.11, -0.48],
    [-0.11, 0.17, -0.53],
    [-0.17, 0.27, -0.5],
    [-0.19, 0.33, -0.46],
  ]);
  for (const tw of [twig1, twig2])
    b.sweep(tw, [0.022, 0.006], { bone: root, color: branchPaint, sides: 7, smooth: false, group: "branch" });
  const twigLeaf = leafPaint(LEAF, LEAF_V);
  leaf(vec(twig1.at(0.55)), [0.2, 0.6, 0.8], 0.9, twigLeaf, root, 0.4);
  leaf(vec(twig1.at(0.8)), [0.9, 0.35, -0.2], 1.0, twigLeaf, root, -0.3);
  leaf(vec(twig1.at(1)), [0.3, 1, 0.2], 1.1, twigLeaf, root, 0.2);
  leaf(vec(twig1.at(1)), [0.1, 0.8, 0.7], 0.85, twigLeaf, root, -0.5);
  leaf(vec(twig2.at(0.6)), [-0.3, 0.6, -0.8], 0.9, twigLeaf, root, 0.3);
  leaf(vec(twig2.at(0.85)), [-0.9, 0.4, 0.3], 1.0, twigLeaf, root, -0.4);
  leaf(vec(twig2.at(1)), [-0.3, 1, 0.1], 1.1, twigLeaf, root, 0.2);
  // broken stub with a ringed end
  {
    const s0 = V(-0.03, 0.1, 0.05);
    const s1 = V(-0.085, 0.13, 0.08);
    b.sweep([s0, s1], [0.018, 0.015], { bone: root, color: barkPaint, caps: "flat", sides: 7, smooth: false, group: "branch" });
    const d = s1.clone().sub(s0).normalize();
    b.part(new THREE.CircleGeometry(0.0145, 10), "#ffffff", {
      at: offset(s1, d, 0.001),
      dir: d,
      axis: "z",
      texture: ringsTex,
      bone: root,
      group: "branch",
    });
  }
  // moss cushions
  for (const [x, z, k] of [
    [0.01, -0.62, 1.1],
    [-0.012, -0.4, 0.9],
    [0.015, 0.33, 1.0],
    [-0.01, 0.56, 0.85],
    [0.02, -0.02, 0.7],
  ]) {
    const h = brSurf.ray([x, 1, z], [0, -1, 0]);
    if (h)
      b.stick(new THREE.IcosahedronGeometry(0.045 * k, 1), mossPaint, h, {
        scale: [1.1, 0.42, 1.5],
        flat: true,
        embed: 0.35,
        bone: root,
        group: "moss",
      });
  }
  // moss tufts (kept clear of the paws)
  const mossHits = brSurf.scatter(110, {
    rng: rng(21),
    minDist: 0.04,
    filter: (h) => {
      const z = vec(h.at).z;
      return h.n.y > 0.5 && Math.abs(z + 0.15) > 0.06 && Math.abs(z - 0.13) > 0.06;
    },
  });
  b.cards(mossHits, grassTex, {
    size: [0.045, 0.038],
    lean: 15,
    vary: 0.35,
    rng: rng(22),
    color: mossPaint,
    cross: true,
    bone: root,
    group: "moss",
  });
  // little lilac toadstools
  const capPaint = spots(CAP, CAP_DOT, { size: 0.014, amount: 0.3, seed: 9 });
  const mush = (az: number, z: number, el: number, k: number) => {
    const h = brSurf.around([0, 0.08, z]).at(az, el);
    if (!h) return;
    const n = vec(h.n).normalize();
    const up = n.clone().add(V(0, 1.4, 0)).normalize();
    const len = 0.04 * k;
    const base = offset(h.at, n, -0.003);
    const top = base.clone().addScaledVector(up, len);
    b.sweep(bezier(base, offset(base, n, len * 0.55), top), [0.0065 * k, 0.005 * k], {
      color: STEM,
      bone: root,
      sides: 7,
      caps: "flat",
      group: "mushrooms",
    });
    b.lathe(
      sc(
        [
          [0, -0.003],
          [0.024, -0.004],
          [0.026, 0.002],
          [0.018, 0.013],
          [0, 0.017],
        ],
        k,
      ),
      { at: top, axis: up, segments: 10, smoothing: 1, color: capPaint, bone: root, group: "mushrooms" },
    );
  };
  mush(90, -0.36, 35, 1);
  mush(90, -0.31, 15, 0.7);
  mush(90, -0.41, 50, 0.55);
  mush(-90, 0.36, 30, 0.8);
  mush(-90, 0.4, 12, 0.5);

  // ---------- body ----------
  const bodyR = (t: number): [number, number] => {
    const k = 0.58 + 0.42 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
    return [0.078 * k, 0.086 * k];
  };
  const body = b.sweep(
    catmull([
      [0, 0.362, -0.27],
      [0, 0.37, -0.16],
      [0, 0.374, -0.03],
      [0, 0.382, 0.09],
      [0, 0.405, 0.16],
    ]),
    bodyR,
    { bone: [spine, neck], color: coat, name: "body", group: "body" },
  );
  b.sweep(neck, [0.062, 0.052], { color: coat, name: "neck", group: "body" });
  const backHits = b.surface(body).scatter(70, {
    rng: rng(41),
    minDist: 0.035,
    filter: (h) => h.n.y > 0.3 && vec(h.at).z < 0.12,
  });
  b.cards(backHits, tuftTex, { size: [0.034, 0.05], lean: 65, bend: 25, vary: 0.3, rng: rng(42), color: coat, group: "fur" });

  // ---------- tail ----------
  const tailSweep = b.sweep(tail, [0.042, 0.064, 0.078, 0.08, 0.072, 0.05], { color: tailPaint, name: "tail", group: "tail" });
  const tailHits = b.surface(tailSweep).scatter(150, { rng: rng(31), minDist: 0.026 });
  const groups: Record<string, typeof tailHits> = {};
  for (const h of tailHits) {
    const c = tailBand(tailPath.closestT(h.at), vec(h.at));
    (groups[c] ??= []).push(h);
  }
  for (const c of Object.keys(groups))
    b.cards(groups[c], tuftTex, { size: [0.05, 0.066], lean: 62, bend: 25, vary: 0.3, rng: rng(32), color: c, group: "tail" });

  // ---------- legs ----------
  const groundPaw = (tip: J) => {
    const w = vec(tip.at);
    const pc = w.clone().add(V(0, -0.008, 0.016));
    b.part(new THREE.SphereGeometry(0.022, 10, 7), BLACK, { bone: tip, at: pc, scale: [1.05, 0.62, 1.5], group: "paws" });
    for (const dx of [-0.012, 0, 0.012]) {
      b.part(new THREE.SphereGeometry(0.0085, 6, 4), BLACK, {
        bone: tip,
        at: [pc.x + dx, pc.y - 0.003, pc.z + 0.03],
        group: "paws",
      });
      b.spike([pc.x + dx, pc.y - 0.004, pc.z + 0.036], [0, -0.6, 1], 0.012, 0.003, { color: CLAW, bone: tip, group: "paws" });
    }
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // hind leg
    const hip = V(s * 0.062, 0.35, -0.17);
    const hx = s * 0.042;
    const hz = -0.15;
    const ank = V(hx, topY(hx, hz) + 0.02, hz);
    const hpts = limb(hip, ank, [0.12, 0.11], [[0, 0, 1]]);
    const hind = b.chain(`hindLeg${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(hind, [0.044, 0.03, 0.022], { color: gradient(RUST, BLACK, hpts[0], hpts[1]), group: "legs" });
    groundPaw(hind.joints[hind.joints.length - 1]);

    // front leg
    const sh = V(s * 0.06, 0.345, 0.07);
    const raised = s < 0;
    let target: THREE.Vector3;
    if (raised) target = V(-0.135, 0.33, 0.22);
    else {
      const fx = s * 0.04;
      const fz = 0.13;
      target = V(fx, topY(fx, fz) + 0.02, fz);
    }
    const fpts = limb(sh, target, [0.11, 0.105], [raised ? [0, -1, 0] : [0, 0, -1]]);
    const front = b.chain(`frontLeg${side}`, fpts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(front, [0.034, 0.026, 0.021], { color: BLACK, group: "legs" });
    const tip = front.joints[front.joints.length - 1];
    if (!raised) groundPaw(tip);
    else {
      // paw clutching a bamboo shoot
      const w = vec(tip.at);
      b.part(new THREE.SphereGeometry(0.023, 10, 7), BLACK, { bone: tip, at: w.clone().add(V(0, 0, 0.006)), scale: [1, 1.15, 1.05], group: "paws" });
      const c = w.clone().add(V(0, 0, 0.02));
      const b0 = c.clone().add(V(0.004, -0.085, -0.006));
      const b1 = c.clone().add(V(-0.02, 0.215, 0.014));
      const sd = b1.clone().sub(b0).normalize();
      b.sweep([b0, b1], (t: number) => (t < 0.8 ? 0.0115 : 0.0115 * (1 - ((t - 0.8) / 0.2) * 0.75)), {
        bone: tip,
        color: (t: number) => (t > 0.8 ? BAMBOO_L : (t * 5) % 1 < 0.05 && t > 0.05 ? BAMBOO_N : BAMBOO),
        caps: { start: "flat", end: "point" },
        sides: 8,
        name: "bamboo",
        group: "bamboo",
      });
      for (const k of [1, 2, 3])
        b.part(new THREE.TorusGeometry(0.0122, 0.0024, 4, 10), BAMBOO_L, {
          bone: tip,
          at: lerp(b0, b1, k / 5),
          dir: sd,
          axis: "z",
          group: "bamboo",
        });
      const bLeaf = leafPaint(BLEAF, BAMBOO_L);
      leaf(lerp(b0, b1, 0.62), [-0.8, 0.5, 0.3], 0.9, bLeaf, tip, 0.3);
      leaf(lerp(b0, b1, 0.7), [-0.2, 0.45, 0.9], 1.0, bLeaf, tip, -0.4);
      leaf(lerp(b0, b1, 0.78), [-0.5, 0.8, -0.4], 0.8, bLeaf, tip, 0.2);
      for (const dy of [-0.013, 0, 0.013])
        b.part(new THREE.SphereGeometry(0.0085, 6, 4), BLACK, {
          bone: tip,
          at: c.clone().add(V(-0.008, dy, 0.012)),
          group: "paws",
        });
    }
  }

  // ---------- head ----------
  const segD = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
    const dx = bx - ax;
    const dy = by - ay;
    let u = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    u = Math.max(0, Math.min(1, u));
    return Math.hypot(px - ax - u * dx, py - ay - u * dy);
  };
  const facePaint = paint((p) => {
    const x = p.x - H.x;
    const y = p.y - H.y;
    const z = p.z - H.z;
    const ax = Math.abs(x);
    if (z > 0 && segD(ax, y, 0.036, 0.004, 0.05, -0.066) < 0.0095) return TEAR;
    if (z > 0.015 && Math.hypot(ax - 0.03, y - 0.05) < 0.016) return WHITE;
    if (y < 0.01 && z > -0.035) return WHITE;
    return RUST;
  });

  const headPart = b.part(new THREE.SphereGeometry(0.08, 14, 10), facePaint, {
    bone: head,
    at: H,
    scale: [1.12, 0.95, 0.95],
    name: "skull",
    group: "head",
  });
  const headSurf = b.surface(headPart);

  // cheek puffs make the face broad and round
  for (const s of [1, -1]) {
    const cc = V(H.x + s * 0.07, H.y - 0.03, H.z + 0.005);
    const cheek = b.part(new THREE.SphereGeometry(0.034, 10, 8), facePaint, {
      bone: head,
      at: cc,
      scale: [1, 0.85, 0.95],
      group: "head",
    });
    const bd = V(s * 0.75, -0.1, 0.65).normalize();
    b.decal(cheek, blushTex, {
      at: cc.clone().addScaledVector(bd, 0.032),
      dir: bd,
      size: [0.032, 0.019],
      bone: head,
      mirror: s < 0,
      group: "head",
    });
    // white fluff flaring out of the cheeks
    const fluff = [] as ReturnType<typeof frame>[];
    for (const [dy, dz] of [
      [-0.012, -0.01],
      [-0.024, 0.0],
      [0.0, -0.02],
    ])
      fluff.push(frame([cc.x + s * 0.028, cc.y + dy, cc.z + dz], [s, -0.35, -0.1]));
    b.cards(fluff, tuftTex, { size: [0.028, 0.04], lean: 20, flow: [0, -1, -0.3], color: WHITE, bone: head, group: "head" });
  }

  // muzzle, nose, mouth
  const muzzle = b.part(new THREE.SphereGeometry(0.033, 12, 8), facePaint, {
    bone: head,
    at: hp(0, -0.03, 0.072),
    scale: [1.15, 0.82, 1],
    name: "muzzle",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.013, 8, 6), NOSE, { bone: head, at: hp(0, -0.014, 0.1), scale: [1.35, 0.85, 0.9], group: "head" });
  b.part(new THREE.SphereGeometry(0.0032, 5, 4), WHITE, { bone: head, at: hp(0.004, -0.006, 0.108), group: "head" });
  b.decal(muzzle, smileTex, { at: hp(0, -0.036, 0.104), dir: [0, 0, 1], size: [0.044, 0.022], bone: head, group: "head" });
  b.part(new THREE.SphereGeometry(0.022, 10, 6), MOUTH, { bone: head, at: hp(0, -0.056, 0.08), scale: [1, 0.6, 0.8], group: "head" });
  b.part(new THREE.SphereGeometry(0.024, 10, 6), WHITE, { bone: jaw, at: hp(0, -0.072, 0.074), scale: [1.15, 0.55, 1.15], name: "lowerJaw", group: "head" });
  b.part(new THREE.SphereGeometry(0.013, 8, 5), TONGUE, { bone: jaw, at: hp(0, -0.062, 0.088), scale: [1, 0.4, 1.2], group: "head" });
  for (const s of [1, -1])
    for (const k of [-1, 0, 1])
      b.rod(hp(s * 0.034, -0.032, 0.085), hp(s * 0.105, -0.03 + k * 0.013, 0.08 - Math.abs(k) * 0.008), 0.0013, {
        color: WHISKER,
        bone: head,
        group: "head",
      });

  // eyes with sparkles
  for (const s of [1, -1]) {
    const o: [number, number, number] = [H.x + s * 0.036, H.y + 0.014, H.z + 0.3];
    const hit = headSurf.ray(o, [0, 0, -1]) ?? headSurf.nearest(hp(s * 0.036, 0.014, 0.075));
    const eye = b.stick(new THREE.SphereGeometry(0.016, 10, 8), EYE, hit, {
      embed: 0.3,
      scale: [1, 0.7, 1.15],
      bone: head,
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), WHITE, { bone: head, at: eye.local([0.004, 0.0095, 0.006]), group: "head" });
    b.part(new THREE.SphereGeometry(0.0022, 5, 4), WHITE, { bone: head, at: eye.local([-0.005, 0.0095, -0.006]), group: "head" });
  }

  // white-rimmed pointed ears
  const EAR_O: OutlinePoint[] = [
    [-0.034, 0],
    [0.034, 0],
    [0.026, 0.03],
    [0.008, 0.062],
    [0, 0.072, "sharp"],
    [-0.008, 0.062],
    [-0.026, 0.03],
  ];
  const EAR_I: OutlinePoint[] = [
    [-0.022, 0.006],
    [0.022, 0.006],
    [0.016, 0.03],
    [0.005, 0.05],
    [0, 0.057, "sharp"],
    [-0.005, 0.05],
    [-0.016, 0.03],
  ];
  for (const s of [1, -1]) {
    const yv = V(s * 0.38, 1, -0.08).normalize();
    const xv = V(1, -s * 0.38, 0).normalize();
    const zAx = xv.clone().cross(yv).normalize();
    const base = V(H.x + s * 0.052, H.y + 0.05, H.z - 0.012);
    const earPaint = paint((_p, n) => (n.dot(zAx) < -0.5 ? RUST_D : WHITE));
    b.extrude(EAR_O, { at: base, x: xv, y: yv, thickness: 0.012, bevel: 0.003, smoothing: 1, color: earPaint, bone: head, group: "ears" });
    const inBase = base.clone().addScaledVector(zAx, 0.0075);
    b.extrude(EAR_I, { at: inBase, x: xv, y: yv, thickness: 0.004, smoothing: 1, color: EAR_IN, bone: head, group: "ears" });
    b.cards(
      [-0.008, 0.008].map((u) => frame(inBase.clone().addScaledVector(xv, u).addScaledVector(zAx, 0.003), yv)),
      tuftTex,
      { size: [0.018, 0.034], lean: 12, flow: zAx, color: WHITE, bone: head, group: "ears" },
    );
  }

  // a little rusty tuft on the crown
  const crownHits = headSurf.scatter(8, { rng: rng(51), minDist: 0.022, filter: (h) => h.n.y > 0.7 });
  b.cards(crownHits, tuftTex, { size: [0.026, 0.036], lean: 45, bend: 20, color: RUST, bone: head, group: "head" });

  return b.root;
}
```