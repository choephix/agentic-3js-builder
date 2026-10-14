import * as THREE from "three";
import { createBuilder, rng, catmull, mottle, spots, svg, offset } from "../../../../src/index";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description:
    "A curious coral-and-rust reef octopus with bumpy, pale-mottled skin, golden bar-pupil eyes under grumpy brows, eight curling sucker-lined arms, and one arm proudly holding up an old verdigris-flecked brass key.",
};

const CORAL = "#e2674a";
const RUST = "#a63c25";
const PALE = "#f4b394";
const BELLY = "#f7c9a8";
const CREAM = "#fbecd0";
const EYEBALL = "#f6d27a";
const DARK = "#2a1410";
const BRASS = "#d4a23e";
const BRASS_D = "#8a6420";
const VERD = "#5fa48c";
const WEB = "#b84a33";
const BUMP = "#f6c3a0";
const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "reefOctopus" });

  const coat = spots(mottle(CORAL, RUST, { size: 0.07, seed: 2 }), PALE, { size: 0.035, amount: 0.28, seed: 5 });
  const belly = mottle(BELLY, PALE, { size: 0.05, seed: 9 });
  const webPaint = mottle(WEB, RUST, { size: 0.04, seed: 4 });
  const keyPaint = spots(mottle(BRASS, BRASS_D, { size: 0.02, seed: 12 }), VERD, { size: 0.014, amount: 0.18, seed: 13 });

  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe680"/><stop offset="0.6" stop-color="#f2b52e"/><stop offset="1" stop-color="#b8671a"/>
      </radialGradient></defs>
      <circle cx="32" cy="32" r="29" fill="url(#g)"/>
      <g stroke="#c47a1c" stroke-width="2" opacity="0.85">
        <line x1="32" y1="8" x2="32" y2="20"/><line x1="32" y1="44" x2="32" y2="56"/>
        <line x1="12" y1="18" x2="20" y2="25"/><line x1="52" y1="18" x2="44" y2="25"/>
        <line x1="12" y1="46" x2="20" y2="39"/><line x1="52" y1="46" x2="44" y2="39"/>
      </g>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#5a2a10" stroke-width="3"/>
      <rect x="14" y="27" width="36" height="10" rx="5" fill="#1b0d08"/>
      <circle cx="42" cy="20" r="4.5" fill="#ffffff"/>
      <circle cx="23" cy="43" r="2" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
  const suckTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#ffffff"/>
      <circle cx="32" cy="32" r="23" fill="#e4e4e4"/>
      <circle cx="32" cy="32" r="15" fill="#b4b4b4"/>
      <circle cx="32" cy="32" r="7" fill="#707070"/>
    </svg>`,
    { size: 64 },
  );

  // ---------- skeleton: body, mantle, head ----------
  const CZ = 0.02;
  const body = b.joint("body", { at: [0, 0.06, CZ], dir: [0, 1, 0], role: "spine" });
  const mantlePath = catmull([
    [0, 0.085, 0.03],
    [0, 0.15, 0.01],
    [0, 0.22, -0.04],
    [0, 0.28, -0.1],
    [0, 0.31, -0.14],
  ]);
  const mantle = b.chain("mantle", mantlePath, {
    parent: body,
    count: 3,
    names: ["mantle1", "mantle2", "mantle3"],
    role: "spine",
  });
  const mantleSkin = b.sweep(mantle, [0.07, 0.088, 0.08, 0.098, 0.11, 0.1, 0.07], { color: coat, caps: "round" });

  const head = b.joint("head", { parent: body, at: [0, 0.14, 0.03], dir: [0, 0, 1], role: "head" });

  // beak (upper on head, lower on jaw)
  b.part(new THREE.ConeGeometry(0.012, 0.022, 6), DARK, { bone: head, at: [0, 0.03, 0.045], dir: [0, -1, 0.4] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.026, 0.03], aim: [0, 0.02, 0.06], role: "jaw" });
  b.part(new THREE.ConeGeometry(0.009, 0.016, 6), DARK, { bone: jaw, at: [0, 0.024, 0.048], dir: [0, -0.3, 1] });

  // ---------- eyes with grumpy brows ----------
  const eyeCenters: THREE.Vector3[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (const s of [1, -1]) {
    const ed = new THREE.Vector3(s * 0.75, 0.28, 0.6).normalize();
    const ec = new THREE.Vector3(s * 0.066, 0.158, 0.058);
    eyeCenters.push(ec);

    b.part(new THREE.SphereGeometry(0.033, 10, 8), coat, { bone: head, at: offset(ec, ed, -0.012) });
    const eye = b.part(new THREE.SphereGeometry(0.026, 12, 10), EYEBALL, { bone: head, at: ec, dir: ed });
    b.decal(eye, eyeTex, { at: offset(ec, ed, 0.026), dir: ed, size: [0.042, 0.042], bone: head });

    const u = up.clone().sub(ed.clone().multiplyScalar(ed.y)).normalize();
    const inner = new THREE.Vector3(-s * ed.z, 0, Math.abs(ed.x)).normalize();
    const lidAxis = ed
      .clone()
      .multiplyScalar(-0.375)
      .add(u.clone().multiplyScalar(0.927))
      .add(inner.clone().multiplyScalar(0.4))
      .normalize();
    b.part(new THREE.SphereGeometry(0.0292, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), coat, {
      bone: head,
      at: ec,
      dir: lidAxis,
    });

    // brow ridge along the lid rim, heavier at the inner end
    const a = ed.clone().sub(lidAxis.clone().multiplyScalar(ed.dot(lidAxis))).normalize();
    const bv = new THREE.Vector3().crossVectors(lidAxis, a).normalize();
    const sign = bv.dot(inner) > 0 ? 1 : -1;
    const browPts = [80, 40, 0, -40, -80].map((deg) => {
      const phi = sign * deg * DEG;
      const dir = a
        .clone()
        .multiplyScalar(Math.cos(phi))
        .add(bv.clone().multiplyScalar(Math.sin(phi)))
        .add(lidAxis.clone().multiplyScalar(0.25))
        .normalize();
      return ec.clone().add(dir.multiplyScalar(0.0305));
    });
    b.sweep(catmull(browPts), [0.0085, 0.008, 0.0068, 0.0052, 0.0038], { color: RUST, bone: head, sides: 6 });

    // papillae horns over each eye
    for (const k of [-1, 1]) {
      const dir = lidAxis
        .clone()
        .add(a.clone().multiplyScalar(-0.1))
        .add(bv.clone().multiplyScalar(k * 0.35))
        .normalize();
      const base = ec.clone().add(dir.clone().multiplyScalar(0.027));
      b.spike(base, dir.clone().add(new THREE.Vector3(0, 0.4, 0)).normalize(), k > 0 ? 0.022 : 0.016, 0.005, {
        color: CORAL,
        bone: head,
      });
    }
  }

  // siphon on the right side
  const siphonEnd = new THREE.Vector3(-0.1, 0.088, 0.035);
  const siphonDir = new THREE.Vector3(-0.04, -0.017, 0.035).normalize();
  b.rod([-0.06, 0.105, 0.0], siphonEnd, [0.016, 0.012], { color: coat, bone: mantle.joints[0] });
  b.part(new THREE.TorusGeometry(0.012, 0.0032, 6, 10), RUST, {
    bone: mantle.joints[0],
    at: siphonEnd,
    dir: siphonDir,
    axis: "z",
  });
  b.part(new THREE.CircleGeometry(0.0095, 8), DARK, {
    bone: mantle.joints[0],
    at: offset(siphonEnd, siphonDir, 0.0005),
    dir: siphonDir,
    axis: "z",
  });

  // body bumps
  const bumpHits = b.surface(mantleSkin).scatter(70, {
    rng: rng(7),
    minDist: 0.022,
    filter: (h) => h.at.distanceTo(eyeCenters[0]) > 0.05 && h.at.distanceTo(eyeCenters[1]) > 0.05,
  });
  bumpHits.forEach((h, i) => {
    const r = 0.0035 + 0.003 * (((i * 37) % 10) / 10);
    b.stick(new THREE.SphereGeometry(r, 6, 4), BUMP, h, { embed: 0.5, scale: [1, 0.75, 1] });
  });

  // ---------- arms ----------
  const rArm = (t: number) => 0.031 * Math.pow(1 - t, 1.15) + 0.0045;
  const rKey = (t: number) => 0.03 * (1 - t) + 0.0068;
  const paths: ReturnType<typeof catmull>[] = [];

  const settle = (pts: number[][], fixed: (number | null)[], r: (t: number) => number) => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i - 1][0];
      const dy = pts[i][1] - pts[i - 1][1];
      const dz = pts[i][2] - pts[i - 1][2];
      cum.push(cum[i - 1] + Math.sqrt(dx * dx + dy * dy + dz * dz));
    }
    const total = cum[cum.length - 1];
    pts.forEach((p, i) => {
      const f = fixed[i];
      p[1] = f !== null ? f : r(cum[i] / total) + 0.0015;
    });
  };

  for (let k = 0; k < 8; k++) {
    const ang = (22.5 + 45 * k) * DEG;
    const d = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const pp = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang)); // the arm's left
    const P = (rad: number, side: number, y: number) => [d.x * rad + pp.x * side, y, CZ + d.z * rad + pp.z * side];
    const names = (i: number) => `arm${k + 1}_${i + 1}`;

    if (k === 0) {
      // the proud key-holding arm
      const pts: number[][] = [
        P(0.045, 0, 0.055),
        P(0.12, 0, 0.04),
        P(0.185, 0, 0.07),
        P(0.215, 0, 0.135),
        P(0.218, 0, 0.2),
        P(0.205, 0, 0.25),
      ];
      for (let j = 0; j <= 6; j++) {
        const th = j * (400 / 6) * DEG;
        pts.push(P(0.19 + Math.cos(th) * 0.012, Math.sin(th) * 0.012, 0.262 + j * 0.006));
      }
      const path = catmull(pts);
      paths.push(path);
      const chain = b.chain("arm1", path, { parent: body, count: 7, names, role: "tentacle" });
      const sw = b.sweep(chain, rKey, { color: coat, sectors: [[105, 255, belly]], caps: "round" });
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 10; i++) {
          const t = 0.08 + ((i + (row ? 0.5 : 0)) / 10) * 0.52;
          const sr = rKey(t) * 0.36;
          b.stick(new THREE.CylinderGeometry(sr, sr * 1.2, sr * 0.9, 8), CREAM, sw.at(t, 180 + (row ? 30 : -30)), {
            embed: 0.45,
            texture: suckTex,
          });
        }
      }
      for (const t of [0.12, 0.25, 0.38, 0.5]) {
        const r = rKey(t);
        b.stick(new THREE.SphereGeometry(r * 0.25, 6, 4), BUMP, sw.at(t, t * 300 - 60), { embed: 0.4 });
      }

      // the brass key
      const kj = chain.joints[6];
      const K = new THREE.Vector3(d.x * 0.19, 0, CZ + d.z * 0.19);
      b.rod([K.x, 0.215, K.z], [K.x, 0.352, K.z], 0.005, { color: keyPaint, bone: kj, sides: 8 });
      b.part(new THREE.TorusGeometry(0.02, 0.0055, 6, 14), keyPaint, { bone: kj, at: [K.x, 0.372, K.z] });
      b.part(new THREE.BoxGeometry(0.012, 0.012, 0.004), BRASS_D, {
        bone: kj,
        at: [K.x, 0.372, K.z],
        rotation: [0, 0, 45],
      });
      b.part(new THREE.TorusGeometry(0.0068, 0.0026, 5, 10), BRASS_D, {
        bone: kj,
        at: [K.x, 0.346, K.z],
        rotation: [90, 0, 0],
      });
      b.part(new THREE.SphereGeometry(0.0065, 8, 6), keyPaint, { bone: kj, at: [K.x, 0.216, K.z] });
      b.part(new THREE.BoxGeometry(0.016, 0.008, 0.004), keyPaint, { bone: kj, at: [K.x - 0.009, 0.224, K.z] });
      b.part(new THREE.BoxGeometry(0.011, 0.006, 0.004), keyPaint, { bone: kj, at: [K.x - 0.007, 0.24, K.z] });
      continue;
    }

    const L = 0.4 * (0.92 + 0.12 * Math.abs(Math.sin(k * 3.7)));
    const sc = L / 0.4;
    const w1 = 0.015 * Math.sin(k * 2.1 + 1);
    const w2 = 0.02 * Math.sin(k * 1.3 + 2);
    const w3 = 0.015 * Math.sin(k * 2.7);
    const upCurl = k === 2 || k === 5 || k === 7;
    const c = k % 2 === 0 ? 1 : -1;

    let spec: [number, number, number | null][];
    if (upCurl) {
      spec = [
        [0.045, 0, 0.055],
        [0.12, w1, null],
        [0.2, w2, null],
        [0.27, w3, null],
        [0.33, 0, null],
        [0.37, 0, 0.035],
        [0.39, 0, 0.075],
        [0.375, 0, 0.108],
        [0.345, 0, 0.112],
        [0.33, 0, 0.09],
      ];
    } else {
      spec = [
        [0.045, 0, 0.055],
        [0.12, w1, null],
        [0.2, w2, null],
        [0.28, w3, null],
        [0.335, c * 0.012, null],
        [0.37, c * 0.04, null],
        [0.378, c * 0.075, null],
        [0.358, c * 0.098, null],
        [0.33, c * 0.092, null],
      ];
    }
    const pts = spec.map(([rad, side], i) => (i === 0 ? P(rad, side, 0.05) : P(rad * sc, side * sc, 0.02)));
    settle(
      pts,
      spec.map((s) => s[2]),
      rArm,
    );
    const path = catmull(pts);
    paths.push(path);
    const chain = b.chain(`arm${k + 1}`, path, { parent: body, count: 6, names, role: "tentacle" });
    const sw = b.sweep(chain, rArm, { color: coat, sectors: [[105, 255, belly]], caps: "round" });

    const suckAng = upCurl ? 180 : -c * 125;
    for (let row = 0; row < 2; row++) {
      const n = 15;
      for (let i = 0; i < n; i++) {
        const t = 0.1 + ((i + (row ? 0.5 : 0)) / n) * 0.86;
        const sr = rArm(t) * 0.36;
        b.stick(new THREE.CylinderGeometry(sr, sr * 1.2, sr * 0.9, 8), CREAM, sw.at(t, suckAng + (row ? 28 : -28)), {
          embed: 0.45,
          texture: suckTex,
        });
      }
    }
    for (const t of [0.08, 0.2, 0.32, 0.44, 0.56]) {
      const r = rArm(t);
      b.stick(new THREE.SphereGeometry(r * 0.25, 6, 4), BUMP, sw.at(t, ((t * 1000) % 2 > 1 ? 35 : -35)), {
        embed: 0.4,
      });
    }
  }

  // ---------- webbing between neighbouring arms ----------
  const webTs = [0.02, 0.07, 0.12, 0.17, 0.22];
  for (let k = 0; k < 8; k++) {
    const A = webTs.map((t) => paths[k].at(t));
    const B = webTs.map((t) => paths[(k + 1) % 8].at(t));
    b.membrane(A, B, { color: webPaint, thickness: 0.006, scallop: 0.35, bone: body });
  }

  return b.root;
}
