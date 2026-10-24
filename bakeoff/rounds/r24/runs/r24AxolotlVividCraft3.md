```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  bezier,
  catmull,
  polyline,
  limb,
  countershade,
  spots,
  gradient,
  paint,
  mix,
  smoothstep,
  svg,
  DEG,
} from "agentic-3js-builder";

export const meta = {
  name: "Candy Axolotl",
  description:
    "A tiny chibi pink axolotl grinning up at you: big glossy eyes, six feathery gill fronds puffed out like a lion's mane, stubby four-fingered hands, and a wavy ribbon tail with a pastel fin.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const PINK = "#ff9ec8";
const PINK_DEEP = "#f2709f";
const BELLY = "#ffdcea";
const TIP_PINK = "#ffd0e6";
const PAD = "#ffb8d4";
const GILL_ROOT = "#e8346f";
const GILL_MID = "#ff6fa3";
const GILL_TIP = "#ffc4de";
const EYE_DARK = "#2a1038";
const NOSE = "#8f2a58";
const FIN_PINK = "#ffa9cf";
const FIN_PALE = "#ffe6f1";
const FIN_LILAC = "#d9b0ff";

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ir" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a1466"/>
        <stop offset="0.55" stop-color="#7a3fc4"/>
        <stop offset="1" stop-color="#d79bff"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="49" fill="#1d0a2a"/>
    <circle cx="50" cy="52" r="41" fill="url(#ir)"/>
    <circle cx="50" cy="52" r="41" fill="none" stroke="#1d0a2a" stroke-width="3"/>
    <ellipse cx="50" cy="54" rx="19" ry="23" fill="#10041a"/>
    <circle cx="36" cy="35" r="13" fill="#ffffff"/>
    <circle cx="63" cy="68" r="6" fill="#ffffff"/>
    <circle cx="67" cy="52" r="3" fill="#c8f4ff"/>
    <circle cx="30" cy="62" r="2.4" fill="#e9d2ff"/>
  </svg>`,
  { size: 256 },
);

const GRIN_TEX = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 8 Q60 32 110 8 Q104 57 60 57 Q16 57 10 8Z" fill="#8f1d4a" stroke="#3c0f2a" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M28 47 Q60 30 92 47 Q82 55 60 55 Q38 55 28 47Z" fill="#ff8fb5"/>
    <path d="M60 36 L60 50" stroke="#e86a9a" stroke-width="2" stroke-linecap="round"/>
    <path d="M11 8 Q4 8 2 18" stroke="#3c0f2a" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="M109 8 Q116 8 118 18" stroke="#3c0f2a" stroke-width="3.6" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 384 },
);

const BLUSH_TEX = svg(
  `<svg viewBox="0 0 60 36" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="18" rx="28" ry="15" fill="#ff6f9f"/>
    <g stroke="#ffc4d9" stroke-width="3.2" stroke-linecap="round">
      <path d="M16 10 L11 24"/><path d="M28 8 L23 26"/><path d="M40 10 L35 24"/>
    </g>
  </svg>`,
  { size: 192 },
);

const PLUME_TEX = (() => {
  let barbs = "";
  for (let k = 0; k < 7; k++) {
    const y = 72 - k * 9;
    const w = 22 - k * 2.2;
    barbs += `<path d="M30 ${y} Q${30 - w * 0.6} ${y - 6} ${30 - w} ${y - 16}"/><path d="M30 ${y} Q${30 + w * 0.6} ${y - 6} ${30 + w} ${y - 16}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#ff7fae" stroke-width="4.2" fill="none" stroke-linecap="round">${barbs}</g>
      <path d="M30 80 L30 5" stroke="#e8407d" stroke-width="5.4" stroke-linecap="round"/>
      <circle cx="30" cy="6" r="4.2" fill="#ffc4de"/>
    </svg>`,
    { size: 192 },
  );
})();

