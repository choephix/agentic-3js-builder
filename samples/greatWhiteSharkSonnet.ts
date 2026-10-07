import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { cells, mix, paint, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import type { OutlinePoint } from "../src/builder";

export const meta = {
  name: "Great White Shark",
  description:
    "A 5 m great white cruising 0.3 m above the floor, drawn as a polished hero skin: slate-blue back, crisp white belly wedge, bevelled fins with orange trim, glowing gill slits and a research tracker on the dorsal fin.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: cool slate blues, white belly, one strong accent (hot orange)
const SLATE_DK = "#233a52";
const SLATE = "#3c607d";
const FLANK_HI = "#6f94ae";
const FLANK_LO = "#93b4c8";
const BELLY = "#f2f6f8";
const NAVY = "#101b28";
const ORANGE = "#ff7a18";
const ORANGE_DK = "#c9500b";
const EYE = "#0a0e13";
const MOUTH = "#4b1522";
const GUM = "#a8334a";
const TOOTH = "#f8f3e4";
const SCAR = "#b8cfdc";
const WHITE = "#ffffff";
const STEEL = "#8fa3b3";

const Y0 = 1.182; // height of the body axis at its girth; the belly clears the floor by 0.3 m once the fins hang below

// ---------------------------------------------------------------------------------------------------------------
// Body profile (z, half-height, half-width), smooth Hermite through the keys
const KEYS: number[][] = [
  [-2.05, 0.105, 0.075],
  [-1.7, 0.135, 0.1],
  [-1.3, 0.22, 0.185],
  [-0.8, 0.37, 0.34],
  [-0.3, 0.5, 0.47],
  [0.2, 0.57, 0.53],
  [0.7, 0.57, 0.52],
  [1.15, 0.5, 0.46],
  [1.5, 0.4, 0.38],
  [1.8, 0.29, 0.29],
  [2.05, 0.16, 0.17],
  [2.2, 0.07, 0.08],
];
function profile(z: number): [number, number] {
  const n = KEYS.length;
  if (z <= KEYS[0][0]) return [KEYS[0][2], KEYS[0][1]];
  if (z >= KEYS[n - 1][0]) return [KEYS[n - 1][2], KEYS[n - 1][1]];
  let i = 0;
  while (KEYS[i + 1][0] < z) i++;
  const k0 = KEYS[Math.max(i - 1, 0)];
  const k1 = KEYS[i];
  const k2 = KEYS[i + 1];
  const k3 = KEYS[Math.min(i + 2, n - 1)];
  const u = (z - k1[0]) / (k2[0] - k1[0]);
  const out: number[] = [];
  for (const c of [1, 2]) {
    const m1 = (k2[c] - k0[c]) / (k2[0] - k0[0]);
    const m2 = (k3[c] - k1[c]) / (k3[0] - k1[0]);
    const h = k2[0] - k1[0];
    const u2 = u * u;
    const u3 = u2 * u;
    out.push(
      (2 * u3 - 3 * u2 + 1) * k1[c] + (u3 - 2 * u2 + u) * h * m1 + (-2 * u3 + 3 * u2) * k2[c] + (u3 - u2) * h * m2,
    );
  }
  return [out[1], out[0]];
}
const headLift = (z: number) => 0.07 * smoothstep(1.0, 1.9, z); // flattens the underside of the head so the jaw reads

// ---------------------------------------------------------------------------------------------------------------
// Body paint: crisp colour blocking on the dorsal clock (0 = back, 180 = belly)
const tri = (x: number) => Math.abs(x - Math.floor(x) - 0.5) * 2;
const EYE_C = { x: 0.285, y: Y0 + 0.035, z: 1.76 };
const MOUTH_Z0 = 1.12;
const MOUTH_W = 0.31;
const MOUTH_L = 0.84;

const bodyPaint = paint((p, n, s) => {
  const z = p.z;
  const ax = Math.abs(p.x);
  let d = ((s[1] % 360) + 360) % 360;
  if (d > 180) d = 360 - d;
  const bBack = 64 + 7 * tri(z * 3.3 + 0.2) - 8 * smoothstep(1.55, 2.2, z);
  const bBelly = 118 - 30 * Math.exp(-(((z - 0.78) / 0.42) ** 2)) + 7 * tri(z * 5.2);
  let c: string | readonly [number, number, number];
  if (d < bBack) c = mix(SLATE_DK, SLATE, smoothstep(0, bBack, d) * 0.85);
  else if (d < bBelly) c = mix(FLANK_HI, FLANK_LO, smoothstep(bBack, bBelly, d));
  else c = BELLY;

  // pale scars across the left flank
  if (p.x > 0 && d > 42 && d < 98 && z > -0.2 && z < 0.5) {
    for (let k = 0; k < 3; k++) {
      const e = z - 0.05 + (d - 70) * 0.012 - k * 0.055;
      if (Math.abs(e) < 0.006) c = SCAR;
    }
  }

  // rivet-line seams across back and flank
  if (d < bBelly - 4) {
    for (const zi of [0.12, -0.5, -1.1, -1.6]) if (Math.abs(z - zi) < 0.0045) c = mix(c, NAVY, 0.6);
  }

  // forward-pointing orange chevrons down the back behind the dorsal fin
  if (d > 5 && d < 46 && z < -0.15 && z > -1.45) {
    for (const zc of [-0.42, -0.72, -1.02]) {
      const e = Math.abs(z - (zc - 0.008 * (d - 5)));
      if (e < 0.012) c = ORANGE;
      else if (e < 0.02) c = NAVY;
    }
  }

  // orange lateral livery stripe, outlined in navy, tapering at both ends
  const taper = smoothstep(-1.95, -1.25, z) * (1 - smoothstep(0.05, 0.5, z));
  const w = 6 * taper;
  if (w > 0.5) {
    const dc = Math.abs(d - 77);
    if (dc < w) c = ORANGE;
    else if (dc < w + 1.4) c = NAVY;
  }

  // dark mask round the eye, swept back
  const dz = z < EYE_C.z ? (z - EYE_C.z) * 0.5 : z - EYE_C.z;
  const de = Math.hypot(ax - EYE_C.x, p.y - EYE_C.y, dz);
  if (de < 0.1 && d < 140) c = de < 0.088 ? NAVY : mix(NAVY, SLATE_DK, 0.5);

  // three orange slashes on the cheek, behind the eye
  if (z > 1.2 && z < 1.65 && d > 40 && d < 100) {
    for (let k = 0; k < 3; k++) {
      const e = Math.abs(z - (1.5 - k * 0.07 + (d - 70) * 0.006));
      if (e < 0.013 - k * 0.002) c = ORANGE;
      else if (e < 0.021 - k * 0.002) c = NAVY;
    }
  }

  // ampullae pores on the snout
  if (z > 1.8 && d < 150) {
    const cell = cells(p, 0.04, 3);
    if (cell.d1 < 0.1) c = mix(c, NAVY, 0.8);
  }

  // palate and gum, painted on the underside of the head: seen when the jaw opens
  if (n.y < -0.45 && z > MOUTH_Z0) {
    const e = (ax / MOUTH_W) ** 2 + ((z - MOUTH_Z0) / MOUTH_L) ** 2;
    if (e < 0.8) c = mix(MOUTH, "#6a2030", smoothstep(0.0, 0.8, e));
    else if (e < 1.0) c = GUM;
  }

  // denticle tone: every skin cell a hair lighter or darker
  const sk = cells(p, 0.03, 9);
  return mix(c, sk.id > 0.5 ? WHITE : NAVY, 0.012 + 0.014 * sk.id);
});

// ---------------------------------------------------------------------------------------------------------------
// Fin paints, read on the outline coordinates s = [x, y]
const finPaint = (thick: THREE.Vector3, body: (s: readonly [number, number], n: THREE.Vector3) => string | readonly [number, number, number]) =>
  paint((_p, n, s) => {
    if (Math.abs(n.dot(thick)) < 0.5) return ORANGE; // bevelled rim = orange trim
    return body(s, n);
  });

const T_X = new THREE.Vector3(1, 0, 0);
const dorsalPaint = finPaint(T_X, (s) => {
  if (Math.abs(s[1] - 0.17) < 0.007 && s[0] > 0.1 && s[0] < 0.7) return NAVY;
  if (Math.abs(s[1] - 0.27) < 0.004 && s[0] > 0.1 && s[0] < 0.62) return ORANGE_DK;
  return mix(SLATE, SLATE_DK, smoothstep(0.05, 0.85, s[1]));
});
const dorsal2Paint = finPaint(T_X, (s) => mix(SLATE, SLATE_DK, smoothstep(-0.05, 0.3, s[1])));
const analPaint = finPaint(T_X, (s) => mix(BELLY, "#bfd0dc", smoothstep(0.0, -0.3, s[1])));
const caudalPaint = finPaint(T_X, (s) => {
  const ay = Math.abs(s[1]);
  const chev = Math.abs(s[0] - (0.12 + 0.3 * ay));
  if (ay < 0.56 && s[0] > 0 && chev < 0.03) return ORANGE;
  if (ay < 0.56 && s[0] > 0 && chev < 0.046) return NAVY;
  return s[1] > -0.05 ? mix(SLATE, SLATE_DK, smoothstep(0, 0.9, s[1])) : mix(SLATE, FLANK_HI, smoothstep(0, -0.7, s[1]));
});
const keelPaint = finPaint(new THREE.Vector3(0, 1, 0), () => SLATE_DK);

function pectoralPaint(thick: THREE.Vector3) {
  return finPaint(thick, (s, n) => {
    const a = Math.atan2(-s[1], s[0]);
    const r = Math.hypot(s[0], s[1]);
    let line = false;
    for (const ai of [0.4, 0.75, 1.05]) if (r > 0.3 && Math.abs(r * Math.sin(a - ai)) < 0.0045) line = true;
    if (n.y > 0) {
      const base = mix(SLATE, SLATE_DK, smoothstep(0.2, 1.3, s[0]));
      return line ? mix(base, NAVY, 0.55) : base;
    }
    const tip = Math.hypot(s[0] - 1.25, s[1] + 0.95);
    if (tip < 0.4 + 0.02 * Math.sin(s[0] * 40)) return NAVY; // the dark underside tip of a white shark's pectoral
    return line ? "#c4d4de" : BELLY;
  });
}
const pelvicPaint = finPaint(new THREE.Vector3(0, 1, 0), (s, n) => (n.y > 0 ? mix(SLATE, FLANK_HI, smoothstep(0, 0.6, s[0])) : BELLY));

// ---------------------------------------------------------------------------------------------------------------
const eyeTex = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="${ORANGE}"/>
    <circle cx="50" cy="50" r="40" fill="${NAVY}"/>
    <circle cx="50" cy="50" r="33" fill="${EYE}"/>
    <ellipse cx="36" cy="34" rx="10" ry="7" fill="#ffffff" transform="rotate(-30 36 34)"/>
    <circle cx="63" cy="66" r="4.5" fill="#cfe6f4"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "greatWhiteShark", paintSize: 2048 });

  // ------------------------------------------------------------------------------------------------ skeleton
  const spinePts = [
    [-2.05, 0.17],
    [-1.45, 0.09],
    [-0.85, 0.03],
    [-0.25, 0],
    [0.35, 0],
    [1.0, -0.01],
    [1.6, -0.04],
    [2.2, -0.09],
  ].map(([z, dy]) => [0, Y0 + dy, z]);
  const bodyPath = catmull(spinePts);
  const rootT = bodyPath.closestT([0, Y0, 0.2]);
  const headT = bodyPath.closestT([0, Y0 - 0.01, 1.35]);

  const hips = b.joint("hips", { at: bodyPath.at(rootT), dir: [0, 0, 1] });
  const front = b.chain("spine", bodyPath.slice(rootT, headT), {
    parent: hips,
    count: 2,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const head = b.joint("head", { parent: front.joints[1], at: bodyPath.at(headT), aim: bodyPath.at(1), role: "head" });
  const back = b.chain("tail", bodyPath.slice(rootT, 0), {
    parent: hips,
    count: 6,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tailTip"],
    role: "tail",
  });

  // ------------------------------------------------------------------------------------------------ body
  const bodyTube = b.sweep(
    bodyPath,
    (t) => {
      const [rx, ry] = profile(bodyPath.at(t).z);
      return [rx, ry];
    },
    {
      bone: [back, hips, front, head],
      color: bodyPaint,
      shift: (t) => [0, headLift(bodyPath.at(t).z)],
      sides: 14,
      name: "body",
    },
  );
  const skin = b.surface(bodyTube);
  const belowY = (x: number, z: number) => {
    const h = skin.ray([x, Y0 - 3, z], [0, 1, 0]);
    return h ? h.at.y : Y0 - 0.4;
  };

  // ------------------------------------------------------------------------------------------------ jaw
  const hingeY = belowY(0, MOUTH_Z0);
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, hingeY, MOUTH_Z0],
    aim: [0, hingeY + 0.12, MOUTH_Z0 + 0.6],
    role: "jaw",
  });

  // lower jaw: an ellipsoid whose equator follows the belly of the head
  const dome = new THREE.SphereGeometry(1, 20, 12);
  {
    const pos = dome.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const ux = pos.getX(i);
      const uy = pos.getY(i);
      const uz = pos.getZ(i);
      const px = ux * MOUTH_W;
      const pz = MOUTH_Z0 + uz * MOUTH_L;
      pos.setXYZ(i, px, belowY(px, Math.max(pz, MOUTH_Z0 - 0.05)) - 0.008 + uy * 0.115, pz);
    }
    dome.computeVertexNormals();
  }
  const jawPaint = paint((p, n) => {
    if (n.y > 0.12) return mix(MOUTH, "#6a2030", 0.3);
    if (n.y > -0.3) return GUM;
    return p.z > MOUTH_Z0 + 0.55 ? mix(BELLY, "#d8e4ec", smoothstep(MOUTH_Z0 + 0.55, MOUTH_Z0 + 0.84, p.z)) : BELLY;
  });
  b.part(dome, jawPaint, { bone: jaw, at: [0, 0, 0], name: "lowerJaw" });

  // teeth: flat triangular plates in two rows per jaw
  const toothRow = (scale: number, count: number, size: number, upper: boolean) => {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < count; i++) {
      const phi = (-86 + (172 * i) / (count - 1)) * (Math.PI / 180);
      const x = MOUTH_W * scale * Math.sin(phi);
      const z = MOUTH_Z0 + 0.02 + MOUTH_L * scale * Math.cos(phi);
      const theta = Math.atan2(x / MOUTH_W ** 2, (z - MOUTH_Z0) / MOUTH_L ** 2);
      const k = size * (0.62 + 0.38 * Math.cos(phi * 0.9));
      const h = 0.1 * k;
      const r = 0.036 * k;
      const g = new THREE.ConeGeometry(r, h, 3).scale(1, 1, 0.5);
      if (upper) {
        g.rotateX(Math.PI);
        g.rotateY(theta);
        g.translate(x, belowY(x, z) + 0.02 - h / 2, z);
      } else {
        g.rotateY(theta);
        g.translate(x, belowY(x, z) - 0.015 + h / 2, z);
      }
      geos.push(g);
    }
    return geos;
  };
  const upperTeeth = [...toothRow(1.04, 27, 1, true), ...toothRow(0.9, 21, 0.65, true)];
  const lowerTeeth = [...toothRow(0.94, 23, 0.9, false), ...toothRow(0.82, 17, 0.6, false)];
  b.part(mergeGeometries(upperTeeth), TOOTH, { bone: head, at: [0, 0, 0], flat: true, name: "upperTeeth" });
  b.part(mergeGeometries(lowerTeeth), TOOTH, { bone: jaw, at: [0, 0, 0], flat: true, name: "lowerTeeth" });

  // ------------------------------------------------------------------------------------------------ eyes, nostrils, furrows
  for (const s of [1, -1]) {
    const hit = skin.ray([s * 2, EYE_C.y, EYE_C.z], [-s, 0, 0]);
    if (!hit) throw new Error("no eye hit");
    const centre = hit.moved([0, 0.014, 0]);
    const ball = b.part(new THREE.SphereGeometry(0.062, 10, 6), EYE, { at: centre, bone: head, name: `eye${s > 0 ? "L" : "R"}` });
    const tip = ball.at.clone().addScaledVector(hit.n, 0.061);
    glow(
      b.decal(ball, eyeTex, {
        at: tip,
        dir: [hit.n.x, hit.n.y, hit.n.z],
        up: [0, 1, 0],
        size: [0.1, 0.1],
        segments: 8,
        lift: 0.001,
        bone: head,
        name: `iris${s > 0 ? "L" : "R"}`,
      }),
      1,
    );

    const nose = skin.ray([s * 0.11, Y0 + 1, 2.04], [0, -1, 0]);
    if (nose) b.stick(new THREE.SphereGeometry(0.022, 8, 4).scale(1, 0.45, 2.2), NAVY, nose, { embed: 0.3, bone: head, name: "nostril" });

    // labial furrow from the mouth corner
    const furrow = skin.drape(
      catmull([
        [s * 0.4, hingeY + 0.03, MOUTH_Z0 + 0.04],
        [s * 0.47, hingeY + 0.14, MOUTH_Z0 - 0.04],
        [s * 0.5, hingeY + 0.26, MOUTH_Z0 - 0.16],
      ]),
      { lift: 0.003 },
    );
    b.sweep(furrow, [0.009, 0.004], { color: NAVY, bone: head, caps: "round", sides: 5, name: "furrow" });
  }

  // ------------------------------------------------------------------------------------------------ gill slits
  const slitZ = [0.98, 0.86, 0.74, 0.62, 0.5];
  const slitLen = [0.27, 0.26, 0.24, 0.21, 0.17];
  for (const s of [1, -1]) {
    slitZ.forEach((zi, k) => {
      const mk = (dz: number, lift: number, radius: number[], color: string, g: boolean) => {
        const pts: number[][] = [];
        for (let j = 0; j <= 4; j++) {
          const u = j / 4;
          const y = Y0 + 0.05 + slitLen[k] * (1 - 2 * u) + (k === 0 ? 0.03 : 0);
          const z = zi + dz - 0.035 * Math.sin(Math.PI * u) + 0.02 * (u - 0.5);
          const h = skin.ray([s * 3, y, z], [-s, 0, 0]);
          if (h) pts.push([h.at.x, h.at.y, h.at.z]);
        }
        const sw = b.sweep(skin.drape(catmull(pts), { lift }), radius, { color, sides: 5, caps: "round", name: `gill${s > 0 ? "L" : "R"}${k}` });
        if (g) glow(sw, 1);
      };
      mk(0, 0.002, [0.005, 0.017, 0.005], NAVY, false);
      mk(-0.024, 0.004, [0.002, 0.006, 0.002], ORANGE, true);
    });
  }

  // ------------------------------------------------------------------------------------------------ fins
  const fin = (outline: OutlinePoint[], o: Parameters<typeof b.extrude>[1]) => b.extrude(outline, { smoothing: 1, ...o });

  // dorsal fin with a research tracker
  const dorsalJoint = b.joint("dorsal", { parent: front.joints[0], at: [0, Y0 + 0.49, 0.78], dir: [0, 1, 0], role: "hinge" });
  const dorsal = fin(
    [
      [0, -0.08],
      [0.1, 0.28],
      [0.3, 0.62],
      [0.52, 0.9, "sharp"],
      [0.5, 0.55],
      [0.58, 0.28],
      [0.78, -0.08],
    ],
    { at: [0, Y0 + 0.49, 0.78], x: [0, 0, -1], y: [0, 1, 0], thickness: [0.1, 0.012], bevel: 0.012, color: dorsalPaint, bone: dorsalJoint, name: "dorsalFin" },
  );
  for (const s of [1, -1]) {
    const a = dorsal.local([0.2, 0.46, s * 0.047]);
    const c = dorsal.local([0.27, 0.6, s * 0.047]);
    b.capsule(a, c, 0.024, { color: ORANGE, bone: dorsalJoint, sides: 6, name: "tagBody" });
    const m = dorsal.local([0.235, 0.53, s * 0.07]);
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), WHITE, { at: m, bone: dorsalJoint, name: "tagLens" }), 1.2);
  }
  b.rod(dorsal.local([0.27, 0.6, 0.047]), dorsal.local([0.4, 0.82, 0.047]), 0.005, { color: NAVY, bone: dorsalJoint, sides: 4, name: "tagAerial" });

  // second dorsal and anal fins
  const d2y = Y0 + 0.03 + 0.2;
  const d2j = b.joint("dorsal2", { parent: back.joints[1], at: [0, d2y, -1.1], dir: [0, 1, 0], role: "hinge" });
  fin(
    [
      [0, -0.06],
      [0.07, 0.15],
      [0.2, 0.3, "sharp"],
      [0.28, 0.12],
      [0.36, -0.06],
    ],
    { at: [0, d2y, -1.1], x: [0, 0, -1], y: [0, 1, 0], thickness: [0.05, 0.008], bevel: 0.008, color: dorsal2Paint, bone: d2j, name: "dorsalFin2" },
  );
  const anY = Y0 + 0.04 - 0.19;
  const anJ = b.joint("anal", { parent: back.joints[1], at: [0, anY, -1.15], dir: [0, -1, 0], role: "hinge" });
  fin(
    [
      [0, 0.06],
      [0.06, -0.16],
      [0.2, -0.33, "sharp"],
      [0.26, -0.14],
      [0.36, 0.06],
    ],
    { at: [0, anY, -1.15], x: [0, 0, -1], y: [0, 1, 0], thickness: [0.008, 0.05], bevel: 0.008, color: analPaint, bone: anJ, name: "analFin" },
  );

  // pectoral and pelvic fins
  const pecShape: OutlinePoint[] = [
    [0, 0],
    [0.4, -0.1],
    [0.85, -0.38],
    [1.25, -0.95, "sharp"],
    [0.95, -0.82],
    [0.65, -0.68],
    [0.3, -0.58],
    [0, -0.5],
  ];
  const pelShape: OutlinePoint[] = [
    [0, 0],
    [0.2, -0.04],
    [0.45, -0.2],
    [0.62, -0.46, "sharp"],
    [0.36, -0.4],
    [0.1, -0.36],
    [0, -0.3],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // pectoral
    {
      const out = new THREE.Vector3(s * 0.88, -0.42, -0.12).normalize();
      const ch = new THREE.Vector3(0, 0.12, 1);
      ch.addScaledVector(out, -ch.dot(out)).normalize();
      const thick = out.clone().cross(ch).normalize();
      const at = [s * 0.2, Y0 - 0.3, 0.52];
      const j = b.joint(`pectoral${side}`, { parent: front.joints[0], at, dir: [out.x, out.y, out.z], role: "hinge" });
      fin(pecShape, {
        at,
        x: [out.x, out.y, out.z],
        y: [ch.x, ch.y, ch.z],
        thickness: [0.01, 0.075],
        bevel: 0.014,
        color: pectoralPaint(thick),
        bone: j,
        name: `pectoralFin${side}`,
      });
    }
    // pelvic
    {
      const out = new THREE.Vector3(s * 0.8, -0.55, -0.22).normalize();
      const ch = new THREE.Vector3(0, 0.1, 1);
      ch.addScaledVector(out, -ch.dot(out)).normalize();
      const at = [s * 0.08, Y0 - 0.3, -0.7];
      const j = b.joint(`pelvic${side}`, { parent: back.joints[0], at, dir: [out.x, out.y, out.z], role: "hinge" });
      fin(pelShape, {
        at,
        x: [out.x, out.y, out.z],
        y: [ch.x, ch.y, ch.z],
        thickness: [0.008, 0.05],
        bevel: 0.01,
        color: pelvicPaint,
        bone: j,
        name: `pelvicFin${side}`,
      });
      b.capsule([s * 0.1, Y0 - 0.39, -0.86], [s * 0.14, Y0 - 0.45, -1.2], [0.018, 0.012], {
        color: SLATE,
        bone: j,
        sides: 6,
        name: `clasper${side}`,
      });
    }
  }

  // caudal fin and peduncle keels
  const tailEnd = bodyPath.at(0);
  const caudalJoint = b.joint("caudal", { parent: back.joints[6], at: [0, tailEnd.y, tailEnd.z + 0.05], dir: [0, 0, -1], role: "hinge" });
  fin(
    [
      [-0.15, 0.09],
      [0.15, 0.35],
      [0.45, 0.8],
      [0.68, 1.04, "sharp"],
      [0.5, 0.62],
      [0.4, 0.3],
      [0.38, 0.02],
      [0.45, -0.35],
      [0.52, -0.74, "sharp"],
      [0.3, -0.55],
      [0.08, -0.28],
      [-0.15, -0.09],
    ],
    { at: [0, tailEnd.y, tailEnd.z + 0.05], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.05, bevel: 0.02, color: caudalPaint, bone: caudalJoint, name: "caudalFin" },
  );
  const keelY = bodyPath.at(bodyPath.closestT([0, Y0, -1.62])).y;
  fin(
    [
      [-0.2, 0.17],
      [-0.1, 0],
      [0.1, 0],
      [0.2, 0.17],
      [0.1, 0.38],
      [-0.1, 0.38],
    ],
    { at: [0, keelY, -1.6], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.022, bevel: 0.007, color: keelPaint, bone: back.joints[4], name: "caudalKeel" },
  );

  // orange dashes along the dorsal ridge ahead of the tail
  const ridge = bodyTube.line(0, 0.004);
  for (const [z0, z1] of [
    [-0.15, -0.35],
    [-0.5, -0.7],
    [-0.85, -1.0],
    [-1.2, -1.32],
  ]) {
    const t0 = bodyPath.closestT([0, Y0, z0]);
    const t1 = bodyPath.closestT([0, Y0, z1]);
    const seg = ridge.slice(Math.min(t0, t1), Math.max(t0, t1));
    b.sweep(seg, 0.009, { color: ORANGE, sides: 5, caps: "round", name: "ridgeDash" });
  }

  // steel tag-plate on the first dorsal's base
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.16), STEEL, { at: [0, Y0 + 0.575, 0.52], bone: front.joints[0], name: "plate" });

  // a remora riding the belly: dorsal sucker pressed to the shark, its own small joint
  const remX = 0.14;
  const remBelly = belowY(remX, 0.2);
  const remY = remBelly - 0.062;
  const remora = b.joint("remora", { parent: hips, at: [remX, remY, 0.1], dir: [0, 0, 1], role: "hinge" });
  b.sweep(
    [
      [remX, remY, -0.1],
      [remX, remY, 0.1],
      [remX, remY, 0.36],
    ],
    [0.008, 0.036, 0.04, 0.034, 0.02],
    {
      color: paint((_p, n) => (n.y > 0.35 ? SLATE_DK : n.y > -0.2 ? mix(SLATE, WHITE, 0.15) : "#d9e2e8")),
      bone: remora,
      sides: 8,
      caps: "round",
      name: "remoraBody",
    },
  );
  b.extrude(
    [
      [0, 0.0],
      [0.04, 0.05],
      [0.12, 0.05],
      [0.11, -0.02],
      [0.12, -0.07],
      [0.04, -0.07],
    ],
    { at: [remX, remY, -0.1], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, bevel: 0.004, color: SLATE_DK, bone: remora, name: "remoraTail" },
  );
  b.extrude(
    [
      [-0.03, 0],
      [0.0, 0.035],
      [0.12, 0.04],
      [0.2, 0.025],
      [0.2, -0.025],
      [0.12, -0.04],
      [0.0, -0.035],
    ],
    {
      at: [remX, remY + 0.05, 0.15],
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.016,
      bevel: 0.004,
      smoothing: 1,
      color: paint((_p, n, s) => (n.y < -0.5 ? SLATE_DK : Math.floor(s[0] * 42) % 2 ? FLANK_LO : NAVY)),
      bone: remora,
      name: "remoraSucker",
    },
  );
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.009, 6, 4), EYE, { at: [remX + s * 0.034, remY + 0.005, 0.32], bone: remora, name: "remoraEye" });

  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  return b.root;
}
