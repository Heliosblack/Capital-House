import { useLocale } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const locale = useLocale();

  const links = [
    { href: `/${locale}`, ar: "الرئيسية", en: "Home" },
    { href: `/${locale}/listings`, ar: "العقارات", en: "Listings" },
    { href: `/${locale}/login`, ar: "تسجيل دخول", en: "Login" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">CH</span>
            </div>
            <span className="text-white font-bold">
              {locale === "ar" ? "كابيتال هاوس" : "Capital House"}
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            {locale === "ar"
              ? "منصة العقارات الأولى في الأردن — شقق، فلل، أراضي، مزارع"
              : "Jordan's premier real estate platform"}
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">
            {locale === "ar" ? "روابط سريعة" : "Quick Links"}
          </h3>
          <ul className="space-y-2 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-amber-400 transition-colors">
                  {locale === "ar" ? link.ar : link.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">
            {locale === "ar" ? "التواصل" : "Contact"}
          </h3>
          <p className="text-sm">{locale === "ar" ? "عمان، الأردن" : "Amman, Jordan"}</p>
          <p className="text-sm mt-1 text-amber-400">info@capitalhouse.jo</p>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-xs text-gray-600">
        © 2025 Capital House. {locale === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}
      </div>
    </footer>
  );
}
