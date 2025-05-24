import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paper2Exam - Convert Scientific Papers to IELTS/TOEIC Exams",
  description: "Transform academic papers into professional reading comprehension exams with AI-powered technology. Perfect for educators and test prep professionals.",
  icons: {
    icon: "/logo_sci.png",
    apple: "/logo_sci.png",
    shortcut: "/logo_sci.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo_sci.png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo_sci.png" />
        <link rel="shortcut icon" href="/logo_sci.png" type="image/png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
