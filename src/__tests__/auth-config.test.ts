import { describe, it, expect } from "vitest";
import { authConfig } from "@/lib/auth.config";

describe("NextAuth authConfig - Access Control & Role Permissions", () => {
  const authorized = authConfig.callbacks?.authorized;

  it("blocks unauthenticated users from accessing /dashboard", () => {
    const nextUrl = new URL("http://localhost:3000/dashboard/transactions");
    const result = authorized?.({
      auth: null,
      request: { nextUrl } as unknown as Parameters<NonNullable<typeof authorized>>[0]["request"],
    });

    expect(result).toBe(false);
  });

  it("allows authenticated USER to access /dashboard/transactions", () => {
    const nextUrl = new URL("http://localhost:3000/dashboard/transactions");
    const result = authorized?.({
      auth: { user: { id: "1", role: "USER" }, expires: new Date().toISOString() as unknown as Date & string },
      request: { nextUrl } as unknown as Parameters<NonNullable<typeof authorized>>[0]["request"],
    });

    expect(result).toBe(true);
  });

  it("redirects USER role away from /dashboard/users to /dashboard", () => {
    const nextUrl = new URL("http://localhost:3000/dashboard/users");
    const result = authorized?.({
      auth: { user: { id: "1", role: "USER" }, expires: new Date().toISOString() as unknown as Date & string },
      request: { nextUrl } as unknown as Parameters<NonNullable<typeof authorized>>[0]["request"],
    });

    expect(result).toBeInstanceOf(Response);
    const response = result as Response;
    expect([302, 307]).toContain(response.status);
    expect(response.headers.get("Location")).toContain("/dashboard");
  });

  it("allows ADMIN role to access /dashboard/users", () => {
    const nextUrl = new URL("http://localhost:3000/dashboard/users");
    const result = authorized?.({
      auth: { user: { id: "1", role: "ADMIN" }, expires: new Date().toISOString() as unknown as Date & string },
      request: { nextUrl } as unknown as Parameters<NonNullable<typeof authorized>>[0]["request"],
    });

    expect(result).toBe(true);
  });

  it("redirects logged-in users away from /login to /dashboard", () => {
    const nextUrl = new URL("http://localhost:3000/login");
    const result = authorized?.({
      auth: { user: { id: "1", role: "USER" }, expires: new Date().toISOString() as unknown as Date & string },
      request: { nextUrl } as unknown as Parameters<NonNullable<typeof authorized>>[0]["request"],
    });

    expect(result).toBeInstanceOf(Response);
    const response = result as Response;
    expect([302, 307]).toContain(response.status);
    expect(response.headers.get("Location")).toContain("/dashboard");
  });

  it("populates jwt token and session correctly", async () => {
    const jwt = authConfig.callbacks?.jwt;
    const sessionCallback = authConfig.callbacks?.session;

    const token = await jwt?.({
      token: {},
      user: {
        id: "1",
        name: "Admin User",
        email: "admin@codechef.com",
        role: "ADMIN",
        photo: "https://example.com/avatar.jpg",
      },
      account: null,
    });

    expect(token).toEqual({
      id: "1",
      role: "ADMIN",
      photo: "https://example.com/avatar.jpg",
    });

    const session = await sessionCallback?.({
      session: {
        user: { id: "1", name: "Admin User", email: "admin@codechef.com", emailVerified: null },
        expires: new Date().toISOString() as unknown as Date & string,
      },
      token: token!,
    });

    expect(session?.user?.id).toBe("1");
    expect((session?.user as { role?: string })?.role).toBe("ADMIN");
    expect((session?.user as { photo?: string | null })?.photo).toBe("https://example.com/avatar.jpg");
  });
});
