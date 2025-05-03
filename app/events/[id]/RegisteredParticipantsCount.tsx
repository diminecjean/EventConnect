import React, { useEffect, useState } from "react";
import { BASE_URL } from "@/app/api/constants";
import { Users } from "lucide-react";
import RegisteredAttendeesList from "./RegisteredAttendeesList";

interface RegisteredParticipantsCountProps {
  eventId: string;
}

const RegisteredParticipantsCount: React.FC<
  RegisteredParticipantsCountProps
> = ({ eventId }) => {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrationsCount = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${BASE_URL}/api/registrations?eventId=${eventId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch registration count");
        }

        const data = await response.json();
        setCount(data.count);
      } catch (err) {
        // console.error("Error fetching registration count:", err);
        setError("Could not load participant count");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrationsCount();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Users size={20} />
        <span>Loading participants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-violet-900 bg-opacity-20 p-3 rounded-lg animate-pulse">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-violet-500" />
          <div className="h-4 w-32 bg-violet-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <RegisteredAttendeesList
      eventId={eventId}
      trigger={
        <div className="bg-violet-900 bg-opacity-10 p-3 rounded-lg cursor-pointer hover:bg-opacity-20 transition-colors">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-500" />
            <span className="font-medium">
              {count} {count === 1 ? "person" : "people"} registered
            </span>
          </div>
        </div>
      }
    />
    // <div className="flex items-center gap-2 text-sm">
    //   <Users size={20} className="text-violet-500" />
    //   <span>
    //     <span className="font-semibold">{count}</span>{" "}
    //     {count === 1 ? "participant" : "participants"} registered
    //   </span>
    // </div>
  );
};

export default RegisteredParticipantsCount;
