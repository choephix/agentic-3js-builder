```ts
import * as THREE from "three";

export const meta = {
  name: "Seahorse",
  description:
    "A stylized low-poly seahorse built like a primitive puppet: banded ring-segmented body on an S-curve, curled tail, long snout, knobby spikes, crown coronet, big glossy eyes and translucent striped fins.",
};

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rand = makeRng(1337);

  const M = (c: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.05, flatShading: true, ...o });

  const orange = M(0xf27d32);
  const band = M(0xd9512b);
  const cream = M(0xffe0a8);
  const yellow = M(0xffc93c);
  const white = M(0xffffff, { roughness: 0.25 });
  const black = M(0x1a1030, { roughness: 0.15 });
  const lipMat = M(0x8c2f39);
  const freckle = M(0xfff4dc, { roughness: 0.4 });

  // Fin texture (rays)
  let finMat: THREE.MeshStandardMaterial;
  if (typeof document !== "undefined") {
    const cv = document.createElement("canvas");
    cv.width = 128;
    cv.height = 128;
    const g = cv.getContext("2d")!;
    const grad = g.createLinearGradient(0, 128, 0, 0);
    grad.addColorStop(0, "#239c96");
    grad.addColorStop(1, "#aaf5e6");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    g.strokeStyle = "rgba(255,255,255,0.75)";
    g.lineWidth = 3;
    for (let x = 4; x < 128; x += 12) {
      g.beginPath();
      g.moveTo(x, 128);
      g.lineTo(x, 6);
      g.stroke();
    }
    g.fillStyle = "rgba(255,210,80,0.9)";
    g.fillRect(0, 0, 128, 7);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    finMat = new THREE.MeshStandardMaterial({
      map: tex, color: 0xffffff, transparent: true, opacity: 0.88,
      side: THREE.DoubleSide, roughness: 0.4, flatShading: true,
    });
  } else {
    finMat = new THREE.MeshStandardMaterial({
      color: 0x5fd3c4, transparent: true, opacity: 0.88, side: THREE.DoubleSide, flatShading: true,
    });
  }

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, pos: THREE.Vector3, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    parent.add(m);
    return m;
  };

  // Spine curve (YZ plane), head -> tail tip
  const yz: [number, number][] = [
    [0.262, -0.012], [0.235, -0.008], [0.205, 0.004], [0.17, 0.018], [0.135, 0.022],
    [0.1, 0.012], [0.072, -0.004], [0.048, -0.016], [0.026, -0.018], [0.012, -0.006],
    [0.01, 0.01], [0.02, 0.02], [0.032, 0.016], [0.034, 0.006], [0.027, 0.002],
  ];
  const curve = new THREE.CatmullRomCurve3(yz.map(([y, z]) => new THREE.Vector3(0, y, z)));

  const rk = [0, 0.12, 0.3, 0.45, 0.6, 0.75, 1];
  const rv = [0.014, 0.019, 0.024, 0.021, 0.012, 0.008, 0.0035];
  const R = (t: number) => {
    for (let i = 0; i < rk.length - 1; i++) {
      if (t <= rk[i + 1]) {
        const f = (t - rk[i]) / (rk[i + 1] - rk[i]);
        const s = f * f * (3 - 2 * f);
        return rv[i] + (rv[i + 1] - rv[i]) * s;
      }
    }
    return rv[rv.length - 1];
  };
  const backOf = (T: THREE.Vector3) => new THREE.Vector3(0, -T.z, T.y).normalize();
  const XS = 0.8; // lateral compression

  const N = 56;
  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N, tm = (t0 + t1) / 2;
    const p0 = curve.getPointAt(t0), p1 = curve.getPointAt(t1);
    const mid = p0.clone().add(p1).multiplyScalar(0.5);
    const T = p1.clone().sub(p0);
    const len = T.length();
    T.normalize();
    const ang = Math.atan2(T.z, T.y);
    const even = i % 2 === 0;
    const k = even ? 1.08 : 1;
    const seg = add(new THREE.CylinderGeometry(R(t1) * k, R(t0) * k, len * 1.18, 8), even ? band : orange, mid);
    seg.rotation.x = ang;
    seg.scale.x = XS;

    const r = R(tm);
    const back = backOf(T);
    const front = back.clone().negate();

    // back spikes
    if (even && tm < 0.9) {
      const c = add(new THREE.ConeGeometry(r * 0.28, r * 0.6, 4), yellow, mid.clone().addScaledVector(back, r * 1.0));
      c.rotation.x = Math.atan2(back.z, back.y);
    }
    // side knobs
    if (i % 3 === 0 && tm < 0.72) {
      for (const sx of [1, -1]) {
        const c = add(new THREE.ConeGeometry(r * 0.2, r * 0.45, 4), yellow,
          mid.clone().add(new THREE.Vector3(sx * r * XS * 1.02, 0, 0)).addScaledVector(back, r * 0.25));
        c.rotation.z = -sx * Math.PI / 2;
      }
    }
    // belly plates
    if (tm > 0.08 && tm < 0.58) {
      const b = add(new THREE.BoxGeometry(r * 1.0, len * 0.95, r * 0.35), cream, mid.clone().addScaledVector(front, r * 0.86));
      b.rotation.x = ang;
    }
    // freckles
    if (tm > 0.1 && tm < 0.6 && rand() < 0.6) {
      const sx = rand() < 0.5 ? 1 : -1;
      const th = (rand() - 0.5) * 1.6;
      const pos = mid.clone()
        .add(new THREE.Vector3(sx * Math.cos(th) * r * XS * 1.03, 0, 0))
        .addScaledVector(back, Math.sin(th) * r * 1.03);
      const f = add(new THREE.IcosahedronGeometry(0.0016 + rand() * 0.001, 0), freckle, pos);
      f.scale.x = 0.5;
    }
  }

  // Fan fin builder
  const fan = (bases: THREE.Vector3[], dirs: THREE.Vector3[], heights: number[]) => {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    const n = bases.length;
    for (let i = 0; i < n; i++) {
      const b = bases[i], tip = b.clone().addScaledVector(dirs[i], heights[i]);
      pos.push(b.x, b.y, b.z, tip.x, tip.y, tip.z);
      const u = i / (n - 1);
      uv.push(u, 0, u, 1);
      if (i < n - 1) {
        const a = i * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return new THREE.Mesh(g, finMat);
  };

  // Dorsal fin
  {
    const bases: THREE.Vector3[] = [], dirs: THREE.Vector3[] = [], hs: number[] = [];
    const n = 11;
    for (let i = 0; i < n; i++) {
      const s = i / (n - 1);
      const t = 0.3 + s * 0.24;
      const p = curve.getPointAt(t);
      const T = curve.getTangentAt(t);
      const back = backOf(T);
      bases.push(p.clone().addScaledVector(back, R(t) * 0.8));
      dirs.push(back.clone().addScaledVector(T, 0.25 * (s - 0.3)).normalize());
      hs.push((0.004 + 0.024 * Math.pow(Math.sin(Math.PI * s), 0.6)) * (i % 2 ? 0.88 : 1));
    }
    root.add(fan(bases, dirs, hs));
  }

  // Pectoral fins
  for (const sx of [1, -1]) {
    const bases: THREE.Vector3[] = [], dirs: THREE.Vector3[] = [], hs: number[] = [];
    const n = 7;
    for (let i = 0; i < n; i++) {
      const s = i / (n - 1);
      bases.push(new THREE.Vector3(sx * 0.012, 0.25 - s * 0.018, -0.008 + s * 0.003));
      dirs.push(new THREE.Vector3(sx * 0.6, 0.25 - s * 0.5, -1).normalize());
      hs.push((0.004 + 0.013 * Math.pow(Math.sin(Math.PI * s), 0.6)) * (i % 2 ? 0.85 : 1));
    }
    root.add(fan(bases, dirs, hs));
  }

  // Small anal fin near tail start
  {
    const bases: THREE.Vector3[] = [], dirs: THREE.Vector3[] = [], hs: number[] = [];
    const n = 5;
    for (let i = 0; i < n; i++) {
      const s = i / (n - 1);
      const t = 0.56 + s * 0.06;
      const p = curve.getPointAt(t);
      const T = curve.getTangentAt(t);
      const front = backOf(T).negate();
      bases.push(p.clone().addScaledVector(front, R(t) * 0.7));
      dirs.push(front.clone().addScaledVector(T, 0.5).normalize());
      hs.push(0.003 + 0.008 * Math.sin(Math.PI * s));
    }
    root.add(fan(bases, dirs, hs));
  }

  // Head
  const H = new THREE.Vector3(0, 0.27, 0.004);
  const skull = add(new THREE.IcosahedronGeometry(0.02, 1), orange, H);
  skull.scale.set(0.75, 0.88, 1.15);
  const jaw = add(new THREE.IcosahedronGeometry(0.014, 1), orange, H.clone().add(new THREE.Vector3(0, -0.006, 0.013)));
  jaw.scale.set(0.8, 0.8, 1.15);
  // cheek plates
  for (const sx of [1, -1]) {
    const c = add(new THREE.IcosahedronGeometry(0.009, 0), cream, H.clone().add(new THREE.Vector3(sx * 0.011, -0.008, -0.004)));
    c.scale.set(0.35, 1, 1.1);
  }

  // Snout
  const a = Math.PI / 2 + 0.12;
  const sd = new THREE.Vector3(0, Math.cos(a), Math.sin(a));
  const snout = add(new THREE.CylinderGeometry(0.0052, 0.0072, 0.042, 8), orange, H.clone().addScaledVector(sd, 0.031));
  snout.rotation.x = a;
  snout.scale.x = 0.85;
  const sband = add(new THREE.CylinderGeometry(0.0066, 0.0066, 0.004, 8), band, H.clone().addScaledVector(sd, 0.03));
  sband.rotation.x = a;
  const lip = add(new THREE.CylinderGeometry(0.0062, 0.006, 0.005, 8), lipMat, H.clone().addScaledVector(sd, 0.053));
  lip.rotation.x = a;
  const mouth = add(new THREE.CylinderGeometry(0.003, 0.003, 0.002, 6), black, H.clone().addScaledVector(sd, 0.0558));
  mouth.rotation.x = a;

  // Eyes
  for (const sx of [1, -1]) {
    const ep = new THREE.Vector3(sx * 0.0135, 0.274, 0.01);
    add(new THREE.IcosahedronGeometry(0.0062, 1), white, ep);
    const ring = add(new THREE.TorusGeometry(0.0062, 0.0015, 4, 10), yellow, ep.clone().add(new THREE.Vector3(sx * 0.0012, 0, 0)));
    ring.rotation.y = Math.PI / 2;
    add(new THREE.IcosahedronGeometry(0.0038, 1), black, ep.clone().add(new THREE.Vector3(sx * 0.0035, 0, 0.0008)));
    add(new THREE.IcosahedronGeometry(0.0012, 0), white, ep.clone().add(new THREE.Vector3(sx * 0.0068, 0.0015, 0.0018)));
    // brow spike
    const br = add(new THREE.ConeGeometry(0.0022, 0.007, 4), yellow, ep.clone().add(new THREE.Vector3(sx * 0.001, 0.0075, -0.002)));
    br.rotation.z = -sx * 0.4;
    br.rotation.x = -0.3;
  }

  // Coronet crown
  const crownBase = add(new THREE.CylinderGeometry(0.006, 0.008, 0.008, 6), band, H.clone().add(new THREE.Vector3(0, 0.019, -0.006)));
  crownBase.rotation.x = -0.25;
  const crown: [number, number, number, number][] = [
    [0, 0.029, -0.004, 0.011], [0.0045, 0.027, -0.008, 0.008], [-0.0045, 0.027, -0.008, 0.008],
    [0.004, 0.026, -0.001, 0.007], [-0.004, 0.026, -0.001, 0.007], [0, 0.026, -0.011, 0.008],
  ];
  for (const [x, y, z, h] of crown) {
    const c = add(new THREE.ConeGeometry(0.0024, h, 4), yellow, H.clone().add(new THREE.Vector3(x, y, z)));
    c.rotation.z = -x * 40;
    c.rotation.x = (z + 0.005) * 30;
  }

  // Ground the model: lowest point touches y = 0
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;
  root.position.x -= (box.min.x + box.max.x) / 2;

  const wrapper = new THREE.Group();
  wrapper.add(root);
  return wrapper;
}
```