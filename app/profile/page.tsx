import Link from "next/link";
import organizationsData from "@/data/organizationData.json";
import usersData from "@/data/userData.json";
import type {
  OrganizationProfile,
  UserProfile,
} from "../../typings/profile/typings";

// TODO: Remove this page
export default function ProfilePage() {
  return (
    <>
      <div className="p-6 mt-20">
        <h1 className="text-2xl font-bold">Organizations:</h1>
        <ul className="mt-4 space-y-2">
          {organizationsData.map((org) => (
            <li key={org.id}>
              <Link
                href={`/profile/organization/${org.id}`}
                className="text-blue-600 hover:underline"
              >
                {org.name} - {org.description}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-6 mt-20">
        <h1 className="text-2xl font-bold">Organizations:</h1>
        <ul className="mt-4 space-y-2">
          {usersData.map((user) => (
            <li key={user.id}>
              <Link
                href={`/profile/user/${user.id}`}
                className="text-blue-600 hover:underline"
              >
                {user.name} - {user.email}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
