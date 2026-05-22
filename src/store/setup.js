import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSetupStore = create(
  persist(
    (set) => ({
      completed: false,
      step: 0,
      profile: {
        name: "",
        email: "",
        avatar: "",
      },
      preferences: {
        dietaryTags: [],
      },

      setStep: (step) => set({ step }),
      setProfile: (profile) =>
        set((s) => ({ profile: { ...s.profile, ...profile } })),
      setDietaryTags: (tags) =>
        set((s) => ({ preferences: { ...s.preferences, dietaryTags: tags } })),
      completeSetup: () => set({ completed: true, step: 0 }),
      resetSetup: () => set({ completed: false, step: 0 }),
    }),
    { name: "kelane-setup-storage" },
  ),
);

export default useSetupStore;
