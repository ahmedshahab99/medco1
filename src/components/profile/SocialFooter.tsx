import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
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

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  WHATSAPP: "واتساب",
  FACEBOOK: "فيسبوك",
  INSTAGRAM: "انستغرام",
  TIKTOK: "تيك توك",
  X: "إكس (تويتر)",
  LINKEDIN: "لينكد إن",
  YOUTUBE: "يوتيوب",
};

export default function SocialFooter({ socialLinks }: SocialFooterProps) {
  if (socialLinks.length === 0) return null;

  return (
    <footer className="flex flex-col items-center gap-4 pt-6 pb-12">
      <Separator />
      <div className="flex justify-center items-center gap-4 flex-wrap">
        <TooltipProvider>
          {socialLinks.map((link) => {
            const Icon = PLATFORM_ICONS[link.platform] || Globe;
            const label = PLATFORM_LABELS[link.platform] || link.platform;
            
            return (
              <Tooltip key={link.id}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="rounded-full size-12 transition-all hover:scale-110 hover:bg-accent hover:text-accent-foreground"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                    >
                      <Icon className="size-6" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </footer>
  );
}
