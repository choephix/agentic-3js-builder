// Golden pheasant (Chrysolophus pictus), an adult male at real size, standing with wings spread for rigging. The
// plumage is almost all cards: SVG-drawn feathers rooted on the body, neck and wings, tinted by the body's paint
// where one drawing serves several colours. The orange cape is a shawl of barred tippet feathers, the golden crest
// is a mane of silky strands, the flight feathers are drawn quills laid flat along the wing, and the long tail is a
// roof of skinned rectrices painted with the cinnamon-and-black reticulation.
import { SphereGeometry, Vector3 } from "three";
import type { Texture } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { lerp, offset, rng } from "../src/math";
import { gradient, mix, paint, patches, resolve, smoothstep } from "../src/paint";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import type { Hit } from "../src/surface";
import { svg } from "../src/texture";

export const meta = {
  name: "Golden pheasant",
  description:
    "A male golden pheasant: silky gold crest, barred orange cape, green mantle, scarlet breast, blue tertials and a metre-long reticulated tail, feathered with SVG-drawn cards.",
};

const GOLD = "#f5b81c";
const SCARLET = "#d3221b";
const SCARLET_DEEP = "#9e1418";
const MANTLE = "#2f7a3b";
const CAPE = "#ef8412";
const THROAT = "#c7773a";
const THIGH = "#b4864c";
const SCAPULAR = "#7d1d1a";
const COVERT = "#8e4020";
const TAIL_BUFF = "#c99a58";
const TAIL_DARK = "#2a1c13";
const SHAFT = "#e2c68c";
const LEG = "#c9a45c";
const BEAK = "#dcb74c";
const CLAW = "#6f5a3a";
const IRIS = "#f3e17a";
const PUPIL = "#121212";
const SKIN = "#e9c341";

/** A feather outline anchored at its quill (bottom centre), scaled about that point; used to stack bands. */
const shrink = (k: number, cx: number, cy: number) =>
  `transform="translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})"`;

/** A rounded body feather, white at the tip and shaded toward its hidden root: the paint tints it. */
const CONTOUR = svg(
  `<svg viewBox="0 0 32 44">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#707070"/><stop offset="0.55" stop-color="#f2f2f2"/><stop offset="1" stop-color="#ffffff"/>
    </linearGradient></defs>
    <path d="M16 44 C9 38 3 30 3 19 C3 8 9 2 16 2 C23 2 29 8 29 19 C29 30 23 38 16 44 Z" fill="url(#g)"/>
    <path d="M16 44 L16 8" stroke="#a8a8a8" stroke-width="1.2" fill="none"/>
    <path d="M16 32 L7 22 M16 25 L8 14 M16 32 L25 22 M16 25 L24 14" stroke="#d6d6d6" stroke-width="0.8" fill="none"/>
  </svg>`,
  { size: 64 },
);

/** A wing covert: tinted like a body feather, with a dark rim inside a pale fringe that scallops the rows. */
const COVERT_FEATHER = svg(
  `<svg viewBox="0 0 32 44">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#5a5a5a"/><stop offset="0.6" stop-color="#e8e8e8"/><stop offset="1" stop-color="#ffffff"/>
    </linearGradient></defs>
    <path d="M16 44 C9 38 3 30 3 19 C3 8 9 2 16 2 C23 2 29 8 29 19 C29 30 23 38 16 44 Z" fill="#f0d8b0"/>
    <path d="M16 44 C9 38 4.2 30 4.2 20 C4.2 10 9 4.6 16 4.6 C23 4.6 27.8 10 27.8 20 C27.8 30 23 38 16 44 Z" fill="#2a1a14"/>
    <path d="M16 44 C10 38 6.5 30 6.5 21 C6.5 12 10 7.6 16 7.6 C22 7.6 25.5 12 25.5 21 C25.5 30 22 38 16 44 Z" fill="url(#g)"/>
    <path d="M16 44 L16 10" stroke="#8a8a8a" stroke-width="1" fill="none"/>
  </svg>`,
  { size: 64 },
);

