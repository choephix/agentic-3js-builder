// Source listings for the Code panel: TypeScript with light syntax colouring and line numbers, or a line diff
// between two versions with unchanged runs folded away.
import { h } from "./dom";

const KEYWORDS = new Set(
  (
    "as async await break case catch class const continue default do else export extends false finally for from " +
    "function if import in instanceof let new null of return static super switch this throw true try type typeof " +
    "undefined var void while yield"
  ).split(" "),
);
const TOKEN =
  /(\/\/.*)|(\/\*)|("(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?|`(?:\\.|[^`\\])*`?)|(\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b)|([A-Za-z_$][\w$]*)(\s*\()?/g;

/** One line as coloured spans. `state.comment` carries an open block comment to the next line. */
function colour(line: string, state: { comment: boolean }) {
  const out: Array<Node | string> = [];
  let at = 0;
  const span = (kind: string, text: string) => out.push(h("span", { class: `t-${kind}` }, text));
  if (state.comment) {
    const end = line.indexOf("*/");
    if (end < 0) {
      span("comment", line);
      return out;
    }
    span("comment", line.slice(0, end + 2));
    at = end + 2;
    state.comment = false;
  }
  TOKEN.lastIndex = at;
  for (let match = TOKEN.exec(line); match; match = TOKEN.exec(line)) {
    if (match.index > at) out.push(line.slice(at, match.index));
    at = TOKEN.lastIndex;
    const [text, comment, open, string, number, word, call] = match;
    if (comment) span("comment", text);
    else if (open) {
      const end = line.indexOf("*/", match.index + 2);
      state.comment = end < 0;
      span("comment", line.slice(match.index, end < 0 ? undefined : end + 2));
      at = end < 0 ? line.length : end + 2;
      TOKEN.lastIndex = at;
    } else if (string) span("string", text);
    else if (number) span("number", text);
    else if (word && KEYWORDS.has(word)) out.push(h("span", { class: "t-keyword" }, word), call ?? "");
    else if (word && call) out.push(h("span", { class: "t-call" }, word), call);
    else if (word && /^[A-Z]/.test(word)) span("type", text);
    else out.push(text);
  }
  if (at < line.length) out.push(line.slice(at));
  return out;
}

/** The whole file with line numbers; `line` (1-based) is marked and scrolled to once shown. */
export function listing(text: string, line?: number) {
  const state = { comment: false };
  const rows = text
    .replace(/\n$/, "")
    .split("\n")
    .map((content, index) =>
      h(
        "div",
        { class: index + 1 === line ? "row mark" : "row" },
        h("span", { class: "ln" }, index + 1),
        h("span", { class: "code" }, ...colour(content, state)),
      ),
    );
  const element = h("div", { class: "listing" }, ...rows);
  if (line) requestAnimationFrame(() => rows[line - 1]?.scrollIntoView({ block: "center" }));
  return element;
}

type Op = { kind: " " | "+" | "-"; text: string; a: number; b: number };

/** Line diff by longest common subsequence, after trimming the common head and tail. */
export function diff(before: string, after: string) {
  const a = before.replace(/\n$/, "").split("\n");
  const b = after.replace(/\n$/, "").split("\n");
  let head = 0;
  while (head < a.length && head < b.length && a[head] === b[head]) head++;
  let tail = 0;
  while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++;
  const n = a.length - head - tail;
  const m = b.length - head - tail;
  const width = m + 1;
  const table = new Uint32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      table[i * width + j] =
        a[head + i] === b[head + j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
  const ops: Op[] = [];
  for (let k = 0; k < head; k++) ops.push({ kind: " ", text: a[k], a: k + 1, b: k + 1 });
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[head + i] === b[head + j]) {
      ops.push({ kind: " ", text: a[head + i], a: head + i + 1, b: head + j + 1 });
      i++;
      j++;
    } else if (i < n && (j === m || table[(i + 1) * width + j] >= table[i * width + j + 1])) {
      ops.push({ kind: "-", text: a[head + i], a: head + i + 1, b: 0 });
      i++;
    } else {
      ops.push({ kind: "+", text: b[head + j], a: 0, b: head + j + 1 });
      j++;
    }
  }
  for (let k = tail; k > 0; k--)
    ops.push({ kind: " ", text: a[a.length - k], a: a.length - k + 1, b: b.length - k + 1 });
  return ops;
}

