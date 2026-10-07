import * as THREE from "three";

export const meta = {
  name: "Dragonfly",
  description: "Stylized low-poly dragonfly with iridescent veined wings, segmented banded abdomen and big compound eyes, resting on a reed stem.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const root = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}, k = String(c) + JSON.stringify(o)) =>
    (mats[k] ||= new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, flatShading: true, ...o }));

  const blue = M(0x1f7fd0, { metalness: 0.3, roughness: 0.4 });
  const dark = M(0x15202e);
  const teal = M(0x2fb8b0, { metalness: 0.3, roughness: 0.4 });
  const eyeM = M(0x2fd0a0, { metalness: 0.4, roughness: 0.25 });
  const green = M(0x4a7a3a);
  const legM = M(0x2a2a30);

  // wing texture
  const cv = document.createElement("canvas");
  cv.width = 256; cv.height = 64;
  const g = cv.getContext("2d")!;
  g.fillStyle = "rgba(200,235,255,0.35)";
  g.fillRect(0, 0, 256, 64);
  g.strokeStyle = "rgba(30,60,80,0.8)";
  g.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    g.beginPath(); g.moveTo(0, 8 + i * 10); g.lineTo(256, 4 + i * 11); g.stroke();
  }
  for (let x = 0; x < 256; x += 14) {
    g.beginPath(); g.moveTo(x + rnd() * 4, 0); g.lineTo(x + rnd() * 6, 64); g.stroke();
  }
  g.fillStyle = "#3a2a20";
  g.fillRect(205, 4, 14, 7);
  const tex = new THREE.CanvasTexture(cv);
  const wingM = new THREE.MeshStandardMaterial({
    map: tex, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
    roughness: 0.2, metalness: 0.2, color: 0xcfe8ff, depthWrite: false,
  });

  const add = (geo: THREE.BufferGeometry, m: THREE.Material, p: number[], r: number[] = [0, 0, 0], p0: THREE.Object3D = root) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(p[0], p[1], p[2]);
    me.rotation.set(r[0], r[1], r[2]);
    p0.add(me);
    return me;
  };

  const H = 0.28; // body height above floor (resting on stem)
  const body = new THREE.Group();
  body.position.y = H;
  root.add(body);

  // thorax
  const thorax = add(new THREE.BoxGeometry(0.1, 0.11, 0.17), teal, [0, 0, 0.05], [0.2, 0, 0], body);
  add(new THREE.BoxGeometry(0.104, 0.02, 0.17), dark, [0, 0.03, 0.05], [0.2, 0, 0], body);
  add(new THREE.BoxGeometry(0.104, 0.012, 0.03), dark, [0, 0.0, 0.08], [0.2, 0, 0], body);
  // head
  add(new THREE.BoxGeometry(0.09, 0.07, 0.07), dark, [0, 0.0, 0.16], [0, 0, 0], body);
  for (const sx of [-1, 1]) {
    add(new THREE.IcosahedronGeometry(0.052, 1), eyeM, [sx * 0.052, 0.012, 0.17], [0, 0, 0], body).scale.set(1, 1.05, 1.05);
    add(new THREE.IcosahedronGeometry(0.012, 0), dark, [sx * 0.03, 0.03, 0.2], [0, 0, 0], body);
  }
  add(new THREE.BoxGeometry(0.06, 0.03, 0.02), blue, [0, -0.015, 0.2], [0, 0, 0], body);

  // abdomen segments
  let z = -0.04;
  const n = 12;
  for (let i = 0; i < n; i++) {
    const len = 0.062;
    const r = 0.027 - i * 0.0009;
    const geo = new THREE.CylinderGeometry(r, r * 1.02, len, 6);
    const seg = add(geo, i % 2 ? blue : dark, [0, -0.005 - i * 0.003, z - len / 2], [Math.PI / 2, 0, 0], body);
    seg.rotation.order = "YXZ";
    seg.rotation.x = Math.PI / 2 + 0.02;
    if (i % 2 === 0) add(new THREE.CylinderGeometry(r * 1.03, r * 1.03, 0.012, 6), teal, [0, -0.005 - i * 0.003 + 0.0, z - 0.012], [Math.PI / 2, 0, 0], body);
    z -= len;
  }
  // cerci
  for (const sx of [-1, 1])
    add(new THREE.ConeGeometry(0.006, 0.05, 4), dark, [sx * 0.01, -0.04, z - 0.02], [-Math.PI / 2, 0, 0], body);

  // wings
  const wingGeo = new THREE.BoxGeometry(0.3, 0.004, 0.065);
  const mkWing = (sx: number, zo: number, yaw: number, len: number, w: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.04, 0.05, zo);
    pivot.rotation.set(0, sx * yaw, sx * 0.08);
    const m = add(wingGeo, wingM, [sx * len / 2, 0, 0], [0, 0, 0], pivot);
    m.scale.set(len / 0.3, 1, w);
    // leading edge
    const e = add(new THREE.BoxGeometry(0.3, 0.006, 0.006), dark, [sx * len / 2, 0.001, -w * 0.0325], [0, 0, 0], pivot);
    e.scale.x = len / 0.3;
    body.add(pivot);
  };
  mkWing(1, 0.09, 0.25, 0.32, 1);
  mkWing(-1, 0.09, 0.25, 0.32, 1);
  mkWing(1, 0.0, -0.3, 0.3, 1.25);
  mkWing(-1, 0.0, -0.3, 0.3, 1.25);

  // legs
  for (const sx of [-1, 1])
    for (let i = 0; i < 3; i++) {
      const zz = 0.1 - i * 0.045;
      const up = new THREE.Group();
      up.position.set(sx * 0.04, -0.05, zz);
      up.rotation.z = sx * -0.9;
      add(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 4), legM, [0, -0.04, 0], [0, 0, 0], up);
      body.add(up);
      const lo = new THREE.Group();
      lo.position.set(sx * 0.1, -0.1, zz);
      lo.rotation.z = sx * 0.5;
      add(new THREE.CylinderGeometry(0.003, 0.003, 0.09, 4), legM, [0, -0.04, 0], [0, 0, 0], lo);
      body.add(lo);
    }

  // reed stem
  add(new THREE.CylinderGeometry(0.008, 0.012, H + 0.01 - 0.12 + 0.02, 5), green, [0.0, (H - 0.1) / 2, 0.0]).scale.set(1, 1, 1);
  const stem = add(new THREE.CylinderGeometry(0.01, 0.014, 0.18, 5), green, [0, 0.09, 0]);
  stem.scale.set(1, 1, 1);
  // ground tuft / leaf
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    add(new THREE.ConeGeometry(0.03, 0.3, 4), green, [Math.sin(a) * 0.06, 0.12, Math.cos(a) * 0.06 - 0.0], [Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35]);
  }
  add(new THREE.CylinderGeometry(0.1, 0.12, 0.02, 7), M(0x6b5a45), [0, 0.0, 0]);

  return root;
}
