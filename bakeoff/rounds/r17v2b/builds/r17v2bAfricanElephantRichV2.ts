import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, mix, noise, paint, rgb, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "African Bush Elephant",
  description:
    "An adult bull African bush elephant in a faceted low-poly style: crackled dusty-grey hide, huge Africa-shaped ears, ridged trunk, curved ivory tusks, toenails, tasselled tail.",
  style: "low-poly",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const SKIN_D = "#6c665f";
const SKIN_L = "#9a948a";
const CREASE = "#4a4540";
const DUST = "#b48a62";
const DUST_D = "#8f6c4c";
const PINK = "#c4968f";
const PINK_D = "#a2706c";
const IVORY = "#efe6cc";
const IVORY_D = "#b9a77f";
const TIP_STAIN = "#7d5f3c";
const NAIL = "#d8ccb4";
const NAIL_D = "#a99c84";
const HAIR = "#2b2521";
const EYE = "#2d1a10";
const EYE_RING = "#8a5a2a";
const WHITE = "#fff7e6";
const MOUTH = "#b86f6c";

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Crackled, dusty elephant hide: Worley cell borders as creases, cell tone steps, dust low and on top. */
function hide(opts: { ring?: "y" | "t"; period?: number; stain?: boolean } = {}) {
  return paint((p, n, s) => {
    const cell = cells(p, 0.17, 5);
    const e = cell.d2 - cell.d1;
    const tone = Math.round((noise(p, 0.8, 1) * 0.55 + cell.id * 0.45) * 4) / 4;
    let col = mix(SKIN_D, SKIN_L, 0.15 + 0.75 * tone);
    if (e < 0.1) col = mix(col, CREASE, 0.75 * (1 - e / 0.1));
    if (opts.ring) {
      const u = opts.ring === "y" ? p.y : s[0] * (opts.period ?? 3);
      const k = opts.ring === "y" ? (opts.period ?? 0.14) : 1;
      const f = (u / k + noise(p, 0.3, 11) * 0.7) % 1;
      const w = Math.abs((f < 0 ? f + 1 : f) - 0.5);
      if (w < 0.07) col = mix(col, CREASE, 0.8);
      else if (w < 0.16) col = mix(col, SKIN_L, 0.25);
    }
    if (opts.stain) {
      const dx = Math.abs(Math.abs(p.x) - 0.53);
      if (dx < 0.035 && p.y < 3.05 && p.y > 2.55 && p.z > 1.95 && p.z < 2.4) col = mix(col, "#4e3f35", 0.85);
    }
    const low = smoothstep(1.35, 0.1, p.y);
    const top = Math.max(n.y, 0) * 0.3 * noise(p, 0.4, 9);
    const dust = Math.min(1, low * (0.45 + 0.55 * noise(p, 0.25, 4)) + top);
    col = mix(col, noise(p, 0.15, 3) > 0.5 ? DUST : DUST_D, dust * 0.85);
    return col;
  });
}

const BODY = hide();
const LEG = hide({ ring: "y", period: 0.16 });
const HEAD = hide({ stain: true });
const TRUNK_LEN = 3.0;
const TRUNK = paint((p, n, s) => {
  const base = hide().at(p, n, s);
  const f = (s[0] * TRUNK_LEN) / 0.1 + noise(p, 0.3, 12) * 0.5;
  const w = Math.abs((f - Math.floor(f)) - 0.5);
  const under = Math.abs(s[1] - 180) < 55;
  let col = mix(base, under ? PINK : SKIN_L, under ? 0.35 : 0.1);
  if (w > 0.4) col = mix(col, CREASE, 0.8);
  else if (w > 0.3) col = mix(col, SKIN_D, 0.35);
  if (s[0] > 0.93) col = mix(col, PINK, 0.55);
  return col;
});

const TUSK = paint((p, _n, s) => {
  const t = s[0];
  let col = mix(IVORY, IVORY_D, 0.2 + 0.5 * noise(p, 0.07, 2));
  const crack = Math.abs(noise(p, 0.12, 6) - 0.5);
  if (crack < 0.012) col = mix(col, IVORY_D, 0.9);
  if (t < 0.14) col = mix(col, "#8d7d62", 0.6 * (1 - t / 0.14));
  if (t > 0.86) col = mix(col, TIP_STAIN, smoothstep(0.86, 0.97, t) * 0.8);
  return col;
});

