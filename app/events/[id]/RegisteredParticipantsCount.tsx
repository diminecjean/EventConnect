import React, { useEffect, useState } from "react";
import { BASE_URL } from "@/app/api/constants";
import { Users } from "lucide-react";

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
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Users size={20} />
        <span>-</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Users size={20} className="text-violet-500" />
      <span>
        <span className="font-semibold">{count}</span>{" "}
        {count === 1 ? "participant" : "participants"} registered
      </span>
    </div>
  );
};

export default RegisteredParticipantsCount;
