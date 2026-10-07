```ts
import * as THREE from "three";

export const meta = {
  name: "Battle-Worn Knight",
  description: "Plate-armoured knight with plumed great helm, filigree pauldrons, blue griffin surcoat, kite shield, broadsword and torn crimson cape.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function griffinTexture(bg: string, fg: string, size = 256, shield = false) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, size, size);
  g.strokeStyle = fg;
  g.fillStyle = fg;
  g.lineWidth = 6;
  if (shield) {
    g.strokeStyle = "#d4af37";
    g.lineWidth = 14;
    g.strokeRect(7, 7, size - 14, size - 14);
    g.strokeStyle = fg;
    g.lineWidth = 6;
  }
  // stylised griffin: body, wing, head, tail
  g.beginPath();
  g.ellipse(128, 150, 36, 48, 0.2, 0, 7); g.fill();
  g.beginPath(); g.moveTo(110, 120); g.lineTo(50, 50); g.lineTo(80, 90); g.lineTo(40, 100); g.lineTo(80, 125); g.lineTo(60, 150); g.lineTo(115, 150); g.fill();
  g.beginPath(); g.arc(138, 82, 20, 0, 7); g.fill();
  g.beginPath(); g.moveTo(150, 78); g.lineTo(186, 90); g.lineTo(150, 94); g.fill();
  g.beginPath(); g.moveTo(130, 66); g.lineTo(120, 40); g.lineTo(145, 60); g.fill();
  g.beginPath(); g.moveTo(150, 190); g.quadraticCurveTo(205, 190, 190, 130); g.lineWidth = 9; g.stroke();
  g.beginPath(); g.moveTo(110, 190); g.lineTo(100, 225); g.moveTo(140, 192); g.lineTo(150, 225); g.lineWidth = 10; g.stroke();
  g.fillStyle = bg; g.beginPath(); g.arc(142, 80, 4, 0, 7); g.fill();
  const t = new THREE.CanvasTexture(g.canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function metalTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#9aa1a9";
  g.fillRect(0, 0, 128, 128);
  const r = rng(7);
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = r() > 0.5 ? "rgba(40,40,45,0.35)" : "rgba(230,235,240,0.3)";
    g.lineWidth = 1;
    g.beginPath();
    const x = r() * 128, y = r() * 128;
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 40);
    g.stroke();
  }
  for (let i = 0; i < 10; i++) {
    g.fillStyle = "rgba(60,60,66,0.3)";
    g.beginPath(); g.arc(r() * 128, r() * 128, 3 + r() * 6, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(g.canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const R = rng(42);

  const steel = new THREE.MeshStandardMaterial({ color: 0xffffff, map: metalTexture(), metalness: 0.7, roughness: 0.45, flatShading: true });
  const darkSteel = new THREE.MeshStandardMaterial({ color: 0x4d535b, metalness: 0.7, roughness: 0.55, flatShading: true });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.35, flatShading: true });
  const blue = new THREE.MeshStandardMaterial({ color: 0x14307a, roughness: 0.9, flatShading: true });
  const crimson = new THREE.MeshStandardMaterial({ color: 0xa3141e, roughness: 0.9, flatShading: true, side: THREE.DoubleSide });
  const leather = new THREE.MeshStandardMaterial({ color: 0x4a2f1c, roughness: 0.9, flatShading: true });
  const black = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1 });
  const emblem = new THREE.MeshStandardMaterial({ map: griffinTexture("#14307a", "#d8dde3"), roughness: 0.8 });
  const shieldTex = new THREE.MeshStandardMaterial({ map: griffinTexture("#14307a", "#d8dde3", 256, true), roughness: 0.7 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);

  // Legs
  for (const s of [-1, 1]) {
    const x = s * 0.12;
    const leg = new THREE.Group();
    leg.position.set(x, 0, 0);
    root.add(leg);
    add(box(0.14, 0.09, 0.3), darkSteel, 0, 0.045, 0.06, leg); // sabaton
    add(box(0.1, 0.1, 0.12), steel, 0, 0.1, 0.17, leg).rotation.x = 0.4;
    add(cyl(0.065, 0.075, 0.4, 6), steel, 0, 0.3, 0, leg); // greave
    add(box(0.05, 0.3, 0.02), darkSteel, 0, 0.3, 0.07, leg);
    add(new THREE.SphereGeometry(0.09, 6, 5), gold, 0, 0.52, 0.04, leg); // knee
    add(cyl(0.085, 0.07, 0.4, 6), steel, 0, 0.74, 0, leg); // cuisse
    add(box(0.18, 0.04, 0.18), darkSteel, 0, 0.5, 0, leg);
  }

  // Tassets / skirt
  add(cyl(0.2, 0.28, 0.3, 8), blue, 0, 0.88, 0, root);
  add(box(0.34, 0.5, 0.02), blue, 0, 0.73, 0.2, root).rotation.x = 0.08;
  add(box(0.34, 0.5, 0.02), blue, 0, 0.73, -0.2, root).rotation.x = -0.08;
  for (let i = -2; i <= 2; i++) {
    add(box(0.07, 0.14, 0.02), steel, i * 0.075, 0.93, 0.27, root).rotation.x = 0.3;
  }
  // belt
  add(cyl(0.24, 0.24, 0.07, 8), leather, 0, 1.0, 0);
  add(box(0.07, 0.07, 0.03), gold, 0, 1.0, 0.24);

  // Torso
  const torso = add(cyl(0.3, 0.22, 0.55, 8), blue, 0, 1.3, 0);
  torso.scale.z = 0.7;
  const chest = add(cyl(0.31, 0.25, 0.4, 8), steel, 0, 1.4, 0);
  chest.scale.z = 0.72;
  chest.scale.set(1, 1, 0.72);
  // surcoat front panel w/ emblem
  add(box(0.34, 0.55, 0.02), blue, 0, 1.25, 0.225);
  add(new THREE.PlaneGeometry(0.28, 0.28), emblem, 0, 1.3, 0.237);
  add(box(0.06, 0.04, 0.03), gold, 0, 1.08, 0.24);
  // collar
  add(cyl(0.14, 0.2, 0.1, 8), darkSteel, 0, 1.6, 0);

  // Pauldrons
  for (const s of [-1, 1]) {
    const sh = new THREE.Group();
    sh.position.set(s * 0.36, 1.52, 0);
    root.add(sh);
    for (let i = 0; i < 3; i++) {
      const p = add(new THREE.SphereGeometry(0.17 - i * 0.015, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), i === 0 ? steel : steel, s * i * 0.03, -i * 0.055, 0, sh);
      p.scale.set(1.15, 0.8, 1.05);
      p.rotation.z = -s * 0.25;
      add(new THREE.TorusGeometry(0.16 - i * 0.015, 0.008, 4, 12), gold, s * i * 0.03, -i * 0.055 + 0.005, 0, sh).rotation.x = Math.PI / 2;
    }
    // filigree studs
    for (let k = 0; k < 5; k++) {
      const a = (k / 4) * Math.PI - Math.PI / 2;
      add(new THREE.OctahedronGeometry(0.014), gold, s * 0.03 + Math.cos(a) * 0.1, 0.07, Math.sin(a) * 0.1, sh);
    }
    add(box(0.01, 0.01, 0.2), gold, s * 0.04, 0.1, 0, sh);
    // arms
    const arm = new THREE.Group();
    arm.position.set(s * 0.06, -0.08, 0);
    sh.add(arm);
    arm.rotation.z = -s * 0.12;
    add(cyl(0.065, 0.06, 0.3, 6), steel, 0, -0.17, 0, arm);
    add(new THREE.SphereGeometry(0.07, 6, 5), gold, 0, -0.34, 0, arm);
    const fore = new THREE.Group();
    fore.position.set(0, -0.34, 0);
    arm.add(fore);
    add(cyl(0.06, 0.05, 0.3, 6), steel, 0, -0.16, 0, fore);
    add(box(0.09, 0.1, 0.09), darkSteel, 0, -0.32, 0, fore);
    add(new THREE.SphereGeometry(0.055, 6, 5), darkSteel, 0, -0.4, 0, fore);
    if (s === -1) {
      // right arm (viewer's right) holds sword: forward bend
      fore.rotation.x = -0.8;
      // sword
      const sw = new THREE.Group();
      sw.position.set(0, -0.4, 0.02);
      fore.add(sw);
      sw.rotation.x = Math.PI / 2 + 0.8 - 0.2;
      add(cyl(0.02, 0.02, 0.16, 6), leather, 0, 0, 0, sw);
      add(new THREE.SphereGeometry(0.03, 6, 5), gold, 0, -0.1, 0, sw);
      add(box(0.3, 0.04, 0.05), gold, 0, 0.09, 0, sw);
      add(box(0.07, 0.95, 0.012), steel, 0, 0.6, 0, sw);
      add(box(0.014, 0.95, 0.025), darkSteel, 0, 0.6, 0, sw);
      const tip = add(new THREE.ConeGeometry(0.035, 0.12, 4), steel, 0, 1.13, 0, sw);
      tip.scale.z = 0.35;
      tip.rotation.y = Math.PI / 4;
    } else {
      fore.rotation.x = -0.5;
      arm.rotation.z = -s * 0.05;
    }
  }

  // Shield on left arm (+X)
  const shield = new THREE.Group();
  shield.position.set(0.5, 1.1, 0.14);
  shield.rotation.y = 0.2;
  root.add(shield);
  const shape = new THREE.Shape();
  shape.moveTo(-0.24, 0.45);
  shape.lineTo(0.24, 0.45);
  shape.lineTo(0.24, 0.1);
  shape.lineTo(0, -0.55);
  shape.lineTo(-0.24, 0.1);
  shape.closePath();
  const sg = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 });
  add(sg, darkSteel, 0, 0, 0, shield);
  const faceShape = new THREE.ShapeGeometry(shape);
  const uv = faceShape.attributes.uv, pos = faceShape.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + 0.24) / 0.48, (pos.getY(i) + 0.55) / 1.0);
  const face = add(faceShape, shieldTex, 0, 0, 0.092, shield);
  face.scale.set(0.9, 0.9, 1);
  face.position.y = 0.0;
  add(new THREE.SphereGeometry(0.05, 6, 5), gold, 0, 0.0, 0.1, shield).scale.z = 0.5;
  // scratches on shield
  for (let i = 0; i < 4; i++) {
    const sc = add(box(0.005, 0.12 + R() * 0.1, 0.004), darkSteel, (R() - 0.5) * 0.3, 0.2 - R() * 0.3, 0.096, shield);
    sc.rotation.z = R() * 2;
  }

  // Head
  const head = new THREE.Group();
  head.position.set(0, 1.76, 0);
  root.add(head);
  add(cyl(0.15, 0.16, 0.34, 8), steel, 0, 0.0, 0, head);
  add(new THREE.SphereGeometry(0.15, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 0.17, 0, head);
  add(box(0.22, 0.015, 0.02), black, 0, 0.04, 0.155, head); // eye slit
  add(box(0.015, 0.2, 0.02), darkSteel, 0, -0.03, 0.16, head);
  add(box(0.03, 0.14, 0.01), darkSteel, 0.08, -0.1, 0.15, head);
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 4), black, 0.07 + i * 0.0, -0.06 - i * 0.03, 0.16, head).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 4), black, s * 0.06, -0.08, 0.16, head).rotation.x = Math.PI / 2;
  add(box(0.34, 0.03, 0.34), gold, 0, 0.12, 0, head).scale.set(0.9, 1, 0.9);
  add(cyl(0.155, 0.155, 0.02, 8), gold, 0, 0.12, 0, head);
  // crest holder & plume
  add(box(0.04, 0.05, 0.22), darkSteel, 0, 0.26, 0, head);
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const p = add(box(0.05, 0.1 + 0.1 * Math.sin(t * Math.PI), 0.07), crimson, 0, 0.32 + Math.sin(t * Math.PI) * 0.15, 0.1 - t * 0.38, head);
    p.rotation.x = -0.2 + t * 0.6;
  }

  // Cape
  const cape = new THREE.Group();
  cape.position.set(0, 1.58, -0.2);
  root.add(cape);
  const segs = 6;
  for (let i = 0; i < segs; i++) {
    const w = 0.5 + i * 0.05;
    const h = 0.22;
    const m = add(box(w, h, 0.02), crimson, 0, -i * 0.2 - 0.1, -i * 0.035, cape);
    m.rotation.x = 0.1;
    // torn hem
    if (i === segs - 1) {
      for (let k = 0; k < 6; k++) {
        const tt = add(new THREE.ConeGeometry(0.04, 0.08 + R() * 0.12, 3), crimson, -0.3 + k * 0.12, -i * 0.2 - 0.22 - R() * 0.02, -i * 0.035, cape);
        tt.rotation.x = Math.PI;
        tt.scale.z = 0.3;
      }
    }
  }
  add(box(0.5, 0.05, 0.08), gold, 0, 0.0, 0.05, cape);
  add(new THREE.SphereGeometry(0.03, 5, 4), gold, 0.2, 0.0, 0.1, cape);
  add(new THREE.SphereGeometry(0.03, 5, 4), gold, -0.2, 0.0, 0.1, cape);

  // dents on armour
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    const d = add(new THREE.OctahedronGeometry(0.02 + R() * 0.015), darkSteel, Math.sin(a) * 0.28, 1.3 + R() * 0.3, Math.cos(a) * 0.2, root);
    if (Math.cos(a) < 0) d.position.z *= 0.5;
    d.scale.z = 0.4;
  }

  return root;
}
```