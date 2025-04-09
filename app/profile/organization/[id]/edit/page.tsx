"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import OrganizationProfileForm from "./organizationProfileForm";
import { BASE_URL } from "@/app/api/constants";
import { OrganizationProfileFormValues } from "./schemas";

export default function EditOrganizationProfilePage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [orgData, setOrgData] =
    useState<Partial<OrganizationProfileFormValues> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizationProfile() {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/api/organizations/${orgId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch organization data");
        }

        const res = await response.json();

        // Format organization data for the form
        const formattedOrgData: Partial<OrganizationProfileFormValues> = {
          name: res.organization.name,
          description: res.organization.description || "",
          location: res.organization.location || "",
          logo: res.organization.logo || "",
          banner: res.organization.banner || "",
          website: res.organization.website || "",
          contactEmail: res.organization.contactEmail || "",
          socialLinks: res.organization.socialLinks || {},
        };

        setOrgData(formattedOrgData);
      } catch (error) {
        console.error("Error fetching organization:", error);
        setError("Failed to load organization data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (orgId) {
      fetchOrganizationProfile();
    }
  }, [orgId]);

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
      <OrganizationProfileForm orgId={orgId} defaultValues={orgData || {}} />
    </main>
  );
}
