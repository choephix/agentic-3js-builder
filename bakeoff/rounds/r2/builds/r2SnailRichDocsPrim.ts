import * as THREE from "three";
import { createBuilder, catmull, spiral, paint, scales, countershade, rng } from "../../../../src/index";

export const meta = {
  name: "Garden Snail with Ladybird",
  description:
    "A garden snail with a striped caramel, chocolate and cream spiral shell, a pebbly grey-green body, eye stalks and feelers, and a ladybird riding on the shell.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });

  const CARAMEL = "#c98a3c", CHOC = "#5a331b", CREAM = "#f1deb0";
  const BLACK = "#14110f", RED = "#d3271f", WHITE = "#fbf7ee";
  const STALK = "#9aa88a", SLIME = "#c3dccb";

  const skin = countershade(
    scales(["#8f9b7a", "#98a584", "#869273"], "#76826a", { size: 0.006, width: 0.18 }),
    "#c6cba9",
    { level: -0.2 },
  );

  // ---- skeleton: spine ----
  const root = b.joint("root", { at: [0, 0.011, 0] });
  const bodyPath = catmull([
    [0, 0.005, -0.06],
    [0, 0.0105, -0.03],
    [0, 0.0112, 0.0],
    [0, 0.0125, 0.03],
    [0, 0.022, 0.055],
  ]);
  const spine = b.chain("spine", bodyPath, { parent: root, role: "spine", count: 5 });

  const body = b.sweep(spine, (t) => {
    const w = Math.min(1, 0.2 + t * 2.5);
    return [0.0135 * Math.min(1, 0.15 + t * 2.2), 0.0115 * w];
  }, { color: skin, sides: 8 });

  // head
  const endPt = bodyPath.at(1);
  const head = b.joint("head", { parent: spine.joints[4], at: endPt, dir: [0, 0.45, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.0125, 10, 8), skin, {
    bone: head, at: head.local({ forward: 0.004 }), scale: [1, 0.9, 1.1],
  });
  const jaw = b.joint("jaw", {
    parent: head, at: head.local({ forward: 0.008, down: 0.006 }),
    aim: head.local({ forward: 0.02, down: 0.006 }), role: "jaw",
  });
  b.part(new THREE.BoxGeometry(0.012, 0.003, 0.009), "#7b8a70", {
    bone: jaw, at: head.local({ forward: 0.014, down: 0.0085 }),
  });
  b.part(new THREE.BoxGeometry(0.011, 0.003, 0.006), "#8a9878", {
    bone: head, at: head.local({ forward: 0.0155, down: 0.003 }),
  });

  // pebbly bumps on the back
  const bumps = b.surface(body).scatter(70, { rng: rng(3), minDist: 0.006, filter: (h) => h.n.y > 0.3 });
  for (const h of bumps) b.stick(new THREE.SphereGeometry(0.0022, 5, 4), "#7d8a6c", h, { embed: 0.5, flat: true });

  // ---- stalks and feelers ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const stalkTip: [number, number, number] = [s * 0.012, 0.06, 0.073];
    const stalk = b.chain(
      `stalk${side}`,
      catmull([[s * 0.0065, 0.028, 0.06], [s * 0.0095, 0.045, 0.066], stalkTip]),
      { parent: head, names: [`stalk${side}1`, `stalk${side}2`], role: "tentacle" },
    );
    b.sweep(stalk, [0.0036, 0.0022], { color: STALK, sides: 6, caps: "none" });
    b.part(new THREE.SphereGeometry(0.0042, 8, 6), BLACK, { bone: stalk.joints[1], at: stalkTip });
    b.part(new THREE.SphereGeometry(0.0012, 5, 4), WHITE, {
      bone: stalk.joints[1], at: [stalkTip[0] + s * 0.0012, stalkTip[1] + 0.002, stalkTip[2] + 0.0025],
    });

    const feeler = b.chain(
      `feeler${side}`,
      catmull([[s * 0.007, 0.02, 0.068], [s * 0.0095, 0.0185, 0.08], [s * 0.012, 0.0155, 0.092]]),
      { parent: head, names: [`feeler${side}1`, `feeler${side}2`], role: "tentacle" },
    );
    b.sweep(feeler, [0.002, 0.0011], { color: STALK, sides: 5 });
  }

  // ---- shell ----
  const C = [-0.006, 0.043, -0.02];
  const R0 = 0.014, R1 = 0.004;
  const coil = spiral(C, [-0.006, 0.036, -0.008], [1, 0, 0], { turns: 2.3, r1: R1, pitch: 0.005 });
  const stripeCols = [CARAMEL, CARAMEL, CHOC, CARAMEL, CREAM, CARAMEL, CARAMEL, CHOC, CHOC, CARAMEL, CREAM, CARAMEL];
  const shellPaint = paint((_p, _n, s) => {
    if (s[0] < 0.02) return CREAM;
    const d = ((s[1] % 360) + 360) % 360;
    return stripeCols[Math.floor(d / 30) % 12];
  });
  const shell = b.sweep(coil, (t) => 0.62 * R0 * Math.pow(R1 / R0, t) + 0.001, {
    color: shellPaint, bone: spine.joints[2], sides: 10, caps: "round",
  });

  // ---- ladybird ----
  const hit = b.surface(shell).ray([0, 0.2, -0.02], [0, -1, 0]);
  const top = hit ? hit.at.clone() : new THREE.Vector3(0, 0.066, -0.02);
  top.y -= 0.0006;
  const lady = b.joint("ladybird", { parent: spine.joints[2], at: [top.x, top.y, top.z] });
  const P = (x: number, y: number, z: number): [number, number, number] => [top.x + x, top.y + y, top.z + z];
  const a = 0.0045, hy = 0.0034, hz = 0.0056;
  b.part(new THREE.SphereGeometry(1, 10, 8), RED, { bone: lady, at: P(0, 0.0005, 0), scale: [a, hy, hz] });
  b.part(new THREE.BoxGeometry(0.0004, 0.0004, 2 * hz * 0.98), BLACK, { bone: lady, at: P(0, 0.0005 + hy, 0) });
  for (const [x, z] of [[0.0025, 0.0012], [0.0027, -0.0030], [0.0015, 0.0040]]) {
    for (const sx of [1, -1]) {
      const xx = sx * x;
      const yy = hy * Math.sqrt(Math.max(0, 1 - (xx / a) ** 2 - (z / hz) ** 2));
      b.part(new THREE.SphereGeometry(0.0009, 5, 4), BLACK, { bone: lady, at: P(xx, 0.0005 + yy, z), scale: [1, 0.5, 1] });
    }
  }
  b.part(new THREE.SphereGeometry(0.0023, 7, 5), BLACK, { bone: lady, at: P(0, 0.0012, 0.0058), scale: [1.1, 0.8, 0.9] });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0008, 4, 3), WHITE, { bone: lady, at: P(sx * 0.0016, 0.0021, 0.0071) });
    b.rod(P(sx * 0.0007, 0.0015, 0.0078), P(sx * 0.0022, 0.0025, 0.0102), 0.00022, { color: BLACK, bone: lady, sides: 4 });
    for (const z of [0.002, -0.0005, -0.003]) {
      b.rod(P(sx * 0.0035, 0.0003, z), P(sx * 0.0058, -0.0006, z + 0.0012), 0.00032, { color: BLACK, bone: lady, sides: 4 });
    }
  }

  // ---- slime trail ----
  b.extrude(
    [[-0.003, 0], [0.003, 0], [0.006, 0.04], [0.005, 0.09], [0.003, 0.14], [-0.002, 0.14], [-0.006, 0.09], [-0.005, 0.04]],
    { at: [0, 0.0005, -0.055], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.001, smoothing: 1, color: SLIME, bone: root },
  );

  return b.root;
}
