import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonLoading({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}
