import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [js.configs.recommended, ...tseslint.configs.recommended, { ignores: ["node_modules/", "out/", "aidlc-docs/"] }, { files: ["web/main.js"], languageOptions: { globals: { crypto: "readonly", document: "readonly", fetch: "readonly" } } }];
