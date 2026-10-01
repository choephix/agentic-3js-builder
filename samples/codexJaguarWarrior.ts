import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { paint, spots } from "../src/paint";
import { catmull } from "../src/path";
import type { Chain } from "../src/skeleton";
import { svg } from "../src/texture";

// Codex Jaguar Warrior: a Mesoamerican painted codex brought into 3D.
// Flat earth pigments on pale ground, thick black outlines, geometric bands.
const OCHRE = "#c98a2e"; // jaguar pelt ground
const SPOT = "#4a2c14"; // rosette dark brown
const TURQ = "#2fa8a0";
const RED = "#b3312a";
const BLACK = "#1a1210";
const CREAM = "#efe0c0";
const SKIN = "#8a5a34";
const WHITE = "#f5efe0";
const OBSID = "#3a3a46";
const WOOD = "#7a4a28";
const GREEN = "#3fa06a";
const YELLOW = "#e0a83c";

export const meta = {
  name: "Codex Jaguar Warrior",
  description:
    "A Mesoamerican codex jaguar warrior: rosette pelt suit, open-jaw jaguar helmet, feather crest, fringed shield and obsidian-edged club.",
};

export default function build() {
  const b = createBuilder({ name: "codexJaguarWarrior" });

  // ---- paints ----
  const pelt = spots(OCHRE, SPOT, { size: 0.085, amount: 0.55, rosette: true, seed: 3 });
  // Warrior face: pale ground with a thick black eye band, codex style.
  const facePaint = paint((p, n) => {
    if (n.z > 0.4 && Math.abs(p.y - 1.515) < 0.024 && Math.abs(p.x) < 0.075) return BLACK;
    if (n.z > 0.5 && p.y < 1.47 && p.y > 1.44) return RED;
    return SKIN;
  });
  // Skirt: red with black bars, turquoise stripe, black hem (lathe s = [height, deg]).
  const skirtPaint = paint((_p, _n, s) => {
    if (s[0] < -0.18) return BLACK;
    if (s[0] < -0.14) return TURQ;
    const bar = ((s[1] % 45) + 45) % 45 < 7;
    return bar ? BLACK : RED;
  });
  // Crest feathers: green or red blade, red mid band, black tip (extrude s = [x, y]).
  const featherG = paint((_p, _n, s) => {
    if (s[1] > 0.165) return BLACK;
    if (s[1] > 0.09) return RED;
    return GREEN;
  });
  const featherR = paint((_p, _n, s) => {
    if (s[1] > 0.165) return BLACK;
    if (s[1] > 0.09) return GREEN;
    return RED;
  });

  // ---- shield face drawing ----
  let tris = "";
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * Math.PI * 2;
    const a1 = ((i + 0.86) / 12) * Math.PI * 2;
    const x0 = 100 + 62 * Math.cos(a0);
    const y0 = 100 + 62 * Math.sin(a0);
    const x1 = 100 + 62 * Math.cos(a1);
    const y1 = 100 + 62 * Math.sin(a1);
    const fill = i % 2 ? BLACK : TURQ;
    tris += `<polygon points="100,100 ${x0.toFixed(1)},${y0.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}" fill="${fill}"/>`;
  }
  let dots = "";
  for (let i = 0; i < 12; i++) {
    const a = ((i + 0.5) / 12) * Math.PI * 2;
    dots += `<circle cx="${(100 + 40 * Math.cos(a)).toFixed(1)}" cy="${(100 + 40 * Math.sin(a)).toFixed(1)}" r="4.5" fill="${CREAM}"/>`;
  }
  const shieldTex = svg(
    `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="97" fill="${CREAM}"/>${tris}${dots}<circle cx="100" cy="100" r="80" fill="none" stroke="${RED}" stroke-width="11"/><circle cx="100" cy="100" r="97" fill="none" stroke="${BLACK}" stroke-width="9"/><circle cx="100" cy="100" r="24" fill="${RED}" stroke="${BLACK}" stroke-width="6"/><circle cx="100" cy="100" r="8" fill="${TURQ}"/></svg>`,
    { size: 512 },
  );
  // Loincloth panel: stepped fret column on pale ground, red border.
  const fretTex = svg(
    `<svg viewBox="0 0 80 150"><rect x="0" y="0" width="80" height="150" fill="${CREAM}"/><rect x="4" y="4" width="72" height="142" fill="none" stroke="${RED}" stroke-width="8"/><path d="M28 22 H52 V38 H36 V54 H52 V70 H32 V86 H52 V102" fill="none" stroke="${BLACK}" stroke-width="7"/><rect x="12" y="118" width="56" height="14" fill="${TURQ}"/><rect x="12" y="118" width="56" height="14" fill="none" stroke="${BLACK}" stroke-width="3"/></svg>`,
    { size: 256 },
  );

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.95, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.95, 0],
      [0, 1.12, 0.01],
      [0, 1.32, 0.02],
    ],
    { parent: hips, names: ["spine", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.4, 0.03], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.55, 0.05], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.505, 0.06], dir: [0, -0.3, 1], role: "jaw" });

  const armChains: Record<string, Chain> = {};
  const legChains: Record<string, Chain> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.19, 1.29, 0.02],
        [s * 0.38, 1.08, 0.07],
        [s * 0.52, 0.92, 0.11],
      ],
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    armChains[side] = arm;
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.11, 0.92, 0],
        [s * 0.13, 0.5, 0.02],
        [s * 0.13, 0.1, 0.04],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.13, 0, 0.12],
      },
    );
    legChains[side] = leg;
  }
  const tail = b.chain(
    "tail",
    [
      [0, 0.9, -0.14],
      [0, 0.58, -0.3],
      [0, 0.36, -0.27],
    ],
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );

  // ---- torso, pelt suit ----
  b.sweep(spine, [0.15, 0.172], { color: pelt, sides: 10 });
  b.sweep(spine, 0.163, { from: 0.0, to: 0.14, color: BLACK }); // waist band
  b.sweep(
    [
      [0, 1.32, 0.02],
      [0, 1.4, 0.03],
    ],
    [0.062, 0.055],
    { color: SKIN, bone: neck },
  );
  b.sweep(tail, [0.05, 0.018], { color: pelt });

  // ---- limbs (pelt suit) with cuffs ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = armChains[side];
    const leg = legChains[side];
    b.sweep(arm, (t) => 0.065 - 0.02 * t, { color: pelt });
    b.sweep(arm, 0.072, { from: 0.02, to: 0.3, color: RED }); // upper-arm cuff
    b.sweep(arm, 0.053, { from: 0.8, to: 0.97, color: BLACK }); // wrist band
    b.sweep(leg, (t) => 0.095 - 0.045 * t, { color: pelt });
    b.sweep(leg, 0.06, { from: 0.78, to: 0.95, color: TURQ }); // anklet
    // fist
    b.part(new THREE.SphereGeometry(0.052, 10, 8), SKIN, {
      bone: arm.tip ?? arm.joints[2],
      at: [s * 0.525, 0.89, 0.125],
    });
    // foot + sandal
    const ankle = leg.joints[2];
    b.part(new THREE.BoxGeometry(0.09, 0.06, 0.22), SKIN, {
      bone: ankle,
      at: [s * 0.13, 0.05, 0.11],
    });
    b.part(new THREE.BoxGeometry(0.1, 0.025, 0.24), WOOD, {
      bone: ankle,
      at: [s * 0.13, 0.013, 0.11],
    });
    b.rod([s * 0.085, 0.075, 0.12], [s * 0.175, 0.075, 0.12], 0.009, { color: BLACK, bone: ankle });
    b.rod([s * 0.13, 0.08, 0.02], [s * 0.13, 0.16, -0.01], 0.009, { color: BLACK, bone: ankle });
  }

  // ---- skirt + loincloth panels ----
  b.lathe(
    [
      [0.02, 0],
      [0.19, 0],
      [0.22, -0.1],
      [0.24, -0.2],
      [0.2, -0.22],
      [0.02, -0.22],
    ],
    { at: [0, 0.93, 0], bone: hips, segments: 14, color: skirtPaint },
  );
  b.part(new THREE.PlaneGeometry(0.17, 0.3), WHITE, {
    at: [0, 0.68, 0.185],
    bone: hips,
    dir: [0, -0.05, 1],
    axis: "z",
    texture: fretTex,
  });
  b.part(new THREE.PlaneGeometry(0.15, 0.22), RED, {
    at: [0, 0.7, -0.185],
    bone: hips,
    dir: [0, 0.05, -1],
    axis: "z",
  });

  // ---- cape (jaguar pelt down the back) ----
  b.membrane(
    [
      [0.16, 1.3, -0.05],
      [0.17, 1.0, -0.13],
      [0.15, 0.72, -0.14],
    ],
    [
      [-0.16, 1.3, -0.05],
      [-0.17, 1.0, -0.13],
      [-0.15, 0.72, -0.14],
    ],
    { color: pelt, thickness: 0.012, bone: hips },
  );

  // ---- warrior face inside the helmet ----
  b.part(new THREE.SphereGeometry(0.085, 14, 10), facePaint, {
    bone: head,
    at: [0, 1.5, 0.12],
    scale: [0.95, 1.1, 0.95],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.017, 8, 6), WHITE, {
      bone: head,
      at: [s * 0.033, 1.515, 0.192],
    });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, {
      bone: head,
      at: [s * 0.033, 1.515, 0.206],
    });
  }
  // warrior lower jaw (chin + teeth) on the jaw joint
  b.part(new THREE.BoxGeometry(0.075, 0.055, 0.07), SKIN, {
    bone: jaw,
    at: [0, 1.435, 0.12],
  });
  b.part(new THREE.BoxGeometry(0.06, 0.015, 0.02), WHITE, {
    bone: jaw,
    at: [0, 1.465, 0.148],
  });
  // jaguar lower-jaw bars flanking the face, riding the jaw joint
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.032, 0.045, 0.12), pelt, {
      bone: jaw,
      at: [s * 0.108, 1.452, 0.05],
    });
  }

  // ---- open jaguar-head helmet ----
  b.part(new THREE.SphereGeometry(0.13, 14, 10), pelt, {
    bone: head,
    at: [0, 1.665, -0.02],
    scale: [1.02, 0.92, 1.08],
  });
  b.frustumBox([0, 1.68, 0.06], [0, 1.63, 0.31], [0.14, 0.1], [0.095, 0.065], {
    bone: head,
    color: pelt,
  });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), BLACK, { bone: head, at: [0, 1.632, 0.355] });
  for (const s of [1, -1]) {
    // jaguar eyes
    b.part(new THREE.SphereGeometry(0.028, 8, 6), YELLOW, {
      bone: head,
      at: [s * 0.095, 1.7, 0.075],
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), BLACK, {
      bone: head,
      at: [s * 0.098, 1.7, 0.098],
    });
    // helmet ears with red inner
    b.extrude(
      [
        [-0.04, 0],
        [0.04, 0],
        [0.032, 0.03],
        [0, 0.085, "sharp"],
        [-0.032, 0.03],
      ],
      {
        at: [s * 0.085, 1.72, -0.01],
        bone: head,
        x: [1, 0, 0],
        thickness: 0.02,
        smoothing: 1,
        color: pelt,
      },
    );
    b.extrude(
      [
        [-0.02, 0.012],
        [0.02, 0.012],
        [0, 0.05, "sharp"],
      ],
      { at: [s * 0.085, 1.722, 0.002], bone: head, x: [1, 0, 0], thickness: 0.022, color: RED },
    );
  }
  // upper fangs under the snout, merged into one part
  const fangs = [-0.032, -0.011, 0.011, 0.032].map((x) =>
    new THREE.ConeGeometry(0.008, 0.032, 6).rotateX(Math.PI).translate(x, 1.576, 0.29),
  );
  b.part(mergeGeometries(fangs)!, WHITE, { bone: head, at: [0, 0, 0] });

  // ---- feather crest fanning behind the helmet ----
  const featherOutline: [number, number][] = [
    [0, 0],
    [0.03, 0.02],
    [0.034, 0.1],
    [0.018, 0.18],
    [0, 0.215],
    [-0.018, 0.18],
    [-0.034, 0.1],
    [-0.03, 0.02],
  ];
  for (let i = -3; i <= 3; i++) {
    const tilt = i * 0.3;
    b.extrude(featherOutline, {
      at: [i * 0.05, 1.7, -0.08],
      bone: head,
      x: [1, 0, 0],
      y: [tilt, 1, -0.15],
      thickness: 0.008,
      smoothing: 1,
      color: i % 2 ? featherR : featherG,
    });
  }

  // ---- shield on the left forearm (s = +1) ----
  const elbowL = armChains["L"].joints[1];
  const shieldC: [number, number, number] = [0.55, 0.99, 0.13];
  const shieldDir = new THREE.Vector3(0.5, 0, 1).normalize();
  b.part(new THREE.CircleGeometry(0.19, 24), WHITE, {
    at: shieldC,
    bone: elbowL,
    dir: [shieldDir.x, shieldDir.y, shieldDir.z],
    axis: "z",
    texture: shieldTex,
  });
  // rim ring
  const up = new THREE.Vector3(0, 1, 0);
  const u = new THREE.Vector3().crossVectors(shieldDir, up).normalize();
  const v = new THREE.Vector3().crossVectors(shieldDir, u).normalize();
  const c = new THREE.Vector3(...shieldC);
  const rimPts: [number, number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const p = c
      .clone()
      .addScaledVector(u, 0.19 * Math.cos(a))
      .addScaledVector(v, 0.19 * Math.sin(a));
    rimPts.push([p.x, p.y, p.z]);
  }
  b.sweep(catmull(rimPts, { closed: true }), 0.02, { color: BLACK, bone: elbowL });
  // boss
  b.part(new THREE.SphereGeometry(0.05, 10, 8), RED, {
    bone: elbowL,
    at: [shieldC[0] + shieldDir.x * 0.012, shieldC[1] + shieldDir.y * 0.012, shieldC[2] + shieldDir.z * 0.012],
    scale: [1, 1, 0.6],
  });
  // feather fringe: cones ringing the rim, alternating red/green
  b.ring(frame(shieldC, [shieldDir.x, shieldDir.y, shieldDir.z]), { count: 14, radius: 0.225 }, (item) =>
    b.spike(item, item, 0.1, 0.02, { color: item.i % 2 ? RED : GREEN }),
  );

  // ---- macuahuitl club in the right hand (s = -1) ----
  const wristR = armChains["R"].tip ?? armChains["R"].joints[2];
  const gripTop: [number, number, number] = [-0.52, 0.94, 0.1];
  const clubEnd: [number, number, number] = [-0.56, 0.46, 0.27];
  b.rod(gripTop, clubEnd, 0.024, { color: WOOD, bone: wristR });
  b.frustumBox([-0.532, 0.82, 0.138], [-0.558, 0.5, 0.252], [0.075, 0.05], [0.085, 0.045], {
    color: WOOD,
    bone: wristR,
  });
  for (let i = 0; i < 5; i++) {
    const t = 0.08 + (i / 4) * 0.8;
    const px = -0.532 + (-0.558 + 0.532) * t;
    const py = 0.82 + (0.5 - 0.82) * t;
    const pz = 0.138 + (0.252 - 0.138) * t;
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.032, 0.052, 0.014), OBSID, {
        bone: wristR,
        at: [px + s * 0.055, py, pz],
        rotation: [0, 0, s * -18],
      });
    }
  }

  return b.root;
}
