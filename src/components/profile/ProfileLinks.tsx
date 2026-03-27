import React from "react";
import { LucideIcon } from "lucide-react";

interface Link {
  id: number;
  title: string;
  type: string;
  url: string;
  icon: LucideIcon;
  bgColor: string;
  hoverColor: string;
  textColor: string;
}

interface ProfileLinksProps {
  links: Link[];
}

const ProfileLinks: React.FC<ProfileLinksProps> = ({ links }) => {
  return (
    <section className="flex flex-col gap-3 mb-10">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.id}
            href={link.url}
            className={`w-full flex items-center p-4 rounded-2xl transition-all active:scale-95 shadow-sm border border-zinc-200 dark:border-zinc-800 ${link.bgColor} ${link.hoverColor} ${link.textColor}`}
          >
            <div className="w-10 flex justify-center">
              <Icon size={22} className={link.type === 'whatsapp' ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'} />
            </div>
            <span className="flex-1 font-medium text-center pr-10">
              {link.title}
            </span>
          </a>
        );
      })}
    </section>
  );
};

export default ProfileLinks;
