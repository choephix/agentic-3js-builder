import * as THREE from "three";
import { createBuilder, rng, catmull, limb, paint, noise, svg } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded, Genshin-style red panda balancing on a moss-covered boulder, with a ringed tail raised for balance, anime eyes, bamboo and glowing mushrooms.",
};

export default function build() {
  const b = createBuilder({ name: "redPanda" });

  // ---------------------------------------------------------------- palette
  const RED = cel("#e9692b");
  const RUST = cel("#b8431f");
  const DARK = cel("#4a2a24", "#2c1819");
  const CREAM = cel("#fff3dc", "#f1cfaa");
  const NOSE = cel("#2b1a28", INK);
  const MOSS_LIT = cel("#72c84c", "#2f8f4e");
  const MOSS_DK = cel("#4f9e3c", "#2a7447");
  const STONE_A = cel("#9fabb8", "#6c7396");
  const STONE_B = cel("#8793a3", "#5d6488");
  const BAMBOO = cel("#93d25c", "#3f9a55");
  const BAMBOO_NODE = cel("#5f9d3c", "#2f6f45");
  const LEAF = cel("#6fc24a", "#2f8a4c");

  const BODY = furEdge(RED, DARK, { level: -0.35, teeth: 0.22, period: 0.035, ink: INK, inkWidth: 0.05 });

  const STONE = paint((p, n) => {
    const m = n.y * 0.55 + (noise(p, 0.16, 5) - 0.5) * 1.1 + (p.y > 0.2 ? 0.2 : 0);
    if (m > 0.55) return noise(p, 0.05, 9) > 0.55 ? MOSS_LIT : MOSS_DK;
    if (m > 0.42) return MOSS_DK;
    return noise(p, 0.1, 7) > 0.58 ? STONE_B : STONE_A;
  });

  const STONE_TOP = 0.31;

  // ---------------------------------------------------------------- skeleton
  const root = b.joint("root", { at: [0, 0, 0] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.49, -0.2],
      [0, 0.5, -0.08],
      [0, 0.51, 0.05],
      [0, 0.52, 0.17],
    ]),
    { parent: root, names: ["hips", "spine", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.52, 0.17],
      [0, 0.555, 0.22],
      [0, 0.585, 0.27],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.585, 0.27], dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.08, down: 0.035 }),
    aim: head.local({ forward: 0.17, down: 0.04 }),
    role: "jaw",
  });

  // ---------------------------------------------------------------- stone & scenery (static, on root)
  const stone = b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.4, 0.06],
      [0.37, 0.18],
      [0.31, 0.27],
      [0.25, STONE_TOP],
      [0, STONE_TOP],
    ],
    { at: [0, 0, 0], bone: root, segments: 9, spin: 10, color: STONE },
  );

  const rg = rng(5);
  const rocks: [number[], number[], number][] = [
    [[0.44, 0, 0.2], [0.14, 0.1, 0.12], 20],
    [[-0.41, 0, -0.1], [0.12, 0.09, 0.13], 70],
    [[0.22, 0, -0.42], [0.12, 0.08, 0.1], 40],
    [[-0.28, 0, 0.38], [0.1, 0.075, 0.11], 10],
  ];
  for (const [pos, sc, rot] of rocks) {
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      bone: root,
      at: [pos[0], sc[1] * 0.9, pos[2]],
      scale: sc,
      rotation: [0, rot, 0],
      flat: true,
    });
  }

  // moss clumps hugging the upper slope
  const stoneSkin = b.surface(stone);
  for (let i = 0; i < 16; i++) {
    const az = i * 22.5 + rg() * 10;
    const hit = stoneSkin.around([0, 0.15, 0]).at(az, 38 + rg() * 14);
    if (!hit) continue;
    b.stick(new THREE.IcosahedronGeometry(0.045 + rg() * 0.03, 0), i % 2 ? MOSS_LIT : MOSS_DK, hit, {
      embed: 0.45,
      scale: [1.3, 0.7, 1.3],
      flat: true,
    });
  }

  // glowing mushrooms at the base
  const mushroom = (x: number, z: number, h: number, r: number) => {
    b.part(new THREE.CylinderGeometry(r * 0.22, r * 0.3, h, 6), "#f6efd8", { bone: root, at: [x, h / 2, z] });
    glow(
      b.part(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#7ff2d8", {
        bone: root,
        at: [x, h, z],
      }),
      1.3,
    );
  };
  mushroom(0.37, 0.33, 0.07, 0.034);
  mushroom(0.44, 0.38, 0.045, 0.022);
  mushroom(-0.36, 0.3, 0.06, 0.03);

  // floating dendro motes
  const motes = [
    [0.45, 0.62, 0.25],
    [0.5, 0.85, -0.05],
    [0.3, 0.98, 0.3],
    [-0.2, 1.0, 0.3],
    [0.55, 0.5, -0.2],
    [-0.35, 0.78, 0.38],
    [0.15, 1.05, 0.4],
  ];
  motes.forEach((m, i) => {
    glow(
      b.part(new THREE.OctahedronGeometry(0.012 + (i % 3) * 0.003, 0), "#c4ff80", {
        bone: root,
        at: m,
        scale: [1, 1.5, 1],
        rotation: [0, i * 30, 0],
        flat: true,
      }),
      1.6,
    );
  });

  // bamboo
  const bamboo = (pts: number[][], leafTs: number[], seed: number) => {
    const path = catmull(pts);
    b.sweep(path, [0.018, 0.012], { bone: root, color: BAMBOO, caps: { start: "flat", end: "round" }, sides: 8 });
    b.along(path, 5, (at) =>
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 8), BAMBOO_NODE, { frame: at, bone: root }),
    );
    leafTs.forEach((t, i) => {
      const base = path.at(t);
      for (let k = 0; k < 2; k++) {
        const th = (seed + i * 2 + k) * 1.9 + k * Math.PI;
        const d = new THREE.Vector3(Math.sin(th) * 0.85, -0.3, Math.cos(th) * 0.85).normalize();
        const yy = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize();
        b.extrude(
          [
            [0, 0],
            [0.06, 0.018],
            [0.17, 0, "sharp"],
            [0.06, -0.018],
          ],
          { at: base, x: d, y: yy, thickness: 0.004, smoothing: 1, color: LEAF, bone: root },
        );
      }
    });
  };
  bamboo(
    [
      [-0.55, 0, -0.12],
      [-0.56, 0.4, -0.12],
      [-0.5, 0.85, -0.1],
    ],
    [0.55, 0.72, 0.88],
    1,
  );
  bamboo(
    [
      [-0.64, 0, 0.06],
      [-0.65, 0.3, 0.05],
      [-0.6, 0.62, 0.02],
    ],
    [0.6, 0.85],
    4,
  );

  // ---------------------------------------------------------------- body
  b.loft(
    [
      { at: [0, 0.48, -0.26], w: 0.1, h: 0.1 },
      { at: [0, 0.49, -0.17], w: 0.2, h: 0.18 },
      { at: [0, 0.5, -0.03], w: 0.22, h: 0.19 },
      { at: [0, 0.51, 0.1], w: 0.22, h: 0.19 },
      { at: [0, 0.52, 0.19], w: 0.17, h: 0.16 },
    ],
    { bone: spine, color: BODY },
  );
  b.sweep(neck, [0.08, 0.09], { color: BODY });

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // front leg
    const fp = limb([s * 0.09, 0.455, 0.13], [s * 0.075, STONE_TOP + 0.018, 0.19], [0.075, 0.07], [[0, 0, -1]]);
    const front = b.chain(`legF${side}`, fp, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `paw${side}`],
      role: "leg",
    });
    b.sweep(front, [0.048, 0.03], { color: DARK });
    const fTip = front.joints[2];
    const fEnd = fp[2];
    b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
      bone: fTip,
      at: [fEnd.x, fEnd.y, fEnd.z + 0.012],
      scale: [0.03, 0.02, 0.04],
    });
    for (const dx of [-0.012, 0, 0.012])
      b.spike([fEnd.x + dx, fEnd.y - 0.004, fEnd.z + 0.04], [0, -0.2, 1], 0.015, 0.004, { color: CREAM, bone: fTip });

    // hind leg
    const hp = limb([s * 0.095, 0.46, -0.19], [s * 0.08, STONE_TOP + 0.018, -0.15], [0.08, 0.075], [[0, 0, 1]]);
    const hind = b.chain(`legH${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(hind, [0.056, 0.03], { color: DARK });
    b.part(new THREE.SphereGeometry(1, 10, 8), BODY, {
      bone: hind.joints[0],
      at: [s * 0.088, 0.455, -0.18],
      scale: [0.06, 0.075, 0.08],
    });
    const hTip = hind.joints[2];
    const hEnd = hp[2];
    b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
      bone: hTip,
      at: [hEnd.x, hEnd.y, hEnd.z + 0.02],
      scale: [0.032, 0.02, 0.05],
    });
    for (const dx of [-0.012, 0, 0.012])
      b.spike([hEnd.x + dx, hEnd.y - 0.004, hEnd.z + 0.065], [0, -0.2, 1], 0.015, 0.004, { color: CREAM, bone: hTip });
  }

  // ---------------------------------------------------------------- tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.5, -0.24],
      [0, 0.505, -0.37],
      [0, 0.55, -0.5],
      [0, 0.66, -0.58],
      [0, 0.78, -0.58],
      [0, 0.88, -0.52],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );
  b.sweep(tail, [0.05, 0.07, 0.085, 0.09, 0.08, 0.06, 0.03], {
    bands: [
      [0.14, RED],
      [0.26, RUST],
      [0.38, RED],
      [0.5, RUST],
      [0.62, RED],
      [0.74, RUST],
      [0.86, RED],
      [1, DARK],
    ],
  });

  // ---------------------------------------------------------------- head
  const hy = head.at.y;
  const FACE = furEdge(RED, CREAM, {
    by: "position",
    level: hy - 0.015,
    teeth: 0.014,
    period: 0.024,
    along: [1, 0, 0],
    ink: INK,
    inkWidth: 0.003,
  });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), FACE, {
    bone: head,
    at: head.local({ forward: 0.055, up: 0.01 }),
    scale: [0.1, 0.085, 0.09],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: head,
    at: head.local({ forward: 0.135, up: -0.022 }),
    scale: [0.036, 0.028, 0.042],
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.172, up: -0.008 }),
    scale: [0.014, 0.011, 0.012],
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), CREAM, {
    bone: jaw,
    at: head.local({ forward: 0.12, down: 0.048 }),
    scale: [0.03, 0.014, 0.04],
  });

  // little philtrum and smile
  b.rod(head.local({ forward: 0.176, up: -0.016 }), head.local({ forward: 0.1725, up: -0.036 }), 0.0013, INK, {
    bone: head,
  });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        head.local({ forward: 0.1725, up: -0.036 }),
        head.local({ left: s * 0.012, forward: 0.1625, up: -0.042 }),
        head.local({ left: s * 0.024, forward: 0.153, up: -0.04 }),
      ]),
      0.0013,
      { color: INK, bone: head, sides: 4 },
    );
  }

  // cheek tufts
  for (const s of [1, -1])
    for (let k = 0; k < 3; k++)
      b.spike(
        head.local({ left: s * 0.085, forward: 0.03, up: -0.01 - k * 0.022 }),
        [s * 0.9, -0.1 - k * 0.1, -0.35],
        0.065 - k * 0.008,
        0.017,
        { color: CREAM, bone: head, sides: 5 },
      );

  // forehead tuft
  b.spike(head.local({ forward: 0.07, up: 0.08 }), [0, 0.8, 0.4], 0.05, 0.014, { color: RED, bone: head, sides: 5 });

  // ears
  const th = (22 * Math.PI) / 180;
  for (const s of [1, -1]) {
    const ex: [number, number, number] = [s * Math.cos(th), -Math.sin(th), 0];
    const ey: [number, number, number] = [s * Math.sin(th), Math.cos(th), 0];
    b.extrude(
      [
        [-0.05, 0],
        [-0.056, 0.055],
        [0, 0.1],
        [0.056, 0.055],
        [0.05, 0],
      ],
      {
        at: head.local({ left: s * 0.068, up: 0.052, forward: 0.02 }),
        x: ex,
        y: ey,
        thickness: 0.02,
        bevel: 0.004,
        smoothing: 1,
        color: RED,
        bone: head,
      },
    );
    b.extrude(
      [
        [-0.03, 0.004],
        [-0.034, 0.045],
        [0, 0.078],
        [0.034, 0.045],
        [0.03, 0.004],
      ],
      {
        at: head.local({ left: s * 0.068, up: 0.054, forward: 0.032 }),
        x: ex,
        y: ey,
        thickness: 0.012,
        smoothing: 1,
        color: CREAM,
        bone: head,
      },
    );
  }

  // eyes, tear marks, brow spots
  const EYE = animeEye({ iris: "#ffa11f" });
  const TEAR = svg(
    `<svg viewBox="0 0 20 40" xmlns="http://www.w3.org/2000/svg"><path d="M10 2 Q17 20 9 38" stroke="#b0431f" stroke-width="7" stroke-linecap="round" fill="none"/></svg>`,
    { size: 128 },
  );
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.around(skull.at).at(s * 40, 4);
    if (eyeHit) b.decal(skull, EYE, { at: eyeHit, size: [0.046, 0.063], mirror: s > 0 });
    const tearHit = skin.around(skull.at).at(s * 28, -22);
    if (tearHit) b.decal(skull, TEAR, { at: tearHit, size: [0.018, 0.045], roll: -s * 12, mirror: s > 0 });
    const browHit = skin.around(skull.at).at(s * 34, 32);
    if (browHit) b.stick(new THREE.SphereGeometry(0.014, 6, 4), CREAM, browHit, { embed: 0.4 });
  }

  return b.root;
}
