import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Songbird on a Branch",
  "description": "A stylized songbird with a black cap, red breast disc and blue wings perched on a charcoal branch dressed with primary-coloured leaf discs, in flat Bauhaus geometry."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  red: "#e2372e",
  blue: "#20549c",
  yellow: "#f5b81c",
  cream: "#f7f0e0",
  ink: "#1d1d22",
  bark: "#3a3540",
  slate: "#5a6070",
  white: "#ffffff",
};
const M = {
  perchTop: [0, 0.17, -0.02] as [number, number, number],
  neckSeat: [0, 0.37, 0.04] as [number, number, number],
  tailRoot: [0, 0.32, -0.08] as [number, number, number],
  hipL: [0.035, 0.24, 0] as [number, number, number],
  hipR: [-0.035, 0.24, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // branch
  (() => {
function buildBranch({ b, J, P, M }: Ctx) {
  const BARK = P.bark, CREAM = P.cream, INK = P.ink, RED = P.red, BLUE = P.blue, YEL = P.yellow;
  const R = rng(11);

  // Branch: centreline sags then rises to the tip. Radius is kept so the tip rests on the floor.
  const path = catmull([
    [-0.4, 0.1, -0.02],
    [-0.2, 0.09, -0.02],
    [0, 0.085, -0.02],
    [0.2, 0.065, -0.02],
    [0.4, 0.05, -0.02],
  ]);
  const tube = b.sweep(path, [0.1, 0.05], { color: BARK, sides: 8, caps: { start: "flat", end: "flat" } });

  // Growth-ring cut face at the butt (axis along X)
  const buttX = -0.402;
  const face = (r: number, h: number, color: string, x: number) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 20), color, { at: [x, 0.1, -0.02], dir: [1, 0, 0] });
  face(0.088, 0.008, CREAM, buttX - 0.002);
  [0.07, 0.048, 0.026].forEach((r, i) => {
    b.part(new THREE.TorusGeometry(r, 0.004, 5, 20), INK, {
      at: [buttX - 0.008 - i * 0.0004, 0.1, -0.02],
      dir: [1, 0, 0],
      axis: "z",
    });
  });
  face(0.01, 0.012, INK, buttX - 0.008);

  // Painted cream band rings
  for (const x of [-0.12, 0.2]) {
    const t = path.closestT([x, 0.08, -0.02]);
    const p = path.at(t);
    const rad = 0.1 + (0.05 - 0.1) * t;
    b.part(new THREE.TorusGeometry(rad + 0.002, 0.006, 5, 8), CREAM, {
      at: [x, p.y, -0.02],
      dir: [1, 0, 0],
      axis: "z",
    });
  }

  // Twig
  const base = [0.26, 0.13, -0.02];
  const fork = [0.28, 0.22, -0.06];
  const tip = [0.3, 0.29, -0.1];
  b.rod(base, fork, [0.016, 0.012], BARK, { sides: 6 });
  b.rod(fork, tip, [0.012, 0.008], BARK, { sides: 6 });
  const sub = [0.2, 0.28, -0.05];
  b.rod(fork, sub, [0.01, 0.006], BARK, { sides: 6 });

  // Leaf discs with stems
  const leaf = (c: string, at: number[], d: number[]) => {
    const dir = new THREE.Vector3(...d).normalize();
    const stemEnd = new THREE.Vector3(...at);
    const lc = stemEnd.clone().addScaledVector(dir, 0.055);
    b.rod(at, lc.toArray(), 0.0035, INK, { sides: 5 });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 18), c, {
      at: lc.clone().addScaledVector(dir, 0.01).toArray(),
      dir: [dir.x * 0.4, 1, dir.z * 0.4 + 0.3],
    });
  };
  leaf(YEL, tip, [0.5, 0.8, -0.3]);
  leaf(RED, tip, [-0.2, 0.5, -0.8]);
  leaf(BLUE, tip, [0.6, 0.3, 0.6]);

  // Berries on stalks
  for (const [bx, bz] of [[0.2, -0.05], [0.23, -0.04]] as number[][]) {
    const top = bx === 0.2 ? sub : [0.245, 0.25, -0.055];
    const end = [bx === 0.2 ? 0.195 : 0.235, 0.22, bz];
    b.rod(top, end, 0.0025, INK, { sides: 4 });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), RED, { at: [end[0], end[1] - 0.018, end[2]] });
  }

  // Lichen patch on branch top near x=-0.2
  b.part(new THREE.SphereGeometry(0.03, 8, 6), CREAM, { at: [-0.2, 0.18, -0.02], scale: [1.3, 0.3, 1] });

  // Bark knots underneath
  for (const x of [-0.28, -0.05, 0.12]) {
    const t = path.closestT([x, 0.08, -0.02]);
    const rad = 0.1 - 0.05 * t;
    b.part(new THREE.SphereGeometry(0.018 + R() * 0.006, 6, 4), BARK, {
      at: [x, path.at(t).y - rad + 0.004, -0.02 + (R() - 0.5) * 0.04],
      scale: [1, 0.6, 1],
    });
  }
}
    return buildBranch;
  })(),
  // birdBody
  (() => {
function buildBirdBody({ b, J, P, M }: Ctx) {
  const BLUE = P.blue, CREAM = P.cream, RED = P.red, INK = P.ink, YEL = P.yellow;
  const body = J.body, tail = J.tail;

  // Blue egg torso, leaning forward
  b.part(new THREE.SphereGeometry(1, 14, 10), BLUE, {
    bone: body, at: [0, 0.30, 0], scale: [0.075, 0.085, 0.095], rotation: [12, 0, 0], name: "egg",
  });
  // Cream belly
  b.part(new THREE.SphereGeometry(1, 12, 8), CREAM, {
    bone: body, at: [0, 0.265, 0.025], scale: [0.065, 0.06, 0.075], rotation: [10, 0, 0], name: "belly",
  });
  // Red breast disc with cream rim
  const bd = [0, 0.29, 0.078] as [number, number, number];
  b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.008, 20), CREAM, {
    bone: body, at: [0, 0.29, 0.074], dir: [0, 0.2, 1], name: "breastRim",
  });
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.012, 20), RED, {
    bone: body, at: bd, dir: [0, 0.2, 1], name: "breastDisc",
  });

  // Yellow collar
  b.part(new THREE.TorusGeometry(0.058, 0.009, 6, 16), YEL, {
    bone: body, at: [0, 0.37, 0.04], rotation: [90, 0, 0], name: "collar",
  });

  // Cream rump patch
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
    bone: tail, at: [0, 0.345, -0.085], scale: [0.03, 0.012, 0.03], name: "rump",
  });

  // Wings
  for (const s of [1, -1]) {
    const feather = [
      [0, 0], [0.035, 0.02], [0.045, -0.05], [0.025, -0.14], [0, -0.18], [-0.02, -0.12], [-0.03, -0.03],
    ] as [number, number][];
    // outline: x across drawing = backward along flank (z), y = up
    const outline: [number, number][] = [
      [0.0, 0.0], [-0.06, 0.012], [-0.15, -0.04], [-0.17, -0.07], [-0.1, -0.1], [-0.02, -0.075], [0.01, -0.03],
    ];
    void feather;
    const at: [number, number, number] = [s * 0.078, 0.345, 0.0];
    b.extrude(outline, {
      at, x: [0, -0.1, -1], y: [s * 0.25, 1, 0], thickness: 0.016, bevel: 0.003, smoothing: 1,
      color: BLUE, bone: body, name: "wing" + s,
    });
    const wx = s * 0.087;
    // wingbar
    b.part(new THREE.BoxGeometry(0.008, 0.07, 0.014), CREAM, {
      bone: body, at: [wx, 0.30, -0.085], rotation: [0, 0, s * -8], name: "wingbar" + s,
    });
    // ink tip
    b.part(new THREE.BoxGeometry(0.01, 0.06, 0.04), INK, {
      bone: body, at: [s * 0.083, 0.285, -0.145], rotation: [20, 0, 0], name: "wingtip" + s,
    });
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.008, 0.012 + i * 0.002, 0.03), INK, {
        bone: body, at: [s * (0.079 - i * 0.003), 0.265 - i * 0.012, -0.165 - i * 0.012],
        rotation: [20, s * 5 * i, 0], name: `notch${s}${i}`,
      });
    }
  }

  // Tail fan
  const root = M.tailRoot;
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 7; // degrees
    const ar = (a * Math.PI) / 180;
    const len = 0.19 - Math.abs(i - 2) * 0.008;
    const dir = new THREE.Vector3(Math.sin(ar), 0.45, -1).normalize();
    const feather: [number, number][] = [
      [0, -0.016], [len * 0.7, -0.019], [len, -0.008], [len, 0.008], [len * 0.7, 0.019], [0, 0.016],
    ];
    const xdir = dir.clone();
    const ydir = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(1, 0, 0)).normalize();
    // ensure y roughly perpendicular and in the tail's fan plane
    const yv = new THREE.Vector3(1, 0, 0);
    void ydir;
    b.extrude(feather, {
      at: [root[0], root[1], root[2]], x: [xdir.x, xdir.y, xdir.z], y: [yv.x, yv.y, yv.z],
      thickness: 0.008, color: INK, bone: tail, name: "tailF" + i,
    });
    const tipAt = new THREE.Vector3(...root).addScaledVector(dir, len * 0.86);
    b.part(new THREE.BoxGeometry(0.03, 0.006, 0.026), CREAM, {
      bone: tail, at: [tipAt.x, tipAt.y, tipAt.z], dir: [dir.x, dir.y, dir.z], axis: "z", name: "tailCap" + i,
    });
  }
}
    return buildBirdBody;
  })(),
  // birdHead
  (() => {
function buildBirdHead({ b, J, P, M }: any) {
  const head = J.head;
  const jaw = J.jaw;
  const C = [0, 0.44, 0.07] as [number, number, number];
  const R = 0.075;
  const INK = P.ink, CREAM = P.cream, YEL = P.yellow, RED = P.red, WHITE = P.white;

  // Skull
  const skull = b.part(new THREE.SphereGeometry(R, 14, 10), INK, { bone: head, at: C });

  // Crown dot
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.006, 12), RED, {
    bone: head, at: [0, 0.512, 0.06], dir: [0, 1, 0.1],
  });

  for (const s of [1, -1]) {
    // Cheek disc
    const cdir: [number, number, number] = [s * 1, 0.05, 0.35];
    const cheekAt: [number, number, number] = [s * 0.062, 0.43, 0.093];
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.008, 16), CREAM, {
      bone: head, at: cheekAt, dir: cdir,
    });
    // Eye on cheek
    const n = new THREE.Vector3(...cdir).normalize();
    const along = (d: number): [number, number, number] => [
      cheekAt[0] + n.x * d, cheekAt[1] + n.y * d + 0.012, cheekAt[2] + n.z * d,
    ];
    const eyeAt = along(0.006);
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.006, 16), WHITE, {
      bone: head, at: eyeAt, dir: cdir,
    });
    const pupAt = [eyeAt[0] + n.x * 0.004, eyeAt[1] + n.y * 0.004 + 0.001, eyeAt[2] + n.z * 0.004] as [number, number, number];
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.006, 14), INK, {
      bone: head, at: pupAt, dir: cdir,
    });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), WHITE, {
      bone: head,
      at: [pupAt[0] + n.x * 0.005 + s * 0.0, pupAt[1] + 0.008, pupAt[2] + n.z * 0.005 + 0.006],
    });
    // Brow: arc of small slab
    b.part(new THREE.BoxGeometry(0.004, 0.005, 0.04), CREAM, {
      bone: head,
      at: [s * 0.066, 0.472, 0.1],
      rotation: [-15, 0, s * -20],
    });
  }

  // Upper mandible: cone along +Z, slightly down
  const bdir: [number, number, number] = [0, -0.12, 1];
  b.part(new THREE.ConeGeometry(0.022, 0.08, 10), YEL, {
    bone: head, at: [0, 0.425, 0.165], dir: bdir,
    quat: undefined,
    rotation: undefined,
  } as any);
  // cone points +Y by default; rotate to +Z via aim with axis y
  // (re-place correctly: remove ambiguity by adding a second correctly-aimed cone is wasteful; handled by dir above)

  // Nostrils
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.004, 6, 4), INK, { bone: head, at: [s * 0.01, 0.436, 0.14] });

  // Lower mandible on jaw: frustum
  b.part(new THREE.CylinderGeometry(0.006, 0.018, 0.065, 8), YEL, {
    bone: jaw, at: [0, 0.408, 0.1575], dir: [0, 0, 1],
  });
  // Mouth line
  b.part(new THREE.BoxGeometry(0.002, 0.002, 0.07), INK, {
    bone: jaw, at: [0, 0.4185, 0.16],
  });

  return skull;
}
    return buildBirdHead;
  })(),
  // legsFeet
  (() => {
function buildLegsFeet({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const SLATE = P.slate, INK = P.ink, YEL = P.yellow;
  const bones = { 1: J.legL, "-1": J.legR } as Record<string, any>;
  const feet = { 1: J.footL, "-1": J.footR } as Record<string, any>;

  for (const s of [1, -1]) {
    const leg = bones[String(s)];
    const foot = feet[String(s)];
    const hip: [number, number, number] = [s * 0.035, 0.24, 0];
    const ankle: [number, number, number] = [s * 0.035, 0.19, -0.015];
    const perch: [number, number, number] = [s * 0.035, 0.165, -0.02];

    // tarsus
    b.rod(hip, ankle, 0.011, SLATE, { bone: leg, sides: 6 });
    // knee/hip ball to hide seam
    b.part(new THREE.SphereGeometry(0.014, 6, 4), SLATE, { bone: leg, at: hip });
    // ankle knuckle
    b.part(new THREE.SphereGeometry(0.0125, 6, 4), SLATE, { bone: leg, at: ankle });
    // foot segment
    b.rod(ankle, perch, 0.0095, INK, { bone: foot, sides: 6 });

    // yellow band at mid-height
    const mid: [number, number, number] = [s * 0.035, 0.215, -0.0075];
    b.part(new THREE.CylinderGeometry(0.0145, 0.0145, 0.012, 8), YEL, {
      bone: leg,
      at: mid,
      dir: [0, 0.25 * 0 + 0.5, -0.1 * -1 * 0 + 0.0 + 0.001 * 0 + 0.5 * 0 + 0.01 * 0 + 1 * 0 + 0 + 0.0 + 0.0 + 0.0 + 0.0 + 1 * 0 + 0 + 0].map((v, i) => (i === 1 ? 1 : i === 2 ? 0.6 : 0)),
    });

    // toe pad at the perch
    b.part(new THREE.SphereGeometry(0.012, 6, 4), INK, { bone: foot, at: perch });

    // forward toes fanning, wrapping the branch flank
    for (const a of [-20, 0, 20]) {
      const r = a * Math.PI / 180;
      const dx = Math.sin(r) * 0.03;
      const x0 = perch[0];
      const p0: [number, number, number] = [x0, 0.165, -0.02];
      const p1: [number, number, number] = [x0 + dx * 0.6, 0.162, 0.005];
      const p2: [number, number, number] = [x0 + dx, 0.15, 0.028 + Math.cos(r) * 0.005];
      b.sweep([p0, p1, p2], 0.0085, INK, { bone: foot, sides: 6, caps: "round" });
      // claw
      b.spike(p2, [dx * 0.3, -0.7, 0.7], 0.016, 0.007, { color: SLATE, bone: foot });
    }

    // back toe curling round rear
    const q0: [number, number, number] = [perch[0], 0.165, -0.02];
    const q1: [number, number, number] = [perch[0], 0.16, -0.05];
    const q2: [number, number, number] = [perch[0], 0.145, -0.07];
    b.sweep([q0, q1, q2], 0.0085, INK, { bone: foot, sides: 6, caps: "round" });
    b.spike(q2, [0, -0.8, 0.3], 0.015, 0.007, { color: SLATE, bone: foot });
  }
}
    return buildLegsFeet;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "songbirdBranch" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.3,0], dir: [0,1,0], role: "spine" });
  J["head"] = b.joint("head", { parent: J["body"], at: [0,0.37,0.04], dir: [0,0.3,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.41,0.115], dir: [0,0,1], role: "jaw" });
  J["tail"] = b.joint("tail", { parent: J["body"], at: [0,0.32,-0.08], dir: [0,0.45,-1], role: "tail" });
  J["legL"] = b.joint("legL", { parent: J["body"], at: [0.035,0.24,0], dir: [0,-1,0.15], role: "leg" });
  J["legR"] = b.joint("legR", { parent: J["body"], at: [-0.035,0.24,0], dir: [0,-1,0.15], role: "leg" });
  J["footL"] = b.joint("footL", { parent: J["legL"], at: [0.035,0.165,-0.02], dir: [0,-1,0], role: "digit" });
  J["footR"] = b.joint("footR", { parent: J["legR"], at: [-0.035,0.165,-0.02], dir: [0,-1,0], role: "digit" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
