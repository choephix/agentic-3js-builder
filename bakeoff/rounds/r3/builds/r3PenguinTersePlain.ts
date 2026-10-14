import * as THREE from "three";

export const meta = {
  name: "Emperor Penguin",
  description: "A stylized low-poly emperor penguin built from primitives, with a gradient neck patch, flippers, feet and a tiny chick-gray beak stripe.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();

  const mat = (c: number, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
  const black = mat(0x1b1f27);
  const white = mat(0xf4f1ea);
  const orange = mat(0xf08a24, 0.6);
  const yellow = mat(0xffc938, 0.6);
  const beakM = mat(0x2b2b2b, 0.5);
  const eyeW = mat(0xffffff, 0.3);
  const eyeB = mat(0x050505, 0.2);
  const pink = mat(0xe9a06a, 0.6);

  // Gradient texture for neck patch
  const cv = document.createElement("canvas");
  cv.width = 8; cv.height = 64;
  const g = cv.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, "#ffc938");
  gr.addColorStop(0.5, "#ffe08a");
  gr.addColorStop(1, "#f4f1ea");
  g.fillStyle = gr; g.fillRect(0, 0, 8, 64);
  const tex = new THREE.CanvasTexture(cv);
  const patchM = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, flatShading: true });

  const add = (geo: THREE.BufferGeometry, m: THREE.Material, p: [number, number, number], s: [number, number, number] = [1, 1, 1], r: [number, number, number] = [0, 0, 0], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(...p); me.scale.set(...s); me.rotation.set(...r);
    parent.add(me);
    return me;
  };

  const sph = new THREE.SphereGeometry(1, 12, 9);

  // Feet
  for (const sx of [-1, 1]) {
    const foot = new THREE.Group();
    foot.position.set(sx * 0.1, 0.0, 0.07);
    root.add(foot);
    add(new THREE.BoxGeometry(0.13, 0.04, 0.2), orange, [0, 0.02, 0.05], [1, 1, 1], [0, 0, 0], foot);
    for (let i = -1; i <= 1; i++) {
      add(new THREE.BoxGeometry(0.04, 0.035, 0.08), orange, [i * 0.045, 0.018, 0.18], [1, 1, 1], [0, i * 0.25, 0], foot);
    }
  }

  // Tail
  add(new THREE.ConeGeometry(0.08, 0.2, 5), black, [0, 0.1, -0.2], [1, 1, 0.5], [-Math.PI / 2 - 0.3, 0, 0]);

  // Body (black back)
  add(sph, black, [0, 0.42, -0.01], [0.22, 0.38, 0.2]);
  // Belly (white)
  add(sph, white, [0, 0.4, 0.045], [0.18, 0.33, 0.16]);
  // Neck patch
  add(new THREE.CylinderGeometry(0.07, 0.11, 0.14, 8), patchM, [0, 0.76, 0.05], [1, 1, 0.8]);

  // Head
  add(sph, black, [0, 0.88, 0.02], [0.115, 0.125, 0.12]);
  // Cheek patches
  for (const sx of [-1, 1]) {
    add(sph, yellow, [sx * 0.085, 0.84, 0.04], [0.035, 0.06, 0.04], [0, 0, sx * 0.2]);
    add(sph, eyeW, [sx * 0.075, 0.915, 0.115], [0.022, 0.022, 0.015]);
    add(sph, eyeB, [sx * 0.077, 0.915, 0.128], [0.012, 0.012, 0.01]);
  }

  // Beak
  add(new THREE.ConeGeometry(0.03, 0.17, 5), beakM, [0, 0.87, 0.17], [1, 1, 0.7], [Math.PI / 2 + 0.12, 0, 0]);
  add(new THREE.ConeGeometry(0.014, 0.12, 4), pink, [0, 0.853, 0.165], [1, 1, 0.5], [Math.PI / 2 + 0.2, 0, 0]);

  // Flippers
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.2, 0.65, 0);
    pivot.rotation.z = sx * 0.55;
    root.add(pivot);
    add(sph, black, [0, -0.15, 0], [0.04, 0.2, 0.09], [0, 0, 0], pivot);
    add(sph, white, [sx * -0.012, -0.15, 0.02], [0.015, 0.17, 0.06], [0, 0, 0], pivot);
  }

  // Scale: emperor ~1.0 m tall, already ~1.0
  root.traverse(o => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true; });
  return root;
}
