import * as THREE from "three";
import { catmull, createBuilder, limb, mix, noise, paint, rgb, rng, smoothstep, svg } from "../../../../src/index";

export const meta = {
  name: "Soapstone Polar Bear",
  description:
    "An Inuit-style soapstone carving of a polar bear: a chunky, polished sage-green stone body with veins and rust, incised fur strokes, spirals and chevrons, inlaid ivory claws, teeth and beads, and a jointed jaw.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const DARK = "#161b1a"; // inlaid black stone: nose, eyes
const IVORY = "#efe6cf"; // walrus ivory inlay: claws, teeth, beads
const DEEP = "#4b5c53"; // recessed stone: inner ears
const INCISE = "#1f2a26"; // incised line colour
const CHALK = "#eef3e6"; // chalk highlight of an incised line

const L_LIT = rgb("#b9c5b4");
const L_MID = rgb("#8fa094");
const L_DEEP = rgb("#566a60");
const L_VEIN = rgb("#e1e8da");
const L_RUST = rgb("#a58058");
const L_ROUGH = rgb("#6f6b5f");
const L_WARM = rgb("#fff4dc");

const _v = new THREE.Vector3();

// Polished soapstone: slow mottling, pale veins, rust blooms, warm polish on top, cool shade underneath,
// and unfinished rasp-cut stone at the feet.
const soap = paint((p, n) => {
  const big = noise(p, 0.45, 3);
  let c = mix(L_MID, L_LIT, smoothstep(0.3, 0.75, big));
  c = mix(c, L_DEEP, 0.55 * smoothstep(0.55, 0.85, noise(p, 0.3, 21)));
  _v.set(p.x * 0.5 + 0.6 * noise(p, 0.5, 5), p.y * 1.6, p.z * 0.35);
  const vein = Math.abs(noise(_v, 0.22, 11) - 0.5);
  c = mix(c, L_VEIN, 0.55 * smoothstep(0.035, 0, vein));
  c = mix(c, L_RUST, 0.4 * smoothstep(0.62, 0.8, noise(p, 0.12, 31)));
  const grit = (noise(p, 0.04, 8) - 0.5) * 0.1;
  c = [c[0] + grit, c[1] + grit, c[2] + grit];
  c = mix(c, L_WARM, 0.2 * smoothstep(0.4, 1, n.y));
  c = mix(c, L_DEEP, 0.4 * smoothstep(0.1, -0.9, n.y));
  c = mix(c, L_ROUGH, 0.85 * smoothstep(0.2, 0.04, p.y));
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
// Incised line textures (dark cut with a chalky lower lip)
const svgWrap = (w: number, h: number, body: string, size = 256) =>
  svg(
    `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`,
    { size },
  );
const cut = (d: string, w = 2.6) =>
  `<path d="${d}" transform="translate(0.9 1.3)" stroke="${CHALK}" stroke-width="${(w * 0.55).toFixed(2)}"/>` +
  `<path d="${d}" stroke="${INCISE}" stroke-width="${w}"/>`;

function tuftTexture(rows: number, cols: number, seed: number) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const x = ((j + (i % 2 ? 0.5 : 0) + 0.5) / cols) * 100;
      if (x > 93) continue;
      const y = ((i + 0.5) / rows) * 100;
      const len = (100 / rows) * (0.72 + r() * 0.12);
      const lean = 3 + r() * 3;
      out += cut(
        `M${x.toFixed(1)} ${(y - len / 2).toFixed(1)} Q${(x + lean * 1.6).toFixed(1)} ${y.toFixed(1)} ${(x + lean * 0.3).toFixed(1)} ${(y + len / 2).toFixed(1)}`,
      );
    }
  return svgWrap(100, 100, out);
}

function veeTexture(rows: number, cols: number) {
  let out = "";
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const w = 100 / cols;
      const x = j * w + (i % 2 ? w / 2 : 0) + w * 0.12;
      if (x + w * 0.76 > 98) continue;
      const y = (i / rows) * 100 + 4;
      const h = (100 / rows) * 0.62;
      out += cut(`M${x.toFixed(1)} ${(y + h).toFixed(1)} L${(x + w * 0.38).toFixed(1)} ${y.toFixed(1)} L${(x + w * 0.76).toFixed(1)} ${(y + h).toFixed(1)}`);
    }
  return svgWrap(100, 100, out);
}

