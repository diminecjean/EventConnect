import { notFound } from "next/navigation";
import usersData from "@/data/userData.json";
import type { UserProfile } from "../../../typings/profile/typings";
import { BASE_URL } from "@/app/api/constants";

async function getUserProfile(id: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/users/${id}`);
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserProfile(id);

  if (!user) return { title: "User Not Found" };
  return {
    title: `${user.name} - User Details`,
    bio: user.bio,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserProfile(id);

  if (!user) return notFound();

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-gray-600">{user.email}</p>
      <p className="mt-4">{user.bio}</p>
      <ul className="mt-4 list-disc list-inside">
        {user.events_attended.map((event, index) => (
          <li key={index}>{event}</li>
        ))}
      </ul>
    </main>
  );
}
