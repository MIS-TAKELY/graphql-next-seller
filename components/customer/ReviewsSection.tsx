// components/customers/ReviewsSection.tsx (Client Component)
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboardStore } from "@/lib/store";
import { TabsContent } from "@radix-ui/react-tabs";
import { toast } from "sonner";

export default function ReviewsSection() {
  const { reviews } = useDashboardStore();
  const pendingReviews = reviews.filter((r: any) => r.status === "pending");

  const handleReviewAction = (reviewId: string, action: string) => {
    // Implement or use store
    toast.success(`Review ${action} successfully!`);
  };

  return (
    <TabsContent value="reviews" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Product Reviews</CardTitle>
          <CardDescription>
            Manage customer reviews and ratings for your products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingReviews.map((review: any) => (
              <div key={review.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  {/* Placeholder for review content; add stars, text, etc. as needed */}
                  <div>{/* ... existing review JSX ... */}</div>
                  <div className="flex items-center space-x-2">
                    {review.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleReviewAction(review.id, "published")
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleReviewAction(review.id, "rejected")
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {/* Other buttons */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
