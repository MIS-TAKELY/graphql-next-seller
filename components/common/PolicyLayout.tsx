import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PolicyLayoutProps {
    title: string;
    children: React.ReactNode;
    lastUpdated?: string;
}

export const PolicyLayout = ({ title, children, lastUpdated }: PolicyLayoutProps) => {
    return (
        <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
            <Card>
                <CardHeader className="border-b">
                    <CardTitle className="text-2xl md:text-3xl font-bold">{title}</CardTitle>
                    {lastUpdated && (
                        <p className="text-muted-foreground text-sm italic">
                            Last Updated: {lastUpdated}
                        </p>
                    )}
                </CardHeader>
                <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">
                    {children}
                </CardContent>
            </Card>
        </div>
    );
};
