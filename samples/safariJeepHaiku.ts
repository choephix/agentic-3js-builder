import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { paint, spots } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Safari Jeep",
  description:
    "An open-top safari jeep with a roof rack, a spare tyre on the tail, round headlight eyes, bunting and a plush bear on the dash, in a cheerful mustard body with teal trim. Real size: about 4 m long (4.3 m with the spare), 2.06 m wide over the mirrors, 2 m tall.",
  style: "whimsical",
  commit: "b816db2",
};

type Geo = THREE.BufferGeometry;
type V = [number, number, number];

const BODY = "#f7b733";
const TEAL = "#1f7a72";
const CREAM = "#f6ecd2";
const DARK = "#2b2f36";
const CHROME = "#cfd8dc";
const LIGHT = "#fff3c4";
const RED = "#e5493a";
const OLIVE = "#6f8f3e";
const CANVAS = "#e6c58f";
const WOOD = "#8a5a33";
const GLASS = "#a7e3ee";
const WHITE = "#ffffff";
const BEAR = "#b5773f";

// Wheel hub height: tread bottom sits on y = 0.
const WHEEL_Y = 0.445;

// A rounded block at `at`, optionally tilted about X first.
function rbox(size: V, at: V, radius: number, tiltX = 0): Geo {
  const [w, h, d] = size;
  const r = Math.min(radius, w / 2, h / 2, d / 2) * 0.99;
  const g = new RoundedBoxGeometry(w, h, d, Math.min(w, h, d) < 0.08 ? 1 : 2, r);
  if (tiltX) g.rotateX(tiltX);
  return g.translate(at[0], at[1], at[2]);
}

// Merge geometries of one colour into one part; every input carries position, normal and uv.
function join(list: Geo[]): Geo {
  const merged = mergeGeometries(
    list.map((g) => (g.index ? g.toNonIndexed() : g)),
    false,
  );
  if (!merged) throw new Error("join: geometries do not share attributes");
  return merged;
}

// One wheel in model space: axle along X, hub at `c`. `yaw` turns the axle (90 for the spare, axle along Z).
function wheelGeos(c: V, yaw = 0) {
  const place = (g: Geo) => g.rotateY(yaw).translate(c[0], c[1], c[2]);
  const tyre: Geo[] = [new THREE.TorusGeometry(0.31, 0.11, 6, 16).rotateY(Math.PI / 2)];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    tyre.push(
      new THREE.BoxGeometry(0.2, 0.06, 0.07).rotateX(a).translate(0, 0.415 * Math.cos(a), 0.415 * Math.sin(a)),
    );
  }
  const nuts: Geo[] = [];
  for (const sx of [-0.11, 0.11]) {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      nuts.push(new THREE.SphereGeometry(0.024, 6, 4).translate(sx, 0.16 * Math.cos(a), 0.16 * Math.sin(a)));
    }
  }
  return {
    tyre: join(tyre.map(place)),
    rim: join([new THREE.CylinderGeometry(0.25, 0.25, 0.2, 14).rotateZ(Math.PI / 2)].map(place)),
    cap: join([new THREE.CylinderGeometry(0.1, 0.1, 0.24, 10).rotateZ(Math.PI / 2)].map(place)),
    nuts: join(nuts.map(place)),
  };
}

