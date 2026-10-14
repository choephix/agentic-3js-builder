```ts
import * as THREE from "three";

export const meta = {
  name: "Emperor Dragonfly",
  description:
    "Anax imperator hovering in place: electric-blue abdomen with a black dorsal line, apple-green thorax, huge faceted turquoise eyes and four veined, faintly golden wings held flat.",
};

// ---------- helpers ----------

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvasTexture(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) return null;
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Pointy-top hex lattice of ommatidia, wrapped onto the eye spheres.
function eyeTexture(rng: () => number) {
  return makeCanvasTexture(256, 256, (g, W, H) => {
    g.fillStyle = "#17948f";
    g.fillRect(0, 0, W, H);
    const dx = W / 16;
    const dy = H / 18;
    const R = dx / Math.sqrt(3) + 0.3;
    for (let r = -1; r <= 19; r++) {
      for (let c = -1; c <= 17; c++) {
        const cx = c * dx + (r & 1 ? dx / 2 : 0);
        const cy = r * dy;
        const k = rng();
        const l = 0.35 + 0.65 * k;
        g.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 180) * (60 * i + 30);
          const x = cx + R * Math.cos(a);
          const y = cy + R * Math.sin(a);
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.closePath();
        g.fillStyle = `rgb(${Math.round(30 * l)},${Math.round(120 + 110 * l)},${Math.round(115 + 90 * l)})`;
        g.fill();
        g.lineWidth = 2;
        g.strokeStyle = "rgba(2,44,48,0.8)";
        g.stroke();
        g.fillStyle = `rgba(235,255,250,${(0.12 + 0.35 * k).toFixed(3)})`;
        g.beginPath();
        g.arc(cx - R * 0.25, cy - R * 0.3, R * 0.2, 0, Math.PI * 2);
        g.fill();
      }
    }
  });
}

// Electric-blue abdomen with a black dorsal line that broadens toward the tail,
// dark segment joints and pale lateral spots.
function abdomenTexture() {
  return makeCanvasTexture(128, 512, (g, W, H) => {
    g.fillStyle = "#1f78ff";
    g.fillRect(0, 0, W, H);
    // canvas top = thorax end, bottom = tail
    for (let y = 0; y < H; y++) {
      const t = y / H;
      const hw = 0.03 + 0.05 * t;
      g.fillStyle = "#0a0d1a";
      g.fillRect(W * (0.5 - hw), y, W * 2 * hw, 1);
    }
    for (let k = 1; k < 10; k++) {
      g.fillStyle = "rgba(8,20,60,0.55)";
      g.fillRect(0, (H * k) / 10 - 2, W, 4);
    }
    for (let k = 0; k < 10; k++) {
      const y = (H * (k + 0.5)) / 10;
      g.fillStyle = "rgba(150,205,255,0.35)";
      for (const x of [W * 0.27, W * 0.73]) {
        g.beginPath();
        g.ellipse(x, y, 5, 13, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.fillStyle = "#0a0d1a";
    g.fillRect(0, H * 0.955, W, H * 0.045);
  });
}

// Wing outline: half-width profile hn(u) = sin(pi*(a*u+b))^0.5 (normalised),
// used both for the geometry and for mapping the vein net onto the wing.
function wingTexture(a: number, b: number, rng: () => number) {
  const hn = (u: number) => Math.pow(Math.sin(Math.PI * Math.min(1, a * u + b)), 0.5);
  return makeCanvasTexture(512, 256, (g, W, H) => {
    const toPx = (u: number, rho: number): [number, number] => [
      u * W,
      (1 - (0.5 + 0.5 * rho * hn(u))) * H,
    ];
    const stroke = (pts: [number, number][], w: number, col: string) => {
      g.beginPath();
      pts.forEach(([u, rho], i) => {
        const [x, y] = toPx(u, rho);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      });
      g.lineWidth = w;
      g.strokeStyle = col;
      g.stroke();
    };

    // glassy, faintly golden body of the wing
    const sheen = g.createLinearGradient(0, 0, W, 0);
    sheen.addColorStop(0, "rgba(255,205,110,0.26)");
    sheen.addColorStop(0.5, "rgba(255,230,160,0.14)");
    sheen.addColorStop(1, "rgba(220,238,255,0.10)");
    g.fillStyle = sheen;
    g.fillRect(0, 0, W, H);

    // longitudinal veins
    const longRho = [
      -0.94, -0.8, -0.66, -0.52, -0.37, -0.22, -0.07, 0.08,
      0.23, 0.37, 0.5, 0.63, 0.75, 0.85, 0.93,
    ];
    const veinCol = "rgba(34,22,12,0.85)";
    longRho.forEach((r0, k) => {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 48; i++) {
        const u = i / 48;
        pts.push([u, r0 + 0.025 * Math.sin(u * 9 + k * 1.7) * hn(u)]);
      }
      stroke(pts, 1.4, veinCol);
    });

    // costa (leading edge)
    stroke(
      [
        [0, 0.97],
        [1, 0.97],
      ],
      3.2,
      "rgba(28,16,8,0.95)",
    );

    // fine reticulation between the longitudinal veins, denser near the front
    for (let k = 0; k < longRho.length - 1; k++) {
      const r0 = longRho[k];
      const r1 = longRho[k + 1];
      const step = r0 > 0.5 ? 0.012 : 0.028;
      for (let pass = 0; pass < 2; pass++) {
        let u = rng() * step;
        while (u < 0.98) {
          const du = step * (0.6 + rng() * 0.9) * (pass ? -1 : 1);
          const u1 = Math.min(1, Math.max(0, u + du));
          stroke(
            [
              [u, r0],
              [u1, r1],
            ],
            0.9,
            "rgba(34,22,12,0.5)",
          );
          u += step * (0.8 + rng() * 0.5);
        }
      }
    }

    // pterostigma: dark mark near the wing tip on the leading edge
    const [x0, y0] = toPx(0.8, 0.97);
    const [x1, y1] = toPx(0.87, 0.86);
    g.fillStyle = "rgba(80,46,14,0.92)";
    g.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
  });
}

function wingGeometry(span: number, H: number, a: number, b: number, rootX: number) {
  const N = 24;
  const hfn = (t: number) => H * Math.pow(Math.sin(Math.PI * Math.min(1, a * t + b)), 0.5);
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(new THREE.Vector2(t * span, hfn(t)));
  }
  for (let i = N; i >= 0; i--) {
    const t = i / N;
    pts.push(new THREE.Vector2(t * span, -hfn(t)));
  }
  const geo = new THREE.ShapeGeometry(new THREE.Shape(pts));
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / span;
    uv[i * 2 + 1] = pos.getY(i) / (2 * H) + 0.5;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.translate(rootX, 0, 0);
  // shape x -> world x (span), shape y -> world z (leading edge toward +Z), lying flat
  geo.rotateX(Math.PI / 2);
  return geo;
}

function wingMaterial(tex: THREE.CanvasTexture | null) {
  return new THREE.MeshStandardMaterial({
    map: tex,
    color: tex ? 0xffffff : 0xdfeeff,
    transparent: true,
    opacity: tex ? 1 : 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
    roughness: 0.15,
    metalness: 0.2,
    emissive: 0x7a5a16,
    emissiveIntensity: 0.3,
  });
}

// ---------- model ----------

export default function buildEmperorDragonfly(): THREE.Object3D {
  const rng = mulberry32(0xd1a60f);

  const root = new THREE.Group();
  root.name = "EmperorDragonfly";
  const body = new THREE.Group();
  body.rotation.x = -0.05; // hover: nose a touch up
  root.add(body);
  root.position.y = 0.25; // hovering above the pond

  const std = (color: number | string, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.45,
      metalness: 0.05,
      flatShading: true,
      ...o,
    });

  // ----- eyes: huge, wraparound, hex-faceted turquoise -----
  const eyeTex = eyeTexture(rng);
  const eyeMat = new THREE.MeshStandardMaterial({
    map: eyeTex,
    color: eyeTex ? 0xffffff : 0x2ccfc0,
    roughness: 0.28,
    metalness: 0.05,
    emissive: 0x0b3d3a,
    emissiveIntensity: 0.6,
    flatShading: true,
  });
  const eyeGeo = new THREE.SphereGeometry(0.0098, 14, 10);
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(s * 0.006, 0.0036, 0.018);
    eye.scale.set(1, 0.95, 1.12);
    body.add(eye);
  }

  // ----- face (mostly tucked between the eyes) -----
  const face = new THREE.Mesh(
    new THREE.SphereGeometry(1, 10, 8),
    std("#72c24a", { roughness: 0.5 }),
  );
  face.scale.set(0.0064, 0.0055, 0.0075);
  face.position.set(0, -0.0045, 0.0185);
  body.add(face);

  // ----- thorax: apple green with dark shoulder stripes -----
  const thorax = new THREE.Mesh(
    new THREE.SphereGeometry(1, 12, 9),
    std("#9ad84c", { roughness: 0.4 }),
  );
  thorax.scale.set(0.0098, 0.0118, 0.0125);
  thorax.position.set(0, 0, -0.002);
  body.add(thorax);

  const stripeMat = std("#14286a", { roughness: 0.35 });
  const stripeGeo = new THREE.BoxGeometry(0.0016, 0.0062, 0.0046);
  for (const s of [-1, 1]) {
    const st = new THREE.Mesh(stripeGeo, stripeMat);
    st.position.set(s * 0.0078, 0.0044, -0.0008);
    st.rotation.z = -s * 0.32;
    body.add(st);
  }

  // ----- abdomen: long, slim, electric blue with black dorsal markings -----
  const L = 0.05;
  const zTh = -0.01;
  const zTail = zTh - L;

  // radius keys along the abdomen, f = 0 at the thorax, 1 at the tail
  const keys: [number, number][] = [
    [0.0, 0.0042],
    [0.06, 0.005],
    [0.16, 0.005],
    [0.24, 0.0038],
    [0.38, 0.004],
    [0.55, 0.0043],
    [0.72, 0.0046],
    [0.88, 0.0048],
    [0.97, 0.0045],
    [1.0, 0.0037],
  ];
  const prof = (f: number) => {
    for (let i = 0; i < keys.length - 1; i++) {
      const [f0, r0] = keys[i];
      const [f1, r1] = keys[i + 1];
      if (f <= f1) return r0 + ((f - f0) / (f1 - f0)) * (r1 - r0);
    }
    return keys[keys.length - 1][1];
  };
  const SAMP = 40;
  const profPts: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
  for (let i = SAMP; i >= 0; i--) {
    const f = i / SAMP;
    const seg = f * 10;
    const frac = seg - Math.round(seg);
    // slight groove at each of the ten segment joints
    const groove = 1 - 0.14 * Math.exp(-(frac * frac) / 0.06);
    profPts.push(new THREE.Vector2(prof(f) * groove, (1 - f) * L));
  }
  profPts.push(new THREE.Vector2(0, L));

  const abdGeo = new THREE.LatheGeometry(profPts, 10);
  abdGeo.rotateX(Math.PI / 2); // lathe axis Y -> world Z, tail at z = 0
  abdGeo.translate(0, 0, zTail);
  body.add(
    new THREE.Mesh(
      abdGeo,
      std("#ffffff", { map: abdomenTexture(), roughness: 0.35, metalness: 0.1 }),
    ),
  );

  // tail appendages (cerci), spread slightly
  const cercMat = std("#1b1520", { roughness: 0.5 });
  const cercGeo = new THREE.ConeGeometry(0.0008, 0.0055, 5);
  const up = new THREE.Vector3(0, 1, 0);
  for (const s of [-1, 1]) {
    const c = new THREE.Mesh(cercGeo, cercMat);
    const dir = new THREE.Vector3(s * 0.25, 0, -1).normalize();
    c.quaternion.setFromUnitVectors(up, dir);
    c.position.set(s * 0.0008, -0.0002, zTail - 0.0026);
    body.add(c);
  }

  // ----- legs: six thin legs tucked under the body -----
  const legMat = std("#1d262a", { roughness: 0.6 });
  const strut = (a: THREE.Vector3, b: THREE.Vector3, r: number) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 5, 1), legMat);
    m.position.addVectors(a, b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(up, d.divideScalar(len));
    body.add(m);
  };
  const legSpecs = [
    { hip: [0.005, -0.0098, 0.006], knee: [0.0112, -0.0172, 0.012], foot: [0.006, -0.0135, 0.0215] },
    { hip: [0.0052, -0.01, -0.0005], knee: [0.014, -0.016, 0.0], foot: [0.0085, -0.013, 0.0095] },
    { hip: [0.005, -0.0096, -0.0075], knee: [0.0135, -0.015, -0.0085], foot: [0.0085, -0.0118, -0.003] },
  ];
  for (const s of [-1, 1]) {
    for (const lg of legSpecs) {
      const P = (p: number[]) => new THREE.Vector3(s * p[0], p[1], p[2]);
      const hip = P(lg.hip);
      const knee = P(lg.knee);
      const foot = P(lg.foot);
      strut(hip, knee, 0.0009);
      strut(knee, foot, 0.0007);
    }
  }

  // ----- wings: four glassy, veined, golden-tinted wings held flat and wide -----
  const foreA = 0.92;
  const foreB = 0.04;
  const hindA = 0.85;
  const hindB = 0.1;
  const foreGeo = wingGeometry(0.05, 0.0034, foreA, foreB, 0.0055);
  const hindGeo = wingGeometry(0.041, 0.005, hindA, hindB, 0.005);
  const foreMat = wingMaterial(wingTexture(foreA, foreB, rng));
  const hindMat = wingMaterial(wingTexture(hindA, hindB, rng));

  const addWingPair = (geo: THREE.BufferGeometry, mat: THREE.Material, y: number, z: number) => {
    const right = new THREE.Mesh(geo, mat);
    right.position.set(0, y, z);
    const left = new THREE.Mesh(geo.clone().scale(-1, 1, 1), mat);
    left.position.set(0, y, z);
    body.add(right, left);
  };
  addWingPair(foreGeo, foreMat, 0.0108, 0.0035);
  addWingPair(hindGeo, hindMat, 0.01, -0.0068);

  return root;
}
```