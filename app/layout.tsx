import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReadAct",
  description: "Turn what you read into tracked, actionable steps.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="antialiased bg-page text-ink">
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar userEmail={user?.email ?? null} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
