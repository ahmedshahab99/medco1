export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateSlugFormat(slug: string): { valid: boolean; error?: string } {
  if (!slug || slug.length === 0) {
    return { valid: false, error: "الرابط مطلوب" };
  }

  if (slug.length < 3) {
    return { valid: false, error: "الرابط يجب أن يكون 3 أحرف على الأقل" };
  }

  if (slug.length > 30) {
    return { valid: false, error: "الرابط يجب ألا يتجاوز 30 حرف" };
  }

  if (!SLUG_REGEX.test(slug)) {
    return { valid: false, error: "الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة، أرقام، وشرطات فقط" };
  }

  return { valid: true };
}

export function generateSlugFromText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
