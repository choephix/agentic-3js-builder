Cause: `neck.tip` is `null` because the chain has exactly three span joints, `b.along` callbacks receive only one typed frame argument, and `b.surface` accepts the built neck sweep rather than its `Chain`.

```text
<<<<<<< SEARCH
  const head = b.joint("head", {
    parent: neck.tip!,
=======
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(neck, [0.22, 0.18], {
    color: COAT,
    sides: 8,
    section: "circle",
    name: "upright_neck",
    group: "body",
  });
=======
  const neckTube = b.sweep(neck, [0.22, 0.18], {
    color: COAT,
    sides: 8,
    section: "circle",
    name: "upright_neck",
    group: "body",
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.along(body, 8, (at, i) => {
    const h = 0.045 + 0.075 * Math.sin((i / 7) * Math.PI);
    b.spike(at, at, h, 0.028, {
      color: WOOD_DARK,
      name: `ink_mane_${i}`,
      group: "mane",
    });
  });
=======
  b.along(body, 8, (at) => {
    const i = Math.round(at.t * 7);
    const h = 0.045 + 0.075 * Math.sin((at.t) * Math.PI);
    b.spike(at, at, h, 0.028, {
      color: WOOD_DARK,
      name: `ink_mane_${i}`,
      group: "mane",
    });
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const neckLoop = b.surface(neck).loop(neck.at(0.55), { lift: 0.012 });
=======
  const neckLoop = b.surface(neckTube).loop(neck.at(0.55), { lift: 0.012 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const neckLoop2 = b.surface(neck).loop(neck.at(0.68), { lift: 0.014 });
=======
  const neckLoop2 = b.surface(neckTube).loop(neck.at(0.68), { lift: 0.014 });
>>>>>>> REPLACE
```