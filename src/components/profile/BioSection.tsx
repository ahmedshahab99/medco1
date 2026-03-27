import React from "react";

interface BioSectionProps {
  bio: string;
  experience: string;
}

const BioSection: React.FC<BioSectionProps> = ({ bio, experience }) => {
  return (
    <section className="bg-white dark:bg-zinc-900/70 rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8 max-w-[400px] mx-auto text-center backdrop-blur-sm">
      <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
        {bio}
      </p>
      <div className="inline-block bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
        {experience}
      </div>
    </section>
  );
};

export default BioSection;
