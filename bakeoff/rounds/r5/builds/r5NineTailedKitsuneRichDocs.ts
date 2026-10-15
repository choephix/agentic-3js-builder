import * as THREE from "three";
import { createBuilder, frame, rng, catmull, limb, gradient, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A white nine-tailed fox spirit with crimson kumadori markings, gold shimenawa collar, a fanned peacock of nine plume tails tipped with blue and violet spirit fire, floating foxfire wisps and a glowing nine-point seal on the ground.",
};

// ---------- palette ----------
const FUR = "#fbf6ee";
const CREAM = "#efe2d0";
const RED = "#d9304a";
const RED_D = "#a81d3c";
const TIPRED = "#e8456a";
const GOLD = "#f2b83a";
const DARK = "#2b1328";
const SOCK = "#3a2347";
const NOSE = "#1d1020";
const ORB = "#dffcff";

// ---------- textures ----------
const flameSvg = (c1: string, c2: string, c3: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
<path d="M32 94 C10 86 4 66 14 48 C18 40 26 34 24 20 C24 12 28 6 30 2 C34 14 44 22 50 38 C60 56 56 84 32 94Z" fill="${c1}"/>
<path d="M32 90 C16 82 14 66 22 54 C26 48 30 44 30 34 C38 46 48 56 46 72 C45 82 40 88 32 90Z" fill="${c2}"/>
<path d="M32 86 C24 80 24 70 30 62 C34 56 36 54 36 50 C42 60 44 74 38 82 C36 84 34 86 32 86Z" fill="${c3}"/>
</svg>`,
    { size: 128 },
  );

const tuftTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M2 64 C6 40 12 16 16 1 C20 16 26 40 30 64Z" fill="#ffffff"/></svg>`,
  { size: 64 },
);

const eyeTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 48">
<path d="M56 19 Q78 18 94 4 Q82 30 54 34 Z" fill="#d6283a"/>
<path d="M2 31 Q20 6 46 12 Q58 14 64 5 Q60 30 42 40 Q18 46 2 31Z" fill="#2b1328"/>
<path d="M7 30 Q22 14 45 18 Q54 19 58 14 Q54 30 40 36 Q20 40 7 30Z" fill="#fffaf0"/>
<ellipse cx="34" cy="27" rx="10" ry="10" fill="#ffb81f"/>
<ellipse cx="34" cy="31" rx="8" ry="6" fill="#f08a10"/>
<ellipse cx="34" cy="27" rx="3" ry="8.5" fill="#2b1328"/>
<path d="M5 31 Q22 9 46 14 Q54 16 60 8 Q58 18 46 20 Q22 14 7 30Z" fill="#2b1328"/>
<circle cx="29" cy="23" r="3.2" fill="#ffffff"/>
<circle cx="39" cy="32" r="1.7" fill="#ffffff"/>
</svg>`,
  { size: 256 },
);

const markTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
<path d="M20 2 L34 30 L20 62 L6 30Z" fill="#d9304a"/>
<path d="M20 16 L26 31 L20 46 L14 31Z" fill="#f2b83a"/>
</svg>`,
  { size: 128 },
);

const swirlTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path d="M8 54 C8 24 30 6 56 8 C42 16 42 32 30 40 C36 28 26 28 20 38 C18 44 14 50 8 54Z" fill="#d9304a"/>
<path d="M16 48 C18 30 32 18 46 14 C36 22 30 30 24 40 Z" fill="#f2b83a"/>
</svg>`,
  { size: 128 },
);

const sealTex = (() => {
  let star = "";
  let dots = "";
  let ticks = "";
  for (let j = 0; j < 9; j++) {
    const k = (j * 4) % 9;
    const a = (k * 2 * Math.PI) / 9;
    star += `${(100 + 70 * Math.sin(a)).toFixed(1)},${(100 - 70 * Math.cos(a)).toFixed(1)} `;
    dots += `<circle cx="${(100 + 70 * Math.sin(a)).toFixed(1)}" cy="${(100 - 70 * Math.cos(a)).toFixed(1)}" r="4" fill="#ffd27a"/>`;
  }
  for (let j = 0; j < 36; j++) {
    const a = (j * 2 * Math.PI) / 36;
    const r0 = 78;
    const r1 = j % 4 === 0 ? 87 : 83;
    ticks += `<line x1="${(100 + r0 * Math.sin(a)).toFixed(1)}" y1="${(100 - r0 * Math.cos(a)).toFixed(1)}" x2="${(100 + r1 * Math.sin(a)).toFixed(1)}" y2="${(100 - r1 * Math.cos(a)).toFixed(1)}" stroke="#8cecff" stroke-width="1.5"/>`;
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<circle cx="100" cy="100" r="96" fill="none" stroke="#8cecff" stroke-width="2.4"/>
<circle cx="100" cy="100" r="90" fill="none" stroke="#8cecff" stroke-width="1.4"/>
<circle cx="100" cy="100" r="74" fill="none" stroke="#ffd27a" stroke-width="1.6"/>
<circle cx="100" cy="100" r="24" fill="none" stroke="#ffd27a" stroke-width="1.6"/>
${ticks}
<polygon points="${star}" fill="none" stroke="#8cecff" stroke-width="1.7"/>
${dots}
</svg>`,
    { size: 512 },
  );
})();

