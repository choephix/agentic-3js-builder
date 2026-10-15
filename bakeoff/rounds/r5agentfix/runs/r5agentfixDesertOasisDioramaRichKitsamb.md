The cause is a missing `)` on the `kf.box(paint(...` line for the tent door flaps: `paint(` is never closed before the next argument.

<<<<<<< SEARCH
      kf.box(paint((p) => (Math.floor((p.y - GY) / 0.03) % 2 ? c1 : c2), [doorW + 0.01, wallH - 0.045, 0.01], [s * (doorW / 2 + 0.004), (wallH + 0.035) / 2 + 0.01, wr + 0.012]);
=======
      kf.box(paint((p) => (Math.floor((p.y - GY) / 0.03) % 2 ? c1 : c2)), [doorW + 0.01, wallH - 0.045, 0.01], [s * (doorW / 2 + 0.004), (wallH + 0.035) / 2 + 0.01, wr + 0.012]);
>>>>>>> REPLACE