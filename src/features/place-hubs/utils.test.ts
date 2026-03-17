import { describe, expect, it } from "vitest";
import { buildPlaceHubs, demoPlaceMemories, getPlaceHubBySlug, slugifyPlaceName } from "./utils";

describe("place hub utilities", () => {
  it("builds canonical place hubs from memory records", () => {
    const hubs = buildPlaceHubs(demoPlaceMemories);

    expect(hubs).toHaveLength(3);
    expect(hubs.find((hub) => hub.slug === "chennai")).toMatchObject({
      placeName: "Chennai",
      totalRecords: 2,
    });
  });

  it("resolves a place hub by slug", () => {
    const hub = getPlaceHubBySlug(demoPlaceMemories, "madurai");

    expect(hub?.placeName).toBe("Madurai");
    expect(hub?.memories).toHaveLength(1);
  });

  it("slugifies place names consistently", () => {
    expect(slugifyPlaceName("Madras University Archive")).toBe("madras-university-archive");
  });
});
