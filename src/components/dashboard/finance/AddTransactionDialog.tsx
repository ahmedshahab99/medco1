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

export type TransactionFormData = {
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: string;
  description: string;
  date: string;
};

type AddTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: TransactionFormData;
  onFormChange: (form: TransactionFormData) => void;
  onSubmit: () => void;
  submitting: boolean;
  editMode: boolean;
};

const categoryLabels: Record<string, string> = {
  CONSULTATION: "الكشفية",
  MEDICATIONS: "الأدوية",
  SERVICES: "الخدمات",
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

const expenseCategories = Object.entries(categoryLabels).filter(
  ([key]) =>
    key !== "CONSULTATION" && key !== "MEDICATIONS" && key !== "SERVICES"
);

const incomeCategories = Object.entries(categoryLabels).filter(
  ([key]) =>
    key === "CONSULTATION" || key === "MEDICATIONS" || key === "SERVICES"
);

export function AddTransactionDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSubmit,
  submitting,
  editMode,
}: AddTransactionDialogProps) {
  const categories =
    form.type === "INCOME" ? incomeCategories : expenseCategories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "تعديل المعاملة" : "إضافة معاملة جديدة"}
          </DialogTitle>
          <DialogDescription>
            {form.type === "INCOME" ? "تسجيل دخل جديد" : "تسجيل مصروف جديد"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>النوع</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={form.type === "INCOME" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() =>
                  onFormChange({
                    ...form,
                    type: "INCOME",
                    category: "CONSULTATION",
                  })
                }
              >
                دخل
              </Button>
              <Button
                type="button"
                variant={form.type === "EXPENSE" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() =>
                  onFormChange({
                    ...form,
                    type: "EXPENSE",
                    category: "CLINIC_RENT",
                  })
                }
              >
                مصروف
              </Button>
            </div>
          </div>

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
                {categories.map(([key, label]) => (
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
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  onFormChange({ ...form, date: e.target.value })
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
              placeholder="وصف المعاملة..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
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
