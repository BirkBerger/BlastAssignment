import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
    title: "BLAST Developer Challenge",
    description: "CS:GO Game analysis by Thea Birk Berger.",
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
