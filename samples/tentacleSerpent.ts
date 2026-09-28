// Tentacle serpent. The skeleton is rooted mid-body with two chains growing both ways along one
// body curve. The tail has a belly sector under its stripes and plates along its back, a dorsal fin stands on
// the neck's skin line, a spike collar and a closed ring circle the tilted neck, a twisted tusk juts from the
// head, and tentacles sprouted from the head surface curl on arcs. A frill of 13 ribs rings the neck on 4 group
// joints; the jaw is posed open at the end. Every ringed or along-placed item inherits the bone of what it rings.
import { BoxGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { lerp, offset } from "../src/math";
import { arc, catmull, polyline } from "../src/path";

export const meta = {
  name: "Tentacle Serpent",
  description: "Serpent rooted mid-body, with a frill on four group joints, a twisted tusk and sprouted tentacles.",
};

const SKIN = "#2f6f73";
const BELLY = "#d9c98f";
const PLATE = "#1d3b44";
const TENTACLE = "#8a4f7d";
const TIP = "#e6a0c4";
const STRIPE = "#1f5256";
const FIN = "#c46a3b";
const TUSK = "#f2ead3";

export default function build() {
  const b = createBuilder({ name: "serpent" });

  // One body curve; the root sits on it and two chains grow toward the head and the tail.
  const body = catmull([
    [0.2, 0.05, -1.7],
    [-0.25, 0.1, -1.15],
    [0.2, 0.16, -0.55],
    [0, 0.2, 0],
    [-0.2, 0.22, 0.5],
    [0, 0.45, 0.95],
    [0, 0.75, 1.2],
  ]);
  const core = b.joint("core", { at: body.at(body.knots[3]), role: "spine", group: "body" });
  const rootT = body.closestT(core.at);
  const front = b.chain("front", body.slice(rootT, 1), { parent: core, count: 5, role: "neck", group: "neck" });
  const back = b.chain("back", body.slice(rootT, 0), { parent: core, count: 7, role: "tail", group: "tail" });
  const frontTube = b.sweep(front, [0.2, 0.19, 0.16, 0.14], { color: SKIN, sides: 10, sectors: [[110, 250, BELLY]] });
  // Stripes per tail joint, and a pale belly sector under all of them.
  const backTube = b.sweep(back, [0.2, 0.17, 0.12, 0.07, 0.04], {
    sides: 10,
    color: (t) => (Math.floor(t * 7) % 2 ? SKIN : STRIPE),
    sectors: [[110, 250, BELLY]],
  });

  // Dorsal fin: a membrane between the neck's dorsal skin line (sunk 1 cm) and the same line 12 cm up. Both edges
  // are Paths, so `bone: front` hands each cell to the nearest neck joint.
  b.membrane(frontTube.line(0, -0.01).slice(0.05, 0.45), frontTube.line(0, 0.12).slice(0.05, 0.45), {
    thickness: 0.015,
    color: FIN,
    scallop: 0.3,
    bone: front,
    group: "neck",
  });

  // Dorsal plates seated on the top of the tail tube.
  b.along(backTube, 9, (at) => b.part(new BoxGeometry(0.12, 0.04, 0.09), PLATE, { frame: at }), {
    from: 0.02,
    to: 0.85,
  });

  // Tail fluke: flattened sideways by rolling the section with `up`.
  const tip = back.at(1);
  b.sweep([tip, offset(tip, tip, 0.28)], (t) => [0.02, 0.14 * (1 - t) + 0.02], {
    up: [1, 0, 0],
    color: PLATE,
  });

  // Spike collar around the tilted neck axis, and a seamless closed ring on the skin just below it.
  b.ring(front.at(0.55), { count: 9, radius: 0.13 }, (spike) => b.spike(spike, spike, 0.12, 0.03, { color: PLATE }));
  const band = b.ring(front.at(0.5), { count: 8, radius: frontTube.at(0.5).radius });
  b.sweep(catmull(band.items, { closed: true }), 0.025, { color: TIP });

  // Head with jaw.
  const head = b.joint("head", {
    at: front.at(1),
    dir: [0, -0.2, 1],
    role: "head",
    group: "head",
  });
  b.capsule(head, head.local([0, 0.22, 0]), [0.15, 0.1], { color: SKIN, group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.02, -0.07]),
    dir: head.dir([0, 1, -0.3]),
    role: "jaw",
    group: "jaw",
  });
  b.capsule(jaw.at, jaw.local([0, 0.2, 0]), [0.09, 0.06], { bone: jaw, color: BELLY, group: "jaw" });
  // Narwhal tusk: a square section twisted one and a half turns along its length.
  b.sweep([head.local([0, 0.18, 0.05]), head.local([0, 0.8, 0.16])], [0.045, 0.004], {
    bone: head,
    section: "box",
    twist: 540,
    caps: { start: "flat", end: "point" },
    color: TUSK,
    group: "head",
  });
  for (const s of [1, -1]) {
    b.part(new SphereGeometry(0.035, 10, 8), "#111111", {
      bone: head,
      at: head.local([s * 0.12, 0.12, 0.08]),
      group: "head",
    });
    // Antenna: a point-array sweep with a sharp elbow (split into round-capped segments inside one mesh).
    const root = head.local([s * 0.06, 0.08, 0.12]);
    b.sweep(
      [root, offset(root, head.dir([s * 0.3, -0.2, 1]), 0.22), offset(root, head.dir([s * 0.8, 0.9, 1.4]), 0.36)],
      0.014,
      {
        bone: head,
        color: TIP,
        caps: { start: "round", end: "point" },
        group: "head",
      },
    );
  }

  // Tentacles sprouted from the head's real surface: straight out, then an arc curl. Alternate ones use colour
  // bands (round cuts) or overlap cuts; every third is pronated a quarter turn along its chain.
  const headSurface = b.surface(head);
  b.ring(frame(lerp(head, head.local([0, 0.22, 0]), 0.1), head), { count: 6, radius: 0.12 }, ({ i, outward, at }) => {
    const hit = headSurface.nearest(at);
    const reach = offset(hit, outward, 0.18);
    const back = head.dir([0, -1, 0]);
    const curl = arc(offset(reach, back, 0.12), reach, outward.cross(back), 160);
    b.sprout(`tentacle${i + 1}`, hit, polyline([hit, reach]).concat(curl), [0.035, 0.01], {
      count: 5,
      role: "tentacle",
      twist: i % 3 === 0 ? 90 : 0,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      group: `tentacle${i + 1}`,
      ...(i % 2
        ? { overlap: 0.8, color: TENTACLE }
        : {
            bands: [
              [0.75, TENTACLE],
              [1, TIP],
            ] as const,
          }),
    });
  });

  // Frill: 13 ribs ringed around the neck's centre line from the right side over the top to the left, leaning back
  // 25°, owned by 4 group joints instead of 13. Each rib carries a web slab reaching toward the next rib; the slab
  // inherits the rib item's group joint through its first point.
  const step = -200 / 12;
  b.ring(
    front.at(0.8),
    {
      count: 13,
      radius: frontTube.at(0.8).radius * 0.9,
      fromDeg: 100,
      toDeg: -100,
      tilt: -25,
      joints: 4,
      name: "frill",
      group: "neck",
    },
    (rib) => {
      const tip = offset(rib, rib, 0.24);
      b.spike(rib, tip, null, 0.016, { color: PLATE });
      if (rib.i === 12) return;
      const next = rib.outward.applyAxisAngle(front.at(0.8).tangent, step * (Math.PI / 180));
      b.slab([rib, tip, offset(offset(rib, next, 0.2), rib, 0.02)], { thickness: 0.01, color: FIN });
    },
  );

  b.pose(jaw, { axis: [1, 0, 0], deg: 18 });

  return b.root;
}
