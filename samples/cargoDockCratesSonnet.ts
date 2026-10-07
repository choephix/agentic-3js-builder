// Dockside cargo, Overwatch style: a steel dock apron with a davit crane lifting a crate on a four-leg sling,
// a tower of hard-shell crates, an open power-cell case, drums, and a pallet jack under a loaded pallet.
// One accent colour (signal orange) over cool slate, steel and off-white panels.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import type { Joint } from "../src/skeleton";
import { aim, rng } from "../src/math";
import { arc, catmull, polyline } from "../src/path";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Cargo Dock Crates",
  description:
    "Dockside cargo group: davit crane with a crate hanging on a four-leg sling, stacked hard-shell crates, an open power-cell case, drums, bollards and a pallet jack under a loaded pallet, in a polished Overwatch-style sci-fi look.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type V = [number, number, number];
const RAD = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Palette: cool neutrals, one orange accent.
const INK = "#171d27";
const NAVY = "#25364c";
const SLATE = "#40566f";
const STEEL = "#72849a";
const STEEL_LT = "#b6c3d1";
const PANEL = "#e7edf3";
const DECK = "#7d8b9d";
const DECK_LT = "#93a1b3";
const ORANGE = "#ff7a12";
const ORANGE_DK = "#c4540a";
const ORANGE_LT = "#ffb45e";
const WOOD = "#c4965f";
const WOOD_DK = "#8d643a";
const RUBBER = "#12151a";
const ROPE = "#dccfae";

