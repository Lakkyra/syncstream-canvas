export interface MediaItem {
  id: string;
  filename: string;
  sizeBytes: number;
  status: "pending" | "processing" | "ready" | "error";
  createdAt: number;
}

export function MediaGrid({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-lg">
        <p className="text-on-surface-variant font-mono">No media found. Upload a video to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const sizeMb = (item.sizeBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="glass-panel rounded-xl overflow-hidden group cursor-pointer border border-white/10 hover:border-primary/50 transition-colors">
      <div className="aspect-video bg-surface-container relative flex items-center justify-center">
        {item.status === "processing" && (
          <div className="flex flex-col items-center gap-2 text-primary">
            <span className="material-symbols-outlined animate-spin">sync</span>
            <span className="font-label-caps text-[10px]">PROCESSING</span>
          </div>
        )}
        {item.status === "ready" && (
          <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors">
            play_circle
          </span>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
          <p className="font-mono text-xs text-tertiary truncate">{item.id}</p>
        </div>
      </div>
      
      <div className="p-4 border-t border-white/5">
        <h4 className="font-geist font-semibold truncate mb-1" title={item.filename}>{item.filename}</h4>
        <div className="flex justify-between items-center text-xs text-on-surface-variant font-mono">
          <span>{sizeMb} MB</span>
          <span className={`px-2 py-0.5 rounded-full ${
            item.status === 'ready' ? 'bg-primary/20 text-primary' : 
            item.status === 'processing' ? 'bg-secondary/20 text-secondary' : 
            'bg-surface-container'
          }`}>
            {item.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
