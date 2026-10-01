// Turns a builder's Object3D tree into ONE mesh with one material, the same
// way Nilo bakes a puppet: every part is baked into model space, and every
// colour and texture lives in one atlas packed like a sprite sheet (harness/atlas.ts):
// flat parts point their UVs at their colour's cell, textured parts keep their
// own UVs mapped into their tile, and transparent texels are cut away. In the
// rigged arms every part is skinned to its bone (or its own per-vertex weights).
// Parts with a standard three.js `emissive` material glow in their own colours: they are grouped at the end of the
// mesh and drawn with a copy of the material that emits the atlas itself at their `emissiveIntensity`.
import {
  Bone,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Skeleton,
  SkinnedMesh,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import type { Texture } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { buildAtlas } from "./atlas";
import type { Placed, TileSource } from "./atlas";

export type Issue = { level: "error" | "warning"; message: string };

export type PartRecord = {
  index: number;
  name: string;
  group: string;
  bone: string | null;
  /** The flat colour, or a textured part's tint. */
  color: string;
  /** Index into Assembly.textures for a textured part, else null. */
  texture: number | null;
  triangles: number;
  /** Surface area in m². */
  area: number;
  /** The geometry's class (SphereGeometry, CylinderGeometry, ...), or BufferGeometry for built meshes. */
  shape: string;
  /** Cut-out textured (cards, drawn planes): its triangle count is the drawing's, not its tessellation. */
  cutout: boolean;
};

export type JointRecord = {
  name: string;
  parent: string | null;
  depth: number;
  position: [number, number, number];
  parts: number;
};

export type Assembly = {
  geometry: BufferGeometry;
  material: MeshStandardMaterial;
  /** One glowing copy of `material` per distinct emissive strength, weakest first; empty when nothing glows. */
  glowMaterials: MeshStandardMaterial[];
  parts: PartRecord[];
  joints: JointRecord[];
  groups: string[];
  colors: string[];
  /** Distinct textures (by name, else uuid); tinted copies share one entry here but get their own tiles. */
  textures: string[];
  /**
   * The atlas: its side in texels, tile count, whether it cuts out, and where each tile sits (texels from the
   * bottom-left, v up): the flat colour block and each texture with its tint.
   */
  atlas: {
    size: number;
    tiles: number;
    alpha: boolean;
    layout: { colors: Placed; textures: Array<Placed & { texture: string; tint: string }> };
  };
  issues: Issue[];
  triangles: number;
  bounds: { min: [number, number, number]; max: [number, number, number] };
  /** Rigged arms only: builds a fresh bone hierarchy in bind pose. */
  createBones: (() => { root: Bone; bones: Bone[] }) | null;
};

export const LIMITS = { colors: 64, parts: 1000, triangles: 120_000, trianglesSoft: 60_000, bones: 160 };
const ZFIGHT_SCALE_EPSILON = 0.003;
const BONE_NAME = /^[A-Za-z][A-Za-z0-9_]*$/;

function isMesh(object: Object3D): object is Mesh {
  return (object as Mesh).isMesh === true;
}

/** The nearest self-or-ancestor value of a userData key. */
function inherited(object: Object3D, read: (candidate: Object3D) => string | undefined) {
  for (let current: Object3D | null = object; current; current = current.parent) {
    const value = read(current);
    if (value) return value;
  }
  return undefined;
}

function visibleInTree(object: Object3D) {
  for (let current: Object3D | null = object; current; current = current.parent) if (!current.visible) return false;
  return true;
}

/** How a part is coloured: its colour alone, or a texture tinted by that colour (and by vertex colours), and its glow. */
type Look = { color: string; texture: Texture | null; vertexColors: boolean; doubleSided: boolean; glow: number };

function lookOf(mesh: Mesh, issues: Issue[], label: string): Look {
  const material = mesh.material;
  const broken: Look = { color: "#ff00ff", texture: null, vertexColors: false, doubleSided: false, glow: 0 };
  if (Array.isArray(material)) {
    issues.push({
      level: "error",
      message: `${label}: multi-material meshes are not supported; use one material per part`,
    });
    return broken;
  }
  const standard = material as MeshStandardMaterial;
  if (!standard.color) {
    issues.push({ level: "error", message: `${label}: material has no color` });
    return broken;
  }
  // A part glows in its own colours (its flat colour, or its texture tinted by that colour) at emissiveIntensity.
  const glow = standard.emissive?.getHex() ? Math.max(0, standard.emissiveIntensity ?? 1) : 0;
  if (glow && standard.emissive.getHex() !== standard.color.getHex() && standard.emissiveMap !== standard.map)
    issues.push({
      level: "warning",
      message: `${label}: glows in its own colours; a different emissive colour or map is not exported`,
    });
  if (standard.transparent && standard.opacity < 1)
    issues.push({
      level: "warning",
      message: `${label}: opacity is ignored; only a texture's transparent texels show through (they are cut away)`,
    });
  let texture = standard.map ?? null;
  if (texture && !mesh.geometry.getAttribute("uv")) {
    issues.push({ level: "error", message: `${label}: has a texture but its geometry has no uv attribute` });
    texture = null;
  }
  if (
    texture &&
    (texture.repeat.x !== 1 || texture.repeat.y !== 1 || texture.offset.x || texture.offset.y || texture.rotation)
  )
    issues.push({
      level: "warning",
      message: `${label}: texture repeat, offset and rotation are ignored; the UVs are used as they are`,
    });
  return {
    color: `#${standard.color.getHexString()}`,
    texture,
    vertexColors: Boolean(standard.vertexColors && mesh.geometry.getAttribute("color")),
    doubleSided: standard.side === DoubleSide,
    glow,
  };
}

/**
 * Clean, indexed copy baked into model space: position and normal, plus uv for a textured part and colour for a
 * vertex-coloured one. A double-sided material becomes a back copy with flipped normals and reversed winding.
 */
function bakePart(source: BufferGeometry, matrix: Matrix4, grow: number, look: Look) {
  const geometry = new BufferGeometry();
  const position = source.getAttribute("position");
  geometry.setAttribute("position", position.clone());
  if (source.getAttribute("normal")) geometry.setAttribute("normal", source.getAttribute("normal").clone());
  if (look.texture) geometry.setAttribute("uv", source.getAttribute("uv").clone());
  if (look.vertexColors) {
    const color = source.getAttribute("color");
    const rgb = new Float32Array(color.count * 3);
    for (let i = 0; i < color.count; i++) for (let k = 0; k < 3; k++) rgb[i * 3 + k] = color.getComponent(i, k);
    geometry.setAttribute("color", new Float32BufferAttribute(rgb, 3));
  }
  if (source.index) geometry.setIndex(source.index.clone());
  else geometry.setIndex(Array.from({ length: position.count }, (_, i) => i));
  if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
  geometry.scale(grow, grow, grow);
  geometry.applyMatrix4(matrix);
  if (matrix.determinant() < 0) reverseWinding(geometry);
  if (!look.doubleSided) return geometry;
  const back = geometry.clone();
  back.getAttribute("normal").applyMatrix4(new Matrix4().makeScale(-1, -1, -1));
  reverseWinding(back);
  const both = mergeGeometries([geometry, back], false)!;
  geometry.dispose();
  back.dispose();
  return both;
}

function reverseWinding(geometry: BufferGeometry) {
  const index = geometry.index!;
  for (let i = 0; i < index.count; i += 3) {
    const b = index.getX(i + 1);
    index.setX(i + 1, index.getX(i + 2));
    index.setX(i + 2, b);
  }
}

/** How reports name a texture: its name and a short id (two textures may share a name), else its uuid. */
function textureName(texture: Texture) {
  return texture.name ? `${texture.name}:${texture.uuid.slice(0, 8)}` : texture.uuid;
}

/** Every edge shared by an even number of triangles, with vertices welded by position: a mesh with no border. */
function isClosed(positions: ArrayLike<number>, index: { count: number; getX(i: number): number }) {
  const ids = new Map<string, number>();
  const weld = (v: number) => {
    // Rounded integers, so -0.000001 and 0.000001 (a sphere's pole) weld; toFixed would keep the minus sign.
    const key = `${Math.round(positions[v * 3] * 1e5)},${Math.round(positions[v * 3 + 1] * 1e5)},${Math.round(positions[v * 3 + 2] * 1e5)}`;
    let id = ids.get(key);
    if (id === undefined) ids.set(key, (id = ids.size));
    return id;
  };
  const edges = new Map<string, number>();
  for (let i = 0; i < index.count; i += 3)
    for (let k = 0; k < 3; k++) {
      const a = weld(index.getX(i + k));
      const b = weld(index.getX(i + ((k + 1) % 3)));
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  for (const uses of edges.values()) if (uses % 2) return false;
  return true;
}

export async function assemble(root: Object3D, rigged: boolean): Promise<Assembly> {
  const issues: Issue[] = [];
  root.updateMatrixWorld(true);

  const meshes: Mesh[] = [];
  const jointObjects: Object3D[] = [];
  let ignored = 0;
  root.traverse((object) => {
    if (typeof object.userData.joint === "string") jointObjects.push(object);
    if (!visibleInTree(object)) return;
    if (isMesh(object)) meshes.push(object);
    else if (
      (object as { isLine?: boolean; isPoints?: boolean; isSprite?: boolean }).isLine ||
      (object as { isPoints?: boolean }).isPoints ||
      (object as { isSprite?: boolean }).isSprite
    )
      ignored++;
  });
  if (ignored)
    issues.push({ level: "warning", message: `${ignored} line/point/sprite objects ignored; only meshes are baked` });
  if (!meshes.length) issues.push({ level: "error", message: "No visible meshes in the returned object" });
  if (meshes.length > LIMITS.parts)
    issues.push({ level: "error", message: `${meshes.length} parts exceeds the ${LIMITS.parts} limit` });

  // Skeleton.
  const jointNames = new Set<string>();
  const jointRecords: JointRecord[] = [];
  const jointWorld = new Map<string, Matrix4>();
  if (rigged) {
    const scale = new Vector3();
    const position = new Vector3();
    const quaternion = new Quaternion();
    for (const object of jointObjects) {
      const name = object.userData.joint as string;
      if (!BONE_NAME.test(name))
        issues.push({ level: "error", message: `Joint "${name}": names must match ${BONE_NAME}` });
      if (jointNames.has(name)) issues.push({ level: "error", message: `Joint "${name}" is declared twice` });
      jointNames.add(name);
      object.matrixWorld.decompose(position, quaternion, scale);
      if (Math.abs(scale.x - 1) > 1e-3 || Math.abs(scale.y - 1) > 1e-3 || Math.abs(scale.z - 1) > 1e-3)
        issues.push({
          level: "error",
          message: `Joint "${name}" has world scale ${scale
            .toArray()
            .map((v) => v.toFixed(3))
            .join(",")}; joints (and their ancestors) must be unscaled. Scale meshes instead.`,
        });
      jointWorld.set(name, new Matrix4().compose(position, quaternion, new Vector3(1, 1, 1)));
      const parentObject = object.parent
        ? inherited(object.parent, (candidate) => candidate.userData.joint as string | undefined)
        : undefined;
      const parent = parentObject ?? null;
      const depth = parent ? (jointRecords.find((joint) => joint.name === parent)?.depth ?? 0) + 1 : 0;
      jointRecords.push({
        name,
        parent,
        depth,
        position: position.toArray().map((v) => Number(v.toFixed(4))) as [number, number, number],
        parts: 0,
      });
    }
    const roots = jointRecords.filter((joint) => joint.parent === null);
    if (roots.length > 1)
      issues.push({
        level: "error",
        message: `Exactly one root joint allowed; found ${roots.map((joint) => joint.name).join(", ")}`,
      });
    if (jointRecords.length > LIMITS.bones)
      issues.push({ level: "error", message: `${jointRecords.length} joints exceeds the ${LIMITS.bones} limit` });
  } else if (jointObjects.length) {
    issues.push({ level: "warning", message: `${jointObjects.length} joints ignored: arm A exports a bare mesh` });
  }

  // Parts.
  const parts: PartRecord[] = [];
  const looks: Look[] = [];
  const labels: string[] = [];
  const colorList: string[] = [];
  const colorSeen = new Set<string>();
  const textureNames: string[] = [];
  const tileSources = new Map<string, TileSource>();
  const baked: BufferGeometry[] = [];
  let triangles = 0;
  meshes.forEach((mesh, index) => {
    const bone = rigged
      ? (inherited(
          mesh,
          (candidate) =>
            (candidate.userData.bone as string | undefined) ?? (candidate.userData.joint as string | undefined),
        ) ?? null)
      : null;
    const group = inherited(mesh, (candidate) => candidate.userData.group as string | undefined) ?? bone ?? "body";
    const label = `part ${index}${mesh.name ? ` "${mesh.name}"` : ""} (${bone ? `bone ${bone}, ` : ""}group ${group})`;
    const look = lookOf(mesh, issues, label);
    looks.push(look);
    labels.push(label);
    const color = look.color;
    let texture: number | null = null;
    if (look.texture) {
      const name = textureName(look.texture);
      texture = textureNames.indexOf(name);
      if (texture < 0) texture = textureNames.push(name) - 1;
      const key = `${look.texture.uuid}|${color}`;
      if (!tileSources.has(key)) tileSources.set(key, { key, texture: look.texture, tint: color });
    } else if (!colorSeen.has(color)) {
      colorSeen.add(color);
      colorList.push(color);
    }
    if (rigged && !bone)
      issues.push({ level: "error", message: `${label} has no bone: place it under a joint or set userData.bone` });
    if (rigged && bone && !jointNames.has(bone))
      issues.push({ level: "error", message: `${label} references unknown bone "${bone}"` });
    const grow = 1 + (meshes.length > 1 ? (index / (meshes.length - 1)) * ZFIGHT_SCALE_EPSILON : 0);
    const geometry = bakePart(mesh.geometry, mesh.matrixWorld, grow, look);
    const positions = geometry.getAttribute("position").array;
    for (let i = 0; i < positions.length; i++) {
      if (!Number.isFinite(positions[i])) {
        issues.push({ level: "error", message: `${label} has non-finite vertex positions` });
        break;
      }
    }
    // Signed volume against the part's own centre: clearly negative means the
    // faces point inward (for example a Lathe profile in the wrong order).
    const faces = geometry.index!;
    const centre = new Vector3();
    geometry.computeBoundingBox();
    geometry.boundingBox!.getCenter(centre);
    let signed = 0;
    let absolute = 0;
    let area = 0;
    const a = new Vector3();
    const b = new Vector3();
    const c = new Vector3();
    for (let i = 0; i < faces.count; i += 3) {
      a.fromArray(positions, faces.getX(i) * 3).sub(centre);
      b.fromArray(positions, faces.getX(i + 1) * 3).sub(centre);
      c.fromArray(positions, faces.getX(i + 2) * 3).sub(centre);
      area += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2;
      const volume = a.dot(b.cross(c));
      signed += volume;
      absolute += Math.abs(volume);
    }
    // Only a closed, non-flat part has an inside: a disc or card has no volume, and an open strip (a colour sector
    // of a tube) has no meaningful centre to face away from, so their signs are noise.
    const extent = geometry.boundingBox!.getSize(new Vector3()).toArray();
    const flat = Math.min(...extent) < 1e-3 * Math.max(...extent);
    if (!flat && absolute > 1e-9 && signed < -0.5 * absolute && isClosed(positions, faces))
      issues.push({
        level: "warning",
        message: `${label} looks inside-out: its faces point inward, so the outside is culled. Reverse the profile/vertex order or flip the winding.`,
      });
    const count = geometry.index!.count / 3;
    triangles += count;
    const cutout = ((mesh.material as MeshStandardMaterial).alphaTest ?? 0) > 0;
    parts.push({
      index,
      name: mesh.name || `part${index}`,
      group,
      bone,
      color,
      texture,
      triangles: count,
      area,
      cutout,
      shape: mesh.geometry.type,
    });
    baked.push(geometry);
  });
  if (colorList.length > LIMITS.colors)
    issues.push({ level: "error", message: `${colorList.length} distinct colors exceeds the ${LIMITS.colors} limit` });
  if (triangles > LIMITS.triangles)
    issues.push({ level: "error", message: `${triangles} triangles exceeds the ${LIMITS.triangles} limit` });
  else if (triangles > LIMITS.trianglesSoft)
    issues.push({
      level: "warning",
      message: `${triangles} triangles is above the ${LIMITS.trianglesSoft} soft budget`,
    });

  const atlas = await buildAtlas(colorList.length ? colorList : ["#888888"], [...tileSources.values()]);
  const anyVertexColors = looks.some((look) => look.vertexColors);
  const boneIndex = new Map(jointRecords.map((joint, index) => [joint.name, index]));
  // Sphere poles overshoot 0..1 by half a segment; only real repeats are worth a warning.
  const WRAP_SLACK = 0.07;
  const wrapped = new Set<string>();
  baked.forEach((geometry, index) => {
    const count = geometry.getAttribute("position").count;
    const look = looks[index];
    const part = new Float32Array(count).fill(index);
    const uv = new Float32Array(count * 2);
    if (look.texture) {
      const tile = atlas.tiles.get(`${look.texture.uuid}|${look.color}`)!;
      const own = geometry.getAttribute("uv");
      for (let i = 0; i < count; i++) {
        const u = own.getX(i);
        const v = own.getY(i);
        if (u < -WRAP_SLACK || u > 1 + WRAP_SLACK || v < -WRAP_SLACK || v > 1 + WRAP_SLACK) wrapped.add(labels[index]);
        uv[i * 2] = (tile.x + Math.min(Math.max(u, 0), 1) * tile.w) / atlas.size;
        uv[i * 2 + 1] = (tile.y + Math.min(Math.max(v, 0), 1) * tile.h) / atlas.size;
      }
    } else {
      const center = atlas.colorUv.get(look.color) ?? [0.5, 0.5];
      for (let i = 0; i < count; i++) uv.set(center, i * 2);
    }
    geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    if (anyVertexColors && !look.vertexColors)
      geometry.setAttribute("color", new Float32BufferAttribute(new Float32Array(count * 3).fill(1), 3));
    geometry.setAttribute("_part", new Float32BufferAttribute(part, 1));
    if (rigged) {
      const skinIndex = new Uint16Array(count * 4);
      const skinWeight = new Float32Array(count * 4);
      const bone = boneIndex.get(parts[index].bone ?? "") ?? 0;
      // A part may carry its own weights over several bones: skinIndex/skinWeight attributes whose indices point
      // into userData.skinBones (bone names). Otherwise every vertex is fully on the part's bone.
      const names = meshes[index].userData.skinBones as string[] | undefined;
      const ownIndex = names ? meshes[index].geometry.getAttribute("skinIndex") : undefined;
      const ownWeight = names ? meshes[index].geometry.getAttribute("skinWeight") : undefined;
      // A double-sided part's back copy repeats the source vertices.
      const sourceCount = meshes[index].geometry.getAttribute("position").count;
      for (let i = 0; i < count; i++) {
        if (names && ownIndex && ownWeight)
          for (let k = 0; k < 4; k++) {
            skinIndex[i * 4 + k] = boneIndex.get(names[ownIndex.getComponent(i % sourceCount, k)]) ?? bone;
            skinWeight[i * 4 + k] = ownWeight.getComponent(i % sourceCount, k);
          }
        else {
          skinIndex[i * 4] = bone;
          skinWeight[i * 4] = 1;
        }
      }
      geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndex, 4));
      geometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeight, 4));
    }
  });
  for (const part of parts) {
    const joint = jointRecords.find((entry) => entry.name === part.bone);
    if (joint) joint.parts++;
  }

  // Glowing parts go last, one run per strength, each run a geometry group drawn with its own glowing material.
  const strengths = [...new Set(looks.map((look) => look.glow).filter((glow) => glow > 0))].sort((a, b) => a - b);
  const order = baked.map((_, index) => index);
  if (strengths.length) order.sort((a, b) => looks[a].glow - looks[b].glow);
  const geometry = baked.length
    ? mergeGeometries(
        order.map((index) => baked[index]),
        false,
      )
    : new BufferGeometry();
  if (!geometry) throw new Error("Failed to merge part geometries");
  if (strengths.length) {
    let start = 0;
    for (const glow of [0, ...strengths]) {
      const count = order
        .filter((index) => looks[index].glow === glow)
        .reduce((sum, index) => sum + baked[index].index!.count, 0);
      if (count) geometry.addGroup(start, count, glow ? strengths.indexOf(glow) + 1 : 0);
      start += count;
    }
  }
  baked.forEach((entry) => entry.dispose());
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  // Feet may sink up to 2% of the model's height (planted, and the ground hides it); a gap under them shows at once.
  const sinkAllowance = 0.02 * (box.max.y - box.min.y);
  if (baked.length && box.min.y > 0.005)
    issues.push({
      level: "warning",
      message: `Lowest point is ${(box.min.y * 1000).toFixed(0)} mm above y = 0: the model floats above the floor`,
    });
  if (baked.length && box.min.y < -sinkAllowance)
    issues.push({
      level: "warning",
      message: `Lowest point is ${(-box.min.y * 1000).toFixed(0)} mm below y = 0, deeper than 2% of the model's height (${(sinkAllowance * 1000).toFixed(0)} mm)`,
    });

  if (wrapped.size)
    issues.push({
      level: "warning",
      message: `${[...wrapped].slice(0, 3).join("; ")}${wrapped.size > 3 ? ` and ${wrapped.size - 3} more` : ""}: texture coordinates outside 0..1 are clamped; atlas tiles do not repeat`,
    });
  const material = new MeshStandardMaterial({
    map: atlas.texture,
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.04,
    alphaTest: atlas.alpha ? 0.5 : 0,
    vertexColors: anyVertexColors,
  });
  // White emission through the atlas itself, so every glowing texel emits its own colour.
  const glowMaterials = strengths.map((glow) => {
    const copy = material.clone();
    copy.emissive.set(0xffffff);
    copy.emissiveMap = atlas.texture;
    copy.emissiveIntensity = glow;
    return copy;
  });

  const createBones =
    rigged && !issues.some((issue) => issue.level === "error")
      ? () => {
          const bones = jointRecords.map((joint) => {
            const bone = new Bone();
            bone.name = joint.name;
            return bone;
          });
          const inverse = new Matrix4();
          const local = new Matrix4();
          jointRecords.forEach((joint, index) => {
            const bone = bones[index];
            local.copy(jointWorld.get(joint.name)!);
            if (joint.parent) {
              inverse.copy(jointWorld.get(joint.parent)!).invert();
              local.premultiply(inverse);
              bones[boneIndex.get(joint.parent)!].add(bone);
            }
            local.decompose(bone.position, bone.quaternion, bone.scale);
          });
          return { root: bones[0], bones };
        }
      : null;

  const groups = [...new Set(parts.map((part) => part.group))];
  return {
    geometry,
    material,
    glowMaterials,
    parts,
    joints: jointRecords,
    groups,
    colors: colorList,
    textures: textureNames,
    atlas: {
      size: atlas.size,
      tiles: atlas.packed,
      alpha: atlas.alpha,
      layout: {
        colors: atlas.block,
        textures: [...tileSources.values()].map((source) => ({
          texture: textureName(source.texture),
          tint: source.tint,
          ...atlas.tiles.get(source.key)!,
        })),
      },
    },
    issues,
    triangles,
    bounds: {
      min: box.min.toArray().map((v) => Number(v.toFixed(4))) as [number, number, number],
      max: box.max.toArray().map((v) => Number(v.toFixed(4))) as [number, number, number],
    },
    createBones,
  };
}

/** The mesh's material: the atlas material alone, or it and its glowing copies, one per geometry group. */
export function surfaceOf(assembly: Assembly) {
  return assembly.glowMaterials.length ? [assembly.material, ...assembly.glowMaterials] : assembly.material;
}

/** A static mesh (arm A, and the skeleton-stripped download of B and C). */
export function createStaticMesh(assembly: Assembly, name: string) {
  const geometry = assembly.geometry.clone();
  geometry.deleteAttribute("skinIndex");
  geometry.deleteAttribute("skinWeight");
  const mesh = new Mesh(geometry, surfaceOf(assembly));
  mesh.name = name;
  return mesh;
}

/** A rigid-skinned mesh bound to a fresh bone hierarchy in bind pose. */
export function createSkinnedMesh(assembly: Assembly, name: string) {
  if (!assembly.createBones) throw new Error("Assembly has no valid skeleton");
  const { root, bones } = assembly.createBones();
  const mesh = new SkinnedMesh(assembly.geometry, surfaceOf(assembly));
  mesh.name = name;
  mesh.frustumCulled = false;
  mesh.add(root);
  mesh.updateMatrixWorld(true);
  mesh.bind(new Skeleton(bones));
  return { mesh, bones };
}
