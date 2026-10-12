import * as THREE from "three";

export const meta = {
  name: "Elegant Flamingo",
  description:
    "A tall greater flamingo wading in shallow water: candy-pink body, coral wings tipped with black flight feathers, an S-curved neck, a bent pink-and-black beak, pale yellow eyes, and rose legs with knobbly knees and webbed feet.",
};

type Mat = THREE.MeshStandardMaterial;

const UP = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Seeded PRNG (mulberry32) so every build is identical. */
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

function mat(color: string, opts: THREE.MeshStandardMaterialParameters = {}): Mat {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0,
    flatShading: true,
    ...opts,
  });
}

/** Ellipsoid: a unit sphere scaled per axis, centred on pos. */
function ellipsoid(
  rx: number,
  ry: number,
  rz: number,
  pos: THREE.Vector3,
  m: Mat,
  w = 14,
  h = 10
): THREE.Mesh {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  const mesh = new THREE.Mesh(g, m);
  mesh.position.copy(pos);
  return mesh;
}

/** Tapered cylinder from a (radius ra) to b (radius rb). */
function limb(a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, m: Mat, radial = 7): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, radial, 1, false), m);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  return mesh;
}

/** Pointed leaf / feather: root at origin, runs toward -Z, width along Y, thickness along X. */
function leaf(L: number, W: number, T: number): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(L * 0.3, -W, L, 0);
  s.quadraticCurveTo(L * 0.3, W, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false, curveSegments: 8 });
  g.translate(0, 0, -T / 2);
  g.rotateY(Math.PI / 2);
  return g;
}

/** Tube that follows a polyline with a radius per point (parallel-transported frames). */
function tube(pts: THREE.Vector3[], radii: number[], radial: number, m: Mat): THREE.Mesh {
  const n = pts.length;
  const ring = radial + 1;
  const positions: number[] = [];
  const indices: number[] = [];
  let prev: THREE.Vector3 | null = null;

  for (let i = 0; i < n; i++) {
    const t = new THREE.Vector3()
      .subVectors(pts[Math.min(i + 1, n - 1)], pts[Math.max(i - 1, 0)])
      .normalize();
    let nrm: THREE.Vector3;
    if (prev === null) {
      const ref = Math.abs(t.y) < 0.9 ? UP : V(1, 0, 0);
      nrm = new THREE.Vector3().crossVectors(ref, t).normalize();
    } else {
      nrm = prev.clone().addScaledVector(t, -prev.dot(t)).normalize();
    }
    prev = nrm;
    const bin = new THREE.Vector3().crossVectors(t, nrm).normalize();
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const p = pts[i]
        .clone()
        .addScaledVector(nrm, Math.cos(a) * radii[i])
        .addScaledVector(bin, Math.sin(a) * radii[i]);
      positions.push(p.x, p.y, p.z);
    }
  }

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const A = i * ring + j;
      const B = A + 1;
      const C = A + ring;
      const D = C + 1;
      indices.push(A, B, C, B, D, C);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return new THREE.Mesh(g, m);
}

/** Webbed foot lying flat: heel at origin, three toes forward (+Z), top face at y = 0.016. */
function webbedFoot(sc: number): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(-0.05 * sc, 0.03 * sc);
  s.lineTo(-0.14 * sc, 0.11 * sc);
  s.quadraticCurveTo(-0.06 * sc, 0.06 * sc, 0, 0.17 * sc);
  s.quadraticCurveTo(0.06 * sc, 0.06 * sc, 0.14 * sc, 0.11 * sc);
  s.lineTo(0.05 * sc, 0.03 * sc);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false, curveSegments: 4 });
  g.rotateX(Math.PI / 2); // shape +Y -> +Z (toes forward), extrusion -> y in [-0.012, 0]
  g.translate(0, 0.016, 0);
  return g;
}

