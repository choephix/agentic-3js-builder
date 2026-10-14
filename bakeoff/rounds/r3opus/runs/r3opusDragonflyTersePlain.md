```ts
import * as THREE from "three";

export const meta = {
  name: "Azure Hawker Dragonfly",
  description:
    "A stylized low-poly dragonfly at rest on its six legs. It has faceted turquoise compound eyes, a striped green thorax and a banded electric-blue abdomen. Four wings are spread flat, each with a hand-drawn vein texture, amber roots and dark pterostigma spots.",
};

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d")! };
}

function wingOutline(hind: boolean): THREE.Vector2[] {
  const raw = hind
    ? [
        [0, 0.03], [0.12, 0.085], [0.45, 0.1], [0.8, 0.095], [0.97, 0.055],
        [1, -0.005], [0.92, -0.07], [0.6, -0.11], [0.3, -0.16], [0.1, -0.17],
        [0.02, -0.08], [0, 0.03],
      ]
    : [
        [0, 0.03], [0.12, 0.08], [0.45, 0.1], [0.8, 0.095], [0.97, 0.06],
        [1, 0.0], [0.93, -0.06], [0.65, -0.085], [0.3, -0.08], [0.08, -0.05],
        [0, -0.01], [0, 0.03],
      ];
  const curve = new THREE.SplineCurve(raw.map(([x, y]) => new THREE.Vector2(x, y)));
  const pts = curve.getPoints(40);
  pts.pop();
  return pts;
}

function makeWingTexture(outline: THREE.Vector2[], rand: () => number) {
  const W = 1024, H = 512;
  const { c, ctx } = makeCanvas(W, H);
  const px = (x: number) => x * W;
  const py = (y: number) => ((0.2 - y) / 0.4) * H;

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath();
  outline.forEach((p, i) => (i === 0 ? ctx.moveTo(px(p.x), py(p.y)) : ctx.lineTo(px(p.x), py(p.y))));
  ctx.closePath();
  ctx.clip();

  // membrane tint
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "rgba(230,160,60,0.65)");
  g.addColorStop(0.12, "rgba(230,190,110,0.35)");
  g.addColorStop(0.3, "rgba(180,225,245,0.22)");
  g.addColorStop(1, "rgba(200,235,255,0.18)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // fan veins
  const root = new THREE.Vector2(0.0, 0.01);
  const targets = outline.filter((p) => p.x > 0.12).filter((_, i) => i % 2 === 0);
  // order targets by angle for cross veins
  targets.sort((a, b) => Math.atan2(b.y - root.y, b.x) - Math.atan2(a.y - root.y, a.x));
  const lines: THREE.Vector2[][] = [];
  ctx.strokeStyle = "rgba(35,45,55,0.75)";
  ctx.lineWidth = 2;
  for (const t of targets) {
    const cp = new THREE.Vector2(t.x * 0.5, t.y * 0.85 + 0.005);
    ctx.beginPath();
    ctx.moveTo(px(root.x), py(root.y));
    ctx.quadraticCurveTo(px(cp.x), py(cp.y), px(t.x), py(t.y));
    ctx.stroke();
    const samples: THREE.Vector2[] = [];
    for (let s = 0.08; s <= 1.0001; s += 0.045) {
      const a = (1 - s) * (1 - s), b = 2 * (1 - s) * s, d = s * s;
      samples.push(new THREE.Vector2(a * root.x + b * cp.x + d * t.x, a * root.y + b * cp.y + d * t.y));
    }
    lines.push(samples);
  }
  // cross veins (network)
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(40,55,65,0.5)";
  for (let i = 0; i < lines.length - 1; i++) {
    const A = lines[i], B = lines[i + 1];
    for (let k = 0; k < A.length; k++) {
      const off = rand() < 0.5 ? 0 : 1;
      const p = A[k], q = B[Math.min(B.length - 1, k + off)];
      ctx.beginPath();
      ctx.moveTo(px(p.x), py(p.y));
      ctx.lineTo(px(q.x), py(q.y));
      ctx.stroke();
    }
  }
  // pterostigma
  let top = -1;
  for (const p of outline) if (p.x > 0.82 && p.x < 0.9 && p.y > top) top = p.y;
  ctx.fillStyle = "rgba(60,30,15,0.95)";
  ctx.fillRect(px(0.82), py(top - 0.004), px(0.07), py(0) - py(0.016));
  ctx.restore();

  // thick leading/outline vein
  ctx.strokeStyle = "rgba(25,30,35,0.95)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  outline.forEach((p, i) => (i === 0 ? ctx.moveTo(px(p.x), py(p.y)) : ctx.lineTo(px(p.x), py(p.y))));
  ctx.closePath();
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeWingGeometry(outline: THREE.Vector2[]) {
  const shape = new THREE.Shape(outline);
  const geo = new THREE.ShapeGeometry(shape);
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i);
    uv[i * 2 + 1] = (pos.getY(i) + 0.2) / 0.4;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

export default function build(): THREE.Object3D {
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const root = new THREE.Group();

  // ---------- textures ----------
  const eyeTex = (() => {
    const { c, ctx } = makeCanvas(256, 256);
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#5ff0d8");
    g.addColorStop(0.5, "#1fa8b8");
    g.addColorStop(1, "#0b3d6b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 10) {
      for (let x = (y / 10) % 2 ? 5 : 0; x < 256; x += 10) {
        ctx.fillStyle = `rgba(${rand() < 0.5 ? "255,255,255" : "0,30,40"},${0.12 + rand() * 0.15})`;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();

  const thoraxTex = (() => {
    const { c, ctx } = makeCanvas(256, 128);
    ctx.fillStyle = "#4cbf6a";
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = "#14261c";
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(i * 44 + 10, 0);
      ctx.transform(1, 0, -0.35, 1, 0, 0);
      ctx.fillRect(0, 0, 12, 128);
      ctx.restore();
    }
    ctx.fillStyle = "rgba(255,240,120,0.5)";
    ctx.fillRect(0, 0, 256, 14);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();

  // ---------- materials ----------
  const eyeMat = new THREE.MeshStandardMaterial({ map: eyeTex, roughness: 0.15, metalness: 0.25, flatShading: true });
  const thoraxMat = new THREE.MeshStandardMaterial({ map: thoraxTex, roughness: 0.45, metalness: 0.2, flatShading: true });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1e9be0, roughness: 0.3, metalness: 0.45, flatShading: true });
  const darkBlueMat = new THREE.MeshStandardMaterial({ color: 0x123a7a, roughness: 0.35, metalness: 0.4, flatShading: true });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x111418, roughness: 0.5, metalness: 0.2, flatShading: true });
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xd8e05a, roughness: 0.5, flatShading: true });
  const headMat = new THREE.MeshStandardMaterial({ color: 0x2f7a4a, roughness: 0.5, flatShading: true });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1b1a1e, roughness: 0.6, flatShading: true });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  const Y = new THREE.Vector3(0, 1, 0);
  const rod = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, mat: THREE.Material) => {
    const d = b.clone().sub(a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 5), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(Y, d.normalize());
    root.add(m);
    return m;
  };

  // ---------- head ----------
  const headZ = 0.035;
  add(new THREE.IcosahedronGeometry(0.0034, 0), headMat, 0, 0.0205, headZ);
  for (const s of [1, -1]) {
    const eye = add(new THREE.IcosahedronGeometry(0.0046, 1), eyeMat, s * 0.0034, 0.0228, headZ + 0.0008);
    eye.scale.set(1, 0.95, 1.05);
    // shiny highlight facet
    const hl = add(new THREE.IcosahedronGeometry(0.0012, 0), new THREE.MeshStandardMaterial({ color: 0xbfffff, roughness: 0.05, metalness: 0.1, flatShading: true }), s * 0.0048, 0.0262, headZ + 0.0025);
    hl.scale.set(1, 0.5, 1);
    // antennae
    rod(new THREE.Vector3(s * 0.0008, 0.0232, headZ + 0.0042), new THREE.Vector3(s * 0.0022, 0.0262, headZ + 0.0062), 0.00018, 0.0001, legMat);
  }
  // frons / face
  const frons = add(new THREE.BoxGeometry(0.0042, 0.0028, 0.0022), faceMat, 0, 0.0215, headZ + 0.0042);
  frons.rotation.x = -0.3;
  add(new THREE.BoxGeometry(0.0032, 0.0016, 0.0018), faceMat, 0, 0.0186, headZ + 0.0043);
  add(new THREE.BoxGeometry(0.0026, 0.0012, 0.0014), blackMat, 0, 0.0172, headZ + 0.0036);
  // ocelli
  for (const s of [-1, 0, 1]) add(new THREE.OctahedronGeometry(0.00045, 0), blackMat, s * 0.0009, 0.0243, headZ + 0.0032 - Math.abs(s) * 0.0004);

  // ---------- thorax ----------
  const thorax = add(new THREE.SphereGeometry(1, 8, 6), thoraxMat, 0, 0.0195, 0.0255);
  thorax.scale.set(0.0049, 0.006, 0.0078);
  thorax.rotation.x = 0.25;
  // collar
  const collar = add(new THREE.CylinderGeometry(0.0028, 0.0032, 0.0015, 7), blackMat, 0, 0.0205, 0.0318);
  collar.rotation.x = Math.PI / 2;
  // dorsal crest
  const crest = add(new THREE.BoxGeometry(0.0016, 0.0012, 0.009), faceMat, 0, 0.0252, 0.025);
  crest.rotation.x = 0.1;

  // ---------- abdomen ----------
  const nSeg = 10;
  let z = 0.0185;
  let y = 0.0185;
  for (let i = 0; i < nSeg; i++) {
    const len = i < 2 ? 0.0055 : 0.0064;
    let r = i === 0 ? 0.0029 : i === 1 ? 0.0024 : i < 7 ? 0.0017 : 0.0017 + (i - 6) * 0.00017;
    const rNext = i === 0 ? 0.0024 : i === 1 ? 0.0018 : r * 0.96;
    const mat = i >= 7 ? darkBlueMat : blueMat;
    const seg = add(new THREE.CylinderGeometry(r, rNext, len, 7), mat, 0, y, z - len / 2);
    seg.rotation.x = -Math.PI / 2 - 0.02;
    // joint ring
    const ring = add(new THREE.CylinderGeometry(r * 1.06, r * 1.06, 0.0007, 7), blackMat, 0, y, z - len + 0.0003);
    ring.rotation.x = Math.PI / 2;
    // dorsal marking (arrow-ish)
    if (i >= 1) {
      const mark = add(new THREE.ConeGeometry(r * 0.55, len * 0.55, 3), blackMat, 0, y + r * 0.82, z - len * 0.55);
      mark.rotation.x = -Math.PI / 2;
      mark.scale.set(1, 1, 0.35);
      // pale side spots
      for (const s of [1, -1]) {
        const spot = add(new THREE.BoxGeometry(0.0003, r * 0.6, len * 0.35), faceMat, s * r * 0.92, y + r * 0.1, z - len * 0.4);
        spot.rotation.z = s * 0.15;
      }
    }
    z -= len;
    y += 0.00012;
  }
  // claspers
  for (const s of [1, -1]) {
    const cl = rod(new THREE.Vector3(s * 0.0007, y, z + 0.0003), new THREE.Vector3(s * 0.0012, y - 0.0004, z - 0.0032), 0.00045, 0.0002, blackMat);
    cl.castShadow = true;
  }

  // ---------- legs ----------
  const legDefs = [
    { z: 0.0295, kz: 0.0345, fz: 0.0385, kx: 0.0065, fx: 0.008 },
    { z: 0.0258, kz: 0.0272, fz: 0.0262, kx: 0.0095, fx: 0.0125 },
    { z: 0.0222, kz: 0.0195, fz: 0.0145, kx: 0.0098, fx: 0.0128 },
  ];
  for (const d of legDefs) {
    for (const s of [1, -1]) {
      const hip = new THREE.Vector3(s * 0.0017, 0.0145, d.z);
      const knee = new THREE.Vector3(s * d.kx, 0.0185, d.kz);
      const ankle = new THREE.Vector3(s * d.fx, 0.0012, d.fz);
      const toe = new THREE.Vector3(s * (d.fx + 0.0012), 0.0003, d.fz + (d.fz - d.kz) * 0.25);
      rod(hip, knee, 0.00055, 0.00045, legMat);
      rod(knee, ankle, 0.00042, 0.0003, legMat);
      rod(ankle, toe, 0.00028, 0.00022, legMat);
      add(new THREE.IcosahedronGeometry(0.0005, 0), legMat, knee.x, knee.y, knee.z);
      // tiny spines on tibia
      for (let k = 1; k <= 3; k++) {
        const p = knee.clone().lerp(ankle, k / 4);
        const sp = rod(p, p.clone().add(new THREE.Vector3(-s * 0.0008, 0.0002, 0)), 0.00012, 0.00004, legMat);
        sp.castShadow = false;
      }
    }
  }

  // ---------- wings ----------
  const foreOutline = wingOutline(false);
  const hindOutline = wingOutline(true);
  const foreMat = new THREE.MeshStandardMaterial({
    map: makeWingTexture(foreOutline, rand), transparent: true, side: THREE.DoubleSide,
    depthWrite: false, roughness: 0.12, metalness: 0.35,
  });
  const hindMat = new THREE.MeshStandardMaterial({
    map: makeWingTexture(hindOutline, rand), transparent: true, side: THREE.DoubleSide,
    depthWrite: false, roughness: 0.12, metalness: 0.35,
  });
  const foreGeo = makeWingGeometry(foreOutline);
  const hindGeo = makeWingGeometry(hindOutline);

  const wing = (geo: THREE.BufferGeometry, mat: THREE.Material, side: number, zRoot: number, len: number, sweep: number, dihedral: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.0022, 0.0245, zRoot);
    pivot.scale.x = side;
    pivot.rotation.set(0, sweep, dihedral);
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = Math.PI / 2;
    m.scale.set(len, len, len);
    m.renderOrder = 2;
    pivot.add(m);
    // wing root knuckle
    const k = new THREE.Mesh(new THREE.IcosahedronGeometry(0.0009, 0), blackMat);
    k.position.set(0.0004, 0, 0.0004);
    pivot.add(k);
    root.add(pivot);
  };
  for (const s of [1, -1]) {
    wing(foreGeo, foreMat, s, 0.0285, 0.047, -0.14, 0.05);
    wing(hindGeo, hindMat, s, 0.0225, 0.045, 0.16, 0.03);
  }

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return root;
}
```