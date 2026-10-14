// A built model as plain data, so a build can run in a Web Worker and its result cross to the page. `pack` turns the
// Object3D tree into structured-clone-safe data plus the buffers to transfer (geometry and texture pixels move, they
// are not copied); `unpack` rebuilds the tree on the other side and draws its `svg()` textures, which a worker
// leaves blank. Shared geometries, materials and textures stay shared. What can't cross (functions, promises, class
// instances in `userData`, object and material types it doesn't know) is dropped or flattened and counted in
// `losses`.
import {
  Bone,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  Object3D,
  Texture,
} from "three";
import type { Material } from "three";
import { drawSvg } from "./texture";
import type { SvgOffload } from "./texture";

type Attribute = {
  array: BufferAttribute["array"];
  itemSize: number;
  normalized: boolean;
  usage: BufferAttribute["usage"];
};
type Value =
  | { t: "plain"; v: string | number | boolean | null }
  | { t: "vector"; v: number[] }
  | { t: "texture"; v: number }
  | { t: "json"; v: unknown };
type Props = Record<string, Value>;
type Node = {
  type: string;
  parent: number;
  name: string;
  position: number[];
  quaternion: number[];
  scale: number[];
  props: Props;
  userData: unknown;
  geometry?: number;
  material?: number | number[];
};

/** A model as plain data. Its typed arrays are the buffers listed for transfer. */
export type Packed = {
  nodes: Node[];
  geometries: Array<{
    attributes: Record<string, Attribute>;
    index: Attribute | null;
    props: Props;
    userData: unknown;
  }>;
  materials: Array<{ type: string; props: Props; userData: unknown }>;
  textures: Array<{ data: Uint8Array; width: number; height: number; props: Props; userData: unknown }>;
  /** What didn't cross, with how often: "Mesh.userData.update: function (dropped)". Empty for SDK-built models. */
  losses: Record<string, number>;
};

const MATERIALS: Record<string, new () => Material> = {
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshToonMaterial,
};
const OBJECTS: Record<string, new () => Object3D> = { Object3D, Group, Mesh, Bone };
// Carried by hand, derived from what is carried, or links between objects.
const HANDLED = new Set([
  "uuid",
  "id",
  "parent",
  "children",
  "matrix",
  "matrixWorld",
  "modelViewMatrix",
  "normalMatrix",
  "matrixWorldNeedsUpdate",
  "userData",
  "geometry",
  "material",
  "version",
  "_listeners",
  "source",
  "image",
  "mipmaps",
  "attributes",
  "index",
  "morphAttributes",
  "boundingBox",
  "boundingSphere",
]);
// Objects carry these as their own fields.
const NODE_HANDLED = new Set([...HANDLED, "type", "name", "position", "rotation", "quaternion", "scale", "layers"]);

