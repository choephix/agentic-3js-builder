Cause: the crest `b.cards(...)` call has an extra trailing comma after its options object, which the app’s parser rejects at the closing parenthesis.

```ts
<<<<<<< SEARCH
      name: "crest-feathers",
    },
  );
=======
      name: "crest-feathers",
    }
  );
>>>>>>> REPLACE
```