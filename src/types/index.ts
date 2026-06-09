export type ListingType = "sale" | "rent";
export type PropertyType = "apartment" | "villa" | "home" | "land" | "farm" | "commercial";
export type ListingStatus = "draft" | "pending_review" | "active" | "sold" | "rented" | "off_market" | "rejected";
export type UserRole = "buyer" | "agent" | "agency_admin" | "platform_admin" | "superadmin";

export interface ListingImage {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Listing {
  id: string;
  short_id: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  listing_type: ListingType;
  property_type: PropertyType;
  status: ListingStatus;
  price: number;
  price_negotiable: boolean;
  governorate: string;
  area: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  area_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor_number?: number;
  furnished?: boolean;
  is_verified: boolean;
  is_featured: boolean;
  view_count: number;
  whatsapp_clicks: number;
  images: ListingImage[];
  agent: {
    id: string;
    full_name: string;
    full_name_ar?: string;
    avatar_url?: string;
    whatsapp_number?: string;
    is_trusted_agent: boolean;
  };
  created_at: string;
}

export interface User {
  id: string;
  phone?: string;
  email?: string;
  full_name: string;
  full_name_ar?: string;
  avatar_url?: string;
  role: UserRole;
  is_verified: boolean;
  is_phone_verified: boolean;
  whatsapp_number?: string;
  is_trusted_agent: boolean;
  verified_listings_count: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}
