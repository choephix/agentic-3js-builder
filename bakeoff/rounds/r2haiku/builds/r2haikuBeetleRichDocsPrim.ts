import * as THREE from "three";
import { catmull, createBuilder, grain, limb, noise, offset, paint, polyline, rng } from "../../../../src/index";

export const meta = {
  name: "Stag beetle on a mossy log",
  description: "A proud stag beetle with chestnut wing cases, branched reddish jaws, feathery antennae and a dewdrop on one antler, gripping a mossy log.",
};

const BLACK = "#16120f";
const CHESTNUT = "#7d3416";
const SHINE = "#b8602c";
const JAW = "#8e4324";
const ANT = "#2d1d14";
const EYE = "#2b1a10";
const DEW = "#bfeaff";
const BARK = "#6b4a2e";
const BARK_DARK = "#43301d";
const MOSS = "#4f8a2c";
const MOSS_LIGHT = "#79ad3f";

export default function build() {
  const b = createBuilder({ name: "stagBeetle" });
  const rand = rng(7);

  // Mossy log along Z, top at y = 0.18.
  const logPaint = paint((p, n) =>
    n.y + 0.25 * noise(p, 0.06, 3) > 0.45
      ? noise(p, 0.04, 5) > 0.5
        ? MOSS_LIGHT
        : MOSS
      : grain(BARK, BARK_DARK, { size: 0.02, axis: "z" }),
  );
  const logPart = b.part(new THREE.CylinderGeometry(0.09, 0.095, 0.6, 16), logPaint, {
    at: [0, 0.09, 0],
    aim: [0, 0, 1],
  });

  // Skeleton
  const body = b.joint("body", { at: [0, 0.2, 0], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, 0.2, 0.05], aim: [0, 0.19, 0.1], role: "head" });

  // Wing cases with a glossy highlight along the top ridge.
  const elytraPaint = paint((_p, n) => (n.y > 0.7 ? SHINE : CHESTNUT));
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 16, 10), elytraPaint, {
      bone: body,
      at: [s * 0.009, 0.2, -0.015],
      scale: [0.85, 0.75, 1.9],
    });
  }
  b.rod([0, 0.217, -0.052], [0, 0.217, 0.02], 0.0015, { bone: body, color: BLACK });

  // Black thorax, abdomen tip and head.
  b.part(new THREE.SphereGeometry(0.018, 14, 10), BLACK, {
    bone: body,
    at: [0, 0.201, 0.03],
    scale: [1.15, 0.8, 1.0],
  });
  b.part(new THREE.SphereGeometry(0.01, 10, 8), BLACK, {
    bone: body,
    at: [0, 0.19, -0.058],
    scale: [1, 0.8, 1.1],
  });
  b.part(new THREE.SphereGeometry(0.012, 12, 8), BLACK, {
    bone: head,
    at: [0, 0.2, 0.058],
    scale: [1.1, 0.85, 0.95],
  });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Eye
    b.part(new THREE.SphereGeometry(0.0045, 8, 6), EYE, {
      bone: head,
      at: [s * 0.0105, 0.205, 0.062],
    });

    // Branched mandible on its own jaw joint.
    const jaw = b.joint(`jaw${L}`, {
      parent: head,
      at: [s * 0.007, 0.2, 0.058],
      aim: [s * 0.018, 0.205, 0.09],
      role: "jaw",
    });
    const mand = catmull([
      [s * 0.007, 0.2, 0.058],
      [s * 0.02, 0.205, 0.09],
      [s * 0.012, 0.2, 0.122],
      [s * 0.003, 0.198, 0.13],
    ]);
    b.sweep(mand, [0.0055, 0.0018], {
      bone: jaw,
      color: JAW,
      caps: { start: "round", end: "point" },
    });
    // Upper tine branching out from the main jaw.
    b.rod([s * 0.017, 0.205, 0.09], [s * 0.031, 0.218, 0.104], [0.0028, 0.0009], { bone: jaw, color: JAW });
    // Inner tooth pointing toward the midline.
    b.spike(mand.at(0.6), [-s * 0.6, 0.5, 0.2], 0.009, 0.0022, { bone: jaw, color: JAW });
    // Dewdrop clinging to the upper tine.
    b.part(new THREE.SphereGeometry(0.0048, 10, 8), DEW, {
      bone: jaw,
      at: [s * 0.024, 0.216, 0.097],
    });

    // Elbowed antenna with a feathery club at the tip.
    const scape = polyline([
      [s * 0.008, 0.214, 0.07],
      [s * 0.016, 0.23, 0.094],
      [s * 0.033, 0.232, 0.108],
    ]);
    const ant = b.chain(`ant${L}`, scape, { parent: head, names: [`scape${L}`, `fla${L}`] });
    b.sweep(ant, [0.0017, 0.0011], { color: ANT });
    b.ring(ant.at(1), { count: 6, radius: 0.0025, tilt: 55 }, (item) =>
      b.capsule(item, offset(item, item.axis, 0.011), 0.0014, { color: ANT }),
    );

    // Six legs: three pairs along the log, gripping the bark.
    const legs = [
      { n: "1", z: 0.04 },
      { n: "2", z: 0.0 },
      { n: "3", z: -0.04 },
    ];
    for (const leg of legs) {
      const id = `${L}${leg.n}`;
      const hip = [s * 0.014, 0.196, leg.z];
      const foot = [s * 0.05, 0.168, leg.z + 0.008];
      const pts = limb(hip, foot, [0.028, 0.028, 0.016], [s, 1, 0]);
      const chain = b.chain(`leg${id}`, pts, {
        parent: body,
        names: [`hip${id}`, `knee${id}`, `ankle${id}`, `tarsus${id}`],
        role: "leg",
      });
      b.sweep(chain, [0.0046, 0.0026], { color: BLACK });
      b.spike(chain.at(0.5), [s, 0.5, -0.2], 0.007, 0.0016, { color: BLACK });
      b.spike(chain.at(0.25), [s, 0.3, 0.4], 0.006, 0.0014, { color: BLACK });
      b.spike(chain.at(1), [s * 0.2, -1, 0], 0.01, 0.0018, { color: BLACK });
    }
  }

  // Moss clumps scattered over the log.
  const moss = b.surface(logPart).scatter(44, {
    rng: rand,
    minDist: 0.03,
    filter: (h) => h.n.y > 0.1,
  });
  for (const h of moss) {
    const r = 0.012 + 0.008 * rand();
    const g = new THREE.SphereGeometry(r, 6, 4).scale(1, 0.55, 1);
    b.stick(g, rand() > 0.5 ? MOSS : MOSS_LIGHT, h, { embed: 0.4 });
  }

  return b.root;
}
