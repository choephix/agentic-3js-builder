import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";

export const meta = {
  name: "Reef octopus",
  description:
    "A curious reef octopus in coral and rust: a bumpy, bulbous mantle with pale mottling, golden bar-pupiled eyes under a grumpy brow, eight cream-suckered arms curling out, and one arm raised high to hold a brass key from a shipwreck.",
};

const DEG = Math.PI / 180;
const GOLDEN = 2.399963;
const Y_AXIS = [0, 1, 0];
const Z_AXIS = [0, 0, 1];

// Palette: flat colours
const RUST = "#b4482b";
const CORAL = "#d8653c";
const DEEP = "#7b2c1a";
const BUMP_A = "#8c3220";
const BUMP_B = "#e0683d";
const BUMP_C = "#f09560";
const CREAM = "#f7e8c9";
const MOTTLE = "#f1d0a2";
const GOLD = "#f2b53a";
const INK = "#1c100b";
const BRASS = "#cc9a36";
const PATINA = "#6f9272";
const BEAK = "#2b1810";
const BEAK_LOW = "#4d2d1e";

// Mantle: a turned sac, bulging just above the middle
const HEAD = new THREE.Vector3(0, 0.265, 0);
const MANTLE_BASE = 0.12;
const MANTLE: number[][] = [
  [0.0, 0.0],
  [0.036, 0.0],
  [0.05, 0.018],
  [0.072, 0.05],
  [0.092, 0.095],
  [0.102, 0.14],
  [0.104, 0.17],
  [0.1, 0.205],
  [0.088, 0.238],
  [0.066, 0.262],
  [0.036, 0.276],
  [0.0, 0.282],
];

interface ArmSpec {
  name: string;
  az: number; // degrees round the body (0 = front, +X = the octopus's left)
  reach: number; // radial run before the curl
  sway: number; // sideways bow of the run
  curl: number; // +1 / -1: which way the tip coils
  turns: number; // coil turns at the tip
  pitch: number; // rise per coil turn
  r0: number; // coil radius where it leaves the run
  r1: number; // coil radius at the tip
}

const ARMS: ArmSpec[] = [
  { name: "armA", az: -12, reach: 0.25, sway: 0.02, curl: 1, turns: 1.2, pitch: 0.03, r0: 0.036, r1: 0.014 },
  { name: "armC", az: 80, reach: 0.27, sway: -0.03, curl: -1, turns: 1.4, pitch: 0.035, r0: 0.04, r1: 0.014 },
  { name: "armD", az: 128, reach: 0.22, sway: 0.02, curl: 1, turns: 1.0, pitch: 0.06, r0: 0.034, r1: 0.013 },
  { name: "armE", az: 172, reach: 0.27, sway: 0.0, curl: -1, turns: 1.3, pitch: 0.03, r0: 0.038, r1: 0.014 },
  { name: "armF", az: 218, reach: 0.24, sway: -0.02, curl: 1, turns: 1.2, pitch: 0.045, r0: 0.036, r1: 0.013 },
  { name: "armG", az: 268, reach: 0.28, sway: 0.03, curl: -1, turns: 0.95, pitch: 0.065, r0: 0.036, r1: 0.013 },
  { name: "armH", az: 318, reach: 0.25, sway: -0.02, curl: 1, turns: 1.3, pitch: 0.035, r0: 0.038, r1: 0.014 },
];

// The raised arm that holds the key
const KEY_AZ = 50;
const KEY_R = 0.2;

const armRadius = (t: number) => 0.022 - 0.0155 * Math.pow(t, 0.85);
const keyArmRadius = (t: number) => 0.018 - 0.0095 * Math.pow(t, 0.8);

// Direction from the head centre: azimuth round Y (0 = +Z), elevation up from horizontal
const dirAt = (azDeg: number, elDeg: number) => {
  const a = azDeg * DEG;
  const e = elDeg * DEG;
  return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e));
};

// Keeps the golden-angle bumps and mottling off the eyes and brow
const inEyeZone = (d: THREE.Vector3) => {
  const az = Math.atan2(d.x, d.z) / DEG;
  const el = Math.asin(Math.max(-1, Math.min(1, d.y))) / DEG;
  return Math.abs(az) > 8 && Math.abs(az) < 56 && el > -10 && el < 32;
};

// Rotate v (perpendicular to k) about k by ang
const rotateAbout = (v: THREE.Vector3, k: THREE.Vector3, ang: number) =>
  v
    .clone()
    .multiplyScalar(Math.cos(ang))
    .addScaledVector(new THREE.Vector3().crossVectors(k, v), Math.sin(ang));

// The underside of a tube, perpendicular to its tangent T
const sideOf = (T: THREE.Vector3) => {
  const hint = Math.abs(T.y) > 0.8 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, -1, 0);
  const d = hint.dot(T);
  return hint.addScaledVector(T, -d).normalize();
};

const suckerGeo = (rs: number) =>
  new THREE.CylinderGeometry(rs, rs * 0.8, 0.0042, 8).translate(0, 0.0021, 0);

