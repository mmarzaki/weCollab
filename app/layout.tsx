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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Neuton:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          html {
            overflow-y: overlay !important;
          }
          html::-webkit-scrollbar,
          body::-webkit-scrollbar {
            width: 8px !important;
            height: 8px !important;
          }
          html::-webkit-scrollbar-track,
          body::-webkit-scrollbar-track {
            background: rgba(255, 247, 238, 0.75) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            border-left: 1px solid rgba(26, 26, 26, 0.05) !important;
          }
          html::-webkit-scrollbar-thumb,
          body::-webkit-scrollbar-thumb {
            background: rgba(26, 26, 26, 0.25) !important;
            border: 2px solid transparent !important;
            border-radius: 4px !important;
            background-clip: padding-box !important;
          }
          html::-webkit-scrollbar-thumb:hover,
          body::-webkit-scrollbar-thumb:hover {
            background: rgba(26, 26, 26, 0.45) !important;
            background-clip: padding-box !important;
          }
        `}} />
      </head>
      <body>
        <div className="animated-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
