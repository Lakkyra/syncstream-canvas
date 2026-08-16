import { use } from "react";

export default function TheaterPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="w-full max-w-[1200px] aspect-video bg-surface rounded-xl ring-1 ring-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center">
          <span className="text-on-surface-variant font-mono">Video Player Placeholder (Room: {roomId})</span>
          
          {/* Controls Bar Hover Area */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="w-full glass-panel rounded-lg p-4 flex items-center gap-4">
              <button className="material-symbols-outlined text-primary hover:text-white transition-colors">play_arrow</button>
              <div className="flex-1 h-1 bg-white/20 rounded-full relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1/3 bg-primary shadow-[0_0_10px_#3B82F6]" />
              </div>
              <span className="font-mono text-xs">12:04 / 45:00</span>
              <button className="material-symbols-outlined hover:text-primary transition-colors">fullscreen</button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Session Sidebar */}
      <div className="w-[320px] h-full glass-panel border-l border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-geist font-semibold">Live Session</h2>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-1">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_#4CD7F6]" />
              12 watching
            </div>
          </div>
          <button className="px-4 py-1.5 bg-gradient-to-r from-primary to-secondary rounded-full text-xs font-semibold text-white">
            INVITE
          </button>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 p-4 flex flex-col justify-end">
          <div className="flex flex-col gap-4">
            <div className="glass-panel p-3 rounded-lg rounded-tl-none">
              <span className="text-xs text-tertiary font-mono block mb-1">System</span>
              <span className="text-sm">Host paused the video.</span>
            </div>
            <div className="glass-panel p-3 rounded-lg rounded-tr-none self-end bg-primary/10">
              <span className="text-xs text-primary font-mono block mb-1 text-right">You</span>
              <span className="text-sm">Let's re-watch that transition.</span>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10 bg-[#020202]">
          <input 
            type="text" 
            placeholder="Send a message..." 
            className="w-full bg-transparent text-sm outline-none border-b border-white/20 focus:border-primary pb-2 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
