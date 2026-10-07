import * as THREE from "three";

export const meta = {
  name: "Baby Dragon",
  description:
    "A hatchling dragon standing proud on four stubby legs: emerald scales, a cream throat and belly, amber spines and cheek frills, and rose wing membranes spread wide.",
};

type V3 = THREE.Vector3;
const V = (x: number, y: number, z: number): V3 => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const FWD = V(0, 0, 1);
const WING_K = 0.85;

// Seeded PRNG (mulberry32) so every build is identical.
function makeRand(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTex(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D) => void
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d");
  if (!g) return null;
  draw(g);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function solid(color: number, roughness = 0.6): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
}

function ellip(m: THREE.Material, c: V3, r: V3, seg = 14, rings = 10): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, seg, rings), m);
  mesh.position.copy(c);
  mesh.scale.copy(r);
  return mesh;
}

function ball(m: THREE.Material, c: V3, r: number, seg = 10): THREE.Mesh {
  return ellip(m, c, V(r, r, r), seg, Math.max(5, seg >> 1));
}

function box(m: THREE.Material, c: V3, size: V3, rotZ = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), m);
  mesh.position.copy(c);
  mesh.rotation.z = rotZ;
  return mesh;
}

// Frustum from a (radius ra) to b (radius rb).
function tube(m: THREE.Material, a: V3, b: V3, ra: number, rb: number, seg = 8): THREE.Mesh {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg, 1), m);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  return mesh;
}

// Pointed cone: base sits at `base`, points along `dir`.
function spike(m: THREE.Material, base: V3, dir: V3, h: number, r: number, seg = 6): THREE.Mesh {
  const d = dir.clone().normalize();
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m);
  mesh.position.copy(base).addScaledVector(d, h / 2);
  mesh.quaternion.setFromUnitVectors(UP, d);
  return mesh;
}

