export const RESERVED_SLUGS = [
  "admin",
  "dashboard",
  "api",
  "setup",
  "login",
  "auth",
  "clinic",
  "www",
  "app",
  "docs",
  "support",
  "billing",
  "account",
  "settings",
  "profile",
  "help",
  "about",
  "contact",
  "terms",
  "privacy",
  "blog",
  "news",
  "test",
  "demo",
  "staging",
  "dev",
  "localhost",
] as const;

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase() as (typeof RESERVED_SLUGS)[number]);
}
