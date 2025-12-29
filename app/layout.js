import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Brand Empire - Premium Fashion Destination",
  description: "Discover the latest trends and timeless classics at Brand Empire. Your ultimate destination for premium men's and women's fashion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-w-[1200px] overflow-x-auto`}
      >
        {children}
      </body>
    </html>
  );
}
