"use client"

import { useState } from "react"
import { Check, X, Clock, User, Calendar, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type RequestStatus = "pending" | "approved" | "denied"

export interface LedgerRequest {
  id: string
  requester: string
  category: string
  description: string
  date: string
  status: RequestStatus
}

interface RequestCardProps {
  request: LedgerRequest
  onApprove: (id: string) => void
  onDeny: (id: string) => void
}

export function RequestCard({ request, onApprove, onDeny }: RequestCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    onApprove(request.id)
    setIsProcessing(false)
  }

  const handleDeny = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    onDeny(request.id)
    setIsProcessing(false)
  }

  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-warning/10 text-warning border-warning/20",
      icon: Clock,
    },
    approved: {
      label: "Approved",
      className: "bg-success/10 text-success border-success/20",
      icon: Check,
    },
    denied: {
      label: "Denied",
      className: "bg-destructive/10 text-destructive border-destructive/20",
      icon: X,
    },
  }

  const StatusIcon = statusConfig[request.status].icon

  return (
    <Card
      className={cn(
        "transition-all duration-200 border-border hover:border-muted-foreground/30",
        request.status === "approved" && "border-success/30 bg-success/5",
        request.status === "denied" && "border-destructive/30 bg-destructive/5"
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <h3 className="font-medium text-foreground text-sm sm:text-base leading-tight">{request.requester}</h3>
                <Badge variant="outline" className={cn("text-xs w-fit", statusConfig[request.status].className)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig[request.status].label}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{request.category}</p>
              <p className="text-xs text-muted-foreground mt-1 sm:hidden">{request.date}</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-muted-foreground">{request.date}</p>
            </div>

            {request.status === "pending" && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive bg-transparent text-xs sm:text-sm px-2 sm:px-3 transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
                  onClick={handleDeny}
                  disabled={isProcessing}
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="ml-1">Deny</span>
                </Button>
                <Button
                  size="sm"
                  className="bg-success text-success-foreground hover:bg-success/80 text-xs sm:text-sm px-2 sm:px-3 transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="ml-1">Approve</span>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-8 w-8 sm:h-9 sm:w-9 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="px-4 pb-4 pt-0 border-t border-border mt-0">
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-xs sm:text-sm text-foreground">{request.description}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-xs sm:text-sm text-foreground">{request.date}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