const CONTEXT = 3;

/** A diff listing: two line-number gutters, runs of more than 2 × 3 unchanged lines folded into a button. */
export function diffListing(before: string, after: string) {
  const ops = diff(before, after);
  const added = ops.filter((op) => op.kind === "+").length;
  const removed = ops.filter((op) => op.kind === "-").length;
  const row = (op: Op) =>
    h(
      "div",
      { class: `row ${op.kind === "+" ? "add" : op.kind === "-" ? "del" : ""}` },
      h("span", { class: "ln" }, op.a || ""),
      h("span", { class: "ln" }, op.b || ""),
      h("span", { class: "sign" }, op.kind),
      // Each line is coloured on its own: a block comment spanning a fold loses its colour, nothing else.
      h("span", { class: "code" }, ...colour(op.text, { comment: false })),
    );
  const body = h("div", { class: "listing diff" });
  let k = 0;
  while (k < ops.length) {
    if (ops[k].kind !== " ") {
      body.append(row(ops[k++]));
      continue;
    }
    let end = k;
    while (end < ops.length && ops[end].kind === " ") end++;
    const keepHead = k === 0 ? 0 : CONTEXT;
    const keepTail = end === ops.length ? 0 : CONTEXT;
    if (end - k > keepHead + keepTail + 1) {
      for (const op of ops.slice(k, k + keepHead)) body.append(row(op));
      const hidden = ops.slice(k + keepHead, end - keepTail);
      const fold = h(
        "button",
        {
          class: "fold",
          onclick: () => fold.replaceWith(...hidden.map(row)),
        },
        `${hidden.length} unchanged line${hidden.length === 1 ? "" : "s"}`,
      );
      body.append(fold);
      for (const op of ops.slice(end - keepTail, end)) body.append(row(op));
    } else for (const op of ops.slice(k, end)) body.append(row(op));
    k = end;
  }
  if (!added && !removed) body.replaceChildren(h("p", { class: "empty" }, "No changes."));
  return { element: body, added, removed };
}

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Where a position in a served module (1-based line and column, as in `error.stack`) sits in its source file, read
 * from the inline source map Vite appends. Null when the module has no map or the position has no mapping.
 */
export async function originalLine(url: string, line: number, column: number) {
  try {
    const code = await (await fetch(url)).text();
    const inline = /\/\/# sourceMappingURL=data:application\/json;(?:charset=utf-8;)?base64,([A-Za-z0-9+/=]+)\s*$/.exec(
      code,
    );
    if (!inline) return null;
    const map = JSON.parse(atob(inline[1])) as { mappings: string };
    const rows = map.mappings.split(";");
    // Every field but the generated column carries over from row to row, so decode every row up to this one.
    let sourceLine = 0;
    let best: number | null = null;
    for (let row = 0; row < line && row < rows.length; row++) {
      let generatedColumn = 0;
      for (const segment of rows[row].split(",")) {
        if (!segment) continue;
        const fields: number[] = [];
        let value = 0;
        let shift = 0;
        for (const char of segment) {
          const digit = BASE64.indexOf(char);
          value += (digit & 31) << shift;
          if (digit & 32) shift += 5;
          else {
            fields.push(value & 1 ? -(value >>> 1) : value >>> 1);
            value = shift = 0;
          }
        }
        generatedColumn += fields[0];
        if (fields.length >= 4) sourceLine += fields[2];
        if (row === line - 1 && fields.length >= 4 && generatedColumn <= column - 1) best = sourceLine + 1;
      }
    }
    return best;
  } catch {
    return null;
  }
}
