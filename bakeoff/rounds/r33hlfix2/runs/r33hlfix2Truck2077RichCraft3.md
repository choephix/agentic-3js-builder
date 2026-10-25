The cause: `box()` passes `color` as a `string | Paint`, but `neon()` and the `glow(box(...))` calls pass the colour through as-is, and the `box` helper also receives `{ rotation: [...] }` as an extra option. The error says an array of 3 reached `part`'s colour slot, which happens when `box(size, at, color, extra)` is called with the `rotation` array in the colour position: `box([0.12, 0.45, 0.06], [s * 1.36, 2.6, 3.0], CHASSIS)` is fine, but several calls pass `{ rotation }` as the fourth argument while the `box` helper spreads `extra` into `b.part` without `rotation` ever reaching it correctly. The direct trigger at line 68 is the `box` helper forwarding `extra` into `b.part` with `at` set; `rotation` in model space on `b.part` is applied as Euler degrees, but the real offender is the `neon` call on line 159, where `glow` receives a Part whose colour argument was an `Rgb` tuple. Fixing the helper so colours are always strings or paints, and switching the fixed-tilt pieces to `quat`, resolves it.

<<<<<<< SEARCH
  const box = (size: V3, at: V3, color: string | Paint, extra: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...extra });
=======
  const box = (size: V3, at: V3, color: string | Paint, extra: Record<string, unknown> = {}) => {
    const rot = extra.rotation as V3 | undefined;
    const { rotation: _r, ...rest } = extra;
    const quat = rot
      ? new THREE.Quaternion().setFromEuler(
          new THREE.Euler(rot[0] * THREE.MathUtils.DEG2RAD, rot[1] * THREE.MathUtils.DEG2RAD, rot[2] * THREE.MathUtils.DEG2RAD),
        )
      : undefined;
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), String(color) === color ? color : (color as Paint), {
      at,
      ...rest,
      ...(quat ? { quat } : {}),
    });
  };
>>>>>>> REPLACE

<<<<<<< SEARCH
  const neon = (size: V3, at: V3, color: string, strength = 1.6) =>
    glow(box(size, at, color), strength);
=======
  const neon = (size: V3, at: V3, color: string, strength = 1.6) => glow(box(size, at, color), strength);
>>>>>>> REPLACE