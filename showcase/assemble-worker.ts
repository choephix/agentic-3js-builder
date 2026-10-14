// The loading page's build worker: records a sample's build (src/record.ts) and returns the model with its
// recording as plain data on `userData.assembly`, which the page turns back into calls on the unpacked tree.
import { record, recordingData } from "../src/record";
import { serveBuilds } from "../src/worker";
import { modules } from "./assemble-shared";

serveBuilds(async (slug) => {
  const module = await modules[`../samples/${slug}.ts`]!();
  return () => {
    const recording = record(module.default);
    recording.root.userData.assembly = recordingData(recording);
    return recording.root;
  };
});
