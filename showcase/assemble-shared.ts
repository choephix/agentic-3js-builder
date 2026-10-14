// Shared by the assemble pages (assemble.ts, assemble-loading.ts): the model list, the build recorder, per-vertex
// growth coordinates and mirrored-pair detection.
import { Object3D, Vector3 } from "three";
import type { BufferGeometry, LineSegments, Mesh, Points } from "three";
import { Builder } from "../src/builder";
import { Ctx } from "../src/context";
import { Surface } from "../src/surface";

// ── The models ────────────────────────────────────────────────────────────────────────────────────────────────────

export type SampleModule = { default: () => Object3D; meta?: { name?: string; builtBy?: string } };

export const modules = import.meta.glob<SampleModule>([
  "../samples/mimicHermitCrab.ts",
  "../samples/scarecrow.ts",
  "../samples/highlandCow.ts",
  "../samples/juniperBonsai.ts",
  "../samples/griffin.ts",
  "../samples/triceratops.ts",
  "../samples/sailfish.ts",
  "../samples/vikingLongship.ts",
  "../samples/treehouseDiorama.ts",
  "../samples/steamLocomotive.ts",
  "../samples/stagBeetle.ts",
  "../samples/mossStoneGolem.ts",
  "../samples/dromedaryCaravan.ts",
  "../samples/koiPondIsland.ts",
  "../samples/hamsterRover.ts",
  "../samples/cloudSheep.ts",
  "../samples/mushroomVillage.ts",
  "../samples/blacksmithForgeSonnet.ts",
  "../samples/orcBerserkerSonnet.ts",
  "../samples/redLionfishSonnet.ts",
  "../samples/clockworkAutomaton.ts",
  "../samples/clockworkCarousel.ts",
  "../samples/wanderingMerchant.ts",
  "../samples/warthogSonnet.ts",
  "../samples/littleLich.ts",
  "../samples/jrpgCockatrice.ts",
  "../samples/jadeSerpent.ts",
  "../samples/tinToyDragon.ts",
  "../samples/dosBasilisk.ts",
  "../samples/pixelMammoth.ts",
  "../samples/ps1CaveSpider.ts",
  "../samples/bunnyBakeryIsland.ts",
  "../samples/porcelainElephant.ts",
  "../samples/stainedGlassMoth.ts",
  "../samples/clockworkOwl.ts",
  "../samples/artDecoFalcon.ts",
  "../samples/neonScorpion.ts",
  "../samples/ps1Raptor.ts",
  "../samples/tinToyCrab.ts",
  "../samples/paperDragonKite.ts",
  "../samples/oreBeetle.ts",
  "../samples/flowerHedgehog.ts",
  "../samples/goldenPheasant.ts",
]);

export const MODELS: Array<[string, string]> = [
  ["Mimic hermit crab", "mimicHermitCrab"],
  ["Scarecrow", "scarecrow"],
  ["Highland cow", "highlandCow"],
  ["Bonsai tree", "juniperBonsai"],
  ["Griffin", "griffin"],
  ["Triceratops", "triceratops"],
  ["Sailfish", "sailfish"],
  ["Viking longship", "vikingLongship"],
  ["Treehouse diorama", "treehouseDiorama"],
  ["Steam locomotive", "steamLocomotive"],
  ["Stag beetle", "stagBeetle"],
  ["Moss stone golem", "mossStoneGolem"],
  ["Camel caravan", "dromedaryCaravan"],
  ["Koi pond island", "koiPondIsland"],
  ["Hamster rover", "hamsterRover"],
  ["Cloud sheep", "cloudSheep"],
  ["Mushroom village", "mushroomVillage"],
  ["Blacksmith's forge", "blacksmithForgeSonnet"],
  ["Orc berserker", "orcBerserkerSonnet"],
  ["Red lionfish", "redLionfishSonnet"],
  ["Clockwork automaton", "clockworkAutomaton"],
  ["Clockwork carousel", "clockworkCarousel"],
  ["Wandering merchant", "wanderingMerchant"],
  ["Warthog", "warthogSonnet"],
  ["Little lich", "littleLich"],
  ["Cockatrice", "jrpgCockatrice"],
  ["Jade feathered serpent", "jadeSerpent"],
  ["Tin toy dragon", "tinToyDragon"],
  ["DOS basilisk", "dosBasilisk"],
  ["Pixel mammoth", "pixelMammoth"],
  ["Cave spider", "ps1CaveSpider"],
  ["Bunny bakery island", "bunnyBakeryIsland"],
  ["Porcelain elephant", "porcelainElephant"],
  ["Stained glass moth", "stainedGlassMoth"],
  ["Clockwork owl", "clockworkOwl"],
  ["Art deco falcon", "artDecoFalcon"],
  ["Neon scorpion", "neonScorpion"],
  ["Raptor", "ps1Raptor"],
  ["Tin toy crab", "tinToyCrab"],
  ["Paper dragon kite", "paperDragonKite"],
  ["Ore beetle", "oreBeetle"],
  ["Flower hedgehog", "flowerHedgehog"],
  ["Golden pheasant", "goldenPheasant"],
];

