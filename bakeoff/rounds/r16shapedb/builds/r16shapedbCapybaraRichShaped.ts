import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  limb,
  mix,
  noise,
  offset,
  paint,
  rng,
  smoothstep,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Capybara with a Bird",
  description:
    "A chubby, serene whimsical capybara with a blocky blunt muzzle, rosy cheeks, buck teeth and a daisy behind its ear, a fuzzy faceted coat and stubby legs, with a tiny round bluebird perched on its head.",
};

// ---- palette ---------------------------------------------------------------------------------------------------
const FUR_TOP = "#a9693a";
const FUR_MID = "#c98a4f";
const FUR_LIGHT = "#e8bc82";
const FUR_DEEP = "#7a4326";
const NOSE = "#3a2218";
const NOSE_HI = "#74483a";
const NOSTRIL = "#180d09";
const EAR_IN = "#e29a86";
const TOOTH = "#fff2d2";
const NAIL = "#3a2418";
const FOOT = "#8c5836";
const WHISKER = "#4a2c1e";
const BLUE = "#4fb6e6";
const BLUE_DARK = "#2f7ec6";
const BLUE_NAVY = "#1f4f8f";
const BLUE_LIGHT = "#a4def6";
const CREAM = "#fff0cf";
const BEAK = "#ffa23a";
const BEAK_DARK = "#e7701d";
const LEG = "#f08a3a";
const BLUSH_BIRD = "#ff8f86";
const PETAL = "#ffffff";
const PETAL_EDGE = "#ffe9f0";
const DAISY_C = "#ffcc33";
const LEAF = "#6cc06a";

// ---- paints ------------------------------------------------------------------------------------------------------
const streak = new THREE.Vector3();
// Warm back, pale belly, cloudy darker mottles and fine streaks along the body.
const COAT = paint((p, n) => {
  const up = smoothstep(-0.55, 0.55, n.y);
  const back = mix(FUR_MID, FUR_TOP, up);
  let c = mix(FUR_LIGHT, back, smoothstep(-0.75, -0.1, n.y));
  c = mix(c, FUR_DEEP, 0.3 * smoothstep(0.56, 0.82, noise(p, 0.075, 5)));
  streak.set(p.x * 4, p.y * 4, p.z);
  c = mix(c, FUR_LIGHT, 0.14 * smoothstep(0.55, 0.8, noise(streak, 0.03, 9)));
  return c;
});
// Bird: blue back, cream belly.
const BIRD_BODY = paint((_p, n) => {
  const back = mix(BLUE, BLUE_LIGHT, 0.55 * smoothstep(0.55, 1, n.y));
  return mix(CREAM, back, smoothstep(-0.05, 0.45, n.y));
});
// Bird head: blue cap with a cream face.
const BIRD_HEAD = paint((_p, n) => mix(CREAM, mix(BLUE, BLUE_LIGHT, 0.4 * smoothstep(0.6, 1, n.y)), smoothstep(0.05, 0.5, n.y)));

// ---- drawings ----------------------------------------------------------------------------------------------------
// Sleepy-sweet capybara eye: dark almond, warm iris, heavy lid, two glints.
const EYE = svg(
  `<svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="c"><ellipse cx="32" cy="38" rx="28" ry="31"/></clipPath></defs>
    <ellipse cx="32" cy="38" rx="28" ry="31" fill="#2a140d"/>
    <g clip-path="url(#c)">
      <ellipse cx="32" cy="44" rx="22" ry="25" fill="#6a3a1c"/>
      <ellipse cx="32" cy="50" rx="17" ry="17" fill="#b06a30"/>
      <ellipse cx="32" cy="40" rx="12" ry="15" fill="#160a07"/>
      <path d="M0 0 H64 V30 Q32 15 0 30 Z" fill="#b9733f"/>
    </g>
    <path d="M3 31 Q32 13 61 31" stroke="#2a140d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M58 30 L65 24" stroke="#2a140d" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="22" cy="42" rx="7" ry="8.5" fill="#ffffff"/>
    <circle cx="42" cy="55" r="3.6" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

// Cat-like smile with a little dimple at each end.
const MOUTH = svg(
  `<svg viewBox="0 0 100 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 2 L50 14" stroke="#3a2016" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M50 14 Q39 31 17 20 M50 14 Q61 31 83 20" stroke="#3a2016" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M14 22 L8 14 M86 22 L92 14" stroke="#3a2016" stroke-width="3.8" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 512 },
);

