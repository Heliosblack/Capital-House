"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, Home, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";

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

export default function SearchBar() {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === "ar";

  const [listingType, setListingType] = useState("sale");
  const [propertyType, setPropertyType] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (listingType) params.set("type", listingType);
    if (propertyType) params.set("property", propertyType);
    if (governorate) params.set("gov", governorate);
    router.push(`/${locale}/listings?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6 w-full max-w-4xl mx-auto">
      {/* Sale / Rent tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "sale", ar: "للبيع", en: "For Sale" },
          { key: "rent", ar: "للإيجار", en: "For Rent" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setListingType(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              listingType === t.key
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            {isAr ? t.ar : t.en}
          </button>
        ))}
      </div>

      {/* Search fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Text query */}
        <div className="md:col-span-2 relative">
          <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={isAr ? "ابحث عن عقار..." : "Search properties..."}
            className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Governorate */}
        <div className="relative">
          <MapPin size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors appearance-none bg-white"
          >
            <option value="">{isAr ? "المحافظة" : "Governorate"}</option>
            {GOVERNORATES.map((g) => (
              <option key={g.key} value={g.key}>{isAr ? g.ar : g.en}</option>
            ))}
          </select>
        </div>

        {/* Property type */}
        <div className="relative">
          <Home size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors appearance-none bg-white"
          >
            <option value="">{isAr ? "نوع العقار" : "Property Type"}</option>
            {PROPERTY_TYPES.map((p) => (
              <option key={p.key} value={p.key}>{isAr ? p.ar : p.en}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search button */}
      <div className="mt-3 flex justify-end">
        <Button onClick={handleSearch} size="lg" className="w-full md:w-auto gap-2">
          <Search size={18} />
          {isAr ? "بحث" : "Search"}
        </Button>
      </div>
    </div>
  );
}
