```ts
import * as THREE from "three";

export const meta = {
  name: "Startled Pufferfish",
  description:
    "A fully puffed-up pufferfish ball: creamy yellow skin with brown leopard spots fading to a white belly, brown-tipped spikes, a pouting lip-ringed mouth, big worried eyes with tiny startled pupils, pleated fluttering fins, a stubby fan tail and a trail of bubbles.",
};

// ---------------------------------------------------------------- helpers
const RX = 0.21,
  RY = 0.215,
  RZ = 0.225; // body ellipsoid radii (metres)
const UP = new THREE.Vector3(0, 1, 0);
const FWD = new THREE.Vector3(0, 0, 1);
const RIGHT = new THREE.Vector3(1, 0, 0);

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function bodyNormal(d: THREE.Vector3) {
  return new THREE.Vector3(d.x / RX, d.y / RY, d.z / RZ).normalize();
}
function surf(d: THREE.Vector3, inset = 0) {
  return new THREE.Vector3(d.x * RX, d.y * RY, d.z * RZ).addScaledVector(bodyNormal(d), -inset);
}
function quatFromBasis(x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) {
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}
function frameQuat(zIn: THREE.Vector3) {
  const z = zIn.clone().normalize();
  let y = UP.clone().addScaledVector(z, -UP.dot(z));
  if (y.lengthSq() < 1e-6) y = FWD.clone().addScaledVector(z, -FWD.dot(z));
  y.normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  return quatFromBasis(x, y, z);
}

// ---------------------------------------------------------------- skin texture
const SKIN_STOPS: [number, string][] = [
  [1, "#edc25a"],
  [0.6, "#f3d57d"],
  [0.2, "#f7e2a2"],
  [-0.15, "#fbeec6"],
  [-0.45, "#fff7e4"],
  [-1, "#fffcf2"],
];
function hexRGB(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function skinRGB(yIn: number): [number, number, number] {
  const y = clamp(yIn, -1, 1);
  for (let i = 0; i < SKIN_STOPS.length - 1; i++) {
    const [y0, c0] = SKIN_STOPS[i];
    const [y1, c1] = SKIN_STOPS[i + 1];
    if (y <= y0 && y >= y1) {
      const t = (y0 - y) / (y0 - y1);
      const a = hexRGB(c0),
        b = hexRGB(c1);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
  }
  return hexRGB(SKIN_STOPS[SKIN_STOPS.length - 1][1]);
}

function makeSkinTexture(rand: () => number): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const W = 2048,
    H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  if (!g) return null;

  // The sphere's poles sit on the flanks (±X) where the fins hide them,
  // so texture-space "y" is -x of the body. Paint the skin gradient per pixel.
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const c = skinRGB((i / 255) * 2 - 1);
    lut[i * 3] = c[0];
    lut[i * 3 + 1] = c[1];
    lut[i * 3 + 2] = c[2];
  }
  const cosArr = new Float32Array(W);
  for (let px = 0; px < W; px++) cosArr[px] = Math.cos(((px + 0.5) / W) * Math.PI * 2);
  const img = g.createImageData(W, H);
  const data = img.data;
  for (let py = 0; py < H; py++) {
    const sinT = Math.sin(((py + 0.5) / H) * Math.PI);
    for (let px = 0; px < W; px++) {
      const ay = -cosArr[px] * sinT; // body-space y of this texel
      const li = Math.round((ay * 0.5 + 0.5) * 255) * 3;
      const o = (py * W + px) * 4;
      data[o] = lut[li];
      data[o + 1] = lut[li + 1];
      data[o + 2] = lut[li + 2];
      data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);

  const PXM = H / (Math.PI * 0.22); // pixels per metre on the surface
  const randDir = () => {
    const y = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
  };
  // body dir -> texture position
  const toTex = (d: THREE.Vector3) => {
    const tx = d.y,
      ty = -d.x,
      tz = d.z;
    const lon = Math.atan2(tz, -tx);
    const u = (lon / (Math.PI * 2) + 1) % 1;
    const v = Math.acos(clamp(ty, -1, 1)) / Math.PI;
    const stretch = Math.min(4.5, 1 / Math.max(0.05, Math.sqrt(1 - d.x * d.x)));
    return { cx: u * W, cy: v * H, sx: stretch };
  };

  const blob = (cx: number, cy: number, rx: number, ry: number, color: string, pts: number[]) => {
    const n = pts.length;
    for (const off of [-W, 0, W]) {
      if (cx + off + rx * 1.4 < 0 || cx + off - rx * 1.4 > W) continue;
      const P = pts.map((m, i) => {
        const a = (i / n) * Math.PI * 2;
        return [cx + off + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m];
      });
      const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      g.beginPath();
      const m0 = mid(P[n - 1], P[0]);
      g.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) {
        const p = P[i],
          q = P[(i + 1) % n];
        const m = mid(p, q);
        g.quadraticCurveTo(p[0], p[1], m[0], m[1]);
      }
      g.closePath();
      g.fillStyle = color;
      g.fill();
    }
  };

  // pick well-spaced spot centres, sparser and smaller toward the belly
  const spots: { d: THREE.Vector3; r: number }[] = [];
  for (let tries = 0; tries < 9000 && spots.length < 220; tries++) {
    const d = randDir();
    if (Math.abs(d.x) > 0.975) continue;
    const f = smoothstep(-0.45, 0.35, d.y);
    if (rand() > f) continue;
    const r = (0.011 + rand() * 0.011) * (0.55 + 0.45 * f);
    let ok = true;
    for (const s of spots) {
      const ang = Math.acos(clamp(d.dot(s.d), -1, 1)) * 0.22;
      if (ang < (r + s.r) * 1.25 + 0.006) {
        ok = false;
        break;
      }
    }
    if (ok) spots.push({ d, r });
  }

  for (const sp of spots) {
    const { cx, cy, sx } = toTex(sp.d);
    const rpx = sp.r * PXM;
    const f = smoothstep(-0.45, 0.35, sp.d.y);
    g.globalAlpha = 0.3 + 0.7 * f;
    const n = 9;
    const outer: number[] = [];
    for (let i = 0; i < n; i++) outer.push(0.78 + rand() * 0.42);
    blob(cx, cy, rpx * sx, rpx, "#7a4521", outer);
    if (rand() < 0.42) {
      // rosette: hole showing the skin colour
      const c = skinRGB(sp.d.y);
      const inner = outer.map((m) => m * (0.8 + rand() * 0.2));
      blob(
        cx + (rand() - 0.5) * rpx * 0.2 * sx,
        cy + (rand() - 0.5) * rpx * 0.2,
        rpx * 0.5 * sx,
        rpx * 0.5,
        `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`,
        inner
      );
    } else {
      const inner = outer.map((m) => m * (0.75 + rand() * 0.25));
      blob(cx - rpx * 0.12 * sx, cy - rpx * 0.12, rpx * 0.5 * sx, rpx * 0.5, "#a06a37", inner);
    }
    // satellite dots
    const nd = 1 + Math.floor(rand() * 3);
    for (let k = 0; k < nd; k++) {
      const a = rand() * Math.PI * 2;
      const dist = rpx * (1.45 + rand() * 0.4);
      const rr = rpx * (0.14 + rand() * 0.12);
      blob(cx + Math.cos(a) * dist * sx, cy + Math.sin(a) * dist, rr * sx, rr, "#8a5329", [1, 0.9, 1.05, 0.95, 1, 0.92]);
    }
  }
  // freckles
  g.globalAlpha = 0.32;
  for (let i = 0; i < 700; i++) {
    const d = randDir();
    if (d.y < 0.0 || Math.abs(d.x) > 0.98) continue;
    const { cx, cy, sx } = toTex(d);
    const rr = 1.5 + rand() * 2.5;
    g.fillStyle = "#9a6a3a";
    g.beginPath();
    g.ellipse(cx, cy, rr * sx, rr, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ---------------------------------------------------------------- fan (fin) geometry
interface FanOpts {
  radius: number;
  spread: number;
  rays: number;
  rows: number;
  scallop: number;
  pleat: number;
  curl: number;
  color: (strip: number, row: number, rows: number) => THREE.Color;
}
function fanGeo(o: FanOpts): THREE.BufferGeometry {
  const P: THREE.Vector3[][] = [];
  for (let j = 0; j <= o.rows; j++) {
    const row: THREE.Vector3[] = [];
    for (let i = 0; i <= o.rays; i++) {
      const a = (i / o.rays - 0.5) * o.spread;
      const e = Math.abs(a) / (o.spread / 2);
      let L = o.radius * (1 - 0.28 * e * e);
      if (i % 2 === 1) L *= o.scallop;
      const t = j / o.rows;
      const r = L * t;
      const z = (i % 2 === 1 ? 1 : -1) * o.pleat * t + o.curl * t * t;
      row.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z));
    }
    P.push(row);
  }
  const pos: number[] = [];
  const col: number[] = [];
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, k: THREE.Color) => {
    for (const v of [a, b, c]) {
      pos.push(v.x, v.y, v.z);
      col.push(k.r, k.g, k.b);
    }
  };
  for (let i = 0; i < o.rays; i++) {
    for (let j = 0; j < o.rows; j++) {
      const k = o.color(i, j, o.rows);
      if (j === 0) tri(P[0][i], P[1][i], P[1][i + 1], k);
      else {
        tri(P[j][i], P[j + 1][i], P[j + 1][i + 1], k);
        tri(P[j][i], P[j + 1][i + 1], P[j][i + 1], k);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

function spikeGeo(baseHex: string, tipHex: string) {
  const h = 0.05;
  const g = new THREE.ConeGeometry(0.011, h, 5, 3, true);
  g.translate(0, h / 2, 0);
  const pos = g.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  const cb = new THREE.Color(baseHex),
    ct = new THREE.Color(tipHex),
    c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / h;
    c.copy(cb).lerp(ct, clamp((t - 0.35) / 0.65, 0, 1));
    cols[i * 3] = c.r;
    cols[i * 3 + 1] = c.g;
    cols[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  return g;
}

// ---------------------------------------------------------------- the model
export default function build(): THREE.Object3D {
  const rand = mulberry32(20240611);
  const root = new THREE.Group();
  root.name = "Startled Pufferfish";
  const fish = new THREE.Group();
  root.add(fish);

  // ---- materials
  const skinTex = makeSkinTexture(rand);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: skinTex ? 0xffffff : 0xf3d77f,
    map: skinTex,
    roughness: 0.62,
    flatShading: true,
  });
  const skinMat = new THREE.MeshStandardMaterial({ color: "#f0d37e", roughness: 0.65, flatShading: true, side: THREE.DoubleSide });
  const spikeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, flatShading: true });
  const pedMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.65, flatShading: true });
  const finSoftMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.5,
    flatShading: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.86,
  });
  const finMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, flatShading: true, side: THREE.DoubleSide });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: "#fffdf2", roughness: 0.22 });
  const irisMat = new THREE.MeshStandardMaterial({ color: "#eaa526", roughness: 0.3 });
  const ringMat = new THREE.MeshStandardMaterial({ color: "#b8691a", roughness: 0.3 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: "#150d0b", roughness: 0.15 });
  const hlMat = new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.9, roughness: 0.2 });
  const lipMat = new THREE.MeshStandardMaterial({ color: "#e8947a", roughness: 0.5, flatShading: true, side: THREE.DoubleSide });
  const mouthDarkMat = new THREE.MeshStandardMaterial({ color: "#3a1712", roughness: 0.9 });
  const gillMat = new THREE.MeshStandardMaterial({ color: "#a8743c", roughness: 0.8, flatShading: true });
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: "#c2eaff",
    emissive: "#5fb4e6",
    emissiveIntensity: 0.25,
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    opacity: 0.38,
    flatShading: true,
    depthWrite: false,
  });

  // ---- body (poles on the flanks so the top has no texture pinch)
  const bodyGeo = new THREE.SphereGeometry(1, 22, 15);
  bodyGeo.rotateZ(Math.PI / 2);
  bodyGeo.scale(RX, RY, RZ);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.name = "body";
  fish.add(body);

  // ---- feature directions on the body
  const dirMouth = new THREE.Vector3(0, -0.3, 0.95).normalize();
  const dirEye = (s: number) => new THREE.Vector3(s * 0.52, 0.3, 0.8).normalize();
  const dirPect = (s: number) => new THREE.Vector3(s * 0.96, -0.1, 0.02).normalize();
  const dirGill = (s: number) => new THREE.Vector3(s * 0.9, 0.02, 0.43).normalize();
  const dirDorsal = new THREE.Vector3(0, 0.7, -0.72).normalize();
  const dirAnal = new THREE.Vector3(0, -0.7, -0.72).normalize();
  const dirTail = new THREE.Vector3(0, 0, -1);

  // ---- spikes
  const spikeGeos = {
    dorsal: spikeGeo("#efca66", "#7a4521"),
    mid: spikeGeo("#f6e1a0", "#b88650"),
    belly: spikeGeo("#fff6e0", "#e6d2ae"),
  };
  const zones: [THREE.Vector3, number][] = [
    [dirEye(1), 0.44],
    [dirEye(-1), 0.44],
    [dirMouth, 0.33],
    [dirPect(1), 0.3],
    [dirPect(-1), 0.3],
    [dirGill(1), 0.2],
    [dirGill(-1), 0.2],
    [dirDorsal, 0.3],
    [dirAnal, 0.3],
    [dirTail, 0.43],
  ];
  const spikes = new THREE.Group();
  spikes.name = "spikes";
  const N = 220;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let k = 0; k < N; k++) {
    const y = 1 - (2 * (k + 0.5)) / N;
    const rr = Math.sqrt(1 - y * y);
    const th = k * golden;
    const d = new THREE.Vector3(Math.cos(th) * rr, y, Math.sin(th) * rr);
    d.x += (rand() - 0.5) * 0.12;
    d.y += (rand() - 0.5) * 0.12;
    d.z += (rand() - 0.5) * 0.12;
    d.normalize();
    if (zones.some(([zd, a]) => d.angleTo(zd) < a)) continue;
    const geo = d.y > 0.4 ? spikeGeos.dorsal : d.y > -0.3 ? spikeGeos.mid : spikeGeos.belly;
    const m = new THREE.Mesh(geo, spikeMat);
    const n = bodyNormal(d);
    n.x += (rand() - 0.5) * 0.1;
    n.y += (rand() - 0.5) * 0.1;
    n.z += (rand() - 0.5) * 0.1;
    n.normalize();
    m.position.copy(surf(d, 0.008));
    m.quaternion.setFromUnitVectors(UP, n);
    const w = 0.9 + rand() * 0.25;
    const l = (0.85 + rand() * 0.35) * (d.z > 0.4 ? 0.88 : 1);
    m.scale.set(w, l, w);
    spikes.add(m);
  }
  fish.add(spikes);

  // ---- eyes
  const eyeballGeo = new THREE.SphereGeometry(0.058, 16, 12);
  const capGeo = (r: number, ang: number) => {
    const g = new THREE.SphereGeometry(r, 16, 4, 0, Math.PI * 2, 0, ang);
    g.rotateX(Math.PI / 2); // pole -> +Z
    return g;
  };
  const irisGeo = capGeo(0.0592, 0.8);
  const ringGeo = capGeo(0.06, 0.5);
  const pupilGeo = capGeo(0.0608, 0.3);
  const hlGeo = new THREE.SphereGeometry(1, 8, 6);
  const rimGeo = new THREE.TorusGeometry(0.059, 0.011, 6, 14);
  const lidGeo = new THREE.SphereGeometry(0.0645, 14, 6, 0, Math.PI * 2, 0, 1.05);
  const eyes = new THREE.Group();
  eyes.name = "eyes";
  for (const s of [1, -1]) {
    const dE = dirEye(s);
    const nE = bodyNormal(dE);
    const q = frameQuat(nE);
    const qi = q.clone().invert();
    const eye = new THREE.Group();
    eye.position.copy(surf(dE, 0.016));
    eye.quaternion.copy(q);

    eye.add(new THREE.Mesh(eyeballGeo, eyeWhiteMat));
    const rim = new THREE.Mesh(rimGeo, skinMat);
    rim.position.z = 0.014;
    eye.add(rim);

    // gaze: halfway between straight out and straight ahead
    const Lw = nE.clone().multiplyScalar(0.55).addScaledVector(FWD, 0.45).normalize();
    const Ll = Lw.clone().applyQuaternion(qi);
    const iris = new THREE.Group();
    iris.quaternion.setFromUnitVectors(FWD, Ll);
    iris.add(new THREE.Mesh(irisGeo, irisMat), new THREE.Mesh(ringGeo, ringMat), new THREE.Mesh(pupilGeo, pupilMat));
    eye.add(iris);

    const h1 = new THREE.Mesh(hlGeo, hlMat);
    h1.position.copy(Ll.clone().addScaledVector(UP, 0.45).normalize().multiplyScalar(0.0605));
    h1.scale.setScalar(0.0095);
    const h2 = new THREE.Mesh(hlGeo, hlMat);
    h2.position.copy(Ll.clone().addScaledVector(UP, -0.34).addScaledVector(RIGHT, -s * 0.1).normalize().multiplyScalar(0.0605));
    h2.scale.setScalar(0.0048);
    eye.add(h1, h2);

    // worried lid: tilted so inner corner is raised
    const lid = new THREE.Mesh(lidGeo, skinMat);
    lid.rotation.z = -s * 0.45;
    eye.add(lid);
    eyes.add(eye);
  }
  fish.add(eyes);

  // ---- mouth: small protruding pout
  {
    const nM = bodyNormal(dirMouth).addScaledVector(FWD, 0.6).normalize();
    const mouth = new THREE.Group();
    mouth.name = "mouth";
    mouth.position.copy(surf(dirMouth, 0.012));
    mouth.quaternion.copy(frameQuat(nM));
    const tubeGeo = new THREE.CylinderGeometry(0.03, 0.027, 0.036, 8, 1, true);
    tubeGeo.rotateX(Math.PI / 2);
    const tube = new THREE.Mesh(tubeGeo, lipMat);
    tube.position.z = 0.008;
    const lips = new THREE.Mesh(new THREE.TorusGeometry(0.0265, 0.0125, 6, 10), lipMat);
    lips.position.z = 0.026;
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.0225, 10), mouthDarkMat);
    hole.position.z = 0.012;
    mouth.add(tube, lips, hole);
    fish.add(mouth);
  }

  // ---- gill slits
  for (const s of [1, -1]) {
    const dG = dirGill(s);
    const grp = new THREE.Group();
    grp.position.copy(surf(dG, -0.001));
    grp.quaternion.copy(frameQuat(bodyNormal(dG)));
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.0035, 4, 8, Math.PI), gillMat);
    arc.rotation.z = -s * Math.PI / 2;
    grp.add(arc);
    fish.add(grp);
  }

  // ---- fins
  const cA = (hex: string) => new THREE.Color(hex);
  const nubGeo = new THREE.SphereGeometry(0.026, 8, 6);

  function placeFan(geo: THREE.BufferGeometry, mat: THREE.Material, origin: THREE.Vector3, xAxis: THREE.Vector3, yAxis: THREE.Vector3, roll = 0) {
    const x = xAxis.clone().normalize();
    const y = yAxis.clone().addScaledVector(x, -yAxis.dot(x)).normalize();
    const z = new THREE.Vector3().crossVectors(x, y);
    const grp = new THREE.Group();
    grp.position.copy(origin);
    grp.quaternion.copy(quatFromBasis(x, y, z));
    if (roll) grp.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(RIGHT, roll));
    grp.add(new THREE.Mesh(geo, mat));
    return grp;
  }

  // pectoral fins (pleated, translucent, slightly fluttering)
  const pectGeo = fanGeo({
    radius: 0.105,
    spread: 1.9,
    rays: 8,
    rows: 3,
    scallop: 0.9,
    pleat: 0.0035,
    curl: 0.012,
    color: (i, j, rows) => (j === rows - 1 ? cA(i % 2 ? "#ecc276" : "#f2d088") : cA(i % 2 ? "#f3d98f" : "#fbecbc")),
  });
  for (const s of [1, -1]) {
    const dP = dirPect(s);
    const fin = placeFan(
      pectGeo,
      finSoftMat,
      surf(dP, 0.012),
      new THREE.Vector3(s * 0.82, 0.08, -0.57),
      UP,
      s * (s > 0 ? -0.22 : -0.08)
    );
    const nub = new THREE.Mesh(nubGeo, skinMat);
    nub.scale.set(1.3, 1.0, 0.75);
    nub.position.x = 0.012;
    fin.add(nub);
    fin.name = s > 0 ? "pectoralFinLeft" : "pectoralFinRight";
    fish.add(fin);
  }

  // dorsal + anal fins (small)
  const smallFinColor = (i: number, j: number, rows: number) =>
    j === rows - 1 ? cA(i % 2 ? "#a86a3b" : "#bd7f47") : cA(i % 2 ? "#e6c05e" : "#f4d97f");
  const dorsalGeo = fanGeo({ radius: 0.075, spread: 1.3, rays: 6, rows: 2, scallop: 0.88, pleat: 0.003, curl: 0, color: smallFinColor });
  const analGeo = fanGeo({ radius: 0.065, spread: 1.3, rays: 6, rows: 2, scallop: 0.88, pleat: 0.003, curl: 0, color: smallFinColor });
  {
    const xD = new THREE.Vector3(0, 0.62, -0.78).normalize();
    const yD = new THREE.Vector3().crossVectors(RIGHT, xD);
    const dorsal = placeFan(dorsalGeo, finMat, surf(dirDorsal, 0.012), xD, yD);
    dorsal.name = "dorsalFin";
    fish.add(dorsal);
    const xA = new THREE.Vector3(0, -0.62, -0.78).normalize();
    const yA = new THREE.Vector3().crossVectors(RIGHT, xA);
    const anal = placeFan(analGeo, finMat, surf(dirAnal, 0.012), xA, yA);
    anal.name = "analFin";
    fish.add(anal);
  }

  // tail: peduncle + stubby pleated fan
  {
    const pedGeo = new THREE.CylinderGeometry(0.04, 0.088, 0.115, 8, 1, false);
    pedGeo.rotateX(-Math.PI / 2);
    pedGeo.translate(0, 0, -0.2475);
    const pos = pedGeo.attributes.position;
    const cols = new Float32Array(pos.count * 3);
    const top = new THREE.Color("#f0cf70"),
      bot = new THREE.Color("#fbf0d2"),
      c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      c.copy(bot).lerp(top, smoothstep(-0.03, 0.03, pos.getY(i)));
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    pedGeo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    const tail = new THREE.Group();
    tail.name = "tail";
    const ped = new THREE.Mesh(pedGeo, pedMat);
    const tailGeo = fanGeo({
      radius: 0.16,
      spread: 2.0,
      rays: 10,
      rows: 3,
      scallop: 0.9,
      pleat: 0.004,
      curl: 0,
      color: (i, j, rows) => {
        const k = cA(i % 2 ? "#e9c15f" : "#f5da86");
        if (j === rows - 1) return cA(i % 2 ? "#a9693a" : "#bf8148");
        if (j === rows - 2) k.lerp(cA("#c99456"), 0.28);
        return k;
      },
    });
    const fan = placeFan(tailGeo, finMat, new THREE.Vector3(0, 0, -0.255), new THREE.Vector3(0, 0, -1), UP);
    // fan plane normal should be X: rebuild basis explicitly for a vertical fan
    fan.quaternion.copy(quatFromBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0)));
    tail.add(ped, fan);
    tail.rotation.y = 0.13; // a little swish
    fish.add(tail);
  }

  // ---- bubbles rising from the mouth
  const bubbleGeo = new THREE.IcosahedronGeometry(1, 1);
  const bubbles = new THREE.Group();
  bubbles.name = "bubbles";
  const list: [number, number, number, number][] = [
    [0.0, -0.04, 0.29, 0.011],
    [0.018, 0.01, 0.318, 0.016],
    [0.006, 0.085, 0.34, 0.021],
    [0.04, 0.19, 0.335, 0.028],
    [0.075, 0.31, 0.3, 0.037],
    [0.06, 0.455, 0.26, 0.05],
    [-0.035, 0.05, 0.3, 0.007],
    [0.052, 0.12, 0.345, 0.009],
    [0.12, 0.4, 0.27, 0.012],
  ];
  for (const [x, y, z, r] of list) {
    const b = new THREE.Mesh(bubbleGeo, bubbleMat);
    b.position.set(x, y, z);
    b.scale.setScalar(r);
    const h = new THREE.Mesh(hlGeo, hlMat);
    h.position.set(-0.3, 0.42, 0.78).multiplyScalar(0.86);
    h.scale.setScalar(0.17);
    b.add(h);
    bubbles.add(b);
  }
  fish.add(bubbles);

  // ---- rest on the floor: lowest point touches y = 0
  fish.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(fish);
  fish.position.y = -box.min.y;

  return root;
}
```