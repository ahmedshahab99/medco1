"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2, ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/date-utils";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description: string | null;
  date: string;
  patientId: string | null;
  patient: { name: string } | null;
  appointment: {
    id: string;
    doctor: { id: string; name: string } | null;
  } | null;
};

type TransactionTimelineProps = {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
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

export function TransactionTimeline({
  transactions,
  onEdit,
  onDelete,
}: TransactionTimelineProps) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base">سجل المعاملات</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">لا توجد معاملات في هذه الفترة</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>المريض / الطبيب</TableHead>
                <TableHead className="text-end">المبلغ</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="group">
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={tx.type === "INCOME" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {categoryLabels[tx.category] || tx.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-[150px] truncate">
                    {tx.description || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {tx.patient?.name || tx.appointment?.doctor?.name || "—"}
                  </TableCell>
                  <TableCell className="text-end">
                    <span
                      className={`text-sm font-bold ${
                        tx.type === "INCOME" ? "text-chart-income" : "text-chart-expense"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {tx.appointment ? (
                        <Link
                          href={`/dashboard/patients/${tx.patientId}/appointments/${tx.appointment.id}`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                          title="عرض الموعد"
                        >
                          <ArrowUpRight className="size-3" />
                          الموعد
                        </Link>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onEdit(tx)}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onDelete(tx.id)}
                          >
                            <Trash2 className="size-3 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
