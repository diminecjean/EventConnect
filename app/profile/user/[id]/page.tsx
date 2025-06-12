"use client";
import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import type { UserProfile } from "../../../typings/profile/typings";
import { BASE_URL } from "@/app/api/constants";
import Link from "next/link";
import OrganizationsList from "./getOrganizations";
import { formatSingleDate } from "@/app/utils/formatDate";
import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  Joystick,
  LucideHeartHandshake,
  Mail,
  User,
} from "lucide-react";
import { useAuth } from "@/app/context/authContext";
import BadgesList from "./getBadges";
import AttendedEventsList from "./getAttendedEvents";
import { SkeletonUserProfile } from "@/components/ui/skeleton";
import SocialMediaLinks from "../../SocialMediaLinks";

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

  // Check if the user has any social media links
  const hasSocialMedia = user.socialMedia;

  return (
    <main className="p-4 md:p-6 mt-16 md:mt-20 mx-16">
      {/* Container to ensure proper stacking */}
      <div className="relative">
        {/* Profile Header Area - Cover photo style with overlay */}
        <div className="relative bg-gradient-to-r from-violet-600 to-indigo-800 h-48 rounded-t-xl overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Action buttons for editing */}
          {canEdit && (
            <div className="absolute top-6 right-6 flex gap-2 z-10">
              <Link
                href={`/profile/user/${id}/connections`}
                className="text-sm px-4 py-2 bg-white/90 text-violet-900 font-medium rounded-md hover:bg-white transition shadow-md"
              >
                View Connections
              </Link>
              <Link
                href={`/profile/user/${id}/edit`}
                className="text-sm px-4 py-2 bg-violet-500/90 text-white font-medium rounded-md hover:bg-violet-600 transition shadow-md"
              >
                Edit Profile
              </Link>
            </div>
          )}
        </div>

        {/* Profile picture - positioned to overlap the header and body sections */}
        <div className="absolute top-16 left-8 z-20">
          {user.profilePicture ? (
            <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden">
              <Image
                src={user.profilePicture}
                alt={`${user.name}'s profile picture`}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-40 h-40 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center shadow-lg">
              <User size={48} className="text-gray-500" />
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="relative z-10 bg-black/60 border-2 border-stone-500 rounded-b-xl shadow-md pt-16 pb-8 px-8 mt-[-1px]">
          {/* User info section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                {user.name}
              </h1>

              <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                {user.position && (
                  <>
                    <BriefcaseBusiness size={16} className="text-violet-400" />
                    <span>{user.position}</span>
                    {user.organization && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span>{user.organization}</span>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-sm text-gray-400 mt-2">
                <div className="flex items-center gap-1">
                  <Mail size={14} className="text-violet-400" />
                  <p>{user.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} className="text-violet-400" />
                  <p>Joined {formattedDateCreatedAt}</p>
                </div>
              </div>
            </div>

            {/* Social media links - moved to the right side on desktop */}
            <div className="mt-4 md:mt-0">
              <SocialMediaLinks socialMedia={user.socialMedia} />
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6 border-stone-700" />

          {/* Content grid - Two column layout on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - About and Interests */}
            <div className="md:col-span-1">
              {/* Bio */}
              {user.bio && (
                <div className="mb-8 bg-stone-900/50 p-4 rounded-lg shadow-inner border border-stone-800">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <User size={18} className="text-violet-400" />
                    About
                  </h2>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}

              {/* Interests */}
              {user.interests && user.interests.length > 0 && (
                <div className="mb-8 bg-stone-900/50 p-4 rounded-lg shadow-inner border border-stone-800">
                  <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                    <LucideHeartHandshake
                      size={18}
                      className="text-violet-400"
                    />
                    Interests
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-violet-900/60 text-violet-100 px-3 py-1.5 rounded-full text-xs font-medium border border-violet-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizations involved */}
              {user.organizations && user.organizations.length > 0 && (
                <div className="mb-8 bg-stone-900/50 p-4 rounded-lg shadow-inner border border-stone-800">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Building2 size={18} className="text-violet-400" />
                    Organizations
                  </h2>
                  <OrganizationsList organizationIds={user.organizations} />
                </div>
              )}
            </div>

            {/* Right column - Badges and Events */}
            <div className="md:col-span-2">
              {/* Badges with visual distinction */}
              <div className="mb-8 bg-gradient-to-br from-stone-900/70 to-stone-900/30 p-6 rounded-lg shadow-md border border-stone-700">
                <BadgesList canEdit={canEdit} />
              </div>

              {/* Events Attended with improved styling */}
              <div className="bg-stone-900/50 p-6 rounded-lg shadow-inner border border-stone-800">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-violet-400" />
                  Events Attended
                </h2>
                <AttendedEventsList userId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
