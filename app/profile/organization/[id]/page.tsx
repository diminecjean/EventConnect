"use client";
import { useCallback, useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import type {
  OrganizationProfile,
  UserProfile,
} from "../../../typings/profile/typings";

import Image from "next/image";
import { MapPin, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASE_URL } from "@/app/api/constants";
import { useAuth } from "@/app/context/authContext";
import { Event } from "@/app/typings/events/typings";
import OrgEventCard from "./OrgEventCard";
import TeamMemberCard from "./TeamMemberCard";
import AddTeamMembersModal from "./AddTeamMemberModal";
import { SubscribeButton } from "./SubscribeButton";
import OrganizationStats from "./OrganizationStats";
import EventStats from "./EventStats";
import EventStatCard from "./EventStatCard";

function TeamMembers({ orgId }: { orgId: string }) {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/organizations/${orgId}/team`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();
      setMembers(data.teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No team members found for this organization.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {members.map((member) => (
        <TeamMemberCard key={member._id} member={member} />
      ))}
    </div>
  );
}

const OrgPageTabs = ({
  canEditOrg,
  orgId,
  orgName,
  events,
  partneredEvents,
}: {
  canEditOrg?: boolean;
  orgId: string;
  orgName: string;
  events: Event[];
  partneredEvents: Event[];
}) => {
  const router = useRouter();
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [teamMembersKey, setTeamMembersKey] = useState(Date.now()); // Key to force re-render

  const handleCreateEvent = () => {
    router.push(`/events/new?orgId=${orgId}&&orgName=${orgName}`);
  };

  const refreshTeamMembers = () => {
    // This will force the TeamMembers component to re-fetch
    setTeamMembersKey(Date.now());
  };

  return (
    <>
      <Tabs defaultValue="events" className="my-6 w-full min-w-xl">
        <TabsList
          className={`grid w-full ${canEditOrg ? "grid-cols-5" : "grid-cols-4"}`}
        >
          <TabsTrigger value="events">Events</TabsTrigger>
          {canEditOrg && <TabsTrigger value="stats">Stats</TabsTrigger>}
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="pictures">Pictures</TabsTrigger>
        </TabsList>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events && events.length > 0 ? (
                events.map((event) => (
                  <OrgEventCard
                    key={event._id}
                    event={event}
                    canEditOrg={canEditOrg}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  No events found for this organization.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        {canEditOrg && (
          <TabsContent value="stats">
            <div>
              <h1 className="font-semibold text-xl my-4">Stats</h1>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold mb-4">
                    Organization Statistics
                  </h2>
                  <OrganizationStats organizationId={orgId} />
                </div>

                <div className="p-4 border rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold mb-4">Event Statistics</h2>
                  {events && events.length > 0 ? (
                    <div className="space-y-4 flex flex-col">
                      {events.map((event) => (
                        <EventStatCard key={event._id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No events found for this organization.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        )}
        <TabsContent value="team">
          <div>
            <div className="flex flex-row justify-between items-center">
              <h1 className="font-semibold text-xl my-4">Team</h1>
              {canEditOrg && (
                <Button
                  variant="outline_violet"
                  className="rounded-lg text-violet-500 font-semibold"
                  onClick={() => setIsAddTeamModalOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
                </Button>
              )}
            </div>

            <TeamMembers key={teamMembersKey} orgId={orgId} />
          </div>
        </TabsContent>
        <TabsContent value="partners">
          <div>
            <div id="header" className="flex flex-row justify-between">
              <h1 className="font-semibold text-xl my-4">Partnered Events</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partneredEvents && partneredEvents.length > 0 ? (
                partneredEvents.map((event) => (
                  <OrgEventCard key={event._id} event={event} />
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  No partnered events found for this organization.
                </div>
              )}
            </div>
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

      <AddTeamMembersModal
        isOpen={isAddTeamModalOpen}
        onOpenChange={setIsAddTeamModalOpen}
        orgId={orgId}
        onSuccess={refreshTeamMembers}
      />
    </>
  );
};

const OrganizationProfile = ({
  orgData,
  canEditOrg,
  isSubscribed,
  events,
  partneredEvents,
}: {
  orgData: OrganizationProfile;
  canEditOrg?: boolean;
  isSubscribed?: boolean;
  events: Event[];
  partneredEvents: Event[];
}) => {
  const router = useRouter();
  return (
    <>
      <div className="relative w-full h-64 overflow-hidden rounded-lg bg-violet-800">
        <Image
          className="object-cover"
          src={orgData.banner || "/default-banner.jpg"}
          alt={orgData.name + " banner"}
          fill
          sizes="100vw"
          priority
        />
      </div>
      <div className="flex flex-row p-4">
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-center justify-between rounded-lg bg-black/60">
            <div className="flex flex-row gap-8 justify-start">
              <div className="w-[150px] h-[150px] relative overflow-hidden rounded-full border-2 border-stone-500 flex-shrink-0">
                <Image
                  src={orgData.logo || "/default-logo.jpg"}
                  alt={"orgLogo"}
                  fill
                  sizes="150px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col h-full gap-3 items-start py-4">
                <h1 className="font-semibold text-2xl">{orgData.name}</h1>
                <p className="font-normal text-md">{orgData.description}</p>
                <p className="font-light text-sm flex flex-row gap-2 items-center text-stone-400 pt-4">
                  <MapPin size={16} /> {orgData.location}
                </p>
              </div>
              <div className="flex flex-col gap-4 align-start h-full">
                {canEditOrg ? (
                  <Button
                    variant="outline_violet"
                    className="rounded-lg text-violet-500 font-semibold"
                    onClick={() => {
                      if (canEditOrg)
                        router.push(
                          `/profile/organization/${orgData._id}/edit`,
                        );
                    }}
                  >
                    Edit Organization
                  </Button>
                ) : (
                  <SubscribeButton
                    organizationId={orgData._id}
                    organizationName={orgData.name}
                  />
                )}
              </div>
            </div>
          </div>
          <OrgPageTabs
            canEditOrg={canEditOrg}
            orgId={orgData._id}
            orgName={orgData.name}
            events={events}
            partneredEvents={partneredEvents}
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
        console.log(res.events);
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
        console.log(res.events);
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
    return (
      // <main className="w-full mt-20 flex flex-col gap-4 items-center justify-center">
      //   <p>Loading organization details...</p>
      // </main>
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!org) return notFound();

  return (
    <main className="w-full mt-20 flex flex-col gap-4">
      <OrganizationProfile
        orgData={org}
        canEditOrg={canEditOrg}
        events={events}
        partneredEvents={partneredEvents}
      />
    </main>
  );
}
