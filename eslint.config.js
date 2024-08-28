import react from "@eslint-react/eslint-plugin";
import lichthagel from "@lichthagel/eslint-config";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...await lichthagel({
    browser: true,
    node: false, // TODO enable in teruko-server
    react: false,
  }),
  react.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.config.js", "*.config.mjs", "*.config.cjs"],
          defaultProject: "./tsconfig.eslint.json",
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@eslint-react/no-duplicate-key": "off",
      "no-alert": "off",
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.nx/**",
      "**/build/**",
      "**/scripts/**",
      "**/postcss.config.cjs",
    ],
  },
];
