```ts
import * as THREE from "three";

export const meta = {
  name: "Vanguard No. 5 Typewriter (1934)",
  description:
    "A 1930s desk typewriter in glossy racing green with gold pinstripes. Four staggered rows of round glass keys with cream letters sit in chrome rims. A fan of thin type bars lies behind them, and a chrome carriage return lever rises at the left. The black platen holds a half-typed letter, and a small brass maker's badge sits on the front apron.",
};

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvasTex(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rand = makeRng(1934);

  const M = (c: number, r: number, m = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...extra });

  const green = M(0x0d4a2a, 0.14, 0.2);
  const chrome = M(0xe8ecf0, 0.2, 0.75);
  const steel = M(0x9da4ab, 0.35, 0.7);
  const glossBlack = M(0x121212, 0.28, 0.1);
  const rubber = M(0x1b1b1b, 0.85, 0);
  const gold = M(0xd8ac4e, 0.3, 0.65);
  const brass = M(0xb8893a, 0.32, 0.7);
  const felt = M(0x3b2a22, 0.95, 0);
  const deckBlack = M(0x1e1f1d, 0.7, 0.1);
  const ribbonBlack = M(0x202024, 0.8, 0);
  const ribbonRed = M(0xa3201f, 0.7, 0);

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    root.add(m);
    return m;
  };

  const Z = new THREE.Vector3(0, 0, 1);
  const strip = (a: THREE.Vector3, b: THREE.Vector3, w: number, h: number, mat: THREE.Material) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = add(new THREE.BoxGeometry(w, h, len), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(Z, d.normalize());
    return m;
  };

  const profileExtrude = (pts: [number, number][], width: number, bevel: number) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: width,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 4,
    });
    g.rotateY(-Math.PI / 2);
    g.translate(width / 2, 0, 0);
    return g;
  };

  // ---------- Body ----------
  add(
    profileExtrude(
      [
        [0.155, 0.012],
        [0.155, 0.032],
        [0.03, 0.09],
        [0.015, 0.096],
        [-0.155, 0.096],
        [-0.155, 0.012],
      ],
      0.29,
      0.004
    ),
    green
  );
  const slopeY = (z: number) => 0.0364 + (0.155 - z) * 0.464;

  // side cheeks
  const cheekPts: [number, number][] = [
    [0.162, 0.008],
    [0.162, 0.058],
    [0.02, 0.124],
    [-0.12, 0.132],
    [-0.152, 0.118],
    [-0.162, 0.008],
  ];
  const cheekGeo = profileExtrude(cheekPts, 0.012, 0.002);
  for (const sx of [-1, 1]) {
    add(cheekGeo, green, sx * 0.152, 0, 0);
    // gold pinstripe frame
    const xs = sx * 0.1605;
    const sp: [number, number][] = [
      [0.154, 0.02],
      [0.154, 0.052],
      [0.022, 0.114],
      [-0.115, 0.122],
      [-0.141, 0.11],
      [-0.15, 0.02],
      [0.154, 0.02],
    ];
    for (let i = 0; i < sp.length - 1; i++) {
      strip(
        new THREE.Vector3(xs, sp[i][1], sp[i][0]),
        new THREE.Vector3(xs, sp[i + 1][1], sp[i + 1][0]),
        0.001,
        0.0022,
        gold
      );
    }
  }

  // feet
  const footGeo = new THREE.CylinderGeometry(0.013, 0.014, 0.01, 12);
  for (const fx of [-0.13, 0.13]) for (const fz of [-0.13, 0.13]) add(footGeo, rubber, fx, 0.005, fz);

  // front apron pinstripes + badge
  add(new THREE.BoxGeometry(0.28, 0.0013, 0.001), gold, 0, 0.0335, 0.1595);
  add(new THREE.BoxGeometry(0.28, 0.0013, 0.001), gold, 0, 0.0105, 0.1595);
  add(new THREE.BoxGeometry(0.066, 0.019, 0.002), brass, 0, 0.022, 0.1598);
  const badgeTex = canvasTex(512, 128, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "#f3d58a");
    g.addColorStop(0.5, "#c99a3e");
    g.addColorStop(1, "#8a6224");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = "#5a3d12";
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 492, 108);
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 472, 88);
    ctx.font = "bold 66px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff1c4";
    ctx.fillText("VANGUARD", 258, 68);
    ctx.fillStyle = "#4a3110";
    ctx.fillText("VANGUARD", 256, 66);
  });
  add(new THREE.PlaneGeometry(0.06, 0.015), M(0xffffff, 0.3, 0.6, { map: badgeTex }), 0, 0.022, 0.1612);

  // ---------- Keys ----------
  const rows = [
    { s: "ZXCVBNM,./", z: 0.128, off: 0.006 },
    { s: "ASDFGHJKL;", z: 0.098, off: 0.0 },
    { s: "QWERTYUIOP", z: 0.068, off: -0.005 },
    { s: "234567890-", z: 0.038, off: -0.01 },
  ];
  const labels: string[] = [];
  rows.forEach((r) => r.s.split("").forEach((c) => labels.push(c)));
  labels.push("SHIFT", "SHIFT");
  const cols = 8;
  const arows = Math.ceil(labels.length / cols);
  const cell = 128;
  const atlas = canvasTex(cols * cell, arows * cell, (ctx) => {
    ctx.fillStyle = "#0c0c0c";
    ctx.fillRect(0, 0, cols * cell, arows * cell);
    labels.forEach((L, i) => {
      const cx = (i % cols) * cell + cell / 2;
      const cy = Math.floor(i / cols) * cell + cell / 2;
      const g = ctx.createRadialGradient(cx - 18, cy - 22, 4, cx, cy, 64);
      g.addColorStop(0, "#3a3a3a");
      g.addColorStop(1, "#0d0d0d");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 63, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#efe2bf";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#f2e6c4";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = L.length > 1 ? "bold 26px Georgia, serif" : "bold 62px Georgia, serif";
      ctx.fillText(L, cx, cy + 3);
    });
  });
  const keyFaceMat = M(0xffffff, 0.18, 0.05, { map: atlas });
  const keyFace = (idx: number, r: number) => {
    const g = new THREE.CircleGeometry(r, 20);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (col + uv.getX(i)) / cols, 1 - (row + 1) / arows + uv.getY(i) / arows);
    }
    g.rotateX(-Math.PI / 2);
    return g;
  };
  const rimGeo = new THREE.CylinderGeometry(0.0088, 0.0088, 0.0035, 20);
  const rimRing = new THREE.TorusGeometry(0.0081, 0.0009, 5, 18);
  rimRing.rotateX(Math.PI / 2);
  const placeKey = (idx: number, x: number, z: number) => {
    const sy = slopeY(z);
    const top = sy + 0.022;
    const h = top - sy;
    add(new THREE.CylinderGeometry(0.0013, 0.0013, h, 6), chrome, x, sy + h / 2 - 0.002, z);
    add(rimGeo, chrome, x, top, z);
    add(rimRing, chrome, x, top + 0.0018, z);
    add(keyFace(idx, 0.0074), keyFaceMat, x, top + 0.0019, z);
  };
  let idx = 0;
  const pitch = 0.0205;
  rows.forEach((r) => {
    r.s.split("").forEach((_, k) => {
      placeKey(idx++, (k - 4.5) * pitch + r.off, r.z);
    });
  });
  placeKey(idx++, -4.5 * pitch + 0.006 - 0.026, 0.128);
  placeKey(idx++, 4.5 * pitch + 0.006 + 0.026, 0.128);

  // space bar
  add(new THREE.BoxGeometry(0.15, 0.007, 0.012), chrome, 0, 0.056, 0.148);
  for (const sx of [-0.06, 0.06]) {
    strip(new THREE.Vector3(sx, 0.054, 0.146), new THREE.Vector3(sx, 0.044, 0.125), 0.003, 0.002, chrome);
  }

  // ---------- Type basket ----------
  const zc = -0.08;
  const plate = new THREE.RingGeometry(0.02, 0.108, 28, 1, Math.PI, Math.PI);
  plate.rotateX(-Math.PI / 2);
  add(plate, deckBlack, 0, 0.1004, zc);
  const feltRing = new THREE.RingGeometry(0.09, 0.104, 28, 1, Math.PI, Math.PI);
  feltRing.rotateX(-Math.PI / 2);
  add(feltRing, felt, 0, 0.1009, zc);
  const seg = new THREE.TorusGeometry(0.042, 0.0045, 5, 24, Math.PI);
  seg.rotateX(Math.PI / 2);
  add(seg, chrome, 0, 0.116, zc);
  const N = 38;
  for (let i = 0; i < N; i++) {
    const phi = 0.12 + (i / (N - 1)) * (Math.PI - 0.24);
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    const a = new THREE.Vector3(c * 0.044, 0.1165, zc + s * 0.044);
    const b = new THREE.Vector3(c * 0.097, 0.1035, zc + s * 0.097);
    strip(a, b, 0.0022, 0.0014, steel);
    const slugEnd = b.clone().add(new THREE.Vector3(c * 0.006, -0.0005, s * 0.006));
    strip(b, slugEnd, 0.0035, 0.003, chrome);
  }

  // ribbon spools
  for (const sx of [-1, 1]) {
    const x = sx * 0.12;
    const z = -0.012;
    add(new THREE.CylinderGeometry(0.026, 0.024, 0.01, 20), chrome, x, 0.105, z);
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 18), ribbonBlack, x, 0.114, z);
    add(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 10), chrome, x, 0.12, z);
    strip(
      new THREE.Vector3(sx * 0.104, 0.116, -0.022),
      new THREE.Vector3(sx * 0.013, 0.157, -0.067),
      0.008,
      0.0006,
      ribbonBlack
    );
  }
  // type guide + ribbon vibrator
  add(new THREE.BoxGeometry(0.026, 0.006, 0.0022), ribbonBlack, 0, 0.161, -0.0675);
  add(new THREE.BoxGeometry(0.026, 0.006, 0.0022), ribbonRed, 0, 0.155, -0.0675);
  add(new THREE.BoxGeometry(0.03, 0.022, 0.002), chrome, 0, 0.152, -0.0652);

  // ---------- Carriage ----------
  const pz = -0.1;
  const py = 0.172;
  const pr = 0.024;
  // rail + supports
  const rail = new THREE.CylinderGeometry(0.004, 0.004, 0.38, 8);
  rail.rotateZ(Math.PI / 2);
  add(rail, chrome, 0, 0.124, -0.148);
  for (const sx of [-0.12, 0.12]) add(new THREE.BoxGeometry(0.02, 0.024, 0.014), chrome, sx, 0.112, -0.146);
  add(new THREE.BoxGeometry(0.37, 0.02, 0.025), green, 0, 0.14, -0.138);
  add(new THREE.BoxGeometry(0.37, 0.0012, 0.001), gold, 0, 0.146, -0.1253);
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.007, 0.065, 0.075), green, sx * 0.183, 0.16, -0.11);
  }
  // platen
  const platen = new THREE.CylinderGeometry(pr, pr, 0.355, 20);
  platen.rotateZ(Math.PI / 2);
  add(platen, glossBlack, 0, py, pz);
  const shaft = new THREE.CylinderGeometry(0.004, 0.004, 0.43, 8);
  shaft.rotateZ(Math.PI / 2);
  add(shaft, chrome, 0, py, pz);
  const knob = new THREE.CylinderGeometry(0.02, 0.02, 0.018, 16);
  knob.rotateZ(Math.PI / 2);
  const knobRim = new THREE.TorusGeometry(0.0195, 0.0016, 4, 16);
  knobRim.rotateY(Math.PI / 2);
  const cap = new THREE.CylinderGeometry(0.008, 0.008, 0.004, 12);
  cap.rotateZ(Math.PI / 2);
  for (const sx of [-1, 1]) {
    add(knob, glossBlack, sx * 0.2, py, pz);
    add(knobRim, chrome, sx * 0.192, py, pz);
    add(cap, chrome, sx * 0.211, py, pz);
  }

  // margin scale
  add(new THREE.BoxGeometry(0.3, 0.012, 0.003), chrome, 0, 0.142, -0.071);
  const scaleTex = canvasTex(1024, 48, (ctx) => {
    ctx.fillStyle = "#efe4c4";
    ctx.fillRect(0, 0, 1024, 48);
    ctx.fillStyle = "#2a2018";
    ctx.font = "bold 16px Georgia, serif";
    ctx.textAlign = "center";
    for (let i = 0; i <= 80; i++) {
      const x = 12 + i * 12.5;
      const tall = i % 10 === 0;
      ctx.fillRect(x, 0, 2, tall ? 18 : i % 5 === 0 ? 12 : 7);
      if (tall) ctx.fillText(String(i), x, 40);
    }
  });
  add(new THREE.PlaneGeometry(0.29, 0.0085), M(0xffffff, 0.6, 0, { map: scaleTex }), 0, 0.142, -0.0694);

  // paper bail
  const bz = pz + 0.0275 * 0.5;
  const by = py + 0.0275 * 0.866;
  const bail = new THREE.CylinderGeometry(0.0018, 0.0018, 0.3, 8);
  bail.rotateZ(Math.PI / 2);
  add(bail, chrome, 0, by, bz);
  const roller = new THREE.CylinderGeometry(0.0035, 0.0035, 0.012, 10);
  roller.rotateZ(Math.PI / 2);
  for (const sx of [-0.06, 0.06]) add(roller, rubber, sx, by, bz);
  for (const sx of [-1, 1]) {
    strip(new THREE.Vector3(sx * 0.15, by, bz), new THREE.Vector3(sx * 0.18, py + 0.01, pz - 0.005), 0.003, 0.003, chrome);
  }

  // paper table
  const tilt = (12 * Math.PI) / 180;
  const dz = -Math.sin(tilt);
  const dy = Math.cos(tilt);
  const paperBottom = new THREE.Vector3(0, py + pr + 0.0005, pz);
  const nZ = -Math.cos(tilt) * 0.008;
  const nY = -Math.sin(tilt) * 0.008;
  const tableC = paperBottom.clone().add(new THREE.Vector3(0, nY + dy * 0.08, nZ + dz * 0.08));
  const table = add(new THREE.BoxGeometry(0.26, 0.13, 0.003), green, tableC.x, tableC.y, tableC.z);
  table.rotation.x = -tilt;
  const goldEdge = add(
    new THREE.BoxGeometry(0.26, 0.003, 0.0035),
    gold,
    tableC.x,
    tableC.y + dy * 0.064,
    tableC.z + dz * 0.064
  );
  goldEdge.rotation.x = -tilt;
  for (const sx of [-0.1, 0.1]) {
    strip(
      new THREE.Vector3(sx, tableC.y - dy * 0.02, tableC.z - dz * 0.02 - 0.003),
      new THREE.Vector3(sx, 0.145, -0.145),
      0.004,
      0.003,
      chrome
    );
  }

  // paper with half-typed letter
  const lines = [
    "VANGUARD TYPEWRITER CO.        Nov. 3, 1934",
    "",
    "Dear Eleanor,",
    "",
    "    The new machine arrived this morning,",
    "green as a racing car and twice as handsome.",
    "Every key rings like a little bell. I have",
    "set it by the window where the light can",
    "catch the chrome, and I confess I have done",
    "little else all afternoon but type nonsense:",
    "the quick brown fox jumps over the lazy dog,",
    "again and again, only to hear the carriage",
    "run and the bell sound at the margin. I shall",
    "write properly soon, I prom",
  ];
  const paperTex = canvasTex(1024, 1043, (ctx) => {
    ctx.fillStyle = "#f5efdf";
    ctx.fillRect(0, 0, 1024, 1043);
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = `rgba(150,130,90,${0.04 * rand()})`;
      ctx.fillRect(rand() * 1024, rand() * 1043, 2, 2);
    }
    ctx.font = "26px 'Courier New', Courier, monospace";
    ctx.textBaseline = "alphabetic";
    lines.forEach((ln, li) => {
      for (let ci = 0; ci < ln.length; ci++) {
        const a = 0.6 + 0.4 * rand();
        ctx.fillStyle = `rgba(28,26,36,${a})`;
        ctx.fillText(ln[ci], 150 + ci * 15.6, 130 + li * 36 + (rand() - 0.5) * 1.5);
      }
    });
  });
  const paperMat = M(0xffffff, 0.9, 0, { map: paperTex, side: THREE.DoubleSide });
  const paperC = paperBottom.clone().add(new THREE.Vector3(0, dy * 0.11, dz * 0.11));
  const paper = add(new THREE.PlaneGeometry(0.216, 0.22), paperMat, paperC.x, paperC.y, paperC.z);
  paper.rotation.x = -tilt;
  const wrap = new THREE.CylinderGeometry(pr + 0.0006, pr + 0.0006, 0.216, 16, 1, true, -Math.PI / 3, (5 * Math.PI) / 6);
  const wuv = wrap.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < wuv.count; i++) wuv.setXY(i, wuv.getY(i), 0.01 + wuv.getX(i) * 0.03);
  wrap.rotateZ(Math.PI / 2);
  add(wrap, paperMat, 0, py, pz);

  // ---------- Carriage return lever (typist's left, -X) ----------
  add(new THREE.BoxGeometry(0.012, 0.014, 0.016), chrome, -0.188, py + 0.024, pz + 0.01);
  const leverCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.19, py + 0.026, pz + 0.012),
    new THREE.Vector3(-0.198, py + 0.034, pz + 0.04),
    new THREE.Vector3(-0.21, py + 0.042, pz + 0.07),
    new THREE.Vector3(-0.218, py + 0.046, pz + 0.1),
    new THREE.Vector3(-0.219, py + 0.043, pz + 0.12),
  ]);
  add(new THREE.TubeGeometry(leverCurve, 24, 0.0028, 6, false), chrome);
  const paddle = add(new THREE.SphereGeometry(0.0065, 12, 8), chrome, -0.219, py + 0.043, pz + 0.123);
  paddle.scale.set(0.8, 0.7, 1.4);

  // little margin bell on the back bar
  const bell = new THREE.SphereGeometry(0.011, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  add(bell, chrome, 0.14, 0.15, -0.145);

  return root;
}
```