import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Refractor Telescope",
  description:
    "A cream-and-navy refractor telescope with brass fittings, a finder scope and a wooden tripod, on an alt-azimuth fork mount.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "telescope" });

  const CREAM = "#efe9da";
  const NAVY = "#1f3a5f";
  const BRASS = "#c8963e";
  const BLACK = "#22252b";
  const WOOD = "#9b6a3c";
  const METAL = "#9aa3ad";
  const RUBBER = "#2e2f33";

  // Skeleton: root -> azimuth (turns the mount) -> altitude (tilts the tube)
  const H = new THREE.Vector3(0, 1.15, 0);
  const P = new THREE.Vector3(0, 1.3, 0);
  const elev = (35 * Math.PI) / 180;
  const d = new THREE.Vector3(0, Math.sin(elev), Math.cos(elev));
  const u = new THREE.Vector3(0, Math.cos(elev), -Math.sin(elev));
  b.joint("root", { at: [0, 0, 0] });
  b.joint("azimuth", { parent: "root", at: [0, 1.22, 0], dir: [0, 1, 0] });
  b.joint("altitude", { parent: "azimuth", at: P, dir: d });

  const pt = (s: number, off = 0) => P.clone().addScaledVector(d, s).addScaledVector(u, off);

  // Cylinder along the tube axis from s0 to s1 (radius rFront at s1, rBack at s0)
  const cyl = (rBack: number, rFront: number, s0: number, s1: number, off: number, color: string, seg = 16, bone = "altitude") =>
    b.part(new THREE.CylinderGeometry(rFront, rBack, s1 - s0, seg), color, {
      at: pt((s0 + s1) / 2, off),
      dir: d,
      bone,
    });
  const band = (R: number, t: number, s: number, off: number, color: string, seg = 20) =>
    b.part(new THREE.TorusGeometry(R, t, 6, seg), color, { at: pt(s, off), dir: d, axis: "z", bone: "altitude" });

  // ---------- Tripod ----------
  const feet: THREE.Vector3[] = [];
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    feet.push(new THREE.Vector3(0.62 * Math.sin(a), 0, 0.62 * Math.cos(a)));
  }
  for (const f of feet) {
    const top = H.clone().add(new THREE.Vector3(f.x * 0.06, -0.02, f.z * 0.06));
    const mid = top.clone().lerp(f, 0.55);
    b.rod(top, mid, [0.028, 0.024], { color: WOOD, sides: 6, caps: "flat", bone: "root" });
    b.rod(mid.clone().lerp(f, -0.02), f, [0.018, 0.015], { color: METAL, sides: 6, caps: "flat", bone: "root" });
    // leg lock collar
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), BLACK, {
      at: mid,
      dir: f.clone().sub(top),
      bone: "root",
    });
    // rubber foot
    b.part(new THREE.SphereGeometry(0.028, 8, 6), RUBBER, { at: [f.x, 0.01, f.z], bone: "root" });
    // knuckle at head
    b.part(new THREE.SphereGeometry(0.035, 8, 6), BRASS, { at: top, bone: "root" });
  }
  // head plate and centre rod
  b.part(new THREE.CylinderGeometry(0.1, 0.09, 0.06, 6), BLACK, { at: [0, 1.14, 0], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 6), METAL, { at: [0, 0.85, 0], bone: "root" });
  // accessory tray
  b.part(new THREE.CylinderGeometry(0.32, 0.32, 0.016, 3), WOOD, { at: [0, 0.54, 0], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), BRASS, { at: [0, 0.565, 0], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), BLACK, { at: [0, 0.53, 0], bone: "root" });

  // ---------- Mount ----------
  b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 10), METAL, { at: [0, 1.2, 0], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 12), NAVY, { at: [0, 1.245, 0], bone: "azimuth" });
  b.part(new THREE.TorusGeometry(0.085, 0.006, 5, 16), BRASS, { at: [0, 1.222, 0], rotation: [90, 0, 0], bone: "azimuth" });
  for (const sx of [-1, 1]) {
    // fork arms
    b.part(new THREE.BoxGeometry(0.03, 0.14, 0.07), NAVY, { at: [sx * 0.105, 1.31, 0], bone: "azimuth" });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), BRASS, {
      at: [sx * 0.125, 1.3, 0],
      rotation: [0, 0, 90],
      bone: "altitude",
    });
    // altitude lock knob
    b.part(new THREE.CylinderGeometry(0.028, 0.022, 0.03, 8), BLACK, {
      at: [sx * 0.15, 1.3, 0],
      rotation: [0, 0, 90],
      bone: "altitude",
    });
    // tube clamp tabs
    b.part(new THREE.BoxGeometry(0.012, 0.05, 0.06), NAVY, { at: [sx * 0.065, 1.3, 0], bone: "altitude" });
  }
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.3, 8), METAL, { at: P, rotation: [0, 0, 90], bone: "altitude" });

  // ---------- Optical tube ----------
  cyl(0.055, 0.055, -0.3, 0.52, 0, CREAM, 16);
  // cradle rings
  band(0.058, 0.012, -0.03, 0, NAVY);
  band(0.058, 0.012, 0.03, 0, NAVY);
  // decorative bands
  band(0.057, 0.006, 0.3, 0, BRASS);
  band(0.057, 0.006, 0.34, 0, NAVY);
  band(0.057, 0.006, -0.22, 0, BRASS);
  // lens cell
  cyl(0.062, 0.062, 0.48, 0.54, 0, BRASS, 16);
  // dew shield (hollow lathe)
  b.lathe(
    [
      [0.062, 0],
      [0.074, 0],
      [0.074, 0.22],
      [0.066, 0.22],
    ],
    { color: NAVY, at: pt(0.52), axis: d, segments: 16, bone: "altitude" },
  );
  band(0.074, 0.005, 0.74, 0, BRASS);
  // objective glass
  cyl(0.052, 0.052, 0.55, 0.558, 0, "#6fa8d6", 16);
  cyl(0.04, 0.04, 0.558, 0.561, 0, "#a58bd6", 12);

  // rear end cap
  cyl(0.06, 0.056, -0.34, -0.3, 0, NAVY, 16);
  // focuser body
  cyl(0.032, 0.036, -0.42, -0.34, 0, BLACK, 10);
  band(0.04, 0.008, -0.36, 0, BRASS, 10);
  // draw tube
  cyl(0.022, 0.022, -0.5, -0.42, 0, METAL, 10);
  // eyepiece
  cyl(0.016, 0.018, -0.56, -0.5, 0, BLACK, 10);
  cyl(0.026, 0.02, -0.6, -0.56, 0, RUBBER, 10);
  // focus knobs
  for (const sx of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 8), BRASS, {
      at: pt(-0.38, 0).add(new THREE.Vector3(sx * 0.052, 0, 0)),
      rotation: [0, 0, 90],
      bone: "altitude",
    });
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), METAL, {
      at: pt(-0.38, 0).add(new THREE.Vector3(sx * 0.04, 0, 0)),
      rotation: [0, 0, 90],
      bone: "altitude",
    });
  }

  // ---------- Finder scope ----------
  const fo = 0.098;
  cyl(0.014, 0.014, -0.12, 0.1, fo, BLACK, 10);
  cyl(0.014, 0.022, 0.1, 0.15, fo, BLACK, 10);
  cyl(0.018, 0.018, 0.15, 0.153, fo, "#6fa8d6", 10);
  cyl(0.011, 0.011, -0.16, -0.12, fo, METAL, 8);
  cyl(0.016, 0.014, -0.19, -0.16, fo, RUBBER, 8);
  for (const s of [-0.07, 0.07]) {
    band(0.02, 0.005, s, fo, BRASS, 10);
    b.rod(pt(s, 0.05), pt(s, fo - 0.018), 0.006, { color: BRASS, sides: 5, caps: "flat", bone: "altitude" });
  }

  // ---------- Dovetail rail under the tube ----------
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.5), NAVY, {
    at: pt(0.1, -0.067),
    dir: d,
    axis: "z",
    bone: "altitude",
  });

  return b.root;
}
