import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Stag Beetle",
  description: "Lucanus-style stag beetle with large antler-like mandibles, chestnut elytra and six jointed legs, rigged for animation.",
};

export default function build() {
  const b = createBuilder({ name: "stag_beetle" });

  const DARK = "#241711";
  const SHELL = "#6e2e14";
  const SHELL2 = "#8a4120";
  const LEG = "#1b120d";
  const JAW = "#3a1c10";
  const EYE = "#0a0a0a";

  const body = b.joint("body", { at: [0, 0.024, 0] });
  const thorax = b.joint("thorax", { at: [0, 0.026, 0.018], parent: body });
  const head = b.joint("head", { at: [0, 0.026, 0.045], parent: thorax });

  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, sides = 6) => {
    const va = new THREE.Vector3(...a), vc = new THREE.Vector3(...c);
    const len = va.distanceTo(vc);
    const m = va.clone().add(vc).multiplyScalar(0.5);
    const d = vc.clone().sub(va);
    // cylinder: top radius r1 at +Y (towards c), bottom r0 at a
    b.part(new THREE.CylinderGeometry(r1, r0, len, sides), color, { at: [m.x, m.y, m.z], dir: [d.x, d.y, d.z], bone });
  };
  const ball = (r: number, color: string, at: number[], scale: number[], bone: any, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, 6), color, { at, scale, bone });

  // Prothorax (pronotum) and body
  ball(0.016, DARK, [0, 0.027, 0.02], [1.1, 0.6, 0.85], thorax);
  ball(0.012, SHELL, [0, 0.03, 0.018], [1.0, 0.35, 0.7], thorax); // pronotum highlight
  // Abdomen under the elytra
  ball(0.017, DARK, [0, 0.024, -0.022], [0.95, 0.6, 1.9], body);

  // Head: broad block with brow ridges
  b.part(new THREE.BoxGeometry(0.03, 0.015, 0.02), DARK, { at: [0, 0.026, 0.052], bone: head });
  b.part(new THREE.BoxGeometry(0.032, 0.004, 0.008), "#4a2615", { at: [0, 0.034, 0.056], bone: head });
  for (const s of [1, -1]) {
    ball(0.004, EYE, [s * 0.015, 0.03, 0.055], [0.8, 1, 1.2], head, 6);
  }

  // Elytra (wing cases) with seam
  const elytraL = b.joint("elytraL", { at: [0.003, 0.036, 0.006], parent: body });
  const elytraR = b.joint("elytraR", { at: [-0.003, 0.036, 0.006], parent: body });
  for (const [s, j] of [[1, elytraL], [-1, elytraR]] as [number, any][]) {
    ball(0.0175, SHELL, [s * 0.0105, 0.031, -0.024], [0.62, 0.55, 2.0], j, 10);
    ball(0.01, SHELL2, [s * 0.011, 0.037, -0.022], [0.4, 0.3, 1.6], j, 8);
    b.part(new THREE.BoxGeometry(0.0015, 0.0015, 0.05), DARK, { at: [s * 0.0008, 0.0385, -0.026], bone: j });
  }

  // Mandibles: antler-like curved jaws
  for (const [s, name] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const jaw = b.joint("jaw" + name, { at: [s * 0.009, 0.027, 0.063], parent: head });
    const p0 = [s * 0.009, 0.027, 0.063];
    const p1 = [s * 0.019, 0.028, 0.085];
    const p2 = [s * 0.018, 0.030, 0.106];
    const p3 = [s * 0.009, 0.032, 0.125];
    seg(p0, p1, 0.006, 0.0045, JAW, jaw, 6);
    seg(p1, p2, 0.0045, 0.0036, JAW, jaw, 6);
    seg(p2, p3, 0.0036, 0.0008, JAW, jaw, 6);
    ball(0.005, JAW, p1, [1, 1, 1], jaw, 6);
    ball(0.004, JAW, p2, [1, 1, 1], jaw, 6);
    // inner teeth
    seg([s * 0.017, 0.028, 0.088], [s * 0.010, 0.029, 0.094], 0.003, 0.0006, "#4d2816", jaw, 5);
    seg([s * 0.0175, 0.030, 0.100], [s * 0.011, 0.031, 0.108], 0.0025, 0.0006, "#4d2816", jaw, 5);
    // outer base tooth
    seg([s * 0.012, 0.03, 0.07], [s * 0.021, 0.032, 0.076], 0.003, 0.0007, "#4d2816", jaw, 5);
  }

  // Antennae with lamellate clubs
  for (const [s, name] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    const a1 = b.joint("antenna" + name + "1", { at: [s * 0.012, 0.03, 0.062], parent: head });
    const a2 = b.joint("antenna" + name + "2", { at: [s * 0.022, 0.036, 0.074], parent: a1 });
    seg([s * 0.012, 0.03, 0.062], [s * 0.022, 0.036, 0.074], 0.0012, 0.001, LEG, a1, 5);
    seg([s * 0.022, 0.036, 0.074], [s * 0.03, 0.04, 0.083], 0.001, 0.001, LEG, a2, 5);
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.0055, 0.0015, 0.0045), "#5a3018", {
        at: [s * (0.03 + i * 0.0025), 0.0405 + i * 0.0015, 0.083 + i * 0.0025], bone: a2, scale: [1, 1, 1],
      });
    }
  }

  // Legs
  const zs = [0.026, 0.002, -0.022];
  const splay = [0.012, 0.0, -0.014];
  const names = ["front", "mid", "hind"];
  for (const [s, side] of [[1, "L"], [-1, "R"]] as [number, string][]) {
    zs.forEach((z, i) => {
      const n = names[i] + side;
      const hp = [s * 0.014, 0.02, z];
      const kn = [s * 0.04, 0.03, z + splay[i] * 0.8 + (i === 0 ? 0.008 : 0)];
      const ft = [s * 0.056, 0.0, z + splay[i] * 1.5 + (i === 0 ? 0.014 : 0)];
      const root = i === 0 ? thorax : body;
      const hip = b.joint("hip_" + n, { at: hp, parent: root });
      const knee = b.joint("knee_" + n, { at: kn, parent: hip });
      const ankle = b.joint("ankle_" + n, { at: ft, parent: knee });
      ball(0.006, LEG, hp, [1, 1, 1], hip, 6);
      seg(hp, kn, 0.0042, 0.0035, LEG, hip, 6);
      ball(0.0038, LEG, kn, [1, 1, 1], knee, 6);
      seg(kn, ft, 0.0034, 0.002, LEG, knee, 6);
      // tibial spines
      const mid = [(kn[0] + ft[0]) / 2, (kn[1] + ft[1]) / 2, (kn[2] + ft[2]) / 2];
      seg(mid, [mid[0] + s * 0.004, mid[1] + 0.002, mid[2] + 0.004], 0.0012, 0.0003, "#3a2418", knee, 4);
      // foot / tarsus
      b.part(new THREE.BoxGeometry(0.006, 0.0025, 0.01), LEG, { at: [ft[0] + s * 0.002, 0.0013, ft[2] + 0.002], bone: ankle });
      // claw
      seg([ft[0] + s * 0.003, 0.002, ft[2] + 0.006], [ft[0] + s * 0.004, 0.0005, ft[2] + 0.012], 0.0009, 0.0002, "#0e0a07", ankle, 4);
    });
  }

  return b.root;
}
