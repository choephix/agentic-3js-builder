```ts
import * as THREE from "three";

export const meta = {
  name: "Garden Snail with Ladybird",
  description:
    "A glossy caramel, chocolate and cream spiral-shelled garden snail with a pebbly grey-green body, long eye stalks and a tiny ladybird riding on its shell.",
};

// Seeded generator (mulberry32) so every build is identical.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(7);

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Tube with a radius that varies along its path.
function variableTube(
  path: (s: number) => THREE.Vector3,
  radius: (s: number) => number,
  segs: number,
  radial: number,
) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const e = 0.5 / segs;

  for (let i = 0; i <= segs; i++) {
    const s = i / segs;
    const P = path(s);
    const T = path(Math.min(1, s + e)).sub(path(Math.max(0, s - e))).normalize();
    const ref = Math.abs(T.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const B = new THREE.Vector3().crossVectors(T, ref).normalize();
    const N = new THREE.Vector3().crossVectors(B, T).normalize();
    const r = radius(s);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const cx = Math.cos(a), sy = Math.sin(a);
      positions.push(
        P.x + (N.x * cx + B.x * sy) * r,
        P.y + (N.y * cx + B.y * sy) * r,
        P.z + (N.z * cx + B.z * sy) * r,
      );
      uvs.push(s, j / radial);
    }
  }

  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ---------- Materials ----------

const bodyTex = canvasTexture(256, 256, (g, w, h) => {
  g.fillStyle = "#7d8c78";
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 0.8 + rand() * 2.6;
    g.fillStyle = rand() < 0.5 ? "rgba(55,66,54,0.6)" : "rgba(175,186,165,0.5)";
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
});
bodyTex.wrapS = bodyTex.wrapT = THREE.RepeatWrapping;
bodyTex.repeat.set(2, 2);

const shellTex = canvasTexture(32, 512, (g, w, h) => {
  const bands: [string, number][] = [
    ["#efe0bf", 0.12], ["#b5763a", 0.07], ["#efe0bf", 0.05], ["#4a2a18", 0.08],
    ["#efe0bf", 0.06], ["#b5763a", 0.1], ["#4a2a18", 0.06], ["#efe0bf", 0.1],
    ["#b5763a", 0.08], ["#4a2a18", 0.1], ["#efe0bf", 0.08],
  ];
  let y = 0;
  for (const [col, f] of bands) {
    g.fillStyle = col;
    g.fillRect(0, y, w, f * h + 1);
    y += f * h;
  }
});

const mats = {
  body: new THREE.MeshPhysicalMaterial({
    map: bodyTex,
    bumpMap: bodyTex,
    bumpScale: 1.6,
    roughness: 0.42,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
  }),
  shell: new THREE.MeshPhysicalMaterial({
    map: shellTex,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    side: THREE.DoubleSide,
  }),
  eye: new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.2 }),
  shine: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0x444444 }),
  ladyRed: new THREE.MeshPhysicalMaterial({ color: 0xc8201c, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.1 }),
  black: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.45 }),
};

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number], scale: [number, number, number] = [1, 1, 1]) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  return m;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();

  // ---------- Snail body (foot sits on y = 0) ----------
  const bodyGeo = new THREE.SphereGeometry(1, 28, 20);

  // Long foot, lowest point at y = 0.
  root.add(mesh(bodyGeo, mats.body, [0, 0.028, 0.02], [0.034, 0.028, 0.105]));
  // Tail taper.
  root.add(mesh(bodyGeo, mats.body, [0, 0.022, -0.1], [0.02, 0.02, 0.03]));
  // Mantle hump under the shell.
  root.add(mesh(bodyGeo, mats.body, [0, 0.05, -0.025], [0.03, 0.034, 0.04]));
  // Head.
  root.add(mesh(bodyGeo, mats.body, [0, 0.04, 0.1], [0.026, 0.03, 0.04]));
  // Snout.
  root.add(mesh(bodyGeo, mats.body, [0, 0.032, 0.134], [0.02, 0.018, 0.02]));

  // ---------- Eye stalks, eyes and feelers ----------
  for (const sx of [-1, 1]) {
    // Long eye stalks.
    const stalkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.011, 0.062, 0.108),
      new THREE.Vector3(sx * 0.016, 0.09, 0.122),
      new THREE.Vector3(sx * 0.02, 0.117, 0.135),
    ]);
    root.add(new THREE.Mesh(new THREE.TubeGeometry(stalkCurve, 16, 0.0022, 8), mats.body));

    const tip = stalkCurve.getPoint(1);
    root.add(mesh(new THREE.SphereGeometry(0.0032, 14, 10), mats.eye, [tip.x, tip.y + 0.0008, tip.z + 0.0012]));
    root.add(mesh(new THREE.SphereGeometry(0.0009, 8, 6), mats.shine, [tip.x + sx * 0.001, tip.y + 0.0022, tip.z + 0.0030]));

    // Short lower feelers.
    const feelerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.008, 0.05, 0.14),
      new THREE.Vector3(sx * 0.011, 0.062, 0.165),
      new THREE.Vector3(sx * 0.012, 0.07, 0.185),
    ]);
    root.add(new THREE.Mesh(new THREE.TubeGeometry(feelerCurve, 12, 0.0013, 7), mats.body));
    const ft = feelerCurve.getPoint(1);
    root.add(mesh(new THREE.SphereGeometry(0.0016, 10, 8), mats.body, [ft.x, ft.y, ft.z]));
  }

  // ---------- Shell ----------
  const TURNS = 2.6;
  const shellPath = (s: number) => {
    const t = s * TURNS * Math.PI * 2;
    const R = 0.028 * (1 - 0.72 * s);
    const H = 0.012 + 0.035 * s;
    return new THREE.Vector3(R * Math.cos(t), H, R * Math.sin(t));
  };
  const shellRadius = (s: number) => 0.0075 + 0.0045 * (1 - s);

  const shellGeo = variableTube(shellPath, shellRadius, 240, 14);
  const shellMesh = new THREE.Mesh(shellGeo, mats.shell);

  const shellGroup = new THREE.Group();
  shellGroup.add(shellMesh);
  shellGroup.position.set(0, 0.058, -0.035);
  shellGroup.rotation.x = -0.28;
  root.add(shellGroup);

  // ---------- Ladybird riding on the shell ----------
  const s0 = 0.3;
  const P = shellPath(s0);
  const Pn = shellPath(Math.min(1, s0 + 0.002));
  const Pp = shellPath(Math.max(0, s0 - 0.002));
  const T = Pn.clone().sub(Pp).normalize();
  const r0 = shellRadius(s0);

  const ladybird = new THREE.Group();
  ladybird.position.set(P.x, P.y + r0 + 0.0016, P.z);
  ladybird.rotation.y = Math.atan2(T.x, T.z);

  const ladyBodyGeo = new THREE.SphereGeometry(0.0038, 18, 12);
  ladybird.add(mesh(ladyBodyGeo, mats.ladyRed, [0, 0, 0], [1, 0.6, 1.25]));

  // Head.
  ladybird.add(mesh(new THREE.SphereGeometry(0.0018, 10, 8), mats.black, [0, 0.0003, 0.0052], [1.3, 0.6, 0.9]));

  // Wing-case dividing line.
  ladybird.add(mesh(new THREE.BoxGeometry(0.0004, 0.0003, 0.0085), mats.black, [0, 0.0023, 0]));

  // Six spots, three per side.
  const spotGeo = new THREE.SphereGeometry(0.0007, 8, 6);
  const spotSides = [
    [0.0019, 0.0013, -0.0022],
    [0.0021, 0.0012, 0.0003],
    [0.0016, 0.0013, 0.0025],
  ];
  for (const [x, y, z] of spotSides) {
    ladybird.add(mesh(spotGeo, mats.black, [x, y, z], [1, 0.5, 1]));
    ladybird.add(mesh(spotGeo, mats.black, [-x, y, z], [1, 0.5, 1]));
  }

  shellGroup.add(ladybird);

  return root;
}
```