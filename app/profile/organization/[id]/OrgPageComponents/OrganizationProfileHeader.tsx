import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrganizationProfile } from "@/app/typings/profile/typings";
import { SubscribeButton } from "./SubscribeButton";
import SocialMediaLinks from "@/app/profile/SocialMediaLinks";
import SubscribersCount from "./SubscriberCount";

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
    <div className="flex flex-col w-full p-4">
      <div className="relative w-full h-64 overflow-hidden rounded-lg ">
        <Image
          className="object-cover"
          src={orgData.banner || "/default-banner.jpg"}
          alt={orgData.name + " banner"}
          fill
          sizes="100vw"
          priority
        />
      </div>
      <div className="flex flex-row p-4 bg-black/30">
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-center justify-between rounded-lg">
            <div className="flex flex-row gap-8 justify-start">
              <div className="w-[200px] h-[200px] relative overflow-hidden rounded-full border-2 border-stone-500 flex-shrink-0 mt-4">
                <Image
                  src={orgData.logo || "/default-logo.jpg"}
                  alt={"orgLogo"}
                  fill
                  sizes="200px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col h-full gap-3 items-start py-4">
                <h1 className="font-semibold text-2xl">{orgData.name}</h1>
                <p className="font-normal text-sm">{orgData.description}</p>
                <div className="flex flex-col gap-2 pt-4">
                  <p className="font-light text-sm flex flex-row gap-2 items-center text-stone-400">
                    <MapPin size={16} /> {orgData.location}
                  </p>
                  <div className="font-light text-sm text-stone-400">
                    <SubscribersCount organizationId={orgData._id} />
                  </div>
                </div>
                <SocialMediaLinks socialMedia={orgData.socialLinks} />
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
    </div>
  );
}
