Cause: the first `STAGE2.push` registration has an extra trailing comma after the immediately-invoked function expression, which leaves the call syntactically unterminated for the app’s parser.

```ts
<<<<<<< SEARCH
  })(),
);
=======
  })()
);
>>>>>>> REPLACE
```