```ts
import * as THREE from "three";

export const meta = {
  name: "Emperor Dragonfly",
  description:
    "An emperor dragonfly (Anax imperator) hovering over a pond. Electric blue abdomen with black dorsal marks, apple-green thorax, huge turquoise eyes, four veined golden-sheened wings held flat, six legs tucked beneath.",
};

// Seeded generator (mulberry32-style) so every build is identical.
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Canvas-drawn wing venation: transparent membrane tint, dark longitudinal and cross veins.
function makeVeinTexture(rand: () => number): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const W = 512;
  const H = 128;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  if (!g) return null;

  // Membrane tint
  g.fillStyle = "rgba(255,236,190,0.14)";
  g.fillRect(0, 0, W, H);

  g.strokeStyle = "rgba(28,20,14,0.92)";
  g.lineCap = "round";

  // Longitudinal veins
  const LONG = 12;
  for (let k = 0; k <= LONG; k++) {
    const y = (k / LONG) * H;
    g.lineWidth = k === LONG ? 6 : 1.4;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= W; x += 32) {
      g.lineTo(x, y + Math.sin(x * 0.02 + k) * 2);
    }
    g.stroke();
  }

  // Fine cross veins forming the net
  g.lineWidth = 0.7;
  for (let n = 0; n < 380; n++) {
    const x = rand() * W;
    const k = Math.floor(rand() * LONG);
    const y0 = (k / LONG) * H;
    const y1 = ((k + 1) / LONG) * H;
    g.beginPath();
    g.moveTo(x, y0);
    g.lineTo(x + (rand() - 0.5) * 6, y1);
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function buildEmperorDragonfly(): THREE.Object3D {
  const rand = makeRng(1857);

  // ---- Materials (one per colour, shared) ----
  const blue = new THREE.MeshStandardMaterial({
    color: 0x1d5cff,
    roughness: 0.32,
    metalness: 0.15,
    emissive: 0x06124a,
    emissiveIntensity: 0.6,
    flatShading: true,
  });
  const black = new THREE.MeshStandardMaterial({
    color: 0x101014,
    roughness: 0.6,
    flatShading: true,
  });
  const green = new THREE.MeshStandardMaterial({
    color: 0x9fd13a,
    roughness: 0.45,
    flatShading: true,
  });
  const eye = new THREE.MeshStandardMaterial({
    color: 0x27d3c6,
    roughness: 0.12,
    metalness: 0.2,
    emissive: 0x04302c,
    emissiveIntensity: 0.5,
    flatShading: true,
  });

  const veins = makeVeinTexture(rand);
  const wingMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: veins ?? undefined,
    color2: undefined,
    transparent: true,
    opacity: veins ? 1 : 0.35,
    depthWrite: false,
    side: THREE.DoubleSide,
    roughness: 0.15,
    metalness: 0.0,
    iridescence: 0.7,
    iridescenceIOR: 1.4,
    iridescenceThicknessRange: [200, 500],
    sheen: 0.4,
    sheenColor: new THREE.Color(0xffd27a),
    sheenRoughness: 0.4,
    clearcoat: 0.6,
  } as THREE.MeshPhysicalMaterialParameters);

  const body = new THREE.Group();
  body.position.y = 0.12; // hovering: lowest leg tips sit about 10 cm above the pond
  body.rotation.x = 0.07; // abdomen tilted slightly tail-up, typical hover posture

  // Helper: a thin limb between two points
  const limb = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6, 1), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    body.add(m);
  };

  // ---- Head and eyes ----
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 8, 6), black);
  head.position.set(0, 0.006, 0.031);
  head.scale.set(1.2, 0.9, 0.9);
  body.add(head);

  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.0118, 12, 9), eye);
    e.position.set(s * 0.0052, 0.0075, 0.031);
    e.scale.set(1, 1.05, 1.25);
    body.add(e);
  }

  // Antennae
  for (const s of [-1, 1]) {
    limb(
      new THREE.Vector3(s * 0.0015, 0.0105, 0.03),
      new THREE.Vector3(s * 0.0035, 0.016, 0.041),
      0.0005,
      black,
    );
  }

  // ---- Thorax ----
  const thorax = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), green);
  thorax.position.set(0, 0.001, 0.0);
  thorax.scale.set(0.0105, 0.0125, 0.0165);
  body.add(thorax);

  // Black side stripes on the thorax
  for (const s of [-1, 1]) {
    for (const z of [0.002, -0.004]) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.0024, 0.0095, 0.0036), black);
      stripe.position.set(s * 0.0098, 0.001, z);
      stripe.rotation.z = s * -0.12;
      body.add(stripe);
    }
  }

  // ---- Abdomen: ten tapering blue segments with black dorsal marks ----
  const SEG = 10;
  const segLen = 0.0092;
  const zStart = -0.012;
  const prof = (s: number) =>
    s < 6 ? 0.0022 + 0.0011 * Math.pow((6 - s) / 6, 1.5) : 0.0019 + 0.0008 * ((s - 6) / 4);

  for (let i = 0; i < SEG; i++) {
    const z0 = zStart - i * segLen;
    const z1 = z0 - segLen;
    const rf = prof(i);
    const rb = prof(i + 1);
    const rm = (rf + rb) * 0.5;
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(rf, rb, segLen * 1.02, 8, 1),
      blue,
    );
    seg.rotation.x = Math.PI / 2; // cylinder axis to +Z, top (front) to +Z
    seg.position.set(0, 0, (z0 + z1) * 0.5);
    body.add(seg);

    // Black dorsal stripe on the middle segments
    if (i >= 1 && i <= 8) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.0014, 0.0008, segLen * 0.7),
        black,
      );
      stripe.position.set(0, rm + 0.0001, (z0 + z1) * 0.5);
      body.add(stripe);
    }

    // Small black lateral spots on alternating segments
    if (i >= 2 && i <= 7 && i % 2 === 0) {
      for (const s of [-1, 1]) {
        const spot = new THREE.Mesh(new THREE.BoxGeometry(0.0009, 0.0016, segLen * 0.5), black);
        spot.position.set(s * rm * 0.98, 0, (z0 + z1) * 0.5);
        body.add(spot);
      }
    }
  }

  // Terminal appendages (cerci)
  for (const s of [-1, 1]) {
    limb(
      new THREE.Vector3(s * 0.0008, 0, zStart - SEG * segLen),
      new THREE.Vector3(s * 0.0022, -0.0005, zStart - SEG * segLen - 0.0065),
      0.0006,
      black,
    );
  }

  // ---- Wings: four flat, veined, golden-sheened membranes ----
  const L = 0.05;
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.002);
  wingShape.bezierCurveTo(0.015, 0.0075, 0.035, 0.0065, L, 0.0005);
  wingShape.bezierCurveTo(0.036, -0.0035, 0.02, -0.0055, 0.0, -0.0035);
  wingShape.closePath();
  const wingGeo = new THREE.ShapeGeometry(wingShape, 10);
  {
    const pos = wingGeo.attributes.position;
    const uv = wingGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, pos.getX(i) / L, (pos.getY(i) + 0.0055) / 0.013);
    }
  }

  const addWing = (y: number, z: number, yaw: number) => {
    const g = new THREE.Group();
    g.position.set(0, y, z);
    g.rotation.y = yaw;
    body.add(g);

    const right = new THREE.Mesh(wingGeo, wingMat);
    right.position.set(0.0045, 0, 0);
    right.rotation.x = Math.PI / 2; // lay flat, leading edge toward +Z
    g.add(right);

    const left = new THREE.Mesh(wingGeo, wingMat);
    left.position.set(-0.0045, 0, 0);
    left.rotation.x = Math.PI / 2;
    left.scale.x = -1; // mirror for the left side
    g.add(left);
  };

  addWing(0.0055, -0.001, 0.12); // hindwings, tips swept slightly back
  addWing(0.0068, 0.014, -0.1); // forewings, tips swept slightly forward

  // ---- Six thin legs tucked under the thorax ----
  const legZ = [0.024, 0.012, 0.0];
  for (const z of legZ) {
    for (const s of [-1, 1]) {
      const hip = new THREE.Vector3(s * 0.0042, -0.005, z);
      const knee = new THREE.Vector3(s * 0.0125, -0.0105, z + 0.0035);
      const foot = new THREE.Vector3(s * 0.0072, -0.0195, z - 0.0035);
      limb(hip, knee, 0.0007, black);
      limb(knee, foot, 0.0005, black);
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.0010, 5, 4), black);
      joint.position.copy(knee);
      body.add(joint);
    }
  }

  const root = new THREE.Group();
  root.add(body);
  return root;
}
```