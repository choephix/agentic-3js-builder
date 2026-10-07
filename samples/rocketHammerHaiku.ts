import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { panelled } from "../kits/clockwork";
import { glow } from "../kits/glow";

export const meta = {
  name: "Rocket war hammer",
  description:
    "A two-handed rocket-powered war hammer, about 1.5 m tall, standing on a display plinth. A white hull head with a dark striking face and orange hazard stripes, a steel pick, a rear thruster with four fins and a glowing nozzle, and a slate grip with a status readout.",
  style: "Overwatch",
  commit: "b816db2",
};

const SHELL = "#e6ebf1";
const SLATE = "#2b3440";
const DEEP = "#131a22";
const ACCENT = "#ff7a1a";
const FLAME = "#ffb347";
const CORE = "#fff1d0";
const STEEL = "#b9c3cd";

// Layout in metres: the head centre height, the thruster's root, nozzle joint and mouth along -Z.
const H = 1.32;
const BOOST_Z = -0.11;
const NOZ_Z = -0.31;
const MOUTH_Z = -0.4;

const HULL = panelled(SHELL, { size: 0.09, rivets: 0 });
const GRIP = paint((p) => (Math.floor((p.y - 0.46) / 0.04) % 2 === 0 ? SLATE : DEEP));

const FACE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140">
<defs><clipPath id="c"><rect width="200" height="140" rx="14"/></clipPath></defs>
<rect width="200" height="140" rx="14" fill="${SLATE}"/>
<g clip-path="url(#c)" stroke="${ACCENT}" stroke-width="14">
<line x1="-40" y1="160" x2="40" y2="-20"/>
<line x1="20" y1="160" x2="100" y2="-20"/>
<line x1="80" y1="160" x2="160" y2="-20"/>
<line x1="140" y1="160" x2="220" y2="-20"/>
</g>
<rect x="8" y="8" width="184" height="124" rx="10" fill="none" stroke="${SHELL}" stroke-width="5"/>
<circle cx="100" cy="70" r="30" fill="${SHELL}" stroke="${SLATE}" stroke-width="7"/>
<circle cx="100" cy="70" r="11" fill="${ACCENT}"/>
<circle cx="19" cy="19" r="4" fill="${SHELL}"/>
<circle cx="181" cy="19" r="4" fill="${SHELL}"/>
<circle cx="19" cy="121" r="4" fill="${SHELL}"/>
<circle cx="181" cy="121" r="4" fill="${SHELL}"/>
</svg>`,
  { size: 512 },
);

const READOUT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 170">
<rect width="100" height="170" rx="12" fill="${DEEP}"/>
<rect x="8" y="8" width="84" height="154" rx="8" fill="none" stroke="${SHELL}" stroke-width="3"/>
<circle cx="50" cy="28" r="8" fill="${ACCENT}"/>
<rect x="18" y="56" width="64" height="10" fill="${ACCENT}"/>
<rect x="18" y="76" width="52" height="10" fill="${ACCENT}"/>
<rect x="18" y="96" width="40" height="10" fill="${ACCENT}"/>
<rect x="18" y="116" width="28" height="10" fill="${SLATE}"/>
<rect x="18" y="136" width="20" height="10" fill="${SLATE}"/>
</svg>`,
  { size: 256 },
);

const LABEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
<rect width="100" height="40" rx="6" fill="${SLATE}"/>
<rect x="8" y="9" width="44" height="7" fill="${SHELL}"/>
<rect x="8" y="23" width="28" height="7" fill="${SHELL}"/>
<rect x="62" y="6" width="30" height="28" rx="4" fill="${ACCENT}"/>
</svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "rocketHammer" });

  // Skeleton: the grip is the root; the head rides it, the nozzle gimbals off the head,
  // the trigger hangs off the grip and the top vent flap hinges off the head.
  const grip = b.joint("grip", { at: [0, 0.12, 0], dir: [0, 1, 0], role: "spine" });
  const head = b.joint("head", { parent: grip, at: [0, H, 0], dir: [0, 1, 0], role: "head" });
  const trigger = b.joint("trigger", { parent: grip, at: [0, 0.86, 0.036], dir: [0, 1, 0], role: "hinge" });
  const vent = b.joint("vent", { parent: head, at: [0, H + 0.135, -0.05], dir: [0, 1, 0], role: "hinge" });
  const nozzle = b.joint("nozzle", { parent: head, at: [0, H, NOZ_Z], dir: [0, 0, -1], role: "hinge" });

  // Display stand: a slate plinth with an accent band; the pommel sits in its cradle.
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.21, 0.02],
      [0.19, 0.04],
      [0.13, 0.05],
      [0.12, 0.06],
      [0.1, 0.08],
      [0.1, 0.12],
      [0, 0.12],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], bone: grip, color: SLATE, segments: 24 },
  );
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.012, 24).translate(0, 0.035, 0), ACCENT, {
    bone: grip,
    at: [0, 0, 0],
  });
  b.lathe(
    [
      [0, 0],
      [0.046, 0],
      [0.048, 0.014],
      [0.038, 0.03],
      [0.03, 0.05],
      [0.02, 0.06],
      [0, 0.06],
    ],
    { at: [0, 0.12, 0], axis: [0, 1, 0], bone: grip, color: SLATE, segments: 16 },
  );

  // Haft: steel core, ribbed grip, accent rings, status readout and trigger.
  b.capsule([0, 0.16, 0], [0, 1.25, 0], 0.026, { bone: grip, color: STEEL });
  b.sweep(
    [
      [0, 0.46, 0],
      [0, 1.0, 0],
    ],
    0.036,
    { bone: grip, color: GRIP, caps: "flat" },
  );
  for (const y of [0.44, 1.0])
    b.part(new THREE.TorusGeometry(0.0385, 0.005, 6, 20).rotateX(Math.PI / 2).translate(0, y, 0), ACCENT, {
      bone: grip,
      at: [0, 0, 0],
    });
  b.part(new THREE.BoxGeometry(0.026, 0.12, 0.072).translate(0.035, 0.82, 0), SHELL, {
    bone: grip,
    at: [0, 0, 0],
  });
  b.part(new THREE.PlaneGeometry(0.06, 0.102), "#ffffff", {
    bone: grip,
    at: [0.0485, 0.82, 0],
    dir: [1, 0, 0],
    axis: "z",
    texture: READOUT,
  });
  b.part(new THREE.BoxGeometry(0.016, 0.1, 0.02).translate(0, 0.8, 0.045), SHELL, {
    bone: trigger,
    at: [0, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.042, 0.048, 0.07, 16).translate(0, 1.2, 0), STEEL, {
    bone: head,
    at: [0, 0, 0],
  });

  // Hull head: a bevelled slab with a dark striking face on +Z.
  b.extrude(
    [
      [-0.135, -0.12],
      [0.12, -0.12],
      [0.18, -0.05],
      [0.18, 0.07],
      [0.12, 0.135],
      [-0.12, 0.135],
      [-0.158, 0.06],
      [-0.158, -0.06],
    ],
    { at: [0, H, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.17, bevel: 0.026, smoothing: 1, color: HULL, bone: head },
  );
  b.part(new THREE.PlaneGeometry(0.23, 0.16), "#ffffff", {
    bone: head,
    at: [0, H, 0.0875],
    dir: [0, 0, 1],
    axis: "z",
    texture: FACE,
  });

  // Steel pick out of the -X side, with a slate collar and two accent rings.
  b.spike([-0.14, H, 0], [-0.42, H, 0], null, 0.05, { bone: head, color: STEEL });
  b.part(new THREE.CylinderGeometry(0.06, 0.066, 0.034, 14).rotateZ(Math.PI / 2).translate(-0.16, H, 0), SLATE, {
    bone: head,
    at: [0, 0, 0],
  });
  for (const [x, r] of [
    [-0.25, 0.036],
    [-0.34, 0.018],
  ])
    b.part(new THREE.CylinderGeometry(r, r, 0.008, 14).rotateZ(Math.PI / 2).translate(x, H, 0), ACCENT, {
      bone: head,
      at: [0, 0, 0],
    });

  // Counterweight on the +X side: a white block with slatted vents and three status lights.
  b.part(new THREE.BoxGeometry(0.13, 0.15, 0.15).translate(0.2, H, 0), HULL, {
    bone: head,
    at: [0, 0, 0],
  });
  for (const z of [-0.048, -0.016, 0.016, 0.048])
    b.part(new THREE.BoxGeometry(0.006, 0.09, 0.014).translate(0.2655, H, z), DEEP, {
      bone: head,
      at: [0, 0, 0],
    });
  for (const z of [-0.04, 0, 0.04])
    glow(
      b.part(new THREE.SphereGeometry(0.009, 8, 6).translate(0.2, H + 0.08, z), ACCENT, {
        bone: head,
        at: [0, 0, 0],
      }),
      1.5,
    );

  // Top vent flap on a hinge, with slots and a glowing lip.
  b.part(new THREE.BoxGeometry(0.12, 0.012, 0.12).translate(0, H + 0.14, 0.01), SLATE, {
    bone: vent,
    at: [0, 0, 0],
  });
  for (const z of [-0.02, 0.01, 0.04])
    b.part(new THREE.BoxGeometry(0.08, 0.004, 0.008).translate(0, H + 0.147, z), DEEP, {
      bone: vent,
      at: [0, 0, 0],
    });
  glow(
    b.part(new THREE.BoxGeometry(0.1, 0.006, 0.008).translate(0, H + 0.144, 0.066), ACCENT, {
      bone: vent,
      at: [0, 0, 0],
    }),
    1.5,
  );

  // Rocket thruster: bracket, hull tube with a flange, accent band, side vents and a label.
  b.part(new THREE.BoxGeometry(0.17, 0.17, 0.05).translate(0, H, BOOST_Z - 0.01), SLATE, {
    bone: head,
    at: [0, 0, 0],
  });
  const booster = b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.1, 0.035],
      [0.086, 0.045],
      [0.086, 0.18],
      [0.105, 0.195],
      [0.105, 0.2],
      [0, 0.2],
    ],
    { at: [0, H, BOOST_Z], axis: [0, 0, -1], bone: head, color: HULL, segments: 16 },
  );
  b.part(
    new THREE.CylinderGeometry(0.094, 0.094, 0.022, 16).rotateX(Math.PI / 2).translate(0, H, BOOST_Z - 0.12),
    ACCENT,
    { bone: head, at: [0, 0, 0] },
  );
  for (const s of [1, -1])
    for (const z of [-0.16, -0.18, -0.2])
      b.part(new THREE.BoxGeometry(0.014, 0.05, 0.014).translate(s * 0.09, H, z), DEEP, {
        bone: head,
        at: [0, 0, 0],
      });
  for (const s of [1, -1])
    b.decal(booster, LABEL, { at: [s * 0.086, H, -0.26], dir: [s, 0, 0], size: [0.045, 0.018] });

  // Four fins: two swept slabs on the sides, two on top and bottom.
  const fin = [
    [0.05, 0.03],
    [0.17, 0.03],
    [0.2, 0.14],
    [0.2, 0.2],
    [0.05, 0.2],
  ] as [number, number][];
  for (const s of [1, -1]) {
    b.extrude(fin, {
      at: [0, H, BOOST_Z],
      x: [s, 0, 0],
      y: [0, 0, -1],
      thickness: 0.014,
      bevel: 0.005,
      color: SLATE,
      bone: head,
    });
    b.extrude(fin, {
      at: [0, H, BOOST_Z],
      x: [0, s, 0],
      y: [0, 0, -1],
      thickness: 0.014,
      bevel: 0.005,
      color: SLATE,
      bone: head,
    });
  }

  // Gimballed nozzle: a slate bell, an accent lip, a glowing mouth and a two-stage exhaust.
  b.lathe(
    [
      [0, 0],
      [0.105, 0],
      [0.11, 0.014],
      [0.14, 0.09],
      [0, 0.09],
    ],
    { at: [0, H, NOZ_Z], axis: [0, 0, -1], bone: nozzle, color: SLATE, segments: 16 },
  );
  b.part(new THREE.TorusGeometry(0.136, 0.006, 6, 24).translate(0, H, MOUTH_Z), ACCENT, {
    bone: nozzle,
    at: [0, 0, 0],
  });
  glow(
    b.part(new THREE.CircleGeometry(0.105, 24), FLAME, {
      bone: nozzle,
      at: [0, H, MOUTH_Z - 0.002],
      dir: [0, 0, -1],
      axis: "z",
    }),
    2,
  );
  glow(
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.055, 0.07],
        [0, 0.1],
      ],
      { at: [0, H, MOUTH_Z], axis: [0, 0, -1], bone: nozzle, color: FLAME, segments: 14 },
    ),
    2,
  );
  glow(
    b.lathe(
      [
        [0, 0],
        [0.055, 0],
        [0.028, 0.05],
        [0, 0.075],
      ],
      { at: [0, H, MOUTH_Z], axis: [0, 0, -1], bone: nozzle, color: CORE, segments: 12 },
    ),
    2.5,
  );

  return b.root;
}
