```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, svg, paint, mix, smoothstep, noise } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A cream-white kitsune fox with red kumadori face markings, tall ears, a shimenawa collar with a bell and paper tags, nine fanned tails tipped with glowing blue spirit flames, and hitodama foxfire drifting around it.",
};

const CREAM = "#fff6ea";
const PEACH = "#ffd9bd";
const RED = "#d8362f";
const RED_D = "#8e1d22";
const SOCK = "#5a2326";
const PINK = "#f4a8a8";
const GOLD = "#f0c040";
const NOSE = "#2a1418";
const FLAME = "#5fd4ff";
const FLAME_IN = "#e8fdff";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const eyeSvg = (flip: boolean) =>
  svg(
    `<svg viewBox="0 0 64 48"><g ${flip ? 'transform="translate(64,0) scale(-1,1)"' : ""}>
    <path d="M2 30 Q14 22 30 26 Q22 34 2 30Z" fill="#d8362f"/>
    <path d="M6 22 Q16 14 34 20 Q22 20 6 22Z" fill="#d8362f"/>
    <path d="M12 26 Q34 -2 58 26 Q34 50 12 26Z" fill="#2a1418"/>
    <ellipse cx="36" cy="27" rx="14" ry="16" fill="#ffb02e"/>
    <ellipse cx="36" cy="17" rx="14" ry="8" fill="#e07a12"/>
    <ellipse cx="36" cy="28" rx="5" ry="11" fill="#2a1418"/>
    <ellipse cx="30" cy="21" rx="5" ry="6" fill="#fff"/>
    <circle cx="42" cy="35" r="2.6" fill="#fff"/>
    <path d="M12 26 Q34 -4 60 24" stroke="#2a1418" stroke-width="3.5" fill="none"/>
    </g></svg>`,
    { size: 192 },
  );

const MARK = svg(
  `<svg viewBox="0 0 40 40"><path d="M20 2 Q34 16 28 26 Q26 34 20 38 Q14 34 12 26 Q6 16 20 2Z" fill="#d8362f"/>
   <path d="M20 12 Q27 20 23 28 Q20 31 17 28 Q13 20 20 12Z" fill="#ffd9bd"/></svg>`,
  { size: 128 },
);

const SWIRL = svg(
  `<svg viewBox="0 0 80 80"><g fill="#d8362f">
   <path d="M4 60 Q10 20 40 14 Q30 28 36 36 Q22 34 18 66Z"/>
   <path d="M30 70 Q34 40 62 34 Q54 46 60 52 Q44 50 42 74Z"/>
   <path d="M44 20 Q56 8 76 12 Q66 20 70 28 Q56 26 44 20Z"/></g></svg>`,
  { size: 192 },
);

const TAG = svg(
  `<svg viewBox="0 0 24 48"><rect x="2" y="0" width="20" height="48" fill="#fffdf4" stroke="#8e1d22" stroke-width="2"/>
   <path d="M12 8 V40 M6 16 H18 M7 26 H17 M8 35 H16" stroke="#d8362f" stroke-width="2.4"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "kitsune", paintSize: 1024 });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.5, -0.32] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, -0.32],
      [0, 0.5, -0.1],
      [0, 0.52, 0.1],
      [0, 0.55, 0.26],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.58, 0.25],
      [0, 0.66, 0.33],
      [0, 0.75, 0.41],
      [0, 0.8, 0.47],
    ]),
    { parent: chest, role: "neck", names: ["neck1", "neck2", "neck3"] },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 0.8, 0.47], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.77, 0.58], aim: [0, 0.76, 0.76], role: "jaw" });
  const HC = v(0, 0.83, 0.56);

  // ---------------------------------------------------------------- paints
  const coat = paint((p, n) => {
    let c = mix(CREAM, PEACH, smoothstep(0.2, -0.9, n.y) * 0.6 + 0.15 * noise(p, 0.12, 3));
    const edge = 0.17 + 0.03 * noise(p, 0.05, 7);
    if (p.y < edge && Math.abs(p.z) < 1) c = mix(c, SOCK, smoothstep(edge, edge - 0.04, p.y));
    return c;
  });

  // ---------------------------------------------------------------- body
  const body = b.sweep(
    spine,
    (t) => [0.12 + 0.04 * Math.sin(Math.PI * Math.min(1, t * 1.1)), 0.14 + 0.05 * Math.sin(Math.PI * Math.min(1, t * 1.1))],
    { color: coat, sides: 10, smooth: false, caps: "round", name: "body" },
  );
  b.sweep(neck, [0.1, 0.075], { color: coat, sides: 8, smooth: false, name: "neck" });
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.15, 1), coat, { bone: hips, at: [s * 0.1, 0.46, -0.4], scale: [0.85, 1.1, 1.15], flat: true, name: "haunch" });
    b.decal(body, SWIRL, { at: [s * 0.17, 0.52, -0.12], dir: [s, 0, 0], size: [0.26, 0.26], mirror: s < 0, name: `flankMark${s > 0 ? "L" : "R"}` });
  }
  // chest ruff
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.045;
    b.spike([x, 0.55, 0.38], [x * 2, -0.75, 0.55], 0.14 - Math.abs(x) * 0.4, 0.04, { color: CREAM, sides: 4, smooth: false, bone: chest });
  }

  // ---------------------------------------------------------------- head
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, { bone: head, at: HC.toArray(), scale: [0.115, 0.1, 0.11], name: "skull" });
  b.part(new THREE.ConeGeometry(0.068, 0.17, 8), CREAM, { bone: head, at: [0, 0.8, 0.65], dir: [0, -0.1, 1], name: "snout" });
  b.part(new THREE.SphereGeometry(0.022, 6, 5), NOSE, { bone: head, at: [0, 0.795, 0.745], scale: [1.2, 0.8, 0.9], name: "nose" });
  b.part(new THREE.ConeGeometry(0.048, 0.13, 7), PEACH, { bone: jaw, at: [0, 0.765, 0.665], dir: [0, 0, 1], name: "lowerJaw" });
  b.part(new THREE.BoxGeometry(0.07, 0.006, 0.08), PINK, { bone: jaw, at: [0, 0.78, 0.67], name: "tongue" });
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const eyeAt = HC.clone().add(v(s * 0.062, 0.018, 0.1));
    b.part(new THREE.PlaneGeometry(0.085, 0.064), "#ffffff", {
      bone: head,
      at: eyeAt.toArray(),
      dir: [s * 0.45, 0.05, 1],
      axis: "z",
      texture: eyeSvg(s < 0),
      name: `eye${k}`,
    });
    // cheek ruff
    for (let i = 0; i < 3; i++)
      b.spike([s * 0.09, 0.78 - i * 0.012, 0.58 - i * 0.03], [s * 1, -0.2 - i * 0.2, -0.3 - i * 0.2], 0.11 - i * 0.015, 0.032, { color: CREAM, sides: 4, smooth: false, bone: head });
    // ear
    const ear = b.joint(`ear${k}`, { parent: head, at: [s * 0.065, 0.9, 0.52], dir: [s * 0.35, 1, -0.2], role: "hinge" });
    const dir: [number, number, number] = [s * 0.35, 1, -0.2];
    b.spike(ear, dir, 0.24, 0.062, { color: paint((_p, _n, st) => (st[0] > 0.68 ? SOCK : CREAM)), sides: 4, smooth: false, bone: ear });
    b.spike(ear.at.clone().add(v(0, 0.01, 0.022)), dir, 0.19, 0.036, { color: PINK, sides: 4, smooth: false, bone: ear });
  }
  b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
    bone: head,
    at: HC.clone().add(v(0, 0.06, 0.094)).toArray(),
    dir: [0, 0.55, 0.83],
    axis: "z",
    texture: MARK,
    name: "foreheadMark",
  });

  // ---------------------------------------------------------------- collar
  const nc = neck.at(0.22).at.clone();
  b.part(new THREE.TorusGeometry(0.1, 0.02, 6, 12), RED, { bone: neck.joints[0], at: nc.toArray(), dir: [0, 0.7, 0.7], axis: "z", name: "shimenawa" });
  b.part(new THREE.IcosahedronGeometry(0.03, 0), GOLD, { bone: neck.joints[0], at: nc.clone().add(v(0, -0.07, 0.1)).toArray(), flat: true, name: "bell" });
  for (const x of [-0.05, 0.05])
    b.part(new THREE.PlaneGeometry(0.035, 0.07), "#ffffff", {
      bone: neck.joints[0],
      at: nc.clone().add(v(x, -0.1, 0.095)).toArray(),
      dir: [0, 0, 1],
      axis: "z",
      texture: TAG,
      name: "shide",
    });

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const mk = (front: boolean) => {
      const pts = front
        ? limb([s * 0.1, 0.5, 0.2], [s * 0.1, 0.035, 0.25], [0.17, 0.17, 0.12, 0.05], [[0, 0, -1], [0, 0, 1], [0, 0, -1]])
        : limb([s * 0.1, 0.5, -0.4], [s * 0.1, 0.035, -0.5], [0.17, 0.17, 0.12, 0.05], [[0, 0, 1], [0, 0, -1], [0, 0, 1]]);
      const c = b.chain(`${front ? "legF" : "legH"}${k}`, pts, {
        parent: front ? chest : hips,
        role: "leg",
        names: front ? [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `pastern${k}`, `pawF${k}`] : [`hip${k}`, `knee${k}`, `hock${k}`, `pasternH${k}`, `pawH${k}`],
        contact: [s * 0.1, 0, front ? 0.25 : -0.5],
      });
      b.sweep(c, [0.05, 0.036, 0.028, 0.025, 0.022], { color: coat, sides: 6, smooth: false, name: `leg${k}` });
      const tip = c.tip as Joint;
      b.part(new THREE.SphereGeometry(0.04, 7, 5), SOCK, {
        bone: tip,
        at: [s * 0.1, 0.032, (front ? 0.25 : -0.5) + 0.02],
        scale: [1, 0.8, 1.45],
        flat: true,
        name: "paw",
      });
    };
    mk(true);
    mk(false);
  }

  // ---------------------------------------------------------------- nine tails
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) * 17 * Math.PI) / 180;
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j < 5; j++) {
      const u = j / 4;
      pts.push(
        v(
          Math.sin(a) * 0.72 * Math.pow(u, 1.15),
          0.58 + 0.78 * Math.sin(u * 1.3) * (1 - 0.35 * Math.abs(Math.sin(a))) + (i % 2) * 0.07 * u,
          -0.4 - 0.45 * u - 0.08 * Math.cos(a) * u,
        ),
      );
    }
    const chain = b.chain(`tail${i + 1}`, catmull(pts), {
      parent: hips,
      role: "tail",
      names: [1, 2, 3, 4].map((n) => `tail${i + 1}_${n}`),
    });
    const tipCol = i % 3 === 0 ? "#bfeaff" : i % 3 === 1 ? "#d9d0ff" : "#aef0e8";
    b.sweep(chain, [0.045, 0.1, 0.115, 0.08, 0.02], {
      color: paint((_p, _n, s) => {
        let c = mix(CREAM, PEACH, s[0] * 0.6);
        if (s[0] > 0.42 && s[0] < 0.5) c = RED as unknown as typeof c ? mix(c, RED, 0.9) : c;
        return mix(c, tipCol, smoothstep(0.72, 0.98, s[0]));
      }),
      sides: 6,
      smooth: false,
      caps: "round",
      name: `tailTube${i + 1}`,
    });
    const tp = chain.at(1).at;
    const bone = chain.joints[3];
    glow(b.part(new THREE.SphereGeometry(0.045, 6, 5), FLAME, { bone, at: [tp.x, tp.y + 0.04, tp.z], scale: [1, 1.1, 1], name: "flameBase" }), 1.4);
    glow(b.part(new THREE.ConeGeometry(0.045, 0.2, 6), FLAME, { bone, at: [tp.x, tp.y + 0.15, tp.z], name: "flameTip" }), 1.4);
    glow(b.part(new THREE.ConeGeometry(0.022, 0.11, 5), FLAME_IN, { bone, at: [tp.x, tp.y + 0.11, tp.z], name: "flameCore" }), 1.6);
  }

  // ---------------------------------------------------------------- hitodama (foxfire)
  const fires: [number, number, number][] = [
    [0.55, 0.3, 0.35], [-0.6, 0.55, 0.1], [0.7, 0.9, -0.3], [-0.5, 1.1, -0.2],
    [0.35, 1.25, 0.4], [-0.4, 0.2, 0.7], [0.15, 1.5, -0.1], [-0.75, 0.85, -0.6],
  ];
  fires.forEach(([x, y, z], i) => {
    const r = 0.035 + (i % 3) * 0.01;
    glow(b.part(new THREE.SphereGeometry(r, 6, 5), FLAME, { bone: hips, at: [x, y, z], name: "hitodama" }), 1.3);
    glow(b.part(new THREE.ConeGeometry(r, r * 4, 6), FLAME, { bone: hips, at: [x, y + r * 2.4, z], name: "hitodamaTip" }), 1.3);
    glow(b.part(new THREE.SphereGeometry(r * 0.5, 5, 4), FLAME_IN, { bone: hips, at: [x, y, z], name: "hitodamaCore" }), 1.6);
  });

  return b.root;
}
```