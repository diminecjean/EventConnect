import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  growth?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  growth,
  subtitle,
}) => (
  <Card>
    <CardContent className="py-4">
      <div className="flex gap-4 justify-between items-start">
        <div>
          <div className="flex items-baseline mb-2">
            <h3 className="text-3xl font-semibold">{value}</h3>
            {growth && (
              <span
                className={`text-xs font-medium ml-2 flex items-center ${
                  growth.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                {growth.value}
              </span>
            )}
            {subtitle && (
              <span className="text-xs ml-2 text-muted-foreground">
                {subtitle}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
        </div>
        <div className={`p-2 ${iconBgColor} rounded-md`}>
          {React.cloneElement(icon as React.ReactElement, {
            className: `h-5 w-5 ${iconColor}`,
          })}
        </div>
      </div>
    </CardContent>
  </Card>
);

export interface KeyMetricsGridProps {
  metrics: MetricCardProps[];
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export const KeyMetricsGrid: React.FC<KeyMetricsGridProps> = ({
  metrics,
  columns = { sm: 1, md: 2, lg: 4 },
}) => {
  return (
    <div
      className={`grid gap-4 grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg}`}
    >
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};
