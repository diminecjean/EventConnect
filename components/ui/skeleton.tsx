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
    <div className="p-4 md:p-6 mt-16 md:mt-20 mx-16" {...props}>
      {/* Container to ensure proper stacking */}
      <div className="relative">
        {/* Profile Header Area - Cover photo style with overlay */}
        <div className="relative h-48 rounded-t-xl overflow-hidden bg-gradient-to-r from-violet-600/50 to-indigo-800/50">
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>

        {/* Profile picture - positioned to overlap the header and body sections */}
        <div className="absolute top-16 left-8 z-20">
          <Skeleton className="w-40 h-40 rounded-full border-4 border-white" />
        </div>

        {/* Main content area */}
        <div className="relative z-10 bg-black/60 border-2 border-stone-500 rounded-b-xl shadow-md pt-20 pb-8 px-8 mt-[-1px]">
          {/* User info section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <Skeleton className="h-8 w-40 mb-4" />
              <div className="flex items-center gap-2 mt-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex flex-col md:flex-row gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>

            {/* Social media links skeleton */}
            <div className="mt-4 md:mt-0 flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 h-[1px] bg-stone-700" />

          {/* Content grid - Two column layout on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - About and Interests */}
            <div className="md:col-span-1">
              {/* Bio */}
              <div className="mb-8 bg-stone-900/50 p-4 rounded-lg shadow-inner border border-stone-800">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </div>

              {/* Interests */}
              <div className="mb-8 bg-stone-900/50 p-4 rounded-lg shadow-inner border border-stone-800">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-6 w-24 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Organizations */}
              <div className="mb-8 bg-stone-900/50 p-4 rounded-lg shadow-inner border border-stone-800">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 border border-stone-700 rounded-lg"
                    >
                      <Skeleton className="w-12 h-12 rounded-md shrink-0" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - Badges and Events */}
            <div className="md:col-span-2">
              {/* Badges */}
              <div className="mb-8 bg-gradient-to-br from-stone-900/70 to-stone-900/30 p-6 rounded-lg shadow-md border border-stone-700">
                <Skeleton className="h-6 w-36 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-28 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Events Attended */}
              <div className="bg-stone-900/50 p-6 rounded-lg shadow-inner border border-stone-800">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-6 w-40" />
                </div>
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
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-3 rounded-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonOrganizationProfile({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="w-full mt-20 flex flex-col gap-4" {...props}>
      {/* Banner skeleton */}
      <Skeleton className="w-full h-64 rounded-lg" />

      <div className="flex flex-row p-4">
        <div className="flex flex-col w-full">
          {/* Organization header with logo and info */}
          <div className="flex flex-row items-center justify-between rounded-lg bg-black/60 p-4">
            <div className="grid grid-cols-6 w-full gap-8 justify-start">
              {/* Organization logo skeleton */}
              <Skeleton className="w-[150px] h-[150px] rounded-full flex-shrink-0" />

              <div className="col-span-4 h-full gap-3 items-start py-4">
                <Skeleton className="h-8 w-48 m-2" /> {/* Organization name */}
                <Skeleton className="h-4 w-full max-w-xl m-2" />{" "}
                {/* Description line 1 */}
                <Skeleton className="h-4 w-3/4 max-w-xl m-2" />{" "}
                {/* Description line 2 */}
                <div className="flex flex-row w-1/3 gap-2 items-center pt-4">
                  <Skeleton className="w-4 h-4" /> {/* Location icon */}
                  <Skeleton className="h-4 w-32" /> {/* Location text */}
                </div>
              </div>

              <div className="col-span-1 gap-4 align-start h-full">
                <Skeleton className="h-9 w-40 rounded-lg" />{" "}
                {/* Action button */}
              </div>
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="my-6 w-full">
            {/* Tab list */}
            <Skeleton className="h-10 w-full mb-6 rounded-lg" />

            {/* Tab content - Events section */}
            <div className="mt-6">
              <div className="flex flex-row justify-between mb-4">
                <Skeleton className="h-6 w-24" /> {/* Section title */}
                <Skeleton className="h-8 w-8 rounded-full" /> {/* Add button */}
              </div>

              {/* Events grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="border rounded-lg overflow-hidden flex flex-col h-full"
                  >
                    <Skeleton className="w-full h-40" /> {/* Event image */}
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />{" "}
                      {/* Event title */}
                      <Skeleton className="h-4 w-full mb-4" />{" "}
                      {/* Event description */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-4 h-4 rounded-full" />{" "}
                          {/* Icon */}
                          <Skeleton className="h-4 w-32" /> {/* Date */}
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-4 h-4 rounded-full" />{" "}
                          {/* Icon */}
                          <Skeleton className="h-4 w-24" /> {/* Time */}
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-4 h-4 rounded-full" />{" "}
                          {/* Icon */}
                          <Skeleton className="h-4 w-40" /> {/* Location */}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-t mt-auto">
                      <Skeleton className="h-5 w-20 rounded-md" />{" "}
                      {/* Status */}
                    </div>
                  </div>
                ))}
              </div>
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
  SkeletonOrganizationProfile,
};
