"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { MapPin, BedDouble, Bath, Maximize2, CheckCircle, Star } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Listing } from "@/types";
import { formatPrice, cn } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export default function ListingCard({ listing, className }: ListingCardProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const primaryImage = listing.images.find((i) => i.is_primary) ?? listing.images[0];
  const title = isAr && listing.title_ar ? listing.title_ar : listing.title;
  const governorate = listing.governorate;

  const propertyTypeLabels: Record<string, { ar: string; en: string }> = {
    apartment: { ar: "شقة", en: "Apartment" },
    villa: { ar: "فيلا", en: "Villa" },
    home: { ar: "منزل", en: "Home" },
    land: { ar: "أرض", en: "Land" },
    farm: { ar: "مزرعة", en: "Farm" },
    commercial: { ar: "تجاري", en: "Commercial" },
  };

  const governorateLabels: Record<string, string> = {
    amman: "عمّان", zarqa: "الزرقاء", irbid: "إربد", aqaba: "العقبة",
    madaba: "مادبا", karak: "الكرك", tafilah: "الطفيلة", maan: "معان",
    jerash: "جرش", ajloun: "عجلون", mafraq: "المفرق", balqa: "البلقاء",
  };

  const typeLabel = propertyTypeLabels[listing.property_type];
  const govLabel = isAr ? (governorateLabels[governorate] ?? governorate) : governorate;

  return (
    <Link
      href={`/${locale}/listings/${listing.short_id}`}
      className={cn(
        "group block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
        "hover:shadow-md hover:border-amber-200 transition-all duration-200",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
            <span className="text-5xl opacity-30">🏠</span>
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5">
          {listing.is_featured && (
            <Badge variant="gold" className="shadow-sm backdrop-blur-sm bg-amber-500/90 text-white border-amber-400">
              <Star size={10} fill="currentColor" />
              {isAr ? "مميز" : "Featured"}
            </Badge>
          )}
          {listing.is_verified && (
            <Badge variant="green" className="shadow-sm backdrop-blur-sm bg-emerald-500/90 text-white border-emerald-400">
              <CheckCircle size={10} />
              {isAr ? "موثق" : "Verified"}
            </Badge>
          )}
        </div>

        {/* Listing type */}
        <div className="absolute top-3 end-3">
          <Badge
            variant={listing.listing_type === "sale" ? "blue" : "gold"}
            className="shadow-sm backdrop-blur-sm bg-white/90"
          >
            {listing.listing_type === "sale" ? (isAr ? "بيع" : "Sale") : (isAr ? "إيجار" : "Rent")}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Property type */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <Badge variant="gray" className="text-xs">
            {isAr ? typeLabel?.ar : typeLabel?.en}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-amber-700 transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
          <MapPin size={14} className="shrink-0" />
          <span className="line-clamp-1">{govLabel}{listing.area ? ` • ${listing.area}` : ""}</span>
        </div>

        {/* Specs */}
        {(listing.bedrooms || listing.bathrooms || listing.area_sqm) && (
          <div className="flex items-center gap-3 text-gray-500 text-sm mb-3">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedDouble size={14} />
                {listing.bedrooms}
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath size={14} />
                {listing.bathrooms}
              </span>
            )}
            {listing.area_sqm != null && (
              <span className="flex items-center gap-1">
                <Maximize2 size={14} />
                {listing.area_sqm.toLocaleString(isAr ? "ar-JO" : "en-JO")} {isAr ? "م²" : "m²"}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-amber-700">
              {formatPrice(listing.price, locale)}
            </p>
            {listing.price_negotiable && (
              <p className="text-xs text-gray-400">{isAr ? "قابل للتفاوض" : "Negotiable"}</p>
            )}
          </div>
          {listing.listing_type === "rent" && (
            <span className="text-xs text-gray-400">{isAr ? "/ شهر" : "/ month"}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
