import * as THREE from "three";

export const meta = {
  name: "Octopus",
  description:
    "A stylized purple octopus with a spotted mantle, big gold-ringed eyes, a siphon, and eight tapered tentacles curled on the floor with rows of pale suckers.",
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function buildOctopus(): THREE.Object3D {
  const rand = mulberry32(7);
  const root = new THREE.Group();

  // ---------- Materials ----------
  const spotTex = makeSpotTexture();
  const mantleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: spotTex,
    roughness: 0.5,
    metalness: 0.0,
  });
  const tentacleMat = new THREE.MeshStandardMaterial({
    color: 0x7a3fa8,
    roughness: 0.55,
    metalness: 0.0,
  });
  const siphonMat = new THREE.MeshStandardMaterial({ color: 0x5a2a86, roughness: 0.6 });
  const suckerMat = new THREE.MeshStandardMaterial({ color: 0xf2b8d6, roughness: 0.4 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xf7f4ea, roughness: 0.3 });
  const iris = new THREE.MeshStandardMaterial({ color: 0xe0a526, roughness: 0.35 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x0b0710, roughness: 0.2 });

  // ---------- Mantle (head) ----------
  const mantleGeo = new THREE.SphereGeometry(0.2, 32, 20);
  const mantle = new THREE.Mesh(mantleGeo, mantleMat);
  mantle.scale.set(1, 1.25, 1);
  mantle.position.set(0, 0.5, 0);
  root.add(mantle);

  // Siphon: a funnel pointing forward and down from under the mantle
  const siphon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.045, 0.1, 12),
    siphonMat
  );
  siphon.position.set(0, 0.3, 0.19);
  siphon.rotation.x = 1.0;
  root.add(siphon);

  // ---------- Eyes ----------
  for (const side of [-1, 1]) {
    const angle = (50 * Math.PI) / 180;
    const radial = 0.19;
    const dirX = side * Math.sin(angle);
    const dirZ = Math.cos(angle);
    const eyeX = dirX * radial;
    const eyeZ = dirZ * radial;
    const eyeY = 0.5;

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 20, 14), eyeWhite);
    eye.position.set(eyeX, eyeY, eyeZ);
    root.add(eye);

    const irisMesh = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 12), iris);
    irisMesh.position.set(eyeX + dirX * 0.03, eyeY, eyeZ + dirZ * 0.03);
    root.add(irisMesh);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), pupilMat);
    pupil.position.set(eyeX + dirX * 0.058, eyeY, eyeZ + dirZ * 0.058);
    root.add(pupil);
  }

  // ---------- Tentacles ----------
  const SUCKER_MAX = 120;
  const suckerGeo = new THREE.SphereGeometry(1, 8, 6);
  const suckerMesh = new THREE.InstancedMesh(suckerGeo, suckerMat, SUCKER_MAX);
  const dummy = new THREE.Object3D();
  let suckerCount = 0;

  const TENTACLES = 8;
  const SEGS = 28;
  const RADIAL = 8;

  for (let t = 0; t < TENTACLES; t++) {
    const theta = (t / TENTACLES) * Math.PI * 2 + (rand() - 0.5) * 0.25;
    const phase = rand() * Math.PI * 2;
    const len = 0.5 + rand() * 0.12;
    const curl = 0.8 + rand() * 0.6;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    // Centreline points
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= SEGS; k++) {
      const s = k / SEGS;
      const r = 0.09 + len * s;
      const lateral = Math.sin(s * Math.PI * 2.2 + phase) * 0.07 * s * curl;
      const x = cosT * r - sinT * lateral;
      const z = sinT * r + cosT * lateral;
      const lift = 0.24 * (1 - s) * (1 - s);
      const tipCurl = 0.12 * Math.pow(Math.max(0, s - 0.6) / 0.4, 2) * curl;
      const y = 0.02 + lift + tipCurl;
      pts.push(new THREE.Vector3(x, y, z));
    }

    const radiusAt = (s: number) => 0.055 * (1 - s) + 0.011 * s;

    // Build tapered tube with per-ring frames
    const positions: number[] = [];
    const indices: number[] = [];
    const frameN: THREE.Vector3[] = [];
    const frameB: THREE.Vector3[] = [];

    for (let k = 0; k <= SEGS; k++) {
      const prev = pts[Math.max(0, k - 1)];
      const next = pts[Math.min(SEGS, k + 1)];
      const T = new THREE.Vector3().subVectors(next, prev).normalize();
      const ref =
        Math.abs(T.y) > 0.9
          ? new THREE.Vector3(cosT, 0, sinT)
          : new THREE.Vector3(0, 1, 0);
      const N = new THREE.Vector3().crossVectors(T, ref).normalize();
      const B = new THREE.Vector3().crossVectors(N, T).normalize();
      frameN.push(N);
      frameB.push(B);

      const s = k / SEGS;
      const rad = radiusAt(s);
      for (let j = 0; j < RADIAL; j++) {
        const a = (j / RADIAL) * Math.PI * 2;
        const ca = Math.cos(a) * rad;
        const sa = Math.sin(a) * rad;
        positions.push(
          pts[k].x + N.x * ca + B.x * sa,
          pts[k].y + N.y * ca + B.y * sa,
          pts[k].z + N.z * ca + B.z * sa
        );
      }
    }

    for (let k = 0; k < SEGS; k++) {
      for (let j = 0; j < RADIAL; j++) {
        const a = k * RADIAL + j;
        const b = k * RADIAL + ((j + 1) % RADIAL);
        const c = (k + 1) * RADIAL + j;
        const d = (k + 1) * RADIAL + ((j + 1) % RADIAL);
        indices.push(a, c, b, b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    root.add(new THREE.Mesh(geo, tentacleMat));

    // Rounded tip
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), tentacleMat);
    tip.position.copy(pts[SEGS]);
    root.add(tip);

    // Suckers on the underside
    for (let k = 4; k <= SEGS - 4; k += 2) {
      if (suckerCount >= SUCKER_MAX) break;
      const s = k / SEGS;
      const rad = radiusAt(s);
      const N = frameN[k];
      const B = frameB[k];
      const candidates = [N, N.clone().negate(), B, B.clone().negate()];
      let best = candidates[0];
      for (const c of candidates) if (c.y < best.y) best = c;

      const p = pts[k].clone().addScaledVector(best, rad * 0.95);
      const size = 0.009 * (1 - s) + 0.004;
      dummy.position.copy(p);
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      suckerMesh.setMatrixAt(suckerCount, dummy.matrix);
      suckerCount++;
    }
  }

  suckerMesh.count = suckerCount;
  suckerMesh.instanceMatrix.needsUpdate = true;
  root.add(suckerMesh);

  // ---------- Ground contact ----------
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;

  const holder = new THREE.Group();
  holder.add(root);
  return holder;
}

function makeSpotTexture(): THREE.CanvasTexture {
  const rand = mulberry32(42);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#7a3fa8";
  g.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 90; i++) {
    const x = rand() * canvas.width;
    const y = rand() * canvas.height;
    const r = 3 + rand() * 7;
    g.fillStyle = rand() < 0.6 ? "#c98ee0" : "#4f2175";
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}
