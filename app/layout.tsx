import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
    title: "CS:GO Game Stats",
    description: "Explore a CS:GO match scoreboard, player cards and game chart. This site was created as a developer challenge for Blast, by Thea Birk Berger.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className="h-full antialiased"
        >
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
