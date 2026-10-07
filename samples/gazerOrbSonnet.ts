import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cells, noise } from "../src/paint";
import { glow } from "../kits/glow";
import { cellPaint, pixelTexture, snapColor } from "../kits/pixel";

export const meta = {
  name: "Gazer Orb",
  description:
    "A hovering eye-orb monster in pixel art: a violet plated sphere with one huge glowing eye, a toothy lolling mouth, cheek rings, a glowing back sigil and ten eyestalks that each stare their own way.",
  style: "pixel art",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- constants
const FINE = 0.01; // small-part texel (stalks, stalk eyes)
const R = 0.4; // orb radius
const CY = 0.98; // orb centre height: fringe tips hover at y = 0.4
const C = new THREE.Vector3(0, CY, 0);
const P = (x: number, y: number, z: number): [number, number, number] => [x, CY + y, z];

const rad = (d: number) => (d * Math.PI) / 180;
const dirAE = (az: number, el: number) =>
  new THREE.Vector3(Math.sin(rad(az)) * Math.cos(rad(el)), Math.sin(rad(el)), Math.cos(rad(az)) * Math.cos(rad(el)));
const onOrb = (az: number, el: number, lift = 0) => C.clone().addScaledVector(dirAE(az, el), R + lift);

// ---------------------------------------------------------------- palette
const FLESH = ["#241238", "#3a1a54", "#58266f", "#7e3688", "#a64a9c", "#cc6eb2"].map((c) => snapColor(c, 64));
const BELLY = ["#6a3060", "#93447a", "#c0628c", "#e48c9c", "#f4b8a0", "#fcdcbc"].map((c) => snapColor(c, 64));
const STALK = ["#3b1747", "#5c2766", "#85397f", "#b0539a", "#d878b0", "#f4a6c4"].map((c) => snapColor(c, 64));
const LIP = "#8a2850";
const LIDRIM = "#3a1442";
const BONE = "#e9d9b0";
const GOLD = "#e2b53a";
const RUBY = "#e03a4a";
const WART_A = "#e8b6a0";
const WART_B = "#5a2268";

type PCell = Parameters<Parameters<typeof cellPaint>[1]>[0];

// ---------------------------------------------------------------- paints
const bodyPaint = cellPaint(
  0.02,
  (c: PCell) => {
    const plate = cells(c.at, 0.15, 5);
    const edge = plate.d2 - plate.d1;
    const n = noise(c.at, 0.1, 2);
    const wavy = noise(c.at, 0.2, 7);
    const belly = c.n.y < -0.22 + 0.4 * (wavy - 0.5);
    if (belly) {
      let v = 0.42 + 0.55 * (-c.n.y - 0.2) + 0.18 * (n - 0.5) + 0.08 * (plate.id - 0.5);
      if (edge < 0.13) v -= 0.25;
      return c.pick(BELLY, v);
    }
    let v = 0.5 + 0.3 * c.n.y + 0.18 * (n - 0.5) + 0.22 * (plate.id - 0.5);
    if (edge < 0.13) v -= 0.32;
    else if (edge < 0.24 && c.n.y > -0.1) v += 0.16;
    if (Math.abs(noise(c.at, 0.16, 11) - 0.5) < 0.014) v -= 0.22;
    if (c.random(3) < 0.012) return "#1a0a26";
    return c.pick(FLESH, v);
  },
  { dither: true },
);

const stalkPaint = (len: number, seed: number) =>
  cellPaint(
    FINE,
    (c: PCell) => {
      const t = c.s[0];
      const ring = Math.floor((t * len) / 0.04) % 2 === 0;
      let v = 0.55 + 0.25 * c.n.y + 0.4 * (noise(c.at, 0.05, seed) - 0.5) + (ring ? 0 : -0.15) + 0.12 * t;
      if (c.random(seed) < 0.05) v += 0.3;
      return c.pick(STALK, v);
    },
    { dither: true },
  );

const scleraBig = cellPaint(0.02, (c: PCell) => {
  const edgeF = 1 - c.n.z;
  const vein = Math.abs(noise(c.at, 0.07, 3) - 0.5) < 0.02 && edgeF > 0.4;
  if (vein) return c.random(1) < 0.5 ? "#c8404a" : "#a02a3c";
  const v = 0.5 + 0.25 * c.n.y + 0.3 * (noise(c.at, 0.08, 4) - 0.5) - 0.25 * edgeF;
  return c.pick(["#a58e5c", "#c9b27a", "#e3d49e", "#f6edc4"], v);
});

const scleraSmall = cellPaint(FINE, (c: PCell) => {
  const edgeF = 1 - c.n.z;
  if (Math.abs(noise(c.at, 0.035, 8) - 0.5) < 0.03 && edgeF > 0.35) return "#c8404a";
  const v = 0.55 + 0.25 * c.n.y - 0.2 * edgeF;
  return c.pick(["#b09a66", "#d4c088", "#ece0ac", "#faf4d2"], v);
});

const tonguePaint = cellPaint(FINE, (c: PCell) => {
  if (Math.abs(c.at.x) < 0.007) return "#8a2040";
  const v = 0.55 + 0.3 * c.n.y + 0.3 * (noise(c.at, 0.04, 6) - 0.5);
  return c.pick(["#8a2040", "#b83458", "#d8506e", "#ee7a8c", "#ffa8b0"], v);
});

// ---------------------------------------------------------------- pixel drawings
function irisTexture(n: number, pal: [string, string, string, string], pupil = "#0a0408") {
  return pixelTexture(n, n, (g) => {
    const c = (n - 1) / 2;
    const hx = Math.floor(n * 0.27);
    g.fill((x, y) => {
      const dx = x - c;
      const dy = y - c;
      const d = Math.hypot(dx, dy);
      if (d > n / 2 - 0.1) return "";
      const slit = (n / 12) * 1.1 * Math.sqrt(Math.max(0, 1 - (dy / (c + 0.4)) ** 2));
      if (Math.abs(dx) < slit && d < n / 2 - 1.1) return pupil;
      if (d > n / 2 - 1.1) return pal[0];
      if (d > n * 0.29) return pal[1];
      if (d > n * 0.16) return pal[2];
      return pal[3];
    });
    g.set(hx, hx, "#ffffff");
    if (n >= 10) {
      g.set(hx + 1, hx, "#ffffff");
      g.set(hx, hx + 1, "#ffffff");
    }
  });
}

const IRIS_MAIN = irisTexture(12, ["#3a0a05", "#c8420a", "#ff9a1a", "#fff08a"]);
const IRIS_SMALL = [
  irisTexture(8, ["#0d3b1c", "#2f9b3f", "#7be04e", "#d8ff8a"]),
  irisTexture(8, ["#0a2f4a", "#1f8fd0", "#4ad8ff", "#c8fbff"]),
  irisTexture(8, ["#3d0a3a", "#b22aa8", "#ff5fd9", "#ffc4f2"]),
  irisTexture(8, ["#4a1a00", "#d96a00", "#ffb41f", "#fff0a0"]),
  irisTexture(8, ["#3a0008", "#b0102a", "#ff4a4a", "#ffb0a0"]),
  irisTexture(8, ["#1a0a4a", "#5a3ad8", "#9a8aff", "#e0d8ff"]),
];

const CAVITY = pixelTexture(31, 12, (g) => {
  g.fill((x, y, w, h) => {
    const nx = (x - (w - 1) / 2) / (w / 2);
    const ny = (y - (h - 1) / 2) / (h / 2);
    const lens = Math.pow(Math.max(0, 1 - nx * nx), 0.75);
    if (Math.abs(ny) > lens * 0.95) return "";
    const deep = Math.abs(nx) < 0.55 && ny < 0.3;
    if (deep) return ny < -0.2 ? "#0c0308" : "#1c0612";
    return ny > 0.35 ? "#6a1630" : ny < -0.35 ? "#14050c" : "#340a1a";
  });
  g.set(9, 9, "#c85a78");
  g.set(21, 10, "#c85a78");
  g.set(15, 5, "#4a1024");
});

const SCAR = pixelTexture(6, 14, (g) => {
  for (let y = 0; y < 14; y++) {
    const x = Math.round(1 + (y * 3.4) / 13);
    g.set(x - 1, y, "#3a1030");
    g.set(x + 1, y, "#3a1030");
    g.set(x, y, "#e8a6b0");
    if (y % 3 === 1) {
      g.set(x - 2, y, "#1c0a14");
      g.set(x + 2, y, "#1c0a14");
      g.set(x, y, "#1c0a14");
    }
  }
});

const SIGIL = pixelTexture(20, 20, (g) => {
  g.fill((x, y) => {
    const dx = x - 9.5;
    const dy = y - 9.5;
    const d = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx);
    if (d > 8.2 && d < 9.7) return "#6ff3ff";
    if (d > 5.6 && d < 6.6) return "#2aa6d9";
    const spoke = Math.abs(((a / (Math.PI / 4)) % 1) + (((a / (Math.PI / 4)) % 1) < 0 ? 1 : 0));
    if (d >= 6.6 && d <= 8.2 && (spoke < 0.12 || spoke > 0.88)) return "#aef9ff";
    if (Math.abs(dx) + Math.abs(dy) <= 2.6) return Math.abs(dx) + Math.abs(dy) <= 1 ? "#0a1830" : "#6ff3ff";
    if (Math.abs(dx) + Math.abs(dy) <= 3.6 && d > 2.4) return "#2aa6d9";
    return "";
  });
});

