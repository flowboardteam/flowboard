"use client";

import React, { useState } from "react";
import { X, ArrowRight, DollarSign, Building } from "lucide-react";

const OPTIONS = [
  { id: "avalanche", title: "Avalanche C-Chain Wallet", subtitle: "Receive USDC to your Avalanche C-Chain wallet.", type: "CRYPTO", eta: "25 MINUTES", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/avax.png" },
  { id: "base", title: "Base Wallet", subtitle: "Receive USDC to your Base wallet.", type: "CRYPTO", eta: "25 MINUTES", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/coinbase.svg" },
  { id: "ethereum", title: "Ethereum Wallet", subtitle: "Receive USDC to your Ethereum wallet.", type: "CRYPTO", eta: "25 MINUTES", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ethereum.png" },
  { id: "international", title: "International USD Bank Account", subtitle: "Withdraw and receive USD to your international bank account.", type: "FIAT", eta: "1-2 DAYS", logo: "usd" },
  { id: "optimism", title: "Optimism Wallet", subtitle: "Receive USDC to your Optimism wallet.", type: "CRYPTO", eta: "25 MINUTES", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/optimism.png" },
  { id: "polygon", title: "Polygon Wallet", subtitle: "Receive USDC to your Polygon wallet.", type: "CRYPTO", eta: "25 MINUTES", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/polygon.png" },
  { id: "swap", title: "Token Swap", subtitle: "Receive any token to your Arbitrum wallet.", type: "CRYPTO", eta: "INSTANT", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/uniswap.svg" },
  { id: "foreign-exchange", title: "Foreign Exchange Bank Account", subtitle: "Withdraw funds to your country's local currency.", type: "FIAT", eta: "1-2 DAYS", logo: "bank" },
  { id: "usdt", title: "USDT Wallet", subtitle: "Receive USDT to your crypto wallet.", type: "CRYPTO", eta: "INSTANT", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png" },
];

function ImageWithFallback({ src, alt, onError }: { src: string; alt: string; onError: () => void }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-8 w-8 object-contain"
      onError={onError}
    />
  );
}

export default function WithdrawAddOptions({ onClose, onSelect }: { onClose: () => void; onSelect: (id: string) => void; }) {
  const [visibleOptions, setVisibleOptions] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OPTIONS.map((opt) => [opt.id, true]))
  );

  const hideOption = (id: string) => {
    setVisibleOptions((prev) => ({ ...prev, [id]: false }));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-t-2xl md:rounded-2xl bg-white p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Add account</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {OPTIONS.filter((opt) => visibleOptions[opt.id]).map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className="w-full flex items-center justify-between gap-4 rounded-2xl border border-[#EEEEF0] p-4 text-left hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 overflow-hidden">
                  {opt.logo === "usd" ? (
                    <DollarSign className="h-6 w-6 text-slate-600" />
                  ) : opt.logo === "bank" ? (
                    <Building className="h-6 w-6 text-slate-600" />
                  ) : opt.logo ? (
                    <ImageWithFallback src={opt.logo} alt={opt.title} onError={() => hideOption(opt.id)} />
                  ) : (
                    <span className="text-slate-500 font-bold">{opt.id.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900">{opt.title}</p>
                    <span className="text-xs rounded-full border border-slate-200 px-2 py-0.5 text-slate-500">{opt.type}</span>
                    <span className="text-xs rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-amber-700">{opt.eta}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{opt.subtitle}</p>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