const keyed = (keys: number[][]) => (t: number): [number, number] => {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, a0, b0] = keys[i - 1];
      const [t1, a1, b1] = keys[i];
      const k = (t - t0) / (t1 - t0);
      return [a0 + (a1 - a0) * k, b0 + (b1 - b0) * k];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
};

export default function build() {
  const b = createBuilder({ name: "kitsune" });

  const flameBlue = flameSvg("#35b8ff", "#8fe8ff", "#ffffff");
  const flameViolet = flameSvg("#8a4dff", "#c9a0ff", "#ffffff");

  // ================= SKELETON =================
  const hips = b.joint("hips", { at: [0, 0.62, -0.3], dir: [0, 0, 1] });

  const full = catmull([
    [0, 0.62, -0.3],
    [0, 0.65, -0.12],
    [0, 0.67, 0.06],
    [0, 0.69, 0.22],
    [0, 0.72, 0.38],
    [0, 0.82, 0.5],
    [0, 0.93, 0.6],
  ]);
  const tNeck = full.closestT([0, 0.72, 0.38]);
  const spine = b.chain("spine", full.slice(0, tNeck), { parent: hips, role: "spine", count: 4 });
  const neck = b.chain("neck", full.slice(tNeck, 1), { parent: spine, role: "neck", count: 2 });

  const headJ = b.joint("head", { parent: neck, at: full.at(1), dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: headJ,
    at: headJ.local({ forward: 0.03, down: 0.05 }),
    aim: headJ.local({ forward: 0.22, down: 0.065 }),
    role: "jaw",
  });

  // ================= BODY =================
  const bodyR = keyed([
    [0, 0.08, 0.09],
    [0.08, 0.105, 0.115],
    [0.25, 0.11, 0.12],
    [0.45, 0.11, 0.125],
    [0.6, 0.135, 0.165],
    [0.75, 0.11, 0.12],
    [1, 0.075, 0.08],
  ]);
  const body = b.sweep(full, bodyR, {
    bone: [spine, neck],
    color: FUR,
    sectors: [
      [-16, 16, RED, 0.06, 0.92],
      [130, 230, CREAM],
    ],
  });
  const bodySurf = b.surface(body);

  // flank swirl markings
  for (const s of [1, -1]) {
    for (const cz of [0.2, -0.16]) {
      const h = bodySurf.around([0, 0.66, cz]).at(s * 90, 12);
      if (h) b.decal(body, swirlTex, { at: h, size: [0.2, 0.2], mirror: s < 0, segments: 12 });
    }
  }

  // neck / chest ruff
  const ruffHits = bodySurf.scatter(70, {
    rng: rng(5),
    minDist: 0.035,
    filter: (h) => h.at.z > 0.3 && h.at.y > 0.64 && h.n.y > -0.5,
  });
  b.cards(ruffHits, tuftTex, {
    size: [0.07, 0.15],
    lean: 65,
    bend: 25,
    vary: 0.3,
    rng: rng(6),
    color: FUR,
  });

  // shimenawa collar with gold beads and bell
  const collar = bodySurf.loop(neck.joints[1], { lift: 0.012 });
  b.sweep(collar, 0.02, { color: RED_D });
  b.along(collar, 14, (at) => {
    b.stick(new THREE.IcosahedronGeometry(0.024, 0), GOLD, at, { embed: 0.3 });
  });
  const bellHit = bodySurf.around([0, 0.8, 0.5]).at(0, -35);
  if (bellHit) b.stick(new THREE.SphereGeometry(0.034, 8, 6), GOLD, bellHit, { embed: 0.3 });

  // ================= LEGS =================
  const legPaint = paint((p) => (p.y < 0.1 ? SOCK : p.y < 0.125 ? GOLD : FUR));
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // foreleg
    const fPts = limb([s * 0.11, 0.6, 0.27], [s * 0.11, 0.035, 0.3], [0.25, 0.22, 0.14], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const foreLeg = b.chain(`legF${side}`, fPts, {
      parent: spine.joints[3],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
      contact: [s * 0.11, 0, 0.33],
    });
    b.sweep(foreLeg, [0.055, 0.042, 0.032, 0.03, 0.03], { color: legPaint });
    b.part(new THREE.SphereGeometry(0.085, 8, 6).scale(0.8, 1.2, 1.1), FUR, {
      bone: foreLeg.joints[0],
      at: [s * 0.115, 0.58, 0.27],
    });
    b.part(new THREE.SphereGeometry(0.04, 8, 6).scale(1, 0.75, 1.5), SOCK, {
      bone: foreLeg.tip ?? foreLeg.joints[foreLeg.joints.length - 1],
      at: [s * 0.11, 0.029, 0.335],
    });

    // hind leg (digitigrade)
    const hPts = limb([s * 0.11, 0.62, -0.22], [s * 0.11, 0.035, -0.3], [0.27, 0.27, 0.17], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hindLeg = b.chain(`legH${side}`, hPts, {
      parent: spine.joints[0],
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
      contact: [s * 0.11, 0, -0.26],
    });
    b.sweep(hindLeg, [0.085, 0.058, 0.036, 0.03, 0.03], { color: legPaint });
    b.part(new THREE.SphereGeometry(0.11, 8, 6).scale(0.8, 1.2, 1.2), FUR, {
      bone: hindLeg.joints[0],
      at: [s * 0.12, 0.56, -0.22],
    });
    b.part(new THREE.SphereGeometry(0.04, 8, 6).scale(1, 0.75, 1.5), SOCK, {
      bone: hindLeg.tip ?? hindLeg.joints[hindLeg.joints.length - 1],
      at: [s * 0.11, 0.029, -0.265],
    });
  }

  // ================= HEAD =================
  const skull = b.part(new THREE.SphereGeometry(0.1, 10, 8).scale(1, 0.88, 1.05), FUR, {
    bone: headJ,
    at: headJ.local({ forward: 0.03, up: 0.02 }),
  });
  const skullSurf = b.surface(skull);

  // muzzle and nose
  b.frustumBox(
    headJ.local({ forward: 0.1, down: 0.0 }),
    headJ.local({ forward: 0.25, down: 0.03 }),
    [0.09, 0.085],
    [0.04, 0.04],
    { bone: headJ, color: FUR },
  );
  b.part(new THREE.SphereGeometry(0.021, 8, 6).scale(1, 0.8, 0.9), NOSE, {
    bone: headJ,
    at: headJ.local({ forward: 0.26, down: 0.028 }),
  });
  // lower jaw
  b.frustumBox(
    headJ.local({ forward: 0.07, down: 0.062 }),
    headJ.local({ forward: 0.22, down: 0.062 }),
    [0.075, 0.035],
    [0.04, 0.025],
    { bone: jaw, color: CREAM },
  );

  for (const s of [1, -1]) {
    // eyes
    const eyeHit = skullSurf.around(skull.at).at(s * 48, 16);
    if (eyeHit) b.decal(skull, eyeTex, { at: eyeHit, size: [0.115, 0.058], mirror: s < 0, segments: 12 });

    // cheek fluff
    b.extrude(
      [
        [0, 0.05],
        [0.09, 0.045, "sharp"],
        [0.04, 0.02],
        [0.12, -0.02, "sharp"],
        [0.045, -0.015],
        [0.08, -0.07, "sharp"],
        [0, -0.05],
      ],
      {
        at: headJ.local({ left: s * 0.07, down: 0.025 }),
        x: [s, 0, -0.4],
        y: [0, 1, 0],
        thickness: 0.02,
        color: FUR,
        bone: headJ,
      },
    );

    // ears
    const lean = 0.3;
    const yDir = [s * Math.sin(lean), Math.cos(lean), -0.15];
    const xDir = [Math.cos(lean), -s * Math.sin(lean), 0];
    const earAt = headJ.local({ left: s * 0.055, up: 0.085, back: 0.02 });
    b.extrude(
      [
        [-0.055, 0],
        [0.055, 0],
        [0.04, 0.09],
        [0, 0.23, "sharp"],
        [-0.04, 0.09],
      ],
      { at: earAt, x: xDir, y: yDir, thickness: 0.024, bevel: 0.004, smoothing: 1, color: FUR, bone: headJ },
    );
    b.extrude(
      [
        [-0.035, 0.015],
        [0.035, 0.015],
        [0.02, 0.09],
        [0, 0.19, "sharp"],
        [-0.02, 0.09],
      ],
      {
        at: headJ.local({ left: s * 0.055, up: 0.09, back: 0.008 }),
        x: xDir,
        y: yDir,
        thickness: 0.016,
        color: RED,
        bone: headJ,
      },
    );
    b.extrude(
      [
        [-0.0175, 0.17],
        [0.0175, 0.17],
        [0, 0.228, "sharp"],
      ],
      { at: earAt, x: xDir, y: yDir, thickness: 0.03, color: DARK, bone: headJ },
    );
  }

  // forehead mark and flame crown
  const browHit = skullSurf.around(skull.at).at(0, 48);
  if (browHit) b.decal(skull, markTex, { at: browHit, size: [0.05, 0.09], segments: 8 });
  const crownHit = skullSurf.around(skull.at).at(180, 80);
  if (crownHit) b.cards([crownHit], flameBlue, { size: [0.1, 0.17], cross: true, sink: 0.2 });

  // ================= NINE TAILS =================
  const names = "ABCDEFGHI";
  for (let i = 0; i < 9; i++) {
    const u = (i - 4) / 4;
    const a = Math.abs(u);
    const c = 1 - a;
    const wob = Math.sin(i * 12.9898) * 0.03;
    const d = (i % 2) * 0.1 + c * 0.05;
    const base = [u * 0.02, 0.66, -0.36];
    const rel = (back: number, lat: number, up: number) => [base[0] + lat, base[1] + up, base[2] - back];
    const pts = [
      rel(0, 0, 0),
      rel(0.2, u * 0.1, 0.1),
      rel(0.4 - 0.05 * a + d, u * 0.3 + wob, 0.33 + 0.06 * c),
      rel(0.5 - 0.1 * a + d, u * 0.58, 0.66 + 0.12 * c),
      rel(0.42 - 0.14 * a + d, u * 0.84 + wob, 0.95 + 0.16 * c + (i % 2) * 0.04),
    ];
    const tailPath = catmull(pts);
    const tail = b.chain(`tail${names[i]}`, tailPath, { parent: hips, role: "tail", count: 4 });
    const tailPaint = gradient(FUR, TIPRED, tailPath.at(0.45), tailPath.at(1));
    const tube = b.sweep(tail, [0.035, 0.075, 0.105, 0.11, 0.085, 0.045, 0], {
      color: tailPaint,
      caps: "point",
    });

    // fluffy fur cards along the plume
    const hits = b.surface(tube).scatter(24, { rng: rng(100 + i), minDist: 0.06 });
    b.cards(hits, tuftTex, {
      size: [0.05, 0.12],
      lean: 55,
      bend: 20,
      vary: 0.3,
      rng: rng(200 + i),
      color: tailPaint,
      flow: (f) => tailPath.tangentAt(tailPath.closestT(f.at)),
    });

    // spirit fire on the tip, plus licks along the last stretch
    const tex = i % 2 ? flameViolet : flameBlue;
    b.cards([tail.at(1)], tex, { size: [0.2, 0.38], cross: true, sink: 0.2 });
    b.cards([tail.at(0.88)], tex, { size: [0.09, 0.18], lean: 55, bend: 20, flow: [1, 0, 0], sink: 0.1 });
    b.cards([tail.at(0.74)], tex, { size: [0.09, 0.18], lean: 55, bend: 20, flow: [-1, 0, 0], sink: 0.1 });
  }

  // ================= FOXFIRE WISPS =================
  const orbPts: number[][] = [
    [0.75, 0.45, 0.75],
    [-0.8, 0.7, 0.6],
    [0.95, 1.05, 0.15],
    [-1.0, 1.3, -0.05],
    [0.45, 1.35, 0.95],
    [-0.45, 1.1, 1.0],
    [0.0, 1.6, 0.4],
  ];
  orbPts.forEach((p, i) => {
    const w = b.joint(`wisp${i + 1}`, { parent: hips, at: p, dir: [0, 1, 0] });
    b.part(new THREE.IcosahedronGeometry(0.05, 0), ORB, { bone: w, at: p });
    b.cards([frame([p[0], p[1] + 0.035, p[2]], [0, 1, 0])], i % 2 ? flameViolet : flameBlue, {
      size: [0.15, 0.26],
      cross: true,
      bone: w,
      sink: 0.2,
    });
  });

  // ================= GROUND SEAL =================
  b.part(new THREE.CircleGeometry(1.25, 32), "#ffffff", {
    bone: hips,
    at: [0, 0.004, 0],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: sealTex,
  });

  return b.root;
}
