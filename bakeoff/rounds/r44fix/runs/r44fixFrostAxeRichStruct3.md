The cause: a leftover dead `fur` array used `b.frameAt` (not in the SDK) inside a comma expression; it did nothing, so I removed it.

<<<<<<< SEARCH
  const fur = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return b.frameAt ? null : null, a;
  });
  void fur;
=======
>>>>>>> REPLACE