const discGeo = (r: number) =>
  new THREE.CylinderGeometry(r, r * 1.08, 0.0035, 9).translate(0, 0.0018, 0);

// A resting arm: a run out from the mantle that drops to the reef, then coils at the tip
function armPath(a: ArmSpec): THREE.Vector3[] {
  const ang = a.az * DEG;
  const rh = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
  const th = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang));
  const n = th.clone().multiplyScalar(a.curl);
  const YEND = 0.018;
  const YROOT = 0.14;
  const R_ROOT = 0.035;

  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 3; k++) {
    const u = k / 3;
    const rho = R_ROOT + (a.reach - R_ROOT) * u;
    const y = YEND + (YROOT - YEND) * (1 - u) * (1 - u);
    const lat = a.sway * Math.sin(Math.PI * u);
    const p = rh.clone().multiplyScalar(rho).addScaledVector(th, lat);
    p.y = y;
    pts.push(p);
  }

  // Coil: a helix that leaves the run tangentially and tightens as it rises
  const end = pts[pts.length - 1];
  const cc = end.clone().addScaledVector(n, a.r0);
  const phiMax = 2 * Math.PI * a.turns;
  for (let j = 1; j <= 11; j++) {
    const f = j / 11;
    const phi = phiMax * f;
    const R = a.r0 + (a.r1 - a.r0) * f;
    const p = cc
      .clone()
      .addScaledVector(rh, R * Math.sin(phi))
      .addScaledVector(n, -R * Math.cos(phi));
    p.y = YEND + a.pitch * (phi / (2 * Math.PI));
    pts.push(p);
  }
  return pts;
}

