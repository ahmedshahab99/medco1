"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pencil, Trash2, Repeat } from "lucide-react";

type RecurringExpense = {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  notes: string | null;
  dayOfMonth: number;
  isActive: boolean;
};

type RecurringExpenseRowProps = {
  expense: RecurringExpense;
  onEdit: (e: RecurringExpense) => void;
  onDelete: (id: string) => void;
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

function formatCurrency(amount: number) {
  return amount.toLocaleString("ar-IQ") + " د.ع";
}

export function RecurringExpenseRow({
  expense,
  onEdit,
  onDelete,
}: RecurringExpenseRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group border-b last:border-b-0">
      <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Repeat className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {expense.description || categoryLabels[expense.category]}
          </p>
          {!expense.isActive && (
            <Badge variant="secondary" className="text-[10px]">
              غير نشط
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {categoryLabels[expense.category] || expense.category} • يوم{" "}
          {expense.dayOfMonth} من كل شهر
        </p>
      </div>
      <span className="text-sm font-bold text-chart-expense shrink-0">
        {formatCurrency(expense.amount)}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onEdit(expense)}
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(expense.id)}
        >
          <Trash2 className="size-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

type RecurringExpensesSectionProps = {
  expenses: RecurringExpense[];
  onAdd: () => void;
  onEdit: (e: RecurringExpense) => void;
  onDelete: (id: string) => void;
};

export function RecurringExpensesSection({
  expenses,
  onAdd,
  onEdit,
  onDelete,
}: RecurringExpensesSectionProps) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">المصروفات الثابتة</CardTitle>
          <Button variant="outline" size="sm" onClick={onAdd}>
            إضافة
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm gap-2">
            <Repeat className="size-8 opacity-50" />
            <p>لا توجد مصروفات ثابتة</p>
            <Button variant="link" size="sm" onClick={onAdd}>
              إضافة مصروف شهري
            </Button>
          </div>
        ) : (
          expenses.map((e) => (
            <RecurringExpenseRow
              key={e.id}
              expense={e}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
