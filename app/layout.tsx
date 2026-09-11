import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Тетяна Коваленко — психологиня",
    template: "%s · Тетяна Коваленко",
  },
  description:
    "Бути не ОК — це ОК. Тривога, вигорання, стосунки, самооцінка. Консультації онлайн та очно.",
};

export const viewport: Viewport = {
  themeColor: "#F9F0E7",
  // кабінет відкривають з телефона, тож вимикаємо зум-стрибки на інпутах
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
