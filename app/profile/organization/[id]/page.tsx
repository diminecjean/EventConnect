"use client";
import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import type { OrganizationProfile } from "../../../typings/profile/typings";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASE_URL } from "@/app/api/constants";
import { useAuth } from "@/app/context/authContext";

const OrgPageTabs = ({
  canEditOrg,
  orgId,
  orgName,
}: {
  canEditOrg?: boolean;
  orgId: string;
  orgName: string;
}) => {
  const router = useRouter();

  const handleCreateEvent = () => {
    router.push(`/events/new?orgId=${orgId}&&orgName=${orgName}`);
  };

  return (
    <Tabs
      defaultValue={canEditOrg ? "stats" : "events"}
      className="my-6 w-full min-w-xl"
    >
      <TabsList
        className={`grid w-full ${canEditOrg ? "grid-cols-5" : "grid-cols-4"}`}
      >
        {canEditOrg && <TabsTrigger value="stats">Stats</TabsTrigger>}
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="partners">Partners</TabsTrigger>
        <TabsTrigger value="pictures">Pictures</TabsTrigger>
      </TabsList>
      {canEditOrg && (
        <TabsContent value="stats">
          <div>
            <h1 className="font-semibold text-xl my-4">Stats</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
          </div>
        </TabsContent>
      )}
      <TabsContent value="events">
        <div>
          <div id="header" className="flex flex-row justify-between">
            <h1 className="font-semibold text-xl my-4">Events</h1>
            {canEditOrg && (
              <Button
                variant="outline_violet"
                className="rounded-full text-violet-500 font-semibold"
                onClick={handleCreateEvent}
              >
                +
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        </div>
      </TabsContent>
      <TabsContent value="team">
        <div>
          <h1 className="font-semibold text-xl my-4">Team</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        </div>
      </TabsContent>
      <TabsContent value="partners">
        <div>
          <h1 className="font-semibold text-xl my-4">Partners</h1>
        </div>
      </TabsContent>
      <TabsContent value="pictures">
        <div>
          <h1 className="font-semibold text-xl my-4">Pictures</h1>
          {canEditOrg && (
            <Button
              variant="outline_violet"
              className="rounded-lg text-violet-500 font-semibold"
            >
              Upload Pictures
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

const OrganizationProfile = ({
  orgData,
  canEditOrg,
  isSubscribed,
}: {
  orgData: OrganizationProfile;
  canEditOrg?: boolean;
  isSubscribed?: boolean;
}) => {
  return (
    <>
      <div className="w-full bg-violet-800 h-64 rounded-lg flex justify-center align-center items-center">
        Organization Banner
      </div>
      <div className="flex flex-row p-4">
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row gap-8 justify-start">
              <Image
                src={"/notionai.svg"}
                alt={"orgLogo"}
                width={150}
                height={150}
                className="rounded-full"
              />
              <div className="flex flex-col h-full gap-3 items-start py-4">
                <h1 className="font-semibold text-2xl">{orgData.name}</h1>
                <p className="font-normal text-md">{orgData.description}</p>
                <p className="font-light text-sm flex flex-row gap-2 items-center text-stone-400 pt-4">
                  <MapPin size={16} /> {orgData.location}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 align-start h-full">
              <Button
                variant="outline_violet"
                className="rounded-lg text-violet-500 font-semibold"
              >
                {canEditOrg
                  ? "Edit Organization"
                  : isSubscribed
                    ? "Subscribed"
                    : "Subscribe"}
              </Button>
            </div>
          </div>
          <OrgPageTabs
            canEditOrg={canEditOrg}
            orgId={orgData._id}
            orgName={orgData.name}
          />
        </div>
        <div className="flex flex-col"></div>
      </div>
    </>
  );
};

export default function OrganizationPage() {
  const params = useParams();
  const id = params.id as string;
  const [org, setOrg] = useState<OrganizationProfile | null>(null);
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

    fetchOrganization();
  }, [id, user, organizations]);

  if (isLoading) {
    return (
      <main className="w-full mt-20 flex flex-col gap-4 items-center justify-center">
        <p>Loading organization details...</p>
      </main>
    );
  }

  if (!org) return notFound();

  return (
    <main className="w-full mt-20 flex flex-col gap-4">
      <OrganizationProfile orgData={org} canEditOrg={canEditOrg} />
    </main>
  );
}
