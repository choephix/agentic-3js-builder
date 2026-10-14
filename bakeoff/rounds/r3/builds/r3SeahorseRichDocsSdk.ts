import * as THREE from "three";
import { createBuilder, catmull, spiral, paint, spots, gradient } from "../../../../src/index";

export const meta = {
  name: "Lined Seahorse on Seagrass",
  description:
    "A sunny-yellow lined seahorse with a ridged body, freckles, a spiky crown, a tube snout, a rayed dorsal fin and big eyes, its curled tail gripping a strand of seagrass.",
};

const YELLOW = "#f4c21b";
const BELLY = "#f9de72";
const LINE = "#5b3a14";
const WHITE = "#fffbe8";
const ORANGE = "#e0901c";
const SNOUT = "#e6a720";
const GOLD = "#d98a1c";
const BLACK = "#14100c";
const SAND = "#e9d9a2";
const PEBBLE = "#9fb0b8";

export default function build() {
  const b = createBuilder({ name: "seahorse" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skeleton ----------
  const H: [number, number, number] = [0, 0.17, 0.04];
  const core = b.joint("hips", { at: H });

  const S0: [number, number, number] = [0, 0.13, 0.032];
  const tailRev = spiral([0, 0.13, 0], S0, [0, -1, 0], { turns: 2.2, r1: 0.012, pitch: 0.04 }).slice(1, 0);
  const P_BELLY: [number, number, number] = [0, 0.23, 0.05];
  const P_CHEST: [number, number, number] = [0, 0.29, 0.04];
  const P_NECK: [number, number, number] = [0, 0.35, 0.015];
  const P_TOP: [number, number, number] = [0, 0.395, 0.015];
  const bodyUp = catmull([S0, H, P_BELLY, P_CHEST, P_NECK, P_TOP]);
  const full = tailRev.concat(bodyUp);
  const L = full.length;
  const rootT = full.closestT(core.at);
  const front = b.chain("spine", full.slice(rootT, 1), { parent: core, count: 4, role: "spine" });
  const back = b.chain("tail", full.slice(rootT, 0), { parent: core, count: 10, role: "tail" });

  const tS0 = tailRev.length / L;
  const tHips = rootT;
  const tBelly = full.closestT(P_BELLY);
  const tChest = full.closestT(P_CHEST);
  const tNeck = full.closestT(P_NECK);

  const keys: [number, number][] = [
    [0, 0.004],
    [tS0 * 0.4, 0.01],
    [tS0 * 0.8, 0.017],
    [tS0, 0.022],
    [tHips, 0.03],
    [tBelly, 0.042],
    [tChest, 0.04],
    [tNeck, 0.021],
    [1, 0.017],
  ];
  const rAt = (t: number) => {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0] || i === keys.length - 1) {
        const [t0, r0] = keys[i - 1];
        const [t1, r1] = keys[i];
        let u = Math.min(1, Math.max(0, (t - t0) / Math.max(1e-6, t1 - t0)));
        u = u * u * (3 - 2 * u);
        return r0 + (r1 - r0) * u;
      }
    }
    return 0.02;
  };

  // ---------- coat paint ----------
  const freck = spots(YELLOW, WHITE, { size: 0.04, amount: 0.12, seed: 3 });
  const freckBelly = spots(BELLY, WHITE, { size: 0.04, amount: 0.12, seed: 5 });
  const coat = paint((_p, _n, s) => {
    const k = (s[0] * L) / 0.017;
    if (k - Math.floor(k) < 0.15) return LINE;
    const belly = s[0] > tS0 && Math.cos((s[1] * Math.PI) / 180) > 0.75;
    return belly ? freckBelly : freck;
  });

  const body = b.sweep(full, (t) => [rAt(t) * 0.88, rAt(t) * 1.08], {
    bone: [back, core, front],
    color: coat,
    sides: 8,
    smooth: false,
  });

  // ridges and nodules
  const knob = new THREE.ConeGeometry(0.007, 0.013, 5);
  const bigSpike = new THREE.ConeGeometry(0.006, 0.024, 5);
  for (let k = 0; k < 9; k++) {
    const t = tS0 + (tNeck - tS0) * ((k + 0.5) / 9);
    for (const a of [0, 60, 300, 120, 240]) {
      const h = body.at(t, a);
      b.stick(knob, ORANGE, h, { scale: Math.max(0.5, h.radius / 0.035), flat: true });
    }
    const h = body.at(t, 180);
    b.stick(bigSpike, "#c9741a", h, { scale: Math.max(0.5, h.radius / 0.035), flat: true });
  }
  for (let k = 0; k < 14; k++) {
    const t = 0.04 + (tS0 - 0.06) * (k / 13);
    for (const a of [60, 300, 180]) {
      const h = body.at(t, a);
      b.stick(knob, ORANGE, h, { scale: Math.max(0.35, h.radius / 0.03), flat: true });
    }
  }

  // ---------- head ----------
  const head = b.joint("head", { parent: front, at: front.at(1), dir: [0, -0.15, 1], role: "head" });
  const skull = b.part(new THREE.SphereGeometry(0.03, 8, 6), coat, {
    bone: head,
    at: head.local({ forward: 0.025, up: 0.01 }),
    scale: [0.85, 0.95, 1.15],
  });
  const snoutTip = head.local({ forward: 0.115, down: 0.02 });
  b.rod(head.local({ forward: 0.045, down: 0.004 }), snoutTip, [0.0125, 0.0075], {
    bone: head,
    color: SNOUT,
    sides: 6,
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, down: 0.026 }),
    aim: head.local({ forward: 0.108, down: 0.034 }),
    role: "jaw",
  });
  b.rod(jaw.at, head.local({ forward: 0.108, down: 0.034 }), [0.005, 0.0038], {
    bone: jaw,
    color: SNOUT,
    sides: 6,
  });

  // crown of spikes
  const topHit = b.surface(skull).nearest([0, 0.46, 0.035]);
  b.spike(topHit, topHit, 0.032, 0.007, { color: ORANGE, sides: 6 });
  b.ring(topHit, { count: 7, radius: 0.013, tilt: 50 }, (item) =>
    b.spike(item, item, 0.026, 0.006, { color: ORANGE, sides: 6 }),
  );

  // eyes
  for (const s of [1, -1]) {
    const c = head.local({ forward: 0.03, up: 0.018, left: s * 0.026 }).clone();
    const d = V(s * 0.75, 0.1, 0.65).normalize();
    b.part(new THREE.SphereGeometry(0.0165, 8, 6), GOLD, { bone: head, at: c });
    b.part(new THREE.SphereGeometry(0.0095, 7, 5), BLACK, {
      bone: head,
      at: c.clone().addScaledVector(d, 0.0085),
    });
    b.part(new THREE.SphereGeometry(0.0034, 5, 4), WHITE, {
      bone: head,
      at: c.clone().addScaledVector(d, 0.0145).add(V(s * -0.002, 0.005, 0.002)),
    });
    // brow spike
    b.spike(c.clone().add(V(0, 0.012, 0)), V(s * 0.3, 1, 0.2).normalize(), 0.017, 0.004, {
      bone: head,
      color: ORANGE,
      sides: 5,
    });
  }

  // ---------- fins ----------
  const surf = b.surface(body);
  const lineBack = body.line(180);
  const lineRaised = body.line(180, 0.035);
  const ends = (ln: typeof lineBack) => {
    const a = ln.closestT(body.at(tHips + 0.01, 180).at);
    const c = ln.closestT(body.at(tChest + 0.02, 180).at);
    return [Math.min(a, c), Math.max(a, c)] as const;
  };
  const [a0, a1] = ends(lineBack);
  const [r0, r1] = ends(lineRaised);
  const finPaint = paint((_p, _n, s) => {
    if (s[1] > 0.9) return "#fff6cf";
    return (s[0] * 22) % 1 < 0.22 ? "#d9902a" : "#fff0b0";
  });
  b.membrane(lineBack.slice(a0, a1), lineRaised.slice(r0, r1), {
    thickness: 0.002,
    color: finPaint,
    scallop: 0.15,
  });

  for (const s of [1, -1]) {
    const hit = surf.around([0, 0.3, 0.04]).at(s * 90, 0);
    if (hit) {
      b.extrude(
        [
          [0, 0],
          [0.02, 0.016],
          [0.032, 0.004],
          [0.03, -0.01],
          [0.016, -0.016],
        ],
        {
          at: hit.moved([0, 0.002, 0]),
          x: [s * 0.35, 0, -1],
          y: [0, 1, 0],
          thickness: 0.003,
          smoothing: 1,
          color: "#f6d77a",
          bone: front.joints[2],
        },
      );
    }
  }

  // ---------- seagrass ----------
  const blade = (
    pts: [number, number, number][],
    w: number,
    c0: string,
    c1: string,
    h: number,
  ) =>
    b.sweep(catmull(pts), (t) => [w * (1 - 0.8 * t) + 0.0012, 0.0017], {
      bone: core,
      sides: 6,
      caps: "point",
      color: gradient(c0, c1, [0, 0, 0], [0, h, 0]),
    });
  blade(
    [
      [0, -0.005, 0],
      [0, 0.1, 0],
      [0, 0.18, -0.005],
      [0.005, 0.3, -0.05],
      [0.03, 0.42, -0.12],
    ],
    0.008,
    "#2c7d37",
    "#9bd653",
    0.45,
  );
  blade(
    [
      [0.04, -0.005, -0.03],
      [0.045, 0.1, -0.035],
      [0.06, 0.2, -0.06],
      [0.09, 0.3, -0.07],
    ],
    0.007,
    "#2a7132",
    "#86c74a",
    0.32,
  );
  blade(
    [
      [-0.045, -0.005, -0.02],
      [-0.05, 0.09, -0.025],
      [-0.07, 0.17, -0.05],
      [-0.1, 0.25, -0.06],
    ],
    0.007,
    "#2f8a3a",
    "#a0dc5c",
    0.27,
  );
  blade(
    [
      [0.015, -0.005, -0.065],
      [0.01, 0.12, -0.07],
      [-0.01, 0.24, -0.08],
      [-0.03, 0.36, -0.12],
    ],
    0.007,
    "#276b30",
    "#78bb44",
    0.37,
  );

  // sandy mound and pebbles
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.095, 0.008],
      [0.065, 0.019],
      [0.028, 0.027],
      [0, 0.029],
    ],
    { at: [0, 0, -0.01], bone: core, segments: 10, color: SAND },
  );
  const pebbles: [number, number, number, number][] = [
    [0.07, 0.01, 0.04, 0.014],
    [-0.06, 0.008, 0.05, 0.011],
    [0.03, 0.006, 0.075, 0.009],
  ];
  for (const [x, y, z, r] of pebbles) {
    b.part(new THREE.IcosahedronGeometry(r, 0), PEBBLE, { bone: core, at: [x, y, z], flat: true });
  }

  return b.root;
}
