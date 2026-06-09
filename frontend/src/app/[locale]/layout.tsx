import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Cairo, Geist } from "next/font/google";
import { routing } from "@/i18n/routing";
import "../globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      className={`${cairo.variable} ${geist.variable} h-full`}
    >
      <head>
        <meta name="theme-color" content="#c8a96e" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
