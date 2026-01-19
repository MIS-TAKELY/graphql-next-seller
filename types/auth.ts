export interface AuthUser {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    phone?: string | null;
    phoneVerified?: boolean;
    otp?: string | null;
    otpExpiresAt?: Date | null;
    avatarImageUrl?: string | null;
    hasProfile?: boolean;
}

export interface AuthSession {
    user: AuthUser;
    session: {
        id: string;
        userId: string;
        expiresAt: Date;
        token: string;
        createdAt: Date;
        updatedAt: Date;
        ipAddress?: string | null;
        userAgent?: string | null;
    };
}

export interface GoogleProfile {
    id?: string;
    sub?: string;
    email: string;
    given_name?: string;
    family_name?: string;
    name?: string;
    picture?: string;
}

export interface FacebookProfile {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
}

export interface TikTokProfile {
    open_id?: string;
    id?: string;
    display_name?: string;
    avatar_url?: string;
}
