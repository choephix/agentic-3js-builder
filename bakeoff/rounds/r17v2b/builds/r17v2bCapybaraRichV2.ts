import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { countershade, gradient, grain, mix, mottle, paint, resolve, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Capybara with a Bird on its Head",
  description:
    "A plump, sleepy-eyed capybara in storybook style with a little bluebird dozing on its head, a daisy tucked by one ear and a ladybug on its nose.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CINNAMON = "#b9753f";
const CINNAMON_D = "#98592f";
const CINNAMON_L = "#cf9150";
const PEACH = "#ecc592";
const MUZZLE = "#dcae78";
const BLUSH = "#ee9a7e";
const SKIN_DARK = "#6a4229";
const NAIL = "#3d281d";
const NOSE = "#4b2b2a";
const NOSTRIL = "#1f100e";
const EYE = "#1a0f12";
const LID_LINE = "#5a3520";
const WHITE = "#ffffff";
const TOOTH = "#fff0c8";
const INNER_EAR = "#e59a86";
const WHISKER = "#4a3326";
const BIRD_BLUE = "#3f8be0";
const BIRD_BLUE_D = "#2a5bb8";
const BIRD_BLUE_L = "#7cc0f2";
const BIRD_ORANGE = "#f2995a";
const BIRD_CREAM = "#fff5e3";
const BEAK = "#ffb52e";
const BEAK_L = "#f2941d";
const BIRD_LEG = "#f0a25a";
const DAISY = "#fffdf0";
const DAISY_C = "#ffcf30";
const LEAF = "#6dbb55";
const LADY = "#e8362b";
const BLACK = "#241a1c";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const key = (keys: number[][], t: number) => {
  // smooth interpolation through [t, a, b] keys
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const k = smoothstep(keys[i - 1][0], keys[i][0], t);
      return [keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * k, keys[i - 1][2] + (keys[i][2] - keys[i - 1][2]) * k] as [number, number];
    }
  }
  const last = keys[keys.length - 1];
  return [last[1], last[2]] as [number, number];
};

