import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { mottle, noise, paint, scales } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: gnarled bark body with moss-covered shoulders, root feet, antler branches crowned in golden maple leaves, a bearded wooden face with glowing amber eyes and a glowing heartwood crack in the chest. Chunky hand-painted Warcraft proportions.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type V = [number, number, number];
const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "ancientTreant", paintSize: 2048 });
  const R = rng(11);
  type C = ReturnType<typeof b.chain>;

  // ---------------------------------------------------------------- palette & paints
  const EDGE_M = "#2e1c10";
  const BARK_MID = scales(["#7a5632", "#6d4c2b", "#845f38"], EDGE_M, { size: 0.12, width: 0.22, seed: 4 });
  const BARK_LIT = scales(["#a47848", "#966c3f", "#b08150"], "#3a2413", { size: 0.12, width: 0.22, seed: 4 });
  const BARK_DARK = scales(["#523620", "#4a301c", "#5a3b24"], "#22140b", { size: 0.12, width: 0.22, seed: 4 });
  const MOSS_LIGHT = mottle("#86b83a", "#6aa02e", { size: 0.09, seed: 2 });
  const MOSS_DARK = mottle("#4f8a26", "#3e7220", { size: 0.1, seed: 3 });
  const woody = paint((p, n) => {
    const m = noise(p, 0.4, 11) + n.y * 0.5 + (p.y < 0.7 ? 0.12 : 0) - 0.12;
    if (m > 0.84) return MOSS_LIGHT;
    if (m > 0.72) return MOSS_DARK;
    return n.y > 0.35 ? BARK_LIT : n.y < -0.3 ? BARK_DARK : BARK_MID;
  });
  const TWIG = "#6e4b2a";
  const RIDGE = "#8f6a3f";
  const ROOT = "#5a3c22";
  const VINE = "#3d7a24";
  const DARK = "#1f130a";
  const CLAW = "#3b2a1a";
  const BEARD = "#cdbb92";
  const AMBER = "#ffc233";

  // ---------------------------------------------------------------- textures
  const MAPLE_Y = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 62 L30 48 L12 52 L18 38 L4 30 L20 26 L14 10 L28 18 L32 2 L36 18 L50 10 L44 26 L60 30 L46 38 L52 52 L34 48 Z" fill="#f1cf3a" stroke="#b5871c" stroke-width="2"/><path d="M32 62 V12 M32 44 L14 32 M32 44 L50 32 M32 30 L20 18 M32 30 L44 18" stroke="#b5871c" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
  const MAPLE_G = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 62 L30 48 L12 52 L18 38 L4 30 L20 26 L14 10 L28 18 L32 2 L36 18 L50 10 L44 26 L60 30 L46 38 L52 52 L34 48 Z" fill="#b9d438" stroke="#5f8a1c" stroke-width="2"/><path d="M32 62 V12 M32 44 L14 32 M32 44 L50 32 M32 30 L20 18 M32 30 L44 18" stroke="#5f8a1c" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
  const IVY_A = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 62 C10 50 2 30 14 18 C22 10 28 14 32 4 C36 14 42 10 50 18 C62 30 54 50 32 62Z" fill="#4f9a2c" stroke="#2c6218" stroke-width="2"/><path d="M32 60 V10 M32 46 L16 30 M32 46 L48 30" stroke="#2c6218" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
  const IVY_B = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 62 C10 50 2 30 14 18 C22 10 28 14 32 4 C36 14 42 10 50 18 C62 30 54 50 32 62Z" fill="#79b83a" stroke="#3f7a20" stroke-width="2"/><path d="M32 60 V10 M32 46 L16 30 M32 46 L48 30" stroke="#3f7a20" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 64 64"><path d="M6 64 Q8 30 2 10 L18 64Z" fill="#5f9a2c"/><path d="M20 64 Q26 30 30 4 L36 64Z" fill="#7fb73a"/><path d="M34 64 L46 12 Q48 40 50 64Z" fill="#4e8a28"/><path d="M48 64 Q58 36 62 22 L62 64Z" fill="#6aa02e"/></svg>`,
    { size: 128 },
  );
  const CRACKS = svg(
    `<svg viewBox="0 0 100 100"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M50 2 L42 18 L56 30 L40 46 L54 60 L44 78 L52 98" stroke="#3be08a" stroke-width="5"/><path d="M42 18 L24 24 L16 40 M56 30 L74 34 L84 52 M40 46 L26 58 M54 60 L70 70 M44 78 L30 88" stroke="#3be08a" stroke-width="4"/><path d="M50 2 L42 18 L56 30 L40 46 L54 60 L44 78 L52 98" stroke="#d6ffe9" stroke-width="1.8"/><path d="M42 18 L24 24 L16 40 M56 30 L74 34 L84 52" stroke="#b8ffd8" stroke-width="1.4"/></g></svg>`,
    { size: 256 },
  );
  const KNOT = svg(
    `<svg viewBox="0 0 100 100"><g fill="none"><ellipse cx="50" cy="50" rx="46" ry="46" stroke="#3a2412" stroke-width="6"/><ellipse cx="50" cy="50" rx="34" ry="33" stroke="#4a2f1a" stroke-width="5"/><ellipse cx="50" cy="50" rx="23" ry="22" stroke="#3a2412" stroke-width="5"/><ellipse cx="50" cy="50" rx="12" ry="11" stroke="#4a2f1a" stroke-width="5"/></g><ellipse cx="50" cy="50" rx="5" ry="5" fill="#2a180b"/></svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.85, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.85, 0],
      [0, 2.4, 0.04],
      [0, 2.95, 0.09],
      [0, 3.35, 0.12],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 3.35, 0.12],
      [0, 3.58, 0.28],
      [0, 3.7, 0.38],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 3.7, 0.38], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.62, 0.42], aim: [0, 3.55, 0.8], role: "jaw" });

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 1.65, 0], w: 0.95, h: 0.75 },
      { at: [0, 2.2, 0.02], w: 0.9, h: 0.72 },
      { at: [0, 2.75, 0.06], w: 1.25, h: 0.9 },
      { at: [0, 3.2, 0.1], w: 1.5, h: 0.95 },
      { at: [0, 3.45, 0.1], w: 0.9, h: 0.7 },
    ],
    { bone: [hips, spine], color: woody, name: "torso" },
  );
  const skin = b.surface(torso);
  b.sweep(neck, [0.3, 0.27], { color: woody, name: "neck" });

  // back hump and shoulder burls
  const backBurl = b.part(new THREE.SphereGeometry(1, 8, 6), woody, {
    bone: chest,
    at: [0, 3.15, -0.42],
    scale: [0.55, 0.5, 0.36],
  });
  const shoulderParts: ReturnType<typeof b.part>[] = [backBurl];
  for (const s of [1, -1]) {
    shoulderParts.push(
      b.part(new THREE.SphereGeometry(1, 8, 6), woody, { bone: chest, at: [s * 0.92, 3.32, 0.04], scale: [0.45, 0.4, 0.42] }),
    );
    shoulderParts.push(
      b.part(new THREE.SphereGeometry(1, 7, 5), woody, { bone: chest, at: [s * 0.55, 3.55, -0.05], scale: [0.3, 0.2, 0.28] }),
    );
  }

  // pectoral and rib ridges draped on the torso
  for (const s of [1, -1]) {
    const pec = skin.drape(
      catmull([
        [s * 0.08, 3.25, 0.7],
        [s * 0.4, 3.05, 0.7],
        [s * 0.58, 2.7, 0.6],
      ]),
      { lift: 0.0 },
    );
    b.sweep(pec, [0.06, 0.03], { color: RIDGE, sides: 6 });
    for (const y of [2.45, 2.15]) {
      const rib = skin.drape(
        catmull([
          [s * 0.05, y, 0.7],
          [s * 0.3, y - 0.07, 0.65],
          [s * 0.5, y - 0.2, 0.5],
        ]),
        { lift: 0.0 },
      );
      b.sweep(rib, [0.045, 0.02], { color: RIDGE, sides: 6 });
    }
  }
  // vertical back ridges
  for (const x of [-0.25, 0.25]) {
    const spineRidge = skin.drape(
      catmull([
        [x, 3.3, -0.6],
        [x * 1.1, 2.8, -0.52],
        [x, 2.2, -0.48],
        [x * 0.8, 1.8, -0.4],
      ]),
      { lift: 0.0 },
    );
    b.sweep(spineRidge, [0.06, 0.03], { color: RIDGE, sides: 6 });
  }

  // heartwood: ring knot and glowing cracks
  b.decal(torso, KNOT, { at: [-0.3, 2.95, 0.6], dir: [0, 0, 1], size: [0.4, 0.4], lift: 0.003 });
  glow(b.decal(torso, CRACKS, { at: [0.12, 2.55, 0.5], dir: [0, 0, 1], size: [0.7, 0.95], lift: 0.008 }), 1.3);

  // vine draped over the torso
  const vinePath = skin.drape(
    catmull([
      [0.55, 3.38, 0.4],
      [0.3, 3.0, 0.68],
      [-0.1, 2.6, 0.68],
      [-0.3, 2.2, 0.55],
      [-0.15, 1.85, 0.45],
    ]),
    { lift: 0.025 },
  );
  b.sweep(vinePath, 0.028, { color: VINE, sides: 5 });
  const vineHits = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95].map((t) => skin.nearest(vinePath.at(t)));
  b.cards(vineHits, [IVY_A, IVY_B], { size: [0.16, 0.18], lean: 55, bend: 20, spin: 180, vary: 0.3, rng: R });

  // pelvis wrap vine and root skirt
  const belt = skin.loop(spine.joints[0], { lift: 0.03 });
  b.sweep(belt, 0.035, { color: VINE, sides: 5 });
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const wob = Math.sin(k * 2.3) * 0.12;
    b.sweep(
      catmull([
        [c * 0.5, 1.75, sn * 0.42],
        [c * 0.57, 1.45 + wob * 0.3, sn * 0.48],
        [c * 0.6, 1.05 + wob, sn * 0.5],
      ]),
      [0.06, 0.012],
      { color: ROOT, bone: hips, sides: 5, caps: { end: "point" } },
    );
  }

  // bark plates over the torso
  for (const hit of skin.scatter(34, { rng: R, minDist: 0.22, filter: (h) => h.n.y > -0.4 })) {
    b.stick(new THREE.BoxGeometry(0.18, 0.04, 0.12), "#8b653b", hit, { embed: 0.4, spin: R() * 360 });
  }

  // ---------------------------------------------------------------- legs
  const mushrooms: V[] = [];
  const legSweeps: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.48, 1.75, 0], [s * 0.58, 0.2, 0.12], [0.88, 0.87], [[0, 0, 1]]);
    const leg: C = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.58, 0, 0.12],
    });
    const legSweep = b.sweep(leg, [0.42, 0.36, 0.2], { color: woody, name: `leg${S}` });
    legSweeps.push(legSweep);
    const ankle = leg.tip!;
    const knee = pts[1];
    b.part(new THREE.SphereGeometry(1, 8, 6), woody, {
      bone: leg.joints[1],
      at: [knee.x + s * 0.04, knee.y, knee.z + 0.22],
      scale: [0.3, 0.3, 0.26],
    });
    // buttress ridges
    for (const ang of [0.5, 2.6, 4.0]) {
      const rpts = [0, 1, 2, 3, 4].map((i) => {
        const t = 0.05 + (0.9 * i) / 4;
        const c = leg.path.at(t);
        const d = (0.42 - 0.22 * t) * 0.9;
        return [c.x + Math.cos(ang) * d, c.y, c.z + Math.sin(ang) * d] as V;
      });
      b.sweep(rpts, [0.07, 0.03], { bone: leg, color: RIDGE, caps: { end: "point" }, sides: 5 });
    }
    // foot
    b.part(new THREE.SphereGeometry(1, 8, 6), woody, {
      bone: ankle,
      at: [s * 0.58, 0.17, 0.2],
      scale: [0.36, 0.17, 0.5],
    });
    const toeAngles = [-52, -26, 0, 26, 52, 150, 210];
    for (const deg of toeAngles) {
      const a = (deg * Math.PI) / 180;
      const dx = Math.sin(a) * (s > 0 ? 1 : -1);
      const dz = Math.cos(a);
      const len = deg > 100 ? 0.42 : 0.62;
      const o: V = [s * 0.58 + dx * 0.1, 0.26, 0.12 + dz * 0.1];
      b.sweep(
        catmull([
          o,
          [o[0] + dx * len * 0.5, 0.15, o[2] + dz * len * 0.5],
          [o[0] + dx * len, 0.06, o[2] + dz * len],
        ]),
        [0.15, 0.04],
        { bone: ankle, color: woody, sides: 6 },
      );
    }
    // surface dressing
    const legSkin = b.surface(legSweep);
    for (const hit of legSkin.scatter(10, { rng: R, minDist: 0.2, filter: (h) => h.n.y > -0.3 && h.at.y > 0.3 }))
      b.stick(new THREE.BoxGeometry(0.16, 0.04, 0.11), "#8b653b", hit, { embed: 0.4, spin: R() * 360 });
    b.cards(
      legSkin.scatter(24, { rng: R, minDist: 0.1, filter: (h) => h.n.y > -0.1 && h.at.y > 0.25 }),
      [IVY_A, IVY_B],
      { size: [0.15, 0.17], lean: 60, bend: 20, spin: 180, vary: 0.3, rng: R },
    );
    for (const hit of legSkin.scatter(5, { rng: R, minDist: 0.25, filter: (h) => h.n.y > -0.2 && h.at.y > 0.3 && h.at.y < 1.4 })) {
      mushrooms.push([hit.at.x, hit.at.y, hit.at.z]);
      b.stick(new THREE.CylinderGeometry(0.014, 0.02, 0.08, 5), "#e8d9b8", hit, { embed: 0.3 });
      b.stick(new THREE.SphereGeometry(0.07, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), mushrooms.length % 2 ? "#c8773a" : "#e3a35a", hit.moved([0, 0.06, 0]), { embed: 0 });
    }
  }

  // ---------------------------------------------------------------- arms and hands
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = P(s * 0.9, 3.2, 0.05);
    const el = P(s * 1.45, 2.3, 0.2);
    const wr = P(s * 1.8, 1.45, 0.35);
    const arm: C = b.chain(`arm${S}`, catmull([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const armSweep = b.sweep(arm, [0.3, 0.27, 0.22], { color: woody, name: `arm${S}` });
    b.part(new THREE.SphereGeometry(1, 8, 6), woody, { bone: arm.joints[0], at: [s * 1.2, 2.75, 0.15], scale: [0.34, 0.4, 0.32] });
    b.part(new THREE.SphereGeometry(1, 8, 6), woody, { bone: arm.joints[1], at: [s * 1.62, 1.9, 0.3], scale: [0.3, 0.42, 0.28] });
    for (const ang of [0.4, 2.5]) {
      const rpts = [0, 1, 2, 3, 4].map((i) => {
        const t = 0.08 + (0.84 * i) / 4;
        const c = arm.path.at(t);
        const d = (0.3 - 0.08 * t) * 0.9;
        return [c.x + Math.cos(ang) * d, c.y, c.z + Math.sin(ang) * d] as V;
      });
      b.sweep(rpts, [0.06, 0.03], { bone: arm, color: RIDGE, caps: { end: "point" }, sides: 5 });
    }
    const armSkin = b.surface(armSweep);
    for (const hit of armSkin.scatter(8, { rng: R, minDist: 0.22, filter: (h) => h.n.y > -0.4 }))
      b.stick(new THREE.BoxGeometry(0.15, 0.04, 0.1), "#8b653b", hit, { embed: 0.4, spin: R() * 360 });
    b.cards(armSkin.scatter(22, { rng: R, minDist: 0.1, filter: (h) => h.n.y > -0.2 }), [IVY_A, IVY_B], {
      size: [0.15, 0.17],
      lean: 60,
      bend: 20,
      spin: 180,
      vary: 0.3,
      rng: R,
    });

    // hand
    const wristJ = arm.tip!;
    const D = P(s * 0.22, -0.93, 0.25).normalize();
    b.part(new THREE.SphereGeometry(1, 8, 6), woody, {
      bone: wristJ,
      at: wr.clone().addScaledVector(D, 0.12),
      dir: D,
      scale: [0.2, 0.26, 0.17],
    });
    const finger = (name: string, base: THREE.Vector3, mid: THREE.Vector3, tip: THREE.Vector3, r: number) => {
      const ch = b.chain(name, catmull([base, mid, tip]), { parent: wristJ, names: [`${name}a`, `${name}b`], role: "digit" });
      b.sweep(ch, [r, r * 0.45], { color: woody, sides: 6 });
      const dirv = tip.clone().sub(mid).normalize();
      b.spike(tip, tip.clone().addScaledVector(dirv, 0.16), null, r * 0.5, { color: CLAW, bone: ch.joints[1], sides: 5 });
    };
    for (let i = 0; i < 4; i++) {
      const zoff = (i - 1.5) * 0.13;
      const k = i === 1 || i === 2 ? 1.12 : 0.95;
      const base = wr.clone().addScaledVector(D, 0.22).add(P(0, 0, zoff));
      const mid = base.clone().addScaledVector(D, 0.3 * k).add(P(-s * 0.02, 0, zoff * 0.5 + 0.03));
      const tip = mid.clone().addScaledVector(D, 0.25 * k).add(P(-s * 0.06, 0, 0.08));
      finger(`finger${S}${i}`, base, mid, tip, 0.065);
    }
    const tb = wr.clone().addScaledVector(D, 0.1).add(P(-s * 0.1, 0, 0.15));
    const tm = tb.clone().add(P(-s * 0.08, -0.15, 0.22));
    const tt = tm.clone().add(P(-s * 0.08, -0.1, 0.18));
    finger(`thumb${S}`, tb, tm, tt, 0.07);
  }

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), woody, {
    bone: head,
    at: [0, 3.88, 0.45],
    scale: [0.31, 0.36, 0.34],
  });
  b.sweep(
    catmull([
      [-0.3, 3.92, 0.62],
      [-0.15, 4.0, 0.77],
      [0, 3.98, 0.8],
      [0.15, 4.0, 0.77],
      [0.3, 3.92, 0.62],
    ]),
    0.065,
    { color: RIDGE, bone: head, sides: 6 },
  );
  for (const y of [4.1, 4.18]) {
    b.sweep(
      catmull([
        [-0.2, y - 0.04, 0.68],
        [0, y, 0.75],
        [0.2, y - 0.04, 0.68],
      ]),
      0.022,
      { color: RIDGE, bone: head, sides: 5 },
    );
  }
  b.sweep(
    catmull([
      [0, 3.95, 0.77],
      [0, 3.84, 0.86],
      [0, 3.78, 0.9],
    ]),
    [0.06, 0.05],
    { color: BARK_MID, bone: head, sides: 6 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 7, 5), woody, { bone: head, at: [s * 0.2, 3.8, 0.68], scale: [0.09, 0.07, 0.08] });
    b.part(new THREE.SphereGeometry(0.075, 6, 4), DARK, { bone: head, at: [s * 0.13, 3.9, 0.72], scale: [1.3, 0.8, 0.7] });
    glow(
      b.part(new THREE.SphereGeometry(0.045, 6, 4), AMBER, { bone: head, at: [s * 0.13, 3.9, 0.745], scale: [1.5, 0.75, 1.0] }),
      1.4,
    );
    // moustache
    b.sweep(
      catmull([
        [s * 0.04, 3.74, 0.8],
        [s * 0.2, 3.62, 0.79],
        [s * 0.3, 3.45, 0.7],
      ]),
      [0.045, 0.01],
      { color: BEARD, bone: head, sides: 5, caps: { end: "point" } },
    );
    // ear burls
    b.part(new THREE.SphereGeometry(1, 6, 5), woody, { bone: head, at: [s * 0.3, 3.88, 0.4], scale: [0.07, 0.13, 0.1] });
  }
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.05), DARK, { bone: head, at: [0, 3.66, 0.75] });
  b.frustumBox([0, 3.62, 0.5], [0, 3.57, 0.78], [0.4, 0.14], [0.28, 0.12], { color: woody, bone: jaw });
  for (let i = 0; i < 11; i++) {
    const u = (i - 5) / 5;
    const x = u * 0.2;
    const z = 0.74 + 0.04 * (1 - Math.abs(u));
    b.sweep(
      catmull([
        [x, 3.56, z],
        [x * 1.25 + Math.sin(i) * 0.03, 3.3, z + 0.04],
        [x * 1.2 + Math.sin(i * 1.7) * 0.04, 2.8 + 0.35 * Math.abs(u) + R() * 0.1, z + 0.03],
      ]),
      [0.055, 0.006],
      { color: BEARD, bone: jaw, sides: 5, caps: { end: "point" } },
    );
  }
  // moss on the crown
  b.cards(
    b.surface(skull).scatter(14, { rng: R, minDist: 0.1, filter: (h) => h.n.y > 0.3 }),
    TUFT,
    { size: [0.09, 0.1], lean: 20, spin: 180, vary: 0.3, rng: R },
  );

  // ---------------------------------------------------------------- antlers and branches
  const leavesHead: THREE.Vector3[] = [];
  const leavesChest: THREE.Vector3[] = [];
  const crown = (list: THREE.Vector3[], p: THREE.Vector3, count: number) => {
    for (let i = 0; i < count; i++) list.push(p.clone().add(P((R() - 0.5) * 0.12, (R() - 0.5) * 0.12, (R() - 0.5) * 0.12)));
  };
  for (const s of [1, -1]) {
    const main = catmull([
      [s * 0.2, 4.08, 0.4],
      [s * 0.5, 4.3, 0.38],
      [s * 0.95, 4.5, 0.28],
      [s * 1.4, 4.8, 0.16],
      [s * 1.6, 5.1, 0.1],
    ]);
    b.sweep(main, [0.1, 0.025], { bone: head, color: woody, caps: { end: "point" }, sides: 7 });
    crown(leavesHead, main.at(1), 8);
    [0.3, 0.5, 0.7, 0.88].forEach((t, i) => {
      const base = main.at(t);
      const back = i % 2 === 0 ? 1 : -1;
      const dir = P(s * (0.5 + R() * 0.5), 0.7 + R() * 0.4, back * (0.3 + R() * 0.5)).normalize();
      const len = 0.45 + 0.3 * R();
      const tip = base.clone().addScaledVector(dir, len);
      const mid = base.clone().addScaledVector(dir, len * 0.5).add(P(0, 0.05, 0.07 * back));
      b.sweep(catmull([base, mid, tip]), [0.055 - 0.025 * t, 0.012], { bone: head, color: TWIG, sides: 5, caps: { end: "point" } });
      crown(leavesHead, tip, 6);
      const dir2 = P(s * (0.2 + R() * 0.4), 0.5 + R() * 0.5, -back * (0.5 + R() * 0.4)).normalize();
      const tip2 = mid.clone().addScaledVector(dir2, 0.28);
      b.sweep(catmull([mid, mid.clone().lerp(tip2, 0.5).add(P(0, 0.03, 0)), tip2]), [0.025, 0.008], {
        bone: head,
        color: TWIG,
        sides: 4,
        caps: { end: "point" },
      });
      crown(leavesHead, tip2, 5);
    });

    // branches growing from the shoulders and back
    for (const [dx, y0, z0, top] of [
      [0.9, 3.6, -0.05, 4.25],
      [0.5, 3.6, -0.35, 4.0],
    ] as const) {
      const bp = catmull([
        [s * dx, y0, z0],
        [s * (dx + 0.18), (y0 + top) / 2, z0 - 0.08],
        [s * (dx + 0.45), top, z0 - 0.15],
      ]);
      b.sweep(bp, [0.07, 0.02], { bone: chest, color: woody, caps: { end: "point" }, sides: 6 });
      crown(leavesChest, bp.at(1), 8);
      const sb = bp.at(0.6);
      const st = sb.clone().add(P(s * 0.1, 0.25, -0.2));
      b.sweep(catmull([sb, sb.clone().lerp(st, 0.5).add(P(0, 0.04, 0)), st]), [0.03, 0.008], {
        bone: chest,
        color: TWIG,
        sides: 4,
        caps: { end: "point" },
      });
      crown(leavesChest, st, 5);
    }
  }
  const leafFrames = (pts: THREE.Vector3[]) =>
    pts.map((p) => frame(p, P((R() - 0.5) * 2, 0.3 + R() * 0.9, (R() - 0.5) * 2).normalize()));
  b.cards(leafFrames(leavesHead), [MAPLE_Y, MAPLE_Y, MAPLE_G], {
    size: [0.2, 0.22],
    lean: 50,
    bend: 25,
    vary: 0.3,
    spin: 180,
    rng: R,
    bone: head,
  });
  b.cards(leafFrames(leavesChest), [MAPLE_Y, MAPLE_G, MAPLE_G], {
    size: [0.2, 0.22],
    lean: 50,
    bend: 25,
    vary: 0.3,
    spin: 180,
    rng: R,
    bone: chest,
  });

  // moss and ivy on shoulders and torso
  b.cards(
    b.surface(shoulderParts).scatter(40, { rng: R, minDist: 0.08, filter: (h) => h.n.y > 0.5 }),
    TUFT,
    { size: [0.1, 0.12], lean: 15, spin: 180, vary: 0.3, rng: R },
  );
  b.cards(
    skin.scatter(50, { rng: R, minDist: 0.1, filter: (h) => h.n.y > -0.2 && h.at.y > 1.8 }),
    [IVY_A, IVY_B],
    { size: [0.14, 0.16], lean: 60, bend: 20, spin: 180, vary: 0.3, rng: R },
  );

  return b.root;
}
