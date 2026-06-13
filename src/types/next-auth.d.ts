import type { Role } from "@/lib/permissions";

// Add `id`, `role`, and granted `modules` to the NextAuth session/user/JWT.
declare module "next-auth" {
  interface User {
    role?: Role;
    modules?: string[];
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      modules: string[];
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    modules?: string[];
  }
}
