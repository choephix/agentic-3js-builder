import { assemble } from "../../../../harness/assemble";
import build from "./hunt-mechanical-diorama";
const root = build();
const result = await assemble(root, false);
console.log(JSON.stringify({
  parts: result.parts.length,
  joints: result.joints.length,
  triangles: result.triangles,
  glowMaterials: result.glowMaterials.map((material) => ({ color: material.emissive.getHexString(), strength: material.emissiveIntensity })),
  issues: result.issues,
  bounds: result.bounds,
  names: result.parts.map((part) => part.name),
}, null, 2));
