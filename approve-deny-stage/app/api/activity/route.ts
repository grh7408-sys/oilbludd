import { NextRequest, NextResponse } from "next/server"
import { getActivity, setActivity, getAllActivities, clearActivity, type UserActivity } from "@/lib/activity-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const visitorId = searchParams.get("visitorId")
  const all = searchParams.get("all")

  if (all === "true") {
    const activities = getAllActivities()
    return NextResponse.json({ activities })
  }

  if (visitorId) {
    const activity = getActivity(visitorId)
    return NextResponse.json({ activity: activity || null })
  }

  return NextResponse.json({ error: "Missing visitorId" }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle sendBeacon offline signal
    if (body.setOffline && body.visitorId) {
      const existingActivity = getActivity(body.visitorId)
      if (existingActivity) {
        setActivity(body.visitorId, {
          ...existingActivity,
          isOnline: false,
          lastHeartbeat: new Date().toISOString(),
        })
      }
      return NextResponse.json({ success: true })
    }
    
    const { visitorId, activity } = body as { visitorId: string; activity: UserActivity }

    if (!visitorId || !activity) {
      return NextResponse.json({ error: "Missing visitorId or activity" }, { status: 400 })
    }

    setActivity(visitorId, activity)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId } = body as { visitorId: string }

    if (!visitorId) {
      return NextResponse.json({ error: "Missing visitorId" }, { status: 400 })
    }

    clearActivity(visitorId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