// ---------------------------------------------------------------- stalk plan
type StalkSpec = {
  name: string;
  az: number;
  el: number;
  tip: [number, number, number];
  end: [number, number, number];
  iris: number;
};
const STALKS: StalkSpec[] = [
  { name: "stalkTop", az: 20, el: 82, tip: [0.03, 0.88, 0.0], end: [0, 1, 0.1], iris: 0 },
  { name: "stalkFront", az: 0, el: 72, tip: [0, 0.66, 0.42], end: [0, 0.3, 1], iris: 3 },
  { name: "stalkUL", az: 48, el: 56, tip: [0.4, 0.8, 0.22], end: [0.5, 0.6, 0.4], iris: 1 },
  { name: "stalkUR", az: -48, el: 56, tip: [-0.42, 0.76, 0.24], end: [-0.5, 0.6, 0.4], iris: 2 },
  { name: "stalkBackL", az: 115, el: 48, tip: [0.64, 0.66, -0.18], end: [0.8, 0.3, 0.2], iris: 4 },
  { name: "stalkBackR", az: -115, el: 48, tip: [-0.6, 0.7, -0.22], end: [-0.8, 0.3, 0.1], iris: 5 },
  { name: "stalkRearL", az: 160, el: 58, tip: [0.25, 0.72, -0.5], end: [0.2, 0.5, -0.8], iris: 0 },
  { name: "stalkRearR", az: -160, el: 58, tip: [-0.28, 0.64, -0.46], end: [-0.3, 0.4, -0.8], iris: 1 },
  { name: "stalkSideL", az: 84, el: 14, tip: [0.84, 0.34, 0.22], end: [0.5, -0.7, 0.3], iris: 2 },
  { name: "stalkSideR", az: -84, el: 14, tip: [-0.84, 0.3, 0.18], end: [-0.5, -0.7, 0.3], iris: 3 },
];

