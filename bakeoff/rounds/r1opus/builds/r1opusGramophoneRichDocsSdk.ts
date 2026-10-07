import * as THREE from "three";
import { createBuilder, bezier, catmull, paint, mottle, grain, svg } from "../../../../src/index";

export const meta = {
  name: "Antique Morning-Glory Gramophone",
  description:
    "A carved walnut gramophone cabinet with pale floral inlay, ball-and-claw feet, a side wind-up crank, a black 78 with a red label, a silver tonearm and soundbox, and a huge fluted brass morning-glory horn with a green patina.",
};

// ---------- palette ----------
const WALNUT = "#6b3f22";
const WALNUT_DK = "#3e2213";
const WALNUT_XDK = "#2a160b";
const BRASS = "#c99a3e";
const BRASS_BR = "#e6c167";
const BRASS_DEEP = "#5a3d16";
const BRASS_IN = "#d8ab4c";
const BRASS_IN2 = "#b98a34";
const PATINA = "#7f9c6e";
const SILVER = "#cfd3d8";
const SILVER_DK = "#8d939b";
const BLACK = "#141414";

// ---------- textures ----------
function flower(cx: number, cy: number, r: number, n: number, petal: string, core: string) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (i * 360) / n;
    s += `<ellipse cx="${cx}" cy="${cy - r * 0.55}" rx="${r * 0.28}" ry="${r * 0.55}" fill="${petal}" transform="rotate(${a} ${cx} ${cy})"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.26}" fill="${core}"/>`;
  return s;
}
function leaf(cx: number, cy: number, len: number, ang: number, col: string) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${len / 2}" ry="${len / 5}" fill="${col}" transform="rotate(${ang} ${cx} ${cy})"/>`;
}
const PETAL = "#f0e3c2";
const CORE = "#d8b878";
const LEAF = "#dccb9c";

const inlayFront = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120">
  <rect x="4" y="4" width="192" height="112" rx="6" fill="none" stroke="${PETAL}" stroke-width="2"/>
  <rect x="10" y="10" width="180" height="100" rx="4" fill="none" stroke="${CORE}" stroke-width="1.3"/>
  <g fill="none" stroke="${LEAF}" stroke-width="2" stroke-linecap="round">
    <path d="M100 60 C80 40 60 80 40 58 C28 46 22 60 18 52"/>
    <path d="M100 60 C120 40 140 80 160 58 C172 46 178 60 182 52"/>
    <path d="M100 60 C85 80 70 92 52 86"/>
    <path d="M100 60 C115 80 130 92 148 86"/>
    <path d="M100 60 C90 40 80 30 64 28"/>
    <path d="M100 60 C110 40 120 30 136 28"/>
  </g>
  ${leaf(72, 52, 14, -30, LEAF)}${leaf(128, 52, 14, 30, LEAF)}
  ${leaf(58, 70, 12, 40, LEAF)}${leaf(142, 70, 12, -40, LEAF)}
  ${leaf(80, 36, 11, -60, LEAF)}${leaf(120, 36, 11, 60, LEAF)}
  ${leaf(76, 86, 11, 20, LEAF)}${leaf(124, 86, 11, -20, LEAF)}
  ${leaf(28, 52, 9, 70, LEAF)}${leaf(172, 52, 9, -70, LEAF)}
  ${flower(100, 60, 24, 8, PETAL, CORE)}
  ${flower(100, 60, 10, 8, CORE, PETAL)}
  ${flower(40, 58, 11, 6, PETAL, CORE)}${flower(160, 58, 11, 6, PETAL, CORE)}
  ${flower(52, 86, 8, 5, PETAL, CORE)}${flower(148, 86, 8, 5, PETAL, CORE)}
  ${flower(64, 28, 7, 5, PETAL, CORE)}${flower(136, 28, 7, 5, PETAL, CORE)}
  ${flower(18, 52, 6, 5, PETAL, CORE)}${flower(182, 52, 6, 5, PETAL, CORE)}
  ${flower(14, 14, 5, 4, CORE, PETAL)}${flower(186, 14, 5, 4, CORE, PETAL)}
  ${flower(14, 106, 5, 4, CORE, PETAL)}${flower(186, 106, 5, 4, CORE, PETAL)}
