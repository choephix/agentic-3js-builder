`M` is a typed object literal, so indexing it with the string `"wheel" + side` or `"gearHip" + side` fails under strict typing. Casting `M` to a string-indexed record fixes both lines.

<<<<<<< SEARCH
    const C = V(...(M["wheel" + side] as [number, number, number]));
    const H = V(...(M["gearHip" + side] as [number, number, number]));
=======
    const MM = M as unknown as Record<string, [number, number, number]>;
    const C = V(...MM["wheel" + side]);
    const H = V(...MM["gearHip" + side]);
>>>>>>> REPLACE