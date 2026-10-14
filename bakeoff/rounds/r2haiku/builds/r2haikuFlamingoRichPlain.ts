import * as THREE from "three";

export const meta = {
  name: "Elegant Flamingo",
  description: "A candy-pink flamingo standing tall in shallow water, with coral wings, black flight-feather tips, an S-curved neck and a bent two-tone beak.",
};

export default function createFlamingo(): THREE.Object3D {
  const root = new THREE.Group();

  // ---------- Materials (one per colour, shared) ----------
  const candy = new THREE.MeshStandardMaterial({ color: 0xff8fb8, roughness: 0.6 });
  const coral = new THREE.MeshStandardMaterial({ color: 0xff6f4f, roughness: 0.55 });
  const black = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.5 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffd3e0, roughness: 0.6 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xffa9c4, roughness: 0.45 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0xe85d8f, roughness: 0.5 });
  const footMat = new THREE.MeshStandardMaterial({ color: 0xe85d8f, roughness: 0.5, side: THREE.DoubleSide });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfff1a0, emissive: 0x332a00, roughness: 0.3 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x7fd6ea,
    transparent: true,
    opacity: 0.5,
    roughness: 0.15,
  });
  const rippleMat = new THREE.MeshStandardMaterial({ color: 0xd9f6ff, roughness: 0.3 });

  // ---------- Helpers ----------
  // Tapered cylinder from a (radius r1) to b (radius r2).
  function limb(
    a: THREE.Vector3,
    b: THREE.Vector3,
    r1: number,
    r2: number,
    mat: THREE.Material
  ): THREE.Mesh {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(r2, r1, len, 12);
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return m;
  }

  function ball(
    x: number,
    y: number,
    z: number,
    r: number,
    mat: THREE.Material,
    sx = 1,
    sy = 1,
    sz = 1,
    seg = 20
  ): THREE.Mesh {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(10, seg - 4)), mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    return m;
  }

  // ---------- Body ----------
  root.add(ball(0, 0.92, 0, 1, candy, 0.21, 0.16, 0.36, 28));
  // Chest, a slightly fuller front
  root.add(ball(0, 0.9, 0.18, 1, candy, 0.17, 0.15, 0.18, 22));

  // Tail plume
  root.add(ball(0, 0.93, -0.44, 1, coral, 0.1, 0.08, 0.13, 16));
  root.add(limb(new THREE.Vector3(0, 0.9, -0.36), new THREE.Vector3(0, 0.99, -0.52), 0.07, 0.02, coral));

  // ---------- Neck (S-curve) ----------
  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.95, 0.14),
    new THREE.Vector3(0, 1.15, 0.3),
    new THREE.Vector3(0, 1.38, 0.26),
    new THREE.Vector3(0, 1.52, 0.1),
    new THREE.Vector3(0, 1.64, 0.16),
    new THREE.Vector3(0, 1.72, 0.27),
  ]);
  const neck = new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 48, 0.042, 12, false), candy);
  root.add(neck);
  // Thicker base where the neck joins the chest
  root.add(ball(0, 0.98, 0.13, 0.065, candy, 1, 1, 1, 16));

  // ---------- Head ----------
  const headCenter = new THREE.Vector3(0, 1.74, 0.27);
  root.add(ball(headCenter.x, headCenter.y, headCenter.z, 0.07, headMat, 0.95, 0.95, 1.1, 20));

  // Eyes: pale yellow with small dark pupils
  for (const s of [1, -1]) {
    root.add(ball(0.06 * s, 1.765, 0.3, 0.016, eyeMat, 1, 1, 1, 12));
    root.add(ball(0.06 * s, 1.765, 0.315, 0.007, pupilMat, 1, 1, 1, 8));
  }

  // ---------- Bent beak: pale pink base, black hooked tip ----------
  root.add(limb(new THREE.Vector3(0, 1.735, 0.33), new THREE.Vector3(0, 1.7, 0.46), 0.032, 0.024, beakMat));
  root.add(limb(new THREE.Vector3(0, 1.7, 0.46), new THREE.Vector3(0, 1.635, 0.57), 0.024, 0.008, black));

  // ---------- Wings (coral with black flight-feather tips) ----------
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.07);
  wingShape.bezierCurveTo(0.2, 0.1, 0.42, 0.06, 0.6, -0.01);
  wingShape.lineTo(0.56, -0.04);
  wingShape.bezierCurveTo(0.4, -0.05, 0.18, -0.07, 0, -0.06);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.03, bevelEnabled: false, curveSegments: 12 });
  wingGeo.rotateY(Math.PI / 2); // length now runs toward -Z, thickness along +X

  const tipShape = new THREE.Shape();
  tipShape.moveTo(0.42, 0.06);
  tipShape.bezierCurveTo(0.5, 0.07, 0.58, 0.03, 0.62, -0.01);
  tipShape.lineTo(0.6, -0.025);
  tipShape.bezierCurveTo(0.52, -0.025, 0.45, -0.06, 0.4, -0.06);
  tipShape.closePath();
  const tipGeo = new THREE.ExtrudeGeometry(tipShape, { depth: 0.04, bevelEnabled: false, curveSegments: 12 });
  tipGeo.translate(0, 0, -0.005);
  tipGeo.rotateY(Math.PI / 2);

  const wingL = new THREE.Group();
  wingL.add(new THREE.Mesh(wingGeo, coral));
  wingL.add(new THREE.Mesh(tipGeo, black));
  wingL.position.set(0.16, 0.92, 0.12);
  root.add(wingL);

  // Right wing mirrors the left
  const wingR = wingL.clone();
  wingR.scale.x = -1;
  wingR.position.set(-0.16, 0.92, 0.12);
  root.add(wingR);

  // ---------- Legs, knobbly knees, webbed feet ----------
  const footShape = new THREE.Shape();
  footShape.moveTo(0, -0.02);
  footShape.quadraticCurveTo(-0.08, 0.0, -0.1, 0.12);
  footShape.quadraticCurveTo(-0.05, 0.05, -0.02, 0.07);
  footShape.quadraticCurveTo(-0.01, 0.1, 0, 0.15);
  footShape.quadraticCurveTo(0.01, 0.1, 0.02, 0.07);
  footShape.quadraticCurveTo(0.05, 0.05, 0.1, 0.12);
  footShape.quadraticCurveTo(0.08, 0.0, 0, -0.02);
  const footGeo = new THREE.ShapeGeometry(footShape, 6);
  footGeo.rotateX(Math.PI / 2); // lay flat, toes point toward +Z

  for (const s of [1, -1]) {
    const x = 0.09 * s;
    const foot = new THREE.Vector3(x, 0.0, 0.03);
    const knee = new THREE.Vector3(x, 0.38, -0.03);
    const hip = new THREE.Vector3(x, 0.82, 0.03);

    // Webbed foot
    const f = new THREE.Mesh(footGeo, footMat);
    f.position.set(x, 0.003, 0.0);
    root.add(f);

    // Shank, knobbly knee, thigh
    root.add(limb(foot, knee, 0.014, 0.012, legMat));
    root.add(ball(knee.x, knee.y, knee.z, 0.026, legMat, 1, 1, 1, 14));
    root.add(ball(knee.x, knee.y + 0.005, knee.z - 0.006, 0.014, legMat, 1, 1, 1, 10)); // knobble bump
    root.add(limb(knee, hip, 0.02, 0.03, legMat));
  }

  // ---------- Shallow water and ripples ----------
  const waterGeo = new THREE.CircleGeometry(0.8, 48);
  waterGeo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -0.005;
  root.add(water);

  for (const [r, t] of [
    [0.16, 0.005],
    [0.27, 0.005],
  ] as const) {
    const ringGeo = new THREE.TorusGeometry(r, t, 6, 36);
    ringGeo.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, rippleMat);
    ring.position.set(0, 0.004, 0.02);
    root.add(ring);
  }

  // Real-world height: roughly 1.4 m
  root.scale.setScalar(0.8);

  return root;
}
