import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { APP_NAME, UNIVERSITY_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: `AI-powered digital twin of ${UNIVERSITY_NAME} — grounded academic support for every student.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lora.variable} min-h-screen antialiased`}>
        <QueryProvider>
          {children}
          <Toaster richColors position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
