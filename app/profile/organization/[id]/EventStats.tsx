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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

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

interface EventStatsProps {
  eventId: string;
}

const EventStats: React.FC<EventStatsProps> = ({ eventId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}/stats`);

        if (!response.ok) {
          throw new Error("Failed to fetch event stats");
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
  }, [eventId]);

  if (loading) {
    return <div className="flex justify-center my-8">Loading</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!stats) {
    return <div className="text-gray-500 p-4">No statistics available</div>;
  }

  // Format data for charts
  const registrationData = stats.registrationOverTime.map((item: any) => ({
    date: item.date,
    registrations: item.count,
  }));

  const checkInData = {
    name: "Check-in Rate",
    value: Math.round(stats.checkInStats.checkInRate * 100),
    total: stats.checkInStats.totalRegistrations,
    checkedIn: stats.checkInStats.checkedIn,
  };

  // Format ratings for radar chart
  const formattedRatings = stats.attendeeRatings.map((item: any) => ({
    rating: `${item._id} Star${item._id !== 1 ? "s" : ""}`,
    count: item.count,
  }));

  // Format demographics for pie chart - prepare different demographic categories
  const positionDemographics = stats.attendeeDemographics
    .filter((item: any) => item._id.position || item._id.role)
    .map((item: any) => ({
      name: item._id.position || item._id.role || "Unknown",
      value: item.count,
    }));

  const organizationDemographics = stats.attendeeDemographics
    .filter((item: any) => item._id.organization)
    .map((item: any) => ({
      name: item._id.organization || "Unknown",
      value: item.count,
    }));

  return (
    <div className="space-y-8 flex flex-col justify-center">
      <Tabs defaultValue="registrations">
        <TabsList className="w-full">
          <TabsTrigger value="registrations" className="flex-1">
            Registrations
          </TabsTrigger>
          <TabsTrigger value="check-ins" className="flex-1">
            Check-ins
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex-1">
            Ratings
          </TabsTrigger>
          <TabsTrigger value="demographics" className="flex-1">
            Demographics
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex-1">
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                Registration Growth Over Time
              </h3>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={registrationData}
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
                        value: "Registrations",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="check-ins">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Check-in Rate</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="text-4xl font-bold">{checkInData.value}%</div>
                <div className="text-sm text-gray-500">
                  {checkInData.checkedIn} checked in out of {checkInData.total}{" "}
                  registrations
                </div>
                <div className="w-full h-[30px] bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${checkInData.value}%` }}
                  ></div>
                </div>

                <div className="h-[300px] w-full mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Check-in Statistics",
                          registrations: checkInData.total,
                          checkedIn: checkInData.checkedIn,
                        },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                          fill: "rgba(180, 180, 180, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="registrations"
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Attendee Ratings</h3>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={150} data={formattedRatings}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="rating" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Ratings"
                      dataKey="count"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
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
                          data={positionDemographics}
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
                          {positionDemographics.map(
                            (entry: any, index: number) => (
                              <Cell
                                key={`cell-position-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ),
                          )}
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
                          data={organizationDemographics}
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
                          {organizationDemographics.map(
                            (entry: any, index: number) => (
                              <Cell
                                key={`cell-organization-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ),
                          )}
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

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Recent Feedback</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.feedbackComments && stats.feedbackComments.length > 0 ? (
                  stats.feedbackComments.map((feedback: any) => (
                    <div key={feedback._id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          {/* If you have user details with the feedback */}
                          {feedback.userName?.substring(0, 2) || "AT"}
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {feedback.userName || "Anonymous"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Rating: {feedback.rating} / 5
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    No feedback comments available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventStats;
