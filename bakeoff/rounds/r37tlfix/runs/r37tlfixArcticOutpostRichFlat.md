Cause: the `cylinder` helper’s options type omitted the SDK-supported `group` property.

<<<<<<< SEARCH
    options: { rotation?: [number, number, number]; name?: string } = {},
=======
    options: {
      rotation?: [number, number, number];
      name?: string;
      group?: string;
    } = {},
>>>>>>> REPLACE