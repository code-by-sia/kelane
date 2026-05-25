/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  moduleNameMapper: {
    // Resolve the @/ path alias used throughout src/
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleDirectories: ["node_modules", "src"],
  testMatch: ["**/__tests__/**/*.test.js"],
  clearMocks: true,
  // Inject a localStorage shim into every test file (stores now use localStorage)
  setupFiles: ["<rootDir>/src/__tests__/setup/localStorage.js"],
};
