import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Petal Horn Gramophone",
  description:
    "A stylized wind-up gramophone: mahogany cabinet with gilt-framed inlay panels and brass bun feet, a green felt turntable with a red-label record, a swan-neck brass tonearm with soundbox, and a big ten-petal horn in alternating burgundy and gold with gilded seams and a rolled rim.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const root = b.root;

  // ---------- palette & materials ----------
  const C = {
    wood: "#7a3b22",
    trim: "#3f1d10",
    inlay: "#c48a52",
    gold: "#e0b04a",
    brass: "#c9952f",
    felt: "#2e6b4a",
    record: "#141418",
    groove: "#34343e",
    label: "#b8262f",
    cream: "#f1e3c0",
    hornRed: "#8c1c2c",
    hornGold: "#e3b24c",
    ink: "#2a160c",
    knob: "#2b130a",
  };
  const metallic = new Set([C.gold, C.brass, C.hornGold]);
  const mats = new Map<string, THREE.MeshStandardMaterial>();
  function mat(color: string, double = false) {
    const key = color + (double ? "_d" : "");
    let m = mats.get(key);
    if (!m) {
      const metal = metallic.has(color);
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: metal ? 0.45 : 0.72,
        metalness: metal ? 0.25 : 0.04,
        flatShading: true,
        side: double ? THREE.DoubleSide : THREE.FrontSide,
      });
      mats.set(key, m);
    }
    return m;
  }
  function mesh(
    geo: THREE.BufferGeometry,
    color: string,
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
    parent: THREE.Object3D = root,
    double = false
  ) {
    const m = new THREE.Mesh(geo, mat(color, double));
    m.position.set(pos[0], pos[1], pos[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(m);
    return m;
  }
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 12) =>
    new THREE.CylinderGeometry(rt, rb, h, s);

  // ---------- cabinet ----------
  // brass bun feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      mesh(cyl(0.02, 0.026, 0.024, 8), C.brass, [sx * 0.165, 0.012, sz * 0.165]);
    }
  // plinth
  mesh(box(0.4, 0.025, 0.4), C.trim, [0, 0.0365, 0]);
  // body (y 0.049 .. 0.159)
  mesh(box(0.37, 0.11, 0.37), C.wood, [0, 0.104, 0]);
  // gilt bead lines
  mesh(box(0.374, 0.005, 0.374), C.gold, [0, 0.153, 0]);
  mesh(box(0.374, 0.005, 0.374), C.gold, [0, 0.055, 0]);
  // top lid moulding
  mesh(box(0.39, 0.014, 0.39), C.trim, [0, 0.166, 0]);
  const deckY = 0.173;

  // corner pilasters with brass caps
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      mesh(cyl(0.012, 0.012, 0.1, 6), C.trim, [sx * 0.186, 0.104, sz * 0.186]);
      mesh(cyl(0.015, 0.015, 0.008, 6), C.brass, [sx * 0.186, 0.146, sz * 0.186]);
      mesh(cyl(0.015, 0.015, 0.008, 6), C.brass, [sx * 0.186, 0.062, sz * 0.186]);
    }

  // inlay panels on all four faces (gold frame + light wood + dark centre lozenge)
  const faces: { rotY: number }[] = [
    { rotY: 0 },
    { rotY: Math.PI / 2 },
    { rotY: Math.PI },
    { rotY: -Math.PI / 2 },
  ];
  for (const f of faces) {
    const g = new THREE.Group();
    g.rotation.y = f.rotY;
    root.add(g);
    mesh(box(0.29, 0.08, 0.003), C.gold, [0, 0.104, 0.1865], [0, 0, 0], g);
    mesh(box(0.28, 0.07, 0.004), C.inlay, [0, 0.104, 0.188], [0, 0, 0], g);
    // corner rosettes
    for (const sx of [-1, 1])
      for (const sy of [-1, 1])
        mesh(new THREE.OctahedronGeometry(0.006), C.gold, [sx * 0.125, 0.104 + sy * 0.024, 0.19], [0, 0, 0], g);
    // thin dark stringing
    mesh(box(0.25, 0.002, 0.002), C.trim, [0, 0.104 + 0.028, 0.1905], [0, 0, 0], g);
    mesh(box(0.25, 0.002, 0.002), C.trim, [0, 0.104 - 0.028, 0.1905], [0, 0, 0], g);
  }

  // front brass nameplate with "lettering" and screws
  mesh(box(0.1, 0.026, 0.003), C.brass, [0, 0.104, 0.1915]);
  mesh(box(0.092, 0.019, 0.002), C.gold, [0, 0.104, 0.193]);
  const letters = [0.008, 0.006, 0.01, 0.005, 0.009, 0.007, 0.006];
  let lx = -0.038;
  for (const w of letters) {
    mesh(box(w, 0.007, 0.0015), C.ink, [lx + w / 2, 0.106, 0.1942]);
    lx += w + 0.004;
  }
  mesh(box(0.05, 0.0015, 0.0015), C.ink, [0, 0.0985, 0.1942]);
  for (const sx of [-1, 1]) mesh(new THREE.SphereGeometry(0.0035, 6, 4), C.brass, [sx * 0.044, 0.104, 0.194]);

  // ---------- crank (right side, -X) ----------
  mesh(cyl(0.024, 0.024, 0.004, 12), C.brass, [-0.1925, 0.104, 0.04], [0, 0, Math.PI / 2]);
  mesh(cyl(0.012, 0.012, 0.006, 8), C.gold, [-0.196, 0.104, 0.04], [0, 0, Math.PI / 2]);
  mesh(cyl(0.006, 0.006, 0.05, 8), C.brass, [-0.22, 0.104, 0.04], [0, 0, Math.PI / 2]);
  mesh(box(0.008, 0.014, 0.1), C.brass, [-0.247, 0.104, 0.08]);
  mesh(new THREE.SphereGeometry(0.01, 8, 6), C.brass, [-0.247, 0.104, 0.04]);
  mesh(cyl(0.004, 0.004, 0.03, 6), C.brass, [-0.262, 0.104, 0.125], [0, 0, Math.PI / 2]);
  mesh(cyl(0.011, 0.013, 0.04, 8), C.knob, [-0.285, 0.104, 0.125], [0, 0, Math.PI / 2]);
  mesh(new THREE.SphereGeometry(0.009, 8, 5), C.brass, [-0.306, 0.104, 0.125]);

  // ---------- deck controls ----------
  // speed lever (front right)
  mesh(cyl(0.014, 0.016, 0.006, 10), C.brass, [-0.15, deckY + 0.003, 0.15]);
  mesh(cyl(0.003, 0.003, 0.04, 6), C.brass, [-0.143, deckY + 0.02, 0.15], [0, 0, 0.35]);
  mesh(new THREE.SphereGeometry(0.007, 8, 5), C.knob, [-0.136, deckY + 0.038, 0.15]);
  // brake knob (front left)
  mesh(cyl(0.012, 0.014, 0.006, 10), C.brass, [0.15, deckY + 0.003, 0.15]);
  mesh(cyl(0.004, 0.004, 0.018, 6), C.brass, [0.15, deckY + 0.014, 0.15]);
  mesh(cyl(0.008, 0.008, 0.008, 8), C.knob, [0.15, deckY + 0.026, 0.15]);
  // little scale arc behind speed lever
  for (let i = 0; i < 5; i++) {
    const a = -0.6 + i * 0.3;
    mesh(box(0.002, 0.001, 0.008), C.gold, [-0.15 + Math.sin(a) * 0.022, deckY + 0.0005, 0.15 - Math.cos(a) * 0.022], [0, -a, 0]);
  }

  // ---------- turntable & record ----------
  mesh(cyl(0.155, 0.155, 0.012, 28), C.brass, [0, deckY + 0.006, 0]);
  mesh(cyl(0.15, 0.15, 0.003, 28), C.felt, [0, deckY + 0.0135, 0]);
  const recTop = deckY + 0.015 + 0.004;
  mesh(cyl(0.145, 0.145, 0.004, 36), C.record, [0, deckY + 0.017, 0]);
  for (const r of [0.06, 0.075, 0.092, 0.108, 0.124, 0.138]) {
    mesh(new THREE.TorusGeometry(r, 0.0011, 3, 48), C.groove, [0, recTop, 0], [Math.PI / 2, 0, 0]);
  }
  mesh(cyl(0.045, 0.045, 0.001, 24), C.label, [0, recTop + 0.0005, 0]);
  mesh(new THREE.TorusGeometry(0.039, 0.0015, 3, 32), C.cream, [0, recTop + 0.001, 0], [Math.PI / 2, 0, 0]);
  mesh(new THREE.TorusGeometry(0.024, 0.001, 3, 28), C.gold, [0, recTop + 0.001, 0], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    mesh(new THREE.OctahedronGeometry(0.0025), C.gold, [Math.sin(a) * 0.031, recTop + 0.0015, Math.cos(a) * 0.031]);
  }
  mesh(cyl(0.004, 0.004, 0.022, 8), C.brass, [0, recTop + 0.008, 0]);
  mesh(new THREE.SphereGeometry(0.004, 6, 4), C.brass, [0, recTop + 0.019, 0]);

  // ---------- tonearm post ----------
  const postZ = -0.15;
  mesh(cyl(0.03, 0.036, 0.012, 12), C.brass, [0, deckY + 0.006, postZ]);
  mesh(new THREE.TorusGeometry(0.033, 0.003, 4, 16), C.gold, [0, deckY + 0.012, postZ], [Math.PI / 2, 0, 0]);
  mesh(cyl(0.014, 0.017, 0.06, 10), C.brass, [0, deckY + 0.042, postZ]);
  mesh(cyl(0.022, 0.022, 0.016, 12), C.gold, [0, 0.25, postZ]);

  // tonearm (swan neck to soundbox)
  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.25, postZ),
    new THREE.Vector3(0, 0.258, -0.1),
    new THREE.Vector3(-0.03, 0.247, -0.03),
    new THREE.Vector3(-0.05, 0.236, 0.035),
  ]);
  mesh(new THREE.TubeGeometry(armCurve, 16, 0.009, 8, false), C.brass, [0, 0, 0]);
  mesh(new THREE.TorusGeometry(0.0105, 0.003, 4, 10), C.gold, [-0.0, 0.258, -0.1], [0, 0, 0]);

  // soundbox
  const sb: [number, number, number] = [-0.05, 0.232, 0.062];
  mesh(cyl(0.034, 0.034, 0.018, 18), C.brass, sb, [0, 0, Math.PI / 2]);
  mesh(new THREE.TorusGeometry(0.034, 0.003, 4, 18), C.gold, [sb[0] - 0.009, sb[1], sb[2]], [0, Math.PI / 2, 0]);
  mesh(cyl(0.026, 0.026, 0.002, 18), C.cream, [sb[0] - 0.0095, sb[1], sb[2]], [0, 0, Math.PI / 2]);
  mesh(cyl(0.008, 0.008, 0.004, 10), C.brass, [sb[0] - 0.011, sb[1], sb[2]], [0, 0, Math.PI / 2]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    mesh(new THREE.SphereGeometry(0.0022, 5, 3), C.gold, [sb[0] - 0.0105, sb[1] + Math.sin(a) * 0.03, sb[2] + Math.cos(a) * 0.03]);
  }
  // needle bar + needle (tip resting on the record)
  mesh(box(0.006, 0.03, 0.006), C.brass, [sb[0], sb[1] - 0.035, sb[2] + 0.004]);
  mesh(new THREE.ConeGeometry(0.0022, 0.016, 4), C.groove, [sb[0], recTop + 0.008, sb[2] + 0.004], [Math.PI, 0, 0]);

  // ---------- horn ----------
  // gooseneck from pivot into horn throat
  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.25, postZ),
    new THREE.Vector3(0, 0.31, -0.17),
    new THREE.Vector3(0, 0.355, -0.16),
    new THREE.Vector3(0, 0.38, -0.12),
  ]);
  mesh(new THREE.TubeGeometry(neckCurve, 16, 0.019, 10, false), C.brass, [0, 0, 0]);
  mesh(new THREE.TorusGeometry(0.021, 0.004, 4, 12), C.gold, [0, 0.31, -0.17], [Math.PI / 2 - 0.3, 0, 0]);

  const theta = 1.1; // tilts lathe +Y to (0, cos, sin) = up and forward
  const horn = new THREE.Group();
  horn.position.set(0, 0.372, -0.133);
  horn.rotation.x = theta;
  root.add(horn);

  const L = 0.55;
  const N = 12;
  const prof: THREE.Vector2[] = [];
  const rAt = (t: number) => 0.022 + 0.24 * Math.pow(t, 2.8);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    prof.push(new THREE.Vector2(rAt(t), t * L));
  }
  prof.push(new THREE.Vector2(rAt(1) + 0.014, L + 0.006)); // flared lip

  const petals = 10;
  const step = (Math.PI * 2) / petals;
  for (let p = 0; p < petals; p++) {
    const phi0 = p * step;
    const color = p % 2 === 0 ? C.hornRed : C.hornGold;
    mesh(new THREE.LatheGeometry(prof, 3, phi0, step), color, [0, 0, 0], [0, 0, 0], horn, true);

    // gilded seam rib along the petal boundary
    const seamPts = prof.map(
      (v) => new THREE.Vector3((v.x + 0.002) * Math.sin(phi0), v.y, (v.x + 0.002) * Math.cos(phi0))
    );
    mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seamPts), 14, 0.0032, 4, false),
      C.gold,
      [0, 0, 0],
      [0, 0, 0],
      horn
    );

    // ornament on each burgundy petal: a gold diamond and two small studs
    if (p % 2 === 0) {
      const pc = phi0 + step / 2;
      for (const [t, s] of [
        [0.72, 0.012],
        [0.55, 0.006],
        [0.88, 0.007],
      ] as [number, number][]) {
        const r = rAt(t) + 0.004;
        const d = mesh(new THREE.OctahedronGeometry(s), C.gold, [r * Math.sin(pc), t * L, r * Math.cos(pc)], [0, pc, 0], horn);
        d.scale.set(1, 1.6, 0.5);
      }
    }
  }
  // rolled rim and throat collars
  mesh(new THREE.TorusGeometry(rAt(1) + 0.014, 0.008, 6, 40), C.brass, [0, L + 0.006, 0], [Math.PI / 2, 0, 0], horn);
  mesh(new THREE.TorusGeometry(0.024, 0.005, 5, 14), C.gold, [0, 0.01, 0], [Math.PI / 2, 0, 0], horn);
  mesh(new THREE.TorusGeometry(rAt(0.35) + 0.002, 0.004, 5, 18), C.brass, [0, 0.35 * L, 0], [Math.PI / 2, 0, 0], horn);

  return root;
}
