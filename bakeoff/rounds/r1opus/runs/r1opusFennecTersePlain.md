```ts
import * as THREE from "three";

export const meta = {
  name: "Fennec Fox",
  description:
    "A stylized low-poly fennec fox: oversized faceted ears with pink inner shells and white tufts, big glossy eyes, dark tear lines, sandy brushed-fur body and a bushy black-tipped tail.",
};

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function createFennec(): THREE.Object3D {
  const rng = mulberry32(1337);
  const root = new THREE.Group();
  root.name = "FennecFox";

  // ---------- fur texture ----------
  function furTexture(base: string, strokes: string[]): THREE.Texture | null {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (!g) return null;
    g.fillStyle = base;
    g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 520; i++) {
      const x = rng() * 128, y = rng() * 128;
      const len = 3 + rng() * 6;
      const ang = Math.PI / 2 + (rng() - 0.5) * 0.7;
      g.strokeStyle = strokes[Math.floor(rng() * strokes.length)];
      g.globalAlpha = 0.25 + rng() * 0.35;
      g.lineWidth = 1 + rng() * 1.2;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    return t;
  }

  const furTex = furTexture("#e2b57a", ["#c99256", "#f1d3a2", "#b97f47", "#f6e0b8"]);
  const backTex = furTexture("#c88b4f", ["#a86d38", "#dba86c", "#8f5a2c"]);

  // ---------- materials ----------
  const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...extra });

  const fur = furTex ? std("#ffffff", { map: furTex }) : std("#e2b57a");
  const backFur = backTex ? std("#ffffff", { map: backTex }) : std("#c88b4f");
  const cream = std("#f4e4c4");
  const white = std("#fffaf0");
  const pink = std("#e9a2a0", { roughness: 0.7 });
  const earTip = std("#9a6236");
  const eyeMat = std("#16110f", { roughness: 0.15, metalness: 0.1 });
  const nose = std("#1e1715", { roughness: 0.35 });
  const tear = std("#6e4024");
  const black = std("#1a1412");
  const whisker = std("#3a2a22");
  const shine = std("#ffffff", { roughness: 0.1, emissive: "#ffffff", emissiveIntensity: 0.4 });

  // ---------- helpers ----------
  function add(
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    p: [number, number, number],
    s: [number, number, number] = [1, 1, 1],
    r: [number, number, number] = [0, 0, 0]
  ) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...p);
    m.scale.set(...s);
    m.rotation.set(...r);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  const up = new THREE.Vector3(0, 1, 0);
  function cylBetween(
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    rTop: number,
    rBot: number,
    mat: THREE.Material,
    seg = 6
  ) {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, seg), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(up, d.normalize());
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  const sphere = (seg = 8, rings = 6) => new THREE.SphereGeometry(1, seg, rings);
  const ico = new THREE.IcosahedronGeometry(1, 1);

  // ---------- body ----------
  add(root, sphere(9, 7), fur, [0, 0.17, 0], [0.066, 0.066, 0.135]);
  add(root, sphere(8, 6), backFur, [0, 0.205, -0.01], [0.045, 0.035, 0.12]);
  add(root, sphere(8, 6), cream, [0, 0.145, 0.01], [0.055, 0.048, 0.11]);
  // chest ruff
  add(root, ico, white, [0, 0.19, 0.105], [0.05, 0.062, 0.045]);
  add(root, ico, cream, [0, 0.165, 0.09], [0.04, 0.045, 0.04]);
  // neck
  cylBetween(root, new THREE.Vector3(0, 0.19, 0.08), new THREE.Vector3(0, 0.275, 0.14), 0.034, 0.042, fur, 7);

  // ---------- legs ----------
  for (const side of [1, -1]) {
    // front leg
    add(root, sphere(7, 5), fur, [side * 0.042, 0.15, 0.085], [0.03, 0.045, 0.035]);
    cylBetween(root, new THREE.Vector3(side * 0.043, 0.012, 0.095), new THREE.Vector3(side * 0.043, 0.14, 0.088), 0.02, 0.014, fur, 6);
    add(root, sphere(7, 5), cream, [side * 0.043, 0.012, 0.103], [0.019, 0.012, 0.027]);
    // hind leg
    add(root, sphere(8, 6), fur, [side * 0.047, 0.155, -0.085], [0.034, 0.058, 0.055]);
    cylBetween(root, new THREE.Vector3(side * 0.048, 0.06, -0.11), new THREE.Vector3(side * 0.048, 0.14, -0.08), 0.021, 0.016, fur, 6);
    cylBetween(root, new THREE.Vector3(side * 0.048, 0.012, -0.1), new THREE.Vector3(side * 0.048, 0.065, -0.112), 0.016, 0.014, fur, 6);
    add(root, sphere(7, 5), cream, [side * 0.048, 0.012, -0.09], [0.019, 0.012, 0.028]);
    // toe hints
    for (const z of [0.103, -0.09]) {
      for (const tx of [-0.007, 0.007]) {
        add(root, sphere(5, 4), white, [side * 0.043 + tx, 0.01, z + 0.024], [0.006, 0.006, 0.006]);
      }
    }
  }

  // ---------- tail ----------
  const N = 9;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const z = -0.12 - 0.23 * t;
    const y = 0.165 - 0.11 * t + 0.06 * t * t;
    const r = 0.02 + 0.026 * Math.sin(Math.PI * Math.min(1, t * 1.15)) + 0.008 * t;
    const mat = i >= N - 2 ? black : i === N - 3 ? backFur : i % 2 ? fur : backFur;
    add(root, ico, mat, [0, y, z], [r * 0.95, r, r * 1.25], [rng() * 0.5, rng() * 0.5, 0]);
  }

  // ---------- head ----------
  const head = new THREE.Group();
  head.position.set(0, 0.29, 0.15);
  head.rotation.x = 0.05;
  root.add(head);

  add(head, sphere(9, 7), fur, [0, 0, 0], [0.06, 0.052, 0.055]);
  add(head, sphere(7, 5), backFur, [0, 0.03, -0.005], [0.04, 0.025, 0.04]);
  // cheeks
  for (const side of [1, -1]) {
    add(head, ico, white, [side * 0.036, -0.022, 0.022], [0.03, 0.026, 0.03]);
  }
  // muzzle
  add(head, new THREE.ConeGeometry(0.026, 0.07, 6), fur, [0, -0.012, 0.072], [1, 0.8, 1], [Math.PI / 2, 0, 0]);
  add(head, new THREE.ConeGeometry(0.019, 0.055, 6), white, [0, -0.025, 0.064], [1, 0.7, 1], [Math.PI / 2, 0, 0]);
  add(head, sphere(7, 5), nose, [0, -0.009, 0.104], [0.0095, 0.008, 0.008]);
  add(head, sphere(5, 4), shine, [0.003, -0.005, 0.111], [0.0025, 0.0018, 0.0015]);

  for (const side of [1, -1]) {
    // eyes
    const eye = add(head, sphere(8, 6), eyeMat, [side * 0.027, 0.008, 0.045], [0.0135, 0.015, 0.008], [0, side * 0.45, 0]);
    eye.rotation.z = side * -0.2;
    add(head, sphere(5, 4), shine, [side * 0.025, 0.014, 0.053], [0.0035, 0.0035, 0.002]);
    add(head, sphere(4, 3), shine, [side * 0.031, 0.002, 0.051], [0.0018, 0.0018, 0.001]);
    // eye rim / brow
    add(head, sphere(6, 4), white, [side * 0.027, 0.025, 0.042], [0.014, 0.004, 0.006], [0, side * 0.45, side * -0.2]);
    // tear lines
    cylBetween(head, new THREE.Vector3(side * 0.02, -0.003, 0.056), new THREE.Vector3(side * 0.016, -0.012, 0.088), 0.0025, 0.0035, tear, 4);
    // whiskers
    for (let k = 0; k < 3; k++) {
      cylBetween(
        head,
        new THREE.Vector3(side * 0.014, -0.016 - k * 0.003, 0.088),
        new THREE.Vector3(side * 0.08, -0.006 - k * 0.012, 0.075 - k * 0.006),
        0.0007,
        0.0007,
        whisker,
        3
      );
    }

    // ---------- ears ----------
    const ear = new THREE.Group();
    ear.position.set(side * 0.03, 0.032, -0.008);
    ear.rotation.set(-0.18, side * 0.28, side * -0.4);
    head.add(ear);
    add(ear, new THREE.ConeGeometry(0.05, 0.155, 6), fur, [0, 0.0775, 0], [1, 1, 0.35]);
    add(ear, new THREE.ConeGeometry(0.036, 0.125, 6), pink, [0, 0.066, 0.012], [1, 1, 0.25]);
    add(ear, new THREE.ConeGeometry(0.014, 0.03, 6), earTip, [0, 0.14, 0.001], [1, 1, 0.5]);
    // white tufts in the ear
    for (let k = 0; k < 5; k++) {
      const tx = (k - 2) * 0.012;
      add(
        ear,
        new THREE.ConeGeometry(0.006, 0.04 + rng() * 0.015, 4),
        white,
        [tx, 0.02 + Math.abs(tx) * 0.3, 0.02],
        [1, 1, 1],
        [0.25, 0, -tx * 12]
      );
    }
  }

  return root;
}
```