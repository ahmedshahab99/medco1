import { requireAuth } from "@/lib/auth";
import ServicesPageClient from "./ServicesPageClient";

export default async function ServicesPage() {
  const profile = await requireAuth();
  const isAdmin = profile.role === "ADMIN";

  return <ServicesPageClient isAdmin={isAdmin} />;
}
