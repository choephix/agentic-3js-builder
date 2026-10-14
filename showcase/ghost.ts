// The ghost arrival's materials, for the sample viewer: every part first shows as a sparse stipple in one flat
// colour, then grows solid out of its bone. A fragment is solid when its growth coordinate (the `aGrow` attribute,
// from assemble-shared's `growth()`) is behind the part's front `k` (0–1), and ghost beyond it. The same as
// `/assemble-loading`'s ghost style.
import { Color, DoubleSide, FrontSide, MeshDepthMaterial } from "three";
import type { Material } from "three";

const GHOST = { value: new Color("#5d7a9c") };

/** Beyond the front: three fragments in ten, the rest discarded; behind it, a pale rim near the front. */
const STIPPLE = /* glsl */ `
float ghostEdge = 0.0;
bool ghostly = false;
if (uK < 1.0) {
  float front = uK * 1.05;
  if (vGrow > front) {
    if (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) > 0.3) discard;
    ghostly = true;
  } else ghostEdge = 1.0 - smoothstep(0.0, 0.08, front - vGrow);
}
`;

/** Shadows come from the solid part only. */
const SOLID_ONLY = /* glsl */ `
if (uK < 1.0 && vGrow > uK * 1.05) discard;
`;

function patch(material: Material, k: { value: number }, start: string, end: string, key: string) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uK = k;
    shader.uniforms.uGhost = GHOST;
    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "attribute float aGrow;\nvarying float vGrow;\nvoid main() {")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGrow = aGrow;");
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "uniform float uK;\nuniform vec3 uGhost;\nvarying float vGrow;\nvoid main() {")
      .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>\n${start}`)
      .replace("#include <dithering_fragment>", `${end}\n#include <dithering_fragment>`);
  };
  material.customProgramCacheKey = () => key;
  return material;
}

/**
 * A ghosting copy of a lit or basic material, drawn two-sided while it grows (an open shell that is drawn front-side
 * only shows its inside dark); null for others, which arrive whole at their start.
 */
export function ghostMaterial(original: Material, k: { value: number }): Material | null {
  const m = original as Material & Record<string, boolean | undefined>;
  if (!(m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial || m.isMeshBasicMaterial))
    return null;
  const material = original.clone();
  const cross = original.side === FrontSide;
  if (cross) material.side = DoubleSide;
  const end = `if (ghostly) gl_FragColor.rgb = uGhost;
else {
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), ghostEdge * 0.35);
  ${cross ? "if (!gl_FrontFacing) gl_FragColor.rgb *= 0.3;" : ""}
}`;
  return patch(material, k, STIPPLE, end, cross ? "ghost-cross" : "ghost");
}

/** The shadow-map material for a ghosting part, so its shadow grows with its solid part. */
export function ghostDepth(k: { value: number }) {
  return patch(new MeshDepthMaterial(), k, SOLID_ONLY, "", "ghost-depth");
}
