```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "Vintage Typewriter",
  description: "A green manual typewriter with round chrome keys, a fan of type bars, a platen carriage, knobs, a return lever and a sheet of typed paper.",
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  b.joint("base", { at: [0, 0, 0] });

  const BODY = "#2f5a4b";
  const BODY_D = "#234438";
  const CHROME = "#cfd3d8";
  const BLACK = "#1b1b1e";
  const CREAM = "#f0e7cf";
  const RED = "#a8322d";

  const cyl = (r: number, h: number, seg: number, color: string, at: number[], dir: number[] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, flat: true });
  const box = (w: number, h: number, d: number, color: string, at: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at });

  // rubber feet
  for (const sx of [1, -1])
    for (const sz of [1, -1]) cyl(0.017, 0.014, 8, BLACK, [sx * 0.15, 0.007, sz * 0.15]);

  // main body: side profile (z, y) extruded across x
  b.extrude(
    [
      [-0.19, 0],
      [0.19, 0],
      [0.19, 0.05],
      [0.08, 0.11],
      [-0.19, 0.11],
    ],
    { at: [0, 0.012, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.34, bevel: 0.008, color: BODY },
  );
  // base trim strip
  box(0.35, 0.012, 0.39, BODY_D, [0, 0.018, -0.0]);
  // chrome trim along the keyboard deck front edge
  box(0.34, 0.008, 0.008, CHROME, [0, 0.07, 0.196]);

  // rear housing
  box(0.34, 0.06, 0.13, BODY, [0, 0.152, -0.115]);
  box(0.3, 0.008, 0.11, BODY_D, [0, 0.186, -0.115]);

  // brand plate
  const brand = svg(
    `<svg viewBox="0 0 120 24"><rect x="1" y="1" width="118" height="22" rx="3" fill="#2a2a2c"/><text x="60" y="17" font-size="14" font-family="serif" font-weight="bold" text-anchor="middle" fill="#e2bd5c">REMINGTON</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.12, 0.024), "#ffffff", {
    at: [0, 0.035, 0.1925],
    dir: [0, 0, 1],
    axis: "z",
    texture: brand,
  });

  // keys on the sloped deck
  const N = [0, 0.878, 0.479];
  const deckPt = (u: number, x: number) => [x, 0.11 - 0.06 * u, 0.08 + 0.11 * u];
  const rows = [10, 10, 9, 8];
  rows.forEach((n, r) => {
    const u = 0.1 + r * 0.2;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 0.03 + (r % 2) * 0.006;
      const p = deckPt(u, x);
      const at = (d: number) => [p[0], p[1] + N[1] * d, p[2] + N[2] * d];
      cyl(0.0035, 0.012, 5, BLACK, at(0.004), N);
      cyl(0.0118, 0.01, 8, CHROME, at(0.011), N);
      cyl(0.0088, 0.004, 8, i === n - 1 && r === 0 ? RED : CREAM, at(0.0165), N);
    }
  });
  // space bar
  {
    const p = deckPt(0.93, 0);
    b.part(new THREE.BoxGeometry(0.15, 0.01, 0.018), CHROME, {
      at: [p[0], p[1] + N[1] * 0.009, p[2] + N[2] * 0.009],
      dir: N,
    });
  }
  // shift levers
  for (const s of [1, -1]) {
    const p = deckPt(0.93, s * 0.135);
    b.part(new THREE.BoxGeometry(0.035, 0.012, 0.018), BLACK, {
      at: [p[0], p[1] + N[1] * 0.01, p[2] + N[2] * 0.01],
      dir: N,
    });
  }

  // type bars fan
  for (let i = 0; i < 11; i++) {
    const a = (i - 5) / 5;
    b.rod([a * 0.1, 0.113, 0.045], [a * 0.06, 0.205, -0.045], 0.0022, { color: CHROME, sides: 5 });
    box(0.006, 0.012, 0.004, BLACK, [a * 0.056, 0.2, -0.046]);
  }
  // type guide
  box(0.04, 0.012, 0.012, CHROME, [0, 0.17, -0.0]);

  // ribbon spools
  for (const s of [1, -1]) {
    cyl(0.032, 0.006, 12, BLACK, [s * 0.135, 0.114, 0.02]);
    cyl(0.026, 0.014, 12, BLACK, [s * 0.135, 0.124, 0.02]);
    cyl(0.01, 0.006, 8, CHROME, [s * 0.135, 0.134, 0.02]);
    cyl(0.003, 0.05, 5, CHROME, [s * 0.135, 0.14, 0.02]);
  }

  // carriage side plates and rail
  for (const s of [1, -1]) {
    box(0.012, 0.075, 0.11, BODY_D, [s * 0.178, 0.205, -0.08]);
    box(0.016, 0.01, 0.12, CHROME, [s * 0.178, 0.244, -0.08]);
  }
  cyl(0.005, 0.37, 6, CHROME, [0, 0.192, -0.03], [1, 0, 0]);

  // platen
  cyl(0.026, 0.37, 12, BLACK, [0, 0.215, -0.08], [1, 0, 0]);
  for (const s of [1, -1]) {
    cyl(0.027, 0.006, 12, CHROME, [s * 0.18, 0.215, -0.08], [1, 0, 0]);
    cyl(0.006, 0.05, 6, CHROME, [s * 0.205, 0.215, -0.08], [1, 0, 0]);
    cyl(0.022, 0.03, 10, BLACK, [s * 0.235, 0.215, -0.08], [1, 0, 0]);
    cyl(0.025, 0.006, 10, CHROME, [s * 0.252, 0.215, -0.08], [1, 0, 0]);
  }

  // carriage return lever (left side)
  b.rod([0.19, 0.25, -0.075], [0.23, 0.275, 0.03], 0.004, { color: CHROME, sides: 6 });
  b.part(new THREE.SphereGeometry(0.011, 8, 6), BLACK, { at: [0.23, 0.275, 0.03], flat: true });

  // paper bail
  b.rod([-0.172, 0.24, -0.045], [0.172, 0.24, -0.045], 0.0028, { color: CHROME, sides: 6 });
  for (const s of [1, -1]) b.rod([s * 0.172, 0.24, -0.045], [s * 0.172, 0.245, -0.075], 0.0028, { color: CHROME, sides: 6 });

  // paper with typed lines
  const lines: string[] = [];
  const widths = [150, 160, 120, 155, 140, 90];
  widths.forEach((w, i) => lines.push(`<rect x="12" y="${14 + i * 10}" width="${w}" height="3" fill="#3a3a44"/>`));
  const paperTex = svg(`<svg viewBox="0 0 180 120"><rect width="180" height="120" fill="#f7f3e6"/>${lines.reverse().join("")}</svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(0.24, 0.17), "#ffffff", {
    at: [0, 0.3, -0.1],
    dir: [0, 0.3, 1],
    axis: "z",
    texture: paperTex,
  });
  // paper back support
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.004), CHROME, { at: [0, 0.255, -0.125], dir: [0, 0.3, 1], axis: "z" });

  return b.root;
}
```