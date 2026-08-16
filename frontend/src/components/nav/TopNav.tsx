import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { UserMenu } from "./UserMenu";

export function TopNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-50 glass-panel border-b border-white/10 px-6 flex items-center justify-between">
      <div className="flex items-center gap-10">
        <Link href="/" className="font-geist font-semibold text-xl tracking-tight text-primary">
          SyncStream
        </Link>
        <div className="flex gap-6">
          <NavLink href="/theater/demo">Theater</NavLink>
          <NavLink href="/canvas/demo">Canvas</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/discovery">Discovery</NavLink>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors bloom-hover">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors bloom-hover">
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
        <UserMenu />
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "font-mono text-xs font-medium uppercase tracking-wider text-on-surface-variant",
        "hover:text-primary transition-colors hover:border-b-2 hover:border-primary pb-1"
      )}
    >
      {children}
    </Link>
  );
}
