import * as THREE from "three";

export const meta = {
  name: "Gramophone",
  description: "Antique wind-up gramophone with a wooden cabinet, brass horn, turntable, tonearm and crank.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);

  // canvas wood texture
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#6b3a1e"; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = rnd() > 0.5 ? "#7d4626" : "#552d16";
    g.lineWidth = 1 + rnd() * 2;
    const y = rnd() * 128;
    g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(40, y + rnd() * 8, 80, y - rnd() * 8, 128, y); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  const wood = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x3e2110, roughness: 0.6 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd9a63a, metalness: 0.8, roughness: 0.3 });
  const darkBrass = new THREE.MeshStandardMaterial({ color: 0x9a6f1f, metalness: 0.7, roughness: 0.4 });
  const black = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.35 });
  const red = new THREE.MeshStandardMaterial({ color: 0xb02a2a, roughness: 0.6 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: 0.9, roughness: 0.25 });
  const felt = new THREE.MeshStandardMaterial({ color: 0x1f4d2e, roughness: 0.95 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // cabinet
  add(new THREE.BoxGeometry(0.4, 0.04, 0.4), darkWood, 0, 0.14, 0); // base plinth
  add(new THREE.BoxGeometry(0.36, 0.02, 0.36), darkWood, 0, 0.02, 0);
  // feet
  for (const x of [-1, 1]) for (const z of [-1, 1])
    add(new THREE.CylinderGeometry(0.02, 0.025, 0.04, 6), darkWood, x * 0.16, 0.02, z * 0.16);
  add(new THREE.BoxGeometry(0.36, 0.2, 0.36), wood, 0, 0.1 + 0.04, 0).position.y = 0.14 - 0.02;
  // lid top
  add(new THREE.BoxGeometry(0.4, 0.03, 0.4), darkWood, 0, 0.255, 0);
  // front panel grille
  add(new THREE.BoxGeometry(0.2, 0.1, 0.01), black, 0, 0.14, 0.183);
  for (let i = 0; i < 5; i++)
    add(new THREE.BoxGeometry(0.2, 0.008, 0.012), brass, 0, 0.1 + i * 0.02, 0.185);
  // corner posts
  for (const x of [-1, 1]) for (const z of [-1, 1])
    add(new THREE.BoxGeometry(0.03, 0.2, 0.03), darkWood, x * 0.18, 0.14, z * 0.18);

  // turntable
  const top = 0.27;
  add(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 16), felt, -0.02, top + 0.005, 0.02);
  add(new THREE.CylinderGeometry(0.14, 0.14, 0.008, 20), black, -0.02, top + 0.014, 0.02);
  add(new THREE.CylinderGeometry(0.045, 0.045, 0.009, 16), red, -0.02, top + 0.02, 0.02);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 6), steel, -0.02, top + 0.035, 0.02);
  for (const r of [0.07, 0.09, 0.11, 0.13]) {
    const ring = add(new THREE.TorusGeometry(r, 0.0015, 3, 24), darkWood, -0.02, top + 0.0185, 0.02);
    ring.rotation.x = Math.PI / 2;
  }

  // tonearm
  const armBase = new THREE.Group();
  armBase.position.set(0.14, top + 0.01, 0.12);
  root.add(armBase);
  add(new THREE.CylinderGeometry(0.02, 0.025, 0.03, 8), brass, 0, 0.01, 0, armBase);
  const arm = new THREE.Group();
  arm.position.set(0, 0.035, 0);
  arm.rotation.y = 0.9;
  armBase.add(arm);
  const bar = add(new THREE.BoxGeometry(0.015, 0.012, 0.19), steel, 0, 0, -0.095, arm);
  void bar;
  add(new THREE.BoxGeometry(0.03, 0.02, 0.035), brass, 0, -0.005, -0.2, arm);
  add(new THREE.ConeGeometry(0.004, 0.02, 4), steel, 0, -0.025, -0.2, arm).rotation.x = Math.PI;
  // horn neck: elbow
  const neck = add(new THREE.CylinderGeometry(0.03, 0.025, 0.1, 8), brass, 0, 0.0, 0.0, arm);
  neck.visible = false;

  // horn: bell flares upward-back
  const horn = new THREE.Group();
  horn.position.set(-0.02, 0.29, -0.12);
  horn.rotation.x = -0.5;
  root.add(horn);
  // tube from neck
  const pts: THREE.Vector2[] = [];
  const N = 9;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(new THREE.Vector2(0.025 + 0.28 * Math.pow(t, 2.6), t * 0.5));
  }
  const bell = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), brass);
  bell.rotation.x = Math.PI / 2; // axis along +Z... point toward front-up
  bell.rotation.x = -Math.PI / 2;
  horn.add(bell);
  bell.position.set(0, 0, 0);
  // rim
  const rim = add(new THREE.TorusGeometry(0.305, 0.008, 4, 20), darkBrass, 0, 0, -0.5, horn);
  // reposition: bell opens toward -Z (back); flip horn so mouth faces back-up
  void rim;
  // reorient horn to open toward +Z? Gramophone horn faces viewer: rotate
  horn.rotation.set(0.45, Math.PI, 0);
  horn.position.set(0, 0.34, -0.13);
  // rim relative fix: lathe axis maps to -Z after rotation -PI/2 about X; rim at z=-0.5 matches
  // neck connector
  add(new THREE.CylinderGeometry(0.035, 0.045, 0.1, 8), brass, 0, 0.3, -0.13);
  add(new THREE.SphereGeometry(0.04, 8, 6), darkBrass, 0, 0.28, -0.13);
  // horn stand ring
  add(new THREE.TorusGeometry(0.04, 0.008, 4, 8), darkBrass, 0, 0.275, -0.13).rotation.x = Math.PI / 2;

  // crank on right side (+X is left; put on -X side)
  const crank = new THREE.Group();
  crank.position.set(-0.2, 0.14, 0.0);
  root.add(crank);
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), steel, -0.02, 0, 0, crank).rotation.z = Math.PI / 2;
  add(new THREE.BoxGeometry(0.012, 0.012, 0.09), brass, -0.04, 0, 0.03, crank);
  add(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 8), red, -0.04, 0, 0.09, crank).rotation.z = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8), brass, -0.002, 0, 0, crank).rotation.z = Math.PI / 2;

  // speed knob and brake
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.015, 8), brass, 0.12, top + 0.014, -0.12);
  add(new THREE.SphereGeometry(0.008, 6, 4), red, 0.12, top + 0.025, -0.12);

  // Fix: horn mouth should be above ground and model on floor
  return root;
}
