import React from "react";
import { Card, CardTitle } from "../../ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/Table";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Appointment } from "../../../lib/types/dashboard";
import { MoreHorizontal } from "lucide-react";

const mockAppointments: Appointment[] = [
  { id: "1", patientName: "سارة محمد", date: "اليوم", time: "10:00 ص", type: "consultation", status: "scheduled", doctor: "د. أحمد" },
  { id: "2", patientName: "خالد عبد الله", date: "اليوم", time: "11:30 ص", type: "follow-up", status: "completed", doctor: "د. أحمد" },
  { id: "3", patientName: "نورة فهد", date: "اليوم", time: "01:00 م", type: "treatment", status: "scheduled", doctor: "د. أحمد" },
  { id: "4", patientName: "يوسف علي", date: "اليوم", time: "02:15 م", type: "consultation", status: "cancelled", doctor: "د. أحمد" },
];

export function UpcomingAppointments() {
  const getBadgeVariant = (status: Appointment['status']) => {
    switch (status) {
      case "completed": return "success";
      case "scheduled": return "warning"; // amber represents upcoming/pending well enough
      case "cancelled": case "no-show": return "danger";
      default: return "default";
    }
  };

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case "completed": return "مكتمل";
      case "scheduled": return "مجدول";
      case "cancelled": return "ملغي";
      case "no-show": return "لم يحضر";
      default: return status;
    }
  };

  const getTypeLabel = (type: Appointment['type']) => {
    switch (type) {
      case "consultation": return "استشارة";
      case "follow-up": return "متابعة";
      case "treatment": return "علاج";
      default: return type;
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <CardTitle className="mb-0">المواعيد القادمة</CardTitle>
        <Button variant="outline" size="sm">عرض الكل</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المريض</TableHead>
            <TableHead>الوقت</TableHead>
            <TableHead className="hidden sm:table-cell">النوع</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockAppointments.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-bold text-slate-800">{app.patientName}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700 whitespace-nowrap">{app.time}</span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{app.date}</span>
                </div>
              </TableCell>
              <TableCell className="text-slate-600 hidden sm:table-cell">{getTypeLabel(app.type)}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(app.status)}>
                  {getStatusLabel(app.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
