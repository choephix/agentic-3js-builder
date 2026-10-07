// Scarlet macaw, wings open, perched on a gilded T-perch: Genshin Impact style (cel-shaded anime, gold filigree, Pyro glow).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { DEG, rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { grain, mix, paint, scales, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { animeEye, cel, INK, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Scarlet Macaw",
  description:
    "A scarlet macaw with wings fully spread, perched on a gilded T-perch with a glowing Pyro rune plinth: cel-shaded flight feathers, gold anklets and filigree, anime eyes.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const RED = "#ec2a2f";
const RED_EDGE = "#c3182b";
const YELLOW = "#ffc41e";
const YELLOW_LIGHT = "#ffd94a";
const GREEN = "#2fcf6a";
const TEAL = "#16b8c4";
const CYAN = "#46d3f2";
const SKY = "#52cdf3";
const SKY_EDGE = "#2b94dc";
const BLUE = "#1f66e8";
const BLUE_LIGHT = "#2f88f2";
const BLUE_DEEP = "#1740b4";
const NAVY = "#14287a";
const CREAM = "#fff0e2";
const FACE_LINE = "#e0584a";
const BEAK = "#f6e7c4";
const BEAK_SHADE = "#d3b27f";
const BEAK_DARK = "#3b2f45";
const GREY = "#7a7087";
const GREY_EDGE = "#4f4660";
const CLAW = "#2a2230";
const GOLD = "#f6b83a";
const GOLD_DARK = "#b9791d";
const STONE = "#efe3cf";
const STONE_DARK = "#8b2f40";
const LEAF = "#3fc467";
const EMBER = "#ff6a1f";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Piecewise-smooth interpolation through [t, value] keys. */
function curve(keys: readonly (readonly [number, number])[]) {
  return (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, v0] = keys[i - 1];
        const [t1, v1] = keys[i];
        const k = smoothstep(0, 1, (t - t0) / (t1 - t0));
        return v0 + (v1 - v0) * k;
      }
    }
    return keys[keys.length - 1][1];
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Feather outlines and paints

type Kind = "flight" | "round";
type Zone = "skycov" | "primary" | "secondary" | "tertial" | "greater" | "median" | "lesser" | "pcov" | "alula" | "tail";

function featherOutline(kind: Kind, L: number, w: number): OutlinePoint[] {
  if (kind === "flight") {
    return [
      [0, -0.1 * w],
      [0.22 * L, -0.3 * w],
      [0.55 * L, -0.36 * w],
      [0.82 * L, -0.29 * w],
      [0.95 * L, -0.15 * w],
      [L, 0.04 * w],
      [0.95 * L, 0.3 * w],
      [0.8 * L, 0.55 * w],
      [0.55 * L, 0.64 * w],
      [0.25 * L, 0.55 * w],
      [0.05 * L, 0.3 * w],
      [0, 0.12 * w],
    ];
  }
  return [
    [0, -0.14 * w],
    [0.3 * L, -0.46 * w],
    [0.72 * L, -0.5 * w],
    [0.93 * L, -0.34 * w],
    [L, -0.1 * w],
    [L, 0.1 * w],
    [0.93 * L, 0.34 * w],
    [0.72 * L, 0.5 * w],
    [0.3 * L, 0.46 * w],
    [0, 0.14 * w],
  ];
}

const FLIGHT_UNDER = (f: number) => (f < 0.4 ? "#ff5a3c" : f < 0.78 ? "#ff9a30" : "#ffd23c");

function featherTop(zone: Zone, f: number, v: number, i: number): string {
  switch (zone) {
    case "primary":
      return f > 0.84 ? BLUE_DEEP : v < -0.16 ? BLUE_LIGHT : BLUE;
    case "secondary":
      return f > 0.88 ? BLUE_DEEP : v > 0.4 ? BLUE_LIGHT : BLUE;
    case "tertial":
      return f > 0.78 ? BLUE : TEAL;
    case "greater":
      return f > 0.66 ? GREEN : YELLOW;
    case "median":
      return f > 0.74 ? GREEN : YELLOW_LIGHT;
    case "lesser":
      return f > 0.86 ? RED_EDGE : RED;
    case "skycov":
      return f > 0.8 ? CYAN : SKY;
    case "pcov":
      return f > 0.7 ? BLUE_DEEP : BLUE;
    case "alula":
      return f > 0.5 ? NAVY : BLUE_DEEP;
    case "tail": {
      const redUntil = [0.66, 0.56, 0.44, 0.3, 0.16, 0.04][i] ?? 0;
      if (f > 0.92) return CYAN;
      if (f <= redUntil) return RED;
      return f > redUntil + 0.2 ? BLUE : BLUE_LIGHT;
    }
  }
}

