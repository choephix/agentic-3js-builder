import * as THREE from "three";
import { createBuilder, frame, line } from "../../../../src/index";

export const meta = {
  name: "brass-explorer-telescope",
  description:
    "A polished brass explorer's telescope with leather wraps, engraved rings, a finder scope, focus knobs and a mahogany tripod with a star-chart tray.",
};

const BRASS = "#d6a94e";
const BRASS_DARK = "#9c7a33";
const LEATHER = "#7a4a2a";
const MAHOG = "#5b2a1a";
const RUBBER = "#1d1d1f";
const GLASS = "#2f5f70";
const PAPER = "#e9dcb5";
const RIBBON = "#8b2a2a";

export default function build() {
  const b = createBuilder({ name: "brass-explorer-telescope" });
  b.joint("base", { at: [0, 0, 0] });

  // Tube axis: pivot P, tilted up and forward. D is the tube direction,
  // U the perpendicular "top" of the tube, R the model's left (+X).
  const P = new THREE.Vector3(0, 1.0, 0);
  const D = new THREE.Vector3(0, 0.57, 0.82).normalize();
  const U = new THREE.Vector3(0, 0.82, -0.57).normalize();
  const R = new THREE.Vector3(1, 0, 0);
  const at = (t: number, side = 0, up = 0) =>
    P.clone().addScaledVector(D, t).addScaledVector(R, side).addScaledVector(U, up);

  // A cylinder lying along the tube between t0 and t1.
  const seg = (t0: number, t1: number, r: number, color: string, up = 0) =>
    b.part(new THREE.CylinderGeometry(r, r, t1 - t0, 14), color, {
      at: at((t0 + t1) / 2, 0, up),
      aim: D,
    });

  // A flat engraved band around the tube.
  const band = (t: number, r: number, color: string) =>
    b.part(new THREE.TorusGeometry(r, 0.004, 6, 20), color, {
      at: at(t),
      aim: D,
      axis: "z",
    });

  // ── Main brass tube with leather wraps ──────────────────────────
  seg(-0.08, 0.72, 0.045, BRASS);
  seg(0.1, 0.24, 0.049, LEATHER);
  seg(0.4, 0.52, 0.049, LEATHER);
  for (const t of [0.02, 0.3, 0.56, 0.62]) band(t, 0.046, BRASS_DARK);

  // Engraved scale marks along the top of the tube.
  for (let t = 0.6; t <= 0.7; t += 0.02) {
    b.part(new THREE.BoxGeometry(0.008, 0.012, 0.004), BRASS_DARK, {
      at: at(t, 0, 0.047),
      aim: D,
    });
  }

  // Objective bell, dew cap and glass.
  seg(0.66, 0.74, 0.056, BRASS);
  seg(0.74, 0.8, 0.05, BRASS);
  seg(0.79, 0.8, 0.046, GLASS);
  band(0.8, 0.05, BRASS_DARK);

  // Eyepiece with rubber eyecup at the back.
  seg(-0.2, -0.08, 0.03, BRASS);
  seg(-0.2, -0.19, 0.033, BRASS_DARK);
  seg(-0.26, -0.2, 0.036, RUBBER);
  seg(-0.28, -0.26, 0.042, RUBBER);

  // ── Finder scope on top ─────────────────────────────────────────
  seg(0.12, 0.5, 0.022, BRASS_DARK, 0.1);
  seg(0.5, 0.52, 0.026, RUBBER, 0.1);
  for (const t of [0.2, 0.4]) {
    b.part(new THREE.BoxGeometry(0.016, 0.03, 0.016), BRASS_DARK, {
      at: at(t, 0, 0.07),
      aim: U,
    });
  }

  // ── Focus knobs on both sides ───────────────────────────────────
  for (const s of [1, -1]) {
    b.rod(at(0.2, s * 0.04), at(0.2, s * 0.08), 0.008, { color: BRASS_DARK });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.016, 16), BRASS, {
      at: at(0.2, s * 0.09),
      aim: R,
    });
    b.ring(frame(at(0.2, s * 0.09), R), { count: 10, radius: 0.036 }, (k) =>
      b.part(new THREE.BoxGeometry(0.012, 0.006, 0.006), RUBBER, {
        at: k,
        aim: k.outward,
      }),
    );
    // Small fine-focus knob further along the tube.
    b.rod(at(0.45, s * 0.04), at(0.45, s * 0.065), 0.006, { color: BRASS_DARK });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 12), BRASS, {
      at: at(0.45, s * 0.07),
      aim: R,
    });
  }

  // ── Cradle: yoke, axle and head plate ───────────────────────────
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 12), BRASS_DARK, {
    at: P,
    aim: R,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.025, 0.11, 0.07), MAHOG, {
      at: [s * 0.105, 0.955, 0],
    });
  }
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16), MAHOG, {
    at: [0, 0.9, 0],
  });
  b.part(new THREE.TorusGeometry(0.12, 0.006, 6, 24), BRASS, {
    at: [0, 0.9, 0],
    rotation: [90, 0, 0],
  });

  // ── Tripod ──────────────────────────────────────────────────────
  const hub = new THREE.Vector3(0, 0.88, 0);
  const feet = [0, 120, 240].map((deg) => {
    const a = THREE.MathUtils.degToRad(deg);
    return new THREE.Vector3(0.42 * Math.sin(a), 0.005, 0.42 * Math.cos(a));
  });
  for (const f of feet) {
    b.rod(hub, f, 0.02, { color: MAHOG });
    const legDir = f.clone().sub(hub).normalize();
    // Brass collar partway down each leg.
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.035, 10), BRASS, {
      at: hub.clone().lerp(f, 0.35),
      aim: legDir,
    });
    // Brass ferrule at the foot.
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 10), BRASS_DARK, {
      at: [f.x, 0.01, f.z],
    });
  }

  // ── Star-chart tray hung between the back legs ──────────────────
  const trayY = 0.36;
  const trayZ = -0.2;
  b.part(new THREE.BoxGeometry(0.2, 0.012, 0.14), MAHOG, { at: [0, trayY, trayZ] });
  b.part(new THREE.BoxGeometry(0.2, 0.02, 0.008), BRASS, { at: [0, trayY + 0.012, trayZ + 0.066] });
  b.part(new THREE.BoxGeometry(0.2, 0.02, 0.008), BRASS, { at: [0, trayY + 0.012, trayZ - 0.066] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.008, 0.02, 0.14), BRASS, { at: [s * 0.096, trayY + 0.012, trayZ] });
  }
  // Rolled star chart with a ribbon tie.
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.17, 12), PAPER, {
    at: [0, trayY + 0.036, trayZ],
    aim: R,
  });
  b.part(new THREE.CylinderGeometry(0.0245, 0.0245, 0.012, 12), RIBBON, {
    at: [0.03, trayY + 0.036, trayZ],
    aim: R,
  });
  // Brass strut from the hub down to the tray.
  b.rod(new THREE.Vector3(0, 0.86, -0.02), new THREE.Vector3(0, trayY + 0.012, trayZ + 0.02), 0.008, {
    color: BRASS_DARK,
  });

  return b.root;
}
