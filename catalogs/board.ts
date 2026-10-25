// Board helpers for the catalogs' default exports (the cull sheets): a row of variants on the floor, each on its own
// joint, with a sign in front naming it. Builders don't need this file; catalogs import it for their boards only.
import * as THREE from "three";
import type { Builder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import type { Mount, Roles, V3, Variant } from "./truck";

/** A sign reading `text`, leaning back 30° so the top, front and three-quarter shots all read it. */
export function label(b: Builder, text: string, at: V3, bone: Joint, width = 1.6) {
  const tex = svg(
    `<svg viewBox="0 0 640 120"><rect width="640" height="120" rx="16" fill="#14161a"/><text x="320" y="92" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="700" fill="#ffffff" text-anchor="middle" textLength="${Math.min(600, text.length * 52)}" lengthAdjust="spacingAndGlyphs">${text}</text></svg>`,
    { size: 640 },
  );
  const h = (width * 120) / 640;
  b.part(new THREE.PlaneGeometry(width, h), "#ffffff", {
    bone,
    at: [at[0], at[1] + h * 0.26, at[2]],
    rotation: [-60, 0, 0],
    texture: tex,
    name: `label.${text}`,
  });
}

export type RowOptions = {
  /** Mount height above the floor (the hub of a wheel, the floor of a cab). */
  y?: number;
  /** Side sign and outward normal handed to every mount in the row. */
  s?: 1 | -1;
  n?: V3;
  /** Spacing along X and the row's x centre. */
  pitch?: number;
  x0?: number;
  /** How far in front of the mount the sign stands. */
  front?: number;
  labelWidth?: number;
  /** Slot prefix: keys become full variant names (`wheel` + `offroad` → `wheelOffroad`) for the sign and the tag. */
  prefix?: string;
};

/**
 * One board row at depth `z`: a joint `${name}` per variant (so hinges and spins each have their own bone), a sign in
 * front of each, and the Mount to hand the variant. Returns the mounts in order.
 */
export function row(b: Builder, root: Joint, z: number, keys: readonly string[], options: RowOptions = {}) {
  const { y = 0, s = 1, n = [0, 0, 1], pitch = 2, front = 1, prefix = "" } = options;
  const labelWidth = Math.min(options.labelWidth ?? 2.4, pitch - 0.15);
  const names = keys.map((k) => (prefix ? prefix + k[0].toUpperCase() + k.slice(1) : k));
  const x0 = options.x0 ?? 0;
  const mounts: Mount[] = [];
  names.forEach((name, i) => {
    const x = x0 + (i - (names.length - 1) / 2) * pitch;
    const bone = b.joint(`j_${name}`, { parent: root, at: [x, y, z] });
    label(b, name, [x, 0.01, z + front], root, labelWidth);
    if (y > 0.05)
      b.part(new THREE.CylinderGeometry(0.06, 0.1, y, 8), "#55585c", {
        bone: root,
        at: [x, y / 2, z - 0.2 * Math.abs(n[2])],
        name: `stand.${name}`,
      });
    mounts.push({ bone, at: [x, y, z], s, n, root, tag: `_${name}` });
  });
  return mounts;
}

/**
 * A row for one slot: every variant in `reg`, named `prefix` + key, built on its own mount. `turn` then yaws each
 * one about its mount (degrees about +Y) so a part built along X faces the camera. Returns the mounts.
 */
export function slot(
  b: Builder,
  root: Joint,
  z: number,
  reg: Record<string, Variant>,
  prefix: string,
  c: Roles,
  options: RowOptions & { turn?: number },
) {
  const keys = Object.keys(reg);
  const mounts = row(b, root, z, keys, { ...options, prefix });
  mounts.forEach((m, i) => {
    reg[keys[i]](b, options.turn ? { ...m, root: m.bone } : m, c);
    if (options.turn) b.pose(m.bone, { axis: [0, 1, 0], deg: options.turn });
  });
  return mounts;
}

/** A sign for a whole row or a board, wider and higher. */
export function title(b: Builder, text: string, at: V3, bone: Joint) {
  label(b, text, at, bone, 3);
}
