```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Refractor Telescope",
  description:
    "A brass-and-cream refracting telescope with dew shield, finder scope and focuser, on a wooden tripod with an accessory tray. Tube raised to a viewing angle.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "telescope" });

  const CREAM = "#efe6d0";
  const BRASS = "#c89b3c";
  const NAVY = "#1d2b4a";
  const BLACK = "#15151a";
  const WOOD = "#8a5a33";
  const DWOOD = "#6b4226";
  const LENS = "#3b5f9a";

  b.joint("root", { at: [0, 0, 0] });
  b.joint("az", { parent: "root", at: [0, 1.1, 0], dir: [0, 1, 0] });
  b.joint("alt", { parent: "az", at: [0, 1.52, 0], dir: [0, 0, 1] });

  // ---------- Tripod ----------
  const head: [number, number, number] = [0, 1.08, 0];
  const legAt = (k: number, y: number): [number, number, number] => {
    const a = (k * 2 * Math.PI) / 3;
    const f = (1.08 - y) / 1.08;
    const r = 0.06 + (0.62 - 0.06) * f;
    return [Math.sin(a) * r, y, Math.cos(a) * r];
  };
  for (let k = 0; k < 3; k++) {
    const top = legAt(k, 1.06);
    const mid = legAt(k, 0.5);
    const foot = legAt(k, 0.06);
    b.rod(top, mid, [0.026, 0.021], { color: WOOD, bone: "root", sides: 6, name: `legUpper${k}` });
    b.rod(mid, foot, [0.019, 0.015], { color: DWOOD, bone: "root", sides: 6, name: `legLower${k}` });
    b.capsule(legAt(k, 0.54), legAt(k, 0.46), 0.027, { color: BRASS, bone: "root", sides: 8 });
    b.capsule(foot, legAt(k, -0.005), 0.018, { color: BLACK, bone: "root", sides: 6 });
    // spider arm to the tray
    b.rod([0, 0.55, 0], legAt(k, 0.55), 0.009, { color: BRASS, bone: "root", sides: 5 });
    // leg top bracket
    b.capsule(legAt(k, 1.08), legAt(k, 1.0), 0.03, { color: BRASS, bone: "root", sides: 6 });
  }
  // accessory tray with eyepiece cases
  b.lathe([[0, 0], [0.11, 0], [0.12, 0.012], [0.11, 0.024], [0, 0.024]], {
    color: DWOOD, at: [0, 0.54, 0], bone: "root", segments: 12,
  });
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.4;
    const px = Math.sin(a) * 0.065;
    const pz = Math.cos(a) * 0.065;
    b.lathe([[0, 0], [0.016, 0], [0.016, 0.07], [0.012, 0.075], [0, 0.075]], {
      color: i === 1 ? NAVY : BLACK, at: [px, 0.564, pz], bone: "root", segments: 8,
    });
    b.lathe([[0, 0], [0.017, 0], [0.017, 0.012], [0, 0.012]], {
      color: BRASS, at: [px, 0.62, pz], bone: "root", segments: 8,
    });
  }

  // ---------- Mount ----------
  b.lathe([[0, 0], [0.11, 0], [0.12, 0.02], [0.09, 0.05], [0.055, 0.07], [0.05, 0.1], [0, 0.1]], {
    color: BRASS, at: head, bone: "root", segments: 12, name: "mountHead",
  });
  b.lathe([[0, 0], [0.055, 0], [0.04, 0.12], [0.038, 0.3], [0, 0.3]], {
    color: NAVY, at: [0, 1.13, 0], bone: "az", segments: 10, name: "post",
  });
  b.part(new THREE.BoxGeometry(0.19, 0.04, 0.12), NAVY, { at: [0, 1.43, 0], bone: "az", name: "crossbar" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.2, 0.2), NAVY, { at: [s * 0.088, 1.52, 0], bone: "az", name: "cheek" });
    b.lathe([[0, 0], [0.032, 0], [0.038, 0.015], [0.032, 0.03], [0, 0.03]], {
      color: BRASS, at: [s * 0.098, 1.52, 0], axis: [s, 0, 0], bone: "az", segments: 10, name: "pivotKnob",
    });
    b.lathe([[0, 0], [0.05, 0], [0.05, 0.004], [0, 0.004]], {
      color: BRASS, at: [s * 0.098, 1.52, 0], axis: [s, 0, 0], bone: "az", segments: 12,
    });
  }

  // ---------- Optical tube ----------
  const ringAt = (z: number, rIn: number, rOut: number, w: number, color: string, y = 1.52) =>
    b.lathe([[rIn, -w], [rOut, -w], [rOut, w], [rIn, w]], {
      color, at: [0, y, z], axis: [0, 0, 1], bone: "alt", segments: 14,
    });

  b.rod([0, 1.52, -0.3], [0, 1.52, 0.7], 0.055, { color: CREAM, caps: "flat", bone: "alt", sides: 14, name: "tube" });
  // navy mid-band + brass rings
  ringAt(0.35, 0.05, 0.059, 0.09, NAVY);
  ringAt(0.2, 0.05, 0.061, 0.012, BRASS);
  ringAt(0.5, 0.05, 0.061, 0.012, BRASS);
  ringAt(-0.28, 0.05, 0.063, 0.02, BRASS);
  ringAt(0.695, 0.05, 0.063, 0.012, BRASS);
  // cradle saddle clamp on the pivot
  b.part(new THREE.BoxGeometry(0.15, 0.03, 0.09), BRASS, { at: [0, 1.52, 0], bone: "alt", name: "saddle" });
  b.rod([-0.09, 1.52, 0], [0.09, 1.52, 0], 0.022, { color: BRASS, caps: "flat", bone: "alt", sides: 8, name: "axle" });

  // dew shield (hollow) and lens
  b.lathe([[0.066, 0], [0.074, 0], [0.074, 0.3], [0.066, 0.3]], {
    color: NAVY, at: [0, 1.52, 0.66], axis: [0, 0, 1], bone: "alt", segments: 16, name: "dewShield",
  });
  b.lathe([[0.072, 0.29], [0.078, 0.29], [0.078, 0.3], [0.072, 0.3]], {
    color: BRASS, at: [0, 1.52, 0.66], axis: [0, 0, 1], bone: "alt", segments: 16,
  });
  b.rod([0, 1.52, 0.69], [0, 1.52, 0.71], 0.06, { color: LENS, caps: "flat", bone: "alt", sides: 16, name: "objective" });

  // rear: focuser, knobs, eyepiece
  b.rod([0, 1.52, -0.3], [0, 1.52, -0.4], 0.034, { color: BRASS, caps: "flat", bone: "alt", sides: 10, name: "focuser" });
  b.rod([0, 1.52, -0.4], [0, 1.52, -0.44], 0.024, { color: CREAM, caps: "flat", bone: "alt", sides: 10 });
  for (const s of [1, -1]) {
    b.lathe([[0, 0], [0.022, 0], [0.026, 0.008], [0.022, 0.016], [0, 0.016]], {
      color: BLACK, at: [s * 0.036, 1.52, -0.35], axis: [s, 0, 0], bone: "alt", segments: 8, name: "focusKnob",
    });
  }
  b.rod([0, 1.52, -0.44], [0, 1.52, -0.54], 0.016, { color: BLACK, caps: "flat", bone: "alt", sides: 10, name: "eyepiece" });
  b.rod([0, 1.52, -0.54], [0, 1.52, -0.57], 0.022, { color: NAVY, caps: "flat", bone: "alt", sides: 10, name: "eyecup" });

  // finder scope
  const fy = 1.62;
  b.rod([0, fy, -0.05], [0, fy, 0.24], 0.018, { color: BLACK, caps: "flat", bone: "alt", sides: 10, name: "finder" });
  b.rod([0, fy, 0.24], [0, fy, 0.28], 0.024, { color: BRASS, caps: "flat", bone: "alt", sides: 10 });
  b.rod([0, fy, 0.275], [0, fy, 0.283], 0.019, { color: LENS, caps: "flat", bone: "alt", sides: 10 });
  b.rod([0, fy, -0.05], [0, fy, -0.09], 0.012, { color: BRASS, caps: "flat", bone: "alt", sides: 8 });
  for (const z of [0.0, 0.17]) {
    b.rod([0, 1.56, z], [0, fy, z], 0.009, { color: BRASS, caps: "flat", bone: "alt", sides: 6 });
    b.lathe([[0.016, -0.007], [0.026, -0.007], [0.026, 0.007], [0.016, 0.007]], {
      color: BRASS, at: [0, fy, z], axis: [0, 0, 1], bone: "alt", segments: 10,
    });
  }

  // rest pose: tube raised toward the sky
  b.pose("alt", { axis: [1, 0, 0], deg: -25 });

  return b.root;
}
```