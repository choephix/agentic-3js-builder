```ts
import * as THREE from "three";

export const meta = {
  name: "African Elephant Calf",
  description:
    "A gentle young African elephant calf: dust-tinted slate-grey wrinkled skin, huge pink-lined fan ears, a curious curling trunk, stubby tusks, long lashes and a tufted tail.",
};

type Rand = () => number;

function seeded(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Procedural skin: mottled slate grey, reddish dust, and wrinkle creases (colour map + matching bump map). */
function skinTextures(rand: Rand): { map: THREE.Texture | null; bump: THREE.Texture | null } {
  if (typeof document === "undefined") return { map: null, bump: null };
  const W = 512;
  const H = 512;

  // Shared crease paths so the colour and bump maps agree.
  const creases: { pts: number[]; w: number; a: number }[] = [];
  for (let i = 0; i < 340; i++) {
    let x = rand() * W;
    let y = rand() * H;
    let ang = rand() * Math.PI * 2;
    const pts = [x, y];
    const steps = 3 + Math.floor(rand() * 9);
    for (let s = 0; s < steps; s++) {
      ang += (rand() - 0.5) * 1.2;
      x += Math.cos(ang) * 5;
      y += Math.sin(ang) * 5;
      pts.push(x, y);
    }
    creases.push({ pts, w: 0.8 + rand() * 1.7, a: 0.22 + rand() * 0.3 });
  }

  const strokeCreases = (g: CanvasRenderingContext2D, rgb: string, dy: number, mul: number) => {
    g.lineCap = "round";
    g.lineJoin = "round";
    for (const c of creases) {
      g.strokeStyle = `rgba(${rgb},${Math.min(1, c.a * mul).toFixed(3)})`;
      g.lineWidth = c.w;
      g.beginPath();
      g.moveTo(c.pts[0], c.pts[1] + dy);
      for (let k = 2; k < c.pts.length; k += 2) g.lineTo(c.pts[k], c.pts[k + 1] + dy);
      g.stroke();
    }
  };

  const colour = document.createElement("canvas");
  colour.width = W;
  colour.height = H;
  const cg = colour.getContext("2d");
  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = W;
  bumpCanvas.height = H;
  const bg = bumpCanvas.getContext("2d");
  if (!cg || !bg) return { map: null, bump: null };

  // Colour: slate base, cool and warm mottling, reddish dust, creases.
  cg.fillStyle = "#6f7279";
  cg.fillRect(0, 0, W, H);
  for (let i = 0; i < 700; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = 8 + rand() * 48;
    cg.fillStyle =
      rand() < 0.5
        ? `rgba(48,51,58,${(0.04 + rand() * 0.06).toFixed(3)})`
        : `rgba(146,149,154,${(0.04 + rand() * 0.06).toFixed(3)})`;
    cg.beginPath();
    cg.arc(x, y, r, 0, Math.PI * 2);
    cg.fill();
  }
  for (let i = 0; i < 260; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = 12 + rand() * 60;
    cg.fillStyle = `rgba(160,104,80,${(0.05 + rand() * 0.1).toFixed(3)})`;
    cg.beginPath();
    cg.arc(x, y, r, 0, Math.PI * 2);
    cg.fill();
  }
  strokeCreases(cg, "30,32,38", 1.4, 0.9);
  strokeCreases(cg, "170,168,170", -1.2, 0.35);

  // Bump: neutral grey with dark valleys and light ridges along the same creases.
  bg.fillStyle = "#808080";
  bg.fillRect(0, 0, W, H);
  for (let i = 0; i < 500; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = 6 + rand() * 30;
    bg.fillStyle = rand() < 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    bg.beginPath();
    bg.arc(x, y, r, 0, Math.PI * 2);
    bg.fill();
  }
  strokeCreases(bg, "0,0,0", 0, 1.6);
  strokeCreases(bg, "255,255,255", 2, 0.5);

  const map = new THREE.CanvasTexture(colour);
  map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(bumpCanvas);
  for (const t of [map, bump]) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
  }
  return { map, bump };
}

/**
 * Sweeps a tapered tube along a smooth path. Radius varies with t in [0, 1].
 * The tip is capped; the root is expected to sit inside the head.
 */
function sweepTube(
  points: THREE.Vector3[],
  radiusAt: (t: number) => number,
  radial: number,
  samples: number
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  const path = curve.getSpacedPoints(samples);
  const ref = new THREE.Vector3(1, 0, 0);
  const T = new THREE.Vector3();
  const B = new THREE.Vector3();
  const N = new THREE.Vector3();
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  const stride = radial + 1;

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    curve.getTangentAt(t, T).normalize();
    B.crossVectors(T, ref).normalize();
    N.crossVectors(B, T).normalize();
    const r = radiusAt(t);
    const c = path[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      positions.push(
        c.x + (N.x * ca + B.x * sa) * r,
        c.y + (N.y * ca + B.y * sa) * r,
        c.z + (N.z * ca + B.z * sa) * r
      );
      uvs.push(j / radial, t);
    }
  }

  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * stride + j;
      const b = a + stride;
      index.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }

  // Tip cap.
  const capIdx = positions.length / 3;
  const end = path[samples];
  positions.push(end.x, end.y, end.z);
  uvs.push(1, 1);
  const last = samples * stride;
  for (let j = 0; j < radial; j++) index.push(last + j, last + j + 1, capIdx);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

export default function buildElephantCalf(): THREE.Object3D {
  const rand = seeded(20240611);
  const tex = skinTextures(rand);

  // ---- materials (shared) -------------------------------------------------
  const skinMat = new THREE.MeshStandardMaterial({
    color: tex.map ? 0xffffff : 0x70737a,
    map: tex.map,
    bumpMap: tex.bump,
    bumpScale: 1.6,
    roughness: 0.92,
  });
  const earSkinMat = skinMat.clone();
  earSkinMat.side = THREE.DoubleSide;
  const pinkMat = new THREE.MeshStandardMaterial({
    color: 0xe9a2a6,
    roughness: 0.55,
    side: THREE.DoubleSide,
  });
  const ivoryMat = new THREE.MeshStandardMaterial({ color: 0xf1e6cf, roughness: 0.4 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: 0.22 });
  const amberMat = new THREE.MeshStandardMaterial({ color: 0xa8642c, roughness: 0.25 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x120b08, roughness: 0.2 });
  const glintMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    emissive: 0x3a3a3a,
  });
  const lashMat = new THREE.MeshStandardMaterial({ color: 0x1b1412, roughness: 0.8 });
  const lidMat = new THREE.MeshStandardMaterial({ color: 0x4a4c54, roughness: 0.9 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c241e, roughness: 1 });

  const root = new THREE.Group();
  root.name = "AfricanElephantCalf";

  const blob = (
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    mat: THREE.Material,
    w = 20,
    h = 13
  ) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, w, h), mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    root.add(m);
    return m;
  };

  // ---- body: barrel torso, chest, hips, neck ------------------------------
  blob(0, 0.7, 0.02, 0.31, 0.27, 0.46, skinMat, 22, 15);
  blob(0, 0.7, 0.24, 0.28, 0.26, 0.21, skinMat, 20, 13);
  blob(0, 0.74, -0.22, 0.29, 0.25, 0.22, skinMat, 20, 13);
  blob(0, 0.84, 0.36, 0.22, 0.2, 0.2, skinMat, 16, 11);

  // ---- head: big calf head, domed forehead, puffy cheeks, lip ------------
  const headC = new THREE.Vector3(0, 0.93, 0.56);
  const HA = 0.22;
  const HB = 0.23;
  const HC = 0.23;
  blob(headC.x, headC.y, headC.z, HA, HB, HC, skinMat, 22, 15);
  blob(0, 1.05, 0.52, 0.16, 0.12, 0.17, skinMat, 16, 11);
  blob(0.12, 0.87, 0.66, 0.085, 0.075, 0.08, skinMat, 14, 10);
  blob(-0.12, 0.87, 0.66, 0.085, 0.075, 0.08, skinMat, 14, 10);
  blob(0, 0.8, 0.7, 0.13, 0.08, 0.12, skinMat, 16, 10);

  // ---- trunk: tapered sweep, lifting into a forward curl -----------------
  const trunkPts = [
    new THREE.Vector3(0, 0.9, 0.7),
    new THREE.Vector3(0, 0.82, 0.83),
    new THREE.Vector3(0, 0.68, 0.92),
    new THREE.Vector3(0, 0.52, 0.95),
    new THREE.Vector3(0, 0.36, 0.99),
    new THREE.Vector3(0.03, 0.3, 1.0),
    new THREE.Vector3(0.07, 0.34, 0.99),
    new THREE.Vector3(0.08, 0.42, 0.97),
  ];
  const trunk = new THREE.Mesh(
    sweepTube(trunkPts, (t) => 0.075 - 0.047 * t, 12, 48),
    skinMat
  );
  root.add(trunk);

  // ---- ears: fan-shaped plates, grey outside, pink inside -----------------
  const earShape = new THREE.Shape();
  earShape.moveTo(0.0, 0.03);
  earShape.bezierCurveTo(0.14, 0.075, 0.28, 0.035, 0.33, -0.06);
  earShape.bezierCurveTo(0.38, -0.18, 0.34, -0.31, 0.23, -0.36);
  earShape.bezierCurveTo(0.16, -0.39, 0.1, -0.4, 0.04, -0.36);
  earShape.bezierCurveTo(-0.01, -0.3, -0.02, -0.18, -0.01, -0.06);
  earShape.bezierCurveTo(-0.005, -0.015, -0.002, 0.01, 0.0, 0.03);
  const earGeo = new THREE.ShapeGeometry(earShape, 14);

  for (const sx of [1, -1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.225, 1.0, 0.56);
    pivot.rotation.z = sx * 0.18; // flare the bottom edge outward
    root.add(pivot);

    // Local +X of the fan points backward; local +Z maps to the outward side.
    const fan = new THREE.Group();
    fan.rotation.y = Math.PI / 2;
    pivot.add(fan);

    const outer = new THREE.Mesh(earGeo, earSkinMat);
    outer.position.z = 0.012 * sx;
    const inner = new THREE.Mesh(earGeo, pinkMat);
    inner.position.z = -0.012 * sx;
    inner.scale.set(0.84, 0.84, 1); // grey rim shows around the pink
    fan.add(outer, inner);
  }

  // ---- legs, ankle creases, padded feet, pale toenails -------------------
  const LEG_X = 0.165;
  const LEG_H = 0.62;
  const legTopR = 0.1;
  const legBotR = 0.12;
  const legRAt = (y: number) => legBotR + (legTopR - legBotR) * (y / LEG_H);
  const legGeo = new THREE.CylinderGeometry(legTopR, legBotR, LEG_H, 14, 1);
  const ringGeo = new THREE.TorusGeometry(1, 0.1, 6, 16);
  const nailGeo = new THREE.SphereGeometry(1, 6, 5);

  for (const z of [0.26, -0.26]) {
    for (const sx of [1, -1]) {
      const x = sx * LEG_X;

      const leg = new THREE.Mesh(legGeo, skinMat);
      leg.position.set(x, LEG_H / 2, z);
      root.add(leg);

      for (const y of [0.15, 0.28]) {
        const r = legRAt(y) + 0.003;
        const ring = new THREE.Mesh(ringGeo, skinMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(x, y, z);
        ring.scale.set(r, r, r);
        root.add(ring);
      }

      blob(x, 0.055, z, 0.13, 0.07, 0.135, skinMat, 14, 10);

      const nailXs = z > 0 ? [-0.058, -0.02, 0.02, 0.058] : [-0.04, 0, 0.04];
      for (const dx of nailXs) {
        const yN = 0.04;
        const ellipse = 1 - (dx / 0.13) ** 2 - ((yN - 0.055) / 0.07) ** 2;
        const fz = Math.sqrt(Math.max(0, ellipse)) * 0.135;
        const nail = new THREE.Mesh(nailGeo, ivoryMat);
        nail.position.set(x + dx, yN, z + fz * 0.95);
        nail.scale.set(0.02, 0.024, 0.011);
        root.add(nail);
      }
    }
  }

  // ---- stubby baby tusks ----------------------------------------------------
  const tuskGeo = new THREE.CylinderGeometry(0.006, 0.022, 0.09, 10);
  const yAxis = new THREE.Vector3(0, 1, 0);
  for (const sx of [1, -1]) {
    const dir = new THREE.Vector3(sx * 0.22, -0.36, 1).normalize();
    const base = new THREE.Vector3(sx * 0.085, 0.8, 0.755);
    const tusk = new THREE.Mesh(tuskGeo, ivoryMat);
    tusk.quaternion.setFromUnitVectors(yAxis, dir);
    tusk.position.copy(base).addScaledVector(dir, 0.045);
    root.add(tusk);
  }

  // ---- eyes: brown irises, dark lid rim, long lashes ----------------------
  const eyeGeo = new THREE.SphereGeometry(0.03, 16, 12);
  const pupilGeo = new THREE.SphereGeometry(0.014, 10, 8);
  const amberGeo = new THREE.TorusGeometry(0.017, 0.0045, 6, 14);
  const glintGeo = new THREE.SphereGeometry(0.0065, 8, 6);
  const lidGeo = new THREE.TorusGeometry(0.031, 0.0075, 6, 18);
  const lashGeo = new THREE.CylinderGeometry(0.0014, 0.0045, 0.05, 5);

  for (const sx of [1, -1]) {
    const p = new THREE.Vector3(sx * 0.19, 0.98, 0.66);
    // Outward normal of the head ellipsoid at p.
    const n = new THREE.Vector3(
      (p.x - headC.x) / (HA * HA),
      (p.y - headC.y) / (HB * HB),
      (p.z - headC.z) / (HC * HC)
    ).normalize();

    const eye = new THREE.Group();
    root.add(eye);
    eye.position.copy(p);
    eye.lookAt(p.clone().add(n)); // local +Z points out of the face

    eye.add(new THREE.Mesh(eyeGeo, irisMat));

    const amber = new THREE.Mesh(amberGeo, amberMat);
    amber.position.z = 0.026;
    eye.add(amber);

    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.z = 0.027;
    pupil.scale.set(1, 1, 0.6);
    eye.add(pupil);

    const glint = new THREE.Mesh(glintGeo, glintMat);
    glint.position.set(0.01, 0.011, 0.034);
    eye.add(glint);

    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.z = 0.004;
    eye.add(lid);

    for (let k = 0; k < 7; k++) {
      const th = Math.PI * (0.1 + (0.8 * k) / 6);
      const bx = Math.cos(th);
      const by = Math.sin(th);
      const dir = new THREE.Vector3(bx * 0.5, by * 0.5 + 0.12, 0.85).normalize();
      const lash = new THREE.Mesh(lashGeo, lashMat);
      lash.quaternion.setFromUnitVectors(yAxis, dir);
      lash.position
        .set(bx * 0.034, by * 0.034, 0.004)
        .addScaledVector(dir, 0.024);
      eye.add(lash);
    }
  }

  // ---- tail: thin sweep ending in a small hair tuft -----------------------
  const tailPts = [
    new THREE.Vector3(0, 0.8, -0.44),
    new THREE.Vector3(0, 0.7, -0.56),
    new THREE.Vector3(0, 0.6, -0.62),
    new THREE.Vector3(0, 0.5, -0.6),
  ];
  const tail = new THREE.Mesh(
    sweepTube(tailPts, (t) => 0.022 - 0.011 * t, 8, 14),
    skinMat
  );
  root.add(tail);

  const tuftTip = new THREE.Vector3(0, 0.5, -0.6);
  const strandGeo = new THREE.CylinderGeometry(0.004, 0.0008, 0.1, 5);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand() * 0.4;
    const dir = new THREE.Vector3(Math.cos(a) * 0.45, -1, Math.sin(a) * 0.45).normalize();
    const strand = new THREE.Mesh(strandGeo, hairMat);
    // Cylinder top (+Y) sits at the tail tip and the strand hangs along dir.
    strand.quaternion.setFromUnitVectors(yAxis, dir.clone().negate());
    strand.position.copy(tuftTip).addScaledVector(dir, 0.05);
    root.add(strand);
  }

  return root;
}
```