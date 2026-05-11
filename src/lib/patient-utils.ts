/**
 * Split a full name into first and last name components.
 * Uses the first word as firstName, remaining as lastName.
 * Falls back to "-" for lastName if only one word.
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const firstSpaceIndex = trimmed.indexOf(" ");
  if (firstSpaceIndex === -1) {
    return { firstName: trimmed || "-", lastName: "-" };
  }
  return {
    firstName: trimmed.slice(0, firstSpaceIndex),
    lastName: trimmed.slice(firstSpaceIndex + 1).trim() || "-",
  };
}

/**
 * Format a display name from first/last name, falling back to email.
 */
export function formatName(
  firstName?: string | null,
  lastName?: string | null,
  email?: string
): string {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return name || email || "غير معروف";
}
