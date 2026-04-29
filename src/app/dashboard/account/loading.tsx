import { Card } from "@/components/ui/Card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
      <Card className="max-w-2xl space-y-5">
        <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="h-12 w-32 bg-slate-200 rounded-xl animate-pulse" />
      </Card>
    </div>
  );
}
