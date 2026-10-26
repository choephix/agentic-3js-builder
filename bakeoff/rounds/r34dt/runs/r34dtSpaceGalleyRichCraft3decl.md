```ts
import * as THREE from "three";
import { createBuilder, rng, svg, paint, noise, mix } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nostromo Galley",
  description: "Cramped, grimy 1979 industrial-future spaceship galley: steel counters, hob, pots, hanging cabinets, pipes, mess table, CRT and hatch.",
};

export default function build() {
  const b = createBuilder({ name: "galley" });
  const R = rng(7);

  // ---------- palette ----------
  const BEIGE = "#b9b09a";
  const GREY = "#6f7377";
  const DARK = "#2a2c30";
  const BLACK = "#121315";
  const AMBER = "#ffa22e";
  const GREEN = "#5dff8a";
  const RED = "#b02a22";
  const YELLOW = "#d9b52a";

  // grime paint: panelled wall with dirt streaks downward
  const grime = (base: string, seed: number) =>
    paint((p, n) => {
      const d = noise(p, 0.25, seed);
      const streak = noise(new THREE.Vector3(p.x * 6, p.y * 0.4, p.z * 6), 0.5, seed + 3);
      let c = mix(base, "#3a362c", 0.35 * d + 0.3 * streak * (1 - Math.min(1, p.y / 2.4)));
      return mix(c, "#15130f", Math.max(0, 0.25 - p.y) * 1.2 + (n.y < -0.5 ? 0.2 : 0));
    });
  const WALL = panelled(grime(BEIGE, 3), { size: 0.6, aspect: 0.8, rivets: 0.06 });
  const STEEL = metal("steel", { polish: 0.55, tarnish: 0.3 });
  const DSTEEL = panelled(metal("steel", { tarnish: 0.45, polish: 0.2 }), { size: 0.4, rivets: 0.05 });
  const IRON = metal("iron");
  const FLOOR = panelled(grime("#4b4e52", 9), { size: 0.5, aspect: 1, rivets: 0.08 });

  // ---------- textures ----------
  const stripes = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#d9b52a"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 l8 -16 h8 l-8 16z" fill="#161616"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  const crt = svg(
    `<svg viewBox="0 0 80 60"><rect width="80" height="60" fill="#04140a"/>
    ${["GALLEY  SYS  7", "> TEMP  OVEN  180C", "> COFFEE  READY", "> STORES  LOW", "> MOTHER  ONLINE", "_"]
      .map((t, i) => `<text x="5" y="${10 + i * 9}" font-family="monospace" font-size="6" fill="#5dff8a">${t}</text>`)
      .join("")}
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<rect x="0" y="${i * 5}" width="80" height="1" fill="#000" opacity=".35"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const label = svg(
    `<svg viewBox="0 0 64 20"><rect width="64" height="20" fill="#e8e2cf"/><rect x="1" y="1" width="62" height="18" fill="none" stroke="#222" stroke-width="1"/>
    <text x="32" y="9" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="7" fill="#222">GALLEY</text>
    <text x="32" y="17" text-anchor="middle" font-family="monospace" font-size="5" fill="#b02a22">DECK C-4  NOSTROMO</text></svg>`,
    { size: 256 },
  );
  const stencil = svg(
    `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="#b02a22" stroke-width="3"/><path d="M20 8 L32 30 H8Z" fill="none" stroke="#b02a22" stroke-width="2.5"/><rect x="19" y="15" width="2" height="8" fill="#b02a22"/><rect x="19" y="25" width="2" height="2" fill="#b02a22"/></svg>`,
    { size: 128 },
  );
  const panelBtns = svg(
    `<svg viewBox="0 0 40 20"><rect width="40" height="20" fill="#25272b"/>${[0, 1, 2, 3, 4]
      .map((i) => `<rect x="${3 + i * 7}" y="3" width="5" height="5" fill="${["#ffa22e", "#5dff8a", "#b02a22", "#ffa22e", "#888"][i]}"/>`)
      .join("")}<rect x="3" y="12" width="34" height="4" fill="#0b0b0c"/><rect x="4" y="13" width="18" height="2" fill="#ffa22e"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  type V = [number, number, number];
  const box = (s: V, at: V, color: any, o: any = {}) => b.part(new THREE.BoxGeometry(...s), color, { at, ...o });
  const cyl = (r: number, h: number, at: V, color: any, dir: V = [0, 1, 0], seg = 10, r2?: number) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), color, { at, dir });
  const decal = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, glows = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
    if (glows) glow(p, glows);
    return p;
  };
  const rivetRow = (a: V, dx: number, n: number, color: string, rad = 0.012, dirN: V = [0, 0, 1]) => {
    const geo = new THREE.SphereGeometry(rad, 5, 4);
    for (let i = 0; i < n; i++) b.part(geo, color, { at: [a[0] + dx * i, a[1], a[2]] });
  };

  // ---------- shell ----------
  box([3.4, 0.06, 2.5], [0, 0.03, 0.1], FLOOR);
  box([3.4, 0.01, 0.0001 + 0.4], [0, 0.065, 1.1], "#d9b52a"); // placeholder yellow strip base
  decal(stripes, 3.0, 0.2, [0, 0.07, 1.15], [0, 1, 0]);
  box([3.4, 2.4, 0.1], [0, 1.2, -1.15], WALL); // back wall
  box([0.1, 2.4, 2.5], [-1.7, 1.2, 0.1], WALL); // left wall (viewer's left = -X side)
  box([0.1, 2.4, 2.5], [1.7, 1.2, 0.1], WALL); // right wall
  // wall ribs
  for (const x of [-1.2, -0.4, 0.4, 1.2]) box([0.08, 2.3, 0.05], [x, 1.2, -1.07], DSTEEL);
  box([3.4, 0.1, 0.08], [0, 0.11, -1.07], DARK); // kick rail
  box([3.4, 0.14, 0.12], [0, 2.38, -1.06], DSTEEL); // top beam

  // ceiling strip with fluorescent lights
  box([3.4, 0.08, 0.5], [0, 2.4, -0.75], IRON);
  for (const x of [-0.9, 0.9]) {
    glow(box([0.9, 0.04, 0.22], [x, 2.35, -0.75], "#f4f6e8"), 1.4);
    box([0.96, 0.02, 0.28], [x, 2.37, -0.75], BLACK);
  }

  // ---------- pipes ----------
  const pipeY = [2.22, 2.1];
  cyl(0.05, 3.3, [0, pipeY[0], -1.0], metal("copper", { tarnish: 0.6, verdigris: 0.2 }), [1, 0, 0], 8);
  cyl(0.035, 3.3, [0, pipeY[1], -1.02], IRON, [1, 0, 0], 8);
  for (const x of [-1.4, -0.2, 0.9, 1.5]) {
    box([0.1, 0.26, 0.04], [x, 2.16, -1.04], DARK);
    cyl(0.06, 0.1, [x, 2.22, -1.0], GREY, [1, 0, 0], 8);
  }
  cyl(0.04, 1.9, [-1.55, 1.15, -1.0], IRON, [0, 1, 0], 8); // vertical riser
  for (const y of [0.4, 1.0, 1.6]) cyl(0.06, 0.08, [-1.55, y, -1.0], GREY, [0, 1, 0], 8);
  // valve wheel
  b.part(new THREE.TorusGeometry(0.07, 0.012, 5, 10), RED, { at: [-1.55, 1.3, -0.9], dir: [0, 0, 1], axis: "z" });
  cyl(0.012, 0.1, [-1.55, 1.3, -0.95], DARK, [0, 0, 1], 6);

  // ---------- lower counter ----------
  const cx = 0.25, cz = -0.72;
  box([2.6, 0.82, 0.7], [cx, 0.47, cz], DSTEEL);
  box([2.66, 0.06, 0.76], [cx, 0.9, cz + 0.01], STEEL); // worktop
  box([2.66, 0.02, 0.04], [cx, 0.94, cz + 0.37], STEEL); // front lip
  // doors and handles
  for (let i = 0; i < 4; i++) {
    const x = cx - 0.95 + i * 0.63;
    box([0.58, 0.64, 0.02], [x, 0.5, cz + 0.36], panelled(metal("steel", { tarnish: 0.35 }), { size: 0.3, rivets: 0.04 }));
    box([0.2, 0.025, 0.03], [x + 0.2, 0.7, cz + 0.39], DARK);
    cyl(0.012, 0.2, [x + 0.2, 0.7, cz + 0.405], GREY, [1, 0, 0], 5);
    rivetRow([x - 0.25, 0.2, cz + 0.375], 0.5, 2, "#8a8d90", 0.01);
  }
  // hazard stripe on kick
  decal(stripes, 2.5, 0.07, [cx, 0.11, cz + 0.38], [0, 0, 1]);

  // ---------- hob ----------
  const hx = 0.7;
  box([0.9, 0.04, 0.55], [hx, 0.95, cz + 0.02], BLACK);
  for (const [dx, dz] of [[-0.2, -0.12], [0.2, -0.12], [-0.2, 0.12], [0.2, 0.12]]) {
    cyl(0.09, 0.015, [hx + dx, 0.975, cz + 0.02 + dz], DARK, [0, 1, 0], 12);
    const ring = b.part(new THREE.TorusGeometry(0.06, 0.008, 4, 12), AMBER, { at: [hx + dx, 0.985, cz + 0.02 + dz], dir: [0, 1, 0], axis: "z" });
    glow(ring, 1.6);
  }
  for (let i = 0; i < 4; i++) {
    cyl(0.022, 0.03, [hx - 0.3 + i * 0.2, 0.97, cz + 0.3], RED, [0, 0, 1], 8);
    box([0.008, 0.008, 0.032], [hx - 0.3 + i * 0.2, 0.99, cz + 0.32], "#eee");
  }
  // extractor hood
  b.part(new THREE.CylinderGeometry(0.2, 0.52, 0.28, 4, 1, false), DSTEEL, { at: [hx, 1.82, cz + 0.05], rotation: [0, 45, 0], scale: [1, 1, 0.85] });
  box([0.2, 0.32, 0.2], [hx, 2.1, cz - 0.1], DSTEEL);
  box([0.78, 0.03, 0.4], [hx, 1.7, cz + 0.05], DARK);

  // ---------- pots and pans ----------
  const pot = (x: number, z: number, y: number, r: number, h: number, c: any) => {
    cyl(r, h, [x, y + h / 2, z], c, [0, 1, 0], 12);
    b.part(new THREE.TorusGeometry(r, 0.01, 4, 12), GREY, { at: [x, y + h, z], dir: [0, 1, 0], axis: "z" });
    box([0.16, 0.022, 0.03], [x + r + 0.07, y + h * 0.8, z], DARK);
    cyl(r * 0.82, 0.01, [x, y + h - 0.01, z], "#2a2420", [0, 1, 0], 12);
  };
  pot(hx - 0.2, cz - 0.1, 0.98, 0.11, 0.14, STEEL);
  pot(hx + 0.2, cz + 0.14, 0.98, 0.085, 0.07, IRON);
  cyl(0.1, 0.015, [hx + 0.2, 1.0, cz - 0.1], DARK, [0, 1, 0], 12);
  // kettle
  cyl(0.07, 0.15, [-0.5, 1.0, cz], STEEL, [0, 1, 0], 10, 0.05);
  b.part(new THREE.TorusGeometry(0.05, 0.008, 4, 8, Math.PI), DARK, { at: [-0.5, 1.1, cz], dir: [0, 0, 1], axis: "z" });
  cyl(0.012, 0.08, [-0.43, 1.07, cz], STEEL, [1, 1, 0], 5);

  // ---------- sink ----------
  box([0.6, 0.05, 0.46], [-0.95, 0.94, cz], BLACK);
  box([0.5, 0.04, 0.36], [-0.95, 0.955, cz], "#3a3d42");
  cyl(0.02, 0.28, [-0.95, 1.08, cz - 0.22], STEEL, [0, 1, 0], 8);
  cyl(0.016, 0.2, [-0.95, 1.2, cz - 0.12], STEEL, [0, 0, 1], 8);
  b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [-1.02, 1.2, cz - 0.22] });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), "#2d5fa8", { at: [-0.88, 1.2, cz - 0.22] });

  // ---------- coffee machine ----------
  const mx = 1.2;
  box([0.34, 0.46, 0.3], [mx, 1.16, cz - 0.1], panelled(grime("#8b8d8f", 4), { size: 0.2, rivets: 0.035 }));
  box([0.3, 0.1, 0.32], [mx, 1.44, cz - 0.1], DARK);
  decal(panelBtns, 0.24, 0.12, [mx, 1.28, cz + 0.055], [0, 0, 1], 0.8);
  box([0.12, 0.02, 0.1], [mx, 1.02, cz + 0.0], DARK);
  cyl(0.05, 0.12, [mx, 1.1, cz], "#cfd3d6", [0, 1, 0], 8);
  const glass = cyl(0.045, 0.1, [mx, 1.1, cz], "#2b1a10", [0, 1, 0], 8);
  void glass;
  // mugs on top of counter
  for (const [x, z] of [[0.05, cz + 0.2], [0.18, cz + 0.12], [-0.3, cz + 0.22]]) {
    cyl(0.04, 0.09, [x, 0.99, z], "#d6d3c6", [0, 1, 0], 8);
    b.part(new THREE.TorusGeometry(0.025, 0.007, 4, 6, Math.PI), "#d6d3c6", { at: [x + 0.04, 0.99, z], dir: [0, 0, 1], axis: "z" });
  }

  // ---------- upper cabinets ----------
  for (const [x, w] of [[-0.95, 0.9], [-0.0, 0.8]] as [number, number][]) {
    box([w, 0.55, 0.38], [x, 1.78, -0.9], DSTEEL);
    for (const k of [-1, 1]) {
      box([w / 2 - 0.03, 0.5, 0.02], [x + k * (w / 4), 1.78, -0.7], panelled(metal("steel", { tarnish: 0.4 }), { size: 0.25, rivets: 0.04 }));
      box([0.03, 0.14, 0.03], [x + k * 0.04, 1.72, -0.68], DARK);
    }
  }
  decal(label, 0.3, 0.09, [-0.95, 1.5, -0.7], [0, 0, 1]);
  decal(stencil, 0.1, 0.1, [-0.55, 1.88, -0.69], [0, 0, 1]);
  // tray rack on wall
  box([0.7, 0.03, 0.14], [1.35, 1.6, -1.0], DARK);
  for (let i = 0; i < 5; i++) box([0.01, 0.2, 0.14], [1.05 + i * 0.15, 1.7, -1.0], GREY);
  for (let i = 0; i < 4; i++) box([0.12, 0.2, 0.02], [1.12 + i * 0.15, 1.72, -0.97], "#c9c6b6", { rotation: [0, 0, 0] });

  // ---------- CRT monitor ----------
  box([0.55, 0.42, 0.3], [1.3, 1.98, -0.9], panelled(grime("#74797e", 11), { size: 0.2, rivets: 0.03 }));
  box([0.46, 0.34, 0.03], [1.3, 1.98, -0.74], BLACK);
  decal(crt, 0.4, 0.3, [1.3, 1.98, -0.722], [0, 0, 1], 1.1);
  for (let i = 0; i < 3; i++) glow(b.part(new THREE.SphereGeometry(0.012, 5, 4), [AMBER, GREEN, RED][i], { at: [1.12 + i * 0.05, 1.77, -0.73] }), 1.5);

  // ---------- mess table + stools ----------
  const tx = -0.2, tz = 0.55;
  box([1.3, 0.05, 0.7], [tx, 0.78, tz], STEEL);
  box([1.34, 0.025, 0.74], [tx, 0.745, tz], DARK);
  cyl(0.07, 0.72, [tx, 0.38, tz], IRON, [0, 1, 0], 8);
  cyl(0.28, 0.04, [tx, 0.06, tz], DSTEEL, [0, 1, 0], 8);
  for (const sx of [-0.5, 0.5]) {
    cyl(0.17, 0.05, [tx + sx, 0.5, tz + 0.55], "#b3342a", [0, 1, 0], 10);
    cyl(0.03, 0.46, [tx + sx, 0.26, tz + 0.55], IRON, [0, 1, 0], 6);
    cyl(0.14, 0.03, [tx + sx, 0.06, tz + 0.55], DSTEEL, [0, 1, 0], 8);
  }
  // tray with food
  box([0.5, 0.02, 0.34], [tx - 0.25, 0.815, tz], "#9b9d98");
  for (const dz of [-0.07, 0.07]) box([0.2, 0.012, 0.11], [tx - 0.35, 0.83, tz + dz], "#d2cfc0");
  cyl(0.06, 0.012, [tx - 0.12, 0.83, tz], "#d2cfc0", [0, 1, 0], 10);
  b.part(new THREE.SphereGeometry(0.035, 6, 4), "#8d6a3a", { at: [tx - 0.35, 0.845, tz - 0.07], scale: [1.2, 0.6, 1] });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), "#6a8a3a", { at: [tx - 0.12, 0.845, tz] });
  // mugs, canisters, salt
  cyl(0.04, 0.09, [tx + 0.3, 0.855, tz - 0.1], "#d6d3c6", [0, 1, 0], 8);
  cyl(0.04, 0.09, [tx + 0.45, 0.855, tz + 0.1], "#d6d3c6", [0, 1, 0], 8);
  cyl(0.03, 0.12, [tx + 0.1, 0.87, tz + 0.15], RED, [0, 1, 0], 8);
  cyl(0.03, 0.12, [tx + 0.18, 0.87, tz + 0.15], "#c9c6b6", [0, 1, 0], 8);
  // cutlery
  for (let i = 0; i < 3; i++) box([0.012, 0.006, 0.14], [tx + 0.0 + i * 0.03, 0.815, tz - 0.2], "#cfd3d6");

  // ---------- hatch on left wall ----------
  box([0.06, 1.9, 0.9], [-1.64, 0.97, 0.2], panelled(grime("#7c8084", 15), { size: 0.4, rivets: 0.05 }));
  box([0.08, 2.0, 0.08], [-1.64, 1.0, -0.28], DARK);
  box([0.08, 2.0, 0.08], [-1.64, 1.0, 0.68], DARK);
  box([0.08, 0.08, 1.0], [-1.64, 1.98, 0.2], DARK);
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12), DARK, { at: [-1.6, 1.55, 0.2], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 12), "#26394a", { at: [-1.58, 1.55, 0.2], dir: [1, 0, 0] });
  b.part(new THREE.TorusGeometry(0.17, 0.015, 4, 12), AMBER, { at: [-1.57, 1.55, 0.2], dir: [1, 0, 0], axis: "z" });
  // wheel handle
  b.part(new THREE.TorusGeometry(0.1, 0.015, 5, 12), IRON, { at: [-1.58, 1.0, 0.2], dir: [1, 0, 0], axis: "z" });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 4;
    box([0.02, 0.2, 0.014], [-1.58, 1.0, 0.2], IRON, { rotation: [(a * 180) / Math.PI, 0, 0] });
  }
  decal(stripes, 0.9, 0.1, [-1.595, 0.12, 0.2], [1, 0, 0]);
  glow(box([0.04, 0.08, 0.08], [-1.58, 1.9, 0.62], RED), 1.5);
  decal(stencil, 0.14, 0.14, [-1.585, 1.78, -0.15], [1, 0, 0]);

  // ---------- storage crates against right wall ----------
  for (let i = 0; i < 3; i++) {
    const w = 0.5 + R() * 0.1;
    box([0.5, 0.35, w], [1.4, 0.23 + i * 0.36 * 0 , 0.15 + i * 0.0], "#00000000" as any, { });
  }
  // simpler, real crates
  box([0.55, 0.38, 0.7], [1.38, 0.25, 0.4], panelled(grime("#5b6347", 21), { size: 0.3, rivets: 0.05 }));
  box([0.5, 0.3, 0.5], [1.38, 0.59, 0.4], panelled(grime("#6a6f4a", 22), { size: 0.3, rivets: 0.05 }));
  decal(stripes, 0.5, 0.06, [1.1, 0.25, 0.76], [0, 0, 1]);
  rivetRow([1.15, 0.43, 0.76], 0.07, 6, "#8a8d90");

  // floor drain, cables
  cyl(0.15, 0.01, [0.9, 0.065, 0.2], DARK, [0, 1, 0], 10);
  for (let i = -2; i <= 2; i++) box([0.2, 0.004, 0.012], [0.9, 0.072, 0.2 + i * 0.05], GREY);
  b.sweep([[-1.2, 0.2, -1.05], [-1.0, 0.05, -1.0], [-0.6, 0.05, -1.0], [-0.4, 0.2, -1.05]], 0.012, { color: BLACK, bone: undefined as any });

  return b.root;
}
```