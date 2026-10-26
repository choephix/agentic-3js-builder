Cause: `BODY_PALETTE` is an undefined typo for `AXO_PALETTE`, and the extrude outline permits an optional third tuple element instead of the SDK’s valid two- or three-element outline tuples.

<<<<<<< SEARCH
  const color = mix(BODY_PALETTE.tailFin, BODY_PALETTE.gillLight, t);
  const rim = Math.abs(n.x) < 0.55 || s[1] < -0.10 || s[1] > 0.105;
  return rim ? mix(color, BODY_PALETTE.bodyShadow, 0.72) : color;
=======
  const color = mix(AXO_PALETTE.tailFin, AXO_PALETTE.gillLight, t);
  const rim = Math.abs(n.x) < 0.55 || s[1] < -0.10 || s[1] > 0.105;
  return rim ? mix(color, AXO_PALETTE.bodyShadow, 0.72) : color;
>>>>>>> REPLACE

<<<<<<< SEARCH
    const outline: [number, number, "sharp"?][] = [
=======
    const outline: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE