Cause: The `DE MOLEN` SVG text element defines the `font-size` attribute twice, and the invalid `" thirty"` value makes the SVG parser reject it.

<<<<<<< SEARCH
      <text x="150" y="59" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size=" thirty" font-size="32" fill="#6f3f39">DE MOLEN</text>
=======
      <text x="150" y="59" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="#6f3f39">DE MOLEN</text>
>>>>>>> REPLACE