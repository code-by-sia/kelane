/**
 * idb-storage — Zustand persist storage adapter backed by IndexedDB.
 *
 * Drop-in replacement for the default localStorage adapter.
 * All stores share one "kelane" database; each store uses its own key.
 *
 * Usage in a store:
 *   import { idbStorage } from "@/lib/idb-storage";
 *   persist(fn, { name: "my-store", storage: idbStorage })
 */

import { get, set, del, createStore } from "idb-keyval";

const idbStore = createStore("kelane", "store");

export const idbStorage = {
  getItem: (name) => get(name, idbStore),
  setItem: (name, value) => set(name, value, idbStore),
  removeItem: (name) => del(name, idbStore),
};
