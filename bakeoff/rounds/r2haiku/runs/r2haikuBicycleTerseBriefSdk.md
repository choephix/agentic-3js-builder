```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

// Palette
const FRAME = "#2f6b55"; // deep racing green
const CREAM = "#efe6cf"; // pinstripes, whitewalls, badge
const TYRE = "#1f1f1f";
const CHROME = "#c8ccd2";
const DARK = "#8a9098"; // chainring, hubs
const LEATHER = "#7b4b2a";
const CHAIN = "#3a3a3a";
const PEDAL = "#2a2a2a";

// Wheel geometry (metres). Tyre bottom sits exactly on y = 0.
const R = 0.33; // wheel radius to tyre centreline
const TUBE = 0.02; // tyre cross-section radius
const CY = R + TUBE; // wheel centre height, 0.35
const REAR_Z = -0.52;
const FRONT_Z = 0.52;

const mirror = (p: number[]) => [-p[0], p[1], p[2]];

export default function build() {
  const b = createBuilder({ name: "vintage-bicycle" });
  b.joint("frame", { at: [0, CY, 0] });

  const tube = (pts: number[][], r: number, color: string) =>
    b.sweep(pts, r, { color });
  const both = (fn: (s: number) => void) => {
    fn(1);
    fn(-1);
  };

  // ---------- Wheels ----------
  const wheel = (cz: number) => {
    // Tyre, with cream whitewalls on both sides
    const tyre = new THREE.TorusGeometry(R, TUBE, 10, 56);
    tyre.rotateY(Math.PI / 2);
    b.part(tyre, TYRE, { at: [0, CY, cz] });

    both((s) => {
      const wall = new THREE.TorusGeometry(R, 0.008, 6, 56);
      wall.rotateY(Math.PI / 2);
      b.part(wall, CREAM, { at: [s * 0.017, CY, cz] });
    });

    // Chrome rim
    const rim = new THREE.TorusGeometry(R - 0.03, 0.006, 6, 56);
    rim.rotateY(Math.PI / 2);
    b.part(rim, CHROME, { at: [0, CY, cz] });

    // Hub
    const hub = new THREE.CylinderGeometry(0.03, 0.03, 0.09, 12);
    hub.rotateZ(Math.PI / 2);
    b.part(hub, DARK, { at: [0, CY, cz] });

    // Spokes, alternating flanges
    const n = 16;
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const s = i % 2 === 0 ? 1 : -1;
      const rr = R - 0.03;
      tube(
        [
          [s * 0.025, CY, cz],
          [0, CY + rr * Math.sin(t), cz + rr * Math.cos(t)],
        ],
        0.003,
        CHROME,
      );
    }
  };
  wheel(REAR_Z);
  wheel(FRONT_Z);

  // ---------- Frame ----------
  const BB: number[] = [0, 0.31, -0.08];
  const ST: number[] = [0, 0.92, -0.26];
  const HT: number[] = [0, 0.98, 0.34];
  const HB: number[] = [0, 0.86, 0.36];

  // Top tube with cream pinstripe
  tube([[0, 0.88, -0.25], [0, 0.97, 0.34]], 0.024, FRAME);
  tube([[0, 0.9, -0.24], [0, 0.99, 0.33]], 0.005, CREAM);

  // Down tube
  tube([[0, 0.84, 0.36], BB], 0.026, FRAME);

  // Seat tube
  tube([BB, ST], 0.02, FRAME);

  // Head tube
  tube([HB, HT], 0.026, FRAME);

  // Chainstays and seatstays
  both((s) => {
    tube([[s * 0.04, 0.31, -0.08], [s * 0.04, CY, REAR_Z]], 0.013, FRAME);
    tube([[s * 0.03, 0.86, -0.24], [s * 0.04, CY, REAR_Z]], 0.011, FRAME);
  });

  // Fork blades and crown
  both((s) => {
    tube([[s * 0.04, 0.8, 0.36], [s * 0.045, CY, FRONT_Z]], 0.013, FRAME);
  });
  tube([[-0.05, 0.86, 0.36], [0.05, 0.86, 0.36]], 0.02, FRAME);

  // Seat post, saddle
  tube([ST, [0, 1.0, -0.28]], 0.014, CHROME);
  const saddle = new THREE.SphereGeometry(0.1, 16, 10);
  saddle.scale(0.9, 0.3, 1.6);
  b.part(saddle, LEATHER, { at: [0, 1.03, -0.3] });

  // Stem and drop handlebars
  tube([HT, [0, 1.04, 0.38]], 0.016, CHROME);
  const leftBar = [
    [0, 1.04, 0.38],
    [0.1, 1.07, 0.4],
    [0.19, 1.08, 0.42],
    [0.22, 1.04, 0.46],
    [0.2, 0.98, 0.5],
    [0.16, 0.95, 0.53],
  ];
  const bar = [
    ...leftBar.map(mirror).reverse(),
    ...leftBar.slice(1),
  ];
  tube(bar, 0.012, CREAM);

  // Headlamp on the fork crown, with a chrome bezel
  const lamp = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16);
  lamp.rotateX(Math.PI / 2);
  b.part(lamp, CHROME, { at: [0, 0.9, 0.46] });
  const lens = new THREE.CylinderGeometry(0.04, 0.04, 0.01, 16);
  lens.rotateX(Math.PI / 2);
  b.part(lens, CREAM, { at: [0, 0.9, 0.49] });

  // Head badge
  const badge = new THREE.CylinderGeometry(0.04, 0.04, 0.012, 20);
  badge.rotateX(Math.PI / 2);
  b.part(badge, CREAM, { at: [0, 0.93, 0.375] });

  // ---------- Drivetrain ----------
  // Chainring on the drive side, with pedal cranks
  const ring = new THREE.CylinderGeometry(0.095, 0.095, 0.006, 24);
  ring.rotateZ(Math.PI / 2);
  b.part(ring, DARK, { at: [-0.07, BB[1], BB[2]] });

  tube([[0.08, BB[1], BB[2]], [0.08, 0.14, -0.08]], 0.012, CHROME);
  tube([[-0.08, BB[1], BB[2]], [-0.08, 0.48, -0.1]], 0.012, CHROME);
  both((s) => {
    const pedal = new THREE.BoxGeometry(0.1, 0.02, 0.05);
    const tip = s > 0 ? [0.08, 0.14, -0.08] : [-0.08, 0.48, -0.1];
    b.part(pedal, PEDAL, { at: [tip[0] + s * 0.02, tip[1], tip[2]] });
  });

  // Rear cog
  const cog = new THREE.CylinderGeometry(0.05, 0.05, 0.01, 16);
  cog.rotateZ(Math.PI / 2);
  b.part(cog, DARK, { at: [-0.05, CY, REAR_Z] });

  // Chain, top and bottom runs
  tube([[-0.06, 0.405, -0.08], [-0.06, 0.4, REAR_Z]], 0.006, CHAIN);
  tube([[-0.06, 0.215, -0.08], [-0.06, 0.3, REAR_Z]], 0.006, CHAIN);

  // ---------- Mudguards and rack ----------
  const fender = (cz: number) => {
    const rf = R + 0.06;
    const pts: number[][] = [];
    for (let i = 0; i <= 6; i++) {
      const a = Math.PI * (0.22 + (0.56 * i) / 6);
      pts.push([0, CY + rf * Math.sin(a), cz + rf * Math.cos(a)]);
    }
    tube(pts, 0.011, CREAM);
  };
  fender(REAR_Z);
  fender(FRONT_Z);

  // Rear rack over the rear wheel
  const rack = new THREE.BoxGeometry(0.14, 0.012, 0.22);
  b.part(rack, CHROME, { at: [0, 0.76, -0.54] });

  return b.root;
}

export const meta = {
  name: "Vintage bicycle",
  description:
    "A 1950s-style roadster in racing green with cream whitewall tyres, pinstripes, chrome fittings, drop bars, leather saddle and a rear rack.",
};
```