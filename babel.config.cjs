module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" }, modules: "commonjs" }],
  ],
  plugins: [
    // Allow parsing "import x from '…' with { type: 'json' }" syntax.
    // Babel strips the assertion and emits a plain require() for CJS.
    "@babel/plugin-syntax-import-attributes",
  ],
};