function swirlTexture() {
  const arm = (phase: number) => {
    let d = "";
    for (let k = 0; k <= 70; k++) {
      const a = phase + (k / 70) * Math.PI * 2 * 2.2;
      const r = 4 + (k / 70) * 40;
      d += `${k ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
    }
    return d;
  };
  return svgWrap(100, 100, cut(arm(0), 3) + cut(arm(Math.PI), 3), 256);
}

function scallopTexture() {
  let out = "";
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 5; j++) {
      const w = 20;
      const x0 = j * w + (i % 2 ? w / 2 : 0) + 1.5;
      if (x0 + w - 3 > 99) continue;
      const y = 14 + i * 18;
      out += cut(`M${x0} ${y} A${(w - 3) / 2} ${(w - 3) / 2} 0 0 0 ${x0 + w - 3} ${y}`, 2.6);
    }
  return svgWrap(100, 100, out);
}

function chevronTexture() {
  let out = "";
  for (let i = 0; i < 4; i++) {
    const y = 14 + i * 24;
    let d = `M4 ${y}`;
    for (let k = 1; k <= 6; k++) d += ` L${4 + k * 15.3} ${y + (k % 2 ? 9 : 0)}`;
    out += cut(d, 2.8);
  }
  return svgWrap(100, 100, out);
}

function eyeTexture() {
  return svgWrap(
    80,
    70,
    `<path d="M6 40 Q40 8 76 36 Q42 66 6 40Z" fill="#12171a" stroke="#445a50" stroke-width="3.2"/>
     <ellipse cx="31" cy="35" rx="7" ry="5.2" fill="#f6f1e0" stroke="none" transform="rotate(-12 31 35)"/>
     <circle cx="52" cy="44" r="2.4" fill="#cfd8cc" stroke="none"/>
     <path d="M2 34 Q40 -2 78 28" stroke="${INCISE}" stroke-width="3.4"/>
     <path d="M6 12 Q36 -2 70 8" stroke="${INCISE}" stroke-width="2.6"/>`,
    256,
  );
}

function signTexture() {
  return svgWrap(
    100,
    56,
    cut("M10 44 L24 12 L38 44", 4.5) +
      cut("M52 12 Q76 12 76 28 Q76 44 52 44", 4.5) +
      cut("M86 28 L88 28", 6) +
      cut("M4 52 L96 52", 2.4),
    256,
  );
}

// ---------------------------------------------------------------------------------------------------------------
type Key = [number, number, number];
const keyed = (keys: Key[]) => (t: number): [number, number] => {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1];
      const c = keys[i];
      const u = smoothstep(a[0], c[0], t);
      return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
};

type Pt = [number, number] | [number, number, "sharp"];
const tuftBack = (k: number): Pt[] => [
  [0, 0.07 * k],
  [0.1 * k, 0.05 * k],
  [0.2 * k, -0.03 * k, "sharp"],
  [0.08 * k, -0.05 * k],
  [0, -0.09 * k],
];
const tuftDown = (k: number): Pt[] => [
  [0, 0.06 * k],
  [0.07 * k, 0.03 * k],
  [0.12 * k, -0.1 * k, "sharp"],
  [0.04 * k, -0.05 * k],
  [0, -0.1 * k],
];

export default function build() {
  const b = createBuilder({ name: "soapstone_polar_bear", paintSize: 2048 });

  const TUFT = tuftTexture(6, 6, 4);
  const VEES = veeTexture(6, 4);
  const SWIRL = swirlTexture();
  const SCALLOP = scallopTexture();
  const CHEV = chevronTexture();
  const EYE = eyeTexture();
  const SIGN = signTexture();

  const SPH = new THREE.SphereGeometry(1, 14, 10);
  const SPH_S = new THREE.SphereGeometry(1, 8, 6);

  // ----------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.92, -0.8], dir: [0, 0.05, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.92, -0.8],
      [0, 0.97, -0.35],
      [0, 1.03, 0.1],
      [0, 1.1, 0.5],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.1, 0.5],
      [0, 1.12, 0.75],
      [0, 1.06, 1.0],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: neck.at(1), dir: [0, -0.1, 1], role: "head" });
  const HL = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", {
    parent: head,
    at: HL(0.2, -0.1),
    aim: HL(0.62, -0.15),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.97, -1.0],
      [0, 0.98, -1.18],
      [0, 0.93, -1.3],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ----------------------------------------------------------------- body
  const body = b.sweep(
    spine,
    keyed([
      [0, 0.33, 0.35],
      [0.15, 0.37, 0.39],
      [0.5, 0.4, 0.41],
      [0.8, 0.42, 0.42],
      [1, 0.37, 0.38],
    ]),
    { color: soap, sides: 14, shift: [0, -0.03] },
  );
  const hump = b.part(SPH, soap, {
    bone: spine.joints[2],
    at: [0, 1.42, 0.28],
    scale: [0.3, 0.16, 0.34],
  });
  const neckTube = b.sweep(neck, (t) => [0.29 - 0.02 * t, 0.3 - 0.02 * t], { color: soap, sides: 14 });
  b.sweep(tail, [0.1, 0.06], { color: soap, sides: 10 });

  // ----------------------------------------------------------------- legs
  const paw = (bone: typeof hips, cx: number, cz: number, sc: number) => {
    b.part(SPH, soap, { bone, at: [cx, 0.075, cz + 0.08 * sc], scale: [0.16 * sc, 0.08, 0.22 * sc] });
    for (let j = -2; j <= 2; j++) {
      const tx = cx + j * 0.058 * sc;
      const tz = cz + (0.27 - Math.abs(j) * 0.02) * sc;
      b.part(SPH_S, soap, { bone, at: [tx, 0.048, tz], scale: [0.032 * sc, 0.044, 0.05 * sc] });
      const d = new THREE.Vector3(j * 0.06, -0.3, 1).normalize();
      b.part(new THREE.ConeGeometry(0.013 * sc, 0.075, 5), IVORY, {
        bone,
        at: [tx + d.x * 0.05, 0.048 + d.y * 0.05, tz + d.z * 0.05],
        dir: d,
      });
    }
  };

  const legSweeps: { sweep: ReturnType<typeof b.sweep>; s: number; front: boolean }[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front leg
    const fp = limb([s * 0.3, 0.88, 0.45], [s * 0.28, 0.13, 0.5], [0.42, 0.4], [[0, 0, -1]]);
    const fleg = b.chain(`legF${S}`, fp, {
      parent: spine.tip!,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
      contact: [s * 0.28, 0, 0.58],
    });
    legSweeps.push({ sweep: b.sweep(fleg, [0.27, 0.22, 0.18, 0.14], { color: soap, sides: 12 }), s, front: true });
    paw(fleg.joints[2], s * 0.28, 0.5, 1);
    // elbow fringe: three downward tufts hanging off the back of the arm
    const e = fleg.joints[1].at;
    for (let i = 0; i < 3; i++)
      b.extrude(tuftDown(1.05 - i * 0.12), {
        at: [s * 0.3, e.y + 0.02 - i * 0.1, e.z - 0.16 - i * 0.01],
        x: [0, 0, -1],
        thickness: 0.07 - i * 0.01,
        bevel: 0.014,
        smoothing: 1,
        color: soap,
        bone: fleg.joints[1],
      });

    // hind leg
    const hp = limb([s * 0.3, 0.82, -0.7], [s * 0.28, 0.13, -0.72], [0.38, 0.38], [[0, 0, 1]]);
    const hleg = b.chain(`legH${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.28, 0, -0.62],
    });
    legSweeps.push({ sweep: b.sweep(hleg, [0.29, 0.23, 0.18, 0.15], { color: soap, sides: 12 }), s, front: false });
    paw(hleg.joints[2], s * 0.28, -0.72, 1.1);
  }

  // ----------------------------------------------------------------- head
  const skull = b.part(SPH, soap, { bone: head, at: HL(0.14, 0), scale: [0.24, 0.22, 0.25] });
  const snout = b.sweep([HL(0.28, -0.02), HL(0.66, -0.06)], (t) => [0.15 - 0.055 * t, 0.115 - 0.035 * t], {
    bone: head,
    color: soap,
    sides: 12,
  });
  b.sweep([HL(0.2, -0.15), HL(0.58, -0.168)], (t) => [0.1 - 0.03 * t, 0.06 - 0.018 * t], {
    bone: jaw,
    color: soap,
    sides: 10,
  });
  b.part(SPH, DARK, { bone: head, at: HL(0.45, -0.145), scale: [0.08, 0.03, 0.2] }); // mouth shadow
  b.part(SPH, DARK, { bone: head, at: HL(0.72, -0.02), scale: [0.07, 0.058, 0.052] }); // nose inlay
  b.part(SPH_S, IVORY, { bone: head, at: HL(0.745, 0.0, 0.025), scale: [0.012, 0.01, 0.01] }); // nose glint

  // teeth: upper fangs on the head, lower canines on the jaw
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.018, 0.06, 5), IVORY, { bone: head, at: HL(0.57, -0.125, s * 0.055), dir: [0, -1, 0] });
    b.part(new THREE.ConeGeometry(0.015, 0.05, 5), IVORY, { bone: jaw, at: HL(0.54, -0.135, s * 0.05), dir: [0, 1, 0] });
  }

  // ears
  for (const s of [1, -1]) {
    const d = new THREE.Vector3(s * 0.45, 0.45, 0.6).normalize();
    const ep = HL(0.02, 0.14, s * 0.16);
    b.part(SPH, soap, { bone: head, at: ep, dir: d, axis: "z", scale: [0.078, 0.078, 0.045] });
    b.part(SPH, DEEP, { bone: head, at: ep.clone().addScaledVector(d, 0.03), dir: d, axis: "z", scale: [0.048, 0.048, 0.028] });
  }

  // brow ridges, cheek tufts
  for (const s of [1, -1]) {
    b.part(SPH, soap, { bone: head, at: HL(0.2, 0.17, s * 0.14), scale: [0.07, 0.03, 0.075] });
    for (let i = 0; i < 3; i++)
      b.extrude(tuftBack(1.15 - i * 0.18), {
        at: HL(0.17 - i * 0.01, 0.01 - i * 0.07, s * 0.215),
        x: [0, 0, -1],
        thickness: 0.07,
        bevel: 0.015,
        smoothing: 1,
        color: soap,
        bone: head,
      });
  }

  // lip line, whisker dots
  const snoutSkin = b.surface(snout);
  for (const s of [1, -1]) {
    const lip = snoutSkin.drape(
      catmull([HL(0.34, -0.085, s * 0.125), HL(0.5, -0.095, s * 0.1), HL(0.66, -0.098, s * 0.06), HL(0.74, -0.09, s * 0.02)]),
      { lift: 0.002 },
    );
    b.sweep(lip, 0.005, { color: DARK, sides: 6, bone: head });
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        const hit = snoutSkin.nearest(HL(0.5 + c * 0.055 + r * 0.02, 0.0 - r * 0.03, s * 0.12));
        b.stick(SPH_S.clone().scale(0.011, 0.011, 0.011), DARK, hit, { embed: 0.5, bone: head });
      }
  }

  // ----------------------------------------------------------------- inlaid ivory beads along the spine
  const topSkin = b.surface([body, hump, neckTube]);
  for (let i = 0; i < 14; i++) {
    const z = -0.9 + i * 0.131;
    const hit = topSkin.ray([0, 3, z], [0, -1, 0]);
    if (hit) b.stick(new THREE.CylinderGeometry(0.018, 0.018, 0.014, 8), IVORY, hit, { embed: 0.45 });
  }
  // forehead beads
  const skullSkin = b.surface(skull);
  for (let i = -1; i <= 1; i++) {
    const hit = skullSkin.ray(HL(0.02 + Math.abs(i) * -0.0, 0.8, i * 0.05), [0, -1, 0]);
    if (hit) b.stick(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8), IVORY, hit, { embed: 0.45 });
  }

  // ----------------------------------------------------------------- incised surface drawings
  type Target = Parameters<typeof b.decal>[0];
  const cache = new Map<unknown, ReturnType<typeof b.surface>>();
  const decalOn = (
    target: Target,
    origin: [number, number, number] | THREE.Vector3,
    dir: [number, number, number],
    tex: ReturnType<typeof svg>,
    size: [number, number],
    opts: { up?: [number, number, number]; mirror?: boolean; segments?: number } = {},
  ) => {
    let sk = cache.get(target);
    if (!sk) {
      sk = b.surface(target);
      cache.set(target, sk);
    }
    const hit = sk.ray(origin, dir);
    if (!hit) return null;
    return b.decal(target, tex, { at: hit, size, segments: opts.segments ?? 12, up: opts.up, mirror: opts.mirror });
  };

  for (const s of [1, -1]) {
    // flank fur strokes
    decalOn(body, [s * 2, 1.0, -0.05], [-s, 0, 0], TUFT, [0.62, 0.5], { mirror: s < 0, segments: 14 });
    // eyes
    decalOn(skull, HL(0.22, 0.1, s * 0.8), [-s, 0, 0], EYE, [0.09, 0.08], { segments: 8 });
  }
  // herringbone down the back, scallops on the nape, vees on the brow
  decalOn(body, [0, 3, -0.4], [0, -1, 0], VEES, [0.5, 0.75], { up: [0, 0, -1], segments: 14 });
  decalOn(neckTube, [0, 3, 0.82], [0, -1, 0], SCALLOP, [0.3, 0.3], { up: [0, 0, 1], segments: 10 });
  decalOn(skull, HL(0.12, 0.8), [0, -1, 0], VEES, [0.2, 0.2], { up: [0, 0, -1], segments: 10 });

  for (const { sweep, s, front } of legSweeps) {
    // spiral on every thigh and shoulder
    decalOn(sweep, [s * 1.3, front ? 0.78 : 0.72, front ? 0.45 : -0.68], [-s, 0, 0], SWIRL, [0.3, 0.3], { segments: 12 });
    // zig-zag cuffs on the lower legs
    decalOn(sweep, [s * 0.29, 0.36, 2], [0, 0, -1], CHEV, [0.2, 0.26], { segments: 10 });
  }
  // the carver's mark on the left haunch
  const hindL = legSweeps.find((l) => !l.front && l.s > 0);
  if (hindL) decalOn(hindL.sweep, [1.3, 0.42, -0.7], [-1, 0, 0], SIGN, [0.14, 0.08], { segments: 8 });

  // ----------------------------------------------------------------- rest pose: jaw slightly open
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  return b.root;
}
