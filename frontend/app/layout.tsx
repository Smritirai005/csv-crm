import "./globals.css";

export const metadata = {
  title: "GrowEasy CSV Importer",
  description: "AI-powered CRM lead importer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas font-body text-ink">{children}</body>
    </html>
  );
}
