export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-4 sm:p-6 pb-24 space-y-6 animate-pulse">
        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="size-28 rounded-full bg-muted" />
          <div className="h-7 bg-muted rounded w-48" />
          <div className="h-5 bg-muted rounded w-32" />
        </div>
        <div className="h-32 bg-muted rounded-xl" />
        <div className="space-y-3">
          <div className="h-14 bg-muted rounded-xl" />
          <div className="h-14 bg-muted rounded-xl" />
          <div className="h-14 bg-muted rounded-xl" />
        </div>
        <div className="h-10 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}
