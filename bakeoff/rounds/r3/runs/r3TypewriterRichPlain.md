```ts
import * as THREE from "three";

export const meta = {
  name: "1930s Typewriter",
  description: "Racing green 1930s typewriter with round chrome-rimmed keys, type bar basket, carriage, paper and brass badge.",
};

export default function build(): THREE.Object3D {
  let s = 1234567;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

  const root = new THREE.Group();
  const mat = (c: number, r = 0.4, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true });
  const green = mat(0x0b4a2e, 0.18, 0.3);
  const darkGreen = mat(0x07321f, 0.3, 0.2);
  const chrome = mat(0xdddddd, 0.15, 1);
  const black = mat(0x111111, 0.5, 0.1);
  const brass = mat(0xc89a2c, 0.3, 0.9);
  const paperM = mat(0xf3ecd8, 0.9);
  const inkM = mat(0x222222, 0.9);
  const rubber = mat(0x1a1a1a, 0.9);

  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, p?: THREE.Object3D) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    (p || root).add(me);
    return me;
  };

  // Body: stepped shape
  add(new THREE.BoxGeometry(0.34, 0.05, 0.36), darkGreen, 0, 0.04, 0.0); // base plinth
  add(new THREE.BoxGeometry(0.36, 0.06, 0.34), green, 0, 0.09, 0);
  // sloped front keyboard deck
  const deck = add(new THREE.BoxGeometry(0.34, 0.03, 0.2), green, 0, 0.14, 0.09);
  deck.rotation.x = -0.28;
  // rear body
  add(new THREE.BoxGeometry(0.32, 0.1, 0.12), green, 0, 0.17, -0.1);
  // side frames
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.025, 0.18, 0.2), green, sx * 0.17, 0.23, -0.1);
    add(new THREE.BoxGeometry(0.03, 0.03, 0.04), chrome, sx * 0.17, 0.33, -0.12);
  }
  // Feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(new THREE.CylinderGeometry(0.014, 0.018, 0.015, 8), rubber, sx * 0.15, 0.007, sz * 0.15);

  // Keys on sloped deck
  const canvasFor = (ch: string) => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = "#101010";
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = "#f2e6bd";
    g.font = "bold 40px serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(ch, 32, 34);
    const t = new THREE.CanvasTexture(c);
    return t;
  };
  const rows = ["1234567890", "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  const rimG = new THREE.CylinderGeometry(0.0125, 0.0125, 0.01, 12);
  const capG = new THREE.CylinderGeometry(0.0098, 0.0098, 0.004, 12);
  const stemG = new THREE.CylinderGeometry(0.003, 0.003, 0.02, 5);
  const keyGroup = new THREE.Group();
  keyGroup.position.set(0, 0.155, 0.09);
  keyGroup.rotation.x = -0.28;
  root.add(keyGroup);
  const keyMats: Record<string, THREE.Material> = {};
  rows.forEach((row, ri) => {
    const z = -0.08 + ri * 0.045;
    const y = 0.015 + (3 - ri) * 0.0; 
    const off = ri * 0.009;
    row.split("").forEach((ch, i) => {
      const x = (i - (row.length - 1) / 2) * 0.029 + (ri === 0 ? 0 : off - 0.014);
      add(stemG, chrome, x, y - 0.004, z, keyGroup);
      add(rimG, chrome, x, y + 0.006, z, keyGroup);
      if (!keyMats[ch]) {
        keyMats[ch] = new THREE.MeshStandardMaterial({ map: canvasFor(ch), roughness: 0.3 });
      }
      add(capG, keyMats[ch], x, y + 0.0125, z, keyGroup);
    });
  });
  // space bar
  add(new THREE.BoxGeometry(0.17, 0.008, 0.016), chrome, 0, 0.02, 0.105, keyGroup);

  // Type bar basket: semicircle of thin bars
  const n = 21;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (i / (n - 1));
    const r = 0.1;
    const x = Math.cos(a) * r;
    const z = -0.02 - Math.sin(a) * 0.05;
    const bar = add(new THREE.BoxGeometry(0.004, 0.004, 0.11), chrome, x * 1.0, 0.255, z - 0.0);
    bar.rotation.x = 0.0;
    bar.rotation.y = 0;
    bar.rotation.z = 0;
    bar.rotation.x = 0.5;
    bar.lookAt(0, 0.3, -0.04);
    add(new THREE.BoxGeometry(0.008, 0.012, 0.004), black, x * 0.45, 0.285, -0.04 + (z + 0.04) * 0.45);
  }
  // basket arc ring
  const ring = add(new THREE.TorusGeometry(0.105, 0.005, 5, 20, Math.PI), chrome, 0, 0.235, -0.02);
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = Math.PI;
  ring.scale.set(1, 1, 1);

  // Carriage
  const car = new THREE.Group();
  car.position.set(0, 0.36, -0.14);
  root.add(car);
  add(new THREE.BoxGeometry(0.46, 0.03, 0.05), green, 0, -0.045, -0.01, car);
  add(new THREE.BoxGeometry(0.46, 0.012, 0.012), chrome, 0, -0.065, 0.02, car);
  const plat = add(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 14), black, 0, 0, 0, car);
  plat.rotation.z = Math.PI / 2;
  for (const sx of [-1, 1]) {
    const k = add(new THREE.CylinderGeometry(0.022, 0.022, 0.025, 12), black, sx * 0.23, 0, 0, car);
    k.rotation.z = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 8), chrome, sx * 0.25, 0, 0, car).rotation.z = Math.PI / 2;
    add(new THREE.BoxGeometry(0.015, 0.07, 0.05), green, sx * 0.235, -0.025, -0.005, car);
  }
  // paper: back sheet rising, then wrapped over platen
  add(new THREE.BoxGeometry(0.3, 0.004, 0.0), paperM, 0, 0, 0, car);
  const back = add(new THREE.BoxGeometry(0.3, 0.2, 0.002), paperM, 0, 0.1, -0.034, car);
  back.rotation.x = -0.1;
  const front = add(new THREE.BoxGeometry(0.3, 0.001, 0.0), paperM, 0, 0, 0, car);
  const fr = add(new THREE.BoxGeometry(0.3, 0.1, 0.002), paperM, 0, 0.0, 0.0, car);
  fr.position.set(0, -0.0, 0.0);
  fr.visible = false;
  front.visible = false;
  const fp = add(new THREE.BoxGeometry(0.3, 0.07, 0.002), paperM, 0, 0.0, 0.034, car);
  fp.rotation.x = 0.25;
  fp.position.set(0, 0.02, 0.036);
  // typed lines on the front sheet and back
  for (let i = 0; i < 9; i++) {
    const w = 0.1 + rnd() * 0.17;
    add(new THREE.BoxGeometry(w, 0.0035, 0.0015), inkM, -0.15 + w / 2 + 0.01, 0.135 - i * 0.0 - 0.0 + 0.0 - i * 0.013 + 0.0, -0.0325 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0);
  }
  const typed = new THREE.Group();
  car.remove(...[]);
  typed.visible = false;

  // Carriage return lever
  const lev = new THREE.Group();
  lev.position.set(-0.235, 0.015, 0.0);
  car.add(lev);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.09, 6), chrome, -0.03, 0.0, 0.04, lev).rotation.set(Math.PI / 2, 0, 0.0);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6), chrome, -0.03, 0.025, 0.0, lev).rotation.z = 0.0;
  add(new THREE.SphereGeometry(0.011, 8, 6), black, -0.03, 0.06, 0.0, lev);
  const arm = add(new THREE.CylinderGeometry(0.004, 0.004, 0.09, 6), chrome, -0.03, 0.04, 0.0, lev);
  arm.rotation.z = 0.0;
  arm.rotation.x = 0.0;

  // Ribbon spools
  for (const sx of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 14), chrome, sx * 0.1, 0.205, 0.0);
    add(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 10), black, sx * 0.1, 0.212, 0.0);
  }

  // Brass badge on front
  const badge = add(new THREE.BoxGeometry(0.07, 0.022, 0.004), brass, 0, 0.095, 0.172);
  add(new THREE.BoxGeometry(0.058, 0.012, 0.002), darkGreen, 0, 0.095, 0.175);
  add(new THREE.BoxGeometry(0.04, 0.003, 0.002), brass, 0, 0.095, 0.1765);
  badge.name = "badge";

  // Side shift keys and chrome trim
  add(new THREE.BoxGeometry(0.37, 0.006, 0.006), chrome, 0, 0.122, 0.172);
  for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.03, 0.012, 0.03), chrome, sx * 0.15, 0.16, 0.17);

  root.position.y = 0;
  return root;
}
```