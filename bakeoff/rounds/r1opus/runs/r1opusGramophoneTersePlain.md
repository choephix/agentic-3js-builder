```ts
import * as THREE from "three";

export const meta = {
  name: "Petal-Horn Gramophone",
  description:
    "A stylized Edwardian gramophone: a mahogany cabinet on bun feet with gilt-trimmed panels, a green felt platter with a grooved shellac record, a brass tonearm and soundbox, a side crank, and a scalloped burgundy petal horn edged in gold.",
};

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rnd = mulberry32(1906);
  const root = new THREE.Group();

  const mkCanvas = (w: number, h: number) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return [c, c.getContext("2d")!] as const;
  };
  const toTex = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };

  // ---------- textures ----------
  const woodTex = (() => {
    const [c, g] = mkCanvas(256, 256);
    g.fillStyle = "#7a3418"; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 70; i++) {
      const y0 = rnd() * 256, amp = 2 + rnd() * 5, f = 0.01 + rnd() * 0.03;
      g.strokeStyle = rnd() < 0.6 ? `rgba(60,20,8,${0.25 + rnd() * 0.4})` : `rgba(170,90,50,${0.15 + rnd() * 0.25})`;
      g.lineWidth = 0.6 + rnd() * 2.5;
      g.beginPath();
      for (let x = 0; x <= 256; x += 8) {
        const y = y0 + Math.sin(x * f + i) * amp;
        x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
    return toTex(c);
  })();

  const recordTex = (() => {
    const [c, g] = mkCanvas(512, 512);
    g.fillStyle = "#000"; g.fillRect(0, 0, 512, 512);
    g.fillStyle = "#121214";
    g.beginPath(); g.arc(256, 256, 256, 0, Math.PI * 2); g.fill();
    for (let r = 100; r < 252; r += 2.5) {
      g.strokeStyle = `rgba(${90 + rnd() * 60},${90 + rnd() * 60},${100 + rnd() * 60},${0.08 + rnd() * 0.18})`;
      g.lineWidth = 1;
      g.beginPath(); g.arc(256, 256, r, 0, Math.PI * 2); g.stroke();
    }
    // sheen wedges
    g.fillStyle = "rgba(200,200,220,0.07)";
    g.beginPath(); g.moveTo(256, 256); g.arc(256, 256, 252, -0.9, -0.5); g.fill();
    g.beginPath(); g.moveTo(256, 256); g.arc(256, 256, 252, 2.2, 2.6); g.fill();
    // label
    g.fillStyle = "#b51f2c"; g.beginPath(); g.arc(256, 256, 92, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#e8c15a"; g.lineWidth = 4;
    g.beginPath(); g.arc(256, 256, 86, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.5; g.beginPath(); g.arc(256, 256, 60, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#f2d47a"; g.textAlign = "center";
    g.font = "bold 22px serif"; g.fillText("ORPHEON", 256, 222);
    g.font = "italic 15px serif"; g.fillText("Valse des Fleurs", 256, 300);
    g.font = "bold 13px serif"; g.fillText("78 R.P.M.", 256, 322);
    g.fillStyle = "#222"; g.beginPath(); g.arc(256, 256, 6, 0, Math.PI * 2); g.fill();
    return toTex(c);
  })();

  const hornTex = (() => {
    const [c, g] = mkCanvas(1024, 256);
    const pw = 128;
    for (let i = 0; i < 8; i++) {
      const x0 = i * pw;
      const grd = g.createLinearGradient(0, 0, 0, 256);
      grd.addColorStop(0, "#9c2232");
      grd.addColorStop(0.6, "#6e1222");
      grd.addColorStop(0.8, "#5a0e1b");
      grd.addColorStop(0.86, "#c99a3e");
      grd.addColorStop(1, "#e2bb5c");
      g.fillStyle = grd; g.fillRect(x0, 0, pw, 256);
      // soft centre highlight of each petal
      const hg = g.createLinearGradient(x0, 0, x0 + pw, 0);
      hg.addColorStop(0, "rgba(0,0,0,0.25)");
      hg.addColorStop(0.5, "rgba(255,200,200,0.12)");
      hg.addColorStop(1, "rgba(0,0,0,0.25)");
      g.fillStyle = hg; g.fillRect(x0, 0, pw, 215);
      // gilt pinstripe inset
      g.strokeStyle = "#e9c766"; g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0 + 14, 200); g.lineTo(x0 + 14, 22);
      g.quadraticCurveTo(x0 + pw / 2, 4, x0 + pw - 14, 22);
      g.lineTo(x0 + pw - 14, 200); g.stroke();
      // fleuron
      g.fillStyle = "#f0d27a";
      const cx = x0 + pw / 2;
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;
        g.beginPath(); g.ellipse(cx + Math.cos(a) * 7, 46 + Math.sin(a) * 7, 6, 3, a, 0, Math.PI * 2); g.fill();
      }
      g.beginPath(); g.arc(cx, 46, 3, 0, Math.PI * 2); g.fillStyle = "#9c2232"; g.fill();
      // seam
      g.fillStyle = "#f0cf6a"; g.fillRect(x0, 0, 4, 256);
      g.fillRect(x0 + pw - 2, 0, 2, 256);
    }
    return toTex(c);
  })();

  const plateTex = (() => {
    const [c, g] = mkCanvas(256, 64);
    const grd = g.createLinearGradient(0, 0, 256, 64);
    grd.addColorStop(0, "#b8862e"); grd.addColorStop(0.5, "#f3d57e"); grd.addColorStop(1, "#b8862e");
    g.fillStyle = grd; g.fillRect(0, 0, 256, 64);
    g.strokeStyle = "#5a3a10"; g.lineWidth = 3; g.strokeRect(5, 5, 246, 54);
    g.fillStyle = "#3d2408"; g.textAlign = "center"; g.font = "bold 30px serif";
    g.fillText("ORPHEON", 128, 43);
    return toTex(c);
  })();

  // ---------- materials ----------
  const wood = new THREE.MeshStandardMaterial({ color: 0xffffff, map: woodTex, roughness: 0.55 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x3b1608, roughness: 0.5 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd9a944, metalness: 0.85, roughness: 0.3 });
  const felt = new THREE.MeshStandardMaterial({ color: 0x1f5a32, roughness: 1 });
  const vinyl = new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.35 });
  const recordTop = new THREE.MeshStandardMaterial({ color: 0xffffff, map: recordTex, roughness: 0.3 });
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: hornTex, roughness: 0.4, metalness: 0.25, side: THREE.DoubleSide });
  const mica = new THREE.MeshStandardMaterial({ color: 0xefe3c2, roughness: 0.25, metalness: 0.1 });
  const ebony = new THREE.MeshStandardMaterial({ color: 0x141010, roughness: 0.4 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: plateTex, metalness: 0.6, roughness: 0.35 });
  const red = new THREE.MeshStandardMaterial({ color: 0xb51f2c, roughness: 0.5 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) =>
    add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p);
  const cyl = (rt: number, rb: number, h: number, seg: number, mat: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) =>
    add(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, p);
  const rod = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const m = cyl(r, r, d.length(), 8, mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return m;
  };

  // ---------- cabinet ----------
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const f = add(new THREE.SphereGeometry(0.028, 10, 6), darkWood, sx * 0.165, 0.025, sz * 0.165);
    f.scale.set(1, 0.9, 1);
    add(new THREE.SphereGeometry(0.008, 6, 4), brass, sx * 0.165, 0.048, sz * 0.165);
  }
  box(0.39, 0.025, 0.39, darkWood, 0, 0.055, 0);
  box(0.36, 0.11, 0.36, wood, 0, 0.1225, 0);
  box(0.39, 0.016, 0.39, darkWood, 0, 0.1855, 0);
  box(0.395, 0.004, 0.395, brass, 0, 0.069, 0);
  const T = 0.1935;

  // corner columns
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    cyl(0.014, 0.014, 0.11, 8, darkWood, sx * 0.18, 0.1225, sz * 0.18);
    cyl(0.017, 0.017, 0.008, 8, brass, sx * 0.18, 0.073, sz * 0.18);
    cyl(0.017, 0.017, 0.008, 8, brass, sx * 0.18, 0.172, sz * 0.18);
  }

  // framed panels on all four faces
  for (let k = 0; k < 4; k++) {
    const g = new THREE.Group();
    g.rotation.y = (k * Math.PI) / 2;
    root.add(g);
    const zc = 0.181;
    box(0.29, 0.072, 0.004, darkWood, 0, 0.1225, zc, g);
    box(0.29, 0.004, 0.006, brass, 0, 0.1225 + 0.037, zc + 0.001, g);
    box(0.29, 0.004, 0.006, brass, 0, 0.1225 - 0.037, zc + 0.001, g);
    box(0.004, 0.078, 0.006, brass, -0.145, 0.1225, zc + 0.001, g);
    box(0.004, 0.078, 0.006, brass, 0.145, 0.1225, zc + 0.001, g);
    for (const sx of [-1, 1]) {
      const ro = add(new THREE.SphereGeometry(0.008, 8, 5), brass, sx * 0.115, 0.1225, zc + 0.003, g);
      ro.scale.set(1, 1, 0.5);
    }
    if (k === 0) {
      box(0.09, 0.024, 0.004, plateMat, 0, 0.1225, zc + 0.003, g);
    } else {
      const dia = box(0.02, 0.02, 0.004, brass, 0, 0.1225, zc + 0.003, g);
      dia.rotation.z = Math.PI / 4;
    }
  }

  // crank on +X side
  const crankY = 0.12, crankZ = 0.04;
  const esc = cyl(0.022, 0.022, 0.006, 12, brass, 0.186, crankY, crankZ); esc.rotation.z = Math.PI / 2;
  const sh = cyl(0.006, 0.006, 0.04, 8, brass, 0.205, crankY, crankZ); sh.rotation.z = Math.PI / 2;
  box(0.008, 0.075, 0.014, brass, 0.226, crankY - 0.03, crankZ);
  const kpin = cyl(0.004, 0.004, 0.02, 6, brass, 0.236, crankY - 0.062, crankZ); kpin.rotation.z = Math.PI / 2;
  const knob = cyl(0.01, 0.008, 0.032, 10, ebony, 0.256, crankY - 0.062, crankZ); knob.rotation.z = Math.PI / 2;

  // ---------- turntable ----------
  cyl(0.145, 0.145, 0.012, 32, felt, 0, T + 0.006, 0);
  cyl(0.147, 0.147, 0.003, 32, brass, 0, T + 0.0015, 0);
  cyl(0.13, 0.13, 0.004, 32, vinyl, 0, T + 0.014, 0);
  const RT = T + 0.016;
  const disc = add(new THREE.CircleGeometry(0.13, 48), recordTop, 0, RT + 0.0005, 0);
  disc.rotation.x = -Math.PI / 2;
  cyl(0.004, 0.004, 0.016, 8, brass, 0, RT + 0.008, 0);

  // speed dial + needle tin
  cyl(0.02, 0.02, 0.004, 12, brass, 0.15, T + 0.002, 0.15);
  const lever = box(0.004, 0.006, 0.026, ebony, 0.15, T + 0.007, 0.15); lever.rotation.y = 0.6;
  cyl(0.018, 0.018, 0.022, 12, brass, -0.15, T + 0.011, 0.15);
  cyl(0.0185, 0.0185, 0.004, 12, red, -0.15, T + 0.023, 0.15);

  // ---------- tonearm & soundbox ----------
  const P = new THREE.Vector3(0, T + 0.065, -0.16);
  cyl(0.035, 0.038, 0.01, 16, brass, 0, T + 0.005, -0.16);
  cyl(0.02, 0.024, 0.06, 12, brass, 0, T + 0.035, -0.16);
  add(new THREE.SphereGeometry(0.026, 12, 8), brass, P.x, P.y, P.z);

  const sbY = RT + 0.045;
  const armCurve = new THREE.CatmullRomCurve3([
    P.clone(),
    new THREE.Vector3(0.02, 0.268, -0.08),
    new THREE.Vector3(0.05, 0.268, 0.0),
    new THREE.Vector3(0.06, 0.262, 0.045),
    new THREE.Vector3(0.06, sbY, 0.064),
  ]);
  add(new THREE.TubeGeometry(armCurve, 20, 0.009, 8), brass, 0, 0, 0);

  const sb = cyl(0.032, 0.032, 0.016, 16, brass, 0.06, sbY, 0.07); sb.rotation.x = Math.PI / 2;
  const face = add(new THREE.CircleGeometry(0.026, 16), mica, 0.06, sbY, 0.0785);
  face.rotation.y = 0;
  const rim = add(new THREE.TorusGeometry(0.03, 0.0035, 6, 20), brass, 0.06, sbY, 0.078);
  rim.rotation.set(0, 0, 0);
  add(new THREE.SphereGeometry(0.005, 8, 5), brass, 0.06, sbY, 0.08);
  box(0.008, 0.024, 0.008, brass, 0.06, sbY - 0.034, 0.07);
  const needle = add(new THREE.ConeGeometry(0.002, 0.012, 6), ebony, 0.06, RT + 0.006, 0.07);
  needle.rotation.x = Math.PI;

  // ---------- neck & horn ----------
  const L = 0.5, tilt = 1.2;
  const throat = new THREE.Vector3(0, 0.45, -0.18);
  const neckCurve = new THREE.CatmullRomCurve3([
    P.clone(),
    new THREE.Vector3(0, 0.33, -0.25),
    new THREE.Vector3(0, 0.40, -0.275),
    throat.clone(),
  ]);
  add(new THREE.TubeGeometry(neckCurve, 24, 0.018, 10), brass, 0, 0, 0);
  rod(new THREE.Vector3(0, 0.16, -0.19), new THREE.Vector3(0, 0.33, -0.25), 0.005, brass);
  box(0.03, 0.02, 0.008, brass, 0, 0.16, -0.188);

  const horn = new THREE.Group();
  horn.position.copy(throat);
  horn.rotation.x = tilt;
  root.add(horn);

  const amp = 0.07;
  const pts: THREE.Vector2[] = [];
  const N = 14;
  for (let j = 0; j <= N; j++) {
    const t = j / N;
    pts.push(new THREE.Vector2(0.018 + 0.24 * Math.pow(t, 2.8), t * L));
  }
  const hg = new THREE.LatheGeometry(pts, 32);
  {
    const pos = hg.attributes.position, uv = hg.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const u = uv.getX(i), v = uv.getY(i);
      const s = 1 + amp * v * v * Math.abs(Math.sin(8 * Math.PI * u));
      pos.setX(i, pos.getX(i) * s);
      pos.setZ(i, pos.getZ(i) * s);
    }
    hg.computeVertexNormals();
  }
  add(hg, hornMat, 0, 0, 0, horn);

  const rMouth = 0.018 + 0.24;
  const tg = new THREE.TorusGeometry(rMouth, 0.008, 6, 64);
  tg.rotateX(Math.PI / 2);
  {
    const pos = tg.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const u = Math.atan2(x, z) / (Math.PI * 2);
      const s = 1 + amp * Math.abs(Math.sin(8 * Math.PI * u));
      pos.setX(i, x * s); pos.setZ(i, z * s);
    }
    tg.computeVertexNormals();
  }
  add(tg, brass, 0, L, 0, horn);
  for (let k = 0; k < 8; k++) {
    const phi = (k / 8) * Math.PI * 2;
    add(new THREE.SphereGeometry(0.012, 8, 6), brass, Math.sin(phi) * rMouth, L, Math.cos(phi) * rMouth, horn);
  }
  cyl(0.026, 0.024, 0.04, 12, brass, 0, 0.01, 0, horn);
  add(new THREE.TorusGeometry(0.026, 0.004, 6, 14), brass, 0, 0.032, 0, horn).rotation.x = Math.PI / 2;

  return root;
}
```