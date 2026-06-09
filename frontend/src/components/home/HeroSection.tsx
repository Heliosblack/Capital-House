"use client";

import { useLocale } from "next-intl";
import SearchBar from "@/components/listings/SearchBar";

export default function HeroSection() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-amber-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }} />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20 text-center">
        {/* Headline */}
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          {isAr ? "منصة العقارات الأولى في الأردن" : "Jordan's #1 Real Estate Platform"}
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {isAr ? (
            <>
              ابحث عن عقارك المثالي<br />
              <span className="text-amber-400">في الأردن</span>
            </>
          ) : (
            <>
              Find Your Perfect Property<br />
              <span className="text-amber-400">in Jordan</span>
            </>
          )}
        </h1>

        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
          {isAr
            ? "آلاف العقارات الموثقة في جميع محافظات الأردن — شقق، فلل، أراضي، مزارع، تجاري"
            : "Thousands of verified properties across all Jordanian governorates — apartments, villas, land, farms, commercial"}
        </p>

        {/* Search bar */}
        <SearchBar />

        {/* Stats */}
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {[
            { num: isAr ? "+5,000" : "5,000+", label: isAr ? "عقار مدرج" : "Listed Properties" },
            { num: isAr ? "+500" : "500+", label: isAr ? "وكيل موثق" : "Verified Agents" },
            { num: "12", label: isAr ? "محافظة أردنية" : "Jordanian Governorates" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-amber-400">{stat.num}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
