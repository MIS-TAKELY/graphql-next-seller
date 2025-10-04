"use client";

interface EmptyProductsStateProps {
  message?: string;
}

export function EmptyProductsState({
  message = "No products found matching your criteria.",
}: EmptyProductsStateProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
