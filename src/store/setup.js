import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSetupStore = create(
  persist(
    (set) => ({
      completed: false,
      step: 0,
      preferences: {
        dietaryTags: [],
      },

      setStep: (step) => set({ step }),
      setDietaryTags: (tags) =>
        set((s) => ({ preferences: { ...s.preferences, dietaryTags: tags } })),
      completeSetup: () => set({ completed: true, step: 0 }),
      resetSetup: () => set({ completed: false, step: 0 }),
    }),
    { name: "kelane-setup-storage" },
  ),
);

export default useSetupStore;
