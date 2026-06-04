"use client";

import { WaitlistBoard } from "@/components/features/waitlist/WaitlistBoard";
import { ListChecks } from "lucide-react";

export default function WaitlistPage() {
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
      </div>

      <WaitlistBoard />
    </div>
  );
}