/** A mantle feather: iridescent green with a black scalloped rim. */
const MANTLE_FEATHER = svg(
  `<svg viewBox="0 0 32 44">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#1c4a26"/><stop offset="0.6" stop-color="#3f9a45"/><stop offset="1" stop-color="#8fd05a"/>
    </linearGradient></defs>
    <path d="M16 44 C9 38 3 30 3 19 C3 8 9 2 16 2 C23 2 29 8 29 19 C29 30 23 38 16 44 Z" fill="#0b120d"/>
    <path d="M16 44 C10 38 6 30 6 21 C6 12 10 7 16 7 C22 7 26 12 26 21 C26 30 22 38 16 44 Z" fill="url(#g)"/>
  </svg>`,
  { size: 64 },
);

const TIPPET_OUTLINE = "M20 48 C12 42 2 34 2 22 C2 10 10 2 20 2 C30 2 38 10 38 22 C38 34 28 42 20 48 Z";
/** A cape (tippet) feather: broad and round, orange with two blue-black bars following its tip. */
const TIPPET = svg(
  `<svg viewBox="0 0 40 48">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#c85a08"/><stop offset="1" stop-color="#ffb02e"/>
    </linearGradient></defs>
    <path d="${TIPPET_OUTLINE}" fill="#f59a1c"/>
    <path d="${TIPPET_OUTLINE}" fill="#121633" ${shrink(0.93, 20, 48)}/>
    <path d="${TIPPET_OUTLINE}" fill="#f7a324" ${shrink(0.82, 20, 48)}/>
    <path d="${TIPPET_OUTLINE}" fill="#121633" ${shrink(0.74, 20, 48)}/>
    <path d="${TIPPET_OUTLINE}" fill="url(#g)" ${shrink(0.63, 20, 48)}/>
    <path d="M20 48 L20 14" stroke="#ffcf6a" stroke-width="0.9" fill="none"/>
  </svg>`,
  { size: 96 },
);

/** A silky crest strand: a slender golden lance with fine lighter hairs. */
const CREST = svg(
  `<svg viewBox="0 0 10 64">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#d8920c"/><stop offset="0.5" stop-color="#ffcc33"/><stop offset="1" stop-color="#ffe98c"/>
    </linearGradient></defs>
    <path d="M5 64 C3 50 1 32 2 18 C3 8 5 0 5 0 C5 0 7 8 8 18 C9 32 7 50 5 64 Z" fill="url(#g)"/>
    <path d="M5 62 C4.4 44 3.6 26 4.2 8 M5.8 60 C6.2 42 6.8 26 6 10" stroke="#fff2a8" stroke-width="0.45" fill="none"/>
  </svg>`,
  { size: 96 },
);

/** A rump feather: a golden lance, a little warmer at the edge. */
const RUMP = svg(
  `<svg viewBox="0 0 18 48">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#c98a10"/><stop offset="0.5" stop-color="#f8bf22"/><stop offset="1" stop-color="#ffe066"/>
    </linearGradient></defs>
    <path d="M9 48 C4 40 1 28 2 18 C3 8 9 1 9 1 C9 1 15 8 16 18 C17 28 14 40 9 48 Z" fill="#e89c14"/>
    <path d="M9 47 C5 39 3 28 4 18 C5 10 9 4 9 4 C9 4 13 10 14 18 C15 28 13 39 9 47 Z" fill="url(#g)"/>
    <path d="M9 48 L9 8" stroke="#fff0a0" stroke-width="0.7" fill="none"/>
  </svg>`,
  { size: 64 },
);

/** A long uppertail covert: gold at the root, running through orange to a crimson spear tip. */
const TAIL_COVERT = svg(
  `<svg viewBox="0 0 12 96">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#f2b01c"/><stop offset="0.45" stop-color="#ee6a14"/><stop offset="0.75" stop-color="#cf1e1a"/><stop offset="1" stop-color="#a3101a"/>
    </linearGradient></defs>
    <path d="M6 96 C3 80 1 56 1.5 36 C2 18 6 0 6 0 C6 0 10 18 10.5 36 C11 56 9 80 6 96 Z" fill="url(#g)"/>
    <path d="M6 96 L6 6" stroke="#ffd070" stroke-width="0.6" fill="none"/>
  </svg>`,
  { size: 128 },
);

