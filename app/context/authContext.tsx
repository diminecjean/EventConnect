"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  OrganizationProfile,
  USER_ROLE,
  UserProfile,
} from "../typings/profile/typings";
import { BASE_URL } from "../api/constants";

interface AuthContextType {
  user: UserProfile | null;
  organizations: OrganizationProfile[] | null;
  isOrganizer: boolean;
  isLoading: boolean;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function getUserProfile(email: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/users/email/${email}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const res = await response.json();
    return res.user;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
}

async function getOrganizationProfile(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/organizations/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch organization data");
    }
    const res = await response.json();
    return res.organization;
  } catch (error) {
    console.error("Error fetching organization ID:", error);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(() => {
    // Initialize isOrganizer from localStorage if available
    if (typeof window !== "undefined") {
      return localStorage.getItem("userRole") === "Organizer";
    }
    return false;
  });
  const [organizations, setOrganizations] = useState<
    OrganizationProfile[] | null
  >(null);

  // Function to clear user data (used on logout)
  const clearUser = () => {
    setUser(null);
    setIsOrganizer(false);
    setOrganizations(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("organizationData");
  };

  useEffect(() => {
    // Skip if we're on the server
    if (typeof window === "undefined") return;

    const loadStoredData = () => {
      // Load user data
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Set organizer status from localStorage
          setIsOrganizer(localStorage.getItem("userRole") === "Organizer");

          // Load organization data
          const storedOrgs = localStorage.getItem("organizationData");
          if (storedOrgs) {
            try {
              setOrganizations(JSON.parse(storedOrgs));
            } catch (e) {
              console.error("Error parsing stored organization data:", e);
              localStorage.removeItem("organizationData");
            }
          }

          return true;
        } catch (e) {
          console.error("Error parsing stored user data:", e);
          localStorage.removeItem("userData");
        }
      }
      return false;
    };

    const fetchUserData = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const userProfile = await getUserProfile(session.user.email);
          if (userProfile) {
            setUser(userProfile);
            localStorage.setItem("userData", JSON.stringify(userProfile));

            // Check for organizer status
            if (
              userProfile.organization &&
              userProfile.organization.length > 0
            ) {
              setIsOrganizer(true);
              localStorage.setItem("userRole", "Organizer");

              // Fetch organizations data
              const organizationPromises = userProfile.organization.map(
                (orgId: string) => getOrganizationProfile(orgId),
              );

              const orgProfiles = await Promise.all(organizationPromises);
              const validOrgProfiles = orgProfiles.filter(
                (profile) => profile !== null,
              ) as OrganizationProfile[];
              setOrganizations(validOrgProfiles);
              localStorage.setItem(
                "organizationData",
                JSON.stringify(validOrgProfiles),
              );
            } else {
              setIsOrganizer(false);
              localStorage.removeItem("userRole");
              localStorage.removeItem("organizationData");
              setOrganizations(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else if (status === "unauthenticated") {
        // Clear everything if user is not authenticated
        clearUser();
      }

      setIsLoading(false);
    };

    // First try to load from storage to prevent flashing UI
    const dataLoaded = loadStoredData();

    // If data wasn't loaded from storage or session changed, fetch fresh data
    if (!dataLoaded || status === "authenticated") {
      fetchUserData();
    } else {
      // If we loaded from storage, still mark loading as complete
      setIsLoading(false);
    }
  }, [session, status]);

  return (
    <AuthContext.Provider
      value={{ user, organizations, isOrganizer, isLoading, clearUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
