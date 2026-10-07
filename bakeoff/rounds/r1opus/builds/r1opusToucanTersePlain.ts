import * as THREE from "three";

export const meta = {
  name: "Keel-Billed Toucan",
  description:
    "A stylized low-poly keel-billed toucan perched on a mossy jungle log, with a rainbow banana bill, lime eye mask, yellow bib and a cluster of red berries.",
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
  const rand = rng(1337);

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const mat = (hex: number, rough = 0.6, metal = 0, map?: THREE.Texture) => {
    const key = hex + "_" + rough + "_" + (map ? "m" : "");
    if (!mats[key]) {
      mats[key] = new THREE.MeshStandardMaterial({
        color: hex,
        roughness: rough,
        metalness: metal,
        flatShading: true,
        map: map ?? null,
      });
    }
    return mats[key];
  };

  const add = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    p: [number, number, number] = [0, 0, 0],
    r: [number, number, number] = [0, 0, 0],
    s: [number, number, number] = [1, 1, 1]
  ) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(...p);
    mesh.rotation.set(...r);
    mesh.scale.set(...s);
    parent.add(mesh);
    return mesh;
  };

  // ---------- palette ----------
  const black = mat(0x16161c, 0.55);
  const charcoal = mat(0x2a2b36, 0.5);
  const sheen = mat(0x1d2440, 0.4, 0.15);
  const yellow = mat(0xffd21f, 0.55);
  const red = mat(0xe8242a, 0.5);
  const lime = mat(0x9be22d, 0.5);
  const billGreen = mat(0x6cc63a, 0.35);
  const billOrange = mat(0xff8a1a, 0.35);
  const billRed = mat(0xe6322b, 0.35);
  const billBlue = mat(0x3a8fe0, 0.35);
  const eyeBlack = mat(0x050505, 0.2);
  const white = mat(0xffffff, 0.2);
  const feet = mat(0x6c8fbf, 0.6);
  const claw = mat(0x2b2b33, 0.4);
  const leafDark = mat(0x2f8a3e, 0.6);
  const leafLight = mat(0x5bbf4a, 0.6);
  const moss = mat(0x7da83a, 0.9);
  const berry = mat(0xc9183c, 0.3);
  const stem = mat(0x5a3b1c, 0.8);
  const woodEnd = mat(0xd9b07a, 0.85);

  // bark texture
  const cv = document.createElement("canvas");
  cv.width = 128;
  cv.height = 128;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#6b4426";
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = rand() > 0.5 ? "#4e3018" : "#80583a";
    const x = rand() * 128;
    ctx.fillRect(x, 0, 1 + rand() * 4, 128);
  }
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = "#3e2512";
    ctx.fillRect(rand() * 128, rand() * 128, 2 + rand() * 6, 2);
  }
  const barkTex = new THREE.CanvasTexture(cv);
  barkTex.colorSpace = THREE.SRGBColorSpace;
  barkTex.wrapS = barkTex.wrapT = THREE.RepeatWrapping;
  barkTex.repeat.set(2, 1);
  const bark = mat(0xffffff, 0.9, 0, barkTex);

  // ---------- log perch ----------
  const logR = 0.07;
  const logL = 0.56;
  add(root, new THREE.CylinderGeometry(logR, logR * 1.05, logL, 9, 1), bark, [0, logR, 0], [0, 0, Math.PI / 2]);
  // end caps with rings
  for (const sx of [-1, 1]) {
    add(root, new THREE.CylinderGeometry(logR * 0.92, logR * 0.92, 0.006, 9), woodEnd, [sx * (logL / 2 + 0.002), logR, 0], [0, 0, Math.PI / 2]);
    add(root, new THREE.CylinderGeometry(logR * 0.55, logR * 0.55, 0.008, 9), stem, [sx * (logL / 2 + 0.003), logR, 0], [0, 0, Math.PI / 2]);
    add(root, new THREE.CylinderGeometry(logR * 0.4, logR * 0.4, 0.01, 9), woodEnd, [sx * (logL / 2 + 0.004), logR, 0], [0, 0, Math.PI / 2]);
  }
  // moss bumps
  for (let i = 0; i < 9; i++) {
    const x = (rand() - 0.5) * logL * 0.85;
    const a = (rand() - 0.5) * 1.6;
    const r = 0.015 + rand() * 0.02;
    add(root, new THREE.IcosahedronGeometry(r, 0), moss,
      [x, logR + Math.cos(a) * logR * 0.95, Math.sin(a) * logR * 0.95], [rand(), rand(), rand()], [1.4, 0.6, 1.2]);
  }

  // leaves
  const leafGeo = new THREE.SphereGeometry(1, 6, 3);
  const leaf = (parent: THREE.Object3D, p: [number, number, number], yaw: number, pitch: number, len: number, m: THREE.Material) => {
    const g = new THREE.Group();
    g.position.set(...p);
    g.rotation.set(0, yaw, 0);
    parent.add(g);
    const inner = new THREE.Group();
    inner.rotation.x = pitch;
    g.add(inner);
    add(inner, leafGeo, m, [0, 0, len / 2], [0, 0, 0], [len * 0.32, 0.004, len / 2]);
    add(inner, new THREE.BoxGeometry(0.003, 0.003, len * 0.9), stem, [0, 0.003, len * 0.45]);
  };

  // side branch stub on +X with leaves and berries
  const stub = new THREE.Group();
  stub.position.set(0.19, logR + 0.05, 0);
  stub.rotation.set(0, 0, -0.5);
  root.add(stub);
  add(stub, new THREE.CylinderGeometry(0.018, 0.026, 0.16, 6), bark, [0, 0.06, 0]);
  const stubTop = new THREE.Group();
  stubTop.position.set(0, 0.14, 0);
  stub.add(stubTop);
  for (let i = 0; i < 5; i++) {
    leaf(stubTop, [0, 0, 0], (i / 5) * Math.PI * 2 + 0.3, -0.5 - rand() * 0.4, 0.1 + rand() * 0.04, i % 2 ? leafDark : leafLight);
  }
  // berries
  for (let i = 0; i < 6; i++) {
    const a = i * 1.1;
    add(stubTop, new THREE.IcosahedronGeometry(0.013, 0), berry,
      [Math.cos(a) * 0.018, -0.01 - (i % 3) * 0.012, Math.sin(a) * 0.018]);
  }
  // leaves sprouting along the log
  const leafSpots: [number, number][] = [[-0.22, 0.4], [-0.16, -0.5], [0.12, 2.6], [-0.05, 3.5], [0.24, -2.2]];
  leafSpots.forEach(([x, yaw], i) => {
    leaf(root, [x, logR * 1.85, (rand() - 0.5) * 0.04], yaw, 0.2 + rand() * 0.25, 0.09 + rand() * 0.04, i % 2 ? leafLight : leafDark);
  });

  // ---------- toucan ----------
  const bird = new THREE.Group();
  root.add(bird);

  // body
  add(bird, new THREE.SphereGeometry(0.1, 9, 7), black, [0, 0.29, -0.015], [-0.22, 0, 0], [0.85, 1.25, 0.95]);
  // back sheen plates
  add(bird, new THREE.SphereGeometry(0.09, 8, 6), sheen, [0, 0.32, -0.04], [-0.3, 0, 0], [0.75, 1.0, 0.8]);

  // red border & yellow bib
  add(bird, new THREE.SphereGeometry(0.075, 8, 6), red, [0, 0.355, 0.045], [0.2, 0, 0], [0.88, 1.0, 0.55]);
  add(bird, new THREE.SphereGeometry(0.075, 8, 6), yellow, [0, 0.385, 0.058], [0.2, 0, 0], [0.86, 0.95, 0.55]);

  // red undertail coverts
  add(bird, new THREE.IcosahedronGeometry(0.035, 0), red, [0, 0.2, -0.055], [0.3, 0.2, 0], [1, 0.8, 1.1]);

  // head
  const head = new THREE.Group();
  head.position.set(0, 0.44, 0.025);
  bird.add(head);
  add(head, new THREE.SphereGeometry(0.068, 9, 7), black, [0, 0, 0], [0, 0, 0], [0.95, 1, 1.05]);
  // yellow cheeks blending into bib
  for (const sx of [-1, 1]) {
    add(head, new THREE.SphereGeometry(0.04, 7, 5), yellow, [sx * 0.035, -0.03, 0.035], [0, 0, 0], [0.8, 1, 0.9]);
  }
  // eye mask, eye, highlight
  for (const sx of [-1, 1]) {
    add(head, new THREE.SphereGeometry(0.03, 8, 6), lime, [sx * 0.058, 0.008, 0.03], [0, 0, 0], [0.35, 0.95, 1.2]);
    add(head, new THREE.SphereGeometry(0.0125, 7, 5), eyeBlack, [sx * 0.067, 0.01, 0.034]);
    add(head, new THREE.SphereGeometry(0.0035, 4, 3), white, [sx * 0.077, 0.015, 0.039]);
  }

  // bill: chain of bending segments
  const bill = new THREE.Group();
  bill.position.set(0, 0.0, 0.05);
  bill.rotation.x = -0.05;
  head.add(bill);
  const segs: { L: number; r0: number; r1: number; m: THREE.Material; blue: boolean }[] = [
    { L: 0.05, r0: 0.046, r1: 0.041, m: billGreen, blue: true },
    { L: 0.06, r0: 0.041, r1: 0.032, m: billOrange, blue: true },
    { L: 0.05, r0: 0.032, r1: 0.019, m: billRed, blue: false },
    { L: 0.028, r0: 0.019, r1: 0.002, m: billRed, blue: false },
  ];
  let parent: THREE.Object3D = bill;
  segs.forEach((sg, i) => {
    const g = new THREE.Group();
    g.rotation.x = i === 0 ? 0 : 0.11;
    parent.add(g);
    const geo = new THREE.CylinderGeometry(sg.r1, sg.r0, sg.L, 6, 1);
    geo.rotateX(Math.PI / 2);
    add(g, geo, sg.m, [0, 0, sg.L / 2], [0, 0, 0], [0.48, 1, 1]);
    // culmen ridge
    add(g, new THREE.BoxGeometry(0.006, 0.006, sg.L * 1.02), i < 2 ? billGreen : billRed,
      [0, (sg.r0 + sg.r1) / 2 * 0.98, sg.L / 2], [Math.atan2(sg.r0 - sg.r1, sg.L), 0, 0]);
    if (sg.blue) {
      add(g, new THREE.BoxGeometry(0.03, 0.02, sg.L * 0.98), billBlue,
        [0, -(sg.r0 + sg.r1) / 2 * 0.62, sg.L / 2], [-Math.atan2(sg.r0 - sg.r1, sg.L) * 0.6, 0, 0]);
    }
    // cutting edge line
    for (const sx of [-1, 1]) {
      add(g, new THREE.BoxGeometry(0.003, 0.004, sg.L), eyeBlack,
        [sx * (sg.r0 + sg.r1) / 2 * 0.4, -(sg.r0 + sg.r1) / 2 * 0.25, sg.L / 2]);
    }
    const next = new THREE.Group();
    next.position.z = sg.L;
    g.add(next);
    parent = next;
  });
  // black tip cap
  add(parent, new THREE.IcosahedronGeometry(0.006, 0), eyeBlack, [0, -0.002, -0.004]);
  // black band where bill meets face
  add(bill, new THREE.CylinderGeometry(0.048, 0.048, 0.008, 6).rotateX(Math.PI / 2), black, [0, 0, 0.002], [0, 0, 0], [0.5, 1, 1]);
  // nostrils
  for (const sx of [-1, 1]) {
    add(bill, new THREE.SphereGeometry(0.004, 4, 3), eyeBlack, [sx * 0.012, 0.035, 0.012]);
  }

  // wings
  for (const sx of [-1, 1]) {
    const w = new THREE.Group();
    w.position.set(sx * 0.072, 0.3, -0.03);
    w.rotation.set(-0.25, sx * 0.08, 0);
    bird.add(w);
    add(w, new THREE.SphereGeometry(0.1, 8, 6), black, [0, 0, 0], [0, 0, 0], [0.28, 1.05, 0.85]);
    // covert rows
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < 3; k++) {
        add(w, new THREE.SphereGeometry(0.022, 5, 3), row % 2 ? charcoal : sheen,
          [sx * 0.022, 0.06 - row * 0.03, 0.04 - k * 0.03], [0.3, 0, 0], [0.3, 0.7, 1.1]);
      }
    }
    // primaries
    for (let k = 0; k < 4; k++) {
      add(w, new THREE.BoxGeometry(0.008, 0.11 - k * 0.012, 0.026), k % 2 ? charcoal : black,
        [sx * (0.012 - k * 0.003), -0.1 + k * 0.006, -0.02 - k * 0.018], [0.35 + k * 0.05, 0, 0]);
    }
  }

  // tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.22, -0.085);
  tail.rotation.x = -0.38;
  bird.add(tail);
  for (let k = -2; k <= 2; k++) {
    const len = 0.19 - Math.abs(k) * 0.012;
    const f = add(tail, new THREE.BoxGeometry(0.03, len, 0.008), Math.abs(k) % 2 ? charcoal : black,
      [k * 0.016, -len / 2, -Math.abs(k) * 0.002], [0, 0, k * 0.06]);
    f.position.x += k * 0.006;
    add(tail, new THREE.BoxGeometry(0.004, len * 0.95, 0.01), sheen, [k * 0.022, -len / 2, 0.001], [0, 0, k * 0.06]);
  }

  // legs & feet
  const footY = logR * 2 + 0.006;
  for (const sx of [-1, 1]) {
    const x = sx * 0.035;
    add(bird, new THREE.CylinderGeometry(0.011, 0.013, 0.05, 6), feet, [x, footY + 0.025, 0.005]);
    const foot = new THREE.Group();
    foot.position.set(x, footY, 0.005);
    bird.add(foot);
    const toes: [number, number][] = [[0.15 * sx, 0], [-0.15 * sx, 0], [Math.PI + 0.2 * sx, 0], [Math.PI - 0.2 * sx, 0]];
    toes.forEach(([yaw]) => {
      const tg = new THREE.Group();
      tg.rotation.y = yaw;
      foot.add(tg);
      const t1 = new THREE.Group();
      t1.rotation.x = 0.35;
      tg.add(t1);
      add(t1, new THREE.BoxGeometry(0.009, 0.008, 0.035), feet, [0, 0, 0.017]);
      const t2 = new THREE.Group();
      t2.position.z = 0.034;
      t2.rotation.x = 0.7;
      t1.add(t2);
      add(t2, new THREE.BoxGeometry(0.008, 0.007, 0.02), feet, [0, 0, 0.01]);
      const c = new THREE.ConeGeometry(0.004, 0.012, 4);
      c.rotateX(Math.PI / 2);
      add(t2, c, claw, [0, -0.002, 0.024], [0.6, 0, 0]);
    });
  }

  return root;
}
