"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Footer from "@/components/layout/Footer";
import ImageUploader from "@/components/listings/ImageUploader";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";

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

export default function NewListingPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const { user } = useAuthStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [createdShortId, setCreatedShortId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    listing_type: "sale",
    property_type: "apartment",
    price: "",
    price_negotiable: false,
    governorate: "amman",
    area: "",
    address: "",
    area_sqm: "",
    bedrooms: "",
    bathrooms: "",
    floor_number: "",
    furnished: false,
  });

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.area) {
      setError(isAr ? "يرجى تعبئة الحقول المطلوبة" : "Please fill required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        title_ar: form.title_ar || undefined,
        description: form.description || undefined,
        description_ar: form.description_ar || undefined,
        listing_type: form.listing_type,
        property_type: form.property_type,
        price: Number(form.price),
        price_negotiable: form.price_negotiable,
        governorate: form.governorate,
        area: form.area,
        address: form.address || undefined,
      };
      if (form.area_sqm) payload.area_sqm = Number(form.area_sqm);
      if (form.bedrooms) payload.bedrooms = Number(form.bedrooms);
      if (form.bathrooms) payload.bathrooms = Number(form.bathrooms);
      if (form.floor_number) payload.floor_number = Number(form.floor_number);
      if (!["land", "farm"].includes(form.property_type)) {
        payload.furnished = form.furnished;
      }

      const { data } = await api.post<{ short_id: string }>("/listings", payload);
      setCreatedShortId(data.short_id);
      setStep(2);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : (isAr ? "تعذر إنشاء الإعلان" : "Failed to create listing"));
    } finally {
      setLoading(false);
    }
  };

  const isRealEstate = !["land", "farm"].includes(form.property_type);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Back */}
        <button
          onClick={() => (step === 2 ? setStep(1) : router.back())}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 mb-6 text-sm transition-colors"
        >
          {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          {step === 2 ? (isAr ? "تعديل البيانات" : "Edit Details") : (isAr ? "رجوع" : "Back")}
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? "text-amber-600" : "text-green-600"}`}>
            {step > 1 ? <CheckCircle2 size={16} /> : (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">1</span>
            )}
            {isAr ? "بيانات العقار" : "Listing Details"}
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? "text-amber-600" : "text-gray-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 2 ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-500"}`}>2</span>
            {isAr ? "الصور" : "Photos"}
          </div>
        </div>

        {step === 1 ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              {isAr ? "إضافة عقار جديد" : "Add New Listing"}
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Listing type */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">{isAr ? "نوع الإعلان" : "Listing Type"}</h2>
                <div className="flex gap-3">
                  {[{ k: "sale", ar: "للبيع", en: "For Sale" }, { k: "rent", ar: "للإيجار", en: "For Rent" }].map((t) => (
                    <button
                      key={t.k}
                      onClick={() => set("listing_type", t.k)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        form.listing_type === t.k
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-200 text-gray-500 hover:border-amber-300"
                      }`}
                    >
                      {isAr ? t.ar : t.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property type */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">{isAr ? "نوع العقار" : "Property Type"}</h2>
                <div className="grid grid-cols-3 gap-2">
                  {PROPERTY_TYPES.map((pt) => (
                    <button
                      key={pt.key}
                      onClick={() => set("property_type", pt.key)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        form.property_type === pt.key
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-200 text-gray-500 hover:border-amber-300"
                      }`}
                    >
                      {isAr ? pt.ar : pt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title + description */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">{isAr ? "عنوان ووصف الإعلان" : "Title & Description"}</h2>
                <Input
                  label={isAr ? "العنوان بالإنجليزية *" : "Title (English) *"}
                  placeholder={isAr ? "مثال: Luxury Villa for Sale in Amman" : "e.g. Luxury Villa for Sale in Amman"}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  dir="ltr"
                />
                <Input
                  label={isAr ? "العنوان بالعربية" : "Title (Arabic)"}
                  placeholder="مثال: فيلا فاخرة للبيع في عمّان"
                  value={form.title_ar}
                  onChange={(e) => set("title_ar", e.target.value)}
                  dir="rtl"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isAr ? "الوصف بالإنجليزية" : "Description (English)"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isAr ? "وصف العقار..." : "Describe the property..."}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    dir="ltr"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isAr ? "الوصف بالعربية" : "Description (Arabic)"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="وصف العقار بالتفصيل..."
                    value={form.description_ar}
                    onChange={(e) => set("description_ar", e.target.value)}
                    dir="rtl"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">{isAr ? "السعر" : "Pricing"}</h2>
                <Input
                  label={isAr ? "السعر (دينار أردني) *" : "Price (JOD) *"}
                  type="number"
                  placeholder="150000"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  dir="ltr"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.price_negotiable}
                    onChange={(e) => set("price_negotiable", e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-600"
                  />
                  <span className="text-sm text-gray-600">
                    {isAr ? "قابل للتفاوض" : "Price is negotiable"}
                  </span>
                </label>
              </div>

              {/* Location */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">{isAr ? "الموقع" : "Location"}</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isAr ? "المحافظة *" : "Governorate *"}
                  </label>
                  <select
                    value={form.governorate}
                    onChange={(e) => set("governorate", e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors bg-white"
                  >
                    {GOVERNORATES.map((g) => (
                      <option key={g.key} value={g.key}>{isAr ? g.ar : g.en}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label={isAr ? "المنطقة / الحي *" : "Area / Neighborhood *"}
                  placeholder={isAr ? "مثال: الدوار السابع، الشميساني" : "e.g. Sweifieh, Abdoun"}
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                />
                <Input
                  label={isAr ? "العنوان التفصيلي" : "Detailed Address"}
                  placeholder={isAr ? "شارع، مبنى، مجمع..." : "Street, building, complex..."}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>

              {/* Specs */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">{isAr ? "مواصفات العقار" : "Property Specs"}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={isAr ? "المساحة (م²)" : "Area (m²)"}
                    type="number"
                    placeholder="120"
                    value={form.area_sqm}
                    onChange={(e) => set("area_sqm", e.target.value)}
                    dir="ltr"
                  />
                  {isRealEstate && (
                    <>
                      <Input
                        label={isAr ? "غرف النوم" : "Bedrooms"}
                        type="number"
                        placeholder="3"
                        value={form.bedrooms}
                        onChange={(e) => set("bedrooms", e.target.value)}
                        dir="ltr"
                      />
                      <Input
                        label={isAr ? "الحمامات" : "Bathrooms"}
                        type="number"
                        placeholder="2"
                        value={form.bathrooms}
                        onChange={(e) => set("bathrooms", e.target.value)}
                        dir="ltr"
                      />
                      <Input
                        label={isAr ? "رقم الطابق" : "Floor Number"}
                        type="number"
                        placeholder="2"
                        value={form.floor_number}
                        onChange={(e) => set("floor_number", e.target.value)}
                        dir="ltr"
                      />
                    </>
                  )}
                </div>
                {isRealEstate && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.furnished}
                      onChange={(e) => set("furnished", e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-600"
                    />
                    <span className="text-sm text-gray-600">
                      {isAr ? "مفروش" : "Furnished"}
                    </span>
                  </label>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button onClick={handleSubmit} loading={loading} size="lg" className="flex-1">
                  {isAr ? "التالي — إضافة الصور" : "Next — Add Photos"}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => router.back()}>
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle2 className="text-green-500 shrink-0" size={20} />
              <div>
                <p className="text-green-800 font-medium text-sm">
                  {isAr ? "تم إنشاء الإعلان بنجاح!" : "Listing created successfully!"}
                </p>
                <p className="text-green-600 text-xs mt-0.5">
                  {isAr
                    ? "في انتظار المراجعة. أضف صوراً الآن لجذب المزيد من المشترين."
                    : "Pending review. Add photos now to attract more buyers."}
                </p>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {isAr ? "أضف صور العقار" : "Add Property Photos"}
            </h1>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <ImageUploader
                shortId={createdShortId}
                locale={locale}
                onDone={() => router.push(`/${locale}/dashboard`)}
              />
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
