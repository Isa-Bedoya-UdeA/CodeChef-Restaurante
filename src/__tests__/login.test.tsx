import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock next-auth/react
const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

describe("LoginPage Component", () => {
  it("renders login form with inputs and submit button", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("Correo Electrónico")).toBeDefined();
    expect(screen.getByLabelText("Contraseña")).toBeDefined();
    expect(screen.getByRole("button", { name: /Entrar al sistema/i })).toBeDefined();
  });

  it("renders quick-credentials buttons for testing", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Correo Electrónico") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Contraseña") as HTMLInputElement;

    const adminQuickBtn = screen.getByText("admin@codechef.com");
    fireEvent.click(adminQuickBtn);

    expect(emailInput.value).toBe("admin@codechef.com");
    expect(passwordInput.value).toBe("admin123");
  });
});
