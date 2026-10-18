import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Кварта — свежая обжарка кофе в Минске",
  description:
    "Обжариваем кофе каждую неделю в маленькой мастерской в Минске. Свежие партии по 5 кг с доставкой через 1–3 дня после обжарки.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
