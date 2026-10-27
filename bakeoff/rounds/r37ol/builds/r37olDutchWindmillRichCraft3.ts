import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Dutch Windmill",
  description: "A cheerful Animal Crossing-style Dutch windmill with a candy-striped roof, flower boxes, windows, door, and four wooden sails.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const RED = cel("#d95b4d", "#a93643");
  const ROOF = cel("#e86b55", "#a63a43");
  const CREAM = cel("#fff0c5", "#e5c78f");
  const WALL = cel("#f5d58b", "#c9975b");
  const WOOD = cel("#8b5739", "#553326");
  const DARK_WOOD = cel("#53352c", "#302027");
  const GREEN = cel("#76b85b", "#3e7b4b");
  const BLUE = cel("#79c7d8", "#3e809c");
  const WHITE = "#fff9df";
  const BLACK = INK;

  const box = (size: [number, number, number], at: [number, number, number], color: any, name: string, rotation?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    name: string,
    segments = 12,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      name,
      flat: true,
    });

  // Low, tidy foundation stones.
  box([1.16, 0.16, 0.82], [0, 0.08, 0], DARK_WOOD, "stoneFoundation");
  box([1.02, 0.12, 0.74], [0, 0.19, 0], CREAM, "foundationTrim");

  // Tapered octagonal mill tower, with a broad friendly base.
  b.frustumBox(
    [0, 0.22, 0],
    [0, 1.62, 0],
    [0.52, 0.39],
    [0.38, 0.31],
    { color: WALL, section: { ngon: 8 }, name: "taperedTower" } as any,
  );

  // Horizontal painted bands make the silhouette feel hand-built.
  box([1.02, 0.075, 0.74], [0, 0.37, 0], RED, "lowerRedBand");
  box([0.91, 0.07, 0.67], [0, 0.96, 0], CREAM, "middleCreamBand");
  box([0.82, 0.07, 0.61], [0, 1.42, 0], RED, "upperRedBand");

  // Door and arched-ish door surround on the front.
  box([0.27, 0.43, 0.035], [0, 0.45, 0.405], DARK_WOOD, "frontDoor");
  box([0.22, 0.36, 0.045], [0, 0.45, 0.428], WOOD, "doorPanel");
  cylinder(0.018, 0.018, [0.075, 0.47, 0.457], "#efbd52", "doorKnob", 8, [0, 0, 1]);
  box([0.31, 0.045, 0.045], [0, 0.705, 0.43], RED, "doorLintel");

  // Small front windows, deliberately oversized and toy-like.
  const windowTexture = svg(
    `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="120" rx="12" fill="#fff0bd" stroke="#53352c" stroke-width="8"/>
      <path d="M50 5V115M5 60H95" stroke="#53352c" stroke-width="7"/>
      <path d="M14 16L40 42M60 78L86 104M86 16L60 42M40 78L14 104" stroke="#b7e8e7" stroke-width="5"/>
    </svg>`,
    { size: 128 },
  );

  for (const side of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.205, 0.27, 0.025), CREAM, {
      at: [side * 0.235, 1.08, 0.325],
      dir: [0, 0, 1],
      axis: "z",
      name: `windowFrame${side}`,
    });
    b.part(new THREE.PlaneGeometry(0.16, 0.22), WHITE, {
      at: [side * 0.235, 1.08, 0.345],
      dir: [0, 0, 1],
      axis: "z",
      texture: windowTexture,
      name: `windowGlass${side}`,
    });
  }

  // Side shutters and tiny flower boxes.
  for (const side of [-1, 1]) {
    box([0.035, 0.25, 0.18], [side * 0.355, 1.08, 0.325], RED, `shutter${side}`);
    box([0.27, 0.075, 0.12], [side * 0.235, 0.91, 0.405], WOOD, `flowerBox${side}`);
    for (let i = -1; i <= 1; i++) {
      cylinder(0.035, 0.06, [side * (0.235 + i * 0.07), 0.99, 0.42], GREEN, `plant${side}_${i}`, 7);
      cylinder(0.018, 0.025, [side * (0.235 + i * 0.07), 1.045, 0.42], i === 0 ? "#f08d72" : "#f5c65d", `flower${side}_${i}`, 8);
    }
  }

  // Roof cap: a broad octagonal red cap and a striped cream/red conical roof.
  cylinder(0.45, 0.10, [0, 1.65, 0], RED, "roofEave", 10);
  b.lathe(
    [
      [0, 0],
      [0.42, 0],
      [0.38, 0.07],
      [0.26, 0.34],
      [0.08, 0.48],
      [0, 0.51],
    ],
    { at: [0, 1.69, 0], color: ROOF, segments: 10, name: "stripedRoof" } as any,
  );
  cylinder(0.055, 0.16, [0, 2.22, 0], WOOD, "roofFinial", 8);
  cylinder(0.09, 0.045, [0, 2.31, 0], RED, "finialBall", 8);

  // Front axle and large wooden hub.
  cylinder(0.085, 0.20, [0, 1.30, 0.48], WOOD, "sailAxle", 10, [0, 0, 1]);
  cylinder(0.145, 0.10, [0, 1.30, 0.59], DARK_WOOD, "sailHubBack", 12, [0, 0, 1]);
  cylinder(0.105, 0.12, [0, 1.30, 0.66], RED, "sailHub", 12, [0, 0, 1]);
  cylinder(0.035, 0.14, [0, 1.30, 0.74], "#f6c653", "hubCap", 8, [0, 0, 1]);

  // Four chunky toy sails, each made from a tapered wooden boom and colorful blade.
  const center = new THREE.Vector3(0, 1.30, 0.72);
  const bladeColors = [CREAM, RED, CREAM, RED];
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    const start = center.clone().add(new THREE.Vector3(dx * 0.10, dy * 0.10, 0));
    const end = center.clone().add(new THREE.Vector3(dx * 0.82, dy * 0.82, 0));

    b.rod(start, end, 0.035, DARK_WOOD, {
      name: `sailBeam${i}`,
      caps: "flat",
    });

    const mid = center.clone().add(new THREE.Vector3(dx * 0.49, dy * 0.49, 0.015));
    const blade = box(
      [0.16, 0.62, 0.045],
      [mid.x, mid.y, mid.z],
      bladeColors[i],
      `sailBlade${i}`,
      [0, 0, -a],
    );

    // Contrasting inset stripe on every sail.
    const stripeMid = center.clone().add(new THREE.Vector3(dx * 0.52, dy * 0.52, 0.044));
    box(
      [0.055, 0.48, 0.012],
      [stripeMid.x, stripeMid.y, stripeMid.z],
      i % 2 === 0 ? RED : CREAM,
      `sailStripe${i}`,
      [0, 0, -a],
    );

    // Rounded cap at the far end gives the blades a handcrafted toy feel.
    cylinder(0.075, 0.06, [end.x, end.y, end.z + 0.02], WOOD, `sailTip${i}`, 8, [0, 0, 1]);
    void blade;
  }

  // A little side balcony beneath the roof, adding strong Dutch silhouette detail.
  box([0.78, 0.055, 0.32], [0, 1.53, 0.02], WOOD, "balconyFloor");
  for (const x of [-0.32, -0.16, 0, 0.16, 0.32]) {
    cylinder(0.018, 0.20, [x, 1.64, 0.16], RED, `balconyPost${x}`, 6);
  }
  box([0.82, 0.045, 0.035], [0, 1.74, 0.16], WOOD, "balconyRail");

  // Decorative cream corner blocks and roof trim.
  for (const x of [-0.39, 0.39]) {
    box([0.06, 0.17, 0.06], [x, 1.53, 0.31], CREAM, `cornerBlock${x}`);
  }
  cylinder(0.47, 0.035, [0, 1.66, 0], CREAM, "roofCreamTrim", 10);

  return b.root;
}
