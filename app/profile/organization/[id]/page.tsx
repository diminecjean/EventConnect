"use client";
import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { OrganizationProfile } from "../../../typings/profile/typings";
import { Event } from "@/app/typings/events/typings";
import { BASE_URL } from "@/app/api/constants";
import { useAuth } from "@/app/context/authContext";
import { SkeletonOrganizationProfile } from "@/components/ui/skeleton";
import OrganizationProfileHeader from "./OrgPageComponents/OrganizationProfileHeader";
import OrganizationTabs from "./OrgPageComponents/OrganizationTabs";

export default function OrganizationPage() {
  const params = useParams();
  const id = params.id as string;
  const [org, setOrg] = useState<OrganizationProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [partneredEvents, setPartneredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, organizations } = useAuth();
  const [canEditOrg, setCanEditOrg] = useState(false);

  useEffect(() => {
    async function fetchOrganization() {
      try {
        const response = await fetch(`${BASE_URL}/api/organizations/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch organization data");
        }
        const res = await response.json();
        setOrg(res.organization);

        // Check if user can edit this specific organization
        if (user && organizations) {
          // Check if this organization ID is in the user's organizations list
          const userCanEdit = organizations.some((org) => org._id === id);
          setCanEditOrg(userCanEdit);
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
        setOrg(null);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchEvents() {
      try {
        const response = await fetch(
          `${BASE_URL}/api/events?organizationId=${id}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const res = await response.json();
        setEvents(res.events);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    async function fetchPartneredEvents() {
      try {
        const response = await fetch(
          `${BASE_URL}/api/events?partnerOrganizations=${id}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch partner events");
        }
        const res = await response.json();
        setPartneredEvents(res.events);
      } catch (error) {
        console.error("Error fetching partner events:", error);
      }
    }

    fetchOrganization();
    fetchEvents();
    fetchPartneredEvents();
  }, [id, user, organizations]);

  if (isLoading) {
    return <SkeletonOrganizationProfile />;
  }

  if (!org) return notFound();

  return (
    <main className="w-full mt-20 flex flex-col gap-4">
      <OrganizationProfileHeader orgData={org} canEditOrg={canEditOrg} />
      <OrganizationTabs
        canEditOrg={canEditOrg}
        orgId={org._id}
        orgName={org.name}
        events={events}
        partneredEvents={partneredEvents}
      />
    </main>
  );
}
