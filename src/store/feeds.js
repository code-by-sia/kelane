import { create } from "zustand";
import { persist } from "zustand/middleware";

const useFeedsStore = create(
  persist(
    (set) => ({
      feeds: [
        {
          id: "default-bbc",
          title: "BBC Good Food",
          url: "https://www.bbcgoodfood.com/recipes/rss",
        },
      ],

      addFeed: (feed) =>
        set((s) => ({
          feeds: [...s.feeds, { id: crypto.randomUUID(), ...feed }],
        })),

      removeFeed: (id) =>
        set((s) => ({ feeds: s.feeds.filter((f) => f.id !== id) })),

      updateFeed: (id, data) =>
        set((s) => ({
          feeds: s.feeds.map((f) => (f.id === id ? { ...f, ...data } : f)),
        })),
    }),
    { name: "feeds-storage" },
  ),
);

export default useFeedsStore;
