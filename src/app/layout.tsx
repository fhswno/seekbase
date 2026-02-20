// NEXT
import type { Metadata } from "next";

// GLOBALS
import "./globals.css";

// Metadata
export const metadata: Metadata = {
  title: "Seekbase",
  description: "The open-source, local-only, AI-native knowledgebase.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Pixelify+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          html, body { background-color: #0D0F14; }
          html[data-theme="light"], html[data-theme="light"] body { background-color: #FFFFFF; }
        `,
          }}
        />
      </head>
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