export default function babyDragon(): THREE.Object3D {
  const rand = makeRand(2024);
  const root = new THREE.Group();
  root.name = "baby-dragon";

  // ---- canvas textures ----
  const bellyTex = canvasTex(128, 256, (g) => {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 128, 256);
    g.strokeStyle = "rgba(170,120,60,0.38)";
    g.lineWidth = 3;
    for (let row = 0; row < 16; row++) {
      const y = row * 16 + 8;
      for (let x = (row % 2) * 8; x < 128; x += 16) {
        g.beginPath();
        g.arc(x + 8, y, 8, 0, Math.PI);
        g.stroke();
      }
    }
  });

  const membraneTex = canvasTex(256, 256, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, "#ffb08a");
    grd.addColorStop(0.55, "#f0607f");
    grd.addColorStop(1, "#a4306a");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "rgba(255,226,218,0.38)";
    g.lineWidth = 2.5;
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      g.beginPath();
      g.moveTo(0, 128);
      g.quadraticCurveTo(120, 128 + (t - 0.5) * 60, 240, 20 + t * 236);
      g.stroke();
    }
  });
  if (membraneTex) {
    // Map shape coordinates (span, chord) into the canvas.
    membraneTex.repeat.set(1 / 0.9, 1 / 0.9);
    membraneTex.offset.set(0, 0.5);
  }

  // ---- one material per colour, shared ----
  const M = {
    green: solid(0x2fa35f, 0.6),
    greenDeep: solid(0x1b6a45, 0.6),
    belly: new THREE.MeshStandardMaterial({ color: 0xf4e6bb, map: bellyTex, roughness: 0.7 }),
    bone: solid(0xf7efdc, 0.45),
    amber: solid(0xf29a2e, 0.4),
    gold: solid(0xffc53d, 0.25),
    ink: solid(0x14101a, 0.35),
    glint: solid(0xffffff, 0.2),
    plum: solid(0x6b2a52, 0.5),
    membrane: new THREE.MeshStandardMaterial({
      color: membraneTex ? 0xffffff : 0xe8607f,
      map: membraneTex,
      roughness: 0.75,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    }),
  };

  // Top surface of the torso/chest/hips at a given z (for spine placement).
  const topY = (z: number) => {
    const lobe = (cy: number, ry: number, cz: number, rz: number) => {
      const t = (z - cz) / rz;
      return t * t < 1 ? cy + ry * Math.sqrt(1 - t * t) : -1;
    };
    return Math.max(
      lobe(0.47, 0.2, -0.02, 0.31),
      lobe(0.46, 0.19, 0.17, 0.14),
      lobe(0.47, 0.19, -0.23, 0.15)
    );
  };

  // ---------- torso ----------
  root.add(ellip(M.green, V(0, 0.47, -0.02), V(0.2, 0.2, 0.31), 20, 14)); // barrel
  root.add(ellip(M.green, V(0, 0.46, 0.17), V(0.19, 0.19, 0.14), 18, 12)); // chest
  root.add(ellip(M.green, V(0, 0.47, -0.23), V(0.19, 0.19, 0.15), 18, 12)); // hips
  root.add(ellip(M.belly, V(0, 0.36, 0.02), V(0.14, 0.1, 0.27), 16, 10)); // cream underside

  // ---------- neck and throat ----------
  const N0 = V(0, 0.55, 0.2);
  const N1 = V(0, 0.68, 0.3);
  const N2 = V(0, 0.8, 0.38);
  root.add(ball(M.green, N0, 0.12, 12));
  root.add(tube(M.green, N0, N1, 0.12, 0.095));
  root.add(ball(M.green, N1, 0.095, 12));
  root.add(tube(M.green, N1, N2, 0.095, 0.08));
  root.add(ball(M.green, N2, 0.08, 12));
  root.add(ellip(M.belly, V(0, 0.62, 0.3), V(0.08, 0.08, 0.1), 12, 8)); // throat patch
  root.add(spike(M.amber, V(0, 0.673, 0.169), V(0, 0.58, -0.81), 0.1, 0.03, 5)); // neck spines
  root.add(spike(M.amber, V(0, 0.784, 0.274), V(0, 0.55, -0.83), 0.08, 0.025, 5));

  // ---------- head ----------
  root.add(ellip(M.green, V(0, 0.88, 0.47), V(0.13, 0.12, 0.14), 16, 12)); // cranium
  root.add(tube(M.green, V(0, 0.87, 0.5), V(0, 0.85, 0.7), 0.09, 0.07, 6)); // muzzle (faceted)
  root.add(ellip(M.green, V(0, 0.85, 0.7), V(0.07, 0.06, 0.07), 12, 8)); // nose tip
  root.add(box(M.belly, V(0, 0.745, 0.6), V(0.11, 0.03, 0.24))); // lower jaw
  root.add(box(M.ink, V(0, 0.772, 0.6), V(0.1, 0.01, 0.22))); // mouth line

  for (const z of [0.6, 0.66]) {
    for (const sx of [-1, 1]) {
      root.add(spike(M.bone, V(sx * 0.042, 0.8, z), V(0, -1, 0), 0.045, 0.011, 5)); // fangs
    }
  }

  for (const sx of [-1, 1]) {
    root.add(box(M.greenDeep, V(sx * 0.085, 0.94, 0.55), V(0.09, 0.03, 0.09), sx * 0.35)); // brow
    root.add(ball(M.gold, V(sx * 0.085, 0.9, 0.56), 0.045, 14)); // eye
    root.add(ellip(M.ink, V(sx * 0.085, 0.9, 0.6), V(0.013, 0.032, 0.012), 8, 6)); // slit pupil
    root.add(ellip(M.glint, V(sx * 0.098, 0.915, 0.6), V(0.01, 0.01, 0.01), 6, 4)); // glint
    root.add(ellip(M.ink, V(sx * 0.03, 0.865, 0.757), V(0.011, 0.008, 0.012), 6, 4)); // nostril
    root.add(tube(M.amber, V(sx * 0.1, 0.9, 0.44), V(sx * 0.21, 0.93, 0.28), 0.045, 0.006, 5)); // cheek frill
    root.add(tube(M.amber, V(sx * 0.1, 0.84, 0.46), V(sx * 0.19, 0.82, 0.36), 0.03, 0.005, 5)); // lower frill
    root.add(tube(M.bone, V(sx * 0.06, 0.98, 0.42), V(sx * 0.12, 1.12, 0.3), 0.032, 0.006, 6)); // horn
  }

  // ---------- dorsal spines ----------
  const dorsal = [0.12, 0.03, -0.06, -0.15, -0.24, -0.31];
  dorsal.forEach((z, i) => {
    const k = i / (dorsal.length - 1);
    const h = (0.14 - 0.06 * k) * (0.9 + 0.2 * rand());
    const r = 0.038 - 0.014 * k;
    root.add(spike(M.amber, V(0, topY(z) - 0.03, z), V(0, 1, -0.25), h, r, 5));
  });

  // ---------- tail ----------
  const TP = [V(0, 0.45, -0.36), V(0, 0.42, -0.5), V(0, 0.4, -0.64), V(0, 0.4, -0.77), V(0, 0.44, -0.87)];
  const TR = [0.1, 0.085, 0.07, 0.05, 0.035];
  const tailMat = (i: number) => (i % 2 ? M.greenDeep : M.green);
  for (let i = 0; i < 4; i++) root.add(tube(tailMat(i), TP[i], TP[i + 1], TR[i], TR[i + 1], 8));
  TP.forEach((p, i) => root.add(ball(tailMat(i), p, TR[i], 8)));
  for (let i = 1; i < 4; i++) {
    const p = TP[i];
    root.add(spike(M.amber, V(p.x, p.y + TR[i] * 0.8, p.z), V(0, 1, -0.3), 0.06 - 0.012 * (i - 1), 0.02 - 0.003 * (i - 1), 5));
  }
  // Diamond spade tip, flat in the vertical plane.
  const spade = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), M.amber);
  spade.position.set(0, 0.44, -0.96);
  spade.scale.set(0.012, 0.055, 0.085);
  root.add(spade);

  // ---------- legs ----------
  const limb = (hip: V3, knee: V3, ankle: V3, toe: number) => {
    root.add(ball(M.green, hip, 0.065, 12));
    root.add(tube(M.green, hip, knee, 0.06, 0.045, 8));
    root.add(ball(M.green, knee, 0.045, 10));
    root.add(tube(M.green, knee, ankle, 0.045, 0.034, 8));
    root.add(ball(M.green, ankle, 0.034, 10));
    const pz = ankle.z + toe * 0.04;
    root.add(ellip(M.greenDeep, V(ankle.x, 0.035, pz), V(0.05, 0.035, 0.075), 10, 7)); // paw
    for (const dx of [-0.02, 0, 0.02]) {
      root.add(spike(M.bone, V(ankle.x + dx, 0.03, pz + toe * 0.07), V(0, 0, toe), 0.03, 0.011, 5));
    }
  };
  for (const sx of [-1, 1]) {
    limb(V(sx * 0.13, 0.5, 0.16), V(sx * 0.14, 0.25, 0.2), V(sx * 0.14, 0.07, 0.22), 1); // fore
    limb(V(sx * 0.15, 0.46, -0.2), V(sx * 0.17, 0.24, -0.1), V(sx * 0.15, 0.07, -0.2), 1); // hind
  }

  // ---------- wings ----------
  // Membrane outline in wing-plane coords (span, chord).
  const WING_OUT: [number, number][] = [
    [0, 0], [0.36, 0.14], [0.72, 0.3], [0.56, 0.12], [0.8, 0], [0.56, -0.1],
    [0.68, -0.26], [0.46, -0.2], [0.46, -0.4], [0, -0.36],
  ];
  const WRIST: [number, number] = [0.36, 0.14];
  const WING_TIPS: [number, number][] = [[0.72, 0.3], [0.8, 0], [0.68, -0.26], [0.46, -0.4]];

  const buildWing = (sx: number) => {
    const W0 = V(sx * 0.16, 0.6, 0.1);
    const span = V(sx * 0.82, 0.55, -0.12).normalize();
    const chord = FWD.clone().addScaledVector(span, -FWD.dot(span)).normalize();
    const nrm = new THREE.Vector3().crossVectors(span, chord);
    const at = (s: number, c: number) =>
      W0.clone().addScaledVector(span, s * WING_K).addScaledVector(chord, c * WING_K);

    const shape = new THREE.Shape();
    WING_OUT.forEach(([s, c], i) => {
      if (i === 0) shape.moveTo(s * WING_K, c * WING_K);
      else shape.lineTo(s * WING_K, c * WING_K);
    });
    shape.closePath();
    const membrane = new THREE.Mesh(new THREE.ShapeGeometry(shape), M.membrane);
    membrane.applyMatrix4(new THREE.Matrix4().makeBasis(span, chord, nrm).setPosition(W0));
    root.add(membrane);

    // Arm and finger bones.
    const wr = at(WRIST[0], WRIST[1]);
    root.add(tube(M.plum, W0, wr, 0.035, 0.028, 6));
    root.add(ball(M.plum, wr, 0.03, 8));
    root.add(spike(M.bone, wr, chord.clone().multiplyScalar(0.7).addScaledVector(nrm, 0.3), 0.05, 0.012, 5));
    for (const [s, c] of WING_TIPS) {
      const tip = at(s, c);
      const d = tip.clone().sub(wr);
      root.add(tube(M.bone, wr, tip, 0.02, 0.009, 5));
      root.add(spike(M.bone, tip.clone().addScaledVector(d.clone().normalize(), -0.01), d, 0.04, 0.011, 5));
    }
  };
  buildWing(-1);
  buildWing(1);

  // Stylized hatchling scale.
  root.scale.setScalar(0.85);
  return root;
}
