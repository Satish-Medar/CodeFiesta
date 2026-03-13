import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import "./globals.css";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from "@/components/footer";
import { Toaster } from "sonner";
import Script from "next/script";

export const metadata = {
  title: "Spott - Delightful Events Start Here",
  description: "Discover and create amazing events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider appearance={{ baseTheme: dark }}>
              <Header />

              <main className="min-h-screen container mx-auto pt-28 md:pt-24 pb-12 px-4 md:px-8">
                {children}
              </main>
              <Footer />
              <Toaster position="top-center" richColors />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
