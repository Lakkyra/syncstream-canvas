"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) {
    return (
      <div className="w-8 h-8 rounded-full border border-white/20 bg-surface-container overflow-hidden ml-2 animate-pulse" />
    );
  }

  const userImage = session.user?.image || "";
  const userName = session.user?.name || "User";

  return (
    <div className="relative ml-2" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full border border-white/20 bg-surface-container overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        {userImage ? (
          <img src={userImage} alt={userName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-medium text-white">{userName.charAt(0)}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-surface-container/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 border-b border-white/10 mb-2">
            <p className="text-sm font-medium text-on-surface truncate">{userName}</p>
            <p className="text-xs text-on-surface-variant truncate">{session.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
