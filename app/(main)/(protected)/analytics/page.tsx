import AnalyticsClient from "@/components/analytics/AnalyticsClient";
import { chartConfig } from "@/data/analytics";

import Container from "@/components/ui/container";

export default async function AnalyticsPage() {
  return (
    <Container className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 py-4 sm:py-6 transition-all duration-300 ease-in-out">
      <AnalyticsClient chartConfig={chartConfig} />
    </Container>
  );
}
