```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, svg, paint, mix, noise, smoothstep, grain, mottle, catmull, polyline, rng } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { panelled, gaugeTexture } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nostromo Galley",
  description:
    "The galley and mess of a 1979 commercial towing vessel: grimy panelled bulkheads, steel counter with sink, cooktop, hood, coffee maker, CRT terminal, freezer, ration lockers, bolted mess table with vinyl benches, ceiling girders, pipes and fluorescent tubes, a drinking bird and a cat bowl.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "nostromo_galley", paintSize: 2048 });
  const rand = rng(11);
  const DEG = Math.PI / 180;
  const F = 0.06; // floor top

  // ------------------------------------------------------------------ palette
  const BLACK = "#17181a";
  const DARK = "#2b2d30";
  const DKS = "#46494c";
  const BEIGE = "#d7cfb2";
  const BEIGED = "#b9b196";
  const ORANGE = "#d9702a";
  const YELLOW = "#e3b81a";
  const RED = "#b3261e";
  const TEAL = "#2f6e6c";
  const WHITE = "#ecebe3";
  const CAB2 = "#c3c8bf";
  const BOLT = "#6c6f72";

  // ------------------------------------------------------------------ paints
  const grime = (base: string, dirt: string, seed: number) =>
    paint((p, n) => {
      const q = new THREE.Vector3(p.x * 5, p.y * 0.4, p.z * 5);
      const streak = smoothstep(0.55, 0.85, noise(q, 0.25, seed));
      const low = smoothstep(0.6, 0.0, p.y);
      const stain = smoothstep(0.62, 0.8, noise(p, 0.5, seed + 3));
      const t = Math.min(1, 0.35 * streak + 0.5 * low + 0.35 * stain + (n.y < -0.5 ? 0.15 : 0));
      return mix(base, dirt, t);
    });
  const WALL = panelled(grime("#cfcab9", "#8a8470", 1), { size: 0.42, aspect: 0.8, rivets: 0.07, seam: "#524e43" });
  const CAB = grime("#b6bcb2", "#7b7f78", 5);
  const STEEL = grain(mottle("#b9bdbe", "#9ea3a5", { size: 0.2, seed: 2 }), "#dfe2e3", { size: 0.012, axis: "x", seed: 4 });
  const DSTEEL = grain("#5a5e61", "#7a7e81", { size: 0.012, axis: "y", seed: 6 });
  const PIPE = grain(grime("#8c9093", "#5b5e60", 8), "#6d7174", { size: 0.02, axis: "x", seed: 3 });
  const HAZ = paint((p) => {
    const k = Math.floor((p.x + p.y + p.z) / 0.045) & 1;
    const worn = noise(p, 0.07, 3) > 0.72;
    if (worn) return k ? "#a88a1a" : "#2a2a28";
    return k ? YELLOW : BLACK;
  });
  const VINYL = mottle("#2f6e6c", "#255957", { size: 0.1, seed: 4 });
  const TOPP = paint((p, n, s) => {
    if (Math.abs(n.y) < 0.6) return "#3d4043";
    const edge = Math.min(0.42 - Math.abs(s[0]), 0.65 - Math.abs(s[1]));
    if (edge > 0.04 && edge < 0.055) return ORANGE;
    return mix("#d9d4c1", "#c7c2ad", noise(p, 0.12, 9));
  });

  // ------------------------------------------------------------------ textures
  const FONT = `font-family="Arial, Helvetica, sans-serif"`;
  const MONO = `font-family="Courier New, monospace"`;

  const gratingSvg = `<svg viewBox="0 0 370 260" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="g" width="6" height="6" patternUnits="userSpaceOnUse">
      <path fill="#7b7f82" fill-rule="evenodd" d="M0 0H6V6H0Z M1.2 1.2H4.8V4.8H1.2Z"/></pattern></defs>
    <rect width="370" height="260" fill="url(#g)"/>
    <path d="M92.5 0V260M185 0V260M277.5 0V260M0 130H370" stroke="#2a2c2e" stroke-width="1.6"/>
    <rect x="110" y="115" width="130" height="130" fill="#808487" stroke="#2a2c2e" stroke-width="1.6"/>
    <rect x="0" y="118" width="46" height="112" fill="#777b7e" stroke="#2a2c2e" stroke-width="1.6"/>
    <g fill="#4d5053">
      <circle cx="116" cy="121" r="1.6"/><circle cx="234" cy="121" r="1.6"/><circle cx="116" cy="239" r="1.6"/><circle cx="234" cy="239" r="1.6"/>
      <circle cx="175" cy="121" r="1.6"/><circle cx="175" cy="239" r="1.6"/><circle cx="116" cy="180" r="1.6"/><circle cx="234" cy="180" r="1.6"/>
      <circle cx="6" cy="124" r="1.6"/><circle cx="40" cy="124" r="1.6"/><circle cx="6" cy="224" r="1.6"/><circle cx="40" cy="224" r="1.6"/>
    </g>
    <ellipse cx="170" cy="190" rx="22" ry="12" fill="#000" opacity="0.28"/>
    <ellipse cx="22" cy="175" rx="12" ry="8" fill="#3a2a10" opacity="0.4"/>
    <rect x="0.8" y="0.8" width="368.4" height="258.4" fill="none" stroke="#2a2c2e" stroke-width="1.6"/>
  </svg>`;

  const crtLines = [
    "MU-TH-UR 6000  GALLEY",
    "DECK B  PROVISIONS",
    "--------------------",
    "CRYO-STORES ..... 087%",
    "POTABLE H2O ..... 412L",
    "NUTRIENT PASTE .. 061%",
    "COFFEE .......... LOW",
    "WASTE COMPACTOR . NOM",
    "CREW MESS ....... 7/7",
    "> _",
  ];
  const crtSvg = `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="v" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>
      <pattern id="s" width="4" height="2.4" patternUnits="userSpaceOnUse"><rect width="4" height="1.1" fill="#000" opacity="0.38"/></pattern>
    </defs>
    <rect width="160" height="120" rx="10" fill="#031208"/>
    <rect x="6" y="6" width="148" height="12" fill="#6dff9c"/>
    <text x="10" y="15.5" ${MONO} font-weight="bold" font-size="8.6" fill="#031208">${crtLines[0]}</text>
    ${crtLines
      .slice(1)
      .map((t, i) => `<text x="10" y="${30 + i * 10.2}" ${MONO} font-size="8" font-weight="bold" fill="#6dff9c">${t}</text>`)
      .join("")}
    <rect x="10" y="112" width="9" height="5" fill="#6dff9c"/>
    <rect width="160" height="120" rx="10" fill="url(#s)"/>
    <rect width="160" height="120" rx="10" fill="url(#v)"/>
  </svg>`;

  const menuSvg = `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="90" fill="#e9e2c8"/>
    <rect width="120" height="16" fill="#d9702a"/>
    <text x="6" y="11.5" ${FONT} font-weight="bold" font-size="8" fill="#1a1a1a">GALLEY ROSTER / DECK B</text>
    <g ${MONO} font-size="5.6" font-weight="bold" fill="#22201a">
      <text x="6" y="28">0600  BREAKFAST ....... PASTE-A</text>
      <text x="6" y="38">1200  MIDSHIFT ........ PROT BAR</text>
      <text x="6" y="48">1800  EVENING MEAL .... STEW-2</text>
      <text x="6" y="58">2200  COFFEE ONLY</text>
    </g>
    <g fill="none" stroke="#22201a" stroke-width="1"><rect x="108" y="22" width="6" height="6"/><rect x="108" y="32" width="6" height="6"/><rect x="108" y="42" width="6" height="6"/><rect x="108" y="52" width="6" height="6"/></g>
    <path d="M109 25 l2 3 l4 -6 M109 35 l2 3 l4 -6" stroke="#b3261e" stroke-width="1.4" fill="none"/>
    <rect x="6" y="66" width="108" height="1" fill="#22201a"/>
    <text x="6" y="75" ${FONT} font-size="5" font-weight="bold" fill="#b3261e">NO FOOD TO LEAVE GALLEY.</text>
    <text x="6" y="83" ${FONT} font-size="4.6" fill="#22201a">CLEAN UP AFTER USE. - COMPANY POLICY</text>
  </svg>`;

  const stencilSvg = `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
    <defs><mask id="m"><rect width="200" height="80" fill="#fff"/>
      <g fill="#000"><rect x="22" y="0" width="3" height="50"/><rect x="62" y="0" width="3" height="50"/><rect x="100" y="0" width="3" height="50"/><rect x="132" y="0" width="3" height="50"/><rect x="168" y="0" width="3" height="50"/></g></mask></defs>
    <g mask="url(#m)" opacity="0.85">
      <text x="6" y="46" ${FONT} font-weight="bold" font-size="46" letter-spacing="7" fill="#2a2924">GALLEY</text>
    </g>
    <text x="8" y="64" ${FONT} font-weight="bold" font-size="11" letter-spacing="3" fill="#2a2924" opacity="0.85">DECK B  /  SECTION 4</text>
    <text x="8" y="77" ${FONT} font-weight="bold" font-size="8" letter-spacing="2" fill="#2a2924" opacity="0.7">NOSTROMO 180246</text>
    <path d="M168 58 h22 m-7 -7 l7 7 l-7 7" stroke="#2a2924" stroke-width="4" fill="none" opacity="0.85"/>
  </svg>`;

  const wySvg = `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="98" height="58" rx="3" fill="#e9e5d3" stroke="#2b2d30" stroke-width="2"/>
    <circle cx="20" cy="22" r="13" fill="none" stroke="#2b2d30" stroke-width="2.4"/>
    <path d="M10 14 L15 32 L20 20 L25 32 L30 14" stroke="#2b2d30" stroke-width="2.6" fill="none" stroke-linejoin="round"/>
    <path d="M17 16 L20 24 L23 16 M20 24 V32" stroke="#b3261e" stroke-width="2" fill="none"/>
    <text x="38" y="19" ${FONT} font-weight="bold" font-size="8" fill="#1a1a1a">WEYLAND-</text>
    <text x="38" y="28" ${FONT} font-weight="bold" font-size="8" fill="#1a1a1a">YUTANI CORP</text>
    <text x="8" y="43" ${FONT} font-weight="bold" font-size="5" fill="#1a1a1a">BUILDING BETTER WORLDS</text>
    <text x="8" y="39" ${FONT} font-size="3.6" fill="#555">FREEZER UNIT FZ-03</text>
    <rect x="6" y="47" width="88" height="8" fill="#b3261e"/>
    <text x="50" y="53.4" text-anchor="middle" ${FONT} font-weight="bold" font-size="5.4" fill="#fff">KEEP DOOR CLOSED</text>
  </svg>`;

  const traySvg = `<svg viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="118" height="82" rx="8" fill="#6d7174" stroke="#222" stroke-width="2"/>
    <rect x="6" y="6" width="50" height="36" rx="6" fill="#4a4d50" stroke="#222" stroke-width="1.4"/>
    <rect x="60" y="6" width="54" height="36" rx="6" fill="#4a4d50" stroke="#222" stroke-width="1.4"/>
    <rect x="6" y="46" width="32" height="32" rx="6" fill="#4a4d50" stroke="#222" stroke-width="1.4"/>
    <rect x="42" y="46" width="34" height="32" rx="6" fill="#4a4d50" stroke="#222" stroke-width="1.4"/>
    <rect x="80" y="46" width="34" height="32" rx="6" fill="#4a4d50" stroke="#222" stroke-width="1.4"/>
    <g fill="#7a4a22"><ellipse cx="22" cy="22" rx="6" ry="4"/><ellipse cx="34" cy="28" rx="6" ry="4"/><ellipse cx="42" cy="16" rx="5" ry="3.6"/><ellipse cx="28" cy="14" rx="5" ry="3.4"/></g>
    <path d="M14 20 q8 -8 18 -2" stroke="#9c6a36" stroke-width="1.4" fill="none"/>
    <ellipse cx="87" cy="24" rx="22" ry="14" fill="#d9cfa0"/>
    <g fill="#b9ae80"><circle cx="78" cy="20" r="1.6"/><circle cx="90" cy="28" r="1.6"/><circle cx="96" cy="19" r="1.6"/></g>
    <ellipse cx="22" cy="62" rx="12" ry="12" fill="#b4352a"/><ellipse cx="18" cy="58" rx="4" ry="3" fill="#e0655a"/>
    <ellipse cx="59" cy="62" rx="13" ry="12" fill="#6f8f3a"/><g fill="#8fb04c"><circle cx="54" cy="58" r="3"/><circle cx="64" cy="66" r="3"/></g>
    <rect x="86" y="54" width="22" height="16" rx="3" fill="#c28a45"/><path d="M90 58 h14 M90 62 h14 M90 66 h14" stroke="#8a5c26" stroke-width="1"/>
  </svg>`;

  const lcdSvg = `<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="30" fill="#140a02"/>
    <text x="30" y="21" text-anchor="middle" ${MONO} font-weight="bold" font-size="17" fill="#ffa21f">-18.4</text>
    <text x="4" y="8" ${MONO} font-size="5" fill="#ffa21f">FZ-03</text>
    <text x="56" y="8" text-anchor="end" ${MONO} font-size="5" fill="#ffa21f">C</text>
  </svg>`;

  const jonesSvg = `<svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="58" height="18" rx="6" fill="#f2ead0" stroke="#3a2a1a" stroke-width="1.6"/>
    <text x="34" y="14.5" text-anchor="middle" ${FONT} font-weight="bold" font-size="11" fill="#2a1d10">JONES</text>
    <g fill="#2a1d10"><circle cx="10" cy="12" r="3"/><circle cx="6" cy="7" r="1.5"/><circle cx="10" cy="5.5" r="1.5"/><circle cx="14" cy="7" r="1.5"/></g>
  </svg>`;

  const panelSvg = (() => {
    const us = [20, 42, 64, 86, 108, 130];
    const names = ["OVEN", "H2O", "LIGHT", "VENT", "WASTE", "PWR"];
    return `<svg viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="148" height="98" rx="4" fill="#c9c5b5" stroke="#5a564a" stroke-width="2"/>
      <rect x="1" y="1" width="148" height="16" fill="#d9702a"/>
      <text x="75" y="12.5" text-anchor="middle" ${FONT} font-weight="bold" font-size="9" fill="#1a1a1a">GALLEY SERVICES</text>
      ${us.map((u) => `<circle cx="${u}" cy="30" r="5.2" fill="#222" stroke="#222" stroke-width="1"/>`).join("")}
      ${us
        .map(
          (u, i) =>
            `<rect x="${u - 4.5}" y="40" width="9" height="22" rx="2" fill="#17181a"/><rect x="${u - 2}" y="${i % 2 ? 54 : 41}" width="4" height="12" rx="1.5" fill="#b8b8b0"/>`,
        )
        .join("")}
      ${us.map((u, i) => `<text x="${u}" y="74" text-anchor="middle" ${FONT} font-weight="bold" font-size="6" fill="#1a1a1a">${names[i]}</text>`).join("")}
      <rect x="8" y="82" width="134" height="1.2" fill="#5a564a"/>
      <text x="75" y="93" text-anchor="middle" ${FONT} font-size="5.6" font-weight="bold" fill="#3a372e">W-Y CORP  MOD 4410  DECK B</text>
      <g fill="#6c6f72"><circle cx="6" cy="22" r="1.8"/><circle cx="144" cy="22" r="1.8"/><circle cx="6" cy="94" r="1.8"/><circle cx="144" cy="94" r="1.8"/></g>
    </svg>`;
  })();

  const galleySign = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="118" height="38" rx="4" fill="#202428" stroke="#f1ead2" stroke-width="2.5"/>
      <text x="60" y="21" text-anchor="middle" ${FONT} font-weight="bold" font-size="17" letter-spacing="3" fill="#f1ead2">GALLEY</text>
      <text x="60" y="33" text-anchor="middle" ${FONT} font-weight="bold" font-size="7" letter-spacing="2" fill="#d9702a">SECTION B-4  MESS</text>
    </svg>`,
    { size: 256 },
  );
  const noSmoke = svg(
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="27" fill="#f1ead2" stroke="#b3261e" stroke-width="5"/>
      <rect x="12" y="27" width="28" height="6" fill="#222"/><rect x="40" y="27" width="8" height="6" fill="#d9702a"/>
      <path d="M12 12 L48 48" stroke="#b3261e" stroke-width="5"/>
    </svg>`,
    { size: 128 },
  );

  const T = {
    grate: svg(gratingSvg, { size: 1400 }),
    crt: svg(crtSvg, { size: 384 }),
    menu: svg(menuSvg, { size: 384 }),
    stencil: svg(stencilSvg, { size: 640 }),
    wy: svg(wySvg, { size: 384 }),
    tray: svg(traySvg, { size: 256 }),
    lcd: svg(lcdSvg, { size: 192 }),
    jones: svg(jonesSvg, { size: 256 }),
    panel: svg(panelSvg, { size: 512 }),
    gauge: gaugeTexture({ needle: 35, label: "TEMP", red: [95, 135] }),
  };

  // ------------------------------------------------------------------ helpers
  const bx = (c: V, s: V, color: ColorInput, o: any = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { at: c, ...o });
  const cyl = (c: V, r: number, h: number, color: ColorInput, o: any = {}, seg = 12, rt = r) =>
    b.part(new THREE.CylinderGeometry(rt, r, h, seg), color, { at: c, ...o });
  const sph = (c: V, r: number, color: ColorInput, o: any = {}, w = 8, h = 6) =>
    b.part(new THREE.SphereGeometry(r, w, h), color, { at: c, ...o });
  const plane = (tex: THREE.Texture, at: V, dir: V, w: number, h: number, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });
  const dial = (c: V, r: number, dir: V) => {
    b.part(new THREE.CircleGeometry(r, 16), "#ffffff", { at: c, dir, axis: "z", texture: T.gauge });
    b.part(new THREE.TorusGeometry(r, 0.006, 5, 16), DARK, { at: c, dir, axis: "z" });
  };
  const rrect = (w: number, d: number, r: number, n = 4): [number, number][] => {
    const pts: [number, number][] = [];
    const cs: [number, number, number][] = [
      [w / 2 - r, d / 2 - r, 0],
      [-(w / 2 - r), d / 2 - r, 90],
      [-(w / 2 - r), -(d / 2 - r), 180],
      [w / 2 - r, -(d / 2 - r), 270],
    ];
    for (const [cx, cy, a0] of cs)
      for (let i = 0; i <= n; i++) {
        const a = (a0 + (90 * i) / n) * DEG;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    return pts;
  };

  // batching of small flat-coloured pieces: one part per colour
  const batch = new Map<string, THREE.BufferGeometry[]>();
  const ROT: Record<string, V> = {
    "+y": [0, 0, 0],
    "-y": [180, 0, 0],
    "+z": [90, 0, 0],
    "-z": [-90, 0, 0],
    "+x": [0, 0, -90],
    "-x": [0, 0, 90],
  };
  const M4 = new THREE.Matrix4();
  const Q4 = new THREE.Quaternion();
  const E4 = new THREE.Euler();
  const put = (color: string, geo: THREE.BufferGeometry, at: V, rot: V = [0, 0, 0]) => {
    Q4.setFromEuler(E4.set(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG));
    M4.compose(new THREE.Vector3(at[0], at[1], at[2]), Q4, new THREE.Vector3(1, 1, 1));
    geo.applyMatrix4(M4);
    const list = batch.get(color) ?? [];
    list.push(geo);
    batch.set(color, list);
  };
  const bolt = (at: V, face: string, r = 0.012, color = BOLT) =>
    put(color, new THREE.CylinderGeometry(r, r, 0.012, 6), at, ROT[face]);
  const boltRow = (a: V, c: V, n: number, face: string, r = 0.012) => {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      bolt([a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t], face, r);
    }
  };
  const pullV = (x: number, y: number, z: number, len: number, color = DARK) => {
    put(color, new THREE.CylinderGeometry(0.008, 0.008, len, 6), [x, y, z + 0.03]);
    for (const s of [-1, 1])
      put(color, new THREE.CylinderGeometry(0.006, 0.006, 0.03, 5), [x, y + s * (len / 2 - 0.02), z + 0.015], ROT["+z"]);
  };
  const pullH = (x: number, y: number, z: number, len: number, color = DARK) => {
    put(color, new THREE.CylinderGeometry(0.008, 0.008, len, 6), [x, y, z + 0.03], [0, 0, 90]);
    for (const s of [-1, 1])
      put(color, new THREE.CylinderGeometry(0.006, 0.006, 0.03, 5), [x + s * (len / 2 - 0.02), y, z + 0.015], ROT["+z"]);
  };
  const flange = (at: V, face: string, r = 0.075, h = 0.025) =>
    put("#6b6f72", new THREE.CylinderGeometry(r, r, h, 10), at, ROT[face]);

  // ================================================================== SHELL
  // deck: dark sub-floor, grating drawn as a cut-out texture, hazard lip
  bx([0, 0.0175, -0.05], [3.94, 0.035, 2.8], "#1b1c1e");
  plane(T.grate, [0, F, 0], [0, 1, 0], 3.7, 2.6, { up: [0, 0, -1] });
  bx([0, 0.03, 1.33], [3.94, 0.06, 0.06], HAZ);
  bx([0, 0.0485, -0.1], [3.7, 0.026, 0.02], DKS);
  // painted floor line in front of the counter
  bx([0, F + 0.002, -0.56], [3.7, 0.004, 0.05], YELLOW);

  // bulkheads
  bx([0, 1.25, -1.36], [3.94, 2.5, 0.12], WALL);
  bx([1.91, 1.25, -0.06], [0.12, 2.5, 2.72], WALL);
  bx([-1.91, 1.25, -0.06], [0.12, 2.5, 2.72], WALL);
  // skirting + cornice
  bx([0, 0.13, -1.29], [3.7, 0.14, 0.02], BLACK);
  bx([1.84, 0.13, 0.34], [0.02, 0.14, 1.92], BLACK);
  bx([-1.84, 0.13, 0], [0.02, 0.14, 2.6], BLACK);
  bx([0, 2.47, -1.29], [3.7, 0.06, 0.02], DKS);
  bx([1.84, 2.47, 0], [0.02, 0.06, 2.6], DKS);
  bx([-1.84, 2.47, 0], [0.02, 0.06, 2.6], DKS);
  // orange service stripes on the side bulkheads
  bx([1.844, 1.02, 0.34], [0.012, 0.05, 1.92], ORANGE);
  bx([1.844, 0.94, 0.34], [0.012, 0.015, 1.92], ORANGE);
  bx([-1.844, 1.02, 0], [0.012, 0.05, 2.6], ORANGE);
  bx([-1.844, 0.94, 0], [0.012, 0.015, 2.6], ORANGE);

  // ================================================================== CEILING
  const RIBS = [-0.75, 0.15, 1.05];
  for (const z of RIBS) {
    bx([0, 2.435, z], [3.7, 0.13, 0.03], DKS);
    bx([0, 2.375, z], [3.7, 0.02, 0.12], DKS);
    bx([0, 2.49, z], [3.7, 0.02, 0.12], DKS);
    for (let i = 0; i < 6; i++) put(DARK, new THREE.BoxGeometry(0.02, 0.12, 0.05), [-1.5 + i * 0.6, 2.435, z]);
    boltRow([-1.7, 2.373, z], [1.7, 2.373, z], 15, "-y", 0.01);
  }
  // fluorescent fixtures hung from the girders
  for (const x of [-0.45, 0.15]) {
    bx([x, 2.25, 0.55], [0.16, 0.05, 1.3], DARK);
    glow(bx([x, 2.222, 0.55], [0.12, 0.012, 1.24], "#e8f6ff"), 1.3);
    for (const z of [0.15, 1.05]) for (const s of [-1, 1]) put(BOLT, new THREE.CylinderGeometry(0.006, 0.006, 0.12, 5), [x + s * 0.05, 2.31, z]);
    for (const s of [-1, 1]) bx([x, 2.25, 0.55 + s * 0.655], [0.17, 0.055, 0.02], DKS);
  }
  // main coolant pipe, orange branch, valve
  b.rod([-1.85, 2.25, -1.18], [1.85, 2.25, -1.18], 0.055, PIPE, { caps: "flat" });
  for (const x of [-1.5, -0.7, 0.5, 1.2, 1.7]) flange([x, 2.25, -1.18], "+x");
  b.sweep(polyline([[1.85, 2.1, -1.15], [0.5, 2.1, -1.15], [0.2, 2.1, -1.1]]), 0.03, { color: ORANGE, caps: "flat" });
  for (const x of [1.4, 0.9, 0.45]) flange([x, 2.1, -1.15], "+x", 0.045, 0.02);
  bx([1.0, 2.25, -1.18], [0.12, 0.12, 0.12], DKS);
  cyl([1.0, 2.37, -1.18], 0.01, 0.14, BOLT, {}, 6);
  b.part(new THREE.TorusGeometry(0.06, 0.01, 5, 12), RED, { at: [1.0, 2.43, -1.18], rotation: [90, 0, 0] });
  put(RED, new THREE.BoxGeometry(0.12, 0.008, 0.008), [1.0, 2.43, -1.18]);
  put(RED, new THREE.BoxGeometry(0.008, 0.008, 0.12), [1.0, 2.43, -1.18]);
  // sagging power cable and clips
  b.sweep(catmull([[-1.8, 2.34, -0.6], [-0.9, 2.26, -0.62], [0, 2.33, -0.6], [0.9, 2.26, -0.62], [1.8, 2.34, -0.6]]), 0.012, { color: BLACK });
  for (const x of [-1.2, -0.4, 0.4, 1.2]) bx([x, 2.4, -0.6], [0.05, 0.03, 0.03], DKS);

  // ================================================================== BACK WALL: COUNTER RUN
  bx([-0.125, 0.11, -1.02], [2.15, 0.1, 0.56], BLACK);
  bx([-1.125, 0.515, -0.99], [0.15, 0.71, 0.62], CAB);
  bx([0.2, 0.515, -0.99], [1.5, 0.71, 0.62], CAB);
  bx([-0.8, 0.43, -0.99], [0.5, 0.54, 0.62], CAB);
  bx([-0.8, 0.785, -0.74], [0.5, 0.17, 0.12], CAB);
  bx([-0.8, 0.785, -1.26], [0.5, 0.17, 0.08], CAB);
  // steel worktop with a hole for the sink
  bx([-1.125, 0.895, -0.975], [0.15, 0.05, 0.65], STEEL);
  bx([0.2, 0.895, -0.975], [1.5, 0.05, 0.65], STEEL);
  bx([-0.8, 0.895, -0.725], [0.5, 0.05, 0.15], STEEL);
  bx([-0.8, 0.895, -1.26], [0.5, 0.05, 0.08], STEEL);
  bx([-0.125, 0.875, -0.645], [2.15, 0.03, 0.012], DSTEEL);
  // sink basin
  bx([-0.8, 0.706, -1.01], [0.48, 0.012, 0.4], DSTEEL);
  bx([-1.044, 0.81, -1.01], [0.012, 0.22, 0.42], STEEL);
  bx([-0.556, 0.81, -1.01], [0.012, 0.22, 0.42], STEEL);
  bx([-0.8, 0.81, -0.806], [0.5, 0.22, 0.012], STEEL);
  bx([-0.8, 0.81, -1.214], [0.5, 0.22, 0.012], STEEL);
  cyl([-0.8, 0.716, -1.0], 0.025, 0.006, BLACK, {}, 8);
  cyl([-0.8, 0.935, -1.19], 0.03, 0.03, STEEL, {}, 8);
  b.sweep(catmull([[-0.8, 0.94, -1.19], [-0.8, 1.08, -1.19], [-0.8, 1.15, -1.15], [-0.8, 1.11, -1.07], [-0.8, 1.05, -1.04]]), 0.014, { color: STEEL });
  for (const [x, col] of [[-0.9, RED], [-0.7, "#2f6fb0"]] as [number, string][]) {
    cyl([x, 0.955, -1.19], 0.009, 0.06, STEEL, { dir: [0, 0, 1] }, 6);
    sph([x, 0.955, -1.16], 0.017, col);
  }

  // cabinet fronts
  for (const cx of [-0.9775, -0.5325]) {
    bx([cx, 0.515, -0.67], [0.43, 0.67, 0.02], CAB2);
    bx([cx, 0.515, -0.658], [0.34, 0.55, 0.006], CAB);
    bx([cx + (cx < -0.8 ? 0.16 : -0.16), 0.79, -0.652], [0.05, 0.03, 0.012], ORANGE);
    pullV(cx + (cx < -0.8 ? 0.17 : -0.17), 0.55, -0.66, 0.2);
  }
  // oven bay
  bx([0, 0.43, -0.67], [0.6, 0.5, 0.02], STEEL);
  bx([0, 0.43, -0.658], [0.4, 0.22, 0.006], BLACK);
  glow(bx([0, 0.43, -0.654], [0.38, 0.2, 0.002], "#7a3410"), 0.6);
  pullH(0, 0.62, -0.66, 0.5);
  bx([0, 0.78, -0.668], [0.6, 0.16, 0.016], DSTEEL);
  for (const x of [-0.22, -0.12, -0.02, 0.08]) {
    put(BLACK, new THREE.CylinderGeometry(0.025, 0.025, 0.026, 8), [x, 0.78, -0.65], ROT["+z"]);
    put(ORANGE, new THREE.BoxGeometry(0.006, 0.02, 0.004), [x, 0.79, -0.636]);
  }
  dial([0.21, 0.78, -0.659], 0.05, [0, 0, 1]);
  glow(cyl([-0.27, 0.835, -0.66], 0.007, 0.006, "#ff3a20", { dir: [0, 0, 1] }, 6), 1.5);
  // drawer bay + waste bay
  for (const y of [0.29, 0.51, 0.73]) {
    bx([0.47, y, -0.67], [0.3, 0.2, 0.02], CAB2);
    pullH(0.47, y + 0.04, -0.66, 0.14);
  }
  bx([0.79, 0.515, -0.67], [0.3, 0.67, 0.02], CAB2);
  bx([0.79, 0.515, -0.658], [0.22, 0.55, 0.006], CAB);
  bx([0.79, 0.75, -0.654], [0.12, 0.05, 0.004], HAZ);
  pullV(0.9, 0.5, -0.66, 0.2);
  boltRow([-1.18, 0.2, -0.658], [-1.18, 0.84, -0.658], 5, "+z", 0.008);
  boltRow([0.93, 0.2, -0.658], [0.93, 0.84, -0.658], 5, "+z", 0.008);

  // backsplash and utensil rail
  bx([-0.125, 1.185, -1.29], [2.15, 0.53, 0.02], STEEL);
  boltRow([-1.18, 1.43, -1.278], [0.93, 1.43, -1.278], 12, "+z", 0.008);
  boltRow([-1.18, 0.95, -1.278], [0.93, 0.95, -1.278], 12, "+z", 0.008);
  b.rod([-1.15, 1.28, -1.25], [-0.5, 1.28, -1.25], 0.01, DSTEEL, { caps: "flat" });
  for (const x of [-1.15, -0.5]) cyl([x, 1.28, -1.27], 0.012, 0.04, DSTEEL, { dir: [0, 0, 1] }, 6);
  const utensils: [number, [number, number][], string][] = [
    [-1.05, [[-0.008, 0], [0.008, 0], [0.008, -0.17], [0.04, -0.19], [0.045, -0.23], [0.025, -0.26], [-0.025, -0.26], [-0.045, -0.23], [-0.04, -0.19], [-0.008, -0.17]], "#8b9094"],
    [-0.95, [[-0.008, 0], [0.008, 0], [0.008, -0.15], [0.045, -0.16], [0.045, -0.26], [-0.045, -0.26], [-0.045, -0.16], [-0.008, -0.15]], "#2b2d30"],
    [-0.85, [[-0.008, 0], [0.008, 0], [0.008, -0.1], [0.035, -0.15], [0.035, -0.22], [0, -0.28], [-0.035, -0.22], [-0.035, -0.15], [-0.008, -0.1]], "#a0a5a8"],
    [-0.74, [[-0.008, 0], [0.008, 0], [0.008, -0.12], [0.03, -0.14], [0.03, -0.27], [0.012, -0.27], [0.012, -0.2], [-0.012, -0.2], [-0.012, -0.27], [-0.03, -0.27], [-0.03, -0.14], [-0.008, -0.12]], "#8b9094"],
  ];
  for (const [x, outline, col] of utensils) {
    b.extrude(outline, { at: [x, 1.285, -1.255], x: [1, 0, 0], thickness: 0.008, bevel: 0.002, color: col });
    sph([x, 1.285, -1.255], 0.012, DSTEEL, {}, 6, 4);
  }

  // cooktop
  bx([0, 0.9325, -1.0], [0.62, 0.025, 0.46], "#303236");
  for (const [bxp, bzp] of [[-0.15, -1.12], [0.15, -1.12], [-0.15, -0.88], [0.15, -0.88]]) {
    const hot = bxp > 0 && bzp > -1;
    const ring = b.part(new THREE.TorusGeometry(0.065, 0.011, 5, 14), hot ? "#ff5a1c" : "#1a1b1d", { at: [bxp, 0.948, bzp], rotation: [90, 0, 0] });
    if (hot) glow(ring, 1.4);
    put(BLACK, new THREE.BoxGeometry(0.19, 0.012, 0.012), [bxp, 0.962, bzp]);
    put(BLACK, new THREE.BoxGeometry(0.012, 0.012, 0.19), [bxp, 0.962, bzp]);
  }
  // pot
  b.lathe([[0, 0], [0.09, 0], [0.095, 0.14], [0.088, 0.14], [0.083, 0.012], [0, 0.012]], { at: [-0.15, 0.945, -1.12], color: STEEL, segments: 10 });
  b.lathe([[0, 0.14], [0.1, 0.14], [0.1, 0.152], [0.03, 0.165], [0.03, 0.18], [0, 0.18]], { at: [-0.15, 0.945, -1.12], color: STEEL, segments: 10 });
  for (const s of [-1, 1]) bx([-0.15 + s * 0.108, 1.07, -1.12], [0.03, 0.014, 0.03], BLACK);
  // kettle
  b.lathe([[0, 0], [0.075, 0], [0.085, 0.03], [0.07, 0.11], [0.03, 0.16], [0, 0.16]], { at: [0.15, 0.945, -1.12], color: ORANGE, segments: 10 });
  cyl([0.15, 1.115, -1.12], 0.012, 0.025, BLACK, {}, 6);
  b.rod([0.2, 0.99, -1.06], [0.255, 1.06, -1.03], 0.014, ORANGE, { caps: "round" });
  b.part(new THREE.TorusGeometry(0.05, 0.007, 5, 10, Math.PI), BLACK, { at: [0.15, 1.04, -1.12], rotation: [0, 90, 0] });
  // frying pan with an egg
  b.lathe([[0, 0], [0.085, 0], [0.11, 0.04], [0.1, 0.042], [0.078, 0.012], [0, 0.012]], { at: [-0.15, 0.945, -0.88], color: BLACK, segments: 10 });
  b.rod([-0.15, 0.975, -0.78], [-0.15, 0.985, -0.665], 0.011, BLACK, { caps: "round" });
  cyl([-0.15, 0.962, -0.88], 0.036, 0.004, "#f4efe2", {}, 8);
  sph([-0.15, 0.966, -0.88], 0.014, "#f0b020", {}, 6, 4);
  bolt([-0.29, 0.947, -1.2], "+y", 0.01);
  bolt([0.29, 0.947, -1.2], "+y", 0.01);

  // extractor hood
  const frust = (c: V, wb: number, db: number, k: number, h: number, color: ColorInput) => {
    const g = new THREE.CylinderGeometry(k * 0.7071, 0.7071, h, 4, 1);
    g.rotateY(Math.PI / 4);
    g.scale(wb, 1, db);
    return b.part(g, color, { at: c, flat: true });
  };
  frust([0, 1.62, -1.05], 0.76, 0.5, 0.4, 0.34, STEEL);
  bx([0, 2.145, -1.12], [0.34, 0.71, 0.36], DSTEEL);
  bx([0, 1.82, -1.12], [0.38, 0.04, 0.4], STEEL);
  bx([0, 1.456, -1.05], [0.6, 0.012, 0.36], BLACK);
  glow(bx([0, 1.448, -1.05], [0.5, 0.008, 0.26], "#ffd48a"), 1.0);
  for (let i = 0; i < 6; i++) put(DARK, new THREE.BoxGeometry(0.5, 0.006, 0.008), [0, 1.462, -1.2 + i * 0.045]);

  // canisters and utensil crock
  cyl([0.42, 1.02, -1.18], 0.045, 0.2, "#c9c2a0", {}, 10);
  cyl([0.42, 1.125, -1.18], 0.048, 0.025, DARK, {}, 10);
  cyl([0.42, 1.02, -1.18], 0.0465, 0.06, RED, {}, 10);
  cyl([0.52, 0.995, -1.12], 0.05, 0.15, "#7ea58f", {}, 10);
  cyl([0.52, 1.075, -1.12], 0.052, 0.02, DARK, {}, 10);
  cyl([0.52, 0.995, -1.12], 0.0515, 0.05, YELLOW, {}, 10);
  cyl([-0.43, 0.98, -1.2], 0.04, 0.12, DKS, {}, 8);
  b.rod([-0.43, 0.98, -1.2], [-0.46, 1.11, -1.2], 0.006, "#a0a5a8");
  b.rod([-0.43, 0.98, -1.2], [-0.41, 1.14, -1.21], 0.006, "#2b2d30");
  b.rod([-0.43, 0.98, -1.2], [-0.39, 1.09, -1.2], 0.006, ORANGE);

  // coffee machine
  bx([0.78, 0.945, -1.15], [0.26, 0.05, 0.3], BEIGED);
  bx([0.78, 1.12, -1.25], [0.26, 0.4, 0.1], BEIGE);
  bx([0.78, 1.27, -1.17], [0.26, 0.1, 0.26], BEIGE);
  bx([0.78, 1.2, -1.04], [0.2, 0.02, 0.01], DARK);
  cyl([0.78, 1.05, -1.1], 0.055, 0.16, "#2a1608", {}, 10);
  cyl([0.78, 1.14, -1.1], 0.058, 0.02, BLACK, {}, 10);
  b.part(new THREE.TorusGeometry(0.04, 0.006, 5, 8, Math.PI), BLACK, { at: [0.84, 1.05, -1.1], rotation: [0, 0, -90] });
  glow(cyl([0.7, 0.948, -1.0], 0.007, 0.006, "#ff3a20", { dir: [0, 0, 1] }, 6), 1.5);
  for (const x of [0.72, 0.78, 0.84]) put(DARK, new THREE.CylinderGeometry(0.008, 0.008, 0.01, 6), [x, 1.285, -1.037], ROT["+z"]);

  // CRT terminal on a wall bracket
  bx([0.62, 1.5, -1.16], [0.5, 0.02, 0.28], DSTEEL);
  bx([0.62, 1.522, -1.12], [0.44, 0.022, 0.15], BEIGE);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 12; c++) put("#bdb59a", new THREE.BoxGeometry(0.026, 0.01, 0.026), [0.434 + c * 0.034, 1.54, -1.165 + r * 0.035]);
  put(DARK, new THREE.BoxGeometry(0.2, 0.01, 0.022), [0.62, 1.54, -1.06]);
  bx([0.62, 1.88, -1.25], [0.3, 0.24, 0.1], BEIGED);
  bx([0.62, 1.87, -1.12], [0.42, 0.34, 0.16], BEIGE);
  bx([0.62, 1.85, -0.99], [0.52, 0.42, 0.1], BEIGE);
  bx([0.62, 1.89, -0.942], [0.43, 0.33, 0.006], BLACK);
  glow(plane(T.crt, [0.62, 1.89, -0.938], [0, 0, 1], 0.4, 0.3), 0.95);
  for (const x of [0.45, 0.5, 0.55]) put(DARK, new THREE.CylinderGeometry(0.01, 0.01, 0.012, 6), [x, 1.675, -0.938], ROT["+z"]);
  glow(cyl([0.77, 1.675, -0.94], 0.007, 0.006, "#43e05f", { dir: [0, 0, 1] }, 6), 1.5);
  b.sweep(catmull([[0.62, 1.99, -1.28], [0.62, 2.12, -1.27], [0.7, 2.24, -1.24]]), 0.01, { color: BLACK });

  // ration locker (back left)
  bx([-1.525, 1.09, -1.05], [0.55, 2.06, 0.5], CAB);
  bx([-1.525, 2.13, -1.05], [0.55, 0.06, 0.5], HAZ);
  const ledG: THREE.BufferGeometry[] = [];
  const ledR: THREE.BufferGeometry[] = [];
  for (const c of [-1, 1])
    for (let r = 0; r < 5; r++) {
      const x = -1.525 + c * 0.13;
      const y = 0.3 + 0.39 * r;
      bx([x, y, -0.79], [0.24, 0.34, 0.02], r % 2 ? CAB2 : "#b3b9ae");
      put(DARK, new THREE.BoxGeometry(0.1, 0.018, 0.02), [x, y - 0.02, -0.775]);
      put(BLACK, new THREE.BoxGeometry(0.1, 0.03, 0.004), [x, y + 0.1, -0.778]);
      const led = new THREE.CylinderGeometry(0.008, 0.008, 0.006, 6).rotateX(Math.PI / 2).translate(x + 0.08, y + 0.14, -0.78);
      (rand() > 0.3 ? ledG : ledR).push(led);
    }
  glow(b.part(mergeGeometries(ledG)!, "#43e05f", { at: [0, 0, 0] }), 1.4);
  glow(b.part(mergeGeometries(ledR)!, "#ff3a20", { at: [0, 0, 0] }), 1.4);
  boltRow([-1.78, 0.15, -0.795], [-1.78, 2.08, -0.795], 8, "+z", 0.008);
  boltRow([-1.27, 0.15, -0.795], [-1.27, 2.08, -0.795], 8, "+z", 0.008);

  // upper cabinet
  bx([-0.825, 1.775, -1.13], [0.75, 0.65, 0.34], CAB);
  for (const x of [-1.01, -0.64]) {
    bx([x, 1.775, -0.95], [0.36, 0.6, 0.02], CAB2);
    bx([x, 1.775, -0.94], [0.28, 0.48, 0.006], CAB);
  }
  pullV(-0.855, 1.62, -0.94, 0.14);
  pullV(-0.795, 1.62, -0.94, 0.14);
  bx([-1.01, 1.97, -0.935], [0.06, 0.03, 0.014], ORANGE);
  bx([-0.64, 1.97, -0.935], [0.06, 0.03, 0.014], ORANGE);
  glow(bx([-0.825, 1.442, -1.05], [0.68, 0.01, 0.06], "#fff1c9"), 1.1);
  for (const [x, col] of [[-1.1, "#c9c2a0"], [-0.99, "#7ea58f"], [-0.88, "#c9c2a0"]] as [number, string][]) {
    cyl([x, 2.17, -1.15], 0.045, 0.13, col, {}, 10);
    cyl([x, 2.17, -1.15], 0.0465, 0.04, RED, {}, 10);
  }

  // ================================================================== FREEZER
  bx([1.45, 0.11, -0.97], [0.66, 0.1, 0.62], BLACK);
  bx([1.45, 1.1, -0.96], [0.7, 1.88, 0.68], CAB);
  bx([1.45, 1.68, -0.6], [0.66, 0.64, 0.04], STEEL);
  bx([1.45, 0.76, -0.6], [0.66, 1.12, 0.04], STEEL);
  bx([1.45, 1.34, -0.62], [0.7, 0.02, 0.01], BLACK);
  bx([1.45, 0.27, -0.578], [0.66, 0.08, 0.004], HAZ);
  pullV(1.2, 1.7, -0.58, 0.35);
  pullV(1.2, 0.95, -0.58, 0.5);
  bx([1.7, 1.34, -0.57], [0.07, 0.04, 0.02], ORANGE);
  bx([1.58, 1.86, -0.581], [0.22, 0.12, 0.004], BLACK);
  glow(plane(T.lcd, [1.58, 1.86, -0.5775], [0, 0, 1], 0.2, 0.1), 1.0);
  dial([1.58, 1.7, -0.576], 0.045, [0, 0, 1]);
  plane(T.wy, [1.47, 0.88, -0.5775], [0, 0, 1], 0.36, 0.216);
  boltRow([1.14, 0.24, -0.577], [1.14, 1.96, -0.577], 9, "+z", 0.009);
  boltRow([1.76, 0.24, -0.577], [1.76, 1.96, -0.577], 9, "+z", 0.009);
  bx([1.45, 2.045, -0.9], [0.5, 0.01, 0.3], BLACK);
  for (let i = 0; i < 6; i++) put(DKS, new THREE.BoxGeometry(0.5, 0.012, 0.012), [1.45, 2.05, -1.02 + i * 0.045]);
  b.rod([1.25, 2.04, -1.2], [1.25, 2.5, -1.2], 0.025, PIPE, { caps: "flat" });
  b.rod([1.65, 2.04, -1.2], [1.65, 2.5, -1.2], 0.025, ORANGE, { caps: "flat" });
  for (const x of [1.25, 1.65]) for (const y of [2.1, 2.4]) flange([x, y, -1.2], "+y", 0.04, 0.02);

  // ================================================================== RIGHT WALL: DOOR, PANEL
  bx([-1.82, 1.06, -0.04], [0.06, 2.0, 0.08], HAZ);
  bx([-1.82, 1.06, 1.04], [0.06, 2.0, 0.08], HAZ);
  bx([-1.82, 2.1, 0.5], [0.06, 0.08, 1.16], HAZ);
  bx([-1.835, 1.06, 0.5], [0.03, 2.0, 0.96], panelled(grime("#bdbbab", "#6f6b5c", 12), { size: 0.4, aspect: 0.8, rivets: 0.06, seam: "#3e3b32" }));
  b.part(new THREE.TorusGeometry(0.15, 0.025, 6, 12), DKS, { at: [-1.812, 1.55, 0.5], rotation: [0, 90, 0] });
  glow(cyl([-1.82, 1.55, 0.5], 0.14, 0.01, "#3d7f86", { dir: [1, 0, 0] }, 12), 0.55);
  boltRow([-1.805, 1.55 + 0.16, 0.5 + 0.0], [-1.805, 1.55 - 0.16, 0.5], 2, "+x", 0.01);
  put(BOLT, new THREE.CylinderGeometry(0.01, 0.01, 0.012, 6), [-1.805, 1.55, 0.34], ROT["+x"]);
  put(BOLT, new THREE.CylinderGeometry(0.01, 0.01, 0.012, 6), [-1.805, 1.55, 0.66], ROT["+x"]);
  put(DARK, new THREE.CylinderGeometry(0.01, 0.01, 0.3, 6), [-1.795, 1.1, 0.12]);
  for (const y of [1.0, 1.2]) put(DARK, new THREE.CylinderGeometry(0.007, 0.007, 0.03, 5), [-1.805, y, 0.12], ROT["+x"]);
  plane(galleySign, [-1.788, 2.1, 0.5], [1, 0, 0], 0.54, 0.18);
  boltRow([-1.8, 0.1, -0.02], [-1.8, 2.0, -0.02], 8, "+x", 0.01);
  boltRow([-1.8, 0.1, 1.02], [-1.8, 2.0, 1.02], 8, "+x", 0.01);
  // door keypad with lamp, beacon
  bx([-1.83, 1.2, 1.2], [0.04, 0.2, 0.1], DARK);
  glow(cyl([-1.806, 1.27, 1.2], 0.014, 0.008, "#ff3a20", { dir: [1, 0, 0] }, 8), 1.6);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) put(BEIGE, new THREE.BoxGeometry(0.006, 0.02, 0.02), [-1.806, 1.2 - r * 0.03, 1.17 + c * 0.04]);
  cyl([-1.82, 2.3, 0.5], 0.055, 0.04, DARK, { dir: [1, 0, 0] }, 8);
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#ff9a1c", { at: [-1.8, 2.3, 0.5], rotation: [0, 0, -90] }), 1.5);
  plane(noSmoke, [-1.843, 1.7, 1.2], [1, 0, 0], 0.14, 0.14);
  // switch panel
  bx([-1.835, 1.6, -0.5], [0.02, 0.34, 0.49], DARK);
  plane(T.panel, [-1.824, 1.6, -0.5], [1, 0, 0], 0.45, 0.3);
  {
    const us = [20, 42, 64, 86, 108, 130];
    const cols = ["#43e05f", "#43e05f", "#ffb23a", "#43e05f", "#ff3a20", "#43e05f"];
    us.forEach((u, i) =>
      glow(cyl([-1.822, 1.6 + (0.5 - 30 / 100) * 0.3, -0.5 + (0.5 - u / 150) * 0.45], 0.0095, 0.006, cols[i], { dir: [1, 0, 0] }, 8), 1.5),
    );
  }
  boltRow([-1.822, 1.76, -0.72], [-1.822, 1.44, -0.72], 2, "+x", 0.008);
  boltRow([-1.822, 1.76, -0.28], [-1.822, 1.44, -0.28], 2, "+x", 0.008);

  // ================================================================== LEFT WALL
  b.rod([1.8, F, -0.54], [1.8, 2.5, -0.54], 0.03, PIPE, { caps: "flat" });
  for (const y of [0.4, 0.9, 1.4, 1.9, 2.3]) put(DKS, new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), [1.8, y, -0.54]);
  // fire extinguisher
  bx([1.835, 0.72, -0.2], [0.02, 0.5, 0.14], DARK);
  cyl([1.775, 0.7, -0.2], 0.07, 0.42, RED, {}, 10);
  cyl([1.775, 0.93, -0.2], 0.03, 0.06, DARK, {}, 8);
  b.rod([1.775, 0.95, -0.2], [1.72, 0.9, -0.1], 0.008, BLACK);
  for (const y of [0.6, 0.82]) put(DARK, new THREE.CylinderGeometry(0.074, 0.074, 0.03, 10), [1.775, y, -0.2]);
  put(WHITE, new THREE.BoxGeometry(0.004, 0.14, 0.08), [1.706, 0.7, -0.2]);
  bx([1.84, 1.16, -0.2], [0.012, 0.07, 0.18], RED);
  // roster board
  bx([1.835, 1.45, 0.35], [0.025, 0.5, 0.66], DARK);
  plane(T.menu, [1.82, 1.45, 0.35], [-1, 0, 0], 0.6, 0.45);
  boltRow([1.82, 1.7, 0.03], [1.82, 1.2, 0.03], 2, "-x", 0.008);
  boltRow([1.82, 1.7, 0.67], [1.82, 1.2, 0.67], 2, "-x", 0.008);
  // waste hatch
  bx([1.835, 0.8, 0.4], [0.03, 0.4, 0.4], CAB2);
  cyl([1.815, 0.8, 0.4], 0.15, 0.04, STEEL, { dir: [-1, 0, 0] }, 12);
  b.part(new THREE.TorusGeometry(0.16, 0.012, 5, 14), HAZ, { at: [1.808, 0.8, 0.4], rotation: [0, 90, 0] });
  b.rod([1.79, 0.8, 0.33], [1.79, 0.8, 0.47], 0.012, DARK, { caps: "round" });
  bx([1.846, 0.8, 0.4], [0.008, 0.06, 0.2], HAZ);
  // first aid box
  bx([1.8, 1.45, 1.0], [0.1, 0.3, 0.3], WHITE);
  bx([1.747, 1.45, 1.0], [0.006, 0.14, 0.04], RED);
  bx([1.747, 1.45, 1.0], [0.006, 0.04, 0.14], RED);
  put(DARK, new THREE.BoxGeometry(0.02, 0.03, 0.04), [1.745, 1.34, 1.0]);
  // big stencil
  plane(T.stencil, [1.846, 2.1, 0.62], [-1, 0, 0], 1.0, 0.4);
  // vent grille
  bx([1.836, 0.5, 1.0], [0.02, 0.2, 0.3], DARK);
  for (let i = 0; i < 6; i++) put(DKS, new THREE.BoxGeometry(0.014, 0.012, 0.28), [1.825, 0.43 + i * 0.03, 1.0]);

  // ================================================================== MESS TABLE + BENCHES
  const TX = -0.15;
  b.extrude(rrect(0.84, 1.3, 0.1), { at: [TX, 0.74, 0.5], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.05, bevel: 0.01, color: TOPP });
  for (const z of [0.1, 0.9]) {
    b.extrude([[-0.3, 0], [0.3, 0], [0.17, 0.66], [-0.17, 0.66]], { at: [TX, F, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.08, bevel: 0.01, color: DSTEEL });
    bx([TX, F + 0.01, z], [0.66, 0.02, 0.16], DKS);
    boltRow([TX - 0.27, F + 0.022, z], [TX + 0.27, F + 0.022, z], 4, "+y", 0.012);
  }
  b.rod([TX, 0.35, 0.1], [TX, 0.35, 0.9], 0.02, DKS, { caps: "flat" });
  for (const x of [-0.77, 0.47]) {
    b.extrude(rrect(0.3, 1.15, 0.05), { at: [x, 0.43, 0.5], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.07, bevel: 0.02, color: VINYL });
    bx([x, 0.396, 0.5], [0.3, 0.012, 1.15], DKS);
    for (const z of [0.15, 0.85]) {
      b.extrude([[-0.13, 0], [0.13, 0], [0.09, 0.36], [-0.09, 0.36]], { at: [x, F, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, color: DSTEEL });
      bx([x, F + 0.01, z], [0.3, 0.02, 0.1], DKS);
    }
    for (const z of [-0.05, 1.05]) bolt([x, 0.466, z + (z < 0.5 ? 0.0 : 0.0)], "+y", 0.01);
  }

  // table top items
  const TY = 0.765;
  for (const [x, z] of [[-0.28, 0.2], [-0.02, 0.85]] as [number, number][]) {
    bx([x, TY + 0.0075, z], [0.36, 0.015, 0.26], "#555a5d");
    plane(T.tray, [x, TY + 0.0161, z], [0, 1, 0], 0.34, 0.238, { up: [0, 0, -1] });
  }
  b.rod([-0.18, 0.785, 0.2], [-0.1, 0.785, 0.2], 0.004, "#a0a5a8");
  sph([-0.09, 0.785, 0.2], 0.01, "#a0a5a8", { scale: [1.4, 0.4, 1] }, 6, 4);
  b.rod([0.05, 0.785, 0.85], [0.12, 0.785, 0.88], 0.004, "#a0a5a8");
  const mug = (x: number, z: number, col: string) => {
    b.lathe([[0, 0], [0.04, 0], [0.043, 0.09], [0.037, 0.09], [0.034, 0.012], [0, 0.012]], { at: [x, TY, z], color: col, segments: 10 });
    cyl([x, TY + 0.078, z], 0.034, 0.004, "#2a1608", {}, 10);
    cyl([x, TY + 0.03, z], 0.0425, 0.014, col === WHITE ? RED : YELLOW, {}, 10);
    b.part(new THREE.TorusGeometry(0.024, 0.006, 5, 8, Math.PI), col, { at: [x + 0.045, TY + 0.048, z], rotation: [0, 0, -90] });
  };
  mug(0.12, 0.2, WHITE);
  mug(-0.45, 0.65, "#d9a514");
  mug(0.16, 0.52, WHITE);
  // drinking bird + water glass
  {
    const x = 0.14, z = 1.02, y0 = TY;
    bx([x, y0 + 0.006, z], [0.1, 0.012, 0.05], BLACK);
    b.rod([x - 0.035, y0 + 0.012, z], [x, y0 + 0.115, z], 0.004, BLACK);
    b.rod([x + 0.035, y0 + 0.012, z], [x, y0 + 0.115, z], 0.004, BLACK);
    cyl([x, y0 + 0.12, z], 0.008, 0.04, DKS, { dir: [0, 0, 1] }, 6);
    sph([x, y0 + 0.088, z], 0.03, "#c0281e", {}, 8, 6);
    b.rod([x, y0 + 0.1, z], [x, y0 + 0.18, z], 0.007, "#c0281e");
    b.rod([x, y0 + 0.18, z], [x, y0 + 0.26, z], 0.007, "#cfe4e6");
    sph([x, y0 + 0.275, z], 0.022, "#8c1d1a", {}, 8, 6);
    cyl([x, y0 + 0.296, z], 0.032, 0.004, BLACK, {}, 10);
    cyl([x, y0 + 0.314, z], 0.018, 0.032, BLACK, {}, 10);
    cyl([x - 0.032, y0 + 0.268, z], 0.011, 0.045, ORANGE, { rotation: [0, 0, 90] }, 6, 0.001);
    sph([x - 0.014, y0 + 0.283, z + 0.017], 0.005, "#111", {}, 5, 4);
    sph([x - 0.014, y0 + 0.283, z - 0.017], 0.005, "#111", {}, 5, 4);
    cyl([x - 0.12, y0 + 0.03, z], 0.034, 0.06, "#9fcfd3", {}, 10);
    cyl([x - 0.12, y0 + 0.052, z], 0.03, 0.01, "#4aa5b0", {}, 10);
  }
  // ashtray with a burning cigarette
  b.lathe([[0, 0], [0.06, 0], [0.065, 0.018], [0.058, 0.018], [0.052, 0.006], [0, 0.006]], { at: [-0.05, TY, 0.55], color: DARK, segments: 10 });
  b.rod([-0.09, 0.783, 0.54], [-0.04, 0.789, 0.565], 0.0035, WHITE);
  glow(sph([-0.036, 0.79, 0.567], 0.005, "#ff5a1c", {}, 5, 4), 1.6);
  b.rod([-0.07, 0.775, 0.58], [-0.03, 0.775, 0.595], 0.0035, "#cbb78a");
  // condiments
  b.lathe([[0, 0], [0.018, 0], [0.02, 0.05], [0.012, 0.065], [0.012, 0.072], [0, 0.072]], { at: [0.2, TY, 0.72], color: WHITE, segments: 8 });
  b.lathe([[0, 0], [0.018, 0], [0.02, 0.05], [0.012, 0.065], [0.012, 0.072], [0, 0.072]], { at: [0.235, TY, 0.72], color: DARK, segments: 8 });
  b.lathe([[0, 0], [0.02, 0], [0.02, 0.07], [0.011, 0.09], [0.011, 0.105], [0, 0.105]], { at: [0.215, TY, 0.77], color: RED, segments: 8 });
  cyl([0.215, TY + 0.11, 0.77], 0.012, 0.01, BLACK, {}, 6);

  // cat bowl on the floor
  const bowl = b.lathe([[0, 0], [0.06, 0], [0.09, 0.05], [0.083, 0.05], [0.055, 0.012], [0, 0.012]], { at: [0.95, F, -0.34], color: TEAL, segments: 12 });
  cyl([0.95, F + 0.016, -0.34], 0.05, 0.008, "#7a4a22", {}, 8);
  b.decal(bowl, T.jones, { at: [0.95, F + 0.028, -0.26], dir: [0, 0, 1], size: [0.1, 0.034] });

  // ================================================================== finish: flush batches
  for (const [color, geos] of batch) b.part(mergeGeometries(geos)!, color, { at: [0, 0, 0], flat: true });

  return b.root;
}
```