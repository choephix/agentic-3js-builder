```ts
import * as THREE from "three";

export const meta = {
  name: "African elephant",
  description:
    "A stylised African bush elephant at rest: domed head, big fanned ears, a curled trunk, ivory tusks and a tufted tail.",
};

// ---------- palette: one material per colour, shared ----------
const skinMat = new THREE.MeshStandardMaterial({ color: 0x8e9199, roughness: 0.92, flatShading: true });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x5b5e67, roughness: 0.92, flatShading: true });
const pinkMat = new THREE.MeshStandardMaterial({
  color: 0xd9a19b,
  roughness: 0.7,
  flatShading: true,
  side: THREE.DoubleSide,
});
const ivoryMat = new THREE.MeshStandardMaterial({ color: 0xf2ead5, roughness: 0.4, flatShading: true });
const eyeMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.35 });
const glintMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, emissive: 0x333333 });
const tuftMat = new THREE.MeshStandardMaterial({ color: 0x4a3c34, roughness: 1, flatShading: true });

// ---------- helpers ----------

// Ellipsoid: a unit sphere scaled to radii and moved to a position.
function blob(
  rad: [number, number, number],
  pos: [number, number, number],
  mat: THREE.Material,
  seg = 14,
): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(1, seg, Math.max(6, Math.round(seg * 0.7))),
    mat,
  );
  m.scale.set(rad[0], rad[1], rad[2]);
  m.position.set(pos[0], pos[1], pos[2]);
  return m;
}

// Tapered tube swept along a smooth curve. Radii are spread evenly over the control points.
function sweep(pts: THREE.Vector3[], radii: number[], rings: number, seg: number): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  const xAxis = new THREE.Vector3(1, 0, 0);
  const yAxis = new THREE.Vector3(0, 1, 0);
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const p = curve.getPoint(t);
    const T = curve.getTangent(t).normalize();
    const ref = Math.abs(T.dot(xAxis)) > 0.9 ? yAxis : xAxis;
    const B = new THREE.Vector3().crossVectors(T, ref).normalize();
    const N = new THREE.Vector3().crossVectors(B, T).normalize();
    const f = t * (radii.length - 1);
    const k = Math.min(Math.floor(f), radii.length - 2);
    const r = THREE.MathUtils.lerp(radii[k], radii[k + 1], f - k);
    for (let j = 0; j < seg; j++) {
      const a = (j / seg) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      positions.push(
        p.x + (N.x * c + B.x * s) * r,
        p.y + (N.y * c + B.y * s) * r,
        p.z + (N.z * c + B.z * s) * r,
      );
    }
  }

  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * seg + j;
      const b = i * seg + ((j + 1) % seg);
      const c = (i + 1) * seg + j;
      const d = (i + 1) * seg + ((j + 1) % seg);
      indices.push(a, b, c, b, d, c);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

// ---------- shared ear geometry ----------
const earShape = new THREE.Shape();
earShape.moveTo(0, 0.62);
earShape.bezierCurveTo(0.42, 0.62, 0.55, 0.25, 0.5, -0.1);
earShape.bezierCurveTo(0.46, -0.45, 0.22, -0.62, 0, -0.6);
earShape.bezierCurveTo(-0.22, -0.62, -0.46, -0.45, -0.5, -0.1);
earShape.bezierCurveTo(-0.55, 0.25, -0.42, 0.62, 0, 0.62);

const earGeo = new THREE.ExtrudeGeometry(earShape, {
  depth: 0.04,
  bevelEnabled: true,
  bevelThickness: 0.02,
  bevelSize: 0.03,
  bevelSegments: 2,
  curveSegments: 10,
});
const earInnerGeo = new THREE.ShapeGeometry(earShape, 10);

function ear(side: number): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(earGeo, skinMat));

  // pink inner face, sitting just on the head-facing side of the flap
  const inner = new THREE.Mesh(earInnerGeo, pinkMat);
  inner.position.z = -0.03;
  inner.scale.set(0.78, 0.8, 1);
  g.add(inner);

  g.position.set(side * 0.68, 2.42, 1.28);
  // flare outward and slightly forward
  g.rotation.y = side * (Math.PI / 2 - 0.35);
  return g;
}

// ---------- legs ----------
function leg(x: number, z: number, nails: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  // column leg, slightly wider at the top
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.23, 1.27, 10), skinMat);
  column.position.y = 0.815;
  g.add(column);

  // shoulder/hip joint ball, rounds off the top of the column
  g.add(blob([0.3, 0.3, 0.3], [0, 1.45, 0], skinMat, 10));

  // skin fold around the leg
  const fold = new THREE.Mesh(new THREE.TorusGeometry(0.275, 0.024, 6, 12), darkMat);
  fold.rotation.x = Math.PI / 2;
  fold.position.y = 0.95;
  g.add(fold);

  // flat, round foot
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.24, 10), darkMat);
  foot.position.y = 0.12;
  g.add(foot);

  // toenails across the front of the foot (4 on the fore feet, 3 on the hind feet)
  for (let i = 0; i < nails; i++) {
    const u = nails === 1 ? 0 : (i / (nails - 1)) * 2 - 1;
    const nx = u * 0.18;
    const nz = Math.sqrt(0.28 * 0.28 - nx * nx);
    g.add(blob([0.055, 0.05, 0.045], [nx, 0.07, nz], ivoryMat, 8));
  }
  return g;
}

// ---------- model ----------
export default function createElephant(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "elephant";

  // body: chest, middle and rump blended with a neck
  root.add(blob([0.9, 1.0, 0.85], [0, 2.05, 0.5], skinMat));
  root.add(blob([0.88, 0.98, 0.62], [0, 2.0, -0.35], skinMat));
  root.add(blob([0.92, 0.96, 0.85], [0, 2.02, -0.9], skinMat));
  root.add(blob([0.7, 0.7, 0.5], [0, 2.45, 0.95], skinMat));

  // head with a domed forehead
  root.add(blob([0.74, 0.76, 0.7], [0, 2.4, 1.45], skinMat, 16));
  root.add(blob([0.5, 0.32, 0.45], [0, 2.98, 1.5], skinMat));

  // small eyes with a glint
  for (const s of [1, -1]) {
    root.add(blob([0.065, 0.065, 0.065], [s * 0.5, 2.5, 1.93], eyeMat, 10));
    root.add(blob([0.018, 0.018, 0.018], [s * 0.5 + s * 0.02, 2.52, 1.99], glintMat, 6));
  }

  // trunk: hangs from the face and curls up at the tip
  const trunkPts = [
    new THREE.Vector3(0, 2.32, 1.95),
    new THREE.Vector3(0, 2.0, 2.3),
    new THREE.Vector3(0, 1.6, 2.5),
    new THREE.Vector3(0, 1.2, 2.6),
    new THREE.Vector3(0, 0.86, 2.7),
    new THREE.Vector3(0.02, 0.6, 2.82),
    new THREE.Vector3(0.06, 0.52, 2.95),
    new THREE.Vector3(0.04, 0.6, 3.02),
  ];
  const trunkRadii = [0.36, 0.3, 0.24, 0.2, 0.17, 0.15, 0.13, 0.12];
  root.add(new THREE.Mesh(sweep(trunkPts, trunkRadii, 16, 10), skinMat));

  // rounded tip and two finger-like nubs
  const tip = trunkPts[trunkPts.length - 1];
  root.add(blob([0.12, 0.12, 0.12], [tip.x, tip.y, tip.z], skinMat, 10));
  for (const s of [1, -1]) {
    root.add(blob([0.045, 0.04, 0.045], [tip.x + s * 0.05, tip.y + 0.07, tip.z + 0.05], darkMat, 8));
  }

  // ivory tusks, sweeping out and curling up
  for (const s of [1, -1]) {
    const tuskPts = [
      new THREE.Vector3(s * 0.26, 1.85, 1.85),
      new THREE.Vector3(s * 0.36, 1.7, 2.2),
      new THREE.Vector3(s * 0.5, 1.5, 2.45),
      new THREE.Vector3(s * 0.6, 1.4, 2.6),
      new THREE.Vector3(s * 0.62, 1.5, 2.7),
    ];
    root.add(new THREE.Mesh(sweep(tuskPts, [0.1, 0.085, 0.065, 0.045, 0.012], 10, 7), ivoryMat));
  }

  // big fanned ears with pink inner faces
  root.add(ear(1));
  root.add(ear(-1));

  // four columnar legs: fore feet carry 4 nails, hind feet carry 3
  root.add(leg(0.5, 0.95, 4));
  root.add(leg(-0.5, 0.95, 4));
  root.add(leg(0.5, -1.05, 3));
  root.add(leg(-0.5, -1.05, 3));

  // tail: thin, hanging from the rump, with a tuft at the end
  const tailPts = [
    new THREE.Vector3(0, 2.45, -1.5),
    new THREE.Vector3(0, 2.2, -1.8),
    new THREE.Vector3(0, 1.75, -1.92),
    new THREE.Vector3(0, 1.3, -1.9),
    new THREE.Vector3(0, 0.98, -1.87),
  ];
  root.add(new THREE.Mesh(sweep(tailPts, [0.1, 0.085, 0.065, 0.05, 0.035], 12, 6), skinMat));
  root.add(blob([0.065, 0.14, 0.065], [0, 0.9, -1.87], tuftMat, 8));

  return root;
}
```