// The raised arm: climbs up beside the head and wraps its tip round the key's shank
function keyArmPath(): THREE.Vector3[] {
  const ang = KEY_AZ * DEG;
  const rh = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
  const th = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang));
  const pts: THREE.Vector3[] = [
    rh.clone().multiplyScalar(0.035).setY(0.14),
    rh.clone().multiplyScalar(0.095).setY(0.2),
    rh.clone().multiplyScalar(0.15).setY(0.29),
  ];

  const axis = rh.clone().multiplyScalar(KEY_R);
  const rc = 0.0175;
  const TURNS = 1.2;
  for (let j = 0; j <= 8; j++) {
    const f = j / 8;
    const psi = 2 * Math.PI * TURNS * f;
    const p = axis
      .clone()
      .addScaledVector(rh, -rc * Math.cos(psi))
      .addScaledVector(th, rc * Math.sin(psi));
    p.y = 0.342 + 0.075 * f;
    pts.push(p);
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "reef-octopus" });
  type Surf = ReturnType<typeof b.surface>;

  // ---- skeleton: the mantle is the head, the arms hang from it -----------
  const head = b.joint("head", { at: HEAD.toArray() });
  const jaw = b.joint("jaw", {
    at: [0, 0.122, 0.005],
    dir: [0, -1, 0],
    up: Z_AXIS,
    parent: head,
  });

  // ---- mantle: a turned, bulbous sac ------------------------------------
  const mantle = b.lathe(MANTLE, { at: [0, MANTLE_BASE, 0], axis: Y_AXIS, color: RUST });
  const skin: Surf = b.surface(mantle);

  // ---- suckers and small bumps along an arm -------------------------------
  const addArmDetail = (surf: Surf, pts: THREE.Vector3[], radiusAt: (t: number) => number) => {
    const n = pts.length;
    const at = (i: number) => pts[Math.min(n - 1, Math.max(0, i))];
    const stations: { p: THREE.Vector3; T: THREE.Vector3; t: number }[] = [];
    for (let k = 0; k < n; k++) {
      stations.push({
        p: pts[k],
        T: at(k + 1).clone().sub(at(k - 1)).normalize(),
        t: k / (n - 1),
      });
      if (k < n - 1) {
        stations.push({
          p: pts[k].clone().lerp(pts[k + 1], 0.5),
          T: pts[k + 1].clone().sub(pts[k]).normalize(),
          t: (k + 0.5) / (n - 1),
        });
      }
    }

    stations.forEach((st, i) => {
      const s0 = sideOf(st.T);
      const rs = Math.max(0.0042, radiusAt(st.t) * 0.34);
      // two rows of suckers on the underside, either side of the midline
      for (const deg of [55, -55]) {
        const hit = surf.ray(st.p.clone(), rotateAbout(s0, st.T, deg * DEG));
        if (hit) b.stick(suckerGeo(rs), CREAM, hit);
      }
      // a sparse dorsal row of small dark bumps
      if (i % 3 === 1) {
        const hit = surf.ray(st.p.clone(), s0.clone().negate());
        if (hit) b.stick(new THREE.SphereGeometry(0.0042, 6, 4), DEEP, hit);
      }
    });
  };

  // ---- arms ----------------------------------------------------------------
  for (const a of ARMS) {
    const pts = armPath(a);
    const chain = b.chain(a.name, pts, { role: "tentacle", parent: head });
    const armBody = b.sweep(chain, { radius: armRadius, color: CORAL });
    addArmDetail(b.surface(armBody), pts, armRadius);
  }

  const keyPts = keyArmPath();
  const keyChain = b.chain("armKey", keyPts, { role: "tentacle", parent: head });
  const keyBody = b.sweep(keyChain, { radius: keyArmRadius, color: CORAL });
  addArmDetail(b.surface(keyBody), keyPts, keyArmRadius);

  // ---- bumps over the bulb: golden-angle spread, eyes and brow kept clear ---
  const BUMPS = 260;
  for (let i = 0; i < BUMPS; i++) {
    const y = 1 - (2 * (i + 0.5)) / BUMPS;
    if (y < -0.4) continue;
    const rr = Math.sqrt(1 - y * y);
    const phi = i * GOLDEN;
    const d = new THREE.Vector3(Math.cos(phi) * rr, y, Math.sin(phi) * rr);
    if (inEyeZone(d)) continue;
    const hit = skin.ray(HEAD.clone(), d);
    if (!hit) continue;
    const color = [BUMP_A, BUMP_B, BUMP_C][i % 3];
    const r = 0.0064 + 0.0036 * ((i * 0.618034) % 1);
    b.stick(new THREE.SphereGeometry(r, 7, 5), color, hit);
  }

  // ---- paler mottling: little cream patches of three discs --------------------
  const PATCHES = 13;
  const OFFS = [
    [0.08, 0.02, 0.03],
    [-0.06, -0.03, 0.05],
    [0.01, 0.05, -0.07],
  ];
  for (let i = 0; i < PATCHES; i++) {
    const y = 0.78 - ((i + 0.5) / PATCHES) * 1.0;
    const rr = Math.sqrt(1 - y * y);
    const phi = i * GOLDEN + 0.7;
    const c = new THREE.Vector3(Math.cos(phi) * rr, y, Math.sin(phi) * rr);
    if (inEyeZone(c)) continue;
    OFFS.forEach((o, k) => {
      const d = c.clone().add(new THREE.Vector3(o[0], o[1], o[2])).normalize();
      const hit = skin.ray(HEAD.clone(), d);
      if (!hit) return;
      const r = 0.0105 + 0.0055 * ((i * 0.37 + k * 0.23) % 1);
      b.stick(discGeo(r), MOTTLE, hit);
    });
  }

  // ---- eyes, grumpy brow ----------------------------------------------------
  for (const side of [1, -1]) {
    const eye = skin.ray(HEAD.clone(), dirAt(side * 31, 1));
    if (eye) {
      // golden eyeball, a rust lid rim, and a horizontal bar pupil
      b.stick(new THREE.SphereGeometry(0.03, 14, 10), GOLD, eye);
      b.stick(new THREE.TorusGeometry(0.0315, 0.0055, 6, 16).rotateX(Math.PI / 2), DEEP, eye);
      b.stick(new THREE.BoxGeometry(0.036, 0.0065, 0.0085).translate(0, 0.027, 0), INK, eye);
    }

    // brow: a row of blobs, lower and heavier at the inner end
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      const hit = skin.ray(HEAD.clone(), dirAt(side * (16 + 28 * t), 14 + 10 * t));
      if (hit) b.stick(new THREE.SphereGeometry(0.0145 - 0.0035 * t, 8, 6), DEEP, hit);
    }
  }

  // ---- beak under the arms, on its own jaw joint ---------------------------------
  b.stick(new THREE.ConeGeometry(0.0115, 0.04, 7), BEAK, jaw);
  b.stick(new THREE.ConeGeometry(0.0085, 0.03, 7).translate(0, 0, 0.0045), BEAK_LOW, jaw);

  // ---- the brass key, held up by the raised arm ---------------------------------
  const kx = Math.sin(KEY_AZ * DEG) * KEY_R;
  const kz = Math.cos(KEY_AZ * DEG) * KEY_R;
  const keyAt = (y: number) => frame([kx, y, kz], Y_AXIS, Z_AXIS);

  b.stick(new THREE.CylinderGeometry(0.0046, 0.0046, 0.067, 8), BRASS, keyAt(0.3785)); // shank
  b.stick(new THREE.TorusGeometry(0.0165, 0.0046, 6, 14), BRASS, keyAt(0.428)); // bow
  b.stick(new THREE.CylinderGeometry(0.0076, 0.0076, 0.0056, 8), BRASS, keyAt(0.3478)); // collar
  b.stick(
    new THREE.BoxGeometry(0.0066, 0.026, 0.0034),
    PATINA,
    frame([kx + 0.0045, 0.3335, kz], Y_AXIS, Z_AXIS),
  ); // bit, green with age
  for (const ty of [0.3252, 0.3318]) {
    b.stick(
      new THREE.BoxGeometry(0.0044, 0.0044, 0.0034),
      PATINA,
      frame([kx + 0.0098, ty, kz], Y_AXIS, Z_AXIS),
    ); // teeth
  }

  return b.root;
}
