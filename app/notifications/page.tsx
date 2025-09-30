"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCheck, Bell, Calendar } from "lucide-react"
import Link from "next/link"

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  read: boolean
  actionUrl?: string
  createdAt: string
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 20

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session, page])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?limit=${limit}&offset=${page * limit}`)
      const data = await response.json()

      if (page === 0) {
        setNotifications(data.notifications)
      } else {
        setNotifications((prev) => [...prev, ...data.notifications])
      }

      setUnreadCount(data.unreadCount)
      setHasMore(data.notifications.length === limit)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead", notificationId }),
      })

      setNotifications(notifications.map((n) => (n._id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllAsRead" }),
      })

      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "donation":
        return "💊"
      case "volunteer":
        return "🤝"
      case "achievement":
        return "🏆"
      case "recall":
        return "⚠️"
      default:
        return "📢"
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Please sign in to view your notifications.</p>
            <Button asChild className="mt-4">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-[#1a472a]" />
          <h1 className="text-2xl font-bold text-[#1a472a]">Notifications</h1>
          {unreadCount > 0 && <Badge className="bg-red-500">{unreadCount} unread</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {loading && page === 0 ? (
        <div className="flex items-center justify-center py-8">Loading...</div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification._id} className={!notification.read ? "border-l-4 border-l-blue-500" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        {!notification.read && <Badge className="bg-blue-500">New</Badge>}
                      </div>
                    </div>
                    <p className="text-sm mt-1">{notification.message}</p>
                    <div className="flex justify-between items-center mt-4">
                      {notification.actionUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification._id)
                            }
                          }}
                        >
                          <Link href={notification.actionUrl}>View Details</Link>
                        </Button>
                      )}
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification._id)}>
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setPage((prev) => prev + 1)} disabled={loading}>
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
