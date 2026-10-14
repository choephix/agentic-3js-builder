```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "gramophone",
  description:
    "Antique gramophone: flared morning-glory brass horn with patina, black record with red label, silver tonearm, crank, claw feet, and a walnut cabinet with pale floral inlay.",
};

function canvasTexture(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const rnd = rng(11);

  // ---- textures -----------------------------------------------------------

  // Brass with a warm, slightly green patina.
  const brassTex = canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = "#b98d45";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 420; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const r = 2 + rnd() * 12;
      g.fillStyle = `rgba(86,140,108,${(0.25 + rnd() * 0.4).toFixed(3)})`;
      g.beginPath();
      g.ellipse(x, y, r, r * 0.6, rnd() * 3, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 300; i++) {
      g.fillStyle = `rgba(255,235,180,${(rnd() * 0.35).toFixed(3)})`;
      g.beginPath();
      g.arc(rnd() * w, rnd() * h, 0.8 + rnd() * 1.4, 0, Math.PI * 2);
      g.fill();
    }
  });

  // Walnut grain with a pale floral inlay.
  const walnutTex = canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = "#5a381f";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) {
      g.strokeStyle = `rgba(25,12,4,${(0.12 + rnd() * 0.2).toFixed(3)})`;
      g.lineWidth = 1 + rnd() * 2;
      const y = rnd() * h;
      g.beginPath();
      g.moveTo(0, y);
      g.bezierCurveTo(
        w * 0.3, y + rnd() * 30 - 15,
        w * 0.6, y + rnd() * 30 - 15,
        w, y + rnd() * 20 - 10,
      );
      g.stroke();
    }
    for (let gy = 0; gy < 3; gy++) {
      for (let gx = 0; gx < 3; gx++) {
        const cx = ((gx + 0.5) * w) / 3;
        const cy = ((gy + 0.5) * h) / 3;
        const r = 34;
        // leaves
        g.save();
        g.translate(cx, cy);
        g.fillStyle = "#c8d2a8";
        g.strokeStyle = "#a9b587";
        g.lineWidth = 1.2;
        for (const side of [-1, 1]) {
          g.save();
          g.rotate(side * 0.9);
          g.beginPath();
          g.ellipse(0, -r * 1.25, r * 0.22, r * 0.5, 0, 0, Math.PI * 2);
          g.fill();
          g.stroke();
          g.restore();
        }
        // five petals
        for (let k = 0; k < 5; k++) {
          g.save();
          g.rotate((k * Math.PI * 2) / 5);
          g.beginPath();
          g.ellipse(0, -r * 0.5, r * 0.28, r * 0.5, 0, 0, Math.PI * 2);
          g.fillStyle = "#ece1c8";
          g.fill();
          g.strokeStyle = "#b9a77f";
          g.lineWidth = 1.5;
          g.stroke();
          g.restore();
        }
        g.beginPath();
        g.arc(0, 0, r * 0.18, 0, Math.PI * 2);
        g.fillStyle = "#c9a85c";
        g.fill();
        g.restore();
      }
    }
  });

  // ---- materials ----------------------------------------------------------

  const brass = new THREE.MeshStandardMaterial({
    map: brassTex,
    color: 0xffffff,
    metalness: 0.7,
    roughness: 0.35,
  });
  const walnut = new THREE.MeshStandardMaterial({
    map: walnutTex,
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.55,
  });
  const silver = new THREE.MeshStandardMaterial({
    color: 0xd4d7dc,
    metalness: 0.9,
    roughness: 0.25,
  });
  const black = new THREE.MeshStandardMaterial({
    color: 0x101010,
    metalness: 0.1,
    roughness: 0.3,
  });
  const red = new THREE.MeshStandardMaterial({
    color: 0xb3202a,
    metalness: 0.0,
    roughness: 0.5,
  });

  const root = b.root;
  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
    rz = 0,
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    root.add(m);
    return m;
  };

  // ---- cabinet ------------------------------------------------------------

  // Walnut cabinet: bottom at y=0.04, top at y=0.40.
  add(new THREE.BoxGeometry(0.44, 0.36, 0.4), walnut, 0, 0.22, 0);
  // Slightly proud top panel with a pale inlaid border of its own.
  add(new THREE.BoxGeometry(0.46, 0.012, 0.42), walnut, 0, 0.406, 0);
  // Recessed front drawer pull.
  add(new THREE.BoxGeometry(0.12, 0.02, 0.01), brass, 0, 0.14, 0.205);

  // Claw feet: a brass cup and three claws each.
  const clawGeo = new THREE.ConeGeometry(0.007, 0.03, 4);
  clawGeo.rotateX(Math.PI);
  clawGeo.translate(0, -0.015, 0);
  const cupGeo = new THREE.CylinderGeometry(0.018, 0.02, 0.012, 16);
  const feetCorners: [number, number][] = [
    [-0.19, -0.15],
    [0.19, -0.15],
    [-0.19, 0.15],
    [0.19, 0.15],
  ];
  for (const [fx, fz] of feetCorners) {
    add(cupGeo, brass, fx, 0.034, fz);
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3 + 0.4;
      const claw = new THREE.Mesh(clawGeo, brass);
      claw.position.set(fx + Math.cos(a) * 0.012, 0.03, fz + Math.sin(a) * 0.012);
      claw.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
      root.add(claw);
    }
  }

  // ---- turntable and record -----------------------------------------------

  const recordZ = 0.02;
  // Brass platter.
  add(new THREE.CylinderGeometry(0.16, 0.16, 0.012, 40), brass, 0, 0.406, recordZ);
  // Black record.
  add(new THREE.CylinderGeometry(0.14, 0.14, 0.003, 40), black, 0, 0.4135, recordZ);
  // Red label on the record's top face.
  const label = new THREE.CircleGeometry(0.05, 28);
  label.rotateX(-Math.PI / 2);
  add(label, red, 0, 0.4152, recordZ);
  // Spindle.
  add(new THREE.CylinderGeometry(0.003, 0.003, 0.02, 8), silver, 0, 0.425, recordZ);

  // ---- horn ---------------------------------------------------------------

  // Morning-glory bell: a lathed flare with five lobes opening at the rim.
  const hornProfile = [
    [0.016, 0], [0.02, 0.08], [0.026, 0.18], [0.04, 0.26], [0.075, 0.33],
    [0.14, 0.4], [0.21, 0.46], [0.255, 0.5], [0.27, 0.52],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const hornGeo = new THREE.LatheGeometry(hornProfile, 40);
  const hp = hornGeo.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    const x = hp.getX(i);
    const y = hp.getY(i);
    const z = hp.getZ(i);
    const t = y / 0.52;
    const s = Math.min(1, Math.max(0, (t - 0.45) / 0.5));
    const ang = Math.atan2(z, x);
    const f = 1 + 0.12 * s * (Math.cos(5 * ang) + 1) * 0.5;
    hp.setXYZ(i, x * f, y, z * f);
  }
  hornGeo.computeVertexNormals();
  const hornMat = new THREE.MeshStandardMaterial({
    map: brassTex,
    color: 0xffffff,
    metalness: 0.7,
    roughness: 0.35,
    side: THREE.DoubleSide,
  });
  const horn = new THREE.Mesh(hornGeo, hornMat);
  const hornGroup = new THREE.Group();
  hornGroup.position.set(0, 0.41, -0.1);
  hornGroup.rotation.set(0.6, 0, 0);
  hornGroup.add(horn);
  root.add(hornGroup);

  // Horn neck collar where it leaves the cabinet.
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 20), brass, 0, 0.408, -0.1);

  // ---- tonearm ------------------------------------------------------------

  // Silver pivot post.
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 14), silver, 0.17, 0.42, -0.15);
  // Arm: a smooth tube arcing from the pivot to the record edge.
  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.17, 0.44, -0.15),
    new THREE.Vector3(0.165, 0.48, -0.09),
    new THREE.Vector3(0.13, 0.46, -0.02),
    new THREE.Vector3(0.08, 0.43, 0.01),
  ]);
  add(new THREE.TubeGeometry(armCurve, 32, 0.0055, 8, false), silver, 0, 0, 0);
  // Headshell at the needle end.
  add(new THREE.BoxGeometry(0.02, 0.008, 0.03), silver, 0.08, 0.428, 0.01, 0, 0.3, 0);
  // Arm rest.
  add(new THREE.BoxGeometry(0.03, 0.012, 0.03), silver, 0.2, 0.41, 0.14);

  // ---- crank --------------------------------------------------------------

  // Crank disc on the right side of the cabinet.
  const discGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.012, 24);
  discGeo.rotateZ(Math.PI / 2);
  add(discGeo, brass, 0.228, 0.26, 0.09);
  // Crank pin arm and knob.
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.02, 8), silver, 0.236, 0.27, 0.09);
  add(new THREE.SphereGeometry(0.009, 12, 8), black, 0.25, 0.28, 0.09);

  return b.root;
}
```