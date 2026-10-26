import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, mottle, rng } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Brutalist Housing Block",
  description: "Raw board-formed concrete housing slab with deep balconies, stair towers, pilotis and lit windows.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist_block" });
  const R = rng(5);

  // Concrete paints: warm top light, cool lower stains, streaks of weathering.
  const concrete = (seed: number, tone: string, dark: string) =>
    paint((p, n) => {
      const big = noise(p, 1.2, seed);
      const fine = noise(p, 0.08, seed + 3);
      const streak = noise(new THREE.Vector3(p.x * 4, p.y * 0.25, p.z * 4), 0.5, seed + 8);
      let c = mix(tone, dark, smoothstep(0.3, 0.8, big) * 0.6 + fine * 0.15);
      c = mix(c, "#2c2a28", 0.35 * smoothstep(0.55, 0.85, streak) * smoothstep(0.6, -0.4, n.y));
      const board = Math.abs(((p.y / 0.18) % 1) - 0.5) < 0.02 ? 0.08 : 0;
      c = mix(c, "#3a3835", board);
      const k = 0.85 + 0.15 * smoothstep(-0.8, 0.8, n.y);
      return [c[0] * k, c[1] * k, c[2] * k] as [number, number, number];
    });
  const CON = concrete(1, "#a39e94", "#7d786f");
  const CON_D = concrete(2, "#8a857b", "#5f5b54");
  const CON_L = concrete(3, "#b5b0a5", "#8f8a80");
  const GROUND = mottle("#5a5750", "#46443f", { size: 0.8, seed: 9 });

  // Textures
  const winTex = svg(
    `<svg viewBox="0 0 32 40"><rect width="32" height="40" fill="#1d252c"/><rect x="2" y="2" width="28" height="36" fill="#34444f"/>
    <path d="M3 3 L14 3 L3 22Z" fill="#6a8394" opacity=".55"/><rect x="15" y="2" width="2" height="36" fill="#161a1e"/><rect x="2" y="19" width="28" height="2" fill="#161a1e"/></svg>`,
    { size: 64 },
  );
  const litTex = svg(
    `<svg viewBox="0 0 32 40"><rect width="32" height="40" fill="#3a2a10"/><rect x="2" y="2" width="28" height="36" fill="#ffc15a"/>
    <rect x="15" y="2" width="2" height="36" fill="#6a4a1c"/><rect x="2" y="19" width="28" height="2" fill="#6a4a1c"/><rect x="5" y="24" width="8" height="12" fill="#d98a30"/></svg>`,
    { size: 64 },
  );
  const doorTex = svg(
    `<svg viewBox="0 0 40 50"><rect width="40" height="50" fill="#2a1f18"/><rect x="3" y="3" width="34" height="44" fill="#c4452a"/><rect x="18" y="3" width="4" height="44" fill="#7a2614"/><circle cx="14" cy="26" r="2" fill="#f0d070"/></svg>`,
    { size: 64 },
  );
  const signTex = svg(
    `<svg viewBox="0 0 80 24"><rect width="80" height="24" fill="#1c1c1c"/><text x="40" y="17" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#e8e0c8">BLOCK 7</text></svg>`,
    { size: 256 },
  );

  const box = (w: number, h: number, d: number, col: any, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z], name });

  // Scale: ~ 48 m long, 22 m tall, 12 m deep
  const L = 48, D = 12, FLOORS = 7, FH = 2.8, PIL = 4.0;
  const topY = PIL + FLOORS * FH;

  // Plinth/ground slab
  box(L + 8, 0.3, D + 10, GROUND, 0, 0.14, 0, "ground");

  // Pilotis: heavy tapered columns
  for (let i = 0; i <= 8; i++) {
    const x = -L / 2 + 1.5 + (i * (L - 3)) / 8;
    for (const z of [-D / 2 + 1.2, D / 2 - 1.2]) {
      b.frustumBox([x, 0.2, z], [x, PIL, z], [1.1, 1.4], [1.5, 1.6], { color: CON_D });
    }
  }
  // Ground-level core walls and entrance
  box(8, PIL - 0.5, 0.6, CON_D, -16, (PIL - 0.5) / 2 + 0.2, 0, "core wall1");
  box(8, PIL - 0.5, 0.6, CON_D, 14, (PIL - 0.5) / 2 + 0.2, 0, "core wall2");
  for (const x of [-16, 14]) {
    b.part(new THREE.PlaneGeometry(2, 2.5), "#ffffff", {
      at: [x, 1.5, 0.35], dir: [0, 0, 1], axis: "z", texture: doorTex,
    });
  }

  // Main slab, with deep floor plates
  box(L, 0.9, D, CON, 0, PIL + 0.45, 0, "transfer slab");
  const bodyH = FLOORS * FH - 0.9;
  box(L - 0.6, bodyH, D - 5.0, CON_L, 0, PIL + 0.9 + bodyH / 2, 0, "body");

  // Floors: slab edges, balconies with parapets, windows
  for (let f = 0; f < FLOORS; f++) {
    const y0 = PIL + 0.9 + f * FH;
    // slab lip front/back
    for (const s of [1, -1]) box(L, 0.35, D, CON, 0, y0 + FH - 0.17, 0, f === 0 ? "slabs" : undefined);
    // balconies on both faces
    const bays = 12;
    for (let i = 0; i < bays; i++) {
      const x = -L / 2 + 2 + (i * (L - 4)) / (bays - 1);
      const lit = R() < 0.28;
      for (const s of [1, -1]) {
        const zf = s * (D / 2 - 2.5 + 0.02);
        // side fins dividing bays
        box(0.3, FH - 0.4, 2.6, CON_D, x + 1.6, y0 + FH / 2 - 0.1, s * (D / 2 - 1.3));
        // parapet
        box(3.0, 0.9, 0.25, CON_D, x, y0 + 0.5, s * (D / 2 - 0.15));
        // window
        b.part(new THREE.PlaneGeometry(1.7, 2.0), "#ffffff", {
          at: [x, y0 + 1.35, s * (D / 2 - 2.5 + 0.03)],
          dir: [0, 0, s], axis: "z", texture: lit && s > 0 ? litTex : winTex,
        });
      }
      if (lit) {
        glow(
          b.part(new THREE.PlaneGeometry(1.7, 2.0), "#ffffff", {
            at: [x, y0 + 1.35, D / 2 - 2.5 + 0.04], dir: [0, 0, 1], axis: "z", texture: litTex,
          }),
          1.2,
        );
      }
    }
  }
  // Roof slab and parapet, plant room, water tank
  box(L + 0.4, 0.5, D + 0.4, CON, 0, topY + 0.25, 0, "roof");
  box(14, 2.6, 6, CON_D, -8, topY + 1.8, 0, "plant room");
  box(6, 1.8, 4, CON, 14, topY + 1.4, 0, "plant 2");
  b.part(new THREE.CylinderGeometry(1.6, 1.6, 2.2, 10), CON_D, { at: [-18, topY + 1.6, 1] });
  for (const x of [-4, -9, -14]) {
    b.part(new THREE.BoxGeometry(2.2, 0.6, 1.8), CON_L, { at: [x, topY + 3.4, 0] });
  }
  // Sign
  b.part(new THREE.PlaneGeometry(7, 2.1), "#ffffff", {
    at: [-16, PIL + 0.9 - 0.05 + 0.0, D / 2 + 0.2], dir: [0, 0, 1], axis: "z", texture: signTex,
  });

  // Two stair/lift towers at the ends, protruding past the slab
  for (const s of [1, -1]) {
    const x = s * (L / 2 + 2.2);
    box(4.4, topY + 2, 5.4, CON_D, x, (topY + 2) / 2, 0, "tower");
    box(4.8, 0.5, 5.8, CON, x, topY + 2.2, 0, "tower cap");
    // vertical slit windows
    for (let k = 0; k < 6; k++) {
      glow(
        b.part(new THREE.BoxGeometry(0.4, 1.8, 0.1), "#ffd68a", {
          at: [x, PIL + 1.5 + k * 3.2, 2.76],
        }),
        0.9,
      );
    }
    // buttress ribs
    for (const z of [-2.9, 2.9]) box(0.5, topY + 1, 0.7, CON, x + s * 1.9, (topY + 1) / 2, z);
  }

  // Link bridges between slab and towers
  for (let k = 0; k < 3; k++) {
    box(2.4, 1.0, 3.0, CON, (L / 2) * 1, PIL + 3 + k * 6, 0);
    box(2.4, 1.0, 3.0, CON, -(L / 2) * 1, PIL + 3 + k * 6, 0);
  }

  // Entry steps and a bench
  for (let i = 0; i < 4; i++) box(9 - i, 0.18, 1.2, CON_L, -16, 0.3 + i * 0.18, D / 2 - 5 + (3 - i) * 0.0 + 0.8 - i * 0.3 + 4.5 - 4);
  box(5, 0.5, 1, CON, 4, 0.55, D / 2 + 2.2, "bench");

  return b.root;
}
