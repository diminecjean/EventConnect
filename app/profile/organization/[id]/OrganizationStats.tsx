import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white p-3 rounded-md shadow-lg border border-slate-700">
        <p className="font-medium text-sm mb-1">
          {payload[0]?.payload.eventName}
        </p>
        {payload.map((entry: any, index: number) => (
          <div
            key={`tooltip-item-${index}`}
            className="flex items-center gap-2"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <p className="text-xs">
              {entry.name}: <span className="font-medium">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface OrganizationStatsProps {
  organizationId: string;
}

const OrganizationStats: React.FC<OrganizationStatsProps> = ({
  organizationId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  // Events to display initially
  const DEFAULT_DISPLAYED_EVENTS = 5;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/organizations/${organizationId}/stats`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch organization stats");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [organizationId]);

  if (loading) {
    return <div className="flex justify-center my-8">Loading....</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!stats) {
    return <div className="text-gray-500 p-4">No statistics available</div>;
  }

  // Format data for charts
  const subscriptionData = stats.subscriptionStats.map((item: any) => ({
    date: item.date,
    subscriptions: item.count,
  }));

  // Calculate check-in rate from registration stats
  let checkInData = stats.registrationStats.map((item: any) => {
    const checkInRate =
      item.totalRegistrations > 0
        ? (item.checkedIn / item.totalRegistrations) * 100
        : 0;

    return {
      eventId: item._id,
      eventName: item.eventName || `Event ${item._id.substring(0, 6)}...`, // Use event name or fallback to shortened ID
      totalRegistrations: item.totalRegistrations,
      checkedIn: item.checkedIn,
      checkInRate: Math.round(checkInRate),
    };
  });

  // Get initial events to display (5 by default)
  const displayedCheckInData = showAllEvents
    ? checkInData
    : checkInData.slice(0, DEFAULT_DISPLAYED_EVENTS);

  // Format demographics for pie chart
  const demographicsData = stats.attendeeDemographics
    .filter((item: any) => item._id.position)
    .map((item: any) => ({
      name: item._id.position || "Unknown",
      value: item.count,
    }));

  return (
    <div className="space-y-8">
      <Tabs defaultValue="subscriptions">
        <TabsList className="w-full">
          <TabsTrigger value="subscriptions" className="flex-1">
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="registrations" className="flex-1">
            Registrations
          </TabsTrigger>
          <TabsTrigger value="demographics" className="flex-1">
            Demographics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                Subscription Growth Over Time
              </h3>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={subscriptionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      label={{
                        value: "Date",
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Subscriptions",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                      type="monotone"
                      dataKey="subscriptions"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Event Statistics</h3>
            </CardHeader>
            <CardContent>
              {/* Horizontal Bar Chart - Better for many events */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayedCheckInData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="eventName"
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        fill: "rgba(180, 180, 180, 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="totalRegistrations"
                      name="Total Registrations"
                      fill="#8884d8"
                      activeBar={{
                        fill: "#6a5acd",
                        stroke: "#483d8b",
                        strokeWidth: 2,
                      }}
                    />
                    <Bar
                      dataKey="checkedIn"
                      name="Checked In"
                      fill="#82ca9d"
                      activeBar={{
                        fill: "#5cb85c",
                        stroke: "#3e8e41",
                        strokeWidth: 2,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Show all events toggle button */}
              {checkInData.length > DEFAULT_DISPLAYED_EVENTS && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllEvents(!showAllEvents)}
                    className="flex items-center gap-1"
                  >
                    {showAllEvents ? (
                      <>
                        <ChevronUp size={16} />
                        Show Top {DEFAULT_DISPLAYED_EVENTS} Events
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        Show All {checkInData.length} Events
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Attendee Demographics</h3>
            </CardHeader>
            <CardContent>
              {/* Nested tabs for different demographic attributes */}
              <Tabs defaultValue="position" className="mt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="position" className="flex-1">
                    Position
                  </TabsTrigger>
                  <TabsTrigger value="organization" className="flex-1">
                    Organization
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="position">
                  <div className="h-[400px] flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={demographicsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.attendeeDemographics
                            .filter((item: any) => item._id.position)
                            .map((entry: any, index: number) => (
                              <Cell
                                key={`cell-position-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="organization">
                  <div className="h-[400px] flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.attendeeDemographics
                            .filter((item: any) => item._id.organization)
                            .map((item: any) => ({
                              name: item._id.organization || "Unknown",
                              value: item.count,
                            }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.attendeeDemographics
                            .filter((item: any) => item._id.organization)
                            .map((entry: any, index: number) => (
                              <Cell
                                key={`cell-org-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationStats;
