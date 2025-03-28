import { notFound } from "next/navigation";
import organizationsData from "@/data/organizationData.json";
import type { OrganizationProfile } from "../../../typings/profile/typings";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USER_ROLE } from "@/app/typings/profile/typings";
import { BASE_URL } from "@/app/api/constants";

const userRole = USER_ROLE.PARTICIPANT; // Manually define current role here for testing.

async function getOrganizationProfile(id: string): Promise<OrganizationProfile | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/organizations/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch organization data');
    }

    const res = await response.json();

    return res.organization;
  } catch (error) {
    console.error("Error fetching organization ID:", error);
    return null;
  }
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

const OrgPageTabs = ({ userRole }: { userRole?: string }) => {
  return (
    <Tabs defaultValue="timeline" className="my-6 w-full min-w-xl">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="partners">Partners</TabsTrigger>
        <TabsTrigger value="pictures">Pictures</TabsTrigger>
      </TabsList>
      <TabsContent value="events">
        <div>
          <h1 className="font-semibold text-xl my-4">Events</h1>
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
          {userRole === USER_ROLE.ORGANIZER && (
            <Button variant="outline" className="mb-4">
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
  userRole,
  isSubscribed,
}: {
  orgData: OrganizationProfile;
  userRole?: string;
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
                {userRole === USER_ROLE.ORGANIZER
                  ? "Edit Organization"
                  : isSubscribed
                    ? "Subscribed"
                    : "Subscribe"}
              </Button>
            </div>
          </div>
          <OrgPageTabs userRole={userRole} />
        </div>
        <div className="flex flex-col"></div>
      </div>
    </>
  );
};

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = await getOrganizationProfile(id);

  if (!org) return notFound();

  return (
    <main className="w-full mt-20 flex flex-col gap-4">
      <OrganizationProfile orgData={org} userRole={userRole} />
    </main>
  );
}
