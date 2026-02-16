"use client"

import { useEffect, useCallback } from "react"

export function useHeartbeat(visitorId: string) {
  const sendHeartbeat = useCallback(async (isOnline: boolean) => {
    if (!visitorId) return
    
    try {
      const res = await fetch(`/api/activity?visitorId=${visitorId}`)
      const data = await res.json()
      
      if (data.activity) {
        await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            activity: {
              ...data.activity,
              lastHeartbeat: new Date().toISOString(),
              isOnline,
            },
          }),
        })
      }
    } catch {
      // Ignore errors
    }
  }, [visitorId])

  useEffect(() => {
    if (!visitorId) return

    // Send initial heartbeat
    sendHeartbeat(true)

    // Send heartbeat every 3 seconds (even when tab is hidden)
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat(true)
    }, 3000)

    // Handle before unload (user closing tab or navigating away completely)
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery on page unload
      const data = JSON.stringify({
        visitorId,
        setOffline: true,
      })
      navigator.sendBeacon("/api/activity", data)
    }

    // Handle page hide (more reliable for mobile and some browsers)
    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) return // Page is being cached, not closed
      const data = JSON.stringify({
        visitorId,
        setOffline: true,
      })
      navigator.sendBeacon("/api/activity", data)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("pagehide", handlePageHide)

    return () => {
      clearInterval(heartbeatInterval)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("pagehide", handlePageHide)
    }
  }, [visitorId, sendHeartbeat])
}
