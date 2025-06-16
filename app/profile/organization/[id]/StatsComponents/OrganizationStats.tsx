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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  TrendingUp,
  PieChart as PieChartIcon,
  ArrowUpRight,
  LineChartIcon,
  BarChartIcon,
  Star,
  CheckIcon,
  FilterIcon,
} from "lucide-react";
import { MetricCard } from "./KeyMetricCards";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

interface OrganizationStatsProps {
  organizationId: string;
}

export interface SubscriptionStat {
  date: string;
  count: number;
}

export interface RegistrationStat {
  _id: string;
  eventName: string;
  totalRegistrations: number;
  checkedIn: number;
}

export interface DemographicStat {
  _id: {
    position?: string;
    organization?: string;
  };
  count: number;
}

export interface AttendeeRatingStat {
  rating: number;
  count: number;
}

export interface OrganizationStatsData {
  subscriptionStats: SubscriptionStat[];
  registrationStats: RegistrationStat[];
  attendeeDemographics: DemographicStat[];
  attendeeRatings: AttendeeRatingStat[];
  totalEvents: number;
  eventIds: string[];
}

const OrganizationStats: React.FC<OrganizationStatsProps> = ({
  organizationId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrganizationStatsData | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [displayedCheckInData, setDisplayedCheckInData] = useState<any[]>([]);
  const [checkInData, setCheckInData] = useState<any[]>([]);

  const hasSubscriptionData =
    Array.isArray(stats?.subscriptionStats) &&
    stats.subscriptionStats.length > 0;
  const hasRegistrationData =
    Array.isArray(stats?.registrationStats) &&
    stats.registrationStats.length > 0;
  const hasDemographicsData =
    Array.isArray(stats?.attendeeDemographics) &&
    stats.attendeeDemographics.length > 0 &&
    stats.attendeeDemographics.some((item: any) => item._id.position);
  const hasRatingsData =
    Array.isArray(stats?.attendeeRatings) && stats.attendeeRatings.length > 0;

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

        // Calculate check-in rate from registration stats
        if (data.registrationStats && data.registrationStats.length > 0) {
          const formattedData = data.registrationStats.map(
            (item: RegistrationStat) => {
              const checkInRate =
                item.totalRegistrations > 0
                  ? (item.checkedIn / item.totalRegistrations) * 100
                  : 0;

              return {
                eventId: item._id,
                eventName:
                  item.eventName || `Event ${item._id.substring(0, 6)}...`,
                totalRegistrations: item.totalRegistrations,
                checkedIn: item.checkedIn,
                checkInRate: Math.round(checkInRate),
              };
            },
          );
          setCheckInData(formattedData);
        }
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

  useEffect(() => {
    if (checkInData && checkInData.length > 0) {
      setDisplayedCheckInData(
        showAllEvents
          ? checkInData
          : checkInData.slice(0, DEFAULT_DISPLAYED_EVENTS),
      );
    }
  }, [checkInData, showAllEvents, DEFAULT_DISPLAYED_EVENTS]);

  if (loading) {
    return (
      <div className="flex justify-center items-center my-8 h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        <h3 className="text-lg font-medium">Error Loading Dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-50 text-gray-500 p-6 rounded-lg border border-gray-200 text-center">
        <PieChartIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium mb-1">No Statistics Available</h3>
        <p>There is no data available for this organization yet.</p>
      </div>
    );
  }

  // Format data for charts with cumulative subscriptions
  const subscriptionData = stats.subscriptionStats.reduce(
    (
      acc: {
        date: string;
        subscriptions: number;
        dailySubscriptions: number;
      }[],
      item: SubscriptionStat,
      index: number,
    ) => {
      const previousTotal = index > 0 ? acc[index - 1].subscriptions : 0;
      acc.push({
        date: item.date,
        subscriptions: previousTotal + item.count, // Cumulative total
        dailySubscriptions: item.count, // Original daily count (if needed)
      });
      return acc;
    },
    [],
  );

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

    return Object.entries(aggregated).map(([name, value]) => ({ name, value }));
  };

  const demographicsPositionData = aggregateByField(
    stats.attendeeDemographics,
    "position",
  );
  const demographicsOrganizationData = aggregateByField(
    stats.attendeeDemographics,
    "organization",
  );

  // Calculate total subscribers as the sum of all subscription counts
  // or just use the final cumulative number
  const totalSubscribers =
    subscriptionData.length > 0
      ? subscriptionData[subscriptionData.length - 1].subscriptions
      : 0;

  const totalRegistrations = checkInData.reduce(
    (sum: number, event: any) => sum + event.totalRegistrations,
    0,
  );

  const totalCheckIns = checkInData.reduce(
    (sum: number, event: any) => sum + event.checkedIn,
    0,
  );

  const avgCheckInRate =
    totalRegistrations > 0
      ? Math.round((totalCheckIns / totalRegistrations) * 100)
      : 0;

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

  const totalAttendeeRatings = totalRatings;

  return (
    <div className="space-y-6 p-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h2 className="text-3xl mb-2 font-bold tracking-tight">
            Organization Dashboard
          </h2>
          <p className="text-muted-foreground">
            Track your organization's performance and engagement metrics
          </p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Subscribers"
          value={totalSubscribers}
          icon={<Users />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />

        <MetricCard
          title="Total Registrations"
          value={totalRegistrations}
          icon={<Calendar />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />

        <MetricCard
          title="Total Check-ins"
          value={totalCheckIns}
          icon={<TrendingUp />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />

        <MetricCard
          title="Avg. Check-in Rate"
          value={`${avgCheckInRate}%`}
          icon={<PieChartIcon />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Subscription Growth */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">
              Subscription Growth Over Time
            </CardTitle>
            <CardDescription>
              Track how your subscriber base has grown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasSubscriptionData ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={subscriptionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
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
                        value: "Subscribers",
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
                      strokeWidth={2}
                      dot={{ stroke: "#8884d8", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#8884d8", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground h-[300px] flex flex-col items-center justify-center">
                <LineChartIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No subscription data available yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Subscription data will appear here as users subscribe to your
                  organization
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="col-span-2">
          {/* Demographics Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Attendee Demographics</CardTitle>
              <CardDescription>
                Breakdown of attendees across all events by position and
                organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasDemographicsData &&
              demographicsPositionData.length > 0 &&
              demographicsOrganizationData.length > 0 ? (
                <Tabs defaultValue="position" className="mt-2">
                  <TabsList className="mb-4">
                    <TabsTrigger value="position">By Position</TabsTrigger>
                    <TabsTrigger value="organization">
                      By Organization
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="position">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={demographicsPositionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => {
                              // Only show labels for entries with sufficient percentage
                              return percent >= 0.05
                                ? `${(percent * 100).toFixed(0)}%`
                                : "";
                            }}
                            labelLine={{
                              stroke: "#555",
                              strokeWidth: 0.5,
                              strokeDasharray: "2 2",
                            }}
                          >
                            {demographicsPositionData.map(
                              (entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ),
                            )}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            iconType="circle"
                            wrapperStyle={{
                              maxHeight: "250px",
                              overflowY: "auto",
                              fontSize: "12px",
                            }}
                            formatter={(value, entry) => {
                              // Truncate long names
                              const displayName =
                                value.length > 20
                                  ? value.substring(0, 18) + "..."
                                  : value;
                              return (
                                <span title={value} className="text-sm">
                                  {displayName}
                                </span>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  <TabsContent value="organization">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={demographicsOrganizationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => {
                              // Only show labels for entries with sufficient percentage
                              return percent >= 0.05
                                ? `${(percent * 100).toFixed(0)}%`
                                : "";
                            }}
                            labelLine={{
                              stroke: "#555",
                              strokeWidth: 0.5,
                              strokeDasharray: "2 2",
                            }}
                          >
                            {demographicsOrganizationData.map(
                              (entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ),
                            )}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            iconType="circle"
                            wrapperStyle={{
                              maxHeight: "250px",
                              overflowY: "auto",
                              fontSize: "12px",
                            }}
                            formatter={(value, entry) => {
                              // Truncate long names
                              const displayName =
                                value.length > 20
                                  ? value.substring(0, 18) + "..."
                                  : value;
                              return (
                                <span title={value} className="text-sm">
                                  {displayName}
                                </span>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-16 text-muted-foreground h-[300px] flex flex-col items-center justify-center">
                  <PieChartIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No demographic data available yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Demographic information will appear as attendees register
                    for your events
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Registration Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Event Registration Statistics
            </CardTitle>
            <CardDescription>
              Registration and check-in numbers by event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasRegistrationData && checkInData.length > 0 ? (
              <>
                {/* Add filter popover */}
                <div className="mb-4 flex justify-start">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <FilterIcon className="h-4 w-4" />
                        {displayedCheckInData.length === 1 &&
                        displayedCheckInData[0].eventId === "all"
                          ? "All Events Combined"
                          : displayedCheckInData.length === 1
                            ? `Event: ${displayedCheckInData[0].eventName}`
                            : "Filter Events"}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                      <div className="space-y-2">
                        <div className="font-medium text-sm mb-2">
                          Select Event
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          <button
                            className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                            onClick={() => {
                              // Calculate aggregate data across all events
                              const totalRegs = checkInData.reduce(
                                (sum, event) => sum + event.totalRegistrations,
                                0,
                              );
                              const totalCheckins = checkInData.reduce(
                                (sum, event) => sum + event.checkedIn,
                                0,
                              );

                              // Create aggregate data point
                              const aggregateData = [
                                {
                                  eventId: "all",
                                  eventName: "All Events",
                                  totalRegistrations: totalRegs,
                                  checkedIn: totalCheckins,
                                  checkInRate:
                                    totalRegs > 0
                                      ? Math.round(
                                          (totalCheckins / totalRegs) * 100,
                                        )
                                      : 0,
                                },
                              ];

                              setDisplayedCheckInData(aggregateData);
                            }}
                          >
                            All Events Combined
                            {displayedCheckInData.length === 1 &&
                              displayedCheckInData[0].eventId === "all" && (
                                <CheckIcon className="h-4 w-4 text-primary" />
                              )}
                          </button>
                          <div className="my-2 border-t border-gray-100"></div>
                          {checkInData.map((event) => (
                            <button
                              key={event.eventId}
                              className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                              onClick={() => {
                                const selectedEvent = checkInData.find(
                                  (e) => e.eventId === event.eventId,
                                );
                                setDisplayedCheckInData(
                                  selectedEvent ? [selectedEvent] : [],
                                );
                              }}
                            >
                              <span className="truncate">
                                {event.eventName}
                              </span>
                              {displayedCheckInData.length === 1 &&
                                displayedCheckInData[0].eventId ===
                                  event.eventId && (
                                  <CheckIcon className="h-4 w-4 text-primary" />
                                )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={displayedCheckInData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.1}
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
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
                        name="Registrations"
                        fill="#8884d8"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="checkedIn"
                        name="Checked In"
                        fill="#82ca9d"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-muted-foreground h-[300px] flex flex-col items-center justify-center">
                <BarChartIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No event registration data available yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Statistics will appear here once your events have
                  registrations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Overall Rating Stats */}
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
                  <p className="text-sm text-muted-foreground">Total Ratings</p>
                  <p className="text-3xl font-bold">{totalAttendeeRatings}</p>
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
    </div>
  );
};

export default OrganizationStats;
