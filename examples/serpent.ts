// Example 3: a tentacled serpent. The skeleton is rooted mid-body with two chains growing both ways along one
// body curve. A frill of 13 ribs on 4 fan banks rings the neck behind the head; the jaw is posed open at the end. The tail has a belly sector under its stripes and plates along its back, a dorsal fin stands on
// the neck's skin line, a spike collar and a closed ring circle the tilted neck, a twisted tusk juts from the
// head, and tentacles sprouted from the head surface curl on arcs.
import { BoxGeometry, SphereGeometry } from "three";
import type { Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { along, ring } from "../src/distribute";
import { aim, lerp, offset } from "../src/math";
import { arc, catmull, polyline } from "../src/path";

export const meta = { name: "SDK smoke: serpent" };

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
  along(
    backTube,
    9,
    (at) => b.part(new BoxGeometry(0.12, 0.04, 0.09), PLATE, { bone: at.joint, at: at.p, quat: aim(at.n, at.tangent) }),
    { from: 0.02, to: 0.85 },
  );

  // Tail fluke: flattened sideways by rolling the section with `up`.
  const tip = back.at(1);
  b.sweep([tip.p, offset(tip.p, tip.tangent, 0.28)], (t) => [0.02, 0.14 * (1 - t) + 0.02], {
    bone: back.joints[6],
    up: [1, 0, 0],
    color: PLATE,
  });

  // Spike collar around the tilted neck axis, and a seamless closed ring on the skin just below it.
  const collar = front.at(0.55);
  ring(collar.p, collar.tangent, 0.13, 9, (p, out) =>
    b.spike(p, out, 0.12, 0.03, { bone: collar.joint, color: PLATE }),
  );
  const band = front.at(0.5);
  const bandPoints: Vector3[] = [];
  ring(band.p, band.tangent, frontTube.at(0.5).radius, 8, (p) => bandPoints.push(p));
  b.sweep(catmull(bandPoints, { closed: true }), 0.025, { bone: band.joint, color: TIP });

  // Head with jaw.
  const neckEnd = front.at(1);
  const head = b.joint("head", {
    parent: front.joints[4],
    at: neckEnd.p,
    dir: [0, -0.2, 1],
    role: "head",
    group: "head",
  });
  b.capsule(head.at, head.local([0, 0.22, 0]), [0.15, 0.1], { bone: head, color: SKIN, group: "head" });
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
  ring(lerp(head.at, head.local([0, 0.22, 0]), 0.1), head.dir([0, 1, 0]), 0.12, 6, (p, out, i) => {
    const hit = headSurface.nearest(p);
    const reach = offset(hit.p, out, 0.18);
    const back = head.dir([0, -1, 0]);
    const curl = arc(offset(reach, back, 0.12), reach, out.clone().cross(back), 160);
    b.sprout(`tentacle${i + 1}`, hit, polyline([hit.p, reach]).concat(curl), [0.035, 0.01], {
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

  // Frill: 13 ribs from the neck skin, spread 200° over the top of the neck and swept back 25°, owned by 4 bank
  // joints instead of 13. Each rib carries a web slab reaching halfway to the next rib.
  const frillAt = frontTube.at(0.8);
  const axis = frillAt.tangent;
  const side = frontTube.at(0.8, 100).p.sub(frillAt.p.clone().addScaledVector(frillAt.n, -frillAt.radius)).normalize();
  // Negative: from the right side, turning left-handed about the tangent carries the ribs over the top.
  const spread = -200;
  b.fan(
    "frill",
    {
      parent: frillAt.joint,
      at: frillAt.p.clone().addScaledVector(frillAt.n, -frillAt.radius),
      axis,
      from: side.multiplyScalar(Math.cos(0.44)).addScaledVector(axis, -Math.sin(0.44)),
      angleDeg: spread,
      count: 13,
      banks: 4,
      radius: frillAt.radius * 0.9,
      group: "neck",
    },
    (item) => {
      const tip = offset(item.p, item.dir, 0.24);
      b.spike(item.p, tip, null, 0.016, { bone: item.joint, color: PLATE });
      if (item.i === 12) return;
      const next = item.dir.clone().applyAxisAngle(axis, ((spread / 12) * Math.PI) / 180);
      b.slab([item.p, tip, offset(offset(item.p, next, 0.2), item.dir, 0.02)], {
        thickness: 0.01,
        color: FIN,
        bone: item.joint,
      });
    },
  );

  b.pose(jaw, { axis: [1, 0, 0], deg: 18 });

  return b.root;
}
