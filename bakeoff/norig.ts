import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";

const rigWords =
  /\b(?:skeleton\w*|rig(?:ged|ging)?|joints?|chains?|bones?|poses?|skinning|JointRef|ChainPoint|PoseRotation|ChainOptions|JointOptions|SproutOptions|sprout)\b/i;
const option =
  /\b(?:bone|parent|role|contact|skin|split|overlap)\??\s*:\s*(?:[A-Za-z_$][\w.$]*|"[^"]*"|'[^']*')\s*,?\s*/g;
const removed: Record<string, string[]> = {};
let declarations: string | undefined;

function sourceDeclarations(root: string) {
  if (declarations) return declarations;
  declarations = join(homedir(), "tmp-archive/gap3-static-declarations");
  const generated = spawnSync(
    join(root, "node_modules/.bin/tsc"),
    [
      "--ignoreConfig",
      "--declaration",
      "--emitDeclarationOnly",
      "--outDir",
      declarations,
      "--rootDir",
      root,
      "--target",
      "es2022",
      "--module",
      "esnext",
      "--moduleResolution",
      "bundler",
      "--skipLibCheck",
      "--noEmitOnError",
      "false",
      ...["src/index.ts", "kits/pixel.ts", "kits/toon.ts", "kits/glow.ts", "kits/clockwork.ts"],
    ],
    { cwd: root, encoding: "utf8", maxBuffer: 1024 * 1024 },
  );
  if (!existsSync(join(declarations, "src/builder.d.ts")))
    throw Error("Could not emit static SDK declarations: " + generated.stdout + generated.stderr);
  return declarations;
}

/** Request-only views; never modifies the actual SDK or its authoritative docs. */
export function staticView(root: string, path: string, original: string) {
  const cuts: string[] = [];
  let text = original;
  if (path.endsWith(".ts")) {
    const declaration = join(sourceDeclarations(root), path.replace(/\.ts$/, ".d.ts"));
    text = existsSync(declaration) ? readFileSync(declaration, "utf8") : original;
    // Implementation bodies contain internal ownership machinery, not authoring guidance.
    cuts.push("SDK implementation replaced by compiler-emitted public declarations");
    text = text
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")
      .replace(/\b(?:Fill|Ctx|Tags|Weights),?\s*JointRef\b/g, "Fill")
      .replace(/\s*\|\s*Chain\b/g, "");
  }
  // Preserve non-rig direction from mixed paragraphs instead of deleting whole categories or budgets.
  text = text
    .replace(/Creatures get a skeleton; props and scenery can be plain objects\.\s*/g, "")
    .replace(/the full skeleton or structure/g, "the full structure")
    .replace(/ Full skeleton per GUIDE\.md\./g, "")
    .replace(/full skeleton per GUIDE\.md\./g, "complete static model.")
    .replace(/Give the moving parts their own joints with `role: "hinge"` \([^)]+\)\. /g, "")
    .replace(/; joints only for parts that move \([^)]+\)/g, "")
    .replace(/; joints for moving parts if any/g, "")
    .replace(/, joints only where something moves/g, "")
    .replace(/, \d+ joints/g, "")
    .replace(/, joint count/g, "")
    .replace(/, or a `Chain`/g, "")
    .replace(/`b\.chain\(name, path\)`, /g, "")
    .replace(
      /`b\.part\(geometry, color, \{ at, bone, frame, aim, dir, up \}\)`/g,
      "`b.part(geometry, color, { at, frame, aim, dir, up })`",
    )
    .replace(/, `limb\(root, target\)`/g, "")
    .replace(/, `b\.sprout\(name, on, \.\.\.\)`/g, "")
    .replace(/,? `sprout`/g, "");
  text = text.replace(/ and in both flex shots/g, "");
  text = text.replace(
    /^#{1,6} (Skeleton|Rig answer key|Posing after building|Inverse kinematics|IK|Sprout)[^\n]*\n[\s\S]*?(?=^## |$(?![\s\S]))/gm,
    (block) => {
      cuts.push(block.split("\n")[0]);
      return "";
    },
  );
  text = text.replace(/```[^\n]*\n[\s\S]*?```/g, (block) => {
    const cleaned = block.replace(option, "");
    if (!rigWords.test(cleaned)) return cleaned;
    cuts.push("rig-bearing fenced example: " + block.split("\n").slice(1, 3).join(" ").slice(0, 180));
    return "";
  });
  text = text
    .split("\n")
    .flatMap((line) => {
      const clean = line.replace(option, "");
      if (
        rigWords.test(clean) ||
        /--bones|\b(?:role|contact)\??\s*[:?]|`skin`|skin weights|["'](?:rig|skeleton)["']/.test(clean)
      ) {
        cuts.push(line.trim());
        return [];
      }
      return [clean];
    })
    .join("\n");
  removed[path] = cuts;
  const output = join(root, "bakeoff/norig-inputs", path.replace(/\.ts$/, ".d.ts"));
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, text);
  writeFileSync(join(root, "bakeoff/norig-inputs/removed.json"), JSON.stringify(removed, null, 2) + "\n");
  return text;
}

type StaticInput = {
  context: {
    systemPrompt: string[];
    messages: Array<{
      role: string;
      toolCallId?: string;
      content: Array<{ type: string; text?: string; id?: string; name?: string; arguments?: { path: string } }>;
    }>;
  };
};

export function staticContext(root: string, input: StaticInput) {
  const paths = new Map<string, string>();
  for (const message of input.context.messages)
    for (const block of message.content)
      if (block.type === "toolCall" && block.name === "read" && block.id && block.arguments)
        paths.set(block.id, block.arguments.path);
  input.context.systemPrompt = input.context.systemPrompt.map((value: string, i: number) =>
    staticView(root, "system-" + i + ".txt", value),
  );
  for (const message of input.context.messages) {
    if (message.role === "assistant") continue;
    const path = paths.get(message.toolCallId ?? "") ?? "assignment.txt";
    for (const block of message.content)
      if (block.type === "text" && block.text !== undefined) block.text = staticView(root, path, block.text);
  }
  input.context.messages.at(-1)!.content[0].text +=
    "\nThis is a static asset; build every part in model space with no joints.";
  return input;
}
