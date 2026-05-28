"use client";

import { useState } from "react";
import {
  MessageCircle,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { SocialPlatform } from "@prisma/client";
import BookingModal from "./BookingModal";

interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
}

interface QuickActionsProps {
  slug: string;
  phone: string | null;
  doctorCount: number;
  socialLinks: SocialLink[];
}

const PLATFORM_LABELS: Partial<Record<SocialPlatform, string>> = {
  WHATSAPP: "واتساب",
  FACEBOOK: "فيسبوك",
  INSTAGRAM: "انستغرام",
};

export default function QuickActions({
  slug,
  phone,
  doctorCount,
  socialLinks,
}: QuickActionsProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const whatsappLink = socialLinks.find((s) => s.platform === "WHATSAPP");

  return (
    <>
      <section className="flex flex-col gap-3 mb-10 px-2">
        {whatsappLink && (
          <Button asChild size="lg" className="h-14 w-full rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] transition-all bg-[#25D366] hover:bg-[#128C7E] text-white font-medium text-base">
            <a
              href={whatsappLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full"
            >
              <MessageCircle className="size-5" />
              {PLATFORM_LABELS.WHATSAPP}
            </a>
          </Button>
        )}

        {phone && (
          <Button asChild variant="outline" size="lg" className="h-14 w-full rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-base bg-background/80 backdrop-blur-sm">
            <a href={`tel:${phone}`} className="flex items-center justify-center gap-2 w-full">
              <Phone className="size-5" />
              اتصال
            </a>
          </Button>
        )}

        <Separator className="my-2 opacity-50" />

        <Button
          variant="default"
          size="lg"
          className="h-12 rounded-full"
          disabled={doctorCount === 0}
          onClick={() => setIsBookingOpen(true)}
        >
          <Calendar className="size-5" />
          حجز موعد
        </Button>
      </section>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        slug={slug}
      />
    </>
  );
}
