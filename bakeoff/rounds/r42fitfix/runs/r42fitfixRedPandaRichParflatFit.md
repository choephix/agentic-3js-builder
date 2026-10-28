The line `const bone = b.joint ? undefined : undefined;` tests a method that is always defined, which TS flags. It was an unused leftover, so I'm removing it along with its `void` reference.

<<<<<<< SEARCH
  const bone = b.joint ? undefined : undefined;
  void J; void M; void bone;
=======
  void J; void M;
>>>>>>> REPLACE