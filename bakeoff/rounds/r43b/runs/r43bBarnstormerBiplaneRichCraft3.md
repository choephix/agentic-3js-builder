```ts
import * as THREE from "three";
import { createBuilder, paint, rgb, svg, noise, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Barnstormer Biplane",
  description: "A chubby, candy-striped whimsical barnstorming biplane with a goggled pilot, a teddy passenger, bunting and streamers.",
};

const RED = "#d8402e", CREAM = "#fff1cf", TEAL = "#2aa7a0", WOOD = "#b4783c", DARK = "#2b2b33";
const COPPER = "#c8793a", LEATHER = "#6b4226", SKIN = "#f2c19c", AMBER = "#ffbf3c", STEEL = "#8d94a6";

const shade = (hex: string, k: number): [number, number, number] => {
  const c = rgb(hex);
  return [Math.min(c[0] * k, 1), Math.min(c[1] * k, 1), Math.min(c[2] * k, 1)];
};
const light = (n: THREE.Vector3) => 0.86 + 0.14 * n.y;

export default function build() {
  const b = createBuilder({ name: "biplane" });
  const body = b.joint("body", { at: [0, 1.5, 0.3] });
  const propJ = b.joint("prop", { parent: body, at: [0, 1.5, 2.1], dir: [0, 0, 1], role: "hinge" });
  const rudderJ = b.joint("rudder", { parent: body, at: [0, 1.6, -2.7], dir: [0, 1, 0], role: "hinge" });
  const elevJ: Record<string, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1])
    elevJ[s > 0 ? "L" : "R"] = b.joint(s > 0 ? "elevatorL" : "elevatorR", {
      parent: body, at: [s * 0.05, 1.62, -2.78], dir: [s, 0, 0], role: "hinge",
    });

  const P = (g: THREE.BufferGeometry, color: any, o: any = {}) => b.part(g, color, { bone: body, ...o });

  // ---------- fuselage ----------
  const fusePaint = paint((p, n) => {
    let c = RED;
    if (n.y < -0.3) c = CREAM;
    if (p.z > -2.15 && p.z < -1.8) c = TEAL;
    if (p.z < -2.55) c = TEAL;
    const k = light(n) * (0.97 + 0.06 * noise(p, 0.3, 4));
    return shade(c, k);
  });
  const fus = b.loft(
    [
      { at: [0, 1.58, -3.1], w: 0.1, h: 0.18 },
      { at: [0, 1.58, -2.4], w: 0.3, h: 0.45 },
      { at: [0, 1.55, -1.3], w: 0.62, h: 0.82 },
      { at: [0, 1.5, -0.2], w: 0.9, h: 1.0 },
      { at: [0, 1.5, 0.8], w: 0.98, h: 1.02 },
      { at: [0, 1.5, 1.4], w: 0.96, h: 1.0 },
    ],
    { color: fusePaint, bone: body },
  );
  for (const s of [1, -1])
    b.decal(
      fus,
      svg(
        `<svg viewBox="0 0 300 90"><text x="150" y="62" text-anchor="middle" font-family="serif" font-weight="bold" font-style="italic" font-size="58" fill="#fff1cf" stroke="#22112f" stroke-width="7" paint-order="stroke">Lucky Lou</text><polygon points="20,45 28,30 36,45 52,48 40,58 44,74 28,66 12,74 16,58 4,48" fill="#ffbf3c" stroke="#22112f" stroke-width="3"/></svg>`,
        { size: 512 },
      ),
      { at: [s * 0.5, 1.6, -0.75], dir: [s, 0, 0], size: [1.5, 0.45], bone: body },
    );

  // ---------- cowl & engine ----------
  const cowlPaint = paint((p, n) => {
    const t = smoothstep(0.2, 0.9, noise(p, 0.15, 7));
    const c: [number, number, number] = [0.78 + 0.1 * t, 0.47 + 0.08 * t, 0.23];
    const k = 0.8 + 0.3 * Math.max(n.y, 0);
    return [Math.min(c[0] * k, 1), Math.min(c[1] * k, 1), Math.min(c[2] * k, 1)];
  });
  b.lathe(
    [[0, 0], [0.58, 0], [0.62, 0.15], [0.62, 0.7], [0.54, 0.95], [0.3, 1.02], [0, 1.02]],
    { at: [0, 1.5, 1.05], axis: [0, 0, 1], segments: 14, color: cowlPaint, bone: body },
  );
  P(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 12), DARK, { at: [0, 1.5, 2.07], dir: [0, 0, 1] });
  b.ring({ at: [0, 1.5, 2.04], axis: [0, 0, 1] } as any, { count: 8, radius: 0.42 }, (it: any) =>
    P(new THREE.SphereGeometry(0.035, 6, 4), "#f0d68a", { at: it }),
  );
  b.ring({ at: [0, 1.5, 1.25], axis: [0, 0, 1] } as any, { count: 10, radius: 0.6 }, (it: any) =>
    P(new THREE.BoxGeometry(0.04, 0.05, 0.28), DARK, { at: it, dir: it.axis, axis: "y" }),
  );
  P(new THREE.ConeGeometry(0.2, 0.38, 10), RED, { at: [0, 1.5, 2.27], dir: [0, 0, 1] });
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 0.5, 1.58, 1.75], [s * 0.7, 1.5, 1.5], [s * 0.74, 1.36, 1.0], [s * 0.66, 1.3, 0.55]],
      [0.075, 0.05],
      { color: "#3b3b44", bone: body, caps: { start: "round", end: "flat" } },
    );
    P(new THREE.CylinderGeometry(0.075, 0.05, 0.14, 8), "#1c1c22", { at: [s * 0.66, 1.3, 0.5], dir: [0, 0, -1] });
  }

  // ---------- propeller ----------
  const bladePaint = paint((_p, n, s) => {
    const tip = Math.abs(s[1]) > 0.85;
    return shade(tip ? "#e3b04a" : "#a56a35", light(n));
  });
  b.extrude(
    [[-0.09, -1.15], [0.09, -1.15], [0.15, -0.7], [0.1, -0.15], [0.1, 0.15], [0.15, 0.7], [0.09, 1.15], [-0.09, 1.15], [-0.15, 0.7], [-0.1, 0.15], [-0.1, -0.15], [-0.15, -0.7]],
    { at: [0, 1.5, 2.12], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.015, color: bladePaint, bone: propJ },
  );
  P(new THREE.SphereGeometry(0.1, 8, 6), "#f0d68a", { at: [0, 1.5, 2.46], bone: propJ });

  // ---------- cockpits ----------
  const cockpit = (z: number, len: number) => {
    P(new THREE.BoxGeometry(0.64, 0.1, len), "#2a1a12", { at: [0, 2.0, z] });
    for (const s of [1, -1]) {
      P(new THREE.BoxGeometry(0.07, 0.09, len + 0.1), LEATHER, { at: [s * 0.35, 2.03, z] });
    }
    P(new THREE.BoxGeometry(0.64, 0.09, 0.07), LEATHER, { at: [0, 2.03, z + len / 2 + 0.03] });
    P(new THREE.BoxGeometry(0.64, 0.09, 0.07), LEATHER, { at: [0, 2.03, z - len / 2 - 0.03] });
  };
  cockpit(0.6, 0.55);
  cockpit(-0.45, 0.55);
  // windscreen
  P(new THREE.BoxGeometry(0.66, 0.3, 0.035), "#a6e7f0", { at: [0, 2.16, 0.95], rotation: [-28, 0, 0] });
  for (const s of [1, -1]) P(new THREE.BoxGeometry(0.03, 0.3, 0.05), STEEL, { at: [s * 0.34, 2.16, 0.95], rotation: [-28, 0, 0] });

  // ---------- pilot ----------
  const hc: [number, number, number] = [0, 2.3, 0.6];
  b.capsule([0, 1.9, 0.6], [0, 2.08, 0.6], 0.25, "#8a5a32", { bone: body });
  P(new THREE.SphereGeometry(0.25, 12, 8), SKIN, { at: hc });
  P(new THREE.SphereGeometry(0.275, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), LEATHER, { at: [0, 2.33, 0.6] });
  P(new THREE.SphereGeometry(0.05, 6, 4), "#e79b82", { at: [0, 2.26, 0.85], scale: [1, 0.9, 1.1] });
  P(new THREE.TorusGeometry(0.265, 0.025, 5, 14), "#3a2414", { at: [0, 2.38, 0.6], dir: [0, 1, 0], axis: "z" });
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.095, 0.095, 0.07, 10), AMBER, { at: [s * 0.115, 2.38, 0.83], dir: [0, 0, 1] });
    P(new THREE.TorusGeometry(0.1, 0.022, 5, 10), "#caa24a", { at: [s * 0.115, 2.38, 0.85], dir: [0, 0, 1], axis: "z" });
    P(new THREE.BoxGeometry(0.05, 0.14, 0.1), LEATHER, { at: [s * 0.27, 2.25, 0.6] });
    P(new THREE.CapsuleGeometry(0.025, 0.1, 3, 6), "#5a3418", { at: [s * 0.09, 2.2, 0.85], dir: [s, -0.3, 0], axis: "y" });
    b.rod([s * 0.3, 1.95, 0.5], [s * 0.42, 2.18, 0.55], 0.05, "#8a5a32", { bone: body });
  }
  const ribbon = (len: number, w: number, amp: number) => {
    const top: [number, number][] = [], bot: [number, number][] = [];
    for (let i = 0; i <= 8; i++) {
      const u = (i / 8) * len;
      const y = amp * Math.sin(i * 0.9);
      top.push([u, y + w * (1 - 0.6 * (i / 8))]);
      bot.push([u, y]);
    }
    return [...bot, ...top.reverse()] as [number, number][];
  };
  const scarfPaint = paint((_p, n, s) => shade(Math.floor(s[0] / 0.16) % 2 ? CREAM : RED, light(n)));
  b.extrude(ribbon(1.7, 0.2, 0.08), {
    at: [0, 2.06, 0.38], x: [0, 0, -1], y: [0.35, 0.93, 0], thickness: 0.025, color: scarfPaint, bone: body,
  });
  b.sweep([[ -0.2, 2.1, 0.5], [0, 2.07, 0.62], [0.2, 2.1, 0.5]], 0.06, { color: RED, bone: body });

  // teddy passenger
  P(new THREE.SphereGeometry(0.22, 10, 8), "#b9824e", { at: [0, 2.17, -0.45] });
  for (const s of [1, -1]) {
    P(new THREE.SphereGeometry(0.08, 7, 5), "#b9824e", { at: [s * 0.16, 2.35, -0.45] });
    P(new THREE.SphereGeometry(0.04, 6, 4), "#e8b98a", { at: [s * 0.16, 2.35, -0.39] });
    P(new THREE.SphereGeometry(0.03, 6, 4), "#22112f", { at: [s * 0.08, 2.21, -0.25] });
  }
  P(new THREE.SphereGeometry(0.09, 8, 6), "#e8b98a", { at: [0, 2.12, -0.26], scale: [1, 0.8, 0.8] });
  P(new THREE.SphereGeometry(0.035, 6, 4), "#22112f", { at: [0, 2.15, -0.2] });
  P(new THREE.TorusGeometry(0.22, 0.04, 5, 12), TEAL, { at: [0, 1.99, -0.45], dir: [0, 1, 0], axis: "z" });

  // ---------- wings ----------
  const wingOutline = (span: number, zc: number, chord: number): [number, number][] => {
    const h = chord / 2, r = h * 0.6;
    return [
      [-span, zc + h - r], [-span + r * 0.5, zc + h], [span - r * 0.5, zc + h], [span, zc + h - r],
      [span, zc - h + r], [span - r * 0.5, zc - h], [-span + r * 0.5, zc - h], [-span, zc - h + r],
    ];
  };
  const wingPaint = (span: number, zc: number) =>
    paint((_p, n, s) => {
      const ax = Math.abs(s[0]);
      let c = CREAM;
      if (ax > span - 0.55) c = RED;
      else if (ax > span * 0.45 && ax < span - 0.6 && s[1] < zc - 0.12) c = TEAL;
      if (ax > 0.1 && Math.abs(((ax + 0.2) % 0.5) - 0.25) > 0.235 && Math.abs(n.y) > 0.5) c = "#d7c397";
      if (Math.abs(n.y) < 0.5) c = RED;
      const k = n.y < -0.5 ? 0.78 : 1;
      return shade(c, k);
    });
  const upperY = 2.65, lowerY = 1.05;
  b.extrude(wingOutline(4.0, 0.45, 1.4), {
    at: [0, upperY, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.14, bevel: 0.05, color: wingPaint(4.0, 0.45), bone: body,
  });
  b.extrude(wingOutline(3.6, 0.15, 1.3), {
    at: [0, lowerY, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.12, bevel: 0.04, color: wingPaint(3.6, 0.15), bone: body,
  });
  const roundel = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#22112f"/><circle cx="50" cy="50" r="42" fill="#fff1cf"/><circle cx="50" cy="50" r="30" fill="#d8402e"/><circle cx="50" cy="50" r="18" fill="#2aa7a0"/><polygon points="50,34 55,46 68,46 58,54 62,67 50,59 38,67 42,54 32,46 45,46" fill="#ffbf3c"/></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    P(new THREE.CircleGeometry(0.5, 20), "#ffffff", { at: [s * 2.5, upperY + 0.076, 0.45], dir: [0, 1, 0], axis: "z", texture: roundel });
    P(new THREE.CircleGeometry(0.45, 20), "#ffffff", { at: [s * 2.4, lowerY - 0.066, 0.15], dir: [0, -1, 0], axis: "z", texture: roundel });
  }

  // struts, cabane, wires
  for (const s of [1, -1]) {
    b.rod([s * 2.2, lowerY + 0.05, 0.55], [s * 2.2, upperY - 0.05, 0.95], 0.05, WOOD, { bone: body });
    b.rod([s * 2.2, lowerY + 0.05, -0.2], [s * 2.2, upperY - 0.05, 0.15], 0.05, WOOD, { bone: body });
    b.rod([s * 3.4, lowerY + 0.05, 0.5], [s * 3.4, upperY - 0.05, 0.85], 0.045, WOOD, { bone: body });
    b.rod([s * 3.4, lowerY + 0.05, -0.15], [s * 3.4, upperY - 0.05, 0.1], 0.045, WOOD, { bone: body });
    b.rod([s * 0.3, 1.95, 0.8], [s * 0.55, upperY - 0.05, 0.95], 0.05, WOOD, { bone: body });
    b.rod([s * 0.3, 1.95, 0.1], [s * 0.55, upperY - 0.05, 0.2], 0.05, WOOD, { bone: body });
    b.rod([s * 0.5, 1.12, 0.35], [s * 2.2, upperY - 0.06, 0.55], 0.014, DARK, { bone: body });
    b.rod([s * 2.2, 1.12, 0.35], [s * 0.55, upperY - 0.06, 0.55], 0.014, DARK, { bone: body });
    b.rod([s * 2.2, 1.12, 0.3], [s * 3.4, upperY - 0.06, 0.45], 0.014, DARK, { bone: body });
    b.rod([s * 3.4, 1.12, 0.3], [s * 2.2, upperY - 0.06, 0.45], 0.014, DARK, { bone: body });
    // strut fittings
    for (const x of [2.2, 3.4]) {
      P(new THREE.SphereGeometry(0.06, 6, 4), "#e3b04a", { at: [s * x, upperY - 0.07, x > 3 ? 0.85 : 0.95] });
      P(new THREE.SphereGeometry(0.06, 6, 4), "#e3b04a", { at: [s * x, lowerY + 0.07, x > 3 ? 0.5 : 0.55] });
    }
    // streamer from the wingtip
    b.extrude(ribbon(1.3, 0.14, 0.06), {
      at: [s * 3.95, upperY, 0.1], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.02,
      color: s > 0 ? TEAL : RED, bone: body,
    });
  }

  // bunting
  const bunt = [RED, CREAM, TEAL, AMBER];
  const rope = b.sweep([[2.2, 2.5, -0.1], [0.8, 2.28, -0.1], [-0.8, 2.28, -0.1], [-2.2, 2.5, -0.1]], 0.008, { color: DARK, bone: body });
  let bi = 0;
  b.along(rope, 14, (at: any) => {
    const q = at.at.clone();
    P(new THREE.ConeGeometry(0.09, 0.2, 3), bunt[bi++ % 4], { at: [q.x, q.y - 0.1, q.z], dir: [0, -1, 0], scale: [1, 1, 0.2] });
  });

  // ---------- tail ----------
  const stripe = paint((_p, n, s) => shade([RED, CREAM, TEAL][Math.floor((s[0] * 0.7 + s[1]) / 0.25 + 40) % 3], light(n)));
  b.extrude([[-1.85, 1.6], [-2.45, 2.55], [-2.7, 2.52], [-2.7, 1.6]], {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, bevel: 0.02, color: RED, bone: body,
  });
  b.extrude([[-2.7, 1.62], [-2.7, 2.52], [-3.1, 2.42], [-3.28, 1.8], [-3.05, 1.6]], {
    at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, bevel: 0.02, smoothing: 1, color: stripe, bone: rudderJ,
  });
  for (const s of [1, -1]) {
    b.extrude([[0, -1.95], [1.4, -2.45], [1.4, -2.78], [0, -2.78]], {
      at: [0, 1.62, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.08, bevel: 0.02, color: CREAM, bone: body,
    });
    b.extrude([[0, -2.78], [1.4, -2.78], [1.5, -3.1], [1.2, -3.35], [0, -3.3]], {
      at: [0, 1.62, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.02, smoothing: 1,
      color: s > 0 ? TEAL : RED, bone: elevJ[s > 0 ? "L" : "R"],
    });
  }

  // ---------- landing gear ----------
  b.rod([-1.05, 0.48, 1.0], [1.05, 0.48, 1.0], 0.045, STEEL, { bone: body });
  for (const s of [1, -1]) {
    b.rod([s * 0.4, 1.15, 0.9], [s * 1.0, 0.5, 1.05], 0.055, WOOD, { bone: body });
    b.rod([s * 0.4, 1.15, 0.4], [s * 1.0, 0.5, 0.95], 0.055, WOOD, { bone: body });
    b.capsule([s * 0.7, 0.85, 1.0], [s * 0.85, 0.65, 1.0], 0.07, "#f0d68a", { bone: body });
    P(new THREE.TorusGeometry(0.35, 0.13, 8, 16), "#2a2630", { at: [s * 1.1, 0.48, 1.0], dir: [1, 0, 0], axis: "z" });
    P(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 10), CREAM, { at: [s * 1.1, 0.48, 1.0], dir: [1, 0, 0] });
    P(new THREE.SphereGeometry(0.09, 7, 5), TEAL, { at: [s * 1.22, 0.48, 1.0] });
    const spoke = svg(
      `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#d8402e" stroke-width="7"/>${[0, 45, 90, 135].map((a) => `<line x1="50" y1="6" x2="50" y2="94" stroke="#d8402e" stroke-width="6" transform="rotate(${a} 50 50)"/>`).join("")}</svg>`,
      { size: 128 },
    );
    P(new THREE.CircleGeometry(0.27, 16), "#ffffff", { at: [s * 1.211, 0.48, 1.0], dir: [s, 0, 0], axis: "z", texture: spoke });
  }
  b.rod([0, 1.5, -2.55], [0, 0.22, -2.9], 0.035, STEEL, { bone: body });
  P(new THREE.SphereGeometry(0.14, 8, 6), "#2a2630", { at: [0, 0.14, -2.9] });

  return b.root;
}
```