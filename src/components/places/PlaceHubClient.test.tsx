import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlaceHubClient } from "./PlaceHubClient";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signOut: vi.fn(),
    session: null,
  }),
}));

describe("PlaceHubClient", () => {
  it("renders a canonical place hub from demo data", async () => {
    render(<PlaceHubClient slug="chennai" />);

    expect(await screen.findByRole("heading", { level: 1, name: /Chennai/i })).toBeInTheDocument();
    expect(screen.getByText(/Canonical Place Hub/i)).toBeInTheDocument();
    expect(screen.getAllByText(/partner collections/i)).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Madurai/i })).toBeInTheDocument();
  });
});
