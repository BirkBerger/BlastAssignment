import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--header-font",
    subsets: ["latin"],
    weight: ['600', '700']
});

const geistMono = Geist_Mono({
    variable: "--paragraph-font",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "BLAST Developer Challenge",
    description: "CS:GO Game analysis by Thea Birk Berger.",
    // TODO: other good SEO stuff
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
