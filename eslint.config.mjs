import eslintConfigNext from "eslint-config-next"

export default [
  {
    ignores: [
      "node_modules/",
      ".next/",
      "dist/",
      "out/",
      "next-env.d.ts",
      "*.config.js",
      "*.config.mjs",
      "postcss.config.js",
      "tailwind.config.js",
    ],
  },
  ...eslintConfigNext,
]
