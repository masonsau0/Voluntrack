import type React from "react"
import type { Metadata } from "next"
import { Cormorant_Garamond, Inter, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
})

export const metadata: Metadata = {
  title: "VolunTrack Ontario - Volunteer Management",
  description:
    "Quickly find volunteering opportunities that match your interests — make a difference in just a few clicks!",
  generator: "v0.app",
}

import { Providers } from "@/components/providers"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${cormorant.variable} ${spaceGrotesk.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <Suspense fallback={
            <div className="min-h-svh flex items-center justify-center bg-slate-50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
            </div>
          }>
            {children}
            <Analytics />
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
