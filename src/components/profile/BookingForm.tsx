"use client";

import { useState } from "react";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import type { BookingFormData } from "./BookingModal";

interface BookingFormProps {
  date: Date | null;
  time: string | null;
  onBack: () => void;
  onSubmit: (formData: BookingFormData) => void;
}

export default function BookingForm({
  date,
  time,
  onBack,
  onSubmit,
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit(formData);
    }, 1500);
  };

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft size={16} />
        الوقت
      </Button>

      <div className="bg-muted/50 p-4 rounded-xl border mb-6 flex items-start gap-4">
        <div className="bg-background p-2.5 rounded-lg shadow-sm border">
          <CalendarIcon size={20} className="text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-base mb-0.5">
            {time}
          </h4>
          <p className="text-sm font-medium text-muted-foreground">
            {date?.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="booking-name">الاسم الكامل</Label>
          <Input
            id="booking-name"
            required
            type="text"
            placeholder="محمد أحمد"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="booking-email">البريد الإلكتروني</Label>
          <Input
            id="booking-email"
            required
            type="email"
            placeholder="example@domain.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="booking-phone">رقم الهاتف</Label>
          <Input
            id="booking-phone"
            required
            type="tel"
            placeholder="+966 5XXXXXXXX"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="booking-notes">ملاحظات إضافية</Label>
          <Textarea
            id="booking-notes"
            rows={3}
            placeholder="أي معلومات تساعدنا في التحضير للزيارة"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>

        <div className="pt-4 mt-2">
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "جاري الحجز..." : "تأكيد الحجز"}
          </Button>
        </div>
      </form>
    </div>
  );
}
