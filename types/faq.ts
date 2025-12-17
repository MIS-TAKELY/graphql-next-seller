export interface SellerAnswer {
    id: string;
    content: string;
    createdAt: Date;
    seller: {
        sellerProfile?: {
            shopName: string;
        } | null;
    };
}

export interface SellerQuestion {
    id: string;
    content: string;
    createdAt: Date;
    product: {
        name: string;
        images: string[];
    };
    user: {
        firstName: string | null;
        lastName: string | null;
    };
    answers: SellerAnswer[];
}
