// Red Lionfish · Kimi
// Pterois volitans, ~0.4 m long, swimming with its lowest point ~0.25 m above the floor.
// Bold red-brown and white vertical stripes on a deep, laterally compressed body; huge
// fan-shaped pectoral fins of long separated spiny rays joined by spotted membranes at the
// base; a tall row of banded venomous dorsal spines with frayed membranes; feathery
// tentacles above the eyes; a separate lower jaw; a rounded, spotted tail fin.
// Rig: core -> spine -> head -> jaw forward, a 5-joint tail chain backward, 13 dorsal
// spine joints, 3-joint fan groups for each pectoral fin, and 2-joint eye tentacles.

import { ConeGeometry, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { offset } from "../src/math";
import { catmull, polyline } from "../src/path";
import { paint, spots, stripes } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Red Lionfish · Kimi",
  description:
    "A red lionfish (Pterois volitans) with bold red-brown and white vertical stripes, large fan-shaped pectoral fins of long separated spiny rays with membranes between them, a tall row of venomous dorsal spines with frayed membranes, feathery tentacles above the eyes, a separate lower jaw and a rounded tail fin.",
  builtBy: "RedLionfishK3 (agent)",
};

const RED = "#8e3226"; // red-brown stripes
const RED_DARK = "#5f1f17"; // deep red-brown details
const CREAM = "#f0e6d8"; // white stripes
const MEMB = "#e9d8c2"; // pale fin membrane
const EYE_DARK = "#1c0d0a"; // pupil
const EYE_RED = "#7c2a1e"; // iris
const GLINT = "#fff6ea"; // eye highlight

