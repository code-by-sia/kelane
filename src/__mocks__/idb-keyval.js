/**
 * In-memory mock for idb-keyval.
 * Jest auto-discovers this file because it lives in src/__mocks__ and the
 * module being mocked resolves from node_modules (idb-keyval). Tests can
 * call clearStore() in beforeEach to start each test with a clean slate.
 */

let _store = new Map();

const get = jest.fn((key) => Promise.resolve(_store.get(key) ?? null));
const set = jest.fn((key, value) => { _store.set(key, value); return Promise.resolve(); });
const del = jest.fn((key) => { _store.delete(key); return Promise.resolve(); });

/** Returns a fake store object — the second arg Zustand passes is ignored. */
const createStore = jest.fn(() => ({}));

/** Helper available to tests to wipe the in-memory database between runs. */
const clearStore = () => { _store = new Map(); };

module.exports = { get, set, del, createStore, clearStore };
