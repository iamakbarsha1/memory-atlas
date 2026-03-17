import { describe, expect, it } from "vitest";
import {
  buildPlaceFacets,
  buildPlaceHubs,
  demoPlaceMemories,
  getPlaceHubBySlug,
  resolveCanonicalPlaceName,
  slugifyPlaceName,
} from "./utils";

describe("place hub utilities", () => {
  it("builds canonical place hubs from memory records", () => {
    const hubs = buildPlaceHubs([
      ...demoPlaceMemories,
      {
        ...demoPlaceMemories[0],
        id: "demo-place-5",
        placeName: "Madras University Archive",
      },
    ]);

    expect(hubs).toHaveLength(3);
    expect(hubs.find((hub) => hub.slug === "chennai")).toMatchObject({
      placeName: "Chennai",
      totalRecords: 3,
    });
    expect(hubs.find((hub) => hub.slug === "chennai")?.aliases).toContain("Madras University Archive");
  });

  it("resolves a place hub by slug", () => {
    const hub = getPlaceHubBySlug(
      [
        ...demoPlaceMemories,
        {
          ...demoPlaceMemories[1],
          id: "demo-place-5",
          placeName: "Madras",
        },
      ],
      "chennai",
    );

    expect(hub?.placeName).toBe("Chennai");
    expect(hub?.memories).toHaveLength(3);
  });

  it("slugifies place names consistently", () => {
    expect(slugifyPlaceName("Madras University Archive")).toBe("chennai");
  });

  it("builds collapsed place facets from aliases", () => {
    const facets = buildPlaceFacets([
      ...demoPlaceMemories,
      {
        ...demoPlaceMemories[0],
        id: "demo-place-5",
        placeName: "Madras",
      },
    ]);

    expect(facets.find((facet) => facet.slug === "chennai")).toMatchObject({
      placeName: "Chennai",
      totalRecords: 3,
    });
  });

  it("resolves canonical place names from aliases and institution labels", () => {
    expect(resolveCanonicalPlaceName("Madras")).toBe("Chennai");
    expect(resolveCanonicalPlaceName("Madras University Archive")).toBe("Chennai");
    expect(resolveCanonicalPlaceName("Green Gardens Cemetery")).toBe("Dubai");
  });
});