export default function build() {
  const b = createBuilder({ name: "redLionfishKimi" });

  // ---- layout ----------------------------------------------------------------
  const Y = 0.33; // body centreline height: lowest fin tip lands ~0.25 above the floor
  const Z0 = -0.165; // tail tip of the body tube
  const Z1 = 0.16; // head end of the body tube (snout and jaw reach past it)
  const ZH = 0.105; // head joint / spine->head split
  const tAt = (z: number) => (z - Z0) / (Z1 - Z0);

  // ---- paints ----------------------------------------------------------------
  const coat = stripes(CREAM, RED, { size: 0.03, width: 0.5, wobble: 0.25, seed: 11 });
  const banded = (n: number) => paint((_p, _n, s) => (Math.floor(s[0] * n) % 2 ? RED : CREAM));
  const rayPaint = banded(7); // bands along each fin ray (sweep t)
  const spinePaint = banded(8); // bands along each dorsal spine
  const membPaint = spots(MEMB, RED, { size: 0.016, amount: 0.35, seed: 5 });
  const tailPaint = paint((_p, _n, s) => (Math.floor(s[0] / 0.011) % 2 ? RED : CREAM));
  const feather = svg(
    `<svg viewBox="0 0 24 48" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="l"><path d="M12 1 C21 12 21 30 12 47 C3 30 3 12 12 1Z"/></clipPath></defs>
      <g clip-path="url(#l)">
        <rect width="24" height="48" fill="${MEMB}"/>
        <rect y="7" width="24" height="5" fill="${RED}"/>
        <rect y="19" width="24" height="5" fill="${RED}"/>
        <rect y="31" width="24" height="4" fill="${RED}"/>
        <rect x="10.5" width="3" height="48" fill="${RED_DARK}"/>
      </g>
    </svg>`,
    { size: 128 },
  );

  // ---- skeleton --------------------------------------------------------------
  const body = catmull([
    [0, Y, Z0],
    [0, Y, -0.12],
    [0, Y + 0.002, -0.06],
    [0, Y + 0.004, 0],
    [0, Y + 0.004, 0.055],
    [0, Y + 0.002, ZH],
    [0, Y - 0.006, Z1],
  ]);
  const core = b.joint("core", { at: [0, Y + 0.004, 0], role: "spine" });
  const rootT = body.closestT(core.at);
  const headT = body.closestT([0, Y + 0.002, ZH]);
  const spine = b.chain("spine", body.slice(rootT, headT), {
    parent: core,
    count: 2,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const head = b.chain("head", body.slice(headT, 1), {
    parent: spine.joints[1],
    count: 1,
    names: ["head"],
    role: "head",
  });
  const headJoint = head.joints[0];
  const tail = b.chain("tail", body.slice(rootT, 0), {
    parent: core,
    count: 5,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
    role: "tail",
  });
  const jaw = b.joint("jaw", {
    parent: headJoint,
    at: [0, Y - 0.02, 0.115],
    dir: [0, -0.12, 1],
    role: "jaw",
  });

  // ---- body tube -------------------------------------------------------------
  const profile = (keys: [number, number][]) => (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, v0] = keys[i - 1];
        const [t1, v1] = keys[i];
        return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
      }
    }
    return keys[keys.length - 1][1];
  };
  const rx = profile([[0, 0.006], [0.14, 0.01], [0.32, 0.022], [0.51, 0.038], [0.68, 0.04], [0.815, 0.036], [0.92, 0.03], [1, 0.018]]);
  const ry = profile([[0, 0.01], [0.14, 0.016], [0.32, 0.036], [0.51, 0.06], [0.68, 0.058], [0.815, 0.052], [0.92, 0.042], [1, 0.024]]);
  const tube = b.sweep(body, (t) => [rx(t), ry(t)], {
    bone: [tail, core, spine, head],
    color: coat,
    sides: 12,
  });

  // ---- head: snout, jaw, eyes, cheek spines ----------------------------------
  b.frustumBox([0, Y - 0.003, 0.138], [0, Y - 0.009, 0.183], [0.048, 0.046], [0.022, 0.012], {
    bone: headJoint,
    color: coat,
  });
  b.frustumBox(jaw.at, jaw.local([0, 0.06, -0.004]), [0.03, 0.017], [0.018, 0.011], {
    bone: jaw,
    color: coat,
  });

  const headSurf = b.surface(tube);
  for (const s of [1, -1]) {
    const eyeHit = headSurf.nearest(headJoint.local([s * 0.02, 0.034, 0.03]));
    const eyeAt = offset(eyeHit.at, eyeHit.n, 0.003);
    const out = eyeHit.n;
    b.part(new SphereGeometry(0.008, 10, 8), EYE_RED, { bone: headJoint, at: eyeAt });
    b.part(new SphereGeometry(0.0048, 8, 6), EYE_DARK, {
      bone: headJoint,
      at: offset(eyeAt, out, 0.005),
    });
    b.part(new SphereGeometry(0.002, 6, 5), GLINT, {
      bone: headJoint,
      at: offset(offset(eyeAt, out, 0.0068), [0, 1, 0], 0.0025),
    });
  }

  for (const s of [1, -1]) {
    const centre = new Vector3(0, Y, 0.115);
    for (const [az, el, len] of [
      [s * 95, -8, 0.015],
      [s * 122, -20, 0.012],
      [s * 72, 10, 0.011],
    ] as const) {
      const hit = headSurf.around(centre).at(az, el);
      if (hit) b.stick(new ConeGeometry(0.004, len, 6), RED_DARK, hit, { embed: 0.35 });
    }
  }

  // ---- feathery tentacles above the eyes --------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = headSurf.nearest(headJoint.local([s * 0.012, 0.03, 0.045]));
    const mid = offset(hit.at, [s * 0.18, 1, 0], 0.014);
    const tip = offset(hit.at, [s * 0.3, 1, 0.15], 0.028);
    const tent = b.sprout(`tentacle${side}`, hit, catmull([mid, tip]), [0.002, 0.0005], {
      count: 2,
      role: "tentacle",
      color: rayPaint,
      caps: { end: "point" },
    });
    b.cards([tent.sweep.at(0.5, s > 0 ? 270 : 90), tent.sweep.at(0.8, s > 0 ? 270 : 90)], feather, {
      size: [0.005, 0.011],
      lean: 25,
      flow: [s, 0.4, 0],
    });
  }

  // ---- dorsal spines with frayed membranes ------------------------------------
  const spines: { joint: Joint; low: Frame }[] = [];
  b.along(
    tube,
    13,
    (at) => {
      const i = spines.length;
      const u = i / 12;
      const h = 0.05 + 0.055 * Math.sin(Math.PI * u);
      const tip = at.local([0, h, -0.35 * h]);
      const grown = b.sprout(`dorsal${i + 1}`, at, tip, [0.0018, 0.0005], {
        count: 1,
        names: [`dorsal${i + 1}`],
        role: "fan",
        color: spinePaint,
        caps: { end: "point" },
      });
      const joint = grown.chain!.joints[0];
      spines.push({ joint, low: joint.moved([0, 0.32 * h, 0]) });
    },
    { from: tAt(-0.09), to: tAt(0.095) },
  );
  for (let i = 0; i + 1 < spines.length; i++) {
    b.membrane(polyline([spines[i].joint, spines[i].low]), polyline([spines[i + 1].joint, spines[i + 1].low]), {
      thickness: 0.001,
      color: membPaint,
      scallop: 0.45,
      detail: 0.5,
    });
  }

  // ---- pectoral fan fins -------------------------------------------------------
  for (const s of [1, -1]) {
    const base = tube.at(tAt(0.085), s > 0 ? 270 : 90);
    const fan = b.ring(frame(base.at, [s, 0, 0.2]), {
      count: 9,
      fromDeg: s > 0 ? -172 : 8,
      toDeg: s > 0 ? -8 : 172,
      tilt: 10,
      joints: 3,
      name: s > 0 ? "pectL" : "pectR",
      role: "fan",
      parent: headJoint,
    });
    const lows: Frame[] = [];
    fan.items.forEach((it, i) => {
      const u = fan.items.length === 1 ? 0.5 : i / (fan.items.length - 1);
      const len = 0.085 + 0.04 * Math.sin(Math.PI * u);
      lows.push(it.moved([0, len * 0.62, 0]));
      b.spike(it, it, len, 0.0016, { color: rayPaint });
    });
    for (let i = 0; i + 1 < fan.items.length; i++) {
      b.membrane(
        polyline([fan.items[i], lows[i]]),
        polyline([fan.items[i + 1], lows[i + 1]]),
        { thickness: 0.0012, color: membPaint, scallop: 0.15, detail: 0.5 },
      );
    }
  }

  // ---- soft dorsal and anal fins ----------------------------------------------
  const softFin = (deg: 0 | 180, zA: number, zB: number, hMid: number, name: string) => {
    const t0 = tAt(zA);
    const t1 = tAt(zB);
    const tm = (t0 + t1) / 2;
    const outer = catmull([
      tube.at(t0, deg).local([0, 0.012, 0]),
      tube.at(tm, deg).local([0, hMid, 0]),
      tube.at(t1, deg).local([0, 0.01, 0]),
    ]);
    b.membrane(tube.line(deg, 0.004).slice(t0, t1), outer, {
      thickness: 0.0012,
      color: membPaint,
      scallop: 0.1,
      detail: 0.5,
      bone: tail,
      name,
    });
  };
  softFin(0, -0.145, -0.055, 0.034, "softDorsal");
  softFin(180, -0.095, -0.03, 0.03, "analFin");

  // ---- rounded tail fin --------------------------------------------------------
  b.extrude(
    [
      [0.004, -0.029],
      [0.024, -0.035],
      [0.045, -0.019],
      [0.052, 0],
      [0.045, 0.019],
      [0.024, 0.035],
      [0.004, 0.029],
    ],
    {
      at: offset(tail.tip!.at, [0, 0, 1], 0.002),
      x: [0, 0, -1],
      thickness: [0.004, 0.0015],
      bevel: 0.001,
      smoothing: 2,
      color: tailPaint,
      bone: tail.tip!,
      name: "tailFin",
    },
  );

  return b.root;
}
