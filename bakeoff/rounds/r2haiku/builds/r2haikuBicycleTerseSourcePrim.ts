import * as THREE from "three";
import { catmull, createBuilder, mottle, stripes } from "../../../../src/index";

export const meta = {
  name: "Vintage bicycle",
  description:
    "A 1950s roadster: British-racing-green diamond frame with cream lugs, cream mudguards, sit-up chrome bars, a leather saddle, brass bell and lamp, and a wicker front basket.",
};

const GREEN = "#1f5b3a";
const CREAM = "#eadfc4";
const CHROME = "#c9cdd3";
const BLACK = "#1c1c1c";
const SPOKE = "#d4d7dc";
const BRASS = "#c9a54a";
const CHAIN = "#2b2b2b";
const RIM_BROWN = "#7a4a25";

const TYRE_R = 0.33;
const TYRE = 0.035;
const WHEEL_Y = TYRE_R + TYRE; // axle height: the tyre touches the floor
const FRONT_Z = 0.55;
const REAR_Z = -0.5;
const BB = [0, 0.3, -0.08] as const;

export default function vintageBicycle() {
  const b = createBuilder({ name: "vintage-bicycle", detail: 1, paintSize: 1024 });

  // Skeleton: the frame is the root; steering, the hubs and the saddle hang from it.
  b.joint("frame", { at: [...BB] });
  b.joint("steer", { parent: "frame", at: [0, 0.88, 0.35], aim: [0, 0.98, 0.37], role: "hinge" });
  b.joint("frontHub", { parent: "steer", at: [0, WHEEL_Y, FRONT_Z] });
  b.joint("rearHub", { parent: "frame", at: [0, WHEEL_Y, REAR_Z] });
  b.joint("seat", { parent: "frame", at: [0, 0.92, -0.2], aim: [0, 1.0, -0.22] });

  // Wheels: a fat tyre, a chrome rim, a hub and 32 spokes, all on the hub joint.
  const wheel = (hub: string, z: number) => {
    const at: [number, number, number] = [0, WHEEL_Y, z];
    const rot: [number, number, number] = [0, 90, 0];
    b.part(new THREE.TorusGeometry(TYRE_R, TYRE, b.segments(8), b.segments(40)), BLACK, {
      bone: hub,
      at,
      rotation: rot,
    });
    b.part(new THREE.TorusGeometry(TYRE_R - 0.02, 0.011, b.segments(6), b.segments(40)), CHROME, {
      bone: hub,
      at,
      rotation: rot,
    });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.12, b.segments(10)), CHROME, {
      bone: hub,
      at,
      rotation: [0, 0, 90],
    });
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const side = i % 2 ? 0.02 : -0.02;
      const rim = TYRE_R - 0.02;
      b.rod(
        [side, WHEEL_Y + 0.03 * c, z + 0.03 * s],
        [0, WHEEL_Y + rim * c, z + rim * s],
        0.0022,
        { color: SPOKE, bone: hub },
      );
    }
  };
  wheel("frontHub", FRONT_Z);
  wheel("rearHub", REAR_Z);

  // Frame tubes, green with cream lugs at each joint.
  b.rod([0, 0.3, -0.08], [0, 0.92, -0.2], 0.018, { color: GREEN, bone: "frame" }); // seat tube
  b.rod([0, 0.92, -0.2], [0, 0.96, 0.34], 0.018, { color: GREEN, bone: "frame" }); // top tube
  b.rod([0, 0.3, -0.08], [0, 0.78, 0.33], 0.02, { color: GREEN, bone: "frame" }); // down tube
  b.rod([0, 0.76, 0.33], [0, 0.98, 0.37], 0.024, { color: GREEN, bone: "frame" }); // head tube
  for (const x of [-1, 1]) {
    b.rod([x * 0.04, 0.9, -0.2], [x * 0.055, WHEEL_Y, REAR_Z], 0.012, { color: GREEN, bone: "frame" }); // seat stays
    b.rod([x * 0.05, 0.3, -0.08], [x * 0.055, WHEEL_Y, REAR_Z], 0.012, { color: GREEN, bone: "frame" }); // chain stays
    b.rod([x * 0.045, 0.74, 0.34], [x * 0.055, WHEEL_Y, FRONT_Z], 0.014, { color: GREEN, bone: "steer" }); // fork blades
  }
  b.rod([-0.05, 0.76, 0.33], [0.05, 0.76, 0.33], 0.02, { color: GREEN, bone: "steer" }); // fork crown

  for (const p of [BB, [0, 0.92, -0.2], [0, 0.98, 0.37], [0, 0.76, 0.33]] as const) {
    b.part(new THREE.SphereGeometry(0.026, b.segments(8), b.segments(6)), CREAM, {
      at: [...p],
      bone: p === BB ? "frame" : p[1] > 0.9 && p[2] < 0 ? "seat" : "steer",
    });
  }

  // Drivetrain: chainring and crank at the bottom bracket, chain to a chrome rear sprocket.
  b.part(new THREE.TorusGeometry(0.09, 0.008, b.segments(6), b.segments(36)), CHROME, {
    at: [-0.06, 0.3, -0.08],
    rotation: [0, 90, 0],
    bone: "frame",
  });
  b.rod([-0.075, 0.3, -0.08], [-0.075, 0.18, 0.04], 0.01, { color: CHROME, bone: "frame" });
  b.rod([0.075, 0.3, -0.08], [0.075, 0.42, -0.16], 0.01, { color: CHROME, bone: "frame" });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.08), BLACK, { at: [-0.1, 0.18, 0.04], bone: "frame" });
  b.rod([-0.06, 0.21, -0.08], [-0.045, 0.325, -0.5], 0.005, { color: CHAIN, bone: "frame" });
  b.rod([-0.06, 0.39, -0.08], [-0.045, 0.405, -0.5], 0.005, { color: CHAIN, bone: "frame" });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.01, b.segments(12)), CHROME, {
    at: [-0.045, WHEEL_Y, REAR_Z],
    rotation: [0, 0, 90],
    bone: "rearHub",
  });

  // Cream mudguards, two per wheel, arching over the tyres.
  const mudguard = (cz: number, hub: string) => {
    for (const x of [-0.075, 0.075]) {
      const pts: [number, number, number][] = [];
      for (let k = 0; k <= 6; k++) {
        const a = ((20 + (140 * k) / 6) * Math.PI) / 180;
        pts.push([x, WHEEL_Y + 0.4 * Math.sin(a), cz + 0.4 * Math.cos(a)]);
      }
      b.sweep(catmull(pts), 0.011, { color: CREAM, bone: hub });
    }
  };
  mudguard(FRONT_Z, "frontHub");
  mudguard(REAR_Z, "rearHub");

  // Sit-up chrome bars with black grips, a stem and a brass bell.
  b.rod([0, 0.96, 0.36], [0, 0.99, 0.42], 0.02, { color: CHROME, bone: "steer" });
  const bar = catmull([
    [-0.23, 1.08, 0.3],
    [-0.2, 1.0, 0.4],
    [-0.12, 0.99, 0.42],
    [0, 0.99, 0.42],
    [0.12, 0.99, 0.42],
    [0.2, 1.0, 0.4],
    [0.23, 1.08, 0.3],
  ]);
  b.sweep(bar, 0.013, { color: CHROME, bone: "steer" });
  b.rod([-0.22, 1.06, 0.33], [-0.2, 1.0, 0.4], 0.02, { color: BLACK, bone: "steer" });
  b.rod([0.22, 1.06, 0.33], [0.2, 1.0, 0.4], 0.02, { color: BLACK, bone: "steer" });
  b.rod([0.03, 0.99, 0.42], [0.07, 1.02, 0.43], 0.006, { color: CHROME, bone: "steer" });
  b.part(new THREE.SphereGeometry(0.028, b.segments(10), b.segments(8)), BRASS, {
    at: [0.07, 1.03, 0.43],
    scale: [1, 0.7, 1],
    bone: "steer",
  });

  // Brass headlamp on the fork, carried by a chrome bracket.
  b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(10)), BRASS, {
    at: [0, 0.8, 0.42],
    scale: [1, 1, 0.8],
    bone: "steer",
  });

  // Leather saddle on a chrome seat post.
  b.rod([0, 0.92, -0.2], [0, 0.99, -0.22], 0.012, { color: CHROME, bone: "seat" });
  b.part(new THREE.SphereGeometry(0.1, b.segments(12), b.segments(8)), mottle("#6b4a2e", "#4a3020", { size: 0.06, seed: 3 }), {
    at: [0, 1.01, -0.22],
    scale: [0.9, 0.45, 1.6],
    bone: "seat",
  });

  // Wicker front basket on a chrome rack: a lathe cup with banded paint and a rim.
  const wicker = stripes("#dcb979", RIM_BROWN, { size: 0.035, axis: "y", width: 0.45, seed: 5 });
  b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.13, 0.08],
      [0.14, 0.16],
      [0.125, 0.16],
      [0.11, 0.08],
      [0.1, 0.02],
      [0, 0.02],
    ],
    { color: wicker, at: [0, 0.8, 0.68], axis: [0, 1, 0], name: "basket" },
  );
  b.part(new THREE.TorusGeometry(0.135, 0.01, b.segments(6), b.segments(36)), RIM_BROWN, {
    at: [0, 0.96, 0.68],
    rotation: [90, 0, 0],
    bone: "steer",
  });
  for (const x of [-1, 1]) {
    b.rod([x * 0.05, 0.8, 0.42], [x * 0.09, 0.8, 0.6], 0.008, { color: CHROME, bone: "steer" });
  }

  // Leather-brown paint on the saddle and basket; the frame keeps its solid colour.
  return b.root;
}
