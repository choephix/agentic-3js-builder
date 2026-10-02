import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { polyline } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel } from "../kits/toon";


export const meta = {
  name: "Sakura Katana Display",
  description: "A lacquered ceremonial stand presenting a blossom-inlaid katana and its matching sheath.",
  style: "Genshin/anime mix",
  commit: "67d30d1",
};

const at = (a: number[], b: number[], t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const LACQUER = cel("#34132b", "#170d25", { threshold: 0.18 });
const LACQUER_RED = cel("#8f1f42", "#4c1636");
const SAYA = cel("#cf3e67", "#70234f");
const INDIGO = cel("#29204f", "#171533");
const GOLD = cel("#f3b83f", "#9f4b2f");
const GOLD_HIGHLIGHT = cel("#ffe68a", "#c9773a");

const BLADE = cel(
  paint((_p, _n, s) => (s[1] < 0.012 + 0.016 * Math.sin(s[0] * 32) ? "#b9d8f3" : "#f5f7ff")),
  "#8193bb",
  { threshold: 0.2 },
);
const BLADE_EDGE = cel("#d8efff", "#7489b4");
const PINK = cel("#ff93bc", "#b63f78");
const PINK_LIGHT = cel("#ffd1e1", "#d66b9b");
const JADE = cel("#65e0ca", "#238e9c");

const blossom = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
    <g fill="#ff9fc7" stroke="#6b194b" stroke-width="4" stroke-linejoin="round">
      <path d="M64 47 C40 28 22 42 35 60 C42 70 56 62 64 53 C72 62 86 70 93 60 C106 42 88 28 64 47Z"/>
      <path d="M64 47 C46 28 55 7 70 16 C82 23 75 39 68 48 C79 39 96 43 96 57 C96 72 76 76 65 55 C56 76 36 72 36 57 C36 43 53 39 64 47Z"/>
    </g><circle cx="64" cy="49" r="8" fill="#ffd85e" stroke="#8f4b30" stroke-width="3"/>
    <circle cx="60" cy="46" r="2" fill="#fff2af"/>
  </svg>`,
  { size: 256 },
);
const tassel = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
    <path d="M7 4h18v12H7z" fill="#f3b83f" stroke="#5c193e" stroke-width="3"/>
    <path d="M9 16h14l4 58-11 18L5 74z" fill="#d52e69" stroke="#64183e" stroke-width="3"/>
    <path d="M12 20l2 66M17 20v73M22 20l-2 66" stroke="#ffb4d0" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "sakuraKatana", detail: 1, paintSize: 1024 });
  const root = b.joint("stand", { at: [0, 0.12, 0], role: "hinge" });
  const random = rng(41);

  // A low, stepped lacquer plinth with bright metal edge work.
  b.part(new THREE.BoxGeometry(1.42, 0.12, 0.44), LACQUER, {
    bone: root,
    at: [0, 0.06, 0],
    flat: true,
    name: "plinth",
  });
  b.part(new THREE.BoxGeometry(1.25, 0.055, 0.34), LACQUER_RED, {
    bone: root,
    at: [0, 0.145, 0],
    flat: true,
    name: "insetTop",
  });
  b.part(new THREE.BoxGeometry(1.08, 0.38, 0.045), INDIGO, {
    bone: root,
    at: [0, 0.35, -0.17],
    flat: true,
    name: "backPanel",
  });
  for (const z of [-0.21, 0.21]) {
    b.rod([-0.62, 0.15, z], [0.62, 0.15, z], 0.009, { color: GOLD, bone: root, name: `frontTrim${z}` });
  }
  for (const x of [-0.67, 0.67]) {
    b.rod([x, 0.15, -0.17], [x, 0.15, 0.17], 0.009, { color: GOLD, bone: root, name: `sideTrim${x}` });
    b.part(new THREE.CylinderGeometry(0.045, 0.052, 0.035, 8), GOLD, {
      bone: root,
      at: [x, 0.02, 0],
      name: `foot${x}`,
    });
  }

  // Ornamental posts and padded sword cradles.
  for (const x of [-0.38, 0.47]) {
    b.part(new THREE.CylinderGeometry(0.032, 0.044, 0.47, 8), LACQUER_RED, {
      bone: root,
      at: [x, 0.39, -0.02],
      flat: true,
      name: `post${x}`,
    });
    b.part(new THREE.CylinderGeometry(0.057, 0.045, 0.025, 8), GOLD, {
      bone: root,
      at: [x, 0.64, -0.02],
      name: `postCap${x}`,
    });
    b.part(new THREE.SphereGeometry(0.07, 8, 5), LACQUER, {
      bone: root,
      at: [x, 0.59, 0.035],
      scale: [1.3, 0.34, 0.7],
      name: `pillow${x}`,
    });
    b.part(new THREE.TorusGeometry(0.052, 0.007, 6, 10), GOLD_HIGHLIGHT, {
      bone: root,
      at: [x, 0.61, 0.035],
      rotation: [90, 0, 0],
      name: `pillowRim${x}`,
    });
  }
  // Front panel blossom and small jade studs.
  b.part(new THREE.PlaneGeometry(0.27, 0.20), "#ffffff", {
    bone: root,
    at: [0, 0.32, -0.140],
    rotation: [0, 0, 0],
    texture: blossom,
    name: "panelBlossom",
  });
  for (const x of [-0.48, -0.16, 0.16, 0.48]) {
    b.part(new THREE.SphereGeometry(0.018, 8, 5), JADE, {
      bone: root,
      at: [x, 0.245, -0.140],
      name: `jadeStud${x}`,
    });
  }
  // Gold filigree arcs on the upper front rail.
  const filigree = polyline([
    [-0.48, 0.46, -0.14],
    [-0.24, 0.51, -0.14],
    [0, 0.46, -0.14],
    [0.24, 0.51, -0.14],
    [0.48, 0.46, -0.14],
  ]);
  b.sweep(filigree, 0.008, { bone: root, color: GOLD_HIGHLIGHT, caps: "round", name: "frontFiligree" });

  // Blade: a broad, slightly curved anime silhouette with a painted hamon.
  const bladeStart: [number, number, number] = [-0.49, 0.70, 0.08];
  const bladeEnd: [number, number, number] = [0.39, 0.80, 0.08];
  b.extrude(
    [
      [0, -0.012],
      [0.10, -0.036],
      [0.66, -0.030],
      [0.88, -0.006, "sharp"],
      [0.69, 0.035],
      [0.10, 0.048],
      [0, 0.028],
    ],
    {
      at: bladeStart,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.036, 0.018],
      bevel: 0.006,
      smoothing: 1,
      color: BLADE,
      bone: root,
      name: "katanaBlade",
    },
  );
  // A crisp ridge and tip glint ride just above the blade face.
  b.extrude(
    [[0.04, 0.027], [0.67, 0.026], [0.82, 0.005, "sharp"], [0.67, 0.012], [0.04, 0.012]],
    {
      at: [bladeStart[0], bladeStart[1], bladeStart[2] + 0.022],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.003,
      bevel: 0.001,
      color: BLADE_EDGE,
      bone: root,
      name: "bladeRidge",
    },
  );
  b.rod([-0.42, 0.728, 0.104], [0.27, 0.807, 0.104], 0.003, {
    bone: root,
    color: BLADE_EDGE,
    name: "hamonAccent",
  });

  // Guard, grip and fittings.
  const bladeDir: [number, number, number] = [0.993, 0.113, 0];
  const guardAt = bladeEnd;
  b.part(new THREE.TorusGeometry(0.074, 0.012, 7, 14), GOLD, {
    bone: root,
    at: guardAt,
    dir: bladeDir,
    axis: "y",
    name: "tsubaOuter",
  });
  b.part(new THREE.CylinderGeometry(0.051, 0.051, 0.018, 10), INDIGO, {
    bone: root,
    at: guardAt,
    dir: bladeDir,
    axis: "y",
    name: "tsubaCore",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.018, 7, 5), PINK_LIGHT, {
      bone: root,
      at: [guardAt[0], guardAt[1] + s * 0.054, guardAt[2] + 0.002],
      name: `tsubaPetal${s}`,
    });
    b.part(new THREE.SphereGeometry(0.018, 7, 5), PINK, {
      bone: root,
      at: [guardAt[0], guardAt[1] + s * 0.018, guardAt[2] + s * 0.052],
      name: `tsubaPetalZ${s}`,
    });
  }
  const gripEnd: [number, number, number] = [0.82, 0.85, 0.08];
  b.rod(bladeEnd, gripEnd, 0.043, { color: INDIGO, bone: root, section: { ngon: 8 }, name: "wrappedGrip" });
  b.part(new THREE.CylinderGeometry(0.051, 0.046, 0.035, 8), GOLD_HIGHLIGHT, {
    bone: root,
    at: [bladeEnd[0] + bladeDir[0] * 0.02, bladeEnd[1] + bladeDir[1] * 0.02, bladeEnd[2]],
    dir: bladeDir,
    axis: "y",
    name: "gripCollar",
  });
  for (let i = 0; i < 7; i += 1) {
    const p = at(bladeEnd, gripEnd, (i + 0.12) / 7);
    b.part(new THREE.TorusGeometry(0.045, 0.006, 6, 10), i % 2 === 0 ? GOLD : PINK_LIGHT, {
      bone: root,
      at: p,
      dir: bladeDir,
      axis: "y",
      name: `gripWrap${i}`,
    });
  }
  for (const t of [0.27, 0.75]) {
    const p = at(bladeEnd, gripEnd, t);
    b.part(new THREE.SphereGeometry(0.015, 7, 5), GOLD_HIGHLIGHT, {
      bone: root,
      at: [p[0], p[1], p[2] + 0.043],
      name: `menuki${t}`,
    });
  }
  b.part(new THREE.SphereGeometry(0.058, 8, 6), GOLD, {
    bone: root,
    at: [gripEnd[0] + 0.03, gripEnd[1] + 0.003, gripEnd[2]],
    name: "pommel",
  });
  b.part(new THREE.TorusGeometry(0.052, 0.009, 6, 10), PINK, {
    bone: root,
    at: [gripEnd[0] + 0.016, gripEnd[1] + 0.002, gripEnd[2]],
    dir: bladeDir,
    axis: "y",
    name: "pommelRing",
  });

  // Matching red saya, separated below the blade on its own two cradles.
  const sheathA: [number, number, number] = [-0.49, 0.565, -0.01];
  const sheathB: [number, number, number] = [0.43, 0.67, -0.01];
  b.rod(sheathA, sheathB, 0.050, {
    color: SAYA,
    bone: root,
    section: { ngon: 8 },
    name: "lacquerSheath",
  });
  const sheathDir: [number, number, number] = [0.993, 0.113, 0];
  for (const t of [0.05, 0.91]) {
    const p = at(sheathA, sheathB, t);
    b.part(new THREE.TorusGeometry(0.053, 0.008, 6, 12), GOLD, {
      bone: root,
      at: p,
      dir: sheathDir,
      axis: "y",
      name: `sheathFitting${t}`,
    });
  }
  // Three blossom clusters and winding gold accents on the front of the saya.
  for (const [t, lift] of [[0.22, 0.008], [0.53, 0.006], [0.78, 0.009]] as Array<[number, number]>) {
    const p = at(sheathA, sheathB, t);
    b.part(new THREE.SphereGeometry(0.022, 8, 5), PINK_LIGHT, {
      bone: root,
      at: [p[0], p[1] + 0.022, p[2] + 0.047 + lift],
      scale: [1.2, 0.7, 0.32],
      name: `sayaBlossom${t}`,
    });
    b.part(new THREE.SphereGeometry(0.009, 7, 5), GOLD_HIGHLIGHT, {
      bone: root,
      at: [p[0], p[1] + 0.022, p[2] + 0.060 + lift],
      name: `sayaBlossomCore${t}`,
    });
  }
  for (const t of [0.33, 0.62]) {
    const p = at(sheathA, sheathB, t);
    b.rod([p[0] - 0.055, p[1] - 0.025, p[2] + 0.045], [p[0] + 0.055, p[1] + 0.025, p[2] + 0.045], 0.006, {
      color: GOLD_HIGHLIGHT,
      bone: root,
      name: `sayaVine${t}`,
    });
  }

  // A tied sageo and two hanging anime tassel cards.
  const tie = at(sheathA, sheathB, 0.67);
  b.part(new THREE.TorusGeometry(0.059, 0.009, 6, 12), PINK, {
    bone: root,
    at: tie,
    dir: sheathDir,
    axis: "y",
    name: "sageoCollar",
  });
  b.rod([tie[0], tie[1], tie[2] + 0.045], [tie[0], tie[1] - 0.09, tie[2] + 0.045], 0.008, {
    color: GOLD,
    bone: root,
    name: "sageoCord",
  });
  b.cards(
    [frame([tie[0] - 0.026, tie[1] - 0.08, tie[2] + 0.045], [0, 1, 0]), frame([tie[0] + 0.026, tie[1] - 0.08, tie[2] + 0.045], [0, 1, 0])],
    tassel,
    { size: [0.045, 0.14], lean: 180, flow: [0, 0, 1], mirror: true, color: "#ffffff" },
  );

  // Scatter a handful of loose petals on the lacquer top for a lived-in display.
  for (let i = 0; i < 10; i += 1) {
    const x = -0.54 + random() * 1.08;
    const z = -0.12 + random() * 0.23;
    b.part(new THREE.SphereGeometry(0.012, 6, 4), i % 2 ? PINK : PINK_LIGHT, {
      bone: root,
      at: [x, 0.185 + (i % 3) * 0.001, z],
      scale: [1.5, 0.18, 0.7],
      rotation: [0, random() * 40, random() * 50],
      name: `loosePetal${i}`,
    });
  }

  return b.root;
}
