"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Star, ImagePlus } from "lucide-react";
import api from "@/lib/api";
import type { ListingImage } from "@/types";

interface Props {
  shortId: string;
  locale: string;
  onDone: () => void;
}

export default function ImageUploader({ shortId, locale, onDone }: Props) {
  const isAr = locale === "ar";
  const [images, setImages] = useState<ListingImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const valid = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    if (!valid.length) return;

    const slots = 10 - images.length;
    if (slots <= 0) {
      setError(isAr ? "الحد الأقصى 10 صور" : "Maximum 10 images reached");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      valid.slice(0, slots).forEach((f) => formData.append("files", f));
      const { data } = await api.post<ListingImage[]>(
        `/listings/${shortId}/images`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setImages((prev) => [...prev, ...data]);
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : (isAr ? "فشل الرفع" : "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/listings/${shortId}/images/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch {
      // silent — image may already be gone
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await api.patch(`/listings/${shortId}/images/${id}/primary`);
      setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === id })));
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all select-none ${
          dragOver
            ? "border-amber-400 bg-amber-50"
            : "border-gray-300 hover:border-amber-300 hover:bg-amber-50/50"
        }`}
      >
        <ImagePlus className="mx-auto text-gray-400 mb-3" size={40} />
        <p className="text-gray-700 font-medium text-sm">
          {isAr ? "اسحب الصور هنا أو اضغط للاختيار" : "Drag photos here or click to browse"}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {isAr
            ? "JPEG، PNG، WebP — حتى 5 MB لكل صورة، 10 صور كحد أقصى"
            : "JPEG, PNG, WebP — max 5 MB each, up to 10 photos"}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {uploading && (
        <p className="text-center text-sm text-amber-600 animate-pulse">
          {isAr ? "جاري الرفع..." : "Uploading..."}
        </p>
      )}

      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100">
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                unoptimized={img.url.startsWith("http://localhost")}
              />
              {img.is_primary && (
                <span className="absolute top-1 start-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {isAr ? "غلاف" : "Cover"}
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.is_primary && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetPrimary(img.id); }}
                    className="bg-white/90 text-amber-600 rounded-lg p-1.5 hover:bg-white transition-colors"
                    title={isAr ? "تعيين كغلاف" : "Set as cover"}
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                  className="bg-white/90 text-red-500 rounded-lg p-1.5 hover:bg-white transition-colors"
                  title={isAr ? "حذف" : "Delete"}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onDone}
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
      >
        {images.length > 0
          ? (isAr ? "تم — عرض لوحة التحكم" : "Done — Go to Dashboard")
          : (isAr ? "تخطي — أضف الصور لاحقاً" : "Skip — Add photos later")}
      </button>
    </div>
  );
}
