import Link from "next/link";
import { TopNav } from "@/components/nav/TopNav";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <TopNav />
      
      {/* Background placeholder for WebGL Shader */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-[#1a1a2e] -z-10" />

      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="font-geist font-extrabold text-display-lg tracking-tight mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary bloom-hover inline-block">
            High Fidelity Collaboration.
          </span>
        </h1>
        <p className="font-inter text-body-lg text-on-surface-variant max-w-2xl mb-10">
          SyncStream delivers frame-accurate playback and zero-latency collaborative canvas capabilities designed for creative professionals and dev teams.
        </p>
        
        <div className="flex gap-4">
          <Link 
            href="/discovery" 
            className="px-8 py-4 bg-primary-container text-white font-geist font-semibold rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(77,142,255,0.4)]"
          >
            START SYNCING
          </Link>
          <Link 
            href="/theater/demo" 
            className="px-8 py-4 glass-panel text-white font-geist font-semibold rounded-full hover:bg-white/5 transition-colors"
          >
            WATCH DEMO
          </Link>
        </div>
      </main>
    </div>
  );
}
