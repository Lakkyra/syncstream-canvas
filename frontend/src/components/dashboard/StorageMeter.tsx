export function StorageMeter({ usedBytes, maxBytes }: { usedBytes: number; maxBytes: number }) {
  const percentage = Math.min((usedBytes / maxBytes) * 100, 100);
  const usedGb = (usedBytes / (1024 ** 3)).toFixed(1);
  const maxGb = (maxBytes / (1024 ** 3)).toFixed(1);

  return (
    <div className="glass-panel p-6 rounded-xl flex flex-col justify-center h-full">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="font-geist font-semibold text-lg">Storage</h3>
          <p className="font-inter text-xs text-on-surface-variant">Free Tier</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-sm text-primary">{usedGb} GB</span>
          <span className="font-mono text-xs text-on-surface-variant"> / {maxGb} GB</span>
        </div>
      </div>
      
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 shadow-[0_0_10px_rgba(173,198,255,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
