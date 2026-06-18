import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, ShieldCheck, Ticket, Zap } from 'lucide-react';

interface TicketViewProps {
  transactionId: string;
  movieTitle: string;
  seats: string[];
  amount: number;
  showTimeId?: string;
  userId?: string;
  /** Whether surge pricing was applied to this booking */
  isSurgeActive?: boolean;
}

export default function TicketView({
  transactionId,
  movieTitle,
  seats,
  amount,
  showTimeId = 'Tomorrow-8:30PM-IMAX',
  userId = 'usr-anonymous',
  isSurgeActive = false,
}: TicketViewProps) {
  /**
   * Build the QR code payload from booking metadata.
   * Uses Base64 encoding to pack the object into a scannable string
   * (mirrors what a real ticket validation gateway would decode).
   */
  const metaObj = {
    userId,
    showTimeId,
    seats,
    transactionId,
    timestamp: Date.now(),
    isSurge: isSurgeActive,
    app: 'FlixMate Core v1.0.0',
  };
  const qrPayload = btoa(JSON.stringify(metaObj));

  return (
    <div className="relative w-full max-w-md mx-auto my-6 bg-[#000] border-2 border-orange-500/30 overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.15)] flex flex-col">

      {/* Perforated ticket hole effects — left & right */}
      <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#050505] border-r-2 border-orange-500/30 z-20 transform -translate-y-1/2" />
      <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#050505] border-l-2 border-orange-500/30 z-20 transform -translate-y-1/2" />

      {/* ── Ticket Header ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-4 flex justify-between items-center text-black font-black uppercase tracking-widest text-[11px]">
        <div className="flex items-center gap-1.5 text-black">
          <Ticket className="w-4 h-4 text-black stroke-[3]" />
          <span>FlixMate Premium Seat Pass</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 fill-black text-black" />
          <span>Verified</span>
        </div>
      </div>

      {/* ── Ticket Body ───────────────────────────────────────────── */}
      <div className="p-6 flex-1 space-y-5">
        {/* Movie title */}
        <div>
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black block mb-1">
            Movie Title
          </span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white italic leading-none">
            {movieTitle}
          </h2>
        </div>

        {/* Showtime + Seats grid */}
        <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
          <div className="p-3 bg-white/5 border border-white/10 rounded-none">
            <span className="text-[9px] text-zinc-500 block mb-1">Showtime</span>
            <span className="text-orange-500 font-extrabold">
              {showTimeId.replace(/-/g, ' ')}
            </span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-none">
            <span className="text-[9px] text-zinc-500 block mb-1">Locked Seat Nodes</span>
            <span className="text-white font-black">{seats.join(', ')}</span>
          </div>
        </div>

        {/* Transaction + security row */}
        <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider border-t border-dashed border-white/10 pt-4">
          <div>
            <span className="text-[9px] text-zinc-500 block mb-0.5">Transaction ID</span>
            <span className="font-mono text-zinc-300 text-[10px] break-all">{transactionId}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 block mb-0.5">Gateway Secure</span>
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Postgres Commit</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dashed Separator ──────────────────────────────────────── */}
      <div className="border-t-2 border-dashed border-orange-500/20 w-full" />

      {/* ── QR Code Section ───────────────────────────────────────── */}
      <div className="p-6 bg-zinc-950/40 flex flex-col items-center space-y-4">
        <div className="p-2.5 bg-white rounded-none shadow-[0_0_30px_rgba(255,255,255,0.05)] border-2 border-orange-500/50">
          <QRCodeSVG
            value={qrPayload}
            size={135}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#000000"
            includeMargin={true}
          />
        </div>

        <div className="text-center space-y-1 max-w-[280px]">
          <span className="text-[9px] text-orange-500 uppercase font-black tracking-widest block animate-pulse">
            Secure Admission Token
          </span>
          <p className="text-[10px] text-zinc-500 leading-tight">
            Present this QR code at the theater gateway terminal to authorize entry.
          </p>
        </div>

        {/* Price row — label changes based on surge state */}
        <div className="w-full pt-3 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-zinc-400">
          <div className="flex items-center gap-1.5">
            {isSurgeActive && <Zap className="w-3 h-3 text-orange-400" />}
            <span>{isSurgeActive ? 'Surge Price Subtotal' : 'Standard Price Subtotal'}</span>
          </div>
          <span className="text-white font-mono text-sm">${amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
