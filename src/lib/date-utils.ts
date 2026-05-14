export const DAYS: { key: string; label: string; short: string }[] = [
  { key: "saturday",  label: "السبت",     short: "سبت" },
  { key: "sunday",    label: "الأحد",     short: "أحد" },
  { key: "monday",    label: "الاثنين",   short: "اثن" },
  { key: "tuesday",   label: "الثلاثاء",  short: "ثلا" },
  { key: "wednesday", label: "الأربعاء",  short: "أرب" },
  { key: "thursday",  label: "الخميس",   short: "خمي" },
  { key: "friday",    label: "الجمعة",    short: "جمع" },
];

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function formatArabicDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export function formatTime12(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "م" : "ص";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function getDayOfWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const jsDay = d.getDay();
  const map: Record<number, string> = {
    6: "saturday", 0: "sunday", 1: "monday",
    2: "tuesday",  3: "wednesday", 4: "thursday", 5: "friday",
  };
  return map[jsDay];
}
