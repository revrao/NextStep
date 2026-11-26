import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NextStep — Small steps. Meaningful progress.",
  description:
    "A fictional-data classroom prototype of feedback-informed developmental play. Educational demonstration only.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
