"use client";

import { useState } from "react";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { createPublicAppointment } from "@/actions/public-booking";
import type { BookingResult } from "@/actions/public-booking";
import { formatTime12 } from "@/lib/date-utils";

interface BookingFormProps {
  date: Date | null;
  time: string | null;
  slug: string;
  doctorId: string;
  doctorName: string;
  onBack: () => void;
  onSuccess: (result: BookingResult) => void;
}

export default function BookingForm({
  date,
  time,
  slug,
  doctorId,
  doctorName,
  onBack,
  onSuccess,
}: BookingFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    if (!date || !time) return;

    const clientErrors: Record<string, string> = {};
    if (!fullName.trim()) clientErrors.fullName = "الاسم مطلوب";
    if (!phone.trim()) clientErrors.phone = "رقم الهاتف مطلوب";
    if (!dateOfBirth) clientErrors.dateOfBirth = "تاريخ الميلاد مطلوب";
    if (!gender) clientErrors.gender = "الجنس مطلوب";

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const dateStr = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    const startTime = `${dateStr}T${time}:00`;

    setLoading(true);
    const result = await createPublicAppointment(slug, {
      fullName,
      phone,
      dateOfBirth,
      gender,
      notes,
      doctorId,
      startTime,
      paymentMethod: "IN_PERSON",
    });

    if (result.success) {
      onSuccess(result);
    } else {
      if (result.fieldErrors) setErrors(result.fieldErrors);
      if (result.error) setServerError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6">
        <ArrowLeft size={16} />
        الوقت
      </Button>

      <div className="bg-muted/50 p-4 rounded-xl border mb-6 flex items-start gap-4">
        <div className="bg-background p-2.5 rounded-lg shadow-sm border">
          <CalendarIcon size={20} className="text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-base mb-0.5">
            {time ? formatTime12(time) : ""}
          </h4>
          <p className="text-sm font-medium text-muted-foreground">
            {date?.toLocaleDateString("ar-SA", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doctorName}
          </p>
        </div>
      </div>

      {serverError && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
          {serverError}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="booking-name">الاسم الكامل</Label>
          <Input
            id="booking-name"
            required
            type="text"
            placeholder="محمد أحمد"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="booking-phone">رقم الهاتف</Label>
          <Input
            id="booking-phone"
            required
            type="tel"
            placeholder="+964 7XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="booking-dob">تاريخ الميلاد</Label>
          <Input
            id="booking-dob"
            required
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-destructive">{errors.dateOfBirth}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="booking-gender">الجنس</Label>
          <Select
            value={gender}
            onValueChange={(v) => setGender(v as "MALE" | "FEMALE" | "")}
          >
            <SelectTrigger id="booking-gender">
              <SelectValue placeholder="اختر الجنس" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">ذكر</SelectItem>
              <SelectItem value="FEMALE">أنثى</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-xs text-destructive">{errors.gender}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="booking-notes">ملاحظات إضافية</Label>
          <Textarea
            id="booking-notes"
            rows={3}
            placeholder="أي معلومات تساعدنا في التحضير للزيارة"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-emerald-600 text-sm">💰</span>
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">الدفع حضوري</p>
            <p className="text-xs text-emerald-600 mt-0.5">سيتم الدفع عند وصولك إلى العيادة</p>
          </div>
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
