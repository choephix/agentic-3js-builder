import * as THREE from "three";
import { type Builder, createBuilder, frame } from "../../../../src/index";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // head
  (() => {
function buildHead(b: Builder) {
  const head = "head";
  const jaw = "jaw";
  const FUR = "#9a6a3c";
  const FURD = "#7a4f2a";
  const PAD = "#3a2a22";
  const DARK = "#120c0a";
  const WHITE = "#ffffff";
  const INNER = "#c98a6a";
  const TUFT = "#b88050";
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // skull and muzzle block
  b.part(sph(1, 10, 8), FUR, { bone: head, at: [0, 0.78, 0.66], scale: [0.17, 0.15, 0.18] });
  b.part(new THREE.BoxGeometry(0.28, 0.2, 0.22), FUR, { bone: head, at: [0, 0.69, 0.84] });
  b.part(new THREE.BoxGeometry(0.3, 0.16, 0.06), PAD, { bone: head, at: [0, 0.7, 0.955] });

  // lower jaw
  b.part(new THREE.BoxGeometry(0.24, 0.07, 0.2), FURD, { bone: jaw, at: [0, 0.58, 0.84] });

  // nostrils
  for (const s of [1, -1]) {
    b.part(sph(0.018, 6, 4), DARK, { bone: head, at: [s * 0.07, 0.74, 0.985], scale: [1, 0.8, 0.5] });
  }
  // mouth line
  b.part(new THREE.BoxGeometry(0.2, 0.008, 0.01), DARK, { bone: head, at: [0, 0.625, 0.96] });
  b.part(new THREE.BoxGeometry(0.008, 0.05, 0.01), DARK, { bone: head, at: [0, 0.65, 0.96] });

  for (const s of [1, -1]) {
    // eyes
    b.part(sph(0.04, 8, 6), DARK, { bone: head, at: [s * 0.125, 0.82, 0.8] });
    b.part(sph(0.013, 6, 4), WHITE, { bone: head, at: [s * 0.135, 0.835, 0.835] });
    b.part(sph(0.007, 6, 4), WHITE, { bone: head, at: [s * 0.118, 0.805, 0.836] });
    // brows
    b.part(new THREE.BoxGeometry(0.06, 0.012, 0.02), FURD, {
      bone: head, at: [s * 0.125, 0.875, 0.81], rotation: [0, 0, s * -12],
    });
    // ears
    b.part(sph(0.05, 8, 6), FURD, { bone: head, at: [s * 0.15, 0.92, 0.6], scale: [0.6, 1, 1] });
    b.part(sph(0.032, 8, 6), INNER, { bone: head, at: [s * 0.16, 0.92, 0.615], scale: [0.5, 1, 0.8] });
    // whisker dots
    for (let i = 0; i < 3; i++) {
      b.part(sph(0.007, 4, 3), DARK, {
        bone: head, at: [s * (0.1 + i * 0.02), 0.71 + (i % 2) * 0.025, 0.985],
      });
    }
    // cheek tufts
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.ConeGeometry(0.025, 0.07, 5), TUFT, {
        bone: head, at: [s * 0.17, 0.72 - i * 0.03, 0.72], dir: [s, -0.3 - i * 0.2, -0.2],
      });
    }
  }
}
    return buildHead;
  })(),
  // legs
  (() => {
function buildLegs(b: Builder) {
  const FUR = "#8a5a34";
  const FUR_LIGHT = "#a77449";
  const FUR_DARK = "#5e3a20";
  const PAW = "#2e1d12";
  const TOE = "#3d2819";
  const CLAW = "#d9cdb4";

  const legs = [
    { id: "FL", s: 1, z: 0.3, parent: "chest" },
    { id: "FR", s: -1, z: 0.3, parent: "chest" },
    { id: "HL", s: 1, z: -0.3, parent: "hips" },
    { id: "HR", s: -1, z: -0.3, parent: "hips" },
  ];

  for (const L of legs) {
    const x = L.s * 0.18;
    const z = L.z;
    const pts: [number, number, number][] = [
      [x, 0.37, z],
      [x, 0.21, z + 0.015],
      [x, 0.08, z],
    ];
    const chain = b.chain(`legs${L.id}`, pts, {
      parent: L.parent,
      names: [`legsHip${L.id}`, `legsKnee${L.id}`, `legsAnkle${L.id}`],
      role: "leg",
      contact: [x, 0, z + 0.03],
    } as any);
    const ankle = chain.tip ?? chain.joints[chain.joints.length - 1];

    // stout leg tube
    b.sweep(chain, (t: number) => 0.075 - 0.025 * t, { color: FUR, sides: 8 } as any);
    // knee pad
    b.part(new THREE.SphereGeometry(0.06, 7, 5), FUR_LIGHT, {
      at: [x, 0.21, z + 0.045],
      bone: chain.joints[1],
    });
    // fur tufts at leg top
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const tx = x + Math.cos(a) * 0.07;
      const tz = z + Math.sin(a) * 0.07;
      b.part(new THREE.ConeGeometry(0.03, 0.09, 5), i % 2 ? FUR_DARK : FUR_LIGHT, {
        at: [tx, 0.33, tz],
        dir: [Math.cos(a) * 0.4, -1, Math.sin(a) * 0.4],
        bone: chain.joints[0],
      });
    }
    // paw
    b.part(new THREE.SphereGeometry(0.05, 8, 6), PAW, {
      at: [x, 0.04, z + 0.025],
      scale: [1.05, 0.8, 1.35],
      bone: ankle,
    });
    // toes and claws
    for (let k = -1; k <= 1; k++) {
      const tx = x + k * 0.04;
      b.part(new THREE.SphereGeometry(0.022, 6, 4), TOE, {
        at: [tx, 0.022, z + 0.085],
        bone: ankle,
      });
      b.part(new THREE.ConeGeometry(0.011, 0.04, 5), CLAW, {
        at: [tx, 0.02, z + 0.115],
        dir: [0, -0.2, 1],
        bone: ankle,
      });
    }
  }
}
    return buildLegs;
  })(),
  // bird
  (() => {
function buildBird(b: Builder) {
  const BODY = "#5fb3e6";
  const BELLY = "#fff1c9";
  const WING = "#3a86c8";
  const BEAK = "#ff9a2e";
  const BEAK2 = "#e8741a";
  const DARK = "#1b1b24";
  const WHITE = "#ffffff";
  const CREST = "#ffd23f";
  const TAIL = "#2d6aa8";
  const FOOT = "#e8741a";

  const cx = 0, cz = 0.6, base = 0.93;
  const sph = (r: number) => new THREE.SphereGeometry(r, 10, 8);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], extra: any = {}) =>
    b.part(g, c, { bone: "head", at, ...extra });

  // body
  put(sph(0.05), BODY, [cx, base + 0.065, cz], { scale: [1, 0.95, 1.2] });
  put(sph(0.04), BELLY, [cx, base + 0.055, cz + 0.025], { scale: [0.85, 0.8, 1] });
  // head
  put(sph(0.035), BODY, [cx, base + 0.125, cz + 0.035]);
  // beak
  put(new THREE.ConeGeometry(0.014, 0.04, 6), BEAK, [cx, base + 0.125, cz + 0.088], { dir: [0, 0, 1] });
  put(new THREE.ConeGeometry(0.01, 0.028, 6), BEAK2, [cx, base + 0.115, cz + 0.082], { dir: [0, -0.15, 1] });
  // eyes
  for (const s of [1, -1]) {
    put(sph(0.011), WHITE, [s * 0.026, base + 0.133, cz + 0.058]);
    put(sph(0.006), DARK, [s * 0.03, base + 0.133, cz + 0.066]);
    // wings
    put(new THREE.BoxGeometry(0.012, 0.05, 0.075), WING, [s * 0.05, base + 0.07, cz - 0.005], {
      rotation: [0, 0, s * -12],
    });
    // legs
    put(new THREE.CylinderGeometry(0.004, 0.004, 0.025, 5), FOOT, [s * 0.02, base + 0.0125, cz + 0.005]);
    for (const t of [-1, 0, 1])
      put(new THREE.BoxGeometry(0.004, 0.004, 0.02), FOOT, [s * 0.02 + t * 0.007, base + 0.003, cz + 0.015], {
        rotation: [0, t * 20, 0],
      });
  }
  // tail feathers
  for (const t of [-1, 0, 1])
    put(new THREE.BoxGeometry(0.012, 0.006, 0.075), TAIL, [t * 0.014, base + 0.075, cz - 0.1], {
      rotation: [-15, t * 14, 0],
    });
  // crest tuft
  for (const t of [-1, 0, 1])
    put(new THREE.ConeGeometry(0.007, 0.04 - Math.abs(t) * 0.01, 5), CREST, [t * 0.011, base + 0.17, cz + 0.025], {
      rotation: [-10, 0, -t * 22],
    });
}
    return buildBird;
  })(),
  // furAndTail
  (() => {
function buildFurAndTail(b: Builder) {
  const FUR = "#8a5a32";
  const DARK = "#5e3a1e";
  const TIP = "#b07a46";
  const PALE = "#d9b98a";
  const skin = b.surface(b.root);
  const clampX = (x: number) => Math.max(-0.3, Math.min(0.3, x));

  const down = (x: number, z: number) => skin.ray([clampX(x), 0.8, z], [0, -1, 0]);

  // back tufts and spine ridge
  const zs = [-0.55, -0.4, -0.25, -0.1, 0.05, 0.2, 0.35];
  zs.forEach((z, i) => {
    const h = down(0, z);
    if (!h || h.at.y < 0.2 || h.at.y > 0.8) return;
    const len = 0.08 + (i % 2) * 0.025;
    b.stick(new THREE.ConeGeometry(0.03, len, 5), i % 2 ? FUR : TIP, h, { embed: 0.25 });
    b.stick(new THREE.BoxGeometry(0.1, 0.012, 0.1), DARK, h, { embed: 0.5 });
    for (const s of [1, -1]) {
      const hs = down(s * 0.12, z + 0.04);
      if (hs && hs.at.y > 0.2)
        b.stick(new THREE.ConeGeometry(0.022, 0.06, 5), DARK, hs, { embed: 0.25 });
    }
  });

  // haunch tufts
  for (const s of [1, -1]) {
    for (const z of [-0.6, -0.45]) {
      const h = down(s * 0.2, z);
      if (h && h.at.y > 0.2)
        b.stick(new THREE.ConeGeometry(0.03, 0.07, 5), TIP, h, { embed: 0.25 });
    }
  }

  // rump stub tail
  const rump = skin.ray([0, 0.5, -0.9], [0, 0, 1]);
  if (rump && rump.at.z > -0.75 && rump.at.z < 0.45) {
    const p = rump.at;
    b.sweep(
      [
        [p.x, p.y, p.z + 0.02],
        [p.x, p.y - 0.02, p.z - 0.05],
        [p.x, p.y - 0.05, p.z - 0.09],
      ],
      [0.035, 0.022],
      { color: DARK, caps: "round" },
    );
  }

  // belly pale patch
  const belly = skin.ray([0, 0.05, -0.1], [0, 1, 0]);
  if (belly && belly.at.y < 0.6) {
    b.stick(new THREE.SphereGeometry(0.13, 8, 5), PALE, belly, { embed: 0.5, scale: [1.3, 0.25, 2.2] });
  }

  // muzzle bristles
  const nose = skin.ray([0, 0.45, 1.5], [0, 0, -1]);
  if (nose && nose.at.z < 0.45) {
    for (const s of [1, -1]) {
      for (let i = 0; i < 3; i++) {
        const a = nose.at.clone();
        a.x += s * 0.05;
        a.y += -0.02 + i * 0.02;
        const e = a.clone();
        e.x += s * 0.1;
        e.y += (i - 1) * 0.02;
        b.rod(a, e, 0.003, "#2a1a10");
      }
    }
  }
}
    return buildFurAndTail;
  })(),
  // whimsy
  (() => {
function buildWhimsy(b: Builder) {
  const cx = 0, cy = 0.62, cz = 0.4, R = 0.2;
  const cols = ["#ff8fb3", "#ffd95e", "#ffffff", "#c79bff"];
  b.part(new THREE.TorusGeometry(R, 0.012, 5, 20), "#4f9a45", {
    at: [cx, cy, cz], rotation: [90, 0, 0], bone: "neck",
  });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const p: [number, number, number] = [cx + Math.cos(a) * R, cy + 0.01, cz + Math.sin(a) * R * 0.9];
    const c = cols[i % cols.length];
    b.part(new THREE.SphereGeometry(0.03, 5, 4), c, { at: p, bone: "neck" });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), "#f2a900", {
      at: [p[0], p[1] + 0.02, p[2]], bone: "neck",
    });
    if (i % 2 === 0)
      b.part(new THREE.ConeGeometry(0.018, 0.05, 4), "#3f8a3a", {
        at: [p[0] * 1.0, p[1] - 0.025, p[2]], bone: "neck",
      });
  }
  // leaf hat for the bird (small leaf made of two flattened spheres)
  const hx = 0, hy = 0.82, hz = 0.5;
  b.part(new THREE.SphereGeometry(0.05, 6, 4), "#5cb04a", {
    at: [hx, hy, hz], scale: [1, 0.25, 1.4], bone: "neck",
  });
  b.part(new THREE.SphereGeometry(0.03, 5, 4), "#3f8a3a", {
    at: [hx, hy + 0.012, hz], scale: [0.25, 0.2, 1.5], bone: "neck",
  });
  b.part(new THREE.ConeGeometry(0.01, 0.04, 4), "#ff8fb3", {
    at: [hx, hy + 0.035, hz - 0.03], bone: "neck",
  });
  // drifting petals on the upper back
  const pet: [number, number, number][] = [
    [-0.12, 0.8, 0.28], [0.1, 0.82, 0.34], [0.2, 0.78, 0.25],
    [-0.2, 0.76, 0.4], [0.02, 0.84, 0.22], [-0.05, 0.8, 0.45],
  ];
  pet.forEach((p, i) => {
    b.part(new THREE.SphereGeometry(0.022, 5, 4), cols[i % 3], {
      at: p, scale: [1, 0.2, 1.4], rotation: [0, i * 50, i * 20], bone: "chest",
    });
  });
}
    return buildWhimsy;
  })(),
];

