```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, paint, mix, smoothstep, noise, rng, svg } from "agentic-3js-builder";

export const meta = {
  name: "Chibi Axolotl",
  description:
    "A chubby chibi axolotl: big wide head with a smile and glossy eyes, six frilly pink gill plumes, stubby splayed legs with tiny fingers and toes, and a finned tail. Rigged with spine, tail, jaw, gill, limb and digit chains.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const PINK = "#f8b4c8";
const DEEP = "#ee8cab";
const BELLY = "#ffe3ea";
const PAD = "#ffc9d6";
const FINGER = "#ffbfd0";
const FTIP = "#ffe2ea";
const GILL_STALK = "#e45a80";
const MOUTH_ROOF = "#b8446a";
const MOUTH_FLOOR = "#cc5578";
const TONGUE = "#ec7b99";
const SMILE = "#9c3a5c";
const NOSTRIL = "#8f3555";

const RAD = Math.PI / 180;
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const skin = paint((p, n) => {
  const up = smoothstep(-0.55, 0.35, n.y);
  let c = mix(BELLY, PINK, up);
  c = mix(c, DEEP, 0.35 * smoothstep(0.5, 0.8, noise(p, 0.05, 3)) * up);
  if (noise(p, 0.012, 11) > 0.74) c = mix(c, "#e47c9e", 0.5 * up);
  c = mix(c, "#cfa9e0", 0.28 * smoothstep(0.2, -0.9, n.y)); // cool underside
  c = mix(c, "#fff1f4", 0.2 * smoothstep(0.55, 1, n.y)); // warm sheen on top
  return c;
});

const jawPaint = paint((_p, n) =>
  mix(mix("#ffd5e1", "#ffeaf0", smoothstep(-0.8, 0.6, n.y)), "#d9b9e6", 0.25 * smoothstep(0.1, -0.9, n.y)),
);

const finPaint = paint((_p, _n, s) => {
  const rays = 0.5 + 0.5 * Math.sin(s[0] * 150);
  const base = mix("#f4a0bb", "#ffd9e4", clamp01(s[1]));
  return mix(base, "#e17b9f", 0.35 * rays * (1 - clamp01(s[1])));
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="i" cx="0.5" cy="0.68" r="0.62">
      <stop offset="0" stop-color="#744080"/><stop offset="0.55" stop-color="#2f1a3a"/><stop offset="1" stop-color="#150b1c"/>
    </radialGradient></defs>
    <ellipse cx="32" cy="36" rx="30" ry="34" fill="url(#i)"/>
    <ellipse cx="22" cy="21" rx="10.5" ry="12.5" fill="#ffffff"/>
    <circle cx="44" cy="51" r="5.5" fill="#ffffff"/>
    <circle cx="38" cy="59" r="2.6" fill="#dce8ff"/>
  </svg>`,
  { size: 192 },
);

const BLUSH = svg(
  `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="12" rx="19" ry="11" fill="#f1688a"/>
    <path d="M11 17 l3 -9 M19 18 l3 -10 M27 17 l3 -9" stroke="#ffd0dc" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 128 },
);

const SPOT = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 3 C23 2 29 8 28 16 C29 24 22 30 15 29 C7 29 3 22 4 15 C4 8 9 3 16 3 Z" fill="#ec7f9f"/>
    <path d="M16 9 C20 8 23 12 22 16 C22 20 19 23 15 22 C11 22 9 18 10 14 C10 11 13 9 16 9 Z" fill="#f59ab5"/>
  </svg>`,
  { size: 64 },
);

