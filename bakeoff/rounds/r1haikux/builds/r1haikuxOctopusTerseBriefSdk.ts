import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";

export const meta = {
  name: "Octopus",
  description:
    "A coral octopus with a raised bulbous mantle, gold eyes with horizontal pupils, cream spots and warts, eight suckered arms curled up at the tips, a siphon and a beak.",
};

type V = [number, number, number];

const PAL = {
  body: "#e0606f",
  belly: "#f8ab8f",
  cream: "#ffeacd",
  wart: "#8e2d52",
  sucker: "#ffd9c9",
  gold: "#ffc53d",
  pupil: "#16101e",
  beak: "#4a1830",
  siphon: "#b64264",
  glint: "#ffffff",
};

const MANTLE_Y = 0.3;
const EYE_AZ = 0.8;
const EYE_Y = 0.27;
const EYE_R = 0.042;

// Arm radius along the arm: s = 0 at the mantle, s = 1 at the tip.
function armRadius(s: number): number {
  return 0.055 * (1 - s) ** 0.7 + 0.012;
}

// Arm centreline. It lies on the floor and curls up and sideways at the tip.
// theta: azimuth of the arm root (0 = front, +Z), amp: sideways curl amount.
function armPoint(theta: number, amp: number, s: number): V {
  const R = 0.1 + 0.4 * s - 0.05 * s ** 3;
  const L = amp * s ** 3.5;
  // Height above the floor beyond the arm radius: zero where the arm lies flat.
  const lift = 0.1 * (1 - s) ** 4 + 0.08 * s ** 12 - 0.002;
  const y = armRadius(s) + lift;
  const dx = Math.sin(theta);
  const dz = Math.cos(theta);
  return [R * dx + L * dz, y, R * dz - L * dx];
}

