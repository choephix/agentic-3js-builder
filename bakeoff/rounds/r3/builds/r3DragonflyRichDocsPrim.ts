import * as THREE from "three";
import { createBuilder, catmull, svg, stripes, paint } from "../../../../src/index";

export const meta = {
  name: "Emperor Dragonfly",
  description: "Hovering emperor dragonfly with blue abdomen, green thorax, turquoise eyes and veined glassy wings.",
};

const BLUE = "#1f6bff", BLACK = "#14161c", GREEN = "#8fd637", TEAL = "#19c9c0", LEG = "#2a2a2a", YEL = "#d9c040";

export default function build() {
  const b = createBuilder({ name: "dragonfly" });
  const H = 1.0; // hover height
  const thorax = b.joint("thorax", { at: [0, H, 0], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, H + 0.005, 0.045], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, H - 0.01, 0.09], dir: [0, 0, 1], role: "jaw" });

  // abdomen
  const abPath = catmull([
    [0, H, -0.02], [0, H + 0.002, -0.08], [0, H, -0.16], [0, H - 0.005, -0.24], [0, H - 0.012, -0.32], [0, H - 0.02, -0.4],
  ]);
  const ab = b.chain("abdomen", abPath, { parent: thorax, count: 5, role: "tail" });
  const abCol = paint((_p, _n, s) => {
    const t = s[0];
    if (t < 0.08) return GREEN;
    const k = Math.floor(t * 10);
    const onTop = s[1] < 70 || s[1] > 290;
    if (onTop && (t * 10 - k) > 0.25 && t > 0.1) return BLACK;
    return BLUE;
  });
  b.sweep(ab, (t) => 0.014 - 0.005 * t + (t < 0.15 ? 0.006 : 0), { color: abCol, sides: 8, caps: "round" });
  // abdomen rings
  b.along(ab, 7, (at) =>
    b.part(new THREE.TorusGeometry(0.0135, 0.0018, 4, 8), BLACK, { at, dir: at.axis, bone: at.bone }),
  );
  // claspers
  for (const s of [1, -1])
    b.spike([s * 0.004, H - 0.021, -0.4], [s * 0.004, H - 0.02, -1], 0.025, 0.003, { color: BLACK, bone: ab.joints[4] });

  // thorax
  b.part(new THREE.SphereGeometry(0.03, 8, 6), GREEN, { at: [0, H + 0.003, 0.0], scale: [0.95, 0.95, 1.3], bone: thorax });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.003, 0.03, 0.012), BLACK, { at: [s * 0.027, H, 0.005], rotation: [0, 0, s * 8], bone: thorax });
    b.part(new THREE.BoxGeometry(0.003, 0.03, 0.012), BLACK, { at: [s * 0.026, H, -0.015], rotation: [0, 0, s * 8], bone: thorax });
  }
  b.part(new THREE.BoxGeometry(0.004, 0.004, 0.05), BLACK, { at: [0, H + 0.03, 0.0], bone: thorax });

  // head
  b.part(new THREE.SphereGeometry(0.02, 7, 5), GREEN, { at: [0, H + 0.003, 0.058], bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), TEAL, { at: [s * 0.025, H + 0.01, 0.075], scale: [0.85, 0.9, 1], bone: head });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), BLACK, { at: [s * 0.04, H + 0.02, 0.09], bone: head });
  }
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.012), YEL, { at: [0, H + 0.008, 0.095], bone: head });
  b.part(new THREE.BoxGeometry(0.026, 0.006, 0.014), GREEN, { at: [0, H - 0.01, 0.1], bone: jaw });

  // wings
  const veinSvg = (() => {
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 32"><rect width="128" height="32" fill="#ffe9a0" fill-opacity="0.16"/>`;
    for (let i = 0; i <= 16; i++) s += `<line x1="${i * 8}" y1="0" x2="${i * 8 + 3}" y2="32" stroke="#2a2418" stroke-width="1.2"/>`;
    for (let j = 0; j <= 4; j++) s += `<line x1="0" y1="${j * 8}" x2="128" y2="${j * 8 + 1}" stroke="#2a2418" stroke-width="1.2"/>`;
    s += `<rect x="108" y="0" width="8" height="5" fill="#3a2a10"/><rect x="0" y="0" width="128" height="2" fill="#2a2418"/></svg>`;
    return s;
  })();
  const tex = svg(veinSvg, { size: 512 });
  for (const s of [1, -1]) {
    for (const [z, len, w, sweepBack] of [[0.012, 0.19, 0.045, -0.02], [-0.012, 0.185, 0.05, -0.04]] as number[][]) {
      const w0 = b.joint(`wing${s > 0 ? "L" : "R"}${z > 0 ? "F" : "H"}`, {
        parent: thorax, at: [s * 0.02, H + 0.025, z], dir: [s, 0.02, sweepBack], role: "wing",
      });
      const geo = new THREE.PlaneGeometry(len, w);
      geo.translate(len / 2, -w * 0.4, 0);
      // plane lies in XY; rotate to lie flat (XZ)
      b.part(geo, "#ffffff", {
        at: [s * 0.02, H + 0.025, z], bone: w0, texture: tex,
        quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, s > 0 ? Math.atan(-sweepBack / 0.19) * -1 : Math.PI + Math.atan(sweepBack / 0.19) * -1)),
        scale: [1, 1, 1],
      });
      const back = new THREE.PlaneGeometry(len, w);
      back.translate(len / 2, -w * 0.4, 0);
      b.part(back, "#ffffff", {
        at: [s * 0.02, H + 0.0248, z], bone: w0, texture: tex,
        quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, s > 0 ? -Math.atan(-sweepBack / 0.19) * -1 : Math.PI - Math.atan(sweepBack / 0.19))),
      });
      b.rod([s * 0.02, H + 0.025, z], [s * len, H + 0.025, z + sweepBack * 1.5], 0.002, { color: BLACK, bone: w0 });
    }
  }

  // legs tucked
  const zs = [0.03, 0.012, -0.006];
  zs.forEach((z, i) => {
    for (const s of [1, -1]) {
      const n = `leg${s > 0 ? "L" : "R"}${i + 1}`;
      const hip: number[] = [s * 0.014, H - 0.022, z];
      const knee: number[] = [s * 0.03, H - 0.04, z + 0.025];
      const foot: number[] = [s * 0.02, H - 0.05, z + 0.055];
      const leg = b.chain(n, [hip, knee, foot], { parent: thorax, names: [`${n}hip`, `${n}knee`, `${n}foot`], role: "leg" });
      b.sweep(leg, [0.0025, 0.0015], { color: LEG, sides: 5, caps: "round" });
    }
  });

  return b.root;
}
