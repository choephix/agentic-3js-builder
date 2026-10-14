import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  spots,
  countershade,
  svg,
  bezier,
  catmull,
  polyline,
} from "../../../../src/index";

export const meta = {
  name: "Pufferfish",
  description:
    "A stylized, half-inflated pufferfish resting on the sea floor: a faceted slate-teal ball with cream spots and a pale belly, bristling with dark-tipped spines. It has big golden-green eyes under heavy lids, a puckered orange beak mouth with a hinged lower jaw, rayed orange fan fins and false-eye flank spots. Rigged with a body, head, jaw, tail chain, eyes and fin joints.",
};

const BACK = "#4c7a86";
const SPOT = "#f1e3b0";
const BELLY = "#f8f2e2";
const FIN = "#f3a93b";
const FIN_ROOT = "#f8c766";
const FIN_RAY = "#d9741f";
const FIN_EDGE = "#b8501c";
const LIP = "#f0a23a";
const TOOTH = "#fbf8ee";
const MOUTH = "#3a1418";
const DARK = "#1d2a30";
const SPINE = "#e9e1c2";
const SPINE_TIP = "#24343c";
const EYE = "#ece6cf";
const RIM = "#e8952f";
const NOSE = "#2f5560";

const IRIS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#e4ff7a"/><stop offset="0.55" stop-color="#4fb46a"/><stop offset="1" stop-color="#12402c"/>
    </radialGradient></defs>
    <circle cx="32" cy="32" r="31" fill="url(#g)"/>
    <circle cx="32" cy="32" r="29" fill="none" stroke="#0f2a22" stroke-width="3"/>
    <ellipse cx="32" cy="33" rx="12" ry="13" fill="#0a0b12"/>
    <circle cx="24" cy="23" r="6" fill="#ffffff"/>
    <circle cx="40" cy="42" r="2.6" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const OCELLUS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="31" fill="#f6d36a"/>
    <circle cx="32" cy="32" r="25" fill="#16222a"/>
    <circle cx="32" cy="32" r="12" fill="#22343e"/>
  </svg>`,
  { size: 128 },
);

const finPaint = (edge: number) =>
  paint((_p, _n, s) => {
    const r = Math.hypot(s[0], s[1]);
    if (r > edge) return FIN_EDGE;
    if (r < 0.012) return FIN_ROOT;
    const a = (Math.atan2(s[1], s[0]) * 180) / Math.PI;
    const k = ((a % 10) + 10) % 10;
    return Math.abs(k - 5) < 1.3 ? FIN_RAY : FIN;
  });

export default function build() {
  const b = createBuilder({ name: "pufferfish" });
  const Y = 0.14;

  // ---------- skeleton ----------
  const body = b.joint("body", { at: [0, Y, 0], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, Y - 0.004, 0.07], dir: [0, 0, 1], role: "head" });
  const tail = b.chain(
    "tail",
    polyline([
      [0, Y, -0.05],
      [0, Y + 0.006, -0.11],
      [0, Y + 0.01, -0.165],
      [0, Y + 0.01, -0.205],
    ]),
    { parent: body, names: ["tail1", "tail2", "tail3", "tailFin"], role: "tail" },
  );
  const tailTip = tail.joints[tail.joints.length - 1];

  // ---------- body ----------
  const coat = countershade(spots(BACK, SPOT, { size: 0.03, amount: 0.32, seed: 5 }), BELLY, { level: -0.2 });
  const stations = [
    { at: [0, Y + 0.01, -0.2], w: 0.036, h: 0.05 },
    { at: [0, Y + 0.01, -0.16], w: 0.06, h: 0.085 },
    { at: [0, Y + 0.006, -0.1], w: 0.17, h: 0.19 },
    { at: [0, Y, -0.02], w: 0.27, h: 0.28 },
    { at: [0, Y, 0.05], w: 0.255, h: 0.265 },
    { at: [0, Y - 0.008, 0.12], w: 0.17, h: 0.17 },
    { at: [0, Y - 0.014, 0.16], w: 0.08, h: 0.075 },
  ];
  const hull = b.loft(stations, { bone: [tail, body, head], color: coat, detail: 1.5, name: "hull" });
  const skin = b.surface(hull);

  // ---------- eyes ----------
  const eyeR = 0.032;
  const eyeCs: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = skin.around([0, Y, 0.05]).at(s * 52, 26)!;
    const n = new THREE.Vector3().copy(hit.n);
    const eyeDir = n.clone().add(new THREE.Vector3(0, 0, 0.25)).normalize();
    const c = new THREE.Vector3().copy(hit.at).addScaledVector(n, 0.01);
    eyeCs.push(c);
    const eyeJ = b.joint(`eye${side}`, { parent: head, at: c, dir: eyeDir });
    const ball = b.part(new THREE.SphereGeometry(eyeR, 12, 8), EYE, { at: c, bone: eyeJ, name: `eyeball${side}` });
    b.decal(ball, IRIS, {
      at: c.clone().addScaledVector(eyeDir, eyeR),
      dir: eyeDir,
      size: [0.044, 0.044],
      bone: eyeJ,
      mirror: s > 0,
      name: `iris${side}`,
    });
    b.part(new THREE.TorusGeometry(eyeR * 0.98, 0.0075, 6, 16), RIM, {
      at: c.clone().addScaledVector(eyeDir, 0.006),
      dir: eyeDir,
      axis: "z",
      bone: head,
      flat: true,
      name: `eyeRim${side}`,
    });
    const lidDir = eyeDir.clone().multiplyScalar(0.55).add(new THREE.Vector3(0, 1, 0)).normalize();
    b.part(new THREE.SphereGeometry(eyeR * 1.12, 12, 5, 0, Math.PI * 2, 0, Math.PI * 0.3), coat, {
      at: c,
      dir: lidDir,
      bone: head,
      name: `lid${side}`,
    });
  }

  // ---------- mouth ----------
  const snout = skin.ray([0, Y - 0.016, 0.5], [0, 0, -1]) ?? skin.nearest([0, Y - 0.016, 0.4]);
  const M = new THREE.Vector3().copy(snout.at);
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, M.y - 0.012, M.z - 0.04],
    aim: [0, M.y - 0.018, M.z + 0.02],
    role: "jaw",
  });
  const lip = (y: number, r: number, bone: typeof jaw, name: string) =>
    b.sweep(
      bezier([0.026, y - 0.004, M.z - 0.012], [0, y + 0.002, M.z + 0.028], [-0.026, y - 0.004, M.z - 0.012]),
      (t: number) => r * (0.6 + 0.4 * Math.sin(Math.PI * t)),
      { bone, color: LIP, sides: 8, name },
    );
  lip(M.y + 0.012, 0.0105, head, "upperLip");
  lip(M.y - 0.018, 0.0095, jaw, "lowerLip");
  b.part(new THREE.SphereGeometry(0.016, 8, 6), MOUTH, { at: [0, M.y - 0.003, M.z - 0.004], bone: head, name: "mouthInside" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.015, 0.007, 0.008), TOOTH, {
      at: [s * 0.0085, M.y - 0.001, M.z + 0.006],
      bone: head,
      flat: true,
      name: `upperBeak${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.BoxGeometry(0.015, 0.007, 0.008), TOOTH, {
      at: [s * 0.0085, M.y - 0.008, M.z + 0.006],
      bone: jaw,
      flat: true,
      name: `lowerBeak${s > 0 ? "L" : "R"}`,
    });
    const nh = skin.nearest([s * 0.032, M.y + 0.045, M.z - 0.03]);
    b.stick(new THREE.CylinderGeometry(0.0035, 0.005, 0.009, 6), NOSE, nh, { bone: head, name: `nostril${s > 0 ? "L" : "R"}` });
  }

  // ---------- pectoral fins, gills, false eyes ----------
  const PECT: [number, number][] = [
    [-0.01, -0.02],
    [0.03, -0.035],
    [0.06, -0.026],
    [0.07, 0],
    [0.06, 0.028],
    [0.03, 0.038],
    [-0.01, 0.022],
  ];
  const finSpots: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ph = skin.around([0, Y, 0.02]).at(s * 90, -6)!;
    const P = new THREE.Vector3().copy(ph.at);
    finSpots.push(P);
    const fdir: [number, number, number] = [s * 0.75, 0, -0.66];
    const pj = b.joint(`pectoral${side}`, { parent: body, at: P, dir: fdir, role: "fan" });
    b.extrude(PECT, {
      at: pj,
      x: fdir,
      y: [0, 1, 0],
      thickness: 0.005,
      bevel: 0.0015,
      smoothing: 1,
      color: finPaint(0.054),
      bone: pj,
      name: `pectoralFin${side}`,
    });
    const gill = skin.drape(
      catmull([
        [P.x, P.y + 0.022, P.z + 0.014],
        [P.x, P.y, P.z + 0.021],
        [P.x, P.y - 0.022, P.z + 0.014],
      ]),
      { lift: 0.0015 },
    );
    b.sweep(gill, 0.0028, { color: DARK, bone: body, sides: 5, name: `gill${side}` });
    const oh = skin.around([0, Y, 0]).at(s * 122, 4)!;
    b.decal(hull, OCELLUS, { at: oh, size: [0.06, 0.06], mirror: s > 0, name: `ocellus${side}` });
  }

  // ---------- dorsal, anal and tail fins ----------
  const SMALL: [number, number][] = [
    [-0.02, -0.012],
    [0.035, -0.03],
    [0.052, 0.018],
    [0.036, 0.05],
    [0.0, 0.036],
  ];
  const dh = skin.ray([0, 0.5, -0.12], [0, -1, 0]) ?? skin.nearest([0, 0.4, -0.12]);
  const ah = skin.ray([0, -0.3, -0.12], [0, 1, 0]) ?? skin.nearest([0, -0.1, -0.12]);
  const D = new THREE.Vector3().copy(dh.at);
  const A = new THREE.Vector3().copy(ah.at);
  const dj = b.joint("dorsalFin", { parent: tail.joints[1], at: D, dir: [0, 1, -0.7], role: "fan" });
  b.extrude(SMALL, {
    at: dj,
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.005,
    bevel: 0.0015,
    smoothing: 1,
    color: finPaint(0.044),
    bone: dj,
    name: "dorsalFin",
  });
  const aj = b.joint("analFin", { parent: tail.joints[1], at: A, dir: [0, -1, -0.7], role: "fan" });
  b.extrude(SMALL, {
    at: aj,
    x: [0, 0, -1],
    y: [0, -1, 0],
    thickness: 0.005,
    bevel: 0.0015,
    smoothing: 1,
    color: finPaint(0.044),
    bone: aj,
    name: "analFin",
  });
  const CAUDAL: [number, number][] = [
    [-0.015, 0.022],
    [0.04, 0.047],
    [0.085, 0.062],
    [0.106, 0.036],
    [0.1, 0],
    [0.106, -0.036],
    [0.085, -0.062],
    [0.04, -0.047],
    [-0.015, -0.022],
  ];
  b.extrude(CAUDAL, {
    at: tailTip,
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.006,
    bevel: 0.002,
    smoothing: 1,
    color: finPaint(0.084),
    bone: tailTip,
    name: "caudalFin",
  });

  // ---------- spines ----------
  const keepAway: [THREE.Vector3, number][] = [
    ...eyeCs.map((c): [THREE.Vector3, number] => [c, 0.056]),
    ...finSpots.map((c): [THREE.Vector3, number] => [c, 0.034]),
    [M, 0.05],
    [D, 0.032],
    [A, 0.032],
  ];
  const hits = skin.scatter(200, {
    rng: rng(11),
    minDist: 0.026,
    filter: (h) => {
      const p = new THREE.Vector3().copy(h.at);
      if (p.z < -0.15 || p.z > M.z - 0.02) return false;
      for (const [c, r] of keepAway) if (p.distanceTo(c) < r) return false;
      return true;
    },
  });
  for (const h of hits) {
    const n = new THREE.Vector3().copy(h.n);
    const p = new THREE.Vector3().copy(h.at);
    const dir = n.clone().add(new THREE.Vector3(0, 0.05, -0.55)).normalize();
    const len = 0.02 + 0.015 * (0.5 + 0.5 * Math.sin(p.x * 91.3 + p.y * 47.1 + p.z * 63.7));
    if (p.y - 0.003 * n.y + len * dir.y < 0.003) continue;
    const belly = n.y < -0.25;
    b.spike(h.moved([0, -0.003, 0]), dir, len, 0.005, {
      color: (t: number) => (t < 0.55 ? (belly ? BELLY : SPINE) : SPINE_TIP),
      sides: 5,
      name: "spine",
    });
  }

  // ---------- rest pose: beak slightly parted ----------
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  return b.root;
}