// ── Page state in the URL ─────────────────────────────────────────────────────────────────────────────────────────

/** The hash is `#<model>&key=value…`: the model first, then every setting that differs from its default. */
export function readHash() {
  const [model = "", ...rest] = location.hash.slice(1).split("&");
  return { model: decodeURIComponent(model), params: new URLSearchParams(rest.join("&")) };
}

export function hashOf(model: string, settings: Record<string, string>, defaults: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(settings)) if (value !== defaults[key]) params.set(key, value);
  const query = params.toString();
  return `#${encodeURIComponent(model)}${query ? `&${query}` : ""}`;
}

// ── Recording one build ───────────────────────────────────────────────────────────────────────────────────────────

/**
 * One builder call (or a run of additions made outside any call), with what it added and when it ran. `site` is the
 * sample's own stack frame that made it; `twin`/`twinOf` link a call to its mirror image on the other side.
 */
export type Call = {
  label: string;
  t0: number;
  t1: number;
  objects: Object3D[];
  joints: Object3D[];
  site: string;
  twin?: Call;
  twinOf?: Call;
};
export type Recording = { root: Object3D; calls: Call[]; bakes: Array<{ t0: number; t1: number }>; total: number };

// Builder methods that only return values.
const QUIET = new Set(["segments", "material", "surface", "region"]);

