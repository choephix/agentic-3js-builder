```ts
import * as THREE from "three";

export const meta = {
  name: "Jukebox",
  description:
    "A cherry-red 1950s jukebox with an arched cabinet, a glowing marquee, amber bubble tubes, a window of coloured records and a bank of song buttons.",
};

// Seeded PRNG (mulberry32): the same model is built on every run.
function makeRng(seed: number) {
  let s = seed >>> 0;
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Canvas textures need a browser. Without one, materials fall back to flat colours.
function makeCanvas(w: number, h: number) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function put(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  rx = 0,
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.x = rx;
  parent.add(m);
  return m;
}

export default function createJukebox(): THREE.Object3D {
  const rng = makeRng(1958);
  const root = new THREE.Group();
  root.name = "Jukebox";

  // ---------- materials: one per colour, shared ----------
  const lacquer = new THREE.MeshStandardMaterial({ color: 0xc4161f, roughness: 0.3, metalness: 0.05 });
  const black = new THREE.MeshStandardMaterial({ color: 0x17171b, roughness: 0.6, metalness: 0.1 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe9ebf0, roughness: 0.2, metalness: 0.85 });
  const accentHex = [0x2ec4b6, 0xff6fa1, 0xffd23f, 0x7d5cff, 0xff8c42, 0xf4ecd8];
  const accents = accentHex.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45 }));
  const amber = new THREE.MeshStandardMaterial({
    color: 0xffa42e,
    emissive: 0xff7a00,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.7,
  });
  const bubble = new THREE.MeshStandardMaterial({
    color: 0xfff1d0,
    emissive: 0xfff1d0,
    emissiveIntensity: 1.5,
    roughness: 0.3,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xbfe4ff,
    transparent: true,
    opacity: 0.2,
    roughness: 0.05,
    depthWrite: false,
  });

  // ---------- canvas-drawn surfaces ----------
  // Marquee: neon "JUKEBOX" on violet, emissive so it glows.
  let marqueeTex: THREE.CanvasTexture | null = null;
  const mq = makeCanvas(512, 128);
  if (mq) {
    const g = mq.getContext("2d");
    if (g) {
      g.fillStyle = "#1c0b33";
      g.fillRect(0, 0, 512, 128);
      g.font = "bold 88px Arial, Helvetica, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.shadowColor = "#ff3fa4";
      g.shadowBlur = 26;
      g.fillStyle = "#ffd6ef";
      g.fillText("JUKEBOX", 256, 68);
      g.shadowBlur = 0;
      g.strokeStyle = "#ffcc4d";
      g.lineWidth = 6;
      g.strokeRect(8, 8, 496, 112);
    }
    marqueeTex = new THREE.CanvasTexture(mq);
    marqueeTex.colorSpace = THREE.SRGBColorSpace;
  }

  // Speaker cloth: brass with a staggered grid of dark perforations.
  let grilleTex: THREE.CanvasTexture | null = null;
  const gc = makeCanvas(256, 128);
  if (gc) {
    const g = gc.getContext("2d");
    if (g) {
      g.fillStyle = "#c9953a";
      g.fillRect(0, 0, 256, 128);
      g.fillStyle = "#2a1709";
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 16; c++) {
          g.beginPath();
          g.arc(c * 16 + 8 + (r % 2) * 8, r * 14.2 + 7, 4.2, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
    grilleTex = new THREE.CanvasTexture(gc);
    grilleTex.colorSpace = THREE.SRGBColorSpace;
  }

  // Selection plate: song codes beside each row of buttons.
  let plateTex: THREE.CanvasTexture | null = null;
  const pc = makeCanvas(512, 160);
  if (pc) {
    const g = pc.getContext("2d");
    if (g) {
      g.fillStyle = "#f2e4c4";
      g.fillRect(0, 0, 512, 160);
      g.fillStyle = "#3a2516";
      g.font = "bold 17px Arial, Helvetica, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      for (let i = 0; i < 10; i++) {
        const px = (((i - 4.5) * 0.046 + 0.25) / 0.5) * 512;
        g.fillText("A" + (i + 1), px, 16);
        g.fillText("B" + (i + 1), px, 146);
      }
    }
    plateTex = new THREE.CanvasTexture(pc);
    plateTex.colorSpace = THREE.SRGBColorSpace;
  }

  const marqueeMat = new THREE.MeshStandardMaterial({
    map: marqueeTex,
    color: marqueeTex ? 0xffffff : 0xff4fa3,
    emissive: marqueeTex ? 0xffffff : 0xff4fa3,
    emissiveMap: marqueeTex,
    emissiveIntensity: 0.9,
    roughness: 0.5,
  });
  const plateMat = new THREE.MeshStandardMaterial({
    map: plateTex,
    color: plateTex ? 0xffffff : 0xf2e4c4,
    roughness: 0.6,
  });
  const grilleMat = new THREE.MeshStandardMaterial({
    map: grilleTex,
    color: grilleTex ? 0xffffff : 0xc9953a,
    roughness: 0.5,
    metalness: 0.2,
  });

  // ---------- plinth ----------
  put(root, new THREE.BoxGeometry(0.72, 0.09, 0.52), black, 0, 0.045, 0.01);
  put(root, new THREE.BoxGeometry(0.73, 0.02, 0.53), chrome, 0, 0.09, 0.01);

  // ---------- main cabinet: one extruded side profile ----------
  // Profile is (depth z, height y). It runs from the lower front, up the
  // upper front, over an elliptical arch, and down the back.
  const W = 0.68;
  const profile = new THREE.Shape();
  profile.moveTo(-0.24, 0.1);
  profile.lineTo(0.26, 0.1);
  profile.lineTo(0.26, 0.66);
  profile.lineTo(0.2, 0.66);
  profile.lineTo(0.2, 1.18);
  profile.absellipse(-0.02, 1.18, 0.22, 0.26, 0, Math.PI, false, 0);
  profile.lineTo(-0.24, 0.1);
  const bodyGeo = new THREE.ExtrudeGeometry(profile, {
    depth: W,
    bevelEnabled: false,
    curveSegments: 16,
  });
  // Map shape x to world z (depth) and extrusion to world x (width), centred on 0.
  bodyGeo.rotateY(-Math.PI / 2);
  bodyGeo.translate(W / 2, 0, 0);
  put(root, bodyGeo, lacquer, 0, 0, 0);

  // Chrome belt where the lower cabinet meets the upper section.
  put(root, new THREE.BoxGeometry(0.7, 0.022, 0.53), chrome, 0, 0.66, 0.01);

  // Side louvres.
  const louvreGeo = new THREE.BoxGeometry(0.012, 0.014, 0.2);
  for (const sx of [-0.346, 0.346]) {
    for (const y of [0.2, 0.25, 0.3]) {
      put(root, louvreGeo, chrome, sx, y, -0.03);
    }
  }

  // ---------- lower front: speaker, selection plate, coin slot ----------
  put(root, new THREE.PlaneGeometry(0.5, 0.21), grilleMat, 0, 0.255, 0.2615);
  const frameH = new THREE.BoxGeometry(0.52, 0.012, 0.012);
  const frameV = new THREE.BoxGeometry(0.012, 0.222, 0.012);
  put(root, frameH, chrome, 0, 0.366, 0.264);
  put(root, frameH, chrome, 0, 0.144, 0.264);
  put(root, frameV, chrome, -0.256, 0.255, 0.264);
  put(root, frameV, chrome, 0.256, 0.255, 0.264);

  // Cream selection plate with its textured label face.
  put(root, new THREE.BoxGeometry(0.5, 0.16, 0.012), chrome, 0, 0.5, 0.266);
  put(root, new THREE.PlaneGeometry(0.5, 0.16), plateMat, 0, 0.5, 0.2735);

  // Two rows of ten coloured song buttons, pointing forward.
  const btnGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.014, 14);
  for (let row = 0; row < 2; row++) {
    const y = row === 0 ? 0.53 : 0.47;
    for (let i = 0; i < 10; i++) {
      const x = (i - 4.5) * 0.046;
      const mat = accents[Math.floor(rng() * accents.length)];
      put(root, btnGeo, mat, x, y, 0.2805, Math.PI / 2);
    }
  }

  // Coin mechanism: chrome escutcheon with a dark slot.
  put(root, new THREE.BoxGeometry(0.06, 0.03, 0.012), chrome, 0, 0.615, 0.266);
  put(root, new THREE.BoxGeometry(0.008, 0.016, 0.004), black, 0, 0.615, 0.2745);

  // ---------- upper front: marquee, record window, bubble tubes ----------
  // Marquee backing and glowing sign.
  put(root, new THREE.BoxGeometry(0.49, 0.14, 0.012), chrome, 0, 1.09, 0.206);
  put(root, new THREE.PlaneGeometry(0.46, 0.12), marqueeMat, 0, 1.09, 0.2135);

  // Record window: dark backdrop, coloured sleeves with black discs peeking out.
  put(root, new THREE.BoxGeometry(0.44, 0.28, 0.01), black, 0, 0.85, 0.205);
  const sleeveGeo = new THREE.BoxGeometry(0.076, 0.076, 0.006);
  const discGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.004, 24);
  const sleeveXs = [-0.176, -0.088, 0, 0.088, 0.176];
  const sleeveYs = [0.75, 0.85, 0.95];
  for (const y of sleeveYs) {
    for (const x of sleeveXs) {
      put(root, discGeo, black, x + 0.014, y, 0.2165, Math.PI / 2);
      put(root, sleeveGeo, accents[Math.floor(rng() * accents.length)], x, y, 0.2195);
    }
  }

  // Glass front and chrome frame.
  put(root, new THREE.PlaneGeometry(0.44, 0.28), glass, 0, 0.85, 0.2365);
  const barH = new THREE.BoxGeometry(0.466, 0.014, 0.014);
  const barV = new THREE.BoxGeometry(0.014, 0.294, 0.014);
  put(root, barH, chrome, 0, 0.997, 0.2375);
  put(root, barH, chrome, 0, 0.703, 0.2375);
  put(root, barV, chrome, -0.227, 0.85, 0.2375);
  put(root, barV, chrome, 0.227, 0.85, 0.2375);

  // Bubble tubes either side of the window, each with chrome caps and bubbles.
  const tubeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 14, 1);
  const capGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.024, 14);
  const bubbleGeo = new THREE.SphereGeometry(0.008, 8, 6);
  for (const sx of [-0.3, 0.3]) {
    put(root, tubeGeo, amber, sx, 0.85, 0.2);
    put(root, capGeo, chrome, sx, 0.7, 0.2);
    put(root, capGeo, chrome, sx, 1.0, 0.2);
    for (let i = 0; i < 7; i++) {
      put(
        root,
        bubbleGeo,
        bubble,
        sx + (rng() - 0.5) * 0.016,
        0.73 + rng() * 0.24,
        0.2 + (rng() - 0.5) * 0.01,
      );
    }
  }

  // ---------- chrome trim following the arch ----------
  // Torus arc, squashed in x to match the elliptical arch, then turned to lie in the YZ plane.
  const archTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.011, 6, 40, Math.PI),
    chrome,
  );
  archTrim.position.set(0, 1.18, -0.02);
  archTrim.rotation.y = Math.PI / 2;
  archTrim.scale.set(0.846, 1, 1);
  root.add(archTrim);

  return root;
}
```