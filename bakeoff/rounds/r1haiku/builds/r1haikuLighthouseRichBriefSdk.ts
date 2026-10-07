import * as THREE from "three";
import { createBuilder, frame, rng } from "../../../../src/index";

type V = [number, number, number];

export const meta = {
  name: "Lighthouse Island",
  description:
    "A cozy diorama: a striped lighthouse with a glowing lantern room, a keeper's cottage with a crooked chimney, a jetty with a rowboat, gulls, grass and wildflowers on a rocky islet in turquoise water, on a round wooden base.",
};

// Geometry helpers. Every piece is built with its base (or centre, where noted) at the origin,
// then placed on a point with b.stick.
const cyl = (rt: number, rb: number, h: number, seg = 12) =>
  new THREE.CylinderGeometry(rt, rb, h, seg).translate(0, h / 2, 0);
const box = (w: number, h: number, d: number) =>
  new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
const ball = (r: number, sx = 1, sy = 1, sz = 1) =>
  new THREE.SphereGeometry(r, 8, 6).scale(sx, sy, sz).translate(0, r * sy, 0);
const cone = (r: number, h: number, seg = 10) =>
  new THREE.ConeGeometry(r, h, seg).translate(0, h / 2, 0);

export default function build() {
  const b = createBuilder({ name: "lighthouse-island" });
  const R = rng(42);

  // Palette
  const RED = "#d8403a";
  const WHITE = "#f4f1ea";
  const BLACK = "#222326";
  const GLOW = "#ffe07a";
  const BLUE = "#2f6fd1";
  const WOOD = "#6b4a33";
  const PLANK_A = "#a86f43";
  const PLANK_B = "#b97f4f";
  const BRASS = "#c9a34a";
  const ROCK = "#8b8f94";
  const ROCK_DARK = "#5d6168";
  const GRASS = "#5fa35a";
  const GRASS_LIGHT = "#7cc26a";
  const TURQ = "#3fc7c0";
  const FOAM = "#f6fbfb";
  const PINK = "#f08ab4";
  const YELLOW = "#ffd54a";
  const BEAK = "#f29a2e";
  const ROOF = "#b8383a";
  const BRICK = "#9a6a58";
  const BOAT = "#c94a3c";
  const GULL_WING = "#b8c4cc";
  const SEAT = "#7a5233";

  const put = (geo: THREE.BufferGeometry, color: string, p: V) => {
    b.stick(geo, color, frame(p, [0, 1, 0]));
  };

  // Display base and water
  put(cyl(2.4, 2.4, 0.15, 40), WOOD, [0, 0, 0]);
  put(new THREE.TorusGeometry(2.4, 0.02, 6, 40).rotateX(Math.PI / 2), BRASS, [0, 0.15, 0]);
  put(new THREE.CircleGeometry(2.2, 40).rotateX(-Math.PI / 2), TURQ, [0, 0.152, 0]);
  put(new THREE.RingGeometry(1.72, 1.98, 28).rotateX(-Math.PI / 2), FOAM, [0, 0.158, 0]);

  // Islet: a low rocky mound rising from the water
  const ISLE_TOP = 0.6;
  put(cyl(1.7, 1.95, 0.45, 14), ROCK, [0, 0.15, 0]);
  const rocks: [number, number, number][] = [
    [1.1, 0.5, 0.9],
    [-1.2, 0.4, 0.7],
    [1.2, -0.3, -0.5],
    [-0.9, -0.8, -0.9],
    [0.2, 1.2, -0.1],
  ];
  rocks.forEach(([x, z, s], i) => {
    const r = 0.14 + s * 0.04;
    const g = new THREE.DodecahedronGeometry(r, 0).scale(1, 0.65, 1);
    put(g, i % 2 ? ROCK : ROCK_DARK, [x, ISLE_TOP + r * 0.2, z]);
  });

  // Tower footprint
  const TX = -0.45;
  const TZ = -0.2;

  // Lighthouse: six tapered, alternating red and white bands
  const bands = 6;
  const bandH = 0.23;
  for (let i = 0; i < bands; i++) {
    const rBot = 0.2 - i * 0.0067;
    const rTop = 0.2 - (i + 1) * 0.0067;
    const h = bandH + 0.004;
    const g = new THREE.CylinderGeometry(rTop, rBot, h, 12).translate(0, h / 2, 0);
    put(g, i % 2 === 0 ? RED : WHITE, [TX, ISLE_TOP + i * bandH, TZ]);
  }
  const GALLERY_Y = ISLE_TOP + bands * bandH; // about 1.98

  // Gallery deck and black iron railing
  put(cyl(0.26, 0.26, 0.05, 16), BLACK, [TX, GALLERY_Y, TZ]);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    put(box(0.012, 0.12, 0.012), BLACK, [TX + Math.cos(a) * 0.25, GALLERY_Y + 0.05, TZ + Math.sin(a) * 0.25]);
  }
  put(new THREE.TorusGeometry(0.25, 0.008, 4, 20).rotateX(Math.PI / 2), BLACK, [TX, GALLERY_Y + 0.17, TZ]);

  // Lantern room: glowing glass with black mullions, roof and gold finial
  const LANTERN_Y = GALLERY_Y + 0.05;
  put(cyl(0.13, 0.13, 0.22, 10), GLOW, [TX, LANTERN_Y, TZ]);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    put(box(0.02, 0.22, 0.02), BLACK, [TX + Math.cos(a) * 0.13, LANTERN_Y, TZ + Math.sin(a) * 0.13]);
  }
  const ROOF_Y = LANTERN_Y + 0.22;
  put(cone(0.17, 0.14, 10), BLACK, [TX, ROOF_Y, TZ]);
  put(new THREE.SphereGeometry(0.03, 8, 6), BRASS, [TX, ROOF_Y + 0.17, TZ]);

  // Keeper's cottage, with a hip roof, crooked chimney and blue door
  const CX = 0.55;
  const CZ = 0.3;
  put(box(0.42, 0.3, 0.36), WHITE, [CX, ISLE_TOP, CZ]);
  const roofGeo = new THREE.CylinderGeometry(0.0, 0.34, 0.26, 4, 1)
    .translate(0, 0.13, 0)
    .scale(1, 1, 0.85)
    .rotateY(Math.PI / 4);
  put(roofGeo, ROOF, [CX, ISLE_TOP + 0.3, CZ]);
  const chimney = box(0.07, 0.26, 0.07).rotateZ(-0.22);
  put(chimney, BRICK, [CX + 0.13, ISLE_TOP + 0.5, CZ - 0.06]);
  put(box(0.1, 0.18, 0.02), BLUE, [CX, ISLE_TOP, CZ + 0.19]);
  put(box(0.14, 0.03, 0.08), ROCK, [CX, ISLE_TOP, CZ + 0.22]);
  put(box(0.09, 0.09, 0.02), GLOW, [CX - 0.14, ISLE_TOP + 0.13, CZ + 0.19]);
  put(box(0.09, 0.09, 0.02), GLOW, [CX + 0.14, ISLE_TOP + 0.13, CZ + 0.19]);

  // Jetty: a row of boards on pilings, running out over the water
  const JX = 0.9;
  const DECK_Y = 0.42;
  const planks = 8;
  for (let i = 0; i < planks; i++) {
    const z0 = 1.2 + i * 0.1;
    put(box(0.26, 0.04, 0.1), i % 2 ? PLANK_A : PLANK_B, [JX, DECK_Y - 0.04, z0]);
  }
  for (const z of [1.45, 1.75, 2.0]) {
    for (const dx of [-0.1, 0.1]) {
      put(cyl(0.025, 0.025, 0.28, 6), WOOD, [JX + dx, 0.15, z]);
    }
  }

  // Rowboat floating beside the jetty, with a seat
  const boatX = 1.22;
  const boatZ = 1.75;
  put(ball(0.2, 0.5, 0.45, 1.4), BOAT, [boatX, 0.12, boatZ]);
  put(box(0.16, 0.02, 0.07), SEAT, [boatX, 0.22, boatZ]);

  // Rope from boat to jetty piling
  const rope = new THREE.CylinderGeometry(0.005, 0.005, 0.22, 4).rotateX(Math.PI / 2.4);
  put(rope, "#e8d9b0", [JX + 0.2, 0.28, boatZ - 0.08]);

  // Grass tufts and wildflowers around the islet, kept clear of buildings
  const clear = (x: number, z: number) => {
    const dTower = Math.hypot(x - TX, z - TZ);
    const dCottage = Math.hypot(x - CX, z - CZ);
    const dJetty = Math.abs(x - JX) < 0.3 && z > 0.9;
    return dTower > 0.42 && dCottage > 0.42 && !dJetty;
  };
  const blade = (h: number, lean: number) =>
    new THREE.ConeGeometry(0.012, h, 3).translate(0, h / 2, 0).rotateZ(lean);

  let tufts = 0;
  let guard = 0;
  while (tufts < 16 && guard < 400) {
    guard++;
    const a = R() * Math.PI * 2;
    const rad = Math.sqrt(R()) * 1.35;
    const x = Math.cos(a) * rad;
    const z = Math.sin(a) * rad;
    if (!clear(x, z)) continue;
    tufts++;
    for (let k = 0; k < 3; k++) {
      const h = 0.09 + R() * 0.07;
      const lean = (R() - 0.5) * 0.6;
      const dx = (k - 1) * 0.02;
      put(blade(h, lean), k === 1 ? GRASS_LIGHT : GRASS, [x + dx, ISLE_TOP, z + (R() - 0.5) * 0.03]);
    }
  }

  const flowerColors = [PINK, YELLOW, "#ffffff"];
  let flowers = 0;
  guard = 0;
  while (flowers < 9 && guard < 400) {
    guard++;
    const a = R() * Math.PI * 2;
    const rad = Math.sqrt(R()) * 1.3;
    const x = Math.cos(a) * rad;
    const z = Math.sin(a) * rad;
    if (!clear(x, z)) continue;
    flowers++;
    const h = 0.14 + R() * 0.05;
    put(cyl(0.004, 0.004, h, 4), GRASS, [x, ISLE_TOP, z]);
    put(new THREE.SphereGeometry(0.022, 6, 4), flowerColors[flowers % flowerColors.length], [x, ISLE_TOP + h, z]);
  }

  // Two seagulls drifting above the islet
  const gull = (x: number, y: number, z: number, yaw: number) => {
    const body = ball(0.07, 1, 0.8, 1.8).rotateY(yaw).translate(x, y, z);
    put(body, WHITE, [0, 0, 0]);
    const head = new THREE.SphereGeometry(0.045, 8, 6).translate(x, y + 0.06, z + 0.1).rotateY(yaw);
    put(head, WHITE, [0, 0, 0]);
    const beak = new THREE.ConeGeometry(0.018, 0.05, 5)
      .rotateX(Math.PI / 2)
      .translate(0, 0, 0.025)
      .rotateY(yaw)
      .translate(x, y + 0.055, z + 0.16);
    put(beak, BEAK, [0, 0, 0]);
    for (const s of [-1, 1]) {
      const wing = new THREE.BoxGeometry(0.26, 0.012, 0.08)
        .rotateZ(-s * 0.3)
        .translate(s * 0.14, 0.02, 0)
        .rotateY(yaw)
        .translate(x, y, z);
      put(wing, GULL_WING, [0, 0, 0]);
    }
  };
  gull(-0.95, 1.7, 0.55, 0.3);
  gull(0.2, 1.95, 0.95, -0.4);

  return b.root;
}
