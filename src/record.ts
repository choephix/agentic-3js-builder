// Optional: a build's construction trace, for apps that animate a model coming together. `record(build)` runs a
// build function unchanged and logs every builder call it makes: which parts and joints it added, which existing
// joints it moved (a `pose()`), the line of code that made it, and when it ran. Nothing in the SDK changes while no
// recording runs, and model-written code never sees this module (it is not part of `src/index.ts`).
import { Object3D, Quaternion, Vector3 } from "three";
import type { LineSegments, Mesh, Points } from "three";
import { Builder } from "./builder";
import { Ctx } from "./context";
import { Surface } from "./surface";

/** A joint's local placement before or after a move. */
export type Placement = { position: Vector3; quaternion: Quaternion };

/**
 * One builder call (or a run of additions made outside any call): what it added, which joints that already existed
 * it moved, and when it ran (ms from the start of the build). `site` is the stack frame that called the builder: the
 * same string for every call made from one line of code. `twin` / `twinOf` link a call to its mirror image on the
 * other side (`pairMirrors`).
 */
export type Call = {
  label: string;
  t0: number;
  t1: number;
  objects: Object3D[];
  joints: Object3D[];
  moves: Array<{ joint: Object3D; from: Placement; to: Placement }>;
  site: string;
  twin?: Call;
  twinOf?: Call;
};

/** A recorded build: the finished model, its calls in order, when the paint sheet was baked, and the total time. */
export type Recording = { root: Object3D; calls: Call[]; bakes: Array<{ t0: number; t1: number }>; total: number };

// Builder methods that only return values.
const QUIET: Record<string, true> = { segments: true, material: true, surface: true, region: true };

/** The frame that called the recorder's wrapper (frames 0 and 1 are `caller` and the wrapper). */
function caller() {
  const frames = (new Error().stack ?? "").split("\n").filter((line) => /:\d+:\d+\)?\s*$/.test(line));
  return frames[2]?.trim() ?? "";
}

/**
 * Run `build` and record it. Builder methods, `Surface.scatter`, the paint bake and `Object3D.add` are wrapped for
 * the length of the build only; the model is the one `build` returns.
 */
