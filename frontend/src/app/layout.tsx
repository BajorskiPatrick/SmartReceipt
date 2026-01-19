import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'; // Ważne: to naprawia błąd hydracji
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
    variable: "--font-roboto-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SmartReceipt",
    description: "Dashboard built with MUI & Next.js",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pl">
            <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
                {/* Provider musi otaczać children, aby style MUI działały po stronie serwera */}
                <AppRouterCacheProvider>
                    {children}
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}