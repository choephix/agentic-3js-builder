// A tiny element builder: `h("button", { class: "tog", onclick }, "Label")`. Attributes that are `false`, `null` or
// `undefined` are left out; `on*` functions become listeners; children skip `null`, `undefined` and `false`.
export type Child = Node | string | number | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, unknown> | null = null,
  ...children: Array<Child | Child[]>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes ?? {})) {
    if (value === false || value === null || value === undefined) continue;
    if (key.startsWith("on") && typeof value === "function")
      element.addEventListener(key.slice(2), value as EventListener);
    else element.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of children.flat())
    if (child !== null && child !== undefined && child !== false)
      element.append(typeof child === "number" ? String(child) : child);
  return element;
}
