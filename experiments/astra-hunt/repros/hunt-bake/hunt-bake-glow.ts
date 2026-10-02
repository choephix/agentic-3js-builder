import build from "../../../../samples/blacksmithForgeOx";
import { assemble, surfaceOf } from "../../../../harness/assemble";

const built = build();
const assembly = await assemble(built, true);
console.log(JSON.stringify({ issues: assembly.issues, glowMaterials: assembly.glowMaterials.length, strengths: assembly.glowMaterials.map((m) => m.emissiveIntensity), groups: assembly.geometry.groups, materials: surfaceOf(assembly).length, parts: assembly.parts.length }));
