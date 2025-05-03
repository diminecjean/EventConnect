import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { type AttendeeStats } from "../hooks/useAttendees";
import { formatSingleDate } from "@/app/utils/formatDate";

interface AttendeeStatsProps {
  stats: AttendeeStats;
}

export default function AttendeeStats({ stats }: AttendeeStatsProps) {
  const date = formatSingleDate(stats.eventDate);

  const calculateDaysRemaining = () => {
    if (!stats.eventDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(stats.eventDate);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Event has passed";
    if (diffDays === 0) return "Today";
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} remaining`;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Checked In
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
          <p className="text-sm text-gray-500">{stats.checkInRate}% of total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Not Checked In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-amber-600">
            {stats.registered}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Event Date
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <div className="flex flex-row items-center mb-2">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <p className="text-sm">{date}</p>
          </div>
          <p className="text-sm text-gray-500">{daysRemaining}</p>
        </CardContent>
      </Card>
    </div>
  );
}
