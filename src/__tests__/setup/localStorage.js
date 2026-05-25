/**
 * Global localStorage shim for Jest's node environment.
 *
 * Zustand's default persist storage is `window.localStorage` (via createJSONStorage).
 * Node doesn't have window or window.localStorage, so we inject a simple in-memory
 * implementation that the Zustand JSON storage adapter can call.
 *
 * We expose it both as `global.localStorage` (for direct bare-identifier access)
 * and as `global.window.localStorage` (which is what Zustand's persist middleware
 * actually uses internally: `createJSONStorage(() => window.localStorage)`).
 *
 * Each test module gets a fresh store instance via module isolation, but this
 * shim itself persists across tests in a file. The individual test files call
 * localStorage.clear() in beforeEach to start clean.
 */

const store = new Map();

const localStorageMock = {
  getItem:    (key) => store.get(key) ?? null,
  setItem:    (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear:      () => store.clear(),
  get length() { return store.size; },
  key:        (index) => [...store.keys()][index] ?? null,
};

global.localStorage = localStorageMock;

// Zustand's persist middleware accesses window.localStorage, not the bare global.
// Ensure window exists and points to the same mock so both paths hit the same store.
if (typeof global.window === "undefined") {
  global.window = {};
}
global.window.localStorage = localStorageMock;
