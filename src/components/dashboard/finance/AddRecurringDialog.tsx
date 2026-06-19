"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

type RecurringFormData = {
  category: string;
  amount: string;
  description: string;
  notes: string;
  dayOfMonth: string;
};

type AddRecurringDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: RecurringFormData;
  onFormChange: (form: RecurringFormData) => void;
  onSubmit: () => void;
  submitting: boolean;
  editMode: boolean;
};

const categoryLabels: Record<string, string> = {
  CLINIC_RENT: "إيجار العيادة",
  INTERNET: "الإنترنت",
  SALARIES: "الرواتب",
  UTILITIES: "الفواتير",
  SUPPLIES: "المستلزمات",
  MARKETING: "التسويق",
  INSURANCE: "التأمين",
  TAXES: "الضرائب",
  MAINTENANCE: "الصيانة",
  OTHER: "أخرى",
};

export function AddRecurringDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  submitting,
  editMode,
}: AddRecurringDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-sans">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "تعديل مصروف ثابت" : "إضافة مصروف ثابت"}
          </DialogTitle>
          <DialogDescription>
            مصروف يتكرر شهرياً بشكل تلقائي
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>التصنيف</Label>
            <Select
              value={form.category}
              onValueChange={(v) => onFormChange({ ...form, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>المبلغ</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  onFormChange({ ...form, amount: e.target.value })
                }
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>اليوم من الشهر</Label>
              <Input
                type="number"
                min={1}
                max={28}
                value={form.dayOfMonth}
                onChange={(e) =>
                  onFormChange({ ...form, dayOfMonth: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>الوصف</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                onFormChange({ ...form, description: e.target.value })
              }
              placeholder="مثال: إيجار العيادة"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>ملاحظات (اختياري)</Label>
            <Input
              value={form.notes}
              onChange={(e) =>
                onFormChange({ ...form, notes: e.target.value })
              }
              placeholder="ملاحظات..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? "جاري الحفظ..." : editMode ? "تحديث" : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
