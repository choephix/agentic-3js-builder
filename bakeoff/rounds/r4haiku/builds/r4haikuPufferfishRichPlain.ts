import * as THREE from "three";

export const meta = {
  name: "Startled Puffer",
  description:
    "A fully inflated pufferfish: creamy yellow skin fading to a white belly, brown leopard spots, short spikes, big worried eyes, fluttering side fins, a fan tail and a few bubbles from its pout.",
};

// ---------------------------------------------------------------------------
// Seeded random (mulberry32) so every build is identical
// ---------------------------------------------------------------------------
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Layout (metres, +Y up, nose toward +Z, model's left is +X)
// ---------------------------------------------------------------------------
const R = 0.12; // puffed body radius
const EYE_LAT = 0.6; // eye angle from the nose toward the side
const EYE_ELEV = 0.18; // eye height on the ball
const UP = new THREE.Vector3(0, 1, 0);
const FWD = new THREE.Vector3(0, 0, 1);

/** Unit direction on the ball: lat = angle from the nose toward +X, elev = angle above the equator. */
function dirFrom(lat: number, elev: number): THREE.Vector3 {
  return new THREE.Vector3(
    Math.sin(lat) * Math.cos(elev),
    Math.sin(elev),
    Math.cos(lat) * Math.cos(elev),
  );
}

const MOUTH_DIR = dirFrom(0, -0.2); // pout sits just below the nose

/** Tangent "up" and "right" vectors at a point with outward normal n. */
function tangentFrame(n: THREE.Vector3): { up: THREE.Vector3; right: THREE.Vector3 } {
  const up = UP.clone().addScaledVector(n, -n.y).normalize();
  const right = new THREE.Vector3().crossVectors(up, n).normalize();
  return { up, right };
}

/** Fibonacci sphere: evenly spread unit directions. */
function fibonacci(n: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * i + 1) / n;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = golden * i;
    out.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  return out;
}

/** Instanced mesh from a list of matrices. */
function instanced(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  mats: THREE.Matrix4[],
): THREE.InstancedMesh {
  const im = new THREE.InstancedMesh(geo, mat, mats.length);
  for (let i = 0; i < mats.length; i++) im.setMatrixAt(i, mats[i]);
  im.instanceMatrix.needsUpdate = true;
  return im;
}

/** Skin: canvas-drawn gradient, creamy yellow on top fading to white at the belly. */
function makeSkinMaterial(): THREE.MeshStandardMaterial {
  if (typeof document === "undefined") {
    return new THREE.MeshStandardMaterial({ color: 0xf6d770, roughness: 0.6, flatShading: true });
  }
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, flatShading: true });
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 256;
  const g = cv.getContext("2d");
  if (!g) {
    mat.color.set(0xf6d770);
    return mat;
  }
  // canvas top maps to the top of the ball, canvas bottom to the belly
  const grad = g.createLinearGradient(0, 0, 0, cv.height);
  grad.addColorStop(0.0, "#F3CC52");
  grad.addColorStop(0.3, "#F6DA74");
  grad.addColorStop(0.5, "#FBEBB4");
  grad.addColorStop(0.72, "#FFF8E6");
  grad.addColorStop(1.0, "#FFFFFF");
  g.fillStyle = grad;
  g.fillRect(0, 0, cv.width, cv.height);

  // faint mottling so the skin is not a flat gradient
  const rnd = makeRng(7);
  for (let i = 0; i < 240; i++) {
    g.fillStyle = `rgba(190, 140, 40, ${(0.04 + rnd() * 0.05).toFixed(3)})`;
    g.beginPath();
    g.ellipse(
      rnd() * cv.width,
      rnd() * cv.height * 0.6,
      2 + rnd() * 6,
      1 + rnd() * 2.5,
      rnd() * 3,
      0,
      Math.PI * 2,
    );
    g.fill();
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  mat.map = tex;
  mat.needsUpdate = true;
  return mat;
}

