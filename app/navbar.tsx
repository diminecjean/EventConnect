"use client";

import * as React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/authContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "react-day-picker";
import { Plus, PlusCircle } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { user, organizations, isLoading, clearUser } = useAuth();

  const handleSignOut = async () => {
    clearUser();
    await signOut({ redirect: false });
    toast("You have been logged out");
    router.push("/");
  };

  const truncateText = (text?: string, maxLength: number = 20) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Normalize organizations to always be an array
  const normalizedOrganizations = React.useMemo(() => {
    if (!organizations) return [];
    if (Array.isArray(organizations)) return organizations;
    return [organizations];
  }, [organizations]);

  // Show a minimal loader while auth state is being determined
  if (isLoading) {
    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>{/* TODO */}</NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  }

  return (
    <NavigationMenu className="bg-black bg-black/70 backdrop-blur-sm">
      <NavigationMenuList>
        {!user ? (
          <>
            <NavigationMenuItem>
              <Link href="/login" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Login
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/signup" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Sign Up
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </>
        ) : (
          <>
            <NavigationMenuItem>
              <div
                onClick={() => {
                  if (user._id) {
                    router.push(`/profile/organization/new?userId=${user._id}`);
                  } else {
                    // Handle case when user is not logged in
                    router.push("/login");
                  }
                }}
                className="flex items-center bg-violet-900/50 hover:bg-violet-800 rounded-full overflow-hidden transition-all duration-300 ease-in-out cursor-pointer group"
              >
                <PlusCircle
                  size={20}
                  className="text-violet-400 group-hover:text-white m-2 flex-shrink-0"
                />
                <span className="max-w-0 group-hover:max-w-xs transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap text-transparent group-hover:text-white text-sm pr-2">
                  Create Organization
                </span>
              </div>
            </NavigationMenuItem>
            {normalizedOrganizations.length > 0 && (
              <NavigationMenuItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Organizations
                    </NavigationMenuLink>
                  </PopoverTrigger>
                  <PopoverContent>
                    {normalizedOrganizations.map((org) => (
                      <Link
                        key={org._id}
                        href={`/profile/organization/${org._id}`}
                        className="block rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-violet-300 hover:text-black"
                        title={org.name} // Adds tooltip with full name
                      >
                        {truncateText(org.name, 25)}
                      </Link>
                    ))}
                  </PopoverContent>
                </Popover>
              </NavigationMenuItem>
            )}
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                onClick={handleSignOut}
              >
                Logout
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href={`/profile/user/${user._id}`} passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <div className="flex justify-center items-center gap-2 rounded-full bg-violet-900 py-2 px-4 cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {user.name?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <span>{user.name}</span>
                  </div>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
