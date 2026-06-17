import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-gradient min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <Header />
        <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
