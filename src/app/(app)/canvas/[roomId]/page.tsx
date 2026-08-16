import { use } from "react";

export default function CanvasPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);

  return (
    <div className="flex h-full w-full bg-background relative overflow-hidden">
      {/* Infinite Canvas Background (Dot Grid) */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}>
        {/* Canvas Content Area */}
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-on-surface-variant font-mono">Canvas Area (Room: {roomId})</span>
        </div>
      </div>

      {/* Floating Tools Sidebar */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 glass-panel rounded-2xl p-2 flex flex-col gap-2">
        <ToolButton icon="near_me" active={true} />
        <ToolButton icon="pan_tool" />
        <div className="w-full h-px bg-white/10 my-1" />
        <ToolButton icon="edit" />
        <ToolButton icon="match_case" />
        <ToolButton icon="image" />
        <ToolButton icon="sticky_note_2" />
        <div className="w-full h-px bg-white/10 my-1" />
        <ToolButton icon="category" />
      </div>

      {/* Bottom Session Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel rounded-full px-6 py-3 flex items-center gap-4 shadow-[0_0_30px_rgba(87,27,193,0.2)]">
        <button className="material-symbols-outlined hover:text-primary transition-colors">mic</button>
        <button className="material-symbols-outlined hover:text-primary transition-colors">videocam</button>
        <button className="material-symbols-outlined hover:text-primary transition-colors">present_to_all</button>
        <div className="w-px h-6 bg-white/20" />
        <button className="material-symbols-outlined text-error hover:text-error-container transition-colors">call_end</button>
      </div>
    </div>
  );
}

function ToolButton({ icon, active = false }: { icon: string; active?: boolean }) {
  return (
    <button className={`p-3 rounded-xl transition-all flex items-center justify-center ${
      active 
        ? 'bg-primary/20 text-white border border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
        : 'text-on-surface-variant hover:bg-white/10 hover:text-white'
    }`}>
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
