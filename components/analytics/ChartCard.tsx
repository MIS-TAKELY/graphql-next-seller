// components/analytics/ChartCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

type ChartCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  chartConfig: any;
  className?: string;
};

export default function ChartCard({
  title,
  description,
  children,
  chartConfig,
  className = "h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]",
}: ChartCardProps) {
  return (
    <Card className="transition-all duration-300 ease-in-out hover:shadow-md overflow-hidden">
      <CardHeader className="pb-2 sm:pb-4 p-3 sm:p-6 transition-all duration-300">
        <CardTitle className="text-sm sm:text-lg md:text-xl transition-all duration-300">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs sm:text-sm transition-all duration-300">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0 transition-all duration-300 overflow-hidden">
        <ChartContainer config={chartConfig} className={`${className} transition-all duration-300 ease-in-out w-full`}>
          {children}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
