export default function DiscoveryPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full flex items-end p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center" />
        
        <div className="relative z-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-error-container text-error font-label-caps rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
            TRENDING NOW
          </div>
          <h1 className="font-geist text-display-lg font-bold text-white mb-4">Cyberpunk UI Review</h1>
          <p className="font-inter text-body-lg text-on-surface-variant mb-6">
            Join the design team as they go over the new component library in real-time.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-geist font-semibold rounded-full hover:scale-105 transition-transform">
              JOIN SESSION
            </button>
            <button className="px-6 py-3 glass-panel text-white font-geist font-semibold rounded-full hover:bg-white/5 transition-colors">
              DETAILS
            </button>
          </div>
        </div>
      </section>

      {/* Active Rooms Grid */}
      <section className="p-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-geist text-headline-md font-bold">Active Rooms</h2>
          <button className="font-mono text-sm text-primary hover:underline">VIEW ALL →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RoomCard category="FILM CLUB" title="Dune: Part Two Analysis" />
          <RoomCard category="DEV SYNC" title="API Architecture Planning" />
          <RoomCard category="AUDIO MIX" title="Soundtrack Mastering" />
        </div>
      </section>
    </div>
  );
}

function RoomCard({ category, title }: { category: string; title: string }) {
  return (
    <div className="glass-panel p-4 rounded-xl bloom-hover cursor-pointer group">
      <div className="aspect-video bg-surface-container rounded-lg mb-4 relative overflow-hidden">
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white font-label-caps rounded-md border border-white/10">
          {category}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-error/20 text-error font-label-caps rounded-md border border-error/30">
          <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
          42
        </div>
      </div>
      <h3 className="font-geist font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{title}</h3>
      <p className="font-inter text-sm text-on-surface-variant">Hosted by @alex_design</p>
    </div>
  );
}
