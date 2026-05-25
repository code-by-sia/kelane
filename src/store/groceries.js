import { create } from "zustand";
import { persist } from "zustand/middleware";

function mergeIntoFridge(fridgeItems, newItem) {
  const existing = fridgeItems.find(
    (f) => f.name.toLowerCase() === newItem.name.toLowerCase(),
  );
  if (existing && newItem.quantity != null) {
    return fridgeItems.map((f) =>
      f.id === existing.id
        ? { ...f, quantity: (f.quantity ?? 0) + newItem.quantity }
        : f,
    );
  }
  return [
    ...fridgeItems,
    { id: crypto.randomUUID(), expiresAt: null, ...newItem },
  ];
}

const useGroceriesStore = create(
  persist(
    (set, get) => ({
      fridgeItems: [],
      toBuyItems: [],

      addFridgeItem: (item) =>
        set((state) => ({
          fridgeItems: mergeIntoFridge(state.fridgeItems, item),
        })),

      removeFridgeItem: (id) =>
        set((state) => ({
          fridgeItems: state.fridgeItems.filter((i) => i.id !== id),
        })),

      removeFridgeItems: (ids) =>
        set((state) => ({
          fridgeItems: state.fridgeItems.filter((i) => !ids.has(i.id)),
        })),

      addToBuyItem: (item) =>
        set((state) => ({
          toBuyItems: [
            ...state.toBuyItems,
            { id: crypto.randomUUID(), checked: false, expiresAt: null, ...item },
          ],
        })),

      removeToBuyItem: (id) =>
        set((state) => ({
          toBuyItems: state.toBuyItems.filter((i) => i.id !== id),
        })),

      removeToBuyItems: (ids) =>
        set((state) => ({
          toBuyItems: state.toBuyItems.filter((i) => !ids.has(i.id)),
        })),

      toggleToBuyItem: (id) =>
        set((state) => ({
          toBuyItems: state.toBuyItems.map((i) =>
            i.id === id ? { ...i, checked: !i.checked } : i,
          ),
        })),

      clearCheckedToBuyItems: () =>
        set((state) => ({
          toBuyItems: state.toBuyItems.filter((i) => !i.checked),
        })),

      moveToFridge: (id, expiresAt) => {
        const item = get().toBuyItems.find((i) => i.id === id);
        if (!item) return;
        set((state) => ({
          toBuyItems: state.toBuyItems.filter((i) => i.id !== id),
          fridgeItems: mergeIntoFridge(state.fridgeItems, {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            expiresAt: expiresAt ?? item.expiresAt ?? null,
          }),
        }));
      },

      // Deduct quantity from a fridge item by name (substring match). Removes if qty reaches 0.
      deductFridgeIngredient: (name, quantity) => {
        set((state) => {
          const lower = name.toLowerCase();
          const item = state.fridgeItems.find((f) =>
            f.name.toLowerCase().includes(lower) || lower.includes(f.name.toLowerCase()),
          );
          if (!item) return state;
          if (item.quantity == null || quantity == null) {
            // no quantity tracking — just remove
            return {
              fridgeItems: state.fridgeItems.filter((f) => f.id !== item.id),
            };
          }
          const remaining = item.quantity - quantity;
          return {
            fridgeItems:
              remaining <= 0
                ? state.fridgeItems.filter((f) => f.id !== item.id)
                : state.fridgeItems.map((f) =>
                    f.id === item.id ? { ...f, quantity: remaining } : f,
                  ),
          };
        });
      },

      // Update expiresAt for all fridge items whose id is in the ids Set
      updateFridgeItemsExpiry: (ids, expiresAt) =>
        set((state) => ({
          fridgeItems: state.fridgeItems.map((f) =>
            ids.has(f.id) ? { ...f, expiresAt: expiresAt ?? null } : f,
          ),
        })),

      // Move a group of fridge items (by id Set) back to the to-buy list
      moveFridgeToBuy: (ids) => {
        const items = get().fridgeItems.filter((f) => ids.has(f.id));
        if (!items.length) return;
        const first = items[0];
        set((state) => ({
          fridgeItems: state.fridgeItems.filter((f) => !ids.has(f.id)),
          toBuyItems: [
            ...state.toBuyItems,
            {
              id: crypto.randomUUID(),
              checked: false,
              name: first.name,
              quantity: first.quantity,
              unit: first.unit,
              expiresAt: null,
            },
          ],
        }));
      },

      // fridgeIds = Set of IDs that go to fridge; rest are just removed from list
      moveMultipleToFridge: (fridgeIds, removeIds, expiresAt) => {
        const items = get().toBuyItems.filter((i) => fridgeIds.has(i.id));
        const allIds = new Set([...fridgeIds, ...removeIds]);
        set((state) => {
          let fridgeItems = state.fridgeItems;
          for (const item of items) {
            fridgeItems = mergeIntoFridge(fridgeItems, {
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              expiresAt: expiresAt ?? item.expiresAt ?? null,
            });
          }
          return {
            toBuyItems: state.toBuyItems.filter((i) => !allIds.has(i.id)),
            fridgeItems,
          };
        });
      },
    }),
    {
      name: "groceries-storage",

      partialize: (s) => ({ fridgeItems: s.fridgeItems, toBuyItems: s.toBuyItems }),
    },
  ),
);

export default useGroceriesStore;
