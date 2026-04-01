"use client";

interface TopbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  onExport: () => void;
}

export default function Topbar({ search, onSearchChange, onExport }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-cream border-b border-border">
      <h1 className="font-serif text-2xl font-bold tracking-tight text-ink">
        IVY
      </h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search opportunities…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2 w-64 bg-cream2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <button
          onClick={onExport}
          className="px-4 py-2 text-sm font-medium bg-ink text-cream rounded-lg hover:opacity-90 transition-opacity"
        >
          Export CSV
        </button>
      </div>
    </header>
  );
}
