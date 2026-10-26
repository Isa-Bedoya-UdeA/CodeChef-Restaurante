import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/transactions",
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("Sidebar Component", () => {
  it("renders user information correctly (photo fallback and name)", () => {
    const user = {
      name: "Laura Gomez",
      email: "laura@codechef.com",
      role: "USER",
      photo: null,
    };

    render(<Sidebar user={user} />);

    expect(screen.getByText("Laura Gomez")).toBeDefined();
    expect(screen.getByText("USER")).toBeDefined();
    expect(screen.getByText("L")).toBeDefined(); // Fallback initial
  });

  it("shows only Transacciones and Maestros for USER role (Usuarios hidden)", () => {
    const user = {
      name: "Laura Gomez",
      email: "laura@codechef.com",
      role: "USER",
    };

    render(<Sidebar user={user} />);

    expect(screen.getByText("Transacciones")).toBeDefined();
    expect(screen.getByText("Maestros")).toBeDefined();
    expect(screen.queryByText("Usuarios")).toBeNull();
  });

  it("shows all links including Usuarios for ADMIN role", () => {
    const adminUser = {
      name: "Admin CodeChef",
      email: "admin@codechef.com",
      role: "ADMIN",
    };

    render(<Sidebar user={adminUser} />);

    expect(screen.getByText("Transacciones")).toBeDefined();
    expect(screen.getByText("Maestros")).toBeDefined();
    expect(screen.getByText("Usuarios")).toBeDefined();
  });

  it("renders Cerrar sesión button", () => {
    const user = {
      name: "Admin CodeChef",
      role: "ADMIN",
    };

    render(<Sidebar user={user} />);
    expect(screen.getByText("Cerrar sesión")).toBeDefined();
  });
});
