import * as THREE from "three";
import { createBuilder, rng, catmull, polyline, paint, noise, cells, mix, smoothstep, svg, grain } from "../../../../src/index";

export const meta = {
  name: "Cardboard Robot Kid",
  description:
    "A kid in a homemade cardboard-box robot costume: taped kraft torso box with bottle-cap buttons and a glowing screen, box helmet with a face window, foil and tube sleeves, shin boxes, spring antennas and sneakers.",
};

type V = [number, number, number];
const MARK = "#2a2320";
const FONT = `font-family="Comic Sans MS, Marker Felt, cursive" font-weight="bold"`;

// ---------------------------------------------------------------------------------------------------------------
// SVG helpers

function gearPath(cx: number, cy: number, r1: number, r2: number, n: number) {
  let d = "";
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [r1, a - step * 0.5],
      [r2, a - step * 0.27],
      [r2, a + step * 0.27],
      [r1, a + step * 0.5],
    ];
    for (const [r, ang] of pts) d += `${d ? "L" : "M"}${(cx + Math.sin(ang) * r).toFixed(1)} ${(cy - Math.cos(ang) * r).toFixed(1)}`;
  }
  return d + "Z";
}

function starPath(cx: number, cy: number, R: number, r: number) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + "Z";
}

function gaugeSvg(cx: number, cy: number, r: number) {
  const P = (ang: number, rad: number) => {
    const a = (ang * Math.PI) / 180;
    return `${(cx + Math.sin(a) * rad).toFixed(1)} ${(cy - Math.cos(a) * rad).toFixed(1)}`;
  };
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fffdf4" stroke="${MARK}" stroke-width="3"/>`;
  s += `<path d="M${P(50, r - 6)} A${r - 6} ${r - 6} 0 0 1 ${P(135, r - 6)}" fill="none" stroke="#d6382d" stroke-width="4"/>`;
  for (let i = 0; i <= 8; i++) {
    const a = -135 + (i * 270) / 8;
    s += `<path d="M${P(a, r - 3)} L${P(a, r - 10)}" stroke="${MARK}" stroke-width="2.2" stroke-linecap="round"/>`;
  }
  s += `<path d="M${cx} ${cy} L${P(35, r - 8)}" stroke="${MARK}" stroke-width="3" stroke-linecap="round"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${MARK}"/>`;
  return s;
}

const bolt = (x: number, y: number, k = 1, fill = "#f5c82e") =>
  `<path transform="translate(${x} ${y}) scale(${k})" d="M0 -22 L-14 4 H-3 L-9 24 L14 -6 H3 L10 -22 Z" fill="${fill}" stroke="${MARK}" stroke-width="3.2" stroke-linejoin="round"/>`;
const brad = (x: number, y: number) =>
  `<circle cx="${x}" cy="${y}" r="3.6" fill="#b9c0c7" stroke="${MARK}" stroke-width="1.6"/><path d="M${x - 2} ${y}h4M${x} ${y - 2}v4" stroke="${MARK}" stroke-width="1"/>`;
