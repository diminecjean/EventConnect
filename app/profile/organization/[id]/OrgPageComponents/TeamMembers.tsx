import { useCallback, useEffect, useState } from "react";
import { UserProfile } from "@/app/typings/profile/typings";
import { BASE_URL } from "@/app/api/constants";
import { SkeletonUserCardHorziontal } from "@/components/ui/skeleton";
import TeamMemberCard from "../OrgPageComponents/TeamMemberCard";

interface TeamMembersProps {
  orgId: string;
}

export default function TeamMembers({ orgId }: TeamMembersProps) {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/organizations/${orgId}/team`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();
      setMembers(data.teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  if (isLoading) {
    return <SkeletonUserCardHorziontal />;
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No team members found for this organization.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {members.map((member) => (
        <TeamMemberCard key={member._id} member={member} />
      ))}
    </div>
  );
}
