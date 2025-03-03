import { notFound } from "next/navigation";
import organizationsData from "@/data/organizationData.json";
import type { OrganizationProfile } from "../../../../typings/profile/typings";

async function getOrganizationProfile(
  id: string,
): Promise<OrganizationProfile | null> {
  return organizationsData.find((org) => org.id === id) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = await getOrganizationProfile(id);

  if (!org) return { title: "Organization Not Found" };
  return {
    title: `${org.name} - Organization Details`,
    description: org.description,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = await getOrganizationProfile(id);

  if (!org) return notFound();

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{org.name}</h1>
      <p className="text-gray-600">
        {org.members_count} Members <br />
        {org.contact_email}
      </p>
      <p className="mt-4">{org.description}</p>
      <ul className="mt-4 list-disc list-inside">
        {org.tags.map((tag, index) => (
          <li key={index}>{tag}</li>
        ))}
      </ul>
    </main>
  );
}
