import React from "react";
import { MapPin, CheckCircle2 } from "lucide-react";

interface ProfileHeaderProps {
  doctor: {
    name: string;
    image: string;
    specialization: string;
    location: string;
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ doctor }) => {
  return (
    <header className="flex flex-col items-center text-center mb-10">
      <div className="relative mb-5 p-1 bg-linear-to-tr from-blue-500 to-cyan-400 rounded-full shadow-lg shadow-blue-500/20">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-[#0a0a0a]"
        />
        <div className="absolute bottom-1 right-1 bg-white dark:bg-[#0a0a0a] p-1.5 rounded-full shadow-sm text-blue-500 dark:text-blue-400">
          <CheckCircle2 size={16} className="fill-current text-white dark:text-[#0a0a0a]" 
            style={{ stroke: "currentColor", fill: "currentColor" }} />
        </div>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-1 dark:text-white">
        {doctor.name}
      </h1>
      <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
        {doctor.specialization}
      </p>
      <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        <MapPin size={14} />
        <span>{doctor.location}</span>
      </div>
    </header>
  );
};

export default ProfileHeader;
