import * as THREE from "three";

export const meta = {
  name: "Garden Snail",
  description: "A stylized low-poly garden snail with a spiral striped shell, stalk eyes, and a textured foot, built from primitives.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rand = rng(7);

  const mat = (c: number, rough = 0.7) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: rough, flatShading: true });

  const bodyMat = mat(0xc9b27a);
  const bodyDark = mat(0xa8925c);
  const footMat = mat(0xdcc891);
  const shellMat = mat(0xb5562b, 0.55);
  const shellStripe = mat(0xe8b66a, 0.55);
  const shellDark = mat(0x7a3318, 0.55);
  const eyeMat = mat(0x111111, 0.3);
  const white = mat(0xffffff, 0.3);
  const slime = new THREE.MeshStandardMaterial({
    color: 0xe9f3d0, roughness: 0.2, transparent: true, opacity: 0.45, flatShading: true,
  });

  const add = (m: THREE.Mesh, p: [number, number, number], parent: THREE.Object3D = root) => {
    m.position.set(...p);
    parent.add(m);
    return m;
  };

  // slime trail
  const trail = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.5, 8), slime);
  trail.rotation.x = Math.PI / 2;
  trail.scale.set(1, 1, 0.02);
  trail.rotation.x = Math.PI / 2;
  add(trail, [0, 0.002, -0.28]);
  trail.scale.set(1, 1, 0.02);

  // foot: chain of squashed spheres tapering to the tail
  const footSegs = 9;
  for (let i = 0; i < footSegs; i++) {
    const t = i / (footSegs - 1);
    const z = 0.2 - t * 0.5 + 0.0;
    const r = 0.05 * (1 - t * 0.7) + 0.012;
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), i % 2 ? footMat : footMat);
    m.scale.set(r * 1.1, r, 0.07);
    add(m, [0, r * 0.95, z]);
  }
  // foot base sole
  const sole = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.012, 0.52), footMat);
  add(sole, [0, 0.006, -0.04]);

  // body (back hump)
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), bodyMat);
  body.scale.set(0.045, 0.05, 0.22);
  add(body, [0, 0.07, -0.02]);

  // neck rising to head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.042, 0.1, 8), bodyMat);
  add(neck, [0, 0.12, 0.2]).rotation.x = -0.5;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), bodyMat);
  head.scale.set(1, 0.9, 1.15);
  add(head, [0, 0.165, 0.245]);

  // mouth bumps
  for (const sx of [-1, 1]) {
    const lip = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 5), bodyDark);
    add(lip, [sx * 0.02, 0.145, 0.282]);
    // short lower tentacles
    const tn = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.008, 0.035, 6), bodyDark);
    tn.rotation.set(1.1, 0, -sx * 0.4);
    add(tn, [sx * 0.03, 0.14, 0.29]);
  }

  // eye stalks
  for (const sx of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(sx * 0.02, 0.195, 0.255);
    g.rotation.set(0.35, 0, -sx * 0.3);
    root.add(g);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.12, 6), bodyDark);
    add(st, [0, 0.06, 0], g);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), bodyDark);
    add(bulb, [0, 0.125, 0], g);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 5), eyeMat);
    add(eye, [0, 0.13, 0.011], g);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.003, 4, 4), white);
    add(gl, [0.003, 0.134, 0.018], g);
  }

  // shell: spiral of growing torus-like rings (side-facing coil along X axis)
  const shell = new THREE.Group();
  shell.position.set(0, 0.13, -0.06);
  shell.rotation.y = 0; // coil axis along X
  root.add(shell);

  const turns = 2.6;
  const n = 46;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const ang = t * turns * Math.PI * 2;
    const R = 0.012 + (1 - t) * 0.1; // spiral radius, outer at t=0
    const outer = 1 - t;
    const tube = 0.03 + outer * 0.055;
    const stripe = i % 6 < 3;
    const m = new THREE.Mesh(
      new THREE.IcosahedronGeometry(tube, 1),
      outer < 0.12 ? shellDark : stripe ? shellMat : shellStripe
    );
    const wob = 0.96 + rand() * 0.08;
    m.scale.set(1.0 * wob, 1, 1);
    // spiral in the YZ plane, widening toward side (x) as it nears the opening
    add(m, [(outer - 0.5) * 0.06, Math.sin(ang) * R * 1.0, Math.cos(ang) * R * 1.0], shell);
  }
  // shell core cap spirals
  const cap = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), shellDark);
  add(cap, [0.04, 0.0, 0], shell);
  const cap2 = cap.clone();
  add(cap2, [-0.04, 0, 0], shell);
  cap2.position.set(-0.045, 0, 0);

  // shell rim near body connecting
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.015, 5, 14), shellStripe);
  rim.rotation.y = Math.PI / 2;
  add(rim, [0, 0.0, 0], shell);

  // shell base glued to back
  const saddle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.05, 10), bodyDark);
  saddle.scale.set(1, 1, 1.3);
  add(saddle, [0, -0.06, 0.0], shell);

  // lift shell so it sits on body
  shell.position.y = 0.19;

  // speckles on body
  for (let i = 0; i < 14; i++) {
    const sp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.006, 0), bodyDark);
    const side = rand() < 0.5 ? -1 : 1;
    add(sp, [side * 0.04, 0.07 + rand() * 0.03, -0.2 + rand() * 0.35]);
  }

  // tail tip
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.1, 6), footMat);
  tail.rotation.x = -Math.PI / 2;
  add(tail, [0, 0.025, -0.34]);

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  return root;
}
