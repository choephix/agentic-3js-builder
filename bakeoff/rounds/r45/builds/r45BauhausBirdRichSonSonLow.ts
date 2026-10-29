import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Bauhaus Songbird",
  "description": "A small perching songbird assembled from primitive geometry in Bauhaus primary colours (red sphere body, blue head, yellow triangle beak and wings), sitting on a black geometric branch with a block trunk."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  red: "#d9261c",
  redDeep: "#a31a14",
  yellow: "#f5c400",
  yellowPale: "#ffe27a",
  blue: "#1f4fa6",
  navy: "#14316b",
  black: "#16161a",
  charcoal: "#2e2e33",
  cream: "#f2ead6",
  white: "#fbf8ee",
};
const M = {
  floorOrigin: [0, 0, 0] as [number, number, number],
  perchTop: [0, 0.22, 0] as [number, number, number],
  branchAxis: [0, 0.2, 0] as [number, number, number],
  trunkTop: [-0.24, 0.2, 0] as [number, number, number],
  footL: [0.022, 0.226, 0] as [number, number, number],
  footR: [-0.022, 0.226, 0] as [number, number, number],
  hipL: [0.024, 0.272, -0.005] as [number, number, number],
  hipR: [-0.024, 0.272, -0.005] as [number, number, number],
  bodyCenter: [0, 0.305, -0.01] as [number, number, number],
  bellyFront: [0, 0.29, 0.05] as [number, number, number],
  shoulderL: [0.044, 0.335, 0.025] as [number, number, number],
  shoulderR: [-0.044, 0.335, 0.025] as [number, number, number],
  neckBase: [0, 0.345, 0.035] as [number, number, number],
  headCenter: [0, 0.388, 0.05] as [number, number, number],
  jawHinge: [0, 0.378, 0.07] as [number, number, number],
  beakBase: [0, 0.378, 0.083] as [number, number, number],
  beakTip: [0, 0.372, 0.118] as [number, number, number],
  tailRoot: [0, 0.3, -0.055] as [number, number, number],
  tailTip: [0, 0.25, -0.18] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // perch
  (() => {
function buildPerch({ b, J, P, M }: Ctx) {
  const root = J.root;
  const BLACK = P.black, CHAR = P.charcoal, CREAM = P.cream, RED = P.red, YEL = P.yellow, BLUE = P.blue;
  const part = (g: THREE.BufferGeometry, c: string, at: [number, number, number], o: any = {}) =>
    b.part(g, c, { bone: root, at, flat: true, ...o });

  // base plate and trunk
  part(new THREE.BoxGeometry(0.12, 0.012, 0.12), CREAM, [-0.24, 0.006, 0]);
  part(new THREE.BoxGeometry(0.1, 0.004, 0.1), CHAR, [-0.24, 0.014, 0]);
  part(new THREE.BoxGeometry(0.04, 0.188, 0.04), BLACK, [-0.24, 0.106, 0]);
  // trunk bands and blue cube knot
  part(new THREE.BoxGeometry(0.046, 0.006, 0.046), CREAM, [-0.24, 0.05, 0]);
  part(new THREE.BoxGeometry(0.024, 0.024, 0.024), BLUE, [-0.24, 0.1, 0.026]);
  part(new THREE.BoxGeometry(0.012, 0.012, 0.004), YEL, [-0.24, 0.1, 0.04]);

  // main branch, tapered, 8 sided
  b.rod([-0.3, 0.2, 0], [0.3, 0.2, 0], [0.02, 0.015], BLACK, { bone: root, sides: 8, caps: "flat" } as any);

  // ring bands
  const bandR = (x: number) => 0.0205 - ((x + 0.3) / 0.6) * 0.0055 + 0.002;
  for (const x of [-0.15, 0.15, 0.24]) {
    part(new THREE.CylinderGeometry(bandR(x), bandR(x), 0.008, 8), CREAM, [x, 0.2, 0], { dir: [1, 0, 0] });
  }

  // end caps
  part(new THREE.CylinderGeometry(0.019, 0.019, 0.004, 10), RED, [-0.302, 0.2, 0], { dir: [1, 0, 0] });
  const cap = b.extrude([[-0.014, -0.012], [0.014, -0.012], [0, 0.014]], {
    at: [0.3, 0.2, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.004, color: YEL, bone: root,
  });

  // twigs with leaf motifs
  const twig = (x0: number, x1: number, y1: number, z1: number) => {
    b.rod([x0, 0.215, 0], [x1, y1, z1], 0.0035, CHAR, { bone: root, sides: 6 } as any);
  };
  // +x end: red disc
  twig(0.2, 0.22, 0.27, 0.03);
  part(new THREE.CylinderGeometry(0.022, 0.022, 0.005, 10), RED, [0.22, 0.282, 0.03], { dir: [0, 0, 1] });
  part(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 8), CREAM, [0.22, 0.282, 0.0325], { dir: [0, 0, 1] });
  // +x end second twig: yellow triangle
  twig(0.27, 0.27, 0.26, -0.03);
  b.extrude([[-0.02, 0], [0.02, 0], [0, 0.034]], {
    at: [0.27, 0.262, -0.03], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.005, color: YEL, bone: root,
  });
  // near trunk: yellow triangle and red disc
  twig(-0.17, -0.15, 0.255, -0.035);
  b.extrude([[-0.02, 0], [0.02, 0], [0, 0.034]], {
    at: [-0.15, 0.256, -0.035], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.005, color: YEL, bone: root,
  });
  twig(-0.2, -0.19, 0.25, 0.03);
  part(new THREE.CylinderGeometry(0.016, 0.016, 0.005, 10), RED, [-0.19, 0.266, 0.03], { dir: [0, 0, 1] });
  part(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 8), BLUE, [-0.19, 0.266, 0.0325], { dir: [0, 0, 1] });

  // small blue knots on branch
  part(new THREE.BoxGeometry(0.014, 0.014, 0.014), BLUE, [-0.1, 0.222, 0.0]);
  part(new THREE.BoxGeometry(0.01, 0.01, 0.01), RED, [0.1, 0.222, 0.0]);
}
    return buildPerch;
  })(),
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const body = J.body;
  const bc = M.bodyCenter;
  const R = rng(5);

  // Body: faceted egg
  b.part(new THREE.SphereGeometry(1, 10, 7), P.red, {
    bone: body, at: bc, scale: [0.045, 0.048, 0.065], flat: true,
  });

  // Belly disc on chest, facing forward-down
  const bf = M.bellyFront;
  const bellyDir: [number, number, number] = [0, -0.25, 1];
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.004, 10), P.yellow, {
    bone: body, at: [bf[0], bf[1] - 0.001, bf[2] - 0.004], dir: bellyDir, flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.007, 10), P.cream, {
    bone: body, at: [bf[0], bf[1] - 0.001, bf[2] - 0.002], dir: bellyDir, flat: true,
  });

  // Blue back saddle: flattened cap
  b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.blue, {
    bone: body, at: [bc[0], bc[1] + 0.012, bc[2] - 0.006], scale: [0.04, 0.042, 0.058], flat: true,
  });

  // Yellow triangle chevrons on the saddle
  for (let i = 0; i < 3; i++) {
    const z = bc[2] + 0.02 - i * 0.02;
    const k = Math.sqrt(Math.max(0, 1 - Math.pow((z - bc[2] + 0.006) / 0.058, 2)));
    const y = bc[1] + 0.012 + 0.042 * k * 0.97;
    b.part(new THREE.ConeGeometry(0.008, 0.004, 3), P.yellow, {
      bone: body, at: [0, y, z], dir: [0, 1, -0.2], flat: true,
    });
  }

  // Redeep rump wedge
  b.part(new THREE.ConeGeometry(0.02, 0.04, 4), P.redDeep, {
    bone: body, at: [0, M.tailRoot[1] + 0.002, M.tailRoot[2] + 0.002], dir: [0, -0.2, -1], flat: true,
  });

  // Navy undertail coverts
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.04), P.navy, {
    bone: J.tail1, at: [0, 0.286, -0.07], rotation: [-8, 0, 0],
  });

  // Tail feathers: centre + two side feathers on tail1 / tail2
  const feather = (x: number, yaw: number, len: number, w: number, z0: number, bone: any, y0: number) => {
    const slope = -0.3;
    const cz = z0 - len / 2;
    const cy = y0 + slope * (len / 2) * 0.5;
    b.part(new THREE.BoxGeometry(w, 0.004, len), P.blue, {
      bone, at: [x, cy, cz], rotation: [-14, yaw, 0],
    });
  };
  feather(0, 0, 0.12, 0.018, -0.055, J.tail1, 0.295);
  feather(0.011, -6, 0.1, 0.012, -0.06, J.tail1, 0.294);
  feather(-0.011, 6, 0.1, 0.012, -0.06, J.tail1, 0.294);
  // Outer extension on tail2
  b.part(new THREE.BoxGeometry(0.018, 0.004, 0.05), P.navy, {
    bone: J.tail2, at: [0, 0.262, -0.152], rotation: [-14, 0, 0],
  });

  // Bars across tail (red / yellow)
  const bars: [number, string][] = [[-0.08, P.red], [-0.105, P.yellow], [-0.13, P.red], [-0.152, P.yellow]];
  bars.forEach(([z, c], i) => {
    const y = 0.3 - 0.0 + (z + 0.055) * 0.25 + 0.0035;
    b.part(new THREE.BoxGeometry(0.03, 0.002, 0.009), c, {
      bone: i < 2 ? J.tail1 : J.tail2, at: [0, y + 0.0, z], rotation: [-14, 0, 0],
    });
  });

  // Yellow triangle tip
  b.part(new THREE.ConeGeometry(0.016, 0.03, 3), P.yellow, {
    bone: J.tail2, at: [0, M.tailTip[1] + 0.002, M.tailTip[2] + 0.005], dir: [0, -0.2, -1], flat: true,
  });
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const HC = M.headCenter;
  const R = 0.036;
  const v = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  // neck collar
  b.part(new THREE.SphereGeometry(0.03, 8, 6), P.blue, {
    bone: J.neck, at: v(0, 0.352, 0.038), scale: [1, 0.8, 1], flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.03, 0.02, 8), P.navy, {
    bone: J.neck, at: v(0, 0.347, 0.036), flat: true,
  });

  // head
  b.part(new THREE.SphereGeometry(R, 10, 8), P.blue, { bone: J.head, at: HC, flat: true });

  // cream throat disc
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.003, 10), P.cream, {
    bone: J.head, at: v(0, 0.362, 0.07), dir: [0, -0.6, 0.8],
  });

  // eyes and cheeks
  for (const s of [1, -1]) {
    const out = new THREE.Vector3(s * 0.9, 0.1, 0.45).normalize();
    const place = (r: number, h: number, col: string, off: number, seg = 12) =>
      b.part(new THREE.CylinderGeometry(r, r, h, seg), col, {
        bone: J.head,
        at: v(s * 0.0275 + out.x * off, 0.395 + out.y * off, 0.068 + out.z * off),
        dir: [out.x, out.y, out.z],
      });
    place(0.0125, 0.0014, P.black, 0.0005);
    place(0.0095, 0.0014, P.white, 0.0017);
    place(0.0055, 0.0014, P.black, 0.0029);
    b.part(new THREE.CylinderGeometry(0.0018, 0.0018, 0.001, 6), P.white, {
      bone: J.head,
      at: v(s * 0.0275 + out.x * 0.0042 - s * 0.0005, 0.395 + out.y * 0.0042 + 0.0025, 0.068 + out.z * 0.0042 + 0.002),
      dir: [out.x, out.y, out.z],
    });
    // cheek
    const c = new THREE.Vector3(s * 0.9, -0.35, 0.1).normalize();
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.003, 10), P.red, {
      bone: J.head,
      at: v(s * 0.031, 0.375, 0.04),
      dir: [c.x, c.y, c.z],
    });
  }

  // crest triangle
  b.extrude(
    [[-0.012, 0], [0.012, 0], [0, 0.022, "sharp"]],
    { at: v(0, 0.419, 0.045), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.006, color: P.yellow, bone: J.head },
  );
  // crown stripe
  b.part(new THREE.BoxGeometry(0.056, 0.0015, 0.005), P.black, {
    bone: J.head, at: v(0, 0.4235, 0.062), rotation: [0, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.052, 0.0015, 0.004), P.black, {
    bone: J.head, at: v(0, 0.4195, 0.03), rotation: [0, 0, 0],
  });

  // beak upper
  const bb = M.beakBase, bt = M.beakTip;
  b.part(new THREE.ConeGeometry(0.014, 0.036, 4), P.yellow, {
    bone: J.head,
    at: v(0, 0.3765, 0.1005),
    dir: [0, -0.15, 1],
    scale: [1, 1, 0.75],
    flat: true,
  });
  // nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0020, 5, 4), P.black, { bone: J.head, at: v(s * 0.0045, 0.3835, 0.092) });

  // mouth line
  b.part(new THREE.BoxGeometry(0.014, 0.0012, 0.026), P.black, {
    bone: J.head, at: v(0, 0.3745, 0.098),
  });

  // lower beak
  b.part(new THREE.ConeGeometry(0.0105, 0.026, 4), P.yellowPale, {
    bone: J.jaw,
    at: v(0, 0.3715, 0.092),
    dir: [0, -0.1, 1],
    scale: [1, 1, 0.6],
    flat: true,
  });
}
    return buildHead;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const YEL = P.yellow, BLUE = P.blue, NAVY = P.navy, RED = P.red, BLK = P.black, WHT = P.white;
  const r = rng(5);

  for (const s of [1, -1]) {
    const main = s > 0 ? J.wingL : J.wingR;
    const tipJ = s > 0 ? J.wingL2 : J.wingR2;
    const X = 0.054 * s;
    // outline in side view: u runs along -z (back), v is up
    const face = (outline: [number, number][], z0: number, y0: number, x: number, th: number, color: string, bone: any) =>
      b.extrude(outline, { at: [x, y0, z0], x: [0, 0, -1], y: [0, 1, 0], thickness: th, color, bone });

    // main yellow slab: broad at the front, pointing back
    face([[0, 0.03], [0.02, -0.03], [0.1, -0.06], [0.155, -0.045], [0.06, 0.035]], 0.03, 0.31, X, 0.008, YEL, main);
    // black leading edge strip
    b.part(new THREE.BoxGeometry(0.004, 0.004, 0.07), BLK, {
      bone: main, at: [X + 0.005 * s, 0.343, -0.005], rotation: [-12, 0, 0],
    });
    // blue covert triangle near shoulder
    face([[0, 0.025], [0.0, -0.02], [0.06, -0.01]], 0.025, 0.318, X + 0.006 * s, 0.005, BLUE, main);
    // red half disc spot
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 8), RED, {
      bone: main, at: [X + 0.007 * s, 0.31, -0.03], dir: [s, 0, 0],
    });
    // white small square bar
    b.part(new THREE.BoxGeometry(0.003, 0.012, 0.012), WHT, {
      bone: main, at: [X + 0.007 * s, 0.322, -0.05],
    });
    // primaries riding the wing tip joint, fanned
    const cols = [NAVY, BLUE, RED];
    cols.forEach((c, i) => {
      const y = 0.298 - i * 0.012;
      const len = 0.075 - i * 0.008;
      const g = b.part(new THREE.BoxGeometry(0.005, 0.007, len), c, {
        bone: tipJ, at: [X + 0.005 * s, y, -0.07 - len / 2 + 0.02],
        rotation: [(i - 1) * 3, s * (i - 1) * 2, 0],
      });
      // tiny triangle tip on each primary
      b.part(new THREE.ConeGeometry(0.005, 0.012, 3), c, {
        bone: tipJ, at: [X + 0.005 * s, y, -0.07 - len + 0.014 - 0.006],
        rotation: [-90, 0, 0],
      });
    });
    // yellow tip dot on outer face
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.003, 6), YEL, {
      bone: tipJ, at: [X + 0.008 * s, 0.292, -0.11], dir: [s, 0, 0],
    });
  }
}
    return buildWings;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const BLACK = P.black, YEL = P.yellow, CREAM = P.cream;
  const r = rng(5);
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hip = J["hip" + L], ank = J["ankle" + L];
    const hx = s * 0.024, ax = s * 0.022;
    // thigh tuft
    b.part(new THREE.SphereGeometry(0.014, 6, 5), CREAM, { bone: hip, at: [hx, 0.274, -0.005], scale: [1, 1.1, 1.2] });
    b.part(new THREE.ConeGeometry(0.011, 0.02, 6), CREAM, { bone: hip, at: [hx, 0.262, -0.008], dir: [0, -1, 0] });
    // tarsus
    b.rod([hx, 0.266, -0.005], [ax, 0.23, 0], 0.0035, BLACK, { bone: hip, sides: 6 });
    // ankle ball
    b.part(new THREE.SphereGeometry(0.0062, 6, 5), YEL, { bone: ank, at: [ax, 0.2285, 0] });
    // toes
    const toes = [
      { n: "1", dx: s * 0.006, z: 0.034, len: 0.0 },
      { n: "2", dx: -s * 0.006, z: 0.032, len: 0.0 },
      { n: "3", dx: 0, z: -0.022, len: 0.0 },
    ];
    toes.forEach((t, i) => {
      const bone = J["toe" + L + t.n];
      const mid: [number, number, number] = [ax + t.dx * 0.5, 0.2265, t.z * 0.55];
      const end: [number, number, number] = [ax + t.dx, 0.2245, t.z];
      const start: [number, number, number] = [ax, 0.228, 0];
      const rad = i === 2 ? 0.0036 : 0.0033;
      b.rod(start, mid, rad, BLACK, { bone, sides: 6 });
      b.rod(mid, end, rad, BLACK, { bone, sides: 6 });
      b.part(new THREE.SphereGeometry(0.0045, 5, 4), BLACK, { bone, at: mid });
      const d = new THREE.Vector3(end[0] - mid[0], -0.0015, end[2] - mid[2]).normalize();
      const tip: [number, number, number] = [end[0] + d.x * 0.004, 0.2245 - 0.0005, end[2] + d.z * 0.004];
      b.part(new THREE.ConeGeometry(0.0034, 0.008, 5), YEL, {
        bone,
        at: tip,
        dir: [d.x, d.y, d.z],
      });
    });
    r();
  }
}
    return buildLegs;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bauhausSongbird" });
  const J: Record<string, Joint> = {};
  J["root"] = b.joint("root", { at: [0,0,0], dir: [0,1,0] });
  J["body"] = b.joint("body", { parent: J["root"], at: [0,0.305,-0.01], dir: [0,0,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["body"], at: [0,0.345,0.035], dir: [0,0.5,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,0.375,0.05], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.378,0.07], dir: [0,0,1], role: "jaw" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,0.3,-0.055], dir: [0,-0.25,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.28,-0.115], dir: [0,-0.3,-1], role: "tail", group: "tail" });
  J["wingL"] = b.joint("wingL", { parent: J["body"], at: [0.044,0.335,0.025], dir: [0.1,-0.25,-1], role: "wing", group: "wings" });
  J["wingL2"] = b.joint("wingL2", { parent: J["wingL"], at: [0.052,0.31,-0.04], dir: [0.05,-0.2,-1], role: "wing", group: "wings" });
  J["wingR"] = b.joint("wingR", { parent: J["body"], at: [-0.044,0.335,0.025], dir: [-0.1,-0.25,-1], role: "wing", group: "wings" });
  J["wingR2"] = b.joint("wingR2", { parent: J["wingR"], at: [-0.052,0.31,-0.04], dir: [-0.05,-0.2,-1], role: "wing", group: "wings" });
  J["hipL"] = b.joint("hipL", { parent: J["body"], at: [0.024,0.272,-0.005], dir: [0,-1,0], role: "leg", group: "legs" });
  J["ankleL"] = b.joint("ankleL", { parent: J["hipL"], at: [0.022,0.228,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["toeL1"] = b.joint("toeL1", { parent: J["ankleL"], at: [0.022,0.228,0], dir: [0.15,-0.1,1], role: "digit", group: "legs" });
  J["toeL2"] = b.joint("toeL2", { parent: J["ankleL"], at: [0.022,0.228,0], dir: [-0.15,-0.1,1], role: "digit", group: "legs" });
  J["toeL3"] = b.joint("toeL3", { parent: J["ankleL"], at: [0.022,0.228,0], dir: [0,-0.1,-1], role: "digit", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["body"], at: [-0.024,0.272,-0.005], dir: [0,-1,0], role: "leg", group: "legs" });
  J["ankleR"] = b.joint("ankleR", { parent: J["hipR"], at: [-0.022,0.228,0], dir: [0,-1,0], role: "leg", group: "legs" });
  J["toeR1"] = b.joint("toeR1", { parent: J["ankleR"], at: [-0.022,0.228,0], dir: [-0.15,-0.1,1], role: "digit", group: "legs" });
  J["toeR2"] = b.joint("toeR2", { parent: J["ankleR"], at: [-0.022,0.228,0], dir: [0.15,-0.1,1], role: "digit", group: "legs" });
  J["toeR3"] = b.joint("toeR3", { parent: J["ankleR"], at: [-0.022,0.228,0], dir: [0,-0.1,-1], role: "digit", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
