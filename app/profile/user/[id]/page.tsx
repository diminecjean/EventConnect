import { notFound } from "next/navigation";
import Image from "next/image";
import type { UserProfile } from "../../../typings/profile/typings";
import { BASE_URL } from "@/app/api/constants";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import OrganizationsList from "./getOrganizations";
import { formatSingleDate } from "@/app/utils/formatDate";
import { Calendar, Mail } from "lucide-react";

async function getUserProfile(id: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/users/${id}`, {
      cache: "no-store", // Ensure we get fresh data
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const res = await response.json();
    return res.user;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
}

// export async function generateMetadata({ params }: { params: { id: string } }) {
//   const id = await params.id;
//   const user = await getUserProfile(id);

//   if (!user) return { title: "User Not Found" };
//   return {
//     title: `${user.name} - Profile | EventConnect`,
//     description: user.bio || `${user.name}'s profile on EventConnect`,
//   };
// }

export default async function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const user = await getUserProfile(id);

  if (!user) return notFound();

  const formattedDateCreatedAt = formatSingleDate(user.createdAt);

  console.log("page", { user });
  return (
    <main className="p-6 max-w-3xl mx-auto mt-20">
      <div className="border-2 border-stone-500 shadow-md rounded-lg overflow-hidden bg-black/60">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="flex shrink-0">
              {user.profilePicture ? (
                <div className="flex shrink-0 w-[120px] h-[120px] rounded-full overflow-hidden border-stone-500 border-2">
                  <Image
                    src={user.profilePicture}
                    alt={`${user.name}'s profile picture`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-[120px] h-[120px] rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">
                    {user.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-row items-center justify-between gap-2">
                <h1 className="text-2xl font-bold py-1">{user.name}</h1>
                <div className="flex justify-center md:justify-start">
                  <Link
                    href={`/profile/user/${id}/edit`}
                    className="text-sm px-4 py-1 border-2 border-violet-400 text-white rounded-md hover:bg-violet-700 transition"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400">
                <Mail size={16} />
                <p>{user.email}</p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400 mt-1">
                <Calendar size={16} />
                <p>Joined in {formattedDateCreatedAt}</p>
              </div>

              {/* Badges */}
              {user.badgesEarned && user.badgesEarned.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                  {user.badgesEarned.map((badge, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 capitalize"
                    >
                      {badge.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-sm text-gray-300">{user.bio}</p>
            </div>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Events Attended */}
          {user.eventsAttended && user.eventsAttended.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Events Attended</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.eventsAttended.map((eventId, index) => (
                  <Link
                    key={index}
                    href={`/events/${eventId}`}
                    className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
                  >
                    Event {index + 1}{" "}
                    {/* Replace with actual event name when available */}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Organizations involved */}
          {user.organizations && user.organizations.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">
                Organizations Involved
              </h2>
              <OrganizationsList organizationIds={user.organizations} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
