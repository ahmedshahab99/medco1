import React from "react";
import { LucideIcon } from "lucide-react";

interface Social {
  id: number;
  icon: LucideIcon;
  url: string;
}

interface SocialFooterProps {
  socials: Social[];
}

const SocialFooter: React.FC<SocialFooterProps> = ({ socials }) => {
  return (
    <footer className="flex justify-center items-center gap-6 pt-6 pb-12 border-t border-zinc-200 dark:border-zinc-800">
      {socials.map((social) => {
        const Icon = social.icon;
        return (
          <a key={social.id} href={social.url} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Icon size={20} />
          </a>
        );
      })}
    </footer>
  );
};

export default SocialFooter;
