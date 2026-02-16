"use client"

import { CheckCircle2 } from "lucide-react"

export function UsbAnimation({ isConnecting, isConnected }: { isConnecting?: boolean; isConnected?: boolean }) {
  if (isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle2 className="w-16 h-16 text-success" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-success font-medium">Ledger device connected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        {/* USB Cable */}
        <svg
          width="120"
          height="180"
          viewBox="0 0 120 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isConnecting ? "animate-pulse" : ""}
        >
          {/* USB Connector Head */}
          <rect
            x="35"
            y="10"
            width="50"
            height="70"
            rx="4"
            className="fill-foreground/90 stroke-foreground"
            strokeWidth="2"
          />
          
          {/* USB Inner Metal Part */}
          <rect
            x="42"
            y="18"
            width="36"
            height="45"
            rx="2"
            className="fill-secondary stroke-muted-foreground"
            strokeWidth="1"
          />
          
          {/* USB Pins */}
          <rect x="48" y="25" width="6" height="12" rx="1" className="fill-muted-foreground" />
          <rect x="58" y="25" width="6" height="12" rx="1" className="fill-muted-foreground" />
          <rect x="68" y="25" width="6" height="12" rx="1" className="fill-muted-foreground" />
          
          {/* Cable */}
          <path
            d="M50 80 Q60 100 60 130 Q60 160 60 180"
            className="stroke-foreground/70"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M70 80 Q60 100 60 130 Q60 160 60 180"
            className="stroke-foreground/70"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Connecting Animation - Pulsing Ring */}
        {isConnecting && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 rounded-full border-4 border-foreground/30 animate-ping" />
          </div>
        )}

        
      </div>

      {/* Status Text */}
      <div className="mt-6 text-center">
        {isConnecting ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">Waiting for connection</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Insert your Ledger device</p>
        )}
      </div>
    </div>
  )
}
