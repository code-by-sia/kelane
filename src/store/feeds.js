import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_FEEDS = [
  {
    id: "default-bbc",
    title: "BBC Good Food",
    url: "https://www.bbcgoodfood.com/recipes/rss",
  },
  {
    id: "default-seriouseats",
    title: "Serious Eats",
    url: "https://www.seriouseats.com/feeds/all.rss.xml",
  },
  {
    id: "default-smittenkitchen",
    title: "Smitten Kitchen",
    url: "https://feeds.feedburner.com/smittenkitchen",
  },
  {
    id: "default-101cookbooks",
    title: "101 Cookbooks",
    url: "https://www.101cookbooks.com/feed",
  },
  {
    id: "default-budgetbytes",
    title: "Budget Bytes",
    url: "https://www.budgetbytes.com/feed/",
  },
  {
    id: "default-halfbakedharvest",
    title: "Half Baked Harvest",
    url: "https://www.halfbakedharvest.com/feed/",
  },
  {
    id: "default-thekitchn",
    title: "The Kitchn",
    url: "https://www.thekitchn.com/main.rss",
  },
  {
    id: "default-cookingny",
    title: "NYT Cooking",
    url: "https://cooking.nytimes.com/feed/v1/rss.xml",
  },
];

const useFeedsStore = create(
  persist(
    (set) => ({
      feeds: DEFAULT_FEEDS,

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
    {
      name: "feeds-storage",

      partialize: (s) => ({ feeds: s.feeds }),
      version: 2,
      migrate: (persisted, version) => {
        // Merge any new default feeds that don't already exist in persisted state
        const existingIds = new Set((persisted.feeds ?? []).map((f) => f.id));
        const newDefaults = DEFAULT_FEEDS.filter((f) => !existingIds.has(f.id));
        return {
          ...persisted,
          feeds: [...(persisted.feeds ?? []), ...newDefaults],
        };
      },
    },
  ),
);

export default useFeedsStore;
