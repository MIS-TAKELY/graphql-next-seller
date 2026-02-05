import Typesense from 'typesense';

export const typesenseClient = new Typesense.Client({
    nodes: [
        {
            host: process.env.TYPESENSE_HOST || '72.61.249.56',
            port: parseInt(process.env.TYPESENSE_PORT || '8108'),
            protocol: (process.env.TYPESENSE_PROTOCOL || 'http') as 'http' | 'https',
        },
    ],
    apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
    connectionTimeoutSeconds: 5,
});

export const PRODUCT_SCHEMA = {
    name: 'products',
    fields: [
        { name: 'id', type: 'string' as const },
        { name: 'name', type: 'string' as const },
        { name: 'slug', type: 'string' as const },
        { name: 'description', type: 'string' as const, optional: true },
        { name: 'brand', type: 'string' as const, facet: true },
        { name: 'categoryName', type: 'string' as const, facet: true },
        { name: 'categoryId', type: 'string' as const, facet: true },
        { name: 'price', type: 'float' as const, facet: true },
        { name: 'image', type: 'string' as const, optional: true },
        { name: 'status', type: 'string' as const, facet: true },
        { name: 'soldCount', type: 'int32' as const, optional: false },
        { name: 'averageRating', type: 'float' as const, optional: true },
        { name: 'createdAt', type: 'int64' as const, optional: true },
        { name: 'facet_attributes', type: 'string[]' as const, facet: true },
    ],
    default_sorting_field: 'soldCount',
};