export function record(build: () => Object3D): Recording {
  const calls: Call[] = [];
  const bakes: Recording["bakes"] = [];
  const stack: Call[] = [];
  const start = performance.now();
  const now = () => performance.now() - start;
  const undo: Array<() => void> = [];
  const patch = (owner: object, name: string, replace: (original: Function) => Function) => {
    const target = owner as Record<string, Function>;
    const original = target[name];
    target[name] = replace(original);
    undo.push(() => (target[name] = original));
  };
  const timed = (label: string) => (original: Function) =>
    function (this: unknown, ...args: unknown[]) {
      const call: Call = { label, t0: now(), t1: 0, objects: [], joints: [], moves: [], site: caller() };
      calls.push(call);
      // Joints the outermost call moved: compare every existing joint's placement before and after.
      const joints = !stack.length && this instanceof Builder ? [...this.ctx.joints.values()].map((j) => j.object) : [];
      const before = joints.map((joint) => ({
        position: joint.position.clone(),
        quaternion: joint.quaternion.clone(),
      }));
      stack.push(call);
      try {
        return original.apply(this, args);
      } finally {
        call.t1 = now();
        stack.pop();
        joints.forEach((joint, i) => {
          const from = before[i];
          if (from.position.equals(joint.position) && from.quaternion.equals(joint.quaternion)) return;
          call.moves.push({
            joint,
            from,
            to: { position: joint.position.clone(), quaternion: joint.quaternion.clone() },
          });
        });
      }
    };
  for (const name of Object.getOwnPropertyNames(Builder.prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(Builder.prototype, name)!;
    if (name === "constructor" || typeof descriptor.value !== "function" || QUIET[name]) continue;
    patch(Builder.prototype, name, timed(name));
  }
  patch(Surface.prototype, "scatter", timed("scatter"));
  // A bake only paints when meshes were painted since the last one (see `Ctx.bake`).
  const painted = new WeakMap<Ctx, number>();
  patch(
    Ctx.prototype,
    "bake",
    (original) =>
      function (this: Ctx) {
        const due = this.paints.length !== (painted.get(this) ?? 0);
        painted.set(this, this.paints.length);
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
          else
            calls.push(
              (call = { label: "add", t0: now(), t1: now(), objects: [], joints: [], moves: [], site: caller() }),
            );
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
  try {
    root = build();
  } finally {
    for (const restore of undo.reverse()) restore();
  }
  const total = now();
  // Only what the finished model still holds.
  const kept = new Set<Object3D>();
  root.traverse((node) => kept.add(node));
  for (const call of calls) {
    call.objects = [...new Set(call.objects)].filter((o) => kept.has(o));
    call.joints = [...new Set(call.joints)].filter((o) => kept.has(o));
    call.moves = call.moves.filter((move) => kept.has(move.joint));
  }
  return { root, calls, bakes, total };
}

/**
 * A recording as plain data, for a build recorded in a worker: objects and joints by their index in the tree's
 * pre-order (the order `pack` and `unpack` keep), so it can ride on `root.userData` to the page.
 */
export type RecordingData = {
  calls: Array<
    Pick<Call, "label" | "t0" | "t1" | "site"> & {
      objects: number[];
      joints: number[];
      moves: Array<{ joint: number; from: number[]; to: number[] }>;
    }
  >;
  bakes: Recording["bakes"];
  total: number;
};

export function recordingData({ root, calls, bakes, total }: Recording): RecordingData {
  const index = new Map<Object3D, number>();
  root.traverse((node) => index.set(node, index.size));
  const flat = ({ position, quaternion }: Placement) => [...position.toArray(), ...quaternion.toArray()];
  return {
    calls: calls.map(({ label, t0, t1, site, objects, joints, moves }) => ({
      label,
      t0,
      t1,
      site,
      objects: objects.map((o) => index.get(o)!),
      joints: joints.map((o) => index.get(o)!),
      moves: moves.map((m) => ({ joint: index.get(m.joint)!, from: flat(m.from), to: flat(m.to) })),
    })),
    bakes,
    total,
  };
}

/** `recordingData` back into calls on the unpacked tree. */
export function recordingFrom(root: Object3D, data: RecordingData): Recording {
  const nodes: Object3D[] = [];
  root.traverse((node) => nodes.push(node));
  const placement = (flat: number[]): Placement => ({
    position: new Vector3().fromArray(flat),
    quaternion: new Quaternion().fromArray(flat, 3),
  });
  return {
    root,
    calls: data.calls.map((call) => ({
      ...call,
      objects: call.objects.map((i) => nodes[i]),
      joints: call.joints.map((i) => nodes[i]),
      moves: call.moves.map((m) => ({ joint: nodes[m.joint], from: placement(m.from), to: placement(m.to) })),
    })),
    bakes: data.bakes,
    total: data.total,
  };
}

/**
 * Link mirrored calls: a later call made from the same line of code (the body of a `for (const s of [1, -1])` loop,
 * or a helper called once per side) whose parts and joints are an earlier call's reflected across x = 0 or z = 0 of
 * the model, within 1% of its size. Sets `twin` on the first and `twinOf` on the second, so a playback can build
 * both sides at once. Measures the model as it stands (the finished pose).
 */
export function pairMirrors(recording: Recording) {
  const { root, calls } = recording;
  root.updateMatrixWorld(true);
  const toModel = root.matrixWorld.clone().invert();
  const low = new Vector3(Infinity, Infinity, Infinity);
  const high = new Vector3(-Infinity, -Infinity, -Infinity);
  const pieces = new Map<Object3D, { size: number; center: Vector3 }>();
  for (const call of calls)
    for (const object of call.objects) {
      const geometry = (object as Mesh).geometry;
      if (!geometry) continue;
      if (!geometry.boundingSphere) geometry.computeBoundingSphere();
      const world = toModel.clone().multiply(object.matrixWorld);
      const center = geometry.boundingSphere!.center.clone().applyMatrix4(world);
      const size = geometry.boundingSphere!.radius * world.getMaxScaleOnAxis();
      pieces.set(object, { size, center });
      low.min(center.clone().subScalar(size));
      high.max(center.clone().addScalar(size));
    }
  const span = high.sub(low);
  const tolerance = Math.max(span.x, span.y, span.z, 0) * 0.01;
  const visual = calls.filter((c) => c.site && (c.objects.length || c.joints.length));
  const points = new Map(
    visual.map((call) => [
      call,
      [
        ...call.objects.map((o) => pieces.get(o)?.center ?? new Vector3(NaN, NaN, NaN)),
        ...call.joints.map((j) => new Vector3().setFromMatrixPosition(toModel.clone().multiply(j.matrixWorld))),
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
