import * as THREE from "three";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A long-legged unicorn foal built from faceted primitives: a starry dappled cream coat, a pastel rainbow brush mane and tail, a pearl horn bud wrapped in a gold ribbon spiral, big violet eyes with lashes, knobby knees, lilac socks and gold-rimmed hooves.",
};

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

type V3 = [number, number, number];

export default function createUnicornFoal(): THREE.Object3D {
  const rand = makeRng(20240611);
  const root = new THREE.Group();
  root.name = "UnicornFoal";

  // ---------- materials ----------
  const matCache = new Map<string, THREE.MeshStandardMaterial>();
  const M = (color: string, rough = 0.8, metal = 0, emissive = "#000000", ei = 0) => {
    const key = color;
    let m = matCache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: rough,
        metalness: metal,
        emissive,
        emissiveIntensity: ei,
        flatShading: true,
      });
      matCache.set(key, m);
    }
    return m;
  };

  // Coat texture: soft lavender belly gradient, pink dapples, tiny star sparkles
  let coatMap: THREE.Texture | null = null;
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, "#fffbff");
      grad.addColorStop(0.5, "#fdf5ff");
      grad.addColorStop(1, "#e6d8ff");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 46; i++) {
        const x = rand() * 256;
        const y = 50 + rand() * 170;
        const r = 5 + rand() * 13;
        ctx.fillStyle = `rgba(255,${205 + Math.floor(rand() * 30)},236,0.38)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      const star = (x: number, y: number, r: number, col: string) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const a = (k * Math.PI) / 4;
          const rr = k % 2 === 0 ? r : r * 0.28;
          ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
      };
      for (let i = 0; i < 34; i++) {
        star(
          rand() * 256,
          30 + rand() * 190,
          3 + rand() * 5,
          rand() < 0.55 ? "rgba(255,200,110,0.9)" : "rgba(186,150,255,0.85)"
        );
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      coatMap = tex;
    }
  }
  const coat = new THREE.MeshStandardMaterial({
    color: coatMap ? "#ffffff" : "#fcf6ff",
    map: coatMap,
    roughness: 0.72,
    flatShading: true,
  });

  const sock = M("#e3d6ff", 0.75);
  const hoofMat = M("#a98fe0", 0.45, 0.1);
  const gold = M("#f4c35e", 0.3, 0.65, "#7a4a00", 0.15);
  const pearl = M("#fff3f9", 0.3, 0.15, "#ffd9ec", 0.18);
  const muzzleMat = M("#ffd3e2", 0.7);
  const nostrilMat = M("#b5527e", 0.6);
  const eyeDark = M("#2b1840", 0.25);
  const irisMat = M("#8a5ad6", 0.25, 0, "#4a2290", 0.25);
  const shine = M("#ffffff", 0.2, 0, "#ffffff", 0.6);
  const earInner = M("#ffb0cb", 0.7);
  const blushMat = M("#ff98bd", 0.8);
  const featherMat = M("#ffe4f1", 0.85);
  const bowMat = M("#ff5c9d", 0.5);
  const flowerWhite = M("#fffdf4", 0.7);
  const flowerCenter = M("#ffcf3f", 0.5, 0, "#ff9a00", 0.2);

  const rainbow = [
    M("#ff9ec7", 0.6),
    M("#ffbf94", 0.6),
    M("#ffe68f", 0.6),
    M("#9fe8c4", 0.6),
    M("#98ccff", 0.6),
    M("#c2a3ff", 0.6),
  ];

  // ---------- shared geometry ----------
  const sph8 = new THREE.SphereGeometry(1, 8, 6);
  const sph10 = new THREE.SphereGeometry(1, 10, 8);
  const cone5 = new THREE.ConeGeometry(1, 1, 5);
  const cone4 = new THREE.ConeGeometry(1, 1, 4);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const Yup = new THREE.Vector3(0, 1, 0);

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    parent: THREE.Object3D,
    p: V3 | THREE.Vector3,
    r: V3 = [0, 0, 0],
    s: V3 = [1, 1, 1]
  ) => {
    const m = new THREE.Mesh(geo, mat);
    if (p instanceof THREE.Vector3) m.position.copy(p);
    else m.position.set(p[0], p[1], p[2]);
    m.rotation.set(r[0], r[1], r[2]);
    m.scale.set(s[0], s[1], s[2]);
    parent.add(m);
    return m;
  };

  // Cylinder between two points (ra at a, rb at b)
  const seg = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    ra: number,
    rb: number,
    mat: THREE.Material,
    parent: THREE.Object3D = root,
    radial = 7,
    sx = 1
  ) => {
    const dir = new THREE.Vector3().subVectors(a, b);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(ra, rb, len, radial, 1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.addVectors(a, b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(Yup, dir.normalize());
    mesh.scale.x = sx;
    parent.add(mesh);
    return mesh;
  };

  // Cone whose base sits at `base`, pointing along `dir`
  const coneAlong = (
    mat: THREE.Material,
    parent: THREE.Object3D,
    base: THREE.Vector3,
    dir: THREE.Vector3,
    r: number,
    len: number,
    geo: THREE.BufferGeometry = cone5
  ) => {
    const d = dir.clone().normalize();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(base).addScaledVector(d, len / 2);
    mesh.quaternion.setFromUnitVectors(Yup, d);
    mesh.scale.set(r, len, r);
    parent.add(mesh);
    return mesh;
  };

  // ---------- body ----------
  add(sph10, coat, root, [0, 0.8, -0.02], [0, 0, 0], [0.165, 0.175, 0.3]); // barrel
  add(sph10, coat, root, [0, 0.82, 0.2], [0, 0, 0], [0.155, 0.18, 0.16]); // chest
  add(sph10, coat, root, [0, 0.84, -0.25], [0, 0, 0], [0.172, 0.18, 0.19]); // rump

  // fuzzy chest tuft
  for (let i = -1; i <= 1; i++) {
    coneAlong(coat, root, V(i * 0.035, 0.76, 0.33), V(i * 0.3, -1, 0.5), 0.03, 0.08, cone4);
  }

  // ---------- legs ----------
  const leg = (s: number, front: boolean) => {
    const x = s * (front ? 0.094 : 0.098);
    let top: THREE.Vector3, joint: THREE.Vector3, fet: THREE.Vector3, hoofZ: number;
    if (front) {
      add(sph10, coat, root, [s * 0.1, 0.76, 0.21], [0, 0, 0], [0.068, 0.14, 0.095]);
      top = V(s * 0.097, 0.7, 0.225);
      joint = V(x, 0.43, 0.24);
      fet = V(x, 0.125, 0.245);
      hoofZ = 0.255;
    } else {
      add(sph10, coat, root, [s * 0.105, 0.8, -0.28], [0, 0, 0], [0.078, 0.16, 0.125]);
      top = V(s * 0.1, 0.72, -0.29);
      joint = V(x, 0.46, -0.355);
      fet = V(x, 0.125, -0.305);
      hoofZ = -0.295;
    }
    seg(top, joint, 0.056, 0.036, coat);
    add(sph8, coat, root, joint, [0, 0, 0], [0.042, 0.046, 0.044]); // knobby knee / hock
    // sock cuff
    add(new THREE.TorusGeometry(0.033, 0.011, 4, 9), sock, root, V(x, joint.y - 0.05, joint.z + (fet.z - joint.z) * 0.15), [Math.PI / 2, 0, 0]);
    seg(joint, fet, 0.03, 0.026, sock);
    add(sph8, sock, root, fet, [0, 0, 0], [0.034, 0.034, 0.036]);
    const pasternEnd = V(x, 0.07, hoofZ);
    seg(fet, pasternEnd, 0.028, 0.034, sock);

    // fetlock feathering
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + 0.3;
      coneAlong(
        featherMat,
        root,
        V(x + Math.cos(a) * 0.024, 0.108, (fet.z + hoofZ) / 2 + Math.sin(a) * 0.024),
        V(Math.cos(a) * 0.5, -1, Math.sin(a) * 0.5),
        0.017,
        0.055,
        cone4
      );
    }
    // gold coronet + lilac hoof
    add(new THREE.TorusGeometry(0.04, 0.009, 4, 10), gold, root, V(x, 0.068, hoofZ), [Math.PI / 2, 0, 0]);
    add(new THREE.CylinderGeometry(0.037, 0.047, 0.066, 8), hoofMat, root, V(x, 0.033, hoofZ));
  };
  leg(1, true);
  leg(-1, true);
  leg(1, false);
  leg(-1, false);

  // ---------- neck ----------
  const neckTop = V(0, 1.27, 0.42);
  const neckBot = V(0, 0.9, 0.2);
  seg(neckTop, neckBot, 0.07, 0.11, coat, root, 8, 0.78);
  const nd = new THREE.Vector3().subVectors(neckTop, neckBot);
  const neckLen = nd.length();
  nd.normalize();
  const nBack = V(0, nd.z, -nd.y); // up-and-back perpendicular

  // rainbow brush mane (pink at the poll -> lavender at the withers)
  const N = 11;
  const X = V(1, 0, 0);
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const t = 0.12 + f * 0.98;
    const r = 0.11 + (0.07 - 0.11) * Math.min(t, 1);
    const p = neckBot.clone().addScaledVector(nd, neckLen * t).addScaledVector(nBack, r * 0.8);
    const o = nBack.clone().multiplyScalar(0.85).addScaledVector(nd, -0.35).normalize();
    const mat = rainbow[Math.min(5, Math.floor((1 - f) * 6))];
    const size = 1 + 0.15 * Math.sin(f * Math.PI) + (rand() - 0.5) * 0.12;
    coneAlong(mat, root, p.clone().addScaledVector(o, -0.02), o, 0.042 * size, 0.115 * size);
    for (const side of [-1, 1]) {
      const sd = o.clone().addScaledVector(X, side * 0.55).normalize();
      coneAlong(
        mat,
        root,
        p.clone().addScaledVector(X, side * 0.024).addScaledVector(o, -0.02),
        sd,
        0.034 * size,
        0.09 * size
      );
    }
  }

  // ---------- head ----------
  const head = new THREE.Group();
  head.position.set(0, 1.32, 0.47);
  head.rotation.set(0.15, 0.1, -0.06);
  root.add(head);

  add(sph10, coat, head, [0, 0, 0], [0, 0, 0], [0.1, 0.105, 0.115]); // cranium
  const muzzle = add(
    new THREE.CylinderGeometry(0.06, 0.08, 0.2, 8),
    coat,
    head,
    [0, -0.045, 0.11],
    [Math.PI / 2 + 0.2, 0, 0]
  );
  muzzle.scale.x = 0.85;
  add(sph10, muzzleMat, head, [0, -0.068, 0.205], [0, 0, 0], [0.062, 0.058, 0.055]); // soft pink nose
  for (const s of [1, -1]) {
    add(sph8, nostrilMat, head, [s * 0.027, -0.056, 0.25], [0, s * 0.4, 0], [0.012, 0.008, 0.006]);
  }
  // little smile
  add(new THREE.TorusGeometry(0.02, 0.0035, 4, 8, Math.PI), nostrilMat, head, [0, -0.09, 0.247], [-0.3, 0, Math.PI]);

  // eyes
  for (const s of [1, -1]) {
    const phi = 0.4;
    const rotY = -s * phi;
    const n = V(s * Math.cos(phi), 0, Math.sin(phi));
    const tb = V(s * Math.sin(phi), 0, -Math.cos(phi)); // toward back corner
    const c = V(s * 0.084, 0.018, 0.055);
    add(sph10, eyeDark, head, c, [0, rotY, 0], [0.015, 0.04, 0.036]);
    add(
      sph10,
      irisMat,
      head,
      c.clone().addScaledVector(n, 0.007).add(V(0, -0.006, 0)),
      [0, rotY, 0],
      [0.011, 0.027, 0.023]
    );
    add(sph8, eyeDark, head, c.clone().addScaledVector(n, 0.011).add(V(0, -0.004, 0)), [0, rotY, 0], [0.009, 0.016, 0.013]);
    add(sph8, shine, head, c.clone().addScaledVector(n, 0.017).addScaledVector(tb, 0.005).add(V(0, 0.014, 0)), [0, rotY, 0], [0.006, 0.009, 0.009]);
    add(sph8, shine, head, c.clone().addScaledVector(n, 0.017).addScaledVector(tb, -0.007).add(V(0, -0.014, 0)), [0, rotY, 0], [0.003, 0.0045, 0.0045]);
    // lashes flicking out from the upper back rim
    for (let k = 0; k < 3; k++) {
      const p = c
        .clone()
        .addScaledVector(n, 0.004)
        .addScaledVector(tb, 0.004 + k * 0.011)
        .add(V(s * 0.004, 0.046 - k * 0.003, 0));
      add(box, eyeDark, head, p, [-(0.25 + k * 0.3), rotY, -s * (0.55 + k * 0.2)], [0.004, 0.026, 0.004]);
    }
    // cheek blush
    add(sph8, blushMat, head, [s * 0.065, -0.05, 0.075], [0, rotY * 0.6, 0], [0.006, 0.017, 0.026]);
  }

  // ears
  for (const s of [1, -1]) {
    const eg = new THREE.Group();
    eg.position.set(s * 0.055, 0.082, -0.03);
    eg.rotation.set(0.12, s * 0.2, -s * 0.32);
    head.add(eg);
    add(cone5, coat, eg, [0, 0.05, 0], [0, 0, 0], [0.033, 0.1, 0.02]);
    add(cone5, earInner, eg, [0, 0.043, 0.009], [0, 0, 0], [0.02, 0.07, 0.009]);
  }

  // horn bud: twisted pearl cone wrapped in a gold ribbon
  const hornG = new THREE.Group();
  hornG.position.set(0, 0.09, 0.05);
  hornG.rotation.x = 0.5;
  head.add(hornG);
  const H = 0.16;
  const R = 0.025;
  const hornGeo = new THREE.ConeGeometry(R, H, 6, 8);
  hornGeo.translate(0, H / 2, 0);
  const hp = hornGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < hp.count; i++) {
    const y = hp.getY(i);
    const a = (y / H) * Math.PI * 3;
    const x = hp.getX(i);
    const z = hp.getZ(i);
    hp.setXYZ(i, x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a));
  }
  hp.needsUpdate = true;
  hornGeo.computeVertexNormals();
  add(hornGeo, pearl, hornG, [0, 0, 0]);
  class HelixCurve extends THREE.Curve<THREE.Vector3> {
    getPoint(t: number, target: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
      const a = t * Math.PI * 2 * 3;
      const r = R * (1 - t) * 0.95 + 0.001;
      return target.set(Math.cos(a) * r, H * 0.94 * t, Math.sin(a) * r);
    }
  }
  add(new THREE.TubeGeometry(new HelixCurve(), 60, 0.0035, 4, false), gold, hornG, [0, 0, 0]);
  add(new THREE.TorusGeometry(0.027, 0.007, 4, 12), gold, hornG, [0, 0.004, 0], [Math.PI / 2, 0, 0]);

  // forelock fanned around the horn base
  const forelockCols = [rainbow[1], rainbow[0], rainbow[2], rainbow[0], rainbow[1]];
  for (let i = -2; i <= 2; i++) {
    add(
      cone5,
      forelockCols[i + 2],
      head,
      [i * 0.022, 0.1 - Math.abs(i) * 0.012, -0.01 - Math.abs(i) * 0.012],
      [1.1, 0, -i * 0.42],
      [0.03, 0.09, 0.03]
    );
  }

  // ---------- flowers ----------
  const flower = (parent: THREE.Object3D, pos: THREE.Vector3, normal: THREE.Vector3, petal: THREE.Material, size: number) => {
    const g = new THREE.Group();
    g.position.copy(pos);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.clone().normalize());
    parent.add(g);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      add(sph8, petal, g, [Math.cos(a) * 0.016 * size, Math.sin(a) * 0.016 * size, 0], [0, 0, a - Math.PI / 2], [0.011 * size, 0.019 * size, 0.006 * size]);
    }
    add(sph8, flowerCenter, g, [0, 0, 0.004 * size], [0, 0, 0], [0.009 * size, 0.009 * size, 0.007 * size]);
  };
  flower(head, V(0.078, 0.07, -0.055), V(1, 0.6, -0.2), flowerWhite, 1.0);
  flower(head, V(0.06, 0.095, -0.085), V(0.7, 0.8, -0.5), rainbow[0], 0.75);
  flower(
    root,
    neckBot.clone().addScaledVector(nd, neckLen * 0.5).addScaledVector(nBack, 0.05).add(V(0.065, 0, 0)),
    V(1, 0.3, 0.1),
    flowerWhite,
    0.9
  );

  // ---------- tail ----------
  const tailRoot = V(0, 0.95, -0.4);
  const tailCurve = new THREE.QuadraticBezierCurve3(tailRoot, V(0, 1.0, -0.62), V(0, 0.6, -0.63));
  seg(tailRoot, tailCurve.getPoint(0.18), 0.042, 0.034, coat);
  const TN = 8;
  for (let i = 0; i < TN; i++) {
    const t = 0.12 + i * 0.12;
    const p = tailCurve.getPoint(t);
    const tan = tailCurve.getTangent(t);
    const mat = rainbow[5 - Math.min(5, Math.floor((i * 6) / TN))]; // lavender at root -> pink at tip
    const size = 0.045 + 0.02 * Math.sin(t * Math.PI);
    for (let k = -1; k <= 1; k++) {
      const dir = tan.clone().addScaledVector(X, k * 0.5).add(V(0, (rand() - 0.5) * 0.2, -0.15)).normalize();
      coneAlong(mat, root, p.clone().addScaledVector(X, k * 0.024), dir, size * (k === 0 ? 1 : 0.85), size * 2.6);
    }
  }

  // ribbon bow at the tail root
  const bow = new THREE.Group();
  bow.position.set(0, 0.985, -0.405);
  bow.rotation.x = -0.5;
  root.add(bow);
  add(cone4, bowMat, bow, [0.032, 0, 0], [0, 0, Math.PI / 2], [0.028, 0.064, 0.012]);
  add(cone4, bowMat, bow, [-0.032, 0, 0], [0, 0, -Math.PI / 2], [0.028, 0.064, 0.012]);
  add(sph8, bowMat, bow, [0, 0, 0], [0, 0, 0], [0.015, 0.015, 0.012]);
  add(box, bowMat, bow, [0.014, -0.03, -0.004], [0, 0, 0.35], [0.012, 0.05, 0.004]);
  add(box, bowMat, bow, [-0.014, -0.03, -0.004], [0, 0, -0.35], [0.012, 0.05, 0.004]);

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return root;
}