</svg>`,
  { size: 512 },
);

const inlayTop = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect x="5" y="5" width="190" height="190" rx="8" fill="none" stroke="${PETAL}" stroke-width="2"/>
  <rect x="11" y="11" width="178" height="178" rx="6" fill="none" stroke="${CORE}" stroke-width="1.3"/>
  <g fill="none" stroke="${LEAF}" stroke-width="2" stroke-linecap="round">
    <path d="M20 20 C40 30 30 50 50 56"/><path d="M180 20 C160 30 170 50 150 56"/>
    <path d="M20 180 C40 170 30 150 50 144"/><path d="M180 180 C160 170 170 150 150 144"/>
  </g>
  ${flower(22, 22, 12, 6, PETAL, CORE)}${flower(178, 22, 12, 6, PETAL, CORE)}
  ${flower(22, 178, 12, 6, PETAL, CORE)}${flower(178, 178, 12, 6, PETAL, CORE)}
  ${flower(50, 56, 6, 5, PETAL, CORE)}${flower(150, 56, 6, 5, PETAL, CORE)}
  ${flower(50, 144, 6, 5, PETAL, CORE)}${flower(150, 144, 6, 5, PETAL, CORE)}
  ${leaf(36, 40, 9, 50, LEAF)}${leaf(164, 40, 9, -50, LEAF)}
  ${leaf(36, 160, 9, -50, LEAF)}${leaf(164, 160, 9, 50, LEAF)}
</svg>`,
  { size: 512 },
);

let grooves = "";
for (let r = 40; r <= 96; r += 3) grooves += `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${r % 2 ? "#2b2b2b" : "#202020"}" stroke-width="0.9"/>`;
const recordTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="100" fill="#121212"/>
  ${grooves}
  <path d="M100 100 L170 30 A99 99 0 0 1 185 52 Z" fill="#3a3a3a" opacity="0.7"/>
  <path d="M100 100 L30 170 A99 99 0 0 1 15 148 Z" fill="#3a3a3a" opacity="0.7"/>
  <circle cx="100" cy="100" r="35" fill="#b3202a"/>
  <circle cx="100" cy="100" r="31" fill="none" stroke="#e8c76a" stroke-width="1.5"/>
  <text x="100" y="92" font-family="serif" font-size="11" font-weight="bold" fill="#f2d98a" text-anchor="middle">MELODIA</text>
  <text x="100" y="118" font-family="serif" font-size="6" fill="#f2d98a" text-anchor="middle">78 R.P.M.</text>
  <path d="M78 104 L122 104" stroke="#f2d98a" stroke-width="1"/>
  <circle cx="100" cy="100" r="3" fill="#0a0a0a"/>
</svg>`,
  { size: 512 },
);

const micaTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="32" fill="#c9cdd2"/>
  <circle cx="32" cy="32" r="27" fill="#e9dcb8"/>
  <circle cx="32" cy="32" r="21" fill="none" stroke="#c7b07a" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="14" fill="none" stroke="#c7b07a" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="5" fill="#8d939b"/>
</svg>`,
  { size: 128 },
);

const plateTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 44">
  <rect x="0" y="0" width="240" height="44" rx="8" fill="#d4a94e"/>
  <rect x="5" y="5" width="230" height="34" rx="5" fill="none" stroke="#6b4a18" stroke-width="2"/>
  <text x="120" y="29" font-family="serif" font-size="18" font-weight="bold" fill="#4a3110" text-anchor="middle" letter-spacing="3">GRAND CONCERT</text>
</svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const base = b.joint("base", { at: [0, 0, 0] });

  // ---------- paints ----------
  const wood = grain(WALNUT, WALNUT_DK, { size: 0.012, axis: "x", seed: 2 });
  const woodV = grain(WALNUT, WALNUT_DK, { size: 0.01, axis: "y", seed: 4 });
  const woodDark = grain(WALNUT_DK, WALNUT_XDK, { size: 0.01, axis: "x", seed: 5 });
  const brassA = mottle(BRASS, PATINA, { size: 0.07, contrast: 0.55, seed: 3 });
  const brassB = mottle(BRASS_BR, "#a9a85f", { size: 0.07, contrast: 0.5, seed: 3 });

  const box = (w: number, h: number, d: number, at: number[], color: any) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: base, at });

  // ---------- cabinet ----------
  box(0.5, 0.03, 0.48, [0, 0.085, 0], wood); // plinth
  box(0.46, 0.28, 0.44, [0, 0.24, 0], wood); // body
  box(0.5, 0.035, 0.48, [0, 0.3975, 0], wood); // top slab

  // edge moldings
  const mold = (a: number[], c: number[], r: number) => b.rod(a, c, r, { color: woodDark, bone: base, sides: 6 });
  mold([-0.25, 0.415, 0.24], [0.25, 0.415, 0.24], 0.007);
  mold([0.25, 0.415, 0.24], [0.25, 0.415, -0.24], 0.007);
  mold([-0.25, 0.415, 0.24], [-0.25, 0.415, -0.24], 0.007);
  mold([-0.25, 0.38, 0.24], [0.25, 0.38, 0.24], 0.008);
  mold([0.25, 0.38, 0.24], [0.25, 0.38, -0.24], 0.008);
  mold([-0.25, 0.38, 0.24], [-0.25, 0.38, -0.24], 0.008);
  mold([-0.235, 0.105, 0.225], [0.235, 0.105, 0.225], 0.008);
  mold([0.235, 0.105, 0.225], [0.235, 0.105, -0.225], 0.008);
  mold([-0.235, 0.105, 0.225], [-0.235, 0.105, -0.225], 0.008);

  // front panel frame
  const fz = 0.223;
  mold([-0.19, 0.125, fz], [0.19, 0.125, fz], 0.006);
  mold([-0.19, 0.355, fz], [0.19, 0.355, fz], 0.006);
  mold([-0.19, 0.125, fz], [-0.19, 0.355, fz], 0.006);
  mold([0.19, 0.125, fz], [0.19, 0.355, fz], 0.006);

  // inlays
  b.part(new THREE.PlaneGeometry(0.36, 0.21), "#ffffff", { bone: base, at: [0, 0.24, 0.2235], dir: [0, 0, 1], axis: "z", texture: inlayFront });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.36, 0.21), "#ffffff", { bone: base, at: [s * 0.2325, 0.24, 0], dir: [s, 0, 0], axis: "z", texture: inlayFront });
  b.part(new THREE.PlaneGeometry(0.46, 0.44), "#ffffff", { bone: base, at: [0, 0.4155, 0], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: inlayTop });

  // name plate on the plinth
  b.part(new THREE.PlaneGeometry(0.13, 0.024), "#ffffff", { bone: base, at: [0, 0.085, 0.2415], dir: [0, 0, 1], axis: "z", texture: plateTex });

  // turned corner columns
  const column: [number, number][] = [
    [0, 0], [0.022, 0], [0.022, 0.02], [0.013, 0.03], [0.016, 0.06], [0.019, 0.14],
    [0.016, 0.22], [0.013, 0.25], [0.022, 0.26], [0.022, 0.28], [0, 0.28],
  ];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.lathe(column, { at: [sx * 0.226, 0.1, sz * 0.216], segments: 8, color: woodV, bone: base });
      for (const y of [0.13, 0.35])
        b.part(new THREE.TorusGeometry(0.018, 0.0035, 4, 10), brassA, { bone: base, at: [sx * 0.226, y, sz * 0.216], dir: [0, 1, 0], axis: "z" });
    }

  // brass keyhole escutcheon
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 8), brassB, { bone: base, at: [0, 0.335, 0.226], dir: [0, 0, 1] });
  b.part(new THREE.BoxGeometry(0.003, 0.008, 0.003), BLACK, { bone: base, at: [0, 0.333, 0.228] });

  // ---------- ball-and-claw feet ----------
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const fx = sx * 0.21, fzz = sz * 0.2;
      b.part(new THREE.SphereGeometry(0.026, 10, 7), woodDark, { bone: base, at: [fx, 0.026, fzz] });
      b.part(new THREE.SphereGeometry(0.022, 8, 6), woodV, { bone: base, at: [fx, 0.062, fzz], scale: [1, 0.8, 1] });
      const oa = Math.atan2(sz, sx);
      for (const da of [-55, 0, 55, 180]) {
        const a = oa + (da * Math.PI) / 180;
        const ux = Math.cos(a), uz = Math.sin(a);
        const P = (rr: number, y: number) => [fx + ux * rr, y, fzz + uz * rr];
        b.sweep(bezier(P(0.012, 0.058), P(0.031, 0.042), P(0.029, 0.013), P(0.017, 0.003)), [0.008, 0.0015], {
          color: brassA, bone: base, sides: 6, caps: { start: "round", end: "point" },
        });
      }
    }

  // ---------- turntable & record ----------
  b.part(new THREE.CylinderGeometry(0.165, 0.165, 0.016, 28), SILVER, { bone: base, at: [0, 0.423, 0.02] });
  b.part(new THREE.TorusGeometry(0.165, 0.003, 4, 28), SILVER_DK, { bone: base, at: [0, 0.431, 0.02], dir: [0, 1, 0], axis: "z" });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.004, 28), BLACK, { bone: base, at: [0, 0.433, 0.02] });
  b.part(new THREE.CircleGeometry(0.15, 32), "#ffffff", { bone: base, at: [0, 0.4356, 0.02], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: recordTex });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.02, 6), SILVER, { bone: base, at: [0, 0.44, 0.02] });

  // speed dial and brake lever
  b.part(new THREE.CylinderGeometry(0.018, 0.02, 0.006, 10), SILVER, { bone: base, at: [-0.2, 0.418, 0.19] });
  b.rod([-0.2, 0.421, 0.19], [-0.175, 0.428, 0.165], 0.003, { color: SILVER, bone: base });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), BLACK, { bone: base, at: [-0.175, 0.428, 0.165] });

  // ---------- horn post ----------
  const postZ = -0.19;
  b.lathe(
    [[0, 0], [0.04, 0], [0.04, 0.008], [0.025, 0.015], [0.02, 0.06], [0.026, 0.07], [0.026, 0.085], [0, 0.085]],
    { at: [0, 0.415, postZ], segments: 12, color: brassB, bone: base },
  );

  // ---------- tonearm & soundbox ----------
  b.sweep(
    catmull([[0, 0.485, postZ + 0.015], [0.025, 0.505, -0.06], [0.055, 0.505, 0.03], [0.064, 0.49, 0.075]]),
    [0.009, 0.006],
    { color: SILVER, bone: base, sides: 8 },
  );
  b.part(new THREE.TorusGeometry(0.011, 0.003, 4, 10), SILVER_DK, { bone: base, at: [0.022, 0.503, -0.07], dir: [0.2, 0, 1], axis: "z" });
  const sbC = [0.075, 0.476, 0.08];
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.018, 16), SILVER, { bone: base, at: sbC, dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.027, 16), "#ffffff", { bone: base, at: [sbC[0] + s * 0.0105, sbC[1], sbC[2]], dir: [s, 0, 0], axis: "z", texture: micaTex });
    b.part(new THREE.TorusGeometry(0.03, 0.003, 4, 16), SILVER_DK, { bone: base, at: [sbC[0] + s * 0.009, sbC[1], sbC[2]], dir: [1, 0, 0], axis: "z" });
  }
  b.rod([0.075, 0.446, 0.08], [0.075, 0.44, 0.088], 0.004, { color: SILVER_DK, bone: base });
  b.spike([0.075, 0.44, 0.088], [0.075, 0.436, 0.092], null, 0.0015, { color: BLACK, bone: base });

  // ---------- wind-up crank (model's right, -X) ----------
  const cy = 0.26, cz = 0.05;
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 12), brassB, { bone: base, at: [-0.233, cy, cz], dir: [-1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.013, 0.016, 0.014, 8), brassA, { bone: base, at: [-0.243, cy, cz], dir: [-1, 0, 0] });
  b.rod([-0.24, cy, cz], [-0.292, cy, cz], 0.006, { color: SILVER, bone: base });
  b.capsule([-0.292, cy, cz], [-0.292, 0.18, cz + 0.03], 0.006, { color: SILVER, bone: base, sides: 6 });
  b.part(new THREE.SphereGeometry(0.01, 8, 6), SILVER, { bone: base, at: [-0.292, cy, cz] });
  b.capsule([-0.298, 0.18, cz + 0.03], [-0.338, 0.18, cz + 0.03], [0.011, 0.012], { color: woodDark, bone: base, sides: 8 });

  // ---------- morning-glory horn ----------
  const Pv = new THREE.Vector3(0, 0.74, -0.12);
  const Dv = new THREE.Vector3(0, 0.45, 1).normalize();
  const e1 = new THREE.Vector3(1, 0, 0);
  const e2 = new THREE.Vector3().crossVectors(Dv, e1).normalize();
  const L = 0.42, r0 = 0.035, R = 0.27;
  const k = Math.log(R / r0) / L;
  const rOf = (h: number) => r0 * Math.exp(k * h);
  const P = [Pv.x, Pv.y, Pv.z];
  const mouth = Pv.clone().addScaledVector(Dv, L);

  // neck from post to throat
  const c3 = Pv.clone().addScaledVector(Dv, -0.08);
  b.sweep(bezier([0, 0.49, postZ], [0, 0.63, -0.27], [c3.x, c3.y, c3.z], P), [0.022, r0], {
    color: brassA, bone: base, sides: 10, caps: "flat",
  });
  b.part(new THREE.TorusGeometry(r0 + 0.002, 0.006, 6, 14), brassB, { bone: base, at: P, dir: [Dv.x, Dv.y, Dv.z], axis: "z" });
  b.part(new THREE.TorusGeometry(0.026, 0.005, 6, 12), brassB, { bone: base, at: [0, 0.5, postZ], dir: [0, 1, 0], axis: "z" });

  // bell shell
  const steps = 14;
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const h = (L * i) / steps;
    outer.push([rOf(h), h]);
    inner.push([Math.max(0.001, rOf(h) - 0.006), h]);
  }
  const bellOutline: [number, number][] = [...outer, ...inner.reverse()];

  const tmp = new THREE.Vector3();
  const rv = new THREE.Vector3();
  const hornPaint = paint((p, n) => {
    tmp.copy(p).sub(Pv);
    const h = tmp.dot(Dv);
    rv.copy(tmp).addScaledVector(Dv, -h);
    const ang = Math.atan2(rv.dot(e2), rv.dot(e1));
    const f = ((((ang / (Math.PI * 2)) * 8) % 8) + 8) % 8;
    const panel = Math.floor(f);
    const frac = f - panel;
    const nearRib = Math.min(frac, 1 - frac);
    const isInner = n.dot(rv) < 0;
    if (isInner) {
      if (h < 0.1) return BRASS_DEEP;
      if (nearRib < 0.07 && h > 0.14) return "#f3dc95"; // flower star lines
      if (h < 0.17) return BRASS_IN2;
      return panel % 2 ? BRASS_IN : BRASS_IN2;
    }
    return panel % 2 ? brassA : brassB;
  });
  b.lathe(bellOutline, { at: P, axis: [Dv.x, Dv.y, Dv.z], segments: 24, color: hornPaint, bone: base });

  // rolled rim
  b.part(new THREE.TorusGeometry(R + 0.002, 0.008, 6, 40), brassB, {
    bone: base, at: [mouth.x, mouth.y, mouth.z], dir: [Dv.x, Dv.y, Dv.z], axis: "z",
  });

  // petal seam ribs with rivets
  const rivetGeo: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const th = (i * Math.PI) / 4;
    const radial = e1.clone().multiplyScalar(Math.cos(th)).addScaledVector(e2, Math.sin(th));
    const pts: number[][] = [];
    for (let j = 0; j <= 8; j++) {
      const h = 0.03 + ((L - 0.03) * j) / 8;
      const q = Pv.clone().addScaledVector(Dv, h).addScaledVector(radial, rOf(h) + 0.002);
      pts.push([q.x, q.y, q.z]);
    }
    b.sweep(catmull(pts), [0.003, 0.0055], { color: BRASS_BR, bone: base, sides: 5 });
    for (const h of [0.12, 0.24, 0.36]) {
      const q = Pv.clone().addScaledVector(Dv, h).addScaledVector(radial, rOf(h) + 0.0065);
      rivetGeo.push(new THREE.SphereGeometry(0.0035, 5, 4).translate(q.x, q.y, q.z));
    }
  }
  for (const g of rivetGeo) b.part(g, PATINA, { bone: base, at: [0, 0, 0] });

  return b.root;
}
