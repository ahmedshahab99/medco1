"use client";

import { useState } from "react";
import {
  MessageCircle,
  MapPin,
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
  clinicName: string;
  phone: string | null;
  address: string | null;
  socialLinks: SocialLink[];
}

const PLATFORM_LABELS: Partial<Record<SocialPlatform, string>> = {
  WHATSAPP: "واتساب",
  FACEBOOK: "فيسبوك",
  INSTAGRAM: "انستغرام",
};

export default function QuickActions({
  clinicName,
  phone,
  address,
  socialLinks,
}: QuickActionsProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const whatsappLink = socialLinks.find((s) => s.platform === "WHATSAPP");
  const googleMapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;

  return (
    <>
      <section className="flex flex-col gap-3 mb-10">
        {whatsappLink && (
          <Button asChild variant="default" size="lg" className="h-12">
            <a
              href={whatsappLink.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-5" />
              {PLATFORM_LABELS.WHATSAPP}
            </a>
          </Button>
        )}

        {phone && (
          <Button asChild variant="outline" size="lg" className="h-12">
            <a href={`tel:${phone}`}>
              <Phone className="size-5" />
              اتصال
            </a>
          </Button>
        )}

        {googleMapsUrl && (
          <Button asChild variant="outline" size="lg" className="h-12">
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <MapPin className="size-5" />
              الاتجاهات
            </a>
          </Button>
        )}

        <Separator className="my-1" />

        <Button
          variant="default"
          size="lg"
          className="h-12"
          onClick={() => setIsBookingOpen(true)}
        >
          <Calendar className="size-5" />
          حجز موعد
        </Button>
      </section>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctorName={clinicName}
        timeSlots={TIME_SLOTS}
      />
    </>
  );
}

const TIME_SLOTS = [
  "09:00 ص", "09:30 ص", "10:00 ص", "11:00 ص",
  "02:00 م", "02:30 م", "03:00 م", "04:30 م",
];
