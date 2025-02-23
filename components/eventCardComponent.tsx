"use client";
import * as React from "react";
import Image from "next/image";
import { CalendarDays, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Types for the component props
type Tag = {
  label: string;
  color: string;
};

type EventCardProps = {
  eventLogo: {
    src: string;
    alt: string;
  };
  host: {
    logo: string;
    name: string;
  };
  title: string;
  href: string;
  tags: Tag[];
  date: {
    fullDate: string;
    time: string;
  };
  location: string;
  description: {
    preview: string;
    details: string[];
  };
};

export default function EventCard({
  eventLogo,
  host,
  title,
  href,
  tags,
  date,
  location,
  description,
}: EventCardProps) {
  const [isExpandDesc, setIsExpandDesc] = React.useState(false);

  return (
    <Card>
      <div className="flex flex-col md:flex-row items-start justify-between p-4">
        <div className="flex flex-col space-y-1.5 min-w-5xl gap-2">
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] saturate-0 brightness-0 dark:saturate-100 dark:brightness-100"
            src={eventLogo.src}
            alt={eventLogo.alt}
            width={200}
            height={37}
            priority
          />
          <div className="flex flex-row border rounded-lg border-gray-300 p-2 gap-1 items-center">
            <div>
              <Image
                className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] saturate-0 brightness-0 dark:saturate-100 dark:brightness-100"
                src={host.logo}
                alt={`${host.name} Logo`}
                width={32}
                height={24}
              />
            </div>
            <div className="flex flex-col pl-1">
              <div className="text-xs font-light">Hosted by</div>
              <div className="text-xs font-medium line-clamp-1">
                {host.name}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <CardHeader>
            <CardTitle>
              <a href={href} className="hover:underline">
                {title}
              </a>
            </CardTitle>
            <div className="flex flex-row space-x-2">
              {tags.map((tag, index) => (
                <div key={index} className={`px-2 ${tag.color} rounded-md`}>
                  <span className="text-xs text-gray-800">{tag.label}</span>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row gap-6 my-4">
              <div className="flex flex-row gap-2 max-w-64 items-center">
                <div>
                  <CalendarDays size={24} />
                </div>
                <div className="flex flex-col">
                  <div className="font-medium text-xs">{date.fullDate}</div>
                  <div className="font-light text-xs">{date.time}</div>
                </div>
              </div>
              <div className="flex flex-row gap-2 max-w-64 items-center">
                <div>
                  <MapPin size={24} />
                </div>
                <div className="flex flex-col font-normal text-xs">
                  {location}
                </div>
              </div>
            </div>
            <Collapsible
              open={isExpandDesc}
              onOpenChange={setIsExpandDesc}
              className="w-full max-w-4xl space-y-2 bg-gray-100 bg-opacity-10 rounded-md p-4"
            >
              <div className="flex items-start justify-between space-x-4 text-xs text-gray-200">
                <h4 className={`${!isExpandDesc ? "line-clamp-2" : ""}`}>
                  {description.preview}
                </h4>
                <CollapsibleTrigger className="p-1">
                  {isExpandDesc ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="text-xs text-gray-200">
                <p>
                  <br />
                  {description.details.map((detail, index) => (
                    <React.Fragment key={index}>
                      {detail}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
