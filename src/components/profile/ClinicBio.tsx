interface ClinicBioProps {
  bio: string;
}

export default function ClinicBio({ bio }: ClinicBioProps) {
  return (
    <div className="mb-8 max-w-[400px] mx-auto text-center px-4">
      <p className="text-sm text-foreground/80 leading-relaxed font-medium">{bio}</p>
    </div>
  );
}
