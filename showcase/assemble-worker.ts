// The build worker for the loading page's World: records a sample's build (assemble-shared.ts) and returns the model
// with its recording as plain data on `userData.assembly`, which the page turns back into calls on the unpacked tree.
import { serveBuilds } from "../src/worker";
import { modules, record, recordingData } from "./assemble-shared";

serveBuilds(async (slug) => {
  const module = await modules[`../samples/${slug}.ts`]!();
  return () => {
    const recording = record(module.default, slug);
    recording.root.userData.assembly = recordingData(recording);
    return recording.root;
  };
});
