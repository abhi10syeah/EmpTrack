import type { Metadata } from 'next';
import './globals.css';
import { ClientToaster } from "@/components/ui/client-toaster";

export const metadata: Metadata = {
  title: 'EmpTrack Portal',
  description: 'Admin portal for managing employee records.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <ClientToaster />
      </body>
    </html>
  );
}
