"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import { Listing } from "@/types";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function FeaturedListings() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/listings", { params: { is_featured: true, status: "active", size: 6 } })
      .then((res) => setListings(res.data.items ?? []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isAr ? "عقارات مميزة" : "Featured Properties"}
          </h2>
          <p className="text-gray-500 mt-1">
            {isAr ? "أفضل العروض العقارية الموثقة" : "Top verified property listings"}
          </p>
        </div>
        <Link
          href={`/${locale}/listings`}
          className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors"
        >
          {isAr ? "عرض الكل" : "View all"}
          {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl aspect-[4/5] animate-pulse" />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🏠</p>
          <p>{isAr ? "لا توجد عقارات مميزة حالياً" : "No featured listings yet"}</p>
        </div>
      )}

      {/* Category shortcuts */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: "apartment", ar: "شقق", en: "Apartments", emoji: "🏢" },
          { key: "villa", ar: "فلل", en: "Villas", emoji: "🏡" },
          { key: "home", ar: "منازل", en: "Homes", emoji: "🏠" },
          { key: "land", ar: "أراضي", en: "Land", emoji: "🌍" },
          { key: "farm", ar: "مزارع", en: "Farms", emoji: "🌾" },
          { key: "commercial", ar: "تجاري", en: "Commercial", emoji: "🏪" },
        ].map((cat) => (
          <Link
            key={cat.key}
            href={`/${locale}/listings?property=${cat.key}`}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all text-center group"
          >
            <span className="text-3xl">{cat.emoji}</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors">
              {isAr ? cat.ar : cat.en}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
