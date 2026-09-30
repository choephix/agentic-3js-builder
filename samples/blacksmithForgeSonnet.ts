import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { DEG, rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { grain, paint, scales } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import { cel } from "../kits/toon";

export const meta = {
  name: "Blacksmith's Forge · Sonnet",
  description:
    "A tabletop diorama of a village smithy on a timber base: a stone forge with glowing coals and a chimney, a leather bellows that opens on a hinge, a half-forged glowing sword on an anvil and stump, a quench barrel, a tool rack with hammers and tongs, a workbench with vise and lantern, horseshoes, a firewood pile and a swinging shop sign.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "blacksmithForge", paintSize: 2048 });
  const R = rng(1847);
  type Opt = NonNullable<Parameters<typeof b.part>[2]>;
  type Fill = Parameters<typeof b.part>[1];

  // ---------------------------------------------------------------------------------------------------------------
  // Palette: everything unlit is cel-shaded, so the whole diorama shares one two-tone look.
  // ---------------------------------------------------------------------------------------------------------------
  const woodX = cel(grain("#a8744a", "#8f5e3a", { size: 0.022, axis: "x", seed: 3 }));
  const woodY = cel(grain("#a8744a", "#8f5e3a", { size: 0.022, axis: "y", seed: 4 }));
  const woodZ = cel(grain("#a8744a", "#8f5e3a", { size: 0.022, axis: "z", seed: 5 }));
  const pine = cel(grain("#d9ad74", "#c4955c", { size: 0.02, axis: "x", seed: 14 }));
  const darkWood = cel(grain("#6a4630", "#5a3a27", { size: 0.03, axis: "x", seed: 6 }));
  const barkZ = cel(grain("#6d4a33", "#4e3324", { size: 0.016, axis: "z", seed: 8 }));
  const barkY = cel(grain("#6d4a33", "#4e3324", { size: 0.02, axis: "y", seed: 9 }));
  const STONES = ["#a39e93", "#8d8881", "#b2aa9a", "#7d7a78", "#9b9285"].map((c) => cel(c));
  const mortar = cel("#5b5650");
  const slate = cel(scales(["#8f8b84", "#9d988e", "#7f7d7a", "#a39c8f"], "#55514c", { size: 0.1, width: 0.06, seed: 2 }));
  const cobble = cel(
    scales(["#8a857c", "#9a9488", "#777370", "#a29a8a", "#857f74"], "#4d4944", { size: 0.075, width: 0.07, seed: 12 }),
  );
  const IRON = cel("#3c4148");
  const IRON_L = cel("#5a626b");
  const STEEL = cel("#9aa4ad");
  const LEATHER = cel("#8a4c28", "#4a2514");
  const LEATHER_D = cel("#3a2010", "#22110a");
  const SOOT = cel("#2b2522", "#1b1715");
  const ASH = cel("#514a44", "#3a3531");
  const BRASS = cel("#d1a13e", "#8a5e1e");
  const ROPE = cel("#cdb27c", "#8f7848");

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton: scenery needs none, but the bellows lid and the shop sign move.
  // ---------------------------------------------------------------------------------------------------------------
  const root = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });

  let G = "base";
  const PL = 0.75; // plinth half width
  const PD = 0.58; // plinth half depth
  const F = 0.1; // floor surface height
  const pick = <T>(list: readonly T[]) => list[Math.floor(R() * list.length)];

  // --- small placement helpers -----------------------------------------------------------------------------------
  const part = (geo: THREE.BufferGeometry, color: Fill, at: V, o: Opt = {}) =>
    b.part(geo, color, { bone: root, at, group: G, flat: true, ...o });
  const box = (w: number, h: number, d: number, color: Fill, at: V, o: Opt = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Fill, at: V, o: Opt = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg, 1), color, at, o);
  const rod = (p: V, q: V, r: number, color: Fill, o: { sides?: number; bone?: typeof root } = {}) =>
    b.rod(p, q, r, { color, sides: o.sides ?? 6, bone: o.bone ?? root, group: G });
  const tube = (pts: V[], r: number | [number, number], color: Fill, sides = 6) =>
    b.sweep(pts.length > 3 ? catmull(pts) : polyline(pts), r, { color, sides, bone: root, group: G });

  const chamfer = (hw: number, hd: number, c: number): OutlinePoint[] => [
    [-hw + c, -hd],
    [hw - c, -hd],
    [hw, -hd + c],
    [hw, hd - c],
    [hw - c, hd],
    [-hw + c, hd],
    [-hw, hd - c],
    [-hw, -hd + c],
  ];
  const arch = (w: number, h: number, steps = 6): OutlinePoint[] => {
    const pts: OutlinePoint[] = [
      [-w, 0],
      [w, 0],
      [w, h],
    ];
    for (let i = 1; i < steps; i++) {
      const a = (i / steps) * Math.PI;
      pts.push([w * Math.cos(a), h + w * Math.sin(a)]);
    }
    pts.push([-w, h]);
    return pts;
  };
  /** A flat shape lying on the floor (outline x right, outline y toward -z so +y reads as "back"). */
  const flatOn = (outline: OutlinePoint[], at: V, thick: number, color: Fill, o: { bevel?: number } = {}) =>
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: thick,
      bevel: o.bevel ?? 0,
      color,
      bone: root,
      group: G,
    });

  // ---------------------------------------------------------------------------------------------------------------
  // BASE: a timber plinth with a cobbled floor, scorch marks and a few loose paving stones.
  // ---------------------------------------------------------------------------------------------------------------
  G = "base";
  b.extrude(chamfer(PL, PD, 0.07), {
    at: [0, 0.035, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.07,
    bevel: 0.012,
    color: darkWood,
    bone: root,
    group: G,
    name: "plinth",
  });
  b.extrude(chamfer(PL - 0.05, PD - 0.05, 0.05), {
    at: [0, 0.085, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.03,
    bevel: 0.006,
    color: cobble,
    bone: root,
    group: G,
    name: "floor",
  });
  // timber edge studs around the plinth
  {
    const studs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const x = -0.64 + i * 0.16;
      for (const z of [PD + 0.001, -PD - 0.001])
        studs.push(new THREE.BoxGeometry(0.014, 0.014, 0.006).translate(x, 0.035, z));
    }
    for (let i = 0; i < 6; i++) {
      const z = -0.4 + i * 0.16;
      for (const x of [PL + 0.001, -PL - 0.001])
        studs.push(new THREE.BoxGeometry(0.006, 0.014, 0.014).translate(x, 0.035, z));
    }
    b.part(mergeGeometries(studs), IRON, { bone: root, at: [0, 0, 0], group: G, name: "plinthStuds" });
  }
  // scorch patch under the anvil and a soot smear in front of the hearth
  const blob = (cx: number, cz: number, rx: number, rz: number, n: number): OutlinePoint[] => {
    const pts: OutlinePoint[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = 0.82 + R() * 0.3;
      pts.push([cx + Math.cos(a) * rx * k, -(cz + Math.sin(a) * rz * k)]);
    }
    return pts;
  };
  flatOn(blob(-0.08, 0.12, 0.27, 0.22, 10), [0, F, 0], 0.004, ASH);
  flatOn(blob(-0.43, -0.06, 0.26, 0.12, 9), [0, F + 0.001, 0], 0.004, SOOT);

  // ---------------------------------------------------------------------------------------------------------------
  // FORGE: brick hearth, coal bed, hood and chimney.
  // ---------------------------------------------------------------------------------------------------------------
  G = "forge";
  const FX = -0.43;
  const HX0 = -0.66;
  const HX1 = -0.2;
  const HZ0 = -0.52;
  const HZ1 = -0.14;
  const HB = 0.39; // brick body height
  const HT = F + HB + 0.03; // hearth top
  const ZC = (HZ0 + HZ1) / 2;
  box(HX1 - HX0, HB, HZ1 - HZ0, mortar, [FX, F + HB / 2, ZC], { name: "hearthBody" });
  box(HX1 - HX0 + 0.03, 0.03, HZ1 - HZ0 + 0.03, slate, [FX, F + HB + 0.015, ZC], { name: "hearthCap" });

  const rows = 6;
  const rowH = HB / rows;
  const brickRow = (face: "front" | "back" | "right" | "left", r: number) => {
    const span = face === "front" || face === "back" ? [HX0, HX1] : [HZ0, HZ1];
    let u = span[0] - (r % 2 ? 0.055 : 0);
    const y = F + r * rowH + rowH / 2;
    while (u < span[1]) {
      const w = 0.1 + R() * 0.06;
      const a = Math.max(u, span[0]);
      const e = Math.min(u + w, span[1]);
      if (e - a > 0.03) {
        const c = (a + e) / 2;
        const len = e - a - 0.008;
        const hj = rowH - 0.008;
        if (face === "front" || face === "back") box(len, hj, 0.026, pick(STONES), [c, y, face === "front" ? HZ1 : HZ0], { name: "brick" });
        else box(0.026, hj, len, pick(STONES), [face === "right" ? HX1 : HX0, y, c], { name: "brick" });
      }
      u += w;
    }
  };
  for (let r = 0; r < rows; r++) {
    brickRow("front", r);
    brickRow("back", r);
    brickRow("right", r);
    brickRow("left", r);
  }
  // corner quoins
  for (let r = 0; r < rows; r += 2)
    for (const x of [HX0, HX1]) box(0.05, rowH - 0.006, 0.05, STONES[2], [x, F + r * rowH + rowH / 2, HZ1]);

  // ash-pit arch on the front: a stone surround, a dark niche and the embers glowing inside it
  b.extrude(arch(0.105, 0.085), {
    at: [FX, F + 0.0, HZ1 + 0.012],
    thickness: 0.032,
    x: [1, 0, 0],
    y: [0, 1, 0],
    bevel: 0.006,
    color: STONES[2],
    bone: root,
    group: G,
    name: "ashArchSurround",
  });
  b.extrude(arch(0.08, 0.075), {
    at: [FX, F + 0.0, HZ1 + 0.012],
    thickness: 0.05,
    x: [1, 0, 0],
    y: [0, 1, 0],
    color: SOOT,
    bone: root,
    group: G,
    name: "ashNiche",
  });
  glow(
    b.extrude(arch(0.055, 0.045), {
      at: [FX, F + 0.0, HZ1 + 0.012],
      thickness: 0.058,
      x: [1, 0, 0],
      y: [0, 1, 0],
      color: "#ff6a1a",
      bone: root,
      group: G,
      name: "ashEmbers",
    }),
    1.3,
  );
  for (const dx of [-0.03, 0, 0.03]) box(0.006, 0.09, 0.006, IRON, [FX + dx, F + 0.05, HZ1 + 0.04], { name: "grate" });

  // coal bed: a ring of rim stones, a dark ash dish and heaps of glowing and dead coals
  const BX = FX;
  const BZ = ZC;
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const rad = 0.155;
    box(0.085, 0.04, 0.052, pick(STONES), [BX + Math.cos(a) * rad, HT + 0.02, BZ + Math.sin(a) * rad], {
      rotation: [0, -a / DEG + 90, 0],
      name: "rimStone",
    });
  }
  cyl(0.15, 0.15, 0.022, 12, ASH, [BX, HT + 0.011, BZ], { name: "ashDish" });
  {
    const sets = new Map<string, THREE.BufferGeometry[]>();
    const add = (color: string, r: number, p: V) => {
      const g = new THREE.IcosahedronGeometry(r, 0);
      g.scale(0.9 + R() * 0.5, 0.7 + R() * 0.4, 0.9 + R() * 0.5);
      g.rotateX(R() * 6);
      g.rotateY(R() * 6);
      g.translate(...p);
      g.computeVertexNormals();
      const l = sets.get(color) ?? [];
      l.push(g);
      sets.set(color, l);
    };
    const GLOW = ["#ff5a14", "#ff7b1c", "#ffa02a", "#ffc94a", "#e8320d"];
    for (let i = 0; i < 46; i++) {
      const a = R() * Math.PI * 2;
      const d = Math.sqrt(R()) * 0.125;
      const hMound = (1 - (d / 0.135) ** 2) * 0.03;
      const r = 0.017 + R() * 0.017;
      const col = R() < 0.27 ? "#2d2622" : d < 0.06 ? pick(GLOW.slice(2)) : pick(GLOW);
      add(col, r, [BX + Math.cos(a) * d, HT + 0.022 + hMound + r * 0.35, BZ + Math.sin(a) * d]);
    }
    for (const [color, list] of sets) {
      const p = b.part(mergeGeometries(list), color, { bone: root, at: [0, 0, 0], group: G, name: "coals", flat: true });
      if (color !== "#2d2622") glow(p, color === "#ffc94a" ? 1.7 : 1.3);
    }
    // low flame tongues licking over the brightest coals
    const flames: [number, number, number, string][] = [
      [0.0, 0.0, 0.11, "#ff8a1e"],
      [-0.05, 0.03, 0.08, "#ffb02e"],
      [0.05, -0.03, 0.085, "#ff7b1c"],
      [0.02, 0.06, 0.06, "#ffd24a"],
      [-0.03, -0.05, 0.065, "#ff9a26"],
    ];
    for (const [dx, dz, h, c] of flames) {
      glow(
        part(new THREE.ConeGeometry(0.02 + h * 0.15, h, 5), c, [BX + dx, HT + 0.05 + h / 2, BZ + dz], {
          rotation: [0, R() * 90, 0],
          name: "flame",
        }),
        1.4,
      );
    }
  }

  // hood and chimney
  const HOOD_Y = 0.88;
  const hoodProfile: OutlinePoint[] = [
    [HZ1 - 0.02, HOOD_Y],
    [HZ0, HOOD_Y],
    [HZ0, 1.24],
    [-0.36, 1.24],
  ];
  b.extrude(hoodProfile, {
    at: [FX, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: HX1 - HX0,
    bevel: 0.008,
    color: slate,
    bone: root,
    group: G,
    name: "hood",
  });
  box(HX1 - HX0 - 0.03, 0.01, HZ1 - HZ0 - 0.06, SOOT, [FX, HOOD_Y - 0.004, ZC - 0.02], { name: "hoodSoot" });
  // wooden lintel beam and two corner posts
  box(HX1 - HX0 + 0.04, 0.055, 0.06, darkWood, [FX, HOOD_Y - 0.03, HZ1 + 0.02], { name: "lintel" });
  for (const x of [HX0 + 0.02, HX1 - 0.02])
    box(0.055, HOOD_Y - HT - 0.03, 0.055, darkWood, [x, (HT + HOOD_Y - 0.06) / 2 + 0.0, HZ1 - 0.0], { name: "hoodPost" });
  // back wall behind the fire
  box(HX1 - HX0, HOOD_Y - HT, 0.1, slate, [FX, (HT + HOOD_Y) / 2, HZ0 + 0.05], { name: "backWall" });
  // heat-scorched patch on the back wall
  box(0.26, 0.2, 0.008, SOOT, [FX, HT + 0.14, HZ0 + 0.102], { name: "scorch" });
  // the fire's glow washing up the back wall, in stepped bands like a cel-shaded halo
  const HEAT = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 72"><ellipse cx="50" cy="72" rx="50" ry="70" fill="#5f2412"/>
<ellipse cx="50" cy="72" rx="38" ry="54" fill="#8f3416"/><ellipse cx="50" cy="72" rx="27" ry="38" fill="#c2491b"/>
<ellipse cx="50" cy="72" rx="15" ry="22" fill="#e9722b"/></svg>`,
    { size: 192 },
  );
  glow(
    part(new THREE.PlaneGeometry(0.3, 0.216), "#ffffff", [FX, HT + 0.03 + 0.108, HZ0 + 0.1065], {
      texture: HEAT,
      name: "heatWash",
      flat: false,
    }),
    0.7,
  );
  // hooks under the lintel
  for (const dx of [-0.14, 0, 0.14]) {
    rod([FX + dx, HOOD_Y - 0.06, HZ1 + 0.055], [FX + dx, HOOD_Y - 0.12, HZ1 + 0.055], 0.005, IRON, { sides: 4 });
    rod([FX + dx, HOOD_Y - 0.12, HZ1 + 0.055], [FX + dx, HOOD_Y - 0.135, HZ1 + 0.085], 0.005, IRON, { sides: 4 });
  }
  // a poker and a coal shovel on the outer hooks
  rod([FX - 0.14, HOOD_Y - 0.135, HZ1 + 0.085], [FX - 0.14, HOOD_Y - 0.36, HZ1 + 0.085], 0.0045, IRON_L, { sides: 4 });
  rod([FX - 0.14, HOOD_Y - 0.36, HZ1 + 0.085], [FX - 0.125, HOOD_Y - 0.385, HZ1 + 0.085], 0.0045, IRON_L, { sides: 4 });
  rod([FX + 0.14, HOOD_Y - 0.135, HZ1 + 0.085], [FX + 0.14, HOOD_Y - 0.3, HZ1 + 0.085], 0.006, darkWood, { sides: 4 });
  box(0.06, 0.07, 0.006, IRON, [FX + 0.14, HOOD_Y - 0.34, HZ1 + 0.085], { name: "shovelBlade" });
  // chimney stack (square frustum) with capstone
  cyl(0.135, 0.17, 0.34, 4, slate, [FX, 1.3, -0.4], { rotation: [0, 45, 0], name: "chimney" });
  cyl(0.17, 0.2, 0.03, 4, STONES[2], [FX, 1.477, -0.4], { rotation: [0, 45, 0], name: "chimneyCap" });
  cyl(0.1, 0.12, 0.02, 4, SOOT, [FX, 1.497, -0.4], { rotation: [0, 45, 0], name: "chimneyMouth" });
  // iron straps binding the chimney
  for (const y of [1.2, 1.36]) {
    const side = (0.17 - ((y - 1.13) / 0.34) * 0.035) * Math.SQRT2 + 0.012;
    box(side, 0.018, side, IRON, [FX, y, -0.4], { name: "chimneyBand" });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // BELLOWS: wooden boards on a trestle, leather gussets, a lid that hinges open at the nozzle end.
  // ---------------------------------------------------------------------------------------------------------------
  G = "bellows";
  const BZc = ZC;
  const HXb = -0.14; // hinge x
  const BL = 0.34;
  const BY = 0.5; // board top
  const ANG = 17;
  const lid = b.joint("bellowsLid", {
    parent: root,
    at: [HXb, BY, BZc],
    dir: [1, Math.tan(ANG * DEG), 0],
    role: "hinge",
    group: "bellows",
  });
  const cA = Math.cos(ANG * DEG);
  const sA = Math.sin(ANG * DEG);
  const lidPt = (along: number, up: number, dz = 0): V => [HXb + cA * along - sA * up, BY + sA * along + cA * up, BZc + dz];
  // trestle
  for (const x of [HXb + 0.03, HXb + BL - 0.03])
    for (const z of [BZc - 0.085, BZc + 0.085]) box(0.05, BY - 0.03 - F, 0.05, woodY, [x, (F + BY - 0.03) / 2, z], { name: "trestleLeg" });
  for (const z of [BZc - 0.085, BZc + 0.085]) box(BL - 0.04, 0.03, 0.03, woodX, [HXb + BL / 2, F + 0.12, z], { name: "stretcher" });
  box(0.03, 0.03, 0.17, woodZ, [HXb + 0.03, F + 0.22, BZc], { name: "stretcherEnd" });
  box(0.03, 0.03, 0.17, woodZ, [HXb + BL - 0.03, F + 0.22, BZc], { name: "stretcherEnd" });
  // bottom board and nozzle block
  box(BL + 0.02, 0.03, 0.23, pine, [HXb + BL / 2, BY - 0.015, BZc], { name: "bellowsBoard" });
  box(0.05, 0.065, 0.12, darkWood, [HXb - 0.005, BY + 0.03, BZc], { name: "nozzleBlock" });
  cyl(0.01, 0.034, 0.07, 6, IRON, [HXb - 0.05, BY + 0.045, BZc], { rotation: [0, 0, 90], name: "nozzle" });
  // lid: plate, handle extension, knob
  const lidQ = (extra: V = [0, 0, 0]): Opt => ({ rotation: [extra[0], extra[1], ANG + extra[2]], bone: lid });
  box(BL + 0.02, 0.03, 0.23, pine, lidPt(BL / 2 + 0.01, 0.015), { ...lidQ(), name: "bellowsLid" });
  box(0.12, 0.028, 0.06, pine, lidPt(BL + 0.06, 0.014), { ...lidQ(), name: "bellowsHandle" });
  cyl(0.016, 0.016, 0.085, 6, darkWood, lidPt(BL + 0.085, 0.06), { ...lidQ(), name: "bellowsGrip" });
  part(new THREE.SphereGeometry(0.022, 6, 4), darkWood, lidPt(BL + 0.085, 0.108), { bone: lid, name: "bellowsKnob" });
  // rib boards between the lid and the base give the leather its accordion folds
  for (const f of [1 / 3, 2 / 3]) {
    const a = ANG * f * DEG;
    box(BL * 0.96, 0.012, 0.222, pine, [HXb + Math.cos(a) * BL * 0.48, BY + Math.sin(a) * BL * 0.48 + 0.006, BZc], {
      rotation: [0, 0, ANG * f],
      bone: lid,
      name: "bellowsRib",
    });
  }
  // brass edge bands and nails on the lid
  for (const along of [0.05, BL - 0.02])
    for (const z of [-0.116, 0.116]) box(0.018, 0.034, 0.008, BRASS, lidPt(along, 0.015, z), { ...lidQ(), name: "lidStrap" });
  // leather gussets: a wedge on each side, with four pleats
  for (const s of [1, -1]) {
    const zz = BZc + s * 0.118;
    const tip = lidPt(BL, 0);
    b.extrude(
      [
        [HXb, BY],
        [HXb + BL, BY],
        [tip[0], tip[1]],
      ],
      {
        at: [0, 0, zz],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        color: LEATHER,
        bone: lid,
        group: G,
        name: "gusset",
      },
    );
    for (const t of [0.32, 0.52, 0.72, 0.92]) {
      const lo: V = [HXb + BL * t, BY + 0.002, zz + s * 0.008];
      const hi = lidPt(BL * t, 0.0);
      hi[2] = zz + s * 0.008;
      rod(lo, hi, 0.0055, LEATHER_D, { sides: 4, bone: lid });
    }
  }
  // iron pipe from the nozzle over the hearth rim down into the coals
  tube(
    [
      [HXb - 0.08, BY + 0.045, BZc],
      [-0.2, 0.585, BZc],
      [-0.29, 0.6, BZc],
      [-0.345, 0.565, BZc],
    ],
    0.014,
    IRON,
  );
  // hinge pin
  cyl(0.011, 0.011, 0.26, 6, IRON, [HXb, BY + 0.005, BZc], { rotation: [90, 0, 0], name: "hingePin" });

  // ---------------------------------------------------------------------------------------------------------------
  // ANVIL ON STUMP, with the half-forged sword on it.
  // ---------------------------------------------------------------------------------------------------------------
  G = "anvil";
  const SX = -0.08;
  const SZ = 0.14;
  const STUMP_H = 0.225;
  b.lathe(
    [
      [0, 0],
      [0.19, 0],
      [0.168, 0.04],
      [0.156, 0.1],
      [0.152, 0.2],
      [0.16, STUMP_H],
      [0, STUMP_H],
    ],
    { at: [SX, F - 0.004, SZ], segments: 10, color: barkY, bone: root, group: G, name: "stump" },
  );
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    b.spike([SX + Math.cos(a) * 0.14, F + 0.06, SZ + Math.sin(a) * 0.14], [SX + Math.cos(a) * 0.235, F + 0.004, SZ + Math.sin(a) * 0.235], null, 0.034, {
      color: barkY,
      sides: 5,
      bone: root,
      group: G,
    });
  }
  const RINGS = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#d8b47c"/>
<circle cx="32" cy="32" r="26" fill="none" stroke="#b98c55" stroke-width="3"/><circle cx="32" cy="32" r="19" fill="none" stroke="#b98c55" stroke-width="3"/>
<circle cx="32" cy="32" r="12" fill="none" stroke="#a87a45" stroke-width="3"/><circle cx="32" cy="32" r="5" fill="#8f6030"/>
<path d="M32 32 L58 26" stroke="#8f6030" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  part(new THREE.CircleGeometry(0.158, 10), "#ffffff", [SX, F + STUMP_H - 0.002, SZ], {
    rotation: [-90, 0, 0],
    texture: RINGS,
    name: "stumpTop",
    flat: false,
  });
  // axe nicks into the stump top rim
  for (const a of [40, 130, 210, 300]) {
    box(0.03, 0.012, 0.012, barkY, [SX + Math.cos(a * DEG) * 0.158, F + 0.12 + a / 3000, SZ + Math.sin(a * DEG) * 0.158], {
      rotation: [0, -a, 0],
      name: "stumpNick",
    });
  }

  const AY = F + STUMP_H - 0.002; // anvil foot
  const anvilProfile: OutlinePoint[] = [
    [-0.09, 0],
    [0.09, 0],
    [0.1, 0.022],
    [0.045, 0.042],
    [0.04, 0.088],
    [0.085, 0.1],
    [0.085, 0.125],
    [-0.14, 0.125],
    [-0.14, 0.1],
    [-0.06, 0.088],
    [-0.04, 0.042],
    [-0.1, 0.022],
  ];
  b.extrude(anvilProfile, {
    at: [SX, AY, SZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.11,
    bevel: 0.004,
    color: IRON,
    bone: root,
    group: G,
    name: "anvilBody",
  });
  b.sweep(
    catmull([
      [SX + 0.07, AY + 0.082, SZ],
      [SX + 0.15, AY + 0.092, SZ],
      [SX + 0.25, AY + 0.108, SZ],
    ]),
    [0.043, 0.006],
    { color: IRON, sides: 6, bone: root, group: G, name: "anvilHorn" },
  );
  box(0.23, 0.01, 0.114, STEEL, [SX - 0.0275, AY + 0.13, SZ], { name: "anvilFace" });
  box(0.02, 0.004, 0.02, SOOT, [SX - 0.1, AY + 0.135, SZ], { name: "hardyHole" });
  cyl(0.009, 0.009, 0.004, 6, SOOT, [SX - 0.055, AY + 0.135, SZ + 0.02], { name: "pritchel" });

  // the sword: cool tang, then a blade that glows hotter toward its tip
  {
    const yaw = 7;
    const sy = AY + 0.135 + 0.006;
    const x0 = SX - 0.135;
    const segs: { a: number; b: number; wa: number; wb: number; color: string; g: number }[] = [
      { a: 0, b: 0.075, wa: 0.014, wb: 0.014, color: "#596068", g: 0 },
      { a: 0.075, b: 0.135, wa: 0.052, wb: 0.05, color: "#7d2a16", g: 0.6 },
      { a: 0.135, b: 0.2, wa: 0.05, wb: 0.045, color: "#d8401a", g: 1.0 },
      { a: 0.2, b: 0.26, wa: 0.045, wb: 0.037, color: "#ff6e1c", g: 1.25 },
      { a: 0.26, b: 0.315, wa: 0.037, wb: 0.026, color: "#ffa02a", g: 1.5 },
      { a: 0.315, b: 0.36, wa: 0.026, wb: 0.008, color: "#ffd64e", g: 1.8 },
    ];
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw * DEG);
    const toW = (x: number, z: number): V => {
      const v = new THREE.Vector3(x, 0, z).applyQuaternion(q);
      return [x0 + v.x, sy, SZ + v.z];
    };
    for (const s of segs) {
      const k = s.a === 0 ? 1 : 1.35;
      const pts: OutlinePoint[] = [
        [s.a, (-s.wa * k) / 2],
        [s.b, (-s.wb * k) / 2],
        [s.b, (s.wb * k) / 2],
        [s.a, (s.wa * k) / 2],
      ];
      const org = toW(0, 0);
      const dir = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
      const wid = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
      const ex = b.extrude(pts, {
        at: org,
        x: [dir.x, 0, dir.z],
        y: [wid.x, 0, wid.z],
        thickness: s.a === 0 ? 0.008 : 0.011,
        bevel: 0.002,
        color: s.color,
        bone: root,
        group: "sword",
        name: "sword",
      });
      if (s.g > 0) glow(ex, s.g);
    }
    // glowing fuller down the middle of the blade
    const a = toW(0.11, 0);
    const c = toW(0.31, 0);
    glow(
      b.rod([a[0], a[1] + 0.006, a[2]], [c[0], c[1] + 0.006, c[2]], [0.004, 0.002], {
        color: "#fff0a0",
        sides: 4,
        bone: root,
        group: "sword",
        name: "fuller",
      }),
      2,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Tongs and hammers, used on the anvil, the floor and the rack.
  // ---------------------------------------------------------------------------------------------------------------
  const xform = (pos: V, rot: V) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG));
    const m = new THREE.Matrix4().compose(new THREE.Vector3(...pos), q, new THREE.Vector3(1, 1, 1));
    const w = (p: V): V => {
      const v = new THREE.Vector3(...p).applyMatrix4(m);
      return [v.x, v.y, v.z];
    };
    const local = (e: V, order: THREE.EulerOrder = "XYZ") =>
      q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0] * DEG, e[1] * DEG, e[2] * DEG, order)));
    return { q, w, local };
  };
  const tongs = (pos: V, rot: V, spread = 1) => {
    const t = xform(pos, rot);
    for (const s of [1, -1]) {
      const z = 0.0065 * s;
      tube(
        [t.w([0.052 * s * spread, -0.17, z]), t.w([0.018 * s * spread, -0.06, z]), t.w([0, 0, z]), t.w([-0.012 * s, 0.06, z]), t.w([-0.007 * s, 0.135, z])],
        [0.0075, 0.0055],
        IRON,
        5,
      );
      part(new THREE.SphereGeometry(0.009, 5, 4), IRON_L, t.w([0.055 * s * spread, -0.172, z]), { name: "tongGrip" });
    }
    part(new THREE.CylinderGeometry(0.009, 0.009, 0.026, 6), IRON_L, t.w([0, 0, 0]), { quat: t.local([90, 0, 0]), name: "tongRivet" });
  };
  const hammer = (pos: V, rot: V, kind: "cross" | "sledge") => {
    const t = xform(pos, rot);
    const hl = kind === "sledge" ? 0.3 : 0.27;
    b.rod(t.w([0, 0, 0]), t.w([0, hl, 0]), [0.013, 0.01], { color: woodY, sides: 5, bone: root, group: G, name: "hammerHandle" });
    if (kind === "sledge") {
      part(new THREE.BoxGeometry(0.1, 0.05, 0.05), IRON, t.w([0, hl, 0]), { quat: t.local([0, 0, 0]), name: "hammerHead" });
      for (const s of [1, -1]) part(new THREE.BoxGeometry(0.012, 0.054, 0.054), IRON_L, t.w([s * 0.05, hl, 0]), { quat: t.local([0, 0, 0]), name: "hammerFace" });
    } else {
      part(new THREE.BoxGeometry(0.07, 0.034, 0.034), IRON, t.w([0.008, hl, 0]), { quat: t.local([0, 0, 0]), name: "hammerHead" });
      part(new THREE.BoxGeometry(0.01, 0.038, 0.038), IRON_L, t.w([0.046, hl, 0]), { quat: t.local([0, 0, 0]), name: "hammerFace" });
      part(new THREE.CylinderGeometry(0.004, 0.017, 0.045, 4), IRON, t.w([-0.05, hl, 0]), { quat: t.local([0, 45, 90], "ZYX"), name: "hammerPeen" });
    }
  };
  const hangRing = (p: V) => part(new THREE.TorusGeometry(0.013, 0.0035, 4, 8), LEATHER_D, p, { name: "hangLoop" });

  // tongs resting on the anvil, and a hammer lying on the floor by the stump
  tongs([0.13, F + 0.0075, 0.3], [90, 0, -55]);
  hammer([-0.02, F + 0.017, 0.42], [90, 0, -78], "cross");

  // sparks and scale on the floor around the anvil
  {
    const sp: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const a = R() * Math.PI * 2;
      const d = 0.14 + R() * 0.2;
      const g = new THREE.IcosahedronGeometry(0.004 + R() * 0.004, 0);
      g.translate(SX + Math.cos(a) * d, F + 0.005, SZ + Math.sin(a) * d * 0.8);
      sp.push(g);
    }
    for (let i = 0; i < 5; i++) {
      const g = new THREE.IcosahedronGeometry(0.004, 0);
      g.translate(SX - 0.12 + R() * 0.3, AY + 0.146, SZ + (R() - 0.5) * 0.1);
      sp.push(g);
    }
    glow(b.part(mergeGeometries(sp), "#ffcf5a", { bone: root, at: [0, 0, 0], group: "sword", name: "sparks", flat: true }), 2);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // QUENCH BARREL.
  // ---------------------------------------------------------------------------------------------------------------
  G = "barrel";
  const QX = 0.38;
  const QZ = 0.14;
  const barrelProfile: [number, number][] = [
    [0, 0],
    [0.105, 0],
    [0.125, 0.05],
    [0.136, 0.16],
    [0.125, 0.28],
    [0.108, 0.36],
    [0.092, 0.36],
    [0.098, 0.3],
    [0, 0.3],
  ];
  const barrelR = (y: number) => {
    for (let i = 0; i < 4; i++) {
      const [r0, y0] = [barrelProfile[i + 1][0], barrelProfile[i + 1][1]];
      const [r1, y1] = [barrelProfile[i + 2][0], barrelProfile[i + 2][1]];
      if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return 0.12;
  };
  const staves = paint((_p, _n, s) => (((s[1] % 30) + 30) % 30 < 2.6 ? "#3e2716" : "#a06a3c"));
  b.lathe(barrelProfile, { at: [QX, F - 0.004, QZ], segments: 12, color: cel(staves, "#5f3a1e"), bone: root, group: G, name: "barrel" });
  for (const y0 of [0.035, 0.15, 0.27]) {
    const r = barrelR(y0 + 0.011);
    b.lathe(
      [
        [r - 0.004, y0],
        [r + 0.008, y0],
        [r + 0.008, y0 + 0.024],
        [r - 0.004, y0 + 0.024],
      ],
      { at: [QX, F - 0.004, QZ], segments: 12, color: IRON, bone: root, group: G, name: "hoop" },
    );
  }
  cyl(0.097, 0.097, 0.006, 12, "#4cb4c4", [QX, F + 0.322, QZ], { name: "water", flat: false });
  // a dipper: the cup in the water, the handle hooked over the rim
  rod([QX - 0.03, F + 0.34, QZ + 0.02], [QX + 0.2, F + 0.43, QZ + 0.07], 0.009, darkWood, { sides: 5 });
  cyl(0.03, 0.022, 0.03, 7, IRON_L, [QX - 0.03, F + 0.338, QZ + 0.02], { name: "dipperCup" });

  // ---------------------------------------------------------------------------------------------------------------
  // WORKBENCH with vise, bars, horseshoes and a lantern; tool rack behind it.
  // ---------------------------------------------------------------------------------------------------------------
  G = "bench";
  const WX0 = 0.34;
  const WX1 = 0.7;
  const WZ0 = -0.46;
  const WZ1 = -0.16;
  const BT = 0.44; // bench top
  const WXc = (WX0 + WX1) / 2;
  const WZc = (WZ0 + WZ1) / 2;
  for (const i of [0, 1]) {
    box(WX1 - WX0, 0.04, (WZ1 - WZ0) / 2 - 0.004, woodX, [WXc, BT - 0.02, WZ0 + (i + 0.5) * ((WZ1 - WZ0) / 2)], { name: "benchPlank" });
  }
  for (const x of [WX0 + 0.035, WX1 - 0.035])
    for (const z of [WZ0 + 0.035, WZ1 - 0.035]) box(0.05, BT - 0.04 - F, 0.05, woodY, [x, (F + BT - 0.04) / 2, z], { name: "benchLeg" });
  for (const z of [WZ0 + 0.035, WZ1 - 0.035]) box(WX1 - WX0 - 0.08, 0.035, 0.025, woodX, [WXc, BT - 0.075, z], { name: "benchApron" });
  for (const x of [WX0 + 0.035, WX1 - 0.035]) box(0.025, 0.035, WZ1 - WZ0 - 0.08, woodZ, [x, BT - 0.075, WZc], { name: "benchApron" });
  box(WX1 - WX0 - 0.06, 0.025, WZ1 - WZ0 - 0.06, woodX, [WXc, F + 0.12, WZc], { name: "benchShelf" });
  // bucket of water-worn tools on the shelf
  for (let i = 0; i < 3; i++) box(0.11, 0.03, 0.012, IRON, [WXc - 0.02, F + 0.15 + i * 0.001, WZc - 0.06 + i * 0.06], { name: "shelfBar" });
  // vise
  box(0.06, 0.07, 0.09, IRON, [WX0 + 0.02, BT + 0.035, -0.22], { name: "viseBody" });
  box(0.012, 0.06, 0.085, IRON_L, [WX0 + 0.058, BT + 0.045, -0.22], { name: "viseJaw" });
  rod([WX0 + 0.06, BT + 0.035, -0.22], [WX0 + 0.13, BT + 0.035, -0.22], 0.005, IRON_L, { sides: 4 });
  rod([WX0 + 0.13, BT + 0.035, -0.255], [WX0 + 0.13, BT + 0.035, -0.185], 0.005, IRON_L, { sides: 4 });
  // iron bars
  for (let i = 0; i < 3; i++) box(0.17, 0.02, 0.03, cel(["#6b7480", "#5a636d", "#7a838e"][i]), [0.47 + (i % 2) * 0.01, BT + 0.01 + i * 0.02, -0.4 + (i % 2) * 0.01], { name: "ironBar" });
  // a small hammer lying across the bench
  hammer([0.69, BT + 0.017, -0.25], [-90, 0, 78], "cross");

  // lantern
  G = "lantern";
  {
    const LX = 0.6;
    const LZ = -0.37;
    const LY = BT;
    box(0.085, 0.012, 0.085, IRON, [LX, LY + 0.006, LZ], { name: "lanternBase" });
    for (const dx of [-1, 1])
      for (const dz of [-1, 1]) box(0.008, 0.11, 0.008, IRON, [LX + dx * 0.034, LY + 0.067, LZ + dz * 0.034], { name: "lanternPost" });
    glow(box(0.06, 0.098, 0.06, "#ffc45a", [LX, LY + 0.061, LZ], { name: "lanternGlass" }), 1.6);
    glow(box(0.032, 0.05, 0.032, "#fff2b0", [LX, LY + 0.062, LZ], { name: "lanternFlame" }), 2.2);
    box(0.092, 0.012, 0.092, IRON, [LX, LY + 0.122, LZ], { name: "lanternTop" });
    cyl(0.012, 0.062, 0.05, 4, IRON, [LX, LY + 0.153, LZ], { rotation: [0, 45, 0], name: "lanternCap" });
    part(new THREE.TorusGeometry(0.02, 0.0035, 4, 8, Math.PI), IRON_L, [LX, LY + 0.168, LZ], { name: "lanternBail" });
  }

  // horseshoes
  G = "horseshoes";
  const shoe = (gapDeg: number, ro = 0.048, ri = 0.03): OutlinePoint[] => {
    const pts: OutlinePoint[] = [];
    const n = 7;
    const g0 = gapDeg / 2;
    for (let i = 0; i <= n; i++) {
      const a = (g0 + ((360 - gapDeg) * i) / n) * DEG;
      pts.push([-Math.sin(a) * ro, Math.cos(a) * ro * 1.05]);
    }
    for (let i = n; i >= 0; i--) {
      const a = (g0 + ((360 - gapDeg) * i) / n) * DEG;
      const k = 1 - 0.14 * Math.sin((i / n) * Math.PI); // arms wider at the heels
      pts.push([-Math.sin(a) * ri * (k + 0.1), Math.cos(a) * ri * (k + 0.1) * 1.05]);
    }
    return pts;
  };
  const flatShoe = (x: number, y: number, z: number, yaw: number, scale = 1) =>
    b.extrude(shoe(74).map(([px, py]) => [px * scale * Math.cos(yaw * DEG) - py * scale * Math.sin(yaw * DEG), px * scale * Math.sin(yaw * DEG) + py * scale * Math.cos(yaw * DEG)] as OutlinePoint), {
      at: [x, y, z],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.012,
      bevel: 0.0025,
      detail: 0.34,
      color: IRON_L,
      bone: root,
      group: G,
      name: "horseshoe",
    });
  flatShoe(0.52, BT + 0.006, -0.2, 20);
  flatShoe(0.535, BT + 0.018, -0.205, 150);
  flatShoe(0.52, BT + 0.03, -0.198, 265);
  flatShoe(0.26, F + 0.008, 0.36, 35);
  flatShoe(0.14, F + 0.008, 0.46, 200);
  flatShoe(0.56, F + 0.008, 0.06, 100);

  // tool rack
  G = "rack";
  const RZ = -0.5;
  const RY0 = 0.62;
  const RY1 = 0.98;
  const POST_TOP = 1.35; // the right post carries the shop sign's arm
  for (const x of [WX0 + 0.01, WX1 - 0.01]) {
    const top = x > WXc ? POST_TOP : RY1 + 0.02;
    box(0.05, top - F, 0.05, woodY, [x, (F + top) / 2, RZ], { name: "rackPost" });
  }
  box(WX1 - WX0, RY1 - RY0, 0.03, woodX, [WXc, (RY0 + RY1) / 2, RZ + 0.004], { name: "rackBoard" });
  box(WX1 - WX0 + 0.06, 0.04, 0.05, darkWood, [WXc, RY1 + 0.02, RZ], { name: "rackCap" });
  box(WX1 - WX0 - 0.03, 0.03, 0.02, darkWood, [WXc, RY0 - 0.005, RZ + 0.004], { name: "rackBottomRail" });
  const pegs = [0.385, 0.45, 0.525, 0.6, 0.665];
  const PY = 0.9;
  for (const x of pegs) cyl(0.008, 0.008, 0.06, 5, IRON, [x, PY, RZ + 0.05], { rotation: [90, 0, 0], name: "peg" });
  const HZp = RZ + 0.06;
  hangRing([pegs[0], PY - 0.012, HZp]);
  tongs([pegs[0], PY - 0.16, HZp], [0, 0, 180]);
  hangRing([pegs[1], PY - 0.012, HZp]);
  hammer([pegs[1], PY - 0.275, HZp], [0, 0, 180], "cross");
  hangRing([pegs[2], PY - 0.012, HZp]);
  hammer([pegs[2], PY - 0.285, HZp], [0, 0, 180], "sledge");
  hangRing([pegs[3], PY - 0.012, HZp]);
  tongs([pegs[3], PY - 0.16, HZp], [0, 0, 180], 0.75);
  for (let i = 0; i < 3; i++) {
    // hung toe-up by the inside of the toe, open end down
    b.extrude(
      shoe(74, 0.046, 0.029).map(([px, py]) => [-px, -py] as OutlinePoint),
      {
        at: [pegs[4], PY - 0.032, HZp + (i - 1) * 0.012],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.011,
        bevel: 0.0025,
        detail: 0.34,
        color: IRON_L,
        bone: root,
        group: G,
        name: "horseshoe",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // FIREWOOD PILE.
  // ---------------------------------------------------------------------------------------------------------------
  G = "firewood";
  {
    const PX = -0.52;
    const PZ = 0.34;
    const len = 0.27;
    const layout: [number, number][] = [
      [0, 4],
      [1, 3],
      [2, 2],
    ];
    const r0 = 0.038;
    for (const [row, count] of layout) {
      for (let i = 0; i < count; i++) {
        const r = r0 * (0.9 + R() * 0.2);
        const x = PX + (i - (count - 1) / 2) * r0 * 2.02 + (R() - 0.5) * 0.004;
        const y = F + r0 * (1 + row * 1.75) - (row === 0 ? 0 : 0.002);
        const l = len * (0.9 + R() * 0.12);
        const z = PZ + (R() - 0.5) * 0.02;
        part(new THREE.CylinderGeometry(r, r, l, 8, 1, true), barkZ, [x, y, z], { rotation: [90, 0, 0], name: "log", flat: false });
        part(new THREE.CircleGeometry(r * 0.97, 8), "#ffffff", [x, y, z + l / 2 + 0.001], { texture: RINGS, name: "logEnd", flat: false });
        part(new THREE.CircleGeometry(r * 0.97, 8), "#ffffff", [x, y, z - l / 2 - 0.001], { rotation: [0, 180, 0], texture: RINGS, name: "logEnd", flat: false });
      }
    }
    // stakes holding the stack
    for (const dx of [-0.16, 0.16]) {
      box(0.04, 0.2, 0.04, woodY, [PX + dx, F + 0.1, PZ + 0.02], { name: "stake" });
      cyl(0.0, 0.028, 0.03, 4, woodY, [PX + dx, F + 0.215, PZ + 0.02], { rotation: [0, 45, 0], name: "stakeTip" });
    }
    // a split log and kindling on the ground beside the pile
    box(0.1, 0.03, 0.05, woodX, [PX + 0.26, F + 0.015, PZ + 0.1], { rotation: [0, 20, 0], name: "kindling" });
    box(0.09, 0.03, 0.04, woodX, [PX + 0.24, F + 0.04, PZ + 0.098], { rotation: [0, -14, 0], name: "kindling" });
    // a sack of charcoal with its mouth rolled open and heaped with coals
    b.lathe(
      [
        [0, 0],
        [0.075, 0],
        [0.098, 0.045],
        [0.1, 0.1],
        [0.085, 0.15],
        [0.078, 0.17],
        [0.092, 0.185],
        [0.07, 0.195],
        [0, 0.185],
      ],
      { at: [-0.6, F - 0.002, 0.03], segments: 8, color: ROPE, bone: root, group: G, name: "sack" },
    );
    cyl(0.082, 0.082, 0.012, 8, LEATHER_D, [-0.6, F + 0.15, 0.03], { name: "sackTie" });
    {
      const heap: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 7; i++) {
        const g = new THREE.IcosahedronGeometry(0.02 + R() * 0.012, 0);
        const a = R() * Math.PI * 2;
        g.translate(-0.6 + Math.cos(a) * 0.035, F + 0.2 + R() * 0.02, 0.03 + Math.sin(a) * 0.035);
        heap.push(g);
      }
      b.part(mergeGeometries(heap), "#2d2622", { bone: root, at: [0, 0, 0], group: G, name: "sackCoal", flat: true });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // GRINDSTONE in a water trough, front right.
  // ---------------------------------------------------------------------------------------------------------------
  G = "grindstone";
  {
    const GX = 0.56;
    const GZ = 0.4;
    const GY = F + 0.158;
    const GRIT = cel("#b7b09f", "#8c8676");
    part(new THREE.CylinderGeometry(0.105, 0.105, 0.055, 14), GRIT, [GX, GY, GZ], { rotation: [0, 0, 90], name: "grindWheel" });
    rod([GX - 0.1, GY, GZ], [GX + 0.15, GY, GZ], 0.008, IRON, { sides: 5 });
    for (const s of [-1, 1]) {
      for (const dz of [-0.1, 0.1]) rod([GX + s * 0.055, F, GZ + dz], [GX + s * 0.055, GY, GZ], 0.015, woodY, { sides: 4 });
      box(0.03, 0.02, 0.06, woodX, [GX + s * 0.055, F + 0.01, GZ], { name: "grindFoot" });
    }
    box(0.15, 0.05, 0.14, darkWood, [GX, F + 0.025, GZ], { name: "grindTrough" });
    box(0.12, 0.004, 0.11, "#4cb4c4", [GX, F + 0.0515, GZ], { name: "grindWater" });
    cyl(0.055, 0.055, 0.012, 10, woodZ, [GX + 0.13, GY, GZ], { rotation: [0, 0, 90], name: "grindHandwheel" });
    cyl(0.009, 0.009, 0.04, 5, darkWood, [GX + 0.145, GY + 0.04, GZ], { rotation: [0, 0, 90], name: "grindHandle" });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // SHOP SIGN: a wrought-iron arm off the rack's tall post, and a painted board that swings on two chains.
  // ---------------------------------------------------------------------------------------------------------------
  G = "sign";
  const PXs = WX1 - 0.01;
  const PZs = RZ;
  const ARM_Y = 1.26;
  const SGX = 0.15;
  box(0.075, 0.03, 0.075, darkWood, [PXs, POST_TOP + 0.015, PZs], { name: "signCap" });
  cyl(0.0, 0.05, 0.05, 4, darkWood, [PXs, POST_TOP + 0.055, PZs], { rotation: [0, 45, 0], name: "signFinial" });
  rod([PXs, ARM_Y, PZs], [SGX - 0.16, ARM_Y, PZs], 0.012, IRON, { sides: 4 });
  tube(
    [
      [PXs, ARM_Y - 0.3, PZs],
      [PXs - 0.08, ARM_Y - 0.25, PZs],
      [PXs - 0.2, ARM_Y - 0.12, PZs],
      [PXs - 0.28, ARM_Y - 0.012, PZs],
    ],
    0.007,
    IRON,
  );
  // scroll at the arm's tip
  {
    const pts: V[] = [];
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI / 2 + (i / 10) * Math.PI * 1.6;
      const rr = 0.032 * (1 - i / 14);
      pts.push([SGX - 0.16 + Math.cos(a) * rr, ARM_Y - 0.032 + Math.sin(a) * rr, PZs]);
    }
    tube(pts, 0.005, IRON, 4);
  }
  const signJ = b.joint("signHinge", { parent: root, at: [SGX, ARM_Y, PZs], dir: [0, -1, 0], role: "hinge", group: "sign" });
  for (const dx of [-0.105, 0.105]) {
    rod([SGX + dx, ARM_Y, PZs], [SGX + dx, ARM_Y - 0.075, PZs], 0.0045, IRON, { sides: 4, bone: signJ });
    part(new THREE.TorusGeometry(0.012, 0.003, 4, 8), IRON_L, [SGX + dx, ARM_Y + 0.003, PZs], { bone: signJ, rotation: [0, 90, 0], name: "signRing" });
  }
  const SW = 0.3;
  const SH = 0.19;
  const SY = ARM_Y - 0.072 - SH / 2;
  const signOutline: OutlinePoint[] = [
    [-SW / 2, SH / 2],
    [SW / 2, SH / 2],
    [SW / 2, -SH / 2 + 0.03],
    [SW / 2 - 0.03, -SH / 2],
    [-SW / 2 + 0.03, -SH / 2],
    [-SW / 2, -SH / 2 + 0.03],
  ];
  b.extrude(signOutline, {
    at: [SGX, SY, PZs],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.026,
    bevel: 0.005,
    color: darkWood,
    bone: signJ,
    group: G,
    name: "signBoard",
  });
  const SIGN_ART = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 90">
<rect x="0" y="0" width="150" height="90" rx="10" fill="#2f4c6b"/>
<rect x="6" y="6" width="138" height="78" rx="7" fill="none" stroke="#e9cf8e" stroke-width="4"/>
<polygon points="34,50 98,50 122,44 98,58 88,62 88,70 104,76 104,82 46,82 46,76 62,70 62,62 48,58 34,58" fill="#e8c98a"/>
<g transform="rotate(32 92 26)"><rect x="78" y="14" width="30" height="16" rx="2" fill="#d5dde3"/><rect x="88" y="28" width="10" height="30" fill="#c98b4c"/></g>
<circle cx="52" cy="36" r="3" fill="#ff9a26"/><circle cx="42" cy="30" r="2" fill="#ffc94a"/><circle cx="60" cy="26" r="2.2" fill="#ff7b1c"/><circle cx="34" cy="40" r="1.6" fill="#ffd24a"/>
</svg>`,
    { size: 384 },
  );
  for (const s of [1, -1])
    part(new THREE.PlaneGeometry(SW - 0.03, SH - 0.03), "#ffffff", [SGX, SY, PZs + s * 0.0145], {
      bone: signJ,
      rotation: [0, s === 1 ? 0 : 180, 0],
      texture: SIGN_ART,
      name: "signArt",
      flat: false,
    });

  return b.root;
}
