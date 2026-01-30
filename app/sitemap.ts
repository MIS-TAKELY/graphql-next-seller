import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://seller.vanijay.com";

    // Static public routes
    const staticRoutes = [
        { route: "", priority: 1.0, changeFrequency: "daily" as const },
        { route: "/sign-in", priority: 0.8, changeFrequency: "monthly" as const },
        { route: "/sign-up", priority: 0.8, changeFrequency: "monthly" as const },
    ].map(({ route, priority, changeFrequency }) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));

    // Legal/policy pages - publicly accessible
    const legalRoutes = [
        "/legal/privacy-policy",
        "/legal/cookie-policy",
        "/legal/terms-conditions",
        "/legal/returns-policy",
        "/legal/shipping-policy",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.3,
    }));

    return [...staticRoutes, ...legalRoutes];
}