const NAILP = paint((p, n) => {
  const g = noise(p, 0.03, 8);
  return mix(NAIL, NAIL_D, 0.25 + 0.5 * g + (n.y < 0 ? 0.2 : 0));
});

const TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 64 C14 40 8 22 3 4 M16 64 C16 40 16 22 17 1 M16 64 C18 40 24 24 29 6" stroke="#2b2521" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "africanElephant", paintSize: 2048 });
  const R = rng(11);

  // ---- Skeleton: spine ------------------------------------------------------------------------------------
  const bodyPath = catmull([
    [0, 2.3, -1.5],
    [0, 2.3, -0.8],
    [0, 2.25, 0.1],
    [0, 2.3, 0.9],
    [0, 2.4, 1.35],
  ]);
  const hips = b.joint("hips", { at: [0, 2.3, -0.8], dir: [0, 0, 1], role: "spine" });
  const rootT = bodyPath.closestT(hips.at);
  const front = b.chain("spine", bodyPath.slice(rootT, 1), { parent: hips, count: 3, role: "spine" });
  const back = b.chain("pelvis", bodyPath.slice(rootT, 0), { parent: hips, count: 1, role: "spine" });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.45, 1.2],
      [0, 2.72, 1.55],
      [0, 2.9, 1.9],
    ]),
    { parent: front.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.9, 1.9], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.3, 2.0], aim: [0, 2.2, 2.75], role: "jaw" });

  // ---- Body tube -------------------------------------------------------------------------------------------
  const keys: Array<[number, number, number]> = [
    [0, 0.5, 0.6],
    [0.12, 0.8, 0.88],
    [0.3, 0.85, 0.98],
    [0.5, 0.86, 1.0],
    [0.72, 0.86, 1.04],
    [0.9, 0.78, 0.98],
    [1, 0.62, 0.8],
  ];
  const interp = (t: number): [number, number] => {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const a = keys[i - 1];
        const c = keys[i];
        const u = smoothstep(a[0], c[0], t);
        return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
      }
    }
    return [keys[6][1], keys[6][2]];
  };
  const body = b.sweep(bodyPath, interp, {
    bone: [back, hips, front],
    color: BODY,
    sides: 10,
    smooth: false,
    shift: (t) => [0, -0.07 * Math.sin(Math.PI * t)],
    name: "body",
  });

  // shoulder, thigh and hip masses
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), BODY, {
      at: [s * 0.62, 2.45, 0.85],
      scale: [0.42, 0.78, 0.62],
      bone: front.joints[1],
      flat: true,
      name: "shoulderMass",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), BODY, {
      at: [s * 0.64, 2.25, -1.2],
      scale: [0.46, 0.85, 0.66],
      bone: hips,
      flat: true,
      name: "thighMass",
    });
    b.part(new THREE.SphereGeometry(1, 6, 5), BODY, {
      at: [s * 0.5, 3.12, -1.05],
      scale: [0.2, 0.17, 0.26],
      bone: hips,
      flat: true,
      name: "hipBone",
    });
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), BODY, {
    at: [0, 3.28, 0.65],
    scale: [0.5, 0.2, 0.55],
    bone: front.joints[1],
    flat: true,
    name: "withers",
  });
  // skin folds around the belly and girth
  const bodySkin = b.surface(body);
  for (const t of [0.34, 0.46, 0.58, 0.7]) {
    const at = bodyPath.at(t);
    const loop = bodySkin.loop(frame(at, [0, 0, 1]), { lift: 0.005 });
    b.sweep(loop, 0.014, { color: CREASE, sides: 4, name: "bodyFold" });
  }

  // ---- Neck and head ---------------------------------------------------------------------------------------
  b.sweep(neck, [0.7, 0.64], { color: BODY, sides: 10, smooth: false, name: "neckTube" });
  const headPath = catmull([
    [0, 2.92, 1.45],
    [0, 2.95, 1.95],
    [0, 2.82, 2.4],
    [0, 2.6, 2.85],
  ]);
  const hk: Array<[number, number, number]> = [
    [0, 0.52, 0.55],
    [0.25, 0.62, 0.62],
    [0.55, 0.52, 0.56],
    [0.8, 0.34, 0.4],
    [1, 0.24, 0.3],
  ];
  const headSw = b.sweep(
    headPath,
    (t) => {
      for (let i = 1; i < hk.length; i++) {
        if (t <= hk[i][0]) {
          const a = hk[i - 1];
          const c = hk[i];
          const u = smoothstep(a[0], c[0], t);
          return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
        }
      }
      return [0.24, 0.3];
    },
    { bone: head, color: HEAD, sides: 10, smooth: false, name: "skull" },
  );
  // forehead lobes, cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), HEAD, {
      at: [s * 0.2, 3.3, 1.95],
      scale: [0.34, 0.3, 0.42],
      bone: head,
      flat: true,
      name: "foreheadLobe",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), HEAD, {
      at: [s * 0.4, 2.62, 2.25],
      scale: [0.2, 0.3, 0.42],
      bone: head,
      flat: true,
      name: "cheek",
    });
  }

  // lower jaw and mouth
  b.sweep(
    catmull([
      [0, 2.26, 2.0],
      [0, 2.2, 2.4],
      [0, 2.14, 2.78],
    ]),
    (t) => [0.34 - 0.16 * t, 0.15],
    { bone: jaw, color: HEAD, sides: 8, smooth: false, name: "lowerJaw" },
  );
  b.part(new THREE.BoxGeometry(0.3, 0.07, 0.3), MOUTH, { at: [0, 2.33, 2.62], bone: jaw, flat: true, name: "mouthPad" });
  b.part(new THREE.SphereGeometry(1, 6, 4), PINK, { at: [0, 2.12, 2.9], scale: [0.14, 0.08, 0.1], bone: jaw, flat: true, name: "lip" });

  // ---- Trunk -----------------------------------------------------------------------------------------------
  const trunkPath = catmull([
    [0, 2.52, 2.72],
    [0, 2.12, 3.05],
    [0, 1.55, 3.22],
    [0, 0.98, 3.16],
    [0, 0.55, 3.2],
    [0, 0.34, 3.45],
    [0, 0.42, 3.72],
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunk6", "trunkTip"],
    role: "tentacle",
  });
  const trunkSw = b.sweep(
    trunk,
    (t) => {
      const base = 0.31 - 0.22 * Math.pow(t, 0.85);
      const ridge = 1 + 0.07 * (((t * TRUNK_LEN) / 0.2) % 1 < 0.5 ? 1 : -1);
      return [base * ridge * 1.03, base * ridge];
    },
    { color: TRUNK, sides: 8, smooth: false, caps: "round", name: "trunk" },
  );
  // trunk finger and lip, nostrils
  const tipF = trunk.at(1);
  b.spike(tipF, [0, 0.55, 0.85], 0.1, 0.045, { color: PINK, sides: 5, bone: trunk.joints[6], name: "finger" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 5, 4), HAIR, {
      at: [s * 0.034, 0.5, 3.8],
      scale: [0.022, 0.03, 0.02],
      bone: trunk.joints[6],
      flat: true,
      name: "nostril",
    });
  }

  // ---- Tusks -----------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.3, 2.48, 2.5],
        [s * 0.38, 2.05, 2.82],
        [s * 0.38, 1.7, 3.3],
        [s * 0.34, 1.58, 3.8],
        [s * 0.27, 1.72, 4.25],
      ]),
      (t) => 0.105 * Math.pow(1 - t, 0.9) + 0.016,
      { bone: head, color: TUSK, sides: 7, smooth: false, caps: "point", name: "tusk" },
    );
    b.part(new THREE.SphereGeometry(1, 7, 5), PINK_D, {
      at: [s * 0.3, 2.42, 2.62],
      scale: [0.16, 0.14, 0.16],
      bone: head,
      flat: true,
      name: "tuskSocket",
    });
  }

  // ---- Eyes ------------------------------------------------------------------------------------------------
  const headSkin = b.surface(headSw);
  for (const s of [1, -1]) {
    const hit = headSkin.ray([s * 1.3, 2.98, 2.32], [-s, 0, 0]);
    if (!hit) throw new Error("eye ray missed the skull");
    const eye = b.stick(new THREE.SphereGeometry(0.055, 7, 5), EYE, hit, { embed: 0.45, name: "eye", flat: true });
    b.part(new THREE.CircleGeometry(0.03, 6), EYE_RING, {
      at: hit.at.clone().addScaledVector(hit.n, 0.04),
      dir: hit.n,
      axis: "z",
      name: "iris",
    });
    b.part(new THREE.SphereGeometry(0.012, 4, 3), WHITE, {
      at: hit.at.clone().addScaledVector(hit.n, 0.05).add(new THREE.Vector3(0, 0.02, 0.02)),
      bone: head,
      name: "glint",
    });
    b.ring(eye, { count: 7, radius: 0.06, fromDeg: -80, toDeg: 80, tilt: 35 }, (lash) =>
      b.spike(lash, lash, 0.07, 0.006, { color: HAIR, sides: 4, name: "lash" }),
    );
    const brow = headSkin.ray([s * 1.3, 3.1, 2.3], [-s, 0, 0]);
    if (brow) b.stick(new THREE.SphereGeometry(1, 6, 4), HEAD, brow, { embed: 0.3, scale: [0.1, 0.05, 0.13], flat: true, name: "brow" });
    const lid = headSkin.ray([s * 1.3, 2.9, 2.32], [-s, 0, 0]);
    if (lid) b.stick(new THREE.SphereGeometry(1, 6, 4), HEAD, lid, { embed: 0.3, scale: [0.08, 0.025, 0.1], flat: true, name: "lowerLid" });
    // temporal gland
    const gland = headSkin.ray([s * 1.3, 2.97, 2.02], [-s, 0, 0]);
    if (gland) b.stick(new THREE.SphereGeometry(1, 5, 4), "#3c3028", gland, { embed: 0.3, scale: [0.045, 0.03, 0.045], flat: true, name: "gland" });
  }

  // ---- Ears ------------------------------------------------------------------------------------------------
  const earOutline: Array<[number, number]> = [
    [0, 0.7],
    [0.3, 0.84],
    [0.7, 0.8],
    [1.04, 0.6],
    [1.3, 0.24],
    [1.34, -0.14],
    [1.24, -0.2],
    [1.3, -0.3],
    [1.18, -0.56],
    [0.98, -0.9],
    [0.78, -1.2],
    [0.6, -1.3],
    [0.46, -1.04],
    [0.28, -0.7],
    [0.1, -0.46],
    [0, -0.3],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const earJ = b.joint(`ear${S}`, {
      parent: head,
      at: [s * 0.5, 3.0, 1.85],
      dir: [s * 0.92, 0, -0.38],
      role: "hinge",
    });
    const xd = new THREE.Vector3(s * 0.92, 0, -0.38).normalize();
    const thick = xd.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
    const earPaint = paint((p, n, c) => {
      const rim = Math.abs(n.dot(thick)) < 0.5;
      let col = mix(PINK_D, SKIN_L, 0.35 + 0.4 * noise(p, 0.5, 31));
      const vein = Math.abs(noise(p, 0.3, 21) - 0.5);
      if (vein < 0.03) col = mix(col, "#7a4d4d", 0.8);
      if (c[0] < 0.3) col = mix(col, SKIN_D, 0.6);
      if (noise(p, 0.22, 41) > 0.68) col = mix(col, "#d2b0a8", 0.7);
      if (c[1] < -0.7) col = mix(col, DUST, 0.5);
      if (rim) col = mix(col, SKIN_D, 0.8);
      return col;
    });
    b.extrude(earOutline, {
      at: [s * 0.5, 3.0, 1.85],
      x: [s * 0.92, 0, -0.38],
      y: [0, 1, 0],
      thickness: [0.07, 0.025],
      bevel: 0.01,
      bone: earJ,
      color: earPaint,
      name: "ear",
    });
    b.rod([s * 0.5, 3.62, 1.9], [s * 0.5, 2.55, 1.95], 0.1, { bone: earJ, color: HEAD, sides: 6, smooth: false, name: "earRoot" });
  }

  // ---- Legs ------------------------------------------------------------------------------------------------
  const legChains: Array<{ ch: ReturnType<typeof b.chain>; sw: ReturnType<typeof b.sweep>; x: number; z: number }> = [];
  const mkLeg = (s: number, front_: boolean) => {
    const S = s > 0 ? "L" : "R";
    const x = s * (front_ ? 0.58 : 0.62);
    const pts = front_
      ? [
          [x, 2.45, 0.95],
          [x, 1.38, 1.0],
          [x, 0.58, 0.93],
          [x, 0.2, 0.97],
        ]
      : [
          [x, 2.35, -1.25],
          [x, 1.4, -1.05],
          [x, 0.6, -1.3],
          [x, 0.2, -1.25],
        ];
    const names = front_
      ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `foot${S}`]
      : [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}H`];
    const z = pts[3][2];
    const ch = b.chain(front_ ? `legF${S}` : `legH${S}`, catmull(pts), {
      parent: front_ ? front.joints[2] : hips,
      names,
      role: "leg",
      contact: [x, 0, z],
    });
    const sw = b.sweep(ch, front_ ? [0.4, 0.34, 0.3, 0.27] : [0.46, 0.34, 0.3, 0.27], {
      color: LEG,
      sides: 8,
      smooth: false,
      name: front_ ? "foreLeg" : "hindLeg",
    });
    legChains.push({ ch, sw, x, z });
    // foot pad and nails
    const tip = ch.joints[3];
    b.part(new THREE.CylinderGeometry(0.29, 0.34, 0.22, 8), LEG, {
      at: [x, 0.105, z],
      bone: tip,
      flat: true,
      name: "footPad",
    });
    const angs = front_ ? [-48, -16, 16, 48] : [-30, 0, 30];
    for (const a of angs) {
      const r = (a * Math.PI) / 180;
      const dx = Math.sin(r);
      const dz = Math.cos(r);
      b.part(new THREE.BoxGeometry(0.13, 0.15, 0.07), NAILP, {
        at: [x + dx * 0.335, 0.115, z + dz * 0.335],
        dir: [dx, 0, dz],
        axis: "z",
        bone: tip,
        name: "toenail",
      });
    }
    // skin folds at joints
    for (const t of [0.3, 0.38, 0.62, 0.7, 0.85, 0.93]) {
      const loop = b.surface(sw).loop(ch.at(t), { lift: 0.005 });
      b.sweep(loop, 0.013, { color: CREASE, sides: 4, name: "legFold" });
    }
    // knee / elbow cap
    b.part(new THREE.SphereGeometry(1, 6, 5), LEG, {
      at: [x, front_ ? 1.38 : 1.4, front_ ? 1.12 : -0.88],
      scale: [0.24, 0.26, 0.2],
      bone: ch.joints[1],
      flat: true,
      name: "kneeCap",
    });
  };
  for (const s of [1, -1]) {
    mkLeg(s, true);
    mkLeg(s, false);
  }

  // ---- Tail ------------------------------------------------------------------------------------------------
  const rump = b.surface(body).ray([0, 2.75, -3], [0, 0, 1]);
  if (!rump) throw new Error("tail ray missed the rump");
  const tail = b.sprout(
    "tail",
    rump,
    catmull([
      [0, 2.55, -2.15],
      [0, 2.05, -2.28],
      [0, 1.55, -2.3],
      [0, 1.15, -2.26],
    ]),
    [0.085, 0.035],
    { count: 4, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail", color: BODY, sides: 6, smooth: false, caps: "round" },
  );
  if (!tail.chain) throw new Error("tail has no joints");
  const tailEnd = tail.chain.at(1);
  b.ring(tailEnd, { count: 13, radius: 0.03, tilt: 78 }, (h) => b.spike(h, h, 0.36, 0.014, { color: HAIR, sides: 4, name: "tailHair" }));
  b.ring(tailEnd, { count: 7, radius: 0.0, tilt: 88 }, (h) => b.spike(h, h, 0.42, 0.012, { color: HAIR, sides: 4, name: "tailHairLong" }));

  // ---- Hair: crown, back, chin -----------------------------------------------------------------------------
  const crown = headSkin.scatter(36, { rng: rng(3), minDist: 0.07, filter: (h) => h.n.y > 0.6 && h.at.z > 1.8 });
  b.cards(crown, TUFT, { size: [0.05, 0.1], lean: 40, bend: 20, vary: 0.3, rng: rng(4), flow: [0, 0, -1] });
  const spineHair = bodySkin.scatter(60, { rng: rng(5), minDist: 0.25, filter: (h) => h.n.y > 0.65 });
  b.cards(spineHair, TUFT, { size: [0.045, 0.09], lean: 45, bend: 25, vary: 0.35, rng: rng(6), flow: [0, 0, -1] });
  const chin = b.surface(trunkSw).scatter(16, { rng: rng(7), minDist: 0.1, filter: (h) => h.at.y > 1.9 && h.n.z > 0.2 });
  b.cards(chin, TUFT, { size: [0.035, 0.07], lean: 50, rng: rng(8), flow: [0, -0.4, 1] });

  // reference unused helpers so typecheck stays strict-clean
  void bezier;
  void rgb;
  void R;
  return b.root;
}
