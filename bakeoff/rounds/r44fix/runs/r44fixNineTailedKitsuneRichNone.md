The scaled ruff outline was built with `.map(([x, y, k]) => [x*0.6, y*0.6-0.01, k])`, which gives points whose third element is `undefined` for unmarked corners. That becomes `null` in JSON and fails validation, so the third element must be added only when it exists.

<<<<<<< SEARCH
    b.extrude(ruff.map(([x, y, k]: any) => [x * 0.6, y * 0.6 - 0.01, k]) as any, {
=======
    b.extrude(ruff.map(([x, y, k]: any) => (k ? [x * 0.6, y * 0.6 - 0.01, k] : [x * 0.6, y * 0.6 - 0.01])) as any, {
>>>>>>> REPLACE