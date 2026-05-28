"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getAvailableSlots } from "@/actions/public-booking";
import { formatTime12 } from "@/lib/date-utils";

interface Doctor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface DoctorSelectProps {
  slug: string;
  doctors: Doctor[];
  selectedDate: Date | null;
  onSelectDoctor: (doctorId: string, doctorName: string) => void;
  onBack: () => void;
}

export default function DoctorSelect({
  slug,
  doctors,
  selectedDate,
  onSelectDoctor,
  onBack,
}: DoctorSelectProps) {
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDate) return;

    setLoading(true);
    const dateStr = toDateKey(selectedDate);

    Promise.all(
      doctors.map((doc) =>
        getAvailableSlots(slug, dateStr, doc.id).then(
          (r) => ({ id: doc.id, count: r.slots.length })
        )
      )
    )
      .then((results) => {
        const counts: Record<string, number> = {};
        for (const r of results) {
          counts[r.id] = r.count;
        }
        setSlotCounts(counts);
      })
      .finally(() => setLoading(false));
  }, [slug, doctors, selectedDate]);

  const displayName = (d: Doctor) =>
    [d.firstName, d.lastName].filter(Boolean).join(" ") || "طبيب";

  const initials = (d: Doctor) =>
    [d.firstName?.charAt(0), d.lastName?.charAt(0)]
      .filter(Boolean)
      .join("") || "ط";

  return (
    <div className="w-full">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6">
        <ArrowLeft size={16} />
        التاريخ
      </Button>

      <h4 className="text-lg font-semibold mb-4">اختر الطبيب</h4>

      <div className="flex flex-col gap-3">
        {loading
          ? Array.from({ length: doctors.length }).map((_, i) => (
              <Card key={i} size="sm">
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          : doctors.map((doctor) => {
              const count = slotCounts[doctor.id] ?? 0;
              const name = displayName(doctor);

              return (
                <button
                  key={doctor.id}
                  disabled={count === 0}
                  onClick={() => onSelectDoctor(doctor.id, name)}
                  className="text-start disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Card
                    size="sm"
                    className="hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Avatar size="sm" className="size-10">
                          <AvatarFallback className="text-sm bg-primary/10 text-primary">
                            {initials(doctor)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doctor.role === "ADMIN" ? "طبيب / مدير" : "طبيب"}
                          </p>
                        </div>
                        <Badge
                          variant={count > 0 ? "default" : "outline"}
                          className="text-xs shrink-0 gap-1"
                        >
                          <Clock className="size-3" />
                          {count > 0
                            ? `${count} ${count === 1 ? "موعد" : "مواعيد"}`
                            : "مكتمل"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
      </div>
    </div>
  );
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
