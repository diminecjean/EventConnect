import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrganizationProfile } from "@/app/typings/profile/typings";
import { SubscribeButton } from "../OrgPageComponents/SubscribeButton";

interface OrganizationProfileHeaderProps {
  orgData: OrganizationProfile;
  canEditOrg?: boolean;
}

export default function OrganizationProfileHeader({
  orgData,
  canEditOrg,
}: OrganizationProfileHeaderProps) {
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
                      router.push(`/profile/organization/${orgData._id}/edit`);
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
        </div>
      </div>
    </>
  );
}
