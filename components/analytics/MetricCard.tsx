// components/analytics/MetricCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
};

export default function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
}: MetricCardProps) {
  return (
    <Card className="transition-all duration-300 ease-in-out hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 transition-all duration-300">
        <CardTitle className="text-xs sm:text-sm font-medium transition-all duration-300">{title}</CardTitle>
        <div className="transition-all duration-300 scale-90 sm:scale-100">{icon}</div>
      </CardHeader>
      <CardContent className="transition-all duration-300">
        <div className="text-lg sm:text-xl md:text-2xl font-bold transition-all duration-300">{value}</div>
        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1 transition-all duration-300">
          {trend && (
            <span
              className={`flex items-center ${
                trend.isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
          <span className="truncate">{description}</span>
        </p>
      </CardContent>
    </Card>
  );
}
