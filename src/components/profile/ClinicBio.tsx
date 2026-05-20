import { Card, CardContent } from "@/components/ui/Card";

interface ClinicBioProps {
  bio: string;
}

export default function ClinicBio({ bio }: ClinicBioProps) {
  return (
    <Card className="mb-8 max-w-[400px] mx-auto text-center">
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
      </CardContent>
    </Card>
  );
}
