import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, limb } from "../../../../src/index";
import { glow, glow as glowKit } from "../../../../kits/glow";

export const meta = {
  "name": "Kitsune of Nine Flames",
  "description": "A graceful high-fantasy anime nine-tailed fox standing in a neutral rest pose, with a white and gold coat, red markings, a fan of nine tails and floating blue spirit flames."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  fur: "#fbf6ea",
  furShade: "#e3d8c4",
  gold: "#f2b632",
  goldDeep: "#c98417",
  crimson: "#d12f3a",
  ink: "#1d1626",
  sock: "#3a2b45",
  eyeAmber: "#ffb32e",
  flameCyan: "#5fe8ff",
  flameBlue: "#4a7dff",
  flameCore: "#e8fdff",
  pink: "#f5a3b5",
  beadJade: "#3fd0a4",
  rope: "#9b2a33",
};
const M = {
  chest: [0, 0.95, 0.45] as [number, number, number],
  hips: [0, 0.95, -0.45] as [number, number, number],
  neckBase: [0, 1.05, 0.5] as [number, number, number],
  headPivot: [0, 1.4, 0.8] as [number, number, number],
  jawHinge: [0, 1.32, 0.88] as [number, number, number],
  tailRoot: [0, 1, -0.55] as [number, number, number],
  shoulderL: [0.17, 0.85, 0.4] as [number, number, number],
  hipL: [0.17, 0.85, -0.45] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // body
  (() => {
function buildBody({ b, J, P, M }: Ctx) {
  const hips = J.hips, chest = J.chest;
  const FUR = P.fur, SHADE = P.furShade, GOLD = P.gold, DEEP = P.goldDeep, RED = P.crimson, ROPE = P.rope, JADE = P.beadJade;

  // Torso loft, fur back and shaded belly
  const spine = catmull([[0, 0.95, -0.5], [0, 0.97, -0.1], [0, 1.0, 0.25], [0, 1.0, 0.55]]);
  const body = b.sweep(spine, (t) => [0.2 + 0.05 * Math.sin(t * Math.PI), 0.2 + 0.05 * Math.sin(t * Math.PI)], {
    bone: [hips, chest],
    color: FUR,
    sides: 10,
    sectors: [[125, 235, SHADE]],
  });
  const skin = b.surface(body);

  // rump base for tails
  b.part(new THREE.SphereGeometry(0.17, 10, 8), FUR, { bone: hips, at: [0, 1.0, -0.55], scale: [1.1, 0.9, 1] });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), GOLD, { bone: hips, at: [0, 1.0, -0.66] });

  // chest ruff of fur blades
  const r = rng(5);
  for (let i = 0; i < 18; i++) {
    const a = -80 + (i / 17) * 160;
    const hit = skin.around([0, 0.97, 0.45]).at(a * 0.7, -8 + (i % 3) * 10);
    if (!hit) continue;
    b.stick(new THREE.ConeGeometry(0.03, 0.07 + r() * 0.02, 5), i % 2 ? FUR : SHADE, hit, { embed: 0.45 });
  }

  // gold sun medallion on chest
  const mh = skin.around([0, 0.97, 0.45]).at(0, 0);
  if (mh) {
    b.stick(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 14), GOLD, mh, { embed: 0.3 });
    b.stick(new THREE.CylinderGeometry(0.035, 0.035, 0.026, 10), RED, mh, { embed: 0.2 });
    for (let i = 0; i < 8; i++) {
      if (mh.at.z > 0.6) break;
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.ConeGeometry(0.012, 0.035, 4), DEEP, {
        bone: chest,
        at: [Math.sin(a) * 0.075 * 0 + mh.at.x + Math.cos(a) * 0.075, mh.at.y + Math.sin(a) * 0.075, mh.at.z + 0.01],
        rotation: [0, 0, (a * 180) / Math.PI - 90],
      });
    }
  }

  // harness bands
  const band1 = skin.loop(chest.local([0, 0.12, 0]), { dir: [0, 0, 1], lift: 0.012 });
  b.sweep(band1, 0.016, { color: RED, bone: chest });
  const band2 = skin.loop([0, 0.97, 0.3], { dir: [0, 0, 1], lift: 0.016 });
  b.sweep(band2, 0.012, { color: GOLD, bone: chest });
  // rope belt
  const belt = skin.loop([0, 0.95, -0.2], { dir: [0, 0, 1], lift: 0.015 });
  b.sweep(belt, 0.022, { color: ROPE, bone: hips });
  b.along(belt, 16, (at) => b.part(new THREE.SphereGeometry(0.014, 5, 4), DEEP, { at }));

  // tassels at left hip
  for (const s of [1, -1]) {
    const hit = skin.around([0, 0.95, -0.2]).at(s * 90, -20);
    if (!hit) continue;
    b.stick(new THREE.SphereGeometry(0.025, 6, 5), GOLD, hit);
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.ConeGeometry(0.014, 0.12, 5), k === 1 ? GOLD : RED, {
        bone: hips,
        at: [hit.at.x + s * 0.03 + (k - 1) * 0.02, hit.at.y - 0.09, hit.at.z],
        rotation: [180, 0, 0],
      });
    }
  }

  // jade bead strand draped across chest
  const strand = skin.drape(catmull([[0.2, 1.15, 0.38], [0.1, 0.92, 0.5], [-0.1, 0.9, 0.5], [-0.2, 1.15, 0.38]]), { lift: 0.03 });
  b.sweep(strand, 0.004, { color: ROPE, bone: chest });
  b.along(strand, 9, (at) => b.part(new THREE.SphereGeometry(0.02, 6, 5), JADE, { at }));

  // flank swirl marks
  for (const s of [1, -1]) {
    const pts: number[][] = [];
    for (let i = 0; i < 12; i++) {
      const a = i * 0.55;
      const rad = 0.09 - i * 0.005;
      pts.push([s * 0.3, 1.0 + Math.sin(a) * rad, -0.2 + Math.cos(a) * rad]);
    }
    const sw = skin.drape(catmull(pts), { lift: 0.006 });
    b.sweep(sw, [0.011, 0.005], { color: RED, bone: hips });
  }
}
    return buildBody;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head, jaw = J.jaw, neck = J.neck;
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { bone, at, ...o });

  // neck
  b.sweep([[0, 1.0, 0.45], [0, 1.2, 0.62], [0, 1.4, 0.8]], [0.1, 0.085], { bone: neck, color: P.fur });
  // collar ring
  part(new THREE.TorusGeometry(0.115, 0.022, 6, 14), P.gold, [0, 1.2, 0.62], neck, { dir: [0, 0.7, 0.7], axis: "z" });
  part(new THREE.TorusGeometry(0.118, 0.008, 5, 14), P.crimson, [0, 1.2, 0.62], neck, { dir: [0, 0.7, 0.7], axis: "z" });
  for (const s of [1, -1]) {
    part(sph(0.025), P.goldDeep, [s * 0.1, 1.15, 0.7], neck);
    b.rod([s * 0.1, 1.14, 0.7], [s * 0.1, 1.04, 0.73], 0.008, P.rope, { bone: neck });
    part(new THREE.ConeGeometry(0.03, 0.07, 6), P.crimson, [s * 0.1, 1.0, 0.73], neck, { dir: [0, -1, 0] });
  }

  // skull
  part(sph(0.15, 10, 8), P.fur, [0, 1.42, 0.8], head, { scale: [1, 0.9, 1] });
  // cheek ruffs
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) {
    part(new THREE.ConeGeometry(0.04, 0.12, 5), i == 1 ? P.furShade : P.fur, [s * (0.13 + i * 0.01), 1.36 - i * 0.03, 0.8 + i * 0.01], head, { dir: [s * 1, -0.5 - i * 0.3, -0.3] });
  }
  // upper muzzle
  b.frustumBox([0, 1.4, 0.88], [0, 1.38, 1.12], [0.17, 0.1], [0.07, 0.06], { bone: head, color: P.fur });
  part(sph(0.03), P.ink, [0, 1.395, 1.14], head, { scale: [1.2, 0.8, 0.9] });
  part(sph(0.012), P.flameCore, [0, 1.405, 1.15], head);
  // lower jaw
  b.frustumBox([0, 1.31, 0.88], [0, 1.31, 1.08], [0.13, 0.04], [0.06, 0.035], { bone: jaw, color: P.furShade });
  part(new THREE.BoxGeometry(0.07, 0.012, 0.13), P.pink, [0, 1.335, 1.0], jaw);
  for (const s of [1, -1]) {
    part(new THREE.ConeGeometry(0.01, 0.035, 5), P.fur, [s * 0.04, 1.35, 1.07], jaw);
    part(new THREE.ConeGeometry(0.01, 0.03, 5), P.fur, [s * 0.045, 1.35, 1.05], head, { dir: [0, -1, 0], at: [s * 0.04, 1.355, 1.08] });
  }

  // eyes
  for (const s of [1, -1]) {
    const e = [s * 0.085, 1.45, 0.93];
    part(sph(0.04, 8, 6), P.ink, e, head, { scale: [0.6, 1.1, 0.5] });
    part(sph(0.032, 8, 6), P.eyeAmber, [e[0], e[1] - 0.003, e[2] + 0.012], head, { scale: [0.6, 1.0, 0.4] });
    part(sph(0.016, 6, 4), P.ink, [e[0], e[1] - 0.005, e[2] + 0.02], head, { scale: [0.5, 1.1, 0.4] });
    part(sph(0.01, 5, 4), "#ffffff", [e[0] - s * 0.005, e[1] + 0.015, e[2] + 0.026], head);
    // red eye markings
    b.rod([s * 0.1, 1.44, 0.93], [s * 0.15, 1.40, 0.88], 0.006, P.crimson, { bone: head });
    b.rod([s * 0.1, 1.405, 0.94], [s * 0.14, 1.35, 0.91], 0.005, P.crimson, { bone: head });
    b.rod([s * 0.06, 1.5, 0.94], [s * 0.12, 1.52, 0.9], 0.007, P.crimson, { bone: head });
    // cheek stripe
    b.rod([s * 0.12, 1.39, 0.9], [s * 0.2, 1.36, 0.8], 0.006, P.crimson, { bone: head });
    // whiskers
    for (let k = 0; k < 3; k++)
      b.rod([s * 0.06, 1.38, 1.08], [s * 0.26, 1.4 + (k - 1) * 0.04, 1.0 - k * 0.02], 0.002, P.ink, { bone: head });
    // ears
    const eb = [s * 0.085, 1.54, 0.74];
    part(new THREE.ConeGeometry(0.075, 0.3, 4), P.fur, eb.map((v, i) => v + [0, 0.12, 0.0][i]), head, { dir: [s * 0.25, 1, -0.2], rotation: [0, 45, 0] });
    part(new THREE.ConeGeometry(0.05, 0.22, 4), P.ink, [eb[0], eb[1] + 0.1, eb[2] + 0.025], head, { dir: [s * 0.25, 1, -0.2], rotation: [0, 45, 0] });
    part(new THREE.ConeGeometry(0.03, 0.07, 4), P.gold, [eb[0] + s * 0.05, eb[1] + 0.27, eb[2] - 0.045], head, { dir: [s * 0.25, 1, -0.2] });
  }
  // brow crest
  part(new THREE.ConeGeometry(0.03, 0.09, 4), P.gold, [0, 1.55, 0.9], head, { dir: [0, 0.8, 0.3] });
  glow(part(new THREE.OctahedronGeometry(0.02), P.flameCyan, [0, 1.52, 0.95], head), 1.5);
  part(new THREE.BoxGeometry(0.1, 0.012, 0.012), P.goldDeep, [0, 1.515, 0.945], head);
}
    return buildHead;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P }: any) {
  const FUR = P.fur, SHADE = P.furShade, SOCK = P.sock, GOLD = P.gold, RED = P.crimson, INK = P.ink;
  const CY = P.flameCyan, CORE = P.flameCore, BLUE = P.flameBlue;
  const G = glowKit ?? glow;

  const legs = [
    { n: "FL", s: 1, front: true },
    { n: "FR", s: -1, front: true },
    { n: "BL", s: 1, front: false },
    { n: "BR", s: -1, front: false },
  ];

  for (const L of legs) {
    const s = L.s;
    const root = J["leg" + L.n];
    const x = s * 0.17;
    const z0 = L.front ? 0.4 : -0.45;
    const footZ = z0 + (L.front ? 0.02 : -0.02);
    const pawR = 0.03;
    const hip: [number, number, number] = [x, 0.85, z0];
    const target: [number, number, number] = [x, pawR, footZ];
    const pts = L.front
      ? limb(hip, target, [0.4, 0.4], [[0, 0, -1]])
      : limb(hip, target, [0.3, 0.3, 0.26], [[0, 0, 1], [0, 0, -1]]);
    const names = L.front
      ? ["legUpper" + L.n, "legElbow" + L.n, "legPaw" + L.n]
      : ["legThigh" + L.n, "legKnee" + L.n, "legHock" + L.n, "legPaw" + L.n];
    const ch = b.chain("legs" + L.n, pts, { parent: root, names, role: "leg", contact: [x, 0, footZ] });
    const pts3 = pts.map((p: THREE.Vector3) => p.clone());
    const last = pts3.length - 1;

    // upper fur sleeve and dark sock lower leg
    const upperEnd = L.front ? 1 : 2;
    const upperPath = pts3.slice(0, upperEnd + 1);
    for (let i = 0; i < pts3.length - 1; i++) {
      const lower = i >= upperEnd - (L.front ? 0 : 0) && i >= (L.front ? 1 : 2);
      const col = lower ? SOCK : FUR;
      const r0 = lower ? 0.04 : 0.065 - i * 0.012;
      const r1 = lower ? 0.03 : 0.05 - i * 0.008;
      b.capsule(pts3[i], pts3[i + 1], [r0, r1], col, { bone: ch.joints[Math.min(i, ch.joints.length - 1)], sides: 8 });
    }
    // joint balls
    for (let i = 1; i < last; i++) {
      b.part(new THREE.SphereGeometry(0.045 - i * 0.004, 8, 6), i >= 2 ? SOCK : FUR, { at: pts3[i], bone: ch.joints[i] });
    }
    // fur tufts at elbow / hock
    const j = L.front ? 1 : 2;
    const back = L.front ? -1 : -1;
    for (let k = 0; k < 3; k++) {
      const a = pts3[j];
      b.spike([a.x + s * 0.02 * (k - 1), a.y + 0.03 - k * 0.03, a.z + back * 0.04], [s * 0.2 * (k - 1), -0.5 - k * 0.1, back], 0.11 - k * 0.015, 0.032, FUR, { bone: ch.joints[j], sides: 6 });
    }
    // red cuff and gold anklet on lower leg
    const a = pts3[last - 1], c = pts3[last];
    const at = (t: number) => new THREE.Vector3().lerpVectors(a, c, t);
    const dir = new THREE.Vector3().subVectors(c, a).normalize();
    const bone = ch.joints[last - 1];
    b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.025, 8), RED, { at: at(0.3), dir, bone });
    b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.02, 8), GOLD, { at: at(0.62), dir, bone });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), GOLD, { at: at(0.62).add(new THREE.Vector3(0, 0, 0.04)), bone });

    // paw and toes with claws
    const pawBone = ch.tip ?? ch.joints[last - 1];
    b.part(new THREE.SphereGeometry(0.05, 8, 6), SOCK, { at: [x, 0.03, footZ + 0.03], scale: [1, 0.6, 1.4], bone: pawBone });
    for (let t = -1; t <= 1; t++) {
      const tx = x + t * 0.025;
      b.part(new THREE.SphereGeometry(0.02, 6, 4), SOCK, { at: [tx, 0.02, footZ + 0.09 - Math.abs(t) * 0.007], scale: [1, 0.8, 1.3], bone: pawBone });
      b.spike([tx, 0.018, footZ + 0.11], [0, -0.1, 1], 0.035, 0.009, INK, { bone: pawBone, sides: 5 });
    }
    // pad tint
    b.part(new THREE.SphereGeometry(0.015, 5, 4), SHADE, { at: [x, 0.055, footZ + 0.005], bone: pawBone });

    // spirit-flame wisps at front paws
    if (L.front) {
      const fp: [number, number, number] = [x + s * 0.08, 0.1, footZ + 0.12];
      const layers: [number, string, number, number][] = [
        [0.04, BLUE, 0.16, 0],
        [0.028, CY, 0.12, 0.01],
        [0.015, CORE, 0.08, 0.02],
      ];
      for (const [r, col, h, dy] of layers) {
        G(b.part(new THREE.ConeGeometry(r, h, 6), col, { at: [fp[0], fp[1] + h / 2 + dy, fp[2]], bone: pawBone }), 1.4);
      }
      G(b.part(new THREE.SphereGeometry(0.018, 6, 4), CY, { at: [fp[0], fp[1], fp[2]], bone: pawBone }), 1.4);
    }
  }
}
    return buildLegs;
  })(),
  // tails
  (() => {
function buildTails({ b, J, P }: any) {
  const r = rng(11);
  const root: [number, number, number] = [0, 1.0, -0.55];
  const GOLD = P.gold, DEEP = P.goldDeep;
  for (let i = 0; i < 9; i++) {
    const k = (i - 4) / 4; // -1..1 (+x is left)
    const mid = 1 - Math.abs(k);
    const L = 0.95 + 0.4 * mid;
    const sx = k * 1.2;
    const topY = 1.0 + 0.35 * mid;
    const endY = Math.max(0.45, topY - 0.25 * Math.abs(k) * 0.4 + (1 - Math.abs(k)) * 0 + (Math.abs(k) > 0.9 ? -0.5 : 0));
    const pts: [number, number, number][] = [
      root,
      [sx * 0.25, 1.0 + 0.1 * mid, -0.8],
      [sx * 0.65, 0.7 + endY * 0.5 + 0.05 * mid, -0.55 - L * 0.55],
      [sx * 0.9, endY * 0.9 + 0.1, -0.55 - L * 0.78],
      [sx, endY, -0.55 - L * 0.85 - 0.12 * mid],
    ];
    const path = catmull(pts);
    const name = `tail${i + 1}`;
    const ch = b.chain(name, path, {
      parent: J.hips, count: 4, role: "tail", group: "tails",
      names: [name + "a", name + "b", name + "c", name + "d"],
    });
    const rad = 0.13 + 0.03 * mid;
    b.sweep(ch, (t: number) => rad * (0.45 + 1.15 * Math.sin(Math.PI * Math.min(1, t * 0.8 + 0.15)) ** 0.8) * (t > 0.85 ? 1 - (t - 0.85) * 3 : 1) + 0.02, {
      color: P.fur,
      sides: 8,
      bands: [[0.72, P.fur], [0.86, "#f7e2a0"], [1, GOLD]],
      sectors: [[120, 240, P.furShade]],
      caps: "point",
    });
    for (const t of [0.3, 0.5, 0.68]) {
      const c = ch.at(t);
      const rr = (rad * (0.45 + 1.15 * Math.sin(Math.PI * (t * 0.8 + 0.15)) ** 0.8) + 0.02) * 1.03;
      b.part(new THREE.TorusGeometry(rr, 0.012, 5, 14), P.crimson, { bone: c.bone, at: c.at, dir: c.tangent, axis: "z" });
    }
    for (let j = 0; j < 5; j++) {
      const t = 0.2 + j * 0.15 + r() * 0.05;
      const c = ch.at(t);
      const ang = r() * Math.PI * 2;
      const rr = rad * 0.9;
      const off = c.normal.clone().multiplyScalar(Math.cos(ang) * rr).add(c.binormal.clone().multiplyScalar(Math.sin(ang) * rr));
      const p = c.at.clone().add(off);
      b.spike(p, off.clone().normalize().add(c.tangent.clone().multiplyScalar(0.8)), 0.1, 0.03, { color: j % 2 ? P.fur : "#f7e2a0", bone: c.bone });
    }
    const tip = ch.at(1);
    b.part(new THREE.ConeGeometry(0.035, 0.12, 6), DEEP, { bone: tip.bone, at: tip.at, dir: tip.tangent });
  }
}
    return buildTails;
  })(),
  // spiritFlames
  (() => {
function buildSpiritFlames({ b, J, P, M }: any) {
  const r = rng(11);
  const CY = P.flameCyan, BL = P.flameBlue, CO = P.flameCore;

  // Teardrop flame: layered cones plus a round base, built upright (+Y) at a position.
  const flame = (at: number[], s: number, bone: any, tilt = 0) => {
    const layers: [string, number, number, number][] = [
      [BL, 1, 1, 0],
      [CY, 0.72, 0.8, 0.02],
      [CO, 0.45, 0.58, 0.03],
    ];
    for (const [col, k, hk, dy] of layers) {
      const rad = 0.05 * s * k;
      const h = 0.22 * s * hk;
      glow(
        b.part(new THREE.SphereGeometry(rad, 8, 6), col, {
          bone,
          at: [at[0], at[1] + dy * s, at[2]],
        }),
        1.3,
      );
      glow(
        b.part(new THREE.ConeGeometry(rad * 0.98, h, 8), col, {
          bone,
          at: [at[0] + tilt * h * 0.15, at[1] + h / 2 + dy * s, at[2]],
          rotation: [0, 0, -tilt * 12],
        }),
        1.3,
      );
    }
  };

  // Nine tail-tip flames: fan arc behind hips, tallest in the middle.
  for (let i = 0; i < 9; i++) {
    const a = (i - 4) / 4; // -1..1
    const x = -a * 1.1;
    const y = 1.15 + (1 - a * a) * 0.35 + 0.1;
    const z = -1.5 - (1 - a * a) * 0.2;
    flame([x, Math.min(y, 1.4), z], 1.1, J.hips, -a);
  }

  // Ten drifting flames orbiting the body at different heights.
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2 + 0.3;
    const rad = 0.75 + r() * 0.3;
    const x = Math.sin(ang) * rad;
    let z = -0.3 + Math.cos(ang) * rad * 0.9;
    if (z > 0.7 && Math.abs(x) < 0.35) z = 0.75; // keep clear of the face
    const y = 0.45 + r() * 1.0;
    flame([x, Math.min(y, 1.3), Math.max(Math.min(z, 0.95), -1.2)], 0.45 + r() * 0.3, i % 2 ? J.hips : J.chest);
  }

  // Embers.
  for (let i = 0; i < 24; i++) {
    const ang = r() * Math.PI * 2;
    const rad = 0.6 + r() * 0.65;
    const p = [Math.sin(ang) * rad, 0.3 + r() * 1.2, -0.4 + Math.cos(ang) * rad * 0.8];
    glow(
      b.part(new THREE.SphereGeometry(0.012 + r() * 0.012, 6, 4), r() > 0.5 ? CY : CO, {
        bone: J.hips,
        at: p,
      }),
      1.5,
    );
  }

  // Two thin ring ribbons of cyan.
  for (const [y, rad, ph] of [[0.55, 0.85, 0], [1.05, 1.0, 1]] as number[][]) {
    glow(
      b.part(new THREE.TorusGeometry(rad, 0.01, 4, 40), CY, {
        bone: J.hips,
        at: [0, y, -0.2],
        rotation: [90 + (ph ? -8 : 6), 0, 0],
      }),
      1.2,
    );
  }

  // Wisps trailing above the shoulders.
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      flame([s * (0.28 + k * 0.1), 1.3 + k * 0.1, 0.25 - k * 0.2], 0.28 - k * 0.04, J.chest, s * 0.6);
    }
  }
}
    return buildSpiritFlames;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "kitsuneNineTails" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.95,-0.45], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,0.97,0.1], dir: [0,0,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1.05,0.5], dir: [0,0.7,0.7], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.4,0.8], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.32,0.88], dir: [0,0,1], role: "jaw" });
  J["legFL"] = b.joint("legFL", { parent: J["chest"], at: [0.17,0.85,0.4], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legFR"] = b.joint("legFR", { parent: J["chest"], at: [-0.17,0.85,0.4], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legBL"] = b.joint("legBL", { parent: J["hips"], at: [0.17,0.85,-0.45], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legBR"] = b.joint("legBR", { parent: J["hips"], at: [-0.17,0.85,-0.45], dir: [0,-1,0], role: "leg", group: "legs" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,1,-0.55], dir: [1,0.5,-1], role: "tail", group: "tails" });
  J["tail2"] = b.joint("tail2", { parent: J["hips"], at: [0,1,-0.55], dir: [0.75,0.7,-1], role: "tail", group: "tails" });
  J["tail3"] = b.joint("tail3", { parent: J["hips"], at: [0,1,-0.55], dir: [0.5,0.9,-1], role: "tail", group: "tails" });
  J["tail4"] = b.joint("tail4", { parent: J["hips"], at: [0,1,-0.55], dir: [0.25,1,-1], role: "tail", group: "tails" });
  J["tail5"] = b.joint("tail5", { parent: J["hips"], at: [0,1,-0.55], dir: [0,1.1,-1], role: "tail", group: "tails" });
  J["tail6"] = b.joint("tail6", { parent: J["hips"], at: [0,1,-0.55], dir: [-0.25,1,-1], role: "tail", group: "tails" });
  J["tail7"] = b.joint("tail7", { parent: J["hips"], at: [0,1,-0.55], dir: [-0.5,0.9,-1], role: "tail", group: "tails" });
  J["tail8"] = b.joint("tail8", { parent: J["hips"], at: [0,1,-0.55], dir: [-0.75,0.7,-1], role: "tail", group: "tails" });
  J["tail9"] = b.joint("tail9", { parent: J["hips"], at: [0,1,-0.55], dir: [-1,0.5,-1], role: "tail", group: "tails" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
