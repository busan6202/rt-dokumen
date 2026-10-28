import React, { useState } from 'react'
import { ExternalLink, X, Heart } from 'lucide-react'

export default function TrakteerFloatingWidget({ trakteerUrl }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Default link fallback
  const targetUrl = trakteerUrl || 'https://trakteer.id/busan6202'

  if (isDismissed) return null

  const isCardVisible = isOpen || isHovered

  return (
    <div
      className="fixed bottom-20 left-4 z-40 no-print sm:bottom-6 sm:left-6 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* EXPANDED POPOVER CARD (Shown on hover or mobile tap) */}
      {isCardVisible && (
        <aside
          aria-label="Donasi Trakteer Pak RT"
          className="mb-2 w-[270px] sm:w-[290px] bg-[#111827]/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-amber-400/30 text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200 relative"
        >
          {/* Header bar */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-base shadow-sm">
                🍜
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/15 px-1.5 py-0.2 rounded border border-amber-400/25">
                    Trakteer
                  </span>
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
                </div>
                <h4 className="text-xs font-black text-white leading-tight mt-0.5">
                  Traktir Mie Ayam Pak RT
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
                setIsHovered(false)
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              title="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Requested Caption */}
          <p className="text-xs text-amber-200/90 italic bg-amber-400/10 border border-amber-400/20 rounded-xl p-2.5 leading-relaxed text-center font-medium my-2">
            &ldquo;Seikhlasnya saja... Terimakasih sudah membantu pak RT&rdquo;
          </p>

          {/* Action CTA Button */}
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all duration-200 transform active:scale-95 group"
          >
            <span className="text-sm group-hover:scale-110 transition-transform">🍜</span>
            <span>Dukung via Trakteer</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-950/80 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </aside>
      )}

      {/* COMPACT FLOATING MIE AYAM BUTTON (Small icon always visible) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] hover:from-[#334155] hover:to-[#1e293b] text-white shadow-xl hover:shadow-2xl border border-amber-400/40 backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 ${
          isCardVisible ? 'ring-2 ring-amber-400/50 scale-105' : ''
        }`}
        title="Traktir Mie Ayam Pak RT (Klik atau sentuh untuk melihat)"
      >
        <span className="text-2xl leading-none transition-transform group-hover:scale-125 duration-200">
          🍜
        </span>

        {/* Pulsing Heart Badge */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[8px] items-center justify-center text-white font-bold">
            ❤
          </span>
        </span>
      </button>
    </div>
  )
}
