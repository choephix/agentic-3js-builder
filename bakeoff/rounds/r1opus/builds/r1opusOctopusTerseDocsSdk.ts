import * as THREE from "three";
import {
  createBuilder,
  catmull,
  offset,
  rng,
  countershade,
  spots,
  mottle,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Coral Octopus",
  description:
    "A stylized low-poly octopus in a rigging rest pose. Eight arms spread out in a star with webbing between their roots. Rows of suckers run along each arm. It has a mottled coral mantle with gold slit-pupil eyes, brow papillae, a siphon, and a two-part beak underneath.",
};

const CORAL = "#e0533d";
const DEEP = "#8e2633";
const CREAM = "#f7d9bf";
const SPOT = "#ff9a6b";
const RIM = "#fbe2cc";
const CUP = "#c65d55";
const BEAK = "#2a1a1c";
const WEBC = "#b33a3f";
const GOLD = "#f2b630";

function must<T>(x: T | null | undefined, what: string): T {
  if (!x) throw new Error("missing " + what);
  return x;
}

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const R = rng(11);

  const skin = countershade(
    spots(mottle(CORAL, DEEP, { size: 0.09, seed: 2 }), SPOT, { size: 0.045, amount: 0.3, seed: 5 }),
    CREAM,
    { level: -0.35 },
  );
  const web = countershade(mottle(WEBC, DEEP, { size: 0.06, seed: 9 }), "#e8a28c", { level: -0.3 });

  // ---------- skeleton: hub + spine up through head into the mantle ----------
  const hub = b.joint("hub", { at: [0, 0.1, 0.02], role: "spine" });
  const spinePath = catmull([
    [0, 0.1, 0.02],
    [0, 0.2, 0.03],
    [0, 0.3, -0.04],
    [0, 0.38, -0.13],
    [0, 0.41, -0.25],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hub,
    names: ["head", "mantle1", "mantle2", "mantle3"],
    role: "spine",
  });
  const head = spine.joints[0];

  // ---------- body / mantle ----------
  const body = b.loft(
    [
      { at: [0, 0.09, 0.02], w: 0.15, h: 0.15 },
      { at: [0, 0.17, 0.03], w: 0.21, h: 0.17 },
      { at: [0, 0.25, 0.0], w: 0.19, h: 0.17 },
      { at: [0, 0.33, -0.06], w: 0.27, h: 0.25 },
      { at: [0, 0.4, -0.16], w: 0.25, h: 0.22 },
      { at: [0, 0.42, -0.26], w: 0.11, h: 0.1 },
    ],
    { bone: [hub, spine], color: skin },
  );
  const surf = b.surface(body);

  // warty bumps on the mantle
  for (const h of surf.scatter(45, {
    rng: rng(3),
    minDist: 0.035,
    filter: (h) => h.at.y > 0.23 && h.n.y > -0.2,
  })) {
    const r = 0.007 + R() * 0.006;
    b.stick(new THREE.SphereGeometry(r, 6, 4).scale(1, 0.6, 1), SPOT, h, { embed: 0.4 });
  }

  // ---------- eyes ----------
  const eyeTex = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="#f4c040"/>
      <circle cx="32" cy="32" r="25" fill="#e39a22"/>
      <g stroke="#b8650f" stroke-width="2.5">
        <line x1="32" y1="8" x2="32" y2="20"/><line x1="32" y1="44" x2="32" y2="56"/>
        <line x1="8" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="56" y2="32"/>
        <line x1="15" y1="15" x2="22" y2="22"/><line x1="49" y1="15" x2="42" y2="22"/>
        <line x1="15" y1="49" x2="22" y2="42"/><line x1="49" y1="49" x2="42" y2="42"/>
      </g>
      <rect x="12" y="26" width="40" height="12" rx="6" fill="#1a0f12"/>
      <circle cx="41" cy="20" r="5" fill="#ffffff"/>
      <circle cx="22" cy="44" r="2.5" fill="#ffffff" opacity="0.8"/>
    </svg>`,
    { size: 256 },
  );

  const headCenter: [number, number, number] = [0, 0.19, 0.03];
  for (const s of [1, -1]) {
    const eyeHit = must(surf.around(headCenter).at(s * 58, 18), "eye hit");
    // socket mound
    b.stick(new THREE.SphereGeometry(0.036, 10, 8), skin, eyeHit, { embed: 0.5 });
    // eyeball
    const ball = b.stick(new THREE.SphereGeometry(0.028, 12, 8), GOLD, eyeHit.moved([0, 0.012, 0]), {
      embed: 0.3,
    });
    const look = eyeHit.n.clone().add(new THREE.Vector3(0, 0, 0.5)).normalize();
    b.decal(ball, eyeTex, {
      at: offset(ball.at, look, 0.028),
      dir: look,
      size: [0.046, 0.046],
      mirror: s > 0,
    });
    // heavy upper lid ridge
    const c = new THREE.Vector3().copy(ball.at);
    const u = new THREE.Vector3(0, 1, 0).cross(look).normalize();
    const v = look.clone().cross(u).normalize();
    const lidPts: number[][] = [];
    for (let k = 0; k <= 6; k++) {
      const th = (Math.PI * k) / 6;
      const p = c
        .clone()
        .addScaledVector(u, Math.cos(th) * 0.032)
        .addScaledVector(v, Math.sin(th) * 0.032)
        .addScaledVector(look, -0.002);
      lidPts.push([p.x, p.y, p.z]);
    }
    b.sweep(catmull(lidPts), [0.004, 0.01, 0.004], { bone: head, color: DEEP });
    // brow papilla "horn"
    const brow = must(surf.around(headCenter).at(s * 42, 48), "brow hit");
    b.spike(brow, [s * 0.35, 1, 0.15], 0.05, 0.011, { color: SPOT });
  }

  // ---------- siphon on the right side ----------
  const sHit = must(surf.around([0, 0.2, 0.0]).at(-95, -5), "siphon hit");
  const sTip = offset(offset(sHit, sHit, 0.045), [0, -1, 0], 0.015);
  b.sprout("siphon", sHit, sTip, [0.017, 0.013], { count: 0, color: skin, caps: "flat" });
  b.stick(new THREE.CylinderGeometry(0.009, 0.009, 0.004, 8), BEAK, b.surface(body).nearest(sTip), {
    embed: 0.2,
  });

  // ---------- beak (upper on hub, lower on jaw) ----------
  b.spike([0, 0.065, 0.025], [0, -1, 0.7], 0.035, 0.014, { bone: hub, color: BEAK });
  const jaw = b.joint("jaw", { parent: hub, at: [0, 0.055, 0.03], aim: [0, 0.035, 0.07], role: "jaw" });
  b.spike([0, 0.055, 0.035], [0, -1, -0.3], 0.028, 0.012, { bone: jaw, color: BEAK });

  // ---------- arms ----------
  const rA = (t: number) => 0.006 + 0.04 * Math.pow(1 - t, 1.3);
  const fs = [0, 0.15, 0.3, 0.5, 0.7, 0.88, 1];
  const chains = [];
  for (let i = 0; i < 8; i++) {
    const a = ((22.5 + 45 * i) * Math.PI) / 180;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const px = Math.cos(a);
    const pz = -Math.sin(a);
    const wsign = i % 2 ? 1 : -1;
    const pts = fs.map((f) => {
      const d = 0.06 + f * 0.7;
      const w = 0.025 * Math.sin(f * Math.PI * 1.5) * wsign + (f > 0.85 ? 0.03 * (f - 0.85) / 0.15 * -wsign : 0);
      const y = f === 0 ? 0.11 : f === 0.15 ? rA(0.15) + 0.012 : f === 1 ? rA(1) + 0.012 : rA(f) + 0.001;
      return [dx * d + px * w, y, dz * d + pz * w];
    });
    const side = dx > 0 ? "L" : "R";
    const idx = dx > 0 ? i + 1 : 8 - i;
    const name = `arm${side}${idx}`;
    const names = Array.from({ length: 7 }, (_, j) => `${name}_${j + 1}`);
    const ch = b.chain(name, catmull(pts), { parent: hub, count: 6, names, role: "tentacle" });
    chains.push(ch);
    const arm = b.sweep(ch, rA, { color: skin, name: `${name}Skin` });

    // suckers: two staggered rows on the lower sides
    for (const [row, deg] of [
      [0, 125],
      [1, 235],
    ]) {
      for (let k = 0; k < 14; k++) {
        const t = 0.1 + ((k + row * 0.5) / 14) * 0.84;
        const f = arm.at(t, deg);
        const rs = rA(t) * 0.42;
        b.stick(new THREE.TorusGeometry(rs, rs * 0.35, 4, 8).rotateX(Math.PI / 2), RIM, f, { embed: 0.35 });
        b.stick(new THREE.CylinderGeometry(rs * 0.72, rs * 0.72, rs * 0.4, 8), CUP, f, { embed: 0.5 });
      }
    }
    // little dorsal papillae
    b.along(
      arm,
      6,
      (at) => {
        b.stick(new THREE.SphereGeometry(rA(at.t) * 0.3, 6, 4).scale(1, 0.7, 1), SPOT, at, { embed: 0.45 });
      },
      { from: 0.15, to: 0.85 },
    );
  }

  // ---------- webbing between arm roots ----------
  for (let i = 0; i < 8; i++) {
    const A = chains[i].path.slice(0.0, 0.27);
    const B = chains[(i + 1) % 8].path.slice(0.0, 0.27);
    b.membrane(A, B, { color: web, thickness: 0.008, scallop: 0.3, bone: hub, name: `web${i}` });
  }

  return b.root;
}