export default function build() {
  const rand = rng(21);
  const b = createBuilder({ name: "octopus" });

  // Skeleton: a root mantle, a lower beak jaw hanging under it, and eight arm chains.
  const mantle = b.joint("mantle", { at: [0, MANTLE_Y, 0] });
  const jaw = b.joint("jaw", { at: [0, 0.13, 0], parent: mantle, dir: [0, -1, 0] });

  // Mantle: a bulbous dome in the body colour over a paler skirt.
  const dome = b.lathe(
    [
      [0, 0.42], [0.04, 0.417], [0.085, 0.398], [0.125, 0.36], [0.15, 0.32],
      [0.163, 0.28], [0.166, 0.25], [0.16, 0.22], [0.15, 0.2], [0, 0.2],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], color: PAL.body },
  );
  const skirt = b.lathe(
    [
      [0, 0.2], [0.15, 0.2], [0.14, 0.175], [0.12, 0.155], [0.095, 0.142],
      [0.065, 0.136], [0, 0.134],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], color: PAL.belly },
  );
  const domeSurf = b.surface(dome);
  const skirtSurf = b.surface(skirt);

  // Eyes: gold balls on the flanks, a horizontal pupil bar and a glint.
  for (const side of [1, -1]) {
    const a = side * EYE_AZ;
    const n: V = [Math.sin(a), 0, Math.cos(a)]; // outward
    const t: V = [Math.cos(a), 0, -Math.sin(a)]; // across the eye, horizontal
    const c: V = [n[0] * 0.163, EYE_Y, n[2] * 0.163]; // eye centre on the dome

    const eye = b.stick(
      new THREE.SphereGeometry(EYE_R, 16, 12),
      PAL.gold,
      domeSurf.nearest([n[0] * 0.6, EYE_Y, n[2] * 0.6]),
    );
    const eyeSurf = b.surface(eye);
    const onEye = (d: V) => eyeSurf.nearest([c[0] + d[0], c[1] + d[1], c[2] + d[2]]);

    for (const across of [-0.0105, 0, 0.0105]) {
      const phi = Math.asin(across / EYE_R);
      const d: V = [
        n[0] * Math.cos(phi) + t[0] * Math.sin(phi),
        0,
        n[2] * Math.cos(phi) + t[2] * Math.sin(phi),
      ];
      b.stick(new THREE.SphereGeometry(0.0078, 8, 6), PAL.pupil, onEye(d));
    }

    const glint: V = [n[0] * 0.69, 0.72, n[2] * 0.69];
    b.stick(new THREE.SphereGeometry(0.0085, 8, 6), PAL.glint, onEye(glint));
  }

  // Siphon: a short funnel under the skirt, tucked between two front arms.
  const siphon = new THREE.CylinderGeometry(0.018, 0.03, 0.06, 10);
  siphon.translate(0, 0.03, 0);
  b.stick(
    siphon,
    PAL.siphon,
    skirtSurf.nearest([Math.sin(0.42) * 0.09, 0.03, Math.cos(0.42) * 0.09]),
  );

  // Beak: an upper cone on the skirt and a lower cone on the jaw joint.
  const upperBeak = new THREE.ConeGeometry(0.022, 0.045, 8);
  upperBeak.translate(0, 0.0225, 0);
  b.stick(upperBeak, PAL.beak, skirtSurf.nearest([0, 0.02, 0]));

  const lowerBeak = new THREE.ConeGeometry(0.018, 0.038, 8);
  lowerBeak.translate(0, 0.019, 0);
  b.stick(lowerBeak, PAL.beak, jaw);

  // Arms: eight chains splayed around the mantle, each with a tapering body,
  // a row of pale suckers on the underside, and a couple of dorsal spots.
  for (let i = 0; i < 8; i++) {
    const theta = (i * Math.PI) / 4;
    const amp = 0.15 + 0.07 * rand();
    const pt = (s: number) => armPoint(theta, amp, s);

    const ctrl = [0, 0.14, 0.3, 0.44, 0.6, 0.74, 0.86, 1].map(pt);
    const chain = b.chain(`arm${i}`, catmull(ctrl), { parent: mantle, role: "tentacle" });

    // Map the radius profile onto the chain by arc length.
    const FINE = 64;
    const cum: number[] = [0];
    let prev = pt(0);
    for (let k = 1; k <= FINE; k++) {
      const p = pt(k / FINE);
      cum.push(cum[k - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]));
      prev = p;
    }
    const total = cum[FINE];

    const stations = Array.from({ length: 13 }, (_, k) => {
      const s = k / 12;
      const t = cum[Math.round(s * FINE)] / total;
      return { at: chain.at(t), radius: armRadius(s) };
    });
    const armBody = b.loft(stations, { color: PAL.body });
    const armSurf = b.surface(armBody);

    // Suckers on the underside, facing the floor.
    for (let k = 0; k < 14; k++) {
      const s = 0.1 + (0.86 * k) / 13;
      const p = pt(s);
      const hit = armSurf.nearest([p[0], p[1] - 0.2, p[2]]);
      const r = Math.max(0.0045, armRadius(s) * 0.42);
      b.stick(new THREE.CylinderGeometry(r, r, 0.005, 8), PAL.sucker, hit);
    }

    // A couple of dorsal spots on each arm.
    for (const s of [0.3, 0.58]) {
      const p = pt(s);
      const hit = armSurf.nearest([p[0], p[1] + 0.3, p[2]]);
      const r = 0.009 + 0.005 * rand();
      b.stick(new THREE.CylinderGeometry(r, r, 0.005, 7), PAL.cream, hit);
    }
  }

  // Cream spots and dark warts scattered over the dome, away from the eyes.
  for (let k = 0; k < 70; k++) {
    const az = rand() * Math.PI * 2;
    const el = -0.35 + rand() * 1.6;
    const d: V = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];

    const nearEye = [EYE_AZ, -EYE_AZ].some((a) => {
      const ev: V = [Math.sin(a), -0.18, Math.cos(a)];
      const len = Math.hypot(ev[0], ev[1], ev[2]);
      return (d[0] * ev[0] + d[1] * ev[1] + d[2] * ev[2]) / len > 0.92;
    });
    if (nearEye) continue;

    const hit = domeSurf.nearest([d[0], MANTLE_Y + d[1], d[2]]);
    if (rand() < 0.3) {
      const r = 0.006 + 0.005 * rand();
      b.stick(new THREE.SphereGeometry(r, 6, 4), PAL.wart, hit);
    } else {
      const r = 0.009 + 0.008 * rand();
      b.stick(new THREE.CylinderGeometry(r, r * 1.08, 0.006, 8), PAL.cream, hit);
    }
  }

  return b.root;
}
