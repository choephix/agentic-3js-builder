import * as THREE from "three";

export const meta = {
  name: "Green Sea Turtle",
  description:
    "A green sea turtle gliding through the water, with a heart-shaped olive and caramel shell, a pale yellow plastron, spread front flippers, and a remora riding beneath.",
};

// Small seeded generator so every build is identical.
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHELL_W = 0.028; // metres per heart-unit along x
const SHELL_L = 0.034; // metres per heart-unit along z

// Heart outline (front tip at +Z, notch at -Z), sampled around a closed loop.
function heartOutline(N: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let j = 0; j <= N; j++) {
    const t = (j / N) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3) * SHELL_W;
    const z =
      (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 6) *
      SHELL_L;
    pts.push([x, z]);
  }
  return pts;
}

// Dome built on rings that shrink toward an apex, following the heart outline.
function domeGeometry(
  pts: [number, number][],
  scale: number,
  yBase: number,
  h: number,
  R: number,
  N: number,
): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= R; i++) {
    const r = i / R;
    const lift = Math.pow(Math.max(0, 1 - r * r), 0.55);
    for (let j = 0; j <= N; j++) {
      const [px, pz] = pts[j];
      pos.push(px * scale * r, yBase + h * lift, pz * scale * r);
      uv.push(j / N, i / R);
    }
  }
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < N; j++) {
      const a = i * (N + 1) + j;
      const b = a + 1;
      const c = a + (N + 1);
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Canvas texture: olive field, caramel plates, dark brown seams, cream marginal row.
function shellTexture(rand: () => number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#6e7d3c";
  g.fillRect(0, 0, canvas.width, canvas.height);

  const cols = 12;
  const rows = 6;
  const cw = canvas.width / cols;
  const ch = canvas.height / rows;
  g.lineWidth = 7;
  g.strokeStyle = "#3a2513";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = c * cw + (r % 2 ? cw / 2 : 0);
      const y0 = r * ch;
      const roll = rand();
      let color: string;
      if (r === 0) {
        color = "#e9dfb0"; // cream marginal scutes (top row sits at the rim)
      } else if (roll < 0.45) {
        color = "#b5793a"; // caramel
      } else if (roll < 0.75) {
        color = "#8a8f45"; // light olive
      } else {
        color = "#5d6b32"; // deep olive
      }
      g.fillStyle = color;
      g.fillRect(x0 + 4, y0 + 4, cw - 8, ch - 8);
      g.strokeRect(x0 + 4, y0 + 4, cw - 8, ch - 8);
      // Subtle highlight to suggest a raised scute.
      g.fillStyle = "rgba(255,240,200,0.12)";
      g.fillRect(x0 + 10, y0 + 10, cw - 28, (ch - 28) * 0.35);
    }
  }
  // Dark vertebral seam down the middle of the carapace.
  g.strokeStyle = "#3a2513";
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(0, canvas.height / 2);
  g.lineTo(canvas.width, canvas.height / 2);
  g.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// One flat flipper blade lying in the XZ plane, length along +X.
function flipperGeometry(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, 0.07);
  s.bezierCurveTo(0.15, 0.14, 0.36, 0.1, 0.5, 0.01);
  s.bezierCurveTo(0.36, -0.07, 0.14, -0.09, 0, -0.05);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.012,
    bevelEnabled: true,
    bevelSize: 0.008,
    bevelThickness: 0.008,
    bevelSegments: 2,
    curveSegments: 12,
  });
  g.translate(0, 0, -0.006);
  g.rotateX(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

function flipper(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  root: THREE.Vector3,
  sweep: number,
  lift: number,
  scale: number,
  mirror: boolean,
): THREE.Group {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, mat);
  m.rotation.z = lift; // tip raised for a gliding wing
  m.castShadow = true;
  g.add(m);
  g.position.copy(root);
  g.scale.set((mirror ? -1 : 1) * scale, scale, scale);
  g.rotation.y = (mirror ? -1 : 1) * sweep; // sweep back for swimming
  return g;
}

