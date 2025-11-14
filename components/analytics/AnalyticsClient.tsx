"use client";
import { useState } from "react";
import Header from "./Header";
import TabsContainer from "./TabsContainer";

type TimePeriod = "DAYS_7" | "DAYS_30" | "DAYS_90" | "YEAR_1";

type AnalyticsClientProps = {
  chartConfig: any;
};

export default function AnalyticsClient({ chartConfig }: AnalyticsClientProps) {
  const [period, setPeriod] = useState<TimePeriod>("DAYS_30");

  return (
    <>
      <Header period={period} onPeriodChange={setPeriod} />
      <TabsContainer period={period} chartConfig={chartConfig} />
    </>
  );
}
