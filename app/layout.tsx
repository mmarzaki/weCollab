import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "weCollab — Platform Kolaborasi Mahasiswa",
  description:
    "Temukan rekan kolaborasi terbaik berdasarkan skill. Buat project, match kandidat, dan bangun sesuatu yang luar biasa bersama.",
  keywords: ["kolaborasi mahasiswa", "project kolaborasi", "skill matching", "wecollab"],
  authors: [{ name: "weCollab Team" }],
  openGraph: {
    title: "weCollab — Platform Kolaborasi Mahasiswa",
    description: "Temukan rekan kolaborasi berdasarkan skill dengan teknologi Redis",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="animated-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
