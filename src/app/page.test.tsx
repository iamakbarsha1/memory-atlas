import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LandingPage from "./page";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signOut: vi.fn(),
    session: null,
  }),
}));

vi.mock("@/components/auth/LoginForm", () => ({
  LoginForm: () => <div>Login Form</div>,
}));

vi.mock("@/components/auth/SignupForm", () => ({
  SignupForm: () => <div>Signup Form</div>,
}));

vi.mock("@/components/globe/GlobeScene", () => ({
  GlobeScene: () => <div>Globe Scene</div>,
}));

vi.mock("@/components/memories/MemoryWorkspace", () => ({
  MemoryWorkspace: () => <div>Memory Workspace</div>,
}));

describe("LandingPage", () => {
  it("renders the memory layer vision content", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /A living map of where\s*human life happened\./i,
    );
    expect(screen.getByText(/Burial Layer/i)).toBeInTheDocument();
    expect(screen.getByText(/Family Homes Layer/i)).toBeInTheDocument();
    expect(screen.getByText(/Education Layer/i)).toBeInTheDocument();
    expect(screen.getByText(/Historical Moments Layer/i)).toBeInTheDocument();
    expect(screen.getByText(/Map a person’s life journey\./i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View Product Plan/i })).toHaveAttribute(
      "href",
      "#user-story-plan",
    );
  });
});
