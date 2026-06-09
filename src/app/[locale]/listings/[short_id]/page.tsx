"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, BedDouble, Bath, Maximize2, CheckCircle, Star,
  Phone, MessageCircle, ChevronLeft, ChevronRight, Eye, Share2
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Listing } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import api from "@/lib/api";

export default function ListingDetailPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { short_id } = useParams<{ short_id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIdx, setImageIdx] = useState(0);

  useEffect(() => {
    api.get(`/listings/${short_id}`)
      .then((r) => setListing(r.data))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [short_id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-10">
          <div className="bg-gray-100 rounded-2xl aspect-video animate-pulse mb-6" />
          <div className="bg-gray-100 rounded-xl h-8 w-2/3 animate-pulse mb-3" />
          <div className="bg-gray-100 rounded-xl h-5 w-1/2 animate-pulse" />
        </main>
        <Footer />
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center py-24 text-center">
          <div>
            <p className="text-6xl mb-4">🏠</p>
            <h1 className="text-xl font-semibold text-gray-700 mb-2">
              {isAr ? "العقار غير موجود" : "Listing Not Found"}
            </h1>
            <Link href={`/${locale}/listings`} className="text-amber-600 hover:underline">
              {isAr ? "عودة للعقارات" : "Back to listings"}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images = listing.images.sort((a, b) => a.sort_order - b.sort_order);
  const title = isAr && listing.title_ar ? listing.title_ar : listing.title;
  const desc = isAr && listing.description_ar ? listing.description_ar : listing.description;

  const whatsappUrl = listing.agent.whatsapp_number
    ? `https://wa.me/${listing.agent.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(
        isAr
          ? `أهلاً، أريد الاستفسار عن العقار: ${title} (${short_id})`
          : `Hello, I'm interested in: ${title} (${short_id})`
      )}`
    : null;

  const govLabels: Record<string, string> = {
    amman: "عمّان", zarqa: "الزرقاء", irbid: "إربد", aqaba: "العقبة",
    madaba: "مادبا", karak: "الكرك", tafilah: "الطفيلة", maan: "معان",
    jerash: "جرش", ajloun: "عجلون", mafraq: "المفرق", balqa: "البلقاء",
  };

  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href={`/${locale}`} className="hover:text-amber-600 transition-colors">
            {isAr ? "الرئيسية" : "Home"}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/listings`} className="hover:text-amber-600 transition-colors">
            {isAr ? "العقارات" : "Listings"}
          </Link>
          <span>/</span>
          <span className="text-gray-600 line-clamp-1">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video">
              {images.length > 0 ? (
                <>
                  <Image
                    src={images[imageIdx].url}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    priority
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setImageIdx((i) => (i - 1 + images.length) % images.length)}
                        className="absolute start-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      >
                        {isAr ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                      </button>
                      <button
                        onClick={() => setImageIdx((i) => (i + 1) % images.length)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      >
                        {isAr ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                      </button>
                      <span className="absolute bottom-3 end-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {imageIdx + 1} / {images.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-7xl opacity-20">🏠</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setImageIdx(i)}
                    className={`relative w-20 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === imageIdx ? "border-amber-500" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}

            {/* Title + badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {listing.is_featured && (
                  <Badge variant="gold"><Star size={10} fill="currentColor" />{isAr ? "مميز" : "Featured"}</Badge>
                )}
                {listing.is_verified && (
                  <Badge variant="green"><CheckCircle size={10} />{isAr ? "موثق" : "Verified"}</Badge>
                )}
                <Badge variant={listing.listing_type === "sale" ? "blue" : "gold"}>
                  {listing.listing_type === "sale" ? (isAr ? "للبيع" : "For Sale") : (isAr ? "للإيجار" : "For Rent")}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin size={16} />
                <span>{isAr ? (govLabels[listing.governorate] ?? listing.governorate) : listing.governorate}{listing.area ? ` — ${listing.area}` : ""}</span>
              </div>
            </div>

            {/* Specs */}
            {(listing.bedrooms != null || listing.bathrooms != null || listing.area_sqm != null || listing.floor_number != null) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 rounded-2xl p-5">
                {listing.bedrooms != null && (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <BedDouble size={24} className="text-amber-600" />
                    <p className="text-xl font-bold text-gray-900">{listing.bedrooms}</p>
                    <p className="text-xs text-gray-500">{isAr ? "غرف نوم" : "Bedrooms"}</p>
                  </div>
                )}
                {listing.bathrooms != null && (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Bath size={24} className="text-amber-600" />
                    <p className="text-xl font-bold text-gray-900">{listing.bathrooms}</p>
                    <p className="text-xs text-gray-500">{isAr ? "حمامات" : "Bathrooms"}</p>
                  </div>
                )}
                {listing.area_sqm != null && (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Maximize2 size={24} className="text-amber-600" />
                    <p className="text-xl font-bold text-gray-900">{listing.area_sqm.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{isAr ? "م²" : "m²"}</p>
                  </div>
                )}
                {listing.floor_number != null && (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-2xl">🏢</p>
                    <p className="text-xl font-bold text-gray-900">{listing.floor_number}</p>
                    <p className="text-xs text-gray-500">{isAr ? "الطابق" : "Floor"}</p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {desc && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {isAr ? "الوصف" : "Description"}
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{desc}</p>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-400 border-t border-gray-100 pt-4">
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                {listing.view_count.toLocaleString()} {isAr ? "مشاهدة" : "views"}
              </span>
              <span>ID: {listing.short_id}</span>
              <span>{formatDate(listing.created_at, locale)}</span>
            </div>
          </div>

          {/* Right: Price + Contact */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-24">
              <p className="text-3xl font-bold text-amber-700 mb-1">
                {formatPrice(listing.price, locale)}
              </p>
              {listing.price_negotiable && (
                <p className="text-sm text-gray-400 mb-4">{isAr ? "قابل للتفاوض" : "Price negotiable"}</p>
              )}
              {listing.listing_type === "rent" && (
                <p className="text-sm text-gray-400 mb-4">{isAr ? "شهرياً" : "per month"}</p>
              )}

              <div className="space-y-3">
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full gap-2" size="lg">
                      <MessageCircle size={18} />
                      {isAr ? "تواصل عبر واتساب" : "Contact via WhatsApp"}
                    </Button>
                  </a>
                )}
                <Button variant="secondary" className="w-full" size="md">
                  <Phone size={16} />
                  {isAr ? "اتصال" : "Call Agent"}
                </Button>
              </div>

              {/* Agent info */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">{isAr ? "المعلن" : "Listed by"}</p>
                <div className="flex items-center gap-3">
                  {listing.agent.avatar_url ? (
                    <Image
                      src={listing.agent.avatar_url}
                      alt={listing.agent.full_name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                      {(isAr && listing.agent.full_name_ar ? listing.agent.full_name_ar : listing.agent.full_name).charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {isAr && listing.agent.full_name_ar ? listing.agent.full_name_ar : listing.agent.full_name}
                    </p>
                    {listing.agent.is_trusted_agent && (
                      <Badge variant="green" className="mt-0.5">
                        <CheckCircle size={9} />
                        {isAr ? "وكيل موثق" : "Trusted Agent"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
