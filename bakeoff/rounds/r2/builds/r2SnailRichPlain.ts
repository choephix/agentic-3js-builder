import * as THREE from "three";

export const meta = {
  name: "Adventure Snail",
  description: "Garden snail with a striped spiral shell, pebbly slimy body, eye stalks, and a ladybird passenger.",
};

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rand = rng(7);

  // Pebbly body texture
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8fa77f";
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 260; i++) {
    const x = rand() * 128, y = rand() * 128, r = 2 + rand() * 4;
    g.fillStyle = rand() > 0.5 ? "#7d9670" : "#a3b992";
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const skin = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25, metalness: 0.05, flatShading: true });
  const skinDark = new THREE.MeshStandardMaterial({ color: 0x6f8a63, roughness: 0.3, flatShading: true });
  const caramel = new THREE.MeshStandardMaterial({ color: 0xc98a3c, roughness: 0.15, metalness: 0.1, flatShading: true });
  const choc = new THREE.MeshStandardMaterial({ color: 0x5a3219, roughness: 0.15, metalness: 0.1, flatShading: true });
  const cream = new THREE.MeshStandardMaterial({ color: 0xf3e3bd, roughness: 0.15, metalness: 0.1, flatShading: true });
  const black = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.2 });
  const red = new THREE.MeshStandardMaterial({ color: 0xd8201c, roughness: 0.2, flatShading: true });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, p: number[], parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    parent.add(m);
    return m;
  };

  // Body: foot made of overlapping spheres along z (head at +z)
  const foot = add(new THREE.SphereGeometry(1, 8, 6), skin, [0, 0.09, -0.02]);
  foot.scale.set(0.2, 0.1, 0.62);
  // foot sole
  const sole = add(new THREE.SphereGeometry(1, 8, 4), skinDark, [0, 0.025, 0]);
  sole.scale.set(0.23, 0.05, 0.66);
  // raised back body
  const back = add(new THREE.SphereGeometry(1, 8, 6), skin, [0, 0.17, -0.15]);
  back.scale.set(0.17, 0.12, 0.38);
  // neck rising to head
  const neck = add(new THREE.SphereGeometry(1, 8, 6), skin, [0, 0.22, 0.4]);
  neck.scale.set(0.14, 0.15, 0.22);
  const head = add(new THREE.SphereGeometry(1, 8, 6), skin, [0, 0.27, 0.57]);
  head.scale.set(0.13, 0.12, 0.13);
  // tail tip
  const tail = add(new THREE.ConeGeometry(0.17, 0.4, 7), skin, [0, 0.1, -0.75]);
  tail.rotation.x = -Math.PI / 2 - 0.1;
  tail.scale.set(1, 1, 0.55);
  // mouth bumps
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.035, 6, 5), skinDark, [s * 0.05, 0.19, 0.68]);

  // Eye stalks
  for (const s of [-1, 1]) {
    const grp = new THREE.Group();
    grp.position.set(s * 0.05, 0.32, 0.6);
    grp.rotation.set(0.35, 0, -s * 0.35);
    root.add(grp);
    add(new THREE.CylinderGeometry(0.018, 0.03, 0.36, 6), skin, [0, 0.18, 0], grp);
    add(new THREE.SphereGeometry(0.04, 6, 5), skinDark, [0, 0.37, 0], grp);
    const eye = add(new THREE.SphereGeometry(0.022, 6, 5), black, [0, 0.385, 0.025], grp);
    eye.scale.set(1, 1, 1);
    add(new THREE.SphereGeometry(0.007, 4, 3), white, [s * 0.006, 0.395, 0.043], grp);

    // short feelers
    const f = new THREE.Group();
    f.position.set(s * 0.06, 0.2, 0.67);
    f.rotation.set(0.9, 0, -s * 0.35);
    root.add(f);
    add(new THREE.CylinderGeometry(0.012, 0.02, 0.14, 5), skin, [0, 0.07, 0], f);
    add(new THREE.SphereGeometry(0.019, 5, 4), skinDark, [0, 0.145, 0], f);
  }

  // Shell: spiral of growing tori-like segments
  const shell = new THREE.Group();
  shell.position.set(0, 0.3, -0.15);
  shell.rotation.set(0, 0, 0);
  root.add(shell);
  const mats = [caramel, choc, cream, choc];
  const turns = 3.2;
  const steps = 64;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const ang = t * turns * Math.PI * 2;
    const R = 0.34 * (1 - t * 0.8);
    const r = 0.08 + t * 0.0 + (1 - t) * 0.0 + 0.2 * (1 - Math.pow(1 - t, 1.0)) * 0.0;
    // tube grows outward: later (outer) segments larger
    const size = 0.07 + 0.2 * t;
    const rad = 0.06 + 0.36 * (1 - t) * 0 + 0;
    void r; void rad;
    // spiral in xy plane (axis along x), outer ring is largest
    const rr = 0.07 + 0.3 * t;
    const x = 0;
    const sr = 0.08 + 0.28 * t;
    const y = Math.sin(ang) * (0.1 + 0.2 * t);
    const z = Math.cos(ang) * (0.1 + 0.2 * t);
    void R; void size; void rr; void sr;
    const m = add(new THREE.IcosahedronGeometry(0.1 + 0.14 * t, 0), mats[i % 4], [0, 0, 0], shell);
    // axis along x, spiral axis lateral; shift sideways slightly so coils sit on body
    m.position.set((0.5 - t) * 0.0 + Math.sin(t * 3) * 0, y, z);
    m.position.x = (0.5 - t) * 0.0;
    m.scale.set(1.15, 1, 1);
  }
  // Cap mouth side: big final lip and apex
  const apex = add(new THREE.ConeGeometry(0.1, 0.18, 6), caramel, [0, 0.0, 0], shell);
  apex.rotation.z = Math.PI / 2;
  apex.position.x = 0.2;
  apex.scale.set(1, 1, 1);
  const apex2 = apex.clone();
  apex2.position.x = -0.2;
  apex2.rotation.z = -Math.PI / 2;
  shell.add(apex2);
  // overall shell tilt back
  shell.rotation.x = -0.15;
  // shell pivot to sit on back: scale to a snail-sized shell
  shell.scale.setScalar(1.0);
  shell.position.set(0, 0.42, -0.18);

  // Ladybird on top
  const bug = new THREE.Group();
  bug.position.set(0.0, 0.76, -0.12);
  bug.rotation.y = 0.6;
  root.add(bug);
  const dome = add(new THREE.SphereGeometry(0.05, 8, 6), red, [0, 0, 0], bug);
  dome.scale.set(1, 0.7, 1.2);
  add(new THREE.SphereGeometry(0.028, 6, 5), black, [0, 0.0, 0.06], bug);
  for (const [x, z] of [[-0.025, -0.01], [0.025, -0.01], [-0.02, -0.05], [0.02, -0.05]]) {
    add(new THREE.SphereGeometry(0.01, 4, 3), black, [x, 0.03, z], bug);
  }
  add(new THREE.BoxGeometry(0.003, 0.07, 0.11), black, [0, 0.005, -0.005], bug).scale.set(1, 0.6, 1);
  for (const s of [-1, 1]) {
    for (const z of [-0.025, 0.01, 0.04]) {
      add(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 4), black, [s * 0.05, -0.015, z], bug).rotation.z = s * 0.9;
    }
    const a = add(new THREE.CylinderGeometry(0.002, 0.002, 0.05, 3), black, [s * 0.015, 0.02, 0.095], bug);
    a.rotation.x = 1.0;
  }

  return root;
}
