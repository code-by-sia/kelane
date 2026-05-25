/**
 * Tests for src/store/feeds.js
 */



let useFeedsStore;
const DEFAULT_FEED_IDS = [
  "default-bbc",
  "default-seriouseats",
  "default-smittenkitchen",
  "default-101cookbooks",
  "default-budgetbytes",
  "default-halfbakedharvest",
  "default-thekitchn",
  "default-cookingny",
];

beforeAll(() => {
  ({ default: useFeedsStore } = require("@/store/feeds"));
});

beforeEach(() => {
  localStorage.clear();
  // Reset to default feeds (as seeded on first load)
  useFeedsStore.setState({
    feeds: DEFAULT_FEED_IDS.map((id) => ({ id, title: id, url: `https://${id}.com/feed` })),
  });
});

describe("initial state", () => {
  test("contains all 8 default feeds", () => {
    expect(useFeedsStore.getState().feeds).toHaveLength(8);
  });

  test("all default feed ids are present", () => {
    const ids = useFeedsStore.getState().feeds.map((f) => f.id);
    DEFAULT_FEED_IDS.forEach((id) => expect(ids).toContain(id));
  });
});

describe("addFeed", () => {
  test("adds a feed and assigns a uuid id", () => {
    useFeedsStore.getState().addFeed({ title: "My Feed", url: "https://example.com/feed" });
    const { feeds } = useFeedsStore.getState();
    expect(feeds).toHaveLength(9);
    const added = feeds.find((f) => f.title === "My Feed");
    expect(added).toBeDefined();
    expect(added.id).toBeTruthy();
    expect(added.id).not.toMatch(/^default-/);
  });
});

describe("removeFeed", () => {
  test("removes a feed by id", () => {
    useFeedsStore.getState().removeFeed("default-bbc");
    expect(useFeedsStore.getState().feeds).toHaveLength(7);
    expect(useFeedsStore.getState().feeds.find((f) => f.id === "default-bbc")).toBeUndefined();
  });

  test("is a no-op for unknown id", () => {
    useFeedsStore.getState().removeFeed("non-existent");
    expect(useFeedsStore.getState().feeds).toHaveLength(8);
  });
});

describe("updateFeed", () => {
  test("merges updated fields onto the matching feed", () => {
    useFeedsStore.getState().updateFeed("default-bbc", { title: "BBC Renamed" });
    const feed = useFeedsStore.getState().feeds.find((f) => f.id === "default-bbc");
    expect(feed.title).toBe("BBC Renamed");
    expect(feed.url).toBeTruthy(); // unchanged
  });

  test("does not affect other feeds", () => {
    useFeedsStore.getState().updateFeed("default-bbc", { title: "X" });
    const seriouseats = useFeedsStore.getState().feeds.find((f) => f.id === "default-seriouseats");
    expect(seriouseats.title).toBe("default-seriouseats"); // unchanged
  });
});
