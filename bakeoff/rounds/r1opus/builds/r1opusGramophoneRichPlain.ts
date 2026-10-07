import * as THREE from "three";

export const meta = {
  name: "Morning-Glory Gramophone",
  description:
    "An antique gramophone on a carved walnut cabinet with pale floral marquetry, brass claw feet, a silver tonearm, a black record with a red label, a side wind-up crank and a huge petal-paneled morning-glory horn in patinated brass.",
};

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export default function build(): THREE.Object3D {
  const rand = mulberry32(1907);
  const root = new THREE.Group();

  // ---------- textures ----------
  const grain = (c: CanvasRenderingContext2D, w: number, h: number, base: string) => {
    c.fillStyle = base;
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 110; i++) {
      const y0 = rand() * h;
      const amp = 2 + rand() * 6;
      const fr = 0.005 + rand() * 0.02;
      const ph = rand() * 6;
      c.strokeStyle =
        rand() < 0.6
          ? `rgba(25,12,4,${0.15 + rand() * 0.3})`
          : `rgba(150,95,55,${0.1 + rand() * 0.25})`;
      c.lineWidth = 0.6 + rand() * 2.4;
      c.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = y0 + Math.sin(x * fr + ph) * amp + Math.sin(x * fr * 3.1 + ph) * amp * 0.3;
        if (x === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.stroke();
    }
  };
  const PALE = "#ecdcb4";
  const PALE_LINE = "#b6976a";
  const petal = (c: CanvasRenderingContext2D, x: number, y: number, ang: number, rx: number, ry: number, off: number) => {
    c.save();
    c.translate(x, y);
    c.rotate(ang);
    c.beginPath();
    c.ellipse(off, 0, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = PALE;
    c.fill();
    c.strokeStyle = PALE_LINE;
    c.lineWidth = 1.2;
    c.stroke();
    c.restore();
  };
  const flower = (c: CanvasRenderingContext2D, x: number, y: number, n: number, s: number) => {
    for (let i = 0; i < n; i++) petal(c, x, y, (i / n) * Math.PI * 2, s, s * 0.4, s * 0.9);
    c.beginPath();
    c.arc(x, y, s * 0.35, 0, Math.PI * 2);
    c.fillStyle = "#4a2a16";
    c.fill();
    c.strokeStyle = PALE;
    c.lineWidth = 2;
    c.stroke();
  };
  const bez = (t: number, p0: number, p1: number, p2: number, p3: number) =>
    (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3;

  const inlayTex = makeTex(512, 320, (c) => {
    grain(c, 512, 320, "#5c3520");
    c.strokeStyle = PALE;
    c.lineWidth = 5;
    c.strokeRect(24, 24, 464, 272);
    c.lineWidth = 2;
    c.strokeRect(36, 36, 440, 248);
    // corner fans
    const corners = [
      [36, 36, 0],
      [476, 36, Math.PI / 2],
      [476, 284, Math.PI],
      [36, 284, -Math.PI / 2],
    ];
    for (const [x, y, a] of corners) {
      for (let i = 0; i < 5; i++) petal(c, x, y, a + (i + 0.5) * (Math.PI / 2 / 5), 16, 5, 16);
    }
    // vines, mirrored
    for (const side of [1, -1]) {
      c.save();
      if (side < 0) {
        c.translate(512, 0);
        c.scale(-1, 1);
      }
      const P = [256, 160, 320, 80, 390, 240, 448, 160];
      c.strokeStyle = PALE;
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(P[0], P[1]);
      c.bezierCurveTo(P[2], P[3], P[4], P[5], P[6], P[7]);
      c.stroke();
      for (let k = 1; k < 8; k++) {
        const t = k / 8;
        const x = bez(t, P[0], P[2], P[4], P[6]);
        const y = bez(t, P[1], P[3], P[5], P[7]);
        const dx = bez(t + 0.01, P[0], P[2], P[4], P[6]) - x;
        const dy = bez(t + 0.01, P[1], P[3], P[5], P[7]) - y;
        const a = Math.atan2(dy, dx) + (k % 2 ? 0.9 : -0.9);
        petal(c, x, y, a, 13, 5, 12);
      }
      flower(c, 448, 160, 5, 13);
      flower(c, 330, 205, 5, 8);
      c.restore();
    }
    flower(c, 256, 160, 8, 30);
  });

  const lidTex = makeTex(512, 512, (c) => {
    grain(c, 512, 512, "#5a341f");
    c.strokeStyle = PALE;
    c.lineWidth = 6;
    c.strokeRect(18, 18, 476, 476);
    c.lineWidth = 2;
    c.strokeRect(32, 32, 448, 448);
    for (const [x, y] of [
      [64, 64],
      [448, 64],
      [448, 448],
      [64, 448],
    ])
      flower(c, x, y, 6, 14);
    c.beginPath();
    c.arc(256, 256, 200, 0, Math.PI * 2);
    c.lineWidth = 3;
    c.strokeStyle = PALE;
    c.stroke();
  });

  const hornTex = makeTex(256, 512, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#f0c46a");
    g.addColorStop(0.5, "#cf9a42");
    g.addColorStop(1, "#9c6d2a");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 512);
    const h = c.createLinearGradient(0, 0, 256, 0);
    h.addColorStop(0, "rgba(70,40,10,0.35)");
    h.addColorStop(0.45, "rgba(255,235,170,0.25)");
    h.addColorStop(0.6, "rgba(255,235,170,0.15)");
    h.addColorStop(1, "rgba(70,40,10,0.35)");
    c.fillStyle = h;
    c.fillRect(0, 0, 256, 512);
    for (let y = 0; y < 512; y += 3) {
      c.fillStyle = `rgba(255,240,200,${rand() * 0.06})`;
      c.fillRect(0, y, 256, 1);
    }
    for (let i = 0; i < 90; i++) {
      const edge = rand() < 0.6;
      const x = edge ? (rand() < 0.5 ? rand() * 40 : 256 - rand() * 40) : rand() * 256;
      const y = Math.pow(rand(), 0.7) * 512;
      const r = 8 + rand() * 30;
      const rg = c.createRadialGradient(x, y, 0, x, y, r);
      const green = rand() < 0.8;
      rg.addColorStop(0, green ? "rgba(96,150,110,0.45)" : "rgba(90,50,20,0.35)");
      rg.addColorStop(1, "rgba(96,150,110,0)");
      c.fillStyle = rg;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
  });

  const recordTex = makeTex(256, 256, (c) => {
    c.fillStyle = "#0c0c0e";
    c.fillRect(0, 0, 256, 256);
    for (let r = 42; r < 126; r += 1.6) {
      c.strokeStyle = rand() < 0.5 ? "#1d1d22" : "#070708";
      c.lineWidth = 0.8;
      c.beginPath();
      c.arc(128, 128, r, 0, Math.PI * 2);
      c.stroke();
    }
    for (const a of [0.6, 0.6 + Math.PI]) {
      c.fillStyle = "rgba(255,255,255,0.07)";
      c.beginPath();
      c.moveTo(128, 128);
      c.arc(128, 128, 126, a - 0.25, a + 0.25);
      c.fill();
    }
    c.strokeStyle = "#2a2a30";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(128, 128, 125, 0, Math.PI * 2);
    c.stroke();
  });

  const labelTex = makeTex(256, 256, (c) => {
    c.fillStyle = "#b11d29";
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = "#e8c66a";
    c.lineWidth = 6;
    c.beginPath();
    c.arc(128, 128, 116, 0, Math.PI * 2);
    c.stroke();
    c.lineWidth = 2;
    c.beginPath();
    c.arc(128, 128, 104, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = "#f0d27a";
    c.font = "bold 30px serif";
    c.textAlign = "center";
    c.fillText("GLORIA", 128, 80);
    c.font = "italic 18px serif";
    c.fillText("Waltz in Bloom", 128, 182);
    c.font = "14px serif";
    c.fillText("78 R.P.M.", 128, 205);
    for (let i = 0; i < 6; i++) petal(c, 128, 128, (i / 6) * Math.PI * 2, 12, 5, 16);
    c.fillStyle = "#111";
    c.beginPath();
    c.arc(128, 128, 7, 0, Math.PI * 2);
    c.fill();
  });

  // ---------- materials ----------
  const M = (o: THREE.MeshStandardMaterialParameters) =>
    new THREE.MeshStandardMaterial({ flatShading: true, ...o });
  const walnutInlay = M({ map: inlayTex, roughness: 0.5, metalness: 0.05 });
  const walnutLid = M({ map: lidTex, roughness: 0.45, metalness: 0.05 });
  const darkWood = M({ color: "#3e2414", roughness: 0.55 });
  const knobWood = M({ color: "#25140a", roughness: 0.4 });
  const brass = M({ color: "#c8933c", metalness: 0.8, roughness: 0.35 });
  const brassDark = M({ color: "#8c6326", metalness: 0.75, roughness: 0.45 });
  const patina = M({ color: "#8fa06a", metalness: 0.45, roughness: 0.6 });
  const silver = M({ color: "#dadde3", metalness: 0.9, roughness: 0.22 });
  const blackPlain = M({ color: "#111114", roughness: 0.3 });
  const recordTop = M({ map: recordTex, roughness: 0.25, metalness: 0.1 });
  const red = M({ color: "#b11d29", roughness: 0.5 });
  const labelTop = M({ map: labelTex, roughness: 0.5 });
  const felt = M({ color: "#4f1622", roughness: 0.95 });
  const mica = M({ color: "#3a3026", roughness: 0.2, metalness: 0.3 });
  const hornA = M({ map: hornTex, metalness: 0.7, roughness: 0.38, side: THREE.DoubleSide });
  const hornB = M({ map: hornTex, color: "#e6d9b8", metalness: 0.7, roughness: 0.42, side: THREE.DoubleSide });

  const add = (g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0, parent: THREE.Object3D = root) => {
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const UP = new THREE.Vector3(0, 1, 0);
  const rod = (a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material, seg = 8, parent: THREE.Object3D = root) => {
    const d = b.clone().sub(a);
    const mesh = add(new THREE.CylinderGeometry(r, r, d.length(), seg), m, 0, 0, 0, parent);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, d.normalize());
    return mesh;
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- claw feet ----------
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const fx = sx * 0.2,
        fz = sz * 0.2;
      add(new THREE.SphereGeometry(0.028, 8, 6), darkWood, fx, 0.028, fz);
      for (let k = 0; k < 4; k++) {
        const a = k * (Math.PI / 2) + Math.PI / 4;
        const dx = Math.sin(a),
          dz = Math.cos(a);
        const top = V(fx + dx * 0.016, 0.058, fz + dz * 0.016);
        const mid = V(fx + dx * 0.031, 0.035, fz + dz * 0.031);
        const tip = V(fx + dx * 0.024, 0.008, fz + dz * 0.024);
        rod(top, mid, 0.0065, brass, 5);
        rod(mid, tip, 0.0055, brass, 5);
        add(new THREE.SphereGeometry(0.008, 5, 4), brass, mid.x, mid.y, mid.z);
        add(new THREE.ConeGeometry(0.005, 0.012, 5), brassDark, tip.x, tip.y - 0.002, tip.z).rotation.x = Math.PI;
      }
      add(new THREE.CylinderGeometry(0.024, 0.026, 0.012, 8), brass, fx, 0.06, fz);
      add(new THREE.CylinderGeometry(0.032, 0.022, 0.04, 8), darkWood, fx, 0.085, fz);
    }

  // ---------- cabinet ----------
  add(new THREE.BoxGeometry(0.47, 0.035, 0.47), darkWood, 0, 0.1075, 0);
  add(new THREE.BoxGeometry(0.44, 0.012, 0.44), brassDark, 0, 0.128, 0);
  add(new THREE.BoxGeometry(0.42, 0.25, 0.42), walnutInlay, 0, 0.25, 0);
  add(new THREE.BoxGeometry(0.45, 0.018, 0.45), darkWood, 0, 0.384, 0);
  add(new THREE.BoxGeometry(0.47, 0.022, 0.47), walnutLid, 0, 0.404, 0);
  add(new THREE.BoxGeometry(0.474, 0.006, 0.474), brassDark, 0, 0.395, 0);

  // pilasters with carved capitals
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 0.212,
        z = sz * 0.212;
      add(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 8), darkWood, x, 0.25, z);
      add(new THREE.BoxGeometry(0.05, 0.02, 0.05), darkWood, x, 0.365, z);
      add(new THREE.BoxGeometry(0.05, 0.02, 0.05), darkWood, x, 0.138, z);
      add(new THREE.TorusGeometry(0.019, 0.004, 4, 10), brass, x, 0.345, z).rotation.x = Math.PI / 2;
      add(new THREE.TorusGeometry(0.019, 0.004, 4, 10), brass, x, 0.158, z).rotation.x = Math.PI / 2;
      add(new THREE.SphereGeometry(0.012, 6, 4), PALE ? darkWood : darkWood, x, 0.25, z).scale.set(1.7, 1, 1.7);
    }

  // raised frame mouldings on each face
  for (let f = 0; f < 4; f++) {
    const g = new THREE.Group();
    g.rotation.y = (f * Math.PI) / 2;
    root.add(g);
    const zf = 0.214;
    add(new THREE.BoxGeometry(0.34, 0.014, 0.012), darkWood, 0, 0.356, zf, g);
    add(new THREE.BoxGeometry(0.34, 0.014, 0.012), darkWood, 0, 0.144, zf, g);
    add(new THREE.BoxGeometry(0.014, 0.2, 0.012), darkWood, 0.163, 0.25, zf, g);
    add(new THREE.BoxGeometry(0.014, 0.2, 0.012), darkWood, -0.163, 0.25, zf, g);
    for (const sx of [1, -1])
      for (const y of [0.144, 0.356]) add(new THREE.SphereGeometry(0.009, 6, 4), brass, sx * 0.163, y, zf + 0.006, g);
  }

  // carved scalloped apron under front
  add(new THREE.BoxGeometry(0.32, 0.03, 0.02), darkWood, 0, 0.075, 0.21);
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.045;
    const s = add(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10, 1, false, Math.PI / 2, Math.PI), darkWood, x, 0.06, 0.21);
    s.rotation.x = Math.PI / 2;
    add(new THREE.SphereGeometry(0.005, 5, 4), brass, x, 0.052, 0.221);
  }
  // keyhole escutcheon & maker's plaque
  const esc = add(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 10), brass, 0, 0.32, 0.222);
  esc.rotation.x = Math.PI / 2;
  add(new THREE.BoxGeometry(0.004, 0.012, 0.004), blackPlain, 0, 0.318, 0.224);
  add(new THREE.BoxGeometry(0.08, 0.016, 0.003), brass, 0, 0.395, 0.236);

  // ---------- turntable ----------
  const tz = 0.02;
  add(new THREE.CylinderGeometry(0.155, 0.155, 0.012, 32), [silver, felt, silver], 0, 0.421, tz);
  add(new THREE.CylinderGeometry(0.145, 0.145, 0.004, 40), [blackPlain, recordTop, blackPlain], 0, 0.429, tz);
  add(new THREE.CylinderGeometry(0.045, 0.045, 0.0012, 28), [red, labelTop, red], 0, 0.4316, tz);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.02, 6), silver, 0, 0.44, tz);
  add(new THREE.SphereGeometry(0.005, 6, 4), silver, 0, 0.45, tz);

  // speed knob & brake lever
  add(new THREE.CylinderGeometry(0.012, 0.014, 0.012, 8), silver, -0.18, 0.421, 0.18);
  add(new THREE.BoxGeometry(0.004, 0.006, 0.02), silver, -0.18, 0.43, 0.18);
  add(new THREE.BoxGeometry(0.04, 0.004, 0.02), brass, -0.16, 0.417, -0.18);
  rod(V(-0.16, 0.419, -0.18), V(-0.135, 0.432, -0.14), 0.003, silver, 5);
  add(new THREE.SphereGeometry(0.007, 6, 4), knobWood, -0.135, 0.432, -0.14);

  // ---------- tonearm ----------
  const bx = 0.14,
    bz = -0.16;
  add(new THREE.CylinderGeometry(0.03, 0.036, 0.012, 10), silver, bx, 0.421, bz);
  add(new THREE.CylinderGeometry(0.02, 0.024, 0.045, 8), silver, bx, 0.45, bz);
  add(new THREE.TorusGeometry(0.023, 0.004, 4, 10), brass, bx, 0.44, bz).rotation.x = Math.PI / 2;
  add(new THREE.SphereGeometry(0.022, 8, 6), silver, bx, 0.475, bz);
  const armPath = new THREE.CatmullRomCurve3([V(bx, 0.478, bz), V(0.13, 0.484, -0.08), V(0.11, 0.486, 0.0), V(0.092, 0.48, 0.045)]);
  add(new THREE.TubeGeometry(armPath, 14, 0.011, 7), silver);
  // soundbox
  const sbx = 0.09,
    sby = 0.48,
    sbz = 0.065;
  const sb = add(new THREE.CylinderGeometry(0.036, 0.036, 0.016, 14), silver, sbx, sby, sbz);
  sb.rotation.x = Math.PI / 2;
  const mc = add(new THREE.CylinderGeometry(0.026, 0.026, 0.004, 14), mica, sbx, sby, sbz + 0.008);
  mc.rotation.x = Math.PI / 2;
  const ring = add(new THREE.TorusGeometry(0.031, 0.003, 4, 14), brass, sbx, sby, sbz + 0.009);
  ring.rotation.z = 0.1;
  rod(V(sbx, sby, sbz + 0.01), V(sbx, sby - 0.03, sbz + 0.012), 0.002, silver, 4);
  add(new THREE.BoxGeometry(0.008, 0.012, 0.008), silver, sbx, 0.442, sbz + 0.012);
  const needle = add(new THREE.ConeGeometry(0.0025, 0.01, 5), brassDark, sbx, 0.436, sbz + 0.012);
  needle.rotation.x = Math.PI;

  // ---------- horn ----------
  const L = 0.42,
    R = 0.24,
    r0 = 0.024,
    NP = 8,
    NF = 6,
    NT = 14;
  const rad = (t: number) => r0 + (R - r0) * Math.pow(t, 2.8);
  const hornPoint = (k: number, f: number, t: number, grow = 1) => {
    const phi = ((k + f) / NP) * Math.PI * 2;
    const lobe = Math.sin(Math.PI * f);
    const r = rad(t) * (1 + 0.13 * t ** 4 * lobe - 0.02 * t * t * (1 - lobe)) * grow;
    const y = L * t + 0.025 * t ** 6 * lobe;
    return V(r * Math.sin(phi), y, r * Math.cos(phi));
  };
  const horn = new THREE.Group();
  horn.position.set(0, 0.62, -0.28);
  horn.rotation.x = (55 * Math.PI) / 180;
  root.add(horn);
  for (let k = 0; k < NP; k++) {
    const pos: number[] = [],
      uv: number[] = [],
      idx: number[] = [];
    for (let j = 0; j <= NT; j++)
      for (let i = 0; i <= NF; i++) {
        const p = hornPoint(k, i / NF, j / NT);
        pos.push(p.x, p.y, p.z);
        uv.push(i / NF, j / NT);
      }
    for (let j = 0; j < NT; j++)
      for (let i = 0; i < NF; i++) {
        const a = j * (NF + 1) + i,
          b = a + 1,
          c = a + NF + 1,
          d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    add(g, k % 2 ? hornB : hornA, 0, 0, 0, horn);
    // seam rib
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= 12; s++) pts.push(hornPoint(k, 0, 0.04 + (0.96 * s) / 12, 1.02));
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.0035, 5), brassDark, 0, 0, 0, horn);
    for (const t of [0.45, 0.65, 0.82, 0.95]) {
      const p = hornPoint(k, 0, t, 1.035);
      add(new THREE.SphereGeometry(0.005, 5, 4), patina, p.x, p.y, p.z, horn);
    }
  }
  // scalloped rim bead
  const rimPts: THREE.Vector3[] = [];
  for (let k = 0; k < NP; k++) for (let s = 0; s < 8; s++) rimPts.push(hornPoint(k, s / 8, 1, 1.005));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true), 128, 0.006, 5, true), brass, 0, 0, 0, horn);
  // throat collar
  add(new THREE.CylinderGeometry(0.032, 0.032, 0.03, 10), patina, 0, 0.0, 0, horn);
  add(new THREE.TorusGeometry(0.033, 0.005, 4, 10), brass, 0, 0.016, 0, horn).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8), blackPlain, 0, 0.05, 0, horn);

  // neck from tonearm base up to horn throat
  const neck = new THREE.CatmullRomCurve3([V(bx, 0.47, bz), V(0.125, 0.54, -0.26), V(0.05, 0.58, -0.325), V(0, 0.6, -0.31), V(0, 0.62, -0.28)]);
  add(new THREE.TubeGeometry(neck, 24, 0.021, 8), brass);
  add(new THREE.TorusGeometry(0.024, 0.005, 4, 10), patina, 0.125, 0.54, -0.26).lookAt(V(0.1, 0.57, -0.3));

  // horn support bracket on back
  add(new THREE.BoxGeometry(0.06, 0.08, 0.006), brass, 0.03, 0.3, -0.238);
  rod(V(0.03, 0.3, -0.24), V(0.05, 0.4, -0.27), 0.006, brass, 6);
  rod(V(0.05, 0.4, -0.27), V(0.05, 0.575, -0.325), 0.006, brass, 6);
  add(new THREE.TorusGeometry(0.026, 0.005, 4, 10), brassDark, 0.05, 0.578, -0.325).rotation.y = 0.9;

  // ---------- wind-up crank (right side, -X) ----------
  const cy = 0.25,
    cz = 0.0;
  const e1 = add(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 12), brass, -0.217, cy, cz);
  e1.rotation.z = Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    petal; // decorative rosette studs
    add(new THREE.SphereGeometry(0.005, 5, 4), patina, -0.221, cy + Math.sin(a) * 0.022, cz + Math.cos(a) * 0.022);
  }
  rod(V(-0.215, cy, cz), V(-0.262, cy, cz), 0.006, silver, 8);
  add(new THREE.SphereGeometry(0.01, 6, 5), silver, -0.262, cy, cz);
  const crankEnd = V(-0.268, cy - 0.06, cz + 0.05);
  rod(V(-0.268, cy, cz), crankEnd, 0.007, silver, 6).scale.set(1.4, 1, 0.7);
  add(new THREE.SphereGeometry(0.009, 6, 5), silver, crankEnd.x, crankEnd.y, crankEnd.z);
  rod(crankEnd, V(-0.3, crankEnd.y, crankEnd.z), 0.004, silver, 6);
  const knob = add(new THREE.CylinderGeometry(0.011, 0.013, 0.045, 8), knobWood, -0.3, crankEnd.y, crankEnd.z);
  knob.rotation.z = Math.PI / 2;
  add(new THREE.SphereGeometry(0.011, 6, 5), knobWood, -0.323, crankEnd.y, crankEnd.z);

  return root;
}