export default function build() {
  const b = createBuilder({ name: "capybara", paintSize: 1024 });
  const random = rng(7);

  // -------------------------------------------------------------------------------------------------------------
  // Paints
  const FUR = grain(mottle(CINNAMON, CINNAMON_L, { size: 0.16, seed: 3, contrast: 0.7 }), CINNAMON_D, {
    size: 0.028,
    axis: "z",
    seed: 5,
  });
  const COAT = countershade(FUR, mottle(PEACH, MUZZLE, { size: 0.1, seed: 9, contrast: 0.6 }), { level: -0.28, soft: 0.3 });
  const HEAD = paint((p, n) => {
    const cheek = Math.hypot(Math.abs(p.x) - 0.105, p.y - 0.46, (p.z - 0.5) * 1.1);
    if (cheek < 0.03 && Math.abs(n.x) > 0.35) return BLUSH;
    const m = smoothstep(0.55, 0.62, p.z);
    if (m <= 0) return COAT;
    return mix(resolve(COAT, p, n), resolve(MUZZLE, p, n), m * 0.85);
  });
  const LEG = (r: number) => gradient(COAT, SKIN_DARK, [0, r + 0.06, 0], [0, 0.045, 0]);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: barrel body, short neck, big blunt head
  const bodyPath = catmull([
    [0, 0.38, -0.4],
    [0, 0.375, -0.24],
    [0, 0.36, -0.04],
    [0, 0.35, 0.17],
    [0, 0.355, 0.3],
  ]);
  const hips = b.joint("hips", { at: [0, 0.375, -0.2], dir: [0, 0, 1], role: "spine" });
  const rootT = bodyPath.closestT(hips.at);
  const front = b.chain("spine", bodyPath.slice(rootT, 1), { parent: hips, count: 3, role: "spine" });
  const back = b.chain("pelvis", bodyPath.slice(rootT, 0), { parent: hips, count: 2, role: "spine" });
  const rumpKeys = [
    [0, 0.17, 0.17],
    [0.06, 0.225, 0.22],
    [0.22, 0.255, 0.24],
    [0.5, 0.262, 0.248],
    [0.76, 0.245, 0.238],
    [0.92, 0.205, 0.205],
    [1, 0.17, 0.17],
  ];
  const body = b.sweep(bodyPath, (t) => key(rumpKeys, t), {
    bone: [back, hips, front],
    color: COAT,
    sides: 14,
    caps: "round",
    name: "body",
  });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.37, 0.24],
      [0, 0.4, 0.31],
      [0, 0.44, 0.37],
    ]),
    { parent: front.joints[2], count: 2, role: "neck" },
  );
  const neckTube = b.sweep(neck, [0.16, 0.14], { color: COAT, sides: 12, name: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1), dir: [0, 0.3, 1], role: "head" });

  const skull = b.loft(
    [
      { at: [0, 0.475, 0.36], w: 0.23, h: 0.22 },
      { at: [0, 0.485, 0.45], w: 0.24, h: 0.225 },
      { at: [0, 0.468, 0.55], w: 0.21, h: 0.19 },
      { at: [0, 0.455, 0.62], w: 0.185, h: 0.16 },
    ],
    { bone: head, color: HEAD, sides: 12, caps: "round", name: "skull" },
  );
  const skin = b.surface(skull);
  const HEADC: [number, number, number] = [0, 0.48, 0.46];

  // Lower jaw: separate, on its own joint
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.4, 0.44],
    aim: [0, 0.375, 0.6],
    role: "jaw",
  });
  b.sweep(
    [
      [0, 0.375, 0.47],
      [0, 0.372, 0.585],
    ],
    (t) => [0.075 - 0.025 * t, 0.042 - 0.008 * t],
    { bone: jaw, color: mottle(PEACH, MUZZLE, { size: 0.08, seed: 4 }), caps: "round", sides: 10, name: "lowerJaw" },
  );

  // Nose, nostrils, teeth
  const tip = skin.ray([0, 0.455, 1], [0, 0, -1])!;
  const nosePad = b.part(new THREE.SphereGeometry(1, 10, 8), NOSE, {
    bone: head,
    at: tip.at.clone().add(V(0, 0.004, -0.012)),
    scale: [0.072, 0.05, 0.042],
    name: "nose",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), NOSTRIL, {
      bone: head,
      at: tip.at.clone().add(V(s * 0.027, 0.011, 0.025)),
      scale: [0.014, 0.01, 0.009],
      name: "nostril",
    });
    b.part(new THREE.SphereGeometry(1, 5, 4), "#8a5a52", {
      bone: head,
      at: tip.at.clone().add(V(s * 0.03, 0.026, 0.018)),
      scale: [0.012, 0.004, 0.006],
      name: "noseShine",
    });
  }
  b.part(new THREE.SphereGeometry(1, 5, 4), "#8a5a52", {
    bone: head,
    at: tip.at.clone().add(V(0, 0.032, 0.012)),
    scale: [0.03, 0.005, 0.01],
    name: "noseBridge",
  });
  for (const s of [1, -1]) {
    const t = skin.ray([s * 0.0125, 0.4, 1], [0, 0, -1])!;
    b.part(new THREE.BoxGeometry(0.019, 0.034, 0.011), TOOTH, {
      bone: head,
      at: t.at.clone().add(V(0, -0.006, -0.004)),
      name: "incisor",
    });
  }

  // Mouth line draped over the muzzle
  const mouth = skin.drape(
    catmull([
      [0.09, 0.405, 0.42],
      [0.082, 0.4, 0.5],
      [0.066, 0.395, 0.58],
      [0.035, 0.392, 0.625],
      [0, 0.392, 0.635],
      [-0.035, 0.392, 0.625],
      [-0.066, 0.395, 0.58],
      [-0.082, 0.4, 0.5],
      [-0.09, 0.405, 0.42],
    ]),
    { lift: 0.002 },
  );
  b.sweep(mouth, 0.0045, { bone: head, color: LID_LINE, sides: 4, name: "mouthLine" });

  // Eyes with sleepy lids
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = skin.around(HEADC).at(s * 68, 16)!;
    const c = hit.at.clone().addScaledVector(hit.n, -0.012);
    const lid = b.joint(`lid${side}`, { parent: head, at: c, dir: hit.n, role: "hinge" });
    b.part(new THREE.SphereGeometry(1, 10, 8), EYE, { bone: head, at: c, scale: 0.03, name: `eye${side}` });
    const hi = c.clone().addScaledVector(hit.n, 0.0235).add(V(0, -0.007, 0.007));
    b.part(new THREE.SphereGeometry(1, 6, 4), WHITE, { bone: head, at: hi, scale: 0.0052, name: `eyeShine${side}` });
    b.part(new THREE.SphereGeometry(1, 5, 4), WHITE, {
      bone: head,
      at: c.clone().addScaledVector(hit.n, 0.021).add(V(s * -0.004, 0.003, -0.012)),
      scale: 0.0026,
      name: `eyeGlint${side}`,
    });
    const lidDir = V(0, 1, 0).addScaledVector(hit.n, 0.55).normalize();
    b.part(new THREE.SphereGeometry(0.0345, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), HEAD, {
      bone: lid,
      at: c,
      dir: lidDir,
      name: `lid${side}`,
    });
    b.part(new THREE.TorusGeometry(0.0346, 0.0026, 4, 12), LID_LINE, {
      bone: lid,
      at: c,
      dir: lidDir,
      axis: "z",
      name: `lidLine${side}`,
    });
    // lashes (three little flicks)
    for (let i = 0; i < 3; i++) {
      const a = (-1 + i) * 0.55;
      const out = V(0, 1, 0)
        .addScaledVector(hit.n, 0.55 + a * 0.0)
        .normalize();
      const base = c.clone().addScaledVector(out, 0.034).add(V(0.0, 0, a * 0.02).multiplyScalar(1));
      b.spike(base, V(s * 0.2 * (1 + i * 0.3), 0.8, a * 0.8 - 0.1), 0.014, 0.0022, { bone: lid, color: LID_LINE, sides: 4, name: `lash${side}` });
    }
    // brow
    const brow = skin.around(HEADC).at(s * 62, 34)!;
    b.sweep(
      catmull([
        brow.at.clone().add(V(s * 0.0, 0.0, 0.03)),
        brow.at.clone().add(V(0, 0.004, 0)),
        brow.at.clone().add(V(0, -0.002, -0.03)),
      ]),
      [0.003, 0.0015],
      { bone: head, color: CINNAMON_D, sides: 4, name: `brow${side}` },
    );
  }

  // Ears
  const ears: Record<string, THREE.Vector3> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = skin.around(HEADC).at(s * 106, 50)!;
    const ear = b.joint(`ear${side}`, { parent: head, at: hit.at, dir: hit.n, role: "hinge" });
    const dir = V(s * 0.7, 0.35, 0.45).normalize();
    ears[side] = hit.at.clone();
    b.part(new THREE.SphereGeometry(1, 8, 6), COAT, {
      bone: ear,
      at: hit.at.clone().addScaledVector(dir, 0.006),
      dir,
      scale: [0.04, 0.016, 0.046],
      name: `ear${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), INNER_EAR, {
      bone: ear,
      at: hit.at.clone().addScaledVector(dir, 0.0145),
      dir,
      scale: [0.027, 0.008, 0.033],
      name: `earInner${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), CINNAMON_D, {
      bone: ear,
      at: hit.at.clone().addScaledVector(dir, 0.0195).add(V(0, -0.006, 0)),
      dir,
      scale: [0.016, 0.004, 0.018],
      name: `earTuft${side}`,
    });
  }

  // Whiskers
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    [
      [52, 2, 0.3],
      [56, 9, 0.5],
      [48, -4, 0.15],
      [58, 16, 0.65],
    ].forEach(([az, el, up], i) => {
      const hit = skin.around([0, 0.455, 0.5]).at(s * az, el)!;
      const out = V(s * 0.8, up * 0.4 - 0.25, 0.5).normalize();
      const end = hit.at.clone().addScaledVector(out, 0.1);
      const mid = hit.at.clone().addScaledVector(out, 0.05).add(V(0, 0.012, 0.012));
      b.sprout(`whisker${side}${i + 1}`, hit, bezier(hit, mid, end), [0.0035, 0.0008], {
        count: 0,
        color: WHISKER,
        sides: 4,
        caps: "point",
      });
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs and feet
  function foot(side: string, s: number, ankle: { at: THREE.Vector3 }, ankleJoint: Parameters<typeof b.chain>[2] extends infer _ ? any : never, toes: number) {
    const x = ankle.at.x;
    const z = ankle.at.z;
    b.part(new THREE.SphereGeometry(1, 10, 6), SKIN_DARK, {
      bone: ankleJoint,
      at: [x, 0.03, z + 0.022],
      scale: [0.052, 0.034, 0.064],
      name: `pad${side}`,
    });
    for (let i = 0; i < toes; i++) {
      const off = (i - (toes - 1) / 2) * (toes === 4 ? 0.028 : 0.034);
      const base = V(x + off, 0.021, z + 0.068);
      const end = V(x + off * 1.35, 0.019, z + 0.108);
      const toe = b.chain(`toe${toes === 4 ? "F" : "B"}${i + 1}${side}`, [base, end], {
        parent: ankleJoint,
        role: "digit",
        names: [`toe${toes === 4 ? "F" : "B"}${i + 1}${side}`],
      });
      b.sweep(toe, 0.0185, { color: SKIN_DARK, sides: 7, name: `toe${side}` });
      b.spike(toe.at(1), toe.at(1), 0.02, 0.0135, { color: NAIL, sides: 6, name: `nail${side}` });
    }
  }

  const legSweeps: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // forelegs
    const fPts = limb([s * 0.165, 0.31, 0.17], [s * 0.17, 0.05, 0.21], [0.14, 0.14], [[0, 0, -1]]);
    const fLeg = b.chain(`legF${side}`, fPts, {
      parent: front.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      contact: [s * 0.17, 0, 0.24],
    });
    legSweeps.push(b.sweep(fLeg, [0.085, 0.07, 0.048], { color: LEG(0.1), sides: 10, name: `foreleg${side}` }));
    foot(`${side}f`, s, fLeg.tip!, fLeg.tip!, 4);

    // hind legs
    const hPts = limb([s * 0.17, 0.32, -0.2], [s * 0.18, 0.05, -0.25], [0.13, 0.13, 0.08], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hLeg = b.chain(`legH${side}`, hPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.18, 0, -0.22],
    });
    legSweeps.push(b.sweep(hLeg, [0.1, 0.085, 0.06, 0.047], { color: LEG(0.12), sides: 10, name: `hindleg${side}` }));
    foot(`${side}b`, s, hLeg.tip!, hLeg.tip!, 3);
    // haunch
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: hips,
      at: [s * 0.19, 0.27, -0.22],
      scale: [0.095, 0.15, 0.16],
      name: `haunch${side}`,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Fur cards: tufts with darker tips, tinted by the coat paint
  const tuft = svg(
    `<svg viewBox="0 0 40 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#e4e4e4"/><stop offset="1" stop-color="#9a9a9a"/></linearGradient></defs>
    <path d="M2 64 Q5 30 11 2 Q18 30 20 64Z" fill="url(#g)"/>
    <path d="M12 64 Q18 24 27 0 Q32 30 34 64Z" fill="url(#g)"/>
    <path d="M22 64 Q30 34 38 12 Q38 40 38 64Z" fill="url(#g)"/></svg>`,
    { size: 128 },
  );
  const bodyHits = b.surface(body).scatter(420, { rng: rng(11), minDist: 0.04, filter: (h) => h.n.y > -0.25 });
  b.cards(bodyHits, tuft, {
    size: [0.05, 0.062],
    lean: 62,
    bend: 25,
    vary: 0.3,
    spin: 18,
    rng: rng(12),
    color: COAT,
    flow: [0, -0.3, -1],
    name: "bodyFur",
  });
  const neckHits = b.surface(neckTube).scatter(50, { rng: rng(13), minDist: 0.04, filter: (h) => h.n.y > -0.2 });
  b.cards(neckHits, tuft, { size: [0.042, 0.052], lean: 60, bend: 25, vary: 0.25, rng: rng(14), color: COAT, name: "neckFur" });
  const cheekHits = skin.scatter(70, {
    rng: rng(15),
    minDist: 0.032,
    filter: (h) => h.at.z < 0.5 && h.n.y < 0.75 && h.n.y > -0.2 && Math.abs(h.n.x) > 0.3,
  });
  b.cards(cheekHits, tuft, {
    size: [0.03, 0.04],
    lean: 66,
    bend: 20,
    vary: 0.25,
    rng: rng(16),
    color: HEAD,
    flow: [0, -0.2, -1],
    name: "cheekFur",
  });
  const chinHits = skin.scatter(26, {
    rng: rng(17),
    minDist: 0.03,
    filter: (h) => h.n.y < -0.35 && h.at.z > 0.42 && h.at.z < 0.6,
  });
  b.cards(chinHits, tuft, { size: [0.028, 0.034], lean: 70, bend: 15, rng: rng(18), color: PEACH, flow: [0, -0.2, 1], name: "chinFur" });
  for (const sw of legSweeps) {
    const hits = b.surface(sw).scatter(16, { rng: rng(19), minDist: 0.04, filter: (h) => h.n.y > -0.2 });
    b.cards(hits, tuft, { size: [0.032, 0.04], lean: 65, bend: 15, vary: 0.2, rng: rng(20), color: LEG(0.1), name: "legFur" });
  }
  // tiny rump nub of fur where a tail would be
  const nub = b.surface(body).around([0, 0.375, -0.2]).at(180, 8)!;
  b.stick(new THREE.SphereGeometry(0.03, 8, 6), CINNAMON_D, nub, { embed: 0.5, name: "tailNub" });

  // -------------------------------------------------------------------------------------------------------------
  // Daisy tucked beside the left ear, with two leaves
  {
    const hit = skin.around(HEADC).at(78, 64)!;
    const petals: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 10; i++) {
      const g = new THREE.SphereGeometry(1, 6, 4);
      g.scale(0.0065, 0.0022, 0.0165);
      g.translate(0, 0, 0.0185);
      g.rotateY((i * Math.PI * 2) / 10);
      petals.push(g);
    }
    const flower = mergeGeometries(petals);
    if (!flower) throw new Error("daisy petals did not merge");
    b.part(flower, DAISY, { bone: head, at: hit.at.clone().addScaledVector(hit.n, 0.008), dir: hit.n, name: "daisy" });
    b.part(new THREE.SphereGeometry(1, 8, 5), DAISY_C, {
      bone: head,
      at: hit.at.clone().addScaledVector(hit.n, 0.0115),
      dir: hit.n,
      scale: [0.0105, 0.0065, 0.0105],
      name: "daisyCentre",
    });
    const leaves: THREE.BufferGeometry[] = [];
    for (const a of [210, 320, 95]) {
      const g = new THREE.SphereGeometry(1, 6, 4);
      g.scale(0.0075, 0.0018, 0.019);
      g.translate(0, 0, 0.027);
      g.rotateY((a * Math.PI) / 180);
      leaves.push(g);
    }
    const lf = mergeGeometries(leaves);
    if (!lf) throw new Error("daisy leaves did not merge");
    b.part(lf, LEAF, { bone: head, at: hit.at.clone().addScaledVector(hit.n, 0.003), dir: hit.n, name: "daisyLeaves" });
  }

  // Ladybug on the nose
  {
    const hit = skin.ray([0, 1, 0.585], [0, -1, 0])!;
    const c = hit.at.clone().add(V(0, 0.004, 0));
    const body2 = new THREE.SphereGeometry(1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    b.part(body2, LADY, { bone: head, at: c, scale: [0.0125, 0.0105, 0.0155], name: "ladybug" });
    b.part(new THREE.SphereGeometry(1, 6, 4), BLACK, {
      bone: head,
      at: c.clone().add(V(0, 0.001, 0.0155)),
      scale: [0.007, 0.0055, 0.0055],
      name: "ladybugHead",
    });
    b.part(new THREE.BoxGeometry(0.0012, 0.0012, 0.028), BLACK, {
      bone: head,
      at: c.clone().add(V(0, 0.0102, -0.0005)),
      name: "ladybugSeam",
    });
    for (const [dx, dz] of [
      [0.006, 0.004],
      [-0.006, 0.004],
      [0.0075, -0.006],
      [-0.0075, -0.006],
    ]) {
      const hgt = 0.0105 * Math.sqrt(Math.max(0, 1 - (dx / 0.0125) ** 2 - (dz / 0.0155) ** 2));
      b.part(new THREE.SphereGeometry(1, 5, 4), BLACK, {
        bone: head,
        at: c.clone().add(V(dx, hgt * 0.96, dz)),
        scale: 0.0026,
        name: "ladybugDot",
      });
    }
    for (const s of [1, -1])
      b.spike(c.clone().add(V(s * 0.003, 0.003, 0.02)), V(s * 0.5, 0.5, 1), 0.01, 0.0007, {
        bone: head,
        color: BLACK,
        sides: 3,
        name: "ladybugAntenna",
      });
  }

  // -------------------------------------------------------------------------------------------------------------
  // The bluebird, dozing on the crown of the head
  {
    const top = skin.ray([0, 1, 0.45], [0, -1, 0])!;
    const O = top.at.clone();
    const bc = O.clone().add(V(0, 0.066, -0.004));
    const birdBody = b.joint("birdBody", { parent: head, at: bc, dir: [0, 0.3, 1], role: "spine" });

    const BIRD_COAT = paint((_p, n) => {
      if (n.y > 0.25) return BIRD_BLUE;
      if (n.z > 0.1 && n.y > -0.55) return BIRD_ORANGE;
      return BIRD_CREAM;
    });
    b.part(new THREE.SphereGeometry(1, 12, 9), BIRD_COAT, {
      bone: birdBody,
      at: bc,
      rotation: [-22, 0, 0],
      scale: [0.054, 0.056, 0.07],
      name: "birdBody",
    });

    // head
    const hc = bc.clone().add(V(0, 0.046, 0.044));
    const bh = b.joint("birdHead", { parent: birdBody, at: hc, dir: [0, 0.1, 1], role: "head" });
    const BIRD_HEAD = paint((_p, n) => (n.y > 0.15 || n.z < -0.2 ? BIRD_BLUE : n.z > 0.25 && n.y > -0.2 ? BIRD_CREAM : BIRD_BLUE_L));
    b.part(new THREE.SphereGeometry(1, 12, 9), BIRD_HEAD, {
      bone: bh,
      at: hc,
      scale: [0.041, 0.039, 0.04],
      name: "birdHeadBall",
    });
    // beak
    const bj = b.joint("beakLow", { parent: bh, at: hc.clone().add(V(0, -0.012, 0.03)), dir: [0, -0.1, 1], role: "jaw" });
    b.part(new THREE.ConeGeometry(0.0145, 0.04, 6), BEAK, {
      bone: bh,
      at: hc.clone().add(V(0, -0.001, 0.056)),
      dir: [0, -0.12, 1],
      scale: [1, 1, 0.75],
      name: "beakUpper",
    });
    b.part(new THREE.ConeGeometry(0.011, 0.03, 6), BEAK_L, {
      bone: bj,
      at: hc.clone().add(V(0, -0.0105, 0.048)),
      dir: [0, 0.02, 1],
      scale: [1, 1, 0.6],
      name: "beakLower",
    });
    // eyes
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const e = hc.clone().add(V(s * 0.03, 0.006, 0.024));
      b.part(new THREE.SphereGeometry(1, 7, 5), BLACK, { bone: bh, at: e, scale: 0.0082, name: `birdEye${side}` });
      b.part(new THREE.SphereGeometry(1, 5, 4), WHITE, {
        bone: bh,
        at: e.clone().add(V(s * 0.0045, 0.004, 0.004)),
        scale: 0.0029,
        name: `birdEyeShine${side}`,
      });
      b.part(new THREE.SphereGeometry(1, 6, 4), "#ff9f98", {
        bone: bh,
        at: hc.clone().add(V(s * 0.0345, -0.012, 0.012)),
        scale: [0.004, 0.0085, 0.0085],
        name: `birdBlush${side}`,
      });
    }
    // little crest
    for (const [dx, dz, ln] of [
      [0, -0.004, 0.026],
      [0.007, -0.002, 0.02],
      [-0.007, -0.002, 0.02],
    ]) {
      b.spike(hc.clone().add(V(dx, 0.034, dz)), V(dx * 3, 1, -0.9), ln, 0.0058, {
        bone: bh,
        color: BIRD_BLUE_D,
        sides: 5,
        name: "birdCrest",
      });
    }

    // tail
    const tail = b.chain(
      "tail",
      catmull([
        bc.clone().add(V(0, -0.005, -0.056)),
        bc.clone().add(V(0, -0.02, -0.098)),
        bc.clone().add(V(0, -0.037, -0.14)),
      ]),
      { parent: birdBody, names: ["tail1", "tail2"], role: "tail" },
    );
    b.sweep(tail, (t) => [0.018 + 0.012 * Math.sin(Math.min(t * 1.2, 1) * Math.PI * 0.9), 0.0045], {
      bands: [
        [0.78, BIRD_BLUE_D],
        [1, "#1d3f85"],
      ],
      sides: 8,
      caps: "round",
      name: "birdTail",
    });
    for (const s of [1, -1]) {
      const p0 = bc.clone().add(V(0, -0.012, -0.06));
      const dir = V(s * 0.28, -0.22, -1).normalize();
      b.sweep([p0, p0.clone().addScaledVector(dir, 0.1)], (t) => [0.011 + 0.01 * Math.sin(Math.min(t * 1.4, 1) * 2.2), 0.004], {
        bone: tail.joints[0],
        color: BIRD_BLUE_D,
        sides: 6,
        caps: "round",
        name: "birdTailSide",
      });
    }

    // wings
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const root = bc.clone().add(V(s * 0.043, 0.022, 0.02));
      const wing = b.joint(`wing${side}`, { parent: birdBody, at: root, aim: root.clone().add(V(0, -0.02, -1)), role: "wing" });
      const WING = paint((_p, _n, st) => {
        const x = st[0];
        const y = st[1];
        if (x > 0.095 && y < -0.01) return BIRD_CREAM;
        if (x > 0.045 && y < 0.0) return Math.floor((x * 1.0 - y * 1.4) / 0.011) % 2 === 0 ? BIRD_BLUE_D : "#234e9e";
        return y > -0.004 ? BIRD_BLUE : BIRD_BLUE_D;
      });
      b.extrude(
        [
          [0, 0.026],
          [0.035, 0.034],
          [0.075, 0.012],
          [0.118, -0.03, "sharp"],
          [0.07, -0.034],
          [0.02, -0.03],
          [-0.006, 0.0],
        ],
        {
          at: root.clone().add(V(0, 0.002, 0.012)),
          x: [0, -0.1, -1],
          y: [-s * 0.08, 1, 0],
          thickness: [0.012, 0.005],
          bevel: 0.003,
          smoothing: 1,
          color: WING,
          bone: wing,
          name: `wing${side}`,
        },
      );
    }

    // legs and feet
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const fx = s * 0.022;
      const ft = skin.ray([fx, 1, 0.455], [0, -1, 0])!;
      const f = ft.at.clone();
      const leg = b.chain(`birdLeg${side}`, [bc.clone().add(V(fx, -0.034, 0.008)), f.clone().add(V(0, 0.006, 0))], {
        parent: birdBody,
        role: "leg",
        names: [`birdLeg${side}`],
        contact: [f.x, f.y, f.z],
      });
      b.sweep(leg, 0.0042, { color: BIRD_LEG, sides: 5, name: `birdLeg${side}` });
      [
        [-0.007, 0.024],
        [0, 0.028],
        [0.007, 0.024],
        [0, -0.016],
      ].forEach(([dx, dz], i) => {
        const base = f.clone().add(V(0, 0.003, 0));
        const toe = b.chain(`birdToe${i + 1}${side}`, [base, base.clone().add(V(dx, 0, dz))], {
          parent: leg.joints[0],
          role: "digit",
          names: [`birdToe${i + 1}${side}`],
        });
        b.sweep(toe, 0.0033, { color: BIRD_LEG, sides: 5, name: `birdToe${side}` });
      });
    }
    // a few fluffy chest/back feathers as little cards
    const featherTex = svg(
      `<svg viewBox="0 0 24 40"><path d="M12 40 Q2 20 12 0 Q22 20 12 40Z" fill="#ffffff"/><path d="M12 36 L12 6" stroke="#cfcfcf" stroke-width="2"/></svg>`,
      { size: 96 },
    );
    const bb = b.surface(b.root.getObjectByName("birdBody") as THREE.Mesh);
    const hitsB = bb.scatter(24, { rng: rng(41), minDist: 0.022, filter: (h) => h.n.y < 0.4 && h.n.z > -0.3 });
    b.cards(hitsB, featherTex, { size: [0.016, 0.022], lean: 70, bend: 20, rng: rng(42), color: BIRD_ORANGE, name: "birdFluff" });
  }

  void offset;
  void random;
  return b.root;
}