// ---------------------------------------------------------------------------------------------------------------
// Paints
const freckled = spots(PINK, PINK_DEEP, { size: 0.03, amount: 0.22, seed: 3 });
const coat = countershade(freckled, BELLY, { level: -0.2, soft: 0.3 });
const GROOVE = mix(PINK_DEEP, "#d44f87", 0.4);
const bodyBase = paint((p, n) => {
  if (Math.abs(n.y) < 0.55 && p.z < 0.0 && p.z > -0.1 && p.y > 0.02 && p.y < 0.07) {
    const f = (((p.z / 0.015) % 1) + 1) % 1;
    if (f < 0.14) return GROOVE;
  }
  return coat;
});
const bodyCoat = gradient(bodyBase, TIP_PINK, [0.04, 0.034, -0.21], [0.12, 0.018, -0.255]);
const finPaint = paint((_p, _n, s) => {
  const a = s[1];
  if (a > 0.9) return FIN_LILAC;
  return mix(mix(FIN_PINK, FIN_PALE, smoothstep(0, 0.8, a)), FIN_LILAC, smoothstep(0.7, 0.9, a) * 0.4);
});

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const R = rng(11);
  type J = ReturnType<typeof b.joint>;

  // Head frame: head-local axes are the model's (x left, y up, z forward) pitched up so it grins at you.
  const HEAD_C = new THREE.Vector3(0, 0.054, 0.072);
  const headQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -14 * DEG);
  const hp = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(headQ).add(HEAD_C);
  const hd = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(headQ).normalize();
  const HUP = hd(0, 1, 0);
  const Y = new THREE.Vector3(0, 1, 0);

  const gloss = (part: { mesh: THREE.Mesh }, rough = 0.15) => {
    const m = part.mesh.material;
    if (m instanceof THREE.MeshStandardMaterial) {
      const c = m.clone();
      c.roughness = rough;
      c.metalness = 0;
      part.mesh.material = c;
    }
    return part;
  };

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.044, -0.07] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.044, -0.07],
      [0, 0.046, -0.02],
      [0, 0.048, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const tailPts: number[][] = [
    [0, 0.044, -0.07],
    [0, 0.042, -0.12],
    [0.022, 0.037, -0.17],
    [0.05, 0.032, -0.215],
    [0.085, 0.026, -0.245],
    [0.12, 0.0145, -0.255],
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, role: "tail" });
  const head = b.joint("head", { parent: spine.tip!, at: [0, 0.05, 0.03], aim: HEAD_C, role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.03, -0.03),
    aim: hp(0, -0.034, 0.06),
    role: "jaw",
  });

  // ---------------------------------------------------------------- body + tail ribbon
  const bodyPath = catmull([
    ...tailPts.slice().reverse(),
    [0, 0.046, -0.02],
    [0, 0.048, 0.03],
  ]);
  const tH = bodyPath.closestT(new THREE.Vector3(0, 0.044, -0.07));
  const bodyR = (t: number): [number, number] => {
    if (t < tH) {
      const u = t / tH;
      return [0.004 + 0.036 * Math.pow(u, 1.5), 0.012 + 0.031 * Math.pow(u, 0.7)];
    }
    const v = Math.min((t - tH) / (1 - tH), 1);
    return [0.04 + 0.012 * Math.sin(v * Math.PI * 0.9), 0.043 + 0.002 * v];
  };
  const body = b.sweep(bodyPath, bodyR, { bone: [tail, hips, spine], color: bodyCoat, sides: 10 });

  // dorsal ribbon fin along the tail
  {
    const dorsal = body.line(0);
    const seg = dorsal.slice(0.04, Math.min(tH + 0.03, 0.8));
    const N = 18;
    const raised: THREE.Vector3[] = [];
    for (let i = 0; i <= N; i++) {
      const w = i / N;
      const p = seg.at(w).clone();
      const h = (0.004 + 0.026 * Math.sin(Math.PI * (0.08 + 0.8 * w))) * (1 + 0.16 * Math.sin(w * Math.PI * 11));
      raised.push(p.add(new THREE.Vector3(0, h, 0)));
    }
    b.membrane(seg, polyline(raised), { color: finPaint, thickness: 0.003, rows: 3, bone: tail });
  }

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), coat, {
    bone: head,
    at: HEAD_C,
    quat: headQ,
    scale: [0.075, 0.052, 0.066],
    name: "skull",
  });
  const jawPart = b.part(new THREE.SphereGeometry(1, 14, 10), coat, {
    bone: jaw,
    at: hp(0, -0.034, 0.014),
    quat: headQ,
    scale: [0.058, 0.021, 0.046],
    name: "lowerJaw",
  });
  const skullSurf = b.surface(skull);
  const faceSurf = b.surface([skull, jawPart]);

  // smile
  gloss(
    b.decal(faceSurf, GRIN_TEX, {
      at: hp(0, -0.02, 0.06),
      dir: hd(0, -0.05, 1),
      up: HUP,
      size: [0.108, 0.054],
      segments: 18,
      lift: 0.0012,
    }),
    0.35,
  );

  // eyes, cheeks, nostrils
  for (const s of [1, -1]) {
    const hitS = skullSurf.nearest(hp(s * 0.044, 0.028, 0.04));
    const eyePos = hitS.at.clone().addScaledVector(hitS.n, 0.004);
    const eye = gloss(
      b.part(new THREE.SphereGeometry(0.02, 12, 9), EYE_DARK, { bone: head, at: eyePos, name: s > 0 ? "eyeL" : "eyeR" }),
      0.1,
    );
    const eyeDir = hd(s * 0.4, 0.3, 0.85);
    const eyeHit = b.surface(eye).nearest(eyePos.clone().addScaledVector(eyeDir, 0.03));
    gloss(
      b.decal(eye, EYE_TEX, {
        at: eyeHit.at,
        dir: eyeDir,
        up: HUP,
        size: [0.037, 0.037],
        segments: 12,
        lift: 0.0008,
      }),
      0.1,
    );

    // cheek blush
    b.decal(skull, BLUSH_TEX, {
      at: hp(s * 0.058, -0.004, 0.03),
      dir: hd(s * 0.85, 0, 0.5),
      up: HUP,
      size: [0.04, 0.024],
      segments: 8,
      mirror: s > 0,
    });

    // nostril
    const nose = skullSurf.nearest(hp(s * 0.014, 0.018, 0.075));
    b.part(new THREE.SphereGeometry(0.0046, 6, 5), NOSE, {
      bone: head,
      at: nose.at.clone().addScaledVector(nose.n, 0.001),
    });
  }

  // ---------------------------------------------------------------- gills: three feathery fronds each side
  const gillSpecs = [
    { base: [0.046, 0.03, -0.035], dir: [0.45, 0.88, -0.25], len: 0.1, lift: 0.012 },
    { base: [0.066, 0.002, -0.03], dir: [0.9, 0.35, -0.3], len: 0.105, lift: 0.014 },
    { base: [0.062, -0.022, -0.02], dir: [0.85, -0.02, -0.5], len: 0.095, lift: 0.024 },
  ];
  const clampFloor = (v: THREE.Vector3) => {
    v.y = Math.max(v.y, 0.004);
    return v;
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    gillSpecs.forEach((g, idx) => {
      const k = idx + 1;
      const d = hd(s * g.dir[0], g.dir[1], g.dir[2]);
      const p0 = hp(s * g.base[0], g.base[1], g.base[2]);
      const pts = [0, 0.3, 0.65, 1].map((u) =>
        p0
          .clone()
          .addScaledVector(d, g.len * u)
          .add(new THREE.Vector3(0, g.lift * u * u, 0)),
      );
      const stalk = b.chain(`gill${S}${k}`, catmull(pts), {
        parent: head,
        names: [`gill${S}${k}a`, `gill${S}${k}b`, `gill${S}${k}c`],
        role: "fan",
        group: "gills",
      });
      b.sweep(stalk, [0.0085, 0.0028], {
        color: GILL_ROOT,
        bands: [
          [0.5, GILL_ROOT],
          [1, GILL_MID],
        ],
        sides: 7,
      });
      b.part(new THREE.SphereGeometry(0.0125, 8, 6), GILL_ROOT, { bone: head, at: p0, group: "gills" });

      // filaments in a loose bottle-brush spiral
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        const t = 0.12 + (0.8 * i) / (steps - 1);
        const pt = stalk.at(t);
        for (let m = 0; m < 2; m++) {
          const phi = (i * 2 + m) * 2.4 + (m ? Math.PI : 0);
          const len = (0.046 - 0.026 * t) * (0.9 + 0.2 * R());
          const dir = pt.tangent
            .clone()
            .multiplyScalar(0.55)
            .addScaledVector(pt.binormal, Math.cos(phi) * 0.85)
            .addScaledVector(pt.normal, Math.sin(phi) * 0.38)
            .normalize();
          const a = pt.at.clone();
          const c = clampFloor(a.clone().addScaledVector(dir, len * 0.55));
          const e = clampFloor(a.clone().addScaledVector(dir, len).addScaledVector(pt.tangent, len * 0.3));
          b.sweep(bezier(a, c, e), [0.0028, 0.0007], {
            bone: pt.bone,
            color: GILL_ROOT,
            bands: [
              [0.5, GILL_ROOT],
              [0.8, GILL_MID],
              [1, GILL_TIP],
            ],
            sides: 5,
            group: "gills",
          });
        }
      }
      // crown of filaments at the tip, plus a drawn plume card
      const tip = stalk.at(1);
      for (let m = 0; m < 5; m++) {
        const phi = (m * 72 * DEG) + 0.4;
        const dir = tip.tangent
          .clone()
          .multiplyScalar(0.9)
          .addScaledVector(tip.binormal, Math.cos(phi) * 0.5)
          .addScaledVector(tip.normal, Math.sin(phi) * 0.3)
          .normalize();
        const a = tip.at.clone();
        const e = clampFloor(a.clone().addScaledVector(dir, 0.03));
        const c = clampFloor(a.clone().addScaledVector(dir, 0.016));
        b.sweep(bezier(a, c, e), [0.0026, 0.0007], {
          bone: tip.bone,
          color: GILL_MID,
          bands: [
            [0.5, GILL_MID],
            [1, GILL_TIP],
          ],
          sides: 5,
          group: "gills",
        });
      }
      b.cards([frame(tip.at, tip.tangent)], PLUME_TEX, {
        size: [0.05, 0.065],
        cross: true,
        bend: 20,
        bone: tip.bone,
        sink: 0.05,
      });
    });
  }

  // ---------------------------------------------------------------- hands and feet
  const paw = (
    prefix: string,
    parentJ: J,
    wrist: THREE.Vector3,
    fwd: THREE.Vector3,
    n: number,
    len: number,
    rad: number,
    spread: number,
    palmR: number,
  ) => {
    const ang = Math.atan2(fwd.x, fwd.z) / DEG;
    const palmC = new THREE.Vector3(wrist.x, palmR * 0.5, wrist.z).addScaledVector(fwd, palmR * 0.6);
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: parentJ,
      at: palmC,
      rotation: [0, ang, 0],
      scale: [palmR, palmR * 0.5, palmR * 0.95],
    });
    for (let i = 0; i < n; i++) {
      const off = i - (n - 1) / 2;
      const dir = fwd.clone().applyAxisAngle(Y, off * spread).normalize();
      const L = len * (1 - 0.12 * Math.abs(off));
      const base = palmC.clone().addScaledVector(dir, palmR * 0.45);
      const p0 = base.clone();
      p0.y = palmR * 0.5;
      const p1 = base.clone().addScaledVector(dir, L * 0.5);
      p1.y = rad;
      const p2 = base.clone().addScaledVector(dir, L);
      p2.y = rad;
      const fch = b.chain(`${prefix}${i + 1}`, polyline([p0, p1, p2]), {
        parent: parentJ,
        names: [`${prefix}${i + 1}a`, `${prefix}${i + 1}b`],
        role: "digit",
      });
      b.sweep(fch, [rad, rad * 0.86], { color: coat, sides: 7 });
      b.part(new THREE.SphereGeometry(rad * 1.14, 8, 6), PAD, { bone: fch.joints[1], at: p2 });
    }
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // arms
    const armPts = limb(
      new THREE.Vector3(s * 0.046, 0.034, 0.012),
      new THREE.Vector3(s * 0.1, 0.009, 0.03),
      [0.05, 0.042],
      [[s * 1, 0.5, -0.5]],
    );
    const arm = b.chain(`arm${S}`, armPts, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.017, 0.011], { color: coat, sides: 8 });
    paw(`finger${S}`, arm.tip!, armPts[armPts.length - 1], new THREE.Vector3(s * 0.25, 0, 1).normalize(), 4, 0.03, 0.0066, 0.42, 0.018);

    // hind legs
    const legPts = limb(
      new THREE.Vector3(s * 0.05, 0.034, -0.075),
      new THREE.Vector3(s * 0.105, 0.009, -0.1),
      [0.05, 0.042],
      [[s * 0.3, 0.6, 0.6]],
    );
    const leg = b.chain(`leg${S}`, legPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.019, 0.012], { color: coat, sides: 8 });
    paw(`toe${S}`, leg.tip!, legPts[legPts.length - 1], new THREE.Vector3(s * 0.6, 0, 0.5).normalize(), 5, 0.028, 0.006, 0.38, 0.02);
  }

  return b.root;
}
```