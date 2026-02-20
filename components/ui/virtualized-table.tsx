"use client";

import { useRef, useMemo, useCallback, memo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

interface VirtualizedTableProps<T> {
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  rowCount?: number;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  containerClassName?: string;
  onEndReached?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

function VirtualizedTableComponent<T>({
  data,
  renderRow,
  rowCount,
  estimateSize = 60,
  overscan = 5,
  className,
  containerClassName,
  onEndReached,
  hasNextPage,
  isLoading,
  loadingComponent,
  emptyComponent,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rowCount || data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Handle end reached for infinite loading
  const handleScroll = useCallback(() => {
    if (!parentRef.current || !onEndReached || !hasNextPage || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    // Trigger when user is 200px from bottom
    if (scrollBottom < 200) {
      onEndReached();
    }
  }, [onEndReached, hasNextPage, isLoading]);

  const items = useMemo(() => virtualItems, [virtualItems]);

  if (!data.length && emptyComponent) {
    return <>{emptyComponent}</>;
  }

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", containerClassName)}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
        className={className}
      >
        {items.map((virtualRow) => (
          <div
            key={virtualRow.index}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {virtualRow.index < data.length && renderRow(data[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
      {isLoading && loadingComponent && (
        <div className="py-4">{loadingComponent}</div>
      )}
    </div>
  );
}

export const VirtualizedTable = memo(VirtualizedTableComponent) as <T>(
  props: VirtualizedTableProps<T>
) => React.ReactNode;

// Simple pagination virtualized table with infinite scroll support
interface PaginatedVirtualTableProps<T> {
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  pageSize?: number;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  containerClassName?: string;
  emptyComponent?: React.ReactNode;
  // Infinite scroll props
  onEndReached?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
}

function PaginatedVirtualTableComponent<T>({
  data,
  renderRow,
  pageSize = 50,
  estimateSize = 60,
  overscan = 3,
  className,
  containerClassName,
  emptyComponent,
  onEndReached,
  hasNextPage,
  isLoading,
  loadingComponent,
}: PaginatedVirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Handle end reached for infinite loading
  const handleScroll = useCallback(() => {
    if (!parentRef.current || !onEndReached || !hasNextPage || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    // Trigger when user is 200px from bottom
    if (scrollBottom < 200) {
      onEndReached();
    }
  }, [onEndReached, hasNextPage, isLoading]);

  const items = useMemo(() => virtualItems, [virtualItems]);

  if (!data.length && emptyComponent && !isLoading) {
    return <>{emptyComponent}</>;
  }

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", containerClassName)}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
        className={className}
      >
        {items.map((virtualRow) => (
          <div
            key={virtualRow.index}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {virtualRow.index < data.length && renderRow(data[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
      {isLoading && loadingComponent && (
        <div className="py-4">{loadingComponent}</div>
      )}
    </div>
  );
}

export const PaginatedVirtualTable = memo(PaginatedVirtualTableComponent) as <T>(
  props: PaginatedVirtualTableProps<T>
) => React.ReactNode;
