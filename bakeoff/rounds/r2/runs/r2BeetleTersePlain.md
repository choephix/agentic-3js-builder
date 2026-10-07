```ts
import * as THREE from "three";

export const meta = {
  name: "Stag Beetle",
  description: "Stylized low-poly stag beetle with large toothed mandibles, ridged glossy elytra, segmented antennae and six jointed legs.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const mat = (c: number, r = 0.5, m = 0.1) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true });

  // elytra texture
  const cv = document.createElement("canvas");
  cv.width = 128; cv.height = 128;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#6b2a12"; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 8) {
    g.fillStyle = i % 16 === 0 ? "#7d3517" : "#5a2210";
    g.fillRect(0, i, 128, 4);
  }
  for (let i = 0; i < 200; i++) {
    g.fillStyle = `rgba(20,5,0,${rnd() * 0.3})`;
    g.fillRect(rnd() * 128, rnd() * 128, 2, 2);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;

  const elytraM = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3, metalness: 0.2, flatShading: true });
  const darkM = mat(0x1e100a, 0.4, 0.2);
  const headM = mat(0x2a140c, 0.4, 0.2);
  const mandM = mat(0x3a1a0e, 0.35, 0.25);
  const legM = mat(0x24120a, 0.45, 0.2);
  const eyeM = mat(0xe8b030, 0.2, 0.3);
  const toothM = mat(0x55291a, 0.35, 0.25);

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, p: number[], s: number[] = [1, 1, 1], r: number[] = [0, 0, 0]) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(p[0], p[1], p[2]);
    me.scale.set(s[0], s[1], s[2]);
    me.rotation.set(r[0], r[1], r[2]);
    parent.add(me);
    return me;
  };

  const body = new THREE.Group();
  root.add(body);
  const H = 0.03; // body center height

  // abdomen / elytra
  add(body, new THREE.SphereGeometry(0.1, 10, 8), elytraM, [0, H + 0.0, -0.09], [0.95, 0.7, 1.55]);
  // elytra split line
  add(body, new THREE.BoxGeometry(0.006, 0.01, 0.30), darkM, [0, H + 0.068, -0.1]);
  // under-abdomen
  add(body, new THREE.SphereGeometry(0.09, 8, 6), darkM, [0, H - 0.03, -0.09], [0.95, 0.5, 1.5]);
  // shoulder shield line
  add(body, new THREE.BoxGeometry(0.2, 0.012, 0.012), darkM, [0, H + 0.05, 0.04], [1, 1, 1], [0.3, 0, 0]);

  // pronotum
  add(body, new THREE.SphereGeometry(0.085, 8, 6), darkM, [0, H + 0.01, 0.1], [1.15, 0.55, 0.7]);
  add(body, new THREE.BoxGeometry(0.16, 0.02, 0.03), headM, [0, H + 0.04, 0.12], [1, 1, 1], [0.2, 0, 0]);

  // head
  const head = new THREE.Group();
  head.position.set(0, H + 0.0, 0.17);
  body.add(head);
  add(head, new THREE.BoxGeometry(0.15, 0.06, 0.1), headM, [0, 0, 0.03]);
  add(head, new THREE.BoxGeometry(0.17, 0.04, 0.05), headM, [0, 0.005, 0.0]);
  for (const s of [-1, 1]) {
    add(head, new THREE.SphereGeometry(0.02, 6, 5), eyeM, [s * 0.082, 0.015, 0.02]);
    // mandibles
    const m = new THREE.Group();
    m.position.set(s * 0.04, -0.005, 0.08);
    head.add(m);
    const segs = [
      { p: [s * 0.0, 0, 0.04], s: [0.03, 0.035, 0.1], r: [0, s * -0.25, 0] },
      { p: [s * 0.03, 0, 0.12], s: [0.026, 0.03, 0.09], r: [0, s * -0.1, 0] },
      { p: [s * 0.04, 0, 0.19], s: [0.022, 0.026, 0.08], r: [0, s * 0.5, 0] },
      { p: [s * 0.03, 0, 0.25], s: [0.016, 0.02, 0.06], r: [0, s * 0.9, 0] },
    ];
    segs.forEach((q, i) => add(m, new THREE.BoxGeometry(1, 1, 1), mandM, q.p, q.s, q.r));
    // teeth
    for (let i = 0; i < 3; i++) {
      add(m, new THREE.ConeGeometry(0.01, 0.035, 4), toothM, [s * (0.0 + i * 0.012 - 0.015), 0.0, 0.07 + i * 0.05], [1, 1, 1], [0, 0, s * Math.PI / 2 * 1]).rotation.set(0, 0, s * -Math.PI / 2);
    }
    // big upper tooth
    add(m, new THREE.ConeGeometry(0.014, 0.05, 4), toothM, [s * 0.03, 0.03, 0.1], [1, 1, 1], [0, 0, 0]);
    // tip prongs
    add(m, new THREE.ConeGeometry(0.012, 0.05, 4), toothM, [s * 0.055, 0, 0.27], [1, 1, 1], [Math.PI / 2, 0, s * 0.3]);
    // antenna
    const ant = new THREE.Group();
    ant.position.set(s * 0.07, 0.02, 0.07);
    head.add(ant);
    add(ant, new THREE.CylinderGeometry(0.004, 0.005, 0.07, 5), legM, [s * 0.015, 0.01, 0.025], [1, 1, 1], [Math.PI / 2.3, 0, s * -0.4]);
    for (let k = 0; k < 4; k++) add(ant, new THREE.BoxGeometry(0.03, 0.006, 0.014), toothM, [s * (0.04 + k * 0.006), 0.03, 0.065 + k * 0.007 - 0.0], [1, 1, 1], [0, s * 0.3, 0]);
  }

  // legs
  const legs = [
    { z: 0.1, yaw: 0.7, len: 0.8 },
    { z: 0.0, yaw: 0.0, len: 1.0 },
    { z: -0.1, yaw: -0.6, len: 1.1 },
  ];
  for (const s of [-1, 1]) {
    for (const l of legs) {
      const hip = new THREE.Group();
      hip.position.set(s * 0.07, H - 0.01, l.z);
      hip.rotation.y = s * (l.yaw * 0.6 + 0 );
      body.add(hip);
      // thigh goes out and up
      const up = new THREE.Group();
      hip.add(up);
      const thighL = 0.1 * l.len;
      add(up, new THREE.BoxGeometry(thighL, 0.018, 0.022), legM, [s * thighL / 2 * 0.95, 0.02, 0], [1, 1, 1], [0, 0, s * 0.35]);
      const kx = s * thighL * 0.95 + 0, ky = 0.02 + Math.sin(0.35) * thighL * 0.5 + 0.015;
      add(up, new THREE.SphereGeometry(0.014, 5, 4), toothM, [kx, ky, 0]);
      // shin down to floor
      const shinL = Math.sqrt(0.03 * 0 + (ky + 0.0) ** 2 + 0.07 ** 2) + 0.01;
      const shin = add(up, new THREE.BoxGeometry(0.016, shinL, 0.02), legM, [kx + s * 0.035, ky / 2 - 0.005, 0], [1, 1, 1], [0, 0, s * 0.45]);
      // spikes on shin
      for (let k = 0; k < 3; k++) add(up, new THREE.ConeGeometry(0.005, 0.02, 4), toothM, [kx + s * (0.02 + k * 0.012), ky * (0.7 - k * 0.2), 0.012], [1, 1, 1], [Math.PI / 2, 0, 0]);
      // foot
      add(up, new THREE.BoxGeometry(0.05, 0.008, 0.02), legM, [kx + s * 0.07, 0.004, 0]);
    }
  }

  // position body so lowest part (feet) sits at y=0
  body.position.y = 0.0;
  root.scale.setScalar(1.0);
  return root;
}
```