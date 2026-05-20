import { MapPin } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface ClinicHeaderProps {
  name: string;
  logo: string | null;
  specialty: string | null;
  address: string | null;
}

export default function ClinicHeader({
  name,
  logo,
  specialty,
  address,
}: ClinicHeaderProps) {
  return (
    <header className="flex flex-col items-center text-center mb-10">
      <div className="mb-5">
        <Avatar size="lg" className="size-28 ring-4 ring-primary/10">
          {logo ? (
            <AvatarImage src={logo} alt={name} />
          ) : null}
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">{name}</h1>
      {specialty && (
        <Badge variant="secondary" className="mb-2">
          {specialty}
        </Badge>
      )}
      {address && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin size={14} />
          <span>{address}</span>
        </div>
      )}
    </header>
  );
}