// ---------------------------------------------------------------------------
// The pufferfish
// ---------------------------------------------------------------------------
export default function createPufferfish(): THREE.Object3D {
  const rng = makeRng(90210);
  const jitter = (k: number) =>
    new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(k);

  const EYE_DIRS = [dirFrom(EYE_LAT, EYE_ELEV), dirFrom(-EYE_LAT, EYE_ELEV)];
  const FIN_DIRS = [dirFrom(1.2, -0.05), dirFrom(-1.2, -0.05)];

  // one material per colour, shared by every mesh that uses it
  const skinMat = makeSkinMaterial();
  const spotMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.75 });
  const spikeMat = new THREE.MeshStandardMaterial({ color: 0xead49a, roughness: 0.5, flatShading: true });
  const finMat = new THREE.MeshStandardMaterial({
    color: 0xee8a3c,
    roughness: 0.6,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfffdf6, roughness: 0.25 });
  const inkMat = new THREE.MeshStandardMaterial({ color: 0x16120f, roughness: 0.3 });
  const lipMat = new THREE.MeshStandardMaterial({ color: 0xe25f63, roughness: 0.45 });
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: 0xcdf1ff,
    roughness: 0.08,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });

  const model = new THREE.Group();
  model.name = "pufferfish";
  let minY = -R; // lowest point so far; used to stand the model on y = 0

  // ---- body: the puffed ball ---------------------------------------------
  model.add(new THREE.Mesh(new THREE.SphereGeometry(R, 26, 18), skinMat));

  // ---- spikes: short cones all over, kept clear of face, fins and tail ---
  const spikeMats: THREE.Matrix4[] = [];
  for (const b of fibonacci(230)) {
    const d = b.clone().add(jitter(0.1)).normalize();
    if (d.y < -0.7) continue; // flat underside rests on the floor
    if (d.z < -0.45 && Math.abs(d.x) < 0.4) continue; // tail root
    if (EYE_DIRS.some((e) => d.angleTo(e) < 0.5)) continue; // eyes and brows
    if (d.angleTo(MOUTH_DIR) < 0.32) continue; // pout
    if (FIN_DIRS.some((f) => d.angleTo(f) < 0.42)) continue; // side fins

    const len = 0.024 + rng() * 0.016;
    const rb = 0.008 + rng() * 0.003;
    const start = R * 0.975;
    const pos = d.clone().multiplyScalar(start + len / 2);
    const q = new THREE.Quaternion().setFromUnitVectors(UP, d);
    spikeMats.push(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(rb, len, rb)));
    minY = Math.min(minY, d.y * (start + len));
  }
  model.add(instanced(new THREE.ConeGeometry(1, 1, 5, 1), spikeMat, spikeMats));

  // ---- leopard spots: flat brown blobs, dense on top, fading to the belly -
  const spotMats: THREE.Matrix4[] = [];
  for (const b of fibonacci(320)) {
    const d = b.clone().add(jitter(0.05)).normalize();
    const keep = Math.min(1, Math.max(0, (d.y + 0.25) / 1.1)) * 0.8;
    if (rng() > keep) continue;
    if (EYE_DIRS.some((e) => d.angleTo(e) < 0.45)) continue;
    if (d.angleTo(MOUTH_DIR) < 0.28) continue;

    const size = 0.011 + rng() * 0.009;
    const q = new THREE.Quaternion()
      .setFromUnitVectors(UP, d)
      .multiply(new THREE.Quaternion().setFromAxisAngle(UP, rng() * Math.PI * 2));
    const pos = d.clone().multiplyScalar(R + 0.0015);
    const sc = new THREE.Vector3(
      size * (0.85 + 0.3 * rng()),
      0.004,
      size * (0.85 + 0.3 * rng()),
    );
    spotMats.push(new THREE.Matrix4().compose(pos, q, sc));
  }
  model.add(instanced(new THREE.CylinderGeometry(1, 1, 1, 7, 1), spotMat, spotMats));

  // ---- eyes, pupils, glints and worried brows ----------------------------
  const eyeGeo = new THREE.SphereGeometry(0.04, 14, 10);
  const pupilGeo = new THREE.SphereGeometry(0.018, 10, 8);
  const glintGeo = new THREE.SphereGeometry(0.005, 6, 5);
  const browGeo = new THREE.BoxGeometry(0.06, 0.011, 0.016);

  for (const s of [1, -1]) {
    const ed = dirFrom(s * EYE_LAT, EYE_ELEV);

    const eye = new THREE.Mesh(eyeGeo, whiteMat);
    eye.position.copy(ed).multiplyScalar(R * 0.9);
    model.add(eye);

    // pupils glance upward, which reads as worried
    const pd = ed.clone().addScaledVector(UP, 0.35).normalize();
    const pupil = new THREE.Mesh(pupilGeo, inkMat);
    pupil.position.copy(eye.position).addScaledVector(pd, 0.03);
    model.add(pupil);

    const gd = pd.clone().addScaledVector(UP, 0.5).normalize();
    const glint = new THREE.Mesh(glintGeo, whiteMat);
    glint.position.copy(pupil.position).addScaledVector(gd, 0.0155);
    model.add(glint);

    // brow: inner end raised, outer end drooping
    const bn = dirFrom(s * EYE_LAT, EYE_ELEV + 0.48);
    const bf = tangentFrame(bn);
    const L = bf.right
      .clone()
      .multiplyScalar(-s)
      .addScaledVector(bf.up, 0.55)
      .normalize();
    const Yb = new THREE.Vector3().crossVectors(bn, L);
    const brow = new THREE.Mesh(browGeo, spotMat);
    brow.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(L, Yb, bn));
    brow.position.copy(bn).multiplyScalar(R + 0.004);
    model.add(brow);
  }

  // ---- tiny pouting mouth ------------------------------------------------
  const lips = new THREE.Mesh(new THREE.CylinderGeometry(0.0135, 0.0175, 0.02, 9), lipMat);
  lips.quaternion.setFromUnitVectors(UP, MOUTH_DIR);
  lips.position.copy(MOUTH_DIR).multiplyScalar(R + 0.0065);
  model.add(lips);

  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.0075, 9), inkMat);
  hole.quaternion.setFromUnitVectors(FWD, MOUTH_DIR);
  hole.position.copy(MOUTH_DIR).multiplyScalar(R + 0.0168);
  model.add(hole);

  // ---- small fluttering side fins (two layers each for a flutter) --------
  const finGeo = new THREE.CircleGeometry(0.075, 6, -0.75, 1.5);
  const finGeo2 = new THREE.CircleGeometry(0.058, 5, -0.7, 1.4);
  for (const s of [1, -1]) {
    const roll = s > 0 ? 0 : Math.PI; // fan sector is built around +X; flip it for the other side
    const base = dirFrom(s * 1.2, -0.05).multiplyScalar(R * 0.85);

    const f1 = new THREE.Mesh(finGeo, finMat);
    f1.position.copy(base);
    f1.rotation.set(-0.15, s * 0.55, roll);
    model.add(f1);

    const f2 = new THREE.Mesh(finGeo2, finMat);
    f2.position.copy(base).addScaledVector(UP, 0.005);
    f2.rotation.set(0.35, s * 0.95, roll);
    model.add(f2);
  }

  // ---- stubby fan-shaped tail at the back --------------------------------
  const tail = new THREE.Mesh(new THREE.CircleGeometry(0.085, 6, -0.85, 1.7), finMat);
  tail.rotation.y = Math.PI / 2; // lies in the body's side-profile plane, fanning backward
  tail.position.set(0, 0, -R * 0.9);
  model.add(tail);

  // ---- a few bubbles rising from the mouth -------------------------------
  const bubbleGeo = new THREE.SphereGeometry(1, 10, 8);
  const pout = MOUTH_DIR.clone().multiplyScalar(R + 0.02);
  const bubbleDefs = [
    { r: 0.0065, o: [0.0, 0.02, 0.02] },
    { r: 0.0085, o: [0.006, 0.07, 0.03] },
    { r: 0.011, o: [0.014, 0.14, 0.04] },
    { r: 0.0135, o: [0.026, 0.21, 0.05] },
  ];
  for (const b of bubbleDefs) {
    const bub = new THREE.Mesh(bubbleGeo, bubbleMat);
    bub.scale.setScalar(b.r);
    bub.position.set(pout.x + b.o[0], pout.y + b.o[1], pout.z + b.o[2]);
    model.add(bub);
  }

  // ---- stand on the floor -------------------------------------------------
  const root = new THREE.Group();
  root.add(model);
  model.position.y = -minY; // lowest point (the ball's underside) sits at y = 0
  return root;
}
