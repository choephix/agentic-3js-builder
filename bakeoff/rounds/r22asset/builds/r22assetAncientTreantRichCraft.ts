import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { countershade, gradient, grain, mottle, noise, paint, scales } from "../../../../src/paint";
import type { ColorInput, Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import type { Joint } from "../../../../src/skeleton";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: heavy mossy bark body, oversized fists, antler crown and leafy canopy, glowing amber eyes and a green heart of nature in its chest.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const BARK_A = "#6b4a2e";
const BARK_B = "#7d5836";
const BARK_C = "#573a22";
const BARK_EDGE = "#2b1a0f";
const UNDER = "#3a2414";
const SOIL = "#2e2016";
const MOSS = "#6fa032";
const MOSS_HI = "#9ac646";
const LEAF_A = "#4f9a35";
const LEAF_B = "#7cbf48";
const LEAF_DK = "#2f6a2a";
const TWIG = "#5c3f26";
const HORN = "#c9a56a";
const GOLD = "#e0b13a";
const VINE = "#4c8a2e";
const DARK = "#150c07";
const AMBER = "#ffb21a";
const HEART = "#8dff5c";
const SHROOM = "#d9772b";
const IVORY = "#efe2bd";

const helix = (a: THREE.Vector3, bb: THREE.Vector3, r: number, turns: number, n: number) => {
  const d = bb.clone().sub(a);
  const len = d.length();
  d.normalize();
  const u = new THREE.Vector3(0, 0, 1).cross(d).normalize();
  const v = d.clone().cross(u);
  return Array.from({ length: n + 1 }, (_, i) => {
    const k = i / n;
    const ang = k * turns * Math.PI * 2;
    return a
      .clone()
      .addScaledVector(d, len * k)
      .addScaledVector(u, Math.cos(ang) * r)
      .addScaledVector(v, Math.sin(ang) * r);
  });
};

export default function build() {
  const b = createBuilder({ name: "ancientTreant" });
  const R = rng(11);

  // ---------- paints ----------
  const mossCover = (base: ColorInput) =>
    paint((p, n) =>
      n.y > 0.4 + 0.6 * (noise(p, 0.35, 9) - 0.5)
        ? mottle(MOSS, MOSS_HI, { size: 0.14, seed: 5 })
        : base,
    );
  const barkPlates = scales([BARK_A, BARK_B, BARK_C], BARK_EDGE, { size: 0.17, width: 0.22, seed: 2 });
  const barkGrain = grain(BARK_A, BARK_C, { size: 0.045, axis: "y", seed: 4 });
  const bark = countershade(mossCover(barkPlates), UNDER, { level: -0.5, soft: 0.5 });
  const limbBark = countershade(mossCover(mottle(barkGrain, barkPlates, { size: 0.3, seed: 6 })), UNDER, {
    level: -0.5,
    soft: 0.5,
  });
  const legBark = gradient(limbBark, SOIL, [0, 0.7, 0], [0, 0.08, 0]);
  const twigBark = countershade(barkGrain, UNDER, { level: -0.4, soft: 0.5 });
  const canopy = countershade(mottle(LEAF_A, LEAF_B, { size: 0.3, seed: 7 }), LEAF_DK, { level: -0.1, soft: 0.5 });

  // ---------- textures ----------
  const leafGreen = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 47 C1 35 2 13 16 1 C30 13 31 35 16 47Z" fill="#4c9a34"/><path d="M16 47 C1 35 2 13 16 1 L16 47Z" fill="#6bbf45"/><path d="M16 46 L16 7" stroke="#2c6a24" stroke-width="2"/><path d="M16 36 L8 28 M16 28 L24 19 M16 20 L9 14" stroke="#2c6a24" stroke-width="1.5" fill="none"/></svg>`,
    { size: 128 },
  );
  const leafGold = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 47 C1 35 2 13 16 1 C30 13 31 35 16 47Z" fill="#d9a52a"/><path d="M16 47 C1 35 2 13 16 1 L16 47Z" fill="#f0c850"/><path d="M16 46 L16 7" stroke="#8a5a14" stroke-width="2"/><path d="M16 36 L8 28 M16 28 L24 19 M16 20 L9 14" stroke="#8a5a14" stroke-width="1.5" fill="none"/></svg>`,
    { size: 128 },
  );
  const tassel = svg(
    `<svg viewBox="0 0 24 64"><path d="M12 0 C6 20 14 40 8 63 L13 63 C19 40 11 20 16 0Z" fill="#5d9a34"/><path d="M5 0 C2 14 7 26 3 44 L7 44 C10 26 6 14 9 0Z" fill="#7cbf48"/><path d="M17 0 C14 12 20 24 18 38 L22 38 C23 24 19 12 22 0Z" fill="#4c8a2e"/></svg>`,
    { size: 128 },
  );
  const leaves = [leafGreen, leafGreen, leafGold];

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.5, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.5, 0],
      [0, 1.95, 0],
      [0, 2.4, 0.08],
      [0, 2.85, 0.18],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const waist = spine.joints[1];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 2.85, 0.18],
      [0, 3.1, 0.3],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 3.1, 0.3], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.2, 0.45], aim: [0, 3.1, 0.85], role: "jaw" });

  // ---------- helpers ----------
  const ball = (
    rx: number,
    ry: number,
    rz: number,
    at: number[],
    bone: Joint,
    color: string | Paint,
    seg = 8,
  ) =>
    b.part(new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2)), color, { at, bone, scale: [rx, ry, rz] });
  const box = (w: number, h: number, d: number, at: number[], bone: Joint, color: string | Paint, rotation?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, rotation });

  const branch = (pts: number[][], r0: number, bone: Joint, nLeaves: number, twigs = 2) => {
    const path = catmull(pts);
    b.sweep(path, [r0, r0 * 0.18], { bone, color: twigBark, caps: { start: "flat", end: "point" }, sides: 6 });
    const fr = [];
    for (let i = 0; i < nLeaves; i++) {
      const t = 0.3 + (0.7 * i) / Math.max(nLeaves - 1, 1);
      const p = path.at(t);
      const T = path.tangentAt(t);
      const d = new THREE.Vector3(T.x + (R() - 0.5) * 1.4, T.y + (R() - 0.3) * 1.0, T.z + (R() - 0.5) * 1.4).normalize();
      fr.push(frame(p, d));
    }
    for (let k = 0; k < twigs; k++) {
      const t = 0.35 + (0.5 * k) / Math.max(twigs, 1);
      const p = path.at(t);
      const T = path.tangentAt(t);
      const side = k % 2 ? 1 : -1;
      const d = new THREE.Vector3(T.x + side * 0.9, T.y + 0.2, T.z + (R() - 0.5) * 0.8).normalize();
      b.spike(p, d, r0 * 5, r0 * 0.35, { bone, color: TWIG, sides: 5 });
      const tip = p.clone().addScaledVector(d, r0 * 5);
      fr.push(frame(tip, d), frame(tip, T));
    }
    b.cards(fr, leaves, { size: [0.2, 0.28], lean: 35, bend: 20, vary: 0.35, spin: 180, rng: R, bone });
  };

  // ---------- torso ----------
  const torso = b.sweep(spine, (t) => [0.5 + 0.3 * t + 0.08 * Math.sin(t * Math.PI), 0.44 + 0.1 * t], {
    color: bark,
    sides: 10,
    caps: "flat",
  });
  ball(0.62, 0.42, 0.5, [0, 1.5, 0], hips, bark, 10);
  ball(0.8, 0.3, 0.55, [0, 2.8, 0.1], chest, bark, 10);
  const neckTube = b.sweep(neck, [0.26, 0.22], { color: bark, caps: "flat", sides: 8 });
  void neckTube;

  // chest: heart of nature
  glow(b.part(new THREE.SphereGeometry(0.13, 10, 8), HEART, { at: [0, 2.45, 0.58], bone: chest }), 1.6);
  b.part(new THREE.TorusGeometry(0.2, 0.05, 6, 10), BARK_C, { at: [0, 2.45, 0.56], bone: chest });
  const skin = b.surface(torso);
  const heartAngles = [20, 80, 140, 200, 260, 320];
  for (const a of heartAngles) {
    const rad = (a * Math.PI) / 180;
    const dx = Math.sin(rad);
    const dy = Math.cos(rad);
    const wob = (R() - 0.5) * 0.1;
    const vein = skin.drape(
      catmull([
        [dx * 0.2, 2.45 + dy * 0.2, 0.58],
        [dx * 0.38 + wob, 2.45 + dy * 0.38, 0.58],
        [dx * 0.58, 2.45 + dy * 0.6 + wob, 0.52],
      ]),
      { lift: 0.012 },
    );
    glow(b.sweep(vein, 0.017, { color: HEART, sides: 5, bone: chest }), 1.2);
  }

  // belt of vine with gold rivets
  const beltLoop = skin.loop(waist, { lift: 0.035 });
  b.sweep(beltLoop, 0.055, { color: VINE, sides: 6 });
  b.along(skin.loop(waist, { lift: 0.08 }), 12, (at) => {
    b.part(new THREE.SphereGeometry(0.055, 6, 4), GOLD, { at });
  });
  // bandolier vine
  const band = skin.drape(
    catmull([
      [0.72, 2.9, 0.2],
      [0.3, 2.5, 0.58],
      [-0.3, 2.05, 0.55],
      [-0.65, 1.65, 0.22],
    ]),
    { lift: 0.03 },
  );
  b.sweep(band, 0.045, { color: VINE, sides: 6, bone: waist });

  // bark knots and fungus on the body
  const knots = skin.scatter(30, { rng: R, minDist: 0.22, filter: (h) => h.n.y > -0.3 && h.n.z < 0.6 });
  for (const h of knots) b.stick(new THREE.ConeGeometry(0.07, 0.22, 5), BARK_C, h, { embed: 0.3 });
  const shelves = skin.scatter(6, { rng: R, minDist: 0.4, filter: (h) => h.n.z < -0.3 && h.at.y > 1.8 });
  for (const h of shelves) b.stick(new THREE.CylinderGeometry(0.15, 0.1, 0.05, 8), SHROOM, h, { embed: 0.3 });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.38, 1.5, 0],
        [s * 0.42, 0.88, 0.12],
        [s * 0.42, 0.3, 0],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg", contact: [s * 0.42, 0, 0.2] },
    );
    const legTube = b.sweep(leg, [0.34, 0.28, 0.2], { color: legBark, sides: 8 });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    ball(0.28, 0.26, 0.32, [s * 0.42, 0.88, 0.14], knee, legBark, 8);
    box(0.54, 0.22, 0.82, [s * 0.42, 0.11, 0.2], ankle, legBark);
    box(0.6, 0.1, 0.3, [s * 0.42, 0.2, 0.0], ankle, mossCover(barkPlates));
    for (let i = 0; i < 3; i++) {
      const o = i - 1;
      b.spike([s * 0.42 + o * 0.17, 0.12, 0.55], [o * 0.15, -0.05, 1], 0.3, 0.09, { bone: ankle, color: BARK_C, sides: 6 });
    }
    for (const h of b.surface(legTube).scatter(12, { rng: R, minDist: 0.2, filter: (q) => q.n.y > -0.3 && q.at.y > 0.4 }))
      b.stick(new THREE.ConeGeometry(0.06, 0.2, 5), BARK_C, h, { embed: 0.3 });
    b.sweep(helix(new THREE.Vector3(s * 0.42, 0.78, 0.1), new THREE.Vector3(s * 0.42, 0.4, 0.0), 0.25, 1.3, 14), 0.028, {
      bone: knee,
      color: VINE,
      sides: 5,
    });
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = new THREE.Vector3(s * 0.9, 2.65, 0.1);
    const el = new THREE.Vector3(s * 1.5, 2.05, 0.2);
    const wr = new THREE.Vector3(s * 1.8, 1.3, 0.45);
    const arm = b.chain(`arm${side}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];
    const armTube = b.sweep(arm, [0.3, 0.27, 0.2], { color: limbBark, sides: 8 });
    // pauldron
    ball(0.44, 0.36, 0.42, [s * 0.88, 2.78, 0.1], shoulder, limbBark, 8);
    for (let k = 0; k < 5; k++) {
      const ang = (k / 5) * Math.PI * 2 + 0.4;
      const cx = Math.cos(ang);
      const cz = Math.sin(ang);
      b.spike([s * 0.88 + cx * 0.28, 2.95, 0.1 + cz * 0.28], [cx * 0.5, 1, cz * 0.5], 0.36, 0.06, {
        bone: shoulder,
        color: HORN,
        sides: 5,
      });
    }
    const hang = [];
    for (let k = 0; k < 7; k++) {
      const ang = (k / 7) * Math.PI * 2;
      hang.push(frame([s * 0.88 + Math.cos(ang) * 0.34, 2.82, 0.1 + Math.sin(ang) * 0.34], [0, 1, 0]));
    }
    b.cards(hang, tassel, { size: [0.12, 0.34], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R, bone: shoulder });
    // elbow knob
    ball(0.3, 0.28, 0.3, [el.x, el.y, el.z], elbow, limbBark, 8);
    b.spike([el.x + s * 0.2, el.y + 0.05, el.z - 0.05], [s * 1, 0.3, -0.2], 0.3, 0.08, { bone: elbow, color: HORN, sides: 5 });
    for (const h of b.surface(armTube).scatter(12, { rng: R, minDist: 0.22, filter: (q) => q.n.y > -0.3 }))
      b.stick(new THREE.ConeGeometry(0.06, 0.2, 5), BARK_C, h, { embed: 0.3 });
    // vine wrapped on forearm
    b.sweep(helix(el.clone().lerp(wr, 0.2), el.clone().lerp(wr, 0.85), 0.25, 1.4, 16), 0.028, {
      bone: elbow,
      color: VINE,
      sides: 5,
    });
    // gold cuff
    const fd = wr.clone().sub(el).normalize();
    b.part(new THREE.CylinderGeometry(0.25, 0.27, 0.1, 8), GOLD, {
      at: wr.clone().addScaledVector(fd, -0.14),
      dir: fd,
      bone: wrist,
    });
    b.part(new THREE.CylinderGeometry(0.22, 0.26, 0.06, 8), BARK_EDGE, {
      at: wr.clone().addScaledVector(fd, -0.04),
      dir: fd,
      bone: wrist,
    });
    // hand
    box(0.42, 0.36, 0.26, [s * 1.82, 1.2, 0.45], wrist, limbBark);
    ball(0.16, 0.12, 0.14, [s * 1.82, 1.06, 0.34], wrist, BARK_C, 6);
    for (let i = 0; i < 3; i++) {
      const z = 0.34 + 0.12 * i;
      const x = s * (1.72 + 0.1 * i);
      const f = b.chain(
        `finger${side}${i}`,
        polyline([
          [x, 1.08, z],
          [x + s * 0.03, 0.76, z + 0.05],
          [x + s * 0.05, 0.46, z + 0.12],
        ]),
        { parent: wrist, names: [`finger${side}${i}a`, `finger${side}${i}b`], role: "digit" },
      );
      b.sweep(f, [0.085, 0.05, 0.016], { color: limbBark, sides: 6, caps: { start: "round", end: "point" } });
      ball(0.075, 0.07, 0.075, [x + s * 0.03, 0.76, z + 0.05], f.joints[1], BARK_C, 6);
    }
    const th = b.chain(
      `thumb${side}`,
      polyline([
        [s * 1.68, 1.18, 0.56],
        [s * 1.6, 0.95, 0.76],
        [s * 1.58, 0.78, 0.92],
      ]),
      { parent: wrist, names: [`thumb${side}a`, `thumb${side}b`], role: "digit" },
    );
    b.sweep(th, [0.09, 0.055, 0.016], { color: limbBark, sides: 6, caps: { start: "round", end: "point" } });
  }

  // ---------- head ----------
  ball(0.38, 0.38, 0.36, [0, 3.38, 0.42], head, bark, 10);
  for (const s of [1, -1]) {
    ball(0.13, 0.12, 0.12, [s * 0.3, 3.26, 0.52], head, bark, 6);
    box(0.32, 0.1, 0.2, [s * 0.17, 3.5, 0.7], head, BARK_C, [0, 0, s * -14]);
    ball(0.08, 0.06, 0.05, [s * 0.16, 3.4, 0.72], head, DARK, 6);
    glow(b.part(new THREE.SphereGeometry(0.045, 6, 5), AMBER, { at: [s * 0.16, 3.4, 0.76], bone: head }), 1.6);
    b.spike([s * 0.34, 3.4, 0.3], [s * 1, 0.2, -0.3], 0.28, 0.06, { bone: head, color: HORN, sides: 5 });
    b.spike([s * 0.14, 3.13, 0.7], [0, 1, 0.1], 0.1, 0.03, { bone: jaw, color: IVORY, sides: 5 });
  }
  b.spike([0, 3.33, 0.76], [0, -0.4, 1], 0.18, 0.08, { bone: head, color: BARK_C, sides: 6 });
  box(0.44, 0.12, 0.2, [0, 3.2, 0.68], head, bark);
  box(0.38, 0.06, 0.22, [0, 3.13, 0.66], head, DARK);
  box(0.46, 0.14, 0.3, [0, 3.07, 0.62], jaw, bark);
  const beard = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * Math.PI - Math.PI / 2;
    beard.push(frame([Math.sin(a) * 0.24, 3.0, 0.58 + Math.cos(a) * 0.12], [0, 1, 0]));
  }
  b.cards(beard, tassel, { size: [0.12, 0.42], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R, bone: jaw });

  // crown and canopy
  for (const s of [1, -1]) {
    branch([[s * 0.25, 3.6, 0.35], [s * 0.45, 3.9, 0.3], [s * 0.62, 4.25, 0.2], [s * 0.55, 4.65, 0.1]], 0.08, head, 5);
    branch([[s * 0.3, 3.7, 0.2], [s * 0.8, 3.95, 0.0], [s * 1.1, 4.3, -0.1]], 0.07, head, 4);
    branch([[s * 0.5, 2.8, -0.35], [s * 0.9, 3.6, -0.6], [s * 1.2, 4.2, -0.5]], 0.13, chest, 6, 3);
    ball(0.3, 0.26, 0.3, [s * 1.0, 3.5, -0.5], chest, canopy, 6);
  }
  branch([[0, 2.9, -0.3], [0, 3.4, -0.5], [0, 4.0, -0.4], [0, 4.5, -0.2]], 0.2, chest, 6, 3);
  const clusters: number[][] = [
    [0, 4.45, -0.1, 0.55],
    [0.5, 4.25, 0, 0.45],
    [-0.5, 4.25, 0, 0.45],
    [0.25, 4.75, -0.2, 0.4],
    [-0.3, 4.7, -0.1, 0.4],
    [0.9, 4.0, -0.2, 0.35],
    [-0.9, 4.0, -0.2, 0.35],
    [0, 4.1, -0.5, 0.5],
    [0.4, 4.1, 0.35, 0.3],
    [-0.4, 4.15, 0.35, 0.3],
  ];
  const leafFrames = [];
  for (const [x, y, z, r] of clusters) {
    b.part(new THREE.IcosahedronGeometry(r, 1), canopy, { at: [x, y, z], bone: head, flat: true });
    for (let k = 0; k < 16; k++) {
      const v = new THREE.Vector3(R() - 0.5, R() * 0.9 - 0.2, R() - 0.5).normalize();
      leafFrames.push(frame(new THREE.Vector3(x, y, z).addScaledVector(v, r * 0.9), v));
    }
  }
  b.cards(leafFrames, leaves, { size: [0.24, 0.32], lean: 45, bend: 20, vary: 0.35, spin: 180, rng: R, bone: head });

  return b.root;
}
