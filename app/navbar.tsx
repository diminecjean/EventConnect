"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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

export default function Navbar() {
  const router = useRouter();
  const { user, organizations, isLoading, clearUser } = useAuth();
  console.log({ user, organizations });
  const [selectedOrganization, setSelectedOrganization] = useState("");

  // Update selectedOrganization whenever organizations changes
  useEffect(() => {
    if (
      organizations &&
      Array.isArray(organizations) &&
      organizations.length > 0
    ) {
      setSelectedOrganization(organizations[0]._id);
    } else if (organizations && !Array.isArray(organizations)) {
      // Handle case where organizations might be a single object
      setSelectedOrganization((organizations as any)._id);
    }
  }, [organizations]);

  console.log({ selectedOrganization });

  const handleSignOut = async () => {
    console.log("Logging out...");
    // Clear user data from context and localStorage
    clearUser();
    // Sign out from next-auth
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

  // Show a minimal loader while auth state is being determined
  if (isLoading) {
    return (
      <NavigationMenu>
        <NavigationMenuList>
          {/* Optional: Add a skeleton loader here */}
        </NavigationMenuList>
      </NavigationMenu>
    );
  }

  return (
    <NavigationMenu>
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
            {organizations && (
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
                    {Array.isArray(organizations)
                      ? organizations.map((org) => (
                          <Link
                            key={org._id}
                            href={`/profile/organization/${org._id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            title={org.name} // Adds tooltip with full name
                          >
                            {truncateText(org.name, 25)}
                          </Link>
                        ))
                      : organizations &&
                        typeof organizations === "object" && (
                          <Link
                            href={`/profile/organization/${(organizations as any)._id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            title={(organizations as any).name} // Adds tooltip with full name
                          >
                            {truncateText((organizations as any).name, 25)}
                          </Link>
                        )}
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
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
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
