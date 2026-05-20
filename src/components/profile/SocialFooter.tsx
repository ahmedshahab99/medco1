import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import {
  MessageCircle,
  Facebook,
  Instagram,
  Music,
  Globe,
  Linkedin,
  Youtube,
  Twitter,
} from "lucide-react";
import { SocialPlatform } from "@prisma/client";

interface SocialLinkItem {
  id: string;
  platform: SocialPlatform;
  url: string;
}

interface SocialFooterProps {
  socialLinks: SocialLinkItem[];
}

const PLATFORM_ICONS: Record<SocialPlatform, typeof Globe> = {
  WHATSAPP: MessageCircle,
  FACEBOOK: Facebook,
  INSTAGRAM: Instagram,
  TIKTOK: Music,
  X: Twitter,
  LINKEDIN: Linkedin,
  YOUTUBE: Youtube,
};

export default function SocialFooter({ socialLinks }: SocialFooterProps) {
  if (socialLinks.length === 0) return null;

  return (
    <footer className="flex flex-col items-center gap-4 pt-6 pb-12">
      <Separator />
      <div className="flex justify-center items-center gap-4">
        {socialLinks.map((link) => {
          const Icon = PLATFORM_ICONS[link.platform] || Globe;
          return (
            <Button
              key={link.id}
              asChild
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
              >
                <Icon size={20} />
              </a>
            </Button>
          );
        })}
      </div>
    </footer>
  );
}
