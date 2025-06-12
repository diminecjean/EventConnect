import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event } from "@/app/typings/events/typings";
import TeamMembers from "./TeamMembers";
import OrgEventCard from "../OrgPageComponents/OrgEventCard";
import AddTeamMembersModal from "../OrgPageComponents/AddTeamMemberModal";
import OrganizationStats from "../StatsComponents/OrganizationStats";
import EventStatCard from "../StatsComponents/EventStatCard";
import PictureGallery from "../OrgPageComponents/PictureGallery";
import OrganizationPictureUploader from "../OrgPageComponents/OrganizationPictureUploader";

interface OrganizationTabsProps {
  canEditOrg?: boolean;
  orgId: string;
  orgName: string;
  events: Event[];
  partneredEvents: Event[];
}

export default function OrganizationTabs({
  canEditOrg,
  orgId,
  orgName,
  events,
  partneredEvents,
}: OrganizationTabsProps) {
  const router = useRouter();
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [teamMembersKey, setTeamMembersKey] = useState(Date.now()); // Key to force re-render
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [pictureRefreshTrigger, setPictureRefreshTrigger] = useState(0);

  const handlePictureUploadSuccess = () => {
    setPictureRefreshTrigger(Date.now());
  };

  const handleCreateEvent = () => {
    router.push(`/events/new?orgId=${orgId}&&orgName=${orgName}`);
  };

  const refreshTeamMembers = () => {
    // This will force the TeamMembers component to re-fetch
    setTeamMembersKey(Date.now());
  };

  return (
    <div className="p-4">
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

        {/* Events Tab */}
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

        {/* Stats Tab */}
        {canEditOrg && (
          <TabsContent value="stats">
            <div className="space-y-6">
              <div className="p-4 border rounded-lg shadow-sm">
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
          </TabsContent>
        )}

        {/* Team Tab */}
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

        {/* Partners Tab */}
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

        {/* Pictures Tab */}
        <TabsContent value="pictures">
          <div>
            <div className="flex flex-row justify-between items-center">
              <h1 className="font-semibold text-xl my-4">Pictures</h1>
              {canEditOrg && (
                <Button
                  variant="outline_violet"
                  className="rounded-lg text-violet-500 font-semibold"
                  onClick={() => setIsPictureModalOpen(true)}
                >
                  Upload Pictures
                </Button>
              )}
            </div>
            <PictureGallery
              organizationId={orgId}
              canEditOrg={canEditOrg}
              refreshTrigger={pictureRefreshTrigger}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddTeamMembersModal
        isOpen={isAddTeamModalOpen}
        onOpenChange={setIsAddTeamModalOpen}
        orgId={orgId}
        onSuccess={refreshTeamMembers}
      />
      <OrganizationPictureUploader
        isOpen={isPictureModalOpen}
        onOpenChange={setIsPictureModalOpen}
        organizationId={orgId}
        onSuccess={handlePictureUploadSuccess}
      />
    </div>
  );
}
