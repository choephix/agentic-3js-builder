```ts
import * as THREE from "three";
import { createBuilder, paint, mix, rng } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";
import { countershade } from "agentic-3js-builder";
import { cel, animeEye, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Phoenix",
  description: "Cel-shaded flame phoenix with wings spread, layered ember feathers, glowing tips and a flowing tail.",
};

const RED = "#d7261e";
const ORG = "#ff7a1c";
const GOLD = "#ffd33d";
const PALE = "#fff1a8";
const BEAK = "#ffc23a";
const LEG = "#f4b12c";

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- helpers ----------
  const featherPaint = (L: number, pal: string[]) =>
    paint((_p, _n, s) => {
      const t = Math.min(Math.max(s[0] / L, 0), 1);
      return t < 0.5 ? mix(pal[0], pal[1], t / 0.5) : mix(pal[1], pal[2], (t - 0.5) / 0.5);
    });

  const feather = (
    bone: any,
    at: THREE.Vector3,
    dir: number[],
    L: number,
    w: number,
    pal: string[],
    up: number[] = [0, 1, 0],
    thick = 0.012,
  ) =>
    b.extrude(
      [
        [0, 0],
        [0.12 * L, 0.5 * w],
        [0.6 * L, 0.55 * w],
        [L, 0, "sharp"],
        [0.6 * L, -0.55 * w],
        [0.12 * L, -0.5 * w],
      ],
      { at, x: dir, y: up, thickness: thick, smoothing: 1, color: featherPaint(L, pal), bone },
    );

  const lick = (bone: any, at: THREE.Vector3, dir: number[], L: number, up: number[] = [0, 1, 0]) =>
    glow(
      b.extrude(
        [
          [0, 0],
          [0.3 * L, 0.35 * L * 0.5],
          [L, 0, "sharp"],
          [0.3 * L, -0.35 * L * 0.5],
        ],
        { at, x: dir, y: up, thickness: 0.01, color: "#ffe27a", bone },
      ),
      1.4,
    );

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0.95, -0.25] });
  const spinePath = new THREE.CatmullRomCurve3([]); // placeholder to keep types simple
  void spinePath;
  const spine = b.chain(
    "spine",
    [
      [0, 0.95, -0.25],
      [0, 0.98, 0.05],
      [0, 1.12, 0.3],
      [0, 1.4, 0.45],
      [0, 1.62, 0.5],
    ],
    { parent: root, names: ["hips", "spine", "chest", "neck1", "neck2"], role: "spine" },
  );
  const tail = b.chain(
    "tail",
    [
      [0, 0.95, -0.25],
      [0, 0.9, -0.7],
      [0, 0.8, -1.2],
      [0, 0.7, -1.7],
    ],
    { parent: root, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  const body = cel(countershade("#e0301f", "#ffae3a", { level: 0.1 }));
  b.sweep(spine, [0.14, 0.22, 0.24, 0.1, 0.075], { color: body });
  b.sweep(tail, [0.11, 0.02], { color: body });

  // ---------- head ----------
  const head = b.joint("head", { parent: spine, at: spine.at(1).at, dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, down: 0.04 }),
    aim: head.local({ forward: 0.25, down: 0.05 }),
    role: "jaw",
  });
  const skull = b.part(new THREE.SphereGeometry(0.115, 12, 9), cel("#ee3b22"), {
    bone: head,
    at: head.local({ forward: 0.06, up: 0.02 }),
    scale: [1, 0.95, 1.05],
  });
  b.spike(head.local({ forward: 0.12, up: -0.005 }), [0, -0.18, 1], 0.2, 0.05, { color: BEAK, bone: head, sides: 6 });
  b.spike(head.local({ forward: 0.1, down: 0.05 }), [0, -0.05, 1], 0.15, 0.038, { color: "#e89a20", bone: jaw, sides: 6 });
  const EYE = animeEye({ iris: "#ffcf2e", irisDark: "#c4501a", blush: false, size: 256 });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(skull.at).at(s * 52, 8)!;
    b.decal(skin, EYE, { at: hit, size: [0.06, 0.082], mirror: s > 0, bone: head });
  }
  // crest
  for (let i = -2; i <= 2; i++) {
    const a = i * 0.28;
    const d = V(Math.sin(a) * 0.6, 0.55 - Math.abs(i) * 0.12, -0.8).normalize();
    feather(head, head.local({ up: 0.09, forward: 0.0 }), d.toArray(), 0.42 - Math.abs(i) * 0.06, 0.07, [RED, ORG, GOLD], [1, 0, 0], 0.01);
  }
  lick(head, head.local({ up: 0.11, back: 0.3 }), [0, 0.5, -0.85], 0.16, [1, 0, 0]);

  // ---------- chest ember and ruff ----------
  const chestJ = spine.joints[2];
  glow(b.part(new THREE.OctahedronGeometry(0.05, 0), "#ffe27a", { bone: chestJ, at: spine.at(0.5).at.clone().add(V(0, 0.01, 0.2)), scale: [1, 1.4, 0.7] }), 1.6);
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.3;
    const d = V(Math.sin(a) * 0.5, -0.55, 0.7).normalize();
    const base = spine.at(0.62).at.clone().add(V(Math.sin(a) * 0.12, 0.0, 0.14));
    feather(chestJ, base, d.toArray(), 0.28, 0.1, [ORG, GOLD, PALE], [1, 0, 0], 0.01);
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `wing${S}`,
      [
        [s * 0.18, 1.12, 0.12],
        [s * 0.75, 1.22, 0.0],
        [s * 1.3, 1.27, -0.1],
        [s * 1.75, 1.22, -0.22],
      ],
      { parent: spine.joints[2], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `handTip${S}`], role: "wing" },
    );
    b.sweep(arm, [0.075, 0.03], { color: cel("#d7261e") });
    const rows: [number, number, string[], number, number][] = [
      // count, lift, palette, lengthScale, width
      [15, 0.0, [RED, ORG, GOLD], 1.0, 0.17],
      [13, 0.025, [ORG, GOLD, PALE], 0.62, 0.15],
      [11, 0.05, [GOLD, GOLD, PALE], 0.34, 0.12],
    ];
    rows.forEach(([n, lift, pal, ls, w], ri) => {
      for (let i = 0; i < n; i++) {
        const t = 0.1 + 0.9 * (i / (n - 1));
        const cp = arm.at(t);
        const a = (6 + 46 * t) * (Math.PI / 180);
        const d = V(s * Math.sin(a), 0.03, -Math.cos(a)).normalize();
        const Lb = t < 0.6 ? 0.7 + 0.3 * t : 0.88 + 0.6 * (t - 0.6);
        const L = Lb * ls * (0.95 + rand() * 0.1);
        const at = cp.at.clone().add(V(0, lift, 0));
        feather(cp.bone, at, d.toArray(), L, w, pal);
        if (ri === 0 && i % 3 === 2) lick(cp.bone, at.clone().addScaledVector(d, L * 0.93).add(V(0, 0.015, 0)), d.toArray(), 0.2);
      }
    });
  }

  // ---------- tail feathers ----------
  for (let layer = 0; layer < 2; layer++) {
    for (let i = -3; i <= 3; i++) {
      const a = i * 0.24;
      const d = V(Math.sin(a), -0.1 - 0.03 * Math.abs(i) + layer * 0.05, -Math.cos(a)).normalize();
      const L = (1.75 - 0.18 * Math.abs(i)) * (layer ? 0.6 : 1);
      const cp = tail.at(0.15);
      const at = cp.at.clone().add(V(0, 0.02 + layer * 0.025, 0));
      feather(cp.bone, at, d.toArray(), L, 0.16, layer ? [ORG, GOLD, PALE] : [RED, ORG, GOLD]);
      if (!layer) lick(cp.bone, at.clone().addScaledVector(d, L * 0.93).add(V(0, 0.015, 0)), d.toArray(), 0.25);
    }
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.13, 0.8, -0.1],
      [s * 0.14, 0.03, 0.12],
      [0.3, 0.34, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${S}`, pts, {
      parent: root,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.055, 0.026], { color: cel(LEG), sides: 6 });
    const f = pts[3];
    const toes = [
      [s * 0.35, -0.03, 1],
      [0, -0.03, 1],
      [-s * 0.35, -0.03, 1],
      [0, -0.02, -1],
    ];
    for (const t of toes) b.spike(f, t, 0.15, 0.024, { color: "#e89a20", bone: leg.tip ?? leg.joints[2], sides: 6 });
    for (const t of toes.slice(0, 3)) b.spike(V(f.x + t[0] * 0.15, f.y, f.z + 0.14), [0, -0.1, 1], 0.05, 0.018, { color: INK, bone: leg.tip ?? leg.joints[2], sides: 5 });
  }

  return b.root;
}
```