import { existsSync, mkdirSync, readdirSync, realpathSync, symlinkSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, relative, resolve } from "node:path";
import { capture } from "../scripts/bakeoff.ts";

type Word = { value: string; operator: boolean };
export type Inspection = {
  kind: "inspection" | "scratch" | "typecheck" | "unavailable";
  text: string;
  isError: boolean;
  renderRequested?: boolean;
};

/** Parse only shell words, quoting and command separators; execution never receives unquoted model text. */
function shellWords(command: string): Word[] {
  const out: Word[] = [];
  let value = "",
    quote = "",
    active = false;
  for (let i = 0; i < command.length; i++) {
    const char = command[i];
    if (quote) {
      if (char === quote) {
        quote = "";
        continue;
      }
      if (char === "\\" && quote === '"' && /["\\$`]/.test(command[i + 1] ?? "")) value += command[++i];
      else value += char;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      active = true;
      continue;
    }
    if (char === "\\") {
      value += command[++i] ?? "";
      active = true;
      continue;
    }
    if (/\s/.test(char) || /[;&|<>]/.test(char)) {
      if (active) {
        out.push({ value, operator: false });
        value = "";
        active = false;
      }
      if (/[;&|<>]/.test(char)) {
        const pair = command.slice(i, i + 2);
        if (["&&", "||"].includes(pair)) {
          out.push({ value: pair, operator: true });
          i++;
        } else out.push({ value: char, operator: true });
      } else if (char === "\n") out.push({ value: ";", operator: true });
      continue;
    }
    value += char;
    active = true;
  }
  if (quote) throw Error("Unclosed shell quote");
  if (active) out.push({ value, operator: false });
  return out;
}

/** A per-build view: SDK/docs/scripts plus one virtual sample, never the real sample/build archive. */
export class AppSandbox {
  readonly sample: string;
  readonly logicalSample: string;
  private cwd: string;
  constructor(
    readonly root: string,
    readonly workspace: string,
    slug: string,
  ) {
    this.logicalSample = "samples/" + slug + ".ts";
    this.sample = join(workspace, this.logicalSample);
    this.cwd = workspace;
    mkdirSync(join(workspace, "samples"), { recursive: true });
    for (const name of [
      "src",
      "kits",
      "docs",
      "scripts",
      "GUIDE.md",
      "package.json",
      ...readdirSync(root).filter((name) => /^tsconfig.*\.json$/.test(name)),
    ]) {
      const link = join(workspace, name);
      if (!existsSync(link)) symlinkSync(join(root, name), link);
    }
  }

  path(requested: string, pattern = false, cwd = this.workspace): string {
    if (/[;\r\n\0]/.test(requested) || (!pattern && /,/.test(requested)))
      throw Error("No such file or directory: " + requested);
    const expanded = requested.replace(/^~(?=\/)/, homedir());
    let logical: string;
    if (expanded === this.root || expanded === this.workspace) logical = ".";
    else if (expanded.startsWith(this.workspace + "/")) logical = expanded.slice(this.workspace.length + 1);
    else if (expanded.startsWith(this.root + "/")) logical = expanded.slice(this.root.length + 1);
    else if (expanded.startsWith("/")) throw Error("No such file or directory: " + requested);
    else logical = relative(this.workspace, resolve(cwd, expanded));
    const physical = resolve(this.workspace, logical);
    if (physical !== this.workspace && !physical.startsWith(this.workspace + "/"))
      throw Error("No such file or directory: " + requested);
    logical = relative(this.workspace, physical);
    const top = logical.split("/")[0];
    const rootFile = logical === "GUIDE.md" || logical === "package.json" || /^tsconfig[^/]*\.json$/.test(logical);
    const source = ["src", "kits", "docs", "scripts"].includes(top);
    const sample =
      logical === "samples" ||
      logical === this.logicalSample ||
      (pattern && top === "samples" && /[*?[]/.test(logical));
    const rootPattern = pattern && /[*?[]/.test(top);
    if (logical && !rootFile && !source && !sample && !rootPattern)
      throw Error("No such file or directory: " + requested);
    if (existsSync(physical)) {
      const actual = realpathSync(physical);
      const allowedActual =
        actual === this.workspace ||
        actual === join(this.workspace, "samples") ||
        actual === this.sample ||
        ["src", "kits", "docs", "scripts"].some(
          (dir) => actual === join(this.root, dir) || actual.startsWith(join(this.root, dir) + "/"),
        ) ||
        (rootFile && actual === join(this.root, logical));
      if (!allowedActual) throw Error("No such file or directory: " + requested);
    }
    return physical;
  }

  isSample(requested: string): boolean {
    try {
      return this.path(requested) === this.sample;
    } catch {
      return false;
    }
  }

  async glob(requested: string): Promise<string[]> {
    const found: string[] = [];
    for (const part of requested
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)) {
      const physical = this.path(part, true);
      const pattern = relative(this.workspace, physical) || "*";
      for await (const item of new Bun.Glob(pattern).scan({ cwd: this.workspace, followSymlinks: true })) {
        try {
          this.path(item);
          found.push(item);
        } catch {
          /* Invisible entries never leave the view. */
        }
      }
    }
    return found;
  }

  async inspect(command: string, requestedCwd?: string): Promise<Inspection> {
    try {
      const initialCwd = requestedCwd ? this.path(requestedCwd) : this.cwd;
      if (command.includes("<<"))
        return {
          kind: "unavailable",
          text: "",
          isError: true,
          renderRequested: /\bscratch\/[^\s'"]+\.ts/.test(command),
        };
      const tokens = shellWords(command.replace(/\s+2>\s*\/dev\/null/g, "").replace(/\s+2>&1/g, ""));
      const commands: string[][] = [[]],
        operators: string[] = [];
      for (const token of tokens) {
        if (token.operator) {
          if (![";", "&&", "||", "|"].includes(token.value)) return { kind: "unavailable", text: "", isError: true };
          operators.push(token.value);
          commands.push([]);
        } else commands.at(-1)!.push(token.value);
      }
      const executable = commands.filter((args) => args.length);
      const types = executable.some(
        ([op, ...args]) =>
          (op === "npm" && args[0] === "run" && args[1] === "typecheck") ||
          basename(op) === "tsc" ||
          (["npx", "bunx"].includes(op) && args.find((arg) => !arg.startsWith("-")) === "tsc") ||
          (["bun", "tsx"].includes(basename(op)) && args[0] === "scripts/typecheck.ts") ||
          (op === "npx" && args[0] === "tsx" && args[1] === "scripts/typecheck.ts"),
      );
      const renders = executable.some(
        ([op, ...args]) =>
          (op === "npm" && args[0] === "run" && ["preview", "snap", "sheet"].includes(args[1])) ||
          /(?:preview|snap|sheet|render|browser|probe|puppeteer|playwright)/i.test(op) ||
          args.some((arg) => /(?:^|\/)(?:preview|snap|sheet)\.ts$/.test(arg)),
      );
      const mutates = executable.some(
        ([op, ...args]) => op === "sed" && args.some((arg) => arg === "-i" || arg.startsWith("--in-place")),
      );
      if (mutates) return { kind: "unavailable", text: "", isError: true, renderRequested: renders };
      if (types) return { kind: "typecheck", text: "", isError: false, renderRequested: renders };
      if (renders) return { kind: "unavailable", text: "", isError: true, renderRequested: true };
      let cwd = initialCwd,
        scratchOnly = true;
      const prepared: string[][] = [];
      for (const words of commands) {
        if (!words.length) {
          prepared.push(["true"]);
          continue;
        }
        const [op, ...args] = words;
        if (op === "cd") {
          cwd = this.path(args[0] ?? ".", false, cwd);
          prepared.push(["cd", cwd]);
          continue;
        }
        if (["mkdir", "touch", "rm", "rmdir"].includes(op)) {
          const paths = args.filter((arg) => !arg.startsWith("-"));
          if (!paths.length) throw Error("No such file or directory");
          for (const path of paths) {
            const expanded = path.replace(/^~(?=\/)/, homedir());
            const destination = resolve(cwd, expanded);
            const scratch = join(this.workspace, "scratch");
            if (
              destination !== scratch &&
              !destination.startsWith(scratch + "/") &&
              !(op === "mkdir" && destination === join(this.workspace, "samples"))
            )
              throw Error("No such file or directory: " + path);
          }
          prepared.push(["true"]);
          continue;
        }
        scratchOnly = false;
        const allowed = [
          "pwd",
          "echo",
          "printf",
          "ls",
          "wc",
          "head",
          "tail",
          "cat",
          "grep",
          "rg",
          "cut",
          "sort",
          "uniq",
          "file",
          "readlink",
          "stat",
          "basename",
          "dirname",
          "du",
          "sed",
          "find",
          "which",
          "true",
          "false",
        ];
        if (!allowed.includes(op))
          return {
            kind: "unavailable",
            text: "",
            isError: true,
            renderRequested: /node|bun|tsx|python|probe|check/.test(op + " " + args.join(" ")),
          };
        if (
          (op === "sort" && args.some((arg) => arg === "-o" || arg.startsWith("--output"))) ||
          (op === "file" && args.includes("-C")) ||
          args.some((arg) => /^--(?:pre|output)(?:=|$)/.test(arg)) ||
          (op === "find" && args.some((arg) => /^-(?:exec|execdir|ok|okdir|delete|fprint|fprintf|fls)/.test(arg)))
        )
          return { kind: "unavailable", text: "", isError: true };
        const mapped = [op];
        let patternSeen = false,
          optionValue = "";
        for (let i = 0; i < args.length; i++) {
          const arg = args[i];
          if (optionValue) {
            if (optionValue === "file") mapped.push(this.path(arg, false, cwd));
            else mapped.push(arg);
            if (optionValue === "pattern") patternSeen = true;
            optionValue = "";
            continue;
          }
          if (arg.startsWith("-")) {
            if (["grep", "rg"].includes(op) && /^(?:--file=|-f.).+/.test(arg)) {
              const prefix = arg.startsWith("--file=") ? "--file=" : "-f";
              mapped.push(prefix + this.path(arg.slice(prefix.length), false, cwd));
              patternSeen = true;
              continue;
            }
            if (arg.includes("/")) throw Error("No such file or directory: " + arg);
            mapped.push(arg);
            if (["grep", "rg"].includes(op) && ["-e", "--regexp"].includes(arg)) optionValue = "pattern";
            else if (["grep", "rg"].includes(op) && ["-f", "--file"].includes(arg)) {
              optionValue = "file";
              patternSeen = true;
            } else if (
              (["head", "tail"].includes(op) && ["-n", "-c", "--lines", "--bytes"].includes(arg)) ||
              (op === "cut" && ["-d", "-f", "--delimiter", "--fields"].includes(arg)) ||
              (op === "find" &&
                ["-name", "-iname", "-type", "-maxdepth", "-mindepth", "-size", "-printf"].includes(arg)) ||
              (["grep", "rg"].includes(op) &&
                ["-A", "-B", "-C", "-m", "--include", "--exclude", "--glob", "-g"].includes(arg))
            )
              optionValue = "literal";
            continue;
          }
          if (["echo", "printf", "which", "basename", "dirname", "true", "false"].includes(op)) {
            mapped.push(arg);
            continue;
          }
          if (["grep", "rg", "sed"].includes(op) && !patternSeen) {
            if (op === "sed" && (!args.includes("-n") || !/^\d+(?:,\d+)?p$/.test(arg)))
              return { kind: "unavailable", text: "", isError: true };
            mapped.push(arg);
            patternSeen = true;
            continue;
          }
          const physical = this.path(arg, /[*?[]/.test(arg), cwd);
          if (/[*?[]/.test(arg)) {
            const matches = await this.glob(relative(this.workspace, physical));
            mapped.push(...(matches.length ? matches.map((match) => join(this.workspace, match)) : [physical]));
          } else mapped.push(physical);
        }
        prepared.push(mapped);
      }
      if (scratchOnly) {
        this.cwd = cwd;
        return { kind: "scratch", text: "", isError: false };
      }
      const quoted = prepared.map((args) => args.map((arg) => "'" + arg.replaceAll("'", "'\\''") + "'").join(" "));
      const shell = quoted.map((part, i) => part + (operators[i] ? " " + operators[i] + " " : "")).join("");
      const result = await capture(
        "bash",
        ["-lc", "cd '" + initialCwd.replaceAll("'", "'\\''") + "' && " + shell],
        60000,
      );
      this.cwd = cwd;
      return {
        kind: "inspection",
        text: (result.stdout + result.stderr).replaceAll(this.workspace + "/", ""),
        isError: result.status !== 0,
      };
    } catch (error) {
      return { kind: "inspection", text: error instanceof Error ? error.message : String(error), isError: true };
    }
  }
}
