import * as THREE from "three";

export const meta = {
  name: "Octopus",
  description:
    "A stylized coral octopus resting on the seabed: a bulbous mantle with big glossy eyes and eight arms with pale suckers, the tips curled into hooks.",
};

// Small seeded PRNG (mulberry32) so every build is identical.
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Mottled skin texture drawn on a canvas. Falls back to a flat colour when no DOM is present.
function makeSkinTexture(rnd: () => number): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  if (!g) return null;

  g.fillStyle = "#e8743f";
  g.fillRect(0, 0, 512, 256);

  // Dark blotches, drawn with horizontal wrap so the seam stays clean.
  for (let i = 0; i < 80; i++) {
    const x = rnd() * 512;
    const y = rnd() * 256;
    const rx = 12 + rnd() * 30;
    const ry = rx * (0.45 + rnd() * 0.4);
    const rot = rnd() * Math.PI;
    g.fillStyle = `rgba(118, 34, 32, ${(0.22 + rnd() * 0.3).toFixed(2)})`;
    for (const ox of [-512, 0, 512]) {
      g.beginPath();
      g.ellipse(x + ox, y, rx, ry, rot, 0, Math.PI * 2);
      g.fill();
    }
  }

  // Pale chromatophore speckles.
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(255, 214, 186, ${(0.35 + rnd() * 0.4).toFixed(2)})`;
    g.beginPath();
    g.arc(rnd() * 512, rnd() * 256, 1 + rnd() * 2.2, 0, Math.PI * 2);
    g.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

export default function createOctopus(): THREE.Object3D {
  const rnd = makeRng(20240611);
  const UP = new THREE.Vector3(0, 1, 0);
  const FWD = new THREE.Vector3(0, 0, 1);

  const root = new THREE.Group();
  root.name = "octopus";

  // ---- Materials (one per colour, shared) ----
  const skinTex = makeSkinTexture(rnd);
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinTex ? 0xffffff : 0xe8743f,
    map: skinTex,
    roughness: 0.5,
  });
  const armMat = new THREE.MeshStandardMaterial({ color: 0xe0683a, roughness: 0.55 });
  const paleMat = new THREE.MeshStandardMaterial({ color: 0xffe0c8, roughness: 0.35 });
  const deepMat = new THREE.MeshStandardMaterial({ color: 0x6e2624, roughness: 0.6 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfff7ec, roughness: 0.2 });
  const inkMat = new THREE.MeshStandardMaterial({ color: 0x120e12, roughness: 0.3 });

  // ---- Mantle (head) ----
  const head = new THREE.Group();
  head.position.y = 0.14;
  root.add(head);

  const mantleProfile = [
    [0.0, 0.0],
    [0.11, 0.012],
    [0.17, 0.06],
    [0.2, 0.14],
    [0.206, 0.24],
    [0.18, 0.33],
    [0.12, 0.39],
    [0.062, 0.42],
    [0.0, 0.432],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const mantle = new THREE.Mesh(new THREE.LatheGeometry(mantleProfile, 18), skinMat);
  head.add(mantle);

  // Funnel tucked under the front of the mantle, pointing forward and down.
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.046, 0.13, 8), deepMat);
  funnel.position.set(0, 0.05, 0.19);
  funnel.quaternion.setFromUnitVectors(UP, new THREE.Vector3(0, -0.55, 0.85).normalize());
  head.add(funnel);

  // ---- Eyes: white ball, dark lid ring, ink pupil and a glint ----
  const eyeGeo = new THREE.SphereGeometry(0.062, 14, 10);
  const pupilGeo = new THREE.SphereGeometry(0.032, 10, 8);
  const glintGeo = new THREE.SphereGeometry(0.011, 6, 5);
  const lidGeo = new THREE.TorusGeometry(0.066, 0.013, 6, 14);

  for (const side of [-1, 1]) {
    const c = new THREE.Vector3(side * 0.135, 0.22, 0.15);
    const out = new THREE.Vector3(side * 0.6, 0.08, 0.8).normalize();

    const eye = new THREE.Mesh(eyeGeo, whiteMat);
    eye.position.copy(c);
    head.add(eye);

    const lid = new THREE.Mesh(lidGeo, deepMat);
    lid.position.copy(c).addScaledVector(out, 0.02);
    lid.quaternion.setFromUnitVectors(FWD, out);
    head.add(lid);

    const pupil = new THREE.Mesh(pupilGeo, inkMat);
    pupil.position.copy(c).addScaledVector(out, 0.05);
    head.add(pupil);

    const glint = new THREE.Mesh(glintGeo, whiteMat);
    glint.position
      .copy(c)
      .addScaledVector(out, 0.08)
      .add(new THREE.Vector3(-side * 0.014, 0.016, 0));
    head.add(glint);
  }

  // ---- Arms ----
  const ARMS = 8;
  const SEG = 24;
  const STEP = 0.021;

  // Radius tapers from the mantle down to a fine tip.
  const armR = (u: number) => 0.072 * Math.pow(1 - u, 0.85) + 0.013;
  // Arm roots rise up under the mantle, then lie flat on the floor.
  const armLift = (u: number) => 0.1 * Math.pow(Math.max(0, 1 - u / 0.42), 2);

  const segGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, false);
  const jointGeo = new THREE.SphereGeometry(1, 8, 6);

  for (let a = 0; a < ARMS; a++) {
    const armGroup = new THREE.Group();
    armGroup.name = `arm${a}`;
    root.add(armGroup);

    const base = (a / ARMS) * Math.PI * 2 + (rnd() - 0.5) * 0.35;
    const curl = a % 2 === 0 ? 1 : -1; // alternate curl direction for variety
    const wavePhase = rnd() * Math.PI * 2;
    const waveAmp = 0.5 + rnd() * 0.6;

    // Walk the arm across the floor, bending gently, then curling the tip into a hook.
    const pts: THREE.Vector3[] = [];
    const us: number[] = [];
    let h = base;
    let x = Math.sin(base) * 0.05;
    let z = Math.cos(base) * 0.05;
    for (let i = 0; i <= SEG; i++) {
      const u = i / SEG;
      pts.push(new THREE.Vector3(x, armR(u) + armLift(u), z));
      us.push(u);
      if (i === SEG) break;
      const k =
        waveAmp * Math.sin(u * 5.5 + wavePhase) * (1 - 0.5 * u) +
        (u > 0.4 ? curl * 46 * Math.pow((u - 0.4) / 0.6, 2) : 0);
      h += k * STEP;
      x += Math.sin(h) * STEP;
      z += Math.cos(h) * STEP;
    }

    // Tapered segments between joints.
    for (let i = 0; i < SEG; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const d = new THREE.Vector3().subVectors(p1, p0);
      const len = d.length();
      d.divideScalar(len);
      const r = (armR(us[i]) + armR(us[i + 1])) * 0.5;
      const seg = new THREE.Mesh(segGeo, armMat);
      seg.position.addVectors(p0, p1).multiplyScalar(0.5);
      seg.quaternion.setFromUnitVectors(UP, d);
      seg.scale.set(r, len * 1.06, r);
      armGroup.add(seg);
    }

    // Round joints hide the seams and read as puppet-like knuckles.
    for (let i = 0; i <= SEG; i++) {
      const j = new THREE.Mesh(jointGeo, armMat);
      j.position.copy(pts[i]);
      j.scale.setScalar(armR(us[i]));
      armGroup.add(j);
    }

    // Two rows of pale suckers on the upper flanks.
    for (let i = 2; i <= SEG - 6; i += 2) {
      const t = new THREE.Vector3().subVectors(pts[i + 1], pts[i - 1]).normalize();
      const side = new THREE.Vector3().crossVectors(t, UP).normalize();
      const r = armR(us[i]);
      for (const s of [-1, 1]) {
        const v = new THREE.Vector3()
          .addScaledVector(side, s * 0.75)
          .addScaledVector(UP, 0.66)
          .normalize();
        const sk = new THREE.Mesh(jointGeo, paleMat);
        sk.position.copy(pts[i]).addScaledVector(v, r * 0.95);
        sk.scale.setScalar(r * 0.24);
        armGroup.add(sk);
      }
    }
  }

  // Rest the lowest point exactly on the floor (y = 0).
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root, true);
  root.position.y -= box.min.y;

  return root;
}