export default function createModel(): THREE.Object3D {
  const rand = mulberry32(20240611);
  const pts = heartOutline(48);

  // Materials: one per colour, shared.
  const shellMat = new THREE.MeshStandardMaterial({
    map: shellTexture(rand),
    roughness: 0.55,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const plastronMat = new THREE.MeshStandardMaterial({
    color: "#ece1a4",
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  const skinMat = new THREE.MeshStandardMaterial({ color: "#5a7d4b", roughness: 0.6 });
  const flipperMat = new THREE.MeshStandardMaterial({
    color: "#3f6a45",
    roughness: 0.6,
    side: THREE.DoubleSide,
  });
  const creamMat = new THREE.MeshStandardMaterial({ color: "#e8dcb0", roughness: 0.55 });
  const beakMat = new THREE.MeshStandardMaterial({ color: "#3b3328", roughness: 0.5 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: "#121212", roughness: 0.3 });
  const glintMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    emissive: "#ffffff",
    emissiveIntensity: 0.6,
  });
  const remoraMat = new THREE.MeshStandardMaterial({ color: "#4a4a50", roughness: 0.5 });
  const remoraDarkMat = new THREE.MeshStandardMaterial({ color: "#24242a", roughness: 0.5 });

  const body = new THREE.Group();
  body.name = "turtle";
  body.scale.setScalar(1.3);
  body.position.y = 0.55;
  body.rotation.x = 0.07; // gentle nose-down glide

  // Carapace: heart-shaped dome with plate texture.
  const shell = new THREE.Mesh(domeGeometry(pts, 1.0, 0.0, 0.18, 8, 48), shellMat);
  shell.name = "carapace";
  shell.castShadow = true;
  body.add(shell);

  // Plastron: pale yellow belly plate sitting just below the rim.
  const plastron = new THREE.Mesh(domeGeometry(pts, 0.8, -0.02, -0.04, 4, 48), plastronMat);
  plastron.name = "plastron";
  body.add(plastron);

  // Neck connecting body to head.
  const neckGeo = new THREE.CylinderGeometry(0.075, 0.095, 0.22, 12, 3);
  neckGeo.rotateX(Math.PI / 2);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.set(0, 0.03, 0.4);
  body.add(neck);

  // Blunt head.
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 14), skinMat);
  head.scale.set(0.85, 0.8, 1.2);
  head.position.set(0, 0.06, 0.5);
  head.name = "head";
  body.add(head);

  // Cream jaw plate with edged scales.
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), creamMat);
  jaw.scale.set(0.8, 0.3, 1.1);
  jaw.position.set(0, 0.0, 0.52);
  body.add(jaw);

  // Cream scale edges along the head crown.
  for (let k = 0; k < 3; k++) {
    const sc = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), creamMat);
    sc.scale.set(1.2, 0.5, 0.9);
    sc.position.set(0, 0.135, 0.46 + k * 0.04);
    body.add(sc);
  }

  // Gentle beak pointing forward.
  const beakGeo = new THREE.ConeGeometry(0.032, 0.06, 8);
  beakGeo.rotateX(Math.PI / 2);
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.position.set(0, 0.02, 0.61);
  body.add(beak);

  // Wise dark eyes with glints.
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 14, 10), eyeMat);
    eye.position.set(s * 0.078, 0.075, 0.53);
    body.add(eye);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 6), glintMat);
    glint.position.set(s * 0.078 + s * 0.005, 0.083, 0.55);
    body.add(glint);
  }

  // Tail: small tapered cone pointing back.
  const tailGeo = new THREE.ConeGeometry(0.03, 0.12, 8);
  tailGeo.rotateX(-Math.PI / 2);
  const tail = new THREE.Mesh(tailGeo, skinMat);
  tail.position.set(0, -0.01, -0.42);
  body.add(tail);

  // Flippers.
  const fGeo = flipperGeometry();
  const frontRootL = new THREE.Vector3(0.3, -0.02, 0.12);
  const rearRootL = new THREE.Vector3(0.22, -0.03, -0.28);
  body.add(flipper(fGeo, flipperMat, frontRootL, 0.35, 0.2, 1.0, false));
  body.add(flipper(fGeo, flipperMat, frontRootL, 0.35, 0.2, 1.0, true));
  body.add(flipper(fGeo, flipperMat, rearRootL, 0.9, 0.1, 0.55, false));
  body.add(flipper(fGeo, flipperMat, rearRootL, 0.9, 0.1, 0.55, true));

  // Remora riding under the shell.
  const remora = new THREE.Group();
  remora.name = "remora";
  remora.position.set(-0.12, -0.075, 0.02);

  const rBody = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), remoraMat);
  rBody.scale.set(0.8, 0.75, 2.4);
  remora.add(rBody);

  const rDisc = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 8), remoraDarkMat);
  rDisc.scale.set(1.6, 0.25, 1.2);
  rDisc.position.set(0, 0.034, 0.085);
  remora.add(rDisc);

  const rTailGeo = new THREE.ConeGeometry(0.03, 0.09, 8);
  rTailGeo.rotateX(-Math.PI / 2);
  const rTail = new THREE.Mesh(rTailGeo, remoraDarkMat);
  rTail.position.set(0, 0, -0.13);
  remora.add(rTail);

  for (const s of [-1, 1]) {
    const re = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), eyeMat);
    re.position.set(s * 0.03, 0.012, 0.1);
    remora.add(re);
  }

  body.add(remora);

  const root = new THREE.Group();
  root.name = "green_sea_turtle";
  root.add(body);
  return root;
}
