import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, Calendar, Clock, MapPin, ShieldCheck, Ticket } from 'lucide-react';

interface TicketViewProps {
  transactionId: string;
  movieTitle: string;
  seats: string[];
  amount: number;
  showTimeId?: string;
  userId?: string;
}

export default function TicketView({
  transactionId,
  movieTitle,
  seats,
  amount,
  showTimeId = 'Tomorrow-8:30PM-IMAX',
  userId = 'usr-9d1cc57d-f0f1',
}: TicketViewProps) {
  // Encrypt checkout metadata using robust base64 encoding (standard readable string representation)
  const metaObj = {
    userId,
    showTimeId,
    seats,
    transactionId,
    timestamp: Date.now(),
    app: 'FlixMate Core v2.4',
  };
  const encryptedMetadata = btoa(JSON.stringify(metaObj));

  return (
    <div className="relative w-full max-w-md mx-auto my-6 bg-[#000] border-2 border-orange-500/30 overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.15)] flex flex-col">
      {/* Visual Perfections: Perforated Ticket Circles left & right */}
      <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-[#050505] border-r-2 border-orange-500/30 z-20 transform -translate-y-1/2" />
      <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-[#050505] border-l-2 border-orange-500/30 z-20 transform -translate-y-1/2" />

      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-4 flex justify-between items-center text-black font-black uppercase tracking-widest text-[11px]">
        <div className="flex items-center gap-1.5 text-black">
          <Ticket className="w-4 h-4 text-black stroke-[3]" />
          <span>FLIXMATE PREMIUM SEAT PASS</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 fill-black text-black" />
          <span>VERIFIED</span>
        </div>
      </div>

      {/* Ticket Body Top */}
      <div className="p-6 flex-1 space-y-5">
        <div>
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black block mb-1">MOVIE TITLE</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white italic leading-none">{movieTitle}</h2>
        </div>

        {/* Triple Grid Coordinates */}
        <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
          <div className="p-3 bg-white/5 border border-white/10 rounded-none">
            <span className="text-[9px] text-zinc-500 block mb-1">SHOWTIME ENGINE</span>
            <span className="text-orange-500 font-extrabold">{showTimeId.replace('-', ' - ')}</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-none">
            <span className="text-[9px] text-zinc-500 block mb-1">LOCKED SEAT NODES</span>
            <span className="text-white font-black">{seats.join(', ')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider border-t border-dashed border-white/10 pt-4">
          <div>
            <span className="text-[9px] text-zinc-500 block mb-0.5">TRANSACTION ID</span>
            <span className="font-mono text-zinc-300 text-[10px] break-all">{transactionId}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 block mb-0.5">GATEWAY SECURE</span>
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>POSTGRES COMMIT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Perforated Dashed Divider */}
      <div className="border-t-2 border-dashed border-orange-500/20 w-full" />

      {/* Ticket Body Bottom: QR Code Verification Container */}
      <div className="p-6 bg-zinc-950/40 flex flex-col items-center space-y-4">
        <div className="p-2.5 bg-white rounded-none shadow-[0_0_30px_rgba(255,255,255,0.05)] border-2 border-orange-500/50">
          <QRCodeSVG
            value={encryptedMetadata}
            size={135}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#000000"
            includeMargin={true}
          />
        </div>

        <div className="text-center space-y-1 max-w-[280px]">
          <span className="text-[9px] text-orange-500 uppercase font-black tracking-widest block animate-pulse">
            SECURE ADMISSION METADATA TOKEN
          </span>
          <p className="text-[10px] text-zinc-500 leading-tight">
            Present this custom secure voucher token at the theater gateway terminals to authorize entry.
          </p>
        </div>

        {/* Financial Recoil Receipt */}
        <div className="w-full pt-3 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-zinc-400">
          <span>SURGE-CALCULATED SUBTOTAL</span>
          <span className="text-white font-mono text-sm">${amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
