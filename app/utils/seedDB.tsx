"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import eventsData from "@/data/mongodb/events.json";
import orgData from "@/data/mongodb/organizations.json";
import userData from "@/data/mongodb/users.json";

export default function SeedDatabase() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const seedDatabase = async (database: string) => {
    try {
      setStatus("loading");
      setMessage("Seeding database...");

      const body = database === "events" ? eventsData : orgData;

      const response = await fetch(`/api/admin/seed/${database}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body), // Send array directly
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to seed database");
      }

      setStatus("success");
      setMessage(`Success! Added ${data.count} ${database} to database.`);
    } catch (error) {
      console.error("Error seeding database:", error);
      setStatus("error");
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const fetchUserById = async (id: string) => {
    try {
      setStatus("loading");
      setMessage("Fetching user...");

      const response = await fetch(`/api/users/${id}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user");
      }

      setStatus("success");
      setMessage(
        `Success! Fetched user: ${JSON.stringify({ user: data.user })}`,
      );
    } catch (error) {
      console.error("Error fetching user:", error);
      setStatus("error");
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="p-8 mt-20">
      <h1 className="text-3xl font-bold mb-6">Admin: Seed Database</h1>
      <div className="mb-8 space-y-2">
        <p className="text-gray-600 mb-4">
          This will add all events from the JSON file to the MongoDB database.
        </p>
        <Button
          onClick={() => seedDatabase("events")}
          disabled={status === "loading"}
          className="px-6 py-2"
        >
          {status === "loading" ? "Seeding..." : "Seed Events to Database"}
        </Button>
        <Button
          onClick={() => seedDatabase("organizations")}
          disabled={status === "loading"}
          className="px-6 py-2 ml-2"
        >
          {status === "loading" ? "Seeding..." : "Seed Org to Database"}
        </Button>
        <Button
          onClick={() => fetchUserById("user_001")}
          disabled={status === "loading"}
          className="px-6 py-2 ml-2"
        >
          {status === "loading" ? "Fetching..." : "Test user route"}
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            status === "success"
              ? "bg-green-50 text-green-800"
              : status === "error"
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
