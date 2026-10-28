Cause: `M[key]` is indexed by a plain string, the chest-spike `seat` call has a stray `&&` expression with an extra argument, and the reduce callbacks lack types because `colIR`/`colOR` came back loosely typed.

<<<<<<< SEARCH
    const m = M[key];
=======
    const m = (M as Record<string, number[]>)[key];
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (h) seat(h, SPIKE, P.bone, { embed: 0.1, scale: [0.05, 0.07, 0.05] } as any && h, { scale: [0.05, 0.07, 0.05] });
=======
    if (h) seat(h, SPIKE, P.bone, { embed: 0.1, scale: [0.05, 0.07, 0.05] });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const a = colIR.reduce((m, p) => (p.x < m.x ? p : m), colIR[0]);
  const e = colOR.reduce((m, p) => (p.x > m.x ? p : m), colOR[0]);
=======
  const a = colIR.reduce((m: THREE.Vector3, p: THREE.Vector3) => (p.x < m.x ? p : m), colIR[0]);
  const e = colOR.reduce((m: THREE.Vector3, p: THREE.Vector3) => (p.x > m.x ? p : m), colOR[0]);
>>>>>>> REPLACE