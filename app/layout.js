import "./globals.css";

export const metadata = {
  title: "JARVIS",
  description: "Assistant vocal personnel",
  manifest: "/manifest.webmanifest",
  themeColor: "#090909"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
