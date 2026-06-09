"use client";

import { useLocale } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, MapPin } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ListingCard from "@/components/listings/ListingCard";
import Button from "@/components/ui/Button";
import { Listing, PaginatedResponse } from "@/types";
import api from "@/lib/api";

const PAGE_SIZE = 12;

const GOVERNORATES = [
  { key: "amman", ar: "عمّان", en: "Amman" },
  { key: "zarqa", ar: "الزرقاء", en: "Zarqa" },
  { key: "irbid", ar: "إربد", en: "Irbid" },
  { key: "aqaba", ar: "العقبة", en: "Aqaba" },
  { key: "madaba", ar: "مادبا", en: "Madaba" },
  { key: "karak", ar: "الكرك", en: "Karak" },
  { key: "mafraq", ar: "المفرق", en: "Mafraq" },
  { key: "balqa", ar: "البلقاء", en: "Balqa" },
  { key: "jerash", ar: "جرش", en: "Jerash" },
  { key: "ajloun", ar: "عجلون", en: "Ajloun" },
  { key: "tafilah", ar: "الطفيلة", en: "Tafilah" },
  { key: "maan", ar: "معان", en: "Maan" },
];

const PROPERTY_TYPES = [
  { key: "apartment", ar: "شقة", en: "Apartment" },
  { key: "villa", ar: "فيلا", en: "Villa" },
  { key: "home", ar: "منزل", en: "Home" },
  { key: "land", ar: "أرض", en: "Land" },
  { key: "farm", ar: "مزرعة", en: "Farm" },
  { key: "commercial", ar: "تجاري", en: "Commercial" },
];

export default function ListingsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get("q") ?? "",
    listing_type: searchParams.get("type") ?? "",
    property_type: searchParams.get("property") ?? "",
    governorate: searchParams.get("gov") ?? "",
    min_price: searchParams.get("min_price") ?? "",
    max_price: searchParams.get("max_price") ?? "",
    bedrooms: searchParams.get("bedrooms") ?? "",
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        size: PAGE_SIZE,
        status: "active",
      };
      if (filters.q) params.q = filters.q;
      if (filters.listing_type) params.listing_type = filters.listing_type;
      if (filters.property_type) params.property_type = filters.property_type;
      if (filters.governorate) params.governorate = filters.governorate;
      if (filters.min_price) params.min_price = Number(filters.min_price);
      if (filters.max_price) params.max_price = Number(filters.max_price);
      if (filters.bedrooms) params.bedrooms = Number(filters.bedrooms);

      const { data } = await api.get<PaginatedResponse<Listing>>("/listings", { params });
      setListings(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const clearFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
    setPage(1);
  };

  const activeFilters = Object.entries(filters).filter(([_, v]) => v !== "");

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAr ? "العقارات" : "Properties"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {loading ? "..." : `${total.toLocaleString()} ${isAr ? "نتيجة" : "results"}`}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} />
            {isAr ? "تصفية" : "Filters"}
            {activeFilters.length > 0 && (
              <span className="bg-amber-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </div>

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm"
              >
                {val}
                <button onClick={() => clearFilter(key as keyof typeof filters)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              className="text-sm text-gray-400 hover:text-gray-600 underline"
              onClick={() => { setFilters({ q: "", listing_type: "", property_type: "", governorate: "", min_price: "", max_price: "", bedrooms: "" }); setPage(1); }}
            >
              {isAr ? "مسح الكل" : "Clear all"}
            </button>
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Listing type */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                {isAr ? "نوع الإعلان" : "Listing Type"}
              </label>
              <div className="flex gap-2">
                {[{ key: "", ar: "الكل", en: "All" }, { key: "sale", ar: "بيع", en: "Sale" }, { key: "rent", ar: "إيجار", en: "Rent" }].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => { setFilters((p) => ({ ...p, listing_type: t.key })); setPage(1); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      filters.listing_type === t.key
                        ? "bg-amber-600 text-white border-amber-600"
                        : "border-gray-200 text-gray-500 hover:border-amber-300"
                    }`}
                  >
                    {isAr ? t.ar : t.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Property type */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                {isAr ? "نوع العقار" : "Property Type"}
              </label>
              <select
                value={filters.property_type}
                onChange={(e) => { setFilters((p) => ({ ...p, property_type: e.target.value })); setPage(1); }}
                className="w-full py-2 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              >
                <option value="">{isAr ? "الكل" : "All"}</option>
                {PROPERTY_TYPES.map((p) => (
                  <option key={p.key} value={p.key}>{isAr ? p.ar : p.en}</option>
                ))}
              </select>
            </div>

            {/* Governorate */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                {isAr ? "المحافظة" : "Governorate"}
              </label>
              <select
                value={filters.governorate}
                onChange={(e) => { setFilters((p) => ({ ...p, governorate: e.target.value })); setPage(1); }}
                className="w-full py-2 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              >
                <option value="">{isAr ? "الكل" : "All"}</option>
                {GOVERNORATES.map((g) => (
                  <option key={g.key} value={g.key}>{isAr ? g.ar : g.en}</option>
                ))}
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                {isAr ? "غرف النوم" : "Bedrooms"}
              </label>
              <div className="flex gap-1.5">
                {["", "1", "2", "3", "4"].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setFilters((p) => ({ ...p, bedrooms: n })); setPage(1); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      filters.bedrooms === n
                        ? "bg-amber-600 text-white border-amber-600"
                        : "border-gray-200 text-gray-500 hover:border-amber-300"
                    }`}
                  >
                    {n === "" ? (isAr ? "كل" : "Any") : n === "4" ? "4+" : n}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                {isAr ? "نطاق السعر (JOD)" : "Price Range (JOD)"}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={isAr ? "الحد الأدنى" : "Min"}
                  value={filters.min_price}
                  onChange={(e) => { setFilters((p) => ({ ...p, min_price: e.target.value })); setPage(1); }}
                  className="flex-1 py-2 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
                <input
                  type="number"
                  placeholder={isAr ? "الحد الأقصى" : "Max"}
                  value={filters.max_price}
                  onChange={(e) => { setFilters((p) => ({ ...p, max_price: e.target.value })); setPage(1); }}
                  className="flex-1 py-2 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>
            </div>
          </div>
        )}

        {/* Listings grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {total > PAGE_SIZE && (
              <div className="flex justify-center gap-2 mt-10">
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  {isAr ? "السابق" : "Previous"}
                </Button>
                <span className="px-4 py-2 text-sm text-gray-500">
                  {isAr ? `صفحة ${page} من ${Math.ceil(total / PAGE_SIZE)}` : `Page ${page} of ${Math.ceil(total / PAGE_SIZE)}`}
                </span>
                <Button variant="secondary" size="sm" disabled={page * PAGE_SIZE >= total} onClick={() => setPage((p) => p + 1)}>
                  {isAr ? "التالي" : "Next"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <p className="text-6xl mb-4">🏠</p>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {isAr ? "لا توجد نتائج" : "No properties found"}
            </h3>
            <p className="text-sm">{isAr ? "جرب تعديل معايير البحث" : "Try adjusting your search filters"}</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
