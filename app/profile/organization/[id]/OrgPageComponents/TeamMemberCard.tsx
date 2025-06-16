import { UserProfile } from "@/app/typings/profile/typings";
import { Card, CardContent } from "@/components/ui/card";

import { useRouter } from "next/navigation";

interface TeamMemberCardProps {
  member: UserProfile;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  //   const joinDate = member.joinDate ? new Date(member.joinDate) : new Date();
  //   const memberSince = formatDistanceToNow(joinDate, { addSuffix: true });
  const router = useRouter();
  return (
    <Card
      onClick={() => {
        router.push(`/profile/user/${member._id}`);
      }}
      className="overflow-hidden border border-gray-800 bg-black/40 hover:bg-black/60 transition-colors"
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <img
              src={member.profilePicture || "/default-avatar.png"}
              alt={member.name || "Team member"}
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{member.name}</h3>
            {member.bio && (
              <p className="text-sm text-gray-300 line-clamp-2">{member.bio}</p>
            )}
            {/* <p className="text-xs text-gray-400 mt-1">Member {memberSince}</p> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
