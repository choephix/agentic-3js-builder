```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, limb, paint, noise, mix, smoothstep, svg, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Frostfang Wolf",
  description: "Gray wolf standing alert, chunky Warcraft-style proportions with a swept ruff, dorsal mane and glowing amber eyes.",
};

const GREY = "#8a8d94";
const TAN = "#a58f72";
const DARK = "#363942";
const LIGHT = "#d9d4c6";
const IVORY = "#f1ead2";
const CLAW = "#2a2622";
const NOSE = "#16141a";

const coat = paint((p, n) => {
  let c = mix(GREY, TAN, 0.55 * smoothstep(0.45, 0.8, noise(p, 0.22, 5)));
  const sd = noise(new THREE.Vector3(p.x * 2.5, p.y * 2.5, p.z), 0.07, 11);
  c = mix(c, DARK, 0.45 * smoothstep(0.55, 0.75, sd));
  const back = smoothstep(0.3, 0.85, n.y) * smoothstep(0.35, 0.65, noise(p, 0.15, 7));
  c = mix(c, DARK, (p.y > 0.55 ? 0.75 : 0.25) * back);
  c = mix(c, LIGHT, smoothstep(0.0, -0.6, n.y) * 0.9);
  if (p.y < 0.4) c = mix(c, "#b9ad92", 0.5 * smoothstep(0.4, 0.2, p.y));
  if (p.z > 1.15 && n.y < 0.4) c = mix(c, LIGHT, 0.55);
  if (p.z < -1.3) c = mix(c, DARK, smoothstep(-1.3, -1.45, p.z));
  return c;
});

const EYE = svg(
  `<svg viewBox="0 0 70 36">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a10"/><stop offset="1" stop-color="#ffd84a"/></linearGradient></defs>
  <path d="M3 8 Q30 1 67 22 Q40 36 3 8Z" fill="url(#g)" stroke="#1a1208" stroke-width="4" stroke-linejoin="round"/>
  <ellipse cx="36" cy="18" rx="4" ry="9" fill="#150c04" transform="rotate(25 36 18)"/>
  <circle cx="30" cy="13" r="2.4" fill="#fff"/></svg>`,
  { size: 256 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="none" stroke="#7fd8ff" stroke-width="4"/>
  <path d="M32 12 L32 52 M32 22 L45 14 M32 34 L46 26 M32 22 L19 14 M32 34 L18 26 M22 52 L32 44 L42 52" stroke="#bff0ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "wolf" });
  const R = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.74, -0.3], role: "spine" });
  const spinePath = catmull([
    [0, 0.74, -0.3],
    [0, 0.76, 0.08],
    [0, 0.78, 0.45],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });

  const neckPath = catmull([
    [0, 0.8, 0.45],
    [0, 0.93, 0.68],
    [0, 1.04, 0.88],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[1],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.04, 0.88],
    dir: [0, -0.1, 1],
    role: "head",
  });
  const H = (f: number, u: number, l: number) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: H(0.1, -0.06, 0), aim: H(0.4, -0.07, 0), role: "jaw" });

  const tailPath = catmull([
    [0, 0.76, -0.38],
    [0, 0.7, -0.8],
    [0, 0.52, -1.2],
    [0, 0.3, -1.5],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
  });

  // ---------- body ----------
  const body = b.sweep(spinePath, (t) => [0.15 + 0.05 * t, 0.16 + 0.07 * t * t * 1.0], {
    bone: [spine, hips],
    color: coat,
    shift: [0, -0.04],
    extend: [0.1, 0],
  });
  b.sweep(neck, [0.17, 0.11], { color: coat });
  b.sweep(tailPath, [0.06, 0.1, 0.105, 0.06, 0.0], { bone: tail, color: coat, caps: { end: "point" } });

  // mass: shoulders & haunches
  const shoulders: any[] = [];
  for (const s of [1, -1]) {
    shoulders.push(
      b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
        bone: spine.joints[1],
        at: [s * 0.2, 0.7, 0.35],
        scale: [0.12, 0.18, 0.2],
      }),
    );
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: hips,
      at: [s * 0.19, 0.66, -0.33],
      scale: [0.13, 0.2, 0.21],
    });
  }
  // chest bib
  b.part(new THREE.SphereGeometry(1, 10, 8), LIGHT, {
    bone: spine.joints[1],
    at: [0, 0.62, 0.5],
    scale: [0.17, 0.2, 0.17],
  });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const fp = limb(
      [s * 0.17, 0.68, 0.38],
      [s * 0.17, 0.06, 0.42],
      [0.3, 0.28, 0.1],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fl = b.chain(`legF${S}`, fp, {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `pawF${S}`],
      role: "leg",
    });
    b.sweep(fl, [0.09, 0.06, 0.05, 0.045], { color: coat });
    b.spike(fp[1], [0, -0.3, -1], 0.13, 0.045, { color: "#9a9ca2" });
    b.spike(fp[1], [s * 0.4, -0.1, -1], 0.1, 0.035, { color: LIGHT });

    const hp = limb(
      [s * 0.16, 0.7, -0.32],
      [s * 0.16, 0.06, -0.42],
      [0.36, 0.34, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`],
      role: "leg",
    });
    b.sweep(hl, [0.12, 0.07, 0.05, 0.045], { color: coat });
    b.spike(hp[2], [0, 0.1, -1], 0.14, 0.045, { color: "#9a9ca2" });

    // paws and claws
    for (const [pts, z, rr] of [
      [fp, 0.42, 1],
      [hp, -0.42, 0.95],
    ] as const) {
      const pz = z + 0.05;
      const px = s * 0.17;
      b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
        bone: pts === fp ? fl.tip! : hl.tip!,
        at: [px, 0.045, pz],
        scale: [0.065 * rr, 0.045, 0.1 * rr],
      });
      for (const k of [-1, 0, 1]) {
        b.part(new THREE.ConeGeometry(0.014, 0.06, 5), CLAW, {
          bone: pts === fp ? fl.tip! : hl.tip!,
          at: [px + k * 0.03, 0.028, pz + 0.105],
          dir: [0, -0.4, 1],
        });
      }
    }
    // rune on shoulder
    glow(
      b.decal(shoulders[s > 0 ? 0 : 1], RUNE, {
        at: [s * 0.325, 0.75, 0.35],
        dir: [s, 0, 0],
        size: [0.13, 0.13],
      }),
      0.9,
    );
  }

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
    bone: head,
    at: H(0.08, 0.02, 0),
    scale: [0.125, 0.12, 0.15],
  });
  b.frustumBox(H(0.18, -0.01, 0), H(0.42, -0.035, 0), [0.13, 0.11], [0.08, 0.075], { bone: head, color: coat });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { bone: head, at: H(0.44, -0.015, 0), scale: [0.045, 0.032, 0.035] });
  // lower jaw
  b.frustumBox(H(0.13, -0.078, 0), H(0.4, -0.072, 0), [0.1, 0.04], [0.06, 0.035], { bone: jaw, color: LIGHT });
  b.frustumBox(H(0.15, -0.055, 0), H(0.4, -0.055, 0), [0.09, 0.02], [0.05, 0.02], { bone: jaw, color: "#4a1f22" });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#c25a6a", { bone: jaw, at: H(0.26, -0.06, 0), scale: [0.03, 0.012, 0.07] });

  for (const s of [1, -1]) {
    // fangs
    b.part(new THREE.ConeGeometry(0.016, 0.065, 5), IVORY, { bone: head, at: H(0.4, -0.08, s * 0.035), dir: [0, -1, 0] });
    b.part(new THREE.ConeGeometry(0.013, 0.05, 5), IVORY, { bone: jaw, at: H(0.38, -0.045, s * 0.03), dir: [0, 1, 0] });
    // brow
    b.rod(H(0.13, 0.105, s * 0.105), H(0.25, 0.088, s * 0.04), 0.02, { color: DARK, bone: head });
    // eyes
    glow(
      b.decal(skull, EYE, {
        at: H(0.2, 0.05, s * 0.08),
        dir: [s * 0.55, 0.1, 0.8],
        size: [0.075, 0.04],
        mirror: s > 0,
        bone: head,
      }),
      0.8,
    );
    // ears
    const ear = [
      [-0.07, 0],
      [0.07, 0],
      [0.05, 0.12],
      [0.02, 0.23, "sharp"],
      [-0.03, 0.12],
    ] as any;
    b.extrude(ear, { at: H(-0.02, 0.1, s * 0.08), x: [s, 0, 0], y: [s * 0.25, 1, -0.1], thickness: 0.03, bone: head, color: coat });
    const inner = ear.map((q: any) => [q[0] * 0.55, q[1] * 0.6 + 0.01, ...(q[2] ? [q[2]] : [])]);
    b.extrude(inner, { at: H(-0.02, 0.1, s * 0.08), x: [s, 0, 0], y: [s * 0.25, 1, -0.1], thickness: 0.036, bone: head, color: "#4b3a3a" });
    // cheek ruff
    for (let i = 0; i < 4; i++) {
      b.spike(H(0.08 - i * 0.04, -0.01 - i * 0.03, s * 0.11), [s * 0.5, -0.25, -1], 0.12 + 0.01 * i, 0.04, {
        color: i % 2 ? LIGHT : "#a7a39a",
        bone: head,
      });
    }
    // chin tuft
    b.spike(H(0.2, -0.1, s * 0.03), [0, -1, -0.5], 0.06, 0.025, { color: LIGHT, bone: jaw });
  }
  // scar across left eye
  b.rod(H(0.12, 0.13, 0.13), H(0.26, -0.03, 0.07), 0.006, { color: "#c2827a", bone: head });
  // forehead crest
  for (let i = 0; i < 3; i++) b.spike(H(0.0 + i * 0.05, 0.13 - i * 0.01, 0), [0, 0.5, -1], 0.1, 0.035, { color: DARK, bone: head });

  // ---------- fur: ruff, mane ----------
  for (const t of [0.3, 0.7]) {
    b.ring(neck.at(t), { count: 11, radius: 0.13 - t * 0.03, tilt: -40 }, (item) =>
      b.spike(item, item, 0.15 - 0.02 * t + R() * 0.03, 0.045, { color: item.i % 2 ? "#a3a5aa" : LIGHT }),
    );
  }
  b.ring(frame([0, 0.68, 0.52], [0, 0, 1]), { count: 8, radius: 0.15, fromDeg: 100, toDeg: 260, tilt: -30 }, (item) =>
    b.spike(item, item, 0.12, 0.04, { color: LIGHT }),
  );
  b.along(body, 14, (at) => {
    const k = Math.sin(Math.PI * Math.min(1, at.t * 1.1));
    b.spike(at, [0, 1, -0.9], 0.08 + 0.08 * k + R() * 0.02, 0.035, { color: DARK });
  });

  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });
  return b.root;
}
```