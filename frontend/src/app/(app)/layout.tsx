import { TopNav } from "@/components/nav/TopNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-16">
      <TopNav />
      <main className="h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
