```ts
import * as THREE from "three";

export const meta = {
  name: "Lined Seahorse",
  description:
    "A sunny yellow seahorse with dark pinstripe ridges and white freckles, curling its tail around a strand of seagrass. It has a crown of spikes, a long tube snout, a fluttering dorsal fin and big curious eyes.",
};

function mulberry32(seed: number) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rand = mulberry32(2024);
  const group = new THREE.Group();

  // ---- Shared materials (one per colour) ----
  const yellow = new THREE.MeshStandardMaterial({ color: 0xffc233, roughness: 0.42 });
  const lineMat = new THREE.MeshStandardMaterial({ color: 0x6b3d12, roughness: 0.6 });
  const white = new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.3 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.2 });
  const grass = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.55 });
  const grassDark = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.55 });
  const sand = new THREE.MeshStandardMaterial({ color: 0xe8c78a, roughness: 0.9 });
  const finPlain = new THREE.MeshStandardMaterial({
    color: 0xfff1b8,
    roughness: 0.4,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });

  // Canvas-drawn dorsal fin with transparent edges and rays
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const g = cv.getContext("2d")!;
  g.clearRect(0, 0, 256, 256);
  g.beginPath();
  g.moveTo(2, 18);
  g.bezierCurveTo(90, -10, 230, 30, 252, 150);
  g.bezierCurveTo(200, 210, 90, 250, 2, 236);
  g.closePath();
  g.fillStyle = "rgba(255,248,205,0.82)";
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = "rgba(200,125,20,0.75)";
  g.lineWidth = 3;
  for (let k = 0; k < 10; k++) {
    g.beginPath();
    g.moveTo(2, 128);
    g.lineTo(256, 10 + k * 26);
    g.stroke();
  }
  g.restore();
  g.strokeStyle = "rgba(190,110,20,0.9)";
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(2, 18);
  g.bezierCurveTo(90, -10, 230, 30, 252, 150);
  g.bezierCurveTo(200, 210, 90, 250, 2, 236);
  g.stroke();
  const finTex = new THREE.CanvasTexture(cv);
  finTex.colorSpace = THREE.SRGBColorSpace;
  const finMat = new THREE.MeshStandardMaterial({
    map: finTex,
    transparent: true,
    alphaTest: 0.03,
    side: THREE.DoubleSide,
    roughness: 0.5,
    depthWrite: false,
  });

  const add = (geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  };

  // Thin dark ridge line hugging an elliptical cross-section
  const ridge = (rx: number, rz: number, y: number, t = 0.0028) => {
    const pts: THREE.Vector3[] = [];
    const n = 36;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * rx, y, Math.sin(a) * rz));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    add(new THREE.TubeGeometry(curve, 48, t, 5, true), lineMat);
  };

  const unitSphere = new THREE.SphereGeometry(1, 18, 12);

  // ---- Trunk: stacked ridged segments (chest-forward, tapering) ----
  const segs: { p: number[]; r: number[]; rings: boolean }[] = [
    { p: [0, 0.115, 0.0], r: [0.03, 0.036, 0.03], rings: true },
    { p: [0, 0.155, 0.01], r: [0.04, 0.046, 0.038], rings: true },
    { p: [0, 0.195, 0.02], r: [0.045, 0.046, 0.042], rings: true },
    { p: [0, 0.228, 0.03], r: [0.036, 0.04, 0.036], rings: false },
  ];

  for (const s of segs) {
    const m = add(unitSphere, yellow, s.p[0], s.p[1], s.p[2]);
    m.scale.set(s.r[0], s.r[1], s.r[2]);
    if (s.rings) {
      for (const k of [-0.5, 0, 0.5]) {
        const f = Math.sqrt(1 - k * k) * 1.01;
        ridge(s.r[0] * f, s.r[2] * f, s.p[1] + k * s.r[1]);
      }
    }
  }

  // ---- Head ----
  const head = add(unitSphere, yellow, 0, 0.287, 0.055);
  head.scale.set(0.034, 0.04, 0.043);

  // Crown of spikes on the back of the head
  const spikeGeo = new THREE.ConeGeometry(0.0075, 0.036, 6);
  const spikes = [
    [-0.013, 0.333, 0.034, 0.9],
    [0.0, 0.341, 0.03, 1.15],
    [0.013, 0.333, 0.034, 0.9],
  ];
  for (const [x, y, z, sc] of spikes) {
    const sp = add(spikeGeo, lineMat, x, y, z);
    sp.scale.setScalar(sc);
    sp.rotation.x = -0.35;
  }

  // Tube snout pointing forward and slightly down
  const snoutGeo = new THREE.CylinderGeometry(0.012, 0.02, 0.15, 10);
  const snout = add(snoutGeo, yellow, 0, 0.28, 0.163);
  snout.rotation.x = Math.PI / 2 + 0.2;
  // Dark snout ring near the mouth tip
  const snoutRing = new THREE.TorusGeometry(0.012, 0.0028, 5, 14);
  const snoutTipRing = add(snoutRing, lineMat, 0, 0.2785, 0.2355);
  snoutTipRing.rotation.x = Math.PI / 2 + 0.2;

  // ---- Big curious eyes ----
  const eyeGeo = new THREE.SphereGeometry(0.0185, 16, 12);
  const pupilGeo = new THREE.SphereGeometry(0.0095, 12, 10);
  const shineGeo = new THREE.SphereGeometry(0.003, 6, 6);
  for (const sx of [-1, 1]) {
    const ex = sx * 0.03;
    add(eyeGeo, white, ex, 0.3, 0.062);
    add(pupilGeo, ink, ex + sx * 0.0045, 0.3, 0.08);
    add(shineGeo, white, ex + sx * 0.0045 + 0.003, 0.306, 0.09);
    // dark eyelid rim
    const rim = new THREE.TorusGeometry(0.0195, 0.0025, 5, 18);
    const rimMesh = add(rim, lineMat, ex, 0.3, 0.062);
    rimMesh.rotation.y = sx * 0.5;
  }

  // ---- Freckles (white dots on the front surfaces) ----
  const freckleGeo = new THREE.SphereGeometry(1, 6, 5);
  const freckle = (cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const phi = 0.7 + rand() * 1.6;
      const alpha = (rand() - 0.5) * 2.2;
      const x = cx + rx * Math.sin(phi) * Math.sin(alpha);
      const y = cy + ry * Math.cos(phi);
      const z = cz + rz * Math.sin(phi) * Math.cos(alpha);
      const sz = 0.0042 + rand() * 0.0025;
      const f = add(freckleGeo, white, x, y, z);
      f.scale.setScalar(sz);
    }
  };
  freckle(0, 0.155, 0.01, 0.04, 0.046, 0.038, 6);
  freckle(0, 0.195, 0.02, 0.045, 0.046, 0.042, 7);
  freckle(0, 0.115, 0.0, 0.03, 0.036, 0.03, 3);
  freckle(0, 0.228, 0.03, 0.036, 0.04, 0.036, 2);
  freckle(0, 0.287, 0.055, 0.034, 0.04, 0.043, 3);

  // ---- Pectoral fins: small translucent flaps on each side ----
  const pecGeo = new THREE.SphereGeometry(1, 10, 8);
  for (const sx of [-1, 1]) {
    const pf = add(pecGeo, finPlain, sx * 0.045, 0.175, 0.0);
    pf.scale.set(0.005, 0.03, 0.02);
    pf.rotation.z = sx * -0.45;
  }

  // ---- Dorsal fin: canvas-textured, gently fluttering ----
  const finGeo = new THREE.PlaneGeometry(0.13, 0.15, 14, 10);
  const fp = finGeo.attributes.position;
  for (let i = 0; i < fp.count; i++) {
    const x = fp.getX(i);
    const y = fp.getY(i);
    const u = (x + 0.065) / 0.13;
    const v = (y + 0.075) / 0.15;
    const z = 0.012 * u * Math.sin(u * 9 + v * 3) + 0.006 * u * Math.sin(v * 11 + 1.3);
    fp.setZ(i, z);
  }
  finGeo.computeVertexNormals();
  const fin = add(finGeo, finMat, 0, 0.22, -0.085);
  fin.rotation.y = Math.PI / 2;

  // ---- Tail: curled helix around the seagrass strand ----
  const C = { x: 0.06, z: -0.02 };
  const tailPts: THREE.Vector3[] = [new THREE.Vector3(0.0, 0.105, 0.0)];
  const N = 26;
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const th = (160 + s * 580) * (Math.PI / 180);
    const y = 0.095 - s * 0.075;
    const r = 0.03 + 0.012 * s;
    tailPts.push(new THREE.Vector3(C.x + r * Math.cos(th), y, C.z + r * Math.sin(th)));
  }
  const tailCurve = new THREE.CatmullRomCurve3(tailPts);
  add(new THREE.TubeGeometry(tailCurve, 120, 0.0105, 10, false), yellow);
  // Thin dark rings along the tail for the lined look
  for (let i = 4; i < tailPts.length - 2; i += 5) {
    const t = i / (tailPts.length - 1);
    const p = tailCurve.getPointAt(Math.min(0.98, t));
    const ringGeo = new THREE.TorusGeometry(0.0125, 0.0023, 5, 16);
    const ringMesh = add(ringGeo, lineMat, p.x, p.y, p.z);
    const tan = tailCurve.getTangentAt(Math.min(0.98, t));
    ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
  }

  // ---- Seagrass strand + sandy base ----
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.06, 0, -0.02),
    new THREE.Vector3(0.062, 0.12, -0.02),
    new THREE.Vector3(0.068, 0.26, -0.03),
    new THREE.Vector3(0.08, 0.4, -0.02),
    new THREE.Vector3(0.09, 0.5, 0.0),
  ]);
  add(new THREE.TubeGeometry(stemCurve, 70, 0.0095, 8, false), grass);

  const bladeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.07, 0, -0.02),
    new THREE.Vector3(0.09, 0.15, -0.05),
    new THREE.Vector3(0.12, 0.3, -0.06),
    new THREE.Vector3(0.13, 0.42, -0.04),
  ]);
  add(new THREE.TubeGeometry(bladeCurve, 50, 0.0065, 6, false), grassDark);

  const mound = add(new THREE.CylinderGeometry(0.09, 0.11, 0.02, 14), sand, 0.06, 0.01, -0.02);
  mound.name = "sand";

  return group;
}
```