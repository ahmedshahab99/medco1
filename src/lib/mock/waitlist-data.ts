export type WaitlistStatus = "BOOKING" | "WAITING" | "IN_PROGRESS" | "COMPLETED";

export interface BoardPatient {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  status: WaitlistStatus;
  addedAt: string;
}

export const mockPatients: BoardPatient[] = [
  {
    id: "1",
    name: "أحمد محمد علي",
    phone: "+966 50 123 4567",
    notes: "حالة طارئة - ألم في الصدر",
    status: "BOOKING",
    addedAt: "2026-06-04T08:00:00Z",
  },
  {
    id: "2",
    name: "فاطمة حسن",
    phone: "+966 55 234 5678",
    notes: "متابعة حمل - الأسبوع ٢٤",
    status: "BOOKING",
    addedAt: "2026-06-04T08:15:00Z",
  },
  {
    id: "3",
    name: "عمر إبراهيم",
    phone: "+966 56 345 6789",
    notes: null,
    status: "BOOKING",
    addedAt: "2026-06-04T08:30:00Z",
  },
  {
    id: "4",
    name: "سارة عبدالله",
    phone: "+966 54 456 7890",
    notes: "فحص دوري",
    status: "WAITING",
    addedAt: "2026-06-04T08:45:00Z",
  },
  {
    id: "5",
    name: "خالد صالح",
    phone: "+966 50 567 8901",
    notes: "صداع مزمن منذ أسبوعين",
    status: "WAITING",
    addedAt: "2026-06-04T09:00:00Z",
  },
  {
    id: "6",
    name: "نورة سعيد",
    phone: "+966 53 678 9012",
    notes: null,
    status: "WAITING",
    addedAt: "2026-06-04T09:10:00Z",
  },
  {
    id: "7",
    name: "مريم خالد",
    phone: "+966 55 789 0123",
    notes: "حساسية موسمية",
    status: "WAITING",
    addedAt: "2026-06-04T09:15:00Z",
  },
  {
    id: "8",
    name: "عبدالرحمن محمد",
    phone: "+966 56 890 1234",
    notes: null,
    status: "IN_PROGRESS",
    addedAt: "2026-06-04T08:20:00Z",
  },
  {
    id: "9",
    name: "ليلى أحمد",
    phone: "+966 50 901 2345",
    notes: "متابعة سكري",
    status: "IN_PROGRESS",
    addedAt: "2026-06-04T08:50:00Z",
  },
  {
    id: "10",
    name: "يوسف علي",
    phone: "+966 54 012 3456",
    notes: "فحص ضغط الدم",
    status: "COMPLETED",
    addedAt: "2026-06-04T07:30:00Z",
  },
  {
    id: "11",
    name: "هند فهد",
    phone: "+966 53 123 4560",
    notes: null,
    status: "COMPLETED",
    addedAt: "2026-06-04T07:45:00Z",
  },
  {
    id: "12",
    name: "سلطان عبدالعزيز",
    phone: "+966 55 234 5670",
    notes: "متابعة كسر - إزالة جبيرة",
    status: "COMPLETED",
    addedAt: "2026-06-04T07:00:00Z",
  },
];
