import * as THREE from "three";
import { createBuilder, bezier, catmull, rng, glow } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { metal, paint, mottle, noise, smoothstep, mix } from "../../../../src/index";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description: "A tall scythe with a dragon-spine haft, a curved dragon-rib blade and a trapped glowing soul.",
};

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const BONE = mottle("#e9dfc6", "#b8a98a", { size: 0.06, seed: 3 });
  const BONE_D = "#8d7d62";
  const GOLD = metal("gilt");
  const DARK = metal("iron");
  const SOUL = "#5dffd8";
  const SOUL_D = "#1fb89a";
  const r = rng(5);

  // haft: slight S curve, tilted slightly so the scythe is a standing prop
  const H = 2.0;
  const haftPath = catmull([
    [0, 0.0, 0], [0.015, 0.5, 0.01], [-0.015, 1.0, -0.005], [0, 1.5, 0], [0, H, 0],
  ]);
  b.sweep(haftPath, 0.022, { color: DARK, sides: 8 });
  // vertebrae along the haft
  b.along(haftPath, 12, (at) => {
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.055, 6), BONE, { at: at.at, dir: [0, 1, 0] });
    b.part(new THREE.CylinderGeometry(0.012, 0.004, 0.09, 5), BONE, {
      at: [at.at.x + 0.03, at.at.y, at.at.z], dir: [1, 0.2, 0],
    });
    b.part(new THREE.CylinderGeometry(0.012, 0.004, 0.09, 5), BONE, {
      at: [at.at.x - 0.03, at.at.y, at.at.z], dir: [-1, 0.2, 0],
    });
  }, { from: 0.1, to: 0.8 });

  // butt: skull-cap spike
  b.part(new THREE.ConeGeometry(0.035, 0.14, 6), GOLD, { at: [0, 0.0, 0], dir: [0, -1, 0] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), GOLD, { at: [0, 0.1, 0] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), GOLD, { at: [0, 0.9, 0] });

  // grip wraps
  for (let i = 0; i < 6; i++)
    b.part(new THREE.TorusGeometry(0.025, 0.006, 4, 8), "#5a1f2e", { at: [0, 0.65 + i * 0.045, 0], dir: [0, 1, 0], axis: "z" });

  // head assembly: dragon skull socket at the top
  const top = H;
  b.part(new THREE.CylinderGeometry(0.05, 0.035, 0.12, 8), GOLD, { at: [0, top - 0.02, 0] });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), BONE, { at: [0, top + 0.08, 0], scale: [1, 0.9, 1.2] });
  // snout
  b.part(new THREE.BoxGeometry(0.05, 0.04, 0.12), BONE, { at: [0, top + 0.06, 0.1] });
  b.part(new THREE.BoxGeometry(0.045, 0.015, 0.11), BONE, { at: [0, top + 0.03, 0.095] });
  for (const s of [1, -1]) {
    b.spike([s * 0.035, top + 0.1, -0.02], [s * 0.4, 0.5, -1], 0.16, 0.014, { color: BONE });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), SOUL, { at: [s * 0.032, top + 0.1, 0.06] });
    glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), SOUL, { at: [s * 0.033, top + 0.1, 0.06] }), 2);
  }

  // blade: curved dragon rib sweeping to +Z (forward), hooked down
  const base: [number, number, number] = [0, top + 0.1, -0.02];
  const bladePath = bezier(base, [0, top + 0.5, 0.55], [0, top + 0.45, 1.25], [0, top - 0.25, 1.55]);
  b.sweep(bladePath, (t) => [0.03 * (1 - t) + 0.006, 0.1 * (1 - t * 0.9) + 0.01], {
    color: BONE, caps: { start: "flat", end: "point" }, section: { ngon: 4 },
  });
  // bladed edge: thin inner steel-bone cutting edge
  const edgePath = bezier(
    [0, top + 0.02, 0.08], [0, top + 0.3, 0.6], [0, top + 0.3, 1.2], [0, top - 0.25, 1.52],
  );
  b.sweep(edgePath, (t) => [0.008, 0.035 * (1 - t) + 0.004], { color: "#fff6dc", caps: "point", section: { ngon: 4 } });
  // serrated teeth along outer spine
  b.along(bladePath, 9, (at) => {
    b.spike(at.at, [0, 1, 0.3], 0.1, 0.02, { color: BONE_D });
  }, { from: 0.08, to: 0.8 });
  // inner small spikes (rib fins)
  b.along(bladePath, 5, (at) => {
    b.spike([at.at.x, at.at.y - 0.06, at.at.z], [0, -0.6, 0.8], 0.12, 0.012, { color: BONE });
  }, { from: 0.25, to: 0.8 });

  // gold bands on blade root
  for (let i = 0; i < 3; i++) {
    const p = bladePath.at(0.04 + i * 0.05);
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.025, 8), GOLD, {
      at: p, dir: bladePath.tangentAt(0.04 + i * 0.05),
    });
  }

  // soul orb cradled in blade curve
  const orbAt: [number, number, number] = [0, top + 0.22, 0.6];
  const orb = b.part(new THREE.IcosahedronGeometry(0.075, 1), SOUL, { at: orbAt });
  glow(orb, 2.2);
  const rune = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="${SOUL_D}" stroke-width="4"/><path d="M32 8 L32 56 M16 24 L48 40 M48 24 L16 40" stroke="#ffffff" stroke-width="4" fill="none"/></svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", { at: [0.0, top + 0.22, 0.6], dir: [1, 0, 0], axis: "z", texture: rune }),
    1.4,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", { at: [0.0, top + 0.22, 0.6], dir: [-1, 0, 0], axis: "z", texture: rune }),
    1.4,
  );
  // cage prongs holding soul
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    b.part(new THREE.TorusGeometry(0.11, 0.008, 4, 10, Math.PI), GOLD, {
      at: orbAt, rotation: [0, 0, a * 57.3 + 20], quat: undefined,
    });
  }
  // wisps rising
  for (let i = 0; i < 6; i++) {
    const a = r() * 6.28;
    const p0: [number, number, number] = [0.0, top + 0.28, 0.6];
    const w = b.sweep(
      bezier(p0, [Math.cos(a) * 0.1, top + 0.45, 0.6 + Math.sin(a) * 0.1], [Math.cos(a) * 0.12, top + 0.6 + i * 0.03, 0.6 + Math.sin(a) * 0.14]),
      [0.012, 0], { color: SOUL, caps: "point", sides: 5 },
    );
    glow(w, 1.6);
  }

  // tassel & charms at the head
  const tas = bezier([0.04, top - 0.05, 0], [0.12, top - 0.3, 0], [0.1, top - 0.55, 0.02]);
  b.sweep(tas, [0.012, 0.004], { color: "#7a1f3a", caps: "point", sides: 5 });
  b.part(new THREE.OctahedronGeometry(0.03), SOUL_D, { at: [0.1, top - 0.58, 0.02] });
  glow(b.part(new THREE.OctahedronGeometry(0.02), SOUL, { at: [0.1, top - 0.58, 0.02] }), 1.5);

  // pedestal-free: ensure floor contact via butt spike at y~-0.01
  return b.root;
}
