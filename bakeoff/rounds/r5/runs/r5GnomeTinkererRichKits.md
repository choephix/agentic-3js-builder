```ts
import * as THREE from "three";
import { createBuilder, frame, offset, catmull, polyline, limb, stripes, spots, mottle, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled, gearTrain, gearGeometry, gaugeTexture, coil } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A stocky, bearded gnome inventor in a spotted red hat with goggles, a leather apron, a vial bandolier and a riveted backpack bristling with gears, a spyglass, a rotor, a boiler tank, tools and a glowing antenna.",
};

// ---------- palette ----------
const SKIN = "#f1b58f";
const NOSE = "#ee8a77";
const PINK = "#ff8fa0";
const WHITE = "#ffffff";
const INK_C = "#2a1830";
const BEARD = "#f6f2e8";
const HAT = "#d8452c";
const HAT_DOT = "#f7e6bd";
const BAND = "#4a3022";
const BOBBLE = "#f4cf58";
const STRAP = "#5a3820";
const BELT = "#4a2e1a";
const LEATHER = "#8a5a34";
const LEATHER_D = "#6b4326";
const SLEEVE = "#5f9444";
const TRIM = "#e8c26a";
const PANTS = "#7a5030";
const BOOT = "#4b2f1f";
const BOOT_D = "#2b1a10";
const BOOT_CUFF = "#8a5a34";
const GLOVE = "#c58a55";
const SCARF = "#e39a2c";
const WOOD = "#9a6a3a";
const LENS = "#7ff0ff";
const BULB = "#c8ff6a";
const FLAME = "#ffb347";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const TUNIC = stripes("#609645", "#4e7d37", { size: 0.05, axis: "y", width: 0.5 });
const HATP = spots(HAT, HAT_DOT, { size: 0.07, amount: 0.22 });
const BEARDP = mottle(BEARD, "#dcd8cf", { size: 0.04 });
const BRASS = metal("brass");
const GILT = metal("gilt");
const COPPER = metal("copper", { verdigris: 0.3 });
const STEEL = metal("steel");
const BLUED = metal("blued");
const PACKP = panelled(LEATHER, { size: 0.1, rivets: 0.025 });

const APRON = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 60">
  <path d="M13 2 L37 2 L39 13 L47 21 L45 58 L5 58 L3 21 L11 13 Z" fill="#b87a40" stroke="#4e2c14" stroke-width="2" stroke-linejoin="round"/>
  <path d="M14 6 L36 6 L37.5 13" fill="none" stroke="#e0a468" stroke-width="1.2" stroke-dasharray="2 1.6"/>
  <rect x="12" y="23" width="4.5" height="14" rx="1.5" fill="#d9392b" stroke="#4e2c14" stroke-width="1"/>
  <rect x="21" y="26" width="3" height="10" fill="#9aa4b8" stroke="#4e2c14" stroke-width="1"/>
  <rect x="27" y="22" width="4" height="15" rx="1.5" fill="#3b7fd6" stroke="#4e2c14" stroke-width="1"/>
  <rect x="34" y="27" width="3.2" height="10" rx="1" fill="#f3c64d" stroke="#4e2c14" stroke-width="1"/>
  <rect x="9" y="34" width="32" height="19" rx="2" fill="#9a6232" stroke="#4e2c14" stroke-width="1.6"/>
  <path d="M25 34 V53" stroke="#4e2c14" stroke-width="1.4"/>
  <path d="M11 37 H39" fill="none" stroke="#e0a468" stroke-width="1" stroke-dasharray="2 1.6"/>
  <circle cx="9" cy="34" r="1.9" fill="#f3c64d" stroke="#4e2c14" stroke-width="0.8"/>
  <circle cx="41" cy="34" r="1.9" fill="#f3c64d" stroke="#4e2c14" stroke-width="0.8"/>
  <circle cx="25" cy="44" r="2.6" fill="#f3c64d" stroke="#4e2c14" stroke-width="1"/>
  <path d="M10 57 H40" fill="none" stroke="#e0a468" stroke-width="1" stroke-dasharray="2 1.6"/>
</svg>`,
  { size: 256 },
);

