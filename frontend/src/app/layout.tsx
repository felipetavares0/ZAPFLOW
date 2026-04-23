import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "ZapFlow",
  description: "Plataforma Premium de Disparos em Massa para WhatsApp na Meta Cloud API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-950 text-slate-300">
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              localStorage.setItem('zapflow_token', 'demo-token');
              localStorage.setItem('zapflow_user', JSON.stringify({ name: 'Admin', email: 'admin@zapflow.com', role: 'ADMIN' }));
            }
          `
        }} />
        {children}
      </body>
    </html>
  );
}
