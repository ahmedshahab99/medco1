import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

interface Doctor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface DoctorsListProps {
  doctors: Doctor[];
}

export default function DoctorsList({ doctors }: DoctorsListProps) {
  if (doctors.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4 px-2">أطباء العيادة</h2>
      <div className="flex flex-col gap-3">
        {doctors.map((doctor) => {
          const displayName =
            [doctor.firstName, doctor.lastName].filter(Boolean).join(" ") ||
            "طبيب";
          const initials =
            [doctor.firstName?.charAt(0), doctor.lastName?.charAt(0)]
              .filter(Boolean)
              .join("") || "ط";

          return (
            <Card key={doctor.id} size="sm">
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar size="sm" className="size-10">
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.role === "ADMIN" ? "طبيب / مدير" : "طبيب"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {doctor.role === "ADMIN" ? "مدير" : "طبيب"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
