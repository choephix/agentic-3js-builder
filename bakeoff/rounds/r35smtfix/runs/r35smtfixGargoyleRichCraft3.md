Line 135 is the `b.spike(hp(...), [0, 1, 0.1]...)` call whose options object passes `bone` alongside a tuple start. It is the horn `b.sweep(bezier(...), [0.055, 0.0], {...})`, where `bezier` receives plain `number[]` tuples from `hp` that don't satisfy the overload. Typing `hp` as returning `[number, number, number]` already holds, so the real mismatch is the `caps` option value `"flat"`/`"point"` being widened to `string` in the object literal.

Fixing by marking the caps literals `as const`.

<<<<<<< SEARCH
      { bone: head, color: STONE_L, sides: 6, caps: { start: "flat", end: "point" } },
=======
      { bone: head, color: STONE_L, sides: 6, caps: { start: "flat" as const, end: "point" as const } },
>>>>>>> REPLACE