export function record(build: () => Object3D, slug: string): Recording {
  const calls: Call[] = [];
  const bakes: Recording["bakes"] = [];
  const stack: Call[] = [];
  const start = performance.now();
  const now = () => performance.now() - start;
  // The innermost frame in the sample's own module (dev: samples/<slug>.ts, build: assets/<slug>-<hash>.js).
  const site = () =>
    (new Error().stack ?? "")
      .split("\n")
      .find((line) => line.includes(`/${slug}.ts`) || line.includes(`/${slug}-`))
      ?.trim() ?? "";
  const undo: Array<() => void> = [];
  const patch = (owner: object, name: string, replace: (original: Function) => Function) => {
    const target = owner as Record<string, Function>;
    const original = target[name];
    target[name] = replace(original);
    undo.push(() => (target[name] = original));
  };
  const timed = (label: string) => (original: Function) =>
    function (this: unknown, ...args: unknown[]) {
      const call: Call = { label, t0: now(), t1: 0, objects: [], joints: [], site: site() };
      calls.push(call);
      stack.push(call);
      try {
        return original.apply(this, args);
      } finally {
        call.t1 = now();
        stack.pop();
      }
    };
  for (const name of Object.getOwnPropertyNames(Builder.prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(Builder.prototype, name)!;
    if (name === "constructor" || typeof descriptor.value !== "function" || QUIET.has(name)) continue;
    patch(Builder.prototype, name, timed(name));
  }
  patch(Surface.prototype, "scatter", timed("scatter"));
  patch(
    Ctx.prototype,
    "bake",
    (original) =>
      function (this: { paints: unknown[]; baked: number }) {
        const due = this.paints.length !== this.baked;
        const t0 = now();
        original.call(this);
        if (due) bakes.push({ t0, t1: now() });
      },
  );
  patch(
    Object3D.prototype,
    "add",
    (original) =>
      function (this: Object3D, ...objects: Object3D[]) {
        let call = stack[stack.length - 1];
        if (!call) {
          const last = calls[calls.length - 1];
          if (last?.label === "add" && last.t1 === last.t0) call = last;
          else calls.push((call = { label: "add", t0: now(), t1: now(), objects: [], joints: [], site: site() }));
        }
        for (const object of objects) {
          if (object.userData.joint) call.joints.push(object);
          else if ((object as Mesh).isMesh || (object as LineSegments).isLine || (object as Points).isPoints)
            call.objects.push(object);
        }
        return original.apply(this, objects);
      },
  );
  let root: Object3D;
  // V8 keeps 10 frames by default; nested helpers can push the sample's own frame past that.
  const v8 = Error as ErrorConstructor & { stackTraceLimit?: number };
  const limit = v8.stackTraceLimit;
  v8.stackTraceLimit = 50;
  try {
    root = build();
  } finally {
    v8.stackTraceLimit = limit;
    for (const restore of undo.reverse()) restore();
  }
  const total = now();
  // Only what the finished model still holds.
  const kept = new Set<Object3D>();
  root.traverse((node) => kept.add(node));
  for (const call of calls) {
    call.objects = [...new Set(call.objects)].filter((o) => kept.has(o));
    call.joints = [...new Set(call.joints)].filter((o) => kept.has(o));
  }
  return { root, calls, bakes, total };
}

/**
 * A recording as plain data for a build run in a worker: objects and joints by their index in the tree's pre-order
 * (the order `pack` and `unpack` keep), so it can ride on `root.userData` to the page.
 */
export type RecordingData = {
  calls: Array<Omit<Call, "objects" | "joints" | "twin" | "twinOf"> & { objects: number[]; joints: number[] }>;
  bakes: Recording["bakes"];
  total: number;
};

export function recordingData({ root, calls, bakes, total }: Recording): RecordingData {
  const index = new Map<Object3D, number>();
  root.traverse((node) => index.set(node, index.size));
  return {
    calls: calls.map(({ label, t0, t1, site, objects, joints }) => ({
      label,
      t0,
      t1,
      site,
      objects: objects.map((o) => index.get(o)!),
      joints: joints.map((o) => index.get(o)!),
    })),
    bakes,
    total,
  };
}

export function recordingFrom(root: Object3D, data: RecordingData): Recording {
  const nodes: Object3D[] = [];
  root.traverse((node) => nodes.push(node));
  return {
    root,
    calls: data.calls.map((call) => ({
      ...call,
      objects: call.objects.map((i) => nodes[i]),
      joints: call.joints.map((i) => nodes[i]),
    })),
    bakes: data.bakes,
    total: data.total,
  };
}

// ── Growth coordinates ────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Per vertex, 0..1: where this part's reveal front reaches it. Cards sprout one after another in the order they were
 * placed, each root to tip. Other parts grow along their long axis from the end nearest the bone they hang on, mixed
 * with distance from that bone, so tubes extend and blobs swell outwards.
 */
export function growth(geometry: BufferGeometry, cards: boolean) {
  const position = geometry.getAttribute("position");
  const n = position.count;
  const out = new Float32Array(n);
  const uv = geometry.getAttribute("uv");
  if (cards && uv) {
    for (let i = 0; i < n; i++) out[i] = (i / n) * 0.8 + uv.getY(i) * 0.2;
    return out;
  }
  const c = new Vector3();
  const p = new Vector3();
  for (let i = 0; i < n; i++) c.add(p.fromBufferAttribute(position, i));
  c.divideScalar(Math.max(n, 1));
  let xx = 0,
    xy = 0,
    xz = 0,
    yy = 0,
    yz = 0,
    zz = 0;
  for (let i = 0; i < n; i++) {
    p.fromBufferAttribute(position, i).sub(c);
    xx += p.x * p.x;
    xy += p.x * p.y;
    xz += p.x * p.z;
    yy += p.y * p.y;
    yz += p.y * p.z;
    zz += p.z * p.z;
  }
  const axis = new Vector3(1, 0.7, 0.3).normalize();
  for (let k = 0; k < 12; k++)
    axis
      .set(
        xx * axis.x + xy * axis.y + xz * axis.z,
        xy * axis.x + yy * axis.y + yz * axis.z,
        xz * axis.x + yz * axis.y + zz * axis.z,
      )
      .normalize();
  if (axis.lengthSq() === 0) axis.set(0, 1, 0);
  // Start from the end nearest the mesh origin (its bone).
  if (axis.dot(c) > 0) axis.negate();
  let lo = Infinity,
    hi = -Infinity,
    far = 0;
  const along = new Float32Array(n);
  const radial = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    p.fromBufferAttribute(position, i);
    along[i] = p.clone().sub(c).dot(axis);
    radial[i] = p.length();
    lo = Math.min(lo, along[i]);
    hi = Math.max(hi, along[i]);
    far = Math.max(far, radial[i]);
  }
  let near = Infinity;
  for (let i = 0; i < n; i++) near = Math.min(near, radial[i]);
  for (let i = 0; i < n; i++) {
    const a = hi > lo ? (along[i] - lo) / (hi - lo) : 0;
    const r = far > near ? (radial[i] - near) / (far - near) : 0;
    out[i] = Math.min(1, 0.7 * a + 0.3 * r);
  }
  return out;
}

/**
 * Mirrored pairs: a later call made from the same line of the sample (the body of a `for (const s of [1, -1])` loop,
 * or a helper called once per side) whose parts and joints are the first call's, reflected across x = 0 or z = 0.
 * The second call is moved up to play alongside the first, so both sides build at once. `pieces` holds each part's
 * world bounding-sphere centre and radius.
 */
export function pairMirrors(calls: Call[], pieces: Map<Object3D, { size: number; center: Vector3 }>, extent: number) {
  const tolerance = extent * 0.01;
  const visual = calls.filter((c) => c.site && (c.objects.length || c.joints.length));
  const points = new Map(
    visual.map((call) => [
      call,
      [
        ...call.objects.map((o) => pieces.get(o)?.center ?? new Vector3(NaN, NaN, NaN)),
        ...call.joints.map((j) => new Vector3().setFromMatrixPosition(j.matrixWorld)),
      ],
    ]),
  );
  const reflected = new Vector3();
  for (let i = 0; i < visual.length; i++) {
    const a = visual[i];
    if (a.twin || a.twinOf) continue;
    const pa = points.get(a)!;
    for (let j = i + 1; j < Math.min(visual.length, i + 400); j++) {
      const b = visual[j];
      if (b.twinOf || b.site !== a.site || b.objects.length !== a.objects.length || b.joints.length !== a.joints.length)
        continue;
      const pb = points.get(b)!;
      const sizes = a.objects.every(
        (o, k) => Math.abs((pieces.get(o)?.size ?? 0) - (pieces.get(b.objects[k])?.size ?? 0)) < tolerance,
      );
      const mirrored = (["x", "z"] as const).some(
        (axis) =>
          pa.some((p) => Math.abs(p[axis]) > tolerance) &&
          pa.every(
            (p, k) =>
              reflected
                .copy(p)
                .setComponent(axis === "x" ? 0 : 2, -p[axis])
                .distanceTo(pb[k]) < tolerance,
          ),
      );
      if (sizes && mirrored) {
        a.twin = b;
        b.twinOf = a;
        break;
      }
    }
  }
}
