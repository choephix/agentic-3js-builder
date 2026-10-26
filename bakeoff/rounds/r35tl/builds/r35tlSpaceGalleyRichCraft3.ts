import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nostromo Alien Spaceship Galley",
  description:
    "A compact 1979 industrial spaceship galley kitchen with ribbed cabinets, stainless counters, sink, range, pipes, vents, instrument panels and warm indicator lights.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });

  const STEEL = "#666b68";
  const DARK = "#242827";
  const DEEP = "#121716";
  const EDGE = "#92958b";
  const RUBBER = "#171b1a";
  const COPPER = "#8b5935";
  const BRASS = "#b4894b";
  const CREAM = "#c6bca0";
  const RED = "#a72c20";
  const AMBER = "#ef9b31";
  const GREEN = "#73b49a";
  const BLUE = "#527a83";
  const WHITE = "#d9d6c1";

  const root = b.joint("galleyRoot", { at: [0, 0, 0], dir: [0, 1, 0], role: "spine" });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    name: string,
    bevel = 0,
  ) => {
    const g = new THREE.BoxGeometry(...size);
    if (bevel) {
      // Subtle bevel impression through layered edge plates rather than smooth furniture.
      b.part(g, color, { at, bone: root, name, flat: true });
    } else {
      b.part(g, color, { at, bone: root, name, flat: true });
    }
  };

  const cyl = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: any,
    name: string,
    axis: "x" | "y" | "z" = "y",
    segments = 10,
  ) => {
    const g = new THREE.CylinderGeometry(radius, radius, depth, segments, 1);
    const dir = axis === "x" ? [1, 0, 0] : axis === "z" ? [0, 0, 1] : [0, 1, 0];
    b.part(g, color, { at, dir, axis, bone: root, name, flat: true });
  };

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
    name: string,
  ) => b.rod(a, c, radius, { color, bone: root, name, sides: 8 });

  const button = (
    at: [number, number, number],
    color: string,
    name: string,
    r = 0.018,
  ) => {
    const p = b.part(
      new THREE.CylinderGeometry(r, r * 0.9, 0.012, 8),
      color,
      { at, dir: [0, 0, 1], axis: "y", bone: root, name },
    );
    glow(p, 1.8);
  };

  // Floor-mounted structural plinth and rear bulkhead.
  box([2.25, 0.12, 0.78], [0, 0.06, -0.16], DEEP, "floorPlinth");
  box([2.18, 1.56, 0.12], [0, 0.86, -0.54], DARK, "rearBulkhead");
  box([2.28, 0.10, 0.16], [0, 1.64, -0.48], EDGE, "bulkheadHeader");
  box([0.10, 1.56, 0.12], [-1.08, 0.86, -0.54], EDGE, "bulkheadRibL");
  box([0.10, 1.56, 0.12], [1.08, 0.86, -0.54], EDGE, "bulkheadRibR");

  // Repeated vertical ribs: the iconic utilitarian industrial wall.
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.235;
    box([0.035, 1.38, 0.035], [x, 0.85, -0.465], EDGE, `wallRib${i}`);
    box([0.055, 0.055, 0.04], [x, 0.18, -0.44], BRASS, `ribBoltLow${i}`);
    box([0.055, 0.055, 0.04], [x, 1.48, -0.44], BRASS, `ribBoltHigh${i}`);
  }

  // Base cabinets, left and right.
  box([0.82, 0.68, 0.58], [-0.64, 0.40, -0.08], STEEL, "baseCabinetL");
  box([0.72, 0.68, 0.58], [0.76, 0.40, -0.08], STEEL, "baseCabinetR");
  box([0.05, 0.62, 0.62], [-0.22, 0.40, -0.08], DARK, "cabinetGap");
  box([2.18, 0.09, 0.72], [0, 0.77, -0.04], EDGE, "countertop");

  // Cabinet doors and heavy handles.
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -0.64 : 0.76;
    const count = s < 0 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const x = x0 + (i - (count - 1) / 2) * 0.245;
      box([0.20, 0.48, 0.025], [x, 0.40, 0.225], DARK, `door${s}${i}`);
      box([0.13, 0.025, 0.018], [x, 0.40, 0.245], EDGE, `doorInset${s}${i}`);
      rod([x - 0.055, 0.40, 0.265], [x + 0.055, 0.40, 0.265], 0.009, BRASS, `handle${s}${i}`);
    }
  }

  // Left sink basin, rim, drain and faucet.
  box([0.58, 0.045, 0.43], [-0.63, 0.83, 0.00], DARK, "sinkBasin");
  box([0.68, 0.045, 0.055], [-0.63, 0.875, 0.00], EDGE, "sinkRimFront");
  box([0.68, 0.045, 0.055], [-0.63, 0.875, -0.22], EDGE, "sinkRimBack");
  box([0.055, 0.045, 0.48], [-0.94, 0.875, -0.11], EDGE, "sinkRimSideL");
  box([0.055, 0.045, 0.48], [-0.32, 0.875, -0.11], EDGE, "sinkRimSideR");
  cyl(0.045, 0.012, [-0.63, 0.865, -0.10], RUBBER, "sinkDrain");
  rod([-0.43, 0.86, -0.17], [-0.43, 1.08, -0.17], 0.018, COPPER, "faucetStem");
  rod([-0.43, 1.08, -0.17], [-0.43, 1.08, 0.03], 0.018, COPPER, "faucetSpout");
  cyl(0.028, 0.018, [-0.43, 1.08, 0.03], BRASS, "faucetCap");

  // Right-side cooking range with four black burner plates and controls.
  box([0.67, 0.08, 0.62], [0.73, 0.84, 0.02], DARK, "rangeTop");
  for (let x = 0.52; x <= 0.94; x += 0.21) {
    cyl(0.075, 0.018, [x, 0.895, 0.03], RUBBER, `burner${x}`);
    cyl(0.043, 0.021, [x, 0.905, 0.03], EDGE, `burnerRing${x}`);
  }
  box([0.67, 0.30, 0.04], [0.73, 0.59, 0.29], DEEP, "ovenFace");
  box([0.49, 0.12, 0.025], [0.73, 0.66, 0.315], DARK, "ovenWindow");
  box([0.55, 0.025, 0.025], [0.73, 0.49, 0.34], EDGE, "ovenHandle");
  for (let i = 0; i < 4; i++) {
    cyl(0.032, 0.025, [0.50 + i * 0.15, 0.94, 0.34], BRASS, `rangeKnob${i}`, "z", 8);
  }

  // Tall refrigerator / cryo locker at the far left.
  box([0.42, 1.25, 0.52], [-0.88, 1.27, -0.03], DARK, "tallLocker");
  box([0.34, 1.10, 0.035], [-0.88, 1.28, 0.245], STEEL, "lockerDoor");
  box([0.28, 0.025, 0.20], [-0.88, 1.27, 0.27], DEEP, "lockerDisplay");
  box([0.22, 0.02, 0.025], [-0.88, 1.16, 0.29], GREEN, "lockerScreen");
  rod([-0.72, 1.46, 0.28], [-0.72, 0.97, 0.28], 0.012, BRASS, "lockerHandle");
  for (let i = 0; i < 5; i++) button([-1.12, 0.94 + i * 0.15, 0.29], i % 2 ? AMBER : RED, `lockerLamp${i}`, 0.014);

  // Overhead storage lockers with slanted, chunky doors.
  box([1.35, 0.40, 0.45], [0.30, 1.42, -0.08], STEEL, "overheadCabinet");
  box([0.60, 0.30, 0.025], [-0.08, 1.42, 0.18], DARK, "overheadDoorL");
  box([0.60, 0.30, 0.025], [0.58, 1.42, 0.18], DARK, "overheadDoorR");
  rod([-0.30, 1.43, 0.215], [0.13, 1.43, 0.215], 0.009, BRASS, "overheadHandleL");
  rod([0.37, 1.43, 0.215], [0.80, 1.43, 0.215], 0.009, BRASS, "overheadHandleR");
  for (let x = -0.28; x <= 0.86; x += 0.19) {
    cyl(0.018, 0.025, [x, 1.68, -0.08], BRASS, `overheadBolt${x}`);
  }

  // Narrow open shelf with mugs, ration tins and a kettle.
  box([0.82, 0.055, 0.36], [0.34, 1.08, -0.36], EDGE, "openShelf");
  box([0.04, 0.30, 0.36], [-0.07, 1.20, -0.36], EDGE, "shelfBracketL");
  box([0.04, 0.30, 0.36], [0.75, 1.20, -0.36], EDGE, "shelfBracketR");
  for (let x = 0.06; x <= 0.64; x += 0.19) {
    cyl(0.055, 0.12, [x, 1.18, -0.31], CREAM, `rationTin${x}`, "y", 10);
    cyl(0.058, 0.012, [x, 1.245, -0.31], BRASS, `tinLid${x}`, "y", 10);
  }
  cyl(0.10, 0.16, [0.49, 1.19, -0.30], DARK, "kettleBody", "y", 10);
  cyl(0.11, 0.012, [0.49, 1.28, -0.30], BRASS, "kettleLid");
  rod([0.57, 1.23, -0.30], [0.67, 1.30, -0.30], 0.014, COPPER, "kettleHandle");

  // Control console on the front-facing wall.
  box([0.76, 0.40, 0.07], [0.52, 1.08, -0.455], DEEP, "controlPanel");
  box([0.55, 0.19, 0.012], [0.52, 1.14, -0.495], "#3b4540", "panelInset");
  for (let i = 0; i < 8; i++) {
    button([0.27 + i * 0.07, 0.96 + (i % 2) * 0.13, -0.505], i % 3 === 0 ? RED : i % 3 === 1 ? AMBER : GREEN, `panelButton${i}`, 0.014);
  }
  for (let i = 0; i < 5; i++) {
    cyl(0.027, 0.02, [0.28 + i * 0.10, 1.25, -0.505], BRASS, `panelDial${i}`, "z", 8);
  }

  // Nostromo-style conduit runs around the room.
  rod([-1.02, 0.20, -0.35], [-1.02, 1.52, -0.35], 0.028, COPPER, "pipeVerticalL");
  rod([-1.02, 1.52, -0.35], [-0.52, 1.52, -0.35], 0.028, COPPER, "pipeTopL");
  rod([1.00, 0.25, -0.35], [1.00, 1.50, -0.35], 0.025, BLUE, "pipeVerticalR");
  rod([1.00, 1.50, -0.35], [0.70, 1.50, -0.35], 0.025, BLUE, "pipeTopR");
  rod([-0.20, 0.80, -0.50], [-0.20, 1.32, -0.50], 0.016, COPPER, "frontPipeL");
  rod([-0.12, 1.32, -0.50], [0.40, 1.32, -0.50], 0.016, COPPER, "frontPipeAcross");
  for (const x of [-1.02, -0.52, 0.70, 1.00]) {
    cyl(0.043, 0.035, [x, 0.82, -0.35], BRASS, `pipeCollar${x}`, "y", 8);
    cyl(0.043, 0.035, [x, 1.51, -0.35], BRASS, `pipeCollarTop${x}`, "y", 8);
  }

  // Ventilation hood over the range.
  box([0.78, 0.10, 0.44], [0.70, 1.51, -0.02], DARK, "rangeHood");
  box([0.66, 0.12, 0.07], [0.70, 1.44, 0.13], STEEL, "hoodLip");
  for (let i = 0; i < 7; i++) {
    box([0.025, 0.04, 0.28], [0.43 + i * 0.09, 1.47, -0.03], DEEP, `hoodSlot${i}`);
  }
  rod([0.70, 1.56, -0.02], [0.70, 1.68, -0.02], 0.06, DARK, "hoodDuct");
  rod([0.70, 1.68, -0.02], [0.70, 1.68, -0.43], 0.06, DARK, "hoodDuctBack");

  // Small warning placard texture, riveted to the bulkhead.
  const warning = svg(
    `<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="80" fill="#252a27"/>
      <path d="M10 10H150V70H10Z" fill="none" stroke="#c3a85c" stroke-width="5"/>
      <path d="M25 55L45 20L65 55Z" fill="#b3261e"/>
      <path d="M38 47L45 31L52 47Z" fill="#e2d6a4"/>
      <text x="76" y="35" fill="#d8c99a" font-family="sans-serif" font-size="14" font-weight="bold">CAUTION</text>
      <text x="76" y="53" fill="#d8c99a" font-family="sans-serif" font-size="10">HOT SURFACE</text>
    </svg>`,
    { size: 256 },
  );
  const placard = b.part(new THREE.BoxGeometry(0.42, 0.21, 0.012), WHITE, {
    at: [-0.18, 1.13, -0.50],
    dir: [0, 0, 1],
    axis: "z",
    texture: warning,
    bone: root,
    name: "warningPlacard",
  });
  for (const x of [-0.36, 0.00]) {
    for (const y of [1.05, 1.21]) cyl(0.012, 0.018, [x, y, -0.515], BRASS, "placardRivet", "z", 8);
  }

  // Loose utensils and a hanging magnetic strip.
  box([0.72, 0.035, 0.035], [0.02, 0.94, 0.28], RUBBER, "magneticStrip");
  for (let i = 0; i < 5; i++) {
    const x = -0.25 + i * 0.13;
    rod([x, 0.96, 0.28], [x + 0.04, 1.22, 0.28], 0.009, i % 2 ? STEEL : COPPER, `hangingUtensil${i}`);
  }

  // Accent lamps under the upper cabinets.
  for (const x of [-0.48, -0.12, 0.25, 0.62]) {
    const lamp = b.part(new THREE.BoxGeometry(0.18, 0.025, 0.025), AMBER, {
      at: [x, 1.20, 0.21],
      bone: root,
      name: "underCabinetLamp",
    });
    glow(lamp, 1.25);
  }

  // Four chunky floor anchor feet.
  for (const x of [-0.92, -0.35, 0.35, 0.92]) {
    cyl(0.075, 0.10, [x, 0.11, -0.12], RUBBER, `floorFoot${x}`);
    cyl(0.045, 0.012, [x, 0.17, -0.12], BRASS, `floorFootCap${x}`);
  }

  return b.root;
}
