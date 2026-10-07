import * as THREE from "three";
import { createBuilder, grain, mottle } from "../../../../src/index";

export const meta = {
  name: "Brass explorer's telescope",
  description:
    "A polished brass telescope with leather-wrapped sections, engraved rings, a finder scope, a rubber eyepiece cup and focusing knobs, on a mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

export default function brassTelescope() {
  const b = createBuilder({ name: "brass-telescope", detail: 1, paintSize: 1024 });

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Materials: brass with a soft patina, dark mahogany grain, dyed leather, rubber, glass, chart paper.
  const brass = mottle("#d9b25a", "#9c6f2a", { size: 0.12, seed: 3, contrast: 1.2 });
  const brassDark = "#8a6428";
  const leather = mottle("#7a4a2a", "#4e2c17", { size: 0.05, seed: 5 });
  const rubber = "#1d1a18";
  const mahogany = grain("#6b2e1a", "#3a1709", { size: 0.02, axis: "y", seed: 2 });
  const glass = "#8fc4dc";
  const paper = "#efe2bd";

  // Tripod and head.
  const H = V(0, 1.02, 0); // telescope pivot
  const legTop = (i: number) => {
    const th = (i * 2 * Math.PI) / 3;
    return V(0.05 * Math.sin(th), 0.98, 0.05 * Math.cos(th));
  };
  const legFoot = (i: number) => {
    const th = (i * 2 * Math.PI) / 3;
    return V(0.42 * Math.sin(th), 0, 0.42 * Math.cos(th));
  };
  const legPoint = (i: number, y: number) => {
    const top = legTop(i);
    const foot = legFoot(i);
    const f = (top.y - y) / (top.y - foot.y);
    return top.clone().lerp(foot, f);
  };

  b.joint("base", { at: [0, 0, 0] });
  b.joint("head", { parent: "base", at: H });

  // Telescope axis: tilted up toward the front, with its perpendicular "up" for the finder.
  const el = 0.6;
  const d = V(0, Math.sin(el), Math.cos(el)); // along the tube, toward the objective
  const u = V(0, Math.cos(el), -Math.sin(el)); // perpendicular, up
  const X = V(1, 0, 0);
  b.joint("tube", { parent: "head", at: H, dir: d, up: u });

  // P(s, o, side): a point on the telescope, s along the tube, o up from it, side across it.
  const P = (s: number, o = 0, side = 0) =>
    H.clone().addScaledVector(d, s).addScaledVector(u, o).addScaledVector(X, side);
  // Tube radius at s: tapers from the eyepiece end to the objective.
  const R = (s: number) => 0.03 + ((s + 0.12) / 0.74) * 0.01;

  // Legs: mahogany, tapering down to the feet.
  for (let i = 0; i < 3; i++) {
    b.rod(legTop(i), legFoot(i), [0.03, 0.014], { color: mahogany, bone: "base", name: `leg${i + 1}` });
    // Brass collar at the middle of each leg.
    const top = legTop(i);
    const foot = legFoot(i);
    const dir = foot.clone().sub(top).normalize();
    const mid = top.clone().lerp(foot, 0.5).addScaledVector(dir, -0.006);
    b.lathe([[0, 0], [0.03, 0], [0.03, 0.012], [0, 0.012]], {
      color: brass,
      at: mid,
      axis: dir,
      segments: 14,
      bone: "base",
      name: `legCollar${i + 1}`,
    });
    // Brass foot boot standing on the floor.
    b.lathe([[0, 0], [0.024, 0], [0.024, 0.02], [0, 0.02]], {
      color: brass,
      at: foot,
      axis: V(0, 1, 0),
      segments: 12,
      bone: "base",
      name: `foot${i + 1}`,
    });
  }

  // Centre column and brass head disc under the pivot.
  b.rod(V(0, 0.72, 0), V(0, 0.98, 0), 0.03, { color: mahogany, bone: "base", name: "column" });
  b.lathe([[0, 0], [0.085, 0], [0.085, 0.02], [0.05, 0.04], [0, 0.04]], {
    color: brass,
    at: V(0, 0.98, 0),
    axis: V(0, 1, 0),
    segments: 16,
    bone: "base",
    name: "headDisc",
  });

  // Star chart tray on a mahogany crossbar between two legs.
  const crossA = legPoint(1, 0.5);
  const crossB = legPoint(2, 0.5);
  const trayZ = (crossA.z + crossB.z) / 2;
  b.rod(crossA, crossB, 0.012, { color: mahogany, bone: "base", name: "crossbar" });
  b.part(new THREE.BoxGeometry(0.2, 0.012, 0.12), mahogany, { at: [0, 0.52, trayZ], bone: "base", name: "tray" });
  b.part(new THREE.BoxGeometry(0.2, 0.016, 0.008), brass, { at: [0, 0.528, trayZ + 0.056], bone: "base", name: "trayRimF" });
  b.part(new THREE.BoxGeometry(0.2, 0.016, 0.008), brass, { at: [0, 0.528, trayZ - 0.056], bone: "base", name: "trayRimB" });
  b.part(new THREE.BoxGeometry(0.008, 0.016, 0.12), brass, { at: [-0.096, 0.528, trayZ], bone: "base", name: "trayRimL" });
  b.part(new THREE.BoxGeometry(0.008, 0.016, 0.12), brass, { at: [0.096, 0.528, trayZ], bone: "base", name: "trayRimR" });
  // Rolled star chart with a brass strap.
  b.rod(V(-0.07, 0.54, trayZ), V(0.07, 0.54, trayZ), 0.016, { color: paper, bone: "base", name: "starChart" });
  b.rod(V(0.02, 0.54, trayZ), V(0.026, 0.54, trayZ), 0.018, { color: brass, bone: "base", name: "chartStrap" });

  // Yoke arms from the head disc up to the tube's cradle.
  for (const side of [-1, 1]) {
    b.rod(V(side * 0.085, 1.02, 0), P(0.12, -0.03, side * 0.045), 0.011, {
      color: brass,
      bone: "head",
      name: side > 0 ? "yokeL" : "yokeR",
    });
  }

  // Main tube: tapered brass, from the eyepiece end (s = -0.12) to the objective (s = 0.62).
  b.rod(P(-0.12), P(0.62), [0.03, 0.04], { color: brass, bone: "tube", name: "tube" });

  // Leather wraps over two sections.
  b.rod(P(0.0), P(0.16), R(0.08) + 0.007, { color: leather, bone: "tube", name: "leatherA" });
  b.rod(P(0.3), P(0.44), R(0.37) + 0.007, { color: leather, bone: "tube", name: "leatherB" });

  // Engraved rings: thin darker bands in the brass.
  for (const s of [0.2, 0.26, 0.58]) {
    b.rod(P(s), P(s + 0.008), R(s) + 0.0025, { color: brassDark, bone: "tube", name: `engraved${s}` });
  }

  // Focus knob: a knurled ring round the tube, and a side knob.
  b.lathe(
    [
      [0.034, 0],
      [0.06, 0],
      [0.06, 0.03],
      [0.034, 0.03],
    ],
    { color: brass, at: P(0.5), axis: d, segments: 18, bone: "tube", name: "focusRing" },
  );
  b.lathe(
    [
      [0, 0],
      [0.024, 0],
      [0.024, 0.012],
      [0, 0.012],
    ],
    { color: brass, at: P(0.52, 0, 0.034), axis: X, segments: 14, bone: "tube", name: "fineKnob" },
  );

  // Objective: a brass bell with a blue glass disc.
  b.lathe(
    [
      [0, 0],
      [0.046, 0],
      [0.046, 0.012],
      [0.04, 0.03],
      [0, 0.03],
    ],
    { color: brass, at: P(0.62), axis: d, segments: 18, bone: "tube", name: "objectiveBell" },
  );
  b.lathe(
    [
      [0, 0],
      [0.036, 0],
      [0.036, 0.003],
      [0, 0.003],
    ],
    { color: glass, at: P(0.65), axis: d, segments: 18, bone: "tube", name: "objectiveGlass" },
  );

  // Eyepiece at the rear: brass collar and a rubber eye cup.
  b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.034, 0.02],
      [0, 0.02],
    ],
    { color: brass, at: P(-0.12), axis: V(-d.x, -d.y, -d.z), segments: 18, bone: "tube", name: "eyepieceCollar" },
  );
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.034, 0.012],
      [0.024, 0.04],
      [0, 0.04],
    ],
    { color: rubber, at: P(-0.14), axis: V(-d.x, -d.y, -d.z), segments: 16, bone: "tube", name: "eyeCup" },
  );

  // Finder scope on top: a smaller tube on brass brackets, with its own glass and rubber cup.
  const finder = (s: number) => P(s, 0.085);
  b.rod(finder(0.02), finder(0.5), [0.02, 0.022], { color: brass, bone: "tube", name: "finder" });
  b.rod(P(0.12, 0.0), P(0.12, 0.07), 0.008, { color: brass, bone: "tube", name: "finderBracketA" });
  b.rod(P(0.42, 0.0), P(0.42, 0.07), 0.008, { color: brass, bone: "tube", name: "finderBracketB" });
  b.lathe(
    [
      [0, 0],
      [0.026, 0],
      [0.026, 0.015],
      [0, 0.015],
    ],
    { color: brass, at: finder(0.485), axis: d, segments: 14, bone: "tube", name: "finderCollar" },
  );
  b.lathe(
    [
      [0, 0],
      [0.018, 0],
      [0.018, 0.003],
      [0, 0.003],
    ],
    { color: glass, at: finder(0.5), axis: d, segments: 14, bone: "tube", name: "finderGlass" },
  );
  b.lathe(
    [
      [0, 0],
      [0.02, 0],
      [0.022, 0.012],
      [0, 0.012],
    ],
    { color: rubber, at: finder(0.02), axis: V(-d.x, -d.y, -d.z), segments: 12, bone: "tube", name: "finderCup" },
  );

  return b.root;
}