const PRIMARY_OUTLINE = "M9 128 C7 112 3 92 2.5 64 C2 36 4 14 9 3 C12 -1 17 2 20 10 C22.5 22 23 48 22.5 74 C22 98 17 116 11 128 Z";
/** A primary: blackish-brown, the narrow outer vane (left) barred buff, a pale shaft. `mirror` flips it. */
const primary = (mirror: boolean) =>
  svg(
    `<svg viewBox="0 0 24 128">
      <defs><clipPath id="c"><path d="${PRIMARY_OUTLINE}"/></clipPath></defs>
      <g ${mirror ? 'transform="translate(24 0) scale(-1 1)"' : ""}>
        <path d="${PRIMARY_OUTLINE}" fill="#3a291d"/>
        <g clip-path="url(#c)">
          ${[18, 32, 46, 60, 74, 88, 102].map((y) => `<path d="M0 ${y} L9 ${y - 3} L9 ${y + 3} L0 ${y + 6} Z" fill="#cfa362"/>`).join("")}
          ${[22, 38, 54, 70, 86].map((y) => `<path d="M9 ${y} L24 ${y - 4} L24 ${y} L9 ${y + 4} Z" fill="#4c3726"/>`).join("")}
          <path d="${PRIMARY_OUTLINE}" fill="none" stroke="#1f160f" stroke-width="2.2"/>
        </g>
        <path d="M9.6 128 C9.4 90 9.2 40 10.5 6" stroke="#e0c690" stroke-width="1.1" fill="none"/>
      </g>
    </svg>`,
    { size: 128 },
  );

const SECONDARY_OUTLINE = "M16 104 C11 96 3 80 3 50 C3 22 6 6 16 3 C26 6 29 22 29 50 C29 80 21 96 16 104 Z";
/** A secondary: dark brown crossed by wavy chestnut bars, with a buff tip. */
const SECONDARY = svg(
  `<svg viewBox="0 0 32 104">
    <defs><clipPath id="c"><path d="${SECONDARY_OUTLINE}"/></clipPath></defs>
    <path d="${SECONDARY_OUTLINE}" fill="#33251b"/>
    <g clip-path="url(#c)" fill="none" stroke="#8c4a22" stroke-width="3.2">
      ${[20, 32, 44, 56, 68, 80].map((y) => `<path d="M0 ${y} Q8 ${y - 4} 16 ${y} T32 ${y}"/>`).join("")}
      <path d="M0 6 Q16 16 32 6" stroke="#c89b5c" stroke-width="5"/>
    </g>
    <path d="M16 104 L16 6" stroke="#d9bd86" stroke-width="1" fill="none"/>
  </svg>`,
  { size: 128 },
);

/** A tertial: deep ultramarine, darker toward the shaft, with a velvety black edge. */
const TERTIAL = svg(
  `<svg viewBox="0 0 32 104">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3b5bc0"/><stop offset="0.5" stop-color="#1d2f78"/><stop offset="1" stop-color="#3b5bc0"/>
    </linearGradient></defs>
    <path d="${SECONDARY_OUTLINE}" fill="#0d1230"/>
    <path d="${SECONDARY_OUTLINE}" fill="url(#g)" ${shrink(0.92, 16, 104)}/>
    <path d="M16 104 L16 8" stroke="#8aa0e0" stroke-width="0.9" fill="none"/>
  </svg>`,
  { size: 128 },
);

function must(hit: Hit | null, what: string): Hit {
  if (!hit) throw new Error(`no surface hit for ${what}`);
  return hit;
}

