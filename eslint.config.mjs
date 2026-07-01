import nextPlugin from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "client/**"],
  },
  ...nextPlugin,
  prettierConfig,
];

export default eslintConfig;
