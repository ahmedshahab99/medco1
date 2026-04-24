export type TenantSocialPlatform = "WHATSAPP" | "X" | "FACEBOOK" | "INSTAGRAM" | "LINKEDIN";

export interface TenantProfile {
  id: string;
  name: string;
  slug: string;
  qrCode: string | null;
  phone: string | null;
  specialty: string | null;
  bio: string | null;
  logo: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  socialLinks: {
    id: string;
    platform: TenantSocialPlatform;
    url: string;
  }[];
}