export default function createFlamingo(): THREE.Object3D {
  const rand = makeRng(7741);

  const M = {
    body: mat("#ff9ec4"), // candy pink
    blush: mat("#ffc6dc"), // paler chest and beak base
    coral: mat("#ff6e5a"), // wing coverts
    coralDeep: mat("#e8464f"), // inner coverts
    black: mat("#17141a"), // flight feathers, beak tip, pupils
    legs: mat("#e8648f"), // rose legs
    eye: mat("#f7e680", { roughness: 0.35 }), // pale yellow
    water: mat("#7fd7e2", { transparent: true, opacity: 0.5, depthWrite: false, roughness: 0.15 }),
    ripple: mat("#eefcff", { transparent: true, opacity: 0.7, depthWrite: false }),
    sand: mat("#e2c899"),
    pebble: mat("#a39a8c"),
    reed: mat("#7aa34d"),
  };

  const root = new THREE.Group();
  root.name = "flamingo";

  // ---------- Shallow pool: sandy bed, lip, water surface, pebbles, reeds ----------
  root.add(new THREE.Mesh(new THREE.CircleGeometry(0.9, 40).rotateX(-Math.PI / 2), M.sand));

  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.03, 6, 40).rotateX(Math.PI / 2), M.sand);
  lip.position.y = 0.016;
  root.add(lip);

  const surface = new THREE.Mesh(new THREE.CircleGeometry(0.88, 40).rotateX(-Math.PI / 2), M.water);
  surface.position.y = 0.02;
  surface.renderOrder = 1;
  root.add(surface);

  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.25 + rand() * 0.6;
    const rr = 0.015 + rand() * 0.01;
    const pebble = new THREE.Mesh(new THREE.IcosahedronGeometry(rr, 0), M.pebble);
    pebble.scale.y = 0.6;
    pebble.rotation.y = rand() * 3;
    pebble.position.set(Math.cos(a) * r, rr * 0.4, Math.sin(a) * r);
    root.add(pebble);
  }

  for (let i = 0; i < 6; i++) {
    const ang = Math.PI + 0.3 + rand() * (Math.PI - 0.6); // back half of the pool
    const rad = 0.72 + rand() * 0.12;
    const h = 0.38 + rand() * 0.3;
    const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.008, h, 5), M.reed);
    reed.position.set(Math.cos(ang) * rad, h / 2, Math.sin(ang) * rad);
    reed.rotation.set((rand() - 0.5) * 0.12, 0, (rand() - 0.5) * 0.12);
    root.add(reed);
  }

  // ---------- Body ----------
  const body = new THREE.Group();
  body.position.set(0, 0.84, 0);
  body.rotation.x = 0.15; // rear lifted slightly
  root.add(body);
  body.add(ellipsoid(0.125, 0.14, 0.23, V(0, 0, -0.02), M.body, 14, 10));
  body.add(ellipsoid(0.112, 0.128, 0.12, V(0, -0.03, 0.13), M.body, 12, 10));
  body.add(ellipsoid(0.1, 0.11, 0.1, V(0, 0.03, -0.22), M.body, 12, 8));
  body.add(ellipsoid(0.07, 0.085, 0.06, V(0, -0.04, 0.2), M.blush, 10, 8));

  const tail = new THREE.Mesh(leaf(0.17, 0.11, 0.03), M.body);
  tail.position.set(0, 0.03, -0.26);
  tail.rotation.x = 0.5;
  body.add(tail);

  // ---------- Wings: coral coverts, black flight-feather tips ----------
  for (const sx of [1, -1]) {
    const inner = new THREE.Mesh(leaf(0.4, 0.12, 0.034), M.coralDeep);
    inner.position.set(sx * 0.118, 0.885, 0.035);
    inner.rotation.x = -0.18;
    root.add(inner);

    const outer = new THREE.Mesh(leaf(0.46, 0.15, 0.036), M.coral);
    outer.position.set(sx * 0.14, 0.9, 0.07);
    outer.rotation.x = -0.16;
    root.add(outer);

    const lengths = [0.24, 0.26, 0.27, 0.25, 0.22];
    for (let i = 0; i < lengths.length; i++) {
      const f = new THREE.Mesh(leaf(lengths[i] * (0.97 + rand() * 0.06), 0.034, 0.012), M.black);
      f.position.set(sx * 0.168, 0.868 - 0.012 * i, -0.27 - 0.03 * i);
      f.rotation.x = -0.14 - 0.08 * i;
      root.add(f);
    }
  }

  // ---------- S-curved neck ----------
  const neckCurve = new THREE.CatmullRomCurve3(
    [
      V(0, 0.92, 0.1),
      V(0, 1.03, 0.2),
      V(0.008, 1.16, 0.23),
      V(0, 1.26, 0.11),
      V(-0.008, 1.34, 0.2),
      V(0, 1.39, 0.27),
    ],
    false,
    "catmullrom",
    0.5
  );
  const neckPts = neckCurve.getSpacedPoints(26);
  const neckR = neckPts.map((_, i) => 0.058 - 0.03 * (i / (neckPts.length - 1)));
  root.add(tube(neckPts, neckR, 9, M.body));

  // ---------- Head, eyes, bent beak ----------
  root.add(ellipsoid(0.045, 0.043, 0.062, V(0, 1.42, 0.31), M.body, 12, 9));

  for (const sx of [1, -1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0115, 8, 6), M.eye);
    eye.position.set(sx * 0.04, 1.43, 0.322);
    root.add(eye);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 6, 4), M.black);
    pupil.position.set(sx * 0.0475, 1.433, 0.337);
    root.add(pupil);
  }

  const beakCurve = new THREE.CatmullRomCurve3(
    [V(0, 1.41, 0.34), V(0, 1.398, 0.4), V(0, 1.36, 0.45), V(0, 1.3, 0.455), V(0, 1.245, 0.43)],
    false,
    "catmullrom",
    0.5
  );
  const beakPts = beakCurve.getSpacedPoints(16);
  const beakR = (i: number) => 0.024 * (1 - 0.65 * (i / 16));
  const cut = 10; // pink base up to here, black hooked tip after
  const pinkPts = beakPts.slice(0, cut + 1);
  const blackPts = beakPts.slice(cut);
  root.add(tube(pinkPts, pinkPts.map((_, i) => beakR(i)), 8, M.blush));
  root.add(tube(blackPts, blackPts.map((_, i) => beakR(cut + i)), 8, M.black));

  // ---------- Legs: feathered thigh, knobbly knee, rose shank, webbed foot ----------
  for (const sx of [1, -1]) {
    const hip = V(sx * 0.055, 0.74, -0.03);
    const knee = V(sx * 0.065, 0.43, -0.13);
    const heel = V(sx * 0.07, 0.016, 0.0);

    root.add(limb(hip, knee, 0.03, 0.021, M.body, 8));

    const knuckle = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), M.legs);
    knuckle.position.copy(knee);
    knuckle.scale.set(1.15, 0.95, 1.0);
    root.add(knuckle);

    const bump = new THREE.Mesh(new THREE.IcosahedronGeometry(0.017, 0), M.legs);
    bump.position.copy(knee).add(V(0, -0.012, -0.024));
    root.add(bump);

    root.add(limb(knee, heel, 0.019, 0.011, M.legs, 7));

    const foot = new THREE.Mesh(webbedFoot(0.95), M.legs);
    foot.position.set(sx * 0.07, 0, 0);
    root.add(foot);

    for (const r of [0.085, 0.14]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.003, 4, 28).rotateX(Math.PI / 2),
        M.ripple
      );
      ring.position.set(sx * 0.07, 0.027, 0);
      root.add(ring);
    }
  }

  return root;
}
