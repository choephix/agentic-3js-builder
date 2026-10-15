import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle, noise, paint, stripes } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { arc, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, furEdge } from "../../../../kits/toon";

export const meta = {
  name: "Floating Sky Island",
  description:
    "A cel-shaded sky island drifting over the clouds: a ruined elemental gate with a glowing rune platform, a pond feeding a waterfall that spills off the edge, blossom and pine trees, a wooden bridge, stone lantern, crystals and small floating islets.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "floatingIsland" });
  b.joint("island", { at: [0, 0.5, 0] });
  const rand = rng(21);
  const P = (g: THREE.BufferGeometry, c: Fill, at: readonly number[], o: PartOptions = {}) =>
    b.part(g, c, { at, ...o });

  // ---------------------------------------------------------------- palette
  const GOLD = "#e8b94a";
  const GOLD_D = "#b88a2c";
  const CYAN = "#7ff3ff";
  const WOOD_D = "#6b4129";
  const PINK = "#ff8fb8";
  const ROCK_A = "#8c7b66";
  const ROCK_B = "#76685a";
  const STONEP = cel(
    paint((p) => (noise(p, 0.09, 5) < 0.3 ? "#cfc3a8" : "#e9dfc9")),
    "#a9a2b8",
  );
  const ROCKCEL = cel(
    stripes("#a59378", "#8c7a68", { size: 0.1, axis: "y", width: 0.5, wobble: 0.4, seed: 4 }),
    "#756877",
  );
  const WOOD = cel(grain("#8a5a3a", "#6b4129", { size: 0.012, axis: "z" }), "#58364f");
  const BARK = cel(grain("#8a5a3a", "#6b4129", { size: 0.015, axis: "y" }), "#573a4d");
  const BARK_PINK = cel(grain("#8c6552", "#6e4a3c", { size: 0.015, axis: "y" }), "#5a3d4f");
  const CLOUD = cel("#ffffff", "#c9dcf2");
  const PINE = cel("#3f9d6a", "#2b6f77");
  const PINE2 = cel("#4fb06a", "#337a78");

  const rockPaint = (level: number, deep: number, teeth: number, period: number) => {
    const strata = stripes("#a59378", "#8c7a68", { size: 0.1, axis: "y", width: 0.5, wobble: 0.4, seed: 4 });
    const body = paint((p) => (p.y < deep + 0.1 * noise(p, 0.2, 2) ? "#6d5f57" : strata));
    return cel(
      furEdge(mottle("#92d95c", "#7cc84f", { size: 0.15, seed: 2 }), body, {
        by: "position",
        axis: [0, 1, 0],
        level,
        teeth,
        period,
        along: [1, 0, 1],
      }),
      undefined,
    );
  };

  // ---------------------------------------------------------------- textures
  const GRASS_TEX = svg(
    `<svg viewBox="0 0 40 60"><path d="M20 60 C18 40 10 22 4 4 C16 18 23 38 25 60Z" fill="#6cc24a"/><path d="M16 60 C18 38 22 20 24 2 C30 20 28 42 28 60Z" fill="#8fdc5a"/><path d="M22 60 C26 44 32 30 38 16 C36 36 32 48 32 60Z" fill="#4fa84a"/></svg>`,
    { size: 128 },
  );
  const leafSvg = (fill: string, rib: string) =>
    svg(
      `<svg viewBox="0 0 32 40"><path d="M16 40 C2 28 2 10 16 0 C30 10 30 28 16 40Z" fill="${fill}"/><path d="M16 38 L16 8" stroke="${rib}" stroke-width="1.6" fill="none"/></svg>`,
      { size: 96 },
    );
  const LEAVES = [leafSvg("#7ccf4c", "#4fa23c"), leafSvg("#b5e060", "#7fb83c"), leafSvg("#5fbf55", "#3e8f3e")];
  const PETALS = [leafSvg("#ffb3cf", "#ff86b0"), leafSvg("#ffd0e2", "#ff9bc0")];
  const VINE = svg(
    `<svg viewBox="0 0 24 100"><path d="M12 0 C8 25 16 50 12 100" stroke="#4a9a3a" stroke-width="3" fill="none"/><ellipse cx="6" cy="22" rx="6" ry="3.5" transform="rotate(-30 6 22)" fill="#7ccf4c"/><ellipse cx="18" cy="42" rx="6" ry="3.5" transform="rotate(30 18 42)" fill="#5fbf55"/><ellipse cx="6" cy="62" rx="6" ry="3.5" transform="rotate(-30 6 62)" fill="#7ccf4c"/><ellipse cx="18" cy="82" rx="6" ry="3.5" transform="rotate(30 18 82)" fill="#5fbf55"/></svg>`,
    { size: 200 },
  );
  const flowerSvg = (c: string) =>
    svg(
      `<svg viewBox="0 0 24 36"><path d="M12 36 L12 12" stroke="#4a9a3a" stroke-width="2.5" fill="none"/><circle cx="12" cy="5" r="4" fill="${c}"/><circle cx="18" cy="10" r="4" fill="${c}"/><circle cx="6" cy="10" r="4" fill="${c}"/><circle cx="9" cy="16" r="4" fill="${c}"/><circle cx="15" cy="16" r="4" fill="${c}"/><circle cx="12" cy="11" r="3.2" fill="#ffd84a"/></svg>`,
      { size: 96 },
    );
  const FLOWERS = [flowerSvg("#ffffff"), flowerSvg("#ff8fb8"), flowerSvg("#ffd84a")];
  const TASSEL = svg(
    `<svg viewBox="0 0 24 80"><path d="M3 0 L21 0 L19 40 L5 40Z" fill="#c8443a"/><path d="M7 0 L7 40 M12 0 L12 40 M17 0 L17 40" stroke="#e8685a" stroke-width="1.5" fill="none"/><circle cx="12" cy="46" r="6" fill="#e8b94a"/><rect x="10.5" y="52" width="3" height="28" fill="#c8443a"/></svg>`,
    { size: 160 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 100 100" fill="none" stroke="#7ff3ff" stroke-width="1.4"><circle cx="50" cy="50" r="48"/><circle cx="50" cy="50" r="43"/><circle cx="50" cy="50" r="29"/><circle cx="50" cy="50" r="8"/><path d="M50 21 L75 64 L25 64Z"/><path d="M50 79 L25 36 L75 36Z"/><path d="M50 2 L50 7 M50 93 L50 98 M2 50 L7 50 M93 50 L98 50 M16 16 L20 20 M84 16 L80 20 M16 84 L20 80 M84 84 L80 80"/><circle cx="50" cy="21" r="3"/><circle cx="75" cy="64" r="3"/><circle cx="25" cy="64" r="3"/><circle cx="50" cy="79" r="3"/><circle cx="25" cy="36" r="3"/><circle cx="75" cy="36" r="3"/></svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------- terrain
  const OUT: OutlinePoint[] = [
    [0, 0],
    [0.1, 0.08],
    [0.3, 0.22],
    [0.55, 0.42],
    [0.8, 0.62],
    [1.0, 0.8],
    [1.12, 0.93],
    [1.15, 1.0],
    [1.1, 1.07],
    [0.6, 1.09],
    [0, 1.1],
  ];
  const TOP: Array<[number, number]> = [
    [0, 1.1],
    [0.6, 1.09],
    [1.1, 1.07],
    [1.15, 1.0],
  ];
  const groundY = (x: number, z: number) => {
    const r = Math.hypot(x, z);
    for (let i = 0; i < TOP.length - 1; i++) {
      if (r <= TOP[i + 1][0]) {
        const t = (r - TOP[i][0]) / (TOP[i + 1][0] - TOP[i][0]);
        return TOP[i][1] + (TOP[i + 1][1] - TOP[i][1]) * t;
      }
    }
    return 1.0;
  };
  const SIDE: Array<[number, number]> = [
    [0.1, 0.08],
    [0.3, 0.22],
    [0.55, 0.42],
    [0.8, 0.62],
    [1.0, 0.8],
    [1.12, 0.93],
  ];
  const radiusAt = (y: number) => {
    for (let i = 0; i < SIDE.length - 1; i++) {
      if (y <= SIDE[i + 1][1]) {
        const t = (y - SIDE[i][1]) / (SIDE[i + 1][1] - SIDE[i][1]);
        return SIDE[i][0] + (SIDE[i + 1][0] - SIDE[i][0]) * t;
      }
    }
    return 1.12;
  };

  b.lathe(OUT, { at: [0, 0, 0], segments: 16, color: rockPaint(0.88, 0.3, 0.07, 0.09), name: "island" });

  // stalactites and rock chunks on the underside
  for (let i = 0; i < 11; i++) {
    const a = i * 0.57 + rand() * 0.3;
    const y = 0.5 + rand() * 0.35;
    const r = radiusAt(y) * 0.93;
    const len = 0.14 + rand() * 0.2;
    b.spike([r * Math.sin(a), y, r * Math.cos(a)], [0, -1, 0], len, 0.03 + rand() * 0.035, {
      color: i % 2 ? ROCK_A : ROCK_B,
      sides: 6,
    });
  }
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7 + 0.2;
    const y = 0.45 + rand() * 0.45;
    const r = radiusAt(y) * 0.99;
    const s = 0.06 + rand() * 0.06;
    P(new THREE.DodecahedronGeometry(s, 0), ROCKCEL, [r * Math.sin(a), y, r * Math.cos(a)], {
      rotation: [rand() * 90, rand() * 90, 0],
      scale: [1, 0.8, 1],
      flat: true,
    });
  }
  // crystals under the island
  const crystal = (base: number[], dir: number[], len: number, r: number, c: string, str: number) =>
    glow(b.spike(base, dir, len, r, { color: c, sides: 6 }), str);
  const CRYS = ["#6ee8ff", "#9af7ff", "#55c8ff"];
  for (let k = 0; k < 4; k++) {
    const a = k * 1.6 + 0.4;
    const y = 0.5;
    const r = radiusAt(y) * 0.9;
    const base = [r * Math.sin(a), y, r * Math.cos(a)];
    for (let j = 0; j < 3; j++) {
      const aa = a + (j - 1) * 0.18;
      crystal(
        [base[0] + (j - 1) * 0.03, base[1] - j * 0.03, base[2]],
        [Math.sin(aa) * 0.5, -0.9, Math.cos(aa) * 0.5],
        0.14 + 0.05 * (j % 2),
        0.028,
        CRYS[(k + j) % 3],
        1.2,
      );
    }
  }
  // hanging vines around the rim
  {
    const fr: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 18; i++) {
      const a = i * 0.35 + rand() * 0.2;
      const r = 1.12 + (rand() - 0.5) * 0.03;
      const x = r * Math.sin(a);
      const z = r * Math.cos(a);
      if (Math.hypot(x - 1.13, z - 0.3) < 0.2) continue;
      fr.push(frame([x, 0.96, z], [0, 1, 0]));
    }
    b.cards(fr, VINE, { size: [0.07, 0.2], lean: 180, flow: [0, 0, 1], vary: 0.4, spin: 180, rng: rng(5), cross: true });
  }

  // ---------------------------------------------------------------- ruins
  const C = [0.3, -0.4];
  const pillar = (x: number, z: number, y0: number, h: number, broken: boolean) => {
    const r = 0.055;
    const prof: OutlinePoint[] = broken
      ? [
          [0, 0],
          [r * 1.25, 0],
          [r * 1.25, 0.035],
          [r, 0.05],
          [r * 0.95, h - 0.08],
          [r * 0.8, h - 0.03],
          [r * 0.45, h],
          [0, h - 0.02],
        ]
      : [
          [0, 0],
          [r * 1.25, 0],
          [r * 1.25, 0.035],
          [r, 0.05],
          [r * 0.95, h - 0.05],
          [r * 1.2, h - 0.035],
          [r * 1.2, h],
          [0, h],
        ];
    const col = cel(
      paint((p, _n, s) =>
        s[0] < 0.07
          ? "#7bb34f"
          : noise(p, 0.08, 5) < 0.28
            ? "#cfc3a8"
            : Math.floor(s[1] / 45) % 2 === 0
              ? "#e9dfc9"
              : "#d8ccb2",
      ),
      "#a9a2b8",
    );
    b.lathe(prof, { at: [x, y0, z], segments: 8, color: col });
    P(new THREE.CylinderGeometry(r * 1.03, r * 1.03, 0.012, 8), GOLD, [x, y0 + 0.075, z]);
    if (!broken) {
      P(new THREE.CylinderGeometry(r * 1.03, r * 1.03, 0.012, 8), GOLD, [x, y0 + h - 0.075, z]);
      P(new THREE.CylinderGeometry(r * 1.24, r * 1.24, 0.008, 8), GOLD_D, [x, y0 + h - 0.002, z]);
    } else {
      for (let k = 0; k < 3; k++)
        P(new THREE.BoxGeometry(0.04, 0.03, 0.04), STONEP, [x + (rand() - 0.5) * 0.18, y0 + 0.015, z + (rand() - 0.5) * 0.18], {
          rotation: [0, rand() * 90, 0],
        });
    }
  };
  const PY = 1.06;
  const platformTop = PY + 0.07;
  b.lathe(
    [
      [0, 0],
      [0.46, 0],
      [0.46, 0.035],
      [0.4, 0.035],
      [0.4, 0.07],
      [0, 0.07],
    ],
    { at: [C[0], PY, C[1]], segments: 12, color: STONEP },
  );
  P(new THREE.TorusGeometry(0.405, 0.006, 4, 24), GOLD, [C[0], platformTop + 0.001, C[1]], { rotation: [90, 0, 0] });
  glow(
    P(new THREE.PlaneGeometry(0.72, 0.72), "#ffffff", [C[0], platformTop + 0.004, C[1]], {
      dir: [0, 1, 0],
      axis: "z",
      texture: RUNE,
    }),
    1.2,
  );
  const ringAng = [-70, -35, 0, 35, 70];
  const ringH = [0.18, 0.4, 0.26, 0.46, 0.2];
  ringAng.forEach((a, i) => {
    const ar = (a * Math.PI) / 180;
    pillar(C[0] + Math.sin(ar) * 0.3, C[1] + Math.cos(ar) * 0.3, platformTop - 0.005, ringH[i], i % 2 === 0);
  });
  // gate
  const gz = C[1] - 0.3;
  const yb = platformTop - 0.005;
  const gh = 0.55;
  pillar(C[0] - 0.2, gz, yb, gh, false);
  pillar(C[0] + 0.2, gz, yb, gh, false);
  const ytop = yb + gh;
  b.sweep(arc([C[0], ytop, gz], [C[0] + 0.2, ytop, gz], [0, 0, 1], 180), 0.042, {
    section: "box",
    caps: "flat",
    color: cel(paint((p) => (noise(p, 0.08, 5) < 0.3 ? "#cfc3a8" : "#e9dfc9")), "#a9a2b8"),
  });
  b.sweep(arc([C[0], ytop, gz + 0.044], [C[0] + 0.2, ytop, gz + 0.044], [0, 0, 1], 180), 0.012, {
    section: "box",
    caps: "flat",
    color: GOLD,
  });
  P(new THREE.BoxGeometry(0.075, 0.07, 0.11), GOLD, [C[0], ytop + 0.2, gz]);
  P(new THREE.BoxGeometry(0.05, 0.045, 0.115), GOLD_D, [C[0], ytop + 0.2, gz]);
  glow(P(new THREE.SphereGeometry(0.055, 8, 6), "#bffcff", [C[0], yb + 0.36, gz]), 1.5);
  P(new THREE.TorusGeometry(0.085, 0.006, 4, 18), GOLD, [C[0], yb + 0.36, gz], { rotation: [70, 20, 0] });
  P(new THREE.TorusGeometry(0.1, 0.005, 4, 18), GOLD_D, [C[0], yb + 0.36, gz], { rotation: [20, 0, 60] });
  for (let k = 0; k < 4; k++) {
    const a = k * 1.57;
    glow(P(new THREE.SphereGeometry(0.014, 5, 4), GOLD, [C[0] + Math.cos(a) * 0.1, yb + 0.36 + Math.sin(a) * 0.04, gz + Math.sin(a) * 0.09]), 1);
  }
  {
    const tf: ReturnType<typeof frame>[] = [];
    for (const dx of [-0.1, 0, 0.1]) {
      const y = ytop + Math.sqrt(0.04 - dx * dx) - 0.045;
      tf.push(frame([C[0] + dx, y, gz + 0.05], [0, 1, 0]));
    }
    b.cards(tf, TASSEL, { size: [0.05, 0.2], lean: 180, flow: [0, 0, 1], sink: 0 });
    const vf: ReturnType<typeof frame>[] = [];
    for (let k = 1; k < 9; k++) {
      const a = (k * 20 * Math.PI) / 180;
      vf.push(frame([C[0] + Math.cos(a) * 0.2, ytop + Math.sin(a) * 0.2, gz + 0.045], [0, 1, 0]));
    }
    b.cards(vf, VINE, { size: [0.05, 0.14], lean: 180, flow: [0, 0, 1], vary: 0.5, rng: rng(8), cross: true });
  }
  // fallen column, steps, stepping stones
  P(new THREE.CylinderGeometry(0.05, 0.055, 0.3, 8), STONEP, [0.78, 1.125, -0.3], { rotation: [90, 0, 35] });
  P(new THREE.CylinderGeometry(0.056, 0.056, 0.012, 8), GOLD, [0.78, 1.125, -0.3], { rotation: [90, 0, 35] });
  P(new THREE.BoxGeometry(0.3, 0.03, 0.1), STONEP, [C[0], 1.08, C[1] + 0.5]);
  P(new THREE.BoxGeometry(0.24, 0.03, 0.08), STONEP, [C[0], 1.1, C[1] + 0.47]);
  for (let k = 0; k < 6; k++) {
    const t = k / 5;
    P(
      new THREE.CylinderGeometry(0.045 + (k % 2) * 0.01, 0.05, 0.02, 7),
      STONEP,
      [0.28 - t * 0.15 + (k % 2) * 0.03, groundY(0.2, 0.3) - 0.005, 0.2 + t * 0.5],
      { rotation: [0, k * 20, 0] },
    );
  }
  // ruined wall
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col % 2 === 1) continue;
      if (row === 1 && col === 4) continue;
      P(
        new THREE.BoxGeometry(0.075, 0.05, 0.06),
        STONEP,
        [-0.5 + col * 0.078 + (row % 2) * 0.035, 1.085 + row * 0.052, -0.78 + col * 0.02],
        { rotation: [0, -14 + (rand() - 0.5) * 6, 0] },
      );
    }
  P(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 8), GOLD, [-0.45, 1.17, -0.745], { rotation: [90, 0, 0] });

  // ---------------------------------------------------------------- pond, stream, waterfall, bridge
  const PX = 0.5;
  const PZ = 0.35;
  b.lathe(
    [
      [0, 0],
      [0.27, 0],
      [0.27, 0.01],
      [0, 0.01],
    ],
    {
      at: [PX, 1.084, PZ],
      segments: 14,
      color: paint((p) => {
        const d = Math.hypot(p.x - PX, p.z - PZ);
        if (Math.abs(d - 0.15) < 0.006) return "#e8fbff";
        return d > 0.23 ? "#a9eef8" : d < 0.1 ? "#3fa8d8" : "#5fc8ea";
      }),
    },
  );
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.5) continue;
    const s = 0.035 + rand() * 0.02;
    P(new THREE.DodecahedronGeometry(s, 0), ROCKCEL, [PX + Math.cos(a) * 0.29, 1.09 + s * 0.2, PZ + Math.sin(a) * 0.29], {
      rotation: [rand() * 90, rand() * 90, 0],
      scale: [1, 0.7, 1],
      flat: true,
    });
  }
  // lily pads, lotus, koi
  for (const [dx, dz] of [
    [-0.1, -0.05],
    [0.05, 0.12],
    [-0.05, 0.14],
    [0.12, -0.1],
  ])
    P(new THREE.CylinderGeometry(0.045, 0.045, 0.006, 10), "#58b85a", [PX + dx, 1.098, PZ + dz]);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    b.spike([PX + 0.08 + Math.cos(a) * 0.012, 1.1, PZ - 0.02 + Math.sin(a) * 0.012], [Math.cos(a), 1.2, Math.sin(a)], 0.06, 0.018, {
      color: PINK,
      sides: 5,
    });
  }
  P(new THREE.SphereGeometry(0.012, 5, 4), GOLD, [PX + 0.08, 1.105, PZ - 0.02]);
  for (const [dx, dz, rot] of [
    [0.02, 0.0, 30],
    [-0.12, 0.08, 200],
  ]) {
    P(new THREE.SphereGeometry(0.03, 6, 5), "#ff8a3a", [PX + dx, 1.093, PZ + dz], { scale: [0.5, 0.35, 1.3], rotation: [0, rot, 0] });
    P(new THREE.ConeGeometry(0.018, 0.04, 4), "#ffe1c2", [PX + dx + Math.sin((rot * Math.PI) / 180) * -0.045, 1.093, PZ + dz + Math.cos((rot * Math.PI) / 180) * -0.045], {
      rotation: [90, rot, 0],
    });
  }
  // stream
  b.sweep(
    catmull([
      [0.72, 1.087, 0.33],
      [0.85, 1.084, 0.36],
      [0.98, 1.08, 0.32],
      [1.1, 1.07, 0.3],
      [1.14, 1.045, 0.3],
    ]),
    (t) => [0.05 + 0.04 * t, 0.012],
    { section: "box", caps: "flat", color: stripes("#6fd3f0", "#dff8ff", { size: 0.05, axis: "x", width: 0.25, wobble: 0.8, seed: 3 }) },
  );
  // waterfall sheets
  const FALL = paint((p) => {
    const v = Math.sin(p.z * 95 + noise(p, 0.08, 7) * 6 + p.y * 3);
    const foam = p.y < 0.25 || p.y > 0.97;
    return v > 0.55 || (foam && v > -0.2) ? "#f2fdff" : v > -0.3 ? "#8fdcf5" : "#5fbfe8";
  });
  P(new THREE.BoxGeometry(0.03, 0.93, 0.17), FALL, [1.13, 0.555, 0.3]);
  P(new THREE.BoxGeometry(0.02, 0.88, 0.1), "#c9f1fc", [1.15, 0.54, 0.3]);
  for (const dz of [-0.06, 0.07]) P(new THREE.BoxGeometry(0.02, 0.05, 0.045), ROCKCEL, [1.12, 1.04, 0.3 + dz * 1.5], { rotation: [10, 20, 0], flat: true });
  for (let k = 0; k < 7; k++)
    P(new THREE.SphereGeometry(0.012 + rand() * 0.01, 5, 4), "#eefcff", [1.19 + rand() * 0.06, 0.25 + rand() * 0.6, 0.3 + (rand() - 0.5) * 0.28]);
  // bridge
  b.sweep(
    catmull([
      [0.92, 1.085, 0.17],
      [0.92, 1.165, 0.33],
      [0.92, 1.085, 0.49],
    ]),
    [0.05, 0.016],
    { section: "box", caps: "flat", color: WOOD },
  );
  for (const sx of [-1, 1]) {
    const x = 0.92 + sx * 0.062;
    b.sweep(
      catmull([
        [x, 1.18, 0.17],
        [x, 1.26, 0.33],
        [x, 1.18, 0.49],
      ]),
      0.008,
      { color: WOOD_D, sides: 6 },
    );
    for (const [z, y] of [
      [0.17, 1.12],
      [0.33, 1.2],
      [0.49, 1.12],
    ])
      P(new THREE.CylinderGeometry(0.011, 0.012, 0.12, 6), WOOD_D, [x, y, z]);
    P(new THREE.SphereGeometry(0.016, 5, 4), GOLD, [x, 1.183, 0.17]);
    P(new THREE.SphereGeometry(0.016, 5, 4), GOLD, [x, 1.183, 0.49]);
  }
  for (let k = 0; k < 7; k++) {
    const z = 0.2 + k * 0.045;
    const y = 1.085 + 0.08 * (1 - Math.pow((z - 0.33) / 0.16, 2));
    P(new THREE.BoxGeometry(0.115, 0.008, 0.03), "#9a6a45", [0.92, y + 0.02, z]);
  }

  // ---------------------------------------------------------------- stone lantern
  {
    const x = 0.1;
    const z = 0.8;
    const g = groundY(x, z) - 0.005;
    P(new THREE.CylinderGeometry(0.06, 0.07, 0.03, 6), STONEP, [x, g + 0.015, z]);
    P(new THREE.CylinderGeometry(0.022, 0.026, 0.1, 6), STONEP, [x, g + 0.08, z]);
    P(new THREE.CylinderGeometry(0.05, 0.045, 0.02, 6), STONEP, [x, g + 0.14, z]);
    glow(P(new THREE.BoxGeometry(0.06, 0.06, 0.06), "#ffb347", [x, g + 0.18, z]), 1.5);
    P(new THREE.ConeGeometry(0.07, 0.05, 4), STONEP, [x, g + 0.235, z], { rotation: [0, 45, 0] });
    P(new THREE.SphereGeometry(0.014, 5, 4), GOLD, [x, g + 0.27, z]);
  }

  // ---------------------------------------------------------------- trees
  const sph = () => {
    const u = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    return [s * Math.cos(a), u, s * Math.sin(a)];
  };
  const tree = (
    x: number,
    z: number,
    gy: number,
    h: number,
    lx: number,
    lz: number,
    cols: string[],
    cr: number,
    tex: THREE.Texture[],
    seed: number,
    bark: Fill,
  ) => {
    b.sweep(
      catmull([
        [x, gy - 0.02, z],
        [x + lx * 0.25, gy + h * 0.35, z + lz * 0.25],
        [x + lx * 0.65, gy + h * 0.7, z + lz * 0.65],
        [x + lx, gy + h, z + lz],
      ]),
      [h * 0.14, h * 0.09, h * 0.065, h * 0.045],
      { color: bark, sides: 7 },
    );
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + seed;
      b.spike([x + Math.cos(a) * 0.02, gy + 0.04, z + Math.sin(a) * 0.02], [Math.cos(a), -0.6, Math.sin(a)], h * 0.28, h * 0.05, {
        color: bark,
        sides: 6,
      });
    }
    const cc = [x + lx, gy + h + cr * 0.45, z + lz];
    const blobs = [
      [0, 0, 0, 1],
      [0.6, -0.2, 0.2, 0.75],
      [-0.55, -0.15, 0.25, 0.78],
      [0.15, -0.25, -0.6, 0.75],
      [-0.2, 0.4, 0.1, 0.7],
      [0.3, 0.3, 0.45, 0.6],
    ];
    blobs.forEach(([ox, oy, oz, s], i) => {
      P(new THREE.IcosahedronGeometry(cr * s, 1), cel(cols[i % cols.length]), [cc[0] + ox * cr, cc[1] + oy * cr, cc[2] + oz * cr], {
        scale: [1, 0.85, 1],
      });
    });
    for (const k of [0, 1]) {
      const bl = blobs[1 + k];
      b.rod([x + lx * 0.55, gy + h * 0.62, z + lz * 0.55], [cc[0] + bl[0] * cr * 0.6, cc[1] + bl[1] * cr, cc[2] + bl[2] * cr * 0.6], [h * 0.04, h * 0.02], bark, { sides: 6 });
    }
    const fr: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 40; i++) {
      const d = sph();
      fr.push(frame([cc[0] + d[0] * cr * 0.95, cc[1] + d[1] * cr * 0.78, cc[2] + d[2] * cr * 0.95], d));
    }
    b.cards(fr, tex, { size: [cr * 0.3, cr * 0.34], lean: 35, vary: 0.3, spin: 180, rng: rng(seed + 40) });
    return cc;
  };
  const bigTop = tree(-0.55, -0.1, groundY(-0.55, -0.1), 0.72, 0.06, -0.03, ["#6cc24a", "#86d555", "#58b04a"], 0.34, LEAVES, 1, BARK);
  // gold-tassel charms hanging from the big tree
  b.cards(
    [frame([bigTop[0] - 0.2, bigTop[1] - 0.2, bigTop[2] + 0.25], [0, 1, 0]), frame([bigTop[0] + 0.24, bigTop[1] - 0.25, bigTop[2] + 0.18], [0, 1, 0]), frame([bigTop[0] + 0.02, bigTop[1] - 0.3, bigTop[2] + 0.34], [0, 1, 0])],
    TASSEL,
    { size: [0.05, 0.2], lean: 180, flow: [0, 0, 1], sink: 0 },
  );
  const sakuraTop = tree(-0.1, 0.45, groundY(-0.1, 0.45), 0.42, 0.05, 0.02, ["#ffa8cc", "#ff8fbb", "#ffc2da"], 0.22, PETALS, 2, BARK_PINK);
  {
    const pf: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 26; i++) {
      const a = rand() * Math.PI * 2;
      const r = 0.1 + rand() * 0.3;
      const x = sakuraTop[0] + Math.cos(a) * r;
      const z = sakuraTop[2] + Math.sin(a) * r;
      if (Math.hypot(x - PX, z - PZ) < 0.3) continue;
      pf.push(frame([x, groundY(x, z) + 0.002, z], [0, 1, 0]));
    }
    b.cards(pf, PETALS, { size: 0.035, lean: 90, flow: (_f, i) => [Math.cos(i * 2.3), 0, Math.sin(i * 2.3)], mirror: true, color: "#ffffff" });
  }
  const pine = (x: number, z: number, h: number, mat: Fill) => {
    const g = groundY(x, z) - 0.01;
    P(new THREE.CylinderGeometry(0.02 * h * 3, 0.03 * h * 3, h * 0.35, 6), WOOD_D, [x, g + h * 0.17, z]);
    const radii = [0.17, 0.14, 0.11, 0.075];
    radii.forEach((r, i) => {
      const s = h / 0.9;
      P(new THREE.ConeGeometry(r * s, 0.24 * s, 7), mat, [x, g + h * 0.3 + i * 0.17 * s + 0.12 * s, z], {
        flat: true,
        rotation: [0, i * 20, 0],
      });
    });
    P(new THREE.SphereGeometry(0.014, 5, 4), GOLD, [x, g + h * 0.3 + 3 * 0.17 * (h / 0.9) + 0.26 * (h / 0.9), z]);
  };
  pine(-0.85, 0.45, 0.62, PINE);
  pine(-0.62, 0.72, 0.5, PINE2);
  pine(-0.95, -0.35, 0.55, PINE2);
  // bushes
  const bush = (x: number, z: number, r: number) => {
    const g = groundY(x, z);
    P(new THREE.IcosahedronGeometry(r, 1), cel("#5fbf55"), [x, g + r * 0.3, z], { scale: [1, 0.75, 1] });
    P(new THREE.IcosahedronGeometry(r * 0.7, 1), cel("#7ccf4c"), [x + r * 0.7, g + r * 0.15, z + r * 0.3], { scale: [1, 0.75, 1] });
    P(new THREE.IcosahedronGeometry(r * 0.6, 1), cel("#58b04a"), [x - r * 0.6, g + r * 0.1, z - r * 0.4], { scale: [1, 0.75, 1] });
    const fr: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 8; i++) {
      const d = sph();
      d[1] = Math.abs(d[1]) * 0.8 + 0.3;
      fr.push(frame([x + d[0] * r * 0.9, g + r * 0.3 + d[1] * r * 0.55, z + d[2] * r * 0.9], d));
    }
    b.cards(fr, FLOWERS, { size: [0.04, 0.05], rng: rand, lean: 0 });
  };
  bush(-0.9, -0.2, 0.13);
  bush(-0.25, -0.55, 0.1);
  bush(0.85, -0.05, 0.1);
  bush(0.0, 0.2, 0.09);
  bush(0.3, 0.8, 0.09);
  bush(-0.45, 0.2, 0.08);

  // ---------------------------------------------------------------- grass, flowers
  {
    const clear = (x: number, z: number) =>
      Math.hypot(x, z) < 1.03 &&
      Math.hypot(x - C[0], z - C[1]) > 0.55 &&
      Math.hypot(x - PX, z - PZ) > 0.33 &&
      !(x > 0.65 && Math.abs(z - 0.33) < 0.17) &&
      Math.hypot(x + 0.55, z + 0.1) > 0.12;
    const gf: ReturnType<typeof frame>[] = [];
    const ff: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 700 && (gf.length < 160 || ff.length < 45); i++) {
      const x = (rand() * 2 - 1) * 1.05;
      const z = (rand() * 2 - 1) * 1.05;
      if (!clear(x, z)) continue;
      const f = frame([x, groundY(x, z) - 0.005, z], [0, 1, 0]);
      if (gf.length < 160 && rand() < 0.75) gf.push(f);
      else if (ff.length < 45) ff.push(f);
    }
    b.cards(gf, GRASS_TEX, { size: [0.09, 0.12], vary: 0.4, spin: 180, rng: rng(31), cross: true, bend: 20 });
    b.cards(ff, FLOWERS, { size: [0.05, 0.075], vary: 0.3, spin: 180, rng: rng(32), cross: true });
  }

  // ---------------------------------------------------------------- islets and clouds
  const islet = (x: number, y: number, z: number, s: number) => {
    const prof: OutlinePoint[] = [
      [0, -0.32],
      [0.08, -0.2],
      [0.2, -0.08],
      [0.27, 0],
      [0.27, 0.05],
      [0.2, 0.09],
      [0, 0.1],
    ].map(([a, c]): OutlinePoint => [a * s, c * s]);
    b.lathe(prof, { at: [x, y, z], segments: 9, color: rockPaint(y - 0.03 * s, y - 0.25 * s, 0.05 * s, 0.07 * s) });
    b.spike([x + 0.08 * s, y - 0.15 * s, z], [0, -1, 0], 0.18 * s, 0.03 * s, { color: ROCK_B, sides: 6 });
    return y + 0.08 * s;
  };
  {
    const top = islet(-1.2, 0.95, 0.55, 1.0);
    tree(-1.2, 0.55, top - 0.02, 0.3, 0.02, 0, ["#ffa8cc", "#ff8fbb"], 0.15, PETALS, 3, BARK_PINK);
    const t2 = islet(1.25, 1.5, -0.45, 0.8);
    crystal([1.25, t2 - 0.02, -0.45], [0.1, 1, 0], 0.26, 0.05, "#6ee8ff", 1.4);
    crystal([1.3, t2 - 0.02, -0.42], [0.5, 1, 0.2], 0.16, 0.035, "#9af7ff", 1.4);
    crystal([1.2, t2 - 0.02, -0.5], [-0.4, 1, -0.2], 0.14, 0.03, "#55c8ff", 1.4);
    pillar(1.1, -0.4, t2 - 0.01, 0.2, true);
    const t3 = islet(-0.75, 1.7, 0.9, 0.6);
    pine(-0.75, 0.9, 0.3, PINE);
    void t3;
  }
  for (const [x, y, z, s] of [
    [0.9, 0.85, -0.95, 0.07],
    [-1.0, 1.3, -0.7, 0.09],
    [0.0, 1.45, 0.95, 0.06],
    [1.3, 0.7, 0.6, 0.05],
    [-0.4, 1.1, -1.1, 0.05],
  ])
    P(new THREE.DodecahedronGeometry(s, 0), ROCKCEL, [x, y, z], { rotation: [rand() * 90, rand() * 90, 0], flat: true });
  glow(P(new THREE.OctahedronGeometry(0.03, 0), "#7ff3ff", [0.0, 1.55, 0.95]), 1.3);
  glow(P(new THREE.OctahedronGeometry(0.025, 0), "#7ff3ff", [1.3, 0.8, 0.6]), 1.3);
  const cloud = (x: number, y: number, z: number, s: number) => {
    const puffs = [
      [0, 0, 0, 1],
      [0.9, -0.1, 0.2, 0.75],
      [-0.85, -0.05, 0.1, 0.8],
      [0.3, 0.2, -0.5, 0.7],
      [-0.3, 0.15, 0.5, 0.7],
    ];
    for (const [ox, oy, oz, k] of puffs)
      P(new THREE.SphereGeometry(0.1 * s * k, 8, 6), CLOUD, [x + ox * 0.1 * s, y + oy * 0.1 * s, z + oz * 0.1 * s], {
        scale: [1, 0.75, 1],
      });
  };
  for (const [x, y, z, s] of [
    [0.25, 0.15, 0.15, 1],
    [-0.3, 0.14, -0.1, 1.1],
    [0.0, 0.13, -0.3, 0.9],
    [0.2, 0.12, -0.25, 0.8],
    [-1.2, 0.3, 0.5, 1.4],
    [-1.0, 0.28, -0.5, 1.2],
    [0.6, 0.25, -0.9, 1.3],
    [-0.3, 0.3, 1.2, 1.4],
    [0.8, 0.2, 1.2, 1.1],
    [1.45, 0.3, -0.2, 1.1],
    [1.2, 0.17, 0.3, 1.0],
  ])
    cloud(x, y, z, s);

  // floating magic motes
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.5 + rand() * 0.9;
    glow(P(new THREE.SphereGeometry(0.01 + rand() * 0.008, 5, 4), "#bffcff", [Math.cos(a) * r, 0.6 + rand() * 1.2, Math.sin(a) * r]), 1.2);
  }

  return b.root;
}
