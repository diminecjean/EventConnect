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

function SkeletonUserProfile({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="p-6 max-w-3xl mx-auto mt-20" {...props}>
      <div className="border-2 border-stone-500 shadow-md rounded-lg overflow-hidden bg-black/60">
        <div className="p-6">
          {/* Profile header section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture Skeleton */}
            <Skeleton className="w-[120px] h-[120px] rounded-full shrink-0" />

            {/* User Info Skeleton */}
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-row items-center justify-between gap-2">
                <Skeleton className="h-8 w-40" />
                <div className="flex flex-row items-center justify-center md:justify-start gap-2">
                  <Skeleton className="h-8 w-32 rounded-md" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="mt-1 flex items-center justify-center md:justify-start gap-2">
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="mt-1 flex items-center justify-center md:justify-start gap-2">
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="mt-1 flex items-center justify-center md:justify-start gap-2">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          {/* Bio Section Skeleton */}
          <div className="mt-6">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </div>

          {/* Interests Section Skeleton */}
          <div className="mt-6">
            <Skeleton className="h-6 w-24 mb-2" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-24 rounded-full" />
              ))}
            </div>
          </div>

          {/* Badges Section Skeleton */}
          <div className="mt-6">
            <Skeleton className="h-6 w-24 mb-2" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Events Attended Section Skeleton */}
          <div className="mt-6">
            <Skeleton className="h-6 w-40 mb-2" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 p-3 border border-stone-700 rounded-lg"
                >
                  <Skeleton className="w-20 h-20 rounded-md shrink-0" />
                  <div className="flex flex-col gap-2 w-full">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Organizations Section Skeleton */}
          <div className="mt-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 p-3 border border-stone-700 rounded-lg"
                >
                  <Skeleton className="w-16 h-16 rounded-md shrink-0" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonUserCardHorziontal,
  SkeletonEvent,
  SkeletonEventCard,
  SkeletonUserProfile,
};
