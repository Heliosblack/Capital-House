"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2, Eye, MessageCircle, TrendingUp, Plus, Pencil,
  Trash2, CheckCircle, Clock, XCircle, Star, BarChart3
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store";
import { Listing, PaginatedResponse } from "@/types";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";

export default function DashboardPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const { user } = useAuthStore();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [tab, setTab] = useState<"listings" | "leads" | "stats">("listings");

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    fetchMyListings();
  }, [user]);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Listing>>("/listings", {
        params: { agent_id: user?.id, size: 50 },
      });
      setListings(data.items ?? []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shortId: string) => {
    if (!confirm(isAr ? "هل تريد حذف هذا الإعلان؟" : "Delete this listing?")) return;
    setDeleting(shortId);
    try {
      await api.delete(`/listings/${shortId}`);
      setListings((prev) => prev.filter((l) => l.short_id !== shortId));
    } catch {
      alert(isAr ? "تعذر الحذف" : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const statusConfig: Record<string, { label_ar: string; label_en: string; badge: "green" | "gold" | "gray" | "red" | "blue" }> = {
    active: { label_ar: "نشط", label_en: "Active", badge: "green" },
    pending_review: { label_ar: "قيد المراجعة", label_en: "Pending Review", badge: "gold" },
    draft: { label_ar: "مسودة", label_en: "Draft", badge: "gray" },
    sold: { label_ar: "مباع", label_en: "Sold", badge: "blue" },
    rented: { label_ar: "مؤجر", label_en: "Rented", badge: "blue" },
    off_market: { label_ar: "خارج السوق", label_en: "Off Market", badge: "gray" },
    rejected: { label_ar: "مرفوض", label_en: "Rejected", badge: "red" },
  };

  const totalViews = listings.reduce((s, l) => s + l.view_count, 0);
  const totalWA = listings.reduce((s, l) => s + l.whatsapp_clicks, 0);
  const activeCount = listings.filter((l) => l.status === "active").length;

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAr ? "لوحة التحكم" : "Dashboard"}
            </h1>
            <p className="text-gray-500 mt-0.5">
              {isAr ? `أهلاً، ${user.full_name_ar ?? user.full_name}` : `Welcome, ${user.full_name}`}
            </p>
          </div>
          <Link href={`/${locale}/dashboard/listings/new`}>
            <Button size="md" className="gap-2">
              <Plus size={18} />
              {isAr ? "إضافة عقار" : "Add Listing"}
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Building2 size={22} />, value: listings.length, label_ar: "إجمالي الإعلانات", label_en: "Total Listings", color: "text-amber-600" },
            { icon: <CheckCircle size={22} />, value: activeCount, label_ar: "نشطة", label_en: "Active", color: "text-emerald-600" },
            { icon: <Eye size={22} />, value: totalViews, label_ar: "مشاهدة", label_en: "Total Views", color: "text-blue-600" },
            { icon: <MessageCircle size={22} />, value: totalWA, label_ar: "نقر واتساب", label_en: "WhatsApp Clicks", color: "text-green-600" },
          ].map((stat) => (
            <div key={stat.label_en} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className={`${stat.color} mb-3`}>{stat.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">{isAr ? stat.label_ar : stat.label_en}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-50 p-1 rounded-xl w-fit">
          {[
            { key: "listings", ar: "عقاراتي", en: "My Listings" },
            { key: "leads", ar: "العملاء", en: "Leads" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as "listings" | "leads")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {isAr ? t.ar : t.en}
            </button>
          ))}
        </div>

        {/* My Listings table */}
        {tab === "listings" && (
          <>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
                <p className="text-5xl mb-4">🏠</p>
                <h3 className="font-semibold text-gray-700 mb-2">
                  {isAr ? "لا توجد عقارات بعد" : "No listings yet"}
                </h3>
                <p className="text-gray-400 text-sm mb-5">
                  {isAr ? "أضف عقارك الأول الآن" : "Add your first property listing"}
                </p>
                <Link href={`/${locale}/dashboard/listings/new`}>
                  <Button size="sm">
                    <Plus size={16} />
                    {isAr ? "إضافة عقار" : "Add Listing"}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-start px-5 py-3.5 font-medium text-gray-500">
                          {isAr ? "العقار" : "Property"}
                        </th>
                        <th className="text-start px-5 py-3.5 font-medium text-gray-500 hidden sm:table-cell">
                          {isAr ? "السعر" : "Price"}
                        </th>
                        <th className="text-start px-5 py-3.5 font-medium text-gray-500 hidden md:table-cell">
                          {isAr ? "الحالة" : "Status"}
                        </th>
                        <th className="text-start px-5 py-3.5 font-medium text-gray-500 hidden lg:table-cell">
                          {isAr ? "مشاهدات" : "Views"}
                        </th>
                        <th className="text-end px-5 py-3.5 font-medium text-gray-500">
                          {isAr ? "إجراءات" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((listing) => {
                        const title = isAr && listing.title_ar ? listing.title_ar : listing.title;
                        const sc = statusConfig[listing.status] ?? { label_ar: listing.status, label_en: listing.status, badge: "gray" as const };
                        return (
                          <tr key={listing.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                  <Building2 size={18} className="text-amber-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 line-clamp-1">{title}</p>
                                  <p className="text-xs text-gray-400">{listing.governorate} • {listing.short_id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 hidden sm:table-cell">
                              <span className="font-semibold text-amber-700">{formatPrice(listing.price, locale)}</span>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <Badge variant={sc.badge}>{isAr ? sc.label_ar : sc.label_en}</Badge>
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <span className="flex items-center gap-1 text-gray-500">
                                <Eye size={14} />
                                {listing.view_count.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/${locale}/listings/${listing.short_id}`} target="_blank">
                                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                    <Eye size={16} />
                                  </button>
                                </Link>
                                <Link href={`/${locale}/dashboard/listings/${listing.short_id}/edit`}>
                                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                                    <Pencil size={16} />
                                  </button>
                                </Link>
                                <button
                                  onClick={() => handleDelete(listing.short_id)}
                                  disabled={deleting === listing.short_id}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Leads tab placeholder */}
        {tab === "leads" && (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
            <p className="text-5xl mb-4">📥</p>
            <h3 className="font-semibold text-gray-700 mb-2">
              {isAr ? "صندوق العملاء" : "Lead Inbox"}
            </h3>
            <p className="text-gray-400 text-sm">
              {isAr ? "ستظهر هنا استفسارات العملاء المهتمين بعقاراتك" : "Inquiries from interested buyers will appear here"}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
