"use client";
import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import type { UserProfile } from "../../../typings/profile/typings";
import { BASE_URL } from "@/app/api/constants";
import Link from "next/link";
import OrganizationsList from "./getOrganizations";
import { formatSingleDate } from "@/app/utils/formatDate";
import { BriefcaseBusiness, Building2, Calendar, Mail } from "lucide-react";
import { useAuth } from "@/app/context/authContext";
import BadgesList from "./getBadges";
import AttendedEventsList from "./getAttendedEvents";
import { SkeletonUserProfile } from "@/components/ui/skeleton";

export default function UserProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    async function getUserProfile() {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/api/users/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const res = await response.json();
        setUser(res.user);

        // Check if current user is viewing their own profile
        if (currentUser && currentUser._id === id) {
          setCanEdit(true);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    getUserProfile();
  }, [id, currentUser]);

  if (isLoading) {
    return <SkeletonUserProfile />;
  }

  if (!user) return notFound();

  const formattedDateCreatedAt = formatSingleDate(user.createdAt);

  return (
    <main className="p-6 max-w-3xl mx-auto mt-20">
      <div className="border-2 border-stone-500 shadow-md rounded-lg overflow-hidden bg-black/60">
        <div className="p-6">
          {/* Profile section - keep existing code */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="flex shrink-0">
              {/* Keep existing profile picture code */}
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
              {/* Keep existing user info code */}
              <div className="flex flex-row items-center justify-between gap-2">
                <h1 className="text-2xl font-bold py-1">{user.name}</h1>
                {canEdit && (
                  <div className="flex flex-row items-center justify-center md:justify-start gap-2">
                    <Link
                      href={`/profile/user/${id}/connections`}
                      className="text-sm px-4 py-1 bg-violet-400 border-2 border-violet-400 text-black rounded-md hover:bg-violet-800 hover:text-white transition"
                    >
                      View Connections
                    </Link>
                    <Link
                      href={`/profile/user/${id}/edit`}
                      className="text-sm px-4 py-1 border-2 border-violet-400 text-white rounded-md hover:bg-violet-700 transition"
                    >
                      Edit Profile
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-gray-400">
                <Mail size={12} />
                <p>{user.email}</p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-gray-400 mt-1">
                <Calendar size={12} />
                <p>Joined in {formattedDateCreatedAt}</p>
              </div>
              {user.position && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-gray-400 mt-1">
                  <BriefcaseBusiness size={12} />
                  <p>{user.position}</p>
                </div>
              )}
              {user.organization && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-gray-400 mt-1">
                  <Building2 size={12} />
                  <p>{user.organization}</p>
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

          {/* Badges */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Badges</h2>
            <BadgesList />
          </div>

          {/* Events Attended - now using the new component */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Events Attended</h2>
            <AttendedEventsList userId={id} />
          </div>

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
