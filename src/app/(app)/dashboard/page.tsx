export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="font-geist text-headline-lg font-bold text-primary mb-8">Upload Dashboard</h1>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          {/* Storage Meter Placeholder */}
          <div className="glass-panel p-6 rounded-xl h-48 flex flex-col justify-center items-center text-on-surface-variant border-dashed border-2 border-primary/30 bloom-hover cursor-pointer">
            <span className="material-symbols-outlined text-4xl mb-2 text-primary">cloud_upload</span>
            <p className="font-mono text-sm">Drag & Drop Upload</p>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-9">
          {/* Media Grid Placeholder */}
          <div className="glass-panel p-6 rounded-xl min-h-[500px]">
            <h2 className="font-geist text-headline-md mb-6">Your Media</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="aspect-video bg-surface-container rounded-lg border border-white/10" />
              <div className="aspect-video bg-surface-container rounded-lg border border-white/10" />
              <div className="aspect-video bg-surface-container rounded-lg border border-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
