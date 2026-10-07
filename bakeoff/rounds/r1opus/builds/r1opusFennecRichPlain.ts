import * as THREE from "three";

export const meta = {
  name: "Fennec Kit at Dusk",
  description:
    "A stylized low-poly fennec fox kit standing alert on a small dusk-lit sand dune. It has enormous satin ears lined in peach, cream fur that warms to sandy gold along its back, oversized paws, a black-tipped fluffy tail, and a woven leather collar with a brass bell.",
};

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rand = makeRng(20240611);
  const root = new THREE.Group();

  // ---------- textures ----------
  function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d")!;
    draw(ctx);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const furTex = canvasTex(128, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#c88a40");
    g.addColorStop(0.3, "#dcaa62");
    g.addColorStop(0.55, "#efd3a2");
    g.addColorStop(0.75, "#f8ecd6");
    g.addColorStop(1, "#fbf3e4");
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 256);
    for (let i = 0; i < 420; i++) {
      const x = rand() * 128, y = rand() * 256;
      const dark = y < 120;
      c.strokeStyle = dark
        ? `rgba(150,95,40,${0.25 + rand() * 0.3})`
        : `rgba(255,250,240,${0.3 + rand() * 0.4})`;
      c.lineWidth = 1 + rand();
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (rand() - 0.5) * 3, y + 4 + rand() * 6);
      c.stroke();
    }
  });

  const sandTex = canvasTex(256, 128, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "#f6bd82");
    g.addColorStop(0.5, "#e89a72");
    g.addColorStop(1, "#b9707a");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 128);
    for (let k = 0; k < 7; k++) {
      const y0 = 14 + k * 15 + rand() * 6;
      c.strokeStyle = "rgba(150,80,80,0.22)";
      c.lineWidth = 2;
      c.beginPath();
      for (let x = 0; x <= 256; x += 8) {
        const y = y0 + Math.sin(x * 0.05 + k) * 3;
        if (x === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.stroke();
      c.strokeStyle = "rgba(255,225,180,0.25)";
      c.lineWidth = 1;
      c.beginPath();
      for (let x = 0; x <= 256; x += 8) {
        const y = y0 - 2 + Math.sin(x * 0.05 + k) * 3;
        if (x === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.stroke();
    }
    for (let i = 0; i < 900; i++) {
      c.fillStyle = rand() < 0.5 ? "rgba(120,60,60,0.25)" : "rgba(255,235,200,0.35)";
      c.fillRect(rand() * 256, rand() * 128, 1, 1);
    }
  });

  const leatherTex = canvasTex(128, 32, (c) => {
    c.fillStyle = "#5e321b";
    c.fillRect(0, 0, 128, 32);
    for (let x = -16; x < 144; x += 16) {
      for (let row = 0; row < 2; row++) {
        const y = row * 16;
        c.fillStyle = row === 0 ? "#9a5c32" : "#86492a";
        c.beginPath();
        c.moveTo(x, y + 2);
        c.lineTo(x + 14, y + 8);
        c.lineTo(x + 14, y + 14);
        c.lineTo(x, y + 8);
        c.closePath();
        c.fill();
        c.fillStyle = row === 0 ? "#b07040" : "#94532e";
        c.beginPath();
        c.moveTo(x + 16, y + 2);
        c.lineTo(x + 2, y + 8);
        c.lineTo(x + 2, y + 14);
        c.lineTo(x + 16, y + 8);
        c.closePath();
        c.fill();
      }
    }
    c.fillStyle = "#3a1d0f";
    c.fillRect(0, 0, 128, 2);
    c.fillRect(0, 30, 128, 2);
  });
  leatherTex.wrapS = THREE.RepeatWrapping;
  leatherTex.repeat.set(7, 1);

  // ---------- materials ----------
  const M = (o: THREE.MeshStandardMaterialParameters) =>
    new THREE.MeshStandardMaterial({ flatShading: true, ...o });
  const furMat = M({ map: furTex, roughness: 0.85 });
  const goldMat = M({ color: "#d59d52", roughness: 0.85 });
  const creamMat = M({ color: "#f8eedb", roughness: 0.9 });
  const peachMat = M({ color: "#f5b39a", roughness: 0.32, metalness: 0.05 });
  const blackMat = M({ color: "#1d1512", roughness: 0.6 });
  const smudgeMat = M({ color: "#6e4a30", roughness: 0.8 });
  const eyeMat = M({ color: "#1a0f0c", roughness: 0.12, metalness: 0.1, flatShading: false });
  const sparkleMat = M({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.6, flatShading: false });
  const noseMat = M({ color: "#2a1c18", roughness: 0.25 });
  const tearMat = M({ color: "#7a5236", roughness: 0.8 });
  const leatherMat = M({ map: leatherTex, roughness: 0.7 });
  const brassMat = M({ color: "#d4a03c", metalness: 0.85, roughness: 0.28 });
  const darkBrassMat = M({ color: "#4a3214", metalness: 0.5, roughness: 0.5 });
  const sandMat = M({ map: sandTex, roughness: 1 });
  const sandDarkMat = M({ color: "#c27a62", roughness: 1 });
  const printMat = M({ color: "#a65e5a", roughness: 1 });
  const pebbleMat = M({ color: "#8a6670", roughness: 0.9 });
  const pebble2Mat = M({ color: "#b8907a", roughness: 0.9 });
  const grassMat = M({ color: "#8a8a4e", roughness: 0.9 });
  const grassDryMat = M({ color: "#c9a464", roughness: 0.9 });
  const leafMat = M({ color: "#6f8f6a", roughness: 0.8 });
  const flowerMat = M({ color: "#ef6f8a", roughness: 0.6 });
  const whiskerMat = M({ color: "#4a3a32", roughness: 0.6 });

  // ---------- helpers ----------
  function add(
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    parent: THREE.Object3D,
    p: [number, number, number],
    s: [number, number, number] = [1, 1, 1],
    r: [number, number, number] = [0, 0, 0]
  ) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(s[0], s[1], s[2]);
    m.rotation.set(r[0], r[1], r[2]);
    parent.add(m);
    return m;
  }
  const UP = new THREE.Vector3(0, 1, 0);
  function cylBetween(
    a: THREE.Vector3,
    b: THREE.Vector3,
    rA: number,
    rB: number,
    mat: THREE.Material,
    parent: THREE.Object3D,
    seg = 7
  ) {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, len, seg), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    parent.add(m);
    return m;
  }
  const sphere = (w = 12, h = 8) => new THREE.SphereGeometry(1, w, h);

  // ---------- dune ----------
  const domes = [
    { cx: 0, cz: 0, rx: 0.44, rz: 0.38, h: 0.13 },
    { cx: 0.27, cz: -0.2, rx: 0.24, rz: 0.2, h: 0.075 },
    { cx: -0.3, cz: 0.13, rx: 0.2, rz: 0.17, h: 0.05 },
  ];
  function dune(x: number, z: number) {
    let best = 0;
    let n = new THREE.Vector3(0, 1, 0);
    for (const d of domes) {
      const u = (x - d.cx) / d.rx, w = (z - d.cz) / d.rz;
      const q = 1 - u * u - w * w;
      if (q <= 0) continue;
      const h = d.h * Math.sqrt(q);
      if (h > best) {
        best = h;
        n = new THREE.Vector3(
          (x - d.cx) / (d.rx * d.rx),
          h / (d.h * d.h),
          (z - d.cz) / (d.rz * d.rz)
        ).normalize();
      }
    }
    return { h: best, n };
  }
  for (const d of domes) {
    add(
      new THREE.SphereGeometry(1, 18, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      sandMat,
      root,
      [d.cx, 0, d.cz],
      [d.rx, d.h, d.rz]
    );
  }
  function onSurface(obj: THREE.Object3D, x: number, z: number, sink = 0) {
    const s = dune(x, z);
    obj.position.set(x, s.h - sink, z);
    obj.quaternion.setFromUnitVectors(UP, s.n);
    return s;
  }

  // wind ripples
  const rippleGeo = new THREE.TorusGeometry(0.06, 0.0035, 3, 10, Math.PI * 0.75);
  const ripples: [number, number, number][] = [
    [-0.22, 0.18, 0.2], [-0.16, 0.25, 0.4], [-0.27, 0.05, -0.1],
    [0.2, 0.22, -0.3], [0.28, 0.1, -0.6], [0.14, 0.29, -0.2], [-0.05, 0.3, 0.1],
  ];
  for (const [x, z, rot] of ripples) {
    const g = new THREE.Group();
    onSurface(g, x, z, 0.001);
    root.add(g);
    add(rippleGeo, sandDarkMat, g, [0, 0, 0], [1, 1, 1], [-Math.PI / 2, 0, rot]);
  }

  // footprints trailing behind
  const printGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.004, 7);
  for (let i = 0; i < 7; i++) {
    const z = -0.15 - i * 0.042;
    const x = (i % 2 === 0 ? 0.028 : -0.028) + i * 0.012;
    const g = new THREE.Group();
    onSurface(g, x, z, 0.0012);
    root.add(g);
    add(printGeo, printMat, g, [0, 0, 0], [1, 1, 1.35]);
    for (let t = -1; t <= 1; t++)
      add(printGeo, printMat, g, [t * 0.009, 0, 0.018], [0.35, 1, 0.35]);
  }

  // pebbles
  const pebGeo = new THREE.DodecahedronGeometry(1, 0);
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.36 + rand() * 0.12;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr * 0.9;
    const s = 0.008 + rand() * 0.012;
    const h = dune(x, z).h;
    add(pebGeo, rand() < 0.5 ? pebbleMat : pebble2Mat, root, [x, h + s * 0.3, z],
      [s * 1.3, s * 0.7, s], [rand(), rand() * 3, rand()]);
  }

  // dry grass tufts
  const bladeGeo = new THREE.ConeGeometry(0.004, 1, 3);
  function tuft(x: number, z: number, n: number, height: number) {
    const s = dune(x, z);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + rand();
      const tilt = 0.25 + rand() * 0.45;
      const hh = height * (0.6 + rand() * 0.5);
      const g = new THREE.Group();
      g.position.set(x, s.h - 0.003, z);
      g.rotation.set(Math.sin(ang) * tilt, 0, -Math.cos(ang) * tilt);
      root.add(g);
      add(bladeGeo, rand() < 0.5 ? grassMat : grassDryMat, g, [0, hh / 2, 0], [1, hh, 1]);
    }
  }
  tuft(-0.36, -0.12, 7, 0.09);
  tuft(0.38, 0.1, 6, 0.07);
  tuft(0.12, -0.36, 5, 0.06);
  tuft(-0.42, 0.2, 5, 0.05);

  // tiny succulent with a flower
  {
    const x = 0.27, z = 0.25;
    const h = dune(x, z).h;
    const leafGeo = new THREE.ConeGeometry(0.008, 0.035, 4);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const g = new THREE.Group();
      g.position.set(x, h, z);
      g.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
      root.add(g);
      add(leafGeo, leafMat, g, [0, 0.016, 0]);
    }
    add(new THREE.CylinderGeometry(0.0015, 0.0015, 0.04, 4), leafMat, root, [x, h + 0.02, z]);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      add(sphere(5, 3), flowerMat, root,
        [x + Math.cos(a) * 0.006, h + 0.042, z + Math.sin(a) * 0.006], [0.006, 0.003, 0.006]);
    }
    add(sphere(5, 3), brassMat, root, [x, h + 0.044, z], [0.003, 0.003, 0.003]);
  }

  // ---------- fox ----------
  const fox = new THREE.Group();
  root.add(fox);
  const T = dune(0, 0).h;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // body & chest
  add(sphere(14, 10), furMat, fox, [0, T + 0.12, -0.005], [0.062, 0.06, 0.105], [-0.1, 0, 0]);
  add(sphere(10, 8), creamMat, fox, [0, T + 0.13, 0.068], [0.046, 0.055, 0.035]);
  const tuftGeo = new THREE.ConeGeometry(0.012, 0.03, 4);
  for (let i = -1; i <= 1; i++)
    add(tuftGeo, creamMat, fox, [i * 0.016, T + 0.085, 0.082], [1, 1, 0.6], [Math.PI + 0.3, 0, i * 0.3]);
  // neck
  cylBetween(V(0, T + 0.13, 0.05), V(0, T + 0.2, 0.105), 0.042, 0.035, furMat, fox, 9);

  // legs
  const paw = (x: number, z: number) => {
    const h = dune(x, z).h;
    add(sphere(10, 6), creamMat, fox, [x, h + 0.008, z + 0.008], [0.023, 0.014, 0.029]);
    for (let t = -1; t <= 1; t++)
      add(sphere(6, 4), creamMat, fox, [x + t * 0.012, h + 0.006, z + 0.032], [0.009, 0.008, 0.009]);
    add(sphere(6, 4), goldMat, fox, [x, h + 0.016, z - 0.012], [0.012, 0.01, 0.01]);
    return h;
  };
  for (const sx of [1, -1]) {
    // front leg
    const fx = sx * 0.036, fz = 0.075;
    const fh = paw(fx, fz);
    cylBetween(V(sx * 0.034, T + 0.1, 0.066), V(fx, fh + 0.014, fz), 0.016, 0.013, goldMat, fox);
    add(sphere(6, 4), creamMat, fox, [sx * 0.04, T + 0.075, 0.07], [0.008, 0.016, 0.008]);
    // hind leg
    const hx = sx * 0.046, hz = -0.07;
    const hh = paw(hx, hz);
    add(sphere(10, 8), furMat, fox, [sx * 0.046, T + 0.105, -0.065], [0.03, 0.045, 0.042], [-0.2, 0, 0]);
    const hock = V(sx * 0.047, T + 0.05, -0.088);
    cylBetween(V(sx * 0.046, T + 0.095, -0.07), hock, 0.018, 0.012, goldMat, fox);
    cylBetween(hock, V(hx, hh + 0.014, hz), 0.012, 0.013, goldMat, fox);
  }

  // tail
  {
    const curve = new THREE.CatmullRomCurve3([
      V(0, T + 0.115, -0.09), V(0, T + 0.085, -0.15), V(0.01, T + 0.07, -0.21),
      V(0.03, T + 0.085, -0.27), V(0.045, T + 0.12, -0.31),
    ]);
    const radii = [0.018, 0.026, 0.031, 0.033, 0.032, 0.028, 0.023, 0.016];
    const fluff = new THREE.IcosahedronGeometry(1, 1);
    for (let i = 0; i < radii.length; i++) {
      const t = i / (radii.length - 1);
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const mat = i >= 6 ? blackMat : i === 5 ? smudgeMat : goldMat;
      const m = add(fluff, mat, fox, [p.x, p.y, p.z], [radii[i], radii[i], radii[i] * 1.35]);
      m.lookAt(p.clone().add(tan));
    }
  }

  // collar + bell
  {
    const theta = Math.atan2(0.07, 0.055);
    const c = V(0, T + 0.163, 0.077);
    const R = 0.04;
    add(new THREE.TorusGeometry(R, 0.0075, 5, 20), leatherMat, fox, [c.x, c.y, c.z], [1, 1, 1], [-theta, 0, 0]);
    const down = V(0, -Math.cos(theta), Math.sin(theta));
    const bp = c.clone().addScaledVector(down, R + 0.012);
    const bell = new THREE.Group();
    bell.position.copy(bp);
    fox.add(bell);
    add(new THREE.TorusGeometry(0.005, 0.0016, 4, 8), brassMat, bell, [0, 0.012, 0]);
    add(sphere(10, 7), brassMat, bell, [0, 0, 0], [0.013, 0.012, 0.013]);
    add(new THREE.CylinderGeometry(0.013, 0.0145, 0.004, 10), brassMat, bell, [0, -0.004, 0]);
    add(new THREE.BoxGeometry(0.018, 0.0025, 0.004), darkBrassMat, bell, [0, -0.004, 0.012]);
    add(sphere(5, 4), darkBrassMat, bell, [0, -0.0075, 0.004], [0.0035, 0.0035, 0.0035]);
    add(new THREE.CylinderGeometry(0.0016, 0.0016, 0.02, 4), brassMat, bell, [0, 0, 0], [1, 1, 1], [0, 0, Math.PI / 2]);
  }

  // head
  const head = new THREE.Group();
  head.position.set(0, T + 0.215, 0.115);
  head.rotation.set(-0.08, 0, 0.12);
  fox.add(head);
  add(sphere(14, 10), furMat, head, [0, 0, 0], [0.062, 0.056, 0.058]);
  // cheeks & chin
  for (const sx of [1, -1]) {
    add(sphere(8, 6), creamMat, head, [sx * 0.036, -0.022, 0.024], [0.03, 0.024, 0.028]);
    add(new THREE.ConeGeometry(0.012, 0.03, 4), creamMat, head, [sx * 0.058, -0.03, 0.01], [1, 1, 0.6], [0, 0, sx * 2.1]);
  }
  add(sphere(8, 6), creamMat, head, [0, -0.034, 0.05], [0.02, 0.013, 0.02]);
  // muzzle
  add(new THREE.ConeGeometry(0.027, 0.058, 8), creamMat, head, [0, -0.017, 0.074], [1, 1, 0.72], [Math.PI / 2, 0, 0]);
  add(sphere(8, 6), noseMat, head, [0, -0.014, 0.103], [0.009, 0.007, 0.007]);
  add(sphere(5, 4), sparkleMat, head, [0.003, -0.01, 0.108], [0.0022, 0.0015, 0.0015]);
  add(new THREE.BoxGeometry(0.014, 0.0018, 0.003), noseMat, head, [0, -0.029, 0.09]);
  // whiskers
  for (const sx of [1, -1]) {
    for (let k = 0; k < 2; k++) {
      cylBetween(
        V(sx * 0.012, -0.02 - k * 0.004, 0.085),
        V(sx * 0.065, -0.012 - k * 0.014, 0.075),
        0.0007, 0.0004, whiskerMat, head, 3
      );
    }
  }
  // eyes
  const eyeGeo = sphere(12, 8);
  for (const sx of [1, -1]) {
    add(eyeGeo, eyeMat, head, [sx * 0.028, 0.008, 0.045], [0.017, 0.018, 0.0095], [0, sx * 0.38, 0]);
    add(sphere(6, 4), sparkleMat, head, [sx * 0.024, 0.015, 0.0565], [0.0036, 0.0036, 0.002]);
    add(sphere(5, 3), sparkleMat, head, [sx * 0.033, 0.0, 0.0545], [0.0016, 0.0016, 0.001]);
    // pale brow patch
    add(sphere(6, 4), creamMat, head, [sx * 0.027, 0.03, 0.044], [0.013, 0.006, 0.008], [0, sx * 0.3, sx * -0.2]);
    // tear line
    cylBetween(V(sx * 0.019, -0.006, 0.054), V(sx * 0.017, -0.02, 0.074), 0.0025, 0.002, tearMat, head, 4);
  }
  // ears
  const earGeo = new THREE.ConeGeometry(0.044, 0.15, 6);
  const innerGeo = new THREE.ConeGeometry(0.034, 0.125, 6);
  const earTuft = new THREE.ConeGeometry(0.006, 0.04, 4);
  for (const sx of [1, -1]) {
    const ear = new THREE.Group();
    ear.position.set(sx * 0.033, 0.035, -0.008);
    ear.rotation.set(-0.1, sx * 0.3, -sx * 0.38);
    head.add(ear);
    add(earGeo, goldMat, ear, [0, 0.075, 0], [1, 1, 0.32]);
    add(innerGeo, peachMat, ear, [0, 0.066, 0.008], [1, 1, 0.18]);
    for (let k = -1; k <= 1; k++)
      add(earTuft, creamMat, ear, [k * 0.012, 0.022, 0.013], [1, 1, 0.5], [0.15, 0, -k * 0.35]);
  }

  return root;
}