export default function build() {
  const b = createBuilder({ name: "cargoDockCrates", paintSize: 2048 });
  const root = b.joint("dock", { at: [0, 0, 0] });
  const D = 0.16; // deck top

  // ------------------------------------------------------------------------------------------------------------
  // Placement helpers: a Space is a local frame (origin, yaw, pitch, roll) that owns a bone.
  type Bag = { color: Fill; bone: Joint; flat: boolean; geos: THREE.BufferGeometry[] };
  const bags = new Map<string, Bag>();

  class Space {
    readonly q: THREE.Quaternion;
    readonly o: THREE.Vector3;
    constructor(
      o: V | THREE.Vector3,
      readonly yaw = 0,
      readonly bone: Joint = root,
      pitch = 0,
      roll = 0,
    ) {
      this.o = new THREE.Vector3(...(Array.isArray(o) ? (o as V) : (o as THREE.Vector3).toArray()));
      this.q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * RAD, yaw * RAD, roll * RAD, "YXZ"));
    }
    pt(p: V) {
      return new THREE.Vector3(...p).applyQuaternion(this.q).add(this.o);
    }
    dir(d: V) {
      return new THREE.Vector3(...d).applyQuaternion(this.q);
    }
    rotq(r?: V) {
      const q = this.q.clone();
      if (r) q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * RAD, r[1] * RAD, r[2] * RAD, "XYZ")));
      return q;
    }
    /** A separate part. */
    put(geo: THREE.BufferGeometry, color: Fill, pos: V, rot?: V, extra: { flat?: boolean; texture?: THREE.Texture; name?: string; bone?: Joint } = {}) {
      return b.part(geo, color, {
        bone: extra.bone ?? this.bone,
        at: this.pt(pos),
        quat: this.rotq(rot),
        flat: extra.flat ?? true,
        texture: extra.texture,
        name: extra.name,
      });
    }
    /** Baked into the merged part for this colour and bone. */
    m(color: Fill, geo: THREE.BufferGeometry, pos: V, rot?: V, flat = true) {
      const g = geo.clone();
      g.applyMatrix4(new THREE.Matrix4().compose(this.pt(pos), this.rotq(rot), new THREE.Vector3(1, 1, 1)));
      geo.dispose();
      const key = `${typeof color === "string" ? color : String(color)}|${this.bone.name}|${flat}`;
      let bag = bags.get(key);
      if (!bag) bags.set(key, (bag = { color, bone: this.bone, flat, geos: [] }));
      bag.geos.push(g);
    }
    box(color: Fill, size: V, pos: V, rot?: V) {
      this.m(color, new THREE.BoxGeometry(...size), pos, rot);
    }
    rbox(color: Fill, size: V, pos: V, r = 0.02, rot?: V) {
      const geo = Math.min(...size) < 0.045 ? new THREE.BoxGeometry(...size) : new RoundedBoxGeometry(size[0], size[1], size[2], 1, r);
      this.m(color, geo, pos, rot);
    }
    cyl(color: Fill, r0: number, r1: number, h: number, pos: V, rot?: V, sides = 8) {
      this.m(color, new THREE.CylinderGeometry(r0, r1, h, sides, 1), pos, rot);
    }
    rod(color: Fill, a: V, c: V, r: number, sides = 6) {
      const pa = this.pt(a);
      const pc = this.pt(c);
      const g = new THREE.CylinderGeometry(r, r, pa.distanceTo(pc), sides, 1);
      g.applyMatrix4(
        new THREE.Matrix4().compose(pa.clone().add(pc).multiplyScalar(0.5), aim(pc.clone().sub(pa)), new THREE.Vector3(1, 1, 1)),
      );
      const key = `${typeof color === "string" ? color : String(color)}|${this.bone.name}|true`;
      let bag = bags.get(key);
      if (!bag) bags.set(key, (bag = { color, bone: this.bone, flat: true, geos: [] }));
      bag.geos.push(g);
    }
    /** A textured plane lying on a face: `n` is the outward direction, `up` the drawing's top. */
    decal(tex: THREE.Texture, size: [number, number], pos: V, n: V, up: V = [0, 1, 0]) {
      return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
        bone: this.bone,
        at: this.pt(pos),
        dir: this.dir(n),
        up: this.dir(up),
        axis: "z",
        texture: tex,
      });
    }
  }

  const W = (o: V, yaw = 0, bone: Joint = root) => new Space(o, yaw, bone);

  // ------------------------------------------------------------------------------------------------------------
  // Drawings
  const FONT = `font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900"`;
  const bars = (x0: number, y0: number, w: number, h: number, seed: number, fill = INK) => {
    const r = rng(seed);
    let x = x0;
    let out = "";
    while (x < x0 + w - 2) {
      const bw = 0.7 + r() * 1.8;
      out += `<rect x="${x.toFixed(1)}" y="${y0}" width="${bw.toFixed(1)}" height="${h}" fill="${fill}"/>`;
      x += bw + 0.7 + r() * 1.6;
    }
    return out;
  };
  const idPlate = (code: string, sub: string, seed: number) =>
    svg(
      `<svg viewBox="0 0 120 64">
        <rect x="2" y="2" width="116" height="60" rx="8" fill="${PANEL}" stroke="${INK}" stroke-width="3"/>
        <rect x="2" y="2" width="30" height="60" rx="8" fill="${ORANGE}" stroke="${INK}" stroke-width="3"/>
        <path d="M9 21 L17 31 L25 21 M9 35 L17 45 L25 35" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
        <text x="77" y="31" ${FONT} font-size="20" text-anchor="middle" fill="${INK}">${code}</text>
        <text x="77" y="41" ${FONT} font-size="7" text-anchor="middle" fill="${SLATE}">${sub}</text>
        ${bars(40, 46, 72, 11, seed)}
      </svg>`,
      { size: 256 },
    );
  const iconFragile = svg(
    `<svg viewBox="0 0 64 64">
      <rect x="2" y="2" width="60" height="60" rx="10" fill="${INK}" stroke="${ORANGE}" stroke-width="4"/>
      <path d="M18 14 H46 L43 30 Q32 40 21 30 Z" fill="${PANEL}" stroke="${PANEL}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M32 38 V50 M22 51 H42" stroke="${PANEL}" stroke-width="4" stroke-linecap="round"/>
      <path d="M25 18 H39 L38 24 H26Z" fill="${ORANGE}"/>
      <path d="M8 56 L56 8" stroke="${ORANGE}" stroke-width="3" stroke-dasharray="4 4" opacity="0"/>
    </svg>`,
    { size: 128 },
  );
  const iconArrows = svg(
    `<svg viewBox="0 0 64 64">
      <rect x="2" y="2" width="60" height="60" rx="10" fill="${PANEL}" stroke="${INK}" stroke-width="4"/>
      <path d="M20 54 V26 H11 L20 10 L29 26 H20" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M44 54 V26 H35 L44 10 L53 26 H44" fill="${ORANGE}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );
  const iconBolt = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M32 3 L61 32 L32 61 L3 32 Z" fill="${ORANGE}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M36 12 L20 35 H30 L26 52 L44 28 H33 Z" fill="${INK}"/>
    </svg>`,
    { size: 128 },
  );
  const iconHazard = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M32 5 L61 57 H3 Z" fill="${ORANGE}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="29" y="22" width="6" height="20" rx="2" fill="${INK}"/>
      <circle cx="32" cy="48" r="3.5" fill="${INK}"/>
    </svg>`,
    { size: 128 },
  );
  const iconCoolant = svg(
    `<svg viewBox="0 0 100 100">
      <rect x="3" y="3" width="94" height="94" rx="12" fill="${PANEL}" stroke="${INK}" stroke-width="4"/>
      <rect x="3" y="3" width="94" height="30" rx="12" fill="${INK}"/>
      <rect x="3" y="22" width="94" height="11" fill="${INK}"/>
      <text x="50" y="26" ${FONT} font-size="17" text-anchor="middle" fill="${ORANGE}">COOLANT</text>
      <path d="M50 40 L74 82 H26 Z" fill="${ORANGE}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <rect x="47.5" y="53" width="5" height="16" rx="2" fill="${INK}"/>
      <circle cx="50" cy="75" r="3" fill="${INK}"/>
      <text x="14" y="90" ${FONT} font-size="9" fill="${SLATE}">04</text>
      ${bars(62, 80, 26, 10, 9)}
    </svg>`,
    { size: 256 },
  );
  const iconFuel = svg(
    `<svg viewBox="0 0 100 100">
      <rect x="3" y="3" width="94" height="94" rx="12" fill="${ORANGE}" stroke="${INK}" stroke-width="4"/>
      <text x="50" y="30" ${FONT} font-size="19" text-anchor="middle" fill="${INK}">PLASMA</text>
      <path d="M50 38 C66 56 70 64 70 72 A20 20 0 0 1 30 72 C30 64 34 56 50 38 Z" fill="${INK}"/>
      <path d="M50 52 C58 62 60 66 60 72 A10 10 0 0 1 40 72 C40 66 42 62 50 52 Z" fill="${ORANGE_LT}"/>
      <text x="50" y="94" ${FONT} font-size="8" text-anchor="middle" fill="${INK}">KEEP UPRIGHT</text>
    </svg>`,
    { size: 256 },
  );
  const floorBay = svg(
    `<svg viewBox="0 0 160 80">
      <text x="80" y="46" ${FONT} font-size="44" text-anchor="middle" fill="${PANEL}">BAY 07</text>
      <path d="M12 66 H148 M12 72 H148" stroke="${PANEL}" stroke-width="3"/>
      <path d="M60 58 L80 74 L100 58" fill="none" stroke="${ORANGE}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity="0"/>
    </svg>`,
    { size: 512 },
  );
  const floorArrows = svg(
    `<svg viewBox="0 0 64 96">
      <path d="M32 6 L56 34 H40 V90 H24 V34 H8 Z" fill="${ORANGE}" opacity="0.9"/>
    </svg>`,
    { size: 256 },
  );
  const jackPlate = svg(
    `<svg viewBox="0 0 100 50">
      <rect x="2" y="2" width="96" height="46" rx="6" fill="${PANEL}" stroke="${INK}" stroke-width="3"/>
      <text x="50" y="27" ${FONT} font-size="21" text-anchor="middle" fill="${INK}">2.0 t</text>
      <text x="50" y="41" ${FONT} font-size="8" text-anchor="middle" fill="${SLATE}">MAX LOAD</text>
    </svg>`,
    { size: 192 },
  );
  const signTex = svg(
    `<svg viewBox="0 0 80 120">
      <rect x="2" y="2" width="76" height="116" rx="9" fill="${ORANGE}" stroke="${INK}" stroke-width="4"/>
      <rect x="9" y="9" width="62" height="22" rx="4" fill="${INK}"/>
      <text x="40" y="26" ${FONT} font-size="14" text-anchor="middle" fill="${ORANGE}">CAUTION</text>
      <path d="M40 42 L66 84 H14 Z" fill="${INK}"/>
      <path d="M40 52 L56 78 H24 Z" fill="${ORANGE}"/>
      <rect x="37.5" y="58" width="5" height="10" fill="${INK}"/>
      <circle cx="40" cy="72.5" r="2.5" fill="${INK}"/>
      <text x="40" y="104" ${FONT} font-size="11" text-anchor="middle" fill="${INK}">OVERHEAD</text>
      <text x="40" y="114" ${FONT} font-size="9" text-anchor="middle" fill="${INK}">LOAD</text>
    </svg>`,
    { size: 256 },
  );
  const stencil = (word: string) =>
    svg(
      `<svg viewBox="0 0 160 40"><text x="80" y="31" ${FONT} font-size="32" text-anchor="middle" fill="${PANEL}">${word}</text></svg>`,
      { size: 384 },
    );
  const plateA = idPlate("DK-0417", "HANDLE WITH CARE", 3);
  const plateB = idPlate("HX-2210", "THIS SIDE UP", 5);
  const plateC = idPlate("RK-0093", "POWER CELLS", 8);
  const plateD = idPlate("LF-7731", "LIFT POINTS x4", 12);
  const plateE = idPlate("TN-0850", "FRAGILE / OPTICS", 14);

  // ------------------------------------------------------------------------------------------------------------
  // Crate paint: every face of a box gets a panel-lined, riveted, banded skin, read from model-space position.
  type CrateLook = {
    base: string;
    panel: string;
    rim: string;
    line: string;
    accent?: string;
    bandY?: number; // band centre above the crate's centre
    style: "brace" | "ribs" | "plain" | "chevron";
    inner?: boolean; // bottom face is an open lid's inside
  };
  const cratePaint = (look: CrateLook, centre: THREE.Vector3, half: V, yawDeg: number): Paint => {
    const cs = Math.cos(yawDeg * RAD);
    const sn = Math.sin(yawDeg * RAD);
    const [hx, hy, hz] = half;
    return paint((p, n) => {
      const dx = p.x - centre.x;
      const dz = p.z - centre.z;
      const ly = p.y - centre.y;
      const lx = dx * cs - dz * sn;
      const lz = dx * sn + dz * cs;
      const nx = n.x * cs - n.z * sn;
      const nz = n.x * sn + n.z * cs;
      const ax = Math.abs(nx);
      const ay = Math.abs(n.y);
      const az = Math.abs(nz);
      let u: number;
      let v: number;
      let hu: number;
      let hv: number;
      let face: "x" | "y" | "z";
      if (ay >= ax && ay >= az) {
        [u, v, hu, hv, face] = [lx, lz, hx, hz, "y"];
      } else if (ax >= az) {
        [u, v, hu, hv, face] = [lz, ly, hz, hy, "x"];
      } else {
        [u, v, hu, hv, face] = [lx, ly, hx, hy, "z"];
      }
      const d = Math.min(hu - Math.abs(u), hv - Math.abs(v));
      let col: string = look.panel;
      const gloss = (ly + hy) / (2 * hy);
      if (face === "y" && n.y < 0 && look.inner) {
        // inside of an open lid: foam with a framed orange edge
        if (d < 0.05) col = ORANGE;
        else if (d < 0.065) col = INK;
        else if (Math.abs(v) < 0.075) col = ((Math.floor((u + 5) / 0.07) & 1) === 0 ? ORANGE : INK);
        else col = ((Math.floor((u + 5) / 0.16) + Math.floor((v + 5) / 0.16)) & 1) === 0 ? "#222a36" : "#1a212b";
        return col;
      }
      if (d < 0.03) col = look.rim;
      else if (d < 0.072) col = look.base;
      else if (d < 0.085) col = look.line;
      else {
        col = look.panel;
        if (look.style === "brace" && face !== "y") {
          const diag = Math.abs(Math.abs(u) / hu - Math.abs(v) / hv) * Math.min(hu, hv);
          if (diag < 0.012 && d > 0.1) col = look.line;
          else if (Math.abs(u) < 0.07 && Math.abs(v) < 0.07) col = look.base;
        } else if (look.style === "ribs" && face !== "y") {
          const t = (u + hu) / 0.13;
          if (t - Math.floor(t) < 0.16 && d > 0.1) col = look.line;
        } else if (look.style === "chevron") {
          const w = (Math.abs(u) + v * (face === "y" ? 0 : 1)) / 0.07;
          if (d > 0.12 && (((Math.floor(w) % 2) + 2) % 2 === 0) && Math.abs(v) < 0.1) col = look.accent ?? look.base;
        } else if (look.style === "plain") {
          if (d > 0.115 && d < 0.125) col = look.line;
        }
      }
      // rivets along the frame band
      if (d > 0.03 && d < 0.072) {
        const along = face === "y" ? Math.abs(u) : Math.abs(u);
        const a = (along + hu) % 0.19;
        const edgeV = hv - Math.abs(v);
        const edgeU = hu - Math.abs(u);
        if (edgeV < edgeU) {
          if ((a - 0.095) ** 2 + (edgeV - 0.05) ** 2 < 0.0000625 * 1.2) col = STEEL_LT;
        } else {
          const b2 = (Math.abs(v) + hv) % 0.19;
          if ((b2 - 0.095) ** 2 + (edgeU - 0.05) ** 2 < 0.0000625 * 1.2) col = STEEL_LT;
        }
      }
      // accent band round the crate
      if (look.accent && face !== "y" && look.style !== "chevron") {
        const bd = Math.abs(ly - (look.bandY ?? 0));
        if (bd < 0.052) col = bd < 0.04 ? look.accent : look.line;
      }
      // soft painted shading: grimy feet, lit top edge
      const grime = smoothstep(0.16, 0, gloss) * 0.4;
      const lit = smoothstep(0.82, 1, gloss) * 0.1;
      let c: string | readonly [number, number, number] = col;
      if (grime > 0.01) c = mix(c, INK, grime * (0.5 + 0.5 * noise(p, 0.06, 4)));
      if (lit > 0.01) c = mix(c, "#ffffff", lit);
      return c;
    });
  };

  // ------------------------------------------------------------------------------------------------------------
  // Crate: painted rounded body, corner caps, handles, latches and labels.
  type Label = { tex: THREE.Texture; face: "+z" | "-z" | "+x" | "-x"; u: number; v: number; size: [number, number] };
  type CrateOpts = {
    size: V; // w, h, d
    look: CrateLook;
    trim: string;
    skid?: boolean;
    lip?: boolean;
    labels?: Label[];
    eyes?: boolean; // lifting eyes on top
    handle?: boolean;
    topCase?: boolean; // carry handle on lid
    name?: string;
  };
  function crate(sp: Space, o: CrateOpts) {
    const [w, h, d] = o.size;
    const y0 = o.skid ? 0.04 : 0;
    const bh = h - y0;
    const centre = sp.pt([0, y0 + bh / 2, 0]);
    const pnt = cratePaint(o.look, centre, [w / 2, bh / 2, d / 2], sp.yaw);
    const body = sp.put(new RoundedBoxGeometry(w, bh, d, 2, 0.034), pnt, [0, y0 + bh / 2, 0], undefined, { name: o.name });
    if (o.skid) {
      for (const s of [1, -1]) sp.rbox(INK, [0.08, y0 + 0.006, d - 0.08], [s * (w / 2 - 0.16), (y0 + 0.006) / 2, 0], 0.01);
    }
    // corner caps
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        for (const yy of [y0 + 0.052, h - 0.052])
          sp.rbox(o.trim, [0.112, 0.112, 0.112], [sx * (w / 2 - 0.05), yy, sz * (d / 2 - 0.05)], 0.02);
    if (o.lip) sp.rbox(o.look.line, [w + 0.024, 0.05, d + 0.024], [0, h - 0.19, 0], 0.014);
    // handles (recessed D-grips) on the end faces
    if (o.handle !== false) {
      for (const s of [1, -1]) {
        const yy = y0 + bh * 0.5;
        sp.rbox(INK, [0.016, 0.085, 0.3], [s * (w / 2 + 0.004), yy, 0], 0.006);
        sp.rod(STEEL_LT, [s * (w / 2 + 0.034), yy, -0.12], [s * (w / 2 + 0.034), yy, 0.12], 0.012);
        sp.rod(STEEL_LT, [s * (w / 2 + 0.01), yy, -0.12], [s * (w / 2 + 0.034), yy, -0.12], 0.011);
        sp.rod(STEEL_LT, [s * (w / 2 + 0.01), yy, 0.12], [s * (w / 2 + 0.034), yy, 0.12], 0.011);
      }
    }
    // latches on the long faces
    for (const sz of [1, -1])
      for (const sx of [-1, 1]) {
        const yy = h - 0.2;
        sp.rbox(STEEL, [0.085, 0.115, 0.024], [sx * w * 0.27, yy, sz * (d / 2 + 0.008)], 0.008);
        sp.rbox(ORANGE, [0.052, 0.034, 0.03], [sx * w * 0.27, yy - 0.026, sz * (d / 2 + 0.012)], 0.008);
        sp.box(INK, [0.024, 0.024, 0.032], [sx * w * 0.27, yy + 0.034, sz * (d / 2 + 0.012)]);
      }
    // lifting eyes
    if (o.eyes) {
      for (const sx of [1, -1])
        for (const sz of [1, -1]) {
          sp.cyl(STEEL, 0.034, 0.034, 0.022, [sx * (w / 2 - 0.1), h + 0.008, sz * (d / 2 - 0.1)], undefined, 8);
          sp.m(STEEL_LT, new THREE.TorusGeometry(0.04, 0.011, 5, 12), [sx * (w / 2 - 0.1), h + 0.052, sz * (d / 2 - 0.1)], [0, 90 + (sz * sx > 0 ? 35 : -35) * 0, 0]);
        }
    }
    if (o.topCase) {
      sp.rod(INK, [-0.09, h - 0.003, 0], [-0.09, h + 0.05, 0], 0.012);
      sp.rod(INK, [0.09, h - 0.003, 0], [0.09, h + 0.05, 0], 0.012);
      sp.rod(RUBBER, [-0.1, h + 0.05, 0], [0.1, h + 0.05, 0], 0.018);
    }
    // labels
    for (const l of o.labels ?? []) {
      const e = 0.004;
      const yy = y0 + bh / 2 + l.v;
      if (l.face === "+z") sp.decal(l.tex, l.size, [l.u, yy, d / 2 + e], [0, 0, 1]);
      else if (l.face === "-z") sp.decal(l.tex, l.size, [-l.u, yy, -d / 2 - e], [0, 0, -1]);
      else if (l.face === "+x") sp.decal(l.tex, l.size, [w / 2 + e, yy, -l.u], [1, 0, 0]);
      else sp.decal(l.tex, l.size, [-w / 2 - e, yy, l.u], [-1, 0, 0]);
    }
    return body;
  }

  // Ratchet strap round a crate at local height y.
  function strap(sp: Space, y: number, w: number, d: number, color: string) {
    const hw = w / 2 + 0.01;
    const hd = d / 2 + 0.01;
    const r = 0.06;
    const pts: V[] = [
      [-hw + r, y, -hd], [hw - r, y, -hd], [hw, y, -hd + r], [hw, y, hd - r],
      [hw - r, y, hd], [-hw + r, y, hd], [-hw, y, hd - r], [-hw, y, -hd + r],
    ];
    b.sweep(catmull(pts.map((p) => sp.pt(p)), { closed: true }), () => [0.02, 0.005], { section: "box", color, bone: sp.bone, sides: 4 });
    // buckle
    sp.rbox(STEEL, [0.07, 0.085, 0.02], [0.1, y, hd + 0.012], 0.006);
    sp.rbox(INK, [0.045, 0.03, 0.024], [0.1, y + 0.01, hd + 0.016], 0.006);
  }

  // ------------------------------------------------------------------------------------------------------------
  // Pallet: merged planks and runners with a wood paint; runners along local z.
  const WOODS = [WOOD, "#b98c57", "#cfa06a", "#ad8150"];
  function pallet(sp: Space, w: number, d: number, seed: number) {
    const r = rng(seed);
    const H = 0.14;
    const runnerH = 0.108;
    for (const x of [-(w / 2 - 0.045), 0, w / 2 - 0.045]) sp.m(WOOD_DK, new THREE.BoxGeometry(0.09, runnerH, d), [x, runnerH / 2, 0]);
    const n = Math.round(d / 0.15);
    const bw = (d - 0.02 * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      const z = -d / 2 + bw / 2 + i * (bw + 0.02);
      sp.m(WOODS[Math.floor(r() * WOODS.length)], new THREE.BoxGeometry(w - r() * 0.015, H - runnerH, bw), [(r() - 0.5) * 0.012, runnerH + (H - runnerH) / 2, z]);
    }
    // bottom cross-tie blocks at the corners and nails
    for (const sx of [-1, 1])
      for (let i = 0; i < n; i += 1) {
        const z = -d / 2 + bw / 2 + i * (bw + 0.02);
        sp.cyl(STEEL, 0.009, 0.009, 0.004, [sx * (w / 2 - 0.03), H + 0.001, z + 0.02], undefined, 5);
        sp.cyl(STEEL, 0.009, 0.009, 0.004, [sx * (w / 2 - 0.03), H + 0.001, z - 0.02], undefined, 5);
      }
    // stamped end mark
    sp.rbox(INK, [0.14, 0.01, 0.03], [w / 2 - 0.2, H + 0.0005, -d / 2 + 0.07], 0.002);
  }

  // ------------------------------------------------------------------------------------------------------------
  // Barrels: lathe drum with hoops, painted bands, bungs and a decal.
  const BARREL: [number, number][] = [
    [0, 0], [0.245, 0], [0.275, 0.02], [0.29, 0.045], [0.29, 0.07], [0.276, 0.09],
    [0.277, 0.17], [0.292, 0.19], [0.292, 0.21], [0.277, 0.23],
    [0.277, 0.41], [0.292, 0.43], [0.292, 0.45], [0.277, 0.47],
    [0.277, 0.65], [0.292, 0.67], [0.292, 0.69], [0.277, 0.71],
    [0.276, 0.79], [0.29, 0.81], [0.29, 0.84], [0.272, 0.862], [0.25, 0.866], [0.236, 0.84], [0, 0.84],
  ];
  type BarrelLook = { body: string; band: string; hoop: string; lid: string; bandLo: number; bandHi: number; seed: number; tap?: boolean };
  const barrelPaint = (l: BarrelLook) =>
    paint((p, _n, s) => {
      const y = s[0];
      let col: string = l.body;
      const hoop = [0.2, 0.44, 0.68].some((c) => Math.abs(y - c) < 0.045) || y < 0.095 || y > 0.8;
      if (y > 0.835 && y < 0.88) col = l.lid;
      else if (hoop) col = l.hoop;
      else if (y > l.bandLo && y < l.bandHi) col = l.band;
      // thin pinstripe at band edges
      if (!hoop && (Math.abs(y - l.bandLo) < 0.008 || Math.abs(y - l.bandHi) < 0.008)) col = INK;
      const grime = smoothstep(0.3, 0, y) * 0.45 * (0.5 + 0.5 * noise(p, 0.07, l.seed));
      const streak = 0.12 * noise(p, 0.12, l.seed + 3);
      const c = mix(col, INK, grime + streak);
      return y > 0.82 ? mix(c, "#ffffff", 0.06) : c;
    });
  const barrelLooks: Record<string, BarrelLook> = {
    white: { body: PANEL, band: ORANGE, hoop: SLATE, lid: STEEL, bandLo: 0.235, bandHi: 0.65, seed: 1 },
    navy: { body: NAVY, band: PANEL, hoop: INK, lid: STEEL, bandLo: 0.47, bandHi: 0.65, seed: 2, tap: true },
    orange: { body: ORANGE, band: ORANGE, hoop: INK, lid: INK, bandLo: 0.0, bandHi: 0.0, seed: 3 },
    slate: { body: SLATE, band: ORANGE, hoop: INK, lid: STEEL, bandLo: 0.235, bandHi: 0.41, seed: 4 },
  };
  /** `sp` has its +y along the barrel axis, origin at the base centre. */
  function barrel(sp: Space, look: BarrelLook, label: THREE.Texture | null, labelDir: V, labelUp: V, name: string) {
    const body = b.lathe(BARREL, {
      at: sp.pt([0, 0, 0]),
      axis: sp.dir([0, 1, 0]),
      segments: 12,
      color: barrelPaint(look),
      bone: sp.bone,
      name,
    });
    // lid fittings
    sp.cyl(STEEL, 0.046, 0.046, 0.026, [0.1, 0.845, 0.06], undefined, 8);
    sp.cyl(INK, 0.026, 0.026, 0.034, [0.1, 0.85, 0.06], undefined, 6);
    sp.cyl(STEEL, 0.034, 0.034, 0.022, [-0.1, 0.845, -0.08], undefined, 8);
    sp.cyl(ORANGE_DK, 0.02, 0.02, 0.03, [-0.1, 0.85, -0.08], undefined, 6);
    // clamp ring lug
    sp.rbox(STEEL, [0.07, 0.07, 0.05], [0.2, 0.77, 0.2], 0.012, [0, 45, 0]);
    sp.cyl(INK, 0.014, 0.014, 0.075, [0.222, 0.77, 0.222], [0, 0, 0], 6);
    if (look.tap) {
      // drain tap low on the side
      sp.cyl(STEEL, 0.026, 0.026, 0.09, [0.3, 0.1, -0.1], [0, 0, 90], 8);
      sp.cyl(INK, 0.036, 0.036, 0.03, [0.27, 0.1, -0.1], [0, 0, 90], 8);
      sp.box(ORANGE, [0.05, 0.012, 0.012], [0.3, 0.145, -0.1]);
      sp.cyl(STEEL_LT, 0.01, 0.01, 0.05, [0.3, 0.12, -0.1], undefined, 5);
    }
    if (label) {
      b.decal(body, label, {
        at: sp.pt([0, 0.44, 0.29]).add(sp.dir(labelDir).multiplyScalar(0.0)),
        dir: sp.dir(labelDir),
        up: sp.dir(labelUp),
        size: [0.27, 0.27],
        segments: 8,
        lift: 0.003,
      });
    }
    return body;
  }

  // ============================================================================================================
  // THE DECK
  const deckPaint = paint((p, n) => {
    if (n.y < 0.5) {
      if (p.y < 0.05) return INK;
      if (p.y > 0.135) return DECK_LT;
      return Math.abs(p.y - 0.092) < 0.007 ? ORANGE : "#56677c";
    }
    const x = p.x;
    const z = p.z;
    const dEdge = Math.min(1.95 - Math.abs(x), 1.9 - z);
    if (dEdge < 0.014) return INK;
    if (dEdge < 0.15) return (Math.floor((x + z) / 0.1) & 1) === 0 ? ORANGE : INK;
    if (dEdge < 0.164) return INK;
    // steel plates
    const row = Math.floor((z + 1.3) / 0.75);
    const off = row & 1 ? 0.4375 : 0;
    const pu = x + off + 3;
    const col = Math.floor(pu / 0.875);
    const fu = pu - col * 0.875;
    const fv = z + 1.3 - row * 0.75;
    const tint = ((col * 7 + row * 13) % 5) / 5;
    let c: string | readonly [number, number, number] = mix(DECK, DECK_LT, tint * 0.8);
    if (fu < 0.012 || fv < 0.012 || fu > 0.875 - 0.003 || fv > 0.75 - 0.003) c = "#4d5c70";
    else if (fu < 0.024 || fv < 0.024) c = mix(c, "#ffffff", 0.15);
    // rivets
    for (const rx of [0.055, 0.82]) for (const rz of [0.055, 0.695]) if ((fu - rx) ** 2 + (fv - rz) ** 2 < 0.00014) c = STEEL_LT;
    // anti-slip diamond tread band in the middle of each plate
    if (fu > 0.18 && fu < 0.7 && fv > 0.18 && fv < 0.57) {
      const a = (fu * 6 + fv * 6) % 1;
      const b2 = (fu * 6 - fv * 6 + 20) % 1;
      if (Math.abs(a - 0.5) < 0.11 && Math.abs(b2 - 0.5) < 0.11) c = mix(c, "#ffffff", 0.12);
      else c = mix(c, INK, 0.08);
    }
    return mix(c, INK, 0.3 * noise(p, 0.28, 11));
  });
  b.part(new RoundedBoxGeometry(3.9, D, 3.2, 2, 0.03), deckPaint, { bone: root, at: [0, D / 2, 0.3], flat: true, name: "deck" });
  // kerb along the quay edge
  const kerbPaint = paint((p, n) => {
    if (n.y > 0.5) return (Math.floor((p.x - p.z) / 0.1) & 1) === 0 ? ORANGE : INK;
    return n.z > 0.5 ? mix(SLATE, INK, 0.25) : INK;
  });
  b.part(new RoundedBoxGeometry(3.9, 0.1, 0.15, 2, 0.02), kerbPaint, { bone: root, at: [0, D + 0.05 - 0.004, -1.235], flat: true, name: "kerb" });
  const deckS = W([0, D, 0]);
  // deck lights along the front hazard border
  {
    const lights: THREE.BufferGeometry[] = [];
    const pts: V[] = [];
    for (let i = -7; i <= 7; i++) pts.push([i * 0.25, 0, 1.9 - 0.157]);
    for (const z of [-0.8, 0, 0.8, 1.6]) pts.push([-1.95 + 0.157, 0, z], [1.95 - 0.157, 0, z]);
    for (const q of pts) {
      deckS.cyl(INK, 0.04, 0.045, 0.016, [q[0], 0.008, q[2]], undefined, 8);
      lights.push(new THREE.CylinderGeometry(0.026, 0.026, 0.006, 6).translate(q[0], D + 0.0185, q[2]));
    }
    glow(b.part(mergeGeometries(lights)!, ORANGE_LT, { bone: root, at: [0, 0, 0], name: "deckLights" }), 1.4);
  }
  // bay markings
  b.part(new THREE.PlaneGeometry(0.95, 0.48), "#ffffff", { bone: root, at: [0.45, D + 0.003, 0.4], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: floorBay });
  for (const x of [-0.12, 1.02]) b.part(new THREE.PlaneGeometry(0.16, 0.24), "#ffffff", { bone: root, at: [x, D + 0.003, 0.4], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: floorArrows });
  // flush lashing rings
  for (const [x, z] of [[-1.8, 0.9], [1.8, 1.0], [0.95, -1.08], [-0.38, -0.45]] as [number, number][]) {
    deckS.cyl(INK, 0.05, 0.05, 0.01, [x, 0.005, z], undefined, 10);
    deckS.m(STEEL_LT, new THREE.TorusGeometry(0.034, 0.008, 5, 10), [x, 0.014, z], [78, 0, 0]);
  }
  // oil puddle
  deckS.cyl("#1d2a3a", 0.14, 0.14, 0.003, [1.0, 0.002, 0.15], [0, 0, 0], 12);

  // bollards and rope
  for (const [bx, bz] of [[-0.25, -1.05], [-1.78, -1.08]] as [number, number][]) {
    b.lathe(
      [[0, 0], [0.15, 0], [0.15, 0.03], [0.11, 0.05], [0.095, 0.08], [0.09, 0.2], [0.115, 0.23], [0.115, 0.31], [0.08, 0.34], [0, 0.34]],
      { at: [bx, D, bz], segments: 10, color: paint((_p, _n, s) => (s[0] > 0.23 ? ORANGE : s[0] < 0.045 ? INK : SLATE)), bone: root, name: "bollard" },
    );
    for (let i = 0; i < 4; i++) deckS.cyl(STEEL_LT, 0.012, 0.012, 0.02, [bx + Math.cos(i * 1.5708 + 0.7) * 0.125, 0.036, bz + Math.sin(i * 1.5708 + 0.7) * 0.125], undefined, 5);
  }
  {
    // rope turns round the second bollard and a tail on the deck
    const rp = (r: number, y: number, a: number): V => [-1.78 + Math.cos(a) * r, D + y, -1.08 + Math.sin(a) * r];
    const turns: V[] = [];
    for (let i = 0; i <= 28; i++) turns.push(rp(0.112, 0.12 + i * 0.0047, i * 0.62));
    turns.push(rp(0.125, 0.25, 17.4), [-1.6, D + 0.02, -0.95], [-1.4, D + 0.014, -1.05], [-1.15, D + 0.014, -1.12]);
    b.sweep(catmull(turns), 0.017, { color: ROPE, bone: root, sides: 6, name: "rope" });
  }

  // ============================================================================================================
  // TOWER OF CRATES on pallet 1
  {
    const p1 = W([-1.15, D, -0.58], 98);
    pallet(p1, 0.8, 1.2, 3);
    // crate A (large)
    const aCentre = p1.pt([0, 0.14, 0]);
    const A = W(aCentre.toArray() as V, 98 + 3);
    crate(A, {
      size: [1.04, 0.74, 0.72],
      look: { base: NAVY, panel: "#31465f", rim: INK, line: INK, accent: ORANGE, bandY: -0.08, style: "brace" },
      trim: STEEL,
      skid: true,
      lip: true,
      labels: [
        { tex: plateA, face: "+z", u: -0.28, v: 0.12, size: [0.34, 0.18] },
        { tex: iconFragile, face: "+z", u: 0.28, v: 0.14, size: [0.16, 0.16] },
        { tex: iconArrows, face: "+x", u: 0.0, v: 0.0, size: [0.2, 0.2] },
        { tex: plateB, face: "-z", u: 0.0, v: 0.08, size: [0.34, 0.18] },
        { tex: iconBolt, face: "-x", u: 0.0, v: 0.02, size: [0.18, 0.18] },
      ],
    });
    strap(A, 0.36, 1.04, 0.72, ORANGE);
    const ledGeos: THREE.BufferGeometry[] = [];
    for (const x of [-0.4, 0.4, 0.34, -0.34]) {
      const g = new THREE.BoxGeometry(0.035, 0.012, 0.006);
      g.applyMatrix4(new THREE.Matrix4().compose(A.pt([x, 0.1, 0.36 + 0.004]), A.rotq(), new THREE.Vector3(1, 1, 1)));
      ledGeos.push(g);
    }
    glow(b.part(mergeGeometries(ledGeos)!, ORANGE_LT, { bone: root, at: [0, 0, 0], name: "crateLeds" }), 1.4);
    // crate B (medium hard-case)
    const B = W(A.pt([0.04, 0.74, 0.02]).toArray() as V, 98 + 3 - 11);
    crate(B, {
      size: [0.8, 0.5, 0.6],
      look: { base: SLATE, panel: PANEL, rim: SLATE, line: "#566a82", accent: ORANGE, bandY: -0.04, style: "ribs" },
      trim: ORANGE_DK,
      lip: false,
      labels: [
        { tex: plateC, face: "+z", u: 0.0, v: 0.08, size: [0.3, 0.16] },
        { tex: iconBolt, face: "+x", u: 0, v: 0.0, size: [0.17, 0.17] },
        { tex: iconHazard, face: "-z", u: 0.2, v: 0.05, size: [0.15, 0.15] },
      ],
    });
    // crate C (small, orange)
    const C = W(B.pt([-0.08, 0.5, 0.0]).toArray() as V, 98 + 3 - 11 + 26);
    crate(C, {
      size: [0.5, 0.34, 0.38],
      look: { base: ORANGE, panel: "#ff8a2e", rim: ORANGE_DK, line: ORANGE_DK, accent: INK, bandY: 0, style: "plain" },
      trim: INK,
      topCase: true,
      labels: [
        { tex: plateE, face: "+z", u: 0, v: 0.0, size: [0.26, 0.14] },
        { tex: iconFragile, face: "+x", u: 0, v: 0, size: [0.14, 0.14] },
      ],
    });
    // handheld scanner lying on crate B
    const sc = W(B.pt([0.22, 0.5, 0.12]).toArray() as V, 98 - 8 + 40);
    sc.rbox(INK, [0.085, 0.034, 0.17], [0, 0.017, 0], 0.012);
    sc.rbox(ORANGE, [0.085, 0.01, 0.06], [0, 0.036, -0.055], 0.004);
    sc.box(RUBBER, [0.06, 0.012, 0.05], [0, 0.04, 0.04]);
    sc.cyl(INK, 0.018, 0.018, 0.05, [0, 0.025, 0.1], [90, 0, 0], 8);
    const scr = b.part(new THREE.BoxGeometry(0.058, 0.004, 0.04), "#ffd9a8", { bone: root, at: sc.pt([0, 0.044, -0.055]), quat: sc.rotq() });
    glow(scr, 1.2);
  }
  // empty landing pallet under the hanging crate
  pallet(W([0.45, D, -0.5], 90), 0.8, 1.2, 11);

  // ============================================================================================================
  // OPEN POWER-CELL CASE with a hinged lid
  const caseW = 0.86;
  const caseH = 0.46;
  const caseD = 0.6;
  {
    const cs = W([-0.55, D, 0.55], 8);
    const centre = cs.pt([0, caseH / 2, 0]);
    const look: CrateLook = { base: INK, panel: "#1d2735", rim: INK, line: "#3d4f66", accent: ORANGE, bandY: 0.0, style: "chevron" };
    const pnt = cratePaint({ ...look, style: "plain" }, centre, [caseW / 2, caseH / 2, caseD / 2], cs.yaw);
    // body: lower box plus four rim walls round a foam bed
    const lowH = caseH - 0.07;
    cs.put(new RoundedBoxGeometry(caseW, lowH, caseD, 2, 0.03), pnt, [0, lowH / 2, 0], undefined, { name: "caseBody" });
    const wall = 0.05;
    cs.put(new RoundedBoxGeometry(caseW, 0.075, wall, 1, 0.015), pnt, [0, lowH + 0.03, caseD / 2 - wall / 2]);
    cs.put(new RoundedBoxGeometry(caseW, 0.075, wall, 1, 0.015), pnt, [0, lowH + 0.03, -caseD / 2 + wall / 2]);
    cs.put(new RoundedBoxGeometry(wall, 0.075, caseD - 2 * wall + 0.01, 1, 0.015), pnt, [caseW / 2 - wall / 2, lowH + 0.03, 0]);
    cs.put(new RoundedBoxGeometry(wall, 0.075, caseD - 2 * wall + 0.01, 1, 0.015), pnt, [-caseW / 2 + wall / 2, lowH + 0.03, 0]);
    // foam bed
    cs.rbox("#222b38", [caseW - 0.1, 0.05, caseD - 0.1], [0, lowH + 0.012, 0], 0.008);
    cs.rbox(ORANGE_DK, [caseW - 0.09, 0.012, caseD - 0.09], [0, lowH - 0.014, 0], 0.004);
    // cells: 3 x 2 slots, one empty
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++) {
        const x = (i - 1) * 0.26;
        const z = (j - 0.5) * 0.25;
        cs.cyl(INK, 0.092, 0.092, 0.02, [x, lowH + 0.039, z], undefined, 12);
        if (i === 2 && j === 1) {
          cs.cyl("#0f141b", 0.07, 0.07, 0.012, [x, lowH + 0.05, z], undefined, 12);
          continue;
        }
        cs.cyl(STEEL, 0.075, 0.075, 0.24, [x, lowH + 0.16, z], undefined, 10);
        cs.cyl(INK, 0.078, 0.078, 0.05, [x, lowH + 0.045, z], undefined, 10);
        cs.cyl(ORANGE_DK, 0.08, 0.08, 0.016, [x, lowH + 0.2, z], undefined, 10);
        cs.cyl(INK, 0.05, 0.065, 0.028, [x, lowH + 0.294, z], undefined, 10);
        cs.cyl(STEEL_LT, 0.02, 0.02, 0.026, [x, lowH + 0.32, z], undefined, 6);
      }
    const cores: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++) {
        if (i === 2 && j === 1) continue;
        const x = (i - 1) * 0.26;
        const z = (j - 0.5) * 0.25;
        const g = new THREE.CylinderGeometry(0.081, 0.081, 0.11, 10);
        g.applyMatrix4(new THREE.Matrix4().compose(cs.pt([x, lowH + 0.275 - 0.12, z]), cs.rotq(), new THREE.Vector3(1, 1, 1)));
        cores.push(g);
      }
    glow(b.part(mergeGeometries(cores)!, ORANGE_LT, { bone: root, at: [0, 0, 0], name: "cells" }), 1.5);
    // skids, corner caps, front latches, side handles
    for (const s of [1, -1]) {
      cs.rbox(INK, [0.08, 0.034, caseD - 0.08], [s * (caseW / 2 - 0.16), 0.0, 0], 0.01);
      cs.rbox(INK, [0.016, 0.085, 0.3], [s * (caseW / 2 + 0.004), 0.22, 0], 0.006);
      cs.rod(STEEL_LT, [s * (caseW / 2 + 0.034), 0.22, -0.12], [s * (caseW / 2 + 0.034), 0.22, 0.12], 0.012);
      cs.rod(STEEL_LT, [s * (caseW / 2 + 0.01), 0.22, -0.12], [s * (caseW / 2 + 0.034), 0.22, -0.12], 0.011);
      cs.rod(STEEL_LT, [s * (caseW / 2 + 0.01), 0.22, 0.12], [s * (caseW / 2 + 0.034), 0.22, 0.12], 0.011);
      for (const sz of [1, -1]) {
        cs.rbox(ORANGE_DK, [0.112, 0.112, 0.112], [s * (caseW / 2 - 0.05), 0.052, sz * (caseD / 2 - 0.05)], 0.02);
        cs.rbox(ORANGE_DK, [0.112, 0.112, 0.112], [s * (caseW / 2 - 0.05), caseH - 0.052, sz * (caseD / 2 - 0.05)], 0.02);
        cs.rbox(STEEL, [0.085, 0.115, 0.024], [s * caseW * 0.27, caseH - 0.2, sz * (caseD / 2 + 0.008)], 0.008);
        cs.rbox(ORANGE, [0.052, 0.034, 0.03], [s * caseW * 0.27, caseH - 0.226, sz * (caseD / 2 + 0.012)], 0.008);
      }
    }
    cs.decal(plateD, [0.3, 0.16], [-0.2, 0.16, caseD / 2 + 0.004], [0, 0, 1]);
    cs.decal(iconBolt, [0.15, 0.15], [0.2, 0.17, caseD / 2 + 0.004], [0, 0, 1]);
    cs.decal(iconHazard, [0.14, 0.14], [0, 0.2, -caseD / 2 - 0.004], [0, 0, -1]);

    // hinged lid
    const hingePt = cs.pt([0, caseH - 0.0, -caseD / 2]);
    const lid = b.joint("caseLid", { parent: root, at: hingePt, dir: cs.dir([0, 0, 1]), role: "hinge" });
    const ls = new Space(cs.o, cs.yaw, lid);
    const lidH = 0.075;
    const lpaint = cratePaint({ ...look, style: "brace", inner: true }, ls.pt([0, caseH + lidH / 2 - 0.02, 0]), [caseW / 2, lidH / 2, caseD / 2], cs.yaw);
    ls.put(new RoundedBoxGeometry(caseW, lidH, caseD, 2, 0.03), lpaint, [0, caseH + lidH / 2 - 0.02, 0], undefined, { name: "caseLid" });
    ls.box(INK, [caseW - 0.04, 0.012, 0.016], [0, caseH - 0.002, -caseD / 2 - 0.004]);
    for (const s of [1, -1]) {
      ls.cyl(STEEL, 0.018, 0.018, 0.1, [s * 0.26, caseH + 0.01, -caseD / 2 - 0.012], [0, 0, 90], 8);
      ls.cyl(STEEL, 0.018, 0.018, 0.1, [s * 0.26, caseH + 0.01, -caseD / 2 - 0.012], [0, 0, 90], 8);
      ls.rbox(ORANGE_DK, [0.112, 0.112, 0.112], [s * (caseW / 2 - 0.05), caseH + lidH - 0.07, -(caseD / 2 - 0.05)], 0.02);
      ls.rbox(ORANGE_DK, [0.112, 0.112, 0.112], [s * (caseW / 2 - 0.05), caseH + lidH - 0.07, caseD / 2 - 0.05], 0.02);
      ls.rbox(STEEL, [0.085, 0.03, 0.024], [s * caseW * 0.27, caseH + 0.03, caseD / 2 + 0.008], 0.008);
    }
    // lid top: hazard chevrons and plate on its outside (top face), seen from behind when open
    ls.decal(plateD, [0.3, 0.16], [0, caseH + lidH - 0.016, 0], [0, 1, 0], [0, 0, -1]);
    flush(); // lid pieces must be merged before the joint turns
    b.pose(lid, { axis: cs.dir([1, 0, 0]), deg: -102 });
  }

  // ============================================================================================================
  // BARRELS
  const standing = (x: number, z: number, yaw: number, look: BarrelLook, tex: THREE.Texture | null, name: string, base = D) => {
    const sp = W([x, base, z], yaw);
    barrel(sp, look, tex, [0, 0, 1], [0, 1, 0], name);
    return sp;
  };
  standing(-1.55, 0.5, -20, barrelLooks.white, iconCoolant, "barrelA");
  standing(-1.55, 1.15, 60, barrelLooks.navy, iconFuel, "barrelB");
  standing(-1.0, 1.5, 10, barrelLooks.orange, iconHazard, "barrelC");
  // a lying drum on wooden chocks
  {
    const th = -90;
    const a = new THREE.Vector3(Math.cos(th * RAD), 0, -Math.sin(th * RAD));
    const c = new THREE.Vector3(1.5, D + 0.292 + 0.01, 0.25);
    const base = c.clone().addScaledVector(a, -0.44);
    const lb = new Space(base, th, root, 0, -90);
    barrel(lb, barrelLooks.slate, iconCoolant, [0, 0, 1], [-1, 0, 0], "barrelLying");
    for (const s of [1, -1])
      for (const zz of [-0.26, 0.26])
        b.extrude([[0, 0], [0.2, 0], [0.2, 0.11]], {
          at: [c.x + s * 0.42, D, c.z + zz],
          x: [-s, 0, 0],
          y: [0, 1, 0],
          thickness: 0.1,
          bevel: 0.008,
          color: ORANGE_DK,
          bone: root,
          name: "chock",
        });
  }

  // ============================================================================================================
  // PALLET + LOAD + JACK
  const P2yaw = 80;
  const p2 = W([0.0, D, 1.25], P2yaw);
  pallet(p2, 0.8, 1.2, 7);
  {
    const LC = W(p2.pt([0, 0.14, 0.32]).toArray() as V, P2yaw + 4);
    crate(LC, {
      size: [0.62, 0.4, 0.5],
      look: { base: NAVY, panel: "#30445d", rim: INK, line: INK, accent: PANEL, bandY: 0.06, style: "plain" },
      trim: ORANGE_DK,
      skid: true,
      labels: [
        { tex: plateB, face: "+z", u: 0, v: -0.02, size: [0.26, 0.14] },
        { tex: iconArrows, face: "+x", u: 0, v: -0.02, size: [0.15, 0.15] },
      ],
    });
    strap(LC, 0.2, 0.62, 0.5, ORANGE);
    const LD = W(p2.pt([0, 0.14, -0.3]).toArray() as V, P2yaw - 6);
    crate(LD, {
      size: [0.62, 0.36, 0.46],
      look: { base: SLATE, panel: PANEL, rim: SLATE, line: "#566a82", accent: ORANGE, bandY: 0.0, style: "chevron" },
      trim: INK,
      labels: [
        { tex: plateC, face: "+z", u: 0, v: 0.0, size: [0.26, 0.14] },
        { tex: iconHazard, face: "+x", u: 0, v: 0.0, size: [0.14, 0.14] },
      ],
    });
  }
  const js = new Space(p2.pt([0, 0, 1.2]), P2yaw);
  {
    const fcy = Math.cos(P2yaw * RAD);
    const fsy = Math.sin(P2yaw * RAD);
    const forkPaint = paint((p, n, s) => {
      if (s[0] > 0.93) return (Math.floor((s[0] + s[1]) / 0.034) & 1) === 0 ? ORANGE : INK;
      if (n.y > 0.5) {
        const lx = (p.x - js.o.x) * fcy - (p.z - js.o.z) * fsy;
        const lat = Math.abs(Math.abs(lx) - 0.2);
        if (lat > 0.066) return INK;
        if (lat < 0.007 && s[0] > 0.12 && s[0] < 0.88 && ((s[0] * 9) % 1) < 0.62) return ORANGE_LT;
        if (s[0] % 0.3 < 0.008) return NAVY;
        return mix(SLATE, "#4d6580", smoothstep(0.0, 1.0, s[0]) * 0.5);
      }
      return mix(NAVY, INK, 0.3 * noise(p, 0.05, 6));
    });
    for (const s of [1, -1])
      b.extrude([[0, 0], [1.02, 0], [1.15, 0.03], [1.15, 0.055], [1.03, 0.085], [0, 0.085]], {
        at: js.pt([s * 0.2, 0, 0.1]),
        x: js.dir([0, 0, -1]),
        y: [0, 1, 0],
        thickness: 0.16,
        bevel: 0.012,
        color: forkPaint,
        bone: root,
        name: "fork",
      });
    for (const s of [1, -1]) {
      js.cyl(STEEL, 0.046, 0.046, 0.2, [s * 0.2, 0.046, 0.1 - 1.065], [0, 0, 90], 10);
      js.cyl(STEEL_LT, 0.02, 0.02, 0.212, [s * 0.2, 0.046, 0.1 - 1.065], [0, 0, 90], 6);
    }
    const housing = paint((p, n) => {
      const y = p.y - D;
      if (y < 0.1) return INK;
      if (Math.abs(y - 0.13) < 0.006) return INK;
      const wear = 0.22 * smoothstep(0.55, 0.8, noise(p, 0.07, 5));
      const base = n.y > 0.5 ? ORANGE_LT : mix(ORANGE, ORANGE_LT, smoothstep(0.24, 0.3, y) * 0.5);
      return mix(base, ORANGE_DK, wear);
    });
    js.put(new RoundedBoxGeometry(0.56, 0.22, 0.34, 2, 0.035), housing, [0, 0.2, 0.13], undefined, { name: "jackHousing" });
    js.decal(jackPlate, [0.22, 0.11], [0.285, 0.21, 0.13], [1, 0, 0]);
    js.decal(jackPlate, [0.22, 0.11], [-0.285, 0.21, 0.13], [-1, 0, 0]);
    js.decal(iconHazard, [0.11, 0.11], [0, 0.2, 0.305], [0, 0, 1]);
    // vent slats, rear bumper, pump cover and hose
    for (let i = 0; i < 4; i++) {
      js.rbox(INK, [0.012, 0.012, 0.15], [0.288, 0.255 - i * 0.03, 0.13 - 0.0], 0.003);
      js.rbox(INK, [0.012, 0.012, 0.15], [-0.288, 0.255 - i * 0.03, 0.13], 0.003);
    }
    js.rbox(INK, [0.5, 0.06, 0.04], [0, 0.14, 0.325], 0.012);
    js.rbox(ORANGE_DK, [0.18, 0.02, 0.2], [0, 0.312, 0.13], 0.006);
    js.rbox(PANEL, [0.14, 0.004, 0.02], [0, 0.323, 0.06], 0.001);
    b.sweep(catmull([js.pt([0.12, 0.31, 0.2]), js.pt([0.2, 0.39, 0.24]), js.pt([0.25, 0.31, 0.31]), js.pt([0.22, 0.22, 0.335])]), 0.011, { color: INK, bone: root, sides: 5, name: "hydraulicHose" });
    js.cyl(STEEL_LT, 0.045, 0.045, 0.2, [0, 0.34, 0.2], undefined, 10);
    js.cyl(INK, 0.052, 0.052, 0.03, [0, 0.31, 0.2], undefined, 10);
    for (const s of [1, -1]) {
      js.rbox(ORANGE_DK, [0.03, 0.1, 0.1], [s * 0.075, 0.35, 0.2], 0.008);
      js.rbox(INK, [0.14, 0.05, 0.05], [s * 0.19, 0.045, 0.19], 0.01);
    }
    js.rbox(INK, [0.4, 0.05, 0.05], [0, 0.1, 0.0], 0.01);
    for (const s of [1, -1]) for (const z of [0.0, 0.26]) js.cyl(STEEL_LT, 0.012, 0.012, 0.012, [s * 0.2, 0.31, z], undefined, 6);
    // wheels
    const wheel = b.joint("jackWheel", { parent: root, at: js.pt([0, 0.085, 0.2]), dir: js.dir([1, 0, 0]), role: "hinge" });
    const ws = new Space(js.o, P2yaw, wheel);
    for (const s of [1, -1]) {
      ws.cyl(RUBBER, 0.085, 0.085, 0.06, [s * 0.08, 0.085, 0.2], [0, 0, 90], 12);
      ws.cyl(STEEL_LT, 0.045, 0.045, 0.066, [s * 0.08, 0.085, 0.2], [0, 0, 90], 8);
      ws.cyl(ORANGE, 0.022, 0.022, 0.072, [s * 0.08, 0.085, 0.2], [0, 0, 90], 6);
    }
    ws.cyl(STEEL, 0.012, 0.012, 0.22, [0, 0.085, 0.2], [0, 0, 90], 6);
    // drawbar and handle
    const jh = b.joint("jackHandle", { parent: root, at: js.pt([0, 0.35, 0.2]), dir: new Space(js.o, P2yaw, root, 22).dir([0, 1, 0]), role: "hinge" });
    const hs = new Space(js.pt([0, 0.35, 0.2]), P2yaw, jh, 22);
    hs.rod(STEEL, [0, 0, 0], [0, 0.96, 0], 0.02, 8);
    hs.cyl(ORANGE, 0.036, 0.036, 0.07, [0, 0.06, 0], undefined, 8);
    hs.cyl(INK, 0.027, 0.027, 0.55, [0, 0.52, 0], undefined, 8);
    hs.rbox(INK, [0.18, 0.1, 0.1], [0, 1.0, 0], 0.025);
    hs.cyl(RUBBER, 0.024, 0.024, 0.52, [0, 1.0, 0.05], [0, 0, 90], 10);
    for (const s of [1, -1]) {
      hs.cyl(ORANGE, 0.03, 0.03, 0.035, [s * 0.27, 1.0, 0.05], [0, 0, 90], 10);
      hs.rbox(ORANGE, [0.035, 0.14, 0.014], [s * 0.1, 0.915, 0.075], 0.005, [-18, 0, 0]);
    }
    hs.rbox(INK, [0.04, 0.12, 0.014], [0, 0.92, 0.07], 0.005, [-18, 0, 0]);
    hs.rod(INK, [0.035, 0.12, 0.03], [0.035, 0.94, 0.04], 0.006);
    hs.cyl(ORANGE, 0.012, 0.012, 0.03, [0, 0.985, 0.0], [90, 0, 0], 6);
    // pitch the handle back a touch more than vertical
  }

  // ============================================================================================================
  // DAVIT CRANE
  const PX = 1.5;
  const PZ = -0.95;
  const HKX = 0.45;
  const HKZ = -0.5;
  const SY = 2.38; // sheave centre height
  const HY = 1.92; // hook block origin height
  const K = 0.8; // hook scale
  const bdx = HKX - PX;
  const bdz = HKZ - PZ;
  const BL = Math.hypot(bdx, bdz);
  const bs = new Space([PX, 0, PZ], (Math.atan2(-bdz, bdx) * 180) / Math.PI); // local +x runs along the boom
  const postTop = SY - 0.11;
  const postH = postTop - (D + 0.05);
  const post = b.lathe(
    [[0, 0], [0.12, 0], [0.12, 0.05], [0.105, 0.09], [0.105, 0.55], [0.116, 0.58], [0.116, 0.64], [0.105, 0.67], [0.105, postH - 0.07], [0.125, postH - 0.04], [0.125, postH], [0, postH]],
    {
      at: [PX, D + 0.05, PZ],
      segments: 8,
      color: paint((_p, _n, s) => {
        const y = s[0];
        if (y < 0.055) return INK;
        if (y > 0.58 && y < 0.64) return ORANGE;
        if (y > postH - 0.04) return ORANGE;
        if (y < 0.56) return ((Math.floor(y / 0.075 + s[1] / 45) & 1) === 0 ? ORANGE : INK);
        return mix(SLATE, "#5a7390", smoothstep(0.7, 1.9, y) * 0.4);
      }),
      bone: root,
      name: "davitPost",
    },
  );
  b.decal(post, iconHazard, { at: [PX, D + 1.1, PZ + 0.11], dir: [0, 0, 1], size: [0.14, 0.14], segments: 4, lift: 0.003 });
  b.decal(post, plateD, { at: [PX, D + 1.4, PZ + 0.11], dir: [0, 0, 1], size: [0.22, 0.12], segments: 4, lift: 0.003 });
  const dk = W([PX, D, PZ]);
  dk.rbox(STEEL, [0.6, 0.05, 0.6], [0, 0.025, 0], 0.015);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      dk.cyl(STEEL_LT, 0.028, 0.028, 0.03, [sx * 0.22, 0.065, sz * 0.22], undefined, 6);
      dk.cyl(INK, 0.034, 0.034, 0.012, [sx * 0.22, 0.05, sz * 0.22], undefined, 6);
    }
  for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as [number, number][])
    b.extrude([[0, 0], [0.18, 0], [0.02, 0.38]], {
      at: [PX + ux * 0.1, D + 0.05, PZ + uz * 0.1],
      x: [ux, 0, uz],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.006,
      color: ORANGE_DK,
      bone: root,
      name: "gusset",
    });
  // slew head
  const headP = paint((p, n) => {
    const y = p.y - (SY - 0.14);
    if (y < 0.03) return INK;
    if (n.y > 0.5) return ORANGE_LT;
    return mix(ORANGE, ORANGE_LT, smoothstep(0.1, 0.28, y) * 0.4);
  });
  bs.put(new RoundedBoxGeometry(0.34, 0.28, 0.34, 2, 0.04), headP, [0, SY + 0.03, 0], undefined, { name: "slewHead" });
  for (let i = 0; i < 4; i++) bs.rbox(INK, [0.016, 0.12, 0.04], [-0.175, SY + 0.03, -0.105 + i * 0.07], 0.004);
  bs.rbox(STEEL, [0.2, 0.06, 0.2], [0, SY - 0.12, 0], 0.012);
  // boom truss in the boom's own frame
  const lp = (a: V, c: V, t: number): V => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
  const NODES = 7;
  const topA: V = [0.17, SY + 0.14, 0];
  const topB: V = [BL - 0.02, SY + 0.05, 0];
  const botA: V = [0.17, SY - 0.09, 0];
  const botB: V = [BL - 0.02, SY - 0.085, 0];
  for (const sz of [1, -1]) {
    const off = (q: V): V => [q[0], q[1], q[2] + sz * 0.075];
    bs.rod(NAVY, off(topA), off(topB), 0.02, 6);
    bs.rod(NAVY, off(botA), off(botB), 0.02, 6);
    for (let i = 0; i <= NODES; i++) {
      const t = i / NODES;
      const tp = off(lp(topA, topB, t));
      const bt = off(lp(botA, botB, t));
      bs.rod(STEEL, tp, bt, 0.011, 5);
      if (i < NODES) {
        const t2 = (i + 1) / NODES;
        const from = i % 2 === 0 ? tp : bt;
        const to = i % 2 === 0 ? off(lp(botA, botB, t2)) : off(lp(topA, topB, t2));
        bs.rod(ORANGE, from, to, 0.012, 5);
      }
    }
  }
  for (let i = 0; i <= NODES; i += 1) {
    const t = i / NODES;
    const tp = lp(topA, topB, t);
    const bt = lp(botA, botB, t);
    bs.rod(INK, [tp[0], tp[1], -0.075], [tp[0], tp[1], 0.075], 0.012, 5);
    bs.rod(INK, [bt[0], bt[1], -0.075], [bt[0], bt[1], 0.075], 0.012, 5);
  }
  for (const sz of [1, -1]) {
    const nodeTop = lp(topA, topB, 0.55);
    bs.rod(STEEL, [0, SY - 0.66, sz * 0.06], [nodeTop[0], nodeTop[1], sz * 0.075], 0.02, 6);
  }
  // tip plates, sheave, axle
  const sheaveX = BL - 0.092;
  for (const sz of [1, -1])
    b.extrude([[-0.125, -0.07], [0.0, -0.115], [0.125, -0.07], [0.125, 0.1], [0.0, 0.12], [-0.125, 0.1]], {
      at: bs.pt([sheaveX, SY, sz * 0.062]),
      x: bs.dir([1, 0, 0]),
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.008,
      color: ORANGE_DK,
      bone: root,
      name: "tipPlate",
    });
  b.lathe([[0, -0.04], [0.085, -0.04], [0.085, -0.016], [0.07, -0.006], [0.07, 0.006], [0.085, 0.016], [0.085, 0.04], [0, 0.04]], {
    at: bs.pt([sheaveX, SY, 0]),
    axis: bs.dir([0, 0, 1]),
    segments: 12,
    color: STEEL_LT,
    bone: root,
    name: "sheave",
  });
  bs.cyl(INK, 0.016, 0.016, 0.18, [sheaveX, SY, 0], [90, 0, 0], 6);
  for (const sz of [1, -1]) bs.cyl(STEEL, 0.03, 0.03, 0.02, [sheaveX, SY, sz * 0.088], [90, 0, 0], 6);
  // winch drum behind the post
  for (const sz of [1, -1]) bs.cyl(ORANGE_DK, 0.13, 0.13, 0.025, [-0.25, SY + 0.0, sz * 0.12], [90, 0, 0], 12);
  bs.cyl(INK, 0.095, 0.095, 0.22, [-0.25, SY, 0], [90, 0, 0], 12);
  bs.cyl(STEEL, 0.04, 0.04, 0.3, [-0.25, SY, 0], [90, 0, 0], 8);
  // work lamp on the post
  dk.rod(STEEL, [0, 1.5, 0.1], [0, 1.5, 0.22], 0.016, 6);
  dk.cyl(INK, 0.075, 0.07, 0.13, [0, 1.5, 0.28], [90, 0, 0], 10);
  dk.cyl(ORANGE, 0.082, 0.082, 0.02, [0, 1.5, 0.34], [90, 0, 0], 10);
  glow(b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.012, 10), ORANGE_LT, { bone: root, at: [PX, D + 1.5, PZ + 0.352], dir: [0, 0, 1] }), 1.6);
  // extinguisher bracket and e-stop box on the post, beacon on the slew head
  dk.rbox(INK, [0.13, 0.025, 0.07], [-0.1, 0.62, 0.1], 0.006);
  dk.cyl(ORANGE_DK, 0.046, 0.046, 0.32, [-0.12, 0.8, 0.12], undefined, 8);
  dk.cyl(INK, 0.032, 0.046, 0.04, [-0.12, 0.98, 0.12], undefined, 8);
  dk.cyl(STEEL_LT, 0.014, 0.014, 0.05, [-0.12, 1.02, 0.12], undefined, 6);
  dk.rod(INK, [-0.12, 1.02, 0.12], [-0.06, 0.94, 0.17], 0.008, 5);
  dk.cyl(ORANGE, 0.049, 0.049, 0.05, [-0.12, 0.78, 0.12], undefined, 8);
  dk.rbox(INK, [0.11, 0.13, 0.05], [0.04, 0.88, 0.125], 0.01);
  dk.cyl(STEEL_LT, 0.034, 0.034, 0.014, [0.04, 0.88, 0.155], [90, 0, 0], 8);
  dk.cyl(ORANGE, 0.026, 0.026, 0.03, [0.04, 0.88, 0.17], [90, 0, 0], 8);
  bs.cyl(INK, 0.085, 0.09, 0.03, [0, SY + 0.185, 0], undefined, 8);
  glow(
    b.lathe([[0, 0], [0.06, 0], [0.06, 0.015], [0.045, 0.05], [0.025, 0.075], [0, 0.085]], {
      at: [PX, SY + 0.2, PZ],
      segments: 8,
      color: ORANGE_LT,
      bone: root,
      name: "beacon",
    }),
    1.6,
  );
  // hoist rope: drum over the boom, round the sheave, down to the hook block
  const ropePath = polyline([bs.pt([-0.25, SY + 0.02, 0]), bs.pt([0.0, SY + 0.09, 0]), bs.pt([0.5, SY + 0.075, 0]), bs.pt([sheaveX, SY + 0.092, 0])])
    .concat(arc(bs.pt([sheaveX, SY, 0]), bs.pt([sheaveX, SY + 0.092, 0]), bs.dir([0, 0, -1]), 90))
    .concat(polyline([bs.pt([BL, SY, 0]), [HKX, HY + 0.05 * K, HKZ]]));
  b.sweep(ropePath, 0.011, { color: INK, bone: root, sides: 6, name: "hoistRope" });

  // ------------------------------------------------------------------------------------------------------------
  // Hook block, sling and the lifted crate
  const hb = b.joint("hookBlock", { parent: root, at: [HKX, HY, HKZ], dir: [0, -1, 0], role: "hinge" });
  const hs = new Space([HKX, HY, HKZ], 0, hb);
  const h = (x: number, y: number, z = 0): V => [x * K, y * K, z * K];
  const hk = (pts: [number, number][]): [number, number][] => pts.map(([x, y]) => [x * K, y * K]);
  b.lathe(hk([[0, 0.05], [0.028, 0.05], [0.034, 0.0], [0.07, -0.05], [0.078, -0.1], [0.06, -0.14], [0, -0.14]]), {
    at: hs.pt([0, 0, 0]),
    segments: 8,
    color: STEEL,
    bone: hb,
    name: "hookSocket",
  });
  const cheekPaint = paint((_p, _n, s) => (s[1] < -0.2 * K ? ((Math.floor((s[0] + s[1]) / 0.034) & 1) === 0 ? INK : ORANGE) : s[1] > -0.02 ? ORANGE_DK : ORANGE));
  for (const sz of [1, -1])
    b.extrude(hk([[-0.075, 0], [0.075, 0], [0.12, -0.12], [0.12, -0.24], [0.075, -0.31], [-0.075, -0.31], [-0.12, -0.24], [-0.12, -0.12]]), {
      at: hs.pt(h(0, -0.09, sz * 0.075)),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.032,
      bevel: 0.008,
      color: cheekPaint,
      bone: hb,
      name: "hookCheek",
    });
  hs.decal(stencil("SWL 2T"), [0.1, 0.025], h(0, -0.2, 0.075 + 0.005 / K), [0, 0, 1]);
  b.lathe(hk([[0, -0.045], [0.082, -0.045], [0.082, -0.02], [0.066, -0.008], [0.066, 0.008], [0.082, 0.02], [0.082, 0.045], [0, 0.045]]), {
    at: hs.pt(h(0, -0.15)),
    axis: [0, 0, 1],
    segments: 12,
    color: STEEL_LT,
    bone: hb,
    name: "hookSheave",
  });
  hs.cyl(INK, 0.015, 0.015, 0.2, h(0, -0.15), [90, 0, 0], 6);
  for (const sz of [1, -1]) hs.cyl(STEEL, 0.026, 0.026, 0.02, h(0, -0.15, sz * 0.13), [90, 0, 0], 6);
  hs.cyl(STEEL, 0.045, 0.055, 0.04, h(0, -0.33), undefined, 8);
  hs.cyl(INK, 0.06, 0.06, 0.035, h(0, -0.37), undefined, 6);
  const hookPts: [number, number][] = [[0, -0.35], [0, -0.48], [0.012, -0.57], [0.07, -0.66], [0.15, -0.69], [0.21, -0.64], [0.22, -0.55], [0.18, -0.47]];
  b.sweep(catmull(hookPts.map(([x, y]) => hs.pt(h(x, y)))), [0.038 * K, 0.04 * K, 0.054 * K, 0.058 * K, 0.048 * K, 0.026 * K], {
    color: NAVY,
    bone: hb,
    sides: 8,
    smooth: false,
    name: "hook",
  });
  const latch = b.joint("hookLatch", { parent: hb, at: hs.pt(h(0.045, -0.525)), aim: hs.pt(h(0.18, -0.5)), role: "hinge" });
  b.capsule(hs.pt(h(0.045, -0.525)), hs.pt(h(0.178, -0.495)), 0.011 * K + 0.003, { color: ORANGE, bone: latch, name: "hookLatch" });
  hs.cyl(INK, 0.03 * K, 0.03 * K, 0.07 * K, h(0.03, -0.525), [90, 0, 0], 6);
  // master link
  hs.m(STEEL_LT, new THREE.TorusGeometry(0.085 * K, 0.014 * K + 0.002, 6, 14), h(0.13, -0.704), [0, 90, 0]);
  const ringBottom = hs.pt(h(0.13, -0.704 - 0.09));
  // lifted crate
  const HC = W([HKX + 0.13 * K, 0.38, HKZ], 0, hb);
  crate(HC, {
    size: [0.7, 0.46, 0.56],
    look: { base: SLATE, panel: "#556d8c", rim: NAVY, line: NAVY, accent: ORANGE, bandY: 0, style: "brace" },
    trim: STEEL_LT,
    skid: true,
    eyes: true,
    labels: [
      { tex: plateD, face: "+z", u: -0.1, v: 0.08, size: [0.3, 0.16] },
      { tex: iconHazard, face: "+z", u: 0.22, v: 0.1, size: [0.14, 0.14] },
      { tex: iconFragile, face: "+x", u: 0, v: 0.0, size: [0.16, 0.16] },
    ],
  });
  const hw = W([0, 0, 0], 0, hb);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const eye = HC.pt([sx * 0.25, 0.46 + 0.04, sz * 0.18]);
      const shackleTop = eye.clone().add(new THREE.Vector3(0, 0.05, 0));
      hw.rod(STEEL, [ringBottom.x, ringBottom.y, ringBottom.z], [shackleTop.x, shackleTop.y, shackleTop.z], 0.007, 5);
      hw.m(ORANGE, new THREE.TorusGeometry(0.03, 0.0085, 5, 10), [eye.x, eye.y + 0.012, eye.z], [0, 90, 0]);
      hw.cyl(INK, 0.0095, 0.0095, 0.07, [eye.x, eye.y + 0.04, eye.z], [0, 0, 90], 5);
      hw.cyl(STEEL_LT, 0.015, 0.015, 0.03, [shackleTop.x, shackleTop.y + 0.005, shackleTop.z], undefined, 6);
    }

  // ============================================================================================================
  // EXTRAS: toolbox, A-frame sign
  {
    const tb = W([1.4, D, -0.42], 70);
    tb.rbox(ORANGE, [0.4, 0.17, 0.18], [0, 0.085, 0], 0.03);
    tb.rbox(ORANGE_DK, [0.41, 0.025, 0.19], [0, 0.125, 0], 0.01);
    tb.rbox(INK, [0.12, 0.03, 0.2], [0, 0.0, 0], 0.005);
    tb.rod(INK, [-0.12, 0.17, 0], [0.12, 0.17, 0], 0.012);
    tb.rod(INK, [-0.12, 0.17, 0], [-0.12, 0.2, 0], 0.01);
    tb.rod(INK, [0.12, 0.17, 0], [0.12, 0.2, 0], 0.01);
    tb.rod(INK, [-0.12, 0.2, 0], [0.12, 0.2, 0], 0.014);
    for (const sx of [-1, 1]) tb.rbox(STEEL, [0.05, 0.045, 0.02], [sx * 0.12, 0.125, 0.096], 0.006);
    tb.decal(iconBolt, [0.1, 0.1], [0, 0.07, 0.094], [0, 0, 1]);
    // A-frame sign
    const sg = W([1.72, D, 0.98], -30);
    const tilt = 13;
    const sh = 0.58;
    const sw = 0.4;
    const cyy = (sh / 2) * Math.cos(tilt * RAD);
    const panelGeo = () => new RoundedBoxGeometry(sw, sh, 0.025, 1, 0.01);
    sg.m(INK, panelGeo(), [0, cyy, -0.077], [tilt, 0, 0]);
    sg.m(ORANGE, panelGeo(), [0, cyy, 0.077], [-tilt, 0, 0]);
    const nrm = [0, Math.sin(tilt * RAD), Math.cos(tilt * RAD)];
    sg.decal(signTex, [sw - 0.04, sh - 0.04], [0, cyy + nrm[1] * 0.0165, 0.077 + nrm[2] * 0.0165], [nrm[0], nrm[1], nrm[2]], [0, Math.cos(tilt * RAD), -Math.sin(tilt * RAD)]);
    sg.cyl(STEEL_LT, 0.014, 0.014, 0.44, [0, sh * 0.975, 0], [0, 0, 90], 6);
  }

  // ============================================================================================================
  // CABLE REEL, CONES, HARD HAT, TAG LINE
  {
    const rl = W([-1.66, D, 1.68], 20);
    rl.cyl(WOOD, 0.22, 0.22, 0.03, [0, 0.015, 0], undefined, 12);
    rl.cyl(WOOD_DK, 0.09, 0.09, 0.3, [0, 0.18, 0], undefined, 8);
    rl.cyl(INK, 0.175, 0.175, 0.24, [0, 0.18, 0], undefined, 12);
    rl.cyl(ORANGE, 0.178, 0.178, 0.035, [0, 0.2, 0], undefined, 12);
    rl.cyl(WOOD, 0.22, 0.22, 0.03, [0, 0.345, 0], undefined, 12);
    for (let i = 0; i < 4; i++) rl.cyl(STEEL_LT, 0.016, 0.016, 0.02, [Math.cos(i * 1.5708) * 0.19, 0.36, Math.sin(i * 1.5708) * 0.19], undefined, 6);
    rl.cyl(STEEL, 0.03, 0.03, 0.02, [0, 0.36, 0], undefined, 6);
    rl.rod(INK, [0.17, 0.17, 0.05], [0.27, 0.04, 0.14], 0.012, 5);
  }
  const coneP = paint((_p, _n, s) => (s[0] < 0.04 ? INK : s[0] > 0.17 && s[0] < 0.27 ? PANEL : ORANGE));
  for (const [cx, cz] of [[1.02, 0.64], [0.45, -1.03]] as [number, number][])
    b.lathe([[0, 0], [0.14, 0], [0.14, 0.03], [0.1, 0.036], [0.085, 0.04], [0.03, 0.44], [0.025, 0.455], [0, 0.455]], {
      at: [cx, D, cz],
      segments: 8,
      color: coneP,
      bone: root,
      name: "cone",
    });
  b.lathe([[0, 0], [0.15, 0], [0.15, 0.012], [0.12, 0.022], [0.115, 0.06], [0.085, 0.1], [0, 0.112]], {
    at: [-0.98, D + 0.862, 1.52],
    segments: 10,
    color: paint((_p, _n, s) => (s[0] < 0.024 ? ORANGE : PANEL)),
    bone: root,
    name: "hardHat",
  });
  {
    const hang = HC.pt([0.34, 0.08, 0.27]);
    const tail: V[] = [
      hang.toArray() as V,
      [hang.x + 0.1, hang.y - 0.06, hang.z + 0.12],
      [hang.x + 0.2, 0.34, hang.z + 0.25],
      [hang.x + 0.12, 0.2, 0.0],
      [1.1, D + 0.024, 0.14],
    ];
    b.sweep(catmull(tail), 0.011, { color: ROPE, bone: hb, sides: 5, name: "tagLine" });
    const coilPts: V[] = [];
    for (let i = 0; i <= 16; i++) {
      const a = i * 0.8;
      const r = 0.12 - i * 0.004;
      coilPts.push([1.1 + Math.cos(a) * r - 0.1, D + 0.012 + (i > 8 ? 0.016 : 0), 0.14 + Math.sin(a) * r]);
    }
    b.sweep(catmull(coilPts), 0.011, { color: ROPE, bone: root, sides: 5, name: "tagCoil" });
  }

  flush();
  return b.root;

  function flush() {
    for (const bag of bags.values()) {
      const g = mergeGeometries(bag.geos.map((x) => (x.index ? x.toNonIndexed() : x)));
      if (!g) throw new Error("merge failed");
      b.part(g, bag.color, { bone: bag.bone, at: [0, 0, 0], flat: bag.flat });
    }
    bags.clear();
  }
}
