export function formatPrice(amount: number, locale = "ar"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", {
    style: "currency",
    currency: "JOD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string, locale = "ar"): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-JO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const GOVERNORATES = [
  "amman","zarqa","irbid","aqaba","madaba","karak",
  "tafilah","maan","jerash","ajloun","mafraq","balqa",
] as const;
