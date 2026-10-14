import * as THREE from "three";

export const meta = {
  name: "Panther Chameleon on a Twig",
  description:
    "Male panther chameleon walking a twig: turquoise head shading through lime to sunset-orange tail, white flank stripe, red bars, ridged casque, turret eyes looking two ways, mitten feet and a tight tail coil.",
};

type Key = [number, number, number]; // [distance along spine (m), rx, ry]

// Hermite-smoothed radius lookup along the spine (col 1 = rx, col 2 = ry)
function keyVal(keys: Key[], d: number, col: 1 | 2): number {
  const n = keys.length;
  if (d <= keys[0][0]) return keys[0][col];
  if (d >= keys[n - 1][0]) return keys[n - 1][col];
  let i = 0;
  while (keys[i + 1][0] < d) i++;
  const k0 = keys[i];
  const k1 = keys[i + 1];
  const h = k1[0] - k0[0];
  const slope = (j: number) => {
    const a = keys[Math.max(j - 1, 0)];
    const b = keys[Math.min(j + 1, n - 1)];
    return (b[col] - a[col]) / (b[0] - a[0]);
  };
  const m0 = slope(i) * h;
  const m1 = slope(i + 1) * h;
  const t = (d - k0[0]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  const v =
    (2 * t3 - 3 * t2 + 1) * k0[col] +
    (t3 - 2 * t2 + t) * m0 +
    (-2 * t3 + 3 * t2) * k1[col] +
    (t3 - t2) * m1;
  return Math.max(v, 0.0006);
}

export default function build(): THREE.Object3D {
  // seeded randomness: every build is identical
  let seed = 90210;
  const rnd = (): number => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const AXIS_X = V(1, 0, 0);
  const root = new THREE.Group();

  // ---------- materials (one per colour, shared) ----------
  const std = (color: string, roughness: number) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
  const matCasque = std("#17b5c6", 0.45);
  const matCrest = std("#f3d34c", 0.5);
  const matGold = std("#ffc534", 0.35);
  const matPupil = std("#101317", 0.3);
  const matLimb = std("#66c44b", 0.55);
  const matToe = std("#2d8c4f", 0.6);
  const matClaw = std("#1c2024", 0.4);
  const matLeaf = std("#2e7d3a", 0.7);

  const makeTex = (
    w: number,
    h: number,
    flipY: boolean,
    paint: (g: CanvasRenderingContext2D) => void
  ) => {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    paint(cv.getContext("2d")!);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = flipY;
    tex.anisotropy = 8;
    return tex;
  };

  // ---------- primitive helpers ----------
  const tube = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    r0: number,
    r1: number,
    mat: THREE.Material
  ) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 7, 1), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(UP, d.clone().normalize());
    return m;
  };
  const ball = (p: THREE.Vector3, r: number, mat: THREE.Material) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mat);
    m.position.copy(p);
    return m;
  };

  // ---------- spine: head -> trunk -> tail -> tight coil (one smooth curve) ----------
  const ctrl: THREE.Vector3[] = [
    V(0, 0.121, 0.125), // snout tip
    V(0, 0.122, 0.105),
    V(0, 0.123, 0.082), // head
    V(0, 0.120, 0.058), // back of casque
    V(0, 0.115, 0.03), // neck
    V(0, 0.112, 0.0), // trunk
    V(0, 0.110, -0.03),
    V(0, 0.107, -0.06), // vent
    V(0, 0.106, -0.1), // tail root
  ];
  const CY = 0.074; // coil centre height (clears the twig)
  const CZ = -0.15; // coil centre depth
  const TURNS = 1.75;
  const KC = 80;
  for (let k = 0; k <= KC; k++) {
    const t = k / KC;
    const th = Math.PI / 2 + t * TURNS * Math.PI * 2;
    const R = 0.03 - 0.013 * t;
    ctrl.push(V(-0.025 + 0.05 * t, CY + R * Math.sin(th), CZ + R * Math.cos(th)));
  }
  const curve = new THREE.CatmullRomCurve3(ctrl, false, "centripetal");
  const Ltot = curve.getLength();

  // radius profile along arc length (metres from the snout tip)
  const keys: Key[] = [
    [0.0, 0.0008, 0.0008], // snout tip (closed)
    [0.006, 0.0095, 0.0105],
    [0.02, 0.0165, 0.0175],
    [0.04, 0.0205, 0.0215], // widest head, eye level
    [0.06, 0.0195, 0.0205],
    [0.085, 0.0155, 0.0175], // neck
    [0.105, 0.0185, 0.0235], // shoulders
    [0.13, 0.0215, 0.0285], // trunk, laterally compressed
    [0.16, 0.0205, 0.0272],
    [0.187, 0.015, 0.0192], // vent
    [0.23, 0.0098, 0.0102], // tail root
    [0.32, 0.0086, 0.0086],
    [Ltot - 0.1, 0.0064, 0.0064],
    [Ltot - 0.02, 0.0038, 0.0038],
    [Ltot, 0.0008, 0.0008], // tail tip (closed)
  ];

  // rings along the spine: frame = lateral (+X, orthogonalised) and up (V)
  const N = 150;
  const P: THREE.Vector3[] = [];
  const T: THREE.Vector3[] = [];
  const Lf: THREE.Vector3[] = [];
  const Vf: THREE.Vector3[] = [];
  const D: number[] = [];
  const RX: number[] = [];
  const RY: number[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const t = curve.getTangentAt(u).normalize();
    const l = AXIS_X.clone().addScaledVector(t, -AXIS_X.dot(t)).normalize();
    const v = new THREE.Vector3().crossVectors(l, t).normalize();
    const d = u * Ltot;
    P.push(curve.getPointAt(u));
    T.push(t);
    Lf.push(l);
    Vf.push(v);
    D.push(d);
    RX.push(keyVal(keys, d, 1));
    RY.push(keyVal(keys, d, 2));
  }

  // ---------- body skin texture: gradient, granules, white stripe, red bars ----------
  const bodyTex = makeTex(512, 1024, false, (g) => {
    const W = 512;
    const H = 1024;
    const grad = g.createLinearGradient(0, 0, 0, H);
    const stops: [number, string][] = [
      [0.0, "#12b8c8"],
      [0.1, "#1bbfb8"],
      [0.22, "#3fcb7a"],
      [0.34, "#6fd64a"],
      [0.5, "#9cdc38"],
      [0.66, "#c9d63a"],
      [0.8, "#f5a33a"],
      [1.0, "#ff6428"],
    ];
    for (const [o, c] of stops) grad.addColorStop(o, c);
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    // lighter belly band (u = 0.5)
    g.fillStyle = "rgba(255,252,210,0.16)";
    g.fillRect(W * 0.36, 0, W * 0.28, H);

    // fine skin granules
    for (let i = 0; i < 3000; i++) {
      g.fillStyle = rnd() < 0.5 ? "rgba(0,50,30,0.10)" : "rgba(255,255,230,0.12)";
      g.fillRect(rnd() * W, rnd() * H, 1.6, 1.6);
    }

    // white lateral stripe on both flanks, tapering into the tail
    g.fillStyle = "#f6f1d8";
    for (let y = 0; y < H; y++) {
      const v = y / H;
      let w = 0;
      if (v < 0.12) w = Math.max(0, (v - 0.03) / 0.09);
      else if (v <= 0.4) w = 1;
      else if (v < 0.62) w = 1 - ((v - 0.4) / 0.22) * 0.8;
      if (w <= 0) continue;
      const ww = 0.03 * w * W;
      for (const uc of [0.205, 0.795]) g.fillRect(uc * W - ww / 2, y, ww, 1);
    }

    // red bars crossing the flanks below the stripe
    for (let k = 0; k < 9; k++) {
      const d = 0.092 + k * 0.015;
      const cy = (d / Ltot) * H;
      const ry = (0.006 / Ltot) * H;
      for (const uc of [0.3, 0.7]) {
        const cx = uc * W;
        const rx = 0.072 * W;
        g.beginPath();
        g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        g.fillStyle = "#b51d20";
        g.fill();
        g.beginPath();
        g.ellipse(cx, cy, rx - 3, ry - 2.5, 0, 0, Math.PI * 2);
        g.fillStyle = "#e8372d";
        g.fill();
      }
    }
  });

  // ---------- body loft: head, trunk, tail and coil as one tapered tube ----------
  const SEG = 14;
  const pos: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const p = P[i];
    const l = Lf[i];
    const v = Vf[i];
    for (let j = 0; j <= SEG; j++) {
      const a = (j / SEG) * Math.PI * 2;
      const s = Math.sin(a) * RX[i];
      const c = Math.cos(a) * RY[i];
      pos.push(p.x + l.x * s + v.x * c, p.y + l.y * s + v.y * c, p.z + l.z * s + v.z * c);
      uvs.push(j / SEG, D[i] / Ltot);
    }
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < SEG; j++) {
      const a = i * (SEG + 1) + j;
      const b = a + SEG + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const bodyGeo = new THREE.BufferGeometry();
  bodyGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  bodyGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  bodyGeo.setIndex(idx);
  bodyGeo.computeVertexNormals();
  {
    // hide the UV seam in shading by averaging normals across it
    const nrm = bodyGeo.getAttribute("normal") as THREE.BufferAttribute;
    for (let i = 0; i <= N; i++) {
      const a = i * (SEG + 1);
      const b = a + SEG;
      const x = nrm.getX(a) + nrm.getX(b);
      const y = nrm.getY(a) + nrm.getY(b);
      const z = nrm.getZ(a) + nrm.getZ(b);
      const len = Math.hypot(x, y, z) || 1;
      nrm.setXYZ(a, x / len, y / len, z / len);
      nrm.setXYZ(b, x / len, y / len, z / len);
    }
    nrm.needsUpdate = true;
  }
  root.add(
    new THREE.Mesh(
      bodyGeo,
      new THREE.MeshStandardMaterial({ map: bodyTex, roughness: 0.5, metalness: 0 })
    )
  );

  // ---------- casque with a ridged crest ----------
  const CAS_C = V(0, 0.1405, 0.078);
  const casque = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), matCasque);
  casque.scale.set(0.0165, 0.0115, 0.042);
  casque.position.copy(CAS_C);
  casque.rotation.x = 0.22; // back of the helmet sits higher
  root.add(casque);

  const casqueTop = (z: number) => {
    const dz = z - CAS_C.z;
    const e = Math.max(0, 1 - (dz / 0.042) * (dz / 0.042));
    return CAS_C.y + 0.0115 * Math.sqrt(e) - dz * 0.22;
  };
  const casqueNormal = V(0, 1, 0.22).normalize();
  const casqueQ = new THREE.Quaternion().setFromUnitVectors(UP, casqueNormal);
  const ridge: [number, number][] = [
    [0.104, 0.0065],
    [0.09, 0.0095],
    [0.076, 0.0105],
    [0.062, 0.0095],
    [0.048, 0.0075],
  ];
  for (const [z, h] of ridge) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.0036, h, 5), matCrest);
    cone.quaternion.copy(casqueQ);
    cone.position
      .copy(V(0, casqueTop(z) - 0.002, z))
      .addScaledVector(casqueNormal, h / 2);
    root.add(cone);
  }

  // ---------- dorsal crest along neck, trunk and vent ----------
  const spikeD = [0.074, 0.087, 0.1, 0.113, 0.126, 0.139, 0.152, 0.165, 0.178, 0.19];
  spikeD.forEach((d, k) => {
    const i = Math.round((d / Ltot) * N);
    const h = 0.0115 - k * 0.00045;
    const dir = Vf[i].clone().addScaledVector(T[i], 0.3).normalize(); // leans back
    const base = P[i].clone().addScaledVector(Vf[i], RY[i] * 0.9);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.0036, h, 5), matCrest);
    cone.quaternion.setFromUnitVectors(UP, dir);
    cone.position.copy(base).addScaledVector(dir, h / 2 - 0.002);
    root.add(cone);
  });

  // ---------- turret eyes: one forward, one back and up ----------
  const turretEye = (base: THREE.Vector3, dirIn: THREE.Vector3) => {
    const d = dirIn.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(UP, d);
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, t: number) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(base).addScaledVector(d, t);
      m.quaternion.copy(q);
      root.add(m);
    };
    add(new THREE.CylinderGeometry(0.0064, 0.0088, 0.014, 12), matCasque, 0.007);
    add(new THREE.CylinderGeometry(0.0072, 0.0072, 0.0026, 12), matGold, 0.0137);
    add(new THREE.CylinderGeometry(0.0035, 0.0035, 0.0018, 10), matPupil, 0.015);
  };
  turretEye(V(0.0165, 0.128, 0.097), V(0.55, 0.2, 0.8));
  turretEye(V(-0.0165, 0.128, 0.097), V(-0.75, 0.5, -0.45));

  // ---------- mitten feet: two toe bundles wrapping the twig ----------
  const toes = (zF: number, s: number, dzs: number[]) => {
    for (const dz of dzs) {
      const pts = [10, 40, 70, 100].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return V(s * 0.0162 * Math.sin(a), 0.013 + 0.0162 * Math.cos(a), zF + dz);
      });
      root.add(tube(pts[0], pts[1], 0.0024, 0.0023, matToe));
      root.add(tube(pts[1], pts[2], 0.0023, 0.0022, matToe));
      root.add(tube(pts[2], pts[3], 0.0022, 0.002, matToe));
      root.add(ball(pts[3], 0.0019, matClaw));
    }
  };

  const addLeg = (S: THREE.Vector3, E: THREE.Vector3, W: THREE.Vector3, zF: number) => {
    const F = V(0, 0.0325, zF); // palm centre, resting on the twig
    root.add(tube(S, E, 0.0068, 0.0058, matLimb));
    root.add(tube(E, W, 0.0058, 0.0045, matLimb));
    root.add(tube(W, F, 0.0046, 0.0044, matLimb));
    root.add(ball(S, 0.0072, matLimb));
    root.add(ball(E, 0.0062, matLimb));
    root.add(ball(W, 0.0049, matLimb));
    const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), matLimb);
    palm.scale.set(0.0085, 0.0068, 0.0125);
    palm.position.copy(F);
    root.add(palm);
    toes(zF, 1, [-0.0038, 0.0038]); // 2-toe bundle on one side
    toes(zF, -1, [-0.0065, 0, 0.0065]); // 3-toe bundle on the other
  };
  // left front reaches forward, right front trails, hind feet step
  addLeg(V(0.013, 0.102, 0.04), V(0.036, 0.068, 0.07), V(0.012, 0.043, 0.091), 0.095);
  addLeg(V(-0.013, 0.102, 0.04), V(-0.034, 0.066, 0.022), V(-0.011, 0.043, 0.034), 0.03);
  addLeg(V(0.015, 0.1, -0.02), V(0.037, 0.07, -0.036), V(0.011, 0.043, -0.05), -0.055);
  addLeg(V(-0.015, 0.1, -0.02), V(-0.036, 0.066, -0.074), V(-0.011, 0.043, -0.1), -0.105);

  // ---------- twig: bark-textured branch lying on the floor ----------
  const barkTex = makeTex(64, 256, true, (g) => {
    g.fillStyle = "#7d5b3b";
    g.fillRect(0, 0, 64, 256);
    for (let i = 0; i < 90; i++) {
      g.fillStyle = rnd() < 0.55 ? "rgba(35,22,12,0.45)" : "rgba(205,165,118,0.28)";
      g.fillRect(rnd() * 64, 0, 1 + rnd() * 2.2, 256);
    }
  });
  barkTex.wrapS = THREE.RepeatWrapping;
  barkTex.wrapT = THREE.RepeatWrapping;
  barkTex.repeat.set(1, 3);
  const matBark = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.9, metalness: 0 });

  const twigGeo = new THREE.CylinderGeometry(0.013, 0.012, 0.78, 9, 1, false);
  twigGeo.rotateX(Math.PI / 2); // axis along Z
  const twig = new THREE.Mesh(twigGeo, matBark);
  twig.position.set(0, 0.013, -0.02);
  root.add(twig);

  // knots
  for (const z of [-0.3, 0.31]) {
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.0158, 9, 6), matBark);
    knot.scale.set(1, 0.95, 1.35);
    knot.position.set(0, 0.0158, z);
    root.add(knot);
  }

  // side stubs with leaves, one each side for balance
  const leafGeo = new THREE.SphereGeometry(1, 12, 8);
  leafGeo.scale(0.011, 0.0013, 0.032);
  const leafAt = (center: THREE.Vector3, longDir: THREE.Vector3) => {
    const z = longDir.clone().normalize();
    const x = new THREE.Vector3().crossVectors(UP, z).normalize();
    const y = new THREE.Vector3().crossVectors(z, x).normalize();
    const m = new THREE.Mesh(leafGeo, matLeaf);
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    m.position.copy(center);
    root.add(m);
  };
  const stub = (start: THREE.Vector3, dirIn: THREE.Vector3, len: number) => {
    const d = dirIn.clone().normalize();
    const end = start.clone().addScaledVector(d, len);
    root.add(tube(start, end, 0.0048, 0.0032, matBark));
    return end;
  };

  const tipA = stub(V(0, 0.016, 0.205), V(-0.75, 0.55, 0.35), 0.075);
  leafAt(tipA.clone().addScaledVector(V(-0.5, 0.3, 0.8).normalize(), 0.028), V(-0.5, 0.3, 0.8));
  leafAt(tipA.clone().addScaledVector(V(-0.9, 0.25, -0.2).normalize(), 0.03), V(-0.9, 0.25, -0.2));

  const tipB = stub(V(0, 0.016, -0.27), V(0.7, 0.55, -0.25), 0.05);
  leafAt(tipB.clone().addScaledVector(V(0.4, 0.35, -0.85).normalize(), 0.03), V(0.4, 0.35, -0.85));

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return root;
}
