"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BASE_URL } from "@/app/api/constants";
import { UserProfile } from "@/app/typings/profile/typings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface AddTeamMembersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  onSuccess: () => void;
}

export default function AddTeamMembersModal({
  isOpen,
  onOpenChange,
  orgId,
  onSuccess,
}: AddTeamMembersModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search for users based on search term
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `${BASE_URL}/api/users/search?term=${searchTerm}`,
        );
        if (!response.ok) {
          throw new Error("Failed to search users");
        }
        const data = await response.json();
        // Filter out users who are already selected
        const filteredResults = data.users.filter(
          (user: UserProfile) =>
            !selectedUsers.some(
              (selectedUser) => selectedUser._id === user._id,
            ) &&
            // Filter out users who already have this organization in their list
            !user.organizations?.includes(orgId),
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching users:", error);
        toast.error("Error searching users");
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search to avoid excessive API calls
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        searchUsers();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedUsers, orgId]);

  // Handle selecting a user
  const selectUser = (user: UserProfile) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchTerm("");
    setSearchResults([]);
  };

  // Handle removing a selected user
  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
  };

  // Handle adding selected users to organization
  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    setIsSubmitting(true);
    try {
      const userIds = selectedUsers.map((user) => user._id);
      const response = await fetch(
        `${BASE_URL}/api/organizations/${orgId}/team`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userIds }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add team members");
      }

      toast.success(
        `${selectedUsers.length} team member${selectedUsers.length > 1 ? "s" : ""} added successfully`,
      );
      setSelectedUsers([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding team members:", error);
      toast.error("Failed to add team members");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Selected users display */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedUsers.map((user) => (
                <Badge
                  key={user._id}
                  variant="secondary"
                  className="pl-3 py-1.5"
                >
                  {user.name || user.email}
                  <button
                    onClick={() => removeUser(user._id)}
                    className="ml-1 rounded-full hover:bg-slate-700 p-1"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for users by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Search results */}
          {isSearching ? (
            <div className="text-center py-2">Searching...</div>
          ) : searchResults.length > 0 ? (
            <ScrollArea className="max-h-[200px] overflow-y-auto">
              <div className="space-y-1">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-md cursor-pointer"
                    onClick={() => selectUser(user)}
                  >
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center overflow-hidden">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium">
                          {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {user.name || "Unnamed User"}
                      </p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : searchTerm.length > 1 ? (
            <p className="text-sm text-center text-slate-400 py-2">
              No users found
            </p>
          ) : null}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMembers}
            disabled={selectedUsers.length === 0 || isSubmitting}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isSubmitting
              ? "Adding..."
              : `Add ${selectedUsers.length ? `(${selectedUsers.length})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
