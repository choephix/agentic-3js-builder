// Optional: building off the page's main thread. A module Web Worker calls `serveBuilds` with a loader for the
// app's build functions; the page makes a pool of such workers with `createBuildPool` and asks it for models by
// name. Builds run in the workers unchanged (the build code needs no async), cross as `pack`ed data, and the pool
// unpacks them on the page. `svg()` drawings are decoded on the page and drawn, read back and dilated by an idle
// worker. A build that throws rejects with its error; one that runs past `timeout` has its worker stopped and
// replaced. The app owns how workers are made (`spawn`), since that depends on its bundler.
import type { Object3D } from "three";
import { svgPixels } from "./texture";
import { pack, unpack } from "./transfer";
import type { Packed } from "./transfer";

type Request =
  | { kind: "build"; id: number; name: string }
  | { kind: "svg"; id: number; bitmap: ImageBitmap; width: number; height: number };
type Failure = { name: string; message: string; stack: string };
type Reply =
  | { id: number; ok: true; kind: "build"; packed: Packed; ms: { build: number; pack: number } }
  | { id: number; ok: true; kind: "svg"; data: Uint8Array }
  | { id: number; ok: false; error: Failure };

/**
 * Run inside a module Web Worker: answer the pool's requests. `load(name)` returns the build function for `name`
 * (for example a sample module's default export, or the default export of model-written code imported from a blob
 * URL); it may be async.
 */
export function serveBuilds(load: (name: string) => (() => Object3D) | Promise<() => Object3D>) {
  const post = (reply: Reply, transfer: Transferable[] = []) => self.postMessage(reply, { transfer });
  self.onmessage = async ({ data: request }: MessageEvent<Request>) => {
    try {
      if (request.kind === "svg") {
        const data = svgPixels(request.bitmap, request.width, request.height);
        request.bitmap.close();
        post({ id: request.id, ok: true, kind: "svg", data }, [data.buffer]);
        return;
      }
      const build = await load(request.name);
      const t0 = performance.now();
      const root = build();
      const t1 = performance.now();
      const { packed, transfer } = pack(root);
      post(
        { id: request.id, ok: true, kind: "build", packed, ms: { build: t1 - t0, pack: performance.now() - t1 } },
        transfer,
      );
    } catch (caught) {
      const error =
        caught instanceof Error
          ? { name: caught.name, message: caught.message, stack: caught.stack ?? "" }
          : { name: "Error", message: String(caught), stack: "" };
      post({ id: request.id, ok: false, error });
    }
  };
}

/** A model from the pool: the tree, a promise for its drawings, what didn't cross, and where the time went. */
export type Built = {
  root: Object3D;
  /** Resolves once every `svg()` texture is drawn. */
  ready: Promise<void>;
  /** See `Packed.losses`; empty for SDK-built models. */
  losses: Record<string, number>;
  /** Milliseconds: the build and the packing in the worker, and the unpacking on the page. */
  ms: { build: number; pack: number; unpack: number };
};

export type BuildPool = {
  /** Build `name` in the next free worker. Rejects with the build's error, or when it runs past `timeout`. */
  build(name: string): Promise<Built>;
  /** Stop every worker; pending builds reject. */
  close(): void;
};

type Job = {
  request: Request;
  transfer: Transferable[];
  resolve: (reply: Reply) => void;
  reject: (error: Error) => void;
};

/**
 * A pool of build workers made by `spawn` (e.g. `() => new Worker(new URL("./build.worker.ts", import.meta.url),
 * { type: "module" })`, the worker calling `serveBuilds`). `size` defaults to 4, at most one less than the cores;
 * `timeout` (ms, default 30 000) bounds one build.
 */
export function createBuildPool(options: { spawn: () => Worker; size?: number; timeout?: number }): BuildPool {
  const cores = typeof navigator === "undefined" ? 2 : navigator.hardwareConcurrency || 2;
  const size = options.size ?? Math.max(1, Math.min(4, cores - 1));
  const timeout = options.timeout ?? 30_000;
  const idle: Worker[] = [];
  const busy = new Map<Worker, Job>();
  const queue: Job[] = [];
  let next = 0;
  let closed = false;

  const pump = () => {
    while (queue.length && !closed) {
      let worker = idle.pop();
      if (!worker && busy.size + idle.length < size) worker = options.spawn();
      if (!worker) return;
      const job = queue.shift()!;
      run(worker, job);
    }
  };

  const run = (worker: Worker, job: Job) => {
    busy.set(worker, job);
    const done = () => {
      clearTimeout(timer);
      busy.delete(worker);
    };
    const timer =
      job.request.kind === "build"
        ? setTimeout(
            (name: string) => {
              done();
              worker.terminate();
              job.reject(new Error(`build("${name}") ran past ${timeout} ms; its worker was stopped`));
              pump();
            },
            timeout,
            job.request.name,
          )
        : undefined;
    worker.onmessage = ({ data }: MessageEvent<Reply>) => {
      done();
      idle.push(worker);
      job.resolve(data);
      pump();
    };
    worker.onerror = (event) => {
      event.preventDefault();
      done();
      worker.terminate();
      job.reject(new Error(`build worker failed: ${event.message}`));
      pump();
    };
    worker.postMessage(job.request, { transfer: job.transfer });
  };

  const send = (request: Request, transfer: Transferable[], first: boolean) =>
    new Promise<Reply>((resolve, reject) => {
      if (closed) return reject(new Error("the build pool is closed"));
      const job = { request, transfer, resolve, reject };
      if (first) queue.unshift(job);
      else queue.push(job);
      pump();
    });

  const failure = (error: Failure) => Object.assign(new Error(error.message), { name: error.name, stack: error.stack });

  // Drawings jump the queue: a model waits on them, and they take milliseconds.
  const offload = (bitmap: ImageBitmap, width: number, height: number) =>
    send({ kind: "svg", id: ++next, bitmap, width, height }, [bitmap], true).then((reply) => {
      if (!reply.ok) throw failure(reply.error);
      if (reply.kind !== "svg") throw new Error("build pool: unexpected reply");
      return reply.data;
    });

  return {
    async build(name) {
      const reply = await send({ kind: "build", id: ++next, name }, [], false);
      if (!reply.ok) throw failure(reply.error);
      if (reply.kind !== "build") throw new Error("build pool: unexpected reply");
      const t0 = performance.now();
      const { root, ready, losses } = unpack(reply.packed, { offload });
      return { root, ready, losses, ms: { ...reply.ms, unpack: performance.now() - t0 } };
    },
    close() {
      closed = true;
      for (const worker of [...idle, ...busy.keys()]) worker.terminate();
      for (const job of [...busy.values(), ...queue]) job.reject(new Error("the build pool is closed"));
      idle.length = 0;
      busy.clear();
      queue.length = 0;
    },
  };
}