export default function build() {
  const b = createBuilder({ name: "gazerOrb", paintSize: 2048 });

  // ------------------------------------------------------------ skeleton
  const body = b.joint("body", { at: P(0, 0, 0), dir: [0, 1, 0], role: "spine" });
  const eyeJ = b.joint("eye", { parent: body, at: P(0, 0.1, 0.27), dir: [0, 0, 1], group: "eye" });
  const lidUpper = b.joint("lidUpper", { parent: eyeJ, at: P(0, 0.1, 0.27), dir: [0, 0, 1], role: "hinge", group: "eye" });
  const lidLower = b.joint("lidLower", { parent: eyeJ, at: P(0, 0.1, 0.27), dir: [0, 0, 1], role: "hinge", group: "eye" });
  const jaw = b.joint("jaw", { parent: body, at: P(0, -0.16, 0.06), dir: [0, -0.35, 1], role: "jaw", group: "mouth" });

  // ------------------------------------------------------------ orb
  const orb = b.part(new THREE.SphereGeometry(R, 18, 13), bodyPaint, { bone: body, at: P(0, 0, 0), name: "orb" });
  const skin = b.surface(orb);
  const hitAt = (az: number, el: number) => {
    const h = skin.around(C).at(az, el);
    if (!h) throw new Error(`no orb hit at ${az}/${el}`);
    return h;
  };

  // ------------------------------------------------------------ central eye
  const E = new THREE.Vector3(...P(0, 0.1, 0.27));
  const eyeball = b.part(new THREE.SphereGeometry(0.19, 14, 10), scleraBig, { bone: eyeJ, at: E, group: "eye", name: "eyeball" });
  const mainIris = b.decal(eyeball, IRIS_MAIN, {
    at: P(0, 0.1, 0.46),
    dir: [0, 0, 1],
    size: [0.26, 0.26],
    segments: 14,
    lift: 0.003,
    name: "irisMain",
  });
  glow(mainIris, 0.9);

  // socket rim: a ring of flesh round the eye opening, found by shooting rays from the eye centre to the orb
  const rim: THREE.Vector3[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const u = new THREE.Vector3(Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0.6).normalize();
    const e = E.clone().sub(C);
    const eu = e.dot(u);
    const t = -eu + Math.sqrt(eu * eu - (e.lengthSq() - R * R));
    rim.push(E.clone().addScaledVector(u, t * 1.0));
  }
  b.sweep(catmull(rim, { closed: true }), 0.034, { bone: body, color: LIDRIM, sides: 6, name: "socketRim", group: "eye" });

  // eyelids: cap shells on hinge joints, with a thick rim
  const lidCap = (theta: number, flip: boolean, bone: typeof lidUpper) => {
    const geo = new THREE.SphereGeometry(0.206, 14, 6, 0, Math.PI * 2, 0, theta);
    b.part(geo, bodyPaint, { bone, at: E, rotation: flip ? [180, 0, 0] : [0, 0, 0], group: "eye", name: flip ? "lidLowerShell" : "lidUpperShell" });
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const y = 0.206 * Math.cos(theta) * (flip ? -1 : 1);
      pts.push(E.clone().add(new THREE.Vector3(0.206 * Math.sin(theta) * Math.cos(a), y, 0.206 * Math.sin(theta) * Math.sin(a))));
    }
    b.sweep(catmull(pts, { closed: true }), 0.014, { bone, color: LIDRIM, sides: 5, group: "eye", name: flip ? "lidLowerRim" : "lidUpperRim" });
  };
  lidCap(0.62, false, lidUpper);
  lidCap(0.46, true, lidLower);

  // brow spikes
  const browAz = [-75, -50, -25, 25, 50, 75];
  browAz.forEach((az, i) => {
    const h = hitAt(az, 55 - Math.abs(az) * 0.12);
    const big = Math.abs(az) === 50;
    const geo = new THREE.ConeGeometry(big ? 0.04 : 0.032, big ? 0.15 : 0.1, 4);
    b.stick(geo, BONE, h, { embed: 0.25, bone: body, spin: i * 17, group: "eye", name: "brow" });
  });

  // ------------------------------------------------------------ mouth
  const azs = [-64, -48, -32, -16, 0, 16, 32, 48, 64];
  const kk = (az: number) => Math.cos((az / 64) * (Math.PI / 2));
  const upperPts = azs.map((az) => onOrb(az, -12 - 14 * kk(az), 0.014));
  const lowerPts = azs.map((az) => onOrb(az, -12 - 40 * kk(az), 0.014));
  const upperPath = catmull(upperPts);
  const lowerPath = catmull(lowerPts);
  b.sweep(upperPath, 0.03, { bone: body, color: LIP, sides: 6, name: "upperLip", group: "mouth" });
  b.sweep(lowerPath, 0.03, { bone: jaw, color: LIP, sides: 6, name: "lowerLip", group: "mouth" });
  // chin, a heavier fleshy band under the lower lip, rides the jaw
  const chinAz = [-70, -50, -30, -10, 10, 30, 50, 70];
  const chinPath = catmull(chinAz.map((az) => onOrb(az, -24 - 38 * kk(az * 0.9), 0.02)));
  b.sweep(chinPath, (t) => 0.026 + 0.045 * Math.sin(Math.PI * t), { bone: jaw, color: bodyPaint, sides: 6, name: "chin", group: "mouth" });
  b.decal(orb, CAVITY, {
    at: P(0, -0.23, 0.34),
    dir: [0, -0.3, 1],
    size: [0.6, 0.22],
    segments: 22,
    lift: 0.004,
    name: "mouthCavity",
    group: "mouth",
  });

  const tooth = (len: number, r: number) => new THREE.ConeGeometry(r, len, 4).translate(0, len / 2, 0);
  b.along(upperPath, 9, (at) => {
    const fang = at.t > 0.2 && at.t < 0.3 ? true : at.t > 0.7 && at.t < 0.8;
    return b.part(tooth(fang ? 0.1 : 0.05, fang ? 0.024 : 0.019), BONE, { frame: at, dir: [0, -1, 0.15], bone: body, group: "mouth", name: "toothUpper" });
  });
  b.along(lowerPath, 8, (at) => {
    const fang = at.t > 0.1 && at.t < 0.2 ? true : at.t > 0.8 && at.t < 0.9;
    return b.part(tooth(fang ? 0.085 : 0.045, fang ? 0.024 : 0.019), BONE, { frame: at, dir: [0, 1, 0.1], bone: jaw, group: "mouth", name: "toothLower" });
  });

  // tongue lolling over the lower lip
  const tongueC = b.chain(
    "tongue",
    catmull([P(0, -0.2, 0.26), P(0, -0.285, 0.34), P(0, -0.35, 0.44), P(0, -0.45, 0.49)]),
    { parent: jaw, count: 3, role: "tentacle", group: "mouth" },
  );
  b.sweep(tongueC, (t): [number, number] => [0.05 - 0.015 * t, 0.02], { color: tonguePaint, section: "box", name: "tongue", group: "mouth" });

  // ------------------------------------------------------------ eyestalks
  const up = new THREE.Vector3(0, 1, 0);
  const fwd = new THREE.Vector3(0, 0, 1);
  STALKS.forEach((s, si) => {
    const hit = hitAt(s.az, s.el);
    const base = hit.at.clone();
    const tip = new THREE.Vector3(...P(...s.tip));
    const endDir = new THREE.Vector3(...s.end).normalize();
    const c1 = base.clone().addScaledVector(hit.n, 0.22);
    const c2 = tip.clone().addScaledVector(endDir, -0.22);
    const path = bezier(base, c1, c2, tip);
    const { chain, sweep } = b.sprout(s.name, hit, path, [0.05, 0.026], {
      count: 4,
      role: "tentacle",
      color: stalkPaint(path.length, 20 + si),
      sides: 6,
      caps: { start: "flat", end: "flat" },
      group: s.name,
    });
    const last = chain!.joints[chain!.joints.length - 1];
    // collar where the stalk leaves the orb
    b.stick(new THREE.CylinderGeometry(0.068, 0.08, 0.05, 6), "#c9992e", hit, { embed: 0.4, bone: body, group: s.name, name: "collar" });
    // thorns on the stalk
    b.along(sweep, 3, (at) => b.spike(at, at, 0.05, 0.012, { color: BONE, sides: 4, group: s.name, name: "thorn" }), { from: 0.18, to: 0.8 });

    // eye at the tip
    const ec = tip.clone().addScaledVector(endDir, 0.035);
    const w = ec.z > -0.1 ? 0.3 : 0.85;
    const gaze = endDir.clone().multiplyScalar(w).addScaledVector(fwd, (1 - w) * 1.4).normalize();
    const perp = up.clone().addScaledVector(gaze, -gaze.y);
    if (perp.lengthSq() < 0.05) perp.set(0, 0, -1);
    perp.normalize();
    const ball = b.part(new THREE.SphereGeometry(0.058, 10, 8), scleraSmall, { bone: last, at: ec, group: s.name, name: "stalkEye" });
    const iris = b.decal(ball, IRIS_SMALL[s.iris], {
      at: ec.clone().addScaledVector(gaze, 0.058),
      dir: gaze,
      up: perp,
      size: [0.085, 0.085],
      segments: 8,
      lift: 0.0025,
      name: "stalkIris",
      group: s.name,
    });
    glow(iris, 0.9);
    const lidDir = perp.clone().multiplyScalar(0.95).addScaledVector(gaze, -0.35).normalize();
    b.part(new THREE.SphereGeometry(0.064, 8, 4, 0, Math.PI * 2, 0, 0.95), bodyPaint, { bone: last, at: ec, dir: lidDir, group: s.name, name: "stalkLid" });
  });

  // ------------------------------------------------------------ fringe tentacles under the orb
  const fringeTips = [0.47, 0.44, 0.5, 0.45, 0.48, 0.43];
  const fringeSpec: { az: number; el: number; tip: THREE.Vector3 }[] = fringeTips.map((y, i) => {
    const az = i * 60 + 20;
    const a = rad(az + 18);
    return { az, el: -62, tip: new THREE.Vector3(Math.sin(a) * 0.32, y, Math.cos(a) * 0.32) };
  });
  fringeSpec.push({ az: 0, el: -88, tip: new THREE.Vector3(0.05, 0.414, 0.06) });
  fringeSpec.forEach((f, i) => {
    const hit = hitAt(f.az, f.el);
    const mid = hit.at.clone().lerp(f.tip, 0.5);
    mid.y += 0.02;
    mid.x += (f.tip.x - hit.at.x) * 0.1;
    mid.z += (f.tip.z - hit.at.z) * 0.1;
    const { chain } = b.sprout(`fringe${i + 1}`, hit, catmull([hit.at, mid, f.tip]), [0.042, 0.011], {
      count: 3,
      role: "tentacle",
      color: bodyPaint,
      sides: 6,
      caps: { start: "flat", end: "flat" },
      group: "fringe",
    });
    const last = chain!.joints[chain!.joints.length - 1];
    glow(
      b.part(new THREE.BoxGeometry(0.028, 0.028, 0.028), "#79f0ff", {
        bone: last,
        at: f.tip,
        rotation: [0, 45, 0],
        group: "fringe",
        name: "lure",
      }),
      1.2,
    );
  });

  // ------------------------------------------------------------ surface detail
  const r = rng(11);
  let wi = 0;
  for (const h of skin.scatter(34, { rng: r, minDist: 0.11, filter: (q) => q.n.z < 0.35 && q.at.y > CY - 0.3 })) {
    b.stick(new THREE.BoxGeometry(0.03, 0.026, 0.03), wi++ % 3 === 0 ? WART_B : WART_A, h, { embed: 0.35, spin: wi * 37, bone: body, name: "nub" });
  }

  // gold cheek rings with a ruby charm
  for (const s of [1, -1]) {
    const h = hitAt(s * 88, -18);
    const c = h.at.clone().addScaledVector(h.n, 0.03).add(new THREE.Vector3(0, -0.035, 0));
    b.part(new THREE.TorusGeometry(0.05, 0.011, 5, 10), GOLD, { at: c, dir: [0, 0, 1], axis: "z", bone: body, name: "cheekRing" });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), RUBY, {
      at: c.clone().add(new THREE.Vector3(s * 0.01, -0.062, 0)),
      rotation: [45, 0, 45],
      bone: body,
      name: "charm",
    });
  }

  // a stitched scar on the left flank and the glowing sigil on the back
  const scarHit = hitAt(70, 35);
  b.decal(orb, SCAR, { at: scarHit.at, dir: scarHit.n, size: [0.08, 0.186], segments: 8, lift: 0.004, roll: -18, name: "scar" });
  const sigilHit = hitAt(180, 6);
  const sigil = b.decal(orb, SIGIL, { at: sigilHit.at, dir: sigilHit.n, size: [0.36, 0.36], segments: 14, lift: 0.004, name: "sigil" });
  glow(sigil, 1.0);

  // drifting motes
  const motes: [number, number, number, string][] = [
    [0.55, 0.62, 0.25, "#79f0ff"],
    [-0.5, 0.58, 0.35, "#ff7ae0"],
    [0.35, 0.5, -0.5, "#ffe36a"],
    [-0.62, 0.78, -0.2, "#79f0ff"],
    [0.7, 0.85, -0.1, "#ff7ae0"],
    [-0.3, 0.52, -0.55, "#ffe36a"],
  ];
  motes.forEach(([x, y, z, col], i) => {
    glow(b.part(new THREE.BoxGeometry(0.035, 0.035, 0.035), col, { at: [x, y, z], rotation: [20 + i * 9, 45 + i * 20, 0], bone: body, name: "mote" }), 1.2);
  });

  return b.root;
}
