Cause: `torsoStations_zYWH` is a flat 24-number array typed as a triple, so the torso loft's `st.map` destructures plain numbers; the same flat data also breaks the `number[][]` cast and the string indexing of `M`.

<<<<<<< SEARCH
  torsoStations_zYWH: [2.2,2.7,1.5,1.5, 1.6,2.5,2.5,1.9, 0.5,2.4,2.9,1.8, -0.8,2.3,2.8,1.7, -1.8,2.2,2.2,1.4, -2.4,2.1,1.2,1.1] as [number, number, number],
=======
  torsoStations_zYWH: [[2.2,2.7,1.5,1.5],[1.6,2.5,2.5,1.9],[0.5,2.4,2.9,1.8],[-0.8,2.3,2.8,1.7],[-1.8,2.2,2.2,1.4],[-2.4,2.1,1.2,1.1]] as unknown as [number, number, number],
>>>>>>> REPLACE

<<<<<<< SEARCH
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };
=======
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: any };
>>>>>>> REPLACE

<<<<<<< SEARCH
  const st = M.torsoStations_zYWH as number[][];
=======
  const st = M.torsoStations_zYWH as unknown as number[][];
>>>>>>> REPLACE