import React, { useState } from 'react'
import { ExternalLink, X, Heart, Sparkles, ChevronRight } from 'lucide-react'

export default function TrakteerFloatingWidget({ trakteerUrl }) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Default link fallback if not configured yet
  const targetUrl = trakteerUrl || 'https://trakteer.id/busan6202'

  if (isDismissed) return null

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 left-5 z-40 no-print animate-in fade-in slide-in-from-bottom-3 duration-200">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-2 px-3.5 py-2.5 bg-white/95 hover:bg-white text-slate-800 rounded-full shadow-lg hover:shadow-xl border border-rose-200/80 backdrop-blur-md transition-all duration-200 hover:scale-105"
          title="Buka Donasi Trakteer Pak RT"
        >
          <span className="text-lg leading-none transition-transform group-hover:rotate-12 duration-200">
            🍜
          </span>
          <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
            Traktir Pak RT
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
          </span>
        </button>
      </div>
    )
  }

  return (
    <aside
      aria-label="Donasi Trakteer Pak RT"
      className="fixed bottom-5 left-5 z-40 no-print max-w-[280px] sm:max-w-[300px] bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-rose-200/80 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      {/* Header bar */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {/* Mie Ayam Icon Badge */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 border border-rose-200/60 flex items-center justify-center shadow-inner text-lg">
            🍜
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                Trakteer
              </span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
            </div>
            <h4 className="text-xs font-black text-slate-800 leading-tight mt-0.5">
              Traktir Mie Ayam Pak RT
            </h4>
          </div>
        </div>

        {/* Minimize / Close */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Kecilkan notifikasi"
          >
            <span className="text-xs font-mono font-bold leading-none px-0.5">_</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Caption requested by User */}
      <p className="text-xs text-slate-600 italic bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 leading-relaxed text-center font-medium">
        &ldquo;Seikhlasnya saja... Terimakasih sudah membantu pak RT&rdquo;
      </p>

      {/* Action CTA Button */}
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center justify-center gap-2 w-full py-2.5 px-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:via-rose-700 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 transform active:scale-95 group"
      >
        <span className="text-sm group-hover:scale-110 transition-transform">🍜</span>
        <span>Dukung via Trakteer</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
      </a>
    </aside>
  )
}

