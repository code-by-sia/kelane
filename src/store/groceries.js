import { create } from "zustand";
import { persist } from "zustand/middleware";

const useGroceriesStore = create(
  persist(
    (set, get) => ({
      fridgeItems: [],
      toBuyItems: [],

      addFridgeItem: (item) =>
        set((state) => ({
          fridgeItems: [
            ...state.fridgeItems,
            { id: crypto.randomUUID(), expiresAt: null, ...item },
          ],
        })),

      removeFridgeItem: (id) =>
        set((state) => ({
          fridgeItems: state.fridgeItems.filter((i) => i.id !== id),
        })),

      addToBuyItem: (item) =>
        set((state) => ({
          toBuyItems: [
            ...state.toBuyItems,
            { id: crypto.randomUUID(), checked: false, ...item },
          ],
        })),

      removeToBuyItem: (id) =>
        set((state) => ({
          toBuyItems: state.toBuyItems.filter((i) => i.id !== id),
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

      moveToFridge: (id) => {
        const item = get().toBuyItems.find((i) => i.id === id);
        if (!item) return;
        set((state) => ({
          toBuyItems: state.toBuyItems.filter((i) => i.id !== id),
          fridgeItems: [
            ...state.fridgeItems,
            {
              id: crypto.randomUUID(),
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              expiresAt: null,
            },
          ],
        }));
      },
    }),
    {
      name: "groceries-storage",
    },
  ),
);

export default useGroceriesStore;