function featherUnder(zone: Zone, f: number): string {
  if (zone === "skycov") return "#ff5a3c";
  if (zone === "greater" || zone === "median" || zone === "lesser" || zone === "pcov" || zone === "alula") return "#ff4a46";
  if (zone === "tail") return f < 0.5 ? "#ff5236" : "#ffc03a";
  return FLIGHT_UNDER(f);
}

/** A cel-shaded feather: zone colours, chevron barbs, a pale rachis, an inked rim; the top face and the underside differ. */
function featherPaint(zone: Zone, L: number, w: number, topN: THREE.Vector3, tailIdx = 0): Paint {
  const flight = zone === "primary" || zone === "secondary" || zone === "tertial";
  // An ink line along the widest stretch of each vane edge, where the extrude's outline is.
  const onEdge = (v: number) => (flight ? v < -0.3 || v > 0.57 : Math.abs(v) > 0.44);
  // The dorsal face is cel-shaded; the underside keeps its bright warm colours so it never goes muddy.
  const dorsal = cel(
    paint((_p, n, s) => {
      const f = s[0] / L;
      const v = s[1] / w;
      const base = featherTop(zone, f, v, tailIdx);
      if (Math.abs(n.dot(topN)) < 0.35) return mix(base, INK, 0.45);
      if (onEdge(v) && f > 0.1) return mix(base, INK, 0.32);
      if (Math.abs(s[1]) < 0.0017 && f > 0.05 && f < 0.97) return mix(base, "#ffffff", 0.5);
      if (zigzag((s[0] - 1.7 * Math.abs(s[1])) / 0.016) < 0.14) return mix(base, "#ffffff", 0.2);
      return base;
    }),
  );
  return paint((_p, n, s) => {
    const facing = n.dot(topN);
    if (facing >= 0) return dorsal;
    const f = s[0] / L;
    const base = featherUnder(zone, f);
    if (facing > -0.35) return mix(base, INK, 0.4);
    if (onEdge(s[1] / w) && f > 0.1) return mix(base, "#8a1230", 0.4);
    if (Math.abs(s[1]) < 0.0017 && f > 0.05 && f < 0.97) return mix(base, "#ffffff", 0.45);
    if (zigzag((s[0] - 1.7 * Math.abs(s[1])) / 0.016) < 0.18) return mix(base, "#b8203a", 0.22);
    return base;
  });
}

