"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BASE_URL } from "@/app/api/constants";
import { OrganizationProfile } from "@/app/typings/profile/typings";

export default function OrganizationsList({
  organizationIds,
}: {
  organizationIds: string[];
}) {
  const [organizations, setOrganizations] = useState<OrganizationProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const promises = organizationIds.map((id) =>
          fetch(`${BASE_URL}/api/organizations/${id}`)
            .then((res) => res.json())
            .then((data) => data.organization),
        );

        const orgData = await Promise.all(promises);
        setOrganizations(orgData);
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, [organizationIds]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...Array(organizationIds.length)].map((_, i) => (
          <div
            key={i}
            className="p-3 border border-gray-200 rounded-md animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  console.log("Organizations:", { organizations });

  return (
    <div className="grid grid-cols-1 gap-3">
      {organizations.map((org) => (
        <Link
          key={org._id}
          href={`/profile/organization/${org._id}`}
          className="p-3 border border-gray-200 rounded-md hover:bg-violet-400/20 transition flex items-center gap-3"
        >
          {org.logo ? (
            <Image
              src={org.logo}
              alt={`${org.name} logo`}
              width={40}
              height={40}
              className="rounded-md"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-md flex items-center justify-center">
              {org.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-md">{org.name}</div>
            {/* {org.description && (
              <p className="text-xs text-gray-300 line-clamp-2">
                {org.description}
              </p>
            )} */}
          </div>
        </Link>
      ))}
    </div>
  );
}
