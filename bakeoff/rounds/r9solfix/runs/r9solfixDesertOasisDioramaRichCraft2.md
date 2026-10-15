The collar queries a joint Chain instead of its built geometry; retain the neck Sweep and pass that to `b.surface()`.

<<<<<<< SEARCH
    b.sweep(neck, [0.29 * s, 0.22 * s, 0.18 * s, 0.18 * s], {
      color: camelPaint,
      sides: 7,
      smooth: false,
      caps: "round",
    });
=======
    const neckTube = b.sweep(neck, [0.29 * s, 0.22 * s, 0.18 * s, 0.18 * s], {
      color: camelPaint,
      sides: 7,
      smooth: false,
      caps: "round",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const collar = b.surface(neck).loop(p([0, 1.83, 0.77]), {
=======
    const collar = b.surface(neckTube).loop(p([0, 1.83, 0.77]), {
>>>>>>> REPLACE