function filament(c0: string, c1: string, tip: string) {
  let barbs = "";
  for (let i = 0; i < 6; i++) {
    const y = 56 - i * 9;
    const w = 14 - i * 1.7;
    barbs += `<path d="M32 ${y} Q ${32 - w * 0.6} ${y - 4} ${32 - w} ${y - 13}" stroke-width="3.8"/>`;
    barbs += `<path d="M32 ${y} Q ${32 + w * 0.6} ${y - 4} ${32 + w} ${y - 13}" stroke-width="3.8"/>`;
  }
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="64" x2="0" y2="0">
        <stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/>
      </linearGradient></defs>
      <g stroke="url(#g)" fill="none" stroke-linecap="round">
        <path d="M32 64 L32 5" stroke-width="5"/>
        ${barbs}
      </g>
      <circle cx="32" cy="5" r="4" fill="${tip}"/>
    </svg>`,
    { size: 128 },
  );
}
const FIL_A = filament("#d93f6c", "#ff9fbe", "#ffe0ea");
const FIL_B = filament("#ea5483", "#ffb6cc", "#ffffff");

// ---------------------------------------------------------------------------------------------------------------
// Helpers
function curve(keys: number[][], t: number, col: number) {
  const n = keys.length;
  let i = 0;
  while (i < n - 2 && t > keys[i + 1][0]) i++;
  const t0 = keys[i][0];
  const t1 = keys[i + 1][0];
  const v0 = keys[i][col];
  const v1 = keys[i + 1][col];
  const m = (j: number) => {
    const a = keys[Math.max(j - 1, 0)];
    const c = keys[Math.min(j + 1, n - 1)];
    return (c[col] - a[col]) / (c[0] - a[0]);
  };
  const h = t1 - t0;
  const u = clamp01((t - t0) / h);
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * h * m(i) + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * h * m(i + 1)
  );
}

// Head scale constants: the dome is a half ellipsoid sitting on the mouth plane.
const HC = new THREE.Vector3(0, 0.032, 0.075);
const HR = [0.062, 0.05, 0.064];

/** A point on (f = 1) or inside/outside the dome in the direction of azimuth (0 = +Z, 90 = +X) and elevation. */
function headPoint(az: number, el: number, f = 1) {
  const a = az * RAD;
  const e = el * RAD;
  const d = new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e));
  const k = 1 / Math.sqrt((d.x / HR[0]) ** 2 + (d.y / HR[1]) ** 2 + (d.z / HR[2]) ** 2);
  return new THREE.Vector3(HC.x + d.x * k * f, HC.y + d.y * k * f, HC.z + d.z * k * f);
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const R = rng(21);
  const Y = new THREE.Vector3(0, 1, 0);

  // ---- Skeleton: hips root, spine forward, tail back ------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.0365, -0.06], role: "spine" });
  const bodyPath = catmull([
    [0, 0.019, -0.185],
    [0, 0.027, -0.14],
    [0, 0.033, -0.1],
    [0, 0.0365, -0.06],
    [0, 0.0368, -0.02],
    [0, 0.0368, 0.03],
  ]);
  const rootT = bodyPath.closestT(hips.at);
  const front = b.chain("spine", bodyPath.slice(rootT, 1), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const back = b.chain("tail", bodyPath.slice(rootT, 0), {
    parent: hips,
    count: 5,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });

  const head = b.joint("head", { parent: front, at: [0, 0.036, 0.012], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.032, 0.022], aim: [0, 0.032, 0.1], role: "jaw" });

  // ---- Body ------------------------------------------------------------------------------------------------------
  const KEYS = [
    [0, 0.007, 0.012],
    [0.18, 0.011, 0.019],
    [0.4, 0.025, 0.029],
    [0.58, 0.039, 0.035],
    [0.78, 0.044, 0.036],
    [1, 0.04, 0.034],
  ];
  const body = b.sweep(
    bodyPath,
    (t: number) => [curve(KEYS, t, 1), curve(KEYS, t, 2)] as [number, number],
    { bone: [back, hips, front], color: skin, sides: 12 },
  );

  // Dorsal fin: a rayed membrane from the tail tip up the back, tallest on the tail.
  const finA = body.line(0, -0.004).slice(0.03, 0.9);
  const finTop: number[][] = [];
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const p = finA.at(u);
    const bump = u < 0.78 ? Math.sin(Math.PI * Math.pow(u / 0.78, 0.85)) : 0;
    const h = 0.007 + 0.032 * bump * (1 + 0.1 * Math.sin(u * 46));
    finTop.push([p.x, p.y + h, p.z]);
  }
  b.membrane(finA, finTop, { color: finPaint, thickness: 0.004, rows: 3, cols: 40 });

  // Freckle decals on the back and tail
  const bodySkin = b.surface(body);
  const freckles = bodySkin.scatter(30, { rng: rng(5), minDist: 0.03, filter: (h) => h.n.y > 0.3 });
  for (const h of freckles) {
    const d = 0.011 + R() * 0.009;
    b.decal(body, SPOT, { at: h, size: [d, d], segments: 4, roll: R() * 360 });
  }

  // ---- Head ------------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 16, 9, 0, Math.PI * 2, 0, Math.PI / 2), skin, {
    bone: head,
    at: HC,
    scale: HR,
  });
  b.part(new THREE.SphereGeometry(1, 12, 3), MOUTH_ROOF, {
    bone: head,
    at: [0, HC.y + 0.0004, HC.z],
    scale: [0.058, 0.0007, 0.06],
  });
  // Lower jaw: bottom half ellipsoid with a floor and tongue, hinged on the jaw joint.
  b.part(new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), jawPaint, {
    bone: jaw,
    at: HC,
    scale: [0.059, 0.032, 0.061],
  });
  b.part(new THREE.SphereGeometry(1, 12, 3), MOUTH_FLOOR, {
    bone: jaw,
    at: [0, HC.y - 0.0004, HC.z],
    scale: [0.057, 0.0007, 0.059],
  });
  b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), TONGUE, {
    bone: jaw,
    at: [0, HC.y - 0.0004, 0.086],
    scale: [0.026, 0.007, 0.032],
  });

  // Smile along the mouth seam, corners lifted
  const smile: number[][] = [];
  for (let k = -6; k <= 6; k++) {
    const th = ((k * 13) % 360) * RAD;
    const h = 0.009 * (k / 6) ** 2;
    const rad = Math.sqrt(1 - (h / HR[1]) ** 2);
    smile.push([
      HC.x + HR[0] * rad * Math.sin(th) * 1.012,
      HC.y + h,
      HC.z + HR[2] * rad * Math.cos(th) * 1.012,
    ]);
  }
  b.sweep(catmull(smile), 0.0022, { color: SMILE, bone: head, sides: 5 });

  // Eyes, blush and nostrils conform to the dome
  const dome = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = dome.around(HC).at(s * 38, 22)!;
    const eyeDir = new THREE.Vector3(eyeHit.n.x * 0.6, eyeHit.n.y * 0.6 + 0.1, eyeHit.n.z + 0.4).normalize();
    b.decal(skull, EYE, { at: eyeHit, dir: eyeDir, size: [0.036, 0.04], segments: 10, lift: 0.0015 });

    const blushHit = dome.around(HC).at(s * 68, 9)!;
    b.decal(skull, BLUSH, { at: blushHit, size: [0.032, 0.02], segments: 6, roll: -s * 12 });

    const nose = dome.around(HC).at(s * 13, 14)!;
    b.stick(new THREE.SphereGeometry(0.0032, 6, 4), NOSTRIL, nose, { embed: 0.5 });
  }

  // ---- Gills: three feathery plumes per side ---------------------------------------------------------------------
  const GILLS = [
    { az: 112, el: 52, dir: [0.55, 0.75, -0.45], len: 0.085 },
    { az: 104, el: 30, dir: [0.9, 0.32, -0.35], len: 0.1 },
    { az: 98, el: 8, dir: [0.95, 0.12, -0.3], len: 0.085 },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    GILLS.forEach((g, i) => {
      const base = headPoint(s * g.az, g.el, 0.86);
      const root = headPoint(s * g.az, g.el, 1.0);
      const d = new THREE.Vector3(s * g.dir[0], g.dir[1], g.dir[2]).normalize();
      const at = (u: number, lift: number) => root.clone().addScaledVector(d, g.len * u).add(new THREE.Vector3(0, lift, 0));
      const pts = [base, at(0.33, 0.004), at(0.68, 0.014), at(1, 0.03)];
      const nm = (j: number) => `gill${side}${i + 1}_${j}`;
      const ch = b.chain(`gill${side}${i + 1}`, catmull(pts), {
        parent: head,
        names: [nm(1), nm(2), nm(3)],
        role: "fan",
      });
      const sw = b.sweep(ch, [0.0078, 0.0035], { color: GILL_STALK, sides: 6 });
      b.part(new THREE.SphereGeometry(0.0105, 8, 6), GILL_STALK, { bone: head, at: headPoint(s * g.az, g.el, 0.98) });

      const bands = [
        [0.1, 0.4],
        [0.4, 0.7],
        [0.7, 0.98],
      ];
      bands.forEach(([a, c], gi) => {
        const frs: any[] = [];
        const count = 4;
        for (let k = 0; k < count; k++) {
          const t = a + ((c - a) * (k + 0.5)) / count;
          const angs = k % 2 ? [60, 180, 300] : [0, 120, 240];
          for (const ang of angs) frs.push(sw.at(t, ang));
        }
        b.cards(frs, [FIL_A, FIL_B], {
          size: [0.038 - 0.005 * gi, 0.056 - 0.011 * gi],
          lean: 55,
          bend: 25,
          cross: true,
          flow: (f: any) => f.tangent,
          vary: 0.2,
          spin: 15,
          rng: R,
        });
      });
      // Tuft at the tip
      const tipFrames = [0, 90, 180, 270].map((ang) => sw.at(0.99, ang));
      b.cards(tipFrames, [FIL_A, FIL_B], {
        size: [0.032, 0.05],
        lean: 15,
        bend: 20,
        cross: true,
        flow: (f: any) => f.tangent,
        rng: R,
      });
    });
  }

  // ---- Legs, hands and feet --------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const isFront of [true, false]) {
      const root = isFront ? [s * 0.036, 0.028, 0.0] : [s * 0.034, 0.028, -0.058];
      const target = isFront ? [s * 0.088, 0.0095, 0.03] : [s * 0.088, 0.0095, -0.088];
      const bend = isFront ? [s, 0.3, -0.5] : [s, 0.3, 0.5];
      const pts = limb(root, target, [0.036, 0.034], [bend]);
      const names = isFront ? [`shoulder${side}`, `elbow${side}`, `hand${side}`] : [`hip${side}`, `knee${side}`, `foot${side}`];
      const ch = b.chain(isFront ? `arm${side}` : `leg${side}`, pts, {
        parent: isFront ? front.joints[2] : hips,
        names,
        role: isFront ? "arm" : "leg",
        contact: [target[0], 0, target[2]],
      });
      b.sweep(ch, [0.0135, 0.0085], { color: skin, sides: 8 });
      const tip = ch.tip!;
      b.part(new THREE.SphereGeometry(1, 10, 6), PAD, {
        bone: tip,
        at: [target[0], 0.0065, target[2]],
        scale: [0.0125, 0.0065, 0.0135],
      });

      const n = isFront ? 4 : 5;
      const faceDir = isFront
        ? new THREE.Vector3(s * 0.45, 0, 1).normalize()
        : new THREE.Vector3(s * 0.8, 0, 0.25).normalize();
      const H = new THREE.Vector3(target[0], 0.0045, target[2]);
      for (let k = 0; k < n; k++) {
        const ang = (k - (n - 1) / 2) * (isFront ? 24 : 22) * RAD;
        const d = faceDir.clone().applyAxisAngle(Y, ang);
        const mid = 1 - Math.abs(k - (n - 1) / 2) * 0.12;
        const p0 = H.clone().addScaledVector(d, 0.005);
        const p1 = H.clone().addScaledVector(d, 0.022 * mid + 0.004);
        const nm = `${isFront ? "finger" : "toe"}${side}${k + 1}`;
        const fch = b.chain(nm, [p0, p1], { parent: tip, names: [nm], role: "digit" });
        b.sweep(fch, [0.0046, 0.0032], {
          color: FINGER,
          bands: [
            [0.7, FINGER],
            [1, FTIP],
          ],
          sides: 6,
        });
      }
    }
  }

  return b.root;
}
```