"use client";
import { useSearchParams } from "next/navigation";
import OrganizationProfileForm from "../[id]/edit/organizationProfileForm";

export default function NewOrganizationPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") as string;

  if (!userId) {
    // Handle case where no organization ID is provided
    return (
      <div className="mt-20 p-8 text-center">
        <h1 className="text-xl font-semibold mb-4">Missing User ID</h1>
        <p>Only registered users can create an organization.</p>
      </div>
    );
  }

  return (
    <main className="w-full mt-20 flex flex-col gap-4">
      <OrganizationProfileForm userId={userId} />
    </main>
  );
}
