import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: "CounterFlow | Faster Powersports Parts Lookup",
    description: "A shared powersports parts and service counter board built to work beside dealership CRM, DMS, cashier, and repair-order software.",
    icons: {
      icon: "/assets/counterflow-logo.png",
      shortcut: "/assets/counterflow-logo.png",
    },
    openGraph: {
      title: "CounterFlow",
      description: "Faster parts lookup. Smoother counter flow.",
      type: "website",
      images: [{ url: "/og.png", width: 1536, height: 1024, alt: "CounterFlow parts and service counter software" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "CounterFlow",
      description: "Faster parts lookup. Smoother counter flow.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