export default function build() {
  const b = createBuilder({ name: "goldenPheasant" });

  // ---- Body and neck: one loft over the spine and neck chains --------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.205, -0.05], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.212, -0.03],
      [0, 0.222, 0.03],
      [0, 0.248, 0.08],
    ]),
    { parent: hips, count: 2, names: ["spine", "chest"], role: "spine", group: "body" },
  );
  const stations = [
    { at: [0, 0.246, -0.18], w: 0.05, h: 0.045 },
    { at: [0, 0.232, -0.115], w: 0.105, h: 0.1 },
    { at: [0, 0.215, -0.035], w: 0.128, h: 0.138 },
    { at: [0, 0.226, 0.045], w: 0.118, h: 0.132 },
    { at: [0, 0.262, 0.094], w: 0.078, h: 0.084 },
    { at: [0, 0.308, 0.11], w: 0.05, h: 0.05 },
    { at: [0, 0.348, 0.117], w: 0.04, h: 0.04 },
    { at: [0, 0.376, 0.124], w: 0.035, h: 0.035 },
  ] as const;
  const bodyPath = catmull(stations.map(({ at }) => at));
  const neckStart = bodyPath.closestT(stations[4].at);
  const neck = b.chain("neck", bodyPath.slice(neckStart, 1), {
    parent: spine.joints[1],
    count: 3,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "neck",
  });

  // Gold rump behind a green mantle, the orange cape on the neck, rufous throat, scarlet from breast to vent.
  const top = paint((p) =>
    p.y > 0.265 && (p.z > 0.05 || p.y > 0.3) ? CAPE : mix(GOLD, MANTLE, smoothstep(-0.02, 0.01, p.z)),
  );
  const plumage = paint((p, n) => {
    const throat = p.y > 0.29 && n.z > 0.6 && n.y < 0.5;
    if (throat) return THROAT;
    const back = smoothstep(-0.05, 0.25, n.y + (p.y > 0.27 ? 0.4 : 0));
    return mix(resolve(SCARLET, p, n), resolve(top, p, n), back);
  });
  const body = b.loft(stations, {
    bone: [spine, neck],
    color: plumage,
    group: "body",
  });
  const bodySkin = b.surface(body);

  // ---- Head -------------------------------------------------------------------------------------------------
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: neck.at(1),
    dir: [0, -0.1, 1],
    role: "head",
    group: "head",
  });
  // Head local axes: +Y forward, +Z up, +X toward the bird's right.
  const skull = b.part(
    new SphereGeometry(1, b.segments(14), b.segments(10)),
    gradient(THROAT, GOLD, head.local([0, 0, -0.002]), head.local([0, 0, 0.013])),
    { bone: head, frame: head.moved([0, 0.01, 0.004]), scale: [0.017, 0.023, 0.019], group: "head" },
  );
  b.lathe(
    [
      [0, 0],
      [0.0064, 0],
      [0.0064, 0.004],
      [0.0048, 0.011],
      [0.0022, 0.0172],
      [0, 0.0195],
    ],
    {
      at: head.local([0, 0.027, 0.0]),
      axis: head.dir([0, 1, -0.3]),
      bone: head,
      smoothing: 1,
      segments: 12,
      color: BEAK,
      group: "head",
      name: "beakUpper",
    },
  );
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.025, -0.006]),
    dir: head.dir([0, 1, -0.5]),
    role: "jaw",
    group: "head",
  });
  b.lathe(
    [
      [0, 0],
      [0.005, 0],
      [0.005, 0.004],
      [0.0035, 0.011],
      [0, 0.0165],
    ],
    { at: jaw.local([0, 0.002, 0]), axis: jaw.axis, bone: jaw, smoothing: 1, segments: 10, color: BEAK, group: "head", name: "beakLower" },
  );

  const headSkin = b.surface(skull);
  const eyes: Vector3[] = [];
  for (const s of [1, -1]) {
    const eye = must(headSkin.around(skull.at).at(s * 64, 14), "eye");
    const n = eye.n.clone();
    const side = s > 0 ? "L" : "R";
    eyes.push(eye.at.clone());
    b.lathe(
      [
        [0, 0],
        [0.0075, 0],
        [0.0068, 0.0016],
        [0, 0.0022],
      ],
      { at: offset(eye, n, -0.0012), axis: n, bone: head, segments: 14, color: SKIN, group: "head", name: `eyeSkin${side}` },
    );
    b.lathe(
      [
        [0, 0],
        [0.0052, 0],
        [0.0048, 0.0018],
        [0.003, 0.0034],
        [0, 0.0039],
      ],
      { at: eye, axis: n, bone: head, smoothing: 1, segments: 14, color: IRIS, group: "head", name: `eye${side}` },
    );
    b.lathe(
      [
        [0, 0],
        [0.0022, 0],
        [0.0018, 0.0008],
        [0, 0.0011],
      ],
      { at: offset(eye, n, 0.0033), axis: n, bone: head, segments: 10, color: PUPIL, group: "head", name: `pupil${side}` },
    );
  }

  // The crest: silky golden strands rooted over forehead and crown, all combed straight back (each stands on the
  // head's up axis, not the skull normal) so they lie as one sleek cap that runs past the nape onto the cape.
  const headUp = head.dir([0, 0, 1]);
  const headFwd = head.dir([0, 1, 0]);
  const crown = headSkin.scatter(80, {
    rng: rng(11),
    minDist: 0.0026,
    filter: (h) => h.n.dot(headUp) > 0.35 && h.at.clone().sub(skull.at).dot(headFwd) < 0.024,
  });
  const forehead = (h: Hit) => h.at.clone().sub(skull.at).dot(headFwd) > 0.004;
  for (const [group, len, seed] of [
    [crown.filter(forehead), 0.08, 12],
    [crown.filter((h) => !forehead(h)), 0.062, 16],
  ] as const)
    b.cards(
      group.map((h) => frame(h, headUp)),
      CREST,
      {
        size: [0.012, len],
        lean: 83,
        flow: head.dir([0, -1, -0.25]),
        bend: 30,
        vary: 0.18,
        spin: 10,
        rng: rng(seed),
        bone: head,
        group: "head",
        name: "crest",
      },
    );
  // Short rufous feathers over the cheeks and throat, clear of the eyes.
  b.cards(
    headSkin.scatter(60, {
      rng: rng(13),
      minDist: 0.0028,
      filter: (h) =>
        h.n.dot(headUp) < 0.25 &&
        h.at.clone().sub(skull.at).dot(headFwd) < 0.014 &&
        eyes.every((e) => e.distanceTo(h.at) > 0.0085),
    }),
    CONTOUR,
    { size: [0.007, 0.009], lean: 82, flow: [0, -0.5, -1], vary: 0.2, rng: rng(14), color: THROAT, bone: head, group: "head" },
  );

  // ---- Body plumage: every feather a card, tinted or drawn per region ---------------------------------------
  const hits = bodySkin.scatter(520, { rng: rng(3), minDist: 0.0105 });
  const regionOf = (h: Hit) => {
    const p = h.at;
    const foreneck = h.n.z > 0.6 && h.n.y < 0.5;
    if (p.y >= 0.352 && !foreneck) return eyes.every((e) => e.distanceTo(p) > 0.014) ? "nape" : "none";
    if (p.y > 0.265 && (p.z > 0.05 || p.y > 0.3) && !foreneck) return "cape";
    if (p.y > 0.29 && foreneck) return "throat";
    if (h.n.y > 0.2 && p.z > -0.015) return "mantle";
    if (h.n.y > 0.05 && p.z <= -0.015) return "rump";
    return "breast";
  };
  const byRegion = (r: string) => hits.filter((h) => regionOf(h) === r);
  const flow = [0, -0.45, -1] as const;
  b.cards(byRegion("cape"), TIPPET, {
    size: [0.034, 0.044],
    lean: 64,
    flow: [0, -0.8, -0.5],
    bend: 16,
    vary: 0.2,
    spin: 8,
    rng: rng(4),
    group: "neck",
    name: "cape",
  });
  b.cards(byRegion("nape"), TIPPET, {
    size: [0.017, 0.022],
    lean: 74,
    flow: [0, -0.8, -0.5],
    bend: 10,
    vary: 0.15,
    rng: rng(15),
    group: "neck",
    name: "nape",
  });
  // The rufous foreneck gets its own finer, denser scatter.
  b.cards(
    bodySkin.scatter(90, { rng: rng(5), minDist: 0.0055, filter: (h) => regionOf(h) === "throat" }),
    CONTOUR,
    { size: [0.011, 0.014], lean: 78, flow: [0, -1, 0], vary: 0.2, spin: 10, rng: rng(5), color: THROAT, group: "neck" },
  );
  b.cards(byRegion("mantle"), MANTLE_FEATHER, {
    size: [0.022, 0.028],
    lean: 76,
    flow,
    bend: 8,
    vary: 0.15,
    spin: 10,
    rng: rng(6),
    group: "body",
    name: "mantle",
  });
  b.cards(byRegion("rump"), RUMP, {
    size: [0.02, 0.05],
    lean: 80,
    flow: [0, -0.2, -1],
    bend: 12,
    vary: 0.2,
    spin: 10,
    rng: rng(7),
    group: "body",
    name: "rump",
  });
  b.cards(byRegion("breast"), CONTOUR, {
    size: [0.022, 0.028],
    lean: 72,
    flow,
    bend: 10,
    vary: 0.2,
    spin: 12,
    rng: rng(8),
    color: paint((_p, n) => mix(SCARLET, SCARLET_DEEP, smoothstep(0.1, -0.8, n.y) * 0.6)),
    group: "body",
    name: "breast",
  });
  // The long uppertail coverts: gold-to-crimson lances lying along the base of the tail.
  b.cards(
    bodySkin.scatter(40, {
      rng: rng(9),
      minDist: 0.009,
      filter: (h) => h.at.z < -0.1 && h.n.y > -0.25 && h.n.z > -0.55,
    }),
    TAIL_COVERT,
    { size: [0.016, 0.15], lean: 84, flow: [0, -0.12, -1], bend: 8, vary: 0.25, spin: 6, rng: rng(10), group: "body", name: "tailCoverts" },
  );

  // ---- Tail: a roof of rectrices over a five-joint chain -----------------------------------------------------
  const tailPath = catmull([
    [0, 0.244, -0.16],
    [0, 0.24, -0.34],
    [0, 0.218, -0.53],
    [0, 0.178, -0.72],
    [0, 0.14, -0.85],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 5,
    names: (i) => `tail${i + 1}`,
    role: "tail",
    group: "tail",
  });
  const reticulated = patches(TAIL_DARK, TAIL_BUFF, { size: 0.016, gap: 0.32, seed: 4 });
  for (let k = 4; k >= 0; k--) {
    const len = 1 - 0.16 * k;
    const half = 0.019 - 0.0012 * k;
    for (const s of [1, -1]) {
      const pts = Array.from({ length: 7 }, (_, i) => {
        const t = (len * i) / 6;
        return tailPath
          .at(t)
          .add(new Vector3(s * (0.004 + 0.012 * k) * (0.7 + 0.6 * t), -0.009 * k * (0.6 + t) + (s > 0 ? 0.0012 : 0), 0));
      });
      const roof = 16 * k * (Math.PI / 180);
      // Only the joints this feather reaches: a joint past its tip would take the tip with it.
      const reach = tail.joints.filter((j) => j.at.z > pts[6].z + 0.02);
      const feather = b.sweep(catmull(pts), (t) => [Math.max(half * Math.min(1, 0.55 + 2.2 * t) * Math.min(1, (1 - t) * 3.2), 0.002), 0.0014], {
        bone: reach,
        section: "box",
        up: [s * Math.sin(roof), Math.cos(roof), 0],
        caps: "flat",
        color: reticulated,
        group: "tail",
        name: "rectrix",
      });
      b.sweep(feather.line(0, 0.0002).slice(0.02, 0.97), 0.0009, {
        bone: reach,
        sides: 4,
        color: SHAFT,
        group: "tail",
        name: "rachis",
      });
    }
  }

  // ---- Wings: spread, coverts as cards on a thin membrane, flight feathers laid flat -------------------------
  const PRIMARY_L = primary(false);
  const PRIMARY_R = primary(true);
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const g = `wing${side}`;
    const S = new Vector3(s * 0.045, 0.256, 0.035);
    const E = new Vector3(s * 0.112, 0.27, 0.005);
    const W = new Vector3(s * 0.178, 0.276, 0.03);
    const T = new Vector3(s * 0.228, 0.274, 0.02);
    const wing = b.chain(g, [S, E, W, T], {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "wing",
      group: g,
    });
    const [shoulder, elbow, wrist] = wing.joints;
    const wingPaint = gradient(SCAPULAR, COVERT, [s * 0.06, 0.26, 0], [s * 0.2, 0.27, 0]);
    b.sweep(wing, [0.011, 0.009, 0.007, 0.0045], { color: wingPaint, group: g });
    const trail = catmull([
      [s * 0.05, 0.252, -0.02],
      [s * 0.112, 0.266, -0.045],
      [s * 0.178, 0.272, -0.03],
      [s * 0.228, 0.273, -0.003],
    ]);
    const web = b.membrane(wing, trail, { bone: wing, thickness: 0.007, color: wingPaint, group: g });
    // Coverts shingled over the top of the arm: dark red scapulars grading to chestnut.
    b.cards(
      b.surface(web).scatter(90, { rng: rng(20 + s), minDist: 0.007, filter: (h) => h.n.y > 0.4 }),
      COVERT_FEATHER,
      { size: [0.018, 0.026], lean: 78, flow: [0, 0, -1], bend: 8, vary: 0.2, spin: 8, rng: rng(22 + s), color: wingPaint, group: g },
    );

    // One flight feather: a card laid flat from `root`, pointing along `dir`.
    const flight = (root: Vector3, dir: Vector3, len: number, w: number, tex: Texture, bone: Joint) =>
      b.cards([frame(root, [0, 1, 0])], tex, { size: [w, len], lean: 90, flow: dir, bend: 7, sink: 0.05, bone, group: g });

    // Tertials: blue, from the upper arm, reaching back beside the rump.
    for (let i = 0; i < 4; i++) {
      const u = i / 3;
      const root = lerp(S, E, 0.3 + 0.6 * u).add(new Vector3(0, -0.004 - 0.0012 * i, -0.028));
      flight(root, new Vector3(s * (-0.12 + 0.1 * u), -0.08, -1), 0.1 + 0.008 * u, 0.03, TERTIAL, shoulder);
    }
    // Secondaries along the forearm, pointing back.
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      const root = lerp(E, W, u).add(new Vector3(0, -0.006 - 0.0012 * i, -0.03 + 0.012 * u));
      flight(root, new Vector3(s * (0.04 + 0.3 * u), -0.06, -1), 0.11, 0.03, SECONDARY, elbow);
    }
    // Primaries fanning from the hand, outermost lowest.
    for (let i = 0; i < 10; i++) {
      const u = i / 9;
      const root = lerp(W, T, u).add(new Vector3(0, -0.007 - 0.0012 * i, -0.012 + 0.008 * u));
      const a = (32 + 58 * u) * (Math.PI / 180);
      const len = 0.13 + 0.03 * Math.sin(Math.PI * (0.25 + 0.6 * u));
      flight(root, new Vector3(s * Math.sin(a), -0.05, -Math.cos(a)), len, 0.028, s > 0 ? PRIMARY_L : PRIMARY_R, wrist);
    }
  }

  // ---- Legs -------------------------------------------------------------------------------------------------
  const TOE_R = 0.0055;
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const g = `leg${side}`;
    const leg = b.chain(
      g,
      limb(
        [s * 0.038, 0.19, -0.025],
        [s * 0.048, TOE_R + 0.002, 0.035],
        [0.075, 0.085, 0.075, 0.03],
        [
          [0, 0, 1],
          [0, 0, -1],
          [0, 0, 1],
        ],
        { sole: [0, 0, 1] },
      ),
      {
        parent: hips,
        names: ["thigh", "shin", "tarsus", "toe"].map((n) => n + side),
        role: "leg",
        contact: [s * 0.048, 0, 0.03],
        group: g,
      },
    );
    const legTube = b.sweep(leg, [0.026, 0.022, 0.012, 0.0055, 0.005, TOE_R], {
      bands: [
        [0.42, THIGH],
        [1, LEG],
      ],
      group: g,
    });
    // Tawny feathered drumsticks, hanging down over the knee.
    b.cards(
      b.surface(legTube).scatter(40, { rng: rng(30 + s), minDist: 0.006, filter: (h) => h.at.y > 0.1 }),
      CONTOUR,
      { size: [0.013, 0.02], lean: 62, flow: [0, -1, 0.1], bend: 10, vary: 0.2, rng: rng(32 + s), color: THIGH, group: g },
    );
    const [, , tarsus, ball] = leg.joints;
    const b0 = new Vector3(ball.at.x, TOE_R, ball.at.z);
    const toes: [number, number, number][] = [
      [s * 0.02, 0.036, 0.9],
      [0, 0.046, 1],
      [-s * 0.018, 0.034, 0.9],
      [0, 0.018, -1],
    ];
    for (const [dx, l, fwd] of toes) {
      const dir = new Vector3(dx / 0.046, 0, fwd).normalize();
      const tip = b0.clone().addScaledVector(dir, l).setY(0.0045);
      b.capsule(b0, tip, [0.0055, 0.004], { bone: ball, color: LEG, group: g });
      b.spike(tip, dir.clone().add(new Vector3(0, -0.4, 0)), 0.009, 0.0028, { bone: ball, color: CLAW, group: g });
    }
    // The male's spur, low on the back of the tarsus.
    b.spike(lerp(tarsus.at, ball.at, 0.7), [0, -0.2, -1], 0.012, 0.003, { bone: tarsus, color: CLAW, group: g });
  }

  return b.root;
}
