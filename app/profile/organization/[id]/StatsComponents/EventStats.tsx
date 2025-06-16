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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  BarChart2,
  PieChart as PieChartIcon,
  Star,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  CheckCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "./KeyMetricCards";
import { useRouter } from "next/navigation";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white p-3 rounded-md shadow-lg border border-slate-700">
        <p className="font-medium text-sm mb-1">
          {payload[0]?.payload.eventName || label}
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
  const [activeTab, setActiveTab] = useState("registrations");
  const router = useRouter();

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
    return (
      <div className="flex justify-center items-center my-8 h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium">Error Loading Stats</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-50 text-gray-500 p-6 rounded-lg border border-gray-200 text-center">
        <BarChart2 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium mb-1">No Statistics Available</h3>
        <p>There is no data available for this event yet.</p>
      </div>
    );
  }

  const hasRegistrationData = stats?.registrationOverTime?.length > 0;
  const hasDemographicsData = stats?.attendeeDemographics?.length > 0;
  const hasRatingsData = stats?.attendeeRatings?.length > 0;
  const hasFeedbackData = stats?.feedbackComments?.length > 0;

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

  // Calculate average rating
  const totalRatings = formattedRatings.reduce(
    (sum: number, item: any) => sum + item.count,
    0,
  );
  const weightedSum = formattedRatings.reduce(
    (sum: number, item: any) => sum + item.count * parseInt(item.rating),
    0,
  );
  const averageRating =
    totalRatings > 0 ? (weightedSum / totalRatings).toFixed(1) : "N/A";

  // Format demographics for pie chart with proper aggregation
  const aggregateByField = (data: any[], field: string) => {
    const aggregated: Record<string, number> = {};

    data
      .filter((item) => item._id[field])
      .forEach((item) => {
        const key = item._id[field] || "Unknown";
        if (aggregated[key]) {
          aggregated[key] += item.count;
        } else {
          aggregated[key] = item.count;
        }
      });

    return Object.entries(aggregated)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by value in descending order
  };

  // Replace existing position and organization demographics with:
  const positionDemographics = aggregateByField(
    stats.attendeeDemographics,
    "position",
  );
  const organizationDemographics = aggregateByField(
    stats.attendeeDemographics,
    "organization",
  );

  const totalRegistrations = checkInData.total;
  const totalFeedback = stats.feedbackComments?.length || 0;
  const totalAttendeeRatings = totalRatings;

  return (
    <div className="space-y-6 p-4">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h2 className="text-3xl mb-4 font-bold tracking-tight">
            Event Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Comprehensive insights into event performance and attendee
            engagement
          </p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Registrations"
          value={totalRegistrations}
          icon={<Users />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />

        <MetricCard
          title="Check-in Rate"
          value={`${checkInData.value}%`}
          icon={<CheckCheck />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          subtitle={`(${checkInData.checkedIn}/${checkInData.total})`}
        />

        <MetricCard
          title="Average Rating"
          value={averageRating}
          icon={<Star />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          subtitle={`(${totalAttendeeRatings})`}
        />

        <MetricCard
          title="Total Feedback"
          value={totalFeedback}
          icon={<MessageSquare />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          subtitle="comments"
        />
      </div>

      {/* Main Dashboard Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Registration Growth Over Time
                </CardTitle>
                <CardDescription>
                  Track how registrations have grown leading up to your event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasRegistrationData ? (
                  <div className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={registrationData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          label={{
                            value: "Date",
                            position: "insideBottom",
                            offset: -10,
                          }}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
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
                          strokeWidth={2}
                          dot={{ stroke: "#8884d8", strokeWidth: 2, r: 4 }}
                          activeDot={{
                            r: 6,
                            stroke: "#8884d8",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No registration timeline data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Check-in Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CheckCheck className="h-4 w-4" /> Check-in Status
                </CardTitle>
                <CardDescription>Overall attendance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {checkInData && checkInData.total > 0 ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-4xl font-bold">
                      {checkInData.value}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {checkInData.checkedIn} checked in out of{" "}
                      {checkInData.total} registrations
                    </div>
                    <div className="w-full h-[24px] bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${checkInData.value}%` }}
                      ></div>
                    </div>

                    <div className="h-[190px] w-full mt-4">
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
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
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
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="checkedIn"
                            name="Checked In"
                            fill="#82ca9d"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <CheckCheck className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No check-in data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Attendee Demographics</CardTitle>
              <CardDescription>
                Breakdown of attendees by different attributes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasDemographicsData ? (
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
                    <div className="h-[500px] flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={positionDemographics}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={150}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={(entry) => {
                              // Only show labels for entries with sufficient percentage
                              const percent = Math.round(
                                (entry.value /
                                  positionDemographics.reduce(
                                    (sum: any, e: { value: any }) =>
                                      sum + e.value,
                                    0,
                                  )) *
                                  100,
                              );
                              return percent >= 5 ? `${percent}%` : "";
                            }}
                            labelLine={{
                              stroke: "#555",
                              strokeWidth: 0.5,
                              strokeOpacity: 0.5,
                            }}
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
                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                              fill: "rgba(180, 180, 180, 0.1)",
                            }}
                          />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{
                              paddingLeft: "20px",
                              fontSize: "12px",
                              maxHeight: "300px",
                              overflowY: "auto",
                            }}
                            formatter={(value, entry) => (
                              <span
                                className="text-sm font-medium"
                                title={value}
                              >
                                {value.length > 25
                                  ? `${value.substring(0, 22)}...`
                                  : value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="organization">
                    <div className="h-[500px] flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={organizationDemographics}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={150}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={(entry) => {
                              // Only show labels for entries with sufficient percentage
                              const percent = Math.round(
                                (entry.value /
                                  organizationDemographics.reduce(
                                    (sum: any, e: { value: any }) =>
                                      sum + e.value,
                                    0,
                                  )) *
                                  100,
                              );
                              return percent >= 5 ? `${percent}%` : "";
                            }}
                            labelLine={{
                              stroke: "#555",
                              strokeWidth: 0.5,
                              strokeOpacity: 0.5,
                            }}
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
                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                              fill: "rgba(180, 180, 180, 0.1)",
                            }}
                          />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{
                              paddingLeft: "20px",
                              fontSize: "12px",
                              maxHeight: "300px",
                              overflowY: "auto",
                            }}
                            formatter={(value, entry) => (
                              <span
                                className="text-sm font-medium"
                                title={value}
                              >
                                {value.length > 25
                                  ? `${value.substring(0, 22)}...`
                                  : value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Rating Radar</CardTitle>
                <CardDescription>
                  Visualizing rating distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasRatingsData && formattedRatings.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={120} data={formattedRatings}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="rating" />
                        <PolarRadiusAxis />
                        <Radar
                          name="Ratings"
                          dataKey="count"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{
                            fill: "rgba(180, 180, 180, 0.1)",
                          }}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-16">
                      <Star className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="text-muted-foreground">
                        No rating data available yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ratings will appear here once attendees provide feedback
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Rating Summary</CardTitle>
                <CardDescription>Quick overview of ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-12">
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Average Rating
                      </p>
                      <div className="flex items-center">
                        <span className="text-3xl font-bold mr-2">
                          {averageRating}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= parseFloat(averageRating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : star - 0.5 <= parseFloat(averageRating)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Total Ratings
                      </p>
                      <p className="text-3xl font-bold">
                        {totalAttendeeRatings}
                      </p>
                    </div>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="space-y-2 mt-6">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const ratingItem = formattedRatings.find(
                        (r: { rating: string }) =>
                          r.rating === `${star} Star${star !== 1 ? "s" : ""}`,
                      );
                      const count = ratingItem?.count || 0;
                      const percentage =
                        totalAttendeeRatings > 0
                          ? (count / totalAttendeeRatings) * 100
                          : 0;

                      return (
                        <div key={star} className="flex items-center gap-2">
                          <div className="w-12 flex items-center">
                            <span className="text-sm font-medium">{star}</span>
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 ml-1" />
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-100 h-2 rounded-full">
                              <div
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-16 text-right text-sm">
                            {count} ({Math.round(percentage)}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Attendee Feedback</CardTitle>
              <CardDescription>
                {totalFeedback} {totalFeedback > 1 ? "comments" : "comment"}{" "}
                from attendees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.feedbackComments && stats.feedbackComments.length > 0 ? (
                  stats.feedbackComments.map((feedback: any) => (
                    <div key={feedback._id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between">
                            {feedback.userName ? (
                              <div
                                className="font-medium cursor-pointer hover:text-primary hover:underline"
                                onClick={() =>
                                  router.push(
                                    `/profile/user/${feedback.userId}`,
                                  )
                                }
                              >
                                {feedback.userName}
                              </div>
                            ) : (
                              <div className="font-medium">Anonymous</div>
                            )}
                            <Badge variant="outline" className="ml-2">
                              {feedback.rating}{" "}
                              <Star className="h-3 w-3 ml-0.5 inline fill-current" />
                            </Badge>
                          </div>
                          <div className="flex items-center mt-1 mb-2">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < feedback.rating
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                          </div>
                          <p className="text-gray-400">{feedback.comment}</p>
                          {feedback.date && (
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(feedback.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No feedback comments available</p>
                  </div>
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
