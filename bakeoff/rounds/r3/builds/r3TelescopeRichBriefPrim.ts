import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Explorer's Brass Telescope",
  description:
    "Polished brass refractor with leather wraps, engraved rings, finder scope, rubber-cupped eyepiece and focus knobs, on a mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const head = b.joint("head", { at: [0, 1.28, 0], parent: base });
  const tube = b.joint("tube", { at: [0, 1.42, 0], parent: head });

  const BRASS = "#c9972e", DARK = "#8a6420", LEATHER = "#5a2f1a", WOOD = "#5b2412",
    WOODL = "#7a3418", RUBBER = "#1a1a1a", GLASS = "#8fc4e0", PAPER = "#e8dcb8", RED = "#9b1c1c";

  const piv = new THREE.Vector3(0, 1.42, 0);
  const el = (22 * Math.PI) / 180;
  const d = new THREE.Vector3(0, Math.sin(el), Math.cos(el));
  const u = new THREE.Vector3(0, Math.cos(el), -Math.sin(el));
  const along = (t: number, up = 0, side = 0) =>
    piv.clone().addScaledVector(d, t).addScaledVector(u, up).add(new THREE.Vector3(side, 0, 0));

  const cyl = (r: number, len: number, color: string, at: THREE.Vector3, dir: THREE.Vector3, bone: any, seg = 14, r2?: number) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, len, seg), color, {
      at: [at.x, at.y, at.z],
      dir: [dir.x, dir.y, dir.z],
      bone,
    });

  // main tube
  cyl(0.045, 1.0, BRASS, along(0.1), d, tube, 20);
  // objective bell / dew shield
  cyl(0.062, 0.26, BRASS, along(0.67), d, tube, 20, 0.066 * 0.9);
  cyl(0.068, 0.02, DARK, along(0.8), d, tube, 20);
  cyl(0.056, 0.012, GLASS, along(0.805), d, tube, 20);
  // leather wraps
  cyl(0.0485, 0.22, LEATHER, along(-0.17), d, tube, 16);
  cyl(0.0485, 0.26, LEATHER, along(0.3), d, tube, 16);
  // engraved rings
  for (const t of [-0.3, -0.05, 0.1, 0.48, 0.56]) cyl(0.051, 0.012, DARK, along(t), d, tube, 16);
  for (const t of [-0.28, -0.06, 0.49]) cyl(0.0505, 0.006, "#e6c260", along(t + 0.02), d, tube, 16);
  // rear draw tube + eyepiece + rubber cup
  cyl(0.034, 0.12, DARK, along(-0.46), d, tube, 14);
  cyl(0.026, 0.2, BRASS, along(-0.58), d, tube, 14);
  cyl(0.036, 0.05, RUBBER, along(-0.7), d, tube, 14);
  cyl(0.02, 0.01, GLASS, along(-0.727), d, tube, 12);

  // focus knobs
  for (const s of [-1, 1]) {
    const c = along(-0.38, 0, 0);
    const x = new THREE.Vector3(1, 0, 0);
    cyl(0.008, 0.08, DARK, c.clone().add(new THREE.Vector3(s * 0.06, 0, 0)), x, tube, 8);
    cyl(0.026, 0.026, BRASS, c.clone().add(new THREE.Vector3(s * 0.1, 0, 0)), x, tube, 12);
    cyl(0.028, 0.008, LEATHER, c.clone().add(new THREE.Vector3(s * 0.1, 0, 0)), x, tube, 12);
  }
  // smaller fine focus knob on top
  cyl(0.018, 0.02, BRASS, along(-0.22, 0.06), u, tube, 10);

  // finder scope
  const fu = 0.115;
  cyl(0.016, 0.42, BRASS, along(0.12, fu), d, tube, 12);
  cyl(0.024, 0.07, BRASS, along(0.34, fu), d, tube, 12, 0.02);
  cyl(0.02, 0.01, GLASS, along(0.376, fu), d, tube, 12);
  cyl(0.011, 0.06, DARK, along(-0.14, fu), d, tube, 8);
  cyl(0.017, 0.025, RUBBER, along(-0.19, fu), d, tube, 10);
  for (const t of [0.0, 0.26]) {
    cyl(0.02, 0.014, DARK, along(t, fu), d, tube, 12);
    cyl(0.008, fu - 0.03, BRASS, along(t, fu / 2 - 0.005), u, tube, 8);
    cyl(0.014, 0.014, BRASS, along(t, 0.045), d, tube, 10);
    cyl(0.006, 0.05, DARK, along(t, fu + 0.03), u, tube, 6);
  }

  // trunnion + yoke
  cyl(0.014, 0.24, DARK, piv.clone(), new THREE.Vector3(1, 0, 0), tube, 10);
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.025, 0.2, 0.05), BRASS, { at: [s * 0.095, 1.35, 0], bone: head });
    cyl(0.03, 0.02, DARK, new THREE.Vector3(s * 0.115, 1.42, 0), new THREE.Vector3(1, 0, 0), head, 12);
  }
  cyl(0.02, 0.02, BRASS, new THREE.Vector3(0.14, 1.42, 0), new THREE.Vector3(1, 0, 0), tube, 8);
  // head block
  cyl(0.11, 0.05, BRASS, new THREE.Vector3(0, 1.255, 0), new THREE.Vector3(0, 1, 0), head, 6);
  cyl(0.085, 0.07, WOOD, new THREE.Vector3(0, 1.2, 0), new THREE.Vector3(0, 1, 0), head, 6);
  cyl(0.115, 0.012, DARK, new THREE.Vector3(0, 1.285, 0), new THREE.Vector3(0, 1, 0), head, 6);
  // pan handle
  cyl(0.008, 0.28, DARK, new THREE.Vector3(-0.08, 1.2, -0.12), new THREE.Vector3(-0.5, 0.1, -1).normalize(), head, 6);
  b.part(new THREE.SphereGeometry(0.02, 8, 6), LEATHER, { at: [-0.14, 1.205, -0.26], bone: head });

  // tripod
  const top = new THREE.Vector3(0, 1.17, 0);
  const R = 0.58;
  const feet: THREE.Vector3[] = [];
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
    const foot = new THREE.Vector3(Math.cos(a) * R, 0.02, Math.sin(a) * R);
    feet.push(foot);
    const v = foot.clone().sub(top);
    const len = v.length();
    const dir = v.clone().normalize();
    const mid = top.clone().addScaledVector(dir, len / 2);
    cyl(0.018, len, WOOD, mid, dir, base, 8, 0.027);
    cyl(0.03, 0.12, BRASS, top.clone().addScaledVector(dir, 0.07), dir, base, 8);
    cyl(0.03, 0.01, DARK, top.clone().addScaledVector(dir, 0.14), dir, base, 8);
    // lower brass sleeve + ferrule
    cyl(0.022, 0.1, BRASS, foot.clone().addScaledVector(dir, -0.2), dir, base, 8);
    cyl(0.02, 0.07, DARK, foot.clone().addScaledVector(dir, -0.03), dir, base, 8, 0.012);
    // hinge lug
    b.part(new THREE.BoxGeometry(0.03, 0.05, 0.03), BRASS, {
      at: [Math.cos(a) * 0.045, 1.2, Math.sin(a) * 0.045], bone: base,
    });
  }

  // tray (hexagonal) hung by spokes
  const trayY = 0.64;
  const trayR = 0.2;
  cyl(trayR, 0.014, WOODL, new THREE.Vector3(0, trayY, 0), new THREE.Vector3(0, 1, 0), base, 6);
  cyl(trayR + 0.01, 0.006, BRASS, new THREE.Vector3(0, trayY - 0.008, 0), new THREE.Vector3(0, 1, 0), base, 6);
  cyl(0.03, 0.02, BRASS, new THREE.Vector3(0, trayY + 0.012, 0), new THREE.Vector3(0, 1, 0), base, 8);
  // tray raised lip pegs
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), BRASS, {
      at: [Math.cos(a) * trayR * 0.95, trayY + 0.02, Math.sin(a) * trayR * 0.95], bone: base,
    });
  }
  // rolled star chart
  const cx = new THREE.Vector3(0.9, 0, 0.45).normalize();
  const cpos = new THREE.Vector3(0.0, trayY + 0.048, 0.07);
  cyl(0.032, 0.26, PAPER, cpos, cx, base, 12);
  cyl(0.034, 0.012, "#c8b88a", cpos.clone().addScaledVector(cx, 0.13), cx, base, 12);
  cyl(0.034, 0.012, "#c8b88a", cpos.clone().addScaledVector(cx, -0.13), cx, base, 12);
  cyl(0.0345, 0.016, RED, cpos.clone().addScaledVector(cx, 0.05), cx, base, 12);
  cyl(0.0345, 0.016, RED, cpos.clone().addScaledVector(cx, -0.05), cx, base, 12);
  cyl(0.012, 0.004, "#2a3f7a", cpos.clone().addScaledVector(cx, 0.139), cx, base, 8);

  // feet pads
  for (const f of feet) cyl(0.026, 0.02, RUBBER, new THREE.Vector3(f.x, 0.01, f.z), new THREE.Vector3(0, 1, 0), base, 8);

  return b.root;
}
