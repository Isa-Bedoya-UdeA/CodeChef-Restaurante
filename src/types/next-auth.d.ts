import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: "ADMIN" | "USER" | string;
      photo?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: "ADMIN" | "USER" | string;
    photo?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    photo?: string | null;
  }
}
