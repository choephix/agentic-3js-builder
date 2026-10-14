import * as THREE from "three";
import { createBuilder, paint, stripes, mottle, grain, smoothstep, resolve, mix, rng } from "../../../../src/index";

export const meta = {
  name: "Great Horned Owl",
  description: "A great horned owl perched on a gnarled branch, with barred mottled plumage, ear tufts, facial disc, orange eyes and gripping talons.",
};

export default function build() {
  const b = createBuilder({ name: "greatHornedOwl" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const ell = (x: number, y: number, z: number, seg = 12) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(6, Math.floor(seg * 0.7)));
    g.scale(x, y, z);
    return g;
  };
  const cone = (r: number, h: number, sides: number, sx = 1, sz = 1) => {
    const g = new THREE.ConeGeometry(r, h, sides);
    g.scale(sx, 1, sz);
    return g;
  };

  // ---------- palettes / paints ----------
  const back = stripes(mottle("#5a4330", "#8c6c47", { size: 0.04, seed: 2 }), "#2b2018", {
    size: 0.022, axis: "y", width: 0.25, wobble: 0.8, seed: 4,
  });
  const chest = stripes(mottle("#dcc79c", "#c4a77a", { size: 0.03, seed: 8 }), "#4a3626", {
    size: 0.017, axis: "y", width: 0.16, wobble: 0.6, seed: 6,
  });
  const bodyPaint = paint((p, n) => mix(resolve(back, p, n), resolve(chest, p, n), smoothstep(-0.05, 0.55, n.z)));
  const wingPaint = stripes(mottle("#4b3a2a", "#7a5c3c", { size: 0.03, seed: 5 }), "#d2b88a", {
    size: 0.03, axis: "y", width: 0.2, wobble: 0.5, seed: 3,
  });
  const tailPaint = stripes("#6a5037", "#2a2018", { size: 0.032, axis: [0, -0.7, -0.7], width: 0.38, wobble: 0.2 });
  const legPaint = stripes("#d6bf92", "#5a4430", { size: 0.016, axis: "y", width: 0.2 });
  const headPaint = mottle("#5e4833", "#8a6a46", { size: 0.03, seed: 11 });
  const discPaint = mottle("#c98f4f", "#b27a3f", { size: 0.025, seed: 13 });
  const tuftPaint = stripes("#3a2a1c", "#c9a470", { size: 0.035, axis: "y", width: 0.3 });
  const barkPaint = grain("#3f2f20", "#6e563a", { size: 0.008, axis: "x" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.28, -0.01], dir: [0, 1, 0.1], role: "spine" });
  b.chain("spine", [[0, 0.28, -0.01], [0, 0.4, 0.01]], { parent: hips, role: "spine" });
  b.chain("neck", [[0, 0.46, 0.03], [0, 0.52, 0.05]], { parent: "spine1", role: "neck" });
  const head = b.joint("head", { parent: "neck1", at: [0, 0.52, 0.05], dir: [0, 1, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.505, 0.1], dir: [0, -0.1, 1], role: "jaw" });
  b.chain("tail", [[0, 0.22, -0.1], [0, 0.13, -0.2], [0, 0.04, -0.29]], {
    parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"],
  });

  // ---------- branch ----------
  const branchPath = [[-0.55, 0.1, 0.05], [-0.3, 0.07, 0.08], [-0.1, 0.055, 0.07], [0.1, 0.055, 0.07], [0.3, 0.065, 0.05], [0.55, 0.04, 0.08]];
  b.sweep(branchPath, [0.032, 0.045, 0.052, 0.05, 0.042, 0.034], {
    color: barkPaint, bone: hips, sides: 9, caps: "round", name: "branch",
  });
  b.spike([0.3, 0.07, 0.05], [0.42, 0.2, 0.0], null, 0.016, { color: barkPaint, bone: hips, sides: 6 });
  b.spike([-0.35, 0.08, 0.08], [-0.45, 0.2, 0.12], null, 0.014, { color: barkPaint, bone: hips, sides: 6 });
  b.part(ell(0.035, 0.03, 0.035, 8), "#4a3825", { at: [0.2, 0.09, 0.08], bone: hips });
  b.part(ell(0.03, 0.028, 0.03, 8), "#4a3825", { at: [-0.22, 0.1, 0.08], bone: hips });

  // ---------- body ----------
  b.part(ell(0.15, 0.22, 0.135, 16), bodyPaint, { at: [0, 0.32, 0], bone: "spine1", name: "body" });
  b.part(ell(0.1, 0.09, 0.1, 12), bodyPaint, { at: [0, 0.2, -0.04], bone: hips });
  b.part(ell(0.1, 0.075, 0.09, 12), bodyPaint, { at: [0, 0.5, 0.03], bone: "neck1" });
  b.part(ell(0.05, 0.055, 0.035, 10), "#f1e8d4", { at: [0, 0.465, 0.088], bone: "neck1", name: "bib" });
  b.part(ell(0.03, 0.03, 0.02, 8), "#f1e8d4", { at: [0, 0.42, 0.105], bone: "spine1" });

  // chest feather scallops
  const R = rng(21);
  const cols = ["#d9c398", "#cdb185", "#e3d2ab"];
  for (let row = 0; row < 6; row++) {
    const y = 0.4 - row * 0.05;
    const n = row < 2 ? 5 : 7;
    for (let c = 0; c < n; c++) {
      const x = (c - (n - 1) / 2) * 0.034 * (1 + row * 0.02) + (row % 2) * 0.012;
      const u = x / 0.15, w = (y - 0.32) / 0.22;
      const k = 1 - u * u - w * w;
      if (k <= 0.05) continue;
      const z = 0.135 * Math.sqrt(k);
      const nrm = V(x / 0.0225, (y - 0.32) / 0.0484, z / 0.0182).normalize();
      b.part(ell(0.02, 0.008, 0.032, 6), cols[Math.floor(R() * 3)], {
        at: [x, y, z * 0.985], dir: nrm, up: [0, -1, 0], bone: "spine1", name: "chestFeather",
      });
      b.part(ell(0.012, 0.006, 0.008, 5), "#4a3626", {
        at: [x * 1.005, y - 0.022, z * 0.99 + 0.003], dir: nrm, bone: "spine1",
      });
    }
  }

  // ---------- head ----------
  b.part(ell(0.125, 0.105, 0.1, 14), headPaint, { at: [0, 0.555, 0.04], bone: head, name: "headMass" });
  b.part(ell(0.05, 0.025, 0.04, 8), "#d6bf92", { at: [0, 0.488, 0.1], bone: jaw, name: "chin" });
  b.part(cone(0.022, 0.06, 5), "#7d8083", { at: [0, 0.527, 0.166], dir: [0, -0.48, 0.88], bone: head, name: "beakUpper" });
  b.part(cone(0.014, 0.036, 4), "#6c6f72", { at: [0, 0.505, 0.15], dir: [0, -0.2, 1], bone: jaw, name: "beakLower" });
  b.part(ell(0.02, 0.012, 0.012, 6), "#c7a97a", { at: [0, 0.54, 0.145], bone: head });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // facial disc
    b.part(ell(0.073, 0.082, 0.03, 12), "#17110d", { at: [s * 0.056, 0.552, 0.106], rotation: [0, s * 12, s * -6], bone: head, name: "discRim" + L });
    b.part(ell(0.064, 0.073, 0.03, 12), discPaint, { at: [s * 0.056, 0.552, 0.112], rotation: [0, s * 12, s * -6], bone: head, name: "disc" + L });
    // eyes
    b.part(ell(0.027, 0.027, 0.027, 10), "#f08a12", { at: [s * 0.042, 0.563, 0.147], bone: head, name: "eye" + L });
    b.part(ell(0.014, 0.016, 0.01, 8), "#050505", { at: [s * 0.042, 0.563, 0.171], bone: head, name: "pupil" + L });
    b.part(new THREE.BoxGeometry(0.065, 0.012, 0.03), "#241810", { at: [s * 0.045, 0.593, 0.148], rotation: [0, 0, s * 22], bone: head, name: "brow" + L });
    // ear tufts
    const d = V(s * 0.35, 1, -0.15).normalize();
    const base = V(s * 0.06, 0.62, 0.03);
    b.part(cone(0.024, 0.12, 5, 1, 0.5), tuftPaint, { at: base.clone().addScaledVector(d, 0.06), dir: d, bone: head, name: "tuft" + L });
    b.part(cone(0.012, 0.09, 4, 1, 0.4), "#c9a470", { at: base.clone().addScaledVector(d, 0.05).add(V(0, 0, 0.012)), dir: d, bone: head });

    // ---------- wings ----------
    const sh = [s * 0.14, 0.44, -0.01], el = [s * 0.17, 0.31, -0.05], wr = [s * 0.18, 0.15, -0.12];
    b.chain("wing" + L, [sh, el, wr], {
      parent: "spine1", role: "wing", names: ["shoulder" + L, "elbow" + L, "wrist" + L],
    });
    b.part(ell(0.03, 0.2, 0.085, 12), wingPaint, {
      at: [s * 0.172, 0.31, -0.055], dir: [s * 0.04, -0.34, -0.1], bone: "shoulder" + L, name: "wing" + L,
    });
    for (let k = 0; k < 5; k++) {
      const dd = V(s * (0.02 + (k - 2) * 0.035), -0.9, -0.3 - k * 0.04).normalize();
      const bs = V(s * 0.18, 0.22, -0.1 - k * 0.012);
      b.part(ell(0.02, 0.1, 0.006, 8), k % 2 ? "#3b2d20" : "#4d3a28", {
        at: bs.clone().addScaledVector(dd, 0.09), dir: dd, bone: "elbow" + L, name: "primary" + L,
      });
    }

    // ---------- legs ----------
    const lx = s * 0.06;
    b.chain("leg" + L, [[lx, 0.25, 0.03], [lx, 0.17, 0.06], [lx, 0.12, 0.07]], {
      parent: hips, role: "leg", names: ["hip" + L, "knee" + L, "ankle" + L],
    });
    b.part(ell(0.055, 0.1, 0.06, 10), legPaint, { at: [s * 0.07, 0.19, 0.04], bone: "hip" + L, name: "thigh" + L });
    b.part(ell(0.036, 0.055, 0.036, 8), legPaint, { at: [lx, 0.14, 0.066], bone: "knee" + L, name: "shank" + L });

    // toes
    const front = [-0.022, 0.0, 0.022];
    front.forEach((fx, i) => {
      const x0 = lx;
      const ch = b.chain(`toe${i + 1}${L}`, [[x0, 0.117, 0.07], [x0 + s * fx * 0.8, 0.105, 0.1], [x0 + s * fx * 1.6, 0.072, 0.135]], {
        parent: "ankle" + L, role: "digit",
      });
      b.sweep(ch, [0.014, 0.011], { color: "#2e2620", sides: 6, name: `toe${i + 1}${L}` });
      b.spike([x0 + s * fx * 1.6, 0.072, 0.135], [0, -0.7, 0.45], 0.04, 0.01, {
        color: "#0e0e0e", bone: ch.joints[ch.joints.length - 1], sides: 5, name: "talon" + L,
      });
    });
    const chb = b.chain("toe4" + L, [[lx, 0.117, 0.07], [lx, 0.105, 0.035], [lx, 0.072, 0.005]], { parent: "ankle" + L, role: "digit" });
    b.sweep(chb, [0.014, 0.011], { color: "#2e2620", sides: 6 });
    b.spike([lx, 0.072, 0.005], [0, -0.7, -0.45], 0.04, 0.01, { color: "#0e0e0e", bone: chb.joints[chb.joints.length - 1], sides: 5, name: "talonBack" + L });
  }

  // ---------- tail fan ----------
  for (let i = -2; i <= 2; i++) {
    const dd = V(i * 0.1, -0.7, -0.7).normalize();
    const bs = V(i * 0.012, 0.2, -0.1);
    b.part(ell(0.032, 0.14, 0.008, 8), tailPaint, {
      at: bs.clone().addScaledVector(dd, 0.13 - Math.abs(i) * 0.008), dir: dd, bone: "tail1", name: "tailFeather",
    });
  }

  return b.root;
}