const isPlainObject = (v: object) => {
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

/** The model as plain data, and the buffers to list as `postMessage(packed, { transfer })`. */
export function pack(root: Object3D): { packed: Packed; transfer: ArrayBuffer[] } {
  const losses: Record<string, number> = {};
  const lose = (what: string) => (losses[what] = (losses[what] ?? 0) + 1);
  const buffers = new Set<ArrayBuffer>();
  const geometries = new Map<BufferGeometry, number>();
  const materials = new Map<Material, number>();
  const textures = new Map<Texture, number>();
  const packed: Packed = { nodes: [], geometries: [], materials: [], textures: [], losses };

  const buffer = (view: ArrayBufferView, where: string) => {
    if (view.buffer instanceof ArrayBuffer) buffers.add(view.buffer);
    else lose(`${where}: SharedArrayBuffer (copied)`);
  };

  const attribute = (a: unknown, where: string): Attribute | null => {
    if (!(a instanceof BufferAttribute)) {
      lose(`${where}: ${String(a?.constructor.name)} (dropped)`);
      return null;
    }
    buffer(a.array, where);
    return { array: a.array, itemSize: a.itemSize, normalized: a.normalized, usage: a.usage };
  };

  // Vectors, colours, eulers and matrices as their arrays.
  const arrayOf = (x: unknown): number[] | null =>
    x && typeof x === "object" && "toArray" in x && typeof x.toArray === "function"
      ? Reflect.apply(x.toArray, x, [])
      : null;

  // Own properties that differ from a fresh instance's, as data.
  const props = (source: object, fresh: object, where: string, skip = HANDLED): Props => {
    const out: Props = {};
    for (const key of Object.keys(source)) {
      if (skip.has(key)) continue;
      const v: unknown = Reflect.get(source, key);
      const d: unknown = Reflect.get(fresh, key);
      if (v === d) continue;
      if (v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        out[key] = { t: "plain", v };
        continue;
      }
      if (typeof v === "function") {
        lose(`${where}.${key}: function (dropped)`);
        continue;
      }
      if (typeof v !== "object") continue;
      if (v instanceof Texture) {
        const index = texture(v);
        if (index >= 0) out[key] = { t: "texture", v: index };
        continue;
      }
      const array = arrayOf(v);
      if (array) {
        if (JSON.stringify(array) !== JSON.stringify(arrayOf(d))) out[key] = { t: "vector", v: array };
        continue;
      }
      if (JSON.stringify(v) === JSON.stringify(d)) continue;
      if (!isPlainObject(v) && !Array.isArray(v)) {
        lose(`${where}.${key}: ${v.constructor.name} (dropped)`);
        continue;
      }
      try {
        out[key] = { t: "json", v: structuredClone(v) };
      } catch {
        lose(`${where}.${key}: not cloneable (dropped)`);
      }
    }
    return out;
  };

  // `userData` as structured-clone-safe data.
  const plain = (v: unknown, where: string, seen = new Set<unknown>()): unknown => {
    if (typeof v === "function") {
      lose(`${where}: function (dropped)`);
      return undefined;
    }
    if (v === null || typeof v !== "object") return v;
    if (seen.has(v)) {
      lose(`${where}: repeated reference (dropped)`);
      return undefined;
    }
    seen.add(v);
    if (v instanceof Promise) {
      // `svg()` textures carry `userData.ready`; unpacking makes a new one.
      if (!where.startsWith("texture")) lose(`${where}: Promise (dropped)`);
      return undefined;
    }
    if (ArrayBuffer.isView(v)) return v;
    if (Array.isArray(v)) return v.map((x) => plain(x, `${where}[]`, seen));
    if (!isPlainObject(v)) lose(`${where}: ${v.constructor.name} (arrives as a plain object)`);
    const out: Record<string, unknown> = {};
    for (const [key, x] of Object.entries(v)) {
      const p = plain(x, `${where}.${key}`, seen);
      if (p !== undefined) out[key] = p;
    }
    return out;
  };

  function texture(t: Texture): number {
    const known = textures.get(t);
    if (known !== undefined) return known;
    if (!(t instanceof DataTexture) || !(t.image.data instanceof Uint8Array)) {
      lose(`texture ${t.constructor.name} (dropped; DataTexture with bytes only)`);
      return -1;
    }
    const data = t.image.data;
    buffer(data, "texture");
    const index = packed.textures.length;
    textures.set(t, index);
    const entry: Packed["textures"][number] = {
      data,
      width: t.image.width,
      height: t.image.height,
      props: {},
      userData: null,
    };
    packed.textures.push(entry);
    entry.props = props(t, new DataTexture(), "texture");
    entry.userData = plain(t.userData, "texture.userData");
    return index;
  }

  const material = (m: Material) => {
    const known = materials.get(m);
    if (known !== undefined) return known;
    const Fresh = MATERIALS[m.type];
    if (!Fresh) lose(`material ${m.type} (arrives as MeshStandardMaterial)`);
    const index = packed.materials.length;
    materials.set(m, index);
    const entry: Packed["materials"][number] = {
      type: Fresh ? m.type : "MeshStandardMaterial",
      props: {},
      userData: null,
    };
    packed.materials.push(entry);
    entry.props = props(m, new (Fresh ?? MeshStandardMaterial)(), "material");
    entry.userData = plain(m.userData, "material.userData");
    return index;
  };

  const geometry = (g: BufferGeometry) => {
    const known = geometries.get(g);
    if (known !== undefined) return known;
    if (Object.keys(g.morphAttributes).length) lose("geometry.morphAttributes (dropped)");
    const attributes: Record<string, Attribute> = {};
    for (const [name, a] of Object.entries(g.attributes)) {
      const p = attribute(a, `geometry.attributes.${name}`);
      if (p) attributes[name] = p;
    }
    const index = packed.geometries.length;
    geometries.set(g, index);
    packed.geometries.push({
      attributes,
      index: g.index ? attribute(g.index, "geometry.index") : null,
      // `type`, `parameters` and `_transformed` keep a CircleGeometry describing itself as one.
      props: props(g, new BufferGeometry(), "geometry"),
      userData: plain(g.userData, "geometry.userData"),
    });
    return index;
  };

  const visit = (object: Object3D, parent: number) => {
    const Fresh = OBJECTS[object.type];
    if (!Fresh) lose(`object ${object.type} (arrives as Object3D)`);
    const index = packed.nodes.length;
    const node: Node = {
      type: Fresh ? object.type : "Object3D",
      parent,
      name: object.name,
      position: object.position.toArray(),
      quaternion: object.quaternion.toArray(),
      scale: object.scale.toArray(),
      props: props(object, new (Fresh ?? Object3D)(), object.type, NODE_HANDLED),
      userData: plain(object.userData, `${object.type}.userData`),
    };
    node.props.layers = { t: "plain", v: object.layers.mask };
    if (object instanceof Mesh) {
      node.geometry = geometry(object.geometry);
      node.material = Array.isArray(object.material) ? object.material.map(material) : material(object.material);
    }
    packed.nodes.push(node);
    for (const child of object.children) visit(child, index);
  };
  visit(root, -1);
  return { packed, transfer: [...buffers] };
}

/**
 * Rebuild a packed model. Its `svg()` textures arrive blank and are drawn here, which needs a page; `ready` resolves
 * once they are (as `userData.ready` on each does). With `offload`, the page only decodes the drawings (see
 * `drawSvg`). Markup the browser can't parse throws here, where a main-thread build would have thrown at `svg()`.
 */
export function unpack(packed: Packed, options: { offload?: SvgOffload } = {}) {
  const attribute = (a: Attribute) => {
    const out = new BufferAttribute(a.array, a.itemSize, a.normalized);
    out.usage = a.usage;
    return out;
  };
  const assign = (target: object, props: Props, textures: readonly Texture[]) => {
    for (const [key, p] of Object.entries(props)) {
      if (p.t === "plain") Reflect.set(target, key, p.v);
      else if (p.t === "texture") Reflect.set(target, key, textures[p.v]);
      else if (p.t === "json") Reflect.set(target, key, structuredClone(p.v));
      else {
        const current: unknown = Reflect.get(target, key);
        if (current && typeof current === "object" && "fromArray" in current && typeof current.fromArray === "function")
          current.fromArray(p.v);
      }
    }
  };
  const record = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? { ...v } : {});

  const pending: Promise<void>[] = [];
  const textures = packed.textures.map((p) => {
    const texture = new DataTexture(p.data, p.width, p.height);
    assign(texture, p.props, []);
    texture.userData = record(p.userData);
    texture.needsUpdate = true;
    if (typeof texture.userData.svg === "string" && typeof document !== "undefined") {
      const ready = drawSvg(texture, options.offload);
      texture.userData.ready = ready;
      pending.push(ready);
    }
    return texture;
  });
  const materials = packed.materials.map((p) => {
    const m = new (MATERIALS[p.type] ?? MeshStandardMaterial)();
    assign(m, p.props, textures);
    m.userData = record(p.userData);
    m.needsUpdate = true;
    return m;
  });
  const geometries = packed.geometries.map((p) => {
    const g = new BufferGeometry();
    for (const [name, a] of Object.entries(p.attributes)) g.setAttribute(name, attribute(a));
    if (p.index) g.setIndex(attribute(p.index));
    assign(g, p.props, []);
    g.userData = record(p.userData);
    return g;
  });
  const objects: Object3D[] = [];
  for (const n of packed.nodes) {
    const object = new (OBJECTS[n.type] ?? Object3D)();
    object.name = n.name;
    object.position.fromArray(n.position);
    object.quaternion.fromArray(n.quaternion);
    object.scale.fromArray(n.scale);
    const { layers, ...rest } = n.props;
    assign(object, rest, []);
    if (layers?.t === "plain" && typeof layers.v === "number") object.layers.mask = layers.v;
    object.userData = record(n.userData);
    if (object instanceof Mesh && n.geometry !== undefined && n.material !== undefined) {
      object.geometry = geometries[n.geometry];
      object.material = Array.isArray(n.material) ? n.material.map((i) => materials[i]) : materials[n.material];
    }
    if (!object.matrixAutoUpdate) object.updateMatrix();
    objects.push(object);
    if (n.parent >= 0) objects[n.parent].add(object);
  }
  return { root: objects[0], ready: Promise.all(pending).then(() => undefined), losses: packed.losses };
}
