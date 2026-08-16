"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="glass-panel p-10 rounded-2xl w-full max-w-md relative z-10 text-center">
        <h1 className="font-geist font-bold text-headline-lg text-primary mb-2">SyncStream</h1>
        <p className="font-inter text-on-surface-variant mb-8">Sign in to access your media and collaborative canvas rooms.</p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">login</span>
            Continue with Google
          </button>
          
          <button 
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 bg-[#24292e] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#1b1f23] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">code</span>
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
