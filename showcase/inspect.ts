// What the showcase reads off a built sample, with the creature-lab harness's rules: a mesh's bone is the nearest
// `userData.bone` or `userData.joint` up its parents, its group the nearest `userData.group`, else its bone, else
// "body"; a mesh with `userData.skinBones` and `skinIndex` / `skinWeight` attributes is smooth-skinned.
import { Box3, Vector3 } from "three";
import type { Material, Mesh, MeshStandardMaterial, Object3D, Texture } from "three";
import type { RigBlock } from "../src/rig";

export type Part = {
  index: number;
  name: string;
  mesh: Mesh;
  bone: string | null;
  group: string;
  /** Bone names the skin attributes index; null for a rigid part. */
  skin: string[] | null;
  triangles: number;
  vertices: number;
  color: string | null;
};

export type JointInfo = {
  name: string;
  object: Object3D;
  parent: string | null;
  depth: number;
  children: string[];
  /** Parts whose bone this is. */
  parts: number;
  /** Skinned parts this bone deforms without owning them. */
  skins: number;
};

export type Inspection = {
  parts: Part[];
  joints: JointInfo[];
  groups: Array<{ name: string; parts: number }>;
  colors: string[];
  /** Distinct textures (the paint sheet counts as one). */
  textures: Texture[];
  triangles: number;
  vertices: number;
  bounds: Box3;
  size: Vector3;
  rig: RigBlock | null;
};

const inherited = (object: Object3D | null, read: (object: Object3D) => unknown) => {
  for (let at = object; at; at = at.parent) {
    const value = read(at);
    if (typeof value === "string") return value;
  }
  return null;
};

const visible = (object: Object3D) => {
  for (let at: Object3D | null = object; at; at = at.parent) if (!at.visible) return false;
  return true;
};

export function inspect(root: Object3D): Inspection {
  root.updateMatrixWorld(true);
  const parts: Part[] = [];
  const joints: JointInfo[] = [];
  const colors: string[] = [];
  const textures: Texture[] = [];
  root.traverse((object) => {
    if (typeof object.userData.joint === "string") {
      const parent = inherited(object.parent, (at) => at.userData.joint);
      const depth = parent ? (joints.find((joint) => joint.name === parent)?.depth ?? 0) + 1 : 0;
      joints.push({ name: object.userData.joint, object, parent, depth, children: [], parts: 0, skins: 0 });
    }
    const mesh = object as Mesh;
    if (!mesh.isMesh || !visible(mesh)) return;
    const geometry = mesh.geometry;
    const bone = inherited(mesh, (at) => at.userData.bone ?? at.userData.joint);
    const names = mesh.userData.skinBones;
    const skinned = Array.isArray(names) && geometry.getAttribute("skinIndex") && geometry.getAttribute("skinWeight");
    const material = ([] as Material[]).concat(mesh.material)[0] as MeshStandardMaterial | undefined;
    const color = material?.color ? `#${material.color.getHexString()}` : null;
    if (material?.map) {
      if (!textures.includes(material.map)) textures.push(material.map);
    } else if (color && !colors.includes(color)) colors.push(color);
    const vertices = geometry.getAttribute("position")?.count ?? 0;
    parts.push({
      index: parts.length,
      name: mesh.name || `part${parts.length}`,
      mesh,
      bone,
      group: inherited(mesh, (at) => at.userData.group) ?? bone ?? "body",
      skin: skinned ? (names as string[]) : null,
      triangles: (geometry.index ? geometry.index.count : vertices) / 3,
      vertices,
      color,
    });
  });
  for (const joint of joints) {
    joints.find((other) => other.name === joint.parent)?.children.push(joint.name);
    joint.parts = parts.filter((part) => part.bone === joint.name).length;
    joint.skins = parts.filter((part) => part.bone !== joint.name && part.skin?.includes(joint.name)).length;
  }
  const groups = new Map<string, number>();
  for (const part of parts) groups.set(part.group, (groups.get(part.group) ?? 0) + 1);
  const bounds = new Box3();
  for (const part of parts) bounds.expandByObject(part.mesh, true);
  const rig = root.userData.rig as RigBlock | undefined;
  return {
    parts,
    joints,
    groups: [...groups].map(([name, count]) => ({ name, parts: count })),
    colors,
    textures,
    triangles: parts.reduce((sum, part) => sum + part.triangles, 0),
    vertices: parts.reduce((sum, part) => sum + part.vertices, 0),
    bounds,
    size: bounds.isEmpty() ? new Vector3() : bounds.getSize(new Vector3()),
    rig: rig && Array.isArray(rig.chains) ? rig : null,
  };
}
