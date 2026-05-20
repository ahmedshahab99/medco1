import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground/30 mb-4">404</h1>
      <h2 className="text-xl font-bold text-foreground mb-2">
        العيادة غير موجودة
      </h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        الرابط الذي تبحث عنه غير صحيح أو لم يعد متاحاً
      </p>
      <Button asChild>
        <Link href="/">العودة للرئيسية</Link>
      </Button>
    </div>
  );
}
