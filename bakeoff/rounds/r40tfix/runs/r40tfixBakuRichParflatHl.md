The leg code indexes `j.at` (a Vector3) as an array (`p1[2]`, `p2[2]`), and `pts` then contains Vector3s and undefined entries; converting the joint points to plain number tuples fixes both the type errors and the null coordinate.

<<<<<<< SEARCH
    const p0 = j0.at, p1 = j1.at, p2 = j2.at;
=======
    const p0 = j0.at.toArray() as number[], p1 = j1.at.toArray() as number[], p2 = j2.at.toArray() as number[];
>>>>>>> REPLACE