export const BASE_PARTS = [
  {
    id: "head",
    builds: "capybara face details: big dark eyes with highlights, brows, blunt muzzle pad, nostrils, split mouth line, small round ears with inner tone, whisker dots, cheek tufts, lower jaw on the jaw joint",
    box: [
      [-0.22, 0.55, 0.45],
      [0.22, 0.95, 0.98],
    ],
    attaches: "head skull and muzzle block on the head joint; jaw joint under the muzzle",
    joints: ["head", "jaw", "neck"],
    floor: false,
    budget: 180,
  },
  {
    id: "legs",
    builds: "four short stout legs with joints (hip, knee, ankle), chunky dark paws with toe nubs and claws, fur tufts at the leg tops",
    box: [
      [-0.3, 0, -0.5],
      [0.3, 0.38, 0.5],
    ],
    attaches: "underside of the barrel body at the shoulder and hip joints",
    joints: ["hips", "chest"],
    floor: true,
    budget: 220,
  },
  {
    id: "bird",
    builds: "small whimsical bird perched on the head: round body, head, beak, eyes, wing pair, tail feathers, tiny feet gripping, crest tuft",
    box: [
      [-0.07, 0.93, 0.5],
      [0.07, 1.1, 0.72],
    ],
    attaches: "flat top of the capybara skull at the head joint",
    joints: ["head"],
    floor: false,
    budget: 150,
  },
  {
    id: "furAndTail",
    builds: "fur detail: back tufts, rump stub tail, belly pale patch, fur ridge cards along spine and haunches, whisker-like bristles on the muzzle",
    box: [
      [-0.32, 0.2, -0.75],
      [0.32, 0.8, 0.45],
    ],
    attaches: "surface of the barrel body and the rump at the tail joint",
    joints: ["tail", "hips", "chest"],
    floor: false,
    budget: 200,
  },
  {
    id: "whimsy",
    builds: "whimsical accessories: a tiny flower garland or scarf around the neck, little leaf hat for the bird, a few petals drifting on the back",
    box: [
      [-0.3, 0.45, 0.2],
      [0.3, 0.85, 0.6],
    ],
    attaches: "neck joint region and the upper back of the body",
    joints: ["neck", "chest"],
    floor: false,
    budget: 130,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const FUR = "#a8743f";
  const FUR_DARK = "#8a5a2e";
  const BELLY = "#c9985c";

  const hips = b.joint("hips", { at: [0, 0.4, -0.25] });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.42, 0.2], aim: [0, 0.45, 0.45], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.5, 0.42], aim: [0, 0.6, 0.58], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.6, 0.58], aim: [0, 0.68, 0.9], role: "head" });
  b.joint("jaw", { parent: head, at: [0, 0.6, 0.78], aim: [0, 0.58, 0.95], role: "jaw" });
  b.joint("tail", { parent: hips, at: [0, 0.42, -0.72], aim: [0, 0.4, -0.8], role: "tail" });

  // barrel body: long loft from rump to shoulders
  b.loft(
    [
      { at: [0, 0.42, -0.68], w: 0.42, h: 0.4 },
      { at: [0, 0.46, -0.4], w: 0.6, h: 0.52 },
      { at: [0, 0.48, -0.05], w: 0.64, h: 0.56 },
      { at: [0, 0.5, 0.25], w: 0.6, h: 0.54 },
      { at: [0, 0.52, 0.45], w: 0.46, h: 0.46 },
    ],
    { bone: [hips, chest], color: FUR, sides: 10 },
  );
  // pale belly strip
  b.part(new THREE.BoxGeometry(0.36, 0.06, 0.8), BELLY, { bone: hips, at: [0, 0.2, -0.1] });

  // neck
  b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.26, 8), FUR, { bone: neck, at: [0, 0.57, 0.52], rotation: [60, 0, 0] });

  // head: skull block and big blunt muzzle
  b.part(new THREE.BoxGeometry(0.36, 0.34, 0.34), FUR, { bone: head, at: [0, 0.68, 0.7] });
  b.part(new THREE.BoxGeometry(0.3, 0.26, 0.3), FUR_DARK, { bone: head, at: [0, 0.62, 0.9] });
  b.part(new THREE.BoxGeometry(0.24, 0.1, 0.18), FUR_DARK, { bone: head, at: [0, 0.78, 0.62] });

    for (const add of PARTS) add(b);
  return b.root;
}
