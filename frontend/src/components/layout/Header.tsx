"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Globe, Home, Building2, Search, User } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function Header() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const otherLocale = locale === "ar" ? "en" : "ar";
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  const navLinks = [
    { href: `/${locale}`, ar: "الرئيسية", en: "Home", icon: <Home size={18} /> },
    { href: `/${locale}/listings`, ar: "العقارات", en: "Listings", icon: <Building2 size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CH</span>
          </div>
          <span className="font-bold text-lg text-gray-900 hidden sm:block">
            {locale === "ar" ? "كابيتال هاوس" : "Capital House"}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-amber-50 text-amber-700"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {link.icon}
              {locale === "ar" ? link.ar : link.en}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={otherPath}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Globe size={16} />
            <span>{otherLocale === "ar" ? "عربي" : "EN"}</span>
          </Link>

          {user ? (
            <Link href={`/${locale}/dashboard`}>
              <Button variant="ghost" size="sm">
                <User size={16} />
                {locale === "ar" && user.full_name_ar ? user.full_name_ar : user.full_name}
              </Button>
            </Link>
          ) : (
            <Button size="sm" onClick={() => router.push(`/${locale}/login`)}>
              {locale === "ar" ? "دخول" : "Login"}
            </Button>
          )}

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href ? "bg-amber-50 text-amber-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {link.icon}
              {locale === "ar" ? link.ar : link.en}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
