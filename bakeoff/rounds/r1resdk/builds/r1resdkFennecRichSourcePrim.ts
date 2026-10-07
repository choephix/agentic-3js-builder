import * as THREE from "three";
import { createBuilder, line, paint, mix, smoothstep, noise, stripes } from "../../../../src/index";

export const meta = {
  name: "Fennec Fox Kit on a Dune",
  description:
    "Alert fennec fox kit with huge peach-lined ears, sandy-gold coat, black-tipped fluffy tail, oversized paws and a woven leather collar with a brass bell, standing on a rippled sand dune.",
};

export default function build() {
  const b = createBuilder({ name: "fennec_kit" });
  const G = 0.05; // dune top height
  const SAND = "#d9a45f";
  const CREAM = "#f4e6cc";
  const PEACH = "#f3b9a0";
  const DARK = "#1a0f0d";

  const sphere = (r: number) => new THREE.SphereGeometry(r, 10, 8);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---------- paints ----------
  const coat = paint((p, n) => {
    const up = smoothstep(-0.2, 0.6, n.y);
    const c = mix(CREAM, SAND, up * 0.9);
    const nz = noise(p, 0.03, 2);
    return mix(c, "#c68a4a", Math.max(0, nz - 0.55) * 0.8 * up);
  });
  const legP = paint((p) => mix(SAND, CREAM, smoothstep(0.19, 0.11, p.y)));
  const tailP = paint((p, n, s) => {
    const up = smoothstep(-0.3, 0.6, n.y);
    let c = mix("#efd5a6", "#d49c58", up);
    c = mix(c, "#f4e6cc", smoothstep(0.55, 0.8, s[0]) * 0.5);
    return mix(c, "#17110f", smoothstep(0.8, 0.93, s[0]));
  });
  const duneP = stripes("#e3a671", "#c98558", { size: 0.025, axis: [1, 0, 0.4], width: 0.45, wobble: 0.8, seed: 4 });

  // ---------- skeleton ----------
  b.joint("root", { at: [0, G, 0] });
  b.joint("hips", { parent: "root", at: [0, 0.2, -0.08] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.2, -0.08],
      [0, 0.205, 0.01],
      [0, 0.21, 0.1],
    ],
    { parent: "hips", role: "spine", names: ["spine1", "spine2", "chest"] },
  );
  b.joint("neck", { parent: "chest", at: [0, 0.22, 0.1], dir: [0, 0.5, 0.45], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.27, 0.15], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.245, 0.185], dir: [0, 0, 1], role: "jaw" });

  // ---------- dune ----------
  b.lathe(
    [[0, 0], [0.42, 0], [0.4, 0.01], [0.32, 0.03], [0.22, 0.045], [0.12, 0.05], [0, 0.05]],
    { color: duneP, at: [0, 0, 0], bone: "root", segments: 20, name: "dune" },
  );
  b.lathe([[0, 0], [0.16, 0], [0.12, 0.014], [0, 0.03]], { color: duneP, at: [-0.4, 0, -0.05], bone: "root", segments: 14 });
  b.lathe([[0, 0], [0.13, 0], [0.09, 0.012], [0, 0.024]], { color: duneP, at: [0.34, 0, 0.18], bone: "root", segments: 12 });

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.2, -0.15], w: 0.085, h: 0.095 },
      { at: [0, 0.205, -0.07], w: 0.105, h: 0.115 },
      { at: [0, 0.21, 0.03], w: 0.108, h: 0.12 },
      { at: [0, 0.215, 0.105], w: 0.1, h: 0.118 },
    ],
    { color: coat, bone: spine, name: "body" },
  );
  // chest ruff
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.02;
    b.spike([x, 0.19, 0.135], [x * 4, -0.55, 0.6], 0.04, 0.009, { color: CREAM, bone: "chest" });
  }

  // neck
  b.capsule([0, 0.215, 0.09], [0, 0.27, 0.15], [0.048, 0.042], { color: coat, bone: "neck", name: "neck" });

  // ---------- legs ----------
  const leg = (sd: number, front: boolean) => {
    const S = sd > 0 ? "L" : "R";
    const x = sd * 0.047;
    const pts: number[][] = front
      ? [[x, 0.19, 0.085], [x, 0.125, 0.09], [x, G + 0.05, 0.095], [x, G + 0.014, 0.1]]
      : [[x, 0.2, -0.12], [x, 0.14, -0.095], [x, G + 0.06, -0.125], [x, G + 0.014, -0.11]];
    const names = front
      ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `pawF${S}`]
      : [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`];
    const ch = b.chain(`leg${front ? "F" : "H"}${S}`, pts, {
      parent: front ? "chest" : "hips",
      role: "leg",
      names,
    });
    const radii: Array<[number, number]> = front
      ? [[0.024, 0.019], [0.019, 0.014], [0.014, 0.013]]
      : [[0.042, 0.026], [0.026, 0.016], [0.016, 0.013]];
    for (let i = 0; i < 3; i++)
      b.capsule(pts[i], pts[i + 1], radii[i], { color: legP, bone: ch.joints[i] });
    const paw = ch.joints[3];
    const pz = pts[3][2];
    b.part(sphere(0.026), CREAM, { at: [x, G + 0.0155, pz + 0.014], scale: [1.05, 0.62, 1.5], bone: paw });
    for (const dx of [-0.008, 0.008])
      b.part(box(0.002, 0.002, 0.016), "#b89a72", { at: [x + dx, G + 0.03, pz + 0.03], bone: paw });
    if (!front) b.part(sphere(0.045), coat, { at: [x * 1.05, 0.185, -0.125], scale: [0.8, 1, 1.1], bone: "hips" });
  };
  for (const sd of [1, -1]) {
    leg(sd, true);
    leg(sd, false);
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    b.ctxPath ? [] : [
      [0, 0.2, -0.15],
      [0, 0.19, -0.25],
      [0, 0.16, -0.34],
      [0, 0.11, -0.41],
    ],
    { parent: "hips", role: "tail", count: 4 },
  );
  b.sweep(tail, [0.026, 0.042, 0.054, 0.05, 0.032, 0.012], { color: tailP, name: "tail" });

  // ---------- head ----------
  b.part(sphere(0.058), coat, { at: [0, 0.27, 0.17], scale: [1.1, 0.95, 1], bone: "head", name: "skull" });
  b.part(sphere(0.03), CREAM, { at: [0, 0.255, 0.208], scale: [0.8, 0.72, 1.45], bone: "head", name: "muzzle" });
  b.part(sphere(0.011), "#241613", { at: [0, 0.262, 0.25], scale: [1.2, 0.9, 1], bone: "head", name: "nose" });
  b.part(sphere(0.025), CREAM, { at: [0, 0.238, 0.2], scale: [0.7, 0.4, 1.4], bone: "jaw", name: "lowerJaw" });

  for (const sd of [1, -1]) {
    // eyes
    b.part(sphere(0.0165), DARK, { at: [sd * 0.03, 0.282, 0.212], scale: [1, 1.05, 0.7], bone: "head" });
    b.part(sphere(0.0045), "#ffffff", { at: [sd * 0.027, 0.2885, 0.2225], bone: "head" });
    b.part(sphere(0.0022), "#ffffff", { at: [sd * 0.034, 0.276, 0.2205], bone: "head" });
    // tear stripe
    b.capsule([sd * 0.028, 0.268, 0.219], [sd * 0.021, 0.252, 0.234], 0.0035, { color: "#6b4a30", bone: "head" });
    // cheek ruff
    for (let k = 0; k < 3; k++)
      b.spike([sd * 0.05, 0.255 - k * 0.011, 0.17 - k * 0.012], [sd * 1, -0.25 - k * 0.1, -0.4], 0.04, 0.011, {
        color: CREAM,
        bone: "head",
      });
    // whiskers
    for (const k of [-1, 0, 1])
      b.rod([sd * 0.02, 0.258, 0.235], [sd * 0.1, 0.262 + k * 0.016, 0.21], 0.0012, {
        color: "#f7efe0",
        bone: "head",
        sides: 3,
      });

    // ears
    const S = sd > 0 ? "L" : "R";
    const yd = new THREE.Vector3(sd * 0.35, 1, -0.15).normalize();
    const base = new THREE.Vector3(sd * 0.035, 0.305, 0.15);
    b.joint(`ear${S}`, { parent: "head", at: base, dir: yd, role: "hinge" });
    b.joint(`earTip${S}`, { parent: `ear${S}`, at: base.clone().addScaledVector(yd, 0.08), dir: yd });
    const outline: Array<[number, number]> = [
      [-0.026, 0], [-0.034, 0.045], [-0.03, 0.09], [-0.012, 0.14], [0.004, 0.155],
      [0.018, 0.12], [0.03, 0.08], [0.034, 0.04], [0.026, 0],
    ];
    const outer = outline.map(([x, y]) => [x * sd, y] as [number, number]);
    const inner = outline.map(([x, y]) => [x * sd * 0.6, y * 0.8 + 0.012] as [number, number]);
    const ex = [1, 0, 0];
    const ey = [yd.x, yd.y, yd.z];
    b.extrude(outer, {
      color: "#d9a866", at: base.toArray(), x: ex, y: ey, thickness: 0.008, bevel: 0.002,
      smoothing: 1, bone: `ear${S}`, name: `earOuter${S}`,
    });
    b.extrude(inner, {
      color: PEACH, at: [base.x, base.y, base.z + 0.005], x: ex, y: ey, thickness: 0.006, bevel: 0.0015,
      smoothing: 1, bone: `ear${S}`, name: `earInner${S}`,
    });
    for (let k = -1; k <= 1; k++)
      b.spike([sd * (0.035 + k * 0.009), 0.31, 0.165], [k * 0.3, 1, 0.35], 0.035, 0.007, {
        color: CREAM,
        bone: `ear${S}`,
      });
  }

  // ---------- collar & bell ----------
  const C = new THREE.Vector3(0, 0.245, 0.125);
  const d = new THREE.Vector3(0, 0.58, 0.81).normalize();
  const dn = new THREE.Vector3(0, -0.81, 0.58).normalize();
  b.part(new THREE.TorusGeometry(0.056, 0.008, 6, 20), "#7a4b2a", { at: C, dir: d, axis: "z", bone: "neck", name: "collar" });
  let alt = 1;
  b.ring(line(C, C.clone().add(d)), { count: 18, radius: 0.056 }, (item) => {
    alt = -alt;
    b.part(box(0.016, 0.012, 0.013), alt > 0 ? "#c79a63" : "#5e3820", {
      frame: item,
      at: item.moved([0, 0, alt * 0.004]),
      bone: "neck",
    });
  });
  const bellAt = C.clone().addScaledVector(dn, 0.07);
  b.part(new THREE.TorusGeometry(0.007, 0.0017, 5, 10), "#b8862f", {
    at: C.clone().addScaledVector(dn, 0.06), dir: dn, axis: "z", bone: "neck",
  });
  b.part(sphere(0.0145), "#d3a13d", { at: bellAt, bone: "neck", name: "bell" });
  b.part(box(0.015, 0.003, 0.004), "#4a3210", {
    at: bellAt.clone().addScaledVector(dn, 0.0105).addScaledVector(d, -0.003), dir: dn, bone: "neck",
  });
  b.part(new THREE.CylinderGeometry(0.005, 0.007, 0.004, 8), "#b8862f", {
    at: bellAt.clone().addScaledVector(dn, -0.013), dir: dn, bone: "neck",
  });

  return b.root;
}
