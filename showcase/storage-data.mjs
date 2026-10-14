// The storage study measures representations, not render speed or compressed network transfer.
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

async function fileDetails(path) {
  try {
    const details = await stat(path);
    return details.isFile() ? details : null;
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

/** Current raw sample sources paired with one latest final export each; builder modules are never executed. */
export async function storageStudy(sampleRoot, snapshotRoot) {
  const sources = (await readdir(sampleRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => entry.name.slice(0, -3))
    .sort();
  const rows = [];
  const unmatched = [];
  for (const slug of sources) {
    const source = await stat(join(sampleRoot, `${slug}.ts`));
    let glbArm = "B";
    let glbName = `${slug}-rigged.glb`;
    let glb = await fileDetails(join(snapshotRoot, slug, glbArm, "out", glbName));
    if (!glb) {
      glbArm = "A";
      glbName = `${slug}.glb`;
      glb = await fileDetails(join(snapshotRoot, slug, glbArm, "out", glbName));
    }
    if (!glb) {
      unmatched.push(slug);
      continue;
    }
    rows.push({
      slug,
      sourceBytes: source.size,
      glbBytes: glb.size,
      glbArm,
      glbName,
      sourceModifiedAt: source.mtime.toISOString(),
      glbModifiedAt: glb.mtime.toISOString(),
    });
  }
  return { measuredAt: new Date().toISOString(), sampleCount: sources.length, rows, unmatched };
}
