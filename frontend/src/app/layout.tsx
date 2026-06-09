import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "كابيتال هاوس | Capital House",
  description: "منصة العقارات الأولى في الأردن",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
