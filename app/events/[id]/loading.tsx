import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";

const loadingStates = [
  {
    text: "Getting Events",
  },
  {
    text: "Finding Speakers",
  },
  {
    text: "Gathering Attendees",
  },
];

export default function MultiStepLoaderDemo() {
  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      {/* Core Loader Modal */}
      {/* <Loader loadingStates={loadingStates} loading={true} duration={2000} /> */}
      Loading Event ...
    </div>
  );
}

export function Loading() {
  return (
    <div className="p-6 max-w-2xl mx-auto animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
    </div>
  );
}