const WRENCH: [number, number][] = [
  [-0.008, 0], [0.008, 0], [0.008, 0.15], [0.022, 0.17], [0.022, 0.205], [0.01, 0.205],
  [0.01, 0.19], [-0.01, 0.19], [-0.01, 0.205], [-0.022, 0.205], [-0.022, 0.17], [-0.008, 0.15],
];
const BLADE: [number, number][] = [
  [0.012, -0.015], [0.09, -0.032], [0.15, -0.02], [0.15, 0.014], [0.09, 0.02], [0.012, 0.015],
];
const BAND_OUT: [number, number][] = [
  [0.115, 0], [0.15, 0], [0.15, 0.05], [0.115, 0.05],
];

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer" });

  // ================= skeleton =================
  const hips = b.joint("hips", { at: [0, 0.36, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.36, 0], [0, 0.48, 0.0], [0, 0.6, 0.01], [0, 0.72, 0.03]]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const waist = spine.joints[1];
  const chest = spine.joints[2];
  const neck = b.chain("neck", polyline([[0, 0.72, 0.03], [0, 0.77, 0.04], [0, 0.83, 0.05]]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.83, 0.05], dir: [0, 1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.89, 0.08], aim: [0, 0.87, 0.2], role: "jaw" });

  // ================= torso =================
  const torso = b.sweep(spine, [0.13, 0.17, 0.158, 0.105], {
    color: TUNIC,
    sides: 10,
    smooth: false,
    caps: { start: "flat", end: "round" },
    shift: (t: number): [number, number] => [0, -0.03 * Math.sin(Math.PI * t)],
  });
  b.part(new THREE.TorusGeometry(0.135, 0.014, 5, 14), TRIM, {
    bone: hips,
    at: [0, 0.362, -0.004],
    dir: [0, 1, 0],
    axis: "z",
  });
  const tsurf = b.surface(torso);

  b.sweep(neck, 0.052, { color: SKIN });
  b.part(new THREE.TorusGeometry(0.1, 0.028, 6, 12), SCARF, {
    bone: neck.joints[0],
    at: [0, 0.75, 0.035],
    dir: [0, 1, 0],
    axis: "z",
  });

  // belt, buckle, pouches, vials
  const belt = tsurf.loop(waist, { lift: 0.012 });
  b.sweep(belt, 0.016, { color: BELT });
  const front = tsurf.around(waist.at).at(0, 0);
  if (front) b.stick(new THREE.BoxGeometry(0.055, 0.014, 0.05), BRASS, front, { embed: 0.3 });
  for (const s of [1, -1]) {
    const h = tsurf.around(waist.at).at(s * 62, 0);
    if (h) {
      b.stick(new THREE.CylinderGeometry(0.036, 0.042, 0.05, 6), LEATHER, h, { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(0.038, 0.038, 0.012, 6), LEATHER_D, h.moved([0, 0.02, 0]), { embed: 0 });
    }
  }
  const vialColors = ["#7dff9a", "#ff7ad8", "#7fd8ff", "#ffe36e", "#c58bff", "#ff9a6a"];
  let vi = 0;
  for (const arc of [belt.slice(0.05, 0.17), belt.slice(0.83, 0.95)]) {
    b.along(arc, 3, (at) => {
      const p = at.at;
      const r = V(p.x, 0, p.z - waist.at.z).normalize();
      const base = p.clone().addScaledVector(r, 0.016).add(V(0, 0.03, 0));
      glow(
        b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.055, 6), vialColors[vi % vialColors.length], {
          bone: waist,
          at: base,
          dir: [0, 1, 0],
        }),
        0.9,
      );
      b.part(new THREE.CylinderGeometry(0.008, 0.01, 0.014, 6), BRASS, {
        bone: waist,
        at: base.clone().add(V(0, 0.034, 0)),
        dir: [0, 1, 0],
      });
      vi++;
    });
  }

  // apron decal and suspenders
  b.decal(torso, APRON, { at: [0, 0.53, 0.18], dir: [0, 0, 1], size: [0.25, 0.3], segments: 12 });
  for (const s of [1, -1]) {
    const path = tsurf.drape(
      catmull([
        [s * 0.07, 0.5, 0.18],
        [s * 0.075, 0.62, 0.13],
        [s * 0.08, 0.72, 0.03],
        [s * 0.075, 0.62, -0.1],
        [s * 0.07, 0.5, -0.14],
      ]),
      { lift: 0.012 },
    );
    b.sweep(path, 0.013, { color: STRAP });
  }

  // ================= legs =================
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.085, 0.36, 0], [s * 0.09, 0.07, 0.02], [0.155, 0.15], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.076, 0.064, 0.056], { color: PANTS });
    const ankle = leg.joints[leg.joints.length - 1];
    const x = s * 0.09;
    b.part(new THREE.SphereGeometry(1, 8, 6), BOOT, { bone: ankle, at: [x, 0.062, 0.08], scale: [0.072, 0.062, 0.115] });
    b.part(new THREE.SphereGeometry(1, 8, 6), BOOT_D, { bone: ankle, at: [x, 0.012, 0.085], scale: [0.075, 0.02, 0.125] });
    b.part(new THREE.SphereGeometry(1, 8, 6), BOOT_CUFF, { bone: ankle, at: [x, 0.055, 0.16], scale: [0.058, 0.04, 0.045] });
    b.part(new THREE.CylinderGeometry(0.068, 0.076, 0.09, 8), BOOT, { bone: ankle, at: [x, 0.13, 0.025] });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.026, 8), BOOT_CUFF, { bone: ankle, at: [x, 0.185, 0.025] });
    b.part(new THREE.BoxGeometry(0.012, 0.03, 0.03), BRASS, { bone: ankle, at: [x + s * 0.078, 0.185, 0.03] });
  }

  // ================= arms =================
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shoulderP = [s * 0.17, 0.67, 0.02];
    const pts = limb(shoulderP, [s * 0.35, 0.49, 0.1], [0.15, 0.145], [[0, -0.3, -1]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.064, 0.052, 0.046], { color: SLEEVE });
    b.part(new THREE.SphereGeometry(1, 8, 6), SLEEVE, { bone: arm.joints[0], at: shoulderP, scale: [0.07, 0.07, 0.07] });
    b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.032, 8), TRIM, { frame: arm.at(0.88), bone: arm.joints[1] });
    const hand = arm.joints[arm.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.03, 8), BELT, { bone: hand, frame: hand, at: hand.local([0, -0.004, 0]) });
    b.part(new THREE.BoxGeometry(0.062, 0.05, 0.036), GLOVE, { bone: hand, frame: hand, at: hand.local([0, 0.024, 0]) });
    const fx = [-0.022, -0.0075, 0.0075, 0.022];
    const fl = [0.85, 1.0, 1.0, 0.8];
    fx.forEach((x, i) => {
      const L = fl[i];
      const fp = [
        hand.local([x, 0.045, 0]),
        hand.local([x, 0.045 + 0.022 * L, -0.003]),
        hand.local([x, 0.045 + 0.042 * L, -0.012]),
      ];
      const f = b.chain(`finger${i + 1}${S}`, polyline(fp), {
        parent: hand,
        names: [`finger${i + 1}${S}a`, `finger${i + 1}${S}b`],
        role: "digit",
      });
      b.sweep(f, [0.0125, 0.009], { color: GLOVE });
    });
    const tp = [
      hand.local([s * 0.026, 0.012, 0]),
      hand.local([s * 0.042, 0.03, -0.004]),
      hand.local([s * 0.052, 0.05, -0.01]),
    ];
    const th = b.chain(`thumb${S}`, polyline(tp), {
      parent: hand,
      names: [`thumb${S}a`, `thumb${S}b`],
      role: "digit",
    });
    b.sweep(th, [0.014, 0.01], { color: GLOVE });
  }

  // ================= head =================
  const HC = V(0, 0.95, 0.07);
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, {
    bone: head,
    at: HC,
    scale: [0.125, 0.115, 0.115],
    flat: true,
  });
  const hskin = b.surface(skull);
  const hitAt = (az: number, el: number) => {
    const h = hskin.around(HC).at(az, el);
    if (!h) throw new Error(`no head hit at ${az},${el}`);
    return h;
  };
  const lifted = (az: number, el: number, lift: number) => {
    const h = hitAt(az, el);
    return offset(h, h.n, lift);
  };

  // lower jaw + beard
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: jaw, at: [0, 0.885, 0.105], scale: [0.08, 0.045, 0.08] });
  b.loft(
    [
      { at: [0, 0.895, 0.1], w: 0.2, h: 0.12 },
      { at: [0, 0.84, 0.16], w: 0.27, h: 0.15 },
      { at: [0, 0.76, 0.18], w: 0.26, h: 0.15 },
      { at: [0, 0.68, 0.18], w: 0.17, h: 0.12 },
      { at: [0, 0.6, 0.17], w: 0.06, h: 0.06 },
    ],
    { bone: jaw, color: BEARDP },
  );
  for (const x of [-0.04, 0, 0.04]) {
    b.spike([x, 0.64, 0.17], [x * 0.4, -1, 0.1], 0.07, 0.026, { color: BEARD, bone: jaw });
  }
  b.part(new THREE.TorusGeometry(0.032, 0.008, 5, 8), GILT, { bone: jaw, at: [0, 0.655, 0.17], dir: [0, 1, 0], axis: "z" });

  // moustache
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.01, 0.915, 0.2],
        [s * 0.05, 0.905, 0.19],
        [s * 0.1, 0.915, 0.135],
        [s * 0.118, 0.945, 0.095],
      ]),
      [0.03, 0.027, 0.018, 0.006],
      { color: BEARD, bone: head },
    );
  }

  // nose, eyes, brows, cheeks, ears, tufts
  b.stick(new THREE.SphereGeometry(0.042, 8, 6), NOSE, hitAt(0, -3), { embed: 0.1 });
  for (const s of [1, -1]) {
    const eye = b.stick(new THREE.SphereGeometry(0.024, 8, 6), WHITE, hitAt(s * 26, 6), { embed: 0.35 });
    const gaze = eye.axis.clone().lerp(V(0, 0, 1), 0.6).normalize();
    const pup = b.part(new THREE.SphereGeometry(0.0135, 8, 6), INK_C, {
      bone: head,
      at: offset(eye.at, gaze, 0.014),
    });
    b.part(new THREE.SphereGeometry(0.005, 5, 4), WHITE, {
      bone: head,
      at: offset(offset(pup.at, gaze, 0.0105), [0, 1, 0], 0.006),
    });
    b.sweep(
      catmull([lifted(s * 10, 32, 0.01), lifted(s * 27, 30, 0.01), lifted(s * 45, 22, 0.008)]),
      [0.018, 0.012, 0.006],
      { color: BEARD, bone: head },
    );
    b.stick(new THREE.CylinderGeometry(0.022, 0.022, 0.008, 8), PINK, hitAt(s * 36, -8), { embed: 0.4 });
    b.spike(hitAt(s * 88, -2), [s * 0.9, 0.35, -0.35], 0.11, 0.032, { color: SKIN, bone: head });
    b.spike(hitAt(s * 78, 14), [s, 0.45, -0.2], 0.06, 0.02, { color: BEARD, bone: head });
  }

  // ================= hat =================
  const hat = b.chain(
    "hat",
    catmull([[0, 0.995, 0.065], [0, 1.09, 0.055], [0, 1.18, 0.025], [0, 1.25, -0.04], [0, 1.28, -0.12]]),
    { parent: head, role: "tail", count: 4 },
  );
  b.sweep(hat, [0.128, 0.105, 0.075, 0.045, 0.016], {
    color: HATP,
    sides: 10,
    smooth: false,
    caps: { start: "flat", end: "point" },
  });
  const hatTip = hat.at(1);
  b.part(new THREE.SphereGeometry(0.032, 8, 6), BOBBLE, { bone: hat.joints[hat.joints.length - 1], at: hatTip.at });
  b.lathe(BAND_OUT, { at: [0, 0.985, 0.065], bone: head, color: BAND });
  b.part(gearGeometry({ teeth: 10, module: 0.004, thickness: 0.008, bore: 0.003 }), GILT, {
    bone: head,
    at: [0, 1.01, 0.219],
    dir: [0, 0.05, 1],
  });

  // goggles
  const lensDir = V(0, 0.28, 1).normalize();
  const strapPts: number[][] = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [0.118 * Math.sin(a), 1.068, 0.06 + 0.118 * Math.cos(a)];
  });
  b.sweep(catmull(strapPts, { closed: true }), 0.007, { color: STRAP, bone: head });
  for (const s of [1, -1]) {
    const c = V(s * 0.052, 1.068, 0.17);
    b.part(new THREE.TorusGeometry(0.029, 0.008, 5, 10), BRASS, { bone: head, at: c, dir: lensDir, axis: "z" });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.036, 10), GILT, {
      bone: head,
      at: offset(c, lensDir, -0.02),
      dir: lensDir,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.026, 10), LENS, {
        bone: head,
        at: offset(c, lensDir, 0.002),
        dir: lensDir,
        axis: "z",
      }),
      1.2,
    );
  }
  b.rod([-0.025, 1.07, 0.172], [0.025, 1.07, 0.172], 0.007, BRASS, { bone: head });

  // ================= backpack =================
  b.part(new THREE.BoxGeometry(0.3, 0.36, 0.16), PACKP, { bone: chest, at: [0, 0.56, -0.2] });
  b.part(new THREE.BoxGeometry(0.32, 0.06, 0.18), LEATHER_D, { bone: chest, at: [0, 0.745, -0.2] });
  b.part(new THREE.BoxGeometry(0.04, 0.05, 0.01), BRASS, { bone: chest, at: [0, 0.72, -0.292] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, 0.18, 0.12), LEATHER_D, { bone: chest, at: [s * 0.17, 0.5, -0.2] });
    b.part(new THREE.BoxGeometry(0.016, 0.3, 0.006), STRAP, { bone: chest, at: [s * 0.142, 0.56, -0.283] });
    b.part(new THREE.BoxGeometry(0.024, 0.03, 0.01), BRASS, { bone: chest, at: [s * 0.142, 0.64, -0.288] });
  }

  // gear train on the back
  const train = gearTrain(b, {
    at: [0, 0.5, -0.288],
    axis: [0, 0, -1],
    module: 0.008,
    spin: "gear",
    bone: chest,
    gears: [
      { teeth: 16, spokes: 5, bore: 0.004 },
      { teeth: 10, angle: 40, bore: 0.003 },
      { teeth: 14, on: 1, shift: 0.02, holes: 5, bore: 0.003, color: COPPER },
      { teeth: 8, from: 2, angle: 180 },
    ],
  });
  train.spin(18);

  // pressure gauge on the left pocket
  b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.014, 12), GILT, { bone: chest, at: [0.196, 0.5, -0.2], dir: [1, 0, 0] });
  b.part(new THREE.CircleGeometry(0.038, 14), WHITE, {
    bone: chest,
    at: [0.205, 0.5, -0.2],
    dir: [1, 0, 0],
    axis: "z",
    texture: gaugeTexture({ needle: 50 }),
  });

  // tools on the right pocket
  b.extrude(WRENCH, {
    at: [-0.198, 0.52, -0.2],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.006,
    color: STEEL,
    bone: chest,
  });
  b.rod([-0.17, 0.48, -0.14], [-0.17, 0.74, -0.14], 0.01, WOOD, { bone: chest });
  b.part(new THREE.BoxGeometry(0.035, 0.04, 0.075), BLUED, { bone: chest, at: [-0.17, 0.755, -0.14] });

  // boiler tank
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.3, 10), COPPER, { bone: chest, at: [0, 0.32, -0.2], dir: [1, 0, 0] });
  for (const x of [-0.09, 0.09]) {
    b.part(new THREE.TorusGeometry(0.05, 0.008, 5, 10), GILT, { bone: chest, at: [x, 0.32, -0.2], dir: [1, 0, 0], axis: "z" });
  }
  for (const x of [-0.155, 0.155]) {
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 10), GILT, { bone: chest, at: [x, 0.32, -0.2], dir: [1, 0, 0] });
  }
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), BRASS, { bone: chest, at: [0.05, 0.36, -0.2] });
  b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), BRASS, { bone: chest, at: [0.05, 0.378, -0.2], dir: [0, 1, 0], axis: "z" });

  // spyglass lashed across the top
  const p0 = V(0.06, 0.8, -0.27);
  const p1 = V(0.16, 0.84, -0.27);
  const p2 = V(0.25, 0.88, -0.27);
  const p3 = V(0.33, 0.915, -0.27);
  const sgDir = p3.clone().sub(p0).normalize();
  b.rod(p0, p1, 0.034, LEATHER_D, { bone: chest });
  b.rod(p1, p2, 0.027, BRASS, { bone: chest });
  b.rod(p2, p3, 0.021, GILT, { bone: chest });
  for (const p of [p1, p2, p3]) {
    b.part(new THREE.TorusGeometry(0.026, 0.006, 5, 8), STEEL, { bone: chest, at: p, dir: sgDir, axis: "z" });
  }
  glow(
    b.part(new THREE.CircleGeometry(0.019, 8), LENS, {
      bone: chest,
      at: offset(p3, sgDir, 0.002),
      dir: sgDir,
      axis: "z",
    }),
    1.1,
  );

  // rotor
  const rotorAt = V(0, 1.0, -0.26);
  b.rod([0, 0.775, -0.26], rotorAt, 0.012, BRASS, { bone: chest });
  const rotor = b.joint("rotor", { parent: chest, at: rotorAt, dir: [0, 1, 0] });
  b.part(new THREE.SphereGeometry(0.026, 8, 6), GILT, { bone: rotor, at: rotorAt });
  for (let k = 0; k < 3; k++) {
    const th = (k * 2 * Math.PI) / 3;
    const c = Math.cos(th);
    const sn = Math.sin(th);
    b.extrude(BLADE, {
      at: rotorAt,
      x: [c, 0, sn],
      y: [-sn, 0, c],
      thickness: 0.008,
      color: COPPER,
      bone: rotor,
    });
  }

  // antenna with coil and glowing bulb
  const aBase = V(-0.12, 0.775, -0.26);
  const aTop = V(-0.12, 0.91, -0.26);
  b.rod(aBase, aTop, 0.006, STEEL, { bone: chest });
  b.sweep(coil(aBase, aTop, 0.02, 6), 0.004, { color: BLUED, bone: chest });
  glow(b.part(new THREE.SphereGeometry(0.026, 8, 6), BULB, { bone: chest, at: [-0.12, 0.935, -0.26] }), 1.4);

  // ================= lantern at the hip =================
  b.rod([0.185, 0.46, 0.04], [0.2, 0.34, 0.04], 0.004, INK_C, { bone: hips });
  b.part(new THREE.TorusGeometry(0.02, 0.004, 4, 8), BRASS, { bone: hips, at: [0.2, 0.345, 0.04], dir: [0, 0, 1], axis: "z" });
  glow(b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.07, 6), FLAME, { bone: hips, at: [0.2, 0.29, 0.04] }), 1.3);
  b.part(new THREE.ConeGeometry(0.046, 0.03, 6), BRASS, { bone: hips, at: [0.2, 0.34, 0.04] });
  b.part(new THREE.CylinderGeometry(0.038, 0.032, 0.014, 6), BRASS, { bone: hips, at: [0.2, 0.25, 0.04] });
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    b.rod([0.2 + 0.035 * Math.cos(a), 0.252, 0.04 + 0.035 * Math.sin(a)], [0.2 + 0.035 * Math.cos(a), 0.328, 0.04 + 0.035 * Math.sin(a)], 0.003, BRASS, {
      bone: hips,
    });
  }

  // belt-side tool loop: small bolts on the apron strap area
  b.part(frameBolt(), GILT, { bone: chest, at: [0, 0.6, 0.0] });

  return b.root;
}

// a tiny hidden bolt keeps the chest joint's geometry bounded (buried inside the torso)
function frameBolt() {
  return new THREE.SphereGeometry(0.004, 4, 3);
}
```