const heart = (x: number, y: number, k: number, fill = "#e03a3a") =>
  `<path transform="translate(${x} ${y}) scale(${k})" d="M0 18 C-26 2 -20 -18 -8 -15 C-4 -14 -1 -10 0 -7 C1 -10 4 -14 8 -15 C20 -18 26 2 0 18 Z" fill="${fill}" stroke="${MARK}" stroke-width="${3 / k}" stroke-linejoin="round"/>`;

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "cardboard_robot_kid", paintSize: 2048 });

  // ---- palette -------------------------------------------------------------------------------------------------
  const SKIN = "#f1b98f";
  const SKIN_DK = "#d8906b";
  const HAIR = "#6a3d20";
  const NAIL = "#f6cfc0";
  const INK = "#2b1f17";
  const RED = "#d8352a";
  const YELLOW = "#f2c230";
  const BLUE = "#2f6fd1";
  const GREEN = "#38b24f";
  const WHITE = "#f4efe3";
  const TAPE_TAN = "#dcbf84";
  const TAPE_RED = "#d63a30";
  const SOLE = "#efe9da";
  const SHOE = "#d23b34";
  const TUBE_BLUE = "#3b78c9";
  const SHIRT = "#f0c649";
  const PATCH = "#e0a34a";

  // ---- paints --------------------------------------------------------------------------------------------------
  const board = (seed: number, lo = "#a87a46", hi = "#c99c64") =>
    paint((p, n) => {
      const f = noise(p, 0.18, seed);
      let c = mix(lo, hi, smoothstep(0.25, 0.75, f));
      const rid = 0.5 + 0.5 * Math.sin((Math.abs(n.y) > 0.7 ? p.z : p.y) * 440);
      c = mix(c, "#8f6638", rid * 0.12);
      c = mix(c, "#dcba88", smoothstep(0.62, 0.78, noise(p, 0.035, seed + 4)) * 0.45);
      c = mix(c, "#5e4228", smoothstep(0.5, 0.1, p.y) * 0.45 * smoothstep(0.3, 0.9, noise(p, 0.05, seed + 8)));
      return mix(c, "#e8c898", Math.max(0, n.y) * 0.18);
    });
  const BOARD = board(3);
  const TUBE = board(11, "#c9a56f", "#e0c391");
  const FOIL = paint((p, n) => {
    const c = cells(p, 0.028, 5);
    const edge = smoothstep(0.12, 0.0, c.d2 - c.d1);
    let base = mix("#8f98a3", "#eef2f6", 0.15 + 0.7 * c.id);
    base = mix(base, "#c7d6e6", noise(p, 0.1, 2) * 0.3);
    base = mix(base, "#59626d", edge * 0.55);
    return mix(base, "#ffffff", Math.max(0, n.y) * 0.25);
  });
  const DUCT = paint((p, n) => {
    const c = mix("#8f979f", "#c9ced3", noise(p, 0.012, 6));
    return mix(c, "#e6eaee", Math.max(0, n.y) * 0.3);
  });
  const JEANS = grain("#3d5a96", "#4f70b0", { size: 0.01, axis: "y", seed: 2 });

  // ---- helpers -------------------------------------------------------------------------------------------------
  const lit = (target: any, strength = 1) => {
    const meshes: THREE.Mesh[] = target.meshes ?? (target.mesh ? [target.mesh] : Array.isArray(target) ? target : [target]);
    for (const m of meshes) {
      const mat = m.material as THREE.MeshStandardMaterial;
      const c = mat.clone();
      c.emissive.copy(mat.color);
      c.emissiveMap = mat.map;
      c.emissiveIntensity = strength;
      m.material = c;
    }
    return target;
  };
  const box = (size: V, at: V, color: any, bone: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, bone, ...opts });
  const cyl = (r0: number, r1: number, h: number, seg: number, at: V, dir: V, color: any, bone: any, opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, dir, bone, ...opts });
  const blob = (r: V, at: V, color: any, bone: any, seg = 10, rows = 8, opts: any = {}) =>
    b.part(new THREE.SphereGeometry(1, seg, rows), color, { at, scale: r, bone, ...opts });
  const plane = (w: number, h: number, at: V, dir: V, tex: any, bone: any, opts: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, bone, ...opts });
  const dome = (at: V, dir: V, r: number, color: any, bone: any) =>
    blob([r, r * 0.55, r], at, color, bone, 8, 5, { dir });

  // ---- textures ------------------------------------------------------------------------------------------------
  const TORSO_FRONT = svg(
    `<svg viewBox="0 0 200 196" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12 L189 9 L191 88 L9 90 Z" fill="#f7f2e4" stroke="${MARK}" stroke-width="3.2" stroke-linejoin="round"/>
      ${gaugeSvg(50, 52, 28)}
      ${[30, 48, 66]
        .map(
          (y) =>
            `<path d="M92 ${y}H128" stroke="${MARK}" stroke-width="3" stroke-linecap="round"/><path d="M92 ${y - 5}v10M128 ${y - 5}v10" stroke="${MARK}" stroke-width="2.4" stroke-linecap="round"/>`,
        )
        .join("")}
      <rect x="133" y="17" width="51" height="60" rx="5" fill="${MARK}"/>
      ${brad(19, 20)}${brad(181, 18)}${brad(18, 80)}${brad(182, 80)}
      ${[34, 78, 122, 166]
        .map(
          (x, i) =>
            `<circle cx="${x}" cy="112" r="18" fill="none" stroke="${MARK}" stroke-width="2.6" stroke-dasharray="5 3"/><text x="${x}" y="143" text-anchor="middle" ${FONT} font-size="12" fill="${MARK}">${i + 1}</text>`,
        )
        .join("")}
      <rect x="10" y="150" width="62" height="38" rx="3" fill="#efe9d8" stroke="${MARK}" stroke-width="3"/>
      ${[158, 166, 174, 182].map((y) => `<path d="M16 ${y}H66" stroke="${MARK}" stroke-width="3.4" stroke-linecap="round"/>`).join("")}
      ${heart(100, 166, 1.15)}
      <path d="M76 170 H94 l5 -13 l8 28 l7 -21 l5 6 H146" fill="none" stroke="${MARK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      <g transform="rotate(-3 166 166)">
        <rect x="142" y="143" width="50" height="46" rx="3" fill="#fffdf4" stroke="${MARK}" stroke-width="2.4"/>
        <rect x="142" y="143" width="50" height="15" rx="3" fill="#d63a30" stroke="${MARK}" stroke-width="2.4"/>
        <text x="167" y="155" text-anchor="middle" ${FONT} font-size="10.5" fill="#fff">HELLO</text>
        <text x="167" y="166" text-anchor="middle" ${FONT} font-size="7" fill="${MARK}">my name is</text>
        <text x="167" y="184" text-anchor="middle" ${FONT} font-size="17" fill="#2f6fd1">MAX</text>
      </g>
      <path d="M0 2 L28 2 L2 30 L0 30Z" fill="#e8cf94" stroke="#bf9f60" stroke-width="1"/>
      <path d="M200 0 L172 0 L200 28Z" fill="#e8cf94" stroke="#bf9f60" stroke-width="1"/>
      <path d="M0 196 L0 172 L24 196Z" fill="#e8cf94" stroke="#bf9f60" stroke-width="1"/>
    </svg>`,
    { size: 640 },
  );

  const SCREEN = svg(
    `<svg viewBox="0 0 84 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="84" height="100" rx="5" fill="#06240f"/>
      <rect x="3" y="3" width="78" height="94" rx="4" fill="none" stroke="#39e86b" stroke-width="2"/>
      <rect x="20" y="20" width="14" height="14" fill="#7dff9d"/><rect x="50" y="20" width="14" height="14" fill="#7dff9d"/>
      <path d="M17 50 Q42 82 67 50" fill="none" stroke="#7dff9d" stroke-width="5" stroke-linecap="round"/>
      <path d="M8 84 H24 l4 -8 l6 14 l5 -10 l4 4 H76" fill="none" stroke="#39e86b" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M6 10 H78 M6 40 H78 M6 62 H78" stroke="#0a4a1d" stroke-width="1.2"/>
    </svg>`,
    { size: 256 },
  );

  const TORSO_BACK = svg(
    `<svg viewBox="0 0 200 196" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="16" width="120" height="70" rx="9" fill="#3fae52" stroke="${MARK}" stroke-width="3.4"/>
      <rect x="142" y="38" width="14" height="26" rx="3" fill="#b9c0c7" stroke="${MARK}" stroke-width="3"/>
      ${bolt(82, 51, 1.2)}
      <text x="34" y="35" ${FONT} font-size="16" fill="${MARK}">+</text>
      <text x="124" y="35" ${FONT} font-size="16" fill="${MARK}">-</text>
      ${[0, 1, 2, 3].map((i) => `<rect x="${32 + i * 12}" y="70" width="9" height="9" fill="${i < 3 ? "#d8f7a8" : "#2b7a39"}" stroke="${MARK}" stroke-width="1.4"/>`).join("")}
      <text x="100" y="108" text-anchor="middle" ${FONT} font-size="20" fill="#d63a30" transform="rotate(-4 100 108)">MAX'S ROBOT</text>
      <g transform="rotate(2 100 150)">
        <rect x="20" y="118" width="160" height="62" fill="#fffdf4" stroke="${MARK}" stroke-width="2.6"/>
        <text x="28" y="134" ${FONT} font-size="10" fill="${MARK}">TO: MOM AND DAD</text>
        <text x="28" y="147" ${FONT} font-size="7.5" fill="${MARK}">HANDLE WITH CARE</text>
        <rect x="28" y="152" width="56" height="20" fill="#d63a30"/>
        <text x="56" y="167" text-anchor="middle" ${FONT} font-size="12" fill="#fff">FRAGILE</text>
        ${Array.from({ length: 22 }, (_, i) => `<rect x="${96 + i * 3.6}" y="136" width="${i % 3 === 0 ? 2.6 : 1.4}" height="36" fill="${MARK}"/>`).join("")}
      </g>
      <path d="M0 6 L30 6 L0 36Z" fill="#e8cf94" stroke="#bf9f60"/>
      <path d="M200 190 L170 190 L200 160Z" fill="#e8cf94" stroke="#bf9f60"/>
    </svg>`,
    { size: 512 },
  );

  const TORSO_SIDE = svg(
    `<svg viewBox="0 0 150 225" xmlns="http://www.w3.org/2000/svg">
      <path d="${gearPath(75, 35, 36, 44, 12)}" fill="#e8e2d0" stroke="${MARK}" stroke-width="3" stroke-linejoin="round"/>
      ${bolt(75, 112, 1.3)}
      <path d="${starPath(30, 96, 11, 5)}" fill="#e8453c" stroke="${MARK}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="${starPath(122, 90, 9, 4)}" fill="#2f6fd1" stroke="${MARK}" stroke-width="2.4" stroke-linejoin="round"/>
      ${[42, 108]
        .map(
          (x) =>
            `<path d="M${x} 190 V156 M${x - 12} 168 L${x} 152 L${x + 12} 168" fill="none" stroke="#3a2e26" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
        )
        .join("")}
      <text x="75" y="213" text-anchor="middle" ${FONT} font-size="13" fill="#3a2e26">THIS SIDE UP</text>
      ${brad(12, 12)}${brad(138, 12)}${brad(12, 140)}${brad(138, 140)}
    </svg>`,
    { size: 512 },
  );

  const HELM_FRONT = svg(
    `<svg viewBox="0 0 370 320" xmlns="http://www.w3.org/2000/svg">
      ${bolt(46, 130, 1.4)}
      <path d="${gearPath(46, 230, 18, 25, 8)}" fill="#e8e2d0" stroke="${MARK}" stroke-width="3.4" stroke-linejoin="round"/>
      <circle cx="46" cy="230" r="7" fill="${MARK}"/>
      <path d="${starPath(326, 128, 24, 11)}" fill="#e8453c" stroke="${MARK}" stroke-width="3.4" stroke-linejoin="round"/>
      ${heart(326, 228, 1.2, "#f5c82e")}
      ${bolt(30, 40, 0.75, "#2f6fd1")}${bolt(340, 40, 0.75, "#38b24f")}
      <path d="M62 40 H112 M258 40 H308" stroke="${MARK}" stroke-width="4" stroke-dasharray="7 6" stroke-linecap="round"/>
      ${Array.from({ length: 11 }, (_, i) => `<path d="M${105 + i * 16} 292 V312" stroke="${MARK}" stroke-width="6" stroke-linecap="round"/>`).join("")}
      ${brad(14, 14)}${brad(356, 14)}${brad(14, 306)}${brad(356, 306)}
    </svg>`,
    { size: 640 },
  );

  const HELM_SIDE = svg(
    `<svg viewBox="0 0 340 320" xmlns="http://www.w3.org/2000/svg">
      <circle cx="170" cy="160" r="82" fill="none" stroke="${MARK}" stroke-width="5" stroke-dasharray="14 9"/>
      ${[-1, 1].map((k) => `<path d="M${170 + k * 100} 120 Q${170 + k * 124} 160 ${170 + k * 100} 200" fill="none" stroke="${MARK}" stroke-width="5" stroke-linecap="round"/>`).join("")}
      <text x="46" y="60" ${FONT} font-size="30" fill="#d63a30" transform="rotate(-10 46 60)">BEEP</text>
      <text x="206" y="298" ${FONT} font-size="30" fill="#2f6fd1" transform="rotate(-6 206 298)">BOOP</text>
      ${bolt(290, 70, 0.9)}
      ${brad(16, 16)}${brad(324, 16)}${brad(16, 304)}${brad(324, 304)}
    </svg>`,
    { size: 384 },
  );

  const HELM_TOP = svg(
    `<svg viewBox="0 0 370 340" xmlns="http://www.w3.org/2000/svg">
      ${[60, 100, 140].map((y) => `<rect x="40" y="${y}" width="110" height="22" rx="11" fill="${MARK}"/>`).join("")}
      <path d="${starPath(270, 90, 38, 17)}" fill="#e8453c" stroke="${MARK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M190 -2 L252 -2 L248 342 L194 342Z" fill="#e1c486" opacity="0.92" stroke="#bf9f60" stroke-width="2"/>
      <text x="90" y="240" text-anchor="middle" ${FONT} font-size="34" fill="#2f6fd1" transform="rotate(-8 90 240)">R-0B0</text>
      <path d="M60 290 H130" stroke="${MARK}" stroke-width="5" stroke-dasharray="10 8" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const HELM_BACK = svg(
    `<svg viewBox="0 0 370 312" xmlns="http://www.w3.org/2000/svg">
      <text x="185" y="150" text-anchor="middle" ${FONT} font-size="86" fill="#d63a30" stroke="${MARK}" stroke-width="5" paint-order="stroke">MAX</text>
      <path d="M40 200 H330" stroke="${MARK}" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round"/>
      ${bolt(70, 255, 0.9)}${bolt(300, 255, 0.9, "#38b24f")}
      ${brad(16, 16)}${brad(354, 16)}${brad(16, 296)}${brad(354, 296)}
    </svg>`,
    { size: 384 },
  );

  const EAR = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="f" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stop-color="#f2f5f8"/><stop offset="1" stop-color="#8d96a1"/></radialGradient></defs>
      <circle cx="50" cy="50" r="50" fill="url(#f)"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="#d63a30" stroke-width="7"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#4b535c" stroke-width="3"/>
      <circle cx="50" cy="50" r="18" fill="none" stroke="#4b535c" stroke-width="3"/>
      <circle cx="50" cy="50" r="6" fill="#2a2320"/>
    </svg>`,
    { size: 128 },
  );

  const EYE = svg(
    `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="36" rx="25" ry="31" fill="#fffdf8" stroke="#3a2418" stroke-width="3"/>
      <circle cx="31" cy="40" r="19" fill="#8a5a2e"/>
      <circle cx="31" cy="40" r="14" fill="#5b3418"/>
      <circle cx="31" cy="40" r="8" fill="#100906"/>
      <circle cx="23" cy="31" r="6.5" fill="#fff"/>
      <circle cx="38" cy="48" r="3" fill="#fff"/>
      <path d="M5 28 Q30 -2 55 28" fill="none" stroke="#3a2418" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );
  const BROW = svg(
    `<svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 18 Q26 2 56 10" fill="none" stroke="#5a321a" stroke-width="8" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const MOUTH = svg(
    `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8 Q50 14 94 8 Q88 48 50 46 Q12 48 6 8 Z" fill="#6a1f1f" stroke="#8a3b33" stroke-width="4" stroke-linejoin="round"/>
      <path d="M12 10 Q50 15 88 10 L86 22 Q50 26 14 22Z" fill="#fffdf6"/>
      <ellipse cx="50" cy="40" rx="20" ry="8" fill="#e8737c"/>
    </svg>`,
    { size: 192 },
  );
  const BLUSH = svg(
    `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="20" rx="26" ry="16" fill="#f0908a"/>
      <circle cx="18" cy="18" r="2.2" fill="#c06a52"/><circle cx="30" cy="14" r="2.2" fill="#c06a52"/><circle cx="40" cy="22" r="2.2" fill="#c06a52"/><circle cx="26" cy="26" r="2" fill="#c06a52"/>
    </svg>`,
    { size: 128 },
  );
  const HAIR_TEX = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 64 Q0 30 17 0 Q31 30 29 64 Z" fill="#6d4024" stroke="#3f2411" stroke-width="2" stroke-linejoin="round"/>
      <path d="M12 60 Q10 34 17 12 Q22 34 20 60 Z" fill="#8c5a32"/>
    </svg>`,
    { size: 128 },
  );
  const FRAGILE = svg(
    `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="96" height="66" rx="6" fill="#fffdf4" stroke="#d63a30" stroke-width="5"/>
      <text x="62" y="30" text-anchor="middle" ${FONT} font-size="17" fill="#d63a30">FRAGILE</text>
      <text x="62" y="52" text-anchor="middle" ${FONT} font-size="10" fill="${MARK}">KID INSIDE</text>
      <path d="M14 14 H34 L30 36 Q24 44 18 36 Z M24 42 V56 M15 58 H33" fill="#bfe3f2" stroke="${MARK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const STAR_PATCH = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#fffdf4" stroke="#2b3a7a" stroke-width="6"/>
      <path d="${starPath(50, 52, 34, 15)}" fill="#2b3a7a"/>
    </svg>`,
    { size: 128 },
  );

  // ---- skeleton ------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.47, 0] });
  const spine = b.chain("spine", catmull([[0, 0.5, 0], [0, 0.62, 0], [0, 0.78, 0], [0, 0.94, 0]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.94, 0], dir: [0, 1, 0.05], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.03, 0.01], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.105, -0.005], aim: [0, 1.075, 0.11], role: "jaw" });

  // ---- pelvis, neck, shirt ---------------------------------------------------------------------------------------
  blob([0.14, 0.075, 0.1], [0, 0.465, 0], JEANS, hips, 10, 6);
  blob([0.19, 0.04, 0.12], [0, 0.955, 0], SHIRT, chest, 10, 6);
  b.sweep(polyline([[0, 0.92, 0], [0, 1.06, 0.012]]), 0.036, { color: SKIN, bone: neck, sides: 8 });

  // ---- legs & shoes ------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const sx = s * 0.115;
    const leg = b.chain(`leg${n}`, polyline([[s * 0.085, 0.45, 0], [s * 0.1, 0.25, 0.006], [sx, 0.075, 0]]), {
      parent: hips,
      names: [`hip${n}`, `knee${n}`, `ankle${n}`],
      role: "leg",
      contact: [sx, 0, 0.04],
    });
    const jeans = b.sweep(leg, [0.058, 0.046, 0.034], { color: JEANS, sides: 8 });
    const toe = b.joint(`toe${n}`, { parent: leg.tip!, at: [sx, 0.03, 0.07], aim: [sx, 0.03, 0.17], role: "digit" });
    const ankle = leg.tip!;
    const shin = leg.joints[1];

    // knee patch
    const kh = b.surface(jeans).ray([s * 0.1, 0.275, 0.4], [0, 0, -1]);
    if (kh) b.stick(new THREE.BoxGeometry(0.05, 0.045, 0.012), PATCH, kh, { embed: 0.4 });

    // cardboard shin box
    box([0.13, 0.13, 0.14], [s * 0.108, 0.18, 0.005], BOARD, shin);
    box([0.136, 0.014, 0.146], [s * 0.108, 0.241, 0.005], FOIL, shin);
    box([0.136, 0.018, 0.146], [s * 0.108, 0.124, 0.005], DUCT, shin);
    plane(0.1, 0.07, [s * 0.108, 0.186, 0.0762], [0, 0, 1], FRAGILE, shin);
    box([0.006, 0.09, 0.146], [s * 0.1745, 0.18, 0.005], DUCT, shin, { scale: [1, 0.8, 1] });

    // sneaker
    box([0.1, 0.03, 0.13], [sx, 0.015, -0.005], SOLE, ankle);
    box([0.1, 0.03, 0.11], [sx, 0.015, 0.12], SOLE, toe);
    blob([0.047, 0.046, 0.066], [sx, 0.062, -0.012], SHOE, ankle, 10, 7);
    blob([0.046, 0.034, 0.075], [sx, 0.05, 0.1], SHOE, toe, 10, 7);
    blob([0.044, 0.03, 0.032], [sx, 0.045, 0.15], WHITE, toe, 8, 6);
    cyl(0.039, 0.039, 0.022, 10, [sx, 0.105, 0], [0, 1, 0], WHITE, ankle);
    box([0.05, 0.014, 0.075], [sx, 0.102, 0.045], WHITE, ankle, { rotation: [-18, 0, 0] });
    for (const z of [0.022, 0.045, 0.068])
      box([0.056, 0.005, 0.008], [sx, 0.112 - z * 0.3, z], RED, ankle, { rotation: [-18, 0, 0] });
    b.part(new THREE.CircleGeometry(0.02, 12), "#ffffff", {
      at: [s * 0.1585, 0.065, -0.008],
      dir: [s, 0, 0],
      axis: "z",
      texture: STAR_PATCH,
      bone: ankle,
    });
  }

  // ---- torso box ---------------------------------------------------------------------------------------------------
  const TX = 0.46, TY = 0.45, TZ = 0.3, TC = 0.745;
  const FZ = TZ / 2;
  box([TX, TY, TZ], [0, TC, 0], BOARD, chest);
  plane(0.44, 0.43, [0, TC, FZ + 0.0015], [0, 0, 1], TORSO_FRONT, chest);
  plane(0.44, 0.43, [0, TC, -FZ - 0.0015], [0, 0, -1], TORSO_BACK, chest);
  for (const s of [1, -1]) {
    plane(0.3, 0.45, [s * (TX / 2 + 0.0015), TC, 0], [s, 0, 0], TORSO_SIDE, chest);
    // arm hole
    cyl(0.062, 0.062, 0.004, 12, [s * 0.2325, 0.9, 0], [s, 0, 0], INK, chest);
    b.part(new THREE.TorusGeometry(0.067, 0.006, 5, 16), TAPE_TAN, { at: [s * 0.2335, 0.9, 0], dir: [s, 0, 0], axis: "z", bone: chest });
    // duct-tape wrapped corners
    for (const f of [1, -1]) {
      box([0.022, TY, 0.003], [s * 0.219, TC, f * (FZ + 0.0015)], DUCT, chest);
      box([0.003, TY, 0.022], [s * (TX / 2 + 0.0015), TC, f * 0.139], DUCT, chest);
    }
  }
  // packing tape across bottom front edge and strips
  box([0.4, 0.02, 0.003], [0, 0.535, FZ + 0.0035], TAPE_TAN, chest);

  const fp = (u: number, v: number, dz = 0): V => [((u - 100) / 200) * 0.44, TC + ((98 - v) / 196) * 0.43, FZ + 0.0015 + dz];

  // bottle-cap buttons
  const caps: [number, string, string][] = [
    [34, RED, "#f06a5c"],
    [78, YELLOW, "#ffe27a"],
    [122, GREEN, "#7fe08f"],
    [166, BLUE, "#6fa6f2"],
  ];
  for (const [u, c1, c2] of caps) {
    const at = fp(u, 112, 0.004);
    cyl(0.027, 0.029, 0.008, 14, at, [0, 0, 1], c1, chest);
    cyl(0.019, 0.019, 0.0095, 14, at, [0, 0, 1], c2, chest);
  }
  // slider handles
  [[30, 108, RED], [48, 118, YELLOW], [66, 100, BLUE]].forEach(([v, u, c]) => {
    box([0.022, 0.014, 0.01], fp(u as number, v as number, 0.005), c, chest);
  });
  // LEDs
  [[96, GREEN], [108, YELLOW], [120, RED]].forEach(([u, c]) => {
    lit(blob([0.0075, 0.0075, 0.0075], fp(u as number, 80, 0.003), c, chest, 6, 4), 1.6);
  });
  // gauge glass lens
  b.part(new THREE.CylinderGeometry(0.0545, 0.0545, 0.004, 14), "#cfe9f2", {
    at: fp(50, 52, 0.002),
    dir: [0, 0, 1],
    bone: chest,
    opacity: undefined,
  } as any);
  // screen
  box([0.106, 0.128, 0.012], fp(159, 47, 0.006), INK, chest);
  lit(plane(0.092, 0.11, fp(159, 47, 0.0125), [0, 0, 1], SCREEN, chest), 1.3);
  // red cardboard "heart button"
  b.part(new THREE.TorusGeometry(0.014, 0.004, 5, 10), TAPE_RED, { at: fp(100, 166, 0.003), dir: [0, 0, 1], axis: "z", bone: chest });

  // ---- helmet --------------------------------------------------------------------------------------------------------
  const T = 0.008;
  const HZ = 0.17, HX = 0.185, HY0 = 1.0, HY1 = 1.32;
  box([0.37, T, 0.34], [0, HY1 - T / 2, 0], BOARD, head);
  box([T, 0.312, 0.34], [HX - T / 2, 1.156, 0], BOARD, head);
  box([T, 0.312, 0.34], [-HX + T / 2, 1.156, 0], BOARD, head);
  box([0.354, 0.312, T], [0, 1.156, -HZ + T / 2], BOARD, head);
  // front frame with the face window (y 1.04..1.24, x -0.1..0.1)
  box([0.354, 0.072, T], [0, 1.276, HZ - T / 2], BOARD, head);
  box([0.354, 0.04, T], [0, 1.02, HZ - T / 2], BOARD, head);
  for (const s of [1, -1]) box([0.077, 0.2, T], [s * 0.1385, 1.14, HZ - T / 2], BOARD, head);
  plane(0.37, 0.32, [0, 1.16, HZ + 0.0005], [0, 0, 1], HELM_FRONT, head);
  plane(0.37, 0.34, [0, HY1 + 0.0007, 0], [0, 1, 0], HELM_TOP, head, { up: [0, 0, -1] });
  plane(0.37, 0.312, [0, 1.16, -HZ - 0.0007], [0, 0, -1], HELM_BACK, head);
  // red tape rim round the window
  box([0.216, 0.014, 0.003], [0, 1.244, HZ + 0.0025], TAPE_RED, head);
  box([0.216, 0.014, 0.003], [0, 1.036, HZ + 0.0025], TAPE_RED, head);
  for (const s of [1, -1]) box([0.014, 0.216, 0.003], [s * 0.104, 1.14, HZ + 0.0025], TAPE_RED, head);
  // helmet front lights (bottle caps)
  [[-0.045, RED, "#f06a5c"], [0, YELLOW, "#ffe27a"], [0.045, GREEN, "#7fe08f"]].forEach(([x, c1, c2]) => {
    const at: V = [x as number, 1.282, HZ + 0.004];
    cyl(0.014, 0.0152, 0.008, 12, at, [0, 0, 1], c1, head);
    lit(cyl(0.009, 0.009, 0.0095, 12, at, [0, 0, 1], c2, head), 1.5);
  });
  // brads on corners
  const bradPart = (at: V, dir: V, bone: any) => dome(at, dir, 0.007, FOIL, bone);
  for (const sx of [1, -1])
    for (const y of [1.305, 1.01]) bradPart([sx * 0.173, y, HZ + 0.0012], [0, 0, 1], head);
  // side ears (cardboard tube stubs) + speaker doodle
  for (const s of [1, -1]) {
    plane(0.34, 0.32, [s * (HX + 0.0007), 1.16, 0], [s, 0, 0], HELM_SIDE, head);
    cyl(0.056, 0.056, 0.062, 12, [s * 0.211, 1.16, 0], [s, 0, 0], TUBE, head);
    b.part(new THREE.CircleGeometry(0.052, 14), "#ffffff", {
      at: [s * 0.2425, 1.16, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: EAR,
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.056, 0.004, 5, 14), TAPE_TAN, { at: [s * 0.2415, 1.16, 0], dir: [s, 0, 0], axis: "z", bone: head });
    // brown tape on top-side edges
    box([0.003, 0.03, 0.14], [s * (HX + 0.0017), 1.3, -0.02], TAPE_TAN, head);
  }

  // ---- antennas -----------------------------------------------------------------------------------------------------------
  function helix(base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, turns: number) {
    const d = dir.clone().normalize();
    const u = new THREE.Vector3(0, 0, 1).cross(d).normalize();
    const v = d.clone().cross(u);
    const n = Math.round(turns * 7);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const a = t * turns * Math.PI * 2;
      pts.push(base.clone().addScaledVector(d, len * t).addScaledVector(u, r * Math.cos(a)).addScaledVector(v, r * Math.sin(a)));
    }
    return catmull(pts);
  }
  const SPRING = "#aab2bb";
  for (const s of [1, -1]) {
    const base = new THREE.Vector3(s * 0.09, 1.345, -0.03);
    const d = new THREE.Vector3(s * 0.28, 1, -0.05);
    cyl(0.021, 0.024, 0.032, 10, [s * 0.09, 1.336, -0.03], [0, 1, 0], TUBE, head);
    cyl(0.0235, 0.0235, 0.008, 10, [s * 0.09, 1.322, -0.03], [0, 1, 0], TAPE_RED, head);
    const L = 0.16;
    b.sweep(helix(base, d, L, 0.013, 6), 0.0028, { color: SPRING, bone: head, sides: 5 });
    const tip = base.clone().addScaledVector(d.clone().normalize(), L + 0.02);
    b.rod(base, tip, 0.0025, SPRING, { bone: head, sides: 5 });
    if (s > 0) {
      lit(blob([0.027, 0.027, 0.027], [tip.x, tip.y + 0.014, tip.z], "#ff3b30", head, 8, 6), 1.6);
      b.part(new THREE.TorusGeometry(0.02, 0.004, 5, 10), FOIL, { at: [tip.x, tip.y - 0.006, tip.z], dir: [0, 1, 0], axis: "z", rotation: [90, 0, 0], bone: head });
    } else {
      const outline = Array.from({ length: 10 }, (_, i) => {
        const a = Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? 0.014 : 0.034;
        return [Math.cos(a) * rr, Math.sin(a) * rr, "sharp"] as [number, number, "sharp"];
      });
      b.extrude(outline, { at: [tip.x, tip.y + 0.03, tip.z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, bevel: 0.002, color: FOIL, bone: head });
      blob([0.01, 0.01, 0.01], [tip.x, tip.y + 0.003, tip.z], WHITE, head, 6, 4);
    }
  }

  // ---- head & face -------------------------------------------------------------------------------------------------
  const HC: V = [0, 1.125, 0.015];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, { at: HC, scale: [0.098, 0.108, 0.1], bone: head });
  const jawPart = b.part(new THREE.SphereGeometry(1, 12, 8), SKIN, { at: [0, 1.06, 0.028], scale: [0.07, 0.042, 0.078], bone: jaw });
  for (const s of [1, -1]) blob([0.012, 0.026, 0.02], [s * 0.099, 1.12, 0.0], SKIN_DK, head, 6, 5);
  blob([0.014, 0.012, 0.014], [0, 1.108, 0.1], "#eaa27f", head, 8, 6); // nose
  // hair
  const cap = b.part(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, 1.15), HAIR, {
    at: [HC[0], HC[1] + 0.008, HC[2] - 0.006],
    scale: [0.106, 0.114, 0.108],
    bone: head,
  });
  blob([0.1, 0.085, 0.075], [0, 1.1, -0.045], HAIR, head, 10, 7);
  const hairSkin = b.surface(cap);
  const fringe = hairSkin.scatter(30, { rng: rng(11), minDist: 0.016, filter: (h) => h.at.z > 0.02 && h.at.y > 1.195 });
  if (fringe.length)
    b.cards(fringe, HAIR_TEX, { size: [0.032, 0.04], lean: 50, flow: [0, -0.7, 1], bend: 20, vary: 0.25, rng: rng(4), spin: 12 });
  const crown = hairSkin.scatter(16, { rng: rng(21), minDist: 0.03, filter: (h) => h.at.y > 1.22 || h.at.z < -0.03 });
  if (crown.length)
    b.cards(crown, HAIR_TEX, { size: [0.04, 0.06], lean: 35, flow: [0, 0.3, -1], bend: 15, vary: 0.3, rng: rng(5), spin: 25 });

  const sk = b.surface([skull, jawPart]);
  const eyeHit = (s: number) => sk.around(HC).at(s * 23, 0);
  for (const s of [1, -1]) {
    const h = eyeHit(s);
    if (h) b.decal(sk, EYE, { at: h, size: [0.034, 0.04], mirror: s > 0 });
    const hb = sk.around(HC).at(s * 24, 15);
    if (hb) b.decal(sk, BROW, { at: hb, size: [0.034, 0.013], mirror: s > 0, roll: s * 6 });
    const hc = sk.around(HC).at(s * 40, -10);
    if (hc) b.decal(sk, BLUSH, { at: hc, size: [0.032, 0.02] });
  }
  const hm = sk.around(HC).at(0, -22);
  if (hm) b.decal(sk, MOUTH, { at: hm, size: [0.052, 0.026], segments: 12 });

  // ---- arms & hands --------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const y = 0.9;
    const arm = b.chain(`arm${n}`, polyline([[s * 0.2, y, 0], [s * 0.385, y, 0], [s * 0.52, y, 0]]), {
      parent: chest,
      names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`],
      role: "arm",
    });
    b.sweep(arm, [0.03, 0.028, 0.023], { color: SKIN, sides: 8 });
    const sh = arm.joints[0];
    const el = arm.joints[1];
    // foil upper tube and blue forearm tube
    b.rod([s * 0.205, y, 0], [s * 0.372, y, 0], 0.048, FOIL, { sides: 10, bone: sh });
    b.rod([s * 0.366, y, 0], [s * 0.378, y, 0], 0.0505, TAPE_RED, { sides: 10, bone: sh });
    b.rod([s * 0.402, y, 0], [s * 0.492, y, 0], 0.042, TUBE_BLUE, { sides: 10, bone: el });
    b.rod([s * 0.396, y, 0], [s * 0.41, y, 0], 0.0445, DUCT, { sides: 10, bone: el });
    b.rod([s * 0.482, y, 0], [s * 0.494, y, 0], 0.0445, DUCT, { sides: 10, bone: el });
    b.rod([s * 0.44, y, 0], [s * 0.452, y, 0], 0.0435, YELLOW, { sides: 10, bone: el });
    // sweat band at wrist
    b.rod([s * 0.492, y, 0], [s * 0.515, y, 0], 0.03, WHITE, { sides: 8, bone: arm.tip! });
    b.rod([s * 0.5, y, 0], [s * 0.506, y, 0], 0.0315, RED, { sides: 8, bone: arm.tip! });
    // brad bolts on foil tube
    for (const xx of [0.25, 0.32]) bradPart([s * xx, y + 0.048, 0], [0, 1, 0], sh);

    // hand
    box([0.075, 0.016, 0.062], [s * 0.5555, y, 0.002], SKIN, arm.tip);
    const fingers: [string, number, number[], number][] = [
      ["index", 0.019, [0.026, 0.018, 0.016], 0.004],
      ["middle", 0.006, [0.029, 0.02, 0.017], 0.0012],
      ["ring", -0.007, [0.026, 0.018, 0.015], -0.002],
      ["pinky", -0.019, [0.02, 0.014, 0.013], -0.005],
    ];
    for (const [name, z0, segs, dz] of fingers) {
      let x = s * 0.593;
      let z = z0;
      const pts: V[] = [[x, y, z]];
      for (const L of segs) {
        x += s * L;
        z += dz;
        pts.push([x, y, z]);
      }
      const ch = b.chain(`${name}${n}`, polyline(pts), {
        parent: arm.tip!,
        names: [1, 2, 3].map((i) => `${name}${n}${i}`),
        role: "digit",
      });
      b.sweep(ch, [0.0085, 0.0062], { color: SKIN, sides: 6 });
      b.part(new THREE.SphereGeometry(1, 5, 4), NAIL, {
        at: [pts[3][0] - s * 0.005, y + 0.0055, pts[3][2]],
        scale: [0.006, 0.0022, 0.006],
        bone: ch.joints[2],
      });
    }
    const thumb = b.chain(
      `thumb${n}`,
      polyline([[s * 0.545, y, 0.028], [s * 0.563, y, 0.046], [s * 0.576, y, 0.06]]),
      { parent: arm.tip!, names: [`thumb${n}1`, `thumb${n}2`], role: "digit" },
    );
    b.sweep(thumb, [0.0105, 0.0075], { color: SKIN, sides: 6 });
    b.part(new THREE.SphereGeometry(1, 5, 4), NAIL, {
      at: [s * 0.574, y + 0.0065, 0.058],
      scale: [0.0065, 0.0024, 0.0065],
      bone: thumb.joints[1],
    });
  }

  return b.root;
}