const FEATHER_RED = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 56"><path d="M20 56 C11 48 5 32 8 17 C10 8 15 3 20 1 C25 3 30 8 32 17 C35 32 29 48 20 56Z" fill="#ee2b32" stroke="#a31428" stroke-width="3"/><path d="M20 50 L20 12" stroke="#ff7a58" stroke-width="2.6"/><path d="M20 40 L11 30 M20 40 L29 30 M20 28 L13 19 M20 28 L27 19" stroke="#c71b2c" stroke-width="2.2"/></svg>`,
  { size: 128 },
);
const FEATHER_RED_DARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 56"><path d="M20 56 C11 48 5 32 8 17 C10 8 15 3 20 1 C25 3 30 8 32 17 C35 32 29 48 20 56Z" fill="#d81f2e" stroke="#8d1026" stroke-width="3"/><path d="M20 50 L20 12" stroke="#ff5c4a" stroke-width="2.6"/><path d="M20 40 L11 30 M20 40 L29 30" stroke="#a8142a" stroke-width="2.2"/></svg>`,
  { size: 128 },
);
const FEATHER_SKY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 56"><path d="M20 56 C11 48 5 32 8 17 C10 8 15 3 20 1 C25 3 30 8 32 17 C35 32 29 48 20 56Z" fill="#52cdf3" stroke="#2279c8" stroke-width="3"/><path d="M20 50 L20 12" stroke="#d6f6ff" stroke-width="2.6"/><path d="M20 40 L11 30 M20 40 L29 30 M20 28 L13 19 M20 28 L27 19" stroke="#2b94dc" stroke-width="2.2"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<circle cx="100" cy="100" r="99" fill="#2d1c38"/>
<circle cx="100" cy="100" r="93" fill="none" stroke="#ffc94a" stroke-width="4"/>
<circle cx="100" cy="100" r="84" fill="none" stroke="#ff9a2a" stroke-width="2.5" stroke-dasharray="6 5"/>
<circle cx="100" cy="100" r="46" fill="none" stroke="#ffc94a" stroke-width="3.5"/>
${Array.from({ length: 8 }, (_, k) => {
  const a = k * 45;
  return `<g transform="rotate(${a} 100 100)"><path d="M100 22 C114 48 128 60 100 90 C72 60 86 48 100 22Z" fill="#ff7a1f" stroke="#ffd35a" stroke-width="3"/><path d="M100 40 C106 55 108 64 100 76 C92 64 94 55 100 40Z" fill="#ffe27a"/><path d="M100 8 L106 16 L100 24 L94 16Z" fill="#ffc94a"/></g>`;
}).join("")}
<circle cx="100" cy="100" r="22" fill="#ffb02e" stroke="#fff0a0" stroke-width="3"/>
<circle cx="100" cy="100" r="11" fill="#fff4b0"/>
</svg>`,
  { size: 512 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "scarletMacaw", paintSize: 2048 });

  // ---- Skeleton: body --------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.6, -0.13], dir: [0, 0.315, 0.16], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.6, -0.13],
      [0, 0.71, -0.075],
      [0, 0.83, -0.02],
      [0, 0.915, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.chain(
    "neck",
    polyline([
      [0, 0.915, 0.03],
      [0, 0.972, 0.062],
      [0, 1.0, 0.088],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const HC = V(0, 1.012, 0.105);
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.0, 0.088], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.978, 0.1], aim: [0, 0.968, 0.2], role: "jaw" });
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 0.585, -0.17], dir: [0, -0.92, -0.4], role: "tail" });

  // ---- Body paint --------------------------------------------------------------------------------------------
  const hipsP = V(0, 0.6, -0.13);
  const spineDir = V(0, 0.315, 0.16).normalize();
  const isRump = (p: THREE.Vector3, n: THREE.Vector3) => {
    const along = (p.x - hipsP.x) * spineDir.x + (p.y - hipsP.y) * spineDir.y + (p.z - hipsP.z) * spineDir.z;
    return n.z < 0.05 && along < 0.06 + 0.022 * zigzag(p.x / 0.02);
  };
  const REDS = scales(RED, RED_EDGE, { size: 0.028, width: 0.0035, seed: 2 });
  const SKYS = scales(SKY, SKY_EDGE, { size: 0.028, width: 0.0035, seed: 3 });
  const bodyPaint = cel(paint((p, n) => (isRump(p, n) ? SKYS : REDS)));
  const redPaint = cel(REDS);

  // ---- Body, neck ------------------------------------------------------------------------------------------
  const rx = curve([
    [0, 0.052],
    [0.2, 0.072],
    [0.5, 0.08],
    [0.8, 0.07],
    [1, 0.048],
  ]);
  const ry = curve([
    [0, 0.06],
    [0.2, 0.082],
    [0.5, 0.09],
    [0.8, 0.08],
    [1, 0.052],
  ]);
  const body = b.sweep(spine, (t) => [rx(t), ry(t)], { color: bodyPaint, sides: 10, name: "body" });
  const neckTube = b.sweep(neck, [0.05, 0.044], { color: redPaint, sides: 8, name: "neck", extend: 0.02 });
  // gold collar with a hanging Pyro pendant
  const collar = b.surface(neckTube).loop(neck.at(0.3), { lift: 0.004 });
  b.sweep(collar, 0.0045, { color: GOLD, sides: 6, name: "collar" });
  b.along(collar, 14, (at) => b.part(new THREE.OctahedronGeometry(0.0065), GOLD_DARK, { at, name: "collarStud" }));
  const front = b.surface(neckTube).ray([0, neck.at(0.3).at.y, 0.4], [0, 0, -1]);
  if (!front) throw new Error("collar front missed");
  const pendantAt = front.at.clone().add(V(0, -0.028, 0.012));
  b.rod(front.at.clone().add(V(0, 0, 0.003)), pendantAt, 0.0022, { color: GOLD, sides: 4, name: "pendantChain" });
  b.part(new THREE.TorusGeometry(0.0125, 0.0035, 4, 8), GOLD, { bone: chest, at: pendantAt.clone().add(V(0, -0.006, 0)), dir: [0, 0, 1], axis: "z", name: "pendantRing" });
  glow(b.part(new THREE.OctahedronGeometry(0.0105), EMBER, { bone: chest, at: pendantAt.clone().add(V(0, -0.006, 0.002)), scale: [0.8, 1.35, 0.7], name: "pendantGem" }), 1.6);

  // ---- Head ------------------------------------------------------------------------------------------------
  const EYE_RAD = 0.052;
  const headPaint = cel(
    paint((p) => {
      const qx = p.x - HC.x;
      const qy = p.y - HC.y;
      const qz = p.z - HC.z;
      const zz = zigzag(qz / 0.012);
      const inPatch =
        qy < 0.024 + 0.005 * zz &&
        qy > -0.036 - 0.005 * zigzag(qz / 0.012 + 0.5) &&
        qz > -0.014 - 0.006 * zigzag(qy / 0.012) &&
        Math.abs(qx) < EYE_RAD + 0.01;
      if (!inPatch) return REDS;
      const row = (qy + 0.18 * qz) / 0.0068;
      if (zigzag(row) < 0.2 && zigzag(qz / 0.016 + Math.abs(qx) / 0.02) < 0.72) return FACE_LINE;
      return CREAM;
    }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), headPaint, {
    bone: head,
    at: HC,
    scale: [0.052, 0.056, 0.06],
    name: "skull",
  });
  const skin = b.surface(skull);

  // eyes: big anime eyes with a yellow iris
  const EYE = animeEye({ iris: "#ffd23a", irisLight: "#fff08a", blush: false, brow: false });
  for (const s of [1, -1]) {
    const at = V(s * 0.04, HC.y + 0.012, HC.z + 0.03);
    b.decal(skin, EYE, { at, dir: [s * 0.8, 0.1, 0.6], size: [0.045, 0.062], mirror: s > 0, segments: 12, name: "eye" });
  }

  // crown cards: red feathers over the forehead and crown
  const crownHits = skin.scatter(70, {
    rng: rng(5),
    minDist: 0.012,
    filter: (h) => h.n.y > 0.45 && h.at.z < HC.z + 0.03 && h.at.y > HC.y + 0.036,
  });
  b.cards(crownHits, FEATHER_RED, { size: [0.022, 0.028], lean: 62, flow: [0, -0.3, -1], vary: 0.25, rng: rng(6), bone: head });
  // throat and cheek cards below the face patch
  const throatHits = skin.scatter(40, {
    rng: rng(8),
    minDist: 0.013,
    filter: (h) => h.at.y < HC.y - 0.034 && h.n.y < 0.2 && h.at.z < HC.z + 0.02,
  });
  b.cards(throatHits, FEATHER_RED_DARK, { size: [0.022, 0.028], lean: 70, flow: [0, -1, -0.2], vary: 0.2, rng: rng(9), bone: head });
  // gold circlet round the brow, with a flame plate and a Pyro gem at the front
  const circlet = skin.loop([0, HC.y + 0.03, HC.z], { dir: [0, 1, 0], lift: 0.003 });
  b.sweep(circlet, 0.0034, { bone: head, color: GOLD, sides: 6, name: "circlet" });
  const brow = skin.ray([0, HC.y + 0.03, HC.z + 0.3], [0, 0, -1]);
  if (!brow) throw new Error("circlet front missed");
  b.extrude(
    [
      [0, -0.006],
      [0.011, 0.002],
      [0.008, 0.012],
      [0.002, 0.02],
      [0, 0.034, "sharp"],
      [-0.002, 0.02],
      [-0.008, 0.012],
      [-0.011, 0.002],
    ],
    { at: brow.at.clone().add(V(0, -0.002, 0.003)), bone: head, x: [-1, 0, 0], y: [0, 1, 0.25], thickness: 0.004, smoothing: 1, color: GOLD, name: "circletFlame" },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.0085), EMBER, {
      bone: head,
      at: brow.at.clone().add(V(0, 0.004, 0.009)),
      scale: [0.9, 1.4, 0.7],
      name: "circletGem",
    }),
    1.6,
  );

  // ---- Beak ------------------------------------------------------------------------------------------------
  const H = (x: number, y: number, z: number) => V(x, HC.y + y, HC.z + z);
  const upperPath = catmull([H(0, -0.006, 0.02), H(0, 0.008, 0.07), H(0, 0.006, 0.11), H(0, -0.012, 0.146), H(0, -0.045, 0.158)]);
  const upperRx = curve([
    [0, 0.027],
    [0.35, 0.027],
    [0.7, 0.019],
    [0.92, 0.009],
    [1, 0.003],
  ]);
  const upperRy = curve([
    [0, 0.034],
    [0.35, 0.033],
    [0.7, 0.023],
    [0.92, 0.011],
    [1, 0.003],
  ]);
  const beakPaint = cel(
    paint((_p, _n, s) => {
      if (s[0] > 0.1 && s[0] < 0.97 && zigzag(s[0] * 11) < 0.06 && Math.abs(s[1] - 180) > 40) return "#e6d0a2";
      if (Math.abs(s[1]) < 7 || Math.abs(s[1] - 360) < 7) return "#fffaf0";
      if (Math.abs(s[1] - 180) < 38) return BEAK_SHADE;
      if (s[0] < 0.14) return "#e3cfa6";
      return BEAK;
    }),
  );
  b.sweep(upperPath, (t) => [upperRx(t), upperRy(t)], { bone: head, color: beakPaint, sides: 8, caps: "point", name: "beakUpper" });
  const lowerPath = catmull([H(0, -0.036, 0.015), H(0, -0.041, 0.07), H(0, -0.037, 0.112), H(0, -0.03, 0.14)]);
  b.sweep(lowerPath, (t) => [0.022 - 0.014 * t, 0.02 - 0.013 * t], {
    bone: jaw,
    color: cel(BEAK_DARK),
    sides: 8,
    caps: "round",
    name: "beakLower",
  });
  // nostrils, cere
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.006, 6, 4), INK, {
      bone: head,
      at: H(s * 0.014, 0.027, 0.062),
      scale: [1, 0.8, 1.4],
      name: "nostril",
    });

  // ---- Body cards ------------------------------------------------------------------------------------------
  const bodySkin = b.surface(body);
  const redHits = bodySkin.scatter(340, {
    rng: rng(21),
    minDist: 0.021,
    filter: (h) => !isRump(h.at, h.n) && h.at.y > 0.62,
  });
  b.cards(redHits, [FEATHER_RED, FEATHER_RED, FEATHER_RED_DARK], {
    size: [0.036, 0.066],
    lean: 74,
    bend: 18,
    flow: [0, -1, -0.12],
    vary: 0.22,
    rng: rng(22),
  });
  const blueHits = bodySkin.scatter(90, { rng: rng(23), minDist: 0.022, filter: (h) => isRump(h.at, h.n) });
  b.cards(blueHits, FEATHER_SKY, { size: [0.036, 0.066], lean: 74, bend: 18, flow: [0, -1, -0.2], vary: 0.2, rng: rng(24) });

  // ---- Wings -----------------------------------------------------------------------------------------------
  const buildWing = (s: 1 | -1) => {
    const side = s > 0 ? "L" : "R";
    // Wings are drawn flat and straight out on the left; one turn lifts them into a V and pitches the trailing edge up
    // so the underwing faces the viewer. Mirrored for the right wing.
    const SH0 = V(0.065, 0.87, -0.03);
    const turn = new THREE.Quaternion()
      .setFromAxisAngle(V(0, 0, 1), 13 * DEG)
      .multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), 26 * DEG));
    const W = (v: THREE.Vector3) => {
      const o = v.clone().sub(SH0).applyQuaternion(turn).add(SH0);
      o.x *= s;
      return o;
    };
    const WD = (v: THREE.Vector3) => {
      const o = v.clone().applyQuaternion(turn);
      o.x *= s;
      return o;
    };
    const sh = V(0.065, 0.87, -0.03);
    const el = V(0.14, 0.88, -0.1);
    const wr = V(0.23, 0.9, -0.055);
    const hd = V(0.3, 0.912, -0.075);
    const wing = b.chain(`wing${side}`, polyline([sh, el, wr, hd].map(W)), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "wing",
    });
    const [jSh, jEl, jWr] = wing.joints;
    b.sweep(wing, [0.027, 0.023, 0.018, 0.012, 0.008], { color: redPaint, sides: 8, name: `arm${side}` });
    const upN = WD(V(0, 1, 0));
    // gold armband round the forearm, with a Pyro gem on its leading edge
    const bandAt = W(el.clone().lerp(wr, 0.5));
    const bandDir = W(wr).sub(W(el)).normalize();
    b.part(new THREE.TorusGeometry(0.0215, 0.0036, 4, 10), GOLD, { bone: jEl, at: bandAt, dir: bandDir, axis: "z", name: `armband${side}` });
    glow(b.part(new THREE.OctahedronGeometry(0.0085), EMBER, { bone: jEl, at: bandAt.clone().add(WD(V(0, 0.0, 0.021))), scale: [1, 1.4, 1], name: `armGem${side}` }), 1.5);

    const feather = (
      zone: Zone,
      parent: Joint,
      name: string | null,
      rootLocal: THREE.Vector3,
      phiDeg: number,
      elevDeg: number,
      L: number,
      w: number,
      thick: number,
      kind: Kind,
    ) => {
      const phi = phiDeg * DEG;
      const elev = elevDeg * DEG;
      const dl = V(Math.cos(phi) * Math.cos(elev), Math.sin(elev), -Math.sin(phi) * Math.cos(elev));
      const d = WD(dl);
      const yv = WD(V(dl.z, 0, -dl.x).normalize());
      const root = W(rootLocal);
      const bone = name ? b.joint(name, { parent, at: root, dir: d, role: "fan" }) : parent;
      b.extrude(featherOutline(kind, L, w), {
        at: root,
        x: d,
        y: yv,
        thickness: thick,
        color: featherPaint(zone, L, w, upN),
        bone,
        smoothing: 1,
        name: `feather${side}`,
      });
    };

    // primaries: fanned off the hand, outermost first
    const primL = [0.215, 0.245, 0.255, 0.25, 0.24, 0.225, 0.21, 0.2, 0.19, 0.18];
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const root = hd.clone().lerp(wr, t * 0.95).add(V(0, -0.004 - i * 0.0014, -0.008));
      feather("primary", jWr, `primary${i + 1}${side}`, root, 5 + 56 * Math.pow(t, 1.1), 7 - 5 * t, primL[i], 0.041 + 0.003 * t, 0.005, "flight");
    }
    // secondaries along the forearm, tertials along the upper arm
    const secL = [0.2, 0.205, 0.21, 0.215, 0.22, 0.225, 0.225, 0.22, 0.215];
    const secRoots: THREE.Vector3[] = [];
    for (let j = 0; j < 9; j++) {
      const t = j / 8;
      const root = wr.clone().lerp(el, t).add(V(0, -0.005 - j * 0.0012, -0.016));
      secRoots.push(root);
      feather("secondary", jEl, `secondary${j + 1}${side}`, root, 64 + 26 * t, 3, secL[j], 0.04, 0.005, "flight");
    }
    const terL = [0.19, 0.185, 0.175, 0.16];
    for (let k = 0; k < 4; k++) {
      const root = el.clone().lerp(sh, (k / 3) * 0.85).add(V(0, -0.006 - k * 0.0012, -0.022));
      feather("tertial", jSh, `tertial${k + 1}${side}`, root, 96 + 7 * k, 2, terL[k], 0.042, 0.005, "flight");
    }
    // coverts
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const root = hd.clone().lerp(wr, t * 0.95).add(V(0, 0.007, -0.004));
      feather("pcov", jWr, null, root, 5 + 56 * Math.pow(t * 1.5 > 1 ? 1 : t * 1.5, 1.1), 7 - 3 * t, 0.09, 0.036, 0.004, "round");
    }
    for (let j = 0; j < 9; j++) {
      const t = j / 8;
      const base = secRoots[j];
      const phi = 64 + 26 * t;
      const root = base.clone().add(V(Math.cos(phi * DEG) * 0.02, 0.013, -Math.sin(phi * DEG) * 0.02));
      feather("greater", jEl, null, root, phi, 3, 0.1, 0.037, 0.004, "round");
    }
    for (let j = 0; j < 8; j++) {
      const t = j / 7;
      const root = wr.clone().lerp(el, t).add(V(0, 0.017, -0.004));
      feather("median", jEl, null, root, 68 + 22 * t, 3, 0.072, 0.033, 0.004, "round");
    }
    const arm = [sh, el, wr, hd];
    const lesserBone = [jSh, jEl, jWr];
    for (let k = 0; k < 14; k++) {
      const u = (k / 13) * 2.999;
      const seg = Math.min(2, Math.floor(u));
      const root = arm[seg].clone().lerp(arm[seg + 1], u - seg).add(V(0, 0.02, 0.0));
      feather("lesser", lesserBone[seg], null, root, 74 + (k % 3) * 4 - (seg === 2 ? 38 : 0), 3, 0.056, 0.032, 0.004, "round");
    }
    // alula: three little thumb feathers
    for (let a = 0; a < 3; a++)
      feather("alula", jWr, null, wr.clone().add(V(0.004 * a, 0.012 + 0.003 * a, 0.01)), -38 + 14 * a, 6, 0.058 - 0.004 * a, 0.022, 0.004, "round");
  };
  buildWing(1);
  buildWing(-1);

  // ---- Tail ------------------------------------------------------------------------------------------------
  const tailDir = V(0, -0.92, -0.4).normalize();
  const tailBack = V(0, 0.4, -0.92).normalize();
  const tailRootP = V(0, 0.585, -0.17);
  for (let i = 0; i < 6; i++) {
    for (const s of [1, -1]) {
      const alpha = (i + 0.5) * 2.6 * DEG * s;
      const d = tailDir.clone().multiplyScalar(Math.cos(alpha)).add(V(Math.sin(alpha), 0, 0)).normalize();
      const root = tailRootP.clone().add(V(s * (i + 0.5) * 0.011, 0, 0)).addScaledVector(tailBack, (5 - i) * 0.0025);
      const yv = V(1, 0, 0).addScaledVector(d, -d.x).normalize();
      const L = 0.5 - 0.03 * i;
      const w = 0.054;
      const bone = b.joint(`tailF${i + 1}${s > 0 ? "L" : "R"}`, { parent: tailBase, at: root, dir: d, role: "fan" });
      b.extrude(featherOutline("round", L, w), {
        at: root,
        x: d,
        y: yv,
        thickness: 0.004,
        color: featherPaint("tail", L, w, tailBack, i),
        bone,
        smoothing: 1,
        name: "tailFeather",
      });
    }
  }

  // upper tail coverts (light blue) and under tail coverts (red) fanned over the tail's root
  for (let i = 0; i < 5; i++) {
    for (const s of [1, -1]) {
      const alpha = (i + 0.3) * 5 * DEG * s;
      const d = tailDir.clone().multiplyScalar(Math.cos(alpha)).add(V(Math.sin(alpha), 0, 0)).normalize();
      const yv = V(1, 0, 0).addScaledVector(d, -d.x).normalize();
      for (const [zone, lift, L] of [
        ["skycov", 0.021, 0.14 - 0.012 * i],
        ["lesser", -0.024, 0.15 - 0.014 * i],
      ] as const) {
        const root = tailRootP.clone().addScaledVector(tailDir, -0.045).add(V(s * (i + 0.5) * 0.0105, 0, 0)).addScaledVector(tailBack, lift);
        const bone = b.joint(`tailC${zone === "skycov" ? "U" : "D"}${i + 1}${s > 0 ? "L" : "R"}`, {
          parent: tailBase,
          at: root,
          dir: d,
          role: "fan",
        });
        b.extrude(featherOutline("round", L, 0.05), {
          at: root,
          x: d,
          y: yv,
          thickness: 0.004,
          color: featherPaint(zone, L, 0.05, tailBack),
          bone,
          smoothing: 1,
          name: "tailCovert",
        });
      }
    }
  }

  // ---- Legs, feet and anklets ------------------------------------------------------------------------------
  const BAR_Y = 0.44;
  const R_T = 0.0275;
  const greyScales = cel(scales(GREY, GREY_EDGE, { size: 0.009, width: 0.0014, seed: 4 }));
  const gemGeo = new THREE.OctahedronGeometry(0.008);
  let k0 = 0;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = V(s * 0.05, 0.585, -0.04);
    const ankleP = V(s * 0.05, 0.483, 0.005);
    const pts = limb(hipP, ankleP, [0.075, 0.06], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: spine.joints[0],
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
    });
    const legTube = b.sweep(leg, (t) => 0.011 + 0.013 * (1 - smoothstep(0.42, 0.56, t)), {
      bands: [
        [0.5, redPaint],
        [1, greyScales],
      ],
      sides: 8,
      name: `leg${side}`,
    });
    b.cards(
      b.surface(legTube).scatter(11, { rng: rng(31 + k0), minDist: 0.016, filter: (h) => h.at.y > 0.525 }),
      FEATHER_RED_DARK,
      { size: [0.026, 0.038], lean: 82, flow: [0, -1, -0.1], vary: 0.2, rng: rng(32 + k0) },
    );
    k0 += 2;
    const foot = leg.tip!;
    const toeDefs = [
      { dx: 0.011, dz: 1, arc: [20, 55, 92] },
      { dx: -0.011, dz: 1, arc: [20, 55, 92] },
      { dx: 0.007, dz: -1, arc: [20, 52, 84] },
      { dx: -0.007, dz: -1, arc: [20, 52, 84] },
    ];
    toeDefs.forEach((toe, k) => {
      const x = s * 0.05 + toe.dx;
      const arcP = toe.arc.map((a) => V(x, BAR_Y + R_T * Math.cos(a * DEG), toe.dz * R_T * Math.sin(a * DEG)));
      const toeChain = b.chain(`toe${side}${k + 1}`, polyline([V(x, 0.483, 0.004 * toe.dz), ...arcP]), {
        parent: foot,
        names: [`toe${side}${k + 1}a`, `toe${side}${k + 1}b`, `toe${side}${k + 1}c`],
        role: "digit",
      });
      b.sweep(toeChain, [0.0085, 0.0058], { color: greyScales, sides: 5, name: `toe${side}`, caps: "round" });
      const tip = toeChain.at(1);
      b.spike(tip, tip, 0.016, 0.0052, { color: CLAW, sides: 6, name: `claw${side}` });
    });
    // gold anklet with a Pyro gem
    const mid = pts[1].clone().lerp(pts[2], 0.62);
    const legDir = pts[2].clone().sub(pts[1]).normalize();
    b.part(new THREE.TorusGeometry(0.0135, 0.0036, 4, 9), GOLD, { bone: leg.joints[1], at: mid, dir: legDir, axis: "z", name: "anklet" });
    const gemAt = mid.clone().add(V(0, 0.0, 0.0165));
    glow(b.part(gemGeo, EMBER, { bone: leg.joints[1], at: gemAt, scale: [1, 1.5, 1], name: "gem" }), 1.6);
    b.part(new THREE.TorusGeometry(0.0072, 0.0018, 5, 8), GOLD_DARK, { bone: leg.joints[1], at: gemAt, dir: [0, 0, 1], axis: "z", name: "gemSetting" });
    // tassel cords
    for (let c = -1; c <= 1; c++) {
      const a = mid.clone().add(V(s * 0.0135, 0, 0.002 * c));
      const e = a.clone().add(V(s * (0.004 + 0.003 * c * s), -0.026 - 0.004 * (1 - Math.abs(c)), 0.007 * c));
      b.rod(a, e, 0.0014, { bone: leg.joints[1], color: GOLD, sides: 4, name: "tasselCord" });
      b.part(new THREE.SphereGeometry(0.0045, 6, 4), RED, { bone: leg.joints[1], at: e, name: "tasselBead" });
    }
  }

  // ---- Perch -----------------------------------------------------------------------------------------------
  const plinthPaint = cel(
    paint((_p, n, s) => {
      if (n.y > 0.7) return STONE;
      const h = s[0];
      if (h > 0.011 && h < 0.03) {
        if (Math.abs(h - 0.0205) < 0.0035 && zigzag(s[1] / 22.5) < 0.3) return GOLD;
        return STONE_DARK;
      }
      return STONE;
    }),
  );
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.206, 0.009],
      [0.206, 0.034],
      [0.19, 0.048],
      [0.172, 0.052],
      [0.166, 0.078],
      [0.145, 0.084],
      [0, 0.084],
    ],
    { at: [0, 0, 0], bone: hips, segments: 8, spin: 22.5, color: plinthPaint, name: "plinth" },
  );
  for (const [r, y] of [
    [0.208, 0.0105],
    [0.208, 0.0335],
    [0.168, 0.0535],
  ])
    b.lathe(
      [
        [r - 0.003, y - 0.004],
        [r + 0.003, y - 0.004],
        [r + 0.003, y + 0.004],
        [r - 0.003, y + 0.004],
      ],
      { at: [0, 0, 0], bone: hips, segments: 8, spin: 22.5, color: GOLD, name: "plinthTrim" },
    );
  const rune = b.part(new THREE.PlaneGeometry(0.27, 0.27), "#ffffff", {
    bone: hips,
    at: [0, 0.0865, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: RUNE,
    name: "rune",
  });
  glow(rune, 1.2);
  const woodGrain = cel(grain("#d28f4e", "#a0652f", { size: 0.012, axis: "x", seed: 7 }));
  const columnGrain = cel(grain("#d28f4e", "#a0652f", { size: 0.012, axis: "y", seed: 8 }));
  b.lathe(
    [
      [0, 0.082],
      [0.056, 0.082],
      [0.056, 0.092],
      [0.04, 0.106],
      [0.028, 0.13],
      [0.028, 0.39],
      [0.04, 0.41],
      [0.034, 0.426],
      [0, 0.426],
    ],
    { at: [0, 0, 0], bone: hips, segments: 10, color: columnGrain, name: "column" },
  );
  for (const y of [0.14, 0.265, 0.385])
    b.part(new THREE.TorusGeometry(0.0295, 0.0055, 5, 12), GOLD, { bone: hips, at: [0, y, 0], dir: [0, 1, 0], axis: "z", name: "columnRing" });
  const barA = V(-0.27, BAR_Y, 0);
  const barB = V(0.27, BAR_Y, 0);
  b.rod(barA, barB, 0.022, { bone: hips, color: woodGrain, sides: 8, name: "bar" });
  for (const s of [1, -1]) {
    b.lathe(
      [
        [0, 0],
        [0.03, 0],
        [0.03, 0.006],
        [0.026, 0.014],
        [0.016, 0.02],
        [0, 0.022],
      ],
      { at: [s * 0.27, BAR_Y, 0], axis: [s, 0, 0], bone: hips, segments: 10, color: GOLD, name: "barCap" },
    );
    for (const x of [0.23, 0.2])
      b.part(new THREE.TorusGeometry(0.0235, 0.004, 5, 12), GOLD_DARK, { bone: hips, at: [s * x, BAR_Y, 0], dir: [1, 0, 0], axis: "z", name: "barRing" });
    // hanging sprig of leaves at each end
    const leafOutline: OutlinePoint[] = [
      [0, 0],
      [0.018, 0.013],
      [0.05, 0.019],
      [0.085, 0.0, "sharp"],
      [0.05, -0.019],
      [0.018, -0.013],
    ];
    const leafPaint = cel(
      paint((_p, _n, s2) => {
        if (Math.abs(s2[1]) < 0.0016) return "#a6f08a";
        if (zigzag((s2[0] - 1.4 * Math.abs(s2[1])) / 0.02) < 0.1) return "#69dc7f";
        return LEAF;
      }),
    );
    [
      { d: [s * 0.55, -0.62, 0.3], l: 1 },
      { d: [s * 0.8, -0.3, -0.45], l: 0.9 },
      { d: [s * 0.35, -0.7, -0.55], l: 0.8 },
      { d: [s * 0.9, 0.0, 0.35], l: 0.85 },
    ].forEach((leaf, i) => {
      const d = V(leaf.d[0], leaf.d[1], leaf.d[2]).normalize();
      const yv = V(0, 1, 0).addScaledVector(d, -d.y).normalize();
      b.extrude(leafOutline.map((p) => (p.length === 3 ? ([p[0] * leaf.l, p[1] * leaf.l, "sharp"] as OutlinePoint) : ([p[0] * leaf.l, p[1] * leaf.l] as OutlinePoint))), {
        at: V(s * (0.268 - 0.002 * i), BAR_Y - 0.012, 0.002 * i),
        x: d,
        y: yv,
        thickness: 0.004,
        smoothing: 1,
        color: leafPaint,
        bone: hips,
        name: "leaf",
      });
    });
  }
  // tiny gold rivets round the plinth shoulder, merged into one part
  const rivets: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    rivets.push(new THREE.SphereGeometry(0.0055, 4, 3).translate(Math.cos(a) * 0.154, 0.0825, Math.sin(a) * 0.154));
  }
  b.part(mergeGeometries(rivets), GOLD, { bone: hips, at: [0, 0, 0], name: "rivets" });

  return b.root;
}
