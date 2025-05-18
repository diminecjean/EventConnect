import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-stone-100 dark:bg-stone-800",
        className,
      )}
      {...props}
    />
  );
}

function SkeletonUserCardHorziontal({
  array = [],
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { array?: any[] }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {array.map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonEvent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="w-full flex flex-col gap-4 mt-20" {...props}>
      {/* Banner skeleton */}
      <Skeleton className="w-full h-64 rounded-lg" />

      <div className="flex flex-row gap-6 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-4 border-2 border-stone-100 dark:border-stone-800 p-4 rounded-lg">
          {/* Event image skeleton */}
          <Skeleton className="w-64 h-64 rounded-lg" />

          {/* Date time location */}
          <div className="flex flex-col gap-6 p-2">
            <div className="flex flex-row gap-6 items-center">
              <Skeleton className="w-6 h-6 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-24 h-3" />
              </div>
            </div>
            <div className="flex flex-row gap-6 items-center">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-40 h-4" />
            </div>
          </div>

          {/* Map placeholder */}
          <Skeleton className="aspect-square w-64 rounded-lg" />

          {/* Attendee count */}
          <Skeleton className="w-full h-8 mt-4" />
        </div>

        {/* Right column */}
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-row justify-between gap-4 w-full">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Register button */}
          <Skeleton className="h-10 w-full my-4 rounded-lg" />

          {/* Tabs skeleton */}
          <div className="my-6 w-full">
            <Skeleton className="h-10 w-full mb-4" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SkeletonEventCard = ({
  array = [],
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { array?: any[] }) => (
  <div className={cn("space-y-3", className)} {...props}>
    {array.map((_, i) => (
      <div
        key={i}
        className="w-full flex flex-col sm:flex-row gap-4 border border-stone-700 p-4 rounded-lg"
      >
        <Skeleton className="w-full sm:w-48 h-32 rounded-md" />
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex flex-row gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40 mt-2" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </div>
      </div>
    ))}
  </div>
);

export {
  Skeleton,
  SkeletonUserCardHorziontal,
  SkeletonEvent,
  SkeletonEventCard,
};
