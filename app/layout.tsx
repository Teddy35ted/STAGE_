import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La-à-La - Dashboard Animateur Pro",
  description: "Dashboard pour les animateurs professionnels de La-à-La",
  icons: {
    icon: [
      { url: '/laala.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/laala.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/laala.ico', sizes: '48x48', type: 'image/x-icon' },
    ],
    shortcut: '/laala.ico',
    apple: '/laala.ico',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/laala.ico',
    },
  },
  manifest: '/manifest.json',
  themeColor: '#f01919',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/laala.ico" sizes="any" />
        <link rel="icon" href="/laala.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/laala.ico" />
        <link rel="apple-touch-icon" href="/laala.ico" />
        <meta name="msapplication-TileImage" content="/laala.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f01919" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
