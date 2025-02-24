import { notFound } from "next/navigation";
import usersData from "@/data/userData.json";
import type { UserProfile } from "../../typings";

async function getOrganizationProfile(id: string): Promise<UserProfile | null> {
  return usersData.find((user) => user.id === id) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getOrganizationProfile(id);

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
  const user = await getOrganizationProfile(id);

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