// Rosy cheek with three blush slashes.
const BLUSH = svg(
  `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="20" rx="27" ry="16" fill="#f59a86"/>
    <path d="M14 27 L20 12 M25 29 L31 14 M36 29 L42 14" stroke="#f0707a" stroke-width="3.6" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 192 },
);

// Glossy bird eye.
const BIRD_EYE = svg(
  `<svg viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="25" cy="31" rx="21" ry="26" fill="#1c1018"/>
    <ellipse cx="25" cy="38" rx="14" ry="14" fill="#3a2234"/>
    <ellipse cx="18" cy="21" rx="9" ry="10.5" fill="#ffffff"/>
    <circle cx="33" cy="43" r="4.2" fill="#ffffff"/>
    <path d="M6 12 L1 5 M12 6 L10 -1" stroke="#1c1018" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 192 },
);

// Fur tuft: grey, so the card colour (the coat paint) tints it. Dark root, bright tip.
const TUFT = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#7c7c7c"/><stop offset="0.55" stop-color="#d4d4d4"/><stop offset="1" stop-color="#ffffff"/>
    </linearGradient></defs>
    <path d="M16 0 C21 12 31 28 29 48 L3 48 C1 28 11 12 16 0 Z" fill="url(#g)"/>
    <path d="M16 14 C18 24 22 36 21 48 L13 48 C12 36 14 24 16 14 Z" fill="#bdbdbd"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const YAX = V(0, 1, 0);

  type J = ReturnType<typeof b.joint>;
  type Col = ReturnType<typeof paint> | string;
  type PartOpts = NonNullable<Parameters<typeof b.part>[2]>;
  type PointIn = THREE.Vector3 | number[];

  // A unit sphere scaled into an ellipsoid and placed on a bone.
  const ell = (r: [number, number, number], color: Col, at: PointIn, bone: J, o: PartOpts = {}, seg: [number, number] = [10, 7]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { flat: true, ...o, at, bone, scale: r });

  // The outermost surface point seen from a centre at azimuth/elevation.
  const hitAt = (skin: ReturnType<typeof b.surface>, c: THREE.Vector3, az: number, el: number) => {
    const h = skin.around(c).at(az, el);
    if (!h) throw new Error(`capybara: no surface at az ${az} el ${el}`);
    return h;
  };

  // ---- skeleton -------------------------------------------------------------------------------------------------
  const HY = 0.45; // height of the skull centre
  const HC = V(0, HY, 0.5);

  const hips = b.joint("hips", { at: [0, 0.33, -0.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.33, -0.4],
      [0, 0.35, -0.17],
      [0, 0.36, 0.04],
      [0, 0.355, 0.24],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.355, 0.2],
      [0, 0.385, 0.29],
      [0, HY - 0.04, 0.375],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, HY - 0.04, 0.375], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, HY - 0.08, 0.54], aim: [0, HY - 0.085, 0.78], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.33, -0.56],
      [0, 0.32, -0.62],
      [0, 0.3, -0.67],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );

  // ---- body -----------------------------------------------------------------------------------------------------
  const keys = (ks: number[]) => (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (ks.length - 1);
    const i = Math.min(Math.floor(x), ks.length - 2);
    const f = x - i;
    return ks[i] + (ks[i + 1] - ks[i]) * f * f * (3 - 2 * f);
  };
  const RX = keys([0.2, 0.228, 0.24, 0.232, 0.2]);
  const RY = keys([0.2, 0.225, 0.235, 0.228, 0.2]);
  const body = b.sweep(spine, (t) => [RX(t), RY(t)], { sides: 10, smooth: false, caps: "round", color: COAT });
  b.sweep(neck, [0.16, 0.145], { sides: 10, smooth: false, caps: "round", color: COAT });
  b.sweep(tail, [0.045, 0.02], { sides: 6, smooth: false, caps: "round", color: FUR_DEEP });

  // ---- legs -----------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front: elbow tucks back
    const fp = limb(V(s * 0.15, 0.27, 0.12), V(s * 0.16, 0.055, 0.15), [0.13, 0.12], [[0, 0, -1]]);
    const front = b.chain(`legF${side}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      contact: [s * 0.16, 0, 0.17],
    });
    b.sweep(front, [0.085, 0.072, 0.062], { sides: 8, smooth: false, caps: "round", color: COAT });
    ell([0.1, 0.13, 0.14], COAT, V(s * 0.14, 0.3, 0.12), front.joints[0]);
    // hind: knee forward
    const hp = limb(V(s * 0.15, 0.28, -0.3), V(s * 0.16, 0.055, -0.33), [0.15, 0.12], [[0, 0, 1]]);
    const hind = b.chain(`legH${side}`, hp, {
      parent: spine.joints[0],
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.16, 0, -0.31],
    });
    b.sweep(hind, [0.09, 0.075, 0.062], { sides: 8, smooth: false, caps: "round", color: COAT });
    ell([0.12, 0.15, 0.17], COAT, V(s * 0.12, 0.32, -0.3), hind.joints[0]);

    // feet: a flat pad, little webbed toes and dark nails
    for (const [leg, z, toes] of [
      [front, 0.15, 4],
      [hind, -0.33, 3],
    ] as const) {
      const bone = leg.joints[2];
      const x = s * 0.16;
      ell([0.066, 0.04, 0.085], FOOT, V(x, 0.04, z + 0.03), bone, {}, [8, 6]);
      for (let i = 0; i < toes; i++) {
        const tx = x + (i - (toes - 1) / 2) * (toes === 4 ? 0.032 : 0.04);
        ell([0.02, 0.019, 0.028], FOOT, V(tx, 0.03, z + 0.098), bone, {}, [6, 5]);
        ell([0.014, 0.011, 0.013], NAIL, V(tx, 0.025, z + 0.124), bone, {}, [6, 4]);
      }
    }
  }

  // ---- head -----------------------------------------------------------------------------------------------------
  const skull = ell([0.135, 0.13, 0.15], COAT, HC, head, {}, [12, 8]);
  const cheeks = [1, -1].map((s) => ell([0.065, 0.055, 0.09], COAT, V(s * 0.1, HY - 0.04, 0.555), head, {}, [9, 6]));
  // big blunt box muzzle
  const snout = b.frustumBox([0, HY - 0.015, 0.5], [0, HY - 0.035, 0.8], [0.24, 0.19], [0.21, 0.15], {
    bone: head,
    color: COAT,
  });
  // nose bump (the capybara's morrillo) with glossy top and nostrils
  const NC = V(0, HY + 0.055, 0.775);
  const nose = ell([0.1, 0.065, 0.062], NOSE, NC, head, {}, [10, 7]);
  ell([0.05, 0.014, 0.03], NOSE_HI, V(0, HY + 0.113, 0.785), head, {}, [8, 5]);
  const noseSkin = b.surface(nose);
  for (const s of [1, -1]) {
    const hit = hitAt(noseSkin, NC, s * 24, 40);
    b.stick(new THREE.SphereGeometry(1, 6, 4), NOSTRIL, hit, { scale: [0.014, 0.012, 0.024], embed: 0.4, flat: true });
  }
  // lower jaw (own bone) with a chubby chin
  b.frustumBox([0, HY - 0.075, 0.53], [0, HY - 0.08, 0.76], [0.19, 0.07], [0.17, 0.06], { bone: jaw, color: COAT });
  ell([0.07, 0.032, 0.06], COAT, V(0, HY - 0.108, 0.7), jaw, {}, [8, 5]);
  // buck teeth
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.018, 0.03, 0.01), TOOTH, { at: [s * 0.011, HY - 0.082, 0.803], bone: head });
  // smile
  b.decal(snout, MOUTH, {
    at: [0, HY - 0.055, 0.95],
    dir: [0, 0, 1],
    size: [0.2, 0.076],
    segments: [16, 6],
    lift: 0.002,
  });
  // whiskers
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      const base = V(s * 0.1, HY - 0.012 - 0.014 * i, 0.77);
      const tip = base.clone().add(V(s * 0.095, 0.03 - 0.03 * i, -0.04));
      b.rod(base, tip, [0.004, 0.0015], WHISKER, { bone: head, sides: 4 });
    }

  // eyes, blush
  for (const s of [1, -1]) {
    const d = V(s * 0.8, 0.44, 0.42).normalize();
    b.decal(skull, EYE, {
      at: HC.clone().addScaledVector(d, 0.22),
      dir: d,
      size: [0.056, 0.064],
      segments: [10, 10],
      lift: 0.002,
    });
    const cd = V(s, 0.1, 0.25).normalize();
    b.decal(cheeks[s > 0 ? 0 : 1], BLUSH, {
      at: V(s * 0.1, HY - 0.04, 0.555).addScaledVector(cd, 0.2),
      dir: cd,
      size: [0.062, 0.04],
      segments: [10, 8],
      lift: 0.002,
    });
  }

  // ears: small rounded flaps, pink inside
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const h = hitAt(skullSkin, HC, s * 128, 40);
    const origin = offset(h.at, h.n, -0.012);
    b.extrude(
      [
        [-0.028, 0],
        [0.028, 0],
        [0.04, 0.04],
        [0, 0.078],
        [-0.04, 0.04],
      ],
      { at: origin, x: [0, 0, -s], y: [s * 0.45, 1, 0], thickness: 0.014, bevel: 0.004, smoothing: 2, color: COAT, bone: head },
    );
    b.extrude(
      [
        [-0.016, 0.008],
        [0.016, 0.008],
        [0.024, 0.038],
        [0, 0.058],
        [-0.024, 0.038],
      ],
      {
        at: offset(origin, [s, 0, 0], 0.007),
        x: [0, 0, -s],
        y: [s * 0.45, 1, 0],
        thickness: 0.01,
        smoothing: 2,
        color: EAR_IN,
        bone: head,
      },
    );
  }

  // a daisy tucked on the left side of the head
  {
    const h = hitAt(skullSkin, HC, 95, 32);
    const c = h.moved([0, 0.006, 0]);
    b.ring(c, { count: 10, radius: 0.007 }, (item) =>
      b.stick(new THREE.SphereGeometry(1, 6, 4), item.i % 2 ? PETAL : PETAL_EDGE, item, {
        scale: [0.0062, 0.013, 0.0026],
        embed: 0.2,
        flat: true,
      }),
    );
    b.stick(new THREE.SphereGeometry(1, 7, 5), DAISY_C, c, { scale: [0.009, 0.007, 0.009], embed: 0.2, flat: true });
    for (const k of [-1, 1])
      b.stick(new THREE.SphereGeometry(1, 6, 4), LEAF, h.moved([0, -0.002, 0]), {
        scale: [0.006, 0.02, 0.0025],
        embed: 0.1,
        spin: 90 + k * 55,
        flat: true,
      });
  }

  // ---- fur ------------------------------------------------------------------------------------------------------
  const bodyHits = b.surface(body).scatter(260, {
    rng: rand,
    minDist: 0.045,
    filter: (h) => h.n.y > -0.45 && h.at.z > -0.56,
  });
  b.cards(bodyHits, TUFT, { size: [0.04, 0.065], lean: 70, bend: 25, vary: 0.3, rng: rand, color: COAT });
  const cheekHits = b.surface([...cheeks, skull]).scatter(70, {
    rng: rand,
    minDist: 0.03,
    filter: (h) => (h.n.z < -0.2 || h.n.y < -0.35) && h.at.y < HY + 0.05,
  });
  b.cards(cheekHits, TUFT, { size: [0.03, 0.045], lean: 65, bend: 20, vary: 0.3, rng: rand, color: COAT });
  // a soft nest of fuzz under the bird's feet
  const nestHits = skullSkin.scatter(16, {
    rng: rand,
    minDist: 0.022,
    filter: (h) => h.n.y > 0.8 && Math.hypot(h.at.x, h.at.z - 0.5) < 0.09,
  });
  b.cards(nestHits, TUFT, { size: [0.026, 0.04], lean: 50, bend: 15, vary: 0.3, rng: rand, color: COAT });

  // ---- the bird -------------------------------------------------------------------------------------------------
  const ANG = 0.4; // the bird turns a little toward the capybara's left
  const ANGD = (ANG * 180) / Math.PI;
  const BO = V(0, HY + 0.13 - 0.002, 0.5);
  const bp = (x: number, y: number, z: number) => V(x, y, z).applyAxisAngle(YAX, ANG).add(BO);
  const bd = (x: number, y: number, z: number) => V(x, y, z).applyAxisAngle(YAX, ANG);
  const yaw: [number, number, number] = [0, ANGD, 0];

  const bird = b.joint("bird", { parent: head, at: bp(0, 0.06, 0), dir: [0, 1, 0] });
  const birdHead = b.joint("birdHead", { parent: bird, at: bp(0, 0.12, 0.03), dir: [0, 1, 0] });
  const beakLower = b.joint("beakLower", {
    parent: birdHead,
    at: bp(0, 0.114, 0.07),
    aim: bp(0, 0.112, 0.1),
    role: "jaw",
  });
  const birdTail = b.joint("birdTail", { parent: bird, at: bp(0, 0.078, -0.05), dir: bd(0, -0.12, -1), role: "tail" });

  ell([0.062, 0.056, 0.068], BIRD_BODY, bp(0, 0.085, -0.004), bird, { flat: false, rotation: yaw }, [12, 8]);
  const bHeadC = bp(0, 0.135, 0.03);
  const bHead = ell([0.05, 0.048, 0.05], BIRD_HEAD, bHeadC, birdHead, { flat: false, rotation: yaw }, [12, 8]);

  // beak: upper and lower halves
  b.spike(bp(0, 0.13, 0.066), bp(0, 0.122, 0.108), null, 0.016, { color: BEAK, bone: birdHead, sides: 6 });
  b.spike(bp(0, 0.116, 0.066), bp(0, 0.114, 0.097), null, 0.012, { color: BEAK_DARK, bone: beakLower, sides: 6 });

  const birdSkin = b.surface(bHead);
  for (const s of [1, -1]) {
    const d = bd(s * 0.78, 0.25, 0.57).normalize();
    b.decal(bHead, BIRD_EYE, {
      at: bHeadC.clone().addScaledVector(d, 0.15),
      dir: d,
      size: [0.027, 0.033],
      segments: [8, 8],
      lift: 0.001,
    });
    const cheek = hitAt(birdSkin, bHeadC, ANGD + s * 70, -16);
    b.stick(new THREE.SphereGeometry(1, 6, 4), BLUSH_BIRD, cheek, { scale: [0.013, 0.004, 0.009], embed: 0.3, flat: true });
  }

  // crest of three curled feathers
  for (let i = -1; i <= 1; i++) {
    const hgt = i === 0 ? 0.052 : 0.038;
    const p0 = bp(i * 0.014, 0.178, 0.012);
    const p1 = bp(i * 0.022, 0.178 + hgt * 0.9, 0.0);
    const p2 = bp(i * 0.032, 0.178 + hgt, 0.034);
    b.sweep(bezier(p0, p1, p2), [0.011, 0.002], {
      bone: birdHead,
      color: i === 0 ? BLUE_DARK : BLUE,
      caps: { start: "flat", end: "point" },
      sides: 5,
      smooth: false,
    });
  }

  // wings: a rounded covert plus three flight feathers
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const W = bp(s * 0.063, 0.1, -0.005);
    const dw = bd(s * 0.22, -0.3, -1).normalize();
    const wj = b.joint(`birdWing${side}`, { parent: bird, at: W, dir: dw, role: "wing" });
    ell([0.014, 0.05, 0.034], BLUE_DARK, W.clone().addScaledVector(dw, 0.03), wj, { dir: dw, flat: false }, [8, 6]);
    for (let i = 0; i < 3; i++) {
      const dir = dw.clone().applyAxisAngle(YAX, (i - 1) * 0.17 * s);
      const a = W.clone().addScaledVector(dw, 0.06);
      const tip = a.clone().addScaledVector(dir, 0.05 + 0.008 * (1 - Math.abs(i - 1)));
      b.sweep([a, tip], (t) => [0.004, 0.012 * (1 - 0.45 * t)], {
        section: "box",
        caps: "flat",
        bone: wj,
        bands: [
          [0.65, BLUE_DARK],
          [1, BLUE_LIGHT],
        ],
      });
    }
  }

  // tail fan
  for (let i = -1; i <= 1; i++) {
    const dir = bd(i * 0.28, -0.12, -1).normalize();
    const a = bp(0, 0.078, -0.055);
    const tip = a.clone().addScaledVector(dir, 0.08 + (i === 0 ? 0.012 : 0));
    b.sweep([a, tip], (t) => [0.013 * (1 - 0.35 * t), 0.004], {
      section: "box",
      caps: "flat",
      bone: birdTail,
      bands: [
        [0.7, BLUE_DARK],
        [1, BLUE_NAVY],
      ],
    });
  }

  // legs and toes gripping the fur
  for (const s of [1, -1]) {
    const knee = bp(s * 0.022, 0.04, 0.005);
    const foot = bp(s * 0.022, -0.004, 0.012);
    b.rod(knee, foot, 0.0055, LEG, { bone: bird, sides: 5 });
    for (let k = -1; k <= 1; k++)
      b.spike(foot, bd(k * 0.35, 0, 1), 0.02, 0.0045, { color: LEG, bone: bird, sides: 4 });
  }

  return b.root;
}
