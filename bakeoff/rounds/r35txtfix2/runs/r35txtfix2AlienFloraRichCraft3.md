Cause: `b.along` callbacks receive only the placement frame, while three callbacks incorrectly relied on an `i` parameter or an undeclared `i`.

<<<<<<< SEARCH
  b.along(
    trunkTube,
    15,
    (at, i) => {
      const node = b.stick(
=======
  let trunkNodeIndex = 0;
  b.along(
    trunkTube,
    15,
    (at) => {
      const i = trunkNodeIndex++;
      const node = b.stick(
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.along(
      tube,
      5,
      (at) => {
        const spine = b.spike(
=======
    let frondSpineIndex = 0;
    b.along(
      tube,
      5,
      (at) => {
        const i = frondSpineIndex++;
        const spine = b.spike(
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.along(
      tube,
      7,
      (at) => {
        const spore = b.stick(
=======
    let tendrilSporeIndex = 0;
    b.along(
      tube,
      7,
      (at) => {
        const i = tendrilSporeIndex++;
        const spore = b.stick(
>>>>>>> REPLACE