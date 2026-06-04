"use client";

import { useState } from "react";
import { WaitlistBoard } from "@/components/features/waitlist/WaitlistBoard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useDoctors } from "@/hooks/use-doctors";
import { Skeleton } from "@/components/ui/Skeleton";
import { ListChecks, Users } from "lucide-react";

export default function WaitlistPage() {
  const { data: doctors, isLoading } = useDoctors();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(
    undefined
  );

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <ListChecks className="size-6" />
            قائمة الانتظار
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            اسحب المرضى بين الأعمدة لتغيير حالتهم
          </p>
        </div>

        <div className="w-56">
          {isLoading ? (
            <Skeleton className="h-9 w-full rounded-lg" />
          ) : (
            <Select
              value={selectedDoctorId ?? "all"}
              onValueChange={(value) =>
                setSelectedDoctorId(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-full">
                <Users className="size-4 ms-0 me-1.5 text-slate-400" />
                <SelectValue placeholder="كل الأطباء" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأطباء</SelectItem>
                {doctors?.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <WaitlistBoard doctorId={selectedDoctorId} />
    </div>
  );
}
