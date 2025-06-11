"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import UserProfileForm from "./userProfileForm";
import { BASE_URL } from "@/app/api/constants";
import { UserProfileFormValues } from "./userFormComponents/schemas";

export default function EditUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] =
    useState<Partial<UserProfileFormValues> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/api/users/${userId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const res = await response.json();

        // Format user data for the form
        const formattedUserData: Partial<UserProfileFormValues> = {
          name: res.user.name,
          bio: res.user.bio || "",
          organization: res.user.organization || "",
          position: res.user.position || "",
          socialMedia: res.user.socialMedia || {},
          profilePicture: res.user.profilePicture || "",
          interests: Array.isArray(res.user.interests)
            ? res.user.interests
            : [],
        };

        setUserData(formattedUserData);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="mt-2">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <main className="w-full mt-20 flex flex-col gap-4">
      <UserProfileForm userId={userId} defaultValues={userData || {}} />
    </main>
  );
}