export default function build() {
  const b = createBuilder({ name: "safariJeep" });
  const root = b.joint("chassis", { at: [0, 0.6, 0], role: "spine" });

  // Drawings
  const sunTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <g stroke="${TEAL}" stroke-width="4" stroke-linecap="round">${Array.from(
        { length: 12 },
        (_, i) => `<line x1="32" y1="3" x2="32" y2="11" transform="rotate(${i * 30} 32 32)"/>`,
      ).join("")}</g>
      <circle cx="32" cy="32" r="13" fill="${CREAM}"/>
      <circle cx="32" cy="32" r="6" fill="${TEAL}"/>
    </svg>`,
    { size: 256 },
  );
  const plateTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 32">
      <rect x="1" y="1" width="94" height="30" rx="5" fill="${CREAM}" stroke="${TEAL}" stroke-width="2.5"/>
      <circle cx="18" cy="16" r="7" fill="${BODY}"/>
      <rect x="34" y="10" width="48" height="4" rx="2" fill="${TEAL}"/>
      <rect x="34" y="18" width="32" height="4" rx="2" fill="${TEAL}"/>
    </svg>`,
    { size: 512 },
  );
  const deckTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 54">
      <g stroke="${DARK}" stroke-width="1.6" fill="none">
        ${Array.from({ length: 6 }, (_, i) => `<line x1="${i * 8}" y1="0" x2="${i * 8}" y2="54"/>`).join("")}
        ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 9}" x2="40" y2="${i * 9}"/>`).join("")}
      </g>
    </svg>`,
    { size: 512 },
  );
  const wickerTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#c98f4f"/>
      ${Array.from(
        { length: 8 },
        (_, i) =>
          `<rect x="0" y="${i * 8 + 1}" width="64" height="5" rx="2.5" fill="#e6b57e"/><rect x="${i * 8 + 1}" y="0" width="5" height="64" rx="2.5" fill="#a86a36" opacity="0.8"/>`,
      ).join("")}
    </svg>`,
    { size: 256 },
  );
  const coverTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="${TEAL}"/>
      <path d="M6 20 L14 12 L22 20 L30 12 L38 20 L46 12 L54 20 M6 44 L14 36 L22 44 L30 36 L38 44 L46 36 L54 44" stroke="${CREAM}" stroke-width="4" fill="none" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="7" fill="${BODY}"/>
    </svg>`,
    { size: 256 },
  );

  // Paints
  const hullPaint = paint((p) => (p.y < 0.56 ? TEAL : p.y < 0.6 ? CREAM : BODY));
  const seatPaint = spots(CREAM, TEAL, { size: 0.1, amount: 0.35 });

  // Hull: a rounded lofted tub with a round nose and a flat tail; open above (its top is the cabin floor).
  const hull = b.loft(
    [
      { at: [0, 0.66, 1.49], w: 0.9, h: 0.56 },
      { at: [0, 0.68, 1.0], w: 1.3, h: 0.5 },
      { at: [0, 0.7, 0.4], w: 1.62, h: 0.5 },
      { at: [0, 0.74, -0.4], w: 1.7, h: 0.5 },
      { at: [0, 0.74, -1.1], w: 1.7, h: 0.5 },
      { at: [0, 0.72, -1.92], w: 1.3, h: 0.44 },
    ],
    { color: hullPaint, bone: root, name: "hull", caps: { start: "round", end: "flat" } },
  );

  // Face on the nose: round headlight eyes with pupils, a grille and a smile, seated on the hull surface.
  const nose = b.surface(hull);
  for (const s of [1, -1]) {
    const eye = nose.nearest([s * 0.24, 0.7, 2.2]);
    b.stick(new THREE.TorusGeometry(0.105, 0.02, 8, 16).rotateX(Math.PI / 2), CHROME, eye);
    b.stick(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 12), LIGHT, eye);
    b.stick(new THREE.SphereGeometry(0.032, 8, 6), DARK, eye, { embed: 0.3 });
    b.stick(new THREE.SphereGeometry(0.011, 6, 4), WHITE, eye.moved([s * 0.012, 0.03, 0.012]));
  }
  b.stick(new RoundedBoxGeometry(0.5, 0.05, 0.16, 2, 0.02), TEAL, nose.nearest([0, 0.56, 2.2]));
  b.sweep(
    nose.drape(
      catmull([
        [-0.2, 0.6, 2.0],
        [-0.1, 0.52, 2.05],
        [0, 0.5, 2.05],
        [0.1, 0.52, 2.05],
        [0.2, 0.6, 2.0],
      ]),
      { lift: 0.05 },
    ),
    0.014,
    { color: CREAM, bone: root },
  );

  // Grouped flat-colour geometry on the chassis.
  const body: Geo[] = [];
  const teal: Geo[] = [];
  const cream: Geo[] = [];
  const chrome: Geo[] = [];
  const red: Geo[] = [];
  const light: Geo[] = [];
  const olive: Geo[] = [];
  const canvas: Geo[] = [];
  const wood: Geo[] = [];
  const glass: Geo[] = [];
  const seats: Geo[] = [];
  const bear: Geo[] = [];
  const dark: Geo[] = [];

  // Wheel arches over each wheel
  for (const s of [1, -1]) {
    for (const z of [1.2, -1.1]) {
      body.push(new THREE.TorusGeometry(0.5, 0.05, 6, 14, Math.PI).rotateY(Math.PI / 2).translate(s * 0.86, WHEEL_Y, z));
    }
  }

  // Skid plate under the hull, bumper across the nose base
  teal.push(rbox([1.0, 0.07, 2.9], [0, 0.36, 0], 0.03));
  teal.push(rbox([1.5, 0.12, 0.2], [0, 0.42, 1.25], 0.05));

  // Bonnet vents
  for (const z of [1.05, 1.15, 1.25]) teal.push(rbox([0.5, 0.03, 0.045], [0, 0.935, z], 0.012));

  // Cabin floor mat, dash, windscreen
  wood.push(rbox([1.3, 0.03, 2.1], [0, 0.985, -0.6], 0.012));
  cream.push(rbox([1.4, 0.26, 0.2], [0, 1.1, 0.82], 0.05));
  wood.push(rbox([1.42, 0.03, 0.22], [0, 1.23, 0.82], 0.012));
  for (const x of [0.1, 0.3]) {
    chrome.push(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12).rotateX(Math.PI / 2).translate(x, 1.12, 0.93));
    cream.push(new THREE.CylinderGeometry(0.04, 0.04, 0.035, 12).rotateX(Math.PI / 2).translate(x, 1.12, 0.935));
  }
  // Dash slats on the front face of the dash
  for (const x of [-0.5, -0.4, -0.3]) teal.push(rbox([0.07, 0.03, 0.012], [x, 1.1, 0.93], 0.005));
  // Plush bear on the dash: a little passenger
  bear.push(new THREE.SphereGeometry(0.07, 8, 6).translate(-0.55, 1.28, 0.8));
  bear.push(new THREE.SphereGeometry(0.055, 8, 6).translate(-0.55, 1.38, 0.8));
  for (const sx of [-0.04, 0.04]) bear.push(new THREE.SphereGeometry(0.022, 6, 4).translate(-0.55 + sx, 1.43, 0.8));
  cream.push(new THREE.SphereGeometry(0.025, 6, 4).translate(-0.55, 1.36, 0.85));
  for (const sx of [-0.018, 0.018]) dark.push(new THREE.SphereGeometry(0.008, 4, 3).translate(-0.55 + sx, 1.39, 0.845));
  glass.push(rbox([1.42, 0.4, 0.02], [0, 1.39, 0.82], 0.008, -0.53));

  // Front seats (driver on +X, the left) and rear bench, in a stripe paint
  for (const s of [1, -1]) {
    seats.push(rbox([0.56, 0.16, 0.5], [s * 0.42, 1.07, 0.2], 0.05));
    seats.push(rbox([0.56, 0.46, 0.14], [s * 0.42, 1.37, -0.08], 0.05, -0.14));
  }
  seats.push(rbox([1.42, 0.16, 0.5], [0, 1.07, -1.0], 0.05));
  seats.push(rbox([1.42, 0.46, 0.14], [0, 1.37, -1.27], 0.05, -0.14));

  // Pith helmet on the passenger seat, with a teal band
  cream.push(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.27, 0),
        new THREE.Vector2(0.3, 0.02),
        new THREE.Vector2(0.24, 0.035),
        new THREE.Vector2(0.12, 0.045),
        new THREE.Vector2(0.11, 0.13),
        new THREE.Vector2(0.09, 0.16),
        new THREE.Vector2(0, 0.165),
      ],
      16,
    ).translate(-0.42, 1.15, 0.2),
  );
  teal.push(new THREE.TorusGeometry(0.115, 0.012, 6, 16).rotateX(Math.PI / 2).translate(-0.42, 1.19, 0.2));

  // Bunting across the front hoop: a cream string with flags hung from it
  const bunting = catmull([
    [-0.8, 1.68, 0.76],
    [-0.4, 1.6, 0.78],
    [0, 1.57, 0.8],
    [0.4, 1.6, 0.78],
    [0.8, 1.68, 0.76],
  ]);
  b.sweep(bunting, 0.008, { color: CREAM, bone: root });
  const flagColours = [TEAL, RED, OLIVE, BODY];
  let flag = 0;
  b.along(bunting, 9, (at) => {
    b.extrude(
      [
        [-0.035, 0],
        [0.035, 0],
        [0, -0.07],
      ],
      { at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: flagColours[flag++ % flagColours.length] },
    );
  });
  // Mirrors
  for (const s of [1, -1]) {
    b.rod([s * 0.74, 1.36, 0.8], [s * 0.98, 1.42, 0.8], 0.018, { color: CHROME, bone: root });
    teal.push(rbox([0.06, 0.14, 0.1], [s * 1.0, 1.42, 0.8], 0.02));
  }

  // Windscreen posts, roll cage, spotlights
  for (const s of [1, -1]) {
    b.rod([s * 0.74, 1.2, 0.92], [s * 0.74, 1.56, 0.7], 0.03, { color: TEAL, bone: root });
    b.rod([s * 0.8, 0.99, -0.2], [s * 0.8, 1.6, -0.2], 0.03, { color: TEAL, bone: root });
    b.rod([s * 0.8, 0.99, -1.45], [s * 0.8, 1.62, -1.45], 0.03, { color: TEAL, bone: root });
    b.rod([s * 0.8, 1.6, 0.7], [s * 0.8, 1.6, -1.45], 0.03, { color: TEAL, bone: root });
    b.rod([s * 0.8, 1.2, 0.8], [s * 0.8, 1.2, -1.45], 0.02, { color: TEAL, bone: root });
    chrome.push(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12).rotateX(Math.PI / 2).translate(s * 0.55, 1.6, 0.74));
    light.push(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12).rotateX(Math.PI / 2).translate(s * 0.55, 1.6, 0.79));
  }
  b.rod([-0.74, 1.56, 0.7], [0.74, 1.56, 0.7], 0.03, { color: TEAL, bone: root });
  b.rod([-0.8, 1.6, -0.2], [0.8, 1.6, -0.2], 0.025, { color: TEAL, bone: root });
  b.rod([-0.8, 1.62, -1.45], [0.8, 1.62, -1.45], 0.03, { color: TEAL, bone: root });

  // Roof rack: crossbars and a grid deck on the rails
  for (const z of [0.4, -0.2, -0.85, -1.4]) {
    b.rod([-0.8, 1.62, z], [0.8, 1.62, z], 0.02, { color: TEAL, bone: root });
  }
  b.part(new THREE.PlaneGeometry(1.6, 2.15).rotateX(-Math.PI / 2).translate(0, 1.67, -0.375), WHITE, {
    bone: root,
    at: [0, 0, 0],
    texture: deckTex,
  });
  for (const x of [-0.5, -0.26]) {
    olive.push(rbox([0.2, 0.32, 0.13], [x, 1.84, 0.25], 0.035));
    teal.push(rbox([0.1, 0.03, 0.03], [x, 2.0, 0.25], 0.012));
  }
  canvas.push(new THREE.CapsuleGeometry(0.12, 0.8, 4, 8).rotateZ(Math.PI / 2).translate(-0.1, 1.8, -1.1));
  teal.push(rbox([0.03, 0.26, 0.27], [0.25, 1.8, -1.1], 0.01));
  teal.push(rbox([0.03, 0.26, 0.27], [-0.45, 1.8, -1.1], 0.01));

  // Rear: lights, bumper, jerry cans, spare tyre mount, exhaust
  for (const s of [1, -1]) {
    red.push(rbox([0.14, 0.08, 0.04], [s * 0.5, 0.9, -1.93], 0.02));
    olive.push(rbox([0.2, 0.32, 0.13], [s * 0.6, 0.66, -1.99], 0.035));
  }
  teal.push(rbox([1.3, 0.14, 0.14], [0, 0.46, -1.97], 0.05));
  teal.push(rbox([0.22, 0.2, 0.12], [0, 1.02, -1.98], 0.04));
  b.rod([0, 0.98, -2.0], [0, 0.98, -2.12], 0.035, { color: CHROME, bone: root });
  b.rod([-0.84, 0.3, -1.72], [-0.84, 1.0, -1.72], 0.035, { color: CHROME, bone: root });
  b.part(new THREE.PlaneGeometry(0.36, 0.12).rotateY(Math.PI).translate(0, 0.45, -2.052), WHITE, {
    bone: root,
    at: [0, 0, 0],
    texture: plateTex,
  });

  // Steering column
  b.rod([0.42, 1.1, 0.72], [0.42, 1.33, 0.52], 0.022, { color: CHROME, bone: root });

  // Fixed body colours
  b.part(join(body), BODY, { bone: root, at: [0, 0, 0] });
  b.part(join(teal), TEAL, { bone: root, at: [0, 0, 0] });
  b.part(join(cream), CREAM, { bone: root, at: [0, 0, 0] });
  b.part(join(chrome), CHROME, { bone: root, at: [0, 0, 0] });
  b.part(join(red), RED, { bone: root, at: [0, 0, 0] });
  b.part(join(light), LIGHT, { bone: root, at: [0, 0, 0] });
  b.part(join(olive), OLIVE, { bone: root, at: [0, 0, 0] });
  b.part(join(canvas), CANVAS, { bone: root, at: [0, 0, 0] });
  b.part(join(wood), WOOD, { bone: root, at: [0, 0, 0] });
  b.part(join(glass), GLASS, { bone: root, at: [0, 0, 0] });
  b.part(join(seats), seatPaint, { bone: root, at: [0, 0, 0] });
  b.part(join(bear), BEAR, { bone: root, at: [0, 0, 0] });
  b.part(join(dark), DARK, { bone: root, at: [0, 0, 0] });

  // Spare tyre on the tail, its cover facing back
  const spare = wheelGeos([0, 0.98, -2.12], Math.PI / 2);
  b.part(spare.tyre, DARK, { bone: root, at: [0, 0, 0] });
  b.part(spare.rim, CREAM, { bone: root, at: [0, 0, 0] });
  b.part(spare.cap, TEAL, { bone: root, at: [0, 0, 0] });
  b.part(spare.nuts, CHROME, { bone: root, at: [0, 0, 0] });
  b.part(new THREE.CircleGeometry(0.34, 24).rotateY(Math.PI).translate(0, 0.98, -2.26), WHITE, {
    bone: root,
    at: [0, 0, 0],
    texture: coverTex,
  });

  // Road wheels: each axle is a hinge; the front ones steer about a kingpin hinge.
  for (const [tag, z] of [
    ["F", 1.2],
    ["R", -1.1],
  ] as const) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hub: V = [s * 0.86, WHEEL_Y, z];
      const parent =
        tag === "F"
          ? b.joint(`steer${tag}${side}`, { parent: root, at: [s * 0.86, 0.78, z], dir: [0, 1, 0], role: "hinge" })
          : root;
      const axle = b.joint(`wheel${tag}${side}`, { parent, at: hub, dir: [1, 0, 0], role: "hinge" });
      const g = wheelGeos(hub);
      b.part(g.tyre, DARK, { bone: axle, at: [0, 0, 0] });
      b.part(g.rim, CREAM, { bone: axle, at: [0, 0, 0] });
      b.part(g.cap, TEAL, { bone: axle, at: [0, 0, 0] });
      b.part(g.nuts, CHROME, { bone: axle, at: [0, 0, 0] });
    }
  }

  // Doors: each swings on a vertical hinge at its front edge.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hinge = b.joint(`door${side}`, { parent: root, at: [s * 0.875, 1.1, 0.42], dir: [0, 1, 0], role: "hinge" });
    const door = b.part(join([rbox([0.07, 0.26, 0.84], [s * 0.875, 1.1, 0], 0.025)]), BODY, {
      bone: hinge,
      at: [0, 0, 0],
    });
    b.decal(door, sunTex, { at: [s * 0.91, 1.1, -0.1], dir: [s, 0, 0], size: [0.3, 0.2], lift: 0.006 });
    b.part(
      join([
        rbox([0.09, 0.04, 0.86], [s * 0.88, 0.955, 0], 0.015),
        rbox([0.03, 0.03, 0.14], [s * 0.91, 1.12, -0.22], 0.012),
      ]),
      TEAL,
      { bone: hinge, at: [0, 0, 0] },
    );
  }

  // Steering wheel on the column: a hinge about the column axis
  const steer = b.joint("steerWheel", { parent: root, at: [0.42, 1.36, 0.5], dir: [0, 0.707, -0.707], role: "hinge" });
  const wheelRing = new THREE.TorusGeometry(0.17, 0.022, 8, 20);
  const spokeA = new THREE.BoxGeometry(0.32, 0.03, 0.03);
  const spokeB = new THREE.BoxGeometry(0.03, 0.32, 0.03);
  const swHub = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10).rotateX(Math.PI / 2);
  const wheelWood = [wheelRing, spokeA, spokeB, swHub].map((g) =>
    g.rotateX(-(3 * Math.PI) / 4).translate(0.42, 1.36, 0.5),
  );
  b.part(join(wheelWood), WOOD, { bone: steer, at: [0, 0, 0] });

  // Hamper on the rack, with a hinged lid
  b.part(new THREE.BoxGeometry(0.5, 0.22, 0.36).translate(0.05, 1.79, -0.5), WHITE, {
    bone: root,
    at: [0, 0, 0],
    texture: wickerTex,
  });
  const lid = b.joint("hamperLid", { parent: root, at: [0.05, 1.9, -0.68], dir: [1, 0, 0], role: "hinge" });
  b.part(new THREE.BoxGeometry(0.5, 0.04, 0.36).translate(0.05, 1.92, -0.5), WHITE, {
    bone: lid,
    at: [0, 0, 0],
    texture: wickerTex,
  });

  return b.root;
}
